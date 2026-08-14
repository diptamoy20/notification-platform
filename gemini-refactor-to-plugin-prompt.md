# Prompt for Gemini — Refactor Existing Project into Plugin-Ready, Adapter/DI Architecture

Copy everything below into Gemini, pointed at your existing repo (backend + frontend).

---

## TASK

You are refactoring an **existing, already-working** full-stack project (React web frontend + Node.js/Express backend + PostgreSQL). The current functionality must NOT change for the end user — same UI, same API responses, same DB schema. The goal is purely architectural: convert the `users` and `notifications` features on both frontend and backend into **self-contained, dependency-injected modules ("plugins")** that could be dropped into a completely different project later and mounted with only a small adapter file — no rewriting of internals required.

Do not implement any channel-credential-management UI or encryption — that is explicitly out of scope and deferred to later.

Before changing anything, scan the existing repo structure (both `server/` and `web/` or equivalent) and produce a short migration plan/checklist. Then execute the refactor incrementally, verifying the app still runs and behaves identically after each major step.

---

## PART 1 — Backend: convert to a mountable plugin

**Current problem to fix:** `modules/users` and `modules/notifications` are currently wired directly into one app's DB connection and one app's Express instance. That has to change so they can be reused elsewhere.

1. Create `packages/notification-core/` (or `plugins/notification-core/` — match existing repo conventions) containing the `users` and `notifications` module code, moved out of `server/src/modules/`.

2. Expose a single entry point, e.g. `packages/notification-core/index.js`:
   ```js
   function initNotificationModule(config) {
     // config = { dbAdapter, channelAdapters, authMiddleware? }
     // returns an Express Router
   }
   module.exports = { initNotificationModule };
   ```

3. Define a **`dbAdapter` interface** (document it with JSDoc, or TypeScript types if the project uses TS) with the methods the module actually needs, e.g.:
   ```
   dbAdapter.getUsers({ search, limit, offset })
   dbAdapter.getUserById(id)
   dbAdapter.saveNotificationLog(logEntry)
   ```
   The current Postgres/Sequelize/Prisma implementation becomes the **default adapter**, exported separately (e.g. `packages/notification-core/adapters/postgres.adapter.js`), but the module itself must never import the DB driver directly — only call through `dbAdapter`.

4. Introduce a **channel registry** — a single file that acts as the controller/manifest for every channel: its key, its required parameters, and a reference to its adapter module. This is the one place in the whole codebase where "what channels exist and what each one needs" is listed. Example shape (plain JS, no TypeScript):
   ```js
   // packages/notification-core/channels/channel.registry.js
   const smsAdapter = require('./adapters/sms.adapter');
   const emailAdapter = require('./adapters/email.adapter');
   const whatsappAdapter = require('./adapters/whatsapp.adapter');
   const inappAdapter = require('./adapters/inapp.adapter');

   module.exports = {
     sms: {
       key: 'sms',
       label: 'SMS',
       requiredParams: ['accountSid', 'authToken', 'senderNumber'],
       adapter: smsAdapter,
     },
     email_channel: {
       key: 'email_channel',
       label: 'Email',
       requiredParams: ['apiKey', 'fromEmail'],
       adapter: emailAdapter,
     },
     whatsapp: {
       key: 'whatsapp',
       label: 'WhatsApp',
       requiredParams: ['accountSid', 'authToken', 'senderNumber'],
       adapter: whatsappAdapter,
     },
     inapp: {
       key: 'inapp',
       label: 'In-App',
       requiredParams: [],
       adapter: inappAdapter,
     },
   };
   ```
   Keep the existing channel adapters exactly as-is functionally (`sms.adapter.js`, `email.adapter.js`, `whatsapp.adapter.js`, `inapp.adapter.js`, each implementing `send(user, message, config)`), just move/rename them to sit under `channels/adapters/` and register them here. Do not change the `send(user, message, config)` contract.

5. `channel.factory.js` becomes a thin consumer of the registry: it reads a user's boolean flags, looks up the matching entries in `channel.registry.js`, and returns `{ adapter, config }` pairs to invoke. The factory itself must contain no channel-specific logic or hardcoded params — only the lookup. For now (channel-credential-management is deferred), `config` for each channel can come from `.env` values keyed by channel name; when the future channel-config DB table is added, only this one lookup point changes to pull `config` from DB instead of `.env` — nothing else in the codebase should need to change.

6. `notification.service.js` orchestration logic: for each selected user, call `channelFactory.getAdaptersForUser(user)`, run `Promise.allSettled` across the returned `{ adapter, config }` pairs' `adapter.send(user, message, config)` calls, and pass results to the repository for logging. The service must be written so it would work unchanged even if the number of channels grew from 4 to 10.

7. In the **current project's own** `server/src/app.js`, become the first consumer of the new plugin:
   ```js
   const { initNotificationModule } = require('notification-core');
   const postgresAdapter = require('notification-core/adapters/postgres.adapter');

   const notificationRouter = initNotificationModule({
     dbAdapter: postgresAdapter(pgPool),
     // channelAdapters: omit to use defaults (channel.registry.js supplies them)
   });

   app.use('/api/v1', notificationRouter);
   ```
   This proves the plugin still works standalone while being fully swappable.

8. Add a `packages/notification-core/README.md` explaining: what config shape a host app must supply, what the router exposes, how the channel registry works, and a minimal example of mounting it in a brand-new Express app with a different DB and/or different channel adapters.

---

## PART 2 — Frontend: convert to an injectable component

**Current problem to fix:** `features/users` and `features/notifications` currently call `axios`/the API client directly inside hooks. That has to be abstracted so a different host app (different backend, different auth) can reuse the same UI.

1. Create `packages/notification-widget/` (match existing repo conventions) containing:
   - `components/` — the existing `Table`, `SearchBar`, `Checkbox`, `TextArea`, `Button` primitives, unchanged (they're already adapter-agnostic — just relocate/export them cleanly).
   - `NotificationPanel.jsx` — the composed feature (table + search + selection + textarea + send button), taking a single required prop: `adapter`.

2. Define the **frontend adapter interface** (document via JSDoc/TS types):
   ```js
   // adapter shape expected by <NotificationPanel adapter={adapter} />
   {
     getUsers: ({ search }) => Promise<{ id, name, mobile_number, email }[]>,
     sendNotification: ({ userIds, message }) => Promise<{ success, results }>,
   }
   ```
   `NotificationPanel` and its internal hooks must call **only** `adapter.getUsers()` / `adapter.sendNotification()` — never `axios`, `fetch`, or any concrete API client directly.

3. Provide a default implementation, `packages/notification-widget/adapters/restAdapter.js`:
   ```js
   export function createRestAdapter({ baseUrl, getToken }) {
     return {
       getUsers: ({ search }) => axios.get(`${baseUrl}/users`, { params: { search }, headers: authHeader(getToken) }),
       sendNotification: (payload) => axios.post(`${baseUrl}/notifications/send`, payload, { headers: authHeader(getToken) }),
     };
   }
   ```

4. In the **current project's own** `web/src/pages/DashboardPage.jsx`, become the first consumer:
   ```jsx
   import { NotificationPanel } from 'notification-widget';
   import { createRestAdapter } from 'notification-widget/adapters/restAdapter';

   const adapter = createRestAdapter({ baseUrl: API_BASE_URL, getToken: () => authToken });

   export default function DashboardPage() {
     return <NotificationPanel adapter={adapter} />;
   }
   ```
   This proves the widget still renders/behaves identically while being fully pluggable into a future host app that supplies a different adapter (different backend, GraphQL, mock data for tests, etc.).

5. Add a `packages/notification-widget/README.md` explaining the adapter interface and giving a minimal usage example in a hypothetical different host app.

---

## NON-FUNCTIONAL CONSTRAINTS

- Stay in plain JavaScript throughout — do not introduce TypeScript, `.ts`/`.tsx` files, or a build-step migration to TS. Document interfaces (dbAdapter, channelAdapter, frontend adapter, channel registry shape) with clear JSDoc comments instead.
- No change to current DB schema, API response shapes, or visible UI/UX behavior.
- No implementation of channel-credential-management UI or secret encryption — explicitly deferred.
- Keep both packages framework-light: `notification-core` must not assume Express-specific globals beyond the router it returns; `notification-widget` must not assume any specific state library beyond React itself (use local component state/hooks internal to the package, not the host app's Redux/Zustand store).
- After the refactor, running the existing project (`npm run dev` on both `server/` and `web/`) must produce identical behavior to before the refactor — search, select, send, success/failure feedback all unchanged.
- Output a final summary listing: every file moved, every new file created, and exactly what config/adapter a brand-new host project would need to supply to reuse `notification-core` + `notification-widget` from scratch.
