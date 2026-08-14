const NotificationProvider = require('./provider.interface');
const logger = require('../../../utils/logger');

/**
 * WhatsApp Provider (mocked)
 * Real integration: replace send() body with WhatsApp Business API / Twilio WhatsApp call.
 * No changes needed outside this file.
 */
class WhatsAppProvider extends NotificationProvider {
  async send(user, message) {
    try {
      // ── MOCK ─────────────────────────────────────────────────────────────────
      if (Math.random() < 0.1) throw new Error('WhatsApp API rate limit (simulated)');

      logger.info(`[WHATSAPP] → ${user.mobileNumber} (${user.name}): "${message}"`);
      // ─────────────────────────────────────────────────────────────────────────
      return { success: true };
    } catch (err) {
      logger.error(`[WHATSAPP] Failed for user ${user.id}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new WhatsAppProvider();
