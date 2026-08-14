const { createUsersRouter } = require('./modules/users/users.routes');
const { createNotificationsRouter } = require('./modules/notifications/notifications.routes');

/**
 * Initializes the notification module as an Express Router.
 * 
 * @param {Object} config - Configuration options
 * @param {Object} config.dbAdapter - Required. The database adapter implementation (e.g. postgresAdapter)
 * @param {Function} config.Router - Required. Express Router constructor (e.g. require('express').Router)
 * @param {Object} config.logger - Optional. Custom logger. Defaults to console.
 * @param {Function} config.asyncHandler - Optional. Async error wrapper for routes.
 * @param {Function} config.validate - Optional. Validation middleware factory.
 * @param {Object} config.apiResponse - Optional. API response helpers (success, badRequest, notFound).
 * 
 * @returns {import('express').Router} Express router containing all notification and user routes.
 */
function initNotificationModule({
  dbAdapter,
  Router,
  logger = console,
  asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next),
  validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, message: 'Validation Error', data: result.error.issues });
    }
    req.body = result.data;
    next();
  },
  apiResponse = {
    success: (res, data = null, message = 'Success') => res.status(200).json({ success: true, data, message }),
    badRequest: (res, message = 'Bad request', data = null) => res.status(400).json({ success: false, message, data }),
    notFound: (res, message = 'Resource not found') => res.status(404).json({ success: false, message, data: null }),
  }
}) {
  if (!dbAdapter) {
    throw new Error('initNotificationModule: dbAdapter is required in configuration');
  }
  if (!Router) {
    throw new Error('initNotificationModule: Router is required in configuration');
  }

  const router = Router();
  
  // Create modular routers and inject dependencies
  const usersDeps = { ...apiResponse, asyncHandler, Router };
  const notificationsDeps = { ...apiResponse, asyncHandler, validate, Router, logger };
  
  const usersRoutes = createUsersRouter(dbAdapter, usersDeps);
  const notificationsRoutes = createNotificationsRouter(dbAdapter, notificationsDeps);

  router.use('/users', usersRoutes);
  router.use('/notifications', notificationsRoutes);

  return router;
}

module.exports = { initNotificationModule };
