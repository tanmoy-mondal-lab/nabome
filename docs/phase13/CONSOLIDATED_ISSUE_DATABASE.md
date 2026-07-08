# Consolidated Issue Database
**Project:** Nabome  
**Phase:** 13 - Implementation Planning  
**Date:** 2026-07-07  
**Total Issues:** 69 (20 P0, 17 P1, 24 P2, 8 P3)

---

## P0 - Critical Production Blockers (20 items)

### Security & Secrets (7 items)

| ID | Issue | CVSS | Component | Source Report | Status |
|----|-------|------|-----------|---------------|--------|
| NAB-P0-001 | Production secrets committed to `.env` | 10.0 | Security | Security Audit | Pending |
| NAB-P0-002 | CSRF verification imported but never called on mutation endpoints | 9.0 | API Security | Security Audit | Pending |
| NAB-P0-003 | JWT tokens stored in localStorage (XSS vulnerable) | 8.5 | Auth Security | Security Audit | Pending |
| NAB-P0-004 | No webhook idempotency - Razorpay hooks can double-process payments | 8.5 | Payment Security | Security Audit | Pending |
| NAB-P0-005 | 95% of endpoints use raw `req.json()` without validation | 8.0 | API Security | Security Audit | Pending |
| NAB-P0-006 | Rate limiting silently falls open on KV miss | 7.5 | API Security | Security Audit | Pending |
| NAB-P0-007 | Widespread type-safety bypasses (92 `as never` + ~308 `any`) | 7.0 | Code Quality | Security Audit | Pending |

### Performance & Infrastructure (3 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P0-008 | 13.6s TTFB on homepage - No Smart Placement, no Hyperdrive | Critical | Performance | Production Audit | Pending |
| NAB-P0-009 | No Hyperdrive binding for database connections (150-500ms cold start penalty) | High | Performance | Production Audit | Pending |
| NAB-P0-010 | Unbounded queries in analytics/exports will OOM at scale | Critical | Performance | Database Audit | Pending |

### Testing & Quality (2 items)

| ID | Issue | Current State | Component | Source Report | Status |
|----|-------|---------------|-----------|---------------|--------|
| NAB-P0-011 | Test coverage at 9.7% (34 tests for 351 source files) | 9.7% | Testing | Code Quality Audit | Pending |
| NAB-P0-012 | CI/CD has no linting, testing, or security scanning steps | None | CI/CD | Code Quality Audit | Pending |

### Legal Compliance (6 items)

| ID | Issue | Compliance Risk | Component | Source Report | Status |
|----|-------|-----------------|-----------|---------------|--------|
| NAB-P0-013 | No privacy policy page (GDPR, India DPDP Act non-compliance) | GDPR/DPDP | Legal | Launch Readiness | Pending |
| NAB-P0-014 | No terms & conditions page | Legal | Legal | Launch Readiness | Pending |
| NAB-P0-015 | No cookie policy/consent banner | GDPR | Legal | Launch Readiness | Pending |
| NAB-P0-016 | No return policy page | Legal | Legal | Launch Readiness | Pending |
| NAB-P0-017 | No shipping policy page | Legal | Legal | Launch Readiness | Pending |
| NAB-P0-018 | No refund policy page | Legal | Legal | Launch Readiness | Pending |

### Database Core (2 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P0-019 | Schema drift - CampaignType/SectionType enums out of sync with database | Data Integrity | Database | Database Audit | Pending |
| NAB-P0-020 | No cart expiration mechanism - abandoned carts accumulate unboundedly | Storage/Performance | Database | Database Audit | Pending |

---

## P1 - High Priority (17 items)

### Architecture Refactoring (4 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P1-001 | Auth handler 1,194 lines monolithic - should split into modules | Maintainability | Backend | Backend API Audit | Pending |
| NAB-P1-002 | Payments handler 1,058 lines monolithic - webhook + verification mixed | Maintainability | Backend | Backend API Audit | Pending |
| NAB-P1-003 | Admin API client 399 lines god object - all API calls in one file | Maintainability | Backend | Backend API Audit | Pending |
| NAB-P1-004 | String-based action dispatch - no type safety between routes and handlers | Type Safety | Backend | Architecture Audit | Pending |

### Business Logic (6 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P1-005 | No abandoned cart recovery automation - listing exists, no email/MMS recovery flow | Revenue | Business Logic | Workflow Audit | Pending |
| NAB-P1-006 | No stock reservation expiry mechanism - abandoned checkout stock never released | Inventory | Business Logic | Backend API Audit | Pending |
| NAB-P1-007 | Race conditions in stock/coupon handling - no optimistic locking | Data Integrity | Business Logic | Backend API Audit | Pending |
| NAB-P1-008 | Partial refund amounts wrong - uses `order.total` instead of item calculations | Revenue | Business Logic | Backend API Audit | Pending |
| NAB-P1-009 | Cart/checkout tax calculation mismatch in coupon scenarios | Revenue | Business Logic | Backend API Audit | Pending |
| NAB-P1-010 | No order editing capability after creation | UX | Business Logic | Workflow Audit | Pending |

### Admin Operations (4 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P1-011 | Support ticket detail page broken - route has no component | Admin UX | Frontend | Workflow Audit | Pending |
| NAB-P1-012 | Marketing admin page non-existent - backend API exists, no frontend UI | Admin UX | Frontend | Workflow Audit | Pending |
| NAB-P1-013 | Returns handler at wrong path (root instead of admin/) | API Routing | Backend | Workflow Audit | Pending |
| NAB-P1-014 | Search index is in-memory only, resets on restart | Data Loss | Backend | Backend API Audit | Pending |

### Observability (3 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P1-015 | No error monitoring (Sentry, DataDog) | Debugging | Infrastructure | Backend API Audit | Pending |
| NAB-P1-016 | No structured logging or request ID tracking | Debugging | Infrastructure | Backend API Audit | Pending |
| NAB-P1-017 | No health check endpoints | Monitoring | Infrastructure | Backend API Audit | Pending |

### Frontend Core (4 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P1-018 | Checkout page 895 lines monolithic - no step progress indicator | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P1-019 | Toast system accessibility failures - color-only states, bottom nav overlap | Accessibility | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P1-020 | No dark mode infrastructure despite defined gradients | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P1-021 | MobileNav Wishlist icon links to Collections (navigation bug) | UX | Frontend | Frontend UI/UX Audit | Pending |

---

## P2 - Medium Priority (24 items)

### Frontend/UX (8 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P2-001 | Reviews hidden behind "Show More" - low discoverability | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P2-002 | No order tracking - uses Google search hack | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P2-003 | Return image upload uses base64 (large payloads) | Performance | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P2-004 | Product listing missing filter UI for size, color, brand, price | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P2-005 | No infinite scroll (page number pagination only) | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P2-006 | No saved payment methods or card-on-file | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P2-007 | No "Notify when back in stock" for out-of-stock items | Revenue | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P2-008 | No social share buttons on product pages | Marketing | Frontend | Frontend UI/UX Audit | Pending |

### Database (5 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P2-009 | No index on `orderItems.productId` and `orderItems.variantId` | Performance | Database | Database Audit | Pending |
| NAB-P2-010 | No composite indexes for common query patterns | Performance | Database | Database Audit | Pending |
| NAB-P2-011 | N+1 patterns in order cancellation | Performance | Database | Database Audit | Pending |
| NAB-P2-012 | Deep nested includes causing massive joins (cart 4 levels, checkout 5 levels) | Performance | Database | Database Audit | Pending |
| NAB-P2-013 | AnalyticsEvent BigInt autoincrement - write contention risk | Performance | Database | Database Audit | Pending |

### Code Quality (6 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P2-014 | 225 `: unknown` usages across 43 files | Type Safety | Code Quality | Code Quality Audit | Pending |
| NAB-P2-015 | Only 21 `useMemo` usages across 8 files (low memoization) | Performance | Code Quality | Code Quality Audit | Pending |
| NAB-P2-016 | No `React.memo` usage - components re-render unnecessarily | Performance | Code Quality | Code Quality Audit | Pending |
| NAB-P2-017 | No barrel exports - deep import paths | Maintainability | Code Quality | Code Quality Audit | Pending |
| NAB-P2-018 | Magic numbers/strings not extracted to constants | Maintainability | Code Quality | Code Quality Audit | Pending |
| NAB-P2-019 | No JSDoc comments or function documentation | Maintainability | Code Quality | Code Quality Audit | Pending |

### Documentation (5 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P2-020 | No API documentation (200+ endpoints undocumented) | Developer Experience | Documentation | Code Quality Audit | Pending |
| NAB-P2-021 | No developer onboarding guide | Developer Experience | Documentation | Code Quality Audit | Pending |
| NAB-P2-022 | No architecture documentation separate from audits | Developer Experience | Documentation | Code Quality Audit | Pending |
| NAB-P2-023 | No contribution guide or coding standards | Developer Experience | Documentation | Code Quality Audit | Pending |
| NAB-P2-024 | No deployment troubleshooting guide | Operations | Documentation | Code Quality Audit | Pending |

---

## P3 - Low Priority (8 items)

### Frontend (5 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P3-001 | FAQ page no search, no category grouping | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P3-002 | PWA install prompt not configured | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P3-003 | 404 page lacks brand consistency | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P3-004 | No empty state for wishlist when not logged in | UX | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P3-005 | `window.confirm()` for address delete (breaks premium UX) | UX | Frontend | Frontend UI/UX Audit | Pending |

### Infrastructure Polish (4 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P3-006 | No preview deployments for PRs | Developer Experience | Infrastructure | Code Quality Audit | Pending |
| NAB-P3-007 | No rollback mechanism | Operations | Infrastructure | Code Quality Audit | Pending |
| NAB-P3-008 | No staging environment | Operations | Infrastructure | Code Quality Audit | Pending |
| NAB-P3-009 | No feature flags system | Developer Experience | Infrastructure | Code Quality Audit | Pending |

### Business Features (6 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P3-010 | No loyalty/rewards program infrastructure | Revenue | Business Features | Launch Readiness | Pending |
| NAB-P3-011 | No referral program infrastructure | Revenue | Business Features | Launch Readiness | Pending |
| NAB-P3-012 | No gift cards infrastructure | Revenue | Business Features | Launch Readiness | Pending |
| NAB-P3-013 | No subscription infrastructure | Revenue | Business Features | Launch Readiness | Pending |
| NAB-P3-014 | Multi-currency not supported (INR only) | Market Expansion | Business Features | Launch Readiness | Pending |
| NAB-P3-015 | Multi-language not supported (Bengali font only, no i18n) | Market Expansion | Business Features | Launch Readiness | Pending |

### Code Cleanup (3 items)

| ID | Issue | Impact | Component | Source Report | Status |
|----|-------|--------|-----------|---------------|--------|
| NAB-P3-016 | Unused `prisma.config.ts` file | Cleanup | Code Quality | Code Quality Audit | Pending |
| NAB-P3-017 | `@dnd-kit/utilities` may be unused | Cleanup | Code Quality | Code Quality Audit | Pending |
| NAB-P3-018 | Unused imports and commented-out code | Cleanup | Code Quality | Code Quality Audit | Pending |

---

## Summary Statistics

| Priority | Count | Categories |
|----------|-------|------------|
| P0 | 20 | Security (7), Performance (3), Testing (2), Legal (6), Database (2) |
| P1 | 17 | Architecture (4), Business Logic (6), Admin (4), Observability (3), Frontend (4) |
| P2 | 24 | Frontend/UX (8), Database (5), Code Quality (6), Documentation (5) |
| P3 | 18 | Frontend (5), Infrastructure (4), Business Features (6), Cleanup (3) |
| **Total** | **69** | |

---

## Module Mapping

| Module | P0 | P1 | P2 | P3 | Total |
|--------|----|----|----|----|-------|
| Security & Secrets | 7 | 0 | 0 | 0 | 7 |
| Performance & Infrastructure | 3 | 0 | 0 | 4 | 7 |
| Testing & CI/CD | 2 | 0 | 0 | 0 | 2 |
| Legal Compliance | 6 | 0 | 0 | 0 | 6 |
| Database Core | 2 | 0 | 5 | 0 | 7 |
| Architecture Refactoring | 0 | 4 | 0 | 0 | 4 |
| Business Logic | 0 | 6 | 0 | 6 | 12 |
| Admin Operations | 0 | 4 | 0 | 0 | 4 |
| Observability | 0 | 3 | 0 | 0 | 3 |
| Frontend Core | 0 | 4 | 8 | 5 | 17 |
| Code Quality | 0 | 0 | 6 | 3 | 9 |
| Documentation | 0 | 0 | 5 | 0 | 5 |
| Business Features | 0 | 0 | 0 | 6 | 6 |
| Code Cleanup | 0 | 0 | 0 | 3 | 3 |
