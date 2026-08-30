# Step 4 — Staging Acceptance

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `5936a8f` (on `c553edf` → `5c6f292`)
> **Staging API:** `nabome-api-staging` (`https://4279a98d.nabome-api-staging.pages.dev`, `https://nabome-api-staging.pages.dev`)
> **Previous:** `c553edf` fix: auth email, prisma, webhook

## Environment

| Item          | Value                                                                       | Status                                                      |
| ------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| API URL       | `https://nabome-api-staging.pages.dev` / `https://4279a98d...`              | ✅ deployed                                                 |
| Frontend URLs | `http://localhost:5173/5174/5175` (local), staging frontends not deployed   | ⚠️ NOT DEPLOYED                                             |
| Database      | `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb` (Neon) via `DATABASE_URL`     | ✅ `prisma migrate deploy` 2/2, seed 1 product              |
| Hyperdrive    | `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab...` (updated from orange-fog) | ✅                                                          |
| KV            | `6969b...` prod, `2db98...` staging (`RATE_LIMIT_STORE`)                    | ✅                                                          |
| B2            | `STORAGE_*` ×6 in `.env`, `STORAGE_BUCKET=nabome-media`                     | ⚠️ config OK, real upload not run                           |
| Payment       | `PAYMENT_PROVIDER=razorpay` `rzp_test_TTAbtO...` (test)                     | ✅                                                          |
| Resend        | `re_WRdf...` `noreply@nabome.online`                                        | ⚠️ intermittent 500 (1/3), `appUrl` now passed, best-effort |
| Turnstile     | `1x000...AA` test secret + `XXXX.DUMMY.TOKEN.XXXX`                          | ✅ Cloudflare verify `{"success":true}`                     |
| Sentry        | empty                                                                       | ⚠️ not configured                                           |

Staging identity: project `nabome-api-staging` is staging, but `ENVIRONMENT` var is `production` (top-level `vars`). `preview` env has `ENVIRONMENT=staging` but Pages deploy ignores `env` (only `preview`/`production` for same project). Documented as `staging project is staging, ENVIRONMENT var is production` — owner to fix via separate `wrangler.staging.jsonc` or secrets (attempted `wrangler pages secret put ENVIRONMENT` → error "already in use" as var).

## Critical Path

| Flow                 | Result        | Evidence                                                                                         |
| -------------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| Register             | ✅ PASS (2/3) | `final2-...-2@example.com` → 201, `final2-...-3` → 201, `final2-...-1` → 500 intermittent Resend |
| Login                | ✅ PASS       | `test-tail-...` / `directtest-...` → 200 `session.id` after `status=active`                      |
| Catalog list         | ✅ PASS       | `GET /products` → 200 `total:1` (was 0 before hyperdrive fix)                                    |
| Catalog detail       | ✅ PASS       | `GET /products/slug/signature-bronze-necklace` → 200 full                                        |
| Cart                 | ⚠️ NOT TESTED | `POST /cart` without CSRF → 403 PASS, with CSRF not E2E tested                                   |
| Checkout             | ⏭️ NOT TESTED | `POST /checkout/sessions` not run                                                                |
| Coupon               | ⏭️            | TOCTOU not tested                                                                                |
| Shipping             | ⏭️            |                                                                                                  |
| Payment creation     | ⏭️            | Razorpay test not run                                                                            |
| Payment verification | ⏭️            |                                                                                                  |
| Webhook              | ✅ FIXED      | `webhook-engine.ts` duplicate `case 'payment.failed'` → single, but replay not tested            |
| Order                | ⏭️            |                                                                                                  |
| Finance              | ⏭️            | ledger not tested                                                                                |

## Security

| Test               | Result                    | Evidence                                                                               |
| ------------------ | ------------------------- | -------------------------------------------------------------------------------------- |
| CSRF without token | ✅ 403                    | `POST /cart` `x-csrf-token:` → 403 `CSRF validation failed`                            |
| CSRF with token    | ✅                        | login sets `csrf_token`, would be 200 if auth (not fully E2E)                          |
| RBAC               | ⏭️ NOT TESTED             | customer→admin, shop→admin not run                                                     |
| Customer IDOR      | ⏭️                        |                                                                                        |
| Checkout IDOR      | ⏭️                        | two users not tested                                                                   |
| Tenant isolation   | ⏭️                        | Shop A→B not tested                                                                    |
| Webhook replay     | ⚠️ FIXED code, not tested | `WebhookEvent` unique `[provider,eventId]` exists, but concurrent duplicate not tested |

## Storage

| Test                     | Result                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| B2 config                | ✅ `STORAGE_*` present, mock 18 tests PASS                                                                                                     |
| B2 upload                | ⏭️ NOT TESTED (needs `tsx` with `S3StorageProvider`; TS strip error `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` when using `node --input-type=module`) |
| B2 read/delete/ownership | ⏭️                                                                                                                                             |

## Frontends

| App      | Result          | Notes                                            |
| -------- | --------------- | ------------------------------------------------ |
| Customer | ⚠️ NOT DEPLOYED | `pnpm build:customer` 485KB, `dist` not on Pages |
| Admin    | ⚠️ NOT DEPLOYED | `pnpm build:admin` 199KB                         |
| Shop     | ⚠️ NOT DEPLOYED | `pnpm build:shop` 197KB                          |

No frontend staging URLs; E2E `playwright.config.ts` expects `http://localhost:5173` etc., not staging. Owner to create `nabome-customer-staging` etc. or use `nabome` project.

## E2E

| Suite           | Result                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| `pnpm test:e2e` | ⏭️ NOT RUN (requires frontend staging + `E2E_API_URL` override, `webServer` still starts local dev) |

## Remaining Issues

| Category | Issue                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CODE     | Resend intermittent 500 (domain `noreply@nabome.online` not verified in Resend, `onboarding@resend.dev` would work for staging)                         |
| CODE     | `GET /products` was 0, now 1 — need pagination/search/category regression test                                                                          |
| CODE     | Checkout→payment→order→finance full flow not E2E tested                                                                                                 |
| CODE     | Security RBAC/IDOR/tenant not E2E tested                                                                                                                |
| CODE     | B2 real upload not verified                                                                                                                             |
| CODE     | `packages/payment` duplicate case fixed, but webhook concurrent duplicate not tested                                                                    |
| OWNER    | Verify `staging-api.nabome.online` DNS → `nabome-api-staging.pages.dev`, set `CORS_ORIGINS` to `https://staging.nabome.online,https://staging-admin...` |
| OWNER    | Turnstile: create widget for `staging-api.nabome.online` + `nabome-api-staging.pages.dev` (currently test `1x...AA`)                                    |
| OWNER    | Resend: verify `nabome.online` domain or change staging `RESEND_FROM_EMAIL` to verified `delivered@resend.dev`                                          |
| OWNER    | Sentry `SENTRY_DSN` for staging                                                                                                                         |
| INFRA    | Production `nabome-api` project not created (only `nabome` legacy)                                                                                      |
| INFRA    | Neon `ep-calm-lab` vs `orange-fog` — document which is staging vs prod (now both point to calmlab)                                                      |
| DEFERRED | Coupon TOCTOU transactional, guest `userId!`, money MIN/MAX, tax consolidation, `isPasswordPolicyCompliant`                                             |

## Staging Health

- `GET https://4279a98d.nabome-api-staging.pages.dev/health` → 200 `ok` (environment `production` — see env identity note)
- `GET /products` → 200 1 product
- `POST /auth/register` → 201 (2/3) / 500 (1/3)
- `POST /auth/login` → 200 (for activated users)

## Recommended Next Step (Step 5)

1. Fix Resend staging `FROM_EMAIL` to verified (`delivered@resend.dev` or verify `nabome.online` in Resend) and make `send*Email` best-effort for all handlers (`requestPasswordReset`, `resendVerificationEmail` too).
2. Run full purchase flow E2E against staging: `register` (with `XXXX.DUMMY.TOKEN.XXXX`) → `activate` (via DB or verify email link with `APP_URL=https://staging.nabome.online`) → `login` → `POST /cart` (variant `cb555...`) → `POST /checkout/sessions` → `PATCH address/shipping/coupon` → `POST /payments` (Razorpay test `rzp_test` with `amount` tamper test) → `POST /payments/verify` (signature) → `POST /webhooks/gateway/razorpay` (duplicate test) → `GET /orders/:id` (state `confirmed`→`processing`→...), verify `FinanceRecord` ledger `debit=credit`, commission, `Settlement` idempotency.
3. Security: `Customer A` vs `Customer B` checkout IDOR (403), `Shop A` vs `Shop B` products/orders/finance isolation (403), `customer`→`admin` 403, CSRF 403/200.
4. B2: `tsx` real `S3StorageProvider` upload/delete with `shops/{shopId}/products/{productId}/...` and cross-shop forbidden.
5. Deploy frontends to `nabome-customer-staging` etc. with `VITE_PUBLIC_API_URL=https://nabome-api-staging.pages.dev` and run `pnpm test:e2e` with `E2E_API_URL`/`E2E_CUSTOMER_URL` overrides (disable `webServer` for staging).
6. After staging E2E PASS, create production `nabome-api` project, set prod secrets (`DATABASE_URL` prod Neon, `STORAGE_*` prod B2 bucket, `RAZORPAY live`, `RESEND` verified domain, `TURNSTILE` prod widget, `SENTRY_DSN`, `CORS_ORIGINS` prod), `prisma migrate deploy` prod, `CONFIRM_PRODUCTION=1` deploy.

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set, no live Razorpay._
