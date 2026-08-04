# নবME (Nabome) — Return, Refund, Replacement & Customer Resolution Engine Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for return requests, refunds, replacements, exchanges, complaints, resolution workflows, approval systems, evidence management, and customer resolution integration  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), PAYMENT_ENGINE_ARCHITECTURE.md (v1.0), FINANCE_ENGINE_ARCHITECTURE.md (v1.0), VARIANT_INVENTORY_ENGINE_ARCHITECTURE.md (v1.0), IDENTITY_NAMING_ARCHITECTURE.md (v1.0), CUSTOMER_EXPERIENCE_ARCHITECTURE.md (v1.0), STORAGE_ENGINE_ARCHITECTURE.md (v1.0), API_SERVICE_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Resolution Foundation](#1-resolution-foundation)
2. [Return Eligibility](#2-return-eligibility)
3. [Return Request](#3-return-request)
4. [Admin Review](#4-admin-review)
5. [Resolution Types](#5-resolution-types)
6. [Refund Workflow](#6-refund-workflow)
7. [Replacement / Exchange](#7-replacement--exchange)
8. [Customer Communication](#8-customer-communication)
9. [Module Integration](#9-module-integration)
10. [Evidence Management](#10-evidence-management)
11. [Permissions](#11-permissions)
12. [Performance](#12-performance)
13. [Security](#13-security)
14. [Accessibility](#14-accessibility)
15. [Future Readiness](#15-future-readiness)
16. [Mandatory Rules for AI Agents](#16-mandatory-rules-for-ai-agents)

---

## 1. Resolution Foundation

### 1.1 What

The foundational philosophy, ownership model, lifecycle, states, visibility rules, relationships, integrity guarantees, and auditability standards that govern every customer resolution — returns, refunds, replacements, exchanges, and complaints — on the Nabome platform.

### 1.2 Why

- **Customer trust:** The post-purchase experience defines long-term loyalty. Transparent, fair, fast resolution builds confidence.
- **Revenue protection:** Fair return policies reduce chargebacks and negative reviews.
- **Operational efficiency:** Automated eligibility, approval workflows, and status tracking reduce manual effort.
- **Compliance:** Indian Consumer Protection Act, e-commerce regulations, and RBI payment rules require documented resolution processes.
- **Brand integrity:** Every resolution interaction reinforces Nabome as a premium, trustworthy platform.
- **Scalability:** Resolution architecture must handle 0 to 100,000+ resolution requests without redesign.

### 1.3 Where

Every return request, refund processing, replacement shipment, exchange workflow, customer complaint, approval decision, evidence upload, notification, and admin dashboard across the Nabome platform.

### 1.4 Resolution Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Customer-first, not customer-always-right** | Fair resolution balances customer satisfaction with business integrity | Sustainable operations |
| **Transparency** | Customers always know exactly where their request stands | Trust |
| **Speed matters** | Faster resolution = happier customer = repeat purchase | Retention |
| **Evidence-based** | Decisions backed by evidence, not assumptions | Fairness |
| **Audit by default** | Every resolution action logged with actor, timestamp, context | Compliance |
| **Immutable history** | Resolution records are append-only, never deleted or overwritten | Legal, debugging |
| **One resolution per issue** | Each complaint maps to exactly one resolution workflow | Clarity |
| **Soft operations only** | No hard deletes — resolutions are archived, never removed | Data integrity |
| **Modular design** | Resolution Engine is independent from Orders, Payments, Finance | Maintainability |
| **Gateway independence** | Refund processing abstracted from specific payment gateways | Swappability |

### 1.5 Resolution Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESOLUTION LIFECYCLE                            │
│                                                                  │
│  1. ISSUE DETECTED                                               │
│     → Customer reports issue                                      │
│     → Admin detects quality problem                               │
│     → System detects delivery failure                             │
│                                                                  │
│  2. RETURN REQUEST CREATED                                        │
│     → Customer selects reason                                     │
│     → Evidence uploaded (photos, videos)                          │
│     → Eligibility validated                                       │
│     → Resolution ID generated                                     │
│                                                                  │
│  3. ADMIN REVIEW                                                 │
│     → Pending → Under Review                                      │
│     → Evidence examined                                           │
│     → Additional information requested (if needed)                │
│     → Decision: Approve / Reject / Escalate                       │
│                                                                  │
│  4. RESOLUTION SELECTED                                           │
│     → Refund / Replacement / Exchange / Store Credit              │
│     → Resolution-specific workflow initiated                       │
│                                                                  │
│  5. RESOLUTION EXECUTED                                           │
│     → Refund processed via payment gateway                        │
│     → Replacement shipped via courier                             │
│     → Exchange variant validated and shipped                       │
│     → Store credit issued to customer account                     │
│                                                                  │
│  6. RESOLUTION COMPLETED                                          │
│     → Customer confirms satisfaction                               │
│     → Auto-close after confirmation window                        │
│     → Finance engine notified                                     │
│     → Inventory synchronized                                      │
│                                                                  │
│  7. ARCHIVED                                                     │
│     → Resolution record preserved                                 │
│     → Audit trail complete                                        │
│     → Available for reporting and analytics                       │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Resolution Ownership

| Entity | Owner | Location |
|--------|-------|----------|
| Resolution requests | Resolution domain | `api/_handlers/resolutions/` |
| Resolution types | Resolution domain | `api/_handlers/resolutions/` |
| Return eligibility | Resolution domain | `api/_lib/resolutions/eligibility.ts` |
| Refund processing | Payment domain (delegated) | `api/_lib/payments/refunds/` |
| Replacement shipping | Shipping domain (delegated) | `api/_handlers/orders/` |
| Evidence management | Resolution domain | `api/_lib/resolutions/evidence.ts` |
| Resolution notifications | Notification domain | `api/_lib/notifications/` |
| Resolution audit | Resolution domain | `api/_lib/logging/audit.ts` |
| Finance adjustment | Finance domain (delegated) | `api/_lib/finance/` |

### 1.7 Resolution Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Idempotency** | Every resolution operation is idempotent | Prevent duplicate refunds/replacements |
| **Atomicity** | Multi-step operations use database transactions | No partial resolution states |
| **Consistency** | Resolution state always matches order and payment state | No phantom resolutions |
| **Isolation** | Concurrent resolution operations don't interfere | Prevent race conditions |
| **Durability** | Committed resolution data survives crashes | Business continuity |
| **Precision** | All refund amounts use `DECIMAL(10,2)` | Exact precision, no floating-point errors |
| **Non-repudiation** | Every resolution action attributed to an actor | Legal accountability |

### 1.8 Resolution Relationships

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Order     │       │  Resolution  │       │   Payment    │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │◀──┐   │ id (PK)      │◀──┐   │ id (PK)      │
│              │   └───│ orderId      │   └───│ paymentId    │
│ profileId ───│──┐    │              │       │              │
└──────────────┘  │    │ resolutionType│      │ orderId ─────│──▶ Order
                  │    │ status        │      │ amount       │
                  │    │ reason        │      └──────┬───────┘
                  │    │ evidence      │             │
                  │    └──────┬───────┘             ▼
                  │           │              ┌──────────────┐
                  │           ▼              │   Refund     │
                  │    ┌──────────────┐      │──────────────│
                  │    │Resolution    │      │ id (PK)      │
                  │    │  History     │      │ resolutionId │──▶ Resolution
                  │    │──────────────│      │ paymentId ───│──▶ Payment
                  │    │ id (PK)      │      │ amount       │
                  │    │ resolutionId │      │ status       │
                  │    │ fromStatus   │      │ gatewayRef   │
                  │    │ toStatus     │      └──────────────┘
                  │    │ actorId      │
                  │    │ reason       │      ┌──────────────┐
                  │    │ createdAt    │      │  Replacement │
                  │    └──────────────┘      │──────────────│
                  │                          │ id (PK)      │
                  ▼                          │ resolutionId │──▶ Resolution
           ┌──────────────┐                  │ variantId ───│──▶ ProductVariant
           │  OrderItem   │                  │ shipmentId   │
           │──────────────│                  │ status       │
           │ id (PK)      │                  └──────────────┘
           │ orderId ─────│──▶ Order
           │ variantId ───│──▶ ProductVariant
           └──────────────┘
```

### 1.9 Resolution States

| State | Description | Visible To | Next Possible States |
|-------|-------------|------------|---------------------|
| **draft** | Customer started but not submitted | Customer | submitted, cancelled |
| **submitted** | Customer submitted, awaiting review | Customer, Admin | under_review, cancelled |
| **under_review** | Admin reviewing evidence and request | Customer, Admin | approved, rejected, needs_info, escalated |
| **needs_info** | Admin requested additional information from customer | Customer, Admin | under_review, cancelled |
| **approved** | Resolution approved, awaiting execution | Customer, Admin | processing |
| **rejected** | Resolution rejected with reason | Customer, Admin | (terminal — with appeal option) |
| **escalated** | Escalated to senior admin for complex cases | Admin only | approved, rejected |
| **processing** | Resolution being executed (refund/replacement/exchange) | Customer, Admin | completed, failed |
| **completed** | Resolution successfully executed | Customer, Admin | (terminal) |
| **failed** | Resolution execution failed | Customer, Admin | processing (retry) |
| **cancelled** | Customer cancelled request | Customer, Admin | (terminal) |
| **closed** | Resolution confirmed closed | Customer, Admin | (terminal) |

### 1.10 Resolution History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Status history** | Every status transition logged | Complete audit trail |
| **Action history** | Every create, update, approve, reject, process logged | Action traceability |
| **Actor history** | Every action tagged with actor (customer/admin/system) | Accountability |
| **Timestamp history** | Every action timestamped with UTC | Temporal accuracy |
| **Reason history** | Every rejection, approval, escalation includes reason | Context |
| **Evidence history** | Every evidence upload/change logged | Integrity |
| **Immutable** | History records are append-only, never modified | Audit integrity |
| **Retention** | Resolution history retained for 7 years | Legal compliance |

### 1.11 Resolution Visibility

| Stakeholder | Can See | Cannot See |
|-------------|---------|------------|
| **Customer** | Own resolutions only | Other customers' resolutions |
| **Shop Owner** | Resolutions containing their products | Other shops' resolutions, customer personal data |
| **Admin** | All resolutions across all shops | — |
| **System** | All resolutions for automated processing | — |

### 1.12 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Delete resolution records | Destroys audit trail, illegal | Append-only, soft delete |
| Process refunds without resolution | No audit trail, fraud risk | Always create resolution first |
| Skip evidence collection | Cannot verify claims | Require evidence for all returns |
| Auto-approve all returns | Fraud vulnerability | Admin review required |
| Hard delete resolution history | Breaks compliance | Archive, never delete |
| Process refunds synchronously | Blocks user requests | Background processing |
| Skip notification on status change | Customer left in the dark | Notify on every status change |
| Allow double resolution for same issue | Duplicate refunds | One resolution per order item per issue |
| Mix resolution logic with order logic | Tight coupling | Independent resolution module |
| Skip audit logging | Cannot debug, non-compliant | Log every resolution event |

---

## 2. Return Eligibility

### 2.1 What

The complete architecture for determining whether a customer's order item is eligible for return — including return window validation, product eligibility, order eligibility, return rules, validation pipeline, expired return handling, non-returnable products, and admin override capabilities.

### 2.2 Why

- **Fairness:** Consistent eligibility rules prevent arbitrary rejections.
- **Automation:** Automated eligibility reduces manual review burden.
- **Compliance:** Indian consumer protection laws define minimum return rights.
- **Revenue:** Proper eligibility prevents abuse while protecting genuine customers.
- **Operations:** Clear eligibility rules enable efficient warehouse planning.

### 2.3 Where

Return request creation form, order detail page, admin review panel, eligibility API, customer account pages.

### 2.4 Return Window

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default window** | 7 days from delivery confirmation | Industry standard for fashion |
| **Extended window** | 14 days for electronics, 30 days for furniture | Product-specific needs |
| **Holiday extension** | Extended window during festival season (Diwali, etc.) | Customer convenience |
| **Counting start** | From delivery confirmation date (courier webhook or manual) | Accurate start point |
| **Counting end** | End of day (23:59:59 IST) on last eligible day | Clear boundary |
| **Display** | "Return eligible until [date]" on order detail | Transparency |
| **Admin override** | Admin can extend return window per order | Flexibility |
| **Partial delivery** | Return window per item, based on individual delivery date | Accuracy |

### 2.5 Return Window Validation

```typescript
interface ReturnWindowCheck {
  orderId: string;
  orderItemId: string;
  deliveredAt: Date;
  returnWindowDays: number;
  isEligible: boolean;
  expiresAt: Date;
  reason?: string;
}

// Validation flow
function validateReturnWindow(order: Order, orderItem: OrderItem): ReturnWindowCheck {
  // 1. Get delivery date
  const deliveredAt = order.deliveredAt ?? orderItem.deliveredAt;
  if (!deliveredAt) {
    return { isEligible: false, reason: 'Order not yet delivered' };
  }

  // 2. Get return window for product category
  const returnWindowDays = getReturnWindowDays(orderItem.product.category);

  // 3. Calculate expiry
  const expiresAt = addDays(deliveredAt, returnWindowDays);

  // 4. Check if within window
  const isEligible = new Date() <= expiresAt;

  return {
    orderId: order.id,
    orderItemId: orderItem.id,
    deliveredAt,
    returnWindowDays,
    isEligible,
    expiresAt,
    reason: isEligible ? undefined : 'Return window expired',
  };
}
```

### 2.6 Return Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Per-item eligibility** | Each order item evaluated independently | Granular control |
| **One return per item** | Each item can be returned once | Prevention of abuse |
| **Condition check** | Item must be unused, with original tags | Resalability |
| **Packaging** | Original packaging preferred, not mandatory | Flexibility |
| **Proof required** | Photo of item condition required | Verification |
| **Reason required** | Must select return reason from predefined list | Data + communication |
| **Description optional** | Additional details optional but encouraged | Context |
| **Partial returns** | Support returning individual items from multi-item orders | Flexibility |
| **Full order return** | Support returning entire order | Flexibility |
| **Multiple returns** | Customer can submit separate returns for different items | Granularity |

### 2.7 Product Eligibility

| Product Type | Eligible | Exceptions |
|-------------|----------|------------|
| **Fashion (Clothing)** | Yes | Must have original tags, unused |
| **Fashion (Footwear)** | Yes | Must be unworn, original box preferred |
| **Accessories** | Yes | Must be unused, original packaging |
| **Electronics** | Yes | Must be sealed/unused, all accessories included |
| **Home & Living** | Yes | Must be unused, original packaging |
| **Beauty & Personal Care** | No (sealed) / Yes (unsealed defective) | Sealed = final sale |
| **Undergarments** | No (hygiene) | Final sale for hygiene |
| **Sale/Final Sale items** | No | Marked as "Final Sale" |
| **Customized items** | No | Personalized = final sale |
| **Gift cards** | No | Non-returnable |
| **Digital products** | No | Non-returnable |

### 2.8 Order Eligibility

| Check | Standard | Action if Failed |
|-------|----------|------------------|
| **Order delivered** | Order status = delivered | "Order not yet delivered" |
| **Return window** | Within return window | "Return window expired" |
| **Item not already returned** | No existing return for this item | "Item already returned" |
| **Item not cancelled** | Item was part of delivered order | "Item was cancelled" |
| **Payment completed** | Payment status = captured | "Payment not completed" |
| **Order not refunded** | Order not already fully refunded | "Order already refunded" |

### 2.9 Return Validation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN VALIDATION PIPELINE                     │
│                                                                  │
│  1. ORDER EXISTS                                                 │
│     → Validate order ID is valid                                 │
│     → Order belongs to requesting customer                       │
│                                                                  │
│  2. ORDER DELIVERED                                               │
│     → Order status = delivered                                   │
│     → Delivery confirmed by courier                              │
│                                                                  │
│  3. RETURN WINDOW CHECK                                          │
│     → Calculate days since delivery                              │
│     → Check against product category return window               │
│     → Check for admin-extended window                            │
│                                                                  │
│  4. ITEM ELIGIBILITY                                             │
│     → Product type is returnable                                 │
│     → Item not already returned                                  │
│     → Item not marked as final sale                              │
│                                                                  │
│  5. EVIDENCE CHECK                                               │
│     → At least 1 photo uploaded                                  │
│     → Photos are valid (not corrupted, correct format)           │
│     → Photos show item condition                                 │
│                                                                  │
│  6. ELIGIBILITY RESULT                                           │
│     → Eligible: Create resolution request                        │
│     → Not eligible: Show clear reason + appeal option            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.10 Expired Returns

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Detection** | System checks return window on every order detail load | Awareness |
| **Display** | "Return window expired on [date]" | Transparency |
| **Appeal** | Customer can submit appeal with explanation | Fairness |
| **Admin override** | Admin can manually extend window for valid cases | Flexibility |
| **Grace period** | 24-hour grace period after window expires | UX consideration |
| **Notification** | Send reminder 2 days before window expires | Proactive |

### 2.11 Non-Returnable Products

| Reason | Products | Display |
|--------|----------|---------|
| **Hygiene** | Undergarments, swimwear, beauty (sealed) | "Final Sale — Non-returnable for hygiene" |
| **Customization** | Personalized items, monogrammed products | "Custom-made — Non-returnable" |
| **Perishable** | Food, flowers, candles | "Perishable — Non-returnable" |
| **Digital** | Digital products, gift cards | "Digital product — Non-returnable" |
| **Final Sale** | Marked as final sale by admin | "Final Sale — Non-returnable" |

### 2.12 Admin Override

| Override Type | Actor | Reason Required | Audit |
|---------------|-------|-----------------|-------|
| **Extend return window** | Admin | Yes | Log with old/new dates |
| **Override non-returnable** | Admin | Yes | Log with reason |
| **Bypass evidence requirement** | Admin | Yes | Log with justification |
| **Force approve** | Admin | Yes | Log with full context |
| **Force reject** | Admin | Yes | Log with reason |
| **Change resolution type** | Admin | Yes | Log with explanation |

---

## 3. Return Request

### 3.1 What

The complete architecture for how customers create, draft, submit, and manage return requests — including creation flow, reason selection, description, image/video upload, supporting evidence, draft saving, submission, and editing before review.

### 3.2 Why

- **Customer effort:** Minimal effort to submit = higher completion rate.
- **Evidence quality:** Better evidence = faster approval = happier customer.
- **Data quality:** Structured reasons enable analytics and trend detection.
- **Draft support:** Customers can start on mobile, finish on desktop.
- **Mobile-first:** 70%+ traffic is mobile — submission must work perfectly on phones.

### 3.3 Where

Order detail page ("Return" button), return request form, evidence upload component, draft system, customer account pages.

### 3.4 Return Request Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RETURN REQUEST ARCHITECTURE                    │
│                                                                  │
│  1. TRIGGER                                                      │
│     → Customer clicks "Return" on order detail page              │
│     → System validates eligibility                               │
│     → If eligible: Show return request form                      │
│     → If not eligible: Show reason + appeal option               │
│                                                                  │
│  2. SELECT ITEMS                                                 │
│     → Show deliverable items from order                          │
│     → Customer selects items to return                           │
│     → Show return reason per selected item                       │
│     → Support full order or partial item return                  │
│                                                                  │
│  3. SELECT RESOLUTION TYPE                                       │
│     → Refund to original payment method                          │
│     → Replacement with same item                                 │
│     → Exchange for different variant                             │
│     → Store credit (future)                                      │
│                                                                  │
│  4. PROVIDE EVIDENCE                                             │
│     → Upload photos (1-10)                                       │
│     → Upload video (optional, 1)                                 │
│     → Write description (optional but encouraged)                │
│     → Upload supporting documents (optional)                     │
│                                                                  │
│  5. REVIEW & SUBMIT                                              │
│     → Review request summary                                     │
│     → Confirm details                                            │
│     → Submit request                                             │
│     → Generate resolution ID                                     │
│                                                                  │
│  6. POST-SUBMISSION                                              │
│     → Show resolution ID and estimated timeline                  │
│     → Send confirmation email                                    │
│     → Notify admin of new request                                │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Return Creation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | "Return" button on delivered order items | Self-service |
| **Eligibility check** | Validate before showing form | Prevent frustration |
| **Pre-fill** | Pre-fill order details (product, variant, quantity) | Convenience |
| **Multi-item** | Support selecting multiple items from same order | Efficiency |
| **Resolution type** | Customer selects preferred resolution | Flexibility |
| **Mobile form** | Single-column, large inputs, camera integration | Mobile-first |
| **Progress indicator** | Show steps: Items → Reason → Evidence → Submit | Orientation |

### 3.6 Reason Selection

| Reason | Category | Required Fields | Auto-Suggested Resolution |
|--------|----------|-----------------|---------------------------|
| **wrong_size** | Size issue | Size ordered vs needed | Exchange or Refund |
| **wrong_item** | Fulfillment error | Description of wrong item | Replacement |
| **defective** | Quality issue | Description of defect | Refund or Replacement |
| **not_as_described** | Mismatch | Description of difference | Refund |
| **changed_mind** | Customer preference | — | Refund (shipping deducted) |
| **quality_issue** | Quality | Description of quality concern | Refund or Exchange |
| **damaged_in_transit** | Shipping | Photos of damage | Replacement or Refund |
| **late_delivery** | Shipping | — | Refund |
| **other** | Other | Description required | Admin review |

**Reason Selection Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Required** | Must select reason for each returned item | Data quality |
| **Predefined list** | Select from admin-configured reasons | Standardization |
| **Category grouping** | Group reasons by category for clarity | UX |
| **Description trigger** | If "other" or "defective", description required | Context |
| **Analytics** | Reason data drives product quality improvements | Intelligence |
| **Trend detection** | Aggregate reasons to detect systemic issues | Proactive |

### 3.7 Description

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Optional** | Not required for most reasons | Low friction |
| **Encouraged** | "Provide details for faster resolution" | Better evidence |
| **Max length** | 1000 characters | Practical limit |
| **Mobile input** | Large text area, character count | Mobile-friendly |
| **Formatting** | Plain text only, no rich text | Simplicity |
| **Language** | English or Hindi (future: multi-language) | Inclusivity |

### 3.8 Images

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Minimum** | 1 image required | Basic evidence |
| **Maximum** | 10 images | Practical limit |
| **Format** | JPEG, PNG, WebP | Standard formats |
| **Max size** | 10MB per image | Storage management |
| **Resolution** | Min 640x480, max 4096x4096 | Quality vs storage |
| **Capture** | Camera integration for mobile capture | Convenience |
| **Upload** | Drag-and-drop (desktop), tap to select (mobile) | Platform-appropriate |
| **Preview** | Show thumbnails after upload | Confirmation |
| **Remove** | Allow removing uploaded images before submission | Correction |
| **Compression** | Client-side compression before upload | Performance |
| **CDN delivery** | Images served via Cloudinary CDN | Performance |

### 3.9 Videos

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Optional** | Not required | Low friction |
| **Maximum** | 1 video | Storage management |
| **Format** | MP4 (H.264) | Universal support |
| **Max size** | 50MB | Storage management |
| **Max duration** | 60 seconds | Practical limit |
| **Resolution** | Max 1080p | Quality vs storage |
| **Capture** | Video recording via device camera | Convenience |
| **Streaming** | Stream via Cloudinary or R2 | Performance |

### 3.10 Supporting Evidence

| Type | Format | Purpose |
|------|--------|---------|
| **Order confirmation screenshot** | JPEG/PNG | Proof of purchase |
| **Payment receipt** | JPEG/PNG | Proof of payment |
| **Communication with courier** | JPEG/PNG | Delivery issues |
| **Product manual/warranty** | PDF | Electronics claims |
| **Medical certificate** | PDF | Health-related returns |

### 3.11 Draft Saving

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Auto-save** | Draft saved every 30 seconds | Prevent data loss |
| **Manual save** | "Save Draft" button | User control |
| **Storage** | localStorage + server sync | Offline resilience |
| **Resume** | Return to draft from order detail page | Continuity |
| **Expiry** | Draft expires after 48 hours | Cleanup |
| **Conflict resolution** | Last write wins with notification | Simplicity |
| **Cross-device** | Synced via server for logged-in users | Continuity |

### 3.12 Submission

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Validation** | All required fields validated before submission | Data quality |
| **Duplicate check** | Prevent duplicate return for same item | Prevention |
| **Confirmation** | Show summary before final submission | Review |
| **Loading state** | Show processing state during submission | Feedback |
| **Error handling** | Clear error messages with recovery guidance | UX |
| **Success state** | Show resolution ID + estimated timeline | Confirmation |
| **Email confirmation** | Send confirmation email with details | Documentation |
| **Admin notification** | Notify admin of new request | Operations |

### 3.13 Editing Before Review

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Before review** | Customer can edit request details | Correction |
| **Add evidence** | Customer can add more photos/videos | Improvement |
| **Change reason** | Customer can change return reason | Correction |
| **Change resolution type** | Customer can change preferred resolution | Flexibility |
| **Cancel** | Customer can cancel request before review | Control |
| **After review started** | Editing disabled to maintain integrity | Consistency |
| **Admin request** | If admin requests info, customer can update | Communication |

---

## 4. Admin Review

### 4.1 What

The complete workflow for how admin reviews resolution requests — including pending review queue, evidence examination, information requests, approval, rejection, escalation readiness, internal notes, and resolution timeline tracking.

### 4.2 Why

- **Quality control:** Human review ensures fair, accurate decisions.
- **Fraud prevention:** Review catches suspicious return patterns.
- **Customer communication:** Review process includes customer interaction.
- **Operational efficiency:** Queue management and batch processing.
- **Consistency:** Standardized review process across all admins.

### 4.3 Where

Admin resolution dashboard, resolution detail page, review queue, admin API handlers, notification system.

### 4.4 Pending Review

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Queue** | New requests appear in "Pending Review" queue | Operations |
| **Sorting** | By submission date (oldest first), priority | FIFO processing |
| **Filtering** | By status, reason, resolution type, shop, date | Efficiency |
| **Batch view** | See multiple requests in list format | Overview |
| **Priority** | High priority for defective/damaged items | SLA |
| **SLA** | Review within 48 hours of submission | Customer expectation |
| **Assignment** | Auto-assign or manual assign to admin | Load balancing |
| **Escalation** | Auto-escalate if SLA breached | Operations |

### 4.5 Evidence Review

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Image viewer** | Full-size image viewer with zoom | Detail inspection |
| **Video player** | Inline video player | Evidence review |
| **Metadata** | Show upload timestamp, device info | Context |
| **Comparison** | Show order item details alongside evidence | Verification |
| **Notes** | Admin can add internal notes per evidence item | Documentation |
| **Flag** | Flag suspicious evidence for investigation | Fraud detection |

### 4.6 Request More Information

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin clicks "Request Information" | Clarity |
| **Message** | Admin types specific question/request | Context |
| **Customer notification** | Email + push notification sent immediately | Timeliness |
| **Customer action** | Customer uploads additional evidence/description | Response |
| **Timeout** | 7 days to respond before auto-close | Operations |
| **Reminder** | Send reminder at day 5 | Proactive |
| **Admin queue** | Request moves to "Needs Info" queue | Tracking |
| **Multiple rounds** | Up to 3 rounds of information request | Practical limit |

### 4.7 Approve

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin clicks "Approve Resolution" | Clear action |
| **Resolution type** | Confirm or change resolution type | Flexibility |
| **Reason** | Admin provides approval reason (internal note) | Audit |
| **Amount** | For refunds: confirm or adjust refund amount | Accuracy |
| **Customer notification** | Email with approval details + next steps | Transparency |
| **Workflow trigger** | Initiate refund/replacement/exchange workflow | Automation |
| **Timeline** | Show estimated completion timeline | Expectation |

### 4.8 Reject

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin clicks "Reject Resolution" | Clear action |
| **Reason required** | Must provide rejection reason | Customer communication |
| **Predefined reasons** | Select from: policy_violation, evidence_insufficient, item_used, outside_window, fraud_suspected, other | Standardization |
| **Custom message** | Additional custom message to customer | Context |
| **Customer notification** | Email with rejection reason + appeal option | Transparency |
| **Appeal option** | Customer can appeal within 7 days | Fairness |
| **Admin override** | Senior admin can override rejection | Governance |

### 4.9 Escalation Readiness

| Trigger | Action | Actor |
|---------|--------|-------|
| **Complex case** | Admin flags for senior review | Admin |
| **High-value item** | Auto-escalate for items > ₹10,000 | System |
| **Fraud suspicion** | Escalate for investigation | Admin |
| **Customer complaint** | Escalate if customer files formal complaint | System |
| **SLA breach** | Auto-escalate if review SLA exceeded | System |
| **Disputed rejection** | Customer appeals rejection | System |

### 4.10 Internal Notes

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Visibility** | Admin only (not visible to customer) | Internal communication |
| **Purpose** | Document review decisions, observations, context | Audit |
| **Threading** | Notes can be replied to | Context |
| **Timestamped** | Every note has timestamp | Temporal context |
| **Actor-tagged** | Every note tagged with admin who wrote it | Accountability |
| **Max length** | 500 characters per note | Practical limit |
| **Append-only** | Notes cannot be deleted or modified | Audit integrity |

### 4.11 Resolution Timeline

| Metric | Standard | Rationale |
|--------|----------|-----------|
| **Submission to first review** | < 24 hours | Customer expectation |
| **Review to decision** | < 48 hours | SLA |
| **Decision to execution** | < 24 hours | Operations |
| **Execution to completion** | Varies by type (see individual sections) | Realistic |
| **Total resolution time** | < 7 business days target | Customer satisfaction |
| **Escalation SLA** | < 24 hours for escalated cases | Priority |

---

## 5. Resolution Types

### 5.1 What

The complete architecture for every type of resolution available on the Nabome platform — refund, replacement, exchange, store credit, and partial resolution readiness.

### 5.2 Why

- **Customer choice:** Different situations require different solutions.
- **Business flexibility:** Admin can select optimal resolution per case.
- **Revenue retention:** Exchange and store credit retain revenue within platform.
- **Customer satisfaction:** Right resolution type = happier customer.
- **Future-proof:** Architecture supports new resolution types without redesign.

### 5.3 Where

Resolution detail page, admin review panel, customer resolution status, refund processing, replacement shipping, exchange workflow.

### 5.4 Resolution Type Matrix

| Type | Description | Customer Gets | Platform Cost | Revenue Impact |
|------|-------------|---------------|---------------|----------------|
| **Full Refund** | Complete refund to original payment method | Money back | Gateway fees | Full reversal |
| **Partial Refund** | Refund of specific item amount | Partial money back | Gateway fees | Partial reversal |
| **Replacement** | Same item shipped again | Same product | Product + shipping | None |
| **Exchange** | Different variant shipped | New variant | Product + shipping | Potential price diff |
| **Store Credit** | Credit added to customer account | Platform credit | None | Retained on platform |
| **Repair** | Item repaired and returned (future) | Repaired item | Repair cost | None |
| **Discount Coupon** | Future purchase discount | Discount code | Marketing cost | Future revenue |

### 5.5 Resolution Type Selection

| Factor | Recommended Type | Rationale |
|--------|-----------------|-----------|
| **Defective item** | Replacement or Refund | Customer choice |
| **Wrong item sent** | Replacement | Correct item needed |
| **Size doesn't fit** | Exchange (different size) | Customer wants product |
| **Changed mind** | Refund (shipping deducted) | Customer preference |
| **Damaged in transit** | Replacement or Refund | Not customer fault |
| **Quality issue** | Refund or Exchange | Customer choice |
| **Not as described** | Full Refund | Platform error |
| **Late delivery** | Refund (full or partial) | Service failure |

### 5.6 Partial Resolution Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Item-level** | Each order item can have independent resolution | Granularity |
| **Amount-level** | Refund amount can be customized per item | Flexibility |
| **Multi-type** | Different items in same order can have different resolutions | Real-world needs |
| **Shipping refund** | Shipping can be refunded independently | Accuracy |
| **Discount handling** | Proportional discount allocation to returned items | Fairness |
| **Tax handling** | Tax refunded proportionally to returned items | Compliance |

---

## 6. Refund Workflow

### 6.1 What

The complete architecture for processing refunds — from approval through gateway processing to completion, including refund types, tracking, failure handling, and reconciliation.

### 6.2 Why

- **Customer trust:** Refunds are the most visible part of resolution.
- **Financial accuracy:** Every rupee must be correctly returned.
- **Gateway integration:** Refunds must work across payment methods.
- **Compliance:** RBI regulations govern refund processing.
- **Auditability:** Every refund must be traceable end-to-end.

### 6.3 Where

Refund processing queue, payment gateway integration, order detail page, customer notifications, finance engine, reconciliation reports.

### 6.4 Refund Types

| Type | Description | Processing | Timeline |
|------|-------------|------------|----------|
| **Full Refund** | Complete order/item amount returned | Via payment gateway | 5-7 business days |
| **Partial Refund** | Specific amount returned | Via payment gateway | 5-7 business days |
| **COD Refund** | Cash collected on delivery refunded | Bank transfer or store credit | 7-10 business days |
| **Coupon Refund** | Coupon value restored | System credit | Immediate |
| **Shipping Refund** | Shipping charges returned | Via payment gateway | 5-7 business days |

### 6.5 Refund Approval

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Admin approval** | All refunds require admin approval | Financial governance |
| **Auto-approval ready** | Architecture supports auto-approve for low-risk (future) | Efficiency |
| **Amount validation** | Refund amount ≤ original payment amount | Financial integrity |
| **Duplicate check** | Prevent duplicate refund for same item | Prevention |
| **Approval record** | Store approval with actor, timestamp, reason | Audit |

### 6.6 Refund Processing

```
┌─────────────────────────────────────────────────────────────────┐
│                    REFUND PROCESSING FLOW                         │
│                                                                  │
│  1. RESOLUTION APPROVED                                          │
│     → Admin approves resolution with refund type                 │
│     → System creates Refund record (status: pending)             │
│                                                                  │
│  2. REFUND VALIDATION                                            │
│     → Verify original payment exists and is captured             │
│     → Verify refund amount ≤ remaining refundable amount         │
│     → Verify payment gateway supports refunds                    │
│     → Check for duplicate refund                                 │
│                                                                  │
│  3. GATEWAY REFUND                                               │
│     → Call gateway adapter createRefund()                        │
│     → Gateway processes refund                                   │
│     → Gateway returns refund ID and status                       │
│                                                                  │
│  4. REFUND TRACKING                                              │
│     → Store gateway refund ID                                    │
│     → Update refund status: processing → completed               │
│     → Webhook confirms refund (idempotent)                       │
│                                                                  │
│  5. POST-REFUND                                                  │
│     → Update order status: refunded (if full)                    │
│     → Update payment status: refunded / partially_refunded       │
│     → Notify customer with refund details                        │
│     → Update finance engine                                      │
│     → Update inventory (if replacement not chosen)               │
│                                                                  │
│  6. RECONCILIATION                                               │
│     → Daily reconciliation with gateway                          │
│     → Verify all refunds processed correctly                     │
│     → Flag discrepancies for investigation                       │
└─────────────────────────────────────────────────────────────────┘
```

### 6.7 Refund Status

| Status | Description | Visible To | Next States |
|--------|-------------|------------|-------------|
| **pending** | Refund approved, awaiting processing | Customer, Admin | processing, cancelled |
| **processing** | Refund submitted to gateway | Customer, Admin | completed, failed |
| **completed** | Refund confirmed by gateway | Customer, Admin | (terminal) |
| **failed** | Refund failed at gateway | Customer, Admin | processing (retry) |
| **cancelled** | Refund cancelled by admin | Admin | (terminal) |

### 6.8 Refund Tracking

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Gateway reference** | Store gateway refund ID | Cross-reference |
| **Timeline** | Show estimated refund date to customer | Expectation management |
| **Status updates** | Real-time status via webhook + polling | Accuracy |
| **Bank processing** | Note that bank processing takes 5-7 days | Transparency |
| **Notification** | Notify customer on status change | Communication |

### 6.9 Refund Completion

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Confirmation** | Gateway webhook confirms refund completion | Proof |
| **Customer notification** | Email with refund details + amount + method | Transparency |
| **Order update** | Update order status if fully refunded | Accuracy |
| **Payment update** | Update payment status | Accuracy |
| **Finance update** | Create finance record for refund adjustment | Accounting |
| **Receipt** | Generate refund receipt | Documentation |

### 6.10 Refund Failure Handling

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Gateway timeout** | Retry with exponential backoff (3 attempts) | Resilience |
| **Gateway rejection** | Log reason, notify admin, manual investigation | Operations |
| **Amount mismatch** | Block refund, alert admin | Financial integrity |
| **Invalid account** | Log, notify admin, manual resolution | Operations |
| **Duplicate attempt** | Idempotency check prevents duplicate | Prevention |
| **Gateway down** | Queue refund, process when gateway available | Resilience |

### 6.11 COD Refund Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **No gateway refund** | COD has no gateway payment to refund | Business logic |
| **Bank transfer** | Admin initiates bank transfer | Manual process |
| **Store credit** | Alternative: issue store credit | Instant |
| **Verification** | Admin verifies COD collection before refund | Accuracy |
| **Timeline** | 7-10 business days for bank transfer | Realistic |

---

## 7. Replacement / Exchange

### 7.1 What

The complete architecture for processing replacements (same item) and exchanges (different variant) — including approval, inventory validation, shipment, tracking, and completion.

### 7.2 Why

- **Customer retention:** Exchange keeps customer on platform, not refund.
- **Revenue protection:** Replacement/exchange maintains revenue.
- **Inventory accuracy:** Stock must be correctly managed for replacements.
- **Shipping integration:** Replacement requires new shipment creation.
- **Customer satisfaction:** Fast replacement = happy customer.

### 7.3 Where

Resolution detail page, inventory system, shipping system, order system, customer notifications.

### 7.4 Replacement Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REPLACEMENT PROCESSING FLOW                     │
│                                                                  │
│  1. RESOLUTION APPROVED (REPLACEMENT)                            │
│     → Admin approves with replacement type                       │
│     → System creates Replacement record (status: pending)        │
│                                                                  │
│  2. INVENTORY CHECK                                              │
│     → Verify replacement item is in stock                        │
│     → Check stock across warehouses (future)                     │
│     → Reserve stock for replacement                              │
│     → If out of stock: offer alternative or refund               │
│                                                                  │
│  3. RETURN INITIATION                                            │
│     → Generate return shipping label                             │
│     → Customer ships original item back                          │
│     → Track return shipment                                      │
│                                                                  │
│  4. RETURN RECEIVED                                              │
│     → Warehouse receives returned item                           │
│     → Quality check on returned item                             │
│     → Item condition verified                                    │
│                                                                  │
│  5. REPLACEMENT SHIPMENT                                         │
│     → Create new shipment for replacement                        │
│     → Generate shipping label                                    │
│     → Ship to customer address                                   │
│     → Provide tracking information                               │
│                                                                  │
│  6. COMPLETION                                                   │
│     → Customer confirms receipt of replacement                   │
│     → Resolution marked as completed                             │
│     → Inventory updated (returned item restocked or damaged)     │
│     → Finance notified                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Replacement Inventory Validation

| Check | Standard | Action if Failed |
|-------|----------|------------------|
| **Stock available** | `availableStock >= 1` | Offer alternative or refund |
| **Variant active** | `isActive = true` | Offer alternative or refund |
| **Product active** | Product `isActive = true` | Offer refund |
| **Price match** | Same price as original | No adjustment needed |
| **Price difference** | Different price | Charge/refund difference |
| **Multi-warehouse** | Check all warehouses (future) | Ship from nearest |

### 7.6 Exchange Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer requests different variant | Flexibility |
| **Variant selection** | Customer selects new variant | Choice |
| **Stock check** | New variant must be in stock | Accuracy |
| **Price difference** | If price differs, charge/refund difference | Financial accuracy |
| **Shipping** | Free exchange shipping | Customer protection |
| **Process** | Return original → Ship new | Two-step |
| **Timeline** | 7-10 business days total | Realistic expectation |

### 7.7 Exchange Price Difference

| Scenario | Action | Rationale |
|----------|--------|-----------|
| **New item cheaper** | Refund difference to customer | Fairness |
| **New item more expensive** | Charge difference to customer | Revenue protection |
| **Same price** | No financial transaction | Simplicity |
| **Price change since purchase** | Use current price for exchange | Current pricing |

### 7.8 Replacement Shipment

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **New shipment** | Create new order/shipment record | Tracking |
| **Same address** | Ship to original delivery address | Convenience |
| **Address update** | Customer can update address before shipment | Flexibility |
| **Shipping method** | Standard shipping (free) | Cost control |
| **Tracking** | New tracking number for replacement | Visibility |
| **Insurance** | Insured shipment for high-value items | Protection |

### 7.9 Completion Tracking

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Return tracking** | Track return shipment from customer | Visibility |
| **Replacement tracking** | Track replacement shipment to customer | Visibility |
| **Status updates** | Notify customer on both shipments | Communication |
| **Confirmation** | Customer confirms receipt of replacement | Proof |
| **Auto-close** | Auto-complete if no issue reported within 7 days | Automation |
| **Return item handling** | Return item inspected, restocked or damaged | Inventory accuracy |

---

## 8. Customer Communication

### 8.1 What

The complete architecture for communicating with customers throughout the resolution lifecycle — including status updates, information requests, resolution notifications, final decisions, and customer timeline.

### 8.2 Why

- **Trust:** Customers must always know what's happening with their request.
- **Reduced support:** Proactive communication reduces "where is my refund?" queries.
- **Professionalism:** Consistent, timely communication reinforces brand quality.
- **Engagement:** Notifications bring customers back to the platform.
- **Compliance:** Legal requirements for transaction communication.

### 8.3 Where

Email notifications, push notifications, in-app notifications, SMS (future), order detail page, resolution status page.

### 8.4 Status Updates

| Event | Channel | Timing | Content |
|-------|---------|--------|---------|
| **Request submitted** | Email + Push | Immediate | Resolution ID + summary + estimated timeline |
| **Under review** | Push | Immediate | "Your request is being reviewed" |
| **Information requested** | Email + Push | Immediate | Specific question + response link |
| **Information received** | Push | Immediate | "Thank you, reviewing your response" |
| **Approved** | Email + Push | Immediate | Resolution type + next steps + timeline |
| **Rejected** | Email + Push | Immediate | Reason + appeal option |
| **Processing** | Push | Immediate | "Your [refund/replacement] is being processed" |
| **Refund completed** | Email + Push | Immediate | Amount + method + bank timeline |
| **Replacement shipped** | Email + Push | Immediate | Tracking number + link |
| **Replacement delivered** | Email + Push | Immediate | "Delivered" + confirm receipt |
| **Resolution completed** | Email + Push | Immediate | Summary + thank you |
| **Escalated** | Internal | Immediate | Admin notification |

### 8.5 Additional Information Requests

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Specific question** | Admin asks specific, actionable question | Get useful response |
| **Clear deadline** | "Please respond within 7 days" | Operations |
| **Easy response** | One-click response link in email | Low friction |
| **Reminder** | Auto-reminder at day 5 | Proactive |
| **Auto-close** | Auto-close if no response in 7 days | Operations |
| **Multiple rounds** | Max 3 rounds of information request | Practical limit |

### 8.6 Resolution Notifications

| Notification | Template | Personalization |
|-------------|----------|-----------------|
| **Submission** | `resolution_submitted` | Name, order number, items, resolution ID |
| **Approval** | `resolution_approved` | Name, resolution type, next steps |
| **Rejection** | `resolution_rejected` | Name, reason, appeal link |
| **Refund processed** | `refund_processed` | Name, amount, method, timeline |
| **Replacement shipped** | `replacement_shipped` | Name, tracking number, carrier |
| **Resolution completed** | `resolution_completed` | Name, summary, thank you |

### 8.7 Final Decision

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Clear communication** | Plain language, no jargon | Customer understanding |
| **Actionable** | Tell customer exactly what happens next | Guidance |
| **Timely** | Delivered immediately on decision | Speed |
| **Multi-channel** | Email + push for important decisions | Reach |
| **Documentation** | All communication logged | Audit |

### 8.8 Customer Timeline

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Visible** | Customer can see full timeline of their request | Transparency |
| **Chronological** | Events shown in chronological order | Clarity |
| **Actor-tagged** | Each event shows who acted | Accountability |
| **Timestamped** | Each event shows when | Accuracy |
| **Detail level** | Customer sees customer-facing details only | Appropriate visibility |
| **Mobile-friendly** | Timeline works perfectly on mobile | Mobile-first |

---

## 9. Module Integration

### 9.1 What

The complete architecture for how the Resolution Engine integrates with Orders, Inventory, Finance, Payments, Shipping, Notifications, Documents, and Audit Logs.

### 9.2 Why

- **Consistency:** Resolution actions must reflect across all systems.
- **Automation:** Integration enables automated post-resolution actions.
- **Accuracy:** No manual re-entry of data across systems.
- **Auditability:** Every cross-system action is traceable.
- **Scalability:** Clean integration enables independent module evolution.

### 9.3 Where

Every resolution action triggers integration events across connected modules.

### 9.4 Orders Integration

| Event | Integration | Rationale |
|-------|-------------|-----------|
| **Return approved** | Update order status: `returned` | Order lifecycle |
| **Refund processed** | Update order status: `refunded` (if full) | Order lifecycle |
| **Replacement shipped** | Create linked shipment record | Order tracking |
| **Resolution completed** | Update order metadata with resolution details | Order history |
| **Partial return** | Update individual order items | Granularity |

**Order Status Updates:**

| Resolution Type | Order Status Change | Condition |
|----------------|-------------------|-----------|
| **Full Refund** | delivered → returned → refunded | All items refunded |
| **Partial Refund** | delivered (item marked refunded) | Some items refunded |
| **Replacement** | delivered (replacement shipment linked) | Replacement issued |
| **Exchange** | delivered (exchange shipment linked) | Exchange issued |

### 9.5 Inventory Integration

| Event | Integration | Rationale |
|-------|-------------|-----------|
| **Return approved** | Reserve stock for replacement (if replacement type) | Prevent overselling |
| **Return received** | Restock returned item (if in resalable condition) | Inventory accuracy |
| **Return received** | Mark item as damaged (if not resalable) | Inventory accuracy |
| **Replacement shipped** | Decrement stock for replacement item | Inventory accuracy |
| **Exchange approved** | Reserve new variant stock | Prevent overselling |
| **Exchange completed** | Decrement new variant, increment old variant | Inventory accuracy |

**Inventory Movement Types:**

| Movement | Trigger | Stock Effect |
|----------|---------|--------------|
| `RETURN_APPROVE` | Replacement/exchange approved | `reservedStock += quantity` |
| `RETURN_RECEIVED` | Warehouse receives return | `stock += quantity` (if resalable) |
| `RETURN_DAMAGED` | Returned item damaged | No stock change |
| `REPLACEMENT_SHIP` | Replacement shipped | `stock -= quantity`, `reservedStock -= quantity` |
| `EXCHANGE_SHIP` | Exchange variant shipped | New variant: `stock -= quantity` |

### 9.6 Finance Integration

| Event | Integration | Rationale |
|-------|-------------|-----------|
| **Refund approved** | Create finance record (debit: refund) | Accounting |
| **Refund processed** | Update finance record with gateway reference | Reconciliation |
| **Refund completed** | Update shop earnings (reverse commission) | Earnings accuracy |
| **Replacement** | No finance record (no financial impact) | Accuracy |
| **Exchange price diff** | Create finance record for difference | Financial accuracy |
| **Store credit** | Create finance record (liability) | Accounting |

**Finance Record Types:**

| Record Type | Direction | Amount | Reference |
|------------|-----------|--------|-----------|
| `REFUND_FULL` | Debit (platform) | Full refund amount | Resolution ID |
| `REFUND_PARTIAL` | Debit (platform) | Partial refund amount | Resolution ID |
| `REFUND_SHIPPING` | Debit (platform) | Shipping refund amount | Resolution ID |
| `EXCHANGE_DIFF_CHARGE` | Credit (platform) | Price difference charged | Resolution ID |
| `EXCHANGE_DIFF_REFUND` | Debit (platform) | Price difference refunded | Resolution ID |
| `COMMISSION_REVERSAL` | Debit (platform) | Commission reversed on refund | Resolution ID |
| `EARNINGS_REVERSAL` | Debit (shop) | Earnings reversed on refund | Resolution ID |

### 9.7 Payments Integration

| Event | Integration | Rationale |
|-------|-------------|-----------|
| **Refund processing** | Call gateway adapter `createRefund()` | Process refund |
| **Refund webhook** | Gateway webhook updates refund status | Idempotent confirmation |
| **Refund failure** | Gateway error triggers retry logic | Resilience |
| **COD refund** | Manual bank transfer or store credit | No gateway |

### 9.8 Shipping Integration

| Event | Integration | Rationale |
|-------|-------------|-----------|
| **Return approved** | Generate return shipping label | Customer convenience |
| **Return pickup** | Schedule courier pickup (future) | Automation |
| **Return tracking** | Track return shipment | Visibility |
| **Replacement shipment** | Create new shipment record | Tracking |
| **Replacement label** | Generate shipping label | Operations |
| **Replacement tracking** | Track replacement to customer | Visibility |

### 9.9 Notifications Integration

| Event | Integration | Rationale |
|-------|-------------|-----------|
| **Resolution created** | Send submission confirmation | Communication |
| **Status change** | Send status update notification | Communication |
| **Information requested** | Send information request notification | Communication |
| **Decision made** | Send approval/rejection notification | Communication |
| **Refund completed** | Send refund confirmation | Communication |
| **Replacement shipped** | Send shipping notification | Communication |
| **Resolution completed** | Send completion confirmation | Communication |

### 9.10 Documents Integration

| Event | Integration | Rationale |
|-------|-------------|-----------|
| **Return approved** | Generate return label PDF | Customer convenience |
| **Refund completed** | Generate refund receipt | Documentation |
| **Replacement shipped** | Generate shipping label | Operations |
| **Resolution completed** | Archive all documents | Compliance |

### 9.11 Audit Logs Integration

| Event | Audit Event | Resource | Changes |
|-------|-------------|----------|---------|
| **Resolution created** | `RESOLUTION_CREATED` | Resolution | `{ orderId, items, type, reason }` |
| **Resolution approved** | `RESOLUTION_APPROVED` | Resolution | `{ resolutionType, amount }` |
| **Resolution rejected** | `RESOLUTION_REJECTED` | Resolution | `{ reason }` |
| **Refund processed** | `REFUND_PROCESSED` | Resolution | `{ amount, gatewayRef }` |
| **Replacement shipped** | `REPLACEMENT_SHIPPED` | Resolution | `{ trackingNumber }` |
| **Resolution completed** | `RESOLUTION_COMPLETED` | Resolution | `{ type, outcome }` |
| **Admin override** | `RESOLUTION_OVERRIDE` | Resolution | `{ overrideType, reason }` |

---

## 10. Evidence Management

### 10.1 What

The complete architecture for managing evidence uploaded during resolution requests — including images, videos, documents, secure storage, validation, retention, and access permissions.

### 10.2 Why

- **Decision quality:** Better evidence = better decisions.
- **Fraud prevention:** Evidence helps identify fraudulent claims.
- **Legal protection:** Evidence provides proof in dispute scenarios.
- **Storage efficiency:** Proper management prevents storage bloat.
- **Privacy:** Evidence contains personal data — must be secured.

### 10.3 Where

Return request form (upload), evidence viewer (admin), storage system (Cloudinary/R2), resolution detail page.

### 10.4 Evidence Types

| Type | Format | Max Size | Max Count | Storage |
|------|--------|----------|-----------|---------|
| **Photos** | JPEG, PNG, WebP | 10MB each | 10 | Cloudinary |
| **Video** | MP4 (H.264) | 50MB | 1 | Cloudinary or R2 |
| **Documents** | PDF | 20MB each | 5 | R2 |
| **Audio** | MP3, WAV | 10MB each | 3 | R2 (future) |

### 10.5 Secure Storage

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Storage provider** | Cloudinary (images/video), R2 (documents) | Best-in-class |
| **Folder structure** | `nabome/resolutions/{resolutionId}/{type}/` | Organization |
| **Access control** | Private bucket, signed URLs for access | Security |
| **CDN delivery** | Serve via CDN for performance | Speed |
| **Backup** | R2 provides automatic replication | Durability |
| **Encryption** | At-rest encryption enabled | Security |

### 10.6 Evidence Validation

| Check | Standard | Action if Failed |
|-------|----------|------------------|
| **File type** | Validate MIME type matches allowed types | Reject upload |
| **File size** | Validate size within limits | Reject upload |
| **Image dimensions** | Min 640x480, max 4096x4096 | Warn user |
| **Corruption** | Verify file integrity | Reject upload |
| **Malware** | Scan for malware (future) | Reject upload |
| **Content** | Verify images show item (basic check) | Flag for review |
| **EXIF data** | Strip EXIF data for privacy | Auto-process |
| **Duplicate** | Check for duplicate file hashes | Warn user |

### 10.7 Evidence Retention

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Active resolution** | Retain all evidence | Decision support |
| **Completed resolution** | Retain for 7 years | Legal compliance |
| **Rejected resolution** | Retain for 1 year | Appeal support |
| **Cancelled resolution** | Retain for 30 days, then delete | Storage management |
| **Archived resolution** | Evidence archived with resolution | Compliance |
| **Deletion** | Soft delete, then hard delete after retention | Cleanup |

### 10.8 Access Permissions

| Role | Upload | View Own | View Others | Delete | Download |
|------|--------|----------|-------------|--------|----------|
| **Customer** | Yes (own resolution) | Yes | No | No | Yes (own) |
| **Shop Owner** | No | No | Yes (their products) | No | Yes |
| **Admin** | No | Yes | Yes | No | Yes |
| **System** | No | Yes | Yes | Yes (after retention) | No |

---

## 11. Permissions

### 11.1 What

The complete permission architecture for the Resolution Engine — defining what customers, shop owners, and admins can do with resolution requests.

### 11.2 Why

- **Security:** Only authorized users can perform actions.
- **Privacy:** Customers see only their own data.
- **Governance:** Admin actions are controlled and audited.
- **Compliance:** Permission enforcement meets regulatory requirements.
- **Clarity:** Everyone knows exactly what they can and cannot do.

### 11.3 Where

Every API handler, every frontend component, every admin action in the Resolution Engine.

### 11.4 Customer Permissions

| Action | Permission | Condition |
|--------|-----------|-----------|
| **View resolutions** | `resolution.view_own` | Own resolutions only |
| **Create resolution** | `resolution.create` | Eligible order items |
| **Edit resolution** | `resolution.edit_own` | Before admin review |
| **Cancel resolution** | `resolution.cancel_own` | Before approval |
| **Upload evidence** | `resolution.upload_evidence` | Own resolution |
| **Add description** | `resolution.add_description` | Own resolution |
| **Respond to info request** | `resolution.respond_info` | When admin requests |
| **Appeal rejection** | `resolution.appeal` | Within 7 days of rejection |
| **Confirm receipt** | `resolution.confirm_receipt` | When replacement delivered |

### 11.5 Shop Owner Permissions

| Action | Permission | Condition |
|--------|-----------|-----------|
| **View resolutions** | `resolution.view_shop` | Their products only |
| **View evidence** | `resolution.view_evidence_shop` | Their products |
| **Add internal note** | `resolution.note_shop` | Their products |
| **View reports** | `resolution.view_reports_shop` | Their products only |

### 11.6 Admin Permissions

| Action | Permission | Condition |
|--------|-----------|-----------|
| **View all resolutions** | `resolution.view_all` | All resolutions |
| **Review resolution** | `resolution.review` | Pending review queue |
| **Approve resolution** | `resolution.approve` | After review |
| **Reject resolution** | `resolution.reject` | After review |
| **Request information** | `resolution.request_info` | During review |
| **Escalate resolution** | `resolution.escalate` | Complex cases |
| **Override eligibility** | `resolution.override_eligibility` | Admin governance |
| **Change resolution type** | `resolution.change_type` | Admin governance |
| **Adjust refund amount** | `resolution.adjust_amount` | Admin governance |
| **Process refund** | `resolution.process_refund` | After approval |
| **Initiate replacement** | `resolution.initiate_replacement` | After approval |
| **Add internal note** | `resolution.note_admin` | Any resolution |
| **View audit log** | `resolution.view_audit` | All resolutions |
| **Generate reports** | `resolution.generate_reports` | All resolutions |

### 11.7 Action Matrix

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| **View resolutions** | Own only | Their products | All |
| **Create resolution** | ✓ | ✗ | ✗ |
| **Edit resolution** | Own, before review | ✗ | ✗ |
| **Cancel resolution** | Own, before approval | ✗ | ✗ |
| **Upload evidence** | Own resolution | ✗ | ✗ |
| **Review** | ✗ | ✗ | ✓ |
| **Approve** | ✗ | ✗ | ✓ |
| **Reject** | ✗ | ✗ | ✓ |
| **Request info** | ✗ | ✗ | ✓ |
| **Escalate** | ✗ | ✗ | ✓ |
| **Override** | ✗ | ✗ | ✓ |
| **Process refund** | ✗ | ✗ | ✓ |
| **Add note** | ✗ | Their products | ✓ |
| **View audit** | ✗ | ✗ | ✓ |
| **Appeal** | Own, within 7 days | ✗ | ✗ |
| **Confirm receipt** | Own, when delivered | ✗ | ✗ |

---

## 12. Performance

### 12.1 What

Performance standards for the Resolution Engine — including large resolution volumes, background processing, media optimization, search, filters, and reporting.

### 12.2 Why

- **Customer experience:** Fast resolution submission and status updates.
- **Admin efficiency:** Fast queue loading and batch processing.
- **Scalability:** Handle 0 to 100,000+ resolutions without degradation.
- **Media handling:** Efficient upload and delivery of evidence.
- **Reporting:** Fast aggregation for business intelligence.

### 12.3 Large Resolution Volume

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Database indexing** | Index on status, orderId, profileId, createdAt | Query performance |
| **Composite indexes** | `[status, createdAt]`, `[orderId, status]` | Common query patterns |
| **Pagination** | 20 items per page default, max 100 | Performance |
| **List caching** | Cache resolution lists for 5 minutes | Reduce DB load |
| **Count caching** | Cache resolution counts for dashboard | Reduce aggregation |
| **Archive old** | Archive resolutions older than 2 years | Table size management |

### 12.4 Background Processing

| Task | Method | Rationale |
|------|--------|-----------|
| **Refund processing** | Background job queue | Non-blocking |
| **Replacement shipment** | Background job queue | Non-blocking |
| **Notification sending** | Background job queue | Non-blocking |
| **Evidence processing** | Background job (compression, thumbnails) | Non-blocking |
| **Auto-close expired** | Scheduled cron job | Automation |
| **SLA monitoring** | Scheduled cron job | Operations |
| **Reconciliation** | Scheduled daily job | Financial accuracy |

### 12.5 Media Optimization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Image compression** | Client-side compression before upload | Faster upload |
| **Thumbnail generation** | Auto-generate thumbnails for admin viewer | Faster loading |
| **Lazy loading** | Load evidence on demand | Performance |
| **CDN delivery** | Serve all media via CDN | Global performance |
| **Format optimization** | Convert to WebP for supported browsers | Smaller files |
| **Video transcoding** | Transcode to multiple qualities | Adaptive streaming |

### 12.6 Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Resolution ID search** | Instant lookup by resolution ID | Support |
| **Order number search** | Find resolutions by order number | Support |
| **Customer email search** | Find resolutions by customer email | Support |
| **Full-text search** | Search in reasons, descriptions | Discovery |
| **Typo tolerance** | Levenshtein distance 2 | Forgiving |
| **Search latency** | < 200ms for all searches | Performance |

### 12.7 Filters

| Filter | Options | Purpose |
|--------|---------|---------|
| **Status** | All status values | Queue management |
| **Resolution type** | Refund, Replacement, Exchange, Store Credit | Type filtering |
| **Reason** | All return reasons | Trend analysis |
| **Date range** | Custom date range | Time-based filtering |
| **Shop** | All shops | Multi-tenant filtering |
| **Amount range** | Min/max refund amount | Financial filtering |
| **Priority** | High, Normal, Low | Queue prioritization |

### 12.8 Reporting

| Report | Frequency | Purpose |
|--------|-----------|---------|
| **Resolution volume** | Daily/Weekly/Monthly | Operations |
| **Resolution rate** | Daily/Weekly/Monthly | Business health |
| **Refund amount** | Daily/Weekly/Monthly | Financial |
| **Return reasons** | Weekly/Monthly | Product quality |
| **Resolution time** | Weekly/Monthly | SLA performance |
| **Approval/rejection rate** | Weekly/Monthly | Quality control |
| **Top returned products** | Monthly | Product improvement |
| **Shop resolution performance** | Monthly | Shop quality |

---

## 13. Security

### 13.1 What

Security standards for the Resolution Engine — including fraud prevention, duplicate request prevention, permission enforcement, audit logging, and immutable resolution history.

### 13.2 Why

- **Fraud prevention:** Return fraud costs billions annually.
- **Data protection:** Evidence contains personal data.
- **Financial security:** Refunds involve money movement.
- **Compliance:** Legal requirements for data handling.
- **Trust:** Security builds customer confidence.

### 13.3 Fraud Prevention

| Check | Standard | Rationale |
|-------|----------|-----------|
| **Velocity check** | Max 5 returns per customer per month | Abuse prevention |
| **Pattern detection** | Flag customers with >30% return rate | Pattern detection |
| **High-value flag** | Auto-flag returns > ₹10,000 | Risk management |
| **New account flag** | Flag returns from accounts < 30 days old | Risk scoring |
| **Address mismatch** | Flag returns where return address differs from delivery | Risk scoring |
| **Evidence analysis** | AI analysis of evidence images (future) | Fraud detection |
| **Serial returner** | Track and flag serial returners | Pattern detection |
| **Amount anomaly** | Flag returns significantly higher than average | Risk scoring |

### 13.4 Duplicate Request Prevention

| Check | Standard | Rationale |
|-------|----------|-----------|
| **Item-level dedup** | One return request per order item | Prevention |
| **Time window** | 5-minute cooldown between requests from same user | Rapid submit prevention |
| **Order-level dedup** | Cannot create resolution for already-resolved items | Prevention |
| **Idempotency key** | Unique per resolution attempt | Prevent duplicates |
| **Database constraint** | Unique constraint on (orderId, orderItemId, status) | DB-level prevention |

### 13.5 Permission Enforcement

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **API authentication** | Every API call requires authentication | Security |
| **Authorization** | Every action checks permission | Access control |
| **Ownership check** | Customer can only access own resolutions | Privacy |
| **Shop isolation** | Shop owner can only see their products' resolutions | Multi-tenant security |
| **Admin-only actions** | Approval, rejection, override restricted to admin | Governance |
| **Rate limiting** | Rate limit resolution creation and evidence upload | Abuse prevention |
| **CSRF protection** | CSRF token on all mutation requests | Security |

### 13.6 Audit Logging

| Event | Logged Data | Retention |
|-------|-------------|-----------|
| **Resolution created** | Actor, order, items, reason, evidence count | 7 years |
| **Resolution reviewed** | Actor, decision, reason | 7 years |
| **Resolution approved** | Actor, resolution type, amount | 7 years |
| **Resolution rejected** | Actor, reason, appeal option | 7 years |
| **Refund processed** | Actor, amount, gateway reference | 7 years |
| **Refund failed** | Actor, error, retry count | 7 years |
| **Evidence uploaded** | Actor, file type, file size | 7 years |
| **Admin override** | Actor, override type, reason | 7 years |
| **Escalation** | Actor, escalation reason | 7 years |

### 13.7 Immutable Resolution History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Append-only** | Resolution history records are never modified | Audit integrity |
| **No physical delete** | History records are never deleted | Compliance |
| **No overwrite** | Status changes create new records, don't update old | Traceability |
| **Timestamp integrity** | UTC timestamps, never modified | Accuracy |
| **Actor integrity** | Actor attribution, never modified | Accountability |
| **Blockchain readiness** | Architecture supports hash chaining (future) | Tamper evidence |

---

## 14. Accessibility

### 14.1 What

Accessibility standards for the Resolution Engine — ensuring mobile submission, responsive workflow, keyboard support, screen readers, and reduced motion support.

### 14.2 Why

- **Inclusivity:** Every customer must be able to submit and track resolutions.
- **Legal compliance:** WCAG 2.1 AA compliance required.
- **Business reach:** 15% of population has some disability.
- **Brand integrity:** Premium means accessible to everyone.
- **Mobile-first:** 70%+ traffic is mobile — accessibility starts there.

### 14.3 Mobile Submission

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Touch targets** | Min 44x44px for all interactive elements | Touch-friendly |
| **Camera integration** | Direct camera access for evidence capture | Convenience |
| **Form layout** | Single-column, large inputs | Mobile-friendly |
| **File upload** | Tap to select or capture photo | Simple |
| **Progress indicator** | Clear step indicator | Orientation |
| **Sticky submit** | Submit button always visible on mobile | Conversion |
| **Offline draft** | Save draft locally for offline editing | Resilience |

### 14.4 Responsive Workflow

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Mobile layout** | Single-column, full-width | Small screen |
| **Tablet layout** | Two-column where appropriate | Medium screen |
| **Desktop layout** | Full dashboard with sidebar | Large screen |
| **Breakpoints** | Follow Nabome responsive breakpoints | Consistency |
| **Image sizing** | Responsive evidence images | Performance |
| **Navigation** | Mobile bottom nav, desktop sidebar | Platform-appropriate |

### 14.5 Keyboard Support

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Tab order** | Logical tab order through form fields | Keyboard navigation |
| **Focus indicators** | Visible focus ring on all interactive elements | Visibility |
| **Enter to submit** | Enter key submits form | Efficiency |
| **Escape to close** | Escape closes modals/dialogs | Convention |
| **Arrow keys** | Arrow keys navigate image gallery | Power users |
| **Shortcuts** | Keyboard shortcuts for common actions (future) | Efficiency |

### 14.6 Screen Readers

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **ARIA labels** | All interactive elements have ARIA labels | Screen reader support |
| **Status announcements** | Status changes announced via ARIA live regions | Awareness |
| **Form errors** | Errors linked to form fields via `aria-describedby` | Error communication |
| **Progress** | Resolution progress announced | Orientation |
| **Image alt text** | Evidence images have descriptive alt text | Image description |
| **Headings** | Proper heading hierarchy | Navigation |
| **Landmarks** | ARIA landmarks for page regions | Navigation |

### 14.7 Reduced Motion

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **prefers-reduced-motion** | Respect OS-level reduced motion setting | Accessibility |
| **Animations** | Disable non-essential animations when reduced motion | Comfort |
| **Transitions** | Use opacity/transform only, no layout shifts | Performance |
| **Loading states** | Use subtle pulse instead of complex animations | Accessibility |
| **Progress indicators** | Use simple progress bar, not animated | Accessibility |

---

## 15. Future Readiness

### 15.1 What

Architecture for future capabilities — AI fraud detection, AI resolution assistant, automated eligibility, automated approvals, store credit, multi-warehouse replacement, international returns, and courier pickup integration.

### 15.2 Why

- **Intelligence:** AI reduces manual review burden.
- **Automation:** Automated workflows scale operations.
- **Global expansion:** Architecture supports international returns.
- **Courier integration:** Automated pickup reduces operational cost.
- **Store credit:** Retains revenue on platform.

### 15.3 AI Fraud Detection

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Image analysis** | AI analyzes evidence images for manipulation | Computer vision model |
| **Pattern detection** | ML detects suspicious return patterns | Anomaly detection |
| **Risk scoring** | Assign risk score to each return request | ML model |
| **Serial returner detection** | Identify and flag serial returners | Pattern analysis |
| **Amount prediction** | Predict likely refund amount for budgeting | Regression model |

### 15.4 AI Resolution Assistant

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Auto-categorization** | AI categorizes return reason from description | NLP classification |
| **Evidence scoring** | AI scores evidence quality | Image analysis |
| **Resolution suggestion** | AI suggests optimal resolution type | Recommendation engine |
| **Auto-approval** | AI auto-approves low-risk returns | Rule-based + ML |
| **Response drafting** | AI drafts rejection/approval messages | LLM generation |

### 15.5 Automated Eligibility

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Rule engine** | Configurable eligibility rules | Admin-configurable rules |
| **Dynamic windows** | Return windows adjusted by product, customer, season | Rule engine |
| **Risk-based** | Eligibility adjusted by customer risk score | ML integration |
| **Loyalty-based** | Extended windows for loyal customers | Loyalty integration |

### 15.6 Automated Approvals

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Rule-based auto-approve** | Auto-approve returns matching criteria | Rule engine |
| **Threshold-based** | Auto-approve returns under ₹500 | Amount threshold |
| **Risk-based** | Auto-approve low-risk returns | Risk scoring |
| **Loyalty-based** | Auto-approve for trusted customers | Customer history |
| **Human-in-loop** | Admin reviews auto-approvals in batch | Batch review |

### 15.7 Store Credit

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Credit issuance** | Issue store credit instead of refund | Payment system |
| **Credit balance** | Customer maintains credit balance | Wallet system |
| **Credit redemption** | Apply credit at checkout | Checkout integration |
| **Credit expiry** | Configurable expiry (default 1 year) | Expiry system |
| **Credit transfer** | Future: transfer credit to other users | Wallet system |

### 15.8 Multi-Warehouse Replacement

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Warehouse selection** | Ship replacement from nearest warehouse | Warehouse system |
| **Stock routing** | Intelligent stock routing for replacements | Routing engine |
| **Split shipment** | Ship from multiple warehouses if needed | Shipping system |
| **Cost optimization** | Minimize shipping cost for replacements | Cost calculator |

### 15.9 International Returns

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Customs handling** | Handle customs documentation for international returns | Logistics integration |
| **Currency refund** | Refund in original currency | Multi-currency support |
| **International shipping** | Ship replacements internationally | International logistics |
| **Duty handling** | Handle import duties for replacements | Tax system |

### 15.10 Courier Pickup Integration

| Capability | Description | Implementation |
|------------|-------------|----------------|
| **Automated pickup** | Schedule courier pickup for returns | Shiprocket/Delhivery API |
| **Pickup tracking** | Track pickup status | Courier webhook |
| **Label generation** | Auto-generate return shipping labels | Courier API |
| **Cost management** | Platform absorbs return shipping cost | Business rule |
| **Failed pickup** | Handle failed pickup attempts | Retry logic |

---

## 16. Mandatory Rules for AI Agents

### 16.1 Resolution Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Resolution ID required** | Every resolution must have a unique Resolution ID (UUID v4 + public ID + display ID) | Traceability |
| **Eligibility first** | Always validate eligibility before creating resolution | Prevent invalid requests |
| **Evidence required** | At least 1 photo required for return requests | Decision support |
| **Admin approval** | All refunds require admin approval | Financial governance |
| **One resolution per item** | Each order item can have only one active resolution | Prevention |
| **Status machine** | Follow defined status transitions only | Prevent illegal states |
| **Audit everything** | Every resolution action must be logged | Compliance |
| **Notify always** | Notify customer on every status change | Communication |
| **Soft delete only** | Never hard delete resolution records | Data integrity |
| **Idempotent operations** | All resolution operations must be idempotent | Prevent duplicates |

### 16.2 Integration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Order sync** | Resolution status must reflect in order status | Consistency |
| **Inventory sync** | Replacement/exchange must update inventory | Accuracy |
| **Finance sync** | Refunds must create finance records | Accounting |
| **Payment sync** | Refunds must go through payment gateway | Financial integrity |
| **Notification sync** | Every status change triggers notification | Communication |
| **Audit sync** | Every resolution action triggers audit log | Compliance |

### 16.3 Data Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **DECIMAL for money** | All refund amounts use `DECIMAL(10,2)` | Precision |
| **UUID for IDs** | All primary keys are UUID v4 | Uniqueness |
| **Timestamps** | All records have `createdAt` and `updatedAt` | Audit |
| **Soft delete** | Use `isActive = false`, never hard delete | Integrity |
| **Immutability** | Resolution history records are append-only | Compliance |
| **Public IDs** | Use public IDs (RETN_, REFD_) for customer-facing | Security |

### 16.4 Security Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Authentication** | Every API call requires authentication | Security |
| **Authorization** | Every action checks permission | Access control |
| **Ownership** | Customers can only access own resolutions | Privacy |
| **Rate limiting** | Rate limit resolution creation and upload | Abuse prevention |
| **Evidence security** | Evidence stored in private bucket with signed URLs | Data protection |
| **No secrets** | Never log or expose gateway credentials | Security |

### 16.5 Performance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Index FKs** | Index all foreign key columns | Query performance |
| **Pagination** | Always paginate list queries | Performance |
| **Background jobs** | Refund processing, notifications in background | Non-blocking |
| **Media optimization** | Compress images before upload | Storage efficiency |
| **Cache lists** | Cache resolution lists for 5 minutes | Reduce DB load |
| **Archive old** | Archive resolutions older than 2 years | Table management |

### 16.6 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Process refund without resolution | No audit trail | Always create resolution first |
| Skip eligibility check | Invalid returns processed | Always validate eligibility |
| Auto-approve all returns | Fraud vulnerability | Admin review required |
| Delete resolution records | Destroys audit trail | Archive, never delete |
| Hard delete evidence | Legal risk | Retain per policy |
| Skip notification | Customer left in dark | Notify on every change |
| Process refund synchronously | Blocks requests | Background processing |
| Allow double resolution | Duplicate refunds | One resolution per item |
| Trust client-side validation | Security risk | Server-side validation always |
| Skip audit logging | Cannot debug | Log every resolution event |
| Mix resolution and order logic | Tight coupling | Independent resolution module |
| Skip idempotency checks | Duplicate processing | Idempotent operations always |

---

## Appendix A: Resolution ID Standards

### A.1 Resolution ID Types

| ID Type | Format | Example | Purpose |
|---------|--------|---------|---------|
| **Internal UUID** | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` | Database PK |
| **Public ID** | `RETN_` + 12 alphanumeric | `RETN_k8m2p4t6x9z1` | Customer-facing |
| **Display ID** | `RET-YYYY-NNNNNN` | `RET-2026-000001` | Support reference |

### A.2 Refund ID Types

| ID Type | Format | Example | Purpose |
|---------|--------|---------|---------|
| **Internal UUID** | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` | Database PK |
| **Public ID** | `REFD_` + 12 alphanumeric | `REFD_k8m2p4t6x9z1` | Customer-facing |
| **Display ID** | `RFD-YYYY-NNNNNN` | `RFD-2026-000001` | Support reference |

### A.3 Replacement ID Types

| ID Type | Format | Example | Purpose |
|---------|--------|---------|---------|
| **Internal UUID** | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` | Database PK |
| **Public ID** | `RPLC_` + 12 alphanumeric | `RPLC_k8m2p4t6x9z1` | Customer-facing |

---

## Appendix B: Return Reason Registry

| Reason Code | Display Name | Category | Requires Description | Auto-Suggested Resolution |
|-------------|-------------|----------|---------------------|---------------------------|
| `wrong_size` | Size doesn't fit | Size | No | Exchange or Refund |
| `wrong_item` | Received wrong item | Fulfillment | Yes | Replacement |
| `defective` | Item is defective | Quality | Yes | Refund or Replacement |
| `not_as_described` | Not as described | Quality | Yes | Refund |
| `changed_mind` | Changed my mind | Preference | No | Refund |
| `quality_issue` | Quality not as expected | Quality | Yes | Refund or Exchange |
| `damaged_in_transit` | Damaged in transit | Shipping | Yes | Replacement or Refund |
| `late_delivery` | Delivered too late | Shipping | No | Refund |
| `missing_parts` | Missing parts/accessories | Fulfillment | Yes | Replacement |
| `other` | Other reason | Other | Yes | Admin review |

---

## Appendix C: Resolution Configuration Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `return_window_days` | Integer | 7 | Default return window in days |
| `electronics_return_days` | Integer | 14 | Electronics return window |
| `furniture_return_days` | Integer | 30 | Furniture return window |
| `max_evidence_images` | Integer | 10 | Maximum images per request |
| `max_evidence_video_size_mb` | Integer | 50 | Maximum video size |
| `max_evidence_images_size_mb` | Integer | 10 | Maximum per image size |
| `review_sla_hours` | Integer | 48 | Admin review SLA |
| `info_request_timeout_days` | Integer | 7 | Days to respond to info request |
| `appeal_window_days` | Integer | 7 | Days to appeal rejection |
| `auto_close_days` | Integer | 7 | Days to auto-complete after delivery |
| `max_return_rate_percent` | Integer | 30 | Max return rate before flagging |
| `max_monthly_returns` | Integer | 5 | Max returns per customer per month |
| `high_value_threshold` | Decimal | 10000 | Amount to auto-escalate |
| `auto_approve_threshold` | Decimal | 500 | Amount for auto-approval (future) |
| `refund_processing_days` | Integer | 7 | Expected refund processing time |
| `replacement_shipping_days` | Integer | 5 | Expected replacement shipping time |
| `resolution_history_retention_years` | Integer | 7 | Years to retain resolution history |

---

*This document is the official Return, Refund, Replacement & Customer Resolution Engine Architecture Standard for the Nabome Commerce Operating System. All AI agents must follow this document when implementing, reviewing, or modifying resolution-related functionality.*
