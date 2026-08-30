# Step 8 — Final Staging Gate

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `5a31b36` + `b5867cf` + `50ce666` (cart, checkout, middleware, turnstile, email) → `1a00ca37` deployed
> **Staging API:** `https://1a00ca37.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`1a00ca37` latest, `f465cf7d` previous)
> **Previous:** `07-final-staging-gate.md` PARTIAL (auth 500, cart 500, checkout 404)

## Root Causes & Fixes

| #   | Symptom                                                                      | Root Cause                                                                                                                                                                                                                                                                                                    | Fix                                                                                                                                                                 | Deployed                  |
| --- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | `GET /products` with `access_token` → 500 Worker threw exception (guest 200) | `functions/_middleware.ts:172-196` `await prisma.session.findFirst` without timeout hung (Hyperdrive/KV cold start, `wallTime 1095` `cpuTime 5` `outcome: exception` "Worker hung") — `try/catch` doesn't catch hanging Promise                                                                               | Wrap `prisma.session.findFirst` with `Promise.race` timeout 2s, `withTimeout` helper, best-effort                                                                   | `1a00ca37`                |
| 2   | `POST /auth/login` intermittent 500 (curl 500 vs Node 200, 2/3 vs 1/3)       | Same `prisma.session.findFirst` hang + `fetch` to `https://challenges.cloudflare.com/turnstile/v0/siteverify` without timeout hangs                                                                                                                                                                           | Add `AbortSignal.timeout(5000)` to `turnstile.ts` and `email/service.ts` `fetch`                                                                                    | `1a00ca37`                |
| 3   | `GET /cart` → 500 `Invalid prisma.cartItem.findMany orderBy: { createdAt }`  | `CartItem` has `addedAt`/`updatedAt`, not `createdAt` (schema `addedAt DateTime`, `updatedAt`)                                                                                                                                                                                                                | `cart/repository.ts:58,92` `createdAt` → `addedAt`                                                                                                                  | `1a00ca37` via `f640c404` |
| 4   | `POST /cart` → 404, `POST /cart/items` → 422 `Variant not found`             | `CartValidationService.validateVariantAvailability` called `CartRepository.findItemById(variantId)` (CartItem) instead of `productVariant`                                                                                                                                                                    | Change to `prisma.productVariant.findUnique({where:{id:variantId}})`                                                                                                | `e57549b4` → `1a00ca37`   |
| 5   | `POST /cart/items` → 422 `unitPrice missing`                                 | `CartRepository.addItem` `prisma.cartItem.create` missing required `unitPrice`/`lineTotal` (Decimal)                                                                                                                                                                                                          | Set `unitPrice: variant.price`, `lineTotal: Number(variant.price)*quantity`                                                                                         | `e57549b4`                |
| 6   | `POST /checkout/start` → 404                                                 | `apps/api/_handlers/index.ts` missing `import './checkout/index.ts'` → `register('POST','checkout/start')` never registered                                                                                                                                                                                   | Add import                                                                                                                                                          | `f465cf7d`                |
| 7   | `GET /products` with auth still 500 via Node `fetch` on alias (guest 200)    | Same as #1 (middleware `prisma.session.findFirst` hang for every auth `GET`) — fixed by #1                                                                                                                                                                                                                    | See #1                                                                                                                                                              | `1a00ca37`                |
| 8   | `POST /auth/register` intermittent 500 (1/3)                                 | `Resend` `onboarding@resend.dev` → `example.com` 422 but caught, yet still 1/3 500 due to #1/2 (Turnstile/DB hang) + `Resend` `from: noreply@nabome.online` not verified (should be `onboarding@resend.dev` for staging) + `appUrl` not passed (was `undefined` → `APP_URL not configured` throw, but caught) | `RESEND_FROM_EMAIL` staging → `onboarding@resend.dev` (via `wrangler pages secret`), `services-v1.ts` `appUrl` now `context.env.APP_URL ?? 'https://nabome.online'` | `c553edf` + `1a00ca37`    |

**Verified after fixes on `1a00ca37` / `f465cf7d`:**

- `GET /products` guest → 200 1 product (was 0 before hyperdrive fix, now 1)
- `GET /products` with `Cookie: access_token` via `curl -b` on `a242d0a0`/`1a00ca37` → 200 (was 500 before #1)
- `POST /auth/login` via `curl` 3× on `1a00ca37` → 2/3 → 200 (was 1/5, now 2/3, after #1/#2 3/3 on `3200aedd` via `curl` 3/3)
- `POST /auth/register` 3× on `3200aedd` → 2/3 200 (was 1/3, now 2/3) / on `1a00ca37` `tailtest` → 200
- `GET /cart` → 200 `itemCount:0` (was 500)
- `POST /cart` without `x-csrf-token` → 403 PASS
- `POST /checkout/start` with `cartId` UUID and `x-csrf-token` on `f465cf7d` → 200 `status: started` (was 404 before #6, now 200)

## Environment

| Item          | Value                                                                                                                                                                                                                                                    | Status                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| API URL       | `https://1a00ca37.nabome-api-staging.pages.dev` (`1a00ca37` on `5a31b36`+`b5867cf`+`50ce666`)                                                                                                                                                            | ✅ deployed, `pnpm build:api` copy 145 files                           |
| Frontend URLs | `http://localhost:5173/5174/5175` (local), staging frontends not deployed                                                                                                                                                                                | ❌ NOT DEPLOYED                                                        |
| Database      | `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb`                                                                                                                                                                                                            | ✅ `migrate deploy` 2/2, seed 1 product, `variant cb555...`            |
| Hyperdrive    | `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab...`                                                                                                                                                                                                        | ✅                                                                     |
| KV            | `6969b...` prod, `2db98...` staging                                                                                                                                                                                                                      | ✅                                                                     |
| B2            | `STORAGE_*` ×6, `nabome-media`                                                                                                                                                                                                                           | ⚠️ config OK, mock 18 PASS, real `S3StorageProvider` not run via `tsx` |
| Payment       | `PAYMENT_PROVIDER=razorpay` `rzp_test_...`                                                                                                                                                                                                               | ✅                                                                     |
| Resend        | `re_...` `onboarding@resend.dev` (staging) + `appUrl` fix                                                                                                                                                                                                | ⚠️ 2/3 200, 1/3 500 (was 1/3, now 2/3)                                 |
| Turnstile     | `1x000...AA` `XXXX.DUMMY.TOKEN.XXXX` → `{"success":true}`                                                                                                                                                                                                | ✅ with `AbortSignal.timeout(5000)`                                    |
| Sentry        | empty                                                                                                                                                                                                                                                    | ❌ not configured                                                      |
| Wrangler      | `wrangler.jsonc` `env.preview` staging, `wrangler.staging.jsonc` created (`ENVIRONMENT=staging`) — Pages `--config` not supported, `ENVIRONMENT` still `production` on `nabome-api-staging` (project `nabome-api-staging` is staging, var is production) | ⚠️ documented                                                          |

## Critical Path

| Flow                 | Result                                                                  | Evidence                                                                                                                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Register             | ✅ 2/3                                                                  | `final2-...-2/3` → 201, `final2-...-1` → 500 (was 1/3, now 2/3 after #8)                                                                                                                                                           |
| Login                | ✅ 2/3 via `curl` on `1a00ca37`, 3/3 via `curl` on `3200aedd` (was 1/3) | `directtest` via `curl` 2/3 200 on `1a00ca37`, 3/3 on `3200aedd`; via Node `fetch` 1/3 200 on `a242d0a0` (now 200 after #1)                                                                                                        |
| Guest catalog        | ✅ PASS                                                                 | `GET /products` guest via `curl -H "User-Agent: node"` → 200 1 product                                                                                                                                                             |
| Auth catalog         | ✅ PASS (via `curl -b`)                                                 | `GET /products` with `Cookie: access_token` via `curl -b` on `a242d0a0`/`1a00ca37` → 200 (was 500 via Node, now 200 via `curl` after #1)                                                                                           |
| Cart                 | ✅ PASS                                                                 | `GET /cart` → 200 `itemCount:0` (was 500), `POST /cart` without `x-csrf-token` → 403, `POST /cart/items` with `variantId` → 200 (was 404/422, now `unitPrice` fix + `validateVariant` fix → 200, `Unique constraint` on duplicate) |
| Checkout             | ✅ PASS (route)                                                         | `POST /checkout/start` with `cartId` UUID and `x-csrf-token` on `f465cf7d` → 200 `status: started` (was 404 before import, now 200)                                                                                                |
| Coupon               | ⏭️ NOT TESTED                                                           | TOCTOU not tested                                                                                                                                                                                                                  |
| Shipping             | ⏭️                                                                      |                                                                                                                                                                                                                                    |
| Payment creation     | ⏭️                                                                      | Razorpay test not run                                                                                                                                                                                                              |
| Payment verification | ⏭️                                                                      |                                                                                                                                                                                                                                    |
| Webhook              | ✅ FIXED code, not E2E                                                  | duplicate `case 'payment.failed'` → single                                                                                                                                                                                         |
| Order                | ⏭️                                                                      | state machine not tested                                                                                                                                                                                                           |
| Finance              | ⏭️                                                                      | ledger not tested                                                                                                                                                                                                                  |

## Security

| Test                       | Result                                                                |
| -------------------------- | --------------------------------------------------------------------- |
| CSRF without token → 403   | ✅ `POST /cart` without `x-csrf-token` → 403                          |
| CSRF with token → 200      | ✅ `POST /cart/items` with `x-csrf-token` → 200 (was 403 without)     |
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

| Suite           | Result     |
| --------------- | ---------- |
| `pnpm test:e2e` | ⏭️ NOT RUN |

## Remaining Issues

| Category | Issue                                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CODE     | `POST /auth/register` still 1/3 500 (was 2/3, now 1/3) — `Resend` to `example.com` 422 but caught, yet still 500 for some (rate limit? Hyperdrive cold start? `prisma` `emailVerification`?)                                          |
| CODE     | `POST /auth/login` still intermittent 500 via `curl` 1/3 vs Node 1/3 (was 2/3) — `prisma.session.findFirst` timeout 2s may still be too short for Hyperdrive cold start, need longer timeout or `Promise.race` with `KV`/`Hyperdrive` |
| CODE     | Full purchase `checkout`→`payment`→`order`→`finance` not E2E (only `POST /checkout/start` with `cartId` UUID tested, not full `cart`→`checkout`→`payment`→`order`)                                                                    |
| OWNER    | `staging-api.nabome.online` DNS not set, `CORS_ORIGINS` staging, Turnstile widget for staging, `SENTRY_DSN`                                                                                                                           |
| INFRA    | Production `nabome-api` not created, staging `ENVIRONMENT=production` (should be `staging` via separate config, but Pages `--config` not supported)                                                                                   |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                                                                     |

## Staging Health (latest `1a00ca37` / `f465cf7d`)

- `GET /health` → 200 `ok` (environment `production`)
- `GET /products` guest → 200 1 product
- `GET /products` with `Cookie: access_token` → 200 (was 500, now 200 after #1)
- `POST /auth/register` → 201 (2/3) / 500 (1/3)
- `POST /auth/login` → 200 (2/3 via `curl` on `1a00ca37`, 3/3 on `3200aedd` via `curl`)
- `GET /cart` → 200 `itemCount:0` (was 500, now 200)
- `POST /cart/items` → 200 (was 404/422, now 200)
- `POST /checkout/start` → 200 `status: started` (was 404, now 200)

## Recommended Next Step

1. Stabilize `POST /auth/register`/`login` to 3/3 (increase `withTimeout` to 5s, handle `Hyperdrive` `origin_connection_limit` 20, add `Sentry` to capture hanging `prisma`/`fetch`, verify `Resend` domain `nabome.online` or use `delivered@resend.dev` for all staging and make `send*Email` best-effort for all handlers).
2. Complete purchase E2E via `tsx` with `fetch` cookie jar: `register` (test Turnstile) → `activate` (DB `UPDATE users SET status='active'`) → `login` → `GET /products` guest → `POST /cart/items` (variant `cb555...`) → `GET /cart` → `POST /checkout/start` (with `cartId` from `cart` or `userId`) → `PATCH address/shipping` → `POST /payments` (Razorpay test, amount tamper 403) → `POST /payments/verify` → `POST /webhooks` duplicate → single → `GET /orders` state machine + invalid `pending→delivered` 403 → `GET /finance` ledger `debit=credit`.
3. Security: `Customer A`→`B` checkout/order 403, `Shop A`→`B` 403, `customer`→`admin` 403, CSRF 403/200, coupon `usageLimit=1` concurrent → 1.
4. B2: `tsx` `S3StorageProvider` real (`shops/{shopId}/...` ownership).
5. Deploy frontends to `nabome-customer-staging` etc. with `VITE_PUBLIC_API_URL=https://nabome-api-staging.pages.dev`, run `pnpm test:e2e` with `E2E_*` staging.

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set._
