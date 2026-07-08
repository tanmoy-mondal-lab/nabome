# NABOME — Phase 1 Complete Project Inventory

**Date:** 2026-07-07  
**Phase:** 1 — Complete Project Inventory & Master Analysis  
**Author:** Lead Software Architect  
**Status:** Complete

---

## Executive Summary

NABOME is a premium fashion e-commerce platform targeting the Indian market. It is built on **React 19 + Vite 6 + Tailwind CSS 3.4** frontend with **Cloudflare Pages Functions** backend, using **Supabase Auth**, **Neon PostgreSQL** (via Prisma ORM), **Razorpay** payments, **Resend** email, and **Cloudinary** media CDN.

The codebase is substantial — **64,248+ lines of TypeScript/TSX** across **351 source files**, **114 directories**, and **395 total project files** (excluding node_modules, .git, dist). The database schema defines **34 models** across 15 modules. The API exposes **200+ registered endpoints** served via Cloudflare Pages Functions. The admin panel covers **37+ modules**. The frontend defines **40+ routes** across storefront, auth, customer account, and admin areas.

**Key strengths:** Comprehensive data model, strong security foundation (CSP, HSTS, CSRF infrastructure, rate limiting), sophisticated design system, edge-based SEO middleware, mobile-aware UX.

**Key gaps:** Near-zero test coverage (critically low), security hardening incomplete, no error monitoring, no business-critical automation (abandoned cart, email notifications), accessibility is an afterthought.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare Pages                   │
│  ┌──────────────┐  ┌────────────────────────────┐   │
│  │  Functions/   │  │      Static Assets         │   │
│  │  Edge Runtime │  │  (SPA via Vite Build)      │   │
│  │              │  │                            │   │
│  │  _middleware  │  │  dist/ (built output)      │   │
│  │  → SEO meta   │  │  public/ (static files)    │   │
│  │  → Sitemap    │  │  → sw.js (service worker)  │   │
│  │  → Robots.txt │  │  → _headers (CSP, HSTS)   │   │
│  │              │  │  → _redirects               │   │
│  │  api/[[path]] │  │  → assets/ (images, icons) │   │
│  │  → 200+ endpoints│ │                            │   │
│  └──────┬───────┘  └────────────────────────────┘   │
│         │                                            │
│         ▼                                            │
│  ┌────────────────────────────────────────────┐      │
│  │              External Services              │      │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐    │      │
│  │  │Neon  │ │Supabase│ │Razor │ │Resend  │    │      │
│  │  │PG    │ │Auth   │ │pay   │ │Email   │    │      │
│  │  └──────┘ └──────┘ └──────┘ └────────┘    │      │
│  │  ┌──────────┐ ┌────────┐ ┌──────────┐     │      │
│  │  │Cloudinary│ │Google  │ │Cloudflare │     │      │
│  │  │Media    │ │Analytics│ │KV (Rate   │     │      │
│  │  │         │ │        │ │Limit)    │     │      │
│  │  └──────────┘ └────────┘ └──────────┘     │      │
│  └────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User visits `nabome.online` → Cloudflare Pages serves SPA
2. SPA makes API calls to `/api/*` → Cloudflare Pages Functions handle
3. Functions apply: Rate limiting (KV) → CSRF → Auth → Turnstile → Handler
4. Handler queries Prisma → Neon PostgreSQL
5. Responses include security headers, CORS
6. SEO middleware on `functions/_middleware.ts` injects meta tags for HTML pages

---

## Complete Folder Tree

```
nabome/
├── .env                          # Local environment (placeholder values)
├── .env.example                  # Required env vars template
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD: GitHub → Cloudflare Pages
├── .opencode/                    # opencode configuration
│   ├── package.json
│   └── package-lock.json
├── .vscode/
│   └── extensions.json
├── .wrangler/
│   └── tmp/
├── NABOME_COMPLETE_AUDIT_REPORT.md  # Previous audit (1633 lines)
├── README.md
├── api/                          # API backend (Cloudflare Pages Functions)
│   ├── [...path].ts              # Catch-all router (671 lines)
│   ├── health.ts                 # Health check endpoint
│   ├── robots.txt.ts             # Dynamic robots.txt
│   ├── sitemap.xml.ts            # Dynamic sitemap
│   ├── _handlers/                # Route handlers
│   │   ├── __tests__/            # 7 test files + 1 test utils
│   │   ├── admin/                # 33 admin handler files
│   │   │   ├── abandoned-carts.ts
│   │   │   ├── addresses.ts
│   │   │   ├── analytics.ts
│   │   │   ├── audit-log.ts
│   │   │   ├── brands.ts
│   │   │   ├── campaigns.ts
│   │   │   ├── categories.ts
│   │   │   ├── cms.ts
│   │   │   ├── collections.ts
│   │   │   ├── contacts.ts
│   │   │   ├── coupon-redemptions.ts
│   │   │   ├── coupons.ts
│   │   │   ├── customers.ts
│   │   │   ├── dashboard.ts
│   │   │   ├── import-export.ts
│   │   │   ├── inventory.ts
│   │   │   ├── login-attempts.ts
│   │   │   ├── lookbooks.ts
│   │   │   ├── marketing.ts
│   │   │   ├── media.ts
│   │   │   ├── orders.ts
│   │   │   ├── product-attributes.ts
│   │   │   ├── product-labels.ts
│   │   │   ├── products.ts
│   │   │   ├── related-products.ts
│   │   │   ├── reviews.ts
│   │   │   ├── search-index.ts
│   │   │   ├── sessions.ts
│   │   │   ├── settings.ts
│   │   │   ├── size-guides.ts
│   │   │   ├── subcategories.ts
│   │   │   ├── templates.ts
│   │   │   ├── wishlists.ts
│   │   ├── addresses.ts
│   │   ├── auth.ts               # 1194 lines — monolithic
│   │   ├── brands.ts
│   │   ├── campaigns.ts
│   │   ├── cart.ts
│   │   ├── categories.ts
│   │   ├── checkout.ts           # 647 lines
│   │   ├── cms.ts
│   │   ├── collections.ts
│   │   ├── contact.ts
│   │   ├── coupons.ts
│   │   ├── dashboard.ts
│   │   ├── invoices.ts
│   │   ├── lookbooks.ts
│   │   ├── notifications.ts
│   │   ├── orders.ts
│   │   ├── payments.ts           # 1058 lines — monolithic
│   │   ├── products.ts
│   │   ├── refunds.ts
│   │   ├── returns.ts
│   │   ├── reviews.ts
│   │   ├── settings.ts
│   │   ├── size-guides.ts
│   │   ├── support.ts
│   │   ├── tags.ts
│   │   ├── upload.ts
│   │   ├── wishlist.ts
│   └── _lib/                     # Shared API utilities
│       ├── __tests__/            # 14 test files
│       ├── audit.ts
│       ├── auth-middleware.ts    # 221 lines
│       ├── cloudinary.ts
│       ├── csrf.ts
│       ├── email-templates.ts    # 495 lines
│       ├── email.ts
│       ├── env.ts
│       ├── format.ts
│       ├── http-headers.ts
│       ├── prisma.ts
│       ├── rate-limit.ts
│       ├── response.ts
│       ├── sanitize.ts
│       ├── secrets.ts
│       ├── site-files.ts
│       ├── token-hash.ts
│       ├── turnstile.ts
│       ├── types.ts
│       ├── utils.ts
│       └── validate.ts
├── dist/                         # Build output (gitignored)
├── e2e/                          # Playwright E2E tests
│   ├── admin-credentials.ts
│   ├── admin-crud.spec.ts
│   ├── admin-flows.spec.ts
│   ├── auth.spec.ts
│   ├── cart-edge-cases.spec.ts
│   ├── checkout.spec.ts
│   ├── customer-journey.spec.ts
│   ├── navigation.spec.ts
│   └── product-detail.spec.ts
├── eslint.config.js
├── functions/                    # Cloudflare Functions (separate from API)
│   ├── _middleware.ts            # SEO middleware (283 lines)
│   ├── api/
│   │   └── [[path]].ts           # API dispatch in Functions format
│   ├── robots.txt.ts
│   └── sitemap.xml.ts
├── index.html                    # SPA entry
├── node_modules/
├── package-lock.json
├── package.json
├── playwright.config.ts
├── postcss.config.js
├── prisma.config.ts              # Dead config (unused)
├── prisma/
│   ├── cleanup-products-orders.ts
│   ├── cleanup.ts
│   ├── migrations/               # 11 migration directories
│   ├── schema.prisma             # 1422 lines, 34 models
│   └── seed.ts                   # 1003 lines seed data
├── public/                       # Static assets
│   ├── _headers                  # CSP, HSTS, security headers
│   ├── _redirects
│   ├── .well-known/
│   │   └── security.txt
│   ├── favicon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── og-image.svg
│   ├── placeholder.svg
│   ├── security.txt
│   ├── site.webmanifest
│   └── sw.js                     # Service worker (v4 cache)
├── scripts/
│   ├── api-dev-server.ts
│   ├── fix-broken-images.ts
│   ├── seed-admin.ts
│   ├── sync-public-headers.ts
│   └── update-razorpay-secrets.ts
├── src/
│   ├── admin/                    # Admin panel (69 files)
│   │   ├── AdminRoutes.tsx       # 194 lines, 37 lazy-loaded routes
│   │   ├── abandoned-carts/
│   │   ├── analytics/
│   │   ├── announcements/
│   │   ├── audit-log/
│   │   ├── auth/
│   │   ├── brands/
│   │   ├── campaigns/
│   │   ├── categories/
│   │   ├── cms/                  # 6 files (HomepageBuilder: 1453 lines)
│   │   │   └── components/
│   │   ├── collections/
│   │   ├── common/               # 10 files (DataTable, Modal, Skeletons, etc.)
│   │   │   ├── __tests__/
│   │   │   └── skeletons/
│   │   ├── contacts/
│   │   ├── coupons/
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── faq/
│   │   ├── hooks/
│   │   ├── import-export/
│   │   ├── inventory/
│   │   ├── labels/
│   │   ├── layout/
│   │   ├── lookbooks/
│   │   ├── media/
│   │   ├── newsletter/
│   │   ├── notifications/
│   │   ├── orders/
│   │   ├── products/             # 12 files (ProductFormPage: 867 lines)
│   │   │   ├── components/       # 8 components
│   │   │   └── hooks/
│   │   ├── returns/
│   │   ├── reviews/
│   │   ├── search/
│   │   ├── seo/
│   │   ├── settings/
│   │   ├── size-guides/
│   │   ├── social/
│   │   ├── support/
│   │   ├── templates/
│   │   ├── theme/
│   │   ├── webhooks/
│   │   └── wishlists/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── routes.tsx            # 100 lines, 40+ routes
│   ├── cms/                      # CMS core
│   │   └── core/
│   │       ├── cms-types.ts      # 858 lines
│   │       ├── hero-slides.ts
│   │       └── section-registry.ts
│   ├── components/               # Shared UI components
│   │   ├── __tests__/
│   │   ├── auth/
│   │   │   ├── AdminRoute.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Select.tsx
│   │   │   └── Toast.tsx
│   │   ├── AuthLoader.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── GoogleAnalytics.tsx
│   │   ├── PasswordInput.tsx
│   │   ├── PhoneInput.tsx
│   │   ├── SafeImage.tsx
│   │   └── TurnstileWidget.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useFocusTrap.ts
│   ├── lib/                      # Shared utilities
│   │   ├── __tests__/
│   │   ├── api/                  # API client modules
│   │   │   ├── addresses.ts
│   │   │   ├── admin.ts          # 399 lines (god object)
│   │   │   ├── auth.ts
│   │   │   ├── client.ts
│   │   │   └── customer.ts
│   │   ├── razorpay/
│   │   │   ├── load-script.ts
│   │   │   ├── types.ts
│   │   │   └── use-razorpay.ts
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── format.ts
│   │   │   └── haptic.ts
│   │   ├── config.ts
│   │   ├── constants.ts
│   │   ├── sanitize-html.ts
│   │   ├── seo.ts
│   │   ├── serviceWorker.ts
│   │   ├── turnstile.ts
│   │   └── validators.ts
│   ├── pages/                    # Auth pages
│   │   ├── admin/                # Admin meta-pages
│   │   ├── AuthShell.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   └── VerifyEmailPage.tsx
│   ├── storefront/               # Customer-facing app
│   │   ├── components/           # 24 components
│   │   │   ├── __tests__/
│   │   │   ├── checkout/
│   │   │   │   ├── AddressForm.tsx
│   │   │   │   └── OrderSummary.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── ColorSelector.tsx
│   │   │   ├── ConnectivityIndicators.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── FrequentlyBoughtTogether.tsx
│   │   │   ├── HeroCarousel.tsx
│   │   │   ├── ImageGallery.tsx
│   │   │   ├── NewsletterForm.tsx
│   │   │   ├── PriceDisplay.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductRecommendations.tsx
│   │   │   ├── QuantitySelector.tsx
│   │   │   ├── QuickViewModal.tsx
│   │   │   ├── RecentlyViewed.tsx
│   │   │   ├── Reviews.tsx
│   │   │   ├── ScrollToTop.tsx
│   │   │   ├── ShopTheLook.tsx
│   │   │   ├── SizeSelector.tsx
│   │   │   ├── SocialProof.tsx
│   │   │   └── StarRating.tsx
│   │   ├── hooks/                # 11 hooks
│   │   │   ├── useAnnouncements.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useCategories.ts
│   │   │   ├── useCollections.ts
│   │   │   ├── useConnectivityManager.ts
│   │   │   ├── useFooter.ts
│   │   │   ├── useNavigation.ts
│   │   │   ├── usePolicyPages.ts
│   │   │   ├── useProducts.ts
│   │   │   ├── useSettings.ts
│   │   │   └── useWishlist.ts
│   │   ├── layout/               # 7 layout components
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── MegaMenu.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── SearchOverlay.tsx
│   │   ├── lib/
│   │   │   └── recommendations.ts
│   │   ├── pages/                # 22 pages
│   │   │   ├── AddressesPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CategoryPage.tsx
│   │   │   ├── CheckoutPage.tsx  # 895 lines
│   │   │   ├── CollectionPage.tsx
│   │   │   ├── CollectionsIndexPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── FaqPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── LookbookDetailPage.tsx
│   │   │   ├── LookbookPage.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── OrderDetailPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── ProductListingPage.tsx
│   │   │   ├── ReturnRequestPage.tsx
│   │   │   ├── SearchResultsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── StaticPage.tsx
│   │   │   ├── SupportTicketsPage.tsx
│   │   │   └── WishlistPage.tsx
│   │   ├── sections/             # 14 CMS sections
│   │   │   ├── BannerPromoSection.tsx
│   │   │   ├── BrandStorySection.tsx
│   │   │   ├── CategoriesGridSection.tsx
│   │   │   ├── CollectionGridSection.tsx
│   │   │   ├── CustomHTMLSection.tsx
│   │   │   ├── HeroSliderSection.tsx
│   │   │   ├── InstagramFeedSection.tsx
│   │   │   ├── NewArrivalsSection.tsx
│   │   │   ├── NewsletterSection.tsx
│   │   │   ├── ProductGridSection.tsx
│   │   │   ├── SectionRenderer.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   ├── TrustBarSection.tsx
│   │   │   └── VideoBannerSection.tsx
│   │   ├── store/
│   │   │   └── connectivity-store.ts
│   │   └── stores/
│   │       ├── __tests__/
│   │       ├── cart-store.ts
│   │       └── ui-store.ts
│   ├── stores/
│   │   ├── __tests__/
│   │   └── auth-store.ts
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   └── product.ts
│   ├── test-mock-polyfills.ts
│   ├── test-setup.ts
│   └── vite-env.d.ts
├── tailwind.config.ts            # 183 lines — luxury design system
├── tsconfig.api.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts                # 45 lines — code splitting config
├── vitest.config.ts
└── wrangler.jsonc                # Cloudflare Pages config
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | ^19.1.0 | UI framework |
| React Router DOM | ^7.5.0 | Client-side routing |
| Tailwind CSS | ^3.4.17 | Utility-first styling |
| TypeScript | ^5.8.3 | Type safety |
| TanStack React Query | ^5.75.5 | Server state management |
| Zustand | ^5.0.3 | Client state management |
| Framer Motion | ^12.9.2 | Animations |
| class-variance-authority | ^0.7.1 | Component variants |
| tailwind-merge | ^3.2.0 | Class merging |
| clsx | ^2.1.1 | Class utilities |
| Zod | ^3.24.4 | Validation schemas |
| Lucide React | ^0.510.0 | Icons |
| react-helmet-async | ^3.0.0 | Head management |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Cloudflare Pages Functions | — | Edge runtime |
| Prisma | ^6.6.0 | ORM |
| Neon Serverless | ^1.1.0 | PostgreSQL adapter |
| Supabase JS | ^2.49.1 | Auth client |
| Zod | ^3.24.4 | Request validation |

### External Services
| Service | Purpose |
|---|---|
| Neon PostgreSQL | Database |
| Supabase Auth | Authentication |
| Razorpay | Payment processing |
| Resend | Transactional email |
| Cloudinary | Image/video CDN + upload |
| Google Analytics | Web analytics (optional) |
| Cloudflare KV | Rate limiting store |
| Cloudflare Turnstile | Bot protection |

### Build & Deploy
| Tool | Version | Purpose |
|---|---|---|
| Vite | ^6.3.2 | Bundler |
| Lightning CSS | ^1.32.0 | CSS minifier |
| esbuild | (via Vite) | JS minifier |
| Vitest | ^4.1.9 | Unit tests |
| Playwright | ^1.61.1 | E2E tests |
| Wrangler | ^4.105.0 | Cloudflare deployment |
| tsx | ^4.19.4 | TypeScript execution |
| ESLint | ^10.6.0 | Linting |
| GitHub Actions | — | CI/CD |

---

## Dependency Graph

### Package.json — All Dependencies

**Production (12 packages):**
```
@dnd-kit/core ^6.3.1         — Drag & drop
@dnd-kit/sortable ^10.0.0    — Sortable DnD
@dnd-kit/utilities ^3.2.2    — DnD utilities (may be unused)
@neondatabase/serverless ^1.1.0 — Neon PostgreSQL driver
@prisma/adapter-neon ^6.6.0  — Prisma → Neon adapter
@prisma/client ^6.6.0        — Prisma ORM client
@supabase/supabase-js ^2.49.1 — Supabase Auth
@tanstack/react-query ^5.75.5 — Async state management
class-variance-authority ^0.7.1 — CVA component variants
clsx ^2.1.1                  — Class utilities
framer-motion ^12.9.2        — Animations
lucide-react ^0.510.0        — Icons
react ^19.1.0                — UI framework
react-dom ^19.1.0            — React DOM
react-helmet-async ^3.0.0    — Head management
react-router-dom ^7.5.0      — Routing
tailwind-merge ^3.2.0        — Tailwind class merging
zod ^3.24.4                  — Validation
zustand ^5.0.3               — State management
```

**DevDependencies (18 packages):**
```
@eslint/js ^10.0.1           — ESLint config
@playwright/test ^1.61.1     — E2E testing
@testing-library/jest-dom ^6.9.1 — DOM matchers
@testing-library/react ^16.3.2 — React testing
@testing-library/user-event ^14.6.1 — User events
@types/node ^22.15.3         — Node types
@types/react ^19.1.2         — React types
@types/react-dom ^19.1.2     — React DOM types
@vitejs/plugin-react ^4.4.1  — Vite React plugin
autoprefixer ^10.4.21        — CSS autoprefixer
dotenv ^16.6.1               — Env loading
eslint ^10.6.0               — Linter
eslint-plugin-react-hooks ^7.1.1 — React hooks linting
globals ^17.7.0              — Global types
jsdom ^29.1.1                — DOM environment for tests
lightningcss ^1.32.0         — CSS processor
node-fetch ^3.3.2            — Fetch polyfill
postcss ^8.5.3               — CSS processor
prisma ^6.6.0                — Prisma CLI
tailwindcss ^3.4.17          — Tailwind CSS
tsx ^4.19.4                  — TS execution
typescript ^5.8.3            — TypeScript compiler
typescript-eslint ^8.62.1    — TS ESLint
vite ^6.3.2                  — Build tool
vitest ^4.1.9                — Test runner
wrangler ^4.105.0            — Cloudflare CLI
```

### Dependency Observations

**Potential issues:**
- `@dnd-kit/utilities` (v3.2.2) — May be unused; `@dnd-kit/core` (v6.3.1) and `@dnd-kit/sortable` (v10.0.0) have mismatched major versions suggesting migration leftover
- `node-fetch` v3.3.2 — ESM-only package, likely for scripts; Cloudflare runtime has native fetch
- `dotenv` v16.6.1 — Dev dependency for local development
- No runtime type-checking library beyond Zod (good)
- No icon library beyond Lucide (good for tree-shaking)
- No heavy UI framework (Material UI, Chakra, etc.)

---

## Repository Statistics

| Metric | Count |
|---|---|
| Total directories | 114 |
| Total files (excl. node_modules, .git, dist) | 395 |
| TypeScript/TSX files | 351 |
| Non-TS source files | 23 |
| Total LOC (TS/TSX only) | 64,248 |
| Configuration files | 12 |
| GitHub Actions workflows | 1 |
| Database migrations | 11 |
| E2E test files | 9 |
| Unit test files | 28 |
| CSS files | 1 |
| SVG/Image assets | 5 |
| Shell scripts | 0 |
| TypeScript configs | 3 |

### Largest Files (Top 20)

| Rank | File | Lines | Module |
|---|---|---|---|
| 1 | `src/admin/cms/HomepageBuilder.tsx` | 1,453 | Admin CMS |
| 2 | `api/_handlers/auth.ts` | 1,194 | Auth |
| 3 | `api/_handlers/payments.ts` | 1,058 | Payments |
| 4 | `prisma/seed.ts` | 1,003 | Database |
| 5 | `src/admin/cms/HeaderBuilder.tsx` | 1,000 | Admin CMS |
| 6 | `prisma/schema.prisma` | 1,422 | Database |
| 7 | `src/storefront/pages/CheckoutPage.tsx` | 895 | Storefront |
| 8 | `src/admin/products/ProductFormPage.tsx` | 867 | Admin |
| 9 | `src/cms/core/cms-types.ts` | 858 | CMS Core |
| 10 | `api/_handlers/admin/products.ts` | 851 | Admin API |
| 11 | `src/admin/theme/ThemeBuilder.tsx` | 813 | Admin |
| 12 | `src/lib/__tests__/validators.test.ts` | 798 | Tests |
| 13 | `src/admin/products/ProductsPage.tsx` | 722 | Admin |
| 14 | `src/admin/cms/components/SectionEditor.tsx` | 676 | Admin CMS |
| 15 | `src/storefront/pages/CategoryPage.tsx` | 674 | Storefront |
| 16 | `api/[...path].ts` | 671 | API Router |
| 17 | `api/_handlers/checkout.ts` | 647 | Checkout |
| 18 | `src/storefront/pages/ProductDetailPage.tsx` | 612 | Storefront |
| 19 | `src/admin/orders/OrderDetailPage.tsx` | 575 | Admin |
| 20 | `src/admin/categories/CategoriesPage.tsx` | 570 | Admin |

### Most Complex Modules (by lines)
- **Auth handler** (`api/_handlers/auth.ts`) — 1,194 lines, handles 12+ operations
- **Payments handler** (`api/_handlers/payments.ts`) — 1,058 lines, webhook + verification
- **HomepageBuilder** (`src/admin/cms/HomepageBuilder.tsx`) — 1,453 lines, CMS editor
- **HeaderBuilder** (`src/admin/cms/HeaderBuilder.tsx`) — 1,000 lines
- **Admin API client** (`src/lib/api/admin.ts`) — 399 lines, all API calls in one file

---

## Cloudflare Resources

### Pages Project
| Setting | Value |
|---|---|
| Project Name | `nabome` |
| Build Output | `dist` |
| Compatibility Date | `2026-06-30` |
| Compatibility Flags | `nodejs_compat` |

### KV Namespaces
| Binding | ID | Purpose |
|---|---|---|
| `RATE_LIMIT_STORE` | `6969b592bba74117b3f27545dcf47e7a` | Rate limiting |

### Rate Limiting Configuration
| Route Type | Limit | Window |
|---|---|---|
| Standard | 100 req/min | 60s |
| Auth | 20 req/min | 60s |
| Admin | 60 req/min | 60s |
| Contact | 10 req/min | 60s |

### Functions
| Path | Purpose |
|---|---|
| `functions/_middleware.ts` | SEO middleware (meta tags, LRU cache 500 entries/60s) |
| `functions/api/[[path]].ts` | API catch-all dispatch |
| `functions/robots.txt.ts` | Dynamic robots.txt |
| `functions/sitemap.xml.ts` | Dynamic sitemap.xml |

---

## API Inventory

### Auth Endpoints (18 endpoints)
| Method | Path | Auth | Action |
|---|---|---|---|
| GET | `/api/auth/me` | Yes | Get current user |
| PUT | `/api/auth/me` | Yes | Update profile |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout |
| POST | `/api/auth/refresh` | No | Refresh token |
| POST | `/api/auth/forgot-password` | No | Forgot password |
| POST | `/api/auth/verify-reset-code` | No | Verify reset code |
| POST | `/api/auth/reset-password` | No | Reset password |
| POST | `/api/auth/change-password` | Yes | Change password |
| GET | `/api/auth/sessions` | Yes | List sessions |
| DELETE | `/api/auth/sessions/:id` | Yes | Delete session |
| POST | `/api/auth/verify-email` | No | Verify email |
| POST | `/api/auth/resend-verification` | No | Resend verification |
| POST | `/api/auth/change-email` | Yes | Change email |
| POST | `/api/auth/verify-email-change` | Yes | Verify email change |

### Product Endpoints (12 endpoints)
| Method | Path | Auth |
|---|---|---|
| GET | `/api/products` | No |
| GET | `/api/products/featured` | No |
| GET | `/api/products/new` | No |
| GET | `/api/products/search` | No |
| GET | `/api/products/autocomplete` | No |
| GET | `/api/products/by-slugs` | No |
| GET | `/api/products/:slug` | No |
| GET | `/api/products/:slug/variants` | No |
| GET | `/api/products/:slug/reviews` | No |
| GET | `/api/products/:slug/similar` | No |

### Category/Collection/Brand/Tag Endpoints (14 endpoints)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/categories` | List categories |
| GET | `/api/categories/:slug` | Category detail |
| GET | `/api/subcategories` | List subcategories |
| GET | `/api/subcategories/:slug` | Subcategory detail |
| GET | `/api/collections` | List collections |
| GET | `/api/collections/:slug` | Collection detail |
| GET | `/api/brands` | List brands |
| GET | `/api/brands/:slug` | Brand detail |
| GET | `/api/size-guides` | List size guides |
| GET | `/api/size-guides/:slug` | Size guide detail |
| GET | `/api/tags` | List tags |
| GET | `/api/tags/:slug` | Tag detail |
| GET | `/api/tags/:slug/products` | Tag products |

### Cart Endpoints (4 endpoints)
| Method | Path | Auth |
|---|---|---|
| GET | `/api/cart` | Yes |
| POST | `/api/cart/sync` | Yes |
| POST | `/api/cart/merge` | Yes |
| POST | `/api/cart/clear` | Yes |

### Checkout Endpoints (2 endpoints)
| Method | Path | Auth |
|---|---|---|
| POST | `/api/checkout` | Yes |
| POST | `/api/checkout/guest` | No |

### Order Endpoints (6 endpoints)
| Method | Path | Auth |
|---|---|---|
| GET | `/api/orders` | Yes |
| GET | `/api/orders/stats` | Yes |
| GET | `/api/orders/:id` | Yes |
| POST | `/api/orders/:id/cancel` | Yes |
| GET | `/api/orders/:id/tracking` | Yes |
| GET | `/api/orders/:id/invoice` | Yes |

### CMS Endpoints (7 endpoints)
| Method | Path |
|---|---|
| GET | `/api/cms/homepage` |
| GET | `/api/cms/pages` |
| GET | `/api/cms/pages/:slug` |
| GET | `/api/cms/navigation` |
| GET | `/api/cms/announcements` |
| GET | `/api/cms/footer` |
| GET | `/api/cms/social-proof` |

### Other Public Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/settings` | Public settings |
| GET | `/api/homepage` | Homepage data |
| GET | `/api/search/trending` | Trending search terms |
| POST | `/api/coupons/validate` | Validate coupon |
| POST | `/api/contact` | Contact form |
| POST | `/api/newsletter` | Newsletter subscribe |
| POST | `/api/payments/verify` | Verify payment |
| POST | `/api/payments/failed` | Payment failed |
| POST | `/api/payments/retry` | Retry payment |
| POST | `/api/payments/webhook` | Razorpay webhook |
| GET | `/sitemap.xml` | Dynamic sitemap |

### Admin Endpoints (~120+ endpoints across 33 handler files)

**Products (15+ endpoints):** CRUD, variants, images, bulk operations, duplicate, restore, schedule, labels, tags, related products  
**Categories (5 endpoints):** CRUD  
**Collections (5 endpoints):** CRUD  
**Orders (8 endpoints):** List, stats, detail, status update, internal notes, timeline, export, invoice  
**Customers (3 endpoints):** List, detail, update  
**CMS (20+ endpoints):** Pages CRUD, homepage sections CRUD + reorder, navigation CRUD, announcements CRUD, footer CRUD  
**Settings (6 endpoints):** Get/update settings, social links CRUD  
**Analytics (4 endpoints):** Sales, products, customers, delivery addresses  
**Media (4 endpoints):** CRUD  
**Marketing (5+ endpoints):** Campaigns CRUD, announcements  
**Support (8+ endpoints):** Tickets list/detail, status, assign, reply; FAQ CRUD  
**Notifications (4+ endpoints):** Admin list, templates CRUD, send  
**Returns/Refunds (10+ endpoints):** Admin list/detail, approve/reject/receive, refund CRUD/process/complete/fail  
**Lookbooks (7+ endpoints):** CRUD, items CRUD + reorder  
**Brands (5 endpoints):** CRUD  
**Size Guides (5 endpoints):** CRUD  
**Subcategories (4 endpoints):** CRUD  
**Product Labels/Tags (8 endpoints):** CRUD for labels and tags  
**Inventory (6 endpoints):** Overview, product movements, variant movements, adjust, alerts  
**Import/Export (3 endpoints):** Export products, export orders, import products  
**Search Index (3 endpoints):** Status, build, search  
**Other:** Coupon redemptions, abandoned carts, audit log, wishlists, product attributes, addresses, sessions, login attempts, webhook events, page templates

---

## Database Inventory

### Prisma Schema Overview (1,422 lines, 34 models)

| # | Model | Table Name | Module | Key Fields |
|---|---|---|---|---|
| 1 | Profile | `profiles` | Auth | id, role, email, firstName, lastName, phone, isActive |
| 2 | AuthSession | `auth_sessions` | Auth | id, profileId, accessToken, refreshToken, isActive |
| 3 | LoginAttempt | `login_attempts` | Auth | id, profileId, email, ipAddress, success |
| 4 | VerificationAttempt | `verification_attempts` | Auth | id, profileId, email, code, success |
| 5 | UserActionLog | `user_action_logs` | Auth | id, profileId, action, entity, metadata |
| 6 | Category | `categories` | Product | id, name, slug, parentId, imageUrl |
| 7 | Subcategory | `subcategories` | Product | id, name, slug, categoryId |
| 8 | Collection | `collections` | Product | id, name, slug, heroImageUrl, isFeatured |
| 9 | Brand | `brands` | Product | id, name, slug, logoUrl |
| 10 | SizeGuide | `size_guides` | Product | id, name, slug, categoryId, measurements (JSON) |
| 11 | Product | `products` | Product | id, name, slug, basePrice, categoryId, collectionId, brandId |
| 12 | ProductVariant | `product_variants` | Product | id, productId, sku, size, color, stock |
| 13 | ProductImage | `product_images` | Product | id, productId, variantId, url, altText |
| 14 | ProductAttribute | `product_attributes` | Product | id, productId, name, value |
| 15 | RelatedProduct | `related_products` | Product | id, sourceId, targetId, type |
| 16 | ProductTag | `product_tags` | Product | id, name, slug |
| 17 | ProductTagOnProduct | `product_tags_products` | Product | productId, tagId |
| 18 | ProductLabel | `product_labels` | Product | id, name, slug, color |
| 19 | ProductLabelOnProduct | `product_labels_products` | Product | productId, labelId |
| 20 | InventoryAlert | `inventory_alerts` | Product | id, variantId, type, currentStock |
| 21 | InventoryMovement | `inventory_movements` | Product | id, variantId, quantityChange, stockAfter |
| 22 | Address | `addresses` | Customer | id, profileId, label, line1, city, state, pincode, country |
| 23 | WishlistItem | `wishlist_items` | Customer | id, profileId, variantId |
| 24 | Cart | `carts` | Cart | id, profileId |
| 25 | CartItem | `cart_items` | Cart | id, cartId, variantId, quantity, savedForLater |
| 26 | Order | `orders` | Order | id, orderNumber, profileId, status, subtotal, total |
| 27 | OrderItem | `order_items` | Order | id, orderId, productId, variantId, quantity |
| 28 | OrderStatusHistory | `order_status_history` | Order | id, orderId, status, note |
| 29 | Coupon | `coupons` | Marketing | id, code, discountType, discountValue |
| 30 | CouponRedemption | `coupon_redemptions` | Marketing | id, couponId, orderId, profileId |
| 31 | Campaign | `campaigns` | Marketing | id, name, type, startDate, endDate |
| 32 | AnnouncementBar | `announcement_bars` | Marketing | id, text, linkUrl, position |
| 33 | ReturnRequest | `return_requests` | Returns | id, orderId, profileId, reason, status |
| 34 | Refund | `refunds` | Returns | id, returnRequestId, orderId, amount, status |
| 35 | Review | `reviews` | Review | id, productId, profileId, rating |
| 36 | HomepageSection | `homepage_sections` | CMS | id, sectionType, title, content (JSON) |
| 37 | NavigationMenu | `navigation_menus` | CMS | id, name, location, items (JSON) |
| 38 | FooterSection | `footer_sections` | CMS | id, column, title, content (JSON) |
| 39 | StaticPage | `static_pages` | CMS | id, title, slug, content (JSON) |
| 40 | Lookbook | `lookbooks` | CMS | id, name, slug, coverImageUrl |
| 41 | LookbookItem | `lookbook_items` | CMS | id, lookbookId, imageUrl, productId |
| 42 | MediaAsset | `media_assets` | Media | id, url, publicId, altText, type |
| 43 | SiteSetting | `site_settings` | Settings | id, siteName, logoUrl, currency, theme(JSON) |
| 44 | SocialMediaLink | `social_media_links` | Settings | id, platform, url |
| 45 | ContactSubmission | `contact_submissions` | Settings | id, name, email, message |
| 46 | NewsletterSubscriber | `newsletter_subscribers` | Settings | id, email |
| 47 | PageTemplate | `page_templates` | Template | id, name, slug, sections (JSON) |
| 48 | AnalyticsEvent | `analytics_events` | Analytics | id (BigInt), eventType, payload (JSON) |
| 49 | WebhookEvent | `webhook_events` | Webhook | id, eventId, source, payload (JSON) |
| 50 | Notification | `notifications` | Notification | id, profileId, type, channel, title |
| 51 | NotificationTemplate | `notification_templates` | Notification | id, event, subject, emailBody |
| 52 | SupportTicket | `support_tickets` | Support | id, orderId, profileId, subject, status |
| 53 | SupportTicketReply | `support_ticket_replies` | Support | id, ticketId, profileId, message |
| 54 | FAQ | `faqs` | Support | id, question, answer, category |

**Total: 54 models** (34 Prisma models + materialized views noted in comments)

### Enums
UserRole, Gender, OrderStatus, PaymentStatus, DiscountType, CampaignType, SectionType, Visibility, MenuLocation, AssetType, AnnouncementBarPosition, ReturnReason, ReturnStatus, RefundStatus, NotificationChannel, NotificationEvent, SupportTicketStatus, SupportTicketPriority

### Migrations (11)
| # | Name | Date |
|---|---|---|
| 1 | `20260619023155_init` | 2026-06-19 |
| 2 | `20260619162901_add_verification_token` | 2026-06-19 |
| 3 | `20260621122730_add_pending_email_fields` | 2026-06-21 |
| 4 | `20260621124956_add_reset_password_token` | 2026-06-21 |
| 5 | `20260621140000_rename_super_admin_to_admin` | 2026-06-21 |
| 6 | `20260621150000_add_trust_bar_section_type` | 2026-06-21 |
| 7 | `20260621160000_add_seo_preferences_to_settings` | 2026-06-21 |
| 8 | `20260625100000_add_missing_notification_events` | 2026-06-25 |
| 9 | `20260626100000_add_public_id_columns` | 2026-06-26 |
| 10 | `20260628100000_add_product_image_type_column` | 2026-06-28 |
| 11 | `20260629000000_drop_brand_story` | 2026-06-29 |

---

## Frontend Inventory

### Storefront Routes (30+ routes)

| Path | Page Component | Lazy | Auth |
|---|---|---|---|
| `/` | HomePage | Yes | No |
| `/products` | ProductListingPage | Yes | No |
| `/products/:slug` | ProductDetailPage | Yes | No |
| `/search` | SearchResultsPage | Yes | No |
| `/cart` | CartPage | Yes | No |
| `/wishlist` | WishlistPage | Yes | No |
| `/collections` | CollectionsIndexPage | Yes | No |
| `/collections/:slug` | CollectionPage | Yes | No |
| `/categories/:slug` | CategoryPage | Yes | No |
| `/checkout` | CheckoutPage | Yes | No |
| `/privacy` | StaticPage | Yes | No |
| `/terms` | StaticPage | Yes | No |
| `/faq` | FaqPage | Yes | No |
| `/shipping-returns` | StaticPage | Yes | No |
| `/lookbooks` | LookbookPage | Yes | No |
| `/lookbooks/:slug` | LookbookDetailPage | Yes | No |
| `/:slug` | StaticPage (catch-all) | Yes | No |

### Customer Account Routes (10 routes)
| Path | Component | Auth |
|---|---|---|
| `/account` | DashboardPage | Yes |
| `/account/orders` | OrdersPage | Yes |
| `/account/orders/:id` | OrderDetailPage | Yes |
| `/account/orders/:id/return` | ReturnRequestPage | Yes |
| `/account/addresses` | AddressesPage | Yes |
| `/account/wishlist` | WishlistPage | Yes |
| `/account/notifications` | NotificationsPage | Yes |
| `/account/settings` | SettingsPage | Yes |
| `/account/support` | SupportTicketsPage | Yes |

### Auth Routes (10 routes, duplicated with/without `/auth` prefix)
| Path | Component |
|---|---|
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/forgot-password` | ForgotPasswordPage |
| `/reset-password` | ResetPasswordPage |
| `/verify-email` | VerifyEmailPage |
| `/auth/login` | LoginPage (duplicate) |
| `/auth/register` | RegisterPage (duplicate) |
| `/auth/forgot-password` | ForgotPasswordPage (duplicate) |
| `/auth/reset-password` | ResetPasswordPage (duplicate) |
| `/auth/verify-email` | VerifyEmailPage (duplicate) |

### Admin Routes (37+ routes)
| Path | Component |
|---|---|
| `/admin` | DashboardPage |
| `/admin/products` | ProductsPage |
| `/admin/products/new` | ProductFormPage |
| `/admin/products/:id/edit` | ProductFormPage |
| `/admin/categories` | CategoriesPage |
| `/admin/collections` | CollectionsPage |
| `/admin/orders` | OrdersPage |
| `/admin/orders/:id` | OrderDetailPage |
| `/admin/returns` | ReturnsPage |
| `/admin/returns/:id` | ReturnDetailPage |
| `/admin/customers` | CustomersPage |
| `/admin/lookbooks` | LookbooksPage |
| `/admin/lookbooks/new` | LookbookFormPage |
| `/admin/lookbooks/:id/edit` | LookbookFormPage |
| `/admin/brands` | BrandsPage |
| `/admin/size-guides` | SizeGuidesPage |
| `/admin/labels` | LabelsPage |
| `/admin/inventory` | InventoryPage |
| `/admin/cms` | CMSPage |
| `/admin/cms/homepage` | HomepageBuilder |
| `/admin/cms/hero-builder` | HeroBuilder |
| `/admin/cms/footer` | FooterBuilder |
| `/admin/cms/header-builder` | HeaderBuilder |
| `/admin/media` | MediaLibrary |
| `/admin/seo` | SEOPage |
| `/admin/theme/builder` | ThemeBuilder |
| `/admin/analytics` | AnalyticsPage |
| `/admin/settings` | SettingsPage |
| `/admin/coupons` | CouponsPage |
| `/admin/reviews` | ReviewsPage |
| `/admin/newsletter` | NewsletterPage |
| `/admin/contacts` | ContactsPage |
| `/admin/announcements` | AnnouncementsPage |
| `/admin/import-export` | ImportExportPage |
| `/admin/search-index` | SearchIndexPage |
| `/admin/social-links` | SocialLinksPage |
| `/admin/support` | SupportTicketsPage |
| `/admin/support/:id` | SupportTicketDetailPage |
| `/admin/faq` | FAQPage |
| `/admin/notifications` | NotificationsPage |
| `/admin/webhooks` | WebhookEventsPage |
| `/admin/page-templates` | PageTemplatesPage |
| `/admin/campaigns` | CampaignsPage |
| `/admin/abandoned-carts` | AbandonedCartsPage |
| `/admin/auth` | AuthActivityPage |
| `/admin/audit-log` | AuditLogPage |
| `/admin/wishlists` | WishlistsPage |

### Zustand Stores
| Store | File | Purpose |
|---|---|---|
| `auth-store.ts` | `src/stores/` | Auth state (localStorage persistence) |
| `cart-store.ts` | `src/storefront/stores/` | Cart state |
| `ui-store.ts` | `src/storefront/stores/` | UI state (mobile menu, search, etc.) |
| `connectivity-store.ts` | `src/storefront/store/` | Online/offline connectivity |

### Custom Hooks (13)
| Hook | Location | Purpose |
|---|---|---|
| `useAuth` | `src/hooks/` | Auth operations |
| `useFocusTrap` | `src/hooks/` | Focus trapping for modals |
| `useAnnouncements` | `src/storefront/hooks/` | CMS announcements |
| `useCart` | `src/storefront/hooks/` | Cart operations |
| `useCategories` | `src/storefront/hooks/` | Categories list |
| `useCollections` | `src/storefront/hooks/` | Collections list |
| `useConnectivityManager` | `src/storefront/hooks/` | Network status |
| `useFooter` | `src/storefront/hooks/` | Footer data |
| `useNavigation` | `src/storefront/hooks/` | Navigation menus |
| `usePolicyPages` | `src/storefront/hooks/` | Policy pages |
| `useProducts` | `src/storefront/hooks/` | Product data |
| `useSettings` | `src/storefront/hooks/` | Site settings |
| `useWishlist` | `src/storefront/hooks/` | Wishlist operations |

### Contexts/Providers
- `react-helmet-async` — Head management (HelmetProvider in App.tsx)
- `QueryClientProvider` (TanStack Query) — Server state
- `ErrorBoundary` — Per-route error boundary

### Components Breakdown
| Category | Count |
|---|---|
| Shared UI components | 7 (Button, Input, Select, etc.) |
| Shared components | 9 (SafeImage, ErrorBoundary, etc.) |
| Auth components | 2 (ProtectedRoute, AdminRoute) |
| Storefront components | 24 |
| Storefront sections | 14 |
| Storefront layout | 7 |
| Checkout sub-components | 2 |
| Admin pages | 37 |
| Admin common components | 10 |
| Admin skeletons | 6 |
| Admin product components | 8 |
| Admin CMS components | 2 |
| Auth pages | 7 |
| Storefront pages | 22 |
| **Total components** | **~157** |

---

## Testing Inventory

### Unit Tests (28 test files)
| Directory | Test Files |
|---|---|
| `api/_handlers/__tests__/` | 7 (addresses, admin-auth, admin-products, coupons, products, reviews, wishlist) + 1 test-utils |
| `api/_lib/__tests__/` | 14 (audit, auth-middleware-session, auth-security, csrf, email-templates, health, input-security, rate-limit, response, sanitize, security-headers, turnstile, validate) |
| `src/components/__tests__/` | 1 (ErrorBoundary) |
| `src/lib/__tests__/` | 4 (cn, format, seo, validators) |
| `src/admin/common/__tests__/` | 2 (Modal, StatusBadge) |
| `src/storefront/components/__tests__/` | 2 (CartPage, CheckoutPage) |
| `src/storefront/stores/__tests__/` | 1 (cart-store) |
| `src/stores/__tests__/` | 1 (auth-store) |

### E2E Tests (9 spec files)
| Test File | Lines | Scope |
|---|---|---|
| `admin-crud.spec.ts` | — | Admin CRUD operations |
| `admin-flows.spec.ts` | 540 | Admin workflows |
| `auth.spec.ts` | — | Auth flow |
| `cart-edge-cases.spec.ts` | — | Cart edge cases |
| `checkout.spec.ts` | 94 | Checkout (does NOT test payment) |
| `customer-journey.spec.ts` | — | Full customer journey |
| `navigation.spec.ts` | — | Navigation |
| `product-detail.spec.ts` | — | Product detail |

**Coverage assessment:** Critically low (~2.5/10). 28 unit tests across 351 source files. No E2E tests for payment flow.

---

## Environment Variables

### Frontend (Vite — exposed to browser)
| Variable | Source | In .env.example |
|---|---|---|
| `VITE_SUPABASE_URL` | .env / Pages secrets | Yes |
| `VITE_SUPABASE_ANON_KEY` | .env / Pages secrets | Yes |
| `VITE_RAZORPAY_KEY_ID` | .env / Pages secrets | Yes |
| `VITE_SITE_URL` | .env / Pages secrets | Yes |
| `VITE_GA_ID` | .env / Pages secrets | Yes |
| `VITE_CLOUDINARY_CLOUD_NAME` | .env / Pages secrets | Yes |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | .env / Pages secrets | Yes |
| `VITE_TURNSTILE_SITE_KEY` | .env / Pages secrets | Yes |

### Backend (Server-only — Cloudflare Pages secrets)
| Variable | Source | In .env.example |
|---|---|---|
| `DATABASE_URL` | Pages secret | Yes |
| `DATABASE_URL_POOLED` | Pages secret | Yes |
| `SUPABASE_URL` | Pages secret | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Pages secret | Yes |
| `SUPABASE_ANON_KEY` | Pages secret | Yes |
| `RAZORPAY_KEY_ID` | Pages secret | Yes |
| `RAZORPAY_KEY_SECRET` | Pages secret | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | Pages secret | Yes |
| `RESEND_API_KEY` | Pages secret | Yes |
| `EMAIL_FROM` | Pages secret | Yes |
| `ADMIN_EMAILS` | Pages secret | Yes |
| `SITE_URL` | Pages secret | Yes |
| `CLOUDINARY_CLOUD_NAME` | Pages secret | Yes |
| `CLOUDINARY_API_KEY` | Pages secret | Yes |
| `CLOUDINARY_API_SECRET` | Pages secret | Yes |
| `TURNSTILE_SECRET_KEY` | Pages secret | Yes |

---

## Third-Party Integrations

| Service | Integration Point | Status |
|---|---|---|
| **Neon PostgreSQL** | Prisma adapter (`@prisma/adapter-neon`) | Configured |
| **Supabase Auth** | `@supabase/supabase-js` SDK | Configured |
| **Razorpay** | Frontend checkout JS + backend webhook verification | Configured |
| **Resend** | `api/_lib/email.ts` — email sending | Configured |
| **Cloudinary** | `api/_lib/cloudinary.ts` — upload + URL transformation | Configured |
| **Google Analytics** | `src/components/GoogleAnalytics.tsx` (gated by VITE_GA_ID) | Configured |
| **Cloudflare Turnstile** | `api/_lib/turnstile.ts` + `src/components/TurnstileWidget.tsx` | Configured |
| **Cloudflare KV** | `api/_lib/rate-limit.ts` — rate limiting only | Configured |

---

## Code Quality Metrics

### File Size Distribution
| Size Range | Count |
|---|---|
| 0-50 lines | ~80 files |
| 51-200 lines | ~150 files |
| 201-500 lines | ~80 files |
| 501-1000 lines | ~25 files |
| 1000+ lines | 4 files (auth.ts, payments.ts, HomepageBuilder.tsx, seed.ts) |

### Patterns & Paradigms
- **Frontend:** Functional components with hooks, React.lazy code splitting
- **State:** Zustand (client) + TanStack Query (server)
- **Styling:** Tailwind CSS + CVA + CSS classes (mixed)
- **API:** Manual route registry pattern in catch-all handler
- **Validation:** Zod schemas (partial coverage)
- **Auth:** JWT-based with session tracking, CSRF double-submit cookie

---

## Known Risks & Observations

### Critical Risks (P1)
1. **Auth handler (1,194 lines)** — Monolithic, violates SRP
2. **Payment handler (1,058 lines)** — Monolithic, high bug risk in payment path
3. **No error monitoring** — Production errors go unnoticed
4. **CSP allows `unsafe-inline`** — Weakens XSS protection
5. **CSRF not enforced on most endpoints** — CSRF infrastructure exists but not applied
6. **Near-zero test coverage** — 28 tests across 351 source files
7. **No database backup strategy evident** — Data loss risk
8. **No abandoned cart recovery** — Lost revenue (70%+ cart abandonment in fashion)
9. **No automated email notifications** — Essential for order operations

### High Risks (P2)
1. **Prisma errors may leak to client** — Not all handlers catch DB errors
2. **Zod validation missing for many endpoints** — Product CRUD, CMS, settings, etc.
3. **Password reset doesn't invalidate sessions** — Security gap
4. **No account lockout** — Brute force possible
5. **Missing database indexes** — `profile.email`, `orderItem.productId`, composite indexes
6. **Cart has no expiration** — Database bloat over time
7. **No PWA install prompt** — Missed engagement opportunity
8. **Accessibility: zero testing, contrast issues, missing ARIA** — Legal risk
9. **HTML not sanitized in product descriptions** — Stored XSS risk
10. **SEO middleware queries DB on cache miss** — TTFB impact

### Observations
- **Duplicate auth routes** (`/login` and `/auth/login`) — SEO confusion
- **Catch-all `:slug` route** — Silent soft 404s for misspelled paths
- **`prisma.config.ts`** — Dead config file at root
- **12 API test files but only test a fraction of 50+ handlers**
- **Admin API client (399 lines)** — God object, imports entire API surface
- **Mixed styling** — Tailwind + CSS classes + CVA + inline styles
- **Hardcoded strings** — No i18n, all text in English
- **Unsplash images in seed data** — Not representative of premium fashion
- **`@dnd-kit/utilities`** — May be unused (version mismatch with core/sortable)

---

## Recommendations

### Immediate (Phase 0 — Launch Blockers)
1. Integrate Sentry error monitoring
2. Fix CSP: remove `unsafe-inline`
3. Enable CSRF on all mutation endpoints
4. Verify email notifications work end-to-end
5. Add health check endpoint
6. Fix Prisma error handling (no schema leakage)
7. Add account lockout
8. Invalidate sessions on password reset
9. Add Zod validation for all mutation endpoints
10. Implement abandoned cart recovery

### Short-term (Phase 2 — Core Hardening)
1. Split auth handler into domain modules
2. Split admin API client into domain modules
3. Split payment webhook handler
4. Add request ID tracking
5. Standardize API error responses
6. Add missing database indexes
7. Implement cart expiration cleanup
8. Add skeleton loading states for all pages
9. Implement granular error boundaries
10. Add GA4 e-commerce events
11. Implement Facebook Pixel + CAPI

### Medium-term (Phase 3 — UX & Business)
1. One-click "Buy Now" button
2. Back-in-stock notifications
3. Loyalty/rewards program
4. i18n framework setup
5. Multi-currency support
6. PWA install prompt
7. Keyboard shortcuts
8. Swipe gestures for mobile
9. Referral program
10. Bulk product editing in admin

### Long-term (Phase 4 — Premium Experience)
1. Professional fashion photography
2. Editorial content (brand story, lookbook narratives)
3. Micro-interactions (flying cart, hover zoom)
4. Page transition animations
5. Theme builder live preview
6. Voice search
7. Automated return labels
8. Size recommendation quiz
9. Analytics export
10. Inventory forecasting

---

## Live Site Verification

**URL:** https://www.nabome.online  
**Date:** 2026-07-07

### Verified (Matches Codebase)
- Site responds with correct title: "নবME — Premium Fashion"
- Cloudflare Pages serving correctly
- Service worker active (cache headers observed)

### Not Verified / Requires Browser Testing
- Full page rendering (SPA requires JS execution)
- Navigation, product listing, cart, checkout flows
- Admin panel functionality
- Mobile/responsive layouts
- Payment flow (requires test card)

---

## File Change Log

| Date | File | Action |
|---|---|---|
| 2026-07-07 | `PROJECT_INVENTORY.md` | Created — Phase 1 Complete Project Inventory |
| 2026-07-07 | `README.md` | Updated — Phase 1 summary appended |

---

*End of PROJECT_INVENTORY.md — Generated 2026-07-07*
