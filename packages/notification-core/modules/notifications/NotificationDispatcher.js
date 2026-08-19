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
    let fallbackMessage = options.message;
    let fallbackSubject = 'Notification Message';
    let template = null;

    // Determine which templateKey to load:
    // • If caller supplied one, use it.
    // • If caller only supplied a raw message, auto-wrap it in GENERAL_NOTIFICATION.
    const templateKey = options.templateKey || (options.message ? 'GENERAL_NOTIFICATION' : null);
    // Variables: merge caller-supplied vars + auto-inject customerName from user record
    const templateVariables = {
      customerName: user.name || 'there',
      message: options.message || '',
      ...(options.templateVariables || {}),
    };

    if (templateKey) {
      try {
        template = await this.dbAdapter.getTemplateByKey(templateKey);
        if (template) {
          // Generic fallback body (used when no channel-specific body exists)
          fallbackMessage = this.compileTemplate(template.body, templateVariables, false);
          if (template.subject) {
            fallbackSubject = this.compileTemplate(template.subject, templateVariables, false);
          }
        } else {
          this.logger.warn(`Template with key '${templateKey}' not found — falling back to raw message.`);
        }
      } catch (err) {
        this.logger.error(`Error fetching template '${templateKey}': ${err.message}`);
      }
    }

    if (!fallbackMessage && !template) {
      this.logger.error(`Cannot dispatch to user ${user.id}: finalMessage is empty.`);
      return 0; // 0 jobs queued
    }

    let queuedCount = 0;

    // 2. Dispatch to each enabled channel
    for (const [channelKey, registryEntry] of Object.entries(channelRegistry)) {
      if (user[channelKey] === true) {
        try {
          let channelMessage = fallbackMessage;
          let channelSubject = fallbackSubject;

          if (template) {
            if (channelKey === 'emailChannel' && template.emailBody) {
              channelMessage = this.compileTemplate(template.emailBody, templateVariables, false);
            } else if (channelKey === 'sms' && template.smsBody) {
              channelMessage = this.compileTemplate(template.smsBody, templateVariables, false);
            } else if (channelKey === 'whatsapp' && template.whatsappBody) {
              channelMessage = this.compileTemplate(template.whatsappBody, templateVariables, false);
            } else if (channelKey === 'push' && template.pushBody) {
              channelMessage = this.compileTemplate(template.pushBody, templateVariables, false);
              if (template.pushTitle) {
                channelSubject = this.compileTemplate(template.pushTitle, templateVariables, false);
              }
            }
          }

          if (!channelMessage) continue;

          await this.notificationQueue.add('send-notification', {
            user,
            message: channelMessage,
            subject: channelSubject, // Passed for Email adapter and Push title
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
