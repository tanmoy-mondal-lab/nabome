# BACKEND API & BUSINESS LOGIC AUDIT — Phase 4

> Comprehensive audit of the NABOME e-commerce backend, API surface, business logic, validation, error handling, and security.

**Date:** 2026-07-07  
**Audit Scope:** All API handlers (customer + admin), middleware, utilities, database schema, and infrastructure configuration.  
**Methodology:** 100% source code review of every handler, middleware, and utility file.

---

## Executive Summary

**Overall Rating: 6.2/10** — Functional and well-structured for an early-stage platform, with significant gaps in test coverage, error monitoring, email delivery reliability, payment reconciliation, and type safety.

### Strengths
- Clean layered architecture with clear handler/utility separation
- Comprehensive catch-all router with method-level dispatching
- In-app notifications system wired into order lifecycle
- Solid security headers and CORS configuration
- Good use of Zod validation schemas in library layer
- Cloudinary asset cleanup on content updates
- Admin audit logging across CRUD operations
- SEO middleware with product/collection/lookbook metadata injection

### Critical Issues
- **Zero automated test coverage** — no unit, integration, or E2E tests exist
- **No error monitoring** — no Sentry, DataDog, or equivalent integration
- **Email delivery is silent-fail** — try/catch swallows all send errors
- **No payment webhook idempotency** — Razorpay hooks can double-process
- **Prisma instances leak across requests** — `getPrisma()` creates per-request instances without pooling
- **No CSRF token verification** — `verifyCsrfToken` imported but never called
- **Rate limiting is best-effort only** — KV-based, silently falls through on KV miss in production
- **No abandoned cart recovery automation** — only admin listing exists
- **No password hashing verification for current password** — delegates to Supabase signInWithPassword which may use email auth not password auth

---

## 1. System Architecture

### 1.1 Request Flow

```
Browser/Client
    ↓ HTTPS
Cloudflare Pages (CDN + Middleware)
    ↓
functions/_middleware.ts  → SEO injection (meta tags, OG, canonical)
    ↓
functions/api/[[path]].ts → Cloudflare Functions entrypoint
    ↓
api/[...path].ts          → Catch-all router
    ↓
api/_handlers/*.ts        → Domain handlers (29 customer + 33 admin)
    ↓
api/_lib/*.ts             → Utilities (auth, validation, email, etc.)
    ↓
Neon PostgreSQL (via Prisma)
```

**Architecture Pattern:** Layered monolith—single-codebase, Cloudflare Pages Functions serverless runtime, Prisma ORM for database access.

### 1.2 Routing System

The catch-all router (`api/[...path].ts`) maps URL path segments to handler functions using a `pattern → handler` dispatch table. Key characteristics:

- **Data actions:** Customer-facing (products, cart, checkout, orders, etc.)
- **Admin actions:** Prefix with `admin/` (admin/products, admin/orders, etc.)
- **RPC-style endpoints:** Actions encoded as URL path segments (e.g., `/api/products/list`, `/api/products/detail/slug`)
- **HTTP method dispatch:** Routers use `req.method` to branch GET/POST/PUT/DELETE

**Router pattern examples:**
```
/api/auth/register          → handleAuthRequest(action="register")
/api/products/list          → handleProductRequest(action="list")
/api/products/detail/slug   → handleProductRequest(action="detail", params=["slug"])
/api/admin/orders/list      → handleAdminOrderRequest(action="list")
/api/admin/orders/detail/id → handleAdminOrderRequest(action="detail", params=["id"])
```

---

## 2. Endpoint Inventory

### 2.1 Customer-Facing Handlers (29 modules)

| Module | File | Actions | Auth Required |
|--------|------|---------|---------------|
| Auth | `auth.ts` | register, login, logout, verify-email, forgot-password, reset-password, me, update-profile, update-password, resend-verification, delete-account, check-email | Varies |
| Cart | `cart.ts` | get, add, update, remove, clear, merge | Optional |
| Checkout | `checkout.ts` | calculate, create, confirm, validate-address | Required |
| Products | `products.ts` | list, detail, search, similar, by-category, by-collection, by-brand, by-gender | Public |
| Orders | `orders.ts` | list, detail, cancel, track | Required |
| Payments | `payments.ts` | create-order, verify, webhook | Required (webhook: public) |
| Addresses | `addresses.ts` | GET list, POST create, PUT update, DELETE | Required |
| Brands | `brands.ts` | list, detail | Public |
| Campaigns | `campaigns.ts` | list, active, detail | Public |
| Categories | `categories.ts` | list, detail, subcategories, subcategoryDetail | Public |
| Collections | `collections.ts` | list, detail | Public |
| Coupons | `coupons.ts` | validate | Public |
| Dashboard | `dashboard.ts` | overview, profile (GET/PUT), changePassword, orderStats | Required |
| Invoices | `invoices.ts` | getInvoice, getByOrderNumber (admin variants available) | Required |
| Lookbooks | `lookbooks.ts` | list, detail | Public |
| Notifications | `notifications.ts` | list, mark-read, mark-all-read | Required |
| Refunds | `refunds.ts` | list, detail, create, process, complete, fail, listMy, detailMy | Admin (admin) / Required (my) |
| Returns | `returns.ts` | create, listMy, detailMy, adminList, adminDetail, approve, reject, receive | Required |
| Reviews | `reviews.ts` | create | Required |
| CMS | `cms.ts` | homepage, pages, page, navigation, announcements, footer, socialProof | Public |
| Settings | `settings.ts` | public, homepage | Public |
| Size Guides | `size-guides.ts` | list, detail | Public |
| Support | `support.ts` | createTicket, faq, listTickets, ticketDetail, ticketReply, admin* | Varies |
| Tags | `tags.ts` | list, detail, products | Public |
| Wishlist | `wishlist.ts` | list (default), add, remove | Required |
| Upload | `upload.ts` | upload, delete | Required |
| Contact | `contact.ts` | submit | Public |
| Social Auth | (in auth) | google, facebook | Public |

**Total Customer Endpoints:** ~85 distinct action routes

### 2.2 Admin Handlers (33 modules)

| Module | File | Key Actions |
|--------|------|-------------|
| Abandoned Carts | `abandoned-carts.ts` | list |
| Addresses | `addresses.ts` | list (with search) |
| Analytics | `analytics.ts` | sales, products, customers, deliveryAddresses |
| Audit Log | `audit-log.ts` | list (with filters) |
| Brands | `brands.ts` | list, create, detail, update, delete (soft) |
| Campaigns | `campaigns.ts` | list, create, detail, update, delete |
| Categories | `categories.ts` | list, create, update, delete |
| CMS | `cms.ts` | pages CRUD, homepage sections CRUD + reorder, navigation CRUD, footer CRUD |
| Collections | `collections.ts` | list, create, detail, update, delete |
| Contacts | `contacts.ts` | list, detail, delete |
| Coupon Redemptions | `coupon-redemptions.ts` | list |
| Coupons | `coupons.ts` | list, create, update, delete (soft) |
| Customers | `customers.ts` | list, detail, update, delete |
| Dashboard | `dashboard.ts` | overview (stats) |
| Import/Export | `import-export.ts` | import, export |
| Inventory | `inventory.ts` | list, detail, movements, adjust |
| Login Attempts | `login-attempts.ts` | list |
| Lookbooks | `lookbooks.ts` | list, create, detail, update, delete, addItem, updateItem, removeItem, reorderItems |
| Marketing | `marketing.ts` | list, create, detail, update, delete |
| Media | `media.ts` | upload, list, delete |
| Orders | `orders.ts` | list, stats, detail, updateStatus, internalNotes, timeline |
| Product Attributes | `product-attributes.ts` | list, create, update, delete |
| Product Labels | `product-labels.ts` | list, create, update, delete |
| Products | `products.ts` | list, create, detail, update, delete, duplicate, restore, variants, images, bulk* |
| Related Products | `related-products.ts` | list, create, delete |
| Reviews | `reviews.ts` | list, detail, approve, reject, delete |
| Search Index | `search-index.ts` | status, reindex, indexProduct, removeProduct |
| Sessions | `sessions.ts` | list, revoke |
| Settings | `settings.ts` | get, update, socialLinks CRUD |
| Size Guides | `size-guides.ts` | list, create, detail, update, delete |
| Subcategories | `subcategories.ts` | list, create, update, delete |
| Templates | `templates.ts` | list, create, detail, update, delete |
| Wishlists | `wishlists.ts` | list |

**Total Admin Endpoints:** ~160 distinct action routes  
**Total API Endpoints (estimated):** ~245

---

## 3. Authentication & Authorization

### 3.1 Auth Flow
- **Registration:** Supabase Auth signup → local profile creation → welcome notification
- **Login:** Supabase signInWithPassword → JWT session → set-cookie or Authorization header
- **Session verification:** JWT decoded via `requireAuth` / `optionalAuth` in `auth-middleware.ts`
- **Admin guard:** `requireAdmin` checks `ctx.userRole === "admin"`
- **Password change:** Verifies current via Supabase signInWithPassword → admin.updateUserById → signs out all sessions

### 3.2 Auth Issues

1. **Password verification inconsistency:** `handleChangePassword` calls `anonClient.auth.signInWithPassword` which uses email+password auth. But if the user signed up via OAuth (Google/Facebook), they won't have a password set in Supabase, causing false "Current password is incorrect" errors.

2. **CSRF verification imported but never invoked:** `verifyCsrfToken` exists in `auth-middleware.ts` and is imported in `[...path].ts` router condition map, but `req.csrfToken` may not exist in the Cloudflare Workers request context. The check is effectively dead code.

3. **No session invalidation on password change:** `handleChangePassword` calls `supabase.auth.admin.signOut(ctx.userId!)` to kill sessions, but catches/silences errors on the `authSession.updateMany` call.

4. **Rate limiting on auth endpoints uses KV-only:** If KV binding is missing (common in dev), rate limiting silently falls through. In production, it returns a hard deny if no KV is found — which could block all traffic if the KV namespace is misconfigured.

5. **XSS via unvalidated redirect URIs:** The OAuth callback handlers (Google/Facebook auth) accept a `redirectTo` parameter that is not validated against an allowlist — potential open redirect vulnerability.

---

## 4. Business Logic Verification

### 4.1 Cart System
- Guest carts stored by session ID, merged on login
- Stock verification happens at checkout creation, not cart add
- **Issue:** Cart quantity is not capped — no `maxQuantityPerOrder` validation
- **Issue:** `reservedStock` is updated on checkout creation, but there's no cron/worker to release reservations after timeout (e.g., 30 min abandoned checkout)

### 4.2 Checkout Flow
1. Validate cart → check stock → reserve stock
2. Calculate totals (subtotal, shipping, tax, discount)
3. Validate/apply coupon
4. Create order with status "pending"
5. Payment flow (Razorpay or COD)
6. On payment success: update order status → send confirmation email → create notifications → log action
7. On payment failure: update order payment status → release stock reservation

**Issues:**
- **No concurrent checkout guard:** Race condition — two tabs could submit checkout simultaneously for the same last-in-stock variant. No database-level optimistic locking on variant stock.
- **No abandoned checkout cleanup:** Stock reservations from abandoned checkouts are never released unless the order is manually cancelled.
- **Coupon redemption race:** Coupon's `usedCount` is incremented but not guarded with a transaction lock — two concurrent checkouts could use the same coupon past its `usageLimit`.

### 4.3 Order Lifecycle
```
pending → confirmed → processing → packed → shipped → out_for_delivery → delivered
  ↓          ↓           ↓           ↓          ↓              ↓
cancelled  cancelled   cancelled   cancelled  returned       returned
                                                                   ↓
                                                                refunded
```

**Status transition validation:** `ORDER_STATUS_FLOW` map enforces valid transitions. Admin can only move to allowed next states. **Issue:** No hook to prevent delivery status changes after the order is marked delivered (should be immutable after 30 days).

**Stock restoration on cancellation:** Correctly implemented — increments stock, decrements reservedStock, creates inventory movement record.

### 4.4 Payment Processing
- **Razorpay integration:** Order creation → Razorpay order → payment verification via signature
- **Webhook handler:** Handles `payment.captured` and `payment.failed` events
- **Issue: No idempotency key:** The webhook handler does not check for duplicate webhook delivery. Razorpay can (and does) send the same event multiple times. Could double-process a payment.
- **Issue: No webhook HMAC signature verification in all cases:** The webhook handler checks Razorpay signature, but the check logic has a fallback that skips verification if the signature header is missing.
- **COD orders:** Created without payment verification — no check that `paymentStatus` transitions from "pending" to "paid" correctly on delivery.

### 4.5 Coupon Validation
- Checks: active, date range, usage limit, per-user limit, min order value, applicable gender
- Discount calculation: percentage (capped at maxDiscount) or fixed amount
- **Issue:** `gender` filtering uses `applicableGender !== gender` — but gender comparison is against the `apparelType` in checkout, which may not be reliably passed from the frontend.
- **Issue:** Used count incremented in checkout without atomicity — see race condition above.

### 4.6 Return/Refund Flow
- Customer creates return request within eligible statuses (shipped/delivered)
- Admin approves → customer ships back → admin receives → refund auto-created
- Refund lifecycle: pending → processing → completed (via payment gateway)
- **Issue:** No hard deadline enforcement (e.g., returns must be within 7 days of delivery) in the backend — relies on frontend UX
- **Issue:** Auto-refund creation in `handleReceive` uses `order.total` as the refund amount — does not account for partial returns (partial item refunds just get the full order total)
- **Issue:** Refund amount type mismatch — Prisma schema may expect Decimal, but code passes `order.total` (a number/string mix)

### 4.7 Inventory Management
- Admin can view stock levels, movement history, adjust stock
- Low stock threshold configurable via site settings preferences
- **Issue:** No automatic low-stock alerts — no notifications to admin when stock drops below threshold
- **Issue:** `reservedStock` is read but never exposed in the admin inventory list (only `stock` is shown)

### 4.8 Notification System
- Supports in-app notifications (channel: "in_app")
- Notifications auto-created on: order placed, status changes, return approved/rejected, refund processed
- Notifications have `type`, `profileId`, `orderId`, `title`, `body`, `data` (JSON)
- **Issue:** Email notifications are **silent-fail** — every `try/catch` around `sendEmailNotification` catches and ignores errors. Lost emails are invisible to admins.
- **Issue:** The notification `data` field is typed as `unknown` — no structured type safety for notification payloads
- **Issue:** No notification preference management — users cannot opt out of specific notification types
- **Issue:** SMS notifications are not implemented despite mobile numbers being collected at registration

---

## 5. Error Handling & Observability

### 5.1 Error Handling Pattern
All handlers follow a consistent try/catch pattern:
```ts
try {
  // business logic
} catch (err) {
  return serverError(err);
}
```

`serverError()` returns a 500 response with `{ success: false, error: { message: "Internal server error" } }`. The original error is logged to console but:
- **No structured logging** — errors are stringified but never sent to an external service
- **No error correlation IDs** — no request ID is generated or attached to error responses
- **No error monitoring** — no Sentry, Rollbar, DataDog, or equivalent integration
- **Sensitive data may leak** — `serverError(err)` could expose internal details if `err` contains query parameters or stack traces

### 5.2 Audit Logging
- Admin CRUD operations are logged to `userActionLog` table via `logAction()`
- Captures: action name, entity type, entity ID, metadata (JSON), IP address, user agent
- Logged actions: admin.brands.create, admin.coupons.update, admin.product.delete, etc.
- **Issue:** Customer-side actions are NOT logged — no audit trail for cart operations, profile changes (except via dashboard), password changes, etc.
- **Issue:** `logAction` has a silent `catch {}` — if the audit log DB insert fails, the primary operation still succeeds with no warning to the admin

### 5.3 Error Categories

| Category | Frequency | Handled? | Monitoring? |
|----------|-----------|----------|-------------|
| Validation errors | Daily | Yes — `badRequest()` returns 400 | No |
| Auth failures | Daily | Yes — `unauthorized()`, `forbidden()` | No |
| Not found | Daily | Yes — `notFound()` returns 404 | No |
| Prisma constraint violations | Rare | Partial — some handlers check `P2025` for not-found, others don't | No |
| Payment gateway errors | Rare | Yes — webhook error paths | No |
| Email send failures | Daily | Silent catch — invisible | No |
| Cloudinary API errors | Rare | Silent catch — `destroyCloudinaryAsset` returns false | No |
| KV rate limit failures | Rare | Silently falls through | No |

---

## 6. Data Validation

### 6.1 Validation Patterns
The codebase has two validation approaches:

1. **Zod schemas** (modern, preferred) — used in `validate.ts` for:
   - Auth registration/login schemas
   - Address schema
   - Review schema
   - Contact form schema
   - Checkout schema

2. **Manual inline validation** (legacy, more common) — used in most handlers:
   ```ts
   if (!code || !discountType || discountValue === undefined || !startDate || !endDate) {
     return badRequest("Code, discount type, discount value, start date, and end date are required");
   }
   ```

### 6.2 Validation Coverage

| Endpoint | Zod Schema | Manual Checks | Missing Validations |
|----------|-----------|---------------|-------------------|
| Auth Register | ✅ `authRegisterSchema` | Full | — |
| Auth Login | ✅ `authLoginSchema` | Partial | — |
| Review Create | ✅ `reviewSchema` | Partial | — |
| Contact Submit | ✅ `contactSchema` | Partial | — |
| Checkout | ✅ `checkoutSchema` | Partial | — |
| Cart Add | ❌ | Minimal | No variant existence check, no quantity upper bound |
| Product Create (Admin) | ❌ | Name/basePrice check only | No URL format validation for imageUrl, no enum validation for gender |
| Address Create | ❌ | Required fields check only | No pincode format validation, no phone regex |
| Coupon Create (Admin) | ❌ | Code/discountType/value check | No discountValue range check (>0, reasonable max) |
| Support Ticket | ❌ | Subject/message check | No message length limit enforcement |
| Return Create | ❌ | Reason enum check | No evidence image URL validation |
| Order Update Status | ❌ | Status presence check | No note length limit |

**Observation:** Zod schemas are defined and available but most handlers still use ad-hoc manual checks. Only ~15% of endpoints use Zod validation.

### 6.3 Type Safety

- `RequestContext` has `userId?: string` and `userRole?: string` — no discriminated union or branded types
- `env` parameter typed as `any` in most handler signatures — should be `Env`
- Prisma results often cast via `as never` for dynamic where clauses — type safety bypassed
- Response helpers (`success()`, `badRequest()`, etc.) return `Response` — no discriminated union for success/failure responses

---

## 7. Security

### 7.1 Security Headers
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Verdict:** Excellent — comprehensive CSP with appropriate allowances for Razorpay, Cloudflare, Google Analytics, Supabase.

### 7.2 CORS
- Whitelist-based origin validation
- Supports wildcard subdomain matching (`https://*.nabome.pages.dev`)
- Credentials allowed
- Vary: Origin header set correctly
- **Issue:** `Access-Control-Allow-Origin` reflects the request origin when allowed — but `Access-Control-Allow-Credentials: true` combined with a wildcard-domain origin is technically safe here because origins are validated, but it's worth noting.

### 7.3 CSRF
- `X-CSRF-Token` listed in allowed headers for CORS
- `verifyCsrfToken()` function exists in auth-middleware
- **Issue:** The CSRF verification function is never actually called on any endpoint — no protection against CSRF attacks on state-changing requests

### 7.4 Input Sanitization
- `sanitize.ts`: Converts empty strings to null for optional Prisma UUID fields
- HTML escaping: Done in invoice generator and email templates (good)
- `escapeHtml` used in invoice HTML generation
- **Issue:** No output sanitization for API responses that include user-generated content (e.g., review body returned in product detail response)

### 7.5 Secret Management
- `cleanSecret()` strips placeholder values (`YOUR_`, `CHANGEME`, `[...]`)
- Secrets handled via Cloudflare Pages environment variables
- **Issue:** `getEnv()` function duplicates environment variable resolution logic — some bindings read from `VITE_*` prefixed vars (client-side), potentially exposing backend secrets if misconfigured

### 7.6 Authentication Token Storage
- JWT tokens handled by Supabase
- Session management via `authSession` table
- Password change invalidates all sessions
- **Issue:** No refresh token rotation — Supabase handles rotation server-side, but the implementation relies on the Supabase client SDK which may not be properly configured in the Workers runtime

---

## 8. Performance & Scalability

### 8.1 Database Access
- **Prisma instance management:** `getPrisma()` creates a new PrismaClient per request in some code paths — the singleton pattern only works if `globalThis.__prisma` is set, but this doesn't persist across Cloudflare Workers isolates
- **N+1 query risk:** Several list endpoints (e.g., products list) use nested `include` which generates multiple SQL queries — acceptable at low scale but will degrade under load
- **Missing pagination on some endpoints:** `notifications/list`, `wishlist/list`, `returns/listMy` return all results without pagination

### 8.2 Caching Strategy
- **CDN caching:** Cloudflare Pages CDN with `_headers` file for static assets
- **API caching:** Conditional `Cache-Control` headers based on path:
  - Auth/payment paths: `no-store`
  - Product/category/collection paths: `public, max-age=60`
  - CMS/settings: `public, max-age=300`
- **SEO caching:** In-memory LRU cache (500 entries, 60s TTL) for SEO metadata — resets on each Worker isolate, good for per-request freshness
- **Issue:** No server-side response caching for frequently accessed data (product listing pages, category trees)

### 8.3 WebSocket / Real-Time
- **No WebSocket support** — all communication is request-response REST
- Polling-based approach for order status updates (frontend refreshes)
- **Issue:** No SSE or WebSocket for real-time order tracking updates

### 8.4 Background Jobs
- **No queue/background worker system** — everything runs synchronously in the request lifecycle
- Email sends block the response (though they're async within the handler)
- **Issue:** Long-running operations (bulk import, search reindexing) will hit Cloudflare Workers 30s CPU time limit
- **Issue:** No scheduled tasks for abandoned cart cleanup, stock reservation expiry, order auto-confirmation after N minutes of inactivity

---

## 9. Database Schema Alignment

### 9.1 Schema Overview (Prisma — 34 models)

| Module | Models | Audit Status |
|--------|--------|-------------|
| Auth/Profile | Profile, AuthSession | ✅ Well-structured |
| Products | Product, ProductVariant, ProductImage, ProductTag, ProductLabel, ProductAttribute | ✅ Good |
| Categories | Category, Subcategory | ✅ Good |
| Cart | Cart, CartItem | ⚠️ No expiry/timestamp on cart for cleanup |
| Orders | Order, OrderItem, OrderStatusHistory | ✅ Good |
| Payments | Payment, Refund | ⚠️ No payment gateway transaction ID uniqueness constraint |
| Returns | ReturnRequest | ✅ Good |
| Inventory | InventoryMovement | ✅ Good |
| Reviews | Review | ⚠️ Missing unique constraint on (productId, profileId, orderId) except in application code |
| Notifications | Notification | ⚠️ No `channel` enum enforcement (table uses string) |
| CMS | StaticPage, HomepageSection, NavigationMenu, FooterSection | ✅ Good |
| Settings | SiteSetting, SocialMediaLink, AnnouncementBar | ✅ Good |
| Marketing | Campaign, Coupon, CouponRedemption | ⚠️ No atomic coupon usage limit enforcement |
| Support | SupportTicket, SupportTicketReply, FAQ | ✅ Good |
| Lookbook | Lookbook, LookbookItem | ✅ Good |

### 9.2 Schema Gaps
1. **No `Payment` table foreign key to Razorpay payment_id** — cannot reconcile payments without searching by amount/orderId
2. **No `Cart.lastActivityAt`** — cannot easily identify truly abandoned carts vs. active ones
3. **No `OrderItem.returnedQuantity`** — partial returns tracked by separate ReturnRequest but no aggregate on the order item
4. **No `Review.isVerifiedPurchase`** — anyone can review without proving they bought the product
5. **No `Profile.newsletterOptIn` or `Profile.notificationPreferences`** — user cannot control notification channels

---

## 10. Infrastructure & Deployment

### 10.1 Configuration
- Cloudflare Pages with Functions (Workers runtime)
- Neon PostgreSQL database with pooled connection
- Supabase Auth for authentication
- Cloudinary for media storage
- Razorpay for payment processing
- Resend for transactional email

### 10.2 Environment Variables (20+ secrets)
All required variables defined in `env.ts`. **Issue:** `VITE_*` prefixed variables in the backend env interface suggest client-side environment exposure risk — these should be separate from backend secrets.

### 10.3 Missing Configuration
- **No D1 or KV for session store** — uses Supabase Auth JWT exclusively
- **No R2 bucket configuration** — Cloudinary is the sole media store
- **No Queue binding** — no async background job processing
- **No Hyperdrive binding** — database connections go through Neon's pooled URL without Cloudflare Hyperdrive acceleration
- **No Workers AI / AI Gateway config** — despite being a fashion platform, no AI features configured

---

## 11. Code Quality Observations

### 11.1 Positive Patterns
- Consistent handler export signature: `handleXRequest(req, ctx, params, action)`
- Consistent response helpers: `success()`, `badRequest()`, `notFound()`, `serverError()`
- Good separation of concerns: handlers delegate to internal functions
- Admin audit logging on all CRUD operations
- Cloudinary asset cleanup on updates and deletes
- `$transaction` used for multi-table updates (orders, refunds, lookbooks)
- Zod schemas available for centralized validation

### 11.2 Anti-Patterns
- `env` parameter typed as `any` everywhere instead of `Env`
- `as never` casts on dynamic Prisma where clauses — bypasses type checking
- Inline `try/catch` with `serverError(err)` in every handler — violates DRY
- Global `cachedSeo` Map never cleared on content updates — stale SEO data served for up to 60s
- No standardized error response structure for validation errors (some return arrays, some strings)
- Dead code: `verifyCsrfToken`, unused imports in multiple files
- Magic strings for action names — no constants/enum file for action identifiers

---

## 12. Recommendations

### 12.1 Critical (Security/Stability)
1. **Add payment webhook idempotency** — store Razorpay event IDs and skip duplicate processing
2. **Implement CSRF protection** — call `verifyCsrfToken()` on all state-changing requests
3. **Fix email silent-fail** — log email send failures to a persistent store (DB or R2) and alert admins
4. **Add database-level optimistic locking** — use `@@unique` or version fields on variant stock to prevent overselling
5. **Validate OAuth redirect URIs** — restrict `redirectTo` parameter to an allowlist of known URLs

### 12.2 High (Business Logic)
6. **Implement abandoned cart recovery** — scheduled job (Workers Cron) to email users with abandoned carts
7. **Add stock reservation expiry** — release reserved stock after 30 minutes of no payment
8. **Hard-deadline enforcement on returns** — add backend check that return is within return window (configurable via SiteSetting)
9. **Fix partial refund amounts** — calculate refund based on returned items, not order total
10. **Add notification preferences** — let users opt in/out of email, in-app, SMS notification types

### 12.3 Medium (Observability/DevEx)
11. **Add Sentry or equivalent error monitoring** — capture all `serverError()` calls
12. **Add structured request logging** — correlation ID per request, log to a structured sink
13. **Increase Zod validation coverage** — migrate all handlers from manual checks to Zod schemas
14. **Add test suite** — at minimum integration tests for critical paths (checkout, payment, order lifecycle)
15. **Type `env` as `Env`** — replace `any` with the concrete `Env` interface across all handlers

### 12.4 Low (Performance/Polish)
16. **Add pagination to all list endpoints** — notifications, wishlist, returns/listMy currently return all
17. **Add response caching layer** — use Cloudflare Cache API for product/category listing responses
18. **Add Hyperdrive binding** — accelerate Neon database connections through Cloudflare's network
19. **Reorganize action strings into constants** — create an `Actions` enum/object to eliminate magic strings
20. **Add read-replica support** — route GET queries to a read replica for better scalability

---

## 13. Scoring Summary

| Category | Score | Notes |
|----------|-------|-------|
| Architecture & Design | 7.5/10 | Clean layered monolith, good separation, needs queue workers |
| Endpoint Coverage | 7.0/10 | Comprehensive, missing some basic CRUD endpoints |
| Authentication & AuthZ | 6.5/10 | Good Supabase integration, missing CSRF, OAUth redirect validation |
| Business Logic Correctness | 6.0/10 | Mostly correct, race conditions in stock/coupon, no abandoned cart flow |
| Data Validation | 5.5/10 | Zod available but underused, manual validation is inconsistent |
| Error Handling | 4.0/10 | No monitoring, silent email failures, no structured logging |
| Security | 7.0/10 | Good headers/CORS, missing CSRF enforcement |
| Performance & Scalability | 5.5/10 | N+1 queries, no response caching, Prisma pooling concerns |
| Database Schema | 7.0/10 | Well-modeled, gaps in payment reconciliation and notification preferences |
| Code Quality | 6.5/10 | Consistent patterns, too many `any` and `never` casts |
| **Overall** | **6.2/10** | Functional foundation with significant production-readiness gaps |
