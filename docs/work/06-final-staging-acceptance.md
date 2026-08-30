# Step 6 — Final Staging Acceptance

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `908dc79` (on `c553edf` → `d43cbf0`)
> **Staging API:** `https://f640c404.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`f640c404` latest, `4279a98d` previous)
> **Previous:** `05-staging-final-acceptance.md` PARTIAL

## Environment

| Item          | Value                                                                                                                                                                                                                                                                                                                      | Status                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| API URL       | `https://nabome-api-staging.pages.dev` (`f640c404`)                                                                                                                                                                                                                                                                        | ✅ deployed                                                                                                                 |
| Frontend URLs | `http://localhost:5173/5174/5175` (local), staging frontends not deployed                                                                                                                                                                                                                                                  | ❌ NOT DEPLOYED                                                                                                             |
| Database      | `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb`                                                                                                                                                                                                                                                                              | ✅ `migrate deploy` 2/2, seed 1 product                                                                                     |
| Hyperdrive    | `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab...`                                                                                                                                                                                                                                                                          | ✅                                                                                                                          |
| KV            | `6969b...` prod, `2db98...` staging                                                                                                                                                                                                                                                                                        | ✅                                                                                                                          |
| B2            | `STORAGE_*` ×6, `nabome-media`                                                                                                                                                                                                                                                                                             | ⚠️ config OK, mock 18 PASS, real `S3StorageProvider` not run via `tsx` (TS strip)                                           |
| Payment       | `PAYMENT_PROVIDER=razorpay` `rzp_test_...`                                                                                                                                                                                                                                                                                 | ✅                                                                                                                          |
| Resend        | `re_...` `onboarding@resend.dev` (staging)                                                                                                                                                                                                                                                                                 | ⚠️ intermittent 500 (1/3) — `appUrl` now `https://staging.nabome.online` via `context.env.APP_URL`, best-effort `try/catch` |
| Turnstile     | `1x000...AA` `XXXX.DUMMY.TOKEN.XXXX` → `{"success":true}`                                                                                                                                                                                                                                                                  | ✅                                                                                                                          |
| Sentry        | empty                                                                                                                                                                                                                                                                                                                      | ❌ not configured                                                                                                           |
| Wrangler      | `wrangler.jsonc` `env.preview` staging, `wrangler.staging.jsonc` created (`ENVIRONMENT=staging`, `PUBLIC_API_URL=https://nabome-api-staging.pages.dev`) — Pages ` --config` not supported, `ENVIRONMENT` still `production` on deployed staging (project `nabome-api-staging` is staging, `ENVIRONMENT` var is production) | ⚠️ documented                                                                                                               |

## Critical Path

| Flow                 | Result                 | Evidence                                                                                                                                                                                                              |
| -------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Register             | ✅ 2/3                 | `final2-...-2/3` → 201, `final2-...-1` → 500 Resend, `tailtest` → 201                                                                                                                                                 |
| Login                | ⚠️ intermittent        | `test-tail`/`directtest` → 200 (via Node `fetch`), `directtest` via `curl`/second Node → 500 Worker threw exception (1/2), `smoketest` → 400 initially but `directtest` 200 after `pnpm check`                        |
| Catalog list         | ✅ PASS                | `GET /products` guest → 200 `total:1` (was 0, now 1 after hyperdrive fix)                                                                                                                                             |
| Catalog detail       | ✅ PASS                | `GET /products/slug/signature-bronze-necklace` → 200                                                                                                                                                                  |
| Cart                 | ⚠️ PARTIAL             | `POST /cart` without `x-csrf-token` → 403 PASS, `POST /cart` with token but wrong path `/cart` → 404 (correct is `/cart/items`), `GET /cart` → 200 `itemCount:0` after fix `orderBy: addedAt` (was `createdAt` → 500) |
| Checkout             | ⏭️ NOT TESTED          | `POST /checkout/sessions` not run                                                                                                                                                                                     |
| Coupon               | ⏭️                     | TOCTOU not tested                                                                                                                                                                                                     |
| Shipping             | ⏭️                     |                                                                                                                                                                                                                       |
| Payment creation     | ⏭️                     | Razorpay test not run                                                                                                                                                                                                 |
| Payment verification | ⏭️                     |                                                                                                                                                                                                                       |
| Webhook              | ✅ FIXED code, not E2E | duplicate `case 'payment.failed'` → single                                                                                                                                                                            |
| Order                | ⏭️                     |                                                                                                                                                                                                                       |
| Finance              | ⏭️                     | ledger not tested                                                                                                                                                                                                     |

## Security

| Test                       | Result                                                                |
| -------------------------- | --------------------------------------------------------------------- |
| CSRF without token → 403   | ✅                                                                    |
| CSRF with token → 200      | ⚠️ not fully E2E                                                      |
| RBAC customer→admin        | ⏭️ NOT TESTED                                                         |
| Customer A→B checkout IDOR | ⏭️                                                                    |
| Shop A→B isolation         | ⏭️                                                                    |
| Customer A→B order         | ⏭️                                                                    |
| Webhook replay             | ⚠️ code `WebhookEvent` unique `[provider,eventId]` exists, not tested |

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

| Suite           | Result                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `pnpm test:e2e` | ⏭️ NOT RUN (`playwright.config.ts` expects `localhost:5173`, needs `E2E_API_URL` etc., `webServer` local) |

## Remaining Issues

| Category | Issue                                                                                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CODE     | Resend intermittent 500 (1/3) — `onboarding@resend.dev` to `example.com` fails 422 but caught, yet still 500 for some registers (rate limit? Hyperdrive cold start?)                                  |
| CODE     | `GET /products` with cookies → 500 Worker threw exception (without cookies 200), `POST /cart` 404 due to wrong path `/cart` vs `/cart/items` (fixed in test), `GET /cart` now 200 after `addedAt` fix |
| CODE     | Purchase flow cart→checkout→payment→order→finance not E2E verified                                                                                                                                    |
| CODE     | Security RBAC/IDOR/tenant not verified                                                                                                                                                                |
| CODE     | B2 real upload not verified                                                                                                                                                                           |
| OWNER    | `staging-api.nabome.online` DNS not set, `CORS_ORIGINS` staging, Turnstile widget for staging, `SENTRY_DSN`                                                                                           |
| INFRA    | Production `nabome-api` not created, frontend staging projects not created, `ENVIRONMENT=production` on staging project (should be `staging` via separate config, but Pages `--config` not supported) |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                                     |

## Staging Health (latest `f640c404`)

- `GET /health` → 200 `ok` (environment `production`)
- `GET /products` guest → 200 1 product
- `GET /products` with `Cookie: access_token` → 500 Worker threw exception (needs investigation, likely `productService` with auth)
- `POST /auth/register` → 201 (2/3) / 500 (1/3)
- `POST /auth/login` → 200 (for `directtest` via Node) / 500 (via curl, intermittent)

## Recommended Next Step

1. Fix `GET /products` with auth 500 (likely `wishlist` or `recentlyViewed` for authenticated user using `prisma` with wrong field) and `POST /cart` path, redeploy `f640c404` successor.
2. Make Resend `FROM_EMAIL` verified (`nabome.online` in Resend) and ensure `send*Email` best-effort for all handlers, then 3/3 register → 200.
3. Complete purchase E2E via `tsx` with `fetch` cookie jar: `register` (test Turnstile) → `activate` (DB) → `login` → `GET /products` guest → `POST /cart/items` (variant `cb555...`) → `GET /cart` → `POST /checkout/sessions` → `PATCH address/shipping` → `POST /payments` (Razorpay test, amount tamper 403) → `POST /payments/verify` → `POST /webhooks` duplicate → single → `GET /orders` state machine + invalid `pending→delivered` 403 → `GET /finance` ledger `debit=credit`.
4. Security: `Customer A`→`B` checkout/order 403, `Shop A`→`B` 403, `customer`→`admin` 403, CSRF 403/200, coupon `usageLimit=1` concurrent → 1.
5. B2: `tsx` `S3StorageProvider` real (`shops/{shopId}/...` ownership).
6. Update `wrangler.jsonc` to remove `ENVIRONMENT` etc. from `vars` and manage via secrets per project, or accept `staging project is staging` even if `ENVIRONMENT=production`.
7. Deploy frontends to `nabome-customer-staging` etc. with `VITE_PUBLIC_API_URL=https://nabome-api-staging.pages.dev`, run `pnpm test:e2e` with `E2E_*` staging.

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set._
