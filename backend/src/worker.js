const env = require('./config/env');
const logger = require('./utils/logger');
const { PrismaClient } = require('@prisma/client');
const createPostgresAdapter = require('../../packages/notification-core/adapters/postgres.adapter');
const { startNotificationWorker } = require('../../packages/notification-core');

const prisma = new PrismaClient();
const dbAdapter = createPostgresAdapter(prisma);

logger.info(`Starting BullMQ worker on ${env.REDIS_HOST}:${env.REDIS_PORT}...`);

const worker = startNotificationWorker({
  config: {
    redisHost: env.REDIS_HOST,
    redisPort: env.REDIS_PORT,
  },
  dbAdapter,
  logger,
});

logger.info(`[WORKER] Listening for notification jobs on queue "notifications"`);

// Handle graceful shutdown
const shutdown = async () => {
  logger.info('[WORKER] Shutting down gracefully...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
