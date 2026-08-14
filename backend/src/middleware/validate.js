const { badRequest } = require('../utils/apiResponse');

/**
 * validate(schema) — Zod request validation middleware.
 * Validates req.body against the provided Zod schema.
 * On failure, returns 400 with field-level error details.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return badRequest(res, 'Validation failed', errors);
  }
  req.body = result.data; // use the coerced/transformed data
  next();
};

module.exports = validate;
