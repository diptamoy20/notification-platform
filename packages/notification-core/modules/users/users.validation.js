const { z } = require('zod');

const getUsersQuerySchema = z.object({
  search: z.string().optional().default(''),
  page:   z.coerce.number().int().positive().optional().default(1),
  limit:  z.coerce.number().int().positive().max(100).optional().default(20),
});

module.exports = { getUsersQuerySchema };
