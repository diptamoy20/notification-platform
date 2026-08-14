/**
 * Provider Interface (documentation contract).
 *
 * Every channel provider MUST implement:
 *
 *   send(user, message): Promise<{ success: boolean, error?: string }>
 *
 * Where:
 *   user    — { id, name, email, mobileNumber, ... }
 *   message — string
 *
 * Returns:
 *   { success: true }            on success
 *   { success: false, error }    on failure
 *
 * This file is for documentation only — JS has no interfaces.
 * For TypeScript projects, replace with an abstract class or interface.
 */

// eslint-disable-next-line no-unused-vars
class NotificationProvider {
  // eslint-disable-next-line no-unused-vars
  async send(user, message) {
    throw new Error('send() must be implemented by subclass');
  }
}

module.exports = NotificationProvider;
