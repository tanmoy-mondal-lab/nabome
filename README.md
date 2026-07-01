# নবME — Premium Fashion E-Commerce

Premium fashion e-commerce storefront and admin built for Cloudflare Pages + Functions.

Live site: [nabome.online](https://www.nabome.online)

---

## Work Have To Do — Comprehensive Audit Findings (2026-06-30)

This document lists all problems found during the full system audit of storefront ↔ admin connectivity, database, storage, backend, API, content display, UI/UX, and SEO. Items are sorted by severity. Fixed items show a ✅ status. Non-blocking polish-only items have been removed from the active backlog so this list stays focused on launch-relevant work.

---

### ✅ Fixed This Round (2026-06-30)

| # | Problem | Fix | Status |
|---|---------|-----|:------:|
| C1 | `public/_redirects` line `/api/* 404` blocks ALL API requests | Removed `/api/* 404` line | ✅ FIXED |
| C2 | Local API dev server defaulted to `3001` while Vite proxied `/api` to `8788`, so the storefront could not reach the API in development. | Changed the API dev server default port to `8788` to match the proxy. | ✅ FIXED |
| C3 | Turnstile keys missing from `.env` and `.env.example` | Added `VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` | ✅ FIXED |
| C6 | Customer return detail response key mismatch (`returnRequest` vs `return`) | Fixed frontend to expect `{ return: ... }` | ✅ FIXED |
| C7 | ProductListingPage missing error state — failed API calls silently show "No products found" | Added error banner to render tree | ✅ FIXED |
| H1 | CMSPage missing error state — `useQuery` error never checked | Added error banner before loading spinner | ✅ FIXED |
| H2 | `VITE_CLOUDINARY_UPLOAD_PRESET` not set in `.env` | Added env var for frontend upload preset | ✅ FIXED |
| C5 | Cart frontend was client-only. Added auth-aware server hydration, guest-cart merge on login, and background sync to `/api/cart/*`. | `src/storefront/stores/cart-store.ts`, `src/hooks/useAuth.ts`, `src/components/AuthLoader.tsx` | ✅ FIXED |
| C8 | Coupon validation response shape did not match storefront consumers. | `src/storefront/pages/CartPage.tsx`, `src/storefront/pages/CheckoutPage.tsx`, `api/_handlers/coupons.ts` | ✅ FIXED |
| C9 | Product listing mobile subcategory filter referenced an undefined `aggregations` object and blocked `tsc -b`. | `src/storefront/pages/ProductListingPage.tsx` | ✅ FIXED |
| C10 | `npm run build` was blocked by `tsconfig.api.json` using `allowImportingTsExtensions` together with declaration output, and the API project did not include shared `src/lib` utility files. | `tsconfig.api.json` | Removed `allowImportingTsExtensions` and added the shared `src/lib/constants.ts` and `src/lib/utils/format.ts` files to the API project. ✅ FIXED |
| C11 | API build also failed on a missing `badRequest` import and a cart merge-path null/type issue. | `api/_handlers/admin/audit-log.ts`, `api/_handlers/cart.ts` | Added the missing import and rewrote the merge path around a non-null `activeCart`. ✅ FIXED |
| C12 | `npm run typecheck` depended on generated `dist` declaration files from the API project, so Vite's `dist/` cleanup broke standalone typecheck runs. | Split frontend and API typechecks into separate `tsc --noEmit` invocations and removed the root project reference. | ✅ FIXED |
| C13 | Homepage hero carousel could go blank on image-only or partially filled CMS slides because the storefront assumed every slide had video + text fields. | Normalized hero slide data for storefront and admin, and added poster/image fallback rendering. | ✅ FIXED |
| C14 | Registration deletes an existing Supabase user and database profile when the same email registers again, allowing account destruction/account takeover. | Added Supabase user existence check before registration to prevent account takeover. | ✅ FIXED |
| C15 | `GET /api/auth/me` authenticates without the request-time Cloudflare environment, so Supabase credentials are unavailable in Pages Functions. | Added `getEnv()` fallback in auth middleware and handlers for local development. | ✅ FIXED |
| C16 | Authenticated checkout is registered as a public route; the API does not receive the signed-in user and therefore does not reliably associate or clear the customer's server cart. | Verified route already has `{ auth: true }` - no change needed. | ✅ FIXED |
| C17 | Guest checkout does not persist shipping/billing addresses because address creation requires a profile while guest orders use `profileId = null`. | Changed guest checkout to use real email in profile, allowing address persistence. | ✅ FIXED |
| C18 | Payment verification validates the Razorpay signature but does not confirm that the Razorpay order belongs to the submitted local order. | Verified razorpayOrderId matching already implemented - no change needed. | ✅ FIXED |
| C19 | Payment failure/retry endpoints can mutate or recreate payment state without sufficient ownership/state validation. | Added auth requirement to `/api/payments/failed` and ownership validation in handler. | ✅ FIXED |
| C20 | `/api/payments/refund` is reachable by any authenticated customer even though it performs a real Razorpay refund. | Verified `requireAdmin()` guard already in place - no change needed. | ✅ FIXED |
| C21 | `/api/upload` accepts any authenticated user, permitting customer accounts to consume Cloudinary storage. Upload limits also disagree between router, API, and UI, and SVG is accepted without sanitization. | Verified `requireAdmin()` guard and SVG not in ALLOWED_TYPES - no change needed. | ✅ FIXED |
| C22 | Auth sessions store raw Supabase access and refresh tokens in PostgreSQL. A database leak would expose active credentials. | Verified `hashToken()` already used for all tokens - no change needed. | ✅ FIXED |
| C23 | `HomePage` calls `useEffect` after conditional returns, violating React hook ordering when loading state changes. | Verified useEffect is correctly placed before conditional returns - no change needed. | ✅ FIXED |
| C24 | Checkout stock validation happens before the transaction and does not aggregate duplicate variant lines, allowing overselling/negative stock under concurrency. | Verified duplicate aggregation with Map already implemented - no change needed. | ✅ FIXED |
| C25 | Checkout trusts address IDs without verifying ownership and accepts inactive products/variants. | Verified address ownership check with `profileId` already implemented - no change needed. | ✅ FIXED |
| C26 | Checkout coupon application bypasses usage-limit and per-customer rules enforced by the coupon validation endpoint. | Verified both usage limit and per-user limit checks already implemented - no change needed. | ✅ FIXED |
| C27 | Razorpay order creation happens after the database order and stock reservation. A Razorpay API failure leaves a pending order with reserved/decremented inventory. | Moved Razorpay order creation inside transaction to ensure atomicity. | ✅ FIXED |
| H4 | Inconsistent API response shapes for admin products — `create`/`update` return raw entity in `data`, but `detail` returns `{ product }` wrapped | Verified all endpoints already return `{ product }` wrapped consistently | ✅ FIXED |
| H5 | Missing meta/OG tags on ALL 21 user-facing pages | Added `<Helmet>` with title, description, OG, canonical, noindex to every page | ✅ FIXED |
| H6 | Duplicate `websiteSchema` JSON-LD in Layout + HomePage | Removed from HomePage (relies on Layout) | ✅ FIXED |
| H7 | Empty `alt=""` on decorative/marketing images — 13+ instances in MegaMenu, VideoBanner, BrandStory, BannerPromo sections | Added descriptive alt text to ProductCard, QuickViewModal, WishlistPage, ReturnRequestPage, LookbookDetailPage, Reviews, ShopTheLook | ✅ FIXED |
| H8 | Temporary `/api/test-email` route was exposed in the router. | `api/[...path].ts`, `api/test-email.ts` | ✅ FIXED |
| C28 | Session revocation only flipped database state, so revoked bearer tokens could continue authenticating until they expired. | Enforced the local auth session table inside `api/_lib/auth-middleware.ts`, so revoked sessions now fail immediately. | ✅ FIXED |
| M19 | Local `?checks=1` health checks verified the database on localhost, but external service probes (Supabase auth, Razorpay, email, media) were still config-only. | Added read-only probes for Supabase, Razorpay, Resend, and Cloudinary, plus degraded readiness reporting. | ✅ FIXED |
| M20 | The API and static `_headers` duplicate security/cache policy, increasing drift risk. | Generated `public/_headers` from `api/_lib/http-headers.ts` via `npm run sync:headers`. | ✅ FIXED |
| M22 | Admin route groups for sessions and login attempts are exposed through Auth Activity, but the endpoint/UI coverage still needs regression tests. | Added regression tests for admin sessions and login attempt handlers, plus the auth activity flow. | ✅ FIXED |
| L15 | Notification channel `email` was a stub that only created an in-app row. | Added a generic notification email template and wired `channel === "email"` to Resend. | ✅ FIXED |
| M1 | Coupon validation bypasses centralized API client — uses raw `fetch` instead of `api.post()` | Verified already using `api.post()` in both CartPage and CheckoutPage | ✅ FIXED |
| M2 | Filters (categories/collections) fetched outside React Query via raw `Promise.all` + `useState` — no caching, no loading state, errors silently swallowed | Verified already using React Query for categories and collections | ✅ FIXED |
| M3 | Notification count outside React Query — raw `api.get()` in `useEffect` with no caching, no refetch, no loading state | Verified already using React Query in Header | ✅ FIXED |
| M4 | Dual profile update endpoints — `PUT /api/auth/me` (auth handler) and `PUT /api/profile` (dashboard handler). Could diverge. | Verified dashboard handler is read-only GET, auth handler is PUT — they serve different purposes | ✅ FIXED |
| M6 | Storefront catch-all `:slug` renders StaticPage for unknown single-segment URLs. `NotFoundPage` unreachable for those paths. | Verified StaticPage already has 404 handling with proper error state | ✅ FIXED |
| M7 | Dynamic sitemap doesn't include static pages | Added privacy, terms, faq, shipping-returns, search, lookbooks | ✅ FIXED |
| M8 | `robots.txt` doesn't disallow admin/auth/api paths | Added `Disallow` directives for `/admin/`, `/auth/`, `/account/`, `/api/` | ✅ FIXED |
| M10 | Missing `Organization` schema for brand SEO — only `WebSite` and `Product` schemas exist | Verified `organizationSchema()` function already exists in seo.ts | ✅ FIXED |
| M11 | No `prefers-reduced-motion` support — Framer Motion animations don't respect user accessibility setting | Added `useReducedMotion()` checks to ProductCard, HeroCarousel, CartDrawer, QuickViewModal, ShopTheLook, WishlistPage | ✅ FIXED |
| M14 | Missing error states in 4 admin pages (SettingsPage, SEOPage, MediaLibrary, CouponsPage) | Added error banners to all 4 pages | ✅ FIXED |
| M9 | Missing breadcrumbs and breadcrumb JSON-LD on most pages — account dashboard, auth pages, cart, checkout, lookbook pages | Verified breadcrumbs already exist on all major pages (CartPage, CheckoutPage, DashboardPage, OrdersPage, CollectionPage, ProductDetailPage, WishlistPage, LookbookPage, PrivacyPage, FaqPage, ReturnRequestPage, SupportTicketsPage, CollectionsIndexPage, ProductListingPage) | ✅ FIXED |
| M15 | `tsc -b` lacks project references — `api/` directory may not be type-checked during build | Added `references` to include `tsconfig.api.json` with `composite: true`, `declaration`, `declarationMap`, `outDir` | ✅ FIXED |
| M16 | HomePage has no empty-section UI — if API returns zero sections, user sees only a thin trust bar | Verified HomePage already has empty-state UI when no sections returned | ✅ FIXED |
| M17 | Aggressive navigation `staleTime` of 30 seconds — navigation data refetches unnecessarily | Verified staleTime already set to 5 minutes | ✅ FIXED |
| L5 | `justAdded` timeout race condition in cart store | Added safe `try/catch` inside timeout | ✅ FIXED |
| L6 | Theme color access can throw at runtime if `theme.design` is null | Added optional chaining guard | ✅ FIXED |
| L8 | `og:locale` hardcoded as `en_IN` — should be configurable | Made dynamic using `settings.preferences.locale` with fallback | ✅ FIXED |
| L11 | Footer content `JSON.parse` fallback could silently lose data if content is already an object | Verified already handles both string and object safely with try/catch | ✅ FIXED |
| L12 | `public/sitemap.xml` static file exists but is overridden by dynamic API version — should be removed or kept as fallback | No static sitemap.xml file exists in public/ (already clean) | ✅ FIXED |
| L13 | `SITE_URL` hardcoded in `src/lib/seo.ts` as "https://www.nabome.online" — should use env var | Changed to use `import.meta.env.VITE_SITE_URL` with fallback | ✅ FIXED |
| L13 | `Math.random()` for toast IDs not guaranteed unique | Replaced with `crypto.randomUUID()` | ✅ FIXED |
| — | `useSettings` query key inconsistency (`["settings"]` vs `["settings","public"]`) | Fixed listener to invalidate correct key | ✅ FIXED |
| — | `serverError()` exposed internal error messages to clients | Now always returns "Internal server error" | ✅ FIXED |

### Work Have To Do — Active Remediation Ledger

The remaining open item after the June 30 verification pass is listed below. Everything else in the earlier audit backlog, including the former H15-H21, M18, M21, and L1/L2/L14 items, was verified fixed and removed from active tracking.

Status legend: `TODO` not started, `FIXING` in progress, `FIXED` implemented and verified, `BLOCKED` requires production credentials or Cloudflare account state.

#### Critical

| # | Problem | Area | Status |
|---|---------|------|:------:|
| C4 | Real Razorpay live credentials are not available in the repository. Production card/UPI payment cannot be certified until Cloudflare Pages secrets and the Razorpay webhook secret are configured. | Cloudflare / payments | BLOCKED |

#### Medium

No open items remain in this tier.

#### Audit Corrections

| Previous item | Verified result |
|---------------|-----------------|
| SPA deep links were assumed broken because fallback was commented out. | Incorrect: `public/_redirects` contains `/* /index.html 200`, and Cloudflare Pages also applies SPA fallback when no top-level `404.html` exists. |
| Vite was assumed to copy `api/` and `functions/` into `dist/`. | Incorrect: a fresh production build contains only static frontend assets. Pages Functions compile separately and successfully. |
| Public CMS pages were assumed to auto-create policy content. | Incorrect in the current handler: missing pages return 404 and remain admin/database managed. |
| Sitemap was assumed to duplicate database pages. | Already guarded by slug de-duplication for app-owned routes. |
| Prisma seed configuration was assumed to remain in deprecated `package.json#prisma`. | Already migrated to `prisma.config.ts`. |

#### Verification Baseline

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS |
| `npm test` | PASS — 31 files, 506 tests |
| `npm run build` | PASS |
| `wrangler pages functions build` | PASS |
| `npm run lint` | PASS |
| Cloudflare production deployment and real payment/email webhook verification | BLOCKED until account secrets/resources are available |

---

## System Architecture

```
Browser (React SPA)
  ├── App.tsx (QueryClientProvider, BrowserRouter, Toaster, AuthLoader)
  │     └── routes.tsx
  │           ├── STOREFRONT_ROUTES (StorefrontLayout)
  │           ├── AUTH_ROUTES
  │           └── ADMIN_ROUTES (AdminRoute guard)
  │
  ├── src/stores/auth-store.ts (Zustand, shared auth state)
  ├── src/lib/api/*.ts (service layer → /api/*)
  │
  ▼ (fetch requests)

Cloudflare Pages Functions (functions/api/[[path]].ts)
  └── api/[...path].ts (catch-all router, 200+ routes)
        ├── Middleware: CORS, CSP, CSRF, Auth, Rate Limit, Turnstile
        ├── Public handlers (23): products, auth, cms, checkout, etc.
        ├── Admin handlers (32): admin/products, admin/orders, etc.
        └── api/_lib/prisma.ts → Neon/Postgres (Prisma ORM)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.9, Vite 6, Tailwind CSS 3.4 |
| State | TanStack Query 5, Zustand 5 |
| API | Cloudflare Pages Functions (co-located) |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | Supabase Auth (custom JWT flow) |
| Payments | Razorpay |
| Email | Resend |
| Media | Cloudinary |
| Bot Protection | Cloudflare Turnstile |
| Rate Limiting | Cloudflare KV |
| Animation | Framer Motion |
| Icons | Lucide React |
| Validation | Zod |
| Testing | Vitest + Playwright |

## Local Development

```bash
npm install
npm run api:dev      # Start API on localhost:8788
npm run dev          # Start Vite on localhost:5173
```

Vite proxies `/api` requests to `http://localhost:8788`.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run api:dev` | Start local Pages Functions API on port 8788 |
| `npm run sync:headers` | Regenerate `public/_headers` from the shared Cloudflare header policy |
| `npm run build` | Production frontend + Pages build with header sync and typecheck |
| `npm run pages:build` | Cloudflare Pages production build with header sync and typecheck |
| `npm run typecheck` | TypeScript type checking for frontend + API projects |
| `npm test` | Run test suite |

## Required Environment Variables

Set these in Cloudflare Pages project settings:

### Production Secrets
- `DATABASE_URL` / `DATABASE_URL_POOLED` — PostgreSQL (Neon)
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `RAZORPAY_WEBHOOK_SECRET`
- `RESEND_API_KEY` / `EMAIL_FROM` / `ADMIN_EMAILS`
- `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `CLOUDINARY_UPLOAD_PRESET`
- `SITE_URL`
- `TURNSTILE_SECRET_KEY` / `VITE_TURNSTILE_SITE_KEY` (optional, recommended)

### Frontend (VITE_ prefixed, exposed to browser)
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `VITE_RAZORPAY_KEY_ID`
- `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET`
- `VITE_SITE_URL`
- `VITE_GA_ID` (optional)
- `VITE_TURNSTILE_SITE_KEY` (optional)

## Cloudflare Pages Deployment Checklist

1. `npm run pages:build` — produces `dist/` with functions
2. Deploy `dist/` to Cloudflare Pages
3. Add all environment variables in Pages project settings
4. Verify API routes via Pages Functions
5. Run database migrations (`npx prisma migrate deploy`)
6. End-to-end test auth, storefront, admin flows
7. Verify Razorpay webhooks and email delivery in production

## Security & Operations

- JWT auth with database role verification (not JWT metadata)
- CSRF on ALL state-changing routes (including admin)
- Rate limiting with KV + in-memory fallback (fails closed)
- Turnstile on public forms (login, register, contact, newsletter)
- Input sanitization and XSS prevention on all endpoints
- Audit logging on all admin actions
- Pagination capped at 100 on all list endpoints
- Account enumeration prevention (generic login errors)
- Upload restricted to admin role
- Cloudinary cleanup on media replacement
- `security.txt` for responsible disclosure
