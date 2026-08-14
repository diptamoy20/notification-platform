const NotificationProvider = require('./provider.interface');
const logger = require('../../../utils/logger');

/**
 * Email Provider (mocked)
 * Real integration: replace send() body with AWS SES / Nodemailer call.
 * No changes needed outside this file.
 */
class EmailProvider extends NotificationProvider {
  async send(user, message) {
    try {
      // ── MOCK ─────────────────────────────────────────────────────────────────
      if (Math.random() < 0.1) throw new Error('SMTP connection refused (simulated)');

      logger.info(`[EMAIL] → ${user.email} (${user.name}): "${message}"`);
      // ─────────────────────────────────────────────────────────────────────────
      return { success: true };
    } catch (err) {
      logger.error(`[EMAIL] Failed for user ${user.id}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new EmailProvider();
