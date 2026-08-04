# নবME (Nabome) — Storage Management, Archive & Data Lifecycle Engine Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for data lifecycle, archive, backup, restore, retention, and storage health management  
> **Supersedes:** None — extends ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), STORAGE_ENGINE_ARCHITECTURE.md (v1.0), and TECH_STACK.md (v1.0)

---

## Table of Contents

1. [Data Lifecycle Foundation](#1-data-lifecycle-foundation)
2. [Entity Lifecycle Rules](#2-entity-lifecycle-rules)
3. [Archive Engine](#3-archive-engine)
4. [Retention Policy](#4-retention-policy)
5. [Automatic Cleanup](#5-automatic-cleanup)
6. [Backup](#6-backup)
7. [Restore](#7-restore)
8. [Storage Health](#8-storage-health)
9. [Module Integration](#9-module-integration)
10. [Permissions](#10-permissions)
11. [Security](#11-security)
12. [Performance](#12-performance)
13. [Accessibility](#13-accessibility)
14. [Future Readiness](#14-future-readiness)
15. [Hard Rules](#15-hard-rules)
16. [Soft Rules](#16-soft-rules)
17. [Service Architecture](#17-service-architecture)
18. [Database Schema](#18-database-schema)
19. [API Design](#19-api-design)
20. [Appendices](#20-appendices)

---

## 1. Data Lifecycle Foundation

### 1.1 Lifecycle Philosophy

#### What

The foundational principles governing every piece of data from creation to permanent deletion. Every entity, file, record, and cache entry must have a clearly defined lifecycle path.

#### Why

- **Zero accidental loss:** Nothing important should be accidentally deleted
- **Zero unnecessary persistence:** Nothing unnecessary should remain forever
- **Automated governance:** The platform manages its own storage health
- **Business integrity:** Compliance, audit, and financial records are never compromised
- **Cost efficiency:** Storage costs scale with actual business value

#### Where

Applies to every table, every file, every cache entry, every log, and every generated artifact across the entire Nabome platform.

#### Core Philosophy

| Principle | Definition | Application |
|-----------|-----------|-------------|
| **Lifecycle is mandatory** | Every piece of data must have a defined lifecycle path | No entity exists without lifecycle rules |
| **Archive before delete** | Archive must always be preferred over deletion for business records | Hard delete is last resort only |
| **Financial immutability** | Financial, audit, and legal records must never be physically deleted | 7-year minimum retention, archive-only |
| **Relationship safety** | Storage cleanup must never break referential integrity | Orphan detection, cascade rules |
| **Integrity verification** | Every restore operation must verify integrity | Checksum, metadata, relationship checks |
| **Engine independence** | Data Lifecycle Engine is independent from business modules | Provides services consumed by modules |
| **Enterprise scale** | Design for enterprise-scale storage management without redesign | Background processing, incremental scanning |
| **Mobile administration** | Lifecycle management is operable from mobile devices | Responsive admin views, mobile-first |

### 1.2 Data Ownership

#### What

Every piece of data belongs to a clearly defined owner — an entity, module, or process responsible for its lifecycle.

#### Why

- **Accountability:** Clear ownership prevents data neglect
- **Lifecycle control:** Owner controls creation, modification, archival, and deletion
- **Cost attribution:** Storage costs attributable to owning module
- **Cleanup safety:** Owner module approves cleanup operations

#### Ownership Model

| Data Category | Owner Module | Lifecycle Owner | Archive Owner |
|--------------|-------------|-----------------|---------------|
| **User accounts** | Auth | Auth module | Admin |
| **Sessions** | Auth | Auth module | System (auto) |
| **Products** | Products | Products module | Admin |
| **Product images** | Products (via Media) | Products module | Admin |
| **Orders** | Orders | Orders module | Admin |
| **Order documents** | Orders | Orders module | System (compliance) |
| **Payments** | Finance | Finance module | Admin |
| **Finance records** | Finance | Finance module | System (compliance) |
| **CMS content** | CMS | CMS module | Admin |
| **Media files** | CMS (via Storage) | Storage Engine | System |
| **Audit logs** | Auth | System | System (compliance) |
| **Reports** | Analytics | Analytics module | System (auto) |
| **Notifications** | Notifications | Notifications module | System (auto) |
| **Documents** | Documents | Documents module | System (compliance) |
| **Cache entries** | Cache | Cache module | System (auto) |
| **Temp files** | Storage | Storage Engine | System (auto) |

### 1.3 Entity Ownership

#### What

How parent entities control the lifecycle of their child data through ownership and cascade rules.

#### Why

- **Data integrity:** No orphan data ever exists
- **Consistent behavior:** Same cascade rules for all entity types
- **Predictability:** Developers know exactly what happens on any lifecycle event
- **Compliance:** Financial data is protected by ownership chains

#### Entity Ownership Matrix

| Parent Entity | Child Entities | On Soft Delete | On Hard Delete | On Archive |
|---------------|---------------|----------------|----------------|------------|
| **User** | Profile, Session, Address, Cart, Wishlist, Avatar | Children hidden | Children archived then deleted | Children archived |
| **User** | Order, Review | Children retained (Restrict) | Never hard delete if children exist | Children retained |
| **Product** | ProductVariant, ProductImage, Media | Children hidden | Children archived then deleted | Children archived |
| **Product** | Review | Children retained (Restrict) | Never hard delete if children exist | Children retained |
| **Category** | Product (via FK) | Products retain, category reference set null | Category reference set null | Category reference set null |
| **Collection** | Product (via FK) | Products retain, collection reference set null | Collection reference set null | Collection reference set null |
| **Brand** | Product (via FK) | Products retain, brand reference set null | Brand reference set null | Brand reference set null |
| **Order** | OrderItem, OrderStatusHistory, Invoice, ShippingLabel | Children retained (compliance) | Never hard delete | Children retained |
| **Cart** | CartItem | Cart items deleted | Cart items deleted | N/A (short-lived) |
| **CmsSlide** | Slide media | Media hidden | Media deleted from provider | Media archived |
| **CmsPage** | Page media | Media hidden | Media deleted from provider | Media archived |
| **Return** | Return label | Label retained (compliance) | Never hard delete | Label retained |

### 1.4 Parent-Child Lifecycle

#### What

The cascade rules that govern how parent entity lifecycle events affect child entities and their associated data.

#### Why

- **Referential integrity:** Child data never outlives its parent's context
- **Cleanup automation:** Deleting a parent automatically manages its children
- **Compliance safety:** Financial children are never accidentally destroyed
- **Reversibility:** Soft delete enables restoration of entire entity trees

#### Cascade Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARENT-CHILD LIFECYCLE FLOW                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  1. PARENT SOFT-DELETED (isActive = false)                │   │
│  │     → Parent hidden from public queries                   │   │
│  │     → Children hidden (via parent.isActive filter)        │   │
│  │     → Files retained in storage                           │   │
│  │     → Media records unchanged                             │   │
│  │     → Reversible: set isActive = true to restore          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  2. PARENT RESTORED (isActive = true)                     │   │
│  │     → Parent visible again                                │   │
│  │     → Children visible again                              │   │
│  │     → No file operations needed                           │   │
│  │     → Full state restored                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  3. PARENT ARCHIVED                                        │   │
│  │     → Parent moved to archive table                       │   │
│  │     → Children moved to archive tables                    │   │
│  │     → Financial documents retained in R2                  │   │
│  │     → Media moved to R2 cold storage                      │   │
│  │     → Queryable via archive API                           │   │
│  │     → Restorable via restore API                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  4. PARENT HARD-DELETED (Admin only, after retention)     │   │
│  │     → Archive records checked for compliance              │   │
│  │     → Financial documents NEVER deleted                   │   │
│  │     → Non-financial children permanently removed          │   │
│  │     → Database records deleted                            │   │
│  │     → Audit log entry created                             │   │
│  │     → Irreversible                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.5 Archive Strategy

#### What

The strategy for preserving data that is no longer actively used but must be retained for compliance, audit, or business purposes.

#### Why

- **Compliance:** Legal and regulatory requirements mandate data retention
- **Performance:** Archived data removed from active tables improves query speed
- **Cost:** Cold storage is cheaper than active storage
- **Recovery:** Archived data can be restored if needed
- **Audit:** Historical data available for investigation

#### Archive Classification

| Classification | Description | Retention | Storage Tier | Access Pattern |
|---------------|-------------|-----------|--------------|----------------|
| **Active** | Currently in use, in primary tables | Indefinite | PostgreSQL + CDN | Every request |
| **Warm Archive** | Recently inactive, in archive tables | 1-7 years | PostgreSQL archive tables | Occasional queries |
| **Cold Archive** | Long-term compliance, in R2 | 7+ years | R2 Glacier-class | Rare, manual access |
| **Permanent** | Never deleted, financial/audit | Indefinite | R2 + PostgreSQL | Audit only |

### 1.6 Retention Strategy

#### What

How long each type of data is retained before archival or deletion, based on business, legal, and compliance requirements.

#### Why

- **Legal compliance:** Indian tax laws require 7-year financial record retention
- **Storage cost management:** Old data in cold storage costs less
- **Performance:** Smaller active tables mean faster queries
- **Data freshness:** Removing stale data prevents confusion

#### Retention Summary

| Data Type | Active Retention | Archive Retention | Total Lifecycle | Trigger |
|-----------|-----------------|-------------------|-----------------|---------|
| **Financial records** | Indefinite | 7 years after creation | Indefinite | Compliance |
| **Audit logs** | 1 year | 6 years after archival | 7 years | Compliance |
| **Orders** | Indefinite (active) | 7 years after completion | Indefinite | Tax compliance |
| **User accounts** | While active | 3 years after deletion | Indefinite | GDPR/privacy |
| **Sessions** | 30 days | None (delete) | 30 days | Security |
| **Carts** | 90 days | None (delete) | 90 days | Cleanup |
| **Media (product)** | While product active | Duration of product | Product lifecycle | Business |
| **Media (CMS)** | While page active | Duration of page | Page lifecycle | Business |
| **Exports** | 30 days | None (delete) | 30 days | Cost |
| **Temp files** | 24 hours | None (delete) | 24 hours | Cost |
| **Backups** | 30 days | None (delete) | 30 days | Cost |
| **Cache** | Varies (TTL) | None (auto-evict) | TTL-based | Performance |
| **Notifications** | 90 days | None (delete) | 90 days | Cleanup |
| **Reports** | 30 days | None (delete) | 30 days | Cost |

### 1.7 Restore Strategy

#### What

The process for recovering archived or backed-up data to active state with full integrity verification.

#### Why

- **Accident recovery:** Undo accidental deletions or archives
- **Audit response:** Restore data for compliance investigations
- **Business continuity:** Recover from data corruption or loss
- **Testing:** Verify backup integrity through test restores

#### Restore Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Integrity first** | Every restore verifies data integrity | Checksum, relationship, constraint checks |
| **Relationship awareness** | Restoring a parent restores its children | Cascade restore with dependency ordering |
| **Idempotent** | Restoring already-restored data is safe | Check current state before restoring |
| **Audited** | Every restore operation is logged | Audit log entry for every restore |
| **Time-limited** | Restore window after archive | 30-day restore window for quick archive, unlimited for compliance archive |

### 1.8 Cleanup Philosophy

#### What

The principles governing automatic data cleanup to maintain storage health without compromising business integrity.

#### Why

- **Storage efficiency:** Remove data that serves no purpose
- **Cost control:** Prevent storage bloat from consuming budget
- **Performance:** Smaller datasets mean faster queries
- **Safety:** Automated cleanup with safety nets prevents accidents

#### Cleanup Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Safety first** | Dry-run before any destructive operation | Log what would be deleted, get approval |
| **Never break relationships** | Cleanup must not create orphan data | Check all references before deletion |
| **Financial immunity** | Financial and compliance data never cleaned up | Exclusion lists in cleanup jobs |
| **Rollback capability** | Keep deleted data for recovery window | 7-day soft-delete before permanent removal |
| **Scheduled execution** | Cleanup runs during low-traffic hours | 2am-4am cron jobs |
| **Observable** | All cleanup operations are logged | Structured logging with metrics |

---

## 2. Entity Lifecycle Rules

### 2.1 Products

#### Lifecycle Path

```
Created → Active → Soft-Deleted → [30-day restore window] → Archived → [7-year retention] → Hard-Deleted (admin only)
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Product created with variants, images | PostgreSQL + Cloudinary |
| **Active** | Indefinite | Visible in catalog, orderable | PostgreSQL + Cloudinary CDN |
| **Soft-Deleted** | 30 days | Hidden from catalog, not orderable | PostgreSQL + Cloudinary (hidden) |
| **Archived** | 7 years | Moved to `products_archive` table, images to R2 | PostgreSQL archive + R2 |
| **Hard-Deleted** | Permanent | Only after admin approval + 7-year check | Deleted from all storage |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Soft delete preferred** | `isActive = false` on all product changes | Reversible, safe |
| **Cascade children** | Soft-deleting product soft-deletes all variants and images | Consistent state |
| **Archive with children** | Archiving product archives variants, images, and metadata | Complete archive |
| **Restrict on reviews** | Cannot hard-delete product with existing reviews | Referential integrity |
| **Restrict on orders** | Cannot hard-delete product with existing orders | Business integrity |
| **Image lifecycle** | Product images follow product lifecycle independently | Image replacement doesn't affect product |

### 2.2 Categories

#### Lifecycle Path

```
Created → Active → Soft-Deleted → [30-day restore window] → Archived → [7-year retention] → Hard-Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Category created with name, slug | PostgreSQL |
| **Active** | Indefinite | Visible in navigation, filterable | PostgreSQL |
| **Soft-Deleted** | 30 days | Hidden from navigation, products retain reference | PostgreSQL |
| **Archived** | 7 years | Moved to `categories_archive` | PostgreSQL archive |
| **Hard-Deleted** | Permanent | Products reference set to null via SetNull cascade | Deleted from PostgreSQL |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **SetNull cascade** | Deleting category sets product.categoryId to null | Product can exist without category |
| **No orphan products** | Products always have valid category reference or null | Integrity |
| **Archive separately** | Categories archived independently of products | Flexible lifecycle |
| **Slug preservation** | Archived category slugs retained for URL compatibility | SEO preservation |

### 2.3 Collections

#### Lifecycle Path

```
Created → Active → Soft-Deleted → [30-day restore window] → Archived → [7-year retention] → Hard-Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Collection created with name, slug | PostgreSQL |
| **Active** | Indefinite | Visible in navigation, curated product groups | PostgreSQL |
| **Soft-Deleted** | 30 days | Hidden from navigation, products retain reference | PostgreSQL |
| **Archived** | 7 years | Moved to `collections_archive` | PostgreSQL archive |
| **Hard-Deleted** | Permanent | Products reference set to null | Deleted from PostgreSQL |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **SetNull cascade** | Deleting collection sets product.collectionId to null | Product can exist without collection |
| **Content preservation** | Collection description and metadata archived | Content retention |
| **Media lifecycle** | Collection images follow collection lifecycle | Consistent cleanup |

### 2.4 Orders

#### Lifecycle Path

```
Created → Pending → Confirmed → Processing → Shipped → Delivered → [Archived after 7 years] → Never Hard-Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Minutes | Order created with items, payment initiated | PostgreSQL |
| **Active** | Until delivered | Status updates, tracking, modifications | PostgreSQL + R2 (documents) |
| **Completed** | After delivery | Order finalized, invoice generated | PostgreSQL + R2 (invoice) |
| **Cancelled** | 7 years | Retained for tax compliance | PostgreSQL |
| **Archived** | 7 years after completion | Moved to `orders_archive` | PostgreSQL archive + R2 |
| **Permanent** | Never | Financial records never physically deleted | Archive only |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No hard delete** | Orders are never physically deleted | Financial compliance |
| **Immutable amounts** | Order totals never change after creation | Audit trail |
| **Document retention** | Invoices retained for 7 years minimum | Tax compliance |
| **Status tracking** | Every status change logged in OrderStatusHistory | Audit trail |
| **Archive with items** | Order items archived with parent order | Complete record |
| **Payment reference** | Razorpay references retained permanently | Reconciliation |

### 2.5 Customers (User Accounts)

#### Lifecycle Path

```
Created → Active → Soft-Deleted → [90-day restore window] → Anonymized → [3-year retention] → Hard-Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Account created with profile | PostgreSQL |
| **Active** | Indefinite | Full access, order history | PostgreSQL + Cloudinary (avatar) |
| **Soft-Deleted** | 90 days | Account hidden, login blocked | PostgreSQL |
| **Anonymized** | 3 years | PII removed, order history retained | PostgreSQL (anonymized) |
| **Hard-Deleted** | After 3 years | Anonymized record retained, personal data deleted | PostgreSQL (minimal) |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Restrict on orders** | Cannot hard-delete user with existing orders | Referential integrity |
| **Restrict on reviews** | Cannot hard-delete user with existing reviews | Content integrity |
| **Anonymize, don't delete** | Replace PII with anonymized values | Order history preservation |
| **Session cascade** | Deleting user deletes all sessions | Security |
| **Address cascade** | Deleting user deletes all addresses | Privacy |
| **Avatar cleanup** | Avatar deleted from Cloudinary on account deletion | Storage cleanup |
| **Wishlist cascade** | Deleting user deletes wishlist entries | Cleanup |

### 2.6 Shop Owners (Admin Users)

#### Lifecycle Path

```
Created → Active → Deactivated → [Retained indefinitely] → Hard-Deleted (super-admin only)
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Admin account created | PostgreSQL |
| **Active** | Indefinite | Full admin access | PostgreSQL |
| **Deactivated** | Indefinite | Login blocked, data retained | PostgreSQL |
| **Hard-Deleted** | Super-admin only | Audit log entry required | PostgreSQL |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Audit all changes** | Every admin account change logged | Security |
| **Deactivation preferred** | Deactivate instead of delete | Audit trail |
| **Super-admin required** | Only super-admin can delete admin accounts | Security |
| **Activity logging** | Admin actions retained even after account deletion | Compliance |

### 2.7 Payments

#### Lifecycle Path

```
Created → Pending → Authorized → Captured → [Retained 7 years] → Archived → Never Hard-Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Payment record created | PostgreSQL |
| **Pending** | Minutes | Awaiting processing | PostgreSQL |
| **Authorized** | Minutes | Payment authorized by Razorpay | PostgreSQL |
| **Captured** | Indefinite | Payment completed | PostgreSQL |
| **Failed** | 7 years | Retained for audit | PostgreSQL |
| **Refunded** | 7 years | Refund record retained | PostgreSQL |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No deletion** | Payment records never deleted | Financial compliance |
| **Immutable** | Payment amounts never changed after creation | Audit trail |
| **Razorpay reference** | All Razorpay IDs retained permanently | Reconciliation |
| **Refund linkage** | Refund always linked to original payment | Traceability |

### 2.8 Finance Records

#### Lifecycle Path

```
Created → Active → [Retained 7 years] → Archived → Never Hard-Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Financial record created | PostgreSQL |
| **Active** | 7 years | Queryable in active database | PostgreSQL |
| **Archived** | Indefinite | Moved to archive, retained in R2 | PostgreSQL archive + R2 |
| **Permanent** | Never deleted | Compliance requirement | Archive storage |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **7-year minimum** | All financial records retained 7 years | Indian tax law |
| **Immutable amounts** | Financial figures never modified | Audit trail |
| **Archive to cold storage** | After 7 years, move to R2 Glacier | Cost optimization |
| **Compliance verification** | Annual compliance check on financial archives | Regulatory requirement |

### 2.9 Returns

#### Lifecycle Path

```
Created → Requested → Approved → Shipped → Received → Refunded → [Retained 7 years] → Archived
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Return request created | PostgreSQL |
| **Active** | Until resolved | Return being processed | PostgreSQL + R2 (label) |
| **Completed** | After refund | Return finalized | PostgreSQL + R2 (documents) |
| **Archived** | 7 years | Compliance retention | PostgreSQL archive + R2 |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Restrict on order** | Cannot delete return with existing refund | Financial integrity |
| **Document retention** | Return labels retained for 3 years | Audit |
| **Refund linkage** | Return always linked to original order | Traceability |
| **Image retention** | Return condition images retained 1 year | Dispute resolution |

### 2.10 Refunds

#### Lifecycle Path

```
Created → Pending → Processed → Completed → [Retained 7 years] → Archived → Never Hard-Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Refund record created | PostgreSQL |
| **Pending** | Days | Refund being processed by Razorpay | PostgreSQL |
| **Completed** | Indefinite | Refund finalized | PostgreSQL |
| **Archived** | 7 years | Compliance retention | PostgreSQL archive |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No deletion** | Refund records never deleted | Financial compliance |
| **Immutable** | Refund amounts never changed | Audit trail |
| **Razorpay reference** | Razorpay refund ID retained permanently | Reconciliation |
| **Order linkage** | Refund always linked to original order | Traceability |

### 2.11 Documents (Generated PDFs)

#### Lifecycle Path

```
Generated → Active → [Retention period] → Archived → [Compliance period] → Deleted
```

| Document Type | Active Retention | Archive Retention | Total | Storage |
|--------------|-----------------|-------------------|-------|---------|
| **Invoice** | Indefinite | 7 years | Indefinite | R2 |
| **Shipping label** | Until delivered | 3 years | 3+ years | R2 |
| **Return label** | Until return complete | 3 years | 3+ years | R2 |
| **Receipt** | Indefinite | 7 years | Indefinite | R2 |
| **Data export** | 30 days | None | 30 days | R2 (temp) |
| **Report** | 30 days | None | 30 days | R2 (temp) |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Financial documents never deleted** | Invoices, receipts retained 7+ years | Compliance |
| **Signed URLs only** | All document access via signed URLs | Security |
| **Auto-cleanup exports** | Export files deleted after 30 days | Cost |
| **Version tracking** | Regenerated documents create new versions | Consistency |

### 2.12 Media (Images, Videos)

#### Lifecycle Path

```
Uploaded → Active → [Owner lifecycle] → Archived → [Retention period] → Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Uploaded** | Immediate | File uploaded, Media record created | Cloudinary/R2 + PostgreSQL |
| **Active** | While owner active | Served via CDN | Cloudinary/R2 CDN |
| **Hidden** | Owner soft-deleted | Not publicly visible | Cloudinary/R2 (hidden) |
| **Archived** | Owner archived | Moved to R2 cold storage | R2 |
| **Deleted** | After retention | Permanently removed from all storage | Deleted |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Owner controls lifecycle** | Media lifecycle follows parent entity | Consistent behavior |
| **Orphan detection** | Background job finds media without valid parents | Data integrity |
| **Checksum verification** | Verify file integrity on archive/restore | Data safety |
| **CDN invalidation** | Invalidate CDN cache on deletion | Fresh content |

### 2.13 Notifications

#### Lifecycle Path

```
Created → Delivered → [90 days] → Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Notification created | PostgreSQL |
| **Delivered** | Days | Notification sent/delivered | PostgreSQL |
| **Read** | Days | User has read notification | PostgreSQL |
| **Expired** | 90 days | Notification deleted | PostgreSQL |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-cleanup** | Notifications older than 90 days deleted | Storage cleanup |
| **No archive** | Notifications not archived | Not compliance-relevant |
| **User-scoped** | Notifications tied to user lifecycle | User deletion cascades |

### 2.14 Messages

#### Lifecycle Path

```
Created → Sent → [90 days] → Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Message created | PostgreSQL |
| **Sent** | Immediate | Message delivered | PostgreSQL |
| **Read** | Days | Recipient has read message | PostgreSQL |
| **Expired** | 90 days | Message deleted | PostgreSQL |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-cleanup** | Messages older than 90 days deleted | Storage cleanup |
| **No archive** | Messages not archived | Not compliance-relevant |
| **Thread cascade** | Deleting thread deletes all messages | Cleanup |

### 2.15 Audit Logs

#### Lifecycle Path

```
Created → Active (1 year) → Warm Archive (6 years) → Cold Archive (indefinite) → Never Hard-Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Audit event logged | PostgreSQL |
| **Active** | 1 year | Queryable in primary database | PostgreSQL |
| **Warm Archive** | 6 years | Moved to `audit_log_archive` table | PostgreSQL archive |
| **Cold Archive** | Indefinite | Exported to R2 for compliance | R2 |
| **Permanent** | Never deleted | Compliance requirement | Archive storage |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Append-only** | Audit logs are never modified or deleted | Compliance |
| **7-year minimum** | All audit logs retained 7 years | Legal requirement |
| **Immutable** | Audit log entries cannot be changed | Integrity |
| **Encrypted archive** | Audit log archives encrypted at rest | Security |
| **Tamper detection** | Checksum verification on archive | Integrity |

### 2.16 Reports

#### Lifecycle Path

```
Generated → Active (30 days) → Deleted
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Generated** | On-demand | Report generated and stored | R2 |
| **Active** | 30 days | Downloadable via signed URL | R2 |
| **Expired** | After 30 days | Automatically deleted | R2 |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-cleanup** | Reports deleted after 30 days | Cost |
| **No archive** | Reports not archived | Not compliance-relevant |
| **Signed URL access** | All report access via signed URLs | Security |
| **Async generation** | Reports generated in background | Performance |

### 2.17 CMS Content

#### Lifecycle Path

```
Created → Published → Soft-Deleted → [30-day restore window] → Archived → [Indefinite] → Hard-Deleted (admin only)
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | CMS content created | PostgreSQL |
| **Published** | Indefinite | Content visible on site | PostgreSQL + Cloudinary |
| **Soft-Deleted** | 30 days | Content hidden | PostgreSQL + Cloudinary (hidden) |
| **Archived** | Indefinite | Content moved to archive | PostgreSQL archive |
| **Hard-Deleted** | Admin only | Content permanently removed | Deleted from all storage |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Soft delete preferred** | `isActive = false` for CMS content | Reversible |
| **Media cascade** | Deleting CMS content deletes associated media | Cleanup |
| **Version history** | CMS content changes tracked | Audit |
| **SEO preservation** | Archived slugs retained for redirect | SEO |

### 2.18 Homepage Sections

#### Lifecycle Path

```
Created → Active → Soft-Deleted → [30-day restore window] → Hard-Deleted (admin only)
```

| Stage | Duration | Actions | Storage |
|-------|----------|---------|---------|
| **Created** | Immediate | Homepage section created | PostgreSQL + Cloudinary |
| **Active** | Indefinite | Section visible on homepage | PostgreSQL + Cloudinary CDN |
| **Soft-Deleted** | 30 days | Section hidden | PostgreSQL + Cloudinary (hidden) |
| **Hard-Deleted** | Admin only | Section and media removed | Deleted from all storage |

#### Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Admin-managed** | Homepage sections admin-controlled | Content management |
| **Media cleanup** | Deleting section deletes associated media | Storage cleanup |
| **No archive** | Homepage sections not archived | Not compliance-relevant |

---

## 3. Archive Engine

### 3.1 Archive Policy

#### What

The rules governing when, how, and what data is archived across the platform.

#### Why

- **Performance:** Archived data removed from active tables improves query speed
- **Compliance:** Legal requirements mandate data retention
- **Cost:** Cold storage costs less than active storage
- **Recovery:** Archived data can be restored if needed

#### Archive Policy Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Business records archived, never deleted** | All business records go through archive before any deletion | Compliance |
| **Financial records permanent archive** | Financial data archived and never physically deleted | Legal requirement |
| **Audit logs permanent archive** | Audit data archived indefinitely | Compliance |
| **Generated files auto-archive** | Exports and reports auto-cleaned, not archived | Cost |
| **Cache never archived** | Cache entries evicted, not archived | Performance data |
| **Temp files never archived** | Temporary files deleted, not archived | Ephemeral data |

### 3.2 Archive Workflow

#### What

The step-by-step process for archiving data from active storage to archive storage.

#### Archive Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHIVE WORKFLOW                                │
│                                                                  │
│  1. TRIGGER DETECTED                                              │
│     → Retention policy triggered                                  │
│     → Manual admin archive request                                │
│     → Storage capacity threshold exceeded                         │
│                                                                  │
│  2. PRE-ARCHIVE VALIDATION                                        │
│     → Verify entity is eligible for archive                       │
│     → Check no active dependencies exist                          │
│     → Verify archive storage capacity                             │
│     → Create archive job record                                   │
│                                                                  │
│  3. ARCHIVE EXECUTION                                             │
│     → Export entity data to archive format                        │
│     → Move database records to archive tables                     │
│     → Move files to R2 cold storage                               │
│     → Generate archive manifest (checksums, metadata)             │
│     → Verify archive integrity                                    │
│                                                                  │
│  4. POST-ARCHIVE                                                  │
│     → Update original records (isActive = false, archivedAt)      │
│     → Invalidate CDN caches if needed                             │
│     → Create audit log entry                                      │
│     → Notify admin if manual archive                              │
│     → Clean up temp files                                         │
│                                                                  │
│  5. VERIFICATION                                                  │
│     → Verify archive is complete and intact                       │
│     → Verify original data is properly marked                     │
│     → Verify no orphan data created                               │
│     → Archive job marked complete                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Archive Visibility

#### What

How archived data is accessed and viewed by authorized users.

#### Archive Visibility Rules

| Data Type | Visibility | Access Method | Who Can View |
|-----------|-----------|---------------|--------------|
| **Archived orders** | Hidden from customer order history | Admin archive section | Admin only |
| **Archived products** | Hidden from catalog | Admin archive section | Admin only |
| **Archived CMS content** | Hidden from site | Admin archive section | Admin only |
| **Archived audit logs** | Hidden from regular audit view | Admin audit archive | Admin only |
| **Archived financial records** | Hidden from regular finance view | Admin finance archive | Admin only |
| **Archived media** | Not served via CDN | R2 signed URL only | Admin only |

#### Archive Access Pattern

| Access Level | Who | Method | Use Case |
|-------------|-----|--------|----------|
| **Admin archive browse** | Admin | Admin dashboard archive section | Browse archived records |
| **Admin archive search** | Admin | Search within archive | Find specific archived records |
| **Admin archive restore** | Admin | Restore API endpoint | Restore archived data |
| **Admin archive export** | Admin | Export API endpoint | Export archive for compliance |
| **System archive read** | System | Internal service calls | Compliance verification |

### 3.4 Archive Search

#### What

The ability to search within archived data without restoring it to active storage.

#### Why

- **Compliance investigations:** Find specific archived records quickly
- **Audit support:** Retrieve historical data for audits
- **Business intelligence:** Analyze historical trends from archived data

#### Archive Search Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Full-text search** | PostgreSQL full-text search on archive tables | Find records by content |
| **Date range search** | Filter by archivedAt, original createdAt | Time-based queries |
| **Entity search** | Search by entityType, entityId | Find specific entity archives |
| **Keyword search** | Search by business identifiers (order number, SKU) | Business-friendly search |
| **Pagination** | Paginated results for large archives | Performance |
| **Read-only** | Archive search is always read-only | Safety |

### 3.5 Archive Restore

#### What

The process for restoring archived data back to active storage with full integrity verification.

#### Archive Restore Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHIVE RESTORE FLOW                           │
│                                                                  │
│  1. RESTORE REQUEST                                               │
│     → Admin initiates restore via API                             │
│     → Specifies entity type and ID                                │
│     → System validates restore eligibility                        │
│                                                                  │
│  2. PRE-RESTORE VALIDATION                                        │
│     → Verify archive exists and is intact                         │
│     → Check restore window (30-day for quick, unlimited for      │
│       compliance archives)                                        │
│     → Verify no conflicting active data                           │
│     → Verify storage capacity for restored data                   │
│                                                                  │
│  3. RESTORE EXECUTION                                             │
│     → Restore database records from archive tables                │
│     → Restore files from R2 cold storage to active storage        │
│     → Restore Media records and CDN URLs                          │
│     → Restore parent-child relationships                          │
│     → Verify restored data integrity (checksums)                  │
│                                                                  │
│  4. POST-RESTORE                                                  │
│     → Mark original archive as restored                           │
│     → Update restored records (isActive = true, restoredAt)       │
│     → Rebuild CDN URLs if needed                                  │
│     → Invalidate relevant caches                                  │
│     → Create audit log entry                                      │
│                                                                  │
│  5. INTEGRITY VERIFICATION                                        │
│     → Verify all restored records have valid FK references        │
│     → Verify all restored files are accessible via CDN            │
│     → Verify checksums match                                      │
│     → Verify parent-child relationships intact                    │
│     → Run full integrity check on restored data                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Archive Export

#### What

The ability to export archived data for compliance, legal, or business purposes.

#### Archive Export Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Format options** | CSV, JSON, PDF | Flexibility |
| **Filtered export** | Export specific date ranges, entity types | Targeted compliance |
| **Full export** | Export entire archive for legal discovery | Complete compliance |
| **Signed URL delivery** | Exported files delivered via signed URLs | Security |
| **Export tracking** | All exports logged with user, date, scope | Audit |
| **Auto-cleanup exports** | Exported files deleted after 30 days | Cost |

### 3.7 Archive Permissions

#### What

Who can perform archive-related operations and under what conditions.

#### Archive Permissions Matrix

| Operation | Customer | Shop Owner | Admin | Super Admin |
|-----------|----------|-----------|-------|-------------|
| **View own archived orders** | No | No | Yes | Yes |
| **View any archived record** | No | No | Yes | Yes |
| **Search archives** | No | No | Yes | Yes |
| **Restore from archive** | No | No | Yes | Yes |
| **Export archive** | No | No | Yes | Yes |
| **Permanent delete from archive** | No | No | No | Yes |
| **Bulk archive** | No | No | Yes | Yes |
| **Bulk restore** | No | No | Yes | Yes |

---

## 4. Retention Policy

### 4.1 Business Records

#### What

How long business-related records are retained across the platform.

#### Business Records Retention

| Record Type | Active Retention | Archive Retention | Total Lifecycle | Rationale |
|------------|-----------------|-------------------|-----------------|-----------|
| **Products** | Indefinite | 7 years after deactivation | Indefinite | Business continuity |
| **Categories** | Indefinite | 7 years after deletion | Indefinite | Business continuity |
| **Collections** | Indefinite | 7 years after deletion | Indefinite | Business continuity |
| **Brands** | Indefinite | 7 years after deletion | Indefinite | Business continuity |
| **Reviews** | Indefinite | Indefinite | Indefinite | Content value |
| **Ratings** | Indefinite | Indefinite | Indefinite | Content value |
| **Questions** | Indefinite | 3 years after deletion | Indefinite | Content value |
| **Size guides** | Indefinite | 3 years after deletion | Indefinite | Reference |

### 4.2 Financial Records

#### What

How long financial records are retained for compliance and audit purposes.

#### Financial Records Retention

| Record Type | Active Retention | Archive Retention | Total Lifecycle | Rationale |
|------------|-----------------|-------------------|-----------------|-----------|
| **Orders** | Indefinite | 7 years | Indefinite | Tax compliance |
| **Payments** | Indefinite | 7 years | Indefinite | Financial audit |
| **Refunds** | Indefinite | 7 years | Indefinite | Financial audit |
| **Invoices** | Indefinite | 7 years | Indefinite | Tax compliance |
| **Receipts** | Indefinite | 7 years | Indefinite | Tax compliance |
| **Financial summaries** | Indefinite | 7 years | Indefinite | Business intelligence |
| **Tax records** | Indefinite | 7 years | Indefinite | Legal requirement |
| **Revenue reports** | 30 days | 7 years | 7+ years | Compliance |

### 4.3 Customer Records

#### What

How long customer-related records are retained while respecting privacy requirements.

#### Customer Records Retention

| Record Type | Active Retention | Archive Retention | Total Lifecycle | Rationale |
|------------|-----------------|-------------------|-----------------|-----------|
| **User accounts** | While active | 3 years after deletion | Indefinite | Privacy |
| **Sessions** | 30 days | None | 30 days | Security |
| **Addresses** | While user active | Cascade with user | User lifecycle | Privacy |
| **Wishlists** | While user active | Cascade with user | User lifecycle | User experience |
| **Cart data** | 90 days | None | 90 days | Cleanup |
| **Order history** | Indefinite | 7 years | Indefinite | Business |
| **Search history** | 30 days | None | 30 days | Privacy |
| **Browsing history** | 30 days | None | 30 days | Privacy |

### 4.4 Media

#### What

How long media files are retained based on their ownership and type.

#### Media Retention

| Media Type | Active Retention | Archive Retention | Total Lifecycle | Rationale |
|-----------|-----------------|-------------------|-----------------|-----------|
| **Product images** | While product active | Product lifecycle | Product lifecycle | Business |
| **User avatars** | While user active | Cascade with user | User lifecycle | Privacy |
| **CMS images** | While page active | Page lifecycle | Page lifecycle | Content |
| **Homepage banners** | While active | Admin-managed | Admin-managed | Content |
| **Review images** | While review active | Review lifecycle | Review lifecycle | Content |
| **Brand logos** | While brand active | Brand lifecycle | Brand lifecycle | Business |
| **Category images** | While category active | Category lifecycle | Category lifecycle | Business |

### 4.5 Generated Files

#### What

How long system-generated files are retained.

#### Generated Files Retention

| File Type | Active Retention | Archive Retention | Total Lifecycle | Rationale |
|----------|-----------------|-------------------|-----------------|-----------|
| **Invoices** | Indefinite | 7 years | Indefinite | Compliance |
| **Shipping labels** | Until delivered | 3 years | 3+ years | Compliance |
| **Return labels** | Until return complete | 3 years | 3+ years | Compliance |
| **Data exports** | 30 days | None | 30 days | Cost |
| **Reports** | 30 days | None | 30 days | Cost |
| **Analytics dumps** | 30 days | None | 30 days | Cost |
| **Database backups** | 30 days | None | 30 days | Cost |

### 4.6 Logs

#### What

How long different types of logs are retained.

#### Logs Retention

| Log Type | Active Retention | Archive Retention | Total Lifecycle | Rationale |
|---------|-----------------|-------------------|-----------------|-----------|
| **Audit logs** | 1 year | 6 years | 7 years | Compliance |
| **Application logs** | 30 days | None | 30 days | Debugging |
| **Error logs** | 90 days | None | 90 days | Debugging |
| **Access logs** | 30 days | None | 30 days | Security |
| **Security logs** | 1 year | 6 years | 7 years | Compliance |
| **Performance logs** | 30 days | None | 30 days | Optimization |

### 4.7 Temporary Files

#### What

How long temporary files are retained before automatic cleanup.

#### Temporary Files Retention

| File Type | Retention | Cleanup Schedule | Rationale |
|----------|-----------|-----------------|-----------|
| **Upload staging** | 1 hour | Hourly | Ephemeral |
| **Processing workspace** | 24 hours | Hourly | Ephemeral |
| **Export generation** | 24 hours | Hourly | Ephemeral |
| **Thumbnail generation** | 24 hours | Hourly | Ephemeral |
| **Cache files** | TTL-based | On expiry | Performance |

### 4.8 Cache

#### What

How long cache entries are retained.

#### Cache Retention

| Cache Type | TTL | Invalidation | Rationale |
|-----------|-----|-------------|-----------|
| **CDN image cache** | 1 year | On asset replacement | Performance |
| **CDN document cache** | 1 hour | On regeneration | Freshness |
| **KV media URLs** | 24 hours | On update | Performance |
| **KV session cache** | 30 minutes | On session change | Security |
| **KV search cache** | 15 minutes | On data change | Freshness |
| **Application cache** | 5 minutes | On data change | Freshness |

### 4.9 Session Data

#### What

How long session data is retained.

#### Session Data Retention

| Data Type | Retention | Cleanup | Rationale |
|----------|-----------|---------|-----------|
| **Active sessions** | 30 days | Daily cleanup | Security |
| **Session tokens** | 30 days | Cascade with session | Security |
| **Session metadata** | 30 days | Cascade with session | Security |
| **Remember me tokens** | 90 days | Monthly cleanup | UX |
| **Password reset tokens** | 24 hours | Hourly cleanup | Security |
| **Email verify tokens** | 24 hours | Hourly cleanup | Security |

### 4.10 Scheduled Cleanup

#### What

The schedule for automated cleanup operations across the platform.

#### Cleanup Schedule

| Cleanup Job | Schedule | What It Cleans | Safety Measure |
|------------|----------|---------------|----------------|
| **Temp file cleanup** | Every hour | Files in `temp/` older than 24h | Skip active uploads |
| **Session cleanup** | Daily 2am | Sessions older than 30 days | Log count before delete |
| **Cart cleanup** | Daily 2am | Carts older than 90 days | Log count before delete |
| **Export cleanup** | Daily 2am | Exports older than 30 days | Log count before delete |
| **Report cleanup** | Daily 2am | Reports older than 30 days | Log count before delete |
| **Orphan file detection** | Daily 3am | Files without DB records | Dry-run first |
| **Broken reference detection** | Daily 3am | DB records with invalid FKs | Log only, no auto-fix |
| **Media integrity check** | Weekly Sunday 3am | Verify checksums | Flag for review |
| **Archive verification** | Monthly 1st 3am | Verify archive integrity | Full verification |
| **Backup verification** | Monthly 1st 4am | Verify backup integrity | Test restore |

---

## 5. Automatic Cleanup

### 5.1 Temporary File Cleanup

#### What

Automatic removal of temporary files that are no longer needed.

#### Cleanup Architecture

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| **Temp Scanner** | Scan `temp/` directories for expired files | Cron job, hourly |
| **Age Checker** | Verify file age exceeds retention threshold | File modification time |
| **Active Upload Check** | Skip files with active upload jobs | Check UploadJob status |
| **Delete Executor** | Remove expired temp files from R2 | R2 deleteObject API |
| **Logger** | Log all cleanup operations | Structured logging |

#### Cleanup Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Hourly execution** | Cleanup runs every hour | Prevent storage bloat |
| **24-hour threshold** | Files older than 24 hours cleaned | Processing buffer |
| **Skip active uploads** | Never delete files with active UploadJob | Safety |
| **Max batch size** | 1000 files per cleanup run | Prevent timeout |
| **Dry-run mode** | Log what would be deleted before deleting | Safety |

### 5.2 Cache Cleanup

#### What

Automatic eviction of cache entries that have exceeded their TTL.

#### Cache Cleanup Architecture

| Cache Layer | Cleanup Mechanism | Frequency | Rationale |
|------------|-------------------|-----------|-----------|
| **Cloudflare CDN** | TTL-based auto-eviction | Automatic | CDN-native |
| **Cloudflare KV** | TTL-based auto-eviction | Automatic | KV-native |
| **Application cache** | TTL-based eviction | On access | Application-managed |
| **Database cache** | Manual invalidation | On data change | Application-managed |

### 5.3 Orphan File Detection

#### What

Background scanning to detect files that exist in storage but have no corresponding database record.

#### Detection Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORPHAN DETECTION FLOW                          │
│                                                                  │
│  1. SCAN STORAGE                                                 │
│     → List all files in Cloudinary (by folder prefix)            │
│     → List all files in R2 (by key prefix)                       │
│     → Batch process (1000 files per batch)                       │
│                                                                  │
│  2. CHECK DATABASE                                                │
│     → For each file, check if Media record exists                │
│     → Check if parent entity exists and isActive                 │
│     → Check if file is referenced by any active entity           │
│                                                                  │
│  3. CLASSIFY ORPHANS                                              │
│     → Type A: File exists, no Media record (true orphan)         │
│     → Type B: Media record exists, file missing (broken ref)     │
│     → Type C: Media record exists, parent deleted (cascade)      │
│     → Type D: File exists, parent soft-deleted (expected)        │
│                                                                  │
│  4. TAKE ACTION                                                   │
│     → Type A: Delete file, log warning                           │
│     → Type B: Delete Media record, log warning                   │
│     → Type C: Check retention, archive or delete                 │
│     → Type D: No action (expected state)                         │
│                                                                  │
│  5. REPORT                                                        │
│     → Generate orphan detection report                           │
│     → Send to admin if orphans found                             │
│     → Log all actions taken                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Broken Reference Detection

#### What

Background scanning to detect database records with invalid foreign key references.

#### Detection Process

| Check | Method | Action on Failure |
|-------|--------|-------------------|
| **Media → Parent** | Verify entityType + entityId references valid record | Delete Media record, log warning |
| **OrderItem → Order** | Verify orderId references valid Order | Log warning, flag for review |
| **OrderItem → Variant** | Verify variantId references valid ProductVariant | Log warning, flag for review |
| **CartItem → Cart** | Verify cartId references valid Cart | Delete CartItem, log warning |
| **CartItem → Variant** | Verify variantId references valid ProductVariant | Delete CartItem, log warning |
| **Product → Category** | Verify categoryId references valid Category or is null | Set null, log warning |
| **Product → Brand** | Verify brandId references valid Brand or is null | Set null, log warning |

### 5.5 Duplicate File Detection

#### What

Detection and handling of duplicate files uploaded to storage.

#### Detection Process

| Method | When | Action |
|--------|------|--------|
| **Checksum match** | On upload | Return existing Media record, skip upload |
| **Visual similarity** | On upload (future) | Warn user of potential duplicate |
| **Filename match** | Never | Don't rely on user filenames |

#### Duplicate Handling Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Prefer existing** | If checksum matches, return existing record | Save storage |
| **Reference sharing** | Multiple entities can reference same Media record | Deduplication |
| **No copy on reference** | Don't create duplicate files for same content | Storage efficiency |
| **Upload dedup** | Checksum computed before storage write | Prevent duplicates |

### 5.6 Generated File Cleanup

#### What

Automatic cleanup of files generated by the system (exports, reports, temp processing files).

#### Cleanup Rules

| File Type | Cleanup Trigger | Retention | Safety |
|----------|----------------|-----------|--------|
| **Data exports** | Daily 2am cron | 30 days | Log before delete |
| **Reports** | Daily 2am cron | 30 days | Log before delete |
| **Analytics dumps** | Daily 2am cron | 30 days | Log before delete |
| **Processing temp** | Hourly cron | 24 hours | Skip active processing |
| **Thumbnail temp** | Hourly cron | 24 hours | Skip active generation |

### 5.7 Storage Optimization

#### What

Background processes that optimize storage usage and reduce costs.

#### Optimization Strategies

| Strategy | Description | Implementation |
|----------|-------------|----------------|
| **Image compression** | Re-compress old images to save storage | Cloudinary re-optimization |
| **Format migration** | Convert old formats to modern ones (JPEG → WebP) | Cloudinary format conversion |
| **Duplicate removal** | Remove duplicate files across storage | Checksum-based dedup |
| **Archive consolidation** | Merge small archive files into larger ones | Monthly batch job |
| **Cold storage migration** | Move infrequently accessed files to cold tier | R2 lifecycle rules |

---

## 6. Backup

### 6.1 Backup Strategy

#### What

The comprehensive strategy for backing up all platform data to prevent data loss.

#### Why

- **Disaster recovery:** Protect against data loss from hardware failure, corruption, or deletion
- **Business continuity:** Minimal downtime in case of data loss
- **Compliance:** Regulatory requirements for data preservation
- **Peace of mind:** Knowing data can be recovered

#### Backup Strategy Overview

| Component | Backup Method | Frequency | Retention | Storage |
|-----------|--------------|-----------|-----------|---------|
| **PostgreSQL database** | Neon point-in-time recovery | Continuous (WAL) | 30 days | Neon (off-site) |
| **PostgreSQL full dump** | pg_dump | Daily | 30 days | R2 `backups/database/` |
| **Media files (Cloudinary)** | Cloudinary backup | On deletion | 30 days | Cloudinary archive |
| **Media files (R2)** | R2 versioning | On change | 30 days | R2 version history |
| **Audit logs** | Export to R2 | Monthly | 7 years | R2 `backups/audit-logs/` |
| **Configuration** | Git repository | On change | Indefinite | GitHub |

### 6.2 Incremental Backup

#### What

Backing up only the data that has changed since the last backup.

#### Incremental Backup Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **WAL archiving** | PostgreSQL WAL files archived continuously | Point-in-time recovery |
| **R2 versioning** | R2 object versioning enabled | Track file changes |
| **Cloudinary backup** | Cloudinary maintains original files | No separate backup needed |
| **Daily diffs** | Daily backup captures only changed data | Efficiency |
| **Weekly full** | Weekly full backup for baseline | Recovery baseline |

### 6.3 Full Backup

#### What

Complete backup of all data at regular intervals.

#### Full Backup Schedule

| Backup Type | Schedule | Time | Duration Estimate | Storage Location |
|------------|----------|------|-------------------|-----------------|
| **Database full** | Daily | 2am IST | ~5-30 minutes | R2 `backups/database/` |
| **Database weekly** | Weekly (Sunday) | 1am IST | ~15-60 minutes | R2 `backups/database/` |
| **Audit log export** | Monthly (1st) | 3am IST | ~5-15 minutes | R2 `backups/audit-logs/` |
| **Schema export** | Weekly | 3am IST | ~1 minute | R2 `backups/schema/` |

### 6.4 Backup Verification

#### What

Regular verification that backups are complete, valid, and restorable.

#### Verification Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKUP VERIFICATION FLOW                       │
│                                                                  │
│  1. INTEGRITY CHECK                                               │
│     → Verify backup file is not corrupted                        │
│     → Check file size matches expected                           │
│     → Verify checksum (MD5/SHA-256)                              │
│                                                                  │
│  2. CONTENT CHECK                                                 │
│     → Verify backup contains expected tables                     │
│     → Verify row counts are reasonable                           │
│     → Check for schema completeness                              │
│                                                                  │
│  3. TEST RESTORE (Monthly)                                        │
│     → Restore backup to temporary database                       │     │
│     → Run integrity checks on restored data                      │
│     → Verify application can read restored data                  │
│     → Delete temporary database after verification               │
│                                                                  │
│  4. REPORTING                                                     │
│     → Generate verification report                               │
│     → Alert admin on verification failure                        │
│     → Log all verification results                               │
└─────────────────────────────────────────────────────────────────┘
```

#### Verification Standards

| Standard | Frequency | Implementation | Rationale |
|----------|-----------|---------------|-----------|
| **Checksum verification** | Every backup | SHA-256 hash comparison | Detect corruption |
| **Size verification** | Every backup | Compare with expected size | Detect truncation |
| **Content verification** | Daily | Query backup for table counts | Detect incompleteness |
| **Test restore** | Monthly | Restore to temp DB, run queries | Verify restorability |
| **Cross-region verification** | Monthly | Verify off-site backup exists | Disaster recovery |

### 6.5 Backup Scheduling

#### What

The schedule for all backup operations across the platform.

#### Backup Schedule

| Job | Schedule | Time (IST) | Priority | Dependencies |
|-----|----------|------------|----------|--------------|
| **WAL archiving** | Continuous | Continuous | Critical | Neon config |
| **Database dump** | Daily | 2:00 AM | High | None |
| **Weekly full dump** | Weekly (Sun) | 1:00 AM | High | None |
| **Audit log export** | Monthly (1st) | 3:00 AM | Medium | None |
| **Schema export** | Weekly | 3:00 AM | Medium | None |
| **Backup verification** | Daily | 4:00 AM | High | After backup |
| **Test restore** | Monthly (15th) | 5:00 AM | Medium | After verification |

### 6.6 Backup Retention

#### What

How long backups are retained before automatic cleanup.

#### Backup Retention Policy

| Backup Type | Retention | Cleanup | Rationale |
|------------|-----------|---------|-----------|
| **WAL files** | 30 days | Neon auto-cleanup | Point-in-time recovery |
| **Daily dumps** | 30 days | Auto-cleanup | Cost management |
| **Weekly dumps** | 90 days | Auto-cleanup | Recovery baseline |
| **Monthly dumps** | 1 year | Auto-cleanup | Long-term recovery |
| **Audit exports** | 7 years | Manual | Compliance |
| **Schema exports** | Indefinite | None | Reference |

### 6.7 Disaster Recovery Readiness

#### What

Standards for ensuring the platform can recover from catastrophic data loss.

#### Disaster Recovery Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Recovery Point Objective (RPO)** | < 1 hour | Max data loss tolerance |
| **Recovery Time Objective (RTO)** | < 4 hours | Max downtime tolerance |
| **Backup success rate** | > 99.9% | Percentage of successful backups |
| **Verification success rate** | > 99.9% | Percentage of verified backups |
| **Test restore success rate** | > 99.9% | Percentage of successful test restores |

#### Disaster Recovery Procedures

| Scenario | Procedure | Expected RTO | Expected RPO |
|----------|-----------|-------------|-------------|
| **Accidental data delete** | Point-in-time recovery from WAL | Minutes | < 1 hour |
| **Database corruption** | Restore from daily dump | Hours | < 24 hours |
| **Region failure** | Restore from off-site backup | Hours | < 24 hours |
| **Complete data loss** | Full restore from latest backup | Hours | < 24 hours |
| **Ransomware/attack** | Isolated restore from clean backup | Hours | < 24 hours |

---

## 7. Restore

### 7.1 Archive Restore

#### What

The process for restoring data from archive tables back to active tables.

#### Archive Restore Process

| Step | Action | Validation | Error Handling |
|------|--------|-----------|----------------|
| 1 | Admin initiates restore request | Verify admin permission | Return 403 if unauthorized |
| 2 | System locates archive record | Verify archive exists | Return 404 if not found |
| 3 | System validates restore eligibility | Check restore window | Return 400 if expired |
| 4 | System creates restore job | Verify no conflicts | Return 409 if conflict |
| 5 | System restores database records | Verify FK constraints | Rollback on failure |
| 6 | System restores files | Verify file integrity | Rollback on failure |
| 7 | System verifies restored data | Full integrity check | Alert on failure |
| 8 | System logs restore operation | Audit trail | Never skip |

### 7.2 Backup Restore

#### What

The process for restoring data from backups in case of data loss or corruption.

#### Backup Restore Process

| Step | Action | Validation | Error Handling |
|------|--------|-----------|----------------|
| 1 | Admin identifies data loss | Verify scope of loss | Assess impact |
| 2 | Admin selects backup to restore | Verify backup integrity | Choose alternative backup |
| 3 | System creates restore environment | Isolate from production | Prevent conflicts |
| 4 | System restores database | Verify schema compatibility | Rollback on failure |
| 5 | System restores files | Verify file checksums | Rollback on failure |
| 6 | System runs integrity checks | Full data verification | Alert on failure |
| 7 | System promotes restore to production | Verify readiness | Rollback if issues |
| 8 | System verifies production health | Full system check | Alert on failure |
| 9 | System logs restore operation | Comprehensive audit | Never skip |

### 7.3 File Restore

#### What

The process for restoring individual files from backup storage.

#### File Restore Process

| Step | Action | Validation | Error Handling |
|------|--------|-----------|----------------|
| 1 | System identifies missing/corrupted file | Check Media record | Log if no record |
| 2 | System locates file in backup storage | Verify backup exists | Flag for manual review |
| 3 | System verifies file integrity | Check checksum | Use alternative backup |
| 4 | System restores file to active storage | Verify upload success | Retry up to 3 times |
| 5 | System updates CDN URL | Verify URL accessibility | Invalidate cache |
| 6 | System logs restore operation | Audit trail | Never skip |

### 7.4 Record Restore

#### What

The process for restoring individual database records from archive or backup.

#### Record Restore Process

| Step | Action | Validation | Error Handling |
|------|--------|-----------|----------------|
| 1 | System identifies record to restore | Check archive/backup | Return 404 if not found |
| 2 | System validates restore eligibility | Check constraints | Return 400 if invalid |
| 3 | System creates record in active table | Verify unique constraints | Handle conflicts |
| 4 | System restores child records | Verify FK dependencies | Cascade restore |
| 5 | System verifies restored record | Full integrity check | Alert on failure |
| 6 | System logs restore operation | Audit trail | Never skip |

### 7.5 Relationship Restore

#### What

The process for restoring parent-child relationships when restoring archived or backed-up data.

#### Relationship Restore Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Dependency ordering** | Restore parents before children | FK constraints |
| **Cascade restore** | Restoring parent restores children | Consistent state |
| **Conflict detection** | Check for existing active records | Prevent duplicates |
| **Reference validation** | Verify all FK references after restore | Integrity |
| **Orphan prevention** | Never restore child without parent | Data integrity |

### 7.6 Integrity Verification

#### What

The process for verifying that restored data is complete, consistent, and valid.

#### Integrity Verification Checks

| Check | Method | Failure Action |
|-------|--------|----------------|
| **Record count** | Compare source and destination counts | Alert, investigate |
| **FK constraints** | Verify all FK references are valid | Fix or rollback |
| **Checksum verification** | Compare file checksums | Re-restore file |
| **Schema validation** | Verify data matches expected schema | Fix or rollback |
| **Business rules** | Verify data satisfies business constraints | Flag for review |
| **Relationship integrity** | Verify parent-child relationships intact | Fix or rollback |
| **CDN accessibility** | Verify all URLs return 200 | Regenerate URLs |

---

## 8. Storage Health

### 8.1 Storage Monitoring

#### What

Real-time monitoring of storage usage, performance, and health across all storage providers.

#### Monitoring Dashboard Metrics

| Metric | Source | Alert Threshold | Action |
|--------|--------|-----------------|--------|
| **Total storage used** | R2 + Cloudinary | > 80% capacity | Cleanup or expand |
| **Active storage used** | PostgreSQL | > 100GB | Archive old data |
| **Temp storage used** | R2 `temp/` | > 1GB | Emergency cleanup |
| **Backup storage used** | R2 `backups/` | > 10GB | Review retention |
| **CDN bandwidth** | Cloudflare analytics | > 1TB/month | Optimize images |
| **Upload success rate** | Application logs | < 99% | Investigate failures |
| **File access latency** | CDN metrics | > 200ms p95 | Optimize delivery |

### 8.2 Capacity Monitoring

#### What

Proactive monitoring of storage capacity to prevent storage exhaustion.

#### Capacity Monitoring Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Daily capacity check** | Automated check of all storage providers | Early warning |
| **Weekly growth trend** | Calculate storage growth rate | Predict capacity needs |
| **Monthly forecast** | Project when capacity will be exhausted | Planning |
| **Auto-alert** | Alert admin when capacity exceeds threshold | Prevent outage |
| **Emergency cleanup** | Trigger cleanup when capacity critical | Prevent data loss |

### 8.3 Health Checks

#### What

Regular health checks on all storage systems to ensure they are functioning correctly.

#### Health Check Schedule

| Check | Frequency | What It Checks | Failure Action |
|-------|-----------|---------------|----------------|
| **Cloudinary API** | Every 5 minutes | API availability, response time | Alert admin |
| **R2 API** | Every 5 minutes | API availability, response time | Alert admin |
| **CDN availability** | Every 5 minutes | CDN serving files correctly | Alert admin |
| **Database connectivity** | Every 1 minute | PostgreSQL connection pool | Alert admin |
| **Backup integrity** | Daily | Backup files are valid | Alert admin |
| **Archive integrity** | Monthly | Archive files are intact | Alert admin |

### 8.4 Integrity Verification

#### What

Regular verification that all stored data is intact and has not been corrupted.

#### Integrity Verification Process

| Check | Method | Frequency | Failure Action |
|-------|--------|-----------|----------------|
| **File checksum** | Compare stored checksum with computed | Weekly | Flag for review |
| **Database consistency** | Verify FK constraints, data types | Daily | Fix or alert |
| **Media record accuracy** | Verify Media records match files | Weekly | Fix or alert |
| **Archive integrity** | Verify archive checksums | Monthly | Restore from backup |
| **Backup integrity** | Verify backup checksums | Daily | Re-create backup |

### 8.5 File Consistency

#### What

Ensuring that files in storage are consistent with their database records.

#### File Consistency Checks

| Check | Method | Frequency | Failure Action |
|-------|--------|-----------|----------------|
| **Media ↔ File** | Verify Media record has corresponding file | Daily | Delete orphan record |
| **File ↔ Media** | Verify file has corresponding Media record | Daily | Delete orphan file |
| **URL accessibility** | Verify CDN URLs return 200 | Daily | Regenerate URL |
| **Size consistency** | Verify file size matches Media.filesize | Weekly | Update record |
| **Type consistency** | Verify MIME type matches Media.mimetype | Weekly | Update record |

### 8.6 Metadata Consistency

#### What

Ensuring that metadata in database records accurately reflects the actual stored files.

#### Metadata Consistency Checks

| Check | Method | Frequency | Failure Action |
|-------|--------|-----------|----------------|
| **Dimensions** | Verify width/height match actual image | Weekly | Update record |
| **Filesize** | Verify filesize matches actual file | Weekly | Update record |
| **Mimetype** | Verify mimetype matches actual file type | Weekly | Update record |
| **Checksum** | Verify checksum matches actual file hash | Weekly | Update record |
| **URL** | Verify URL resolves to correct file | Daily | Update record |
| **Alt text** | Verify alt text exists for accessibility | Monthly | Generate default |

---

## 9. Module Integration

### 9.1 Storage Engine Integration

#### What

How the Data Lifecycle Engine integrates with the Storage Engine (STORAGE_ENGINE_ARCHITECTURE.md).

#### Integration Points

| Integration | Direction | Method | Purpose |
|------------|-----------|--------|---------|
| **Media upload** | Storage → Lifecycle | Event hook | Track new media lifecycle |
| **Media deletion** | Lifecycle → Storage | Service call | Clean up storage on lifecycle events |
| **File archive** | Lifecycle → Storage | Service call | Move files to cold storage |
| **File restore** | Lifecycle → Storage | Service call | Move files back to active storage |
| **Integrity check** | Lifecycle → Storage | Service call | Verify file integrity |
| **Orphan detection** | Lifecycle → Storage | Query | Find files without DB records |

#### Service Interface

```typescript
// Lifecycle Engine exposes to Storage Engine
interface LifecycleService {
  onMediaCreated(mediaId: string): Promise<void>;
  onMediaDeleted(mediaId: string): Promise<void>;
  onMediaArchived(mediaId: string): Promise<void>;
  onMediaRestored(mediaId: string): Promise<void>;
  verifyFileIntegrity(mediaId: string): Promise<IntegrityResult>;
  detectOrphans(): Promise<OrphanReport>;
}
```

### 9.2 Audit Engine Integration

#### What

How the Data Lifecycle Engine integrates with the Audit Engine (AUDIT_COMPLIANCE_ENGINE_ARCHITECTURE.md).

#### Integration Points

| Integration | Direction | Method | Purpose |
|------------|-----------|--------|---------|
| **Lifecycle events** | Lifecycle → Audit | Event emission | Log all lifecycle transitions |
| **Archive operations** | Lifecycle → Audit | Event emission | Log archive/restore operations |
| **Cleanup operations** | Lifecycle → Audit | Event emission | Log cleanup operations |
| **Integrity failures** | Lifecycle → Audit | Event emission | Log integrity check failures |
| **Backup operations** | Lifecycle → Audit | Event emission | Log backup/restore operations |

#### Audit Events

| Event | Data Logged | Retention |
|-------|------------|-----------|
| `LIFECYCLE_ARCHIVE` | entityType, entityId, timestamp, reason | 7 years |
| `LIFECYCLE_RESTORE` | entityType, entityId, timestamp, adminId | 7 years |
| `LIFECYCLE_DELETE` | entityType, entityId, timestamp, adminId | 7 years |
| `LIFECYCLE_CLEANUP` | filesCount, spaceFreed, timestamp | 1 year |
| `LIFECYCLE_INTEGRITY_FAIL` | entityType, entityId, checkType, timestamp | 7 years |
| `BACKUP_CREATED` | backupType, size, timestamp | 1 year |
| `BACKUP_RESTORED` | backupType, timestamp, adminId | 7 years |

### 9.3 Finance Engine Integration

#### What

How the Data Lifecycle Engine integrates with the Finance Engine (FINANCE_ENGINE_ARCHITECTURE.md).

#### Integration Points

| Integration | Direction | Method | Purpose |
|------------|-----------|--------|---------|
| **Financial record protection** | Finance → Lifecycle | Policy query | Prevent deletion of financial data |
| **Invoice lifecycle** | Finance → Lifecycle | Event hook | Track invoice retention |
| **Payment record protection** | Finance → Lifecycle | Policy query | Prevent deletion of payment data |
| **Tax record retention** | Finance → Lifecycle | Policy query | Enforce 7-year retention |

#### Finance Protection Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No financial deletion** | Financial records never hard-deleted | Compliance |
| **7-year minimum** | All financial records retained 7 years | Tax law |
| **Archive-only** | Financial records only archived, never deleted | Compliance |
| **Immutable amounts** | Financial figures never modified | Audit trail |

### 9.4 Orders Integration

#### What

How the Data Lifecycle Engine integrates with the Orders module (ORDER_MANAGEMENT_ARCHITECTURE.md).

#### Integration Points

| Integration | Direction | Method | Purpose |
|------------|-----------|--------|---------|
| **Order lifecycle** | Orders → Lifecycle | Event hook | Track order lifecycle transitions |
| **Order document retention** | Orders → Lifecycle | Policy query | Enforce document retention |
| **Order archive** | Orders → Lifecycle | Service call | Archive completed orders |
| **Return lifecycle** | Orders → Lifecycle | Event hook | Track return lifecycle |

#### Order Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Order retention** | Orders retained 7 years minimum | Tax compliance |
| **Document retention** | Invoices retained 7 years minimum | Compliance |
| **Status history** | All status changes logged permanently | Audit trail |
| **Archive with items** | Orders archived with all items and history | Complete record |

### 9.5 CMS Integration

#### What

How the Data Lifecycle Engine integrates with the CMS Engine (CMS_ENGINE_ARCHITECTURE.md).

#### Integration Points

| Integration | Direction | Method | Purpose |
|------------|-----------|--------|---------|
| **Content lifecycle** | CMS → Lifecycle | Event hook | Track CMS content lifecycle |
| **Media cleanup** | Lifecycle → Storage | Service call | Clean up media when content deleted |
| **Content archive** | CMS → Lifecycle | Service call | Archive CMS content |
| **Content restore** | CMS → Lifecycle | Service call | Restore CMS content from archive |

### 9.6 Documents Integration

#### What

How the Data Lifecycle Engine integrates with the Document Engine (DOCUMENT_ENGINE_ARCHITECTURE.md).

#### Integration Points

| Integration | Direction | Method | Purpose |
|------------|-----------|--------|---------|
| **Document generation** | Documents → Lifecycle | Event hook | Track generated documents |
| **Document retention** | Documents → Lifecycle | Policy query | Enforce document retention |
| **Document archive** | Documents → Lifecycle | Service call | Archive old documents |
| **Document cleanup** | Lifecycle → Storage | Service call | Clean up expired documents |

### 9.7 Notifications Integration

#### What

How the Data Lifecycle Engine integrates with the Notification module (NOTIFICATION_COMMUNICATION_MESSAGING_ARCHITECTURE.md).

#### Integration Points

| Integration | Direction | Method | Purpose |
|------------|-----------|--------|---------|
| **Notification cleanup** | Notifications → Lifecycle | Cron job | Clean up old notifications |
| **Notification retention** | Notifications → Lifecycle | Policy query | Enforce 90-day retention |
| **Lifecycle notifications** | Lifecycle → Notifications | Event emission | Notify admin of lifecycle events |

### 9.8 Reports Integration

#### What

How the Data Lifecycle Engine integrates with the Export/Reporting module (EXPORT_REPORTING_BI_ENGINE_ARCHITECTURE.md).

#### Integration Points

| Integration | Direction | Method | Purpose |
|------------|-----------|--------|---------|
| **Report lifecycle** | Reports → Lifecycle | Event hook | Track generated reports |
| **Report cleanup** | Reports → Lifecycle | Cron job | Clean up old reports |
| **Report retention** | Reports → Lifecycle | Policy query | Enforce 30-day retention |

---

## 10. Permissions

### 10.1 Customer Permissions

#### What

What lifecycle operations customers can perform on their own data.

#### Customer Permissions Matrix

| Operation | Customer Permission | Scope | Notes |
|-----------|-------------------|-------|-------|
| **View own orders** | Yes | Own orders only | Active orders |
| **View own archived orders** | No | N/A | Admin only |
| **Restore own data** | No | N/A | Admin only |
| **Delete own account** | Yes (soft) | Own account | Soft delete only |
| **Export own data** | Yes | Own data only | GDPR compliance |
| **View own data retention** | Yes | Own data only | Transparency |

### 10.2 Shop Owner Permissions

#### What

What lifecycle operations shop owners (admins) can perform.

#### Shop Owner Permissions Matrix

| Operation | Shop Owner Permission | Scope | Notes |
|-----------|---------------------|-------|-------|
| **View archived records** | Yes | All records | Read-only |
| **Search archives** | Yes | All archives | Full search |
| **Restore from archive** | Yes | Any record | With audit log |
| **Export archive** | Yes | Any archive | With audit log |
| **Bulk archive** | Yes | Multiple records | With confirmation |
| **Bulk restore** | Yes | Multiple records | With confirmation |
| **Permanent delete** | No | N/A | Super admin only |
| **Backup management** | Yes | View backups | No manual delete |
| **Cleanup management** | Yes | Trigger cleanup | With confirmation |

### 10.3 Admin Permissions

#### What

What lifecycle operations the super admin can perform.

#### Admin Permissions Matrix

| Operation | Super Admin Permission | Scope | Notes |
|-----------|----------------------|-------|-------|
| **All shop owner ops** | Yes | All | Full access |
| **Permanent delete** | Yes | After retention period | With justification |
| **Backup management** | Yes | Full control | Create, restore, delete |
| **Cleanup override** | Yes | Pause/modify cleanup | Emergency use |
| **Retention policy modify** | Yes | System-wide | With audit log |
| **Archive policy modify** | Yes | System-wide | With audit log |
| **Disaster recovery** | Yes | Full system | Emergency use |
| **Integrity override** | Yes | Manual fix | With audit log |

### 10.4 Permission Definitions

#### Archive Permissions

| Permission | Customer | Shop Owner | Admin | Description |
|-----------|----------|-----------|-------|-------------|
| `archive.read` | No | Yes | Yes | View archived records |
| `archive.search` | No | Yes | Yes | Search within archives |
| `archive.export` | No | Yes | Yes | Export archive data |
| `archive.restore` | No | Yes | Yes | Restore from archive |
| `archive.bulk` | No | Yes | Yes | Bulk archive/restore operations |
| `archive.delete` | No | No | Yes | Permanent deletion from archive |

#### Restore Permissions

| Permission | Customer | Shop Owner | Admin | Description |
|-----------|----------|-----------|-------|-------------|
| `restore.record` | No | Yes | Yes | Restore individual records |
| `restore.relationship` | No | Yes | Yes | Restore with relationships |
| `restore.backup` | No | No | Yes | Restore from backup |
| `restore.disaster` | No | No | Yes | Full disaster recovery |

#### Delete Permissions

| Permission | Customer | Shop Owner | Admin | Description |
|-----------|----------|-----------|-------|-------------|
| `delete.soft` | Yes (own) | Yes | Yes | Soft delete (isActive = false) |
| `delete.hard` | No | No | Yes | Permanent deletion |
| `delete.bulk` | No | Yes | Yes | Bulk soft delete |
| `delete.permanent` | No | No | Yes | Permanent bulk deletion |
| `delete.financial` | No | No | No | Never allowed |

#### Export Permissions

| Permission | Customer | Shop Owner | Admin | Description |
|-----------|----------|-----------|-------|-------------|
| `export.own_data` | Yes | Yes | Yes | Export own data (GDPR) |
| `export.archive` | No | Yes | Yes | Export archive data |
| `export.backup` | No | No | Yes | Export backup data |
| `export.bulk` | No | Yes | Yes | Bulk export operations |

#### Backup Permissions

| Permission | Customer | Shop Owner | Admin | Description |
|-----------|----------|-----------|-------|-------------|
| `backup.view` | No | Yes | Yes | View backup status |
| `backup.create` | No | No | Yes | Create manual backup |
| `backup.restore` | No | No | Yes | Restore from backup |
| `backup.delete` | No | No | Yes | Delete old backups |
| `backup.verify` | No | Yes | Yes | Verify backup integrity |

#### Recovery Permissions

| Permission | Customer | Shop Owner | Admin | Description |
|-----------|----------|-----------|-------|-------------|
| `recovery.initiate` | No | No | Yes | Initiate disaster recovery |
| `recovery.monitor` | No | Yes | Yes | Monitor recovery progress |
| `recovery.verify` | No | No | Yes | Verify recovery integrity |
| `recovery.rollback` | No | No | Yes | Rollback failed recovery |

---

## 11. Security

### 11.1 Secure Deletion

#### What

Standards for securely deleting data to prevent recovery of sensitive information.

#### Secure Deletion Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Soft delete first** | All deletions start with `isActive = false` | Reversibility |
| **7-day retention** | Deleted data retained 7 days before permanent removal | Recovery window |
| **No secure wipe needed** | Cloud storage providers handle secure deletion | Provider responsibility |
| **Audit logging** | All deletions logged with user, timestamp, reason | Accountability |
| **Confirmation required** | Hard delete requires admin confirmation | Safety |
| **Batch limits** | Max 100 records per hard delete operation | Prevent accidents |

### 11.2 Secure Backup

#### What

Standards for ensuring backups are stored securely and cannot be tampered with.

#### Secure Backup Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Encryption at rest** | R2 server-side encryption | Data protection |
| **Encryption in transit** | TLS for all backup transfers | Transport security |
| **Access control** | Backup files accessible only by system + admin | Access restriction |
| **Integrity checksums** | SHA-256 checksums for all backups | Tamper detection |
| **Immutable backups** | Backup files cannot be modified after creation | Integrity |
| **Off-site storage** | Backups stored in different region | Disaster recovery |

### 11.3 Restore Authorization

#### What

Standards for authorizing data restore operations.

#### Restore Authorization Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Admin required** | Only admins can initiate restore | Security |
| **Confirmation step** | Restore requires explicit confirmation | Safety |
| **Scope limitation** | Restore scope limited to requested data | Precision |
| **Audit logging** | All restore operations logged | Accountability |
| **Integrity verification** | Restore verified before completion | Data safety |
| **Rollback capability** | Failed restore can be rolled back | Safety |

### 11.4 Archive Integrity

#### What

Standards for ensuring archived data remains intact and untampered.

#### Archive Integrity Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Checksum verification** | SHA-256 checksums on archive creation | Tamper detection |
| **Immutable archives** | Archives cannot be modified after creation | Integrity |
| **Regular verification** | Monthly integrity checks on archives | Early detection |
| **Backup of archives** | Archives backed up to separate location | Redundancy |
| **Access logging** | All archive access logged | Audit trail |

### 11.5 Encryption Readiness

#### What

Standards for encryption of data at rest and in transit.

#### Encryption Standards

| Data Type | At Rest | In Transit | Implementation |
|-----------|---------|-----------|----------------|
| **Database** | Neon encryption | TLS | Provider-managed |
| **R2 files** | R2 server-side encryption | TLS | Provider-managed |
| **CDN** | Provider encryption | TLS | Provider-managed |
| **Backups** | R2 server-side encryption | TLS | Provider-managed |
| **Archives** | R2 server-side encryption | TLS | Provider-managed |
| **Temp files** | R2 server-side encryption | TLS | Provider-managed |

### 11.6 Audit Logging

#### What

Standards for logging all lifecycle operations for security and compliance.

#### Audit Logging Standards

| Operation | Log Level | Data Logged | Retention |
|-----------|-----------|-------------|-----------|
| **Archive** | INFO | entityType, entityId, adminId, timestamp | 7 years |
| **Restore** | INFO | entityType, entityId, adminId, timestamp | 7 years |
| **Hard delete** | WARN | entityType, entityId, adminId, timestamp, reason | 7 years |
| **Backup create** | INFO | backupType, size, timestamp | 1 year |
| **Backup restore** | WARN | backupType, adminId, timestamp | 7 years |
| **Integrity failure** | ERROR | entityType, entityId, checkType, timestamp | 7 years |
| **Cleanup operation** | INFO | filesCount, spaceFreed, timestamp | 1 year |
| **Permission denied** | WARN | operation, userId, timestamp | 1 year |

---

## 12. Performance

### 12.1 Large Storage Volumes

#### What

Standards for maintaining performance when managing large volumes of data and files.

#### Performance Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Pagination** | All list queries paginated (max 100 per page) | Prevent large result sets |
| **Batch processing** | Archive/cleanup operations batched (1000 per batch) | Prevent timeouts |
| **Index optimization** | Indexes on all frequently queried columns | Query speed |
| **Connection pooling** | Hyperdrive for database connection pooling | Connection management |
| **CDN delivery** | All assets served via CDN | Edge performance |
| **Lazy loading** | Load data on demand, not upfront | Reduced initial load |

### 12.2 Background Cleanup

#### What

Standards for running cleanup operations in the background without impacting user experience.

#### Background Cleanup Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Low-traffic hours** | Cleanup runs during 2am-4am IST | Minimal impact |
| **Rate limiting** | Cleanup operations rate-limited | Prevent overload |
| **Batch size limits** | Max 1000 records per batch | Prevent timeouts |
| **Graceful degradation** | Cleanup pauses if system under load | User experience priority |
| **Resource monitoring** | Monitor CPU/memory during cleanup | Prevent overload |
| **Circuit breaker** | Stop cleanup if error rate exceeds threshold | Safety |

### 12.3 Async Processing

#### What

Standards for processing lifecycle operations asynchronously to maintain responsive user experience.

#### Async Processing Standards

| Operation | Processing | Timeout | Retry |
|-----------|-----------|---------|-------|
| **Archive creation** | Background job | 30 minutes | 3 retries |
| **Archive restore** | Background job | 30 minutes | 3 retries |
| **Backup creation** | Background job | 60 minutes | 3 retries |
| **Backup restore** | Background job | 120 minutes | 3 retries |
| **Orphan detection** | Background job | 60 minutes | 1 retry |
| **Integrity check** | Background job | 30 minutes | 1 retry |
| **Cleanup operations** | Background job | 60 minutes | 1 retry |
| **File restore** | Background job | 10 minutes | 3 retries |

### 12.4 Incremental Scanning

#### What

Standards for scanning storage and database efficiently by processing only changed data.

#### Incremental Scanning Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Timestamp-based** | Scan only records modified since last scan | Efficiency |
| **Change tracking** | Use `updatedAt` to track changes | Simple, effective |
| **Batch scanning** | Process 1000 records per scan batch | Prevent overload |
| **Delta detection** | Compare current state with last known state | Efficient detection |
| **Scan scheduling** | Stagger scans to prevent overlap | Resource management |

### 12.5 Efficient Restore

#### What

Standards for restoring data efficiently without prolonged downtime.

#### Efficient Restore Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Parallel restore** | Restore independent entities in parallel | Speed |
| **Priority ordering** | Restore critical data first | Business continuity |
| **Incremental restore** | Restore only what's needed | Efficiency |
| **Verification during restore** | Verify integrity during, not after | Early detection |
| **Rollback capability** | Quick rollback if restore fails | Safety |

---

## 13. Accessibility

### 13.1 Mobile Administration

#### What

Standards for managing lifecycle operations from mobile devices.

#### Mobile Administration Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Responsive admin views** | All admin screens responsive | Mobile access |
| **Touch-friendly controls** | Large tap targets, swipe gestures | Mobile UX |
| **Offline capability** | View cached data offline | Connectivity issues |
| **Push notifications** | Lifecycle alerts via push | Mobile awareness |
| **Simplified workflows** | Streamlined mobile lifecycle operations | Mobile efficiency |

### 13.2 Responsive Archive Views

#### What

Standards for viewing archived data on different screen sizes.

#### Responsive Archive View Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Card/list toggle** | Switch between card and list views | Flexibility |
| **Responsive tables** | Horizontal scroll on mobile | Readability |
| **Filtered views** | Collapsible filters on mobile | Space efficiency |
| **Search prominence** | Search bar prominent on all screens | Discovery |
| **Action buttons** | Floating action buttons on mobile | Easy access |

### 13.3 Keyboard Navigation

#### What

Standards for keyboard navigation of lifecycle management interfaces.

#### Keyboard Navigation Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Tab order** | Logical tab order through all controls | Navigation |
| **Keyboard shortcuts** | Common operations have keyboard shortcuts | Efficiency |
| **Focus indicators** | Visible focus indicators on all controls | Visibility |
| **Skip navigation** | Skip links to main content | Accessibility |
| **ARIA labels** | All interactive elements labeled | Screen reader support |

### 13.4 Readable History

#### What

Standards for making lifecycle history and audit trails readable and understandable.

#### Readable History Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Human-readable timestamps** | "2 hours ago" format | Readability |
| **Plain language events** | "Order archived by Admin" not "LIFECYCLE_ARCHIVE" | Clarity |
| **Color coding** | Color-coded status indicators | Visual clarity |
| **Timeline view** | Chronological timeline of lifecycle events | Understanding |
| **Filterable history** | Filter by event type, date, user | Discovery |

---

## 14. Future Readiness

### 14.1 AI Storage Optimization

#### What

Architecture for using AI to optimize storage usage and lifecycle decisions.

#### AI Storage Optimization Architecture

| Capability | Description | Implementation |
|-----------|-------------|----------------|
| **Smart compression** | AI-driven image compression based on content | ML model for optimal compression |
| **Predictive cleanup** | Predict which files will be needed vs. cleanup-eligible | Usage pattern analysis |
| **Anomaly detection** | Detect unusual storage patterns (sudden growth, access spikes) | Statistical analysis |
| **Smart archiving** | AI-recommended archiving based on access patterns | ML classification |
| **Capacity forecasting** | Predict storage needs based on growth trends | Time-series analysis |

### 14.2 Intelligent Cleanup

#### What

Architecture for intelligent, context-aware cleanup that goes beyond simple age-based rules.

#### Intelligent Cleanup Architecture

| Capability | Description | Implementation |
|-----------|-------------|----------------|
| **Usage-based cleanup** | Clean up files based on access frequency, not just age | Access log analysis |
| **Business-aware cleanup** | Understand business context before cleanup | Business rule engine |
| **Dependency-aware cleanup** | Clean up only when all dependencies are resolved | Dependency graph |
| **Predictive cleanup** | Predict impact of cleanup before executing | Simulation engine |
| **Smart retention** | Adjust retention based on storage pressure | Dynamic policy |

### 14.3 Predictive Storage Growth

#### What

Architecture for predicting future storage needs and proactively managing capacity.

#### Predictive Storage Growth Architecture

| Capability | Description | Implementation |
|-----------|-------------|----------------|
| **Growth modeling** | Model storage growth based on historical data | Time-series analysis |
| **Seasonal patterns** | Account for seasonal business patterns (Diwali, sales) | Pattern recognition |
| **Capacity alerts** | Alert before capacity is exhausted | Threshold-based alerts |
| **Auto-scaling** | Automatically expand storage when needed | Cloud auto-scaling |
| **Cost optimization** | Predict and optimize storage costs | Cost modeling |

### 14.4 Cloud Storage Expansion

#### What

Architecture for expanding to additional cloud storage providers as the platform grows.

#### Cloud Storage Expansion Architecture

| Capability | Description | Implementation |
|-----------|-------------|----------------|
| **Multi-provider** | Support multiple storage providers simultaneously | Provider abstraction layer |
| **Geographic distribution** | Store data closest to users | Multi-region storage |
| **Cost optimization** | Choose cheapest provider for each data type | Cost-based routing |
| **Redundancy** | Store critical data across multiple providers | Multi-provider backup |
| **Migration** | Seamless migration between providers | Background migration |

### 14.5 Multi-region Storage

#### What

Architecture for distributing storage across multiple geographic regions.

#### Multi-region Storage Architecture

| Capability | Description | Implementation |
|-----------|-------------|----------------|
| **Region selection** | Store data in region closest to user | Geographic routing |
| **Data replication** | Replicate critical data across regions | Async replication |
| **Regional failover** | Failover to another region if primary fails | Health-check based |
| **Compliance routing** | Route data based on regulatory requirements | Compliance engine |
| **Cost optimization** | Choose cheapest region for each data type | Cost-based routing |

### 14.6 Cold Storage

#### What

Architecture for migrating infrequently accessed data to cost-effective cold storage.

#### Cold Storage Architecture

| Capability | Description | Implementation |
|-----------|-------------|----------------|
| **Auto-tiering** | Automatically move cold data to cheaper storage | Access pattern analysis |
| **Retrieval on demand** | Retrieve cold data when needed | On-demand retrieval |
| **Cost tracking** | Track cold storage costs separately | Cost attribution |
| **Access policies** | Define which data qualifies for cold storage | Policy engine |
| **Retrieval SLAs** | Define acceptable retrieval times for cold data | SLA management |

### 14.7 Long-term Compliance Storage

#### What

Architecture for meeting long-term regulatory compliance requirements.

#### Long-term Compliance Storage Architecture

| Capability | Description | Implementation |
|-----------|-------------|----------------|
| **WORM storage** | Write-Once-Read-Many for compliance data | Immutable storage |
| **Legal hold** | Ability to place legal holds on data | Hold management |
| **Compliance audit** | Regular compliance audits of storage | Automated auditing |
| **Regulatory reporting** | Generate compliance reports from storage | Report generation |
| **Data sovereignty** | Ensure data stays in required jurisdiction | Geographic controls |

---

## 15. Hard Rules

### 15.1 What

Non-negotiable rules that every lifecycle operation must follow.

### 15.2 Why

- **Security:** No exceptions to security rules
- **Integrity:** Data integrity is non-negotiable
- **Compliance:** Legal requirements must be met
- **Safety:** Prevent catastrophic data loss

### 15.3 Hard Rules List

| Rule | Description | Violation | Consequence |
|------|-------------|-----------|-------------|
| **Every entity has a lifecycle** | No entity exists without lifecycle rules | Data governance breach | Immediate fix required |
| **Archive before delete** | Business records archived, never directly deleted | Compliance violation | Audit finding |
| **Financial records permanent** | Financial data never physically deleted | Legal violation | Regulatory penalty |
| **Cleanup never breaks relationships** | Storage cleanup must not create orphan data | Data integrity breach | Data corruption |
| **Restore always verifies integrity** | Every restore operation checks data integrity | Data safety breach | Corrupted data risk |
| **Lifecycle engine independent** | Lifecycle Engine independent from business modules | Architecture violation | Coupling risk |
| **No financial deletion** | Financial, audit, legal records never hard-deleted | Compliance violation | Legal liability |
| **Backup before major operations** | Backup required before schema migrations | Data safety risk | Potential data loss |
| **Audit all lifecycle operations** | Every archive, restore, delete logged | Compliance violation | Audit finding |
| **Confirmation for destructive ops** | Hard delete requires explicit confirmation | Safety violation | Accidental deletion |
| **Dry-run before cleanup** | Log what would be deleted before deleting | Safety violation | Accidental deletion |
| **Max batch sizes** | Cleanup operations limited to 1000 records per batch | Performance violation | System overload |

---

## 16. Soft Rules

### 16.1 What

Recommended best practices that should be followed unless there's a valid reason not to.

### 16.2 Soft Rules List

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **Auto-format images** | Convert to WebP/AVIF on upload | Always for images |
| **Generate thumbnails** | Multiple sizes for responsive display | Always for images |
| **Lazy loading** | Load images on scroll | For below-fold images |
| **Blur-up placeholders** | Show blur hash while loading | For hero images |
| **Responsive srcSet** | Multiple viewport sizes | For product images |
| **Async document generation** | Don't block request for PDF generation | For document generation |
| **Progress tracking** | Show upload/generation progress | For user-facing operations |
| **Error retry** | Auto-retry failed operations | For transient errors |
| **Metadata extraction** | Read EXIF, dimensions on upload | For all images |
| **Checksum computation** | Compute checksums for dedup | For all uploads |
| **Incremental scanning** | Scan only changed data | For large datasets |
| **Staggered scheduling** | Stagger cleanup jobs to prevent overlap | For resource management |
| **Graceful degradation** | Pause operations under high load | For system stability |
| **Capacity forecasting** | Predict storage needs monthly | For proactive management |
| **Cost monitoring** | Track storage costs by module | For budget management |

---

## 17. Service Architecture

### 17.1 Lifecycle Engine Services

#### What

The service architecture for the Data Lifecycle Engine.

#### Service Locations

| Service | Location | Responsibility |
|---------|----------|----------------|
| **LifecycleService** | `api/_lib/lifecycle/lifecycle.ts` | Orchestrate all lifecycle operations |
| **ArchiveService** | `api/_lib/lifecycle/archive.ts` | Archive and restore operations |
| **RetentionPolicyService** | `api/_lib/lifecycle/retention.ts` | Enforce retention policies |
| **CleanupService** | `api/_lib/lifecycle/cleanup.ts` | Automated cleanup operations |
| **BackupService** | `api/_lib/lifecycle/backup.ts` | Backup creation and management |
| **RestoreService** | `api/_lib/lifecycle/restore.ts` | Restore operations |
| **IntegrityService** | `api/_lib/lifecycle/integrity.ts` | Integrity verification |
| **HealthService** | `api/_lib/lifecycle/health.ts` | Storage health monitoring |

### 17.2 Service Interfaces

#### LifecycleService Interface

```typescript
interface LifecycleService {
  // Lifecycle transitions
  onEntityCreated(entityType: string, entityId: string): Promise<void>;
  onEntityUpdated(entityType: string, entityId: string): Promise<void>;
  onEntitySoftDeleted(entityType: string, entityId: string): Promise<void>;
  onEntityRestored(entityType: string, entityId: string): Promise<void>;
  onEntityArchived(entityType: string, entityId: string): Promise<void>;
  onEntityHardDeleted(entityType: string, entityId: string): Promise<void>;

  // Lifecycle queries
  getEntityLifecycle(entityType: string, entityId: string): Promise<LifecycleState>;
  getLifecycleHistory(entityType: string, entityId: string): Promise<LifecycleEvent[]>;
  getRetentionStatus(entityType: string, entityId: string): Promise<RetentionStatus>;
}
```

#### ArchiveService Interface

```typescript
interface ArchiveService {
  // Archive operations
  archiveEntity(entityType: string, entityId: string, reason: string): Promise<ArchiveResult>;
  archiveEntities(entities: ArchiveRequest[], reason: string): Promise<BatchArchiveResult>;
  restoreEntity(entityType: string, entityId: string): Promise<RestoreResult>;
  restoreEntities(entities: RestoreRequest[]): Promise<BatchRestoreResult>;

  // Archive queries
  getArchive(entityType: string, entityId: string): Promise<ArchiveRecord>;
  searchArchive(query: ArchiveSearchQuery): Promise<ArchiveSearchResult>;
  getArchiveStats(): Promise<ArchiveStats>;
}
```

#### CleanupService Interface

```typescript
interface CleanupService {
  // Cleanup operations
  cleanupTempFiles(): Promise<CleanupResult>;
  cleanupExpiredExports(): Promise<CleanupResult>;
  cleanupExpiredSessions(): Promise<CleanupResult>;
  cleanupExpiredCarts(): Promise<CleanupResult>;
  detectOrphans(): Promise<OrphanReport>;
  detectBrokenReferences(): Promise<BrokenRefReport>;

  // Cleanup management
  getCleanupSchedule(): Promise<CleanupSchedule>;
  triggerCleanup(jobType: string): Promise<CleanupResult>;
  pauseCleanup(jobType: string): Promise<void>;
  resumeCleanup(jobType: string): Promise<void>;
}
```

#### BackupService Interface

```typescript
interface BackupService {
  // Backup operations
  createFullBackup(): Promise<BackupResult>;
  createIncrementalBackup(): Promise<BackupResult>;
  verifyBackup(backupId: string): Promise<VerificationResult>;
  testRestore(backupId: string): Promise<RestoreTestResult>;

  // Backup management
  listBackups(): Promise<Backup[]>;
  getBackupStatus(backupId: string): Promise<BackupStatus>;
  deleteBackup(backupId: string): Promise<void>;
  getBackupSchedule(): Promise<BackupSchedule>;
}
```

### 17.3 Cron Job Schedule

#### What

The schedule for all lifecycle-related cron jobs.

#### Cron Job Schedule

| Job | Schedule | Service | Timeout | Priority |
|-----|----------|---------|---------|----------|
| **Temp file cleanup** | `0 * * * *` (hourly) | CleanupService | 10 minutes | Low |
| **Session cleanup** | `0 2 * * *` (daily 2am) | CleanupService | 30 minutes | Medium |
| **Cart cleanup** | `0 2 * * *` (daily 2am) | CleanupService | 30 minutes | Medium |
| **Export cleanup** | `0 2 * * *` (daily 2am) | CleanupService | 30 minutes | Medium |
| **Orphan detection** | `0 3 * * *` (daily 3am) | IntegrityService | 60 minutes | Medium |
| **Broken ref detection** | `0 3 * * *` (daily 3am) | IntegrityService | 60 minutes | Medium |
| **Database backup** | `0 2 * * *` (daily 2am) | BackupService | 60 minutes | High |
| **Weekly full backup** | `0 1 * * 0` (Sun 1am) | BackupService | 120 minutes | High |
| **Backup verification** | `0 4 * * *` (daily 4am) | IntegrityService | 30 minutes | High |
| **Media integrity check** | `0 3 * * 0` (Sun 3am) | IntegrityService | 60 minutes | Medium |
| **Archive verification** | `0 3 1 * *` (1st 3am) | IntegrityService | 120 minutes | Medium |
| **Test restore** | `0 5 15 * *` (15th 5am) | RestoreService | 120 minutes | Medium |
| **Audit log export** | `0 3 1 * *` (1st 3am) | BackupService | 60 minutes | Medium |
| **Retention policy check** | `0 4 * * 1` (Mon 4am) | RetentionPolicyService | 30 minutes | Medium |

---

## 18. Database Schema

### 18.1 Archive Tables

#### What

Database tables for storing archived data.

#### Archive Table Schema

```prisma
// ─── Archive Tables ──────────────────────────────────────────

model OrderArchive {
  id              String        @id @default(uuid())
  orderNumber     String
  profileId       String
  status          OrderStatus
  paymentStatus   PaymentStatus
  subtotal        Decimal       @db.Decimal(10, 2)
  shippingCost    Decimal       @db.Decimal(10, 2)
  tax             Decimal       @db.Decimal(10, 2)
  discount        Decimal       @db.Decimal(10, 2)
  total           Decimal       @db.Decimal(10, 2)
  currency        String        @default("INR") @db.VarChar(3)
  customerEmail   String
  customerName    String
  customerPhone   String?
  shippingAddress Json
  billingAddress  Json?
  paymentMethod   String?
  razorpayOrderId String?
  razorpayPaymentId String?
  refundedAt      DateTime?
  refundAmount    Decimal?      @db.Decimal(10, 2)
  refundReason    String?
  razorpayRefundId String?
  archivedAt      DateTime      @default(now())
  originalCreatedAt DateTime
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([profileId])
  @@index([status])
  @@index([archivedAt])
  @@index([originalCreatedAt])
}

model AuditLogArchive {
  id         String   @id @default(uuid())
  event      String   @db.VarChar(100)
  userId     String?
  ip         String?  @db.VarChar(45)
  userAgent  String?
  resource   String   @db.VarChar(100)
  resourceId String?
  changes    Json?
  archivedAt DateTime @default(now())
  originalCreatedAt DateTime
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([resource, resourceId])
  @@index([archivedAt])
  @@index([originalCreatedAt])
  @@index([event])
}

model ProductArchive {
  id           String   @id @default(uuid())
  name         String
  slug         String
  description  String?
  basePrice    Decimal  @db.Decimal(10, 2)
  gender       Gender
  categoryId   String?
  brandId      String?
  isActive     Boolean  @default(false)
  isFeatured   Boolean  @default(false)
  isNew        Boolean  @default(false)
  sortOrder    Int      @default(0)
  archivedAt   DateTime @default(now())
  originalCreatedAt DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([categoryId])
  @@index([brandId])
  @@index([archivedAt])
  @@index([originalCreatedAt])
}

model MediaArchive {
  id              String    @id @default(uuid())
  url             String
  publicId        String
  alt             String?
  width           Int?
  height          Int?
  filesize        Int?
  mimetype        String    @db.VarChar(100)
  checksum        String?   @db.VarChar(64)
  folder          String    @db.VarChar(200)
  entityType      String    @db.VarChar(50)
  entityId        String    @db.VarChar(36)
  isPublic        Boolean   @default(true)
  uploadedBy      String?
  archivedAt      DateTime  @default(now())
  originalCreatedAt DateTime
  createdAt       DateTime  @default(now())

  @@index([entityType, entityId])
  @@index([archivedAt])
  @@index([originalCreatedAt])
}
```

### 18.2 Lifecycle Tracking Tables

#### What

Database tables for tracking lifecycle events and state.

#### Lifecycle Tracking Schema

```prisma
// ─── Lifecycle Tracking ──────────────────────────────────────

model LifecycleEvent {
  id         String   @id @default(uuid())
  entityType String   @db.VarChar(50)
  entityId   String   @db.VarChar(36)
  event      String   @db.VarChar(50) // created, updated, soft_deleted, restored, archived, hard_deleted
  metadata   Json?    // Additional event data
  performedBy String? // User ID who performed the action
  createdAt  DateTime @default(now())

  @@index([entityType, entityId])
  @@index([event])
  @@index([createdAt])
  @@index([performedBy])
}

model ArchiveJob {
  id           String   @id @default(uuid())
  entityType   String   @db.VarChar(50)
  entityIds    Json     // Array of entity IDs to archive
  status       String   @default("pending") @db.VarChar(50) // pending, running, completed, failed
  reason       String?
  startedAt    DateTime?
  completedAt  DateTime?
  errorMessage String?
  metadata     Json?    // Archive statistics
  createdBy    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([status])
  @@index([createdBy])
  @@index([createdAt])
}

model CleanupJob {
  id           String   @id @default(uuid())
  jobType      String   @db.VarChar(50) // temp_cleanup, session_cleanup, orphan_detection, etc.
  status       String   @default("pending") @db.VarChar(50) // pending, running, completed, failed
  startedAt    DateTime?
  completedAt  DateTime?
  filesProcessed Int    @default(0)
  filesDeleted Int      @default(0)
  spaceFreed   BigInt   @default(0)
  errorMessage String?
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([jobType])
  @@index([status])
  @@index([createdAt])
}

model BackupRecord {
  id           String   @id @default(uuid())
  backupType   String   @db.VarChar(50) // full, incremental, audit_export
  status       String   @default("pending") @db.VarChar(50) // pending, running, completed, failed
  filePath     String?  // R2 path
  fileSize     BigInt?
  checksum     String?  @db.VarChar(64)
  startedAt    DateTime?
  completedAt  DateTime?
  errorMessage String?
  metadata     Json?    // Backup statistics
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([backupType])
  @@index([status])
  @@index([createdAt])
}

model RestoreJob {
  id           String   @id @default(uuid())
  sourceType   String   @db.VarChar(50) // archive, backup
  sourceId     String   @db.VarChar(36)
  entityType   String   @db.VarChar(50)
  entityIds    Json     // Array of entity IDs to restore
  status       String   @default("pending") @db.VarChar(50) // pending, running, completed, failed
  startedAt    DateTime?
  completedAt  DateTime?
  errorMessage String?
  metadata     Json?    // Restore statistics
  createdBy    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([sourceType, sourceId])
  @@index([status])
  @@index([createdBy])
  @@index([createdAt])
}

model IntegrityCheck {
  id           String   @id @default(uuid())
  checkType    String   @db.VarChar(50) // file_checksum, fk_reference, orphan_detection, etc.
  entityType   String?  @db.VarChar(50)
  entityId     String?  @db.VarChar(36)
  status       String   @db.VarChar(50) // passed, failed, warning
  details      Json?    // Check details and findings
  checkedAt    DateTime @default(now())

  @@index([checkType])
  @@index([entityType, entityId])
  @@index([status])
  @@index([checkedAt])
}
```

### 18.3 Index Strategy for Archive Tables

#### What

Indexing strategy for archive and lifecycle tracking tables.

#### Archive Table Indexes

| Table | Index | Columns | Purpose |
|-------|-------|---------|---------|
| **OrderArchive** | `idx_order_archive_profile` | profileId | Query by customer |
| **OrderArchive** | `idx_order_archive_status` | status | Query by status |
| **OrderArchive** | `idx_order_archive_archived` | archivedAt | Time-based queries |
| **OrderArchive** | `idx_order_archive_original` | originalCreatedAt | Original date queries |
| **AuditLogArchive** | `idx_audit_archive_user` | userId | Query by user |
| **AuditLogArchive** | `idx_audit_archive_resource` | resource, resourceId | Query by resource |
| **AuditLogArchive** | `idx_audit_archive_archived` | archivedAt | Time-based queries |
| **AuditLogArchive** | `idx_audit_archive_event` | event | Query by event type |
| **LifecycleEvent** | `idx_lifecycle_entity` | entityType, entityId | Query by entity |
| **LifecycleEvent** | `idx_lifecycle_event` | event | Query by event type |
| **LifecycleEvent** | `idx_lifecycle_created` | createdAt | Time-based queries |
| **CleanupJob** | `idx_cleanup_type` | jobType | Query by job type |
| **CleanupJob** | `idx_cleanup_status` | status | Query by status |
| **BackupRecord** | `idx_backup_type` | backupType | Query by backup type |
| **BackupRecord** | `idx_backup_status` | status | Query by status |

---

## 19. API Design

### 19.1 Archive APIs

#### What

API endpoints for archive operations.

#### Archive Endpoints

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|------------|
| `/api/admin/archive` | GET | List archived records | Admin | 60/min |
| `/api/admin/archive/search` | POST | Search archives | Admin | 30/min |
| `/api/admin/archive/:entityType/:entityId` | GET | Get archived record | Admin | 60/min |
| `/api/admin/archive/:entityType/:entityId` | POST | Restore from archive | Admin | 10/min |
| `/api/admin/archive/export` | POST | Export archive data | Admin | 5/min |
| `/api/admin/archive/bulk-restore` | POST | Bulk restore from archive | Admin | 5/min |
| `/api/admin/archive/stats` | GET | Archive statistics | Admin | 60/min |

### 19.2 Cleanup APIs

#### What

API endpoints for cleanup operations.

#### Cleanup Endpoints

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|------------|
| `/api/admin/cleanup/status` | GET | Get cleanup job status | Admin | 60/min |
| `/api/admin/cleanup/trigger` | POST | Trigger cleanup job | Admin | 5/min |
| `/api/admin/cleanup/pause` | POST | Pause cleanup job | Admin | 10/min |
| `/api/admin/cleanup/resume` | POST | Resume cleanup job | Admin | 10/min |
| `/api/admin/cleanup/orphans` | GET | Get orphan detection report | Admin | 30/min |
| `/api/admin/cleanup/broken-refs` | GET | Get broken reference report | Admin | 30/min |
| `/api/admin/cleanup/history` | GET | Get cleanup history | Admin | 60/min |

### 19.3 Backup APIs

#### What

API endpoints for backup operations.

#### Backup Endpoints

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|------------|
| `/api/admin/backup` | GET | List backups | Admin | 60/min |
| `/api/admin/backup/create` | POST | Create manual backup | Admin | 5/min |
| `/api/admin/backup/:id` | GET | Get backup details | Admin | 60/min |
| `/api/admin/backup/:id/verify` | POST | Verify backup integrity | Admin | 10/min |
| `/api/admin/backup/:id/restore` | POST | Restore from backup | Admin | 5/min |
| `/api/admin/backup/:id` | DELETE | Delete backup | Admin | 5/min |
| `/api/admin/backup/schedule` | GET | Get backup schedule | Admin | 60/min |

### 19.4 Lifecycle APIs

#### What

API endpoints for lifecycle queries and operations.

#### Lifecycle Endpoints

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|------------|
| `/api/admin/lifecycle/:entityType/:entityId` | GET | Get entity lifecycle state | Admin | 60/min |
| `/api/admin/lifecycle/:entityType/:entityId/history` | GET | Get lifecycle history | Admin | 60/min |
| `/api/admin/lifecycle/retention` | GET | Get retention policy | Admin | 60/min |
| `/api/admin/lifecycle/health` | GET | Get storage health | Admin | 60/min |
| `/api/admin/lifecycle/integrity` | GET | Get integrity check results | Admin | 30/min |
| `/api/admin/lifecycle/stats` | GET | Get lifecycle statistics | Admin | 60/min |

### 19.5 API Response Formats

#### Archive Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "entityType": "order",
    "entityId": "uuid",
    "archivedAt": "2026-08-03T10:00:00Z",
    "archivedBy": "admin-uuid",
    "reason": "Retention policy triggered",
    "metadata": {
      "originalTable": "orders",
      "archiveTable": "orders_archive",
      "filesMoved": 2,
      "spaceFreed": "2.5MB"
    }
  }
}
```

#### Cleanup Response

```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "jobType": "temp_cleanup",
    "status": "completed",
    "filesProcessed": 150,
    "filesDeleted": 142,
    "spaceFreed": "52428800",
    "duration": "2m 30s",
    "errors": []
  }
}
```

#### Integrity Check Response

```json
{
  "success": true,
  "data": {
    "checkType": "orphan_detection",
    "status": "passed",
    "results": {
      "filesScanned": 15000,
      "orphanFiles": 0,
      "brokenReferences": 0,
      "checksumMismatches": 0
    },
    "checkedAt": "2026-08-03T03:00:00Z"
  }
}
```

---

## 20. Appendices

### Appendix A: Retention Policy Quick Reference

| Data Type | Active | Archive | Total | Action |
|-----------|--------|---------|-------|--------|
| Products | Indefinite | 7 years | Indefinite | Archive |
| Categories | Indefinite | 7 years | Indefinite | Archive |
| Collections | Indefinite | 7 years | Indefinite | Archive |
| Orders | Indefinite | 7 years | Indefinite | Archive |
| Payments | Indefinite | 7 years | Indefinite | Archive (never delete) |
| Refunds | Indefinite | 7 years | Indefinite | Archive (never delete) |
| Users | While active | 3 years | Indefinite | Anonymize |
| Sessions | 30 days | None | 30 days | Delete |
| Carts | 90 days | None | 90 days | Delete |
| Audit logs | 1 year | 6 years | 7 years | Archive (never delete) |
| Media | Owner lifecycle | Owner lifecycle | Owner lifecycle | Archive |
| Exports | 30 days | None | 30 days | Delete |
| Reports | 30 days | None | 30 days | Delete |
| Temp files | 24 hours | None | 24 hours | Delete |
| Notifications | 90 days | None | 90 days | Delete |
| Messages | 90 days | None | 90 days | Delete |
| Backups | 30 days | None | 30 days | Delete |

### Appendix B: Cascade Rules Quick Reference

| Parent | Child | Soft Delete | Hard Delete | Archive |
|--------|-------|-------------|-------------|---------|
| User | Session | Cascade (hide) | Cascade (delete) | Cascade (archive) |
| User | Address | Cascade (hide) | Cascade (delete) | Cascade (archive) |
| User | Cart | Cascade (hide) | Cascade (delete) | N/A |
| User | Wishlist | Cascade (hide) | Cascade (delete) | N/A |
| User | Order | Restrict | Restrict | Retain |
| User | Review | Restrict | Restrict | Retain |
| Product | ProductVariant | Cascade (hide) | Cascade (archive) | Cascade (archive) |
| Product | Media | Cascade (hide) | Cascade (archive) | Cascade (archive) |
| Product | Review | Restrict | Restrict | Retain |
| Category | Product | SetNull | SetNull | SetNull |
| Collection | Product | SetNull | SetNull | SetNull |
| Brand | Product | SetNull | SetNull | SetNull |
| Order | OrderItem | Retain | Retain | Cascade (archive) |
| Order | OrderStatusHistory | Retain | Retain | Cascade (archive) |
| Cart | CartItem | Cascade (delete) | Cascade (delete) | N/A |

### Appendix C: Cleanup Job Schedule Quick Reference

| Job | Schedule | What It Cleans | Safety |
|-----|----------|---------------|--------|
| Temp cleanup | Hourly | Files > 24h in temp/ | Skip active uploads |
| Session cleanup | Daily 2am | Sessions > 30 days | Log count |
| Cart cleanup | Daily 2am | Carts > 90 days | Log count |
| Export cleanup | Daily 2am | Exports > 30 days | Log count |
| Report cleanup | Daily 2am | Reports > 30 days | Log count |
| Orphan detection | Daily 3am | Files without DB records | Dry-run first |
| Broken ref detection | Daily 3am | Invalid FK references | Log only |
| Media integrity | Weekly Sun 3am | Checksum verification | Flag for review |
| Archive verification | Monthly 1st 3am | Archive integrity | Full verification |
| Backup verification | Daily 4am | Backup integrity | Full verification |

### Appendix D: Permission Matrix Quick Reference

| Operation | Customer | Shop Owner | Admin |
|-----------|----------|-----------|-------|
| View own archived orders | No | No | Yes |
| Search archives | No | Yes | Yes |
| Restore from archive | No | Yes | Yes |
| Export archive | No | Yes | Yes |
| Permanent delete | No | No | Yes |
| Backup management | No | View only | Full |
| Cleanup management | No | Trigger | Full |
| Retention policy | No | View | Modify |
| Disaster recovery | No | Monitor | Full |

### Appendix E: Service File Locations

| Service | File Path | Purpose |
|---------|-----------|---------|
| LifecycleService | `api/_lib/lifecycle/lifecycle.ts` | Lifecycle orchestration |
| ArchiveService | `api/_lib/lifecycle/archive.ts` | Archive operations |
| RetentionPolicyService | `api/_lib/lifecycle/retention.ts` | Retention enforcement |
| CleanupService | `api/_lib/lifecycle/cleanup.ts` | Cleanup operations |
| BackupService | `api/_lib/lifecycle/backup.ts` | Backup operations |
| RestoreService | `api/_lib/lifecycle/restore.ts` | Restore operations |
| IntegrityService | `api/_lib/lifecycle/integrity.ts` | Integrity verification |
| HealthService | `api/_lib/lifecycle/health.ts` | Health monitoring |

### Appendix F: Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | August 03, 2026 | System | Initial release |

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
