# Step 11 — Staging Database and Purchase Gate

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `756bf16` (on `d6c3699` → `50ce666`)
> **Staging API:** `https://ec78d8f4.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`ec78d8f4` latest, `1a00ca37` previous)
> **Previous:** `10-staging-runtime-and-purchase-gate.md` (auth 2/3, catalog auth 200, cart 200)

## Prisma Lifecycle

- **Construction:** `prisma.ts` `let prisma: PrismaClient | null`, `let initialized`, `let pool: pg.Pool | null`, `initPrisma(databaseUrl, {viaHyperdrive})` checks `if (initialized) return prisma!` — singleton per Worker isolate, not per request
- **Reuse:** `getPrisma()` returns `prisma` if exists, else `process.env.DATABASE_URL` (for local) — for Workers, `prisma` already initialized via `functions/_middleware.ts:79` `initPrisma(hyperdriveCs ?? DATABASE_URL, {viaHyperdrive: Boolean(hyperdriveCs)})` for every request, but `initialized` prevents new client, so reused
- **Adapter:** `usePg = viaHyperdrive || isLocalConnectionString(databaseUrl)` → `PrismaPg` with `pg.Pool({ connectionString: databaseUrl })` for Hyperdrive (`postgres://` from `env.HYPERDRIVE.connectionString`), else `PrismaNeonHTTP` for Neon direct
- **Disconnect:** No `$disconnect()` per request (only `__resetPrismaForTests` and `seed.ts` `finally`), correct for Workers (no churn)
- **Proxy:** 8 files `const prisma = new Proxy({} as any, { get: (t,p)=> (getPrisma() as any)[p] })` lazy, `as unknown as PrismaClient` for typed, `as any` for untyped — `getPrisma()` at property access after `initPrisma`

## Hyperdrive

- **Prisma:** `prisma@6.19.3`, `@prisma/client@6.19.3`, `@prisma/adapter-pg@6.19.3`, `@prisma/adapter-neon@6.19.3`, `pg@8.23.0`, `wrangler@4.103.0`
- **ID:** `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb` `neondb_owner` `origin_connection_limit:20` `caching: {disabled:false}`
- **URL form:** `DATABASE_URL=postgresql://neondb_owner:npg_taOi8DkNG2KH@ep-calm-lab-.../neondb?sslmode=require&channel_binding=require` (Neon pooler, `sslmode`+`channel_binding`), Hyperdrive `connectionString` same (tested with and without `channel_binding`, both reachable via `nc -zv`)
- **Mode:** Hyperdrive-managed origin connection (`postgres://` via `pg.Pool`), not `Neon` direct `pooler` + `Hyperdrive` double pool — `viaHyperdrive` true → `PrismaPg` with `pg.Pool`, not `PrismaNeonHTTP`
- **Intended path:** `Pages Functions` → `Hyperdrive` (`postgres://` pool) → `Neon` `ep-calm-lab` (staging), `DATABASE_URL` direct is same Neon but via `Hyperdrive` for Workers, local uses `postgres://nabome:nabome@localhost:5432/nabome`

## Root Cause (Intermittent `Database timeout` / Worker hung)

- **Before:** `GET /products` with `access_token` → 500 Worker hung `wallTime 1095` `outcome: exception` "Worker hung" for `prisma.session.findFirst` without timeout hung for every auth `GET` (Hyperdrive cold start >2s), `try/catch` doesn't catch hanging `Promise`, `Turnstile`/`Resend` `fetch` without `AbortSignal` also hung
- **Fix:** `functions/_middleware.ts` `prisma.session.findFirst` now `needsSession` check (`isMutation` or `/auth/` or `/cart` or `/checkout` or `/orders`) else skip, and `withTimeout` 2s→10s `Promise.race` `catch(()=>null)` best-effort, `turnstile.ts`/`email/service.ts` `fetch` with `AbortSignal.timeout(10000)`, `auth/services-v1.ts` `prisma` in `register`/`login` with `withTimeout` 10s
- **After:** `POST /auth/login` `directtest` 3× via `curl` on `ec78d8f4` → 2/3 200 `session.id` (was 1/3 Worker hung, now 2/3 `INTERNAL_ERROR` `Database timeout` not Worker hung), on `3200aedd` → 3/3, `GET /products` guest 200, `GET /products` with `Cookie: access_token` via `curl -b` on `a242d0a0`/`1a00ca37` → 200 (was 500), `GET /cart` 200 (was 500 `createdAt`), `POST /cart/items` 200 (was 404/422)
- **Remaining 1/3 `INTERNAL_ERROR` `Database timeout`:** `withTimeout` rejects after 10s due to `prisma` still hanging (Hyperdrive cold start), but now returns controlled `INTERNAL_ERROR` not Worker hung 1101 — progress, but not 3/3. `Promise.race` does **not** cancel underlying `prisma` — it continues and can accumulate, `origin_connection_limit:20` not exhausted by 3 concurrent (3×3 queries), but Neon's `pooler` + `Hyperdrive` double pool may cause contention. Increasing `withTimeout` 2s→10s helped from 1/3 to 2/3, but spec says **DO NOT increase again** without fixing connection — need to avoid unnecessary `prisma` (already for `GET /products` guest/auth `needsSession` false) and ensure `prisma` not hanging (Hyperdrive `caching` or Neon `pooler` vs `direct`).

## Authentication Stability (after `ec78d8f4` 10s)

- `POST /auth/login` `directtest` 3× via `curl` on `ec78d8f4` → 2/3 200 (was 1/3), on `3200aedd` → 3/3
- `POST /auth/register` 3× on `ec78d8f4` → 2/3 200 (was 1/3), 1/3 `INTERNAL_ERROR` `Database timeout`
- `GET /products` guest → 200 1 product, `GET /products` with `Cookie: access_token` → 200 (was 500)

## Purchase Flow

| Step                                            | Result                                                                                 | Evidence                                                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `GET /products` guest                           | ✅ 200 1 product                                                                       | `curl` `https://nabome-api-staging.pages.dev/api/v1/products` → 200                                             |
| `GET /products` auth                            | ✅ 200 (was 500)                                                                       | `curl -b` with `directtest` → 200 after #1                                                                      |
| `POST /cart/items` without `x-csrf-token` → 403 | ✅                                                                                     | `POST /cart` without token → 403                                                                                |
| `POST /cart/items` with `variantId` `cb555...`  | ✅ 200 (was 404/422)                                                                   | `curl -b` with `directtest` on `e57549b4` → 200 `Unique constraint` on duplicate, `GET /cart` 200 `itemCount:1` |
| `GET /cart`                                     | ✅ 200 `itemCount:0`→1                                                                 | `f640c404` `addedAt` fix → 200                                                                                  |
| `POST /checkout/start` with `cartId` UUID       | ✅ 200 `status: started` on `f465cf7d` (was 404, added `import './checkout/index.ts'`) | `curl -b` with `directtest` `cartId: 00000000-...` → 200                                                        |
| `POST /checkout` address/shipping/coupon/totals | ⏭️ NOT TESTED                                                                          |                                                                                                                 |
| `POST /payments` Razorpay test                  | ⏭️                                                                                     | `PAYMENT_PROVIDER=razorpay` `rzp_test_...` present                                                              |
| `POST /payments/verify`                         | ⏭️                                                                                     |                                                                                                                 |
| `POST /webhooks` duplicate                      | ⏭️                                                                                     | code `WebhookEvent` unique `[provider,eventId]` exists, duplicate `case` fixed                                  |
| `GET /orders` state machine                     | ⏭️                                                                                     |                                                                                                                 |
| `GET /finance` ledger                           | ⏭️                                                                                     |                                                                                                                 |

## Security

| Test                     | Result                                          |
| ------------------------ | ----------------------------------------------- |
| CSRF without token → 403 | ✅                                              |
| CSRF with token → 200    | ✅ `POST /cart/items` with `x-csrf-token` → 200 |
| RBAC/IDOR/tenant         | ⏭️ NOT TESTED                                   |

## B2

| Test        | Result                                          |
| ----------- | ----------------------------------------------- |
| Config      | ✅ `STORAGE_*` present                          |
| Real upload | ⏭️ NOT TESTED (needs `tsx` `S3StorageProvider`) |

## Frontend & E2E

| Item                        | Result          |
| --------------------------- | --------------- |
| Customer/Admin/Shop staging | ❌ NOT DEPLOYED |
| `pnpm test:e2e`             | ⏭️ NOT RUN      |

## Remaining Blockers

| Category | Issue                                                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CODE     | `POST /auth/*` still 1/3 `INTERNAL_ERROR` `Database timeout` (Hyperdrive `origin_connection_limit` 20, `withTimeout` 10s still too short for cold start, underlying `prisma` not canceled) |
| CODE     | Full purchase `checkout`→`payment`→`order`→`finance` not E2E                                                                                                                               |
| OWNER    | `staging-api.nabome.online` DNS, `CORS_ORIGINS` staging, Turnstile widget, `SENTRY_DSN`                                                                                                    |
| INFRA    | Production `nabome-api` not created, staging `ENVIRONMENT=production` (project `nabome-api-staging` is staging, `wrangler.staging.jsonc` created but Pages `--config` not supported)       |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                          |

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set._
