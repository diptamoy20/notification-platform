const NotificationProvider = require('./provider.interface');

class UltraMsgProvider extends NotificationProvider {
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
      let formattedNumber = user.mobileNumber.replace(/\D/g, '');
      if (formattedNumber.length === 10) {
        formattedNumber = '91' + formattedNumber; 
      }
      formattedNumber = '+' + formattedNumber;

      logger.info(`[WhatsApp] Sending message to ${formattedNumber} via UltraMsg API...`);
      
      const instanceId = process.env.ULTRAMSG_INSTANCE_ID || 'instance188780';
      const token = process.env.ULTRAMSG_TOKEN || 'gcppdy2680sp9bs4';
      
      const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
      
      const data = new URLSearchParams();
      data.append("token", token);
      data.append("to", formattedNumber);
      data.append("body", message || "System Alert");
      data.append("priority", "10");

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: data.toString()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      logger.info(`[WhatsApp] Successfully sent to ${user.mobileNumber} via UltraMsg`);
      return { success: true };
    } catch (error) {
      logger.error(`[WhatsApp-UltraMsg] Failed to send: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new UltraMsgProvider();
