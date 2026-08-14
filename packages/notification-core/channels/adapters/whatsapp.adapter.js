const NotificationProvider = require('./provider.interface');

class WhatsAppProvider extends NotificationProvider {
  /**
   * @param {Object} user
   * @param {string} message
   * @param {Object} config
   */
  async send(user, message, config = {}) {
    const logger = config.logger || console;
    
    if (!user.whatsapp) {
      return { success: false, error: 'User has WhatsApp notifications disabled' };
    }
    if (!user.mobileNumber) {
      return { success: false, error: 'Missing mobile number for WhatsApp' };
    }

    try {
      // Format number for Meta: keep digits, prepend country code if missing (no '+' needed for 'to' field)
      let formattedNumber = user.mobileNumber.replace(/\D/g, '');
      if (formattedNumber.length === 10) {
        formattedNumber = '91' + formattedNumber; // Default to India (91) if 10 digits
      }

      logger.info(`[WhatsApp] Sending message to ${formattedNumber} via Meta API...`);
      
      const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedNumber,
          type: "text",
          text: {
            preview_url: false,
            body: message
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      logger.info(`[WhatsApp] Successfully sent to ${user.mobileNumber} (Message ID: ${responseData.messages[0].id})`);
      return { success: true };
    } catch (error) {
      logger.error(`[WhatsApp] Failed to send: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new WhatsAppProvider();
