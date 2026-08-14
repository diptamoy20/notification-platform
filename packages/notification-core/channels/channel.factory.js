const channelRegistry = require('./channel.registry');

/**
 * Channel Factory
 * Reads a user's boolean flags, looks up the matching entries in channel.registry,
 * and returns { adapter, config } pairs to invoke.
 *
 * @param {Object} user - The user record from the database
 * @returns {Array<{ channel: string, adapter: Object, config: Object }>}
 */
const getAdaptersForUser = (user) => {
  const adapters = [];

  for (const [channelKey, registryEntry] of Object.entries(channelRegistry)) {
    // Check if the user has this channel enabled (flag is true)
    if (user[channelKey] === true) {
      // In the future, config would be fetched from DB. 
      // For now, we mock an empty config object, or could pull from process.env based on registryEntry.requiredParams.
      // The current adapters just use process.env directly, so an empty config is fine to maintain current behavior.
      adapters.push({
        channel: channelKey,
        adapter: registryEntry.adapter,
        config: {}, 
      });
    }
  }

  return adapters;
};

module.exports = { getAdaptersForUser };
