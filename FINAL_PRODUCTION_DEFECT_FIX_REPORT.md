# FINAL PRODUCTION DEFECT FIX REPORT — CORS + COLD-DB 500

Base commit: `eb903c8` (deployed, untouched areas preserved)
Work base: `eb903c8` + uncommitted API-only changes (see §9)
Date: 2026-09-05 (UTC)

## 1. Existing Header 500 Fix

CONFIRMED STILL FIXED. `Header.tsx` was not touched (no diff in `apps/customer`).
Real headless-Chromium verification (Playwright, fresh context,
`https://www.nabome.online`, helper script removed after use):

- `/`, `/shop`, `/search`, `/login`, `/register`, `/cart`: all HTTP 200, zero
  `ServerErrorPage` markers, zero pageerrors, zero console errors.
- All observed `/api/*` requests routed to `https://nabome-api.pages.dev`;
  0 requests to `www.nabome.online/api/*`; 0 HTML-as-JSON failures.
- `GET /api/v1/cart` with `x-guest-id` from the browser: 200 (was ERR_FAILED).
- `GET /api/v1/products/new?limit=8` from the browser: 200 JSON in ~1 s.
- Invalid login from the browser: 401 `AUTH_REQUIRED` (not 500).

## 2. Guest Cart CORS Root Cause

Exact location: `apps/api/_lib/security.ts:59-62` (`applyCors`).
The preflight response advertised only:

```
access-control-allow-headers: content-type, x-csrf-token, x-request-id
```

while the frontend guest design sends `x-guest-id`
(`apps/customer/src/stores/cart-store.ts`, `checkout-store.ts`, `lib/guest-id.ts`)
and the auth refresh flow sends `authorization`
(`apps/customer/src/lib/api/auth.ts:72`). The backend already consumed
`x-guest-id` (`apps/api/functions/_middleware.ts:extractGuestId`, cart/checkout
handlers). Browsers therefore rejected the preflight (`x-guest-id is not allowed
by Access-Control-Allow-Headers`, `net::ERR_FAILED` on `GET /api/v1/cart`).
Reproduced live pre-deploy via `OPTIONS /api/v1/cart` (curl): allow-headers
lacked both headers.

Secondary inconsistency: `_middleware.ts:isAllowedOrigin` parsed only
`env.CORS_ORIGINS`, while `security.ts:allowedOrigins` falls back to
`DEFAULT_ALLOWED_ORIGINS` — two different origin verdicts for the same request.

## 3. CORS Fix

- `apps/api/_lib/security.ts`: allow-headers is now
  `content-type, x-csrf-token, x-request-id, x-guest-id, authorization`.
  No `*`, no change to `Access-Control-Allow-Origin` echo of allow-listed
  origins, `Allow-Credentials: true` kept, `Access-Control-Max-Age` kept,
  methods unchanged. `https://www.nabome.online` and existing origins preserved.
- `apps/api/functions/_middleware.ts`: `isAllowedOrigin` now delegates to
  shared `allowedOrigins(env)` (single verdict everywhere, incl. preflight
  short-circuit at `_middleware.ts:83-88` which already used `applyCors`).
- CSRF enforcement, credential behavior, and middleware ordering untouched.

Live post-deploy verification (`OPTIONS /api/v1/cart`, Origin `www`):
`access-control-allow-headers: content-type, x-csrf-token, x-request-id,
x-guest-id, authorization`. Evil-origin probe returns no ACAO (still blocked).
Browser run: 0 `ERR_FAILED`, 0 CORS errors; `GET /api/v1/cart` with `x-guest-id`
→ 200 JSON from real Chromium.

## 4. Cold Database 500 Root Cause

Exact path for `GET /api/v1/products/new?limit=8`:
`_middleware.ts` (`initPrisma`, session lookup) → `functions/[[path]].ts`
(`withHandlerTimeout` race + retry) → `products/index.ts:handleProductsNew`
→ `productService.getNew` → `productRepository.findNew` → pg Pool →
Hyperdrive (`nabome-neon-db-v3`, origin limit 20) → Neon pooler/compute.

Measured pre-fix on production: one request took 51.3 s and returned
`500 {"code":"INTERNAL_ERROR","message":"Database temporarily unavailable"}`;
the immediate follow-up took 27.0 s and returned 200. I.e. the old budget
(router 25 s + 0.5 s + router 25 s ≈ 51 s) was consumed twice by a Neon wake
of ~26 s: attempt 1 always died just before the DB became usable, attempt 2
sometimes did too (`500 → 500 → 200` across HTTP requests).

Deeper finding (live `pg_stat_activity` during a >45 s hang: **zero active
queries** — the request never reached Neon, which answers direct `psql` in
0.6 s): pooled TCP connections go stale silently when Neon scale-to-zero
kills them (no keepalive, `allowExitOnIdle: true`, 30 s idle reap), and the
pool hands the dead connection to the next request, which hangs until a
timeout discovers it — one timeout per dead connection.

Refinement from iterative live probing: the dominant failure mode is
**frozen/thawed isolates** — a Cloudflare isolate frozen between requests
thaws with a dead pool, and the next checkout grabs a dead connection
(deterministic ~50 % hang rate at 10–12 s probe spacing, alternating
fast/46 s; fresh isolates and fresh deploys are always fast ~1 s).
Additionally, timed-out losers are never cancelled (`Promise.race` doesn't
abort pg work), so each hang permanently occupies a pool slot — 5 such events
fully wedged an isolate. `handleProductsNew` (and siblings) also mapped DB
timeouts to `422 VALIDATION_ERROR`, masking retryable failures, and the router
retry re-ran mutations on the already-consumed `Request`, failing mutating
retries with `422 "Body has already been used"`.

## 5. Cold DB Fix

`apps/api/functions/[[path]].ts`:

- `HANDLER_TIMEOUT_MS`: 25000 → 45000. A legitimate ~26–45 s cold wake now
  completes inside the first attempt; one bounded retry (after 500 ms) covers
  deeper wakes up to ~90 s total. Still bounded; no indefinite hang.
- Mutation request bodies are buffered once (`clone().arrayBuffer()`) and each
  attempt runs on a fresh `Request`, so retries of POST/PUT/DELETE no longer die
  with "Body has already been used". Verified: guest cart add/update/remove
  succeed including across retry conditions.

`apps/api/_lib/prisma.ts` (pg Pool via Hyperdrive):

- `connectionTimeoutMillis`: 8000 → 30000 (a cold-wake connection wait no
  longer fails after 8 s).
- `idleTimeoutMillis`: 30000 → 10000 (stale post-sleep connections reaped fast).
- `allowExitOnIdle`: true → false (runtime must not GC live pooled sockets).
- `keepAlive: true` + `keepAliveInitialDelayMillis: 10000` (dead sockets
  detected and evicted instead of being handed out).
- `max`: 10 → 5 (per-isolate footprint against Hyperdrive's global
  origin_connection_limit of 20; a single saturated isolate can no longer
  exhaust origin connections alone).

`apps/api/_lib/auth/services-v1.ts`: per-query `withTimeout` 20000 → 40000 ms
(stays under the 45 s router budget while surviving a cold wake).

`apps/api/_lib/http/errors.ts` + `products/index.ts`: new shared
`isTransientDbError()` classifier; product handlers map transient DB failures
to `500 INTERNAL_ERROR "Database temporarily unavailable"` (retryable,
matched by the router's `isTimeoutResponse`) instead of misleading `422`;
genuine validation errors stay `422`.

Retry/timeout hierarchy after fix: pool checkout 30 s < service 40 s <
router 45 s (+1 retry) < ~90 s worst case. No unbounded loops (exactly one
retry per layer).

Pool self-healing (`apps/api/_lib/prisma.ts`):

- `resetStalePool()` — drops a suspect pool and builds a fresh one from the
  remembered URL/opts (old pool ended fire-and-forget; `query_timeout: 60000`
  bounds the abandoned queries). Throttled to one reset per 10 s to avoid
  conn-storms during genuine cold wakes.
- Called from the router before every transient-DB retry (timeout responses,
  `DB_TIMEOUT`/timeout throws, outer transient catch).
- **Proactive**: `initPrisma` (runs per request in middleware) resets the pool
  when the isolate has been idle >10 s (`STALE_POOL_MS`) — thawed isolates
  therefore never serve from a dead pool. Hot isolates keep their warm pool.
- `query_timeout: 60000` on the pool: any query hanging past 60 s is killed
  server-side and its client evicted, so slots always free even if a
  timeout-race loser is abandoned. Kept above the 45 s router budget so
  legitimate ~46 s cold completions are never cut, and well above warm
  latency (~1 s).

Result on production: 6/6 spaced probes fast (0.6–2.4 s), mixed endpoints
(cart/login/categories/search) all ~1–2 s, 5-way and 3-way concurrent bursts
all ~1 s, zero 500s. Occasional single slow successes (~46 s) remain possible
on a first touch that races pool rebuild, but they return 200, not 500.

## 6. Neon Autosuspend

NOT CHANGED / ACCESS UNAVAILABLE. No Neon dashboard/API access was available
from this environment, so no autosuspend/scale-to-zero setting was modified.
Code is resilient regardless: cold wakes complete within the timeout/retry
budget and still return 200 JSON (slow first request acceptable per spec).

## 7. Tests

Repo-native suites only (no invented scripts):

- `pnpm --filter @nabome/api exec tsc --noEmit` → PASS (exit 0).
- `pnpm --filter @nabome/api exec eslint …` (all changed files) → 0 errors
  (only pre-existing warnings in untouched `_middleware.ts` regions).
- `pnpm --filter @nabome/api test:unit` → 6 files, 88 tests, ALL PASS.
- New tests in `apps/api/_lib/index.test.ts` (runs in the repo's vitest unit
  config): preflight permits `x-guest-id` + `authorization` (+ credentials,
  origin echo); disallowed origins get no CORS headers; cold-start pool
  timeouts / `DB_TIMEOUT` / terminated connections classify transient while
  genuine validation errors stay non-transient.
- `pnpm --filter @nabome/api build` → PASS (before each deploy).
- NOTE: `apps/api/_handlers/**/…test.ts` do not execute under the repo's
  `vitest.config.ts` (`include: ['_lib/**/*.test.ts']`); the products-handler
  test was therefore folded into `_lib/index.test.ts` via the shared
  `isTransientDbError` export instead of adding a new runner config.
- NOTE: `@nabome/customer` (package `packages/customer`) `tsc --noEmit` has
  PRE-EXISTING failures in untouched files (`__tests__/notification…`,
  `preference…`, `profile…`, `events.ts`) — unrelated to this change; no
  frontend files were modified.

## 8. Browser Verification

Real headless Chromium (Playwright, fresh context), script kept at
`e2e/verify-prod.mjs` (helper only, untracked):

- Routes `/ /shop /search /login /register /cart`: 200, no ServerErrorPage,
  no pageerrors, no console errors; API hosts: only `nabome-api.pages.dev`.
- `GET /api/v1/cart` with `x-guest-id` from the browser: 200 (previously
  `ERR_FAILED`) — CORS defect fixed.
- `GET /api/v1/products/new?limit=8` from the browser: 200 JSON.
- Guest cart API lifecycle (curl, app-equivalent headers): add 200 → read
  count 1 → update (PUT) 200 → remove 200 → read count 0.
- Guest `POST /checkout/start` with `x-guest-id`: reaches handler (422
  validation, no CORS block, no 500).
- Regression: invalid login → 401; weak register → 422; valid register →
  201 `pending_verification` (one test user `prodverify.*@example.com`
  created; cart/checkout probes created and then cleared guest cart rows).
- No valid-login-credential test was possible (no credentials available).

## 9. Production Deployment

Existing workflow (`pnpm --filter @nabome/api build` +
`wrangler pages deploy dist --project-name nabome-api`), API only, no
frontend redeploy (no frontend changes):

1. `1ca7d856` — CORS allow-headers + origin unification + router 45 s +
   pool 30 s + service 40 s + transient classification.
2. `8cefcf65` — pg keepalive + 10 s idle reap.
3. `d2658250` — `max` 5 + `allowExitOnIdle: false`.
4. `321b639b` — mutation body buffering for retry replay.
5. `191a755e` — `query_timeout: 60000` (kill hung queries, free slots).
6. `85c92905` — `resetStalePool()` + reset-before-retry wiring.
7. `d20a6cd8` — idle/keepalive reap 10 s → 3 s (did not move the needle alone).
8. `ae34415e` — proactive stale-pool reset on >10 s isolate idle
   (**current production** — eliminated the 46 s first-attempt hangs).

Final live state re-verified after `ae34415e`: preflight allow-headers correct;
6/6 spaced probes 0.6–2.4 s; cart/login/categories/search ~1–2 s; 5-way and
3-way bursts ~1 s with zero 500s; guest add/update/remove lifecycle green;
invalid login 401; register 201 `pending_verification`.

## 10. Remaining Issues (pre-existing, out of scope, NOT introduced here)

1. **Frontend uses PATCH, API registers PUT** for `cart/items/{id}`,
   `checkout/{id}`, `checkout/addresses/{id}` (`cart-store.ts:102`,
   `checkout-store.ts:213,336` vs API `register('PUT', …)`). App-driven
   update calls will 404. Needs a frontend/backend method alignment + frontend
   deploy — deliberately not changed here.
2. **CSRF cookie-name asymmetry**: API enforces against
   `SESSION_COOKIE_NAME=nabome_session` (`wrangler.jsonc:22`) while the
   frontend reads/sends the value of the `csrf_token` cookie. Pure guests hold
   no `csrf_token` cookie (only set at login/register), so guest mutations
   from a fresh browser get 403 until an auth flow sets cookies. Preserved
   as-is per scope (no auth/CSRF behavior changes); guest write verification
   was done with an explicit double-submit cookie pair.
3. **Guest `/checkout/start` requires a UUID `cartId`** that guest carts never
   receive (guest cart object has no `id`), so end-to-end guest checkout
   cannot complete without a design decision. CORS/routing/DB layers for it
   verified working.
4. **Residual risk — extreme bursts**: Hyperdrive origin limit is 20 (max
   allowed) and timed-out losers are cancelled only via `query_timeout`
   (60 s), so a sustained heavy burst against cold isolates could still queue
   past budgets. Verified healthy under 5-way/3-way concurrency; not
   load-tested beyond that. The pool-reset + `query_timeout` combination
   bounds recovery (isolates self-heal instead of wedging permanently, which
   was the observed pre-fix failure mode).
5. `Header.tsx`/routing/auth previously fixed areas: untouched, still passing.
