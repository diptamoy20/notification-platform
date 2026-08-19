// Load and validate env first — will exit if anything is missing
const env = require('./config/env');

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const logger   = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const { initNotificationModule } = require('../../packages/notification-core');
const createPostgresAdapter = require('../../packages/notification-core/adapters/postgres.adapter');
const { PrismaClient } = require('@prisma/client');
const { success, badRequest, notFound: notFoundResponse, error } = require('./utils/apiResponse');
const validate = require('./middleware/validate');
const asyncHandler = require('./middleware/asyncHandler');

const prisma = new PrismaClient();
const dbAdapter = createPostgresAdapter(prisma);

const app = express();

// ── Security & parsing ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logging ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.debug(`→ ${req.method} ${req.path}`);
  next();
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ success: true, data: { status: 'ok', uptime: process.uptime() } })
);

// ── API Routes (Plugin) ───────────────────────────────────────────────────────
const notificationRouter = initNotificationModule({
  dbAdapter,
  Router: express.Router,
  logger,
  asyncHandler,
  validate,
  apiResponse: { success, badRequest, notFound: notFoundResponse },
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  config: env
});

app.use('/api/v1', notificationRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => notFoundResponse(res, 'Route not found'));

// ── Centralized error handler ─────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = parseInt(env.PORT, 10) || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT} [${env.NODE_ENV}]`);
  logger.info(`   CORS allowed: ${env.FRONTEND_URL}`);
});

module.exports = app;
