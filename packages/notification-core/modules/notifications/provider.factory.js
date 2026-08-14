const smsProvider      = require('./sms.provider');
const emailProvider    = require('./email.provider');
const whatsappProvider = require('./whatsapp.provider');
const inappProvider    = require('./inapp.provider');

/**
 * CHANNEL_MAP — Maps a user boolean flag name to its provider instance.
 * Adding a new channel: add one entry here + a new provider file.
 */
const CHANNEL_MAP = {
  sms:          { provider: smsProvider,      channel: 'sms' },
  emailChannel: { provider: emailProvider,    channel: 'email' },
  whatsapp:     { provider: whatsappProvider, channel: 'whatsapp' },
  inapp:        { provider: inappProvider,    channel: 'inapp' },
};

/**
 * getProvidersForUser(user)
 * Returns an array of { channel, provider } objects for all channels
 * the user has opted into (flag === true).
 *
 * @param {Object} user — user record with boolean channel flags
 * @returns {{ channel: string, provider: NotificationProvider }[]}
 */
const getProvidersForUser = (user) =>
  Object.entries(CHANNEL_MAP)
    .filter(([flag]) => user[flag] === true)
    .map(([, { channel, provider }]) => ({ channel, provider }));

module.exports = { getProvidersForUser };
