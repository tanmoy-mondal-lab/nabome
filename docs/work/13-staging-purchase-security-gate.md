# Step 13 — Staging Purchase & Security Gate

> **Date:** 2026-08-30
> **Branch:** `production`
> **Commit:** `0f5bfc0` (on `d6c3699` → `50ce666`)
> **Staging API:** `https://96d61d29.nabome-api-staging.pages.dev` / `https://nabome-api-staging.pages.dev` (`96d61d29` latest, `ec78d8f4` previous)
> **Previous:** `12-staging-database-purchase-acceptance.md` (auth 2/3, catalog 1/2)

## Database Topology

- **Prisma:** `6.19.3` `PrismaPg` with `pg.Pool({ connectionString })` singleton `let prisma`/`initialized`/`pool` via `initPrisma` in `functions/_middleware.ts:79` `hyperdriveCs ?? DATABASE_URL` — reused per Worker, no `$disconnect` per request
- **Hyperdrive:** `e2b5c6e7` `nabome-neon-db-v3` → `ep-calm-lab-ao9be2nh-pooler.c-2...` `neondb` `origin_connection_limit:20` `caching: {disabled:false}` (tested `disabled:true` → worse, `direct` without `-pooler` → 1/2)
- **DATABASE_URL:** `postgresql://neondb_owner:npg_...@ep-calm-lab-.../neondb?sslmode=require&channel_binding=require` (Neon pooler)
- **Prisma Pool:** `pg.Pool({ connectionString: databaseUrl })` default `max:10` (tested `max:5` → 3/5 register, `max:10` → 2/3, original `max:10` best for login 3/3)

## Purchase Flow

| Step                                            | Result                                                                                    | Evidence                                                                                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /products` guest                           | ✅ 200 1 product                                                                          | `curl` `https://nabome-api-staging.pages.dev/api/v1/products` → 200 `total:1` (was 0 before hyperdrive `ep-orange-fog`→`ep-calm-lab`)           |
| `GET /products` auth                            | ✅ 1/2 200 (was 0/1, now 1/2 after `_middleware` `needsSession` skip + `withTimeout` 10s) | `curl -b` with `directtest` on `a242d0a0`/`1a00ca37` → 200 (was 500 via Node)                                                                   |
| `POST /cart/items` without `x-csrf-token` → 403 | ✅                                                                                        | `POST /cart` without token → 403                                                                                                                |
| `POST /cart/items` with `variantId` `cb555...`  | ✅ 200 (was 404/422)                                                                      | `curl -b` with `directtest` on `e57549b4` → 200 `Unique constraint` on duplicate, `GET /cart` 200 `itemCount:1` after `addedAt`+`unitPrice` fix |
| `GET /cart`                                     | ✅ 200 `itemCount:0`→1                                                                    | `f640c404` `addedAt` fix → 200                                                                                                                  |
| `POST /checkout/start` with `cartId` UUID       | ✅ 200 `status: started` on `f465cf7d` (was 404, added `import './checkout/index.ts'`)    | `curl -b` with `directtest` `cartId: 00000000-...` → 200                                                                                        |
| `POST /checkout` address/shipping/coupon/totals | ⏭️ NOT TESTED                                                                             |                                                                                                                                                 |
| `POST /payments` Razorpay test                  | ⏭️                                                                                        | `PAYMENT_PROVIDER=razorpay` `rzp_test_...` present                                                                                              |
| `POST /payments/verify`                         | ⏭️                                                                                        |                                                                                                                                                 |
| `POST /webhooks` duplicate                      | ⏭️                                                                                        | code `WebhookEvent` unique `[provider,eventId]` exists, duplicate `case` fixed                                                                  |
| `GET /orders` state machine                     | ⏭️                                                                                        |                                                                                                                                                 |
| `GET /finance` ledger                           | ⏭️                                                                                        |                                                                                                                                                 |

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

| Category | Issue                                                                                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CODE     | `POST /auth/*` still 1/3 `INTERNAL_ERROR` `Database timeout` (Hyperdrive `origin_connection_limit` 20, `withTimeout` 10s still too short for cold start)                             |
| CODE     | Full purchase `checkout`→`payment`→`order`→`finance` not E2E                                                                                                                         |
| OWNER    | `staging-api.nabome.online` DNS, `CORS_ORIGINS` staging, Turnstile widget, `SENTRY_DSN`                                                                                              |
| INFRA    | Production `nabome-api` not created, staging `ENVIRONMENT=production` (project `nabome-api-staging` is staging, `wrangler.staging.jsonc` created but Pages `--config` not supported) |
| DEFERRED | Coupon TOCTOU, money MIN/MAX, tax                                                                                                                                                    |

_Production: NOT DEPLOYED, `CONFIRM_PRODUCTION` never set._
