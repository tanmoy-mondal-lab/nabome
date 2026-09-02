# Production Forensic Audit — 2026-09-02

## 1. Executive Summary
Live `https://www.nabome.online` rendered but all API-dependent features (catalog, cart, checkout, auth) were broken. Root causes: frontend baked with `localhost:8788` API URL, production CORS missing, and `api.nabome.online` DNS NXDOMAIN. Fixed via fallback logic, default CORS allowlist, and deploying API/frontend.

## 2. Production Environment
- Frontend: Cloudflare Pages `nabome` (nabome.pages.dev, nabome.online, www.nabome.online) — Git-connected
- API: Cloudflare Pages Functions `nabome-api` (nabome-api.pages.dev) — wrangler deploys
- API health before fix: 200 on `nabome-api.pages.dev/health` but `www.nabome.online/api/*` SPA fallback (HTML)
- DNS: `api.nabome.online` NXDOMAIN

## 3. Reproduction Results
| Route | HTTP | Rendered | JS | API | Result |
|---|---|---|---|---|---|
| `/` | 200 | Yes (SPA) | Loaded | BROKEN (localhost) | Blank catalog data |
| `/login` | 200 | Yes | Loaded | BROKEN | Auth fails |
| `/api/v1/products` on www | 200 HTML | N/A | N/A | 404 SPA fallback | FAIL |
| `nabome-api.pages.dev/health` | 200 | JSON | — | OK | PASS |

## 4. Browser Findings
- No JS errors, bundle loaded (`index-DRe7I8vo.js`)
- Bundle contained `http://localhost:8788` as API base
- CSP `connect-src 'self' https:` allowed https but not localhost

## 5. Network Findings
- `www.nabome.online/api/v1/products` → HTML (SPA fallback, not proxied to API)
- `nabome-api.pages.dev/api/v1/products` → JSON 200 without Origin, 404 with Origin before CORS fix, 200 after
- CORS before fix: `*` (Cloudflare default) or missing; after: specific origin with credentials

## 6-8. Frontend/API/Auth
- Frontend correctly code-splits via React Router lazy
- API router `[[path]].ts` + `_middleware.ts` functional
- Auth JWT/cookie extraction present, not broken

## 10-11. Tenant/RBAC
- `tenant-isolation.ts` and `shop/staff-service.ts` present, not audited for bypass in this pass
- No mass-assignment observed in checkout handlers

## 13-15. Commerce
- Payments: `clientAmount` server-validated in handler
- Tax/shipping zones present, not live-tested

## 14. Cloudflare
- `nabome` Pages project Git-connected; `nabome-api` needs wrangler deploy
- `wrangler.jsonc` triggers invalid for Pages

## 16. Security
- CORS now fail-closed (evil.com blocked)
- No secrets exposed

## 21. Root Causes
See `PRODUCTION_ROOT_CAUSE_REGISTER.md`

## 22. Fixes
- `apps/customer|admin|shop/src/lib/config.ts` — production fallback
- `apps/api/_lib/security.ts` — default allowlist
- `apps/api/wrangler.jsonc` — PUBLIC_API_URL, remove triggers
- Deployed API `f9b4f22a` and frontend `3af248a6`

## 23. Validation
- `pnpm typecheck` pass
- `curl` health 200, products 200 with correct CORS
- Frontend bundle contains production URL

## 24. Remaining Risks
- Cron settlement disabled
- `api.nabome.online` custom domain not provisioned
- Tenant isolation needs deeper IDOR tests
- No live checkout/order E2E run

## 25. Deployment Status
API: DEPLOYED `f9b4f22a.nabome-api.pages.dev` → `nabome-api.pages.dev`
Frontend: DEPLOYED `3af248a6.nabome.pages.dev` → `www.nabome.online` (index-Di76mzCH.js)
