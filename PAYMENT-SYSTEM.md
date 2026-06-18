# নবME Payment System — Architecture & Implementation

## Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PAYMENT FLOW OVERVIEW                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐          │
│  │  User    │    │  Checkout    │    │  Razorpay SDK    │          │
│  │ Browser  │───▶│  Page        │───▶│  (checkout.      │          │
│  │          │    │  (React SPA) │    │   razorpay.com)  │          │
│  └──────────┘    └──────┬───────┘    └────────┬─────────┘          │
│                         │                     │                    │
│                         │ 1. POST /api/       │                    │
│                         │    checkout         │                    │
│                         ▼                     │                    │
│                   ┌──────────┐                │                    │
│                   │  Server  │                │                    │
│                   │  (Vercel)│                │                    │
│                   └────┬─────┘                │                    │
│                        │                      │                    │
│                        │ 2. Create Razorpay   │                    │
│                        │    Order via API     │                    │
│                        ▼                      │                    │
│                   ┌──────────┐                │                    │
│                   │ Razorpay │                │                    │
│                   │  Server  │                │                    │
│                   └────┬─────┘                │                    │
│                        │                      │                    │
│                        │ 3. Return            │                    │
│                        │    razorpay_order_id  │                    │
│                        ▼                      │                    │
│                   ┌──────────┐                │                    │
│                   │  Server  │◀────────────────│                    │
│                   │  stores  │                │                    │
│                   │  order   │   4. Returns    │                    │
│                   │  in DB   │   order +       │                    │
│                   └────┬─────┘   razorpay_id   │                    │
│                        │                      │                    │
│                        │ 5. openRazorpay()    │                    │
│                        │─────────────────────▶│                    │
│                        │                      │                    │
│                        │          6. Razorpay Checkout Modal Opens │
│                        │             ┌─────────────────────┐       │
│                        │             │  Credit/Debit Card  │       │
│                        │             │  UPI / GPay / PPay  │       │
│                        │             │  Net Banking        │       │
│                        │             │  Wallet             │       │
│                        │             │  EMI                │       │
│                        │             └─────────────────────┘       │
│                        │                      │                    │
│              ┌─────────┼──────────┬────────────┼─────┐             │
│              ▼         ▼          ▼            ▼     ▼             │
│          Success    Failure   Cancelled     Timeout  Error         │
│              │         │          │            │       │           │
│              │    ┌────┘          │            │       │           │
│              ▼    ▼               │            │       │           │
│         ┌──────────┐             │            │       │           │
│         │ 7. POST  │             │            │       │           │
│         │ /api/    │             │            │       │           │
│         │payments/ │             │            │       │           │
│         │verify    │             │            │       │           │
│         └────┬─────┘             │            │       │           │
│              │                   │            │       │           │
│              ▼                   ▼            ▼       ▼           │
│         ┌──────────┐     ┌──────────────────────────────┐         │
│         │ 8. HMAC  │     │ Error shown to user           │         │
│         │ Signature│     │ Order stays "pending"         │         │
│         │ Verify   │     │ "Payment failed" /            │         │
│         └────┬─────┘     │ "Payment cancelled"           │         │
│              │           └──────────────────────────────┘         │
│              ▼                                                     │
│         ┌──────────┐                                               │
│         │ 9. Update│                                               │
│         │ Order:   │                                               │
│         │ paid/    │                                               │
│         │ confirmed│                                               │
│         └────┬─────┘                                               │
│              │                                                     │
│              ▼                                                     │
│         ┌──────────┐                                               │
│         │ Success  │                                               │
│         │ Page     │                                               │
│         └──────────┘                                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │              WEBHOOK FLOW (reliability layer)             │      │
│  ├──────────────────────────────────────────────────────────┤      │
│  │                                                          │      │
│  │  Razorpay ──▶ POST /api/payments/webhook ──▶ Server      │      │
│  │  Server           │                                       │      │
│  │  (async)          │ HMAC verify webhook signature         │      │
│  │                   │                                       │      │
│  │                   ▼                                       │      │
│  │              ┌──────────┐                                 │      │
│  │              │ payment  │                                 │      │
│  │              │ .captured│─▶ Update order to paid          │      │
│  │              │ event    │                                 │      │
│  │              ├──────────┤                                 │      │
│  │              │ payment  │─▶ Update order to failed        │      │
│  │              │ .failed  │                                 │      │
│  │              └──────────┘                                 │      │
│  │                                                          │      │
│  │  Idempotency: Both webhook AND frontend callback can     │      │
│  │  fire. handleVerify and handleWebhook both check         │      │
│  │  order.paymentStatus === "paid" before processing.       │      │
│  └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Report

### Files Created

| File | Purpose |
|------|---------|
| `src/lib/razorpay/types.ts` | TypeScript declarations for Razorpay global (`Window.Razorpay`, `RazorpayOptions`, `RazorpayInstance`, response/error types) |
| `src/lib/razorpay/load-script.ts` | Dynamic script loader for `checkout.razorpay.com/v1/checkout.js` — checks for existing load before injecting |
| `src/lib/razorpay/use-razorpay.ts` | React hook wrapping the Razorpay SDK lifecycle — loading state, `openRazorpay()` promise-based function |

### Files Modified

| File | Change |
|------|--------|
| `src/lib/api/customer.ts` | Added `razorpaySignature` to `verifyPayment` params; fixed `reportPaymentFailed` to use `errorDescription` (matching server) |
| `src/storefront/pages/CheckoutPage.tsx` | Replaced `window.confirm()` simulation with real `openRazorpay()` call. Added success/failure/cancellation handling. Disabled button until SDK loads for online payments |
| `src/features/checkout/hooks/useCheckout.ts` | Same replacement in the extracted checkout hook |
| `api/_handlers/payments.ts` | Added webhook handler (`payment.captured` + `payment.failed` events). Added HMAC webhook signature verification. Added idempotency check to `handleVerify` |
| `api/[...path].ts` | Registered `POST /api/payments/webhook` route. Exempted webhook path from CSRF validation |
| `.env` | Added `VITE_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` |

### What Was Removed

- **`window.confirm()`** — the simulated payment dialog in both CheckoutPage and useCheckout hook
- **`"pay_sim_" + Date.now()`** — fake Razorpay payment IDs
- **Missing `razorpaySignature`** — the simulation omitted the signature entirely, which would have triggered HMAC validation failure
- **No payment error handling** — failures and cancellations now have proper handling with server-side reporting

### How the Flow Works

1. **Script Loading**: `useRazorpay()` hook loads `checkout.razorpay.com/v1/checkout.js` dynamically on mount via `<script>` injection. `loaded` state tracks availability.

2. **Order Creation** (server): `POST /api/checkout` creates the order in DB, calls Razorpay REST API (`POST /v1/orders`) to create a real Razorpay order, returns `{ order, razorpayOrderId }`. Stock decremented in transaction.

3. **SDK Initialization** (client): `openRazorpay(params)` creates a `new Razorpay({...})` instance with the real `razorpayOrderId`, `key_id` (from `VITE_RAZORPAY_KEY_ID`), prefilled customer info, and brand theme (`#B8860B`).

4. **Payment Modal** (client): `rzp.open()` opens the Razorpay Checkout popup. User selects payment method (card/UPI/netbanking/wallet) and completes authentication.

5. **Success Path** (client): Razorpay `handler` callback fires with `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`. Client calls `POST /api/payments/verify` with these + `orderId`.

6. **Server Verification** (server): HMAC SHA-256 of `razorpayOrderId|razorpayPaymentId` is computed using `RAZORPAY_KEY_SECRET` and compared to `razorpaySignature`. On match, order updated to `paid`/`confirmed` in a transaction. In-app notification created.

7. **Failure Path** (client): Razorpay `payment.failed` event fires. Client calls `POST /api/payments/failed` with order ID + error description. Order updated to `paymentStatus: "failed"` on server.

8. **Cancellation Path** (client): Razorpay `modal.ondismiss` fires when user closes the modal without completing payment. Error message shown to user. Order stays in `pending` status.

9. **Webhook (reliability)**: If the user closes their browser before the success callback completes, Razorpay sends `payment.captured` to `POST /api/payments/webhook`. Server verifies the HMAC webhook signature, finds the order by `razorpayOrderId`, and processes the payment.

10. **Idempotency**: Both `handleVerify` and `handleWebhook` check `order.paymentStatus === "paid"` before processing. If already paid, returns immediately.

---

## Security Review

### Authentication & Authorization

| Layer | Mechanism | Status |
|-------|-----------|--------|
| Razorpay order creation | HTTP Basic Auth with `RAZORPAY_KEY_ID:RAZORPAY_KEY_SECRET` | ✅ |
| Payment verification | HMAC SHA-256 (key is `RAZORPAY_KEY_SECRET`, data is `orderId\|paymentId`) | ✅ |
| Webhook verification | HMAC SHA-256 (key is `RAZORPAY_WEBHOOK_SECRET`, data is raw request body) | ✅ |
| Frontend SDK key | `VITE_RAZORPAY_KEY_ID` — public key, safe to expose | ✅ |
| Refund authorization | Requires admin auth (`{ auth: true }`) + admin role check | ✅ |
| Order lookup on verify | Direct `orderId` lookup — attacker needs valid order UUID | ✅ |

### Key Management

| Secret | Storage | Exposure |
|--------|---------|----------|
| `RAZORPAY_KEY_ID` | `.env` → Vercel env vars | Server-side only |
| `RAZORPAY_KEY_SECRET` | `.env` → Vercel env vars | Server-side only (never in client bundle) |
| `RAZORPAY_WEBHOOK_SECRET` | `.env` → Vercel env vars | Server-side only |
| `VITE_RAZORPAY_KEY_ID` | `.env` → Vite bundle | Client-safe (public key, same as publishable key) |

### Attack Surface Analysis

| Attack | Mitigation |
|--------|------------|
| **Payment replay** | Each payment has a unique `razorpayOrderId` (single-use Razorpay order). HMAC verification prevents forging payment IDs. |
| **Signature forgery** | HMAC SHA-256 with server-only secret key. Attacker cannot forge `razorpay_signature` without `RAZORPAY_KEY_SECRET`. |
| **Webhook spoofing** | HMAC webhook signature verified with `RAZORPAY_WEBHOOK_SECRET` (separate from API secret). Razorpay uses distinct secrets for API vs webhooks. |
| **Man-in-the-middle** | All Razorpay communication over HTTPS. CSP restricts `connect-src` to `api.razorpay.com`. |
| **CSRF on verify** | CSRF validation required for `/api/payments/verify`. Webhook path is exempted (Razorpay doesn't send CSRF tokens). |
| **Rate limiting** | 30 req/10s on `/api/payments/*`. Prevents brute-force of order IDs. |
| **Order ID enumeration** | Orders use UUIDs (not sequential integers). Verify endpoint requires valid UUID + matching Razorpay signature. |
| **Double payment** | Idempotency check in both `handleVerify` and `handleWebhook` — `paymentStatus === "paid"` guard prevents processing duplicate payments. |

### CSP (Content Security Policy)

The existing CSP already accounts for Razorpay:

```
script-src:
  https://checkout.razorpay.com   ✅ (SDK script loading)

frame-src:
  https://checkout.razorpay.com   ✅ (Razorpay Checkout popup)

connect-src:
  https://api.razorpay.com         ✅ (backend → Razorpay API calls)
```

No CSP changes needed.

### Remaining Risk (Accepted)

| Risk | Reason | Mitigation |
|------|--------|------------|
| Webhook secret not configured | Must be set in Razorpay dashboard + `.env` before launch | Webhook handler silently ignores when missing (returns `ignored` status) |
| Key rotation | No automated key rotation | Manual rotation via Razorpay dashboard |
| No idempotency key on Razorpay API calls | Razorpay order creation could theoretically duplicate if network retry occurs | Low probability; orders have unique `orderNumber` as receipt; dedup at DB level via unique constraint on `razorpayOrderId` |

---

## Webhook Event Architecture

### Event Types & State Transitions

```
Razorpay Events ──▶ Our System State Changes

payment.captured
  ├─▶ order.paymentStatus = "paid"
  ├─▶ order.status = "confirmed"
  ├─▶ order.razorpayPaymentId = payment.id
  ├─▶ OrderStatusHistory created (status="confirmed", note="Payment confirmed via webhook")
  └─▶ Notification created (type="payment_success")

payment.failed
  ├─▶ order.paymentStatus = "failed"
  ├─▶ OrderStatusHistory created (status="pending", note="Payment failed")
  └─▶ Notification created (type="payment_failed")

refund.created
  ├─▶ ReturnRequest auto-created (if none exists, status="approved")
  ├─▶ Refund record created (status="processing", transactionId=refund.id)
  ├─▶ order.paymentStatus = "partially_refunded" | "refunded"
  ├─▶ order.refundedAt set (if full refund)
  └─▶ Notification created (type="refund_processed")

refund.processed
  ├─▶ Refund record updated (status="completed", processedAt=now)
  ├─▶ order.paymentStatus = "partially_refunded" | "refunded"
  └─▶ Notification created (type="refund_processed")
```

### Order Synchronization Matrix

| Razorpay State | Our `paymentStatus` | Our `status` | Action Required |
|----------------|---------------------|---------------|-----------------|
| `paid` | `pending` | `pending` | Update to `paid`/`confirmed` |
| `paid` | `paid` | `confirmed` | None (idempotent) |
| `failed` | `pending` | `pending` | Update to `failed` |
| `failed` | `failed` | `pending` | None (idempotent) |
| `refunded` | `paid` | `confirmed` | Create refund, set `partially_refunded`/`refunded` |
| `refunded` | `refunded` | `refunded` | None (idempotent) |

### Dedup & Event ID Chain

```
Razorpay Event
  │
  ├── event_id: "event_E1x2y3z4a5b6c7d8"  (unique per event)
  ├── event: "payment.captured"
  └── id: "evt_..."                        (fallback for legacy events)

Our System:
  ┌─────────────────────────────────────┐
  │ WebhookEvent Table                  │
  ├─────────────────────────────────────┤
  │ source: "razorpay"                  │
  │ eventId: "event_E1x2y3z4a5b6c7d8"  │
  │ status: "received" | "processed"    │
  │         | "failed" | "skipped"      │
  │ retryCount: 0..3                    │
  │ payload: {full event data}          │
  └─────────────────────────────────────┘
        │
        ├── @@unique([source, eventId])  ← prevents duplicate processing
        │
        ▼
  Check on every webhook:
  ├── If exists + status="processed" → return "duplicate_ignored" (200)
  ├── If exists + status="failed" + retryCount < 3 → reprocess
  └── If exists + status="failed" + retryCount >= 3 → return "duplicate_ignored" (200)

---

## Security Validation Flow

```
Incoming Webhook POST
  │
  ├── 1. Check RAZORPAY_WEBHOOK_SECRET configured?
  │      ├── NO  → return success({ status: "ignored" })
  │      └── YES → continue
  │
  ├── 2. Extract x-razorpay-signature header
  │      ├── MISSING → return success({ status: "invalid_signature" })
  │      └── PRESENT → continue
  │
  ├── 3. Compute HMAC SHA-256(webhookSecret, rawBody)
  │      │     const expected = createHmac("sha256", webhookSecret)
  │      │       .update(rawBody)
  │      │       .digest("hex");
  │      │
  │      ├── MISMATCH → return success({ status: "invalid_signature" })
  │      └── MATCH    → continue
  │
  ├── 4. Parse JSON body
  │      ├── INVALID → return success({ status: "invalid_payload" })
  │      └── VALID   → continue
  │
  ├── 5. Check WebhookEvent dedup table
  │      ├── DUPLICATE processed → return success({ status: "duplicate_ignored" })
  │      ├── DUPLICATE failed (< 3 retries) → continue (reprocess)
  │      └── NEW → continue
  │
  ├── 6. Create/upsert WebhookEvent record (status="received")
  │
  ├── 7. Route to handler
  │      ├── UNKNOWN EVENT → update status="skipped", return 200
  │      ├── HANDLER ERROR → update status="failed", return 200
  │      └── SUCCESS       → update status="processed", return 200
  │
  └── 8. Always returns HTTP 200 to Razorpay
           (prevents automatic retries from Razorpay)
```

### Why Always Return 200?

Razorpay retries webhooks that return non-2xx status codes (up to 18 times over 24 hours). By always returning 200:

- Our dedup table is the single source of truth for retry logic
- Razorpay doesn't waste resources retrying events we've already processed
- We control retry cadence via admin reprocess endpoint
- Failed events are logged with error messages for debugging

---

## Error Recovery Strategy

### Failure Scenarios & Recovery

| Failure Mode | Detection | Recovery |
|-------------|-----------|----------|
| **Webhook secret not configured** | Handler logs `[WEBHOOK] Secret not configured` | Set `RAZORPAY_WEBHOOK_SECRET` in env, reconfigure webhook in Razorpay dashboard |
| **Signature mismatch** | Handler logs `[WEBHOOK] Invalid signature` | Verify webhook secret matches Razorpay dashboard. Check for key rotation |
| **Order not found** | Handler logs `[WEBHOOK] Order not found for...` | Event is stored as "processed" (no order to update). Investigate why order doesn't exist |
| **Handler throws** | WebhookEvent status="failed", errorMessage set | Admin reprocesses via `POST /api/admin/webhooks/reprocess/:id` |
| **Database unavailable** | WebhookEvent create/update fails | Event still returns 200 to Razorpay (they won't retry). Admin reconciles orders manually |
| **Duplicate event** | Dedup table finds existing "processed" | Returns "duplicate_ignored", no processing |
| **Partial system failure** (e.g., notification created but status update failed) | WebhookEvent status = "failed" | Transaction rollback ensures atomicity — handler retries reprocess the full event |
| **Race condition** (webhook + frontend callback race) | `handleVerify` and webhook both fire | Both check `paymentStatus === "paid"` before processing. First one wins. |

### Reprocess Flow

```
Admin triggers reprocess
  │
  ├── GET WebhookEvent record by ID
  │
  ├── Check eventType → select handler
  │
  ├── Call handler(event.payload)
  │      │
  │      ├── SUCCESS → Update WebhookEvent:
  │      │              status="processed"
  │      │              processedAt=now
  │      │              errorMessage=null
  │      │
  │      └── FAILURE → Update WebhookEvent:
  │                     status="failed"
  │                     errorMessage=new error
  │                     retryCount++
  │
  └── Return result to admin
```

### Reconciliation Endpoint

`POST /api/admin/webhooks/reconcile/:orderId`

Fetches the current state of a Razorpay order and compares it with our database:

```
Razorpay GET /v1/orders/:razorpayOrderId
  │
  ├── Check razorpayOrder.status
  ├── Check razorpayOrder.amount_due
  │
  ├── If "paid" + our paymentStatus ≠ "paid" → correct it
  ├── If "attempted" + amount_due > 0 + our paymentStatus ≠ "failed" → correct it
  │
  ├── GET /v1/orders/:razorpayOrderId/payments
  │     └── List all payments on this order
  │
  └── Return reconciliation report:
      ├── orderId, orderNumber
      ├── razorpayStatus, ourPaymentStatus, ourOrderStatus
      ├── correctionsApplied (boolean)
      ├── corrections (what was changed)
      └── paymentCount (number of Razorpay payments)
```

---

## Monitoring Strategy

### WebhookEvent Table Schema

```prisma
model WebhookEvent {
  id            String   @id @default(uuid())
  eventId       String   @unique               // Razorpay event.id for dedup
  source        String   @default("razorpay")
  eventType     String                         // "payment.captured", "refund.created", etc.
  status        String   @default("received")  // received | processed | failed | skipped
  payload       Json                           // Full raw payload for replay
  orderId       String?                        // Our order ID after resolution
  errorMessage  String?                        // Error details if processing failed
  processedAt   DateTime?
  retryCount    Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([source, eventId])
}
```

### Key Metrics

| Metric | Source | Alert Threshold |
|--------|--------|----------------|
| Webhook events per hour | `SELECT COUNT(*) FROM webhook_events WHERE created_at > now() - interval '1 hour'` | > 1000 (potential attack) |
| Failed event count | `SELECT COUNT(*) FROM webhook_events WHERE status = 'failed'` | > 0 (immediate investigation) |
| Duplicate event rate | `SELECT COUNT(*) FROM webhook_events WHERE status = 'skipped'` | Monitor for trends |
| Order reconciliation drift | Compare total orders paid in Razorpay vs our DB | Monthly audit |
| Webhook latency | `SELECT AVG(processedAt - createdAt) FROM webhook_events WHERE status = 'processed'` | > 5s |

### Admin Dashboard Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/admin/webhooks/events` | List webhook events with pagination, filter by status/eventType |
| `POST /api/admin/webhooks/reprocess/:id` | Manually reprocess a failed webhook event |
| `POST /api/admin/webhooks/reconcile/:orderId` | Reconcile order state with Razorpay |

### Health Check & Alerting Setup (Recommended)

```
Monitoring Stack:
  ├── Database queries on webhook_events table
  │     ├── Failed events > 0 → Slack/PagerDuty alert
  │     └── Event count spike > 3σ from baseline → investigate
  │
  ├── Razorpay Dashboard
  │     ├── Webhook delivery logs (success rate, latency)
  │     └── Payment reconciliation reports
  │
  └── Application logs
        ├── [WEBHOOK] prefix for all webhook activity
        └── Structured JSON with event_id, event_type, status, duration_ms
```

### Log Format

All webhook activity is logged with `[WEBHOOK]` prefix for easy grep:

```
[WEBHOOK] Secret not configured
[WEBHOOK] Missing x-razorpay-signature header
[WEBHOOK] Invalid signature
[WEBHOOK] Invalid JSON payload
[WEBHOOK] Error processing payment.captured: Order not found for...
[WEBHOOK] Error processing refund.created: (error message)
```

### Admin CLI Queries

```sql
-- Count events by status
SELECT status, COUNT(*) FROM webhook_events GROUP BY status;

-- Failed events in last 24h
SELECT * FROM webhook_events WHERE status = 'failed' AND created_at > now() - interval '24 hours';

-- Events for a specific order
SELECT * FROM webhook_events WHERE order_id = '<order-uuid>' ORDER BY created_at DESC;

-- Latest 50 events
SELECT id, event_type, status, error_message, created_at
FROM webhook_events
ORDER BY created_at DESC
LIMIT 50;

-- Duplicate event rate
SELECT COUNT(*) FILTER (WHERE status = 'skipped') * 100.0 / COUNT(*) AS duplicate_pct
FROM webhook_events
WHERE created_at > now() - interval '7 days';
```
