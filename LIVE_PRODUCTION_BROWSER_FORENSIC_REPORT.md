# Nabome Live Production Browser Forensic Report

**Date:** 2026-09-04T16:27Z
**Tester:** opencode forensic (curl + bundle forensics, no synthetic browser automation — network verified via Cloudflare edge)
**Commit:** f38ac1c (api), 2745b599 last successful frontend (recent 3 frontend deploys Failure)

## Executive Status

**FAIL** — Frontend shell loads but production API DB tier is down (intermittent → 80-100% `500 error code: 1101 text/plain` on all DB endpoints). Homepage catalog/categories/product/detail/cart/checkout are non-functional when DB is erroring. Health endpoint (no DB) remains 200.

## Tested URLs

* https://www.nabome.online — 200 text/html (3402B), TLS ok (Google Trust WE1), HSTS
* https://nabome.pages.dev — 200 text/html (2162B), same app shell
* https://nabome-api.pages.dev — 200 for `/api/v1/health`, 500 for DB routes
* https://8d7e1bb6.nabome-api.pages.dev — same behavior as alias

## Frontend

* **DNS:** www 172.67.185.37/104.21.51.194, pages.dev 172.66.44.172/47.84, api 172.66.44.89/47.167 — all Cloudflare anycast, no NXDOMAIN.
* **TLS:** `CN=www.nabome.online` issuer `WE1`, Verify 0 (ok), HSTS `max-age=15552000; includeSubDomains; preload` on frontend, `31536000` on API.
* **HTTP:** Frontend 200 DYNAMIC, `content-type: text/html; charset=utf-8`, `cache-control: public, max-age=0, must-revalidate`. API health 200 JSON `cache-control: no-store`. API DB failure 500 `content-type: text/plain; charset=UTF-8` length 17 `error code: 1101` (worker uncaught exception, not JSON envelope) — violates JSON contract.
* **HTML:** Same intended app: both serve `assets/index-jw1Pp2NT.js` (289072B, etag 9da55e49) and `assets/index-F2DILDU-.css` (90468B). `www` injects `cdn-cgi` challenge iframe + analytics beacon (second `cf-ray`); `pages.dev` does not. Diff only in challenge/script wrapper — not app logic.
* **JS:** Bundle loads 200 `application/javascript`, modulepreload `vendor-query`, `vendor-react`, `shared-ui`. Bundle contains `Cn="https://nabome-api.pages.dev"` and runtime fallback `resolvePublicApiUrl()` (hostname check for `www.nabome.online|nabome.online|*.nabome.online|*.pages.dev` → production URL). `zn=${On.PUBLIC_API_URL}/api/v1` used for all fetches — no relative `/api/...` in production path.
* **CSS:** 200 `text/css` 90468B.
* **Images/Fonts:** `/favicon.svg` 200 `image/svg+xml`, Google Fonts preconnect present. No mixed-content: all `https:`.
* **Rendering:** HTML shell renders `#root` without hydration error markers. CSP meta `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https:` — `connect-src https:` correctly permits `https://nabome-api.pages.dev`. No hydration errors observable from static HTML; runtime would hydrate via `index-jw1Pp2NT.js`.

## Browser Console

*Limit: no real Chrome DevTools MCP in this environment; inferred from bundle + headers.* No `TURNSTILE_BYPASS_SECRET`, `JWT_SECRET` value, `CSRF_SECRET` value, Razorpay secret, Resend/B2 secrets in bundle — only Zod schema strings `JWT_SECRET:yn().min(32,...)` etc. No `localhost` runtime value (localhost strings only in Zod defaults, not in resolved `Cn`). No uncaught exception marker in HTML. Actual console errors would be **failed `fetch` to `/api/v1/products` etc returning 500 text/plain** causing catalog blank — confirmed below.

## Network

| METHOD | URL | STATUS | CONTENT-TYPE | ROOT CAUSE |
|--------|-----|--------|--------------|------------|
| GET | https://www.nabome.online | 200 | text/html | OK |
| GET | https://nabome.pages.dev | 200 | text/html | OK (same app) |
| GET | https://www.nabome.online/assets/index-jw1Pp2NT.js | 200 | application/javascript | OK |
| GET | https://www.nabome.online/assets/index-F2DILDU-.css | 200 | text/css | OK |
| GET | https://www.nabome.online/api/v1/health | 200 | text/html | **SPA fallback contamination** — Pages serves `index.html` for unknown path; frontend correctly avoids this by using absolute `nabome-api.pages.dev` (verified in bundle). Not a live bug but if relative URL used would be HTML200-instead-of-JSON. |
| GET | https://nabome-api.pages.dev/api/v1/health | 200 (5/5) | application/json | OK — `{"success":true,"data":{"status":"ok","environment":"production"}}` |
| GET | https://nabome-api.pages.dev/api/v1/products `Origin:www` | **500 (4/5 then 5/5)** | text/plain `error code: 1101` | **P0 worker uncaught exception** — DB/Hyperdrive/Prisma pool failure, not JSON envelope |
| GET | https://nabome-api.pages.dev/api/v1/categories `Origin:www` | 500/200 flaky → 500 | text/plain/JSON | same |
| GET | https://nabome-api.pages.dev/api/v1/products/:id `Origin:www` | 500 80% | text/plain | same |
| GET | https://nabome-api.pages.dev/api/v1/cart `Origin:www` | 401 JSON | application/json | OK (auth required) but would be 500 when DB down on authenticated flow |
| POST | https://nabome-api.pages.dev/api/v1/checkout/calculate | 403 FORBIDDEN CSRF | JSON | OK (expected without CSRF token) |
| OPTIONS | https://nabome-api.pages.dev/api/v1/products `Origin:www` | 204 | — | CORS ok |
| OPTIONS | https://nabome-api.pages.dev/api/v1/products `Origin:evil.com` | 204 without ACAO | — | Correctly no CORS header (not allowed) |

*Early run (16:23Z): 60% failure (6/10). Late run (16:26-27Z): 80-100% failure. Health never fails (no DB).*

## API Connectivity

* Health: PASS — `GET /api/v1/health` 200 JSON both with and without Origin, `access-control-allow-origin: https://www.nabome.online` when Origin sent, `vary: Origin`, `credentials:true`.
* Catalog: **FAIL** — `GET /api/v1/products` returns JSON 22923B (16 products) when success, but now consistently 500 text/plain. Same for `?search=necklace`, `?limit=1`, single product, categories. Frontend `fetch(`${PUBLIC_API_URL}/api/v1`...)` via `client/api` with `credentials:include` + `x-csrf-token` will receive 500 text/plain and throw `ApiClientError` — catalog blank.
* CSRF: `GET /api/v1/csrf` and `/csrf-token`, `/auth/csrf` all 404 JSON `Route not found` — endpoint may be bound to cookie/CSRF via `enforceCsrf` header `x-csrf-token` from `csrf_token` cookie, not a GET endpoint; frontend reads cookie directly (`Ln()` extracts `csrf_token`). Not a failure but verify — mutations without token correctly return 403 JSON.
* Auth `POST /api/v1/auth/login` with bad password returns 422 JSON validation (when DB up) — path works; session cookie attributes not verified due to DB down but code sets `httpOnly`, `Secure`, `SameSite=Lax` per audit.

*SPA contamination check:* Frontend **does not** call `/api/...` on `www.nabome.online` — bundle uses absolute `https://nabome-api.pages.dev/api/v1`. Verified via `grep` — no `localhost`, no relative `/api` at runtime. So HTML200 contamination not triggered in live app despite `www.nabome.online/api/*` returning SPA HTML.

## Customer E2E

**Homepage → catalog → product → cart → checkout**

1. Open homepage — PASS (shell loads)
2. Navigation — PASS (SPA shell)
3. Categories load — **FAIL** when API 500 (empty section). When API succeeds, 3 categories (Jewelry, Décor, Craft & Art) returned.
4. Products load — **FAIL** (blank catalog data when 500; when success, 16 products, featured/trending correctly returned).
5. Product images — `placeholder-necklace.svg` etc via `/media/...` but DB media mostly empty; image loading itself 200 but product card blank due to API failure, not image failure.
6. Search works — would fail same as products (same endpoint).
7. Product detail — `GET /products/:id` 500 80% → blank detail.
8. Cart open/persist — cart GET returns 401 unauthenticated (correct) but after login would need DB, thus fails when DB down.
9. Add/update/remove — would be blocked by 500/CSRF.
10. Checkout totals/tax/shipping/order — blocked by DB outage.

*Root cause for every empty UI section is the API 500 1101, not frontend.*

## Authentication

* Customer login invalid → 422 Validation (when DB up) — PASS.
* Authenticated `/auth/me` etc return 404 `Route not found` per current router (not `FORBIDDEN`) — likely path is different (`/auth/session` etc); not tested live due to DB down.
* CSRF protection — PASS: mutations without `x-csrf-token` return 403 JSON `CSRF validation failed`.
* Session cookie — code intends `Secure`, `SameSite=Lax/Strict`, `httpOnly` where appropriate; not live-verified due to no successful login while DB down, but `wrangler` config `SESSION_COOKIE_NAME=nabome_session` present and `_middleware` extracts `access_token`/`session_id` correctly.
* Domain/path — no accidental `nabome.pages.dev` dependency; frontend resolves API via hostname check to `nabome-api.pages.dev` regardless of whether customer is on `www` or `pages.dev`.

## CORS

* Production `wrangler.jsonc` `CORS_ORIGINS: "https://www.nabome.online,https://nabome.online"` — matches expected `www` + apex. `security.ts` `DEFAULT_ALLOWED_ORIGINS` additionally includes `pages.dev`, `staging.*`, `localhost` — used by `applyCors` fallback when env var empty.
* **Inconsistency:** `_middleware.ts:isAllowedOrigin` uses only `env.CORS_ORIGINS` (no fallback), while `security.ts:allowedOrigins` uses default fallback. So `nabome.pages.dev` Origin would be allowed by `applyCors` via fallback but `isAllowedOrigin` check for logging would treat it as not allowed. No functional break for `www` but `pages.dev` direct frontend would get CORS success via `applyCors` fallback yet middleware logs `allowedOrigin: null`. Not a user-visible bug but hardening item.
* Preflight `OPTIONS` for `www` returns `access-control-allow-origin: https://www.nabome.online` + `credentials:true` + `allow-methods/headers` — PASS.
* Evil origin `https://evil.com` correctly returns no `access-control-allow-origin` (both GET and OPTIONS) — PASS, not `*`.
* No `*` in production responses — PASS.
* `nabome.pages.dev` Origin was 500 worker error (masked), so CORS not verifiable under DB outage — treat as same outage, not CORS config.

## Cloudflare

* **Pages — nabome-api (prod):** `8d7e1bb6-...` 30 min ago `production` branch `f38ac1c` (alias `nabome-api.pages.dev` and `8d7e1bb6.nabome-api.pages.dev` both exhibit same 1101). Prior deployments all `production`. Status healthy per Pages but runtime DB fails.
* **Pages — nabome (frontend):** Last success `2745b599` 22h ago; 3 recent deploys `4407ca5a`, `7c69c729`, `489018a9` marked `Failure` (likely build error, not alias). Current `www.nabome.online` still serves last successful build `index-jw1Pp2NT.js` (etag 9da55e49). Custom domain `www.nabome.online` + `nabome.pages.dev` both mapped to same Pages project and serve same assets (verified hash).
* **DNS:** `www` → Cloudflare proxy, no redirect. `nabome.online` (apex) returns 200 HTML directly (no redirect to www observed). No hostname-specific behavior beyond challenge iframe injection on `www`.
* **Functions separation:** Customer frontend is static Pages (`apps/customer` dist) — no Pages Functions. API is separate Pages Functions project `nabome-api` with `dist` output and Hyperdrive/KV bindings. Correct separation.
* **Hyperdrive:** Binding `HYPERDRIVE` id `e2b5c6e70f164e189bebf1cc1282428f` (`nabome-neon-db-v3` `ep-calm-lab-ao9be2nh-pooler.c-2.ap-southeast-1.aws.neon.tech` pooler) verified via `wrangler hyperdrive list`, `origin_connection_limit 20`. Not a placeholder.
* **KV:** `6969b592bba74117b3f27545dcf47e7a` (prod) and staging `2db98525...` verified.

## Security

* Bundle grep: `TURNSTILE_BYPASS_SECRET` not present, `SETTLEMENT_CRON_SECRET` not present, no plaintext `JWT_SECRET` value, no `CSRF_SECRET` value, no Razorpay secret, no Resend/B2 secret — only Zod schema descriptors. **PASS.**
* Secrets confirmed encrypted via `wrangler pages secret list` (17 secrets: CSRF_SECRET, DATABASE_URL, JWT_SECRET, Razorpay trio, Resend, Storage, Settlement, Turnstile, Webhook). No plaintext exposure.
* Turnstile bypass remains unavailable in production bundle and `isTestBypassCsrf` requires `TURNSTILE_BYPASS_SECRET` env match — not set in production vars — **PASS.**
* CSP `default-src 'self'; connect-src 'self' https:` permits `nabome-api.pages.dev` but is broad (`https:`) — not a regression, noted as hardening to tighten to specific origin.
* Session/HttpOnly/SameSite/Secure not live-verified due to DB down, but code sets via `auth/jwt` and cookie helpers.

## Rate Limiter

*Implementation:* `apps/api/_lib/ratelimit.ts` KV fixed-window 60s, tiers public 60/min, authenticated 120, etc. `checkRateLimit(KV, tier, identifier)` increments `kv.put(key, ttl 60)`. `_middleware` applies public tier on every request via `clientKey(request)` (`cf-connecting-ip` → `x-forwarded-for` → `x-real-ip` → `unknown:path:ua`).

*Current behavior:*

* **Fail-open on KV error** — `catch` returns `{allowed:true}` and logs `Rate limit check failed, allowing request`. This is intentional hardening (doc says fail-open restores availability when KV transiently fails; previously fail-closed caused persistent 429). **Known hardening item, not changed in this verification.**
* **Fail-open when no KV binding** — `if (!kv) return {allowed:true, remaining:60}` (local dev). In production KV binding exists, so not triggered — but if binding lost, limiter disabled.
* **Affected endpoints:** Every request via `_middleware` (public tier) plus per-route `checkRateLimit` for auth (10/min IP, 5/min email, 3/min user), checkout, cart, media etc. So auth/payment/order/webhook/internal are all affected by same fail-open.
* **Observability:** KV errors logged via `console.error` but not in structured logger with requestId; failure is silent to client (allowed). Auth/payment/webhook would be unprotected under KV outage.
* **Staging evidence:** Staging now returns `429 RATE_LIMITED` for both health and products (our IP hit limit) — proves KV is working there.
* **Risk:** Under KV outage, brute-force/login, checkout/payment flood, webhook replay are unthrottled until KV recovers.

## Defects

* **P0 — API DB worker exception 1101:** `GET /api/v1/products|/categories|/products/:id` return `500 error code: 1101` `text/plain` (should be JSON envelope `{"success":false,...}`). Direct `8d7e1bb6` and alias both affected. Health (no DB) remains 200. Intermittent → now near-100% outage as of 16:27Z. Blocks all storefront data (catalog, product, cart, checkout). Hostname: both `nabome-api.pages.dev` and direct deployment. Component: API / Hyperdrive / Prisma pool. Likely root: Hyperdrive pool `ep-calm-lab-ao9be2nh-pooler` connection limit 20 exhausted, Neon pooler error, or `PrismaPg` pool not handling concurrency under Pages isolate scaling; uncaught exception escapes middleware `initPrisma`/`prisma.*` and Cloudflare returns 1101 instead of JSON. Needs `wrangler pages deployment tail` logs, Neon dashboard, Hyperdrive metrics. **Smallest remediation:** Check Neon/Hyperdrive host reachability, verify `DATABASE_URL` secret matches pooler, add try/catch envelope around DB calls to return JSON 500 not 1101, ensure `prisma` singleton per isolate, consider `NeonHTTP` fallback, redeploy if needed; DO NOT broaden CORS or add secrets. Verify with `curl` matrix after fix, then repeat browser catalog test.
* **P1 — Frontend Pages recent build failures:** `nabome` project 3 consecutive `Failure` deployments (`4407ca5a`, `7c69c729`, `489018a9`) on `production` branch — may indicate broken build pipeline; current alias still serves previous successful `2745b599`. Risk: next push may not deploy.
* **P2 — CORS inconsistency:** `isAllowedOrigin` (middleware) ignores `DEFAULT_ALLOWED_ORIGINS` while `applyCors` uses it; `nabome.pages.dev` would be treated differently. Low impact for `www` but should unify to `allowedOrigins(env)`.
* **P3 — SPA fallback on `www.nabome.online/api/*`:** Returns HTML 200 not 404 JSON. Not used by frontend (absolute URL) but could mask misconfig. Consider returning 404 JSON for `/api` on frontend Pages if possible.
* **P3 — CSP broad `connect-src https:`** — tighten to `https://nabome-api.pages.dev https://fonts.googleapis.com` etc.

## Remediation

*Only proven fixes — no speculative production changes made in this verification.*

1. **P0 API DB:** Pull logs `npx wrangler pages deployment tail --project-name=nabome-api --environment=production` + Neon Hyperdrive logs to capture exception stack for `1101`. Verify `DATABASE_URL` secret = Neon pooler URL and `HYPERDRIVE.connectionString` injection. Add envelope catch in `_middleware` `initPrisma` and product/category handlers to ensure JSON `500 {"code":"INTERNAL_ERROR"}` not `text/plain`. Test Hyperdrive connectivity with `psql` via pooler, check `origin_connection_limit` vs traffic, redeploy `8d7e1bb6` equivalent after fix. Re-run `curl` matrix (health, products, categories, product detail, CORS) until 200 JSON stable, then browser verify homepage catalog renders.
2. **P1 Pages build failures:** Inspect Cloudflare Pages build logs for `4407ca5a` etc, fix `pnpm build` error, ensure `VITE_PUBLIC_API_URL` set at build time (fallback covers runtime but CI should set explicit).
3. **P2 CORS:** Change `_middleware: isAllowedOrigin` to `return allowedOrigins(env).includes(origin)` to match `security.ts`.
4. Rate limiter hardening noted separately — no change per directive.

*Run after any code change:* `pnpm typecheck`, `pnpm test` (api tests), `pnpm build`, redeploy `nabome-api` and `nabome` Pages, repeat exact failing browser test.

## Deployment

*No code/config changed during this forensic verification.*

* Commit SHA: f38ac1c (api prod), last frontend success 2745b599
* Pages deployment ID: api `8d7e1bb6-ebc7-4bbb-a4b0-01233f172435` (alias `nabome-api.pages.dev`), frontend `2745b599-061a-4833-a1de-cb02c3b5f513`
* Timestamp: 2026-09-04T16:27Z
* Verification result: **FAIL — NO-GO due to P0 DB outage**

## Final Decision

**NO-GO**

*Reason:* Production storefront shell is reachable and correctly configured (TLS, bundle, CORS, CSP, `PUBLIC_API_URL=https://nabome-api.pages.dev` via fallback, no secrets, no localhost), but **catalog/category/product/cart/checkout are non-functional** due to API DB tier returning `500 error code: 1101 text/plain` on every DB request (health 200 proves edge is up but DB is down). `PASS` requires functionally verified data rendering, not merely `HTTP 200` on shell. Rate limiter hardening item remains open but is not the cause of this outage.

*Blast radius:* Both `www.nabome.online` and `nabome.pages.dev` affected identically (same bundle, same API).

*Next action:* Resolve P0 Hyperdrive/Prisma outage, re-run this exact forensic suite (including browser catalog render + `curl` matrix with `Origin: https://www.nabome.online` expecting JSON 200), then promote to `GO WITH KNOWN HARDENING ITEM` (rate-limiter fail-open).

