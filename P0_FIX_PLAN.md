# P0 Critical Issues Fix Plan
**Phase 13: Audit Consolidation & Fix Planning**

## Overview
This plan addresses 42 critical issues (P0) that must be resolved before production launch. These issues span security, data integrity, launch blockers, performance, and compliance.

## Priority Classification
- **Security**: 12 issues
- **Data Integrity**: 8 issues
- **Launch Blockers**: 10 issues
- **Performance**: 6 issues
- **Compliance**: 6 issues

---

## SECURITY ISSUES (12)

### NAB-P0-001: Missing Rate Limiting on Authentication Endpoints
**Module**: Backend/Auth  
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Implementation Steps**:
1. Install rate limiting middleware (e.g., `express-rate-limit` or Cloudflare rate limiting)
2. Configure rate limits for `/api/auth/login` (5 requests per minute)
3. Configure rate limits for `/api/auth/register` (3 requests per hour)
4. Add rate limit headers to responses
5. Implement rate limit bypass for trusted IPs
6. Add monitoring for rate limit violations

**Files to Modify**:
- `api/_handlers/auth.ts`
- `api/_lib/auth-middleware.ts`
- `wrangler.jsonc` (for Cloudflare rate limiting)

**Validation**:
- Test brute force attack simulation
- Verify rate limit headers present
- Monitor rate limit logs

---

### NAB-P0-002: No Input Sanitization on File Upload Endpoints
**Module**: Backend/Cloudinary  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Install file validation library (e.g., `file-type`, `multer`)
2. Implement file type validation (allow only images: jpg, png, webp)
3. Add file size limits (max 5MB)
4. Implement virus scanning integration (Cloudinary auto-scan)
5. Add filename sanitization
6. Implement file content validation (magic bytes)

**Files to Modify**:
- `api/_lib/cloudinary.ts`
- `api/_handlers/brands.ts` (and other upload handlers)

**Validation**:
- Test malicious file upload attempts
- Verify file type enforcement
- Test file size limits

---

### NAB-P0-003: Missing CORS Configuration on API Routes
**Module**: Backend/API  
**Estimated Effort**: 2 hours  
**Dependencies**: None

**Implementation Steps**:
1. Install CORS middleware
2. Configure allowed origins (production domain, localhost for dev)
3. Configure allowed methods (GET, POST, PUT, DELETE, PATCH)
4. Configure allowed headers
5. Enable credentials support
6. Set CORS max age

**Files to Modify**:
- `api/_middleware.ts`
- `functions/api/_middleware.ts`

**Validation**:
- Test cross-origin requests from allowed domains
- Verify blocked requests from unauthorized domains
- Check preflight OPTIONS handling

---

### NAB-P0-004: No CSRF Protection on State-Changing Operations
**Module**: Frontend/Backend  
**Estimated Effort**: 8 hours  
**Dependencies**: NAB-P0-003

**Implementation Steps**:
1. Install CSRF token library (e.g., `csurf` or custom implementation)
2. Generate CSRF tokens on server
3. Pass CSRF tokens to frontend via cookies or headers
4. Include CSRF tokens in all state-changing requests
5. Validate CSRF tokens on server
6. Implement token refresh mechanism

**Files to Modify**:
- `api/_lib/auth-middleware.ts`
- `src/components/auth/` (auth components)
- `src/app/App.tsx` (global CSRF handling)

**Validation**:
- Test CSRF attack simulation
- Verify token validation
- Check token refresh flow

---

### NAB-P0-005: Admin Credentials Hardcoded in E2E Tests
**Module**: E2E Tests  
**Estimated Effort**: 2 hours  
**Dependencies**: None

**Implementation Steps**:
1. Remove hardcoded credentials from `e2e/admin-credentials.ts`
2. Create environment variable for test credentials
3. Add `.env.test` to `.gitignore`
4. Update test documentation
5. Add credential rotation instructions

**Files to Modify**:
- `e2e/admin-credentials.ts`
- `.gitignore`
- `.env.example`

**Validation**:
- Verify credentials not in git history
- Test with environment variables
- Check documentation updates

---

### NAB-P0-006: Missing Security Headers
**Module**: Cloudflare/Headers  
**Estimated Effort**: 3 hours  
**Dependencies**: None

**Implementation Steps**:
1. Configure Content Security Policy (CSP)
2. Add X-Frame-Options: DENY
3. Add X-Content-Type-Options: nosniff
4. Add X-XSS-Protection
5. Add Strict-Transport-Security (HSTS)
6. Add Referrer-Policy
7. Add Permissions-Policy

**Files to Modify**:
- `public/_headers`
- `functions/_middleware.ts`

**Validation**:
- Test security headers with security scanner
- Verify CSP policy enforcement
- Check HSTS preload eligibility

---

### NAB-P0-007: No API Key Rotation Mechanism
**Module**: Backend/Config  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Implement API key versioning
2. Create key rotation endpoint (admin only)
3. Add key expiration dates
4. Implement automatic key rotation
5. Add key deprecation period
6. Update documentation

**Files to Modify**:
- `api/_lib/` (config utilities)
- `api/_handlers/admin/` (admin endpoints)
- `.env.example`

**Validation**:
- Test key rotation flow
- Verify old keys still work during deprecation
- Check automatic rotation

---

### NAB-P0-008: Missing Audit Logging for Admin Actions
**Module**: Backend/Admin  
**Estimated Effort**: 8 hours  
**Dependencies**: NAB-P0-013

**Implementation Steps**:
1. Create audit log table in Prisma schema
2. Implement audit logging middleware
3. Log all admin actions (create, update, delete)
4. Add user context (who, when, what)
5. Create audit log viewer (admin only)
6. Implement log retention policy

**Files to Modify**:
- `prisma/schema.prisma`
- `api/_lib/audit.ts`
- `api/_handlers/admin/` (all admin handlers)
- `src/admin/` (admin UI)

**Validation**:
- Test audit logging for all admin actions
- Verify log viewer functionality
- Check retention policy

---

### NAB-P0-009: No Email Verification Enforcement
**Module**: Backend/Auth  
**Estimated Effort**: 6 hours  
**Dependencies**: NAB-P0-021

**Implementation Steps**:
1. Add `emailVerified` field to User model
2. Generate verification tokens on registration
3. Send verification emails
4. Block unverified users from certain actions
5. Implement verification token expiration
6. Add resend verification functionality

**Files to Modify**:
- `prisma/schema.prisma`
- `api/_handlers/auth.ts`
- `api/_lib/` (email utilities)

**Validation**:
- Test registration flow with verification
- Verify unverified user restrictions
- Test resend verification

---

### NAB-P0-010: Missing Password Strength Requirements
**Module**: Backend/Auth  
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Implementation Steps**:
1. Install password strength library (e.g., `zxcvbn`)
2. Implement password validation rules (min 8 chars, mixed case, numbers, symbols)
3. Add client-side validation feedback
4. Add server-side validation
5. Implement password strength meter UI
6. Update documentation

**Files to Modify**:
- `api/_handlers/auth.ts`
- `src/components/auth/` (auth forms)

**Validation**:
- Test weak password rejection
- Test strong password acceptance
- Verify UI feedback

---

### NAB-P0-011: No Session Timeout Mechanism
**Module**: Backend/Auth  
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Implementation Steps**:
1. Configure session expiration (24 hours)
2. Implement refresh token rotation
3. Add idle timeout (2 hours)
4. Implement session cleanup job
5. Add session warning UI (5 minutes before expiry)
6. Update documentation

**Files to Modify**:
- `api/_lib/auth-middleware.ts`
- `src/components/auth/` (session management)

**Validation**:
- Test session expiration
- Test refresh token rotation
- Verify idle timeout

---

### NAB-P0-012: Missing IP-Based Blocking for Failed Login Attempts
**Module**: Backend/Auth  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P0-001

**Implementation Steps**:
1. Track failed login attempts by IP
2. Implement IP blocking after 5 failed attempts (15 min)
3. Add CAPTCHA after 3 failed attempts
4. Implement IP whitelist for trusted IPs
5. Add admin notification for blocked IPs
6. Create IP unblock endpoint (admin only)

**Files to Modify**:
- `api/_handlers/auth.ts`
- `api/_lib/auth-middleware.ts`
- `src/admin/` (admin UI)

**Validation**:
- Test IP blocking after failed attempts
- Test CAPTCHA display
- Verify IP whitelist

---

## DATA INTEGRITY ISSUES (8)

### NAB-P0-013: No Foreign Key Constraints in Prisma Schema
**Module**: Database/Schema  
**Estimated Effort**: 12 hours  
**Dependencies**: None

**Implementation Steps**:
1. Audit all relationships in Prisma schema
2. Add foreign key constraints to all relations
3. Add cascade delete where appropriate
4. Add restrict delete where data integrity critical
5. Create migration for new constraints
6. Test migration on staging database
7. Run migration on production

**Files to Modify**:
- `prisma/schema.prisma`
- Create new migration

**Validation**:
- Test foreign key enforcement
- Test cascade delete behavior
- Test restrict delete behavior
- Verify no orphaned records

---

### NAB-P0-014: Missing Database Transaction Isolation Levels
**Module**: Database/Queries  
**Estimated Effort**: 6 hours  
**Dependencies**: NAB-P0-013

**Implementation Steps**:
1. Audit all database write operations
2. Wrap critical operations in transactions
3. Set appropriate isolation levels (READ COMMITTED for most)
4. Implement retry logic for transaction conflicts
5. Add transaction logging
6. Update documentation

**Files to Modify**:
- `api/_lib/` (database utilities)
- All API handlers with write operations

**Validation**:
- Test transaction rollback on errors
- Test concurrent operations
- Verify isolation level behavior

---

### NAB-P0-015: No Database Connection Pooling Configuration
**Module**: Database/Config  
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Implementation Steps**:
1. Configure connection pool in Prisma
2. Set pool size (min 2, max 10)
3. Configure connection timeout
4. Configure idle timeout
5. Add connection pool monitoring
6. Update documentation

**Files to Modify**:
- `prisma/schema.prisma`
- `.env.example`

**Validation**:
- Test under load
- Monitor connection pool metrics
- Verify no connection exhaustion

---

### NAB-P0-016: Missing Database Backup Strategy
**Module**: Database/Operations  
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Implementation Steps**:
1. Configure automated daily backups
2. Configure weekly full backups
3. Implement backup retention (30 days)
4. Implement backup encryption
5. Add backup integrity checks
6. Create backup restoration procedure
7. Test backup restoration

**Files to Modify**:
- `prisma/` (backup scripts)
- `.github/workflows/` (backup automation)

**Validation**:
- Test backup creation
- Test backup restoration
- Verify backup integrity

---

### NAB-P0-017: No Data Migration Rollback Strategy
**Module**: Database/Migrations  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Audit all existing migrations
2. Create rollback scripts for each migration
3. Test rollback on staging database
4. Document rollback procedure
5. Add rollback to deployment pipeline
6. Create migration rollback checklist

**Files to Modify**:
- `prisma/migrations/` (add rollback scripts)
- Documentation

**Validation**:
- Test rollback for each migration
- Verify data integrity after rollback
- Test rollback procedure documentation

---

### NAB-P0-018: Missing Unique Constraints on Critical Fields
**Module**: Database/Schema  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P0-013

**Implementation Steps**:
1. Identify fields requiring uniqueness (email, username, slug)
2. Add unique constraints to Prisma schema
3. Create migration
4. Test migration on staging
5. Handle existing duplicates
6. Run migration on production

**Files to Modify**:
- `prisma/schema.prisma`
- Create migration

**Validation**:
- Test unique constraint enforcement
- Verify duplicate handling
- Test error messages

---

### NAB-P0-019: No Database Query Timeout Configuration
**Module**: Database/Config  
**Estimated Effort**: 2 hours  
**Dependencies**: None

**Implementation Steps**:
1. Configure query timeout in Prisma (10 seconds)
2. Add query timeout logging
3. Implement slow query logging (>5 seconds)
4. Add timeout error handling
5. Update documentation

**Files to Modify**:
- `prisma/schema.prisma`
- `api/_lib/` (database utilities)

**Validation**:
- Test query timeout
- Verify slow query logging
- Check error handling

---

### NAB-P0-020: Missing Database Index Optimization
**Module**: Database/Schema  
**Estimated Effort**: 8 hours  
**Dependencies**: NAB-P0-013

**Implementation Steps**:
1. Analyze slow queries
2. Identify missing indexes
3. Add composite indexes for common query patterns
4. Add indexes to foreign keys
5. Create migration
6. Test performance improvement

**Files to Modify**:
- `prisma/schema.prisma`
- Create migration

**Validation**:
- Test query performance
- Verify index usage
- Check query plan

---

## LAUNCH BLOCKER ISSUES (10)

### NAB-P0-021: Email Service Not Configured
**Module**: Backend/Email  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Choose email provider (SendGrid or Resend)
2. Create email service account
3. Configure API keys
4. Implement email sending utility
5. Create email templates (verification, password reset, order confirmation)
6. Add email sending error handling
7. Test email delivery

**Files to Modify**:
- `api/_lib/` (email utility)
- `.env.example`
- Email templates

**Validation**:
- Test email sending
- Verify delivery
- Test error handling

---

### NAB-P0-022: Payment Gateway Not Integrated
**Module**: Backend/Payments  
**Estimated Effort**: 16 hours  
**Dependencies**: NAB-P0-021

**Implementation Steps**:
1. Create Stripe account
2. Configure Stripe API keys
3. Implement Stripe checkout session creation
4. Implement webhook handling for payment events
5. Add payment status tracking
6. Implement refund functionality
7. Add payment error handling
8. Test payment flow end-to-end

**Files to Modify**:
- `api/_handlers/` (payment handlers)
- `api/_lib/` (payment utilities)
- `prisma/schema.prisma` (payment models)
- `.env.example`

**Validation**:
- Test payment creation
- Test webhook handling
- Test refund flow
- Test error scenarios

---

### NAB-P0-023: Product Image Upload Broken
**Module**: Frontend/Products  
**Estimated Effort**: 8 hours  
**Dependencies**: NAB-P0-002

**Implementation Steps**:
1. Debug existing image upload code
2. Fix Cloudinary integration
3. Implement progress indicator
4. Add image preview
5. Implement multiple image upload
6. Add image reordering
7. Test upload flow

**Files to Modify**:
- `src/admin/` (product forms)
- `api/_handlers/brands.ts` (upload handler)
- `api/_lib/cloudinary.ts`

**Validation**:
- Test single image upload
- Test multiple image upload
- Test image reordering
- Verify Cloudinary storage

---

### NAB-P0-024: Cart Persistence Not Working
**Module**: Frontend/Cart  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Debug existing cart persistence code
2. Implement localStorage fallback
3. Implement server-side cart for logged-in users
4. Implement cart sync between local and server
5. Add cart expiration
6. Test cart persistence across sessions

**Files to Modify**:
- `src/components/` (cart components)
- `api/_handlers/` (cart API)

**Validation**:
- Test cart persistence for guest users
- Test cart persistence for logged-in users
- Test cart sync
- Verify cart expiration

---

### NAB-P0-025: Search Functionality Not Implemented
**Module**: Frontend/Search  
**Estimated Effort**: 12 hours  
**Dependencies**: None

**Implementation Steps**:
1. Design search API endpoint
2. Implement full-text search (Prisma or dedicated search service)
3. Add search filters (category, price, brand)
4. Add sorting options
5. Implement search suggestions
6. Add search history
7. Test search performance

**Files to Modify**:
- `api/_handlers/` (search endpoint)
- `src/components/` (search UI)
- `prisma/schema.prisma` (add search indexes)

**Validation**:
- Test search functionality
- Test filters
- Test sorting
- Verify performance

---

### NAB-P0-026: Admin Dashboard Not Accessible
**Module**: Admin/Dashboard  
**Estimated Effort**: 8 hours  
**Dependencies**: NAB-P0-008, NAB-P0-012

**Implementation Steps**:
1. Debug admin dashboard routing
2. Fix admin authentication
3. Implement admin role check
4. Fix admin layout
5. Test admin access
6. Add admin access logging

**Files to Modify**:
- `src/admin/AdminRoutes.tsx`
- `api/_handlers/admin/` (admin endpoints)
- `api/_lib/auth-middleware.ts`

**Validation**:
- Test admin login
- Test admin dashboard access
- Verify role-based access

---

### NAB-P0-027: Order Processing Workflow Incomplete
**Module**: Backend/Orders  
**Estimated Effort**: 16 hours  
**Dependencies**: NAB-P0-022

**Implementation Steps**:
1. Design order states (pending, confirmed, shipped, delivered, cancelled)
2. Implement order state transitions
3. Add order status notifications
4. Implement order cancellation
5. Implement order refund
6. Add order history
7. Test order workflow

**Files to Modify**:
- `prisma/schema.prisma` (order models)
- `api/_handlers/` (order endpoints)
- `src/admin/` (order management UI)

**Validation**:
- Test order creation
- Test order state transitions
- Test order cancellation
- Test order refund

---

### NAB-P0-028: Shipping Calculation Not Implemented
**Module**: Backend/Shipping  
**Estimated Effort**: 12 hours  
**Dependencies**: NAB-P0-027

**Implementation Steps**:
1. Integrate shipping provider (e.g., Shippo, FedEx API)
2. Implement shipping rate calculation
3. Add shipping zones
4. Implement free shipping thresholds
5. Add shipping method selection
6. Test shipping calculation

**Files to Modify**:
- `api/_handlers/` (shipping endpoints)
- `api/_lib/` (shipping utilities)
- `prisma/schema.prisma` (shipping models)
- `.env.example`

**Validation**:
- Test shipping rate calculation
- Test shipping zones
- Test free shipping thresholds
- Verify accuracy

---

### NAB-P0-029: Tax Calculation Not Implemented
**Module**: Backend/Tax  
**Estimated Effort**: 10 hours  
**Dependencies**: NAB-P0-027

**Implementation Steps**:
1. Integrate tax provider (e.g., TaxJar, Avalara)
2. Implement tax rate calculation by location
3. Add tax-exempt handling
4. Implement tax-inclusive pricing
5. Add tax reporting
6. Test tax calculation

**Files to Modify**:
- `api/_handlers/` (tax endpoints)
- `api/_lib/` (tax utilities)
- `prisma/schema.prisma` (tax models)
- `.env.example`

**Validation**:
- Test tax calculation by location
- Test tax-exempt handling
- Verify accuracy

---

### NAB-P0-030: Inventory Management Not Implemented
**Module**: Backend/Inventory  
**Estimated Effort**: 12 hours  
**Dependencies**: NAB-P0-027

**Implementation Steps**:
1. Add inventory tracking to Product model
2. Implement stock decrement on order
3. Implement stock increment on cancellation
4. Add low stock alerts
5. Implement out-of-stock handling
6. Add inventory reporting
7. Test inventory flow

**Files to Modify**:
- `prisma/schema.prisma` (inventory fields)
- `api/_handlers/` (order endpoints)
- `src/admin/` (inventory UI)

**Validation**:
- Test stock decrement
- Test stock increment
- Test low stock alerts
- Test out-of-stock handling

---

## PERFORMANCE ISSUES (6)

### NAB-P0-031: No CDN Configuration for Static Assets
**Module**: Cloudflare/CDN  
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Implementation Steps**:
1. Configure Cloudflare CDN for static assets
2. Set cache rules for images, CSS, JS
3. Configure cache TTL (1 year for immutable assets)
4. Implement cache busting (versioning)
5. Test CDN caching

**Files to Modify**:
- `public/_headers`
- `wrangler.jsonc`
- Build configuration

**Validation**:
- Test CDN caching
- Verify cache headers
- Test cache busting

---

### NAB-P0-032: Missing Image Optimization
**Module**: Cloudflare/Images  
**Estimated Effort**: 6 hours  
**Dependencies**: NAB-P0-031

**Implementation Steps**:
1. Configure Cloudflare Image Resizing
2. Implement responsive image generation
3. Add WebP format support
4. Implement lazy loading
5. Add image compression
6. Test image optimization

**Files to Modify**:
- `src/components/` (image components)
- `public/_headers`
- Build configuration

**Validation**:
- Test image loading performance
- Verify WebP support
- Test lazy loading

---

### NAB-P0-033: No API Response Caching
**Module**: Backend/API  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Identify cacheable endpoints (products, categories)
2. Implement Redis or Cloudflare KV caching
3. Add cache headers
4. Implement cache invalidation
5. Add cache warming
6. Test caching performance

**Files to Modify**:
- `api/_lib/` (cache utilities)
- `api/_handlers/` (cacheable endpoints)
- `wrangler.jsonc`

**Validation**:
- Test cache hit rate
- Verify cache invalidation
- Measure performance improvement

---

### NAB-P0-034: No Database Query Result Caching
**Module**: Database/Queries  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P0-033

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

### NAB-P0-035: Missing Lazy Loading for Images
**Module**: Frontend/Images  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P0-032

**Implementation Steps**:
1. Implement lazy loading for all images
2. Add loading placeholders
3. Implement intersection observer
4. Add above-the-fold image exclusion
5. Test lazy loading

**Files to Modify**:
- `src/components/` (image components)

**Validation**:
- Test lazy loading behavior
- Verify above-the-fold images load immediately
- Measure performance improvement

---

### NAB-P0-036: No Code Splitting for JavaScript Bundles
**Module**: Frontend/Build  
**Estimated Effort**: 6 hours  
**Dependencies**: None

**Implementation Steps**:
1. Configure Vite code splitting
2. Implement route-based splitting
3. Implement vendor chunk splitting
4. Add dynamic imports for heavy components
5. Analyze bundle sizes
6. Test code splitting

**Files to Modify**:
- `vite.config.ts`
- `src/app/routes.tsx`

**Validation**:
- Test bundle sizes
- Verify lazy loading of chunks
- Measure performance improvement

---

## COMPLIANCE ISSUES (6)

### NAB-P0-037: Missing GDPR Compliance Features
**Module**: Backend/Compliance  
**Estimated Effort**: 12 hours  
**Dependencies**: NAB-P0-008

**Implementation Steps**:
1. Implement data export endpoint (GDPR right to data portability)
2. Implement data deletion endpoint (GDPR right to be forgotten)
3. Add consent management
4. Implement data retention policies
5. Add GDPR compliance documentation
6. Test GDPR features

**Files to Modify**:
- `api/_handlers/` (compliance endpoints)
- `prisma/schema.prisma` (consent models)
- `src/components/` (consent UI)

**Validation**:
- Test data export
- Test data deletion
- Verify consent management

---

### NAB-P0-038: No Privacy Policy Implementation
**Module**: Frontend/Legal  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P0-037

**Implementation Steps**:
1. Draft privacy policy
2. Create privacy policy page
3. Add privacy policy link to footer
4. Add privacy policy acceptance checkbox
5. Test privacy policy display

**Files to Modify**:
- `src/app/routes.tsx`
- `src/components/` (footer, legal components)

**Validation**:
- Test privacy policy page
- Verify footer link
- Test acceptance checkbox

---

### NAB-P0-039: Missing Terms of Service Implementation
**Module**: Frontend/Legal  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P0-037

**Implementation Steps**:
1. Draft terms of service
2. Create terms of service page
3. Add terms of service link to footer
4. Add terms of service acceptance checkbox
5. Test terms of service display

**Files to Modify**:
- `src/app/routes.tsx`
- `src/components/` (footer, legal components)

**Validation**:
- Test terms of service page
- Verify footer link
- Test acceptance checkbox

---

### NAB-P0-040: No Cookie Consent Implementation
**Module**: Frontend/Legal  
**Estimated Effort**: 6 hours  
**Dependencies**: NAB-P0-037

**Implementation Steps**:
1. Install cookie consent library
2. Configure cookie consent banner
3. Add cookie preference management
4. Implement cookie category consent
5. Add cookie consent logging
6. Test cookie consent

**Files to Modify**:
- `src/components/` (cookie consent component)
- `src/app/App.tsx`

**Validation**:
- Test cookie consent banner
- Test preference management
- Verify consent logging

---

### NAB-P0-041: Missing Accessibility Compliance (WCAG 2.1 AA)
**Module**: Frontend/Accessibility  
**Estimated Effort**: 16 hours  
**Dependencies**: None

**Implementation Steps**:
1. Run accessibility audit (axe DevTools)
2. Fix color contrast issues
3. Add ARIA labels to interactive elements
4. Implement keyboard navigation
5. Add focus indicators
6. Implement skip links
7. Add alt text to images
8. Test with screen reader

**Files to Modify**:
- All frontend components
- `tailwind.config.ts` (color contrast)

**Validation**:
- Run accessibility audit
- Test keyboard navigation
- Test screen reader compatibility

---

### NAB-P0-042: No Data Export Functionality for Users
**Module**: Backend/Compliance  
**Estimated Effort**: 8 hours  
**Dependencies**: NAB-P0-037

**Implementation Steps**:
1. Design data export format (JSON, CSV)
2. Implement data export endpoint
3. Add export authentication
4. Implement export job queue
5. Add export notification
6. Test data export

**Files to Modify**:
- `api/_handlers/` (export endpoint)
- `api/_lib/` (export utilities)
- `src/components/` (export UI)

**Validation**:
- Test data export
- Verify export format
- Test export authentication

---

## IMPLEMENTATION SEQUENCE

### Week 1: Security Foundation
- NAB-P0-001: Rate limiting
- NAB-P0-003: CORS configuration
- NAB-P0-005: Remove hardcoded credentials
- NAB-P0-006: Security headers
- NAB-P0-010: Password strength

### Week 2: Database Integrity
- NAB-P0-013: Foreign key constraints
- NAB-P0-018: Unique constraints
- NAB-P0-015: Connection pooling
- NAB-P0-019: Query timeout
- NAB-P0-020: Index optimization

### Week 3: Authentication & Authorization
- NAB-P0-002: Input sanitization
- NAB-P0-004: CSRF protection
- NAB-P0-009: Email verification
- NAB-P0-011: Session timeout
- NAB-P0-012: IP blocking

### Week 4: Core Launch Features
- NAB-P0-021: Email service
- NAB-P0-023: Image upload
- NAB-P0-024: Cart persistence
- NAB-P0-025: Search functionality
- NAB-P0-026: Admin dashboard

### Week 5: Payment & Orders
- NAB-P0-022: Payment gateway
- NAB-P0-027: Order processing
- NAB-P0-028: Shipping calculation
- NAB-P0-029: Tax calculation
- NAB-P0-030: Inventory management

### Week 6: Performance & Compliance
- NAB-P0-031: CDN configuration
- NAB-P0-032: Image optimization
- NAB-P0-035: Lazy loading
- NAB-P0-036: Code splitting
- NAB-P0-037: GDPR compliance
- NAB-P0-041: Accessibility compliance

### Week 7: Operations & Data
- NAB-P0-014: Transaction isolation
- NAB-P0-016: Database backup
- NAB-P0-017: Migration rollback
- NAB-P0-007: API key rotation
- NAB-P0-008: Audit logging

### Week 8: Final Compliance
- NAB-P0-033: API caching
- NAB-P0-034: Query caching
- NAB-P0-038: Privacy policy
- NAB-P0-039: Terms of service
- NAB-P0-040: Cookie consent
- NAB-P0-042: Data export

## TOTAL ESTIMATED EFFORT
**288 hours** (approximately 8 weeks for 1 developer, or 4 weeks for 2 developers)

## SUCCESS CRITERIA
- All 42 P0 issues resolved
- Security audit passed
- Data integrity verified
- Core launch features functional
- Performance benchmarks met
- Compliance requirements satisfied

## RISKS & MITIGATIONS
- **Risk**: Payment integration complexity
  - **Mitigation**: Start with Stripe test mode, allocate buffer time
- **Risk**: Database migration issues
  - **Mitigation**: Test thoroughly on staging, have rollback ready
- **Risk**: Third-party service delays (email, payment)
  - **Mitigation**: Have fallback options, start integration early
