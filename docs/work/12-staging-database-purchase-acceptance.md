# Step 12 — Staging Database and Purchase Acceptance

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `c619845` (on `756bf16` → `fd0af77` → `5a31b36`)
> **Staging API:** `https://96d61d29.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`96d61d29` latest, `a242d0a0` previous)
> **Previous:** `11-staging-database-and-purchase-gate.md` (auth 2/3 `INTERNAL_ERROR`, catalog 1/2)

## Database Topology

- **Prisma:** `6.19.3` `PrismaPg` with `pg.Pool({ connectionString: databaseUrl })` singleton `let prisma`/`initialized`/`pool` via `initPrisma` in `functions/_middleware.ts:79` `hyperdriveCs ?? DATABASE_URL` — reused per Worker, no `$disconnect` per request
- **Hyperdrive:** `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb` `neondb_owner` `origin_connection_limit:20` `caching: {disabled:false}` (tested `disabled:true` → worse, `direct` without `-pooler` → 1/2, `pooler` → 2/3)
- **DATABASE_URL:** `postgresql://neondb_owner:npg_...@ep-calm-lab-.../neondb?sslmode=require&channel_binding=require` (Neon pooler, `sslmode`+`channel_binding`), Hyperdrive `connectionString` same (tested without `channel_binding` → 500 for `GET /products` guest)
- **Intended path:** `Pages Functions` → `Hyperdrive` (`postgres://` pool) → `Neon` `ep-calm-lab` (staging), `DATABASE_URL` direct same Neon but via `Hyperdrive` for Workers

## Prisma Configuration

- **Version:** `prisma@6.19.3` `@prisma/client@6.19.3` `@prisma/adapter-pg@6.19.3` `pg@8.23.0`
- **Pool:** `pg.Pool({ connectionString: databaseUrl })` default `max:10` `min:0` `idleTimeoutMillis:30000` `connectionTimeoutMillis:0` (no explicit `max` in `prisma.ts` except staging experiment `max:5` → 3/5 register, `max:10` → 2/3 register, `max:10` with `caching` enabled best)
- **Adapter:** `PrismaPg(pool)` for `viaHyperdrive` or `isLocalConnectionString`, else `PrismaNeonHTTP` for Neon direct

## Hyperdrive Findings

| Config                                                             | Register 3 | Login 3                              | `GET /products` auth 5      | Notes                       |
| ------------------------------------------------------------------ | ---------- | ------------------------------------ | --------------------------- | --------------------------- |
| Original `pooler` `max:10` `caching: false→true` `channel_binding` | 2/3        | 3/3 on `3200aedd`, 2/3 on `ec78d8f4` | 2/5 on `1a00ca37`           | Baseline, best              |
| `max:5` `pooler` `caching: false→true`                             | 3/5        | 4/5                                  | 2/5 on `e72c6db0`           | Slightly worse for register |
| `max:5` `pooler` `caching: true→false` (`disabled:true`)           | 1/3        | 1/3                                  | —                           | Worse                       |
| `direct` without `-pooler` `max:10` `caching: false`               | 2/2        | 1/2                                  | —                           | Similar                     |
| `96d61d29` `pooler` `max:10` `caching: false→true` (reverted)      | 2/3        | 3/3                                  | 1/2 (first 500, second 200) | Best for login              |

**Selected:** Original `pooler` `max:10` `caching: {disabled:false}` with `channel_binding` (Neon pooler, `sslmode`+`channel_binding`) — `96d61d29` 2/3 register, 3/3 login, `GET /products` guest 1/1, `GET /products` with auth 1/2 (was 0/1 before `withTimeout`).

## Neon Findings

- **Endpoint:** `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb` (staging), `origin: ep-calm-lab...` in Hyperdrive, `DATABASE_URL` same, `nc -zv` reachable, `prisma migrate deploy` 2/2, `Hyperdrive` `origin: ep-calm-lab-...` (tested `ep-orange-fog...` → 500 for `GET /products` guest)
- **Health:** `Neon` `pooler` vs `direct` tested, `pooler` better for `GET /products` guest (200 vs 500), `Hyperdrive` `caching` enabled better for `register` (2/3 vs 1/3 when disabled)

## Authentication Stability (after `96d61d29` `withTimeout` 10s)

- `POST /auth/register` 3× on `96d61d29` → 2/3 200 `requiresEmailVerification:true` (was 1/3 Worker hung, now `INTERNAL_ERROR` `Database timeout` 1/3)
- `POST /auth/login` `directtest` 3× on `96d61d29` → 3/3 200 `session.id` (was 1/3 Worker hung, now 3/3)
- `GET /products` guest → 200 1 product (was 0 before hyperdrive `ep-orange-fog`→`ep-calm-lab`, now 1)
- `GET /products` with `Cookie: access_token` → 1/2 200 (was 0/1 500, now 1/2 after `needsSession` skip and `withTimeout` 10s)

## Purchase Flow

| Step                                            | Result                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| `GET /products` guest                           | ✅ 200 1 product                                                 |
| `GET /products` auth                            | ✅ 1/2 200 (was 0/1, now 1/2 after #1)                           |
| `POST /cart/items` without `x-csrf-token` → 403 | ✅                                                               |
| `POST /cart/items` with `variantId` `cb555...`  | ✅ 200 (was 404/422, now 200 with `addedAt`+`unitPrice` fix)     |
| `GET /cart`                                     | ✅ 200 `itemCount:0`→1                                           |
| `POST /checkout/start` with `cartId` UUID       | ✅ 200 `status: started` on `f465cf7d` (was 404, added `import`) |
| `POST /checkout` address/shipping/coupon/totals | ⏭️ NOT TESTED                                                    |
| `POST /payments` Razorpay test                  | ⏭️                                                               |
| `POST /payments/verify`                         | ⏭️                                                               |
| `POST /webhooks` duplicate                      | ⏭️ (code `WebhookEvent` unique)                                  |
| `GET /orders` state machine                     | ⏭️                                                               |
| `GET /finance` ledger                           | ⏭️                                                               |

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

| Category | Issue                                                                                                                                                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CODE     | `POST /auth/*` still 1/3 `INTERNAL_ERROR` `Database timeout` (Hyperdrive `origin_connection_limit` 20, `withTimeout` 10s still too short for cold start, `Promise.race` doesn't cancel) |
| CODE     | Full purchase `checkout`→`payment`→`order`→`finance` not E2E                                                                                                                            |
| OWNER    | `staging-api.nabome.online` DNS, `CORS_ORIGINS` staging, Turnstile widget, `SENTRY_DSN`                                                                                                 |
| INFRA    | Production `nabome-api` not created, staging `ENVIRONMENT=production` (project `nabome-api-staging` is staging, `wrangler.staging.jsonc` created but Pages `--config` not supported)    |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                       |

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set._
