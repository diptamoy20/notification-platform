const { z } = require('zod');

const sendNotificationSchema = z.object({
  userIds: z
    .array(z.number().int().positive())
    .min(1, 'At least one user must be selected'),
  message: z.string().max(1000).optional(),
  templateKey: z.string().optional(),
  templateVariables: z.record(z.any()).optional(),
}).refine(data => data.message || data.templateKey, {
  message: "Either 'message' or 'templateKey' must be provided",
  path: ['message']
});

module.exports = { sendNotificationSchema };
