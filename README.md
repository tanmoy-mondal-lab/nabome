# নবME — Premium Fashion E-Commerce

Premium fashion e-commerce storefront and admin built for Cloudflare Pages + Functions.

Live site: [nabome.online](https://www.nabome.online)

---

## Work Have To Do — Comprehensive Audit Findings (2026-07-01)

This document lists all problems found during the full system audit of storefront ↔ admin connectivity, database, storage, backend, API, content display, UI/UX, SEO, and accessibility. Items are sorted by severity. Fixed items show a ✅ status.

---

### ✅ Fixed This Round (2026-07-01 — Deep System Audit Round 2)

| # | Problem | Fix | Status |
|---:|---------|-----|:------:|
| D1 | **ProductDetailPage inline star rating always 0** — `product.reviews` was `_count.reviews` (a number), not review stats object with `average` field | Added `useQuery` to fetch review stats from `/api/products/:slug/reviews` and use `stats.averageRating` | ✅ FIXED |
| D2 | **BottomNav cart count inconsistent with Header** — BottomNav used `items.length` (unique line items), Header used `items.reduce(sum + quantity)` (total quantity) | Changed BottomNav to use `items.reduce((sum, i) => sum + i.quantity, 0)` matching Header | ✅ FIXED |
| D3 | **Layout.tsx missing `AnimatePresence`** — `motion.div` had `exit` animation props but no `AnimatePresence` parent, so exit animations never fired | Added `<AnimatePresence mode="wait">` wrapper around the `motion.div` in Layout | ✅ FIXED |
| D4 | **CartDrawer minus button at qty=1 removes item without confirmation** — clicking minus when quantity is 1 silently removes the item via cart store's `updateQuantity` | Changed CartDrawer to show trash icon (remove) when qty=1, minus icon only when qty>1 | ✅ FIXED |
| D5 | **Reviews component missing pagination UI** — `page` state existed but no next/prev buttons | Added Previous/Next pagination buttons with page indicator when `totalPages > 1` | ✅ FIXED |
| D6 | **Reviews component missing error state** — failed API calls showed "No reviews yet" (misleading) | Added `isError` check with error banner and retry button | ✅ FIXED |
| D7 | **ProductRecommendations `type="similar"` returned empty array** — unimplemented feature | Changed to fetch from `/api/products/:slug/similar` when `currentSlug` is provided | ✅ FIXED |
| D8 | **LookbookDetailPage generic title** — title was always "Lookbook — নবME" regardless of actual lookbook name | Made title dynamic: `{lookbookName} — নবME` with description from lookbook story | ✅ FIXED |
| D9 | **LookbookDetailPage missing canonical URL** — no `<link rel="canonical">` for individual lookbooks | Added `canonical(/lookbooks/${slug})` and full OG tags | ✅ FIXED |
| D10 | **Footer external links rendered as react-router `<Link>`** — CMS-managed footer links starting with `http` would be treated as internal routes | Added `isExternal` check: external links use `<a target="_blank">`, internal use `<Link>` | ✅ FIXED |
| D11 | **MegaMenu/MobileNav `"#"` fallback links** — missing URLs caused navigation to `/#` (top of page) | Changed to conditionally render `<span>` instead of `<Link>` when URL is missing | ✅ FIXED |
| D12 | **BottomNav no auth pre-check** — linked directly to `/account` and `/account/wishlist` without checking auth, causing unnecessary redirect flash | Added auth check: unauthenticated users are sent to `/auth/login` directly | ✅ FIXED |
| D13 | **Header scroll handler re-registered every frame** — `prevScroll` was `useState` causing effect dependency to change on every scroll | Changed to `useRef` (stable reference), removed dependency, scroll handler registered once | ✅ FIXED |
| D14 | **Layout content overlaps announcement bar** — `pt-[64px]` was fixed regardless of announcement bar height | Added `ResizeObserver` to dynamically measure header height and set padding accordingly | ✅ FIXED |
| D15 | **SocialProof fallback text "a product"** — generic and unprofessional before API data loads | Changed to "an item" and added dismiss (X) button | ✅ FIXED |
| D16 | **NewsletterForm missing accessibility** — email input had no `<label>`, submit button had no loading state | Added `aria-label`, `Loader2` loading spinner, and "Subscribing..." text during submission | ✅ FIXED |
| D17 | **FrequentlyBoughtTogether missing product names** — only showed images with "+" separators, users couldn't identify bundle items | Added product name below each image in the bundle display | ✅ FIXED |
| D18 | **SearchOverlay missing error state** — failed searches showed "No products found" (misleading) | Added `isError` check with "Search failed" error message | ✅ FIXED |
| D19 | **Dead code files** — `TermsPage.tsx`, `PrivacyPage.tsx`, `AccountPage.tsx`, `AccountOverview.tsx`, `AccountOrdersPage.tsx`, `AccountAddressesPage.tsx`, `AccountSettingsPage.tsx`, `AccountWishlistPage.tsx` existed in `src/` but were never imported by routes | Deleted all 8 orphaned files | ✅ FIXED |
| D20 | **15 admin pages missing error states** — LookbooksPage, LabelsPage, ReviewsPage, NewsletterPage, ContactsPage, SocialLinksPage, FAQPage, NotificationsPage, WebhookEventsPage, PageTemplatesPage, AbandonedCartsPage, AuthActivityPage, AuditLogPage, WishlistsPage, ThemeBuilder | Added `isError` check with error banner + retry button to all 15 pages | ✅ FIXED |
| D21 | **Header mobile menu button static aria-label** — always said "Open menu" regardless of state | Changed to `aria-label="Toggle menu"` | ✅ FIXED |
| D22 | **Header notification badge missing aria-label** — screen readers just read the number without context | Added `aria-label="${notifCount} unread notifications"` | ✅ FIXED |
| D23 | **Header cart badge missing descriptive aria-label** | Added `aria-label="${itemCount} items in cart"` | ✅ FIXED |
| D24 | **Footer social links missing aria-label** — screen readers announced just the URL | Added `aria-label="Follow us on ${platform}"` | ✅ FIXED |
| D25 | **ProductCard list view buttons missing aria-label** — wishlist and quick view had no accessible names | Added `aria-label` to both buttons in list view | ✅ FIXED |
| D26 | **ProductCard color swatches not labeled** — color-blind users couldn't determine swatch colors | Added `aria-label="Color option ${i + 1}"` to each swatch | ✅ FIXED |
| D27 | **Reviews form inputs missing labels** — screen readers couldn't announce field purposes | Added `<label className="sr-only">` for title and body fields | ✅ FIXED |
| D28 | **Reviews star rating buttons missing aria-label** | Added `aria-label="Rate ${star} out of 5 stars"` | ✅ FIXED |
| D29 | **HeroCarousel dot navigation missing aria-label** — screen readers announced "button" for each dot | Added `aria-label="Go to slide ${i + 1}"` | ✅ FIXED |
| D30 | **HeroCarousel scroll indicator missing aria-hidden** — purely decorative element was accessible to screen readers | Added `aria-hidden="true"` | ✅ FIXED |
| D31 | **ShopTheLook hotspot button missing aria-label** — screen readers announced "+" without context | Added `aria-label="View product: ${h.product.name}"` | ✅ FIXED |
| D32 | **ShopTheLook close button missing aria-label** | Added `aria-label="Close"` | ✅ FIXED |
| D33 | **RecentlyViewed scroll buttons missing aria-label** | Added `aria-label="Scroll left"` and `aria-label="Scroll right"` | ✅ FIXED |
| D34 | **Layout.tsx `websiteSchema()` recreated every render** — new object on every render caused unnecessary re-renders | Wrapped in `useMemo(() => websiteSchema(), [])` | ✅ FIXED |
| D35 | **admin/campaigns.ts** missing try/catch error handling in `handleList` and `handleDetail` | Added proper try/catch blocks around all database operations | ✅ FIXED |
| D36 | **ProductRecommendations `type="similar"` missing route** — unimplemented feature in search system | Added `/api/products/:slug/similar` endpoint with category-based logic | ✅ FIXED |
| D37 | **RecentlyViewed** inefficient loading with parallel individual API calls | Replaced with single batch endpoint `/api/products/by-slugs` | ✅ FIXED |
| D38 | **SearchResultsPage** retry button uses window.location.reload instead of refetch() | Changed to use react-query refetch() instead | ✅ FIXED |
| D39 | **SearchOverlay** empty-state guard uses `query` instead of `debouncedQuery` | Fixed to use `debouncedQuery` preventing UI flicker | ✅ FIXED |
| D40 | **SearchOverlay** localStorage.setItem not protected with try/catch | Added error handling for localStorage operations | ✅ FIXED |

---

### Work Have To Do — Active Remediation Ledger

| # | Problem | Fix | Status |
|---:|---------|-----|:------:|
| D1 | **ProductDetailPage inline star rating always 0** — `product.reviews` was `_count.reviews` (a number), not review stats object with `average` field | Added `useQuery` to fetch review stats from `/api/products/:slug/reviews` and use `stats.averageRating` | ✅ FIXED |
| D2 | **BottomNav cart count inconsistent with Header** — BottomNav used `items.length` (unique line items), Header used `items.reduce(sum + quantity)` (total quantity) | Changed BottomNav to use `items.reduce((sum, i) => sum + i.quantity, 0)` matching Header | ✅ FIXED |
| D3 | **Layout.tsx missing `AnimatePresence`** — `motion.div` had `exit` animation props but no `AnimatePresence` parent, so exit animations never fired | Added `<AnimatePresence mode="wait">` wrapper around the `motion.div` in Layout | ✅ FIXED |
| D4 | **CartDrawer minus button at qty=1 removes item without confirmation** — clicking minus when quantity is 1 silently removes the item via cart store's `updateQuantity` | Changed CartDrawer to show trash icon (remove) when qty=1, minus icon only when qty>1 | ✅ FIXED |
| D5 | **Reviews component missing pagination UI** — `page` state existed but no next/prev buttons | Added Previous/Next pagination buttons with page indicator when `totalPages > 1` | ✅ FIXED |
| D6 | **Reviews component missing error state** — failed API calls showed "No reviews yet" (misleading) | Added `isError` check with error banner and retry button | ✅ FIXED |
| D7 | **ProductRecommendations `type="similar"` returned empty array** — unimplemented feature | Changed to fetch from `/api/products/:slug/similar` when `currentSlug` is provided | ✅ FIXED |
| D8 | **LookbookDetailPage generic title** — title was always "Lookbook — নবME" regardless of actual lookbook name | Made title dynamic: `{lookbookName} — নবME` with description from lookbook story | ✅ FIXED |
| D9 | **LookbookDetailPage missing canonical URL** — no `<link rel="canonical">` for individual lookbooks | Added `canonical(/lookbooks/${slug})` and full OG tags | ✅ FIXED |
| D10 | **Footer external links rendered as react-router `<Link>`** — CMS-managed footer links starting with `http` would be treated as internal routes | Added `isExternal` check: external links use `<a target="_blank">`, internal use `<Link>` | ✅ FIXED |
| D11 | **MegaMenu/MobileNav `"#"` fallback links** — missing URLs caused navigation to `/#` (top of page) | Changed to conditionally render `<span>` instead of `<Link>` when URL is missing | ✅ FIXED |
| D12 | **BottomNav no auth pre-check** — linked directly to `/account` and `/account/wishlist` without checking auth, causing unnecessary redirect flash | Added auth check: unauthenticated users are sent to `/auth/login` directly | ✅ FIXED |
| D13 | **Header scroll handler re-registered every frame** — `prevScroll` was `useState` causing effect dependency to change on every scroll | Changed to `useRef` (stable reference), removed dependency, scroll handler registered once | ✅ FIXED |
| D14 | **Layout content overlaps announcement bar** — `pt-[64px]` was fixed regardless of announcement bar height | Added `ResizeObserver` to dynamically measure header height and set padding accordingly | ✅ FIXED |
| D15 | **SocialProof fallback text "a product"** — generic and unprofessional before API data loads | Changed to "an item" and added dismiss (X) button | ✅ FIXED |
| D16 | **NewsletterForm missing accessibility** — email input had no `<label>`, submit button had no loading state | Added `aria-label`, `Loader2` loading spinner, and "Subscribing..." text during submission | ✅ FIXED |
| D17 | **FrequentlyBoughtTogether missing product names** — only showed images with "+" separators, users couldn't identify bundle items | Added product name below each image in the bundle display | ✅ FIXED |
| D18 | **SearchOverlay missing error state** — failed searches showed "No products found" (misleading) | Added `isError` check with "Search failed" error message | ✅ FIXED |
| D19 | **Dead code files** — `TermsPage.tsx`, `PrivacyPage.tsx`, `AccountPage.tsx`, `AccountOverview.tsx`, `AccountOrdersPage.tsx`, `AccountAddressesPage.tsx`, `AccountSettingsPage.tsx`, `AccountWishlistPage.tsx` existed in `src/` but were never imported by routes | Deleted all 8 orphaned files | ✅ FIXED |
| D20 | **15 admin pages missing error states** — LookbooksPage, LabelsPage, ReviewsPage, NewsletterPage, ContactsPage, SocialLinksPage, FAQPage, NotificationsPage, WebhookEventsPage, PageTemplatesPage, AbandonedCartsPage, AuthActivityPage, AuditLogPage, WishlistsPage, ThemeBuilder | Added `isError` check with error banner + retry button to all 15 pages | ✅ FIXED |
| D21 | **Header mobile menu button static aria-label** — always said "Open menu" regardless of state | Changed to `aria-label="Toggle menu"` | ✅ FIXED |
| D22 | **Header notification badge missing aria-label** — screen readers just read the number without context | Added `aria-label="${notifCount} unread notifications"` | ✅ FIXED |
| D23 | **Header cart badge missing descriptive aria-label** | Added `aria-label="${itemCount} items in cart"` | ✅ FIXED |
| D24 | **Footer social links missing aria-label** — screen readers announced just the URL | Added `aria-label="Follow us on ${platform}"` | ✅ FIXED |
| D25 | **ProductCard list view buttons missing aria-label** — wishlist and quick view had no accessible names | Added `aria-label` to both buttons in list view | ✅ FIXED |
| D26 | **ProductCard color swatches not labeled** — color-blind users couldn't determine swatch colors | Added `aria-label="Color option ${i + 1}"` to each swatch | ✅ FIXED |
| D27 | **Reviews form inputs missing labels** — screen readers couldn't announce field purposes | Added `<label className="sr-only">` for title and body fields | ✅ FIXED |
| D28 | **Reviews star rating buttons missing aria-label** | Added `aria-label="Rate ${star} out of 5 stars"` | ✅ FIXED |
| D29 | **HeroCarousel dot navigation missing aria-label** — screen readers announced "button" for each dot | Added `aria-label="Go to slide ${i + 1}"` | ✅ FIXED |
| D30 | **HeroCarousel scroll indicator missing aria-hidden** — purely decorative element was accessible to screen readers | Added `aria-hidden="true"` | ✅ FIXED |
| D31 | **ShopTheLook hotspot button missing aria-label** — screen readers announced "+" without context | Added `aria-label="View product: ${h.product.name}"` | ✅ FIXED |
| D32 | **ShopTheLook close button missing aria-label** | Added `aria-label="Close"` | ✅ FIXED |
| D33 | **RecentlyViewed scroll buttons missing aria-label** | Added `aria-label="Scroll left"` and `aria-label="Scroll right"` | ✅ FIXED |
| D34 | **Layout.tsx `websiteSchema()` recreated every render** — new object on every render caused unnecessary re-renders | Wrapped in `useMemo(() => websiteSchema(), [])` | ✅ FIXED |
| D35 | **admin/campaigns.ts** missing try/catch error handling in `handleList` and `handleDetail` | Added proper try/catch blocks around all database operations | ✅ FIXED |
| D36 | **ProductRecommendations `type="similar"` missing route** — unimplemented feature in search system | Added `/api/products/:slug/similar` endpoint with category-based logic | ✅ FIXED |
| D37 | **RecentlyViewed** inefficient loading with parallel individual API calls | Replaced with single batch endpoint `/api/products/by-slugs` | ✅ FIXED |
| D38 | **SearchResultsPage** retry button uses window.location.reload instead of refetch() | Changed to use react-query refetch() instead | ✅ FIXED |
| D39 | **SearchOverlay** empty-state guard uses `query` instead of `debouncedQuery` | Fixed to use `debouncedQuery` preventing UI flicker | ✅ FIXED |
| D40 | **SearchOverlay** localStorage.setItem not protected with try/catch | Added error handling for localStorage operations | ✅ FIXED |

---

### Work Have To Do — Active Remediation Ledger

The July 1 deep audit round 2 addressed 34 new items (D1-D34) across bugs, accessibility, UX, SEO, performance, dead code cleanup, and admin error states.

Status legend: `FIXED` implemented and verified, `BLOCKED` requires production credentials or Cloudflare account state.

#### Blocked (Requires Production Environment)

| # | Problem | Area | Status |
|---|---------|------|:------:|
| C4 | Real Razorpay live credentials are not available in the repository. Production card/UPI payment cannot be certified until Cloudflare Pages secrets and the Razorpay webhook secret are configured. | Cloudflare / payments | BLOCKED |

#### Verified Baseline

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS |
| `npm test` | PASS — 31 files, 506 tests |
| `npm run build` | PASS |
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
