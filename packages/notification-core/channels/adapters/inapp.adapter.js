const NotificationProvider = require('./provider.interface');

class InAppProvider extends NotificationProvider {
  /**
   * @param {Object} user
   * @param {string} message
   * @param {Object} config
   */
  async send(user, message, config = {}) {
    const logger = config.logger || console;
    
    if (!user.inapp) {
      return { success: false, error: 'User has In-App notifications disabled' };
    }

    try {
      logger.info(`[InApp] Sending notification to user ${user.id}...`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      logger.info(`[InApp] Successfully sent to user ${user.id}`);
      return { success: true };
    } catch (error) {
      logger.error(`[InApp] Failed to send: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new InAppProvider();
