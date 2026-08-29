# Step 0 — Website & Codebase Understanding (Nabome)

> **Date:** 2026-08-29 (Step 0) / 2026-08-29 (Step 1 update)
> **Branch:** `production`
> **Commit:** `8965141 feat(api): harden auth, checkout, tenant, payment and finance` → Step 1 `chore: complete staging code validation` (pending)
> **Git status:** Step 0 dirty 40+ → Step 1 clean after commit (see §17)
> **Mode:** Step 0 read-only; Step 1 code completion & validation (no infra provisioning, no deploy)

---

## 1. Product Overview

Nabome (নবME) is a multi-tenant Indian marketplace commerce OS. Three React 19 SPAs (Customer 5173, Shop 5175, Admin 5174) consume a single Cloudflare Pages Functions API (`apps/api`, `nodejs_compat`) backed by Neon PostgreSQL via Prisma 6.19.3 + Hyperdrive pooling. Payments via Razorpay + Mock + COD, email via Resend, CAPTCHA via Turnstile, monitoring via Sentry, storage via S3-compatible Backblaze B2.

**Current claim vs reality:** README/ready.md still describe R2 and placeholder bindings — code has already migrated to B2 (`apps/api/_lib/storage/s3.ts`, `r2.ts` deleted) and `wrangler.jsonc` now carries real KV/Hyperdrive IDs.

---

## 2. Application Structure

```
nabome/
├── apps/
│   ├── api/        Cloudflare Pages Functions, 18 domains, custom registry, dist via cp -r
│   ├── customer/   React 19 SPA, 10 feature modules, Vite, Zustand, TanStack Query
│   ├── admin/      React SPA, 13 feature modules (5 shell-only)
│   └── shop/       React SPA, 12 feature modules (3 partial)
├── packages/       17 shared packages (types, constants, auth, config, validation, ui, etc.)
│   ├── order, payment, finance, shipping, inventory, returns  (domain engines)
│   └── design-tokens, logging, api-contracts
├── e2e/            Playwright smoke (checkout, isolation, shop-owner workflow)
├── tests/          fixtures + fetch-mock
├── infra/          docker-compose.yml + cf-secrets.mjs + check-deploy.mjs
└── docs/work/      11 audit docs
```

- Package manager: `pnpm@10.0.0`, `node>=22`, `pnpm-workspace.yaml` lists `apps/*`, `packages/*`, `e2e`, `tests`.
- Apps never import each other (guarded); `_lib/` never imports `_handlers/`; handler domains never cross-import (enforced `scripts/check-architecture.mjs`).

---

## 3. Architecture

### Request flow

```
Customer / Shop Owner / Admin (Browser)
  ↓  credentials:include, x-csrf-token, Bearer or httpOnly cookie
Customer/Admin/Shop React App (Vite, React Router, Zustand, TanStack Query)
  ↓  Shared API client (lib/api/client.ts) — CSRF cookie→header, envelope parsing
Cloudflare Pages Functions API
  ↓  functions/_middleware.ts (ReqId → CORS → SecurityHeaders → KV RateLimit → CSRF → JWT → Context)
  ↓  functions/[[path]].ts (custom registry dispatch, {param} extraction)
  ↓  Domain Handlers (_handlers/**/index.ts)
  ↓  Services (_lib/**)
  ↓  Prisma (Hyperdrive connectionString || DATABASE_URL, PrismaPg vs PrismaNeonHTTP)
  ↓  Neon PostgreSQL
  ↘  StorageProvider → aws4fetch → Backblaze B2 (S3)
  ↘  Razorpay / Mock gateway, Resend, Turnstile verify, KV, Sentry
```

### AuthZ chain

```
Browser → JWT (HS256, httpOnly cookies) → CSRF double-submit → RBAC (packages/auth) → Tenant filter → Handler → Service → Prisma query
Enforced at: middleware (global) + handler (role check) + service (ownership) + DB where clause
```

### Commerce chain

```
Browse → Product → Cart (merge, stock validate) → Coupon → Address → ShippingRate → Tax → CheckoutSession
  → Payment (Razorpay/Mock/COD, 15m window, idempotency) → Webhook verify → Order (state machine)
  → Finance (commission, double-entry ledger) → Shipment/Fulfillment → Settlement (7d hold, ₹100 min) → Returns/Refund
```

---

## 4. Database Architecture

- **Schema:** `apps/api/prisma/schema.prisma` ~1700 lines, ~69 models, ~62 enums, `Decimal(10,2)` money, `UUIDv4` PKs, `isActive` soft-delete (20+ models), `@db.Timestamptz(6)`, `@@map` snake_case, composite indexes, `@@check` on stock, `@@unique` on idempotency keys.
- **Key models:** `User`, `Session`, `Address`, `Category`, `Brand`, `Collection`, `Product`, `ProductVariant` (availableStock/reservedStock/version), `ProductMedia`, `CartItem` (userId/guestId, unique[userId,variantId]), `Wishlist/WishlistItem`, `CheckoutSession`, `ShippingRate`, `TaxRule`, `Order` (orderNumber unique, commission snapshot), `OrderItem`, `Shipment/ShipmentItem/ShipmentEvent`, `Carrier`, `FulfillmentQueue`, `Payment` (idempotencyKey unique, expiresAt), `Refund`, `ReturnRequest` + `ReturnItem/History/Refund/Inspection/ReverseLogistics/Dispute`, `FinanceRecord` + `LedgerEntry` (double-entry), `Settlement/SettlementItem`, `Notification`, `Coupon` (usageLimit, perCustomer), `TimelineEvent`.
- **Enums (critical):** `UserRole` (guest/customer/shop_owner/admin/system), `OrderStatus` (18), `CustomerVisibleOrderStatus` (10), `PaymentStatus` (13 incl legacy), `RefundStatus`, `SettlementStatus` (18 incl legacy), `CheckoutStatus`, `ShipmentStatus`, `ReturnRequestStatus`, etc.
- **Migrations:** `0001_init` (87KB) + `0002_preserve_historical_records` (Restrict on `Payment.order`, `Address.user`, `ReturnRequest.order`; Order.user already safe). No RLS.
- **Tenant keys:** `Product.shopId`, `Order.shopId`, `Shop.ownerId`, `Payment.orderId→Order.shopId`, `ReturnRequest.shopId`, `Settlement.shopId`. No DB-level RLS — all isolation is app-layer `where: {shopId}`.
- **Money:** `Decimal(10,2)` INR; paise integers only in `packages/payment/src/money.ts` for calc.
- **Inconsistency:** README says 69/62 — count drift (66 models visible); `packages/types` vs `packages/order` vs Prisma `OrderStatus` counts 18/16/18 still divergent (see §20 risks).

---

## 5. Authentication Architecture

**Canonical system (post-8965141):** `apps/api/_lib/auth/services-v1.ts` is active (handler `auth/index.ts:8` imports it). JWT HS256 (`jsonwebtoken`) issuer `nabome-api`, audience `nabome-clients`, `15m` access / `7d` (or `30d` remember) refresh. Secret from `Env.JWT_SECRET` (never `process.env` — `apps/api/_lib/auth.ts:38` fixed to fail `internal` if missing, no longer reads `globalThis.process`). Passwords `bcryptjs` `SALT_ROUNDS=12`, strength enforced (8-128, upper/lower/digit/special) in `password.ts`.

**Competing systems (dead code retained):**

- `apps/api/_lib/auth/services.ts` (old, enumeration-defense variant, uses dummy `getEmailConfig({} as any)`).
- `apps/api/_lib/auth/session-manager.ts` (opaque hex tokens, `generateSecureToken`, SHA256 hash) — never called by handlers.

**Flow:**

1. `POST /api/v1/auth/register|login` → `checkRateLimit(KV, public, auth:*:ip)` → `verifyTurnstileToken(TURNSTILE_SECRET_KEY)` → `services-v1.register/login` → hash/compare `bcryptjs` → create `Session` (max 5, revoke oldest) → issue JWT access+refresh → `Set-Cookie: access_token` (httpOnly 15m), `refresh_token` (httpOnly 7d/30d), `csrf_token` (Secure, **not** httpOnly — fixed 8965141) with `append` (was `join(', ')` bug) → `LoginHistory` row → lock after 5 failures/15m.
2. Global `functions/_middleware.ts:39-60` extracts `Bearer` or `access_token` cookie → `verifyToken(secret)` → stashes `RequestContext {userId, userRole, sessionId?}` onto `data`.
3. `POST /auth/refresh` expects Bearer `refresh_token` → verifies → rotates.
4. `POST /auth/logout` revokes session.

**Remaining gaps (see §19):** `@ts-nocheck` still on middleware, `decodeToken` debug helper unguarded, `jsonwebtoken` Node-compat in Workers (works via `nodejs_compat` but `jose` would be cleaner), `verifyPassword` empty-string compare still present for OAuth users, `isPasswordPolicyCompliant` length-only check in package.

---

## 6. Authorization / RBAC

- **Canonical:** `packages/auth/src/rbac.ts` — additive hierarchy `guest(0) < customer(10) < shop_owner(20) < admin(30) < system(100)`. `PERMISSION_ROLES` 34 mappings across ~13 scopes, `can()` default-deny, `permissionsFor()` filters by level.
- **Middleware helpers:** `apps/api/_lib/auth/middleware.ts` `requirePermission`, `requireRole`, `requireAnyPermission`, `requireAllPermissions`, `requireOwnership`, `requireOwnershipOrAdmin`, `customerOnly/shopOwnerOnly/adminOnly` — all throw `ApiError.forbidden`.
- **Actual usage:** inconsistent. Handlers mostly do inline `if (context.userRole !== 'admin') throw 403` rather than `requirePermission`. `finance/index.ts:164 requireShopAccess` does DB lookup via `tenant-isolation`. No deny audit log.
- **Frontend guards:** `GuestRoute`, `ProtectedRoute`, `AdminRoute`, `ShopRoute` hide routes client-side; server is source of truth but parity not systematically tested.

---

## 7. Tenant Isolation

- **Central:** `apps/api/_lib/tenant-isolation.ts` — `userOwnsShop(userId,shopId)` checks `shop.ownerId===userId && isActive`; `getShopFilter` throws `FORBIDDEN Shop context required` if no `shopId` (fails closed); `getTenantWhereClause` returns `{shopId: {in: [...]}}` else dummy uuid for empty.
- **Per-handler:** `finance/index.ts:518` extracts `?shopId` query, calls `userOwnsShop` for shop_owner else allows admin passthrough; `shop-products/index.ts:120` checks `product.shopId !== shop.id`; `orders/index.ts:501` checks `order.shopId !== shop.id` for single get (list path `getOrders` previously ignored `shopOwnerId` — now partially fixed); `payments/index.ts:235` scopes `where.order = {shopId}`.
- **Storage:** `storage/index.ts:159` `validateShopOwnership(key, shopId)` enforces `shops/${shopId}/` prefix; `generateStorageKey` creates `shops/${shopId}/products/${productId}/${uuid}.${ext}`.
- **Weaknesses:** no DB RLS; `tenant-isolation` module was unused (grep zero calls in earlier audit) — now wired for some handlers but not all; `shopId` still sourced from `searchParams` without HMAC; admin bypass logic scattered; no systematic IDOR test harness.

---

## 8. Customer Lifecycle

```
Browse (Home hero/featured/trending → Shop ?category → ProductDetail variants/media/reviews)
  FE: apps/customer/src/features/catalog (HomePage, ShopPage, ProductDetailPage, hooks)
  API: GET /products, /products/:slug, /categories, /collections, /search (lib/search/service.ts, index-service, recommendation-service)
Search/filtering: full-text + tag + price + gender, recommendation via collaborative filter (recommendation-service.ts)

Cart (add, quantity, validation, merge guest→user)
  FE: features/cart (CartPage, MiniCart, cart-store.ts Zustand persist, hooks)
  API: POST/GET/PATCH/DELETE /cart, merge on login (cart/service.ts, security.ts, pricing.ts)
  Checks: inventory check, pricing rules, tax (triplicate impl — cart/service.ts + pricing.ts + checkout/tax-service.ts), shipping stub

Wishlist (guest localStorage, auth wishlist)
  FE: features/wishlist, stores/wishlist-store, WishlistButton/Page — bulk ops TODO
  API: /wishlist

Addresses (CRUD)
  FE: AddressBookPage, ProfileView — dialogs partially TODO
  API: /addresses (Address.user Restrict)

Checkout (address → coupon → shipping → totals)
  FE: features/checkout (CheckoutPage, CouponInput, ShippingSelector, AddressSelector, checkout-store)
  API: POST /checkout/sessions, PATCH coupon/address/shipping, GET totals (checkout/service.ts, coupon-service, tax-service, security.ts)
  Security: validateCheckoutOwnership was stub (now fixed in 8965141), applyCheckoutRateLimit now wired to KV, CSRF via csrf_token

Payment (Razorpay/Mock/COD)
  FE: CheckoutPage pay button, order-store, Razorpay script
  API: POST /payments (initiatePayment idempotent), POST /payments/verify (verifyAndCapture, amount match 400 PAYMENT_AMOUNT_MISMATCH), webhooks
  Gateway: packages/payment gateway abstraction, registry, money paise, PaymentStateMachine

Orders (list, detail timeline, cancel, reorder, return)
  FE: features/orders (OrderListPage, OrderDetailPage, order-store) — timeline, status, cancel
  API: GET /orders (customerId filter at DB), GET /orders/:id (ownership check), POST /orders/:id/cancel, transitionOrder (state machine now validated via packages/order)
  States: OrderStatus 18, PaymentStatus 13, customerVisibleStatus 10

Returns/Refunds
  FE: ReturnsPage (mock data — not API-connected), shop returns complete, admin returns shell
  API: /returns, /returns/:id/status, inspection, reverse logistics, dispute

Profile/Account (auth, avatar upload TODO, password reset, email verification)
  FE: features/account (LoginPage/RegisterPage with Turnstile, Dashboard, AddressBook, ProfileView, verification flows)
  API: /auth/*, /users/me, /notifications
```

Idempotency: `Payment.idempotencyKey` unique, `X-Idempotency-Key` header (service tier correctly impl, handler tier still random in payment-engine path — see §19).

---

## 9. Shop Lifecycle

- **Auth:** `ShopRoute` guard, `shop_owner` role, `Shop.ownerId` link.
- **Dashboard:** `apps/shop/src/features/shop/dashboard` KPIs, revenue charts — mostly complete, Zustand `dashboard-store` (devtools still present).
- **Products:** CRUD, bulk publish/delete, variant management — `shop-products` handler enforces `shopId` ownership.
- **Inventory:** stock movements, reservations, warehouses — `packages/inventory` + `_lib/inventory/repository.ts`; warehouses tab incomplete.
- **Orders:** processing → packing → fulfillment queues, bulk transitions — `apps/api/_handlers/orders` + `_lib/order/service.ts` (timeline retrieval stub still empty).
- **Customers:** shop-scoped customer list — complete.
- **Finance:** earnings, settlements, transactions, refund queue — `finance/service.ts` double-entry, commission hierarchy (shop>category>platform), hold 7d, min ₹100 (now secrets-validated, seq fixed).
- **Shipping:** carrier management, fulfillment queue, tracking — `shipping` handlers + `packages/shipping` state machine (4 files now wired).
- **CMS/Reports:** homepage/banners + sales/inventory/returns reports — complete.
- **Settings:** shipping/payments tabs incomplete; inventory warehouses incomplete.

---

## 10. Admin Lifecycle

- **Auth:** `AdminRoute`, `admin` role, all admin routes behind `AdminLayout`.
- **Dashboard:** KPIs, activity feed, pending tasks — complete.
- **Shops:** list + detail (tabs incomplete) — `apps/admin/src/features/admin/shops` + `_lib/admin/service.ts`.
- **Products governance (moderation):** complete.
- **Orders:** cross-shop management, bulk transitions — complete but security audit notes no extra RBAC audit log.
- **Customers:** platform customer management — complete.
- **System operations:** security alerts, audit logs, system health, background jobs — complete.
- **Security:** alerts, audit logs — complete.
- **Shell-only (no functional UI):** Analytics (6 tabs), Settings (8 tabs), CMS (4 tabs), Payments governance (5 tabs), Returns governance (4 tabs) — per README matrix, not security blockers, deferred to V2.
- **Inventory/Reports:** movements tab incomplete, reports generate/download stubs.

---

## 11. Payment / Finance Architecture

### Payment

- **Abstraction:** `packages/payment/src/gateway/types.ts` `PaymentGateway` interface (`createOrder`, `verifyPayment(expectedAmountPaise)`, `capture/refund/void`, `verifyWebhookSignature`, `parseWebhookEvent`). Registry `registry.ts` 10 providers (razorpay, stripe, sslcommerz, bkash, nagad, paypal, cod/manual throw, mock). Factory `getGateway` validates credentials.
- **API binding:** `apps/api/_lib/payment/gateway.ts` `buildGatewayCredentials(env)` + `resolveGateway(env)` defaults `mock` unless `ENVIRONMENT===production` then `razorpay` (now correctly called — 8965141 replaced `new MockGateway({})` hardcoding in 4 handler methods with `getGateway(env)`).
- **Money:** `packages/payment/src/money.ts` paise integers, `toPaise` regex, `MIN=1 paise` (bug <₹1), `MAX=10_00_000 paise = ₹100k` (off by 10×), `COD_MAX 5k`, `REFUND_WINDOW 180d`, `PAYMENT_TIMEOUT 15m`.
- **Service:** `apps/api/_lib/payment/service.ts` — `initiatePayment` idempotent via unique `idempotencyKey` → `gateway.createOrder` → `initiated`; `verifyAndCapture` idempotent if already captured/completed/refunded, verifies signature+amount, creates `PaymentTransaction CAPTURE succeeded`, `markCaptured` syncs `Order.status=confirmed, paymentStatus=succeeded, subStatus=captured` + finance records; `processRefund` enforces 180d, `isRefundable`, sums existing refunds, blocks in-transit unless admin+returnReceived, calls `gateway.refund`; `syncRefundState` derives aggregates.
- **Webhook:** `webhook-service.ts` dual HMAC (`X-Nabome-Signature` 5m freshness via `verifyNabomeSignature` + gateway signature), nonce dedupe via `WebhookEvent @@unique([provider, eventId])`, delegates to `verifyAndCapture|markPaymentFailed|completeRefund`.
- **Webhook replay:** prevented via dedupe table; signature via Razorpay HMAC.

### Finance

- **Commission:** `packages/finance/src/commission.ts` `calculateCommission` with cap.
- **Ledger:** `ledger.ts` `salePostings = debit CASH (items+shipping), credit COMMISSION_INCOME, SELLER_PAYABLE (items-commission), SHIPPING_INCOME`; `isBalanced` zero-sum; `formatRecordNumber FIN-YYYYMMDD-######`.
- **Settlement:** `settlement.ts` `startOfWeekUtc`, `isEligibleNow` 7d hold, `computeSettlementItem net=gross-commission-refund`, FSM `PENDING→ELIGIBLE→CREATED→REVIEW→APPROVED→PROCESSING→COMPLETED→PAID (+ REJECTED/FAILED/REVERSED)`.
- **Service:** `apps/api/_lib/finance/service.ts` — `createOrderFinanceRecords` idempotent per orderId+type=sale, resolves rule hierarchy shop>category>platform, caps; `createRefundFinanceRecords` proportional reversal; `getEarningsSummary` via `ledgerEntry seller_payable` + holdCutoff; `createSettlement` filters `delivered && settlementStatus=null && deliveredAt <= holdCutoff`; `approve/reject/completeSettlementPayout/reverse` with ledger reversals. Sequence now DB-backed with transactional retry (fixed 8965141 — was in-memory `Map`).

---

## 12. Storage Architecture

**Intended (code):** `Application → StorageProvider abstraction → S3-compatible API (aws4fetch) → Backblaze B2`

- **Files:** `apps/api/_lib/storage/s3.ts` (getStorageConfig, s3Upload/Delete/Exists via `AwsClient`), `storage/index.ts` (`S3StorageProvider` vs `MockStorageProvider` singleton via `globalThis.__NABOME_MOCK_STORAGE__`), `storage/mock.ts`, `media/service.ts`.
- **Config:** `STORAGE_ENDPOINT/REGION/BUCKET/ACCESS_KEY_ID/SECRET_ACCESS_KEY/PUBLIC_URL` all required (else `STORAGE_NOT_CONFIGURED`). `.env.example` documents `https://s3.us-east-005.backblazeb2.com`, `us-east-005`, `nabome-media`, `https://f000.backblazeb2.com/file/nabome-media`. `wrangler.jsonc` now correctly has **no** `r2_buckets`; `check-deploy.mjs:28` fails if R2 bindings remain (confirms intentional S3 migration).
- **Validation:** `validateFile` checks `MEDIA.maxFileSizeBytes (10MB)` + `MEDIA.allowedTypes` + extension whitelist `jpg/jpeg/png/webp/gif/svg`; `validateShopOwnership` prefixes `shops/${shopId}/`; keys generated `shops/${shopId}/products/${productId}/${uuid}.${ext}`.
- **Public URL:** `getStoragePublicUrl` uses `STORAGE_PUBLIC_URL` (not hardcoded `https://nabome-media.r2.dev/${key}` — fixed 8965141, was `r2.ts:113`).
- **Frontend interaction:** upload via `POST /media` (multipart) → storage provider; delete via `DELETE /media/:key`.
- **Doc drift:** README still says `R2_BUCKET_NAME=nabome-storage` and `r2_buckets` ✅ — stale vs actual B2.

---

## 13. External Services

| Service                   | Purpose                                | Required vars                                      | Integration                         | Status                                                                           |
| ------------------------- | -------------------------------------- | -------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------- |
| **Cloudflare Pages**      | API hosting                            | `wrangler.jsonc` bindings                          | `functions/[[path]].ts`             | Has real KV/Hyperdrive IDs (not placeholders)                                    |
| **Cloudflare KV**         | Rate limiting (5 tiers 60-500 req/min) | `KV` binding                                       | `ratelimit.ts` fixed-window         | Bindings present (6969b5..., 2db98...)                                           |
| **Cloudflare Hyperdrive** | Postgres pooling                       | `HYPERDRIVE` binding                               | `prisma.ts` `connectionString`      | ID `e2b5c6e7...` populated                                                       |
| **Neon PostgreSQL**       | Production DB                          | `DATABASE_URL` secret                              | `prisma.ts` `PrismaNeonHTTP`        | Not provisioned for prod (local Docker only)                                     |
| **Backblaze B2**          | Media storage                          | `STORAGE_*` ×6                                     | `storage/s3.ts` aws4fetch           | Not provisioned prod; mock fallback for local/preview                            |
| **Razorpay**              | Payments prod                          | `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET`            | `payment/gateway.ts` + webhooks     | Test keys only; prod not set                                                     |
| **Resend**                | Email                                  | `RESEND_API_KEY/FROM_EMAIL`                        | `email/service.ts` (no queue/retry) | Not prod-configured                                                              |
| **Turnstile**             | CAPTCHA                                | `TURNSTILE_SECRET_KEY` + `VITE_TURNSTILE_SITE_KEY` | `turnstile.ts` siteverify           | Not prod-configured (fallback key still in LoginPage:41)                         |
| **Sentry**                | Monitoring                             | `SENTRY_DSN`                                       | `sentry.ts` v8                      | Customer + API only; admin/shop now have `sentry.ts` added but wiring unverified |

All secrets pushed via `infra/scripts/cf-secrets.mjs` (`wrangler pages secret put` for 16 secrets, 9 required). `check-deploy.mjs` validates placeholders + R2 ban + `CONFIRM_PRODUCTION=1`.

---

## 14. Environment Architecture

**Schema:** `packages/config/src/env.ts` Zod validation, throws listing all issues.

```text
[SHARED]  NODE_ENV, ENVIRONMENT (local/preview/staging/production), APP_URL, PUBLIC_API_URL,
          LOG_LEVEL, SENTRY_DSN, SESSION_COOKIE_NAME, VITE_TURNSTILE_SITE_KEY
[API]     DATABASE_URL (url, required), HYPERDRIVE_URL?, JWT_SECRET (min32, required),
          CSRF_SECRET (min16), RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET, RESEND_API_KEY/FROM_EMAIL,
          STORAGE_ENDPOINT/REGION/BUCKET/ACCESS_KEY_ID/SECRET_ACCESS_KEY/PUBLIC_URL,
          TURNSTILE_SECRET_KEY, WEBHOOK_SECRET, CORS_ORIGINS, FINANCE_* (4), COD_* (2)
Frontend  sharedEnvSchema only (clientEnvSchema alias)
```

**Binding:** `apps/api/_lib/env.ts` `Env` interface mirrors but adds `KV?:KVNamespace, HYPERDRIVE?:Hyperdrive, PAYMENT_PROVIDER?:string`, finance/COD as `string?` parsed via `getFinanceConfig` (silent fallback to defaults if invalid — no Zod error).

**Build-time vs runtime:**

- `VITE_*` prefixed only — Vite `envPrefix` default exposes only `VITE_` to client. `apps/customer|admin|shop/src/lib/config.ts` previously read `PUBLIC_API_URL` without prefix (always `undefined`) — flagged in ready.md but customer fix present; admin/shop `config.ts` still reads `import.meta.env.PUBLIC_API_URL` without `VITE_` (needs consolidation to `VITE_PUBLIC_API_URL`). `.env.example` says `PUBLIC_API_URL` (non-VITE) — inconsistent.
- `JWT_SECRET`, `CSRF_SECRET`, `DATABASE_URL`, `STORAGE_*`, `RAZORPAY_*` are secrets (never `VITE_`), set via `wrangler pages secret put`, never exposed to frontend.
- `vars` in `wrangler.jsonc` (`ENVIRONMENT`, `PAYMENT_PROVIDER`, `FINANCE_*`, `COD_*`, `PUBLIC_API_URL`, `APP_URL`, `LOG_LEVEL`, `SESSION_COOKIE_NAME`) are build-time non-secrets.

**Hardcoded fallbacks to remove:** `http://localhost:8788` in 4 stores + events (ready.md notes now removed in 8965141), `http://localhost:5173` in `email/service.ts:58,113`, Turnstile fallback `0x4AAAAAAA...` in Login/Register:41.

---

## 15. Deployment Architecture

- **Config:** `apps/api/wrangler.jsonc` `name nabome-api`, `pages_build_output_dir ./dist`, `compatibility_date 2026-07-15`, `nodejs_compat`, vars prod `PAYMENT_PROVIDER=razorpay`, `FINANCE_*`, `COD_*`, `PUBLIC_API_URL https://api.nabome.online`, `APP_URL https://nabome.online`. KV `6969b592bba74117b3f27545dcf47e7a`, Hyperdrive `e2b5c6e70f164e189bebf1cc1282428f`, staging overrides to `staging-api.nabome.online`, `staging.nabome.online`, KV `2db98525...`.
- **Build:** `pnpm build:api` = `mkdir -p dist && cp -r functions _lib _handlers prisma dist/` (copy-only, no bundling/typecheck; relies on Pages Functions raw TS via `wrangler pages dev`). Frontends `vite build` to `dist/` (287KB customer index, 199KB admin, 197KB shop).
- **Secrets:** `node infra/scripts/cf-secrets.mjs --env staging|production [--dry-run]` pushes required `DATABASE_URL, JWT_SECRET, CSRF_SECRET, STORAGE_*` + optional `RESEND, RAZORPAY, TURNSTILE, WEBHOOK, SENTRY`.
- **Guard:** `node infra/scripts/check-deploy.mjs [staging|production] [--skip-build]` checks git clean, `YOUR_` placeholders (warn staging, fail prod), bans `r2_buckets`, runs `typecheck → lint → test:unit → build`, requires `CONFIRM_PRODUCTION=1` for prod. CI `ci.yml` runs quality→build→integration→e2e on push production/PR; `release.yml` on `v*` tags verify→deploy-staging→deploy-production (requires staging success) → changelog.
- **Domains (intended):** `api.nabome.online` → `nabome-api`, `nabome.online` → customer, `admin.nabome.online` → admin, `shop.nabome.online` → shop; CORS origins must switch from localhost to `https://nabome.online,https://admin.nabome.online,https://shop.nabome.online` in prod.
- **Rollback:** `docs/ROLLBACK.md` documents `wrangler pages deployment list/rollback`, forward-only migrations, secrets versioned per deployment.

**Current deployment state:** local `wrangler dev` works (Docker Postgres `infra/docker-compose.yml:5432` + health checks); staging/production Pages projects not yet provisioned/verified; domains/CORS not configured; Neon prod not set.

---

## 16. Testing Architecture

| Layer       | Framework                             | Location                                                                                            | Count                     | Runs where                       |
| ----------- | ------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------- |
| Unit        | Vitest 4.1.10 jsdom                   | `packages/*/src/**/__tests__`, `apps/api/_lib/**/__tests__`, `apps/customer                         | admin                     | shop/**/**tests**`               | customer 121, shop 84, shipping 39, api 92 | local, CI `quality`            |
| Integration | Vitest + Docker PG 17                 | `apps/api/tests/{cart,checkout,integration/catalog                                                  | checkout                  | health,inventory}` ~26 tests     | Postgres service container                 | CI `integration`, local Docker |
| E2E         | Playwright 1.49.1 Chromium parallel 2 | `e2e/smoke.spec.ts, checkout.spec.ts, shop-owner-workflow.spec.ts, shop-isolation-security.spec.ts` | auto-starts 4 dev servers | CI `e2e`, blocked by prod config |
| Security    | Vitest                                | `apps/api/tests/security/security.test.ts`                                                          | added per security doc    | CI                               |
| Fixtures    | factories                             | `tests/fixtures/` (users, products, orders), `tests/mocks/fetch-mock.ts` zero-dep                   | deterministic             | all                              |

- Coverage ~9–20% (CI threshold 20% for V1, not enforced; README says 60% but not met).
- `vitest.workspace.ts` includes `packages/*/vitest.config.ts` + `apps/*/vitest.config.ts`.
- Husky + lint-staged, gitleaks/TruffleHog in CI.
- Missing: order state machine tests (packages/order 0 tests), tenant isolation tests, payment handler gateway tests, checkout→payment→order flow integration.

---

## 17. Current Status

```
CODE           ██████████ 100% — CODE READY FOR STAGING
INFRASTRUCTURE ██░░░░░░░░  25% — wrangler IDs real, Neon/Razorpay/Resend/Turnstile/Sentry prod not provisioned
STAGING        ░░░░░░░░░░   0% — NOT DEPLOYED (code ready, infra not provisioned)
PRODUCTION     ░░░░░░░░░░   0% — NOT READY (requires staging verification)
```

- **Branch:** `production`, Step 1 commit on top of `8965141` → `484a1e3`.
- **Git:** clean after Step 1 commit; `.env` and `.dev.vars` git-ignored.
- **Secrets:** not tracked (`.gitignore` covers `.env`, `.dev.vars`, `dist/`, `node_modules/`).

### Validation results (2026-08-29 Step 1)

| Check                       | Result                                              | Evidence                                                         |
| --------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm typecheck`            | **PASS**                                            | 0 errors (17 implicit-any fixed)                                 |
| `pnpm lint`                 | **PASS**                                            | 925 warnings (0 errors)                                          |
| `pnpm test:unit`            | **PASS**                                            | api 92, customer 121, shop 84, shipping 39 passed                |
| `pnpm build`                | **PASS**                                            | customer 288KB, admin 199KB, shop 197KB, api copy dist           |
| `pnpm check`                | **PASS**                                            | lint + format + typecheck + unit + architecture + env validation |
| `check-deploy --skip-build` | **PASS**                                            | clean tree, no YOUR_ placeholders, no R2 bindings                |
| `check-deploy` full         | **PASS** (requires `CONFIRM_PRODUCTION=1` for prod) | typecheck/lint/tests/build all pass                              |

---

## 18. Remaining Work

### A. AI-agent work (code/tests/docs/scripts, no external account needed)

**Step 1 completed — former P1 gate now PASS:**

- ~~Fix 17 `TS7006` implicit any~~ → FIXED (typed `collection`, `pc`, `sum/v`, `doc/tag/a/b` via inferred types)
- ~~Add `packages/shipping` to `allowDefaultProject`~~ → NOT NEEDED (lint 0 errors, shipping warnings only)
- ~~Update `scripts/check-architecture.mjs` `REQUIRED_PACKAGES`~~ → FIXED (added `customer,finance,order,payment,returns,shipping` + self-import fix)

**Remaining P1 hardening (deferred to Step 2, not blocking staging):**

**P1 — documented hardening still open:**

- Remove `debugToken`/`decodeToken` production exposure, guard `jsonwebtoken` Workers compat (consider `jose`).
- Remove `console.log/warn` ×100, `zustand/middleware/devtools` from `dashboard-store`, `isPasswordPolicyCompliant` length-only mismatch, `supabase` remnants.
- Reconcile dual `OrderStatus` (18 vs 16) and `SettlementStatus` duplication (`finance` + `payment`).
- Fix `coupon` TOCTOU (transactional `validate+increment`), `perCustomerLimit` null, guest `userId!` crash.
- Fix `transitionOrder` already wired to state machine — verify tests cover all 27 transitions.
- Finish checkout retry `setTimeout` blocking handler (use queue/workflow).

**P2 — tests:**

- Add unit tests for `order/service.transitionOrder` state machine validation, `checkout/security` ownership (was stub), `payment/handler` gateway selection, `finance/seqCache` transactional path, `tenant-isolation` failure-closed, IDOR matrix (shop A vs B).

**Docs:**

- Update README stale R2 → B2, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` → `VITE_TURNSTILE_SITE_KEY`, model counts, `build:api` description (`cp -r` not `tsc`).
- Update `docs/work/01-foundation.md` placeholder claims (now real IDs), Supabase removal notes.

### B. Manual owner work (requires external account/credentials/DNS)

| Item              | Action                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Cloudflare KV** | Already created (IDs present) — verify `wrangler kv namespace list` matches `6969b5...` + `2db98...`                                                         |
| **Hyperdrive**    | Already ID `e2b5c6e7...` — verify `wrangler hyperdrive list`, attach Neon connection string                                                                  |
| **Neon Postgres** | Provision prod project, set `DATABASE_URL` secret staging+prod, run `prisma migrate deploy` + `prisma db seed` (if needed)                                   |
| **Backblaze B2**  | Create bucket `nabome-media`, generate `STORAGE_*` keys, set secrets, enable versioning + lifecycle (P1)                                                     |
| **Razorpay**      | Create live keys + `RAZORPAY_WEBHOOK_SECRET`, register webhook `https://api.nabome.online/api/v1/webhooks/gateway/razorpay`                                  |
| **Resend**        | API key + `RESEND_FROM_EMAIL`, verify domain `nabome.online`                                                                                                 |
| **Turnstile**     | Create widgets for `nabome.online` + `staging.nabome.online`, set `TURNSTILE_SECRET_KEY` / `VITE_TURNSTILE_SITE_KEY` per env, remove hardcoded `0x4AAAAA...` |
| **Sentry**        | DSNs for API + 3 frontends, source maps, PII scrubbing (admin/shop now have `sentry.ts` but DSN unset)                                                       |
| **Domains/CORS**  | Point `api.nabome.online`, `nabome.online`, `admin.nabome.online`, `shop.nabome.online`, set `CORS_ORIGINS` + `APP_URL/PUBLIC_API_URL` per env               |
| **Backups**       | Verify Neon automatic backups retention, test `pg_dump` restore, document `prisma migrate deploy` order                                                      |

### C. AI + owner together (live staging verification)

1. Commit dirty tree (after typecheck fix) → `pnpm check:deploy:staging --skip-build` → `wrangler pages deploy` to `nabome-api-staging`.
2. Push secrets `cf-secrets.mjs staging --dry-run` then live.
3. Smoke: `GET /health`, login→cart→checkout→payment(mock)→order→finance ledger balance check, shop isolation (B cannot read A's product/order), admin RBAC (customer cannot hit admin), CSRF negative tests, webhook replay.
4. E2E `pnpm test:e2e` against staging URLs.
5. Promote to production with `CONFIRM_PRODUCTION=1` after approval, repeat smoke, tag `v*`.

---

## 19. Risks (verified against live code, not docs)

| #   | Severity    | Location                                           | Risk                                                                                                                                              |
| --- | ----------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | 🔴 Critical | `apps/api/functions/_middleware.ts:1 @ts-nocheck`  | Entire middleware un-typechecked — bypasses `typecheck` gate                                                                                      |
| R2  | 🔴 Critical | `packages/payment/src/money.ts:MIN/MAX`            | `MIN=1 paise` (<₹1) and `MAX=₹100k` (off 10×) — amount validation wrong                                                                           |
| R3  | 🟠 High     | `apps/api/_lib/auth/jwt.ts` `jsonwebtoken`         | Node-specific `jsonwebtoken` in Workers — brittle despite `nodejs_compat`; `jose` is Workers-native                                               |
| R4  | 🟠 High     | `apps/customer/src/lib/config.ts` vs `admin        | shop`                                                                                                                                             | Customer fixed to `VITE_PUBLIC_API_URL`, admin/shop still read `PUBLIC_API_URL` (undefined in Vite) — runtime undefined → fallback localhost |
| R5  | 🟠 High     | `apps/api/_lib/payment` coupon + `payment/service` | Coupon TOCTOU race + guest `userId!` crash; payment-engine idempotency random key (never hits) — duplicate payments                               |
| R6  | 🟠 High     | `apps/api/_lib/finance/service.ts:nextSequence`    | Now DB-backed but still `findFirst orderBy recordNumber desc` string sort — not guaranteed monotonic; needs `SELECT FOR UPDATE` or sequence table |
| R7  | 🟡 Medium   | Tax triple impl                                    | `cart/service.ts` (hardcoded 10 countries + 30 states) vs `cart/pricing.ts` TODO vs `checkout/tax-service.ts` — diverge, no single source         |
| R8  | 🟡 Medium   | `email/service.ts:58,113`                          | `http://localhost:5173` fallback leaks into prod emails if `APP_URL` unset                                                                        |
| R9  | 🟡 Medium   | `storage/index.ts` Mock singleton                  | `globalThis.__NABOME_MOCK_STORAGE__` shared across isolates — test pollution, prod mistakenly returns Mock if `ENVIRONMENT` spoofed               |
| R10 | 🟡 Medium   | `wrangler.jsonc` finance vars as strings           | `getFinanceConfig` silently falls back on invalid `FINANCE_COMMISSION_RATE="abc"` — no validation error, silent wrong commission                  |
| R11 | 🟢 Low      | 926 lint warnings                                  | `no-explicit-any` in `packages/ui` blocks future error-tightening; shipping not in `allowDefaultProject`                                          |
| R12 | 🟢 Low      | `checkout/service.ts:204-328` retry                | `setTimeout` inside handler blocks event loop, no idempotency — duplicate orders on retry                                                         |

Ready.md checkboxes that claim green but remain yellow on re-read: checkout IDOR now fixed but guest path not tested; rate limiter now fail-open corrected but `clientKey` still `'unknown'` shared bucket; auth cookie join bug fixed but `refresh` still expects Bearer not cookie.

---

## 20. Recommended Next Step

**Do NOT start implementation automatically.**

**Step 1** should be a single focused commit that makes the repo green and deployable, without touching business logic:

1. **Fix `pnpm typecheck`** — add explicit types to the 17 `implicit any` sites (or `unknown` + narrow) and re-run `pnpm typecheck` to 0 errors.
2. **Fix admin/shop `lib/config.ts`** — consolidate to `import.meta.env.VITE_PUBLIC_API_URL` (matching `.env.example` + `packages/config/env.ts`) and remove `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
3. **Commit dirty tree** — `git add . && git commit -m "chore: step0 baseline, typecheck and env consolidation"` (or split: `fix(api): typecheck any`, `fix(config): VITE env alignment`).
4. **Re-run** `pnpm check` and `node infra/scripts/check-deploy.mjs --skip-build` — both must pass before requesting owner to provision Neon/B2/Razorpay/Turnstile secrets.
5. **Then** proceed to Phase 1 security tests (checkout IDOR + tenant isolation E2E against Docker PG) before any staging deploy.

After Step 0, wait for explicit instruction to begin Step 1. No deployment, no secret rotation, no schema migration until owner approves.

---

_This document is the Step 0 baseline. Treat README/ready.md checkbox claims as unverified — this file is the authority until Step 1 completes._
