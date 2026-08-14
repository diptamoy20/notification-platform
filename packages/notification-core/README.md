# notification-core

A highly reusable, database-agnostic backend module for managing users and multi-channel notifications (SMS, Email, WhatsApp, In-App).

## Mounting the Plugin

To use this plugin, you must inject your application's specific `dbAdapter` implementation.

```javascript
const express = require('express');
const { initNotificationModule } = require('notification-core');

// Example using a PostgreSQL / Prisma adapter (provided in /adapters)
const createPostgresAdapter = require('notification-core/adapters/postgres.adapter');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

const notificationRouter = initNotificationModule({
  dbAdapter: createPostgresAdapter(prisma),
  // Optional: override the default logger, error handlers, or validation
  // logger: myCustomWinstonLogger
});

// Mount the plugin routes
app.use('/api/v1', notificationRouter);

app.listen(5000);
```

## The Database Adapter Interface

If you want to use a different database (e.g., MongoDB, MySQL, DynamoDB), you just need to write a custom adapter that satisfies this interface:

```typescript
interface DBAdapter {
  // Returns paginated users matching a search query
  getUsers(params: { search: string, page: number, limit: number }): Promise<{ users: User[], total: number, page: number, limit: number, totalPages: number }>;
  
  // Get a single user by ID
  getUserById(id: number): Promise<User>;
  
  // Get multiple users by ID
  getUsersByIds(ids: number[]): Promise<User[]>;
  
  // Update a user's active channel preferences
  updateUserChannels(id: number, data: Partial<ChannelPrefs>): Promise<User>;
  
  // Save a notification dispatch result log
  saveNotificationLog(logEntry: LogEntry): Promise<any>;
}
```

## Channel Registry

By default, the core module supports 4 channels via its registry (`channels/channel.registry.js`):
1. `sms` (requires `accountSid`, `authToken`, `senderNumber`)
2. `emailChannel` (requires `apiKey`, `fromEmail`)
3. `whatsapp` (requires `accountSid`, `authToken`, `senderNumber`)
4. `inapp` (no params required)

The underlying dispatch logic checks the user's enabled channels and dynamically calls the mapped adapter in the registry.
