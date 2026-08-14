const logger = require('../utils/logger');
const { error } = require('../utils/apiResponse');

/**
 * Centralized error handler middleware.
 * Must be registered LAST in Express (after all routes).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Prisma known request errors (e.g. unique constraint)
  if (err.code === 'P2002') {
    return error(res, `Duplicate value for field: ${err.meta?.target?.join(', ')}`, 409);
  }
  if (err.code === 'P2025') {
    return error(res, 'Record not found', 404);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';

  return error(res, message, statusCode);
};

module.exports = errorHandler;
