const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV:     z.enum(['development', 'production', 'test']).default('development'),
  PORT:         z.string().default('5000'),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }).min(1),
  FRONTEND_URL: z.string({ required_error: 'FRONTEND_URL is required' }).url(),
  JWT_SECRET:   z.string({ required_error: 'JWT_SECRET is required' }).min(8),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REDIS_HOST:   z.string().default('localhost'),
  REDIS_PORT:   z.string().default('6379'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1);
}

module.exports = parsed.data;
