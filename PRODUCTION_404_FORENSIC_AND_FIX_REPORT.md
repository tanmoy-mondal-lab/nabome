# NABOME PRODUCTION 404 FORENSIC AND FIX REPORT

## 1. Executive Summary

Forensic audit of `https://www.nabome.online` (customer SPA, `apps/customer`) found
**27 customer-facing URLs that rendered the app's NotFound page** (HTTP 200 + `404 /
Page not found` UI — Cloudflare Pages serves `index.html` for all paths, so every
frontend 404 is a "soft 404"). No backend API 404s were observed during the crawl.

Root causes: (1) navigation links pointing at unregistered routes, (2) genuinely
unimplemented CMS/account pages linked from Header/Footer/Dashboard, (3) a
**route-guard bypass**: `element: <ProtectedRoute/>` combined with `lazy:` on the
same route object — React Router v7 gives `Component` precedence over `element`
(`"Component will be used"`), so the guard was discarded once the chunk loaded and
guests saw `/checkout` content plus an unhandled `User not authenticated` error.

All confirmed defects were fixed, guards restored, and the full suite
(typecheck / lint / 212 tests / build / 36 headless-Chromium checks) passes.

## 2. Complete Route Inventory

Source: `apps/customer/src/app/routes.tsx` (before fix). All lazy code-split.

| ROUTE | PAGE COMPONENT | ACCESS | EXPECTED | SOURCE FILE |
|---|---|---|---|---|
| `/` | HomePage | public | 200 render | features/catalog/pages/HomePage.tsx |
| `/shop` | ShopPage | public | 200 render | features/catalog/pages/ShopPage.tsx |
| `/shop/:category` | ShopPage | public | 200 render | (same) |
| `/product/:slug` | ProductDetailPage | public | 200 / own not-found for bad slug | features/catalog/pages/ProductDetailPage.tsx |
| `/search` | SearchResultsPage | public | 200 render | features/catalog/pages/SearchResultsPage.tsx |
| `/cart` | CartPage | public | 200 render | features/cart/pages/CartPage.tsx |
| `/checkout` | CheckoutPage | protected | redirect guest → `/login` | features/checkout/pages/CheckoutPage.tsx |
| `/order-confirmation/:orderId` | OrderConfirmationPage | protected | redirect guest → `/login` | features/checkout/pages/OrderConfirmationPage.tsx |
| `/login`, `/register` | LoginPage/RegisterPage | guest-only | 200 render | features/account/pages/ |
| `/account` | AccountDashboardPage | protected | redirect guest → `/login` | features/account/pages/AccountDashboardPage.tsx |
| `/account/orders` | OrdersPage | protected | redirect guest → `/login` | features/account/pages/OrdersPage.tsx |
| `/account/orders/:orderId` | OrderDetailPage | protected | redirect guest → `/login` | features/account/pages/OrderDetailPage.tsx |
| `/account/addresses` | AddressBookPage | protected | redirect guest → `/login` | features/account/pages/AddressBookPage.tsx |
| `/account/wishlist` | WishlistPage | protected | redirect guest → `/login` | features/wishlist/pages/WishlistPage.tsx |
| `/forbidden` | ForbiddenPage | public | 200 render | shared/pages/ForbiddenPage.tsx |
| `*` | NotFoundPage (`404 / Page not found`) | public | controlled 404 UI | shared/pages/NotFoundPage.tsx |

New routes added by this fix: `/wishlist` (protected, spec-canonical URL per
`docs/work/04-customer.md` §1.3), public placeholders `/about /careers /press
/sustainability /help/contact /help/shipping /help/returns /help/faq
/legal/terms /legal/privacy /legal/cookies /legal/refunds`, protected placeholders
`/account/payments /account/settings /account/returns` (all via the codebase's own
`PlaceholderPage` pattern for unshipped foundation routes).

## 3. Discovered 404s

Method: headless Chromium (Playwright 1.62.1) crawl of 40 production URLs —
rendered body inspected for `404 / Page not found`, plus console/page/network errors.
All HTTP statuses were 200 (SPA fallback); verdicts below are rendered-UI verdicts.

404-UI confirmed (27): `/wishlist /categories /products /products/:slug /about
/careers /press /sustainability /help/contact /help/shipping /help/returns /help/faq
/legal/terms /legal/privacy /legal/cookies /legal/refunds /forgot-password
/account/login /account/payments /account/settings /account/returns
/account/orders/:id/cancel /account/orders/:id/return` (+ intentional `/nonexistent-xyz-123`).

Valid (no 404): `/ /shop /shop/:category /search /login /register /cart /account*
/checkout*` (*`/checkout` rendered guest-visible content due to the guard bypass —
defect, fixed).

## 4. 404 Classification

| URL(s) | Class | Explanation |
|---|---|---|
| `/wishlist` (Header x2, BottomNavigation) | B | Canonical per spec §1.3, but only `/account/wishlist` was registered |
| `/categories` (Header) | A | No such route; catalog surface is `/shop` |
| `/products`, `/products/:slug` (CartPage, WishlistPage) | B | Canonical is `/shop`, `/product/:slug` |
| `/account/login` (WishlistPage) | B | Canonical is `/login` |
| `/account/orders/:id/cancel` (OrdersPage) | A | No cancel page; real cancel action lives on the order detail page |
| `/account/orders/:id/return` (OrderDetailPage) | A | No return-request UI exists (returns/page.tsx is mock-data/Next.js leftover, unrouted) |
| `/forgot-password` (LoginPage) | A | No page and no backend reset endpoint |
| `/help/* /about /careers /press /sustainability /legal/*` (Footer, HomePage) | A | Intended CMS routes (`lib/cms.ts isCmsManagedPage`) never implemented |
| `/account/payments /account/settings /account/returns` (Dashboard) | A | Linked from quick actions, never implemented |
| `/checkout`, `/order-confirmation/:id` guest-visible | H | Guard bypass (see §10.4), not a 404 but a protection defect found via this audit |
| API 404s | — | None observed; newsletter/wishlist handlers registered (`apps/api/_handlers`) |

## 5. Broken Navigation Links

Fixed at the link source except where a missing route was the correct fix:

- `Header.tsx:156` `/categories` → `/shop`
- `CartPage.tsx:74,213` `/products` → `/shop`
- `account/pages/WishlistPage.tsx:164` `/products` → `/shop`; `:274`
  `/products/:slug` → `/product/:slug`; `:376` `/account/login` → `/login`
- `OrdersPage.tsx:129` quick-cancel `/account/orders/:id/cancel` → detail page
  `/account/orders/:id` (hosts the real in-page cancel action)
- `account/pages/OrderDetailPage.tsx:283` `navigate(.../return)` → button disabled
  with `title="Return requests are coming soon"` (no return-request UI exists;
  not fabricated)
- `LoginPage.tsx:128` dead `/forgot-password` anchor → disabled text noting
  password reset is coming soon (no backend reset flow exists; not fabricated)

## 6. Dynamic Route Findings

All product links use canonical `/product/:slug` except the one WishlistPage
`/products/:slug` (fixed). `/shop/:category` links (`/shop/sale`, `/shop/new-arrivals`)
render correctly. Unknown slugs (e.g. `/product/no-such-slug-xyz`) render the product
page's own handling without app crash — no fake pages created for missing objects.

## 7. API 404 Findings

Zero API 404s in the crawl. `POST /api/v1/newsletter/subscribe` and wishlist
endpoints map to registered handlers (`apps/api/_handlers/newsletter`,
`apps/api/_handlers/wishlist`). No API changes made.

## 8. Cloudflare Findings

Production serves `index.html` with HTTP 200 for every path (fallback works —
likely dashboard-configured). The repo contained no `_redirects`, so the behavior
was undocumented-in-code. Added `apps/customer/public/_redirects` with
`/* /index.html 200` (verified emitted to `dist/`), codifying — not changing —
existing SPA routing.

## 9. Build/Chunk Findings

Fresh `vite build`: all 16 lazy page chunks emitted (`ShopPage`, `ProductDetailPage`,
`CheckoutPage`, `WishlistPage`, …), every asset referenced by `index.html` exists on
disk, no stale hashes, no case mismatches. PASS.

## 10. Exact Root Causes

### 10.1–10.3 Link/route mismatches and missing pages — see §4/§5.

### 10.4 Guard bypass (class H, security-relevant)

`routes.tsx` combined `element: <ProtectedRoute/>` (or `<GuestRoute/>`) with `lazy:`
on the same route object (`/checkout`, `/order-confirmation/:orderId`, `/login`,
`/register`). React Router v7 resolves `lazy` to `route.Component`, and the renderer
prefers `Component` over `element` (`"Component will be used"` —
`react-router/dist/development/chunk-*.js`, `mapRouteProperties`/`_renderMatches`).
Once the chunk loaded, the guard element was discarded: guests saw checkout content
and threw unhandled `User not authenticated` (reproduced in production crawl and in
vitest). Fix: nest the lazy page as an `index` child under the guard element (the
`/account` pattern already used in this file) — guard now always renders.

## 11. Code Changes

- `apps/customer/src/app/routes.tsx` — added `/wishlist` + 15 placeholder routes;
  nested `checkout`, `order-confirmation/:orderId`, `login`, `register`, `wishlist`
  lazy pages under their guard elements; exported `routes` for testing.
- Link fixes: `Header.tsx`, `CartPage.tsx`, `account/pages/{WishlistPage,OrdersPage,
  OrderDetailPage,LoginPage}.tsx` (see §5).
- `apps/customer/public/_redirects` — new (`/* /index.html 200`).
- `apps/customer/src/app/routes.test.tsx` — new, 38 tests.

## 12. Test Results

- typecheck (`tsc --noEmit`): PASS
- lint (`eslint src`): PASS (0 errors, 121 pre-existing warnings)
- unit tests: PASS — `apps/customer` 12 files / 159 tests (incl. 38 new route tests:
  19 public routes render, 11 protected routes redirect guests to login, 8 unknown
  routes render NotFound); `packages/customer` 4 files / 53 tests
- build (`vite build`): PASS, `_redirects` emitted, all chunks present

## 13. Browser Verification

Fresh `vite preview` of the fixed build + headless Chromium, 36 checks: all valid
routes render without 404/console exceptions; all protected routes redirect guests
to login with no content leak; all invalid routes render controlled NotFound.
**36 pass / 0 fail.** Notably, the pre-fix production crawl showed checkout content
leaking to guests; post-fix it redirects to login.

## 14. Deployment

- COMMIT: `c4e4c85` (`fix(customer): resolve 404 audit findings`, pushed to
  `production`)
- DEPLOYMENT: via Cloudflare Pages dashboard auto-deploy watching `production`
  (no customer deploy job exists in `.github/workflows`; API-only `release.yml`).
  Dashboard pickup pending at time of writing — post-deploy crawl to be re-run once
  the new build is live; pre-deploy verification passed 36/36 on the identical
  production build output (`vite preview` + headless Chromium).

## 15. Remaining Intentional 404s

- `/nonexistent-xyz-123` and any other unregistered path → controlled NotFound page
  (correct).
- `/forgot-password`, order return-request flow, full CMS content, account
  payments/settings/returns remain unimplemented behind honest placeholders/disabled
  states — tracked as feature gaps, not defects.
- `features/orders/pages/OrderDetailPage.tsx` and `features/returns/page.tsx` are
  unrouted dead/mock code — left untouched, flagged for cleanup.

## 16. Final Status

All confirmed customer-facing route defects fixed; no regressions to
authentication (strengthened), cart, checkout, or API routing. Placeholder routes
are honest stubs per the codebase's `PlaceholderPage` pattern, not fake
functionality.
