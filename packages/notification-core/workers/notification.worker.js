const { Worker } = require('bullmq');
const { getRedisConnection } = require('../queue/redis.connection');
const channelRegistry = require('../channels/channel.registry');

function startNotificationWorker({ config, dbAdapter, logger = console }) {
  const connection = getRedisConnection(config);

  const worker = new Worker(
    'notifications',
    async (job) => {
      const { user, message, channelKey } = job.data;

      logger.info(`[WORKER] Job ${job.id} started - Channel: ${channelKey} for user ${user.id}`);

      const registryEntry = channelRegistry[channelKey];
      if (!registryEntry) {
        throw new Error(`Unsupported channel: ${channelKey}`);
      }

      // Send the notification using the existing adapter
      const result = await registryEntry.adapter.send(user, message, { logger, ...config });

      // If the adapter returned success: false, throw so BullMQ retries
      if (!result.success) {
        throw new Error(`Adapter failed: ${result.error}`);
      }

      // Save notification log on success
      await dbAdapter.saveNotificationLog({
        userId: user.id,
        channel: channelKey,
        message,
        status: 'sent',
        error: null,
      });

      logger.info(`[WORKER] Notification sent successfully via ${channelKey} to user ${user.id}`);
      return result;
    },
    {
      connection,
      concurrency: 5, // Process up to 5 jobs concurrently
    }
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    
    logger.error(`[WORKER] Job ${job.id} failed: ${err.message}`);
    
    // If it's the final failure (attempts exhausted), log it to the database
    if (job.attemptsMade >= job.opts.attempts) {
      logger.error(`[WORKER] Job ${job.id} exhausted all retries. Final failure.`);
      if (job.data && job.data.user) {
        await dbAdapter.saveNotificationLog({
          userId: job.data.user.id,
          channel: job.data.channelKey,
          message: job.data.message,
          status: 'failed',
          error: err.message,
        });
      }
    }
  });

  worker.on('error', (err) => {
    logger.error(`[WORKER] Redis connection error: ${err.message}`);
  });

  return worker;
}

module.exports = { startNotificationWorker };
