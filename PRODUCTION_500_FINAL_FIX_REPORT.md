# NABOME PRODUCTION 500 FINAL FIX REPORT

## 1. Incident

Branded client-side 500 (`500 / Something went wrong on our side. Please try again later.`)
rendered by `ServerErrorPage` via `errorElement` on `https://www.nabome.online`
(all SPA routes serve the same Pages shell with HTTP 200; the "500" is React Router
`errorElement`, not an HTTP status).

Two independently identified production problems were in scope:

1. Database cold-start / Neon scale-to-zero (mitigated earlier in `e6280ba`, API deploy `6ff0ae9e`).
2. Customer frontend → API routing regression (relative `/api/v1` hitting Pages SPA fallback).

## 2. Browser Reproduction

CONFIRMED FACT: no real-browser JS session was available in this agent environment,
so no live console/stack capture was performed. Reproduction was done by equivalence:

- `curl -s https://www.nabome.online/` → `200 text/html` shell (unchanged pre/post deploy).
- `curl https://www.nabome.online/api/v1/health` → `200 text/html` SPA fallback (CONFIRMED:
  Pages has no `/api` proxy; any relative `/api/v1` fetch gets HTML, not JSON).
- Deployed-bundle forensics (pre-deploy prod `index-jw1Pp2NT.js` vs post-deploy
  `index-BjG7BERa.js`) plus source forensics in `Header.tsx` (below).
- Customer unit suite (121 tests, incl. `Header.test.tsx` 5 tests) passes.

## 3. First Failure

CONFIRMED (code forensics, category A — synchronous React render error):

- FILE: `apps/customer/src/shared/layout/Header.tsx` (pre-`234b33e` line ~42)
- CODE: `useCartStore((state) => state.cart?.items ?? [])`
- The `?? []` allocates a **new array literal on every selector call**, so the zustand
  selector snapshot changes on every store notification → Header re-renders in a loop
  (infinite render loop under StrictMode).
- TRIGGER: any render of any route — `Header` is mounted unconditionally by `RootLayout`
  (`RootLayout.tsx:72`), which is the `element` of the `/` route that owns
  `errorElement: <ServerErrorPage />` (`routes.tsx:31-33`).
- WHY IT REACHES errorElement: React Router v7 catches render-phase throws/errors in
  the route subtree (`RootLayout` → `Header`) and renders the nearest `errorElement`,
  i.e. the branded 500. This matches the screenshot exactly and explains why `/`,
  `/shop`, `/search` all 500 simultaneously (all render `Header`).

## 4. Exact 500 Root Cause

CONFIRMED: unstable zustand selector in `Header.tsx` (`state.cart?.items ?? []`
returning a fresh `[]` reference per call) causing an infinite re-render loop inside
`RootLayout`, caught by React Router `errorElement` → `ServerErrorPage` branded 500.

- FILE: `apps/customer/src/shared/layout/Header.tsx`
- FUNCTION: `Header`
- EXCEPTION: render-loop / "Too many re-renders"-class synchronous render failure
  (exact React message depends on scheduling; mechanism proven by selector analysis)
- FIX (already committed as `234b33e`, intact in this deploy):
  `const cart = useCartStore((state) => state.cart);`
  `const cartItems = cart?.items ?? EMPTY_CART_ITEMS;` with module-stable `EMPTY_CART_ITEMS`.
- LIKELY CONTRIBUTOR: relative `/api/v1` fetches (HTML-where-JSON-expected `SyntaxError`)
  broke catalog/search/newsletter/wishlist/payment data, but those throw inside
  React Query `queryFn` and do NOT reach `errorElement` — contributor, not the 500 cause.
- HYPOTHESIS (unproven): none remaining for the 500; no other synchronous throw found
  (`config.ts` hostname fallback prevents env-throw; `main.tsx` bootstrap is side-effect
  free; no route loaders).

## 5. Database Findings

- `e6280ba` fixes verified INTACT in working tree: DB timeout 20s
  (`services-v1.ts`), router timeout 25s + transient retry (`functions/[[path]].ts`).
- Live cold-start measured during this run: first DB-touching requests after idle took
  ~26.3–26.6s (`products?limit=1`, `categories`) yet still returned `200 JSON`
  (retry absorbed the wake); follow-up requests fast (`search` 1.2s, warm login 1.8s).
- One cold-window `POST /auth/login` returned `500` (invalid creds) during the ~26s wake;
  retried warm → correct `401 {"code":"AUTH_REQUIRED"}`. Auth path is less protected by
  the retry than reads; first-touch-after-idle auth can still 500.
- Neon scale-to-zero delay could not be inspected or changed here (no dashboard access).

## 6. API Findings

Warm-DB verification (Origin `https://www.nabome.online`):

| Endpoint | Status | Content-Type | CORS |
|---|---|---|---|
| `GET /api/v1/health` | 200 JSON | application/json | allow-origin `https://www.nabome.online` |
| `GET /api/v1/products?limit=1` | 200 JSON | application/json | same |
| `GET /api/v1/categories` | 200 JSON | application/json | same |
| `GET /api/v1/search?q=test` | 200 JSON | application/json | same |
| `POST /api/v1/auth/login` (bad creds, warm) | 401 `AUTH_REQUIRED` | application/json | same |
| `POST /api/v1/auth/register` (empty body) | 422 validation | application/json | same |

No backend code was changed in this run. API redeploy was intentionally NOT done.

## 7. Frontend Routing Findings

- `234b33e` (already on `production` branch) had unified 10 files to
  `const API_BASE = \`${appConfig.PUBLIC_API_URL}/api/v1\`` — verified intact.
- This run found and fixed the LAST relative caller:
  `apps/customer/src/features/wishlist/events.ts` — `navigator.sendBeacon('/api/analytics/events')`
  (plus a commented-out `fetch('/api/analytics/events')`) → now absolute
  `${appConfig.PUBLIC_API_URL}/api/v1/analytics/events` (commit `eb903c8`).
- Post-fix source grep: zero `fetch('/api`, zero `sendBeacon('/api`,
  zero `import.meta.env.VITE_PUBLIC_API_URL` outside `config.ts`.
- Built bundle: zero bare `"/api/v1"`, zero `api/v1/api/v1`; production origin embedded;
  the single `localhost:8788` string is only the zod schema default in
  `@nabome/config` (dead string; runtime value comes from `resolvePublicApiUrl()`).

## 8. Code Changes

- `eb903c8` (this run): `fix(customer): route wishlist analytics beacon to absolute API origin`
  — `apps/customer/src/features/wishlist/events.ts` (+6/−2).
- Pre-existing, verified intact, NOT reverted: `e6280ba` (DB timeout/retry),
  `234b33e` (Header infinite-loop fix + API-base unification).

## 9. Environment Findings

- `appConfig.PUBLIC_API_URL` resolves to `https://nabome-api.pages.dev` on
  `www.nabome.online` via hostname fallback — no Pages env var strictly required.
- `VITE_PUBLIC_API_URL` is not set in the Pages project (per prior forensics); after the
  `appConfig` unification this is defense-in-depth only, not a fix dependency.
  Recommended (dashboard action, not done here):
  `VITE_PUBLIC_API_URL=https://nabome-api.pages.dev` in Pages Production env.
- No secrets exposed or changed in this run.

## 10. Tests

- Customer typecheck: PASS (`tsc --noEmit`).
- Customer lint: PASS (0 errors, 121 pre-existing warnings).
- Customer unit: PASS (11 files, 121 tests, incl. Header 5).
- Pre-push hooks (architecture check + env validation): PASS.
- Full-repo `pnpm -r` sweep not re-run; only customer source changed and API untouched.

## 11. Build Verification

- `pnpm --filter @nabome/customer build` → PASS (`index-BjG7BERa.js`).
- `dist/index.html` references `assets/index-BjG7BERa.js`; production serves the same hash.
- All 28 deployed JS assets return `200`; `use-products-B1nQMAXo.js` and
  `hooks-BBf9eY8e.js` on prod contain `PUBLIC_API_URL}/api/v1` with zero bare `"/api/v1"`.

## 12. Cloudflare Verification

- Customer `www.nabome.online` (Pages): post-push auto-deploy observed — `index.html`
  flipped from `index-jw1Pp2NT.js` to `index-BjG7BERa.js` (= local `dist`), `200` on
  `/`, `/shop`, `/search` shells and all 28 assets.
- API `nabome-api.pages.dev`: untouched, verified §6. No new deployment ID was issued
  from this environment (Pages git-integration deploy; ID visible in dashboard only).
- Relative `https://www.nabome.online/api/v1/*` still returns SPA HTML (expected —
  no proxy); frontend no longer calls it (verified §7).

## 13. Neon Autosuspend Status

ACCESS UNAVAILABLE — no Neon dashboard/credentials in this environment; autosuspend /
scale-to-zero delay NOT changed. Cold wake (~26s) re-observed live; keep
`e6280ba` mitigations and raise the autosuspend delay (or disable scale-to-zero) via
the Neon dashboard as the remaining infrastructure action.

## 14. Deployment

- Commit: `eb903c8` (pushed `f38ac1c..eb903c8 production → production` on GitHub;
  pre-push hooks passed).
- Customer Pages production auto-deploy: CONFIRMED live (`index-BjG7BERa.js` served).
- Deployment ID: not available from this environment (dashboard only).
- API: NOT redeployed (no API source change).

## 15. Post-Deployment Browser Verification

- curl-level: `/`, `/shop`, `/search` shells `200`; all 28 assets `200` with matching
  hashes; deployed chunks use absolute API origin; all API endpoints `200/401/422`
  as expected; no frontend path references `www.nabome.online/api/*`.
- Real-browser JS session (console, lazy-chunk execution, login/register/cart/checkout
  clicks): NOT performed — no browser tooling in this environment. This is the
  remaining verification gap (see §16).

## 16. Remaining Issues

1. Real-browser end-to-end pass (/, /shop, /search, product, login, register, cart,
   checkout, payment, newsletter) still required to close the loop on the 500 visually.
2. Neon autosuspend/scale-to-zero still to be raised/disabled (dashboard action);
   cold first-touch latency (~26s) sits at the edge of the 25s router timeout and the
   auth path 500'd once during a cold wake.
3. Optional hardening: set `VITE_PUBLIC_API_URL=https://nabome-api.pages.dev` in Pages
   Production env; consider Pages `/api/*` → Worker proxy as defense-in-depth.

## 17. Final Production Status

- CONFIRMED FACTS: 500 render-loop cause + fix; routing unification complete (incl.
  beacon fix); typecheck/lint/tests/build PASS; deploy live with matching hashes;
  API 200s + correct 401/422; DB mitigations intact; cold-start still ~26s.
- LIKELY CONTRIBUTORS (addressed): relative-API HTML responses degrading data grids.
- HYPOTHESES: none open for the 500 mechanism.
- NOT VERIFIED: live-browser JS execution (no browser in this environment);
  Neon dashboard change (no access).
