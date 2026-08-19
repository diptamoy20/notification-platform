const smsAdapter = require('./adapters/sms.adapter');
const emailAdapter = require('./adapters/email.adapter');
// const whatsappAdapter = require('./adapters/whatsapp.adapter');
const whatsappAdapter = require('./adapters/ultramsg.adapter'); // Temporarily using UltraMsg
const pushAdapter = require('./adapters/push.adapter');

/**
 * Channel Registry
 * Defines all available notification channels, their required parameters, and their adapter implementations.
 */
module.exports = {
  sms: {
    key: 'sms',
    label: 'SMS',
    requiredParams: ['accountSid', 'authToken', 'senderNumber'],
    adapter: smsAdapter,
  },
  emailChannel: {
    key: 'emailChannel',
    label: 'Email',
    requiredParams: ['apiKey', 'fromEmail'],
    adapter: emailAdapter,
  },
  whatsapp: {
    key: 'whatsapp',
    label: 'WhatsApp',
    requiredParams: ['accountSid', 'authToken', 'senderNumber'],
    adapter: whatsappAdapter,
  },
  push: {
    key: 'push',
    label: 'Push Notification (FCM)',
    requiredParams: ['firebaseServiceAccountPath'],
    adapter: pushAdapter,
  },
};
