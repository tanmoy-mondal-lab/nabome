# P3 Low Priority Issues Fix Plan
**Phase 13: Audit Consolidation & Fix Planning**

## Overview
This plan addresses 17 low priority issues (P3) that are optional enhancements and future improvements. These issues span infrastructure, business features, and code cleanup.

## Priority Classification
- **Infrastructure**: 4 issues
- **Business Features**: 6 issues
- **Code Cleanup**: 3 issues
- **Frontend**: 4 issues

---

## INFRASTRUCTURE ISSUES (4)

### NAB-P3-001: No Preview Deployments for PRs
**Module**: DevOps/CI/CD  
**Estimated Effort**: 12 hours  
**Dependencies**: None

**Implementation Steps**:
1. Configure Cloudflare Pages preview deployments
2. Update GitHub Actions workflow
3. Add preview URL comments to PRs
4. Configure preview environment variables
5. Test preview deployments

**Files to Modify**:
- `.github/workflows/deploy.yml`
- Cloudflare Pages configuration

**Validation**:
- Test preview deployment
- Verify preview URL
- Check environment variables

---

### NAB-P3-002: No Rollback Mechanism
**Module**: DevOps/Deployment  
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Implementation Steps**:
1. Design rollback strategy
2. Implement one-click rollback
3. Add rollback to deployment pipeline
4. Document rollback procedure
5. Test rollback

**Files to Modify**:
- `.github/workflows/deploy.yml`
- Deployment scripts

**Validation**:
- Test rollback procedure
- Verify data integrity
- Check documentation

---

### NAB-P3-003: No Staging Environment
**Module**: DevOps/Infrastructure  
**Estimated Effort**: 16 hours  
**Dependencies**: None

**Implementation Steps**:
1. Create staging Cloudflare Pages project
2. Configure staging environment variables
3. Set up staging database
4. Configure staging external services
5. Update deployment pipeline
6. Test staging environment

**Files to Modify**:
- Cloudflare Pages configuration
- `.github/workflows/deploy.yml`
- Environment configuration

**Validation**:
- Test staging deployment
- Verify staging functionality
- Check data isolation

---

### NAB-P3-004: No Feature Flags System
**Module**: DevOps/Features  
**Estimated Effort**: 12 hours  
**Dependencies**: None

**Implementation Steps**:
1. Choose feature flag solution (LaunchDarkly, Unleash, or custom)
2. Implement feature flag SDK
3. Create feature flag management UI
4. Add feature flags to code
5. Test feature flags

**Files to Modify**:
- Feature flag configuration
- Feature flag integration code
- `src/admin/` (flag management UI)

**Validation**:
- Test feature flag toggling
- Verify flag propagation
- Check flag management UI

---

## BUSINESS FEATURES ISSUES (6)

### NAB-P3-005: No Loyalty/Rewards Program Infrastructure
**Module**: Business/Loyalty  
**Estimated Effort**: 24 hours  
**Dependencies**: None

**Implementation Steps**:
1. Design loyalty program schema
2. Implement points calculation
3. Create loyalty tiers
4. Add rewards redemption
5. Create loyalty dashboard
6. Test loyalty program

**Files to Modify**:
- `prisma/schema.prisma` (loyalty models)
- `api/_handlers/` (loyalty endpoints)
- `src/storefront/` (loyalty UI)
- `src/admin/` (loyalty management)

**Validation**:
- Test points calculation
- Verify tier progression
- Check redemption flow

---

### NAB-P3-006: No Referral Program Infrastructure
**Module**: Business/Referral  
**Estimated Effort**: 20 hours  
**Dependencies**: NAB-P3-005

**Implementation Steps**:
1. Design referral program schema
2. Implement referral code generation
3. Add referral tracking
4. Implement referral rewards
5. Create referral dashboard
6. Test referral program

**Files to Modify**:
- `prisma/schema.prisma` (referral models)
- `api/_handlers/` (referral endpoints)
- `src/storefront/` (referral UI)
- `src/admin/` (referral management)

**Validation**:
- Test referral code generation
- Verify tracking accuracy
- Check reward distribution

---

### NAB-P3-007: No Gift Cards Infrastructure
**Module**: Business/GiftCards  
**Estimated Effort**: 16 hours  
**Dependencies**: NAB-P0-022

**Implementation Steps**:
1. Design gift card schema
2. Implement gift card generation
3. Add gift card redemption
4. Implement gift card balance tracking
5. Create gift card management UI
6. Test gift cards

**Files to Modify**:
- `prisma/schema.prisma` (gift card models)
- `api/_handlers/` (gift card endpoints)
- `src/storefront/` (gift card UI)
- `src/admin/` (gift card management)

**Validation**:
- Test gift card generation
- Verify redemption flow
- Check balance tracking

---

### NAB-P3-008: No Subscription Infrastructure
**Module**: Business/Subscriptions  
**Estimated Effort**: 24 hours  
**Dependencies**: NAB-P0-022

**Implementation Steps**:
1. Design subscription schema
2. Implement subscription plans
3. Add recurring billing
4. Implement subscription management
5. Create subscription dashboard
6. Test subscriptions

**Files to Modify**:
- `prisma/schema.prisma` (subscription models)
- `api/_handlers/` (subscription endpoints)
- `src/storefront/` (subscription UI)
- `src/admin/` (subscription management)

**Validation**:
- Test subscription creation
- Verify recurring billing
- Check subscription management

---

### NAB-P3-009: Multi-Currency Not Supported (INR Only)
**Module**: Business/Currency  
**Estimated Effort**: 20 hours  
**Dependencies**: NAB-P0-022

**Implementation Steps**:
1. Design multi-currency schema
2. Implement currency conversion
3. Add currency selection UI
4. Update pricing display
5. Implement payment gateway multi-currency
6. Test multi-currency

**Files to Modify**:
- `prisma/schema.prisma` (currency models)
- `api/_handlers/` (currency endpoints)
- `src/storefront/` (currency UI)
- Payment integration

**Validation**:
- Test currency conversion
- Verify pricing accuracy
- Check payment processing

---

### NAB-P3-010: Multi-Language Not Supported (Bengali Font Only, No i18n)
**Module**: Business/i18n  
**Estimated Effort**: 32 hours  
**Dependencies**: None

**Implementation Steps**:
1. Choose i18n solution (react-i18next)
2. Design translation schema
3. Implement translation files
4. Add language switcher
5. Update all UI text
6. Test translations

**Files to Modify**:
- Install i18n libraries
- Create translation files
- Update all components
- Add language switcher

**Validation**:
- Test language switching
- Verify translation accuracy
- Check RTL support (if needed)

---

## CODE CLEANUP ISSUES (3)

### NAB-P3-011: Unused `prisma.config.ts` File
**Module**: Code Cleanup  
**Estimated Effort**: 1 hour  
**Dependencies**: None

**Implementation Steps**:
1. Verify file is unused
2. Delete `prisma.config.ts`
3. Update documentation references
4. Test build

**Files to Modify**:
- Delete `prisma.config.ts`
- Update documentation

**Validation**:
- Verify file deletion
- Test build
- Check documentation

---

### NAB-P3-012: `@dnd-kit/utilities` May Be Unused
**Module**: Code Cleanup  
**Estimated Effort**: 2 hours  
**Dependencies**: None

**Implementation Steps**:
1. Search for usage of `@dnd-kit/utilities`
2. Remove if unused
3. Update package.json
4. Test functionality

**Files to Modify**:
- `package.json`
- Remove imports if unused

**Validation**:
- Verify no usage
- Test DnD functionality
- Check build

---

### NAB-P3-013: Unused Imports and Commented-Out Code
**Module**: Code Cleanup  
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Implementation Steps**:
1. Run linter to find unused imports
2. Remove unused imports
3. Remove commented-out code
4. Test all affected files
5. Commit cleanup

**Files to Modify**:
- All files with unused imports/commented code

**Validation**:
- Test all affected files
- Verify no functionality broken
- Check build

---

## FRONTEND ISSUES (4)

### NAB-P3-014: FAQ Page No Search, No Category Grouping
**Module**: Frontend/FAQ  
**Estimated Effort**: 8 hours  
**Dependencies**: None

**Implementation Steps**:
1. Design FAQ search UI
2. Implement search functionality
3. Add category grouping
4. Implement category filtering
5. Test FAQ search

**Files to Modify**:
- `src/storefront/pages/FaqPage.tsx`
- FAQ data structure

**Validation**:
- Test search functionality
- Verify category grouping
- Check filtering

---

### NAB-P3-015: PWA Install Prompt Not Configured
**Module**: Frontend/PWA  
**Estimated Effort**: 6 hours  
**Dependencies**: NAB-P1-018

**Implementation Steps**:
1. Configure PWA manifest
2. Implement install prompt
3. Add install button UI
4. Test PWA installation

**Files to Modify**:
- `public/site.webmanifest`
- `src/app/App.tsx`
- PWA configuration

**Validation**:
- Test PWA installation
- Verify manifest
- Check install prompt

---

### NAB-P3-016: 404 Page Lacks Brand Consistency
**Module**: Frontend/ErrorPages  
**Estimated Effort**: 4 hours  
**Dependencies**: None

**Implementation Steps**:
1. Design branded 404 page
2. Implement 404 component
3. Add navigation back to home
4. Test 404 page

**Files to Modify**:
- `src/pages/NotFoundPage.tsx`

**Validation**:
- Test 404 page
- Verify brand consistency
- Check navigation

---

### NAB-P3-017: No Empty State for Wishlist When Not Logged In
**Module**: Frontend/Wishlist  
**Estimated Effort**: 4 hours  
**Dependencies**: NAB-P1-029

**Implementation Steps**:
1. Design empty state component
2. Add empty state to wishlist
3. Add login prompt
4. Test empty state

**Files to Modify**:
- `src/storefront/pages/WishlistPage.tsx`

**Validation**:
- Test empty state
- Verify login prompt
- Check UX

---

### NAB-P3-018: `window.confirm()` for Address Delete (Breaks Premium UX)
**Module**: Frontend/UX  
**Estimated Effort**: 2 hours  
**Dependencies**: NAB-P1-024

**Implementation Steps**:
1. Replace `window.confirm()` with custom dialog
2. Use existing confirmation dialog component
3. Test address deletion

**Files to Modify**:
- `src/storefront/pages/AddressesPage.tsx`

**Validation**:
- Test custom dialog
- Verify deletion flow
- Check UX

---

## IMPLEMENTATION SEQUENCE

### Week 1: Infrastructure
- NAB-P3-001: Preview deployments
- NAB-P3-002: Rollback mechanism
- NAB-P3-003: Staging environment
- NAB-P3-004: Feature flags

### Week 2: Code Cleanup
- NAB-P3-011: Unused prisma.config.ts
- NAB-P3-012: Unused @dnd-kit/utilities
- NAB-P3-013: Unused imports/commented code

### Week 3: Frontend Polish
- NAB-P3-014: FAQ search
- NAB-P3-015: PWA install prompt
- NAB-P3-016: 404 page
- NAB-P3-017: Wishlist empty state
- NAB-P3-018: Address delete dialog

### Week 4-5: Business Features (Loyalty & Referral)
- NAB-P3-005: Loyalty program
- NAB-P3-006: Referral program

### Week 6-7: Business Features (Gift Cards & Subscriptions)
- NAB-P3-007: Gift cards
- NAB-P3-008: Subscriptions

### Week 8-9: Business Features (Multi-Currency & i18n)
- NAB-P3-009: Multi-currency
- NAB-P3-010: Multi-language

## TOTAL ESTIMATED EFFORT
**195 hours** (approximately 5 weeks for 1 developer, or 2.5 weeks for 2 developers)

## SUCCESS CRITERIA
- All 18 P3 issues resolved
- Infrastructure enhanced
- Business features implemented
- Code cleanup complete
- Frontend polished

## RISKS & MITIGATIONS
- **Risk**: Business feature complexity
  - **Mitigation**: Start with MVP, iterate based on feedback
- **Risk**: i18n translation maintenance
  - **Mitigation**: Use translation management platform, automate where possible
- **Risk**: Feature flag overhead
  - **Mitigation**: Keep flag management simple, document usage
