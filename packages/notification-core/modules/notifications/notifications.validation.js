const { z } = require('zod');

const sendNotificationSchema = z.object({
  userIds: z
    .array(z.number().int().positive())
    .min(1, 'At least one user must be selected'),
  message: z.string().min(1, 'Message cannot be empty').max(1000),
});

module.exports = { sendNotificationSchema };
