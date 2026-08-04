# নবME (Nabome) — Master Blueprint for Rebuild

> **Version:** 2.0 Blueprint  
> **Date:** July 31, 2026  
> **Status:** Pre-Implementation Analysis & Planning  
> **Purpose:** Complete reference document for rebuilding নবME from scratch

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Current Project Analysis](#2-current-project-analysis)
3. [Problems Found](#3-problems-found)
4. [Root Cause Analysis](#4-root-cause-analysis)
5. [Lessons Learned](#5-lessons-learned)
6. [Rebuild Strategy](#6-rebuild-strategy)
7. [Recommended Tech Stack](#7-recommended-tech-stack)
8. [Folder Structure](#8-folder-structure)
9. [Application Architecture](#9-application-architecture)
10. [Database Design](#10-database-design)
11. [Feature Roadmap](#11-feature-roadmap)
12. [UI/UX Principles](#12-uiux-principles)
13. [Component Strategy](#13-component-strategy)
14. [Coding Standards](#14-coding-standards)
15. [Performance Strategy](#15-performance-strategy)
16. [Security Strategy](#16-security-strategy)
17. [SEO Strategy](#17-seo-strategy)
18. [Deployment Plan](#18-deployment-plan)
19. [Future Expansion](#19-future-expansion)
20. [Complete Rebuild Checklist](#20-complete-rebuild-checklist)

---

## 1. Project Vision

### What is নবME

**নবME** (pronounced "Nabome") is a premium fashion e-commerce platform targeting the Indian market. The name combines "নব" (Bengali for "new") with "ME," symbolizing a fresh, personal approach to fashion. It is a direct-to-consumer (D2C) single-brand storefront — not a marketplace.

### Brand Identity

- **Tone:** Luxury, editorial, refined — positioned between COS minimalism and Farfetch digital
- **Typography:** Cormorant Garamond (serif display) + Manrope (sans-serif body) + Noto Serif Bengali (Bengali alt)
- **Color Palette:** Warm earth tones — primary `#8b6940`, gold accent `#c9a84c`, charcoal `#1c1c1e`
- **Aesthetic:** Editorial fashion photography, generous whitespace, subtle animations, premium card treatments
- **Tagline Direction:** "New You" / "Fresh Start" — personal transformation through fashion

### Premium Feeling Goals

- Apple-level micro-interactions and transitions (ease curve `cubic-bezier(0.22, 1, 0.36, 1)`)
- Luxury card treatments with backdrop blur, warm shadows, subtle hover lifts
- Gold accent system for premium elements (exclusive labels, CTAs, dividers)
- Editorial typography with tracked uppercase, letter-spacing tokens
- Skeleton loading with shimmer animations, not spinners
- Premium fallback gradients for failed images ("নবME PREMIUM" branded)

### Long-Term Vision

1. **Phase 1 (Now):** Premium D2C fashion storefront with full admin
2. **Phase 2 (Year 1):** Multi-category expansion (accessories, beauty, home)
3. **Phase 3 (Year 2):** Marketplace model with vendor onboarding
4. **Phase 4 (Year 3):** AI-powered personal styling, custom fashion design
5. **Phase 5 (Year 4):** International expansion, multi-currency, multi-language

### Business Goals

- Average order value: ₹3,000–5,000
- Monthly active users: 50K+ within 6 months
- Conversion rate: 2.5%+ (industry avg 1.5%)
- Cart abandonment recovery: 15%+ recovery rate
- Return rate: <8% (below fashion industry avg 25%)
- Customer retention: 35% repeat purchase within 90 days

### Customer Experience Goals

- Page load under 2 seconds (LCP)
- Checkout completed in under 3 minutes
- Search results in under 200ms
- Zero dead-end pages — every error state has a path forward
- Mobile-first experience (70%+ traffic expected from mobile)
- Wishlist-to-purchase conversion tracking
- Order tracking with real-time status updates

---

## 2. Current Project Analysis

### Architecture Overview

The current project is a **React SPA + Cloudflare Pages Functions** architecture:

```
┌─────────────────────────────────────────────────┐
│                  Cloudflare Pages                │
│                                                  │
│  ┌──────────┐  ┌────────────┐  ┌──────────────┐ │
│  │ Frontend │  │ Functions  │  │     API      │ │
│  │ (React)  │  │ (Middleware)│  │   (Workers)  │ │
│  └──────────┘  └────────────┘  └──────────────┘ │
│        │              │               │          │
│        └──────────────┼───────────────┘          │
│                       │                          │
│  ┌────────────────────┼────────────────────────┐ │
│  │            External Services                │ │
│  │  Neon DB | Supabase Auth | Razorpay        │ │
│  │  Cloudinary | Resend | Turnstile            │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Current Folder Structure

```
nabome/
├── api/                          # Backend API (Cloudflare Workers)
│   ├── _handlers/               # 34 handler modules
│   │   ├── auth.ts             # 1,194 lines (monolithic)
│   │   ├── payments.ts         # 1,058 lines (monolithic)
│   │   ├── checkout.ts
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── cart.ts
│   │   ├── wishlist.ts
│   │   ├── reviews.ts
│   │   ├── search.ts
│   │   ├── addresses.ts
│   │   ├── brands.ts
│   │   ├── campaigns.ts
│   │   ├── categories.ts
│   │   ├── cms.ts
│   │   ├── collections.ts
│   │   ├── contact.ts
│   │   ├── coupons.ts
│   │   ├── dashboard.ts
│   │   ├── data-export.ts
│   │   ├── engagement.ts
│   │   ├── invoices.ts
│   │   ├── lookbooks.ts
│   │   ├── notifications.ts
│   │   ├── referral.ts
│   │   ├── refunds.ts
│   │   ├── returns.ts
│   │   ├── security-dashboard.ts
│   │   ├── settings.ts
│   │   ├── size-guides.ts
│   │   ├── support.ts
│   │   ├── tags.ts
│   │   ├── upload.ts
│   │   └── admin/             # Admin-specific handlers
│   ├── _lib/                   # 45 utility modules
│   │   ├── prisma.ts
│   │   ├── auth-middleware.ts
│   │   ├── cache.ts
│   │   ├── cookies.ts
│   │   ├── csrf.ts
│   │   ├── email.ts
│   │   ├── email-templates.ts
│   │   ├── env.ts
│   │   ├── logger.ts
│   │   ├── rate-limit.ts
│   │   ├── response.ts
│   │   ├── sanitize.ts
│   │   ├── validate.ts
│   │   ├── transaction.ts
│   │   ├── turnstile.ts
│   │   ├── http-headers.ts
│   │   ├── security-headers.ts
│   │   ├── pagination.ts
│   │   ├── permissions.ts
│   │   ├── openapi.ts
│   │   └── ... (25+ more)
│   ├── [...path].ts             # Catch-all API router
│   └── health.ts
├── functions/                    # Cloudflare Pages Functions
│   ├── _middleware.ts           # 610 lines (SEO middleware)
│   ├── api/robots.txt.ts
│   ├── robots.txt.ts
│   └── sitemap.xml.ts
├── src/                          # Frontend (React SPA)
│   ├── app/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── routes.tsx
│   ├── admin/                    # Admin panel (37+ modules)
│   │   ├── AdminRoutes.tsx
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── categories/
│   │   ├── collections/
│   │   ├── brands/
│   │   ├── coupons/
│   │   ├── cms/
│   │   ├── media/
│   │   ├── analytics/
│   │   ├── settings/
│   │   ├── reviews/
│   │   ├── inventory/
│   │   ├── returns/
│   │   ├── lookbooks/
│   │   ├── size-guides/
│   │   ├── labels/
│   │   ├── faq/
│   │   ├── contacts/
│   │   ├── announcements/
│   │   ├── campaigns/
│   │   ├── abandoned-carts/
│   │   ├── newsletter/
│   │   ├── notifications/
│   │   ├── support/
│   │   ├── seo/
│   │   ├── theme/
│   │   ├── social/
│   │   ├── webhooks/
│   │   ├── import-export/
│   │   ├── search/
│   │   ├── audit-log/
│   │   ├── auth/
│   │   ├── wishlists/
│   │   └── templates/
│   ├── storefront/               # Customer-facing features
│   │   ├── components/          # 24+ storefront components
│   │   ├── hooks/               # 13 storefront hooks
│   │   ├── layout/              # 7 layout components
│   │   ├── pages/               # 23 storefront pages
│   │   ├── sections/            # 14 CMS section types
│   │   ├── store/               # Connectivity store
│   │   └── stores/              # Cart & UI stores
│   ├── components/               # Shared components
│   │   ├── ui/                  # 15 UI primitives
│   │   ├── auth/
│   │   └── ... (14 shared components)
│   ├── hooks/                    # Global hooks
│   ├── lib/                      # Utilities
│   │   ├── api/                 # API client modules
│   │   ├── media/               # Cloudinary media services
│   │   ├── razorpay/            # Payment integration
│   │   ├── security/
│   │   ├── utils/
│   │   └── ... (10+ utility files)
│   ├── pages/                    # Auth pages (7)
│   ├── stores/                   # Global Zustand stores
│   ├── styles/                   # Global CSS
│   ├── types/                    # TypeScript types
│   └── cms/                      # CMS core types
├── prisma/
│   ├── schema.prisma            # 34 models, 1,422 lines
│   └── seed/
├── e2e/                          # Playwright E2E tests
├── scripts/                      # 25 utility scripts
├── public/                       # Static assets
└── dist/                         # Build output
```

### Technologies Used

| Category | Technology | Version |
|----------|-----------|---------|
| Frontend Framework | React | 19.1.0 |
| Routing | React Router | v7.5.0 |
| Build Tool | Vite | 6.3.2 |
| Language | TypeScript | 5.8.3 |
| Styling | Tailwind CSS | 3.4.17 |
| State Management | Zustand | 5.0.3 |
| Server State | TanStack React Query | 5.75.5 |
| Animations | Framer Motion | 12.9.2 |
| Icons | Lucide React | 0.510.0 |
| Validation | Zod | 3.24.4 |
| Class Utilities | clsx + tailwind-merge + CVA | various |
| Backend Runtime | Cloudflare Pages Functions | Edge |
| Database | PostgreSQL (Neon Serverless) | - |
| ORM | Prisma | 6.6.0 |
| Auth | Supabase Auth | - |
| Payments | Razorpay | - |
| Email | Resend | - |
| Media/CDN | Cloudinary | - |
| Bot Protection | Cloudflare Turnstile | - |
| Logging | Pino | 10.3.1 |
| Unit Testing | Vitest | 4.1.9 |
| E2E Testing | Playwright | 1.61.1 |
| Linting | ESLint | 10.6.0 |
| CSS Processing | PostCSS + Autoprefixer | - |
| CSS Bundler | LightningCSS | 1.32.0 |

### Database Usage

- **Provider:** PostgreSQL via Neon serverless
- **ORM:** Prisma with foreign key relations
- **Extensions:** `pg_trgm` (trigram full-text search)
- **Models:** 34 (profiles, products, orders, cart, reviews, etc.)
- **Migrations:** 11 sequential migrations
- **Indexes:** 80+ declared indexes
- **Transactions:** 22+ transaction boundaries across 14 handler files
- **Query Pattern:** 200+ Prisma queries, zero raw SQL

### Authentication Flow

1. Supabase Auth handles email/password registration and login
2. Custom session management in `auth_sessions` table
3. Access token + refresh token stored in httpOnly cookies
4. Session rotation on sensitive operations
5. CSRF double-submit cookie pattern (exists but not enforced)
6. Rate limiting on auth endpoints (20 req/min via KV)
7. Turnstile CAPTCHA on login/register forms

### External Services

| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| Neon PostgreSQL | Database | `@neondatabase/serverless` + Prisma adapter |
| Supabase | Authentication | `@supabase/supabase-js` |
| Razorpay | Payments | Client SDK + Server API |
| Cloudinary | Image/Video CDN | REST API + client-side upload |
| Resend | Transactional email | REST API |
| Cloudflare Turnstile | Bot protection | Client widget + server verify |
| Cloudflare Pages | Hosting/Edge | `wrangler` CLI |
| Google Analytics | Analytics | gtag.js |

---

## 3. Problems Found

### 3.1 Architecture Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| A1 | Monolithic auth handler (1,194 lines) | Critical | `api/_handlers/auth.ts` |
| A2 | Monolithic payment handler (1,058 lines) | Critical | `api/_handlers/payments.ts` |
| A3 | Monolithic checkout page (956 lines) | High | `src/storefront/pages/CheckoutPage.tsx` |
| A4 | Monolithic homepage builder (1,453 lines) | High | `src/admin/cms/HomepageBuilder.tsx` |
| A5 | Duplicate AdminRoute wrapping | Medium | `src/app/routes.tsx:94` + `AdminRoutes.tsx:115` |
| A6 | In-memory SEO cache not shared across isolates | High | `functions/_middleware.ts:24` |
| A7 | API string-based action dispatch (no type safety) | Medium | `api/[...path].ts` |
| A8 | getEnv() scattered across handlers | Medium | Throughout `api/_handlers/` |
| A9 | API client bypasses Zustand for auth tokens | Medium | `src/lib/api/client.ts` |
| A10 | Module-level global state in API client | Medium | `src/lib/api/client.ts` |

### 3.2 Security Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| S1 | Production secrets committed to `.env` in git | Critical | `.env` |
| S2 | CSRF verification imported but never called | Critical | `api/_lib/csrf.ts` |
| S3 | JWT tokens stored in localStorage | High | `src/stores/auth-store.ts` |
| S4 | 95% of endpoints use raw `req.json()` without validation | Critical | All handlers |
| S5 | Rate limiting falls open on KV miss | High | `api/_lib/rate-limit.ts` |
| S6 | Timing-safe comparison not used on email change token | Medium | `api/_handlers/auth.ts:1206` |
| S7 | JSON-LD injection risk in middleware | High | `functions/_middleware.ts:273` |
| S8 | No webhook idempotency for payment events | Critical | `api/_handlers/payments.ts` |
| S9 | CSP weakened by `unsafe-inline` | Medium | Security headers |
| S10 | 92 `as never` + ~308 `any` type bypasses | Medium | Throughout codebase |

### 3.3 Payment Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| P1 | Webhook returns 200 for failed events | Critical | `payments.ts:1050` |
| P2 | Race condition in webhook deduplication | High | `payments.ts:944-998` |
| P3 | `releaseReservedInventory` uses `as any` cast | Medium | `payments.ts:296` |
| P4 | Silent empty catch blocks for email failures | Medium | `payments.ts:645, 709` |
| P5 | Partial refund uses `order.total` instead of item calc | Medium | `payments.ts` |

### 3.4 Frontend Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| F1 | CheckoutPage is a 956-line monolith | High | `CheckoutPage.tsx` |
| F2 | 17+ `as string`/`as number` casts on product data | Medium | `ProductDetailPage.tsx` |
| F3 | `document.title` bypasses React Helmet | Low | `HomePage.tsx:45` |
| F4 | No retry mechanism on error states | Medium | `HomePage.tsx:133-198` |
| F5 | Scroll listener not throttled in Header | Medium | `Header.tsx:58` |
| F6 | Brand flip animation could be disorienting | Low | `Header.tsx:87-93` |
| F7 | Guest email fallback to fake email | Low | `CheckoutPage.tsx:223` |
| F8 | Settings typed as `Record<string, unknown>` | Medium | `HomePage.tsx:24` |
| F9 | Inconsistent Suspense wrapping in account routes | Medium | `routes.tsx:64-73` |
| F10 | No loading fallback for lazy admin pages | Medium | `AdminRoutes.tsx:17-63` |

### 3.5 CSS Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| C1 | Missing `h6` in heading font selector | Low | `globals.css:36` |
| C2 | Deprecated `::-moz-selection` | Low | `globals.css:44` |
| C3 | Duplicated focus-visible ring on all 5 button variants | Low | `globals.css:146-206` |
| C4 | `border-0` redundant in `.input-search:focus-visible` | Low | `globals.css:236` |
| C5 | Desktop premium overrides outside `@layer` | Low | `globals.css:332-379` |
| C6 | Dual class system (CVA components + CSS utility classes) | Medium | Throughout |

### 3.6 Data & Validation Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| D1 | Inconsistent password rules between register and reset | Medium | `validators.ts:12-18 vs 29-35` |
| D2 | `z.any()` used for CMS content validation | High | `validators.ts:158,182,192,261` |
| D3 | No maximum length on password | Medium | `validators.ts:12` |
| D4 | No email normalization in Zod schemas | Low | `validators.ts` |
| D5 | Constant duplication (UPLOAD_MAX_SIZE, ITEMS_PER_PAGE) | Low | `constants.ts` |
| D6 | Schema drift (CampaignType/SectionType enums out of sync) | High | `schema.prisma` |

### 3.7 Performance Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| PF1 | 13.6s TTFB on cold start | Critical | Infrastructure |
| PF2 | No Hyperdrive for database connections | High | Infrastructure |
| PF3 | DB query on every HTML request (10s cache TTL) | High | `functions/_middleware.ts:311` |
| PF4 | `findSupabaseUserByEmail` paginates ALL users | High | `auth.ts:1587-1610` |
| PF5 | No request deduplication for GET requests | Medium | `src/lib/api/client.ts` |
| PF6 | 322KB main chunk, 114KB CSS | Medium | Bundle analysis |

### 3.8 Testing Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| T1 | Near-zero test coverage (28 tests for 351 source files) | Critical | Entire codebase |
| T2 | No API handler unit tests | Critical | `api/_handlers/` |
| T3 | No integration tests | High | - |
| T4 | E2E tests exist but not comprehensive | Medium | `e2e/` |

### 3.9 Code Quality Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| Q1 | 589 console.log/warn statements (mostly DEV-guarded) | Low | Throughout |
| Q2 | Duplicated verification code generation (7x) | Medium | `auth.ts` |
| Q3 | Duplicated lockout/attempt logic | Medium | `auth.ts` |
| Q4 | Duplicated Razorpay key retrieval (3x) | Low | `payments.ts` |
| Q5 | Duplicated settings access pattern in storefront | Medium | Multiple pages |
| Q6 | IIFE in JSX for footer links | Low | `Footer.tsx:151-158` |
| Q7 | Over-exports in media barrel file (150+ symbols) | Low | `src/lib/media/index.ts` |
| Q8 | Split hooks directories (src/hooks/ vs src/storefront/hooks/) | Low | Structure |

### 3.10 SEO Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| SEO1 | SPA fallback serves 404 pages with 200 status | High | `functions/_middleware.ts:560-572` |
| SEO2 | In-memory SEO cache not shared across isolates | High | `functions/_middleware.ts:24` |
| SEO3 | Duplicate auth routes (`/login` and `/auth/login`) | Medium | `routes.tsx` |
| SEO4 | Structured data not server-rendered | Medium | Client-side only |

### 3.11 DevOps Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| DO1 | No error monitoring (Sentry, etc.) | Critical | Infrastructure |
| DO2 | No preview/staging deployments | High | Infrastructure |
| DO3 | HSTS max-age=0 on live site | High | Configuration |
| DO4 | No abandoned cart recovery automation | High | Business logic |
| DO5 | No automated email notification system | High | Business logic |

---

## 4. Root Cause Analysis

### A1: Monolithic Auth Handler (1,194 lines)

**Why it happened:** Auth logic accumulated incrementally — registration, login, password reset, email verification, session management, profile updates were all added to the same file over time without refactoring.

**How it affects development:** Extremely difficult to navigate, debug, or modify any single auth feature. Changes to login could inadvertently break registration. No single developer can hold the entire file in working memory.

**How it affects users:** Bugs in auth are harder to find and fix. Security vulnerabilities may hide in the complexity. Feature development slows down.

**How serious:** Critical — this is the highest-risk module in the codebase.

**Priority:** P0

**Recommended fix:** Split into domain-specific modules: `auth.registration.ts`, `auth.login.ts`, `auth.sessions.ts`, `auth.password-reset.ts`, `auth.email-verification.ts`, `auth.profile.ts`, `auth.supabase.ts`.

---

### S2: CSRF Dead Code

**Why it happened:** CSRF infrastructure was implemented (double-submit cookie pattern) but never wired into the auth middleware. Likely forgotten during a refactor or disabled during development and never re-enabled.

**How it affects development:** Developers think CSRF is protected because the code exists. The false sense of security is worse than having no CSRF code at all.

**How it affects users:** All state-changing endpoints (login, checkout, cart, address changes) are vulnerable to cross-site request forgery attacks.

**How serious:** Critical — CVSS 9.0.

**Priority:** P0

**Recommended fix:** Enable CSRF validation on all mutation endpoints. Create a middleware that automatically validates CSRF tokens on POST/PUT/DELETE/PATCH requests.

---

### S3: Auth Tokens in localStorage

**Why it happened:** Supabase's default client library stores tokens in localStorage. The team chose convenience over security, likely during early prototyping.

**How it affects development:** Switching to httpOnly cookies requires rewriting the entire auth flow — Supabase client config, API client, auth store, and all protected routes.

**How it affects users:** Any XSS vulnerability (even in a third-party script) can steal auth tokens. Session hijacking becomes trivial.

**How serious:** High — CVSS 8.5.

**Priority:** P0

**Recommended fix:** Migrate to httpOnly cookies for token storage. Use Supabase's `cookie` storage option or implement custom session management with httpOnly cookies.

---

### P1: Webhook Returns 200 for Failed Events

**Why it happened:** The webhook handler wraps all logic in a try/catch that returns `success()` (200) regardless of the outcome. This was likely intended to prevent Razorpay retries but creates a worse problem.

**How it affects development:** Failed payment events are silently lost. No retry mechanism exists. Debugging payment issues requires manually checking Razorpay dashboard.

**How it affects users:** Orders may not be confirmed after successful payment. Users pay but don't receive order confirmation.

**How serious:** Critical — directly impacts revenue.

**Priority:** P0

**Recommended fix:** Return 500 (or non-2xx) when webhook processing fails. Implement idempotency keys using `webhook_events` table to prevent duplicate processing.

---

### PF1: 13.6s TTFB on Cold Start

**Why it happened:** Cloudflare Workers cold start + no Smart Placement + no Hyperdrive + Neon connection establishment = compounded latency. The in-memory SEO cache also doesn't help on first request after cold start.

**How it affects development:** Developers may not notice because dev server is always warm. Production users on first visit get extremely slow page loads.

**How it affects users:** 13.6 seconds before any content appears. Most users will bounce. Google PageSpeed score tanks.

**How serious:** Critical — directly impacts revenue and SEO.

**Priority:** P0

**Recommended fix:** Enable Cloudflare Smart Placement, create Hyperdrive binding to Neon, implement worker warming via cron trigger, increase cache TTL.

---

### T1: Near-Zero Test Coverage

**Why it happened:** Rapid feature development prioritized shipping over testing. No testing culture or CI enforcement. The 28 existing tests are minimal and don't cover critical paths.

**How it affects development:** Every change is a gamble. Refactoring is terrifying. Bug fixes may introduce new bugs. Developer confidence is low.

**How it affects users:** More bugs reach production. Regression bugs are common. Quality degrades over time.

**How serious:** Critical — this is the root cause of many other issues.

**Priority:** P0

**Recommended fix:** Implement testing strategy from Phase 1: unit tests for utilities, integration tests for API handlers, E2E tests for critical user flows. Enforce coverage gates in CI.

---

### D2: `z.any()` for CMS Content

**Why it happened:** CMS content is flexible (JSON blobs with varying structures). The team chose convenience over validation, allowing arbitrary JSON to pass through.

**How it affects development:** No type safety for CMS content. Any malformed data silently passes validation and may cause runtime errors in rendering.

**How it affects users:** CMS editors can save invalid data that breaks page rendering. No guardrails against accidental corruption.

**How serious:** High — can cause production outages.

**Priority:** P1

**Recommended fix:** Define strict Zod schemas for each CMS content type. Use discriminated unions for section types. Add content validation on save.

---

### S8: No Webhook Idempotency

**Why it happened:** Razorpay guarantees at-least-once delivery but the team assumed exactly-once delivery. The `webhook_events` table exists but is not used for deduplication during processing.

**How it affects development:** Payment processing logic must be idempotent, but it's not. Each webhook event is processed independently.

**How it affects users:** Duplicate order confirmations, duplicate inventory deductions, duplicate charges (on refund processing).

**How serious:** Critical — can cause financial loss.

**Priority:** P0

**Recommended fix:** Implement idempotency key check at the start of webhook processing. Use `webhook_events.eventId` to detect duplicates. Skip processing if already handled.

---

### SEO1: SPA Fallback Serves 404 as 200

**Why it happened:** The SPA fallback in `functions/_middleware.ts` catches all 404 responses and serves `index.html` with status 200. This is the standard SPA approach but hurts SEO.

**How it affects development:** Developers don't notice because the app works. But search engines index 404 pages as valid content.

**How it affects users:** Users who land on broken URLs see the SPA render instead of a proper 404 page. Search engines dilute page authority with phantom pages.

**How serious:** High — hurts SEO ranking.

**Priority:** P1

**Recommended fix:** Serve the SPA fallback but with proper 404 status for truly missing routes. Use server-side routing to distinguish between SPA routes and truly missing pages.

---

## 5. Lessons Learned

### What Should Never Be Repeated

1. **Never create monolithic handlers.** Any file over 300 lines should be split. Auth, payments, and checkout should each be 5-10 focused modules.

2. **Never skip request validation.** Every API endpoint must validate input with Zod before processing. No `req.json()` without validation.

3. **Never store secrets in client-accessible code.** No `localStorage` for tokens. No `VITE_` prefix for secrets. Use httpOnly cookies exclusively.

4. **Never ship code without tests.** Critical paths (auth, payments, checkout, orders) must have 100% test coverage before any feature work.

5. **Never implement CSRF as dead code.** If the infrastructure exists, enforce it. Default to security, not convenience.

6. **Never use in-memory caching on edge platforms.** Cloudflare Workers have isolated isolates. Use KV or Durable Objects for shared state.

7. **Never return 200 for failed webhook events.** Always return non-2xx to trigger retries. Implement idempotency keys.

8. **Never use `z.any()` for user-facing content.** Every piece of data that touches the UI must be validated.

9. **Never build without error monitoring from day one.** Sentry or equivalent must be integrated before the first deployment.

10. **Never let CSS drift into dual systems.** Choose one approach (Tailwind utility classes OR CSS modules OR CSS-in-JS) and enforce it.

### What Architectural Mistakes to Avoid

- String-based API routing without type safety
- Global module-level state shared across concurrent requests
- Environment variable scattering (every handler calling `getEnv()`)
- Duplicate auth checking (AdminRoute wrapping twice)
- Client-side SEO meta injection without server-side fallback
- Monolithic page components with 20+ state variables
- Split hooks directories (global vs feature-specific)
- Over-exports in barrel files hurting tree-shaking
- Barrel files for internal modules (use direct imports)
- Lazy loading every admin page independently (creates too many chunks)

### What Design Mistakes to Avoid

- Dual button systems (CVA components + CSS utility classes)
- Dark mode as an afterthought (should be designed from day one)
- CSS vars that don't affect Tailwind classes
- Accessibility as a final checklist item (build it in from the start)
- Mobile as a responsive breakpoint (design mobile-first)
- No skeleton loading states (users see spinners instead of content shapes)
- Brand flip animation that runs every 4 seconds (distracting)
- Premium fallback that shows only on error (should also show on loading)

### What Coding Mistakes to Avoid

- `as any` type assertions (use proper typing)
- `void logAction()` fire-and-forget without error handling
- `ctx.env!` non-null assertions without checks
- String comparison for security tokens (use timing-safe comparison)
- O(n) pagination through all users to find one by email
- Duplicated logic extracted into helpers only after it's already duplicated
- Console statements in production code
- IIFEs in JSX for computed values
- Missing useEffect dependencies
- Unthrottled scroll listeners

---

## 6. Rebuild Strategy

### Core Principles

1. **Incremental development** — Build one feature fully before moving to the next
2. **Feature-first approach** — Each feature is self-contained with its own components, hooks, API, and tests
3. **Atomic components** — Every component does one thing well
4. **Clean architecture** — Clear boundaries between presentation, business logic, and data access
5. **Test-driven** — Write tests before or alongside implementation
6. **Security-first** — Every endpoint validates input, authenticates, and authorizes

### Development Phases

```
Phase 1: Foundation          (Week 1-2)
  → Project setup, design system, database schema, API framework
  
Phase 2: Authentication      (Week 3)
  → Registration, login, sessions, password reset, email verification
  
Phase 3: Store               (Week 4-5)
  → Product catalog, categories, collections, search, filtering
  
Phase 4: Cart                (Week 6)
  → Add to cart, quantity management, persistence, sync
  
Phase 5: Checkout            (Week 7)
  → Address management, payment (Razorpay), order creation
  
Phase 6: Orders              (Week 8)
  → Order history, tracking, returns, refunds
  
Phase 7: Admin               (Week 9-11)
  → Dashboard, product CRUD, order management, CMS, settings
  
Phase 8: Analytics           (Week 12)
  → Event tracking, dashboard charts, conversion metrics
  
Phase 9: Optimization        (Week 13)
  → Performance, caching, SEO, accessibility audit
  
Phase 10: Production         (Week 14)
  → Error monitoring, deployment, CI/CD, documentation
```

### Git Workflow

```
main                    ← Production (auto-deploy)
├── develop             ← Integration branch (auto-deploy to staging)
│   ├── feature/auth    ← Feature branches
│   ├── feature/cart
│   ├── feature/checkout
│   ├── feature/admin
│   └── fix/bug-name    ← Bug fix branches
└── release/v1.0.0      ← Release branches (optional)
```

**Branch Naming:**
- `feature/<domain>-<description>` — e.g., `feature/auth-login`
- `fix/<domain>-<description>` — e.g., `fix/checkout-total`
- `refactor/<domain>-<description>` — e.g., `refactor/api-handlers`
- `chore/<description>` — e.g., `chore/update-deps`

**Commit Convention:**
```
feat(auth): add login endpoint with Supabase integration
fix(cart): prevent duplicate items when variant changes
refactor(api): split auth handler into domain modules
test(checkout): add integration tests for payment flow
chore(deps): update Prisma to 7.0
```

### Versioning

- **Semantic Versioning:** `MAJOR.MINOR.PATCH`
- **MAJOR:** Breaking changes (API contract, database schema)
- **MINOR:** New features (non-breaking)
- **PATCH:** Bug fixes

---

## 7. Recommended Tech Stack

### Frontend

| Technology | Choice | Why |
|-----------|--------|-----|
| Framework | React 19 | Mature ecosystem, excellent DX, concurrent features |
| Routing | TanStack Router | Type-safe routes, built-in search params, loader support |
| Styling | Tailwind CSS 4 | Utility-first, design token integration, excellent performance |
| State (Client) | Zustand | Minimal API, no providers, excellent TypeScript support |
| State (Server) | TanStack Query v5 | Caching, deduplication, background refetch, optimistic updates |
| Animations | Framer Motion | Declarative animations, layout animations, gesture support |
| Forms | React Hook Form + Zod | Performant validation, minimal re-renders |
| Icons | Lucide React | Consistent, tree-shakeable, comprehensive |
| SEO | React Helmet Async | Server-rendered meta tags via middleware |

### Backend

| Technology | Choice | Why |
|-----------|--------|-----|
| Runtime | Cloudflare Pages Functions | Edge execution, zero cold starts with warming |
| API Pattern | RESTful with type-safe handlers | Simplicity, cacheability, industry standard |
| Validation | Zod | Shared schemas between frontend and backend |
| ORM | Prisma | Type safety, migration management, excellent DX |
| Auth | Custom + Supabase Auth | Full control over session management, httpOnly cookies |
| Email | Resend | Simple API, excellent deliverability, React Email templates |
| Payments | Razorpay | India-focused, comprehensive payment methods |
| Media | Cloudinary | Image optimization, transformations, CDN |
| Bot Protection | Cloudflare Turnstile | Free, privacy-friendly, invisible to users |
| Logging | Pino | Fast, structured, JSON output |

### Database

| Technology | Choice | Why |
|-----------|--------|-----|
| Database | PostgreSQL (Neon) | Serverless, branching, excellent Prisma support |
| Connection | Hyperdrive | Cloudflare-native connection pooling, reduces latency |
| Caching | Cloudflare KV | Edge caching for read-heavy data |
| Full-text Search | PostgreSQL `pg_trgm` | No additional service needed, good enough for MVP |

### DevOps

| Technology | Choice | Why |
|-----------|--------|-----|
| Hosting | Cloudflare Pages | Global edge, free tier, excellent DX |
| CI/CD | GitHub Actions | Native GitHub integration, free for public repos |
| Error Monitoring | Sentry | Industry standard, excellent React integration |
| Analytics | Plausible or PostHog | Privacy-focused, lightweight |
| Package Manager | pnpm | Fast, disk-efficient, strict dependency resolution |
| Linting | ESLint 9 + Prettier | Consistent code style |
| Testing | Vitest + Playwright | Fast unit tests, reliable E2E |
| TypeScript | Strict mode | Maximum type safety |

### Why NOT to Use

- **Next.js:** Overkill for SPA on Cloudflare Pages. React Router v7 + Vite is simpler.
- **Supabase Database:** We're using Neon for PostgreSQL. Supabase is auth-only.
- **MongoDB:** PostgreSQL is better for relational e-commerce data.
- **Redis:** Cloudflare KV serves the same purpose at the edge.
- **Stripe:** Razorpay is the standard for Indian e-commerce.
- **Auth0/Clerk:** Overkill for single-brand D2C. Custom auth with Supabase is sufficient.
- **GraphQL:** REST is simpler, more cacheable, and sufficient for this scale.

---

## 8. Folder Structure

```
nabome/
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI/CD pipeline
├── api/                              # Backend API handlers
│   ├── _lib/                         # Shared API utilities
│   │   ├── auth/
│   │   │   ├── middleware.ts         # Auth middleware (authenticate, authorize)
│   │   │   ├── session.ts           # Session management
│   │   │   ├── supabase.ts          # Supabase client
│   │   │   └── tokens.ts           # Token generation, hashing
│   │   ├── validation/
│   │   │   ├── schemas.ts          # Shared Zod schemas
│   │   │   └── middleware.ts       # Request validation middleware
│   │   ├── security/
│   │   │   ├── csrf.ts             # CSRF protection
│   │   │   ├── rate-limit.ts       # Rate limiting (KV)
│   │   │   ├── turnstile.ts       # Bot protection
│   │   │   ├── sanitize.ts        # Input sanitization
│   │   │   └── headers.ts        # Security headers
│   │   ├── database/
│   │   │   ├── client.ts          # Prisma client singleton
│   │   │   ├── transaction.ts     # Transaction helpers
│   │   │   └── connection.ts     # Connection pooling
│   │   ├── email/
│   │   │   ├── client.ts          # Resend client
│   │   │   ├── templates/        # Email templates
│   │   │   └── send.ts          # Send helpers
│   │   ├── storage/
│   │   │   ├── cloudinary.ts     # Cloudinary service
│   │   │   └── upload.ts        # Upload helpers
│   │   ├── payments/
│   │   │   ├── razorpay.ts       # Razorpay client
│   │   │   └── webhooks.ts      # Webhook verification
│   │   ├── cache/
│   │   │   ├── kv.ts             # KV caching helpers
│   │   │   └── strategies.ts    # Cache invalidation
│   │   ├── logging/
│   │   │   ├── logger.ts         # Pino logger
│   │   │   └── audit.ts         # Audit logging
│   │   ├── response.ts           # Standardized responses
│   │   ├── errors.ts             # Error classes
│   │   ├── pagination.ts         # Pagination helpers
│   │   ├── env.ts                # Environment validation
│   │   └── types.ts              # Shared API types
│   ├── _handlers/                   # API endpoint handlers
│   │   ├── auth/
│   │   │   ├── register.ts
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   ├── refresh.ts
│   │   │   ├── password-reset.ts
│   │   │   ├── email-verification.ts
│   │   │   ├── email-change.ts
│   │   │   └── profile.ts
│   │   ├── products/
│   │   │   ├── list.ts
│   │   │   ├── detail.ts
│   │   │   ├── search.ts
│   │   │   ├── variants.ts
│   │   │   └── reviews.ts
│   │   ├── cart/
│   │   │   ├── get.ts
│   │   │   ├── add.ts
│   │   │   ├── update.ts
│   │   │   ├── remove.ts
│   │   │   └── sync.ts
│   │   ├── checkout/
│   │   │   ├── create-order.ts
│   │   │   ├── verify-payment.ts
│   │   │   └── guest.ts
│   │   ├── orders/
│   │   │   ├── list.ts
│   │   │   ├── detail.ts
│   │   │   ├── tracking.ts
│   │   │   ├── cancel.ts
│   │   │   └── return-request.ts
│   │   ├── wishlist/
│   │   │   ├── list.ts
│   │   │   ├── add.ts
│   │   │   └── remove.ts
│   │   ├── addresses/
│   │   │   ├── list.ts
│   │   │   ├── create.ts
│   │   │   ├── update.ts
│   │   │   └── delete.ts
│   │   ├── webhooks/
│   │   │   ├── razorpay.ts
│   │   │   └── handlers.ts
│   │   └── admin/                   # Admin-specific handlers
│   │       ├── dashboard.ts
│   │       ├── products.ts
│   │       ├── orders.ts
│   │       ├── customers.ts
│   │       ├── categories.ts
│   │       ├── collections.ts
│   │       ├── brands.ts
│   │       ├── coupons.ts
│   │       ├── campaigns.ts
│   │       ├── cms.ts
│   │       ├── media.ts
│   │       ├── settings.ts
│   │       ├── analytics.ts
│   │       ├── reviews.ts
│   │       ├── returns.ts
│   │       ├── inventory.ts
│   │       ├── lookbooks.ts
│   │       ├── size-guides.ts
│   │       ├── faq.ts
│   │       ├── contacts.ts
│   │       ├── newsletter.ts
│   │       ├── notifications.ts
│   │       ├── webhooks.ts
│   │       └── export.ts
│   ├── [...path].ts                  # Catch-all API router
│   └── health.ts                     # Health check endpoint
├── functions/                        # Cloudflare Pages Functions
│   ├── _middleware.ts                # SEO + security middleware
│   ├── api/
│   │   ├── robots.txt.ts
│   │   └── sitemap.xml.ts
│   └── robots.txt.ts
├── src/                              # Frontend (React SPA)
│   ├── app/
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Entry point
│   │   ├── providers.tsx             # All providers composed
│   │   └── routes.tsx                # Route definitions
│   ├── features/                     # Feature-first modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   ├── ResetPasswordForm.tsx
│   │   │   │   ├── VerifyEmailForm.tsx
│   │   │   │   └── AuthLayout.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useSession.ts
│   │   │   ├── api/
│   │   │   │   └── auth.ts
│   │   │   ├── store/
│   │   │   │   └── auth-store.ts
│   │   │   └── types.ts
│   │   ├── products/
│   │   │   ├── components/
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProductGrid.tsx
│   │   │   │   ├── ProductDetail.tsx
│   │   │   │   ├── VariantSelector.tsx
│   │   │   │   ├── ImageGallery.tsx
│   │   │   │   ├── Reviews.tsx
│   │   │   │   └── RelatedProducts.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts
│   │   │   │   ├── useProduct.ts
│   │   │   │   └── useReviews.ts
│   │   │   ├── api/
│   │   │   │   └── products.ts
│   │   │   └── types.ts
│   │   ├── cart/
│   │   │   ├── components/
│   │   │   │   ├── CartDrawer.tsx
│   │   │   │   ├── CartItem.tsx
│   │   │   │   ├── CartSummary.tsx
│   │   │   │   └── EmptyCart.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCart.ts
│   │   │   ├── store/
│   │   │   │   └── cart-store.ts
│   │   │   ├── api/
│   │   │   │   └── cart.ts
│   │   │   └── types.ts
│   │   ├── checkout/
│   │   │   ├── components/
│   │   │   │   ├── CheckoutLayout.tsx
│   │   │   │   ├── ShippingStep.tsx
│   │   │   │   ├── PaymentStep.tsx
│   │   │   │   ├── ReviewStep.tsx
│   │   │   │   ├── OrderConfirmation.tsx
│   │   │   │   └── AddressForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCheckout.ts
│   │   │   ├── api/
│   │   │   │   └── checkout.ts
│   │   │   └── types.ts
│   │   ├── orders/
│   │   │   ├── components/
│   │   │   │   ├── OrderList.tsx
│   │   │   │   ├── OrderDetail.tsx
│   │   │   │   ├── OrderTracking.tsx
│   │   │   │   └── ReturnRequest.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useOrders.ts
│   │   │   ├── api/
│   │   │   │   └── orders.ts
│   │   │   └── types.ts
│   │   ├── search/
│   │   │   ├── components/
│   │   │   │   ├── SearchOverlay.tsx
│   │   │   │   ├── SearchResults.tsx
│   │   │   │   └── TrendingSearches.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSearch.ts
│   │   │   ├── api/
│   │   │   │   └── search.ts
│   │   │   └── types.ts
│   │   ├── wishlist/
│   │   │   ├── components/
│   │   │   │   ├── WishlistButton.tsx
│   │   │   │   └── WishlistPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWishlist.ts
│   │   │   └── api/
│   │   │       └── wishlist.ts
│   │   ├── admin/                    # Admin feature modules
│   │   │   ├── layout/
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── TopBar.tsx
│   │   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── customers/
│   │   │   ├── categories/
│   │   │   ├── collections/
│   │   │   ├── coupons/
│   │   │   ├── cms/
│   │   │   ├── media/
│   │   │   ├── analytics/
│   │   │   ├── settings/
│   │   │   └── ... (other admin modules)
│   │   └── home/
│   │       ├── components/
│   │       │   ├── HeroSection.tsx
│   │       │   ├── FeaturedProducts.tsx
│   │       │   ├── CategoriesGrid.tsx
│   │       │   ├── CollectionsGrid.tsx
│   │       │   ├── BrandStory.tsx
│   │       │   ├── Newsletter.tsx
│   │       │   └── TrustBar.tsx
│   │       └── hooks/
│   │           └── useHomepage.ts
│   ├── shared/                       # Shared components & utilities
│   │   ├── ui/                       # Design system primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Radio.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── MegaMenu.tsx
│   │   │   └── Layout.tsx
│   │   ├── auth/
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AdminRoute.tsx
│   │   └── feedback/
│   │       ├── ErrorBoundary.tsx
│   │       ├── ErrorPage.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── SkipToContent.tsx
│   │       └── CookieConsent.tsx
│   ├── lib/                          # Utilities & services
│   │   ├── api/
│   │   │   ├── client.ts            # HTTP client with auth, CSRF, retry
│   │   │   ├── endpoints.ts         # API endpoint constants
│   │   │   └── types.ts             # API response types
│   │   ├── utils/
│   │   │   ├── cn.ts                # ClassName utility
│   │   │   ├── format.ts            # Number, currency, date formatting
│   │   │   ├── slug.ts              # Slug generation
│   │   │   └── responsive.ts        # Responsive helpers
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useClickOutside.ts
│   │   │   ├── useFocusTrap.ts
│   │   │   └── useInfiniteScroll.ts
│   │   ├── validators/
│   │   │   ├── auth.ts
│   │   │   ├── product.ts
│   │   │   ├── cart.ts
│   │   │   ├── checkout.ts
│   │   │   └── index.ts
│   │   ├── config.ts
│   │   ├── constants.ts
│   │   ├── seo.ts
│   │   └── analytics.ts
│   ├── stores/                        # Global Zustand stores
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   └── index.ts
│   ├── types/                         # Shared TypeScript types
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── user.ts
│   │   ├── cart.ts
│   │   ├── admin.ts
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│       └── index.ts
├── e2e/
│   ├── auth.setup.ts
│   ├── fixtures/
│   └── specs/
│       ├── auth.spec.ts
│       ├── products.spec.ts
│       ├── cart.spec.ts
│       ├── checkout.spec.ts
│       ├── orders.spec.ts
│       ├── search.spec.ts
│       └── admin.spec.ts
├── public/
│   ├── _headers
│   ├── _redirects
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── robots.txt
│   └── site.webmanifest
├── .env.example
├── .gitignore
├── .node-version
├── eslint.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── wrangler.jsonc
└── README_EARLY.md                   # This file
```

### Key Structural Decisions

1. **`features/` instead of `pages/`** — Each feature is self-contained with components, hooks, API, and types. This prevents the scattered code problem of the current codebase.

2. **`shared/` instead of `components/`** — Clearly separates reusable UI from feature-specific components.

3. **No barrel files for internal modules** — Direct imports prevent tree-shaking issues and circular dependencies. Only `shared/ui/index.ts` uses a barrel file for the design system.

4. **API handlers split by domain** — `auth/register.ts` instead of one `auth.ts` monolith. Each handler is 50-150 lines max.

5. **No `src/lib/media/` barrel** — The current 213-line barrel file hurts tree-shaking. Use direct imports.

6. **Admin as a feature module** — Not a separate top-level directory. Lives under `features/admin/` alongside other features.

---

## 9. Application Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      React App                           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   Providers                         │  │
│  │  QueryClient | Router | Theme | Auth | Toast       │  │
│  └────────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │                    Routes                           │  │
│  │  Public | Protected | Admin                         │  │
│  └────────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │                 Feature Modules                     │  │
│  │  auth | products | cart | checkout | orders | admin │  │
│  └────────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  Shared Layer                       │  │
│  │  UI Primitives | Layout | Hooks | Utils | Types     │  │
│  └────────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │                 State Layer                         │  │
│  │  Zustand (client) | React Query (server)            │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Cloudflare Pages Functions                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                 Request Pipeline                    │  │
│  │  Security Headers → Rate Limit → CSRF → Auth →     │  │
│  │  Validation → Handler → Response                    │  │
│  └────────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │                   API Router                        │  │
│  │  /[...path] → Handler Registry → Domain Handler     │  │
│  └────────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │                 Handler Layer                       │  │
│  │  auth/ | products/ | cart/ | checkout/ | orders/    │  │
│  └────────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │                  Service Layer                      │  │
│  │  Database | Email | Payments | Media | Cache         │  │
│  └────────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │                 Infrastructure                      │  │
│  │  Prisma | Resend | Razorpay | Cloudinary | KV       │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

#### Product Listing Flow

```
User visits /products
  → React Router loads ProductListingPage
  → useProducts() hook calls API via React Query
  → API client sends GET /api/products with filters
  → Router matches /api/products → products.list handler
  → Handler queries Prisma with filters, pagination
  → Response cached in React Query (5min stale)
  → Products render with ProductCard components
  → Skeleton shown during loading
```

#### Checkout Flow

```
User clicks "Checkout"
  → Redirected to /checkout (ProtectedRoute)
  → useCheckout() loads cart items + addresses
  → Step 1: Shipping — select/create address
  → Step 2: Payment — Razorpay checkout opens
  → Razorpay processes payment
  → POST /api/checkout/verify-payment
  → Handler creates order in transaction
  → Inventory deducted, cart cleared
  → Confirmation page shown
  → Email sent via Resend
```

#### Authentication Flow

```
User clicks "Login"
  → LoginPage renders LoginForm
  → Turnstile CAPTCHA validated
  → POST /api/auth/login with credentials
  → Handler validates with Supabase Auth
  → Session created in auth_sessions table
  → Tokens set as httpOnly cookies
  → Auth store updated with user data
  → Redirect to previous page or home
```

#### Image Upload Flow

```
Admin uploads image
  → File validated (size, type, dimensions)
  → Upload to Cloudinary via upload preset
  → Cloudinary returns URL + publicId
  → POST /api/admin/media with metadata
  → Handler creates media_assets record
  → Image URL returned to admin
  → Admin assigns to product/category/etc
```

### Error Flow

```
API Error occurs
  → Handler catches error
  → Logs to Pino logger (structured JSON)
  → Returns standardized error response
  → API client receives error
  → React Query handles error state
  → ErrorBoundary catches rendering errors
  → User sees appropriate error UI
  → Sentry captures error (if configured)
```

---

## 10. Database Design

### Entity Relationship Overview

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│ profiles │────<│    orders    │────<│ order_items  │
└──────────┘     └──────────────┘     └──────────────┘
     │                 │                     │
     │                 │                     │
     ├────< addresses  │                     ├────> products
     ├────< carts ─────┤                     │         │
     │      │          │                     │         ├────< variants
     │      └─< cart_items                  │         ├────< images
     │                    │                 │         └────< reviews
     ├────< wishlist_items ─> variants     │
     ├────< reviews                        │
     ├────< auth_sessions                  │
     ├────< login_attempts                 │
     ├────< verification_attempts          │
     └────< user_action_logs              │
                                          │
┌──────────────┐     ┌──────────────┐     │
│  categories  │────<│   products   │────┘
└──────────────┘     └──────────────┘
     │                      │
     └──< subcategories     ├────> collections
                            ├────> brands
                            └────> size_guides
```

### Core Entities

#### profiles (User Accounts)
```sql
profiles {
  id                    UUID PRIMARY KEY
  role                  UserRole (customer | admin)
  email                 VARCHAR(255) UNIQUE
  firstName             VARCHAR(100)
  lastName              VARCHAR(100)
  phone                 VARCHAR(20)
  avatarUrl             TEXT
  isActive              BOOLEAN DEFAULT true
  emailVerified         BOOLEAN DEFAULT false
  verificationToken     VARCHAR(255)
  verificationTokenExpiresAt TIMESTAMPTZ
  pendingEmail          VARCHAR(255)
  pendingEmailToken     VARCHAR(255)
  pendingEmailTokenExpiresAt TIMESTAMPTZ
  resetPasswordToken    VARCHAR(255)
  resetPasswordTokenExpiresAt TIMESTAMPTZ
  lastLoginAt           TIMESTAMPTZ
  loginCount            INT DEFAULT 0
  preferences           JSONB
  phoneVerified         BOOLEAN DEFAULT false
  marketingOptIn        BOOLEAN DEFAULT true
  notificationPreferences JSONB
  createdAt             TIMESTAMPTZ
  updatedAt             TIMESTAMPTZ
  
  INDEXES: [role], [isActive], [role, isActive], [createdAt]
}
```

#### products
```sql
products {
  id                    UUID PRIMARY KEY
  name                  VARCHAR(300)
  slug                  VARCHAR(300) UNIQUE
  description           TEXT
  shortDescription      TEXT
  categoryId            UUID FK → categories
  subcategoryId         UUID FK → subcategories
  collectionId          UUID FK → collections
  brandId               UUID FK → brands
  basePrice             DECIMAL(10,2)
  compareAtPrice        DECIMAL(10,2)
  costPrice             DECIMAL(10,2)
  salePrice             DECIMAL(10,2)
  discountPercent       SMALLINT
  currency              VARCHAR(3) DEFAULT 'INR'
  material              VARCHAR(200)
  careInstructions      TEXT
  sizeGuideId           UUID FK → size_guides
  isActive              BOOLEAN DEFAULT true
  isFeatured            BOOLEAN DEFAULT false
  isNew                 BOOLEAN DEFAULT false
  gender                Gender (men | women | unisex)
  sortOrder             INT DEFAULT 0
  publishedAt           TIMESTAMPTZ
  scheduledPublishAt    TIMESTAMPTZ
  scheduledArchiveAt    TIMESTAMPTZ
  metaTitle             VARCHAR(200)
  metaDesc              TEXT
  createdAt             TIMESTAMPTZ
  updatedAt             TIMESTAMPTZ
  
  INDEXES: [categoryId], [collectionId], [brandId], 
           [isActive, isFeatured], [isActive, isNew],
           [isActive, gender, createdAt],
           [isActive, categoryId, sortOrder],
           [isActive, basePrice], [createdAt]
}
```

#### product_variants
```sql
product_variants {
  id                    UUID PRIMARY KEY
  productId             UUID FK → products (CASCADE)
  sku                   VARCHAR(100) UNIQUE
  size                  VARCHAR(50)
  color                 VARCHAR(100)
  colorHex              VARCHAR(7)
  priceAdjustment       DECIMAL(10,2) DEFAULT 0
  stock                 INT DEFAULT 0
  reservedStock         INT DEFAULT 0
  weight                DECIMAL(8,2)
  videoUrl              TEXT
  isActive              BOOLEAN DEFAULT true
  createdAt             TIMESTAMPTZ
  updatedAt             TIMESTAMPTZ
  
  UNIQUE: [productId, size, color]
  INDEXES: [productId, isActive], [size, color], [isActive, stock]
}
```

#### orders
```sql
orders {
  id                    UUID PRIMARY KEY
  orderNumber           VARCHAR(50) UNIQUE
  profileId             UUID FK → profiles
  email                 VARCHAR(255)
  status                OrderStatus
  subtotal              DECIMAL(10,2)
  shippingCost          DECIMAL(10,2) DEFAULT 0
  tax                   DECIMAL(10,2) DEFAULT 0
  discount              DECIMAL(10,2) DEFAULT 0
  couponCode            VARCHAR(50)
  total                 DECIMAL(10,2)
  currency              VARCHAR(3) DEFAULT 'INR'
  paymentMethod         VARCHAR(50)
  paymentStatus         PaymentStatus
  razorpayOrderId       VARCHAR(100)
  razorpayPaymentId     VARCHAR(100)
  shippingAddressId     UUID FK → addresses
  billingAddressId      UUID FK → addresses
  giftMessage           TEXT
  notes                 TEXT
  shippedAt             TIMESTAMPTZ
  deliveredAt           TIMESTAMPTZ
  cancelledAt           TIMESTAMPTZ
  cancellationReason    VARCHAR(500)
  refundedAt            TIMESTAMPTZ
  trackingNumber        VARCHAR(200)
  carrier               VARCHAR(100)
  trackingUrl           TEXT
  internalNotes         TEXT
  invoiceUrl            TEXT
  createdAt             TIMESTAMPTZ
  updatedAt             TIMESTAMPTZ
  
  INDEXES: [email], [status, createdAt], [paymentStatus, createdAt],
           [profileId, status], [createdAt], [razorpayOrderId],
           [razorpayPaymentId], [status, paymentStatus]
}
```

#### carts
```sql
carts {
  id                    UUID PRIMARY KEY
  profileId             UUID UNIQUE FK → profiles (CASCADE)
  expiresAt             TIMESTAMPTZ
  createdAt             TIMESTAMPTZ
  updatedAt             TIMESTAMPTZ
  
  INDEXES: [expiresAt]
}

cart_items {
  id                    UUID PRIMARY KEY
  cartId                UUID FK → carts (CASCADE)
  variantId             UUID FK → product_variants (CASCADE)
  quantity              INT DEFAULT 1
  savedForLater         BOOLEAN DEFAULT false
  createdAt             TIMESTAMPTZ
  updatedAt             TIMESTAMPTZ
  
  UNIQUE: [cartId, variantId]
}
```

### Relationships

| Relationship | Type | Cascade |
|-------------|------|---------|
| profiles → orders | 1:N | SetNull |
| profiles → addresses | 1:N | Cascade |
| profiles → carts | 1:1 | Cascade |
| profiles → wishlist_items | 1:N | Cascade |
| profiles → reviews | 1:N | Restrict |
| products → product_variants | 1:N | Cascade |
| products → product_images | 1:N | Cascade |
| products → categories | N:1 | SetNull |
| products → collections | N:1 | SetNull |
| products → brands | N:1 | SetNull |
| orders → order_items | 1:N | Cascade |
| orders → addresses (shipping) | N:1 | - |
| orders → addresses (billing) | N:1 | - |
| orders → order_status_history | 1:N | Cascade |
| carts → cart_items | 1:N | Cascade |

### Index Strategy

- **Primary keys:** UUID v4 on all tables
- **Foreign keys:** Indexed on all FK columns
- **Query patterns:** Composite indexes for common filter combinations
- **Soft delete:** `isActive` boolean on 20+ models
- **Timestamps:** `createdAt` indexed on high-query tables
- **Search:** `pg_trgm` extension for trigram-based text search
- **Unique constraints:** Slugs, SKUs, order numbers, email addresses

---

## 11. Feature Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Initialize project with Vite + React 19 + TypeScript
- [ ] Set up Tailwind CSS 4 with design tokens
- [ ] Create shared UI primitives (Button, Input, Select, Card, Badge, Toast, Skeleton)
- [ ] Set up Prisma with PostgreSQL schema (core models only)
- [ ] Create API framework with middleware pipeline
- [ ] Implement security headers, rate limiting, CSRF
- [ ] Set up Vitest + testing infrastructure
- [ ] Create shared layout (Header, Footer, MobileNav)
- [ ] Implement error boundaries and error pages
- [ ] Set up ESLint + Prettier
- [ ] Configure CI/CD pipeline (GitHub Actions)
- [ ] Set up Sentry error monitoring

### Phase 2: Authentication (Week 3)

- [ ] Registration with email verification
- [ ] Login with session management
- [ ] Password reset flow
- [ ] Email change flow
- [ ] Session rotation
- [ ] Protected routes
- [ ] Auth store (Zustand + httpOnly cookies)
- [ ] Auth API handlers (split into modules)
- [ ] Turnstile integration on auth forms
- [ ] Auth E2E tests

### Phase 3: Store (Week 4-5)

- [ ] Product listing with filters (category, brand, price, gender)
- [ ] Product detail page with variants
- [ ] Category browsing
- [ ] Collection browsing
- [ ] Search with autocomplete
- [ ] Product cards with hover effects
- [ ] Image gallery with zoom
- [ ] Size/color selection
- [ ] Reviews display
- [ ] Related products
- [ ] Recently viewed
- [ ] SEO meta tags (server-rendered)
- [ ] Product API handlers
- [ ] Search API with pg_trgm

### Phase 4: Cart (Week 6)

- [ ] Add to cart
- [ ] Cart drawer (slide-out)
- [ ] Quantity management
- [ ] Remove items
- [ ] Save for later
- [ ] Cart persistence (server-side for logged-in, localStorage for guests)
- [ ] Cart sync on login
- [ ] Price calculation (subtotals, tax, shipping)
- [ ] Cart API handlers
- [ ] Cart E2E tests

### Phase 5: Checkout (Week 7)

- [ ] Checkout page with step indicator
- [ ] Address management (CRUD)
- [ ] Shipping address selection
- [ ] Billing address (same as shipping option)
- [ ] Payment with Razorpay
- [ ] Cash on delivery option
- [ ] Coupon application
- [ ] Order summary review
- [ ] Order creation in transaction
- [ ] Inventory reservation
- [ ] Order confirmation page
- [ ] Email confirmation (Resend)
- [ ] Guest checkout
- [ ] Checkout E2E tests

### Phase 6: Orders (Week 8)

- [ ] Order history (account page)
- [ ] Order detail page
- [ ] Order tracking
- [ ] Cancel order
- [ ] Return request
- [ ] Refund processing
- [ ] Order notifications
- [ ] Order API handlers
- [ ] Order E2E tests

### Phase 7: Admin (Week 9-11)

- [ ] Admin layout (sidebar, topbar)
- [ ] Dashboard with stats
- [ ] Product CRUD (create, read, update, delete)
- [ ] Product variants management
- [ ] Category management
- [ ] Collection management
- [ ] Brand management
- [ ] Order management (list, detail, status updates)
- [ ] Customer management
- [ ] Coupon management
- [ ] CMS page builder
- [ ] Media library
- [ ] Settings management
- [ ] Review moderation
- [ ] Return/refund management
- [ ] Inventory management
- [ ] Admin E2E tests

### Phase 8: Analytics (Week 12)

- [ ] Event tracking (page views, product views, cart events)
- [ ] Dashboard charts (revenue, orders, users)
- [ ] Conversion funnel
- [ ] Top products
- [ ] Customer segments
- [ ] Export functionality

### Phase 9: Optimization (Week 13)

- [ ] Performance audit (Lighthouse, Core Web Vitals)
- [ ] Image optimization (Cloudinary transformations)
- [ ] Code splitting optimization
- [ ] Cache strategy (KV for API responses)
- [ ] SEO audit (meta tags, structured data, sitemap)
- [ ] Accessibility audit (WCAG 2.2 AA)
- [ ] Mobile responsiveness audit
- [ ] Security audit

### Phase 10: Production (Week 14)

- [ ] Error monitoring setup (Sentry)
- [ ] Production environment configuration
- [ ] Database migration deployment
- [ ] Seed data for production
- [ ] DNS and domain setup
- [ ] SSL certificate verification
- [ ] CDN configuration
- [ ] Backup strategy
- [ ] Monitoring and alerting
- [ ] Documentation
- [ ] Launch checklist

---

## 12. UI/UX Principles

### Color System

```typescript
// Brand Colors (Earth Tones)
brand: {
  50:  '#faf6f1',   // Lightest cream
  100: '#f0e6d6',
  200: '#e0ccb0',
  300: '#c9a87a',
  400: '#b08850',
  500: '#8b6940',   // PRIMARY
  600: '#7a5c38',
  700: '#664d2f',
  800: '#523d25',
  900: '#3d2e1c',
  950: '#1f1710',
}

// Accent Colors
accent: {
  gold: '#c9a84c',
  goldDark: '#a88a3a',
  rose: '#c47070',
  sage: '#7a9a7a',
  ink: '#2c3e50',
  cream: '#faf6f1',
}

// Neutral (Warm Gray)
neutral: {
  50:  '#fafaf9',
  100: '#f5f5f4',
  200: '#e7e5e4',
  300: '#d6d3d1',
  400: '#a8a29e',
  500: '#78716c',
  600: '#57534e',
  700: '#44403c',
  800: '#292524',
  900: '#1c1917',
  950: '#0c0a09',
}

// Luxe Palette
luxe: {
  charcoal: '#1c1c1e',
  pewter: '#6e6e73',
  ivory: '#fffff0',
  champagne: '#f7e7ce',
  bronze: '#cd7f32',
  platinum: '#e5e4e2',
}
```

### Typography

| Element | Font | Size | Weight | Letter Spacing |
|---------|------|------|--------|----------------|
| Display H1 | Cormorant Garamond | 3.5rem/4rem | 300 | -0.02em |
| Display H2 | Cormorant Garamond | 2.5rem/3rem | 400 | -0.01em |
| Heading H3 | Manrope | 1.5rem/2rem | 600 | 0 |
| Heading H4 | Manrope | 1.25rem/1.75rem | 600 | 0 |
| Body Large | Manrope | 1.125rem | 400 | 0 |
| Body | Manrope | 1rem | 400 | 0 |
| Body Small | Manrope | 0.875rem | 400 | 0 |
| Caption | Manrope | 0.75rem | 500 | 0.05em |
| Label | Manrope | 0.6875rem | 600 | 0.1em uppercase |
| Editorial | Cormorant Garamond | 1.25rem | 400 | 0.02em |

### Spacing Scale

```
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
20:  80px
24:  96px
32:  128px
```

### Grid System

- **Mobile:** 4 columns, 16px gutter
- **Tablet:** 8 columns, 24px gutter
- **Desktop:** 12 columns, 32px gutter
- **Max width:** 1440px (editorial), 1280px (standard)

### Animations

```css
/* Easing Curves */
--ease-luxe-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-luxe-in: cubic-bezier(0.55, 0, 0.75, 0.25);

/* Duration Tokens */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 800ms;

/* Shadows */
--shadow-subtle: 0 1px 3px rgba(0,0,0,0.08);
--shadow-card: 0 2px 8px rgba(0,0,0,0.08);
--shadow-elevated: 0 10px 40px rgba(0,0,0,0.10);
--shadow-modal: 0 20px 60px rgba(0,0,0,0.15);
```

### Button Variants

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| Primary | brand-500 | white | none | brand-600 |
| Secondary | transparent | brand-500 | brand-500 | brand-500 bg |
| Ghost | transparent | neutral-700 | none | brand-500 text |
| Outline | transparent | neutral-700 | neutral-200 | neutral-900 |
| Gold | accent-gold | white | none | accent-goldDark |
| Danger | red-500 | white | none | red-600 |

### Card Treatments

| Type | Border | Shadow | Hover Effect |
|------|--------|--------|--------------|
| Default | 1px neutral-100 | subtle | card |
| Elevated | none | card | elevated |
| Premium | 1px neutral-100/60 | card | elevated + border |
| Interactive | none | none | lift (-translate-y-1) |

### Loading States

- **Skeleton:** Animated shimmer with `bg-neutral-100 animate-pulse`
- **Spinner:** Brand-colored spinning circle
- **Progress:** Determinate progress bar
- **Optimistic:** UI updates immediately, reverts on error

### Dark Mode Strategy

- Use CSS custom properties for all colors
- Tailwind `dark:` variant for all components
- Dark mode toggle in user settings
- Default to system preference
- Store preference in localStorage

### Accessibility Requirements

- WCAG 2.2 AA compliance
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Focus indicators on all interactive elements
- Skip to content link
- ARIA labels on all icons
- Screen reader announcements for dynamic content
- Keyboard navigation for all features
- Reduced motion support
- Alt text on all images
- Form labels on all inputs

### Premium Feel Checklist

- [ ] Subtle hover transitions (300ms, ease-luxe-out)
- [ ] Card lift on hover (-2px translateY)
- [ ] Warm shadows (not harsh black)
- [ ] Gold accent on premium elements
- [ ] Editorial typography for headlines
- [ ] Generous whitespace
- [ ] Skeleton loading instead of spinners
- [ ] Smooth page transitions
- [ ] Backdrop blur on overlays
- [ ] Gradient fallbacks for images
- [ ] Micro-interactions on actions
- [ ] Consistent spacing rhythm

---

## 13. Component Strategy

### Atomic Design

```
Atoms → Molecules → Organisms → Templates → Pages

Atoms:      Button, Input, Badge, Label, Icon, Skeleton
Molecules:  SearchBar, FormField, CartItem, ProductCard
Organisms:  Header, Footer, ProductGrid, CheckoutForm
Templates:  AuthLayout, AdminLayout, StorefrontLayout
Pages:      HomePage, ProductPage, CheckoutPage
```

### Component Interface Standards

```typescript
// Every component follows this pattern:

// 1. Props interface with JSDoc
interface ButtonProps {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Icon to show before label */
  leftIcon?: React.ReactNode;
  /** Icon to show after label */
  rightIcon?: React.ReactNode;
  /** Button content */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Additional class names */
  className?: string;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
}

// 2. Component with forwardRef
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, ... }, ref) => {
    return <button ref={ref} ... />;
  }
);

// 3. Display name
Button.displayName = 'Button';

// 4. Export
export { Button, type ButtonProps };
```

### Naming Conventions

- **Components:** PascalCase (`ProductCard`, `CartItem`)
- **Hooks:** camelCase with `use` prefix (`useCart`, `useProducts`)
- **Utilities:** camelCase (`formatPrice`, `cn`)
- **Types:** PascalCase (`Product`, `CartItem`, `OrderStatus`)
- **Constants:** SCREAMING_SNAKE_CASE (`API_BASE_URL`, `MAX_CART_ITEMS`)
- **Files:** PascalCase for components (`ProductCard.tsx`), camelCase for hooks/utilities (`useCart.ts`, `format.ts`)

### Composition Patterns

```typescript
// Compound components for complex UI
<ProductCard>
  <ProductCard.Image />
  <ProductCard.Badge>New</ProductCard.Badge>
  <ProductCard.Title>Product Name</ProductCard.Title>
  <ProductCard.Price>₹2,999</ProductCard.Price>
  <ProductCard.Actions>
    <Button>Add to Cart</Button>
    <WishlistButton />
  </ProductCard.Actions>
</ProductCard>

// Render props for flexible composition
<DataList
  items={products}
  renderItem={(product) => <ProductCard product={product} />}
  renderEmpty={() => <EmptyState />}
  renderLoading={() => <Skeleton count={8} />}
/>

// Slots for layout flexibility
<Card>
  <Card.Header>
    <Card.Title>Card Title</Card.Title>
    <Card.Action>...</Card.Action>
  </Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

---

## 14. Coding Standards

### Naming

- **Files:** One component per file. File name matches component name.
- **Folders:** Feature folders are plural (`products/`, `orders/`), utility folders are singular (`utils/`, `hooks/`).
- **Exports:** Named exports only. No default exports (except page components for lazy loading).
- **Interfaces:** Prefix with `I` only for dependency injection. Otherwise, use plain names (`Product`, `CartItem`).
- **Enums:** PascalCase with descriptive names (`OrderStatus`, `PaymentStatus`).

### Formatting

- **Indentation:** 2 spaces
- **Line length:** 100 characters max
- **Trailing commas:** Always
- **Semicolons:** Always
- **Quotes:** Single quotes for strings, double quotes for JSX
- **Imports:** Grouped (external, internal, types) with blank lines between groups

### Comments

- **No comments unless asked.** Code should be self-documenting.
- **When comments are needed:** Complex business logic, non-obvious workarounds, security considerations.
- **JSDoc:** Use for public API interfaces and exported functions.
- **TODO format:** `// TODO(#issue-number): description` linked to GitHub issue.

### Error Handling

```typescript
// API handlers: Throw typed errors
class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

// Frontend: Use React Query error handling
const { data, error, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  throwOnError: false, // Handle in component
});

// Components: Error boundaries for rendering errors
<ErrorBoundary fallback={<ErrorPage />}>
  <ProductGrid />
</ErrorBoundary>
```

### Environment Variables

```typescript
// Validate all env vars at startup
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  // ...
});

export const env = envSchema.parse(process.env);
```

### Security Rules

1. Never commit secrets to git
2. Never use `localStorage` for sensitive data
3. Always validate input on the server
4. Always authenticate before authorizing
5. Always use parameterized queries (Prisma handles this)
6. Always sanitize user input before rendering
7. Always use HTTPS in production
8. Always set secure cookie flags
9. Always rate limit public endpoints
10. Always log security-relevant events

---

## 15. Performance Strategy

### Lazy Loading

```typescript
// Route-level code splitting
const CheckoutPage = lazy(() => import('./features/checkout/pages/CheckoutPage'));

// Component-level code splitting
const AdminMediaLibrary = lazy(() => import('./features/admin/media/MediaLibrary'));

// Preload on hover/focus
<Link
  to="/products"
  onMouseEnter={() => import('./features/products/pages/ProductListingPage')}
>
  Products
</Link>
```

### Image Optimization

- Cloudinary auto-format (`f_auto`) and quality (`q_auto`)
- Responsive srcSet for all images
- Lazy loading below the fold
- Blur placeholder for progressive loading
- WebP/AVIF format preference
- Maximum dimensions enforced on upload

### Code Splitting Strategy

```
Vendor chunk: react, react-dom, react-router
State chunk: zustand, @tanstack/react-query
UI chunk: framer-motion, lucide-react
Feature chunks: one per feature module
```

### Caching Strategy

| Data Type | Cache Location | TTL | Invalidation |
|-----------|---------------|-----|--------------|
| Products list | React Query + KV | 5min | On product update |
| Product detail | React Query + KV | 5min | On product update |
| Categories | React Query + KV | 1hr | On category update |
| Site settings | React Query + KV | 10min | On settings update |
| User session | httpOnly cookie | 7d | On logout |
| Cart | Server (DB) | 30d | On cart change |
| Search results | React Query | 1min | On search |

### Server Rendering Strategy

- **SSR (via middleware):** SEO meta tags, JSON-LD structured data
- **CSR:** All interactive content
- **ISR (future):** Product pages with revalidation

### Database Optimization

- Connection pooling via Hyperdrive
- Read replicas for analytics queries (future)
- Query result caching in KV
- Pagination on all list endpoints
- Select only needed columns
- Avoid N+1 queries (include relations)

---

## 16. Security Strategy

### Authentication

- Supabase Auth for identity management
- Custom session management with httpOnly cookies
- Session rotation every 24 hours
- Maximum 5 active sessions per user
- Session invalidation on password change
- Brute force protection (5 attempts → 15min lockout)

### Authorization

- Role-based access control (customer, admin)
- Admin routes protected by `AdminRoute` middleware
- API endpoints check authentication before authorization
- Resource-level ownership checks (users can only view their own orders)

### Validation

- Zod schemas for all API inputs
- Server-side validation on every endpoint
- Client-side validation for UX (not security)
- Input sanitization (HTML stripping)
- File upload validation (type, size, dimensions)

### Rate Limiting

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| Auth (login/register) | 20 req/min | Per IP |
| Password reset | 5 req/hr | Per email |
| API (standard) | 100 req/min | Per user |
| API (admin) | 60 req/min | Per user |
| Contact form | 10 req/hr | Per IP |
| Search | 30 req/min | Per user |
| File upload | 10 req/min | Per user |

### CSRF Protection

- Double-submit cookie pattern
- CSRF token in httpOnly cookie
- Token validated on all mutation endpoints
- Token rotated every 4 hours

### Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 0
```

### Secrets Management

- All secrets in Cloudflare Pages secrets (not in code)
- `.env` contains only placeholder values
- `.env` in `.gitignore`
- Environment validation at startup
- No secrets in logs or error messages
- API keys rotated quarterly

---

## 17. SEO Strategy

### Meta Tags (Server-Rendered)

```html
<!-- Every page gets these via middleware -->
<title>{pageTitle} | নবME</title>
<meta name="description" content={metaDescription} />
<link rel="canonical" href={canonicalUrl} />
<meta property="og:title" content={ogTitle} />
<meta property="og:description" content={ogDescription} />
<meta property="og:image" content={ogImage} />
<meta property="og:url" content={ogUrl} />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={twitterTitle} />
<meta name="twitter:description" content={twitterDescription} />
<meta name="twitter:image" content={twitterImage} />
```

### Structured Data

```json
// Product page
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description",
  "image": "https://nabome.online/image.jpg",
  "brand": { "@type": "Brand", "name": "Brand Name" },
  "offers": {
    "@type": "Offer",
    "price": "2999",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock"
  }
}

// Organization
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "নবME",
  "url": "https://nabome.online",
  "logo": "https://nabome.online/logo.svg",
  "sameAs": ["https://instagram.com/nabome"]
}

// BreadcrumbList
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

### Sitemap

```xml
<!-- Auto-generated, server-rendered -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nabome.online</loc>
    <lastmod>2026-07-31</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Products, categories, collections, etc. -->
</urlset>
```

### Performance for SEO

- Core Web Vitals targets: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Server-rendered meta tags (not client-side)
- Structured data in HTML (not just JSON-LD script tags)
- Canonical URLs on all pages
- Clean URL structure (/products/product-name, not /products?id=123)
- Mobile-first responsive design
- Fast page load (< 2s on 3G)

---

## 18. Deployment Plan

### Environments

| Environment | Branch | URL | Purpose |
|------------|--------|-----|---------|
| Development | `feature/*` | localhost:5173 | Local development |
| Preview | PR branches | `*.nabome.pages.dev` | PR review |
| Staging | `develop` | staging.nabome.online | Pre-production testing |
| Production | `main` | nabome.online | Live site |

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e

  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - uses: cloudflare/wrangler-action@v3
        with:
          command: pages deploy dist --project-name=nabome

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - uses: cloudflare/wrangler-action@v3
        with:
          command: pages deploy dist --project-name=nabome-staging

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - uses: cloudflare/wrangler-action@v3
        with:
          command: pages deploy dist --project-name=nabome
          environment: production
```

### Rollback Strategy

1. **Immediate:** Redeploy previous Cloudflare Pages deployment
2. **Database:** Prisma migration rollback (`prisma migrate deploy --previous`)
3. **Secrets:** Rotate compromised secrets immediately
4. **Communication:** Status page update + email to affected users

### Monitoring

- **Error tracking:** Sentry (frontend + API)
- **Uptime:** Cloudflare Health Checks
- **Performance:** Cloudflare Web Analytics + Sentry Performance
- **Logs:** Pino structured logs → Cloudflare Workers Logs
- **Alerts:** Sentry alerts → Slack/Email for critical errors

---

## 19. Future Expansion

### Short-term (6 months)

- [ ] Dark mode
- [ ] Wishlist sharing
- [ ] Product comparison
- [ ] Recently viewed products
- [ ] Email notification preferences
- [ ] Order tracking page
- [ ] Return/refund automation
- [ ] Abandoned cart recovery emails
- [ ] Coupon system enhancements
- [ ] Loyalty points program

### Medium-term (1 year)

- [ ] Multi-language support (English, Bengali, Hindi)
- [ ] Multi-currency (INR, USD, BDT)
- [ ] Gift cards
- [ ] Referral program
- [ ] Social login (Google, Facebook)
- [ ] Product Q&A
- [ ] Size recommendation AI
- [ ] Virtual try-on (AR)
- [ ] Subscription boxes
- [ ] Vendor dashboard

### Long-term (2+ years)

- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Custom fashion design tool
- [ ] Inventory management system
- [ ] Marketplace (multi-vendor)
- [ ] International shipping
- [ ] Blockchain authentication
- [ ] Sustainability tracking
- [ ] Augmented reality showroom
- [ ] Voice commerce

---

## 20. Complete Rebuild Checklist

### Setup

- [ ] Initialize project with `pnpm create vite`
- [ ] Configure TypeScript (strict mode, path aliases)
- [ ] Set up Tailwind CSS 4 with design tokens
- [ ] Configure ESLint + Prettier
- [ ] Set up Vitest + Playwright
- [ ] Configure GitHub Actions CI/CD
- [ ] Set up Sentry error monitoring
- [ ] Create `.env.example` with all required variables
- [ ] Configure `wrangler.jsonc` for Cloudflare Pages
- [ ] Set up Prisma with PostgreSQL

### Design System

- [ ] Create Button component (all variants)
- [ ] Create Input component (with validation states)
- [ ] Create Select component
- [ ] Create Badge component
- [ ] Create Card component
- [ ] Create Dialog component
- [ ] Create Toast component
- [ ] Create Skeleton component
- [ ] Create Label component
- [ ] Create Checkbox component
- [ ] Create Radio component
- [ ] Create Switch component
- [ ] Create Tabs component
- [ ] Create Tooltip component
- [ ] Create Accordion component
- [ ] Create Breadcrumbs component
- [ ] Create Pagination component
- [ ] Create EmptyState component

### Layout

- [ ] Create Header component
- [ ] Create Footer component
- [ ] Create MobileNav component
- [ ] Create BottomNav component
- [ ] Create MegaMenu component
- [ ] Create Layout wrapper
- [ ] Create AuthLayout
- [ ] Create AdminLayout
- [ ] Create ProtectedRoute
- [ ] Create AdminRoute
- [ ] Create ErrorBoundary
- [ ] Create SkipToContent
- [ ] Create CookieConsent

### Database

- [ ] Design and create Prisma schema (core models)
- [ ] Create initial migration
- [ ] Set up seed script
- [ ] Create database indexes
- [ ] Test all relationships
- [ ] Verify cascade deletes

### API Framework

- [ ] Create API router (catch-all handler)
- [ ] Implement security headers middleware
- [ ] Implement rate limiting middleware
- [ ] Implement CSRF protection
- [ ] Implement authentication middleware
- [ ] Implement request validation middleware
- [ ] Create standardized response helpers
- [ ] Create error handling helpers
- [ ] Create pagination helpers
- [ ] Create logging setup (Pino)

### Authentication

- [ ] Create Supabase client configuration
- [ ] Create registration handler
- [ ] Create login handler
- [ ] Create logout handler
- [ ] Create refresh token handler
- [ ] Create password reset handler
- [ ] Create email verification handler
- [ ] Create email change handler
- [ ] Create profile update handler
- [ ] Create session management
- [ ] Create auth store (Zustand)
- [ ] Create auth hooks
- [ ] Create auth pages (Login, Register, ForgotPassword, ResetPassword, VerifyEmail)
- [ ] Write auth unit tests
- [ ] Write auth E2E tests

### Store

- [ ] Create product list handler
- [ ] Create product detail handler
- [ ] Create category list handler
- [ ] Create collection list handler
- [ ] Create brand list handler
- [ ] Create search handler (pg_trgm)
- [ ] Create product listing page
- [ ] Create product detail page
- [ ] Create category page
- [ ] Create collection page
- [ ] Create search page
- [ ] Create product components (Card, Grid, Detail, VariantSelector, ImageGallery, Reviews)
- [ ] Create store hooks (useProducts, useProduct, useCategories, useCollections, useSearch)
- [ ] Write store unit tests
- [ ] Write store E2E tests

### Cart

- [ ] Create cart handler (get, add, update, remove)
- [ ] Create cart store (Zustand)
- [ ] Create cart hooks (useCart)
- [ ] Create CartDrawer component
- [ ] Create CartItem component
- [ ] Create CartSummary component
- [ ] Create EmptyCart component
- [ ] Write cart unit tests
- [ ] Write cart E2E tests

### Checkout

- [ ] Create checkout handler (create order, verify payment)
- [ ] Create address handlers (CRUD)
- [ ] Create checkout hooks (useCheckout)
- [ ] Create CheckoutPage with step indicator
- [ ] Create ShippingStep component
- [ ] Create PaymentStep component
- [ ] Create ReviewStep component
- [ ] Create OrderConfirmation component
- [ ] Create AddressForm component
- [ ] Integrate Razorpay
- [ ] Write checkout unit tests
- [ ] Write checkout E2E tests

### Orders

- [ ] Create order handlers (list, detail, tracking, cancel)
- [ ] Create return request handler
- [ ] Create order hooks (useOrders)
- [ ] Create OrderList component
- [ ] Create OrderDetail component
- [ ] Create OrderTracking component
- [ ] Create ReturnRequest component
- [ ] Write order unit tests
- [ ] Write order E2E tests

### Admin

- [ ] Create admin layout (Sidebar, TopBar)
- [ ] Create dashboard page
- [ ] Create product CRUD pages
- [ ] Create order management pages
- [ ] Create customer management pages
- [ ] Create category management pages
- [ ] Create collection management pages
- [ ] Create coupon management pages
- [ ] Create CMS page builder
- [ ] Create media library
- [ ] Create settings pages
- [ ] Create review moderation pages
- [ ] Create return/refund management pages
- [ ] Write admin E2E tests

### SEO

- [ ] Implement server-side meta tag injection
- [ ] Create JSON-LD structured data
- [ ] Create sitemap.xml
- [ ] Create robots.txt
- [ ] Create canonical URL handling
- [ ] Create Open Graph images
- [ ] Test with Google Search Console

### Performance

- [ ] Optimize bundle size (target: < 200KB main chunk)
- [ ] Implement image optimization (Cloudinary)
- [ ] Implement code splitting
- [ ] Implement caching (KV)
- [ ] Test Core Web Vitals
- [ ] Optimize database queries
- [ ] Test with Lighthouse

### Security

- [ ] Rotate all secrets
- [ ] Remove `.env` from git history
- [ ] Enable CSRF on all mutations
- [ ] Implement webhook idempotency
- [ ] Add Subresource Integrity
- [ ] Security audit
- [ ] Penetration testing

### Launch

- [ ] Production environment setup
- [ ] DNS configuration
- [ ] SSL verification
- [ ] CDN configuration
- [ ] Backup strategy
- [ ] Monitoring setup
- [ ] Alerting setup
- [ ] Documentation
- [ ] Launch checklist sign-off

---

## Summary

This blueprint represents a complete restart for নবME. The current codebase, while ambitious in scope, accumulated critical technical debt in security, testing, and architecture. By rebuilding from scratch with this document as the guide, we can create a production-ready, secure, performant, and maintainable fashion e-commerce platform.

**Key differences from the current codebase:**

1. **Security-first:** CSRF enforced, httpOnly cookies, input validation on every endpoint
2. **Test-driven:** 100% test coverage on critical paths before features
3. **Feature-first architecture:** Self-contained modules, no monolithic files
4. **Clean code:** No `as any`, no dead code, no duplicated logic
5. **Performance:** Hyperdrive, KV caching, optimized bundles, < 2s load times
6. **Monitoring:** Sentry from day one, structured logging, alerting
7. **Accessibility:** WCAG 2.2 AA compliance built in, not bolted on
8. **Dark mode:** Designed from the start, not an afterthought

The rebuild is estimated at **14 weeks** with a focused team. Each phase produces working, tested, deployable code. No big-bang releases.

---

*This document is the single source of truth for the নবME rebuild. All implementation decisions should reference this blueprint.*
