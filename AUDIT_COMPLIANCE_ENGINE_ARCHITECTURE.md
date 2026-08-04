# নবME (Nabome) — Audit Log, Activity Timeline & Compliance Engine Architecture

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for audit, compliance, and traceability design  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), and all domain architecture documents  

---

## Table of Contents

1. [Audit Foundation](#1-audit-foundation)
2. [Activity Logging Architecture](#2-activity-logging-architecture)
3. [Activity Timeline Architecture](#3-activity-timeline-architecture)
4. [Change Tracking Architecture](#4-change-tracking-architecture)
5. [Log Content Standards](#5-log-content-standards)
6. [Search Architecture](#6-search-architecture)
7. [Reporting Architecture](#7-reporting-architecture)
8. [Retention Architecture](#8-retention-architecture)
9. [Permissions Architecture](#9-permissions-architecture)
10. [Security Architecture](#10-security-architecture)
11. [Performance Architecture](#11-performance-architecture)
12. [Accessibility Architecture](#12-accessibility-architecture)
13. [Future Readiness Architecture](#13-future-readiness-architecture)
14. [Integration Contract](#14-integration-contract)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Audit Foundation

### 1.1 Audit Philosophy

**What:** The Audit Engine is Nabome's immutable memory — a permanent, tamper-proof record of every significant action across the entire platform.

**Why:**
- **Transparency:** Every stakeholder can verify what happened, when, and by whom.
- **Accountability:** No action is anonymous; every change has an author.
- **Debugging:** When something breaks, the audit trail provides the exact sequence of events.
- **Compliance:** Indian tax laws (GST), consumer protection regulations, RBI payment rules, and future data protection laws require complete, immutable business records.
- **Security:** Unauthorized access, suspicious activity, and data breaches are detectable through audit analysis.
- **Operational confidence:** Business owners trust the platform because they can always verify system behavior.

**Where:** Every module, every service, every API handler, every database mutation.

### 1.2 Audit Ownership

**What:** The Audit Engine is a cross-cutting concern owned by no single business module.

**Why:** If audit ownership belongs to one module, it becomes coupled to that module's lifecycle. The audit engine must survive any module's redesign, replacement, or removal.

**Where:** The audit engine exists as an independent service layer at `api/services/audit/`.

**Best practices:**
- The audit engine depends on zero business modules.
- Business modules depend on the audit engine (one-way dependency).
- The audit engine exposes a simple, stable API: `log(event)`, `query(filter)`, `getTimeline(entity)`.
- The audit engine has its own database schema (`audit_log`, `audit_archive`, `audit_retention_policy`).

**Common implementation mistakes:**
- Embedding audit logic inside business handlers (creates coupling).
- Having the audit service import business model types (creates circular dependency).
- Making audit logging synchronous and blocking (creates performance bottleneck).
- Treating audit as "someone else's problem" — every developer must log events.

### 1.3 Audit Lifecycle

**What:** The complete journey of an audit event from creation to permanent archival.

**Lifecycle stages:**

```
Business Action → Event Emission → Async Queue → Audit Writer → Database → Archive → Permanent Storage
```

| Stage | Description | Failure Behavior |
|-------|-------------|-----------------|
| **Event Emission** | Business module emits a typed audit event | Non-blocking, fire-and-forget |
| **Async Queue** | Event enters a background queue (Cloudflare Queues or in-process buffer) | Buffered, retry on failure |
| **Audit Writer** | Writer serializes event to structured format | Retry with exponential backoff |
| **Database** | Record inserted into `audit_log` table | Never blocks business workflow |
| **Archive** | After retention period, records move to `audit_archive` | Compression, cold storage |
| **Permanent Storage** | Financial/compliance records retained per policy | Immutable cold storage |

### 1.4 Immutable History

**What:** Once an audit record is written, it can never be modified, updated, or physically deleted.

**Why:**
- If audit records can be changed, they provide zero value as evidence.
- Compliance regulations require tamper-proof records.
- Legal proceedings require chain-of-custody integrity.

**Where:** Every audit table, every audit record, every audit archive.

**Best practices:**
- Database-level: No UPDATE or DELETE permissions on audit tables for application roles.
- Application-level: No update or delete methods in the audit service API.
- Schema-level: Audit tables have no `updatedAt` column; only `createdAt`.
- Index-level: Append-only B-tree indexes optimized for sequential writes.
- Physical-level: Audit tables use write-ahead logging (WAL) for crash recovery.

**Common implementation mistakes:**
- Adding an `updatedAt` column to audit tables (implies mutability).
- Creating "soft delete" on audit records (contradicts immutability).
- Building "edit audit record" features for admins (destroys integrity).
- Using the same database connection pool for audit writes and business reads (creates contention).

### 1.5 Compliance Strategy

**What:** A layered compliance framework that satisfies current Indian regulations and anticipates future requirements.

**Compliance layers:**

| Layer | Regulation | Requirement | Nabome Implementation |
|-------|-----------|-------------|----------------------|
| **Financial** | GST Act, Income Tax Act | 7-year retention of financial records | Permanent audit log with 7-year minimum retention |
| **Payment** | RBI guidelines | Immutable payment records, tamper detection | Append-only payment audit with checksum verification |
| **Consumer** | Consumer Protection Act | Transparent business practices, dispute resolution records | Complete order/payment/dispute audit trail |
| **Data Protection** | IT Act 2000, future DPDP Act | Data access logging, consent records | User data access audit, preference change tracking |
| **Security** | ISO 27001 (future) | Security event logging, incident response | Security event audit with severity classification |

### 1.6 Forensic Readiness

**What:** The ability to reconstruct the exact sequence of events for any incident, dispute, or investigation.

**Why:** When a security incident, fraud attempt, or system failure occurs, investigators need:
- Who did what, when, from where.
- What the system state was before and after the action.
- What other actions happened around the same time.
- Complete chain of custody for evidence.

**Where:** Every audit record must support forensic reconstruction.

**Best practices:**
- Every audit record captures the full context (user, role, IP, device, session, request ID).
- Timelines are reconstructable from audit records alone.
- Audit records include enough metadata for correlation across modules.
- Forensic queries are pre-built and tested (not improvised during incidents).

### 1.7 Traceability

**What:** The ability to trace any business artifact back to its origin and forward to its consequences.

**Traceability dimensions:**

| Dimension | Example | Audit Record |
|-----------|---------|--------------|
| **Origin** | Who created this order? | `ORDER_CREATED` event with userId |
| **Transformation** | Who modified this product? | `PRODUCT_UPDATED` event with changes |
| **Authorization** | Who approved this refund? | `REFUND_APPROVED` event with approver |
| **Timing** | When did this payment fail? | `PAYMENT_FAILED` event with timestamp |
| **Context** | What else was happening? | Timeline query across all events |
| **Consequence** | What did this change affect? | Downstream event correlation |

---

## 2. Activity Logging Architecture

### 2.1 Event Taxonomy

**What:** A comprehensive classification of every auditable event in the Nabome platform.

**Why:** Without a formal taxonomy, different modules log events inconsistently, making search, reporting, and compliance impossible.

**Where:** Every module must map its actions to the official event taxonomy.

**Event taxonomy structure:**

```
Event
├── Category (authentication, data, financial, system, security)
├── Module (auth, product, order, payment, etc.)
├── Action (create, read, update, delete, status_change, export, etc.)
├── Severity (info, warning, critical, emergency)
└── Compliance Flag (true/false)
```

### 2.2 Authentication Events

**What:** All events related to identity verification, session management, and access control.

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `AUTH_LOGIN_SUCCESS` | User logged in | Info | Yes | userId, method, ip, userAgent, sessionId |
| `AUTH_LOGIN_FAILED` | Login attempt failed | Warning | Yes | email, reason, ip, userAgent, attemptCount |
| `AUTH_LOGOUT` | User logged out | Info | Yes | userId, sessionId, reason |
| `AUTH_LOGOUT_ALL` | All sessions terminated | Warning | Yes | userId, reason, sessionCount |
| `AUTH_PASSWORD_CHANGED` | Password changed | Warning | Yes | userId, method (self/admin/reset), ip |
| `AUTH_PASSWORD_RESET_REQUESTED` | Password reset requested | Info | Yes | email, ip, userAgent |
| `AUTH_PASSWORD_RESET_COMPLETED` | Password reset completed | Warning | Yes | userId, ip, userAgent |
| `AUTH_EMAIL_VERIFIED` | Email verified | Info | Yes | userId, email, method |
| `AUTH_PHONE_VERIFIED` | Phone verified | Info | Yes | userId, phone, method |
| `AUTH_2FA_ENABLED` | Two-factor authentication enabled | Warning | Yes | userId, method |
| `AUTH_2FA_DISABLED` | Two-factor authentication disabled | Critical | Yes | userId, reason, ip |
| `AUTH_2FA_FAILED` | Two-factor verification failed | Warning | Yes | userId, ip, attemptCount |
| `AUTH_SESSION_CREATED` | New session created | Info | No | userId, sessionId, device, ip |
| `AUTH_SESSION_EXPIRED` | Session expired | Info | No | userId, sessionId |
| `AUTH_SESSION_REVOKED` | Session revoked | Warning | Yes | userId, sessionId, revokedBy |
| `AUTH_ACCOUNT_LOCKED` | Account locked | Critical | Yes | userId, reason, lockDuration |
| `AUTH_ACCOUNT_UNLOCKED` | Account unlocked | Warning | Yes | userId, unlockedBy, reason |
| `AUTH_ROLE_CHANGED` | User role changed | Critical | Yes | userId, oldRole, newRole, changedBy |
| `AUTH_PERMISSION_GRANTED` | Permission granted | Warning | Yes | userId, permission, grantedBy |
| `AUTH_PERMISSION_REVOKED` | Permission revoked | Warning | Yes | userId, permission, revokedBy |
| `AUTH_OAUTH_APP_CONNECTED` | OAuth app connected | Info | Yes | userId, appId, scopes |
| `AUTH_OAUTH_APP_DISCONNECTED` | OAuth app disconnected | Warning | Yes | userId, appId |

### 2.3 User Action Events

**What:** All events related to user account management and profile changes.

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `USER_CREATED` | User account created | Info | Yes | userId, method (signup/invited/admin) |
| `USER_UPDATED` | Profile updated | Info | Yes | userId, fieldsChanged, previousValues |
| `USER_DEACTIVATED` | Account deactivated | Warning | Yes | userId, reason, deactivatedBy |
| `USER_REACTIVATED` | Account reactivated | Info | Yes | userId, reactivatedBy, reason |
| `USER_DELETED` | Account deletion requested | Critical | Yes | userId, reason, gracePeriod |
| `USER_DATA_EXPORTED` | User data exported | Warning | Yes | userId, requestedBy, format |
| `USER_PREFERENCES_CHANGED` | Preferences updated | Info | No | userId, fieldsChanged |
| `USER_AVATAR_CHANGED` | Avatar updated | Info | No | userId, mediaId |
| `USER_ADDRESS_ADDED` | Address added | Info | No | userId, addressId |
| `USER_ADDRESS_UPDATED` | Address updated | Info | No | userId, addressId, fieldsChanged |
| `USER_ADDRESS_DELETED` | Address deleted | Info | No | userId, addressId |

### 2.4 Permission Change Events

**What:** All events related to role assignments, permission grants, and access modifications.

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `PERM_ROLE_ASSIGNED` | Role assigned to user | Critical | Yes | userId, oldRole, newRole, assignedBy |
| `PERM_ROLE_REVOKED` | Role revoked from user | Critical | Yes | userId, role, revokedBy, reason |
| `PERM_CUSTOM_PERMISSION_GRANTED` | Custom permission granted | Critical | Yes | userId, permission, grantedBy, scope |
| `PERM_CUSTOM_PERMISSION_REVOKED` | Custom permission revoked | Critical | Yes | userId, permission, revokedBy, reason |
| `PERM_TEAM_MEMBER_ADDED` | Team member added | Warning | Yes | shopId, userId, role, addedBy |
| `PERM_TEAM_MEMBER_REMOVED` | Team member removed | Warning | Yes | shopId, userId, removedBy, reason |
| `PERM_TEAM_MEMBER_ROLE_CHANGED` | Team member role changed | Critical | Yes | shopId, userId, oldRole, newRole, changedBy |
| `PERM_SHOWN_OWNERSHIP_CHANGED` | Shop ownership transferred | Emergency | Yes | shopId, oldOwnerId, newOwnerId, reason |
| `PERM_API_KEY_CREATED` | API key created | Warning | Yes | userId, keyName, scopes, expiresAt |
| `PERM_API_KEY_REVOKED` | API key revoked | Warning | Yes | userId, keyId, reason |
| `PERM_WEBHOOK_CREATED` | Webhook created | Info | Yes | userId, url, events |
| `PERM_WEBHOOK_DELETED` | Webhook deleted | Info | Yes | userId, webhookId |

### 2.5 Product Change Events

**What:** All events related to product lifecycle management.

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `PRODUCT_CREATED` | Product created | Info | No | productId, shopId, name, createdBy |
| `PRODUCT_UPDATED` | Product updated | Info | No | productId, fieldsChanged, previousValues |
| `PRODUCT_PUBLISHED` | Product published | Info | No | productId, publishedBy |
| `PRODUCT_UNPUBLISHED` | Product unpublished | Warning | No | productId, unpublishedBy, reason |
| `PRODUCT_DELETED` | Product deleted | Warning | No | productId, deletedBy, reason |
| `PRODUCT_DUPLICATED` | Product duplicated | Info | No | originalId, newId, createdBy |
| `PRODUCT_PRICE_CHANGED` | Price changed | Warning | No | productId, variantId, oldPrice, newPrice, changedBy |
| `PRODUCT_INVENTORY_CHANGED` | Inventory changed | Warning | No | productId, variantId, oldQty, newQty, reason |
| `PRODUCT_SEO_UPDATED` | SEO settings updated | Info | No | productId, fieldsChanged |
| `PRODUCT_MEDIA_ADDED` | Media added | Info | No | productId, mediaId, type |
| `PRODUCT_MEDIA_REMOVED` | Media removed | Info | No | productId, mediaId, reason |
| `PRODUCT_BULK_IMPORTED` | Products bulk imported | Info | No | importId, count, createdBy |
| `PRODUCT_BULK_EXPORTED` | Products bulk exported | Info | No | exportId, count, format, exportedBy |
| `PRODUCT_STATUS_CHANGED` | Status changed | Info | No | productId, oldStatus, newStatus, changedBy |

### 2.6 Category Changes Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `CATEGORY_CREATED` | Category created | Info | No | categoryId, name, parentId, createdBy |
| `CATEGORY_UPDATED` | Category updated | Info | No | categoryId, fieldsChanged, previousValues |
| `CATEGORY_DELETED` | Category deleted | Warning | No | categoryId, deletedBy, reason |
| `CATEGORY_REORDERED` | Categories reordered | Info | No | categoryIds, newOrder, changedBy |
| `CATEGORY_PRODUCT_ASSIGNED` | Product assigned to category | Info | No | categoryId, productId, assignedBy |
| `CATEGORY_PRODUCT_REMOVED` | Product removed from category | Info | No | categoryId, productId, removedBy |

### 2.7 Collection Changes Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `COLLECTION_CREATED` | Collection created | Info | No | collectionId, name, type, createdBy |
| `COLLECTION_UPDATED` | Collection updated | Info | No | collectionId, fieldsChanged, previousValues |
| `COLLECTION_DELETED` | Collection deleted | Warning | No | collectionId, deletedBy, reason |
| `COLLECTION_PUBLISHED` | Collection published | Info | No | collectionId, publishedBy |
| `COLLECTION_UNPUBLISHED` | Collection unpublished | Info | No | collectionId, unpublishedBy |
| `COLLECTION_PRODUCT_ADDED` | Product added to collection | Info | No | collectionId, productId, addedBy |
| `COLLECTION_PRODUCT_REMOVED` | Product removed from collection | Info | No | collectionId, productId, removedBy |

### 2.8 CMS Changes Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `CMS_PAGE_CREATED` | Page created | Info | No | pageId, title, createdBy |
| `CMS_PAGE_UPDATED` | Page updated | Info | No | pageId, fieldsChanged, previousValues |
| `CMS_PAGE_PUBLISHED` | Page published | Info | No | pageId, publishedBy |
| `CMS_PAGE_UNPUBLISHED` | Page unpublished | Info | No | pageId, unpublishedBy |
| `CMS_PAGE_DELETED` | Page deleted | Warning | No | pageId, deletedBy, reason |
| `CMS_BLOG_POST_CREATED` | Blog post created | Info | No | postId, title, createdBy |
| `CMS_BLOG_POST_UPDATED` | Blog post updated | Info | No | postId, fieldsChanged |
| `CMS_BLOG_POST_PUBLISHED` | Blog post published | Info | No | postId, publishedBy |
| `CMS_MEDIA_UPLOADED` | Media uploaded | Info | No | mediaId, type, size, uploadedBy |
| `CMS_MEDIA_DELETED` | Media deleted | Info | No | mediaId, deletedBy, reason |
| `CMS_MENU_UPDATED` | Navigation menu updated | Info | No | menuId, fieldsChanged, changedBy |

### 2.9 Homepage Changes Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `HOMEPAGE_SECTION_CREATED` | Section created | Info | No | sectionId, type, createdBy |
| `HOMEPAGE_SECTION_UPDATED` | Section updated | Info | No | sectionId, fieldsChanged, previousValues |
| `HOMEPAGE_SECTION_REORDERED` | Sections reordered | Info | No | sectionIds, newOrder, changedBy |
| `HOMEPAGE_SECTION_DELETED` | Section deleted | Warning | No | sectionId, deletedBy, reason |
| `HOMEPAGE_SECTION_VISIBILITY_CHANGED` | Section visibility changed | Info | No | sectionId, oldVisible, newVisible, changedBy |
| `HOMEPAGE_PREVIEW_GENERATED` | Preview generated | Info | No | previewId, createdBy |
| `HOMEPAGE_PUBLISHED` | Homepage published | Warning | No | version, publishedBy, changesSummary |
| `HOMEPAGE_ROLLED_BACK` | Homepage rolled back | Warning | No | targetVersion, rolledBackBy, reason |

### 2.10 Order Events

**What:** All events related to the complete order lifecycle.

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `ORDER_CREATED` | Order placed | Info | Yes | orderId, customerId, items, total, currency |
| `ORDER_CANCELLED` | Order cancelled | Warning | Yes | orderId, cancelledBy, reason, refundRequired |
| `ORDER_STATUS_CHANGED` | Order status changed | Info | Yes | orderId, oldStatus, newStatus, changedBy |
| `ORDER_FULFILLED` | Order fulfilled | Info | Yes | orderId, fulfilledBy, trackingNumber |
| `ORDER_SHIPPED` | Order shipped | Info | Yes | orderId, shippedBy, carrier, trackingNumber |
| `ORDER_DELIVERED` | Order delivered | Info | Yes | orderId, deliveredAt, proofOfDelivery |
| `ORDER_RETURNED` | Order returned | Warning | Yes | orderId, returnId, reason, condition |
| `ORDER_REFUNDED` | Order refunded | Warning | Yes | orderId, refundId, amount, reason |
| `ORDER_NOTE_ADDED` | Internal note added | Info | No | orderId, note, addedBy |
| `ORDER_ADDRESS_CHANGED` | Shipping address changed | Warning | Yes | orderId, oldAddress, newAddress, changedBy |
| `ORDER_DISCOUNT_APPLIED` | Discount applied | Info | No | orderId, couponId, discountAmount |
| `ORDER_GIFT_WRAP_ADDED` | Gift wrap added | Info | No | orderId, message, addedBy |

### 2.11 Payment Events

**What:** All events related to payment processing, refunds, and financial transactions.

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `PAYMENT_INITIATED` | Payment initiated | Info | Yes | orderId, paymentId, amount, method |
| `PAYMENT_PROCESSED` | Payment successful | Info | Yes | orderId, paymentId, amount, method, razorpayId |
| `PAYMENT_FAILED` | Payment failed | Warning | Yes | orderId, amount, method, failureReason |
| `PAYMENT_REFUNDED` | Payment refunded | Warning | Yes | orderId, paymentId, refundId, amount, reason |
| `PAYMENT_PARTIAL_REFUND` | Partial refund | Warning | Yes | orderId, refundId, refundAmount, totalAmount |
| `PAYMENT_CAPTURED` | Payment captured | Info | Yes | paymentId, amount, capturedAt |
| `PAYMENT_AUTHORIZED` | Payment authorized | Info | Yes | paymentId, amount, authorizationId |
| `PAYMENT_VOIDED` | Payment voided | Warning | Yes | paymentId, reason, voidedBy |
| `PAYMENT_DISPUTE_OPENED` | Payment dispute opened | Critical | Yes | paymentId, disputeId, reason |
| `PAYMENT_DISPUTE_RESOLVED` | Payment dispute resolved | Warning | Yes | disputeId, resolution, resolvedBy |
| `PAYMENT_METHOD_ADDED` | Payment method added | Info | No | userId, methodType, last4 |
| `PAYMENT_METHOD_REMOVED` | Payment method removed | Info | No | userId, methodId |

### 2.12 Finance Events

**What:** All events related to financial operations, settlements, and accounting.

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `FINANCE_SETTLEMENT_CREATED` | Settlement created | Info | Yes | settlementId, shopId, amount, period |
| `FINANCE_SETTLEMENT_PROCESSED` | Settlement processed | Info | Yes | settlementId, amount, bankRef |
| `FINANCE_SETTLEMENT_FAILED` | Settlement failed | Critical | Yes | settlementId, reason, amount |
| `FINANCE_INVOICE_GENERATED` | Invoice generated | Info | Yes | invoiceId, orderId, amount, gst |
| `FINANCE_INVOICE_DOWNLOADED` | Invoice downloaded | Info | No | invoiceId, downloadedBy |
| `FINANCE_TAX_CALCULATION` | Tax calculated | Info | Yes | orderId, taxType, amount, rate |
| `FINANCE_GST_FILED` | GST return filed | Critical | Yes | returnId, period, amount, filedBy |
| `FINANCE_EXPENSE_RECORDED` | Expense recorded | Info | Yes | expenseId, category, amount, recordedBy |
| `FINANCE_REVENUE_RECORDED` | Revenue recorded | Info | Yes | orderId, amount, source |
| `FINANCE_PAYOUT_INITIATED` | Payout initiated | Warning | Yes | payoutId, shopId, amount, bankDetails |
| `FINANCE_PAYOUT_COMPLETED` | Payout completed | Info | Yes | payoutId, amount, bankRef |
| `FINANCE_PAYOUT_FAILED` | Payout failed | Critical | Yes | payoutId, reason, amount |
| `FINANCE_CREDIT_NOTE_ISSUED` | Credit note issued | Warning | Yes | creditNoteId, orderId, amount, reason |

### 2.13 Shipping Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `SHIPPING_RATE_CALCULATED` | Shipping rate calculated | Info | No | orderId, weight, destination, rate, carrier |
| `SHIPPING_LABEL_CREATED` | Shipping label created | Info | No | orderId, labelId, carrier, trackingNumber |
| `SHIPPING_LABEL_VOIDED` | Shipping label voided | Info | No | orderId, labelId, reason |
| `SHIPPING_CARRIER_ASSIGNED` | Carrier assigned | Info | No | orderId, carrier, service |
| `SHIPPING_PICKUP_SCHEDULED` | Pickup scheduled | Info | No | orderId, pickupDate, carrier |
| `SHIPPING_PICKUP_COMPLETED` | Pickup completed | Info | No | orderId, pickedUpAt |
| `SHIPPING_TRACKING_UPDATED` | Tracking updated | Info | No | orderId, status, location, timestamp |
| `SHIPPING_DELIVERED` | Shipment delivered | Info | Yes | orderId, deliveredAt, proofOfDelivery |
| `SHIPPING_RTO_INITIATED` | RTO initiated | Warning | Yes | orderId, reason, initiatedBy |
| `SHIPPING_RTO_COMPLETED` | RTO completed | Warning | Yes | orderId, returnedAt, condition |

### 2.14 Inventory Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `INVENTORY_STOCK_ADDED` | Stock added | Info | No | productId, variantId, quantity, reason, addedBy |
| `INVENTORY_STOCK_REMOVED` | Stock removed | Warning | No | productId, variantId, quantity, reason, removedBy |
| `INVENTORY_STOCK_ADJUSTED` | Stock adjusted | Warning | Yes | productId, variantId, oldQty, newQty, reason, adjustedBy |
| `INVENTORY_LOW_STOCK_WARNING` | Low stock warning | Warning | No | productId, variantId, currentQty, threshold |
| `INVENTORY_OUT_OF_STOCK` | Out of stock | Critical | No | productId, variantId |
| `INVENTORY_BACK_IN_STOCK` | Back in stock | Info | No | productId, variantId, quantity |
| `INVENTORY_RESERVED` | Stock reserved | Info | No | productId, variantId, quantity, orderId |
| `INVENTORY_RELEASED` | Reservation released | Info | No | productId, variantId, quantity, orderId |
| `INVENTORY_BULK_UPDATE` | Bulk inventory update | Info | No | updateId, count, changedBy |
| `INVENTORY_TRANSFER` | Stock transferred | Info | No | fromLocation, toLocation, productId, quantity |

### 2.15 Return Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `RETURN_REQUESTED` | Return requested | Info | Yes | returnId, orderId, reason, items |
| `RETURN_APPROVED` | Return approved | Info | Yes | returnId, approvedBy, returnWindow |
| `RETURN_REJECTED` | Return rejected | Warning | Yes | returnId, rejectedBy, reason |
| `RETURN_RECEIVED` | Return received | Info | Yes | returnId, receivedBy, condition |
| `RETURN_INSPECTED` | Return inspected | Info | Yes | returnId, inspectedBy, condition, notes |
| `RETURN_COMPLETED` | Return completed | Info | Yes | returnId, completedAt, refundRequired |
| `RETURN_CANCELLED` | Return cancelled | Warning | Yes | returnId, cancelledBy, reason |

### 2.16 Refund Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `REFUND_INITIATED` | Refund initiated | Warning | Yes | refundId, orderId, amount, reason, initiatedBy |
| `REFUND_APPROVED` | Refund approved | Warning | Yes | refundId, approvedBy, amount |
| `REFUND_REJECTED` | Refund rejected | Warning | Yes | refundId, rejectedBy, reason |
| `REFUND_PROCESSED` | Refund processed | Info | Yes | refundId, amount, razorpayRefundId |
| `REFUND_COMPLETED` | Refund completed | Info | Yes | refundId, amount, creditedAt |
| `REFUND_FAILED` | Refund failed | Critical | Yes | refundId, reason, amount |
| `REFUND_CANCELLED` | Refund cancelled | Warning | Yes | refundId, cancelledBy, reason |

### 2.17 Notification Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `NOTIFICATION_SENT` | Notification sent | Info | No | notificationId, type, channel, recipient |
| `NOTIFICATION_DELIVERED` | Notification delivered | Info | No | notificationId, deliveredAt |
| `NOTIFICATION_OPENED` | Notification opened | Info | No | notificationId, openedAt |
| `NOTIFICATION_CLICKED` | Notification clicked | Info | No | notificationId, clickedAt, link |
| `NOTIFICATION_FAILED` | Notification failed | Warning | No | notificationId, reason |
| `NOTIFICATION_BOUNCED` | Notification bounced | Warning | No | notificationId, bounceType |
| `NOTIFICATION_UNSUBSCRIBED` | User unsubscribed | Info | Yes | userId, channel, reason |
| `NOTIFICATION_PREFERENCE_CHANGED` | Preferences changed | Info | No | userId, fieldsChanged |
| `NOTIFICATION_TEMPLATE_UPDATED` | Template updated | Info | No | templateId, fieldsChanged, changedBy |

### 2.18 Storage Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `STORAGE_FILE_UPLOADED` | File uploaded | Info | No | fileId, fileName, size, type, uploadedBy |
| `STORAGE_FILE_DOWNLOADED` | File downloaded | Info | No | fileId, downloadedBy, ip |
| `STORAGE_FILE_DELETED` | File deleted | Info | No | fileId, deletedBy, reason |
| `STORAGE_FILE_MOVED` | File moved | Info | No | fileId, oldPath, newPath |
| `STORAGE_FILE_SHARED` | File shared | Info | No | fileId, sharedWith, permission |
| `STORAGE_QUOTA_WARNING` | Storage quota warning | Warning | No | usage, quota, percentage |
| `STORAGE_BACKUP_CREATED` | Backup created | Info | No | backupId, size, fileCount |
| `STORAGE_BACKUP_RESTORED` | Backup restored | Warning | Yes | backupId, restoredBy, fileCount |

### 2.19 Document Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `DOCUMENT_GENERATED` | Document generated | Info | Yes | documentId, type, orderId, generatedBy |
| `DOCUMENT_DOWNLOADED` | Document downloaded | Info | No | documentId, downloadedBy, ip |
| `DOCUMENT_EMAILED` | Document emailed | Info | No | documentId, recipient |
| `DOCUMENT_REGENERATED` | Document regenerated | Warning | Yes | documentId, reason, regeneratedBy |
| `DOCUMENT_ARCHIVED` | Document archived | Info | No | documentId, archivedBy |
| `DOCUMENT_CHECKSUM_VALIDATED` | Checksum validated | Info | Yes | documentId, checksum, valid |
| `DOCUMENT_ACCESS_DENIED` | Access denied | Warning | Yes | documentId, userId, reason |

### 2.20 Report Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `REPORT_GENERATED` | Report generated | Info | No | reportId, type, filters, generatedBy |
| `REPORT_DOWNLOADED` | Report downloaded | Info | No | reportId, format, downloadedBy |
| `REPORT_SCHEDULED` | Report scheduled | Info | No | reportId, schedule, createdBy |
| `REPORT_SENT` | Report sent | Info | No | reportId, recipient, channel |
| `REPORT_FAILED` | Report failed | Warning | No | reportId, reason |
| `REPORT_EXPORTED` | Data exported | Info | Yes | exportId, type, format, rowCount, exportedBy |

### 2.21 Settings Events

**What:** All events related to platform configuration changes.

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `SETTINGS_GENERAL_UPDATED` | General settings updated | Info | Yes | fieldsChanged, previousValues, changedBy |
| `SETTINGS_SHIPPING_UPDATED` | Shipping settings updated | Warning | Yes | fieldsChanged, previousValues, changedBy |
| `SETTINGS_PAYMENT_UPDATED` | Payment settings updated | Critical | Yes | fieldsChanged, previousValues, changedBy |
| `SETTINGS_TAX_UPDATED` | Tax settings updated | Critical | Yes | fieldsChanged, previousValues, changedBy |
| `SETTINGS_NOTIFICATION_UPDATED` | Notification settings updated | Info | Yes | fieldsChanged, previousValues, changedBy |
| `SETTINGS_SEO_UPDATED` | SEO settings updated | Info | No | fieldsChanged, previousValues, changedBy |
| `SETTINGS_THEME_UPDATED` | Theme settings updated | Info | No | fieldsChanged, previousValues, changedBy |
| `SETTINGS_INTEGRATION_UPDATED` | Integration settings updated | Warning | Yes | integration, fieldsChanged, changedBy |
| `SETTINGS_API_KEY_ROTATED` | API key rotated | Critical | Yes | keyName, rotatedBy |
| `SETTINGS_WEBHOOK_CREATED` | Webhook created | Info | Yes | webhookId, url, events, createdBy |
| `SETTINGS_WEBHOOK_UPDATED` | Webhook updated | Info | Yes | webhookId, fieldsChanged, changedBy |
| `SETTINGS_WEBHOOK_DELETED` | Webhook deleted | Warning | Yes | webhookId, deletedBy |

### 2.22 System Configuration Events

| Event ID | Event Name | Severity | Compliance | Data Captured |
|----------|-----------|----------|------------|---------------|
| `SYSTEM_DEPLOYMENT` | System deployed | Warning | Yes | version, environment, deployedBy |
| `SYSTEM_ROLLBACK` | System rolled back | Critical | Yes | fromVersion, toVersion, reason, rolledBackBy |
| `SYSTEM_MIGRATION_RUN` | Database migration run | Warning | Yes | migrationId, version, duration |
| `SYSTEM_MAINTENANCE_START` | Maintenance started | Warning | Yes | reason, expectedDuration |
| `SYSTEM_MAINTENANCE_END` | Maintenance ended | Info | Yes | actualDuration |
| `SYSTEM_ERROR` | System error occurred | Critical | No | errorType, message, stackTrace |
| `SYSTEM_PERFORMANCE_DEGRADED` | Performance degraded | Warning | No | metric, threshold, actual |
| `SYSTEM_SECURITY_ALERT` | Security alert | Emergency | Yes | alertType, details, severity |
| `SYSTEM_BACKUP_CREATED` | Backup created | Info | No | backupId, size, type |
| `SYSTEM_CONFIG_CHANGED` | Configuration changed | Warning | Yes | configKey, oldValue, newValue, changedBy |

---

## 3. Activity Timeline Architecture

### 3.1 Timeline Philosophy

**What:** A timeline is a chronological, reconstructable view of all audit events related to a specific entity, user, or scope.

**Why:**
- **Context:** Individual audit events are data points; timelines tell the story.
- **Debugging:** When investigating an issue, you need the sequence, not isolated events.
- **User experience:** Dashboards need to display "what happened" in human-readable form.
- **Compliance:** Regulators ask "show me everything that happened with this order."

**Where:** Every entity that has meaningful lifecycle events has a timeline.

### 3.2 Entity Timeline

**What:** A chronological view of all events related to a single entity (order, product, user, etc.).

**Architecture:**
- Entity timelines are materialized views or cached query results.
- Each entity type defines which events appear in its timeline.
- Timelines are sorted by `createdAt` descending (newest first).
- Timelines include event summaries for quick scanning.
- Timelines support pagination for large histories.

**Timeline event structure:**
```
TimelineEvent {
  id: AuditId
  timestamp: DateTime
  eventType: EventType
  summary: String          // "Product price changed from ₹999 to ₹1,299"
  actor: ActorSummary      // { id, name, role }
  severity: Severity
  details: JSONObject      // Full change details
  relatedEvents: AuditId[] // Correlated events
}
```

**Entity-to-timeline mapping:**

| Entity | Timeline Events | Retention |
|--------|----------------|-----------|
| Order | ORDER_*, PAYMENT_*, SHIPPING_*, RETURN_*, REFUND_* | 7 years |
| Product | PRODUCT_*, INVENTORY_*, CATEGORY_* | Product lifetime + 3 years |
| User | AUTH_*, USER_*, PERM_* | Account lifetime + 7 years |
| Shop | All events scoped to shopId | Shop lifetime + 7 years |
| Customer | USER_*, ORDER_*, RETURN_*, REFUND_* | Account lifetime + 7 years |

### 3.3 User Timeline

**What:** A chronological view of all actions performed by a specific user.

**Why:**
- **Accountability:** "Show me everything this user did."
- **Security:** Detect unusual activity patterns.
- **Support:** Understand what a user was doing when they reported an issue.
- **Compliance:** Regulatory investigations often start with a user.

**Architecture:**
- Indexed on `userId` + `createdAt`.
- Supports filtering by module, action, severity, date range.
- Includes session context (IP, device, location) for each event.
- Aggregates daily/weekly activity summaries.

### 3.4 Order Timeline

**What:** A complete chronological narrative of an order's lifecycle.

**Why:** Orders pass through many states and involve multiple actors (customer, shop owner, admin, shipping carrier). The order timeline reconstructs the full story.

**Timeline narrative example:**
```
ORDER_CREATED — Customer placed order for 3 items (₹4,597)
PAYMENT_INITIATED — Payment via Razorpay (UPI)
PAYMENT_PROCESSED — Payment successful (rzp_abc123)
ORDER_STATUS_CHANGED — Confirmed → Processing
INVENTORY_RESERVED — 3 items reserved from stock
SHIPPING_LABEL_CREATED — Label generated (Delhivery)
SHIPPING_CARRIER_ASSIGNED — Delhivery assigned
SHIPPING_PICKUP_COMPLETED — Picked up from warehouse
SHIPPING_TRACKING_UPDATED — In transit, Mumbai hub
SHIPPING_TRACKING_UPDATED — Out for delivery, Delhi
SHIPPING_DELIVERED — Delivered to customer
ORDER_STATUS_CHANGED — Processing → Delivered
ORDER_COMPLETED — Order completed
```

### 3.5 Product Timeline

**What:** A chronological view of all changes and events related to a single product.

**Timeline narrative example:**
```
PRODUCT_CREATED — "Premium Silk Saree" created by Priya
PRODUCT_MEDIA_ADDED — 5 product photos uploaded
PRODUCT_UPDATED — Description updated
PRODUCT_PUBLISHED — Published to storefront
CATEGORY_PRODUCT_ASSIGNED — Assigned to "Sarees" category
PRODUCT_PRICE_CHANGED — ₹4,999 → ₹5,499
INVENTORY_STOCK_ADDED — +50 units added
INVENTORY_LOW_STOCK_WARNING — Only 5 units remaining
PRODUCT_UPDATED — Size chart updated
INVENTORY_STOCK_ADDED — +100 units restocked
```

### 3.6 Customer Timeline

**What:** A chronological view of all events related to a customer's relationship with the platform.

**Timeline includes:** Account creation, profile changes, orders, payments, returns, refunds, support interactions, notification preferences, loyalty events.

### 3.7 Shop Timeline

**What:** A chronological view of all events scoped to a specific shop.

**Timeline includes:** Shop setup, product changes, order events, payment events, team changes, settings changes, analytics milestones.

### 3.8 Finance Timeline

**What:** A chronological view of all financial events, organized by settlement period.

**Timeline includes:** Orders, payments, refunds, settlements, payouts, invoices, tax events, disputes.

### 3.9 System Timeline

**What:** A chronological view of all system-level events.

**Timeline includes:** Deployments, migrations, configuration changes, security alerts, performance events, maintenance windows.

### 3.10 Timeline Query API

**What:** A standardized API for querying any timeline.

**API contract:**
```
GET /api/audit/timeline/{entityType}/{entityId}
  ?page=1
  &limit=50
  &startDate=2026-01-01
  &endDate=2026-08-03
  &eventType=ORDER_*,PAYMENT_*
  &severity=warning,critical
  &actor=userId
```

**Response structure:**
```json
{
  "timeline": {
    "entity": { "type": "Order", "id": "ord_abc123" },
    "events": [TimelineEvent],
    "pagination": { "page": 1, "limit": 50, "total": 127, "hasMore": true },
    "summary": {
      "totalEvents": 127,
      "dateRange": { "first": "2026-01-15", "last": "2026-08-01" },
      "actors": [{ "id": "usr_123", "name": "Priya", "eventCount": 45 }],
      "severityBreakdown": { "info": 98, "warning": 25, "critical": 4 }
    }
  }
}
```

---

## 4. Change Tracking Architecture

### 4.1 Change Tracking Philosophy

**What:** Every mutation to business data must record what changed, from what, to what.

**Why:**
- **Debugging:** "When did this price change?" requires knowing old and new values.
- **Compliance:** Financial regulators require change history.
- **Accountability:** "Who approved this?" requires change attribution.
- **Undo capability:** Reverting changes requires knowing the previous state.

### 4.2 Previous Value / New Value Standard

**What:** Every audit event that represents a change must capture both the previous and new values.

**Standard change structure:**
```json
{
  "changes": {
    "price": { "old": 999, "new": 1299 },
    "status": { "old": "draft", "new": "published" },
    "inventory": { "old": 50, "new": 100 }
  }
}
```

**Rules:**
- If a field was added (no previous value), `old` is `null`.
- If a field was removed (no new value), `new` is `null`.
- If a field was not changed, it does not appear in the changes object.
- Nested objects are flattened for searchability: `address.city` not `address: { city: ... }`.
- Array changes record the full old and new arrays (not diffs) for clarity.
- Sensitive fields (passwords, tokens, API keys) are redacted: `"old": "[REDACTED]"`.

### 4.3 Field-Level Change Tracking

**What:** Granular tracking of which specific fields changed in a mutation.

**Why:** When a product is updated, the audit record should show exactly which fields changed, not just "product updated."

**Implementation pattern:**
- Every update operation computes a diff between old and new state.
- Only changed fields are recorded in the audit event.
- Unchanged fields are excluded to reduce noise and storage.
- Field paths use dot notation for nested objects: `meta.seo.title`.

### 4.4 Bulk Change Tracking

**What:** When multiple entities are changed in a single operation, each change is individually tracked but linked to the bulk operation.

**Standard bulk change structure:**
```json
{
  "bulkOperationId": "bulk_abc123",
  "operationType": "PRODUCT_BULK_UPDATE",
  "totalCount": 150,
  "successCount": 148,
  "failureCount": 2,
  "changes": [
    { "entityId": "prod_001", "changes": { "price": { "old": 999, "new": 1199 } } },
    { "entityId": "prod_002", "changes": { "price": { "old": 1499, "new": 1699 } } }
  ],
  "failures": [
    { "entityId": "prod_003", "error": "Product not found" },
    { "entityId": "prod_004", "error": "Price below minimum" }
  ]
}
```

**Rules:**
- Each individual change within a bulk operation gets its own audit record.
- All records reference the same `bulkOperationId`.
- Failed changes are also logged with the failure reason.
- Bulk operations are searchable as a group.

### 4.5 Configuration Change Tracking

**What:** All platform configuration changes are tracked with previous and new values.

**Why:** Configuration changes (shipping rates, tax rules, payment settings) have broad impact and require strict audit trails.

**Implementation:**
- Configuration snapshots are taken before and after changes.
- Each configuration change records: who changed it, when, what changed, and the reason.
- Critical configuration changes (payment, tax, shipping) require approval workflow.
- Configuration changes are versioned for rollback capability.

### 4.6 Status Change Tracking

**What:** Every status transition is recorded with the previous status, new status, timestamp, and actor.

**Status transition structure:**
```json
{
  "entityType": "Order",
  "entityId": "ord_abc123",
  "field": "status",
  "oldValue": "processing",
  "newValue": "shipped",
  "actor": { "id": "usr_456", "name": "Rahul", "role": "shop_owner" },
  "timestamp": "2026-08-03T14:30:00Z",
  "reason": "Package shipped via Delhivery",
  "metadata": { "carrier": "Delhivery", "trackingNumber": "DLV123456" }
}
```

### 4.7 Ownership Change Tracking

**What:** When ownership or responsibility transfers between entities, both the old and new owners are recorded.

**Examples:**
- Shop ownership transfer: old owner → new owner.
- Order assignment: unassigned → assigned to team member.
- Ticket assignment: assigned to agent A → reassigned to agent B.
- Product ownership: created by admin → assigned to shop owner.

---

## 5. Log Content Standards

### 5.1 Audit Record Schema

**What:** The minimum required fields for every audit record.

**Standard audit record structure:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID v4 | Yes | Permanent, unique audit identifier |
| `timestamp` | ISO 8601 | Yes | Exact time of the event (UTC) |
| `eventType` | String | Yes | Event taxonomy ID (e.g., `ORDER_CREATED`) |
| `category` | Enum | Yes | Authentication, Data, Financial, System, Security |
| `module` | String | Yes | Business module (e.g., `order`, `payment`, `product`) |
| `action` | Enum | Yes | create, read, update, delete, status_change, export, etc. |
| `severity` | Enum | Yes | info, warning, critical, emergency |
| `entityType` | String | Yes | Entity type (e.g., `Order`, `Product`, `User`) |
| `entityId` | String | Yes | Entity identifier |
| `actor` | Object | Yes | Who performed the action |
| `actor.id` | String | Yes | User ID (null for system events) |
| `actor.name` | String | Yes | Display name |
| `actor.role` | String | Yes | Role at time of action |
| `actor.email` | String | Yes | Email (for system admin lookup) |
| `previousState` | JSON | No | State before the action |
| `newState` | JSON | No | State after the action |
| `changes` | JSON | No | Field-level diff |
| `metadata` | JSON | No | Additional context |
| `ip` | String | No | Client IP address (readiness field) |
| `userAgent` | String | No | Client device info (readiness field) |
| `sessionId` | String | No | Session identifier (readiness field) |
| `requestId` | String | No | API request correlation ID (readiness field) |
| `correlationId` | String | No | Cross-service correlation ID |
| `complianceFlag` | Boolean | Yes | Whether this event has compliance requirements |
| `retentionClass` | Enum | Yes | standard, extended, permanent |

### 5.2 Audit ID Standard

**What:** Every audit record receives a permanent, globally unique identifier.

**Format:** `aud_{timestamp}_{random}` where:
- `aud_` is the prefix (audit namespace).
- `timestamp` is a base-36 encoded millisecond timestamp.
- `random` is a cryptographically random string.

**Example:** `aud_m5x2k8p_7f3a9b2c1d`

**Rules:**
- Audit IDs are generated at write time, not at event emission time.
- Audit IDs are never reused, even if the original record is archived.
- Audit IDs are the primary key for all audit tables.
- Audit IDs are used in cross-references between audit records.
- Audit IDs are immutable and never change.

### 5.3 IP Address Readiness

**What:** The audit schema supports IP address capture for forensic and compliance purposes.

**Why:** IP addresses are required for:
- Security investigations (identifying attack sources).
- Fraud detection (geo-location analysis).
- Compliance (regulatory access logging).

**Implementation:**
- IP addresses are captured from the request context.
- IPv4 and IPv6 are both supported (stored as VARCHAR(45)).
- IP addresses are stored in the audit record, not in business records.
- IP addresses are subject to data retention policies.
- IP addresses are never logged for read-only operations (privacy).

### 5.4 Device Readiness

**What:** The audit schema supports device information capture.

**Device information captured:**
- User-Agent string (raw).
- Parsed device type (mobile/tablet/desktop).
- Browser/OS information (parsed from User-Agent).
- Device fingerprint hash (for fraud detection, readiness only).

### 5.5 Session Readiness

**What:** The audit schema supports session correlation.

**Why:** Linking audit events to sessions enables:
- Reconstructing a user's complete session activity.
- Detecting session hijacking (unusual activity patterns).
- Correlating events across multiple API calls.

### 5.6 Request ID Readiness

**What:** The audit schema supports API request correlation.

**Why:** A single user action may trigger multiple API calls (frontend → API → service → database). Request IDs correlate all events from a single user action.

**Implementation:**
- A unique request ID is generated at the API gateway.
- The request ID is passed through all service layers.
- All audit events from the same request share the same request ID.
- Request IDs enable distributed tracing.

---

## 6. Search Architecture

### 6.1 Global Audit Search

**What:** A unified search interface across all audit events, regardless of module or entity type.

**Why:** Security teams, compliance officers, and administrators need to search across the entire audit trail without knowing which module to look in.

**Search capabilities:**
- Full-text search across event summaries and metadata.
- Filter by event type, category, module, action, severity.
- Filter by actor (user, role).
- Filter by entity (type, ID).
- Filter by date range.
- Filter by IP address.
- Sort by relevance, timestamp, severity.
- Pagination with configurable page size.

**Search API contract:**
```
GET /api/audit/search
  ?q=suspicious+login
  &category=authentication,security
  &severity=warning,critical
  &startDate=2026-07-01
  &endDate=2026-08-03
  &actor=usr_123
  &entityType=User
  &ip=192.168.1.100
  &page=1
  &limit=50
  &sort=severity:desc,timestamp:desc
```

### 6.2 Entity Search

**What:** Search all audit events for a specific entity.

**Use cases:**
- "Show me everything that happened to order ord_abc123."
- "Show me all changes to product prod_xyz789."
- "Show me all actions taken on customer usr_456."

### 6.3 User Search

**What:** Search all audit events performed by a specific user.

**Use cases:**
- "Show me everything user rahul@shop.com did today."
- "Show me all admin actions in the last week."
- "Show me all actions by users with the shop_owner role."

### 6.4 Date Filters

**What:** Standardized date range filtering for audit queries.

**Filter options:**
- `startDate` / `endDate` — exact date range.
- `last24h` / `last7d` / `last30d` / `last90d` — relative ranges.
- `today` / `thisWeek` / `thisMonth` — convenience filters.

**Rules:**
- All dates are in UTC.
- Date filters are inclusive (both start and end dates).
- Default range is last 30 days if not specified.

### 6.5 Module Filters

**What:** Filter audit events by the business module that generated them.

**Available modules:**
`auth`, `user`, `product`, `category`, `collection`, `cms`, `homepage`, `order`, `payment`, `finance`, `shipping`, `inventory`, `return`, `refund`, `notification`, `storage`, `document`, `report`, `settings`, `system`

### 6.6 Action Filters

**What:** Filter audit events by the type of action performed.

**Available actions:**
`create`, `read`, `update`, `delete`, `status_change`, `export`, `import`, `bulk_update`, `approve`, `reject`, `escalate`, `login`, `logout`, `verify`

### 6.7 Severity Filters

**What:** Filter audit events by severity level.

**Severity levels:**
- `info` — Normal business events.
- `warning` — Unusual but non-critical events.
- `critical` — Significant security, financial, or integrity events.
- `emergency` — Immediate attention required (system compromise, data breach).

### 6.8 Saved Searches

**What:** Users can save frequently used search queries for quick access.

**Saved search structure:**
```json
{
  "id": "search_abc123",
  "name": "Failed logins last 24h",
  "userId": "usr_456",
  "query": {
    "category": ["authentication"],
    "eventType": ["AUTH_LOGIN_FAILED"],
    "last24h": true,
    "severity": ["warning", "critical"]
  },
  "createdAt": "2026-08-01T10:00:00Z",
  "lastUsed": "2026-08-03T08:30:00Z"
}
```

---

## 7. Reporting Architecture

### 7.1 Audit Reports

**What:** Pre-built reports that provide insights into platform activity, security, and compliance.

**Report types:**

| Report | Description | Audience | Frequency |
|--------|-------------|----------|-----------|
| **Daily Activity Summary** | Count of events by module, action, severity | Admin | Daily |
| **Security Event Report** | All security-related events (failed logins, permission changes, etc.) | Admin, Security | Daily |
| **User Activity Report** | Activity summary per user | Admin, Shop Owner | On-demand |
| **Configuration Change Report** | All configuration changes with before/after values | Admin | Weekly |
| **Compliance Audit Report** | All events flagged for compliance | Compliance Officer | Monthly |
| **Financial Audit Report** | All payment, refund, settlement events | Finance, Admin | Monthly |
| **Data Access Report** | Who accessed what data and when | Privacy Officer | On-demand |
| **Export Audit Report** | All data exports with user and scope | Admin | Weekly |

### 7.2 User Activity Reports

**What:** Detailed reports of individual user activity.

**Report contents:**
- Total actions by time period.
- Breakdown by module and action type.
- Login/logout patterns.
- Session duration analysis.
- Device and location analysis.
- Anomaly indicators (unusual hours, unusual volume).

### 7.3 Security Reports

**What:** Reports focused on security events and threat detection.

**Report contents:**
- Failed login attempts by IP, user, time.
- Permission escalation events.
- Unusual access patterns.
- Session anomalies.
- Rate limit violations.
- Suspicious bulk operations.

### 7.4 Configuration Reports

**What:** Reports of all configuration changes over time.

**Report contents:**
- Timeline of all configuration changes.
- Before/after values for each change.
- Who made each change.
- Approval status for critical changes.
- Configuration version history.

### 7.5 Compliance Reports

**What:** Reports designed for regulatory compliance and audit.

**Report contents:**
- All events with `complianceFlag: true`.
- Retention policy compliance status.
- Data access logs for sensitive data.
- Financial transaction audit trail.
- User consent and preference changes.

### 7.6 Export Readiness

**What:** All reports support export in multiple formats.

**Export formats:**
- CSV (for spreadsheet analysis).
- JSON (for programmatic consumption).
- PDF (for formal documentation).
- Excel (for business users).

**Export rules:**
- All exports are audit-logged (who exported what, when).
- Large exports are paginated and delivered asynchronously.
- Exports include a header row and data dictionary.
- Sensitive fields are redacted based on user permissions.

---

## 8. Retention Architecture

### 8.1 Permanent Records

**What:** Records that must never be deleted or archived — they remain in the primary database permanently.

**Permanent record categories:**
- Financial transaction records (orders, payments, refunds, settlements).
- Tax records (GST calculations, returns, filings).
- User consent records (terms acceptance, privacy consent).
- Security events (breach notifications, incident records).
- Ownership transfer records (shop ownership changes).

### 8.2 Archive Strategy

**What:** A tiered storage strategy that moves older records to cheaper storage while maintaining accessibility.

**Archive tiers:**

| Tier | Age | Storage | Access Time | Cost |
|------|-----|---------|-------------|------|
| **Hot** | 0–90 days | Primary PostgreSQL | < 100ms | High |
| **Warm** | 90 days–2 years | PostgreSQL (compressed) | < 500ms | Medium |
| **Cold** | 2–7 years | Archive table (compressed) | < 5 seconds | Low |
| **Permanent** | 7+ years | Cold storage (S3-compatible) | < 30 seconds | Minimal |

**Archive rules:**
- Archive moves are batched nightly.
- Archived records retain full search capability (with increased latency).
- Archived records retain full integrity (checksums verified on archive and retrieval).
- Archive operations are audit-logged.

### 8.3 Retention Policies

**What:** Formal policies defining how long different types of audit records are retained.

| Record Type | Minimum Retention | Archive After | Permanent |
|-------------|-------------------|---------------|-----------|
| Financial transactions | 7 years | 2 years | After 7 years |
| Tax records | 7 years | 2 years | After 7 years |
| Authentication events | 3 years | 1 year | No |
| User actions | 2 years | 90 days | No |
| Product changes | 3 years | 1 year | No |
| System events | 1 year | 90 days | No |
| Security events | 5 years | 1 year | After 5 years |
| Consent records | Account lifetime + 7 years | Account deletion + 2 years | After 7 years |
| Configuration changes | 5 years | 1 year | After 5 years |

### 8.4 Compliance Retention

**What:** Retention policies driven by regulatory requirements.

**Indian regulatory retention requirements:**
- **GST Act:** 6 years from the date of filing the return.
- **Income Tax Act:** 6 years from the end of the assessment year.
- **Companies Act:** 8 years from the end of the financial year.
- **RBI Guidelines:** 5 years for payment records.
- **Consumer Protection Act:** 3 years from the date of transaction.
- **IT Act 2000:** Reasonable security practices (implied indefinite retention for security logs).

**Nabome compliance retention:** 7 years minimum for all financial and security records (exceeds all current requirements).

### 8.5 Restoration Readiness

**What:** Archived records can be restored to the primary database when needed for investigations, legal proceedings, or regulatory requests.

**Restoration process:**
- Restoration requests are audit-logged.
- Restored records are verified against checksums.
- Restoration is performed within SLA (24 hours for standard, 4 hours for urgent).
- Restored records are temporarily in hot tier before re-archiving.

---

## 9. Permissions Architecture

### 9.1 Permission Matrix

**What:** A formal matrix defining who can do what with audit data.

| Permission | Customer | Shop Owner | Admin |
|-----------|----------|------------|-------|
| **View own activity** | Yes | Yes | Yes |
| **View shop activity** | No | Yes (own shop) | Yes (all shops) |
| **View all activity** | No | No | Yes |
| **Search audit logs** | No | Yes (own shop) | Yes (all) |
| **Export audit data** | No | Yes (own shop, CSV only) | Yes (all, all formats) |
| **View timelines** | Own only | Own + shop | All |
| **Archive records** | No | No | Yes |
| **Restore records** | No | No | Yes |
| **Compliance access** | No | No | Yes |
| **View security events** | No | No | Yes |
| **View financial audit** | No | Own settlements | All |
| **Configure retention** | No | No | Yes |
| **Manage saved searches** | Own | Own | All |

### 9.2 View Permissions

**What:** Controls who can see audit records.

**Rules:**
- Customers can only view their own activity (orders, logins, profile changes).
- Shop Owners can view all activity scoped to their shop.
- Admins can view all activity across all shops.
- Viewing an audit record does not grant access to the underlying business data.
- View permissions are enforced at the API layer, not the database layer.

### 9.3 Search Permissions

**What:** Controls who can search audit records.

**Rules:**
- Search scope is limited by view permissions.
- Customers cannot search audit logs (only view their own timeline).
- Shop Owners can search within their shop's scope.
- Admins can search across all scopes.
- Search results are filtered by permissions (no data leakage).

### 9.4 Export Permissions

**What:** Controls who can export audit data.

**Rules:**
- All exports are audit-logged.
- Customers cannot export audit data.
- Shop Owners can export their shop's audit data in CSV format.
- Admins can export all audit data in all formats.
- Large exports require admin approval.
- Exported data includes a watermark with the exporter's identity.

### 9.5 Archive / Restore Permissions

**What:** Controls who can archive or restore audit records.

**Rules:**
- Only Admins can archive audit records.
- Only Admins can restore archived records.
- Archive/restore operations are themselves audit-logged.
- Archive operations require justification and approval.
- Restore operations are time-limited (records re-archive after investigation).

### 9.6 Compliance Access

**What:** Special access level for compliance officers and auditors.

**Rules:**
- Compliance access is a separate role (not a permission).
- Compliance officers can view all audit records regardless of shop scope.
- Compliance officers cannot modify, archive, or restore records.
- Compliance access is time-limited (grant expires after audit period).
- All compliance access is audit-logged with elevated detail.

---

## 10. Security Architecture

### 10.1 Immutable Logs

**What:** Audit records are write-once, read-many (WORM). Once written, they cannot be modified.

**Implementation:**
- Database role for audit writes has INSERT and SELECT only (no UPDATE, no DELETE).
- Application audit service has no update or delete methods.
- Database triggers prevent UPDATE and DELETE on audit tables.
- Cloudflare D1 or PostgreSQL row-level security enforces immutability.

### 10.2 Tamper Detection

**What:** Mechanisms to detect if audit records have been tampered with.

**Tamper detection methods:**

| Method | Description | Detection Capability |
|--------|-------------|---------------------|
| **Checksum chain** | Each record includes a SHA-256 hash of the previous record | Detects record insertion, deletion, or reordering |
| **Merkle tree** | Periodic Merkle tree root hashes are computed and stored | Detects any modification to historical records |
| **Write-ahead log** | All writes go to WAL before database | Detects database-level tampering |
| **External checksum** | Periodic checksums stored in separate system | Detects storage-level tampering |
| **Append-only index** | B-tree index that only grows | Detects record deletion |

**Implementation priority:**
1. Checksum chain (immediate implementation).
2. Write-ahead log (Phase 2).
3. Merkle tree (Phase 3).
4. External checksum (Phase 4).

### 10.3 Permission Enforcement

**What:** Audit data access is controlled by the same RBAC system used for business data.

**Rules:**
- Audit permissions are separate from business permissions.
- Audit permissions cannot be granted through business permission escalation.
- Audit permission grants are themselves audit-logged.
- Permission checks happen before data is returned (not after).
- Failed permission checks are audit-logged.

### 10.4 Encryption Readiness

**What:** Audit data supports encryption at rest and in transit.

**Encryption layers:**
- **In transit:** All API calls use HTTPS/TLS 1.3.
- **At rest:** Database-level encryption (PostgreSQL transparent data encryption).
- **Field-level:** Sensitive fields (IP addresses, device fingerprints) can be encrypted at the application level.
- **Archive:** Cold storage uses AES-256 encryption.

### 10.5 Secure Storage

**What:** Audit data is stored in a dedicated, secured storage layer.

**Rules:**
- Audit tables are in a dedicated schema or database.
- Audit database credentials are separate from business database credentials.
- Audit storage is backed up independently.
- Audit storage has its own access control list.
- Audit storage is monitored for unauthorized access.

### 10.6 Audit Integrity

**What:** The overall integrity of the audit system is verified regularly.

**Integrity checks:**
- Daily checksum verification of recent records.
- Weekly full-chain checksum verification.
- Monthly Merkle root verification.
- Quarterly external audit of audit system.
- Integrity check results are audit-logged.

### 10.7 Chain of Custody Readiness

**What:** The ability to prove that audit records have not been tampered with from creation to presentation.

**Chain of custody requirements:**
- Record creation timestamp is server-generated (not client-provided).
- Record is written to WAL before acknowledgement.
- Record is checksummed at creation.
- Record is checksummed at each access.
- Record access is logged.
- Any integrity failure triggers an alert.

---

## 11. Performance Architecture

### 11.1 Large Log Volume

**What:** The audit system must handle high-volume logging without degrading business operations.

**Volume estimates:**
- Small shop: ~1,000 audit events/day.
- Medium shop: ~10,000 audit events/day.
- Large shop: ~100,000 audit events/day.
- Platform-wide: ~1,000,000 audit events/day.

**Design for:** 10x current estimates (10M events/day).

### 11.2 Background Logging

**What:** Audit logging happens in the background, never blocking the business workflow.

**Rules:**
- Audit log writes are fire-and-forget from the business handler's perspective.
- Business handlers do not await audit write completion.
- Audit write failures are logged to a dead-letter queue for retry.
- Audit write failures never return errors to the business caller.

**Implementation:**
- Audit events are emitted to an in-process buffer or Cloudflare Queue.
- A background worker processes the buffer and writes to the database.
- The buffer has a configurable flush interval (default: 1 second).
- The buffer has a configurable max size (default: 1000 events).

### 11.3 Async Processing

**What:** Audit event processing is asynchronous and decoupled from business logic.

**Processing pipeline:**
```
Business Handler → Event Emission (sync, non-blocking) → Buffer → Batch Writer → Database
```

**Batch writer characteristics:**
- Writes events in batches of up to 100 records.
- Flushes every 1 second or when buffer is full.
- Retries failed writes with exponential backoff.
- Dead-letter queue for permanently failed writes.

### 11.4 Search Optimization

**What:** Audit search is fast despite large data volumes.

**Optimization strategies:**
- Composite indexes on frequently queried column combinations.
- Partial indexes for common filter patterns (e.g., severity = 'critical').
- Full-text search index on event summaries.
- Materialized views for common report queries.
- Partitioning by time range for query performance.

**Index strategy:**
```sql
-- Primary lookup indexes
CREATE INDEX idx_audit_user_time ON audit_log (userId, createdAt DESC);
CREATE INDEX idx_audit_entity ON audit_log (entityType, entityId, createdAt DESC);
CREATE INDEX idx_audit_event ON audit_log (eventType, createdAt DESC);
CREATE INDEX idx_audit_time ON audit_log (createdAt DESC);
CREATE INDEX idx_audit_severity ON audit_log (severity, createdAt DESC) WHERE severity IN ('critical', 'emergency');
CREATE INDEX idx_audit_module ON audit_log (module, createdAt DESC);
CREATE INDEX idx_audit_compliance ON audit_log (complianceFlag, createdAt DESC) WHERE complianceFlag = true;
```

### 11.5 Storage Optimization

**What:** Audit data storage is optimized for both write performance and query performance.

**Optimization strategies:**
- JSONB columns for flexible metadata (with GIN indexes for query patterns).
- Column compression for warm/cold storage.
- Table partitioning by month for time-range queries.
- Separate storage for hot, warm, and cold tiers.
- Deduplication of repeated event patterns.

### 11.6 Archive Optimization

**What:** Archive operations are efficient and non-disruptive.

**Optimization strategies:**
- Archive moves are batched and run during low-traffic periods.
- Archive moves use database-level operations (not row-by-row).
- Archive tables are compressed.
- Archive operations are checkpointed for restart on failure.
- Archive operations are audit-logged.

---

## 12. Accessibility Architecture

### 12.1 Responsive Audit Viewer

**What:** The audit log viewer, timeline viewer, and search interface are fully responsive and mobile-first.

**Requirements:**
- Audit log tables are horizontally scrollable on mobile.
- Timeline views stack vertically on mobile.
- Search filters are collapsible on mobile.
- Detail panels use full-screen overlays on mobile.
- Export buttons are accessible on all screen sizes.

### 12.2 Keyboard Navigation

**What:** All audit interfaces are fully keyboard navigable.

**Requirements:**
- Tab order follows visual layout.
- All interactive elements are focusable.
- Keyboard shortcuts for common actions (search, filter, export).
- Focus indicators are visible.
- No keyboard traps.

### 12.3 Screen Readers

**What:** Audit interfaces are compatible with screen readers.

**Requirements:**
- All tables have proper `<th>` headers and `scope` attributes.
- Timeline events are announced with appropriate ARIA labels.
- Severity levels have text labels (not just color).
- Loading states are announced.
- Error messages are associated with form fields.

### 12.4 Readable Timelines

**What:** Timeline views are designed for readability across all devices and abilities.

**Requirements:**
- Sufficient color contrast (WCAG AA minimum).
- Color is not the only indicator of severity.
- Text labels accompany all color coding.
- Timestamps are displayed in relative format ("2 hours ago") with absolute tooltip.
- Actor names are linked to user profiles where appropriate.
- Event summaries are concise and human-readable.

---

## 13. Future Readiness Architecture

### 13.1 AI Security Analysis

**What:** Future integration point for AI-powered security analysis of audit data.

**Architecture:**
- Audit data is structured for ML consumption.
- Event sequences are stored as time-series data.
- Anomaly detection models can consume audit streams.
- AI analysis results are stored as audit events (type: `AI_SECURITY_ANALYSIS`).

**Preparation:**
- Audit events include features useful for ML (event sequences, timing patterns, entity graphs).
- Audit data export supports ML-friendly formats (parquet, tensor-ready).
- Audit streaming API supports real-time ML inference.

### 13.2 Suspicious Activity Detection

**What:** Future automated detection of suspicious activity patterns.

**Patterns to detect:**
- Unusual login times or locations.
- Rapid-fire permission changes.
- Bulk data exports outside business hours.
- Access to sensitive data by low-privilege users.
- Unusual order patterns (potential fraud).

**Architecture:**
- Rule engine for pattern detection.
- Anomaly scoring per event and per user.
- Alert generation for high-anomaly events.
- Integration with notification system for alerts.

### 13.3 Compliance Automation

**What:** Future automated compliance checking and reporting.

**Capabilities:**
- Automated generation of compliance reports.
- Retention policy enforcement (automatic archival/deletion).
- Compliance gap detection (missing audit events).
- Regulatory change monitoring (new requirements trigger schema updates).

### 13.4 SIEM Integration

**What:** Future integration with Security Information and Event Management systems.

**Architecture:**
- Audit events are exportable in CEF (Common Event Format) or LEEF.
- Real-time streaming to external SIEM via webhook or syslog.
- SIEM-compatible alerting thresholds.
- Bi-directional sync (SIEM alerts create audit events).

### 13.5 External Audit APIs

**What:** Future APIs for external auditors to access audit data.

**API design:**
- Read-only API with scoped access.
- API key authentication with IP whitelisting.
- Rate limiting per auditor.
- Audit of all external API access.
- Data masking based on auditor scope.

### 13.6 Regulatory Reporting

**What:** Future automated generation of regulatory reports.

**Report types:**
- GST compliance reports.
- Income tax audit trails.
- RBI payment compliance reports.
- Consumer protection compliance reports.
- Data protection compliance reports.

### 13.7 Risk Analysis

**What:** Future risk scoring based on audit data.

**Risk dimensions:**
- User risk score (based on activity patterns).
- Shop risk score (based on transaction patterns).
- System risk score (based on security events).
- Compliance risk score (based on audit completeness).

### 13.8 Security Dashboards

**What:** Future real-time security dashboards.

**Dashboard components:**
- Real-time event feed.
- Threat level indicator.
- Geographic access map.
- Anomaly timeline.
- Top security events.
- User activity heatmap.

---

## 14. Integration Contract

### 14.1 Module Integration Standard

**What:** Every business module must integrate with the audit engine using the standard contract.

**Contract:**
```typescript
// Every module must implement this interface
interface AuditEmitter {
  // Emit an audit event (non-blocking, fire-and-forget)
  emit(event: AuditEvent): void;
}

// Audit event structure
interface AuditEvent {
  eventType: string;          // From event taxonomy
  module: string;             // Module name
  action: string;             // Action type
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  entityType: string;         // Entity type
  entityId: string;           // Entity ID
  actor: ActorContext;        // Who performed the action
  previousState?: object;     // State before (for changes)
  newState?: object;          // State after (for changes)
  changes?: object;           // Field-level diff
  metadata?: object;          // Additional context
  complianceFlag: boolean;    // Compliance requirement
  retentionClass: string;     // Retention policy
}

// Actor context
interface ActorContext {
  id: string;
  name: string;
  role: string;
  email: string;
}
```

### 14.2 Service Layer Contract

**What:** The audit service exposes a simple, stable API.

**API methods:**
```typescript
interface AuditService {
  // Log an audit event (async, non-blocking)
  log(event: AuditEvent): Promise<void>;

  // Query audit events (with filters)
  query(filter: AuditFilter): Promise<AuditQueryResult>;

  // Get timeline for an entity
  getTimeline(entityType: string, entityId: string, options?: TimelineOptions): Promise<Timeline>;

  // Get user activity timeline
  getUserTimeline(userId: string, options?: TimelineOptions): Promise<Timeline>;

  // Search audit events
  search(query: string, filters?: AuditFilter): Promise<AuditSearchResult>;

  // Generate audit report
  generateReport(type: string, options?: ReportOptions): Promise<Report>;
}
```

### 14.3 Error Handling Contract

**What:** Audit logging failures never break business workflows.

**Error handling rules:**
- Audit write failures are caught and logged to dead-letter queue.
- Business handlers do not handle audit errors.
- Audit service retries failed writes with exponential backoff.
- After max retries, events are moved to dead-letter queue for manual inspection.
- Dead-letter queue is monitored and alerted.

### 14.4 Data Isolation Contract

**What:** Audit data is isolated from business data.

**Isolation rules:**
- Audit tables are in a dedicated schema (`audit`).
- Audit database credentials are separate.
- Audit queries do not join with business tables.
- Business queries do not join with audit tables.
- Audit data has its own backup and recovery process.

---

## 15. Mandatory Rules for AI Agents

These rules are **absolute**. No AI agent may violate them. No exception.

### 15.1 Audit Immutability Rules

| Rule | Description | Violation Consequence |
|------|-------------|----------------------|
| **Rule 1** | Audit records must never be physically deleted | Compliance violation, legal liability |
| **Rule 2** | Audit records must never be editable | Integrity violation, evidence inadmissibility |
| **Rule 3** | Audit records must never be soft-deleted | Contradicts immutability principle |
| **Rule 4** | No `updatedAt` column on audit tables | Implies mutability |
| **Rule 5** | No UPDATE or DELETE permissions on audit tables | Database-level immutability enforcement |

### 15.2 Audit Coverage Rules

| Rule | Description | Violation Consequence |
|------|-------------|----------------------|
| **Rule 6** | Every important business action must generate an audit event | Incomplete audit trail |
| **Rule 7** | Every audit event must have a permanent Audit ID | Cannot reference or trace events |
| **Rule 8** | Every audit event must capture actor context | Cannot determine who performed action |
| **Rule 9** | Every change event must capture previous and new values | Cannot reconstruct history |
| **Rule 10** | Financial events must always have `complianceFlag: true` | Compliance violation |

### 15.3 Audit Independence Rules

| Rule | Description | Violation Consequence |
|------|-------------|----------------------|
| **Rule 11** | Audit Engine must remain independent from business modules | Coupling, maintenance nightmare |
| **Rule 12** | Business modules must not import audit implementation details | Circular dependency |
| **Rule 13** | Audit schema changes must not require business module changes | Breaking change cascade |
| **Rule 14** | Audit service must have its own database credentials | Security isolation |

### 15.4 Audit Performance Rules

| Rule | Description | Violation Consequence |
|------|-------------|----------------------|
| **Rule 15** | Logging failures must never break business workflows | System downtime |
| **Rule 16** | Audit writes must never block business handlers | Performance degradation |
| **Rule 17** | Audit logging must be asynchronous and non-blocking | Scalability bottleneck |
| **Rule 18** | Audit queries must be paginated | Memory exhaustion |

### 15.5 Audit Security Rules

| Rule | Description | Violation Consequence |
|------|-------------|----------------------|
| **Rule 19** | Never log passwords, tokens, API keys, or secrets | Security breach |
| **Rule 20** | Sensitive fields must be redacted in audit records | Privacy violation |
| **Rule 21** | Audit access must be permission-controlled | Unauthorized access |
| **Rule 22** | All audit access must be audit-logged | Accountability gap |

### 15.6 Implementation Checklist

Before any AI agent implements audit functionality, verify:

- [ ] Event type exists in the official taxonomy (Section 2).
- [ ] All required fields from Section 5.1 are populated.
- [ ] Previous and new values are captured for change events.
- [ ] Actor context is populated (not null for user-initiated events).
- [ ] `complianceFlag` is set correctly.
- [ ] `retentionClass` is set correctly.
- [ ] Audit write is non-blocking (fire-and-forget).
- [ ] No secrets or sensitive data are included.
- [ ] Event is emitted after the business operation succeeds.
- [ ] Event is emitted even if the business operation fails (for failure tracking).

---

## Appendix A: Event Taxonomy Quick Reference

| Category | Module | Event Count |
|----------|--------|-------------|
| Authentication | auth | 21 events |
| User Actions | user | 11 events |
| Permissions | permission | 12 events |
| Products | product | 14 events |
| Categories | category | 6 events |
| Collections | collection | 7 events |
| CMS | cms | 11 events |
| Homepage | homepage | 8 events |
| Orders | order | 12 events |
| Payments | payment | 12 events |
| Finance | finance | 13 events |
| Shipping | shipping | 10 events |
| Inventory | inventory | 10 events |
| Returns | return | 7 events |
| Refunds | refund | 7 events |
| Notifications | notification | 9 events |
| Storage | storage | 8 events |
| Documents | document | 7 events |
| Reports | report | 6 events |
| Settings | settings | 12 events |
| System | system | 10 events |
| **Total** | | **202 event types** |

---

## Appendix B: Audit Table Schema (Prisma)

```prisma
model AuditLog {
  id              String    @id
  timestamp       DateTime  @default(now())
  eventType       String    @db.VarChar(100)
  category        String    @db.VarChar(50)
  module          String    @db.VarChar(50)
  action          String    @db.VarChar(50)
  severity        String    @db.VarChar(20)
  entityType      String    @db.VarChar(50)
  entityId        String    @db.VarChar(100)
  actorId         String?
  actorName       String?
  actorRole       String?
  actorEmail      String?
  previousState   Json?
  newState        Json?
  changes         Json?
  metadata        Json?
  ip              String?   @db.VarChar(45)
  userAgent       String?
  sessionId       String?
  requestId       String?
  correlationId   String?
  complianceFlag  Boolean   @default(false)
  retentionClass  String    @default("standard") @db.VarChar(20)
  checksum        String    @db.VarChar(64)

  @@index([actorId, timestamp(sort: Desc)])
  @@index([entityType, entityId, timestamp(sort: Desc)])
  @@index([eventType, timestamp(sort: Desc)])
  @@index([timestamp(sort: Desc)])
  @@index([severity, timestamp(sort: Desc)])
  @@index([module, timestamp(sort: Desc)])
  @@index([complianceFlag, timestamp(sort: Desc)])  // where complianceFlag = true
}

model AuditArchive {
  id              String    @id
  originalId      String
  timestamp       DateTime
  eventType       String    @db.VarChar(100)
  category        String    @db.VarChar(50)
  module          String    @db.VarChar(50)
  data            Json
  checksum        String    @db.VarChar(64)
  archivedAt      DateTime  @default(now())

  @@index([originalId])
  @@index([timestamp(sort: Desc)])
  @@index([eventType])
}

model AuditRetentionPolicy {
  id              String    @id @default(uuid())
  eventType       String    @unique @db.VarChar(100)
  retentionYears  Int       @default(7)
  archiveAfterDays Int      @default(365)
  isActive        Boolean   @default(true)
  updatedAt       DateTime  @updatedAt
}
```

---

## Appendix C: Audit Event Emission Pattern

```typescript
// Every business module follows this pattern:

// 1. Define the audit event type
const PRODUCT_PRICE_CHANGED = {
  eventType: 'PRODUCT_PRICE_CHANGED',
  module: 'product',
  action: 'update',
  severity: 'info',
  entityType: 'Product',
  complianceFlag: false,
  retentionClass: 'standard',
};

// 2. Emit after successful business operation
async function updateProductPrice(productId: string, newPrice: number, actor: ActorContext) {
  // Get previous state
  const product = await db.product.findUnique({ where: { id: productId } });
  const previousState = { price: product.price };

  // Perform business operation
  await db.product.update({ where: { id: productId }, data: { price: newPrice } });

  // Emit audit event (non-blocking, fire-and-forget)
  auditEmitter.emit({
    ...PRODUCT_PRICE_CHANGED,
    entityId: productId,
    actor,
    previousState,
    newState: { price: newPrice },
    changes: { price: { old: product.price, new: newPrice } },
    metadata: { productName: product.name },
  });
}
```

---

## Appendix D: Common Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Synchronous audit logging | Blocks business workflow, creates timeout risk | Async, fire-and-forget |
| Logging audit events in try/catch with business error handling | Audit failures affect business logic | Separate error handling for audit |
| Storing audit events in the same table as business data | Performance, maintenance, immutability conflict | Dedicated audit tables |
| Using `createdAt` as both event time and write time | Time skew between event and recording | Separate `eventTimestamp` and `recordedAt` |
| Logging every read operation | Massive volume, low value | Log only sensitive reads |
| Including full entity state in every event | Storage explosion, PII exposure | Include only changed fields and relevant context |
| Hard-coding audit event types in business logic | Tight coupling | Use event taxonomy constants |
| Querying audit logs on every business read | Performance degradation | Batch queries, caching, materialized views |
| Allowing audit record updates for "corrections" | Destroys integrity | Append a correction event instead |
| Deleting old audit records to save space | Destroys compliance evidence | Archive to cold storage |

---

*This document is the official Audit Log, Activity Timeline & Compliance Engine Architecture Standard for every future Nabome AI agent. All AI agents must follow these standards without exception.*
