# P2 Medium Priority Issues Fix Plan
**Phase 13: Audit Consolidation & Fix Planning**

## Overview
This plan addresses 32 medium priority issues (P2) that enhance system performance, developer experience, and feature completeness. These issues span frontend/UX, database, code quality, documentation, and monitoring.

## Priority Classification
- **Frontend/UX**: 8 issues
- **Database**: 5 issues
- **Code Quality**: 6 issues
- **Documentation**: 5 issues
- **Monitoring**: 3 issues
- **Backend/API**: 5 issues

---

## FRONTEND/UX ISSUES (8)

### NAB-P2-001: Reviews Hidden Behind "Show More" - Low Discoverability
**Module**: Frontend/Products  
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Implementation Steps**:
1. Analyze current review display logic
2. Increase default visible review count (from 3 to 6)
3. Add "Load More" button with better UX
4. Implement infinite scroll for reviews
5. Add review summary (average rating, distribution)
6. Test review discoverability

**Files to Modify**:
- `src/storefront/components/Reviews.tsx`
- `src/storefront/pages/ProductDetailPage.tsx`

**Validation**:
- Test review visibility
- Verify "Load More" functionality
- Check review summary accuracy

---

### NAB-P2-002: No Real Order Tracking Integration
**Module**: Frontend/Orders  
**Estimated Effort**: 12 hours  
**Dependencies**: NAB-P0-028

**Implementation Steps**:
1. Integrate carrier tracking API (e.g., Shiprocket, Delhivery)
2. Implement tracking endpoint
3. Create tracking timeline UI
4. Add tracking notifications
5. Implement tracking history
6. Test tracking integration

**Files to Modify**:
- `api/_handlers/orders.ts` (tracking endpoint)
- `src/storefront/pages/OrderDetailPage.tsx`
- `prisma/schema.prisma` (tracking models)

**Validation**:
- Test tracking API integration
- Verify timeline accuracy
- Check notifications

---

### NAB-P2-003: Return Image Upload Uses Base64 (Large Payloads)
**Module**: Frontend/Returns  
**Estimated Effort**: 6 hours  
**Dependencies**: NAB-P0-023

**Implementation Steps**:
1. Replace base64 with file upload
2. Implement multipart form data
3. Add image compression before upload
4. Implement upload progress indicator
5. Add image preview
6. Test file upload

**Files to Modify**:
- `src/storefront/pages/ReturnRequestPage.tsx`
- `api/_handlers/returns.ts`

**Validation**:
- Test file upload
- Verify payload size reduction
- Check upload progress

---

### NAB-P2-004: Product Listing Missing Filter UI
**Module**: Frontend/Products  
**Estimated Effort**: 12 hours  
**Dependencies**: NAB-P1-007

**Implementation Steps**:
1. Design filter UI (sidebar or modal)
2. Implement size filter
3. Implement color filter
4. Implement brand filter
5. Implement price range filter
6. Add filter state management
7. Test filters

**Files to Modify**:
- `src/storefront/pages/ProductListingPage.tsx`
- `src/storefront/components/` (filter components)

**Validation**:
- Test all filters
- Verify filter combinations
- Check filter persistence

---

### NAB-P2-005: No Infinite Scroll (Page Number Pagination Only)
**Module**: Frontend/Pagination  
**Estimated Effort**: 8 hours  
**Dependencies**: NAB-P1-006

**Implementation Steps**:
1. Implement intersection observer
2. Add infinite scroll to product listing
3. Add loading indicator
4. Implement scroll position restoration
5. Test infinite scroll

**Files to Modify**:
- `src/storefront/pages/ProductListingPage.tsx`
- `src/storefront/components/` (infinite scroll component)

**Validation**:
- Test infinite scroll
- Verify loading states
- Check scroll restoration

---

### NAB-P2-006: No Saved Payment Methods or Card-on-File
**Module**: Frontend/Payments  
**Estimated Effort**: 16 hours  
**Dependencies**: NAB-P0-022

**Implementation Steps**:
1. Design saved payment methods UI
2. Implement payment method storage (PCI compliant)
3. Add Razorpay tokenization
4. Implement payment method selection
5. Add payment method deletion
6. Test saved payment methods

**Files to Modify**:
- `src/storefront/pages/CheckoutPage.tsx`
- `api/_handlers/payments.ts`
- `prisma/schema.prisma` (payment method models)

**Validation**:
- Test payment method storage
- Verify tokenization
- Check PCI compliance

---

### NAB-P2-007: No "Notify When Back in Stock" for Out-of-Stock Items
**Module**: Frontend/Products  
**Estimated Effort**: 12 hours  
**Dependencies**: NAB-P0-021

**Implementation Steps**:
1. Design notification signup UI
2. Implement stock notification endpoint
3. Add email notification on restock
4. Implement notification queue
5. Add notification preferences
6. Test notifications

**Files to Modify**:
- `src/storefront/components/ProductCard.tsx`
- `src/storefront/pages/ProductDetailPage.tsx`
- `api/_handlers/products.ts` (notification endpoint)

**Validation**:
- Test notification signup
- Verify email delivery
- Check notification queue

---

### NAB-P2-008: No Social Share Buttons on Product Pages
**Module**: Frontend/Social  
**Estimated Effort**: 6 hours  
**Dependencies**: NAB-P1-053

**Implementation Steps**:
1. Design social share component
2. Implement share buttons (Facebook, Twitter, WhatsApp, Pinterest)
3. Add share count display
4. Implement share tracking
5. Test social sharing

**Files to Modify**:
- `src/storefront/components/` (social share component)
- `src/storefront/pages/ProductDetailPage.tsx`

**Validation**:
- Test all share buttons
- Verify share counts
- Check share tracking

---

## DATABASE ISSUES (5)

### NAB-P2-009: No Index on orderItems.productId and orderItems.variantId
**Module**: Database/Schema  
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify missing indexes
2. Add index on orderItems.productId
3. Add index on orderItems.variantId
4. Create migration
5. Test migration on staging
6. Run migration on production

**Files to Modify**:
- `prisma/schema.prisma`
- Create migration

**Validation**:
- Test query performance
- Verify index usage
- Check migration

---

### NAB-P2-010: No Composite Indexes for Common Query Patterns
**Module**: Database/Schema  
**Estimated Effort**: 6 hours  
**Dependencies**: NAB-P2-009

**Implementation Steps**:
1. Analyze query patterns
2. Identify composite index opportunities
3. Add composite indexes
4. Create migration
5. Test migration
6. Verify performance improvement

**Files to Modify**:
- `prisma/schema.prisma`
- Create migration

**Validation**:
- Test query performance
- Verify composite index usage
- Check migration

---

### NAB-P2-011: N+1 Patterns in Order Cancellation
**Module**: Database/Queries  
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify N+1 patterns in order cancellation
2. Implement batch updates
3. Use Prisma include/select optimization
4. Test cancellation performance
5. Verify data integrity

**Files to Modify**:
- `api/_handlers/orders.ts`
- `api/_handlers/refunds.ts`

**Validation**:
- Test cancellation performance
- Verify data integrity
- Check query count

---

### NAB-P2-012: Deep Nested Includes Causing Massive Joins
**Module**: Database/Queries  
**Estimated Effort**: 10 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify deep nested includes (cart 4 levels, checkout 5 levels)
2. Refactor to selective queries
3. Implement query batching
4. Add query result caching
5. Test performance

**Files to Modify**:
- `api/_handlers/cart.ts`
- `api/_handlers/checkout.ts`
- `api/_lib/` (query utilities)

**Validation**:
- Test query performance
- Verify data accuracy
- Check caching

---

### NAB-P2-013: AnalyticsEvent BigInt Autoincrement - Write Contention Risk
**Module**: Database/Schema  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Analyze AnalyticsEvent id field
2. Replace BigInt autoincrement with UUID
3. Create migration
4. Test migration
5. Update analytics queries

**Files to Modify**:
- `prisma/schema.prisma`
- Create migration
- Analytics query code

**Validation**:
- Test migration
- Verify analytics functionality
- Check write performance

---

## CODE QUALITY ISSUES (6)

### NAB-P2-014: 225 `: unknown` Usages Across 43 Files
**Module**: Code Quality/TypeScript  
**Estimated Effort**: 12 hours  
**Dependencies**: None

**Implementation Steps**:
1. Find all `: unknown` usages
2. Replace with proper types
3. Add type guards where needed
4. Update type definitions
5. Test type safety

**Files to Modify**:
- 43 files with `: unknown` usages

**Validation**:
- Verify type safety
- Check TypeScript compilation
- Test functionality

---

### NAB-P2-015: Only 21 `useMemo` Usages Across 8 Files (Low Memoization)
**Module**: Code Quality/React  
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify expensive computations
2. Add useMemo where appropriate
3. Add dependency arrays
4. Test performance

**Files to Modify**:
- Components with expensive computations

**Validation**:
- Test performance
- Verify memoization
- Check re-renders

---

### NAB-P2-016: No `React.memo` Usage - Components Re-Render Unnecessarily
**Module**: Code Quality/React  
**Estimated Effort**: 10 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify expensive components
2. Add React.memo
3. Add custom comparison functions
4. Test performance

**Files to Modify**:
- Expensive components

**Validation**:
- Test performance
- Verify re-render reduction
- Check functionality

---

### NAB-P2-017: No Barrel Exports - Deep Import Paths
**Module**: Code Quality/Imports  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify deep import paths
2. Create barrel exports (index.ts files)
3. Update imports
4. Test imports

**Files to Modify**:
- Create index.ts files
- Update imports across codebase

**Validation**:
- Test imports
- Verify no circular dependencies
- Check build

---

### NAB-P2-018: Magic Numbers/Strings Not Extracted to Constants
**Module**: Code Quality/Maintainability  
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify magic numbers/strings
2. Extract to constants
3. Create constants files
4. Update references
5. Test

**Files to Modify**:
- Create constants files
- Update references

**Validation**:
- Test functionality
- Verify constants usage
- Check maintainability

---

### NAB-P2-019: No JSDoc Comments or Function Documentation
**Module**: Code Quality/Documentation  
**Estimated Effort**: 16 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify undocumented functions
2. Add JSDoc comments
3. Document parameters and return types
4. Add examples
5. Generate API documentation

**Files to Modify**:
- All API handlers
- Utility functions

**Validation**:
- Verify JSDoc completeness
- Test documentation generation
- Check examples

---

## DOCUMENTATION ISSUES (5)

### NAB-P2-020: No API Documentation (200+ Endpoints Undocumented)
**Module**: Documentation/API  
**Estimated Effort**: 20 hours  
**Dependencies**: NAB-P1-002

**Implementation Steps**:
1. Install OpenAPI/Swagger tools
2. Document all endpoints
3. Add request/response schemas
4. Add authentication documentation
5. Generate interactive docs
6. Host documentation

**Files to Modify**:
- Create OpenAPI spec
- API documentation

**Validation**:
- Verify all endpoints documented
- Test interactive docs
- Check schema accuracy

---

### NAB-P2-021: No Developer Onboarding Guide
**Module**: Documentation/Onboarding  
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Implementation Steps**:
1. Design onboarding guide structure
2. Document setup steps
3. Add architecture overview
4. Add development workflow
5. Add troubleshooting section
6. Test guide

**Files to Modify**:
- Create ONBOARDING.md

**Validation**:
- Test onboarding with new developer
- Verify completeness
- Check clarity

---

### NAB-P2-022: No Architecture Documentation Separate from Audits
**Module**: Documentation/Architecture  
**Estimated Effort**: 12 hours  
**Dependencies**: None

**Implementation Steps**:
1. Design architecture documentation
2. Document module boundaries
3. Document data flow
4. Add architecture diagrams
5. Document design decisions
6. Test documentation

**Files to Modify**:
- Create ARCHITECTURE.md

**Validation**:
- Verify architecture accuracy
- Check diagrams
- Review with team

---

### NAB-P2-023: No Contribution Guide or Coding Standards
**Module**: Documentation/Contributing  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Design contribution guide
2. Document coding standards
3. Add PR guidelines
4. Add commit message conventions
5. Add code review checklist
6. Test guide

**Files to Modify**:
- Create CONTRIBUTING.md

**Validation**:
- Test with new contributor
- Verify standards clarity
- Check completeness

---

### NAB-P2-024: No Deployment Troubleshooting Guide
**Module**: Documentation/Operations  
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Implementation Steps**:
1. Document common deployment issues
2. Add troubleshooting steps
3. Add debugging commands
4. Add escalation procedures
5. Test guide

**Files to Modify**:
- Create TROUBLESHOOTING.md

**Validation**:
- Test troubleshooting scenarios
- Verify steps accuracy
- Check completeness

---

## MONITORING ISSUES (3)

### NAB-P2-025: No Uptime Monitoring
**Module**: Monitoring/Uptime  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P1-009

**Implementation Steps**:
1. Configure uptime monitoring (UptimeRobot, Pingdom)
2. Add uptime checks for critical endpoints
3. Configure alerting
4. Test monitoring

**Files to Modify**:
- Monitoring configuration

**Validation**:
- Test uptime checks
- Verify alerting
- Check monitoring dashboard

---

### NAB-P2-026: No Synthetic Monitoring
**Module**: Monitoring/Synthetic  
**Estimated Effort**: 8 hours  
**Dependencies**: NAB-P1-009

**Implementation Steps**:
1. Design synthetic test scenarios
2. Implement synthetic tests (checkout flow, login)
3. Configure test schedule
4. Add alerting for failures
5. Test synthetic monitoring

**Files to Modify**:
- Synthetic test scripts
- Monitoring configuration

**Validation**:
- Test synthetic scenarios
- Verify alerting
- Check test reliability

---

### NAB-P2-027: No Real User Monitoring (RUM)
**Module**: Monitoring/RUM  
**Estimated Effort**: 6 hours  
**Dependencies**: NAB-P1-009

**Implementation Steps**:
1. Integrate RUM solution (Cloudflare Web Analytics, Google Analytics)
2. Configure RUM data collection
3. Add performance metrics
4. Add user journey tracking
5. Test RUM

**Files to Modify**:
- `src/components/GoogleAnalytics.tsx`
- Monitoring configuration

**Validation**:
- Test RUM data collection
- Verify metrics accuracy
- Check user journey tracking

---

## BACKEND/API ISSUES (5)

### NAB-P2-028: No API Response Caching
**Module**: Backend/API  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify cacheable endpoints
2. Implement Redis or Cloudflare KV caching
3. Add cache headers
4. Implement cache invalidation
5. Add cache warming
6. Test caching performance

**Files to Modify**:
- `api/_lib/` (cache utilities)
- Cacheable endpoints

**Validation**:
- Test cache hit rate
- Verify cache invalidation
- Measure performance improvement

---

### NAB-P2-029: No Database Query Result Caching
**Module**: Database/Queries  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P2-028

**Implementation Steps**:
1. Identify cacheable queries
2. Implement query result caching
3. Add cache TTL
4. Implement cache invalidation
5. Test query performance

**Files to Modify**:
- `api/_lib/` (database utilities)

**Validation**:
- Test cache hit rate
- Verify cache invalidation
- Measure performance improvement

---

### NAB-P2-030: No API Deprecation Strategy
**Module**: Backend/API  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P1-003

**Implementation Steps**:
1. Design deprecation policy
2. Add deprecation headers
3. Add deprecation warnings
4. Document deprecated endpoints
5. Test deprecation

**Files to Modify**:
- API documentation
- API middleware

**Validation**:
- Test deprecation headers
- Verify warnings
- Check documentation

---

### NAB-P2-031: No Request Timeout Configuration
**Module**: Backend/API  
**Estimated Effort**: 2 hours  
**Dependencies**: None

**Implementation Steps**:
1. Configure request timeout
2. Add timeout handling
3. Add timeout logging
4. Test timeout behavior

**Files to Modify**:
- `api/_middleware.ts`
- API handlers

**Validation**:
- Test timeout behavior
- Verify logging
- Check error handling

---

### NAB-P2-032: No API Analytics/Usage Metrics
**Module**: Backend/Analytics  
**Estimated Effort**: 8 hours  
**Dependencies**: NAB-P1-010

**Implementation Steps**:
1. Design analytics schema
2. Implement usage tracking
3. Add analytics dashboard
4. Add export functionality
5. Test analytics

**Files to Modify**:
- `api/_lib/` (analytics utilities)
- `src/admin/` (analytics dashboard)

**Validation**:
- Test usage tracking
- Verify dashboard accuracy
- Check export functionality

---

## IMPLEMENTATION SEQUENCE

### Week 1: Database Optimization
- NAB-P2-009: Missing indexes
- NAB-P2-010: Composite indexes
- NAB-P2-011: N+1 patterns
- NAB-P2-012: Deep nested includes
- NAB-P2-013: AnalyticsEvent UUID

### Week 2: Frontend UX Enhancements
- NAB-P2-001: Reviews discoverability
- NAB-P2-004: Filter UI
- NAB-P2-005: Infinite scroll
- NAB-P2-008: Social share buttons

### Week 3: Code Quality
- NAB-P2-014: Unknown types
- NAB-P2-015: useMemo
- NAB-P2-016: React.memo
- NAB-P2-017: Barrel exports
- NAB-P2-018: Magic numbers

### Week 4: Documentation
- NAB-P2-020: API documentation
- NAB-P2-021: Onboarding guide
- NAB-P2-022: Architecture documentation
- NAB-P2-023: Contribution guide
- NAB-P2-024: Troubleshooting guide

### Week 5: Monitoring
- NAB-P2-025: Uptime monitoring
- NAB-P2-026: Synthetic monitoring
- NAB-P2-027: RUM

### Week 6: Backend Enhancements
- NAB-P2-028: API caching
- NAB-P2-029: Query caching
- NAB-P2-030: Deprecation strategy
- NAB-P2-031: Request timeout
- NAB-P2-032: API analytics

### Week 7: Advanced Frontend Features
- NAB-P2-002: Order tracking
- NAB-P2-003: Return image upload
- NAB-P2-006: Saved payment methods
- NAB-P2-007: Back in stock notifications

### Week 8: Code Documentation
- NAB-P2-019: JSDoc comments

## TOTAL ESTIMATED EFFORT
**208 hours** (approximately 5 weeks for 1 developer, or 2.5 weeks for 2 developers)

## SUCCESS CRITERIA
- All 32 P2 issues resolved
- Database queries optimized
- Frontend UX enhanced
- Code quality improved
- Documentation comprehensive
- Monitoring operational

## RISKS & MITIGATIONS
- **Risk**: Database migration complexity
  - **Mitigation**: Test thoroughly on staging, have rollback ready
- **Risk**: Breaking changes with barrel exports
  - **Mitigation**: Update imports incrementally, test thoroughly
- **Risk**: Documentation maintenance burden
  - **Mitigation**: Automate where possible, integrate with CI/CD
