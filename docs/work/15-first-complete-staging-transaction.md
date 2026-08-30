# Step 15 — First Complete Staging Transaction

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `cf60aac` (on `44f8a2b` → `0f5bfc0`)
> **Staging API:** `https://c0a0fb17.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`c0a0fb17` latest, `a242d0a0` previous)
> **Previous:** `14-first-staging-transaction.md` PARTIAL (auth 1/3, catalog guest PASS/with-auth 500, cart partial)

## Cold/Warm Test

| Mode                                                          | Request                                          | Status        | Latency                                                                    | Worker                                     |
| ------------------------------------------------------------- | ------------------------------------------------ | ------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| Cold-ish (fresh `c0a0fb17` deployment URL, first request)     | `GET /products` guest                            | 200 `total:1` | ~200ms                                                                     | cold, `prisma` warm after `migrate deploy` |
| Warm (repeat `GET /products` guest on same `c0a0fb17`)        | `GET /products` guest                            | 200           | ~100ms                                                                     | warm                                       |
| Cold `POST /auth/login` `directtest` via `curl` on `c0a0fb17` | 200 `session.id`                                 | ~300ms        | cold, `Turnstile` `fetch` with `AbortSignal.timeout(10000)`                |
| Warm `POST /auth/login` `directtest` 3× on `c0a0fb17`         | 2/3 200, 1/3 `INTERNAL_ERROR` `Database timeout` | ~500ms        | warm, `prisma` `withTimeout` 10s still 1/3 timeout (Hyperdrive cold start) |

**Known remaining issue:** `POST /auth/*` still 1/3 `INTERNAL_ERROR` `Database timeout` (Hyperdrive `origin_connection_limit` 20, `Promise.race` doesn't cancel underlying `prisma`, need `prisma` pooling fix, not timeout increase).

## Purchase Flow

| Step                                                     | Result                                                                                 | Evidence                                                                                                                                        |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /products` guest                                    | ✅ 200 1 product                                                                       | `curl` `https://c0a0fb17.../api/v1/products` → 200 `Signature Bronze Necklace`                                                                  |
| `GET /products` with `Cookie: access_token` (directtest) | ✅ 200 (was 500)                                                                       | `curl -b` with `directtest` on `a242d0a0`/`1a00ca37` → 200 after `_middleware` `needsSession` skip + `withTimeout` 10s                          |
| `POST /cart/items` without `x-csrf-token` → 403          | ✅                                                                                     | `POST /cart` without token → 403                                                                                                                |
| `POST /cart/items` with `variantId` `cb555...`           | ✅ 200 (was 404/422)                                                                   | `curl -b` with `directtest` on `e57549b4` → 200 `Unique constraint` on duplicate, `GET /cart` 200 `itemCount:1` after `addedAt`+`unitPrice` fix |
| `GET /cart`                                              | ✅ 200 `itemCount:0`→1                                                                 | `f640c404` `addedAt` fix → 200                                                                                                                  |
| `POST /checkout/start` with `cartId` UUID                | ✅ 200 `status: started` on `f465cf7d` (was 404, added `import './checkout/index.ts'`) | `curl -b` with `directtest` `cartId: 00000000-...` → 200                                                                                        |
| `POST /checkout` address/shipping/coupon/totals          | ⏭️ NOT TESTED                                                                          |                                                                                                                                                 |
| `POST /payments` Razorpay test                           | ⏭️                                                                                     | `PAYMENT_PROVIDER=razorpay` `rzp_test_...` present                                                                                              |
| `POST /payments/verify`                                  | ⏭️                                                                                     |                                                                                                                                                 |
| `POST /webhooks` duplicate                               | ⏭️                                                                                     | code `WebhookEvent` unique `[provider,eventId]` exists, duplicate `case` fixed                                                                  |
| `GET /orders` state machine                              | ⏭️                                                                                     |                                                                                                                                                 |
| `GET /finance` ledger                                    | ⏭️                                                                                     |                                                                                                                                                 |

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

| Category | Issue                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CODE     | `POST /auth/*` still 1/3 `INTERNAL_ERROR` `Database timeout` (Hyperdrive cold start)                                                                                                 |
| CODE     | Full purchase `checkout`→`payment`→`order`→`finance` not E2E                                                                                                                         |
| OWNER    | `staging-api.nabome.online` DNS, `CORS_ORIGINS` staging, Turnstile widget, `SENTRY_DSN`                                                                                              |
| INFRA    | Production `nabome-api` not created, staging `ENVIRONMENT=production` (project `nabome-api-staging` is staging, `wrangler.staging.jsonc` created but Pages `--config` not supported) |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                    |

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set._
