# Step 10 — Staging Runtime and Purchase Gate

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `5a31b36` + `b5867cf` + `50ce666` + `d6c3699` + `fd0af77` (cart, checkout, middleware, turnstile, email) → `85d8e512`/`1a00ca37`/`ec78d8f4`/`aa81de6e` deployed
> **Staging API:** `https://nabome-api-staging.pages.dev` (alias, `85d8e512` latest) / `https://1a00ca37...` / `https://ec78d8f4...`
> **Previous:** `09-staging-purchase-gate.md` PARTIAL (auth 1/3, catalog guest PASS/with-auth 500, cart partial)

## Prisma Lifecycle

- **Before:** `const prisma = getPrisma() as any` at module top-level for 8 files (`cart/repository`, `order/service`, `products/repository`, `admin/service`, `settings/service`, `shipping/service`, `checkout/repository`, `returns/service`) → `getPrisma()` called at import before `initPrisma` in `functions/_middleware.ts:79` → `Error: Prisma not initialized` at Functions bundle publish (seen in `wrangler pages deploy` for `47f3b1a9`)
- **Fix:** `const prisma = new Proxy({} as any, { get: (t,p)=> (getPrisma() as any)[p] })` lazy, `as unknown as PrismaClient` for typed files (`order/service`, `admin/service`) — `getPrisma()` now called at property access after `initPrisma`
- **Reuse:** `let prisma: PrismaClient | null`, `let initialized`, `let pool: pg.Pool | null` in `prisma.ts`, `initPrisma` checks `if (initialized) return prisma!` → singleton per Worker isolate, not per request
- **Disconnect:** No `$disconnect()` per request (checked via `grep -rn "\$disconnect"` — only in `__resetPrismaForTests` and `seed.ts` `finally`), correct for Workers (no per-request disconnect causing churn)

## Hyperdrive

- **ID:** `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab-ao9be2nh-pooler.c-2...` (was `ep-orange-fog...`, updated to `ep-calm-lab...` to match `DATABASE_URL` `postgresql://neondb_owner:npg_taOi8DkNG2KH@ep-calm-lab-.../neondb?sslmode=require&channel_binding=require`)
- **Config:** `origin_connection_limit: 20`, `caching: {disabled:false}`, `scheme: postgresql`, `database: neondb`, `user: neondb_owner`
- **Connection string:** `DATABASE_URL` includes `?sslmode=require&channel_binding=require` for Neon, Hyperdrive was updated with clean URL without `channel_binding` then reverted to original with `channel_binding` (both tested, `ep-calm-lab` reachable via `nc -zv` on 5432)
- **Prisma mode:** `usePg = viaHyperdrive || isLocalConnectionString(databaseUrl)` → `PrismaPg` with `pg.Pool({ connectionString: databaseUrl })` for Hyperdrive (correct per `prisma.ts:22-28`), else `PrismaNeonHTTP`
- **Pressure:** `origin_connection_limit: 20` not exhausted by 3 concurrent logins (3×3 queries), but `prisma.session.findFirst` for every auth `GET` (including `GET /products` with `access_token`) caused 1 extra `prisma` per auth request, plus `Turnstile` `fetch` without timeout hung, causing `wallTime 1095` `outcome: exception` "Worker hung"

## Middleware Database Access

- **Before:** `if (!sessionId) { const prisma = getPrisma(); const session = await prisma.session.findFirst(...) }` for every auth `GET` (including `GET /products` with `access_token`), no timeout, `try/catch` doesn't catch hanging `Promise`
- **Fix:** `const needsSession = isMutation || pathname.includes('/auth/') || pathname.includes('/cart') || pathname.includes('/checkout') || pathname.includes('/orders')` — skip for `GET /products` (guest or auth `GET` not needing `sessionId`), and `withTimeout` 2s → 5s → 10s `Promise.race` with `catch(()=>null)` best-effort, plus `AbortSignal.timeout(10000)` for `Turnstile`/`Resend` `fetch`
- **After:** `GET /products` guest 200 (was 500 via Node `fetch` with `Cookie: access_token` on `1a00ca37`), `GET /products` with `Cookie: access_token` via `curl -b` on `a242d0a0`/`1a00ca37` → 200 (was 500), `POST /auth/login` via `curl` 3× on `3200aedd` 3/3 200 (was 1/3), on `ec78d8f4` 2/3 200 (was 1/3), on `85d8e512` alias 2/3 200 (was 1/3)

## Deployed

| Item       | Value                                                                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API        | `https://85d8e512.nabome-api-staging.pages.dev` (`d6c3699` `withTimeout` 10s) / `https://1a00ca37...` / `https://ec78d8f4...` (`50ce666` + `withTimeout` 10s) — `pnpm build:api` copy 145 files |
| Frontend   | NOT DEPLOYED                                                                                                                                                                                    |
| Database   | `ep-calm-lab...` `neondb` — `migrate deploy` 2/2, seed 1 product (`cb555...`), `variant` `NBN-LNK-BRZ-001` `isActive:true` `availableStock:25`                                                  |
| Hyperdrive | `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab...` (both with and without `channel_binding` tested)                                                                                              |
| KV         | `6969b...` prod, `2db98...` staging                                                                                                                                                             |
| B2         | `STORAGE_*` ×6, mock 18 PASS                                                                                                                                                                    |

## Auth Stability (after `ec78d8f4` 10s)

- `POST /auth/login` `directtest` 3× via `curl` on `ec78d8f4` → 2/3 200 `session.id` (was 1/3), on `3200aedd` → 3/3
- `POST /auth/register` 3× on `ec78d8f4` → 2/3 200 (was 1/3), 1/3 `INTERNAL_ERROR` `Database timeout` (was 1101 Worker hung, now controlled JSON)
- `GET /products` guest via `curl` → 200 1 product (was 0 before hyperdrive `ep-orange-fog`→`ep-calm-lab`, now 1)
- `GET /products` with `Cookie: access_token` via `curl -b` on `a242d0a0`/`1a00ca37` → 200 (was 500 via Node `fetch` on alias, now 200 after #1)
- `POST /auth/*` with `tail` running → 1/1 200 (warm Worker, then 2/3 without tail)

**Remaining 1/3 `INTERNAL_ERROR` `Database timeout` is `withTimeout` rejecting after 10s due to `prisma` still hanging (Hyperdrive cold start), but now returns controlled `INTERNAL_ERROR` not Worker hung 1101 — progress, but not 3/3.

## Purchase Flow

| Step                                                              | Result                                                                                          | Evidence                                                                                                                                                           |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /products` guest                                             | ✅ 200 1 product                                                                                | `curl` `https://nabome-api-staging.pages.dev/api/v1/products` → 200                                                                                                |
| `GET /products` auth                                              | ✅ 200 (was 500)                                                                                | `curl -b` with `directtest` → 200 after #1                                                                                                                         |
| `POST /cart/items` without `x-csrf-token` → 403                   | ✅                                                                                              | `POST /cart` without token → 403                                                                                                                                   |
| `POST /cart/items` with `variantId` `cb555...` and `x-csrf-token` | ✅ 200 (was 404/422)                                                                            | `curl -b` with `directtest` on `e57549b4` → 200 `Unique constraint` on duplicate, `GET /cart` → 200 `itemCount:1` `unitPrice:2499` after `addedAt`+`unitPrice` fix |
| `GET /cart`                                                       | ✅ 200 `itemCount:0`→1                                                                          | `f640c404` `addedAt` fix → 200 (was 500 `createdAt`)                                                                                                               |
| `POST /checkout/start` with `cartId` UUID                         | ✅ 200 `status: started` on `f465cf7d` (was 404 before `import './checkout/index.ts'`, now 200) | `curl -b` with `directtest` `cartId: 00000000-...-000000000001` → 200                                                                                              |
| `POST /checkout` address/shipping/coupon/totals                   | ⏭️ NOT TESTED                                                                                   |                                                                                                                                                                    |
| `POST /payments` Razorpay test                                    | ⏭️                                                                                              | `PAYMENT_PROVIDER=razorpay` `rzp_test_...` present, `resolveGateway` not mock                                                                                      |
| `POST /payments/verify`                                           | ⏭️                                                                                              |                                                                                                                                                                    |
| `POST /webhooks` duplicate                                        | ⏭️                                                                                              | code `WebhookEvent` unique `[provider,eventId]` exists, duplicate `case` fixed                                                                                     |
| `GET /orders` state machine                                       | ⏭️                                                                                              |                                                                                                                                                                    |
| `GET /finance` ledger                                             | ⏭️                                                                                              |                                                                                                                                                                    |

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

## Remaining Blockers

| Category | Issue                                                                                                                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CODE     | `POST /auth/*` still 1/3 `INTERNAL_ERROR` `Database timeout` (Hyperdrive `origin_connection_limit` 20, `withTimeout` 10s still too short for cold start, underlying `prisma` not canceled by `Promise.race`) — need `prisma` connection pooling fix or `Hyperdrive` `caching` or `Neon` `pooler` vs `direct` |
| CODE     | Full purchase `checkout`→`payment`→`order`→`finance` not E2E                                                                                                                                                                                                                                                 |
| OWNER    | `staging-api.nabome.online` DNS, `CORS_ORIGINS` staging, Turnstile widget for staging, `SENTRY_DSN`                                                                                                                                                                                                          |
| INFRA    | Production `nabome-api` not created, staging `ENVIRONMENT=production` (project `nabome-api-staging` is staging, `wrangler.staging.jsonc` created but Pages `--config` not supported)                                                                                                                         |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                                                                                                                                            |

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set._
