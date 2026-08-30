# Step 14 — First Staging Transaction

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `c619845` + `756bf16` + `50ce666` + `d6c3699` + `fd0af77` → `c0a0fb17` deployed
> **Staging API:** `https://c0a0fb17.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`c0a0fb17` latest, `a242d0a0` previous)
> **Previous:** `13-staging-purchase-security-gate.md` PARTIAL

## Purchase Transaction

| Step                                                              | Result                                                                                                                                                                    | Evidence                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/register` new user                                    | ✅ 2/3 (was 1/3)                                                                                                                                                          | `c0a0fb17` `1a00ca37` `ec78d8f4` `96d61d29` all 2/3 200 `requiresEmailVerification:true` (1/3 `INTERNAL_ERROR` `Database timeout` — `prisma` without timeout hung, now `withTimeout` 10s → `INTERNAL_ERROR` not Worker hung)                              |
| `POST /auth/login` `directtest`                                   | ⚠️ 2/3 (was 1/3) via `curl` on `ec78d8f4` 2/3, on `96d61d29` 3/3, on `c0a0fb17` via `curl` 0/1 `INTERNAL_ERROR` but via Node `fetch` 1/3, via `curl` with `tail` warm 3/3 | `directtest` `TestPass123!` `XXXX.DUMMY.TOKEN.XXXX` → 200 `session.id` when warm, 500 `INTERNAL_ERROR` when cold (Hyperdrive cold start)                                                                                                                  |
| `GET /products` guest                                             | ✅ 200 1 product                                                                                                                                                          | `curl` `https://nabome-api-staging.pages.dev/api/v1/products` → 200 `total:1` `Signature Bronze Necklace` (was 0 before hyperdrive `ep-orange-fog`→`ep-calm-lab`)                                                                                         |
| `GET /products` with `Cookie: access_token`                       | ✅ 200 (was 500)                                                                                                                                                          | `curl -b` with `directtest` on `a242d0a0`/`1a00ca37`/`c0a0fb17` → 200 (was 500 via Node `fetch` on alias `https://nabome-api-staging.pages.dev` with `directtest` → 500 Worker hung, now 200 after `_middleware` `needsSession` skip + `withTimeout` 10s) |
| `POST /cart/items` with `variantId` `cb555...` and `x-csrf-token` | ✅ 200 (was 404/422)                                                                                                                                                      | `curl -b` with `directtest` on `e57549b4` → 200 `Unique constraint` on duplicate, `GET /cart` 200 `itemCount:1` after `addedAt`+`unitPrice`+`validateVariant` fix                                                                                         |
| `GET /cart`                                                       | ✅ 200 `itemCount:0`→1                                                                                                                                                    | `f640c404` `addedAt` fix → 200                                                                                                                                                                                                                            |
| `POST /checkout/start` with `cartId` UUID                         | ✅ 200 `status: started` on `f465cf7d` (was 404, added `import './checkout/index.ts'`)                                                                                    | `curl -b` with `directtest` `cartId: 00000000-...` → 200                                                                                                                                                                                                  |
| `POST /checkout` address/shipping/coupon/totals                   | ⏭️ NOT TESTED                                                                                                                                                             |                                                                                                                                                                                                                                                           |
| `POST /payments` Razorpay test                                    | ⏭️                                                                                                                                                                        | `PAYMENT_PROVIDER=razorpay` `rzp_test_...` present                                                                                                                                                                                                        |
| `POST /payments/verify`                                           | ⏭️                                                                                                                                                                        |                                                                                                                                                                                                                                                           |
| `POST /webhooks` duplicate                                        | ⏭️                                                                                                                                                                        | code `WebhookEvent` unique `[provider,eventId]` exists, duplicate `case` fixed                                                                                                                                                                            |
| `GET /orders` state machine                                       | ⏭️                                                                                                                                                                        |                                                                                                                                                                                                                                                           |
| `GET /finance` ledger                                             | ⏭️                                                                                                                                                                        |                                                                                                                                                                                                                                                           |

**Fixes for transaction:**

- `functions/_middleware.ts` `prisma.session.findFirst` now `needsSession` check (`isMutation` or `/auth/` or `/cart` or `/checkout` or `/orders`) else skip, and `withTimeout` 2s→10s `Promise.race`
- `turnstile.ts`/`email/service.ts` `fetch` with `AbortSignal.timeout(10000)` (was 5000)
- `auth/services-v1.ts` `prisma` in `register`/`login` with `withTimeout` 10s
- `cart/repository.ts` `createdAt`→`addedAt`, `validateVariantAvailability` `productVariant.findUnique`, `addItem` `unitPrice`/`lineTotal`
- `handlers/index.ts` add `import './checkout/index.ts'` → `POST /checkout/start` now 200
- `RESEND_FROM_EMAIL` staging `noreply@nabome.online` → `onboarding@resend.dev` + `appUrl` fix (`context.env.APP_URL`)
- `wrangler.staging.jsonc` created (`ENVIRONMENT=staging`) but Pages `--config` not supported, `ENVIRONMENT` still `production` on `nabome-api-staging` (project `nabome-api-staging` is staging, var is production)

## Security

| Test                     | Result                                          |
| ------------------------ | ----------------------------------------------- |
| CSRF without token → 403 | ✅ `POST /cart` without `x-csrf-token` → 403    |
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

## Node vs Curl Diagnostic

- **Same URL, method, body, Cookie, x-csrf-token, Origin, Content-Type, Accept, User-Agent (`test-agent`) on `b3563817`:** `curl -H "Cookie: access_token=..." -H "User-Agent: test-agent" -H "Accept: application/json" https://b3563817.../api/v1/products` → 200, Node `fetch` with `headers: { 'Cookie': same, 'User-Agent': 'test-agent', 'Accept': 'application/json' }` on same `b3563817` → 500 Worker hung (before #1) / 200 after #1 (with `needsSession` skip and `withTimeout` 10s, now Node `fetch` on `a242d0a0` with `directtest` → 200 when warm, 500 when cold)
- **Alias vs deployment URL:** `https://nabome-api-staging.pages.dev/api/v1/products` (alias → `a242d0a0` or `1a00ca37` or `c0a0fb17`) vs `https://a242d0a0.../api/v1/products` (specific) — same, both 200 for guest, 500 for auth before fix, now 200 for both after fix when warm
- **Conclusion:** Not a request formatting difference, but a **Hyperdrive/Prisma cold start** + `prisma.session.findFirst` without timeout hung for every auth `GET`, `try/catch` doesn't catch hanging `Promise`, `Promise.race` with timeout now returns `INTERNAL_ERROR` not Worker hung, but still 1/3 failure due to underlying `prisma` still hanging (Hyperdrive `origin_connection_limit` 20, `pg.Pool` default `max:10` per isolate, `caching` enabled, `pooler` vs `direct` tested, `channel_binding` tested)

## Remaining Blockers

| Category | Issue                                                                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CODE     | `POST /auth/*` still 1/3 `INTERNAL_ERROR` `Database timeout` (Hyperdrive cold start, `Promise.race` doesn't cancel underlying `prisma`, need `prisma` connection pooling fix or `Neon` `pooler` vs `direct` + `Hyperdrive` `caching`) |
| CODE     | Full purchase `checkout`→`payment`→`order`→`finance` not E2E                                                                                                                                                                          |
| OWNER    | `staging-api.nabome.online` DNS, `CORS_ORIGINS` staging, Turnstile widget, `SENTRY_DSN`                                                                                                                                               |
| INFRA    | Production `nabome-api` not created, staging `ENVIRONMENT=production` (project `nabome-api-staging` is staging, `wrangler.staging.jsonc` created but Pages `--config` not supported)                                                  |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                                                                     |

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set._
