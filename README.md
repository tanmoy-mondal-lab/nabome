# নবME (Nabome) — Commerce Operating System

A multi-tenant, multi-role e-commerce marketplace platform built as a pnpm monorepo. Designed for the Indian market with INR currency, Razorpay payments, and COD support.

**Version**: 0.1.0 | **Node**: >=22.0.0 | **Package Manager**: pnpm >=10.0.0

## Project Overview

নবME is a full-stack commerce platform comprising four applications:

| App          | Purpose                                   | Port | Framework          |
| ------------ | ----------------------------------------- | ---- | ------------------ |
| **Customer** | Customer-facing storefront (mobile-first) | 5173 | React 19 + Vite    |
| **Admin**    | Platform administration dashboard         | 5174 | React 19 + Vite    |
| **Shop**     | Shop owner management dashboard           | 5175 | React 19 + Vite    |
| **API**      | Backend API (Cloudflare Pages Functions)  | 8788 | Cloudflare Workers |

## Current Status

**Overall Platform Health**: 8.0/10 (after P0 and P1 remediations)

**Launch Readiness**: NOT READY - P0 operational blockers must be resolved before production deployment

| Area                  | Status             | Notes                                                                                       |
| --------------------- | ------------------ | ------------------------------------------------------------------------------------------- |
| Database Schema       | Complete           | 69 models, 62 enums, migration history exists (0001_init, 0002_preserve_historical_records) |
| API Handlers          | Complete           | 21 domain handlers, full CRUD across all domains                                            |
| Authentication        | Complete           | Custom JWT (HS256) in httpOnly cookies + bcrypt + CSRF double-submit + Turnstile CAPTCHA    |
| Payment System        | Complete           | Razorpay integration + COD + Mock gateway for dev                                           |
| Customer App          | Mostly Complete    | 12 fully implemented features, 5 partial                                                    |
| Shop App              | Mostly Complete    | 10 fully implemented features, 3 partial                                                    |
| Admin App             | Partially Complete | 7 fully implemented, 5 shell pages (Analytics, Settings, CMS, Payments, Returns)            |
| **Production Config** | 🔴 Blocked         | Cloudflare placeholder bindings, no Neon database, no backup infrastructure                 |
| **External Services** | 🔴 Blocked         | Razorpay, Resend, Turnstile, Sentry not configured for production                           |

## Technology Stack

### Backend

- **Runtime**: Cloudflare Pages Functions (Node.js compatible)
- **Database**: PostgreSQL 17 via Prisma ORM 6.19.3 (local Docker, Neon intended for production)
- **Auth**: Custom JWT (HS256, `jsonwebtoken`) in httpOnly cookies + bcrypt (`bcryptjs`)
- **Payments**: Razorpay (production) + Mock gateway (development) + COD support
- **Email**: Resend REST API
- **CAPTCHA**: Cloudflare Turnstile (server-side verification)
- **CSRF**: Double-submit cookie pattern enforced across all API clients
- **Rate Limiting**: Cloudflare KV fixed-window (60-500 req/min across 5 tiers)
- **Storage**: Cloudflare R2 (media, bucket: `nabome-media`)
- **Queues**: Cloudflare Queues (notifications, emails)
- **Monitoring**: Sentry v8 integration (customer app configured, API configured, shop/admin pending)

### Frontend

- **Framework**: React 19.2.8
- **Build Tool**: Vite 6.4.3
- **Routing**: React Router 7.18.2
- **State**: Zustand 5.0.14 (persisted to localStorage)
- **Server State**: TanStack Query 5.101.4
- **Forms**: React Hook Form 7.54.0 + Zod validation
- **Styling**: Tailwind CSS 4.3.3
- **UI**: Custom `@nabome/ui` component library (67+ components)
- **Icons**: Lucide React 1.28.0
- **Animations**: Framer Motion 12.43.0

### Development

- **Linting**: ESLint 9.17.0 (flat config, import ordering enforced)
- **Formatting**: Prettier 3.4.2
- **Git Hooks**: Husky 9.1.7 + lint-staged
- **Commit Linting**: commitlint (conventional commits, 20 scopes)
- **Testing**: Vitest 4.1.10 + Playwright 1.49.1
- **Secret Scanning**: Gitleaks + TruffleHog (CI)
- **Architecture Guards**: Custom scripts enforce import boundaries and naming
- **TypeScript**: ~5.9.3 (consistent across all packages)

## Repository Structure

```
nabome/
├── apps/
│   ├── api/                    # Backend API (Cloudflare Pages Functions)
│   │   ├── _handlers/          # 21 domain handler modules (self-registering routes)
│   │   ├── _lib/               # Shared library modules (services, middleware, auth, storage)
│   │   ├── functions/          # Cloudflare Pages entry points + global middleware
│   │   ├── prisma/             # Schema (69 models, 62 enums) + migrations + seed
│   │   ├── tests/              # API tests (cart, checkout, integration, inventory)
│   │   └── wrangler.jsonc      # Cloudflare deployment config (placeholder bindings)
│   ├── customer/               # Customer storefront (mobile-first React SPA)
│   │   └── src/features/       # 10 feature modules (account, cart, catalog, checkout, etc.)
│   ├── admin/                  # Admin dashboard (React SPA)
│   │   └── src/features/       # 15 admin feature modules
│   └── shop/                   # Shop owner dashboard (React SPA)
│       └── src/features/       # 12 shop feature modules
├── packages/
│   ├── @nabome/types           # Canonical domain types (553 lines, zero deps)
│   ├── @nabome/constants       # Business/infra constants (152 lines, zero deps)
│   ├── @nabome/utils           # cn(), formatting, slugs (clsx + tailwind-merge)
│   ├── @nabome/auth            # RBAC, permissions, session contract (framework-agnostic)
│   ├── @nabome/config          # Env validation (Zod), feature flags, shared Vite config
│   ├── @nabome/validation      # Zod schemas for all API inputs (396 lines)
│   ├── @nabome/api-contracts   # API response envelope, error codes (pure TS)
│   ├── @nabome/logging         # Edge-compatible Pino logger + browser logger
│   ├── @nabome/design-tokens   # CSS custom properties + theme engine (light/dark/admin/shop)
│   ├── @nabome/ui              # 67+ React components (forwardRef, token-driven)
│   ├── @nabome/customer        # Customer account center (Zustand store, services, hooks)
│   ├── @nabome/order           # Order state machine (16 states, 30+ transitions)
│   ├── @nabome/payment         # Payment engine (gateway abstraction, money math, webhooks)
│   ├── @nabome/finance         # Commission engine, double-entry ledger, settlement FSM
│   ├── @nabome/inventory       # Stock movements, reservations, warehouse types
│   ├── @nabome/returns         # Returns/refunds/disputes (v1.0.0, full-stack)
│   └── @nabome/shipping        # Shipping/fulfillment/tracking + carrier abstraction
├── e2e/                        # Playwright E2E tests (smoke tests across all 4 apps)
├── tests/                      # Shared test fixtures + fetch mock utility
├── scripts/                    # Bootstrap, clean, architecture guard, env validator
├── infra/                      # Docker Compose (local Postgres) + Cloudflare secrets script
├── docs/                       # Audit reports, authorization matrix, work documents
│   ├── INTEGRATION_AUDIT_REPORT.md
│   ├── AUTHORIZATION_MATRIX.md
│   └── work/                   # Detailed audit reports (foundation, database, security, apps)
├── .changeset/                 # Changesets config (base branch: production)
└── .github/                    # CI/CD workflows + Dependabot
```

## Architecture Overview

### API Architecture

The API uses a **custom route registry** (no framework). Routes self-register via `register()` calls in each domain handler module. A catch-all Cloudflare Pages function (`[[path]].ts`) dispatches incoming requests to the matching handler.

**Request flow:**

1. Global middleware (`_middleware.ts`): Sentry init → Request ID → CORS → Rate limiting → CSRF validation → Context assembly
2. Catch-all router (`[[path]].ts`): Path matching with `{param}` extraction → Handler dispatch
3. Domain handler: Auth middleware → Validation → Business logic → Response envelope

**Key patterns:**

- All responses wrapped in `{ success, data, error, meta: { requestId, version } }` envelope
- 37 machine-readable error codes mapped to HTTP statuses
- Handler domains never cross-import (enforced by architecture guard)
- `_lib/` never imports `_handlers/` (enforced by architecture guard)

### Frontend Architecture

All three frontend apps share identical patterns:

- **Routing**: React Router v7 with `createBrowserRouter`, lazy-loaded pages
- **State**: Zustand stores with `persist` middleware (localStorage)
- **Server State**: TanStack Query v5 for data fetching/caching
- **Styling**: Tailwind CSS v4 via Vite plugin, token-driven via `@nabome/design-tokens`
- **Path Alias**: `@/` → `./src/` in all apps
- **Auth Guards**: `GuestRoute`, `ProtectedRoute`, `AdminRoute`, `ShopRoute`
- **Build**: Shared `defineAppViteConfig` from `@nabome/config`

### User Roles & Permissions

| Role         | Level | Accessible Areas                                                       |
| ------------ | ----- | ---------------------------------------------------------------------- |
| `guest`      | 0     | Public catalog, product pages, login/register                          |
| `customer`   | 10    | + Cart, checkout, orders, account, wishlist                            |
| `shop_owner` | 20    | + Shop dashboard (products, orders, customers, finance, shipping, CMS) |
| `admin`      | 30    | + Admin dashboard (all shops, analytics, settings, security, system)   |
| `system`     | 100   | Internal system operations                                             |

RBAC is implemented via `@nabome/auth` with 26 permission-to-role mappings across 13 scopes and 21 resources.

### Database Schema

69 Prisma models and 62 enums across 8 domains, using PostgreSQL with:

- UUIDv4 primary keys
- `Decimal(10, 2)` for money (INR)
- Soft delete via `isActive` boolean (20+ models)
- Timestamps with timezone (`@db.Timestamptz(6)`)
- Snake_case table names (`@@map()`)
- Extensive composite indexes
- `@@check` constraints on stock fields
- Migration history: `0001_init` (87KB), `0002_preserve_historical_records` (P1 remediation)

**Domains:** User Management, Catalog (products/categories/brands/collections), Cart & Checkout, Orders, Payments (including COD), Shipping & Fulfillment, Returns & Disputes, Finance (settlements/commissions/ledger).

**Cascade Delete Status (P1 Remediation Complete)**:

- Critical cascade deletes resolved: `Payment.order`, `Address.user`, `ReturnRequest.order` now use `onDelete: Restrict`
- `Order.user` was already safe (no cascade)
- Acceptable cascades remain: Session, tokens, reviews, wishlist, product variants/order items

## User Flows

### Customer Journey

1. **Browse**: Home → Shop (category filter) → Product Detail (variants, media, reviews)
2. **Cart**: Add item → View cart (quantity controls, order summary) → Validate stock
3. **Checkout**: Select address (CRUD) → Apply coupon → Select shipping rate → Pay (Razorpay/COD)
4. **Post-Purchase**: Order detail (timeline, status tracking) → Cancel/Return → Reorder

### Shop Owner Flow

1. **Dashboard**: KPIs, revenue charts, pending orders, inventory alerts
2. **Products**: CRUD, bulk publish/delete, variant management
3. **Orders**: Processing → Packing → Fulfillment queues, bulk transitions
4. **Finance**: Earnings, settlements, transactions, refund queue
5. **Shipping**: Carrier management, fulfillment queue, tracking

### Admin Flow

1. **Dashboard**: Platform KPIs, activity feed, pending tasks
2. **Governance**: Shop approval/suspension, product moderation, customer management
3. **Operations**: Security alerts, audit logs, system health, background jobs
4. **Orders**: Cross-shop order management, bulk transitions

## Environment Variables

Copy `.env.example` to `.env`. All variables are validated at startup by `@nabome/config`.

### Shared

```
NODE_ENV=development          # development | test | production
APP_URL=http://localhost:5173
PUBLIC_API_URL=http://localhost:8788
LOG_LEVEL=info                # fatal | error | warn | info | debug | trace
ENVIRONMENT=local             # local | preview | staging | production
SESSION_COOKIE_NAME=nabome_session
CSRF_SECRET=change-me-in-production
JWT_SECRET=change-me-in-production
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

### API (Database)

```
DATABASE_URL=postgresql://nabome:nabome@localhost:5432/nabome?schema=public
HYPERDRIVE_URL=               # Cloudflare Hyperdrive connection (edge runtime) - REQUIRED FOR PRODUCTION
```

### API (Payments)

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
```

### API (Email)

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@nabome.online
```

### API (Storage)

```
R2_BUCKET_NAME=nabome-storage
```

### API (Security)

```
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
WEBHOOK_SECRET=your-webhook-secret
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### API (Finance - wrangler.jsonc vars)

```
PAYMENT_PROVIDER=razorpay     # mock | razorpay
FINANCE_COMMISSION_RATE=15    # Default commission %
FINANCE_COMMISSION_CAP=50     # Max commission %
FINANCE_HOLD_DAYS=7           # Settlement hold period
FINANCE_SETTLEMENT_MIN=100    # Min settlement amount (INR)
COD_ENABLED=true
COD_MAX_AMOUNT=5000           # Max COD order amount (INR)
```

### API (Monitoring)

```
SENTRY_DSN=
```

> **Security Note**: Never commit real secrets. `.env` files are git-ignored. The `scripts/validate-env.mjs` script scans for committed secrets.

## Installation & Setup

### Prerequisites

- Node.js >=22.0.0
- pnpm >=10.0.0
- PostgreSQL 17 (local via Docker, or cloud via Neon)
- Cloudflare account (for deployment)

### Quick Start

```bash
git clone <repository-url>
cd nabome
pnpm bootstrap
```

The `bootstrap` script:

1. Validates Node >=22 and pnpm >=10
2. Installs dependencies (`pnpm install`)
3. Generates Prisma client
4. Scaffolds `.env` and `.dev.vars` from examples
5. Runs architecture and environment validation

### Manual Setup

```bash
pnpm install
cp .env.example .env          # Configure environment
cp apps/api/.dev.vars.example apps/api/.dev.vars  # Configure API secrets
pnpm db:generate              # Generate Prisma client
pnpm db:migrate               # Run database migrations
pnpm db:seed                  # Seed with sample data (optional)
```

### Local Database (Docker)

```bash
docker compose -f infra/docker-compose.yml up -d
```

Starts PostgreSQL 17 on port 5432 with health checks. Data persists in a named volume.

## Development

```bash
pnpm dev                # Start all 4 apps in parallel
pnpm dev:api            # API only (port 8788)
pnpm dev:customer       # Customer app only (port 5173)
pnpm dev:admin          # Admin app only (port 5174)
pnpm dev:shop           # Shop app only (port 5175)
```

All frontend apps use Vite HMR. The API uses Wrangler Pages dev server.

## Building

```bash
pnpm build              # Build all packages and apps
pnpm build:api          # Build API (tsc --noEmit)
pnpm build:customer     # Build customer app
pnpm build:admin        # Build admin app
pnpm build:shop         # Build shop app
```

## Quality Checks

```bash
pnpm check              # Run ALL checks (lint + format + typecheck + unit tests + validate)
pnpm lint               # ESLint (flat config, import ordering enforced)
pnpm lint:fix           # Auto-fix lint issues
pnpm format             # Prettier format
pnpm format:check       # Check formatting
pnpm typecheck          # TypeScript type checking across all packages
pnpm test               # Run all tests
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests (requires running database)
pnpm test:e2e           # Playwright E2E tests (starts all 4 apps automatically)
```

## Testing

### Unit Tests

- **Framework**: Vitest with jsdom environment
- **Coverage**: ~20% (CI threshold set to 20% for V1 launch)
- **Fixtures**: Deterministic factories in `tests/fixtures/` (users, products, orders)
- **Mock**: Zero-dependency fetch interceptor in `tests/mocks/fetch-mock.ts`

### E2E Tests

- **Framework**: Playwright (Chromium, fully parallel)
- **Scope**: Smoke tests across all 4 apps (checkout, shop isolation, shop owner workflow)
- **Auto-orchestration**: Playwright starts all dev servers before tests
- **CI**: 2 retries, 2 workers, GitHub reporter
- **Status**: Infrastructure configured, but tests blocked by production configuration gaps

### Test Commands per Package

```bash
pnpm --filter @nabome/api test
pnpm --filter @nabome/customer test
pnpm --filter @nabome/payment test
# etc.
```

## Deployment

### Cloudflare Pages (API)

```bash
pnpm build:api
cd apps/api
wrangler pages deploy
```

**Cloudflare bindings** (configured in `wrangler.jsonc`):

- KV namespace (rate limiting) - 🔴 **PLACEHOLDER ID MUST BE REPLACED**
- R2 bucket `nabome-media` (file storage) - ✅ Configured
- Hyperdrive (PostgreSQL connection pooling) - 🔴 **PLACEHOLDER ID MUST BE REPLACED**
- Queues: `nabome-notifications`, `nabome-emails` - ✅ Configured

**Environments**: `staging` (nabome-api-staging) and `production` (nabome-api).

**Critical Blocker**: KV namespace and Hyperdrive config have placeholder IDs (`TODO_REPLACE_WITH_ACTUAL_KV_NAMESPACE_ID`, `TODO_REPLACE_WITH_ACTUAL_HYPERDRIVE_CONFIG_ID`). These must be replaced with actual Cloudflare resource IDs before deployment.

### Frontend Applications

Each frontend app builds to a `dist/` directory deployable to any static host:

```bash
pnpm build:customer     # Deploy dist/ to your CDN/hosting
pnpm build:admin
pnpm build:shop
```

### Cloudflare Secrets

Push secrets to Cloudflare Pages:

```bash
node infra/scripts/cf-secrets.mjs --env staging    # Push to staging
node infra/scripts/cf-secrets.mjs --env production  # Push to production
```

### CI/CD (GitHub Actions)

**On push to `production` or PRs** (`ci.yml`):

1. **quality**: Lint, format, typecheck, unit tests, architecture validation, security audit, secret scanning
2. **build**: Full production build of all packages
3. **integration**: Postgres service container, API integration tests
4. **e2e**: Playwright smoke tests across all apps

**On version tags** (`release.yml`):

1. **verify**: Full quality gate + build
2. **deploy-staging**: Deploy API to Cloudflare Pages staging
3. **deploy-production**: Deploy API to Cloudflare Pages production (requires staging success)
4. **changelog**: Changesets release PR or package publish

## Scripts Reference

| Script             | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `pnpm bootstrap`   | One-command developer setup                                     |
| `pnpm clean`       | Remove build artifacts (dist, coverage, .wrangler)              |
| `pnpm clean:all`   | Remove artifacts + all node_modules                             |
| `pnpm validate`    | Run architecture guard + environment validator                  |
| `pnpm check`       | Full quality gate (lint + format + typecheck + test + validate) |
| `pnpm db:generate` | Generate Prisma client                                          |
| `pnpm db:migrate`  | Run database migrations                                         |
| `pnpm db:seed`     | Seed database with sample data                                  |

## Architecture Guards

Custom scripts enforce project conventions:

1. **`apps/`** contains exactly `customer`, `admin`, `shop`, `api`
2. **`packages/`** has 17 required shared packages
3. Every package has a `src/index.ts` barrel export
4. Every package/app is named `@nabome/<name>`
5. No app imports another app
6. `_lib/` never imports `_handlers/`
7. Handler domains never cross-import

## Feature Status Matrix

### Customer App

| Feature                                 | Status                                           |
| --------------------------------------- | ------------------------------------------------ |
| Home page (hero, featured, trending)    | Complete                                         |
| Product catalog with filters            | Complete                                         |
| Product detail (variants, media)        | Complete                                         |
| Cart (quantity, validation, merge)      | Complete                                         |
| Checkout (addresses, coupons, shipping) | Complete                                         |
| Order list & detail (timeline)          | Complete                                         |
| Login / Register (Turnstile CAPTCHA)    | Complete                                         |
| Account dashboard                       | Complete                                         |
| Address book                            | Complete                                         |
| Wishlist                                | Partial (TODOs for bulk operations)              |
| Reviews                                 | Coming Soon (awaiting `@nabome/reviews` package) |
| Loyalty program                         | Coming Soon (awaiting `@nabome/loyalty` package) |
| Returns                                 | Partial (UI complete, not API-connected)         |

### Admin App

| Feature                          | Status                                |
| -------------------------------- | ------------------------------------- |
| Dashboard (KPIs, activity feed)  | Complete                              |
| Orders management                | Complete                              |
| Customers management             | Complete                              |
| Shops management (list + detail) | Partial (shop detail tabs incomplete) |
| Products governance (moderation) | Complete                              |
| System operations                | Complete                              |
| Security (alerts, audit logs)    | Complete                              |
| Inventory management             | Partial (movements tab incomplete)    |
| Reports                          | Partial (generate/download are stubs) |
| Analytics                        | Shell only (6 tabs, all placeholder)  |
| Settings                         | Shell only (8 tabs, all placeholder)  |
| CMS                              | Shell only (4 tabs, all placeholder)  |
| Payments governance              | Shell only (5 tabs, all placeholder)  |
| Returns governance               | Shell only (4 tabs, all placeholder)  |

### Shop App

| Feature                                 | Status                                      |
| --------------------------------------- | ------------------------------------------- |
| Dashboard (KPIs, charts)                | Complete                                    |
| Products CRUD                           | Complete                                    |
| Orders (processing/packing/fulfillment) | Complete                                    |
| Customers                               | Complete                                    |
| Shipping & fulfillment                  | Complete                                    |
| Finance (earnings, settlements)         | Complete                                    |
| CMS (homepage, banners)                 | Complete                                    |
| Reports (sales, inventory, returns)     | Complete                                    |
| Returns management                      | Complete                                    |
| Settlement tracking                     | Complete                                    |
| Analytics                               | Mostly complete (charts incomplete)         |
| Settings                                | Partial (shipping/payments tabs incomplete) |
| Inventory                               | Partial (warehouses tab incomplete)         |

## Production Readiness & Critical Blockers

### P0 - Must Fix Before Launch

| Blocker                                 | Impact                                     | Status                              | Effort |
| --------------------------------------- | ------------------------------------------ | ----------------------------------- | ------ |
| **Cloudflare KV namespace placeholder** | Rate limiting cannot function              | 🔴 Placeholder ID in wrangler.jsonc | 1h     |
| **Cloudflare Hyperdrive placeholder**   | Database connection pooling not configured | 🔴 Placeholder ID in wrangler.jsonc | 1h     |
| **No Neon PostgreSQL configured**       | No production database                     | ❌ Not configured                   | 2h     |
| **No automated database backups**       | Data loss risk, no recovery capability     | ❌ Not implemented                  | 4h     |
| **Razorpay not configured**             | Payment processing impossible              | ❌ Not configured                   | 2h     |
| **Resend not configured**               | Email sending impossible                   | ❌ Not configured                   | 1h     |
| **Turnstile not configured**            | CAPTCHA verification impossible            | ❌ Not configured                   | 1h     |
| **Sentry not configured**               | Error monitoring not available             | ❌ Not configured                   | 1h     |

**Total P0 Effort**: ~13 hours

### P1 - Should Fix Soon

| Issue                                 | Impact                     | Status             | Effort |
| ------------------------------------- | -------------------------- | ------------------ | ------ |
| **R2 versioning not enabled**         | Media loss risk            | ❌ Not implemented | 1h     |
| **R2 lifecycle rules not configured** | Unbounded storage costs    | ❌ Not implemented | 1h     |
| **No restore procedures documented**  | Cannot recover from backup | ❌ Not documented  | 2h     |

**Total P1 Effort**: ~4 hours

### P2 - Nice to Have (Defer to V2)

- Database-level Row-Level Security (RLS) for multi-tenant isolation
- PII encryption at rest
- CustomerPreferences/NotificationPreferences cascade delete fixes
- Shop/Admin Sentry integration

See detailed remediation plans in `docs/work/09-final-v1-remediation.md`, `docs/work/10-p1-remediation.md`, and `docs/work/11-backup-recovery.md`.

## Known Issues & Technical Debt

### Resolved (P0/P1 Remediations)

- ✅ **Database migration history**: Created `0001_init` and `0002_preserve_historical_records` migrations
- ✅ **Critical cascade deletes**: Fixed `Payment.order`, `Address.user`, `ReturnRequest.order` to use `onDelete: Restrict`
- ✅ **CSRF enforcement**: Double-submit pattern implemented across all API clients
- ✅ **JWT storage**: Now stored in httpOnly cookies (not localStorage)
- ✅ **Sentry integration**: Updated to v8 with correct imports
- ✅ **API architecture**: Removed frontend package dependencies from API

### High

- **Admin shell pages**: Analytics, Settings, CMS, Payments Governance, and Returns Governance are tab structures with placeholder content. No functional UI.
- **Production configuration gaps**: Cloudflare bindings, Neon database, and external services not configured (see P0 blockers above)

### Medium

- **No email queue**: Resend integration has no retry/queue logic. Send failures throw directly.
- **Returns not API-connected**: Customer returns page uses mock data, not the API.
- **No error monitoring**: Sentry configured but not fully integrated across all apps

### Low

- **Supabase variables declared but unused**: `@nabome/config` requires Supabase env vars but auth uses entirely custom JWT. These can be removed in V2.
- **Shipping React peer dep**: `@nabome/shipping` declares React 18 peer dep while all apps use React 19.

## Planned / Not Yet Implemented

- `@nabome/reviews` package (product reviews system)
- `@nabome/loyalty` package (loyalty/rewards program)
- Analytics dashboards (admin + shop) - shell pages exist
- CMS content management - shell page exists
- Admin settings/configuration UI - shell page exists
- Payment governance UI (admin) - shell page exists
- Returns governance UI (admin) - shell page exists
- Warehouse management (shop inventory) - partial implementation
- Email queue/retry logic
- Comprehensive test coverage (currently ~20%)
- Database-level Row-Level Security (RLS)

## Contributing

1. Create a feature branch from `production`
2. Make changes following the architecture guards
3. Run `pnpm check` to ensure quality
4. Commit with conventional commits (`feat(api): add endpoint`)
5. Push and create a pull request

**Commit types**: `feat`, `fix`, `refactor`, `perf`, `test`, `chore`, `docs`, `build`, `ci`, `style`, `revert`

**Scopes**: `api`, `customer`, `admin`, `shop`, `ui`, `design-tokens`, `types`, `utils`, `constants`, `api-contracts`, `validation`, `config`, `auth`, `logging`, `e2e`, `tests`, `docs`, `infra`, `scripts`, `ci`, `root`

## Documentation Index

This README is the primary project documentation. Additional detailed audit reports and work documents are preserved in the `docs/` directory:

- `docs/INTEGRATION_AUDIT_REPORT.md` - Comprehensive integration audit covering consistency, security, architecture, and operational readiness
- `docs/AUTHORIZATION_MATRIX.md` - Detailed RBAC system documentation with role hierarchy, permission format, and access control patterns
- `docs/work/01-foundation.md` - Foundation audit covering runtime compatibility, dependencies, configuration, and environment setup
- `docs/work/02-database.md` - Database audit detailing Prisma schema, model definitions, relationships, and data integrity
- `docs/work/03-security.md` - Security audit covering authentication, authorization, and hardening
- `docs/work/04-customer.md` - Customer application audit with feature status, architecture, and UX
- `docs/work/05-shop.md` - Shop owner dashboard audit with feature implementation status
- `docs/work/06-admin.md` - Admin dashboard audit with feature implementation status
- `docs/work/09-final-v1-remediation.md` - Final V1 remediation plan with critical blockers and implementation phases
- `docs/work/10-p1-remediation.md` - P1 remediation verification and implementation planning
- `docs/work/11-backup-recovery.md` - Comprehensive backup and recovery strategy assessment
- `docs/work/12-staging-validation.md` - Staging deployment validation report
- `docs/work/P1_DATABASE_VALIDATION_REPORT.md` - P1 database cascade delete remediation validation

These documents provide detailed technical analysis and are preserved for reference. They should not be modified except to fix obvious contradictions with the current implementation.

## Document Ownership

- **Primary Documentation**: This README.md
- **Audit Reports**: Preserved in `docs/` directory for historical reference
- **Work Documents**: Detailed remediation plans in `docs/work/` directory
- **Updates**: When making changes to the codebase, update this README to reflect the current state. Audit reports should be preserved as-is for historical context.

## License

Private — All rights reserved
