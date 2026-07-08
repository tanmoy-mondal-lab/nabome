# NABOME — Phase 2 Enterprise Architecture Audit

**Date:** 2026-07-07  
**Phase:** 2 — Enterprise Architecture Audit  
**Author:** Principal Software Architect  
**Status:** Complete  
**Prerequisite:** Phase 1 — PROJECT_INVENTORY.md

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Current Architecture](#3-current-architecture)
4. [Strengths](#4-strengths)
5. [Weaknesses](#5-weaknesses)
6. [Module Analysis](#6-module-analysis)
7. [Folder Analysis](#7-folder-analysis)
8. [Dependency Analysis](#8-dependency-analysis)
9. [Coupling Analysis](#9-coupling-analysis)
10. [Layer Analysis](#10-layer-analysis)
11. [Scalability Report](#11-scalability-report)
12. [Maintainability Report](#12-maintainability-report)
13. [Technical Debt](#13-technical-debt)
14. [Architecture Smells](#14-architecture-smells)
15. [Risk Assessment](#15-risk-assessment)
16. [Refactoring Opportunities](#16-refactoring-opportunities)
17. [Priority Matrix](#17-priority-matrix)
18. [Architecture Score](#18-architecture-score)
19. [Enterprise Readiness Score](#19-enterprise-readiness-score)
20. [Cloudflare Readiness Score](#20-cloudflare-readiness-score)
21. [Developer Experience Score](#21-developer-experience-score)
22. [Final Verdict](#22-final-verdict)

---

## 1 — Executive Summary

This Phase 2 audit examines NABOME's architecture from an enterprise-scale perspective. The Phase 1 inventory established what exists (351 TS/TSX files, 114 directories, 64,248 LOC). Phase 2 evaluates *how the architecture holds together* — module boundaries, coupling, layering, data flow, dependency chains, and long-term scalability.

NABOME follows a **layered SPA + edge API** architecture: a React 19 SPA communicates with Cloudflare Pages Functions that proxy to a PostgreSQL database via Prisma ORM. The architecture has clear separation of frontend (`src/`), API backend (`api/`), edge middleware (`functions/`), and infrastructure (`prisma/`, `public/`).

**Strengths:** The routing registry pattern in the API layer is clean and extensible. The frontend uses well-separated concerns (pages, components, hooks, stores, sections). The CMS core type system (`cms-types.ts`) is sophisticated, with section definitions that drive both admin editing and storefront rendering. Email module is properly isolated with no database coupling. Zustand stores are well-structured with per-user isolation.

**Critical Weaknesses:** The API layer uses a fragile string-based action dispatch pattern (no type safety between route registration and handler signatures). The auth handler (1,194 lines) and payments handler (1,058 lines) violate single-responsibility principle. The admin API client is a 399-line god object. Environment variable access via `getEnv()` is scattered across handlers instead of centralized through context. The SEO middleware queries the database directly on every HTML page request with a per-instance LRU cache — not horizontally scalable. There is no request ID propagation, no centralized error handling middleware, and inconsistent error response shapes across the API surface.

**Overall Architecture Score: 6.8/10** — The skeleton is well-structured but the muscle (specific handler implementations) shows signs of monolithic drift and insufficient abstraction.

---

## 2 — Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          CLOUDFLARE PAGES                                 │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     functions/ (Edge Middleware)                   │   │
│  │  ┌─────────────────────────────────────────────────────────┐     │   │
│  │  │  _middleware.ts                                         │     │   │
│  │  │  • Intercepts all HTML requests                         │     │   │
│  │  │  • Queries Prisma directly for SEO metadata             │     │   │
│  │  │  • LRU cache (500 entries, 60s TTL, per-instance)       │     │   │
│  │  │  • Injects <title>, <meta>, OG tags into HTML            │     │   │
│  │  └─────────────────────────────────────────────────────────┘     │   │
│  │  ┌──────────────────────┐  ┌──────────────────────────┐          │   │
│  │  │  robots.txt.ts       │  │  sitemap.xml.ts          │          │   │
│  │  │  (dynamic from DB)   │  │  (dynamic from DB)       │          │   │
│  │  └──────────────────────┘  └──────────────────────────┘          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     api/ (Cloudflare Functions)                   │   │
│  │                                                                   │   │
│  │  ┌──────────────────────────────────────────────┐                │   │
│  │  │  [...path].ts  (Catch-all Router, 671 lines)  │                │   │
│  │  │                                               │                │   │
│  │  │  1. Rate limit check (KV)                     │                │   │
│  │  │  2. CSRF (double-submit cookie)               │                │   │
│  │  │  3. Auth (JWT → session)                      │                │   │
│  │  │  4. Turnstile (bot check)                     │                │   │
│  │  │  5. Route dispatch (string-based action)       │                │   │
│  │  │  6. Security headers + CORS                   │                │   │
│  │  └──────────────────────────────────────────────┘                │   │
│  │         │               │              │                          │   │
│  │         ▼               ▼              ▼                          │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────┐                    │   │
│  │  │ _handlers/ │  │ _handlers/  │  │ _lib/    │                    │   │
│  │  │ (public)  │  │ admin/      │  │ (shared) │                    │   │
│  │  │ 18 files  │  │ 33 files    │  │ 16 files │                    │   │
│  │  └──────────┘  └──────────────┘  └──────────┘                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     static/ (SPA via Vite Build)                  │   │
│  │                                                                   │   │
│  │  ┌──────────────────────────────────────────────────────────┐    │   │
│  │  │  src/                                                     │    │   │
│  │  │  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │   │
│  │  │  │ app/   │ │ pages/  │ │ admin/  │ │ storefront/  │  │    │   │
│  │  │  │bootstrap│ │ (auth)  │ │(37 pages)│ │(22 pages)   │  │    │   │
│  │  │  └────────┘ └──────────┘ └──────────┘ └──────────────┘  │    │   │
│  │  │  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │   │
│  │  │  │hooks/  │ │ stores/ │ │ lib/    │ │ cms/         │  │    │   │
│  │  │  │(2)     │ │ (4)     │ │ (14 files)│ │(3 files)     │  │    │   │
│  │  │  └────────┘ └──────────┘ └──────────┘ └──────────────┘  │    │   │
│  │  └──────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐                      │
│  │  public/             │  │  prisma/             │                      │
│  │  • _headers (CSP)    │  │  • schema (34 models)│                      │
│  │  • _redirects        │  │  • 11 migrations     │                      │
│  │  • sw.js (service    │  │  • seed.ts (1003 L)  │                      │
│  │    worker)           │  └──────────────────────┘                      │
│  └──────────────────────┘                                                │
└──────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Neon        │  │  Supabase Auth   │  │  External APIs   │
│  PostgreSQL  │  │  (JWT + sessions) │  │  • Razorpay      │
│  (via Prisma)│  │                  │  │  • Resend        │
└──────────────┘  └──────────────────┘  │  • Cloudinary    │
                                         │  • Google Ana.  │
                                         └──────────────────┘
```

### Data Flow (Request Lifecycle)

```
Browser → Cloudflare Edge → functions/_middleware.ts (SEO)
  → Cloudflare Pages → api/[...path].ts (router)
  → Rate Limit Check (KV)
  → CSRF Validation (double-submit cookie)
  → Auth Verification (JWT → DB session)
  → Turnstile Check (bot filter)
  → Handler Dispatch (string-based action)
  → Prisma Query → Neon PostgreSQL
  → Response + Security Headers
  → Browser receives JSON/HTML
```

### Data Flow (Frontend State)

```
User Action → React Component
  → Hook (useCart, useProducts, etc.)
  → store (Zustand) for client state
  → api client (TanStack Query) for server state
  → fetch() → /api/* → Cloudflare Functions
  → Response → Hook → Component re-render
```

---

## 3 — Current Architecture

### 3.1 Application Bootstrap

The application bootstraps in `src/app/main.tsx` with three providers wrapping the `App`:

1. `HelmetProvider` (react-helmet-async) — head management
2. `ConnectivityProvider` — online/offline detection
3. `StrictMode` — React dev checks

`App.tsx` adds:
4. `QueryClientProvider` (TanStack Query) — server state
5. `BrowserRouter` — client-side routing
6. `Toaster` — toast notifications
7. `AuthLoader` — initial auth hydration
8. `GoogleAnalytics` — analytics (gated by VITE_GA_ID)

The bootstrap is clean and follows a provider chain pattern. However, there is no global error boundary at the topmost level — the `ErrorBoundary` inside `Suspense` only catches render errors for routed pages. Critical initialization errors (in providers above) would crash the entire app with no recovery UI.

### 3.2 Rendering Flow

1. User requests `nabome.online` → Cloudflare serves `index.html`
2. Browser loads JS bundle (vendor + state + UI + app chunks)
3. React hydrates SPA, router matches path
4. `StorefrontLayout` renders Header, Footer, BottomNav
5. Page component renders via `React.lazy()` with Suspense
6. Page component calls hooks that use TanStack Query or Zustand
7. TanStack Query fetches from `/api/*`
8. API response → re-render

No SSR. All content rendered client-side after JS execution.

### 3.3 Authentication Flow

1. User submits login form → `useAuth` → `api.post('/auth/login', ...)`
2. API handler validates credentials against Supabase Auth
3. Creates/updates `AuthSession` record in local DB
4. Returns JWT tokens, profile data
5. Frontend stores tokens in Zustand auth-store (localStorage persistence)
6. `AuthLoader` checks `auth-store` on app init, attempts token refresh if expired
7. API client reads auth-store for Bearer token, auto-refreshes on 401
8. `ProtectedRoute` / `AdminRoute` components gate route access

**Architecture concern:** Auth tokens in localStorage are accessible to any JS on the same origin. The API client reads localStorage directly (`getStoredAuth()`) rather than from the Zustand store — this is a bypass of the state management layer.

### 3.4 CMS Architecture

The CMS has three layers:

1. **Core Types** (`src/cms/core/cms-types.ts` — 858 lines): Defines `SectionType` (20+ types), `SectionDefinition`, `SectionField`, and all section configurations. This is the contract layer.

2. **Admin UI** (`src/admin/cms/`): Editors for homepage sections (HomepageBuilder 1,453 lines, HeaderBuilder 1,000 lines), navigation, footer, pages. Uses drag-and-drop (dnd-kit) for reordering.

3. **Storefront Rendering** (`src/storefront/sections/`): 14 section renderers that consume CMS section data and render React components. `SectionRenderer.tsx` dispatches to the correct section component.

**Architecture concern:** cms-types.ts (858 lines) is the single source of truth for both admin editing and storefront rendering, but the storefront section renderers are in `src/storefront/sections/` while the admin editors are in `src/admin/cms/`. There is no shared interface between them — the contract is implicit in the JSON data shape.

### 3.5 Checkout Architecture

1. User enters checkout (logged in or guest)
2. `CheckoutPage.tsx` (895 lines) manages: address selection/creation, order summary, coupon application, payment method selection
3. On submission → `POST /api/checkout` or `/api/checkout/guest`
4. Backend creates order, generates Razorpay order ID
5. Frontend loads Razorpay checkout script
6. Payment verification → `POST /api/payments/verify`
7. Razorpay webhook → `POST /api/payments/webhook` → order status update, email notification

**Architecture concern:** CheckoutPage.tsx (895 lines) is oversized, mixing address management, order summary, payment gateway integration, and coupon logic in a single component. The checkout handler (647 lines) is similarly oversized.

### 3.6 Product Architecture

- **Public API** (`api/_handlers/products.ts`): Read-only, serves list/detail/search/autocomplete/similar
- **Admin API** (`api/_handlers/admin/products.ts` — 851 lines): CRUD, variants management, images, bulk operations, duplicate, restore
- **Frontend** (`src/storefront/pages/ProductDetailPage.tsx` — 612 lines): Product detail with image gallery, variant selection, reviews, recommendations
- **Frontend** (`src/storefront/pages/ProductListingPage.tsx`): Product grid with filters, sorting, pagination

**Architecture concern:** Product data flows through TanStack Query cache to pages, but the cache invalidation strategy is not centralized. Mutations in admin don't trigger cache invalidation in storefront.

### 3.7 Search Architecture

- Frontend search via `SearchOverlay.tsx` (full-screen with autocomplete)
- Uses `/api/products/search` and `/api/products/autocomplete` endpoints
- Admin has search index management (build/status/search)
- Trending search terms are hardcoded in the router (not data-driven)

### 3.8 Theme Architecture

- Tailwind config defines design tokens (colors, fonts, shadows, spacing)
- `ThemeBuilder` (813 lines) allows admin to customize brand colors, fonts, layout
- Theme changes are stored in `SiteSetting.theme` JSON field
- No live preview — changes apply after save + reload

### 3.9 Notification Architecture

- `Notification` model supports multiple channels (email, in-app, push, SMS)
- `NotificationTemplate` per event type
- Email notification function (`api/_lib/email.ts`): intentionally isolated from Prisma
- Email templates (`api/_lib/email-templates.ts` — 495 lines): all templates defined inline
- No automated notification sending — events must be triggered manually in handlers

### 3.10 Media Architecture

- Admin upload → Cloudinary API → returns URL + publicId
- Storefront renders via `SafeImage.tsx` with Cloudinary transformations (`f_auto,q_auto`)
- Images proxy through Cloudinary fetch for Unsplash-originated seed data
- `img()` function in `seo.ts` constructs Cloudinary URLs

### 3.11 Analytics Architecture

- `AnalyticsEvent` model (BigInt autoincrement — potential overflow)
- Admin analytics page with charts (sales, products, customers)
- Google Analytics component (gated by VITE_GA_ID)
- No Facebook Pixel / CAPI implementation
- No GA4 e-commerce events

### 3.12 Logging Architecture

- Audit log: `UserActionLog` model + `api/_lib/audit.ts`
- Login attempts tracked via `LoginAttempt` model
- No structured logging, no log aggregation, no error monitoring
- Console statements removed in Phase 1 cleanup
- No request ID propagation for tracing

### 3.13 Configuration Architecture

- Environment variables: Cloudflare Pages secrets for production, `.env` for local
- `getEnv()` reads from `process.env` — called independently in each handler
- `cleanSecret()` filters placeholder values
- No startup validation of required secrets
- Frontend config via `src/lib/config.ts` with `VITE_*` env vars

### 3.14 Environment Architecture

- **Local:** Vite dev server proxies `/api/*` to local function server (port 8788)
- **Production:** Cloudflare Pages serves static + Functions at edge
- Development environment requires: Node.js 18+, PostgreSQL (Neon), Supabase project, Cloudflare account
- No Docker, no devcontainer, no environment parity guarantees

### 3.15 Cloudflare Architecture

- **Pages project:** Static assets + Functions at edge
- **KV:** Single namespace for rate limiting (RATE_LIMIT_STORE)
- **Compatibility flags:** `nodejs_compat` for Node.js API polyfills
- **No:** D1, R2, Queues, Workflows, Durable Objects, or Analytics configured
- **Security:** Cloudflare Turnstile for bot protection
- Wrangler config is minimal (13 lines) — all configuration in code

### 3.16 Deployment Architecture

- **CI/CD:** GitHub Actions on push to `main` or `production`
- **Build pipeline:** `sync-public-headers.ts` → `prisma generate` → typecheck → `vite build`
- **Deploy:** Wrangler Pages deploy
- **Secrets:** Set manually via wrangler CLI (no automation)

### 3.17 Build Architecture

- **Bundler:** Vite 6 with React plugin
- **Code splitting:** Manual chunks (vendor, state, UI) + React.lazy pages
- **CSS:** LightningCSS + PostCSS + Tailwind
- **Minification:** esbuild for JS, LightningCSS for CSS
- **No:** Bundle analysis, tree-shaking optimization, or preload hints

### 3.18 Testing Architecture

- **Unit tests:** Vitest + Testing Library (28 test files)
- **E2E tests:** Playwright (9 spec files)
- **Coverage:** ~2.5/10 — critically low
- **No:** Integration tests, API contract tests, or snapshot tests
- **No:** Component-level tests for 157 components (only 3 tested)
- **No:** Accessibility tests (axe-core, pa11y)

---

## 4 — Strengths

| # | Strength | Module | Impact |
|---|---|---|---|
| S1 | Clean layer separation: frontend (`src/`), API (`api/`), edge (`functions/`) | Architecture | Maintainability |
| S2 | Path-based route registry in `[...path].ts` with declarative auth/CSRF options | API Router | Security |
| S3 | Email module is intentionally self-contained (no Prisma import) | `api/_lib/email.ts` | Reliability |
| S4 | Per-user cart isolation via localStorage key suffix | `cart-store.ts` | Multi-tenancy |
| S5 | CSRF double-submit cookie pattern implemented | `api/_lib/csrf.ts` | Security |
| S6 | Rate limiting infrastructure with KV store | `api/_lib/rate-limit.ts` | Stability |
| S7 | CMS core type system with 20+ section definitions | `src/cms/core/` | Extensibility |
| S8 | All admin pages lazy-loaded with error boundaries | `AdminRoutes.tsx` | Robustness |
| S9 | Premium design system with custom Tailwind config | `tailwind.config.ts` | Consistency |
| S10 | Comprehensive Prisma schema with 34 models | `prisma/schema.prisma` | Data integrity |
| S11 | Edge-based SEO middleware with caching | `functions/_middleware.ts` | Performance |
| S12 | Zustand stores with fine-grained selectors | Store files | Re-render control |
| S13 | Vite manual chunks for vendor/state/UI separation | `vite.config.ts` | Bundle optimization |
| S14 | Connectivity provider for offline detection | Storefront | UX resilience |
| S15 | SafeImage with premium fallbacks and retry logic | `SafeImage.tsx` | UX quality |
| S16 | Turnstile bot protection on auth + contact routes | Router | Security |
| S17 | Audit logging infrastructure | `api/_lib/audit.ts` | Compliance |
| S18 | Session management with hashed tokens | `auth-middleware.ts` | Security |
| S19 | Sitemap and robots.txt dynamically generated from DB | `site-files.ts` | SEO |
| S20 | Service worker with cache-first image strategy | `public/sw.js` | Offline support |

---

## 5 — Weaknesses

| # | Weakness | Severity | Category |
|---|---|---|---|
| W1 | String-based action dispatch (no type safety between route and handler) | High | Architecture Pattern |
| W2 | Auth handler (1,194 lines) violates single-responsibility principle | High | Module Size |
| W3 | Payments handler (1,058 lines) monolithic | High | Module Size |
| W4 | Admin API client god object (399 lines, all domains) | High | Coupling |
| W5 | `getEnv()` called independently per handler (bypasses context) | High | Architecture Pattern |
| W6 | SEO middleware queries DB directly with per-instance cache | High | Scalability |
| W7 | No request ID propagation across layers | High | Observability |
| W8 | Inconsistent error response shapes across API surface | Medium | API Design |
| W9 | CheckoutPage.tsx (895 lines) oversized | Medium | Component Size |
| W10 | HomepageBuilder.tsx (1,453 lines) is a megacomponent | Medium | Component Size |
| W11 | HeaderBuilder.tsx (1,000 lines) oversized | Medium | Component Size |
| W12 | CMS core types (858 lines) tightly coupled to both admin and frontend | Medium | Coupling |
| W13 | API client reads localStorage directly (bypassing Zustand) | Medium | Architecture Pattern |
| W14 | No centralized error handling middleware | Medium | Architecture Pattern |
| W15 | TanStack Query cache not invalidated on admin mutations | Medium | State Management |
| W16 | Auth tokens in localStorage (XSS exposure) | High | Security Architecture |
| W17 | No Durable Objects, Queues, or scheduled Workers configured | Medium | Cloudflare |
| W18 | No database migration strategy for zero-downtime deploys | Medium | Deployment |
| W19 | prisma.config.ts dead file at root | Low | Architecture |
| W20 | Catch-all `:slug` route creates soft 404s | Medium | Routing |
| W21 | Duplicate auth routes (`/login` and `/auth/login`) | Low | Routing |
| W22 | No build-time validation of environment variables | Medium | Build |
| W23 | AnalyticsEvent BigInt autoincrement potential overflow | Low | Database |
| W24 | csrf: false as default in auth middleware options | High | Security Architecture |
| W25 | No encrypted secrets at rest in database | Medium | Security |

---

## 6 — Module Analysis

### Scoring Methodology

Each module scored 1-10 based on:
- **Cohesion** — Are related things grouped together?
- **Coupling** — How much does it depend on other modules?
- **Size** — Is it appropriately sized for its responsibility?
- **Abstraction** — Is the interface clean and documented?
- **Testability** — Can it be tested in isolation?
- **Extensibility** — Can new features be added without modification?

### Module Scores

#### src/app/ (Bootstrap) — Score: 8/10
**Files:** `main.tsx`, `App.tsx`, `routes.tsx`  
**Lines:** ~180  
**Cohesion:** High. All bootstrap logic in one place.  
**Coupling:** High (imports from everywhere), but acceptable for bootstrap.  
**Issues:** No top-level error boundary above providers. A crash in QueryClientProvider or HelmetProvider takes down the entire app with no recovery UI.  
**Maintenance:** Low effort.  
**Scalability:** Fine — bootstrap doesn't scale.  
**Refactoring:** Easy.

#### src/storefront/ — Score: 7/10
**Files:** 74 files across pages, components, hooks, sections, layout, stores, lib  
**Lines:** ~15,000+  
**Cohesion:** Strong. Pages, components, hooks, sections are well-separated.  
**Coupling:** Moderate. Components import from hooks, hooks import from stores/api client.  
**Issues:**  
- CheckoutPage.tsx (895 lines) does too much  
- ProductDetailPage.tsx (612 lines) oversized  
- Hook files are thin wrappers (average ~20 lines) — good, but raises question of whether hooks are necessary  
- SectionRenderer and CMS core types have implicit contract (no TypeScript validation)  
**Maintenance:** Moderate. Page components need splitting.  
**Scalability:** Good — adding new pages is easy.  
**Refactoring:** Moderate.

#### src/admin/ — Score: 6.5/10
**Files:** 69 files  
**Lines:** ~20,000+  
**Cohesion:** Strong module-level separation (products/, orders/, cms/, etc.).  
**Coupling:** AdminPages import from `src/lib/api/admin.ts` (god object).  
**Issues:**  
- HomepageBuilder (1,453 lines) — extreme component size  
- HeaderBuilder (1,000 lines) — oversized  
- ProductFormPage (867 lines) — oversized  
- Admin API client is monolithic (399 lines)  
- No shared form validation between admin and storefront  
- Admin pages lack standardized loading skeletons  
**Maintenance:** High. Large components are difficult to modify.  
**Scalability:** Moderate. Adding new admin modules is easy but maintaining existing ones is hard.  
**Refactoring:** Difficult. Large components need decomposition.

#### src/components/ (Shared UI) — Score: 8/10
**Files:** 17 files (ui/ + shared)  
**Lines:** ~1,500  
**Cohesion:** High. Clean separation between UI primitives and shared components.  
**Coupling:** Low. UI components (Button, Input, etc.) have no internal dependencies.  
**Issues:**  
- Badge, Button, Card, Input, Label, Select, Toast — good primitives, but not exhaustive  
- No tooltip, dropdown, dialog, or modal in shared UI (admin has its own)  
**Maintenance:** Low.  
**Scalability:** Good.  
**Refactoring:** Easy.

#### src/hooks/ (Shared Hooks) — Score: 7/10
**Files:** 2 (`useAuth.ts`, `useFocusTrap.ts`)  
**Lines:** ~100  
**Cohesion:** Moderate. These are "leftover" hooks that didn't fit elsewhere.  
**Issues:** Only 2 hooks — storefront has 11, admin has its own. The division is arbitrary.  
**Maintenance:** Low.  
**Scalability:** Fine.  
**Refactoring:** Easy.

#### src/stores/ (Shared Stores) — Score: 7/10
**Files:** 2 (auth-store.ts, plus tests)  
**Lines:** ~83  
**Cohesion:** High for auth-store.  
**Issues:** Auth store uses localStorage for persistence (security concern). Cart store is in storefront/stores/, UI store in storefront/stores/ — naming inconsistency.  
**Maintenance:** Low.  
**Scalability:** Fine.  
**Refactoring:** Easy.

#### src/lib/ (Shared Frontend Utilities) — Score: 6/10
**Files:** 14 files across api/, razorpay/, utils/  
**Lines:** ~1,200  
**Cohesion:** Moderate. Mix of API client, SEO utilities, config, validation, sanitization.  
**Issues:**  
- Admin API client (399 lines) is a god object  
- SEO utility (227 lines) mixes Cloudinary URL construction with schema generation  
- API client has complex retry logic (320 lines)  
**Maintenance:** Moderate.  
**Scalability:** Fine.  
**Refactoring:** Moderate.

#### src/cms/ (CMS Core) — Score: 7/10
**Files:** 3 (cms-types.ts, hero-slides.ts, section-registry.ts)  
**Lines:** ~950  
**Cohesion:** High. Types and registry for CMS sections.  
**Issues:**  
- cms-types.ts (858 lines) is the largest "type definition" file — it's really a configuration + types hybrid  
- Tightly coupled to both admin editors and storefront renderers  
**Maintenance:** Moderate. Changing section types requires updating both admin and frontend.  
**Scalability:** Good — adding new section types is straightforward.  
**Refactoring:** Moderate.

#### api/_handlers/ (Public API Handlers) — Score: 5.5/10
**Files:** 19  
**Lines:** ~6,000+  
**Cohesion:** Varies. Products.ts is focused; auth.ts is scattered (12+ operations).  
**Issues:**  
- Auth handler (1,194 lines) — extreme  
- Payments handler (1,058 lines) — extreme  
- Checkout handler (647 lines) — oversized  
- Inconsistent error handling patterns  
- Missing Zod validation on many endpoints  
- Handlers call getEnv() instead of using ctx.env  
**Maintenance:** High. Auth and payments are the highest-risk files in the project.  
**Scalability:** Poor. Current pattern doesn't scale to more operations per domain.  
**Refactoring:** Difficult.

#### api/_handlers/admin/ (Admin API Handlers) — Score: 6.5/10
**Files:** 33  
**Lines:** ~8,000+  
**Cohesion:** Excellent — one file per domain (products, orders, categories, etc.).  
**Issues:**  
- Admin products handler (851 lines) — oversized  
- Some handlers missing Zod validation  
- No rate limiting on admin endpoints  
**Maintenance:** Moderate. Domain separation is good, but individual files are large.  
**Scalability:** Good — adding new admin domains is straightforward.  
**Refactoring:** Moderate.

#### api/_lib/ (Shared API Utilities) — Score: 7/10
**Files:** 18  
**Lines:** ~3,500  
**Cohesion:** Good. Well-separated utilities (auth, CSRF, rate limit, email, etc.).  
**Issues:**  
- env.ts's `getEnv()` is called everywhere instead of using context  
- Email templates (495 lines) inline — should be template files  
- Response helpers have inconsistent error shapes  
- No centralized error handler/serializer  
**Maintenance:** Moderate.  
**Scalability:** Good.  
**Refactoring:** Moderate.

#### functions/ (Edge Middleware) — Score: 6/10
**Files:** 4  
**Lines:** ~400  
**Cohesion:** High. SEO middleware does one thing well.  
**Issues:**  
- Per-instance LRU cache (doesn't scale horizontally)  
- Direct database query on every HTML page request cache miss  
- Hardcoded cache size (500 entries) and TTL (60s)  
- Fallback HTML on error instead of graceful degradation  
**Maintenance:** Low.  
**Scalability:** Poor. Each worker instance has its own cache.  
**Refactoring:** Easy.

#### prisma/ (Database Layer) — Score: 8/10
**Files:** schema.prisma (1,422 lines), seed.ts (1,003 lines), 11 migrations  
**Lines:** ~3,500  
**Cohesion:** Excellent. Schema is well-organized with clear module separation per model group.  
**Issues:**  
- Missing indexes (profile.email + isActive, orderItems.productId, etc.)  
- AnalyticsEvent BigInt autoincrement potential overflow  
- No cart expiration mechanism  
- Hardcoded UUIDs in seed data  
**Maintenance:** Low.  
**Scalability:** Good. Schema supports growth.  
**Refactoring:** Moderate (migrations).

#### scripts/ (Dev/Ops) — Score: 7/10
**Files:** 5  
**Lines:** ~600  
**Cohesion:** Good. Each script has a clear purpose.  
**Issues:** api-dev-server.ts is the only local dev tool; no database seed deduplication logic.  
**Maintenance:** Low.  
**Scalability:** N/A.  
**Refactoring:** Easy.

#### e2e/ — Score: 4/10
**Files:** 9 spec files  
**Lines:** ~1,200  
**Cohesion:** Good test coverage intent.  
**Issues:**  
- 9 spec files for 351 source files — near-zero coverage  
- Payment flow not tested  
- Checkout test is 94 lines only  
- Some tests may be fragile (admin-credentials.ts)  
**Maintenance:** Low (few tests to maintain).  
**Scalability:** N/A.  
**Refactoring:** Easy (rewrite rather than refactor).

#### .github/ — Score: 7/10
**Files:** 1 workflow  
**Lines:** ~50  
**Cohesion:** Single deploy workflow.  
**Issues:** No lint step before deploy. No test step. No preview deployments for PRs.  
**Maintenance:** Low.  
**Scalability:** N/A.  
**Refactoring:** Easy.

### Module Score Summary

| Module | Score | Risk | Maintenance | Scalability |
|---|---|---|---|---|
| src/app/ | 8/10 | Low | Easy | Good |
| src/storefront/ | 7/10 | Medium | Moderate | Good |
| src/admin/ | 6.5/10 | High | High | Moderate |
| src/components/ | 8/10 | Low | Easy | Good |
| src/hooks/ | 7/10 | Low | Easy | Good |
| src/stores/ | 7/10 | Medium | Low | Good |
| src/lib/ | 6/10 | Medium | Moderate | Good |
| src/cms/ | 7/10 | Medium | Moderate | Good |
| api/_handlers/ | 5.5/10 | **Critical** | High | **Poor** |
| api/_handlers/admin/ | 6.5/10 | Medium | Moderate | Good |
| api/_lib/ | 7/10 | Medium | Moderate | Good |
| functions/ | 6/10 | Medium | Low | **Poor** |
| prisma/ | 8/10 | Low | Low | Good |
| scripts/ | 7/10 | Low | Low | N/A |
| e2e/ | 4/10 | **Critical** | Low | N/A |
| .github/ | 7/10 | Low | Low | N/A |

---

## 7 — Folder Analysis

### Root Level

| Path | Score | Assessment |
|---|---|---|
| `api/` | 6/10 | Good structure, some monolithic handlers |
| `functions/` | 6/10 | Solid middleware, scaling concern with per-instance cache |
| `src/` | 7/10 | Clean separation, CMS coupling concern |
| `prisma/` | 8/10 | Well-organized schema and migrations |
| `public/` | 8/10 | Well-configured static assets |
| `e2e/` | 4/10 | Critically low coverage |
| `scripts/` | 7/10 | Adequate dev tooling |
| `.github/` | 7/10 | Minimal CI missing test step |

### src/ Subdirectories

| Path | Score | Assessment |
|---|---|---|
| `src/app/` | 8/10 | Clean bootstrap |
| `src/admin/` | 6.5/10 | Well-organized modules, oversized components |
| `src/storefront/` | 7/10 | Well-organized, some oversized pages |
| `src/components/` | 8/10 | Clean UI primitives |
| `src/hooks/` | 7/10 | Arbitrary division from storefront hooks |
| `src/stores/` | 7/10 | Fine, auth-store has security concern |
| `src/lib/` | 6/10 | Good utilities, god object admin client |
| `src/cms/` | 7/10 | Solid type definitions, large single file |
| `src/pages/` | 7/10 | Auth pages well-organized |
| `src/types/` | 7/10 | Minimal type definitions |
| `src/styles/` | 8/10 | Clean global CSS |

### api/ Subdirectories

| Path | Score | Assessment |
|---|---|---|
| `api/_handlers/` | 5.5/10 | Mixed — good domain split, monolithic auth/payments |
| `api/_handlers/admin/` | 6.5/10 | Good domain split, some oversized files |
| `api/_handlers/__tests__/` | 5/10 | Insufficient test coverage |
| `api/_lib/` | 7/10 | Well-separated utilities |
| `api/_lib/__tests__/` | 6/10 | Better test coverage than handlers |

---

## 8 — Dependency Analysis

### Package Dependencies

```
react 19.1          ─── react-dom 19.1
react-router-dom 7.5 ─── (peer: react)
zustand 5.0.3        ─── standalone
@tanstack/react-query 5.75 ─── standalone
framer-motion 12.9   ─── standalone
@supabase/supabase-js 2.49 ─── standalone
@prisma/client 6.6   ─── @prisma/adapter-neon 6.6
                    ─── @neondatabase/serverless 1.1
zod 3.24             ─── standalone
@dnd-kit/core 6.3    ─── @dnd-kit/sortable 10.0 (version mismatch)
                    ─── @dnd-kit/utilities 3.2 (version mismatch)
class-variance-authority ─── standalone
tailwind-merge       ─── clsx
```

**Circular Dependency Check:** None found. The dependency graph is a DAG.

**Version Mismatch Concerns:**
- `@dnd-kit/core` v6.3.1 and `@dnd-kit/sortable` v10.0.0 have a 4-major-version gap — suggests migration leftover or incompatible versions
- `@dnd-kit/utilities` v3.2.2 is 7 major versions behind `@dnd-kit/sortable` — likely unused

### Import Dependency Flow

```
src/app/ ──→ src/pages/, src/storefront/, src/admin/, src/components/, src/hooks/
src/storefront/ ──→ src/lib/api/, src/stores/, src/storefront/stores/, src/cms/core/
src/admin/ ──→ src/lib/api/admin.ts, src/components/, src/cms/core/
src/lib/api/admin.ts ──→ src/lib/api/client.ts
src/lib/api/client.ts ──→ src/stores/auth-store.ts (localStorage bypass)
src/storefront/stores/cart-store.ts ──→ src/stores/auth-store.ts, src/lib/api/client.ts
src/hooks/useAuth.ts ──→ src/stores/auth-store.ts, src/lib/api/auth.ts
api/[...path].ts ──→ api/_handlers/*, api/_lib/*
api/_handlers/* ──→ api/_lib/* (prisma, response, auth-middleware, validate, etc.)
functions/_middleware.ts ──→ api/_lib/prisma.ts, api/_lib/env.ts
```

### Key Dependency Issues

1. **API client reads localStorage directly** (`src/lib/api/client.ts:44-58`) instead of reading from Zustand auth-store. This bypasses the state management layer.

2. **cart-store imports auth-store** (`src/storefront/stores/cart-store.ts:4`) for session checking. This creates a cross-module dependency between stores.

3. **functions/_middleware.ts imports from api/_lib/** — this is acceptable (edge middleware is part of the backend), but it means the SEO middleware has database access, creating a hidden dependency chain.

4. **Admin components import from admin-specific API client**, which imports from the base API client — clean until you realize the base client reads localStorage.

5. **CMS core types imported by both admin and storefront** — creates a mandatory shared dependency. Changing section types requires coordinated changes in both consumers.

---

## 9 — Coupling Analysis

### Tight Coupling (High Concern)

| # | Description | Modules | Severity |
|---|---|---|---|
| C1 | API client reads localStorage directly | `client.ts`, `auth-store.ts` | High |
| C2 | Cart store couples to auth store | `cart-store.ts`, `auth-store.ts` | Medium |
| C3 | Handlers call getEnv() instead of using ctx | All handlers, `env.ts` | High |
| C4 | SEO middleware couples to Prisma | `_middleware.ts`, Prisma | Medium |
| C5 | Admin API client couples all admin domains | `admin.ts` → all admin pages | High |
| C6 | cms-types.ts couples admin editors to storefront renderers | `cms/core/`, admin, storefront | Medium |
| C7 | Error response shape varies by handler | All handlers | Medium |
| C8 | Build script couples to external services | Build, Prisma, Neon | Medium |

### Hidden Coupling (Moderate Concern)

| # | Description | Impact |
|---|---|---|
| H1 | Service worker hardcodes cache version and paths | `sw.js` must be kept in sync with Vite output |
| H2 | Turnstile site key + secret coupled across frontend and backend | Frontend key in env, backend key in secrets |
| H3 | Order status flow defined in both frontend constants and backend | `constants.ts` and schema enum must agree |
| H4 | Cloudinary URL construction duplicated in seo.ts and middleware | Two implementations of `img()` and `absoluteUrl()` |
| H5 | Admin Edit/New forms share the same component | `ProductFormPage.tsx` used for both create and edit |

### Loose/Good Coupling (Low Concern)

| # | Description | Reason |
|---|---|---|
| G1 | Email module | No Prisma import, fully self-contained |
| G2 | UI components (Button, Input, etc.) | No internal dependencies |
| G3 | Zustand stores | Independent, no cross-store references (except cart→auth) |
| G4 | API handler → _lib imports | Clear, explicit import chains |
| G5 | Storefront hooks → API client | Thin wrappers, replaceable |

### Feature Leakage

| # | Description | Location |
|---|---|---|
| L1 | Checkout logic in router-level middleware | `[...path].ts` lines 28-43: `isAuthPath()` and `requiresTurnstile()` — routing concern mixed with business logic |
| L2 | Cloudinary URL construction in SEO utility | `seo.ts`: `img()` function mixes SEO with media transformation |
| L3 | Cart total calculation duplicated in store and API | `cart-store.ts` calculates totals client-side; checkout handler recalculates server-side |

---

## 10 — Layer Analysis

### Layer Architecture

```
Layer 0: Static Assets     public/ (headers, sw.js, images)
Layer 1: Edge Middleware   functions/ (SEO, sitemap)
Layer 2: API Router        api/[...path].ts (routing, security middleware)
Layer 3: Handlers          api/_handlers/ (business logic)
Layer 4: Shared Lib        api/_lib/ (utilities, DB access)
Layer 5: Database          prisma/ (schema, migrations)
---

Layer A: Bootstrap         src/app/ (main, routes)
Layer B: Pages             src/storefront/pages/, src/admin/, src/pages/
Layer C: Components        src/storefront/components/, src/components/
Layer D: State             src/stores/, src/storefront/stores/
Layer E: API Client        src/lib/api/ (HTTP layer)
Layer F: Utilities         src/lib/, src/cms/, src/hooks/
```

### Layer Violations

| # | Violation | From | To | Severity |
|---|---|---|---|---|
| V1 | Middleware queries DB directly | Layer 1 | Layer 5 | High — bypasses API layer, creates database dependency at edge |
| V2 | API client reads localStorage | Layer E | Layer D | Medium — bypasses Zustand state management |
| V3 | Router has business logic | Layer 2 | — | Medium — `isAuthPath()` and `requiresTurnstile()` are domain logic in routing |
| V4 | SEO utility does media URLs | Layer F | — | Low — mixing concerns in utility layer |

### Analysis

The frontend layering is clean: Bootstrap → Routes → Pages → Components → Hooks → Stores/API Client. Each layer depends only on the layer below. No circular or upward dependencies.

The backend layering is also clean: Entry point → Security middleware → Handler dispatch → Handler → _lib utilities → Prisma → Database.

The edge middleware (functions/) is the only layer violation — it bypasses the API layer entirely and queries the database directly. This is a pragmatic decision for SEO performance, but it creates a second database access path that bypasses all API-level security, rate limiting, and validation.

---

## 11 — Scalability Report

### Horizontal Scaling

| Component | Scalability | Assessment |
|---|---|---|
| Static assets (Cloudflare CDN) | Excellent | Cloudflare edge serves from 330+ locations |
| SPA (Client-side rendering) | Excellent | No server rendering — static assets scale infinitely |
| API Functions (Cloudflare) | Good | Functions scale per-request, but cold starts may impact latency |
| SEO Middleware (per-instance cache) | **Poor** | `Map<string, {expiresAt, payload}>` is per-worker-instance. With N workers, cache hit rate is ~1/N. Under high traffic, cache misses cause N database queries for the same page. |
| PostgreSQL (Neon) | Good | Serverless PostgreSQL with connection pooling |
| KV (Rate limiting) | Good | Cloudflare KV is globally distributed |
| Session database | Moderate | Sessions stored in PostgreSQL — all auth requests hit the database |

### Vertical Scaling

| Resource | Current | Future Need |
|---|---|---|
| Database schema | 34 models | Supports 100+ without redesign |
| API endpoints | 200+ | Supports 500+ with handler-per-file pattern |
| Frontend pages | ~77 | Supports 200+ with lazy loading |
| Admin modules | 37 | Supports 50+ |

### Scaling Bottlenecks

1. **SEO Middleware Cache** — The #1 scaling concern. Per-instance in-memory LRU cache (500 entries, 60s TTL) means each Cloudflare worker instance independently queries the database on cache miss. With 100+ concurrent workers, the same page could be queried 100+ times per 60 seconds.

2. **Auth Performance** — Every authenticated API request checks against the `auth_sessions` table in PostgreSQL. No Redis or distributed cache for session data. Under high load, this becomes a database bottleneck.

3. **Product Search** — Uses `fullTextSearchPostgres` Prisma feature. No dedicated search infrastructure (Algolia, MeiliSearch, Typesense). Search performance degrades with product catalog size.

4. **Cart Operations** — Cart data stored in PostgreSQL and localStorage. No KV caching for cart reads.

5. **Rate Limiting KV** — Single KV namespace used for rate limiting. KV is eventually consistent — under high write volume, rate limit counts may be stale.

### Recommendation for Scale

- Replace SEO middleware cache with Cloudflare KV + longer TTL (300s+)
- Add Redis/Upstash for session caching
- Migrate search to dedicated search service at 10,000+ products
- Add KV caching for cart reads and product listings
- Implement Durable Objects for rate limiting (strong consistency)

---

## 12 — Maintainability Report

### Code Volume

| Metric | Value | Assessment |
|---|---|---|
| Total TS/TSX files | 351 | Manageable |
| Total LOC | 64,248 | Moderate |
| Files > 500 lines | ~25 | Needs attention |
| Files > 1,000 lines | 4 | **Critical** |
| Average file size | ~183 lines | Good |

### Complexity Hotspots

| File | Lines | Complexity | Risk |
|---|---|---|---|
| `src/admin/cms/HomepageBuilder.tsx` | 1,453 | Extreme | High |
| `api/_handlers/auth.ts` | 1,194 | Extreme | **Critical** |
| `api/_handlers/payments.ts` | 1,058 | Extreme | **Critical** |
| `prisma/seed.ts` | 1,003 | High | Low |
| `src/admin/cms/HeaderBuilder.tsx` | 1,000 | Extreme | High |
| `prisma/schema.prisma` | 1,422 | Medium | Low |
| `api/[...path].ts` | 671 | Medium | Medium |
| `src/storefront/pages/CheckoutPage.tsx` | 895 | High | High |
| `src/admin/products/ProductFormPage.tsx` | 867 | High | High |
| `api/_handlers/admin/products.ts` | 851 | High | Medium |
| `src/cms/core/cms-types.ts` | 858 | Medium | Medium |
| `src/admin/theme/ThemeBuilder.tsx` | 813 | High | Medium |

### Team Onboarding Difficulty

| Aspect | Difficulty | Rationale |
|---|---|---|
| Understanding folder structure | Easy (2-3 hours) | Clean separation, clear naming |
| Understanding API routing | Moderate (1 day) | String-based action dispatch requires reading the router registry |
| Understanding database schema | Moderate (1 day) | 34 models, comments in schema |
| Working on auth | Hard (2-3 days) | 1,194 lines, mixes Supabase + custom session management |
| Working on payments | Hard (2-3 days) | 1,058 lines, Razorpay integration + webhook + verification |
| Working on admin CMS | Hard (2-3 days) | HomepageBuilder 1,453 lines, HeaderBuilder 1,000 |
| Adding a new API endpoint | Easy (2-4 hours) | Add route in [...path].ts, create handler file |
| Adding a new frontend page | Easy (2-4 hours) | Create page, add lazy import, add route |
| End-to-end debugging | Hard | No request IDs, no logging infrastructure, no error monitoring |

### Future Maintenance Projections

| Scenario | Effort | Risk |
|---|---|---|
| Add payment method | 3-5 days | High — payments handler must be refactored first |
| Add OAuth login | 5-10 days | High — auth handler must be refactored first |
| Add admin bulk edit | 3-5 days | Medium — admin API client refactoring recommended |
| Add Storefront section | 1-2 days | Low — good CMS architecture |
| Add database migration | 1-2 hours | Low — Prisma migrations work well |
| Add admin module | 1-2 days | Low — well-established pattern |
| Upgrade dnd-kit | 2-4 hours | Medium — version mismatch may surface issues |

---

## 13 — Technical Debt

### Critical (Must Fix Before Scaling)

| ID | Item | Location | Effort |
|---|---|---|---|
| TD-01 | Auth handler monolith | `api/_handlers/auth.ts` (1,194 lines) | 2-3 days |
| TD-02 | Payments handler monolith | `api/_handlers/payments.ts` (1,058 lines) | 1-2 days |
| TD-03 | Admin API client god object | `src/lib/api/admin.ts` (399 lines) | 1-2 days |
| TD-04 | Per-instance SEO cache | `functions/_middleware.ts` | 1-2 days |
| TD-05 | String-based action dispatch | `api/[...path].ts` | 3-5 days |
| TD-06 | getEnv() scattered across handlers | All handlers + `env.ts` | 2-3 days |
| TD-07 | API client localStorage bypass | `src/lib/api/client.ts` | 1-2 days |
| TD-08 | CSRF default disabled | `api/_lib/auth-middleware.ts` (line 45) | 1 day |
| TD-09 | Missing request ID propagation | All layers | 1-2 days |
| TD-10 | Inconsistent error response shapes | All handlers | 1-2 days |

### High

| ID | Item | Location | Effort |
|---|---|---|---|
| TD-11 | HomepageBuilder megacomponent | `src/admin/cms/HomepageBuilder.tsx` (1,453 lines) | 3-5 days |
| TD-12 | HeaderBuilder oversized | `src/admin/cms/HeaderBuilder.tsx` (1,000 lines) | 2-3 days |
| TD-13 | CheckoutPage oversized | `src/storefront/pages/CheckoutPage.tsx` (895 lines) | 2-3 days |
| TD-14 | ProductFormPage oversized | `src/admin/products/ProductFormPage.tsx` (867 lines) | 2-3 days |
| TD-15 | Admin products handler oversized | `api/_handlers/admin/products.ts` (851 lines) | 1-2 days |
| TD-16 | CMS types file too large | `src/cms/core/cms-types.ts` (858 lines) | 1 day |
| TD-17 | Cart expiration not implemented | `prisma/schema.prisma` | 1 day |
| TD-18 | Missing database indexes | `prisma/schema.prisma` | 1 day |
| TD-19 | Auth tokens in localStorage | `src/stores/auth-store.ts` | 2-3 days |
| TD-20 | No TanStack Query cache invalidation strategy | All admin pages | 2-3 days |

### Medium

| ID | Item | Effort |
|---|---|---|
| TD-21 | prisma.config.ts dead file | 30 min |
| TD-22 | dnd-kit version mismatch | 1 hour |
| TD-23 | Duplicate auth routes | 2 hours |
| TD-24 | Mixed styling paradigms (Tailwind + CVA + CSS classes) | 5-10 days |
| TD-25 | Hardcoded strings (no i18n) | 5-10 days |
| TD-26 | Seed data uses Unsplash images | 1-2 days |
| TD-27 | No bundle analysis | 1 day |
| TD-28 | Service worker cache version manual bump | 30 min |
| TD-29 | API dev server has no watcher for file changes (uses `tsx watch`) | 1 hour |
| TD-30 | No pre-deploy secret validation | 1 day |

### Estimated Debt Resolution

| Priority | Items | Estimated Effort |
|---|---|---|
| Critical (TD-01 to TD-10) | 10 | 15-25 days |
| High (TD-11 to TD-20) | 10 | 20-30 days |
| Medium (TD-21 to TD-30) | 10 | 10-20 days |
| **Total** | **30** | **45-75 days** |

---

## 14 — Architecture Smells

| # | Smell | Location | Severity | Description |
|---|---|---|---|---|
| AS-01 | **Action Enum Switch** | `api/[...path].ts` | High | Routes dispatch to handlers via string action parameter (`"list"`, `"detail"`, `"register"`, etc.). No type safety — a typo in the string silently fails at runtime. The pattern forces a single handler function to switch on all possible actions. |
| AS-02 | **Env Scattering** | All handlers | High | `getEnv()` is called in every handler instead of receiving env through context. The `RequestContext` type has an `env?: Env` field, but most handlers ignore it and call `getEnv()` again. |
| AS-03 | **Dead Middleware Options** | `api/_lib/auth-middleware.ts` | High | `csrf: false` is the default. CSRF validation infrastructure exists but is opt-in, not opt-out. Most mutation endpoints don't enable it. |
| AS-04 | **Global State in API Client** | `src/lib/api/client.ts` | Medium | Module-level variables (`isRefreshing`, `refreshPromise`, `refreshRetryCount`, `csrfInitialized`) create implicit global state. Multiple concurrent requests could interact badly. |
| AS-05 | **Shared Mutations** | `src/lib/api/client.ts` | Medium | `setStoredTokens()` and `getStoredAuth()` directly read/write `localStorage` — sharing state with the Zustand auth-store through external storage. Two state managers for the same data. |
| AS-06 | **Fat Interface** | `src/cms/core/cms-types.ts` | Medium | 858 lines for type definitions indicates the interface is too fat. Section type definitions should be separated from field definitions from configuration. |
| AS-07 | **Hidden DB Path** | `functions/_middleware.ts` | High | SEO middleware creates a second code path to the database that bypasses the API layer. Middleware should call an API endpoint or use KV cache, not query Prisma directly. |
| AS-08 | **Per-Instance Cache** | `functions/_middleware.ts` | High | `const cachedSeo = new Map<string, {expiresAt, payload}>()` is in module scope. Each worker instance has its own cache. This doesn't scale horizontally. |
| AS-09 | **N+1 Ready** | `api/_handlers/products.ts` | Medium | Product listing may not eagerly load variants/images. Under load, this becomes N+1 queries. |
| AS-10 | **Implied Contracts** | `src/cms/core/`, admin, storefront sections | Medium | Section data flows from admin → database → frontend as JSON. No TypeScript validation that the contract is satisfied at runtime. |
| AS-11 | **God Imports** | `src/lib/api/admin.ts` | High | Single file exports 50+ API functions. Importing any admin API function bundles all of them (limited tree-shaking impact since API calls are runtime, but conceptually wrong). |
| AS-12 | **Provider Tower** | `src/app/main.tsx`, `src/app/App.tsx` | Low | 10 providers wrapping the app (StrictMode, Helmet, Connectivity, QueryClient, Router, Toaster, Suspense, ErrorBoundary, AuthLoader, GoogleAnalytics). Getting close to "provider hell." |

---

## 15 — Risk Assessment

### Architecture Risks

| ID | Risk | Probability | Impact | Score | Mitigation |
|---|---|---|---|---|---|
| R-01 | Auth handler failure brings down entire auth system | Low | **Critical** | High | Split into domain modules (TD-01) |
| R-02 | Payment handler failure causes revenue loss | Low | **Critical** | High | Split into domain modules (TD-02) |
| R-03 | SEO cache miss storm during traffic spike | Medium | High | High | Replace with shared KV cache (TD-04) |
| R-04 | CSRF not enabled on mutation endpoints | Medium | **Critical** | High | Make csrf: true default (TD-08) |
| R-05 | getEnv() returns inconsistent values | Low | Medium | Low | Use context consistently (TD-06) |
| R-06 | Token storage in localStorage allows XSS theft | Medium | **Critical** | High | Use httpOnly cookies (TD-19) |
| R-07 | API client global state causes race conditions | Low | Medium | Low | Refactor to instance-based (AS-04) |
| R-08 | Database N+1 under product listing load | Medium | Medium | Medium | Eager load relations (AS-09) |
| R-09 | AnalyticsEvent BigInt overflow | Very Low | Low | Very Low | Switch to UUID (DB-05) |
| R-10 | Cart database bloat with no expiration | High | Medium | High | Implement cart cleanup (TD-17) |

### Business Risks

| ID | Risk | Impact |
|---|---|---|
| BR-01 | No abandoned cart recovery — 70%+ cart abandonment rate in fashion = lost revenue | **Critical** |
| BR-02 | No error monitoring — production outages go undetected | **Critical** |
| BR-03 | No automated email notifications — orders placed but not confirmed | **Critical** |
| BR-04 | No database backup verification — data loss unrecoverable | **Critical** |
| BR-05 | No SEO structured data in HTML — Google may not index content properly | High |
| BR-06 | No accessibility compliance — legal risk in regulated markets | High |

### Technical Risks

| ID | Risk | Impact |
|---|---|---|
| TR-01 | Prisma + Neon adapter compatibility with Cloudflare Workers | Medium |
| TR-02 | nodejs_compat flag may stop supporting needed Node APIs | Low |
| TR-03 | Razorpay webhook delivery guarantees vs. idempotency handling | Medium |
| TR-04 | KV rate limiting consistency in high-throughput scenarios | Medium |

---

## 16 — Refactoring Opportunities

These are documented for planning purposes. **Do NOT implement during Phase 2.**

### Critical Priority (Must Refactor)

| # | Opportunity | Current | Target | Effort |
|---|---|---|---|---|
| RF-01 | Split auth handler | Single 1,194-line file | Domain modules (login, register, password, sessions, email, profile) | 2-3 days |
| RF-02 | Split payments handler | Single 1,058-line file | Verify + webhook + order update + notification modules | 1-2 days |
| RF-03 | Split admin API client | Single 399-line file | Domain-specific API modules | 1-2 days |
| RF-04 | Replace string-based dispatch | `switch(action)` in handler functions | Handler-per-operation or class-based dispatch | 3-5 days |
| RF-05 | Centralize env access | `getEnv()` in every handler | Pass `env` through `RequestContext` consistently | 2-3 days |
| RF-06 | Replace SEO cache | Per-instance LRU `Map` | Cloudflare KV with 300s TTL | 1-2 days |
| RF-07 | Propagate request IDs | None | `x-request-id` header through all layers | 1-2 days |
| RF-08 | Standardize error responses | Inconsistent shapes | Unified `{success, error: {code, message, details}}` | 1-2 days |
| RF-09 | Make CSRF opt-out | `csrf: false` default | `csrf: true` default, opt-out for webhooks | 1 day |
| RF-10 | Isolate API client from localStorage | Reads localStorage directly | Read auth tokens from Zustand store | 1-2 days |

### High Priority

| # | Opportunity | Effort |
|---|---|---|
| RF-11 | Decompose HomepageBuilder (1,453 → ~300 lines) | 3-5 days |
| RF-12 | Decompose HeaderBuilder (1,000 → ~300 lines) | 2-3 days |
| RF-13 | Decompose CheckoutPage (895 → ~400 lines) | 2-3 days |
| RF-14 | Decompose ProductFormPage (867 → ~400 lines) | 2-3 days |
| RF-15 | Split admin products handler (851 → ~300 lines) | 1-2 days |
| RF-16 | Split cms-types.ts into domain files | 1 day |
| RF-17 | Redirect duplicate auth routes | 2 hours |
| RF-18 | Move catch-all route to after all defined routes | 4 hours |
| RF-19 | Standardize component naming (src/components/ vs storefront/components/) | 1 day |
| RF-20 | Add cache invalidation strategy for TanStack Query | 2-3 days |

### Medium Priority

| # | Opportunity | Effort |
|---|---|---|
| RF-21 | Standardize styling (Tailwind + CVA + CSS classes → one pattern) | 5-10 days |
| RF-22 | Extract email templates to separate files | 1-2 days |
| RF-23 | Add i18n infrastructure | 5-10 days |
| RF-24 | Implement granular error boundaries in pages | 2-3 days |
| RF-25 | Add product eager loading (fix N+1) | 1 day |
| RF-26 | Add database indexes | 1 day |
| RF-27 | Implement cart expiration | 1 day |
| RF-28 | Remove dead code (prisma.config.ts, unused dnd-kit packages) | 1 hour |
| RF-29 | Add pre-deploy secrets validation | 1 day |
| RF-30 | Add bundle analysis to build | 1 day |

---

## 17 — Priority Matrix

### Impact vs. Effort

```
                    HIGH IMPACT
                        │
                        │
     RF-01 (2-3d) ●     │     ● RF-04 (3-5d)
     RF-02 (1-2d) ●     │     ● RF-05 (2-3d)
     RF-03 (1-2d) ●     │     ● RF-06 (1-2d)
     RF-08 (1-2d) ●     │     ● RF-09 (1d)
     RF-10 (1-2d) ●     │     ● RF-07 (1-2d)
                        │
     LOW EFFORT ──────────────── HIGH EFFORT
                        │
     RF-17 (2h)   ●     │     ● RF-11 (3-5d)
     RF-18 (4h)   ●     │     ● RF-12 (2-3d)
     RF-19 (1d)   ●     │     ● RF-13 (2-3d)
     RF-21 (5-10d)●     │     ● RF-14 (2-3d)
                        │     ● RF-20 (2-3d)
                    LOW IMPACT
```

### Top 10 Refactoring Candidates (By Impact/Effort Ratio)

| Rank | Item | Impact | Effort | Ratio |
|---|---|---|---|---|
| 1 | RF-09: CSRF opt-out → opt-in | High | 1 day | ★★★★★ |
| 2 | RF-02: Split payments handler | Critical | 1-2 days | ★★★★★ |
| 3 | RF-03: Split admin API client | High | 1-2 days | ★★★★★ |
| 4 | RF-08: Standardize error responses | High | 1-2 days | ★★★★★ |
| 5 | RF-10: Isolate API client from localStorage | High | 1-2 days | ★★★★★ |
| 6 | RF-01: Split auth handler | Critical | 2-3 days | ★★★★ |
| 7 | RF-07: Propagate request IDs | High | 1-2 days | ★★★★ |
| 8 | RF-06: Replace SEO cache | High | 1-2 days | ★★★★ |
| 9 | RF-17: Redirect duplicate auth routes | Medium | 2 hours | ★★★★ |
| 10 | RF-18: Fix catch-all route soft 404s | Medium | 4 hours | ★★★★ |

---

## 18 — Architecture Score

### Overall Architecture Score: 6.8/10

| Dimension | Score | Rationale |
|---|---|---|
| **Module Boundaries** | 7.5/10 | Clean domain separation in API handlers (33 admin files), storefront components, and admin modules. Some monolithic files violate boundaries. |
| **Layering** | 7.0/10 | Clear frontend (src/) and backend (api/) separation. Edge middleware (functions/) is a layer violator. |
| **Coupling** | 6.0/10 | Tight coupling between API client and localStorage, auth-store and cart-store. God object admin API client. |
| **Cohesion** | 7.5/10 | Most modules have high internal cohesion. Auth and payments are the exceptions. |
| **Abstraction** | 6.0/10 | String-based action dispatch is poor abstraction. Inconsistent error shapes. No request ID abstraction. |
| **Data Flow** | 7.0/10 | Clean request → router → handler → Prisma → response flow. Frontend data flow via TanStack Query is clean. |
| **Dependency Management** | 7.5/10 | No circular dependencies. Package versions are reasonable (except dnd-kit). |
| **Extensibility** | 6.5/10 | Adding new domains is easy. Modifying existing domains (auth, payments) is hard. CMS is extensible. |
| **Testability** | 4.0/10 | Handlers are difficult to test without database. Components are hard to test due to store coupling. |
| **Scalability** | 6.0/10 | Edge middleware cache is the main bottleneck. Auth sessions in PostgreSQL. No search infrastructure. |

### Score Distribution

```
        Module Boundaries  ██████████░░ 7.5
        Layering           █████████░░░ 7.0
        Coupling           ████████░░░░ 6.0
        Cohesion           ██████████░░ 7.5
        Abstraction        ████████░░░░ 6.0
        Data Flow          █████████░░░ 7.0
        Dependencies       ██████████░░ 7.5
        Extensibility      ████████░░░░ 6.5
        Testability        █████░░░░░░░ 4.0
        Scalability        ████████░░░░ 6.0
        ──────────────────────────────────
        OVERALL            ███████░░░░░ 6.8
```

---

## 19 — Enterprise Readiness Score

### Overall Enterprise Readiness: 5.8/10

| Criterion | Score | Assessment |
|---|---|---|
| **Security Architecture** | 5.5/10 | Good foundations (CSP, CSRF infrastructure, rate limiting). Critical gaps: CSRF not enforced, localStorage tokens, no account lockout, no MFA. |
| **Scalability Architecture** | 6.0/10 | Generally good for moderate scale. SEO cache is bottleneck. No search service. No session caching. |
| **Reliability** | 5.0/10 | No error monitoring. No health checks. No backup verification. Single point of failure in auth/payments handlers. |
| **Observability** | 3.5/10 | No request IDs. No structured logging. No tracing. No metrics. Console statements removed (good) but nothing to replace them. |
| **Compliance** | 4.0/10 | No accessibility compliance. No GDPR/CCPA infrastructure. No audit trail for data deletion. No cookie consent. |
| **Multi-tenancy** | 5.0/10 | Single-tenant. Per-user cart isolation is good. No multi-vendor or multi-organization support. |
| **Internationalization** | 2.5/10 | Bengali brand name. English-only UI. No i18n infrastructure. No multi-currency. |
| **Deployment** | 7.0/10 | Cloudflare Pages + GitHub Actions. Build pipeline works. Secrets as env vars. No preview deployments. No rollback strategy. |
| **Monitoring** | 2.0/10 | No monitoring. No alerting. No dashboards. Google Analytics is the only telemetry. |
| **Disaster Recovery** | 4.0/10 | No backup verification. No failover plan. No data recovery testing. |

### Enterprise Gaps Summary

| Gap | Severity | Priority |
|---|---|---|
| No error monitoring (Sentry, Datadog, etc.) | **Critical** | Immediate |
| No request ID / tracing | High | Phase 1 |
| No structured logging | High | Phase 1 |
| No health check endpoint | High | Phase 1 |
| No database backup verification | **Critical** | Immediate |
| No accessibility compliance | High | Phase 1 |
| No i18n infrastructure | Medium | Phase 2 |
| No multi-currency | Medium | Phase 2 |
| No cookie consent | Medium | Phase 1 |
| No SLA/SLO definition | Medium | Phase 2 |

---

## 20 — Cloudflare Readiness Score

### Overall Cloudflare Readiness: 7.0/10

| Criterion | Score | Assessment |
|---|---|---|
| **Pages Configuration** | 8.0/10 | Solid config, wrangler.jsonc is clean |
| **Functions Architecture** | 6.5/10 | Well-organized handlers, but string-based dispatch is fragile |
| **Edge Middleware** | 6.0/10 | SEO middleware works well, cache doesn't scale |
| **KV Usage** | 5.0/10 | Single KV namespace for rate limiting only — underutilized |
| **Security (Turnstile)** | 8.0/10 | Good bot protection implementation |
| **Security Headers** | 8.0/10 | CSP, HSTS, CORS well-configured |
| **Build Integration** | 7.5/10 | Build script works, no preview deployments |
| **Secrets Management** | 7.0/10 | Pages secrets used correctly, no automation |
| **Wrangler Features** | 4.0/10 | Minimal config — not using D1, R2, Queues, DO, Analytics, or smart placement |
| **Observability** | 3.0/10 | No Workers Analytics, no Tail Workers, no logging |

### Cloudflare Optimization Opportunities

| # | Opportunity | Effort | Impact |
|---|---|---|---|
| CF-O1 | Add KV cache for SEO metadata | 1-2 days | High — fixes scaling bottleneck |
| CF-O2 | Add KV cache for product listings | 2-3 days | High — reduces DB load |
| CF-O3 | Implement session caching with KV | 2-3 days | Medium — reduces auth DB queries |
| CF-O4 | Configure Cloudflare Web Analytics | 1 hour | Medium — basic traffic insights |
| CF-O5 | Add Tail Worker for logging | 1-2 days | Medium — observability |
| CF-O6 | Evaluate Durable Objects for rate limiting | 2-3 days | Low — strong consistency |
| CF-O7 | Evaluate D1 for analytics event storage | 2-3 days | Low — offload from PostgreSQL |
| CF-O8 | Add preview deployments | 1 day | Medium — PR review workflow |

---

## 21 — Developer Experience Score

### Overall Developer Experience: 6.0/10

| Criterion | Score | Assessment |
|---|---|---|
| **Onboarding Time** | 6.0/10 | ~3-5 days to be productive. Auth/payments are high-friction. |
| **Local Development** | 7.0/10 | Vite dev server with API proxy. No Docker. Multiple external services required. |
| **Code Navigation** | 7.5/10 | Clean folder structure, clear naming. Large files hinder navigation. |
| **Type Safety** | 7.0/10 | TypeScript throughout. Zod validation on some endpoints. CMS types are strong. |
| **Testing** | 3.0/10 | 28 test files for 351 source files. No component testing. Manual testing required. |
| **Documentation** | 4.5/10 | Good README. No API documentation. No architecture decision records. No inline docs beyond file headers. |
| **Tooling** | 7.0/10 | Vite dev server, ESLint, Vitest, Playwright, Wrangler. Missing: Storybook, bundle analyzer, type coverage tool. |
| **Build Speed** | 7.5/10 | Vite is fast. Sequential build pipeline (headers → prisma → typecheck → vite) adds latency. |
| **Error Messages** | 5.0/10 | Inconsistent API errors. No dev-mode warnings (recently removed). Prisma errors leak to client. |
| **Contribution Workflow** | 6.0/10 | GitHub Actions CI. No branch protection rules visible. No PR template. No conventional commits. |

---

## 22 — Final Verdict

### Architecture Assessment Summary

NABOME's architecture is a well-structured **layered SPA + edge API** system with strong domain separation in most areas. The design choices are pragmatic and the codebase shows professional engineering discipline.

The architecture is **fit for purpose** for a single-tenant, India-focused fashion e-commerce platform at moderate scale. However, there are architectural debt items that must be addressed before scaling:

**What's working:**
- Clean module separation across frontend and backend
- CMS architecture with section type system is extensible
- Email module is properly isolated from database
- Security infrastructure (CSP, CSRF, rate limiting, Turnstile) is well-designed
- Prisma schema is comprehensive and well-organized
- Build and deployment pipeline is functional

**What needs attention:**
- **Authentication architecture** (#1 priority) — monolithic handler, localStorage tokens, scattered env access
- **Payments architecture** — monolithic handler, high-risk code path
- **Edge middleware scaling** — per-instance cache doesn't scale horizontally
- **API design** — string-based dispatch, inconsistent errors, no request IDs
- **Testing architecture** — critically insufficient for production
- **Observability** — no monitoring, no structured logging, no tracing

### Architecture Score

| Aspect | Score |
|---|---|
| Overall Architecture | **6.8/10** |
| Enterprise Readiness | **5.8/10** |
| Cloudflare Readiness | **7.0/10** |
| Developer Experience | **6.0/10** |

### Verdict

**6.8/10 — Architecturally Sound with Critical Debt**

The architecture foundations are strong enough to support current operations. The codebase has not accumulated irreversible architectural debt. However, the auth handler, payments handler, admin API client, and SEO middleware are active architectural liabilities that will impede scaling and increase maintenance costs.

**Recommendation:** Address the 10 critical refactoring opportunities (RF-01 through RF-10) before scaling users or features. These are the architectural equivalent of a structural engineering assessment — the building won't collapse, but certain load-bearing walls need reinforcement before adding more floors.

---

*End of ENTERPRISE_ARCHITECTURE_AUDIT.md — Generated 2026-07-07*
