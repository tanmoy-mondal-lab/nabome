# নবME (Nabome) — Shipping, Delivery & Logistics Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for shipping, delivery, tracking, and logistics architecture  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), API_SERVICE_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Logistics Foundation](#1-logistics-foundation)
2. [Shipping Methods](#2-shipping-methods)
3. [Shipment Lifecycle](#3-shipment-lifecycle)
4. [Tracking Architecture](#4-tracking-architecture)
5. [Shipping Rules](#5-shipping-rules)
6. [Admin Management](#6-admin-management)
7. [Customer Experience](#7-customer-experience)
8. [Order Integration](#8-order-integration)
9. [Notifications Architecture](#9-notifications-architecture)
10. [Permissions Architecture](#10-permissions-architecture)
11. [Performance Architecture](#11-performance-architecture)
12. [Security Architecture](#12-security-architecture)
13. [Accessibility Architecture](#13-accessibility-architecture)
14. [Future Readiness Architecture](#14-future-readiness-architecture)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Logistics Foundation

### 1.1 What

The foundational philosophy, ownership model, lifecycle, relationships, integrity guarantees, and auditability standards that govern every shipment on the Nabome platform.

### 1.2 Why

- **Customer trust:** Shipping is the most visible post-purchase touchpoint — transparency builds loyalty.
- **Revenue protection:** Incorrect shipping loses money and customers.
- **Operational clarity:** Every stakeholder must understand shipment state at all times.
- **Scalability:** Logistics architecture must handle 1 to 100,000+ shipments per day without redesign.
- **Future-proof:** Must support multiple couriers, international logistics, and warehouse routing without rewrites.

### 1.3 Where

Every order detail page, tracking page, shipping notification, admin dashboard, shop owner dashboard, and API handler related to fulfillment and delivery across the Nabome platform.

### 1.4 Shipping Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Shipment is independent from order** | Shipment is a separate entity from order — one order can have multiple shipments (split shipment future) | Flexibility |
| **Tracking history is immutable** | Once a tracking event is recorded, it is never modified or deleted | Audit integrity |
| **Every shipment is auditable** | Every shipment action is logged with actor, timestamp, and context | Compliance |
| **Customers always have visibility** | Customer can see shipment status at all times | Trust |
| **Manual shipping works today** | Admin/shop owner can manually manage shipments without courier API | MVP |
| **Courier API is ready tomorrow** | Architecture supports multiple courier integrations without redesign | Future-proof |
| **Loose coupling** | Logistics module does not depend on order engine internals | Modularity |
| **Enterprise-scale** | Architecture handles high volume without degradation | Scalability |

### 1.5 Logistics Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOGISTICS ARCHITECTURE                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   SHIPMENT ENGINE                         │   │
│  │                                                           │   │
│  │  Shipment Creation → Packing → Courier Assignment →      │   │
│  │  Pickup → In Transit → Out for Delivery → Delivered      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│          ┌───────────────┼───────────────┐                      │
│          ▼               ▼               ▼                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │   TRACKING   │ │   SHIPPING   │ │   DELIVERY   │           │
│  │   ENGINE     │ │   RULES      │ │   ENGINE     │           │
│  │              │ │              │ │              │           │
│  │  Events      │ │  Zones       │ │  Confirmation│           │
│  │  Timeline    │ │  Rates       │ │  Proof       │           │
│  │  Status      │ │  Weight      │ │  Failed      │           │
│  │  ETA         │ │  Size        │ │  Return      │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│          │               │               │                      │
│          ▼               ▼               ▼                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                COURIER ABSTRACTION LAYER                  │   │
│  │                                                           │   │
│  │  Manual │ Shiprocket │ Delhivery │ BlueDart │ Future    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              NOTIFICATION & AUDIT LAYER                   │   │
│  │                                                           │   │
│  │  Email │ Push │ SMS │ In-App │ Audit Log                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Shipment Lifecycle

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **One shipment = one tracking number** | Each shipment has a unique tracking identifier | Clarity |
| **One order = one or more shipments** | Architecture supports split shipments from day one | Future-proof |
| **Shipment belongs to order** | Shipment references order, not the other way around | Independence |
| **Shipment has independent status** | Shipment status is separate from order status | Modularity |
| **Status transitions are controlled** | Only valid transitions are allowed | Integrity |
| **Every transition is logged** | Status changes logged with actor + timestamp | Audit trail |

### 1.7 Shipment Ownership

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Primary owner** | Exactly one `orderId` per shipment | Clear ownership |
| **Customer visibility** | Customer sees only their own shipments | Privacy |
| **Shop owner visibility** | Shop owner sees shipments for their products only | Multi-tenant isolation |
| **Admin visibility** | Admin sees all shipments across all shops | Platform oversight |
| **Data isolation** | RLS ensures shop owners cannot see each other's shipments | Security |

### 1.8 Shipment Relationships

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Order     │       │   Shipment   │       │ShipmentEvent │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │◀──┐   │ id (PK)      │◀──┐   │ id (PK)      │
│              │   └───│ orderId      │   └───│ shipmentId   │
│ orderNumber  │       │              │       │              │
│ profileId ───│──▶    │ trackingNumber│      │ status       │
│              │       │ courierCode  │       │ location     │
│              │       │ status       │       │ description  │
│              │       │ estimatedDelivery│   │ actorType    │
│              │       │              │       │ metadata     │
│              │       │ createdAt    │       │ createdAt    │
└──────────────┘       └──────┬───────┘       └──────────────┘
                              │
                              ▼
                       ┌──────────────┐       ┌──────────────┐
                       │ ShipmentItem │       │   Courier    │
                       │──────────────│       │──────────────│
                       │ id (PK)      │       │ id (PK)      │
                       │ shipmentId ──│──▶    │ code (unique)│
                       │ orderItemId ─│──▶    │ name         │
                       │ quantity     │       │ apiEnabled   │
                       └──────────────┘       │ config       │
                                              └──────────────┘
```

### 1.9 Shipment Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Tracking snapshot** | Tracking number and courier stored at shipment creation | Reference integrity |
| **Weight snapshot** | Order weight captured at shipment time | Accuracy |
| **Address snapshot** | Shipping address copied from order at shipment time | Immutability |
| **Item snapshot** | Shipment items reference order items | Traceability |
| **Cost snapshot** | Shipping cost stored per shipment | Financial accuracy |
| **Timestamp snapshot** | All key timestamps stored (created, picked up, delivered) | Audit trail |

---

## 2. Shipping Methods

### 2.1 What

The complete architecture for shipping method selection, manual shipping, courier API integration, pickup readiness, local delivery, and international shipping readiness.

### 2.2 Why

- **Flexibility:** Different customers need different shipping speeds.
- **Cost optimization:** Multiple methods allow cost-effective choices.
- **Future-proof:** Architecture must support courier integrations without redesign.
- **MVP delivery:** Manual shipping works today while API integrations are built tomorrow.

### 2.3 Where

Checkout flow, shipping method selection, admin shipment management, courier integration layer, order confirmation page.

### 2.4 Shipping Methods

| Method | Code | Cost | Delivery Time | Use Case | Status |
|--------|------|------|---------------|----------|--------|
| **Standard** | `standard` | Free over ₹999, else ₹99 | 5-7 business days | Default | Active |
| **Express** | `express` | ₹199 | 2-3 business days | Urgent | Active |
| **Same Day** | `same_day` | ₹299 | Same day (metro only) | Premium | Future |
| **Pickup** | `pickup` | Free | Immediate | Local | Future |
| **International** | `international` | Calculated | 7-15 business days | Global | Future |

### 2.5 Manual Shipping Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin/shop owner manually assigns tracking number | MVP |
| **Tracking entry** | Manual entry of tracking number + courier selection | Flexibility |
| **Status updates** | Admin manually updates shipment status | MVP |
| **Courier selection** | Select from supported courier list | Choice |
| **Tracking URL** | Auto-generate tracking URL based on courier | Customer convenience |
| **Batch support** | Admin can create multiple shipments at once | Efficiency |

**Manual Shipping Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  MANUAL SHIPPING FLOW                             │
│                                                                  │
│  1. ORDER READY FOR SHIPMENT                                     │
│     → Order in ready_to_ship state                               │
│     → Admin views shipment queue                                 │
│                                                                  │
│  2. SELECT ORDERS                                                │
│     → Select one or multiple orders                              │
│     → Verify packing complete                                    │
│                                                                  │
│  3. ASSIGN COURIER                                               │
│     → Select courier from list                                   │
│     → Enter tracking number (or auto-generate)                   │
│     → Enter estimated delivery date                              │
│                                                                  │
│  4. CREATE SHIPMENT                                              │
│     → Shipment record created                                    │
│     → ShipmentItem records created                               │
│     → ShipmentEvent: created                                     │
│     → Order status → shipped                                     │
│                                                                  │
│  5. UPDATE STATUS                                                │
│     → Admin updates status as shipment progresses                │
│     → Each update creates ShipmentEvent                          │
│     → Customer notified of each update                           │
│                                                                  │
│  6. DELIVERY CONFIRMATION                                        │
│     → Admin marks as delivered                                   │
│     → Order status → delivered                                   │
│     → Customer notified                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 Courier API Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Abstraction layer** | `CourierProvider` interface for all integrations | Consistency |
| **Webhook support** | Courier webhooks update shipment status automatically | Automation |
| **Rate comparison** | Compare shipping rates across couriers | Cost optimization |
| **Label generation** | Auto-generate shipping labels via API | Efficiency |
| **Tracking aggregation** | Single tracking view for all couriers | Customer experience |
| **Supported couriers** | Shiprocket, Delhivery, BlueDart, DTDC (Indian market) | Market coverage |

**Courier Abstraction Interface:**

| Method | Description | Required |
|--------|-------------|----------|
| `getRates(origin, destination, weight, dimensions)` | Get shipping rates | Yes |
| `createShipment(shipmentData)` | Create shipment with courier | Yes |
| `getTracking(trackingNumber)` | Get tracking events | Yes |
| `generateLabel(shipmentId)` | Generate shipping label | Yes |
| `cancelShipment(shipmentId)` | Cancel shipment | Yes |
| `getPickupSlots(date, pincode)` | Get available pickup slots | Future |

### 2.7 Pickup Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer selects "Store Pickup" at checkout | Flexibility |
| **Notification** | Notify customer when order is ready for pickup | Communication |
| **Time window** | Customer has 7 days to collect | Business rule |
| **Reminders** | Send reminders at day 3 and day 6 | Engagement |
| **Auto-cancel** | Auto-cancel and refund after 7 days | Cleanup |
| **Verification** | Customer shows order confirmation for pickup | Security |

### 2.8 Local Delivery Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Delivery address within defined radius | Geography |
| **Time slots** | Customer selects delivery time slot | Convenience |
| **Same-day** | Available for orders before 2 PM | Premium service |
| **Cost** | Free or reduced cost for local delivery | Incentive |
| **Tracking** | Real-time delivery tracking | Transparency |

### 2.9 International Shipping Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Currency** | Support multiple currencies | Global |
| **Tax** | Calculate international tax/customs | Compliance |
| **Customs forms** | Auto-generate customs declarations | Logistics |
| **Duties** | Calculate import duties (DDP or DDU) | Accuracy |
| **Carriers** | International carrier integrations (DHL, FedEx, UPS) | Coverage |
| **Restrictions** | Product-level international shipping restrictions | Compliance |
| **Prohibited items** | Block prohibited items by destination country | Legal |

---

## 3. Shipment Lifecycle

### 3.1 What

The complete, controlled workflow that every shipment must follow — from creation through delivery to closure, with clearly defined states, transitions, and rules.

### 3.2 Why

- **Operational clarity:** Everyone knows exactly what stage a shipment is in.
- **Automation:** Status transitions trigger automated actions (emails, tracking updates).
- **Accountability:** Every transition has an actor, timestamp, and context.
- **Prevention:** Invalid transitions are blocked at the system level.
- **Customer trust:** Customers see real-time progress of their shipment.

### 3.3 Where

Shipment detail page, shipment listing, admin dashboard, tracking page, API responses, notification triggers.

### 3.4 Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHIPMENT LIFECYCLE                             │
│                                                                  │
│  ┌──────────────────┐                                            │
│  │ SHIPMENT_CREATED │ ◀── Shipment record created                │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ READY_TO_PACK    │ ◀── Waiting to be packed                   │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ PACKED           │ ◀── Items packed, ready for courier        │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ READY_FOR_PICKUP │ ◀── Waiting for courier pickup             │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ PICKED_UP        │ ◀── Courier picked up package              │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ IN_TRANSIT       │ ◀── Package moving through network         │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ├──▶ [EXCEPTION] ◀── Shipping exception (weather, etc.)│
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ OUT_FOR_DELIVERY │ ◀── Out for delivery today                 │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ├──▶ [DELIVERY_FAILED] ◀── Delivery attempt failed     │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ DELIVERED        │ ◀── Successfully delivered                 │
│  └────────┬─────────┘                                            │
│           │                                                      │
│           ├──▶ [RETURNED_TO_SENDER] ◀── Package returned         │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────┐                                            │
│  │ CLOSED           │ ◀── Shipment complete, no further action   │
│  └──────────────────┘                                            │
│                                                                  │
│  ALTERNATE PATHS:                                                │
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │ RETURNED_TO_SENDER│ ──▶ │ CLOSED           │                  │
│  └──────────────────┘     └──────────────────┘                  │
│                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                  │
│  │ DELIVERY_FAILED  │ ──▶ │ RETURNED_TO_SENDER│ (after 3 attempts)│
│  └──────────────────┘     └──────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Shipment States

| State | Description | Visible To | Next Possible States |
|-------|-------------|------------|---------------------|
| **shipment_created** | Shipment record created | Admin, Shop Owner | ready_to_pack |
| **ready_to_pack** | Waiting to be packed | Admin, Shop Owner | packed |
| **packed** | Items packed, ready for courier | Admin, Shop Owner, Customer | ready_for_pickup |
| **ready_for_pickup** | Waiting for courier pickup | Admin, Shop Owner, Customer | picked_up |
| **picked_up** | Courier picked up package | Admin, Shop Owner, Customer | in_transit |
| **in_transit** | Package moving through network | Admin, Shop Owner, Customer | out_for_delivery, delivery_failed, exception |
| **out_for_delivery** | Out for delivery today | Admin, Shop Owner, Customer | delivered, delivery_failed |
| **delivered** | Successfully delivered | Admin, Shop Owner, Customer | closed |
| **delivery_failed** | Delivery attempt failed | Admin, Shop Owner, Customer | out_for_delivery (retry), returned_to_sender (after max attempts) |
| **exception** | Shipping exception | Admin, Shop Owner, Customer | in_transit (resolved) |
| **returned_to_sender** | Package returned | Admin, Shop Owner, Customer | closed |
| **closed** | Shipment complete | Admin, Shop Owner | (terminal) |

### 3.6 Transition Rules

| From State | Allowed To States | Actor Required | Reason Required |
|------------|-------------------|----------------|-----------------|
| **shipment_created** | ready_to_pack | Admin/Shop Owner | No |
| **ready_to_pack** | packed | Admin/Shop Owner | No |
| **packed** | ready_for_pickup | Admin/Shop Owner | No |
| **ready_for_pickup** | picked_up | Admin/Shop Owner/Courier | No |
| **picked_up** | in_transit | Admin/Shop Owner/Courier/System | No |
| **in_transit** | out_for_delivery | Courier/System | No |
| **in_transit** | delivery_failed | Courier/System | Yes (failure reason) |
| **in_transit** | exception | Courier/System | Yes (exception details) |
| **out_for_delivery** | delivered | Courier/System | No |
| **out_for_delivery** | delivery_failed | Courier/System | Yes (failure reason) |
| **delivery_failed** | out_for_delivery | Admin/System | No (auto-retry) |
| **delivery_failed** | returned_to_sender | Admin/System | Yes (after max attempts) |
| **exception** | in_transit | Courier/System | Yes (resolution details) |
| **delivered** | closed | System | Auto (after confirmation window) |
| **returned_to_sender** | closed | System | Auto |

### 3.7 Invalid Transition Handling

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Invalid transition attempted** | Return error: "Invalid shipment status transition" | Prevent illegal state changes |
| **Concurrent updates** | Optimistic locking with validation | Prevent race conditions |
| **Stale state** | Re-fetch shipment before transition | Ensure current state |
| **Actor mismatch** | Reject transition if actor not authorized | Security |

### 3.8 Lifecycle Automation

| Transition | Automated Action | Rationale |
|------------|------------------|-----------|
| **shipment_created → ready_to_pack** | Notify shop owner to pack | Communication |
| **ready_to_pack → packed** | Notify customer "order packed" | Transparency |
| **packed → ready_for_pickup** | Notify courier for pickup (API) or notify admin | Automation |
| **ready_for_pickup → picked_up** | Create tracking event, notify customer | Communication |
| **picked_up → in_transit** | Sync tracking from courier, notify customer | Transparency |
| **in_transit → out_for_delivery** | Notify customer "out for delivery today" | Communication |
| **out_for_delivery → delivered** | Mark delivered, send delivery confirmation, request review | Engagement |
| **delivery_failed → out_for_delivery** | Auto-retry delivery next business day | Automation |
| **delivery_failed → returned_to_sender** | After 3 attempts, initiate return | Business rule |
| **delivered → closed** | Auto-close after 7 days if no return | Cleanup |

### 3.9 Shipment Lifecycle Timing

| Metric | Standard | Rationale |
|--------|----------|-----------|
| **Creation to packing** | < 24 hours | Customer expectation |
| **Packing to courier pickup** | < 24 hours | Customer expectation |
| **Pickup to in transit** | < 12 hours | Courier SLA |
| **In transit to delivery** | 5-7 days (standard), 2-3 days (express) | Shipping method |
| **Delivery to close** | 7 days (auto-close) | Return window |
| **Failed delivery retry** | 3 attempts over 3 business days | Operational limit |
| **Exception resolution** | < 48 hours | Customer experience |

---

## 4. Tracking Architecture

### 4.1 What

The complete tracking system — tracking numbers, tracking timeline, tracking events, shipment status synchronization, estimated delivery, delivery confirmation, delivery proof, and customer tracking.

### 4.2 Why

- **Customer experience:** Real-time tracking is the #1 post-purchase expectation.
- **Trust:** Transparency builds confidence in the platform.
- **Support reduction:** Self-service tracking reduces support queries by 40-60%.
- **Operational visibility:** Internal teams can monitor shipment health.

### 4.3 Where

Order detail page, tracking page, shipping notifications, admin dashboard, courier webhooks, API responses.

### 4.4 Tracking Number Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Generation** | Generated on shipment handoff (manual or API) | Accuracy |
| **Format** | Courier-specific format | Compatibility |
| **Uniqueness** | Unique constraint on tracking number | Integrity |
| **Storage** | Stored on Shipment record | Source of truth |
| **Display** | Prominent on order detail and tracking page | Customer visibility |
| **Copyable** | One-tap copy on mobile | Convenience |
| **Linkable** | Direct link to courier tracking page | One-click tracking |
| **Multi-courier** | Each shipment has one tracking number | Simplicity |

### 4.5 Tracking Timeline Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Source** | Courier API, webhook, or manual entry | Flexibility |
| **Events** | All tracking events stored in ShipmentEvent table | Complete history |
| **Display** | Vertical timeline view on tracking page | Visual clarity |
| **Sorting** | Most recent first (reverse chronological) | Relevance |
| **Refresh** | Auto-refresh every 30 minutes for active shipments | Fresh data |
| **Manual refresh** | Customer can tap to refresh | Control |
| **Offline support** | Last known status cached for offline viewing | Resilience |

### 4.6 Tracking Events

| Event | Code | Description | Customer Notification | Internal Notification |
|-------|------|-------------|----------------------|----------------------|
| **Shipment created** | `shipment_created` | Shipment record created | Yes | Yes (Shop Owner) |
| **Packed** | `packed` | Items packed | Yes | No |
| **Ready for pickup** | `ready_for_pickup` | Awaiting courier | Yes | Yes (Shop Owner) |
| **Picked up** | `picked_up` | Package picked up by courier | Yes | Yes |
| **In transit** | `in_transit` | Package in transit | Yes | No |
| **Out for delivery** | `out_for_delivery` | Out for delivery today | Yes | No |
| **Delivered** | `delivered` | Successfully delivered | Yes | Yes |
| **Delivery failed** | `delivery_failed` | Delivery attempt failed | Yes | Yes |
| **Exception** | `exception` | Shipping exception (weather, etc.) | Yes | Yes |
| **Returned to sender** | `returned_to_sender` | Package returned | Yes | Yes |
| **Returned** | `returned` | Return pickup completed | Yes | Yes |

### 4.7 Tracking Event Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Event identifier |
| `shipmentId` | UUID | Reference to shipment |
| `status` | ShipmentStatus | Event status code |
| `location` | String? | Event location (city, hub, etc.) |
| `description` | String | Human-readable event description |
| `actorType` | ActorType | Who performed the action (customer, shop_owner, admin, courier, system) |
| `actorId` | UUID? | Who performed the action |
| `metadata` | JSONB? | Additional event data (courier response, exception details) |
| `createdAt` | DateTime | When the event occurred |

### 4.8 Estimated Delivery Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Initial estimate** | Calculated at shipment creation based on method + destination | Planning |
| **Dynamic update** | Updated based on courier API data | Accuracy |
| **Display** | Prominent on tracking page | Customer visibility |
| **Range support** | Show range (e.g., "Aug 5-7") when exact date unknown | Realistic |
| **Confidence level** | High/Medium/Low based on data quality | Transparency |
| **Notification** | Notify customer if estimate changes significantly | Communication |

### 4.9 Delivery Confirmation Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Auto-confirm** | Courier webhook confirms delivery | Automation |
| **Photo proof** | Courier captures delivery photo | Proof of delivery |
| **Signature** | Digital signature where required | Accountability |
| **OTP verification** | OTP-based confirmation for high-value orders | Security |
| **Time window** | Delivery within estimated window | Customer expectation |
| **Notification** | Immediate email + push on delivery | Communication |
| **Review request** | Request review 24 hours after delivery | Engagement |
| **Auto-complete** | Order auto-completes 7 days after delivery if no return | Automation |

### 4.10 Delivery Proof Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Photo capture** | Courier captures delivery photo | Proof of delivery |
| **GPS coordinates** | Capture delivery location | Verification |
| **Recipient name** | Capture who received the package | Accountability |
| **Timestamp** | Exact delivery time recorded | Accuracy |
| **Storage** | Proof stored in ShipmentEvent metadata | Audit trail |
| **Access** | Admin can view proof, customer can request | Transparency |

### 4.11 Customer Tracking

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Public tracking** | Track by order number + email (no login required) | Guest support |
| **Authenticated tracking** | Track from order detail page (logged in) | Self-service |
| **Deep link** | Direct link to courier tracking page | One-click |
| **Push notifications** | Opt-in for delivery updates | Engagement |
| **SMS tracking** | SMS updates for key events | Accessibility |
| **Share tracking** | Share tracking link with others | Gifting use case |

---

## 5. Shipping Rules

### 5.1 What

Standards for shipping charges, free shipping, shipping zones, weight rules, size rules, delivery time, service levels, and future dynamic shipping.

### 5.2 Why

- **Revenue:** Correct shipping charges protect margins.
- **Transparency:** Customers must understand shipping costs before purchase.
- **Fairness:** Rules must be consistent and predictable.
- **Optimization:** Rules should encourage desired behavior (higher AOV for free shipping).

### 5.3 Where

Checkout flow, shipping method selection, admin settings, order confirmation, invoice.

### 5.4 Shipping Charges

| Method | Base Cost | Free Shipping Threshold | Rationale |
|--------|-----------|------------------------|-----------|
| **Standard** | ₹99 | ₹999+ | Incentive for higher AOV |
| **Express** | ₹199 | Never free | Premium service |
| **Same Day** | ₹299 | Never free | Premium service |
| **Pickup** | Free | Always free | No shipping cost |
| **International** | Calculated | Never free | Cost passthrough |

### 5.5 Free Shipping

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Threshold** | ₹999 minimum order value | Encourage higher AOV |
| **Display** | Show "Free shipping on orders over ₹999" | Transparency |
| **Progress indicator** | Show "Add ₹X more for free shipping" | Conversion |
| **Method** | Only for standard shipping | Cost control |
| **Exclude** | Express and same-day not eligible | Premium pricing |
| **Coupon** | Free shipping coupon overrides threshold | Promotion |
| **Partial return** | If return drops below threshold, charge shipping | Financial accuracy |

### 5.6 Shipping Zones

| Zone | Coverage | Standard Cost | Express Cost | Rationale |
|------|----------|---------------|--------------|-----------|
| **Metro** | Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad | ₹99 | ₹199 | High density |
| **Tier 1** | State capitals, major cities | ₹99 | ₹199 | Good coverage |
| **Tier 2** | District headquarters | ₹99 | ₹249 | Moderate coverage |
| **Tier 3** | Small cities, towns | ₹149 | Not available | Limited coverage |
| **Remote** | Northeast, J&K, Ladakh, island territories | ₹199 | Not available | Limited access |
| **International** | Global | Calculated per destination | N/A | Variable |

### 5.7 Weight Rules

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Max weight (standard)** | 30 kg per shipment | Courier limit |
| **Max weight (express)** | 25 kg per shipment | Courier limit |
| **Weight calculation** | Sum of all items in shipment | Accuracy |
| **Dimensional weight** | Use L×W×H / 5000 for volumetric weight | Industry standard |
| **Actual vs dimensional** | Charge higher of actual or dimensional | Fair pricing |
| **Overweight handling** | Split into multiple shipments | Flexibility |

### 5.8 Size Rules

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Max dimensions** | 150cm (L+W+H) per shipment | Courier limit |
| **Oversize items** | Flag at product level, special shipping | Handling |
| **Fragile items** | Special packaging requirement | Damage prevention |
| **Liquid items** | Special handling requirement | Compliance |

### 5.9 Delivery Time

| Method | Delivery Window | Business Days | Rationale |
|--------|----------------|---------------|-----------|
| **Standard** | 5-7 days | Mon-Sat | Normal processing |
| **Express** | 2-3 days | Mon-Sat | Priority handling |
| **Same Day** | Same day | Mon-Sat, order before 2 PM | Premium |
| **International** | 7-15 days | Business days | Variable |

**Business Day Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Exclude Sundays** | No delivery on Sundays | Courier operations |
| **Exclude national holidays** | No delivery on gazetted holidays | Courier operations |
| **Exclude regional holidays** | Respects regional closures | Accuracy |
| **Processing time** | 1-2 days before shipping | Fulfillment |
| **Cutoff time** | Orders before 2 PM ship same day | Efficiency |

### 5.10 Service Levels

| Level | Name | Delivery | Cost | Tracking | Support |
|-------|------|----------|------|----------|---------|
| **SL1** | Standard | 5-7 days | ₹99 / Free >₹999 | Basic | Email |
| **SL2** | Express | 2-3 days | ₹199 | Real-time | Email + Chat |
| **SL3** | Same Day | Same day | ₹299 | Real-time + live | Priority |

### 5.11 Future Dynamic Shipping

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Real-time rates** | Calculate rates based on actual courier API data | Accuracy |
| **Demand-based pricing** | Adjust rates based on demand (peak seasons) | Optimization |
| **Location-based** | Calculate based on exact pincode distance | Precision |
| **Weight-based** | Calculate based on actual weight and dimensions | Fairness |
| **Coupon-based** | Support free shipping coupons and discounts | Promotions |
| **Loyalty-based** | Free express shipping for loyalty members | Retention |

---

## 6. Admin Management

### 6.1 What

Standards for shipment creation, shipment assignment, courier selection, manual tracking, shipment search, shipment filters, shipment history, and shipment reports.

### 6.2 Why

- **Operational efficiency:** Admins must manage logistics quickly and accurately.
- **Visibility:** Complete overview of all shipments across the platform.
- **Control:** Ability to override, correct, and manage exceptions.
- **Reporting:** Data-driven decisions on courier performance and costs.

### 6.3 Where

Admin dashboard, shop owner dashboard, shipment management pages, API handlers.

### 6.4 Shipment Creation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Single creation** | Create one shipment from one order | Simplicity |
| **Batch creation** | Create multiple shipments at once | Efficiency |
| **Auto-creation** | Auto-create on order confirmation (future) | Automation |
| **Validation** | Validate order is ready for shipment | Accuracy |
| **Item selection** | Support partial shipment (ship available items) | Flexibility |
| **Weight auto-calc** | Auto-calculate total weight from items | Accuracy |

### 6.5 Shipment Assignment

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Manual assignment** | Admin selects courier and enters tracking | MVP |
| **Auto-assignment** | System suggests best courier based on rules | Future |
| **Reassignment** | Admin can reassign courier before pickup | Flexibility |
| **Batch assignment** | Assign courier to multiple shipments at once | Efficiency |
| **Assignment rules** | Rules for auto-assigning based on destination, weight | Future |

### 6.6 Courier Selection

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Supported couriers** | List of configured couriers | Configuration |
| **Availability** | Check courier availability for destination | Accuracy |
| **Rate comparison** | Compare rates across couriers | Cost optimization |
| **Performance data** | Show courier delivery success rate | Decision support |
| **Default courier** | Set default courier per zone | Efficiency |

### 6.7 Manual Tracking

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Status update** | Admin can manually update shipment status | MVP |
| **Bulk update** | Update multiple shipments at once | Efficiency |
| **Event notes** | Add notes to status updates | Context |
| **History visible** | All updates visible in shipment timeline | Audit |

### 6.8 Shipment Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **By tracking number** | Search by exact tracking number | Quick lookup |
| **By order number** | Search by order number | Quick lookup |
| **By customer** | Search by customer name or email | Customer service |
| **By status** | Filter by shipment status | Operational |
| **By date range** | Filter by creation or delivery date | Reporting |
| **By courier** | Filter by courier | Performance analysis |
| **Full-text** | Search across multiple fields | Flexibility |

### 6.9 Shipment Filters

| Filter | Type | Options | Rationale |
|--------|------|---------|-----------|
| **Status** | Multi-select | All shipment statuses | Operational |
| **Courier** | Multi-select | All configured couriers | Performance |
| **Date range** | Date picker | Created/Delivered date | Reporting |
| **Zone** | Multi-select | Metro, Tier 1, Tier 2, etc. | Geography |
| **Method** | Multi-select | Standard, Express, Same Day | Service level |
| **Value** | Range | Min/max order value | Risk |

### 6.10 Shipment History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Complete timeline** | Every status change logged | Audit trail |
| **Actor attribution** | Every change attributed to actor | Accountability |
| **Timestamps** | Every change timestamped | Temporal accuracy |
| **Export** | Export shipment history as CSV/PDF | Reporting |
| **Retention** | Shipment history retained for 7 years | Legal compliance |

### 6.11 Shipment Reports

| Report | Metrics | Frequency | Rationale |
|--------|---------|-----------|-----------|
| **Delivery performance** | On-time %, failed delivery %, avg delivery time | Daily | Courier evaluation |
| **Shipping cost analysis** | Cost per shipment, cost by zone, cost by method | Weekly | Cost optimization |
| **Exception report** | Failed deliveries, returns, delays | Daily | Issue resolution |
| **Courier comparison** | Performance by courier across all metrics | Monthly | Vendor management |
| **Zone analysis** | Delivery time and cost by zone | Monthly | Coverage planning |

---

## 7. Customer Experience

### 7.1 What

Standards for tracking page, shipment notifications, delivery updates, delivery timeline, failed delivery handling, and return shipment visibility.

### 7.2 Why

- **Trust:** Customers must always know where their order is.
- **Engagement:** Good shipping experience drives repeat purchases.
- **Support reduction:** Self-service tracking reduces support queries.
- **Brand:** Shipping is a key brand touchpoint.

### 7.3 Where

Order detail page, tracking page, email notifications, push notifications, SMS, in-app notifications.

### 7.4 Tracking Page

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **URL** | `/track/:orderNumber` (public, no login) | Guest support |
| **Authenticated** | `/account/orders/:orderId` (logged in) | Self-service |
| **Status badge** | Prominent current status at top | Immediate clarity |
| **Timeline** | Vertical timeline of all events | Visual clarity |
| **Map** | Map showing shipment journey (future) | Visual engagement |
| **Estimated delivery** | Prominent ETA display | Planning |
| **Courier info** | Courier name + tracking link | One-click |
| **Delivery proof** | Photo of delivery (if available) | Trust |
| **Mobile-optimized** | Full-screen on mobile | 70%+ mobile |

### 7.5 Shipment Notifications

| Event | Channel | Timing | Content |
|-------|---------|--------|---------|
| **Shipment created** | Email + Push | Immediate | "Your order is being prepared" |
| **Packed** | Email + Push | Immediate | "Your order is packed and ready" |
| **Picked up** | Email + Push + SMS | Immediate | "Your order is on its way" + tracking |
| **In transit** | Push | On update | "Your order is moving" |
| **Out for delivery** | Email + Push + SMS | Same day | "Your order is arriving today" |
| **Delivered** | Email + Push | Immediate | "Your order has been delivered" + review request |
| **Delivery failed** | Email + Push | Immediate | "Delivery attempt failed" + retry info |
| **Returned** | Email + Push | Immediate | "Your return has been received" |

### 7.6 Delivery Updates

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Real-time** | Updates within 5 minutes of courier event | Timeliness |
| **Push notifications** | Opt-in for delivery updates | Engagement |
| **Email updates** | Email for key milestones | Reliability |
| **SMS updates** | SMS for critical events (picked up, delivered) | Accessibility |
| **In-app updates** | Badge on order detail page | Visibility |

### 7.7 Delivery Timeline

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Visual timeline** | Vertical timeline with icons | Visual clarity |
| **Current status** | Highlighted at top | Immediate clarity |
| **Historical events** | All events in reverse chronological | Complete picture |
| **Location** | Show location for each event | Context |
| **Timestamp** | Show time for each event | Temporal clarity |
| **Descriptions** | Human-readable descriptions | Understanding |

### 7.8 Failed Delivery Handling

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Customer not available** | Re-attempt next business day | Customer convenience |
| **Wrong address** | Contact customer, hold for correction | Accuracy |
| **Refused** | Return to sender after 3 attempts | Business rule |
| **Damaged** | Return to sender, initiate refund + replacement | Customer protection |
| **Max attempts** | 3 attempts before return | Operational limit |
| **Customer reschedule** | Allow customer to reschedule delivery | Flexibility |
| **Address update** | Allow customer to update address before retry | Accuracy |

### 7.9 Return Shipment Visibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Return tracking** | Separate tracking for return shipments | Clarity |
| **Return status** | Visible on order detail page | Transparency |
| **Return timeline** | Timeline of return events | Visual clarity |
| **Refund timeline** | Show expected refund date | Planning |
| **Return label** | Pre-printed return label included | Convenience |
| **Pickup scheduling** | Customer selects pickup time slot | Convenience |

---

## 8. Order Integration

### 8.1 What

Integration standards between shipping and orders, returns, refunds, finance, notifications, and documents.

### 8.2 Why

- **Coherence:** Shipping must work seamlessly with other modules.
- **Accuracy:** Data must be consistent across modules.
- **Automation:** Status changes in one module trigger actions in others.
- **Auditability:** Cross-module actions must be traceable.

### 8.3 Where

Order creation, order status updates, return flow, refund processing, invoice generation, notification dispatch.

### 8.4 Order ↔ Shipment Integration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Order creation** | Order created with shipping method selection | Checkout |
| **Shipment creation** | Shipment created when order is ready to ship | Fulfillment |
| **Status sync** | Shipment status updates reflected on order | Transparency |
| **Split shipment** | One order can have multiple shipments | Future-proof |
| **Partial shipment** | Ship available items first, backorder rest | Flexibility |
| **Order completion** | Order completes when all shipments delivered | Lifecycle |

**Order Status ↔ Shipment Status Mapping:**

| Order Status | Shipment Status | Relationship |
|--------------|-----------------|--------------|
| `accepted` | `shipment_created` | Order accepted, shipment created |
| `packing` | `ready_to_pack` | Order being packed |
| `ready_to_ship` | `packed`, `ready_for_pickup` | Packed, awaiting courier |
| `shipped` | `picked_up`, `in_transit`, `out_for_delivery` | In courier hands |
| `delivered` | `delivered` | Successfully delivered |
| `completed` | `closed` | Shipment complete |

### 8.5 Returns ↔ Shipment Integration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Return shipment** | Return creates a new shipment (reverse logistics) | Tracking |
| **Return pickup** | Courier scheduled for return pickup | Automation |
| **Return tracking** | Customer can track return shipment | Transparency |
| **Return received** | Return shipment status updates trigger refund | Automation |
| **Return condition** | Verify item condition at return pickup | Quality |

### 8.6 Refunds ↔ Shipment Integration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Failed delivery refund** | Auto-initiate refund on return_to_sender | Automation |
| **Return refund** | Refund triggered when return shipment delivered | Automation |
| **Shipping cost refund** | Refund shipping cost for failed delivery | Customer protection |
| **Partial refund** | Support partial refund for partial return | Flexibility |
| **Refund timeline** | 5-7 business days after return received | Bank processing |

### 8.7 Finance ↔ Shipment Integration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Shipping cost tracking** | Track shipping cost per shipment | Cost analysis |
| **Revenue recognition** | Revenue recognized on delivery | Accounting |
| **Cost allocation** | Allocate shipping cost to order | Financial accuracy |
| **COD collection** | Track COD collection on delivery | Cash flow |
| **Shipping expense** | Track courier charges for cost analysis | Margin analysis |

### 8.8 Notifications ↔ Shipment Integration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Event-driven** | Shipment events trigger notifications | Automation |
| **Multi-channel** | Email + Push + SMS based on event | Reach |
| **Template-driven** | Notification content from templates | Consistency |
| **Preference-aware** | Respect customer notification preferences | UX |
| **Opt-out** | Allow customers to opt out of non-critical notifications | Respect |

### 8.9 Documents ↔ Shipment Integration

| Document | Generated When | Content | Audience |
|----------|---------------|---------|----------|
| **Packing slip** | On packing | Order items, quantities | Customer |
| **Shipping label** | On courier assignment | Address, tracking, barcode | Courier |
| **Invoice** | On delivery | Tax invoice, order details | Customer |
| **Return label** | On return approval | Return address, tracking | Customer |
| **Delivery proof** | On delivery | Photo, signature, timestamp | Admin |

---

## 9. Notifications Architecture

### 9.1 What

Notification events for every shipment lifecycle milestone — creation, packing, pickup, transit, delivery, failure, and return.

### 9.2 Why

- **Customer experience:** Timely notifications build trust.
- **Operational efficiency:** Automated notifications reduce support queries.
- **Engagement:** Notifications drive customer actions.
- **Compliance:** Certain notifications are legally required.

### 9.3 Where

Email (Resend), push notifications, in-app notifications, SMS (future), WhatsApp (future).

### 9.4 Notification Events

| Event | Customer | Shop Owner | Admin | Channel |
|-------|----------|------------|-------|---------|
| **shipment_created** | ✓ | ✓ | ✓ | Email + Push |
| **packed** | ✓ | ✗ | ✗ | Email + Push |
| **picked_up** | ✓ | ✓ | ✓ | Email + Push + SMS |
| **in_transit** | ✓ | ✗ | ✗ | Push |
| **out_for_delivery** | ✓ | ✗ | ✗ | Email + Push + SMS |
| **delivered** | ✓ | ✓ | ✓ | Email + Push |
| **delivery_failed** | ✓ | ✓ | ✓ | Email + Push |
| **exception** | ✓ | ✓ | ✓ | Email + Push |
| **returned_to_sender** | ✓ | ✓ | ✓ | Email + Push |
| **return_picked_up** | ✓ | ✗ | ✗ | Email + Push |

### 9.5 Notification Timing

| Event | Timing | Rationale |
|-------|--------|-----------|
| **shipment_created** | Immediate | Customer confirmation |
| **packed** | Immediate | Customer update |
| **picked_up** | Immediate | Customer update + tracking |
| **in_transit** | On each scan | Transparency |
| **out_for_delivery** | Same day morning | Customer preparation |
| **delivered** | Immediate | Customer confirmation |
| **delivery_failed** | Immediate | Customer action required |
| **exception** | Immediate | Customer awareness |
| **returned_to_sender** | Immediate | Customer update + refund info |
| **return_picked_up** | Immediate | Customer confirmation |

### 9.6 Notification Content Standards

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Personalization** | Use customer name | Engagement |
| **Order reference** | Include order number | Clarity |
| **Tracking number** | Include tracking number | Convenience |
| **Tracking link** | Direct link to tracking page | One-click |
| **ETA** | Include estimated delivery date | Planning |
| **Action required** | Clearly state if action needed | Guidance |
| **Next steps** | Explain what happens next | Transparency |
| **Contact info** | Include support contact | Helpfulness |
| **Unsubscribe** | One-click unsubscribe for non-critical | Compliance |
| **Mobile-optimized** | Responsive email templates | 70%+ mobile |

---

## 10. Permissions Architecture

### 10.1 What

Comprehensive permission matrix for shipment-related actions across Customer, Shop Owner, and Admin roles.

### 10.2 Why

- **Security:** Users can only perform actions within their role.
- **Data isolation:** Shop owners cannot see each other's shipments.
- **Compliance:** Logistics actions require appropriate authorization.
- **Integrity:** Status transitions are controlled by role.

### 10.3 Where

Every shipment API endpoint, shipment detail page, shipment listing, admin dashboard.

### 10.4 View Permissions

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| **View own shipments** | ✓ | ✓ (their products) | ✓ (all) |
| **View shipment details** | Own only | Orders with their products | All |
| **View tracking events** | Own only | Orders with their products | All |
| **View delivery proof** | Own only | Orders with their products | All |
| **View shipment history** | Own only | Orders with their products | All |
| **View shipping address** | Own only | Masked (city/state only) | Full |
| **View courier info** | Own only | Orders with their products | All |

### 10.5 Edit Permissions

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| **Create shipment** | ✗ | ✓ (their orders) | ✓ (all) |
| **Assign courier** | ✗ | ✓ (their orders) | ✓ (all) |
| **Update tracking number** | ✗ | ✓ (their orders) | ✓ (all) |
| **Update shipment status** | ✗ | ✗ | ✓ (all) |
| **Cancel shipment** | ✗ | ✗ | ✓ (all) |
| **Reassign courier** | ✗ | ✗ | ✓ (all) |
| **Add shipment note** | ✗ | ✓ | ✓ |
| **Override delivery proof** | ✗ | ✗ | ✓ |

### 10.6 Status Update Permissions

| Transition | Customer | Shop Owner | Admin |
|------------|----------|------------|-------|
| **shipment_created → ready_to_pack** | ✗ | ✓ | ✓ |
| **ready_to_pack → packed** | ✗ | ✓ | ✓ |
| **packed → ready_for_pickup** | ✗ | ✓ | ✓ |
| **ready_for_pickup → picked_up** | ✗ | ✓ (manual) | ✓ |
| **picked_up → in_transit** | ✗ | ✗ | ✓ (manual) |
| **in_transit → out_for_delivery** | ✗ | ✗ | ✓ (manual) |
| **out_for_delivery → delivered** | ✗ | ✗ | ✓ (manual) |
| **delivery_failed → out_for_delivery** | ✗ | ✗ | ✓ |
| **delivery_failed → returned_to_sender** | ✗ | ✗ | ✓ |
| **Any → exception** | ✗ | ✗ | ✓ |

### 10.7 Permission Enforcement

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Server-side** | All permission checks server-side | Security |
| **Middleware** | Auth + role check in middleware | Consistency |
| **RLS** | Row-Level Security on shipment tables | Data isolation |
| **Handler validation** | Each handler validates actor permissions | Defense in depth |
| **Client-side** | UI hides unavailable actions | UX (not security) |
| **Audit** | Permission failures logged | Security monitoring |

---

## 11. Performance Architecture

### 11.1 What

Standards for large shipment volume handling, tracking synchronization, background processing, queue readiness, and courier synchronization.

### 11.2 Why

- **Scale:** Architecture must handle 0 to 100,000+ shipments per day.
- **Speed:** Tracking updates must be near real-time.
- **Reliability:** Background processing must not lose data.
- **Efficiency:** Bulk operations must not block individual operations.

### 11.3 Where

API handlers, database queries, background jobs, admin dashboard, tracking sync.

### 11.4 Large Shipment Volume Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Pagination** | Offset-based pagination for shipment lists | Performance |
| **Indexing** | Composite indexes on common query patterns | Query speed |
| **Query optimization** | Use `select` to fetch only needed fields | Network efficiency |
| **Connection pooling** | Hyperdrive for connection pooling | Edge compatibility |
| **Archival** | Move old shipments to archive table | Performance |

### 11.5 Tracking Synchronization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Webhook-first** | Courier webhooks update tracking in real-time | Speed |
| **Polling fallback** | Poll courier API every 30 minutes for active shipments | Reliability |
| **Batch polling** | Batch multiple tracking numbers in one API call | Efficiency |
| **Deduplication** | Don't create duplicate events from webhook + polling | Accuracy |
| **Event ordering** | Ensure events are ordered by timestamp | Consistency |
| **Stale detection** | Flag shipments with no updates for 48 hours | Monitoring |

### 11.6 Background Processing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Pattern** | Async job queue (Cloudflare Queues in future) | Scalability |
| **Retry** | Exponential backoff (1s, 2s, 4s, 8s) | Resilience |
| **Max retries** | 3 attempts per job | Prevent infinite loops |
| **Dead letter** | Failed jobs moved to dead letter queue | Debugging |
| **Monitoring** | Log all job completions and failures | Observability |
| **Idempotency** | Jobs must be idempotent | Safety |

### 11.7 Queue Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Interface** | Define queue interface before implementation | Future-proofing |
| **Event-driven** | Status changes emit events | Loose coupling |
| **Consumer pattern** | Consumers process events independently | Scalability |
| **Ordering** | Per-shipment ordering guaranteed | Consistency |
| **Durability** | Events persisted to database | Reliability |

### 11.8 Courier Synchronization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Webhook registration** | Register webhooks with courier on shipment creation | Automation |
| **Webhook verification** | Verify webhook signatures | Security |
| **Batch sync** | Sync multiple shipments in one API call | Efficiency |
| **Rate limiting** | Respect courier API rate limits | Compliance |
| **Error handling** | Retry on courier API failures | Resilience |
| **Fallback** | Manual update if courier API unavailable | MVP |

---

## 12. Security Architecture

### 12.1 What

Standards for shipment integrity, tracking validation, permission enforcement, audit logging, and secure courier communication.

### 12.2 Why

- **Integrity:** Shipment data must be accurate and tamper-proof.
- **Privacy:** Customer address and tracking data must be protected.
- **Compliance:** Logistics data must meet regulatory requirements.
- **Trust:** Security breaches destroy customer confidence.

### 12.3 Where

Every shipment API endpoint, tracking page, webhook handler, courier integration.

### 12.4 Shipment Integrity

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Immutability** | Tracking events are append-only | Audit trail |
| **Validation** | Server validates all status transitions | Integrity |
| **Idempotency** | Duplicate webhook events don't create duplicates | Safety |
| **Concurrent protection** | Optimistic locking on status updates | Consistency |
| **Soft delete** | No hard deletes on shipment data | Data integrity |

### 12.5 Tracking Validation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Format validation** | Validate tracking number format per courier | Accuracy |
| **Courier verification** | Verify tracking number exists with courier | Security |
| **Event verification** | Verify webhook events are from registered couriers | Security |
| **Signature verification** | Verify webhook signatures | Security |
| **Rate limiting** | Rate limit tracking page access | Abuse prevention |

### 12.6 Permission Enforcement

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Middleware auth** | Every endpoint authenticated | Security |
| **Role check** | Every endpoint checks role authorization | Security |
| **RLS** | Row-Level Security on shipment tables | Data isolation |
| **Handler validation** | Each handler validates actor permissions | Defense in depth |
| **Address masking** | Mask customer address for shop owners | Privacy |
| **Audit** | Permission failures logged | Security monitoring |

### 12.7 Audit Logging

| Event | Logged Data | Rationale |
|-------|-------------|-----------|
| **Shipment created** | orderId, actorId, courier, timestamp | Business event |
| **Status changed** | shipmentId, fromStatus, toStatus, actorId, reason | Lifecycle |
| **Tracking updated** | shipmentId, trackingNumber, events, source | Tracking |
| **Delivery confirmed** | shipmentId, proof, timestamp | Delivery |
| **Exception logged** | shipmentId, exceptionType, details | Operations |
| **Manual override** | shipmentId, actorId, reason, previousStatus | Security |

### 12.8 Secure Courier Communication

| Rule | Standard | Rationale |
|------|----------|-----------|
| **API keys** | Store courier API keys in environment variables | Security |
| **HTTPS only** | All courier communication over HTTPS | Encryption |
| **Webhook secrets** | Verify webhook signatures | Authentication |
| **Rate limiting** | Respect courier API rate limits | Compliance |
| **Data minimization** | Send only required data to couriers | Privacy |
| **Logging** | Log courier API requests/responses (excluding secrets) | Debugging |

---

## 13. Accessibility Architecture

### 13.1 What

WCAG 2.2 AA compliance standards for every shipment management and tracking component — keyboard support, screen readers, touch accessibility, and focus management.

### 13.2 Why

- **Legal compliance:** Meet accessibility laws.
- **Inclusivity:** Everyone can track and manage shipments.
- **Quality:** Accessible code is better code.
- **Revenue:** Accessible tracking converts more.

### 13.3 Where

Tracking page, shipment management, order detail page, notifications.

### 13.4 Mobile Tracking

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Full-width layout** | Tracking page fills mobile screen | Readable |
| **Large status badge** | Current status prominent | Immediate clarity |
| **Vertical timeline** | Timeline scrolls vertically | Natural scroll |
| **Touch-friendly** | 44x44px minimum touch targets | Ease of use |
| **One-tap tracking copy** | Copy tracking number with one tap | Convenience |
| **Deep link** | Link to courier tracking app | One-click |

### 13.5 Responsive Shipment Management

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Shipment list** | Full-width cards on mobile | Readable |
| **Shipment detail** | Stacked, single-column | Simple |
| **Filters** | Bottom sheet on mobile | Thumb-friendly |
| **Bulk actions** | Swipe to select on mobile | Touch-friendly |
| **Status update** | Bottom sheet for status changes | Thumb-friendly |

### 13.6 Keyboard Support

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical, follows visual flow | Intuitive |
| **Focus visible** | Clear focus ring (brand-500) | Orientation |
| **No keyboard trap** | Always able to escape | Recovery |
| **Enter to submit** | Enter submits forms | Efficiency |
| **Escape to close** | ESC closes modals/sheets | Recovery |
| **Arrow keys** | Navigate within timeline | Familiar |
| **Skip link** | "Skip to main content" | Efficiency |

### 13.7 Screen Reader Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic HTML** | `<nav>`, `<main>`, `<button>`, `<form>` | Meaning |
| **ARIA landmarks** | Label regions | Navigation |
| **Form labels** | Associated with inputs | Understanding |
| **Error association** | `aria-describedby` for errors | Clarity |
| **Live regions** | `aria-live` for tracking updates | Updates |
| **Status announcements** | "Shipment status updated" announced | Feedback |
| **Headings** | Proper H1-H6 hierarchy | Navigation |

---

## 14. Future Readiness Architecture

### 14.1 What

Architecture standards for future logistics features — multi-courier routing, shipping automation, AI delivery prediction, delivery optimization, international logistics, warehouse routing, and delivery scheduling.

### 14.2 Why

- **Scalability:** New features extend without redesign.
- **Competitiveness:** Ready for market demands.
- **Innovation:** Architecture supports experimentation.
- **Investment:** Future-proof development effort.

### 14.3 Where

New features, extensions, integrations.

### 14.4 Multi-Courier Routing

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Courier abstraction** | Interface for all courier integrations | Consistency |
| **Rate comparison** | Compare rates across couriers in real-time | Cost optimization |
| **Performance routing** | Route based on courier delivery performance | Quality |
| **Cost routing** | Route based on cheapest option | Savings |
| **Zone routing** | Route based on courier zone coverage | Coverage |
| **Fallback routing** | Automatic fallback if primary courier unavailable | Resilience |

### 14.5 Shipping Automation

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Auto-create shipment** | Shipment created automatically on order confirmation | Automation |
| **Auto-assign courier** | System selects best courier based on rules | Efficiency |
| **Auto-generate label** | Labels generated via courier API | Efficiency |
| **Auto-sync tracking** | Tracking synced via webhooks | Automation |
| **Auto-retry delivery** | Failed deliveries auto-retried | Automation |
| **Auto-return** | After max attempts, auto-initiate return | Automation |

### 14.6 AI Delivery Prediction

| Element | Standard | Rationale |
|---------|----------|-----------|
| **ETA prediction** | ML-based delivery time prediction | Accuracy |
| **Delay prediction** | Predict delays before they happen | Proactive |
| **Route optimization** | AI-optimized delivery routes | Efficiency |
| **Demand forecasting** | Predict shipment volume for planning | Operations |
| **Anomaly detection** | Detect unusual shipment patterns | Security |

### 14.7 Delivery Optimization

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Route optimization** | Optimize delivery routes for efficiency | Cost |
| **Batch delivery** | Group deliveries by area | Efficiency |
| **Time slot delivery** | Customer-selected delivery windows | Convenience |
| **Delivery instructions** | Customer-provided delivery notes | Accuracy |
| **Photo verification** | Photo proof of delivery | Trust |
| **Contactless delivery** | Contactless delivery option | Safety |

### 14.8 International Logistics

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Multi-currency** | Support multiple currencies | Global |
| **Customs automation** | Auto-generate customs declarations | Logistics |
| **Duty calculation** | Calculate import duties automatically | Accuracy |
| **International tracking** | Unified tracking across borders | Visibility |
| **Restricted items** | Block prohibited items by destination | Compliance |
| **Return logistics** | International return handling | Customer service |

### 14.9 Warehouse Routing

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Multi-warehouse** | Support multiple warehouse locations | Scalability |
| **Nearest warehouse** | Route to nearest warehouse by customer location | Speed |
| **Stock per warehouse** | Inventory tracked per warehouse | Accuracy |
| **Fulfillment routing** | Auto-route to optimal fulfillment center | Efficiency |
| **Warehouse transfer** | Support inter-warehouse transfers | Flexibility |

### 14.10 Delivery Scheduling

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Time slot selection** | Customer selects delivery time slot | Convenience |
| **Same-day delivery** | Order before 2 PM, delivered same day | Premium |
| **Next-day delivery** | Order before 8 PM, delivered next day | Premium |
| **Weekend delivery** | Weekend delivery option | Convenience |
| **Scheduled delivery** | Customer picks specific date | Planning |
| **Recurring delivery** | Subscription delivery scheduling | Future |

---

## 15. Mandatory Rules for AI Agents

### 15.1 What

Hard rules that every AI agent must follow when designing, implementing, or reviewing shipping, delivery, and logistics features.

### 15.2 Why

- **Consistency:** No exceptions to the rules.
- **Quality:** Every interaction meets the standard.
- **Revenue:** Shipping directly affects customer satisfaction and revenue.

### 15.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Shipment independent from order** | Shipment is a separate entity | Tight coupling |
| **Tracking history immutable** | Tracking events never modified or deleted | Lost audit trail |
| **Every shipment auditable** | Every action logged with actor + timestamp | No accountability |
| **Customer always has visibility** | Customer can see shipment status at all times | Lost trust |
| **Manual shipping works today** | Admin can manage without courier API | MVP blocked |
| **Courier API ready tomorrow** | Architecture supports multiple couriers | Redesign needed |
| **Loose coupling** | Logistics module independent from order engine | Tight coupling |
| **Enterprise-scale** | Handles high volume without degradation | Performance issues |
| **Mobile-first** | Design for 375px, enhance upward | 70%+ mobile |
| **Secure** | Every request validated server-side | Security |
| **Transparent** | Status always visible to customer | Trust |
| **Idempotent** | Duplicate webhooks don't create duplicates | Data corruption |
| **Soft delete** | No hard deletes on shipment data | Data integrity |
| **Accessibility** | WCAG 2.2 AA compliance | Inclusivity |
| **No comments** | Code must be self-documenting | Code rot |
| **Max file length** | 300 lines per file | Maintainability |
| **Max handler length** | 150 lines per handler | Focus |
| **Named exports only** | No default exports | Refactoring |
| **No barrel files** | Direct imports only | Tree-shaking |

### 15.4 Agent Decision Framework

When implementing any shipping, delivery, or logistics feature, agent must ask:

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
11. **Is this future-proof?** — Will this support multiple couriers?
12. **Is this independent from order?** — Does shipment logic stay separate?

### 15.5 Implementation Checklist

Before shipping any logistics feature:

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
- [ ] Customer notified
- [ ] Shop owner notified (if relevant)
- [ ] Admin notified (if relevant)
- [ ] Tracking events logged
- [ ] Webhook idempotency verified
- [ ] Courier API error handling tested
- [ ] No hardcoded courier names
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
- [ ] Shipment independent from order
- [ ] Tracking history immutable

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
