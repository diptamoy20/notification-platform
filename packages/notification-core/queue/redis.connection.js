const Redis = require('ioredis');

// We expect REDIS_HOST and REDIS_PORT to be passed in the config to the module
let redisConnection = null;

function getRedisConnection(config = {}) {
  if (redisConnection) {
    return redisConnection;
  }

  const host = config.redisHost || 'localhost';
  const port = config.redisPort || 6379;

  redisConnection = new Redis({
    host,
    port,
    maxRetriesPerRequest: null, // Required by BullMQ
  });

  return redisConnection;
}

async function closeRedisConnection() {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
}

module.exports = { getRedisConnection, closeRedisConnection };
