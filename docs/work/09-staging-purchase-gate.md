# Step 9 — Staging Purchase Gate

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `d6c3699` (on `fd0af77` → `50ce666`)
> **Staging API:** `https://ec78d8f4.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`ec78d8f4` latest, `1a00ca37` previous)
> **Previous:** `08-staging-final-gate.md` PARTIAL (auth intermittent, catalog guest PASS/with-auth 500, cart partial)

## Root Causes

| #   | Symptom                                                                | Root Cause                                                                                                                                                                                                                  | Evidence                                                                                                              |
| --- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1   | `GET /products` with `access_token` → 500 Worker hung (guest 200)      | `functions/_middleware.ts:172` `prisma.session.findFirst` without timeout hung for every auth `GET` (Hyperdrive cold start, `wallTime 1095` `outcome: exception` "Worker hung") — `try/catch` doesn't catch hanging Promise | `wrangler pages deployment tail` `a242d0a0` `outcome: exception` for `POST /auth/login` and `GET /products` with auth |
| 2   | `POST /auth/login` `curl` 500 vs Node `fetch` 200, 1/3 vs 3/3          | Same `prisma.session.findFirst` hang + `fetch` to `https://challenges.cloudflare.com/turnstile/v0/siteverify` without timeout hung                                                                                          | `turnstile.ts` `fetch(VERIFY_URL)` without `AbortSignal`                                                              |
| 3   | `POST /auth/register` 1/3 500 (was 1/3 1101, now 1/3 `INTERNAL_ERROR`) | `Resend` `onboarding@resend.dev`→`example.com` 422 but caught, yet still 1/3 500 due to #1/#2 + `prisma.user.findUnique`/`create`/`emailVerification.create` without timeout hung                                           | `Resend` `sendEmail` without timeout, `auth/services-v1.ts` `prisma` without timeout                                  |
| 4   | `GET /cart` → 500 `orderBy: { createdAt }`                             | `CartItem` has `addedAt`/`updatedAt`, not `createdAt`                                                                                                                                                                       | `cart/repository.ts:58,92`                                                                                            |
| 5   | `POST /cart/items` → 404/422 `Variant not found`                       | `CartValidationService.validateVariantAvailability` used `CartRepository.findItemById(variantId)` (CartItem) instead of `productVariant`                                                                                    | `cart/validation.ts:164`                                                                                              |
| 6   | `POST /cart/items` → 422 `unitPrice missing`                           | `CartRepository.addItem` `prisma.cartItem.create` missing required `unitPrice`/`lineTotal`                                                                                                                                  | `cart/repository.ts:134`                                                                                              |
| 7   | `POST /checkout/start` → 404                                           | `apps/api/_handlers/index.ts` missing `import './checkout/index.ts'`                                                                                                                                                        | `index.ts`                                                                                                            |

## Fixes

| Fix                                                                                                                                                                                                                 | File                                                   | Deployed                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `prisma.session.findFirst` with `Promise.race` timeout 2s → 5s → 10s, skip for `GET /products` where `needsSession` false (`isMutation` or `/auth/`, `/cart`, `/checkout`, `/orders`)                               | `functions/_middleware.ts`                             | `1a00ca37` (2s) → `ec78d8f4` (10s, skip) |
| `fetch` to Turnstile/Resend with `AbortSignal.timeout(5000)` → `10000`                                                                                                                                              | `turnstile.ts`, `email/service.ts`                     | `1a00ca37` → `ec78d8f4`                  |
| `prisma` in `register`/`login` with `withTimeout` 5s → 10s                                                                                                                                                          | `auth/services-v1.ts`                                  | `ec78d8f4` (5s) → `d6c3699` (10s)        |
| `CartItem` `orderBy: addedAt`                                                                                                                                                                                       | `cart/repository.ts`                                   | `f640c404` → `a242d0a0` → `1a00ca37`     |
| `validateVariantAvailability` `productVariant.findUnique`                                                                                                                                                           | `cart/validation.ts`                                   | `e57549b4`                               |
| `cartItem.create` `unitPrice`/`lineTotal`                                                                                                                                                                           | `cart/repository.ts`                                   | `e57549b4` → `be337883`                  |
| `import './checkout/index.ts'`                                                                                                                                                                                      | `_handlers/index.ts`                                   | `f465cf7d`                               |
| `RESEND_FROM_EMAIL` staging `noreply@nabome.online` → `onboarding@resend.dev` (verified test) + `appUrl` fix                                                                                                        | `services-v1.ts` + `handlers/auth` + `wrangler secret` | `c553edf`                                |
| `wrangler.staging.jsonc` created (`ENVIRONMENT=staging`) — Pages `--config` not supported, so `ENVIRONMENT` still `production` on `nabome-api-staging` (project `nabome-api-staging` is staging, var is production) | `wrangler.staging.jsonc`                               | `908dc79`                                |

## Deployed

| Item       | Value                                                                                                                                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| API        | `https://ec78d8f4.nabome-api-staging.pages.dev` (`d6c3699`, `50ce666` + `withTimeout` 10s) — `pnpm build:api` copy 145 files, `wrangler pages deploy` |
| Frontend   | NOT DEPLOYED (`pnpm build:customer` 485KB etc., `VITE_PUBLIC_API_URL` not set for staging)                                                            |
| Database   | `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb` — `migrate deploy` 2/2, seed 1 product (`cb555...`)                                                     |
| Hyperdrive | `e2b5c6e7` → `ep-calm-lab...` (updated from `ep-orange-fog...`)                                                                                       |
| KV         | `6969b...` prod, `2db98...` staging                                                                                                                   |
| B2         | `STORAGE_*` ×6, mock 18 PASS                                                                                                                          |

## Auth Stability (after `ec78d8f4` `10s`)

| Test                                                        | Result           | Evidence                                                                                                            |
| ----------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `GET /products` guest                                       | ✅ 200 1 product | `curl -H "User-Agent: node"` → 200 (was 0 before hyperdrive, now 1)                                                 |
| `GET /products` with `Cookie: access_token`                 | ✅ 200 (was 500) | `curl -b` on `a242d0a0`/`1a00ca37` with `directtest` → 200 after #1 (was 500 via Node)                              |
| `POST /auth/login` `directtest` 3× via `curl` on `3200aedd` | ✅ 3/3 (was 1/3) | `3200aedd` 3/3 200 after #1/#2 (was 1/5)                                                                            |
| `POST /auth/login` 3× on `ec78d8f4` via `curl`              | ✅ 2/3 (was 1/3) | `ec78d8f4` 2/3 200, 1/3 `INTERNAL_ERROR` `Database timeout` (was 1101 Worker hung, now controlled)                  |
| `POST /auth/register` 3× on `ec78d8f4`                      | ⚠️ 2/3 (was 1/3) | `ec78d8f4` 2/3 200, 1/3 `INTERNAL_ERROR` `Database timeout` (was 1101, now `INTERNAL_ERROR` with `withTimeout` 10s) |
| `POST /auth/register` with `tail` running                   | ✅ 1/1           | `tail` keeps Worker warm, then 1/1 200                                                                              |

**Remaining 1/3 `INTERNAL_ERROR` is `withTimeout` rejecting after 10s due to `prisma` still hanging (Hyperdrive cold start), but now returns controlled JSON `INTERNAL_ERROR` not Worker hung 1101 — progress, but not 3/3.

## Purchase Flow

| Step                                                              | Result                                                                                                                            |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `GET /products` guest                                             | ✅ 200 1 product                                                                                                                  |
| `GET /products` auth                                              | ✅ 200 (was 500)                                                                                                                  |
| `POST /cart/items` without `x-csrf-token` → 403                   | ✅                                                                                                                                |
| `POST /cart/items` with `variantId` `cb555...` and `x-csrf-token` | ✅ 200 (was 404/422, now 200 with `unitPrice` fix, `GET /cart` 200 `itemCount:0` → 1 after add, `Unique constraint` on duplicate) |
| `GET /cart`                                                       | ✅ 200 `itemCount:0` (was 500 `createdAt`, now 200)                                                                               |
| `POST /checkout/start` with `cartId` UUID and `x-csrf-token`      | ✅ 200 `status: started` on `f465cf7d`/`a242d0a0` (was 404, now 200 after import)                                                 |
| `POST /checkout` address/shipping/coupon/totals                   | ⏭️ NOT TESTED                                                                                                                     |
| `POST /payments` Razorpay test                                    | ⏭️                                                                                                                                |
| `POST /payments/verify`                                           | ⏭️                                                                                                                                |
| `POST /webhooks` duplicate                                        | ⏭️ (code `WebhookEvent` unique exists, duplicate `case` fixed)                                                                    |
| `GET /orders` state machine                                       | ⏭️                                                                                                                                |
| `GET /finance` ledger                                             | ⏭️                                                                                                                                |

## Security

| Test                     | Result                                          |
| ------------------------ | ----------------------------------------------- |
| CSRF without token → 403 | ✅                                              |
| CSRF with token → 200    | ✅ `POST /cart/items` with `x-csrf-token` → 200 |
| RBAC/IDOR/tenant         | ⏭️ NOT TESTED                                   |

## B2

| Test        | Result                 |
| ----------- | ---------------------- |
| Config      | ✅ `STORAGE_*` present |
| Real upload | ⏭️ NOT TESTED          |

## Frontend & E2E

| Item                        | Result          |
| --------------------------- | --------------- |
| Customer/Admin/Shop staging | ❌ NOT DEPLOYED |
| `pnpm test:e2e`             | ⏭️ NOT RUN      |

## Remaining Blockers

| Category | Issue                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CODE     | `POST /auth/*` still 1/3 `INTERNAL_ERROR` `Database timeout` (Hyperdrive `origin_connection_limit` 20, `withTimeout` 10s still too short for cold start, underlying `prisma` not canceled by `Promise.race`) |
| CODE     | Full purchase `checkout`→`payment`→`order`→`finance` not E2E                                                                                                                                                 |
| OWNER    | `staging-api.nabome.online` DNS not set, `CORS_ORIGINS` staging, Turnstile widget for staging, `SENTRY_DSN`                                                                                                  |
| INFRA    | Production `nabome-api` not created, staging `ENVIRONMENT=production` (should be `staging` via separate config, but Pages `--config` not supported)                                                          |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                                            |

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set, no live Razorpay._
