const channelRegistry = require('../../channels/channel.registry');

class NotificationDispatcher {
  /**
   * @param {Object} dbAdapter
   * @param {Object} notificationQueue
   * @param {Object} logger
   */
  constructor(dbAdapter, notificationQueue, logger = console) {
    this.dbAdapter = dbAdapter;
    this.notificationQueue = notificationQueue;
    this.logger = logger;
  }

  /**
   * Compiles a string template replacing {{var}} placeholders.
   * Also adds a hardcoded logo to the top.
   * 
   * @param {string} templateStr 
   * @param {Object} variables 
   * @param {boolean} includeLogo
   * @returns {string}
   */
  compileTemplate(templateStr, variables = {}, includeLogo = false) {
    if (!templateStr) return '';

    let compiled = templateStr.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
      const key = p1.trim();
      return variables[key] !== undefined ? variables[key] : match;
    });

    if (includeLogo) {
      const logo = `\n[LOGO: ACME Corp]\n`;
      compiled = logo + compiled;
    }

    return compiled;
  }

  /**
   * Dispatches a notification to all enabled channels for a user.
   * Fallback error handling ensures one failed channel doesn't block others.
   * 
   * @param {Object} user 
   * @param {Object} options 
   * @param {string} [options.message]
   * @param {string} [options.templateKey]
   * @param {Object} [options.templateVariables]
   */
  async dispatch(user, options) {
    let finalMessage = options.message;
    let subject = 'New Notification';

    // 1. Fetch and compile template if provided
    if (options.templateKey) {
      try {
        const template = await this.dbAdapter.getTemplateByKey(options.templateKey);
        if (template) {
          finalMessage = this.compileTemplate(template.body, options.templateVariables || {}, true);
          if (template.subject) {
            subject = this.compileTemplate(template.subject, options.templateVariables || {}, false);
          }
        } else {
          this.logger.warn(`Template with key '${options.templateKey}' not found.`);
        }
      } catch (err) {
        this.logger.error(`Error fetching template '${options.templateKey}': ${err.message}`);
      }
    }

    if (!finalMessage) {
      this.logger.error(`Cannot dispatch to user ${user.id}: finalMessage is empty.`);
      return 0; // 0 jobs queued
    }

    let queuedCount = 0;

    // 2. Dispatch to each enabled channel
    for (const [channelKey, registryEntry] of Object.entries(channelRegistry)) {
      if (user[channelKey] === true) {
        try {
          await this.notificationQueue.add('send-notification', {
            user,
            message: finalMessage,
            subject, // Passed for Email adapter
            channelKey,
          });
          queuedCount++;
        } catch (error) {
          // Fallback error handling: log and proceed with other channels
          this.logger.error(`Failed to queue ${channelKey} for user ${user.id}: ${error.message}`);
        }
      }
    }

    return queuedCount;
  }
}

module.exports = NotificationDispatcher;
