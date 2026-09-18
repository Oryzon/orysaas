# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0]

OrySaaS is a full-stack SaaS starter/boilerplate (Node.js + Express + TypeORM + MariaDB backend, Nuxt 4 + Vue 3 + Vuetify frontend) providing the foundation to build multi-tenant SaaS products faster: authentication, organizations, roles, billing, and more, out of the box. This is the first MVP-ready release.

### Added

- Email/password authentication with refresh token rotation, account verification by email, and password reset
- Social login (Google, Facebook, Microsoft)
- Multi-tenant organizations with role-based access control (Owner / Admin / Member)
- Member invitations, role management, and member removal
- Secure organization deletion flow with a 6-digit email-confirmed code
- User profile management, including password changes (disabled for social accounts)
- Real-time notifications over SSE with cursor-based pagination
- CMS with page and block-based content editing, menus and menu items
- Stripe billing: checkout, billing portal, webhooks, invoices, and trial handling
- Plans and quotas, with enforcement helpers for your own business rules
- Contact form with portal-side processing
- Scheduled jobs with a distributed-lock-safe cron runner
- Organization logo uploads
- Transactional emails (Handlebars templates) for every flow above
- API key management (integration and consumer keys)
- Database migrations workflow on top of TypeORM (`synchronize` stays for development/test only)
- Full integration test suite (Vitest) running against a disposable, containerized MariaDB

[0.1.0]: https://github.com/Oryzon/orysaas/releases/tag/0.1.0
