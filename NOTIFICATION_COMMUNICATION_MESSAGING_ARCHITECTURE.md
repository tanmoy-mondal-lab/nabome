# নবME (Nabome) — Notification, Communication & Messaging Engine Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for notification, communication, messaging, event delivery, templates, and delivery lifecycle  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), API_SERVICE_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), FINANCE_ENGINE_ARCHITECTURE.md (v1.0), SHOP_OWNER_DASHBOARD_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Communication Foundation](#1-communication-foundation)
2. [Notification Engine](#2-notification-engine)
3. [Event System](#3-event-system)
4. [Notification Lifecycle](#4-notification-lifecycle)
5. [Internal Messaging](#5-internal-messaging)
6. [Templates](#6-templates)
7. [Delivery](#7-delivery)
8. [User Preferences](#8-user-preferences)
9. [Search & History](#9-search--history)
10. [Permissions](#10-permissions)
11. [Performance](#11-performance)
12. [Security](#12-security)
13. [Accessibility](#13-accessibility)
14. [Future Readiness](#14-future-readiness)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Communication Foundation

### 1.1 What

The foundational principles, lifecycle, ownership model, and architectural guarantees that govern every piece of communication across the Nabome platform — from transactional emails to internal admin-shop conversations.

### 1.2 Why

- **Trust:** Users trust platforms that communicate clearly, timely, and reliably.
- **Operations:** Business events must reach the correct stakeholder through the correct channel without manual intervention.
- **Compliance:** Financial, security, and regulatory events require immutable communication records.
- **Scalability:** Communication architecture must handle 0 to 1M+ users without redesign.
- **Independence:** Communication is infrastructure — it must never be coupled to business modules.

### 1.3 Where

Every notification, email, in-app message, system alert, conversation thread, and broadcast across the entire Nabome platform.

### 1.4 Communication Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Event-driven** | Every communication is triggered by a business event | No manual sending for routine events |
| **Timely** | Notifications arrive within seconds of the triggering event | User expectation for real-time |
| **Meaningful** | Every notification contains actionable or informational value | Prevent notification fatigue |
| **Non-intrusive** | Notifications inform, never interrupt unsolicited | Respect user attention |
| **Trustworthy** | Notifications are accurate, consistent, and verifiable | Platform credibility |
| **Permanent record** | Every notification has a permanent ID and is never silently lost | Auditability, debugging |
| **Channel-agnostic** | Event system is independent of delivery channel | Easy to add SMS, Push, WhatsApp |
| **User-controlled** | Users configure what they receive and how | Personalization, compliance |
| **Language-aware** | Notifications support localization | Future multi-language readiness |

### 1.5 Communication Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMMUNICATION LIFECYCLE                         │
│                                                                  │
│  1. BUSINESS EVENT                                                │
│     → Order placed │ Password reset │ Settlement processed       │
│     → System announcement │ Security alert                        │
│                                                                  │
│  2. EVENT DISPATCH                                                │
│     → Event emitter fires                                        │
│     → Event metadata attached (actor, resource, context)          │
│     → Event persisted to event_outbox (at-least-once delivery)    │
│                                                                  │
│  3. NOTIFICATION RESOLUTION                                       │
│     → Template selected based on event type                      │
│     → Recipients resolved (role-based + preference-based)         │
│     → Channels determined (email, in-app, future SMS/push)       │
│     → Dynamic variables injected from event data                  │
│                                                                  │
│  4. DELIVERY                                                      │
│     → In-app: written to notification table                      │
│     → Email: queued via delivery queue (Resend)                  │
│     → SMS: queued via delivery queue (future Twilio)             │
│     → Push: queued via delivery queue (future Firebase)          │
│                                                                  │
│  5. LIFECYCLE MANAGEMENT                                          │
│     → Status tracked: created → queued → delivered → read        │
│     → Retry on failure (exponential backoff, max 3)              │
│     → Dead letter queue for permanently failed notifications     │
│     → Archive after retention period                              │
│                                                                  │
│  6. USER INTERACTION                                              │
│     → Read receipt                                               │
│     → Archive / Delete                                           │
│     → Preference update                                          │
│     → Conversation reply (internal messaging)                    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Notification Ownership

| Entity | Owner | Location |
|--------|-------|----------|
| Notification engine | Communication domain | `api/_lib/notifications/` |
| Notification events | Business domains | `api/_lib/events/` |
| Email service | Communication domain | `api/_lib/email/` |
| Template engine | Communication domain | `api/_lib/templates/` |
| Delivery queue | Communication domain | `api/_lib/queue/` |
| User preferences | Auth domain | `api/_lib/auth/preferences.ts` |
| Frontend notification UI | Global shell | `src/components/notifications/` |
| Admin notification panel | Admin feature | `src/features/admin/notifications/` |
| Shop notification panel | Shop feature | `src/features/shop/notifications/` |
| Internal messaging | Shared feature | `src/features/messaging/` |

### 1.7 Message Ownership

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Notification message** | Owned by Communication Engine | Independent from business |
| **Conversation message** | Owned by Messaging System | Part of internal communication |
| **System alert** | Owned by System Administration | Platform-wide communication |
| **Marketing message** | Owned by Marketing Engine | Campaign-based communication |
| **Template** | Owned by Template Engine | Shared across channels |

### 1.8 Delivery Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DELIVERY ARCHITECTURE                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   EVENT SOURCES                           │   │
│  │                                                           │   │
│  │  Auth │ Orders │ Products │ Finance │ System │ CMS │      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               EVENT DISPATCH LAYER                        │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │ Event Emitter│  │Event Outbox  │  │Event Resolver  │  │   │
│  │  │             │  │ (DB-backed)   │  │                │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               NOTIFICATION RESOLUTION                     │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │  Template    │  │  Recipient   │  │   Channel      │  │   │
│  │  │  Selector    │  │  Resolver    │  │   Router       │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               DELIVERY CHANNELS                           │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ In-App   │  │  Email   │  │   SMS    │  │   Push   ││   │
│  │  │ (DB)     │  │ (Resend) │  │ (Future) │  │ (Future) ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               DELIVERY MANAGEMENT                         │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │   Queue     │  │   Retry      │  │  Dead Letter   │  │   │
│  │  │  Processor  │  │   Manager    │  │    Queue       │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.9 Event-Driven Communication

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Emitter pattern** | Events emitted from business handlers via service calls | Decoupled, testable |
| **Outbox pattern** | Events written to database before dispatch | At-least-once delivery guarantee |
| **Consumer pattern** | Notification service consumes events asynchronously | Non-blocking, reliable |
| **Idempotency** | Each event has unique eventId; consumers are idempotent | Prevent duplicate notifications |
| **Ordering** | Events processed in insertion order per event type | Consistent state transitions |
| **Dead letter** | Failed events moved to DLQ after max retries | Manual intervention possible |

### 1.10 Communication Consistency

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Single source of truth** | Notification table is the source of truth for delivery state | No ambiguity |
| **Eventual consistency** | In-app notifications are consistent; email may lag | Practical reliability |
| **No silent loss** | Failed notifications are logged, retried, and escalated | Zero data loss |
| **Audit trail** | Every notification delivery attempt is logged | Compliance |
| **Idempotent delivery** | Same event produces same notification (dedup by eventId) | Prevent noise |

### 1.11 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Synchronous email sending in request handler | Blocks user, timeout risk | Async via delivery queue |
| Hardcoded notification recipients | Breaks on role changes | Resolve recipients dynamically |
| Silent failure on email delivery | User never learns about event | Log + retry + DLQ + alert |
| Mixing notification logic with business handlers | Tight coupling, untestable | Emit event, let notification service handle |
| No event outbox | Lost notifications on crash | DB-backed outbox for durability |
| Storing notification content in code | Can't localize or customize | Template engine with variables |
| One notification per database row with no ID | Can't track, debug, or reference | Permanent Notification ID |

---

## 2. Notification Engine

### 2.1 What

The centralized engine responsible for receiving business events, resolving recipients, selecting templates, and dispatching notifications across all channels — in-app, email, and future SMS/push.

### 2.2 Why

- **Consistency:** Every notification follows the same lifecycle regardless of channel
- **Reliability:** No notification is lost — event outbox ensures at-least-once delivery
- **Extensibility:** Adding a new channel (SMS, Push, WhatsApp) requires only a new adapter
- **Testability:** Notification logic is isolated from business logic
- **Maintainability:** Template changes don't affect business code

### 2.3 Where

`api/_lib/notifications/` — notification engine core, event processing, channel adapters, template resolution.

### 2.4 Notification Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION ENGINE                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  NOTIFICATION CATEGORIES                   │   │
│  │                                                           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │   │
│  │  │  Website   │ │   Email    │ │   System   │           │   │
│  │  │ (In-App)   │ │ (Resend)   │ │ (Alerts)   │           │   │
│  │  └────────────┘ └────────────┘ └────────────┘           │   │
│  │                                                           │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │   │
│  │  │  Business  │ │  Security  │ │ Marketing  │           │   │
│  │  │ (Order,    │ │ (Auth,     │ │ (Campaign, │           │   │
│  │  │  Finance)  │ │  Access)   │ │  Promo)    │           │   │
│  │  └────────────┘ └────────────┘ └────────────┘           │   │
│  │                                                           │   │
│  │  ┌────────────┐ ┌────────────┐                            │   │
│  │  │   SMS      │ │   Push     │  (Future)                  │   │
│  │  │ (Twilio)   │ │ (Firebase) │                            │   │
│  │  └────────────┘ └────────────┘                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  CHANNEL ADAPTERS                          │   │
│  │                                                           │   │
│  │  IEmailChannel │ ISmsChannel │ IPushChannel │ IInAppChannel│   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Website Notifications (In-App)

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Storage** | `Notification` table in PostgreSQL | Persistent, queryable |
| **Delivery** | Written to DB on event, read by frontend on polling/WebSocket | Reliable |
| **Real-time** | Frontend polls every 30s or uses future WebSocket | Near-real-time |
| **Unread count** | Badge count in top bar (global), sidebar (per dashboard) | At-a-glance |
| **Notification center** | Dedicated page/modal with full history | Complete view |
| **Bulk actions** | Mark all as read, archive selected, delete selected | Efficiency |
| **Filtering** | Filter by category (order, security, system, marketing) | Organization |
| **Deep linking** | Each notification links to relevant entity | Context |

### 2.6 Email Notifications

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Provider** | Resend (transactional email) | Reliable, API-first |
| **Templates** | React Email components | Type-safe, previewable |
| **From address** | `noreply@nabome.online` (transactional), `hello@nabome.online` (marketing) | Brand trust |
| **Subject line** | Clear, action-oriented, personalized | Open rate optimization |
| **HTML + Text** | Both HTML and plain text fallback | Accessibility |
| **Unsubscribe** | One-click unsubscribe in all marketing emails | CAN-SPAM compliance |
| **Bounce handling** | Log bounces, mark invalid emails | Deliverability |
| **Rate limiting** | Max 500 emails/hour per account (configurable) | Abuse prevention |

### 2.7 System Notifications

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Platform announcements** | Broadcast to all users or role-specific | Communication |
| **Maintenance alerts** | Pre-announced, scheduled maintenance windows | Expectation setting |
| **System health** | Internal alerts for degraded performance | Operations |
| **Deployment notifications** | Notify admin team of deployments | Operations |
| **Emergency alerts** | Critical security or outage notifications | Urgency |

### 2.8 Business Notifications

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Order events** | Customer + Shop Owner + Admin notified per event matrix | Stakeholder awareness |
| **Finance events** | Settlement, refund, commission notifications | Financial transparency |
| **Inventory events** | Low stock, out of stock, restock alerts | Operational efficiency |
| **Product events** | Published, rejected, flagged notifications | Quality control |
| **Return events** | Return requested, approved, rejected, completed | Workflow continuity |

### 2.9 Security Notifications

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Login notifications** | New device, new location, suspicious activity | Account security |
| **Password changes** | Confirmation on password reset/change | Security verification |
| **Account changes** | Email change, role change, profile update | Security awareness |
| **Permission changes** | Admin role assignment, access revoked | Access control |
| **Failed login attempts** | Alert after 3+ failed attempts | Brute force detection |
| **API key events** | Key created, rotated, revoked | API security |

### 2.10 Marketing Notifications

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Welcome series** | 3-email welcome sequence for new customers | Engagement |
| **Promotional** | Sale announcements, new arrivals, seasonal campaigns | Revenue |
| **Abandoned cart** | 1-email reminder for abandoned carts (24h delay) | Conversion |
| **Re-engagement** | Win-back campaign for inactive customers (30 days) | Retention |
| **Review request** | Product review prompt 24h after delivery | Social proof |
| **Referral** | Referral program invitation | Growth |
| **Frequency cap** | Max 3 marketing emails per week per user | Prevent fatigue |

### 2.11 Future SMS

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Provider** | Twilio (future) | Industry standard |
| **Use cases** | OTP, delivery updates, critical security alerts only | High value, low noise |
| **Rate limit** | Max 5 SMS per day per user | Prevent spam |
| **Opt-in** | Explicit SMS consent required | Compliance (TRAI) |
| **Character limit** | 160 characters standard, 1600 concatenated | SMS standard |
| **Sender ID** | "NABOME" registered sender ID | Brand recognition |

### 2.12 Future Push Notifications

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Provider** | Firebase Cloud Messaging (FCM) | Free, reliable |
| **Use cases** | Order updates, flash sales, price drops, back-in-stock | Engagement |
| **Permission** | Explicit browser permission required | Browser policy |
| **Frequency** | Max 5 push notifications per day | Prevent fatigue |
| **Rich media** | Support images, action buttons | Engagement |
| **Deep link** | Push notification opens relevant page | Context |

---

## 3. Event System

### 3.1 What

The complete catalog of business events that automatically trigger notifications, the metadata attached to each event, and the resolution rules for recipients and channels.

### 3.2 Why

- **Completeness:** Every important business event has a corresponding notification
- **Consistency:** Events follow a standard structure and resolution pattern
- **Traceability:** Every notification can be traced back to its originating event
- **Extensibility:** New events are added by defining the event and template

### 3.3 Where

`api/_lib/events/` — event definitions, emitters, and consumers.

### 3.4 Event Structure

```typescript
// ✓ CORRECT: Standard event structure
interface BusinessEvent {
  eventId: string;          // Permanent unique ID (UUID)
  eventType: string;        // e.g., 'order.created', 'auth.password_reset'
  timestamp: Date;          // UTC timestamp
  actor: {
    id: string;             // User ID who triggered the event
    role: UserRole;         // customer | shopOwner | admin | system
    email: string;          // Actor email for direct communication
  };
  resource: {
    type: string;           // e.g., 'order', 'product', 'settlement'
    id: string;             // Resource ID
    data: Record<string, unknown>;  // Snapshot of relevant data
  };
  context: {
    ip?: string;            // Actor IP (security events)
    userAgent?: string;     // Actor device (security events)
    shopId?: string;        // Shop context (multi-tenant)
    channel?: string;       // Requested delivery channel
  };
  metadata: Record<string, unknown>;  // Event-specific additional data
}
```

### 3.5 Event Categories & Recipients

| Event Type | Category | Recipients | Channels | Priority |
|------------|----------|------------|----------|----------|
| `auth.registered` | Security | Customer | Email (welcome) + In-App | Normal |
| `auth.login` | Security | Customer | In-App (suspicious only) | Low |
| `auth.login_new_device` | Security | Customer | Email + In-App | High |
| `auth.password_reset` | Security | Customer | Email | Urgent |
| `auth.password_changed` | Security | Customer | Email + In-App | High |
| `auth.email_changed` | Security | Customer | Email (both addresses) | High |
| `auth.role_changed` | Security | Customer/Shop Owner | Email + In-App | High |
| `order.created` | Business | Customer + Shop Owner | Email + In-App | High |
| `order.payment_confirmed` | Business | Customer + Shop Owner + Admin | Email + In-App | High |
| `order.accepted` | Business | Customer | Email + In-App | Normal |
| `order.rejected` | Business | Customer + Admin | Email + In-App | High |
| `order.packing` | Business | Customer | In-App | Normal |
| `order.ready_to_ship` | Business | Customer | In-App | Normal |
| `order.shipped` | Business | Customer + Shop Owner + Admin | Email + In-App | High |
| `order.in_transit` | Business | Customer | In-App | Normal |
| `order.delivered` | Business | Customer + Shop Owner + Admin | Email + In-App | High |
| `order.completed` | Business | Customer | Email (review request) | Normal |
| `order.cancelled` | Business | Customer + Shop Owner + Admin | Email + In-App | High |
| `order.return_requested` | Business | Customer + Shop Owner + Admin | Email + In-App | High |
| `order.return_approved` | Business | Customer + Shop Owner | Email + In-App | High |
| `order.return_rejected` | Business | Customer + Shop Owner | Email + In-App | High |
| `order.refund_processed` | Business | Customer + Shop Owner + Admin | Email + In-App | High |
| `product.published` | Business | Shop Owner | In-App | Normal |
| `product.rejected` | Business | Shop Owner | Email + In-App | High |
| `product.flagged` | Business | Shop Owner + Admin | In-App | High |
| `inventory.low_stock` | Business | Shop Owner | In-App + Email | High |
| `inventory.out_of_stock` | Business | Shop Owner + Admin | Email + In-App | Urgent |
| `inventory.restocked` | Business | Shop Owner | In-App | Normal |
| `settlement.created` | Finance | Shop Owner | Email + In-App | High |
| `settlement.processed` | Finance | Shop Owner + Admin | Email + In-App | High |
| `settlement.failed` | Finance | Shop Owner + Admin | Email + In-App | Urgent |
| `commission.calculated` | Finance | Shop Owner | In-App | Normal |
| `refund.initiated` | Finance | Customer + Shop Owner + Admin | Email + In-App | High |
| `refund.completed` | Finance | Customer + Shop Owner + Admin | Email + In-App | High |
| `system.announcement` | System | All / Role-specific | In-App + Email | Normal |
| `system.maintenance` | System | All users | Email + In-App | High |
| `system.security_alert` | System | Admin | Email + In-App | Urgent |
| `review.submitted` | Business | Admin | In-App | Normal |
| `review.approved` | Business | Customer | In-App | Normal |
| `review.rejected` | Business | Customer | In-App | Normal |
| `question.submitted` | Business | Admin + Shop Owner | In-App | Normal |
| `question.answered` | Business | Customer | In-App | Normal |

### 3.6 Event Emission Pattern

```typescript
// ✓ CORRECT: Event emission from business handler
// In api/_handlers/checkout/verify-payment.ts

import { eventBus } from '@/_lib/events/event-bus';

export async function handleVerifyPayment(request: Request) {
  // ... payment verification logic ...

  // 1. Create order
  const order = await db.order.create({ data: orderData });

  // 2. Emit event (non-blocking, fire-and-forget)
  eventBus.emit({
    eventType: 'order.created',
    actor: { id: user.id, role: user.role, email: user.email },
    resource: { type: 'order', id: order.id, data: order },
    context: { ip: request.headers.get('x-forwarded-for') },
    metadata: { items: orderItems, total: order.total },
  });

  // 3. Return response to user immediately
  return successResponse({ orderId: order.id });
}
```

```typescript
// ✓ CORRECT: Event bus with outbox pattern
// In api/_lib/events/event-bus.ts

export class EventBus {
  constructor(
    private db: PrismaClient,
    private notificationEngine: NotificationEngine
  ) {}

  async emit(event: BusinessEvent): Promise<void> {
    // 1. Persist event to outbox (guarantees at-least-once delivery)
    await this.db.eventOutbox.create({
      data: {
        eventId: event.eventId,
        eventType: event.eventType,
        payload: event,
        status: 'pending',
        createdAt: new Date(),
      },
    });

    // 2. Process asynchronously (don't block caller)
    queueMicrotask(() => this.processEvent(event));
  }

  private async processEvent(event: BusinessEvent): Promise<void> {
    try {
      await this.notificationEngine.processEvent(event);
      await this.markProcessed(event.eventId);
    } catch (error) {
      await this.markFailed(event.eventId, error);
      // Retry logic handled by queue processor
    }
  }
}
```

### 3.7 Registration & Login Events

| Event | Trigger | Recipients | Channels | Content |
|-------|---------|------------|----------|---------|
| `auth.registered` | Successful registration | Customer | Email (welcome) + In-App | Welcome message, getting started guide |
| `auth.login` | Successful login | Customer | In-App (suspicious only) | Login confirmation (new device only) |
| `auth.login_new_device` | Login from new device | Customer | Email + In-App | Device details, security tip |
| `auth.login_new_location` | Login from new location | Customer | Email + In-App | Location details, security tip |
| `auth.failed_login` | 3+ failed attempts | Customer | Email + In-App | Security alert, reset link |
| `auth.password_reset_requested` | Password reset request | Customer | Email | Reset link (expires 1 hour) |
| `auth.password_reset_completed` | Password successfully changed | Customer | Email + In-App | Confirmation, recent changes note |
| `auth.email_verification` | New email pending verification | Customer | Email | Verification link (expires 24 hours) |

### 3.8 Order Lifecycle Events

| Event | Trigger | Recipients | Channels | Content |
|-------|---------|------------|----------|---------|
| `order.created` | Order placed + payment verified | Customer + Shop Owner | Email + In-App | Order summary, items, total, next steps |
| `order.payment_confirmed` | Payment captured | Customer + Shop Owner + Admin | Email + In-App | Payment receipt, order number |
| `order.accepted` | Shop owner accepts order | Customer | Email + In-App | Acceptance confirmation, expected timeline |
| `order.rejected` | Shop owner rejects order | Customer + Admin | Email + In-App | Rejection reason, refund information |
| `order.packing` | Shop owner begins packing | Customer | In-App | Packing status, estimated ship date |
| `order.ready_to_ship` | Order packed, awaiting courier | Customer | In-App | Ready to ship notification |
| `order.shipped` | Handed to courier | Customer + Shop Owner + Admin | Email + In-App | Tracking number, carrier, ETA |
| `order.in_transit` | In transit to customer | Customer | In-App | Transit status, updated ETA |
| `order.delivered` | Successfully delivered | Customer + Shop Owner + Admin | Email + In-App | Delivery confirmation, review request |
| `order.completed` | Customer confirms receipt (30 days auto) | Customer | Email | Review request, thank you |
| `order.cancelled` | Order cancelled | Customer + Shop Owner + Admin | Email + In-App | Cancellation reason, refund details |
| `order.return_requested` | Return request submitted | Customer + Shop Owner + Admin | Email + In-App | Request confirmation, pickup details |
| `order.return_approved` | Return request approved | Customer + Shop Owner | Email + In-App | Return instructions, pickup schedule |
| `order.return_rejected` | Return request rejected | Customer + Shop Owner | Email + In-App | Rejection reason, escalation options |
| `order.refund_processed` | Refund completed | Customer + Shop Owner + Admin | Email + In-App | Refund amount, method, timeline |

### 3.9 Product Events

| Event | Trigger | Recipients | Channels | Content |
|-------|---------|------------|----------|---------|
| `product.published` | Product approved and live | Shop Owner | In-App | Publication confirmation, live URL |
| `product.rejected` | Product rejected by admin | Shop Owner | Email + In-App | Rejection reason, correction guidance |
| `product.flagged` | Product flagged for review | Shop Owner + Admin | In-App | Flag reason, action required |
| `product.drafted` | Product saved as draft | Shop Owner | In-App | Draft saved confirmation |

### 3.10 Inventory Events

| Event | Trigger | Recipients | Channels | Content |
|-------|---------|------------|----------|---------|
| `inventory.low_stock` | Stock below threshold | Shop Owner | In-App + Email | Product name, current stock, threshold |
| `inventory.out_of_stock` | Stock reaches zero | Shop Owner + Admin | Email + In-App | Product name, restock urgency |
| `inventory.restocked` | Stock replenished | Shop Owner | In-App | Product name, new stock level |
| `inventory.reservation_expired` | Cart reservation timeout (15 min) | System | Internal | Release reserved stock |

### 3.11 Finance Events

| Event | Trigger | Recipients | Channels | Content |
|-------|---------|------------|----------|---------|
| `settlement.created` | Settlement period generated | Shop Owner | Email + In-App | Settlement amount, period, items |
| `settlement.processed` | Payout initiated | Shop Owner + Admin | Email + In-App | Transaction ID, amount, bank details |
| `settlement.completed` | Payout confirmed | Shop Owner + Admin | Email + In-App | Completion confirmation |
| `settlement.failed` | Payout failed | Shop Owner + Admin | Email + In-App | Failure reason, retry plan |
| `commission.calculated` | Commission computed per order | Shop Owner | In-App | Order, rate, amount deducted |
| `refund.initiated` | Refund process started | Customer + Shop Owner + Admin | Email + In-App | Refund amount, reason, timeline |
| `refund.completed` | Refund successfully processed | Customer + Shop Owner + Admin | Email + In-App | Refund confirmation, bank details |

### 3.12 System Events

| Event | Trigger | Recipients | Channels | Content |
|-------|---------|------------|----------|---------|
| `system.announcement` | Admin publishes announcement | All / Role-specific | Email + In-App | Announcement title, content, CTA |
| `system.maintenance_scheduled` | Maintenance window set | All users | Email + In-App | Date, time, duration, impact |
| `system.maintenance_started` | Maintenance begins | All users | In-App | Maintenance message, status page |
| `system.maintenance_completed` | Maintenance ended | All users | In-App | Completion confirmation |
| `system.security_alert` | Security incident detected | Admin | Email + In-App | Alert details, severity, action |
| `system.deployment` | New version deployed | Admin team | In-App | Version, changelog, status |

---

## 4. Notification Lifecycle

### 4.1 What

The complete workflow that every notification traverses from creation to archival, including all possible states, transitions, retry logic, and failure handling.

### 4.2 Why

- **Reliability:** Every notification state is tracked — nothing is silently lost
- **Debuggability:** Failed notifications can be inspected and retried
- **Compliance:** Complete delivery history for audit purposes
- **User control:** Users can see what they received and when

### 4.3 Where

`api/_lib/notifications/lifecycle.ts` — state machine, transitions, retry logic.

### 4.4 Notification States

| State | Description | Next Possible States | Trigger |
|-------|-------------|---------------------|---------|
| **created** | Notification entity written to DB | queued | Immediate after event processing |
| **queued** | Notification placed in delivery queue | delivered, failed | Queue processor picks up |
| **delivered** | Channel confirmed receipt (email sent, in-app written) | read, archived, expired | Delivery confirmation |
| **read** | User has viewed the notification | archived | User opens notification |
| **archived** | User or system archived the notification | (terminal) | User action or retention policy |
| **expired** | Notification past retention period | archived (auto) | Scheduled cleanup |
| **failed** | Delivery failed after all retries | queued (manual retry) | Retry exhausted |
| **cancelled** | Notification cancelled before delivery | (terminal) | User/system action |

### 4.5 Lifecycle State Machine

```
                    ┌──────────────┐
                    │   created    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
          ┌────────│   queued     │────────┐
          │        └──────┬───────┘        │
          │               │                │
          ▼               ▼                ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │  delivered  │ │   failed    │ │  cancelled  │
   └──────┬──────┘ └──────┬──────┘ └─────────────┘
          │               │                │
          ▼               ▼                ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │    read     │ │  queued     │ │ (terminal)  │
   └──────┬──────┘ │ (retry)     │ └─────────────┘
          │        └─────────────┘
          ▼
   ┌─────────────┐
   │  archived   │◀── (auto-expire after retention)
   └─────────────┘
```

### 4.6 Transition Rules

| From State | To State | Trigger | Guard |
|------------|----------|---------|-------|
| created | queued | Queue processor picks up | Notification is valid |
| queued | delivered | Channel confirms delivery | Channel is operational |
| queued | failed | Delivery failed + retries exhausted | Max retries (3) reached |
| failed | queued | Manual retry or scheduled retry | Retry count < max |
| delivered | read | User views notification | User is recipient |
| delivered | archived | User archives or retention expires | — |
| read | archived | User archives or retention expires | — |
| created | cancelled | User/system cancels before delivery | Not yet queued |
| any | archived | Retention period expires | Auto-cleanup job |

### 4.7 Retry Policy

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Max retries** | 3 attempts | Balance reliability vs. noise |
| **Backoff** | Exponential: 1s, 4s, 16s | Prevent thundering herd |
| **Retry on** | 5xx errors, network timeouts, rate limits | Transient failures |
| **Don't retry on** | 4xx errors, invalid email, bounced | Permanent failures |
| **DLQ** | After max retries, notification moved to Dead Letter Queue | Manual inspection |
| **Alert** | Admin alert if DLQ count > 10 in 1 hour | Escalation |
| **Manual retry** | Admin can manually retry from DLQ | Recovery |

### 4.8 Expiration & Archival

| Notification Type | Retention Period | Archive Behavior |
|-------------------|------------------|------------------|
| **Security notifications** | 1 year | Archive (never delete) |
| **Order notifications** | 2 years | Archive |
| **Finance notifications** | 7 years | Archive (compliance) |
| **System notifications** | 90 days | Archive |
| **Marketing notifications** | 30 days | Delete after archive |
| **In-app (unread)** | 90 days | Auto-mark as read, then archive |

### 4.9 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| No state tracking | Can't debug delivery failures | Full lifecycle state machine |
| Silent retry without logging | Can't identify patterns | Log every retry attempt |
| Infinite retries | Notification storm, resource waste | Max 3 retries with backoff |
| Deleting failed notifications | Lost audit trail | DLQ with manual inspection |
| No expiration | Table grows unbounded | Auto-archive with retention policy |

---

## 5. Internal Messaging

### 5.1 What

The complete architecture for private conversations between Admin and Shop Owners — including threads, rich content, linked entities, read status, search, and conversation history.

### 5.2 Why

- **Support:** Shop Owners need direct access to Admin for operational issues
- **Context:** Order, product, and finance discussions require entity linkage
- **Privacy:** Internal communication must never be exposed to customers or other shops
- **Auditability:** Conversation history is permanent and searchable
- **Efficiency:** Threaded conversations keep context organized

### 5.3 Where

`api/_handlers/shop/messages/` — Shop Owner message endpoints.  
`api/_handlers/admin/messages/` — Admin message endpoints.  
`src/features/shop/messages/` — Shop Owner messaging UI.  
`src/features/admin/messages/` — Admin messaging UI.  
`src/features/messaging/` — Shared messaging components.

### 5.4 Communication Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Admin ↔ Shop Owner only** | Only Admin and individual Shop Owners can converse | Business communication isolation |
| **No Shop ↔ Shop** | Shop Owners cannot message each other | Privacy, prevent collusion |
| **No Customer ↔ Shop** | Customers have separate support architecture | Channel separation |
| **No Customer ↔ Admin via messaging** | Customer support uses independent system | Channel separation |
| **Private by default** | All conversations are private to participants | Privacy |
| **Admin visibility** | Admin can see all Shop Owner conversations | Governance |
| **Shop Owner isolation** | Shop Owner sees only their conversations | Multi-tenant security |

### 5.5 Conversation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONVERSATION ARCHITECTURE                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  CONVERSATION                             │   │
│  │                                                           │   │
│  │  id: UUID (permanent)                                    │   │
│  │  subject: string                                         │   │
│  │  category: order | product | finance | general | system  │   │
│  │  status: open | resolved | closed                        │   │
│  │  priority: low | normal | high | urgent                   │   │
│  │  linkedEntityType?: order | product | settlement | ...   │   │
│  │  linkedEntityId?: string                                  │   │
│  │  createdBy: Profile (FK)                                 │   │
│  │  shopId: string (FK — Shop Owner's shop)                 │   │
│  │  lastMessageAt: DateTime                                 │   │
│  │  createdAt: DateTime                                     │   │
│  │  updatedAt: DateTime                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  CONVERSATION MESSAGE                     │   │
│  │                                                           │   │
│  │  id: UUID (permanent)                                    │   │
│  │  conversationId: UUID (FK)                               │   │
│  │  senderId: Profile (FK)                                  │   │
│  │  content: string (rich text / markdown)                  │   │
│  │  attachments: JSONB (images, documents, links)           │   │
│  │  linkedEntityType?: order | product | settlement | ...   │   │
│  │  linkedEntityId?: string                                  │   │
│  │  isInternal: boolean (admin-only notes)                  │   │
│  │  readBy: JSONB [{profileId, readAt}]                     │   │
│  │  createdAt: DateTime                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  CONVERSATION PARTICIPANT                 │   │
│  │                                                           │   │
│  │  id: UUID                                                │   │
│  │  conversationId: UUID (FK)                               │   │
│  │  profileId: UUID (FK)                                    │   │
│  │  role: owner | admin | participant                       │   │
│  │  lastReadMessageId?: UUID (FK)                           │   │
│  │  lastReadAt?: DateTime                                   │   │
│  │  isMuted: boolean                                        │   │
│  │  isPinned: boolean                                       │   │
│  │  joinedAt: DateTime                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.6 Conversation Threads

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Threading** | Messages grouped in conversation threads | Context preservation |
| **Thread per entity** | One thread per linked order, product, or settlement | Organization |
| **General thread** | One general thread per Shop Owner for unlinked topics | Catch-all |
| **Thread status** | open → resolved → closed | Workflow management |
| **Auto-close** | Conversations auto-close after 14 days of inactivity | Cleanup |
| **Reopen** | Either party can reopen closed conversations | Flexibility |
| **Assignment** | Admin can assign conversations to team members (future) | Load balancing |

### 5.7 Rich Content

| Content Type | Standard | Rationale |
|--------------|----------|-----------|
| **Rich text** | Markdown-based formatting | Expressive communication |
| **Images** | Upload via Cloudinary/R2, max 5MB per image | Visual context |
| **Documents** | PDF, DOC, XLS up to 10MB | Document sharing |
| **Links** | Auto-embed for orders, products, settlements | Context |
| **Code blocks** | For technical discussions | Technical support |
| **Tables** | For data sharing | Structured information |

### 5.8 Linked Entities

| Entity Type | Link Standard | Display |
|-------------|---------------|---------|
| **Order** | `linkedEntityType: 'order'`, `linkedEntityId: orderId` | Order summary card in conversation |
| **Product** | `linkedEntityType: 'product'`, `linkedEntityId: productId` | Product card with image and price |
| **Settlement** | `linkedEntityType: 'settlement'`, `linkedEntityId: settlementId` | Settlement summary card |
| **Refund** | `linkedEntityType: 'refund'`, `linkedEntityId: refundId` | Refund details card |
| **Return** | `linkedEntityType: 'return'`, `linkedEntityId: resolutionId` | Return request card |

### 5.9 Read Status

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Per-participant tracking** | Each participant's last read message tracked | Accurate unread count |
| **Read receipts** | Show "Read" timestamp when other party views | Transparency |
| **Unread count** | Badge count per conversation and total | At-a-glance awareness |
| **Mark all read** | "Mark all as read" bulk action | Efficiency |
| **Last seen** | Show "Last seen: X minutes ago" for online status | Presence awareness |

### 5.10 Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full-text search** | Search across message content | Deep search |
| **Subject search** | Search conversation subjects | Quick lookup |
| **Sender filter** | Filter by message sender | Organization |
| **Date range filter** | Filter by message date | Time-based lookup |
| **Status filter** | Filter by open/resolved/closed | Workflow |
| **Priority filter** | Filter by priority level | Triage |
| **Category filter** | Filter by order/product/finance/general | Organization |
| **Linked entity search** | Search by order number, product name | Context |

### 5.11 Conversation History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Permanent** | Conversation history is never deleted | Audit trail |
| **Exportable** | Export conversation as PDF or text | Reference |
| **Scrollable** | Infinite scroll with lazy loading for long threads | Performance |
| **Timestamps** | Every message timestamped with UTC | Temporal accuracy |
| **Participant tracking** | Every message attributed to sender | Accountability |
| **Edit history** | If message edited, original + edit timestamp preserved | Transparency |
| **Delete policy** | Sender can delete own messages within 10 minutes; Admin can delete any | Safety |

### 5.12 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Shop ↔ Shop messaging | Privacy violation, potential collusion | Admin ↔ Shop Owner only |
| Customer messages in internal system | Channel confusion, support fragmentation | Separate customer support system |
| No linked entity context | Conversations lack business context | Always link relevant orders/products |
| Deleting conversation history | Lost audit trail | Permanent history, append-only |
| No read status | Can't tell if message was seen | Per-participant read tracking |

---

## 6. Templates

### 6.1 What

The template system governing email templates, notification templates, dynamic variables, branding, localization, personalization, and versioning for all communication across the Nabome platform.

### 6.2 Why

- **Consistency:** Every email from Nabome looks and feels professional
- **Maintainability:** Template changes don't require code deployments
- **Localization:** Templates support multi-language content
- **Branding:** Every communication reinforces the Nabome brand
- **Personalization:** Templates adapt to recipient context
- **Versioning:** Template changes are tracked and reversible

### 6.3 Where

`api/_lib/templates/` — template definitions, rendering engine, variable resolution.  
`api/_lib/email/templates/` — React Email template components.

### 6.4 Email Template Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL TEMPLATE ARCHITECTURE                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   TEMPLATE LAYOUTS                        │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │  Base Layout │  │  Transaction │  │   Marketing    │  │   │
│  │  │  (Header,    │  │  Layout      │  │   Layout       │  │   │
│  │  │   Footer)    │  │  (Clean)     │  │   (Rich)       │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   TEMPLATE COMPONENTS                     │   │
│  │                                                           │   │
│  │  OrderCard │ ProductCard │ PaymentSummary │ TrackingInfo  │   │
│  │  RefundCard │ SettlementCard │ ButtonGroup │ SocialLinks  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   TEMPLATE INSTANCES                      │   │
│  │                                                           │   │
│  │  order-confirmation │ shipping-notification │             │   │
│  │  password-reset │ welcome │ review-request │             │   │
│  │  settlement-processed │ refund-completed │               │   │
│  │  marketing-sale │ abandoned-cart │ win-back               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.5 Email Templates

| Template | Category | Subject Pattern | Recipients |
|----------|----------|----------------|------------|
| `welcome` | Auth | "Welcome to Nabome, {{firstName}}!" | Customer |
| `email-verification` | Auth | "Verify your email address" | Customer |
| `password-reset` | Auth | "Reset your password" | Customer |
| `password-changed` | Auth | "Your password was changed" | Customer |
| `login-new-device` | Security | "New login detected on {{device}}" | Customer |
| `order-confirmation` | Order | "Order #{{orderNumber}} confirmed!" | Customer |
| `order-accepted` | Order | "Your order #{{orderNumber}} has been accepted" | Customer |
| `order-rejected` | Order | "Update on your order #{{orderNumber}}" | Customer |
| `order-shipped` | Order | "Your order #{{orderNumber}} is on its way!" | Customer |
| `order-delivered` | Order | "Your order #{{orderNumber}} has been delivered!" | Customer |
| `order-cancelled` | Order | "Order #{{orderNumber}} has been cancelled" | Customer |
| `return-approved` | Return | "Your return request has been approved" | Customer |
| `return-rejected` | Return | "Update on your return request" | Customer |
| `refund-completed` | Finance | "Your refund of {{amount}} has been processed" | Customer |
| `review-request` | Engagement | "How was your experience with {{productName}}?" | Customer |
| `settlement-processed` | Finance | "Settlement of {{amount}} has been processed" | Shop Owner |
| `product-rejected` | Product | "Your product '{{productName}}' needs attention" | Shop Owner |
| `low-stock-alert` | Inventory | "Low stock alert for {{productName}}" | Shop Owner |
| `out-of-stock-alert` | Inventory | "{{productName}} is out of stock" | Shop Owner |
| `system-announcement` | System | "{{title}}" | All/Role-specific |
| `maintenance-scheduled` | System | "Scheduled maintenance on {{date}}" | All users |

### 6.6 Notification Templates (In-App)

| Template | Category | Title Pattern | Icon |
|----------|----------|---------------|------|
| `order-created` | Order | "Order #{{orderNumber}} placed" | Shopping bag |
| `order-accepted` | Order | "Order #{{orderNumber}} accepted" | Check circle |
| `order-rejected` | Order | "Order #{{orderNumber}} rejected" | X circle |
| `order-shipped` | Order | "Order #{{orderNumber}} shipped" | Truck |
| `order-delivered` | Order | "Order #{{orderNumber}} delivered" | Package check |
| `order-cancelled` | Order | "Order #{{orderNumber}} cancelled" | Ban |
| `return-requested` | Return | "Return requested for #{{orderNumber}}" | Rotate CCW |
| `return-approved` | Return | "Return approved for #{{orderNumber}}" | Check circle |
| `refund-processed` | Finance | "Refund of {{amount}} processed" | Indian rupee |
| `settlement-processed` | Finance | "Settlement of {{amount}} processed" | Indian rupee |
| `product-published` | Product | "{{productName}} is now live" | Eye |
| `product-rejected` | Product | "{{productName}} needs changes" | Alert triangle |
| `low-stock` | Inventory | "{{productName}} — {{stock}} left" | Alert triangle |
| `security-alert` | Security | "{{title}}" | Shield alert |
| `system-announcement` | System | "{{title}}" | Bell |

### 6.7 Dynamic Variables

| Variable | Source | Example |
|----------|--------|---------|
| `{{firstName}}` | Profile | "Rahul" |
| `{{lastName}}` | Profile | "Sharma" |
| `{{fullName}}` | Profile | "Rahul Sharma" |
| `{{email}}` | Profile | "rahul@example.com" |
| `{{orderNumber}}` | Order | "NAB-20260803-0001" |
| `{{orderTotal}}` | Order | "₹2,499" |
| `{{orderItems}}` | Order | Array of items |
| `{{trackingNumber}}` | Shipping | "TRK123456789" |
| `{{trackingUrl}}` | Shipping | "https://..." |
| `{{refundAmount}}` | Refund | "₹1,200" |
| `{{settlementAmount}}` | Settlement | "₹15,500" |
| `{{productName}}` | Product | "Classic Cotton Tee" |
| `{{shopName}}` | Shop | "Rahul's Fashion" |
| `{{resetLink}}` | Auth | "https://nabome.online/reset?token=..." |
| `{{verificationLink}}` | Auth | "https://nabome.online/verify?token=..." |
| `{{deviceInfo}}` | Security | "Chrome on macOS" |
| `{{loginLocation}}` | Security | "Mumbai, India" |
| `{{date}}` | System | "August 3, 2026" |
| `{{supportEmail}}` | System | "support@nabome.online" |
| `{{unsubscribeUrl}}` | Marketing | "https://nabome.online/unsubscribe?..." |

### 6.8 Branding Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Logo** | Nabome logo in header (SVG, responsive) | Brand recognition |
| **Colors** | Primary: brand blue, Secondary: warm accent | Consistent identity |
| **Typography** | System font stack (Inter, -apple-system, sans-serif) | Universal rendering |
| **Footer** | Company name, address, unsubscribe link, social links | Legal compliance |
| **From name** | "Nabome" for transactional, "Team Nabome" for marketing | Trust |
| **Reply-to** | `support@nabome.online` for transactional | Support access |
| **Mobile-first** | All templates responsive, tested on 320px+ | 70%+ mobile users |
| **Dark mode** | Email templates support dark mode CSS | Modern email clients |

### 6.9 Localization Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Language detection** | Detect from user profile locale preference | Personalization |
| **Fallback** | English fallback if translation unavailable | Reliability |
| **RTL readiness** | Template structure supports right-to-left languages | Future Arabic, Hebrew |
| **Date format** | Localized date formatting per locale | UX |
| **Currency format** | ₹ INR by default, configurable per locale | Financial accuracy |
| **Translation keys** | Use keys, not hardcoded text | Maintainability |

### 6.10 Personalization Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Name personalization** | Use first name in greetings and subject lines | Engagement |
| **Order context** | Include relevant order details in templates | Relevance |
| **Behavioral triggers** | Abandoned cart, browse history, purchase history | Marketing effectiveness |
| **Preference-aware** | Respect user's notification preferences | User control |
| **Time-zone aware** | Send at appropriate time per user timezone | Non-intrusive |

### 6.11 Template Versioning

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Version tracking** | Every template change creates a new version | Rollback capability |
| **Version metadata** | Author, reason, timestamp per version | Audit trail |
| **Active version** | One active version per template at any time | Consistency |
| **Draft/publish** | Templates drafted before activation | Quality control |
| **A/B testing** | Support multiple active variants (future) | Optimization |
| **Rollback** | One-click rollback to previous version | Recovery |

### 6.12 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hardcoded template content | Can't localize or update without code change | Template engine with variables |
| No branding consistency | Unprofessional, confusing | Standardized layouts and components |
| Missing unsubscribe link | CAN-SPAM violation | Always include unsubscribe |
| No plain text fallback | Accessibility failure | Both HTML and plain text |
| Ignoring user preferences | Spammy, intrusive | Preference-aware delivery |

---

## 7. Delivery

### 7.1 What

The complete delivery infrastructure — queue processing, retry management, failure recovery, priority levels, scheduled delivery, batch delivery, and delivery history.

### 7.2 Why

- **Reliability:** Notifications are delivered even under high load
- **Performance:** Delivery doesn't block user-facing operations
- **Scalability:** Queue handles 0 to 1M+ notifications without degradation
- **Observability:** Every delivery attempt is logged and trackable
- **Recovery:** Failed deliveries are retried, escalated, or manually resolved

### 7.3 Where

`api/_lib/queue/` — delivery queue, processor, retry manager, DLQ.

### 7.4 Delivery Queue Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DELIVERY QUEUE ARCHITECTURE                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  EVENT EMITTERS                           │   │
│  │                                                           │   │
│  │  Auth │ Orders │ Products │ Finance │ System │ CMS │      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  EVENT OUTBOX (DB)                         │   │
│  │                                                           │   │
│  │  eventId │ eventType │ payload │ status │ attempts │ ...  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  QUEUE PROCESSOR                           │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │  Priority    │  │   Worker     │  │   Batch        │  │   │
│  │  │  Scheduler   │  │   Pool       │  │   Processor    │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  CHANNEL DELIVERY                          │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ In-App   │  │  Email   │  │   SMS    │  │   Push   ││   │
│  │  │ (Direct) │  │ (Resend) │  │ (Future) │  │ (Future) ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  FAILURE MANAGEMENT                        │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │   Retry     │  │  Dead Letter │  │  Admin Alert   │  │   │
│  │  │   Manager   │  │    Queue     │  │   System       │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Queue Processing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Async processing** | Queue processed asynchronously, not in request cycle | Non-blocking |
| **Polling interval** | Queue polled every 5 seconds | Near-real-time delivery |
| **Batch size** | Process 10 notifications per batch | Efficiency |
| **Concurrent workers** | Max 3 concurrent workers per channel | Rate limiting |
| **Timeout** | 30 seconds per delivery attempt | Prevent hanging |
| **Idempotency** | Same eventId produces same notification | Prevent duplicates |
| **Ordering** | Process by priority, then by creation time | Urgent first |

### 7.6 Priority Levels

| Priority | Use Cases | Delivery SLA | Retry Policy |
|----------|-----------|--------------|--------------|
| **Urgent** | Security alerts, fraud detection, system outage | < 30 seconds | 5 retries, 1s backoff |
| **High** | Order confirmations, payment confirmations, refunds | < 1 minute | 3 retries, exponential |
| **Normal** | Status updates, settlement processed, product published | < 5 minutes | 3 retries, exponential |
| **Low** | Marketing emails, review requests, win-back campaigns | < 1 hour | 2 retries, linear |
| **Background** | Analytics reports, batch exports, cleanup tasks | Best effort | 1 retry |

### 7.7 Scheduled Delivery

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Scheduled send** | Notifications can be scheduled for future delivery | Marketing campaigns |
| **Timezone-aware** | Scheduled at recipient's local time | Non-intrusive |
| **Batch scheduling** | Marketing emails batched to avoid rate limits | Deliverability |
| **Cancel scheduled** | Users/admins can cancel scheduled notifications | Control |
| **Scheduled queue** | Separate queue for scheduled notifications | Priority isolation |

### 7.8 Batch Delivery

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Batch size** | Max 500 recipients per batch | Rate limit compliance |
| **Batch delay** | 10-second delay between batches | Deliverability |
| **Progress tracking** | Track sent/failed per batch | Observability |
| **Partial failure** | Individual failures don't stop batch | Resilience |
| **Batch ID** | Each batch has unique ID for tracking | Debugging |

### 7.9 Failure Recovery

| Failure Type | Recovery Strategy | Alert Level |
|-------------|-------------------|-------------|
| **Transient (5xx)** | Retry with exponential backoff | None (auto-recover) |
| **Rate limited** | Wait and retry after cooldown | None (auto-recover) |
| **Invalid email** | Mark email invalid, skip future sends | Warning |
| **Bounced** | Mark email bounced, notify user | Warning |
| **Service down** | Queue notifications, retry when service recovers | Critical |
| **DLQ threshold** | Alert admin if DLQ > 10 in 1 hour | Critical |
| **Template error** | Log error, use fallback template | Warning |

### 7.10 Delivery History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Per-notification log** | Every delivery attempt logged with timestamp | Audit trail |
| **Channel-specific logs** | Email: Resend ID, SMS: Twilio SID, Push: FCM ID | Debugging |
| **Success/failure tracking** | Status logged per attempt | Observability |
| **Delivery rate metrics** | Track delivery rate per channel, template, event type | Optimization |
| **Bounce rate tracking** | Track email bounce rates | Deliverability |
| **Export** | Export delivery logs as CSV | Compliance |

### 7.11 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Synchronous email in request | Blocks user, timeout risk | Async queue processing |
| No queue persistence | Notifications lost on crash | DB-backed event outbox |
| Infinite retries | Resource waste, notification storm | Max retries with backoff |
| No batch limits | Rate limit violations | Batch size + delay |
| Ignoring delivery failures | Silent loss of notifications | DLQ + admin alerts |

---

## 8. User Preferences

### 8.1 What

The system governing how each user controls what notifications they receive, through which channels, and at what frequency — including notification preferences, marketing preferences, security preferences, email preferences, and future push preferences.

### 8.2 Why

- **User control:** Users decide what communication they receive
- **Compliance:** GDPR, CAN-SPAM, and Indian IT Act require opt-out mechanisms
- **Engagement:** Preference-aligned notifications have higher open/click rates
- **Trust:** Users trust platforms that respect their communication choices

### 8.3 Where

`api/_handlers/auth/preferences/` — preference API endpoints.  
`src/features/settings/notifications/` — preference UI components.

### 8.4 Notification Preferences

| Preference | Default | Options | Scope |
|------------|---------|---------|-------|
| **Order updates** | Enabled | On/Off | Per-type (confirmation, shipping, delivery, cancellation) |
| **Return updates** | Enabled | On/Off | Per-type (requested, approved, rejected) |
| **Security alerts** | Always on | Cannot disable | Platform-mandated |
| **System announcements** | Enabled | On/Off | Platform-wide |
| **Product updates** | Enabled | On/Off | Published, rejected, flagged |
| **Inventory alerts** | Enabled | On/Off | Low stock, out of stock |
| **Settlement updates** | Enabled | On/Off | Created, processed, completed |

### 8.5 Marketing Preferences

| Preference | Default | Options | Scope |
|------------|---------|---------|-------|
| **Promotional emails** | Enabled | On/Off | Sales, new arrivals, seasonal |
| **Abandoned cart** | Enabled | On/Off | Cart reminder emails |
| **Win-back campaigns** | Enabled | On/Off | Re-engagement emails |
| **Referral program** | Enabled | On/Off | Referral invitations |
| **Newsletter** | Enabled | On/Off | Weekly digest |
| **SMS marketing** | Disabled | On/Off | Future SMS campaigns |

### 8.6 Security Preferences

| Preference | Default | Options | Scope |
|------------|---------|---------|-------|
| **Login notifications** | Always on | Cannot disable | Platform-mandated |
| **New device alerts** | Always on | Cannot disable | Platform-mandated |
| **Password change alerts** | Always on | Cannot disable | Platform-mandated |
| **Failed login alerts** | Always on | Cannot disable | Platform-mandated |
| **Email change alerts** | Always on | Cannot disable | Platform-mandated |

### 8.7 Email Preferences

| Preference | Default | Options | Scope |
|------------|---------|---------|-------|
| **Email frequency** | Immediate | Immediate, Daily digest, Weekly digest | All transactional emails |
| **Email format** | HTML | HTML, Plain text | All emails |
| **Language** | English | English, Bengali, Hindi (future) | All email content |

### 8.8 Future Push Preferences

| Preference | Default | Options | Scope |
|------------|---------|---------|-------|
| **Push notifications** | Disabled (opt-in) | On/Off | Browser push |
| **Push frequency** | Immediate | Immediate, Batched (hourly) | Push delivery |
| **Push categories** | All enabled | Per-category toggle | Order, Marketing, Security |
| **Quiet hours** | Disabled | Start time, End time | Suppress push during hours |

### 8.9 Preference Storage

```typescript
// ✓ CORRECT: User notification preferences structure
interface NotificationPreferences {
  userId: string;
  
  // Notification categories
  orders: {
    confirmation: boolean;    // default: true
    accepted: boolean;        // default: true
    rejected: boolean;        // default: true
    shipped: boolean;         // default: true
    delivered: boolean;       // default: true
    cancelled: boolean;       // default: true
  };
  returns: {
    requested: boolean;       // default: true
    approved: boolean;        // default: true
    rejected: boolean;        // default: true
  };
  security: {
    login: boolean;           // default: true, cannot disable
    newDevice: boolean;       // default: true, cannot disable
    passwordChange: boolean;  // default: true, cannot disable
  };
  system: {
    announcements: boolean;   // default: true
    maintenance: boolean;     // default: true, cannot disable
  };
  products: {
    published: boolean;       // default: true
    rejected: boolean;        // default: true
  };
  inventory: {
    lowStock: boolean;        // default: true
    outOfStock: boolean;      // default: true
  };
  finance: {
    settlement: boolean;      // default: true
    refund: boolean;          // default: true
  };

  // Channel preferences
  channels: {
    email: boolean;           // default: true
    inApp: boolean;           // default: true, cannot disable
    sms: boolean;             // default: false
    push: boolean;            // default: false
  };

  // Marketing
  marketing: {
    promotional: boolean;     // default: true
    abandonedCart: boolean;   // default: true
    winBack: boolean;         // default: true
    referral: boolean;        // default: true
    newsletter: boolean;      // default: true
  };

  // Delivery preferences
  delivery: {
    frequency: 'immediate' | 'daily' | 'weekly';  // default: 'immediate'
    quietHoursStart?: string;  // e.g., "22:00"
    quietHoursEnd?: string;    // e.g., "08:00"
    timezone: string;          // default: 'Asia/Kolkata'
  };
}
```

### 8.10 Preference Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default on** | All transactional notifications enabled by default | Revenue-critical |
| **Security always on** | Security notifications cannot be disabled | Platform security |
| **In-app always on** | In-app notifications cannot be disabled | Platform functionality |
| **Marketing opt-in** | Marketing notifications require explicit opt-in | CAN-SPAM compliance |
| **Preference applies retroactively** | Changing preference affects future notifications only | Consistency |
| **Preference audit** | All preference changes logged | Accountability |
| **Admin override** | Admin can send critical notifications regardless of preferences | Emergency communications |

### 8.11 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| No preference system | Users can't control notifications | Full preference system |
| Security notifications dismissable | Security risk | Always-on for security |
| No frequency control | Users overwhelmed | Daily/weekly digest option |
| Ignoring preferences | Spammy, loses trust | Preference-aware delivery |
| No quiet hours | Intrusive during sleep hours | Timezone-aware scheduling |

---

## 9. Search & History

### 9.1 What

The complete search architecture for notifications, messages, and conversation history — including search capabilities, filtering, archival, and history management.

### 9.2 Why

- **Efficiency:** Users find specific notifications and messages quickly
- **Compliance:** Historical communication records must be searchable
- **Debuggability:** Support teams trace communication history
- **Transparency:** Users see complete communication history

### 9.3 Where

Search API handlers, frontend search components in notification and messaging modules.

### 9.4 Notification Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full-text search** | Search notification title and body | Deep search |
| **Category filter** | Filter by order, security, system, marketing | Organization |
| **Date range filter** | Filter by creation date | Time-based lookup |
| **Status filter** | Filter by read/unread, archived | Workflow |
| **Channel filter** | Filter by email, in-app, SMS | Channel awareness |
| **Priority filter** | Filter by urgent, high, normal, low | Triage |
| **Debounce** | 200ms debounce on search input | Performance |
| **Min query** | 2 characters minimum | Prevent noise |

### 9.5 Message Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full-text search** | Search message content | Deep search |
| **Subject search** | Search conversation subject | Quick lookup |
| **Sender filter** | Filter by message sender | Organization |
| **Date range filter** | Filter by message date | Time-based lookup |
| **Status filter** | Filter by conversation status | Workflow |
| **Priority filter** | Filter by priority level | Triage |
| **Category filter** | Filter by order, product, finance, general | Organization |

### 9.6 Conversation Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Unified search** | Search across all conversations | Efficiency |
| **Entity search** | Search by linked order number, product name | Context |
| **Participant search** | Search by participant name | People lookup |
| **Status search** | Filter by open, resolved, closed | Workflow |
| **Date range** | Filter by last message date | Time-based |
| **Sort options** | Sort by relevance, date, priority | Flexibility |

### 9.7 History & Archive

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Permanent history** | All notifications and messages retained permanently | Audit trail |
| **Archive (user)** | User can archive individual notifications | Organization |
| **Archive (system)** | Notifications auto-archived after retention period | Cleanup |
| **Bulk archive** | "Archive all read" bulk action | Efficiency |
| **Bulk delete** | User can delete own notifications (not security) | User control |
| **Export** | Export notification/message history as PDF/CSV | Compliance |
| **Restore** | Admin can restore archived notifications (not deleted) | Recovery |

### 9.8 Filters

| Filter | Applicable To | Options |
|--------|--------------|---------|
| **Category** | Notifications | Order, Security, System, Marketing, Finance, Product, Inventory |
| **Status** | Notifications | Read, Unread, Archived |
| **Channel** | Notifications | Email, In-App, SMS, Push |
| **Priority** | Notifications + Conversations | Urgent, High, Normal, Low |
| **Date range** | Both | Custom date range picker |
| **Sender** | Messages | Participant name |
| **Conversation status** | Conversations | Open, Resolved, Closed |
| **Linked entity** | Conversations | Order number, Product name, Settlement ID |

### 9.9 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| No search capability | Users can't find information | Full-text search |
| No archival | Table grows unbounded | Auto-archive with retention |
| Deleting history | Lost audit trail | Permanent history |
| No filters | Search results overwhelming | Multi-faceted filtering |

---

## 10. Permissions

### 10.1 What

The complete permission matrix governing who can send, receive, delete, archive, export, and moderate notifications and messages across Customer, Shop Owner, and Admin roles.

### 10.2 Why

- **Security:** Not all users should have equal access to communication features
- **Privacy:** Shop conversations must be isolated from each other
- **Compliance:** Financial and security notifications must be protected
- **Governance:** Admins need moderation capabilities

### 10.3 Where

Permission checks in notification API handlers, messaging API handlers, and middleware.

### 10.4 Notification Permissions

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| **Receive notifications** | ✓ (own) | ✓ (own) | ✓ (own + platform) |
| **View notifications** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Read notifications** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Archive notifications** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Delete notifications** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Search notifications** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Export notifications** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Send system notifications** | ✗ | ✗ | ✓ |
| **Send broadcast notifications** | ✗ | ✗ | ✓ |
| **Moderate notifications** | ✗ | ✗ | ✓ |
| **View delivery logs** | ✗ | ✗ | ✓ |
| **Retry failed notifications** | ✗ | ✗ | ✓ |
| **Manage templates** | ✗ | ✗ | ✓ |

### 10.5 Messaging Permissions

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| **Initiate conversation** | N/A (separate system) | ✓ (with admin) | ✓ (with any shop) |
| **Send message** | N/A | ✓ (own conversations) | ✓ (all conversations) |
| **View conversations** | N/A | ✓ (own only) | ✓ (all) |
| **Read messages** | N/A | ✓ (own only) | ✓ (all) |
| **Delete messages** | N/A | ✓ (own, within 10 min) | ✓ (any) |
| **Archive conversation** | N/A | ✓ (own) | ✓ (all) |
| **Export conversation** | N/A | ✓ (own) | ✓ (all) |
| **Close conversation** | N/A | ✓ (own) | ✓ (all) |
| **Reopen conversation** | N/A | ✓ (own) | ✓ (all) |
| **Set priority** | N/A | ✓ (own) | ✓ (all) |
| **Moderate content** | N/A | ✗ | ✓ |
| **View internal notes** | N/A | ✗ | ✓ (admin-only notes) |
| **Search messages** | N/A | ✓ (own only) | ✓ (all) |

### 10.6 Permission Format

```typescript
// Permission format: {scope}:{resource}:{action}
type NotificationPermission =
  | 'notification:read:view'
  | 'notification:read:mark_read'
  | 'notification:archive:archive'
  | 'notification:archive:unarchive'
  | 'notification:delete:delete'
  | 'notification:search:search'
  | 'notification:export:export'
  | 'notification:system:send'
  | 'notification:system:broadcast'
  | 'notification:moderate:moderate'
  | 'notification:delivery:retry'
  | 'notification:template:manage';

type MessagePermission =
  | 'message:conversation:create'
  | 'message:conversation:view'
  | 'message:conversation:close'
  | 'message:conversation:reopen'
  | 'message:conversation:archive'
  | 'message:conversation:export'
  | 'message:conversation:search'
  | 'message:message:send'
  | 'message:message:delete'
  | 'message:message:read'
  | 'message:moderate:moderate'
  | 'message:note:view';
```

### 10.7 Permission Enforcement

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Server-side** | All permission checks server-side | Security |
| **RLS** | Row-Level Security on notification and message tables | Data isolation |
| **Middleware** | Auth + role check in middleware | Consistency |
| **Handler validation** | Each handler validates actor permissions | Defense in depth |
| **Client-side** | UI hides unavailable actions | UX (not security) |
| **Audit** | Permission failures logged | Security monitoring |

### 10.8 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Client-side only permission checks | Bypassable via API | Server-side enforcement |
| No RLS on tables | Data leakage across tenants | Row-Level Security |
| Shop ↔ Shop messaging | Privacy violation | Admin ↔ Shop Owner only |
| No audit of permission failures | Security blind spots | Log all failures |

---

## 11. Performance

### 11.1 What

Performance standards for handling high notification volume, queue optimization, background processing, large conversation history, and efficient search across the communication engine.

### 11.2 Why

- **Scale:** Notification volume grows linearly with user base
- **Speed:** Notifications must be delivered within SLA
- **Efficiency:** Communication infrastructure shouldn't impact page load
- **Cost:** Optimized processing reduces infrastructure costs

### 11.3 Where

Queue processor, notification API handlers, search queries, frontend notification components.

### 11.4 Performance Standards

| Metric | Standard | Rationale |
|--------|----------|-----------|
| **Notification creation** | < 50ms | Non-blocking event emission |
| **In-app notification load** | < 200ms | Fast page load |
| **Email delivery** | < 30 seconds end-to-end | User expectation |
| **Notification search** | < 300ms | Responsive search |
| **Conversation load** | < 500ms (first page) | Fast conversation open |
| **Message send** | < 100ms | Real-time feel |
| **Unread count** | < 50ms | Badge update |
| **Queue processing** | 10 notifications/batch, 5s interval | Throughput |

### 11.5 Queue Optimization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Batch processing** | Process multiple notifications per cycle | Efficiency |
| **Priority queuing** | Urgent notifications processed first | SLA compliance |
| **Connection pooling** | Reuse email service connections | Performance |
| **Batch email sending** | Use Resend batch API for marketing emails | Rate optimization |
| **Lazy template rendering** | Render templates only when needed | CPU efficiency |
| **Deduplication** | Skip duplicate notifications per eventId | Prevent waste |

### 11.6 Background Processing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Non-blocking** | Notification processing never blocks user requests | UX |
| **Queue-based** | All delivery via queue, never synchronous | Reliability |
| **Worker isolation** | Queue workers are separate from request handlers | Stability |
| **Graceful degradation** | If queue is slow, notifications queue up, don't fail | Resilience |
| **Monitoring** | Track queue depth, processing time, failure rate | Observability |

### 11.7 Large Conversation History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Pagination** | 50 messages per page | Performance |
| **Lazy loading** | Load older messages on scroll | Memory efficiency |
| **Virtualization** | Virtualize long message lists | DOM performance |
| **Image lazy load** | Load images on demand | Bandwidth optimization |
| **Message caching** | Cache loaded messages in client state | Avoid re-fetch |

### 11.8 Efficient Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Database indexes** | Full-text indexes on searchable fields | Query speed |
| **GIN indexes** | GIN index for trigram search (pg_trgm) | Fuzzy search |
| **Search debounce** | 200ms debounce on search input | Prevent API spam |
| **Result limit** | Max 50 results per search | Performance |
| **Cursor pagination** | Use cursor-based pagination for search results | Consistent performance |

### 11.9 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Synchronous email in request | Blocks user, timeout risk | Async queue |
| No pagination on notifications | Memory overflow | Paginated loading |
| Loading all messages at once | DOM performance disaster | Virtualization + lazy load |
| No search indexing | Full table scans | Proper indexes |
| Unbounded queue growth | Memory pressure | Queue depth monitoring + alerts |

---

## 12. Security

### 12.1 What

Security standards for message integrity, delivery integrity, access control, encryption readiness, audit logging, spam prevention, and rate limiting across the communication engine.

### 12.2 Why

- **Trust:** Users trust platforms that protect their communication
- **Compliance:** Data protection laws require secure communication
- **Integrity:** Notifications must not be tampered with
- **Availability:** Communication infrastructure must be resilient to attacks

### 12.3 Where

All notification and messaging API handlers, queue processors, email service, and frontend components.

### 12.4 Message Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Immutability** | Notification content is immutable after creation | Tamper-proof |
| **Digital signatures** | Email content signed with DKIM | Email authenticity |
| **SPF/DKIM/DMARC** | Configured for nabome.online domain | Email deliverability + security |
| **Content validation** | All notification content validated before delivery | Prevent injection |
| **Attachment scanning** | Scan uploaded attachments for malware | Security |

### 12.5 Delivery Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Idempotent delivery** | Same event produces same notification (dedup) | Prevent duplicates |
| **At-least-once** | Event outbox guarantees delivery | No lost notifications |
| **Exactly-once (best effort)** | Dedup by eventId for email delivery | Prevent spam |
| **Delivery confirmation** | Track per-channel delivery status | Accountability |
| **Bounce handling** | Log and handle email bounces | Deliverability |

### 12.6 Access Control

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Authentication** | All notification endpoints require authentication | Security |
| **Authorization** | Role-based access per permission matrix | Data isolation |
| **RLS** | Row-Level Security on notification and message tables | Multi-tenant security |
| **Conversation isolation** | Shop Owners see only their conversations | Privacy |
| **Admin access** | Admin can access all conversations (with audit log) | Governance |
| **Internal notes** | Admin-only notes not visible to Shop Owners | Internal communication |

### 12.7 Encryption Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **TLS** | All API communication over HTTPS | Transport security |
| **Email TLS** | Resend enforces TLS for email delivery | Email security |
| **At-rest encryption** | PostgreSQL encryption at rest (Neon) | Data security |
| **Attachment encryption** | R2 server-side encryption | Storage security |
| **Secret management** | API keys in environment variables, never in code | Secret security |

### 12.8 Audit Logging

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Notification events** | Log all notification creation, delivery, failure | Compliance |
| **Message events** | Log all message send, delete, archive | Compliance |
| **Preference changes** | Log all preference modifications | Accountability |
| **Access logs** | Log all conversation access | Security |
| **Admin actions** | Log all admin moderation actions | Governance |
| **Retention** | Audit logs retained for 7 years | Legal compliance |

### 12.9 Spam Prevention

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Rate limiting** | Max 10 messages per conversation per minute | Prevent spam |
| **Content filtering** | Basic profanity filter on messages | Quality |
| **Attachment limits** | Max 5 attachments per message, 10MB each | Storage protection |
| **Link validation** | Validate URLs in messages before delivery | Phishing prevention |
| **Report mechanism** | Users can report spam messages | Quality control |

### 12.10 Rate Limiting

| Resource | Limit | Window | Rationale |
|----------|-------|--------|-----------|
| **Message send** | 10 messages | 1 minute | Prevent flooding |
| **Conversation create** | 5 conversations | 1 minute | Prevent abuse |
| **Notification read** | 100 operations | 1 minute | Normal usage |
| **Search queries** | 30 queries | 1 minute | Prevent abuse |
| **Email sends** | 500 emails | 1 hour | Deliverability |
| **Preference changes** | 10 changes | 1 minute | Prevent manipulation |

### 12.11 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| No rate limiting on messages | Spam, abuse | Rate limits per resource |
| Storing API keys in code | Secret leakage | Environment variables |
| No DKIM/SPF/DMARC | Email spoofing, low deliverability | Full email authentication |
| No audit logging | Compliance failure | Complete audit trail |
| No conversation isolation | Privacy violation | RLS + permission checks |

---

## 13. Accessibility

### 13.1 What

Accessibility standards for mobile notifications, keyboard navigation, screen readers, responsive messaging, and reduced motion across the communication engine.

### 13.2 Why

- **Inclusion:** Communication must be accessible to all users
- **Compliance:** WCAG 2.1 AA compliance required
- **Mobile:** 70%+ traffic is mobile — touch accessibility is critical
- **Legal:** Accessibility laws require inclusive design

### 13.3 Where

All notification UI components, messaging interface, email templates, and preference screens.

### 13.4 Mobile Notifications

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Touch targets** | Minimum 44x44px for all interactive elements | Touch accessibility |
| **Notification tray** | Swipe down to access on mobile | Mobile convention |
| **Haptic feedback** | Vibration on urgent notifications (if supported) | Mobile UX |
| **Read aloud** | Support OS-level notification read aloud | Screen reader users |
| **Quiet hours** | Respect OS-level Do Not Disturb | User comfort |
| **Badge count** | Clear, visible badge on app icon | At-a-glance awareness |

### 13.5 Keyboard Navigation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Tab order** | Logical tab order through notification list | Keyboard users |
| **Enter to open** | Enter key opens notification detail | Keyboard convention |
| **Escape to close** | Escape closes notification panel | Keyboard convention |
| **Arrow keys** | Navigate between notifications | Keyboard convention |
| **Shortcuts** | `N` for notifications, `M` for messages | Power users |
| **Focus visible** | Visible focus indicator on all interactive elements | Visibility |
| **Skip links** | "Skip to main content" link | Screen reader users |

### 13.6 Screen Readers

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **ARIA labels** | All interactive elements have descriptive ARIA labels | Screen reader users |
| **Role attributes** | Correct ARIA roles for notifications, messages, lists | Semantic HTML |
| **Live regions** | New notifications announced via `aria-live` regions | Real-time updates |
| **Alt text** | All notification icons have alt text | Image accessibility |
| **Status announcements** | Read/unread status announced to screen readers | State awareness |
| **Headings** | Proper heading hierarchy in notification panel | Navigation |

### 13.7 Responsive Messaging

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Mobile layout** | Full-screen messaging on mobile | Focus on conversation |
| **Desktop layout** | Split view: conversation list + message thread | Efficiency |
| **Tablet layout** | Responsive split view | Screen real estate |
| **Touch gestures** | Swipe to archive, long-press for options | Mobile convention |
| **Input positioning** | Message input in thumb zone on mobile | Ergonomics |
| **Keyboard resize** | Messaging UI adapts when virtual keyboard opens | Mobile UX |

### 13.8 Reduced Motion

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **`prefers-reduced-motion`** | Respect OS-level reduced motion setting | Accessibility |
| **Notification animations** | Disable slide-in animations when reduced motion enabled | Comfort |
| **Message animations** | Disable typing indicators and send animations | Comfort |
| **Transition animations** | Reduce or disable panel transitions | Comfort |
| **Skeleton loading** | Use static placeholders instead of shimmer | Comfort |

### 13.9 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Small touch targets | Mobile users can't tap accurately | Minimum 44x44px |
| No keyboard support | Keyboard users locked out | Full keyboard navigation |
| Missing ARIA labels | Screen reader users lost | Descriptive ARIA labels |
| Ignoring reduced motion | Causes discomfort for vestibular users | Respect OS preference |
| Non-responsive messaging | Unusable on mobile | Mobile-first responsive |

---

## 14. Future Readiness

### 14.1 What

Architecture preparedness for Push Notifications, SMS, WhatsApp Integration, AI Notification Assistant, AI Smart Replies, Broadcast Messaging, Scheduled Campaigns, Multi-language Templates, and Multi-channel Delivery.

### 14.2 Why

- **Scalability:** Communication needs evolve rapidly
- **Competitiveness:** Modern platforms require multi-channel delivery
- **Intelligence:** AI reduces support burden and improves engagement
- **Global:** Multi-language and multi-channel support for market expansion

### 14.3 Where

Channel adapters, template engine, delivery queue, preference system — all designed for extension.

### 14.4 Push Notifications

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Provider** | Firebase Cloud Messaging (FCM) | Free, reliable, cross-platform |
| **Permission** | Explicit browser permission required | Browser policy |
| **Use cases** | Order updates, flash sales, price drops, back-in-stock | High-engagement events |
| **Frequency** | Max 5 per day per user | Prevent fatigue |
| **Rich content** | Images, action buttons, deep links | Engagement |
| **Channel adapter** | `IPushChannel` interface (pluggable) | Extensibility |

### 14.5 SMS

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Provider** | Twilio (primary), MSG91 (India-specific backup) | Reliability |
| **Use cases** | OTP, delivery updates, critical security only | High-value, low-noise |
| **Consent** | Explicit SMS opt-in required | TRAI compliance |
| **Rate limit** | Max 5 SMS per day per user | Prevent spam |
| **Sender ID** | "NABOME" registered sender ID | Brand recognition |
| **Channel adapter** | `ISmsChannel` interface (pluggable) | Extensibility |

### 14.6 WhatsApp Integration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Provider** | WhatsApp Business API (future) | Indian market preference |
| **Use cases** | Order updates, delivery tracking, support | Customer preference |
| **Template approval** | All WhatsApp templates pre-approved by Meta | Compliance |
| **Consent** | Explicit WhatsApp opt-in required | WhatsApp policy |
| **Channel adapter** | `IWhatsAppChannel` interface (pluggable) | Extensibility |

### 14.7 AI Notification Assistant

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Smart scheduling** | AI determines optimal send time per user | Engagement optimization |
| **Content optimization** | AI suggests subject lines and content | Open rate improvement |
| **Frequency optimization** | AI adjusts notification frequency per user | Fatigue prevention |
| **Sentiment analysis** | AI analyzes message sentiment for support prioritization | Support efficiency |
| **Priority scoring** | AI scores notification importance for each user | Relevance |

### 14.8 AI Smart Replies

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Suggested replies** | AI suggests common responses in conversations | Efficiency |
| **Auto-categorize** | AI categorizes incoming messages for routing | Support efficiency |
| **Summary** | AI summarizes long conversation threads | Quick context |
| **Escalation detection** | AI detects escalation intent | Proactive support |

### 14.9 Broadcast Messaging

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Audience targeting** | Target by role, activity, purchase history | Relevance |
| **Scheduling** | Schedule broadcasts for optimal time | Engagement |
| **A/B testing** | Test different content variants | Optimization |
| **Analytics** | Track open rates, click rates, conversions | Measurement |
| **Rate limiting** | Max 1 broadcast per day per user | Prevent fatigue |

### 14.10 Scheduled Campaigns

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Campaign builder** | Visual campaign builder (future) | Marketing efficiency |
| **Multi-step** | Drip campaigns with multiple steps | Engagement |
| **Trigger-based** | Campaigns triggered by user behavior | Personalization |
| **Analytics** | Full funnel tracking | ROI measurement |
| **Opt-out** | One-click unsubscribe from campaigns | Compliance |

### 14.11 Multi-language Templates

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Translation management** | Centralized translation storage | Consistency |
| **Locale detection** | Auto-detect from user profile | Personalization |
| **Fallback chain** | Bengali → Hindi → English | Coverage |
| **RTL support** | Template structure supports RTL | Future Arabic/Hebrew |
| **Character encoding** | UTF-8 throughout | Universal support |

### 14.12 Multi-channel Delivery

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Channel orchestration** | Send via preferred channel, fallback to others | Delivery guarantee |
| **Channel preference** | User selects preferred channel per category | Personalization |
| **Cross-channel tracking** | Unified delivery status across channels | Observability |
| **Channel-specific content** | Adapt content per channel constraints | Optimization |
| **Graceful degradation** | If primary channel fails, try secondary | Reliability |

### 14.13 Channel Adapter Interface

```typescript
// ✓ CORRECT: Channel adapter interface for extensibility
interface INotificationChannel {
  readonly channel: string;
  
  send(notification: ChannelNotification): Promise<DeliveryResult>;
  validate(notification: ChannelNotification): boolean;
  getDeliveryStatus(deliveryId: string): Promise<DeliveryStatus>;
}

interface ChannelNotification {
  recipientId: string;
  recipientAddress: string;  // email, phone, device token
  subject: string;
  content: string;
  metadata: Record<string, unknown>;
}

interface DeliveryResult {
  success: boolean;
  deliveryId: string;
  channel: string;
  timestamp: Date;
  error?: string;
}

interface DeliveryStatus {
  deliveryId: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
```

### 14.14 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hardcoded to single channel | Can't add SMS/Push/WhatsApp | Pluggable channel adapters |
| No AI readiness | Missed optimization opportunities | AI-adjacent architecture |
| Monolithic template system | Can't support multi-language | Template engine with locale support |
| No broadcast capability | Manual notification for campaigns | Broadcast infrastructure |
| Ignoring WhatsApp | Indian market expects WhatsApp | WhatsApp channel adapter |

---

## 15. Mandatory Rules for AI Agents

### 15.1 What

Non-negotiable rules that every AI agent must follow when implementing, modifying, or reviewing the Notification, Communication & Messaging Engine.

### 15.2 Why

- **Consistency:** All implementations follow the same standards
- **Reliability:** Communication infrastructure must never fail silently
- **Security:** Communication is a vector for attacks — security is non-negotiable
- **Compliance:** Legal and regulatory requirements must be met

### 15.3 Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | **Every notification must have a permanent Notification ID** | Traceability, debugging, reference |
| 2 | **Every business event must be emitted via the event bus** | Decoupled architecture |
| 3 | **Email sending must never be synchronous in request handlers** | Non-blocking, reliable |
| 4 | **Failed notifications must never silently disappear** | DLQ + admin alerts |
| 5 | **Internal messaging must remain private between Admin and Shop Owner** | Privacy, security |
| 6 | **No Shop ↔ Shop communication** | Business isolation |
| 7 | **No Customer ↔ Shop communication via internal messaging** | Channel separation |
| 8 | **Security notifications must always be delivered** | Cannot be disabled |
| 9 | **Communication Engine must remain independent from business modules** | Maintainability |
| 10 | **Every notification delivery attempt must be logged** | Audit trail |
| 11 | **Event outbox must persist events before dispatch** | At-least-once delivery |
| 12 | **Templates must use dynamic variables, never hardcoded content** | Localization, personalization |
| 13 | **User preferences must be respected for all non-security notifications** | User control, compliance |
| 14 | **Email templates must include unsubscribe link** | CAN-SPAM compliance |
| 15 | **All notification and message tables must have Row-Level Security** | Multi-tenant security |
| 16 | **Conversation history must never be physically deleted** | Audit trail, compliance |
| 17 | **Delivery queue must be processed asynchronously** | Non-blocking |
| 18 | **Rate limits must be enforced on all messaging endpoints** | Abuse prevention |
| 19 | **Notification content must be validated before delivery** | Injection prevention |
| 20 | **DKIM, SPF, and DMARC must be configured for email domain** | Email deliverability + security |

### 15.4 Implementation Checklist

- [ ] Event bus implemented with outbox pattern
- [ ] Notification engine processes events asynchronously
- [ ] Channel adapters follow `INotificationChannel` interface
- [ ] Templates use dynamic variables (no hardcoded content)
- [ ] User preferences are preference-aware
- [ ] DLQ implemented with admin alerts
- [ ] Rate limits enforced on messaging endpoints
- [ ] RLS enabled on notification and message tables
- [ ] Audit logging on all communication events
- [ ] Email authentication (DKIM, SPF, DMARC) configured
- [ ] Accessibility standards met (ARIA, keyboard, screen reader)
- [ ] Mobile-first responsive design for all communication UI

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document** | Notification, Communication & Messaging Engine Architecture Standard |
| **Version** | 1.0 |
| **Date** | August 03, 2026 |
| **Status** | Active |
| **Author** | Nabome Architecture Team |
| **Supersedes** | None |
| **Complements** | ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), API_SERVICE_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), FINANCE_ENGINE_ARCHITECTURE.md (v1.0), SHOP_OWNER_DASHBOARD_ARCHITECTURE.md (v1.0) |
