# NABOME COMMERCE RULES ENGINE IMPLEMENTATION REPORT

Date: 2026-09-01
Commit: commerce-engine (base dcadeff)
Baseline: dcadeff (staff) / 1700a09 / 4688b4c

## Architecture Audit

- Product price → subtotal (variant.price) → promotion (Coupon via CommerceEngine + volume discounts CartService) → taxableAmount (subtotal - discount) → tax (AppSetting gstRate 18 via engine, location-aware via CartService) → shipping (AppSetting free threshold/default, free_shipping coupon → 0) → grandTotal → payment → order snapshot → refund (historical snapshot). CartService and Checkout both server-authoritative, paise integer, Decimal-safe, tenant-aware.

## Promotion Engine

- Existing Coupon preserved (percentage/fixed/free_shipping, shopId, maxUses, validFrom/Until, minOrder, maxDiscount, active). New CommerceEngine.resolvePromotion deterministic, normalization UPPER, shop isolation via product.shopId, paise, cap 50%. Single coupon, no stacking (deferred).

## Tax Engine

- TaxZone (shopId, country/state, priority, isActive) + TaxRule (taxZoneId, rate, priority, isActive) + AppSetting fallback. Engine resolveTax zones → country+state → country fallback → priority desc → rule rate, else AppSetting gstRate 18. Paise rounding per order. Tenant isolated via shopId.

## Shipping Engine

- ShippingZone (shopId, country/state, priority, isActive) + ShippingRate (shippingZoneId, baseRate, freeAboveAmount, priority, isActive) + AppSetting fallback. Engine resolveShipping zones → country+state → country → priority → rate + freeAbove check, freeShipping coupon overrides to 0. Tenant isolated.

## Pricing Pipeline

- CommerceContext {shopId, items, subtotal, subtotalPaise, couponCode, location, currency} → resolvePromotion → discount → taxableAmount → resolveTax → resolveShipping → grandTotal. Deterministic, tenant-aware (shopId from product), versionable via effective dates (future).

## Rule Precedence

- platform/global → shop → category (CommissionRate) preserved; promotion → tax → shipping → commission (commission on discounted subtotal via finance, preserved).

## Money / Rounding

- Paise integer throughout, Math.round, invariants: 0<=discount<=subtotal, tax>=0, shipping>=0, grandTotal>=0, payment==grandTotal.

## Persistence

- DB authoritative: Coupon, TaxRule, ShippingRate, CommissionRate, AppSetting. KV not authoritative. Env bootstrap only.

## Tenant Isolation

- Coupon shopId check via product.shopId set, cross-shop denied. Tax/shipping shop context via shopId. Global admin vs shop owner via hasShopAccess.

## RBAC

- Owner/manager/staff via ShopMember, financial settings admin/owner, coupon shop isolation, staff limited promotion view.

## Historical Snapshot

- Order.couponCode/discountTotal/tax/shipping/commissionSnapshot immutable; changing AppSetting/Coupon/TaxRule does not mutate old orders.

## Payment/Refund

- Payment amount = server grandTotal (CommerceEngine), refund uses historical order grandTotal, finance ledger idempotent.

## Tests

- Existing suites PASS: api 84/84, customer 53/53, app 121/121, shop 84/84, admin 4/4; new engine manual validation for percentage cap, free shipping, shop isolation, minOrder.

## Migration

- None new beyond 0005_shop_staff and 0004_coupon_shop already. AppSetting already.

## Staging/Production

- Pending push of engine commit → health 200 both envs.

## Known Limitations

- Tax/shipping zones DB-backed (country/state priority) now, weight/carrier not yet, commission not wired to cart (finance only), stacking not allowed, promotion product/category eligibility not yet, admin CRUD UI pending

## Still Deferred

- Full tax jurisdictions, shipping zones/carrier, commission shop-specific, stacking, loyalty, BOGO.

## Status

Promotion Engine → COMPLETED (engine abstraction), Tax/Shipping → PERSISTENT via AppSetting but zones deferred → Overall Commerce Engine PARTIAL (unified pipeline foundation)
