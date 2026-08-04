# নবME (Nabome) — Order Management & Order Lifecycle Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for order lifecycle, fulfillment, shipping, cancellation, returns, auditability, and business process architecture  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), API_SERVICE_ARCHITECTURE.md (v1.0), SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), PRODUCT_ENGINE_ARCHITECTURE.md (v1.0), VARIANT_INVENTORY_ENGINE_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Order Foundation](#1-order-foundation)
2. [Order Creation](#2-order-creation)
3. [Order Lifecycle](#3-order-lifecycle)
4. [Order Processing](#4-order-processing)
5. [Fulfillment Architecture](#5-fulfillment-architecture)
6. [Shipping Architecture](#6-shipping-architecture)
7. [Order Modifications](#7-order-modifications)
8. [Return Integration](#8-return-integration)
9. [Notifications Architecture](#9-notifications-architecture)
10. [Permissions Architecture](#10-permissions-architecture)
11. [Audit Architecture](#11-audit-architecture)
12. [Performance Architecture](#12-performance-architecture)
13. [Security Architecture](#13-security-architecture)
14. [Accessibility Architecture](#14-accessibility-architecture)
15. [Future Readiness Architecture](#15-future-readiness-architecture)
16. [Mandatory Rules for AI Agents](#16-mandatory-rules-for-ai-agents)

---

## 1. Order Foundation

### 1.1 What

The foundational philosophy, ownership model, lifecycle, states, visibility rules, relationships, integrity guarantees, and auditability standards that govern every order on the Nabome platform.

### 1.2 Why

- **Revenue integrity:** Orders represent confirmed revenue — every order must be accurate, traceable, and immutable.
- **Operational clarity:** Every stakeholder (Customer, Shop Owner, Admin) must understand order state at all times.
- **Compliance:** Financial records, tax filings, and audit trails depend on accurate order data.
- **Trust:** Customers must have confidence that their order is being processed correctly.
- **Scalability:** Order architecture must handle 0 to 1M+ orders without redesign.

### 1.3 Where

Every order listing, order detail page, order confirmation, shipping notification, return request, refund, and admin dashboard across the Nabome platform.

### 1.4 Order Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Order is immutable record** | Once created, order core data never changes | Financial integrity |
| **Status is the only mutable field** | Only order status and metadata change | Clean lifecycle |
| **One order = one customer** | Every order belongs to exactly one profile | Ownership clarity |
| **One order = one shipping address** | Single address per order (split shipment future) | Simplicity |
| **Every transition is auditable** | Status changes logged with actor + timestamp | Compliance |
| **Inventory is reserved on creation** | Stock decremented when order confirmed | Prevent overselling |
| **Payment precedes fulfillment** | No fulfillment without payment confirmation | Revenue protection |
| **History is append-only** | Order history records are never deleted or modified | Audit trail |
| **Soft operations only** | No hard deletes — orders are archived, never removed | Data integrity |

### 1.5 Order Ownership

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Primary owner** | Exactly one `profileId` per order | Clear ownership |
| **Guest ownership** | Guest orders linked via `guestToken` + `guestEmail` | Guest checkout support |
| **Shop visibility** | Shop owners see only their product orders | Multi-tenant isolation |
| **Admin visibility** | Admins see all orders across all shops | Platform oversight |
| **Data isolation** | RLS ensures shop owners cannot see each other's orders | Security |

### 1.6 Order Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Price snapshot** | Order stores price at time of purchase | Price changes don't affect history |
| **Product snapshot** | Order stores product name, variant details at purchase | Product changes don't affect history |
| **Tax snapshot** | Tax rate and amount stored per order | Tax changes don't affect history |
| **Shipping snapshot** | Shipping method and cost stored per order | Shipping changes don't affect history |
| **Coupon snapshot** | Coupon code and discount stored per order | Coupon changes don't affect history |
| **Total consistency** | Order total = sum of line items + shipping - discounts | Mathematical integrity |

### 1.7 Order Relationships

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Profile   │       │    Order     │       │   OrderItem  │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │◀──┐   │ id (PK)      │◀──┐   │ id (PK)      │
│              │   └───│ profileId    │   └───│ orderId      │
└──────────────┘       │              │       │ variantId ───│──▶ ProductVariant
                       │ addressId ───│──▶    │ productName  │
                       │              │       │ variantSku   │
                       │ couponId ────│──▶    │ quantity     │
                       └──────┬───────┘       │ unitPrice    │
                              │               │ totalPrice   │
                              ▼               └──────────────┘
                       ┌──────────────┐
                       │OrderStatus   │
                       │  History     │
                       │──────────────│
                       │ id (PK)      │
                       │ orderId ─────│──▶ Order
                       │ fromStatus   │
                       │ toStatus     │
                       │ actorId ─────│──▶ Profile
                       │ reason       │
                       │ createdAt    │
                       └──────────────┘
```

### 1.8 Order States

| State | Description | Visible To | Next Possible States |
|-------|-------------|------------|---------------------|
| **pending** | Order created, payment pending | Customer, Admin | confirmed, failed, cancelled |
| **confirmed** | Payment received, awaiting processing | Customer, Shop Owner, Admin | processing, cancelled |
| **processing** | Shop owner reviewing/accepting order | Customer, Shop Owner, Admin | accepted, rejected |
| **accepted** | Shop owner accepted order | Customer, Shop Owner, Admin | packing, cancelled |
| **rejected** | Shop owner rejected order | Customer, Shop Owner, Admin | (terminal — refund initiated) |
| **packing** | Order being packed | Customer, Shop Owner, Admin | ready_to_ship |
| **ready_to_ship** | Packed, awaiting courier pickup | Customer, Shop Owner, Admin | shipped |
| **shipped** | Handed to courier | Customer, Shop Owner, Admin | in_transit, delivered |
| **in_transit** | In transit to customer | Customer, Shop Owner, Admin | delivered, failed_delivery |
| **delivered** | Successfully delivered | Customer, Shop Owner, Admin | completed, returned |
| **completed** | Customer confirmed receipt | Customer, Shop Owner, Admin | (terminal — archived after 30 days) |
| **cancelled** | Order cancelled before shipment | Customer, Shop Owner, Admin | (terminal — refund if paid) |
| **failed** | Payment failed or order creation failed | Customer, Admin | (terminal) |
| **returned** | Order returned by customer | Customer, Shop Owner, Admin | refunded |
| **refunded** | Refund processed | Customer, Shop Owner, Admin | (terminal) |
| **archived** | Order old, moved to archive | Admin only | (terminal) |

### 1.9 Order History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Status history** | Every status transition logged | Complete audit trail |
| **Action history** | Every create, update, cancel, return logged | Action traceability |
| **Actor history** | Every action tagged with actor (customer/shop/admin/system) | Accountability |
| **Timestamp history** | Every action timestamped with UTC | Temporal accuracy |
| **Reason history** | Every rejection, cancellation, return includes reason | Context |
| **Immutable** | History records are append-only, never modified | Audit integrity |
| **Retention** | Order history retained for 7 years | Legal compliance |

### 1.10 Order Visibility

| Stakeholder | Can See | Cannot See |
|-------------|---------|------------|
| **Customer** | Own orders only | Other customers' orders |
| **Shop Owner** | Orders containing their products | Other shops' orders, customer personal data |
| **Admin** | All orders | — |
| **Guest** | Own order via order number + email | Any other order |

---

## 2. Order Creation

### 2.1 What

The complete architecture for order creation — from cart conversion through validation, inventory reservation, payment, confirmation, duplicate prevention, order numbering, and timestamping.

### 2.2 Why

- **Revenue:** Order creation is the moment browsing becomes revenue.
- **Accuracy:** Every order must be correct before confirmation.
- **Integrity:** Duplicate orders lose money and destroy trust.
- **Performance:** Order creation must be fast and reliable.

### 2.3 Where

Checkout flow (post-payment), API handlers (`api/_handlers/checkout/`), order confirmation page, webhook handlers (`api/_handlers/webhooks/`).

### 2.4 Order Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER CREATION FLOW                            │
│                                                                  │
│  1. CART VALIDATION                                               │
│     → Validate all items in stock                                │
│     → Validate prices match current                              │
│     → Validate shipping address                                  │
│     → Validate coupon (if applied)                               │
│     → Calculate totals                                           │
│                                                                  │
│  2. INVENTORY RESERVATION                                         │
│     → Atomically reserve stock for each variant                  │
│     → Use database transaction for atomicity                     │
│     → If any item insufficient: rollback, return error           │
│     → Reservation timeout: 15 minutes                            │
│                                                                  │
│  3. PAYMENT CREATION                                              │
│     → Create Razorpay order with total amount                    │
│     → Return razorpayOrderId to client                           │
│     → Order status: pending                                      │
│                                                                  │
│  4. PAYMENT VERIFICATION                                          │
│     → Client submits Razorpay payment details                    │
│     → Server verifies Razorpay signature                         │
│     → Server verifies amount matches                             │
│                                                                  │
│  5. ORDER CONFIRMATION                                            │
│     → Create Order record                                        │
│     → Create OrderItem records (snapshot all data)               │
│     → Create OrderStatusHistory record (pending → confirmed)     │
│     → Decrement stock (convert reservation to deduction)         │
│     → Clear cart                                                 │
│     → Send confirmation email                                    │
│     → Send confirmation notification                             │
│                                                                  │
│  6. WEBHOOK FALLBACK                                              │
│     → Razorpay webhook confirms payment                          │
│     → Idempotent: won't create duplicate order                   │
│     → Handles case where client callback fails                   │
│                                                                  │
│  7. REDIRECT                                                     │
│     → Customer redirected to /order-confirmed/:orderId           │
│     → Show order number + details + next steps                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Cart Conversion

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Successful payment verification | Revenue confirmed |
| **Cart snapshot** | Capture all cart data before conversion | Immutable record |
| **Cart clearing** | Clear cart after successful order | Cleanup |
| **Guest cart** | Guest cart cleared after order | Session cleanup |
| **Customer cart** | Customer cart cleared after order | Ready for next purchase |
| **Error handling** | If cart clearing fails, order still created | Order is source of truth |

### 2.6 Inventory Reservation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Timing** | Reserve on payment success, not cart creation | Prevent false reservations |
| **Atomicity** | Database transaction for all reservations | All-or-nothing |
| **Timeout** | 15-minute reservation timeout | Release abandoned reservations |
| **Decrement** | Convert reservation to actual deduction on order confirm | Accurate stock |
| **Rollback** | Release reservation on payment failure | Don't lose stock |
| **Concurrency** | Use `SELECT ... FOR UPDATE` or optimistic locking | Prevent race conditions |
| **Audit** | Log every stock movement (reserve, release, deduct) | Inventory audit trail |

### 2.7 Order Validation

| Validation | Timing | Response |
|-----------|--------|----------|
| **Cart not empty** | Pre-creation | "Cart is empty" |
| **Stock available** | Pre-creation | "X is no longer available" |
| **Price valid** | Pre-creation | "Price updated to ₹X" |
| **Address valid** | Pre-creation | "Please enter a valid address" |
| **Pincode serviceable** | Pre-creation | "We don't deliver to this pincode" |
| **Shipping selected** | Pre-creation | "Please select a shipping method" |
| **Coupon valid** | Pre-creation | "Coupon expired" or "Minimum not met" |
| **Payment amount match** | Post-payment | "Payment amount mismatch" |
| **Payment signature valid** | Post-payment | "Invalid payment signature" |
| **Duplicate prevention** | Post-payment | "Order already processed" |

### 2.8 Duplicate Prevention

| Check | Standard | Rationale |
|-------|----------|-----------|
| **Idempotency key** | Unique per checkout attempt | Prevent double-submit |
| **Payment dedup** | `razorpayPaymentId` unique constraint | Prevent double-charge |
| **Time window** | 5-minute cooldown between orders from same user | Prevent rapid duplicates |
| **Cart dedup** | Don't process same cart twice | Integrity |
| **Webhook idempotency** | Process webhook only once | Prevent duplicates |
| **Order number uniqueness** | Sequential with collision check | Guaranteed unique |

### 2.9 Order Numbering

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Format** | `NAB-YYYYMMDD-XXXXXX` (e.g., `NAB-20260803-000123`) | Human-readable, sortable |
| **Date component** | Order date in YYYYMMDD | Easy filtering by date |
| **Sequential component** | 6-digit zero-padded sequential | Unique per day |
| **Generation** | Generated on order confirmation, not creation | Only confirmed orders get numbers |
| **Display** | Prominent on confirmation, copyable | Customer convenience |
| **Search** | Customers can search by order number | Self-service |
| **Collision handling** | Database unique constraint + retry on collision | Guaranteed uniqueness |

### 2.10 Order Timestamps

| Timestamp | When Set | Purpose |
|-----------|----------|---------|
| **createdAt** | Order record created | Order creation time |
| **updatedAt** | Any order update | Last modification time |
| **confirmedAt** | Payment verified | When order was confirmed |
| **processingAt** | Shop owner starts processing | When fulfillment began |
| **shippedAt** | Handed to courier | When shipped |
| **deliveredAt** | Delivery confirmed | When delivered |
| **completedAt** | Customer confirms receipt | When order completed |
| **cancelledAt** | Order cancelled | When cancelled |
| **refundedAt** | Refund processed | When refund completed |

---

## 3. Order Lifecycle

### 3.1 What

The complete, controlled workflow that every order must follow — from creation through fulfillment to completion, with clearly defined states, transitions, and rules.

### 3.2 Why

- **Operational clarity:** Everyone knows exactly what stage an order is in.
- **Automation:** Status transitions trigger automated actions (emails, inventory, accounting).
- **Accountability:** Every transition has an actor, timestamp, and reason.
- **Prevention:** Invalid transitions are blocked at the system level.
- **Customer trust:** Customers see real-time progress of their order.

### 3.3 Where

Every order detail page, order listing, admin dashboard, shipping notification, and API response.

### 3.4 Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER LIFECYCLE                                │
│                                                                  │
│  CUSTOMER                                                        │
│    │                                                             │
│    ▼                                                             │
│  ┌──────────┐                                                    │
│  │ PENDING  │ ◀── Order created, payment processing              │
│  └────┬─────┘                                                    │
│       │                                                          │
│       ├──▶ [FAILED] ◀── Payment failed                          │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │CONFIRMED  │ ◀── Payment verified, order confirmed             │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │PROCESSING │ ◀── Shop owner reviewing                         │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ├──▶ [REJECTED] ◀── Shop owner rejected                   │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐                                                    │
│  │ ACCEPTED │ ◀── Shop owner accepted order                     │
│  └────┬─────┘                                                    │
│       │                                                          │
│       ├──▶ [CANCELLED] ◀── Cancelled before packing             │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────┐                                                     │
│  │ PACKING │ ◀── Order being packed                              │
│  └────┬────┘                                                     │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────────┐                                                │
│  │READY_TO_SHIP │ ◀── Packed, awaiting courier                  │
│  └────┬─────────┘                                                │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────┐                                                     │
│  │ SHIPPED │ ◀── Handed to courier                               │
│  └────┬────┘                                                     │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │IN_TRANSIT │ ◀── In transit to customer                        │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ├──▶ [FAILED_DELIVERY] ◀── Delivery attempt failed        │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │ DELIVERED │ ◀── Successfully delivered                        │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ├──▶ [RETURNED] ◀── Customer requested return              │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐                                                    │
│  │COMPLETED │ ◀── Customer confirmed receipt                     │
│  └──────────┘                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐                                                    │
│  │ ARCHIVED │ ◀── Moved to archive after 30 days                │
│  └──────────┘                                                    │
│                                                                  │
│  ALTERNATE PATHS:                                                │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                 │
│  │CANCELLED │ ──▶ │ REFUNDED │ ──▶ │ ARCHIVED │                 │
│  └──────────┘     └──────────┘     └──────────┘                 │
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                 │
│  │ RETURNED │ ──▶ │ REFUNDED │ ──▶ │ ARCHIVED │                 │
│  └──────────┘     └──────────┘     └──────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Transition Rules

| From State | Allowed To States | Actor Required | Reason Required |
|------------|-------------------|----------------|-----------------|
| **pending** | confirmed, failed, cancelled | System/Customer | Yes (for failed/cancelled) |
| **confirmed** | processing, cancelled | Shop Owner/Admin | Yes |
| **processing** | accepted, rejected | Shop Owner | Yes (for rejected) |
| **accepted** | packing, cancelled | Shop Owner/Admin | Yes (for cancelled) |
| **rejected** | (terminal — refund) | System | Auto |
| **packing** | ready_to_ship | Shop Owner | No |
| **ready_to_ship** | shipped | Shop Owner | No |
| **shipped** | in_transit, delivered | Shop Owner/System | No |
| **in_transit** | delivered, failed_delivery | Courier/System | No |
| **delivered** | completed, returned | Customer/System | Yes (for returned) |
| **completed** | (terminal — archived) | System | Auto |
| **cancelled** | (terminal — refund) | System | Auto |
| **failed** | (terminal) | System | Auto |
| **returned** | refunded | System/Admin | Auto |
| **refunded** | (terminal — archived) | System | Auto |

### 3.6 Invalid Transition Handling

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Invalid transition attempted** | Return error: "Invalid status transition" | Prevent illegal state changes |
| **Concurrent updates** | Optimistic locking — last write wins with validation | Prevent race conditions |
| **Stale state** | Re-fetch order before transition | Ensure current state |
| **Actor mismatch** | Reject transition if actor not authorized | Security |

### 3.7 Lifecycle Automation

| Transition | Automated Action | Rationale |
|------------|------------------|-----------|
| **pending → confirmed** | Send confirmation email, notify shop owner | Communication |
| **confirmed → processing** | Notify customer "order is being processed" | Transparency |
| **processing → accepted** | Notify customer "order accepted" | Transparency |
| **processing → rejected** | Notify customer, initiate refund | Communication |
| **accepted → packing** | Notify customer "packing your order" | Transparency |
| **packing → ready_to_ship** | Notify customer "ready for pickup" | Transparency |
| **ready_to_ship → shipped** | Send shipping notification + tracking | Communication |
| **shipped → in_transit** | Update tracking, notify customer | Transparency |
| **in_transit → delivered** | Send delivery confirmation, request review | Engagement |
| **delivered → completed** | Auto-complete after 30 days if no return | Automation |
| **cancelled/refunded** | Process refund via Razorpay | Financial |

### 3.8 Order Lifecycle Timing

| Metric | Standard | Rationale |
|--------|----------|-----------|
| **Payment to confirmation** | < 30 seconds | Customer confidence |
| **Confirmation to processing** | < 24 hours | Customer expectation |
| **Processing to acceptance** | < 24 hours | Customer expectation |
| **Acceptance to packing** | < 48 hours | Customer expectation |
| **Packing to shipping** | < 24 hours | Customer expectation |
| **Shipping to delivery** | 5-7 days (standard), 2-3 days (express) | Shipping method |
| **Delivery to completion** | 30 days (auto) | Return window |
| **Cancellation window** | Before packing only | Operational constraint |

---

## 4. Order Processing

### 4.1 What

The complete architecture for order acceptance, rejection, manual review, status updates, order notes, internal comments, and customer/shop communication.

### 4.2 Why

- **Operational efficiency:** Shop owners must process orders quickly and accurately.
- **Communication:** Customers must be informed of every relevant status change.
- **Transparency:** Order notes provide context for decisions.
- **Accountability:** Every action is attributed to an actor.

### 4.3 Where

Shop owner dashboard, admin panel, order detail pages, API handlers (`api/_handlers/orders/`), email notifications.

### 4.4 Acceptance Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Shop owner clicks "Accept Order" | Clear action |
| **Validation** | Order must be in `processing` state | State guard |
| **Actor** | Shop Owner or Admin | Authorization |
| **Effect** | Status → `accepted`, notify customer | Progress |
| **Notes** | Optional acceptance note | Context |
| **Time limit** | Must accept/reject within 48 hours | SLA |

### 4.5 Rejection Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Shop owner clicks "Reject Order" | Clear action |
| **Validation** | Order must be in `processing` state | State guard |
| **Actor** | Shop Owner or Admin | Authorization |
| **Reason required** | Must provide rejection reason | Customer communication |
| **Effect** | Status → `rejected`, initiate refund | Financial |
| **Notification** | Email customer with rejection reason + refund ETA | Transparency |
| **Refund** | Auto-initiate refund via Razorpay | Financial |

**Rejection Reasons:**

| Reason | Description | Refund Timing |
|--------|-------------|---------------|
| **out_of_stock** | Item no longer available | Immediate |
| **pricing_error** | Price listed incorrectly | Immediate |
| **fraud_suspected** | Suspicious order | After review |
| **address_issue** | Cannot deliver to address | Immediate |
| **other** | Other reason (must specify) | Immediate |

### 4.6 Manual Review Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Order flagged for review (fraud, high value, new customer) | Risk management |
| **Actor** | Admin only | Elevated permission |
| **Actions** | Approve, reject, hold, escalate | Flexibility |
| **Hold** | Pause order processing indefinitely | Investigation |
| **Resume** | Admin can resume held orders | Control |
| **Audit** | All manual review actions logged | Compliance |

### 4.7 Status Update Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Single status** | One status update per request | Atomicity |
| **Validation** | Server validates transition is allowed | State machine |
| **Actor** | Must be authenticated and authorized | Security |
| **Reason** | Optional reason for status change | Context |
| **Notification** | Customer notified of relevant changes | Communication |
| **History** | Status change logged in OrderStatusHistory | Audit |

### 4.8 Order Notes Architecture

| Note Type | Visibility | Purpose |
|-----------|------------|---------|
| **Customer note** | Customer + Shop Owner + Admin | Customer-provided instructions |
| **Shop note** | Shop Owner + Admin | Internal shop notes |
| **Admin note** | Admin only | Internal admin notes |
| **System note** | System only (audit log) | Automated notes |

**Order Note Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Append-only** | Notes cannot be deleted or modified | Audit trail |
| **Timestamped** | Every note has timestamp | Temporal context |
| **Actor-tagged** | Every note tagged with author | Accountability |
| **Max length** | 500 characters per note | Practical limit |
| **Mobile-friendly** | Notes readable and editable on mobile | 70%+ mobile |

### 4.9 Internal Comments Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Visibility** | Shop Owner ↔ Admin only | Internal communication |
| **Purpose** | Discuss order issues without customer visibility | Internal ops |
| **Threading** | Comments can be replied to | Context |
| **Notification** | Shop Owner/Admin notified of new comments | Timeliness |
| **Resolution** | Comments can be marked as resolved | Workflow |

### 4.10 Customer Communication Architecture

| Event | Channel | Timing | Content |
|-------|---------|--------|---------|
| **Order placed** | Email + Push | Immediate | Confirmation + order details |
| **Order accepted** | Email + Push | Immediate | "Your order is being processed" |
| **Order rejected** | Email + Push | Immediate | Reason + refund ETA |
| **Order packed** | Email + Push | Immediate | "Your order is packed" |
| **Order shipped** | Email + Push | Immediate | Tracking number + link |
| **Out for delivery** | Email + Push | Same day | "Out for delivery today" |
| **Delivered** | Email + Push | Immediate | "Delivered" + review request |
| **Returned** | Email + Push | Immediate | Return confirmation + refund ETA |
| **Refunded** | Email + Push | Immediate | Refund amount + method |

### 4.11 Shop Communication Architecture

| Event | Channel | Timing | Content |
|-------|---------|--------|---------|
| **New order** | Email + Dashboard | Immediate | Order details + action required |
| **Order shipped** | Dashboard | Immediate | Tracking updated |
| **Return request** | Email + Dashboard | Immediate | Return details + action required |
| **Refund processed** | Dashboard | Immediate | Refund confirmation |

---

## 5. Fulfillment Architecture

### 5.1 What

Standards for packing, packaging readiness, shipment preparation, courier handoff, manual shipping, and API shipping readiness.

### 5.2 Why

- **Customer satisfaction:** Fast, accurate fulfillment drives repeat purchases.
- **Operational efficiency:** Streamlined packing reduces costs.
- **Accuracy:** Wrong items or damaged packaging lose customers.
- **Scalability:** Fulfillment must handle 0 to 1000+ orders per day.

### 5.3 Where

Shop owner dashboard, packing station, warehouse operations, API handlers (`api/_handlers/orders/`).

### 5.4 Packing Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Shop owner clicks "Start Packing" | Clear action |
| **Validation** | Order must be in `accepted` state | State guard |
| **Checklist** | System provides packing checklist | Accuracy |
| **Items verification** | Scan/verify each item before packing | Prevent wrong items |
| **Packaging selection** | Suggest packaging based on items | Efficiency |
| **Weight calculation** | Auto-calculate total weight | Shipping accuracy |
| **Completion** | Mark as packed → status: `ready_to_ship` | Progress |

### 5.5 Packaging Readiness Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Packaging types** | Standard box, Express envelope, Gift wrap | Customer choice |
| **Brand packaging** | Nabome branded packaging for all orders | Brand experience |
| **Protection** | Adequate protection for product type | Damage prevention |
| **Sustainability** | Eco-friendly packaging options | Brand values |
| **Gift packaging** | Special packaging for gift orders | Premium service |

### 5.6 Shipment Preparation Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Packing slip** | Auto-generated with order details | Accuracy |
| **Invoice** | Tax invoice included | Legal requirement |
| **Return label** | Pre-printed return label included | Customer convenience |
| **Tracking info** | Tracking number on package | Customer tracking |
| **Branded insert** | Thank you card + brand materials | Brand experience |

### 5.7 Courier Handoff Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Handoff scan** | Scan package at handoff | Proof of handoff |
| **Weight verification** | Verify weight matches system | Accuracy |
| **Count verification** | Verify package count matches order | Accuracy |
| **Signature** | Courier signs for pickup | Accountability |
| **Status update** | Auto-update status to `shipped` | Automation |

### 5.8 Manual Shipping Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Manual entry** | Shop owner can manually enter tracking number | Flexibility |
| **Courier selection** | Select courier from supported list | Choice |
| **Tracking URL** | Auto-generate tracking URL | Customer convenience |
| **Status sync** | Manual status updates sync to customer | Transparency |

### 5.9 API Shipping Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Webhook support** | Courier webhooks update order status | Automation |
| **API integration** | Shiprocket/Delhivery API ready | Scalability |
| **Rate comparison** | Compare shipping rates across couriers | Cost optimization |
| **Label generation** | Auto-generate shipping labels | Efficiency |
| **Tracking aggregation** | Single tracking page for all couriers | Customer experience |

---

## 6. Shipping Architecture

### 6.1 What

Standards for shipping methods, tracking numbers, tracking history, shipping events, delivery confirmation, failed delivery, and re-delivery readiness.

### 6.2 Why

- **Customer experience:** Shipping is the most visible part of fulfillment.
- **Trust:** Real-time tracking builds customer confidence.
- **Operational efficiency:** Automated tracking reduces support queries.
- **Revenue:** Fast, reliable shipping drives repeat purchases.

### 6.3 Where

Order detail page, tracking page, shipping notifications, admin dashboard, API handlers (`api/_handlers/orders/`).

### 6.4 Shipping Methods

| Method | Cost | Delivery Time | Use Case |
|--------|------|---------------|----------|
| **Standard** | Free over ₹999, else ₹99 | 5-7 business days | Default |
| **Express** | ₹199 | 2-3 business days | Urgent |
| **Same Day** | ₹299 | Same day (metro only) | Premium (future) |

### 6.5 Shipping Method Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Address-dependent** | Methods available based on delivery address | Logistics |
| **Weight-dependent** | Methods available based on order weight | Courier limits |
| **Cost calculation** | Server calculates, not client | Accuracy |
| **Free shipping** | Applied automatically when threshold met | Incentive |
| **Minimum order** | No minimum for express, ₹999 for free standard | Business rule |

### 6.6 Tracking Number Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Generation** | Generated on shipment handoff | Accuracy |
| **Format** | Courier-specific format | Compatibility |
| **Storage** | Stored on Order record | Source of truth |
| **Display** | Prominent on order detail page | Customer visibility |
| **Copyable** | One-tap copy on mobile | Convenience |
| **Link** | Direct link to courier tracking page | One-click tracking |

### 6.7 Tracking History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Source** | Courier API or webhook | Real-time |
| **Events** | All tracking events stored | Complete history |
| **Display** | Timeline view on order detail page | Visual clarity |
| **Sorting** | Most recent first | Relevance |
| **Refresh** | Auto-refresh every 30 minutes | Fresh data |
| **Manual refresh** | Customer can tap to refresh | Control |

### 6.8 Shipping Events

| Event | Description | Customer Notification |
|-------|-------------|----------------------|
| **picked_up** | Package picked up by courier | Yes |
| **in_transit** | Package in transit | Yes |
| **out_for_delivery** | Out for delivery today | Yes |
| **delivered** | Successfully delivered | Yes |
| **delivery_failed** | Delivery attempt failed | Yes |
| **returned_to_sender** | Package returned | Yes |
| **exception** | Shipping exception (weather, etc.) | Yes |

### 6.9 Delivery Confirmation Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Auto-confirm** | Courier webhook confirms delivery | Automation |
| **Photo proof** | Courier captures delivery photo | Proof of delivery |
| **Signature** | Digital signature where required | Accountability |
| **Time window** | Delivery within estimated window | Customer expectation |
| **Notification** | Immediate email + push on delivery | Communication |
| **Review request** | Request review 24 hours after delivery | Engagement |

### 6.10 Failed Delivery Architecture

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Customer not available** | Re-attempt next business day | Customer convenience |
| **Wrong address** | Contact customer, hold for correction | Accuracy |
| **Refused** | Return to sender, initiate refund | Business rule |
| **Damaged** | Return to sender, initiate refund + replacement | Customer protection |
| **Max attempts** | 3 attempts before return | Operational limit |

### 6.11 Re-delivery Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Re-attempt scheduling** | Auto-schedule next attempt | Automation |
| **Customer notification** | Notify of re-attempt schedule | Transparency |
| **Address correction** | Allow customer to update address | Flexibility |
| **Time selection** | Allow customer to select delivery time | Convenience (future) |
| **Partial delivery** | Support delivering available items | Flexibility (future) |

---

## 7. Order Modifications

### 7.1 What

Architecture for cancellation, partial cancellation, address correction, order hold, resume processing, manual override, and admin intervention.

### 7.2 Why

- **Flexibility:** Customers and shop owners need to handle real-world situations.
- **Control:** Admins need override capability for edge cases.
- **Accuracy:** Modifications must be validated and audited.
- **Revenue protection:** Modifications must not compromise financial integrity.

### 7.3 Where

Customer account, shop owner dashboard, admin panel, API handlers (`api/_handlers/orders/`).

### 7.4 Cancellation Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Customer cancellation** | Allowed before `packing` state | Operational constraint |
| **Shop cancellation** | Allowed at any pre-shipment state | Operational flexibility |
| **Admin cancellation** | Allowed at any state | Override capability |
| **Reason required** | Must provide cancellation reason | Audit + communication |
| **Refund trigger** | Cancellation auto-triggers refund if paid | Financial |
| **Stock release** | Cancelled items released back to inventory | Inventory accuracy |
| **Notification** | All parties notified | Communication |

**Cancellation Reasons:**

| Actor | Reasons |
|-------|---------|
| **Customer** | Changed mind, found better price, ordered by mistake, address issue |
| **Shop Owner** | Out of stock, pricing error, fraud suspected, cannot deliver |
| **Admin** | Policy violation, fraud confirmed, customer request, system error |

### 7.5 Partial Cancellation Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Item-level cancel** | Cancel individual items from order | Flexibility |
| **Stock release** | Only cancelled items released | Accuracy |
| **Refund calculation** | Refund = cancelled items total | Financial accuracy |
| **Shipping adjustment** | Recalculate shipping if items removed | Accuracy |
| **Minimum order** | Order must remain above minimum after cancel | Business rule |
| **UI readiness** | Architecture supports partial cancel, implement later | Future-proofing |

### 7.6 Address Correction Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Timing** | Allowed before `shipped` state | Logistics constraint |
| **Validation** | New address must be valid and serviceable | Accuracy |
| **Shipping recalculation** | Recalculate shipping if address changes | Accuracy |
| **Customer request** | Customer can request via order detail page | Self-service |
| **Shop correction** | Shop can correct minor issues (phone, pincode) | Flexibility |
| **Admin override** | Admin can change any address | Override |

### 7.7 Order Hold Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin places order on hold | Investigation |
| **Reason** | Must provide hold reason | Audit |
| **Effect** | Order processing paused | Operational |
| **Duration** | No time limit (admin decides) | Flexibility |
| **Notification** | Customer notified of hold | Transparency |
| **Resume** | Admin can resume processing | Control |

### 7.8 Resume Processing Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin resumes held order | Resolution |
| **Validation** | Order must be in held state | State guard |
| **Effect** | Order resumes from hold state | Continuity |
| **Notification** | Customer notified of resume | Transparency |
| **Audit** | Hold duration logged | Accountability |

### 7.9 Manual Override Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Actor** | Admin only | Elevated permission |
| **Scope** | Any order state change | Full control |
| **Reason required** | Must provide override reason | Audit |
| **Notification** | All parties notified | Transparency |
| **Audit** | Override logged with full context | Compliance |

### 7.10 Admin Intervention Architecture

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Stuck order** | Admin can force status transition | Operational |
| **Dispute** | Admin mediates customer/shop dispute | Customer service |
| **Refund dispute** | Admin decides on refund eligibility | Financial |
| **Policy enforcement** | Admin enforces platform policies | Governance |
| **Emergency** | Admin can freeze/unfreeze orders | Crisis management |

---

## 8. Return Integration

### 8.1 What

Standards for return requests, replacements, exchanges, refund linkage, return history, and return eligibility.

### 8.2 Why

- **Customer trust:** Easy returns build purchase confidence.
- **Revenue:** Good return experience drives repeat purchases.
- **Compliance:** Indian consumer protection laws require clear return policies.
- **Operations:** Efficient returns reduce costs.

### 8.3 Where

Customer account, order detail page, shop owner dashboard, admin panel, API handlers (`api/_handlers/orders/`).

### 8.4 Return Eligibility Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Return window** | 7 days from delivery | Industry standard |
| **Condition** | Item must be unused, with tags | Resalability |
| **Exceptions** | Undergarments, sale items (final sale) | Hygiene/business |
| **Proof required** | Photo of item condition | Verification |
| **One-time** | Each item can be returned once | Prevention |

### 8.5 Return Request Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer clicks "Return" on delivered order | Self-service |
| **Eligibility check** | System validates return window + condition | Accuracy |
| **Reason required** | Must select return reason | Data + communication |
| **Photo upload** | Customer uploads photos of item | Verification |
| **Approval** | Shop owner reviews and approves/reviews | Quality control |
| **Time limit** | Shop must respond within 48 hours | SLA |
| **Status** | Order status → `returned` on approval | Lifecycle |

**Return Reasons:**

| Reason | Description | Refund Type |
|--------|-------------|-------------|
| **wrong_size** | Size doesn't fit | Full refund or exchange |
| **wrong_item** | Received wrong item | Full refund + return pickup |
| **defective** | Item is defective/damaged | Full refund + return pickup |
| **not_as_described** | Item differs from listing | Full refund + return pickup |
| **changed_mind** | Customer changed mind | Full refund (shipping deducted) |
| **quality_issue** | Quality not as expected | Full refund or exchange |

### 8.6 Replacement Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer requests replacement instead of refund | Flexibility |
| **Eligibility** | Same return eligibility rules | Consistency |
| **Stock check** | Replacement item must be in stock | Accuracy |
| **Price diff** | If price differs, charge/refund difference | Financial accuracy |
| **Shipping** | Free replacement shipping | Customer protection |
| **Tracking** | Separate tracking for replacement | Visibility |

### 8.7 Exchange Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer requests exchange (different variant) | Flexibility |
| **Eligibility** | Same return eligibility rules | Consistency |
| **Variant check** | New variant must be in stock | Accuracy |
| **Price diff** | Charge/refund difference | Financial accuracy |
| **Shipping** | Free exchange shipping | Customer protection |
| **Process** | Return original → Ship new | Two-step |

### 8.8 Refund Linkage Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Return approved or cancellation with payment | Financial |
| **Method** | Refund to original payment method | Customer preference |
| **Razorpay** | Use Razorpay refund API | Integration |
| **Timeline** | 5-7 business days for refund processing | Bank processing |
| **Partial** | Support partial refunds (item-level) | Flexibility |
| **Notification** | Email with refund details + ETA | Transparency |
| **Status** | Order status → `refunded` on completion | Lifecycle |

### 8.9 Return History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Logged** | Every return request logged | Audit trail |
| **Timeline** | Return request → Approval → Pickup → Refund | Workflow |
| **Actor** | Every action attributed | Accountability |
| **Photos** | Return photos stored | Evidence |
| **Communication** | All return communication logged | Context |

### 8.10 Return Pickup Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Free pickup** | Platform arranges free return pickup | Customer protection |
| **Scheduling** | Customer selects pickup time slot | Convenience |
| **Packaging** | Customer packages item for return | Responsibility |
| **Verification** | Courier verifies item condition at pickup | Quality |
| **Tracking** | Return shipment tracked | Visibility |

---

## 9. Notifications Architecture

### 9.1 What

Standards for all order-related notifications — events, channels, timing, content, and templates.

### 9.2 Why

- **Customer experience:** Timely notifications build trust.
- **Operational efficiency:** Automated notifications reduce support queries.
- **Engagement:** Notifications drive customer actions (reviews, returns).
- **Compliance:** Certain notifications (refund, cancellation) are legally required.

### 9.3 Where

Email (Resend), push notifications, in-app notifications, SMS (future), WhatsApp (future).

### 9.4 Notification Events

| Event | Customer | Shop Owner | Admin | Channel |
|-------|----------|------------|-------|---------|
| **order_created** | ✓ | ✓ | ✓ | Email + Push |
| **payment_confirmed** | ✓ | ✓ | ✓ | Email + Push |
| **order_accepted** | ✓ | ✗ | ✗ | Email + Push |
| **order_rejected** | ✓ | ✗ | ✓ | Email + Push |
| **order_packing** | ✓ | ✗ | ✗ | Email + Push |
| **order_shipped** | ✓ | ✓ | ✓ | Email + Push + SMS |
| **out_for_delivery** | ✓ | ✗ | ✗ | Email + Push + SMS |
| **order_delivered** | ✓ | ✓ | ✓ | Email + Push |
| **delivery_failed** | ✓ | ✓ | ✓ | Email + Push |
| **order_cancelled** | ✓ | ✓ | ✓ | Email + Push |
| **return_requested** | ✓ | ✓ | ✓ | Email + Push |
| **return_approved** | ✓ | ✓ | ✗ | Email + Push |
| **return_rejected** | ✓ | ✓ | ✗ | Email + Push |
| **refund_processed** | ✓ | ✓ | ✓ | Email + Push |
| **order_completed** | ✓ | ✗ | ✗ | Email |
| **review_request** | ✓ | ✗ | ✗ | Email |

### 9.5 Notification Timing

| Event | Timing | Rationale |
|-------|--------|-----------|
| **order_created** | Immediate | Customer confirmation |
| **payment_confirmed** | Immediate | Customer assurance |
| **order_accepted** | Immediate | Customer update |
| **order_rejected** | Immediate | Customer update + refund info |
| **order_packing** | Immediate | Customer update |
| **order_shipped** | Immediate | Customer update + tracking |
| **out_for_delivery** | Same day | Customer preparation |
| **order_delivered** | Immediate | Customer confirmation |
| **delivery_failed** | Immediate | Customer action required |
| **order_cancelled** | Immediate | Customer update + refund info |
| **return_requested** | Immediate | Customer confirmation |
| **return_approved** | Immediate | Customer update + pickup info |
| **return_rejected** | Immediate | Customer update + reason |
| **refund_processed** | Immediate | Customer update + timeline |
| **order_completed** | 30 days after delivery | Auto-complete |
| **review_request** | 24 hours after delivery | Engagement |

### 9.6 Notification Content Standards

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Personalization** | Use customer name | Engagement |
| **Order reference** | Include order number | Clarity |
| **Action required** | Clearly state if action needed | Guidance |
| **Next steps** | Explain what happens next | Transparency |
| **Contact info** | Include support contact | Helpfulness |
| **Unsubscribe** | One-click unsubscribe link | Compliance |
| **Mobile-optimized** | Responsive email templates | 70%+ mobile |

### 9.7 Notification Templates

| Template | Content | Style |
|----------|---------|-------|
| **Order Confirmation** | Order details + items + total + next steps | Professional, reassuring |
| **Shipping Notification** | Tracking number + link + ETA | Exciting, informative |
| **Delivery Confirmation** | Delivered + review request + support link | Celebratory, engaging |
| **Cancellation Notice** | Cancellation reason + refund details | Apologetic, clear |
| **Return Approved** | Return instructions + pickup schedule | Helpful, clear |
| **Refund Processed** | Refund amount + method + timeline | Reassuring, clear |

---

## 10. Permissions Architecture

### 10.1 What

Comprehensive permission matrix for order-related actions across Customer, Shop Owner, and Admin roles.

### 10.2 Why

- **Security:** Users can only perform actions within their role.
- **Data isolation:** Shop owners cannot see each other's orders.
- **Compliance:** Financial actions require appropriate authorization.
- **Integrity:** Status transitions are controlled by role.

### 10.3 Where

Every order API endpoint, order detail page, order listing, admin dashboard.

### 10.4 View Permissions

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| **View own orders** | ✓ | ✓ (their products) | ✓ (all) |
| **View order details** | Own only | Orders with their products | All |
| **View order items** | Own only | Orders with their products | All |
| **View shipping address** | Own only | Masked (city/state only) | Full |
| **View payment details** | Own only | Payment status only | Full |
| **View order history** | Own only | Orders with their products | All |
| **View tracking** | Own only | Orders with their products | All |
| **View return requests** | Own only | Orders with their products | All |

### 10.5 Edit Permissions

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| **Cancel order** | ✓ (before packing) | ✓ (before shipment) | ✓ (any state) |
| **Update address** | ✓ (before shipment) | ✗ | ✓ |
| **Add order note** | ✓ | ✓ | ✓ |
| **Request return** | ✓ (within 7 days) | ✗ | ✓ |
| **Request replacement** | ✓ (within 7 days) | ✗ | ✓ |
| **Apply coupon** | ✗ | ✗ | ✓ (manual adjustment) |

### 10.6 Status Update Permissions

| Transition | Customer | Shop Owner | Admin |
|------------|----------|------------|-------|
| **pending → confirmed** | ✗ | ✗ | ✓ (override) |
| **confirmed → processing** | ✗ | ✓ | ✓ |
| **processing → accepted** | ✗ | ✓ | ✓ |
| **processing → rejected** | ✗ | ✓ | ✓ |
| **accepted → packing** | ✗ | ✓ | ✓ |
| **packing → ready_to_ship** | ✗ | ✓ | ✓ |
| **ready_to_ship → shipped** | ✗ | ✓ | ✓ |
| **shipped → in_transit** | ✗ | ✗ | ✓ (manual) |
| **in_transit → delivered** | ✗ | ✗ | ✓ (manual) |
| **delivered → completed** | ✗ | ✗ | ✓ (auto) |
| **Any → cancelled** | ✓ (pre-packing) | ✓ (pre-shipment) | ✓ |
| **Any → returned** | ✓ (post-delivery) | ✗ | ✓ |
| **Any → refunded** | ✗ | ✗ | ✓ |

### 10.7 Cancellation Permissions

| Scenario | Customer | Shop Owner | Admin |
|----------|----------|------------|-------|
| **Cancel before packing** | ✓ | ✓ | ✓ |
| **Cancel before shipment** | ✗ | ✓ | ✓ |
| **Cancel after shipment** | ✗ | ✗ | ✓ (exception) |
| **Cancel with refund** | Auto | Auto | Auto |
| **Cancel reason required** | ✓ | ✓ | ✓ |

### 10.8 Override Permissions

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| **Force status change** | ✗ | ✗ | ✓ |
| **Manual refund** | ✗ | ✗ | ✓ |
| **Override return policy** | ✗ | ✗ | ✓ |
| **Bypass cancellation window** | ✗ | ✗ | ✓ |
| **Access order audit log** | ✗ | ✗ | ✓ |
| **Export order data** | ✗ | ✗ | ✓ |

### 10.9 Permission Enforcement

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Server-side** | All permission checks server-side | Security |
| **Middleware** | Auth + role check in middleware | Consistency |
| **RLS** | Row-Level Security on order tables | Data isolation |
| **Handler validation** | Each handler validates actor permissions | Defense in depth |
| **Client-side** | UI hides unavailable actions | UX (not security) |
| **Audit** | Permission failures logged | Security monitoring |

---

## 11. Audit Architecture

### 11.1 What

Standards for status history, action history, user history, timeline, audit logs, and immutable records.

### 11.2 Why

- **Compliance:** Legal and financial regulations require complete audit trails.
- **Debugging:** Audit logs enable quick issue resolution.
- **Accountability:** Every action is attributed to an actor.
- **Security:** Audit logs detect unauthorized access.
- **History:** Complete order history is preserved forever.

### 11.3 Where

OrderStatusHistory table, AuditLog table, order detail page (admin view), compliance reports.

### 11.4 Status History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Every transition** | Logged in OrderStatusHistory | Complete lifecycle |
| **Fields** | fromStatus, toStatus, actorId, reason, timestamp | Full context |
| **Immutable** | Records never modified or deleted | Audit integrity |
| **Queryable** | Indexed by orderId, timestamp | Fast retrieval |
| **Display** | Timeline view on order detail | Visual clarity |

### 11.5 Action History Architecture

| Action | Logged Data | Rationale |
|--------|-------------|-----------|
| **Order created** | orderId, profileId, items, total, paymentMethod | Financial |
| **Payment confirmed** | orderId, paymentId, amount, timestamp | Financial |
| **Status changed** | orderId, fromStatus, toStatus, actorId, reason | Lifecycle |
| **Item modified** | orderId, itemId, field, oldValue, newValue | Change tracking |
| **Note added** | orderId, noteId, actorId, content, type | Communication |
| **Return requested** | orderId, reason, photos, timestamp | Returns |
| **Refund processed** | orderId, refundId, amount, method, timestamp | Financial |
| **Address changed** | orderId, oldAddress, newAddress, actorId | Logistics |

### 11.6 User History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Actor tracking** | Every action tagged with actor ID | Accountability |
| **Role tracking** | Actor role at time of action recorded | Context |
| **IP tracking** | IP address logged for admin actions | Security |
| **Session tracking** | Session ID logged for admin actions | Security |
| **Device tracking** | User agent logged for admin actions | Security |

### 11.7 Timeline Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Unified view** | All order events in single timeline | Complete picture |
| **Chronological** | Sorted by timestamp | Temporal clarity |
| **Filterable** | Filter by event type, actor, date | Analysis |
| **Exportable** | Export as CSV/PDF | Compliance |
| **Admin only** | Full timeline visible to admins only | Security |

### 11.8 Audit Log Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Separate table** | AuditLog table separate from order data | Performance |
| **Event-based** | Each audit entry is one event | Granularity |
| **Structured** | JSON payload for flexible data | Flexibility |
| **Indexed** | Indexed by entity, action, timestamp | Query performance |
| **Retention** | 7 years minimum | Legal compliance |
| **Immutable** | Never modified or deleted | Integrity |

### 11.9 Immutable Records

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No UPDATE** | Audit records are never updated | Integrity |
| **No DELETE** | Audit records are never deleted | Compliance |
| **Append-only** | Only INSERT operations allowed | Safety |
| **Database constraint** | Consider row-level security on audit table | Protection |
| **Backup** | Regular backups of audit data | Disaster recovery |

---

## 12. Performance Architecture

### 12.1 What

Standards for large order volume handling, bulk operations, background processing, queue readiness, and status synchronization.

### 12.2 Why

- **Scale:** Architecture must handle 0 to 1M+ orders.
- **Speed:** Order operations must be fast even at scale.
- **Reliability:** Background processing must not lose data.
- **Efficiency:** Bulk operations must not block individual operations.

### 12.3 Where

API handlers, database queries, background jobs, admin dashboard.

### 12.4 Large Order Volume Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Pagination** | Offset-based pagination for order lists | Performance |
| **Indexing** | Composite indexes on common query patterns | Query speed |
| **Query optimization** | Use `select` to fetch only needed fields | Network efficiency |
| **Connection pooling** | Hyperdrive for connection pooling | Edge compatibility |
| **Read replicas** | Future: read replicas for analytics | Scale |

### 12.5 Bulk Operations Architecture

| Operation | Standard | Rationale |
|-----------|----------|-----------|
| **Bulk status update** | Process in background, return job ID | Non-blocking |
| **Bulk export** | Generate CSV in background, notify when ready | Non-blocking |
| **Bulk refund** | Process one at a time with rollback on failure | Safety |
| **Bulk notification** | Queue notifications, process asynchronously | Performance |
| **Batch size** | Max 100 orders per batch operation | Resource management |

### 12.6 Background Processing Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Pattern** | Async job queue (Cloudflare Queues in future) | Scalability |
| **Retry** | Exponential backoff (1s, 2s, 4s, 8s) | Resilience |
| **Max retries** | 3 attempts per job | Prevent infinite loops |
| **Dead letter** | Failed jobs moved to dead letter queue | Debugging |
| **Monitoring** | Log all job completions and failures | Observability |
| **Idempotency** | Jobs must be idempotent | Safety |

### 12.7 Queue Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Interface** | Define queue interface before implementation | Future-proofing |
| **Event-driven** | Status changes emit events | Loose coupling |
| **Consumer pattern** | Consumers process events independently | Scalability |
| **Ordering** | Per-order ordering guaranteed | Consistency |
| **Durability** | Events persisted to database | Reliability |

### 12.8 Status Synchronization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Real-time** | Status changes reflected immediately | Customer experience |
| **Optimistic updates** | UI updates before server confirms | Perceived speed |
| **Conflict resolution** | Last-write-wins with validation | Simplicity |
| **Cross-tab** | BroadcastChannel for multi-tab sync | Consistency |
| **Polling** | Fallback polling every 30 seconds | Reliability |

### 12.9 Database Performance

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Indexes** | Composite indexes on (profileId, status, createdAt) | Common queries |
| **Covering indexes** | Include frequently selected columns | Avoid table scans |
| **Partitioning** | Future: partition by date for large tables | Scale |
| **Archival** | Move old orders to archive table | Performance |
| **Connection limits** | Hyperdrive manages connection pool | Edge compatibility |

---

## 13. Security Architecture

### 13.1 What

Standards for order validation, fraud prevention readiness, permission enforcement, secure status transitions, and audit protection.

### 13.2 Why

- **Revenue:** Fraud loses money directly.
- **Trust:** Security breaches destroy brand.
- **Compliance:** Financial regulations require security.
- **Integrity:** Order data must be accurate and tamper-proof.

### 13.3 Where

Every order API endpoint, order status transition, payment operation, and admin action.

### 13.4 Order Validation Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side validation** | Every order operation validated server-side | Security |
| **Double validation** | Validate on client AND server | Defense in depth |
| **Input sanitization** | Sanitize all user inputs | Injection prevention |
| **Type validation** | Zod schemas for all inputs | Type safety |
| **Business rule validation** | Server enforces all business rules | Integrity |

### 13.5 Fraud Prevention Readiness

| Signal | Detection | Action |
|--------|-----------|--------|
| **Velocity** | Multiple orders in short time | Flag for review |
| **High value** | Orders above threshold | Flag for review |
| **New account** | Order from new account | Flag for review |
| **Address mismatch** | Billing ≠ shipping address | Flag for review |
| **Bulk purchase** | Large quantity of same item | Flag for review |
| **IP anomaly** | Unusual IP location | Flag for review |

**Fraud Response:**

| Severity | Action | Rationale |
|----------|--------|-----------|
| **Low** | Log and continue | Monitoring |
| **Medium** | Flag for manual review | Investigation |
| **High** | Hold order, notify admin | Protection |
| **Critical** | Cancel order, block user | Enforcement |

### 13.6 Permission Enforcement Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Middleware auth** | Every endpoint authenticated | Security |
| **Role check** | Every endpoint checks role authorization | Security |
| **RLS** | Row-Level Security on all order tables | Data isolation |
| **Handler validation** | Each handler validates actor permissions | Defense in depth |
| **CSRF protection** | Double-submit cookie pattern | CSRF prevention |
| **Rate limiting** | Order endpoints rate-limited | Abuse prevention |

### 13.7 Secure Status Transitions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **State machine** | Only valid transitions allowed | Integrity |
| **Actor validation** | Transition must be by authorized actor | Security |
| **Reason logging** | Every transition logged with reason | Audit |
| **Idempotency** | Duplicate transitions rejected | Safety |
| **Optimistic locking** | Prevent concurrent modification | Consistency |

### 13.8 Audit Protection

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Immutable** | Audit records never modified | Integrity |
| **Append-only** | Only INSERT on audit tables | Safety |
| **Access control** | Audit logs admin-only | Security |
| **Backup** | Regular backups of audit data | Disaster recovery |
| **Encryption** | Sensitive audit data encrypted at rest | Protection |

### 13.9 Payment Security

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Signature verification** | Verify Razorpay signature server-side | Security |
| **Amount verification** | Server amount must match Razorpay amount | Integrity |
| **Idempotency** | Payment operations idempotent | Safety |
| **No client trust** | Never trust client-side payment data | Security |
| **Webhook verification** | Verify webhook signatures | Security |

---

## 14. Accessibility Architecture

### 14.1 What

WCAG 2.2 AA compliance standards for every order management component — keyboard support, screen readers, touch accessibility, and focus management.

### 14.2 Why

- **Legal compliance:** Meet accessibility laws.
- **Inclusivity:** Everyone can manage orders.
- **Quality:** Accessible code is better code.
- **Revenue:** Accessible checkout converts more.

### 14.3 Where

Every order page, order detail, order tracking, return request, and admin dashboard.

### 14.4 Keyboard Support Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical, follows visual flow | Intuitive |
| **Focus visible** | Clear focus ring (brand-500) | Orientation |
| **No keyboard trap** | Always able to escape | Recovery |
| **Enter to submit** | Enter submits forms | Efficiency |
| **Escape to close** | ESC closes modals/sheets | Recovery |
| **Arrow keys** | Navigate within lists | Familiar |
| **Skip link** | "Skip to main content" | Efficiency |

### 14.5 Screen Reader Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic HTML** | `<nav>`, `<main>`, `<button>`, `<form>` | Meaning |
| **ARIA landmarks** | Label regions | Navigation |
| **Form labels** | Associated with inputs | Understanding |
| **Error association** | `aria-describedby` for errors | Clarity |
| **Live regions** | `aria-live` for dynamic content | Updates |
| **Status announcements** | "Order status updated" announced | Feedback |
| **Headings** | Proper H1-H6 hierarchy | Navigation |

### 14.6 Touch Accessibility Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Min target** | 44x44px | Ease of use |
| **Spacing** | 8px between targets | Prevent miss-taps |
| **No hover only** | Works without hover | Touch devices |
| **Swipe alternatives** | Button alternatives for swipe | Accessibility |
| **Large buttons** | Primary actions prominent | Accuracy |

### 14.7 Mobile Order Management

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Order list** | Full-width cards | Readable |
| **Order detail** | Stacked, single-column | Simple |
| **Status timeline** | Vertical, mobile-optimized | Visual |
| **Actions** | Bottom sheet for actions | Thumb-friendly |
| **Tracking** | Deep link to courier tracking | Convenience |
| **Return request** | Full-screen form | Focused |

---

## 15. Future Readiness Architecture

### 15.1 What

Architecture standards for future order features — split shipments, partial fulfillment, multi-warehouse, international shipping, courier integrations, AI workflow automation, and workflow engine.

### 15.2 Why

- **Scalability:** New features extend without redesign.
- **Competitiveness:** Ready for market demands.
- **Innovation:** Architecture supports experimentation.
- **Investment:** Future-proof development effort.

### 15.3 Where

New features, extensions, integrations.

### 15.4 Split Shipment Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Parent order** | Original order remains | History integrity |
| **Child orders** | Split into sub-orders | Flexibility |
| **Tracking** | Each shipment tracked separately | Visibility |
| **Billing** | Single invoice, multiple shipments | Simplicity |
| **UI readiness** | Architecture supports splits, implement later | Future-proofing |

### 15.5 Partial Fulfillment Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Item-level status** | Each item has own fulfillment status | Granularity |
| **Partial shipping** | Ship available items first | Speed |
| **Partial refund** | Refund for unavailable items | Financial |
| **Notification** | Customer notified of partial shipments | Transparency |
| **UI readiness** | Architecture supports partial, implement later | Future-proofing |

### 15.6 Multi-Warehouse Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Warehouse model** | Warehouse entity with inventory | Structure |
| **Routing** | Auto-route to nearest warehouse | Efficiency |
| **Stock per warehouse** | Inventory tracked per warehouse | Accuracy |
| **Fulfillment** | Each warehouse fulfills independently | Scalability |
| **UI readiness** | Architecture supports multi-warehouse | Future-proofing |

### 15.7 International Shipping Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Currency** | Support multiple currencies | Global |
| **Tax** | Calculate international tax/customs | Compliance |
| **Customs forms** | Auto-generate customs declarations | Logistics |
| **Duties** | Calculate import duties | Accuracy |
| **Carriers** | International carrier integrations | Logistics |

### 15.8 Courier Integrations Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Abstraction layer** | Courier interface for all integrations | Flexibility |
| **Rate comparison** | Compare rates across couriers | Cost optimization |
| **Label generation** | Auto-generate labels via API | Efficiency |
| **Tracking aggregation** | Unified tracking from all couriers | Customer experience |
| **Supported couriers** | Shiprocket, Delhivery, BlueDart, DTDC | Indian market |

### 15.9 AI Workflow Automation

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Fraud detection** | ML-based fraud scoring | Automation |
| **Demand forecasting** | Predict order volume | Planning |
| **Smart routing** | AI-optimized shipping routes | Efficiency |
| **Chatbot support** | AI-powered order support | Scale |
| **Anomaly detection** | Detect unusual order patterns | Security |

### 15.10 Workflow Engine Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Rule engine** | Configurable business rules | Flexibility |
| **Trigger system** | Event-driven workflow triggers | Automation |
| **Action library** | Reusable workflow actions | Efficiency |
| **Condition system** | IF-THEN-ELSE logic | Business rules |
| **Monitoring** | Workflow execution monitoring | Observability |

---

## 16. Mandatory Rules for AI Agents

### 16.1 What

Hard rules that every AI agent must follow when designing, implementing, or reviewing order management features.

### 16.2 Why

- **Consistency:** No exceptions to the rules.
- **Quality:** Every interaction meets the standard.
- **Revenue:** Orders directly affect revenue.

### 16.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **One lifecycle** | Every order follows one lifecycle | Confusion |
| **Controlled transitions** | Status transitions must be validated | Illegal states |
| **Auditable** | Every action must be logged | No accountability |
| **Inventory sync** | Inventory must remain synchronized | Overselling |
| **History preserved** | Order history must never be lost | Lost data |
| **Modular** | Modules must remain loosely coupled | Tight coupling |
| **Mobile-first** | Design for 375px, enhance upward | 70%+ mobile |
| **Secure** | Every request validated server-side | Security |
| **Transparent** | Status always visible to customer | Trust |
| **Idempotent** | Payment operations must be idempotent | Double charges |
| **Snapshot data** | Order stores data at time of purchase | Price drift |
| **Soft delete** | No hard deletes on orders | Data integrity |
| **Guest support** | Guest checkout must work | Conversion |
| **Error recovery** | Every error has clear recovery | Resilience |
| **Accessibility** | WCAG 2.2 AA compliance | Inclusivity |
| **No comments** | Code must be self-documenting | Code rot |
| **Max file length** | 300 lines per file | Maintainability |
| **Max handler length** | 150 lines per handler | Focus |
| **Named exports only** | No default exports | Refactoring |
| **No barrel files** | Direct imports only | Tree-shaking |

### 16.4 Agent Decision Framework

When implementing any order management feature, agent must ask:

1. **Is this mobile-first?** — Would this work on a 375px screen?
2. **Is this auditable?** — Is every action logged with actor + timestamp?
3. **Is this secure?** — Is every request validated server-side?
4. **Is this reversible?** — Can this action be undone if needed?
5. **Is this transparent?** — Can the customer see what's happening?
6. **Is this idempotent?** — Can this be safely retried?
7. **Is this modular?** — Does this respect feature boundaries?
8. **Is this performant?** — Will this work at scale?
9. **Is this accessible?** — Can everyone use this?
10. **Is this consistent?** — Does this match existing patterns?

### 16.5 Implementation Checklist

Before shipping any order management feature:

- [ ] Mobile-first design verified at 375px
- [ ] Touch targets minimum 44x44px
- [ ] Keyboard navigation works
- [ ] Screen reader announces all content
- [ ] Focus management correct
- [ ] Loading states present
- [ ] Error states with recovery
- [ ] Empty states with guidance
- [ ] Status transitions validated
- [ ] Permissions enforced server-side
- [ ] Audit logging enabled
- [ ] Inventory synchronized
- [ ] Customer notified
- [ ] Shop owner notified (if relevant)
- [ ] Admin notified (if relevant)
- [ ] Idempotency keys on payment
- [ ] Razorpay signature verification
- [ ] No hardcoded status values
- [ ] Consistent with existing patterns
- [ ] Performance budget met
- [ ] Accessibility audit passed
- [ ] No comments in code
- [ ] Max 300 lines per file
- [ ] Max 150 lines per handler
- [ ] Named exports only
- [ ] No barrel files
- [ ] TypeScript strict mode
- [ ] No `any` types
- [ ] Zod validation on all inputs

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
