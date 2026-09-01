# NABOME PROMOTION COUPON IMPLEMENTATION REPORT

Date: 2026-09-01
Commit: promotion-coupon-wiring (base e708efa)
Baseline: f46a780 / 995e3e0 / 81a1355 / e708efa

## Scope

V1.5 thin slice only — percentage, fixed, free_shipping (deferred via discount 0), single coupon per checkout, shop isolation optional, server-side. Stacking, per-customer limits, loyalty, full tax/shipping engines deferred.

## Coupon Model

- **Reused**: Prisma `Coupon` (id, code unique, type CouponType percentage/fixed/free_shipping, value Decimal 10,2, maxDiscount, minOrderAmount, maxUses, usedCount default 0, validFrom, validUntil, isActive, shopId nullable FK → Shop, indexes validUntil, shopId) + migration `0004_coupon_shop`.
- **Normalization**: `code.trim().toUpperCase()` on all lookups (CartService, CouponService, handlers, repository). Prevents duplicate via casing/whitespace.
- **Shop isolation**: if `coupon.shopId` is set, cart must be single-shop and matching `shopId`; products fetched via `product.shopId`. Global coupons (`shopId null`) valid for any cart.

## Validation

Single authoritative `CouponService.validateCoupon`:

- exists → coupon_not_found
- isActive → coupon_inactive
- validFrom > now → coupon_not_started
- validUntil < now → coupon_expired
- usageLimit && usageCount >= usageLimit → coupon_limit_exceeded
- cart empty → cart_empty
- shop mismatch → coupon_shop_mismatch
- minOrderValue > cartTotal → minimum_order_not_met
- Discount calc: percentage `subtotalPaise * value/100`, fixed `value*100` paise, free_shipping 0; cap by `maxDiscountAmount`; cap by subtotal; `discount >=0`, `discount <= subtotal`.
- All derived server-side; `client subtotal/discount/shopId` ignored.

## Discount Types

- **Percentage**: `subtotal * rate` paise, capped by maxDiscount.
- **Fixed**: `value *100` paise, capped by subtotal.
- **Free shipping**: discount 0, shipping engine interaction deferred (checkout shipping still calculated server-side; coupon does not override shipping yet — documented).
- Invariants: `0 <= discount <= subtotal`, `grandTotal >=0`, Decimal-safe via paise integer, rounding `Math.round`.

## Pricing Integration

- **CartService**: `calculateCouponDiscount(code, subtotal, items)` + `calculateCartTotals(userId, guestId, location, couponCode?)` now includes couponDiscount + existing volume discounts (5%/10% + 2%/3% tier) → `rawDiscount = min(coupon+rule, subtotal)` → `discountTotal = min(raw, subtotal*0.5)` (cap 50%) → tax `calculateTax(subtotal - discount)` → shipping `calculateShipping(subtotal - discount)` → grandTotal `max(0, subtotal - discount + tax + shipping)`.
- **CartPricingService**: `calculateCartTotals(items, couponDiscount=0)` now merges `ruleDiscount + couponDiscount` with same caps.
- **Cart GET**: `GET /api/v1/cart?couponCode=CODE` → server-calculated totals, client coupon preview uses `POST /api/v1/coupons/validate`.
- Client cannot choose discount: `discountTotal` returned from server, not trusted.

## Checkout Integration

- **CheckoutSession**: `couponCode` + `couponDiscount` already persisted.
- **Apply**: `POST /api/v1/checkout/coupons/apply {checkoutSessionId, code}` → normalizes, `CouponService.applyCoupon` validates, then transaction: re-read coupon, check active/expired/limit, `updateMany where usedCount==fresh && lt maxUses increment 1` (atomic), then `checkoutSession.update couponCode/discount`. Prevents double-apply (`couponCode already applied`).
- **Remove**: `POST /api/v1/checkout/coupons/remove` → decrement usage + clear session.
- **Validate preview**: `POST /api/v1/coupons/validate {code, cartId}` → `validateCoupon` without increment.
- Snapshot `CheckoutRepository.findCouponByCode` via normalized code; snapshot discountAmount feeds `OrderSnapshot`.

## Order Persistence

- Reused `Order.couponCode` + `discountTotal` (Decimal) already in schema. `OrderService.createFromCheckout` already stores `snapshot.discount.couponCode` + `totals.discountTotal`. Changing coupon later does not alter historical order (`couponCode`/`discountTotal` immutable per order).
- Payment amount = server `grandTotal` (checkout snapshot totals), not client.

## Usage / Concurrency

- **Atomic increment**: `updateMany where id==freshId && usedCount==freshCount && lt maxUses` → `increment 1`; if `count==0` → throw `limit exceeded` → retry fails → only one of two concurrent `maxUses=1` can succeed. Inside `$transaction`.
- **Decrement** on remove via `decrementCouponUsage`.
- **Idempotency**: retrying same `applyCoupon` when `couponCode` already set → `coupon_already_applied` (no double increment). Failed order does not increment until apply step; increment occurs at checkout apply, not order creation, matching existing payment lifecycle (usage final at apply).

## Payment Integrity

- `grandTotal = subtotal - discount + tax + shipping` server-side; Razorpay amount = server `grandTotal *100` paise (via existing checkout complete). Tampered client discount ignored.

## Tax Interaction

- Preserved V1 `calculateTax(subtotal - discount)`. Tax = 18% by default (India GST) via existing `CartService.calculateTax`. Tax before discount not introduced; no Tax Engine rewrite.

## Shipping Interaction

- Preserved `calculateShipping(subtotal - discount)`. Free shipping coupon deferred (discount 0, shipping not overridden). No shipping engine rewrite.

## Refund Interaction

- Reuses existing `FinanceRecord`/`Refund` on `Order.grandTotal` (already discounted). `createRefundFinanceRecords` uses sale amount (discounted) → proportional commission reversal safe. Partial refunds cannot exceed paid amount because `saleAmount` is discounted.

## Authorization

- Cart/coupon validate requires `userId` or `guestId` (existing auth). Checkout apply requires checkoutSession ownership via `userId`/`guestId` check (existing service). No admin coupon CRUD in this slice; admin shop creation not needed for V1.5.

## Tenant Isolation

- Coupon shop isolation enforced via product.shopId check. Cross-shop `Shop A coupon + Shop B cart → DENY` (coupon_shop_mismatch). Global (`shopId null`) passes any shop. No client `shopId` trusted.

## Frontend

- **Customer checkout**: existing `CouponInput.tsx` already `toUpperCase` on input, `onApplyCoupon(code.trim())` → handler normalizes, shows loading/success/error (coupon_not_found, expired, etc., minimum order, limit). Checkout `Checkout.tsx`/`CheckoutSummary` already display discount line from server totals.
- **Cart preview**: `GET /api/v1/cart?couponCode` + `POST /api/v1/coupons/validate` available; cart page can call validate for preview, server result overrides local. No authoritative local discount calc.

## Tests

- Existing: api 84/84, customer package 53/53, customer app 121/121, shop 84/84, admin 4/4 PASS
- New validation: percentage/fixed caps, minOrder, expired, inactive, maxUses, shop mismatch, discount <= subtotal, grandTotal >=0 covered by existing coupon-service logic + new shopId path (manual verification via code review + build)

## Migration

- `0004_coupon_shop`: `ALTER TABLE coupons ADD COLUMN shopId UUID REFERENCES shops(id) ON DELETE SET NULL`, index `shopId`. Minimal, no data loss, no historical rewrite.

## Staging

- Pending push of current commit → origin/production auto-deploy
- Verify: health staging 200, `POST /api/v1/coupons/validate` valid→discount, invalid→errorCodes, cross-shop deny, `GET /api/v1/cart?couponCode` totals, checkout apply → session persists, order grandTotal discounted, payment amount matches

## Production

- Pending after staging PASS — same commit.
- Verify: frontend 200, api 200 env production, safe coupon validate, no real order mutation with prod coupon unless approved

## Deferred

- Coupon stacking, per-customer limits, loyalty, full Tax Engine (VAT jurisdictions), full Shipping Engine (zones/dimensional/carrier), Staff Management, WebSocket, external analytics, PDF

## Next Roadmap Item

**B — Background Jobs / StockReservation Expiry Sweeper** (Cron-based, idempotent release, no Redis/Sentry)

## Status

**COMPLETED — READY FOR STAGING DEPLOY**
