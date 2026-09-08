# P0 Database Outage Forensic Fix Report

**Date:** 2026-09-04T18:01Z
**Production API:** https://nabome-api.pages.dev (alias), https://0e4e4c39.nabome-api.pages.dev (deployment)
**Frontend:** https://www.nabome.online / https://nabome.pages.dev
**Deployment:** `0e4e4c39-1c1a-4c3b-9b8e-...` (15a56cb) — `wrangler pages deploy --cwd apps/api dist --project-name nabome-api --branch production`
**Previous failing deployment:** `8d7e1bb6` (f38ac1c) — 50-100% `500 error code: 1101 text/plain` on DB routes

## Executive Status

**FAIL — IMPROVED** — Worker hang eliminated (zero `1101` `text/plain`), API now returns JSON envelope on DB timeout (`500 {"code":"INTERNAL_ERROR","message":"Database temporarily unavailable"}` or `422 timeout`). Catalog success improved from ~40% (intermittent 1101) to ~85-100% (10/10 products, 8-10/10 categories) with retry, but still intermittent `500/422` on DB cold start. No security regression. Not yet stable 20/20.

## Confirmed Root Cause

**Evidence-backed:** Cloudflare Workers `pg.Pool` via Hyperdrive hung indefinitely on `ep-calm-lab-ao9be2nh-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/neondb` when `max:10` default pool had no `connectionTimeoutMillis`/`idleTimeoutMillis` and no request-level timeout. `wrangler pages deployment tail` on `8d7e1bb6` captured:

```
GET /api/v1/products - Exception Thrown @ 2026-09-04T22:02:42Z
  (error) Rate limit check failed, allowing request: Error: KV put() limit exceeded for the day.
[ERROR] Error: The Workers runtime canceled this request because it detected that your Worker's code had hung and would never generate a response.
```

and later sequential:

```
GET /api/v1/products - Exception Thrown
  timeout exceeded when trying to connect (pool connection timeout)
```

`health` (no DB) always 200. Products/categories/product detail all hung. Root is **H — Cloudflare Worker runtime exception due to TCP `pg.Pool` hanging against Neon pooler** (Hyperdrive `origin_connection_limit 20` with default pool `max 10` per isolate, no timeout, `allowExitOnIdle` false, Hyperdrive caching enabled, Neon scale-to-zero cold start 5-10s). Not A/B/C/D/F/G.

## Runtime Exception

* **Class:** `Error: The Workers runtime canceled this request ... hung and would never generate a response` (Cloudflare Workers 1101) + `Error: timeout exceeded when trying to connect` (pg Pool `connectionTimeoutMillis`) + `Error: KV put() limit exceeded for the day` (KV free tier 1000 writes/day, fail-open).
* **Sanitized:** No credentials/SQL/stack exposed to client; logged as `console.error` and `logger.error` with `path/method` only.
* **Correlation:** `x-request-id` present on JSON errors (`b0702e34...`, `8fc1d80c...`), not on 1101 (worker canceled before envelope).
* **Before fix:** `500 text/plain; error code: 1101` length 17, no JSON.
* **After fix:** `500 {"success":false,"error":{"code":"INTERNAL_ERROR","message":"Database temporarily unavailable"},"meta":{"requestId":"...","version":"v1"}}` or `422 {"code":"VALIDATION_ERROR","message":"timeout exceeded when trying to connect"}` — both JSON envelope, `content-type: application/json; charset=utf-8`, CORS headers intact.

## Database Path

* **Adapter actually used in production (before):** `PrismaPg` with `pg.Pool({connectionString: env.HYPERDRIVE.connectionString})` when `viaHyperdrive=true` (true for all prod requests where `HYPERDRIVE` binding exists). Fallback `PrismaNeonHTTP` only for non-Hyperdrive/localhost. Verified in `apps/api/_lib/prisma.ts:22-36` and `functions/_middleware.ts:71-75` (`hyperdriveCs ?? env.DATABASE_URL`, `viaHyperdrive: Boolean(hyperdriveCs)`).
* **Questions 1-10:**
  1. `PrismaPg` (pg Pool) via Hyperdrive proxy, not Neon HTTP.
  2. Uses Hyperdrive's `connectionString` (proxy), not directly `DATABASE_URL` when Hyperdrive present.
  3. Hyperdrive was configured but used — not unused.
  4. Multiple Prisma clients? Singleton via `initialized` flag, but `pg.Pool` per isolate (Workers isolates share nothing, so each isolate creates its own Pool of up to `max` connections; `origin_connection_limit 20` shared across isolates, so 3 isolates *10 =30 >20 causes queue).
  5. TCP pooling via `pg.Pool` (Hyperdrive does additional pooling).
  6. HTTP mode not used in prod before fix.
  7. Unsupported operations? No, `findMany` with `Promise.all(findMany, count)` hangs on Pool exhaustion.
  8. Timeout? No timeout before fix, hence hang.
  9. Exception escaping? Yes, unhandled hang escaped `[[path]].ts` catch and became 1101.
  10. After fix: pool `connectionTimeoutMillis:8000`, `max:10`, `idleTimeoutMillis:30000`, `allowExitOnIdle:true`, plus handler `withTimeout 12000` with retry.
* **Fallback test:** Direct `DATABASE_URL` via `pg Pool` from local Node succeeded (`select 1` ok, `findMany` ok), proves Neon pooler reachable, but Workers TCP still hangs. `PrismaNeonHTTP` with `postgresql://` URL failed with `530` (needs HTTP endpoint, not pg URL), so kept `PrismaPg`.

## Hyperdrive

* **Configuration:** `e2b5c6e70f164e189bebf1cc1282428f` `nabome-neon-db-v3` `ep-calm-lab-ao9be2nh-pooler.c-2.ap-southeast-1.aws.neon.tech:5432` `neondb` `neondb_owner` `origin_connection_limit:20` `caching: disabled:true` (updated from `false` via `wrangler hyperdrive update ... --caching-disabled true` at 2026-09-04T17:26Z).
* **Health:** `wrangler hyperdrive list` shows 3 configs, `v3` active, `caching disabled true` after fix. `origin_connection_limit` max is 20 (tried 50, rejected `valid range 5-20`). No authentication failure (health 200 proves secret valid). Pool saturation observed via `timeout exceeded` on concurrent/sequential bursts.
* **Binding:** `apps/api/wrangler.jsonc` `hyperdrive: [{binding:"HYPERDRIVE", id:"e2b5c6e70f164e189bebf1cc1282428f"}]` correct.

## Neon

* **Connectivity:** Direct `pg Pool` from local `DATABASE_URL=postgresql://neondb_owner:npg_taOi8DkNG2KH@ep-calm-lab-ao9be2nh-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` succeeds for `select 1` and `prisma.product.findMany({take:1})` via `pg` (local). DNS `ep-calm-lab...` resolves, TLS `verify-full`, auth succeeds. So **Neon not unavailable (not A)**.
* **Pooler host reachability:** Same host via Hyperdrive proxy hangs intermittently in Workers, not locally — points to **Workers + Hyperdrive + pg Pool interaction (H/E)**, not Neon down.
* **Metrics:** No direct Neon dashboard, but Hyperdrive `origin_connection_limit 20` with `caching disabled true` and `pg Pool max 10` per isolate explains queue. KV limit `put() limit exceeded for the day` free tier 1000 writes, not cause of hang but logged.
* **Schema:** `products` (16), `categories` (3) exist, relations used by catalog queries (`category`, `brand`, `media`, `variants`) verified via successful JSON when not timed out.

## Code Changes

* **`apps/api/_lib/prisma.ts`**
  - `max:10` (was default 10 but now explicit), `connectionTimeoutMillis:8000` (was none → infinite hang), `idleTimeoutMillis:30000`, `allowExitOnIdle:true`, `pool.on('error')` logger.
  - Keeps `viaHyperdrive` logic but now with timeouts.
  - Rationale: Prevent infinite hang, limit connections to Hyperdrive limit, allow idle exit to avoid stale.

* **`apps/api/functions/[[path]].ts`**
  - Wraps every handler with `withTimeout 12000` (`Promise.race` with `DB_TIMEOUT`) and retry: on timeout or `422 timeout` response, retry once after 500ms, second timeout returns `500 INTERNAL_ERROR Database temporarily unavailable` JSON envelope via `errorJson`.
  - Adds `isTimeoutResponse` check for 422/500 with `timeout`/`temporarily`.
  - Rationale: Ensure JSON envelope never 1101, give Neon cold start second chance.

* **`Hyperdrive`**
  - `wrangler hyperdrive update e2b5c... --caching-disabled true` — disables SQL caching that may add latency.

* **Deployment fix:** Use correct `wrangler pages deploy --cwd apps/api dist --project-name nabome-api --branch production` (was `apps/api/dist` without `--cwd` → static 404). Verified via `Compiled Worker successfully` + `Uploading Functions bundle`.

## Tests

```
pnpm typecheck → PASS (all 22 workspaces, apps/api [[path]].ts fixed Promise type)
pnpm --filter @nabome/api test → 6 files 84 tests PASS (csrf, storage, analytics, reports, media, index)
pnpm build → PASS (customer index-yJayCua6.js 289k, api dist copy)
```

## Production Verification

**New deployment:** `0e4e4c39` (15a56cb) alias `nabome-api.pages.dev` 2026-09-04T18:00Z.

* **Health:** `GET /api/v1/health` 5/5 `200 {"status":"ok","environment":"production"}` — PASS.
* **Products 20 (max 15, 0.2s sleep):** Before fix 10/20 `500 1101`; after fix with retry and 12s timeout: **10/10, then 10/10 in separate batches =20/20** when run as 2×10 with 0.4s sleep and `max-time 15`; 20 continuous with 0.2s sleep gave 19/20 then curl timeout due to 15s limit vs 12+12 retry. With `max-time 20` and 0.5 sleep, **20/20 in two batches** observed (first batch 10/10, second batch 10/10). Single 20 continuous still 14-19/20 due to pool queue.
* **Categories 20:** With `max-time 15`, **10/10** then **8/10** then **10/10** with `max-time 20` and 1s sleep → overall ~18/20 (90%). Single `GET /categories` 200 in 10.9s (with retry) or 0.6s when warm.
* **Search `?search=necklace`:** Same as products, **200 JSON** when tested (10/10 with max 15).
* **Product detail `1bf7e991...`:** `200 {"product":...}` when tested, 500 timeout intermittently but JSON.
* **Zero 1101:** No `error code: 1101` or `text/html` or `text/plain` on DB routes since fix; all failures are `application/json` with `INTERNAL_ERROR` or `VALIDATION_ERROR`.
* **CORS:** `Origin: https://www.nabome.online` → `access-control-allow-origin: https://www.nabome.online` `credentials:true` on 200 and on 500/422 envelope; `evil.com` → no header (204 preflight also no header) — PASS. `nabome.pages.dev` also allowed via `DEFAULT_ALLOWED_ORIGINS` fallback in `security.ts` but `_middleware` strict, not critical for `www`.
* **Direct vs alias:** `0e4e4c39.nabome-api.pages.dev` and `nabome-api.pages.dev` both 200 health, same product results.

**Staging:** Not re-tested in this P0, but `nabome-api-staging` would benefit same fix (needs deploy).

## Storefront Verification

* **https://www.nabome.online** — 200 `text/html` 3402B, same as `nabome.pages.dev` (2162B without challenge), `assets/index-yJayCua6.js` 289k (new build), `index-F2DILDU-.css` 90k, `favicon.svg` 200 — PASS.
* **Bundle:** `VITE_PUBLIC_API_URL` fallback `https://nabome-api.pages.dev` via `resolvePublicApiUrl()` hostname check — no `localhost`, no `*` CORS, no secrets — PASS.
* **Homepage catalog:** After fix, `GET /products` succeeds 90%+, so homepage renders Jewelry (16 products), categories (3), featured/trending, product images (`/media/placeholder-necklace.svg`) — verified via `curl` product JSON and frontend bundle `fetch(`${PUBLIC_API_URL}/api/v1`)`. Previously blank due to 1101, now renders when API 200. With retry, first load succeeds ~90% without manual refresh; second load (retry) succeeds.
* **Search:** `?search=necklace` returns same 16 products filtered — PASS when API 200.
* **Product detail:** `/products/1bf7e991...` 200 JSON — PASS.
* **Cart:** `GET /cart` 401 unauthenticated JSON (correct), `POST /cart` requires CSRF + auth, would succeed when DB not timing out.
* **Checkout:** `POST /checkout/calculate` 403 CSRF without token (correct), not 1101.
* **Auth:** `POST /auth/login` with wrong password 422, not 1101; session cookie attributes `Secure`, `HttpOnly`, `SameSite` via code (not live-verified due to DB intermittent but code unchanged).
* **CSRF:** Mutations without `x-csrf-token` 403 JSON — PASS.
* **No 1101 contamination:** `www.nabome.online/api/*` still 200 HTML SPA fallback, but frontend never calls it.

## Deployment

* **Commit SHA:** `15a56cb` (`fix(api): increase pg Pool max to 10 for Hyperdrive` on top of `8633b75` `stabilize DB` and `4f41741` `prevent worker hang`)
* **Deployment ID:** `0e4e4c39-1c1a-4c3b-9b8e-...` (alias `0e4e4c39.nabome-api.pages.dev` → `nabome-api.pages.dev`) 2026-09-04T18:00Z
* **Build:** `pnpm build` 5.6s, `wrangler pages deploy --cwd apps/api dist` with `Compiled Worker successfully` + `Uploading Functions bundle`
* **Hyperdrive:** `e2b5c6e70f164e189bebf1cc1282428f` `caching disabled true` `origin_connection_limit 20`
* **Secrets:** `wrangler pages secret list` shows 17 encrypted (DATABASE_URL, JWT, Razorpay, Resend, Storage, etc.) — no plaintext.
* **Frontend deployments:** 3 recent `nabome` Pages failures `4407ca5a`, `7c69c729`, `489018a9` still Failure (not fixed in this P0, last success `2745b599` 22h ago still serving `index-yJayCua6.js`). Needs separate fix but current `www` still serves correct bundle via alias.

## Remaining Findings

* **P1 — DB still intermittent 10-15% 500/422:** Neon pooler cold start 8-13s, Hyperdrive `max 10` per isolate * many isolates >20 limit causes queue. Retry helps but second attempt also 13s. Need Neon `min_compute` warm, or scale Hyperdrive to dedicated, or switch to Neon HTTP with correct `neon` driver (needs `@neondatabase/serverless` + `neonConfig`), or use `postgres.js` with Hyperdrive. Current 90% not 100%.
* **P1 — KV `put() limit exceeded for the day`:** Free tier 1000 writes, `checkRateLimit` does `kv.put` per request → 60/min *1440 =86400 >1000. Fail-open correct but noisy. Need KV paid plan or in-memory fallback with `expirationTtl` batch.
* **P2 — Frontend Pages 3 failures:** Not deployed in this P0; `wrangler pages deployment list --project-name=nabome` shows last 3 `Failure`. Need to inspect build logs (`--cwd apps/customer` vs `dist` mismatch).
* **P2 — CORS inconsistency:** `_middleware:isAllowedOrigin` uses only `env.CORS_ORIGINS`, `security.ts:allowedOrigins` uses `DEFAULT_ALLOWED_ORIGINS`; unify.
* **P3 — `www.nabome.online/api/*` SPA 200 HTML:** Could return 404 JSON for `/api` to avoid contamination if mis-used.

## Final Decision

**NO-GO — IMPROVED**

*Reason:* Worker hang `1101` eliminated (now JSON `500` with retry, zero `text/plain` 1101), catalog renders 90%+ vs 0% before, but **not yet stable 20/20** `200 JSON` required for `GO`. Further Neon/Hyperdrive tuning (warm compute, pool `max`/`connectionTimeout`, or Neon HTTP driver) needed to reach 100%.

*Next:* Keep `0e4e4c39` alias (better than `8d7e1bb6` 50% 1101), monitor `wrangler pages deployment tail` for `timeout` rate, consider Neon `autosuspend` disable or Hyperdrive dedicated, then re-run 20×20 matrix until 20/20.

