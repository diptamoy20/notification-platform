const { sendNotificationSchema } = require('./notifications.validation');
const channelRegistry = require('../../channels/channel.registry');
// logger is still used, but ideally it should be injected too if we want a pure plugin.
// For now we'll require it, or it can be passed in config. Let's just require it or pass it.
// The prompt says "must not assume Express-specific globals", logger is just a local util, but let's assume it's injected or we just console.log if none.
// We'll use a simple fallback if logger is not injected.

function createNotificationsRouter(dbAdapter, { success, badRequest, notFound, asyncHandler, validate, Router, logger = console }) {
  const router = Router();

  // ── Service Logic ────────────────────────────────────────────────────────
  
  const sendNotifications = async ({ userIds, message }) => {
    const users = await dbAdapter.getUsersByIds(userIds);

    if (!users.length) {
      const err = new Error('No users found for the given IDs');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const results = [];
    const logEntries = [];

    await Promise.all(
      users.map(async (user) => {
          const channelResults = [];
          for (const [channelKey, registryEntry] of Object.entries(channelRegistry)) {
            if (user[channelKey] === true) {
              // Active channel
              const result = await registryEntry.adapter.send(user, message, { logger });
              logEntries.push({
                userId:  user.id,
                channel: channelKey,
                message,
                status:  result.success ? 'sent' : 'failed',
                error:   result.error ?? null,
              });
              channelResults.push({ channel: channelKey, ...result });
            } else {
              // Skipped channel
              channelResults.push({
                channel: channelKey,
                status: 'skipped',
                reason: 'User has not opted in for this channel',
              });
            }
          }

          results.push({ userId: user.id, name: user.name, channels: channelResults });
        })
    );

    // Persist all log entries 
    if (logEntries.length) {
      await Promise.all(logEntries.map(log => dbAdapter.saveNotificationLog(log)));
    }

    const totalSent   = logEntries.filter((l) => l.status === 'sent').length;
    const totalFailed = logEntries.filter((l) => l.status === 'failed').length;

    logger.info(`Notification dispatch complete — sent: ${totalSent}, failed: ${totalFailed}, users: ${users.length}`);

    return { results, summary: { totalSent, totalFailed, usersProcessed: users.length } };
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

  // ── Routes ───────────────────────────────────────────────────────────────

  router.post('/send', validate(sendNotificationSchema), asyncHandler(handleSendNotification));
  
  // Only register logs if dbAdapter supports it
  if (typeof dbAdapter.getNotificationLogs === 'function') {
    router.get('/logs', asyncHandler(getLogs));
  }

  return router;
}

module.exports = { createNotificationsRouter };
