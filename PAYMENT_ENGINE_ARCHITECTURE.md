# নবME (Nabome) — Payment Engine & Payment Processing Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for payment processing, gateway abstraction, payment lifecycle, reconciliation, and payment security  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), FINANCE_ENGINE_ARCHITECTURE.md (v1.0), SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Payment Foundation](#1-payment-foundation)
2. [Payment Methods](#2-payment-methods)
3. [Gateway Architecture](#3-gateway-architecture)
4. [Payment Lifecycle](#4-payment-lifecycle)
5. [Payment Validation](#5-payment-validation)
6. [Order Integration](#6-order-integration)
7. [Refunds](#7-refunds)
8. [Failure Handling](#8-failure-handling)
9. [Reconciliation](#9-reconciliation)
10. [Security](#10-security)
11. [Permissions](#11-permissions)
12. [Performance](#12-performance)
13. [Accessibility](#13-accessibility)
14. [Future Readiness](#14-future-readiness)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Payment Foundation

### 1.1 What

The foundational philosophy, ownership model, integrity guarantees, traceability standards, consistency rules, and relationship architecture that govern every payment on the Nabome platform.

### 1.2 Why

- **Revenue integrity:** Payments are the moment money moves — every payment must be accurate, traceable, and immutable.
- **Independence:** Payment Engine must be completely independent from Finance Engine. Payments process money. Finance records business events.
- **Gateway independence:** Payment gateways must be interchangeable without redesigning the system.
- **Compliance:** Indian payment regulations (RBI), PCI DSS, and audit requirements demand complete, immutable records.
- **Trust:** Customers must trust that charges are accurate. Shop owners must trust that settlements are correct.
- **Scalability:** Payment architecture must handle 0 to 1M+ transactions without redesign.

### 1.3 Where

Every checkout payment, refund, settlement payout, COD collection, wallet transaction, and payment verification across the Nabome platform.

### 1.4 Payment Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Immutable history** | Payment records are never physically deleted or modified | Audit trail, compliance, legal |
| **Append-only writes** | All payment changes create new records, never overwrite | Traceability, reproducibility |
| **Every payment has a Payment ID** | Permanent, unique identifier for every payment | Traceability, debugging |
| **Gateway independence** | No gateway-specific logic in business modules | Swappable gateways |
| **Server-side verification** | Never trust client-side payment status | Security |
| **Idempotent operations** | Same payment request produces same result | Prevent duplicates |
| **Atomic transactions** | Multi-step payment operations use database transactions | Consistency, no partial states |
| **Separation of concerns** | Payment Engine is independent from Finance Engine | Maintainability, testability |
| **Zero tolerance for data loss** | Payment data backed up, replicated, and archived | Business continuity |
| **Audit by default** | Every payment action logged with actor, timestamp, and context | Compliance |

### 1.5 Payment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT ENGINE ARCHITECTURE                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    PAYMENT SOURCES                         │   │
│  │                                                           │   │
│  │  Checkout │ Refunds │ Settlements │ Manual │ COD │       │   │
│  │  Wallets (future) │ Subscriptions (future) │ Escrow       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 PAYMENT ENGINE CORE                       │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Gateway  │  │ Payment  │  │ Refund   │  │Reconcili-││   │
│  │  │ Abstract │  │ Lifecycle│  │ Engine   │  │  ation   ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Validation│  │ Security │  │ Retry    │  │ Audit    ││   │
│  │  │  Engine  │  │  Engine  │  │  Engine  │  │  Logger  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              GATEWAY ADAPTER LAYER                         │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Razorpay │  │  future  │  │  future  │  │  future  ││   │
│  │  │ Adapter  │  │ Gateway  │  │ Gateway  │  │ Gateway  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DATA LAYER                              │   │
│  │                                                           │   │
│  │  Payment Records │ Refund Records │ Gateway Logs          │   │
│  │  Reconciliation  │ Audit Trail    │ Webhook Events        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Payment Ownership

| Entity | Owner | Location |
|--------|-------|----------|
| Payment records | Payment domain | `api/_handlers/payments/` |
| Gateway abstraction | Payment domain | `api/_lib/payments/` |
| Gateway adapters | Payment domain | `api/_lib/payments/adapters/` |
| Refund processing | Payment domain | `api/_handlers/payments/refunds/` |
| Webhook handling | Payment domain | `api/_handlers/webhooks/` |
| Payment validation | Payment domain | `api/_lib/payments/validation/` |
| Reconciliation | Payment domain | `api/_lib/payments/reconciliation/` |
| Payment security | Payment domain | `api/_lib/payments/security/` |

### 1.7 Payment Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Idempotency** | Every payment operation is idempotent | Prevent duplicate charges |
| **Atomicity** | Multi-step operations use database transactions | No partial payment states |
| **Consistency** | Payment state always matches gateway state | No phantom payments |
| **Isolation** | Concurrent payment operations don't interfere | Prevent race conditions |
| **Durability** | Committed payment data survives crashes | Business continuity |
| **Precision** | All currency values use `DECIMAL(10,2)` | Exact precision, no floating-point errors |
| **Non-repudiation** | Every payment action attributed to an actor | Legal accountability |

### 1.8 Payment Relationships

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Order     │       │   Payment    │       │PaymentGateway│
│──────────────│       │──────────────│       │   Event      │
│ id (PK)      │◀──┐   │ id (PK)      │◀──┐   │──────────────│
│              │   └───│ orderId      │   └───│ paymentId    │
└──────────────┘       │              │       │ eventType    │
                       │ gatewayId ───│──▶    │ payload      │
                       │              │       │ processedAt  │
                       │ status       │       └──────────────┘
                       │ amount       │
                       │ currency     │       ┌──────────────┐
                       │ method       │       │   Refund     │
                       │ gatewayRef   │       │──────────────│
                       └──────┬───────┘       │ id (PK)      │
                              │               │ paymentId ───│──▶ Payment
                              ▼               │ amount       │
                       ┌──────────────┐       │ reason       │
                       │PaymentHistory│       │ status       │
                       │──────────────│       │ gatewayRef   │
                       │ id (PK)      │       └──────────────┘
                       │ paymentId ───│──▶ Payment
                       │ fromStatus   │
                       │ toStatus     │       ┌──────────────┐
                       │ actorId      │       │Reconciliation│
                       │ reason       │       │   Record     │
                       │ createdAt    │       │──────────────│
                       └──────────────┘       │ id (PK)      │
                                              │ paymentId ───│──▶ Payment
                                              │ gatewayAmount│
                                              │ platformAmount│
                                              │ matched      │
                                              │ reconciledAt │
                                              └──────────────┘
```

### 1.9 Payment Traceability

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Payment ID** | Every payment gets a unique UUID | Permanent reference |
| **Gateway reference** | Gateway transaction ID stored | Cross-reference |
| **Source linkage** | Every payment linked to order | Trace back to origin |
| **Actor attribution** | Every action tagged with user/system | Accountability |
| **Timestamp** | UTC timestamp on every record | Temporal accuracy |
| **Metadata** | Gateway response stored as JSONB | Debugging, reconciliation |
| **Immutable logs** | Payment logs never modified or deleted | Compliance |

### 1.10 Payment Consistency

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Single source of truth** | Payment table is the source of truth | No conflicting states |
| **State machine** | Validated state transitions only | Prevent illegal states |
| **Webhook reconciliation** | Webhook events reconciled with local state | Detect discrepancies |
| **Idempotent webhooks** | Same webhook processed once | Prevent duplicates |
| **Consistency checks** | Periodic consistency verification | Detect drift |

### 1.11 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Trust client-side payment status | Security risk — client can be tampered | Server-side verification only |
| Hardcode gateway logic in business modules | Cannot swap gateways | Gateway abstraction layer |
| Delete payment records | Destroys audit trail, illegal | Append-only, soft delete |
| Use float for currency | Rounding errors accumulate | Use DECIMAL(10,2) |
| Skip webhook verification | Accept fraudulent webhooks | Signature verification always |
| Process payments synchronously | Blocks user requests | Background verification |
| Skip duplicate detection | Double charges | Idempotency keys + unique constraints |
| Return 200 on webhook failures | Gateway won't retry | Return non-2xx on failures |
| Mix payment logic with finance logic | Tight coupling | Independent modules |
| Skip audit logging | Cannot debug, non-compliant | Log every payment event |

---

## 2. Payment Methods

### 2.1 What

The complete architecture for supporting multiple payment methods — online payments, cash payments, manual payments, and future wallet, EMI, BNPL, and international payment methods.

### 2.2 Why

- **Conversion:** More payment options = more completed purchases.
- **Trust:** Customers prefer familiar payment methods.
- **Market reach:** Different demographics use different methods.
- **Future-proof:** Architecture must support new methods without redesign.
- **Business flexibility:** Admin must control which methods are available.

### 2.3 Where

Checkout flow (payment step), payment confirmation, refund processing, admin payment settings, order detail pages.

### 2.4 Payment Method Registry

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT METHOD REGISTRY                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ONLINE PAYMENTS (Current)                                │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │   UPI    │  │  Cards   │  │Netbanking│  │ Wallets  ││   │
│  │  │ GPay     │  │  Visa    │  │  SBI     │  │ Paytm    ││   │
│  │  │ PhonePe  │  │ Master   │  │  HDFC    │  │ PhonePe  ││   │
│  │  │ BHIM     │  │ RuPay    │  │  ICICI   │  │ Freecharge││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  OFFLINE PAYMENTS (Current)                               │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐                              │   │
│  │  │   COD    │  │  Manual  │                              │   │
│  │  │  Cash on │  │  Bank    │                              │   │
│  │  │ Delivery │  │ Transfer │                              │   │
│  │  └──────────┘  └──────────┘                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FUTURE PAYMENTS                                          │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Wallets  │  │   EMI    │  │  BNPL    │  │Intl Pay  ││   │
│  │  │ Platform │  │  Cards   │  │  Pay     │  │  Stripe  ││   │
│  │  │  Wallet  │  │  EMI     │  │  Later   │  │  PayPal  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Online Payment Architecture

| Method | Gateway | Processing | Settlement | Use Case |
|--------|---------|------------|------------|----------|
| **UPI** | Razorpay | Instant authorization | T+1 | Default for India |
| **Credit/Debit Cards** | Razorpay | Authorization + Capture | T+2-3 | Premium purchases |
| **Netbanking** | Razorpay | Redirect flow | T+2-3 | Bank-focused users |
| **Wallets** | Razorpay | Instant | T+1 | Quick payments |

**Online Payment Flow:**

```
1. Customer selects payment method
2. Client calls create-payment API
3. Server creates gateway order (amount in paise)
4. Server returns gateway order ID + key
5. Client opens gateway modal/SDK
6. Customer completes payment on gateway
7. Gateway returns payment result (client-side)
8. Client calls verify-payment API
9. Server verifies signature (HMAC-SHA256)
10. Server verifies amount matches
11. Server creates Payment record (status: captured)
12. Server creates Order record
13. Server decrements inventory
14. Server sends confirmation
15. Webhook confirms payment (idempotent fallback)
```

### 2.6 Cash on Delivery (COD) Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Availability** | Admin-configurable per pincode | Operational control |
| **Maximum amount** | Configurable cap (default ₹5,000) | Risk management |
| **Verification** | Phone verification required | Reduce returns |
| **Order status** | Order confirmed, payment pending | Deferred payment |
| **Payment on delivery** | Collected by courier | Cash collection |
| **Confirmation** | Courier confirms collection via webhook | Proof of collection |
| **Reconciliation** | Courier settlement reconciled daily | Financial accuracy |

**COD Flow:**

```
1. Customer selects COD at checkout
2. Server validates COD eligibility (pincode, amount)
3. Order created with status: confirmed, paymentStatus: pending
4. Order shipped to customer
5. Courier collects cash on delivery
6. Courier webhook confirms collection
7. Payment record created (status: captured)
8. Payment linked to order
9. Finance engine notified of payment
```

### 2.7 Manual Payment Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin creates manual payment record | Flexibility |
| **Use case** | Bank transfer, outside-system payments | Edge cases |
| **Verification** | Admin verifies payment proof | Accuracy |
| **Approval** | May require second admin for large amounts | Governance |
| **Audit** | Full audit trail with proof attachment | Compliance |

### 2.8 Payment Method Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| **COD enabled** | Boolean | true | Enable/disable COD |
| **COD max amount** | Decimal | ₹5,000 | Maximum COD order value |
| **COD restricted pincodes** | JSONB | [] | Pincodes where COD is blocked |
| **Online payment enabled** | Boolean | true | Enable online payments |
| **Default payment method** | Enum | online | Default at checkout |
| **Manual payment enabled** | Boolean | false | Enable admin manual payments |

### 2.9 Payment Method Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side selection** | Payment method validated server-side | Security |
| **Amount limits** | Min/max per method | Risk management |
| **Eligibility** | Methods available based on order properties | Business rules |
| **Fallback** | If selected method fails, offer alternatives | Conversion |
| **Receipt** | Payment receipt generated for every method | Customer trust |
| **Refund method** | Refund to original payment method | Accuracy |

---

## 3. Gateway Architecture

### 3.1 What

The complete abstraction layer that decouples payment business logic from specific gateway implementations — enabling gateway swapping, multiple gateway support, and gateway-independent payment processing.

### 3.2 Why

- **Independence:** Gateway-specific logic never enters business modules.
- **Swappability:** Replace Razorpay with Stripe without touching order logic.
- **Multi-gateway:** Support multiple gateways simultaneously.
- **Testing:** Mock gateways for testing without real transactions.
- **Future-proof:** New gateways added via adapter, not redesign.

### 3.3 Where

Payment creation, payment verification, refund processing, webhook handling, reconciliation, and all gateway interactions.

### 3.4 Gateway Abstraction Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                    GATEWAY ABSTRACTION LAYER                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PAYMENT SERVICE (Business Logic)             │   │
│  │                                                           │   │
│  │  createPayment() → GatewayAdapter.createOrder()           │   │
│  │  verifyPayment() → GatewayAdapter.verifySignature()       │   │
│  │  processRefund() → GatewayAdapter.createRefund()          │   │
│  │  handleWebhook() → GatewayAdapter.parseWebhook()          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              GATEWAY ADAPTER INTERFACE                     │   │
│  │                                                           │   │
│  │  interface PaymentGatewayAdapter {                        │   │
│  │    createOrder(params): GatewayOrder                      │   │
│  │    verifySignature(payload, signature): boolean           │   │
│  │    createRefund(params): GatewayRefund                    │   │
│  │    parseWebhook(payload, headers): WebhookEvent           │   │
│  │    getOrderStatus(gatewayOrderId): GatewayStatus          │   │
│  │  }                                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              GATEWAY ADAPTERS                              │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Razorpay │  │  Stripe  │  │  future  │  │  future  ││   │
│  │  │ Adapter  │  │ Adapter  │  │ Adapter  │  │ Adapter  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              EXTERNAL GATEWAYS                             │   │
│  │                                                           │   │
│  │  Razorpay API │ Stripe API │ Other Gateway APIs           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Gateway Adapter Interface

```typescript
interface PaymentGatewayAdapter {
  readonly name: string;
  readonly supportedMethods: PaymentMethod[];

  createOrder(params: CreateOrderParams): Promise<GatewayOrder>;
  verifySignature(payload: string, signature: string): boolean;
  createRefund(params: CreateRefundParams): Promise<GatewayRefund>;
  parseWebhook(payload: string, headers: Headers): WebhookEvent;
  getOrderStatus(gatewayOrderId: string): Promise<GatewayStatus>;
}

interface CreateOrderParams {
  amount: number;          // In paise (smallest currency unit)
  currency: string;        // "INR"
  receipt: string;         // Unique receipt ID
  metadata: Record<string, string>;
}

interface GatewayOrder {
  id: string;              // Gateway order ID
  amount: number;
  currency: string;
  status: string;
}

interface CreateRefundParams {
  gatewayPaymentId: string;
  amount?: number;         // Optional: partial refund
  reason?: string;
  metadata?: Record<string, string>;
}

interface GatewayRefund {
  id: string;              // Gateway refund ID
  amount: number;
  status: string;
}

interface WebhookEvent {
  type: string;            // "payment.captured", "refund.processed"
  gatewayPaymentId: string;
  gatewayOrderId?: string;
  amount?: number;
  metadata: Record<string, string>;
  rawPayload: unknown;
}
```

### 3.6 Gateway Configuration

| Setting | Type | Description |
|---------|------|-------------|
| **GATEWAY_PROVIDER** | Enum | Active gateway (razorpay, stripe, etc.) |
| **GATEWAY_KEY_ID** | Secret | Gateway API key |
| **GATEWAY_KEY_SECRET** | Secret | Gateway API secret |
| **GATEWAY_WEBHOOK_SECRET** | Secret | Webhook signature secret |
| **GATEWAY_MODE** | Enum | sandbox / production |
| **GATEWAY_CURRENCY** | String | Default currency (INR) |
| **GATEWAY_TIMEOUT** | Integer | Request timeout in ms (default 30000) |
| **GATEWAY_RETRY_ATTEMPTS** | Integer | Max retry attempts (default 3) |

### 3.7 Gateway Adapter Directory Structure

```
api/_lib/payments/
├── index.ts                    # Payment service (business logic)
├── types.ts                    # Shared payment types
├── adapters/
│   ├── index.ts               # Adapter registry
│   ├── types.ts               # Gateway adapter interface
│   ├── razorpay/
│   │   ├── index.ts           # Razorpay adapter implementation
│   │   ├── client.ts          # Razorpay API client
│   │   ├── webhook.ts         # Razorpay webhook parser
│   │   └── types.ts           # Razorpay-specific types
│   └── [future-gateway]/
│       └── index.ts           # Future gateway adapter
├── validation/
│   ├── schemas.ts             # Payment validation schemas
│   └── index.ts               # Validation helpers
├── security/
│   ├── signature.ts           # Signature verification
│   ├── encryption.ts          # Encryption helpers
│   └── tokens.ts              # Tokenization helpers
├── reconciliation/
│   ├── index.ts               # Reconciliation service
│   └── matchers.ts            # Matching algorithms
└── webhooks/
    ├── index.ts               # Webhook router
    └── handlers.ts            # Webhook event handlers
```

### 3.8 Gateway Independence Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No gateway imports in handlers** | Business handlers never import gateway SDK | Swappability |
| **Adapter pattern** | All gateway interactions via adapter interface | Abstraction |
| **Configuration-based** | Active gateway selected via config | Runtime switching |
| **Response normalization** | All gateway responses normalized to common format | Consistency |
| **Error normalization** | All gateway errors normalized to common format | Consistency |
| **Amount in paise** | Always use smallest currency unit | Precision |

### 3.9 Sandbox Support

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Environment detection** | GATEWAY_MODE determines sandbox/production | Safety |
| **Sandbox keys** | Separate keys for sandbox mode | Isolation |
| **Sandbox testing** | Full flow testable without real money | Development |
| **Sandbox webhooks** | Sandbox webhooks supported | Testing |
| **Mode indicator** | UI shows sandbox/production mode | Transparency |

### 3.10 Production Support

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Live keys** | Production keys in Cloudflare Secrets | Security |
| **Webhook URLs** | Production webhook URLs configured | Reliability |
| **Monitoring** | Gateway health monitored | Uptime |
| **Alerting** | Gateway failures trigger alerts | Response time |
| **Failover readiness** | Architecture supports gateway switching | Resilience |

### 3.11 Multiple Gateway Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Primary/secondary** | One active, one standby | Failover |
| **Method routing** | Route by payment method to different gateways | Optimization |
| **Cost optimization** | Route to cheapest gateway per transaction | Cost reduction |
| **Load balancing** | Distribute across gateways | Performance |
| **A/B testing** | Test gateway performance | Data-driven decisions |

---

## 4. Payment Lifecycle

### 4.1 What

The complete, controlled workflow that every payment must follow — from creation through processing to completion, with clearly defined states, transitions, and rules.

### 4.2 Why

- **Operational clarity:** Everyone knows exactly what stage a payment is in.
- **Automation:** Status transitions trigger automated actions.
- **Accountability:** Every transition has an actor, timestamp, and reason.
- **Prevention:** Invalid transitions are blocked at the system level.
- **Reconciliation:** Payment state must match gateway state.

### 4.3 Where

Payment detail pages, order detail pages, admin dashboard, reconciliation reports, API responses.

### 4.4 Payment States

| State | Description | Visible To | Next Possible States |
|-------|-------------|------------|---------------------|
| **created** | Payment record created, awaiting initiation | System, Admin | initiated, failed |
| **initiated** | Gateway order created, awaiting customer action | Customer, Admin | processing, failed, cancelled |
| **processing** | Customer submitted payment, gateway processing | Customer, Admin | authorized, failed |
| **authorized** | Gateway authorized, awaiting capture | Admin | captured, failed |
| **captured** | Payment confirmed, funds received | Customer, Shop Owner, Admin | (terminal — completed) |
| **completed** | Payment settled, funds in account | Customer, Shop Owner, Admin | (terminal) |
| **failed** | Payment failed at any stage | Customer, Admin | created (retry) |
| **cancelled** | Customer cancelled payment | Customer, Admin | (terminal) |
| **refunded** | Full refund processed | Customer, Shop Owner, Admin | (terminal) |
| **partially_refunded** | Partial refund processed | Customer, Shop Owner, Admin | refunded, partially_refunded |
| **expired** | Payment window expired | Customer, Admin | created (retry) |

### 4.5 Payment Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT LIFECYCLE                              │
│                                                                  │
│  ┌──────────┐                                                    │
│  │ CREATED  │ ◀── Payment record created in database             │
│  └────┬─────┘                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │INITIATED  │ ◀── Gateway order created, SDK loaded            │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ├──▶ [CANCELLED] ◀── Customer closed modal                │
│       │                                                          │
│       ├──▶ [FAILED] ◀── Gateway order creation failed           │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │PROCESSING │ ◀── Customer submitted payment to gateway         │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ├──▶ [FAILED] ◀── Gateway declined / error                │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │AUTHORIZED │ ◀── Gateway authorized (cards only)               │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ├──▶ [FAILED] ◀── Capture failed                          │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │ CAPTURED  │ ◀── Payment confirmed by gateway                  │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │ COMPLETED │ ◀── Funds settled to platform account             │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ├──▶ [PARTIALLY_REFUNDED] ◀── Partial refund processed    │
│       │                                                          │
│       ├──▶ [REFUNDED] ◀── Full refund processed                 │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐                                                    │
│  │(TERMINAL)│ ◀── Payment lifecycle complete                     │
│  └──────────┘                                                    │
│                                                                  │
│  ALTERNATE PATHS:                                                │
│  ┌──────────┐     ┌──────────┐                                   │
│  │  FAILED  │ ──▶ │ CREATED  │ ◀── Retry (new attempt)          │
│  └──────────┘     └──────────┘                                   │
│                                                                  │
│  ┌──────────┐                                                    │
│  │ EXPIRED  │ ◀── Payment window timeout (15 min)                │
│  └──────────┘                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Transition Rules

| From State | Allowed To States | Trigger | Actor Required |
|------------|-------------------|---------|----------------|
| **created** | initiated, failed | System creates gateway order | System |
| **initiated** | processing, failed, cancelled | Customer action / timeout | Customer / System |
| **processing** | authorized, failed | Gateway response | Gateway / System |
| **authorized** | captured, failed | Auto-capture or manual | System / Admin |
| **captured** | completed, partially_refunded, refunded | Settlement / refund | System / Admin |
| **completed** | partially_refunded, refunded | Refund processed | Admin / System |
| **failed** | created | Retry attempted | Customer / System |
| **cancelled** | (terminal) | — | — |
| **expired** | created | Retry attempted | Customer / System |

### 4.7 Payment Lifecycle Automation

| Transition | Automated Action | Rationale |
|------------|------------------|-----------|
| **created → initiated** | Create gateway order via adapter | Begin payment |
| **initiated → processing** | Log customer submission | Tracking |
| **processing → captured** | Create payment record, notify order | Confirmation |
| **captured → completed** | Settlement reconciliation | Financial |
| **failed → created** | Allow retry with new gateway order | Recovery |
| **initiated → expired** | Timeout after 15 minutes, release inventory | Cleanup |
| **captured → refunded** | Process refund via adapter | Financial |
| **Any → webhook** | Reconcile with gateway state | Accuracy |

### 4.8 Payment Lifecycle Timing

| Metric | Standard | Rationale |
|--------|----------|-----------|
| **Creation to initiation** | < 30 seconds | Customer confidence |
| **Processing to capture** | < 10 seconds | Customer expectation |
| **Webhook processing** | < 5 seconds | Timeliness |
| **Retry cooldown** | 30 seconds between retries | Prevent abuse |
| **Payment timeout** | 15 minutes | Release inventory |
| **Expired cleanup** | Auto-expire after 15 min | Resource management |

---

## 5. Payment Validation

### 5.1 What

The complete architecture for validating every aspect of a payment — amount, currency, order, duplicate prevention, fraud readiness, signature verification, and callback validation.

### 5.2 Why

- **Accuracy:** Wrong amounts lose money.
- **Security:** Invalid signatures enable fraud.
- **Integrity:** Duplicate payments destroy trust.
- **Compliance:** Payment regulations require validation.

### 5.3 Where

Payment creation, payment verification, webhook handling, refund processing.

### 5.4 Amount Validation

| Validation | Standard | Response |
|------------|----------|----------|
| **Positive amount** | amount > 0 | "Invalid payment amount" |
| **Maximum limit** | amount ≤ ₹10,00,000 | "Amount exceeds maximum" |
| **Minimum limit** | amount ≥ ₹1.00 | "Amount below minimum" |
| **Currency match** | Currency matches order total | "Currency mismatch" |
| **Paise conversion** | Amount in paise (×100) | Exact precision |
| **Order total match** | Server amount = order total | "Amount mismatch" |
| **Decimal precision** | Exactly 2 decimal places | "Invalid amount format" |

### 5.5 Currency Validation

| Validation | Standard | Response |
|------------|----------|----------|
| **Supported currency** | INR (default), USD (future) | "Currency not supported" |
| **Format** | ISO 4217 code | "Invalid currency code" |
| **Precision** | 2 decimal places for INR | "Invalid currency precision" |

### 5.6 Order Validation

| Validation | Standard | Response |
|------------|----------|----------|
| **Order exists** | Order ID valid | "Order not found" |
| **Order pending** | Status = pending | "Order already paid" |
| **Order not expired** | Within payment window | "Order expired" |
| **Stock available** | All items in stock | "Item no longer available" |
| **Price valid** | Current price matches | "Price updated" |
| **Address valid** | Shipping address complete | "Invalid address" |
| **Guest order** | Guest token valid if guest | "Invalid session" |

### 5.7 Duplicate Prevention

| Check | Standard | Rationale |
|-------|----------|-----------|
| **Idempotency key** | Unique per checkout attempt | Prevent double-submit |
| **Payment dedup** | `gatewayPaymentId` unique constraint | Prevent double-charge |
| **Time window** | 5-minute cooldown between orders from same user | Prevent rapid duplicates |
| **Cart dedup** | Don't process same cart twice | Integrity |
| **Webhook idempotency** | Process webhook only once | Prevent duplicates |
| **Order number uniqueness** | Sequential with collision check | Guaranteed unique |

### 5.8 Signature Verification

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Algorithm** | HMAC-SHA256 | Industry standard |
| **Secret** | Gateway webhook secret | Secret-based verification |
| **Timing-safe** | Use timing-safe comparison | Prevent timing attacks |
| **Always verify** | Never skip signature check | Security |
| **Log failures** | Log all verification failures | Fraud detection |

### 5.9 Callback Validation

| Validation | Standard | Response |
|------------|----------|----------|
| **Signature valid** | HMAC-SHA256 verified | "Invalid signature" |
| **Amount matches** | Gateway amount = order amount | "Amount mismatch" |
| **Order matches** | Gateway order = local order | "Order mismatch" |
| **Status valid** | Gateway status recognized | "Unknown status" |
| **Timestamp fresh** | Within 5-minute window | "Stale callback" |
| **IP whitelist** | Gateway IP (if available) | "Unauthorized source" |

### 5.10 Fraud Readiness

| Check | Standard | Rationale |
|-------|----------|-----------|
| **Velocity check** | Max 5 payments per user per hour | Abuse prevention |
| **Amount anomaly** | Flag orders > 3× average order value | Risk scoring |
| **New account** | Flag first-time customer high-value orders | Risk scoring |
| **Address mismatch** | Flag billing/shipping address mismatch | Risk scoring |
| **Device tracking** | Track device fingerprint per user | Pattern detection |
| **IP geolocation** | Flag unusual location changes | Risk scoring |

---

## 6. Order Integration

### 6.1 What

The complete architecture for how the Payment Engine integrates with orders, checkout, refunds, finance, notifications, and documents.

### 6.2 Why

- **Accuracy:** Payment state must always match order state.
- **Timeliness:** Payment events must trigger order updates immediately.
- **Consistency:** Order and payment data must always agree.
- **Automation:** Payment events should trigger automated actions.
- **Visibility:** All parties must see accurate payment status.

### 6.3 Where

Checkout flow, order creation, order status updates, refund processing, notification sending, document generation.

### 6.4 Payment-Order Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT-ORDER INTEGRATION                      │
│                                                                  │
│  1. CHECKOUT ENTRY                                               │
│     → Validate cart                                              │
│     → Reserve inventory                                          │
│     → Calculate total                                            │
│                                                                  │
│  2. CREATE PAYMENT                                               │
│     → Create Payment record (status: created)                   │
│     → Create gateway order via adapter                          │
│     → Return gateway order ID to client                         │
│     → Payment status: initiated                                  │
│                                                                  │
│  3. CUSTOMER PAYMENT                                             │
│     → Customer completes payment on gateway                     │
│     → Gateway processes payment                                 │
│     → Gateway returns result to client                          │
│                                                                  │
│  4. VERIFY PAYMENT                                               │
│     → Client calls verify-payment API                           │
│     → Server verifies signature                                 │
│     → Server verifies amount                                    │
│     → Payment status: captured                                  │
│                                                                  │
│  5. CREATE ORDER                                                 │
│     → Create Order record                                       │
│     → Create OrderItem records                                  │
│     → Link payment to order                                     │
│     → Decrement inventory                                       │
│     → Clear cart                                                │
│     → Send confirmation email                                   │
│     → Notify Finance Engine                                     │
│                                                                  │
│  6. WEBHOOK CONFIRMATION                                         │
│     → Razorpay webhook confirms payment                         │
│     → Idempotent: won't create duplicate order                  │
│     → Handles case where client callback fails                  │
│                                                                  │
│  7. REDIRECT                                                     │
│     → Customer redirected to /order-confirmed/:orderId          │
│     → Show order number + details + next steps                  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.5 Checkout Integration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Payment method selection** | Customer selects at checkout | Choice |
| **Amount calculation** | Server calculates total | Accuracy |
| **Gateway order creation** | Server creates gateway order | Security |
| **SDK loading** | Razorpay SDK loaded on checkout entry | Speed |
| **Modal opening** | Gateway modal opens on "Place Order" | Clear action |
| **Success handling** | Redirect to confirmation | Clear completion |
| **Failure handling** | Show error + retry option | Recovery |

### 6.6 Refund Integration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Order cancellation, return, rejection | Financial |
| **Method** | Refund to original payment method | Customer preference |
| **Partial refund** | Support item-level refunds | Flexibility |
| **Full refund** | Support complete order refund | Flexibility |
| **Timeline** | 5-7 business days for processing | Bank processing |
| **Notification** | Email with refund details + ETA | Transparency |

### 6.7 Finance Integration

| Event | Finance Action | Timing |
|-------|---------------|--------|
| **Payment captured** | Create finance record for revenue | On capture |
| **Refund processed** | Create refund finance record | On refund |
| **COD collected** | Create finance record for COD | On collection |
| **Settlement paid** | Record settlement transaction | On settlement |

### 6.8 Notification Integration

| Event | Recipient | Channel | Content |
|-------|-----------|---------|---------|
| **Payment success** | Customer | Email + Push | Payment confirmation + order number |
| **Payment failure** | Customer | Email + Push | Payment failed + retry link |
| **Refund initiated** | Customer | Email | Refund initiated + ETA |
| **Refund completed** | Customer | Email | Refund processed + amount |
| **COD collected** | Admin | Dashboard | COD collection confirmation |

### 6.9 Document Integration

| Document | Trigger | Content |
|----------|---------|---------|
| **Payment receipt** | Payment captured | Payment details, amount, method |
| **Invoice** | Order confirmed | Order items, totals, tax |
| **Refund receipt** | Refund processed | Refund amount, method, ETA |

---

## 7. Refunds

### 7.1 What

The complete architecture for processing full and partial refunds — from refund initiation through gateway processing to completion, with validation, tracking, and history.

### 7.2 Why

- **Customer trust:** Easy refunds build purchase confidence.
- **Compliance:** Consumer protection laws require refund capability.
- **Accuracy:** Refunds must be precisely tracked.
- **Financial integrity:** Refunds must reconcile with payments.

### 7.3 Where

Order detail page, refund request flow, admin refund panel, payment history, financial reports.

### 7.4 Refund Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REFUND ARCHITECTURE                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  REFUND TYPES                                              │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │   │
│  │  │   Full   │  │  Partial │  │  Future  │               │   │
│  │  │  Refund  │  │  Refund  │  │ Credit   │               │   │
│  │  │          │  │          │  │  Note    │               │   │
│  │  └──────────┘  └──────────┘  └──────────┘               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  REFUND LIFECYCLE                                          │   │
│  │                                                           │   │
│  │  initiated → processing → completed → settled             │   │
│  │      │          │            │                             │   │
│  │      └──▶ failed (retry)    └──▶ partially_refunded      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  REFUND TRACKING                                           │   │
│  │                                                           │   │
│  │  Refund ID │ Payment ID │ Amount │ Status │ Gateway Ref  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Full Refund Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Order cancellation, return, rejection | Financial |
| **Amount** | Original payment amount | Complete reversal |
| **Commission reversal** | Platform commission also reversed | Accuracy |
| **Earnings reversal** | Shop earnings also reversed | Accuracy |
| **Inventory** | Stock restored on cancellation | Inventory accuracy |
| **Timeline** | 5-7 business days | Bank processing |
| **Notification** | Email with refund details | Transparency |

### 7.6 Partial Refund Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Item-level** | Refund specific items from order | Flexibility |
| **Amount** | Sum of refunded items | Accuracy |
| **Commission** | Proportional commission reversal | Accuracy |
| **Earnings** | Proportional earnings reversal | Accuracy |
| **Multiple refunds** | Support multiple partial refunds | Flexibility |
| **Remaining balance** | Track remaining refundable amount | Visibility |

### 7.7 Refund Validation

| Validation | Standard | Response |
|------------|----------|----------|
| **Order exists** | Valid order ID | "Order not found" |
| **Payment captured** | Payment must be captured | "Payment not captured" |
| **Not already refunded** | Check refund status | "Already refunded" |
| **Amount valid** | Refund ≤ original amount | "Refund exceeds payment" |
| **Partial amount valid** | Refund ≤ remaining refundable | "Amount exceeds refundable" |
| **Refund window** | Within 180 days of payment | "Refund window expired" |
| **Reason required** | Must provide refund reason | "Reason required" |

### 7.8 Refund Tracking

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Unique Refund ID** | UUID for every refund | Traceability |
| **Gateway reference** | Gateway refund ID stored | Cross-reference |
| **Status tracking** | Real-time status updates | Visibility |
| **Timeline** | Refund request → Processing → Complete | Workflow |
| **History** | Complete refund history | Audit trail |

### 7.9 Refund Status

| Status | Description | Visible To |
|--------|-------------|------------|
| **initiated** | Refund requested, awaiting processing | Customer, Admin |
| **processing** | Gateway processing refund | Customer, Admin |
| **completed** | Refund confirmed by gateway | Customer, Shop Owner, Admin |
| **failed** | Refund failed (retry or investigate) | Admin |
| **settled** | Funds returned to customer | Customer, Shop Owner, Admin |

### 7.10 Refund History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Complete record** | Every refund fully documented | Audit trail |
| **Status tracking** | Real-time status visibility | Transparency |
| **Amount tracking** | Refund amount recorded | Financial clarity |
| **Reason tracking** | Refund reason recorded | Context |
| **Actor tracking** | Who initiated refund | Accountability |
| **Timestamp** | When refund was initiated | Temporal accuracy |
| **Immutable** | Refund records never deleted | Compliance |

---

## 8. Failure Handling

### 8.1 What

The complete architecture for handling payment failures — from error detection through retry strategy to recovery workflow, ensuring maximum payment completion rate.

### 8.2 Why

- **Revenue:** Failed payments lose sales directly.
- **Trust:** Good failure handling builds confidence.
- **Resilience:** System must recover from transient failures.
- **Visibility:** Failures must be visible for investigation.

### 8.3 Where

Payment processing, webhook handling, reconciliation, admin dashboard, customer notifications.

### 8.4 Payment Failure Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PAYMENT FAILURE HANDLING                        │
│                                                                  │
│  1. FAILURE DETECTED                                             │
│     → Gateway returns error / webhook reports failure           │
│     → Error classified by type and severity                     │
│                                                                  │
│  2. CLASSIFICATION                                               │
│     → Transient: Network timeout, gateway busy                  │
│     → Permanent: Insufficient funds, card declined              │
│     → System: Gateway error, configuration issue                │
│                                                                  │
│  3. RETRY (if transient)                                         │
│     → Exponential backoff (1s, 2s, 4s)                         │
│     → Max 3 retries                                             │
│     → Show retry count                                          │
│     → After max retries: show permanent error                   │
│                                                                  │
│  4. USER NOTIFICATION                                            │
│     → Toast for transient errors                                │
│     → Modal for permanent errors                                │
│     → Always include recovery action                            │
│                                                                  │
│  5. RECOVERY                                                     │
│     → "Try Again" for retryable errors                          │
│     → "Try Different Method" for method-specific errors         │
│     → "Contact Support" for unexplained errors                  │
│                                                                  │
│  6. INVENTORY                                                    │
│     → Release reserved inventory on failure                     │
│     → Allow re-purchase after cooldown                          │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 Failure Types

| Type | Examples | Retry | User Action |
|------|----------|-------|-------------|
| **Transient** | Network timeout, gateway busy | Yes | Retry |
| **Permanent** | Insufficient funds, card declined | No | Try different method |
| **System** | Gateway error, config issue | No | Contact support |
| **Validation** | Amount mismatch, invalid signature | No | Restart checkout |
| **Expired** | Payment window timeout | No | Restart checkout |

### 8.6 Retry Strategy

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Max retries** | 3 attempts | Prevent infinite loops |
| **Backoff** | Exponential (1s, 2s, 4s) | Prevent gateway flooding |
| **Cooldown** | 30 seconds between retries | Prevent abuse |
| **Retry on** | Transient errors only | Don't retry permanent failures |
| **New order** | Create new gateway order on retry | Fresh attempt |
| **User control** | User can manually retry | Control |

### 8.7 Timeout Handling

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Gateway timeout** | 30-second timeout | Reasonable wait |
| **Client timeout** | Show "Taking longer than expected" | Transparency |
| **Webhook timeout** | Process within 30 seconds | Timeliness |
| **Payment window** | 15 minutes | Release inventory |
| **Expired payment** | Mark as expired, allow retry | Cleanup |

### 8.8 Duplicate Request Handling

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Double submit** | Idempotency key prevents duplicate | Integrity |
| **Same payment ID** | Return existing result | Idempotency |
| **Concurrent webhooks** | Process once, return cached result | Deduplication |
| **Retry after success** | Return success, don't reprocess | Idempotency |

### 8.9 Interrupted Payment Handling

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Browser closed** | Webhook handles completion | Resilience |
| **Network lost** | Poll gateway for status | Recovery |
| **App backgrounded** | Resume on foreground | Continuity |
| **SDK crash** | Re-init SDK, check status | Recovery |

### 8.10 Recovery Workflow

| Step | Action | Timing |
|------|--------|--------|
| **1** | Detect failure | Immediate |
| **2** | Classify error type | Immediate |
| **3** | Notify user | Immediate |
| **4** | Offer retry (if applicable) | Immediate |
| **5** | Release inventory | On failure confirmed |
| **6** | Log failure for investigation | Immediate |
| **7** | Monitor failure rate | Continuous |

---

## 9. Reconciliation

### 9.1 What

The complete architecture for verifying that platform payment records match gateway records — ensuring every transaction is accounted for and discrepancies are detected and resolved.

### 9.2 Why

- **Accuracy:** Platform and gateway records must agree.
- **Compliance:** Financial regulations require reconciliation.
- **Fraud detection:** Discrepancies may indicate fraud.
- **Financial integrity:** Ensure no money is lost or duplicated.

### 9.3 Where

Payment records, gateway reports, settlement reports, financial reports, admin dashboard.

### 9.4 Reconciliation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RECONCILIATION ARCHITECTURE                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RECONCILIATION TYPES                                     │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Gateway  │  │Settlement│  │ Payment  │  │ Daily    ││   │
│  │  │ Recon    │  │  Match   │  │ Verify   │  │ Recon    ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RECONCILIATION PROCESS                                    │   │
│  │                                                           │   │
│  │  1. Fetch gateway report (daily/real-time)                │   │
│  │  2. Compare with local payment records                    │   │
│  │  3. Match by gateway payment ID                           │   │
│  │  4. Flag discrepancies                                    │   │
│  │  5. Investigate and resolve                               │   │
│  │  6. Generate reconciliation report                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DISCREPANCY TYPES                                         │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Missing  │  │ Amount   │  │ Status   │  │ Duplicate ││   │
│  │  │ Record   │  │ Mismatch │  │ Mismatch │  │ Payment  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 9.5 Gateway Reconciliation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Frequency** | Daily automated, real-time for critical | Timeliness |
| **Method** | Match by gateway payment ID | Accuracy |
| **Scope** | All payments in reconciliation period | Completeness |
| **Report** | Discrepancy report generated | Visibility |
| **Alert** | Discrepancies > threshold trigger alert | Proactive |

### 9.6 Settlement Matching

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Gateway settlement** | Match gateway settlement with expected | Accuracy |
| **Amount verification** | Settlement amount = sum of captured payments | Financial integrity |
| **Fee deduction** | Gateway fees deducted correctly | Cost accuracy |
| **Timing** | Settlement timing matches expectations | Cash flow |

### 9.7 Payment Verification

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Status match** | Local status matches gateway status | Consistency |
| **Amount match** | Local amount matches gateway amount | Financial integrity |
| **Method match** | Payment method matches | Accuracy |
| **Timestamp match** | Timing within acceptable window | Consistency |

### 9.8 Financial Synchronization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Real-time sync** | Payment events synced immediately | Timeliness |
| **Event-driven** | Webhooks trigger sync | Automation |
| **Batch sync** | Daily batch for reconciliation | Completeness |
| **Conflict resolution** | Gateway is source of truth | Accuracy |

### 9.9 Reconciliation Reporting

| Report | Content | Frequency |
|--------|---------|-----------|
| **Daily reconciliation** | All payments matched/mismatched | Daily |
| **Settlement report** | Settlement amounts, fees, net | Daily |
| **Discrepancy report** | Unmatched transactions | On detection |
| **Monthly summary** | Total transactions, revenue, fees | Monthly |

---

## 10. Security

### 10.1 What

The complete architecture for payment security — from PCI readiness through encryption to webhook validation to audit logging, ensuring every payment is secure and compliant.

### 10.2 Why

- **PCI compliance:** Payment data must be handled securely.
- **Fraud prevention:** Security prevents financial loss.
- **Trust:** Customers must trust payment security.
- **Liability:** Security breaches cause financial and legal liability.

### 10.3 Where

Every payment operation, API endpoint, database query, webhook, and user interaction involving payment data.

### 10.4 PCI Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **No card data stored** | Card numbers never touch our servers | PCI DSS compliance |
| **Gateway tokenization** | Card data tokenized by gateway | Security |
| **TLS everywhere** | All communication encrypted | Transport security |
| **Access control** | Payment data admin-only | Data protection |
| **Audit logging** | All payment access logged | Compliance |

### 10.5 Secure Communication

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **HTTPS only** | All API calls over HTTPS | Transport security |
| **TLS 1.2+** | Minimum TLS version | Security |
| **Certificate pinning** | Pin gateway certificates | MITM prevention |
| **HSTS** | Force HTTPS via headers | Security |

### 10.6 Encryption

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **In transit** | TLS 1.2+ encryption | Transport security |
| **At rest** | Database encryption | Data protection |
| **Secrets** | Cloudflare Secrets for keys | Key management |
| **No logging secrets** | Never log API keys or secrets | Security |

### 10.7 Tokenization Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Gateway tokenization** | Card data tokenized by gateway | PCI compliance |
| **Token storage** | Store tokens, not card numbers | Security |
| **Token lifecycle** | Tokens can be deleted by customer | Control |
| **Token security** | Tokens encrypted at rest | Protection |

### 10.8 Secret Management

| Secret | Storage | Access |
|--------|---------|--------|
| **Gateway API Key** | Cloudflare Secrets | Payment handlers only |
| **Gateway API Secret** | Cloudflare Secrets | Payment handlers only |
| **Webhook Secret** | Cloudflare Secrets | Webhook handlers only |
| **Database URL** | Cloudflare Secrets | Database client only |

### 10.9 Webhook Validation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Signature verification** | HMAC-SHA256 on every webhook | Authenticity |
| **Timing-safe comparison** | Prevent timing attacks | Security |
| **Replay prevention** | Timestamp + nonce validation | Replay attack prevention |
| **IP validation** | Gateway IP whitelist (if available) | Source verification |
| **Idempotency** | Process each webhook once | Deduplication |

### 10.10 Replay Attack Prevention

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Timestamp check** | Webhooks must be within 5-minute window | Freshness |
| **Nonce tracking** | Track unique webhook IDs | Deduplication |
| **Idempotency keys** | Unique per operation | Prevent replay |
| **Rate limiting** | Limit webhook frequency | Abuse prevention |

### 10.11 Audit Logging

| Event | Data Logged | Rationale |
|-------|-------------|-----------|
| **Payment created** | orderId, amount, method | Financial |
| **Payment captured** | paymentId, amount, method | Financial |
| **Payment failed** | orderId, error, amount | Debugging |
| **Refund initiated** | refundId, amount, reason | Financial |
| **Refund completed** | refundId, amount | Financial |
| **Webhook received** | eventType, gatewayPaymentId | Tracking |
| **Webhook failed** | eventType, error | Debugging |
| **Signature verification** | success, gatewayPaymentId | Security |

---

## 11. Permissions

### 11.1 What

The complete architecture for payment permissions — defining what each user role can view, process, refund, and configure.

### 11.2 Why

- **Security:** Payment data is sensitive — access must be controlled.
- **Separation of duties:** Different roles have different payment responsibilities.
- **Compliance:** Financial regulations require access controls.
- **Trust:** Users must trust that their payment data is secure.

### 11.3 Where

Payment pages, API endpoints, admin dashboard, refund panels.

### 11.4 Customer Payment Permissions

| Permission | Allowed | Rationale |
|------------|---------|-----------|
| **View own payments** | Yes | Self-service |
| **View own payment history** | Yes | Self-service |
| **Initiate payment** | Yes | Purchase |
| **Retry failed payment** | Yes | Recovery |
| **View payment receipts** | Yes | Records |
| **Request refund** | Yes | Customer rights |
| **View refund status** | Yes | Transparency |
| **View other customers' payments** | No | Privacy |
| **Process refunds** | No | Admin only |
| **Configure payment methods** | No | Admin only |
| **View gateway credentials** | No | Security |

### 11.5 Shop Owner Payment Permissions

| Permission | Allowed | Rationale |
|------------|---------|-----------|
| **View own order payments** | Yes | Business visibility |
| **View own payment history** | Yes | Business records |
| **View own settlement payments** | Yes | Financial visibility |
| **View other shops' payments** | No | Privacy |
| **Process refunds** | No | Admin only |
| **Configure payment methods** | No | Admin only |

### 11.6 Admin Payment Permissions

| Permission | Allowed | Rationale |
|------------|---------|-----------|
| **View all payments** | Yes | Platform management |
| **View all payment history** | Yes | Audit |
| **Process refunds** | Yes | Operations |
| **Approve large refunds** | Yes | Governance |
| **Configure payment methods** | Yes | Configuration |
| **Configure gateway settings** | Yes | Configuration |
| **View gateway credentials** | Yes | Operations |
| **Run reconciliation** | Yes | Financial |
| **Export payment data** | Yes | Reporting |
| **Override payment status** | Yes | Emergency |
| **View audit logs** | Yes | Compliance |

### 11.7 Permission Matrix

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| View own payments | ✓ | ✓ | ✓ |
| View all payments | ✗ | ✗ | ✓ |
| Initiate payment | ✓ | ✗ | ✗ |
| Retry payment | ✓ | ✗ | ✗ |
| Process refunds | ✗ | ✗ | ✓ |
| Configure methods | ✗ | ✗ | ✓ |
| View gateway credentials | ✗ | ✗ | ✓ |
| Run reconciliation | ✗ | ✗ | ✓ |
| Export payment data | Own only | Own only | All |
| Override payment status | ✗ | ✗ | ✓ |

---

## 12. Performance

### 12.1 What

The complete architecture for payment performance — fast processing, high transaction volume handling, background verification, queue readiness, and retry optimization.

### 12.2 Why

- **Conversion:** Slow payment processing loses sales.
- **Scalability:** Performance must be maintained as volume grows.
- **Reliability:** Payment system must handle peak loads.
- **User experience:** Payment must feel instant.

### 12.3 Where

Payment creation, verification, webhook processing, reconciliation, reporting.

### 12.4 High Transaction Volume

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Database indexing** | Index all payment query columns | Query performance |
| **Connection pooling** | Hyperdrive for database connections | Connection efficiency |
| **Query optimization** | Optimized queries for payment operations | Performance |
| **Pagination** | Paginated payment history loading | Memory efficiency |
| **Caching** | KV caching for gateway status | Read performance |

### 12.5 Fast Processing

| Operation | Target | Strategy |
|-----------|--------|----------|
| **Create payment** | < 500ms | Gateway API call |
| **Verify payment** | < 1s | Signature verification |
| **Webhook processing** | < 5s | Background processing |
| **Refund processing** | < 2s | Gateway API call |
| **Status check** | < 200ms | Cached status |

### 12.6 Background Verification

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Async verification** | Verify payment in background | Non-blocking |
| **Webhook processing** | Process webhooks asynchronously | Resilience |
| **Reconciliation** | Run reconciliation in background | Non-blocking |
| **Email sending** | Send confirmations async | Speed |

### 12.7 Queue Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Webhook queue** | Queue webhook processing | Resilience |
| **Retry queue** | Queue retry attempts | Reliability |
| **Email queue** | Queue confirmation emails | Speed |
| **Reconciliation queue** | Queue reconciliation jobs | Background processing |

### 12.8 Retry Optimization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Exponential backoff** | 1s, 2s, 4s delays | Prevent gateway flooding |
| **Max retries** | 3 attempts | Prevent infinite loops |
| **Circuit breaker** | Stop retrying after repeated failures | Resource protection |
| **Fallback gateway** | Route to secondary gateway on failure | Resilience |

---

## 13. Accessibility

### 13.1 What

WCAG 2.2 AA compliance standards for every payment component — mobile payments, responsive payment flow, keyboard accessibility, and screen reader support.

### 13.2 Why

- **Inclusion:** Payment tools must be usable by everyone.
- **Compliance:** Accessibility regulations require inclusive design.
- **Mobile-first:** 70%+ of traffic is mobile.
- **Trust:** Accessible payment builds confidence.

### 13.3 Where

Payment selection, payment forms, payment confirmation, refund requests, payment history.

### 13.4 Mobile Payments

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Touch targets** | Minimum 44x44px | Accuracy |
| **Full-width buttons** | Payment CTAs full-width | Easy tapping |
| **Large text** | 16px minimum | Readability |
| **One-hand usage** | Primary actions in thumb zone | Ergonomics |
| **Bottom sheet** | Payment options as bottom sheet | Reachable |

### 13.5 Responsive Payment Flow

| Viewport | Layout | Rationale |
|----------|--------|-----------|
| **Mobile (< 640px)** | Single column, stacked | Simple |
| **Tablet (640-1023px)** | 2-column: form + summary | Balanced |
| **Desktop (1024px+)** | 2-column: form (60%) + summary (40%) | Efficient |

### 13.6 Keyboard Accessibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Tab order** | Logical flow through payment form | Navigation |
| **Focus visible** | Clear focus ring on all elements | Orientation |
| **Enter to submit** | Enter submits payment | Efficiency |
| **Escape to close** | ESC closes payment modal | Recovery |
| **No keyboard trap** | Always able to escape | Accessibility |

### 13.7 Screen Readers

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Semantic HTML** | `<form>`, `<button>`, `<input>` | Meaning |
| **ARIA labels** | Label all interactive elements | Understanding |
| **Error announcements** | `aria-live` for error messages | Feedback |
| **Status announcements** | "Payment successful" announced | Confirmation |
| **Form labels** | Associated with inputs | Understanding |

---

## 14. Future Readiness

### 14.1 What

Architecture standards for future payment features — multiple gateways, international payments, subscription billing, stored payment methods, auto-renewals, marketplace payments, escrow, and AI fraud detection.

### 14.2 Why

- **Scalability:** New features extend without redesign.
- **Competitiveness:** Ready for market demands.
- **Innovation:** Architecture supports experimentation.
- **Investment:** Future-proof development effort.

### 14.3 Where

New payment features, extensions, integrations.

### 14.4 Multiple Gateway Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Primary/secondary** | One active, one standby | Failover |
| **Method routing** | Route by payment method | Optimization |
| **Cost optimization** | Route to cheapest gateway | Cost reduction |
| **Load balancing** | Distribute across gateways | Performance |
| **Gateway health** | Monitor gateway uptime | Reliability |

### 14.5 International Payments

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Multi-currency** | Support USD, EUR, GBP, etc. | International |
| **Currency conversion** | Real-time conversion rates | Accuracy |
| **Local methods** | Support local payment methods | Market reach |
| **Tax handling** | International tax compliance | Legal |
| **Settlement** | Multi-currency settlement | Financial |

### 14.6 Subscription Billing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Recurring payments** | Gateway subscription API | Automation |
| **Plan management** | Create, update, cancel plans | Flexibility |
| **Trial periods** | Free trial support | Conversion |
| **Proration** | Plan change proration | Fairness |
| **Failed renewals** | Retry failed renewals | Revenue |

### 14.7 Stored Payment Methods

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Tokenization** | Gateway tokenization | Security |
| **PCI compliance** | No card data stored | Compliance |
| **Default method** | One default per customer | Speed |
| **Add/remove** | Customer manages methods | Control |
| **Display** | Last 4 digits + brand | Recognition |

### 14.8 Auto-Renewals

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Scheduled charges** | Auto-charge on schedule | Convenience |
| **Reminder emails** | Email before each charge | Transparency |
| **Failed renewal** | Retry + notification | Revenue |
| **Cancellation** | Easy cancellation | Trust |

### 14.9 Marketplace Payments

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Split payments** | Platform + shop split | Business model |
| **Multi-party** | Support multiple recipients | Marketplace |
| **Escrow** | Hold funds until delivery | Protection |
| **Settlement** | Per-shop settlement | Financial |

### 14.10 Escrow Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Hold funds** | Funds held until delivery confirmation | Protection |
| **Release trigger** | Delivery confirmation releases funds | Accuracy |
| **Dispute handling** | Dispute pauses release | Fairness |
| **Timeout** | Auto-release after 30 days | Automation |

### 14.11 AI Fraud Detection

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Pattern detection** | ML-based fraud detection | Proactive |
| **Risk scoring** | Score each transaction | Decision support |
| **Velocity checks** | Limit transaction frequency | Abuse prevention |
| **Behavioral analysis** | User behavior patterns | Detection |
| **Manual review** | Flag for human review | Accuracy |

---

## 15. Mandatory Rules for AI Agents

### 15.1 What

Hard rules that every AI agent must follow when designing, implementing, or reviewing the payment engine.

### 15.2 Why

- **Consistency:** No exceptions to the rules.
- **Security:** Payment security is non-negotiable.
- **Revenue:** Payment failures lose money directly.

### 15.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Gateway independence** | No gateway logic in business modules | Cannot swap gateways |
| **Server-side verification** | Never trust client-side payment status | Security risk |
| **Payment ID** | Every payment gets permanent UUID | Cannot trace payments |
| **Signature verification** | Verify every webhook signature | Accept fraudulent webhooks |
| **Idempotency** | Every payment operation is idempotent | Double charges |
| **Webhook non-2xx** | Return non-2xx on webhook failures | Gateway won't retry |
| **No card data storage** | Card numbers never touch our servers | PCI violation |
| **DECIMAL(10,2)** | Use decimal for all currency | Rounding errors |
| **Audit logging** | Log every payment event | Cannot debug |
| **Timeout handling** | Handle payment timeouts gracefully | Stuck payments |
| **Inventory release** | Release inventory on payment failure | Lost stock |
| **Amount verification** | Verify amount matches order total | Financial loss |
| **Receipt generation** | Generate receipt for every payment | Customer trust |
| **Error recovery** | Every error has clear recovery path | Lost sales |
| **Mobile-first** | Payment flow works on 375px | 70%+ mobile |

### 15.4 Agent Decision Framework

When implementing any payment feature, agent must ask:

1. **Is this gateway-independent?** — Can we swap gateways without changing this?
2. **Is this server-side verified?** — Never trust client-side data.
3. **Is this idempotent?** — Will replaying this produce the same result?
4. **Is this auditable?** — Can we trace every payment event?
5. **Is this secure?** — Are signatures verified, secrets protected?
6. **Is this resilient?** — Does it handle failures gracefully?
7. **Is this performant?** — Will this work at 1M+ transactions?
8. **Is this accessible?** — Can everyone use this payment flow?
9. **Is this mobile-first?** — Does this work on a 375px screen?
10. **Is this transparent?** — Are all costs visible before commitment?

### 15.5 Implementation Checklist

Before shipping any payment feature:

- [ ] Gateway abstraction used (no direct gateway imports in handlers)
- [ ] Server-side verification implemented
- [ ] Idempotency keys on all payment operations
- [ ] Signature verification on all webhooks
- [ ] Non-2xx on webhook failures
- [ ] DECIMAL(10,2) for all currency values
- [ ] Audit logging enabled
- [ ] Error handling with recovery paths
- [ ] Timeout handling implemented
- [ ] Inventory release on failure
- [ ] Amount verification against order total
- [ ] Receipt generation for every payment
- [ ] Mobile-first design verified at 375px
- [ ] Touch targets minimum 44x44px
- [ ] Keyboard navigation works
- [ ] Screen reader announces all content
- [ ] Loading states present
- [ ] Error states with recovery
- [ ] Consistent with existing patterns
- [ ] Performance budget met
- [ ] Security audit passed

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
