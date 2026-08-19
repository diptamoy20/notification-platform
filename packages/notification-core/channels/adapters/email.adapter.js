
const NotificationProvider = require('./provider.interface');
const nodemailer = require('nodemailer');

let transporterInstance = null;

function getTransporter(config) {
  if (transporterInstance) return transporterInstance;

  transporterInstance = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: Number(config.SMTP_PORT),
    secure: false, // Brevo uses STARTTLS on 587, not implicit TLS
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

  // Verify connection configuration on startup (async, doesn't block load)
  transporterInstance.verify((error) => {
    if (error) {
      console.warn(`[Email Adapter] SMTP Connection Warning: ${error.message}`);
    } else {
      console.log('[Email Adapter] SMTP Connection verified successfully');
    }
  });

  return transporterInstance;
}

class EmailProvider extends NotificationProvider {
  /**
   * @param {Object} user
   * @param {string} message
   * @param {Object} config
   */
  async send(user, message, config = {}) {
    const logger = config.logger || console;
    
    if (!user.emailChannel) {
      return { success: false, error: 'User has Email notifications disabled' };
    }
    if (!user.email) {
      return { success: false, error: 'Missing email address' };
    }

    try {
      logger.info(`[Email] Sending custom HTML email to ${user.email} via Brevo SMTP...`);
      const transporter = getTransporter(config);
      await transporter.sendMail({
        from: config.EMAIL_FROM,
        to: user.email,
        subject: config?.subject || 'Notification',
        html: message, // Send as HTML for our custom templates
      });
      logger.info(`[Email] Successfully sent to ${user.email}`);
      return { success: true };
    } catch (error) {
      logger.error(`[Email] Failed to send: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailProvider();
