const NotificationProvider = require('./provider.interface');

let initialized = false;
let getMessaging = null;

/**
 * Initialize Firebase Admin SDK (singleton).
 * Called lazily on first send attempt.
 */
function initFirebase(logger) {
  if (initialized) return;

  try {
    const { initializeApp, cert } = require('firebase-admin/app');
    const { getMessaging: _getMessaging } = require('firebase-admin/messaging');
    const path = require('path');

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    if (!serviceAccountPath) {
      logger.warn('[Push] FIREBASE_SERVICE_ACCOUNT_PATH not set in .env — push notifications will fail.');
      initialized = true;
      return;
    }

    // Resolve relative paths from the backend root (process.cwd())
    const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
    const serviceAccount = require(resolvedPath);

    initializeApp({
      credential: cert(serviceAccount),
    });

    getMessaging = _getMessaging;
    initialized = true;
    logger.info('[Push] Firebase Admin SDK initialized successfully.');
  } catch (error) {
    logger.error(`[Push] Failed to initialize Firebase Admin SDK: ${error.message}`);
    initialized = true; // Prevent re-initialization attempts
  }
}

class PushProvider extends NotificationProvider {
  /**
   * @param {Object} user
   * @param {string} message
   * @param {Object} config
   */
  async send(user, message, config = {}) {
    const logger = config.logger || console;

    if (!user.inapp) {
      return { success: false, error: 'User has In-App (Push) notifications disabled' };
    }

    if (!user.fcmToken) {
      return { success: false, error: 'User has no FCM device token registered' };
    }

    // Lazy-initialize Firebase
    initFirebase(logger);

    if (!getMessaging) {
      return { success: false, error: 'Firebase Admin SDK not initialized — check FIREBASE_SERVICE_ACCOUNT_PATH' };
    }

    try {
      logger.info(`[Push] Sending push notification to user ${user.id}...`);

      const fcmMessage = {
        token: user.fcmToken,
        notification: {
          title: 'New Notification',
          body: message,
        },
        // Optional: Android-specific settings
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
      };

      const response = await getMessaging().send(fcmMessage);
      logger.info(`[Push] Successfully sent to user ${user.id} (FCM ID: ${response})`);
      return { success: true };
    } catch (error) {
      logger.error(`[Push] Failed to send: ${error.message}`);

      // If the token is invalid/expired, surface a clear error
      if (error.code === 'messaging/registration-token-not-registered' ||
          error.code === 'messaging/invalid-registration-token') {
        return { success: false, error: `Invalid FCM token for user ${user.id}: ${error.message}` };
      }

      return { success: false, error: error.message };
    }
  }
}

module.exports = new PushProvider();
