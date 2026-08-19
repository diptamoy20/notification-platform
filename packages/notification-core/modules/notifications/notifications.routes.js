const { sendNotificationSchema } = require('./notifications.validation');
const channelRegistry = require('../../channels/channel.registry');

function createNotificationsRouter(dbAdapter, { success, badRequest, notFound, asyncHandler, validate, Router, logger = console, config = {} }) {
  const router = Router();

  // ── Service Logic ────────────────────────────────────────────────────────

  const { getNotificationQueue } = require('../../queue/notification.queue');
  const notificationQueue = getNotificationQueue({ redisHost: config.REDIS_HOST, redisPort: config.REDIS_PORT });

  const NotificationDispatcher = require('./NotificationDispatcher');
  const dispatcher = new NotificationDispatcher(dbAdapter, notificationQueue, logger);

  const sendNotifications = async (options) => {
    const { userIds } = options;
    const users = await dbAdapter.getUsersByIds(userIds);

    if (!users.length) {
      const err = new Error('No users found for the given IDs');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    let queuedCount = 0;

    /* OLD NOTIFICATION SETUP START */
    // for (const user of users) {
    //   for (const [channelKey, registryEntry] of Object.entries(channelRegistry)) {
    //     if (user[channelKey] === true) {
    //       // Enqueue a job for this specific user and channel
    //       await notificationQueue.add('send-notification', {
    //         user,
    //         message,
    //         channelKey,
    //       });
    //       queuedCount++;
    //     }
    //   }
    // }
    /* OLD NOTIFICATION SETUP END */

    /* NEW MASTER TEMPLATE INTEGRATION START */
    for (const user of users) {
      const userQueuedCount = await dispatcher.dispatch(user, options);
      queuedCount += userQueuedCount;
    }
    /* NEW MASTER TEMPLATE INTEGRATION END */

    logger.info(`Notification jobs queued successfully — total jobs: ${queuedCount}, users: ${users.length}`);

    // Since it's async, we just return the counts of what was queued.
    return { summary: { totalQueued: queuedCount, usersProcessed: users.length } };
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSendNotification = async (req, res) => {
    const data = await sendNotifications(req.body);
    return success(res, data, 'Notifications dispatched successfully');
  };

  const getLogs = async (req, res) => {
    // Assuming dbAdapter.getNotificationLogs is implemented, or we skip logs if not in dbAdapter?
    // Wait, the original had getLogs. Let's add it to dbAdapter if needed, or we omit if not in prompt.
    // The prompt only listed: getUsers, getUserById, saveNotificationLog.
    // I'll assume getLogs is still needed, so I'll call dbAdapter.getNotificationLogs.
    const logs = await dbAdapter.getNotificationLogs(req.query);
    return success(res, logs, 'Notification logs fetched successfully');
  };

  // ── Webhooks ─────────────────────────────────────────────────────────────

  const verifyWhatsAppWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === config.WHATSAPP_VERIFY_TOKEN) {
        logger.info('[WhatsApp] Webhook verified successfully');
        return res.status(200).send(challenge);
      } else {
        return res.status(403).send('Forbidden');
      }
    }
    return res.status(400).send('Bad Request');
  };

  const handleWhatsAppWebhookEvent = async (req, res) => {
    const body = req.body;
    
    if (body.object === 'whatsapp_business_account') {
      logger.info('[WhatsApp Webhook] Event received:', JSON.stringify(body, null, 2));
      
      // Here we could handle incoming messages, delivery statuses, etc.
      // For example, updating the notification status in the database based on message IDs.
      
      return res.status(200).send('EVENT_RECEIVED');
    }
    
    return res.status(404).send('Not Found');
  };

  // ── Routes ───────────────────────────────────────────────────────────────

  router.post('/send', validate(sendNotificationSchema), asyncHandler(handleSendNotification));

  router.get('/webhook/whatsapp', verifyWhatsAppWebhook);
  router.post('/webhook/whatsapp', asyncHandler(handleWhatsAppWebhookEvent));

  // Only register logs if dbAdapter supports it
  if (typeof dbAdapter.getNotificationLogs === 'function') {
    router.get('/logs', asyncHandler(getLogs));
  }

  return router;
}

module.exports = { createNotificationsRouter };
