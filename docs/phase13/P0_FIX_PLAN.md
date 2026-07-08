# P0 Fix Plan - Critical Issues
**Project:** Nabome
**Phase:** 13 - Implementation Planning
**Priority Level:** P0 (Critical - Blocker)
**Total P0 Issues:** 20
**Target Completion:** Sprint 0-3 (Weeks 1-4)

---

## Executive Summary

This document outlines the implementation plan for all 20 P0 (critical) issues identified across the Nabome codebase from the comprehensive audit reports. These issues represent blockers that must be resolved before the application can be considered production-ready. All P0 issues have direct impact on security, performance, legal compliance, or core functionality.

**Key Statistics:**
- **Total P0 Issues:** 20
- **Security Issues:** 7 (CVSS 10.0-7.0)
- **Performance Issues:** 3
- **Testing & Quality Issues:** 2
- **Legal Compliance Issues:** 6
- **Database Issues:** 2
- **Estimated Effort:** 25 person-days (5 weeks)
- **Target Timeline:** 4 weeks (Sprint 0-3)

---

## Issue Inventory

| ID | Issue | CVSS/Impact | Component | Source Report | Status |
|----|-------|-------------|-----------|---------------|--------|
| NAB-P0-001 | Production secrets committed to `.env` | 10.0 | Security | Security Audit | Pending |
| NAB-P0-002 | CSRF verification imported but never called on mutation endpoints | 9.0 | API Security | Security Audit | Pending |
| NAB-P0-003 | JWT tokens stored in localStorage (XSS vulnerable) | 8.5 | Auth Security | Security Audit | Pending |
| NAB-P0-004 | No webhook idempotency - Razorpay hooks can double-process payments | 8.5 | Payment Security | Security Audit | Pending |
| NAB-P0-005 | 95% of endpoints use raw `req.json()` without validation | 8.0 | API Security | Security Audit | Pending |
| NAB-P0-006 | Rate limiting silently falls open on KV miss | 7.5 | API Security | Security Audit | Pending |
| NAB-P0-007 | Widespread type-safety bypasses (92 `as never` + ~308 `any`) | 7.0 | Code Quality | Security Audit | Pending |
| NAB-P0-008 | 13.6s TTFB on homepage - No Smart Placement, no Hyperdrive | Critical | Performance | Production Audit | Pending |
| NAB-P0-009 | No Hyperdrive binding for database connections (150-500ms cold start penalty) | High | Performance | Production Audit | Pending |
| NAB-P0-010 | Unbounded queries in analytics/exports will OOM at scale | Critical | Performance | Database Audit | Pending |
| NAB-P0-011 | Test coverage at 9.7% (34 tests for 351 source files) | 9.7% | Testing | Code Quality Audit | Pending |
| NAB-P0-012 | CI/CD has no linting, testing, or security scanning steps | None | CI/CD | Code Quality Audit | Pending |
| NAB-P0-013 | No privacy policy page (GDPR, India DPDP Act non-compliance) | GDPR/DPDP | Legal | Launch Readiness | Pending |
| NAB-P0-014 | No terms & conditions page | Legal | Legal | Launch Readiness | Pending |
| NAB-P0-015 | No cookie policy/consent banner | GDPR | Legal | Launch Readiness | Pending |
| NAB-P0-016 | No return policy page | Legal | Legal | Launch Readiness | Pending |
| NAB-P0-017 | No shipping policy page | Legal | Legal | Launch Readiness | Pending |
| NAB-P0-018 | No refund policy page | Legal | Legal | Launch Readiness | Pending |
| NAB-P0-019 | Schema drift - CampaignType/SectionType enums out of sync with database | Data Integrity | Database | Database Audit | Pending |
| NAB-P0-020 | No cart expiration mechanism - abandoned carts accumulate unboundedly | Storage/Performance | Database | Database Audit | Pending |

---

## Detailed Implementation Plans

### NAB-P0-001: Production Secrets Committed to `.env` (CVSS 10.0)

**Issue:** Production secrets (Supabase service role key, Neon DB password, Cloudinary secret, Razorpay secret, Resend key) are committed to `.env` file in git repository.

**Impact:** Critical security vulnerability (CVSS 10.0)
- All production credentials exposed in version control
- Unauthorized access to all third-party services
- Potential data breach and financial loss
- GDPR/DPDP compliance violation

**Root Cause:** Developers committed `.env` file with real production secrets instead of using environment variables or secrets management.

**Implementation Steps:**

1. **Immediate Emergency Actions (Sprint 0 - Day 1)**
   - Rotate all exposed production secrets immediately
   - Supabase service role key
   - Neon database password
   - Cloudinary API secret
   - Razorpay secret key
   - Resend API key

2. **Clean Git History**
   - Use BFG Repo-Cleaner or `git filter-branch` to remove secrets from history
   - Force push cleaned history
   - Notify all team members to re-clone repository

3. **Move to Cloudflare Pages Secrets**
   - Add all secrets to Cloudflare Pages environment variables
   - Remove `.env` file from repository
   - Ensure `.env` is in `.gitignore`
   - Create `.env.example` with placeholder values

4. **Update Code to Use Environment Variables**
   - Update all code to read from `process.env` or Cloudflare env
   - File: `src/config/index.js` or equivalent
   - Validate required environment variables on startup

5. **Add Pre-commit Hook**
   - Install husky: `npm install husky --save-dev`
   - Add pre-commit hook to check for secrets
   - Use git-secrets or similar tool to prevent future commits

6. **Document Secret Management Process**
   - Create secret rotation procedure
   - Document how to add new secrets
   - Document secret access controls

**Files to Modify:**
- `.env` (delete from git, add to .gitignore)
- `.env.example` (create with placeholders)
- `src/config/index.js` (update to use process.env)
- All files with hardcoded secrets
- `.gitignore` (ensure .env is ignored)
- `.husky/pre-commit` (add secret check hook)

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** Must coordinate with external service providers for key rotation.

**Rollback Plan:** Revert code changes (but keys should remain rotated for security).

**Acceptance Criteria:**
- All production secrets rotated and stored in Cloudflare Pages secrets
- Git history cleaned of sensitive data
- `.env` file removed from repository
- Pre-commit hook prevents future secret commits
- Application runs successfully with environment variables

---

### NAB-P0-002: CSRF Verification Imported But Never Called (CVSS 9.0)

**Issue:** CSRF verification function is imported in the codebase but never called on mutation endpoints (POST, PUT, DELETE).

**Impact:** Critical security vulnerability (CVSS 9.0)
- Cross-Site Request Forgery attacks possible
- Unauthorized actions can be performed on behalf of authenticated users
- State-changing operations can be triggered maliciously

**Root Cause:** CSRF middleware imported but not applied to routes.

**Implementation Steps:**

1. **Audit All Mutation Endpoints**
   - Identify all POST, PUT, DELETE endpoints
   - List endpoints that should have CSRF protection
   - Identify endpoints that should be exempt (public APIs)

2. **Apply CSRF Middleware to All Mutation Endpoints**
   - File: `src/middleware/csrf.ts` or similar
   - Add CSRF verification to all protected routes
   - Configure CSRF token generation and validation
   - Add CSRF token to frontend forms

3. **Configure CSRF Token Handling**
   - Generate CSRF token on session initialization
   - Include CSRF token in all forms (hidden input)
   - Include CSRF token in API requests (header or cookie)
   - Validate CSRF token on all mutation requests

4. **Add Public Route Whitelist**
   - Create list of endpoints exempt from CSRF
   - Public APIs (product listing, search）
   - Authentication endpoints (login, register)
   - Webhook endpoints

5. **Update Frontend to Include CSRF Tokens**
   - Update all forms to include CSRF token
   - Update API calls to include CSRF token in headers
   - Handle CSRF token refresh on session renewal

6. **Security Testing**
   - Test CSRF protection with forged requests
   - Test with valid CSRF token (should succeed)
   - Test with missing CSRF token (should fail)
   - Test with invalid CSRF token (should fail)

**Files to Modify:**
- `src/middleware/csrf.ts` (apply to routes)
- All route files with mutation endpoints
- Frontend form components
- API client configuration

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Remove CSRF middleware from routes.

**Acceptance Criteria:**
- CSRF verification active on all POST/PUT/DELETE endpoints
- Public APIs exempt from CSRF
- Frontend includes CSRF token in all forms
- CSRF token validation working correctly
- Security tests pass

---

### NAB-P0-003: JWT Tokens Stored in localStorage (XSS Vulnerable, CVSS 8.5)

**Issue:** JWT authentication tokens are stored in browser localStorage, making them vulnerable to XSS attacks.

**Impact:** Critical security vulnerability (CVSS 8.5)
- XSS attacks can steal JWT tokens from localStorage
- Attacker can impersonate authenticated users
- Session hijacking possible

**Root Cause:** Tokens stored in localStorage instead of httpOnly cookies.

**Implementation Steps:**

1. **Update Token Storage to httpOnly Cookies**
   - Change token storage from localStorage to httpOnly cookies
   - Set cookie flags: httpOnly, secure, sameSite
   - Configure cookie expiration

2. **Update Authentication Flow**
   - File: `src/controllers/auth.ts` or similar
   - Set httpOnly cookie on successful login
   - Clear cookie on logout
   - Implement token refresh with cookie rotation

3. **Update Frontend Token Handling**
   - Remove localStorage token access
   - Update API client to not send token from localStorage
   - Cookie will be sent automatically by browser

4. **Add CSRF Protection for Cookie-Based Auth**
   - Since using cookies, CSRF protection is critical
   - Ensure NAB-P0-002 is completed first
   - Add CSRF token to all mutation requests

5. **Update Token Validation Middleware**
   - File: `src/middleware/auth.ts`
   - Read token from cookie instead of Authorization header
   - Validate token and set user context

6. **Testing**
   - Test login with cookie storage
   - Test token refresh
   - Test XSS attack scenarios (token should not be accessible)
   - Test logout (cookie cleared)

**Files to Modify:**
- `src/controllers/auth.ts`
- `src/middleware/auth.ts`
- Frontend auth components
- API client configuration
- Cookie configuration

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** NAB-P0-002 (CSRF protection) must be completed first.

**Rollback Plan:** Revert to localStorage token storage.

**Acceptance Criteria:**
- JWT tokens stored in httpOnly cookies
- Tokens not accessible via JavaScript
- Cookie flags set correctly (httpOnly, secure, sameSite)
- Authentication flow working with cookies
- XSS attacks cannot steal tokens

---

### NAB-P0-004: No Webhook Idempotency - Razorpay Hooks Can Double-Process Payments (CVSS 8.5)

**Issue:** Payment webhooks from Razorpay lack idempotency checks, allowing duplicate webhook events to double-process payments.

**Impact:** Critical security vulnerability (CVSS 8.5)
- Duplicate payment processing
- Financial loss from double-charging customers
- Order status inconsistencies
- Customer trust issues

**Root Cause:** No idempotency key or event tracking for webhook processing.

**Implementation Steps:**

1. **Create Webhook Events Table**
   - Add `webhook_events` table to database schema
   - Fields: id, event_id, event_type, processed_at, payload
   - Add unique constraint on `event_id`

2. **Implement Idempotency Check**
   - File: `src/controllers/payments.ts` or webhook handler
   - Before processing webhook, check if event_id already exists
   - If exists, skip processing (idempotent)
   - If not exists, process and record event_id

3. **Update Webhook Handler**
   - Extract event_id from Razorpay webhook
   - Check idempotency before processing
   - Record event in webhook_events table
   - Handle webhook signature verification

4. **Add Webhook Signature Verification**
   - Verify Razorpay webhook signature
   - Use Razorpay secret key
   - Reject webhooks with invalid signature

5. **Add Webhook Retry Logic**
   - Handle transient errors with retry
   - Implement exponential backoff
   - Log webhook processing failures

6. **Testing**
   - Test duplicate webhook events (should not double-process)
   - Test webhook signature verification
   - Test webhook retry logic
   - Test payment status updates

**Files to Modify:**
- Database schema (add webhook_events table)
- `src/controllers/payments.ts` or webhook handler
- `src/models/WebhookEvent.ts` (create)
- Payment processing logic

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** Database migration execution.

**Rollback Plan:** Remove idempotency check, revert to previous webhook handling.

**Acceptance Criteria:**
- Webhook events table created with unique constraint on event_id
- Idempotency check prevents duplicate processing
- Webhook signature verification implemented
- Duplicate webhook events skipped
- Payment processing idempotent

---

### NAB-P0-005: 95% of Endpoints Use Raw `req.json()` Without Validation (CVSS 8.0)

**Issue:** 95% of API endpoints use raw `req.json()` without input validation, allowing invalid or malicious data.

**Impact:** Critical security vulnerability (CVSS 8.0)
- Invalid data can corrupt database
- SQL injection possible
- XSS attacks possible
- Data integrity issues

**Root Cause:** No validation middleware or schema validation on endpoints.

**Implementation Steps:**

1. **Install Zod Validation Library**
   ```bash
   npm install zod
   ```

2. **Create Validation Schemas**
   - File: `src/validators/` directory
   - Create Zod schemas for all request bodies
   - Email validation, password validation, etc.
   - Common schemas in shared file

3. **Create Validation Middleware**
   - File: `src/middleware/validation.ts`
   - Create middleware to validate request body against Zod schema
   - Return 400 error with validation details on failure

4. **Apply Validation to All Mutation Endpoints**
   - Add validation middleware to all POST/PUT/DELETE endpoints
   - Define schema for each endpoint
   - Replace raw `req.json()` with validated data

5. **Add Input Sanitization**
   - Trim whitespace
   - Escape HTML entities
   - Remove dangerous characters
   - Normalize data formats

6. **Testing**
   - Test with invalid data (should fail with 400)
   - Test with valid data (should succeed)
   - Test with SQL injection attempts
   - Test with XSS attempts
   - Test validation error messages

**Files to Modify:**
- `src/validators/*.ts` (create schemas)
- `src/middleware/validation.ts` (create)
- All route files with mutation endpoints
- All controller files

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** None

**Rollback Plan:** Remove validation middleware from routes.

**Acceptance Criteria:**
- All mutation endpoints have Zod validation
- Validation middleware returns 400 on invalid data
- Input sanitization applied
- Security tests pass
- No raw `req.json()` without validation

---

### NAB-P0-006: Rate Limiting Silently Falls Open on KV Miss (CVSS 7.5)

**Issue:** Rate limiting implementation falls open (allows unlimited requests) when Cloudflare KV store is unavailable or misses.

**Impact:** Critical security vulnerability (CVSS 7.5)
- DDoS attacks possible when KV unavailable
- API abuse when KV misses
- No protection during KV outages

**Root Cause:** Rate limiting fails open instead of closed on KV miss.

**Implementation Steps:**

1. **Audit Rate Limiting Implementation**
   - Identify current rate limiting code
   - Locate KV store usage
   - Identify fail-open behavior

2. **Implement Fail-Closed Rate Limiting**
   - File: `src/middleware/rateLimit.ts` or similar
   - Change behavior to deny on KV miss
   - Log KV miss events for monitoring
   - Alert on repeated KV misses

3. **Add Fallback Rate Limiting**
   - Implement in-memory rate limit as fallback
   - Use in-memory limit when KV unavailable
   - Set stricter limits for in-memory fallback

4. **Configure Rate Limits**
   - General endpoints: 100 requests per 15 minutes per IP
   - Auth endpoints: 10 requests per minute per IP
   - Payment endpoints: 5 requests per minute per IP

5. **Add Monitoring**
   - Log rate limit violations
   - Log KV miss events
   - Alert on repeated violations
   - Track blocked IPs

6. **Testing**
   - Test normal usage (should not be blocked)
   - Test exceeding limits (should be blocked)
   - Test KV miss scenario (should deny)
   - Test different IP addresses
   - Test auth endpoints with stricter limits

**Files to Modify:**
- `src/middleware/rateLimit.ts`
- Rate limiting configuration
- Monitoring/alerting setup

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Revert to previous rate limiting implementation.

**Acceptance Criteria:**
- Rate limiting denies on KV miss (fail-closed)
- In-memory fallback implemented
- Rate limits configured correctly
- Monitoring active for KV misses
- Security tests pass

---

### NAB-P0-007: Widespread Type-Safety Bypasses (92 `as never` + ~308 `any`) (CVSS 7.0)

**Issue:** Codebase contains 92 instances of `as never` and ~308 instances of `any`, bypassing TypeScript type safety.

**Impact:** Security vulnerability (CVSS 7.0)
- Type safety bypassed
- Runtime errors possible
- Security vulnerabilities from untyped code
- Maintenance issues

**Root Cause:** Developers using type assertions to bypass TypeScript compiler.

**Implementation Steps:**

1. **Audit Type-Safety Bypasses**
   - Search for all `as never` instances
   - Search for all `any` instances
   - Categorize by severity and file
   - Identify critical security-related bypasses

2. **Fix Critical Security Bypasses First**
   - Focus on authentication, authorization, payment code
   - Replace `as never` with proper types
   - Replace `any` with specific types
   - Add proper type definitions

3. **Fix Remaining Bypasses**
   - Replace `as never` with proper types or error handling
   - Replace `any` with specific types or unknown
   - Add type guards where needed
   - Improve type definitions

4. **Enable Strict TypeScript Mode**
   - Update `tsconfig.json` to enable strict mode
   - Fix resulting type errors
   - Add `noImplicitAny`, `strictNullChecks`

5. **Add ESLint Rule**
   - Add `@typescript-eslint/no-explicit-any` rule
   - Add `@typescript-eslint/no-unsafe-assertions` rule
   - Configure rule severity

6. **Testing**
   - Run TypeScript compiler to verify no errors
   - Run tests to ensure no runtime issues
   - Test critical paths (auth, payments)

**Files to Modify:**
- All files with `as never` (92 files)
- All files with `any` (~308 instances)
- `tsconfig.json`
- ESLint configuration

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** Revert type changes (not recommended).

**Acceptance Criteria:**
- Type-safety bypasses reduced by 80%+
- Critical security code fully typed
- TypeScript strict mode enabled
- ESLint rules configured
- No TypeScript compilation errors
- Tests pass

---

### NAB-P0-008: 13.6s TTFB on Homepage - No Smart Placement, No Hyperdrive

**Issue:** Homepage Time to First Byte (TTFB) is 13.6 seconds due to lack of Cloudflare Smart Placement and Hyperdrive.

**Impact:** Critical performance issue
- Extremely slow page load
- Poor user experience
- High bounce rate
- SEO impact

**Root Cause:** No Smart Placement in Cloudflare, no Hyperdrive binding for database connections.

**Implementation Steps:**

1. **Enable Smart Placement in Cloudflare**
   - File: `wrangler.jsonc` or Cloudflare Pages config
   - Enable Smart Placement feature
   - Configure placement preferences
   - Deploy to test

2. **Add Hyperdrive Binding**
   - Create Hyperdrive config in Cloudflare
   - Add Hyperdrive binding to wrangler.jsonc
   - Update database connection to use Hyperdrive
   - Test connection

3. **Optimize Database Queries**
   - Profile homepage queries
   - Add indexes for common queries
   - Optimize query structure
   - Reduce query count

4. **Implement Edge Caching**
   - Cache homepage data at edge
   - Configure cache TTL
   - Implement cache invalidation
   - Use Cloudflare KV for caching

5. **Optimize Server-Side Rendering**
   - Reduce SSR time
   - Stream responses where possible
   - Optimize component rendering
   - Reduce data fetching

6. **Testing**
   - Measure TTFB after changes
   - Target: < 2s TTFB
   - Test with different geographic locations
   - Load test homepage

**Files to Modify:**
- `wrangler.jsonc` (Cloudflare config)
- Database connection code
- Homepage component
- Query optimization

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** Cloudflare account access, Hyperdrive setup.

**Rollback Plan:** Disable Smart Placement, remove Hyperdrive binding.

**Acceptance Criteria:**
- Smart Placement enabled in Cloudflare
- Hyperdrive binding configured
- TTFB reduced to < 2s
- Homepage loads quickly from all regions
- Cache working correctly

---

### NAB-P0-009: No Hyperdrive Binding for Database Connections (150-500ms Cold Start Penalty)

**Issue:** Database connections lack Hyperdrive binding, causing 150-500ms cold start penalty on each request.

**Impact:** High performance issue
- Slow API response times
- Poor user experience
- Increased latency

**Root Cause:** No Hyperdrive binding configured for database connections.

**Implementation Steps:**

1. **Create Hyperdrive Config**
   - Log in to Cloudflare dashboard
   - Create Hyperdrive configuration
   - Add Neon database connection details
   - Test connection

2. **Add Hyperdrive Binding to wrangler.jsonc**
   - Add binding to configuration
   - Set binding name
   - Configure connection pool settings

3. **Update Database Connection Code**
   - File: `src/config/database.ts` or similar
   - Update to use Hyperdrive binding
   - Remove direct Neon connection
   - Test connection

4. **Configure Connection Pooling**
   - Set appropriate pool size
   - Configure connection timeout
   - Set idle timeout
   - Monitor connection usage

5. **Test Database Operations**
   - Test query performance
   - Test connection pooling
   - Test cold start scenarios
   - Measure latency improvement

6. **Monitoring**
   - Log connection pool status
   - Monitor query latency
   - Alert on connection issues

**Files to Modify:**
- `wrangler.jsonc`
- `src/config/database.ts`
- Database connection code

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** Cloudflare Hyperdrive setup.

**Rollback Plan:** Remove Hyperdrive binding, revert to direct connection.

**Acceptance Criteria:**
- Hyperdrive binding configured
- Database uses Hyperdrive connection
- Cold start penalty eliminated
- Query latency improved
- Monitoring active

---

### NAB-P0-010: Unbounded Queries in Analytics/Exports Will OOM at Scale

**Issue:** Analytics and export queries are unbounded, will cause Out of Memory (OOM) errors at scale.

**Impact:** Critical performance issue
- Application crashes under load
- Data export failures
- Memory exhaustion
- Poor scalability

**Root Cause:** No pagination or limits on analytics/export queries.

**Implementation Steps:**

1. **Identify Unbounded Queries**
   - Search for analytics queries
   - Search for export queries
   - Identify queries without LIMIT
   - Identify queries without pagination

2. **Add Pagination to All Queries**
   - Add LIMIT clause to all queries
   - Add OFFSET for pagination
   - Configure default page size (e.g., 100)
   - Allow configurable page size

3. **Implement Streaming for Exports**
   - Stream export results instead of loading all into memory
   - Use cursor-based pagination
   - Implement chunked processing
   - Write to file incrementally

4. **Add Query Timeouts**
   - Set query timeout limits
   - Kill long-running queries
   - Log timeout events
   - Alert on timeouts

5. **Add Resource Limits**
   - Limit memory usage per query
   - Limit result set size
   - Implement query complexity analysis
   - Reject overly complex queries

6. **Testing**
   - Test with small datasets
   - Test with large datasets
   - Test memory usage
   - Test export functionality
   - Load test analytics endpoints

**Files to Modify:**
- Analytics query files
- Export query files
- Database query files

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Remove pagination limits (not recommended).

**Acceptance Criteria:**
- All queries have LIMIT clause
- Pagination implemented
- Streaming for exports
- Query timeouts configured
- Memory usage bounded
- No OOM errors under load

---

### NAB-P0-011: Test Coverage at 9.7% (34 Tests for 351 Source Files)

**Issue:** Test coverage is extremely low at 9.7% (34 tests for 351 source files).

**Impact:** Critical quality issue
- No confidence in code changes
- High regression risk
- Bugs not caught early
- Poor code quality

**Root Cause:** No testing culture, no CI/CD enforcement of tests.

**Implementation Steps:**

1. **Audit Current Test Coverage**
   - Run coverage report
   - Identify untested critical paths
   - Identify untested components
   - Prioritize testing based on risk

2. **Write Critical Path Tests**
   - Authentication flow tests
   - Checkout flow tests
   - Payment processing tests
   - Order management tests

3. **Add Unit Tests for Core Logic**
   - Business logic tests
   - Utility function tests
   - Validation tests
   - Database model tests

4. **Add Integration Tests**
   - API endpoint tests
   - Database integration tests
   - Third-party service integration tests

5. **Configure Test Framework**
   - Ensure Vitest is configured
   - Add test scripts to package.json
   - Configure coverage reporting
   - Set coverage targets

6. **Add Testing to CI/CD**
   - Add test step to CI/CD pipeline
   - Fail build if coverage below threshold
   - Set initial coverage target: 20%
   - Incrementally increase target

**Files to Modify:**
- Test files (create new)
- `package.json` (add test scripts)
- CI/CD configuration
- Vitest configuration

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** N/A (tests are additive).

**Acceptance Criteria:**
- Test coverage increased from 9.7% to 20%
- Critical paths tested
- Unit tests for core logic
- Integration tests for APIs
- CI/CD runs tests
- Coverage reporting active

---

### NAB-P0-012: CI/CD Has No Linting, Testing, or Security Scanning Steps

**Issue:** CI/CD pipeline lacks quality gates: no linting, no testing, no security scanning.

**Impact:** Critical quality issue
- Poor code quality reaches production
- Bugs not caught before deployment
- Security vulnerabilities not detected
- No automated quality checks

**Root Cause:** CI/CD pipeline not configured with quality gates.

**Implementation Steps:**

1. **Add Linting Step to CI/CD**
   - Add ESLint step
   - Add TypeScript type checking
   - Fail build on lint errors
   - Configure lint rules

2. **Add Testing Step to CI/CD**
   - Add unit test execution
   - Add integration test execution
   - Fail build on test failures
   - Generate coverage report

3. **Add Security Scanning Step to CI/CD**
   - Add `npm audit` for dependency vulnerabilities
   - Add Snyk or similar for security scanning
   - Fail build on high/critical vulnerabilities
   - Configure security policy

4. **Add Build Step**
   - Add production build
   - Fail build on build errors
   - Optimize build output

5. **Configure Quality Gates**
   - Linting must pass
   - Tests must pass
   - Coverage must meet threshold (20%)
   - Security scan must pass
   - Build must succeed

6. **Add Deployment Step**
   - Deploy to Cloudflare Pages on success
   - Configure deployment preview for PRs
   - Configure production deployment on main branch

**Files to Modify:**
- CI/CD configuration (GitHub Actions or similar)
- `package.json` (add scripts)
- ESLint configuration
- Security scanning configuration

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** NAB-P0-011 (tests) should be completed first.

**Rollback Plan:** Remove quality gates from CI/CD.

**Acceptance Criteria:**
- CI/CD includes linting step
- CI/CD includes testing step
- CI/CD includes security scanning
- Quality gates configured
- Build fails on quality gate failures
- Deployment automated on success

---

### NAB-P0-013: No Privacy Policy Page (GDPR, India DPDP Act Non-Compliance)

**Issue:** No privacy policy page, violating GDPR and India DPDP Act requirements.

**Impact:** Critical legal compliance issue
- GDPR non-compliance (fines up to 4% of global revenue)
- India DPDP Act non-compliance
- Cannot operate in regulated markets
- Legal liability

**Root Cause:** Privacy policy page not created.

**Implementation Steps:**

1. **Draft Privacy Policy**
   - Consult legal counsel for GDPR/DPDP compliance
   - Draft comprehensive privacy policy
   - Include data collection practices
   - Include data processing practices
   - Include user rights
   - Include cookie policy

2. **Create Privacy Policy Page**
   - File: `src/app/privacy-policy/page.tsx` or similar
   - Create privacy policy page component
   - Add privacy policy content
   - Style according to design system

3. **Add Privacy Policy Link to Footer**
   - Add link in footer
   - Make link prominent
   - Add to mobile footer

4. **Add Cookie Consent Banner**
   - Create cookie consent banner component
   - Show on first visit
   - Store user preference
   - Link to privacy policy

5. **Legal Review**
   - Have legal counsel review privacy policy
   - Ensure GDPR compliance
   - Ensure DPDP Act compliance
   - Update based on feedback

6. **Testing**
   - Test privacy policy page renders
   - Test footer link works
   - Test cookie consent banner
   - Test preference storage

**Files to Modify:**
- `src/app/privacy-policy/page.tsx` (create)
- Footer component
- Cookie consent component
- Navigation

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** Legal counsel review.

**Rollback Plan:** Remove privacy policy page (not recommended).

**Acceptance Criteria:**
- Privacy policy page created and accessible
- Privacy policy linked from footer
- Cookie consent banner implemented
- Privacy policy GDPR/DPDP compliant
- Legal review completed

---

### NAB-P0-014: No Terms & Conditions Page

**Issue:** No terms & conditions page, creating legal liability.

**Impact:** Critical legal compliance issue
- Legal liability
- No user agreement
- Cannot enforce terms
- Legal disputes risk

**Root Cause:** Terms & conditions page not created.

**Implementation Steps:**

1. **Draft Terms & Conditions**
   - Consult legal counsel
   - Draft comprehensive terms
   - Include service terms
   - Include user responsibilities
   - Include liability limitations
   - Include dispute resolution

2. **Create Terms & Conditions Page**
   - File: `src/app/terms/page.tsx` or similar
   - Create terms page component
   - Add terms content
   - Style according to design system

3. **Add Terms Link to Footer**
   - Add link in footer
   - Make link prominent
   - Add to mobile footer

4. **Add Terms Acceptance to Registration**
   - Add checkbox to registration form
   - Require acceptance to register
   - Store acceptance timestamp

5. **Legal Review**
   - Have legal counsel review terms
   - Update based on feedback
   - Ensure enforceability

6. **Testing**
   - Test terms page renders
   - Test footer link works
   - Test registration acceptance
   - Test acceptance storage

**Files to Modify:**
- `src/app/terms/page.tsx` (create)
- Footer component
- Registration component
- User model (add acceptance field)

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** Legal counsel review.

**Rollback Plan:** Remove terms page (not recommended).

**Acceptance Criteria:**
- Terms & conditions page created and accessible
- Terms linked from footer
- Terms acceptance on registration
- Terms legally reviewed
- Terms enforceable

---

### NAB-P0-015: No Cookie Policy/Consent Banner

**Issue:** No cookie policy or consent banner, violating GDPR requirements.

**Impact:** Critical legal compliance issue
- GDPR non-compliance
- No user consent for cookies
- Legal liability
- Cannot track users legally

**Root Cause:** Cookie policy and consent not implemented.

**Implementation Steps:**

1. **Draft Cookie Policy**
   - Consult legal counsel
   - Draft cookie policy
   - List all cookies used
   - Explain cookie purposes
   - Explain cookie lifetimes

2. **Create Cookie Policy Page**
   - File: `src/app/cookie-policy/page.tsx` or similar
   - Create cookie policy page component
   - Add cookie policy content
   - Style according to design system

3. **Create Cookie Consent Banner**
   - Create consent banner component
   - Show on first visit
   - Allow user to accept/decline
   - Allow granular consent (optional)
   - Store user preference

4. **Implement Cookie Management**
   - Respect user preferences
   - Only set cookies if consented
   - Provide cookie settings page
   - Allow revocation of consent

5. **Add Cookie Policy Link**
   - Add link in footer
   - Add link in consent banner
   - Make link prominent

6. **Testing**
   - Test cookie policy page renders
   - Test consent banner shows
   - Test consent acceptance
   - Test consent storage
   - Test cookie respect

**Files to Modify:**
- `src/app/cookie-policy/page.tsx` (create)
- Cookie consent banner component
- Cookie settings component
- Footer component
- Cookie management code

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** Legal counsel review.

**Rollback Plan:** Remove cookie consent (not recommended).

**Acceptance Criteria:**
- Cookie policy page created
- Cookie consent banner implemented
- User preferences stored
- Cookies respect consent
- Cookie policy linked
- GDPR compliant

---

### NAB-P0-016: No Return Policy Page

**Issue:** No return policy page, creating customer confusion and legal issues.

**Impact:** Critical legal compliance issue
- Customer confusion
- Legal liability
- No clear return process
- Disputes risk

**Root Cause:** Return policy page not created.

**Implementation Steps:**

1. **Draft Return Policy**
   - Define return window (e.g., 30 days)
   - Define return conditions
   - Define refund process
   - Define return shipping
   - Define exceptions

2. **Create Return Policy Page**
   - File: `src/app/return-policy/page.tsx` or similar
   - Create return policy page component
   - Add return policy content
   - Style according to design system

3. **Add Return Policy Link**
   - Add link in footer
   - Add link in checkout
   - Add link in order detail
   - Make link prominent

4. **Link Return Policy to Returns**
   - Link from return request flow
   - Show policy during return process
   - Reference policy in return confirmation

5. **Testing**
   - Test return policy page renders
   - Test footer link works
   - Test checkout link works
   - Test order detail link works

**Files to Modify:**
- `src/app/return-policy/page.tsx` (create)
- Footer component
- Checkout component
- Order detail component

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Remove return policy page (not recommended).

**Acceptance Criteria:**
- Return policy page created
- Return policy linked from footer
- Return policy linked from checkout
- Return policy linked from order detail
- Policy clear and comprehensive

---

### NAB-P0-017: No Shipping Policy Page

**Issue:** No shipping policy page, creating customer confusion.

**Impact:** Critical legal compliance issue
- Customer confusion
- No clear shipping terms
- Disputes risk
- Poor customer experience

**Root Cause:** Shipping policy page not created.

**Implementation Steps:**

1. **Draft Shipping Policy**
   - Define shipping regions
   - Define shipping times
   - Define shipping costs
   - Define shipping methods
   - Define tracking information

2. **Create Shipping Policy Page**
   - File: `src/app/shipping-policy/page.tsx` or similar
   - Create shipping policy page component
   - Add shipping policy content
   - Style according to design system

3. **Add Shipping Policy Link**
   - Add link in footer
   - Add link in checkout
   - Make link prominent

4. **Link Shipping Policy to Checkout**
   - Show shipping policy during checkout
   - Reference policy in shipping options
   - Display shipping times in checkout

5. **Testing**
   - Test shipping policy page renders
   - Test footer link works
   - Test checkout link works
   - Test shipping times display

**Files to Modify:**
- `src/app/shipping-policy/page.tsx` (create)
- Footer component
- Checkout component
- Shipping component

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Remove shipping policy page (not recommended).

**Acceptance Criteria:**
- Shipping policy page created
- Shipping policy linked from footer
- Shipping policy linked from checkout
- Shipping times displayed in checkout
- Policy clear and comprehensive

---

### NAB-P0-018: No Refund Policy Page

**Issue:** No refund policy page, creating customer confusion and legal issues.

**Impact:** Critical legal compliance issue
- Customer confusion
- Legal liability
- No clear refund process
- Disputes risk

**Root Cause:** Refund policy page not created.

**Implementation Steps:**

1. **Draft Refund Policy**
   - Define refund window
   - Define refund conditions
   - Define refund process
   - Define refund timeline
   - Define refund methods

2. **Create Refund Policy Page**
   - File: `src/app/refund-policy/page.tsx` or similar
   - Create refund policy page component
   - Add refund policy content
   - Style according to design system

3. **Add Refund Policy Link**
   - Add link in footer
   - Add link in order detail
   - Make link prominent

4. **Link Refund Policy to Refunds**
   - Link from refund request flow
   - Show policy during refund process
   - Reference policy in refund confirmation

5. **Testing**
   - Test refund policy page renders
   - Test footer link works
   - Test order detail link works
   - Test refund process link works

**Files to Modify:**
- `src/app/refund-policy/page.tsx` (create)
- Footer component
- Order detail component
- Refund component

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Remove refund policy page (not recommended).

**Acceptance Criteria:**
- Refund policy page created
- Refund policy linked from footer
- Refund policy linked from order detail
- Refund policy linked from refund flow
- Policy clear and comprehensive

---

### NAB-P0-019: Schema Drift - CampaignType/SectionType Enums Out of Sync with Database

**Issue:** CampaignType and SectionType enums in code are out of sync with database values, causing data integrity issues.

**Impact:** Critical data integrity issue
- Data corruption
- Application errors
- Inconsistent state
- Migration issues

**Root Cause:** Enums not synchronized between code and database.

**Implementation Steps:**

1. **Audit Enum Discrepancies**
   - Compare code enums with database values
   - Identify missing values in code
   - Identify missing values in database
   - Identify value mismatches

2. **Synchronize Enums**
   - Update code enums to match database
   - Or update database to match code
   - Decide on source of truth
   - Document enum values

3. **Create Migration**
   - Create database migration to sync enums
   - Add missing enum values to database
   - Or update database to match code
   - Handle existing data

4. **Update Prisma Schema**
   - Update Prisma schema with correct enum values
   - Run Prisma generate
   - Verify types match

5. **Add Enum Validation**
   - Add validation for enum values
   - Prevent invalid enum values
   - Add enum constants file

6. **Testing**
   - Test enum usage in code
   - Test database queries with enums
   - Test enum validation
   - Test migration

**Files to Modify:**
- Prisma schema
- Enum definition files
- Database migration
- Code using enums

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** Database migration execution.

**Rollback Plan:** Rollback migration, revert enum changes.

**Acceptance Criteria:**
- Enums synchronized between code and database
- Prisma schema updated
- Migration executed
- No enum mismatches
- Validation working

---

### NAB-P0-020: No Cart Expiration Mechanism - Abandoned Carts Accumulate Unboundedly

**Issue:** No cart expiration mechanism, causing abandoned carts to accumulate unboundedly in database.

**Impact:** Storage/Performance issue
- Database bloat
- Storage costs increase
- Query performance degradation
- Data cleanup needed

**Root Cause:** No cart expiration job or cleanup mechanism.

**Implementation Steps:**

1. **Define Cart Expiration Policy**
   - Define cart expiration time (e.g., 30 days inactive)
   - Define cleanup frequency (e.g., daily)
   - Define notification before expiration (optional)

2. **Add Cart Expiration Field**
   - Add `expiresAt` field to cart table
   - Set expiration on cart creation
   - Update expiration on cart activity

3. **Create Cleanup Job**
   - Create scheduled job to clean expired carts
   - Delete carts older than expiration
   - Archive carts if needed (optional)
   - Log cleanup statistics

4. **Implement Job Scheduling**
   - Use cron job or Cloudflare Cron Triggers
   - Schedule daily cleanup
   - Configure job timeout
   - Add error handling

5. **Add Monitoring**
   - Log cleanup job runs
   - Log number of carts cleaned
   - Alert on job failures
   - Monitor cart count

6. **Testing**
   - Test cart expiration logic
   - Test cleanup job
   - Test job scheduling
   - Test monitoring
   - Verify cart cleanup

**Files to Modify:**
- Prisma schema (add expiresAt field)
- Cleanup job file
- Job scheduling configuration
- Cart creation/update logic

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** Job scheduling infrastructure.

**Rollback Plan:** Disable cleanup job, remove expiration field.

**Acceptance Criteria:**
- Cart expiration field added
- Cleanup job implemented
- Job scheduled to run daily
- Expired carts cleaned up
- Monitoring active
- Cart count bounded

---

## Sprint Planning

### Sprint 0: Emergency Security Remediation (Week 1)

**Goal:** Address CVSS 10.0 and 9.0 security vulnerabilities immediately

**Issues:**
- NAB-P0-001: Production secrets committed to `.env` (CVSS 10.0)
- NAB-P0-002: CSRF verification imported but never called (CVSS 9.0)
- NAB-P0-006: Rate limiting silently falls open on KV miss (CVSS 7.5)

**Estimated Effort:** 3 days (24 hours)

**Deliverable:** Secrets secured, CSRF enforced, rate limiting hardened

**Acceptance Criteria:**
- All production secrets rotated and stored in Cloudflare Pages secrets
- Git history cleaned of sensitive data
- CSRF verification active on all POST/PUT/DELETE endpoints
- Rate limiting fails closed (deny on KV miss)

---

### Sprint 1: Critical Performance Fixes (Week 2)

**Goal:** Fix 13.6s TTFB and database performance

**Issues:**
- NAB-P0-008: 13.6s TTFB on homepage - No Smart Placement, no Hyperdrive
- NAB-P0-009: No Hyperdrive binding for database connections
- NAB-P0-010: Unbounded queries in analytics/exports
- NAB-P0-019: Schema drift - CampaignType/SectionType enums
- NAB-P0-020: No cart expiration mechanism

**Estimated Effort:** 3 days (24 hours)

**Deliverable:** TTFB < 2s, database optimized

**Acceptance Criteria:**
- Smart Placement enabled in wrangler.jsonc
- Hyperdrive binding configured and active
- Schema enums synchronized with database
- Cart expiration job running (cleanup carts > 30 days inactive)
- All queries have LIMIT clause

---

### Sprint 2: Testing Foundation (Week 3)

**Goal:** Establish test infrastructure and CI/CD quality gates

**Issues:**
- NAB-P0-011: Test coverage at 9.7%
- NAB-P0-012: CI/CD has no linting, testing, or security scanning

**Estimated Effort:** 4 days (32 hours)

**Deliverable:** CI/CD with quality gates, 20% test coverage

**Acceptance Criteria:**
- CI/CD pipeline includes ESLint, TypeScript check
- CI/CD pipeline runs Vitest unit tests
- CI/CD pipeline runs security audit (npm audit)
- Critical path tests cover auth, checkout, payment flows
- Test coverage increased from 9.7% to 20%

---

### Sprint 3: Legal Compliance & Security Hardening (Week 4)

**Goal:** Meet GDPR and India DPDP Act requirements, complete security fixes

**Issues:**
- NAB-P0-003: JWT tokens stored in localStorage (XSS vulnerable)
- NAB-P0-004: No webhook idempotency
- NAB-P0-005: 95% of endpoints use raw `req.json()` without validation
- NAB-P0-007: Widespread type-safety bypasses
- NAB-P0-013: No privacy policy page (GDPR/DPDP)
- NAB-P0-014: No terms & conditions page
- NAB-P0-015: No cookie policy/consent banner
- NAB-P0-016: No return policy page
- NAB-P0-017: No shipping policy page
- NAB-P0-018: No refund policy page

**Estimated Effort:** 5 days (40 hours)

**Deliverable:** All compliance pages live, security hardening complete

**Acceptance Criteria:**
- JWT tokens stored in httpOnly cookies
- Webhook idempotency implemented
- All mutation endpoints have Zod validation
- Type-safety bypasses reduced by 80%+
- Privacy policy page accessible from footer
- Terms & conditions page accessible from footer
- Cookie consent banner shows on first visit
- Return/shipping/refund policy pages linked appropriately
- Legal review completed for all policies

---

## Testing Strategy

### Security Testing
- Penetration testing for CSRF, XSS, SQL injection
- Webhook idempotency testing
- Rate limiting testing
- Token storage security testing

### Performance Testing
- TTFB measurement (target < 2s)
- Database query performance testing
- Load testing with concurrent users
- Memory usage testing for analytics/exports

### Legal Compliance Testing
- Privacy policy GDPR/DPDP compliance review
- Cookie consent functionality testing
- Policy page accessibility testing
- Terms acceptance flow testing

### Data Integrity Testing
- Schema synchronization verification
- Cart expiration job testing
- Enum validation testing
- Migration rollback testing

---

## Risk Assessment

### High Risk Items
- **NAB-P0-001 (Production Secrets):** Requires coordination with external services for key rotation
- **NAB-P0-003 (JWT in localStorage):** Core authentication change, regression risk high
- **NAB-P0-004 (Webhook Idempotency):** Financial impact, requires careful testing
- **NAB-P0-007 (Type-Safety Bypasses):** Large codebase changes, may introduce bugs

### Mitigation Strategies
- Comprehensive testing before deployment
- Staged rollout (canary deployment)
- Feature flags for critical changes
- Rollback plans for each issue
- Monitoring and alerting

---

## Success Criteria

All P0 issues are considered resolved when:

1. **Security Issues:** All CVSS 10.0-7.0 vulnerabilities patched, security audit passed
2. **Performance Issues:** TTFB < 2s, database optimized, no OOM errors
3. **Testing & Quality:** Test coverage 20%+, CI/CD with quality gates
4. **Legal Compliance:** All policy pages live, GDPR/DPDP compliant
5. **Database:** Schema synchronized, cart expiration active

---

## Next Steps

After completing P0 issues:
1. Proceed to P1 issues (high priority)
2. Conduct regression testing
3. Update documentation
4. Train team on new security practices
5. Establish ongoing security monitoring

---

**Document Version:** 2.0
**Last Updated:** 2026-07-07
**Owner:** Development Team
**Reviewers:** Security Team, QA Team, Legal Team
