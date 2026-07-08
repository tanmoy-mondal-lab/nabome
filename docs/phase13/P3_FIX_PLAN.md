# P3 Fix Plan - Low Priority Issues
**Project:** Nabome
**Phase:** 13 - Implementation Planning
**Priority Level:** P3 (Low Priority)
**Total P3 Issues:** 18
**Target Completion:** Sprint 13-16 (Weeks 13-16)

---

## Executive Summary

This document outlines the implementation plan for all 18 P3 (low priority) issues identified across the Nabome codebase. These issues represent nice-to-have improvements that can be addressed after P0, P1, and P2 issues to further polish the application.

**Key Statistics:**
- **Total P3 Issues:** 18
- **Frontend:** 5 items
- **Infrastructure:** 4 items
- **Business Features:** 6 items
- **Code Cleanup:** 3 items
- **Estimated Effort:** 20 person-days (4 weeks)
- **Target Timeline:** 4 weeks (Sprint 13-16)

---

## Issue Inventory

| ID | Issue | Component | Source Report | Status |
|----|-------|-----------|---------------|--------|
| NAB-P3-001 | FAQ page no search, no category grouping | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P3-002 | PWA install prompt not configured | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P3-003 | 404 page lacks brand consistency | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P3-004 | No empty state for wishlist when not logged in | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P3-005 | `window.confirm()` for address delete (breaks premium UX) | Frontend | Frontend UI/UX Audit | Pending |
| NAB-P3-006 | No preview deployments for PRs | Infrastructure | Code Quality Audit | Pending |
| NAB-P3-007 | No rollback mechanism | Infrastructure | Code Quality Audit | Pending |
| NAB-P3-008 | No staging environment | Infrastructure | Code Quality Audit | Pending |
| NAB-P3-009 | No feature flags system | Infrastructure | Code Quality Audit | Pending |
| NAB-P3-010 | No loyalty/rewards program infrastructure | Business Features | Launch Readiness | Pending |
| NAB-P3-011 | No referral program infrastructure | Business Features | Launch Readiness | Pending |
| NAB-P3-012 | No gift cards infrastructure | Business Features | Launch Readiness | Pending |
| NAB-P3-013 | No subscription infrastructure | Business Features | Launch Readiness | Pending |
| NAB-P3-014 | Multi-currency not supported (INR only) | Business Features | Launch Readiness | Pending |
| NAB-P3-015 | Multi-language not supported (Bengali font only, no i18n) | Business Features | Launch Readiness | Pending |
| NAB-P3-016 | Unused `prisma.config.ts` file | Code Cleanup | Code Quality Audit | Pending |
| NAB-P3-017 | `@dnd-kit/utilities` may be unused | Code Cleanup | Code Quality Audit | Pending |
| NAB-P3-018 | Unused imports and commented-out code | Code Cleanup | Code Quality Audit | Pending |

---

## Detailed Implementation Plans

### NAB-P3-001: FAQ Page No Search or Category Grouping

**Issue:** FAQ page lacks search functionality and category grouping.

**Impact:** Low UX issue - difficult to find relevant FAQ items.

**Root Cause:** FAQ page not designed with search or categories.

**Implementation Steps:**

1. **Analyze FAQ Content**
   - Identify FAQ categories
   - Identify FAQ count
   - Identify search requirements

2. **Add Category Grouping**
   - Group FAQs by category
   - Add category navigation
   - Add category filtering
   - Display category counts

3. **Add Search Functionality**
   - Add search input
   - Implement search logic
   - Highlight search terms
   - Show search results count

4. **Improve FAQ UI**
   - Add accordion for FAQ items
   - Add expand/collapse all
   - Add related FAQs
   - Add contact support link

5. **Testing**
   - Test category grouping
   - Test search functionality
   - Test accordion behavior
   - Test responsive design

**Files to Modify:**
- FAQ page component
- FAQ data structure
- FAQ styling

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Remove search and categories.

**Acceptance Criteria:**
- FAQ categories implemented
- Search functionality added
- Accordion behavior working
- Responsive design verified

---

### NAB-P3-002: PWA Install Prompt Not Configured

**Issue:** PWA install prompt not configured, users cannot install as app.

**Impact:** Low UX issue - cannot install as PWA, reduced engagement.

**Root Cause:** PWA manifest and service worker not configured for install prompt.

**Implementation Steps:**

1. **Configure PWA Manifest**
   - Update manifest.json
   - Add app name
   - Add app icons
   - Add app description
   - Add theme color

2. **Configure Service Worker**
   - Update service worker
   - Add offline support
   - Add caching strategy
   - Add update handling

3. **Add Install Prompt Logic**
   - Detect installability
   - Show install prompt
   - Handle install acceptance
   - Handle install dismissal

4. **Add Install Button**
   - Add install button to UI
   - Show when installable
   - Hide after installation
   - Style appropriately

5. **Testing**
   - Test PWA manifest
   - Test service worker
   - Test install prompt
   - Test offline functionality

**Files to Modify:**
- manifest.json
- service worker
- Install prompt component
- PWA configuration

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Remove PWA install prompt.

**Acceptance Criteria:**
- PWA manifest configured
- Service worker configured
- Install prompt working
- Install button functional

---

### NAB-P3-003: 404 Page Lacks Brand Consistency

**Issue:** 404 page lacks brand consistency with rest of application.

**Impact:** Low UX issue - poor brand experience on error pages.

**Root Cause:** 404 page not styled according to design system.

**Implementation Steps:**

1. **Analyze Current 404 Page**
   - Identify current design
   - Identify brand inconsistencies
   - Identify design system components

2. **Redesign 404 Page**
   - Apply design system components
   - Add brand colors
   - Add brand logo
   - Add brand typography

3. **Add Helpful Elements**
   - Add "Go Home" button
   - Add search functionality
   - Add popular links
   - Add contact support link

4. **Improve UX**
   - Add friendly error message
   - Add illustrations
   - Add animations
   - Make it mobile-friendly

5. **Testing**
   - Test 404 page rendering
   - Test brand consistency
   - Test helpful elements
   - Test responsive design

**Files to Modify:**
- 404 page component
- 404 page styling

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Revert to previous 404 page.

**Acceptance Criteria:**
- 404 page brand-consistent
- Design system applied
- Helpful elements added
- Responsive design verified

---

### NAB-P3-004: No Empty State for Wishlist

**Issue:** No empty state for wishlist when user is not logged in.

**Impact:** Low UX issue - confusing empty wishlist experience.

**Root Cause:** Empty state not implemented for wishlist.

**Implementation Steps:**

1. **Identify Wishlist Empty States**
   - Not logged in state
   - Logged in but empty state
   - Error state

2. **Create Empty State Components**
   - Create not logged in empty state
   - Create empty wishlist state
   - Add login CTA
   - Add shopping CTA

3. **Add Empty State Logic**
   - Detect user login status
   - Detect wishlist emptiness
   - Show appropriate empty state
   - Handle error states

4. **Style Empty States**
   - Apply design system
   - Add illustrations
   - Add friendly messages
   - Add CTAs

5. **Testing**
   - Test not logged in state
   - Test empty wishlist state
   - Test error state
   - Test responsive design

**Files to Modify:**
- Wishlist page component
- Empty state components (create)
- Wishlist logic

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Remove empty states.

**Acceptance Criteria:**
- Empty states implemented
- Login CTA added
- Shopping CTA added
- Brand-consistent design

---

### NAB-P3-005: window.confirm() for Address Delete

**Issue:** Address delete uses `window.confirm()` which breaks premium UX.

**Impact:** Low UX issue - inconsistent with design system, poor UX.

**Root Cause:** Native confirm dialog used instead of custom modal.

**Implementation Steps:**

1. **Identify Confirm Dialog Usage**
   - Locate address delete logic
   - Identify other confirm dialog usage
   - Identify design system modal

2. **Replace with Custom Modal**
   - Use design system modal
   - Add confirmation message
   - Add cancel button
   - Add confirm button

3. **Style According to Design System**
   - Apply design system styles
   - Add animations
   - Add proper spacing
   - Ensure accessibility

4. **Update All Confirm Dialogs**
   - Replace all `window.confirm()` usage
   - Use custom modal consistently
   - Ensure consistent UX

5. **Testing**
   - Test address delete modal
   - Test other confirm modals
   - Test accessibility
   - Test responsive design

**Files to Modify:**
- Address delete component
- Other components with confirm dialogs
- Modal component

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** Design system modal component.

**Rollback Plan:** Revert to window.confirm().

**Acceptance Criteria:**
- Custom modal implemented
- Design system applied
- All confirm dialogs replaced
- Accessibility verified

---

### NAB-P3-006: No Preview Deployments for PRs

**Issue:** No preview deployments for pull requests.

**Impact:** Low developer experience issue - cannot preview changes before merge.

**Root Cause:** Preview deployment not configured in CI/CD.

**Implementation Steps:**

1. **Configure Preview Deployments**
   - Configure Cloudflare Pages preview deployments
   - Set up preview environment
   - Configure preview URL generation

2. **Update CI/CD Pipeline**
   - Add preview deployment step
   - Deploy on PR creation
   - Deploy on PR update
   - Comment preview URL on PR

3. **Configure Preview Environment**
   - Use preview environment variables
   - Use preview database
   - Use preview services

4. **Add Preview Cleanup**
   - Delete preview deployments on PR close
   - Configure cleanup policy
   - Monitor preview deployment count

5. **Testing**
   - Test preview deployment
   - Test preview URL generation
   - Test preview cleanup
   - Verify preview functionality

**Files to Modify:**
- CI/CD configuration
- Cloudflare Pages configuration

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** Cloudflare Pages preview deployments.

**Rollback Plan:** Disable preview deployments.

**Acceptance Criteria:**
- Preview deployments configured
- CI/CD updated
- Preview environment configured
- Preview cleanup implemented

---

### NAB-P3-007: No Rollback Mechanism

**Issue:** No rollback mechanism for deployments.

**Impact:** Low operations issue - cannot quickly rollback if deployment fails.

**Root Cause:** Rollback strategy not defined or implemented.

**Implementation Steps:**

1. **Define Rollback Strategy**
   - Define rollback triggers
   - Define rollback process
   - Define rollback time window

2. **Configure Deployment History**
   - Keep last N deployments
   - Tag deployments
   - Track deployment metadata

3. **Implement Rollback Script**
   - Create rollback script
   - Automate rollback process
   - Add rollback to CI/CD

4. **Add Rollback Monitoring**
   - Monitor deployment health
   - Auto-trigger rollback on failure
   - Alert on rollback

5. **Document Rollback Process**
   - Document rollback steps
   - Document rollback scenarios
   - Train team on rollback

6. **Testing**
   - Test rollback script
   - Test rollback process
   - Test auto-rollback
   - Verify rollback success

**Files to Modify:**
- CI/CD configuration
- Rollback script (create)
- Deployment documentation

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** CI/CD platform.

**Rollback Plan:** N/A (this is the rollback mechanism).

**Acceptance Criteria:**
- Rollback strategy defined
- Rollback script implemented
- Rollback added to CI/CD
- Rollback documented

---

### NAB-P3-008: No Staging Environment

**Issue:** No staging environment for pre-production testing.

**Impact:** Low operations issue - cannot test in production-like environment.

**Root Cause:** Staging environment not set up.

**Implementation Steps:**

1. **Define Staging Requirements**
   - Define staging environment specs
   - Define staging data strategy
   - Define staging access

2. **Set Up Staging Environment**
   - Create staging Cloudflare Pages project
   - Configure staging environment variables
   - Set up staging database
   - Set up staging services

3. **Configure Staging Deployment**
   - Add staging deployment to CI/CD
   - Deploy on merge to staging branch
   - Configure deployment triggers

4. **Add Staging Data**
   - Seed staging database
   - Configure test data
   - Configure test accounts

5. **Document Staging Access**
   - Document staging URL
   - Document staging credentials
   - Document staging usage

6. **Testing**
   - Test staging deployment
   - Test staging functionality
   - Verify staging data
   - Verify staging access

**Files to Modify:**
- CI/CD configuration
- Environment configuration
- Staging documentation

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** Cloudflare Pages, staging resources.

**Rollback Plan:** Remove staging environment.

**Acceptance Criteria:**
- Staging environment set up
- Staging deployment configured
- Staging data seeded
- Staging documented

---

### NAB-P3-009: No Feature Flags System

**Issue:** No feature flags system for gradual rollouts.

**Impact:** Low developer experience issue - cannot safely roll out features.

**Root Cause:** Feature flags not implemented.

**Implementation Steps:**

1. **Choose Feature Flag Service**
   - Evaluate feature flag services
   - Select service (e.g., LaunchDarkly, Unleash)
   - Create account

2. **Integrate Feature Flag SDK**
   - Install SDK
   - Configure SDK
   - Add to application

3. **Define Feature Flags**
   - Define flag naming convention
   - Define flag types
   - Define flag defaults

4. **Implement Feature Flag Logic**
   - Add flag checks in code
   - Add flag checks in UI
   - Add flag checks in API

5. **Configure Flag Management**
   - Set up flag dashboard
   - Configure flag permissions
   - Configure flag targeting

6. **Testing**
   - Test flag SDK integration
   - Test flag logic
   - Test flag management
   - Test flag targeting

**Files to Modify:**
- Package.json (add SDK)
- Application configuration
- Feature flag logic

**Estimated Effort:** 2 days (16 hours)

**Dependencies:** Feature flag service.

**Rollback Plan:** Remove feature flag integration.

**Acceptance Criteria:**
- Feature flag SDK integrated
- Feature flags defined
- Flag logic implemented
- Flag management configured

---

### NAB-P3-010: No Loyalty/Rewards Program

**Issue:** No loyalty/rewards program infrastructure.

**Impact:** Low business feature - no customer retention program.

**Root Cause:** Loyalty program not implemented.

**Implementation Steps:**

1. **Define Loyalty Program**
   - Define point system
   - Define reward tiers
   - Define earning rules
   - Define redemption rules

2. **Create Loyalty Data Model**
   - Add loyalty points to user
   - Add loyalty transactions
   - Add reward tiers
   - Add redemption history

3. **Implement Loyalty Logic**
   - Calculate points earned
   - Calculate points redeemed
   - Track loyalty level
   - Apply loyalty discounts

4. **Create Loyalty UI**
   - Add loyalty points display
   - Add loyalty rewards page
   - Add loyalty history
   - Add loyalty tier display

5. **Add Loyalty Notifications**
   - Notify on points earned
   - Notify on tier upgrade
   - Notify on rewards available

6. **Testing**
   - Test loyalty calculation
   - Test loyalty UI
   - Test loyalty notifications
   - Test loyalty redemption

**Files to Modify:**
- User model (add loyalty fields)
- Loyalty model (create)
- Loyalty logic (create)
- Loyalty UI (create)

**Estimated Effort:** 4 days (32 hours)

**Dependencies:** None

**Rollback Plan:** Remove loyalty program.

**Acceptance Criteria:**
- Loyalty data model created
- Loyalty logic implemented
- Loyalty UI created
- Loyalty notifications added

---

### NAB-P3-011: No Referral Program

**Issue:** No referral program infrastructure.

**Impact:** Low business feature - no customer acquisition program.

**Root Cause:** Referral program not implemented.

**Implementation Steps:**

1. **Define Referral Program**
   - Define referral reward
   - Define referee reward
   - Define referral tracking
   - Define referral limits

2. **Create Referral Data Model**
   - Add referral code to user
   - Add referral tracking
   - Add referral rewards
   - Add referral history

3. **Implement Referral Logic**
   - Generate referral codes
   - Track referrals
   - Calculate rewards
   - Apply referral discounts

4. **Create Referral UI**
   - Add referral code display
   - Add referral share buttons
   - Add referral history
   - Add referral rewards display

5. **Add Referral Notifications**
   - Notify on successful referral
   - Notify on reward earned
   - Notify on referral used

6. **Testing**
   - Test referral code generation
   - Test referral tracking
   - Test referral rewards
   - Test referral UI

**Files to Modify:**
- User model (add referral fields)
- Referral model (create)
- Referral logic (create)
- Referral UI (create)

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** Remove referral program.

**Acceptance Criteria:**
- Referral data model created
- Referral logic implemented
- Referral UI created
- Referral notifications added

---

### NAB-P3-012: No Gift Cards

**Issue:** No gift cards infrastructure.

**Impact:** Low business feature - no gift card sales.

**Root Cause:** Gift cards not implemented.

**Implementation Steps:**

1. **Define Gift Card System**
   - Define gift card types
   - Define gift card values
   - Define gift card expiry
   - Define gift card balance

2. **Create Gift Card Data Model**
   - Add gift card model
   - Add gift card transactions
   - Add gift card balance tracking
   - Add gift card redemption

3. **Implement Gift Card Logic**
   - Generate gift cards
   - Track gift card balance
   - Redeem gift cards
   - Apply gift card to orders

4. **Create Gift Card UI**
   - Add gift card purchase page
   - Add gift card redemption page
   - Add gift card balance display
   - Add gift card history

5. **Add Gift Card Notifications**
   - Notify on gift card purchase
   - Notify on gift card redemption
   - Notify on gift card expiry

6. **Testing**
   - Test gift card generation
   - Test gift card redemption
   - Test gift card UI
   - Test gift card notifications

**Files to Modify:**
- Gift card model (create)
- Gift card logic (create)
- Gift card UI (create)
- Order logic (update for gift cards)

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** None

**Rollback Plan:** Remove gift cards.

**Acceptance Criteria:**
- Gift card model created
- Gift card logic implemented
- Gift card UI created
- Gift card notifications added

---

### NAB-P3-013: No Subscription Infrastructure

**Issue:** No subscription infrastructure for recurring payments.

**Impact:** Low business feature - no subscription sales.

**Root Cause:** Subscription system not implemented.

**Implementation Steps:**

1. **Define Subscription Model**
   - Define subscription types
   - Define subscription pricing
   - Define subscription billing cycle
   - Define subscription benefits

2. **Create Subscription Data Model**
   - Add subscription model
   - Add subscription plans
   - Add subscription history
   - Add subscription billing

3. **Implement Subscription Logic**
   - Create subscriptions
   - Manage subscriptions
   - Handle subscription billing
   - Handle subscription cancellation

4. **Integrate with Payment Provider**
   - Integrate Razorpay subscriptions
   - Handle webhooks
   - Handle payment failures
   - Handle subscription renewals

5. **Create Subscription UI**
   - Add subscription plans page
   - Add subscription management page
   - Add subscription history
   - Add subscription billing display

6. **Testing**
   - Test subscription creation
   - Test subscription billing
   - Test subscription cancellation
   - Test subscription UI

**Files to Modify:**
- Subscription model (create)
- Subscription logic (create)
- Subscription UI (create)
- Payment integration (update)

**Estimated Effort:** 4 days (32 hours)

**Dependencies:** Razorpay subscription API.

**Rollback Plan:** Remove subscriptions.

**Acceptance Criteria:**
- Subscription model created
- Subscription logic implemented
- Payment integration updated
- Subscription UI created

---

### NAB-P3-014: Multi-Currency Not Supported

**Issue:** Multi-currency not supported, only INR available.

**Impact:** Low market expansion issue - cannot sell internationally.

**Root Cause:** Currency system not implemented.

**Implementation Steps:**

1. **Define Currency Strategy**
   - Define supported currencies
   - Define exchange rate source
   - Define currency display
   - Define currency conversion

2. **Create Currency Data Model**
   - Add currency configuration
   - Add exchange rate tracking
   - Add currency pricing
   - Add currency history

3. **Implement Currency Logic**
   - Detect user currency
   - Convert prices
   - Display in user currency
   - Process payments in user currency

4. **Create Currency UI**
   - Add currency selector
   - Display prices in selected currency
   - Add currency conversion info
   - Add currency switcher

5. **Integrate with Payment Provider**
   - Configure multi-currency payments
   - Handle currency conversion
   - Handle currency-specific fees

6. **Testing**
   - Test currency detection
   - Test price conversion
   - Test currency UI
   - Test payment processing

**Files to Modify:**
- Currency model (create)
- Currency logic (create)
- Currency UI (create)
- Payment integration (update)

**Estimated Effort:** 3 days (24 hours)

**Dependencies:** Payment provider multi-currency support.

**Rollback Plan:** Remove multi-currency.

**Acceptance Criteria:**
- Currency model created
- Currency logic implemented
- Currency UI created
- Payment integration updated

---

### NAB-P3-015: Multi-Language Not Supported

**Issue:** Multi-language not supported, only Bengali font available, no i18n.

**Impact:** Low market expansion issue - cannot serve non-English speakers.

**Root Cause:** Internationalization not implemented.

**Implementation Steps:**

1. **Define i18n Strategy**
   - Define supported languages
   - Define translation approach
   - Define language detection
   - Define language switching

2. **Choose i18n Library**
   - Evaluate i18n libraries (next-i18next, react-i18next)
   - Select appropriate library
   - Install library

3. **Create Translation Files**
   - Create translation files for each language
   - Extract translatable strings
   - Translate strings
   - Organize by namespace

4. **Implement i18n Logic**
   - Configure i18n library
   - Add language detection
   - Add language switching
   - Add language persistence

5. **Create Language UI**
   - Add language selector
   - Add language switcher
   - Display in selected language
   - Handle RTL languages if needed

6. **Testing**
   - Test language detection
   - Test language switching
   - Test translations
   - Test language UI

**Files to Modify:**
- Package.json (add i18n library)
- i18n configuration
- Translation files (create)
- Language UI (create)

**Estimated Effort:** 4 days (32 hours)

**Dependencies:** i18n library.

**Rollback Plan:** Remove i18n.

**Acceptance Criteria:**
- i18n library integrated
- Translation files created
- Language detection implemented
- Language UI created

---

### NAB-P3-016: Unused prisma.config.ts File

**Issue:** Unused `prisma.config.ts` file in codebase.

**Impact:** Low code cleanliness issue - unused file clutter.

**Root Cause:** File created but not used.

**Implementation Steps:**

1. **Verify File Usage**
   - Search for file imports
   - Search for file references
   - Confirm file is unused

2. **Delete File**
   - Delete `prisma.config.ts`
   - Verify no breaking changes
   - Run tests

3. **Update Documentation**
   - Remove file from documentation
   - Update file structure docs

**Files to Modify:**
- prisma.config.ts (delete)
- Documentation

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Restore file if needed.

**Acceptance Criteria:**
- Unused file deleted
- No breaking changes
- Tests pass
- Documentation updated

---

### NAB-P3-017: @dnd-kit/utilities May Be Unused

**Issue:** `@dnd-kit/utilities` package may be unused.

**Impact:** Low code cleanliness issue - unused dependency.

**Root Cause:** Package installed but not used.

**Implementation Steps:**

1. **Verify Package Usage**
   - Search for package imports
   - Search for package references
   - Confirm package is unused

2. **Remove Package**
   - Remove from package.json
   - Remove from node_modules
   - Verify no breaking changes

3. **Run Tests**
   - Run all tests
   - Verify no errors
   - Verify functionality

**Files to Modify:**
- package.json

**Estimated Effort:** 0.5 day (4 hours)

**Dependencies:** None

**Rollback Plan:** Restore package if needed.

**Acceptance Criteria:**
- Unused package removed
- No breaking changes
- Tests pass
- Functionality verified

---

### NAB-P3-018: Unused Imports and Commented-Out Code

**Issue:** Unused imports and commented-out code throughout codebase.

**Impact:** Low code cleanliness issue - code clutter.

**Root Cause:** Unused imports not cleaned up, commented code not removed.

**Implementation Steps:**

1. **Identify Unused Imports**
   - Use ESLint to identify unused imports
   - Use TypeScript compiler to identify
   - List all unused imports

2. **Remove Unused Imports**
   - Remove unused imports
   - Verify no breaking changes
   - Run tests

3. **Identify Commented-Out Code**
   - Search for commented code blocks
   - Identify safe to remove
   - List commented code

4. **Remove Commented-Out Code**
   - Remove commented code
   - Verify no breaking changes
   - Run tests

5. **Add ESLint Rules**
   - Add rule to flag unused imports
   - Add rule to flag commented code
   - Configure rule severity

6. **Testing**
   - Run ESLint
   - Run TypeScript compiler
   - Run all tests
   - Verify functionality

**Files to Modify:**
- All files with unused imports
- All files with commented code
- ESLint configuration

**Estimated Effort:** 1 day (8 hours)

**Dependencies:** None

**Rollback Plan:** Restore imports/code if needed.

**Acceptance Criteria:**
- Unused imports removed
- Commented code removed
- ESLint rules configured
- Tests pass
- Functionality verified

---

## Sprint Planning

### Sprint 13: Frontend Polish (Week 13)

**Goal:** Polish frontend UX and consistency.

**Issues:**
- NAB-P3-001: FAQ page improvements
- NAB-P3-002: PWA install prompt
- NAB-P3-003: 404 page brand consistency
- NAB-P3-004: Wishlist empty states
- NAB-P3-005: Custom confirm dialogs

**Estimated Effort:** 2 days (16 hours)

**Deliverable:** Frontend polished

**Acceptance Criteria:**
- FAQ improved with search and categories
- PWA install prompt configured
- 404 page brand-consistent
- Wishlist empty states added
- Custom confirm dialogs implemented

---

### Sprint 14: Infrastructure Improvements (Week 14)

**Goal:** Improve developer experience and operations.

**Issues:**
- NAB-P3-006: Preview deployments
- NAB-P3-007: Rollback mechanism
- NAB-P3-008: Staging environment
- NAB-P3-009: Feature flags

**Estimated Effort:** 3 days (24 hours)

**Deliverable:** Infrastructure improved

**Acceptance Criteria:**
- Preview deployments configured
- Rollback mechanism implemented
- Staging environment set up
- Feature flags integrated

---

### Sprint 15: Business Features (Week 15)

**Goal:** Implement loyalty and referral programs.

**Issues:**
- NAB-P3-010: Loyalty program
- NAB-P3-011: Referral program
- NAB-P3-012: Gift cards
- NAB-P3-013: Subscriptions

**Estimated Effort:** 4 days (32 hours)

**Deliverable:** Business features implemented

**Acceptance Criteria:**
- Loyalty program implemented
- Referral program implemented
- Gift cards implemented
- Subscriptions implemented

---

### Sprint 16: Market Expansion & Cleanup (Week 16)

**Goal:** Enable market expansion and clean up code.

**Issues:**
- NAB-P3-014: Multi-currency
- NAB-P3-015: Multi-language
- NAB-P3-016: Unused file
- NAB-P3-017: Unused package
- NAB-P3-018: Unused imports/commented code

**Estimated Effort:** 3 days (24 hours)

**Deliverable:** Market expansion enabled, code cleaned

**Acceptance Criteria:**
- Multi-currency supported
- Multi-language supported
- Unused file deleted
- Unused package removed
- Unused imports/commented code removed

---

## Testing Strategy

### Frontend Testing
- Component tests for new features
- E2E tests for critical flows
- Accessibility tests
- PWA tests

### Infrastructure Testing
- Preview deployment tests
- Rollback tests
- Staging environment tests
- Feature flag tests

### Business Feature Testing
- Loyalty program tests
- Referral program tests
- Gift card tests
- Subscription tests

### Market Expansion Testing
- Currency conversion tests
- Language switching tests
- Payment processing tests
- UI tests

### Code Cleanup Testing
- Build tests
- Import tests
- Functionality tests
- Regression tests

---

## Risk Assessment

### Low Risk Items
- All P3 items are low risk
- Most are additive features
- Cleanup items have minimal impact

### Mitigation Strategies
- Test thoroughly before deployment
- Monitor after deployment
- Rollback if issues arise

---

## Success Criteria

All P3 issues are considered resolved when:

1. **Frontend:** UX polished, brand consistent
2. **Infrastructure:** Developer experience improved
3. **Business Features:** Loyalty, referral, gift cards, subscriptions implemented
4. **Market Expansion:** Multi-currency and multi-language supported
5. **Code Cleanup:** Unused code removed

---

## Next Steps

After completing P3 issues:
1. Conduct comprehensive regression testing
2. Update documentation
3. Celebrate completion of all issues
4. Plan ongoing maintenance

---

**Document Version:** 1.0
**Last Updated:** 2026-07-07
**Owner:** Development Team
**Reviewers:** QA Team, Product Team
