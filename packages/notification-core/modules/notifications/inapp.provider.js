const NotificationProvider = require('./provider.interface');
const logger = require('../../../utils/logger');

/**
 * In-App Provider (mocked)
 * Real integration: replace send() body with WebSocket push / Firebase Cloud Messaging / SSE.
 * No changes needed outside this file.
 */
class InAppProvider extends NotificationProvider {
  async send(user, message) {
    try {
      // ── MOCK ─────────────────────────────────────────────────────────────────
      if (Math.random() < 0.05) throw new Error('Push service unavailable (simulated)');

      logger.info(`[IN-APP] → userId:${user.id} (${user.name}): "${message}"`);
      // ─────────────────────────────────────────────────────────────────────────
      return { success: true };
    } catch (err) {
      logger.error(`[IN-APP] Failed for user ${user.id}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new InAppProvider();
