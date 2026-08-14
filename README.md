# Notification Admin Panel

A full-stack **Notification Admin Panel** for sending multi-channel notifications (SMS, Email, WhatsApp, In-App) to users.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite, React Router, Zustand (hooks), Tailwind CSS, Axios |
| Backend | Node.js + Express, Prisma ORM, Zod validation, Winston logging |
| Database | PostgreSQL |

---

## Project Structure

```
Notification Platform/
├── backend/    ← Express API (port 5000)
└── frontend/   ← Vite + React (port 5174)
```

---

## Prerequisites

- Node.js ≥ 18
- PostgreSQL running at `192.168.1.30:5433`

---

## Setup

### 1. Backend

```bash
cd backend

# 1a. Copy env template and edit if needed
copy .env.example .env

# 1b. Install dependencies
npm install

# 1c. Generate Prisma client
npm run db:generate

# 1d. Run migrations (creates tables)
npm run db:migrate

# 1e. Seed dummy users (15-20 users with random channel preferences)
npm run db:seed

# 1f. Start dev server (port 5000)
npm run dev
```

### 2. Frontend

```bash
cd frontend

# 2a. Install dependencies
npm install

# 2b. Start dev server (port 5174)
npm run dev
```

Open **http://localhost:5174** in your browser.

---

## Environment Variables (backend/.env)

| Variable | Description |
|---|---|
| `PORT` | Backend port (default: 5000) |
| `DATABASE_URL` | Full PostgreSQL connection string |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | PostgreSQL database name |
| `FRONTEND_URL` | Frontend origin for CORS (default: http://localhost:5174) |
| `JWT_SECRET` | JWT signing secret |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/v1/users?search=&page=&limit=` | Paginated, searchable users |
| POST | `/api/v1/notifications/send` | Send notifications `{ userIds, message }` |
| GET | `/api/v1/notifications/logs` | View notification logs |

---

## Architecture

### Backend — Feature-Based Modules

```
modules/users/
  ├── users.routes.js       ← Router only
  ├── users.controller.js   ← Parse request → call service → return response
  ├── users.service.js      ← Business logic
  ├── users.repository.js   ← All DB queries (Prisma)
  └── users.validation.js   ← Zod schemas

modules/notifications/
  ├── ...same structure...
  └── providers/
      ├── provider.interface.js   ← Contract: send(user, message)
      ├── provider.factory.js     ← Reads user flags → returns active providers
      ├── sms.provider.js         ← Mock (plug in real Twilio here)
      ├── email.provider.js       ← Mock (plug in real SES/SMTP here)
      ├── whatsapp.provider.js    ← Mock (plug in real WA Business API here)
      └── inapp.provider.js       ← Mock (plug in real WebSocket/FCM here)
```

### Adding a New Channel

1. Create `modules/notifications/providers/mychannel.provider.js` implementing `send(user, message)`
2. Add a boolean column to the `users` table
3. Add one entry to `CHANNEL_MAP` in `provider.factory.js`

**No other files need to change.**

---

## Ports

| Service | Port |
|---|---|
| Backend (Express) | 5000 |
| Frontend (Vite) | 5174 |
| PostgreSQL | 5433 |
