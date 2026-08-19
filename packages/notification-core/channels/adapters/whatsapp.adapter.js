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
      
      const templateName = config.WHATSAPP_TEMPLATE_NAME || 'system_alert_';
      
      let payload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedNumber,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: (templateName === 'hello_world' || templateName === 'system_alert_') ? 'en_US' : 'en'
          }
        }
      };

      // If they are using a custom template with variables, pass the message as a parameter.
      // 'hello_world' is the only built-in template without body variables.
      if (templateName !== 'hello_world') {
        payload.template.components = [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: message || user.name || 'User'
              }
            ]
          }
        ];
      }

      const response = await fetch(`https://graph.facebook.com/v17.0/${config.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
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
