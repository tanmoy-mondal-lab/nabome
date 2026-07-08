# NABOME — Master Implementation Roadmap

**Date:** 2026-07-07
**Phase:** 12 — Master Implementation Roadmap
**Status:** Complete
**Author:** Principal Software Architect + Engineering Lead

---

## Executive Summary

This document consolidates findings from 13 comprehensive audit reports and provides a structured implementation roadmap to bring NABOME to production-ready status. The platform currently scores **5.3/10 (C+)** across all dimensions, with critical blockers in security (4.2/10), performance (3.8/10), and legal compliance (1.0/10).

**Current State:** NOT READY FOR PRODUCTION
**Target State:** Production-ready in 16 weeks (4 months)
**Total Issues Identified:** 69 items (20 P0, 17 P1, 24 P2, 8 P3)
**Estimated Effort:** 82 person-days across 3.5 FTE
**Estimated Cost:** $175,000 for 16-week remediation

---

## Table of Contents

1. [Audit Reports Summary](#1-audit-reports-summary)
2. [Overall Project Scorecard](#2-overall-project-scorecard)
3. [Prioritized Issue Inventory](#3-prioritized-issue-inventory)
4. [Module Grouping & Dependency Graph](#4-module-grouping--dependency-graph)
5. [Implementation Phases (Sprint 0-15)](#5-implementation-phases-sprint-0-15)
6. [Timeline Roadmap (12 Months)](#6-timeline-roadmap-12-months)
7. [Team Estimation & Risk Matrix](#7-team-estimation--risk-matrix)
8. [Critical Path & Milestones](#8-critical-path--milestones)
9. [Final Verdict](#9-final-verdict)

---

## 1. Audit Reports Summary

### 1.1 Audit Reports Inventory (13 total)

| Phase | Report | Score | Key Findings |
|-------|--------|-------|--------------|
| 1 | PROJECT_INVENTORY.md | — | 64,248 LOC, 351 files, 34 models, 200+ endpoints |
| 2 | ENTERPRISE_ARCHITECTURE_AUDIT.md | 6.8/10 (B-) | String-based dispatch, monolithic handlers, no request ID propagation |
| 3 | FRONTEND_UI_UX_AUDIT.md | 6.8/10 (B-) | Toast accessibility issues, no dark mode, checkout monolithic |
| 4 | BACKEND_API_AUDIT.md | 6.2/10 (B-) | Zero test coverage, no error monitoring, email silent-fail |
| 5 | DATABASE_PRISMA_AUDIT.md | 6.9/10 (B-) | Schema drift, no cart expiration, unbounded queries |
| 6 | SECURITY_PENETRATION_AUDIT.md | 4.2/10 (D) | Secrets in git, CSRF not enforced, JWT in localStorage |
| 7 | PRODUCTION_CLOUDFLARE_PERFORMANCE_SEO_AUDIT.md | 3.8/10 (FAIL) | 13.6s TTFB, no Hyperdrive, no observability |
| 8 | CUSTOMER_SELLER_ADMIN_WORKFLOW_AUDIT.md | 4.6/10 (C-) | Not a marketplace, admin workflow gaps |
| 9 | DESIGN_SYSTEM_COMPONENT_AUDIT.md | 6.8/10 (B-) | Dual-class system, missing primitives, no dark mode |
| 10 | CODE_QUALITY_MAINTAINABILITY_AUDIT.md | 5.8/10 (C+) | 9.7% test coverage, CI/CD no quality gates |
| 11 | EXECUTIVE_LAUNCH_READINESS_REPORT.md | 4.5/10 (D) | NOT READY FOR PRODUCTION, 8-12 weeks needed |
| — | NABOME_COMPLETE_AUDIT_REPORT.md | — | Comprehensive summary of all findings |

### 1.2 Critical Blockers Across All Reports

**Security (CVSS 10.0-7.0):**
- Production secrets committed to `.env` (Supabase service role key, Neon DB password, Cloudinary secret, Razorpay secret, Resend key)
- CSRF verification imported but never called on mutation endpoints
- JWT tokens stored in localStorage (XSS vulnerable)
- No webhook idempotency - Razorpay hooks can double-process payments
- 95% of endpoints use raw `req.json()` without validation
- Rate limiting silently falls open on KV miss
- Widespread type-safety bypasses (92 `as never` + ~308 `any`)

**Performance:**
- 13.6s Time to First Byte (TTFB) on homepage
- No Smart Placement in Cloudflare
- No Hyperdrive binding for database connections
- Unbounded queries in analytics/exports will OOM at scale

**Testing & Quality:**
- Test coverage at 9.7% (34 tests for 351 source files)
- CI/CD has no linting, testing, or security scanning steps
- No automated test coverage for critical paths

**Legal Compliance:**
- No privacy policy page (GDPR, India DPDP Act non-compliance)
- No terms & conditions page
- No cookie policy/consent banner
- No return policy page
- No shipping policy page
- No refund policy page

---

## 2. Overall Project Scorecard

### 2.1 Module Scores

| Module | P0 | P1 | P2 | P3 | Total | Score | Grade |
|--------|----|----|----|----|-------|-------|-------|
| Security & Secrets | 7 | 0 | 0 | 0 | 7 | 2.0/10 | F |
| Performance & Infrastructure | 3 | 0 | 0 | 0 | 3 | 3.8/10 | F |
| Testing & CI/CD | 2 | 0 | 0 | 0 | 2 | 4.0/10 | D |
| Legal Compliance | 6 | 0 | 0 | 0 | 6 | 1.0/10 | F |
| Database Core | 2 | 0 | 5 | 0 | 7 | 6.9/10 | B- |
| Architecture Refactoring | 0 | 4 | 0 | 0 | 4 | 6.8/10 | B- |
| Business Logic | 0 | 6 | 0 | 0 | 6 | 6.0/10 | C+ |
| Admin Operations | 0 | 4 | 0 | 0 | 4 | 5.5/10 | C+ |
| Observability | 0 | 3 | 0 | 0 | 3 | 3.0/10 | F |
| Frontend Core | 0 | 4 | 8 | 0 | 12 | 6.8/10 | B- |
| Code Quality | 0 | 0 | 6 | 0 | 6 | 5.8/10 | C+ |
| Documentation | 0 | 0 | 5 | 0 | 5 | 2.0/10 | F |
| Infrastructure Polish | 0 | 0 | 0 | 4 | 4 | 5.0/10 | C+ |
| Business Features | 0 | 0 | 0 | 6 | 6 | 7.0/10 | B- |
| Code Cleanup | 0 | 0 | 0 | 3 | 3 | 8.0/10 | B+ |
| **Overall** | **20** | **17** | **24** | **8** | **69** | **5.3/10** | **C+** |

### 2.2 Audit Category Scores

| Category | Score | Grade |
|----------|-------|-------|
| Architecture | 6.8/10 | B- |
| Frontend | 6.8/10 | B- |
| Backend API | 6.2/10 | B- |
| Database | 6.9/10 | B- |
| Design System | 6.8/10 | B- |
| Security | 4.2/10 | D |
| Production/Performance | 3.8/10 | FAIL |
| Code Quality | 5.8/10 | C+ |
| Workflows | 4.6/10 | C- |
| Launch Readiness | 4.5/10 | D |

### 2.3 Risk Assessment

| Risk Category | Level | Impact | Likelihood | Mitigation |
|---------------|-------|--------|-------------|------------|
| Security Breach (secrets exposed) | CRITICAL | Catastrophic | High | Sprint 0 |
| Payment Fraud (webhook replay) | CRITICAL | Catastrophic | Medium | Sprint 4 |
| Legal Non-Compliance (GDPR/DPDP) | CRITICAL | Severe | High | Sprint 3 |
| Performance Degradation (TTFB) | HIGH | Severe | High | Sprint 1 |
| Data Loss (no backups) | HIGH | Catastrophic | Low | Sprint 5 |
| Revenue Loss (abandoned carts) | MEDIUM | Moderate | High | Sprint 9 |
| Developer Velocity (monolithic code) | MEDIUM | Moderate | High | Sprint 6-8 |
| Technical Debt (low test coverage) | MEDIUM | Moderate | High | Sprint 2 |
| Scalability Limits (database queries) | MEDIUM | Moderate | Medium | Sprint 12 |
| User Experience (UX friction) | LOW | Minor | Medium | Sprint 11,13 |

### 2.4 Strengths

- Comprehensive database schema (34 models, 15 modules)
- Clean architecture foundation with proper separation of concerns
- Modern tech stack (React 19, Vite 6, Prisma 6, Cloudflare Pages)
- Sophisticated design system with luxury aspirations
- Good security headers foundation (CSP, HSTS, X-Frame-Options)
- Cloudflare edge infrastructure in place
- Strong transaction discipline in database operations

### 2.5 Critical Gaps

- Security vulnerabilities (CVSS 10.0 - secrets in git)
- Performance issues (13.6s TTFB on homepage)
- Zero test coverage (9.7% across 351 source files)
- No error monitoring or observability
- Legal compliance pages completely missing
- CI/CD pipeline lacks quality gates (linting, testing, security scanning)

---

## 3. Prioritized Issue Inventory

### 3.1 P0 - Critical Production Blockers (20 items)

**Security (7 items):**
1. Production secrets committed to `.env` (CVSS 10.0) - Supabase service role key, Neon DB password, Cloudinary secret, Razorpay secret, Resend key exposed
2. CSRF verification imported but never called on mutation endpoints (CVSS 9.0)
3. JWT tokens stored in localStorage (XSS vulnerable, CVSS 8.5)
4. No webhook idempotency - Razorpay hooks can double-process payments (CVSS 8.5)
5. 95% of endpoints use raw `req.json()` without validation (CVSS 8.0)
6. Rate limiting silently falls open on KV miss (CVSS 7.5)
7. Widespread type-safety bypasses (92 `as never` + ~308 `any`) (CVSS 7.0)

**Performance (3 items):**
8. 13.6s TTFB on homepage - No Smart Placement, no Hyperdrive
9. No Hyperdrive binding for database connections (150-500ms cold start penalty)
10. Unbounded queries in analytics/exports will OOM at scale

**Testing & Quality (2 items):**
11. Test coverage at 9.7% (34 tests for 351 source files)
12. CI/CD has no linting, testing, or security scanning steps

**Legal Compliance (6 items):**
13. No privacy policy page (GDPR, India DPDP Act non-compliance)
14. No terms & conditions page
15. No cookie policy/consent banner
16. No return policy page
17. No shipping policy page
18. No refund policy page

**Database (2 items):**
19. Schema drift - CampaignType/SectionType enums out of sync with database
20. No cart expiration mechanism - abandoned carts accumulate unboundedly

### 3.2 P1 - High Priority (17 items)

**Architecture (4 items):**
1. Auth handler 1,194 lines monolithic - should split into modules
2. Payments handler 1,058 lines monolithic - webhook + verification mixed
3. Admin API client 399 lines god object - all API calls in one file
4. String-based action dispatch - no type safety between routes and handlers

**Business Logic (6 items):**
5. No abandoned cart recovery automation - listing exists, no email/SMS recovery flow
6. No stock reservation expiry mechanism - abandoned checkout stock never released
7. Race conditions in stock/coupon handling - no optimistic locking
8. Partial refund amounts wrong - uses `order.total` instead of item calculations
9. Cart/checkout tax calculation mismatch in coupon scenarios
10. No order editing capability after creation

**Admin Operations (4 items):**
11. Support ticket detail page broken - route has no component
12. Marketing admin page non-existent - backend API exists, no frontend UI
13. Returns handler at wrong path (root instead of admin/)
14. Search index is in-memory only, resets on restart

**Observability (3 items):**
15. No error monitoring (Sentry, DataDog)
16. No structured logging or request ID tracking
17. No health check endpoints

**Frontend (4 items):**
18. Checkout page 895 lines monolithic - no step progress indicator
19. Toast system accessibility failures - color-only states, bottom nav overlap
20. No dark mode infrastructure despite defined gradients
21. MobileNav Wishlist icon links to Collections (navigation bug)

### 3.3 P2 - Medium Priority (24 items)

**Frontend/UX (8 items):**
1. Reviews hidden behind "Show More" - low discoverability
2. No order tracking - uses Google search hack
3. Return image upload uses base64 (large payloads)
4. Product listing missing filter UI for size, color, brand, price
5. No infinite scroll (page number pagination only)
6. No saved payment methods or card-on-file
7. No "Notify when back in stock" for out-of-stock items
8. No social share buttons on product pages

**Database (5 items):**
9. No index on `orderItems.productId` and `orderItems.variantId`
10. No composite indexes for common query patterns
11. N+1 patterns in order cancellation
12. Deep nested includes causing massive joins (cart 4 levels, checkout 5 levels)
13. AnalyticsEvent BigInt autoincrement - write contention risk

**Code Quality (6 items):**
14. 225 `: unknown` usages across 43 files
15. Only 21 `useMemo` usages across 8 files (low memoization)
16. No `React.memo` usage - components re-render unnecessarily
17. No barrel exports - deep import paths
18. Magic numbers/strings not extracted to constants
19. No JSDoc comments or function documentation

**Documentation (5 items):**
20. No API documentation (200+ endpoints undocumented)
21. No developer onboarding guide
22. No architecture documentation separate from audits
23. No contribution guide or coding standards
24. No deployment troubleshooting guide

### 3.4 P3 - Low Priority (8 items)

**Frontend (5 items):**
1. FAQ page no search, no category grouping
2. PWA install prompt not configured
3. 404 page lacks brand consistency
4. No empty state for wishlist when not logged in
5. `window.confirm()` for address delete (breaks premium UX)

**Infrastructure (4 items):**
6. No preview deployments for PRs
7. No rollback mechanism
8. No staging environment
9. No feature flags system

**Business Features (6 items):**
10. No loyalty/rewards program infrastructure
11. No referral program infrastructure
12. No gift cards infrastructure
13. No subscription infrastructure
14. Multi-currency not supported (INR only)
15. Multi-language not supported (Bengali font only, no i18n)

**Code Cleanup (3 items):**
16. Unused `prisma.config.ts` file
17. `@dnd-kit/utilities` may be unused
18. Unused imports and commented-out code

---

## 4. Module Grouping & Dependency Graph

### 4.1 Module Definitions

**Module 1: Security & Secrets (7 P0 items)**
- Issues: Secrets in git, CSRF not enforced, JWT in localStorage, webhook idempotency, input validation, rate limiting, type-safety bypasses
- Dependencies: None (foundational)
- Blocks: All production deployment, compliance

**Module 2: Performance & Infrastructure (3 P0 items)**
- Issues: TTFB 13.6s, no Hyperdrive, unbounded queries
- Dependencies: Database (for query optimization)
- Blocks: Production launch, scalability

**Module 3: Testing & CI/CD (2 P0 items)**
- Issues: Test coverage 9.7%, CI/CD no quality gates
- Dependencies: All modules (needs tests for everything)
- Blocks: Safe deployments

**Module 4: Legal Compliance (6 P0 items)**
- Issues: Privacy policy, terms, cookie policy, return/shipping/refund policies
- Dependencies: CMS (for policy pages)
- Blocks: Legal launch in regulated markets

**Module 5: Database Core (2 P0, 5 P2 items)**
- Issues: Schema drift, cart expiration, missing indexes, N+1 queries, deep includes
- Dependencies: None (foundational)
- Blocks: Performance, scalability

**Module 6: Architecture Refactoring (4 P1 items)**
- Issues: Auth handler monolithic, payments handler monolithic, admin API god object, string-based dispatch
- Dependencies: None (internal refactoring)
- Blocks: Maintainability, testability

**Module 7: Business Logic (6 P1 items)**
- Issues: Abandoned cart recovery, stock reservation expiry, race conditions, partial refunds, tax calc mismatch, order editing
- Dependencies: Database, Payments, Notifications
- Blocks: Revenue optimization, customer experience

**Module 8: Admin Operations (4 P1 items)**
- Issues: Support ticket broken, marketing page missing, returns handler path, search index in-memory
- Dependencies: Frontend admin UI, API handlers
- Blocks: Admin productivity

**Module 9: Observability (3 P1 items)**
- Issues: No error monitoring, no logging, no health checks
- Dependencies: All modules (needs instrumentation)
- Blocks: Production debugging, incident response

**Module 10: Frontend Core (4 P1, 8 P2 items)**
- Issues: Checkout monolithic, toast accessibility, dark mode, navigation bug, reviews discoverability, order tracking, filters, infinite scroll
- Dependencies: API handlers, Design system
- Blocks: UX quality, conversion

**Module 11: Code Quality (6 P2 items)**
- Issues: Unknown types, low memoization, no React.memo, no barrel exports, magic strings, no JSDoc
- Dependencies: None (internal quality)
- Blocks: Maintainability

**Module 12: Documentation (5 P2 items)**
- Issues: No API docs, no onboarding guide, no architecture docs, no contribution guide, no troubleshooting guide
- Dependencies: All modules (docs reflect code)
- Blocks: Team scaling, developer onboarding

**Module 13: Infrastructure Polish (4 P3 items)**
- Issues: No preview deployments, no rollback, no staging, no feature flags
- Dependencies: CI/CD
- Blocks: Safe development workflow

**Module 14: Business Features (6 P3 items)**
- Issues: No loyalty, referral, gift cards, subscriptions, multi-currency, multi-language
- Dependencies: Database, Frontend, Payments
- Blocks: Market expansion, customer retention

**Module 15: Code Cleanup (3 P3 items)**
- Issues: Dead config files, unused packages, unused imports
- Dependencies: None
- Blocks: None (cleanup only)

### 4.2 Dependency Graph

```
Security & Secrets (Foundation)
├── Performance & Infrastructure
├── Testing & CI/CD
└── Legal Compliance

Database Core (Foundation)
├── Performance & Infrastructure
├── Business Logic
└── Frontend Core

Architecture Refactoring
├── Business Logic
├── Admin Operations
└── Testing & CI/CD

Observability
├── All modules (instrumentation)

Frontend Core
├── Business Logic
└── Admin Operations

Documentation
└── All modules

Infrastructure Polish
└── Testing & CI/CD

Business Features
├── Database Core
├── Frontend Core
└── Payments (sub-module of Business Logic)
```

---

## 5. Implementation Phases (Sprint 0-15)

### Sprint 0: Emergency Security Remediation (Week 1)

**Goal**: Address CVSS 10.0 and 9.0 security vulnerabilities immediately

**Items:**
- Rotate all production secrets (P0-1)
- Remove secrets from git history (P0-1)
- Enable CSRF verification on all mutation endpoints (P0-2)
- Add fail-closed rate limiting (P0-6)

**Effort**: 5 days
- Backend: 3 days
- DevOps: 2 days

**Deliverable**: Secrets secured, CSRF enforced, rate limiting hardened

**Acceptance Criteria:**
- All production secrets rotated and stored in Cloudflare Pages secrets
- Git history cleaned of sensitive data
- CSRF verification active on all POST/PUT/DELETE endpoints
- Rate limiting fails closed (deny on KV miss)

---

### Sprint 1: Critical Performance Fixes (Week 2)

**Goal**: Fix 13.6s TTFB and database performance

**Items:**
- Enable Smart Placement in Cloudflare (P0-8)
- Add Hyperdrive binding (P0-9)
- Fix schema drift (CampaignType/SectionType enums) (P0-19)
- Add cart expiration mechanism (P0-20)

**Effort**: 5 days
- Backend: 2 days
- DevOps: 3 days

**Deliverable**: TTFB < 2s, database optimized

**Acceptance Criteria:**
- Smart Placement enabled in wrangler.jsonc
- Hyperdrive binding configured and active
- Schema enums synchronized with database
- Cart expiration job running (cleanup carts > 30 days inactive)

---

### Sprint 2: Testing Foundation (Week 3)

**Goal**: Establish test infrastructure and CI/CD quality gates

**Items:**
- Add linting step to CI/CD (P0-12)
- Add testing step to CI/CD (P0-12)
- Add security scanning to CI/CD (P0-12)
- Write critical path tests (checkout, payment, auth) (P0-11)

**Effort**: 5 days
- Backend: 2 days
- Frontend: 1 day
- DevOps: 2 days

**Deliverable**: CI/CD with quality gates, 20% test coverage

**Acceptance Criteria:**
- CI/CD pipeline includes ESLint, TypeScript check
- CI/CD pipeline runs Vitest unit tests
- CI/CD pipeline runs security audit (npm audit)
- Critical path tests cover auth, checkout, payment flows
- Test coverage increased from 9.7% to 20%

---

### Sprint 3: Legal Compliance Pages (Week 4)

**Goal**: Meet GDPR and India DPDP Act requirements

**Items:**
- Create privacy policy page (P0-13)
- Create terms & conditions page (P0-14)
- Create cookie policy + consent banner (P0-15)
- Create return/shipping/refund policy pages (P0-16,17,18)

**Effort**: 5 days
- Backend: 1 day
- Frontend: 3 days
- QA: 1 day

**Deliverable**: All compliance pages live

**Acceptance Criteria:**
- Privacy policy page accessible from footer
- Terms & conditions page accessible from footer
- Cookie consent banner shows on first visit, stores preference
- Return policy page linked from checkout
- Shipping policy page accessible from footer
- Refund policy page linked from order detail

---

### Sprint 4: Payment & Webhook Security (Week 5)

**Goal**: Secure payment processing

**Items:**
- Add webhook idempotency (P0-4)
- Move JWT tokens to httpOnly cookies (P0-3)
- Add Zod validation to all mutation endpoints (P0-5)
- Fix type-safety bypasses (remove `as never`, reduce `any`) (P0-7)

**Effort**: 5 days
- Backend: 3 days
- Frontend: 2 days

**Deliverable**: Payments secure, validation complete

**Acceptance Criteria:**
- Webhook events stored in `webhook_events` table with unique constraint
- Duplicate webhook events skipped with idempotency check
- JWT tokens stored in httpOnly cookies, not localStorage
- All mutation endpoints use Zod schemas
- Type-safety bypasses reduced by 80%

---

### Sprint 5: Observability Foundation (Week 6)

**Goal**: Enable production debugging

**Items:**
- Integrate Sentry for error monitoring (P1-15)
- Add structured logging with request IDs (P1-16)
- Add health check endpoints (P1-17)
- Add database connection monitoring (P2-13)

**Effort**: 5 days
- Backend: 2 days
- DevOps: 3 days

**Deliverable**: Error monitoring live, logging structured

**Acceptance Criteria:**
- Sentry integrated and capturing errors
- All requests have unique request ID
- Request ID propagated through logs
- Health check endpoint at `/api/health`
- Database connection metrics monitored

---

### Sprint 6: Architecture Refactoring - Auth (Week 7)

**Goal**: Split monolithic auth handler

**Items:**
- Split auth.ts into modules (register, login, password, email, sessions, profile) (P1-1)
- Add unit tests for auth modules
- Refactor auth middleware to use new modules

**Effort**: 5 days
- Backend: 4 days
- QA: 1 day

**Deliverable**: Auth handler < 300 lines per module

**Acceptance Criteria:**
- Auth handler split into 6 modules
- Each module < 300 lines
- Unit tests for each auth module
- Auth middleware updated to use new modules

---

### Sprint 7: Architecture Refactoring - Payments (Week 8)

**Goal**: Split monolithic payments handler

**Items:**
- Split payments.ts into modules (creation, webhook, refund) (P1-2)
- Add unit tests for payment modules
- Extract notification logic to utilities

**Effort**: 5 days
- Backend: 4 days
- QA: 1 day

**Deliverable**: Payments handler < 300 lines per module

**Acceptance Criteria:**
- Payments handler split into 3 modules
- Each module < 300 lines
- Unit tests for each payment module
- Notification logic extracted to shared utilities

---

### Sprint 8: Architecture Refactoring - API Client (Week 9)

**Goal**: Split admin API client god object

**Items:**
- Split admin.ts into domain modules (P1-3)
- Implement typed route dispatch (P1-4)
- Add barrel exports for cleaner imports (P2-17)

**Effort**: 5 days
- Backend: 3 days
- Frontend: 1 day
- QA: 1 day

**Deliverable**: API client modularized, type-safe dispatch

**Acceptance Criteria:**
- Admin API client split into domain modules
- Route dispatch uses typed action constants
- Barrel exports added for clean imports
- No string-based action dispatch

---

### Sprint 9: Business Logic - Revenue Recovery (Week 10)

**Goal**: Implement revenue optimization features

**Items:**
- Add abandoned cart recovery automation (P1-5)
- Add stock reservation expiry mechanism (P1-6)
- Fix partial refund calculation (P1-8)
- Fix cart/checkout tax calculation mismatch (P1-9)

**Effort**: 5 days
- Backend: 3 days
- Frontend: 2 days

**Deliverable**: Revenue recovery live, refunds accurate

**Acceptance Criteria:**
- Abandoned cart recovery email automation active
- Stock reservation expires after 30 minutes
- Partial refunds calculate based on returned items
- Tax calculation consistent between cart and checkout

---

### Sprint 10: Admin Operations Fixes (Week 11)

**Goal**: Fix broken admin workflows

**Items:**
- Fix support ticket detail page (P1-11)
- Create marketing admin page UI (P1-12)
- Move returns handler to admin/ path (P1-13)
- Replace in-memory search index with KV (P1-14)

**Effort**: 5 days
- Backend: 2 days
- Frontend: 2 days
- QA: 1 day

**Deliverable**: All admin workflows functional

**Acceptance Criteria:**
- Support ticket detail page renders correctly
- Marketing admin page UI created and functional
- Returns handler moved to admin/ path
- Search index stored in KV, persists across restarts

---

### Sprint 11: Frontend Critical UX (Week 12)

**Goal**: Fix critical UX blockers

**Items:**
- Split CheckoutPage into sub-components (P1-18)
- Add checkout step progress indicator (P1-18)
- Fix toast system accessibility (P1-19)
- Fix MobileNav Wishlist navigation bug (P1-21)

**Effort**: 5 days
- Frontend: 4 days
- QA: 1 day

**Deliverable**: Checkout UX improved, accessibility fixed

**Acceptance Criteria:**
- CheckoutPage split into 5 sub-components
- Step progress indicator shows current checkout step
- Toast system uses icons + text (not color-only)
- MobileNav Wishlist icon links to wishlist page

---

### Sprint 12: Database Optimization (Week 13)

**Goal**: Optimize database performance

**Items:**
- Add missing indexes on orderItems (P2-9)
- Add composite indexes for common queries (P2-10)
- Fix N+1 patterns in order cancellation (P2-11)
- Optimize deep nested includes (P2-12)

**Effort**: 5 days
- Backend: 3 days
- DevOps: 1 day
- QA: 1 day

**Deliverable**: Database queries optimized

**Acceptance Criteria:**
- Indexes added on orderItems.productId and orderItems.variantId
- Composite indexes for common filter patterns
- Order cancellation uses batch updates instead of N+1
- Deep includes replaced with selective queries

---

### Sprint 13: Frontend UX Enhancements (Week 14)

**Goal**: Improve customer experience

**Items:**
- Surface reviews above the fold (P2-1)
- Add real order tracking integration (P2-2)
- Fix return image upload (use file upload instead of base64) (P2-3)
- Add product listing filters (P2-4)

**Effort**: 5 days
- Backend: 1 day
- Frontend: 3 days
- QA: 1 day

**Deliverable**: UX quality improved

**Acceptance Criteria:**
- Reviews visible without "Show More" click
- Order tracking integrated with carrier API
- Return image upload uses file upload
- Product listing has size, color, brand, price filters

---

### Sprint 14: Code Quality & Documentation (Week 15)

**Goal**: Improve maintainability

**Items:**
- Add React.memo to expensive components (P2-16)
- Add useMemo for expensive computations (P2-15)
- Create API documentation (OpenAPI spec) (P2-20)
- Create developer onboarding guide (P2-21)

**Effort**: 5 days
- Backend: 2 days
- Frontend: 1 day
- QA: 2 days

**Deliverable**: Code quality improved, docs created

**Acceptance Criteria:**
- React.memo added to 10+ expensive components
- useMemo added to 5+ expensive computations
- OpenAPI spec generated for all endpoints
- Developer onboarding guide created

---

### Sprint 15: Infrastructure Polish (Week 16)

**Goal**: Enable safe development workflow

**Items:**
- Add preview deployments for PRs (P3-6)
- Add rollback mechanism (P3-7)
- Set up staging environment (P3-8)
- Add feature flags system (P3-9)

**Effort**: 5 days
- DevOps: 5 days

**Deliverable**: Infrastructure production-ready

**Acceptance Criteria:**
- Preview deployments auto-generated for PRs
- Rollback mechanism configured (one-click rollback)
- Staging environment set up with production-like data
- Feature flags system integrated

---

## 6. Timeline Roadmap (12 Months)

### Phase 1: Emergency Remediation (Weeks 1-4)

**Objective**: Resolve critical blockers and achieve legal compliance

- **Week 1**: Sprint 0 - Security & Secrets
- **Week 2**: Sprint 1 - Performance Fixes
- **Week 3**: Sprint 2 - Testing Foundation
- **Week 4**: Sprint 3 - Legal Compliance

**Milestone**: Critical blockers resolved, platform legally compliant

**Deliverables**:
- All production secrets secured
- CSRF enforcement active
- TTFB reduced to < 2s
- CI/CD with quality gates
- All compliance pages live

---

### Phase 2: Production Hardening (Weeks 5-8)

**Objective**: Harden platform for beta launch

- **Week 5**: Sprint 4 - Payment & Webhook Security
- **Week 6**: Sprint 5 - Observability Foundation
- **Week 7**: Sprint 6 - Architecture Refactoring (Auth)
- **Week 8**: Sprint 7 - Architecture Refactoring (Payments)

**Milestone**: Platform production-ready for beta launch

**Deliverables**:
- Payment webhooks secure with idempotency
- JWT tokens in httpOnly cookies
- Error monitoring with Sentry
- Auth handler modularized
- Payments handler modularized

---

### Phase 3: Business Logic & Operations (Weeks 9-12)

**Objective**: Implement revenue optimization and fix admin workflows

- **Week 9**: Sprint 8 - Architecture Refactoring (API Client)
- **Week 10**: Sprint 9 - Business Logic (Revenue Recovery)
- **Week 11**: Sprint 10 - Admin Operations Fixes
- **Week 12**: Sprint 11 - Frontend Critical UX

**Milestone**: Revenue optimization features live, admin workflows functional

**Deliverables**:
- API client modularized
- Abandoned cart recovery automation
- Stock reservation expiry
- All admin workflows functional
- Checkout UX improved

---

### Phase 4: Optimization & Polish (Weeks 13-16)

**Objective**: Optimize performance and improve maintainability

- **Week 13**: Sprint 12 - Database Optimization
- **Week 14**: Sprint 13 - Frontend UX Enhancements
- **Week 15**: Sprint 14 - Code Quality & Documentation
- **Week 16**: Sprint 15 - Infrastructure Polish

**Milestone**: Platform fully hardened, scalable, maintainable

**Deliverables**:
- Database queries optimized
- Frontend UX enhanced
- Code quality improved
- Documentation created
- Infrastructure production-ready

---

### Phase 5: Growth Features (Months 5-6)

**Objective**: Implement customer retention and market expansion features

**Month 5**:
- Implement loyalty/rewards program
- Add referral program infrastructure
- Implement gift cards

**Month 6**:
- Add subscription infrastructure
- Implement multi-currency support
- Add multi-language support (i18n)

**Milestone**: Growth features complete

---

### Phase 6: Advanced Features (Months 7-9)

**Objective**: Implement advanced AI and social commerce features

**Month 7**:
- Implement AI-powered product recommendations
- Add advanced analytics dashboard
- Implement A/B testing framework

**Month 8**:
- Add social commerce features
- Implement live chat support
- Add video shopping experience

**Month 9**:
- Implement marketplace infrastructure (if pivoting to marketplace)
- Add seller portal (if marketplace)
- Implement multi-vendor inventory management

**Milestone**: Advanced features complete

---

### Phase 7: Enterprise Scale (Months 10-12)

**Objective**: Enable enterprise-scale operations

**Month 10**:
- Implement read replica routing
- Add database sharding strategy
- Implement CDN edge caching for API responses

**Month 11**:
- Add event-driven architecture
- Implement message queue (RabbitMQ/Kafka)
- Add distributed tracing (Jaeger/Zipkin)

**Month 12**:
- Implement microservices decomposition
- Add service mesh (Istio/Linkerd)
- Implement chaos engineering testing

**Milestone**: Enterprise scale ready

---

## 7. Team Estimation & Risk Matrix

### 7.1 Team Composition

| Role | FTE | Focus |
|------|-----|-------|
| Senior Full-Stack Engineer (Lead) | 1.0 | Architecture, Backend, Frontend oversight |
| Backend Engineer | 1.0 | API handlers, Database, Business logic |
| Frontend Engineer | 1.0 | UI components, UX, Storefront |
| DevOps Engineer | 0.5 | Cloudflare, CI/CD, Infrastructure |
| QA Engineer | 0.5 | Testing, E2E, Quality assurance |
| **Total** | **3.5** | |

### 7.2 Sprint Effort Estimation

| Sprint | Focus | Backend Days | Frontend Days | DevOps Days | QA Days | Total Days | Duration |
|--------|-------|--------------|---------------|-------------|---------|------------|----------|
| Sprint 0 | Security & Secrets | 3 | 0 | 2 | 0 | 5 | 1 week |
| Sprint 1 | Performance Fixes | 2 | 0 | 3 | 0 | 5 | 1 week |
| Sprint 2 | Testing Foundation | 2 | 1 | 2 | 0 | 5 | 1 week |
| Sprint 3 | Legal Compliance | 1 | 3 | 0 | 1 | 5 | 1 week |
| Sprint 4 | Payment Security | 3 | 2 | 0 | 0 | 5 | 1 week |
| Sprint 5 | Observability | 2 | 0 | 3 | 0 | 5 | 1 week |
| Sprint 6 | Auth Refactoring | 4 | 0 | 0 | 1 | 5 | 1 week |
| Sprint 7 | Payments Refactoring | 4 | 0 | 0 | 1 | 5 | 1 week |
| Sprint 8 | API Client Refactoring | 3 | 1 | 0 | 1 | 5 | 1 week |
| Sprint 9 | Business Logic | 3 | 2 | 0 | 0 | 5 | 1 week |
| Sprint 10 | Admin Operations | 2 | 2 | 0 | 1 | 5 | 1 week |
| Sprint 11 | Frontend Critical UX | 0 | 4 | 0 | 1 | 5 | 1 week |
| Sprint 12 | Database Optimization | 3 | 0 | 1 | 1 | 5 | 1 week |
| Sprint 13 | Frontend UX Enhancements | 1 | 3 | 0 | 1 | 5 | 1 week |
| Sprint 14 | Code Quality & Docs | 2 | 1 | 0 | 2 | 5 | 1 week |
| Sprint 15 | Infrastructure Polish | 0 | 0 | 5 | 0 | 5 | 1 week |
| **Total** | | **37** | **19** | **16** | **10** | **82** | **16 weeks** |

### 7.3 Resource Allocation by Phase

**Phase 1: Emergency Remediation (Weeks 1-4)**
- Backend: 8 days (40%)
- Frontend: 4 days (20%)
- DevOps: 7 days (35%)
- QA: 1 day (5%)
- **Total**: 20 days

**Phase 2: Production Hardening (Weeks 5-8)**
- Backend: 13 days (65%)
- Frontend: 2 days (10%)
- DevOps: 5 days (25%)
- QA: 0 days (0%)
- **Total**: 20 days

**Phase 3: Business Logic & Operations (Weeks 9-12)**
- Backend: 9 days (45%)
- Frontend: 7 days (35%)
- DevOps: 0 days (0%)
- QA: 4 days (20%)
- **Total**: 20 days

**Phase 4: Optimization & Polish (Weeks 13-16)**
- Backend: 6 days (30%)
- Frontend: 8 days (40%)
- DevOps: 6 days (30%)
- QA: 0 days (0%)
- **Total**: 20 days

### 7.4 Cost Estimation

**Assumptions:**
- Average salary: $150,000/year per FTE
- 3.5 FTE team composition
- 16-week remediation timeline

**Calculations:**
- Monthly burn rate: $43,750
- 16-week (4-month) cost: $175,000
- 12-month cost: $525,000

### 7.5 Risk Matrix

| Risk | Probability | Impact | Risk Score | Mitigation Strategy | Owner |
|------|-------------|--------|------------|---------------------|-------|
| Secrets exposed in git | High | Catastrophic | **CRITICAL** | Rotate secrets immediately, git history cleanup, add secret scanning to CI/CD | DevOps |
| CSRF attacks | Medium | Catastrophic | **HIGH** | Enable CSRF verification on all mutations, add automated tests | Backend |
| Payment webhook replay | Medium | Catastrophic | **HIGH** | Add idempotency key, verify HMAC signature, add replay detection | Backend |
| Legal non-compliance (GDPR) | High | Severe | **HIGH** | Create compliance pages, add cookie consent, implement data deletion | Frontend |
| TTFB performance degradation | High | Severe | **HIGH** | Enable Smart Placement, add Hyperdrive, optimize database queries | DevOps |
| Zero test coverage | High | Moderate | **MEDIUM** | Add critical path tests, integrate testing in CI/CD, set coverage targets | QA |
| No error monitoring | High | Moderate | **MEDIUM** | Integrate Sentry, add structured logging, set up alerting | DevOps |
| Monolithic codebase | High | Moderate | **MEDIUM** | Refactor large files, modularize handlers, add barrel exports | Backend |
| Database scalability | Medium | Severe | **MEDIUM** | Add indexes, optimize queries, implement connection pooling, add read replicas | Backend |
| Revenue loss (abandoned carts) | High | Moderate | **MEDIUM** | Implement recovery automation, add stock reservation expiry, optimize checkout | Backend |
| Admin workflow bugs | Medium | Moderate | **MEDIUM** | Fix broken pages, add missing UI, improve error handling | Frontend |
| UX friction points | Medium | Minor | **LOW** | Improve checkout flow, add progress indicators, fix accessibility | Frontend |
| Technical debt accumulation | High | Moderate | **MEDIUM** | Pay down debt in each sprint, add code quality gates, refactor incrementally | All |
| Developer onboarding | Medium | Minor | **LOW** | Create documentation, add onboarding guide, implement code standards | Lead |
| Infrastructure complexity | Low | Minor | **LOW** | Add staging environment, implement feature flags, improve deployment process | DevOps |

### 7.6 Timeline Risk Factors

- **Optimistic**: 12 weeks (if 3.5 FTE fully dedicated, no blockers)
- **Realistic**: 16 weeks (as planned)
- **Pessimistic**: 20 weeks (if unexpected issues, team context switching)

### 7.7 Recommended Team Adjustments

- Consider adding a dedicated Security Engineer for Sprint 0-4 (1 month contract)
- Consider adding a dedicated DevOps Engineer for Sprint 1, 5, 12, 15 (4 weeks total)
- QA should be full-time from Sprint 9 onwards for E2E testing

---

## 8. Critical Path & Milestones

### 8.1 Critical Path Dependencies

1. **Sprint 0 (Security)** → Sprint 1 (Performance) → Sprint 2 (Testing) → Sprint 3 (Legal) → Sprint 4 (Payments)
   - Security must be fixed before any production deployment
   - Performance fixes depend on database schema being stable
   - Testing foundation required for all subsequent sprints
   - Legal compliance required for regulated market launch
   - Payment security depends on CSRF and validation being in place

2. **Sprint 5 (Observability)** → All subsequent sprints
   - Error monitoring and logging required for production debugging
   - All subsequent features need instrumentation

3. **Sprint 6-8 (Architecture)** → Sprint 9-10 (Business Logic) → Sprint 11 (Frontend)
   - Architecture refactoring enables business logic implementation
   - Business logic depends on modular architecture
   - Frontend depends on stable API structure

4. **Sprint 12 (Database)** → Sprint 13 (Frontend UX) → Sprint 14 (Code Quality) → Sprint 15 (Infrastructure)
   - Database optimization required for frontend performance
   - Frontend UX depends on database performance
   - Code quality improvements depend on stable codebase
   - Infrastructure polish is final step before production

### 8.2 Key Milestones

| Milestone | Week | Description | Success Criteria |
|-----------|------|-------------|------------------|
| M1: Security Hardened | 1 | All CVSS 10.0 vulnerabilities resolved | Secrets rotated, CSRF enforced, rate limiting hardened |
| M2: Performance Fixed | 2 | TTFB reduced to < 2s | Smart Placement enabled, Hyperdrive active |
| M3: Testing Foundation | 3 | CI/CD with quality gates, 20% test coverage | Linting, testing, security scanning in CI/CD |
| M4: Legal Compliance | 4 | All compliance pages live | Privacy, terms, cookies, return, shipping, refund policies |
| M5: Payments Secure | 5 | Payment webhooks secure | Idempotency, httpOnly cookies, validation complete |
| M6: Observability Live | 6 | Error monitoring and logging active | Sentry integrated, structured logging |
| M7: Architecture Refactored | 8 | Monolithic handlers split | Auth, payments, API client modularized |
| M8: Revenue Recovery | 10 | Revenue optimization features live | Abandoned cart recovery, stock reservation expiry |
| M9: Admin Workflows Fixed | 11 | All admin workflows functional | Support, marketing, returns, search index fixed |
| M10: Frontend UX Improved | 12 | Critical UX blockers resolved | Checkout, toast, navigation fixed |
| M11: Database Optimized | 13 | Database queries optimized | Indexes added, N+1 patterns fixed |
| M12: Code Quality Improved | 15 | Code quality and documentation improved | React.memo, useMemo, docs created |
| M13: Infrastructure Production-Ready | 16 | Infrastructure hardened | Preview deployments, rollback, staging, feature flags |
| M14: Beta Launch Ready | 8 | Platform ready for beta launch | All P0 items resolved |
| M15: Production Launch Ready | 12 | Platform ready for full production | All P0+P1 items resolved |
| M16: Enterprise Scale Ready | 52 | Platform ready for enterprise scale | Microservices, event-driven architecture |

---

## 9. Final Verdict

### 9.1 Production Readiness Assessment

**Current Status: NOT READY FOR PRODUCTION**

**Overall Score: 5.3/10 (C+)**

**Critical Blockers:**
- 20 P0 items must be resolved before production launch
- Security vulnerabilities (CVSS 10.0) present immediate risk
- Performance issues (13.6s TTFB) will cause user abandonment
- Legal non-compliance prevents regulated market launch
- Zero test coverage makes production deployments unsafe

### 9.2 Recommended Action Plan

**Immediate Actions (Week 1):**
1. Rotate all production secrets immediately
2. Remove secrets from git history
3. Enable CSRF verification on all mutation endpoints
4. Add fail-closed rate limiting

**Short-Term Actions (Weeks 2-4):**
1. Fix TTFB performance (Smart Placement, Hyperdrive)
2. Establish testing foundation (CI/CD quality gates)
3. Create all legal compliance pages

**Medium-Term Actions (Weeks 5-12):**
1. Secure payment processing (webhook idempotency, httpOnly cookies)
2. Add observability (Sentry, structured logging)
3. Refactor monolithic handlers (auth, payments, API client)
4. Implement revenue recovery features
5. Fix admin workflows
6. Improve frontend UX

**Long-Term Actions (Weeks 13-16):**
1. Optimize database performance
2. Enhance frontend UX
3. Improve code quality and documentation
4. Polish infrastructure (preview deployments, rollback, staging)

### 9.3 Timeline Recommendation

**Minimum Safe Launch: 12 weeks**
- Resolves all P0 items
- Platform ready for beta launch
- Recommended for limited user testing

**Recommended Production Launch: 16 weeks**
- Resolves all P0+P1 items
- Platform fully hardened
- Recommended for full production launch

**Enterprise Scale: 52 weeks**
- Resolves all P0+P1+P2 items
- Platform optimized for scale
- Recommended for enterprise operations

### 9.4 Resource Recommendation

**Minimum Team: 2.5 FTE**
- 1 Senior Full-Stack Engineer
- 1 Backend Engineer
- 0.5 DevOps Engineer
- Timeline: 20 weeks (pessimistic)

**Recommended Team: 3.5 FTE**
- 1 Senior Full-Stack Engineer (Lead)
- 1 Backend Engineer
- 1 Frontend Engineer
- 0.5 DevOps Engineer
- 0.5 QA Engineer
- Timeline: 16 weeks (realistic)

**Optimal Team: 5 FTE**
- 1 Senior Full-Stack Engineer (Lead)
- 1 Backend Engineer
- 1 Frontend Engineer
- 1 DevOps Engineer
- 1 QA Engineer
- Timeline: 12 weeks (optimistic)

### 9.5 Risk Mitigation

**High-Risk Items:**
- Security vulnerabilities: Address in Sprint 0
- Legal compliance: Address in Sprint 3
- Performance issues: Address in Sprint 1
- Payment security: Address in Sprint 4

**Medium-Risk Items:**
- Zero test coverage: Address in Sprint 2
- No error monitoring: Address in Sprint 5
- Monolithic codebase: Address in Sprints 6-8
- Revenue loss: Address in Sprint 9

**Low-Risk Items:**
- UX friction: Address in Sprints 11, 13
- Technical debt: Address incrementally across all sprints
- Developer onboarding: Address in Sprint 14

### 9.6 Conclusion

NABOME is a well-architected platform with a strong foundation, but it requires significant remediation before production launch. The critical blockers (security, performance, legal compliance) must be addressed immediately. With a dedicated team of 3.5 FTE working for 16 weeks, the platform can be brought to production-ready status.

**Recommendation:** Proceed with the 16-week implementation roadmap outlined in this document. Prioritize P0 items in the first 4 weeks, then systematically address P1 and P2 items. P3 items can be deferred to post-launch.

**Success Metrics:**
- All P0 items resolved by Week 4
- All P1 items resolved by Week 12
- Test coverage increased to 60% by Week 16
- TTFB reduced to < 2s by Week 2
- Security score increased to 8.0/10 by Week 4
- Production readiness score increased to 8.5/10 by Week 16

---

**Document Version:** 1.0
**Last Updated:** 2026-07-07
**Next Review:** 2026-07-21 (after Sprint 0 completion)
