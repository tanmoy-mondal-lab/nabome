# P2 Fix Plan - Medium Priority Issues
**Project:** Nabome
**Phase:** 13 - Implementation Planning
**Priority Level:** P2 (Medium Priority)
**Total P2 Issues:** 24
**Target Completion:** Sprint 9-12 (Weeks 9-12)

---

## Executive Summary

This document outlines the implementation plan for all 24 P2 (medium priority) issues identified across the Nabome codebase. These issues represent improvements that should be addressed after P0 and P1 issues to enhance user experience, code quality, and documentation.

**Key Statistics:**
- **Total P2 Issues:** 24
- **Frontend/UX:** 8 items
- **Database:** 5 items
- **Code Quality:** 6 items
- **Documentation:** 5 items
- **Estimated Effort:** 30 person-days (6 weeks)
- **Target Timeline:** 4 weeks (Sprint 9-12)

---

## Issue Inventory

| ID | Issue | Component | Source Report | Status |
|----|-------|-----------|---------------|--------|
| NAB-P2-001 | Reviews hidden behind "Show More" - low discoverability | Frontend | Frontend UI/UX Audit | Done |
| NAB-P2-002 | No order tracking - uses Google search hack | Frontend | Frontend UI/UX Audit | Done |
| NAB-P2-003 | Return image upload uses base64 (large payloads) | Frontend | Frontend UI/UX Audit | Done |
| NAB-P2-004 | Product listing missing filter UI for size, color, brand, price | Frontend | Frontend UI/UX Audit | Done |
| NAB-P2-005 | No infinite scroll (page number pagination only) | Frontend | Frontend UI/UX Audit | Deferred (schema conflict with URL params) |
| NAB-P2-006 | No saved payment methods or card-on-file | Frontend | Frontend UI/UX Audit | Deferred (new feature, needs Razorpay tokenization) |
| NAB-P2-007 | No "Notify when back in stock" for out-of-stock items | Frontend | Frontend UI/UX Audit | Deferred (new feature, needs DB model + email infra) |
| NAB-P2-008 | No social share buttons on product pages | Frontend | Frontend UI/UX Audit | Done |
| NAB-P2-009 | No index on `orderItems.productId` and `orderItems.variantId` | Database | Database Audit | Done |
| NAB-P2-010 | No composite indexes for common query patterns | Database | Database Audit | Done |
| NAB-P2-011 | N+1 patterns in order cancellation | Database | Database Audit | Done |
| NAB-P2-012 | Deep nested includes causing massive joins (cart 4 levels, checkout 5 levels) | Database | Database Audit | Done (already refactored) |
| NAB-P2-013 | AnalyticsEvent BigInt autoincrement - write contention risk | Database | Database Audit | Done (schema updated, migration created) |
| NAB-P2-014 | 225 `: unknown` usages across 43 files | Code Quality | Code Quality Audit | Done |
| NAB-P2-015 | Only 21 `useMemo` usages across 8 files (low memoization) | Code Quality | Code Quality Audit | Done |
| NAB-P2-016 | No `React.memo` usage - components re-render unnecessarily | Code Quality | Code Quality Audit | Done |
| NAB-P2-017 | No barrel exports - deep import paths | Code Quality | Code Quality Audit | Done |
| NAB-P2-018 | Magic numbers/strings not extracted to constants | Code Quality | Code Quality Audit | Done |
| NAB-P2-019 | No JSDoc comments or function documentation | Code Quality | Code Quality Audit | Done |
| NAB-P2-020 | No API documentation (200+ endpoints undocumented) | Documentation | Code Quality Audit | Done |
| NAB-P2-021 | No developer onboarding guide | Documentation | Code Quality Audit | Done (already existed) |
| NAB-P2-022 | No architecture documentation separate from audits | Documentation | Code Quality Audit | Done (already existed) |
| NAB-P2-023 | No contribution guide or coding standards | Documentation | Code Quality Audit | Done (already existed) |
| NAB-P2-024 | No deployment troubleshooting guide | Documentation | Code Quality Audit | Done (already existed) |

---

## Detailed Implementation Plans

### NAB-P2-001: Reviews Hidden Behind "Show More"

**Issue:** Product reviews are hidden behind "Show More" button, reducing discoverability.

**Impact:** Medium UX issue - low review visibility affects social proof.

**Root Cause:** UI design choice to hide reviews by default.

**Implementation Steps:**

1. **Analyze Current Review Display**
   - Identify review component
   - Identify "Show More" logic
   - Determine optimal display strategy

2. **Improve Review Visibility**
   - Show first 3-5 reviews by default
   - Add rating summary prominently
   - Add review count badge
   - Keep "Show More" for additional reviews

3. **Add Review Highlights**
   - Display top-rated reviews
   - Display recent reviews
   - Display reviews with images
   - Add review filters

4. **Improve Review UI**
   - Add star rating display
   - Add review date
   - Add helpful votes
   - Add review verification badge

5. **Testing**
   - Test review display
   - Test "Show More" functionality
   - Test review filters
   - Test responsive design

**Files to Modify:**
- Review component
- Product page component
- Review styling

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Revert to previous display.

**Acceptance Criteria:**
- First 3-5 reviews shown by default
- Rating summary prominent
- Review count badge added
- "Show More" functional

---

### NAB-P2-002: No Order Tracking

**Issue:** No order tracking feature, users must use Google search hack.

**Impact:** Medium UX issue - poor post-purchase experience.

**Root Cause:** Order tracking not implemented.

**Implementation Steps:**

1. **Define Order Tracking Requirements**
   - Define tracking data sources
   - Define tracking update frequency
   - Define tracking display

2. **Integrate Shipping Provider API**
   - Integrate with shipping provider (e.g., Shiprocket, Delhivery)
   - Fetch tracking data
   - Cache tracking data

3. **Create Order Tracking Page**
   - File: `src/app/orders/[id]/tracking/page.tsx`
   - Display tracking timeline
   - Display shipment status
   - Display estimated delivery
   - Display tracking events

4. **Add Tracking to Order Detail**
   - Add tracking link to order detail
   - Add tracking summary
   - Add tracking button

5. **Add Tracking Notifications**
   - Send tracking updates via email
   - Send tracking updates via SMS
   - Update order status

6. **Testing**
   - Test tracking page
   - Test tracking API integration
   - Test tracking updates
   - Test notifications

**Files to Modify:**
- Order tracking page (create)
- Order detail page
- Shipping API integration
- Notification logic

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** Shipping provider API access.

**Rollback Plan:** Remove tracking feature.

**Acceptance Criteria:**
- Order tracking page created
- Shipping API integrated
- Tracking timeline displayed
- Tracking notifications sent

---

### NAB-P2-003: Return Image Upload Uses Base64

**Issue:** Return image upload uses base64 encoding, creating large payloads.

**Impact:** Medium performance issue - slow uploads, large request size.

**Root Cause:** Images not uploaded as files, encoded as base64 strings.

**Implementation Steps:**

1. **Audit Image Upload Logic**
   - Identify base64 encoding location
   - Identify image size limits
   - Identify upload endpoint

2. **Implement File Upload**
   - Change to multipart/form-data
   - Upload images as files
   - Add file validation

3. **Add Image Compression**
   - Compress images before upload
   - Resize large images
   - Optimize image format

4. **Add Progress Indicator**
   - Show upload progress
   - Show upload status
   - Handle upload errors

5. **Add Image Preview**
   - Show image preview before upload
   - Allow image removal
   - Show image size

6. **Testing**
   - Test file upload
   - Test image compression
   - Test progress indicator
   - Test error handling

**Files to Modify:**
- Return form component
- Upload handler
- Image processing logic

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Revert to base64 encoding.

**Acceptance Criteria:**
- Images uploaded as files
- Image compression implemented
- Progress indicator added
- Upload size reduced

---

### NAB-P2-004: Product Listing Missing Filter UI

**Issue:** Product listing lacks filter UI for size, color, brand, price.

**Impact:** Medium UX issue - difficult to find products.

**Root Cause:** Filter UI not implemented.

**Implementation Steps:**

1. **Define Filter Requirements**
   - Define filter categories (size, color, brand, price)
   - Define filter UI design
   - Define filter logic

2. **Create Filter Component**
   - File: `src/components/ProductFilters.tsx`
   - Create filter UI
   - Add filter checkboxes/ranges
   - Add filter count

3. **Implement Filter Logic**
   - Implement filter state
   - Implement filter application
   - Implement filter reset
   - Implement filter persistence (URL params)

4. **Add Filter to Product Listing**
   - Add filter sidebar
   - Add mobile filter drawer
   - Add active filter display
   - Add clear filters button

5. **Add Filter Analytics**
   - Track filter usage
   - Track filter combinations
   - Track filter results

6. **Testing**
   - Test filter UI
   - Test filter logic
   - Test filter persistence
   - Test mobile filter

**Files to Modify:**
- ProductFilters component (create)
- Product listing page
- Filter logic
- URL routing

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** Remove filter UI.

**Acceptance Criteria:**
- Filter UI created
- Filter logic implemented
- Filter persistence working
- Mobile filter drawer functional

---

### NAB-P2-005: No Infinite Scroll

**Issue:** Product listing uses page number pagination only, no infinite scroll.

**Impact:** Medium UX issue - less modern UX, more clicks required.

**Root Cause:** Infinite scroll not implemented.

**Implementation Steps:**

1. **Define Infinite Scroll Strategy**
   - Define scroll trigger point
   - Define page size
   - Define loading state

2. **Implement Infinite Scroll**
   - Use Intersection Observer API
   - Load more products on scroll
   - Show loading indicator
   - Handle end of list

3. **Add Scroll Restoration**
   - Restore scroll position on navigation
   - Save scroll position
   - Handle back navigation

4. **Add Pagination Fallback**
   - Keep page number pagination as option
   - Allow toggle between modes
   - Update URL appropriately

5. **Testing**
   - Test infinite scroll
   - Test scroll restoration
   - Test pagination fallback
   - Test mobile behavior

**Files to Modify:**
- Product listing component
- Product query logic
- URL routing

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove infinite scroll.

**Acceptance Criteria:**
- Infinite scroll implemented
- Scroll restoration working
- Loading indicator shown
- Pagination fallback available

---

### NAB-P2-006: No Saved Payment Methods

**Issue:** No saved payment methods or card-on-file functionality.

**Impact:** Medium UX issue - users must re-enter payment details each time.

**Root Cause:** Saved payment methods not implemented.

**Implementation Steps:**

1. **Define Saved Payment Requirements**
   - Define payment method storage
   - Define security requirements (PCI compliance)
   - Define user consent

2. **Implement Payment Method Storage**
   - Use Razorpay card-on-file
   - Store payment method tokens
   - Encrypt sensitive data
   - Add user consent

3. **Create Payment Method Management UI**
   - Add saved payment methods section
   - Add payment method deletion
   - Add payment method selection
   - Add payment method addition

4. **Update Checkout Flow**
   - Show saved payment methods
   - Allow selection of saved method
   - Allow adding new method
   - Default to saved method

5. **Add Security Measures**
   - Require re-authentication for saved methods
   - Mask card numbers
   - Add expiration tracking

6. **Testing**
   - Test payment method saving
   - Test payment method selection
   - Test payment method deletion
   - Test security measures

**Files to Modify:**
- Payment method model
- Payment handler
- Checkout component
- User account section

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** Razorpay card-on-file API.

**Rollback Plan:** Remove saved payment methods.

**Acceptance Criteria:**
- Payment methods saved securely
- Payment method UI created
- Checkout updated to use saved methods
- Security measures implemented

---

### NAB-P2-007: No "Notify When Back in Stock"

**Issue:** No notification system for out-of-stock items.

**Impact:** Medium revenue issue - lost sales from stockouts.

**Root Cause:** Stock notification not implemented.

**Implementation Steps:**

1. **Define Notification Requirements**
   - Define notification trigger (restock)
   - Define notification channels (email, SMS)
   - Define notification frequency

2. **Create Stock Notification Model**
   - Add stockNotification table
   - Track user, product, notification status
   - Add unique constraint (user, product)

3. **Create Notification UI**
   - Add "Notify me" button on out-of-stock products
   - Add email input
   - Add notification preferences
   - Add notification status display

4. **Implement Notification Logic**
   - Check stock on inventory update
   - Trigger notifications on restock
   - Send email notifications
   - Send SMS notifications

5. **Add Notification Management**
   - Allow users to manage notifications
   - Allow users to cancel notifications
   - Show notification history

6. **Testing**
   - Test notification signup
   - Test notification trigger
   - Test email delivery
   - Test SMS delivery

**Files to Modify:**
- Stock notification model
- Product page component
- Notification logic
- Email/SMS templates

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** Email service, SMS service.

**Rollback Plan:** Remove notification system.

**Acceptance Criteria:**
- Stock notification model created
- Notification UI implemented
- Notification logic working
- Email/SMS notifications sent

---

### NAB-P2-008: No Social Share Buttons

**Issue:** No social share buttons on product pages.

**Impact:** Medium marketing issue - reduced social sharing.

**Root Cause:** Social sharing not implemented.

**Implementation Steps:**

1. **Define Social Share Requirements**
   - Define platforms (Facebook, Twitter, WhatsApp, Pinterest)
   - Define share content (title, description, image)
   - Define share UI design

2. **Create Share Component**
   - File: `src/components/SocialShare.tsx`
   - Add share buttons
   - Add share icons
   - Add share count (optional)

3. **Implement Share Logic**
   - Generate share URLs
   - Open share dialogs
   - Track share events
   - Add Open Graph tags

4. **Add to Product Page**
   - Add share component to product page
   - Position appropriately
   - Style according to design system

5. **Add Share Analytics**
   - Track share clicks
   - Track share completions
   - Track share platforms

6. **Testing**
   - Test share buttons
   - Test share dialogs
   - Test share tracking
   - Test Open Graph tags

**Files to Modify:**
- SocialShare component (create)
- Product page component
- Open Graph tags

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Remove share buttons.

**Acceptance Criteria:**
- Share component created
- Share buttons functional
- Share tracking implemented
- Open Graph tags added

---

### NAB-P2-009: No Index on orderItems Fields

**Issue:** No database index on `orderItems.productId` and `orderItems.variantId`.

**Impact:** Medium performance issue - slow queries on order items.

**Root Cause:** Indexes not created for frequently queried fields.

**Implementation Steps:**

1. **Identify Query Patterns**
   - Identify queries filtering by productId
   - Identify queries filtering by variantId
   - Identify query frequency

2. **Create Database Migration**
   - Add index on `orderItems.productId`
   - Add index on `orderItems.variantId`
   - Add composite index if needed

3. **Run Migration**
   - Execute migration
   - Verify index creation
   - Monitor query performance

4. **Test Query Performance**
   - Test queries with new indexes
   - Measure performance improvement
   - Verify no regression

5. **Document Indexes**
   - Document index purpose
   - Document index usage
   - Update schema documentation

**Files to Modify:**
- Database migration
- Prisma schema
- Schema documentation

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** Database migration execution.

**Rollback Plan:** Rollback migration.

**Acceptance Criteria:**
- Indexes created on productId and variantId
- Query performance improved
- Migration executed successfully
- Documentation updated

---

### NAB-P2-010: No Composite Indexes

**Issue:** No composite indexes for common query patterns.

**Impact:** Medium performance issue - slow multi-field queries.

**Root Cause:** Composite indexes not created for multi-field queries.

**Implementation Steps:**

1. **Identify Composite Query Patterns**
   - Identify queries with multiple WHERE conditions
   - Identify queries with JOIN conditions
   - Identify query frequency

2. **Create Composite Indexes**
   - Add composite indexes for common patterns
   - Optimize index order
   - Consider index size

3. **Create Database Migration**
   - Add composite indexes
   - Test index effectiveness

4. **Run Migration**
   - Execute migration
   - Verify index creation
   - Monitor query performance

5. **Test Query Performance**
   - Test queries with new indexes
   - Measure performance improvement
   - Verify no regression

**Files to Modify:**
- Database migration
- Prisma schema

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** Database migration execution.

**Rollback Plan:** Rollback migration.

**Acceptance Criteria:**
- Composite indexes created
- Query performance improved
- Migration executed successfully

---

### NAB-P2-011: N+1 Patterns in Order Cancellation

**Issue:** N+1 query patterns in order cancellation logic.

**Impact:** Medium performance issue - slow order cancellation.

**Root Cause:** Not using eager loading for related data.

**Implementation Steps:**

1. **Identify N+1 Queries**
   - Profile order cancellation
   - Count queries per cancellation
   - Identify related data being fetched

2. **Implement Eager Loading**
   - Use Prisma `include` for relations
   - Load related data in single query
   - Optimize query structure

3. **Refactor Cancellation Logic**
   - Update to use eager loading
   - Remove unnecessary queries
   - Optimize data fetching

4. **Add Query Logging**
   - Log query count
   - Monitor query performance
   - Alert on excessive queries

5. **Testing**
   - Test order cancellation
   - Verify single query for related data
   - Measure performance improvement

**Files to Modify:**
- Order cancellation handler
- Prisma queries

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Revert to separate queries.

**Acceptance Criteria:**
- N+1 patterns eliminated
- Eager loading implemented
- Query count reduced
- Performance improved

---

### NAB-P2-012: Deep Nested Includes Causing Massive Joins

**Issue:** Deep nested includes (cart 4 levels, checkout 5 levels) causing massive joins.

**Impact:** Medium performance issue - slow cart/checkout queries.

**Root Cause:** Over-eager loading of nested relations.

**Implementation Steps:**

1. **Analyze Nested Includes**
   - Identify cart includes (4 levels)
   - Identify checkout includes (5 levels)
   - Identify unnecessary nesting

2. **Optimize Query Structure**
   - Flatten nested includes where possible
   - Remove unnecessary includes
   - Use selective includes

3. **Implement Query Optimization**
   - Load only required data
   - Use separate queries for deep nesting
   - Cache frequently accessed data

4. **Add Query Monitoring**
   - Log query complexity
   - Monitor query performance
   - Alert on complex queries

5. **Testing**
   - Test cart queries
   - Test checkout queries
   - Measure performance improvement
   - Verify data completeness

**Files to Modify:**
- Cart query logic
- Checkout query logic
- Prisma queries

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Revert to nested includes.

**Acceptance Criteria:**
- Nested includes flattened
- Query complexity reduced
- Performance improved
- Data completeness verified

---

### NAB-P2-013: AnalyticsEvent BigInt Autoincrement

**Issue:** AnalyticsEvent uses BigInt autoincrement, causing write contention risk.

**Impact:** Medium performance issue - write contention under high load.

**Root Cause:** Autoincrement on high-write table.

**Implementation Steps:**

1. **Analyze Write Patterns**
   - Identify write frequency
   - Identify write contention
   - Evaluate alternatives

2. **Implement Alternative ID Strategy**
   - Use UUID instead of autoincrement
   - Use distributed ID generation
   - Or use sequence-based IDs

3. **Create Database Migration**
   - Change ID type from BigInt autoincrement to UUID
   - Update foreign key references
   - Handle existing data

4. **Update Application Code**
   - Update ID generation logic
   - Update query logic
   - Update ID comparisons

5. **Testing**
   - Test ID generation
   - Test write performance
   - Test query performance
   - Verify no data loss

**Files to Modify:**
- Database migration
- Prisma schema
- AnalyticsEvent model
- ID generation logic

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** Database migration execution.

**Rollback Plan:** Rollback migration.

**Acceptance Criteria:**
- ID strategy changed to UUID
- Write contention eliminated
- Migration executed successfully
- Application code updated

---

### NAB-P2-014: 225 `: unknown` Usages

**Issue:** 225 instances of `: unknown` type across 43 files.

**Impact:** Medium type safety issue - reduced type safety, potential runtime errors.

**Root Cause:** Developers using `unknown` instead of specific types.

**Implementation Steps:**

1. **Audit `: unknown` Usages**
   - Search for all `: unknown` instances
   - Categorize by severity
   - Identify critical paths

2. **Replace with Specific Types**
   - Replace `unknown` with specific types
   - Add proper type definitions
   - Use type guards where needed

3. **Fix Critical Paths First**
   - Focus on authentication, authorization, payments
   - Ensure type safety in critical code
   - Add type validation

4. **Add ESLint Rule**
   - Add rule to flag `unknown` usage
   - Configure rule severity
   - Add exceptions where needed

5. **Testing**
   - Run TypeScript compiler
   - Run tests
   - Verify no runtime errors

**Files to Modify:**
- All files with `: unknown` (43 files)
- ESLint configuration

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** Revert type changes.

**Acceptance Criteria:**
- `: unknown` usages reduced by 80%+
- Critical paths fully typed
- ESLint rule configured
- No TypeScript errors

---

### NAB-P2-015: Low `useMemo` Usage

**Issue:** Only 21 `useMemo` usages across 8 files, low memoization.

**Impact:** Medium performance issue - unnecessary re-renders.

**Root Cause:** Memoization not applied where needed.

**Implementation Steps:**

1. **Identify Memoization Opportunities**
   - Profile component re-renders
   - Identify expensive computations
   - Identify object/array recreations

2. **Add `useMemo` for Expensive Computations**
   - Add `useMemo` for filtered lists
   - Add `useMemo` for sorted data
   - Add `useMemo` for derived state

3. **Add `useCallback` for Event Handlers**
   - Add `useCallback` for event handlers
   - Add `useCallback` for callbacks
   - Prevent unnecessary re-creation

4. **Add `React.memo` for Components**
   - Add `React.memo` for pure components
   - Add custom comparison functions
   - Prevent unnecessary re-renders

5. **Testing**
   - Test component re-renders
   - Measure performance improvement
   - Verify no functional changes

**Files to Modify:**
- Components with expensive computations
- Components with event handlers
- Pure components

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove memoization.

**Acceptance Criteria:**
- `useMemo` added for expensive computations
- `useCallback` added for event handlers
- `React.memo` added for pure components
- Performance improved

---

### NAB-P2-016: No `React.memo` Usage

**Issue:** No `React.memo` usage, components re-render unnecessarily.

**Impact:** Medium performance issue - unnecessary re-renders.

**Root Cause:** Memoization not applied to components.

**Implementation Steps:**

1. **Identify Components for Memoization**
   - Profile component re-renders
   - Identify pure components
   - Identify frequently re-rendered components

2. **Add `React.memo` to Components**
   - Add `React.memo` to pure components
   - Add custom comparison functions
   - Add memoization to child components

3. **Optimize Props**
   - Ensure props are stable
   - Use `useMemo` for prop objects
   - Use `useCallback` for prop functions

4. **Testing**
   - Test component re-renders
   - Measure performance improvement
   - Verify no functional changes

**Files to Modify:**
- Pure components
- Frequently re-rendered components

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove `React.memo`.

**Acceptance Criteria:**
- `React.memo` added to pure components
- Custom comparison functions added
- Props optimized
- Performance improved

---

### NAB-P2-017: No Barrel Exports

**Issue:** No barrel exports, deep import paths required.

**Impact:** Medium maintainability issue - difficult imports, refactoring issues.

**Root Cause:** Barrel exports not created.

**Implementation Steps:**

1. **Identify Module Structure**
   - Identify module directories
   - Identify export patterns
   - Identify import patterns

2. **Create Barrel Exports**
   - Create index.ts files in directories
   - Export all public APIs
   - Re-exports for clean imports

3. **Update Imports**
   - Update imports to use barrel exports
   - Simplify import paths
   - Remove deep imports

4. **Add ESLint Rule**
   - Add rule to enforce barrel exports
   - Configure rule severity
   - Add exceptions

5. **Testing**
   - Test imports
   - Test exports
   - Verify no breaking changes

**Files to Modify:**
- Index.ts files (create)
- Import statements

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove barrel exports.

**Acceptance Criteria:**
- Barrel exports created
- Imports simplified
- ESLint rule configured
- No breaking changes

---

### NAB-P2-018: Magic Numbers/Strings Not Extracted

**Issue:** Magic numbers and strings not extracted to constants.

**Impact:** Medium maintainability issue - difficult to maintain, inconsistent values.

**Root Cause:** Constants not created for magic values.

**Implementation Steps:**

1. **Identify Magic Numbers/Strings**
   - Search for magic numbers
   - Search for magic strings
   - Categorize by type

2. **Create Constants Files**
   - Create constants files by domain
   - Extract magic numbers to constants
   - Extract magic strings to constants

3. **Replace Magic Values**
   - Replace magic numbers with constants
   - Replace magic strings with constants
   - Ensure consistent usage

4. **Add ESLint Rule**
   - Add rule to flag magic numbers
   - Add rule to flag magic strings
   - Configure rule severity

5. **Testing**
   - Test functionality
   - Verify consistent values
   - Verify no breaking changes

**Files to Modify:**
- Constants files (create)
- Files with magic values
- ESLint configuration

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Revert to magic values.

**Acceptance Criteria:**
- Constants files created
- Magic values replaced
- ESLint rules configured
- Consistent values verified

---

### NAB-P2-019: No JSDoc Comments

**Issue:** No JSDoc comments or function documentation.

**Impact:** Medium maintainability issue - difficult to understand code.

**Root Cause:** Documentation not added to functions.

**Implementation Steps:**

1. **Identify Functions Needing Documentation**
   - Identify public functions
   - Identify complex functions
   - Identify critical functions

2. **Add JSDoc Comments**
   - Add JSDoc to public functions
   - Add parameter descriptions
   - Add return value descriptions
   - Add examples

3. **Configure ESLint Rule**
   - Add rule to require JSDoc
   - Configure rule severity
   - Add exceptions

4. **Generate Documentation**
   - Use TypeDoc or similar
   - Generate API documentation
   - Publish documentation

5. **Testing**
   - Verify JSDoc syntax
   - Verify documentation generation
   - Verify no breaking changes

**Files to Modify:**
- Function files
- ESLint configuration
- Documentation generation config

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** Documentation generation tool.

**Rollback Plan:** Remove JSDoc comments.

**Acceptance Criteria:**
- JSDoc comments added to public functions
- ESLint rule configured
- Documentation generated
- No breaking changes

---

### NAB-P2-020: No API Documentation

**Issue:** No API documentation for 200+ endpoints.

**Impact:** Medium developer experience issue - difficult to use APIs.

**Root Cause:** API documentation not created.

**Implementation Steps:**

1. **Choose Documentation Tool**
   - Evaluate Swagger/OpenAPI
   - Evaluate tools (Swagger UI, Redoc)
   - Select appropriate tool

2. **Document API Endpoints**
   - Document all 200+ endpoints
   - Add request/response schemas
   - Add authentication requirements
   - Add examples

3. **Generate OpenAPI Spec**
   - Create OpenAPI specification
   - Define schemas
   - Define endpoints
   - Define security schemes

4. **Deploy Documentation**
   - Deploy Swagger UI
   - Deploy Redoc
   - Add to developer portal

5. **Keep Documentation Updated**
   - Add documentation to CI/CD
   - Validate documentation on build
   - Auto-generate from code if possible

6. **Testing**
   - Test documentation rendering
   - Test endpoint examples
   - Verify completeness

**Files to Modify:**
- OpenAPI specification (create)
- API documentation (create)
- CI/CD configuration

**Estimated Effort:** 4 days (32 hours)

**Dependencies:** Documentation tool.

**Rollback Plan:** Remove documentation.

**Acceptance Criteria:**
- All 200+ endpoints documented
- OpenAPI spec created
- Documentation deployed
- CI/CD integration added

---

### NAB-P2-021: No Developer Onboarding Guide

**Issue:** No developer onboarding guide.

**Impact:** Medium developer experience issue - difficult for new developers.

**Root Cause:** Onboarding guide not created.

**Implementation Steps:**

1. **Define Onboarding Requirements**
   - Define onboarding steps
   - Define setup instructions
   - Define development workflow

2. **Create Onboarding Guide**
   - File: `docs/ONBOARDING.md`
   - Add environment setup
   - Add project structure overview
   - Add development workflow
   - Add common tasks

3. **Add Setup Instructions**
   - Add prerequisite installation
   - Add dependency installation
   - Add database setup
   - Add environment configuration

4. **Add Development Workflow**
   - Add git workflow
   - Add code style guidelines
   - Add testing guidelines
   - Add deployment instructions

5. **Add Troubleshooting**
   - Add common issues
   - Add solutions
   - Add resources

6. **Testing**
   - Test onboarding guide
   - Verify setup instructions
   - Verify workflow instructions

**Files to Modify:**
- ONBOARDING.md (create)
- README.md (update with link)

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove onboarding guide.

**Acceptance Criteria:**
- Onboarding guide created
- Setup instructions complete
- Development workflow documented
- Troubleshooting section added

---

### NAB-P2-022: No Architecture Documentation

**Issue:** No architecture documentation separate from audits.

**Impact:** Medium developer experience issue - difficult to understand architecture.

**Root Cause:** Architecture documentation not created.

**Implementation Steps:**

1. **Define Architecture Documentation Requirements**
   - Define system architecture
   - Define component architecture
   - Define data flow

2. **Create Architecture Documentation**
   - File: `docs/ARCHITECTURE.md`
   - Add system overview
   - Add component diagrams
   - Add data flow diagrams
   - Add technology stack

3. **Add Component Documentation**
   - Document each major component
   - Add component responsibilities
   - Add component interactions

4. **Add Design Decisions**
   - Document architectural decisions
   - Document trade-offs
   - Document future improvements

5. **Add Diagrams**
   - Create system architecture diagram
   - Create component interaction diagram
   - Create data flow diagram

6. **Testing**
   - Verify documentation completeness
   - Verify diagram accuracy
   - Get team review

**Files to Modify:**
- ARCHITECTURE.md (create)
- Diagrams (create)
- README.md (update with link)

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** Diagramming tool.

**Rollback Plan:** Remove architecture documentation.

**Acceptance Criteria:**
- Architecture documentation created
- Component documentation added
- Design decisions documented
- Diagrams created

---

### NAB-P2-023: No Contribution Guide

**Issue:** No contribution guide or coding standards.

**Impact:** Medium developer experience issue - inconsistent contributions.

**Root Cause:** Contribution guide not created.

**Implementation Steps:**

1. **Define Contribution Requirements**
   - Define contribution process
   - Define coding standards
   - Define review process

2. **Create Contribution Guide**
   - File: `CONTRIBUTING.md`
   - Add contribution process
   - Add PR guidelines
   - Add coding standards
   - Add commit message guidelines

3. **Add Coding Standards**
   - Define code style
   - Define naming conventions
   - Define file organization
   - Define best practices

4. **Add Review Process**
   - Define review checklist
   - Define approval requirements
   - Define merge process

5. **Add Issue Templates**
   - Create bug report template
   - Create feature request template
   - Create PR template

6. **Testing**
   - Verify contribution guide
   - Verify coding standards
   - Verify review process

**Files to Modify:**
- CONTRIBUTING.md (create)
- Issue templates (create)
- PR template (create)
- README.md (update with link)

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove contribution guide.

**Acceptance Criteria:**
- Contribution guide created
- Coding standards defined
- Review process documented
- Templates created

---

### NAB-P2-024: No Deployment Troubleshooting Guide

**Issue:** No deployment troubleshooting guide.

**Impact:** Medium operations issue - difficult to debug deployment issues.

**Root Cause:** Troubleshooting guide not created.

**Implementation Steps:**

1. **Define Troubleshooting Requirements**
   - Define common deployment issues
   - Define debugging steps
   - Define solutions

2. **Create Troubleshooting Guide**
   - File: `docs/DEPLOYMENT_TROUBLESHOOTING.md`
   - Add common issues
   - Add debugging steps
   - Add solutions
   - Add resources

3. **Add Deployment Issues**
   - Add build failures
   - Add deployment failures
   - Add runtime errors
   - Add performance issues

4. **Add Debugging Tools**
   - Add logging tools
   - Add monitoring tools
   - Add debugging commands

5. **Add Contact Information**
   - Add escalation path
   - Add support contacts
   - Add resources

6. **Testing**
   - Verify troubleshooting guide
   - Test solutions
   - Get team review

**Files to Modify:**
- DEPLOYMENT_TROUBLESHOOTING.md (create)
- README.md (update with link)

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove troubleshooting guide.

**Acceptance Criteria:**
- Troubleshooting guide created
- Common issues documented
- Solutions provided
- Resources added

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove troubleshooting guide.

**Acceptance Criteria:**
- Troubleshooting guide created
- Common issues documented
- Solutions provided
- Resources added

---

## Sprint Planning

### Sprint 9: Frontend/UX Improvements (Week 9)

**Goal:** Improve frontend user experience and discoverability.

**Issues:**
- NAB-P2-001: Reviews visibility
- NAB-P2-002: Order tracking
- NAB-P2-003: Return image upload
- NAB-P2-004: Product filters
- NAB-P2-005: Infinite scroll
- NAB-P2-006: Saved payment methods
- NAB-P2-007: Stock notifications
- NAB-P2-008: Social share buttons

**Estimated Effort:** 4 days (32 hours)

**Deliverable:** Frontend UX improved

**Acceptance Criteria:**
- Reviews more discoverable
- Order tracking implemented
- Image upload optimized
- Product filters added
- Infinite scroll implemented
- Saved payment methods added
- Stock notifications added
- Social share buttons added

---

### Sprint 10: Database Performance (Week 10)

**Goal:** Optimize database queries and indexes.

**Issues:**
- NAB-P2-009: Index on orderItems fields
- NAB-P2-010: Composite indexes
- NAB-P2-011: N+1 patterns
- NAB-P2-012: Deep nested includes
- NAB-P2-013: AnalyticsEvent ID strategy

**Estimated Effort:** 3 days (24 hours)

**Deliverable:** Database performance optimized

**Acceptance Criteria:**
- Indexes created
- Composite indexes added
- N+1 patterns eliminated
- Nested includes flattened
- ID strategy optimized

---

### Sprint 11: Code Quality (Week 11)

**Goal:** Improve code quality and type safety.

**Issues:**
- NAB-P2-014: `: unknown` usages
- NAB-P2-015: Low `useMemo` usage
- NAB-P2-016: No `React.memo` usage
- NAB-P2-017: No barrel exports
- NAB-P2-018: Magic numbers/strings
- NAB-P2-019: No JSDoc comments

**Estimated Effort:** 4 days (32 hours)

**Deliverable:** Code quality improved

**Acceptance Criteria:**
- Type safety improved
- Memoization added
- Barrel exports created
- Constants extracted
- Documentation added

---

### Sprint 12: Documentation (Week 12)

**Goal:** Create comprehensive documentation.

**Issues:**
- NAB-P2-020: API documentation
- NAB-P2-021: Developer onboarding
- NAB-P2-022: Architecture documentation
- NAB-P2-023: Contribution guide
- NAB-P2-024: Deployment troubleshooting

**Estimated Effort:** 4 days (32 hours)

**Deliverable:** Documentation complete

**Acceptance Criteria:**
- API documentation created
- Onboarding guide created
- Architecture documentation created
- Contribution guide created
- Troubleshooting guide created

---

## Testing Strategy

### Frontend Testing
- Component tests
- E2E tests for new features
- Accessibility tests
- Performance tests

### Database Testing
- Query performance tests
- Migration tests
- Data integrity tests

### Code Quality Testing
- TypeScript compilation
- ESLint checks
- Type safety verification

### Documentation Testing
- Documentation completeness check
- Link verification
- Example verification

---

## Risk Assessment

### Medium Risk Items
- **NAB-P2-002 (Order Tracking):** Requires shipping provider integration
- **NAB-P2-006 (Saved Payment Methods):** PCI compliance requirements
- **NAB-P2-013 (AnalyticsEvent ID):** Database migration risk
- **NAB-P2-020 (API Documentation):** Large effort, 200+ endpoints

### Mitigation Strategies
- Thorough testing before deployment
- Staged rollout for database changes
- Documentation review
- Monitoring after deployment

---

## Success Criteria

All P2 issues are considered resolved when:

1. **Frontend/UX:** User experience improved, features added
2. **Database:** Performance optimized, queries efficient
3. **Code Quality:** Type safety improved, code maintainable
4. **Documentation:** Comprehensive documentation available

---

## Next Steps

After completing P2 issues:
1. Proceed to P3 issues (low priority)
2. Conduct regression testing
3. Update documentation
4. Establish ongoing quality monitoring

---

**Document Version:** 1.0
**Last Updated:** 2026-07-07
**Owner:** Development Team
**Reviewers:** QA Team, Product Team
