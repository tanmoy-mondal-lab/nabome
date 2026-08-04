# নবME (Nabome) — Global Identity, Naming & Reference Architecture

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for identity, naming, and cross-module references
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0), STORAGE_ENGINE_ARCHITECTURE.md (v1.0), and FOLDER_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Identity Philosophy](#1-identity-philosophy)
2. [ID Taxonomy](#2-id-taxonomy)
3. [Internal IDs (UUID v4)](#3-internal-ids-uuid-v4)
4. [Public IDs](#4-public-ids)
5. [Display IDs](#5-display-ids)
6. [Reference IDs](#6-reference-ids)
7. [Numbering Strategy](#7-numbering-strategy)
8. [Prefix Standards](#8-prefix-standards)
9. [Entity Identity Matrix](#9-entity-identity-matrix)
10. [ID Lifecycle](#10-id-lifecycle)
11. [Immutability Rules](#11-immutability-rules)
12. [Collision Prevention](#12-collision-prevention)
13. [Reserved IDs](#13-reserved-ids)
14. [Parent-Child References](#14-parent-child-references)
15. [Cross-Module References](#15-cross-module-references)
16. [Foreign Reference Rules](#16-foreign-reference-rules)
17. [Audit References](#17-audit-references)
18. [Finance References](#18-finance-references)
19. [Document References](#19-document-references)
20. [Storage References](#20-storage-references)
21. [Notification References](#21-notification-references)
22. [Search References](#22-search-references)
23. [Global Naming Conventions](#23-global-naming-conventions)
24. [Module Naming](#24-module-naming)
25. [Component Naming](#25-component-naming)
26. [API Naming](#26-api-naming)
27. [Database Model Naming](#27-database-model-naming)
28. [Service Naming](#28-service-naming)
29. [Event Naming](#29-event-naming)
30. [Storage Folder Naming](#30-storage-folder-naming)
31. [Generated File Naming](#31-generated-file-naming)
32. [Environment Variable Naming](#32-environment-variable-naming)
33. [Configuration Key Naming](#33-configuration-key-naming)
34. [Feature Flag Naming](#34-feature-flag-naming)
35. [Architectural Rules](#35-architectural-rules)
36. [Future Extensibility](#36-future-extensibility)
37. [Mandatory Rules for AI Agents](#37-mandatory-rules-for-ai-agents)

---

## 1. Identity Philosophy

### 1.1 What

The foundational principles governing how every entity in the Nabome platform is identified, referenced, and tracked throughout its lifecycle.

### 1.2 Why

- **Global Consistency:** Every entity follows the same identity pattern — no exceptions
- **Collision-Free:** UUIDs guarantee uniqueness across distributed systems
- **Permanent Identity:** Once assigned, an ID never changes and never dies
- **Human-Readable When Appropriate:** Display IDs and order numbers are human-friendly
- **Fast Lookup:** Internal IDs enable O(1) database lookups
- **Easy Debugging:** Display IDs let support teams find entities without database access
- **Future-Proof:** Identity system supports billions of records without redesign

### 1.3 Where

Every entity, every record, every reference, every interaction across the entire Nabome platform.

### 1.4 Core Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **One entity, one identity** | Every entity has exactly one immutable internal ID | No ambiguity, no duplication |
| **ID never changes** | Once assigned, the ID is permanent for the entity's lifetime | Referential integrity |
| **ID never reused** | Deleted entity IDs are never reassigned | Prevents confusion, preserves history |
| **Internal and public are independent** | Internal UUID is never exposed to users; public ID is human-facing | Security, UX separation |
| **References survive lifecycle** | Foreign references remain valid even when the referenced entity is soft-deleted | Referential integrity |
| **Consistent across modules** | Every module uses the same identity philosophy | No module-specific ID systems |

### 1.5 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Expose internal UUIDs to users | Security risk, poor UX | Use public IDs for display |
| Use auto-increment integers | Sequential leaks, merge conflicts, not distributed-safe | Use UUID v4 |
| Generate IDs in frontend | Client-side generation is unpredictable, collision-prone | Server generates all IDs |
| Reuse deleted entity IDs | Creates phantom references, breaks audit trails | Never reuse |
| Change entity IDs | Breaks all foreign references | IDs are immutable |
| Use different ID systems per module | Inconsistent, hard to maintain | Single identity engine |

---

## 2. ID Taxonomy

### 2.1 What

The classification of identity types used throughout the Nabome platform, each serving a distinct purpose.

### 2.2 Why

- **Separation of Concerns:** Different ID types serve different audiences
- **Security:** Internal IDs never leak to clients
- **UX:** Display IDs are human-readable and memorable
- **Performance:** Internal IDs are optimized for database operations

### 2.3 ID Types

| ID Type | Purpose | Audience | Format | Example |
|---------|---------|----------|--------|---------|
| **Internal ID** | Database primary key, FK references | System only | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` |
| **Public ID** | External-facing identifier | Customers, partners | Prefixed alphanumeric | `PROD_a1b2c3d4e5f6` |
| **Display ID** | Human-readable reference | Support, admin | Sequential with prefix | `ORD-2026-000001` |
| **Reference ID** | Cross-system linking | Internal systems | Composite key | `order:550e8400...:item:789` |

### 2.4 ID Type Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Internal first** | Every entity must have an internal UUID before any other ID | Foundation of identity |
| **Public is optional** | Not every entity needs a public ID | Only customer-facing entities |
| **Display is optional** | Not every entity needs a display ID | Only business-numbered entities |
| **Reference is computed** | Reference IDs are constructed from existing IDs, not stored | No duplication |
| **Never mix types** | Internal IDs are never used where public IDs are expected | Security boundary |

---

## 3. Internal IDs (UUID v4)

### 3.1 What

The universal primary key format for every database table in the Nabome platform.

### 3.2 Why

- **Globally Unique:** UUIDs work across distributed systems without coordination
- **No Sequential Leaks:** Cannot guess the next ID — security by design
- **Merge Safe:** No conflicts when merging databases or splitting services
- **Type Safe:** UUID is a clear, unambiguous type in Prisma and TypeScript
- **Standard:** RFC 4122 compliant, understood by every database and library

### 3.3 Standard

```prisma
model Product {
  id String @id @default(uuid())
  // ...
}
```

### 3.4 UUID v4 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always UUID v4** | Use `@default(uuid())` in Prisma | Random, globally unique |
| **Never auto-increment** | No `SERIAL` or `AUTO_INCREMENT` | Security, distributed systems |
| **String type** | Use `String` in Prisma schema | UUID stored as string in PostgreSQL |
| **No NULL IDs** | IDs are never nullable | Every row must have identity |
| **Immutable** | IDs never change after creation | Stable references |
| **Server-generated** | IDs are always generated server-side | Client cannot predict or manipulate |
| **Prisma handles generation** | Never generate UUIDs in application code | Consistent, single source of truth |

### 3.5 UUID Generation

```typescript
// ✓ CORRECT: Prisma auto-generates UUIDs
const product = await db.product.create({
  data: {
    name: 'Premium Cotton T-Shirt',
    // id is auto-generated by Prisma
  },
});

// ✗ WRONG: Generating UUID in application code
const { v4: uuidv4 } = require('uuid');
const product = await db.product.create({
  data: {
    id: uuidv4(), // Don't do this — let Prisma handle it
    name: 'Premium Cotton T-Shirt',
  },
});

// ✗ WRONG: Using auto-increment
model Product {
  id Int @id @default(autoincrement()) // Never use this
}
```

### 3.6 When NOT to Use UUID

| Scenario | Alternative | Rationale |
|----------|-------------|-----------|
| **Order numbers** | Display ID: `ORD-2026-000001` | Human-readable, sortable |
| **SKU codes** | Business-defined: `TEE-BLK-M` | Business meaningful |
| **Slug URLs** | Human-readable slugs | SEO friendly |
| **Invoice numbers** | Display ID: `INV-2026-000001` | Business requirement |
| **Coupon codes** | Business-defined: `WELCOME20` | Human-readable |

---

## 4. Public IDs

### 4.1 What

External-facing identifiers designed for customer interaction, partner integration, and support communication.

### 4.2 Why

- **Security:** Internal UUIDs never leave the system
- **UX:** Public IDs are shorter, more memorable, and context-aware
- **Partner Integration:** External systems receive public IDs, not internal UUIDs
- **Support:** Support teams can reference entities without database access

### 4.3 Format

```
{PREFIX}_{random-alphanumeric}
```

| Component | Specification | Example |
|-----------|--------------|---------|
| **Prefix** | 3-6 uppercase letters, domain-specific | `PROD`, `USER`, `CUST` |
| **Separator** | Underscore | `_` |
| **Random** | 12 alphanumeric characters (base32-encoded) | `a1b2c3d4e5f6` |

### 4.4 Public ID Prefixes

| Entity | Prefix | Example |
|--------|--------|---------|
| **User** | `USER_` | `USER_a1b2c3d4e5f6` |
| **Customer** | `CUST_` | `CUST_a1b2c3d4e5f6` |
| **Shop Owner** | `SHOP_` | `SHOP_a1b2c3d4e5f6` |
| **Admin** | `ADMN_` | `ADMN_a1b2c3d4e5f6` |
| **Product** | `PROD_` | `PROD_a1b2c3d4e5f6` |
| **Product Variant** | `PVNT_` | `PVNT_a1b2c3d4e5f6` |
| **Category** | `CTGR_` | `CTGR_a1b2c3d4e5f6` |
| **Collection** | `COLL_` | `COLL_a1b2c3d4e5f6` |
| **Order** | `ORDR_` | `ORDR_a1b2c3d4e5f6` |
| **Order Item** | `ORIT_` | `ORIT_a1b2c3d4e5f6` |
| **Payment** | `PAYT_` | `PAYT_a1b2c3d4e5f6` |
| **Coupon** | `COUP_` | `COUP_a1b2c3d4e5f6` |
| **Return** | `RETN_` | `RETN_a1b2c3d4e5f6` |
| **Refund** | `REFD_` | `REFD_a1b2c3d4e5f6` |
| **Review** | `REVR_` | `REVR_a1b2c3d4e5f6` |
| **Wishlist** | `WISH_` | `WISH_a1b2c3d4e5f6` |
| **Media** | `MDIA_` | `MDIA_a1b2c3d4e5f6` |
| **Support Conversation** | `SUPC_` | `SUPC_a1b2c3d4e5f6` |
| **Blog Post** | `BLOG_` | `BLOG_a1b2c3d4e5f6` |
| **CMS Page** | `CMSP_` | `CMSP_a1b2c3d4e5f6` |
| **Notification** | `NOTF_` | `NOTF_a1b2c3d4e5f6` |
| **Audit Log** | `ADLG_` | `ADLG_a1b2c3d4e5f6` |
| **Export File** | `EXPT_` | `EXPT_a1b2c3d4e5f6` |
| **Scheduled Job** | `JOB_` | `JOB_a1b2c3d4e5f6` |
| **Finance Record** | `FNRC_` | `FNRC_a1b2c3d4e5f6` |
| **Commission** | `CMSS_` | `CMSS_a1b2c3d4e5f6` |
| **Settlement** | `STLM_` | `STLM_a1b2c3d4e5f6` |

### 4.5 Public ID Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Stored in database** | Public ID is a column on the entity table | Indexed for fast lookup |
| **Unique** | `@unique` constraint on public ID column | No duplicates |
| **Generated on creation** | Created at same time as internal UUID | Always present |
| **Never changes** | Public ID is immutable after creation | Consistent references |
| **Indexed** | B-tree index on public ID column | Fast lookup by public ID |
| **Exposed via API** | Public ID is returned in API responses | Client-facing identifier |
| **Never in URLs** | Internal UUID used in URL routes, public ID in display | Security |
| **Base32 encoding** | Use base32 for the random portion (no ambiguous chars) | Human-readable, copy-paste safe |

### 4.6 Public ID Generation

```typescript
// Public ID generation pattern
function generatePublicId(prefix: string): string {
  const randomBytes = crypto.randomBytes(8);
  const randomPart = base32Encode(randomBytes).toLowerCase().slice(0, 12);
  return `${prefix}_${randomPart}`;
}

// Examples:
// generatePublicId('PROD') → 'PROD_k8m2p4t6x9z1'
// generatePublicId('ORDR') → 'ORDR_j7n3q5r8v2w4'
// generatePublicId('USER') → 'USER_h6l1m9p3s5t7'
```

### 4.7 Public ID vs Internal UUID

| Aspect | Internal UUID | Public ID |
|--------|---------------|-----------|
| **Format** | `550e8400-e29b-41d4-a716-446655440000` | `PROD_k8m2p4t6x9z1` |
| **Length** | 36 characters | 17-19 characters |
| **Human-readable** | No | Yes |
| **Guessable** | No | No (cryptographically random) |
| **Used in database** | Primary key, foreign keys | Indexed column, lookup key |
| **Used in API URLs** | Internal systems only | Client-facing responses |
| **Used in UI** | Never | Display, search, support |
| **Used in logs** | Backend debugging | User-facing support |

---

## 5. Display IDs

### 5.1 What

Sequential, human-readable identifiers for business-critical entities that require numbered references.

### 5.2 Why

- **Business Requirement:** Orders, invoices, and payments require sequential numbering
- **Customer Communication:** Customers reference order numbers in support requests
- **Accounting:** Financial records require sequential numbering for compliance
- **Sortability:** Sequential numbers indicate creation order

### 5.3 Format

```
{PREFIX}-{YYYY}-{sequential-number}
```

| Component | Specification | Example |
|-----------|--------------|---------|
| **Prefix** | 3-4 uppercase letters | `ORD`, `INV`, `RFD` |
| **Separator** | Hyphen | `-` |
| **Year** | 4-digit year | `2026` |
| **Separator** | Hyphen | `-` |
| **Sequential** | Zero-padded to 6 digits | `000001` |

### 5.4 Display ID Prefixes

| Entity | Prefix | Example |
|--------|--------|---------|
| **Order** | `ORD` | `ORD-2026-000001` |
| **Invoice** | `INV` | `INV-2026-000001` |
| **Refund** | `RFD` | `RFD-2026-000001` |
| **Return** | `RET` | `RET-2026-000001` |
| **Payment** | `PAY` | `PAY-2026-000001` |
| **Settlement** | `STL` | `STL-2026-000001` |
| **Support Ticket** | `TKT` | `TKT-2026-000001` |
| **Export** | `EXP` | `EXP-2026-000001` |

### 5.5 Display ID Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Year-scoped** | Sequence resets each year | Prevents extremely long numbers |
| **Zero-padded** | 6-digit minimum, zero-padded | Consistent length, sortability |
| **Unique per year** | Unique constraint on (prefix, year, number) | No duplicates |
| **Sequential generation** | Auto-increment within year scope | Order indicates creation time |
| **Stored in database** | Display ID column with unique constraint | Fast lookup, audit trail |
| **Immutable** | Display ID never changes after creation | Consistent references |
| **Not used in FKs** | Internal UUID used for all foreign keys | Performance, referential integrity |

### 5.6 Display ID Generation

```typescript
// Display ID generation pattern
async function generateDisplayId(prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const lastRecord = await db.order.findFirst({
    where: { displayId: { startsWith: `${prefix}-${year}-` } },
    orderBy: { displayId: 'desc' },
  });

  let sequence = 1;
  if (lastRecord) {
    const lastSequence = parseInt(lastRecord.displayId.split('-')[2], 10);
    sequence = lastSequence + 1;
  }

  return `${prefix}-${year}-${sequence.toString().padStart(6, '0')}`;
}

// Examples:
// generateDisplayId('ORD') → 'ORD-2026-000001'
// generateDisplayId('ORD') → 'ORD-2026-000002' (next in sequence)
// generateDisplayId('INV') → 'INV-2026-000001' (independent sequence)
```

### 5.7 Display ID vs Public ID

| Aspect | Display ID | Public ID |
|--------|------------|-----------|
| **Format** | `ORD-2026-000001` | `ORDR_j7n3q5r8v2w4` |
| **Sequential** | Yes | No (random) |
| **Guessable** | Partially (sequential) | No |
| **Year-scoped** | Yes | No |
| **Used for** | Orders, invoices, financial records | Products, users, entities |
| **Customer-facing** | Yes (primary reference) | Yes (secondary reference) |
| **Support-facing** | Yes (primary lookup) | Yes (secondary lookup) |

---

## 6. Reference IDs

### 6.1 What

Composite identifiers constructed from existing IDs to create cross-system references without storing additional data.

### 6.2 Why

- **No Duplication:** Reference IDs are computed, not stored
- **Cross-System Linking:** Enables linking across microservices or external systems
- **Audit Trail:** Reference IDs capture the relationship context
- **Debugging:** Reference IDs in logs show exactly which entities are involved

### 6.3 Format

```
{entity-type}:{internal-id}:{context}:{context-id}
```

### 6.4 Reference ID Patterns

| Pattern | Example | Use Case |
|---------|---------|----------|
| **Entity self-reference** | `order:550e8400...` | Referencing an order in logs |
| **Entity-to-entity** | `order:550e8400...:item:789abc...` | Referencing a specific order item |
| **Entity-to-external** | `order:550e8400...:razorpay:pay_abc123` | Linking to Razorpay payment |
| **Entity-to-storage** | `product:550e8400...:media:789abc...` | Linking to stored media |
| **Entity-to-notification** | `user:550e8400...:notification:789abc...` | Linking notification to user |

### 6.5 Reference ID Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never stored** | Reference IDs are computed at runtime | No data duplication |
| **Colon-separated** | Use `:` as delimiter | Clear, unambiguous |
| **Type-prefixed** | First segment is always entity type | Self-documenting |
| **UUID-based** | Use internal UUIDs, not public IDs | Performance |
| **Consistent format** | Always follow the pattern | Predictable parsing |

---

## 7. Numbering Strategy

### 7.1 What

The strategy for generating unique numbers across the platform, including sequences, random generation, and composite keys.

### 7.2 Why

- **Predictability:** Sequential numbers for business entities
- **Uniqueness:** Random generation for security-sensitive entities
- **Performance:** Pre-generated sequences avoid contention
- **Compliance:** Financial records require sequential numbering

### 7.3 Numbering Strategies

| Strategy | When to Use | Example | Rationale |
|----------|-------------|---------|-----------|
| **UUID v4** | Primary keys, internal IDs | `550e8400-e29b-41d4-a716-446655440000` | Distributed-safe, collision-free |
| **Sequential (year-scoped)** | Orders, invoices, payments | `ORD-2026-000001` | Business requirement, sortability |
| **Random (base32)** | Public IDs, tokens | `PROD_k8m2p4t6x9z1` | Human-readable, non-guessable |
| **Timestamp-based** | Cache keys, temporary IDs | `cache:products:1691234567` | Automatic expiration |
| **Composite** | Unique constraints | `(productId, size, color)` | Business uniqueness |

### 7.4 Sequence Generation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Year-scoped** | Sequences reset each calendar year | Prevents extremely long numbers |
| **Atomic increment** | Use database sequences or transactions | Prevent race conditions |
| **Gap-free preferred** | Avoid gaps in financial sequences | Compliance |
| **Gap-allowed for non-financial** | Acceptable for support tickets, exports | Performance |
| **Retry on conflict** | Retry with new sequence on conflict | Resilience |

### 7.5 Random Generation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Cryptographically secure** | Use `crypto.randomBytes()` | Non-guessable |
| **Base32 encoding** | Use base32 for human readability | No ambiguous characters |
| **12+ characters** | Minimum 12 random characters | Collision resistance |
| **Check uniqueness** | Verify no collision before assignment | Safety net |

---

## 8. Prefix Standards

### 8.1 What

Standardized prefixes used across the platform for public IDs, display IDs, file naming, and system identification.

### 8.2 Why

- **Instant Recognition:** Prefixes identify entity type at a glance
- **Searchability:** Prefixes enable type-based filtering
- **Consistency:** Same prefix used everywhere for same entity
- **Extensibility:** New entity types get new prefixes without conflict

### 8.3 Complete Prefix Registry

#### 8.3.1 Entity Prefixes (Public IDs)

| Entity | Prefix | Length | Example |
|--------|--------|--------|---------|
| User | `USER_` | 5 | `USER_a1b2c3d4e5f6` |
| Customer | `CUST_` | 5 | `CUST_a1b2c3d4e5f6` |
| Shop Owner | `SHOP_` | 5 | `SHOP_a1b2c3d4e5f6` |
| Admin | `ADMN_` | 5 | `ADMN_a1b2c3d4e5f6` |
| Product | `PROD_` | 5 | `PROD_a1b2c3d4e5f6` |
| Product Variant | `PVNT_` | 5 | `PVNT_a1b2c3d4e5f6` |
| Category | `CTGR_` | 5 | `CTGR_a1b2c3d4e5f6` |
| Subcategory | `SUBC_` | 5 | `SUBC_a1b2c3d4e5f6` |
| Collection | `COLL_` | 5 | `COLL_a1b2c3d4e5f6` |
| Brand | `BRND_` | 5 | `BRND_a1b2c3d4e5f6` |
| Size Guide | `SZGD_` | 5 | `SZGD_a1b2c3d4e5f6` |
| Order | `ORDR_` | 5 | `ORDR_a1b2c3d4e5f6` |
| Order Item | `ORIT_` | 5 | `ORIT_a1b2c3d4e5f6` |
| Payment | `PAYT_` | 5 | `PAYT_a1b2c3d4e5f6` |
| Finance Record | `FNRC_` | 5 | `FNRC_a1b2c3d4e5f6` |
| Commission | `CMSS_` | 5 | `CMSS_a1b2c3d4e5f6` |
| Settlement | `STLM_` | 5 | `STLM_a1b2c3d4e5f6` |
| Coupon | `COUP_` | 5 | `COUP_a1b2c3d4e5f6` |
| Discount | `DISC_` | 5 | `DISC_a1b2c3d4e5f6` |
| Return | `RETN_` | 5 | `RETN_a1b2c3d4e5f6` |
| Refund | `REFD_` | 5 | `REFD_a1b2c3d4e5f6` |
| Review | `REVR_` | 5 | `REVR_a1b2c3d4e5f6` |
| Wishlist Item | `WISH_` | 5 | `WISH_a1b2c3d4e5f6` |
| Address | `ADDR_` | 5 | `ADDR_a1b2c3d4e5f6` |
| Notification | `NOTF_` | 5 | `NOTF_a1b2c3d4e5f6` |
| Support Conversation | `SUPC_` | 5 | `SUPC_a1b2c3d4e5f6` |
| Support Message | `SUPM_` | 5 | `SUPM_a1b2c3d4e5f6` |
| Blog Post | `BLOG_` | 5 | `BLOG_a1b2c3d4e5f6` |
| CMS Page | `CMSP_` | 5 | `CMSP_a1b2c3d4e5f6` |
| Homepage Section | `HSEC_` | 5 | `HSEC_a1b2c3d4e5f6` |
| Media File | `MDIA_` | 5 | `MDIA_a1b2c3d4e5f6` |
| Generated Document | `GDOC_` | 5 | `GDOC_a1b2c3d4e5f6` |
| Export File | `EXPT_` | 5 | `EXPT_a1b2c3d4e5f6` |
| Audit Log | `ADLG_` | 5 | `ADLG_a1b2c3d4e5f6` |
| System Event | `SYSE_` | 5 | `SYSE_a1b2c3d4e5f6` |
| Scheduled Job | `JOB_` | 4 | `JOB_a1b2c3d4e5f6` |
| Workflow Event | `WFLO_` | 5 | `WFLO_a1b2c3d4e5f6` |
| Storage Object | `STOR_` | 5 | `STOR_a1b2c3d4e5f6` |

#### 8.3.2 Display ID Prefixes (Sequential)

| Entity | Prefix | Example |
|--------|--------|---------|
| Order | `ORD` | `ORD-2026-000001` |
| Invoice | `INV` | `INV-2026-000001` |
| Refund | `RFD` | `RFD-2026-000001` |
| Return | `RET` | `RET-2026-000001` |
| Payment | `PAY` | `PAY-2026-000001` |
| Settlement | `STL` | `STL-2026-000001` |
| Support Ticket | `TKT` | `TKT-2026-000001` |
| Export | `EXP` | `EXP-2026-000001` |

#### 8.3.3 File Path Prefixes (Storage)

| Domain | Folder Prefix | Example |
|--------|---------------|---------|
| Products | `products/` | `nabome/products/{uuid}/original/` |
| Categories | `categories/` | `nabome/categories/{uuid}/images/` |
| Collections | `collections/` | `nabome/collections/{uuid}/images/` |
| Brands | `brands/` | `nabome/brands/{uuid}/logos/` |
| Avatars | `avatars/` | `nabome/avatars/{uuid}/avatar/` |
| CMS | `cms/` | `nabome/cms/slides/{uuid}/` |
| Invoices | `invoices/` | `nabome/invoices/{uuid}/invoice.pdf` |
| Exports | `exports/` | `nabome/exports/products/` |

### 8.4 Prefix Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Registered prefixes** | Only use prefixes from the registry | No collisions |
| **Unique across platform** | No two entity types share a prefix | Clear identification |
| **Consistent casing** | Uppercase for public/display, lowercase for paths | Convention |
| **No reserved conflicts** | New prefixes must not conflict with reserved prefixes | Safety |
| **Documented** | All prefixes registered in this document | Single source of truth |

---

## 9. Entity Identity Matrix

### 9.1 What

Complete mapping of every entity in the Nabome platform to its identity types, prefix, and numbering strategy.

### 9.2 Why

- **Complete Reference:** Every entity's identity is documented
- **Consistency:** No entity can deviate from the matrix
- **Implementation Guide:** Developers know exactly what to implement

### 9.3 Entity Identity Matrix

| Entity | Internal ID | Public ID | Display ID | Numbering Strategy | FK Name |
|--------|-------------|-----------|------------|-------------------|---------|
| **User** | UUID v4 | `USER_` | — | Random base32 | `userId` |
| **Customer** | UUID v4 | `CUST_` | — | Random base32 | `customerId` |
| **Shop Owner** | UUID v4 | `SHOP_` | — | Random base32 | `shopOwnerId` |
| **Admin** | UUID v4 | `ADMN_` | — | Random base32 | `adminId` |
| **Product** | UUID v4 | `PROD_` | — | Random base32 | `productId` |
| **Product Variant** | UUID v4 | `PVNT_` | — | Random base32 | `variantId` |
| **Category** | UUID v4 | `CTGR_` | — | Random base32 | `categoryId` |
| **Subcategory** | UUID v4 | `SUBC_` | — | Random base32 | `subcategoryId` |
| **Collection** | UUID v4 | `COLL_` | — | Random base32 | `collectionId` |
| **Brand** | UUID v4 | `BRND_` | — | Random base32 | `brandId` |
| **Size Guide** | UUID v4 | `SZGD_` | — | Random base32 | `sizeGuideId` |
| **Cart** | UUID v4 | — | — | — | `cartId` |
| **Cart Item** | UUID v4 | — | — | — | `cartItemId` |
| **Order** | UUID v4 | `ORDR_` | `ORD-YYYY-NNNNNN` | Sequential + random | `orderId` |
| **Order Item** | UUID v4 | `ORIT_` | — | Random base32 | `orderItemId` |
| **Order Status History** | UUID v4 | — | — | — | `historyId` |
| **Payment** | UUID v4 | `PAYT_` | `PAY-YYYY-NNNNNN` | Sequential | `paymentId` |
| **Finance Record** | UUID v4 | `FNRC_` | — | Random base32 | `financeRecordId` |
| **Commission** | UUID v4 | `CMSS_` | — | Random base32 | `commissionId` |
| **Settlement** | UUID v4 | `STLM_` | `STL-YYYY-NNNNNN` | Sequential | `settlementId` |
| **Address** | UUID v4 | `ADDR_` | — | Random base32 | `addressId` |
| **Wishlist** | UUID v4 | `WISH_` | — | Random base32 | `wishlistId` |
| **Review** | UUID v4 | `REVR_` | — | Random base32 | `reviewId` |
| **Coupon** | UUID v4 | `COUP_` | — | Random base32 | `couponId` |
| **Discount** | UUID v4 | `DISC_` | — | Random base32 | `discountId` |
| **Return** | UUID v4 | `RETN_` | `RET-YYYY-NNNNNN` | Sequential | `returnId` |
| **Refund** | UUID v4 | `REFD_` | `RFD-YYYY-NNNNNN` | Sequential | `refundId` |
| **Notification** | UUID v4 | `NOTF_` | — | Random base32 | `notificationId` |
| **Support Conversation** | UUID v4 | `SUPC_` | `TKT-YYYY-NNNNNN` | Sequential | `conversationId` |
| **Support Message** | UUID v4 | `SUPM_` | — | Random base32 | `messageId` |
| **Blog Post** | UUID v4 | `BLOG_` | — | Random base32 | `blogPostId` |
| **CMS Page** | UUID v4 | `CMSP_` | — | Random base32 | `cmsPageId` |
| **CMS Slide** | UUID v4 | — | — | — | `slideId` |
| **Homepage Section** | UUID v4 | `HSEC_` | — | Random base32 | `sectionId` |
| **Media** | UUID v4 | `MDIA_` | — | Random base32 | `mediaId` |
| **Generated Document** | UUID v4 | `GDOC_` | — | Random base32 | `documentId` |
| **Export File** | UUID v4 | `EXPT_` | `EXP-YYYY-NNNNNN` | Sequential | `exportId` |
| **Audit Log** | UUID v4 | `ADLG_` | — | Random base32 | `auditLogId` |
| **System Event** | UUID v4 | `SYSE_` | — | Random base32 | `eventId` |
| **Scheduled Job** | UUID v4 | `JOB_` | — | Random base32 | `jobId` |
| **Workflow Event** | UUID v4 | `WFLO_` | — | Random base32 | `workflowEventId` |
| **Storage Object** | UUID v4 | `STOR_` | — | Random base32 | `storageObjectId` |
| **Session** | UUID v4 | — | — | — | `sessionId` |
| **Admin Setting** | UUID v4 | — | — | — | `settingId` |
| **Product Image** | UUID v4 | — | — | — | `productImageId` |

---

## 10. ID Lifecycle

### 10.1 What

The complete lifecycle of entity IDs from creation to archival, including all states and transitions.

### 10.2 Why

- **Predictability:** Every ID follows the same lifecycle
- **Debugging:** Understanding lifecycle helps diagnose issues
- **Compliance:** Archived IDs maintain audit trails
- **Data Integrity:** Lifecycle rules prevent broken references

### 10.3 Lifecycle States

```
┌─────────────────────────────────────────────────────────────────┐
│                     ID LIFECYCLE STATES                           │
│                                                                  │
│  ┌──────────────┐                                               │
│  │   CREATED    │  Entity created, ID assigned                   │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │   ACTIVE     │  Entity is live, ID is in use                  │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │ INACTIVE     │  Entity soft-deleted (isActive = false)        │
│  └──────┬───────┘                                               │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │  ARCHIVED    │  Entity moved to archive table                 │
│  └──────────────┘                                               │
│                                                                  │
│  ┌──────────────┐                                               │
│  │  PERMANENT   │  ID is永久 preserved, never reassigned         │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 10.4 Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Created once** | ID is assigned at entity creation and never changes | Immutability |
| **Active state** | ID is in active use while entity exists | Normal operation |
| **Soft delete** | Inactive entities retain their IDs | Referential integrity |
| **Archive preserves ID** | Archived entities keep original IDs | Historical accuracy |
| **Never reassigned** | Deleted entity IDs are never reused | Prevents confusion |
| **References survive** | Foreign keys to deleted entities remain valid | Data integrity |
| **Display IDs preserved** | Display IDs are never reused even after deletion | Compliance |

### 10.5 Archived Entity Handling

| Scenario | Strategy | Rationale |
|----------|----------|-----------|
| **Soft delete** | Set `isActive = false`, keep all IDs | Default for all entities |
| **Archive old orders** | Move to `orders_archive` table, preserve IDs | Performance, compliance |
| **Archive old sessions** | Delete after 30 days (ephemeral entity) | Security, storage |
| **Archive audit logs** | Move to `audit_log_archive` table | Performance |
| **Archive exports** | Delete from R2 after retention period | Cost management |

---

## 11. Immutability Rules

### 11.1 What

Rules governing which identity fields can never change after creation.

### 11.2 Why

- **Referential Integrity:** Changing IDs breaks foreign key references
- **Audit Trail:** Immutable IDs preserve historical accuracy
- **Debugging:** Consistent IDs make logs traceable
- **Compliance:** Financial records require immutable identifiers

### 11.3 Immutability Matrix

| Field | Mutable? | Rationale |
|-------|----------|-----------|
| **Internal UUID** | Never | Foundation of identity |
| **Public ID** | Never | External references depend on it |
| **Display ID** | Never | Business records depend on it |
| **Slug** | Rarely (admin only) | SEO impact, but may need correction |
| **SKU** | Rarely (admin only) | Business identifier, but may need correction |
| **Email** | Yes (with verification) | User may change email |
| **Name** | Yes | User may change name |
| **Status** | Yes | Entity state changes |
| **isActive** | Yes | Soft delete/restore |

### 11.4 What to Do When ID Appears Wrong

| Situation | Action | Rationale |
|-----------|--------|-----------|
| **Duplicate public ID detected** | Log collision, generate new public ID | Safety net |
| **Display ID gap** | Accept gap, never fill it | Gaps are acceptable |
| **Wrong entity assigned ID** | Create new entity with new ID | Never reassign |
| **ID format error** | Create new entity, archive old | Preserve history |

---

## 12. Collision Prevention

### 12.1 What

Strategies and mechanisms to prevent ID collisions across the platform.

### 12.2 Why

- **Data Integrity:** Collisions cause data corruption
- **Referential Integrity:** Collisions break foreign key references
- **Business Logic:** Collisions cause incorrect business operations

### 12.3 Collision Prevention Strategies

| Strategy | When to Use | Implementation | Rationale |
|----------|-------------|----------------|-----------|
| **UUID v4 randomness** | Primary keys | Prisma `@default(uuid())` | Statistical uniqueness |
| **Unique constraints** | Public IDs, display IDs, slugs, SKUs | `@unique` in Prisma | Database-enforced uniqueness |
| **Sequence locking** | Display ID generation | Database transaction with lock | Prevents race conditions |
| **Retry on conflict** | All ID generation | Catch unique violation, retry | Resilience |
| **Prefix separation** | Public IDs | Different prefixes per entity type | Prevents cross-entity collisions |

### 12.4 Collision Response

```typescript
// Collision response pattern
async function createEntityWithRetry(data: CreateEntityInput, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await db.entity.create({ data });
    } catch (error) {
      if (error.code === 'P2002' && attempt < maxRetries - 1) {
        // Unique constraint violation — retry with new ID
        continue;
      }
      throw error;
    }
  }
  throw new AppError('ID_GENERATION_FAILED', 500, 'Failed to generate unique ID');
}
```

---

## 13. Reserved IDs

### 13.1 What

Special IDs and prefixes reserved for system use that cannot be assigned to user-created entities.

### 13.2 Why

- **System Operations:** Reserved IDs enable system-level operations
- **Default Values:** Reserved IDs provide sensible defaults
- **Conflict Prevention:** Reserved IDs cannot be accidentally overwritten

### 13.3 Reserved Internal UUIDs

| UUID | Entity | Purpose |
|------|--------|---------|
| `00000000-0000-0000-0000-000000000001` | System User | System-level operations |
| `00000000-0000-0000-0000-000000000002` | Default Category | Uncategorized products |
| `00000000-0000-0000-0000-000000000003` | Default Collection | Uncategorized collections |
| `00000000-0000-0000-0000-000000000004` | System Admin | Platform operations |
| `00000000-0000-0000-0000-000000000005` | Deleted User | Preserves references to deleted users |

### 13.4 Reserved Public ID Prefixes

| Prefix | Purpose | Notes |
|--------|---------|-------|
| `SYS_` | System entities | Not user-assignable |
| `DELETED_` | Deleted entity placeholder | Used for audit trail |
| `TEMP_` | Temporary entities | Will be replaced |
| `LEGACY_` | Imported legacy data | Migration use |

### 13.5 Reserved Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never assign reserved IDs** | Check before creation | System integrity |
| **Never overwrite reserved** | Protect reserved IDs | System operations |
| **Document all reserved** | Register in this document | Single source of truth |
| **Validate on creation** | Reject reserved ID patterns | Safety net |

---

## 14. Parent-Child References

### 14.1 What

Rules governing how parent entities reference child entities and vice versa.

### 14.2 Why

- **Ownership:** Parent controls child lifecycle
- **Cascade Behavior:** Parent deletion affects children predictably
- **Query Efficiency:** Parent-child relationships enable efficient queries

### 14.3 Parent-Child Relationship Matrix

| Parent | Child | FK Column | Cascade Strategy | Rationale |
|--------|-------|-----------|------------------|-----------|
| User | Profile | `userId` | Cascade | User owns profile |
| User | Session | `userId` | Cascade | User owns sessions |
| User | Address | `userId` | Cascade | User owns addresses |
| User | Cart | `userId` | Cascade | User owns cart |
| User | Wishlist | `userId` | Cascade | User owns wishlist |
| User | Order | `profileId` | Restrict | Never delete user with orders |
| User | Review | `profileId` | Restrict | Never delete user with reviews |
| User | Notification | `userId` | Cascade | User owns notifications |
| Product | ProductVariant | `productId` | Cascade | Product owns variants |
| Product | ProductImage | `productId` | Cascade | Product owns images |
| Product | Review | `productId` | Restrict | Never delete product with reviews |
| Category | Product | `categoryId` | SetNull | Product can exist without category |
| Collection | Product | `collectionId` | SetNull | Product can exist without collection |
| Brand | Product | `brandId` | SetNull | Product can exist without brand |
| Order | OrderItem | `orderId` | Cascade | Order owns items |
| Order | OrderStatusHistory | `orderId` | Cascade | Order owns history |
| Order | Payment | `orderId` | Cascade | Order owns payments |
| Cart | CartItem | `cartId` | Cascade | Cart owns items |
| Coupon | Order | `couponId` | Restrict | Never delete coupon with orders |
| Support Conversation | Support Message | `conversationId` | Cascade | Conversation owns messages |
| Blog Post | Media | `blogPostId` | SetNull | Blog can exist without media |
| CMS Page | Media | `cmsPageId` | SetNull | Page can exist without media |

### 14.4 Parent-Child Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **FK always indexed** | Every parent-child FK gets an index | Query performance |
| **Explicit cascade** | Define `onDelete` for every FK | Predictable behavior |
| **Ownership clear** | Parent owns child lifecycle | Clean deletion |
| **Restrict for transactions** | Never cascade-delete financial records | Data integrity |
| **SetNull for optional** | Set FK to NULL when parent is deleted | Flexibility |
| **Cascade for composition** | Delete children when owner is deleted | Clean deletion |

---

## 15. Cross-Module References

### 15.1 How

Rules for referencing entities across different feature modules.

### 15.2 Why

- **Decoupling:** Modules don't depend on each other's internals
- **Consistency:** Same reference pattern across all modules
- **Future-Proof:** Modules can be extracted to microservices

### 15.3 Cross-Module Reference Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use internal UUID** | Always reference via internal UUID, never public ID | Performance |
| **Use FK relations** | Reference via Prisma `@relation`, not raw SQL | Type safety |
| **No cross-module queries** | Handlers only query their own tables | Prevents coupling |
| **Shared access via relations** | Other domains read via FK relations | Clean boundaries |
| **Cross-domain writes via shared lib** | Extract to `_lib/` if write is needed | Reusable logic |

### 15.4 Cross-Module Reference Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                  CROSS-MODULE REFERENCE FLOW                      │
│                                                                  │
│  ┌──────────────┐     FK Relation     ┌──────────────┐          │
│  │   Orders     │ ──────────────────▶ │   Products   │          │
│  │   Module     │                     │   Module     │          │
│  └──────────────┘                     └──────────────┘          │
│         │                                    │                   │
│         │ Query OrderItem                    │ Query Product     │
│         │ (own domain)                       │ (via FK)          │
│         ▼                                    ▼                   │
│  ┌──────────────┐                     ┌──────────────┐          │
│  │  OrderItem   │                     │   Product    │          │
│  │  (own table) │                     │   (read-only)│          │
│  └──────────────┘                     └──────────────┘          │
│                                                                  │
│  ✓ Orders handler CAN read Product via OrderItem.productId      │
│  ✗ Orders handler CANNOT modify Product                         │
│  ✗ Orders handler CANNOT query ProductCategory directly         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 16. Foreign Reference Rules

### 16.1 What

Complete rules for all foreign key references in the Nabome database.

### 16.2 Why

- **Referential Integrity:** FKs prevent orphaned records
- **Type Safety:** Prisma enforces FK types at compile time
- **Query Performance:** Proper FK indexes prevent full table scans

### 16.3 Standard FK Pattern

```prisma
model Product {
  id String @id @default(uuid())
  name String

  // Foreign Key — always indexed
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  // Indexes
  @@index([categoryId])
}

model Category {
  id       String    @id @default(uuid())
  name     String

  // Reverse relation — NOT a column
  products Product[]
}
```

### 16.4 FK Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always nullable or has default** | FK columns must have defaults or be nullable | Zero-downtime migrations |
| **Always indexed** | Every FK column gets `@@index()` | Join performance |
| **Explicit @relation** | Always define field and references | Type safety |
| **onDelete strategy** | Define for every FK | Prevent accidental deletes |
| **No composite FKs** | Prefer separate FK columns | Simpler queries |
| **FK type matches PK** | FK type must match referenced PK type | Type safety |
| **Nullable for optional** | Use `?` when relationship is not required | Flexibility |
| **Non-nullable for required** | Omit `?` when relationship is mandatory | Data integrity |

### 16.5 FK Naming Convention

| Pattern | Example | Rationale |
|---------|---------|-----------|
| **Column name** | `categoryId` | Prisma convention |
| **Relation name** | `category` | Singular, camelCase |
| **Reverse relation** | `products Product[]` | Plural, array type |
| **Junction table** | `ProductImage` | PascalCase, descriptive |

---

## 17. Audit References

### 17.1 What

Rules for referencing entities in audit logs and security trails.

### 17.2 Why

- **Compliance:** Regulatory requirements for audit trails
- **Security:** Track who did what and when
- **Debugging:** Understand what happened and why

### 17.3 Audit Log Reference Pattern

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  event      String   @db.VarChar(100)
  userId     String?                     // Who did it
  ip         String?  @db.VarChar(45)    // Where from
  userAgent  String?                     // What client
  resource   String   @db.VarChar(100)  // What entity type
  resourceId String?                     // What entity (internal UUID)
  changes    Json?                       // What changed
  createdAt  DateTime @default(now())    // When

  @@index([userId])
  @@index([resource, resourceId])
  @@index([createdAt])
  @@index([event])
}
```

### 17.4 Audit Reference Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Resource = entity type** | Use entity type name (`Order`, `Product`) | Clear identification |
| **ResourceId = internal UUID** | Use internal UUID, not public ID | Performance, consistency |
| **UserId = internal UUID** | Reference user by internal UUID | Consistency |
| **Changes = JSON snapshot** | Store old/new values as JSON | Audit trail |
| **Append-only** | Audit logs are never modified or deleted | Compliance |
| **Retention 7 years** | Keep audit logs for 7 years minimum | Legal requirement |
| **Never log secrets** | No passwords, tokens, API keys | Security |

### 17.5 Audit Event Naming

| Event | Resource | Pattern |
|-------|----------|---------|
| `USER_LOGIN` | User | `USER_{action}` |
| `USER_LOGIN_FAILED` | User | `USER_{action}` |
| `PASSWORD_CHANGED` | User | `PASSWORD_{action}` |
| `ORDER_CREATED` | Order | `ORDER_{action}` |
| `ORDER_STATUS_CHANGED` | Order | `ORDER_{action}` |
| `PAYMENT_PROCESSED` | Order | `PAYMENT_{action}` |
| `PRODUCT_UPDATED` | Product | `PRODUCT_{action}` |
| `COUPON_CREATED` | Coupon | `COUPON_{action}` |

---

## 18. Finance References

### 18.1 What

Rules for referencing financial entities including orders, payments, commissions, and settlements.

### 18.2 Why

- **Compliance:** Financial regulations require accurate references
- **Auditability:** Track all financial transactions
- **Accuracy:** Prevent financial discrepancies

### 18.3 Finance Reference Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Order → Payment** | One order can have multiple payments | Partial payments, retries |
| **Order → Refund** | One order can have multiple refunds | Partial refunds |
| **Payment → Refund** | One payment can have multiple refunds | Partial refunds |
| **Commission → Settlement** | Multiple commissions settle together | Batch settlements |
| **Snapshot amounts** | Order amounts are immutable after creation | Audit trail |
| **DECIMAL for money** | All amounts use `DECIMAL(10,2)` | Precision |
| **Display IDs for finance** | Orders, invoices, payments have display IDs | Business requirement |

### 18.4 Finance Reference Matrix

| Source | Reference | FK Column | Notes |
|--------|-----------|-----------|-------|
| Order → User | `profileId` | User who placed order | Restrict on delete |
| Order → Payment | `orderId` (on Payment) | Payment for this order | Cascade on delete |
| Order → Refund | `orderId` (on Refund) | Refund for this order | Cascade on delete |
| Order → Return | `orderId` (on Return) | Return for this order | Cascade on delete |
| Payment → Razorpay | `razorpayPaymentId` | External payment ID | String reference |
| Order → Razorpay | `razorpayOrderId` | External order ID | String reference |
| Commission → Order | `orderId` | Order generating commission | Restrict on delete |
| Settlement → Commission | `settlementId` (on Commission) | Settlement batch | SetNull on delete |

---

## 19. Document References

### 19.1 What

Rules for referencing generated documents like invoices, shipping labels, and export files.

### 19.2 Why

- **Traceability:** Every document traces back to its source entity
- **Retrieval:** Documents can be found by entity reference
- **Cleanup:** Document lifecycle tied to parent entity

### 19.3 Document Reference Pattern

```
Document → Parent Entity → Storage Location

Example:
Invoice PDF → Order → R2: nabome/invoices/{order-uuid}/invoice.pdf
Shipping Label → Order → R2: nabome/shipping-labels/{order-uuid}/label.pdf
Return Label → Return → R2: nabome/return-labels/{return-uuid}/label.pdf
Export File → Export Job → R2: nabome/exports/products/{export-uuid}/data.csv
```

### 19.4 Document Reference Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Parent owns document** | Document lifecycle tied to parent entity | Cleanup |
| **UUID-based paths** | Use entity UUID in storage path | No collisions |
| **Metadata in DB** | Store document URL, type, size in `Media` table | Queryability |
| **CDN delivery** | Serve documents via CDN | Performance |
| **Retention policy** | Documents follow parent entity retention | Compliance |

---

## 20. Storage References

### 20.1 What

Rules for referencing stored files across Cloudinary and R2.

### 20.2 Why

- **Consistency:** Same reference pattern for all storage
- **Provider independence** | Storage references don't depend on provider | Swappability
- **Cleanup** | Parent deletion cleans up storage | Orphan prevention

### 20.3 Storage Reference Pattern

```
Media Record (DB) → Storage Provider → CDN URL

Example:
Media { id: '...', url: 'nabome/products/{uuid}/original/image.jpg' }
  → Cloudinary: nabome/products/{uuid}/original/image.jpg
  → CDN URL: https://res.cloudinary.com/nabome/image/upload/...
```

### 20.4 Storage Reference Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **DB as source of truth** | `Media` table tracks all assets | Queryability, integrity |
| **Path stored, not URL** | Store relative path, compute URL | Provider independence |
| **Parent owns asset** | Asset lifecycle tied to parent entity | Cleanup |
| **No orphan files** | Every file has a database record | Integrity |
| **UUID-based paths** | Use entity UUID in path | No collisions |

---

## 21. Notification References

### 21.1 What

Rules for referencing entities in notification systems.

### 21.2 Why

- **Traceability:** Notifications link to the entities they reference
- **Actionability:** Users can click notification to view referenced entity
- **Cleanup:** Notifications can be cleaned up with parent entity

### 21.3 Notification Reference Pattern

```prisma
model Notification {
  id         String   @id @default(uuid())
  userId     String
  type       String   @db.VarChar(50)    // 'order_shipped', 'payment_received'
  title      String
  message    String
  resource   String?  @db.VarChar(50)    // 'Order', 'Product'
  resourceId String?                     // Internal UUID of referenced entity
  isRead     Boolean  @default(false)
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([resource, resourceId])
  @@index([isRead])
}
```

### 21.4 Notification Reference Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Optional reference** | Not all notifications reference entities | System notifications |
| **Resource + ResourceId** | Use same pattern as audit logs | Consistency |
| **Type-prefixed** | Notification type indicates entity type | Clarity |
| **User-owned** | Notifications belong to a user | Cleanup |
| **Read tracking** | Track read status | UX |

---

## 22. Search References

### 22.1 What

Rules for referencing entities in search indexes and results.

### 22.2 Why

- **Performance:** Search indexes must reference entities efficiently
- **Relevance:** Search results must link to correct entities
- **Freshness:** Search indexes must update when entities change

### 22.3 Search Reference Pattern

```
Search Index → Entity → Display Result

Example:
pg_trgm index on products.name → Product { id, name, slug, basePrice }
  → Search result: { id: 'PROD_...', name: 'Premium T-Shirt', url: '/products/premium-t-shirt' }
```

### 22.4 Search Reference Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Index internal UUID** | Search results return internal UUID | Consistency |
| **Display public ID** | Search results show public ID to users | UX |
| **Display slug in URL** | Search result URLs use slugs | SEO |
| **Update on change** | Search index updates when entity changes | Freshness |
| **Soft delete excluded** | Inactive entities excluded from search | Relevance |

---

## 23. Global Naming Conventions

### 23.1 What

Standardized naming patterns for all code artifacts across the Nabome platform.

### 23.2 Why

- **Predictability:** Developers know what to call things without thinking
- **Discoverability:** Search works reliably with consistent naming
- **Readability:** Names communicate intent and type

### 23.3 Naming Rules

| Artifact | Convention | Example | Rationale |
|----------|-----------|---------|-----------|
| **Components** | PascalCase | `ProductCard`, `CartItem` | React convention |
| **Hooks** | camelCase with `use` prefix | `useCart`, `useProducts` | React convention |
| **Utilities** | camelCase | `formatPrice`, `cn` | JavaScript convention |
| **Types/Interfaces** | PascalCase | `Product`, `CartItem`, `OrderStatus` | TypeScript convention |
| **Enums** | PascalCase | `OrderStatus`, `PaymentStatus` | TypeScript convention |
| **Constants** | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_CART_ITEMS` | JavaScript convention |
| **Files (components)** | PascalCase | `ProductCard.tsx` | Matches component name |
| **Files (hooks)** | camelCase with `use` | `useCart.ts` | Matches hook name |
| **Files (utilities)** | camelCase | `format.ts` | Matches function name |
| **Files (types)** | camelCase | `product.ts` | Matches type namespace |
| **Files (API handlers)** | kebab-case | `create-order.ts` | URL-friendly |
| **Folders (features)** | plural | `products/`, `orders/` | Contains multiple items |
| **Folders (utilities)** | singular | `utils/`, `hooks/` | Contains utility functions |
| **Database tables** | snake_case | `product_variants`, `order_items` | PostgreSQL convention |
| **Database columns** | camelCase | `createdAt`, `profileId` | Prisma convention |
| **API endpoints** | kebab-case | `/api/products`, `/api/cart-items` | RESTful convention |
| **CSS classes** | Tailwind utilities | `bg-brand-500`, `text-neutral-700` | Tailwind convention |

---

## 24. Module Naming

### 24.1 What

Standardized naming for feature modules, API handler domains, and shared libraries.

### 24.2 Module Naming Rules

| Artifact | Convention | Example | Location |
|----------|-----------|---------|----------|
| **Feature modules** | plural kebab-case | `products`, `cart-items` | `src/features/` |
| **API handler domains** | plural kebab-case | `products`, `cart-items` | `api/_handlers/` |
| **Shared libraries** | singular kebab-case | `auth`, `validation`, `security` | `api/_lib/` |
| **Global stores** | kebab-case with `-store` suffix | `auth-store`, `ui-store` | `src/stores/` |
| **Global types** | singular kebab-case | `product`, `order`, `user` | `src/types/` |

---

## 25. Component Naming

### 25.1 What

Standardized naming for React components across the platform.

### 25.2 Component Naming Rules

| Pattern | Convention | Example | Rationale |
|---------|-----------|---------|-----------|
| **Page components** | `{Entity}Page` | `ProductPage`, `OrderPage` | Full page |
| **Layout components** | `{Entity}Layout` | `AdminLayout`, `CheckoutLayout` | Page layout |
| **Card components** | `{Entity}Card` | `ProductCard`, `OrderCard` | List item |
| **List components** | `{Entity}List` | `OrderList`, `ReviewList` | Collection |
| **Form components** | `{Entity}Form` | `LoginForm`, `CheckoutForm` | Input form |
| **Drawer components** | `{Entity}Drawer` | `CartDrawer`, `FilterDrawer` | Slide panel |
| **Modal components** | `{Entity}Dialog` | `DeleteDialog`, `ImageDialog` | Popup |
| **Button components** | `{Action}Button` | `AddToCartButton`, `WishlistButton` | Action |
| **Item components** | `{Entity}Item` | `CartItem`, `OrderItem` | Line item |
| **Section components** | `{Entity}Section` | `HeroSection`, `FeaturedSection` | Page section |
| **Hook components** | `use{Entity}` | `useCart`, `useProducts` | Custom hook |

---

## 26. API Naming

### 26.1 What

Standardized naming for REST API endpoints, request/response types, and HTTP methods.

### 26.2 API Naming Rules

| Pattern | Convention | Example | Rationale |
|---------|-----------|---------|-----------|
| **Resource listing** | `GET /api/{resources}` | `GET /api/products` | Collection endpoint |
| **Resource detail** | `GET /api/{resources}/:id` | `GET /api/products/:id` | Single resource |
| **Create** | `POST /api/{resources}` | `POST /api/products` | Create resource |
| **Update** | `PATCH /api/{resources}/:id` | `PATCH /api/products/:id` | Partial update |
| **Delete** | `DELETE /api/{resources}/:id` | `DELETE /api/products/:id` | Remove resource |
| **Nested resources** | `GET /api/{resources}/:id/{children}` | `GET /api/products/:id/reviews` | Related resources |
| **Actions** | `POST /api/{resource}/{action}` | `POST /api/cart/add` | Non-CRUD operations |
| **Admin** | `GET /api/admin/{resources}` | `GET /api/admin/products` | Admin-specific endpoints |

### 26.3 API Response Naming

| Pattern | Convention | Example |
|---------|-----------|---------|
| **Success response** | `{ success: true, data: T }` | `{ success: true, data: { ... } }` |
| **Error response** | `{ success: false, error: { code, message } }` | `{ success: false, error: { code: "NOT_FOUND" } }` |
| **List response** | `{ success: true, data: T[], meta: { page, limit, total } }` | `{ success: true, data: [...], meta: { ... } }` |
| **Mutation response** | `{ success: true, data: { message: string } }` | `{ success: true, data: { message: "Created" } }` |

---

## 27. Database Model Naming

### 27.1 What

Standardized naming for Prisma models, fields, and relations.

### 27.2 Database Naming Rules

| Object | Convention | Example | Rationale |
|--------|-----------|---------|-----------|
| **Models** | PascalCase, singular | `Product`, `OrderItem` | Prisma convention |
| **Fields** | camelCase | `categoryId`, `createdAt` | Prisma convention |
| **Relations** | camelCase, singular | `category`, `profile` | Prisma convention |
| **Arrays** | camelCase, plural | `products`, `items` | Prisma convention |
| **Enums** | PascalCase | `OrderStatus`, `PaymentStatus` | Prisma convention |
| **Tables** | snake_case, plural | `products`, `order_items` | PostgreSQL convention |
| **Columns** | snake_case | `category_id`, `created_at` | PostgreSQL convention |
| **Indexes** | `idx_{table}_{columns}` | `idx_products_category_id` | PostgreSQL convention |
| **Unique constraints** | `uk_{table}_{columns}` | `uk_products_slug` | PostgreSQL convention |

---

## 28. Service Naming

### 28.1 What

Standardized naming for backend services in `api/_lib/`.

### 28.2 Service Naming Rules

| Pattern | Convention | Example | Location |
|---------|-----------|---------|----------|
| **Service classes** | `{Entity}Service` | `EmailService`, `CacheService` | `api/_lib/{domain}/` |
| **Service files** | kebab-case | `email.ts`, `cache.ts` | `api/_lib/{domain}/` |
| **Service methods** | camelCase, verb-first | `sendEmail()`, `getCached()` | Within service |
| **Middleware functions** | camelCase, verb-first | `authenticate()`, `validateRequest()` | `api/_lib/{domain}/` |
| **Utility functions** | camelCase, descriptive | `generateSlug()`, `formatPrice()` | `api/_lib/` |

---

## 29. Event Naming

### 29.1 What

Standardized naming for system events, audit events, and webhook events.

### 29.2 Event Naming Rules

| Pattern | Convention | Example | Rationale |
|---------|-----------|---------|-----------|
| **Audit events** | `{ENTITY}_{ACTION}` | `ORDER_CREATED`, `USER_LOGIN` | Clear, searchable |
| **System events** | `{domain}.{action}` | `order.created`, `user.login` | Dot-notation for hierarchy |
| **Webhook events** | `{domain}.{action}` | `payment.captured`, `order.shipped` | External integration |
| **Notification types** | `{entity}_{event}` | `order_shipped`, `payment_received` | User-facing |

### 29.3 Event Name Registry

| Event | Type | Description |
|-------|------|-------------|
| `USER_REGISTERED` | Audit | New user registered |
| `USER_LOGIN` | Audit | User logged in |
| `USER_LOGIN_FAILED` | Audit | Failed login attempt |
| `USER_LOGOUT` | Audit | User logged out |
| `PASSWORD_CHANGED` | Audit | Password changed |
| `EMAIL_CHANGED` | Audit | Email changed |
| `ORDER_CREATED` | Audit | New order placed |
| `ORDER_STATUS_CHANGED` | Audit | Order status updated |
| `PAYMENT_PROCESSED` | Audit | Payment processed |
| `PAYMENT_FAILED` | Audit | Payment failed |
| `REFUND_PROCESSED` | Audit | Refund processed |
| `PRODUCT_CREATED` | Audit | New product created |
| `PRODUCT_UPDATED` | Audit | Product updated |
| `PRODUCT_DELETED` | Audit | Product soft-deleted |
| `COUPON_CREATED` | Audit | New coupon created |
| `COUPON_USED` | Audit | Coupon applied to order |
| `REVIEW_CREATED` | Audit | New review submitted |
| `REVIEW_APPROVED` | Audit | Review approved |
| `EXPORT_STARTED` | System | Data export started |
| `EXPORT_COMPLETED` | System | Data export completed |
| `EXPORT_FAILED` | System | Data export failed |

---

## 30. Storage Folder Naming

### 30.1 What

Standardized naming for storage folder hierarchies in Cloudinary and R2.

### 30.2 Storage Folder Naming Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lowercase kebab-case** | `size-guides` not `SizeGuides` | URL-safe, consistent |
| **Plural nouns** | `products` not `product` | Contains multiple items |
| **UUID subfolders** | `{uuid}/` for entity isolation | Prevents collisions |
| **Descriptive names** | `original/`, `variants/`, `thumbnails/` | Clear purpose |
| **No user input in paths** | Generated paths only | Security |
| **Max 3 levels deep** | `nabome/{domain}/{uuid}/` max | Simplicity |

### 30.3 Storage Folder Structure

```
Cloudinary:
nabome/
├── products/{product-uuid}/original/
├── products/{product-uuid}/variants/
├── categories/{category-uuid}/images/
├── collections/{collection-uuid}/images/
├── brands/{brand-uuid}/logos/
├── avatars/{user-uuid}/avatar/
├── cms/slides/{slide-uuid}/
├── cms/pages/{page-uuid}/
├── cms/blogs/{blog-uuid}/

R2:
nabome-r2/
├── invoices/{order-uuid}/invoice.pdf
├── shipping-labels/{order-uuid}/label.pdf
├── return-labels/{return-uuid}/label.pdf
├── exports/{export-uuid}/data.csv
├── backups/database/
├── temp/uploads/
```

---

## 31. Generated File Naming

### 31.1 What

Standardized naming for dynamically generated files like invoices, exports, and reports.

### 31.2 Generated File Naming Rules

| Pattern | Convention | Example | Rationale |
|---------|-----------|---------|-----------|
| **Invoices** | `invoice-{orderNumber}.pdf` | `invoice-ORD-2026-000001.pdf` | Business reference |
| **Shipping labels** | `shipping-label-{orderNumber}.pdf` | `shipping-label-ORD-2026-000001.pdf` | Business reference |
| **Return labels** | `return-label-{returnNumber}.pdf` | `return-label-RET-2026-000001.pdf` | Business reference |
| **Data exports** | `{entity}-export-{YYYY-MM-DD}.csv` | `products-export-2026-08-03.csv` | Date-stamped |
| **Reports** | `{report-type}-{YYYY-MM-DD}.pdf` | `sales-report-2026-08-03.pdf` | Date-stamped |
| **Thumbnails** | `{original-name}-thumb.{ext}` | `image-thumb.webp` | Suffix convention |
| **Resized images** | `{original-name}-{width}x{height}.{ext}` | `image-800x600.webp` | Dimension suffix |

---

## 32. Environment Variable Naming

### 32.1 What

Standardized naming for environment variables across the platform.

### 32.2 Environment Variable Naming Rules

| Pattern | Convention | Example | Rationale |
|---------|-----------|---------|-----------|
| **General** | `UPPER_SNAKE_CASE` | `APP_URL`, `NODE_ENV` | Standard convention |
| **Database** | `{SERVICE}_URL` | `DATABASE_URL`, `HYPERDRIVE_URL` | Service-specific |
| **API keys** | `{SERVICE}_KEY_{TYPE}` | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Service + purpose |
| **Feature flags** | `FEATURE_{NAME}` | `FEATURE_MARKETPLACE`, `FEATURE_MFA` | Clear purpose |
| **Limits** | `{RESOURCE}_{LIMIT}` | `MAX_CART_ITEMS`, `MAX_SESSIONS` | Resource + limit |

### 32.3 Environment Variable Registry

| Variable | Purpose | Required |
|----------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `HYPERDRIVE_URL` | Hyperdrive connection pool URL | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `RAZORPAY_KEY_ID` | Razorpay API key | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Yes |
| `RESEND_API_KEY` | Resend email API key | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret | Yes |
| `CSRF_SECRET` | CSRF token secret | Yes |
| `APP_URL` | Application URL | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |

---

## 33. Configuration Key Naming

### 33.1 What

Standardized naming for configuration keys in `config.ts` and admin settings.

### 33.2 Configuration Key Naming Rules

| Pattern | Convention | Example | Rationale |
|---------|-----------|---------|-----------|
| **Config keys** | `kebab-case` | `max-cart-items`, `session-timeout` | URL-safe, readable |
| **Admin settings** | `snake_case` | `site_name`, `maintenance_mode` | Database convention |
| **Feature flags** | `kebab-case` | `marketplace-enabled`, `mfa-required` | Clear purpose |

---

## 34. Feature Flag Naming

### 34.1 What

Standardized naming for feature flags used for gradual rollouts and A/B testing.

### 34.2 Feature Flag Naming Rules

| Pattern | Convention | Example | Rationale |
|---------|-----------|---------|-----------|
| **Feature flags** | `{domain}-{feature}` | `marketplace-seller-dashboard` | Domain + feature |
| **Kill switches** | `kill-{feature}` | `kill-new-checkout` | Emergency disable |
| **A/B tests** | `test-{variant}` | `test-new-homepage` | Experiment tracking |

---

## 35. Architectural Rules

### 35.1 What

Hard rules that every identity, naming, and reference implementation must follow.

### 35.2 Why

- **Consistency:** No exceptions to the rules
- **Quality:** Every implementation meets the standard
- **Maintainability:** Predictable patterns across the platform

### 35.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **IDs never change** | Once assigned, an entity's internal ID is permanent | Data corruption |
| **IDs never reused** | Deleted entity IDs are never reassigned | Phantom references |
| **UUID v4 for all PKs** | Every table uses UUID v4 as primary key | Security, distributed systems |
| **Internal IDs never exposed** | Internal UUIDs never sent to client | Security |
| **Public IDs unique** | `@unique` constraint on all public ID columns | Data integrity |
| **Display IDs unique per year** | Unique constraint on (prefix, year, number) | Business integrity |
| **FKs always indexed** | Every foreign key column gets an index | Query performance |
| **Soft delete over hard delete** | Use `isActive` flag, never delete rows | Referential integrity |
| **Timestamps on all tables** | Every table has `createdAt` + `updatedAt` | Audit trail |
| **Consistent naming** | Same naming patterns everywhere | Predictability |
| **One entity, one identity** | No entity has multiple identity systems | No ambiguity |
| **References survive lifecycle** | FK references remain valid after soft delete | Data integrity |
| **Reserved IDs protected** | Reserved IDs are never assigned to user entities | System integrity |
| **Prefix registry maintained** | Only registered prefixes are used | No collisions |

### 35.4 Soft Rules

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **Public IDs for all user-facing entities** | All entities visible to customers have public IDs | Default |
| **Display IDs for financial entities** | Orders, invoices, payments have display IDs | Financial entities |
| **Base32 for public IDs** | Use base32 encoding for readability | When generating public IDs |
| **6-digit zero-padding** | Display IDs use 6-digit zero-padded sequences | Display IDs |
| **Year-scoped sequences** | Sequences reset each calendar year | Display IDs |

---

## 36. Future Extensibility

### 36.1 What

How the identity system will evolve to support future features without breaking existing data.

### 36.2 Why

- **Planning:** Design with future in mind
- **Extensibility:** Identity system supports new entities without rewrites
- **Migration Path:** Clear upgrade path

### 36.3 Future Identity Extensions

| Feature | Identity Impact | Migration Strategy |
|---------|-----------------|-------------------|
| **Multi-vendor marketplace** | Add `Seller` entity with `SHOP_` prefix | New entity, new prefix |
| **International expansion** | Add locale-aware display IDs | Extend display ID format |
| **Subscription model** | Add `Subscription` entity with `SUBS_` prefix | New entity, new prefix |
| **Loyalty program** | Add `Points` entity with `PNTS_` prefix | New entity, new prefix |
| **Advanced analytics** | Add `AnalyticsEvent` entity with `ANEV_` prefix | New entity, new prefix |
| **Real-time inventory** | Add `InventoryLog` entity with `INVL_` prefix | New entity, new prefix |
| **Blockchain verification** | Add `VerificationToken` entity with `VFY_` prefix | New entity, new prefix |

### 36.4 New Entity Registration Process

| Step | Action | Rationale |
|------|--------|-----------|
| 1. **Register prefix** | Add new prefix to Section 8.3 | No collisions |
| 2. **Register in matrix** | Add entity to Section 9.3 | Complete reference |
| 3. **Define identity types** | Determine which ID types are needed | Appropriate coverage |
| 4. **Define cascade rules** | Determine parent-child relationships | Data integrity |
| 5. **Define reference rules** | Determine cross-module references | Clean boundaries |
| 6. **Update this document** | Add all registrations to this document | Single source of truth |

---

## 37. Mandatory Rules for AI Agents

### 37.1 What

Rules that every AI agent must follow when working with the Nabome codebase.

### 37.2 Why

- **Consistency:** Every AI agent produces identical patterns
- **Quality:** No AI-generated code violates the standards
- **Maintainability:** Human developers can trust AI-generated code

### 37.3 Mandatory Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never generate IDs manually** | Let Prisma generate UUIDs | Consistency, security |
| **Never expose internal UUIDs** | Use public IDs in API responses | Security |
| **Always use registered prefixes** | Only use prefixes from Section 8.3 | No collisions |
| **Always index FKs** | Every foreign key gets an index | Performance |
| **Always define cascade** | Every FK has `onDelete` strategy | Data integrity |
| **Always use soft delete** | `isActive = false`, never hard delete | Referential integrity |
| **Always add timestamps** | `createdAt` + `updatedAt` on all tables | Audit trail |
| **Always validate input** | Zod schema for every endpoint | Security |
| **Always use consistent naming** | Follow naming conventions in Section 23-34 | Predictability |
| **Always register new entities** | Add to identity matrix before implementation | Completeness |
| **Never assume entity structure** | Read existing patterns before creating new | Compatibility |
| **Never mix ID types** | Internal for DB, public for display | Security boundary |

---

## Appendix A: Quick Reference

### A.1 ID Type Selection Guide

```
Does the entity need an ID?
├── Yes, it's a database entity → Internal UUID (always)
├── Is it user-facing? → Add Public ID
├── Does it need sequential numbering? → Add Display ID
└── Does it need cross-system linking? → Use Reference IDs (computed)
```

### A.2 Prefix Quick Reference

| Prefix | Entity | Type |
|--------|--------|------|
| `USER_` | User | Public ID |
| `CUST_` | Customer | Public ID |
| `PROD_` | Product | Public ID |
| `PVNT_` | Product Variant | Public ID |
| `CTGR_` | Category | Public ID |
| `COLL_` | Collection | Public ID |
| `ORDR_` | Order | Public ID |
| `ORD-` | Order | Display ID |
| `INV-` | Invoice | Display ID |
| `PAYT_` | Payment | Public ID |
| `PAY-` | Payment | Display ID |
| `RETN_` | Return | Public ID |
| `RET-` | Return | Display ID |
| `REFD_` | Refund | Public ID |
| `RFD-` | Refund | Display ID |
| `MDIA_` | Media | Public ID |
| `BLOG_` | Blog Post | Public ID |
| `CMSP_` | CMS Page | Public ID |
| `NOTF_` | Notification | Public ID |
| `SUPC_` | Support Conversation | Public ID |
| `TKT-` | Support Ticket | Display ID |
| `ADLG_` | Audit Log | Public ID |
| `EXPT_` | Export File | Public ID |
| `EXP-` | Export | Display ID |

---

**Document Version:** 1.0
**Last Updated:** August 03, 2026
**Next Review:** September 03, 2026
