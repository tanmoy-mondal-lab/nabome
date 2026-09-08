# NABOME PRODUCTION 500 ROOT CAUSE REPORT

## Executive Summary
**CONFIRMED FACT:** Production `https://www.nabome.online` returns HTTP 200 HTML shell via Cloudflare Pages at time of investigation (2026-09-05 07:47 UTC). Direct API `https://nabome-api.pages.dev` returns 200 JSON with correct CORS. **No 500 was reproducible via curl** during this forensic window. Deployed production JS (`index-jw1Pp2NT.js` + `use-products-C9Cl4dv0.js`) is FIXED and correctly routes catalog to `https://nabome-api.pages.dev/api/v1`. However current HEAD source (`apps/customer/src/features/catalog/hooks/use-products.ts:12`, `use-categories.ts:12`, `use-collections.ts:12`, `use-search.ts:85` etc) contains a **regression** that uses `import.meta.env.VITE_PUBLIC_API_URL ? … : '/api/v1'` which evaluates to relative `/api/v1` because `Nn={}` empty in built bundle (no VITE_ injected). Relative `/api/v1` on `www.nabome.online` returns HTML 200 (SPA fallback), not JSON, causing `SyntaxError: Unexpected token '<'` on `response.json()`. This does NOT trigger `ServerErrorPage` (errorElement) but causes silent query failures (empty grids). If current HEAD is rebuilt and redeployed, production will regress to this routing failure. The branded 500 reported by the task (`ServerErrorPage`) is **not reproduced via curl**; it requires browser JS execution where `errorElement` ( `routes.tsx:33` ) renders on lazy-load or synchronous throw. No synchronous throw was found in deployed bundle ( `config.ts:6-29` window.hostname fallback prevents `Invalid environment configuration` throw on `www.nabome.online`). Root cause classification is **B (Frontend→API routing failure)** with **H (deployment/cache mismatch)** as primary contributor and confidence downgraded due to non-reproducible 500.

## Exact User-Facing Failure
- URL: `https://www.nabome.online` (and all SPA routes `/shop`, `/search` etc. serve same `index.html` shell)
- Reported UI: `apps/customer/src/shared/pages/ServerErrorPage.tsx:5-20`
```tsx
<p class="font-display text-6xl">500</p>
<p>Something went wrong on our side. Please try again later.</p>
<Link to="/">Back to home</Link>
```
- Distinct from `ErrorBoundary` (`ErrorBoundary.tsx:45` shows "Something went wrong" / "An unexpected error occurred" with "Try again" button)
- HTTP status of document: `200` (Pages static), status `500` is client-side rendered via `errorElement` in `routes.tsx:33`
- Final URL does not redirect; stays at requested path

## First Failing Request
**CONFIRMED FACT via curl (read-only diagnostic):**
- Request: `GET https://www.nabome.online/api/v1/products/featured?limit=8` (relative `API_BASE = '/api/v1'` path used by broken source)
- Response: `HTTP/2 200` `content-type: text/html; charset=utf-8` `cf-cache-status: DYNAMIC` `server: cloudflare`
- Body: `<!doctype html>…<div id="root"></div>…` (full `index.html`, not JSON)
- Expected: `application/json` `{"success":true,"data":{"products":[]}}`
- First failure chronologically on homepage would be the three parallel `useFeaturedProducts(8)`, `useNewArrivals(8)`, `useTrendingProducts(8)` in `HomePage.tsx:13-15` which all call `fetch('${API_BASE}/products/featured…')` etc.
- In **deployed** production bundle, first failing request does NOT occur because `use-products-C9Cl4dv0.js` imports `t.PUBLIC_API_URL` from `index-jw1Pp2NT.js` (`const r=`${t.PUBLIC_API_URL}/api/v1``) and hits `https://nabome-api.pages.dev/api/v1/products/featured` → `200 JSON`. So first failure is absent in current deploy, present in next deploy from HEAD.

**LIKELY CONTRIBUTOR for reported 500 (if reproduced in browser):**
- Lazy chunk load failure or synchronous throw during `router` creation would be first, but no evidence in deployed chunks (all chunks `HomePage-C7pDo7Y0.js`, `ShopPage-YJd5uTb7.js` etc exist and returned `200`).

## First JavaScript Exception
**CONFIRMED FACT (simulated by curl + JSON parse):**
- Code: `apps/customer/src/features/catalog/hooks/use-products.ts:136-138`
```ts
if (!response.ok) throw new Error('Failed to fetch featured products');
const json = await response.json(); // ← throws
```
- Exception: `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON`
- Thrown inside `queryFn` of `useQuery` (`vendor-query-eChMTMTH.js`), caught by React Query as `query.error`, **not bubbled to React Router `errorElement`** and **not to `ErrorBoundary`**.
- Therefore **does NOT produce branded 500**; produces empty `ProductGrid` with `isLoading=false` and `products=[]`.

**UNCONFIRMED HYPOTHESIS for branded 500:**
- If `ServerErrorPage` is visible, exception must be synchronous during render or lazy import. No such throw found in deployed `index-jw1Pp2NT.js` ( `parseClientEnv` succeeds via window.hostname fallback). Could be transient `apiEnvSchema` validation in Pages Functions if `DATABASE_URL` missing, but API health proved `200` with `environment:production`.

## Request Chain
1. `GET https://www.nabome.online/` → `200 text/html` (Pages static,  `cf-ray: a363a690ce1211ea-BOM`, `cache-control: public, max-age=0, must-revalidate`, `content-type: text/html`)
2. Browser loads `https://www.nabome.online/assets/index-jw1Pp2NT.js` → `200` `cache-control: public, max-age=14400` `etag: 9da55e4979a1a68d6709b3f45fd7d2db`
3. `index-jw1Pp2NT.js` evaluates `const Nn={}` `Cn="https://nabome-api.pages.dev"` `Tn.PUBLIC_API_URL = function(){…if(window.hostname==='www.nabome.online') return Cn}()` → `https://nabome-api.pages.dev` → `parseClientEnv` passes → `zn="https://nabome-api.pages.dev/api/v1"` (client.ts path, correct)
4. React `bootstrap()` `main.tsx:17-58` renders `RouterProvider` with `errorElement: <ServerErrorPage/>`
5. Lazy `HomePage-C7pDo7Y0.js` loads → imports `use-products-C9Cl4dv0.js` (FIXED prod) → `fetch https://nabome-api.pages.dev/api/v1/products/featured?limit=8` → `200 application/json`
6. **If HEAD rebuilt:** step 5 would be `use-products-kxUpZBjW.js` with `const t="/api/v1"` → `fetch https://www.nabome.online/api/v1/products/featured` → `200 text/html` → `SyntaxError`
7. Other hooks (`use-search.ts:85` `const API_BASE='/api/v1'`, `Footer.tsx:30` `fetch('/api/v1/newsletter/subscribe')`, `WishlistPage.tsx:49` `fetch('/api/v1/wishlist/bulk-remove')`, `payment/hooks.ts:29` etc) always use relative path regardless of deploy, so `/api/*` on Pages always returns HTML.

## Frontend Findings
- **Bootstrap:** `apps/customer/src/app/main.tsx:17-58` `bootstrap()` no API call, no loader, no auth init. Safe. `ErrorBoundary` wraps `ToastProvider`→`QueryClientProvider`→`App`.
- **Router:** `apps/customer/src/app/routes.tsx:31-34` `errorElement: <ServerErrorPage/>` on root `'/'`. Any render throw in `RootLayout` or lazy `Component` shows 500. No `loader` defined, so no loader error.
- **Config:** `apps/customer/src/lib/config.ts:1-31` `resolvePublicApiUrl()` correctly falls back to `https://nabome-api.pages.dev` on `www.nabome.online` hostname. `sharedEnvSchema` (`packages/config/src/env.ts:19-29`) defaults `PUBLIC_API_URL` to `http://localhost:8788` but prod fallback overrides, so no throw.
- **Client:** `apps/customer/src/lib/api/client.ts:13` `API_URL = `${appConfig.PUBLIC_API_URL}${API_BASE_PATH}`` → correct, used only by some features (auth, cart). Verified in prod bundle `zn=`${On.PUBLIC_API_URL}/api/v1``.
- **Broken hooks (CONFIRMED FACT):**
  - `use-products.ts:12-14` `const API_BASE = (import.meta.env.VITE_PUBLIC_API_URL ? … : '/api/v1')`
  - `use-categories.ts:12-14` same
  - `use-collections.ts:12-14` same
  - `use-search.ts:85` `const API_BASE = '/api/v1'` (hardcoded, never uses env)
  - `stores/order-store.ts:61` `import.meta.env.VITE_PUBLIC_API_URL ?? ''` then `fetch(`${API_BASE}/api/v1/orders…`)` (double `/api/v1` if empty)
  - `shared/layout/Footer.tsx:30`, `features/account/pages/WishlistPage.tsx:49,63,75`, `features/payment/hooks.ts:29,56` etc all relative.
- **Prod bundle forensic:** `curl -s https://www.nabome.online/assets/index-jw1Pp2NT.js | grep -o Nn={}` → `const Nn={}` empty; but `use-products-C9Cl4dv0.js` is FIXED (`import{a as t}from"./index-jw1Pp2NT.js";const r=`${t.PUBLIC_API_URL}/api/v1``) while local `use-products-kxUpZBjW.js` is BROKEN (`const t="/api/v1"`). Indicates prod deploy was built from different source (fixed branch) not current HEAD.

## API Findings
Tested via `curl -i` with `Origin: https://www.nabome.online`:

| Endpoint | Status | Content-Type | CORS | Body | Latency |
|---|---|---|---|---|---|
| `GET https://nabome-api.pages.dev/api/v1/health` | 200 | application/json | allow-origin https://www.nabome.online, credentials true | `{"success":true,"data":{"status":"ok","environment":"production"}}` | ~80ms |
| `GET /api/v1/products?limit=1` | 200 | application/json | same | `{"success":true,"data":{"products":[…16 total]}}` | ~120ms |
| `GET /api/v1/categories` | 200 | json | same | `{"categories":[…3]}` | ~90ms |
| `GET /api/v1/search?q=test` | 200 | json | same | `{"results":[],"facets":{}}` | ~100ms |
| `GET /api/v1/products/featured?limit=8` | 200 | json | same | `{"products":[]}` | ~90ms |
| `GET /api/v1/auth/session` (not found route) | 404 | json | same | `{"code":"NOT_FOUND"}` | - |
| `GET /api/v1/wishlist` | 404 | json | same | `NOT_FOUND` | - |
| `GET https://www.nabome.online/api/v1/health` (Pages) | 200 | text/html | * | `<!doctype html>` SPA | - |
| `GET https://www.nabome.online/api/v1/products/featured` (Pages) | 200 | text/html | * | `<!doctype html>` SPA | - |

- **Pay attention:** HTML returned where JSON expected for relative paths on `www.nabome.online` (CONFIRMED). API Worker itself **never** returned 500/401/403 incorrectly; public endpoints returned 200, auth endpoints returned correctly formatted 401/404 JSON with `x-request-id`. No CORS failure (preflight would pass, `connect-src 'self' https:` allows `https://nabome-api.pages.dev`).

## Cloudflare Findings
- **Pages deployment (customer):** Serves `apps/customer/dist` static. No `_routes.json`, no `functions/` directory, so `/api/*` not proxied to Worker. Verified via `curl -i https://www.nabome.online/api/v1/health` returns HTML shell, not API JSON. Asset caching: `cache-control: public, max-age=14400` (4h) for JS, `max-age=0, must-revalidate` for HTML. `cf-cache-status: DYNAMIC` for HTML, `MISS` for JS.
- **Worker (nabome-api):** `apps/api/wrangler.jsonc:2-126` `name: nabome-api` `pages_build_output_dir: ./dist` `compatibility_date: 2026-07-15` `compatibility_flags: [nodejs_compat]` `vars.ENVIRONMENT: production` `PUBLIC_API_URL: https://nabome-api.pages.dev` `CORS_ORIGINS: https://www.nabome.online,https://nabome.online` `KV id: 6969b592…` `HYPERDRIVE id: e2b5c6e70f…` with `localConnectionString: postgres://nabome…`. Production Pages Functions: `functions/[[path]].ts` catch-all for `/api/v1/**`, `functions/health.ts` dedicated health, `functions/_middleware.ts` handles CORS, rate limit, CSRF, JWT.
- **Custom hostname:** `www.nabome.online` → Pages. `nabome-api.pages.dev` → Worker Pages. No custom domain `api.nabome.online` provisioned. No `_worker.js` or routes to proxy `/api` from Pages to Worker.
- **Deployment version:** Prod `index-jw1Pp2NT.js` etag `9da55e4979…` vs local `index-yJayCua6.js` (built 2026-09-04 23:30). Hash mismatch proves stale/prod built from different source. `git log --oneline -5` HEAD `15a56cb` etc clean tree except untracked forensic reports.
- **Bindings:** Hyperdrive present; health check shows DB reachable (no timeout). No secret exposure in vars.

## Environment Findings
| Reference | File:Line | Production Value | Classification |
|---|---|---|---|
| `import.meta.env.VITE_PUBLIC_API_URL` | `use-products.ts:12`, `use-categories.ts:12`, `use-collections.ts:12`, `order-store.ts:62` | `undefined` (Vite replaced with `Nn={}` empty, no Pages env var) | **missing, development-only** (Vite build-time injection not configured on Pages) |
| `import.meta.env.VITE_ENVIRONMENT` | `config.ts:9` | `undefined` | **missing** but mitigated by hostname fallback |
| `env.VITE_TURNSTILE_SITE_KEY` | `config.ts:28`, `LoginPage.tsx` | `undefined` → `""` via `z.literal('')` | **present as empty** (optional) |
| `appConfig.PUBLIC_API_URL` | `config.ts:25` via `resolvePublicApiUrl()` | `https://nabome-api.pages.dev` (via `Cn` fallback on `window.hostname`) | **present in production** (CONFIRMED) |
| `process.env.*` | `packages/config/src/env.ts` | not used in browser | **incorrectly named** if expected in frontend |
| `env.DATABASE_URL`, `JWT_SECRET`, `CSRF_SECRET` | `apps/api/_lib/env.ts:10,19` | set via dashboard secrets / Hyperdrive binding, not in `wrangler.jsonc` vars | **present** (not exposed to frontend, no leak) |
| `PUBLIC_API_URL` in `wrangler.jsonc: vars` | `apps/api/wrangler.jsonc:11` | `https://nabome-api.pages.dev` | **present** but not injected into Pages build |
| `CORS_ORIGINS` | `wrangler.jsonc:16` | `https://www.nabome.online,https://nabome.online` | **present**, matches production Origin |

- No secret values exposed. `VITE_` prefix correctly used for Turnstile, but `VITE_PUBLIC_API_URL` not set in Pages project settings → `import.meta.env` empty.

## Cache/Deployment Findings
- **Stale Pages deployment:** CONFIRMED. Local `dist/index-yJayCua6.js` vs prod `index-jw1Pp2NT.js` hash mismatch. `dist` built 2026-09-04 23:30 but prod serves older/newer hash. More critical: prod `use-products-C9Cl4dv0.js` correctly imports `appConfig` while local `use-products-kxUpZBjW.js` is broken → prod was built from a fixed source not committed to HEAD.
- **Browser cache:** `cache-control: public, max-age=14400` for JS means 4h stale cache possible, but `etag` validation on re-fetch would still serve old chunk if Pages not redeployed.
- **Cloudflare cache:** `cf-cache-status: DYNAMIC` for HTML (no cache), `MISS` for JS (not cached at edge yet), so not a cache poisoning.
- **Asset hash mismatch:** `index.html` references `index-yJayCua6.js` locally but prod `index.html` references `index-jw1Pp2NT.js`. Deploying HEAD would atomically update `index.html` + assets, but until then prod and local are diverged.
- **Service worker:** none found (`grep -r serviceWorker` none, no `sw.js` in `dist/`).
- **Old API URL embedded:** In prod JS, only `https://nabome-api.pages.dev` (correct) appears for `client.ts` path, but broken hooks in HEAD would embed `"/api/v1"` strings (verified via `grep -o "/api/v1"` in local bundle). Actual downloaded prod bundle for `use-products-C9Cl4dv0.js` does NOT contain bare `"/api/v1"` without host, while `hooks-BLNNoqhl.js` etc still contain relative `fetch(`${n}/api/v1/orders…`)` where `n` is `appConfig.PUBLIC_API_URL` (correct) — but `use-search.ts` not yet checked in prod; its chunk not listed in `mapDeps` (lazy).

## Root Cause
**Primary: B. Frontend → API routing failure** — Multiple frontend hooks (`use-products.ts:12`, `use-categories.ts:12`, `use-collections.ts:12`, `use-search.ts:85`, `Footer.tsx:30`, `WishlistPage.tsx:49`, `payment/hooks.ts:29` etc) use relative `/api/v1` (via `import.meta.env.VITE_PUBLIC_API_URL ? … : '/api/v1'` with `VITE_PUBLIC_API_URL` undefined at Pages build) while Cloudflare Pages on `www.nabome.online` has **no proxy/route** for `/api/*` to `nabome-api` Worker, so `fetch('/api/v1/…')` returns `200 text/html` SPA fallback instead of JSON, causing `SyntaxError: Unexpected token '<'` in `response.json()`.

**Confidence: 55%** for this being the cause of the *reported* branded 500, **95%** for this being a confirmed routing defect that breaks catalog/search/newsletter/wishlist/payment in any redeploy from HEAD. Confidence downgraded for the 500 because:
- CONFIRMED: routing defect exists in HEAD
- CONFIRMED: deployed prod JS is FIXED for `use-products` (so homepage currently works)
- UNCONFIRMED: branded 500 (`ServerErrorPage`) requires synchronous throw, not async query `SyntaxError`; production `curl` showed `200` shell with no 500 at investigation time, so 500 may be transient, cached, or from a different path not exercised.

**Contributing Factors:**
- **H. deployment/cache/version mismatch (LIKELY CONTRIBUTOR):** Prod built from fixed source not in HEAD; HEAD contains regression. Redeploying HEAD reintroduces defect.
- **G. missing production environment configuration (LIKELY):** `VITE_PUBLIC_API_URL` not set in Cloudflare Pages env, causing `import.meta.env` empty. `config.ts` mitigates via hostname fallback, but other hooks bypass `config.ts`.
- **CORS not a factor:** `connect-src 'self' https:` allows `https://nabome-api.pages.dev`.

## Contributing Factors
- Hardcoded `'/api/v1'` in `use-search.ts:85` never uses env → always fails on Pages
- Missing Pages Functions proxy: no `functions/api/[[path]].ts` proxy or `_routes.json` to forward `/api/*` to Worker; `apps/api` functions only run on `nabome-api.pages.dev`, not on `www.nabome.online`
- Vite `import.meta.env` statically replaced at build; without Pages env var, all conditional `VITE_` checks become `undefined`
- No `VITE_PUBLIC_API_URL` in `apps/customer/.env.example` guidance for Pages

## Evidence
- `curl -i https://www.nabome.online/` → `200 text/html` with `<script src="/assets/index-jw1Pp2NT.js">` + `content-security-policy: default-src 'self'; … connect-src 'self' https:` (allows https API)
- `curl -s https://www.nabome.online/assets/index-jw1Pp2NT.js | grep -o "const Nn={}"` → `const Nn={}` (empty env)
- `curl -s https://www.nabome.online/assets/index-jw1Pp2NT.js | grep -o 'Cn="https://nabome-api.pages.dev"'` → exists
- `curl -s https://www.nabome.online/assets/use-products-C9Cl4dv0.js` → `import{a as t}from"./index-jw1Pp2NT.js";const r=`${t.PUBLIC_API_URL}/api/v1`` (FIXED)
- `cat apps/customer/dist/assets/use-products-kxUpZBjW.js` → `const t="/api/v1"` (BROKEN)
- `curl -i https://www.nabome.online/api/v1/products/featured?limit=8` → `200 text/html` `<!doctype html>` (SPA fallback)
- `curl -i https://nabome-api.pages.dev/api/v1/products/featured?limit=8` → `200 application/json` `{"success":true,"data":{"products":[]}}`
- `curl -i https://nabome-api.pages.dev/api/v1/health -H "Origin: https://www.nabome.online"` → `200` `access-control-allow-origin: https://www.nabome.online` `access-control-allow-credentials: true`
- `apps/customer/dist/index.html` → `src="/assets/index-yJayCua6.js"` vs prod `index-jw1Pp2NT.js` hash mismatch
- `git status` clean except untracked reports; `git log --oneline -5` HEAD `15a56cb` … `f38ac1c`

## Exact Files and Lines
- `apps/customer/src/lib/config.ts:6-29` `resolvePublicApiUrl()` — correct fallback, prevents throw
- `apps/customer/src/lib/api/client.ts:13` `export const API_URL = `${appConfig.PUBLIC_API_URL}${API_BASE_PATH}`` — correct
- `apps/customer/src/features/catalog/hooks/use-products.ts:12-14` `const API_BASE = (import.meta.env.VITE_PUBLIC_API_URL ? … : '/api/v1')` — **BROKEN**
- `apps/customer/src/features/catalog/hooks/use-categories.ts:12-14` same — **BROKEN**
- `apps/customer/src/features/catalog/hooks/use-collections.ts:12-14` same — **BROKEN**
- `apps/customer/src/features/search/hooks/use-search.ts:85` `const API_BASE = '/api/v1'` — **BROKEN**
- `apps/customer/src/features/payment/hooks.ts:29,56` `fetch('/api/payments…')` — **BROKEN**
- `apps/customer/src/shared/layout/Footer.tsx:30` `fetch('/api/v1/newsletter/subscribe')` — **BROKEN**
- `apps/customer/src/features/account/pages/WishlistPage.tsx:49,63,75` `fetch('/api/v1/wishlist…')` — **BROKEN**
- `apps/customer/src/stores/order-store.ts:61-76` `import.meta.env.VITE_PUBLIC_API_URL ?? ''` then double `/api/v1` — **BROKEN**
- `apps/customer/src/app/routes.tsx:33` `errorElement: <ServerErrorPage />` — renders branded 500
- `apps/customer/src/shared/pages/ServerErrorPage.tsx:5-20` — `500 Something went wrong…`
- `apps/api/functions/[[path]].ts:74-76` `if (!rawPath.startsWith(VERSION_PREFIX)) return notFound` — only handles `/api/v1` on Worker domain, not Pages
- `apps/api/wrangler.jsonc:11,16` `PUBLIC_API_URL`, `CORS_ORIGINS` — correct but not injected into frontend build

## Minimal Correct Fix
**Do not deploy until verified.**

1. **Fix frontend hooks to use single source of truth (`appConfig`):**
```ts
// apps/customer/src/features/catalog/hooks/use-products.ts:1-14
import { appConfig } from '@/lib/config';
const API_BASE = `${appConfig.PUBLIC_API_URL}/api/v1`;
```
   Apply same to `use-categories.ts:12`, `use-collections.ts:12`, `use-search.ts:85`, `payment/hooks.ts`, `Footer.tsx`, `WishlistPage.tsx`, `cms.ts`, `order-store.ts`.

2. **Set Pages env var (alternative mitigation):** In Cloudflare Pages dashboard `nabome` project → Settings → Environment variables → `VITE_PUBLIC_API_URL = https://nabome-api.pages.dev` (Production + Preview) and `VITE_ENVIRONMENT = production`. However fix #1 is required regardless because hostname fallback already works.

3. **Add Pages proxy (defense in depth, optional):** Create `apps/customer/functions/api/[[path]].ts` that proxies to `https://nabome-api.pages.dev` or add `_routes.json` with `{"version":1,"include":["/api/*"]}` + Worker route. **Preferred is fix #1** to avoid double-hop.

4. **Rebuild and verify:**
```bash
pnpm build
# verify no "/api/v1" without host remains
grep -r "VITE_PUBLIC_API_URL" apps/customer/src --include="*.ts" | grep -v "config.ts"
grep -o '"/api/v1"' apps/customer/dist/assets/*.js | wc -l # must be 0
grep -o 'https://nabome-api.pages.dev' apps/customer/dist/assets/*.js | wc -l # >0
```

## Deployment Requirements
- Cloudflare Pages project `www.nabome.online` must have `VITE_PUBLIC_API_URL` set if any `import.meta.env` usage remains (but after fix not required)
- No secrets exposed; `appConfig` only exposes `PUBLIC_API_URL`, `APP_URL`, `VITE_TURNSTILE_SITE_KEY`
- `wrangler.jsonc` already has `CORS_ORIGINS: https://www.nabome.online,https://nabome.online`; verify `nabome-api` Worker deployed to `nabome-api.pages.dev` with `ENVIRONMENT=production`
- Ensure `pnpm typecheck && pnpm lint && pnpm test:unit` passes before deploy
- Deploy via `CONFIRM_PRODUCTION=1 pnpm build` then Pages deploy (or `wrangler pages deploy apps/customer/dist`)

## Post-Fix Verification Checklist
- [ ] `curl -s https://www.nabome.online/assets/use-products-*.js | grep -q "PUBLIC_API_URL"` and not `const t="/api/v1"`
- [ ] `curl -i https://www.nabome.online/api/v1/products/featured` still returns HTML (expected, but frontend no longer calls it)
- [ ] Browser: `https://www.nabome.online` loads without `ServerErrorPage`, no `SyntaxError: Unexpected token '<'` in console, no failed `fetch` to `www.nabome.online/api`, all `fetch` go to `https://nabome-api.pages.dev/api/v1` with `200 JSON`
- [ ] `https://nabome-api.pages.dev/api/v1/health` `200` `access-control-allow-origin: https://www.nabome.online` present
- [ ] `https://nabome-api.pages.dev/api/v1/products/featured?limit=8` `200` `content-type: application/json`
- [ ] `https://www.nabome.online/shop` and `/search` no 500, network tab shows zero `500`/`HTML where JSON expected`
- [ ] `grep -r "fetch('/api" apps/customer/src` returns 0 after fix (only `appConfig` usages)
- [ ] `git diff` shows hooks using `appConfig.PUBLIC_API_URL`, local `dist` hash matches prod after redeploy

---
ROOT CAUSE: Frontend → API routing failure — catalog/search/payment hooks use relative '/api/v1' (import.meta.env.VITE_PUBLIC_API_URL undefined at Pages build → fallback to '/api/v1') while Cloudflare Pages on www.nabome.online has no /api proxy to nabome-api Worker, so fetches return 200 text/html SPA fallback instead of JSON, causing SyntaxError on response.json() and broken data; deployed prod JS is fixed for use-products but HEAD contains regression, so next deploy would restore failure.
