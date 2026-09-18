# OrySaaS

🇫🇷 [Version française](README_FR.md)

OrySaaS is a full-stack SaaS starter/boilerplate built as a monorepo:
- `core`: Node.js + Express + TypeORM API (MariaDB)
- `webapp`: Nuxt 4 + Vue 3 + Vuetify frontend

It provides the foundation to build multi-tenant SaaS products faster, covering authentication, organization management, notifications, plans/quotas, and more out of the box.

## Status

> ✅ **MVP-ready.**

OrySaaS covers the foundation of a real multi-tenant SaaS — authentication, organizations and roles, billing, quotas, notifications, CMS — and is solid enough to build real business logic on top of it today. It's still evolving: APIs may change between versions, and some operational concerns are intentionally left to you, since they depend on how and where you host your product (backups, observability, CI/CD, deployment — see [Deploying](#deploying)).

No npm package or Docker image is provided — this is a raw monorepo meant to be cloned and extended directly.

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

TypeORM runs with `synchronize: true` outside production (development and test) — the schema is kept in sync with your entities automatically, nothing to do for day-to-day work.

In production, `synchronize` is off on purpose (it can drop a column it thinks is obsolete — not something to risk on real data). Schema changes go through versioned migrations instead — see [Migrations](#migrations) below.

To seed the database:

```bash
npm run seed -- showcase
```

## Migrations

Nothing changes for local development: add a column to an entity, run the app or the tests, `synchronize` handles it. You only need to think about migrations when you're about to deploy a schema change to production.

### Generating a migration

```bash
cd core
npm run migration:generate -- databases/migrations/DescriptiveName
```

This connects to whatever database your `.env` currently points at, diffs it against your entities, and writes the migration file. Point `.env` at a database that already has the schema from *before* your change (your dev DB, typically) so the generated diff only contains your change — not a diff against an empty database.

Read the generated migration before committing it. TypeORM's diffing is good but not infallible, especially for renames (it may generate a drop + create instead of a rename — fix that by hand if so).

### Running migrations (production)

Before starting the new server version, against the production database:

```bash
cd core
npm run migration:run
```

This applies every migration that hasn't run yet, tracked in a `migrations` table TypeORM manages itself.

> **Don't** call `dataSource.runMigrations()` from application boot code (`server.ts`/`app.ts`). If you ever run more than one instance, two instances starting at once would race on the same unapplied migration. Run it as its own deploy step, once, before the new instances come up — see [Deploying](#deploying).

### Reverting

```bash
npm run migration:revert
```

Reverts the most recently applied migration by calling its `down()`. Only reach for this right after a bad deploy — don't use it as a general undo tool once other migrations have layered on top.

### The baseline migration

`core/databases/migrations/*-InitialSchema.ts` creates the entire schema that exists at the time it was written, from nothing. It's the starting point — every entity change from here on gets its own migration on top of it.

## Tests

The backend test suite (Vitest) runs integration tests against a real, disposable MariaDB instance rather than mocks, so the same TypeORM/MariaDB behavior that runs in production (generated columns, named locks, enums, JSON columns, …) is actually exercised.

The simplest way to run it, from the repository root:

```bash
npm test
```

This single command starts a throwaway MariaDB (`docker-compose.test.yml`, port 3307), runs `tsc` then the full Vitest suite against it, and tears the database back down afterwards — even if a test fails. Requires Docker running locally.

For a tighter feedback loop while iterating on a single test file, keep the test database running and use watch mode instead:

```bash
npm run test:db:up      # start the disposable MariaDB and leave it running
npm run test:watch      # inside core — tsc, then Vitest in watch mode
npm run test:db:down    # stop it once you're done
```

## Available scripts

| Command                     | Description                                                |
|------------------------------|-------------------------------------------------------------|
| `npm run dev`                 | Run backend + frontend in watch mode                       |
| `npm run dev:core`            | Run backend only                                            |
| `npm run dev:webapp`          | Run frontend only                                            |
| `npm run build`                | Build backend and frontend                                  |
| `npm run lint`                 | Lint backend and frontend                                    |
| `npm run format`               | Format the whole repo with Prettier                          |
| `npm run format:check`         | Check formatting without writing                             |
| `npm run seed -- <name>`       | Execute a backend seeder                                     |
| `npm test`                     | Run the full backend test suite (see [Tests](#tests))        |
| `npm run test:watch`           | Watch-mode tests against an already-running test database    |
| `npm run test:db:up`           | Start the disposable test MariaDB                             |
| `npm run test:db:down`         | Stop the test database                                        |

Workspace-scoped commands:

```bash
npm --workspace core run dev
npm --workspace core run tsc
npm --workspace core run migration:generate -- databases/migrations/DescriptiveName
npm --workspace core run migration:run
npm --workspace core run migration:revert
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

## Deploying

This repo doesn't ship a Dockerfile or a CI pipeline on purpose (see [Status](#status)) — deployment is left to you, however you choose to automate it. Whichever mode below you pick, go through this checklist first:

- [ ] Set `NODE_ENV=production`
- [ ] Set a strong, random `JWT_SECRET` (and `PEPPER_REFRESH`/`PEPPER_RESET`)
- [ ] Restrict `ALLOWED_ORIGINS` to your real domain(s)
- [ ] Configure a real SMTP server (`MAIL_*` variables)
- [ ] Configure OAuth credentials for each provider you actually enable
- [ ] Set up HTTPS (reverse proxy — nginx, Caddy, etc.)

### Manual mode

1. On the server: clone the repo and run `npm install`, then fill `core/.env` and `webapp/.env` with production values.
2. Build both apps: `npm run build`.
3. Apply pending migrations against the production database — once, before starting the new version (see [Migrations](#migrations)):
   ```bash
   cd core
   npm run migration:run
   ```
4. Start the API behind a process manager (PM2, systemd, …) with `NODE_ENV=production`, e.g. `node core/build/core/server.js`. Serve the `webapp` build (`webapp/.output`) the same way, or via `npm --workspace webapp run preview` behind your process manager — see [Nuxt's deployment docs](https://nuxt.com/docs/getting-started/deployment) for the option that fits your host.
5. Point your reverse proxy at both: `/v1/*` (and `/doc` if you keep it open) to the API, everything else to the frontend.

### Automatic mode (host-dependent)

Most hosts (Railway, Render, Fly.io, a VPS with your own CI, a self-hosted Coolify/Dokploy, …) can run this same build → migrate → start cycle for you on every push — but the exact setup depends entirely on the host, there's no single config that fits all of them. In general:

- Give your host a build command (`npm install && npm run build`) and a start command per app, matching step 4 above.
- If your host supports a "release" / "pre-deploy" step (run once, before new instances take traffic), use it to run `npm --workspace core run migration:run`. This is the automated equivalent of step 3 — the same rule applies: run it once per deploy, never from the app's own boot code, so that two instances starting at the same time can't race on the same unapplied migration.
- If your host builds from a Dockerfile, you'll need to write one (a simple multi-stage install → build → run works) — none is provided here, since it needs to match how you actually intend to run `core` and `webapp` on your chosen host.

## Contributing

1. Create a feature branch from `develop`
2. Keep changes scoped to a single concern
3. Open a pull request with context and test steps

## License

MIT — see [LICENSE.md](LICENSE.md). Copyright © 2026 OryScorp.