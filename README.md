# OrySaaS

🇫🇷 [Version française](README_FR.md)

OrySaaS is a full-stack SaaS starter/boilerplate built as a monorepo:
- `core`: Node.js + Express + TypeORM API (MariaDB)
- `webapp`: Nuxt 4 + Vue 3 + Vuetify frontend

It provides the foundation to build multi-tenant SaaS products faster, covering authentication, organization management, notifications, plans/quotas, and more out of the box.

## Status

> ⚠️ **Work in progress — not production-ready.**

OrySaaS is currently under active development. The codebase is not yet stable, APIs may change without notice, and several features are still missing or incomplete.

It is **not** intended for public use or third-party integration at this stage. No npm package, Docker image, or simplified setup is available yet — this is a raw monorepo meant to be cloned and extended directly.

If you stumbled upon this repository: feel free to explore, but expect rough edges.

## Repository structure

```text
orysaas/
  core/      # API (TypeScript, Express, TypeORM, MariaDB)
  webapp/    # Frontend (Nuxt 4, Vue 3, Vuetify)
  shared/    # Shared constants and types (organization roles, etc.)
```

## Features

- **Authentication** — email/password with refresh token rotation, account verification by email, password reset by email
- **Social login** — OAuth callbacks for Google, Facebook, and Microsoft
- **Multi-tenant organizations** — create, update, and soft-delete organizations; role-based access (Owner / Admin / Member)
- **Member management** — invite by email (with notification + transactional email), role editing, member removal
- **Organization deletion** — secure flow with 6-digit confirmation code sent by email to the owner
- **User profile** — update personal info, change password (blocked for social accounts)
- **Real-time notifications** — SSE stream, cursor-based pagination, mark as read / mark all as read
- **CMS** — page and block-based content editing, menus and menu items
- **Plans and quotas** — plan management and quota enforcement
- **Contact form** — submission and portal-side processing
- **Scheduled jobs** — cron/job runner with runtime management endpoints
- **File uploads** — organization logo upload with local storage
- **Transactional emails** — Handlebars templates for all flows (verification, reset, invitation, organization deletion)

## Tech stack

### Backend (`core`)
- TypeScript
- Express
- TypeORM
- MariaDB
- Luxon (date handling)
- Formidable (file uploads)
- Handlebars (email templates)
- jsonwebtoken
- node-cron
- Nodemailer

### Frontend (`webapp`)
- Nuxt 4
- Vue 3 (Composition API)
- Vuetify 4

## Prerequisites

- Node.js 20+
- npm 10+
- MariaDB 10.6+
- Docker (optional, for local database)

## Getting started

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Configure environment variables

```bash
cp core/.env.example core/.env
cp webapp/.env.example webapp/.env
```

On Windows PowerShell:

```powershell
Copy-Item core/.env.example core/.env
Copy-Item webapp/.env.example webapp/.env
```

#### `core/.env` — key variables

| Variable                                                                    | Description                                                        |
|-----------------------------------------------------------------------------|--------------------------------------------------------------------|
| `PORT`                                                                      | API port (default: `3001`)                                         |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD`          | MariaDB connection                                                 |
| `JWT_SECRET`                                                                | Secret used to sign JWT tokens — **generate a strong random value** |
| `API_URL`                                                                   | Full base URL of the API (e.g. `http://localhost:3001/v1`)         |
| `HTTP_URL`                                                                  | Public URL of the frontend (e.g. `http://localhost:3000`)          |
| `ALLOWED_ORIGINS`                                                           | CORS origins, comma-separated                                      |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` / `MAIL_FROM`        | SMTP configuration                                                 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`                                 | Google OAuth credentials                                           |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`                             | Facebook OAuth credentials                                         |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` / `MICROSOFT_TENANT_ID`  | Microsoft OAuth credentials                                        |
| `PEPPER_REFRESH` / `PEPPER_RESET`                                           | Additional secrets for token hardening                             |

#### `webapp/.env` — key variables

| Variable                                        | Description                                    |
|-------------------------------------------------|------------------------------------------------|
| `GOOGLE_CLIENT_ID`                              | Google OAuth client ID (used for login button) |
| `FACEBOOK_APP_ID`                               | Facebook App ID                                |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_TENANT_ID`  | Microsoft OAuth credentials                    |

### 3. Start a local MariaDB (optional — Docker)

```bash
docker run -p 3306:3306 --name orysaas \
  -e MARIADB_USER=orysaas \
  -e MARIADB_PASSWORD=orysaas \
  -e MARIADB_DATABASE=orysaas \
  -e MARIADB_ROOT_PASSWORD=root \
  -d mariadb:latest
```

Then update `DB_*` variables in `core/.env` accordingly.

### 4. Run in development

From the root (runs API and frontend concurrently):

```bash
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`

## API

- All routes are mounted under `/v1/*`.
- In non-production mode, a route listing is available at `GET http://localhost:3001/doc`.
- Authentication uses a `Bearer` JWT token in the `Authorization` header.
- Refresh tokens are issued at login and rotated on each use.

## Database

TypeORM runs with `synchronize: true` outside production — the schema is kept in sync automatically during development.

To seed the database:

```bash
npm run seed -- showcase
```

## Available scripts

| Command                    | Description                          |
|----------------------------|--------------------------------------|
| `npm run dev`              | Run backend + frontend in watch mode |
| `npm run dev:core`         | Run backend only                     |
| `npm run dev:webapp`       | Run frontend only                    |
| `npm run build`            | Build backend and frontend           |
| `npm run seed -- <name>`   | Execute a backend seeder             |

Workspace-scoped commands:

```bash
npm --workspace core run dev
npm --workspace core run tsc
npm --workspace webapp run dev
npm --workspace webapp run build
npm --workspace webapp run preview
```

## Auth flow

### Email/password
1. Register → receive a verification email → activate account → log in.
2. Forgot password → receive a reset email (valid 1 hour) → set a new password.

### Social login
After the OAuth provider callback, the backend redirects with a `social_token` query parameter. The Nuxt middleware consumes it, completes the login, and cleans the URL.

## Soft delete

Organizations, members, and invitations follow a soft-delete pattern: records are never hard-deleted, they receive a `deletedAt` timestamp and a `deletedBy` UUID. A scheduled job (to be configured) handles permanent cleanup after the retention period.

## Production checklist

- [ ] Set `NODE_ENV=production`
- [ ] Disable TypeORM `synchronize` and use migrations instead
- [ ] Set a strong `JWT_SECRET`
- [ ] Configure `ALLOWED_ORIGINS` to your domain only
- [ ] Configure a real SMTP server (`MAIL_*` variables)
- [ ] Configure OAuth credentials for each enabled provider
- [ ] Set up HTTPS (reverse proxy — nginx, Caddy, etc.)
- [ ] Configure a process manager (PM2, systemd, Docker)

## Contributing

1. Create a feature branch from `develop`
2. Keep changes scoped to a single concern
3. Open a pull request with context and test steps

## License

No license file is currently provided. All rights reserved — OryScorp.