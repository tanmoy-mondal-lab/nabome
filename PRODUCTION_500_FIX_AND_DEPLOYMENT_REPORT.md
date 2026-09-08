# NABOME PRODUCTION 500 FIX AND DEPLOYMENT REPORT

## 1. Incident
- Production `https://www.nabome.online` rendered the branded application-level 500 on `/`, `/shop`, `/search`:
  `apps/customer/src/shared/pages/ServerErrorPage.tsx:8-11` (`500 / Something went wrong on our side. Please try again later. / Back to home`), served via `errorElement: <ServerErrorPage />` at `apps/customer/src/app/routes.tsx:33`.
- Document HTTP status was `200 text/html` (Pages static shell); the 500 was client-side rendered by React Router.
- Forensic reference: `PRODUCTION_500_ROOT_CAUSE_REPORT.md` (confirmed a real `/api/v1` routing defect but had NOT proven the synchronous exception behind `ServerErrorPage`).

## 2. Browser Reproduction
- Tool: `@playwright/test` chromium (headless), clean context, `domcontentloaded` + 5-6s settle, `page.textContent('body')`, console/pageerror/request/response listeners.
- Pre-fix (production `index-jw1Pp2NT.js`): `has500=true` on `/`, `/shop`, `/search`. Console: `Error: Minified React error #185` + `React Router caught the following error during render ... #185`. API calls went to the correct `https://nabome-api.pages.dev/api/v1/...` with `200 application/json`, zero failed JS chunks — proving the routing defect was NOT the 500 trigger.
- Local dev (`vite dev :5173`) reproduced the identical 500 with the full dev error: `The result of getSnapshot should be cached to avoid an infinite loop` + `Error: Maximum update depth exceeded ... The above error occurred in the <Header> component. React will try to recreate this component tree ... RenderErrorBoundary` + `React Router caught ... Maximum update depth exceeded`.

## 3. First Failure
- Chronologically first failure on every route: `Header` render → zustand selector `useCartStore((state) => state.cart?.items ?? [])` returns a new array literal on every `getSnapshot` call → `useSyncExternalStore` detects snapshot change each render → `forceStoreRerender` loop → `Maximum update depth exceeded` (React #185).
- It fires before any API response matters (API calls succeed in parallel). No failed network request precedes it; `beacon.min.js` CSP block is unrelated noise.

## 4. Exact Exception
- `Error: Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.` (dev) / `Minified React error #185` (prod).
- FILE: `apps/customer/src/shared/layout/Header.tsx:42` (pre-fix line).
- FUNCTION: `Header()` render, via zustand `useCartStore` selector passed to `useSyncExternalStoreWithSelector`.
- TRIGGER: any route rendering `RootLayout` → `Header` (i.e. every page).
- WHY IT REACHES errorElement: the error is thrown synchronously during React Router's render of the `/` route element tree; React Router catches render errors and renders the nearest `errorElement`.
- WHY ServerErrorPage IS rendered: root route defines `errorElement: <ServerErrorPage />` (`routes.tsx:33`).
- Second exception found post-fix on `/search` only: `Minified React error #31` (objects are not valid as React child: category object). FILE: `apps/customer/src/features/catalog/pages/SearchResultsPage.tsx:213` (`{product.category}` where API returns `category: {id, name, slug, ...}` object).

## 5. Exact Root Cause
- Primary 500 cause (all routes): **A. frontend runtime** — unstable zustand selector in `Header.tsx:42` (`state.cart?.items ?? []` allocates a new array per snapshot, violating `getSnapshot` caching) causing an infinite render loop (React #185). CONFIRMED by dev stack trace naming `<Header>` and by fix verification.
- Secondary 500 cause (`/search` only): **A. frontend runtime** — rendering the `category` object directly (`SearchResultsPage.tsx:213`, React #31). CONFIRMED by error args listing category keys.
- The `/api/v1` routing defect was real but separate: it did NOT cause the branded 500 (async query errors never reach `errorElement`).

## 6. Evidence
- Pre-fix prod: `/`, `/shop`, `/search` → `document 200 text/html`, `has500=true`, `console:error ... #185`, `React Router caught ... #185`, api `200 application/json`, `failed js chunks: 0`.
- Local dev: `getSnapshot should be cached` + `Maximum update depth exceeded ... in <Header>`.
- Post-fix local preview (prod build): `has500=false`, full homepage body rendered.
- Post-deploy prod (commit `a9caff9`): `/`, `/shop`, `/search` → `has500:false`, no #185, no `Unexpected token '<'`; `/search` fix verified after second deploy. Extended flows (`/product/fin3-prod-mtmwd3up`, `/cart`, `/login`, `/search?q=test`) all `has500:false`, all API to `https://nabome-api.pages.dev/api/v1/...`, zero bad responses.
- Only remaining console error everywhere: `beacon.min.js ... violates CSP script-src` (Cloudflare analytics vs page CSP meta; benign, pre-existing, unrelated).

## 7. Confirmed API Routing Defects
- `use-products.ts:12-14`, `use-categories.ts:12-14`, `use-collections.ts:12-14`: `import.meta.env.VITE_PUBLIC_API_URL ? ... : '/api/v1'` → relative `/api/v1` on Pages (Vite replaces with `{}` since Pages has no such env) → `200 text/html` SPA fallback → `SyntaxError` in query fns. CONFIRMED via `curl https://www.nabome.online/api/v1/products/featured` → `200 text/html <!doctype html>`.
- `use-search.ts:85`: hardcoded `'/api/v1'`. CONFIRMED.
- `payment/hooks.ts:29,56,86,113,152,179`: `/api/payments...` (no version). CONFIRMED by source.
- `Footer.tsx:30`: `/api/v1/newsletter/subscribe`. CONFIRMED.
- `account/pages/WishlistPage.tsx:49,63,75,338`: `/api/v1/wishlist/...`. CONFIRMED.
- `order-store.ts:61-62`: `import.meta.env.VITE_PUBLIC_API_URL ?? ''` + `${API_BASE}/api/v1/orders...` → when env absent produces `/api/v1/orders/...` relative (single, not double, prefix). CONFIRMED.
- `home/hooks/use-homepage.ts:16`: `/api/homepage`. `lib/cms.ts:51,67`: `/api/cms/...`. CONFIRMED by source.
- No axios/ky/graphql/XMLHttpRequest/custom wrappers found; all HTTP goes through `fetch` or shared `api` client (already correct).

## 8. Code Changes
- Commit `234b33e` — `fix(customer): resolve production 500 infinite loop and unify API base URL` (11 files):
  - `shared/layout/Header.tsx`: stable selector (`useCartStore((s) => s.cart)` + module `EMPTY_CART_ITEMS` fallback) — the 500 fix.
  - `features/catalog/hooks/use-products.ts`, `use-categories.ts`, `use-collections.ts`: `const API_BASE = \`${appConfig.PUBLIC_API_URL}/api/v1\`` via `@/lib/config`.
  - `features/search/hooks/use-search.ts`: same single source of truth.
  - `features/payment/hooks.ts`: `API_BASE` from `appConfig`; `/api/payments/methods`→`${API_BASE}/payments/methods`, `/api/payments/create`→`${API_BASE}/payments` (matches backend `POST payments`), `/api/payments/retry`→`${API_BASE}/payments/verify` (matches backend `POST payments/verify`), detail/history similarly prefixed.
  - `shared/layout/Footer.tsx`: newsletter → `${API_BASE}/newsletter/subscribe` (matches backend `POST newsletter/subscribe`).
  - `features/account/pages/WishlistPage.tsx`: wishlist bulk endpoints → `${API_BASE}/wishlist/...` (matches backend).
  - `stores/order-store.ts`: `API_BASE` from `appConfig`, paths de-duplicated to `${API_BASE}/orders...` (was `${API_BASE}/api/v1/orders...` → would have become `/api/v1/api/v1`).
  - `features/home/hooks/use-homepage.ts`: homepage → `${appConfig.PUBLIC_API_URL}/api/v1/homepage` (matches backend `GET homepage`).
  - `lib/cms.ts`: `${appConfig.PUBLIC_API_URL}/api/v1/cms/pages|homepage`.
- Commit `a9caff9` — `fix(customer): render category name on search results to prevent error 31` (1 file):
  - `features/catalog/pages/SearchResultsPage.tsx:211-215`: render `typeof category === 'string' ? category : category.name`.
- Deliberately untouched: commented `fetch('/api/analytics/events')` in `wishlist/events.ts:115` (dead code, no backend route), `VITE_TURNSTILE_SITE_KEY` fallbacks (public, optional), backend API (no changes needed).

## 9. Environment Changes
- None. No secrets rotated, no vars added, no schema changes.
- `VITE_PUBLIC_API_URL` remains intentionally referenced only in `lib/config.ts:7` (build-time override) with runtime hostname fallback to `https://nabome-api.pages.dev`, plus type declaration `types/env.d.ts:9`. Pages env injection is NOT required for the fix; production hostname resolves correctly (verified in deployed bundle behavior).
- Verified: `VITE_ENVIRONMENT` (optional, fallback covers), `VITE_TURNSTILE_SITE_KEY` (optional, `""` allowed).

## 10. Tests
- `pnpm --filter @nabome/customer typecheck`: PASS (`tsc --noEmit`, 0 errors) — before and after search fix.
- `pnpm --filter @nabome/customer lint`: PASS (0 errors, 121 pre-existing warnings).
- `pnpm --filter @nabome/customer test`: PASS — 11 files, 121 tests, including `Header.test.tsx` (5), `Footer.test.tsx` (4), `client.test.ts` (4).

## 11. Build Verification
- `pnpm --filter @nabome/customer build`: PASS (`index-CIckRm0O.js` + 27 chunks).
- Dist forensics: zero `"/api` relative literals across all chunks; `localhost:8788` appears only inside the zod schema default string (validator fallback, never used as a request URL on production hostname); `https://nabome-api.pages.dev` present as `Cn` fallback; `use-products-DDLdfEe5.js` uses `` `${t.PUBLIC_API_URL}/api/v1` ``; no `undefined/api`, no double `/api/v1/api/v1`.

## 12. Cloudflare Verification
- Pages projects: `nabome` → `nabome.pages.dev, nabome.online, www.nabome.online` (Git Provider: Yes); `nabome-api` → `nabome-api.pages.dev` (wrangler-deployed); `nabome-api-staging` (untouched).
- API `nabome-api.pages.dev`: `/api/v1/health`, `/products?limit=2`, `/categories`, `/search?q=test` all `200 application/json`, valid JSON, `access-control-allow-origin: https://www.nabome.online` + `allow-credentials: true`, preflight `204`. Request IDs present (`meta.requestId`).
- `wrangler.jsonc` (api): `ENVIRONMENT=production`, `PUBLIC_API_URL=https://nabome-api.pages.dev`, `CORS_ORIGINS=https://www.nabome.online,https://nabome.online`, KV `6969b592…`, Hyperdrive `e2b5c6e70f…`, `compatibility_date 2026-07-15 + nodejs_compat`. No changes needed; API not redeployed.
- Customer deploy did not alter API, bindings, secrets, or compatibility settings.

## 13. Deployment
- Commit `234b33e` built (`index-CIckRm0O.js` at that point covered both fixes except search page) → `wrangler pages deploy apps/customer/dist --project-name nabome --branch production` → Deployment `bbeb42a3-3081-44be-abff-067dcec4649f` (`https://bbeb42a3.nabome.pages.dev`, Source `234b33e`, Production).
- Commit `a9caff9` rebuilt (same entry hash `index-ClQJ5wNn.js`... entry renamed after content change) → same deploy command → Deployment `41ea2acb-80dc-4c5a-b5e1-180036547ed5` (`https://41ea2acb.nabome.pages.dev`, Source `a9caff9`, Production, status listed as current).
- `www.nabome.online/` served the new `index.html` (`index-CIckRm0O.js`, then `index-ClQJ5wNn.js`) on first poll after each deploy — no source/deployment divergence (deployment Source SHA equals local HEAD at deploy time).
- API was NOT deployed (no API changes).

## 14. Post-Deployment Browser Verification
- `/`, `/shop`, `/search`: `document 200 text/html`, `has500:false`, no #185, no `Unexpected token '<'`, zero failed JS/CSS chunks.
- API calls observed: `/` → 3× `GET https://nabome-api.pages.dev/api/v1/products/{featured,new,trending}?limit=8` (200 JSON); `/shop`, `/search` → `GET https://nabome-api.pages.dev/api/v1/products?` (200 JSON). Zero fetches to `www.nabome.online/api/...`. Zero HTML-where-JSON.
- Extended: `/product/fin3-prod-mtmwd3up` → `GET .../products/slug/...` 200, renders; `/cart` → `GET .../cart` (auth 401 JSON handled, page renders); `/login` renders, no API; `/search?q=test` renders.
- Remaining issue: none blocking. Only benign `beacon.min.js` CSP console error (Cloudflare analytics vs page CSP; does not affect rendering or API).

## 15. API Verification
| Endpoint | Status | Content-Type | CORS | Result |
|---|---|---|---|---|
| `GET /api/v1/health` | 200 | application/json | allow-origin `https://www.nabome.online`, credentials true | `status:ok, environment:production` + requestId |
| `GET /api/v1/products?limit=2` | 200 | application/json | same | envelope + 2 products |
| `GET /api/v1/categories` | 200 | application/json | same | 3 categories |
| `GET /api/v1/search?q=test` | 200 | application/json | same | results envelope |
| `OPTIONS /api/v1/products` (preflight) | 204 | — | allow-methods/headers, max-age 86400 | PASS |

## 16. Cache/Asset Verification
- Pre-fix mismatch (prod `index-jw1Pp2NT.js` vs local `index-yJayCua6.js`) resolved: prod `index.html` now references `index-ClQJ5wNn.js`, matching local `dist/index.html` from commit `a9caff9`.
- `index.html` references only same-build assets (all `use-products-DDLdfEe5.js`, `SearchResultsPage-*`, etc. from the same `vite build`).
- No purge performed (edge showed new HTML on first poll; `cf-cache` for HTML is dynamic, JS carries content hashes + etag). Old bundles remain addressable by hash but are no longer referenced.

## 17. Remaining Issues
- Benign: `beacon.min.js` blocked by page CSP (`script-src 'self'`). Cloudflare Pages Analytics will not record; app unaffected. Fix (if desired) is to add `https://static.cloudflareinsights.com` to CSP `script-src` — out of scope for this P0, no action taken.
- Localhost preview quirk: on non-nabome hostnames `appConfig` falls back to `http://localhost:8788`, which the page CSP blocks. Production hostname unaffected. No action required.
- `useSearch` query text still not sent to `useProducts` on `/search` (params only carry category/sort); search page lists products rather than filtered results. Functional gap, not a 500 cause; left for product follow-up.

## 18. Final Production Status
- Production is verified: no ServerErrorPage on `/`, `/shop`, `/search`, product detail, cart, login; all API traffic absolute to `https://nabome-api.pages.dev/api/v1`; no HTML-where-JSON; no uncaught exceptions; no failed chunks.

---

PRODUCTION STATUS: PASS

500 ROOT CAUSE:
Unstable zustand selector in Header (state.cart?.items ?? []) returned a new array per snapshot, causing an infinite render loop (React error 185) caught by the root errorElement, with a second object-as-child crash on /search (category object rendered directly, React error 31).

API ROUTING STATUS:
FIXED

BROWSER STATUS:
PASS

TEST STATUS:
PASS

DEPLOYMENT STATUS:
DEPLOYED

COMMIT:
a9caff9f570c2d9d8562fc7c8aa62b5af52c34cb

DEPLOYMENT ID:
41ea2acb-80dc-4c5a-b5e1-180036547ed5

REMAINING BLOCKER:
none
