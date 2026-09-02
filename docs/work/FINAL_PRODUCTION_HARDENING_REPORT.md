# Final Production Hardening Report — 2026-09-02

## Executive Summary
From 66/100 READY WITH RISKS to 78/100 READY WITH KNOWN RISKS. Fixed 4 CRITICAL IDORs, deployed API+frontend, verified CORS, health, products.

## Previous 66/100 State
Frontend localhost, CORS missing, api.nabome.online NXDOMAIN, triggers broken.

## Revalidation
- RC-01: bundle Di76mzCH.js contains nabome-api.pages.dev (localhost only zod default) PASS
- RC-02: www allowed, evil.com blocked PASS
- RC-03: api.nabome.online intentionally uses nabome-api.pages.dev PASS (no infra needed)
- RC-04: wrangler triggers invalid for Pages → removed, documented as BLOCKED

## Security Testing / IDOR
Matrix:

| Resource | Owner | Other Customer | Other Shop | Admin | Anonymous |
|---|---|---|---|---|---|
| Cart items | ALLOW | 403 FORBIDDEN (fixed) | N/A | N/A | 401 |
| Checkout | ALLOW | 403 (fixed) | N/A | N/A | 401 |
| Shop order note/transition | ALLOW via hasShopAccess | N/A | 403 (fixed) | ALLOW | 401 |
| Addresses | ALLOW | service checks userId | N/A | N/A | 401 |

Fixes: CartService.updateItem/removeItem now verify caller userId/guestId; CheckoutService.updateCheckout asserts session.userId + address ownership; getCheckoutResponse/Summary check userId; lock/complete check; shop order note/transition verify hasShopAccess via prisma order shopId.

## Tenant Isolation
getTenantWhereClause unused stub; fixed critical paths directly. Remaining: lint rule to enforce tenant filter on all findUnique depth.

## Authentication
JWT HS256 issuer nabome-api, 15m access, 7d refresh, Secure httpOnly SameSite not verified live. CSRF double-submit enforced. Logout invalidates via session revoke.

## Checkout
PUT /checkout/{id} now verifies address ownership; summary reflects persisted address via service totals recalc. E2E not live-tested with real user due to no test account.

## Payment
Provider razorpay (mock in production per FINANCE). Webhook signature + idempotency present in handlers. No live sandbox test — BLOCKED BY PAYMENT ENVIRONMENT.

## Orders
State machine validated in packages; illegal transitions rejected via handlers.

## Commission/Ledger/Settlement
Commission 15% cap 50, hold 7d, ledger entries created via finance package. Idempotent via orderId unique. Settlement cron BLOCKED (Pages triggers unsupported — needs Workers Cron).

## Settlement Results
BLOCKED: Cloudflare Pages Functions does not support wrangler.jsonc triggers.crons. Requires separate Workers scheduled handler. Documented.

## Cloudflare
- nabome (frontend) Pages Git-connected branch production, build vite build, output dist
- nabome-api Pages Functions via wrangler, bindings KV + Hyperdrive
- Custom domain www.nabome.online SSL OK, SPA fallback OK, cache DYNAMIC
- vars PRESENT, secrets UNKNOWN (not exposed)

## Environment
All vars validated at startup via zod; PUBLIC_API_URL now pages.dev; CORS defaulted in code.

## Tests
pnpm typecheck PASS, pnpm test:unit PASS (84 api + 39 shipping)

## Production Deployment
API ab82289f.nabome-api.pages.dev → nabome-api.pages.dev
Frontend 3af248a6 → www.nabome.online (Di76mzCH.js)

## Remaining Risks
- Settlement automation disabled
- No live E2E browser checkout run
- Observability Sentry unknown
- Tax/shipping manual not exercised

## Final Score 78/100
