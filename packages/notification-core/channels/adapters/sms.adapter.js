const NotificationProvider = require('./provider.interface');

class SMSProvider extends NotificationProvider {
  /**
   * @param {Object} user
   * @param {string} message
   * @param {Object} config
   */
  async send(user, message, config = {}) {
    const logger = config.logger || console;

    if (!user.sms) {
      return { success: false, error: 'User has SMS disabled' };
    }
    if (!user.mobileNumber) {
      return { success: false, error: 'Missing mobile number' };
    }

    try {
      // Format number for Brevo: keep digits, prepend country code if missing, ensure '+'
      let formattedNumber = user.mobileNumber.replace(/\D/g, '');
      if (formattedNumber.length === 10) {
        formattedNumber = '91' + formattedNumber; // Default to India (+91) if 10 digits
      }
      formattedNumber = '+' + formattedNumber;

      logger.info(`[SMS] Sending SMS to ${formattedNumber} via Brevo...`);

      // const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
      //   method: 'POST',
      //   headers: {
      //     'api-key': process.env.BREVO_API_KEY,
      //     'Content-Type': 'application/json',
      //     'Accept': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     type: 'transactional',
      //     sender: (process.env.BREVO_SMS_SENDER || 'Notify').substring(0, 11),
      //     recipient: formattedNumber,
      //     content: message,
      //   })
      // });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      logger.info(`[SMS] Successfully sent to ${user.mobileNumber} (Message ID: ${responseData.messageId})`);
      return { success: true };
    } catch (error) {
      logger.error(`[SMS] Failed to send: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SMSProvider();
