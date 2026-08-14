/**
 * Standardized API response helpers.
 * All responses follow: { success, data, message }
 */

const success = (res, data = null, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, message });

const created = (res, data = null, message = 'Created') =>
  success(res, data, message, 201);

const error = (res, message = 'Internal Server Error', statusCode = 500, data = null) =>
  res.status(statusCode).json({ success: false, data, message });

const notFound = (res, message = 'Resource not found') =>
  error(res, message, 404);

const badRequest = (res, message = 'Bad request', data = null) =>
  error(res, message, 400, data);

const unauthorized = (res, message = 'Unauthorized') =>
  error(res, message, 401);

module.exports = { success, created, error, notFound, badRequest, unauthorized };
