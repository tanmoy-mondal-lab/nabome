# Step 7 — Final Staging Gate

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `5a31b36` (on `908dc79`)
> **Staging API:** `https://a242d0a0.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`a242d0a0` latest, `f640c404` previous)
> **Previous:** `06-final-staging-acceptance.md` PARTIAL

## Environment

| Item          | Value                                                                                                                                                                                                                                                                                                        | Status                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| API URL       | `https://nabome-api-staging.pages.dev` (`a242d0a0`)                                                                                                                                                                                                                                                          | ✅ deployed, `pnpm build:api` copy 145 files                                                |
| Frontend URLs | `http://localhost:5173/5174/5175` (local), staging frontends not deployed                                                                                                                                                                                                                                    | ❌ NOT DEPLOYED                                                                             |
| Database      | `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb`                                                                                                                                                                                                                                                                | ✅ `migrate deploy` 2/2, seed 1 product (`Signature Bronze Necklace`)                       |
| Hyperdrive    | `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab...` (updated from `ep-orange-fog...`)                                                                                                                                                                                                                          | ✅                                                                                          |
| KV            | `6969b...` prod, `2db98...` staging                                                                                                                                                                                                                                                                          | ✅                                                                                          |
| B2            | `STORAGE_*` ×6, `nabome-media`                                                                                                                                                                                                                                                                               | ⚠️ config OK, mock 18 PASS, real `S3StorageProvider` not run via `tsx`                      |
| Payment       | `PAYMENT_PROVIDER=razorpay` `rzp_test_TTAbtO...`                                                                                                                                                                                                                                                             | ✅                                                                                          |
| Resend        | `re_...` `onboarding@resend.dev` (staging, was `noreply@nabome.online`) + `appUrl` fix (`context.env.APP_URL`)                                                                                                                                                                                               | ⚠️ 2/3 → 201, 1/3 500 Worker threw exception (intermittent, not Resend 422 which is caught) |
| Turnstile     | `1x000...AA` `XXXX.DUMMY.TOKEN.XXXX` → `{"success":true}`                                                                                                                                                                                                                                                    | ✅                                                                                          |
| Sentry        | empty                                                                                                                                                                                                                                                                                                        | ❌ not configured                                                                           |
| Wrangler      | `wrangler.jsonc` `env.preview` staging, `wrangler.staging.jsonc` created (`ENVIRONMENT=staging`, `PUBLIC_API_URL=https://nabome-api-staging.pages.dev`) — Pages ` --config` not supported, `ENVIRONMENT` still `production` on deployed staging (project `nabome-api-staging` is staging, var is production) | ⚠️ documented                                                                               |

## Critical Path

| Flow                  | Result                 | Evidence                                                                                                                                                                                                                                                          |
| --------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Register              | ✅ 2/3                 | `final2-...-2/3` → 201, `final2-...-1`/`step7-...-1` → 500 Worker threw exception (intermittent, not Resend 422 which is caught)                                                                                                                                  |
| Login                 | ⚠️ intermittent        | `test-tail`/`directtest` via Node `fetch` → 200 (before `f640c404`), `directtest` via Node `f640c404` → 200 (first), `directtest` via `curl` → 500, `full_flow2.mjs` login → 500, `smoketest-...` → 400 initially but `directtest` 200 after `pnpm check` — flaky |
| Guest catalog         | ✅ PASS (via curl)     | `GET /products` guest via `curl -H "User-Agent: node"` → 200 `total:1` (was 0 before hyperdrive fix)                                                                                                                                                              |
| Authenticated catalog | ⚠️ 500                 | `GET /products` with `Cookie: access_token` via Node `fetch` → 500 Worker threw exception (guest 200, auth 500) — likely `wishlist`/`recentlyViewed` for auth user                                                                                                |
| Cart                  | ⚠️ PARTIAL             | `POST /cart` without `x-csrf-token` → 403 PASS, `POST /cart` with token but wrong path `/cart` → 404 (correct is `/cart/items`), `GET /cart` → 200 `itemCount:0` after `addedAt` fix (was 500 `createdAt` → 500)                                                  |
| Checkout              | ⏭️ NOT TESTED          | `POST /checkout/sessions` not run                                                                                                                                                                                                                                 |
| Coupon                | ⏭️                     | TOCTOU not tested                                                                                                                                                                                                                                                 |
| Shipping              | ⏭️                     |                                                                                                                                                                                                                                                                   |
| Payment creation      | ⏭️                     | Razorpay test not run                                                                                                                                                                                                                                             |
| Payment verification  | ⏭️                     |                                                                                                                                                                                                                                                                   |
| Webhook               | ✅ FIXED code, not E2E | duplicate `case 'payment.failed'` → single                                                                                                                                                                                                                        |
| Order                 | ⏭️                     |                                                                                                                                                                                                                                                                   |
| Finance               | ⏭️                     | ledger not tested                                                                                                                                                                                                                                                 |

**Fixes in this step:**

- `apps/api/_lib/cart/repository.ts:58,92` `orderBy: { createdAt: 'desc' }` → `addedAt: 'desc'` (CartItem has `addedAt`, not `createdAt`) — fixes `GET /cart` 500
- `apps/api/wrangler.staging.jsonc` created with `ENVIRONMENT=staging` (but Pages `--config` not supported, so not used)
- `RESEND_FROM_EMAIL` staging updated `noreply@nabome.online` → `onboarding@resend.dev` (verified test sender, `delivered@resend.dev` always succeeds, `example.com` 422 but caught)

**Remaining for critical path:** `GET /products` with auth 500 (likely `wishlist`/`recentlyViewed`), `POST /cart/items` with correct CSRF + auth, full checkout→payment→order→finance, all with `a242d0a0` and proper `Cookie`/`x-csrf-token` handling (Node `fetch` vs `curl` difference).

## Security

| Test                       | Result                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| CSRF without token → 403   | ✅ `POST /cart` without `x-csrf-token` → 403                                               |
| CSRF with token → 200      | ⚠️ not verified (login 500 intermittent, `POST /cart/items` not tested with correct token) |
| RBAC customer→admin        | ⏭️ NOT TESTED                                                                              |
| Customer A→B checkout IDOR | ⏭️                                                                                         |
| Shop A→B isolation         | ⏭️                                                                                         |
| Customer A→B order         | ⏭️                                                                                         |
| Webhook replay             | ⚠️ code `WebhookEvent` unique `[provider,eventId]` exists, not tested                      |

## Storage

| Test                            | Result                                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| B2 config                       | ✅ `STORAGE_*` present                                                                                                |
| B2 upload/read/delete/ownership | ⏭️ NOT TESTED (needs `tsx` `S3StorageProvider`, `node --input-type=module` fails `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`) |

## Frontend

| App      | Result          |
| -------- | --------------- |
| Customer | ❌ NOT DEPLOYED |
| Shop     | ❌              |
| Admin    | ❌              |

## E2E

| Suite           | Result     |
| --------------- | ---------- |
| `pnpm test:e2e` | ⏭️ NOT RUN |

## Remaining Issues

| Category | Issue                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CODE     | `GET /products` with auth 500 Worker threw exception (guest 200, auth 500) — likely `productService` with `recentlyViewed`/`wishlist` for auth user, needs `prisma` lazy or field fix |
| CODE     | Resend intermittent 500 (1/3) — `onboarding@resend.dev` to `example.com` 422 but caught, yet still 1/3 500 (rate limit? Hyperdrive cold start? `prisma`?)                             |
| CODE     | Login intermittent 500 (curl 500 vs Node 200 for same `directtest`) — `User-Agent`/`CF` difference, maybe `KV`/`Hyperdrive`                                                           |
| CODE     | `POST /cart` 404 due to `/cart` vs `/cart/items` (fixed in test, code expects `/cart/items`)                                                                                          |
| CODE     | Full purchase flow not verified                                                                                                                                                       |
| OWNER    | `staging-api.nabome.online` DNS not set, `CORS_ORIGINS` staging, Turnstile widget for staging, `SENTRY_DSN`                                                                           |
| INFRA    | Production `nabome-api` not created, staging `ENVIRONMENT=production` (should be `staging` via separate config, but Pages `--config` not supported)                                   |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                     |

## Staging Health (latest `a242d0a0`)

- `GET /health` → 200 `ok` (environment `production`)
- `GET /products` guest via `curl -H "User-Agent: node"` → 200 1 product
- `GET /products` with `Cookie: access_token` via Node → 500 Worker threw exception
- `POST /auth/register` → 201 (2/3) / 500 (1/3)
- `POST /auth/login` → 200 (via Node for `directtest`) / 500 (via curl, intermittent)
- `GET /cart` → 200 `itemCount:0` (after `addedAt` fix, was 500)
- `POST /cart` without `x-csrf-token` → 403

## Recommended Next Step

1. Fix `GET /products` with auth 500 (trace `wishlist`/`recentlyViewed` for auth user, likely `prisma` field or `orderBy` wrong, add `try/catch` and regression test `guest` vs `auth`).
2. Make Resend `FROM_EMAIL` verified (`nabome.online` in Resend) and ensure all `send*Email` are best-effort (already for `register`, need for `requestPasswordReset` etc.), then 3/3 register → 200.
3. Fix login 500 intermittent (compare `curl` vs `fetch` headers, check `KV`/`Hyperdrive`/`session`/`JWT`/`rate limiting`, add `wrangler tail` for `a242d0a0` with `--status error`).
4. Complete purchase E2E via `tsx` with `fetch` cookie jar: `register` (test Turnstile) → `activate` (DB) → `login` → `GET /products` guest → `POST /cart/items` (variant `cb555...`) → `GET /cart` → `POST /checkout/sessions` → `PATCH address/shipping` → `POST /payments` (Razorpay test, amount tamper 403) → `POST /payments/verify` → `POST /webhooks` duplicate → single → `GET /orders` state machine + invalid `pending→delivered` 403 → `GET /finance` ledger `debit=credit`.
5. Security: `Customer A`→`B` checkout/order 403, `Shop A`→`B` 403, `customer`→`admin` 403, CSRF 403/200, coupon `usageLimit=1` concurrent → 1.
6. B2: `tsx` `S3StorageProvider` real (`shops/{shopId}/...` ownership).
7. Deploy frontends to `nabome-customer-staging` etc. with `VITE_PUBLIC_API_URL=https://nabome-api-staging.pages.dev`, run `pnpm test:e2e` with `E2E_*` staging.

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set._
