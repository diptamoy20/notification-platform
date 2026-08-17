
const NotificationProvider = require('./provider.interface');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Brevo uses STARTTLS on 587, not implicit TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.warn(`[Email Adapter] SMTP Connection Warning: ${error.message}`);
  } else {
    console.log('[Email Adapter] SMTP Connection verified successfully');
  }
});

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
      const templateId = process.env.BREVO_EMAIL_TEMPLATE_ID;
      
      if (templateId) {
        logger.info(`[Email] Sending email to ${user.email} via Brevo API (Template ID: ${templateId})...`);
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            to: [{ email: user.email, name: user.name || user.email }],
            templateId: parseInt(templateId, 10),
            params: {
              message: message
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
        }
        logger.info(`[Email] Successfully sent to ${user.email} using template`);
      } else {
        logger.info(`[Email] Sending email to ${user.email} via Brevo SMTP...`);
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: config?.subject || 'Notification',
          text: message,
        });
        logger.info(`[Email] Successfully sent to ${user.email}`);
      }
      return { success: true };
    } catch (error) {
      logger.error(`[Email] Failed to send: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailProvider();
