# নবME (NABOME) — Complete Project Documentation

> **Generated:** 2026-07-13  
> **Source:** Full codebase analysis  
> **Version:** 1.0.0  
> **Live Site:** [https://www.nabome.online](https://www.nabome.online)

---

## Table of Contents

- [1. Executive Overview](#1-executive-overview)
- [2. Complete Folder Structure](#2-complete-folder-structure)
- [3. Important Files](#3-important-files)
- [4. Technology Stack](#4-technology-stack)
- [5. Complete System Architecture](#5-complete-system-architecture)
- [6. Data Flow](#6-data-flow)
- [7. Authentication System](#7-authentication-system)
- [8. Authorization](#8-authorization)
- [9. User Journey](#9-user-journey)
- [10. Complete Pages Documentation](#10-complete-pages-documentation)
- [11. Components Documentation](#11-components-documentation)
- [12. Hooks Documentation](#12-hooks-documentation)
- [13. Context Providers](#13-context-providers)
- [14. Services](#14-services)
- [15. API Documentation](#15-api-documentation)
- [16. Database Architecture](#16-database-architecture)
- [17. Storage System](#17-storage-system)
- [18. Search System](#18-search-system)
- [19. Product Management](#19-product-management)
- [20. Order System](#20-order-system)
- [21. Seller Dashboard](#21-seller-dashboard)
- [22. Admin Dashboard](#22-admin-dashboard)
- [23. Media Library](#23-media-library)
- [24. Navigation](#24-navigation)
- [25. Mobile Experience](#25-mobile-experience)
- [26. Desktop Experience](#26-desktop-experience)
- [27. Responsive Design System](#27-responsive-design-system)
- [28. UI Design System](#28-ui-design-system)
- [29. State Management](#29-state-management)
- [30. Error Handling](#30-error-handling)
- [31. Security Architecture](#31-security-architecture)
- [32. Performance](#32-performance)
- [33. SEO](#33-seo)
- [34. Deployment Architecture](#34-deployment-architecture)
- [35. Environment Variables](#35-environment-variables)
- [36. Third-Party Integrations](#36-third-party-integrations)
- [37. Configuration Files](#37-configuration-files)
- [38. Dependency Analysis](#38-dependency-analysis)
- [39. Project Statistics](#39-project-statistics)
- [40. User Feature Matrix](#40-user-feature-matrix)
- [41. Component Relationship Diagram](#41-component-relationship-diagram)
- [42. Application Flow Diagrams](#42-application-flow-diagrams)
- [43. Current Limitations](#43-current-limitations)
- [44. Future Expansion Opportunities](#44-future-expansion-opportunities)
- [45. Glossary](#45-glossary)
- [46. Appendix](#46-appendix)

---

## 1. Executive Overview

### Project Name
**নবME (NABOME)** — Premium Fashion E-Commerce Platform

### Purpose
A premium direct-to-consumer (D2C) fashion e-commerce storefront with a comprehensive admin backend. The platform enables browsing and purchasing premium fashion products with features like product management, order processing, media management, CMS, analytics, and full administrative control.

### Vision
To create a luxury fashion destination that celebrates the intersection of traditional craftsmanship and contemporary design. The Bengali name "নবME" (Nabome) combines "নব" (new) with "ME" — representing a new self, new identity through fashion.

### Business Model
Single-brand D2C (Direct-to-Consumer) e-commerce platform. **Not a marketplace** — there is zero multi-vendor/seller infrastructure. Products are managed and sold directly by the platform owner.

### Marketplace Type
Not applicable — this is a single-brand retail platform, not a marketplace.

### Current Implementation Status
- **Overall Progress:** All 9 audit phases complete
- **Production Readiness:** **NOT READY FOR PRODUCTION** (scored 3.8/10)
- **Production Blockers (P0):** 6 critical issues remain (13.6s TTFB, zero observability, secrets in git, no Hyperdrive, HSTS misconfigured, CSRF dead code)
- **Total Technical Debt:** 69 issues across P0-P3, estimated 15-22 days of work

### Production Readiness Summary
| Domain | Score | Status |
|--------|:-----:|:------:|
| Production Readiness | 3.8/10 | ❌ Not Ready |
| Cloudflare Infrastructure | 4.5/10 | ⚠️ Poor |
| Performance | 2.5/10 | ❌ Critical |
| SEO | 6.0/10 | ⚠️ Needs Work |
| Security | 4.2/10 | ❌ Poor |
| Customer Journey | 6.8/10 | ⚠️ Fair |
| Admin Workflow | 5.8/10 | ⚠️ Fair |
| Design System | 6.8/10 | ⚠️ Fair |

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│          (React SPA + Service Worker)                │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│           Cloudflare Pages (CDN + Edge)              │
│  ┌──────────────────────────────────────────────┐   │
│  │         Functions Middleware (SEO)            │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │       API Catch-All Router [...path].ts       │   │
│  │     ┌─────────────────────────────────┐      │   │
│  │     │   Auth Middleware (JWT/CSRF)    │      │   │
│  │     └─────────────────────────────────┘      │   │
│  │     ┌─────────────────────────────────┐      │   │
│  │     │    Handler Modules (62 files)    │      │   │
│  │     └─────────────────────────────────┘      │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────┘
                     │
    ┌────────────────┼────────────────┬────────────────┐
    │                │                │                │
┌───▼────┐   ┌──────▼──────┐  ┌─────▼─────┐   ┌─────▼─────┐
│Neon DB │   │Supabase Auth│  │ Cloudinary│   │  Resend   │
│Postgres│   │   (JWT)     │  │  Media    │   │  Email    │
└────────┘   └─────────────┘  └───────────┘   └───────────┘
    │                                            ┌─────────┐
    └────── R2 / KV / Hyperdrive ───────────────┤Razorpay │
                                                 │Payments │
                                                 └─────────┘
```

### Technology Summary
| Layer | Technology | Version |
|-------|-----------|:-------:|
| Frontend Framework | React | 19.1.0 |
| Routing | React Router | 7.5.0 |
| Styling | Tailwind CSS | 3.4.17 |
| State Management | Zustand + TanStack Query | 5.0.3 / 5.75.5 |
| Build Tool | Vite | 6.3.2 |
| Backend Runtime | Cloudflare Pages Functions | Edge |
| Database | PostgreSQL (Neon Serverless) | - |
| ORM | Prisma | 6.6.0 |
| Auth | Supabase Auth | 2.49.1 |
| Payments | Razorpay | - |
| Email | Resend | - |
| Media CDN | Cloudinary | - |
| Deployment | Cloudflare Pages | - |
| Language | TypeScript | 5.8.3 |
| Testing | Vitest + Playwright | - |

---

## 2. Complete Folder Structure

```
nabome/
├── .env.example              # Environment variable template
├── .github/                  # GitHub Actions workflows
├── .opencode/                # OpenCode configuration
├── .vscode/                  # VS Code settings
├── .wrangler/                # Wrangler cache
├── .tsbuild/                 # TypeScript build cache
├── api/                      # Cloudflare Pages Functions (Backend API)
│   ├── [...path].ts          # API catch-all router (665+ lines)
│   ├── health.ts             # Health check endpoint
│   ├── robots.txt.ts         # Robots.txt generator
│   ├── sitemap.xml.ts        # Sitemap generator
│   ├── _handlers/            # API handler modules (34 files)
│   │   ├── admin/            # Admin-specific handlers (33+ files)
│   │   └── __tests__/        # Handler tests
│   └── _lib/                 # Shared API utilities (44 files)
│       ├── media/            # Media management services (15 files)
│       └── __tests__/        # Library tests
├── dist/                     # Production build output
├── docs/                     # Documentation files
├── e2e/                      # End-to-end tests
├── functions/                # Cloudflare Pages Functions (Edge)
│   ├── _middleware.ts         # SEO middleware (610 lines)
│   └── api/                  # API proxy functions
├── node_modules/             # Dependencies
├── playwright/               # Playwright test utilities
├── prisma/                   # Database layer
│   ├── schema.prisma         # Prisma schema (34 models, 1417 lines)
│   ├── schema.prisma.bak     # Backup
│   ├── schema.prisma.bak2    # Backup
│   ├── migrations/           # Database migrations (11 files)
│   └── seed/                 # Seed data
│       ├── index.ts          # Main seed script
│       ├── categories.ts     # Category seeds
│       ├── labels.ts         # Product label seeds
│       ├── cms.ts            # CMS seeds
│       └── marketing/        # Marketing content seeds
├── public/                   # Static assets
│   ├── _headers              # Security & cache headers (generated)
│   ├── _redirects            # URL redirects
│   ├── .well-known/          # Security.txt, etc.
│   ├── favicon.svg
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── og-image.svg          # Open Graph default image
│   ├── placeholder.svg
│   ├── robots.txt
│   ├── security.txt
│   ├── site.webmanifest      # PWA manifest
│   └── sw.js                 # Service Worker
├── scripts/                  # Utility scripts (25 files)
├── src/                      # Frontend source code
│   ├── admin/                # Admin dashboard (39 directories)
│   ├── app/                  # App entry point
│   │   ├── App.tsx           # Root React component
│   │   ├── main.tsx          # Entry point
│   │   └── routes.tsx         # Route definitions
│   ├── cms/                  # CMS core
│   │   └── core/             # CMS types, registry, etc.
│   ├── components/           # Shared components
│   │   ├── auth/             # Auth guard components
│   │   ├── ui/               # UI primitives (16 components)
│   │   └── __tests__/        # Component tests
│   ├── hooks/                # Custom hooks (11 files)
│   ├── lib/                  # Shared utilities
│   │   ├── api/              # API client & services
│   │   │   └── admin/        # Admin API services
│   │   ├── media/            # Media management (frontend)
│   │   ├── razorpay/         # Razorpay integration
│   │   ├── security/         # Client-side security
│   │   └── __tests__/        # Utility tests
│   ├── pages/                # Auth pages (7 files)
│   ├── storefront/           # Storefront module
│   │   ├── components/       # Storefront components (27 files)
│   │   ├── hooks/            # Storefront hooks (13 files)
│   │   ├── layout/           # Layout components (7 files)
│   │   ├── lib/              # Storefront utilities
│   │   ├── pages/            # Storefront pages (23 files)
│   │   ├── sections/         # CMS sections (14 files)
│   │   ├── store/            # Zustand stores
│   │   └── stores/           # Zustand stores
│   ├── stores/               # Global stores
│   ├── styles/               # Global styles
│   │   └── globals.css       # 544 lines of CSS
│   └── types/                # TypeScript type definitions (9 files)
├── .env                      # Local environment variables
├── .gitignore
├── eslint.config.js          # ESLint flat config
├── index.html                # HTML entry point
├── package.json              # Dependencies & scripts
├── package-lock.json
├── playwright.config.ts      # Playwright config
├── postcss.config.js         # PostCSS config
├── tailwind.config.ts        # Tailwind design system (183 lines)
├── tsconfig.json             # TypeScript root config
├── tsconfig.api.json         # API TypeScript config
├── tsconfig.app.json         # App TypeScript config
├── tsconfig.node.json        # Node TypeScript config
├── vite.config.ts            # Vite build config (62 lines)
├── vitest.config.ts          # Vitest config
├── wrangler.jsonc            # Cloudflare Pages config
└── Nabome.md                 # This document
```

## 3. Important Files

### `package.json` (`/`)
- **Purpose:** Project manifest, dependencies, scripts
- **Key Scripts:** `dev`, `build`, `pages:build`, `test`, `test:e2e`, `prisma:*`, `api:dev`, `typecheck`, `lint`
- **Dependencies:** 25 production + 31 dev (56 total)
- **Build Pipeline:** `sync:headers → prisma:generate → typecheck → vite build`

### `vite.config.ts` (`/`)
- **Purpose:** Vite build configuration
- **Key Features:** React plugin, path alias `@/`, dev server proxy to local API (port 8788), CSS minification via LightningCSS, custom plugin to filter admin modulepreload, chunk naming strategy
- **Critical Note:** React 19 requires Rollup to determine chunking — manual React vendor chunk splits cause `Cannot set properties of undefined (setting 'Activity')` errors

### `wrangler.jsonc` (`/`)
- **Purpose:** Cloudflare Pages + Functions configuration
- **Bindings:** Hyperdrive (Neon DB), 3 KV namespaces (rate limiting, feature flags, cache)
- **Config:** Smart placement, nodejs_compat flag, Pages build output to `dist/`

### `tailwind.config.ts` (`/`)
- **Purpose:** Design system tokens (183 lines)
- **Includes:** Luxury color palette (brand, accent, luxe), typography system (4 font families, 12 font sizes), custom spacing, box shadows (6 levels), animation system (10 keyframes), transition timing, background gradients

### `index.html` (`/`)
- **Purpose:** HTML entry point for the SPA
- **Features:** Google Fonts preconnect (Manrope, Cormorant Garamond, Noto Serif Bengali), Cloudinary preconnect, Supabase DNS prefetch, theme color #8b6940, PWA manifest link, viewport-fit=cover for notch devices

### `api/[...path].ts` (`/api/`)
- **Purpose:** API catch-all router (665+ lines)
- **Imports:** All 34+ handler modules, all utility libraries
- **Mechanism:** String-based action dispatch — routes registered via `route(method, pattern, handler, options)` and matched at runtime
- **Features:** CORS handling, security headers, CSRF cookie + validation, Turnstile verification, rate limiting, OpenAPI docs generation

### `api/_lib/auth-middleware.ts` (`/api/_lib/`)
- **Purpose:** Authentication and authorization middleware (266 lines)
- **Mechanism:** JWT verification from httpOnly cookies, Supabase Admin SDK integration, Prisma session lookup with token hashing, role-based access control, CSRF validation
- **Key Feature:** Token hashing with SHA-256 for stored tokens, backward compatibility for pre-hashing sessions

### `functions/_middleware.ts` (`/functions/`)
- **Purpose:** SEO middleware at Cloudflare Edge (610 lines)
- **Features:** Dynamic SEO metadata injection, Open Graph tags, Twitter cards, canonical URLs, structured data (JSON-LD), pagination prev/next, SPA fallback for 404s, per-instance in-memory cache (500 entries, 10s TTL)

### `prisma/schema.prisma` (`/prisma/`)
- **Purpose:** Complete database schema definition (1417 lines, 34 models)
- **Features:** 18 enums, 80+ indexes, foreign key constraints with cascade rules, snake_case naming with @map(), PostgreSQL extensions (pg_trgm, pgcrypto)

### `src/app/App.tsx` (`/src/app/`)
- **Purpose:** Root React component
- **Implements:** TanStack Query provider, BrowserRouter, Suspense with LoadingFallback, ErrorBoundary, Toaster, route definitions, AuthLoader, Google Analytics, CookieConsent, PWA Install Prompt

### `src/app/main.tsx` (`/src/app/`)
- **Purpose:** Application entry point
- **Features:** Service worker registration, StrictMode, HelmetProvider, ConnectivityProvider, robust error handling for mount failures

### `src/app/routes.tsx` (`/src/app/`)
- **Purpose:** Frontend route definitions (97 lines)
- **Routes:** 22 storefront routes, 7 auth routes, admin route wrapping AdminRoutes component
- **Lazy loading:** All pages use `React.lazy()` for code splitting

### `src/stores/auth-store.ts` (`/src/stores/`)
- **Purpose:** Zustand auth state management
- **State:** user, isAuthenticated, isAdmin, isLoading
- **Actions:** setAuth, setUser, setLoading, clearAuth

### `src/hooks/useAuth.ts` (`/src/hooks/`)
- **Purpose:** Auth hook with login/register/logout/refresh operations (229 lines)
- **Features:** Session restoration on mount, proactive refresh timer (30s), cart merge on login, forced logout listener, error state management

### `src/lib/api/client.ts` (`/src/lib/api/`)
- **Purpose:** Base HTTP API client (304 lines)
- **Features:** Automatic /api prefix, auth token injection from cookies, 401 interceptor with refresh+retry, CSRF token injection, timeout handling, offline detection

### `src/styles/globals.css` (`/src/styles/`)
- **Purpose:** Global CSS (544 lines)
- **Includes:** Tailwind directives, CSS custom properties (design tokens), base styles, component styles (custom scrollbar, focus ring, animations), utility classes

### `eslint.config.js` (root)
- **Purpose:** Flat config ESLint configuration with TypeScript ESLint

### `vitest.config.ts` (root)
- **Purpose:** Vitest configuration with jsdom, path aliases

### `playwright.config.ts` (root)
- **Purpose:** E2E test configuration with Playwright

---

## 4. Technology Stack

### Frontend

**React 19.1.0**
- **Why:** Latest stable React with concurrent features, automatic batching, improved hooks
- **Where:** Entire frontend — all components, pages, and layouts
- **How it interacts:** Renders the SPA, manages component tree, handles routing via React Router

**React Router 7.5.0**
- **Why:** Standard routing for React SPAs with nested routes, lazy loading, and navigation guards
- **Where:** All routes defined in `src/app/routes.tsx` and `src/admin/AdminRoutes.tsx`
- **Key Feature:** Lazy-loaded routes via `React.lazy()` for code splitting

**Tailwind CSS 3.4.17**
- **Why:** Utility-first CSS framework for rapid design system implementation
- **Where:** All components use Tailwind classes for styling
- **Design System:** Luxury color palette, custom font families, animation system, 6 shadow levels

**Zustand 5.0.3**
- **Why:** Lightweight state management without boilerplate, supports middleware
- **Where:** Auth store, cart store, UI store, connectivity store
- **Advantages:** Tiny bundle size, no providers needed, TypeScript-first

**TanStack React Query 5.75.5**
- **Why:** Server state management with caching, refetching, and optimistic updates
- **Where:** All API data fetching across storefront and admin
- **Configuration:** 5-minute stale time, 1 retry, no refetch on window focus

**Vite 6.3.2**
- **Why:** Fast development server with HMR, optimized production builds
- **Where:** Build tool for entire frontend
- **Features:** LightningCSS minification, esbuild minification, manual chunk configuration

**Framer Motion 12.9.2**
- **Why:** Declarative animations with gesture support
- **Where:** Page transitions, modal animations, hover effects, scroll animations

**Lucide React 0.510.0**
- **Why:** Consistent, tree-shakeable icon library
- **Where:** All icons across storefront and admin UI

**Zod 3.24.4**
- **Why:** Runtime validation with TypeScript inference
- **Where:** Forms, API validation (limited usage — only ~5 `validateBody()` calls vs 102 raw `req.json()` calls)

**i18next 26.3.4 + react-i18next 17.0.8**
- **Why:** Internationalization framework
- **Where:** i18n infrastructure exists but has limited adoption

**react-helmet-async 3.0.0**
- **Why:** Head management for SEO metadata
- **Where:** Used in HelmetProvider wrapper, meta tag management

### Backend

**Cloudflare Pages Functions**
- **Why:** Edge-compute serverless runtime, zero cold start with Smart Placement, no server management
- **Where:** All API handlers in `api/` directory
- **How:** JavaScript/TypeScript functions deployed at Cloudflare's edge network

**Prisma 6.6.0**
- **Why:** Type-safe ORM with auto-generated client, migration system, relation management
- **Where:** All database operations across 62 handler files
- **Advantages:** 200+ Prisma queries across codebase, zero raw SQL in production

**Neon Serverless PostgreSQL**
- **Why:** Serverless Postgres with connection pooling, auto-scaling to zero
- **Where:** Primary database for all data storage
- **Integration:** Via `@neondatabase/serverless` driver + Prisma adapter

**Supabase Auth 2.49.1**
- **Why:** Managed authentication service with JWT, user management, and admin APIs
- **Where:** Auth handler and auth middleware
- **Integration:** Service role key for admin operations, anon key for public operations

**Razorpay**
- **Why:** Indian payment gateway with UPI, cards, netbanking, and wallet support
- **Where:** Payments handler and frontend Razorpay integration
- **Features:** Order creation, payment verification, refunds, webhook processing

**Resend**
- **Why:** Modern email API with high deliverability
- **Where:** Email service in `api/_lib/email.ts`
- **Uses:** Transactional emails (verification, order confirmation, password reset, notifications)

**Cloudinary**
- **Why:** Cloud-based image and video CDN with transformations, optimization, and DAM
- **Where:** Media upload handler, frontend SafeImage component, SEO image generation
- **Features:** Auto format (f_auto), auto quality (q_auto), responsive srcset, image transformations

### Cloudflare Services

**Cloudflare Pages**
- **Why:** Static site hosting with global CDN, automatic HTTPS, integration with Workers
- **Where:** Hosts the built SPA and API functions
- **Configuration:** `wrangler.jsonc` with Pages build output, bindings, and compatibility settings

**Cloudflare Workers (via Pages Functions)**
- **Why:** Edge compute for API handlers
- **Where:** All backend API logic runs on Cloudflare Workers
- **Configuration:** Smart Placement for reduced latency

**Cloudflare KV**
- **Why:** Global key-value storage for rate limiting, feature flags, and caching
- **Where:** `RATE_LIMIT_STORE`, `FEATURE_FLAGS_KV`, `CACHE` bindings
- **3 Namespaces:** Rate limiting, feature flags, general cache

**Cloudflare Hyperdrive**
- **Why:** Accelerated database connections with connection pooling at the edge
- **Where:** Database connection binding `HYPERDRIVE` — configured but **not actively used**

---

## 5. Complete System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                       │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                        Browser (SPA)                             │      │
│  │                                                                   │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │      │
│  │  │  React   │  │  React   │  │  Zustand │  │   TanStack       │ │      │
│  │  │  Router  │  │ Helmet   │  │  Stores  │  │   React Query    │ │      │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │      │
│  │                                                                   │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │      │
│  │  │  Tailwind│  │  Framer  │  │  Lucide  │  │   Service        │ │      │
│  │  │  CSS     │  │  Motion  │  │  Icons   │  │   Worker (PWA)   │ │      │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────┬──────────────────────────────────────────────┘
                              │ HTTPS / API Calls
┌─────────────────────────────▼──────────────────────────────────────────────┐
│                      CLOUDFLARE EDGE LAYER                                  │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │                    Cloudflare Pages CDN                          │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │      │
│  │  │  Static      │  │  _headers    │  │  _redirects           │  │      │
│  │  │  Assets      │  │  (Security)  │  │  (URL Redirects)      │  │      │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │              Functions Layer (Edge Workers)                       │      │
│  │  ┌───────────────────────────────────────────────────────────┐   │      │
│  │  │           _middleware.ts (SEO Middleware)                  │   │      │
│  │  │  • SEO metadata injection (OG, Twitter, JSON-LD)         │   │      │
│  │  │  • Canonical URL + trailing slash redirects              │   │      │
│  │  │  • SPA 404 fallback → index.html                         │   │      │
│  │  │  • Per-instance in-memory cache (500 entries, 10s TTL)  │   │      │
│  │  └───────────────────────────────────────────────────────────┘   │      │
│  │  ┌───────────────────────────────────────────────────────────┐   │      │
│  │  │      [...path].ts (API Catch-All Router)                  │   │      │
│  │  │  • Route dispatch via pattern matching                   │   │      │
│  │  │  • CORS headers + Security headers                       │   │      │
│  │  │  • Rate limiting (KV-backed + in-memory fallback)        │   │      │
│  │  │  • CSRF double-submit cookie pattern                     │   │      │
│  │  │  • Turnstile bot protection                              │   │      │
│  │  └───────────────────────────────────────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└─────────────────────────────┬──────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────────────────┐
│                       API HANDLER LAYER                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │   Auth     │ │  Products  │ │   Orders   │ │   Cart     │ │ Checkout │ │
│  │  Handler   │ │  Handler   │ │  Handler   │ │  Handler   │ │ Handler  │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │
│  │  Payments  │ │  Upload    │ │  Search    │ │   CMS      │ │  Admin   │ │
│  │  Handler   │ │  Handler   │ │  Handler   │ │  Handler   │ │ Handlers │ │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘ └──────────┘ │
│                                                                             │
│                    ┌─────────────────────────────────────────┐             │
│                    │   Shared Library (api/_lib/, 44 files)   │             │
│                    └─────────────────────────────────────────┘             │
└─────────────────────────────┬──────────────────────────────────────────────┘
                              │
    ┌─────────────────────────┼─────────────────────────┬──────────────────┐
    │                         │                         │                  │
┌───▼──────────────┐  ┌──────▼──────┐  ┌──────────────┐ │  ┌──────────────┐│
│   Neon PostgreSQL │  │  Supabase  │  │  Cloudinary  │ │  │   Razorpay   ││
│   (Serverless DB)  │  │  Auth      │  │  Media CDN   │ │  │   Payments   ││
│  34 Models         │  │  JWT Mgmt  │  │  Images      │ │  └──────────────┘│
│  200+ Queries      │  └────────────┘  │  Videos      │ │  ┌──────────────┐│
│  80+ Indexes       │                  │  DAM/CDN     │ │  │  Resend      ││
└────────────────────┘                  └──────────────┘ │  │  Email       ││
                                                          │  └──────────────┘│
                                                          └──────────────────┘
```

### Request Lifecycle
```
1. User navigates to /products/silk-dress
2. Cloudflare Pages serves index.html (or 404 → SPA fallback)
3. functions/_middleware.ts intercepts:
   a. Queries DB for product SEO data
   b. Injects <title>, <meta>, <link>, JSON-LD tags
   c. Sets cache-control headers
   d. Returns modified HTML
4. Browser loads SPA (React bundles from /assets/)
5. React Router renders ProductDetailPage
6. Page fires API call: GET /api/products/silk-dress
7. Router matches route → dispatches to products handler
8. Auth middleware checks cookies
9. Prisma query fetches product data
10. Response returned to client
11. React Query caches the response
12. Page renders with Cloudinary-optimized images
```

---

## 6. Data Flow

### Registration Flow
```
1. User visits /auth/register
2. Fills form (email, password, firstName, lastName, phone)
3. Turnstile widget validates (bot check)
4. POST /api/auth/register with turnstileToken
5. Auth handler:
   a. Validates input
   b. Creates user in Supabase Auth
   c. Creates profile in Neon DB (profiles table)
   d. Generates verification token
   e. Sends verification email via Resend
   f. Sets access_token + refresh_token httpOnly cookies
   g. Sets csrf_token cookie
6. Returns user data + message
7. Frontend: AuthLoader calls /api/auth/me to hydrate store
```

### Login Flow
```
1. User visits /auth/login
2. Fills email + password
3. Turnstile validation
4. POST /api/auth/login
5. Auth handler:
   a. Validates credentials via Supabase
   b. Retrieves profile from database
   c. Creates auth_session record
   d. Sets access_token (15min) + refresh_token (30d) httpOnly cookies
   e. Sets csrf_token cookie
6. Returns user profile
7. Frontend: Zustand store updated via setAuth()
8. Guest cart merged with server cart
```

### Checkout Flow
```
1. User reviews cart
2. Optionally applies coupon (POST /api/coupons/validate)
3. POST /api/checkout
4. Checkout handler:
   a. Validates cart items (stock)
   b. Calculates subtotal, shipping, tax, discount
   c. Creates Razorpay order
   d. Creates order record + order_items
   e. Reserves stock
   f. Clears cart
5. Frontend: Razorpay checkout modal opens
6. User completes payment
7. POST /api/payments/verify:
   a. Verifies Razorpay signature
   b. Updates order: confirmed, paid
   c. Sends confirmation email
```

### Image Upload Flow
```
1. Admin selects file in Media Library
2. POST /api/admin/media/upload (multipart)
3. Upload handler:
   a. Validates file type (jpeg, png, webp, gif)
   b. Validates file size (max 5MB)
   c. Uploads to Cloudinary via fetch API
   d. Creates media_assets record in DB
4. Frontend: Media library refreshed
```

### Order Fulfillment Flow
```
1. Admin views order in /admin/orders/:id
2. Updates status: confirmed → processing → packed → shipped → delivered
3. PUT /api/admin/orders/:id/status
4. Status update recorded in order_status_history
5. Notification optionally sent to customer
6. Real-time tracking updates in customer dashboard
```

---

## 7. Authentication System

### Architecture Overview
- **Supabase Auth** for credential management
- **Custom session management** via Prisma `auth_sessions` table
- **JWT tokens** stored in httpOnly cookies
- **Double-submit CSRF cookie** pattern
- **Token hashing** (SHA-256) for stored session tokens

### Cookies Configuration
| Cookie | httpOnly | Secure | SameSite | Max-Age |
|--------|:-------:|:------:|:--------:|:-------:|
| access_token | Yes | Yes | Lax | 15 min |
| refresh_token | Yes | Yes | Strict | 30 days |
| csrf_token | No | Yes | Lax | 15 min |

### Registration
- Route: `POST /api/auth/register`
- Turnstile verification → Supabase signUp → Profile creation → Session → Email verification

### Verification
- Route: `POST /api/auth/verify-email`
- Validates token against stored verificationToken → Checks expiry → Marks emailVerified

### Login
- Route: `POST /api/auth/login`
- Turnstile → Supabase signInWithPassword → Profile lookup → Session → Cookies → Login logging

### Token Refresh
- Route: `POST /api/auth/refresh`
- Server reads refresh_token from cookie → Validates session → Issues new tokens → Rotates old session

### Logout
- Route: `POST /api/auth/logout`
- Session invalidated → Cookies cleared → Store cleared → Cart switched

### Auto-logout
- Forced via `auth:logout` custom event when refresh returns 401
- Proactive refresh every 30 seconds
- Session expiry checked per request

### Security Flow
```
Browser → Access Token Cookie → Middleware validates JWT → Session DB lookup
  → Role check → Proceed or 401
     If 401 → Clear cookies → Frontend redirects to login
```

---

## 8. Authorization

### Roles Defined
| Role | `UserRole` Enum | Description |
|------|:---------------:|-------------|
| Guest | (no account) | Unauthenticated visitor |
| Customer | `customer` | Registered user with account |
| Admin | `admin` | Full platform access |

**No Seller/Vendor role exists** — zero multi-vendor infrastructure.

### Guest
- **Permissions:** Browse products, view categories/collections, search, view product details
- **Restricted:** Cart (server-side syncing disabled), checkout, wishlist persistence, account pages, admin
- **API Access:** Public GET endpoints, auth endpoints (login, register, forgot-password)

### Customer
- **Permissions:** All guest + cart, checkout, orders, wishlist, reviews, account/address management
- **Restricted:** Admin routes and admin API endpoints
- **API Access:** All customer endpoints (cart, checkout, orders, addresses, wishlist, reviews, support, notifications)
- **Database Access:** Own data only (profileId-scoped queries)

### Admin
- **Permissions:** Full platform access including all admin modules
- **Admin Modules:** Dashboard, Products, Categories, Collections, Orders, Customers, CMS (pages, homepage, hero, footer, header), Media, SEO, Analytics, Settings, Coupons, Reviews, Newsletter, Contacts, Announcements, Import/Export, Search Index, Social Links, Support, FAQ, Notifications, Webhooks, Templates, Campaigns, Abandoned Carts, Auth Activity, Audit Log, Wishlists, Brands, Size Guides, Labels, Inventory, Lookbooks, Returns, Refunds
- **Database Access:** CRUD on all entities, audit logging for mutations

### Super Admin
**Not found in current codebase.** No super admin or elevated admin permissions are defined.

---

## 9. User Journey

### Guest Journey
1. **Landing** → HomePage (`/`) — hero carousel, featured products, CMS sections
2. **Browse** → ProductListingPage (`/products`) — grid with filters
3. **View Product** → ProductDetailPage (`/products/:slug`) — gallery, pricing, variants, reviews
4. **Search** → SearchOverlay (any page) — type-ahead suggestions
5. **Cart** → CartPage (`/cart`) — local storage cart items
6. **Attempt Checkout** → redirected to LoginPage

### Customer Journey
1. **Login** → LoginPage → Dashboard (`/account`)
2. **Complete Checkout** → CheckoutPage — address selection, coupon, Razorpay payment
3. **View Orders** → OrdersPage (`/account/orders`)
4. **Order Detail** → OrderDetailPage (`/account/orders/:id`)
5. **Manage Account** → SettingsPage (`/account/settings`)
6. **Manage Addresses** → AddressesPage (`/account/addresses`)
7. **Wishlist** → WishlistPage (`/account/wishlist`)
8. **Support** → SupportTicketsPage (`/account/support`)

### Admin Journey
1. **Login** → `/admin` — dashboard with stats
2. **Product Management** → `/admin/products` — CRUD, variants, images
3. **Order Management** → `/admin/orders` — list, detail, status updates
4. **CMS Management** → `/admin/cms/homepage` — drag & drop section builder
5. **Media Library** → `/admin/media` — upload, manage, organize
6. **Customer Management** → `/admin/customers`
7. **Analytics** → `/admin/analytics` — sales, product, customer data

---

## 10. Complete Pages Documentation

### Storefront Pages (22)
| # | Page | Route | Purpose | Auth |
|---|------|-------|---------|:----:|
| 1 | HomePage | `/` | Landing page | No |
| 2 | ProductListingPage | `/products` | Product grid with filters | No |
| 3 | ProductDetailPage | `/products/:slug` | Product detail | No |
| 4 | CartPage | `/cart` | Shopping cart | No |
| 5 | CheckoutPage | `/checkout` | Order checkout | Yes |
| 6 | SearchResultsPage | `/search` | Search results | No |
| 7 | WishlistPage | `/wishlist` | User's wishlist | Yes |
| 8 | CollectionsIndexPage | `/collections` | All collections | No |
| 9 | CollectionPage | `/collections/:slug` | Single collection | No |
| 10 | CategoryPage | `/categories/:slug` | Single category | No |
| 11 | LookbookPage | `/lookbooks` | All lookbooks | No |
| 12 | LookbookDetailPage | `/lookbooks/:slug` | Single lookbook | No |
| 13 | FaqPage | `/faq` | FAQ content | No |
| 14 | StaticPage | `/:slug` | Generic static page | No |

### Auth Pages (7)
| # | Page | Route | Purpose |
|---|------|-------|---------|
| 1 | LoginPage | `/auth/login` | Login form |
| 2 | RegisterPage | `/auth/register` | Registration form |
| 3 | ForgotPasswordPage | `/auth/forgot-password` | Password reset request |
| 4 | ResetPasswordPage | `/auth/reset-password` | Reset with code |
| 5 | VerifyEmailPage | `/auth/verify-email` | Email verification |
| 6 | AuthShell | (wrapper) | Auth pages layout |

### Account Pages (10)
| # | Page | Route | Purpose |
|---|------|-------|---------|
| 1 | DashboardPage | `/account` | Overview, recent orders |
| 2 | OrdersPage | `/account/orders` | Order list |
| 3 | OrderDetailPage | `/account/orders/:id` | Order detail |
| 4 | OrderTrackingPage | `/account/orders/:id/tracking` | Order tracking |
| 5 | ReturnRequestPage | `/account/orders/:id/return` | Return request |
| 6 | AddressesPage | `/account/addresses` | Address management |
| 7 | SettingsPage | `/account/settings` | Profile settings |
| 8 | NotificationsPage | `/account/notifications` | Notification list |
| 9 | SupportTicketsPage | `/account/support` | Support tickets |

### Admin Pages (37+)
| # | Page | Route |
|---|------|-------|
| 1 | DashboardPage | `/admin` |
| 2 | ProductsPage | `/admin/products` |
| 3 | ProductFormPage | `/admin/products/new`, `/admin/products/:id/edit` |
| 4 | CategoriesPage | `/admin/categories` |
| 5 | CollectionsPage | `/admin/collections` |
| 6 | OrdersPage | `/admin/orders` |
| 7 | OrderDetailPage | `/admin/orders/:id` |
| 8 | ReturnsPage | `/admin/returns` |
| 9 | ReturnDetailPage | `/admin/returns/:id` |
| 10 | CustomersPage | `/admin/customers` |
| 11 | LookbooksPage | `/admin/lookbooks` |
| 12 | LookbookFormPage | `/admin/lookbooks/new`, `/admin/lookbooks/:id/edit` |
| 13 | BrandsPage | `/admin/brands` |
| 14 | SizeGuidesPage | `/admin/size-guides` |
| 15 | LabelsPage | `/admin/labels` |
| 16 | InventoryPage | `/admin/inventory` |
| 17 | CMSPage | `/admin/cms` |
| 18 | HomepageBuilder | `/admin/cms/homepage` |
| 19 | HeroBuilder | `/admin/cms/hero-builder` |
| 20 | FooterBuilder | `/admin/cms/footer` |
| 21 | HeaderBuilder | `/admin/cms/header-builder` |
| 22 | MediaLibrary | `/admin/media` |
| 23 | MediaHealth | `/admin/media/health` |
| 24 | SEOPage | `/admin/seo` |
| 25 | ThemeBuilder | `/admin/theme/builder` |
| 26 | AnalyticsPage | `/admin/analytics` |
| 27 | SettingsPage | `/admin/settings` |
| 28 | CouponsPage | `/admin/coupons` |
| 29 | ReviewsPage | `/admin/reviews` |
| 30 | NewsletterPage | `/admin/newsletter` |
| 31 | ContactsPage | `/admin/contacts` |
| 32 | AnnouncementsPage | `/admin/announcements` |
| 33 | ImportExportPage | `/admin/import-export` |
| 34 | SearchIndexPage | `/admin/search-index` |
| 35 | SocialLinksPage | `/admin/social-links` |
| 36 | SupportTicketsPage | `/admin/support` |
| 37 | SupportTicketDetailPage | `/admin/support/:id` |
| 38 | FAQPage | `/admin/faq` |
| 39 | NotificationsPage | `/admin/notifications` |
| 40 | WebhookEventsPage | `/admin/webhooks` |
| 41 | PageTemplatesPage | `/admin/page-templates` |
| 42 | CampaignsPage | `/admin/campaigns` |
| 43 | AbandonedCartsPage | `/admin/abandoned-carts` |
| 44 | AuthActivityPage | `/admin/auth` |
| 45 | AuditLogPage | `/admin/audit-log` |
| 46 | WishlistsPage | `/admin/wishlists` |

---

## 11. Components Documentation

### UI Primitives (`src/components/ui/`)
| Component | Purpose | Reusable |
|-----------|---------|:--------:|
| Button | CTA button with variants | Yes |
| Input | Text input field | Yes |
| Select | Dropdown select | Yes |
| Badge | Status/category badge | Yes |
| Card | Content container | Yes |
| Label | Form label | Yes |
| Toast | Toast notification system | Yes |
| Dialog | Modal dialog | Yes |
| Skeleton | Loading placeholder | Yes |
| LoadingSpinner | Spinner indicator | Yes |
| Breadcrumbs | Navigation breadcrumbs | Yes |
| ImageGallery | Image gallery display | Yes |
| VariantSelector | Product variant picker | Yes |
| RelatedProducts | Related products grid | Yes |
| ProductQA | Product Q&A section | Yes |

### Auth Components (`src/components/auth/`)
| Component | Purpose |
|-----------|---------|
| ProtectedRoute | Redirects to login if not authenticated |
| AdminRoute | Redirects if not admin |

### Storefront Components (`src/storefront/components/`)
| Component | Purpose |
|-----------|---------|
| ProductCard | Product card for grids |
| ProductCardSkeleton | Loading skeleton |
| ProductGrid | Grid layout for products |
| ImageGallery | Image gallery with lightbox |
| PriceDisplay | Price with sale/compare display |
| StarRating | Star rating display |
| Reviews | Review list with pagination |
| SizeSelector | Size picker for variants |
| ColorSelector | Color swatch picker |
| QuantitySelector | Quantity input with +/- |
| CartDrawer | Slide-in cart |
| Breadcrumbs | SEO breadcrumbs |
| HeroCarousel | Hero slider with autoplay |
| NewsletterForm | Email signup |
| SocialProof | Live purchase notifications |
| SocialShare | Share buttons |
| QuickViewModal | Quick product view |
| ShopTheLook | Lookbook product links |
| RecentlyViewed | Recently viewed products |
| ProductRecommendations | ML-based recommendations |
| FrequentlyBoughtTogether | Cross-sell suggestions |
| EmptyState | Empty state placeholder |
| DashboardSidebar | Account dashboard nav |
| ScrollToTop | Route change scroll reset |
| ConnectivityIndicators | Offline banner + provider |

### Shared Components (`src/components/`)
| Component | Purpose |
|-----------|---------|
| ErrorBoundary | React error boundary |
| AuthLoader | Session restore on mount |
| SafeImage | Image with fallback, retry, srcset |
| SEOHead | SEO meta injection |
| GoogleAnalytics | GA4 script loader |
| CookieConsent | GDPR cookie consent banner |
| PwaInstallPrompt | PWA install prompt |
| SkipToContent | Accessibility skip link |
| TurnstileWidget | Cloudflare Turnstile widget |
| PasswordInput | Password with show/hide |
| PhoneInput | Phone number with country code |
| ConfirmDialog | Confirmation modal |
| OfflineBanner | Offline status banner |
| ErrorPages | Standard error page components |

### Layout Components (`src/storefront/layout/`)
| Component | Purpose |
|-----------|---------|
| Layout | Main layout wrapper (Header + Footer + Outlet) |
| Header | Desktop storefront header |
| Footer | Storefront footer |
| MobileNav | Mobile navigation drawer |
| BottomNav | Mobile bottom navigation bar |
| MegaMenu | Desktop mega dropdown menu |
| SearchOverlay | Full-screen search overlay |

### CMS Section Components (`src/storefront/sections/`)
| Component | Purpose |
|-----------|---------|
| SectionRenderer | Routes section type to correct component |
| HeroSliderSection | Hero carousel section |
| ProductGridSection | Featured/collection product grid |
| CategoriesGridSection | Category grid display |
| CollectionGridSection | Collection grid display |
| NewArrivalsSection | New products section |
| BannerPromoSection | Promotional banner |
| BrandStorySection | Brand story/about section |
| VideoBannerSection | Video background hero |
| TestimonialsSection | Customer testimonials |
| TrustBarSection | Trust badges/logos |
| NewsletterSection | Newsletter signup |
| InstagramFeedSection | Instagram embed feed |
| CustomHTMLSection | Raw HTML section |

---

## 12. Hooks Documentation

### Custom Hooks (`src/hooks/`)
| Hook | Purpose | Used In |
|------|---------|---------|
| useAuth | Auth operations & state | LoginPage, RegisterPage |
| useDarkMode | Dark mode toggle | Theme settings |
| useFocusTrap | Focus trapping for modals | Dialog, SearchOverlay |
| useFormValidation | Form validation | Forms across app |
| useInfiniteScroll | Infinite scroll trigger | ProductGrid |
| useKeyboardNavigation | Keyboard nav for lists | SearchOverlay |
| useOfflineStatus | Network status | OfflineBanner |
| useProductComparison | Product compare | ProductListing |
| useRecentlyViewed | Recently viewed products | ProductDetail, RecentlyViewed |
| useWishlist | Wishlist operations | ProductCard, WishlistPage |

### Storefront Hooks (`src/storefront/hooks/`)
| Hook | Purpose |
|------|---------|
| useCart | Cart operations (add, remove, update, clear) |
| useCartEffects | Side effects on cart changes |
| useCartSync | Guest/server cart synchronization |
| useAnnouncements | Announcement bar data |
| useCategories | Category list |
| useCollections | Collection list |
| useConnectivityManager | Connectivity state management |
| useFooter | Footer content from CMS |
| useNavigation | Navigation menu data |
| usePolicyPages | Static policy pages |
| useProducts | Product listing with filters |
| useSettings | Site settings |
| useWishlist (storefront) | Wishlist state & operations |

---

## 13. Context Providers

| Provider | Package | Purpose |
|----------|---------|---------|
| ConnectivityProvider | Custom | Monitors online/offline status |
| HelmetProvider | react-helmet-async | Head/SEO metadata management |
| Toaster | Custom (Toast.tsx) | Toast notification system |
| QueryClientProvider | @tanstack/react-query | Server state management |
| BrowserRouter | react-router-dom | Client-side routing |

**Not found:** CartProvider, WishlistProvider, SearchProvider, SettingsProvider, DarkModeProvider

---

## 14. Services

| Service | Location | Responsibility |
|---------|----------|---------------|
| API Client | `src/lib/api/client.ts` | Base HTTP client, auth, CSRF, refresh |
| Auth API | `src/lib/api/auth.ts` | Auth endpoint calls |
| Admin API | `src/lib/api/admin.ts` | Admin endpoint calls (451 lines) |
| Media | `src/lib/media/` | Cloudinary operations, folders, validation |
| Media (backend) | `api/_lib/media/` | Cloudinary API, bulk ops, drift detection |
| Email | `api/_lib/email.ts` | Transactional emails via Resend |
| Payment | `api/_handlers/payments.ts` | Razorpay operations (1058 lines) |
| Search | `api/_handlers/search.ts` | Product search, suggestions |
| Analytics | `src/lib/analytics.ts` | Google Analytics 4 events |
| Turnstile | `src/lib/turnstile.ts` | Bot protection |
| Razorpay | `src/lib/razorpay/` | Frontend checkout integration |
| Validators | `src/lib/security/validations.ts` | Input validation |

---

## 15. API Documentation

### Base URL
- **Production:** `https://www.nabome.online/api`
- **Development:** `http://localhost:5173/api` (proxied to `http://localhost:8788`)

### Response Format
```json
{ "success": true, "data": { ... }, "timestamp": "2026-07-13T..." }
```

### Error Format
```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "...", "status": 400 }, "requestId": "uuid", "timestamp": "..." }
```

### Error Codes
| Code | HTTP | Description |
|------|:----:|-------------|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_SERVER_ERROR | 500 | Server error |

### Public Endpoints (Auth)
| Method | Route | Turnstile |
|--------|-------|:---------:|
| POST | `/api/auth/register` | Yes |
| POST | `/api/auth/login` | Yes |
| POST | `/api/auth/refresh` | No |
| POST | `/api/auth/forgot-password` | Yes |
| POST | `/api/auth/verify-reset-code` | Yes |
| POST | `/api/auth/reset-password` | Yes |
| POST | `/api/auth/verify-email` | Yes |
| POST | `/api/auth/resend-verification` | Yes |

### Public Endpoints (Products)
| Method | Route |
|--------|-------|
| GET | `/api/products` |
| GET | `/api/products/featured` |
| GET | `/api/products/new` |
| GET | `/api/products/search` |
| GET | `/api/products/autocomplete` |
| GET | `/api/products/by-slugs` |
| GET | `/api/products/:slug` |
| GET | `/api/products/:slug/variants` |
| GET | `/api/products/:slug/reviews` |
| GET | `/api/products/:slug/similar` |

### Public Endpoints (CMS & Misc)
| Method | Route |
|--------|-------|
| GET | `/api/categories` |
| GET | `/api/categories/:slug` |
| GET | `/api/collections` |
| GET | `/api/collections/:slug` |
| GET | `/api/brands` |
| GET | `/api/size-guides` |
| GET | `/api/tags` |
| GET | `/api/cms/homepage` |
| GET | `/api/cms/pages` |
| GET | `/api/cms/navigation` |
| GET | `/api/cms/announcements` |
| GET | `/api/cms/footer` |
| GET | `/api/cms/social-proof` |
| GET | `/api/lookbooks` |
| GET | `/api/lookbooks/:slug` |
| GET | `/api/campaigns` |
| GET | `/api/campaigns/active` |
| GET | `/api/search/suggestions` |
| GET | `/api/search/trending` |
| GET | `/api/settings` |
| GET | `/api/homepage` |
| GET | `/api/faq` |
| POST | `/api/contact` |
| POST | `/api/newsletter` |
| POST | `/api/coupons/validate` |

### Authenticated Customer Endpoints
| Method | Route |
|--------|-------|
| GET | `/api/auth/me` |
| PUT | `/api/auth/me` |
| POST | `/api/auth/logout` |
| POST | `/api/auth/change-password` |
| GET/DELETE | `/api/auth/sessions` |
| GET/POST/PUT/DELETE | `/api/cart`, `/api/addresses`, `/api/wishlist` |
| POST | `/api/checkout`, `/api/checkout/guest` |
| GET | `/api/orders`, `/api/orders/stats`, `/api/orders/:id` |
| POST | `/api/orders/:id/cancel` |
| POST | `/api/reviews` |
| POST | `/api/returns` |
| GET | `/api/returns`, `/api/returns/:id` |
| GET | `/api/refunds`, `/api/refunds/:id` |
| POST | `/api/payments/verify`, `failed`, `retry` |
| GET/PUT | `/api/dashboard`, `/api/profile` |
| POST/GET | `/api/support` |
| GET/PUT/DELETE | `/api/notifications` |
| POST | `/api/search/save`, `clear` |
| GET | `/api/search/recent` |
| POST | `/api/account/export`, `delete` |
| POST | `/api/upload/customer` |

### Admin Endpoints
| Method | Route |
|--------|-------|
| GET | `/api/admin/dashboard` |
| GET/POST/PUT/DELETE | `/api/admin/products`, categories, collections, brands, size-guides, coupons, reviews, lookbooks, templates, campaigns |
| GET/POST/PUT/DELETE | `/api/admin/cms/pages`, navigation, footer |
| GET/POST/PUT/DELETE | `/api/admin/media`, `/api/admin/media-folders` |
| POST | `/api/admin/media/upload`, bulk-delete, bulk-move |
| GET/PUT | `/api/admin/settings` |
| GET/POST/PUT/DELETE | `/api/admin/social-links` |
| GET | `/api/admin/orders`, customers, support, faq, notifications |
| PUT | `/api/admin/orders/:id/status` |
| GET | `/api/admin/analytics/sales`, products, customers |
| GET | `/api/admin/inventory/*` |
| GET | `/api/admin/search/status`, search |
| POST | `/api/admin/search/build` |
| GET/POST/DELETE | `/api/admin/coupon-redemptions`, abandoned-carts, audit-log, wishlists, addressessessions, login-attempts |
| GET | `/api/admin/webhooks/events` |
| POST | `/api/admin/notifications/send` |
| POST/GET | `/api/admin/products/export`, import |
| PUT | `/api/admin/returns/:id/approve`, reject, receive |
| POST | `/api/payments/refund` |

---

## 16. Database Architecture

### Overview
- **ORM:** Prisma 6.6.0
- **Database:** PostgreSQL via Neon serverless
- **Models:** 55 total (34 explicit + 21 implicit/junction)
- **Enums:** 18
- **Migrations:** 11 (1675 SQL lines)
- **Indexes:** 80+ `@@index` declarations
- **Transactions:** 22+ `$transaction` sites across 14 handlers
- **Seed Data:** 21 products, 33 variants, 6 categories, 6 collections, 3 brands
- **Zero raw SQL:** All queries through Prisma ORM

### Database ER Diagram (Text)
```
profiles ──┬── auth_sessions (1:N)
           ├── addresses (1:N)
           ├── orders (1:N)
           ├── cart (1:1) ── cart_items (1:N) ── product_variants
           ├── wishlist_items (1:N) ── product_variants
           ├── reviews (1:N) ── products
           ├── notifications (1:N)
           ├── support_tickets (1:N)
           ├── coupon_redemptions (1:N)
           ├── login_attempts (1:N)
           ├── return_requests (1:N) ── orders
           └── support_ticket_replies (1:N)

categories ──┬── subcategories (1:N)
             ├── products (1:N)
             └── size_guides (1:N)

products ──┬── product_variants (1:N)
           ├── product_images (1:N)
           ├── product_attributes (1:N)
           ├── order_items (1:N)
           ├── reviews (1:N)
           ├── related_products (N:M self)
           ├── product_tags (N:M via product_tags_products)
           ├── product_labels (N:M via product_labels_products)
           ├── lookbook_items (1:N)
           └── brands, collections, subcategories, size_guides (N:1)

orders ──┬── order_items (1:N)
         ├── order_status_history (1:N)
         ├── refunds (1:N)
         ├── return_requests (1:N)
         ├── webhook_events (1:N)
         ├── notifications (1:N)
         ├── coupon_redemptions (1:1)
         ├── support_tickets (1:N)
         └── addresses (billing/shipping)
```

### Complete Model List
| # | Model | Domain | Key Fields |
|---|-------|--------|------------|
| 1 | profiles | User | email, role, firstName, lastName, emailVerified |
| 2 | auth_sessions | Auth | profileId, accessToken, refreshToken, expiresAt |
| 3 | login_attempts | Auth | email, ipAddress, success |
| 4 | verification_attempts | Auth | email, code, ipAddress, lockedUntil |
| 5 | user_action_logs | Audit | profileId, action, entity, metadata |
| 6 | api_keys | API | name, key, version, expiresAt |
| 7 | categories | Products | name, slug, parentId, sortOrder |
| 8 | subcategories | Products | name, slug, categoryId |
| 9 | collections | Products | name, slug, isFeatured |
| 10 | brands | Products | name, slug, logoUrl |
| 11 | size_guides | Products | name, slug, measurements (JSON) |
| 12 | inventory_alerts | Inventory | variantId, type, threshold, currentStock |
| 13 | products | Products | name, slug, basePrice, isActive, gender |
| 14 | product_variants | Products | productId, sku, size, color, stock |
| 15 | product_images | Products | productId, variantId, url, isPrimary |
| 16 | product_attributes | Products | productId, name, value |
| 17 | related_products | Products | sourceId, targetId, type |
| 18 | product_tags | Products | name, slug |
| 19 | product_tags_products | Products | productId, tagId (junction) |
| 20 | product_labels | Products | name, slug, color |
| 21 | product_labels_products | Products | productId, labelId (junction) |
| 22 | inventory_movements | Inventory | variantId, quantityChange, reason |
| 23 | addresses | Users | profileId, fullName, city, state, pincode |
| 24 | wishlist_items | Users | profileId, variantId |
| 25 | carts | Orders | profileId, expiresAt |
| 26 | cart_items | Orders | cartId, variantId, quantity |
| 27 | orders | Orders | orderNumber, status, total, paymentStatus |
| 28 | order_items | Orders | orderId, productId, variantId, quantity, price |
| 29 | order_status_history | Orders | orderId, fromStatus, toStatus |
| 30 | coupons | Marketing | code, type, value, minOrderAmount |
| 31 | coupon_redemptions | Marketing | couponId, profileId, orderId |
| 32 | reviews | Products | productId, profileId, rating, body |
| 33 | notifications | Users | profileId, type, title, message |
| 34 | notification_templates | Admin | name, subject, body, type |
| 35 | support_tickets | Support | profileId, subject, status, priority |
| 36 | support_ticket_replies | Support | ticketId, profileId, message |
| 37 | static_pages | CMS | title, slug, content, isPublished |
| 38 | homepage_sections | CMS | type, title, sortOrder, settings (JSON) |
| 39 | navigation_menus | CMS | name, location |
| 40 | navigation_items | CMS | menuId, parentId, label, url, type |
| 41 | footer_sections | CMS | title, sortOrder |
| 42 | footer_links | CMS | sectionId, label, url |
| 43 | announcements | CMS | message, type, isActive, date range |
| 44 | campaigns | Marketing | name, type, startDate, endDate |
| 45 | campaign_products | Marketing | campaignId, productId |
| 46 | lookbooks | CMS | name, slug, description |
| 47 | lookbook_items | CMS | lookbookId, productId, position |
| 48 | media_assets | Media | filename, url, publicId, format, size |
| 49 | media_folders | Media | name, parentId, path |
| 50 | site_settings | Admin | siteName, ogImageUrl, seo (JSON) |
| 51 | social_links | Admin | platform, url, sortOrder |
| 52 | webhook_events | Payments | orderId, eventType, status, payload |
| 53 | analytics_events | Analytics | type, event, properties (JSON) |
| 54 | contact_submissions | Support | name, email, subject, message |
| 55 | newsletter_subscribers | Marketing | email, isActive |

### Enums (18)
| Enum | Key Values |
|------|------------|
| UserRole | customer, admin |
| OrderStatus | pending, confirmed, processing, packed, shipped, out_for_delivery, delivered, cancelled, returned, refunded |
| PaymentStatus | pending, paid, failed, refunded, partially_refunded |
| Gender | men, women, unisex |
| CampaignType | seasonal, flash_sale, holiday, clearance, new_arrival, exclusive |
| SectionType | hero_slider, product_grid, categories_grid, collections_grid, new_arrivals, banner_promo, brand_story, video_banner, testimonials, trust_bar, newsletter, instagram_feed, custom_html |

### Key Indexes
- `products`: Composite on `[isActive, categoryId, sortOrder]`, `[isActive, basePrice]`, `[isActive, gender, createdAt]`
- `orders`: Composite on `[status, createdAt]`, `[profileId, status, createdAt]`
- `profiles`: Indexes on `[role]`, `[isActive]`, `[createdAt]`

### Key Constraints
- `product_variants`: Unique on `[productId, size, color]`
- `wishlist_items`: Unique on `[profileId, variantId]`
- `cart_items`: Unique on `[cartId, variantId]`
- `related_products`: Unique on `[sourceId, targetId, type]`
- All soft deletes use `isActive` boolean pattern

---

## 17. Storage System

### Cloudinary Integration
Primary media CDN and digital asset management. All product images, category images, collection images, hero banners, and admin-uploaded media are served through Cloudinary.

### Image Sources
| Source | Description | CDN |
|--------|-------------|:---:|
| Admin Uploads | Production images via admin panel | Cloudinary |
| Seed Data | Unsplash proxied through Cloudinary fetch | Cloudinary + Unsplash |
| Placeholder | Local SVG placeholder | Local |

### Upload Flow
```
1. Admin selects file in Media Library
2. POST /api/admin/media/upload (multipart)
3. Validate: image/jpeg, png, webp, gif; max 5MB
4. Upload to Cloudinary via REST API
5. Create media_assets record in DB
6. Return asset with URL + publicId
```

### Folder Structure
- Hierarchical via media_folders table with parentId
- Create/rename/delete/move folders
- Storage usage tracking per folder
- Assets linked via media_assets.folderId

### Image Optimization
- Auto format (`f_auto`) → WebP for supporting browsers
- Auto quality (`q_auto`) → optimal quality/size balance
- Responsive srcset via `imgSet()` for multiple breakpoints
- Fetch proxy external images through Cloudinary
- Long-lived CDN caching headers

### Naming Convention
- Original filenames preserved
- Double extensions stripped (`.jpeg.jpg` → `.jpeg`)
- Cloudinary public_id stored alongside URL

### Delete Flow
- Individual: DELETE /api/admin/media/:id
- Bulk: POST /api/admin/media/bulk-delete
- Removes from Cloudinary + deletes DB record

---

## 18. Search System

### Implementation
Database-driven search using Prisma `mode: 'insensitive'` + `contains` queries. **No dedicated search engine** (Algolia, Elasticsearch, MeiliSearch).

### Search Features
| Feature | Implementation |
|---------|---------------|
| Product search | Prisma contains query |
| Category filter | URL query param |
| Price range | URL query params |
| Autocomplete | GET /api/products/autocomplete |
| Suggestions | GET /api/search/suggestions |
| Trending | GET /api/search/trending (hardcoded list) |
| Recent searches | search_history table per user |

### Limitations
- No full-text search engine
- No fuzzy matching or typo tolerance
- No relevance ranking
- No faceted search
- No search analytics
- In-memory index (lost on Worker restart)

### Search History
- Authenticated users: searches saved to search_history
- POST /api/search/save, POST /api/search/clear, GET /api/search/recent

### Admin Search Index
- GET /api/admin/search/status — index status
- POST /api/admin/search/build — rebuild
- GET /api/admin/search — admin search

---

## 19. Product Management

### Lifecycle
```
Draft → Active (isActive=true) → Published → Archived (isActive=false) → Deleted (soft) → Permanent Delete
```

### Creation
- Admin fills form → POST /api/admin/products → generates slug → creates record

### Editing
- Admin navigates to /admin/products/:id/edit → ProductFormPage → PUT to update

### Media
- Multiple images per product (product_images table)
- Variant-specific images (variantId)
- One primary image (isPrimary flag)
- Sort order (sortOrder)

### Variants
- Each variant: unique SKU, size + color combination (unique constraint)
- Individual stock, price adjustment, weight
- Reserved stock for in-progress orders

### Pricing
| Field | Required | Description |
|-------|:-------:|-------------|
| basePrice | Yes | Base product price |
| compareAtPrice | No | Strikethrough original price |
| salePrice | No | Sale price override |
| costPrice | No | Internal cost tracking |
| discountPercent | Auto | Calculated from prices |

### Categories & Collections
- Products belong to: 1 category, 1 subcategory, 1 collection, 1 brand (all optional)
- Products can have: multiple tags, multiple labels

### SEO
- metaTitle, metaDesc per product
- URL slug (unique)
- Images with alt text
- Structured data in middleware

### Soft Delete
- isActive = false → can be restored
- Permanent delete available
- Cascade on related entities

### Bulk Operations
- Status, category, delete, permanent delete

### Import/Export
- CSV/JSON format
- GET /api/admin/products/export
- POST /api/admin/products/import

---

## 20. Order System

### Lifecycle
```
Cart → Checkout → Pending → Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered
                                                                                           ↓
                                                                                       Returned → Refunded
```
Cancellation possible at: pending, confirmed, processing, packed, shipped

### Cart
- **Authenticated:** Persisted in DB (carts + cart_items)
- **Guest:** In-memory (Zustand)
- **Merge:** On login, guest items merged to server
- **Saved for Later:** Items can be flagged

### Checkout (api/_handlers/checkout.ts — 895 lines)
1. Validate cart items + stock
2. Calculate subtotal, shipping, tax, discount
3. Validate coupon
4. Create Razorpay order
5. Create order (status: pending) + order_items
6. Reserve stock
7. Clear cart
8. Return + Razorpay order ID

### Payment
- **Gateway:** Razorpay
- **Flow:** Razorpay order → Frontend checkout → User pays → Backend verifies signature
- **Webhook:** POST /api/payments/webhook (no idempotency — critical issue)

### Fulfillment
- Admin updates status: processing → packed → shipped → delivered
- Tracking number + carrier stored
- Status history in order_status_history

### Coupons
- coupons table with code, type, value, conditions
- Validated pre-checkout
- Usage tracked in coupon_redemptions

### Returns & Refunds
- Customer initiates return → Admin approves/rejects/receives
- Refund lifecycle: created → processed → completed/failed
- Partial refunds possible
- Razorpay refund API integration

### Order Numbering
- Format: `NB-XXXXX` (ORDER_PREFIX = "NB")

---

## 21. Seller Dashboard

**Not found in current codebase.** The NABOME platform has zero seller/multi-vendor infrastructure. No seller registration, KYC, shop creation, product listing, order management, payouts, or analytics for sellers.

---

## 22. Admin Dashboard

### Complete Module List (37+)
| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/admin` | Stats, charts, recent orders |
| Products | `/admin/products` | Full CRUD |
| Categories | `/admin/categories` | Category management |
| Collections | `/admin/collections` | Collection management |
| Orders | `/admin/orders` | Order list + detail |
| Returns | `/admin/returns` | Return management |
| Customers | `/admin/customers` | Customer list + detail |
| CMS | `/admin/cms` | Page/content management |
| Homepage Builder | `/admin/cms/homepage` | Drag-and-drop section builder |
| Hero Builder | `/admin/cms/hero-builder` | Hero slider editor |
| Footer Builder | `/admin/cms/footer` | Footer editor |
| Header Builder | `/admin/cms/header-builder` | Navigation editor |
| Media Library | `/admin/media` | Asset management |
| Media Health | `/admin/media/health` | Drift detection |
| SEO | `/admin/seo` | Site SEO settings |
| Theme Builder | `/admin/theme/builder` | Theme customization |
| Analytics | `/admin/analytics` | Sales/product/customer charts |
| Settings | `/admin/settings` | Site configuration |
| Coupons | `/admin/coupons` | Coupon CRUD |
| Reviews | `/admin/reviews` | Review moderation |
| Newsletter | `/admin/newsletter` | Subscriber list |
| Contacts | `/admin/contacts` | Contact submissions |
| Announcements | `/admin/announcements` | Announcement bar |
| Import/Export | `/admin/import-export` | Data import/export |
| Search Index | `/admin/search-index` | Search build/status |
| Social Links | `/admin/social-links` | Social media links |
| Support | `/admin/support` | Support tickets |
| FAQ | `/admin/faq` | FAQ editing |
| Notifications | `/admin/notifications` | Templates |
| Webhooks | `/admin/webhooks` | Webhook events |
| Page Templates | `/admin/page-templates` | Templates |
| Campaigns | `/admin/campaigns` | Campaign management |
| Abandoned Carts | `/admin/abandoned-carts` | Abandoned cart list |
| Auth Activity | `/admin/auth` | Session/login monitoring |
| Audit Log | `/admin/audit-log` | Admin audit trail |
| Wishlists | `/admin/wishlists` | Customer wishlist view |
| Brands | `/admin/brands` | Brand management |
| Size Guides | `/admin/size-guides` | Size guide CRUD |
| Labels | `/admin/labels` | Product labels |
| Inventory | `/admin/inventory` | Stock overview |

---

## 23. Media Library

### Architecture
Full-featured digital asset management system built into the admin dashboard with frontend and backend services.

### Features
| Feature | Implementation |
|---------|---------------|
| Upload | Multi-file to Cloudinary |
| Grid/List View | Toggle views |
| Folder Navigation | Hierarchical tree |
| Search | Asset name search |
| Filter | By type, folder |
| Bulk Delete | Select + delete |
| Bulk Move | Move between folders |
| Storage Tracking | Per-folder usage |

### Backend Services (`api/_lib/media/` — 15 files)
| File | Responsibility |
|------|---------------|
| cloudinary.ts | Cloudinary API integration |
| folder.ts | Folder CRUD operations |
| validation.ts | File type/size validation |
| types.ts | TypeScript types |
| bulk-operations.service.ts | Bulk CRUD |
| usage.service.ts | Storage usage tracking |
| drift-detection.service.ts | Cloudinary/DB sync check |
| background-cleanup.service.ts | Orphan cleanup |
| transaction.service.ts | Transaction support |
| audit-log.service.ts | Audit trail |
| asset-id.ts | Asset ID generation |
| lifecycle.ts | Asset lifecycle |

### Frontend Services (`src/lib/media/` — 9 files)
| File | Responsibility |
|------|---------------|
| cloudinary.config.ts | Configuration management |
| media.service.ts | Core CRUD operations |
| folder.service.ts | Folder management |
| validation.service.ts | File validation |
| security.service.ts | Security checks |
| lifecycle.service.ts | Lifecycle tracking |
| media.types.ts | TypeScript types |
| media.constants.ts | Constants |
| index.ts | Module exports |

---

## 24. Navigation

### Desktop Navigation
- **Header:** Brand logo, nav links (Home, Products, Collections, Lookbooks), search, wishlist, account, cart
- **MegaMenu:** Category-based mega dropdown, images, promotional banners, CMS-driven
- **Breadcrumbs:** SEO-friendly location context

### Mobile Navigation
- **MobileNav:** Slide-in drawer from left, category listing, account links
- **BottomNav:** Fixed bottom bar (Home, Search, Wishlist, Cart, Account)

### Footer
- Multi-column CMS-driven content
- Quick links, categories, support, social links
- Newsletter signup form

### Search
- SearchOverlay: Full-screen modal with autocomplete
- Recent searches (authenticated users)
- Trending searches (hardcoded)
- Debounced input

### Responsive Behavior
| Screen Size | Header | Navigation |
|-------------|--------|------------|
| Desktop (>1024px) | Full header with MegaMenu | Top nav bar |
| Tablet (768-1024px) | Condensed header | Collapsible menu |
| Mobile (<768px) | Compact header | Bottom nav + Hamburger |

---

## 25. Mobile Experience

### Layout
- Fluid responsive design via Tailwind breakpoints
- Touch-optimized tap targets
- Bottom navigation for primary actions
- Full-screen modal overlays for search/cart

### Navigation
- BottomNav: Home, Search, Wishlist, Cart, Account
- MobileNav: Slide-in drawer
- CartDrawer: Slide-in from right
- SearchOverlay: Full-screen

### Performance
- Lazy-loaded route components
- Optimized images via Cloudinary srcset
- Service worker for offline caching
- Reduced motion respected

### UX Strengths
- Premium aesthetic consistent with desktop
- Bottom nav provides easy access
- Cart drawer avoids full page navigation
- Search overlay works well

### UX Weaknesses
- Announcement bar offset not accounted for
- Toast notifications can overlap bottom nav
- Color-only states (accessibility issue)
- No dark mode

---

## 26. Desktop Experience

### Layout
- Full-width header with mega menu
- Left sidebar on admin pages
- Wide content areas with max-width containers
- Hero sections with full-bleed imagery

### Admin Sidebar
- Collapsible sidebar
- Module grouping with active state
- Scroll on overflow

### Header
- Full navigation bar with logo (center-aligned links)
- Right-aligned actions (search, wishlist, cart, account)
- CMS-driven mega dropdown menu

### Navigation
- Top-level links always visible
- MegaMenu on hover for categories
- Search via SearchOverlay (keyboard shortcut)
- Breadcrumbs for location context

### Large Screens
- Multi-column layouts
- Side-by-side product grids
- Gallery + info split on product detail
- Wider containers (max-w-7xl)

### Performance
- Lazy-loaded admin chunks (not preloaded)
- Code splitting by route
- Efficient Tailwind CSS output (purged)

### Accessibility
- Keyboard navigation support
- Focus visible indicators
- Skip to content link
- ARIA landmarks

---

## 27. Responsive Design System

### Breakpoints (Tailwind Defaults)
| Breakpoint | Min Width | Target |
|------------|:---------:|--------|
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Extra large |

### Grid System
- Tailwind's 12-column grid
- Product grids: 2 cols mobile → 3 cols tablet → 4 cols desktop
- Admin: single column mobile → sidebar + content desktop

### Adaptive Components
| Component | Mobile | Desktop |
|-----------|--------|---------|
| Header | Compact, hamburger | Full, mega menu |
| Nav | Bottom bar | Top bar |
| Cart | Drawer (slide) | Drawer (slide) |
| Search | Full overlay | Overlay |
| Product Grid | 2 columns | 3-4 columns |
| Product Detail | Stacked | Side-by-side |

### Typography Scaling
- Font sizes from tailwind.config.ts
- Display sizes: 4.5rem → 3rem (responsive)
- Body: fluid via clamp or breakpoint classes

### Spacing
- Custom spacing scale extends Tailwind defaults
- Consistent padding/margin ratios
- Luxury feel with generous whitespace

---

## 28. UI Design System

### Color Palette
| Token | Color | Hex |
|-------|-------|:----:|
| brand-50 | Light cream | `#faf7f4` |
| brand-500 | Primary brown | `#8b6940` |
| brand-900 | Dark brown | `#241810` |
| accent-gold | Gold | `#c9a84c` |
| accent-rose | Rose | `#c65f5f` |
| accent-sage | Sage green | `#8a9a7b` |
| accent-ink | Dark navy | `#1a1a2e` |
| accent-cream | Cream | `#fdf8f3` |
| luxe-charcoal | Charcoal | `#1c1c1e` |
| luxe-ivory | Ivory | `#f5f0eb` |
| luxe-champagne | Champagne | `#f7f0e6` |
| luxe-bronze | Bronze | `#cd7f32` |
| luxe-platinum | Platinum | `#e5e4e2` |

### Typography
| Font | Usage | Fallback |
|------|-------|----------|
| Cormorant Garamond | Display, editorial | Georgia, serif |
| Manrope | Body, UI | Inter, sans-serif |
| Noto Serif Bengali | Bengali text | serif |

### Font Sizes
| Token | Size | Usage |
|-------|:----:|-------|
| display-1 | 4.5rem | Hero headings |
| display-2 | 3.75rem | Page titles |
| heading-1 | 2.25rem | Section headers |
| body-base | 1rem | Paragraphs |
| caption | 0.6875rem | Labels, badges |

### Animations
| Animation | Duration | Easing |
|-----------|:--------:|--------|
| fadeIn | 0.6s | cubic-bezier(0.22, 1, 0.36, 1) |
| fadeInUp | 0.7s | cubic-bezier(0.22, 1, 0.36, 1) |
| scaleIn | 0.4s | cubic-bezier(0.22, 1, 0.36, 1) |
| shimmer | 2s | linear (infinite) |
| goldPulse | 2s | ease-in-out (infinite) |

### Shadows
| Token | Usage |
|-------|-------|
| subtle | Cards, buttons |
| card | Product cards |
| elevated | Dropdowns, popovers |
| modal | Modals, dialogs |
| menu | Mega menu |
| gold-glow | Premium highlights |

### Design System Score: 6.8/10 (B-)
| Dimension | Score | Grade |
|-----------|:-----:|:-----:|
| Typography System | 8.7/10 | A- |
| Animation System | 8.5/10 | A- |
| Color System | 7.5/10 | B+ |
| Component Library | 7.0/10 | B |
| Responsive System | 7.5/10 | B+ |
| Premium Quality | 7.5/10 | B+ |
| Accessibility | 5.0/10 | C |
| Dark Mode | 1.0/10 | F |
| Admin vs Storefront Parity | 4.0/10 | D |

---

## 29. State Management

### Architecture
| State Type | Tool | Where |
|------------|------|-------|
| Server State | TanStack React Query | All API data |
| Client State | Zustand | Auth, Cart, UI |
| Component State | React useState/useReducer | Forms, toggles |
| URL State | React Router | Routes, search params |

### Zustand Stores
**Auth Store** (`src/stores/auth-store.ts`)
- State: user, isAuthenticated, isAdmin, isLoading
- No token persistence — tokens in httpOnly cookies

**Cart Store** (`src/storefront/stores/cart-store.ts`)
- State: items (variantId + quantity), isOpen
- Guest cart in-memory, server cart on login

**UI Store** (`src/storefront/stores/ui-store.ts`)
- State: isSearchOpen, isMobileNavOpen, isCartOpen

**Connectivity Store** (`src/storefront/store/connectivity-store.ts`)
- State: isOnline

### Caching
- **React Query:** 5-min stale time, 1 retry
- **In-memory:** SEO middleware (500 entries, 10s TTL)
- **Cloudflare KV:** General cache binding
- **Browser:** Service Worker cache

### Loading States
- Suspense for route-level lazy loading
- Skeleton components (ProductCardSkeleton, etc.)
- Inline spinners for actions
- Shimmer animated placeholders

### Optimistic Updates
**Not found as implemented pattern** — mutations wait for server response

---

## 30. Error Handling

### Frontend
| Layer | Mechanism | Location |
|-------|-----------|----------|
| Component | ErrorBoundary | src/components/ErrorBoundary.tsx |
| Route | Per-route ErrorBoundary | src/app/routes.tsx |
| Admin | Admin ErrorBoundary | src/admin/AdminRoutes.tsx |
| API | ApiError class | src/lib/api/client.ts |
| Toast | Toast notifications | src/components/ui/Toast.tsx |
| Offline | OfflineBanner | src/components/OfflineBanner.tsx |

### Backend
| Layer | Mechanism | Location |
|-------|-----------|----------|
| Response | Standardized error responses | api/_lib/response.ts |
| Auth | 401 → clear cookies | api/_lib/auth-middleware.ts |
| Rate Limit | 429 → rate limit message | api/_lib/rate-limit.ts |
| Validation | Zod (limited) or manual | Various handlers |
| Database | Prisma error → generic | Various handlers |

### Retry Logic
- API client: 401 → refresh → retry (max 2 attempts)
- SafeImage: 1 automatic retry on load failure
- React Query: 1 retry by default
- Admin lazy imports: lazyWithRetry() — retry after 1s

### Fallback UI
- Error pages with retry button
- 404 pages (storefront + admin)
- Premium gradient fallback for images
- Toast notifications for API errors
- Offline banner

### Audit Finding
- **95% of endpoints use raw req.json() without validation** (CVSS 8.0)
- Only ~5 Zod validateBody() calls vs 102 raw req.json() calls

---

## 31. Security Architecture

### Authentication
- JWT-based with httpOnly cookies
- Access token: 15min expiry
- Refresh token: 30 day expiry with rotation

### Authorization
- Role-based (customer, admin)
- Frontend: ProtectedRoute, AdminRoute
- Backend: auth-middleware with requireAdmin()

### Cookie Security
| Cookie | httpOnly | Secure | SameSite |
|--------|:-------:|:------:|:--------:|
| access_token | Yes | Yes | Lax |
| refresh_token | Yes | Yes | Strict |
| csrf_token | No | Yes | Lax |

### CSRF Protection
- Double-submit cookie pattern
- CSRF token cookie + X-CSRF-Token header
- **Critical Issue:** validateCsrf() imported but never called on mutation endpoints (CVSS 9.0)

### Security Headers
```
Content-Security-Policy: restrictive with allowed domains
Strict-Transport-Security: max-age=31536000; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Rate Limiting
| Route Type | Limit |
|------------|:-----:|
| Standard | 100 req/min |
| Auth | 20 req/min |
| Admin | 60 req/min |
| Contact | 10 req/min |

### Critical Security Findings (from audit)
| Issue | CVSS | Description |
|-------|:----:|-------------|
| Production secrets in .env | 10.0 | Supabase, Neon, Cloudinary, Razorpay, Resend keys exposed |
| CSRF dead code | 9.0 | validateCsrf() never invoked |
| JWT in localStorage | 8.5 | Tokens readable by any JS |
| No webhook idempotency | 8.5 | Razorpay events can double-process |
| No input validation | 8.0 | 95% of endpoints use raw req.json() |
| Rate limiting falls open | 7.5 | Returns null on KV miss |
| Type safety bypasses | 7.0 | 92 `as never` + ~308 `any` annotations |

### Environment Variable Security
- **VITE_*** variables: exposed to browser
- **Server-only:** Never exposed, stored as Cloudflare Pages secrets
- **Critical Note:** Real production secrets were committed to .env in git (CVSS 10.0)

---

## 32. Performance

### Current State
| Metric | Value |
|--------|:-----:|
| TTFB | 13.6s (cold start) |
| Main JS Bundle | 322KB |
| CSS Bundle | 114KB |
| Performance Score | 2.5/10 |

### Optimization Implemented
- **Lazy Loading:** All pages via React.lazy()
- **Code Splitting:** Route-based chunks
- **Admin Chunks:** Not preloaded (separate chunk strategy)
- **Image Optimization:** Cloudinary auto format/quality
- **CSS Minification:** LightningCSS
- **JS Minification:** esbuild
- **Bundle Strategy:** Rollup-determined chunking (React 19 requirement)
- **Service Worker:** Cache strategies for assets

### Not Implemented
- No bundle analysis/monitoring
- No image lazy loading beyond browser default
- No preload/prefetch strategy for critical routes
- No performance monitoring (Web Vitals)
- No server-side rendering

---

## 33. SEO

### Implementation
SEO is handled at the Cloudflare Edge via `functions/_middleware.ts` which injects meta tags into HTML before it reaches the browser.

### Features
| Feature | Implementation |
|---------|---------------|
| Title tags | Dynamic per page |
| Meta descriptions | Dynamic per page |
| Canonical URLs | With trailing slash redirects |
| Open Graph tags | title, description, image, type, locale |
| Twitter Cards | summary_large_image |
| JSON-LD Structured Data | Website, Organization, Product, Collection, Article, FAQ, BreadcrumbList |
| Pagination | prev/next link tags |
| Robots | noindex for /admin, /auth, /account |
| Sitemap | Auto-generated XML |

### Page-Specific SEO
| Page | Title Pattern |
|------|---------------|
| Home | `${siteName} — Premium Fashion Marketplace` |
| Product | `${product.name} — ${siteName}` |
| Category | `${category.name} — ${siteName}` |
| Collection | `${collection.name} — ${siteName}` |
| Lookbook | `${lookbook.name} — ${siteName}` |
| Search | `Search Results for "..." — ${siteName}` |
| Static | `${page.title} — ${siteName}` |

### SEO Score: 6.0/10
- Strong: OG tags, JSON-LD, canonical URLs, sitemap
- Weak: No server-rendered structured data, no HSTS enforcement on index.html

---

## 34. Deployment Architecture

### Platform
**Cloudflare Pages** with Functions (Workers) at the edge.

### Build Pipeline
```
npm run pages:build
→ tsx scripts/sync-public-headers.ts  (sync _headers from TS source)
→ prisma generate                      (generate Prisma client)
→ npm run typecheck                    (TypeScript check)
→ vite build                          (build SPA to dist/)
```

### Deployment Flow
```
Git push → GitHub Actions → npm run pages:build → wrangler pages deploy → Cloudflare Edge
```

### Cloudflare Configuration (`wrangler.jsonc`)
| Config | Value |
|--------|-------|
| Pages Build Output | `dist/` |
| Compatibility Date | 2026-06-30 |
| Compatibility Flags | nodejs_compat |
| Placement | Smart |
| Hyperdrive | 1 binding (configured, not actively used) |
| KV Namespaces | 3 (RATE_LIMIT_STORE, FEATURE_FLAGS_KV, CACHE) |

### Environment Variables
- **Development:** `.env` file with placeholder values
- **Production:** Cloudflare Pages secrets (set via wrangler CLI or dashboard)

### CI/CD
- GitHub Actions workflow in `.github/`
- Triggers: push to `main` or `production`
- No preview/staging deployments configured

### Production Infrastructure
| Service | Configuration |
|---------|---------------|
| Hosting | Cloudflare Pages |
| API Runtime | Cloudflare Pages Functions (Workers) |
| Database | Neon PostgreSQL (serverless) |
| Auth | Supabase Auth |
| Media CDN | Cloudinary |
| Email | Resend |
| Payments | Razorpay |
| DNS | Cloudflare DNS |

### Production Readiness Score: 3.8/10
| Issue | Severity |
|-------|:--------:|
| 13.6s TTFB (cold start) | P0 Launch Blocker |
| No observability/monitoring | P0 Launch Blocker |
| Secrets in .env committed to git | P0 Launch Blocker |
| No Hyperdrive active | P0 Launch Blocker |
| HSTS max-age=0 on live site | P0 Launch Blocker |
| CSRF dead code | P0 Launch Blocker |
| No preview/staging deployments | P1 High |

---

## 35. Environment Variables

### Frontend (Vite — exposed to browser)
| Variable | Required | Purpose | Security |
|----------|:--------:|---------|:--------:|
| VITE_SUPABASE_URL | Yes | Supabase project URL | Low (public) |
| VITE_SUPABASE_ANON_KEY | Yes | Supabase anonymous key | Low (public) |
| VITE_RAZORPAY_KEY_ID | Yes | Razorpay public key | Low (public) |
| VITE_SITE_URL | Yes | Site URL | Low |
| VITE_GA_ID | No | Google Analytics ID | Low |
| VITE_CLOUDINARY_CLOUD_NAME | Yes | Cloudinary cloud name | Low |
| VITE_CLOUDINARY_UPLOAD_PRESET | Yes | Cloudinary upload preset | Low |
| VITE_TURNSTILE_SITE_KEY | Yes | Turnstile site key | Low |

### Backend (Server-only — Cloudflare Pages secrets)
| Variable | Required | Purpose | Security |
|----------|:--------:|---------|:--------:|
| DATABASE_URL | Yes | PostgreSQL connection string | High |
| DATABASE_URL_POOLED | Yes | Pooled PostgreSQL connection | High |
| SUPABASE_URL | Yes | Supabase project URL | Medium |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Supabase admin key | **Critical** |
| SUPABASE_ANON_KEY | Yes | Supabase anon key | Low |
| RAZORPAY_KEY_ID | Yes | Razorpay key ID | Medium |
| RAZORPAY_KEY_SECRET | Yes | Razorpay secret | **Critical** |
| RAZORPAY_WEBHOOK_SECRET | Yes | Webhook verification | High |
| RESEND_API_KEY | Yes | Email API key | **Critical** |
| EMAIL_FROM | Yes | Sender address | Low |
| ADMIN_EMAILS | Yes | Admin notification emails | Low |
| SITE_URL | Yes | Site URL | Low |
| CLOUDINARY_CLOUD_NAME | Yes | Cloud name | Low |
| CLOUDINARY_API_KEY | Yes | Cloudinary API key | Medium |
| CLOUDINARY_API_SECRET | Yes | Cloudinary secret | **Critical** |
| TURNSTILE_SECRET_KEY | Yes | Turnstile verification | High |

---

## 36. Third-Party Integrations

| Service | Integration Type | Purpose | Criticality |
|---------|-----------------|---------|:-----------:|
| **Cloudinary** | REST API + CDN | Media storage, optimization, delivery | High |
| **Neon** | PostgreSQL + Prisma Adapter | Serverless database | Critical |
| **Supabase** | JavaScript SDK (supabase-js) | Authentication, user management | Critical |
| **Resend** | REST API | Transactional emails | High |
| **Razorpay** | REST API + Webhooks | Payment processing | Critical |
| **Cloudflare** | Pages, Workers, KV, Hyperdrive | Hosting, compute, storage, acceleration | Critical |
| **Google Analytics** | gtag.js | Web analytics | Low |
| **Google Fonts** | CSS import | Typography | Medium |

### Cloudinary
- **Why:** Image CDN with automatic optimization, format conversion, responsive images
- **Where:** Media upload, SafeImage component, SEO image generation
- **Interactions:** Upload via REST API, serve via CDN URL, transform via URL parameters
- **Auth:** API Key + API Secret for admin operations, upload preset for unsigned uploads

### Neon
- **Why:** Serverless PostgreSQL with connection pooling, auto-scaling
- **Where:** Primary database via Prisma ORM
- **Interactions:** Prisma adapter `@prisma/adapter-neon` + `@neondatabase/serverless`
- **Connection:** `DATABASE_URL` (direct) + `DATABASE_URL_POOLED` (pooled)

### Supabase
- **Why:** Managed auth with JWT, user management, admin APIs
- **Where:** Auth handler, auth middleware, session management
- **Interactions:** supabase-js client for sign up, sign in, user management
- **Auth:** Service role key for admin ops, anon key for public ops

### Resend
- **Why:** High-deliverability modern email API
- **Where:** Transactional email sending
- **Emails:** Verification, password reset, order confirmation, notifications, contact

### Razorpay
- **Why:** Indian payment gateway supporting UPI, cards, netbanking
- **Where:** Payment processing, checkout, refunds, webhooks
- **Flow:** Create order → Frontend checkout → Verify payment → Webhook events

### Cloudflare
- **Why:** Global edge network, DDoS protection, CDN, serverless compute
- **Services:** Pages (hosting), Workers (API compute), KV (caching), Hyperdrive (DB acceleration)
- **Configuration:** wrangler.jsonc with bindings

### Google Analytics
- **Why:** User behavior tracking, conversion analytics
- **Where:** GoogleAnalytics component, analytics.ts service
- **Events:** page_view, add_to_cart, purchase, etc.

---

## 37. Configuration Files

| File | Purpose | Key Settings |
|------|---------|-------------|
| `package.json` | Dependencies, scripts | 56 deps, build pipeline, test commands |
| `tsconfig.json` | TypeScript root | Project references (app, api, node) |
| `tsconfig.app.json` | Frontend TS config | JSX react-jsx, paths alias |
| `tsconfig.api.json` | API TS config | Module bundler, types for Workers |
| `tsconfig.node.json` | Node TS config | For scripts, config files |
| `vite.config.ts` | Build config | React plugin, path alias, proxy, chunking |
| `tailwind.config.ts` | Design system | Colors, typography, animations, shadows (183 lines) |
| `postcss.config.js` | CSS processing | Tailwind + Autoprefixer |
| `eslint.config.js` | Linting | Flat config with TypeScript ESLint |
| `wrangler.jsonc` | Cloudflare deploy | Pages output, KV, Hyperdrive bindings |
| `vitest.config.ts` | Unit testing | jsdom, path aliases |
| `playwright.config.ts` | E2E testing | Browser config, test directory |
| `prisma/schema.prisma` | Database schema | 34 models, 18 enums, 80+ indexes |

---

## 38. Dependency Analysis

### Production Dependencies (25)
| Package | Version | Purpose | Criticality |
|---------|:-------:|---------|:-----------:|
| react | 19.1.0 | UI framework | Critical |
| react-dom | 19.1.0 | DOM rendering | Critical |
| react-router-dom | 7.5.0 | Client-side routing | Critical |
| @tanstack/react-query | 5.75.5 | Server state management | Critical |
| zustand | 5.0.3 | Client state management | High |
| @prisma/client | 6.6.0 | Database ORM | Critical |
| @prisma/adapter-neon | 6.6.0 | Neon DB adapter | Critical |
| @neondatabase/serverless | 1.1.0 | Serverless Postgres driver | Critical |
| @supabase/supabase-js | 2.49.1 | Auth SDK | Critical |
| zod | 3.24.4 | Schema validation | Medium |
| tailwind-merge | 3.2.0 | Class merging utility | Low |
| clsx | 2.1.1 | Class name utility | Low |
| class-variance-authority | 0.7.1 | Component variants | Medium |
| framer-motion | 12.9.2 | Animations | Medium |
| lucide-react | 0.510.0 | Icons | Medium |
| react-helmet-async | 3.0.0 | Head management | Medium |
| react-i18next | 17.0.8 | Internationalization | Low |
| i18next | 26.3.4 | i18n framework | Low |
| i18next-browser-languagedetector | 8.2.1 | Language detection | Low |
| pino | 10.3.1 | Logging | Low |
| pino-pretty | 13.1.3 | Log formatting | Low |
| @dnd-kit/core | 6.3.1 | Drag and drop | Low |
| @dnd-kit/sortable | 10.0.0 | Sortable DnD | Low |
| @dnd-kit/utilities | 3.2.2 | DnD utilities | Low |

### Dev Dependencies (31)
| Package | Version | Purpose |
|---------|:-------:|---------|
| typescript | 5.8.3 | Type checking |
| vite | 6.3.2 | Build tool |
| vitest | 4.1.9 | Unit testing |
| @vitejs/plugin-react | 4.4.1 | React/Vite integration |
| tailwindcss | 3.4.17 | CSS framework |
| postcss | 8.5.3 | CSS processing |
| autoprefixer | 10.4.21 | CSS prefixes |
| prisma | 6.6.0 | Database schema management |
| eslint | 10.6.0 | Linting |
| typescript-eslint | 8.62.1 | TS ESLint |
| @eslint/js | 10.0.1 | ESLint JS config |
| eslint-plugin-react-hooks | 7.1.1 | React hooks linting |
| globals | 17.7.0 | Global definitions |
| @types/react | 19.1.2 | React types |
| @types/react-dom | 19.1.2 | ReactDOM types |
| @types/node | 22.15.3 | Node types |
| @playwright/test | 1.61.1 | E2E testing |
| jsdom | 29.1.1 | DOM emulation |
| @testing-library/react | 16.3.2 | React testing |
| @testing-library/jest-dom | 6.9.1 | DOM matchers |
| @testing-library/user-event | 14.6.1 | User event simulation |
| @vitest/coverage-v8 | 4.1.10 | Test coverage |
| c8 | 11.0.0 | Coverage reporting |
| lightningcss | 1.32.0 | CSS minification |
| tsx | 4.19.4 | TypeScript execution |
| wrangler | 4.105.0 | Cloudflare CLI |
| dotenv | 16.6.1 | Env file loading |
| node-fetch | 3.3.2 | Fetch for Node |
| openapi-types | 12.1.3 | OpenAPI types |
| @scalar/openapi-parser | 0.28.8 | OpenAPI parsing |

---

## 39. Project Statistics

### Codebase Metrics (verified)
| Metric | Value |
|--------|:-----:|
| Total directories | 114 |
| Total files (excl. deps) | 395 |
| TypeScript/TSX source files | 351 |
| Total LOC (TS/TSX only) | 64,248 |
| Database models (Prisma) | 34 |
| Database tables (with enums) | 54 |
| Database migrations | 11 |
| API endpoints | 245+ |
| Frontend routes (storefront) | 22 |
| Auth routes | 7 |
| Account routes | 9 |
| Admin routes | 37+ |
| Admin modules | 37 |
| React components | ~157 |
| Zustand stores | 4 |
| Custom hooks | 26+ |
| Cloudflare Functions | 4 |
| Unit test files | 28 |
| E2E test files | 9 |
| GitHub workflows | 1 |
| Production dependencies | 25 |
| Dev dependencies | 31 |
| External services | 8 |
| Environment variables | 22 |

### Page Counts
| Category | Count |
|----------|:-----:|
| Storefront Pages | 14 (22 routes) |
| Auth Pages | 6 |
| Account Pages | 9 |
| Admin Pages | 37+ |
| **Total Pages** | **66+** |

### Component Counts
| Category | Count |
|----------|:-----:|
| UI Primitives | 16 |
| Auth Components | 2 |
| Storefront Components | 26 |
| Shared Components | 14 |
| Layout Components | 7 |
| CMS Section Components | 14 |
| Admin Components | ~40 |
| **Total Components** | **~157** |

### File Count by Directory
| Directory | Files |
|-----------|:-----:|
| `src/admin/` | ~80+ |
| `src/storefront/` | ~70+ |
| `src/components/` | ~30 |
| `src/hooks/` | 11 |
| `src/lib/` | ~30 |
| `src/types/` | 9 |
| `api/_handlers/` | 34 |
| `api/_lib/` | 44 |
| `functions/` | 4 |
| `prisma/` | ~15 |
| `scripts/` | 25 |

---

## 40. User Feature Matrix

| Feature | Guest | Customer | Admin |
|---------|:-----:|:--------:|:-----:|
| Browse Products | View | View | View |
| Product Detail | View | View | View |
| Search Products | View | View | View |
| Add to Cart | ✓ | ✓ | ✓ |
| Server Cart Sync | ✗ | ✓ | ✓ |
| Checkout | ✗ | ✓ | ✓ |
| View Orders | ✗ | Own Only | All |
| Manage Orders | ✗ | Cancel Own | Full CRUD |
| Create Reviews | ✗ | ✓ | Approve |
| Wishlist | Local | ✓ | View All |
| Address Management | ✗ | ✓ | View All |
| Profile Settings | ✗ | ✓ | Update Any |
| Support Tickets | Create | Create | Manage |
| Media Upload | ✗ | Profile Pic | Full |
| Create Products | ✗ | ✗ | ✓ |
| Edit Products | ✗ | ✗ | ✓ |
| Delete Products | ✗ | ✗ | ✓ |
| Manage Categories | ✗ | ✗ | ✓ |
| Manage Collections | ✗ | ✗ | ✓ |
| CMS Management | ✗ | ✗ | ✓ |
| View Analytics | ✗ | ✗ | ✓ |
| Manage Coupons | ✗ | ✗ | ✓ |
| Manage Customers | ✗ | ✗ | ✓ |
| Site Settings | ✗ | ✗ | ✓ |
| Media Library | ✗ | ✗ | ✓ |
| SEO Settings | ✗ | ✗ | ✓ |
| Theme Builder | ✗ | ✗ | ✓ |
| Audit Log | ✗ | ✗ | ✓ |
| Import/Export | ✗ | ✗ | ✓ |
| Search Index | ✗ | ✗ | ✓ |
| Coupon Redemptions | ✗ | ✗ | ✓ |
| Abandoned Carts | ✗ | ✗ | ✓ |
| Webhook Events | ✗ | ✗ | ✓ |
| Campaign Management | ✗ | ✗ | ✓ |
| Inventory | ✗ | ✗ | ✓ |
| FAQ Management | ✗ | ✗ | ✓ |
| Notification Templates | ✗ | ✗ | ✓ |
| Page Templates | ✗ | ✗ | ✓ |
| Brand Management | ✗ | ✗ | ✓ |
| Size Guides | View | View | CRUD |

---

## 41. Component Relationship Diagram

```
App
├── QueryClientProvider
├── BrowserRouter
├── Suspense (LoadingFallback)
├── ErrorBoundary
├── Routes
│   ├── STOREFRONT_ROUTES
│   │   └── Route[element=StorefrontLayout]
│   │       ├── Layout
│   │       │   ├── Header
│   │       │   │   ├── MegaMenu
│   │       │   │   └── SearchOverlay
│   │       │   ├── MobileNav
│   │       │   ├── BottomNav
│   │       │   ├── Outlet (page content)
│   │       │   │   ├── HomePage
│   │       │   │   │   ├── HeroCarousel
│   │       │   │   │   ├── SectionRenderer → (sections)
│   │       │   │   │   └── NewsletterForm
│   │       │   │   ├── ProductListingPage
│   │       │   │   │   ├── ProductGrid
│   │       │   │   │   │   └── ProductCard[]
│   │       │   │   │   │       ├── SafeImage
│   │       │   │   │   │       ├── PriceDisplay
│   │       │   │   │   │       └── StarRating
│   │       │   │   │   └── ProductCardSkeleton[]
│   │       │   │   ├── ProductDetailPage
│   │       │   │   │   ├── ImageGallery
│   │       │   │   │   ├── SizeSelector
│   │       │   │   │   ├── ColorSelector
│   │       │   │   │   ├── QuantitySelector
│   │       │   │   │   ├── PriceDisplay
│   │       │   │   │   ├── Reviews
│   │       │   │   │   └── RelatedProducts
│   │       │   │   ├── CartPage
│   │       │   │   │   ├── CartDrawer
│   │       │   │   │   └── EmptyState
│   │       │   │   ├── CheckoutPage
│   │       │   │   ├── WishlistPage
│   │       │   │   ├── CollectionsIndexPage
│   │       │   │   ├── CollectionPage
│   │       │   │   │   └── ProductGrid
│   │       │   │   ├── CategoryPage
│   │       │   │   ├── SearchResultsPage
│   │       │   │   │   └── ProductGrid
│   │       │   │   ├── LookbookPage
│   │       │   │   ├── LookbookDetailPage
│   │       │   │   ├── FaqPage
│   │       │   │   ├── StaticPage
│   │       │   │   ├── DashboardPage
│   │       │   │   ├── OrdersPage
│   │       │   │   ├── OrderDetailPage
│   │       │   │   ├── AddressesPage
│   │       │   │   ├── SettingsPage
│   │       │   │   ├── NotificationsPage
│   │       │   │   ├── SupportTicketsPage
│   │       │   │   ├── ReturnRequestPage
│   │       │   │   └── OrderTrackingPage
│   │       │   └── Footer
│   │       │       ├── NewsletterForm
│   │       │       └── SocialLinks
│   │       └── (ProtectedRoute for account pages)
│   ├── AUTH_ROUTES
│   │   ├── LoginPage
│   │   ├── RegisterPage
│   │   ├── ForgotPasswordPage
│   │   ├── ResetPasswordPage
│   │   └── VerifyEmailPage
│   ├── ADMIN_ROUTES
│   │   └── Route[path="admin/*"]
│   │       └── AdminRoute
│   │           └── AdminRoutes (lazy)
│   │               └── AdminLayout
│   │                   ├── DashboardPage
│   │                   ├── ProductsPage
│   │                   ├── ProductFormPage
│   │                   ├── ... (37+ admin pages)
│   └── Route[path="*"] → NotFoundPage
├── AuthLoader
├── GoogleAnalytics
├── CookieConsent
├── PwaInstallPrompt
└── Toaster
```

---

## 42. Application Flow Diagrams

### Authentication Flow
```
[Browser]                    [API Router]              [Auth Handler]           [Supabase]          [Database]
    │                            │                         │                       │                   │
    │── POST /api/auth/login ───→│                         │                       │                   │
    │                            │── dispatch("login") ───→│                       │                   │
    │                            │                         │── verifyTurnstile ───→│                   │
    │                            │                         │── signInWithPassword ─→│                   │
    │                            │                         │                       │── returns JWT ───→│
    │                            │                         │── createSession ──────────────────────────→│
    │                            │                         │── setCookies          │                   │
    │                            │                         │── logLoginAttempt ───────────────────────→│
    │←────── { user, ... } ─────│                         │                       │                   │
    │←────── Set-Cookie (3) ────│                         │                       │                   │
    │                            │                         │                       │                   │
    │── Zustand: setAuth(user)   │                         │                       │                   │
    │── Merge guest cart ───────→│── POST /api/cart/merge ─→                       │                   │
    │── Redirect to /account     │                         │                       │                   │
```

### Order Flow
```
[Customer]             [Checkout Handler]          [Razorpay]          [Database]          [Email]
    │                         │                       │                   │                  │
    │── POST /api/checkout ──→│                       │                   │                  │
    │                         │── validateCart() ────────────────────────→│                  │
    │                         │── calculateTotals() ────────────────────→│                  │
    │                         │── validateCoupon() ──────────────────────→│                  │
    │                         │── createRazorpayOrder ─→│                 │                  │
    │                         │                        │── order created  │                  │
    │                         │── createOrder() ─────────────────────────→│                  │
    │                         │── createOrderItems() ────────────────────→│                  │
    │                         │── reserveStock() ────────────────────────→│                  │
    │                         │── clearCart() ───────────────────────────→│                  │
    │←── { razorpayOrderId } ─│                       │                   │                  │
    │                         │                       │                   │                  │
    │── Razorpay Checkout ───→│                       │                   │                  │
    │                         │                       │── payment.captured│                  │
    │── POST /payments/verify→│                       │                   │                  │
    │                         │── verifySignature() ─→│                   │                  │
    │                         │── updateOrder() ─────────────────────────→│                  │
    │                         │── clearReservedStock() ──────────────────→│                  │
    │                         │── sendConfirmationEmail() ────────────────────────────────→│
    │←── { order } ──────────│                       │                   │                  │
    │                         │                       │                   │                  │
    │── View /account/orders  │                       │                   │                  │
```

### Media Upload Flow
```
[Admin Browser]        [Upload Handler]         [Cloudinary]          [Database]
    │                        │                      │                    │
    │── Select file ────────│                      │                    │
    │── POST /media/upload ─→│                      │                    │
    │   (multipart/form-data) │                      │                    │
    │                        │── validateFileType()  │                    │
    │                        │── validateFileSize()  │                    │
    │                        │── stripDoubleExt()    │                    │
    │                        │── POST /v1_1/upload ─→│                    │
    │                        │                      │── process image    │
    │                        │                      │── return { url,    │
    │                        │                      │    public_id, ... }│
    │                        │── create media_asset ─────────────────────→│
    │                        │── log audit action ──────────────────────→│
    │←── { asset } ─────────│                      │                    │
    │                        │                      │                    │
    │── Refresh media grid   │                      │                    │
```

---

## 43. Current Limitations

### Production Blockers (P0 — 6 items)
1. **13.6s TTFB** — Cold Workers boot + no Smart Placement + no Hyperdrive
2. **No observability** — Zero error monitoring, logging, tracing, or alerting
3. **Secrets in .env committed to git** — Supabase service key, Neon DB password exposed
4. **No Hyperdrive** — DB connections go through Neon pooler (150-500ms cold start)
5. **HSTS max-age=0** — Live site serves HSTS with max-age=0 despite config
6. **CSRF dead code** — validateCsrf() never called on mutation endpoints

### Missing Features
| Feature | Status |
|---------|--------|
| Multi-vendor/Seller infrastructure | Not implemented |
| Dark mode | Not implemented (1/10 score) |
| Abandoned cart recovery | Backend API exists, no automated recovery |
| Marketing admin page | Backend API exists, no frontend UI |
| Support ticket detail page | Route exists, no component (broken) |
| Checkout step progress indicator | Not implemented |
| Order tracking page | Uses Google search hack (P1 issue) |
| Loyalty/rewards program | Not implemented |
| Gift cards | Not implemented |
| Referral program | Not implemented |
| Multi-currency | Not implemented |
| International shipping | Not implemented |
| PWA offline support | Service worker exists, limited |
| Server-side rendering | Not implemented (CSR only) |
| Webhook idempotency | Not implemented (CVSS 8.5) |
| Payment webhook retry | Not implemented |
| Cart expiration/cleanup | Not implemented |
| Search analytics | Not implemented |

### Known Gaps
- **Testing:** Only 28 unit tests for 351 source files (coverage ~8%)
- **Validation:** ~95% of endpoints use raw req.json() without schema validation
- **Type Safety:** 92 `as never` + ~308 `any` annotations bypass TypeScript
- **Monolithic Files:** auth.ts (1194 lines), payments.ts (1058 lines), checkout.ts (895 lines)
- **Rate Limiting:** Falls open on KV miss (returns null instead of rejecting)
- **Email:** Silent failures (errors swallowed in try/catch)
- **Race Conditions:** No optimistic locking on variant stock
- **Partial Refund Bug:** Uses order.total instead of item calculations
- **CampaignType enum drift:** `flash_sale`, `trust_bar`, `video_banner` missing in Prisma but present in DB
- **SectionType enum drift:** Similar mismatch between schema and database

---

## 44. Future Expansion Opportunities

### Short-term (2-3 weeks)
1. **Enable CSRF validation** — infrastructure exists, just needs to be invoked
2. **Rotate exposed secrets** — remove .env from git, use Pages secrets
3. **Configure Hyperdrive** — binding exists, needs activation
4. **Add Sentry/error monitoring** — error boundaries ready for integration
5. **Fix HSTS** — ensure _headers is deployed correctly
6. **Add Zod validation** — pattern established (validateBody()), needs expansion

### Medium-term (1-2 months)
1. **Dark mode** — design tokens exist, CSS variables ready, needs implementation
2. **Abandoned cart recovery** — listing exists, needs email automation flow
3. **Checkout step indicator** — frontend component, no backend changes needed
4. **Support ticket detail page** — API exists, just needs frontend component
5. **Search engine integration** — Algolia/MeiliSearch for proper search
6. **Order tracking page** — needs carrier API integration
7. **SEO improvements** — server-rendered JSON-LD, faster middleware

### Long-term (3+ months)
1. **Multi-vendor marketplace** — requires new seller infrastructure, KYC, payouts
2. **SSR/SSG** — Next.js or similar for improved SEO and performance
3. **PWA enhancements** — full offline mode, push notifications
4. **Mobile app** — React Native or Flutter
5. **Multi-currency/international shipping**
6. **Loyalty/rewards program**
7. **AI-powered recommendations** — infrastructure in ProductRecommendations component exists

---

## 45. Glossary

| Term | Definition |
|------|------------|
| নবME (Nabome) | Bengali name combining "নব" (new) + "ME" — new self through fashion |
| D2C | Direct-to-Consumer — selling directly to customers without intermediaries |
| Storefront | The public-facing e-commerce website |
| Admin Dashboard | Backend management interface at /admin/* |
| CMS | Content Management System — manages homepage sections, pages, navigation |
| Section | A CMS content block type (hero, product grid, etc.) |
| Variant | A specific product configuration (size + color combination) |
| SKU | Stock Keeping Unit — unique identifier for each variant |
| Turnstile | Cloudflare's bot detection service (CAPTCHA replacement) |
| Hyperdrive | Cloudflare's database connection pooling and acceleration service |
| KV | Cloudflare's global key-value storage |
| Prisma | Type-safe ORM for Node.js/TypeScript |
| Neon | Serverless PostgreSQL database provider |
| Resend | Email API service for transactional emails |
| Razorpay | Indian payment gateway |
| Cloudinary | Cloud-based image/video CDN with transformations |
| Zustand | Lightweight state management library for React |
| TanStack Query | Server state management with caching |
| PWA | Progressive Web App |
| CSP | Content Security Policy |
| CSRF | Cross-Site Request Forgery |
| JWT | JSON Web Token |
| TTFB | Time to First Byte |
| ORB | Opaque Response Blocking (CORS-related browser error) |
| CVA | Class Variance Authority — for component variants |
| WCAG | Web Content Accessibility Guidelines |

---

## 46. Appendix

### A. Project Tree Summary
Total: 114 directories, 395 files, 351 TS/TSX source files, 64,248 LOC

### B. Architecture Scores Summary
| Domain | Score |
|--------|:-----:|
| Overall Architecture | 6.8/10 |
| Frontend UI/UX | 6.8/10 |
| Backend API | 6.2/10 |
| Database/Prisma | 6.9/10 |
| Security | 4.2/10 |
| Production Readiness | 3.8/10 |
| Customer Journey | 6.8/10 |
| Admin Workflow | 5.8/10 |
| Design System | 6.8/10 |

### C. Risk Register (Top 10)
| Risk | Severity | Impact |
|------|:--------:|--------|
| Auth failure takes down auth system | High | Critical |
| Payment handler failure causes revenue loss | High | Critical |
| SEO cache miss storm during traffic spike | High | High |
| CSRF not enforced on mutation endpoints | High | Critical |
| Token storage in localStorage for XSS theft | High | Critical |
| Race conditions in stock/coupon handling | High | Revenue loss |
| No webhook idempotency | High | Double payments |
| Rate limiting falls open on KV miss | High | Abuse potential |
| No error monitoring | High | Blind to failures |
| 13.6s TTFB causes user abandonment | High | Revenue loss |

### D. External Service Dependencies
```
Cloudinary ─────── Media CDN
Neon ─────────────── Database
Supabase ────────── Authentication
Resend ──────────── Email
Razorpay ────────── Payments
Google Analytics ── Analytics
Google Fonts ────── Typography
Cloudflare ──────── Hosting, CDN, Compute, Cache
```

### E. File Size Distribution (Largest Source Files)
| File | Lines |
|------|:-----:|
| api/_handlers/auth.ts | 1,194 |
| api/_handlers/payments.ts | 1,058 |
| api/_handlers/checkout.ts | 895 |
| prisma/schema.prisma | 1,417 |
| src/admin/cms/HomepageBuilder.tsx | 1,453 |
| src/lib/api/admin.ts | 451 |
| functions/_middleware.ts | 610 |
| api/[...path].ts | 665+ |
| src/styles/globals.css | 544 |
| tailwind.config.ts | 183 |

### F. API Endpoint Count by Category
| Category | Count |
|----------|:-----:|
| Public (no auth) | ~60 |
| Authenticated Customer | ~40 |
| Admin | ~145 |
| **Total** | **~245** |

### G. Handler File Count
| Type | Count |
|------|:-----:|
| Customer-facing handlers | 29 |
| Admin handlers | 33 |
| Utility modules | 44 |
| **Total handler modules** | **62** |
| **Total API files** | **~106** |

---

*This document is auto-generated from source code analysis. All information reflects the current state of the codebase as of 2026-07-13. Items marked "Not found in current codebase" indicate features absent from the existing implementation.*
