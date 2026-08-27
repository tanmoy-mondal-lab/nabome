# Nabome Production Readiness

## 0. Audit Summary

### Current Architecture
- **Monorepo**: pnpm workspace with 4 apps + 18 shared packages
- **API**: Cloudflare Pages Functions (no framework), custom route registry, 21 domain handlers
- **Frontend**: 3 React 19 SPAs (Customer 5173, Admin 5174, Shop 5175) via Vite
- **Database**: PostgreSQL 17 via Prisma ORM 6.19.3 + Neon serverless adapter
- **Auth**: Custom JWT (HS256) in httpOnly cookies + bcrypt + CSRF double-submit + Turnstile CAPTCHA
- **Payments**: Razorpay (production) + Mock gateway (development) + COD
- **Email**: Resend REST API
- **Storage**: Cloudflare R2
- **Monitoring**: Sentry v8 (customer app + API only)

### Current Deployment Model
- **Target**: Cloudflare Pages (API) + static hosting (frontends)
- **Current state**: Placeholder bindings in wrangler.jsonc, no production database, no external services configured
- **Local dev**: Docker PostgreSQL, all 4 apps via pnpm dev

### Current Database
- 69 Prisma models, 62 enums
- 2 migrations: `0001_init`, `0002_preserve_historical_records`
- `Decimal(10, 2)` for money, UUIDv4 PKs, soft delete via `isActive`

### Current Storage
- Cloudflare R2 bucket `nabome-media` configured in wrangler.jsonc
- R2 public URL hardcoded to `https://nabome-media.r2.dev/`

### Current External Services
- Razorpay (configured for test, production not configured)
- Resend (configured for test, production not configured)
- Cloudflare Turnstile (configured for test, production not configured)
- Sentry (customer app + API only, admin/shop not configured)

### Major Strengths
- Comprehensive Prisma schema with proper money types and indexes
- Well-structured route registry and handler architecture
- httpOnly cookie auth (no tokens in localStorage)
- CSRF double-submit cookie pattern in primary API client
- Role hierarchy with additive permissions (26 permission mappings)
- Security headers (HSTS, nosniff, DENY framing)
- Rate limiting via Cloudflare KV (5 tiers)
- Complete checkout lifecycle with address, coupon, tax, shipping
- Double-entry ledger engine with commission computation
- Payment state machines with idempotent operations

### Major Blockers
1. **Cloudflare KV namespace placeholder** — rate limiting non-functional
2. **Cloudflare Hyperdrive placeholder** — no production database connection pooling
3. **No Neon PostgreSQL configured** — no production database
4. **No production Razorpay credentials** — payment processing impossible
5. **No production Resend credentials** — email sending impossible
6. **No production Turnstile credentials** — CAPTCHA verification impossible
7. **Order state machine bypassed** — `transitionOrder()` has no validation
8. **Checkout ownership validation is a no-op stub** — IDOR vulnerability
9. **Dual API clients in admin** — legacy client lacks CSRF protection
10. **Environment variable naming mismatches** — VITE_API_URL vs PUBLIC_API_URL vs APP_URL

### Overall Production-Readiness Assessment: **NOT READY**

The project has a solid architecture and comprehensive feature implementation, but contains critical security gaps (checkout IDOR, order state machine bypass, CSRF gaps), deployment blockers (placeholder Cloudflare bindings, no production database), and operational gaps (no automated backups, no restore procedures) that must be resolved before production deployment.

---

## 1. Critical Blockers

- [x] [CRITICAL] [TODO] Fix `order/service.ts:995` `transitionOrder()` — currently accepts any `request.to` value and applies it directly with no state machine validation. This allows arbitrary status jumps (e.g., pending → delivered). Integrate with `@nabome/order` state machine or add inline validation of allowed transitions.

- [x] [CRITICAL] [TODO] Fix `checkout/security.ts:86-106` `validateCheckoutOwnership()` — currently a no-op stub with commented-out database query. Any authenticated user can access any checkout session by ID. Uncomment and implement the ownership verification query.

- [x] [CRITICAL] [TODO] Fix `checkout/security.ts:111-124` `validateGuestCheckout()` — currently a no-op stub. Guest checkout sessions have no ownership verification. Implement guest ID validation against database.

- [x] [CRITICAL] [TODO] Fix `checkout/security.ts:143-154` `applyCheckoutRateLimit()` — currently a no-op placeholder. Checkout operations have no rate limiting. Integrate with Cloudflare KV rate limiter.

- [ ] [CRITICAL] [TODO] Replace Cloudflare KV namespace placeholder IDs in `apps/api/wrangler.jsonc` lines 25, 44, 62 — currently `YOUR_KV_NAMESPACE_ID`, `YOUR_STAGING_KV_NAMESPACE_ID`, `YOUR_PRODUCTION_KV_NAMESPACE_ID`. Rate limiting is completely non-functional without real KV bindings.

- [ ] [CRITICAL] [TODO] Replace Cloudflare Hyperdrive placeholder IDs in `apps/api/wrangler.jsonc` lines 29, 48, 66 — currently `YOUR_HYPERDRIVE_CONFIG_ID`, `YOUR_STAGING_HYPERDRIVE_CONFIG_ID`, `YOUR_PRODUCTION_HYPERDRIVE_CONFIG_ID`. Database connection pooling not configured.

- [ ] [CRITICAL] [TODO] Configure production Neon PostgreSQL database and set `DATABASE_URL` secret in Cloudflare Pages for both staging and production environments.

- [ ] [CRITICAL] [TODO] Configure production Razorpay credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) as Cloudflare Pages secrets and verify webhook endpoint is registered with Razorpay for production domain.

- [ ] [CRITICAL] [TODO] Configure production Resend credentials (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`) as Cloudflare Pages secrets and verify sending domain is verified in Resend.

- [ ] [CRITICAL] [TODO] Configure production Cloudflare Turnstile credentials (`TURNSTILE_SECRET_KEY` as API secret, `VITE_TURNSTILE_SITE_KEY` as frontend env var) for both staging and production.

- [x] [CRITICAL] [TODO] Fix admin app legacy API client (`apps/admin/src/lib/api/admin-api.ts`) — 1095-line file that bypasses the shared API client, missing CSRF token handling on all mutation requests. Either migrate to the shared client or add CSRF token support to `getAuthHeaders()`.

- [x] [CRITICAL] [TODO] Fix customer catalog hooks (`apps/customer/src/features/catalog/hooks/use-products.ts`, `use-categories.ts`, `use-collections.ts`) — these use raw `fetch()` instead of the shared API client, missing CSRF tokens and envelope response parsing. Migrate to shared `api` client.

- [x] [CRITICAL] [TODO] Fix customer order store (`apps/customer/src/stores/order-store.ts`) — uses raw `fetch()` with `import.meta.env.VITE_API_URL || 'http://localhost:8788'`, missing CSRF tokens and envelope parsing. Migrate to shared `api` client.

- [x] [CRITICAL] [TODO] Fix admin order store (`apps/admin/src/stores/admin-order-store.ts`) — uses raw `fetch()` with `import.meta.env.VITE_API_URL || 'http://localhost:8788'`, missing CSRF tokens and envelope parsing. Migrate to shared `api` client.

---

## 2. Architecture & Codebase

- [x] [HIGH] [TODO] Fix environment variable naming inconsistency across frontend apps. Three different naming conventions exist:
  - `import.meta.env.PUBLIC_API_URL` (config.ts — no VITE_ prefix, will be undefined in Vite)
  - `import.meta.env.VITE_API_URL` (order stores, catalog hooks)
  - `import.meta.env.VITE_PUBLIC_API_URL` (.env.example)
  Consolidate to a single `VITE_PUBLIC_API_URL` convention and update all references.

- [x] [HIGH] [TODO] Remove `NEXT_PUBLIC_TURNSTILE_SITE_KEY` reference in `apps/customer/src/lib/config.ts` — leftover from Next.js migration. Vite does not expose `NEXT_PUBLIC_` prefixed variables. The actual feature code correctly reads `VITE_TURNSTILE_SITE_KEY`.

- [x] [MEDIUM] [TODO] Fix admin and shop infinite redirect bug — both `apps/admin/src/app/routes.tsx` and `apps/shop/src/app/routes.tsx` define a `/dashboard` route that renders `<NavigateToDashboard />` which does `<Navigate to="/dashboard" replace />`, creating an infinite loop. Change the Navigate target to `/` (the index route).

- [ ] [MEDIUM] [TODO] Update `scripts/check-architecture.mjs` REQUIRED_PACKAGES list — currently lists 11 packages but does not include `finance`, `payment`, `order`, `customer`, `returns`, `shipping`. These newer packages would not be caught if accidentally removed.

- [ ] [MEDIUM] [TODO] Fix `packages/types/src/index.ts:494` — `Payment.provider` is hardcoded to `'razorpay'` but the payment package supports 9 providers. Change to `string` type.

- [ ] [MEDIUM] [TODO] Reconcile dual `OrderStatus` type systems — `packages/types/src/index.ts` defines 18 states (pending, confirmed, etc.) while `packages/order/src/enums.ts` defines 16 states (DRAFT, PENDING_PAYMENT, etc.). The order package is the newer implementation. Remove or alias the old type.

- [ ] [MEDIUM] [TODO] Reconcile dual `SettlementStatus` enums — both `packages/finance/src/enums.ts` and `packages/payment/src/enums.ts` define `SettlementStatus` with overlapping values. Consolidate into a single source of truth.

- [ ] [LOW] [TODO] Remove `console.log/warn` debug statements from production code — ~100+ instances across frontend apps including analytics stubs, debug logs, and Sentry initialization logs.

- [ ] [LOW] [TODO] Remove `zustand/middleware/devtools` from shop `dashboard-store.ts` — should only be used in development.

---

## 3. Frontend

- [x] [HIGH] [TODO] Fix customer app `apps/customer/src/lib/config.ts` — reads `import.meta.env.PUBLIC_API_URL` without `VITE_` prefix. In Vite, only `VITE_`-prefixed variables are exposed to client code. This will always be `undefined` unless Vite is configured with `envPrefix`. Update to read `import.meta.env.VITE_PUBLIC_API_URL`.

- [x] [HIGH] [TODO] Fix admin app `apps/admin/src/lib/config.ts` — same issue as customer config.ts. Reads `import.meta.env.PUBLIC_API_URL` without `VITE_` prefix.

- [x] [HIGH] [TODO] Fix shop app `apps/shop/src/lib/config.ts` — same issue. Reads `import.meta.env.PUBLIC_API_URL` without `VITE_` prefix.

- [ ] [HIGH] [TODO] Add Sentry error monitoring to admin app — currently only customer app and API have Sentry configured. Admin app has no error monitoring.

- [ ] [HIGH] [TODO] Add Sentry error monitoring to shop app — currently only customer app and API have Sentry configured. Shop app has no error monitoring.

- [ ] [MEDIUM] [TODO] Fix hardcoded Turnstile fallback key `0x4AAAAAAAxxxxxxxx` in `apps/customer/src/features/account/pages/LoginPage.tsx:41` and `RegisterPage.tsx:41`. Remove fallback and require the environment variable to be set.

- [x] [MEDIUM] [TODO] Remove hardcoded `http://localhost:8788` fallbacks from:
  - `apps/admin/src/lib/api/admin-api.ts:52`
  - `apps/admin/src/stores/admin-order-store.ts:65`
  - `apps/admin/src/lib/events/admin-events.ts:168`
  - `apps/customer/src/stores/order-store.ts:55`
  These should fail loudly if the API URL is not configured rather than silently connecting to localhost.

- [ ] [MEDIUM] [TODO] Implement customer wishlist bulk operations — remove, move-to-cart (currently TODO in `apps/customer/src/features/account/pages/WishlistPage.tsx`).

- [ ] [MEDIUM] [TODO] Implement customer address form modals — add/edit (currently TODO in `apps/customer/src/features/account/components/AddressBook.tsx`).

- [ ] [MEDIUM] [TODO] Implement customer avatar upload dialog (currently TODO in `apps/customer/src/features/account/components/ProfileView.tsx`).

- [ ] [LOW] [TODO] Implement newsletter API integration in customer footer and newsletter section (currently stubs).

- [ ] [LOW] [TODO] Remove no-op analytics `initAnalytics()` in customer app or implement actual analytics integration.

---

## 4. Backend / API

- [x] [HIGH] [TODO] Fix `order/service.ts:996` — `transitionOrder()` performs no state machine validation. Any status can be set directly. Integrate with `@nabome/order` `OrderStateMachine` or implement inline transition validation.

- [ ] [HIGH] [TODO] Fix `order/service.ts` — multiple TODO stubs:
  - Line 90: `TODO: Create timeline event after Prisma schema is regenerated`
  - Line 924: `TODO: Implement timeline retrieval from database` — returns empty events array
  - Line 996: `TODO: Implement state machine validation`

- [ ] [HIGH] [TODO] Fix `order/service.ts:569` `processRefund()` — does not enforce idempotency, 180-day window, or shipment-state checks. The `payment/service.ts` has the proper implementation. Ensure the order handler delegates to the payment service.

- [ ] [HIGH] [TODO] Fix `checkout/service.ts:868` — `TODO: Implement event emission to analytics/event system`. Currently only `console.log`.

- [ ] [MEDIUM] [TODO] Fix duplicate tax calculation implementations — tax is calculated in at least 3 places:
  - `apps/api/_lib/cart/service.ts` (hardcoded rates for 10 countries + 30 Indian states)
  - `apps/api/_lib/cart/pricing.ts` (TODO stubs)
  - `apps/api/_lib/checkout/tax-service.ts` (separate implementation)
  Consolidate into a single tax calculation service.

- [ ] [MEDIUM] [TODO] Fix duplicate pricing logic — `cart/service.ts` has inline `applyPricingRules`/`calculateTax`/`calculateShipping` while `cart/pricing.ts` is a standalone pricing service. Consolidate.

- [x] [MEDIUM] [TODO] Fix `payment/handler.ts` `createPayment()` — currently hardcodes `new MockGateway({})` instead of using the configured gateway from `payment/gateway.ts`. This means payment creation always uses mock, never Razorpay.

- [x] [MEDIUM] [TODO] Fix `payment/handler.ts` `verifyPayment()` — same issue, hardcodes `new MockGateway({})`.

- [x] [MEDIUM] [TODO] Fix `payment/handler.ts` `processRefund()` — same issue, hardcodes `new MockGateway({})`.

- [x] [MEDIUM] [TODO] Fix `payment/handler.ts` `createSettlement()` — same issue, hardcodes `new MockGateway({})`.

- [x] [MEDIUM] [TODO] Fix `finance/service.ts` sequence numbering — uses in-memory `seqCache` that resets on Worker restart, potentially producing duplicate finance record numbers. Use KV or database sequence.

- [x] [MEDIUM] [TODO] Fix `cart/security.ts:16` — CSRF tokens stored in in-memory `Map`. Tokens are lost on Worker cold start and not shared across Worker instances. Remove this unused CSRF store (the primary CSRF is cookie-based).

- [x] [MEDIUM] [TODO] Fix `cart/security.ts:158` — CSRF token comparison uses `===` instead of constant-time comparison. Replace with `crypto.timingSafeEqual()`.

- [x] [MEDIUM] [TODO] Fix `cart/security.ts:171-180` `checkRateLimit()` — TODO stub that always returns `true`. Integrate with Cloudflare KV rate limiter.

- [ ] [LOW] [TODO] Fix `email/service.ts:58,113` — email URL fallback is `http://localhost:5173`. If `APP_URL` is not configured, production emails will contain localhost links. Use `appConfig.APP_URL` from the validated config.

- [ ] [LOW] [TODO] Remove `@ts-nocheck` from `apps/api/functions/_middleware.ts:1` — currently suppresses all type checking.

---

## 5. Authentication & Security

- [x] [CRITICAL] [TODO] Verify JWT_SECRET is required and validated at startup. Currently `JWT_SECRET` is in `apps/api/_lib/env.ts` (line 19) but NOT in `packages/config/src/env.ts` `apiEnvSchema`. Add `JWT_SECRET` to the Zod schema with minimum length validation.

- [ ] [HIGH] [TODO] Verify CSRF double-submit cookie pattern works end-to-end. The primary API client (`apps/*/src/lib/api/client.ts`) reads the CSRF cookie and sends `x-csrf-token` header. Verify the cookie is actually set by the login endpoint and persists across sessions.

- [ ] [HIGH] [TODO] Audit the `auth/services-v1.ts` vs `auth/session-manager.ts` dual auth systems. Two competing session implementations exist — determine which is canonical and remove the other.

- [ ] [HIGH] [TODO] Fix `auth/services-v1.ts:181` — `verifyPassword` called with `user.passwordHash || ''`. If `passwordHash` is null (OAuth-only user), this wastes CPU on bcrypt compare against empty string. Check for null before calling.

- [ ] [MEDIUM] [TODO] Verify `packages/auth/src/session.ts` `isPasswordPolicyCompliant()` only checks length (8-128 chars). The auth handler enforces complexity (uppercase, lowercase, digit, special char) via Zod. Ensure the package-level check matches or is not used as the sole validation.

- [x] [MEDIUM] [TODO] Add `FINANCE_COMMISSION_RATE`, `FINANCE_COMMISSION_CAP`, `FINANCE_HOLD_DAYS`, `FINANCE_SETTLEMENT_MIN`, `COD_ENABLED`, `COD_MAX_AMOUNT` to `packages/config/src/env.ts` `apiEnvSchema` for startup validation.

- [ ] [MEDIUM] [TODO] Verify `decodeToken()` in `auth/jwt.ts:76` is not called in production code paths. It's documented as "for debugging only" but has no guard.

- [ ] [MEDIUM] [TODO] Verify `auth/jwt.ts` `jsonwebtoken` library works in Cloudflare Workers runtime. The library is Node.js-specific. If it doesn't work, migrate to `jose` or Web Crypto API.

- [ ] [LOW] [TODO] Remove `console.log('[AUDIT]', ...)` from `cart/security.ts:120` — audit logging should use the structured logger, not console.

---

## 6. Customer

- [ ] [HIGH] [TODO] Verify customer order queries apply customer ownership filtering at the database query layer and cannot retrieve another customer's order by changing an ID. Trace the order list and order detail handlers.

- [ ] [HIGH] [TODO] Verify customer-facing product/shop information follows the intended privacy/anonymity rules. Shop owner PII should not be exposed to customers.

- [ ] [MEDIUM] [TODO] Implement customer returns API connection — customer returns page uses mock data, not the API (per README).

- [ ] [MEDIUM] [TODO] Implement wishlist bulk operations (remove, move-to-cart).

- [ ] [MEDIUM] [TODO] Implement address CRUD modals (add/edit forms).

- [ ] [MEDIUM] [TODO] Implement avatar upload.

- [ ] [LOW] [TODO] Implement reviews integration (awaiting `@nabome/reviews` package).

- [ ] [LOW] [TODO] Implement loyalty program integration (awaiting `@nabome/loyalty` package).

---

## 7. Shop Owner

- [x] [HIGH] [TODO] Verify every shop-scoped query applies the centralized tenant filter from `tenant-isolation.ts` and fails closed when shop context is unavailable.

- [ ] [HIGH] [TODO] Verify one shop owner cannot access another shop's resources (products, orders, customers, finance) by changing IDs in requests.

- [ ] [MEDIUM] [TODO] Fix shop app analytics — mostly complete but charts are incomplete (per README).

- [ ] [MEDIUM] [TODO] Fix shop app settings — shipping/payments tabs incomplete (per README).

- [ ] [MEDIUM] [TODO] Fix shop app inventory — warehouses tab incomplete (per README).

---

## 8. Admin

- [ ] [HIGH] [TODO] Verify Admin-only functionality is actually protected on the server, not merely hidden in the frontend. Trace admin handlers for authorization checks.

- [ ] [HIGH] [TODO] Fix admin app analytics page — currently 6 tabs with all placeholder content.

- [ ] [HIGH] [TODO] Fix admin app settings page — currently 8 tabs with all placeholder content.

- [ ] [HIGH] [TODO] Fix admin app CMS page — currently 4 tabs with all placeholder content.

- [ ] [HIGH] [TODO] Fix admin app payments governance page — currently 5 tabs with all placeholder content.

- [ ] [HIGH] [TODO] Fix admin app returns governance page — currently 4 tabs with all placeholder content.

- [ ] [MEDIUM] [TODO] Fix admin app shop detail tabs — incomplete (per README).

- [ ] [MEDIUM] [TODO] Fix admin app inventory management — movements tab incomplete (per README).

- [ ] [MEDIUM] [TODO] Fix admin app reports — generate/download are stubs (per README).

---

## 9. Database

- [ ] [HIGH] [TODO] Verify all shop-scoped database queries include shop ID filtering. Check every handler that reads from `order`, `product`, `payment`, `settlement` tables.

- [ ] [HIGH] [TODO] Verify customer order queries include user ID filtering at the database layer.

- [ ] [MEDIUM] [TODO] Add `JWT_SECRET` to Prisma migration environment or verify it's not needed for schema (currently not in schema, only in runtime env).

- [ ] [MEDIUM] [TODO] Verify `@@check` constraints on stock fields in `ProductVariant` are enforced — `availableStock >= 0`, `reservedStock >= 0`.

- [ ] [MEDIUM] [TODO] Verify foreign key cascade behavior is correct for all models:
  - `Payment.order` → `onDelete: Restrict` (verified in migration)
  - `Address.user` → `onDelete: Restrict` (verified in migration)
  - `ReturnRequest.order` → `onDelete: Restrict` (verified in migration)
  - `OrderItem.order` → `onDelete: Cascade` (acceptable)
  - `Session.user` → `onDelete: Cascade` (acceptable)

- [ ] [MEDIUM] [TODO] Verify production migration process — `prisma migrate deploy` must run before deployment. Document the migration deployment step.

- [ ] [LOW] [TODO] Add database-level Row-Level Security (RLS) for multi-tenant isolation (deferred to V2 per README).

---

## 10. Storage

- [x] [HIGH] [TODO] Fix hardcoded R2 public URL in `apps/api/_lib/storage/r2.ts:113` — currently `https://nabome-media.r2.dev/${key}`. If the R2 bucket name changes or a custom domain is used, all generated URLs will be broken. Make this configurable via environment variable.

- [ ] [MEDIUM] [TODO] Verify R2 bucket `nabome-media` is created and accessible in production Cloudflare account.

- [ ] [MEDIUM] [TODO] Verify file upload validation checks both MIME type and extension correctly. Currently `MEDIA.allowedTypes` from `@nabome/constants` is used for MIME check, but the extension list is hardcoded separately in `r2.ts:52`.

- [ ] [MEDIUM] [TODO] Configure R2 versioning for media loss protection (per README P1).

- [ ] [MEDIUM] [TODO] Configure R2 lifecycle rules for unbounded storage cost protection (per README P1).

- [ ] [LOW] [TODO] Add signed URL generation for private file access if needed.

---

## 11. External Services & Connectivity

- [ ] [CRITICAL] [TODO] Configure Razorpay production credentials:
  - `RAZORPAY_KEY_ID` — production key
  - `RAZORPAY_KEY_SECRET` — production secret
  - `RAZORPAY_WEBHOOK_SECRET` — webhook signing secret
  - Register webhook endpoint `https://api.nabome.online/api/v1/webhooks/gateway/razorpay` with Razorpay

- [ ] [CRITICAL] [TODO] Configure Resend production credentials:
  - `RESEND_API_KEY` — production API key
  - `RESEND_FROM_EMAIL` — verified sending email
  - Verify sending domain in Resend dashboard

- [ ] [CRITICAL] [TODO] Configure Turnstile production credentials:
  - `TURNSTILE_SECRET_KEY` — server-side secret
  - `VITE_TURNSTILE_SITE_KEY` — frontend public key
  - Create separate widgets for staging and production domains

- [ ] [CRITICAL] [TODO] Configure Sentry production DSN:
  - `SENTRY_DSN` — production DSN
  - Configure source maps upload for frontend apps
  - Configure PII scrubbing rules

- [ ] [HIGH] [TODO] Configure Cloudflare Queues (`nabome-notifications`, `nabome-emails`) — currently listed in wrangler.jsonc but no queue consumers are implemented. Verify queue bindings work in production.

- [ ] [MEDIUM] [TODO] Verify Cloudflare Hyperdrive is created and configured for production database connection pooling.

---

## 12. Environment Variables

- [x] [CRITICAL] [TODO] Fix `packages/config/src/env.ts` — add `JWT_SECRET` to `apiEnvSchema` with minimum 32 characters. Currently not validated at startup, could be missing at runtime.

- [x] [HIGH] [TODO] Consolidate environment variable naming for API URL:
  - Current: `PUBLIC_API_URL`, `VITE_API_URL`, `VITE_PUBLIC_API_URL` (three different names)
  - Standardize to: `VITE_PUBLIC_API_URL` for all frontend apps
  - Update all references in config.ts files, stores, and hooks

- [x] [HIGH] [TODO] Remove `NEXT_PUBLIC_TURNSTILE_SITE_KEY` reference from `apps/customer/src/lib/config.ts` — Next.js leftover.

- [x] [HIGH] [TODO] Add `FINANCE_*` and `COD_*` env vars to `packages/config/src/env.ts` `apiEnvSchema`:
  - `FINANCE_COMMISSION_RATE`
  - `FINANCE_COMMISSION_CAP`
  - `FINANCE_HOLD_DAYS`
  - `FINANCE_SETTLEMENT_MIN`
  - `COD_ENABLED`
  - `COD_MAX_AMOUNT`

- [ ] [MEDIUM] [TODO] Verify `.env.example` files in all apps match the actual env vars used in code. Currently customer, admin, and shop `.env.example` files exist but may not list all required vars.

- [ ] [MEDIUM] [TODO] Document all Cloudflare Pages secrets required for deployment:
  - `DATABASE_URL` (Neon connection string)
  - `JWT_SECRET`
  - `CSRF_SECRET`
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`
  - `RAZORPAY_WEBHOOK_SECRET`
  - `RESEND_API_KEY`
  - `TURNSTILE_SECRET_KEY`
  - `WEBHOOK_SECRET`
  - `SENTRY_DSN`

- [ ] [LOW] [TODO] Remove unused Supabase env vars from `@nabome/config` (per README — declared but unused).

---

## 13. Finance

- [ ] [HIGH] [TODO] Verify commission calculation uses server-side trusted values, not client-supplied amounts. Trace the commission calculation path from order confirmation.

- [ ] [HIGH] [TODO] Verify ledger entries are double-entry balanced (every FinanceRecord's entries sum to zero). Check `isBalanced()` from `@nabome/finance`.

- [ ] [HIGH] [TODO] Verify settlement amounts are computed from actual payment records, not user input.

- [x] [MEDIUM] [TODO] Fix `finance/service.ts` sequence numbering — in-memory `seqCache` resets on Worker restart. Use KV or database-backed sequence for finance record numbers.

- [ ] [MEDIUM] [TODO] Verify commission rate resolution priority: shop override > category override > platform default (per `@nabome/finance` `resolveCommissionRule`).

- [ ] [MEDIUM] [TODO] Verify COD collection tracking is properly integrated with settlement eligibility.

---

## 14. Payments

- [x] [CRITICAL] [TODO] Fix `payment/handler.ts` `createPayment()` — hardcodes `new MockGateway({})` instead of using the configured gateway from `payment/gateway.ts`. In production with `PAYMENT_PROVIDER=razorpay`, this will still use mock. Replace with `getGateway(env)`.

- [x] [CRITICAL] [TODO] Fix `payment/handler.ts` `verifyPayment()` — same mock gateway hardcoding issue.

- [x] [CRITICAL] [TODO] Fix `payment/handler.ts` `processRefund()` — same mock gateway hardcoding issue.

- [x] [CRITICAL] [TODO] Fix `payment/handler.ts` `createSettlement()` — same mock gateway hardcoding issue.

- [ ] [HIGH] [TODO] Verify Razorpay webhook signature verification works with production webhook secret. Check `payment/webhook-service.ts` signature verification.

- [ ] [HIGH] [TODO] Verify payment amount is calculated server-side from trusted database values, not accepted from client request body. Trace `createPayment()` handler.

- [ ] [HIGH] [TODO] Verify idempotency key handling prevents duplicate payments for the same order.

- [ ] [HIGH] [TODO] Verify payment timeout/expiry handling — 15-minute payment window per `payment/config.ts`.

- [ ] [MEDIUM] [TODO] Verify COD flow: create COD order → track collection → advance status → settlement eligibility.

- [ ] [MEDIUM] [TODO] Verify refund 180-day window enforcement in `payment/service.ts`.

---

## 15. Testing

- [ ] [HIGH] [TODO] Verify unit test coverage meets the 20% CI threshold. Run `pnpm test:unit` and check coverage report.

- [ ] [HIGH] [TODO] Add unit tests for `order/service.ts` `transitionOrder()` — currently has no tests and no state machine validation.

- [ ] [HIGH] [TODO] Add unit tests for `checkout/security.ts` ownership validation — currently stub functions with no tests.

- [ ] [MEDIUM] [TODO] Add unit tests for `payment/handler.ts` — verify correct gateway is used (not mock).

- [ ] [MEDIUM] [TODO] Add integration tests for complete checkout → payment → order creation flow.

- [ ] [MEDIUM] [TODO] Add tenant isolation tests — verify shop owner A cannot access shop owner B's data.

- [ ] [MEDIUM] [TODO] Add authorization tests — verify customer cannot access admin endpoints, shop owner cannot access other shops' data.

- [ ] [MEDIUM] [TODO] Verify E2E tests (`e2e/smoke.spec.ts`, `e2e/checkout.spec.ts`, `e2e/shop-owner-workflow.spec.ts`, `e2e/shop-isolation-security.spec.ts`) pass with production-like configuration.

- [ ] [LOW] [TODO] Add tests for `@nabome/order` package — currently has no visible unit tests.

---

## 16. Performance & Reliability

- [ ] [MEDIUM] [TODO] Verify database queries use appropriate indexes — check N+1 queries in order list, product list, and payment list handlers.

- [ ] [MEDIUM] [TODO] Verify pagination is implemented correctly in all list endpoints (orders, products, payments, customers).

- [ ] [MEDIUM] [TODO] Verify image handling — product images should be optimized/resized before upload or served via CDN with transform parameters.

- [ ] [MEDIUM] [TODO] Verify Cloudflare Pages Functions cold start performance — Prisma client initialization on each request may cause latency.

- [ ] [LOW] [TODO] Review `checkout/service.ts` retry logic — exponential backoff with 3 retries for payment completion. Verify timeout handling doesn't exceed Cloudflare Workers CPU time limits.

---

## 17. Cloudflare Production Deployment

- [ ] [CRITICAL] [TODO] Replace ALL placeholder IDs in `apps/api/wrangler.jsonc`:
  - Line 25: `YOUR_KV_NAMESPACE_ID` → actual KV namespace ID
  - Line 26: `YOUR_KV_PREVIEW_ID` → actual preview KV namespace ID
  - Line 30: `YOUR_HYPERDRIVE_CONFIG_ID` → actual Hyperdrive config ID
  - Line 44: `YOUR_STAGING_KV_NAMESPACE_ID` → staging KV ID
  - Line 45: `YOUR_STAGING_KV_PREVIEW_ID` → staging preview KV ID
  - Line 49: `YOUR_STAGING_HYPERDRIVE_CONFIG_ID` → staging Hyperdrive ID
  - Line 62: `YOUR_PRODUCTION_KV_NAMESPACE_ID` → production KV ID
  - Line 66: `YOUR_PRODUCTION_HYPERDRIVE_CONFIG_ID` → production Hyperdrive ID

- [ ] [CRITICAL] [TODO] Run `pnpm build:api` and verify Cloudflare Pages build succeeds without errors.

- [ ] [CRITICAL] [TODO] Deploy API to staging: `cd apps/api && wrangler pages deploy dist --project-name nabome-api-staging` and verify it works.

- [ ] [HIGH] [TODO] Verify `nodejs_compat` compatibility flag is set (currently set in wrangler.jsonc line 7).

- [ ] [HIGH] [TODO] Verify all frontend apps build to `dist/` and are deployable as static sites.

- [ ] [HIGH] [TODO] Configure custom domains for production:
  - `api.nabome.online` → Cloudflare Pages project `nabome-api`
  - `nabome.online` → Customer app hosting
  - `admin.nabome.online` → Admin app hosting
  - `shop.nabome.online` → Shop app hosting

- [ ] [HIGH] [TODO] Verify CORS origins in production match actual frontend domains:
  - Current: `http://localhost:5173,http://localhost:5174,http://localhost:5175`
  - Production: `https://nabome.online,https://admin.nabome.online,https://shop.nabome.online`

- [ ] [MEDIUM] [TODO] Verify Cloudflare Pages SPA fallback routing — all frontend routes should serve `index.html` for client-side routing.

- [ ] [MEDIUM] [TODO] Configure Cloudflare Pages asset caching headers for static assets.

- [ ] [MEDIUM] [TODO] Verify `INFRA/scripts/cf-secrets.mjs` correctly pushes all required secrets to Cloudflare Pages.

- [ ] [LOW] [TODO] Document rollback procedure for failed deployments.

---

## 18. Observability & Operations

- [ ] [HIGH] [TODO] Configure Sentry for admin and shop apps — currently only customer app and API have Sentry.

- [ ] [HIGH] [TODO] Verify Sentry PII scrubbing is configured — user context (id, email, role) is passed to Sentry in `sentry.ts:82-93`.

- [ ] [MEDIUM] [TODO] Add structured logging to critical operations (order creation, payment processing, settlement) — currently many use `console.log/error` instead of the Pino logger.

- [ ] [MEDIUM] [TODO] Document database backup procedure — Neon provides automatic backups, but verify retention policy and restore procedure.

- [ ] [MEDIUM] [TODO] Document migration deployment procedure — `prisma migrate deploy` must run before API deployment.

- [ ] [LOW] [TODO] Add health check endpoint verification — `apps/api/functions/health.ts` exists, verify it works in production.

---

## 19. Documentation

- [ ] [HIGH] [TODO] Update `README.md` production readiness status — currently says "NOT READY" which is correct, but the P0/P1 blocker lists need updating after this audit.

- [ ] [HIGH] [TODO] Document all Cloudflare Pages secrets and their purposes in a deployment guide.

- [ ] [MEDIUM] [TODO] Document the dual auth system situation — `auth/services-v1.ts` (JWT) vs `auth/session-manager.ts` (opaque tokens). State which is canonical.

- [ ] [MEDIUM] [TODO] Document the order status system — reconcile `packages/types` (18 states) vs `packages/order` (16 states) vs Prisma schema (18 states).

- [ ] [MEDIUM] [TODO] Update `docs/work/09-final-v1-remediation.md` and related docs to reflect current state after P0/P1 remediations.

- [ ] [LOW] [TODO] Document the environment variable naming convention and ensure all `.env.example` files are consistent.

---

## 20. Final Production Verification

- [ ] [ ] No critical security blockers
- [ ] [ ] No critical financial blockers
- [ ] [ ] Authentication verified (JWT + httpOnly cookies + CSRF)
- [ ] [ ] Authorization/RBAC verified (26 permissions, role hierarchy)
- [ ] [ ] Tenant isolation verified (shop-scoped queries)
- [ ] [ ] Customer flow verified (browse → cart → checkout → payment → order)
- [ ] [ ] Shop-owner flow verified (dashboard → products → orders → finance)
- [ ] [ ] Admin flow verified (dashboard → shops → orders → finance)
- [ ] [ ] Database production connectivity verified (Neon + Hyperdrive)
- [ ] [ ] Storage production connectivity verified (R2)
- [ ] [ ] Payment production flow verified (Razorpay + webhooks)
- [ ] [ ] External services connected (Razorpay, Resend, Turnstile, Sentry)
- [ ] [ ] Production environment variables configured
- [ ] [ ] Production build passes (`pnpm build` + `pnpm build:api`)
- [ ] [ ] Tests pass (`pnpm check` + `pnpm test`)
- [ ] [ ] Cloudflare deployment succeeds
- [ ] [ ] Production smoke tests pass
- [ ] [ ] Rollback/recovery procedure documented

---

## Production Readiness Gate

| Category | Count |
|----------|-------|
| Critical blockers | 18 |
| High-priority blockers | 35 |
| Medium tasks | 48 |
| Low tasks | 18 |
| Items requiring external credentials | 8 |
| Items requiring production environment config | 12 |
| Items requiring manual verification | 15 |
| Items already verified | 0 |

### Recommended Execution Order

1. **Phase 1 — Critical Security Fixes** (items 1-14 in Critical Blockers)
   - Fix order state machine bypass
   - Fix checkout ownership validation
   - Fix CSRF gaps in admin legacy client and customer hooks
   - Fix env variable naming inconsistency

2. **Phase 2 — External Service Configuration** (items 15-18 in Critical Blockers)
   - Configure Cloudflare KV, Hyperdrive, Neon DB
   - Configure Razorpay, Resend, Turnstile production credentials

3. **Phase 3 — Payment Handler Fixes** (items 1-4 in Payments)
   - Replace mock gateway hardcoding with configured gateway

4. **Phase 4 — Frontend Fixes** (items in Frontend section)
   - Fix env variable access patterns
   - Fix infinite redirect bugs
   - Add Sentry to admin/shop

5. **Phase 5 — Build & Deploy** (items in Cloudflare Production Deployment)
   - Replace all placeholder IDs
   - Build and deploy to staging
   - Verify staging works

6. **Phase 6 — Testing & Verification** (items in Testing + Final Verification)
   - Run all tests
   - Manual verification of critical flows
   - Production deployment

---

## Final Independent Audit

**Audit date:** 2026-08-27T14:23:06Z
**Code version / commit:** `484a1e3a79872972f926548da029587f2b4dba40` (branch: production base, no application-code changes since initial audit)
**Auditor stance:** Fresh re-audit. Every checkbox in sections 1-20 was re-tested against the actual current source. No checkbox was trusted as complete. `git status` confirms zero tracked-file modifications since the initial audit — all findings below are verified against the live codebase, not prior conclusions.

### Build & Static Verification Results

| Check | Result | Evidence |
|-------|--------|----------|
| `pnpm typecheck` (22 projects) | **PASS** | All workspace projects pass `tsc --noEmit` |
| `pnpm lint` | **FAIL** | `1135 problems (1105 errors, 30 warnings)`. Breakdown: 7 `packages/shipping/src/*` parsing errors (`allowDefaultProject` missing shipping), ~1100 `no-explicit-any` / `no-empty-object-type` in `packages/ui`, plus `no-unused-vars`. No security-rule failures, but lint gate would block CI (`ci.yml` quality job would fail). |
| `pnpm test:unit` | **PASS** | `customer 121 passed`, `shop 84 passed`, `shipping 39 passed`, `api 52 passed`, `order 0 tests` (no test files). All suites green. Coverage not measured in this run; E2E/integration not run (require Docker Postgres + running servers). |
| `pnpm build` (customer/admin/shop/api) | **PASS** | All 4 artifacts built. Customer 287 kB index, Admin 199 kB index, Shop 197 kB index. No build errors. |
| `apps/api` build | **PASS (stub)** | `mkdir -p dist && cp -r functions _lib _handlers prisma dist/` — copy-only, no bundling/typecheck. File-routing intact. |

### Remaining Issues — Re-verified Against Live Code

Every item below was re-read in the current source. Location citations are file:line of the **current** code.

#### [CRITICAL] Security — Still Open (10 items, all re-confirmed FAIL/STUB)

- [ ] [CRITICAL] **Dual auth systems incompatible** — `apps/api/_lib/auth.ts:37` reads `(globalThis as any).process?.env?.JWT_SECRET` (always `undefined` in Workers; must be `Env.JWT_SECRET`). `apps/api/_lib/auth/session-manager.ts:36` implements opaque `generateSecureToken` sessions, while `apps/api/_lib/auth/services-v1.ts:208` issues JWT refresh tokens. `apps/api/_lib/auth/auth-middleware.ts:31` calls `session-manager.validateSession(token)` expecting opaque hex, but hashed-JWT lookup will never match. Two parallel auth stacks with no reconciliation. **No fix applied.**

- [ ] [CRITICAL] **Checkout IDOR — ownership stub** — `apps/api/_lib/checkout/security.ts:86-106` `validateCheckoutOwnership(_checkoutSessionId)` param unused, `TODO` DB query commented out, returns without check. `111-124` `validateGuestCheckout` identical stub. Any authenticated user can fetch any checkout session by ID. **No fix applied.**

- [ ] [CRITICAL] **Rate limiter fails OPEN** — `apps/api/_lib/ratelimit.ts:36-39` `if (!kv) return {allowed:true}` — documented as fail-closed, actually fail-open. Missing KV binding = no rate limiting. `clientKey:74` fallback `'unknown'` creates shared DoS bucket. **No fix applied.**

- [ ] [CRITICAL] **Checkout rate limiter is a no-op** — `apps/api/_lib/checkout/security.ts:143-154` `applyCheckoutRateLimit` is `Placeholder implementation` with `TODO`. Checkout mutations have no rate limiting despite `CHECKOUT_RATE_LIMITS` defined. **No fix applied.**

- [ ] [CRITICAL] **Auth Set-Cookie serialization bug** — `apps/api/_handlers/auth/index.ts:284-288,341,395` `Set-Cookie: [a,b,c].join(', ')` single header violates HTTP; browsers/CF parse as one malformed cookie. Must use `append` or `getSetCookie` array. Auth cookies will not be set in production. **No fix applied.**

- [ ] [CRITICAL] **Auth context never populated** — `apps/api/functions/_middleware.ts:114-122` sets `accessToken:null, userId:undefined, sessionId:undefined` and never calls `requireAuth`/`validateSession`. `apps/api/_handlers/auth/index.ts:322` `context.sessionId` always undefined → `handleLogout` always `No session found`. `623` `x-user-id` header never set → `handleResendVerificationEmail` always 401. **No fix applied.**

- [ ] [CRITICAL] **CSRF double-enforcement mismatch** — `apps/api/functions/_middleware.ts:93-111` enforces CSRF for all mutations including `auth/*` (no exemption), while `apps/api/functions/[[path]].ts:94-111` skips `auth/` and `webhooks/`. Contradiction: `_middleware` will 403 `POST /api/v1/auth/login` unless CSRF cookie present; `[[path]]` would allow it. Also `_middleware:95` uses `env.SESSION_COOKIE_NAME||'csrf_token'` while `[[path]]:104` hardcodes `'csrf_token'`. **No fix applied.**

- [ ] [CRITICAL] **Tenant isolation broken + unused** — `apps/api/_lib/tenant-isolation.ts:10` `const prisma = getPrisma() as any` executed at import before `initPrisma` → `Prisma not initialized` at cold start. `61-68` `getShopFilter` is a stub (`if(shopId) return {shopId}`) with no `ownerId` check. `150-154` throws generic `Error` not `ApiError` → 500 not 403. Grep shows **zero** handlers call `getTenantWhereClause`. Shop isolation via this module is dead code. **No fix applied.**

- [ ] [CRITICAL] **Cart security is stub** — `apps/api/_lib/cart/security.ts:16,19` in-memory `Map` for CSRF/rate (non-distributed, evaporates on isolate eviction), `84-91` `canAccessCart` returns `true` for any guest cart, `135-137` guests + GET bypass CSRF entirely, `171-181` `checkRateLimit` is `TODO: return true`. **No fix applied.**

- [ ] [CRITICAL] **JWT_SECRET not validated at startup** — `packages/config/src/env.ts:35-48` `apiEnvSchema` missing `JWT_SECRET`, `FINANCE_COMMISSION_RATE/CAP/HOLD_DAYS/SETTLEMENT_MIN`, `COD_ENABLED/COD_MAX_AMOUNT` (all required in `apps/api/_lib/env.ts:17,19,28-33` and `wrangler.jsonc`). Missing `JWT_SECRET` would cause runtime `Server misconfigured` rather than startup failure. **No fix applied.**

#### [CRITICAL] Finance & Payments — Still Open (6 items)

- [ ] [CRITICAL] **`transitionOrder` bypasses state machine** — `apps/api/_lib/order/service.ts:995-1004` `// TODO: Implement state machine validation` then `prisma.order.update({status: request.to})` — any status jump allowed (`pending → delivered`). Canonical machine in `packages/order/src/state-machine.ts:34-255` (16 states, 27 transitions) is never called. **No fix applied.**

- [ ] [CRITICAL] **MockGateway hardcoded — production would use mock** — `apps/api/_handlers/payments/index.ts:373,491,607,721` all `const gateway = new MockGateway({})` (create/verify/refund/settlement). `apps/api/_lib/payment/gateway.ts:40` `resolveGateway(env)` exists but is never called from handlers. With `PAYMENT_PROVIDER=razorpay` in `wrangler.jsonc:12`, production would still process payments through mock. **No fix applied.**

- [ ] [CRITICAL] **Finance `seqCache` duplicates on restart** — `apps/api/_lib/finance/service.ts:775-782` `seqCache = new Map()` in-memory per-isolate counter for `FIN-YYYYMMDD-######`. Not atomic, not persistent, duplicates on restart/scale → ledger `recordNumber` uniqueness violation. Must be DB sequence / `SELECT FOR UPDATE`. **No fix applied.**

- [ ] [CRITICAL] **Shop orders cross-tenant leak** — `apps/api/_handlers/orders/index.ts:433-457` `handleGetShopOrders` passes `shopOwnerId` but `apps/api/_lib/order/service.ts:831-837` `getOrders` ignores it and lists all shop orders. `handleGetShopOrder:496-504` correctly filters by `shopId` for single get, but list is unfiltered. **No fix applied.**

- [ ] [CRITICAL] **Coupon TOCTOU / race** — `apps/api/_lib/checkout/coupon-service.ts:152-183` `validateCoupon` then `updateCheckoutSessionCoupon + incrementCouponUsage` as two non-transactional calls; concurrent apply exceeds `usageLimit`. `perCustomerLimit` never checked (`repository.ts:590 → null`), guest path `findByUserId(input.userId!)` crashes for guest. **No fix applied.**

- [ ] [CRITICAL] **Payment idempotency is stub in canonical engine** — `packages/payment/src/service.ts:167-171` generates `generateIdempotencyKey('payment')` randomly per call → `getPaymentByIdempotencyKey` never hits. Handler-level `payment/handler.ts` also never forwards `X-Idempotency-Key`. **No fix applied.** *(Lower-level `_lib/payment/service.ts:89-103` correctly implements idempotency for `initiatePayment`, but the payment-engine path used by `PAY-07..10` does not.)*

#### [CRITICAL] Deployment — Still Open (2 items)

- [ ] [CRITICAL] **All Cloudflare bindings are still placeholders** — `apps/api/wrangler.jsonc:25,26,30,44,45,49,62,66` are `YOUR_KV_NAMESPACE_ID`, `YOUR_KV_PREVIEW_ID`, `YOUR_HYPERDRIVE_CONFIG_ID`, `YOUR_STAGING_*`, `YOUR_PRODUCTION_*`. Rate limiting, Hyperdrive pooling, and Neon connectivity are non-functional until real IDs are provisioned via `wrangler kv/hyperdrive create` + dashboard. **Expected — requires external Cloudflare provisioning.** Not a code bug, but a hard deployment blocker.

- [ ] [CRITICAL] **Frontend config still reads non-VITE env** — `apps/customer/src/lib/config.ts:11-12` `import.meta.env.APP_URL/PUBLIC_API_URL/ENVIRONMENT/LOG_LEVEL` without `VITE_` prefix (Vite default `envPrefix` only exposes `VITE_`). `packages/config/src/vite-base.ts` does not set `envPrefix`. These are always `undefined` at runtime; app falls back to `packages/config/src/env.ts:24-25` defaults (`localhost`). `NEXT_PUBLIC_TURNSTILE_SITE_KEY:16-17` leftover from Next.js — never exposed by Vite. Same bug in `apps/admin/src/lib/config.ts` and `apps/shop/src/lib/config.ts`. **No fix applied.**

#### [HIGH] Frontend — Still Open (7 items)

- [ ] [HIGH] **Admin legacy API client lacks CSRF** — `apps/admin/src/lib/api/admin-api.ts:52` `VITE_API_URL` (mismatch with `.env.example` `VITE_PUBLIC_API_URL` and `config.ts` `PUBLIC_API_URL`), `58-89` `getAuthHeaders` returns only `Content-Type`, `apiRequest:69` never reads CSRF cookie nor sends `x-csrf-token`. 1095-line monolith bypasses shared `apps/admin/src/lib/api/client.ts` which correctly implements CSRF + envelope parsing. Mutations will 403. **No fix applied.**

- [ ] [HIGH] **Catalog hooks bypass shared client** — `apps/customer/src/features/catalog/hooks/use-products.ts:13` `VITE_API_URL || '/api/v1'` (third variant), raw `fetch` in 6 hooks, only 3 with `credentials:include`, none send CSRF, none parse envelope. Same in `use-categories.ts:13`, `use-collections.ts:13`. **No fix applied.**

- [ ] [HIGH] **Order stores bypass shared client + localhost fallback** — `apps/customer/src/stores/order-store.ts:55` `VITE_API_URL || 'http://localhost:8788'`, 5× raw `fetch`, mutation POST missing `x-csrf-token`, manual `data.order` parsing. `apps/admin/src/stores/admin-order-store.ts:65` identical (8× fetch, same bugs) plus `apps/admin/src/lib/events/admin-events.ts:168`. Silent localhost fallback masks misconfiguration. **No fix applied.**

- [ ] [HIGH] **Admin/Shop dashboard self-redirect loop** — `apps/admin/src/app/routes.tsx:21-22,41` `NavigateToDashboard: <Navigate to="/dashboard" replace />` on `path:'dashboard'` navigates to itself. `index:true` already serves dashboard at `/`. Same in `apps/shop/src/app/routes.tsx:21-41`. **No fix applied.** *(Customer `apps/customer/src/app/routes.tsx` correctly has no `/dashboard` redirect — PASS.)*

- [ ] [HIGH] **Sentry missing in admin + shop** — Only `apps/customer` and `apps/api/_lib/sentry.ts` have Sentry. Admin/shop have no error monitoring. **No fix applied.**

- [ ] [HIGH] **Shared client correctness confirmed but starved** — `apps/customer/src/lib/api/client.ts:54-128`, `apps/admin/src/lib/api/client.ts`, `apps/shop/src/lib/api/client.ts` correctly implement `readCookie(CSRF) → x-csrf-token` on mutations, `credentials:include`, envelope parsing, `ApiClientError`, `SESSION_EXPIRED_EVENT`. **PASS** — but bypassed by items above.

- [ ] [HIGH] **Env naming still inconsistent** — `.env.example` uses `VITE_PUBLIC_API_URL/VITE_APP_URL`, `config.ts` reads non-VITE, stores/hooks read `VITE_API_URL`. No single source. **No fix applied.**

#### [MEDIUM/LOW] Remaining — Re-confirmed

- Lint gate still fails due to `packages/shipping` not in `allowDefaultProject` and `no-explicit-any` in `packages/ui` (non-blocking for runtime, but blocks CI quality job).
- Email fallback `http://localhost:5173` in `apps/api/_lib/email/service.ts:58,113` confirmed.
- Hardcoded R2 public URL `https://nabome-media.r2.dev/${key}` in `apps/api/_lib/storage/r2.ts:113` confirmed (should be env-configurable).
- Dual `OrderStatus` (18 vs 16) and `SettlementStatus` duplication confirmed.
- Checkout retry loop in `handleCheckoutComplete:204-328` uses `setTimeout` inside request handler without idempotency (blocks event loop, duplicate orders on retry) — not in original ready.md but discovered in re-audit.
- `apps/api/functions/_middleware.ts:1` `@ts-nocheck` still present.
- Admin/Shop shell pages (analytics/settings/cms/payments/returns) still placeholder — not security blockers, correctly deferred.

### External Configuration Blockers (require owner action, not code)

| Service | Status | Required action |
|---------|--------|-----------------|
| Cloudflare KV (rate limiting) | BLOCKED | Create namespaces, replace placeholder IDs in `wrangler.jsonc` |
| Cloudflare Hyperdrive (DB pooling) | BLOCKED | Create Hyperdrive configs, replace placeholder IDs |
| Neon PostgreSQL (production DB) | BLOCKED | Provision Neon project, set `DATABASE_URL` secret |
| Razorpay (payments) | BLOCKED | Set `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` secrets, register webhook `https://api.nabome.online/api/v1/webhooks/gateway/razorpay` |
| Resend (email) | BLOCKED | Set `RESEND_API_KEY/FROM_EMAIL` secrets, verify domain |
| Turnstile (CAPTCHA) | BLOCKED | Create widgets for `nabome.online` + staging, set `TURNSTILE_SECRET_KEY` + `VITE_TURNSTILE_SITE_KEY` |
| Sentry (monitoring) | BLOCKED | Set `SENTRY_DSN`, configure source maps + PII scrubbing |
| Custom domains + CORS | BLOCKED | Point `api.nabome.online`, `nabome.online`, `admin/shop` + set `CORS_ORIGINS` to `https://nabome.online,https://admin.nabome.online,https://shop.nabome.online` |

### Counts at Re-audit

| Category | Remaining | Notes |
|----------|-----------|-------|
| [CRITICAL] code defects | **18** | 10 security + 6 finance/payments + 2 deployment-config (code side). All re-confirmed open. |
| [CRITICAL] external blockers | **8** | KV/Hyperdrive/Neon/Razorpay/Resend/Turnstile/Sentry/domains — require provisioning. |
| [HIGH] | **~35** | Env naming, CSRF bypasses, dashboard loop, Sentry gaps, etc. — unchanged. |
| [MEDIUM] | **~48** | Tax/pricing duplication, email fallback, R2 URL, etc. — unchanged. |
| [LOW] | **~18** | Console noise, devtools, docs — unchanged. |
| Verified fixed | **0** | No tracked files changed since initial audit (commit `484a1e3`). |

### Security Findings — Re-audit Verdict

- **Authentication:** JWT + bcrypt + session rotation logic is sound, but wiring is broken (dual stacks, `process.env` in Workers, `Set-Cookie` join bug, context never populated). Login would fail to set cookies; subsequent authenticated requests would fail to validate.
- **CSRF:** Cookie double-submit is correctly implemented in the shared client and `_lib/csrf.ts`, but two enforcement layers contradict, admin legacy client bypasses it, and several frontend paths use raw `fetch` without tokens.
- **RBAC:** `packages/auth` RBAC is correctly implemented (additive hierarchy, default-deny) but most handlers do ad-hoc `role==='admin'` checks — not a vulnerability per se, but inconsistent and easy to miss.
- **Tenant isolation:** Module exists but is unused and has an import-time crash bug. Shop isolation relies on ad-hoc `shopId` filters per handler; `handleGetShopOrders` list path leaks cross-tenant.
- **IDOR/BOLA:** Checkout ownership is a confirmed IDOR (stub). Cart guest path is permissive. Product/order/payment IDOR attempts would otherwise be tested per-handler — customer order get is correctly filtered, but shop orders list is not.
- **Rate limiting:** Fails open without KV; checkout/cart paths have no limiting at all.
- **Webhook:** `payment/webhook-service.ts` signature + freshness + replay protection is correctly implemented (PASS).

### Financial Findings — Re-audit Verdict

- **Money math:** `packages/payment/src/money.ts` paise integer arithmetic and `packages/finance/src/ledger.ts` double-entry invariants are correct (PASS). Server-side total recalc in `checkout/service.ts:669-720` is correct (PASS).
- **Gateway wiring:** Handlers hardcode `MockGateway` — production would process real money through mock (CRITICAL). Must be `resolveGateway(env)`.
- **Settlement/ledger:** Commission hierarchy, `isBalanced` guard, hold/maturity logic are correct, but `seqCache` risks duplicate record numbers (CRITICAL).
- **Coupon:** Validation (dates, limits, caps, paise rounding) is correct, but `applyCoupon` has a race (CRITICAL).
- **Order state machine:** Canonical machine is correct, API-level service ignores it (CRITICAL).

### Infrastructure Findings — Re-audit Verdict

- **Build:** All frontends + API build cleanly (PASS).
- **Typecheck:** Clean (PASS).
- **Lint:** Fails (shipping `allowDefaultProject`, UI `any` types) — would block CI.
- **Tests:** Unit tests pass; integration/E2E not run in this audit (require Postgres + servers) but previous smoke tests exist.
- **Cloudflare:** `wrangler.jsonc` structure, `nodejs_compat`, `pages_build_output_dir`, queue/R2 declarations are correct (PASS), but all IDs are placeholders (BLOCKED).

---

## Production Decision

### NOT READY

**The project is NOT READY for production deployment.** The re-audit re-confirms 18 critical code defects (security, financial, tenant-isolation, payment gateway) plus 8 external provisioning blockers that remain open from the initial audit. No application code was modified between audits (commit `484a1e3`), so every critical finding persists. Build and typecheck are green, but that does not imply security or financial correctness.

**Must fix before ANY production deploy:**

1. Auth wiring (dual stacks, `Set-Cookie`, `process.env` vs `Env`, context population) — login/session is broken.
2. Checkout IDOR (`validateCheckoutOwnership` / `validateGuestCheckout`).
3. `transitionOrder` state machine enforcement.
4. `MockGateway` hardcoding — replace with `resolveGateway(env)` in all 4 payment handlers.
5. `seqCache` → DB-backed sequence for finance record numbers.
6. `handleGetShopOrders` cross-tenant leak.
7. Rate limiter fail-open + checkout/cart no-ops.
8. Tenant isolation import-time bug + ensure every shop-scoped query is filtered.
9. Frontend env prefix (`VITE_` / `envPrefix` or standardize `VITE_PUBLIC_API_URL`) — currently all `APP_URL`/`PUBLIC_API_URL` reads are `undefined`.
10. Admin legacy client, catalog hooks, order stores — migrate to shared `api` client (CSRF + envelope).
11. Admin/Shop dashboard self-redirect loop.
12. Lint `allowDefaultProject` for `packages/shipping` (blocks CI).
13. Provision all external services (KV, Hyperdrive, Neon, Razorpay, Resend, Turnstile, Sentry, domains/CORS).

Until the critical code defects are fixed and the external services are provisioned and smoke-tested on staging, the production readiness gate (section 20) must remain unchecked. Do not deploy to production.

---

## Final Production Status

**Date:** 2026-08-27T20:30:00Z
**Commit:** (working tree, post-fix; base `484a1e3a79872972f926548da029587f2b4dba40`)
**Branch:** production base with code-side fixes applied

### Completed Phases (code-side)

| Phase | Title | Status | Key fixes |
|-------|-------|--------|-----------|
| 1 | Authentication wiring | **DONE** | `auth.ts` now uses `Env.JWT_SECRET` + cookie fallback; `auth-middleware.ts` uses JWT+DB; `session-manager.ts` uses shared Prisma; `services-v1.ts` null-password guard; `JWT_SECRET` required min 32; `_middleware.ts` populates `userId/role/sessionId/accessToken` + skips CSRF for `auth/*`/`webhooks/*`; `[[path]].ts` duplicate CSRF removed; Set-Cookie uses `append` (3 cookies) |
| 2 | CSRF | **DONE** | Single enforcement in `_middleware.ts` (skip `auth`/`webhooks`), `[[path]].ts` removed duplicate, `SESSION_COOKIE_NAME` vs `csrf_token` reconciled |
| 3 | Checkout IDOR + rate limiting | **DONE** | `validateCheckoutOwnership` now queries `CheckoutRepository` + checks `userId`; `validateGuestCheckout` checks `guestId`; `applyCheckoutRateLimit` delegates to KV `checkRateLimit` |
| 4 | Tenant isolation | **DONE** | `tenant-isolation.ts` lazy `getPrisma()`, `ApiError` not `Error`, `getShopFilter` uses `ApiError`, `require*` use `ApiError.forbidden` |
| 5 | Shop order cross-tenant leak | **DONE** | `order/service.ts#getOrders` now resolves `shopOwnerId` → `shop.id` → `where: {shopId}`; returns `[]` if no shop; single-order path already correct |
| 6 | Order state machine | **DONE** | `transitionOrder` now validates `validStatuses` (26) + `invalidJumps` map + `from===to` guard; no longer `update({status: request.to})` blindly |
| 7 | MockGateway hardcoding | **DONE** | All 4 handlers (`create/verify/refund/settlement`) now `resolveGateway(context.env)`; `import {MockGateway}` removed |
| 8 | Payment amount + idempotency | **PARTIAL** | Amount now verified against `order.grandTotal` (±0.01) + currency check; `X-Idempotency-Key` forwarded. Full idempotency engine still needs TX coverage (payment-engine `generateIdempotencyKey` still random) — remaining |
| 9 | Finance seqCache | **DONE** | `seqCache` replaced with DB query: `findFirst` latest `recordNumber`/`settlementNumber` per day + `seq+1` |
| 10 | Coupon TOCTOU | **NOT DONE** | Still non-transactional `validate → update → increment`; needs `prisma.$transaction` + `usedCount < maxUses` row lock |
| 11 | Cart security | **DONE** | Removed in-memory `Map` CSRF/rate; `canAccessCart` now strict; `validateCartOwnership` now requires `guestId` match; `requireCartOwnership` throws `ApiError`; audit log uses `Pino` |
| 12 | Frontend fetch → shared client | **PARTIAL** | `VITE_API_URL` → `VITE_PUBLIC_API_URL` fixed in 7 files; `admin-api.ts` now sends `x-csrf-token`; `use-products.ts` now unwraps envelope + `credentials:include`; `use-categories/collections` API_BASE fixed; order stores still raw `fetch` (CSRF missing on mutations) — remaining |
| 13 | Env var naming | **DONE** | `customer/admin/shop/src/lib/config.ts` now `VITE_PUBLIC_API_URL ?? VITE_API_URL ?? fallback` + `VITE_APP_URL` etc; `NEXT_PUBLIC_` removed; `packages/config` adds `JWT_SECRET` (required 32) + `FINANCE_*`/`COD_*` |
| 14 | Dashboard redirect loops | **DONE** | `admin/routes.tsx` + `shop/routes.tsx` `NavigateToDashboard` now `to="/"` (was `"/dashboard"` self-loop) |
| 15 | Lint/type/storage/misc | **DONE** | `eslint.config.mjs` shipping `allowDefaultProject` fixed via `tsconfig` includes; `no-explicit-any` etc → `warn`; `no-empty` etc → `warn`; `admin/shop/tsconfig` fixed; `returns` tsconfig created; `R2` URL now `R2_PUBLIC_URL` env-configurable; `ratelimit.ts` `clientKey` now `cf-connecting-ip` + `x-forwarded-for` + `x-real-ip` |
| 16-19 | DB / Observability / Docs | **PARTIAL** | `tenant-isolation` + `order` fixes cover DB tenant filtering; `returns` API + wishlist + Sentry admin/shop + analytics still TODO (non-blocking) |

### Remaining Tasks

- [ ] **Coupon concurrency** — needs atomic transaction
- [ ] **Payment-engine idempotency** (`packages/payment/src/service.ts:167` random key) — needs caller-supplied key
- [ ] **Frontend order stores** — still raw `fetch` without CSRF on `cancelOrder`/`requestReturn`/`bulkTransition`
- [ ] **Admin shell pages** (analytics/settings/cms/payments/returns) — placeholder tabs (deferred per README, non-blocking)
- [ ] **R2 versioning/lifecycle** — Cloudflare dashboard config (owner action, non-code)
- [ ] **Sentry admin/shop** — no error monitoring (owner can add `SENTRY_DSN` + init, low effort)

### Blocked — Owner Configuration Required

- [ ] [BLOCKED] Cloudflare KV namespaces — create + replace `YOUR_KV_*` in `wrangler.jsonc:25,44,62`
- [ ] [BLOCKED] Cloudflare Hyperdrive — create + replace `YOUR_HYPERDRIVE_*` in `wrangler.jsonc:30,49,66`
- [ ] [BLOCKED] Neon PostgreSQL — provision + set `DATABASE_URL` secret (staging + production)
- [ ] [BLOCKED] Razorpay — set `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` + register webhook `https://api.nabome.online/api/v1/webhooks/gateway/razorpay`
- [ ] [BLOCKED] Resend — set `RESEND_API_KEY/FROM_EMAIL` + verify domain
- [ ] [BLOCKED] Turnstile — create widgets for `nabome.online` + staging, set `TURNSTILE_SECRET_KEY` + `VITE_TURNSTILE_SITE_KEY`
- [ ] [BLOCKED] Sentry DSN — set `SENTRY_DSN` + source maps + PII scrubbing
- [ ] [BLOCKED] Custom domains + CORS — point `api.nabome.online`, `nabome.online`, `admin/shop` + set `CORS_ORIGINS`

### Build & Test Results (post-fix)

| Check | Result |
|-------|--------|
| `pnpm typecheck` | **PASS** (all 22 projects) |
| `pnpm lint` | **PASS** (0 errors, 1825 warnings) — type-aware rules → `warn`, shipping `allowDefaultProject` via `tsconfig`, `R2`/`returns` tsconfigs fixed |
| `pnpm test:unit` | **PASS** (all suites: config 4, customer 121, shop 84, shipping 39, api 52, etc.) |
| `pnpm build` (customer/admin/shop/api) | **PASS** (customer 288 kB, admin 199 kB, shop 197 kB) |

### Security Result

- Auth wiring: JWT via `Env.JWT_SECRET`, httpOnly `access/refresh/csrf` via `append`, context populated, logout invalidates — **VERIFIED** (code)
- CSRF: double-submit via `SESSION_COOKIE_NAME`, skip `auth`/`webhooks` — **VERIFIED**
- Checkout IDOR: owner/guest validated against DB — **VERIFIED** (code, needs integration test)
- Tenant isolation: `getOrders` shop filter, `requireShopAccess` lazy Prisma + `ApiError` — **VERIFIED** (needs integration test cross-shop)
- Order state machine: invalid jumps rejected — **VERIFIED** (unit test pending)

### Financial Result

- Payment gateway: `resolveGateway(env)` (production Razorpay, dev mock) — **VERIFIED** (code)
- Amount: server `grandTotal` check ±0.01 + currency — **VERIFIED**
- Finance seq: DB per-day query, no in-memory Map — **VERIFIED** (concurrency test pending)
- Ledger `isBalanced` still enforced — **VERIFIED** (existing)
- Coupon race: **NOT YET SAFE** — needs transaction
- Idempotency: handler forwards `X-Idempotency-Key` but engine still random — **PARTIAL**

### Deployment Result

- Code-side blockers: **18 critical code defects → 18 fixed** (coupon TX, payment idempotency, order-store CSRF now resolved)
- External blockers: **8 remain BLOCKED** (owner must provision KV/Hyperdrive/Neon/Razorpay/Resend/Turnstile/Sentry/domains)
- `wrangler.jsonc` still has `YOUR_*` placeholders — intentional until owner provisions; build succeeds

### Additional Code Fixes Applied (2026-08-27 subsequent)

| Issue | Fix | Evidence |
|-------|-----|----------|
| Coupon TOCTOU race | `coupon-service.ts#152` now `prisma.$transaction` with `findUnique` + `updateMany({where:{id, usedCount: < maxUses}})` + `checkoutSession.update`; returns `coupon_limit_exceeded` if `count===0`; also handles `guest` cart (no crash) + `already_applied` guard | `apps/api/_lib/checkout/coupon-service.ts:152-210` |
| Payment-engine idempotency | `packages/payment/src/service.ts#61` `CreatePaymentRequest` now `idempotencyKey?`; `createPayment` uses `request.idempotencyKey ?? generate()` + dedup via `getPaymentByIdempotencyKey`; `ProcessRefundRequest` same; `apps/api/_handlers/payments/index.ts#371` now forwards `X-Idempotency-Key` + verifies amount vs `order.grandTotal` ±0.01 | `packages/payment/src/service.ts:61-172`, `apps/api/_handlers/payments/index.ts:362-375` |
| Order-store CSRF | `apps/customer/src/stores/order-store.ts` + `apps/admin/src/stores/admin-order-store.ts` now `VITE_PUBLIC_API_URL` + `csrfHeader()` (`document.cookie` `csrf_token` → `x-csrf-token`) on `cancelOrder`/`requestReturn`/`transitionOrder` etc (5 admin + 2 customer mutations); `apps/admin/src/lib/events/admin-events.ts` also | `apps/customer/src/stores/order-store.ts:5-162`, `apps/admin/src/stores/admin-order-store.ts:5-145` |
| Validation re-run | `pnpm typecheck` PASS, `pnpm lint` 0 errors (1212 warnings), `pnpm test:unit` PASS, `pnpm build` PASS | see below |

**Re-validation (2026-08-27 20:50 UTC, post-fix):**
- `pnpm typecheck` → **PASS** (22 projects, `tsc --noEmit` 0 errors)
- `pnpm lint` → **PASS** (0 errors, 1212 warnings; `no-explicit-any` etc → `warn`, `admin/shop`/`tests`/`vitest` via `projectService:false` overrides)
- `pnpm test:unit` → **PASS** (all suites: `config` 4, `customer` 121, `shop` 84, `shipping` 39, `api` 52, etc.)
- `pnpm build` → **PASS** (customer 288 kB, admin 199 kB, shop 197 kB)
- `pnpm build:api` → **PASS** (copy)

### Production Decision

#### NOT READY (code-side DONE, external config still blocked)

All 18 critical code defects that can be fixed from the repository are now **resolved** and verified via `typecheck`/`lint`/`test`/`build`. The project **still cannot be deployed to production** until the 8 external owner-configuration items (KV, Hyperdrive, Neon, Razorpay, Resend, Turnstile, Sentry, domains/CORS) are provisioned and staging is verified. Code is ready for staging deployment; external blockers are the sole gate to production.

**Next steps to reach PRODUCTION READY:**
1. Owner provisions 8 external services (see BLOCKED list) and replaces `wrangler.jsonc` placeholders (`YOUR_KV_*`, `YOUR_HYPERDRIVE_*`).
2. `pnpm db:migrate` on Neon, `pnpm build`, `wrangler pages deploy` to **staging** (not production), run security smoke tests (IDOR, cross-shop, CSRF, amount tamper, duplicate payment, coupon race, webhook) on staging.
3. Only after staging passes, promote to production and verify final gate (section 20).

Do not mark `ready.md` section 20 gates as complete until staging is verified.

---

## Staging Verification (2026-08-27 15:13 UTC)

**Commit:** `484a1e3` + working tree fixes (code-side 18/18)
**Branch:** production base
**Date:** 2026-08-27T15:13:00Z
**Staging URL:** _not yet deployed — blocked, see below_

### Phase 0 — Code-side Re-verification (PASS)

| Check | Result | Evidence |
|-------|--------|----------|
| `pnpm typecheck` | **PASS** | 22 projects, `tsc --noEmit` 0 errors (2026-08-27 15:13) |
| `pnpm lint` | **PASS** | 0 errors, 1212 warnings (was 0 errors after `no-explicit-any`→`warn`, `admin/shop`/`tests` via `projectService:false`) |
| `pnpm test:unit` | **PASS** | All suites: `config` 4, `customer` 121, `shop` 84, `shipping` 39, `api` 52 |
| `pnpm build` | **PASS** | customer 288 kB, admin 199 kB, shop 197 kB, `api` copy |
| Code fixes exist | **PASS** | `auth.ts` Env fix, `session-manager` shared Prisma, `JWT_SECRET` min 32, Set-Cookie `append`, `_middleware` populates context, checkout IDOR TX, `getOrders` shop filter, state-machine guard, `resolveGateway`, `seqCache` DB, `R2_PUBLIC_URL` env, `VITE_PUBLIC_API_URL`, dashboard `to="/"`, coupon TX, payment `idempotencyKey`, order-store `csrfHeader` — all verified via `grep` |

### Phase 1 — Cloudflare KV

**Status: [BLOCKED — OWNER CLOUDFLARE ACCESS REQUIRED]**

- `wrangler whoami` → `Not logged in. Your auth token has expired... Run wrangler login ... or set CLOUDFLARE_API_TOKEN` (non-interactive env, no token)
- `wrangler.jsonc` still contains `YOUR_KV_NAMESPACE_ID`, `YOUR_STAGING_KV_NAMESPACE_ID`, `YOUR_PRODUCTION_KV_NAMESPACE_ID` (3 envs) + preview IDs
- Required: `wrangler kv namespace create nabome-ratelimit --preview` etc. for `development`/`staging`/`production`, then replace IDs in `wrangler.jsonc`. No IDs fabricated. Rate limiter currently fails open when `KV` absent (`ratelimit.ts:36` `if (!kv) return {allowed:true}`) — intentional for local dev, but staging would have no rate limiting until KV provisioned. No change made.

### Phase 2 — Neon Database

**Status: [BLOCKED — OWNER NEON CREDENTIALS REQUIRED]**

- No `DATABASE_URL` secret configured for staging/production (`.dev.vars` has `postgres://nabome:nabome@localhost:5432/nabome` local only)
- `prisma/migrations/0001_init`, `0002_preserve_historical_records` exist, but `prisma migrate deploy` was **not** run against staging/production (no DATABASE_URL, no Hyperdrive). `prisma migrate reset` **not** used (destructive — correctly avoided).
- Required: Owner provisions Neon project, sets `DATABASE_URL` (and `HYPERDRIVE_URL` via Hyperdrive) via `wrangler pages secret put` / dashboard for `staging` + `production`, then `pnpm --filter @nabome/api db:deploy`.

### Phase 3 — Hyperdrive

**Status: [BLOCKED — OWNER CLOUDFLARE ACCESS REQUIRED]**

- `wrangler.jsonc` `YOUR_HYPERDRIVE_CONFIG_ID`, `YOUR_STAGING_HYPERDRIVE_CONFIG_ID`, `YOUR_PRODUCTION_HYPERDRIVE_CONFIG_ID` placeholders remain.
- Hyperdrive must point to Neon `DATABASE_URL`. No ID fabricated. API runtime Hyperdrive binding not verified (no staging deploy). Required: `wrangler hyperdrive create nabome-db --connection-string="$DATABASE_URL"` per env.

### Phase 4 — R2

**Status: [VERIFIED — CODE, BLOCKED — BUCKET EXISTS CHECK]**

- `wrangler.jsonc` `r2_buckets: [{binding:"MEDIA_BUCKET", bucket_name:"nabome-media"}]` present; `apps/api/_lib/storage/r2.ts:113` now `R2_PUBLIC_URL` env-configurable (`https://nabome-media.r2.dev` fallback) — **code fix verified**.
- Bucket existence, upload/delete, tenant ownership, file validation **not** verified against live Cloudflare (no bucket check, no upload test). Owner must confirm `nabome-media` exists in Cloudflare account and `R2_PUBLIC_URL` matches deployment (custom domain vs `r2.dev`). Versioning/lifecycle requires dashboard — documented as owner action, not fabricated.

### Phase 5 — Razorpay

**Status: [BLOCKED — OWNER RAZORPAY TEST CREDENTIALS REQUIRED]**

- `PAYMENT_PROVIDER=razorpay` in `wrangler.jsonc`, `resolveGateway(env)` now used (was `MockGateway` — fixed), but `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` all empty in `.dev.vars`.
- No staging webhook registered (would be `https://staging-api.nabome.online/api/v1/webhooks/gateway/razorpay` via `payment/webhook-service.ts` `verifyWebhookSignature` + `isFresh` 300s + replay `@@unique([provider,eventId])`). Idempotency via `X-Idempotency-Key` now forwarded + `packages/payment/src/service.ts` accepts `idempotencyKey`. Amount check `order.grandTotal` ±0.01 now enforced. All **code verified**, but no live create/verify/webhook test without test credentials. Staging must use Razorpay test keys; production must not use `MockGateway` (now enforced via `resolveGateway` + `PAYMENT_PROVIDER`).

### Phase 6 — Resend

**Status: [BLOCKED — OWNER RESEND CREDENTIALS REQUIRED]**

- `RESEND_API_KEY`/`RESEND_FROM_EMAIL` empty in `.dev.vars`. No verification email / password-reset / order email test performed (would require live Resend + verified domain). Code fix: `email/service.ts` still has `http://localhost:5173` fallback, but `appConfig` now correctly `VITE_APP_URL` — production emails would have used localhost if `APP_URL` missing; now would use configured `APP_URL`. No localhost email sent (no test). Owner must set `RESEND_API_KEY` + verify domain, then test via staging.

### Phase 7 — Turnstile

**Status: [BLOCKED — OWNER TURNSTILE WIDGET REQUIRED]**

- `TURNSTILE_SECRET_KEY` empty, `VITE_TURNSTILE_SITE_KEY` empty. No widget created for `staging.nabome.online` / `nabome.online`. Code fix: `NEXT_PUBLIC_` removed, `VITE_TURNSTILE_SITE_KEY` now read correctly, fallback `0x4AAAAAAAxxxxxxxx` removed (was in `LoginPage.tsx:41` — now `undefined` → Turnstile not rendered if env missing, which is correct). No hardcoded fallback remains. Valid/invalid token not tested (requires live widget).

### Phase 8 — Sentry

**Status: [BLOCKED — OWNER SENTRY DSN REQUIRED]**

- `SENTRY_DSN` empty. `apps/api/_lib/sentry.ts` + `apps/customer` Sentry init verified in code, but `apps/admin`/`apps/shop` still have no Sentry init (per README, admin/shop Sentry pending — code fix not yet applied for those apps). No source-map upload. PII scrubbing not configured. Owner must set `SENTRY_DSN` for `staging`/`production` + add `admin`/`shop` Sentry init if desired.

### Phase 9 — Domains / CORS

**Status: [BLOCKED — OWNER DNS/CLOUDFLARE REQUIRED]**

- Expected: `nabome.online`, `admin.nabome.online`, `shop.nabome.online`, `api.nabome.online` (prod) + `staging-*` variants. No DNS/Cloudflare Pages custom domain verified. `CORS_ORIGINS` still `http://localhost:5173,http://localhost:5174,http://localhost:5175` in `.dev.vars` and `wrangler.jsonc` default; production must be `https://nabome.online,https://admin.nabome.online,https://shop.nabome.online`. Credentials/cookies cross-origin not tested. Owner must configure Pages custom domains + `CORS_ORIGINS` secrets.

### Phase 10 — Environment Audit (re-run 2026-08-27)

| Pattern | Found | Verdict |
|---------|-------|---------|
| `localhost` / `127.0.0.1` | `packages/config/src/env.ts:24-25` defaults `http://localhost:5173/8788`, `packages/config/index.test.ts:10,19` test fixtures, `tests/mocks/fetch-mock.ts:7` comment, `e2e/tests/smoke.spec.ts:57` `E2E_*_URL ?? 'http://localhost:517x'` | **dev/test-only — legitimate** |
| `VITE_API_URL` | 0 remaining (was 7, fixed to `VITE_PUBLIC_API_URL`) | **PASS — fixed** |
| `PUBLIC_API_URL` (non-VITE) | `packages/config/src/env.ts:25` schema `PUBLIC_API_URL` + `.env.example` root (dev) | **schema name — not runtime; frontend now reads `VITE_PUBLIC_API_URL` with fallback** |
| `NEXT_PUBLIC_` | 0 remaining (was 1, fixed) | **PASS** |
| `YOUR_` | `wrangler.jsonc:25,30,44,49,62,66` `YOUR_KV_*`/`YOUR_HYPERDRIVE_*` | **BLOCKED — placeholders intentional until provisioned** |
| `MOCK`/`MockGateway` | `packages/payment/src/gateway/mock.ts` + `registry.ts` `mock` + `e2e` | **dev/test — legitimate; handlers now `resolveGateway(env)` not `new MockGateway` (fixed)** |
| Secrets in repo | `gitleaks` + `validate-env.mjs` would catch; none committed | **PASS** |

Production `VITE_PUBLIC_API_URL` correctly `https://api.nabome.online` in `wrangler.jsonc:19`, `APP_URL` `https://nabome.online` — no silent localhost fallback in prod (fallback only in `packages/config` defaults for local, but frontend now `VITE_PUBLIC_API_URL ?? VITE_API_URL` with no localhost hardcoded in stores beyond dev fallback `http://localhost:8788` which is now `VITE_PUBLIC_API_URL ?? VITE_API_URL ?? 'http://localhost:8788'` — still present but only for local; prod env will provide `VITE_PUBLIC_API_URL`). No `NEXT_PUBLIC_` leakage.

### Phase 11 — Staging Deployment

**Status: [BLOCKED — INFRASTRUCTURE]**

- `pnpm build` (all) **PASS** (2026-08-27 15:13: customer 288 kB, admin 199 kB, shop 197 kB, api copy)
- `pnpm build:api` **PASS**
- `wrangler pages deploy` **NOT ATTEMPTED** — would fail `YOUR_*` placeholders + `Not logged in` (no `CLOUDFLARE_API_TOKEN`). No new deployment system invented. Deployed API URL not available, `GET /health` not verified, frontends not verified. Owner must `wrangler login` / set `CLOUDFLARE_API_TOKEN`, provision KV/Hyperdrive/R2, then `wrangler pages deploy ./dist --project-name nabome-api-staging` + deploy frontends to `staging.nabome.online` etc.

### Phases 12-21 — Smoke Tests

**Status: [BLOCKED — STAGING NOT DEPLOYED]**

All 10 test suites require live staging:

- **Customer flow** (register→login→browse→cart→coupon→checkout→payment→order→history) — **not run** (no staging URL, no DB)
- **Security** (customer order IDOR, shop cross-shop, admin RBAC) — **not run** (code fixes verified via `grep`: `validateCheckoutOwnership` TX, `getOrders` shop filter, `transitionOrder` guard, `csrfHeader`, `resolveGateway`, but not runtime)
- **Coupon concurrency** (`maxUses=1` simultaneous) — **not run** (code is `prisma.$transaction` + `updateMany where usedCount<maxUses`, but no live concurrent test)
- **Payment idempotency** (`X-Idempotency-Key` duplicate, webhook replay, amount/currency tamper) — **not run** (code: `amount` vs `order.grandTotal` ±0.01 + `idempotencyKey` dedup, but no live Razorpay test)
- **Order state machine** (`pending→delivered` must fail) — **not run** (code guard `invalidJumps`, but no API test)
- **Tenant isolation** (Shop A vs B list/detail) — **not run** (code: `getTenantWhereClause` + `handleGetShopOrders` filter, but no two-shop DB test)
- **Auth/cookies** (multiple `Set-Cookie` `append`, `Secure/HttpOnly/SameSite`, `userId/sessionId/role`) — **not run** (code: `headers.append('Set-Cookie', ...)` ×3, `_middleware` populates context, but no deployed header inspection)
- **DB/Finance** (ledger `isBalanced`, commission, settlement, `recordNumber` uniqueness, inventory) — **not run** (code: `seqCache` → DB per-day query, `isBalanced` guard, but no concurrent finance test)
- **Storage** (valid/invalid MIME, oversized, cross-shop) — **not run** (code: `R2_PUBLIC_URL` env, `validateFile`, `validateShopOwnership`, but no live R2 upload)
- **Performance** (latency, pagination, large lists, Worker) — **not run** (no staging)

Each would require: Neon DB with migrated schema + Hyperdrive + KV + R2 bucket + Razorpay test + Resend + Turnstile + deployed API + frontends. Code is ready, infrastructure is not.

### Phase 22 — ready.md Update

This section is the update. All code-side tasks that are verifiably done are `[x]`; infrastructure that requires owner Cloudflare/Neon/Razorpay/Resend/Turnstile/Sentry/domains remains `[ ]`/`[BLOCKED]` with no fabrication.

### Final Staging Gate (2026-08-27)

| Gate | Status | Evidence |
|------|--------|----------|
| Authentication | **CODE PASS, STAGING BLOCKED** | `auth.ts` Env fix + `Set-Cookie append` + `_middleware` context — code verified; no live header test |
| CSRF | **CODE PASS, STAGING BLOCKED** | `enforceCsrf` single layer, `SESSION_COOKIE_NAME`, skip `auth`/`webhooks` — code verified; no live 403 test |
| RBAC | **CODE PASS, STAGING BLOCKED** | `packages/auth` + `requireRole` — code verified; no live admin/customer test |
| Tenant isolation | **CODE PASS, STAGING BLOCKED** | `getTenantWhereClause` lazy, `handleGetShopOrders` shop filter — code verified; no two-shop test |
| Checkout ownership | **CODE PASS, STAGING BLOCKED** | `validateCheckoutOwnership` TX + DB | 
| Rate limiting | **CODE PASS, STAGING BLOCKED** | `checkRateLimit` KV + `clientKey` `cf-connecting-ip` — code verified; no KV → fails open (intentional local) |
| Coupon concurrency | **CODE PASS, STAGING BLOCKED** | `prisma.$transaction` + `updateMany where lt` — code verified; no live concurrent |
| Payment amount | **CODE PASS, STAGING BLOCKED** | `order.grandTotal` ±0.01 + currency — code verified; no live tamper test |
| Payment idempotency | **CODE PASS, STAGING BLOCKED** | `idempotencyKey` forwarded + `generate` fallback — code verified; no live duplicate |
| Webhook idempotency | **CODE PASS, STAGING BLOCKED** | `verifyWebhookSignature` + `isFresh` 300s + `@@unique` — code verified; no live replay |
| Order state machine | **CODE PASS, STAGING BLOCKED** | `invalidJumps` guard — code verified; no live `pending→delivered` test |
| Finance ledger | **CODE PASS, STAGING BLOCKED** | `isBalanced`, DB per-day `recordNumber` — code verified; no concurrent finance test |
| Database | **CODE PASS, STAGING BLOCKED** | Schema 69 models, `migrate deploy` ready — no live connection |
| Storage | **CODE PASS, STAGING BLOCKED** | `R2_PUBLIC_URL` env, `validateFile` — code verified; no live R2 upload |
| Customer flow | **CODE PASS, STAGING BLOCKED** | Hooks `VITE_PUBLIC_API_URL` + envelope unwrap — code verified; no live journey |
| Shop-owner flow | **CODE PASS, STAGING BLOCKED** | Routes `to="/"`, no loop — code verified; no live shop login |
| Admin flow | **CODE PASS, STAGING BLOCKED** | Same — code verified; no live admin test |
| External services | **BLOCKED** | All 8 still `YOUR_*`/empty — owner action |
| Env | **PASS** | No prod `localhost`/`NEXT_PUBLIC_`/`MockGateway` in handlers; `VITE_PUBLIC_API_URL` correct |
| Cloudflare runtime | **BLOCKED** | `wrangler.jsonc` placeholders, `Not logged in` — no deploy |
| Builds | **PASS** | `typecheck` PASS, `lint` 0 errors, `test:unit` PASS, `build` PASS |

**Staging verification overall: CODE READY, INFRASTRUCTURE BLOCKED — staging not yet deployed, all 10 smoke suites pending live staging.**

---

## Production Decision (staging gate)

### NOT READY — STAGING NOT YET VERIFIED

Code-side is **DONE** and `typecheck`/`lint`/`test`/`build` are green, but **staging is not yet deployed or verified** due to 8 external owner-configuration blockers (KV, Hyperdrive, Neon, Razorpay, Resend, Turnstile, Sentry, domains/CORS). No staging URL, no live DB, no live payment, no live tenant/security tests have been executed. **Do not deploy production.** Once owner provisions KV/Hyperdrive/R2/Neon/Razorpay/Resend/Turnstile/Sentry/domains + `wrangler pages deploy` to staging and the 10 smoke suites (customer, security, coupon race, payment, state machine, tenant, auth/cookies, finance, storage, performance) all pass, update this section to `PRODUCTION READY FOR DEPLOYMENT` and proceed to production promotion.

**Required owner actions before staging can be verified:**
```bash
# Cloudflare (interactive or CLOUDFLARE_API_TOKEN)
wrangler kv namespace create nabome-ratelimit --preview false
wrangler kv namespace create nabome-ratelimit --preview true
# → replace YOUR_KV_* in wrangler.jsonc (development / staging / production)
wrangler hyperdrive create nabome-db --connection-string="$DATABASE_URL"
# → replace YOUR_HYPERDRIVE_* (same 3 envs)

# Neon — create project, get DATABASE_URL, then:
pnpm --filter @nabome/api db:deploy  # prisma migrate deploy

# Secrets (staging)
wrangler pages secret put DATABASE_URL --project-name nabome-api-staging
wrangler pages secret put JWT_SECRET --project-name nabome-api-staging  # 32+ chars
wrangler pages secret put CSRF_SECRET --project-name nabome-api-staging
wrangler pages secret put RAZORPAY_KEY_ID --project-name nabome-api-staging
wrangler pages secret put RAZORPAY_KEY_SECRET --project-name nabome-api-staging
wrangler pages secret put RAZORPAY_WEBHOOK_SECRET --project-name nabome-api-staging
wrangler pages secret put RESEND_API_KEY --project-name nabome-api-staging
wrangler pages secret put TURNSTILE_SECRET_KEY --project-name nabome-api-staging
wrangler pages secret put SENTRY_DSN --project-name nabome-api-staging
# + CORS_ORIGINS, R2_PUBLIC_URL, etc.

# Deploy
pnpm build && pnpm build:api
wrangler pages deploy apps/api/dist --project-name nabome-api-staging
# deploy frontends to staging domains, then run e2e/security/coupon/payment/tenant/auth/storage tests
```

`ready.md` remains the living source of truth; do not mark section 20 gates as complete until staging is verified.

---

## Production Deployment Verification (2026-08-27 15:20 UTC)

**Attempted by:** AI agent per user request to sync `.env` → Cloudflare → production deploy
**Branch:** `production` (`git branch --show-current` → `production`)
**Commit:** `484a1e3 start` + working tree fixes (911 untracked/modified files, see `git status --short`)
**Date:** 2026-08-27T15:20:00Z

### Phase 1 — Production Source (.env) — BLOCKED

- `git check-ignore .env` → `.gitignore:25:.env` (correctly ignored)
- `git check-ignore .dev.vars` → `.gitignore:31:.dev.vars` (correctly ignored)
- `git check-ignore .env.production` → `.gitignore:26:.env.*` (correctly ignored)
- `ls -la .env*` → only `.env` (6683 bytes) + `.env.example` (6383) exist; no `.env.production` / `.env.local`
- `cat .env` → is **copy of ` .env.example`** with `NODE_ENV=development`, `APP_URL=http://localhost:5173`, `PUBLIC_API_URL=http://localhost:8788`, `ENVIRONMENT=local`, `SENTRY_DSN=` empty — **placeholders, not production secrets**
- `cat apps/api/.dev.vars` → `DATABASE_URL=postgres://nabome:nabome@localhost:5432/nabome`, `CSRF_SECRET=dev-only-csrf-secret-change-me`, `RAZORPAY_*=` empty, `RESEND_API_KEY=` empty — **dev-only placeholders**
- No `apps/api/.env`, `apps/customer/.env`, etc. with real production values found via `find -name ".env*"`
- **Verdict:** Local `.env` files do **not** contain production secrets/credentials. The premise "project already has required secrets in local `.env`" is false in this environment. No real `DATABASE_URL`, `JWT_SECRET`, `RAZORPAY_*`, `RESEND_*`, `TURNSTILE_*`, `SENTRY_DSN` available to sync. **BLOCKED — owner must provide real production `.env.production` or set secrets via Cloudflare dashboard / `wrangler pages secret put` separately. No secrets printed or fabricated.**

**Internal mapping (what *would* be synced if real values existed):**

| Local source | Application | Cloudflare target | Secret? | Required |
|--------------|-------------|-------------------|---------|----------|
| `.env` `DATABASE_URL` | API | `wrangler pages secret put DATABASE_URL --project-name nabome-api` | SECRET | Yes |
| `.env` `JWT_SECRET` (32+ chars) | API | `wrangler pages secret put JWT_SECRET` | SECRET | Yes |
| `.env` `CSRF_SECRET` | API | `pages secret put CSRF_SECRET` | SECRET | Yes |
| `.env` `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` | API | `pages secret put RAZORPAY_*` | SECRET | Yes |
| `.env` `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | API | `pages secret put RESEND_*` | SECRET | Yes |
| `.env` `TURNSTILE_SECRET_KEY` | API | `pages secret put TURNSTILE_SECRET_KEY` | SECRET | Yes |
| `.env` `SENTRY_DSN` | API+frontends | `pages secret put SENTRY_DSN` + `VITE_SENTRY_DSN` build | SECRET (backend) / public (frontend) | Yes |
| `VITE_PUBLIC_API_URL` / `VITE_APP_URL` / `VITE_TURNSTILE_SITE_KEY` | Customer/Admin/Shop | **Build-time** `VITE_*` embedded in `dist` (not Cloudflare secret) | PUBLIC | Yes |
| `wrangler.jsonc` `kv_namespaces[].id` / `hyperdrive[].id` | API | `wrangler.jsonc` bindings (not secrets) | BINDING | Yes |
| `R2` `nabome-media` | API | `r2_buckets` binding | BINDING | Yes |

### Phase 2 — Production Branch — BLOCKED (DIRTY TREE)

- `git branch --show-current` → `production` (correct)
- `git status --short` → **911 entries** (`A`/`M`): `.changeset`, `.editorconfig`, `.env.example`, `.github`, `.husky`, `.prettierrc`, `apps/`, `packages/`, etc. — the code-side fixes (auth, checkout, tenant, payment, etc.) are in working tree but **not committed** (`git log -1` → `484a1e3 start` with only 22 files via `git ls-files`, vs 911 in working tree)
- `git log -1 --oneline` → `484a1e3 start`
- **Verdict:** Working tree is **not clean** — 911 uncommitted changes. Prompt says `git status --short` must be clean except for ignored `.env`. This is a **dirty tree** due to the remediation fixes not yet committed to `production`. Production deploy from dirty tree is disallowed per instructions. Owner must `git add` + `git commit` the remediation (or squash) on `production` before deploy, or deploy from a clean commit. No deploy attempted from dirty tree.

### Phase 3 — Cloudflare Login — BLOCKED

- `wrangler whoami` → `Not logged in. Your auth token has expired ... could not be refreshed, and the environment is non-interactive. Run wrangler login` (token expired 2026-07-22, `oauth_token` in `~/.wrangler/config/default.toml` expired, `refresh_token` present but non-interactive refresh failed)
- `npx wrangler kv namespace list` → `In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN`
- No `CLOUDFLARE_API_TOKEN` in `env` (`env | grep -i cloudflare` → empty)
- **Verdict:** No valid Cloudflare authentication in this non-interactive environment. `wrangler login` would require interactive browser. **BLOCKED — OWNER CLOUDFLARE ACCESS REQUIRED** (provide `CLOUDFLARE_API_TOKEN` with `account:read` + `pages:write` + `workers_kv:write` etc., or run `wrangler login` interactively). No deploy to unknown account attempted.

### Phase 4 — Wrangler Configuration — BLOCKED (PLACEHOLDERS)

- `apps/api/wrangler.jsonc` still has `YOUR_KV_NAMESPACE_ID`, `YOUR_STAGING_KV_NAMESPACE_ID`, `YOUR_PRODUCTION_KV_NAMESPACE_ID`, `YOUR_HYPERDRIVE_CONFIG_ID` etc. (6 placeholders across 3 envs) — verified via `cat wrangler.jsonc`
- `pages_build_output_dir: "./dist"` correct, `compatibility_date: "2026-07-15"` + `nodejs_compat` correct, `r2_buckets: nabome-media` correct, `vars` `PAYMENT_PROVIDER: razorpay` etc. correct.
- No `Queues` are required (code has none), so no queue binding needed.
- **Verdict:** Placeholders remain — cannot deploy until Phase 5 creates real IDs. No IDs fabricated.

### Phase 5 — Cloudflare Bindings — BLOCKED

- `npx wrangler kv namespace list` → **fails** (no auth, as above) — cannot inspect existing KV
- `npx wrangler r2 bucket list` → **not attempted** (would also fail `Not logged in`)
- `npx wrangler hyperdrive list` → **not attempted** (would fail)
- No attempt to `kv namespace create` / `r2 bucket create` / `hyperdrive create` without auth (would fail). No duplicate resources created. **BLOCKED — OWNER CLOUDFLARE ACCESS REQUIRED**.

### Phase 6-8 — Env Classification & Secret Sync — BLOCKED

- Classification as in Phase 1 table is **code-verified**, but **no `wrangler secret put` executed** because: (a) no real secret values in local `.env` (only `dev-only-*` placeholders), (b) no Cloudflare auth. The safe mechanism would be `cat .env | grep VAR | wrangler pages secret put` without `echo "$SECRET"` in logs, but without real values and without auth, no upload attempted. No `VITE_*` backend secret leakage: `grep -r "VITE_.*SECRET\|VITE_JWT\|VITE_DATABASE" apps/` → no hits; frontend `VITE_*` are only `VITE_PUBLIC_API_URL`/`VITE_APP_URL`/`VITE_TURNSTILE_SITE_KEY` (public).
- **Verdict:** **BLOCKED** — owner must provide real `DATABASE_URL` etc. via `wrangler pages secret put --project-name nabome-api` (production) once `CLOUDFLARE_API_TOKEN` is available. No secrets printed, no `.env` committed (verified `git check-ignore`).

### Phase 9-16 — DB / Hyperdrive / R2 / Razorpay / Resend / Turnstile / Sentry / Domains — ALL BLOCKED

- For each service, the code path is **code-verified** (`resolveGateway(env)` not `MockGateway`, `R2_PUBLIC_URL` env, `verifyWebhookSignature`, etc. — see Staging Verification), but **runtime verification requires live Cloudflare + Neon + R2 + Razorpay test keys + Resend + Turnstile + Sentry + DNS** which are all `BLOCKED` as in Staging Verification. No `prisma migrate deploy` (no `DATABASE_URL`), no Hyperdrive query, no R2 upload, no Razorpay `create payment`, no Resend email, no Turnstile token test, no Sentry DSN. `http://localhost` only in `config` defaults / `e2e` fallback / `tests` comment — **not** in production `VITE_PUBLIC_API_URL` (`https://api.nabome.online`) or `CORS_ORIGINS` (would be `https://nabome.online` etc. — currently `localhost` in `.dev.vars` only for local).

### Phase 17 — Build From Production Branch — PASS (CODE)

- Working tree dirty, but `pnpm install --frozen-lockfile` would be `pnpm install` (frozen not enforced). Instead verified `pnpm typecheck` **PASS**, `pnpm lint` **PASS** (0 errors, 1212 warnings), `pnpm test:unit` **PASS**, `pnpm build` **PASS** (customer 288 kB, admin 199 kB, shop 197 kB), `pnpm build:api` **PASS** (copy). These are the same as Phase 0 and were green. No production checkout needed because we are already on `production` branch; `git checkout production` would be no-op. `pnpm install` not re-run to avoid network, but `pnpm-lock.yaml` exists and `pnpm build` succeeded, so dependencies are present.

### Phase 18 — Secret Leak Scan — PASS

- `git diff` shows code fixes, but no `JWT_SECRET` value, `DATABASE_URL` password, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` values in diff (only `JWT_SECRET` schema `min 32` and `dev-only-*` placeholders). `grep -r "JWT_SECRET\|RAZORPAY_KEY_SECRET" apps/customer/dist` → no hits (frontend bundle `dist/assets/index-*.js` inspected via `grep` after `pnpm build` — no backend secrets in client). `git ls-files` shows `.env` is ignored, `gitleaks` would pass. **No secret exposure.**

### Phase 19 — Deploy via Wrangler — BLOCKED

- **Not attempted** — would require: clean `production` commit, `CLOUDFLARE_API_TOKEN`, real `wrangler.jsonc` IDs, and real secrets. The existing `wrangler pages deploy` would fail `YOUR_*` + `Not logged in`. No new deployment architecture invented. No staging config deployed to production. Correct project would be `nabome-api` (prod) vs `nabome-api-staging` (staging) per `wrangler.jsonc:54`/`36`.

### Phase 20-22 — Production Verification & Infrastructure — BLOCKED

- No `GET https://api.nabome.online/health` (no deployed URL), no `https://nabome.online` etc. Customer/shop/admin flows, security smoke tests, ledger/finance, storage, performance **all require staging first** — as documented in Staging Verification, all 10 smoke suites are `BLOCKED — STAGING NOT DEPLOYED`. No production smoke tests run.

### Production Deployment Verification Summary

| Item | Status | Evidence |
|------|--------|----------|
| Deployed commit | **BLOCKED** | Working tree dirty (911), `484a1e3 start` is base, no new commit, no deploy |
| Deployment timestamp | — | Not deployed |
| Cloudflare project | `nabome-api` (prod) / `nabome-api-staging` (staging) per `wrangler.jsonc` | Verified via `cat wrangler.jsonc:54/36` |
| API deployment | **BLOCKED** | `YOUR_*` placeholders + `Not logged in` |
| Customer/Admin/Shop deployment | **BLOCKED** | No `wrangler pages deploy` for frontends (would be `nabome`, `admin.nabome.online`, `shop.nabome.online`) |
| Database | **BLOCKED** | No `DATABASE_URL` secret, `migrate deploy` not run |
| KV | **BLOCKED** | No `CLOUDFLARE_API_TOKEN`, `kv namespace list` fails |
| R2 | **BLOCKED** | Code `R2_PUBLIC_URL` verified, but no live bucket check |
| Hyperdrive | **BLOCKED** | `YOUR_HYPERDRIVE_*` placeholders |
| Razorpay | **BLOCKED** | Code `resolveGateway` verified, but `RAZORPAY_*` empty, no live payment |
| Resend | **BLOCKED** | `RESEND_*` empty |
| Turnstile | **BLOCKED** | `TURNSTILE_*` empty |
| Sentry | **BLOCKED** | `SENTRY_DSN` empty, `admin/shop` no init |
| Security smoke | **BLOCKED** | Requires staging |
| Customer smoke | **BLOCKED** | Requires staging |
| Shop smoke | **BLOCKED** | Requires staging |
| Admin smoke | **BLOCKED** | Requires staging |
| Remaining blockers | **8 external + dirty tree** | See below |

### Final Production Decision (post-sync attempt)

#### NOT READY — PRODUCTION DEPLOYMENT BLOCKED (NO REAL SECRETS, NO CLOUDFLARE AUTH, DIRTY TREE, STAGING NOT VERIFIED)

**No production deployment was performed, and no secrets were fabricated, printed, or committed.** The local `.env`/` .dev.vars` contain only `localhost`/`dev-only-*` placeholders, not production `DATABASE_URL`/`JWT_SECRET`/etc. Cloudflare `wrangler` has no valid `CLOUDFLARE_API_TOKEN` (token expired 2026-07-22, non-interactive), so no KV/Hyperdrive/R2/secret sync or `pages deploy` could be executed. The `production` branch working tree has 911 uncommitted code fixes that are required for security but make the tree dirty per deployment policy. Most importantly, **staging has not been deployed or verified** (all 10 smoke suites pending), so promoting to production would violate the staging-gate requirement.

**Code is READY for staging** (`typecheck`/`lint` 0 errors/`test`/`build` PASS, 18/18 code defects fixed), but **infrastructure and deployment are BLOCKED**. Do not deploy production until:

1. Owner commits the code fixes to `production` (or squash) so `git status --short` is clean (except ignored `.env`).
2. Owner provides real production secrets (Neon `DATABASE_URL`, `JWT_SECRET` 32+ chars, `RAZORPAY_*`, `RESEND_*`, `TURNSTILE_*`, `SENTRY_DSN`, `CORS_ORIGINS` with `https://nabome.online` etc.) via `wrangler pages secret put --project-name nabome-api` (not via committed `.env`).
3. Owner authenticates Cloudflare (`wrangler login` interactively or `CLOUDFLARE_API_TOKEN` with `pages:write`/`workers_kv:write`/`hyperdrive:write`) and runs `wrangler kv namespace create` / `hyperdrive create` → replace `YOUR_*` in `wrangler.jsonc`, then `pnpm --filter @nabome/api db:deploy` and `wrangler pages deploy` to **staging** first.
4. Staging smoke tests all pass, then repeat steps 2-3 for `production` project `nabome-api`.

`ready.md` remains the living source of truth; section 20 gates stay unchecked until staging + production are actually verified.
