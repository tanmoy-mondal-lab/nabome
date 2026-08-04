# নবME (Nabome) — Complete Engineering Blueprint

> **Version:** 3.0 Architecture Standards  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document supersedes all other documentation

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Project Structure](#2-project-structure)
3. [Module Boundaries](#3-module-boundaries)
4. [Coding Conventions](#4-coding-conventions)
5. [Naming Conventions](#5-naming-conventions)
6. [Database Conventions](#6-database-conventions)
7. [API Conventions](#7-api-conventions)
8. [Service Architecture](#8-service-architecture)
9. [State Management](#9-state-management)
10. [Authentication Strategy](#10-authentication-strategy)
11. [Authorization Strategy](#11-authorization-strategy)
12. [Storage Conventions](#12-storage-conventions)
13. [Error Handling](#13-error-handling)
14. [Validation Strategy](#14-validation-strategy)
15. [Logging Standards](#15-logging-standards)
16. [Audit Standards](#16-audit-standards)
17. [Configuration Management](#17-configuration-management)
18. [Environment Variables](#18-environment-variables)
19. [Dependency Rules](#19-dependency-rules)
20. [UI Component Standards](#20-ui-component-standards)
21. [Design Token System](#21-design-token-system)
22. [Typography Scale](#22-typography-scale)
23. [Color System](#23-color-system)
24. [Spacing System](#24-spacing-system)
25. [Grid System](#25-grid-system)
26. [Responsive Breakpoints](#26-responsive-breakpoints)
27. [Animation Principles](#27-animation-principles)
28. [Accessibility Requirements](#28-accessibility-requirements)
29. [Performance Standards](#29-performance-standards)
30. [Security Standards](#30-security-standards)
31. [Documentation Standards](#31-documentation-standards)
32. [Testing Strategy](#32-testing-strategy)
33. [Deployment Strategy](#33-deployment-strategy)
34. [Scalability Guidelines](#34-scalability-guidelines)
35. [Future Extension Strategy](#35-future-extension-strategy)
36. [Mandatory Rules for AI Agents](#36-mandatory-rules-for-ai-agents)

---

## 1. Architecture Overview

### 1.1 What

নবME is a **premium Commerce Operating System** — a modular, enterprise-grade platform built on Cloudflare's edge infrastructure with React on the frontend and PostgreSQL on the backend.

### 1.2 Why

The architecture must support:
- **Mobile-first** experiences (70%+ traffic from mobile)
- **Enterprise-grade** reliability (99.9% uptime)
- **Scalability** from 0 to 1M+ users without rewrites
- **Maintainability** for a small, focused engineering team
- **Future extensibility** for marketplace, AI, and international features

### 1.3 Where

This architecture governs every file in the repository. No exceptions.

### 1.4 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Mobile     │  │   Tablet     │  │      Desktop         │   │
│  │  (Primary)   │  │ (Optimized)  │  │    (Polished)        │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                           │                                      │
│                    React 19 + Tailwind 4                         │
│                    Zustand + TanStack Query                       │
│                    Framer Motion                                  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                    HTTPS/REST API
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                        EDGE LAYER                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Cloudflare Pages Functions                    │   │
│  │                                                           │   │
│  │  Security Headers → Rate Limit → CSRF → Auth →           │   │
│  │  Validation → Handler → Response                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │    KV    │  │ Hyperdrive│  │ Turnstile │  │    R2    │       │
│  │  Cache   │  │  DB Pool  │  │ Bot Guard │  │ Storage  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                    TCP/PostgreSQL
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                        DATA LAYER                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL (Neon Serverless)                  │   │
│  │                                                           │   │
│  │  profiles | products | orders | cart | reviews | ...      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              External Services                            │   │
│  │                                                           │   │
│  │  Supabase Auth │ Razorpay │ Resend │ Cloudinary          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.5 Architectural Principles

| Principle | Rule | Rationale |
|-----------|------|-----------|
| **Edge-first** | All API logic runs on Cloudflare edge | Minimize latency for global users |
| **Feature-first** | Code organized by feature, not technical layer | Co-location reduces cognitive load |
| **Monolith-first** | Single deployment, no microservices | Simplicity at current scale |
| **Server-state** | All persistent data managed via React Query | Automatic caching, dedup, sync |
| **Zero-trust** | Every request validated, authenticated, authorized | Security cannot be optional |
| **Mobile-first** | Design mobile, then enhance for larger screens | 70%+ traffic is mobile |
| **Type-safe** | TypeScript strict mode everywhere | Catch errors at compile time |
| **Test-driven** | Tests written alongside or before implementation | Prevent regressions |

---

## 2. Project Structure

### 2.1 What

The project uses a **feature-first** folder structure with clear separation between frontend features, shared utilities, API handlers, and infrastructure.

### 2.2 Why

- **Co-location:** Components, hooks, API, and types for a feature live together
- **Discoverability:** New developers find code by thinking about features
- **Encapsulation:** Features cannot accidentally depend on each other's internals
- **Scalability:** Adding a new feature never touches existing feature folders

### 2.3 Where

Every file in the repository must be in the correct location per this structure.

### 2.4 Directory Structure

```
nabome/
├── src/                              # Frontend (React SPA)
│   ├── app/                          # Application shell
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Entry point
│   │   ├── providers.tsx             # Provider composition
│   │   └── routes.tsx                # Route definitions
│   │
│   ├── features/                     # Feature modules (self-contained)
│   │   ├── auth/                     # Authentication feature
│   │   │   ├── components/           # UI components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── AuthLayout.tsx
│   │   │   ├── hooks/                # Custom hooks
│   │   │   │   └── useAuth.ts
│   │   │   ├── api/                  # API client functions
│   │   │   │   └── auth.ts
│   │   │   ├── store/                # Zustand stores
│   │   │   │   └── auth-store.ts
│   │   │   ├── validators/           # Zod schemas
│   │   │   │   └── auth.ts
│   │   │   └── types.ts              # TypeScript types
│   │   │
│   │   ├── products/                 # Product feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   └── types.ts
│   │   │
│   │   ├── cart/                     # Cart feature
│   │   ├── checkout/                 # Checkout feature
│   │   ├── orders/                   # Orders feature
│   │   ├── search/                   # Search feature
│   │   ├── wishlist/                 # Wishlist feature
│   │   ├── home/                     # Homepage feature
│   │   └── admin/                    # Admin panel (all admin sub-features)
│   │       ├── layout/               # Admin layout (sidebar, topbar)
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── orders/
│   │       ├── customers/
│   │       ├── categories/
│   │       ├── collections/
│   │       ├── brands/
│   │       ├── coupons/
│   │       ├── cms/
│   │       ├── media/
│   │       ├── analytics/
│   │       └── settings/
│   │
│   ├── shared/                       # Shared across all features
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
│   │   │   └── index.ts              # Barrel file (UI only)
│   │   │
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── MegaMenu.tsx
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── auth/                     # Auth guards
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── AdminRoute.tsx
│   │   │
│   │   └── feedback/                 # Feedback UI
│   │       ├── ErrorBoundary.tsx
│   │       ├── ErrorPage.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── SkipToContent.tsx
│   │       └── CookieConsent.tsx
│   │
│   ├── lib/                          # Global utilities (no feature logic)
│   │   ├── api/                      # HTTP client
│   │   │   ├── client.ts             # Fetch wrapper with auth, CSRF, retry
│   │   │   ├── endpoints.ts          # API endpoint constants
│   │   │   └── types.ts              # API response types
│   │   │
│   │   ├── utils/                    # Pure utility functions
│   │   │   ├── cn.ts                 # ClassName utility (clsx + twMerge)
│   │   │   ├── format.ts             # Number, currency, date formatting
│   │   │   ├── slug.ts               # Slug generation
│   │   │   └── responsive.ts         # Responsive helpers
│   │   │
│   │   ├── hooks/                    # Generic hooks (not feature-specific)
│   │   │   ├── useDebounce.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useClickOutside.ts
│   │   │   ├── useFocusTrap.ts
│   │   │   └── useInfiniteScroll.ts
│   │   │
│   │   ├── validators/               # Shared Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── product.ts
│   │   │   ├── cart.ts
│   │   │   ├── checkout.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── config.ts                 # App configuration
│   │   ├── constants.ts              # Global constants
│   │   ├── seo.ts                    # SEO helpers
│   │   └── analytics.ts              # Analytics helpers
│   │
│   ├── stores/                       # Global Zustand stores
│   │   ├── auth-store.ts             # Auth state (session, user)
│   │   ├── ui-store.ts               # UI state (theme, sidebar, modals)
│   │   └── index.ts
│   │
│   ├── types/                        # Global TypeScript types
│   │   ├── product.ts
│   │   ├── order.ts
│   │   ├── user.ts
│   │   ├── cart.ts
│   │   ├── admin.ts
│   │   └── index.ts
│   │
│   └── styles/
│       └── globals.css               # Global styles, Tailwind config
│
├── api/                              # Backend API handlers
│   ├── _lib/                         # Shared API utilities
│   │   ├── auth/                     # Auth infrastructure
│   │   │   ├── middleware.ts         # authenticate(), authorize()
│   │   │   ├── session.ts           # Session CRUD
│   │   │   ├── supabase.ts          # Supabase client
│   │   │   └── tokens.ts            # Token generation, hashing
│   │   │
│   │   ├── validation/
│   │   │   ├── schemas.ts           # Shared Zod schemas
│   │   │   └── middleware.ts        # validateRequest()
│   │   │
│   │   ├── security/
│   │   │   ├── csrf.ts              # CSRF protection
│   │   │   ├── rate-limit.ts        # Rate limiting (KV)
│   │   │   ├── turnstile.ts         # Bot protection
│   │   │   ├── sanitize.ts          # Input sanitization
│   │   │   └── headers.ts           # Security headers
│   │   │
│   │   ├── database/
│   │   │   ├── client.ts            # Prisma client singleton
│   │   │   ├── transaction.ts       # Transaction helpers
│   │   │   └── connection.ts        # Connection pooling (Hyperdrive)
│   │   │
│   │   ├── email/
│   │   │   ├── client.ts            # Resend client
│   │   │   ├── templates/           # Email templates (React Email)
│   │   │   └── send.ts              # Send helpers
│   │   │
│   │   ├── storage/
│   │   │   ├── cloudinary.ts        # Cloudinary service
│   │   │   └── upload.ts            # Upload helpers
│   │   │
│   │   ├── payments/
│   │   │   ├── razorpay.ts          # Razorpay client
│   │   │   └── webhooks.ts          # Webhook verification
│   │   │
│   │   ├── cache/
│   │   │   ├── kv.ts                # KV caching helpers
│   │   │   └── strategies.ts        # Cache invalidation
│   │   │
│   │   ├── logging/
│   │   │   ├── logger.ts            # Pino logger
│   │   │   └── audit.ts             # Audit logging
│   │   │
│   │   ├── response.ts              # Standardized responses
│   │   ├── errors.ts                # Error classes
│   │   ├── pagination.ts            # Pagination helpers
│   │   ├── env.ts                   # Environment validation
│   │   └── types.ts                 # Shared API types
│   │
│   ├── _handlers/                    # API endpoint handlers
│   │   ├── auth/                     # Auth domain
│   │   │   ├── register.ts
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   ├── refresh.ts
│   │   │   ├── password-reset.ts
│   │   │   ├── email-verification.ts
│   │   │   ├── email-change.ts
│   │   │   └── profile.ts
│   │   │
│   │   ├── products/                 # Products domain
│   │   │   ├── list.ts
│   │   │   ├── detail.ts
│   │   │   ├── search.ts
│   │   │   ├── variants.ts
│   │   │   └── reviews.ts
│   │   │
│   │   ├── cart/                     # Cart domain
│   │   │   ├── get.ts
│   │   │   ├── add.ts
│   │   │   ├── update.ts
│   │   │   ├── remove.ts
│   │   │   └── sync.ts
│   │   │
│   │   ├── checkout/                 # Checkout domain
│   │   │   ├── create-order.ts
│   │   │   ├── verify-payment.ts
│   │   │   └── guest.ts
│   │   │
│   │   ├── orders/                   # Orders domain
│   │   │   ├── list.ts
│   │   │   ├── detail.ts
│   │   │   ├── tracking.ts
│   │   │   ├── cancel.ts
│   │   │   └── return-request.ts
│   │   │
│   │   ├── wishlist/                 # Wishlist domain
│   │   ├── addresses/                # Addresses domain
│   │   ├── webhooks/                 # Webhook handlers
│   │   │   ├── razorpay.ts
│   │   │   └── handlers.ts
│   │   └── admin/                    # Admin domain (all admin handlers)
│   │
│   ├── [...path].ts                  # Catch-all API router
│   └── health.ts                     # Health check endpoint
│
├── functions/                        # Cloudflare Pages Functions
│   ├── _middleware.ts                 # SEO + security middleware
│   ├── api/
│   │   ├── robots.txt.ts
│   │   └── sitemap.xml.ts
│   └── robots.txt.ts
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Database migrations
│   └── seed/
│       └── index.ts                  # Seed script
│
├── e2e/                              # End-to-end tests
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
│
├── public/                           # Static assets
│   ├── _headers
│   ├── _redirects
│   ├── favicon.svg
│   ├── og-image.svg
│   ├── robots.txt
│   └── site.webmanifest
│
├── .github/
│   └── workflows/
│       └── ci.yml                    # CI/CD pipeline
│
├── .env.example                      # Environment variable template
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
├── ARCHITECTURE.md                   # This file
└── README_EARLY.md                   # Historical blueprint
```

### 2.5 Structural Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No barrel files** | Only `shared/ui/index.ts` is allowed | Barrel files hurt tree-shaking and create circular deps |
| **No `src/lib/media/` barrel** | Direct imports only | 150+ exports in a barrel destroy bundle size |
| **Feature isolation** | Features cannot import from other features | Prevents coupling and circular dependencies |
| **One component per file** | File name matches component name | Easy to find, easy to test |
| **Max file length** | 300 lines per file | Files over 300 lines must be split |
| **Max handler length** | 150 lines per API handler | Handlers must be focused on one action |

---

## 3. Module Boundaries

### 3.1 What

Each feature module has explicit boundaries that define what it exposes and what it can consume.

### 3.2 Why

- **Prevents coupling:** Features cannot accidentally depend on each other's internals
- **Enables parallel development:** Teams can work on different features simultaneously
- **Simplifies testing:** Features can be tested in isolation
- **Reduces merge conflicts:** Changes to one feature don't affect others

### 3.3 Where

Every import statement in the codebase must respect these boundaries.

### 3.4 Dependency Rules

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

### 3.5 Allowed Imports Matrix

| Module | app/ | features/ | shared/ | lib/ | stores/ | types/ |
|--------|------|-----------|---------|------|---------|--------|
| **app/** | — | ✓ (routes) | ✓ | ✓ | ✓ | ✓ |
| **features/** | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **shared/** | ✗ | ✗ | — | ✓ | ✗ | ✓ |
| **lib/** | ✗ | ✗ | ✗ | — | ✗ | ✓ |
| **stores/** | ✗ | ✗ | ✗ | ✓ | — | ✓ |
| **types/** | ✗ | ✗ | ✗ | ✗ | ✗ | — |

### 3.6 API Module Boundaries

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

### 3.7 Breaking Boundaries

If you find yourself needing to import across boundaries:

1. **Feature → Feature:** Extract shared logic into `lib/` or `shared/`
2. **Shared → Feature:** Move the component into `shared/` and refactor dependencies
3. **Lib → Feature:** Move the utility to `types/` or refactor the feature
4. **Handler → Handler:** Extract shared logic into `_lib/`

---

## 4. Coding Conventions

### 4.1 What

Standardized rules for writing code that every agent must follow.

### 4.2 Why

- **Consistency:** Every file looks like it was written by the same person
- **Readability:** Developers can focus on logic, not style
- **Maintainability:** Code is easy to modify without introducing bugs
- **Reviewability:** Code reviews focus on logic, not formatting

### 4.3 Where

Every line of code in the repository.

### 4.4 General Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No comments** | Code must be self-documenting | Comments rot; clear code doesn't |
| **No `any`** | Use `unknown` or proper types | Type safety is non-negotiable |
| **No `as never`** | Refactor to proper types | Type assertions hide bugs |
| **No console.log** | Use Pino logger | Structured logging for production |
| **No magic numbers** | Extract to named constants | Readability and maintainability |
| **No default exports** | Named exports only | Better refactoring, explicit imports |
| **No barrel files** | Direct imports only | Tree-shaking and circular dep prevention |
| **No `void` fire-and-forget** | Always handle async errors | Silent failures cause outages |
| **No non-null assertions** | Use null checks or `!` operator with caution | Runtime crashes from null |
| **No string comparison** | Use timing-safe comparison for tokens | Prevent timing attacks |

### 4.5 TypeScript Rules

```typescript
// ✓ CORRECT: Strict typing
interface Product {
  id: string;
  name: string;
  price: number;
}

// ✗ WRONG: Using 'any'
const product: any = await getProduct(id);

// ✓ CORRECT: Using 'unknown' when type is uncertain
const data: unknown = await response.json();
const product = data as Product; // After validation

// ✓ CORRECT: Discriminated unions
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// ✗ WRONG: Using optional chaining to avoid null checks
const name = product?.name; // What happens when product is undefined?

// ✓ CORRECT: Explicit null handling
if (!product) {
  throw new AppError('PRODUCT_NOT_FOUND', 404, 'Product not found');
}
const name = product.name;
```

### 4.6 React Rules

```typescript
// ✓ CORRECT: Component with forwardRef
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children, onClick }, ref) => {
    return (
      <button ref={ref} onClick={onClick}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };

// ✗ WRONG: Default export
export default function Button() { ... }

// ✗ WRONG: Missing displayName
// ✗ WRONG: Props without JSDoc for complex props
```

### 4.7 API Handler Rules

```typescript
// ✓ CORRECT: Handler structure
import { z } from 'zod';
import { db } from '../../_lib/database/client';
import { authenticate } from '../../_lib/auth/middleware';
import { validateRequest } from '../../_lib/validation/middleware';
import { success, error } from '../../_lib/response';
import { AppError } from '../../_lib/errors';

const schema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export async function addToCart(request: Request, env: Env) {
  // 1. Authenticate
  const user = await authenticate(request);

  // 2. Validate input
  const body = await validateRequest(request, schema);

  // 3. Business logic
  const cart = await db.cart.upsert({
    where: { profileId: user.id },
    create: { profileId: user.id },
  });

  await db.cartItem.create({
    data: {
      cartId: cart.id,
      variantId: body.productId,
      quantity: body.quantity,
    },
  });

  // 4. Return success
  return success({ message: 'Item added to cart' });
}

// ✗ WRONG: No validation
export async function addToCart(request: Request, env: Env) {
  const body = await request.json(); // No validation!
  // ...
}

// ✗ WRONG: No authentication
export async function addToCart(request: Request, env: Env) {
  const body = await validateRequest(request, schema);
  // No auth check!
}

// ✗ WRONG: Empty catch block
try {
  await processPayment();
} catch (error) {
  // Silent failure!
}
```

### 4.8 Formatting Rules

| Rule | Standard | Tool |
|------|----------|------|
| **Indentation** | 2 spaces | Prettier |
| **Line length** | 100 characters max | Prettier |
| **Trailing commas** | Always | Prettier |
| **Semicolons** | Always | Prettier |
| **Quotes** | Single for strings, double for JSX | Prettier |
| **Imports** | Grouped (external → internal → types) | ESLint |
| **Sort imports** | Alphabetical within groups | ESLint |

### 4.9 Comment Rules

| Situation | Rule | Example |
|-----------|------|---------|
| **Business logic** | Add comment explaining WHY | `// Razorpay requires amount in paise, not rupees` |
| **Security consideration** | Add comment explaining risk | `// Timing-safe comparison to prevent timing attacks` |
| **Non-obvious workaround** | Add comment with link to issue | `// Workaround for Cloudflare Workers isolate limitation` |
| **TODO** | Link to GitHub issue | `// TODO(#123): Remove after migration` |
| **Everything else** | No comment | Code should be self-documenting |

---

## 5. Naming Conventions

### 5.1 What

Standardized naming patterns for all code artifacts.

### 5.2 Why

- **Predictability:** Developers know what to call things without thinking
- **Discoverability:** Search works reliably with consistent naming
- **Readability:** Names communicate intent and type

### 5.3 Where

Every identifier in the codebase.

### 5.4 Naming Rules

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

### 5.5 Prefix/Suffix Rules

| Pattern | Prefix/Suffix | Example | When to Use |
|---------|--------------|---------|-------------|
| **React hooks** | `use` prefix | `useCart`, `useAuth` | All custom hooks |
| **API handlers** | None | `addToCart`, `getProducts` | All API functions |
| **Validators** | None | `productSchema`, `cartSchema` | All Zod schemas |
| **Store slices** | `-store` suffix | `auth-store.ts`, `cart-store.ts` | All Zustand stores |
| **Error classes** | `App` prefix | `AppError`, `ValidationError` | All custom errors |
| **Type files** | None | `product.ts`, `order.ts` | All type definition files |

### 5.6 Naming Anti-Patterns

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

## 6. Database Conventions

### 6.1 What

Standards for PostgreSQL database design, Prisma schema, and data access patterns.

### 6.2 Why

- **Data integrity:** Consistent schema prevents data corruption
- **Performance:** Proper indexes ensure fast queries
- **Maintainability:** Clear naming makes schema easy to understand
- **Security:** Proper access patterns prevent injection attacks

### 6.3 Where

Every database schema definition, migration, and query.

### 6.4 Schema Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Primary keys** | UUID v4 | Globally unique, no sequential leaks |
| **Foreign keys** | UUID with explicit relation | Type-safe references |
| **Timestamps** | `createdAt` + `updatedAt` on all tables | Audit trail |
| **Soft delete** | `isActive` boolean (not `deletedAt`) | Simpler queries |
| **Currency** | `DECIMAL(10,2)` | Exact precision for money |
| **Booleans** | Default to `false` or explicit | Clear intent |
| **Strings** | Use `VARCHAR(n)` with appropriate limits | Prevent abuse |
| **Text** | Use `TEXT` for unbounded content | No artificial limits |
| **JSON** | Use `JSONB` for structured data | Indexable, queryable |
| **Enums** | Use Prisma enums for fixed sets | Type safety |
| **Indexes** | Index all foreign keys + common filters | Performance |
| **Unique constraints** | Slugs, SKUs, order numbers, emails | Data integrity |

### 6.5 Prisma Schema Rules

```prisma
// ✓ CORRECT: Well-structured model
model Product {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(300)
  slug      String   @unique @db.VarChar(300)
  basePrice Decimal  @db.Decimal(10, 2)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  categoryId String?

  // Indexes
  @@index([categoryId])
  @@index([isActive, isFeatured])
  @@index([isActive, createdAt])
}

// ✗ WRONG: Missing indexes on foreign keys
model Product {
  id         String  @id @default(uuid())
  categoryId String? // No index!
  // ...
}

// ✗ WRONG: Using `Int` for money
model Product {
  price Int // Wrong! Use Decimal
}
```

### 6.6 Query Rules

```typescript
// ✓ CORRECT: Use Prisma's type-safe queries
const products = await db.product.findMany({
  where: {
    isActive: true,
    categoryId: categoryId,
  },
  include: {
    category: true,
    variants: {
      where: { isActive: true },
      select: { id: true, size: true, color: true, stock: true },
    },
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: 0,
});

// ✗ WRONG: Raw SQL
const products = await db.$queryRaw`
  SELECT * FROM products
  WHERE is_active = true
  AND category_id = ${categoryId}
`;

// ✗ WRONG: N+1 queries
const products = await db.product.findMany();
for (const product of products) {
  product.category = await db.category.findUnique({
    where: { id: product.categoryId },
  }); // N+1!
}

// ✓ CORRECT: Use include/select for relations
const products = await db.product.findMany({
  include: { category: true },
});
```

### 6.7 Migration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One migration per change** | Each migration does one thing | Easy to rollback |
| **Never modify deployed migrations** | Create new migration instead | Data safety |
| **Test migrations locally** | Run on dev database first | Prevent production issues |
| **Seed after migration** | Seed script runs after migration | Consistent test data |
| **Backward compatible** | New columns must be nullable or have defaults | Zero-downtime deploys |

### 6.8 Index Strategy

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_products_active_featured ON products(isActive, isFeatured);
CREATE INDEX idx_products_active_category ON products(isActive, categoryId);
CREATE INDEX idx_products_active_gender ON products(isActive, gender, createdAt);
CREATE INDEX idx_orders_status_created ON orders(status, createdAt);
CREATE INDEX idx_orders_profile_status ON orders(profileId, status);

-- Partial indexes for filtered queries
CREATE INDEX idx_products_active ON products(createdAt) WHERE isActive = true;
CREATE INDEX idx_orders_pending ON orders(createdAt) WHERE status = 'PENDING';

-- Trigram indexes for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
```

---

## 7. API Conventions

### 7.1 What

Standards for REST API design, request/response patterns, and error handling.

### 7.2 Why

- **Consistency:** Every endpoint follows the same patterns
- **Cacheability:** RESTful design enables HTTP caching
- **Discoverability:** Developers can predict API behavior
- **Type safety:** Shared schemas between frontend and backend

### 7.3 Where

Every API endpoint and client call.

### 7.4 URL Conventions

| Pattern | Example | Rationale |
|---------|---------|-----------|
| **Resource listing** | `GET /api/products` | Collection endpoint |
| **Resource detail** | `GET /api/products/:id` | Single resource |
| **Create** | `POST /api/products` | Create resource |
| **Update** | `PATCH /api/products/:id` | Partial update |
| **Delete** | `DELETE /api/products/:id` | Remove resource |
| **Nested resources** | `GET /api/products/:id/reviews` | Related resources |
| **Actions** | `POST /api/cart/add` | Non-CRUD operations |
| **Admin** | `GET /api/admin/products` | Admin-specific endpoints |

### 7.5 Request/Response Conventions

```typescript
// ✓ CORRECT: Standardized response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Success response
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Product Name",
    "price": 2999
  }
}

// List response with pagination
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### 7.6 HTTP Status Codes

| Code | When to Use | Example |
|------|-------------|---------|
| **200** | Successful GET, PATCH | `GET /api/products` |
| **201** | Successful POST (create) | `POST /api/products` |
| **204** | Successful DELETE (no content) | `DELETE /api/products/:id` |
| **400** | Validation error | Missing required field |
| **401** | Not authenticated | No session token |
| **403** | Not authorized | Insufficient permissions |
| **404** | Resource not found | Invalid product ID |
| **409** | Conflict | Duplicate email |
| **422** | Business rule violation | Insufficient stock |
| **429** | Rate limit exceeded | Too many requests |
| **500** | Server error | Database connection failed |

### 7.7 Pagination Conventions

```typescript
// Request
GET /api/products?page=1&limit=20&sort=createdAt&order=desc&category=shirts

// Query parameters
interface PaginationParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
  sort?: string;      // Default: createdAt
  order?: 'asc' | 'desc'; // Default: desc
}

// Response includes meta
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 7.8 Filter Conventions

```typescript
// Query parameters for filtering
GET /api/products?category=shirts&brand=nike&minPrice=1000&maxPrice=5000&gender=men

// Supported filters
interface ProductFilters {
  category?: string;
  subcategory?: string;
  collection?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex';
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  search?: string;
}
```

### 7.9 API Handler Structure

```typescript
// ✓ CORRECT: Handler with all middleware
import { z } from 'zod';
import { db } from '../../_lib/database/client';
import { authenticate, authorize } from '../../_lib/auth/middleware';
import { validateRequest } from '../../_lib/validation/middleware';
import { rateLimit } from '../../_lib/security/rate-limit';
import { success, error } from '../../_lib/response';
import { AppError } from '../../_lib/errors';

const schema = z.object({
  name: z.string().min(1).max(300),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
});

export async function createProduct(request: Request, env: Env) {
  // 1. Rate limit
  await rateLimit(request, { limit: 10, window: 60 });

  // 2. Authenticate
  const user = await authenticate(request);

  // 3. Authorize
  authorize(user, 'admin');

  // 4. Validate input
  const body = await validateRequest(request, schema);

  // 5. Business logic
  const product = await db.product.create({
    data: {
      name: body.name,
      slug: generateSlug(body.name),
      basePrice: body.price,
      categoryId: body.categoryId,
    },
  });

  // 6. Return success
  return success(product, 201);
}

// ✗ WRONG: Missing steps
export async function createProduct(request: Request, env: Env) {
  const body = await request.json(); // No validation!
  const product = await db.product.create({ data: body }); // No auth!
  return new Response(JSON.stringify(product)); // No standard format!
}
```

---

## 8. Service Architecture

### 8.1 What

How backend services are organized, communicate, and handle cross-cutting concerns.

### 8.2 Why

- **Separation of concerns:** Each service handles one responsibility
- **Testability:** Services can be mocked in tests
- **Reusability:** Services can be used by multiple handlers
- **Maintainability:** Changes to one service don't affect others

### 8.3 Where

All backend code in `api/_lib/` and `api/_handlers/`.

### 8.4 Service Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE ARCHITECTURE                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Handler Layer                            │   │
│  │  One function per endpoint, orchestrates services         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Service Layer                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │   Auth   │ │ Database │ │  Email   │ │ Payments │    │   │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │  Media   │ │  Cache   │ │  Audit   │ │  Rate    │    │   │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Limiter  │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                Infrastructure Layer                        │   │
│  │  Prisma | Resend | Razorpay | Cloudinary | KV             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 Service Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single responsibility** | One service, one concern | Easy to understand and test |
| **No business logic** | Services handle infrastructure, handlers handle business | Clear separation |
| **No cross-service calls** | Handlers orchestrate services | Prevents tight coupling |
| **Dependency injection** | Services receive config via parameters | Testability |
| **Error propagation** | Services throw typed errors | Consistent error handling |
| **Logging** | Services log their operations | Observability |

### 8.6 Service Examples

```typescript
// ✓ CORRECT: Email service
export class EmailService {
  constructor(private client: Resend) {}

  async sendOrderConfirmation(order: Order): Promise<void> {
    await this.client.emails.send({
      from: 'orders@nabome.online',
      to: order.email,
      subject: `Order ${order.orderNumber} confirmed`,
      react: OrderConfirmationTemplate({ order }),
    });
  }
}

// ✓ CORRECT: Cache service
export class CacheService {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.kv.get(key, 'json');
    return data as T | null;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.kv.list({ prefix: pattern });
    await Promise.all(keys.keys.map((key) => this.kv.delete(key.name)));
  }
}

// ✗ WRONG: Handler doing everything
export async function createOrder(request: Request, env: Env) {
  const order = await db.order.create({ data: ... });
  await sendEmail(order); // Should be EmailService
  await cache.set(`order:${order.id}`, order); // Should be CacheService
  await logAudit('order_created', order); // Should be AuditService
  return success(order);
}
```

---

## 9. State Management

### 9.1 What

Standards for managing client-side state using Zustand and TanStack Query.

### 9.2 Why

- **Predictability:** Clear rules for what state goes where
- **Performance:** Proper caching prevents unnecessary API calls
- **Debuggability:** Consistent patterns make debugging easier
- **Maintainability:** Developers know where to find state

### 9.3 Where

All frontend state management code.

### 9.4 State Types

| Type | Tool | Purpose | Example |
|------|------|---------|---------|
| **Server state** | TanStack Query | Data from API | Products, orders, user profile |
| **Client state** | Zustand | UI state, preferences | Theme, sidebar open, modals |
| **Form state** | React Hook Form | Form inputs | Checkout form, login form |
| **URL state** | React Router | Filter, search, pagination | `?category=shirts&page=2` |

### 9.5 Zustand Rules

```typescript
// ✓ CORRECT: Global store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
);

// ✗ WRONG: Storing server state in Zustand
export const useProductsStore = create((set) => ({
  products: [],
  fetchProducts: async () => {
    const products = await api.getProducts();
    set({ products });
  },
}));

// ✓ CORRECT: Use TanStack Query for server state
const { data: products, isLoading } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => api.getProducts(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### 9.6 TanStack Query Rules

```typescript
// ✓ CORRECT: Query with proper configuration
const { data, isLoading, error } = useQuery({
  queryKey: ['products', { category, page, limit }],
  queryFn: () => fetchProducts({ category, page, limit }),
  staleTime: 5 * 60 * 1000,      // 5 minutes
  gcTime: 30 * 60 * 1000,         // 30 minutes
  retry: 2,
  refetchOnWindowFocus: false,
});

// ✓ CORRECT: Mutation with optimistic update
const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: AddToCartInput) => api.addToCart(item),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);
      queryClient.setQueryData(['cart'], (old) => ({
        ...old,
        items: [...old.items, newItem],
      }));
      return { previousCart };
    },
    onError: (err, newItem, context) => {
      queryClient.setQueryData(['cart'], context.previousCart);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

// ✗ WRONG: No staleTime (refetches on every render)
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});

// ✗ WRONG: Using useEffect for data fetching
useEffect(() => {
  fetchProducts().then(setProducts);
}, []);
```

### 9.7 State Location Rules

| State | Location | Why |
|-------|----------|-----|
| **User profile** | Zustand store | Persisted, accessed everywhere |
| **Cart items** | React Query | Server of truth is database |
| **Products list** | React Query | Cached, refetched on stale |
| **Search results** | React Query | URL state for filters |
| **Theme preference** | Zustand store | Persisted in localStorage |
| **Modal open/closed** | Zustand store | UI state, not persisted |
| **Form inputs** | React Hook Form | Local to form component |
| **URL filters** | React Router search params | Shareable, bookmarkable |

---

## 10. Authentication Strategy

### 10.1 What

Complete authentication system using Supabase Auth with custom session management.

### 10.2 Why

- **Security:** httpOnly cookies prevent XSS token theft
- **Control:** Custom session management for business rules
- **Integration:** Supabase provides battle-tested identity management
- **Compliance:** Meets enterprise security requirements

### 10.3 Where

All authentication flows: registration, login, logout, password reset, email verification.

### 10.4 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                            │
│                                                                  │
│  1. User submits credentials                                     │
│     → POST /api/auth/login                                      │
│                                                                  │
│  2. Validate input (Zod)                                         │
│     → Email format, password length                              │
│                                                                  │
│  3. Verify Turnstile CAPTCHA                                     │
│     → Prevent bot attacks                                        │
│                                                                  │
│  4. Authenticate with Supabase Auth                              │
│     → Verify email/password                                      │
│                                                                  │
│  5. Create session in database                                   │
│     → auth_sessions table                                        │
│                                                                  │
│  6. Set httpOnly cookies                                         │
│     → access_token (15min)                                       │
│     → refresh_token (7 days)                                     │
│     → csrf_token (4 hours)                                       │
│                                                                  │
│  7. Return user data                                             │
│     → Profile info (not tokens)                                  │
│                                                                  │
│  8. Client stores user in Zustand                                │
│     → Auth store updated                                         │
│                                                                  │
│  9. Redirect to previous page                                    │
│     → Or homepage                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 10.5 Session Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Token storage** | httpOnly cookies only | Prevent XSS theft |
| **Access token TTL** | 15 minutes | Short-lived for security |
| **Refresh token TTL** | 7 days | Balance security and UX |
| **CSRF token TTL** | 4 hours | Rotate regularly |
| **Max sessions** | 5 per user | Prevent abuse |
| **Session rotation** | On sensitive operations | Prevent session fixation |
| **Session invalidation** | On password change | Security best practice |

### 10.6 Cookie Configuration

```typescript
// ✓ CORRECT: Secure cookie setup
const cookieOptions = {
  httpOnly: true,
  secure: true,         // HTTPS only
  sameSite: 'lax',     // CSRF protection
  path: '/',
  maxAge: 15 * 60,      // 15 minutes for access token
};

// Set cookies
setCookie('access_token', accessToken, cookieOptions);
setCookie('refresh_token', refreshToken, {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60, // 7 days
});
setCookie('csrf_token', csrfToken, {
  ...cookieOptions,
  maxAge: 4 * 60 * 60, // 4 hours
  httpOnly: false, // Client needs to read this
});

// ✗ WRONG: localStorage for tokens
localStorage.setItem('access_token', token); // XSS vulnerable!
```

### 10.7 Brute Force Protection

```typescript
// Rate limiting rules
const authRateLimits = {
  login: { limit: 20, window: 60 },        // 20 req/min
  register: { limit: 10, window: 60 },     // 10 req/min
  passwordReset: { limit: 5, window: 3600 }, // 5 req/hr
  emailVerification: { limit: 10, window: 60 }, // 10 req/min
};

// Lockout after failed attempts
const lockoutRules = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60, // 15 minutes
  resetAfter: 30 * 60,      // Reset counter after 30 min
};
```

---

## 11. Authorization Strategy

### 11.1 What

Role-based access control (RBAC) for protecting resources and endpoints.

### 11.2 Why

- **Security:** Users can only access what they're allowed to
- **Compliance:** Meets enterprise access control requirements
- **Auditability:** All access attempts are logged
- **Maintainability:** Centralized authorization logic

### 11.3 Where

All protected endpoints and frontend routes.

### 11.4 Roles

| Role | Permissions | Access |
|------|-------------|--------|
| **customer** | View products, manage own cart/orders/profile | Storefront |
| **admin** | Full CRUD on all resources | Admin panel + Storefront |

### 11.5 Authorization Rules

```typescript
// ✓ CORRECT: Middleware pattern
export async function authenticate(request: Request): Promise<User> {
  const session = await getSession(request);
  if (!session) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  }
  return session.user;
}

export function authorize(user: User, role: UserRole): void {
  if (user.role !== role) {
    throw new AppError('FORBIDDEN', 403, 'Insufficient permissions');
  }
}

// Usage in handlers
export async function getOrders(request: Request) {
  const user = await authenticate(request);
  // Customers see only their orders
  const orders = await db.order.findMany({
    where: { profileId: user.id },
  });
  return success(orders);
}

export async function getAllOrders(request: Request) {
  const user = await authenticate(request);
  authorize(user, 'admin'); // Only admins
  const orders = await db.order.findMany();
  return success(orders);
}

// ✗ WRONG: No authorization
export async function getOrders(request: Request) {
  const orders = await db.order.findMany(); // Anyone can see all orders!
  return success(orders);
}
```

### 11.6 Resource Ownership

```typescript
// ✓ CORRECT: Ownership check
export async function getOrderDetail(request: Request, orderId: string) {
  const user = await authenticate(request);
  const order = await db.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new AppError('NOT_FOUND', 404, 'Order not found');
  }

  // Customers can only see their own orders
  if (user.role === 'customer' && order.profileId !== user.id) {
    throw new AppError('FORBIDDEN', 403, 'Access denied');
  }

  return success(order);
}

// ✗ WRONG: No ownership check
export async function getOrderDetail(request: Request, orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  return success(order); // Anyone can see any order!
}
```

---

## 12. Storage Conventions

### 12.1 What

Standards for file storage using Cloudinary and Cloudflare R2.

### 12.2 Why

- **Performance:** CDN delivery for fast image loading
- **Optimization:** Automatic format conversion and compression
- **Security:** Controlled upload and access patterns
- **Cost:** Efficient storage usage

### 12.3 Where

All file uploads: product images, avatars, CMS media.

### 12.4 Upload Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max file size** | 10MB | Prevent abuse |
| **Allowed types** | JPEG, PNG, WebP, GIF, SVG | Standard image formats |
| **Max dimensions** | 4000x4000px | Prevent oversized uploads |
| **Transformation** | Auto-format, auto-quality | Optimize delivery |
| **Folder structure** | `/products/{id}/`, `/avatars/{id}/` | Organized storage |
| **Access control** | Private for drafts, public for published | Security |

### 12.5 Cloudinary Configuration

```typescript
// ✓ CORRECT: Image optimization
const imageUrl = cloudinary.url(publicId, {
  format: 'auto',
  quality: 'auto',
  width: 800,
  height: 800,
  crop: 'fill',
  gravity: 'auto',
});

// Responsive srcSet
const srcSet = `
  ${cloudinary.url(publicId, { width: 400 })} 400w,
  ${cloudinary.url(publicId, { width: 600 })} 600w,
  ${cloudinary.url(publicId, { width: 800 })} 800w,
`.trim();

// ✗ WRONG: Raw URLs without optimization
const imageUrl = `https://res.cloudinary.com/demo/image/upload/${publicId}`;
```

### 12.6 Upload Validation

```typescript
// ✓ CORRECT: Server-side validation
const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File too large')
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type),
      'Invalid file type'
    ),
  folder: z.enum(['products', 'avatars', 'cms']),
});

// ✗ WRONG: No validation
const formData = await request.formData();
const file = formData.get('file'); // No validation!
```

---

## 13. Error Handling

### 13.1 What

Standardized error handling across frontend and backend.

### 13.2 Why

- **User experience:** Consistent error messages
- **Debugging:** Structured error information for developers
- **Monitoring:** Errors are captured and tracked
- **Security:** No sensitive information leaked in errors

### 13.3 Where

Every function that can fail.

### 13.4 Error Classes

```typescript
// ✓ CORRECT: Typed error classes
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super('VALIDATION_ERROR', 400, 'Validation failed', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', 404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', 403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', 409, message);
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('RATE_LIMIT_EXCEEDED', 429, 'Too many requests');
  }
}
```

### 13.5 Error Handling Rules

```typescript
// ✓ CORRECT: API handler error handling
export async function createProduct(request: Request, env: Env) {
  try {
    const user = await authenticate(request);
    const body = await validateRequest(request, schema);
    const product = await db.product.create({ data: body });
    return success(product, 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.statusCode, error.message, error.details);
    }
    // Log unexpected errors
    logger.error({ error, requestId: getRequestId(request) }, 'Unexpected error');
    return errorResponse('INTERNAL_ERROR', 500, 'An unexpected error occurred');
  }
}

// ✗ WRONG: Empty catch block
try {
  await processPayment();
} catch (error) {
  // Silent failure!
}

// ✗ WRONG: Swallowing errors
try {
  await sendEmail();
} catch (error) {
  console.log(error); // Not logged properly
}
```

### 13.6 Frontend Error Handling

```typescript
// ✓ CORRECT: React Query error handling
const { data, error, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  throwOnError: false,
});

if (error) {
  return <ErrorPage error={error} />;
}

// ✓ CORRECT: Error boundary
<ErrorBoundary fallback={<ErrorPage />}>
  <ProductGrid />
</ErrorBoundary>

// ✓ CORRECT: Mutation error handling
const { mutate, isError, error } = useMutation({
  mutationFn: addToCart,
  onError: (error) => {
    if (error instanceof AppError) {
      toast.error(error.message);
    } else {
      toast.error('Something went wrong');
    }
  },
});
```

---

## 14. Validation Strategy

### 14.1 What

Input validation using Zod schemas shared between frontend and backend.

### 14.2 Why

- **Security:** Prevent injection attacks and malformed data
- **Data integrity:** Ensure data conforms to expected shapes
- **Developer experience:** Shared schemas reduce duplication
- **Type safety:** Runtime validation with TypeScript types

### 14.3 Where

Every API endpoint and form submission.

### 14.4 Validation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side always** | Every endpoint validates input | Security cannot depend on client |
| **Client-side for UX** | Forms validate before submission | Better user experience |
| **Shared schemas** | Same Zod schema for both | No duplication |
| **No `z.any()`** | Every field has a type | Type safety |
| **Explicit rules** | min, max, pattern, enum | Clear constraints |
| **Error details** | Field-level error messages | Better UX |

### 14.5 Schema Examples

```typescript
// ✓ CORRECT: Comprehensive validation
import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name too long')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long')
    .trim(),
  phone: z
    .string()
    .regex(/^[+]?[0-9\s-]{10,20}$/, 'Invalid phone number')
    .optional(),
});

// ✗ WRONG: No validation
const body = await request.json();
await db.user.create({ data: body }); // Direct insertion!

// ✗ WRONG: Using z.any()
const schema = z.object({
  content: z.any(), // No validation!
});

// ✓ CORRECT: Strict content validation
const sectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('hero'),
    title: z.string().min(1).max(200),
    subtitle: z.string().max(500),
    imageUrl: z.string().url(),
  }),
  z.object({
    type: z.literal('products'),
    title: z.string().min(1).max(200),
    productIds: z.array(z.string().uuid()).min(1).max(20),
  }),
]);
```

### 14.6 Validation Middleware

```typescript
// ✓ CORRECT: Validation middleware
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    const details = result.error.flatten().fieldErrors;
    throw new ValidationError(details);
  }

  return result.data;
}

// Usage
export async function createProduct(request: Request, env: Env) {
  const body = await validateRequest(request, productSchema);
  // body is fully typed and validated
}
```

---

## 15. Logging Standards

### 15.1 What

Structured logging using Pino for all backend operations.

### 15.2 Why

- **Debugging:** Structured logs are searchable and filterable
- **Monitoring:** Logs can be aggregated and analyzed
- **Security:** Audit trail for sensitive operations
- **Performance:** Pino is fast and non-blocking

### 15.3 Where

All backend code, especially API handlers and services.

### 15.4 Logging Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Structured JSON** | Use Pino, not console.log | Searchable, filterable |
| **Request ID** | Every log includes request ID | Correlate related logs |
| **User ID** | Auth operations include user ID | Track user actions |
| **No secrets** | Never log tokens, passwords, keys | Security |
| **Appropriate level** | error, warn, info, debug | Filter by severity |
| **Context** | Include relevant context | Debugging aid |

### 15.5 Logger Setup

```typescript
// ✓ CORRECT: Pino logger setup
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

// Usage
logger.info({ userId: user.id, action: 'login' }, 'User logged in');
logger.error({ err: error, orderId: order.id }, 'Payment failed');
logger.warn({ ip: request.ip, endpoint: '/api/auth/login' }, 'Rate limit hit');

// ✗ WRONG: console.log
console.log('User logged in', user.id); // Not structured!
console.log(error); // Not logged properly!
```

### 15.6 Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| **error** | System errors, failures | Database connection failed |
| **warn** | Degraded performance, recoverable | Rate limit hit, retry successful |
| **info** | Important business events | Order created, payment received |
| **debug** | Development debugging | API request/response details |

---

## 16. Audit Standards

### 16.1 What

Audit logging for security-sensitive operations.

### 16.2 Why

- **Compliance:** Meet regulatory requirements
- **Security:** Track unauthorized access attempts
- **Debugging:** Understand what happened and when
- **Accountability:** Track who did what

### 16.3 Where

All authentication operations, data modifications, and security events.

### 16.4 Audit Events

| Event | Data to Log | Rationale |
|-------|-------------|-----------|
| **Login success** | userId, ip, userAgent, timestamp | Track access |
| **Login failure** | email, ip, userAgent, reason | Detect attacks |
| **Logout** | userId, timestamp | Track session end |
| **Password change** | userId, ip, timestamp | Security event |
| **Order created** | userId, orderId, amount | Business event |
| **Payment processed** | userId, orderId, paymentId, amount | Financial event |
| **Admin action** | adminId, action, resource, changes | Accountability |
| **Rate limit hit** | ip, endpoint, timestamp | Security event |

### 16.5 Audit Logger

```typescript
// ✓ CORRECT: Audit logging
export class AuditLogger {
  constructor(private db: PrismaClient) {}

  async log(event: AuditEvent): Promise<void> {
    await this.db.auditLog.create({
      data: {
        event: event.type,
        userId: event.userId,
        ip: event.ip,
        userAgent: event.userAgent,
        resource: event.resource,
        resourceId: event.resourceId,
        changes: event.changes,
        timestamp: new Date(),
      },
    });
  }
}

// Usage
await auditLogger.log({
  type: 'LOGIN_SUCCESS',
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
});

// ✗ WRONG: No audit logging
await login(user); // No audit trail!
```

---

## 17. Configuration Management

### 17.1 What

Standards for managing application configuration across environments.

### 17.2 Why

- **Consistency:** Same configuration in all environments
- **Security:** Secrets never in code
- **Flexibility:** Environment-specific overrides
- **Debuggability:** Clear visibility into configuration

### 17.3 Where

All environment-specific settings.

### 17.4 Configuration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single source** | `wrangler.jsonc` for Cloudflare | One place for all config |
| **No secrets in code** | Use Cloudflare Pages secrets | Security |
| **Validate at startup** | Zod schema for env vars | Catch missing config early |
| **Document all vars** | `.env.example` with descriptions | Developer experience |
| **Environment isolation** | Separate configs per environment | Prevent cross-environment issues |

### 17.5 Environment Validation

```typescript
// ✓ CORRECT: Validate all env vars at startup
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  HYPERDRIVE_URL: z.string().url(),

  // Auth
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Payments
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),

  // Email
  RESEND_API_KEY: z.string().min(1),

  // Media
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Security
  TURNSTILE_SECRET_KEY: z.string().min(1),
  CSRF_SECRET: z.string().min(32),

  // App
  APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
});

export const env = envSchema.parse(process.env);

// ✗ WRONG: No validation
const dbUrl = process.env.DATABASE_URL; // Could be undefined!
```

---

## 18. Environment Variables

### 18.1 What

Complete list of required environment variables and their purposes.

### 18.2 Why

- **Documentation:** Developers know what's needed
- **Security:** Clear separation of secrets and config
- **Onboarding:** New developers can set up quickly
- **Debugging:** Easy to identify missing configuration

### 18.3 Where

All environment configuration.

### 18.4 Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| **DATABASE_URL** | URL | PostgreSQL connection string | `postgresql://...` |
| **HYPERDRIVE_URL** | URL | Hyperdrive connection string | `postgresql://...` |
| **SUPABASE_URL** | URL | Supabase project URL | `https://xxx.supabase.co` |
| **SUPABASE_ANON_KEY** | String | Supabase anonymous key | `eyJ...` |
| **SUPABASE_SERVICE_ROLE_KEY** | String | Supabase service role key | `eyJ...` |
| **RAZORPAY_KEY_ID** | String | Razorpay key ID | `rzp_test_...` |
| **RAZORPAY_KEY_SECRET** | String | Razorpay secret key | `...` |
| **RESEND_API_KEY** | String | Resend API key | `re_...` |
| **CLOUDINARY_CLOUD_NAME** | String | Cloudinary cloud name | `xxx` |
| **CLOUDINARY_API_KEY** | String | Cloudinary API key | `...` |
| **CLOUDINARY_API_SECRET** | String | Cloudinary API secret | `...` |
| **TURNSTILE_SECRET_KEY** | String | Turnstile secret key | `0x...` |
| **CSRF_SECRET** | String | CSRF token secret (32+ chars) | `...` |
| **APP_URL** | URL | Application URL | `https://nabome.online` |
| **NODE_ENV** | Enum | Environment name | `production` |

### 18.5 .env.example

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
HYPERDRIVE_URL=postgresql://user:password@host:5432/dbname

# Supabase Auth
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Resend (Email)
RESEND_API_KEY=re_your_api_key

# Cloudinary (Media)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=0x_your_turnstile_secret

# CSRF
CSRF_SECRET=your_32_character_minimum_secret_here

# App
APP_URL=http://localhost:5173
NODE_ENV=development
```

---

## 19. Dependency Rules

### 19.1 What

Rules for managing npm dependencies and internal imports.

### 19.2 Why

- **Security:** Minimize attack surface
- **Performance:** Smaller bundle size
- **Maintainability:** Fewer dependencies to update
- **Reliability:** Well-tested, stable packages

### 19.3 Where

All `package.json` and import statements.

### 19.4 Dependency Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimize** | Only add dependencies that provide significant value | Reduce attack surface |
| **Audit regularly** | Run `pnpm audit` weekly | Catch vulnerabilities |
| **Lock versions** | Use `pnpm-lock.yaml` | Reproducible builds |
| **No unused** | Remove unused dependencies | Reduce bundle size |
| **Prefer native** | Use built-in APIs when possible | No dependency needed |
| **Check before adding** | Verify package is maintained and popular | Avoid abandoned packages |

### 19.5 Internal Import Rules

```typescript
// ✓ CORRECT: Direct imports
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

---

## 20. UI Component Standards

### 20.1 What

Standards for building reusable React components.

### 20.2 Why

- **Consistency:** All components follow the same patterns
- **Accessibility:** Components are accessible by default
- **Maintainability:** Easy to understand and modify
- **Reusability:** Components work in multiple contexts

### 20.3 Where

All React components in `src/shared/ui/` and `src/features/*/components/`.

### 20.4 Component Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One component per file** | File name matches component name | Easy to find |
| **Named exports** | No default exports | Better refactoring |
| **forwardRef** | All UI primitives use forwardRef | Composability |
| **displayName** | Set on all components | Debugging |
| **Props interface** | JSDoc on complex props | Documentation |
| **No business logic** | Components are pure UI | Separation of concerns |
| **Controlled/uncontrolled** | Support both patterns | Flexibility |
| **Accessibility** | ARIA labels, keyboard navigation | WCAG compliance |

### 20.5 Component Template

```typescript
// ✓ CORRECT: Complete component
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold' | 'danger';
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      disabled,
      leftIcon,
      rightIcon,
      children,
      onClick,
      className,
      type = 'button',
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
      >
        {isLoading ? (
          <LoadingSpinner className="mr-2 h-4 w-4" />
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };
```

### 20.6 Compound Components

```typescript
// ✓ CORRECT: Compound component pattern
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border border-neutral-100 bg-white', className)}>
      {children}
    </div>
  );
}

function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between p-4', className)}>
      {children}
    </div>
  );
}

function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold', className)}>
      {children}
    </h3>
  );
}

function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Body = CardBody;

export { Card, CardHeader, CardTitle, CardBody };

// Usage
<Card>
  <Card.Header>
    <Card.Title>Product Name</Card.Title>
  </Card.Header>
  <Card.Body>
    <p>Product description</p>
  </Card.Body>
</Card>
```

---

## 21. Design Token System

### 21.1 What

Centralized design tokens for consistent visual language.

### 21.2 Why

- **Consistency:** Same values used everywhere
- **Maintainability:** Change once, update everywhere
- **Themeability:** Easy to create dark mode or custom themes
- **Documentation:** Tokens serve as living style guide

### 21.3 Where

All CSS and Tailwind configuration.

### 21.4 Token Categories

```css
:root {
  /* Color tokens */
  --color-brand-50: #faf6f1;
  --color-brand-500: #8b6940;
  --color-brand-600: #7a5c38;
  --color-accent-gold: #c9a84c;
  --color-neutral-50: #fafaf9;
  --color-neutral-900: #1c1917;

  /* Spacing tokens */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Typography tokens */
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Manrope', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;
  --font-size-5xl: 3.5rem;

  /* Shadow tokens */
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-elevated: 0 10px 40px rgba(0, 0, 0, 0.10);
  --shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.15);

  /* Animation tokens */
  --ease-luxe-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-luxe-in: cubic-bezier(0.55, 0, 0.75, 0.25);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;

  /* Border radius tokens */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;

  /* Z-index tokens */
  --z-dropdown: 50;
  --z-sticky: 100;
  --z-modal: 200;
  --z-toast: 300;
  --z-tooltip: 400;
}
```

### 21.5 Tailwind Integration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--color-brand-50)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
        },
        accent: {
          gold: 'var(--color-accent-gold)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        modal: 'var(--shadow-modal)',
      },
      transitionTimingFunction: {
        'luxe-out': 'var(--ease-luxe-out)',
        'luxe-in': 'var(--ease-luxe-in)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
    },
  },
};
```

---

## 22. Typography Scale

### 22.1 What

Consistent typography system using Cormorant Garamond and Manrope.

### 22.2 Why

- **Brand identity:** Editorial, luxury aesthetic
- **Readability:** Appropriate sizes for each context
- **Hierarchy:** Clear visual hierarchy
- **Consistency:** Same type styles everywhere

### 22.3 Where

All text elements in the application.

### 22.4 Typography Scale

| Element | Font | Size | Weight | Letter Spacing | Line Height |
|---------|------|------|--------|----------------|-------------|
| **Display H1** | Cormorant Garamond | 3.5rem | 300 | -0.02em | 1.15 |
| **Display H2** | Cormorant Garamond | 2.5rem | 400 | -0.01em | 1.2 |
| **Heading H3** | Manrope | 1.5rem | 600 | 0 | 1.33 |
| **Heading H4** | Manrope | 1.25rem | 600 | 0 | 1.4 |
| **Body Large** | Manrope | 1.125rem | 400 | 0 | 1.6 |
| **Body** | Manrope | 1rem | 400 | 0 | 1.6 |
| **Body Small** | Manrope | 0.875rem | 400 | 0 | 1.5 |
| **Caption** | Manrope | 0.75rem | 500 | 0.05em | 1.5 |
| **Label** | Manrope | 0.6875rem | 600 | 0.1em | 1.5 |
| **Editorial** | Cormorant Garamond | 1.25rem | 400 | 0.02em | 1.5 |

### 22.5 Typography Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max 2 fonts** | Cormorant Garamond + Manrope | Brand consistency |
| **Display for headlines** | Cormorant Garamond for H1-H2 | Editorial aesthetic |
| **Body for everything else** | Manrope for H3+ and body | Readability |
| **Uppercase for labels** | Letter-spacing 0.1em | Premium feel |
| **No font size below 12px** | Minimum 0.75rem | Accessibility |
| **Contrast ratio** | 4.5:1 minimum | WCAG AA compliance |

---

## 23. Color System

### 23.1 What

Consistent color palette using warm earth tones.

### 23.2 Why

- **Brand identity:** Luxurious, warm aesthetic
- **Accessibility:** Sufficient contrast ratios
- **Flexibility:** Enough variants for all use cases
- **Dark mode:** Easy to create dark variants

### 23.3 Where

All visual elements.

### 23.4 Color Palette

```typescript
// Brand Colors (Earth Tones)
const brand = {
  50: '#faf6f1',   // Lightest cream
  100: '#f0e6d6',
  200: '#e0ccb0',
  300: '#c9a87a',
  400: '#b08850',
  500: '#8b6940',  // PRIMARY
  600: '#7a5c38',
  700: '#664d2f',
  800: '#523d25',
  900: '#3d2e1c',
  950: '#1f1710',
};

// Accent Colors
const accent = {
  gold: '#c9a84c',
  goldDark: '#a88a3a',
  rose: '#c47070',
  sage: '#7a9a7a',
  ink: '#2c3e50',
  cream: '#faf6f1',
};

// Neutral (Warm Gray)
const neutral = {
  50: '#fafaf9',
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
};

// Luxe Palette
const luxe = {
  charcoal: '#1c1c1e',
  pewter: '#6e6e73',
  ivory: '#fffff0',
  champagne: '#f7e7ce',
  bronze: '#cd7f32',
  platinum: '#e5e4e2',
};

// Status Colors
const status = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};
```

### 23.5 Color Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Primary actions** | brand-500 | Brand consistency |
| **Hover states** | brand-600 | Darker on interaction |
| **Gold accents** | accent-gold | Premium feel |
| **Text** | neutral-900 (primary), neutral-600 (secondary) | Readability |
| **Borders** | neutral-200 | Subtle separation |
| **Backgrounds** | neutral-50 (subtle), white (cards) | Clean aesthetic |
| **Errors** | status-error | Clear feedback |
| **Success** | status-success | Clear feedback |

### 23.6 Contrast Ratios

| Combination | Ratio | WCAG Level |
|-------------|-------|------------|
| neutral-900 on white | 15.4:1 | AAA |
| neutral-700 on white | 8.6:1 | AAA |
| neutral-600 on white | 5.7:1 | AA |
| brand-500 on white | 4.6:1 | AA |
| white on brand-500 | 4.6:1 | AA |
| white on brand-600 | 5.7:1 | AA |

---

## 24. Spacing System

### 24.1 What

Consistent spacing scale for margins, padding, and gaps.

### 24.2 Why

- **Visual rhythm:** Consistent spacing creates harmony
- **Readability:** Proper whitespace improves readability
- **Maintainability:** Use tokens, not arbitrary values
- **Responsiveness:** Scale spacing for different screens

### 24.3 Where

All layout and component spacing.

### 24.4 Spacing Scale

```css
:root {
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
}
```

### 24.5 Spacing Rules

| Context | Scale | Example |
|---------|-------|---------|
| **Inline spacing** | space-1 to space-2 | Icon to text gap |
| **Component padding** | space-3 to space-6 | Button, input padding |
| **Component gap** | space-4 to space-6 | Gap between items |
| **Section spacing** | space-8 to space-12 | Between page sections |
| **Page margins** | space-6 to space-16 | Page edge margins |

### 24.6 Tailwind Integration

```typescript
// tailwind.config.ts
export default {
  theme: {
    spacing: {
      0: 'var(--space-0)',
      1: 'var(--space-1)',
      2: 'var(--space-2)',
      3: 'var(--space-3)',
      4: 'var(--space-4)',
      5: 'var(--space-5)',
      6: 'var(--space-6)',
      8: 'var(--space-8)',
      10: 'var(--space-10)',
      12: 'var(--space-12)',
      16: 'var(--space-16)',
      20: 'var(--space-20)',
      24: 'var(--space-24)',
      32: 'var(--space-32)',
    },
  },
};
```

---

## 25. Grid System

### 25.1 What

Responsive grid system for page layouts.

### 25.2 Why

- **Consistency:** Same grid everywhere
- **Responsiveness:** Adapts to all screen sizes
- **Alignment:** Content stays aligned
- **Simplicity:** Easy to use with Tailwind

### 25.3 Where

All page and component layouts.

### 25.4 Grid Configuration

| Screen | Columns | Gutter | Max Width |
|--------|---------|--------|-----------|
| **Mobile** | 4 | 16px | 100% |
| **Tablet** | 8 | 24px | 768px |
| **Desktop** | 12 | 32px | 1280px |
| **Wide** | 12 | 32px | 1440px |

### 25.5 Grid Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Container** | Max-width 1280px, centered | Readable line length |
| **Editorial** | Max-width 1440px for hero sections | Premium feel |
| **Mobile-first** | Start with 4 columns, add more | 70%+ mobile traffic |
| **Consistent gutters** | Same gutter across breakpoints | Visual harmony |
| **Responsive** | Use Tailwind breakpoints | Consistent behavior |

### 25.6 Tailwind Grid Classes

```tsx
// ✓ CORRECT: Responsive grid
<div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-12 lg:gap-8">
  {/* Grid items */}
</div>

// ✓ CORRECT: Container
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Page content */}
</div>

// ✗ WRONG: Fixed widths
<div style={{ width: '1200px', margin: '0 auto' }}>
  {/* Not responsive! */}
</div>
```

---

## 26. Responsive Breakpoints

### 26.1 What

Standard breakpoints for responsive design.

### 26.2 Why

- **Consistency:** Same breakpoints everywhere
- **Predictability:** Developers know when styles apply
- **Mobile-first:** Design for mobile first, enhance for larger screens
- **Performance:** Load appropriate resources per device

### 26.3 Where

All responsive styles.

### 26.4 Breakpoints

| Name | Width | Tailwind Prefix | Target |
|------|-------|-----------------|--------|
| **Mobile** | 0-639px | (none) | Phones |
| **Tablet** | 640-1023px | `sm:` | Tablets |
| **Desktop** | 1024-1279px | `md:` | Laptops |
| **Wide** | 1280px+ | `lg:` | Desktops |

### 26.5 Breakpoint Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile-first** | Base styles for mobile | 70%+ traffic |
| **Progressive enhancement** | Add styles for larger screens | Better UX |
| **Touch targets** | Minimum 44x44px on mobile | Accessibility |
| **Text size** | Minimum 16px on mobile | Readability |
| **Navigation** | Bottom nav on mobile, top nav on desktop | UX pattern |

### 26.6 Responsive Patterns

```tsx
// ✓ CORRECT: Mobile-first responsive
<div className="
  /* Mobile: 2 columns */
  grid grid-cols-2 gap-4
  /* Tablet: 4 columns */
  sm:grid-cols-4 sm:gap-6
  /* Desktop: 12 columns */
  lg:grid-cols-12 lg:gap-8
">
  {/* Items */}
</div>

// ✓ CORRECT: Conditional rendering
<div className="hidden md:block">
  {/* Desktop only */}
</div>

<div className="block md:hidden">
  {/* Mobile only */}
</div>
```

---

## 27. Animation Principles

### 27.1 What

Standards for animations and transitions.

### 27.2 Why

- **Premium feel:** Apple-level micro-interactions
- **Performance:** Smooth 60fps animations
- **Accessibility:** Respect reduced motion preferences
- **Consistency:** Same timing and easing everywhere

### 27.3 Where

All interactive elements and transitions.

### 27.4 Animation Tokens

```css
:root {
  /* Easing curves */
  --ease-luxe-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-luxe-in: cubic-bezier(0.55, 0, 0.75, 0.25);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;
}
```

### 27.5 Animation Rules

| Element | Duration | Easing | Effect |
|---------|----------|--------|--------|
| **Hover states** | 150ms | ease-luxe-out | Color change |
| **Card hover** | 300ms | ease-luxe-out | Lift + shadow |
| **Modal open** | 300ms | ease-spring | Scale up |
| **Page transition** | 500ms | ease-luxe-out | Fade + slide |
| **Loading skeleton** | 800ms | linear | Shimmer |
| **Button click** | 150ms | ease-luxe-in | Scale down |

### 27.6 Animation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Purposeful** | Every animation has a purpose | No decoration |
| **Fast** | Under 500ms for most | Don't waste time |
| **Smooth** | Use CSS transforms, not layout properties | 60fps performance |
| **Respectful** | Honor `prefers-reduced-motion` | Accessibility |
| **Consistent** | Same timing and easing | Cohesive experience |
| **Subtle** | Don't distract from content | Premium feel |

### 27.7 Reduced Motion

```css
/* ✓ CORRECT: Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// ✓ CORRECT: Framer Motion
import { motion } from 'framer-motion';

const card = {
  rest: { y: 0 },
  hover: { y: -2 },
};

<motion.div
  variants={card}
  initial="rest"
  whileHover="hover"
  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
>
  {/* Card content */}
</motion.div>
```

---

## 28. Accessibility Requirements

### 28.1 What

WCAG 2.2 AA compliance for all components and pages.

### 28.2 Why

- **Legal compliance:** Meet accessibility laws
- **Inclusivity:** Everyone can use the platform
- **SEO:** Search engines favor accessible sites
- **Quality:** Accessible code is better code

### 28.3 Where

All user-facing components and pages.

### 28.4 Accessibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Color contrast** | 4.5:1 for normal text, 3:1 for large text | Readability |
| **Focus indicators** | Visible on all interactive elements | Keyboard navigation |
| **Skip link** | Skip to main content link | Screen reader users |
| **ARIA labels** | On all icons and interactive elements | Screen reader users |
| **Keyboard navigation** | All features accessible via keyboard | Motor disabilities |
| **Reduced motion** | Honor `prefers-reduced-motion` | Vestibular disorders |
| **Alt text** | On all meaningful images | Screen reader users |
| **Form labels** | On all inputs | Screen reader users |
| **Error messages** | Clear, descriptive, associated with inputs | All users |
| **Heading hierarchy** | Proper H1-H6 order | Screen reader users |

### 28.5 ARIA Patterns

```tsx
// ✓ CORRECT: Proper ARIA usage
<button
  aria-label="Add to cart"
  onClick={addToCart}
>
  <ShoppingCartIcon aria-hidden="true" />
</button>

// ✓ CORRECT: Form with proper labels
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email address
  </label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={hasError}
  />
  {hasError && (
    <p id="email-error" className="text-sm text-red-500">
      Please enter a valid email
    </p>
  )}
</div>

// ✓ CORRECT: Modal with focus trap
<Dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
>
  <h2 id="dialog-title">Dialog Title</h2>
  {/* Focus trap manages focus */}
</Dialog>

// ✗ WRONG: Missing accessibility
<div onClick={handleClick}>
  <img src="icon.png" /> {/* No alt text! */}
  <span>Click me</span> {/* No interactive element! */}
</div>
```

### 28.6 Keyboard Navigation

| Key | Action |
|-----|--------|
| **Tab** | Move to next interactive element |
| **Shift+Tab** | Move to previous interactive element |
| **Enter/Space** | Activate button or link |
| **Escape** | Close modal/dropdown |
| **Arrow keys** | Navigate within composite widgets |

---

## 29. Performance Standards

### 29.1 What

Performance targets and optimization strategies.

### 29.2 Why

- **User experience:** Fast sites retain users
- **SEO:** Google uses Core Web Vitals for ranking
- **Conversion:** Slow sites lose sales
- **Cost:** Faster sites use fewer resources

### 29.3 Where

All frontend and backend code.

### 29.4 Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **LCP** | < 2.5s | Core Web Vital |
| **INP** | < 200ms | Core Web Vital |
| **CLS** | < 0.1 | Core Web Vital |
| **FCP** | < 1.8s | First content visible |
| **TTFB** | < 800ms | Server response time |
| **Bundle size** | < 200KB main chunk | Fast download |
| **API response** | < 200ms (p95) | Fast interactions |

### 29.5 Optimization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lazy loading** | Route-level code splitting | Load only what's needed |
| **Image optimization** | Cloudinary auto-format/quality | Optimize delivery |
| **Caching** | React Query + KV | Reduce API calls |
| **Minification** | Vite minification | Smaller bundles |
| **Tree shaking** | No barrel files | Remove unused code |
| **Compression** | Brotli via Cloudflare | Smaller transfers |
| **CDN** | Cloudflare global edge | Fast delivery |
| **Database** | Hyperdrive connection pooling | Fast queries |

### 29.6 Code Splitting Strategy

```typescript
// ✓ CORRECT: Route-level code splitting
const CheckoutPage = lazy(() => import('./features/checkout/pages/CheckoutPage'));
const AdminDashboard = lazy(() => import('./features/admin/dashboard/Dashboard'));

// ✓ CORRECT: Component-level code splitting
const MediaLibrary = lazy(() => import('./features/admin/media/MediaLibrary'));

// ✓ CORRECT: Preload on hover
<Link
  to="/products"
  onMouseEnter={() => import('./features/products/pages/ProductListingPage')}
>
  Products
</Link>

// ✗ WRONG: No code splitting
import CheckoutPage from './features/checkout/pages/CheckoutPage'; // Included in main bundle!
```

### 29.7 Caching Strategy

| Data Type | Cache Location | TTL | Invalidation |
|-----------|---------------|-----|--------------|
| Products list | React Query + KV | 5min | On product update |
| Product detail | React Query + KV | 5min | On product update |
| Categories | React Query + KV | 1hr | On category update |
| Site settings | React Query + KV | 10min | On settings update |
| User session | httpOnly cookie | 7d | On logout |
| Cart | Server (DB) | 30d | On cart change |
| Search results | React Query | 1min | On search |

---

## 30. Security Standards

### 30.1 What

Comprehensive security measures for all application layers.

### 30.2 Why

- **Data protection:** User data is valuable and private
- **Trust:** Users trust us with their information
- **Compliance:** Meet legal requirements
- **Reputation:** Security breaches destroy trust

### 30.3 Where

Every layer: frontend, API, database, infrastructure.

### 30.4 Security Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **HTTPS only** | All traffic encrypted | Prevent eavesdropping |
| **httpOnly cookies** | No tokens in localStorage | Prevent XSS theft |
| **CSRF protection** | Double-submit cookie pattern | Prevent CSRF attacks |
| **Input validation** | Zod on every endpoint | Prevent injection |
| **Rate limiting** | On all public endpoints | Prevent abuse |
| **Security headers** | CSP, HSTS, X-Frame-Options | Defense in depth |
| **Secrets management** | Cloudflare Pages secrets only | Never in code |
| **No sensitive data in logs** | Never log tokens, passwords | Prevent exposure |
| **Timing-safe comparison** | For all token comparisons | Prevent timing attacks |
| **Webhook idempotency** | Process each event once | Prevent duplicates |

### 30.5 Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://res.cloudinary.com data:; font-src 'self' https://fonts.gstatic.com;
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-XSS-Protection: 0
```

### 30.6 CSRF Protection

```typescript
// ✓ CORRECT: Double-submit cookie pattern
export function generateCsrfToken(): string {
  const token = crypto.randomUUID();
  // Set in httpOnly cookie
  setCookie('csrf_token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
  return token;
}

export function validateCsrfToken(request: Request): boolean {
  const cookieToken = getCookie(request, 'csrf_token');
  const headerToken = request.headers.get('x-csrf-token');
  if (!cookieToken || !headerToken) return false;
  return timingSafeEqual(cookieToken, headerToken);
}

// Apply to all mutation endpoints
export async function handleMutation(request: Request) {
  if (!validateCsrfToken(request)) {
    throw new AppError('CSRF_INVALID', 403, 'Invalid CSRF token');
  }
  // Process mutation
}
```

---

## 31. Documentation Standards

### 31.1 What

Standards for code and project documentation.

### 31.2 Why

- **Onboarding:** New developers can get up to speed quickly
- **Maintenance:** Code is easier to modify when documented
- **Knowledge transfer:** Important decisions are recorded
- **API usage:** External consumers can understand the API

### 31.3 Where

All public APIs, complex functions, and project setup.

### 31.4 Documentation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **README** | Project setup, architecture overview | Onboarding |
| **ARCHITECTURE.md** | Complete engineering standards | This document |
| **Code comments** | Only when necessary (see 4.9) | Self-documenting code |
| **JSDoc** | On public API interfaces | TypeScript IntelliSense |
| **API docs** | OpenAPI spec (future) | API consumers |
| **Type definitions** | Descriptive type names | Self-documenting |

### 31.5 JSDoc Standards

```typescript
// ✓ CORRECT: JSDoc on public interfaces
/**
 * Represents a product in the catalog.
 * @property id - Unique identifier (UUID)
 * @property name - Product display name
 * @property slug - URL-friendly identifier
 * @property basePrice - Price in INR (Decimal)
 * @property isActive - Whether product is visible in catalog
 */
interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  isActive: boolean;
}

// ✓ CORRECT: JSDoc on exported functions
/**
 * Formats a number as Indian Rupee currency.
 * @param amount - Amount in rupees
 * @returns Formatted string like "₹2,999"
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

// ✗ WRONG: Commenting obvious code
// Returns the user's name
const getName = (user: User) => user.name;
```

---

## 32. Testing Strategy

### 32.1 What

Comprehensive testing approach covering unit, integration, and E2E tests.

### 32.2 Why

- **Confidence:** Deploy without fear of breaking things
- **Refactoring:** Safe to improve code with tests
- **Documentation:** Tests show how code should be used
- **Quality:** Catch bugs before users do

### 32.3 Where

All code, with emphasis on critical paths.

### 32.4 Testing Levels

| Level | Tool | Coverage Target | What to Test |
|-------|------|-----------------|--------------|
| **Unit** | Vitest | 80%+ | Pure functions, utilities, hooks |
| **Integration** | Vitest | 70%+ | API handlers, component interactions |
| **E2E** | Playwright | Critical flows | Auth, checkout, admin |

### 32.5 Testing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Test critical paths** | Auth, payments, checkout: 100% | Revenue-critical |
| **Test before features** | Tests written alongside code | Prevent regressions |
| **No flaky tests** | All tests must be deterministic | Trust in test suite |
| **Fast feedback** | Unit tests < 100ms, E2E < 5min | Developer productivity |
| **CI enforcement** | Tests must pass before merge | Quality gate |

### 32.6 Test Structure

```typescript
// ✓ CORRECT: Unit test
import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats integer amounts correctly', () => {
    expect(formatPrice(2999)).toBe('₹2,999');
  });

  it('formats decimal amounts correctly', () => {
    expect(formatPrice(2999.50)).toBe('₹2,999.50');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('₹0');
  });
});

// ✓ CORRECT: Integration test
import { describe, it, expect, beforeEach } from 'vitest';
import { createProduct } from './create-product';
import { db } from '../../database/client';

describe('createProduct', () => {
  beforeEach(async () => {
    await db.product.deleteMany();
  });

  it('creates a product with valid data', async () => {
    const request = new Request('http://localhost/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Product',
        price: 2999,
        categoryId: 'valid-uuid',
      }),
    });

    const response = await createProduct(request, env);
    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Test Product');
  });

  it('returns 400 for invalid data', async () => {
    const request = new Request('http://localhost/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: '', // Invalid
        price: -100, // Invalid
      }),
    });

    const response = await createProduct(request, env);
    expect(response.status).toBe(400);
  });
});
```

### 32.7 E2E Test Structure

```typescript
// ✓ CORRECT: E2E test
import { test, expect } from '@playwright/test';

test.describe('Checkout flow', () => {
  test('completes checkout as authenticated user', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'Password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Add product to cart
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button:has-text("Add to Cart")');

    // Go to checkout
    await page.click('[data-testid="cart-icon"]');
    await page.click('button:has-text("Checkout")');

    // Fill shipping info
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="city"]', 'Mumbai');
    await page.fill('[name="pincode"]', '400001');

    // Complete payment
    await page.click('button:has-text("Pay Now")');

    // Verify order confirmation
    await expect(page.locator('h1')).toContainText('Order Confirmed');
  });
});
```

---

## 33. Deployment Strategy

### 33.1 What

Deployment pipeline and environment management.

### 33.2 Why

- **Reliability:** Consistent deployments
- **Speed:** Fast feedback loops
- **Safety:** Preview before production
- **Rollback:** Quick recovery from issues

### 33.3 Where

CI/CD pipeline and Cloudflare Pages.

### 33.4 Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| **Development** | `feature/*` | localhost:5173 | Local development |
| **Preview** | PR branches | `*.nabome.pages.dev` | PR review |
| **Staging** | `develop` | staging.nabome.online | Pre-production |
| **Production** | `main` | nabome.online | Live site |

### 33.5 Deployment Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **PR previews** | Every PR gets a preview URL | Review before merge |
| **Staging** | `develop` branch deploys to staging | Test before production |
| **Production** | `main` branch deploys to production | Stable releases |
| **Rollback** | One-click rollback to previous version | Quick recovery |
| **Database migrations** | Run before deployment | Schema changes |
| **Secrets** | Use Cloudflare Pages secrets | Never in code |

### 33.6 CI/CD Pipeline

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
    needs: [lint, test]
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
    needs: [lint, test]
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

---

## 34. Scalability Guidelines

### 34.1 What

Guidelines for scaling the application as it grows.

### 34.2 Why

- **Growth:** Support from 0 to 1M+ users
- **Performance:** Maintain fast response times
- **Cost:** Efficient resource usage
- **Future-proof:** Easy to add new features

### 34.3 Where

Architecture decisions and infrastructure.

### 34.4 Scalability Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Edge-first** | Run code on Cloudflare edge | Global low latency |
| **Connection pooling** | Use Hyperdrive | Efficient DB connections |
| **Caching** | Cache read-heavy data at edge | Reduce DB load |
| **Horizontal scaling** | Stateless API handlers | Scale with traffic |
| **Database optimization** | Proper indexes, query optimization | Fast queries |
| **CDN** | Cloudflare CDN for static assets | Global delivery |
| **Lazy loading** | Load only what's needed | Faster initial load |
| **Background jobs** | Offload long tasks (email, webhooks) | Don't block responses |

### 34.5 Scaling Phases

| Phase | Users | Strategy |
|-------|-------|----------|
| **MVP** | 0-10K | Current architecture |
| **Growth** | 10K-100K | Add caching, optimize queries |
| **Scale** | 100K-1M | Add read replicas, CDN optimization |
| **Enterprise** | 1M+ | Consider microservices, dedicated infrastructure |

---

## 35. Future Extension Strategy

### 35.1 What

Guidelines for extending the platform without breaking existing features.

### 35.2 Why

- **Extensibility:** Easy to add new features
- **Stability:** New features don't break existing ones
- **Maintainability:** Code stays clean as it grows
- **Performance:** New features don't degrade performance

### 35.3 Where

All new feature development.

### 35.4 Extension Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Feature modules** | New features in `src/features/` | Encapsulation |
| **No shared state modification** | Don't modify shared stores for features | Prevent coupling |
| **API versioning** | Version breaking changes | Backward compatibility |
| **Database migrations** | Additive only, no destructive changes | Data safety |
| **Feature flags** | Use Cloudflare Flagship for new features | Safe rollouts |
| **A/B testing** | Test new features with small user group | Validate before rollout |
| **Documentation** | Document new features in ARCHITECTURE.md | Knowledge transfer |

### 35.5 Adding a New Feature

```markdown
## Checklist: Adding a New Feature

1. Create feature folder: `src/features/{feature-name}/`
2. Add feature components in `components/`
3. Add feature hooks in `hooks/`
4. Add feature API client in `api/`
5. Add feature types in `types.ts`
6. Add feature validators in `validators/` (if needed)
7. Add API handlers in `api/_handlers/{feature-name}/`
8. Add database models in `prisma/schema.prisma` (if needed)
9. Add tests in feature folder
10. Update ARCHITECTURE.md if needed
11. Never import from other features
12. Never modify shared stores for feature logic
```

---

## 36. Mandatory Rules for AI Agents

### 36.1 What

Rules that every AI agent must follow when working on the Nabome codebase.

### 36.2 Why

- **Consistency:** All agents follow the same standards
- **Quality:** Prevent agents from introducing technical debt
- **Security:** Prevent agents from introducing vulnerabilities
- **Maintainability:** Code stays clean and maintainable

### 36.3 Where

Every code change made by any AI agent.

### 36.4 Mandatory Rules

#### Architecture Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | **Never create monolithic files** | Max 300 lines per file, 150 lines per handler |
| 2 | **Never skip input validation** | Every endpoint must validate with Zod |
| 3 | **Never store secrets in code** | Use Cloudflare Pages secrets |
| 4 | **Never use `any` type** | Use `unknown` or proper types |
| 5 | **Never use `as never`** | Refactor to proper types |
| 6 | **Never use `console.log`** | Use Pino logger |
| 7 | **Never create barrel files** | Direct imports only (except `shared/ui/index.ts`) |
| 8 | **Never import across feature boundaries** | Use `lib/` for shared logic |
| 9 | **Never use localStorage for tokens** | Use httpOnly cookies only |
| 10 | **Never return 200 for failed webhooks** | Return non-2xx to trigger retries |

#### Code Quality Rules

| # | Rule | Rationale |
|---|------|-----------|
| 11 | **Always use named exports** | Better refactoring, explicit imports |
| 12 | **Always use forwardRef for UI components** | Composability |
| 13 | **Always set displayName on components** | Debugging |
| 14 | **Always handle async errors** | Prevent silent failures |
| 15 | **Always use timing-safe comparison** | Prevent timing attacks |
| 16 | **Always validate environment variables** | Catch missing config early |
| 17 | **Always use parameterized queries** | Prevent SQL injection |
| 18 | **Always sanitize user input** | Prevent XSS |
| 19 | **Always use HTTPS in production** | Security |
| 20 | **Always set secure cookie flags** | Security |

#### Testing Rules

| # | Rule | Rationale |
|---|------|-----------|
| 21 | **Never skip tests for critical paths** | Auth, payments, checkout: 100% coverage |
| 22 | **Never leave flaky tests** | All tests must be deterministic |
| 23 | **Never skip lint/typecheck** | Run `pnpm lint` and `pnpm typecheck` after changes |
| 24 | **Never skip E2E tests for new features** | Critical flows must be tested |

#### Security Rules

| # | Rule | Rationale |
|---|------|-----------|
| 25 | **Never commit secrets** | Use `.env.example` with placeholders |
| 26 | **Never log sensitive data** | No tokens, passwords, or keys in logs |
| 27 | **Never skip CSRF validation** | All mutation endpoints must validate CSRF |
| 28 | **Never skip rate limiting** | All public endpoints must be rate-limited |
| 29 | **Never skip authentication** | All protected endpoints must authenticate |
| 30 | **Never skip authorization** | All endpoints must check permissions |

#### Performance Rules

| # | Rule | Rationale |
|---|------|-----------|
| 31 | **Never use useEffect for data fetching** | Use TanStack Query |
| 32 | **Never skip code splitting** | Use lazy() for routes and heavy components |
| 33 | **Never skip image optimization** | Use Cloudinary transformations |
| 34 | **Never skip caching** | Use React Query + KV |
| 35 | **Never skip database indexes** | Index all foreign keys and common filters |

#### Documentation Rules

| # | Rule | Rationale |
|---|------|-----------|
| 36 | **Never add unnecessary comments** | Code should be self-documenting |
| 37 | **Never skip JSDoc on public interfaces** | TypeScript IntelliSense |
| 38 | **Never skip documenting breaking changes** | Update ARCHITECTURE.md |

### 36.5 Pre-Commit Checklist

Before committing any changes, verify:

```markdown
## Pre-Commit Checklist

- [ ] All files follow naming conventions
- [ ] No files exceed 300 lines (150 for handlers)
- [ ] No `any` or `as never` types
- [ ] No `console.log` statements
- [ ] All inputs validated with Zod
- [ ] All async errors handled
- [ ] No secrets in code
- [ ] No barrel files (except `shared/ui/index.ts`)
- [ ] No cross-feature imports
- [ ] All components have displayName
- [ ] All hooks use `use` prefix
- [ ] All tests pass
- [ ] Lint passes
- [ ] TypeCheck passes
- [ ] No security vulnerabilities
```

### 36.6 Code Review Checklist

For AI agents reviewing code:

```markdown
## Code Review Checklist

### Architecture
- [ ] Feature boundaries respected
- [ ] No monolithic files
- [ ] Proper separation of concerns

### Code Quality
- [ ] No `any` or `as never` types
- [ ] No console.log statements
- [ ] Named exports only
- [ ] forwardRef on UI components
- [ ] displayName set on components

### Security
- [ ] Input validation on all endpoints
- [ ] Authentication before authorization
- [ ] CSRF validation on mutations
- [ ] Rate limiting on public endpoints
- [ ] No secrets in code
- [ ] No sensitive data in logs

### Performance
- [ ] Code splitting for routes
- [ ] Image optimization
- [ ] Caching where appropriate
- [ ] Database indexes

### Testing
- [ ] Tests for new functionality
- [ ] Tests for bug fixes
- [ ] No flaky tests
- [ ] Critical paths covered

### Documentation
- [ ] JSDoc on public interfaces
- [ ] Breaking changes documented
- [ ] ARCHITECTURE.md updated if needed
```

---

## Summary

This document defines the complete engineering standards for the নবME Commerce Operating System. Every AI agent working on this codebase must follow these standards without exception.

**Key Principles:**
1. **Security-first:** Every endpoint validates, authenticates, and authorizes
2. **Test-driven:** Critical paths have 100% test coverage
3. **Feature-first:** Self-contained modules, no monolithic files
4. **Type-safe:** TypeScript strict mode, no `any` types
5. **Performance:** Edge-first, cached, optimized
6. **Accessible:** WCAG 2.2 AA compliance
7. **Mobile-first:** Design for mobile, enhance for desktop
8. **Premium:** Apple-level polish, luxurious feel

**This document is the single source of truth for all engineering decisions.**

---

*Last updated: August 03, 2026*
