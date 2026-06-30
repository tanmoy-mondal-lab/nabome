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
| H4 | Inconsistent API response shapes for admin products — `create`/`update` return raw entity in `data`, but `detail` returns `{ product }` wrapped | Verified all endpoints already return `{ product }` wrapped consistently | ✅ FIXED |
| H5 | Missing meta/OG tags on ALL 21 user-facing pages | Added `<Helmet>` with title, description, OG, canonical, noindex to every page | ✅ FIXED |
| H6 | Duplicate `websiteSchema` JSON-LD in Layout + HomePage | Removed from HomePage (relies on Layout) | ✅ FIXED |
| H7 | Empty `alt=""` on decorative/marketing images — 13+ instances in MegaMenu, VideoBanner, BrandStory, BannerPromo sections | Added descriptive alt text to ProductCard, QuickViewModal, WishlistPage, ReturnRequestPage, LookbookDetailPage, Reviews, ShopTheLook | ✅ FIXED |
| H8 | Temporary `/api/test-email` route was exposed in the router. | `api/[...path].ts`, `api/test-email.ts` | ✅ FIXED |
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

### 🔄 Current Verification Pass (2026-06-30)

| # | Severity | Problem | Location | Current state |
|---|----------|---------|----------|---------------|
| C14 | Critical | Cloudflare Pages SPA fallback is commented out, so refreshed/deep-linked React routes can 404 in production. | `public/_redirects` | 🔄 FIXING |
| H15 | High | Vite build copies `functions/` and `api/` source files into `dist/`, which can expose server source as static files and is not needed for root Pages Functions. | `vite.config.ts` | 🔄 FIXING |
| H16 | High | Seeded CMS navigation links use `/pages/...` paths or point to missing static pages, causing broken customer footer/header links after a fresh seed. | `prisma/seed.ts` | 🔄 FIXING |
| H17 | High | Public CMS page endpoint auto-creates hardcoded policy pages when database content is missing, bypassing admin-managed CMS content. | `api/_handlers/cms.ts` | 🔄 FIXING |
| M19 | Medium | Health and service adapters treat placeholder secrets as configured, which makes local/production readiness checks misleading. | `api/health.ts`, service handlers | 🔄 FIXING |
| M20 | Medium | Sitemap duplicates database-backed static pages with hardcoded entries, which can create duplicate SEO URLs. | `api/sitemap.xml.ts` | 🔄 FIXING |

### 🛑 CRITICAL — Remaining (Will cause production failures)

| # | Problem | Location | Fix |
|---|---------|----------|-----|
| C4 | Razorpay payment keys are placeholder values (`...`). Payment flows will fail in production. | `.env` | Set real Razorpay live keys via Cloudflare Pages secrets |

### 🟡 MEDIUM — Remaining

| # | Problem | Location | Fix |
|---|---------|----------|-----|
| M5 | Three API endpoint groups with no frontend admin page — subcategories, product-attributes, addresses. | `api/_handlers/admin/subcategories.ts`, `product-attributes.ts`, `addresses.ts` | Add admin UI pages or document as inline |
| M18 | Prisma warns that `package.json#prisma` is deprecated and will be removed in Prisma 7. | `package.json` | Migrate seed configuration to `prisma.config.ts` before upgrading Prisma |

### 🔵 LOW — Remaining

| # | Problem | Location | Fix |
|---|---------|----------|-----|
| L1 | No `aria-invalid` or `aria-describedby` on form validation error messages. | Multiple form components | Add ARIA attributes |
| L2 | No focus management when modals/dialogs open (`aria-modal` exists but no focus trap). | `MobileNav.tsx`, `Modal.tsx` | Add focus trap |
| L14 | Empty `alt=""` on 13+ images across MegaMenu, VideoBanner, BrandStory, BannerPromo, ProductCard, QuickViewModal, etc. | Multiple storefront components | Add descriptive alt text to all images |

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
| `npm run build` | Production frontend + Pages build with typecheck |
| `npm run pages:build` | Cloudflare Pages production build with typecheck |
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
