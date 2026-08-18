const { Queue } = require('bullmq');
const { getRedisConnection } = require('./redis.connection');

let notificationQueue = null;

function getNotificationQueue(config = {}) {
  if (notificationQueue) {
    return notificationQueue;
  }

  const connection = getRedisConnection(config);

  notificationQueue = new Queue('notifications', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  });

  return notificationQueue;
}

module.exports = { getNotificationQueue };
