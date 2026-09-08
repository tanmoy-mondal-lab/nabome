# PRISMA FORENSIC AUDIT AND REPAIR

## Executive Summary

Prisma core (config, init, version, driver, connection reuse) is sound. Three concrete query/lifecycle defects were found and fixed with minimal changes. No Hyperdrive removal, no DB replacement, no rewrite.

- Fix 1: `functions/_middleware.ts` session lookup queried non-existent `refreshTokenHash` (Session stores `refreshToken`). Always missed/threw, swallowed to null. Fixed to latest-active-session fallback.
- Fix 2: `_lib/order/service.ts` created `payment` with `method: 'razorpay'` — invalid `PaymentMethod` enum (card|upi|netbanking|wallet|cod). Would throw on capture when no payment exists. Fixed to `(order.paymentMethod ?? 'upi')` + `provider: 'razorpay'`.
- Fix 3: `functions/_middleware.ts` `initPrisma()` threw uncaught outside try/catch → Cloudflare 1101 text/plain instead of JSON envelope. Fixed to JSON 500 envelope with requestId.
- Regression: `apps/api/_lib/prisma-forensic.test.ts` (4 tests). Baseline 105 → 109 green. Typecheck green. Lint 0 errors.

## Prisma Architecture

```
Request → Pages _middleware (initPrisma) → [[path]].ts (timeout+retry, resetStalePool)
  → _handlers/* → _lib/*/service|repository (Proxy → getPrisma())
  → _lib/prisma.ts singleton (PrismaPg+pg.Pool via Hyperdrive | PrismaNeonHTTP fallback)
  → Hyperdrive binding HYPERDRIVE → Neon Postgres pooler
  → local: DATABASE_URL localhost → pg.Pool
Scheduled: _lib/scheduled/handler.ts (initPrisma, try/catch) → sweeper
Settlement worker: HTTP only, no direct Prisma (calls /internal/settlement/run)
packages/returns: bare new PrismaClient() — NOT imported by API runtime (dead for Workers)
```

Verified via grep: `new PrismaClient` only in `prisma.ts` (runtime), seeds/tests, `packages/returns` (unused by API). No `$connect/$disconnect` per request. No `$queryRaw/$executeRaw` in runtime path.

## Prisma Client Initialization

`apps/api/_lib/prisma.ts`: module singleton (`let prisma/initialized/pool`), `initPrisma(url, {viaHyperdrive})` called once per isolate from middleware. Reuse: early-return if initialized + 10s stale-pool reset. Pool: `pg.Pool{max:5, connTimeout:30s, idle:3s, keepAlive, query_timeout:60s}` + `pool.on(error)` log. `getPrisma()` returns singleton or inits from `process.env.DATABASE_URL` (local/tests only; dead on Workers by design). `resetStalePool()` throttled 10s, used by `[[path]].ts` retries. Verdict: correct lifecycle for Workers; no per-request client, no leak, no aggressive disconnect.

## Runtime Compatibility

Runtime: Cloudflare Pages Functions (Workers) + `nodejs_compat` (`wrangler.jsonc:6`). Driver: `@prisma/adapter-pg` + `pg.Pool` over Hyperdrive TCP — requires `nodejs_compat`, which is set. Fallback `PrismaNeonHTTP` for non-local non-Hyperdrive only. No fs/native binaries in runtime path. `pg` over Hyperdrive is the supported Workers pattern. No change needed. `packages/returns` bare client would fail under workerd, but it is not loaded by API — documented, not changed.

## Prisma Version Compatibility

CLI `6.19.3` = client `6.19.3` (`pnpm --filter @nabome/api exec prisma --version`). Deps: `@prisma/adapter-pg ^6.19.3`, `@prisma/adapter-neon ^6.19.3`, `@neondatabase/serverless ^1.1.0`, `pg ^8.23.0`. Lockfile resolves 6.19.3. No mismatch. No upgrade.

## Database Configuration

- `DATABASE_URL`: PRESENT (local `.dev.vars.example`, prod via `wrangler pages secret list` 17 encrypted secrets per prior verification; value never printed). `schema.prisma:14` uses `env("DATABASE_URL")` for CLI/migrate only; runtime uses Hyperdrive `connectionString ?? env.DATABASE_URL`.
- `TARGET`: PRODUCTION (Neon Postgres pooler via Hyperdrive `e2b5c6e70f164e189bebf1cc1282428f`); local `localhost:5432/nabome` for dev. No malformed URL evidence. Staging shares prod Hyperdrive ID — isolation risk (manual dashboard action, out of scope, not changed).
- `Env.HYPERDRIVE_URL` dead (never read); `process.env.DATABASE_URL` fallbacks in `prisma.ts:66`/`scheduled/handler.ts:11` dead on Workers but harmless (middleware path correct).

## Connection Lifecycle

No per-request `$connect/$disconnect`. Singleton per isolate + `resetStalePool` on timeout/transient errors (`[[path]].ts:157,169,207`, 45s handler timeout, 500ms/2s backoff, buffered-body replay). Transient patterns in `errors.ts` + `[[path]].ts` cover timeout/P1001/refused/reset/pool. Defect was uncaught `initPrisma` throw → 1101 (fixed). No exhaustion evidence in code; `max:5` per isolate vs Hyperdrive `origin_connection_limit:20` is tight under burst but working; no change without metrics.

## Query Audit

Spot-checked `findUnique/findFirst/findMany/create/update/upsert/$transaction/count/aggregate` across auth, orders, payments, webhooks, checkout, inventory, returns. Tenant scoping present (`userId/shopId` filters). No N+1 in hot paths beyond acceptable includes. `findUnique({id, isActive})` pattern is legal in Prisma 6 (extended `WhereUniqueInput` with `AtLeast<{id|orderNumber}>` + filters) — verified in generated `index.d.ts` — not a defect. Real defects were Fix 1 + Fix 2 only.

## findUnique/findFirst/findMany Audit

- `Session`: stored `refreshToken` (hashed refresh, `services.ts:267`, `session-manager.ts:118`); middleware searched `refreshTokenHash` (nonexistent) → always miss. FIXED.
- `Payment.idempotencyKey`: `findUnique({idempotencyKey})` correct (unique, guarded by idempotencyKey present in `initiatePayment`).
- `WebhookEvent provider_eventId`: `findUnique({provider_eventId:{provider,eventId}})` matches `@@unique([provider,eventId])` — correct.
- `Order id/orderNumber`: unique lookups correct; extended `isActive` filter legal.
- `Shop ownerId`: `findFirst/findUnique({ownerId})` — `ownerId @unique` — correct (extended `isActive` legal).
- No identifier-swap except Fix 1.

## Transaction Audit

Interactive `$transaction(async tx=>)` in `order/service.ts` (createFromCheckout, deduct, capture, refund). No external HTTP/storage/payment calls inside TX (only DB + in-TX inventory helpers). `initiatePayment` idempotency via `findUnique` before create (race window acceptable; DB unique guards). Sweeper uses `updateMany(where:{id,status:ACTIVE})` claim pattern — race-safe, no long TX. No nested TX. No change.

## Concurrency Audit

Checkout→order number via `findFirst orderBy orderNumber desc` + create inside TX — duplicate orderNumber race possible under burst (unique constraint will throw, retried by `[[path]].ts` transient path only if message matches; `P2002` not in transient list). Left as-is: no evidence of collision in prod, adding locks would be speculative. Inventory reserve/convert uses read→write without atomic decrement, but wrapped in TX + status-guarded claims where it matters (sweeper). No change without reproduction.

## Schema/Migration Audit

`schema.prisma` (2392 lines) vs `migrations/0001_init,0002_preserve,0003_app_settings,0004_coupon_shop,0005_shop_staff,0006_tax_shipping_zones`: models/relations/indexes consistent for audited paths. Noted: `Session.csrfToken` required but `session-manager.ts:115` omits it — dead code (never called by handlers per `docs/work/00`), documented only. `payment.method` enum correctly lacks `razorpay` (provider belongs in `provider` field) — Fix 2 aligns code to schema. No drift requiring migration. No reset.

## Error Handling Audit

`ApiError` + envelope via `[[path]].ts` catch-all; `isTransientDbError` covers timeout/pool/refused/reset. Prisma codes `P2002/P2025/P1001` not explicitly mapped per-handler — handlers return `NOT_FOUND/CONFLICT/INTERNAL` appropriately; no secret leak in messages. Fix 3 ensures DB-init failures also envelope. No mass conversion to 500; intentional nullables preserved (`findFirst` + null checks).

## Production Connectivity

Read-only verification via prior reports (no new prod writes): Neon pooler reachable from local `pg.Pool` (`select 1`, `findMany take:1` ok per P0 report); Hyperdrive binding ID verified via `wrangler hyperdrive list`; secrets encrypted. No live prod query executed in this pass (no safe credentials in shell). No deletes/resets.

## Problems Found

| # | Problem | Evidence | Root cause | File:Line | Risk if unfixed |
|---|---------|----------|------------|------------|-----------------|
| 1 | Session lookup always misses | `refreshTokenHash` not in `Session` model (only `refreshToken`); middleware swallowed to null | Wrong identifier (query field ≠ stored field) | `functions/_middleware.ts:212` | sessionId never bound; multi-session precision lost; auth context degraded |
| 2 | Invalid payment enum | `PaymentMethod` = card/upi/netbanking/wallet/cod; code wrote `'razorpay'` | Provider name in method field | `_lib/order/service.ts:429,514` | payment create throws on capture path → 500 |
| 3 | Uncaught DB-init throw → 1101 | `initPrisma` outside try/catch; empty URL throws | Missing failure envelope | `functions/_middleware.ts:77` | text/plain 1101 instead of JSON 500, breaks clients |

## Fixes Applied

1. `functions/_middleware.ts`: resolve `requestId` first; wrap `initPrisma` in try/catch returning JSON `{success:false, error:{code:INTERNAL_ERROR, message:Database temporarily unavailable}, meta:{requestId}}` 500 with CORS/security headers. Removes 1101 path.
2. `functions/_middleware.ts`: session binding now `findFirst({userId, revokedAt:null, expiresAt:{gt:now}}, orderBy:{createdAt:desc})`; removed `refreshTokenHash` + dead `hashToken`. Single-session correct; multi-session limitation logged (same as prior reports).
3. `_lib/order/service.ts` (2 sites): `method: (order.paymentMethod ?? 'upi')` + `provider: 'razorpay'`. Preserves gateway attribution, satisfies enum.

## Regression Tests

- New `apps/api/_lib/prisma-forensic.test.ts` (4 tests): safe init error, no `refreshTokenHash`, JSON envelope present, no `method:'razorpay'`.
- `pnpm --filter @nabome/api test`: 10 files, 109 tests pass (baseline 105 + 4 new).
- `pnpm --filter @nabome/api typecheck`: pass. `eslint`: 0 errors (warnings only, pre-existing).

## Remaining Risks

- Staging shares prod Hyperdrive/KV IDs → staging writes prod. Manual: create separate Hyperdrive/KV for staging, rotate `SETTLEMENT_CRON_SECRET` (in git history).
- `origin_connection_limit:20` vs per-isolate `max:5` under burst; monitor Hyperdrive/Neon metrics before tuning.
- Order-number sequence race under burst; add retry on `P2002` only with reproduction.
- `session-manager.ts` dead dual-auth + missing `csrfToken`; remove only after confirming no imports (currently unused).
- `packages/returns` bare clients fail under workerd if ever imported by API; keep API on `_lib/returns/service.ts`.

## Final Verdict

```text
PRISMA DEFECT FOUND — FIXED AND VERIFIED
```
