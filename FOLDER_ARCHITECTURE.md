# নবME (Nabome) — Complete Folder Architecture & Organizational Blueprint

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for folder organization  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0)

---

## Table of Contents

1. [Root Project Structure](#1-root-project-structure)
2. [Frontend Architecture (`src/`)](#2-frontend-architecture-src)
3. [Backend Architecture (`api/`)](#3-backend-architecture-api)
4. [Database Architecture (`prisma/`)](#4-database-architecture-prisma)
5. [Testing Architecture (`e2e/`)](#5-testing-architecture-e2e)
6. [Public Assets (`public/`)](#6-public-assets-public)
7. [CI/CD Architecture (`.github/`)](#7-cicd-architecture-github)
8. [Configuration Files](#8-configuration-files)
9. [Naming Conventions](#9-naming-conventions)
10. [Import & Export Conventions](#10-import--export-conventions)
11. [Module Boundaries & Dependency Rules](#11-module-boundaries--dependency-rules)
12. [File Organization Rules](#12-file-organization-rules)
13. [Naming Standards Reference](#13-naming-standards-reference)

---

## 1. Root Project Structure

### 1.1 Complete Root Directory

```
nabome/
├── .github/                    # CI/CD pipelines and GitHub config
│   └── workflows/
│       └── ci.yml              # GitHub Actions pipeline
│
├── api/                        # Backend API handlers (Cloudflare Pages Functions)
│   ├── _lib/                   # Shared API utilities
│   ├── _handlers/              # Domain-specific handlers
│   ├── [...path].ts            # Catch-all API router
│   └── health.ts               # Health check endpoint
│
├── e2e/                        # End-to-end tests (Playwright)
│   ├── auth.setup.ts           # Auth setup for E2E tests
│   ├── fixtures/               # Test fixtures and mock data
│   └── specs/                  # E2E test specifications
│
├── functions/                  # Cloudflare Pages Functions (middleware)
│   ├── _middleware.ts          # SEO + security middleware
│   └── api/
│       ├── robots.txt.ts       # Robots.txt generator
│       └── sitemap.xml.ts      # Sitemap generator
│
├── prisma/                     # Database schema and migrations
│   ├── schema.prisma           # Prisma schema definition
│   ├── migrations/             # Database migrations
│   └── seed/
│       └── index.ts            # Seed script
│
├── public/                     # Static assets (served as-is)
│   ├── _headers                # Cloudflare Pages headers
│   ├── _redirects              # Cloudflare Pages redirects
│   ├── favicon.svg             # Browser tab icon
│   ├── og-image.svg            # Social media share image
│   ├── robots.txt              # Search engine crawling rules
│   └── site.webmanifest        # PWA manifest
│
├── src/                        # Frontend source code (React SPA)
│   ├── app/                    # Application shell
│   ├── features/               # Feature modules (self-contained)
│   ├── shared/                 # Shared UI components and utilities
│   ├── lib/                    # Global utilities (no feature logic)
│   ├── stores/                 # Global Zustand stores
│   ├── types/                  # Global TypeScript types
│   └── styles/                 # Global CSS and Tailwind config
│
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── .node-version               # Node.js version pinning
├── ARCHITECTURE.md             # Complete engineering standards
├── FOLDER_ARCHITECTURE.md      # This file — folder organization
├── README_EARLY.md             # Historical rebuild blueprint
├── TECH_STACK.md               # Technology decisions
├── eslint.config.ts            # ESLint configuration
├── package.json                # Dependencies and scripts
├── pnpm-lock.yaml              # pnpm lockfile
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Vitest test configuration
├── playwright.config.ts        # Playwright E2E configuration
└── wrangler.jsonc              # Cloudflare Pages configuration
```

### 1.2 Root Directory Responsibilities

| Directory/File | Responsibility | Owner |
|----------------|---------------|-------|
| `.github/` | CI/CD pipelines, GitHub Actions workflows | DevOps |
| `api/` | Backend API handlers, edge functions | Backend |
| `e2e/` | End-to-end test suites | QA |
| `functions/` | Cloudflare Pages middleware (SEO, security) | Backend |
| `prisma/` | Database schema, migrations, seeds | Database |
| `public/` | Static assets served directly by Cloudflare Pages | Frontend |
| `src/` | Frontend React application source | Frontend |
| Config files | Build, lint, type, test configuration | DevOps |

### 1.3 Root Directory Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No source code at root** | All source in `src/`, `api/`, `functions/`, `prisma/` | Clean separation |
| **Config files at root** | Build tools, linting, testing configs | Standard convention |
| **No `src/lib/media/` barrel** | Direct imports only | Tree-shaking |
| **No `dist/` in git** | Listed in `.gitignore` | Build artifacts excluded |
| **No `node_modules/` in git** | Listed in `.gitignore` | Dependencies excluded |
| **No `.env` in git** | Listed in `.gitignore` | Secrets excluded |

---

## 2. Frontend Architecture (`src/`)

### 2.1 Complete Frontend Directory

```
src/
├── app/                              # Application shell
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   ├── providers.tsx                 # Provider composition
│   └── routes.tsx                    # Route definitions
│
├── features/                         # Feature modules (self-contained)
│   ├── auth/                         # Authentication feature
│   │   ├── components/               # UI components
│   │   ├── hooks/                    # Custom hooks
│   │   ├── api/                      # API client functions
│   │   ├── store/                    # Zustand stores
│   │   ├── validators/               # Zod schemas
│   │   └── types.ts                  # TypeScript types
│   │
│   ├── products/                     # Product feature
│   │   ├── components/               # ProductCard, ProductGrid, etc.
│   │   ├── hooks/                    # useProducts, useProduct, etc.
│   │   ├── api/                      # Product API client
│   │   └── types.ts                  # Product types
│   │
│   ├── cart/                         # Cart feature
│   │   ├── components/               # CartDrawer, CartItem, etc.
│   │   ├── hooks/                    # useCart
│   │   ├── store/                    # cart-store.ts
│   │   ├── api/                      # Cart API client
│   │   └── types.ts                  # Cart types
│   │
│   ├── checkout/                     # Checkout feature
│   │   ├── components/               # CheckoutLayout, ShippingStep, etc.
│   │   ├── hooks/                    # useCheckout
│   │   ├── api/                      # Checkout API client
│   │   └── types.ts                  # Checkout types
│   │
│   ├── orders/                       # Orders feature
│   │   ├── components/               # OrderList, OrderDetail, etc.
│   │   ├── hooks/                    # useOrders
│   │   ├── api/                      # Orders API client
│   │   └── types.ts                  # Order types
│   │
│   ├── search/                       # Search feature
│   │   ├── components/               # SearchOverlay, SearchResults, etc.
│   │   ├── hooks/                    # useSearch
│   │   ├── api/                      # Search API client
│   │   └── types.ts                  # Search types
│   │
│   ├── wishlist/                     # Wishlist feature
│   │   ├── components/               # WishlistButton, WishlistPage
│   │   ├── hooks/                    # useWishlist
│   │   ├── api/                      # Wishlist API client
│   │   └── types.ts                  # Wishlist types
│   │
│   ├── home/                         # Homepage feature
│   │   ├── components/               # HeroSection, FeaturedProducts, etc.
│   │   └── hooks/                    # useHomepage
│   │
│   └── admin/                        # Admin panel feature
│       ├── layout/                   # Admin layout (sidebar, topbar)
│       ├── dashboard/                # Admin dashboard
│       ├── products/                 # Product management
│       ├── orders/                   # Order management
│       ├── customers/                # Customer management
│       ├── categories/               # Category management
│       ├── collections/              # Collection management
│       ├── brands/                   # Brand management
│       ├── coupons/                  # Coupon management
│       ├── cms/                      # Content management
│       ├── media/                    # Media library
│       ├── analytics/                # Analytics dashboard
│       └── settings/                 # Admin settings
│
├── shared/                           # Shared components and utilities
│   ├── ui/                           # Design system primitives
│   │   ├── Button.tsx                # Button component
│   │   ├── Input.tsx                 # Input component
│   │   ├── Select.tsx                # Select component
│   │   ├── Badge.tsx                 # Badge component
│   │   ├── Card.tsx                  # Card component
│   │   ├── Dialog.tsx                # Dialog component
│   │   ├── Toast.tsx                 # Toast notification
│   │   ├── Skeleton.tsx              # Loading skeleton
│   │   ├── Label.tsx                 # Form label
│   │   ├── Checkbox.tsx              # Checkbox input
│   │   ├── Radio.tsx                 # Radio input
│   │   ├── Switch.tsx                # Toggle switch
│   │   ├── Tabs.tsx                  # Tab navigation
│   │   ├── Tooltip.tsx               # Tooltip
│   │   ├── Accordion.tsx             # Collapsible content
│   │   ├── Breadcrumbs.tsx           # Breadcrumb navigation
│   │   ├── Pagination.tsx            # Pagination controls
│   │   ├── EmptyState.tsx            # Empty state placeholder
│   │   └── index.ts                  # Barrel file (UI only)
│   │
│   ├── layout/                       # Layout components
│   │   ├── Header.tsx                # Site header
│   │   ├── Footer.tsx                # Site footer
│   │   ├── MobileNav.tsx             # Mobile navigation
│   │   ├── BottomNav.tsx             # Mobile bottom navigation
│   │   ├── MegaMenu.tsx              # Desktop mega menu
│   │   └── Layout.tsx                # Main layout wrapper
│   │
│   ├── auth/                         # Auth guard components
│   │   ├── ProtectedRoute.tsx        # Auth-protected route
│   │   └── AdminRoute.tsx            # Admin-only route
│   │
│   └── feedback/                     # Feedback UI components
│       ├── ErrorBoundary.tsx         # React error boundary
│       ├── ErrorPage.tsx             # Error page display
│       ├── LoadingSpinner.tsx        # Loading indicator
│       ├── SkipToContent.tsx         # Accessibility skip link
│       └── CookieConsent.tsx         # Cookie consent banner
│
├── lib/                              # Global utilities (no feature logic)
│   ├── api/                          # HTTP client
│   │   ├── client.ts                 # Fetch wrapper with auth, CSRF, retry
│   │   ├── endpoints.ts              # API endpoint constants
│   │   └── types.ts                  # API response types
│   │
│   ├── utils/                        # Pure utility functions
│   │   ├── cn.ts                     # ClassName utility (clsx + tailwind-merge)
│   │   ├── format.ts                 # Number, currency, date formatting
│   │   ├── slug.ts                   # Slug generation
│   │   └── responsive.ts             # Responsive helpers
│   │
│   ├── hooks/                        # Generic hooks (not feature-specific)
│   │   ├── useDebounce.ts            # Debounce hook
│   │   ├── useLocalStorage.ts        # LocalStorage hook
│   │   ├── useMediaQuery.ts          # Media query hook
│   │   ├── useClickOutside.ts        # Click outside hook
│   │   ├── useFocusTrap.ts           # Focus trap hook
│   │   └── useInfiniteScroll.ts      # Infinite scroll hook
│   │
│   ├── validators/                   # Shared Zod schemas
│   │   ├── auth.ts                   # Auth validation schemas
│   │   ├── product.ts                # Product validation schemas
│   │   ├── cart.ts                   # Cart validation schemas
│   │   ├── checkout.ts               # Checkout validation schemas
│   │   └── index.ts                  # Barrel file
│   │
│   ├── config.ts                     # App configuration
│   ├── constants.ts                  # Global constants
│   ├── seo.ts                        # SEO helpers
│   └── analytics.ts                  # Analytics helpers
│
├── stores/                           # Global Zustand stores
│   ├── auth-store.ts                 # Auth state (session, user)
│   ├── ui-store.ts                   # UI state (theme, sidebar, modals)
│   └── index.ts                      # Barrel file
│
├── types/                            # Global TypeScript types
│   ├── product.ts                    # Product types
│   ├── order.ts                      # Order types
│   ├── user.ts                       # User types
│   ├── cart.ts                       # Cart types
│   ├── admin.ts                      # Admin types
│   └── index.ts                      # Barrel file
│
└── styles/
    └── globals.css                   # Global styles, Tailwind config
```

### 2.2 Feature Module Internal Structure

Every feature module follows this exact structure:

```
src/features/{feature-name}/
├── components/                       # UI components specific to this feature
│   ├── ComponentName.tsx             # One component per file
│   └── index.ts                      # Barrel file (optional, only for complex features)
│
├── hooks/                            # Custom hooks specific to this feature
│   ├── useHookName.ts                # One hook per file
│   └── index.ts                      # Barrel file (optional)
│
├── api/                              # API client functions
│   └── {feature-name}.ts             # API calls for this feature
│
├── store/                            # Zustand stores (only if feature needs client state)
│   └── {feature-name}-store.ts       # Feature-specific state
│
├── validators/                       # Zod schemas (only if feature has forms)
│   └── {feature-name}.ts             # Validation schemas
│
└── types.ts                          # TypeScript types for this feature
```

### 2.3 Feature Module Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Self-contained** | Components, hooks, API, types in one folder | Co-location |
| **No cross-feature imports** | Features cannot import from other features | Prevents coupling |
| **One component per file** | File name matches component name | Easy to find |
| **Named exports only** | No default exports | Better refactoring |
| **Types at root** | `types.ts` at feature root | Easy to find |
| **API client separate** | `api/` folder for API calls | Separation of concerns |
| **Store optional** | Only create if feature needs client state | Minimize client state |
| **Validators optional** | Only create if feature has forms | Avoid unused code |

### 2.4 Shared Module Structure

```
src/shared/
├── ui/                               # Design system primitives
│   ├── Button.tsx                    # Atomic component
│   ├── index.ts                      # Barrel file (ONLY barrel file allowed)
│   └── ...                           # Other UI primitives
│
├── layout/                           # Layout components
│   ├── Header.tsx                    # Site header
│   └── ...                           # Other layout components
│
├── auth/                             # Auth guards
│   ├── ProtectedRoute.tsx            # Auth guard
│   └── AdminRoute.tsx                # Admin guard
│
└── feedback/                         # Feedback UI
    ├── ErrorBoundary.tsx             # Error boundary
    └── ...                           # Other feedback components
```

### 2.5 Shared Module Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No feature logic** | Shared components are pure UI | Reusability |
| **No feature imports** | Cannot import from features/ | Prevents circular deps |
| **No Zustand stores** | Shared components use props, not global state | Flexibility |
| **No API calls** | Shared components receive data via props | Testability |
| **One component per file** | File name matches component name | Consistency |
| **forwardRef on all** | All UI primitives use forwardRef | Composability |
| **displayName set** | All components have displayName | Debugging |

### 2.6 Lib Module Structure

```
src/lib/
├── api/                              # HTTP client
│   ├── client.ts                     # Fetch wrapper
│   ├── endpoints.ts                  # API endpoint constants
│   └── types.ts                      # API response types
│
├── utils/                            # Pure utility functions
│   ├── cn.ts                         # ClassName utility
│   ├── format.ts                     # Formatting helpers
│   ├── slug.ts                       # Slug generation
│   └── responsive.ts                 # Responsive helpers
│
├── hooks/                            # Generic hooks
│   ├── useDebounce.ts                # Debounce hook
│   └── ...                           # Other generic hooks
│
├── validators/                       # Shared Zod schemas
│   ├── auth.ts                       # Auth schemas
│   └── index.ts                      # Barrel file
│
├── config.ts                         # App configuration
├── constants.ts                      # Global constants
├── seo.ts                            # SEO helpers
└── analytics.ts                      # Analytics helpers
```

### 2.7 Lib Module Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No feature logic** | Only generic utilities | Reusability |
| **No feature imports** | Cannot import from features/ | Prevents circular deps |
| **No Zustand stores** | Utilities are pure functions | Testability |
| **No API calls** | Utilities transform data, not fetch it | Separation |
| **Pure functions** | No side effects, no state | Predictability |
| **Well-typed** | Full TypeScript types | Type safety |

---

## 3. Backend Architecture (`api/`)

### 3.1 Complete Backend Directory

```
api/
├── _lib/                             # Shared API utilities
│   ├── auth/                         # Auth infrastructure
│   │   ├── middleware.ts             # authenticate(), authorize()
│   │   ├── session.ts               # Session CRUD
│   │   ├── supabase.ts              # Supabase client
│   │   └── tokens.ts                # Token generation, hashing
│   │
│   ├── validation/
│   │   ├── schemas.ts               # Shared Zod schemas
│   │   └── middleware.ts            # validateRequest()
│   │
│   ├── security/
│   │   ├── csrf.ts                  # CSRF protection
│   │   ├── rate-limit.ts            # Rate limiting (KV)
│   │   ├── turnstile.ts             # Bot protection
│   │   ├── sanitize.ts              # Input sanitization
│   │   └── headers.ts               # Security headers
│   │
│   ├── database/
│   │   ├── client.ts                # Prisma client singleton
│   │   ├── transaction.ts           # Transaction helpers
│   │   └── connection.ts            # Connection pooling (Hyperdrive)
│   │
│   ├── email/
│   │   ├── client.ts                # Resend client
│   │   ├── templates/               # Email templates (React Email)
│   │   │   ├── order-confirmation.tsx
│   │   │   ├── password-reset.tsx
│   │   │   ├── email-verification.tsx
│   │   │   └── welcome.tsx
│   │   └── send.ts                  # Send helpers
│   │
│   ├── storage/
│   │   ├── cloudinary.ts            # Cloudinary service
│   │   └── upload.ts                # Upload helpers
│   │
│   ├── payments/
│   │   ├── razorpay.ts              # Razorpay client
│   │   └── webhooks.ts              # Webhook verification
│   │
│   ├── cache/
│   │   ├── kv.ts                    # KV caching helpers
│   │   └── strategies.ts            # Cache invalidation
│   │
│   ├── logging/
│   │   ├── logger.ts                # Pino logger
│   │   └── audit.ts                 # Audit logging
│   │
│   ├── response.ts                  # Standardized responses
│   ├── errors.ts                    # Error classes
│   ├── pagination.ts                # Pagination helpers
│   ├── env.ts                       # Environment validation
│   └── types.ts                     # Shared API types
│
├── _handlers/                        # API endpoint handlers
│   ├── auth/                         # Auth domain
│   │   ├── register.ts              # POST /api/auth/register
│   │   ├── login.ts                 # POST /api/auth/login
│   │   ├── logout.ts                # POST /api/auth/logout
│   │   ├── refresh.ts               # POST /api/auth/refresh
│   │   ├── password-reset.ts        # POST /api/auth/password-reset
│   │   ├── email-verification.ts    # POST /api/auth/verify-email
│   │   ├── email-change.ts          # POST /api/auth/change-email
│   │   └── profile.ts              # PATCH /api/auth/profile
│   │
│   ├── products/                     # Products domain
│   │   ├── list.ts                  # GET /api/products
│   │   ├── detail.ts                # GET /api/products/:id
│   │   ├── search.ts                # GET /api/products/search
│   │   ├── variants.ts              # GET /api/products/:id/variants
│   │   └── reviews.ts              # GET/POST /api/products/:id/reviews
│   │
│   ├── cart/                         # Cart domain
│   │   ├── get.ts                   # GET /api/cart
│   │   ├── add.ts                   # POST /api/cart/add
│   │   ├── update.ts                # PATCH /api/cart/:id
│   │   ├── remove.ts                # DELETE /api/cart/:id
│   │   └── sync.ts                  # POST /api/cart/sync
│   │
│   ├── checkout/                     # Checkout domain
│   │   ├── create-order.ts          # POST /api/checkout/create-order
│   │   ├── verify-payment.ts        # POST /api/checkout/verify-payment
│   │   └── guest.ts                 # POST /api/checkout/guest
│   │
│   ├── orders/                       # Orders domain
│   │   ├── list.ts                  # GET /api/orders
│   │   ├── detail.ts                # GET /api/orders/:id
│   │   ├── tracking.ts              # GET /api/orders/:id/tracking
│   │   ├── cancel.ts                # POST /api/orders/:id/cancel
│   │   └── return-request.ts        # POST /api/orders/:id/return
│   │
│   ├── wishlist/                     # Wishlist domain
│   │   ├── list.ts                  # GET /api/wishlist
│   │   ├── add.ts                   # POST /api/wishlist
│   │   └── remove.ts                # DELETE /api/wishlist/:id
│   │
│   ├── addresses/                    # Addresses domain
│   │   ├── list.ts                  # GET /api/addresses
│   │   ├── create.ts                # POST /api/addresses
│   │   ├── update.ts                # PATCH /api/addresses/:id
│   │   └── delete.ts                # DELETE /api/addresses/:id
│   │
│   ├── webhooks/                     # Webhook handlers
│   │   ├── razorpay.ts              # Razorpay webhook handler
│   │   └── handlers.ts              # Webhook event handlers
│   │
│   └── admin/                        # Admin-specific handlers
│       ├── dashboard.ts              # Admin dashboard stats
│       ├── products.ts               # Admin product CRUD
│       ├── orders.ts                 # Admin order management
│       ├── customers.ts              # Admin customer management
│       ├── categories.ts             # Admin category CRUD
│       ├── collections.ts            # Admin collection CRUD
│       ├── brands.ts                 # Admin brand CRUD
│       ├── coupons.ts                # Admin coupon CRUD
│       ├── campaigns.ts              # Admin campaign CRUD
│       ├── cms.ts                    # Admin CMS management
│       ├── media.ts                  # Admin media library
│       ├── settings.ts               # Admin settings
│       ├── analytics.ts              # Admin analytics
│       ├── reviews.ts                # Admin review moderation
│       ├── returns.ts                # Admin return management
│       ├── inventory.ts              # Admin inventory management
│       ├── lookbooks.ts              # Admin lookbook management
│       ├── size-guides.ts            # Admin size guide management
│       ├── faq.ts                    # Admin FAQ management
│       ├── contacts.ts               # Admin contact management
│       ├── newsletter.ts             # Admin newsletter management
│       ├── notifications.ts          # Admin notification management
│       ├── webhooks.ts               # Admin webhook management
│       └── export.ts                 # Admin data export
│
├── [...path].ts                      # Catch-all API router
└── health.ts                         # Health check endpoint
```

### 3.2 Handler Internal Structure

Every API handler follows this exact structure:

```typescript
// api/_handlers/{domain}/{action}.ts

// 1. Imports
import { z } from 'zod';
import { db } from '../../_lib/database/client';
import { authenticate } from '../../_lib/auth/middleware';
import { validateRequest } from '../../_lib/validation/middleware';
import { rateLimit } from '../../_lib/security/rate-limit';
import { success, error } from '../../_lib/response';
import { AppError } from '../../_lib/errors';

// 2. Schema definition
const schema = z.object({
  // ... validation schema
});

// 3. Handler function
export async function handlerName(request: Request, env: Env) {
  // 1. Rate limit
  await rateLimit(request, { limit: 10, window: 60 });

  // 2. Authenticate
  const user = await authenticate(request);

  // 3. Authorize (if needed)
  authorize(user, 'admin');

  // 4. Validate input
  const body = await validateRequest(request, schema);

  // 5. Business logic
  const result = await db.model.findMany({ /* ... */ });

  // 6. Return success
  return success(result);
}
```

### 3.3 Handler Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max 150 lines** | Split handlers over 150 lines | Focus and readability |
| **One action per file** | Each file handles one endpoint action | Single responsibility |
| **Named exports** | Export handler function by name | Explicit imports |
| **No business logic** | Handlers orchestrate services | Separation of concerns |
| **Validate always** | Every input validated with Zod | Security |
| **Authenticate first** | Authentication before any operation | Security |
| **Authorize second** | Authorization after authentication | Security |
| **Return standard responses** | Use `success()` and `error()` helpers | Consistency |
| **Log errors** | Use Pino logger for all errors | Debugging |
| **No console.log** | Use structured logging only | Production quality |

### 3.4 Lib Module Structure

```
api/_lib/
├── auth/
│   ├── middleware.ts                 # authenticate(), authorize()
│   ├── session.ts                   # Session CRUD operations
│   ├── supabase.ts                  # Supabase client configuration
│   └── tokens.ts                    # Token generation and hashing
│
├── validation/
│   ├── schemas.ts                   # Shared Zod schemas
│   └── middleware.ts                # Request validation middleware
│
├── security/
│   ├── csrf.ts                      # CSRF token generation/validation
│   ├── rate-limit.ts                # Rate limiting with KV
│   ├── turnstile.ts                 # Turnstile CAPTCHA verification
│   ├── sanitize.ts                  # Input sanitization
│   └── headers.ts                   # Security headers
│
├── database/
│   ├── client.ts                    # Prisma client singleton
│   ├── transaction.ts               # Transaction helpers
│   └── connection.ts                # Hyperdrive connection pooling
│
├── email/
│   ├── client.ts                    # Resend client
│   ├── templates/                   # React Email templates
│   │   ├── order-confirmation.tsx
│   │   ├── password-reset.tsx
│   │   ├── email-verification.tsx
│   │   └── welcome.tsx
│   └── send.ts                      # Send email helpers
│
├── storage/
│   ├── cloudinary.ts                # Cloudinary service
│   └── upload.ts                    # Upload helpers
│
├── payments/
│   ├── razorpay.ts                  # Razorpay client
│   └── webhooks.ts                  # Webhook signature verification
│
├── cache/
│   ├── kv.ts                        # KV read/write helpers
│   └── strategies.ts                # Cache invalidation patterns
│
├── logging/
│   ├── logger.ts                    # Pino logger setup
│   └── audit.ts                     # Audit logging
│
├── response.ts                      # Standardized response helpers
├── errors.ts                        # Error class definitions
├── pagination.ts                    # Pagination helpers
├── env.ts                           # Environment variable validation
└── types.ts                         # Shared API types
```

### 3.5 Lib Module Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single responsibility** | One utility, one purpose | Easy to understand |
| **No handler imports** | Cannot import from _handlers/ | Prevents circular deps |
| **No business logic** | Utilities are infrastructure, not business | Separation |
| **No state** | Stateless utility functions | Testability |
| **Well-typed** | Full TypeScript types | Type safety |
| **Error handling** | Throw typed errors | Consistent error handling |

---

## 4. Database Architecture (`prisma/`)

### 4.1 Complete Database Directory

```
prisma/
├── schema.prisma                     # Database schema definition
├── migrations/                       # Database migrations
│   ├── 20240101000000_init/          # Migration folders
│   │   └── migration.sql             # SQL migration file
│   └── ...
│
└── seed/
    └── index.ts                      # Seed script
```

### 4.2 Schema Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **UUID v4 primary keys** | All tables use UUID v4 | Globally unique, no sequential leaks |
| **Timestamps on all** | `createdAt` + `updatedAt` on every table | Audit trail |
| **Soft delete** | `isActive` boolean (not `deletedAt`) | Simpler queries |
| **DECIMAL for money** | `DECIMAL(10,2)` for all currency | Exact precision |
| **Index foreign keys** | All FK columns indexed | Query performance |
| **Composite indexes** | Index common query patterns | Performance |
| **Unique constraints** | Slugs, SKUs, order numbers, emails | Data integrity |

### 4.3 Migration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One migration per change** | Each migration does one thing | Easy to rollback |
| **Never modify deployed migrations** | Create new migration instead | Data safety |
| **Test locally first** | Run on dev database before production | Prevent issues |
| **Backward compatible** | New columns nullable or have defaults | Zero-downtime deploys |
| **Seed after migration** | Seed script runs after migration | Consistent test data |

---

## 5. Testing Architecture (`e2e/`)

### 5.1 Complete Testing Directory

```
e2e/
├── auth.setup.ts                     # Auth setup for E2E tests
│
├── fixtures/                         # Test fixtures and mock data
│   ├── users.ts                      # Test user data
│   ├── products.ts                   # Test product data
│   └── orders.ts                     # Test order data
│
└── specs/                            # E2E test specifications
    ├── auth.spec.ts                  # Authentication tests
    ├── products.spec.ts              # Product browsing tests
    ├── cart.spec.ts                  # Cart functionality tests
    ├── checkout.spec.ts              # Checkout flow tests
    ├── orders.spec.ts                # Order management tests
    ├── search.spec.ts                # Search functionality tests
    └── admin.spec.ts                 # Admin panel tests
```

### 5.2 Testing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Critical paths** | Auth, payments, checkout: 100% coverage | Revenue-critical |
| **Deterministic** | All tests must be reliable | Trust in test suite |
| **Fast feedback** | Unit tests < 100ms, E2E < 5min | Developer productivity |
| **CI enforced** | Tests must pass before merge | Quality gate |
| **No flaky tests** | Fix or remove unreliable tests | Maintain trust |

---

## 6. Public Assets (`public/`)

### 6.1 Complete Public Directory

```
public/
├── _headers                          # Cloudflare Pages headers
├── _redirects                        # Cloudflare Pages redirects
├── favicon.svg                       # Browser tab icon
├── og-image.svg                      # Social media share image
├── robots.txt                        # Search engine crawling rules
└── site.webmanifest                  # PWA manifest
```

### 6.2 Public Asset Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Static only** | No dynamic content | Served as-is |
| **Optimized** | Compressed images | Performance |
| **Favicon** | SVG format | Scalable |
| **OG image** | 1200x630px | Social media |
| **Web manifest** | PWA-ready | Future-proof |

---

## 7. CI/CD Architecture (`.github/`)

### 7.1 Complete CI/CD Directory

```
.github/
└── workflows/
    └── ci.yml                        # GitHub Actions pipeline
```

### 7.2 CI/CD Pipeline Stages

```yaml
# Stage 1: Lint
- ESLint on all .ts/.tsx files
- TypeScript type checking
- Prettier formatting check

# Stage 2: Test
- Vitest unit/integration tests
- Playwright E2E tests

# Stage 3: Build
- Vite production build
- Bundle size analysis

# Stage 4: Deploy
- Preview deployment (PRs)
- Staging deployment (develop branch)
- Production deployment (main branch)
```

### 7.3 Environment Configuration

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| **Development** | `feature/*` | localhost:5173 | Local development |
| **Preview** | PR branches | `*.nabome.pages.dev` | PR review |
| **Staging** | `develop` | staging.nabome.online | Pre-production |
| **Production** | `main` | nabome.online | Live site |

---

## 8. Configuration Files

### 8.1 Configuration File Responsibilities

| File | Purpose | Owner |
|------|---------|-------|
| `package.json` | Dependencies, scripts, project metadata | DevOps |
| `pnpm-lock.yaml` | Locked dependency versions | DevOps |
| `tsconfig.json` | TypeScript compiler options | DevOps |
| `vite.config.ts` | Vite build configuration | DevOps |
| `vitest.config.ts` | Vitest test configuration | DevOps |
| `playwright.config.ts` | Playwright E2E configuration | DevOps |
| `eslint.config.ts` | ESLint linting rules | DevOps |
| `postcss.config.js` | PostCSS plugin configuration | DevOps |
| `tailwind.config.ts` | Tailwind CSS configuration | DevOps |
| `wrangler.jsonc` | Cloudflare Pages configuration | DevOps |
| `.env.example` | Environment variable template | DevOps |
| `.gitignore` | Git ignore patterns | DevOps |
| `.node-version` | Node.js version pinning | DevOps |

### 8.2 Configuration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Version control** | All configs in git | Reproducible builds |
| **No secrets** | Use `.env.example` with placeholders | Security |
| **Consistent** | Same configs across environments | Predictability |
| **Documented** | Comment non-obvious settings | Maintainability |

---

## 9. Naming Conventions

### 9.1 Artifact Naming Rules

| Artifact | Convention | Example | Rationale |
|----------|-----------|---------|-----------|
| **Components** | PascalCase | `ProductCard`, `CartItem` | React convention |
| **Hooks** | camelCase with `use` prefix | `useCart`, `useProducts` | React convention |
| **Utilities** | camelCase | `formatPrice`, `cn` | JavaScript convention |
| **Types/Interfaces** | PascalCase | `Product`, `CartItem`, `OrderStatus` | TypeScript convention |
| **Enums** | PascalCase | `OrderStatus`, `PaymentStatus` | TypeScript convention |
| **Constants** | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_CART_ITEMS` | JavaScript convention |
| **Files (components)** | PascalCase | `ProductCard.tsx` | Matches component name |
| **Files (hooks)** | camelCase with `use` | `useCart.ts` | Matches hook name |
| **Files (utilities)** | camelCase | `format.ts` | Matches function name |
| **Files (types)** | camelCase | `product.ts` | Matches type namespace |
| **Files (API handlers)** | kebab-case | `create-order.ts` | URL-friendly |
| **Folders (features)** | plural | `products/`, `orders/` | Contains multiple items |
| **Folders (utilities)** | singular | `utils/`, `hooks/` | Contains utility functions |
| **Database tables** | snake_case | `product_variants`, `order_items` | PostgreSQL convention |
| **Database columns** | camelCase | `createdAt`, `profileId` | Prisma convention |
| **API endpoints** | kebab-case | `/api/products`, `/api/cart-items` | RESTful convention |
| **CSS classes** | Tailwind utilities | `bg-brand-500`, `text-neutral-700` | Tailwind convention |

### 9.2 Prefix/Suffix Rules

| Pattern | Prefix/Suffix | Example | When to Use |
|---------|--------------|---------|-------------|
| **React hooks** | `use` prefix | `useCart`, `useAuth` | All custom hooks |
| **API handlers** | None | `addToCart`, `getProducts` | All API functions |
| **Validators** | None | `productSchema`, `cartSchema` | All Zod schemas |
| **Store slices** | `-store` suffix | `auth-store.ts`, `cart-store.ts` | All Zustand stores |
| **Error classes** | `App` prefix | `AppError`, `ValidationError` | All custom errors |
| **Type files** | None | `product.ts`, `order.ts` | All type definition files |

### 9.3 Naming Anti-Patterns

```typescript
// ✗ WRONG: Abbreviations
const fn = (x: number) => x * 2;
const usr = await getUser();

// ✓ CORRECT: Full names
const double = (value: number) => value * 2;
const user = await getUser();

// ✗ WRONG: Boolean naming
const isActive = true; // What is active?

// ✓ CORRECT: Question-style booleans
const isProductActive = true;
const hasItemsInCart = true;

// ✗ WRONG: Generic names
const data = await fetchData();
const result = await processResult();

// ✓ CORRECT: Descriptive names
const products = await fetchProducts();
const order = await createOrder();
```

---

## 10. Import & Export Conventions

### 10.1 Import Rules

```typescript
// ✓ CORRECT: Direct imports with path aliases
import { Button } from '@/shared/ui/Button';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatPrice } from '@/lib/utils/format';

// ✗ WRONG: Barrel file imports
import { Button, Input, Card } from '@/shared/ui'; // Tree-shaking issues!

// ✗ WRONG: Relative imports outside feature
import { useCart } from '../../features/cart/hooks/useCart'; // Hard to maintain

// ✓ CORRECT: Always use path aliases
import { useCart } from '@/features/cart/hooks/useCart';
```

### 10.2 Import Order

```typescript
// 1. External packages
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// 2. Internal shared utilities
import { cn } from '@/lib/utils/cn';
import { formatPrice } from '@/lib/utils/format';
import { Button } from '@/shared/ui/Button';

// 3. Feature-specific imports
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuth } from '@/features/auth/hooks/useAuth';

// 4. Type imports (last)
import type { Product } from '@/types/product';
import type { CartItem } from '@/features/cart/types';
```

### 10.3 Export Rules

```typescript
// ✓ CORRECT: Named exports only
export { Button, type ButtonProps };

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

// ✗ WRONG: Default exports
export default function Button() { ... }
export default formatPrice;
```

### 10.4 Barrel File Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Only one barrel file** | `src/shared/ui/index.ts` only | Tree-shaking |
| **No feature barrel files** | Direct imports in features | Prevents circular deps |
| **No lib barrel files** | Direct imports in lib | Prevents circular deps |
| **UI barrel file** | Export all UI primitives | Convenient imports |

---

## 11. Module Boundaries & Dependency Rules

### 11.1 Frontend Dependency Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEPENDENCY FLOW                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    app/ (Shell)                           │   │
│  │  Routes, Providers, Entry Point                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 features/ (Features)                      │   │
│  │  auth | products | cart | checkout | orders | ...         │   │
│  │                                                           │   │
│  │  Features MAY import from:                               │   │
│  │    ✓ shared/ (always allowed)                            │   │
│  │    ✓ lib/ (always allowed)                               │   │
│  │    ✓ stores/ (always allowed)                            │   │
│  │    ✓ types/ (always allowed)                             │   │
│  │    ✗ Other features (NEVER allowed)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   shared/ (Foundation)                    │   │
│  │  ui/ | layout/ | auth/ | feedback/                        │   │
│  │                                                           │   │
│  │  shared/ MAY import from:                                │   │
│  │    ✓ lib/ (always allowed)                               │   │
│  │    ✓ types/ (always allowed)                             │   │
│  │    ✗ features/ (NEVER allowed)                           │   │
│  │    ✗ stores/ (NEVER allowed)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    lib/ (Utilities)                        │   │
│  │  api/ | utils/ | hooks/ | validators/ | config            │   │
│  │                                                           │   │
│  │  lib/ MAY import from:                                   │   │
│  │    ✓ types/ (always allowed)                             │   │
│  │    ✗ features/ (NEVER allowed)                           │   │
│  │    ✗ shared/ (NEVER allowed)                             │   │
│  │    ✗ stores/ (NEVER allowed)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              types/ (Foundation Types)                     │   │
│  │  Pure type definitions, no runtime code                   │   │
│  │                                                           │   │
│  │  types/ MAY import from:                                 │   │
│  │    ✗ Nothing (leaf node)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 Allowed Imports Matrix (Frontend)

| Module | app/ | features/ | shared/ | lib/ | stores/ | types/ |
|--------|------|-----------|---------|------|---------|--------|
| **app/** | — | ✓ (routes) | ✓ | ✓ | ✓ | ✓ |
| **features/** | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **shared/** | ✗ | ✗ | — | ✓ | ✗ | ✓ |
| **lib/** | ✗ | ✗ | ✗ | — | ✗ | ✓ |
| **stores/** | ✗ | ✗ | ✗ | ✓ | — | ✓ |
| **types/** | ✗ | ✗ | ✗ | ✗ | ✗ | — |

### 11.3 Backend Dependency Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    API DEPENDENCY FLOW                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              _handlers/ (Domain Handlers)                 │   │
│  │  auth/ | products/ | cart/ | checkout/ | orders/ | ...    │   │
│  │                                                           │   │
│  │  Handlers MAY import from:                               │   │
│  │    ✓ _lib/ (always allowed)                              │   │
│  │    ✗ Other handler domains (NEVER allowed)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              _lib/ (Shared Utilities)                     │   │
│  │  auth/ | validation/ | security/ | database/ | email/     │   │
│  │  storage/ | payments/ | cache/ | logging/                 │   │
│  │                                                           │   │
│  │  _lib/ MAY import from:                                  │   │
│  │    ✓ Other _lib/ modules (carefully)                     │   │
│  │    ✗ _handlers/ (NEVER allowed)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 11.4 Allowed Imports Matrix (Backend)

| Module | _handlers/ | _lib/ | External Services |
|--------|------------|-------|-------------------|
| **_handlers/** | ✗ | ✓ | ✗ |
| **_lib/** | ✗ | ✓ (carefully) | ✓ |

### 11.5 Breaking Boundaries

If you find yourself needing to import across boundaries:

1. **Feature → Feature:** Extract shared logic into `lib/` or `shared/`
2. **Shared → Feature:** Move the component into `shared/` and refactor dependencies
3. **Lib → Feature:** Move the utility to `types/` or refactor the feature
4. **Handler → Handler:** Extract shared logic into `_lib/`

### 11.6 Circular Dependency Prevention

```typescript
// ✗ WRONG: Circular dependency
// features/cart/hooks/useCart.ts
import { useAuth } from '@/features/auth/hooks/useAuth';
// features/auth/hooks/useAuth.ts
import { useCart } from '@/features/cart/hooks/useCart'; // CIRCULAR!

// ✓ CORRECT: Extract shared logic
// lib/hooks/useCurrentUser.ts
import { useAuthStore } from '@/stores/auth-store';
export function useCurrentUser() {
  return useAuthStore((state) => state.user);
}

// features/cart/hooks/useCart.ts
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
// features/auth/hooks/useAuth.ts
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
```

---

## 12. File Organization Rules

### 12.1 Maximum File Lengths

| File Type | Max Lines | Rationale |
|-----------|-----------|-----------|
| **Components** | 300 lines | Readability |
| **API handlers** | 150 lines | Focus |
| **Hooks** | 200 lines | Readability |
| **Utilities** | 150 lines | Simplicity |
| **Types** | 500 lines | Type definitions can be large |
| **Tests** | 500 lines | Comprehensive testing |

### 12.2 File Splitting Rules

| Trigger | Action | Example |
|---------|--------|---------|
| **File > 300 lines** | Split into multiple files | `CheckoutPage.tsx` → `CheckoutLayout.tsx`, `ShippingStep.tsx`, `PaymentStep.tsx` |
| **Handler > 150 lines** | Split by action | `auth.ts` → `auth/register.ts`, `auth/login.ts`, etc. |
| **Component with many variants** | Split by variant | `Button.tsx` with 6 variants → still one file (variants are small) |
| **Complex business logic** | Extract to service | Move logic from handler to `_lib/` service |

### 12.3 File Naming Patterns

| Pattern | Example | Usage |
|---------|---------|-------|
| **Component** | `ProductCard.tsx` | React components |
| **Hook** | `useCart.ts` | Custom React hooks |
| **Utility** | `format.ts` | Utility functions |
| **Type** | `product.ts` | Type definitions |
| **API handler** | `create-order.ts` | API endpoint handlers |
| **Service** | `email.ts` | Backend services |
| **Store** | `auth-store.ts` | Zustand stores |
| **Validator** | `auth.ts` | Zod schemas |
| **Config** | `config.ts` | Configuration files |
| **Constant** | `constants.ts` | Constant values |

### 12.4 Folder Naming Rules

| Folder Type | Convention | Example | Rationale |
|-------------|-----------|---------|-----------|
| **Feature folders** | Plural | `products/`, `orders/` | Contains multiple items |
| **Utility folders** | Singular | `utils/`, `hooks/` | Contains utility functions |
| **Component folders** | Plural | `components/` | Contains multiple components |
| **API folders** | Singular | `api/` | Contains API functions |
| **Store folders** | Singular | `store/` | Contains store definition |
| **Type folders** | Plural | `types/` | Contains multiple types |

---

## 13. Naming Standards Reference

### 13.1 Complete Naming Matrix

| Category | Item | Convention | Example |
|----------|------|-----------|---------|
| **React** | Component | PascalCase | `ProductCard` |
| **React** | Hook | camelCase + `use` | `useCart` |
| **React** | Context | PascalCase + `Provider` | `AuthProvider` |
| **TypeScript** | Interface | PascalCase | `Product` |
| **TypeScript** | Type alias | PascalCase | `OrderStatus` |
| **TypeScript** | Enum | PascalCase | `PaymentStatus` |
| **TypeScript** | Function | camelCase | `formatPrice` |
| **TypeScript** | Variable | camelCase | `isLoading` |
| **TypeScript** | Constant | SCREAMING_SNAKE_CASE | `API_BASE_URL` |
| **Database** | Table | snake_case | `product_variants` |
| **Database** | Column | camelCase | `createdAt` |
| **Database** | Index | snake_case | `idx_products_active` |
| **API** | Endpoint | kebab-case | `/api/cart-items` |
| **API** | Query param | camelCase | `?pageSize=20` |
| **CSS** | Class | Tailwind utilities | `bg-brand-500` |
| **Files** | Component | PascalCase | `ProductCard.tsx` |
| **Files** | Hook | camelCase + `use` | `useCart.ts` |
| **Files** | Utility | camelCase | `format.ts` |
| **Files** | Type | camelCase | `product.ts` |
| **Files** | Handler | kebab-case | `create-order.ts` |
| **Files** | Store | kebab-case + `-store` | `auth-store.ts` |
| **Folders** | Feature | Plural | `products/` |
| **Folders** | Utility | Singular | `utils/` |

### 13.2 Boolean Naming

| Pattern | Example | Usage |
|---------|---------|-------|
| **is** prefix | `isActive`, `isLoading` | State flags |
| **has** prefix | `hasItems`, `hasPermission` | Existence checks |
| **can** prefix | `canEdit`, `canDelete` | Permission checks |
| **should** prefix | `shouldRedirect`, `shouldRefresh` | Decision flags |

### 13.3 Function Naming

| Pattern | Example | Usage |
|---------|---------|-------|
| **get** prefix | `getProduct`, `getUser` | Fetch data |
| **set** prefix | `setTheme`, `setFilter` | Set state |
| **add** prefix | `addToCart`, `addAddress` | Create new |
| **remove** prefix | `removeFromCart`, `removeAddress` | Delete |
| **update** prefix | `updateProfile`, `updateQuantity` | Modify |
| **create** prefix | `createOrder`, `createAccount` | Create new |
| **delete** prefix | `deleteProduct`, `deleteComment` | Remove |
| **fetch** prefix | `fetchProducts`, `fetchOrders` | Async fetch |
| **use** prefix | `useCart`, `useAuth` | React hooks |
| **format** prefix | `formatPrice`, `formatDate` | Transform data |
| **validate** prefix | `validateEmail`, `validatePassword` | Check validity |

---

## Summary

This document defines the complete folder architecture and organizational blueprint for the নবME Commerce Operating System. Every AI agent working on this codebase must follow these standards without exception.

**Key Principles:**

1. **Feature-first:** Code organized by feature, not technical layer
2. **Self-contained:** Each feature has everything it needs
3. **No coupling:** Features cannot import from each other
4. **Clear boundaries:** Explicit rules for what can import what
5. **Consistent naming:** Predictable names for all artifacts
6. **Clean structure:** No dumping grounds, no misc folders
7. **One responsibility:** Every folder and file has one clear purpose
8. **Scalable:** Adding new features never touches existing code

**This document is the single source of truth for folder organization.**

---

*Last updated: August 03, 2026*
