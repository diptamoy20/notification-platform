const NotificationProvider = require('./provider.interface');
const logger = require('../../../utils/logger');

/**
 * SMS Provider (mocked)
 * Real integration: replace send() body with Twilio SMS API call.
 * No changes needed outside this file.
 */
class SmsProvider extends NotificationProvider {
  async send(user, message) {
    try {
      // ── MOCK ─────────────────────────────────────────────────────────────────
      // Simulate ~10% failure rate to demonstrate failure handling
      if (Math.random() < 0.1) throw new Error('SMS gateway timeout (simulated)');

      logger.info(`[SMS] → ${user.mobileNumber} (${user.name}): "${message}"`);
      // ─────────────────────────────────────────────────────────────────────────
      return { success: true };
    } catch (err) {
      logger.error(`[SMS] Failed for user ${user.id}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new SmsProvider();
