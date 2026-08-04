# নবME (Nabome) — Automation, Workflow & Event Engine Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for automation, workflow orchestration, event-driven architecture, business rules, background processing, scheduling, and queue management  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), API_SERVICE_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), PAYMENT_ENGINE_ARCHITECTURE.md (v1.0), NOTIFICATION_COMMUNICATION_MESSAGING_ARCHITECTURE.md (v1.0), AUDIT_COMPLIANCE_ENGINE_ARCHITECTURE.md (v1.0), PRODUCT_ENGINE_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Automation Foundation](#1-automation-foundation)
2. [Event Engine](#2-event-engine)
3. [Workflow Engine](#3-workflow-engine)
4. [Business Rules Engine](#4-business-rules-engine)
5. [Automation Actions](#5-automation-actions)
6. [Scheduler](#6-scheduler)
7. [Queue System](#7-queue-system)
8. [Monitoring & Observability](#8-monitoring--observability)
9. [Admin Management](#9-admin-management)
10. [Module Integration](#10-module-integration)
11. [Permissions](#11-permissions)
12. [Security](#12-security)
13. [Performance](#13-performance)
14. [Accessibility](#14-accessibility)
15. [Future Readiness](#15-future-readiness)
16. [Mandatory Rules for AI Agents](#16-mandatory-rules-for-ai-agents)

---

## 1. Automation Foundation

### 1.1 What

The foundational philosophy, ownership model, lifecycle, integrity guarantees, and architectural principles that govern every automated process on the Nabome platform.

### 1.2 Why

- **Operational efficiency:** Repetitive business processes must execute without human intervention.
- **Consistency:** Automated workflows execute identically every time — no human error.
- **Reliability:** Workflows must survive edge runtime restarts, network partitions, and partial failures.
- **Scalability:** Automation must handle 0 to 1M+ events per day without redesign.
- **Auditability:** Every automated action must be traceable to its triggering event and responsible workflow.
- **Independence:** The Automation Engine is infrastructure — it must never be coupled to business modules.

### 1.3 Where

Every background job, scheduled task, event-driven action, approval flow, notification dispatch, status transition, and cross-module coordination across the Nabome platform.

### 1.4 Automation Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Every repetitive process is automatable** | If a human does it twice, the engine should do it once | Eliminate toil |
| **Workflows are configurable, not hardcoded** | Business rules live in configuration, not in code | Business agility |
| **Events are the universal language** | Modules communicate through events, never direct calls | Loose coupling |
| **Failures never corrupt business data** | Automation failures are isolated and retryable | Data integrity |
| **Every execution is auditable** | Workflow runs are logged with full context | Compliance |
| **Automation is independent** | The engine has zero dependencies on business modules | Survivability |
| **Configuration over code** | Business changes require config updates, not deploys | Speed |
| **Idempotent by default** | Every workflow action is safe to retry | Reliability |

### 1.5 Automation Ownership

| Entity | Owner | Location |
|--------|-------|----------|
| Event Engine | Automation domain | `api/_lib/automation/events/` |
| Workflow Engine | Automation domain | `api/_lib/automation/workflows/` |
| Business Rules Engine | Automation domain | `api/_lib/automation/rules/` |
| Scheduler | Automation domain | `api/_lib/automation/scheduler/` |
| Queue System | Automation domain | `api/_lib/automation/queues/` |
| Action Registry | Automation domain | `api/_lib/automation/actions/` |
| Monitoring | Automation domain | `api/_lib/automation/monitoring/` |
| Workflow Admin UI | Admin feature | `src/features/admin/workflows/` |

### 1.6 Automation Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATION LIFECYCLE                            │
│                                                                  │
│  1. DEFINITION                                                    │
│     → Admin defines workflow (UI or config file)                  │
│     → Workflow registered in workflow registry                    │
│     → Workflow validated against schema                           │
│     → Workflow published (disabled by default)                    │
│                                                                  │
│  2. ACTIVATION                                                    │
│     → Admin enables workflow                                      │
│     → Workflow registered with event listeners                    │
│     → Triggers bound to events                                   │
│                                                                  │
│  3. EXECUTION                                                     │
│     → Trigger event fires                                         │
│     → Conditions evaluated                                        │
│     → Actions executed in sequence                                │
│     → Branching logic applied                                     │
│     → State transitions recorded                                  │
│                                                                  │
│  4. MONITORING                                                    │
│     → Execution status tracked                                    │
│     → Failures detected and retried                               │
│     → Metrics collected                                           │
│     → Alerts triggered on anomalies                               │
│                                                                  │
│  5. COMPLETION                                                    │
│     → Workflow run marked complete                                │
│     → Audit record created                                        │
│     → Metrics updated                                             │
│     → Optional: trigger downstream workflows                      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.7 Workflow Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Atomicity** | Workflow steps execute in transaction where possible | No partial states |
| **Idempotency** | Every step is safe to retry without side effects | Reliability |
| **Isolation** | Workflow failures never corrupt business data | Safety |
| **Auditability** | Every execution creates an immutable audit record | Compliance |
| **Timeout** | Every workflow has a maximum execution time | Resource protection |
| **Circuit breaker** | Repeated failures trigger circuit breaker | Cascade prevention |
| **Dead letter** | Permanently failed events moved to DLQ | Manual intervention |
| **Replay safety** | Event replay produces identical results | Recovery capability |

### 1.8 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hardcoding business logic in handlers | Cannot change without redeploy | Use configurable workflows |
| Direct cross-module calls | Tight coupling, cascade failures | Use events |
| Synchronous automation | Blocks user requests | Background execution |
| Silent failures | Undetected automation gaps | Dead letter queue + alerts |
| Shared mutable state | Race conditions in edge runtime | Event-sourced state |
| Workflow logic in database triggers | Business logic in data layer | Workflow Engine orchestration |
| Skipping audit logging | Non-compliant, untraceable | Every execution audited |

---

## 2. Event Engine

### 2.1 What

The foundational event system that enables loose coupling between modules — every significant business action emits a typed event that any interested module can consume without the emitter knowing who listens.

### 2.2 Why

- **Decoupling:** Emitters don't know consumers; consumers don't know emitters.
- **Extensibility:** New consumers added without modifying emitters.
- **Replay:** Events can be replayed for recovery or debugging.
- **Audit:** Every event is an immutable record of something that happened.
- **Scalability:** Events processed asynchronously, non-blocking.

### 2.3 Where

Every module that produces or consumes business events — Orders, Payments, Products, Auth, CMS, Notifications, Finance, Shipping, Documents.

### 2.4 Event Types

| Category | Description | Examples | Source |
|----------|-------------|----------|--------|
| **Domain Events** | Business state changes | OrderCreated, PaymentCaptured, ProductPublished | Business handlers |
| **System Events** | Infrastructure events | ServiceStarted, HealthCheckFailed, CacheInvalidated | System monitors |
| **User Events** | User-initiated actions | UserRegistered, ProfileUpdated, AddressAdded | Auth handlers |
| **Scheduled Events** | Time-triggered events | DailyDigest, SubscriptionRenewal, ArchiveOldOrders | Scheduler |
| **Manual Events** | Admin-triggered events | ManualRefund, ForceStatusChange, BulkUpdate | Admin handlers |
| **Internal Events** | Cross-module coordination | InventoryReserved, TaxCalculated, ShippingRateFetched | Internal services |
| **External Events** | Third-party triggers | WebhookReceived, PaymentGatewayCallback, CourierUpdate | Webhook handlers |

### 2.5 Event Schema

Every event must conform to the Nabome Event Envelope:

```typescript
interface NabomeEvent {
  eventId: string;              // UUID v4 — unique per event
  eventType: EventType;         // Typed event identifier
  eventVersion: string;         // Schema version (e.g., "1.0")
  timestamp: string;            // ISO 8601 UTC
  source: EventSource;          // Module that emitted the event
  actor: EventActor;            // Who triggered it
  resourceId: string;           // Primary entity affected
  resourceType: string;         // Entity type (order, product, payment)
  data: Record<string, unknown>; // Event payload
  metadata: EventMetadata;      // Correlation, causation, context
  idempotencyKey: string;       // Prevent duplicate processing
}

interface EventActor {
  id: string;                   // User ID or "system"
  type: 'customer' | 'shop_owner' | 'admin' | 'system' | 'webhook';
  sessionId?: string;
}

interface EventMetadata {
  correlationId: string;        // Groups related events
  causationId?: string;         // Event that caused this event
  requestId?: string;           // Original HTTP request ID
  ipAddress?: string;
  userAgent?: string;
}
```

### 2.6 Domain Events Registry

#### Authentication Events

| Event Type | Payload | Consumers |
|------------|---------|-----------|
| `user.registered` | userId, email, method | Notification, Analytics, WelcomeFlow |
| `user.login` | userId, method, ip, device | Security, Analytics |
| `user.logout` | userId, sessionId | Analytics |
| `password.reset.requested` | userId, token | Notification |
| `password.reset.completed` | userId | Notification, Security |
| `email.verified` | userId, email | Notification, Profile |
| `session.created` | userId, sessionId, device | Security |
| `session.expired` | userId, sessionId | Cleanup |

#### Product Events

| Event Type | Payload | Consumers |
|------------|---------|-----------|
| `product.created` | productId, name, categoryId | Search, Analytics |
| `product.updated` | productId, changes | Search, Cache |
| `product.published` | productId, publishedAt | Search, Notification, Analytics |
| `product.archived` | productId, archivedAt | Search, Cache, Inventory |
| `product.deleted` | productId | Search, Cache, Cleanup |
| `variant.created` | variantId, productId | Inventory, Search |
| `variant.stock.changed` | variantId, oldStock, newStock | Cart, Notification |
| `variant.price.changed` | variantId, oldPrice, newPrice | Cart, Cache |
| `media.uploaded` | mediaId, productId | Storage, Search |
| `collection.published` | collectionId | Search, CMS |

#### Order Events

| Event Type | Payload | Consumers |
|------------|---------|-----------|
| `order.created` | orderId, profileId, total | Notification, Inventory, Finance |
| `order.confirmed` | orderId, paymentId | Notification, ShopOwner |
| `order.accepted` | orderId, shopOwnerId | Notification |
| `order.rejected` | orderId, reason, refundInitiated | Notification, Finance, Refund |
| `order.processing` | orderId | Notification |
| `order.packing` | orderId | Notification |
| `order.ready_to_ship` | orderId | Notification |
| `order.shipped` | orderId, trackingNumber, courier | Notification, Tracking |
| `order.in_transit` | orderId, trackingEvent | Notification |
| `order.delivered` | orderId, deliveredAt | Notification, Review, Finance |
| `order.completed` | orderId | Notification, Analytics |
| `order.cancelled` | orderId, reason, actor | Notification, Inventory, Finance, Refund |
| `order.return_requested` | orderId, reason, items | Notification, ShopOwner, Refund |
| `order.return_approved` | orderId | Notification, Refund, Pickup |
| `order.return_rejected` | orderId, reason | Notification |
| `order.refunded` | orderId, refundId, amount | Notification, Finance |
| `order.status_changed` | orderId, from, to, actor | Audit, Notification |

#### Payment Events

| Event Type | Payload | Consumers |
|------------|---------|-----------|
| `payment.initiated` | paymentId, orderId, amount | Audit |
| `payment.captured` | paymentId, orderId, amount | Order, Notification, Finance |
| `payment.failed` | paymentId, orderId, reason | Notification, Order, Audit |
| `payment.refunded` | paymentId, refundId, amount | Order, Notification, Finance |
| `payment.partial_refunded` | paymentId, refundId, amount | Order, Notification, Finance |
| `payment.settled` | paymentId, settlementId | Finance, Settlement |
| `payment.expired` | paymentId, orderId | Order, Inventory |

#### Shipping Events

| Event Type | Payload | Consumers |
|------------|---------|-----------|
| `shipment.created` | shipmentId, orderId, courier | Notification, Tracking |
| `shipment.picked_up` | shipmentId, trackingNumber | Notification |
| `shipment.in_transit` | shipmentId, location | Notification, Tracking |
| `shipment.out_for_delivery` | shipmentId | Notification |
| `shipment.delivered` | shipmentId, deliveredAt | Order, Notification, Review |
| `shipment.failed` | shipmentId, reason | Order, Notification, Reschedule |
| `shipment.returned` | shipmentId | Order, Notification, Finance |

#### Finance Events

| Event Type | Payload | Consumers |
|------------|---------|-----------|
| `refund.initiated` | refundId, orderId, amount | Notification, Audit |
| `refund.completed` | refundId, orderId, amount | Order, Notification |
| `refund.failed` | refundId, reason | Notification, Audit |
| `settlement.created` | settlementId, shopId, amount | ShopOwner, Notification |
| `settlement.paid` | settlementId, paidAt | ShopOwner, Notification, Finance |
| `invoice.generated` | invoiceId, orderId | Document, Notification |
| `tax.calculated` | taxId, orderId, amount | Audit |

#### CMS Events

| Event Type | Payload | Consumers |
|------------|---------|-----------|
| `page.published` | pageId, slug | Cache, Search |
| `page.unpublished` | pageId | Cache, Search |
| `homepage.updated` | version | Cache |
| `blog.post.published` | postId | Search, Notification |

#### Notification Events

| Event Type | Payload | Consumers |
|------------|---------|-----------|
| `notification.created` | notificationId, channel | Delivery |
| `notification.delivered` | notificationId | Analytics |
| `notification.failed` | notificationId, reason | Retry, DLQ |
| `notification.read` | notificationId | Analytics |

#### System Events

| Event Type | Payload | Consumers |
|------------|---------|-----------|
| `system.health_check` | status, metrics | Monitoring |
| `system.deployment` | version, timestamp | Monitoring |
| `system.error` | error, context | Monitoring, Alerting |
| `workflow.triggered` | workflowId, eventId | Workflow Engine |
| `workflow.completed` | workflowId, runId | Monitoring, Audit |
| `workflow.failed` | workflowId, runId, error | Monitoring, Alerting |

### 2.7 Event Emission Pattern

```typescript
// ✓ CORRECT: Event emission from business handler
import { emitEvent } from '../../_lib/automation/events/emitter';
import { EventType } from '../../_lib/automation/events/types';

export async function confirmOrder(request: Request, env: Env) {
  const user = await authenticate(request);
  const body = await validateRequest(request, confirmOrderSchema);

  const order = await db.order.update({
    where: { id: body.orderId },
    data: { status: 'confirmed', confirmedAt: new Date() },
  });

  // Emit event — non-blocking, fire-and-forget
  await emitEvent({
    eventType: EventType.ORDER_CONFIRMED,
    source: 'orders',
    actor: { id: user.id, type: user.role },
    resourceId: order.id,
    resourceType: 'order',
    data: {
      orderId: order.id,
      profileId: order.profileId,
      total: order.total,
    },
    idempotencyKey: `order-confirmed-${order.id}`,
  });

  return success(order);
}

// ✗ WRONG: Direct cross-module call
export async function confirmOrder(request: Request, env: Env) {
  const order = await db.order.update({ ... });
  await notificationService.sendOrderConfirmation(order); // Tight coupling!
  await financeService.recordRevenue(order);              // Tight coupling!
  await auditService.log('order_confirmed', order);        // Tight coupling!
  return success(order);
}
```

### 2.8 Event Dispatch Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EVENT DISPATCH ARCHITECTURE                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  EVENT EMITTERS                            │   │
│  │                                                           │   │
│  │  Business Handlers │ Services │ Scheduler │ Webhooks       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 EVENT OUTBOX (DB-backed)                   │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │   Write     │  │   Buffer     │  │    Dispatch    │  │   │
│  │  │  (atomic    │  │  (in-memory  │  │  (async poll)  │  │   │
│  │  │  with biz)  │  │   batch)     │  │                │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 EVENT ROUTER                               │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │  Type-based  │  │  Priority    │  │  Fan-out       │  │   │
│  │  │  routing     │  │  ordering    │  │  to consumers  │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 EVENT CONSUMERS                            │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Workflow │  │Notifica- │  │  Audit   │  │ Analytics││   │
│  │  │  Engine  │  │  tions   │  │  Logger  │  │ Collector││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │  Search  │  │  Cache   │  │ Finance  │  │Inventory ││   │
│  │  │ Indexer  │  │Inval.    │  │  Engine  │  │ Manager  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.9 Event Outbox Pattern

The Event Outbox ensures at-least-once delivery guarantee using the transactional outbox pattern:

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Atomic write** | Event written in same transaction as business data | No lost events |
| **Async dispatch** | Background process polls outbox and dispatches | Non-blocking |
| **Batch processing** | Dispatch up to 100 events per poll cycle | Throughput |
| **Idempotent consumers** | Consumers handle duplicate delivery | At-least-once semantics |
| **Ordering** | Events ordered by insertion sequence per type | Consistent state |
| **Retry on failure** | Failed dispatch retried with exponential backoff | Reliability |
| **Dead letter** | Events failing after max retries moved to DLQ | Manual intervention |
| **Cleanup** | Dispatched events archived after 7 days | Storage management |

### 2.10 Event Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Idempotency key** | Every event has a unique idempotency key | Prevent duplicate processing |
| **Correlation ID** | Groups related events across modules | Traceability |
| **Causation ID** | Links event to its cause | Causal traceability |
| **Timestamp** | UTC ISO 8601, server-generated | Temporal accuracy |
| **Schema version** | Event schema versioned for evolution | Backward compatibility |
| **Immutable** | Events are never modified after emission | Audit integrity |
| **Ordering** | Per-source ordering guaranteed | Consistent state |

### 2.11 External Event Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Webhook ingestion** | External webhooks converted to internal events | Uniform processing |
| **Signature verification** | All external events verified | Security |
| **Rate limiting** | External event sources rate-limited | Abuse prevention |
| **Schema validation** | External payloads validated against schema | Data integrity |
| **Transformation** | External event formats normalized | Consistency |
| **Idempotency** | External event deduplication | Reliability |

---

## 3. Workflow Engine

### 3.1 What

The configurable workflow orchestration system that defines, validates, executes, and monitors multi-step business processes — from simple status updates to complex approval chains.

### 3.2 Why

- **Configurability:** Business processes change without code changes.
- **Visibility:** Every workflow step is visible and auditable.
- **Consistency:** Same workflow produces same result every time.
- **Compliance:** Workflows enforce business rules automatically.
- **Flexibility:** Admins create and modify workflows via UI.

### 3.3 Where

Order processing, product approval, return approval, refund approval, settlement approval, notification delivery, CMS publishing, scheduled publishing, and any multi-step business process.

### 3.4 Workflow Definition

Every workflow is defined as a directed acyclic graph (DAG) of steps with explicit inputs, outputs, and transition rules:

```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  errorHandling: WorkflowErrorHandling;
  metadata: WorkflowMetadata;
}

interface WorkflowTrigger {
  type: 'event' | 'schedule' | 'manual' | 'webhook';
  event?: EventType;              // For event triggers
  schedule?: ScheduleConfig;      // For schedule triggers
  conditions?: Condition[];       // Pre-filter before workflow starts
}

interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  action: StepAction;
  inputs: Record<string, StepInput>;
  conditions?: Condition[];
  branches?: StepBranch[];
  timeout?: number;               // Max execution time in ms
  retryPolicy?: RetryPolicy;
  compensationAction?: StepAction; // Rollback on failure
}

type StepType =
  | 'action'                       // Execute an action
  | 'condition'                    // Branch based on condition
  | 'parallel'                     // Execute multiple steps in parallel
  | 'wait'                         // Wait for event or duration
  | 'approval'                     // Wait for human approval
  | 'subworkflow'                  // Execute another workflow
  | 'notification'                 // Send notification
  | 'integration';                 // Call external service

interface StepAction {
  type: string;                    // Action type from Action Registry
  config: Record<string, unknown>; // Action-specific config
}

interface Condition {
  field: string;                   // Data path to evaluate
  operator: ConditionOperator;
  value: unknown;
  logic?: 'and' | 'or';           // Combines with next condition
}

type ConditionOperator =
  | 'equals' | 'not_equals'
  | 'greater_than' | 'less_than'
  | 'greater_or_equal' | 'less_or_equal'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'in' | 'not_in'
  | 'is_empty' | 'is_not_empty';

interface StepBranch {
  condition: Condition[];
  nextStepId: string;
}

interface RetryPolicy {
  maxRetries: number;
  backoff: 'linear' | 'exponential';
  initialDelay: number;           // ms
  maxDelay: number;               // ms
}

interface WorkflowErrorHandling {
  onStepFailure: 'stop' | 'retry' | 'skip' | 'compensate' | 'notify';
  onTimeout: 'stop' | 'retry' | 'skip';
  fallbackAction?: StepAction;
  alertOnFailure: boolean;
}

interface WorkflowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  source: 'trigger' | 'step_output' | 'static' | 'computed';
  defaultValue?: unknown;
}
```

### 3.5 Workflow States

Every workflow instance (run) follows a defined lifecycle:

| State | Description | Next Possible States |
|-------|-------------|---------------------|
| **pending** | Workflow run created, not yet started | running, cancelled |
| **running** | Workflow executing steps | completed, failed, waiting, paused |
| **waiting** | Waiting for external event or approval | running, timed_out |
| **paused** | Admin paused execution | running, cancelled |
| **completed** | All steps executed successfully | (terminal) |
| **failed** | One or more steps failed permanently | (terminal) |
| **timed_out** | Workflow exceeded maximum execution time | (terminal) |
| **cancelled** | Admin cancelled execution | (terminal) |
| **compensating** | Rolling back completed steps | completed (compensated), failed |

### 3.6 Workflow Execution

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW EXECUTION ENGINE                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 TRIGGER DISPATCHER                         │   │
│  │                                                           │   │
│  │  Event Listener │ Scheduler │ Manual │ Webhook            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 WORKFLOW RESOLVER                          │   │
│  │                                                           │   │
│  │  1. Match trigger event to workflows                      │   │
│  │  2. Evaluate pre-conditions                               │   │
│  │  3. Check workflow is enabled                              │   │
│  │  4. Create workflow run instance                           │   │
│  │  5. Initialize execution context (variables)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 STEP EXECUTOR                              │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │  Resolve     │  │  Evaluate    │  │    Execute     │  │   │
│  │  │  next step   │  │  conditions  │  │    action      │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  │                                                           │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │   │
│  │  │  Capture     │  │  Handle      │  │    Record      │  │   │
│  │  │  outputs     │  │  errors      │  │    audit       │  │   │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 COMPLETION HANDLER                         │   │
│  │                                                           │   │
│  │  1. Mark workflow run as completed/failed                  │   │
│  │  2. Emit completion event                                  │   │
│  │  3. Update metrics                                        │   │
│  │  4. Trigger downstream workflows (if any)                  │   │
│  │  5. Archive execution logs                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.7 Workflow Validation

| Validation | Timing | Rule |
|------------|--------|------|
| **Schema validation** | Definition time | Workflow JSON conforms to schema |
| **Step validation** | Definition time | All steps have required fields |
| **Reference validation** | Definition time | Step references exist, no cycles |
| **Action validation** | Definition time | All actions registered in Action Registry |
| **Condition validation** | Definition time | All fields and operators valid |
| **Circular dependency** | Definition time | DAG is acyclic |
| **Timeout validation** | Definition time | Timeouts are reasonable (max 24h) |
| **Pre-condition evaluation** | Runtime | Trigger conditions met |
| **Input validation** | Runtime | Step inputs valid |
| **Permission validation** | Runtime | Actor authorized for action |

### 3.8 Workflow Versioning Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Version field** | Every workflow has a version string | Track changes |
| **Immutable versions** | Published workflows cannot be modified | Stability |
| **New version** | Admin creates new version to modify | Non-breaking |
| **Migration path** | Running instances continue on old version | No interruption |
| **Version history** | All versions retained | Audit trail |
| **Rollback** | Admin can revert to previous version | Recovery |

### 3.9 Workflow Ownership

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Created by** | Admin who created the workflow | Accountability |
| **Modified by** | Admin who last modified | Audit |
| **Enabled by** | Admin who activated | Audit |
| **Owned by** | Business domain it serves | Organizational clarity |
| **Global workflows** | Platform-wide (order processing) | System-wide automation |
| **Shop workflows** | Per-shop customization (future) | Multi-tenant readiness |

### 3.10 Pre-Built Workflows

#### Order Processing Workflow

```
Trigger: order.confirmed
Steps:
  1. [condition] Check if order total > 5000 → flag for review
  2. [action] Update order status to "processing"
  3. [notification] Notify shop owner of new order
  4. [wait] Wait for shop owner acceptance (max 48h)
  5. [condition] If accepted → continue, if rejected → refund flow
  6. [action] Update order status to "accepted"
  7. [notification] Notify customer "order accepted"
  8. [wait] Wait for packing confirmation
  9. [action] Update order status to "ready_to_ship"
  10. [notification] Notify customer "ready for pickup"
```

#### Product Approval Workflow

```
Trigger: product.created (by shop owner)
Steps:
  1. [action] Set product status to "pending_review"
  2. [notification] Notify admin of new product submission
  3. [approval] Wait for admin approval/rejection
  4. [condition] If approved → publish, if rejected → notify
  5. [action] Set product status to "published"
  6. [action] Index product in search
  7. [notification] Notify shop owner "product published"
```

#### Return Approval Workflow

```
Trigger: order.return_requested
Steps:
  1. [action] Set order status to "return_pending"
  2. [notification] Notify shop owner of return request
  3. [approval] Wait for shop owner decision (max 48h)
  4. [condition] If approved → process return, if rejected → notify
  5. [action] Update order status to "returned"
  6. [action] Initiate refund via payment engine
  7. [notification] Notify customer "return approved, refund initiated"
```

#### Refund Approval Workflow

```
Trigger: payment.refund_initiated
Steps:
  1. [condition] If amount > 10000 → require admin approval
  2. [approval] Wait for admin approval (if required)
  3. [action] Process refund via payment gateway
  4. [condition] If refund successful → update order, if failed → retry
  5. [action] Update order status to "refunded"
  6. [notification] Notify customer "refund processed"
  7. [action] Record finance entry
```

#### Settlement Approval Workflow

```
Trigger: settlement.created (scheduled daily)
Steps:
  1. [action] Calculate shop settlement amount
  2. [condition] If amount > threshold → require admin approval
  3. [approval] Wait for admin approval (if required)
  4. [action] Initiate payout via payment gateway
  5. [condition] If payout successful → record, if failed → retry
  6. [notification] Notify shop owner "settlement paid"
  7. [action] Record finance entry
```

#### Notification Delivery Workflow

```
Trigger: notification.created
Steps:
  1. [action] Resolve recipient preferences
  2. [action] Select template based on event type
  3. [action] Render template with event data
  4. [condition] If channel = "email" → email delivery
  5. [condition] If channel = "in_app" → in-app delivery
  6. [condition] If channel = "sms" → sms delivery (future)
  7. [action] Update notification status to "delivered"
```

#### CMS Publishing Workflow

```
Trigger: manual (admin action)
Steps:
  1. [action] Validate CMS content
  2. [condition] If content has images → optimize images
  3. [action] Publish content to CDN
  4. [action] Invalidate cache
  5. [action] Update search index
  6. [notification] Notify content team "published"
```

#### Scheduled Publishing Workflow

```
Trigger: schedule (cron expression)
Steps:
  1. [action] Query items with scheduledAt <= now
  2. [condition] For each item → check eligibility
  3. [action] Update status to "published"
  4. [action] Index in search
  5. [notification] Notify owner "scheduled content published"
```

---

## 4. Business Rules Engine

### 4.1 What

The configurable rules evaluation system that determines whether workflow conditions are met, validates business constraints, and supports branching logic without code changes.

### 4.2 Why

- **Business agility:** Rules change without code changes.
- **Transparency:** Rules are visible to business stakeholders.
- **Consistency:** Same rules produce same decisions.
- **Auditability:** Every rule evaluation is logged.
- **Maintainability:** Rules are centralized, not scattered across handlers.

### 4.3 Where

Workflow conditions, order validation, pricing rules, eligibility checks, approval thresholds, notification routing, fraud detection, and any business decision point.

### 4.4 Rule Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS RULES ENGINE                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  RULE REGISTRY                             │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │ Condition│  │  Action  │  │  Branch  │  │Validation││   │
│  │  │  Rules   │  │  Rules   │  │  Rules   │  │  Rules   ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 RULE EVALUATOR                             │   │
│  │                                                           │   │
│  │  1. Parse rule expression                                 │   │
│  │  2. Resolve data context                                  │   │
│  │  3. Evaluate conditions                                   │   │
│  │  4. Apply operators                                       │   │
│  │  5. Combine with logic (AND/OR)                           │   │
│  │  6. Return boolean result                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 RULE CONSEQUENCES                          │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │  Allow   │  │  Deny    │  │  Route   │  │  Flag    ││   │
│  │  │          │  │          │  │          │  │          ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Conditions

| Condition Type | Description | Example |
|----------------|-------------|---------|
| **Field comparison** | Compare a field to a value | `order.total > 5000` |
| **Field presence** | Check if field exists/is set | `order.couponId IS NOT NULL` |
| **Collection check** | Check if item is in a list | `order.status IN ['confirmed', 'processing']` |
| **Time-based** | Check time conditions | `order.createdAt > NOW() - 24h` |
| **Count-based** | Check counts | `customer.orderCount > 5` |
| **Composite** | Combine multiple conditions | `total > 5000 AND is_new_customer` |
| **External data** | Reference external data sources | `inventory.stock > 0` |

### 4.6 Triggers

| Trigger Type | Description | Configuration |
|--------------|-------------|---------------|
| **Event trigger** | Fires on specific event | `event: order.created` |
| **Schedule trigger** | Fires on cron schedule | `cron: "0 9 * * *"` |
| **Manual trigger** | Fires on admin action | `action: "admin.approve"` |
| **Webhook trigger** | Fires on external webhook | `webhook: "/api/webhooks/courier"` |
| **Threshold trigger** | Fires when threshold crossed | `metric: "dailyOrders > 100"` |
| **Composite trigger** | Fires on multiple conditions | `event: X AND condition: Y` |

### 4.7 Actions

| Action Category | Examples | Configuration |
|-----------------|----------|---------------|
| **Status update** | Update order/product/payment status | `{ entity: "order", status: "confirmed" }` |
| **Notification** | Send email, in-app, SMS, push | `{ template: "order_confirmed", channel: "email" }` |
| **Document** | Generate invoice, receipt, label | `{ template: "invoice", format: "pdf" }` |
| **Integration** | Call external API, webhook | `{ url: "...", method: "POST", body: {...} }` |
| **Data operation** | Create, update, archive records | `{ entity: "refund", data: {...} }` |
| **Workflow trigger** | Trigger another workflow | `{ workflowId: "refund-process" }` |
| **Schedule** | Schedule future action | `{ delay: "24h", action: {...} }` |
| **Audit** | Create audit log entry | `{ event: "APPROVAL_GRANTED", details: {...} }` |

### 4.8 Branching

| Branch Type | Description | Example |
|-------------|-------------|---------|
| **If/else** | Simple conditional branch | If total > 5000 → review, else → auto-approve |
| **Switch/case** | Multi-way branch | Based on order type → different fulfillment |
| **Parallel** | Execute multiple branches simultaneously | Send email AND update CRM |
| **Loop** | Iterate over collection | Process each order item |
| **Early exit** | Terminate workflow early | If validation fails → stop |

### 4.9 Validation Rules

| Rule Category | Description | Examples |
|---------------|-------------|----------|
| **Input validation** | Validate workflow inputs | Required fields, types, ranges |
| **Business constraint** | Validate business rules | Stock > 0, price > 0, address valid |
| **Permission check** | Validate actor permissions | Admin-only actions, ownership |
| **State check** | Validate entity state | Order must be in "processing" |
| **Rate limit** | Prevent abuse | Max 10 approvals per hour |
| **Dependency check** | Validate prerequisites | Payment must be captured before fulfillment |

### 4.10 Dependencies

| Dependency Type | Description | Resolution |
|-----------------|-------------|------------|
| **Step dependency** | Step B requires Step A output | Sequential execution |
| **Data dependency** | Step requires data from previous step | Variable passing |
| **External dependency** | Step requires external service | Timeout + retry |
| **Approval dependency** | Step requires human approval | Wait state |
| **Time dependency** | Step must execute at specific time | Scheduler integration |
| **Event dependency** | Step waits for external event | Event listener |

### 4.11 Business Constraints

| Constraint | Standard | Rationale |
|------------|----------|-----------|
| **Order value limit** | COD max ₹5,000 | Risk management |
| **Refund threshold** | > ₹10,000 requires admin approval | Financial control |
| **Return window** | 7 days from delivery | Business policy |
| **Settlement threshold** | Min ₹500 for payout | Operational efficiency |
| **Auto-archive** | Orders 30 days after completion | Storage management |
| **Session limit** | 5 sessions per user | Security |
| **Rate limits** | Per-endpoint, per-user | Abuse prevention |

---

## 5. Automation Actions

### 5.1 What

The registry of all executable actions that workflows can invoke — each action is a self-contained, idempotent unit of work with defined inputs, outputs, and error behavior.

### 5.2 Why

- **Reusability:** Same action used across multiple workflows.
- **Testability:** Actions tested independently.
- **Maintainability:** Action logic centralized.
- **Composability:** Complex workflows built from simple actions.

### 5.3 Where

Every workflow step that performs an operation.

### 5.4 Action Registry

| Action | Module | Description | Inputs | Outputs |
|--------|--------|-------------|--------|---------|
| **send_notification** | Notifications | Send email/in-app notification | template, recipient, data | notificationId |
| **send_email** | Email | Send transactional email | to, template, data | emailId |
| **update_status** | Domain | Update entity status | entity, entityId, status, reason | updatedEntity |
| **create_record** | Domain | Create new database record | entity, data | newRecord |
| **update_record** | Domain | Update existing record | entity, entityId, data | updatedRecord |
| **archive_record** | Domain | Soft-delete/archive record | entity, entityId | archivedRecord |
| **generate_document** | Documents | Generate PDF/document | template, data, entityId | documentUrl |
| **schedule_task** | Scheduler | Schedule future action | delay, action, config | taskId |
| **create_audit_event** | Audit | Log audit event | event, data, severity | auditId |
| **trigger_workflow** | Workflow | Trigger another workflow | workflowId, data | workflowRunId |
| **call_webhook** | Integration | Call external webhook | url, method, headers, body | response |
| **update_search_index** | Search | Update search index | entity, entityId, action | indexed |
| **invalidate_cache** | Cache | Invalidate cache entries | keys, pattern | invalidated |
| **calculate_tax** | Finance | Calculate tax for order | orderId, items, address | taxAmount |
| **process_refund** | Payments | Initiate refund | orderId, amount, reason | refundId |
| **reserve_inventory** | Inventory | Reserve stock for order | orderId, items | reservationId |
| **release_inventory** | Inventory | Release reserved stock | reservationId | released |
| **create_shipment** | Shipping | Create shipping label | orderId, courier, address | shipmentId |

### 5.5 Action Interface

```typescript
interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  module: string;
  inputSchema: Record<string, InputDefinition>;
  outputSchema: Record<string, OutputDefinition>;
  timeout: number;
  retryPolicy: RetryPolicy;
  idempotent: boolean;
  permissions: string[];
}

interface InputDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  default?: unknown;
}

interface ActionContext {
  workflowRunId: string;
  stepId: string;
  variables: Record<string, unknown>;
  actor: EventActor;
  correlationId: string;
}

interface ActionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
```

### 5.6 Action Best Practices

| Practice | Standard | Rationale |
|----------|----------|-----------|
| **Idempotent** | Same inputs → same outputs, no duplicate side effects | Retry safety |
| **Atomic** | Action either fully succeeds or fully fails | No partial states |
| **Time-bounded** | Every action has a timeout | Resource protection |
| **Observable** | Actions emit execution events | Monitoring |
| **Compensatable** | Actions define rollback when possible | Error recovery |
| **Stateless** | No shared mutable state between executions | Concurrency safety |
| **Self-contained** | Action logic in one place, no hidden dependencies | Maintainability |

---

## 6. Scheduler

### 6.1 What

The time-based job scheduling system that supports delayed, recurring, one-time, and cron-based job execution with priority, retry, and monitoring capabilities.

### 6.2 Why

- **Automation:** Time-based processes run without human intervention.
- **Reliability:** Jobs survive edge runtime restarts.
- **Flexibility:** Support for every scheduling pattern.
- **Visibility:** Scheduled jobs are visible and manageable.

### 6.3 Where

Daily settlement processing, weekly reports, product archive cleanup, subscription renewals, scheduled publishing, data aggregation, cache warming, and any time-based automation.

### 6.4 Job Types

| Job Type | Description | Example |
|----------|-------------|---------|
| **One-time** | Execute once at specific time | Send welcome email 24h after registration |
| **Delayed** | Execute after delay from now | Retry payment in 30 minutes |
| **Recurring** | Execute on repeating schedule | Daily settlement at 9:00 AM |
| **Cron** | Execute on cron expression | Weekly report every Monday at 6:00 AM |
| **Interval** | Execute every N minutes/hours | Health check every 5 minutes |

### 6.5 Schedule Configuration

```typescript
interface ScheduleConfig {
  type: 'once' | 'delay' | 'recurring' | 'cron' | 'interval';
  // One-time
  executeAt?: string;           // ISO 8601 timestamp
  // Delay
  delayMs?: number;             // Delay from now in ms
  // Recurring
  frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string;                // HH:mm (for daily/weekly/monthly)
  dayOfWeek?: number;           // 0-6 (for weekly)
  dayOfMonth?: number;          // 1-31 (for monthly)
  // Cron
  cron?: string;                // Standard cron expression
  // Interval
  intervalMs?: number;          // Interval in ms
  // Limits
  maxExecutions?: number;       // Stop after N executions
  endDate?: string;             // Stop after this date
  timezone?: string;            // Default: UTC
}
```

### 6.6 Job Priorities

| Priority | Level | Use Case | Max Concurrent |
|----------|-------|----------|----------------|
| **critical** | 0 | Payment processing, security events | Unlimited |
| **high** | 1 | Order processing, refund processing | 10 |
| **normal** | 2 | Notification delivery, search indexing | 20 |
| **low** | 3 | Report generation, data aggregation | 5 |
| **background** | 4 | Cache warming, analytics, cleanup | 3 |

### 6.7 Retry Strategy

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Max retries** | 3 (default), configurable per job type | Balance reliability vs. resource usage |
| **Backoff** | Exponential with jitter | Prevent thundering herd |
| **Initial delay** | 30 seconds | Allow transient issues to resolve |
| **Max delay** | 1 hour | Cap wait time |
| **Retry on** | Network errors, timeouts, 5xx errors | Transient failures |
| **No retry on** | 4xx errors, validation failures | Permanent failures |
| **Dead letter** | After max retries | Manual intervention |

```typescript
interface RetryPolicy {
  maxRetries: number;
  backoff: 'linear' | 'exponential';
  initialDelay: number;         // ms
  maxDelay: number;             // ms
  jitter: boolean;              // Add random jitter
  retryableErrors: string[];    // Error codes to retry on
}
```

### 6.8 Scheduler Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCHEDULER ARCHITECTURE                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  SCHEDULE REGISTRY                         │   │
│  │                                                           │   │
│  │  Cron Jobs │ Delayed Jobs │ Recurring │ One-time           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  SCHEDULE CHECKER                          │   │
│  │                                                           │   │
│  │  Poll interval: 30 seconds                                │   │
│  │  Query: jobs WHERE nextRunAt <= NOW() AND status = pending│   │
│  │  Batch: up to 50 jobs per cycle                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  JOB DISPATCHER                            │   │
│  │                                                           │   │
│  │  1. Claim job (atomic: status = claimed)                  │   │
│  │  2. Create execution record                               │   │
│  │  3. Enqueue to priority queue                             │   │
│  │  4. Update nextRunAt for recurring jobs                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  JOB EXECUTOR                              │   │
│  │                                                           │   │
│  │  Worker pool → Queue consumer → Action executor            │   │
│  │  Timeout handling → Retry logic → Dead letter              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Queue System

### 7.1 What

The reliable job queue infrastructure that ensures background tasks are processed exactly once, in priority order, with retry and dead letter support.

### 7.2 Why

- **Reliability:** Jobs survive runtime restarts.
- **Scalability:** Process jobs concurrently.
- **Prioritization:** Critical jobs processed first.
- **Observability:** Queue depth and processing rates visible.
- **Resilience:** Failed jobs retried, permanently failed jobs isolated.

### 7.3 Where

Email delivery, notification dispatch, image processing, search indexing, report generation, data aggregation, analytics collection, and any background processing.

### 7.4 Queue Types

| Queue | Purpose | Priority | Workers |
|-------|---------|----------|---------|
| **critical** | Payment processing, security | 0 | Unlimited |
| **high** | Order processing, refund | 1 | 10 |
| **default** | General background tasks | 2 | 20 |
| **low** | Reports, analytics, cleanup | 3 | 5 |
| **background** | Cache warming, indexing | 4 | 3 |
| **retry** | Failed jobs awaiting retry | — | Shared |
| **dead_letter** | Permanently failed jobs | — | Manual |

### 7.5 Queue Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    QUEUE SYSTEM ARCHITECTURE                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  JOB PRODUCERS                            │   │
│  │                                                           │   │
│  │  API Handlers │ Workflows │ Scheduler │ Services           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  QUEUE MANAGER                             │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │  Enqueue  │  │ Priority │  │  Dedup   │  │  Rate    ││   │
│  │  │          │  │  Router  │  │  Checker │  │  Limiter ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  QUEUE STORAGE                             │   │
│  │                                                           │   │
│  │  PostgreSQL-backed queue tables:                          │   │
│  │  • job_queue (pending jobs)                               │   │
│  │  • job_claimed (being processed)                          │   │
│  │  • job_completed (finished)                               │   │
│  │  • job_failed (exhausted retries)                         │   │
│  │  • job_dead_letter (permanent failures)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  JOB WORKERS                               │   │
│  │                                                           │   │
│  │  Claim → Execute → Complete/Retry/DLQ                     │   │
│  │                                                           │   │
│  │  Worker pool: Configurable per queue type                 │   │
│  │  Heartbeat: Workers send heartbeat every 30s              │   │
│  │  Stale detection: Jobs claimed > 5min without heartbeat   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.6 Job Lifecycle

| State | Description | Next States |
|-------|-------------|-------------|
| **pending** | Job created, awaiting processing | claimed |
| **claimed** | Worker claimed the job | completed, failed |
| **completed** | Job executed successfully | (terminal) |
| **failed** | Job execution failed | pending (retry), dead_letter |
| **dead_letter** | Exhausted all retries | (terminal, manual intervention) |
| **cancelled** | Job cancelled before execution | (terminal) |

### 7.7 Queue Monitoring

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| **Queue depth** | Number of pending jobs | > 1000 |
| **Processing rate** | Jobs processed per minute | < 10/min |
| **Failure rate** | Percentage of failed jobs | > 5% |
| **DLQ depth** | Number of dead letter jobs | > 0 |
| **Claimed age** | Age of oldest claimed job | > 5 minutes |
| **Worker count** | Active workers per queue | < 1 |

### 7.8 Queue Recovery

| Scenario | Recovery Action |
|----------|----------------|
| **Worker crash** | Stale claimed jobs re-queued after heartbeat timeout |
| **Queue overflow** | Alert + automatic scaling (future) |
| **DLQ accumulation** | Alert admin, manual retry from admin UI |
| **Rate limit hit** | Jobs queued, processed when rate limit resets |
| **Database failure** | Jobs persisted, retried on recovery |

---

## 8. Monitoring & Observability

### 8.1 What

The comprehensive monitoring system that provides real-time visibility into workflow execution, job processing, queue health, and automation performance.

### 8.2 Why

- **Reliability:** Detect failures before users notice.
- **Performance:** Identify bottlenecks in automation.
- **Compliance:** Prove automation is working correctly.
- **Debugging:** Trace execution across modules.

### 8.3 Where

Workflow admin dashboard, operations dashboard, alerting system, audit reports.

### 8.4 Workflow Status Dashboard

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Active workflows** | Currently executing workflows | Count + list |
| **Completed today** | Workflows completed in last 24h | Count + trend |
| **Failed today** | Workflows that failed in last 24h | Count + list |
| **Average duration** | Mean workflow execution time | Time series |
| **Success rate** | Percentage of successful executions | Percentage + trend |
| **Pending approvals** | Workflows waiting for approval | Count + list |

### 8.5 Running Jobs

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Currently running** | Jobs being processed right now | Count + list |
| **By queue** | Jobs per queue type | Bar chart |
| **By priority** | Jobs per priority level | Bar chart |
| **Average duration** | Mean job execution time | Time series |
| **Longest running** | Jobs running longer than expected | List + alert |

### 8.6 Failed Jobs

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Failed today** | Jobs failed in last 24h | Count + list |
| **By error type** | Failures grouped by error | Bar chart |
| **Retry status** | Jobs in retry queue | Count |
| **DLQ count** | Permanently failed jobs | Count + list |
| **Failure trend** | Failure rate over time | Time series |

### 8.7 Retry History

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Retried today** | Jobs retried in last 24h | Count |
| **Retry success rate** | Percentage of retries that succeeded | Percentage |
| **Average retries** | Mean retries before success | Number |
| **Max retries hit** | Jobs that hit max retry count | Count + list |

### 8.8 Queue Metrics

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Queue depth** | Pending jobs per queue | Bar chart |
| **Processing rate** | Jobs processed per minute per queue | Time series |
| **Enqueue rate** | Jobs added per minute | Time series |
| **Wait time** | Time jobs wait before processing | Histogram |
| **Worker utilization** | Percentage of workers busy | Gauge |

### 8.9 Execution Logs

| Log Type | Content | Retention |
|----------|---------|-----------|
| **Workflow execution log** | Every step executed, inputs, outputs, duration | 90 days |
| **Job execution log** | Job start, end, result, errors | 90 days |
| **Event dispatch log** | Event emitted, dispatched, consumed | 30 days |
| **Queue operation log** | Enqueue, claim, complete, retry, DLQ | 30 days |
| **Scheduler log** | Schedule check, job creation, dispatch | 30 days |

### 8.10 Alerting Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| **Workflow failure rate high** | > 5% failures in 1h | Critical | Notify admin |
| **Queue depth high** | > 1000 pending jobs | Warning | Notify admin |
| **DLQ not empty** | Any jobs in DLQ | Critical | Notify admin |
| **Worker down** | No heartbeat for 5min | Critical | Notify admin |
| **Scheduler lag** | Jobs pending > 5min | Warning | Notify admin |
| **Workflow timeout** | Any workflow > 24h | Warning | Notify admin |
| **Approval SLA breach** | Approval pending > 48h | Warning | Notify admin |

---

## 9. Admin Management

### 9.1 What

The administrative interface and capabilities for managing, monitoring, and controlling all automation on the Nabome platform.

### 9.2 Why

- **Control:** Admins must control what automation runs.
- **Visibility:** Admins must see what automation is doing.
- **Intervention:** Admins must be able to fix automation issues.
- **Compliance:** Admins must prove automation is working correctly.

### 9.3 Where

Admin dashboard (`src/features/admin/workflows/`), operations dashboard, mobile admin views.

### 9.4 Workflow List

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **List view** | All workflows with status, last run, success rate | Overview |
| **Filtering** | By status, trigger type, module, creation date | Findability |
| **Sorting** | By name, last run, success rate, creation date | Organization |
| **Search** | Full-text search across workflow names and descriptions | Discovery |
| **Bulk actions** | Enable/disable/delete multiple workflows | Efficiency |

### 9.5 Automation Search

| Search Scope | Fields | Example |
|--------------|--------|---------|
| **Workflow search** | name, description, trigger, steps | "order processing" |
| **Execution search** | workflow name, status, date, actor | "failed workflows today" |
| **Job search** | job type, status, queue, date | "failed email jobs" |
| **Event search** | event type, source, date, resource | "order.confirmed today" |

### 9.6 Workflow History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Run history** | Every workflow execution recorded | Audit trail |
| **Step-by-step** | Every step execution with inputs/outputs | Debugging |
| **Duration** | Total and per-step duration | Performance analysis |
| **Actor** | Who/what triggered the run | Accountability |
| **Error details** | Full error information on failures | Debugging |
| **Retention** | 90 days for detailed logs, 1 year for summary | Storage management |

### 9.7 Execution Timeline

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Visual timeline** | Gantt-style visualization | Quick understanding |
| **Step status** | Color-coded by status (running, success, failed, waiting) | Visual clarity |
| **Duration bars** | Proportional to actual duration | Performance insight |
| **Click-through** | Click step to see details | Deep dive |
| **Correlation** | View related events across modules | Cross-module tracing |

### 9.8 Enable / Disable

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Toggle** | One-click enable/disable | Quick control |
| **Graceful disable** | Running instances complete, no new triggers | No disruption |
| **Bulk toggle** | Enable/disable multiple workflows | Batch operations |
| **Scheduled disable** | Disable workflow at specific time | Maintenance windows |
| **Audit** | All enable/disable actions logged | Accountability |

### 9.9 Manual Retry

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Retry failed step** | Re-execute a specific failed step | Targeted recovery |
| **Retry from step** | Re-execute workflow from specific step | Partial recovery |
| **Skip step** | Skip failed step, continue workflow | Workaround |
| **Force complete** | Mark workflow as completed manually | Edge cases |
| **Bulk retry** | Retry multiple failed workflows | Batch recovery |

### 9.10 Workflow Logs

| Log Type | Access Level | Content |
|----------|-------------|---------|
| **Execution logs** | Admin | Full execution details |
| **Error logs** | Admin | Error messages, stack traces |
| **Audit logs** | Admin | Who did what, when |
| **Performance logs** | Admin | Duration, resource usage |
| **Integration logs** | Admin | External API calls, responses |

---

## 10. Module Integration

### 10.1 What

How the Automation Engine integrates with every Nabome business module — maintaining loose coupling while enabling powerful cross-module coordination.

### 10.2 Why

- **Coordination:** Modules need to react to each other's events.
- **Consistency:** Cross-module operations must be reliable.
- **Independence:** Modules must not be tightly coupled.
- **Extensibility:** New modules integrate without modifying existing ones.

### 10.3 Where

Every module that produces events or consumes workflow actions.

### 10.4 Integration Matrix

| Module | Emits Events | Consumes Events | Workflow Integration | Action Integration |
|--------|-------------|-----------------|---------------------|-------------------|
| **Authentication** | user.registered, login, logout, password.* | — | Welcome flow, security alerts | update_status, send_notification |
| **Products** | product.*, variant.*, media.*, collection.* | — | Publishing workflow, approval flow | update_status, update_search_index |
| **Inventory** | stock.changed, reservation.*, allocation.* | order.created, order.cancelled | Stock management workflows | reserve_inventory, release_inventory |
| **Orders** | order.*, order.status_changed | payment.*, shipping.*, return.* | Order processing, return approval | update_status, send_notification |
| **Shipping** | shipment.*, tracking.* | order.accepted, order.packing | Fulfillment workflows | create_shipment, update_status |
| **Payments** | payment.*, refund.*, settlement.* | order.created, order.cancelled | Payment processing, refund approval | process_refund, create_audit_event |
| **Finance** | invoice.*, tax.*, settlement.* | payment.*, order.completed | Settlement workflow, reporting | generate_document, create_audit_event |
| **CMS** | page.*, blog.*, homepage.* | — | Publishing workflow, scheduled publish | update_search_index, invalidate_cache |
| **Notifications** | notification.*, template.* | All domain events | Notification delivery workflow | send_notification, send_email |
| **Documents** | document.*, template.* | order.*, payment.*, settlement.* | Document generation workflow | generate_document |
| **Reports** | report.*, analytics.* | Scheduled triggers | Report generation workflow | create_record, call_webhook |
| **Audit Logs** | audit.* | All events | — | create_audit_event |

### 10.5 Integration Patterns

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Event-driven** | Module reacts to another module's state change | Order engine reacts to payment.captured |
| **Workflow-triggered** | Multi-step cross-module process | Order processing workflow |
| **Action-call** | Module invokes another module's capability | Workflow calls notification action |
| **Scheduled** | Time-based cross-module coordination | Daily settlement workflow |
| **Manual** | Admin-initiated cross-module process | Manual refund workflow |

### 10.6 Integration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No direct imports** | Modules communicate via events, not imports | Loose coupling |
| **Event contracts** | Event schemas are stable contracts | Backward compatibility |
| **Idempotent consumers** | Consumers handle duplicate events | At-least-once delivery |
| **Timeout handling** | Cross-module calls have timeouts | Prevent cascading failures |
| **Circuit breaker** | Repeated failures trigger circuit breaker | Cascade prevention |
| **Compensation** | Failed cross-module ops can be rolled back | Data consistency |

---

## 11. Permissions

### 11.1 What

Access control for automation features — who can create, modify, execute, and monitor workflows.

### 11.2 Why

- **Security:** Unauthorized workflow modification can disrupt operations.
- **Compliance:** Automation changes must be attributed.
- **Control:** Different roles need different capabilities.

### 11.3 Where

Workflow admin UI, API handlers, workflow execution.

### 11.4 Permission Matrix

| Permission | Customer | Shop Owner | Admin | System |
|------------|----------|-----------|-------|--------|
| **View workflows** | — | Own shop | All | All |
| **Create workflow** | — | — | ✓ | — |
| **Modify workflow** | — | — | ✓ | — |
| **Enable/disable workflow** | — | — | ✓ | — |
| **Delete workflow** | — | — | ✓ | — |
| **View execution history** | — | Own shop | All | All |
| **View execution details** | — | Own shop | All | All |
| **Manual retry** | — | — | ✓ | — |
| **Cancel execution** | — | — | ✓ | — |
| **View queue status** | — | — | ✓ | — |
| **View failed jobs** | — | — | ✓ | — |
| **Retry failed job** | — | — | ✓ | — |
| **View metrics** | — | — | ✓ | ✓ |
| **Configure scheduler** | — | — | ✓ | — |
| **Manage permissions** | — | — | ✓ | — |
| **Trigger workflow manually** | — | — | ✓ | ✓ |
| **Approve workflow steps** | — | Own orders | All | — |

### 11.5 System Service Permissions

| Service | Permissions | Rationale |
|---------|-------------|-----------|
| **Event Dispatcher** | emit events, dispatch events | Core infrastructure |
| **Workflow Executor** | execute steps, update state | Core infrastructure |
| **Queue Worker** | claim, execute, complete jobs | Core infrastructure |
| **Scheduler** | create, dispatch scheduled jobs | Core infrastructure |
| **Audit Logger** | write audit records | Core infrastructure |
| **Notification Service** | send notifications | Core infrastructure |

---

## 12. Security

### 12.1 What

Security standards for the Automation Engine — ensuring workflows cannot be exploited, events cannot be forged, and actions cannot be unauthorized.

### 12.2 Why

- **Integrity:** Workflows execute correctly.
- **Confidentiality:** Sensitive data in workflows is protected.
- **Availability:** Automation cannot be disrupted by attacks.
- **Compliance:** Audit trail is tamper-proof.

### 12.3 Where

Event emission, workflow execution, action invocation, admin interface.

### 12.4 Workflow Validation

| Validation | Standard | Rationale |
|------------|----------|-----------|
| **Schema validation** | Workflow definitions validated against schema | Prevent malformed workflows |
| **Action whitelist** | Only registered actions can be used | Prevent unauthorized operations |
| **Condition sanitization** | Condition expressions sanitized | Prevent injection attacks |
| **Input validation** | All step inputs validated | Prevent data corruption |
| **Permission check** | Creator/admin permissions verified | Authorization |
| **Circular dependency** | No circular step references | Prevent infinite loops |

### 12.5 Permission Enforcement

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Actor attribution** | Every action attributed to an actor | Accountability |
| **Role-based access** | Permissions checked before execution | Authorization |
| **Least privilege** | Minimum permissions required | Security |
| **Audit logging** | All permission checks logged | Compliance |
| **Session validation** | Active session required for admin actions | Security |

### 12.6 Event Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Idempotency keys** | Every event has unique key | Prevent duplicate processing |
| **Timestamp validation** | Events within reasonable time window | Prevent replay |
| **Source verification** | Event source validated | Prevent spoofing |
| **Schema validation** | Events validated against schema | Data integrity |
| **Immutability** | Events never modified after emission | Audit integrity |

### 12.7 Replay Protection

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Idempotency keys** | Consumers check idempotency keys | Prevent duplicate actions |
| **Event deduplication** | Duplicate events within time window merged | Prevent duplicates |
| **Nonce tracking** | One-time use tokens for critical operations | Prevent replay |
| **Version checking** | Event schema version validated | Prevent version mismatch |

### 12.8 Audit Logging

| Event | What to Log | Retention |
|-------|-------------|-----------|
| **Workflow created** | Creator, workflow definition, timestamp | Permanent |
| **Workflow modified** | Modifier, changes, timestamp | Permanent |
| **Workflow enabled/disabled** | Actor, state change, timestamp | Permanent |
| **Workflow executed** | Trigger, steps, inputs, outputs, duration | 90 days |
| **Action executed** | Actor, action type, inputs, outputs, result | 90 days |
| **Job processed** | Job type, queue, duration, result | 90 days |
| **Permission check** | Actor, resource, result, timestamp | 30 days |

---

## 13. Performance

### 13.1 What

Performance standards ensuring the Automation Engine handles enterprise-scale event volumes without degrading user experience.

### 13.2 Why

- **User experience:** Automation must not slow down user requests.
- **Scalability:** Must handle 0 to 1M+ events per day.
- **Cost efficiency:** Resource usage must be optimized.
- **Reliability:** Performance degradation causes failures.

### 13.3 Where

Event emission, workflow execution, job processing, queue operations.

### 13.4 High Event Volume

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Event batching** | Events batched for dispatch (up to 100) | Throughput |
| **Async emission** | Event emission non-blocking | User experience |
| **Connection pooling** | Database connections pooled | Resource efficiency |
| **Index optimization** | Event queue indexed for fast queries | Query performance |
| **Partitioning** | Old events archived to separate tables | Query performance |

### 13.5 Background Execution

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Non-blocking** | All automation runs in background | User experience |
| **Worker pooling** | Configurable worker count per queue | Resource optimization |
| **Heartbeat** | Workers send heartbeat every 30s | Stale detection |
| **Graceful shutdown** | Workers complete current job before shutdown | No data loss |
| **Resource limits** | Max execution time, memory per job | Resource protection |

### 13.6 Parallel Processing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Parallel steps** | Independent steps execute simultaneously | Throughput |
| **Fan-out** | Multiple consumers process same event | Throughput |
| **Worker concurrency** | Multiple workers per queue type | Throughput |
| **Connection limits** | Max concurrent database connections | Resource protection |
| **Rate limiting** | Per-action rate limits | Abuse prevention |

### 13.7 Queue Optimization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Priority queues** | Critical jobs processed first | Business priority |
| **Batch claiming** | Workers claim multiple jobs at once | Throughput |
| **Claim timeout** | Jobs reclaimed after 5 minutes | Stale recovery |
| **Index optimization** | Queue tables indexed for fast claiming | Query performance |
| **Archive policy** | Completed jobs archived after 7 days | Storage management |

### 13.8 Failure Recovery

| Scenario | Recovery Time | Strategy |
|----------|--------------|----------|
| **Worker crash** | < 5 minutes | Stale job reclamation |
| **Queue overflow** | < 1 minute | Alert + manual intervention |
| **Database slowdown** | < 2 minutes | Connection pooling + timeout |
| **Event dispatch failure** | < 1 minute | Retry + DLQ |
| **Scheduler lag** | < 5 minutes | Catch-up on next cycle |

---

## 14. Accessibility

### 14.1 What

Accessibility standards for the workflow admin interface — ensuring all administrators can manage automation regardless of ability.

### 14.2 Why

- **Inclusion:** Every admin must be able to use the system.
- **Compliance:** Accessibility laws require WCAG 2.1 AA.
- **Usability:** Accessible design benefits all users.

### 14.3 Where

Workflow admin dashboard, execution timeline, queue monitoring, configuration screens.

### 14.4 Mobile Administration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Responsive design** | Workflow admin fully functional on mobile | 70%+ mobile traffic |
| **Touch targets** | Minimum 44px touch targets | Mobile usability |
| **Simplified mobile view** | Key actions prominent on mobile | Quick operations |
| **Offline capability** | View cached workflow status offline | Connectivity issues |

### 14.5 Responsive Workflow Viewer

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Adaptive layout** | Layout adjusts to screen size | All devices |
| **Collapsible panels** | Details panels collapsible on small screens | Space management |
| **Horizontal scroll** | Timeline horizontally scrollable on mobile | Content access |
| **Pinch to zoom** | Timeline details zoomable | Detail inspection |

### 14.6 Keyboard Navigation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Tab order** | Logical tab order through interface | Keyboard users |
| **Focus indicators** | Visible focus indicators on all interactive elements | Visibility |
| **Keyboard shortcuts** | Common actions available via keyboard | Power users |
| **Skip links** | Skip to main content link | Screen readers |

### 14.7 Screen Readers

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **ARIA labels** | All interactive elements labeled | Screen reader users |
| **Status announcements** | Status changes announced via ARIA live regions | Real-time updates |
| **Table headers** | All data tables have proper headers | Table navigation |
| **Error announcements** | Errors announced when they occur | Error awareness |
| **Progress indicators** | Loading states announced | Status awareness |

---

## 15. Future Readiness

### 15.1 What

Architectural provisions for future capabilities that extend the Automation Engine without redesign.

### 15.2 Why

- **Investment protection:** Current architecture supports future needs.
- **Competitive advantage:** Future capabilities added faster.
- **Scalability:** Architecture grows with platform needs.

### 15.3 Where

Workflow Engine, Rules Engine, Event Engine, Admin Interface.

### 15.4 Visual Workflow Builder

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **DAG representation** | Workflows representable as directed graphs | Visual builder input |
| **Drag-and-drop ready** | Step types and actions modular | Visual builder support |
| **Preview mode** | Workflows previewable before activation | Safe testing |
| **Export/import** | Workflows exportable as JSON | Portability |
| **Version comparison** | Visual diff between workflow versions | Change management |

### 15.5 No-Code Automation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Configuration-driven** | All workflows defined via config, not code | No-code ready |
| **Rule builder** | Conditions buildable via UI | No-code rules |
| **Template system** | Pre-built workflow templates | Quick start |
| **Guided setup** | Step-by-step workflow creation wizard | Beginner-friendly |
| **Validation feedback** | Real-time validation during creation | Error prevention |

### 15.6 AI Workflow Assistant

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Natural language input** | "When an order is placed, send a confirmation email" | AI-readable triggers |
| **Auto-generation** | AI suggests workflow steps from description | Accelerated creation |
| **Optimization suggestions** | AI identifies bottlenecks and suggests improvements | Performance |
| **Error diagnosis** | AI explains why workflows failed | Debugging |
| **Pattern detection** | AI identifies repetitive manual processes | Automation discovery |

### 15.7 AI Rule Suggestions

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Condition suggestions** | AI suggests conditions based on historical data | Data-driven rules |
| **Threshold optimization** | AI optimizes approval thresholds | Efficiency |
| **Anomaly detection** | AI flags unusual automation patterns | Security |
| **Performance recommendations** | AI suggests queue/worker optimization | Scalability |

### 15.8 External Webhooks

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Webhook triggers** | Workflows triggerable via external webhooks | Third-party integration |
| **Webhook management** | Admin UI for webhook configuration | Self-service |
| **Signature verification** | All webhook payloads verified | Security |
| **Rate limiting** | Webhook sources rate-limited | Abuse prevention |
| **Logging** | All webhook payloads logged | Debugging |

### 15.9 Third-Party Integrations

| Integration | Purpose | Architecture |
|-------------|---------|-------------|
| **Slack** | Workflow alerts to Slack channels | Webhook action |
| **Zapier** | Connect to 5000+ apps | Webhook trigger/action |
| **Make (Integromat)** | Visual automation platform | Webhook trigger/action |
| **Custom integrations** | Any HTTP API | Generic webhook action |

### 15.10 Distributed Processing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Worker scalability** | Workers can be scaled horizontally | Growth |
| **Queue partitioning** | Queues partitionable by region/domain | Isolation |
| **Event routing** | Events routable to specific workers | Targeted processing |
| **Consistency** | Distributed processing maintains consistency | Data integrity |

### 15.11 Cross-System Workflows

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Multi-platform events** | Events from multiple Nabome instances | Multi-tenant readiness |
| **Federated workflows** | Workflows spanning multiple systems | Enterprise integration |
| **Event bridging** | Events bridged between systems | Cross-system coordination |
| **Schema evolution** | Event schemas versioned for evolution | Backward compatibility |

---

## 16. Mandatory Rules for AI Agents

Every future AI agent working on the Nabome codebase MUST follow these rules when implementing or modifying the Automation Engine:

### 16.1 Architecture Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | **The Automation Engine is independent** — zero imports from business modules | Survivability |
| 2 | **Modules communicate via events** — never direct cross-module imports | Loose coupling |
| 3 | **Every workflow execution is auditable** — immutable audit record required | Compliance |
| 4 | **Workflows are configurable** — business rules in config, not code | Agility |
| 5 | **Failures never corrupt business data** — automation failures are isolated | Data integrity |
| 6 | **Background jobs support retries** — exponential backoff with jitter | Reliability |
| 7 | **Events use the Nabome Event Envelope** — standardized schema required | Consistency |
| 8 | **Actions are idempotent** — same inputs produce same outputs, no duplicates | Retry safety |
| 9 | **Queue operations are atomic** — job claiming is transactional | Concurrency safety |
| 10 | **Every event has an idempotency key** — prevent duplicate processing | Reliability |

### 16.2 Implementation Rules

| # | Rule | Rationale |
|---|------|-----------|
| 11 | **No console.log** — use Pino logger | Structured logging |
| 12 | **No `any` types** — use proper TypeScript types | Type safety |
| 13 | **No comments** — code must be self-documenting | Code quality |
| 14 | **Named exports only** — no default exports | Consistency |
| 15 | **Max file length 300 lines** — split larger files | Maintainability |
| 16 | **Max handler length 150 lines** — keep handlers focused | Readability |
| 17 | **Zod validation** — all inputs validated with Zod schemas | Security |
| 18 | **Error handling** — all async errors caught and handled | Reliability |
| 19 | **Timeout on all external calls** — prevent hanging | Resource protection |
| 20 | **Circuit breaker on repeated failures** — prevent cascade | Resilience |

### 16.3 Testing Rules

| # | Rule | Rationale |
|---|------|-----------|
| 21 | **Unit test every action** — actions tested in isolation | Quality |
| 22 | **Integration test workflows** — end-to-end workflow testing | Reliability |
| 23 | **Test failure scenarios** — retry, timeout, DLQ tested | Resilience |
| 24 | **Test idempotency** — verify actions are idempotent | Retry safety |
| 25 | **Test concurrency** — verify queue operations are atomic | Safety |

### 16.4 Documentation Rules

| # | Rule | Rationale |
|---|------|-----------|
| 26 | **Document workflow triggers** — every trigger type documented | Discoverability |
| 27 | **Document action inputs/outputs** — every action schema documented | Usability |
| 28 | **Document error codes** — every error code has a description | Debugging |
| 29 | **Document retry policies** — every retry policy explained | Operations |
| 30 | **Document monitoring metrics** — every metric has a threshold | Operations |

---

## Appendix A: Event Type Constants

```typescript
export const EventType = {
  // Auth
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  PASSWORD_RESET_REQUESTED: 'password.reset.requested',
  PASSWORD_RESET_COMPLETED: 'password.reset.completed',
  EMAIL_VERIFIED: 'email.verified',
  SESSION_CREATED: 'session.created',
  SESSION_EXPIRED: 'session.expired',

  // Products
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_PUBLISHED: 'product.published',
  PRODUCT_ARCHIVED: 'product.archived',
  PRODUCT_DELETED: 'product.deleted',
  VARIANT_CREATED: 'variant.created',
  VARIANT_STOCK_CHANGED: 'variant.stock.changed',
  VARIANT_PRICE_CHANGED: 'variant.price.changed',
  MEDIA_UPLOADED: 'media.uploaded',
  COLLECTION_PUBLISHED: 'collection.published',

  // Orders
  ORDER_CREATED: 'order.created',
  ORDER_CONFIRMED: 'order.confirmed',
  ORDER_ACCEPTED: 'order.accepted',
  ORDER_REJECTED: 'order.rejected',
  ORDER_PROCESSING: 'order.processing',
  ORDER_PACKING: 'order.packing',
  ORDER_READY_TO_SHIP: 'order.ready_to_ship',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_IN_TRANSIT: 'order.in_transit',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_COMPLETED: 'order.completed',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_RETURN_REQUESTED: 'order.return_requested',
  ORDER_RETURN_APPROVED: 'order.return_approved',
  ORDER_RETURN_REJECTED: 'order.return_rejected',
  ORDER_REFUNDED: 'order.refunded',
  ORDER_STATUS_CHANGED: 'order.status_changed',

  // Payments
  PAYMENT_INITIATED: 'payment.initiated',
  PAYMENT_CAPTURED: 'payment.captured',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_PARTIAL_REFUNDED: 'payment.partial_refunded',
  PAYMENT_SETTLED: 'payment.settled',
  PAYMENT_EXPIRED: 'payment.expired',

  // Shipping
  SHIPMENT_CREATED: 'shipment.created',
  SHIPMENT_PICKED_UP: 'shipment.picked_up',
  SHIPMENT_IN_TRANSIT: 'shipment.in_transit',
  SHIPMENT_OUT_FOR_DELIVERY: 'shipment.out_for_delivery',
  SHIPMENT_DELIVERED: 'shipment.delivered',
  SHIPMENT_FAILED: 'shipment.failed',
  SHIPMENT_RETURNED: 'shipment.returned',

  // Finance
  REFUND_INITIATED: 'refund.initiated',
  REFUND_COMPLETED: 'refund.completed',
  REFUND_FAILED: 'refund.failed',
  SETTLEMENT_CREATED: 'settlement.created',
  SETTLEMENT_PAID: 'settlement.paid',
  INVOICE_GENERATED: 'invoice.generated',
  TAX_CALCULATED: 'tax.calculated',

  // CMS
  PAGE_PUBLISHED: 'page.published',
  PAGE_UNPUBLISHED: 'page.unpublished',
  HOMEPAGE_UPDATED: 'homepage.updated',
  BLOG_POST_PUBLISHED: 'blog.post.published',

  // Notifications
  NOTIFICATION_CREATED: 'notification.created',
  NOTIFICATION_DELIVERED: 'notification.delivered',
  NOTIFICATION_FAILED: 'notification.failed',
  NOTIFICATION_READ: 'notification.read',

  // System
  SYSTEM_HEALTH_CHECK: 'system.health_check',
  SYSTEM_DEPLOYMENT: 'system.deployment',
  SYSTEM_ERROR: 'system.error',
  WORKFLOW_TRIGGERED: 'workflow.triggered',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];
```

## Appendix B: Workflow Step Types

```typescript
export const StepType = {
  ACTION: 'action',
  CONDITION: 'condition',
  PARALLEL: 'parallel',
  WAIT: 'wait',
  APPROVAL: 'approval',
  SUBWORKFLOW: 'subworkflow',
  NOTIFICATION: 'notification',
  INTEGRATION: 'integration',
} as const;

export type StepType = (typeof StepType)[keyof typeof StepType];
```

## Appendix C: Job Priority Levels

```typescript
export const JobPriority = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
  BACKGROUND: 4,
} as const;

export type JobPriority = (typeof JobPriority)[keyof typeof JobPriority];
```

## Appendix D: Workflow Run States

```typescript
export const WorkflowRunStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  WAITING: 'waiting',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  TIMED_OUT: 'timed_out',
  CANCELLED: 'cancelled',
  COMPENSATING: 'compensating',
} as const;

export type WorkflowRunStatus = (typeof WorkflowRunStatus)[keyof typeof WorkflowRunStatus];
```

## Appendix E: Job States

```typescript
export const JobStatus = {
  PENDING: 'pending',
  CLAIMED: 'claimed',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DEAD_LETTER: 'dead_letter',
  CANCELLED: 'cancelled',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];
```

---

**End of Document**

**Version:** 1.0  
**Date:** August 03, 2026  
**Status:** Active — All AI agents must follow this document
