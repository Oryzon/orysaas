# How to: Stripe integration

This document explains how the Stripe integration works in this project and how to set it up locally to test it. It covers the Stripe CLI, API keys, webhooks, and the subscription flow end to end.

## Overview

Organizations subscribe to a `Plan` (via a specific `PlanPrice` — monthly or yearly). The flow is:

```
Admin creates Plan + PlanPrice in /portal/plans
    -> synced to Stripe (Product + Price) automatically on save, or via a daily job
Org admin goes to /portal/[slugOrganization]/subscription
    -> clicks "Subscribe" -> redirected to Stripe Checkout
    -> pays -> redirected back to the same page
    -> Stripe calls our webhook in the background -> subscription activated in our DB
```

Key entities: `PlanEntity` (the offering), `PlanPriceEntity` (a specific billing interval + price, linked 1:1 with a Stripe `Price`), `SubscriptionEntity` (an organization's subscription, linked 1:1 with a Stripe `Subscription`).

## Prerequisites

- A Stripe account, in **Test mode** (toggle top-right of the Stripe Dashboard)
- The Stripe CLI installed locally (needed to forward webhook events to your machine)

### Installing the Stripe CLI (macOS)

```bash
brew install stripe/stripe-cli/stripe
stripe --version
stripe login
```

`stripe login` opens your browser to link the CLI to your Stripe account (test mode).

## 1. Get your Stripe test API keys

In the Stripe Dashboard (test mode): **Developers > API keys**.

- **Secret key** (`sk_test_...`) — required, used server-side only
- **Publishable key** (`pk_test_...`) — **not currently used**. The checkout and billing portal flows are both server-generated redirect URLs (`session.url`), so no Stripe.js/Elements is embedded in the frontend. You don't need this key unless you later add an embedded payment flow.

## 2. Store the secret key in the app (not `.env`)

Unlike most secrets in this project, the Stripe secret key is **not** an environment variable. It's stored encrypted in the database via the `ApiKeyEntity` table, so it can be managed from the admin UI without redeploying.

1. Log in as a SaaS admin
2. Go to `/portal/settings`, "API" tab
3. Add a key: type `INTEGRATION`, system `Stripe`, paste your `sk_test_...` value

Backend code retrieves it via `ApiKeyRepository.findBySystemKey('STRIPE')` (see `core/helpers/stripe.helper.ts` -> `getStripeClient()`), scoped to platform-level keys only (`organizationUuid IS NULL`) — an organization's own key for another system never gets picked up here.

**Gotcha**: there can only be one *active* `STRIPE` key at the platform level (enforced both by a DB index and an application-level check on creation). If you ever hit a decryption error like `Invalid initialization vector` when testing, check for a leftover/corrupted duplicate row:
```sql
SELECT uuid, LENGTH(value), createdAt FROM api_key_entity WHERE systemKey = 'STRIPE';
```

## 3. Set up the Stripe CLI for local webhooks

Stripe needs a public URL to call your webhook — `stripe listen` creates a secure tunnel and forwards events to your local server.

The backend runs on port `3001` by default (see `core/server.ts`, override with `PORT` in `.env`). The webhook route is `/stripe/webhook` (no `/v1` prefix — this project doesn't use versioned route prefixes anywhere).

```bash
stripe listen --forward-to localhost:3001/stripe/webhook
```

This prints a webhook signing secret:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

Copy that into your `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**This secret changes every time you restart `stripe listen`** unless you use `stripe listen --print-secret` to get a stable one. Keep the `stripe listen` terminal open while testing — if it's not running, Stripe events never reach your backend and your DB will never reflect what happened on Stripe's side (payment success, cancellation, etc.).

### Why the webhook can't be a normal auto-discovered controller

Every other route in this project is a decorated class under `core/controllers/`, auto-discovered and mounted behind the global `express.json()` middleware. Stripe's webhook signature verification needs the **raw, unparsed request body**, which is impossible once `express.json()` has already consumed it. So this one route is wired manually in `core/server.ts`, registered *before* `express.json()`, using `express.raw({ type: 'application/json' })`. The actual handler logic lives in `core/webhooks/stripe.webhook.ts`.

## 4. Sync your plan catalog with Stripe

Create a `Plan` and at least one `PlanPrice` (monthly and/or yearly) in `/portal/plans`. Syncing to Stripe (creating the `Product`/`Price` objects and storing `stripeProductId`/`stripePriceId`) happens automatically right after you save — no manual action needed.

If it ever fails (Stripe down, key not configured yet), the save still succeeds locally (Stripe sync is best-effort, never blocking), and there's a daily job `sync-stripe-products` (`core/jobs/sync-stripe-products.jobs.ts`, runs at 3am) that retries for every plan. You can also trigger it manually from `/portal/jobs` ("Run now") — useful right after setting up your Stripe key for the first time, to sync any plans created before it existed.

**Note**: Stripe Prices are immutable — you can't change an existing Price's amount. If you edit a `PlanPrice`'s `sellPrice` after it's already synced, the sync logic creates a *new* Stripe Price and archives the old one (rather than updating in place). This is expected behavior, not a bug.

## 5. Test a subscription checkout

1. Log in as a member of an organization (role `admin` or `owner` — required to manage billing)
2. Go to `/portal/[slugOrganization]/subscription`
3. Pick a plan, click "Subscribe"
4. On the Stripe Checkout page, use a test card:
   - Card number: `4242 4242 4242 4242`
   - Any future expiry date, any CVC, any postal code
5. You'll be redirected back to `/portal/[slugOrganization]/subscription?session_id=...`. The page polls the backend for up to ~30 seconds waiting for the webhook to activate the subscription, then shows the active plan.

If it times out (webhook not received — check that `stripe listen` is running), a "still processing" state is shown with a manual refresh button.

Other useful test card numbers: `4000 0000 0000 0002` (declined), `4000 0025 0000 3155` (requires 3D Secure).

## 6. Simulate webhook events manually

You don't need to go through a full checkout every time. With `stripe listen` running, you can trigger individual events:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
stripe trigger invoice.payment_failed
```

Note: `stripe trigger` creates synthetic test objects that aren't linked to a real subscription created through this app's checkout flow, so the `organizationUuid`/`planPriceUuid` metadata our webhook relies on won't be present. Useful for checking that signature verification and routing work, less useful for testing the actual upsert logic — for that, go through the real checkout flow (step 5) and then trigger e.g. `customer.subscription.deleted` from the Stripe Dashboard on that specific real subscription.

## Architecture reference

| File | Purpose |
|---|---|
| `core/helpers/stripe.helper.ts` | Single source of truth for all Stripe logic: client creation, catalog sync, customer creation, checkout/billing-portal session creation, subscription upsert from Stripe events |
| `core/controllers/api/tenant/stripe/stripe.controller.ts` | `GET /tenant/:slugOrganization/stripe/subscription`, `POST /checkout`, `POST /billing-portal` |
| `core/webhooks/stripe.webhook.ts` | Webhook event handling (signature verification + dispatch) |
| `core/jobs/sync-stripe-products.jobs.ts` | Daily catalog re-sync job |
| `core/databases/entities/plan-price.entity.ts` | Plan pricing per billing interval, holds `stripePriceId` |
| `core/databases/entities/subscription.entity.ts` | An organization's subscription, holds `stripeSubscriptionId` |
| `webapp/app/pages/portal/[slugOrganization]/subscription.vue` | The subscribe / manage subscription page |

## Webhook events handled

| Event | Effect |
|---|---|
| `checkout.session.completed` | Creates/activates the `SubscriptionEntity`, stores `stripeCustomerId` on the organization, sends an in-app notification |
| `customer.subscription.updated` | Syncs status/dates/plan |
| `customer.subscription.deleted` | Marks the subscription `canceled` |
| `invoice.payment_succeeded` | Syncs the current billing period |
| `invoice.payment_failed` | Marks the subscription `past_due`, notifies org admins |

All of these are idempotent upserts keyed by `stripeSubscriptionId` — safe to receive the same event more than once (Stripe only guarantees "at least once" delivery).

**Not yet implemented**: transactional emails for these events (only in-app notifications exist today) — see the project roadmap for the email templates that are still pending.