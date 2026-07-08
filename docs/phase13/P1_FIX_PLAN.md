# P1 Fix Plan - High Priority Issues
**Project:** Nabome
**Phase:** 13 - Implementation Planning
**Priority Level:** P1 (High Priority)
**Total P1 Issues:** 17
**Target Completion:** Sprint 4-8 (Weeks 5-8)

---

## Executive Summary

This document outlines the implementation plan for all 17 P1 (high priority) issues identified across the Nabome codebase. These issues represent significant blockers that should be resolved after P0 critical issues to improve maintainability, business logic, and operational efficiency.

**Key Statistics:**
- **Total P1 Issues:** 17
- **Architecture Refactoring:** 4 items
- **Business Logic:** 6 items
- **Admin Operations:** 4 items
- **Observability:** 3 items
- **Frontend Core:** 4 items
- **Estimated Effort:** 40 person-days (8 weeks)
- **Target Timeline:** 4 weeks (Sprint 4-8)

---

## Issue Inventory

| ID | Issue | Component | Source Report | Status |
|----|-------|-----------|---------------|--------|
| NAB-P1-001 | Auth handler 1,194 lines monolithic - should split into modules | Backend | Backend API Audit | Pending |
| NAB-P1-002 | Payments handler 1,058 lines monolithic - webhook + verification mixed | Backend | Backend API Audit | Pending |
| NAB-P1-003 | Admin API client 399 lines god object - all API calls in one file | Backend | Backend API Audit | Pending |
| NAB-P1-004 | String-based action dispatch - no type safety between routes and handlers | Backend | Architecture Audit | Pending |
| NAB-P1-005 | No abandoned cart recovery automation - listing exists, no email/SMS recovery flow | Business Logic | Workflow Audit | Pending |
| NAB-P1-006 | No stock reservation expiry mechanism - abandoned checkout stock never released | Business Logic | Backend API Audit | Pending |
| NAB-P1-007 | Race conditions in stock/coupon handling - no optimistic locking | Business Logic | Backend API Audit | Pending |
| NAB-P1-008 | Partial refund amounts wrong - uses `order.total` instead of item calculations | Business Logic | Backend API Audit | Pending |
| NAB-P1-009 | Cart/checkout tax calculation mismatch in coupon scenarios | Business Logic | Backend API Audit | Pending |
| NAB-P1-010 | No order editing capability after creation | Business Logic | Workflow Audit | Pending |
| NAB-P1-011 | Support ticket detail page broken - route has no component | Frontend | Workflow Audit | Pending |
| NAB-P1-012 | Marketing admin page non-existent - backend API exists, no frontend UI | Frontend | Workflow Audit | Pending |
| NAB-P1-013 | Returns handler at wrong path (root instead of admin/) | Backend | Workflow Audit | Pending |
| NAB-P1-014 | Search index is in-memory only, resets on restart | Backend | Backend API Audit | Pending |
| NAB-P1-015 | No error monitoring (Sentry, DataDog) | Infrastructure | Backend API Audit | Pending |
| NAB-P1-016 | No structured logging or request ID tracking | Infrastructure | Backend API Audit | Pending |
| NAB-P1-017 | No health check endpoints | Infrastructure | Backend API Audit | Pending |
| NAB-P1-018 | Checkout page 895 lines monolithic - no step progress indicator | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P1-019 | Toast system accessibility failures - color-only states, bottom nav overlap | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P1-020 | No dark mode infrastructure despite defined gradients | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P1-021 | MobileNav Wishlist icon links to Collections (navigation bug) | Frontend | Frontend UI/UX Audit | Pending |

---

## Detailed Implementation Plans

### NAB-P1-001: Auth Handler 1,194 Lines Monolithic

**Issue:** Auth handler is 1,194 lines in a single file, making it difficult to maintain and test.

**Impact:** High maintainability issue - difficult to understand, test, and modify auth logic.

**Root Cause:** All auth functionality (register, login, password, email, sessions, profile) in one file.

**Implementation Steps:**

1. **Analyze Auth Handler Structure**
   - Identify distinct auth functions
   - Map dependencies between functions
   - Identify shared utilities

2. **Split Into Modules**
   - `auth/register.ts` - Registration logic
   - `auth/login.ts` - Login logic
   - `auth/password.ts` - Password reset/change
   - `auth/email.ts` - Email verification
   - `auth/sessions.ts` - Session management
   - `auth/profile.ts` - Profile management
   - `auth/shared.ts` - Shared utilities

3. **Refactor Each Module**
   - Extract related functions
   - Add proper imports/exports
   - Ensure each module < 300 lines

4. **Update Imports**
   - Update main auth handler to import from modules
   - Update route handlers
   - Update middleware

5. **Add Unit Tests**
   - Test each module independently
   - Test module interactions
   - Test auth flow end-to-end

6. **Testing**
   - Test registration flow
   - Test login flow
   - Test password reset
   - Test email verification
   - Test session management

**Files to Modify:**
- `src/handlers/auth.ts` (split into modules)
- Route handlers
- Middleware

**Estimated Effort:** 4 days (32 hours)

**Dependencies:** None

**Rollback Plan:** Revert to monolithic auth handler.

**Acceptance Criteria:**
- Auth handler split into 6 modules
- Each module < 300 lines
- Unit tests for each auth module
- Auth middleware updated to use new modules
- All auth flows working correctly

---

### NAB-P1-002: Payments Handler 1,058 Lines Monolithic

**Issue:** Payments handler is 1,058 lines with webhook and verification logic mixed together.

**Impact:** High maintainability issue - difficult to understand payment flow and debug issues.

**Root Cause:** Payment creation, webhook handling, and verification all in one file.

**Implementation Steps:**

1. **Analyze Payments Handler Structure**
   - Identify payment creation logic
   - Identify webhook handling logic
   - Identify verification logic
   - Identify shared utilities

2. **Split Into Modules**
   - `payments/creation.ts` - Payment creation
   - `payments/webhook.ts` - Webhook handling
   - `payments/verification.ts` - Payment verification
   - `payments/refund.ts` - Refund logic
   - `payments/shared.ts` - Shared utilities

3. **Refactor Each Module**
   - Extract related functions
   - Add proper imports/exports
   - Ensure each module < 300 lines

4. **Extract Notification Logic**
   - Move notification logic to shared utilities
   - Make notification reusable

5. **Add Unit Tests**
   - Test payment creation
   - Test webhook handling
   - Test payment verification
   - Test refund logic

6. **Testing**
   - Test payment creation flow
   - Test webhook processing
   - Test payment verification
   - Test refund processing

**Files to Modify:**
- `src/handlers/payments.ts` (split into modules)
- Route handlers
- Notification logic

**Estimated Effort:** 4 days (32 hours)

**Dependencies:** None

**Rollback Plan:** Revert to monolithic payments handler.

**Acceptance Criteria:**
- Payments handler split into 4 modules
- Each module < 300 lines
- Unit tests for each payment module
- Notification logic extracted to shared utilities
- All payment flows working correctly

---

### NAB-P1-003: Admin API Client 399 Lines God Object

**Issue:** Admin API client is 399 lines with all API calls in one file (god object pattern).

**Impact:** High maintainability issue - difficult to find and modify specific API calls.

**Root Cause:** All admin API calls grouped in a single file without domain separation.

**Implementation Steps:**

1. **Analyze Admin API Client**
   - Identify API call domains (products, orders, users, etc.)
   - Map API calls to domains
   - Identify shared utilities

2. **Split Into Domain Modules**
   - `admin/products.ts` - Product-related APIs
   - `admin/orders.ts` - Order-related APIs
   - `admin/users.ts` - User-related APIs
   - `admin/analytics.ts` - Analytics APIs
   - `admin/shared.ts` - Shared utilities

3. **Refactor Each Module**
   - Extract domain-specific API calls
   - Add proper imports/exports
   - Ensure each module < 150 lines

4. **Add Barrel Exports**
   - Create index file for clean imports
   - Export all domain modules
   - Maintain backward compatibility

5. **Add Unit Tests**
   - Test each domain module
   - Test API call interactions

6. **Testing**
   - Test all admin API calls
   - Test imports from new structure
   - Test backward compatibility

**Files to Modify:**
- `src/lib/admin.ts` (split into domain modules)
- Files importing admin API client

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** Revert to god object structure.

**Acceptance Criteria:**
- Admin API client split into domain modules
- Each module < 150 lines
- Barrel exports added for clean imports
- All admin API calls working correctly
- Backward compatibility maintained

---

### NAB-P1-004: String-Based Action Dispatch

**Issue:** Action dispatch uses strings instead of typed constants, no type safety between routes and handlers.

**Impact:** High type safety issue - runtime errors possible, no compile-time checking.

**Root Cause:** String literals used for action types instead of typed constants.

**Implementation Steps:**

1. **Identify All Action Strings**
   - Search for action dispatch calls
   - List all action type strings
   - Identify action payload types

2. **Create Typed Action Constants**
   - File: `src/actions/types.ts`
   - Define action type constants
   - Define action payload interfaces
   - Use TypeScript discriminated unions

3. **Replace String Literals with Constants**
   - Update all action dispatch calls
   - Use typed constants instead of strings
   - Add type annotations

4. **Create Action Creators**
   - File: `src/actions/creators.ts`
   - Create typed action creator functions
   - Ensure type safety
   - Add JSDoc comments

5. **Update Route Handlers**
   - Use action creators instead of raw dispatch
   - Add type checking
   - Remove string literals

6. **Testing**
   - Test action dispatch with typed constants
   - Test type safety
   - Test action creators
   - Verify no runtime errors

**Files to Modify:**
- `src/actions/types.ts` (create)
- `src/actions/creators.ts` (create)
- All files with action dispatch
- Route handlers

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** Revert to string-based dispatch.

**Acceptance Criteria:**
- Typed action constants defined
- Action creators implemented
- All string literals replaced with constants
- Type safety enforced at compile time
- No runtime type errors

---

### NAB-P1-005: No Abandoned Cart Recovery Automation

**Issue:** Abandoned cart listing exists but no email/SMS recovery flow implemented.

**Impact:** High revenue impact - lost sales from abandoned carts.

**Root Cause:** Recovery automation not implemented.

**Implementation Steps:**

1. **Define Recovery Strategy**
   - Define abandoned cart threshold (e.g., 24 hours)
   - Define recovery schedule (e.g., 24h, 48h, 72h)
   - Define email/SMS templates

2. **Create Recovery Job**
   - File: `src/jobs/cartRecovery.ts`
   - Query abandoned carts
   - Check if recovery already sent
   - Send recovery email/SMS

3. **Implement Email Templates**
   - Create abandoned cart email template
   - Include cart items
   - Include recovery link
   - Personalize with user data

4. **Implement SMS Templates**
   - Create abandoned cart SMS template
   - Include recovery link
   - Keep short and actionable

5. **Add Tracking**
   - Track recovery sends
   - Track recovery clicks
   - Track recovery conversions

6. **Testing**
   - Test recovery job execution
   - Test email delivery
   - Test SMS delivery
   - Test tracking

**Files to Modify:**
- `src/jobs/cartRecovery.ts` (create)
- Email templates
- SMS templates
- Cart model (add recovery tracking)

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** Email service (Resend), SMS service.

**Rollback Plan:** Disable recovery job.

**Acceptance Criteria:**
- Recovery job implemented and scheduled
- Email templates created and tested
- SMS templates created and tested
- Recovery tracking implemented
- Recovery automation active

---

### NAB-P1-006: No Stock Reservation Expiry Mechanism

**Issue:** Stock reserved during checkout never expires, leading to inventory lockup.

**Impact:** High inventory impact - stock locked indefinitely from abandoned checkouts.

**Root Cause:** No expiry mechanism for stock reservations.

**Implementation Steps:**

1. **Define Reservation Policy**
   - Define reservation duration (e.g., 30 minutes)
   - Define expiry check frequency (e.g., every 5 minutes)

2. **Add Reservation Expiry Field**
   - Add `reservedUntil` field to inventory
   - Set reservation on checkout start
   - Update reservation on activity

3. **Create Expiry Job**
   - File: `src/jobs/stockReservationExpiry.ts`
   - Query expired reservations
   - Release stock back to inventory
   - Update reservation status

4. **Update Checkout Flow**
   - Set reservation on checkout start
   - Update reservation on activity
   - Release reservation on completion/abandonment

5. **Add Monitoring**
   - Log reservation expirations
   - Monitor reservation count
   - Alert on high reservation count

6. **Testing**
   - Test reservation creation
   - Test reservation expiry
   - Test checkout completion
   - Test checkout abandonment

**Files to Modify:**
- Inventory model (add reservedUntil)
- `src/jobs/stockReservationExpiry.ts` (create)
- Checkout logic
- Job scheduling

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** Job scheduling infrastructure.

**Rollback Plan:** Disable expiry job, remove reservation field.

**Acceptance Criteria:**
- Reservation expiry field added
- Expiry job implemented and scheduled
- Checkout flow updated
- Stock released on expiry
- Monitoring active

---

### NAB-P1-007: Race Conditions in Stock/Coupon Handling

**Issue:** Race conditions in stock and coupon handling without optimistic locking.

**Impact:** High data integrity issue - overselling, coupon abuse.

**Root Cause:** No locking mechanism for concurrent updates.

**Implementation Steps:**

1. **Identify Race Condition Points**
   - Stock updates during order placement
   - Coupon usage during checkout
   - Inventory adjustments

2. **Implement Optimistic Locking**
   - Add version column to inventory
   - Add version column to coupons
   - Check version before update
   - Increment version on update

3. **Implement Pessimistic Locking (Alternative)**
   - Use SELECT FOR UPDATE for critical operations
   - Lock rows during transaction
   - Release lock on commit/rollback

4. **Add Retry Logic**
   - Retry on version mismatch
   - Implement exponential backoff
   - Log retry attempts

5. **Add Queue for Updates**
   - Implement job queue for stock updates
   - Process updates sequentially
   - Add retry logic

6. **Testing**
   - Test concurrent stock updates
   - Test concurrent coupon usage
   - Test retry logic
   - Verify data integrity

**Files to Modify:**
- Inventory model (add version)
- Coupon model (add version)
- Stock update logic
- Coupon usage logic

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** May require job queue library.

**Rollback Plan:** Remove locking mechanism.

**Acceptance Criteria:**
- Optimistic locking implemented
- Version columns added
- Retry logic implemented
- Race conditions eliminated
- Data integrity verified

---

### NAB-P1-008: Partial Refund Amounts Wrong

**Issue:** Partial refund amounts use `order.total` instead of item calculations.

**Impact:** High financial impact - incorrect refund amounts.

**Root Cause:** Refund calculation logic uses wrong base amount.

**Implementation Steps:**

1. **Audit Refund Calculation**
   - Identify refund calculation logic
   - Identify where `order.total` is used
   - Identify correct calculation method

2. **Fix Refund Calculation**
   - Calculate refund based on returned items
   - Calculate refund based on item prices
   - Calculate refund based on quantities
   - Account for discounts and taxes

3. **Update Refund Logic**
   - File: `src/handlers/refunds.ts` or similar
   - Implement correct calculation
   - Add validation
   - Add error handling

4. **Add Refund Validation**
   - Validate refund amount doesn't exceed item total
   - Validate refund amount is positive
   - Validate refund is for returned items

5. **Add Logging**
   - Log refund calculations
   - Log refund amounts
   - Log refund reasons

6. **Testing**
   - Test partial refund calculation
   - Test full refund calculation
   - Test refund validation
   - Verify correct amounts

**Files to Modify:**
- Refund handler
- Refund calculation logic
- Order model

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Revert to previous calculation.

**Acceptance Criteria:**
- Refund calculation based on items
- Correct refund amounts
- Validation implemented
- Logging active
- All refund scenarios tested

---

### NAB-P1-009: Cart/Checkout Tax Calculation Mismatch

**Issue:** Tax calculation differs between cart and checkout in coupon scenarios.

**Impact:** High financial impact - incorrect tax amounts, customer confusion.

**Root Cause:** Different tax calculation logic in cart vs checkout.

**Implementation Steps:**

1. **Audit Tax Calculation**
   - Identify cart tax calculation logic
   - Identify checkout tax calculation logic
   - Identify differences
   - Identify coupon impact

2. **Unify Tax Calculation**
   - Create shared tax calculation utility
   - File: `src/utils/taxCalculator.ts`
   - Implement consistent logic
   - Handle coupon discounts correctly

3. **Update Cart Logic**
   - Use shared tax calculator
   - Update cart display
   - Update cart totals

4. **Update Checkout Logic**
   - Use shared tax calculator
   - Update checkout display
   - Update checkout totals

5. **Add Tax Validation**
   - Validate tax calculation consistency
   - Validate coupon impact
   - Add error handling

6. **Testing**
   - Test tax calculation in cart
   - Test tax calculation in checkout
   - Test with coupons
   - Test without coupons
   - Verify consistency

**Files to Modify:**
- `src/utils/taxCalculator.ts` (create)
- Cart logic
- Checkout logic
- Tax display components

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Revert to separate calculations.

**Acceptance Criteria:**
- Shared tax calculator implemented
- Cart and checkout use same logic
- Tax amounts consistent
- Coupon handling correct
- All scenarios tested

---

### NAB-P1-010: No Order Editing Capability

**Issue:** Orders cannot be edited after creation, limiting flexibility.

**Impact:** High UX impact - customers cannot modify orders, support burden.

**Root Cause:** Order editing functionality not implemented.

**Implementation Steps:**

1. **Define Order Edit Scope**
   - Define what can be edited (address, items, etc.)
   - Define edit time window (e.g., 1 hour)
   - Define edit constraints

2. **Create Order Edit Endpoint**
   - File: `src/handlers/orderEdit.ts`
   - Implement edit validation
   - Implement edit logic
   - Implement edit history tracking

3. **Update Order Model**
   - Add edit history field
   - Add edit status field
   - Add edit constraints

4. **Create Frontend Edit UI**
   - Create order edit page
   - Add edit form
   - Add edit confirmation
   - Add edit history display

5. **Add Notifications**
   - Notify customer of order changes
   - Notify admin of order changes
   - Send email confirmation

6. **Testing**
   - Test order editing
   - Test edit validation
   - Test edit constraints
   - Test notifications

**Files to Modify:**
- Order model
- Order handler
- Frontend order pages
- Notification logic

**Estimated Effort:** 4 days (32 hours)

**Dependencies:** None

**Rollback Plan:** Remove edit functionality.

**Acceptance Criteria:**
- Order edit endpoint implemented
- Frontend edit UI created
- Edit validation working
- Edit history tracked
- Notifications sent

---

### NAB-P1-011: Support Ticket Detail Page Broken

**Issue:** Support ticket detail page route has no component, page broken.

**Impact:** High admin UX impact - support team cannot view ticket details.

**Root Cause:** Component not created for ticket detail route.

**Implementation Steps:**

1. **Identify Route**
   - Locate ticket detail route
   - Identify expected component
   - Identify data requirements

2. **Create Ticket Detail Component**
   - File: `src/app/admin/support/[id]/page.tsx` or similar
   - Create ticket detail page
   - Display ticket information
   - Display ticket messages
   - Display ticket status

3. **Add Ticket Actions**
   - Add reply functionality
   - Add status update
   - Add ticket assignment
   - Add ticket closure

4. **Style According to Design System**
   - Use design system components
   - Match admin UI style
   - Ensure responsive design

5. **Add Loading States**
   - Add loading indicator
   - Add error handling
   - Add empty states

6. **Testing**
   - Test ticket detail page renders
   - Test ticket actions
   - Test loading states
   - Test error handling

**Files to Modify:**
- Ticket detail component (create)
- Ticket handler
- Admin navigation

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Remove component (not recommended).

**Acceptance Criteria:**
- Ticket detail page created
- Ticket information displayed
- Ticket actions working
- Styled according to design system
- All states handled

---

### NAB-P1-012: Marketing Admin Page Non-Existent

**Issue:** Marketing admin page backend API exists but no frontend UI.

**Impact:** High admin UX impact - marketing team cannot manage campaigns.

**Root Cause:** Frontend UI not created for marketing admin.

**Implementation Steps:**

1. **Review Backend API**
   - Identify marketing API endpoints
   - Identify data models
   - Identify API capabilities

2. **Create Marketing Admin Page**
   - File: `src/app/admin/marketing/page.tsx` or similar
   - Create marketing admin page
   - Display campaigns list
   - Add campaign creation form
   - Add campaign editing

3. **Implement Campaign Management**
   - List all campaigns
   - Create new campaign
   - Edit existing campaign
   - Delete campaign
   - Toggle campaign status

4. **Add Campaign Analytics**
   - Display campaign performance
   - Display engagement metrics
   - Display conversion metrics

5. **Style According to Design System**
   - Use design system components
   - Match admin UI style
   - Ensure responsive design

6. **Testing**
   - Test marketing page renders
   - Test campaign CRUD operations
   - Test analytics display
   - Test responsive design

**Files to Modify:**
- Marketing admin page (create)
- Marketing API client
- Admin navigation

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** Backend marketing API.

**Rollback Plan:** Remove marketing page.

**Acceptance Criteria:**
- Marketing admin page created
- Campaign CRUD operations working
- Campaign analytics displayed
- Styled according to design system
- All features tested

---

### NAB-P1-013: Returns Handler at Wrong Path

**Issue:** Returns handler is at root path instead of admin/ path.

**Impact:** High API organization issue - inconsistent routing.

**Root Cause:** Returns handler placed at wrong path during implementation.

**Implementation Steps:**

1. **Identify Current Path**
   - Locate returns handler
   - Identify current route
   - Identify callers

2. **Move to Admin Path**
   - Move handler to `src/handlers/admin/returns.ts`
   - Update route to `/admin/returns`
   - Update route registration

3. **Update All Callers**
   - Update frontend API calls
   - Update admin navigation
   - Update documentation

4. **Update Middleware**
   - Ensure admin middleware applied
   - Ensure authentication applied
   - Ensure authorization applied

5. **Testing**
   - Test new route
   - Test API calls
   - Test admin access
   - Test authorization

**Files to Modify:**
- Returns handler (move)
- Route registration
- Frontend API calls
- Admin navigation

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Revert to previous path.

**Acceptance Criteria:**
- Returns handler at admin/ path
- Route updated
- All callers updated
- Middleware applied
- All functionality working

---

### NAB-P1-014: Search Index In-Memory Only

**Issue:** Search index is in-memory only, resets on application restart.

**Impact:** High data loss issue - search index lost on restart, poor UX.

**Root Cause:** Search index not persisted to database or KV store.

**Implementation Steps:**

1. **Choose Persistence Strategy**
   - Option 1: Store in database
   - Option 2: Store in Cloudflare KV
   - Evaluate pros/cons

2. **Implement Persistence**
   - Update search index to use persistence
   - Save index on update
   - Load index on startup

3. **Update Index Building**
   - Build index from persisted data
   - Rebuild index on schedule
   - Handle index updates

4. **Add Index Monitoring**
   - Log index size
   - Log index rebuilds
   - Monitor index performance

5. **Testing**
   - Test index persistence
   - Test index rebuild
   - Test search functionality
   - Test restart scenarios

**Files to Modify:**
- Search index logic
- Database schema (if using DB)
- KV store configuration (if using KV)

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** Database or KV store.

**Rollback Plan:** Revert to in-memory index.

**Acceptance Criteria:**
- Search index persisted
- Index loads on startup
- Index saves on update
- Search functionality working
- Restart scenarios tested

---

### NAB-P1-015: No Error Monitoring

**Issue:** No error monitoring (Sentry, DataDog) for production errors.

**Impact:** High observability issue - cannot detect or debug production errors.

**Root Cause:** Error monitoring service not integrated.

**Implementation Steps:**

1. **Choose Error Monitoring Service**
   - Evaluate Sentry vs DataDog
   - Select service based on requirements
   - Create account

2. **Integrate Service**
   - Install SDK (e.g., `@sentry/nextjs`)
   - Configure SDK
   - Add to application

3. **Configure Error Capture**
   - Capture unhandled errors
   - Capture handled errors
   - Capture promise rejections
   - Capture performance data

4. **Add Context**
   - Add user context
   - Add request context
   - Add environment context
   - Add custom tags

5. **Configure Alerts**
   - Set up error alerts
   - Set up performance alerts
   - Configure notification channels

6. **Testing**
   - Test error capture
   - Test error reporting
   - Test alert configuration
   - Verify dashboard

**Files to Modify:**
- Package.json (add SDK)
- Application configuration
- Error handling code

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** Error monitoring service account.

**Rollback Plan:** Remove error monitoring integration.

**Acceptance Criteria:**
- Error monitoring integrated
- Errors captured and reported
- Context added to errors
- Alerts configured
- Dashboard verified

---

### NAB-P1-016: No Structured Logging or Request ID Tracking

**Issue:** No structured logging or request ID tracking, difficult to debug issues.

**Impact:** High observability issue - cannot trace requests through logs.

**Root Cause:** Structured logging not implemented, no request ID propagation.

**Implementation Steps:**

1. **Choose Logging Library**
   - Evaluate logging options (Winston, Pino, etc.)
   - Select appropriate library
   - Install library

2. **Implement Request ID Generation**
   - Generate unique request ID
   - Add request ID to request context
   - Propagate request ID through calls

3. **Implement Structured Logging**
   - Configure logging library
   - Define log format (JSON)
   - Add log levels
   - Add log fields

4. **Add Request ID to Logs**
   - Include request ID in all logs
   - Include user ID in logs
   - Include timestamp in logs
   - Include context in logs

5. **Configure Log Outputs**
   - Configure console logging
   - Configure file logging
   - Configure remote logging (if needed)

6. **Testing**
   - Test request ID generation
   - Test request ID propagation
   - Test structured logging
   - Verify log format

**Files to Modify:**
- Package.json (add logging library)
- Logging configuration
- Middleware (request ID)
- All log statements

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove structured logging.

**Acceptance Criteria:**
- Request ID generated and propagated
- Structured logging implemented
- Request ID in all logs
- Log format consistent
- All logs structured

---

### NAB-P1-017: No Health Check Endpoints

**Issue:** No health check endpoints for monitoring and load balancer checks.

**Impact:** High observability issue - cannot monitor application health.

**Root Cause:** Health check endpoints not implemented.

**Implementation Steps:**

1. **Define Health Check Levels**
   - Basic: application running
   - Detailed: include dependency status
   - Deep: include performance metrics

2. **Create Health Check Endpoint**
   - File: `src/app/api/health/route.ts` or similar
   - Endpoint: GET /api/health
   - Return application status
   - Return dependency status

3. **Check Dependencies**
   - Database connection
   - External API status
   - Disk space
   - Memory usage

4. **Configure Response Format**
   - Return JSON with status
   - Include timestamp
   - Include version
   - Include uptime

5. **Add Monitoring Integration**
   - Configure for load balancer checks
   - Set up monitoring alerts
   - Log health check failures

6. **Testing**
   - Test health check endpoint
   - Test with healthy dependencies
   - Test with unhealthy dependencies
   - Test response format

**Files to Modify:**
- Health check endpoint (create)
- Application configuration

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Remove health check endpoint.

**Acceptance Criteria:**
- Health check endpoint created
- Dependency checks implemented
- Response format defined
- Monitoring integrated
- All scenarios tested

---

### NAB-P1-018: Checkout Page 895 Lines Monolithic

**Issue:** Checkout page is 895 lines monolithic with no step progress indicator.

**Impact:** High UX issue - difficult to maintain, poor user experience.

**Root Cause:** All checkout logic in one component, no step indicator.

**Implementation Steps:**

1. **Analyze Checkout Page Structure**
   - Identify checkout steps
   - Identify step dependencies
   - Identify shared components

2. **Split Into Sub-Components**
   - `checkout/ShippingForm.tsx` - Shipping address
   - `checkout/BillingForm.tsx` - Billing info
   - `checkout/PaymentForm.tsx` - Payment method
   - `checkout/OrderSummary.tsx` - Order summary
   - `checkout/StepIndicator.tsx` - Progress indicator

3. **Create Step Progress Indicator**
   - Display current step
   - Display completed steps
   - Display remaining steps
   - Allow step navigation (where valid)

4. **Refactor Main Checkout Component**
   - Import sub-components
   - Manage step state
   - Handle step transitions
   - Keep < 300 lines

5. **Add Loading States**
   - Add loading indicator per step
   - Add error handling per step
   - Add validation per step

6. **Testing**
   - Test checkout flow
   - Test step navigation
   - Test step indicator
   - Test loading states
   - Test error handling

**Files to Modify:**
- Checkout page (split into components)
- Step indicator component (create)
- Sub-components (create)

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** Revert to monolithic checkout.

**Acceptance Criteria:**
- Checkout split into 5 sub-components
- Step progress indicator implemented
- Main component < 300 lines
- Step navigation working
- All states handled

---

### NAB-P1-019: Toast System Accessibility Failures

**Issue:** Toast system uses color-only states, overlaps bottom nav, accessibility failures.

**Impact:** High accessibility issue - violates WCAG guidelines, poor UX for screen readers.

**Root Cause:** Toast system not designed with accessibility in mind.

**Implementation Steps:**

1. **Audit Toast System**
   - Identify accessibility issues
   - Identify color-only states
   - Identify overlap issues
   - Identify screen reader issues

2. **Fix Color-Only States**
   - Add icons to toasts
   - Add text labels to toasts
   - Ensure sufficient color contrast
   - Add aria-labels

3. **Fix Bottom Nav Overlap**
   - Adjust toast positioning
   - Add spacing from bottom nav
   - Ensure toasts are always visible
   - Handle mobile vs desktop

4. **Add Screen Reader Support**
   - Add role="alert" or role="status"
   - Add aria-live regions
   - Add aria-atomic
   - Ensure announcements are read

5. **Add Keyboard Navigation**
   - Allow keyboard dismissal
   - Add focus management
   - Add escape key support

6. **Testing**
   - Test with screen reader
   - Test keyboard navigation
   - Test color contrast
   - Test positioning
   - Verify WCAG compliance

**Files to Modify:**
- Toast component
- Toast positioning
- Toast styling

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Revert to previous toast system.

**Acceptance Criteria:**
- Icons added to toasts
- Text labels added
- Bottom nav overlap fixed
- Screen reader support added
- Keyboard navigation added
- WCAG compliant

---

### NAB-P1-020: No Dark Mode Infrastructure

**Issue:** No dark mode infrastructure despite defined gradients in design system.

**Impact:** High UX issue - no dark mode option, inconsistent with design system.

**Root Cause:** Dark mode not implemented.

**Implementation Steps:**

1. **Define Dark Mode Strategy**
   - Define dark mode color palette
   - Define dark mode gradients
   - Define toggle mechanism
   - Define persistence (localStorage)

2. **Create Theme Context**
   - File: `src/contexts/ThemeContext.tsx`
   - Create theme provider
   - Manage theme state
   - Provide theme toggle

3. **Implement Dark Mode Styles**
   - Update design system with dark mode
   - Define dark mode variables
   - Apply dark mode to components
   - Ensure contrast ratios

4. **Add Theme Toggle**
   - Create theme toggle component
   - Add to header/navigation
   - Add icon (sun/moon)
   - Persist preference

5. **Update All Components**
   - Update components to use theme
   - Ensure dark mode compatibility
   - Test all components in both modes

6. **Testing**
   - Test light mode
   - Test dark mode
   - Test theme toggle
   - Test persistence
   - Verify all components

**Files to Modify:**
- Theme context (create)
- Design system
- All components
- Header/navigation

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** Remove dark mode.

**Acceptance Criteria:**
- Theme context implemented
- Dark mode styles defined
- Theme toggle added
- Preference persisted
- All components compatible

---

### NAB-P1-021: MobileNav Wishlist Icon Links to Collections

**Issue:** MobileNav Wishlist icon incorrectly links to Collections page instead of Wishlist.

**Impact:** High UX issue - navigation bug, user confusion.

**Root Cause:** Incorrect link in routing.

**Implementation Steps:**

1. **Identify Bug Location**
   - Locate MobileNav component
   - Identify Wishlist icon
   - Identify incorrect link

2. **Fix Link**
   - Update link to correct Wishlist page
   - Verify routing
   - Test navigation

3. **Verify Desktop Navigation**
   - Check desktop nav has correct link
   - Ensure consistency
   - Test both mobile and desktop

4. **Testing**
   - Test mobile navigation
   - Test desktop navigation
   - Test wishlist link
   - Verify correct page

**Files to Modify:**
- MobileNav component
- Navigation configuration

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Revert link (not recommended).

**Acceptance Criteria:**
- Wishlist icon links to Wishlist page
- Mobile navigation working
- Desktop navigation working
- Both consistent

---

## Sprint Planning

### Sprint 4: Architecture Refactoring (Week 5)

**Goal:** Split monolithic handlers and improve type safety.

**Issues:**
- NAB-P1-001: Auth handler monolithic
- NAB-P1-002: Payments handler monolithic
- NAB-P1-003: Admin API client god object
- NAB-P1-004: String-based action dispatch

**Estimated Effort:** 4 days (32 hours)

**Deliverable:** Architecture refactored, type safety improved

**Acceptance Criteria:**
- Auth handler split into 6 modules
- Payments handler split into 4 modules
- Admin API client split into domain modules
- Typed action dispatch implemented

---

### Sprint 5: Business Logic - Revenue Recovery (Week 6)

**Goal:** Implement revenue optimization features.

**Issues:**
- NAB-P1-005: Abandoned cart recovery
- NAB-P1-006: Stock reservation expiry
- NAB-P1-007: Race conditions
- NAB-P1-008: Partial refund calculation
- NAB-P1-009: Tax calculation mismatch

**Estimated Effort:** 4 days (32 hours)

**Deliverable:** Revenue recovery live, refunds accurate

**Acceptance Criteria:**
- Abandoned cart recovery automation active
- Stock reservation expires after 30 minutes
- Race conditions eliminated
- Partial refunds calculate correctly
- Tax calculation consistent

---

### Sprint 6: Business Logic & Admin Operations (Week 7)

**Goal:** Fix admin workflows and business logic.

**Issues:**
- NAB-P1-010: Order editing capability
- NAB-P1-011: Support ticket detail page
- NAB-P1-012: Marketing admin page
- NAB-P1-013: Returns handler path
- NAB-P1-014: Search index persistence

**Estimated Effort:** 4 days (32 hours)

**Deliverable:** Admin workflows functional, search index persisted

**Acceptance Criteria:**
- Order editing implemented
- Support ticket detail page working
- Marketing admin page created
- Returns handler at correct path
- Search index persisted

---

### Sprint 7: Observability & Frontend (Week 8)

**Goal:** Add monitoring and fix frontend UX.

**Issues:**
- NAB-P1-015: Error monitoring
- NAB-P1-016: Structured logging
- NAB-P1-017: Health check endpoints
- NAB-P1-018: Checkout page monolithic
- NAB-P1-019: Toast accessibility
- NAB-P1-020: Dark mode infrastructure
- NAB-P1-021: MobileNav navigation bug

**Estimated Effort:** 5 days (40 hours)

**Deliverable:** Observability in place, frontend UX improved

**Acceptance Criteria:**
- Error monitoring integrated
- Structured logging implemented
- Health check endpoints active
- Checkout page split
- Toast system accessible
- Dark mode implemented
- Navigation bug fixed

---

## Testing Strategy

### Architecture Testing
- Module integration tests
- Type safety verification
- API contract tests
- Backward compatibility tests

### Business Logic Testing
- Revenue recovery flow tests
- Stock reservation tests
- Refund calculation tests
- Tax calculation tests
- Race condition tests

### Admin Operations Testing
- Admin workflow tests
- Navigation tests
- Permission tests
- Search index tests

### Observability Testing
- Error capture tests
- Log format verification
- Health check tests
- Alert configuration tests

### Frontend Testing
- Component tests
- Accessibility tests (WCAG)
- Theme tests
- Navigation tests

---

## Risk Assessment

### High Risk Items
- **NAB-P1-001 (Auth Handler):** Core authentication change, regression risk high
- **NAB-P1-002 (Payments Handler):** Financial impact, requires careful testing
- **NAB-P1-007 (Race Conditions):** Complex to test thoroughly
- **NAB-P1-008 (Refund Calculation):** Financial impact, must be accurate

### Mitigation Strategies
- Comprehensive testing before deployment
- Staged rollout (canary deployment)
- Feature flags for critical changes
- Rollback plans for each issue
- Monitoring and alerting

---

## Success Criteria

All P1 issues are considered resolved when:

1. **Architecture Refactoring:** Handlers split, type safety improved
2. **Business Logic:** Revenue features live, calculations accurate
3. **Admin Operations:** All admin workflows functional
4. **Observability:** Error monitoring, logging, health checks active
5. **Frontend:** UX improved, accessibility compliant

---

## Next Steps

After completing P1 issues:
1. Proceed to P2 issues (medium priority)
2. Conduct regression testing
3. Update documentation
4. Train team on new architecture
5. Establish ongoing monitoring

---

**Document Version:** 1.0
**Last Updated:** 2026-07-07
**Owner:** Development Team
**Reviewers:** QA Team, Product Team
