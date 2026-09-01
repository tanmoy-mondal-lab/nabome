# NABOME RETURNS / PAYMENTS IMPLEMENTATION REPORT

Date: 2026-09-01
Commit: returns-payments-completion (base 1700a09)

## Current Gateway

- Razorpay for production (`PAYMENT_PROVIDER=razorpay`), `mock` for preview/local. Factory `resolveGateway` + `buildGatewayCredentials` from Env (RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET). Adapter contract `PaymentGateway.refund`.

## Payment Creation

- `Checkout → cart totals (server) → gateway order/payment` via `PaymentGateway.createOrder` (not changed). Server amount = `calculateCartTotals` + coupon discount server-side.

## Payment Verification

- Server-side signature verification via gateway adapter `verifyPayment` + webhook `verifyWebhook` (rawBody + HMAC). Client status ignored until gateway confirms.

## Webhook

- `WebhookEvent` table idempotency (`provider, eventId` unique), signature verified before state mutation, duplicate replay safe (findExisting → skip), unknown events logged, replay via eventId dedupe.

## Idempotency

- Payment creation: `idempotencyKey` per checkout, `financeRecord` `recordNumber` unique, duplicate request returns existing. Refund: `refund.id` as idempotencyKey `return-refund:${refund.id}` for gateway, `updateMany where id && status ACTIVE` pattern.

## Order Transition

- `Order.status` state machine via `orderStateMachine` + `transitionOrder` idempotent. Duplicate webhook → already transitioned → no-op. Timeline and finance guarded.

## Inventory

- Reservation ACTIVE → CONVERTED on payment success (via `convertReservation`), sweeper skips CONVERTED. Expiry → EXPIRED via `sweeper.ts` batch, inventory restored via `getTotalReservedForVariant`.

## Returns

- `ReturnsService.requestReturn` validates ownership (order.userId==requester), eligible status, return window 30d. Shop/admin `updateReturnStatus` enforces `requested→approved→received→refunded→completed` etc.

## Refund

- **Before**: `processRefund` TODO marked completed without gateway.
- **After**: Creates Refund (pending) + ReturnRefund (pending) → calls `gateway.refund({gatewayPaymentId, amountPaise, idempotencyKey: return-refund:${refund.id}, reason})` → on success update Refund completed + gatewayReference, ReturnRefund completed; on fail update failed + failureReason and throw. Gateway amount = `returnRequest.totalRefundAmount` (server), never client. `refund <= paidAmount` and `remaining refundable` enforced via existing payment service `remaining = paid - refundedSoFar` (checked in payment refund path; returns path uses order.grandTotal for full check).

## Finance

- `createOrderFinanceRecords` on payment success → sale + commission ledger balanced, idempotent per orderId+type sale. `createRefundFinanceRecords` on refund → reversal, ledger balanced. Duplicate webhook → existing record → skip.

## Security

- IDOR: return/order ownership check, shop admin scope via getOwnedShopIds, no client shopId. RBAC: admin/shop_owner/customer. Amount tampering: server recalc, client ignored. Signature bypass: rawBody verified. Coupon history preserved via Order snapshot.

## Tests

- api 84/84, customer 53/53, app 121/121, shop 84/84, admin 4/4 PASS; typecheck, lint 0 errors, build PASS
- Manual verification: return own order PASS, foreign DENY, tampered refund amount ignored

## Migration

- None (Refund gatewayReference already exists, ReturnRefund status enum covers pending/completed/failed)

## Staging

- Pending push → health 200 staging, controlled return+refund via staging coupon/return flow, gateway mock confirms

## Production

- Pending after staging — health 200 production, webhook endpoint verified

## Known Limitations

- Gateway refund failure currently throws ApiError and marks failed (retry via next status update); no automatic retry queue (future B Phase 2).
- Partial item-level refund amount derived from returnRequest.totalRefundAmount (pre-calculated, not dynamic per item qty in this slice).
- Coupon historical preserved; return window fixed 30d (no product-specific policy yet).

## Still Deferred

- Full payment provider switch, Stripe alternative, R2, Redis, Sentry, general queue
- Advanced return policy (category-specific window, restock fee dynamic)
- Automated refund webhook retry beyond existing webhook service

## Status

**M — Returns/Payments Gateway Completion (Phase 1): COMPLETED — actual gap (gateway refund) fixed, rest verified as already implemented**
