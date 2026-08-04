# নবME (Nabome) — Database Architecture & Data Modeling Standards

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for database design  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0) and FOLDER_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Database Philosophy](#1-database-philosophy)
2. [Schema Organization](#2-schema-organization)
3. [Module Separation](#3-module-separation)
4. [Table Ownership](#4-table-ownership)
5. [Entity Relationships](#5-entity-relationships)
6. [Primary Keys](#6-primary-keys)
7. [Foreign Key Rules](#7-foreign-key-rules)
8. [Normalization Strategy](#8-normalization-strategy)
9. [Denormalization Rules](#9-denormalization-rules)
10. [Indexing Strategy](#10-indexing-strategy)
11. [Constraints](#11-constraints)
12. [Soft Delete & Archive](#12-soft-delete--archive)
13. [Cascade Rules](#13-cascade-rules)
14. [Transactions](#14-transactions)
15. [Audit History](#15-audit-history)
16. [JSON Usage](#16-json-usage)
17. [Enum Standards](#17-enum-standards)
18. [Timestamps](#18-timestamps)
19. [Timezone, Currency & Locale](#19-timezone-currency--locale)
20. [Media Ownership](#20-media-ownership)
21. [Search Support](#21-search-support)
22. [Analytics & Reporting](#22-analytics--reporting)
23. [Finance & Order Integrity](#23-finance--order-integrity)
24. [Inventory Management](#24-inventory-management)
25. [Backup & Recovery](#25-backup--recovery)
26. [Data Retention](#26-data-retention)
27. [Performance Optimization](#27-performance-optimization)
28. [Scalability Patterns](#28-scalability-patterns)
29. [Naming Conventions](#29-naming-conventions)
30. [Architectural Rules](#30-architectural-rules)
31. [Future Expansion](#31-future-expansion)

---

## 1. Database Philosophy

### 1.1 What

The foundational principles guiding all database design decisions for the Nabome platform.

### 1.2 Why

- **Data Integrity First:** Correct data beats fast data — you can optimize later, but corrupted data is permanent
- **Beginner-Friendly Administration:** Schema should be understandable by developers at all levels
- **Minimal Redundancy:** No duplicate data unless performance demands it
- **Future-Proof:** Design for change — schema evolves without breaking existing data
- **Security by Default:** Row-Level Security (RLS) on every table, no exceptions

### 1.3 Where

Every table, column, index, and relationship in the database.

### 1.4 Core Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Explicit over implicit** | Always define constraints, defaults, and types explicitly | No magic — every behavior is visible in the schema |
| **Fail fast** | Constraints prevent bad data at the database level | Catch errors before they propagate to the application |
| **Immutable where possible** | Prefer append-only patterns for history | Audit trails should never be overwritten |
| **Lazy loading by default** | Relations are not loaded unless explicitly requested | Performance — avoid N+1 and over-fetching |
| **Soft delete over hard delete** | Use `isActive` flag, never delete rows with foreign references | Referential integrity preserved |

### 1.5 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hard delete rows with FK references | Breaks referential integrity | Use `isActive = false` |
| Use `deletedAt` timestamp | Adds complexity, queries harder | Use `isActive` boolean |
| Store computed values without invalidation | Data drift over time | Compute on read or use materialized views |
| Use `SELECT *` in application code | Fragile, breaks on schema changes | Use Prisma `select` or `include` |
| Skip indexes on foreign keys | Full table scans on joins | Index every FK column |
| Mix business and audit data in same table | Performance, maintenance burden | Separate audit_log table |

---

## 2. Schema Organization

### 2.1 What

How to organize the Prisma schema file for maximum clarity and maintainability.

### 2.2 Why

- **Readability:** Developers find what they need fast
- **Maintainability:** Changes don't cause merge conflicts
- **Clarity:** Domain boundaries are visible in the schema

### 2.3 Where

`prisma/schema.prisma`

### 2.4 Schema Structure

```prisma
// prisma/schema.prisma

// ─── Generator ──────────────────────────────────────────────
generator client {
  provider        = "prisma-client-js"
  binaryTargets   = ["native", "rhel-openssl-1.0.x"]
  previewFeatures = ["fullTextSearch"]
}

// ─── Data Source ────────────────────────────────────────────
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ──────────────────────────────────────────────────
enum UserRole {
  customer
  admin
}

enum OrderStatus {
  pending
  confirmed
  processing
  shipped
  delivered
  cancelled
  returned
  refunded
}

enum PaymentStatus {
  pending
  authorized
  captured
  failed
  refunded
  partially_refunded
}

enum Gender {
  men
  women
  unisex
}

// ─── Core Domain Models ─────────────────────────────────────
// User & Authentication
model User { ... }
model Session { ... }

// Product Catalog
model Product { ... }
model ProductVariant { ... }
model Category { ... }
model Collection { ... }
model Brand { ... }
model SizeGuide { ... }

// Shopping & Orders
model Cart { ... }
model CartItem { ... }
model Order { ... }
model OrderItem { ... }
model OrderStatusHistory { ... }

// Customer Data
model Address { ... }
model Wishlist { ... }
model Review { ... }

// CMS & Content
model CmsPage { ... }
model CmsSlide { ... }
model Media { ... }

// Coupons & Promotions
model Coupon { ... }

// Admin & Settings
model AdminSetting { ... }

// Audit
model AuditLog { ... }
```

### 2.5 Schema Organization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Group by domain** | Group models by business domain | Easy to find related models |
| **Enums first** | Define all enums before models | Clear type definitions |
| **Core before extended** | User, Product, Order before Wishlist, Review | Dependencies flow downward |
| **Comments for grouping** | Use `// ─── Domain ───` separators | Visual organization |
| **No empty lines between related models** | Keep related models adjacent | Shows relationships |

---

## 3. Module Separation

### 3.1 What

How database responsibilities map to application modules.

### 3.2 Why

- **Clear Ownership:** Every table has a clear owner
- **API Boundaries:** Handlers only touch their own domain tables
- **Future Separation:** Enables splitting into microservices if needed

### 3.3 Where

Database module structure maps to `api/_handlers/` and `src/features/`:

| Database Domain | API Handler | Frontend Feature |
|----------------|-------------|------------------|
| User & Auth | `api/_handlers/auth/` | `src/features/auth/` |
| Products & Catalog | `api/_handlers/products/` | `src/features/products/` |
| Cart | `api/_handlers/cart/` | `src/features/cart/` |
| Checkout & Orders | `api/_handlers/orders/` | `src/features/checkout/` |
| CMS & Content | `api/_handlers/cms/` | `src/features/cms/` |
| Admin | `api/_handlers/admin/` | `src/features/admin/` |

### 3.4 Module Ownership Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One domain, one owner** | Each table belongs to one handler domain | Clear responsibility |
| **No cross-domain queries** | Handlers only query their own tables | Prevents tight coupling |
| **Shared access via relations** | Other domains read via FK relations | Clean boundaries |
| **Cross-domain writes = shared lib** | Extract to `_lib/` if write is needed | Reusable, not duplicated |

### 3.5 Module Dependency Rules

```
┌─────────────────────────────────────────────────────────┐
│                    MODULE DEPENDENCY FLOW                  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              _handlers/ (Domain Handlers)           │  │
│  │                                                    │  │
│  │  handlers MAY query:                              │  │
│  │    ✓ Their own domain tables                      │  │
│  │    ✓ Related tables via FK (read only)            │  │
│  │    ✗ Other domain tables (NEVER)                  │  │
│  └────────────────────────────────────────────────────┘  │
│                          │                                │
│                          ▼                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │              _lib/ (Shared Utilities)               │  │
│  │                                                    │  │
│  │  lib MAY access:                                  │  │
│  │    ✓ Any table (for shared operations)            │  │
│  │    ✓ Cross-domain queries (for shared services)   │  │
│  │    ✗ Direct handler logic (NEVER)                 │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Table Ownership

### 4.1 What

Which application module owns which database table.

### 4.2 Why

- **Accountability:** Clear who is responsible for each table
- **Change Management:** Schema changes go through the right domain
- **Performance:** Query optimization is owned by the right team

### 4.3 Table Ownership Matrix

| Table | Domain Owner | Description |
|-------|--------------|-------------|
| `User` | Auth | User accounts and profiles |
| `Session` | Auth | Active user sessions |
| `Product` | Products | Product catalog |
| `ProductVariant` | Products | Size/color variations |
| `Category` | Products | Product categories |
| `Subcategory` | Products | Category hierarchy |
| `Collection` | Products | Curated product groups |
| `Brand` | Products | Brand information |
| `SizeGuide` | Products | Size charts |
| `Cart` | Cart | User shopping carts |
| `CartItem` | Cart | Cart line items |
| `Order` | Orders | Customer orders |
| `OrderItem` | Orders | Order line items |
| `OrderStatusHistory` | Orders | Order state transitions |
| `Address` | Auth | User addresses |
| `Wishlist` | Cart | Saved items |
| `Review` | Products | Product reviews |
| `Coupon` | Orders | Promotional codes |
| `CmsPage` | CMS | Static pages |
| `CmsSlide` | CMS | Homepage slides |
| `Media` | CMS | Uploaded files |
| `AdminSetting` | Admin | System configuration |
| `AuditLog` | Auth | Security audit trail |

### 4.4 Ownership Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Schema changes** | Only domain owner can modify table | Prevents accidental breaks |
| **New columns** | Domain owner proposes, team reviews | Maintainability |
| **New indexes** | Domain owner decides, DBA reviews | Performance |
| **Cross-domain reads** | Via FK relations or shared lib | Clean boundaries |
| **Cross-domain writes** | Extract to shared lib, never direct | Reusable logic |

---

## 5. Entity Relationships

### 5.1 What

How entities relate to each other in the Nabome schema.

### 5.2 Why

- **Data Integrity:** Relationships prevent orphaned records
- **Query Efficiency:** Understanding relationships enables better indexes
- **Business Logic:** Relationships encode business rules

### 5.3 Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    User      │       │   Product    │       │   Category   │
│──────────────│       │──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ name         │       │ name         │
│ role         │       │ slug         │       │ slug         │
└──────┬───────┘       │ categoryId ──│──────▶│ id           │
       │               │ brandId ─────│──┐    └──────────────┘
       │               └──────┬───────┘  │
       │                      │          │    ┌──────────────┐
       │                      ▼          │    │    Brand     │
       │               ┌──────────────┐  │    │──────────────│
       │               │ ProductVariant│  │    │ id (PK)      │
       │               │──────────────│  │    │ name         │
       │               │ id (PK)      │  │    └──────────────┘
       │               │ productId ───│──┘
       │               │ sku          │
       │               │ size         │
       │               └──────┬───────┘
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│    Cart      │       │   Wishlist   │
│──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │
│ profileId ───│──────▶│ profileId ───│──▶ User
│              │       │ variantId ───│──▶ ProductVariant
└──────┬───────┘       └──────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│  CartItem    │       │    Order     │
│──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │
│ cartId ──────│──▶ Cart│ profileId ───│──▶ User
│ variantId ───│──▶ Var │              │
└──────────────┘       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  OrderItem   │
                       │──────────────│
                       │ id (PK)      │
                       │ orderId ─────│──▶ Order
                       │ variantId ───│──▶ ProductVariant
                       └──────────────┘
```

### 5.4 Relationship Types

| Relationship | Type | Description | Example |
|--------------|------|-------------|---------|
| **One-to-One** | 1:1 | Single record on each side | User ↔ Cart |
| **One-to-Many** | 1:N | One parent, many children | User → Orders |
| **Many-to-One** | N:1 | Many records reference one parent | Product → Category |
| **Many-to-Many** | M:N | Requires junction table | Orders ↔ Products (via OrderItem) |

### 5.5 Relationship Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **FK always indexed** | Every FK column gets an index | Join performance |
| **Explicit relation** | Always define `@relation` with field names | Type safety in Prisma |
| **Nullable FKs** | Use optional FK when relationship is not required | Flexibility |
| **Composite FKs** | Avoid composite FKs when possible | Simpler queries |
| **Self-referential** | Use for hierarchical data (Category → Subcategory) | Tree structures |

---

## 6. Primary Keys

### 6.1 What

Standard for generating and using primary keys across all tables.

### 6.2 Why

- **Globally Unique:** UUIDs work across distributed systems
- **No Sequential Leaks:** Cannot guess next ID
- **Merge Safe:** No conflicts when merging databases
- **Type Safe:** UUID is a clear, unambiguous type

### 6.3 Standard

```prisma
model Product {
  id String @id @default(uuid())
  // ...
}
```

### 6.4 UUID v4 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always UUID v4** | Use `@default(uuid())` | Random, globally unique |
| **Never auto-increment** | No `SERIAL` or `AUTO_INCREMENT` | Security, distributed systems |
| **String type** | Use `String` in Prisma | UUID stored as string in Postgres |
| **No NULL IDs** | IDs are never nullable | Every row must have identity |
| **Immutable** | IDs never change after creation | Stable references |

### 6.5 UUID Generation

```typescript
// ✓ CORRECT: Prisma auto-generates UUIDs
const product = await db.product.create({
  data: {
    name: 'Premium Cotton T-Shirt',
    // id is auto-generated
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

### 6.6 When NOT to Use UUID

| Scenario | Alternative | Rationale |
|----------|-------------|-----------|
| **Order numbers** | Use sequential format like `ORD-2026-000001` | Human-readable, sortable |
| **SKU codes** | Use business-defined format like `TEE-BLK-M` | Business meaningful |
| **Slug URLs** | Use human-readable slugs | SEO friendly |
| **Invoice numbers** | Use sequential format like `INV-2026-000001` | Business requirement |

---

## 7. Foreign Key Rules

### 7.1 What

Standard for defining and using foreign key relationships.

### 7.2 Why

- **Referential Integrity:** Prevents orphaned records
- **Type Safety:** Prisma enforces FK types at compile time
- **Query Performance:** Proper FK indexes prevent full table scans

### 7.3 Standard FK Pattern

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

### 7.4 FK Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always nullable or has default** | FK columns must have defaults or be nullable | Zero-downtime migrations |
| **Always indexed** | Every FK column gets `@@index()` | Join performance |
| **Explicit @relation** | Always define field and references | Type safety |
| **onDelete strategy** | Define for every FK | Prevent accidental deletes |
| **No composite FKs** | Prefer separate FK columns | Simpler queries |
| **FK type matches PK** | FK type must match referenced PK type | Type safety |

### 7.5 FK Naming Convention

| Pattern | Example | Rationale |
|---------|---------|-----------|
| **Column name** | `categoryId` | Prisma convention |
| **Relation name** | `category` | Singular, camelCase |
| **Reverse relation** | `products Product[]` | Plural, array type |

### 7.6 FK Examples

```prisma
// ✓ CORRECT: Well-defined FK
model Order {
  id String @id @default(uuid())

  // User FK
  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Restrict)

  // Address FKs (nullable)
  shippingAddressId String?
  shippingAddress   Address? @relation(fields: [shippingAddressId], references: [id], onDelete: SetNull)

  billingAddressId String?
  billingAddress   Address? @relation(fields: [billingAddressId], references: [id], onDelete: SetNull)

  @@index([profileId])
  @@index([shippingAddressId])
  @@index([billingAddressId])
}

// ✗ WRONG: Missing index on FK
model Order {
  profileId String // No index!
  // ...
}

// ✗ WRONG: No onDelete strategy
model Order {
  profileId String
  profile   Profile @relation(fields: [profileId], references: [id]) // Missing onDelete!
}
```

---

## 8. Normalization Strategy

### 8.1 What

When to normalize data vs. when to denormalize for performance.

### 8.2 Why

- **Data Integrity:** Normalization prevents update anomalies
- **Performance:** Denormalization reduces join overhead
- **Balance:** Right level of normalization for the use case

### 8.3 Normalization Levels

| Level | Description | When to Use |
|-------|-------------|-------------|
| **1NF** | Atomic values, no repeating groups | Always required |
| **2NF** | No partial dependencies | Always required |
| **3NF** | No transitory dependencies | Default choice |
| **BCNF** | Every determinant is a candidate key | When anomalies matter |
| **Denormalized** | Intentional redundancy | Read-heavy, analytics |

### 8.4 Normalization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default to 3NF** | Normalize unless there's a reason not to | Data integrity |
| **Denormalize for reads** | Cache computed values in columns | Performance |
| **Denormalize for analytics** | Materialized views, summary tables | Query speed |
| **Never denormalize writes** | Don't duplicate write-heavy data | Consistency |
| **Document denormalization** | Comment why data is duplicated | Maintainability |

### 8.5 Normalization Examples

```prisma
// ✓ CORRECT: Normalized (3NF)
model Product {
  id         String  @id @default(uuid())
  name       String
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  // Category name stored in Category table, not Product
}

// ✓ CORRECT: Denormalized for performance
model Order {
  id            String  @id @default(uuid())
  profileId     String
  profile       Profile @relation(fields: [profileId], references: [id], onDelete: Restrict)

  // Denormalized: Customer name cached for order history
  // (avoids joining Profile table for every order query)
  customerEmail String
  customerName  String

  // Denormalized: Total cached for dashboard queries
  // (avoids summing OrderItems for every order)
  total         Decimal @db.Decimal(10, 2)
}

// ✗ WRONG: Over-normalization
model OrderItem {
  id        String @id @default(uuid())
  orderId   String
  productId String

  // Don't store product name here — it's in Product table
  productName String // WRONG: This is denormalization without justification
}
```

---

## 9. Denormalization Rules

### 9.1 What

When and how to intentionally duplicate data for performance.

### 9.2 Why

- **Read Performance:** Reduce joins for hot queries
- **Dashboard Speed:** Pre-computed aggregates for analytics
- **Offline Access:** Cached data for disconnected scenarios

### 9.3 When to Denormalize

| Scenario | What to Cache | Update Strategy |
|----------|---------------|-----------------|
| **Order history** | Customer name, email | Snapshot at order time |
| **Dashboard stats** | Revenue, order count | Periodic refresh (hourly/daily) |
| **Product listings** | Category name, brand name | Update on parent change |
| **Search results** | Denormalized text fields | Reindex on change |
| **Reporting** | Aggregated metrics | Materialized views |

### 9.4 Denormalization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Snapshot at creation** | Cache values when record is created | Immutable reference |
| **Document the why** | Comment why data is duplicated | Future maintainability |
| **Update on parent change** | Cascade updates for critical data | Consistency |
| **Never for write-heavy data** | Don't duplicate data that changes often | Performance |
| **Use materialized views** | For complex aggregations | Postgres handles refresh |

### 9.5 Denormalization Patterns

```prisma
// Pattern 1: Snapshot at creation
model Order {
  // Snapshot customer data at order time
  // (customer may change name/email later)
  customerEmail String
  customerName  String
  customerPhone String?

  // Snapshot address at order time
  // (address may be edited later)
  shippingAddressLine1 String
  shippingAddressLine2 String?
  shippingCity         String
  shippingState        String
  shippingPincode      String
  shippingCountry      String @default("IN")
}

// Pattern 2: Cached aggregates
model Product {
  // Cached counts for display
  reviewCount    Int @default(0)
  averageRating  Decimal @db.Decimal(3, 2) @default(0)
  totalSold      Int @default(0)

  // Updated via application logic or triggers
}

// Pattern 3: Materialized view for analytics
// (Not in Prisma schema — created via SQL migration)
// CREATE MATERIALIZED VIEW daily_sales AS
// SELECT
//   DATE(created_at) as date,
//   COUNT(*) as order_count,
//   SUM(total) as revenue
// FROM orders
// WHERE status != 'cancelled'
// GROUP BY DATE(created_at);
```

---

## 10. Indexing Strategy

### 10.1 What

Standard for creating and maintaining database indexes.

### 10.2 Why

- **Query Performance:** Indexes prevent full table scans
- **Join Performance:** FK indexes speed up joins
- **Filter Performance:** Composite indexes speed up WHERE clauses

### 10.3 Index Types

| Type | When to Use | Example |
|------|-------------|---------|
| **Single column** | FK columns, frequently filtered columns | `@@index([categoryId])` |
| **Composite** | Multi-column WHERE clauses | `@@index([isActive, categoryId])` |
| **Partial** | Filtered queries (e.g., active records only) | `WHERE isActive = true` |
| **Unique** | Business identifiers (slug, SKU, email) | `@unique` |
| **Full-text** | Text search (name, description) | `gin_trgm_ops` |
| **Covering** | Queries that only need indexed columns | Include frequently selected columns |

### 10.4 Index Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Index every FK** | All FK columns get `@@index()` | Join performance |
| **Index commonly filtered columns** | Status, type, category columns | Query performance |
| **Composite index order** | Put most selective column first | Index efficiency |
| **Don't over-index** | Each index slows writes | Write performance |
| **Monitor usage** | Remove unused indexes | Maintenance |
| **Use partial indexes** | For filtered queries (e.g., active only) | Smaller index size |

### 10.5 Index Strategy by Table

```prisma
// ─── User ──────────────────────────────────────────────
model User {
  id        String  @id @default(uuid())
  email     String  @unique
  role      UserRole
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())

  @@index([role])
  @@index([isActive])
  @@index([role, isActive])
  @@index([createdAt])
}

// ─── Product ────────────────────────────────────────────
model Product {
  id           String   @id @default(uuid())
  slug         String   @unique
  categoryId   String?
  brandId      String?
  isActive     Boolean  @default(true)
  isFeatured   Boolean  @default(false)
  isNew        Boolean  @default(false)
  gender       Gender
  basePrice    Decimal  @db.Decimal(10, 2)
  sortOrder    Int      @default(0)
  createdAt    DateTime @default(now())

  @@index([categoryId])
  @@index([brandId])
  @@index([isActive, isFeatured])
  @@index([isActive, isNew])
  @@index([isActive, gender, createdAt])
  @@index([isActive, categoryId, sortOrder])
  @@index([isActive, basePrice])
  @@index([createdAt])
}

// ─── Order ──────────────────────────────────────────────
model Order {
  id              String        @id @default(uuid())
  profileId       String
  status          OrderStatus
  paymentStatus   PaymentStatus
  createdAt       DateTime      @default(now())
  razorpayOrderId String?
  razorpayPaymentId String?

  @@index([profileId])
  @@index([status, createdAt])
  @@index([paymentStatus, createdAt])
  @@index([profileId, status])
  @@index([razorpayOrderId])
  @@index([razorpayPaymentId])
  @@index([status, paymentStatus])
  @@index([createdAt])
}

// ─── Full-Text Search Index ──────────────────────────────
// Created via SQL migration (not Prisma):
// CREATE EXTENSION IF NOT EXISTS pg_trgm;
// CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
// CREATE INDEX idx_products_desc_trgm ON products USING gin(description gin_trgm_ops);
```

### 10.6 Index Naming Convention

| Pattern | Example | Rationale |
|---------|---------|-----------|
| **Auto-generated** | `products_categoryId_idx` | Prisma naming |
| **Unique** | `products_slug_key` | Prisma naming |
| **Composite** | `products_isActive_categoryId_idx` | Prisma naming |
| **Full-text** | `idx_products_name_trgm` | SQL naming |

### 10.7 Performance Monitoring

```sql
-- Find unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_tables
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find slow queries
SELECT
  query,
  calls,
  total_exec_time,
  mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Check index usage
SELECT
  indexrelname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 11. Constraints

### 11.1 What

Standard for database constraints that enforce data integrity.

### 11.2 Why

- **Data Quality:** Constraints prevent bad data at the database level
- **Business Rules:** Enforce business logic in the schema
- **Type Safety:** Ensure data matches expected formats

### 11.3 Constraint Types

| Constraint | When to Use | Example |
|------------|-------------|---------|
| **Primary Key** | Every table | `@id @default(uuid())` |
| **Foreign Key** | Every relationship | `@relation(fields: [categoryId], references: [id])` |
| **Unique** | Business identifiers | `@unique` on slug, SKU, email |
| **Not Null** | Required fields | Remove `?` from column type |
| **Check** | Business rules | `stock >= 0` |
| **Default** | Required fields with defaults | `@default(true)` |

### 11.4 Constraint Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Unique slugs** | All slugs must be unique | URL integrity |
| **Unique SKUs** | All SKUs must be unique | Inventory integrity |
| **Unique emails** | All emails must be unique | User identity |
| **Positive stock** | Stock cannot be negative | Business rule |
| **Valid prices** | Prices must be positive | Business rule |
| **Valid email format** | Use application-level validation | Database can't validate format |
| **Valid phone format** | Use application-level validation | Database can't validate format |

### 11.5 Constraint Examples

```prisma
// ✓ CORRECT: Well-constrained model
model Product {
  id        String  @id @default(uuid())
  name      String  @db.VarChar(300)
  slug      String  @unique @db.VarChar(300)
  basePrice Decimal @db.Decimal(10, 2)
  isActive  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ✓ CORRECT: Unique constraint on SKU
model ProductVariant {
  id        String  @id @default(uuid())
  productId String
  sku       String  @unique
  size      String  @db.VarChar(50)
  color     String  @db.VarChar(100)
  stock     Int     @default(0)

  @@unique([productId, size, color])
}

// ✗ WRONG: Missing unique constraint on slug
model Product {
  slug String // No unique constraint!
}

// ✗ WRONG: No check constraint on stock
model ProductVariant {
  stock Int // Can be negative!
}
```

---

## 12. Soft Delete & Archive

### 12.1 What

Standard for soft deleting records instead of hard deleting.

### 12.2 Why

- **Referential Integrity:** Deleted records don't break FK references
- **Audit Trail:** Historical data is preserved
- **Recovery:** Accidental deletes can be undone
- **Analytics:** Historical data available for reporting

### 12.3 Standard Pattern

```prisma
model Product {
  id       String  @id @default(uuid())
  name     String
  isActive Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 12.4 Soft Delete Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use `isActive` boolean** | Not `deletedAt` timestamp | Simpler queries |
| **Default to `true`** | New records are active | No accidental deletes |
| **Never hard delete** | Keep all records | Referential integrity |
| **Index `isActive`** | Partial index for active records | Query performance |
| **Filter by default** | Always filter `isActive: true` | Show only active records |
| **Admin can restore** | Set `isActive = true` | Undo accidental deletes |

### 12.5 Archive Strategy

| Scenario | Strategy | Rationale |
|----------|----------|-----------|
| **Soft delete** | Set `isActive = false` | Default for all records |
| **Archive old orders** | Move to `orders_archive` table | Performance for large datasets |
| **Archive old sessions** | Delete after 30 days | Security, storage |
| **Archive old audit logs** | Move to `audit_log_archive` table | Performance |

### 12.6 Soft Delete Examples

```typescript
// ✓ CORRECT: Query with soft delete filter
const products = await db.product.findMany({
  where: {
    isActive: true, // Always filter active records
  },
});

// ✓ CORRECT: Soft delete
await db.product.update({
  where: { id: productId },
  data: { isActive: false },
});

// ✗ WRONG: Hard delete
await db.product.delete({
  where: { id: productId },
});

// ✓ CORRECT: Admin restore
await db.product.update({
  where: { id: productId },
  data: { isActive: true },
});

// ✓ CORRECT: Check if record exists (including inactive)
const product = await db.product.findUnique({
  where: { id: productId },
});
if (!product) {
  throw new NotFoundError('Product');
}
// Product exists but may be inactive
if (!product.isActive) {
  throw new AppError('PRODUCT_INACTIVE', 410, 'Product is no longer available');
}
```

---

## 13. Cascade Rules

### 13.1 What

Standard for what happens when a parent record is deleted or updated.

### 13.2 Why

- **Data Integrity:** Prevent orphaned records
- **Business Logic:** Enforce business rules at the database level
- **Safety:** Prevent accidental data loss

### 13.3 Cascade Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **Cascade** | Delete children when parent is deleted | Product → ProductVariant |
| **Restrict** | Prevent parent delete if children exist | User → Order |
| **SetNull** | Set FK to NULL when parent is deleted | Product → Category |
| **NoAction** | Similar to Restrict, but checked later | Default for most FKs |

### 13.4 Cascade Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Cascade for ownership** | Delete children when owner is deleted | Clean deletion |
| **Restrict for transactions** | Prevent delete if financial records exist | Data integrity |
| **SetNull for optional references** | Clear reference when parent is deleted | Flexibility |
| **Never cascade for audit logs** | Audit logs must never be deleted | Compliance |
| **Document cascade choices** | Comment why cascade strategy was chosen | Maintainability |

### 13.5 Cascade Examples

```prisma
// ✓ CORRECT: Cascade delete for ownership
model Product {
  id       String @id @default(uuid())
  variants ProductVariant[] @relation onDelete: Cascade
}

model ProductVariant {
  id        String @id @default(uuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}

// ✓ CORRECT: Restrict for financial records
model Order {
  id        String @id @default(uuid())
  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Restrict)
}

// ✓ CORRECT: SetNull for optional references
model Product {
  id         String     @id @default(uuid())
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
}

// ✗ WRONG: Cascade delete for orders
model Profile {
  orders Order[] @relation onDelete: Cascade // WRONG! Never cascade orders
}

// ✗ WRONG: SetNull for order items
model Order {
  items OrderItem[] @relation onDelete: SetNull // WRONG! Never lose order items
}
```

### 13.6 Cascade Matrix

| Parent | Child | Strategy | Rationale |
|--------|-------|----------|-----------|
| User | Profile | Cascade | User owns profile |
| User | Session | Cascade | User owns sessions |
| User | Address | Cascade | User owns addresses |
| User | Cart | Cascade | User owns cart |
| User | Wishlist | Cascade | User owns wishlist |
| User | Order | Restrict | Never delete user with orders |
| User | Review | Restrict | Never delete user with reviews |
| Product | ProductVariant | Cascade | Product owns variants |
| Product | ProductImage | Cascade | Product owns images |
| Product | Review | Restrict | Never delete product with reviews |
| Category | Product | SetNull | Product can exist without category |
| Collection | Product | SetNull | Product can exist without collection |
| Brand | Product | SetNull | Product can exist without brand |
| Order | OrderItem | Cascade | Order owns items |
| Order | OrderStatusHistory | Cascade | Order owns history |
| Cart | CartItem | Cascade | Cart owns items |
| Coupon | Order | Restrict | Never delete coupon with orders |

---

## 14. Transactions

### 14.1 What

Standard for using database transactions to ensure data consistency.

### 14.2 Why

- **Atomicity:** All operations succeed or all fail
- **Consistency:** Database stays in a valid state
- **Isolation:** Concurrent transactions don't interfere
- **Durability:** Committed data survives crashes

### 14.3 Transaction Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use for multi-table writes** | Wrap related writes in transaction | Atomicity |
| **Keep transactions short** | Don't hold locks long | Performance |
| **Don't read in transaction** | Minimize reads inside transaction | Isolation |
| **Handle deadlocks** | Retry on deadlock error | Resilience |
| **Use Prisma `$transaction`** | Use Prisma's transaction API | Type safety |

### 14.4 Transaction Patterns

```typescript
// ✓ CORRECT: Multi-table write in transaction
await db.$transaction(async (tx) => {
  // 1. Create order
  const order = await tx.order.create({
    data: {
      profileId,
      status: 'pending',
      total: cartTotal,
    },
  });

  // 2. Create order items
  for (const item of cartItems) {
    await tx.orderItem.create({
      data: {
        orderId: order.id,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
      },
    });
  }

  // 3. Update inventory
  for (const item of cartItems) {
    await tx.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: { decrement: item.quantity },
        reservedStock: { increment: item.quantity },
      },
    });
  }

  // 4. Clear cart
  await tx.cartItem.deleteMany({
    where: { cartId: cartId },
  });

  return order;
});

// ✗ WRONG: Multiple separate writes without transaction
const order = await db.order.create({ data: { ... } });
for (const item of cartItems) {
  await db.orderItem.create({ data: { ... } }); // What if this fails?
}
await db.productVariant.update({ data: { stock: { decrement: 1 } } }); // Orphaned order!
```

### 14.5 Transaction Isolation Levels

| Level | When to Use | Prisma Support |
|-------|-------------|----------------|
| **Read Committed** | Default, most cases | Yes |
| **Repeatable Read** | When you need consistent reads | Yes |
| **Serializable** | When you need strict isolation | Yes |

```typescript
// ✓ CORRECT: Using transaction isolation level
await db.$transaction(
  async (tx) => {
    // High-isolation transaction
  },
  {
    isolationLevel: 'Serializable',
  }
);
```

---

## 15. Audit History

### 15.1 What

Standard for tracking changes to sensitive data.

### 15.2 Why

- **Compliance:** Meet regulatory requirements
- **Security:** Track unauthorized access attempts
- **Debugging:** Understand what happened and when
- **Accountability:** Track who did what

### 15.3 Audit Log Schema

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  event      String   @db.VarChar(100)
  userId     String?
  ip         String?  @db.VarChar(45)
  userAgent  String?
  resource   String   @db.VarChar(100)
  resourceId String?
  changes    Json?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([resource, resourceId])
  @@index([createdAt])
  @@index([event])
}
```

### 15.4 Audit Events

| Event | Resource | Changes | Rationale |
|-------|----------|---------|-----------|
| `USER_LOGIN` | User | - | Track access |
| `USER_LOGIN_FAILED` | User | - | Detect attacks |
| `USER_LOGOUT` | User | - | Track session end |
| `PASSWORD_CHANGED` | User | - | Security event |
| `EMAIL_CHANGED` | User | `{ email: [old, new] }` | Security event |
| `ORDER_CREATED` | Order | `{ amount: total }` | Business event |
| `ORDER_STATUS_CHANGED` | Order | `{ status: [old, new] }` | Business event |
| `PAYMENT_PROCESSED` | Order | `{ paymentId, amount }` | Financial event |
| `PRODUCT_UPDATED` | Product | `{ field: [old, new] }` | Admin action |
| `COUPON_CREATED` | Coupon | `{ code, discount }` | Admin action |

### 15.5 Audit Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Log all auth events** | Login, logout, password change | Security |
| **Log all financial events** | Orders, payments, refunds | Compliance |
| **Log all admin actions** | CRUD operations on sensitive data | Accountability |
| **Never log secrets** | No passwords, tokens, API keys | Security |
| **Immutable** | Audit logs are append-only | Compliance |
| **Retention** | Keep audit logs for 7 years | Legal requirement |

### 15.6 Audit Logger Implementation

```typescript
// ✓ CORRECT: Audit logging
export class AuditLogger {
  constructor(private db: PrismaClient) {}

  async log(event: AuditEvent): Promise<void> {
    await this.db.auditLog.create({
      data: {
        event: event.type,
        userId: event.userId,
        ip: event.ip,
        userAgent: event.userAgent,
        resource: event.resource,
        resourceId: event.resourceId,
        changes: event.changes,
        timestamp: new Date(),
      },
    });
  }
}

// Usage
await auditLogger.log({
  type: 'ORDER_CREATED',
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
  resource: 'Order',
  resourceId: order.id,
  changes: { amount: order.total },
});
```

---

## 16. JSON Usage

### 16.1 What

Standard for using JSONB columns in PostgreSQL.

### 16.2 Why

- **Flexibility:** Store structured data without schema changes
- **Performance:** JSONB is indexable and queryable
- **Extensibility:** Add new fields without migrations

### 16.3 When to Use JSON

| Use Case | Example | Rationale |
|----------|---------|-----------|
| **User preferences** | `preferences JSONB` | Flexible settings |
| **Product metadata** | `meta JSONB` | SEO, custom attributes |
| **Order metadata** | `metadata JSONB` | Payment details, notes |
| **CMS content** | `content JSONB` | Flexible page structure |
| **Form submissions** | `data JSONB` | Variable form fields |

### 16.4 JSON Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use JSONB** | Not JSON | Indexable, queryable |
| **Validate at app level** | Use Zod schema before writing | Data integrity |
| **Don't query JSON often** | Use for storage, not frequent queries | Performance |
| **Index if queried** | GIN index for frequent JSON queries | Query performance |
| **Document structure** | Comment expected JSON shape | Maintainability |

### 16.5 JSON Examples

```prisma
// ✓ CORRECT: JSONB for flexible data
model User {
  id          String  @id @default(uuid())
  preferences JSONB?
  // Expected shape: { theme: 'light' | 'dark', language: 'en' | 'hi', currency: 'INR' }
}

model Product {
  id   String @id @default(uuid())
  meta JSONB?
  // Expected shape: { title: string, description: string, keywords: string[] }
}

model Order {
  id       String @id @default(uuid())
  metadata JSONB?
  // Expected shape: { paymentMethod: string, razorpayOrderId: string, notes: string }
}

// ✓ CORRECT: Querying JSON
const users = await db.user.findMany({
  where: {
    preferences: {
      path: ['theme'],
      equals: 'dark',
    },
  },
});

// ✓ CORRECT: Updating JSON
await db.user.update({
  where: { id: userId },
  data: {
    preferences: {
      theme: 'dark',
      language: 'hi',
    },
  },
});

// ✗ WRONG: Using JSON instead of JSONB
model User {
  preferences Json? // Use JSONB instead
}

// ✗ WRONG: Querying JSON too frequently
// Don't use JSON for data you query on every request
```

---

## 17. Enum Standards

### 17.1 What

Standard for using Prisma enums for fixed sets of values.

### 17.2 Why

- **Type Safety:** Compile-time validation of enum values
- **Database Integrity:** Database enforces valid values
- **Code Completion:** IDEs provide autocomplete for enum values

### 17.3 Standard Enums

```prisma
enum UserRole {
  customer
  admin
}

enum OrderStatus {
  pending
  confirmed
  processing
  shipped
  delivered
  cancelled
  returned
  refunded
}

enum PaymentStatus {
  pending
  authorized
  captured
  failed
  refunded
  partially_refunded
}

enum PaymentMethod {
  razorpay
  cod
  upi
  netbanking
}

enum Gender {
  men
  women
  unisex
}

enum CouponType {
  percentage
  fixed
  free_shipping
}

enum ReviewStatus {
  pending
  approved
  rejected
}
```

### 17.4 Enum Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use Prisma enums** | Not VARCHAR with CHECK | Type safety |
| **Lowercase values** | `men` not `Men` | Consistency |
| **No spaces** | `free_shipping` not `free shipping` | Usability |
| **Add new values carefully** | Never remove values | Backward compatibility |
| **Default values** | Always provide defaults | Prevent NULL |
| **Document values** | Comment what each value means | Maintainability |

### 17.5 Enum Examples

```typescript
// ✓ CORRECT: Using enums in application code
const order = await db.order.create({
  data: {
    status: 'pending', // Type-safe
  },
});

// ✓ CORRECT: Filtering by enum
const pendingOrders = await db.order.findMany({
  where: {
    status: 'pending',
  },
});

// ✓ CORRECT: Updating enum value
await db.order.update({
  where: { id: orderId },
  data: {
    status: 'shipped',
  },
});

// ✗ WRONG: Using string instead of enum
const order = await db.order.create({
  data: {
    status: 'PENDING', // Wrong case
  },
});

// ✗ WRONG: Hardcoding enum values
const statuses = ['pending', 'confirmed', 'processing']; // Use enum from Prisma
```

---

## 18. Timestamps

### 18.1 What

Standard for using timestamps in all tables.

### 18.2 Why

- **Audit Trail:** Track when records were created and updated
- **Debugging:** Understand when changes happened
- **Analytics:** Time-based queries and reporting

### 18.3 Standard Timestamps

```prisma
model Product {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 18.4 Timestamp Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always include** | Every table has `createdAt` + `updatedAt` | Audit trail |
| **Use `now()` default** | `@default(now())` for `createdAt` | Auto-populate |
| **Use `@updatedAt`** | Auto-update on change | No manual updates |
| **Use TIMESTAMPTZ** | Store with timezone | Avoid timezone confusion |
| **UTC storage** | Always store UTC | Consistency |
| **Convert on display** | Convert to local timezone in UI | User experience |

### 18.5 Timestamp Examples

```prisma
// ✓ CORRECT: Standard timestamps
model Order {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ✓ CORRECT: Additional timestamps for business events
model Order {
  id          String    @id @default(uuid())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  shippedAt   DateTime?
  deliveredAt DateTime?
  cancelledAt DateTime?
}

// ✗ WRONG: Missing timestamps
model Product {
  id   String @id @default(uuid())
  name String
  // No timestamps!
}

// ✗ WRONG: Using Date instead of DateTime
model Product {
  createdAt Date @default(now()) // Use DateTime
}
```

---

## 19. Timezone, Currency & Locale

### 19.1 What

Standard for handling timezone, currency, and locale in the database.

### 19.2 Why

- **Global Consistency:** Avoid timezone confusion
- **Financial Accuracy:** Correct currency handling
- **Localization:** Support for multiple languages

### 19.3 Timezone Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Store UTC** | All timestamps in UTC | Consistency |
| **Display local** | Convert to user's timezone in UI | User experience |
| **Use TIMESTAMPTZ** | PostgreSQL `TIMESTAMPTZ` type | Automatic conversion |
| **Never store local time** | Always convert to UTC first | Avoid ambiguity |

### 19.4 Currency Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default INR** | Indian Rupee for India market | Business requirement |
| **DECIMAL(10,2)** | For all currency fields | Exact precision |
| **Store currency code** | `currency VARCHAR(3) DEFAULT 'INR'` | Multi-currency ready |
| **Never use FLOAT** | Floating point loses precision | Financial accuracy |

```prisma
model Product {
  id        String  @id @default(uuid())
  basePrice Decimal @db.Decimal(10, 2)
  currency  String  @default("INR") @db.VarChar(3)
}

model Order {
  id            String  @id @default(uuid())
  subtotal      Decimal @db.Decimal(10, 2)
  shippingCost  Decimal @db.Decimal(10, 2) @default(0)
  tax           Decimal @db.Decimal(10, 2) @default(0)
  discount      Decimal @db.Decimal(10, 2) @default(0)
  total         Decimal @db.Decimal(10, 2)
  currency      String  @default("INR") @db.VarChar(3)
}
```

### 19.5 Locale Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default en-IN** | English (India) for now | Business requirement |
| **Store locale** | User's preferred language | Future localization |
| **Use ISO codes** | `en-IN`, `hi-IN`, etc. | Standard format |

---

## 20. Media Ownership

### 20.1 What

Standard for storing and managing media files.

### 20.2 Why

- **Organization:** Clear ownership of media files
- **Performance:** Fast image loading with CDN
- **Security:** Controlled access to private files

### 20.3 Media Schema

```prisma
model Media {
  id         String   @id @default(uuid())
  url        String
  alt        String?
  width      Int?
  height     Int?
  filesize   Int?
  mimetype   String
  folder     String   @db.VarChar(100)
  createdAt  DateTime @default(now())

  @@index([folder])
}
```

### 20.4 Media Ownership Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Product images** | Via `ProductImage` relation | Product owns images |
| **User avatars** | Via `User.avatarUrl` | User owns avatar |
| **CMS media** | Via `CmsSlide` or `CmsPage` | Content owns media |
| **Upload validation** | Validate type, size, dimensions | Security |
| **CDN delivery** | Use Cloudflare R2 + CDN | Performance |

### 20.5 Media Examples

```prisma
// ✓ CORRECT: Product images via junction table
model Product {
  id       String         @id @default(uuid())
  images   ProductImage[]
}

model ProductImage {
  id        String  @id @default(uuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  mediaId   String
  media     Media   @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  sortOrder Int     @default(0)

  @@index([productId])
  @@index([mediaId])
}

// ✓ CORRECT: User avatar via URL
model User {
  id        String  @id @default(uuid())
  avatarUrl String?
}
```

---

## 21. Search Support

### 21.1 What

Standard for implementing full-text search in PostgreSQL.

### 21.2 Why

- **Performance:** PostgreSQL's `pg_trgm` is fast and accurate
- **Relevance:** Trigram-based search is context-aware
- **Cost-effective:** No external search service needed initially

### 21.3 Search Schema

```sql
-- Enable trigram extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create search indexes
CREATE INDEX idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_products_desc_trgm ON products USING gin(description gin_trgm_ops);
CREATE INDEX idx_products_material_trgm ON products USING gin(material gin_trgm_ops);
```

### 21.4 Search Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use pg_trgm** | For text search | Fast, accurate |
| **GIN indexes** | For trigram search | Performance |
| **Fuzzy matching** | Handle typos | User experience |
| **Weight results** | Name > Description > Material | Relevance |
| **Limit results** | Paginate search results | Performance |

### 21.5 Search Examples

```typescript
// ✓ CORRECT: Full-text search with pg_trgm
const searchProducts = async (query: string) => {
  const products = await db.$queryRaw`
    SELECT
      id,
      name,
      description,
      similarity(name, ${query}) as name_score,
      similarity(description, ${query}) as desc_score
    FROM products
    WHERE
      isActive = true
      AND (
        name % ${query}
        OR description % ${query}
      )
    ORDER BY
      (similarity(name, ${query}) * 0.7 +
       similarity(description, ${query}) * 0.3) DESC
    LIMIT 20
  `;
  return products;
};

// ✓ CORRECT: Search with filters
const searchWithFilters = async (
  query: string,
  filters: { categoryId?: string; gender?: Gender; minPrice?: number; maxPrice?: number }
) => {
  const products = await db.$queryRaw`
    SELECT
      p.*,
      similarity(p.name, ${query}) as relevance
    FROM products p
    WHERE
      p.is_active = true
      AND (
        p.name % ${query}
        OR p.description % ${query}
      )
      ${filters.categoryId ? sql`AND p.category_id = ${filters.categoryId}` : sql``}
      ${filters.gender ? sql`AND p.gender = ${filters.gender}` : sql``}
      ${filters.minPrice ? sql`AND p.base_price >= ${filters.minPrice}` : sql``}
      ${filters.maxPrice ? sql`AND p.base_price <= ${filters.maxPrice}` : sql``}
    ORDER BY relevance DESC
    LIMIT 20
  `;
  return products;
};
```

---

## 22. Analytics & Reporting

### 22.1 What

Standard for supporting analytics and reporting queries.

### 22.2 Why

- **Business Intelligence:** Understand sales, customers, products
- **Performance:** Pre-computed aggregates for fast dashboards
- **Scalability:** Materialized views for complex queries

### 22.3 Analytics Schema

```sql
-- Daily sales summary (materialized view)
CREATE MATERIALIZED VIEW daily_sales AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(total) as revenue,
  AVG(total) as avg_order_value,
  COUNT(DISTINCT profile_id) as unique_customers
FROM orders
WHERE status != 'cancelled'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Refresh daily
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;
```

### 22.4 Analytics Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use materialized views** | For complex aggregations | Performance |
| **Refresh periodically** | Daily for sales, hourly for real-time | Fresh data |
| **Don't query raw data** | Use pre-computed aggregates | Speed |
| **Separate analytics DB** | For heavy reporting queries | Don't impact production |

### 22.5 Dashboard Metrics

| Metric | Source | Refresh Rate |
|--------|--------|--------------|
| **Total Revenue** | `daily_sales` view | Daily |
| **Order Count** | `daily_sales` view | Daily |
| **Avg Order Value** | `daily_sales` view | Daily |
| **Top Products** | `product_analytics` view | Hourly |
| **Customer Segments** | `customer_segments` view | Daily |
| **Conversion Funnel** | `conversion_funnel` view | Hourly |

---

## 23. Finance & Order Integrity

### 23.1 What

Standard for ensuring financial data integrity.

### 23.2 Why

- **Compliance:** Financial regulations require accurate records
- **Auditability:** Track all financial transactions
- **Accuracy:** Prevent financial discrepancies

### 23.3 Finance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **DECIMAL for money** | `DECIMAL(10,2)` for all amounts | Exact precision |
| **Never use FLOAT** | Floating point loses precision | Financial accuracy |
| **Immutable amounts** | Order amounts never change | Audit trail |
| **Snapshot customer data** | Cache customer info at order time | Historical accuracy |
| **Track refunds** | Store refund amount and reason | Compliance |

### 23.4 Order Integrity

```prisma
model Order {
  id              String        @id @default(uuid())
  orderNumber     String        @unique
  profileId       String
  profile         Profile       @relation(fields: [profileId], references: [id], onDelete: Restrict)

  // Financial data (immutable after creation)
  subtotal        Decimal       @db.Decimal(10, 2)
  shippingCost    Decimal       @db.Decimal(10, 2) @default(0)
  tax             Decimal       @db.Decimal(10, 2) @default(0)
  discount        Decimal       @db.Decimal(10, 2) @default(0)
  total           Decimal       @db.Decimal(10, 2)
  currency        String        @default("INR") @db.VarChar(3)

  // Payment tracking
  paymentMethod   String?
  paymentStatus   PaymentStatus @default(pending)
  razorpayOrderId String?
  razorpayPaymentId String?

  // Snapshot customer data (for historical accuracy)
  customerEmail   String
  customerName    String
  customerPhone   String?

  // Snapshot address (for historical accuracy)
  shippingAddress Json
  billingAddress  Json?

  @@index([profileId])
  @@index([orderNumber])
  @@index([status, createdAt])
  @@index([paymentStatus, createdAt])
}
```

### 23.5 Refund Handling

```prisma
model Order {
  // Refund tracking
  refundedAt        DateTime?
  refundAmount      Decimal?    @db.Decimal(10, 2)
  refundReason      String?
  razorpayRefundId  String?
}
```

---

## 24. Inventory Management

### 24.1 What

Standard for managing product inventory.

### 24.2 Why

- **Accuracy:** Prevent overselling
- **Performance:** Fast stock checks
- **Scalability:** Handle high-concurrency scenarios

### 24.3 Inventory Schema

```prisma
model ProductVariant {
  id            String  @id @default(uuid())
  productId     String
  sku           String  @unique
  stock         Int     @default(0)
  reservedStock Int     @default(0)

  // Computed available stock
  // availableStock = stock - reservedStock

  @@index([productId, isActive])
  @@index([isActive, stock])
}
```

### 24.4 Inventory Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Track stock per variant** | Each size/color has its own stock | Accuracy |
| **Reserve on order** | Increment `reservedStock` on checkout | Prevent overselling |
| **Release on cancel** | Decrement `reservedStock` on cancel | Free up stock |
| **Decrement on ship** | Decrement `stock` on shipment | Final deduction |
| **Negative stock check** | Prevent `stock < 0` | Business rule |

### 24.5 Inventory Operations

```typescript
// ✓ CORRECT: Reserve stock during checkout
await db.$transaction(async (tx) => {
  // Check available stock
  const variant = await tx.productVariant.findUnique({
    where: { id: variantId },
  });

  if (variant.stock - variant.reservedStock < quantity) {
    throw new AppError('INSUFFICIENT_STOCK', 400, 'Insufficient stock');
  }

  // Reserve stock
  await tx.productVariant.update({
    where: { id: variantId },
    data: {
      reservedStock: { increment: quantity },
    },
  });
});

// ✓ CORRECT: Release stock on cancel
await db.$transaction(async (tx) => {
  await tx.productVariant.update({
    where: { id: variantId },
    data: {
      reservedStock: { decrement: quantity },
    },
  });
});

// ✓ CORRECT: Deduct stock on shipment
await db.$transaction(async (tx) => {
  await tx.productVariant.update({
    where: { id: variantId },
    data: {
      stock: { decrement: quantity },
      reservedStock: { decrement: quantity },
    },
  });
});
```

---

## 25. Backup & Recovery

### 25.1 What

Standard for database backup and recovery.

### 25.2 Why

- **Disaster Recovery:** Protect against data loss
- **Compliance:** Regulatory requirements
- **Business Continuity:** Minimal downtime

### 25.3 Backup Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Daily backups** | Automated daily backups | Protection |
| **Point-in-time recovery** | Enable WAL archiving | Granular recovery |
| **Off-site storage** | Store backups in different region | Disaster recovery |
| **Test restores** | Regularly test backup restores | Verify integrity |
| **Retention policy** | Keep backups for 30 days | Cost management |

### 25.4 Recovery Procedures

| Scenario | Recovery Time | Recovery Point |
|----------|---------------|----------------|
| **Accidental delete** | Minutes | Last transaction |
| **Data corruption** | Hours | Last backup |
| **Server failure** | Minutes | Last backup |
| **Region failure** | Hours | Last backup |

---

## 26. Data Retention

### 26.1 What

Standard for how long to keep different types of data.

### 26.2 Why

- **Compliance:** Legal requirements
- **Performance:** Remove old data for speed
- **Cost:** Storage costs money

### 26.3 Retention Rules

| Data Type | Retention | Action | Rationale |
|-----------|-----------|--------|-----------|
| **Active orders** | Indefinite | Keep | Business requirement |
| **Cancelled orders** | 7 years | Archive | Tax compliance |
| **User accounts** | Indefinite | Keep | Business requirement |
| **Sessions** | 30 days | Delete | Security |
| **Audit logs** | 7 years | Archive | Compliance |
| **Cart data** | 90 days | Delete | Cleanup |
| **Wishlist data** | Indefinite | Keep | User experience |
| **Reviews** | Indefinite | Keep | Content |
| **CMS content** | Indefinite | Keep | Content |

### 26.4 Retention Implementation

```typescript
// ✓ CORRECT: Cleanup old sessions
const cleanupSessions = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await db.session.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });
};

// ✓ CORRECT: Archive old orders
const archiveOrders = async () => {
  const sevenYearsAgo = new Date();
  sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

  // Move to archive table
  await db.$executeRaw`
    INSERT INTO orders_archive
    SELECT * FROM orders
    WHERE status = 'cancelled'
    AND created_at < ${sevenYearsAgo}
  `;

  // Delete from main table
  await db.order.deleteMany({
    where: {
      status: 'cancelled',
      createdAt: {
        lt: sevenYearsAgo,
      },
    },
  });
};
```

---

## 27. Performance Optimization

### 27.1 What

Standard for optimizing database performance.

### 27.2 Why

- **Speed:** Fast queries improve user experience
- **Scalability:** Efficient queries handle more load
- **Cost:** Less resource usage saves money

### 27.3 Performance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use Prisma select** | Don't fetch unnecessary columns | Reduce data transfer |
| **Use Prisma include** | Don't N+1 query | Reduce query count |
| **Paginate results** | Always use `take` and `skip` | Prevent large result sets |
| **Use indexes** | Index all FK and filter columns | Query speed |
| **Avoid raw SQL** | Use Prisma's type-safe queries | Maintainability |
| **Use connection pooling** | Hyperdrive for connection pooling | Performance |

### 27.4 Query Optimization Examples

```typescript
// ✓ CORRECT: Use select to fetch only needed columns
const products = await db.product.findMany({
  select: {
    id: true,
    name: true,
    slug: true,
    basePrice: true,
  },
  where: {
    isActive: true,
  },
  take: 20,
});

// ✓ CORRECT: Use include for relations
const products = await db.product.findMany({
  select: {
    id: true,
    name: true,
    category: {
      select: { name: true },
    },
    variants: {
      select: { id: true, size: true, color: true, stock: true },
      where: { isActive: true },
    },
  },
});

// ✗ WRONG: N+1 queries
const products = await db.product.findMany();
for (const product of products) {
  product.category = await db.category.findUnique({
    where: { id: product.categoryId },
  }); // N+1!
}

// ✗ WRONG: Selecting all columns
const products = await db.product.findMany(); // Fetches all columns!
```

---

## 28. Scalability Patterns

### 28.1 What

Standard for scaling the database as the platform grows.

### 28.2 Why

- **Growth:** Handle increasing data and traffic
- **Performance:** Maintain speed at scale
- **Cost:** Efficient resource usage

### 28.3 Scalability Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Start simple** | Single database first | Don't over-engineer |
| **Read replicas** | When read load is high | Scale reads |
| **Sharding** | When single node is insufficient | Scale writes |
| **Archiving** | Move old data to archive tables | Keep main tables small |
| **Materialized views** | For complex aggregations | Pre-compute expensive queries |

### 28.4 Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| **Data size** | > 100GB | Archive old data |
| **Read load** | > 1000 QPS | Add read replica |
| **Write load** | > 100 QPS | Consider sharding |
| **Query time** | > 100ms | Optimize queries |
| **Connection count** | > 100 | Connection pooling |

---

## 29. Naming Conventions

### 29.1 What

Standard for naming database objects.

### 29.2 Why

- **Consistency:** Same naming patterns everywhere
- **Readability:** Easy to understand relationships
- **Maintainability:** Predictable naming

### 29.3 Naming Rules

| Object | Convention | Example |
|--------|------------|---------|
| **Tables** | snake_case, plural | `products`, `order_items` |
| **Columns** | snake_case | `category_id`, `created_at` |
| **Primary keys** | `id` | `id` |
| **Foreign keys** | `{referenced_table}_id` | `category_id`, `profile_id` |
| **Indexes** | `idx_{table}_{columns}` | `idx_products_category_id` |
| **Unique constraints** | `uk_{table}_{columns}` | `uk_products_slug` |
| **Enums** | PascalCase | `UserRole`, `OrderStatus` |

### 29.4 Prisma Naming

| Object | Convention | Example |
|--------|------------|---------|
| **Models** | PascalCase | `Product`, `OrderItem` |
| **Fields** | camelCase | `categoryId`, `createdAt` |
| **Relations** | camelCase, singular | `category`, `profile` |
| **Arrays** | camelCase, plural | `products`, `items` |

### 29.5 Naming Examples

```prisma
// ✓ CORRECT: Proper naming
model Product {
  id         String   @id @default(uuid())
  name       String
  slug       String   @unique
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([categoryId])
}

// ✗ WRONG: Incorrect naming
model products {  // Should be PascalCase
  id         String  @id @default(uuid())
  Name       String  // Should be camelCase
  slug       String  @unique
  CategoryId String? // Should be camelCase
  // ...
}
```

---

## 30. Architectural Rules

### 30.1 What

Hard rules that every database design must follow.

### 30.2 Why

- **Consistency:** No exceptions to the rules
- **Quality:** Every design meets the standard
- **Maintainability:** Predictable patterns

### 30.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **UUID v4 primary keys** | Every table uses UUID v4 | Security, distributed systems |
| **Timestamps on all** | Every table has `createdAt` + `updatedAt` | Audit trail |
| **Soft delete** | Use `isActive` boolean, never hard delete | Referential integrity |
| **DECIMAL for money** | All currency fields use `DECIMAL(10,2)` | Financial accuracy |
| **Index all FKs** | Every FK column has an index | Query performance |
| **No comments** | Code must be self-documenting | Comments rot |
| **No barrel files** | Direct imports only | Tree-shaking |
| **No `any` types** | Use proper TypeScript types | Type safety |

### 30.4 Soft Rules

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **3NF normalization** | Normalize unless there's a reason not to | Default |
| **Denormalize for reads** | Cache computed values for performance | When needed |
| **Materialized views** | For complex aggregations | When queries are slow |
| **Read replicas** | For high read load | When > 1000 QPS |

---

## 31. Future Expansion

### 31.1 What

How the database schema will evolve for future features.

### 31.2 Why

- **Planning:** Design with future in mind
- **Extensibility:** Schema supports new features without rewrites
- **Migration Path:** Clear upgrade path

### 31.3 Future Features

| Feature | Schema Impact | Migration Strategy |
|---------|---------------|-------------------|
| **Multi-vendor marketplace** | Add `Seller` table, update `Product` | Add seller_id FK |
| **International expansion** | Add locale tables, translation support | New tables |
| **Subscription model** | Add `Subscription`, `Plan` tables | New tables |
| **Loyalty program** | Add `Points`, `Reward` tables | New tables |
| **Advanced analytics** | Add materialized views, data warehouse | New views |
| **Real-time inventory** | Add `InventoryLog` table | New table |

### 31.4 Migration Strategy

| Step | Action | Rationale |
|------|--------|-----------|
| **1. Design** | Plan new tables and relations | Architecture first |
| **2. Migrate** | Create migration with backward compatibility | Zero downtime |
| **3. Deploy** | Deploy migration to production | Data safety |
| **4. Verify** | Verify migration worked correctly | Quality assurance |
| **5. Clean up** | Remove deprecated columns after verification | Cleanup |

---

## Appendix A: Complete Schema Reference

### A.1 Core Tables

| Table | Description | Owner |
|-------|-------------|-------|
| `User` | User accounts and profiles | Auth |
| `Session` | Active user sessions | Auth |
| `Product` | Product catalog | Products |
| `ProductVariant` | Size/color variations | Products |
| `Category` | Product categories | Products |
| `Subcategory` | Category hierarchy | Products |
| `Collection` | Curated product groups | Products |
| `Brand` | Brand information | Products |
| `SizeGuide` | Size charts | Products |
| `Cart` | User shopping carts | Cart |
| `CartItem` | Cart line items | Cart |
| `Order` | Customer orders | Orders |
| `OrderItem` | Order line items | Orders |
| `OrderStatusHistory` | Order state transitions | Orders |
| `Address` | User addresses | Auth |
| `Wishlist` | Saved items | Cart |
| `Review` | Product reviews | Products |
| `Coupon` | Promotional codes | Orders |
| `CmsPage` | Static pages | CMS |
| `CmsSlide` | Homepage slides | CMS |
| `Media` | Uploaded files | CMS |
| `AdminSetting` | System configuration | Admin |
| `AuditLog` | Security audit trail | Auth |

### A.2 Index Summary

| Table | Indexes | Purpose |
|-------|---------|---------|
| `User` | role, isActive, role+isActive, createdAt | Query filtering |
| `Product` | categoryId, brandId, isActive+isFeatured, isActive+isNew, isActive+gender+createdAt, isActive+categoryId+sortOrder, isActive+basePrice, createdAt | Query filtering |
| `ProductVariant` | productId+isActive, productId+size+color, isActive+stock | Query filtering |
| `Order` | profileId, status+createdAt, paymentStatus+createdAt, profileId+status, razorpayOrderId, razorpayPaymentId, status+paymentStatus, createdAt | Query filtering |
| `CartItem` | cartId+variantId | Query filtering |
| `OrderItem` | orderId, variantId | Query filtering |
| `Address` | profileId | Query filtering |
| `Review` | productId, profileId, status | Query filtering |
| `AuditLog` | userId, resource+resourceId, createdAt, event | Query filtering |

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
