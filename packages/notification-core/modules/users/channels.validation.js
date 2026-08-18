const { z } = require('zod');

/**
 * Schema for PATCH /api/v1/users/:id/channels
 * At least one channel key must be provided.
 * Each channel is a boolean — true = subscribed, false = unsubscribed.
 */
const updateChannelsSchema = z.object({
  sms:          z.boolean().optional(),
  emailChannel: z.boolean().optional(),
  whatsapp:     z.boolean().optional(),
  inapp:        z.boolean().optional(),
  push:         z.boolean().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one channel field must be provided.' }
);

/**
 * Schema for PUT /api/v1/users/:id/channels
 * All channels are required — a full replace of preferences.
 */
const replaceChannelsSchema = z.object({
  sms:          z.boolean(),
  emailChannel: z.boolean(),
  whatsapp:     z.boolean(),
  inapp:        z.boolean(),
  push:         z.boolean(),
});

module.exports = { updateChannelsSchema, replaceChannelsSchema };
