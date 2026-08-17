const { z } = require('zod');

const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier (email or mobile) is required'),
});

module.exports = {
  loginSchema,
};
