# Step 5 — Staging Final Acceptance

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `d43cbf0` (on `c553edf`)
> **Staging API:** `https://4279a98d.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`c553edf` → `d43cbf0`)
> **Previous:** `04-staging-acceptance.md` PARTIAL

## Environment

| Item          | Value                                                                                                                                                                              | Status                                                                                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API URL       | `https://nabome-api-staging.pages.dev` (`4279a98d`)                                                                                                                                | ✅ deployed                                                                                                                                                                                                 |
| Frontend URLs | `http://localhost:5173/5174/5175` (local), staging frontends not deployed                                                                                                          | ❌ NOT DEPLOYED                                                                                                                                                                                             |
| Database      | `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb`                                                                                                                                      | ✅ `migrate deploy` 2/2, seed 1 product                                                                                                                                                                     |
| Hyperdrive    | `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab...`                                                                                                                                  | ✅                                                                                                                                                                                                          |
| KV            | `6969b...` prod, `2db98...` staging                                                                                                                                                | ✅                                                                                                                                                                                                          |
| B2            | `STORAGE_*` ×6, `nabome-media`                                                                                                                                                     | ⚠️ config OK, real upload not run                                                                                                                                                                           |
| Payment       | `PAYMENT_PROVIDER=razorpay` `rzp_test_...`                                                                                                                                         | ✅                                                                                                                                                                                                          |
| Resend        | `re_...` `onboarding@resend.dev` (updated from `noreply@nabome.online` for staging)                                                                                                | ⚠️ 1/3 intermittent 500, `appUrl` now passed (`https://staging.nabome.online`)                                                                                                                              |
| Turnstile     | `1x000...AA` test `XXXX.DUMMY.TOKEN.XXXX` → `{"success":true}`                                                                                                                     | ✅                                                                                                                                                                                                          |
| Sentry        | empty                                                                                                                                                                              | ❌ not configured                                                                                                                                                                                           |
| Wrangler      | `wrangler.jsonc` `env.preview` staging, `wrangler.staging.jsonc` created with `ENVIRONMENT=staging`, `PUBLIC_API_URL=https://nabome-api-staging.pages.dev`, `CORS_ORIGINS` staging | ⚠️ `ENVIRONMENT` still `production` on deployed staging (Pages `env` only `preview`/`production`, `staging` invalid) — project `nabome-api-staging` is staging, `ENVIRONMENT` var is production, documented |

## Critical Path

| Flow                 | Result                 | Evidence                                                                                                                               |
| -------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Register             | ✅ 2/3                 | `final2-...-2/3` → 201, `final2-...-1` → 500 Resend                                                                                    |
| Login                | ✅ PASS                | `test-tail`/`directtest` → 200 `session.id` (after `status=active`), `smoketest` initially 400 but `directtest` 200 after `pnpm check` |
| Catalog list         | ✅ PASS                | `GET /products` → 200 `total:1` (was 0, now 1 after hyperdrive fix)                                                                    |
| Catalog detail       | ✅ PASS                | `GET /products/slug/signature-bronze-necklace` → 200                                                                                   |
| Cart                 | ⚠️ PARTIAL             | `POST /cart` without `x-csrf-token` → 403 PASS, with token not E2E (Node `fetch` HTML vs JSON, curl 1101 intermittent)                 |
| Checkout             | ⏭️ NOT TESTED          | `POST /checkout/sessions` not run                                                                                                      |
| Coupon               | ⏭️                     | TOCTOU not tested                                                                                                                      |
| Shipping             | ⏭️                     |                                                                                                                                        |
| Payment creation     | ⏭️                     | Razorpay test not run                                                                                                                  |
| Payment verification | ⏭️                     |                                                                                                                                        |
| Webhook              | ✅ FIXED code, not E2E | duplicate `case 'payment.failed'` → single, but replay not tested                                                                      |
| Order                | ⏭️                     |                                                                                                                                        |
| Finance              | ⏭️                     | ledger not tested                                                                                                                      |

## Security

| Test                       | Result                                                                                        |
| -------------------------- | --------------------------------------------------------------------------------------------- |
| CSRF without token → 403   | ✅                                                                                            |
| CSRF with token → 200      | ⚠️ not fully E2E (login sets `csrf_token`, but cart with token not verified due to auth 1101) |
| RBAC customer→admin        | ⏭️ NOT TESTED                                                                                 |
| Customer A→B checkout IDOR | ⏭️                                                                                            |
| Shop A→B isolation         | ⏭️                                                                                            |
| Customer A→B order         | ⏭️                                                                                            |
| Webhook replay             | ⚠️ code fixed, not tested                                                                     |

## Storage

| Test                            | Result                                                                 |
| ------------------------------- | ---------------------------------------------------------------------- |
| B2 config                       | ✅ `STORAGE_*` present, mock 18 PASS                                   |
| B2 upload/read/delete/ownership | ⏭️ NOT TESTED (TS strip `node --input-type=module` fails, needs `tsx`) |

## Frontend

| App      | Result                                        |
| -------- | --------------------------------------------- |
| Customer | ❌ NOT DEPLOYED (`pnpm build:customer` 485KB) |
| Shop     | ❌ NOT DEPLOYED                               |
| Admin    | ❌ NOT DEPLOYED                               |

## E2E

| Suite           | Result                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:e2e` | ⏭️ NOT RUN (requires `E2E_API_URL=https://nabome-api-staging.pages.dev` + frontend staging URLs, `webServer` local) |

## Remaining Issues

| Category | Issue                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| CODE     | Resend intermittent 500 (1/3) — `onboarding@resend.dev` now for staging, but still 1/3; `sendPasswordResetEmail` not yet best-effort |
| CODE     | Cart→checkout→payment→order→finance full flow not verified                                                                           |
| CODE     | Security RBAC/IDOR/tenant not verified                                                                                               |
| CODE     | B2 real upload not verified                                                                                                          |
| CODE     | Product pagination/search not verified                                                                                               |
| OWNER    | `staging-api.nabome.online` DNS not set (Pages dev only), `CORS_ORIGINS` staging not verified                                        |
| OWNER    | Turnstile widget for `staging-api.nabome.online` (currently test `1x...AA`)                                                          |
| OWNER    | Sentry `SENTRY_DSN` for staging                                                                                                      |
| INFRA    | Production `nabome-api` not created, frontend staging projects not created                                                           |
| INFRA    | Staging `ENVIRONMENT=production` (should be `staging` via `wrangler.staging.jsonc` but Pages doesn't support custom config path)     |

## Staging Health

- `GET /health` → 200 `ok` (environment `production` — see env identity)
- `GET /products` → 200 1 product
- `POST /auth/register` → 201 (2/3) / 500 (1/3)
- `POST /auth/login` → 200 for `test-tail`/`directtest`, 400/500 for some new users (rate limit?)

## Recommended Next Step (Step 6)

1. Fix Resend staging `FROM_EMAIL` verified and make all email handlers best-effort (`requestPasswordReset`, `resendVerificationEmail`).
2. Complete purchase E2E: `register` (test Turnstile) → `activate` (DB) → `login` → `POST /cart` (variant `cb555...`) → `GET /cart` → `POST /checkout/sessions` → `PATCH address/shipping/coupon` → `POST /payments` (Razorpay test, amount tamper 403, idempotency `X-Idempotency-Key` single) → `POST /payments/verify` → `POST /webhooks` (duplicate → single) → `GET /orders` (state `pending→confirmed→processing→shipped→delivered`, invalid `pending→delivered` 403) → `GET /finance` (debit=credit, commission, `FIN-...`).
3. Security: `Customer A`→`B` checkout 403, `Shop A`→`B` 403, `customer`→`admin` 403, CSRF 403/200, coupon `usageLimit=1` concurrent → 1 success.
4. B2: `tsx` with `S3StorageProvider` (`shops/{shopId}/...` ownership, cross-shop 403).
5. Deploy frontends to `nabome-customer-staging` etc. with `VITE_PUBLIC_API_URL=https://nabome-api-staging.pages.dev`, run `pnpm test:e2e` with `E2E_*_URL` staging.

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set, no live Razorpay._
