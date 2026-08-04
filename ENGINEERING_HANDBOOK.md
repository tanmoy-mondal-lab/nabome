# নবME (Nabome) — Engineering Handbook

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for all engineering standards  
> **Supersedes:** None — consolidates ARCHITECTURE.md, TECH_STACK.md, FOLDER_ARCHITECTURE.md, DESIGN_SYSTEM_ARCHITECTURE.md, DATABASE_ARCHITECTURE.md, API_SERVICE_ARCHITECTURE.md

---

## Table of Contents

1. [Engineering Philosophy](#1-engineering-philosophy)
2. [Architecture Principles](#2-architecture-principles)
3. [Project Structure](#3-project-structure)
4. [Module Boundaries](#4-module-boundaries)
5. [Coding Standards](#5-coding-standards)
6. [Naming Conventions](#6-naming-conventions)
7. [TypeScript Standards](#7-typescript-standards)
8. [React Standards](#8-react-standards)
9. [State Management](#9-state-management)
10. [API Standards](#10-api-standards)
11. [Database Standards](#11-database-standards)
12. [Security Standards](#12-security-standards)
13. [Performance Standards](#13-performance-standards)
14. [Testing Standards](#14-testing-standards)
15. [Documentation Standards](#15-documentation-standards)
16. [Git Workflow](#16-git-workflow)
17. [AI Development Rules](#17-ai-development-rules)
18. [Definition of Done](#18-definition-of-done)

---

## 1. Engineering Philosophy

### 1.1 What

The foundational principles that guide every engineering decision for Nabome.

### 1.2 Why

- **Consistency:** Every file looks like it was written by the same person
- **Quality:** Enterprise-grade code that scales
- **Maintainability:** Code is easy to modify without introducing bugs
- **Onboarding:** New developers (and AI agents) can contribute immediately

### 1.3 Core Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Enterprise-quality code** | Production-ready, battle-tested patterns | Reliability at scale |
| **Mobile-first development** | Design for thumb, enhance for desktop | 70%+ traffic is mobile |
| **Premium product quality** | Apple-level attention to detail | Brand perception |
| **Scalable architecture** | From 0 to 1M+ users without rewrites | Long-term viability |
| **Maintainable codebase** | Clean, readable, well-organized code | Developer productivity |
| **Clean code** | Self-documenting, minimal comments | Readability |
| **High performance** | Fast load times, smooth interactions | User satisfaction |
| **Security-first** | Every request validated, authenticated, authorized | Trust and compliance |
| **Consistent engineering** | Same patterns everywhere | Predictability |
| **Beginner-friendly** | Clear organization, obvious patterns | Team growth |

### 1.4 Design Principles

| Principle | Rule | Application |
|-----------|------|-------------|
| **SOLID** | Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion | Every module, every class |
| **DRY** | Don't Repeat Yourself — extract shared logic | Utilities, shared components |
| **KISS** | Keep It Simple, Stupid — prefer simple solutions | Architecture decisions |
| **YAGNI** | You Aren't Gonna Need It — don't build for hypothetical future | Feature scope |
| **Separation of Concerns** | Each module has one responsibility | Feature boundaries |
| **Composition over Inheritance** | Compose behavior, don't inherit | React components, services |
| **Explicit over Implicit** | Make behavior visible in code | Configuration, types |

---

## 2. Architecture Principles

### 2.1 What

High-level architectural decisions that govern the entire system.

### 2.2 Where

Every file in the repository.

### 2.3 Architecture Diagram

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

### 2.4 Architectural Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Edge-first** | All API logic runs on Cloudflare edge | Minimize latency for global users |
| **Feature-first** | Code organized by feature, not technical layer | Co-location reduces cognitive load |
| **Monolith-first** | Single deployment, no microservices | Simplicity at current scale |
| **Server-state** | All persistent data managed via React Query | Automatic caching, dedup, sync |
| **Zero-trust** | Every request validated, authenticated, authorized | Security cannot be optional |
| **Mobile-first** | Design mobile, then enhance for larger screens | 70%+ traffic is mobile |
| **Type-safe** | TypeScript strict mode everywhere | Catch errors at compile time |
| **Test-driven** | Tests written alongside or before implementation | Prevent regressions |

---

## 3. Project Structure

### 3.1 What

The feature-first folder structure with clear separation between frontend features, shared utilities, API handlers, and infrastructure.

### 3.2 Why

- **Co-location:** Components, hooks, API, and types for a feature live together
- **Discoverability:** New developers find code by thinking about features
- **Encapsulation:** Features cannot accidentally depend on each other's internals
- **Scalability:** Adding a new feature never touches existing feature folders

### 3.3 Directory Structure

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
│   │   │   ├── hooks/                # Custom hooks
│   │   │   ├── api/                  # API client functions
│   │   │   ├── store/                # Zustand stores
│   │   │   ├── validators/           # Zod schemas
│   │   │   └── types.ts              # TypeScript types
│   │   │
│   │   ├── products/                 # Product feature
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
├── ARCHITECTURE.md                   # Previous architecture doc
├── TECH_STACK.md                     # Technology decisions
├── FOLDER_ARCHITECTURE.md            # Folder organization
├── DESIGN_SYSTEM_ARCHITECTURE.md     # Design system standards
├── DATABASE_ARCHITECTURE.md          # Database architecture
├── API_SERVICE_ARCHITECTURE.md       # API service architecture
└── ENGINEERING_HANDBOOK.md           # This file
```

### 3.4 Structural Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No barrel files** | Only `shared/ui/index.ts` is allowed | Barrel files hurt tree-shaking and create circular deps |
| **No `src/lib/media/` barrel** | Direct imports only | 150+ exports in a barrel destroy bundle size |
| **Feature isolation** | Features cannot import from other features | Prevents coupling and circular dependencies |
| **One component per file** | File name matches component name | Easy to find, easy to test |
| **Max file length** | 300 lines per file | Files over 300 lines must be split |
| **Max handler length** | 150 lines per API handler | Handlers must be focused on one action |

---

## 4. Module Boundaries

### 4.1 What

Each feature module has explicit boundaries that define what it exposes and what it can consume.

### 4.2 Dependency Rules

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

### 4.3 Allowed Imports Matrix

| Module | app/ | features/ | shared/ | lib/ | stores/ | types/ |
|--------|------|-----------|---------|------|---------|--------|
| **app/** | — | ✓ (routes) | ✓ | ✓ | ✓ | ✓ |
| **features/** | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ |
| **shared/** | ✗ | ✗ | — | ✓ | ✗ | ✓ |
| **lib/** | ✗ | ✗ | ✗ | — | ✗ | ✓ |
| **stores/** | ✗ | ✗ | ✗ | ✓ | — | ✓ |
| **types/** | ✗ | ✗ | ✗ | ✗ | ✗ | — |

### 4.4 Breaking Boundaries

If you find yourself needing to import across boundaries:

1. **Feature → Feature:** Extract shared logic into `lib/` or `shared/`
2. **Shared → Feature:** Move the component into `shared/` and refactor dependencies
3. **Lib → Feature:** Move the utility to `types/` or refactor the feature
4. **Handler → Handler:** Extract shared logic into `_lib/`

---

## 5. Coding Standards

### 5.1 General Rules

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

### 5.2 Formatting Rules

| Rule | Standard | Tool |
|------|----------|------|
| **Indentation** | 2 spaces | Prettier |
| **Line length** | 100 characters max | Prettier |
| **Trailing commas** | Always | Prettier |
| **Semicolons** | Always | Prettier |
| **Quotes** | Single for strings, double for JSX | Prettier |
| **Imports** | Grouped (external → internal → types) | ESLint |
| **Sort imports** | Alphabetical within groups | ESLint |

### 5.3 Comment Rules

| Situation | Rule | Example |
|-----------|------|---------|
| **Business logic** | Add comment explaining WHY | `// Razorpay requires amount in paise, not rupees` |
| **Security consideration** | Add comment explaining risk | `// Timing-safe comparison to prevent timing attacks` |
| **Non-obvious workaround** | Add comment with link to issue | `// Workaround for Cloudflare Workers isolate limitation` |
| **TODO** | Link to GitHub issue | `// TODO(#123): Remove after migration` |
| **Everything else** | No comment | Code should be self-documenting |

---

## 6. Naming Conventions

### 6.1 Naming Rules

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

### 6.2 Prefix/Suffix Rules

| Pattern | Prefix/Suffix | Example | When to Use |
|---------|--------------|---------|-------------|
| **React hooks** | `use` prefix | `useCart`, `useAuth` | All custom hooks |
| **API handlers** | None | `addToCart`, `getProducts` | All API functions |
| **Validators** | None | `productSchema`, `cartSchema` | All Zod schemas |
| **Store slices** | `-store` suffix | `auth-store.ts`, `cart-store.ts` | All Zustand stores |
| **Error classes** | `App` prefix | `AppError`, `ValidationError` | All custom errors |
| **Type files** | None | `product.ts`, `order.ts` | All type definition files |

### 6.3 Naming Anti-Patterns

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

## 7. TypeScript Standards

### 7.1 Rules

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

### 7.2 Type Organization

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Interfaces** | Object shapes, props, APIs | `interface Product { ... }` |
| **Type aliases** | Unions, intersections, primitives | `type Status = 'active' | 'inactive'` |
| **Enums** | Fixed sets of values | `enum OrderStatus { ... }` |
| **Generics** | Reusable type-safe components | `interface ApiResponse<T> { ... }` |
| **Discriminated unions** | Polomorphic types | `type Result = Success | Error` |

---

## 8. React Standards

### 8.1 Component Rules

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

### 8.2 Hook Rules

```typescript
// ✓ CORRECT: Custom hook
function useCart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    staleTime: 5 * 60 * 1000,
  });

  const addToCart = useMutation({
    mutationFn: api.addToCart,
    onMutate: async (newItem) => {
      // Optimistic update
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return { cart: data, isLoading, error, addToCart };
}

// ✗ WRONG: useEffect for data fetching
useEffect(() => {
  fetchCart().then(setCart);
}, []);

// ✓ CORRECT: Use TanStack Query
const { data: cart } = useQuery({
  queryKey: ['cart'],
  queryFn: fetchCart,
});
```

### 8.3 API Handler Structure

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
```

---

## 9. State Management

### 9.1 State Types

| Type | Tool | Purpose | Example |
|------|------|---------|---------|
| **Server state** | TanStack Query | Data from API | Products, orders, user profile |
| **Client state** | Zustand | UI state, preferences | Theme, sidebar open, modals |
| **Form state** | React Hook Form | Form inputs | Checkout form, login form |
| **URL state** | React Router | Filter, search, pagination | `?category=shirts&page=2` |

### 9.2 State Location Rules

| State | Location | Why |
|-------|----------|-----|
| **User profile** | Zustand (persisted) | Accessed everywhere |
| **Cart items** | TanStack Query | DB is source of truth |
| **Products list** | TanStack Query | Cached, refetched on stale |
| **Search results** | TanStack Query | URL state for filters |
| **Theme preference** | Zustand (persisted) | UI preference |
| **Modal open/closed** | Zustand (not persisted) | Transient UI state |
| **Form inputs** | React Hook Form | Local to form |
| **URL filters** | React Router search params | Shareable, bookmarkable |

### 9.3 Zustand Rules

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
      partialize: (state) => ({ user: state.user }),
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
```

### 9.4 TanStack Query Rules

```typescript
// ✓ CORRECT: Query with proper configuration
const { data, isLoading, error } = useQuery({
  queryKey: ['products', { category, page, limit }],
  queryFn: () => fetchProducts({ category, page, limit }),
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
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
```

---

## 10. API Standards

### 10.1 URL Conventions

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

### 10.2 Response Format

```typescript
// Success response (single resource)
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Premium Cotton T-Shirt",
    "slug": "premium-cotton-t-shirt",
    "basePrice": 2999
  }
}

// Success response (list with pagination)
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

### 10.3 HTTP Status Codes

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

### 10.4 Request Lifecycle

```
1. Client sends request
2. Cloudflare edge receives request
   → Security headers applied
   → CORS check
3. Rate limiting check
   → KV-based rate limiter
   → Return 429 if exceeded
4. CSRF validation (for mutations)
   → Double-submit cookie pattern
   → Return 403 if invalid
5. Authentication (if required)
   → Extract session from cookies
   → Validate session
   → Return 401 if unauthenticated
6. Authorization (if required)
   → Check user role
   → Check resource ownership
   → Return 403 if unauthorized
7. Input validation
   → Zod schema validation
   → Return 400 if invalid
8. Business logic
   → Handler executes service calls
   → Services interact with infrastructure
9. Response construction
   → Standard format: { success, data, error, meta }
   → Set appropriate status code
10. Audit logging (if required)
11. Response sent to client
```

---

## 11. Database Standards

### 11.1 Schema Rules

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

### 11.2 Query Rules

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
  });
}
```

### 11.3 Migration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One migration per change** | Each migration does one thing | Easy to rollback |
| **Never modify deployed migrations** | Create new migration instead | Data safety |
| **Test migrations locally** | Run on dev database first | Prevent production issues |
| **Seed after migration** | Seed script runs after migration | Consistent test data |
| **Backward compatible** | New columns must be nullable or have defaults | Zero-downtime deploys |

### 11.4 Cascade Rules

| Parent | Child | Strategy | Rationale |
|--------|-------|----------|-----------|
| User | Profile | Cascade | User owns profile |
| User | Session | Cascade | User owns sessions |
| User | Address | Cascade | User owns addresses |
| User | Cart | Cascade | User owns cart |
| User | Wishlist | Cascade | User owns wishlist |
| User | Order | Restrict | Never delete user with orders |
| User | Review | Restrict | Never delete user with reviews |
| Product | ProductVariant | Cascade | Product owns variants |
| Product | Review | Restrict | Never delete product with reviews |
| Category | Product | SetNull | Product can exist without category |
| Order | OrderItem | Cascade | Order owns items |
| Cart | CartItem | Cascade | Cart owns items |

---

## 12. Security Standards

### 12.1 Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Restrictive CSP | Prevent XSS |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer |
| `Permissions-Policy` | Restrictive | Limit browser features |

### 12.2 Authentication Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly cookies** | Never store tokens in localStorage | Prevent XSS theft |
| **Short access tokens** | 15-minute TTL | Security |
| **Long refresh tokens** | 7-day TTL | User experience |
| **CSRF protection** | Double-submit cookie pattern | Prevent CSRF |
| **Session rotation** | On sensitive operations | Prevent session fixation |
| **Max sessions** | 5 per user | Prevent abuse |
| **Brute force protection** | Rate limiting + lockout | Security |

### 12.3 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| **Login** | 20 requests | 1 minute |
| **Register** | 10 requests | 1 minute |
| **Password reset** | 5 requests | 1 hour |
| **General API** | 100 requests | 1 minute |
| **File upload** | 10 requests | 1 minute |

### 12.4 Input Validation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side always** | Every endpoint validates input | Security cannot depend on client |
| **Client-side for UX** | Forms validate before submission | Better UX |
| **Shared schemas** | Same Zod schema for both | No duplication |
| **No `z.any()`** | Every field has a type | Type safety |
| **Explicit rules** | min, max, pattern, enum | Clear constraints |
| **Error details** | Field-level error messages | Better UX |

### 12.5 Secret Management

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never commit secrets** | Use `.env.example` with placeholders | Security |
| **Validate at startup** | Zod schema for env vars | Catch missing config early |
| **Rotate regularly** | Change secrets periodically | Security best practice |
| **Minimal access** | Least privilege for service keys | Security |
| **No logging secrets** | Never log tokens, passwords, keys | Security |

---

## 13. Performance Standards

### 13.1 Bundle Size Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Route-level splitting** | `React.lazy()` for routes | Faster initial load |
| **Component-level splitting** | Lazy load heavy components | Reduce initial bundle |
| **Named exports only** | Better tree-shaking | Smaller bundles |
| **Direct imports** | No barrel files | Tree-shaking efficiency |
| **Analyze regularly** | Use `pnpm build --analyze` | Catch bloat |

### 13.2 Image Optimization

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-format** | Use `f_auto` for Cloudinary | Best format per browser |
| **Auto-quality** | Use `q_auto` for Cloudinary | Optimal quality/size |
| **Lazy loading** | `loading="lazy"` on images | Faster initial load |
| **Responsive srcSet** | Multiple sizes for different screens | Appropriate size per device |
| **Alt text** | Always provide alt text | Accessibility |
| **Placeholder** | Show skeleton while loading | Better UX |

### 13.3 Caching Strategy

| Data | TTL | Invalidation |
|------|-----|--------------|
| **Products list** | 5 min | On product update |
| **Product detail** | 5 min | On product update |
| **Categories** | 1 hour | On category update |
| **Site settings** | 10 min | On settings update |
| **Search results** | 1 min | On search |

### 13.4 Rendering Strategy

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile-first** | Design for mobile, enhance for desktop | 70%+ traffic |
| **Progressive enhancement** | Core functionality works everywhere | Accessibility |
| **Lazy loading** | Load heavy components on demand | Performance |
| **Skeleton screens** | Show loading placeholders | Better UX |
| **Optimistic updates** | Update UI before server responds | Perceived performance |

---

## 14. Testing Standards

### 14.1 Testing Strategy

| Type | Tool | Coverage Target | When |
|------|------|-----------------|------|
| **Unit Testing** | Vitest | 90%+ for utilities, 80%+ for handlers | Every feature |
| **Integration Testing** | Vitest | Critical paths | Every feature |
| **E2E Testing** | Playwright | Critical user flows | Every feature |
| **UI Testing** | Playwright | Visual regression | As needed |
| **Performance Testing** | Lighthouse | Core Web Vitals | Before release |
| **Security Testing** | Manual + automated | OWASP Top 10 | Before release |

### 14.2 Testing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Deterministic** | All tests must be reliable | Trust in test suite |
| **Fast feedback** | Unit tests < 100ms, E2E < 5min | Developer productivity |
| **CI enforced** | Tests must pass before merge | Quality gate |
| **No flaky tests** | Fix or remove unreliable tests | Maintain trust |
| **Critical paths** | Auth, payments, checkout: 100% coverage | Revenue-critical |
| **Test alongside** | Write tests with implementation | Prevent regressions |

### 14.3 Test Structure

```typescript
// ✓ CORRECT: Unit test structure
import { describe, it, expect } from 'vitest';
import { formatPrice } from './format';

describe('formatPrice', () => {
  it('formats Indian Rupee correctly', () => {
    expect(formatPrice(1000)).toBe('₹1,000');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('₹0');
  });

  it('handles decimals', () => {
    expect(formatPrice(99.99)).toBe('₹99.99');
  });
});
```

### 14.4 Critical Flows to Test

1. **Registration → Login → Logout**
2. **Browse products → Add to cart → Checkout → Payment**
3. **Order history → Order tracking → Return request**
4. **Admin: Product CRUD, order management**

---

## 15. Documentation Standards

### 15.1 Code Documentation

| Situation | Rule | Example |
|-----------|------|---------|
| **Business logic** | Add comment explaining WHY | `// Razorpay requires amount in paise` |
| **Security consideration** | Add comment explaining risk | `// Timing-safe comparison` |
| **Non-obvious workaround** | Add comment with link to issue | `// Workaround for CF Workers limitation` |
| **TODO** | Link to GitHub issue | `// TODO(#123): Remove after migration` |
| **Everything else** | No comment | Code should be self-documenting |

### 15.2 API Documentation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Endpoint description** | Comment on handler function | Clear purpose |
| **Request schema** | Zod schema serves as docs | Type-safe documentation |
| **Response format** | Standardized format | Consistent consumption |
| **Error codes** | Document all error codes | Frontend can handle all cases |

### 15.3 Architecture Documentation

| Document | Purpose | Owner |
|----------|---------|-------|
| **ARCHITECTURE.md** | Complete engineering blueprint | Tech Lead |
| **TECH_STACK.md** | Technology decisions | Tech Lead |
| **FOLDER_ARCHITECTURE.md** | Folder organization | Tech Lead |
| **DESIGN_SYSTEM_ARCHITECTURE.md** | Design system standards | Design Lead |
| **DATABASE_ARCHITECTURE.md** | Database architecture | Database Lead |
| **API_SERVICE_ARCHITECTURE.md** | API service architecture | Backend Lead |
| **ENGINEERING_HANDBOOK.md** | This file — consolidated standards | Tech Lead |

### 15.4 Change Logs

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic versioning** | `MAJOR.MINOR.PATCH` | Clear change communication |
| **Conventional commits** | `feat:`, `fix:`, `refactor:`, etc. | Automated changelogs |
| **Breaking changes** | Document in changelog | Migration guidance |
| **Deprecations** | 6-month notice minimum | Migration time |

---

## 16. Git Workflow

### 16.1 Branch Strategy

```
main                    ← Production (auto-deploy)
├── develop             ← Integration branch (auto-deploy to staging)
│   ├── feature/*       ← Feature branches
│   ├── fix/*           ← Bug fix branches
│   ├── refactor/*      ← Refactor branches
│   └── chore/*         ← Maintenance branches
```

### 16.2 Branch Naming

| Pattern | Example | When to Use |
|---------|---------|-------------|
| `feature/<domain>-<description>` | `feature/auth-login` | New features |
| `fix/<domain>-<description>` | `fix/checkout-total` | Bug fixes |
| `refactor/<domain>-<description>` | `refactor/api-handlers` | Code refactoring |
| `chore/<description>` | `chore/update-deps` | Maintenance |

### 16.3 Commit Convention

```
feat(auth): add login endpoint with Supabase integration
fix(cart): prevent duplicate items when variant changes
refactor(api): split auth handler into domain modules
test(checkout): add integration tests for payment flow
chore(deps): update Prisma to 7.0
```

### 16.4 Pull Request Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Small PRs** | < 500 lines changed | Easier review |
| **Single responsibility** | One feature/fix per PR | Clear purpose |
| **Description** | Explain what and why | Reviewer context |
| **Tests included** | New code has tests | Quality gate |
| **No drafts for review** | Mark as ready when complete | Respect reviewer time |
| **CI must pass** | All checks green | Quality gate |

### 16.5 Release Strategy

| Type | Convention | Example |
|------|-----------|---------|
| **Semantic Versioning** | `MAJOR.MINOR.PATCH` | `1.2.3` |
| **MAJOR** | Breaking changes | API contract, DB schema |
| **MINOR** | New features (non-breaking) | New endpoint, new field |
| **PATCH** | Bug fixes | Fix validation, fix typo |

### 16.6 Hotfix Process

1. Create `fix/critical-description` from `main`
2. Fix the issue
3. Add tests for the fix
4. Create PR to `main`
5. After merge, cherry-pick to `develop`
6. Deploy immediately

---

## 17. AI Development Rules

### 17.1 Mandatory Rules

Every future AI agent must:

| Rule | Description | Rationale |
|------|-------------|-----------|
| **Respect previous architecture** | Follow existing patterns and decisions | Consistency |
| **Never duplicate functionality** | Check existing code before creating new | DRY principle |
| **Never redesign completed modules** | Don't refactor working code without approval | Stability |
| **Never hardcode business logic** | Use configuration and constants | Maintainability |
| **Build production-ready solutions** | No placeholders, no TODOs in code | Quality |
| **Explain architectural decisions** | Document why, not just what | Knowledge sharing |
| **Keep modules independent** | Follow dependency rules strictly | Modularity |
| **Maintain consistency** | Match existing code style exactly | Cohesion |
| **Read documentation first** | Understand existing standards before coding | Informed decisions |
| **Use prompt as primary specification** | This handbook is the source of truth | Authority |

### 17.2 Before Writing Code

1. **Read ARCHITECTURE.md** — Understand the overall system
2. **Read relevant domain docs** — Database, API, or Design standards
3. **Check existing code** — See how similar features are implemented
4. **Follow naming conventions** — Use established patterns
5. **Respect module boundaries** — Don't import across boundaries

### 17.3 While Writing Code

1. **Follow coding standards** — No `any`, no comments, named exports
2. **Use shared utilities** — Don't reinvent the wheel
3. **Validate all inputs** — Zod schemas for every endpoint
4. **Handle errors properly** — Typed errors, no silent failures
5. **Write self-documenting code** — Clear names, clear structure

### 17.4 After Writing Code

1. **Run lint and typecheck** — Ensure code quality
2. **Write tests** — At least for critical paths
3. **Update documentation** — If architecture changed
4. **Follow PR process** — Small, focused, well-described

---

## 18. Definition of Done

### 18.1 Module Completion Checklist

Every module must satisfy ALL of the following before being considered complete:

| Category | Checklist Item | Verified By |
|----------|---------------|-------------|
| **Architecture** | Follows feature-first structure | Code review |
| **Architecture** | Respects module boundaries | Code review |
| **Architecture** | Uses shared utilities, not duplicates | Code review |
| **Feature** | All specified functionality implemented | Product review |
| **Feature** | All edge cases handled | Code review |
| **Responsive** | Works on mobile (320px+) | Visual testing |
| **Responsive** | Works on tablet (768px+) | Visual testing |
| **Responsive** | Works on desktop (1280px+) | Visual testing |
| **Accessible** | Keyboard navigation works | Manual testing |
| **Accessible** | Screen reader compatible | Manual testing |
| **Accessible** | Color contrast meets WCAG AA | Automated testing |
| **Accessible** | Focus states visible | Manual testing |
| **Secure** | Input validation on all endpoints | Code review |
| **Secure** | Authentication checked | Code review |
| **Secure** | Authorization checked | Code review |
| **Secure** | No secrets in code | Security scan |
| **Secure** | Rate limiting applied | Code review |
| **Tested** | Unit tests written | CI pipeline |
| **Tested** | Integration tests for critical paths | CI pipeline |
| **Tested** | E2E tests for user flows | CI pipeline |
| **Tested** | All tests passing | CI pipeline |
| **Documented** | Code is self-documenting | Code review |
| **Documented** | API endpoints documented | Code review |
| **Documented** | Error codes documented | Code review |
| **Performance** | Bundle size within budget | Build analysis |
| **Performance** | Images optimized | Manual testing |
| **Performance** | Lazy loading implemented | Code review |
| **Performance** | Caching strategy applied | Code review |
| **Production** | No console.log in code | Lint check |
| **Production** | No TODO comments in code | Lint check |
| **Production** | Environment variables validated | Code review |
| **Production** | Error handling complete | Code review |
| **Compatible** | No breaking changes to existing features | Regression testing |
| **Compatible** | Database migrations backward compatible | Migration review |
| **Compatible** | API responses match established format | API testing |

### 18.2 Quality Gates

| Gate | Tool | Pass Criteria |
|------|------|---------------|
| **Lint** | ESLint | 0 errors, 0 warnings |
| **TypeCheck** | TypeScript | 0 type errors |
| **Format** | Prettier | All files formatted |
| **Unit Tests** | Vitest | All passing, coverage targets met |
| **E2E Tests** | Playwright | All critical flows passing |
| **Build** | Vite | Successful production build |
| **Security** | Automated scan | No vulnerabilities |

### 18.3 Deployment Checklist

| Step | Action | Verified By |
|------|--------|-------------|
| 1 | All quality gates pass | CI pipeline |
| 2 | PR approved by at least 1 reviewer | GitHub |
| 3 | No merge conflicts | GitHub |
| 4 | Database migrations tested locally | Developer |
| 5 | Environment variables documented | Developer |
| 6 | Changelog updated | Developer |
| 7 | Version bumped (if release) | Tech Lead |
| 8 | Deployed to staging | CI pipeline |
| 9 | Staging smoke tested | QA |
| 10 | Deployed to production | CI pipeline |
| 11 | Production smoke tested | QA |
| 12 | Monitoring checked | DevOps |

---

## Appendix A: Technology Stack Summary

| Category | Technology | Version |
|----------|-----------|---------|
| **Frontend Framework** | React | 19.x |
| **Backend Runtime** | Cloudflare Pages Functions | Edge |
| **Programming Language** | TypeScript | 5.x (strict) |
| **Build Tool** | Vite | 6.x |
| **Database** | PostgreSQL (Neon Serverless) | — |
| **ORM** | Prisma | 6.x |
| **Authentication** | Supabase Auth + Custom Sessions | — |
| **Authorization** | Custom RBAC | — |
| **Bot Protection** | Cloudflare Turnstile | — |
| **Image Storage** | Cloudinary | — |
| **File Storage** | Cloudflare R2 | — |
| **Caching** | Cloudflare KV + TanStack Query | — |
| **Search** | PostgreSQL pg_trgm | — |
| **State Management** | Zustand (client) + TanStack Query (server) | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Component Library** | Custom design system | — |
| **Animations** | Framer Motion | 12.x |
| **Form Handling** | React Hook Form + Zod | — |
| **Validation** | Zod | 3.x |
| **API Design** | REST (JSON) | — |
| **Email Service** | Resend + React Email | — |
| **Payments** | Razorpay | — |
| **Logging** | Pino | — |
| **Error Monitoring** | Sentry | — |
| **Analytics** | PostHog | — |
| **Unit Testing** | Vitest | 4.x |
| **E2E Testing** | Playwright | 1.x |
| **Linting** | ESLint + Prettier | 9.x / 3.x |
| **Package Manager** | pnpm | — |
| **CI/CD** | GitHub Actions | — |
| **Hosting** | Cloudflare Pages | — |
| **Icons** | Lucide React | — |

---

## Appendix B: Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `DATABASE_URL` | URL | PostgreSQL connection string |
| `HYPERDRIVE_URL` | URL | Hyperdrive connection string |
| `SUPABASE_URL` | URL | Supabase project URL |
| `SUPABASE_ANON_KEY` | String | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | String | Supabase service role key |
| `RAZORPAY_KEY_ID` | String | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | String | Razorpay secret key |
| `RESEND_API_KEY` | String | Resend API key |
| `CLOUDINARY_CLOUD_NAME` | String | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | String | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | String | Cloudinary API secret |
| `TURNSTILE_SECRET_KEY` | String | Turnstile secret key |
| `CSRF_SECRET` | String | CSRF token secret (32+ chars) |
| `APP_URL` | URL | Application URL |
| `NODE_ENV` | Enum | Environment name |

---

## Appendix C: Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `UNPROCESSABLE_ENTITY` | 422 | Business rule violation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `INSUFFICIENT_STOCK` | 422 | Product out of stock |
| `PAYMENT_FAILED` | 422 | Payment processing failed |
| `COUPON_INVALID` | 422 | Coupon code invalid |
| `ADDRESS_INVALID` | 422 | Address validation failed |

---

*Last updated: August 03, 2026*  
*This document is the single source of truth for all Nabome engineering standards.*
