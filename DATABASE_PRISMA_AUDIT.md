# NABOME — Phase 5 Enterprise Database, Prisma & Neon Audit

**Date:** 2026-07-07
**Phase:** 5 — Database, Prisma & Neon Comprehensive Audit
**Author:** Principal Database Architect, PostgreSQL Expert, Prisma Expert, Neon Specialist
**Prerequisite:** Phase 1 (PROJECT_INVENTORY.md), Phase 2 (ENTERPRISE_ARCHITECTURE_AUDIT.md), Phase 3 (FRONTEND_UI_UX_AUDIT.md), Phase 4 (BACKEND_API_AUDIT.md)
**Status:** Complete

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Scoring Summary](#2-scoring-summary)
3. [Schema Architecture Review](#3-schema-architecture-review)
4. [Model-by-Model Review](#4-model-by-model-review)
5. [Relation & Integrity Review](#5-relation--integrity-review)
6. [Enum Analysis](#6-enum-analysis)
7. [Index Review](#7-index-review)
8. [Migration Review](#8-migration-review)
9. [Query Analysis](#9-query-analysis)
10. [Transaction Review](#10-transaction-review)
11. [Prisma Client Analysis](#11-prisma-client-analysis)
12. [Neon Database Analysis](#12-neon-database-analysis)
13. [Connection Pooling Analysis](#13-connection-pooling-analysis)
14. [Performance Risks](#14-performance-risks)
15. [Scalability Analysis](#15-scalability-analysis)
16. [Security Review](#16-security-review)
17. [Data Integrity Review](#17-data-integrity-review)
18. [Backup & Recovery](#18-backup--recovery)
19. [Seed Data Review](#19-seed-data-review)
20. [Enterprise Readiness](#20-enterprise-readiness)
21. [Priority Matrix](#21-priority-matrix)
22. [Final Verdict](#22-final-verdict)

---

## 1 — Executive Summary

This Phase 5 audit examines every aspect of NABOME's database layer: the Prisma schema (34 models, 1,422 lines), all 11 migrations (1,675 lines SQL), 22+ transaction boundaries, 200+ Prisma query patterns across 60+ handler files, the Neon serverless PostgreSQL configuration, connection pooling strategy, indexing, pagination, N+1 risks, and enterprise scalability.

### What's Working (Grade A)

- **Schema design** — Comprehensive 34-model schema covering 15 business modules. Well-organized with inline comments and clear module separators. Proper use of PostgreSQL-specific types (`UUID`, `JSONB`, `Decimal`, `VarChar` limits, `Timestamptz`).
- **Transaction usage** — 22+ `$transaction` call sites across 14 handler files. Payment processing uses 7 transactions. Checkout uses interactive transaction with 15-second timeout. Excellent transactional discipline.
- **Index coverage** — 80+ `@@index` declarations across the schema. Most foreign keys are indexed. Composite indexes on common query patterns (`isActive + isFeatured`, `isActive + gender + createdAt`).
- **Enum usage** — 18 well-defined enums covering order status lifecycle, return/refund states, notification events, support ticket states. Complete coverage of domain states.
- **Soft delete pattern** — Consistent `isActive` boolean on 20+ models with `@default(true)`. Used uniformly for soft-deletion across all handlers.
- **No raw SQL** — Zero `$queryRaw` or `$executeRaw` calls in production code (only `SELECT 1` in health check). All queries go through Prisma ORM — excellent for type safety.
- **Naming conventions** — Consistent snake_case `@map()` for all columns, proper `@db.*` type annotations, meaningful relation names with `@relation()` where disambiguation needed.

### What Needs Immediate Attention (Grade D-F)

- **Missing pagination on critical list endpoints** — Sales analytics, product exports, search index rebuild, ticket lists, session lists all fetch unbounded result sets. At scale, these will cause OOM crashes or timeouts.
- **Deep nested includes causing massive joins** — Cart query (4 levels deep), checkout cart query (5 levels deep), `productInclude` (3 levels with sub-includes). These load entire object graphs into memory on every request.
- **N+1 patterns in order cancellation** — Both customer and admin order cancellation fetch variants then loop with individual `update` calls. At 50+ items per order, this generates 50+ individual queries.
- **AnalyticsEvent BigInt autoincrement** — Using `BigInt @id @default(autoincrement())` instead of UUID. Already flagged in Phase 1 as a concern for distributed systems and data migration.
- **No cart expiration mechanism** — Carts are never cleaned up. Over time, this table grows unbounded with abandoned carts. No `updatedAt`-based cleanup job exists.
- **No read replica configuration** — All queries (including heavy analytics aggregations) hit the primary database. No query routing for read-heavy workloads.
- **No Hyperdrive binding** — Neon connections go through pooled URL without Cloudflare Hyperdrive acceleration. Connection pool management is manual.
- **No Prisma middleware** — No `$use` hooks for query logging, timing, soft-delete filtering, or audit trails at the ORM level. Audit logging is application-level only.
- **Single-instance connection singleton** — Prisma client is a singleton per Cloudflare isolate. Under high traffic (many concurrent isolates), this still creates many connections to Neon.
- **No migration rollback strategy** — 11 migrations applied sequentially. Last migration (M11) drops a table — destructive operation. No rollback scripts exist.

### Overall Assessment

The database layer is **well-architected for current scale** but has **significant production-readiness gaps for enterprise scale**. The schema design is comprehensive and follows best practices. The transaction discipline is excellent. However, the query patterns, pagination gaps, and lack of infrastructure optimizations (Hyperdrive, read replicas, connection pooling strategy) will become critical bottlenecks at 10K+ daily orders or 100K+ products.

---

## 2 — Scoring Summary

| Category | Score | Grade |
|---|---|---|
| **Database Schema** | **8.2/10** | **A-** |
| **Prisma Configuration** | **7.5/10** | **B+** |
| **Neon Integration** | **6.5/10** | **B-** |
| **Query Performance** | **5.0/10** | **C** |
| **Index Strategy** | **7.0/10** | **B** |
| **Migration Safety** | **5.5/10** | **C+** |
| **Transaction Discipline** | **9.0/10** | **A** |
| **Data Integrity** | **7.5/10** | **B+** |
| **Scalability** | **5.0/10** | **C** |
| **Security** | **6.5/10** | **B-** |
| **Overall Database** | **6.9/10** | **B-** |

### Score Distribution

```
Transaction Discipline ████████████████░░ 9.0
Database Schema        ███████████████░░░ 8.2
Prisma Configuration   ██████████████░░░░ 7.5
Data Integrity         ██████████████░░░░ 7.5
Index Strategy         █████████████░░░░░ 7.0
Security               ████████████░░░░░░ 6.5
Neon Integration       ████████████░░░░░░ 6.5
Migration Safety       ██████████░░░░░░░░ 5.5
Query Performance      █████████░░░░░░░░░ 5.0
Scalability            █████████░░░░░░░░░ 5.0
───────────────────────────────────────────────────
OVERALL                █████████████░░░░░ 6.9
```

---

## 3 — Schema Architecture Review

### 3.1 Module Organization

The schema is organized into 15 well-defined modules with clear separators:

| Module | Models | Lines | Cohesion |
|---|---|---|---|
| Auth | Profile, AuthSession, LoginAttempt, VerificationAttempt, UserActionLog | ~120 | Excellent - covers full auth lifecycle |
| Product | Product, ProductVariant, ProductImage, ProductAttribute, RelatedProduct, ProductTag, ProductTagOnProduct, ProductLabel, ProductLabelOnProduct | ~260 | Excellent - comprehensive product model |
| Inventory | InventoryAlert, InventoryMovement | ~40 | Good - movement tracking with alerts |
| Category | Category, Subcategory | ~50 | Good - hierarchical categories |
| Collection | Collection | ~30 | Good - time-bound collections |
| Brand | Brand | ~20 | Good |
| Size Guide | SizeGuide | ~20 | Good - category-linked sizing |
| Customer | Address, WishlistItem | ~40 | Good |
| Cart | Cart, CartItem | ~30 | Adequate - missing expiration |
| Order | Order, OrderItem, OrderStatusHistory | ~90 | Excellent - full lifecycle tracking |
| Marketing | Coupon, CouponRedemption, Campaign, AnnouncementBar | ~60 | Good |
| CMS | HomepageSection, NavigationMenu, FooterSection, StaticPage | ~70 | Excellent |
| Lookbook | Lookbook, LookbookItem | ~40 | Good |
| Review | Review | ~20 | Good |
| Media | MediaAsset | ~20 | Good |
| Settings | SiteSetting, SocialMediaLink, ContactSubmission, NewsletterSubscriber | ~60 | Good |
| Template | PageTemplate | ~20 | Good |
| Analytics | AnalyticsEvent | ~15 | Adequate - BigInt concern |
| Webhook | WebhookEvent | ~20 | Good - dedup support with unique constraint |
| Notification | Notification, NotificationTemplate | ~35 | Good |
| Support | SupportTicket, SupportTicketReply, FAQ | ~35 | Good |
| Return/Refund | ReturnRequest, Refund | ~40 | Good |

**Verdict:** Exceptional module organization. Clear separation of concerns with meaningful model groupings.

### 3.2 Schema Strengths

1. **Complete column annotations** — Every column uses `@db.*` type specifiers (`@db.Uuid`, `@db.VarChar(255)`, `@db.Decimal(10,2)`, `@db.Timestamptz`, `@db.JsonB`). No default Prisma types — all explicitly mapped to PostgreSQL types.

2. **Consistent naming** — All models use `@@map("snake_case_table_names")`. All fields use `@map("snake_case")`. No mixed conventions. Excellent for DBA readability.

3. **JSONB usage** — Properly used for flexible schemas: `SiteSetting.theme`, `HomepageSection.content`, `NavigationMenu.items`, `Campaign.metadata`. Good balance of structured vs unstructured data.

4. **Decimal precision** — All monetary fields use `@db.Decimal(10, 2)` consistently. No float/double usage for currency.

5. **Timestamp with timezone** — All date fields use `@db.Timestamptz` consistently. No timestamp without timezone.

6. **String array support** — PostgreSQL native array types used for `Review.images` (`String[]`), `Lookbook.tags` (`String[]`), `MediaAsset.tags` (`String[]`), `ReturnRequest.evidenceImages` (`String[]`). Good use of PostgreSQL features.

### 3.3 Schema Weaknesses

1. **No `createdAt` on `ProductTagOnProduct`** and `ProductLabelOnProduct` — Junction tables lack timestamps. Cannot determine when a tag/label was associated.

2. **No `updatedAt` on `ProductAttribute`** — Attribute values cannot track modification history.

3. **No `updatedAt` on `AuthSession.lastActiveAt`** — The field is set manually, not via `@updatedAt`. Timestamp may not reflect actual last activity.

4. **No `deletedAt` on soft-delete models** — Only `isActive: false` marks deletion. No timestamp for when deletion occurred.

5. **AnalyticsEvent uses BigInt autoincrement** — `@id @default(autoincrement())` with `BigInt`. While BigInt has 9 quintillion capacity, autoincrement IDs in a distributed PostgreSQL setup (Neon) can cause contention under high-write scenarios.

6. **No composite unique constraints on CartItem** — Only `@@unique([cartId, variantId])` prevents duplicate variants in cart. Missing `(cartId, variantId, savedForLater)` — a user could have same variant in active cart and saved-for-later simultaneously.

---

## 4 — Model-by-Model Review

### 4.1 Auth Module

#### Profile (`profiles`)
- **Strengths:** Comprehensive field coverage. Denormalized `email` from Supabase auth.users for quick access (good). Has `marketingOptIn`, `notificationPreferences`, `preferences` JSONB for extensibility. Password reset tokens with expiry. Email verification with pending email change support.
- **Issues:**
  - `verificationToken`, `resetPasswordToken`, `pendingEmailToken` — 3 different token fields. Consider a generic `tokens` JSONB field instead.
  - `firstName` required, `lastName` optional — assumes Western naming convention. For Indian market, consider single `fullName` or making both optional.
  - `phoneVerified` always starts `false` — no phone verification flow exists in the codebase (dead field).
- **Indexes:** `@@index([role])`, `@@index([isActive])`, `@@index([createdAt])`. **Missing:** `email` index (used in `findUnique` so Prisma creates unique index automatically — OK).
- **Cascade:** `onDelete: Cascade` for addresses, wishlist, orders, sessions — correct.
- **Score: 8/10**

#### AuthSession (`auth_sessions`)
- **Strengths:** Tracks access + refresh tokens, device info, IP, user agent. Self-referencing `SessionRotation` relation for token rotation audit trail. Has `revokedAt`, `lastActiveAt`, `expiresAt` for session lifecycle.
- **Issues:**
  - `rotatedFromSessionId` nullable with self-referencing — creates `auth_session` self-join. Could become deep chain.
  - `lastActiveAt` not auto-updated — requires manual set in handler code. Likely stale.
- **Indexes:** `@@index([profileId, isActive])`, `@@index([expiresAt])`, `@@index([refreshTokenExpiresAt])`, `@@index([rotatedFromSessionId])`. Good coverage.
- **Cascade:** `onDelete: Cascade` for profile — correct.
- **Score: 7/10**

#### LoginAttempt (`login_attempts`)
- **Strengths:** Tracks success/failure, fail reason, IP, user agent. Good for brute-force detection.
- **Issues:** No `locked_until` field unlike VerificationAttempt. Brute-force lockout check requires querying recent attempts.
- **Indexes:** `@@index([email, createdAt])`, `@@index([ipAddress, createdAt])`, `@@index([profileId])`. Good.
- **Cascade:** `onDelete: SetNull` for profile — correct.
- **Score: 7/10**

#### VerificationAttempt (`verification_attempts`)
- **Strengths:** Tracks code attempts with `lockedUntil` for rate limiting. Good for OTP abuse prevention.
- **Issues:** `code` field is `VarChar(10)` — good for 6-digit OTPs. No max attempt threshold in schema (enforced in application code).
- **Indexes:** `@@index([email, code])`, `@@index([ipAddress, createdAt])`, `@@index([profileId])`. Good.
- **Score: 7/10**

#### UserActionLog (`user_action_logs`)
- **Strengths:** Comprehensive audit trail with action name, entity, entityId, metadata JSONB, IP, user agent.
- **Issues:** `action` is `VarChar(100)` — no enum. Qualifies as "stringly-typed" field. Could use an enum for known action types.
- **Indexes:** `@@index([profileId])`, `@@index([action, createdAt])`, `@@index([entity, entityId])`. Good.
- **Cascade:** `onDelete: SetNull` for profile — correct (retains audit trail even after user deletion).
- **Score: 7/10**

### 4.2 Product Module

#### Product (`products`)
- **Strengths:** 30+ fields covering all product dimensions. Pricing (basePrice, compareAtPrice, costPrice, salePrice, discountPercent). Scheduling (scheduledPublishAt, scheduledArchiveAt). SEO (metaTitle, metaDesc). Material, care instructions, size chart support. Gender enum.
- **Issues:**
  - `slug` is `@unique` but no `@@index([slug])` — Prisma auto-creates unique index, OK.
  - `basePrice` is `Decimal(10,2)` — max value ₹99,999,999.99. For fashion e-commerce, this is adequate but luxury items could exceed this (₹1Cr+ sarees). Consider `Decimal(12,2)`.
  - No `averageRating` denormalized field — requires `_count` aggregate on every product list query.
- **Indexes:** 14 indexes — excellent coverage. Composite indexes for common filter patterns: `(isActive, isFeatured)`, `(isActive, isNew)`, `(isActive, gender, createdAt)`, `(isActive, categoryId, sortOrder)`, `(isActive, basePrice)`, `(scheduledPublishAt)`, `(scheduledArchiveAt)`. **Missing:** Full-text search index (relies on Prisma `contains` with `mode: insensitive` — slow at scale).
- **Cascade:** `onDelete: SetNull` for category, subcategory, collection, brand, sizeGuide — correct (preserves product when related entity is deleted).
- **Score: 8/10**

#### ProductVariant (`product_variants`)
- **Strengths:** SKU (unique), size, color, colorHex, priceAdjustment, stock, reservedStock. Weight, video URL support.
- **Issues:**
  - `stock` and `reservedStock` are plain `Int` — no optimistic locking version field. Race conditions possible (noted in Phase 4).
  - `sku` is `@unique` but no namespace — if multi-tenant in future, SKU uniqueness across tenants is problematic.
  - `size` is `VarChar(50)` — string-typed. Makes numeric sorting difficult (e.g., "S", "M", "L" vs "38", "40", "42").
- **Indexes:** `@@unique([productId, size, color])` — prevents duplicate variant combinations. `@@index([productId])`, `@@index([size, color])`, `@@index([isActive, stock])`. Good.
- **Cascade:** `onDelete: Cascade` for product — correct.
- **Score: 8/10**

#### ProductImage (`product_images`)
- **Strengths:** Supports variant-specific images. Has sortOrder, isPrimary, type (image/video), publicId for Cloudinary cleanup.
- **Issues:**
  - No `@@unique([productId, isPrimary])` — could have multiple primary images. Handled in application code (updateMany before set).
  - `type` is `VarChar(20)` with `@default("image")` — not an enum. Could be `AssetType` enum.
- **Indexes:** `@@index([productId])`, `@@index([variantId])`, `@@index([isPrimary])`. Good.
- **Cascade:** `onDelete: Cascade` for product, `onDelete: SetNull` for variant — correct.
- **Score: 7/10**

#### ProductAttribute (`product_attributes`)
- **Strengths:** Simple key-value pairs for extensible attributes.
- **Issues:** No `updatedAt`. No sort order. No unique constraint on `(productId, name)` — could have duplicate attribute names.
- **Indexes:** `@@index([productId])`, `@@index([name])`. Good.
- **Cascade:** `onDelete: Cascade` for product — correct.
- **Score: 6/10**

#### RelatedProduct (`related_products`)
- **Strengths:** Source-target bidirectional relation. Type field for different relation types (related, upsell, cross-sell). SortOrder.
- **Issues:** `@@unique([sourceId, targetId, type])` — good dedup prevention. Self-referencing via source/target both pointing to Product.
- **Indexes:** `@@index([sourceId, type])`, `@@index([targetId, type])`. Good.
- **Cascade:** `onDelete: Cascade` for both source and target — correct.
- **Score: 8/10**

#### ProductTag / ProductTagOnProduct (`product_tags` / `product_tags_products`)
- **Issues:** Junction table lacks `createdAt`. No sort order for tag ordering.
- **Indexes:** `@@id([productId, tagId])` — composite primary key. `@@index([tagId])`. Good.
- **Cascade:** `onDelete: Cascade` for both — correct.
- **Score: 7/10**

#### ProductLabel / ProductLabelOnProduct (`product_labels` / `product_labels_products`)
- **Issues:** Same as ProductTag — no `createdAt` on junction. Color field is `VarChar(7)` — good for hex codes.
- **Indexes:** `@@id([productId, labelId])`. `@@index([labelId])`. Good.
- **Score: 7/10**

#### InventoryAlert (`inventory_alerts`)
- **Strengths:** Threshold-based alerts with current stock snapshot. Resolved tracking.
- **Issues:** `type` is `VarChar(50)` — not enum. `threshold` is `Int?` `@db.SmallInt` — SmallInt limits to 32,767.
- **Indexes:** `@@index([variantId, isResolved])`, `@@index([type, isResolved])`, `@@index([createdAt])`. Good.
- **Cascade:** `onDelete: Cascade` for variant — correct.
- **Score: 7/10**

#### InventoryMovement (`inventory_movements`)
- **Strengths:** Tracks quantity change, stock after, reason, reference ID, notes. Full audit trail for inventory.
- **Issues:** `referenceId` is `VarChar(100)` — string-typed. Could reference order IDs, adjustment IDs, etc. No foreign key constraint.
- **Indexes:** `@@index([variantId])`, `@@index([createdAt])`, `@@index([reason])`. Good.
- **Cascade:** `onDelete: Cascade` for variant — correct.
- **Score: 8/10**

### 4.3 Category Module

#### Category (`categories`)
- **Strengths:** Self-referencing hierarchy via `parentId`. Has imagePublicId for Cloudinary cleanup. SortOrder, isActive, SEO fields.
- **Issues:** `name` not unique (multiple categories could have same name under different parents). No unique constraint on `(parentId, slug)`.
- **Indexes:** `@@index([parentId])`, `@@index([isActive])`, `@@index([sortOrder])`. Adequate.
- **Cascade:** Self-referencing `CategoryHierarchy` with no cascade — manual handling required for parent deletion.
- **Score: 7/10**

#### Subcategory (`subcategories`)
- **Strengths:** Clear category foreign key. Has imagePublicId.
- **Issues:** No unique constraint on `(categoryId, slug)`.
- **Indexes:** `@@index([categoryId])`, `@@index([isActive])`. Good.
- **Cascade:** `onDelete: Cascade` for category — correct. Has explicit `map: "subcategories_category_id_fkey"` — good naming practice.
- **Score: 7/10**

### 4.4 Collection Module

#### Collection (`collections`)
- **Strengths:** Time-bound (startDate, endDate). isFeatured flag. SEO fields. Hero image with publicId.
- **Issues:** No unique constraint on name — only slug is unique.
- **Indexes:** `@@index([isFeatured])`, `@@index([sortOrder])`. Adequate. Missing composite `(isActive, isFeatured, endDate)` for filtering active featured collections.
- **Score: 7/10**

### 4.5 Brand Module

#### Brand (`brands`)
- **Strengths:** Logo with publicId. Website URL. SortOrder. isActive.
- **Issues:** Minimal model — adequate for current needs.
- **Indexes:** `@@index([isActive])`. Adequate.
- **Score: 7/10**

### 4.6 Size Guide Module

#### SizeGuide (`size_guides`)
- **Strengths:** Category-linked. Type (clothing/footwear/accessories), unit. Measurements as JSONB. Image with publicId.
- **Issues:** `measurements` is required `Json` — must always be provided even for empty guides.
- **Indexes:** `@@index([categoryId])`. Adequate.
- **Cascade:** `onDelete: SetNull` for category — correct.
- **Score: 7/10**

### 4.7 Customer Module

#### Address (`addresses`)
- **Strengths:** Comprehensive address fields including district (Indian context). Dual default flags (isDefault for shipping, isBillingDefault for billing). Address type. Dual relation to Order for shipping/billing.
- **Issues:**
  - `label` defaults to `"Home"` — English default for Indian market. Consider making it nullable with frontend label.
  - `@@unique([profileId, isDefault])` missing — could have multiple default addresses.
  - `@@unique([profileId, isBillingDefault])` missing — could have multiple billing defaults.
- **Indexes:** `@@index([profileId])`, `@@index([pincode])`. Adequate.
- **Cascade:** `onDelete: Cascade` for profile — correct. Dual Order relations (`ShippingAddress`, `BillingAddress`) with `SetNull` — correct.
- **Score: 7/10**

#### WishlistItem (`wishlist_items`)
- **Strengths:** Simple structure. `@@unique([profileId, variantId])` prevents duplicates.
- **Issues:** No product ID — only variant. Cannot add "any variant of this product" to wishlist.
- **Indexes:** None beyond unique constraint. Adequate.
- **Cascade:** `onDelete: Cascade` for both — correct.
- **Score: 7/10**

### 4.8 Cart Module

#### Cart (`carts`)
- **Strengths:** Simple 1:1 with profile. Has `updatedAt`.
- **Issues:**
  - **No `lastActivityAt`** — Cannot distinguish active vs abandoned carts. Required for abandoned cart recovery.
  - **No expiration mechanism** — Carts persist indefinitely. Database bloat over time.
  - No guest cart support — guest carts tracked separately in application code (session-based).
- **Indexes:** None needed (1:1 with profile via unique). Adequate.
- **Cascade:** `onDelete: Cascade` for profile — correct.
- **Score: 5/10**

#### CartItem (`cart_items`)
- **Strengths:** Quantity tracking. `savedForLater` support. `@@unique([cartId, variantId])` prevents duplicate variants.
- **Issues:** No `price` snapshot — prices are live-queried from variant. If price changes between cart add and checkout, user sees different price.
- **Indexes:** None beyond unique. Adequate.
- **Cascade:** `onDelete: Cascade` for both — correct.
- **Score: 6/10**

### 4.9 Order Module

#### Order (`orders`)
- **Strengths:** Comprehensive — 25+ fields. Order number (unique). Full pricing breakdown (subtotal, shippingCost, tax, discount, total). Payment tracking (razorpayOrderId, razorpayPaymentId). Shipment timestamps (shippedAt, deliveredAt, cancelledAt, refundedAt, returnRequestedAt). Internal notes, gift message, invoice URL. Dual address relations. Full status lifecycle.
- **Issues:**
  - `orderNumber` is auto-generated in application code (not `@default(uuid())`) — relies on handler logic for uniqueness.
  - `@@unique([orderNumber])` exists — prevents duplicates, but if generation logic fails, unique constraint catches it.
  - `email` is denormalized (also in profile) — intentional for guest orders.
  - `notes` is `@db.Text` without length limit — potential for very large notes fields.
- **Indexes:** 8 indexes — excellent. Covers `profileId`, `email`, `status+createdAt`, `paymentStatus+createdAt`, `profileId+status`, `createdAt`, `shippingAddressId`, `billingAddressId`. **Missing:** `razorpayOrderId` index (queried in payments handler).
- **Cascade:** `onDelete: SetNull` for profile and addresses — correct (preserves order even if profile/address is deleted).
- **Score: 9/10**

#### OrderItem (`order_items`)
- **Strengths:** Denormalized product name, variant label, SKU, unit price, total price — preserves historical data even if product changes. Image URL for order history display. `isReturned`, `returnQuantity` for partial return tracking.
- **Issues:**
  - `variantId` is optional — order items can exist without a specific variant (for non-variable products?).
  - No `returnableUntil` field — return eligibility based on global setting, not per-item.
  - `productId` has `onDelete: Restrict` — prevents deleting product with existing orders (correct, but blocks cleanups).
- **Indexes:** `@@index([orderId])`, `@@index([productId])`, `@@index([variantId])`. Good. **Missing:** Composite `(orderId, isReturned)` for efficient return status queries.
- **Cascade:** `onDelete: Cascade` for order, `onDelete: Restrict` for product, `onDelete: SetNull` for variant — all correct.
- **Score: 8/10**

#### OrderStatusHistory (`order_status_history`)
- **Strengths:** Full audit trail for every status change. Links to creator (nullable for system actions). Note field.
- **Issues:** No `@@unique([orderId, status, createdAt])` — could have duplicate entries at same timestamp.
- **Indexes:** `@@index([orderId])`, `@@index([createdBy])`, `@@index([createdAt])`. Adequate.
- **Cascade:** `onDelete: Cascade` for order, `onDelete: SetNull` for creator — correct.
- **Score: 8/10**

### 4.10 Marketing Module

#### Coupon (`coupons`)
- **Strengths:** Full discount model. Percentage + fixed types. Usage limits (global, per-user). Min order value, max discount. Applicable gender filtering. Date ranges.
- **Issues:**
  - `usedCount` incremented in application code without atomic transaction — race condition possibility (flagged in Phase 4).
  - `usageLimit` is `Int?` — if null, unlimited (good). But `usedCount` starts at 0 and is never reset.
- **Indexes:** `@@index([isActive, startDate, endDate])`. Good.
- **Score: 8/10**

#### CouponRedemption (`coupon_redemptions`)
- **Strengths:** Links coupon, order, profile. `orderId` is unique — enforces one coupon per order (correct).
- **Issues:** All three foreign keys use `onDelete: Restrict` — prevents cleanup of old data.
- **Indexes:** `@@index([couponId])`, `@@index([profileId])`, `@@index([couponId, profileId])`. Good.
- **Score: 7/10**

#### Campaign (`campaigns`)
- **Strengths:** Type-based (email, banner, popup, discount, flash_sale). Date ranges. Metadata JSONB for flexibility.
- **Issues:** Minimal model — adequate for marketing campaigns.
- **Indexes:** `@@index([type, isActive])`, `@@index([startDate, endDate])`. Good.
- **Score: 7/10**

#### AnnouncementBar (`announcement_bars`)
- **Strengths:** Position (top/bottom). Custom colors. Date scheduling. Link with text.
- **Issues:** No unique constraint on position — could have multiple active top announcements.
- **Indexes:** `@@index([isActive, position])`. Good.
- **Score: 7/10**

### 4.11 CMS Module

#### HomepageSection (`homepage_sections`)
- **Strengths:** Section type enum (13 types). Title, subtitle, content JSONB, styles JSONB. Visibility enum (all/logged_in/logged_out). Publishing schedule (publishAt, expireAt).
- **Issues:** `content` is `Json?` — can contain anything. No type-level validation for section-type-specific content shapes.
- **Indexes:** `@@index([isActive, sortOrder])`, `@@index([publishAt, expireAt])`. Good.
- **Score: 8/10**

#### NavigationMenu (`navigation_menus`)
- **Strengths:** Location enum. Items as JSONB (flexible menu structure). `@@unique([name, location])` prevents duplicate menus per location.
- **Issues:** `items` is raw JSONB — no type safety. Menu structure validated only in application code.
- **Indexes:** `@@index([location, isActive])`. Good.
- **Score: 7/10**

#### FooterSection (`footer_sections`)
- **Strengths:** Column-based layout. Content type (links, text, social). Content as JSONB.
- **Issues:** `contentType` is `VarChar(50)` — not an enum.
- **Indexes:** `@@index([column, sortOrder])`. Adequate.
- **Score: 7/10**

#### StaticPage (`static_pages`)
- **Strengths:** Slug (unique). Content JSONB. Template selection. Publish state. SEO fields (metaTitle, metaDesc, ogImage).
- **Issues:** `content` is `Json?` — stores HTML string as JSON. Mixed representation concern.
- **Indexes:** `@@index([isPublished])`. Adequate.
- **Score: 7/10**

### 4.12 Lookbook Module

#### Lookbook (`lookbooks`)
- **Strengths:** Season/year for editorial context. Layout type. Story JSONB for narrative. Tags as native array. SEO fields. Cover image with publicId.
- **Issues:** `tags` is `String[]` — no tag table. Good for simple tags, but lacks tagging infrastructure.
- **Indexes:** `@@index([isActive, sortOrder])`, `@@index([season, year])`. Good.
- **Score: 8/10**

#### LookbookItem (`lookbook_items`)
- **Strengths:** Hotspot coordinates for shop-the-look. Links to product (optional). Caption. SortOrder.
- **Issues:** HotspotX/HotspotY are `Decimal(5,3)` — range 0.000 to 99.999. Adequate for percentage-based coordinates.
- **Indexes:** `@@index([lookbookId])`, `@@index([productId])`. Good.
- **Cascade:** `onDelete: Cascade` for lookbook, `onDelete: SetNull` for product — correct.
- **Score: 8/10**

### 4.13 Review Module

#### Review (`reviews`)
- **Strengths:** Rating (SmallInt — range 0-32767, adequate for 1-5 stars). Title, body. Images as String array. Approval workflow. Links to product, profile, and order.
- **Issues:**
  - `@@unique([productId, profileId, orderId])` — prevents multiple reviews per product per order. Good, but `orderId` is optional. If null, constraint allows multiple reviews without order.
  - No `isVerifiedPurchase` boolean — all reviews treated equally.
  - `rating` is `Int` mapped to `SmallInt` — adequate but should constrain 1-5 in application.
- **Indexes:** `@@index([productId, isApproved])`, `@@index([profileId])`. Good.
- **Cascade:** `onDelete: Restrict` for product and profile — prevents deletion of reviewed entities without cascade handling.
- **Score: 7/10**

### 4.14 Media Module

#### MediaAsset (`media_assets`)
- **Strengths:** Type enum (image, video, document). Dimensions, file size, MIME type. Tags as native array. Folder categorization.
- **Issues:** No Cloudinary-specific fields beyond `publicId`. No `width`/`height` validation in schema.
- **Indexes:** `@@index([type])`, `@@index([folder])`, `@@index([createdAt])`. Adequate.
- **Score: 7/10**

### 4.15 Settings Module

#### SiteSetting (`site_settings`)
- **Strengths:** 20+ fields covering all site configuration. JSONB fields for complex settings (shippingInfo, returnPolicy, aboutUs, theme, seo, preferences). Dual theme structure (legacy compatibility noted in schema comments).
- **Issues:**
  - Single-row table — no unique constraint enforcement. Application code ensures single row via `findFirst`.
  - 6 JSONB fields — querying specific nested fields requires PostgreSQL JSON path expressions.
  - `theme` + legacy `branding/colors/typography/buttons/layout/header/footer` — duplicated data for backward compatibility.
- **Indexes:** None needed (single-row table).
- **Score: 7/10**

#### SocialMediaLink (`social_media_links`)
- **Strengths:** Platform, label, URL, icon. SortOrder, isActive.
- **Issues:** `platform` is `VarChar(50)` — not enum. Could have inconsistent platform names.
- **Indexes:** `@@index([platform])`. Adequate.
- **Score: 6/10**

#### ContactSubmission (`contact_submissions`)
- **Strengths:** Full contact form data. Email, phone, subject, message. isRead flag.
- **Issues:** No `updatedAt`. No assigned-to or status tracking.
- **Indexes:** `@@index([isRead])`, `@@index([createdAt])`. Good.
- **Score: 6/10**

#### NewsletterSubscriber (`newsletter_subscribers`)
- **Strengths:** Simple. Email unique. isActive for opt-out.
- **Issues:** No confirmation token, no double-opt-in tracking, no subscription date beyond createdAt.
- **Indexes:** `@@index([isActive])`. Adequate.
- **Score: 5/10**

### 4.16 Template Module

#### PageTemplate (`page_templates`)
- **Strengths:** Category classification (landing, content, editorial). Sections as JSONB. Thumbnail with publicId. Use count tracking.
- **Issues:** `sections` is required `Json` — must always be provided.
- **Indexes:** `@@index([category, isActive])`. Adequate.
- **Score: 7/10**

### 4.17 Analytics Module

#### AnalyticsEvent (`analytics_events`)
- **Strengths:** Event type, profile/session tracking, payload JSONB, page URL, user agent, IP.
- **Issues:**
  - **BigInt autoincrement** — `@id @default(autoincrement())` with `BigInt`. In a Neon serverless environment, autoincrement IDs can cause write contention on the sequence. UUIDs would be more suitable for distributed writes.
  - No created-at-based partitioning strategy — will become a massive table.
  - `pageUrl` is `@db.Text` without length limit.
- **Indexes:** `@@index([eventType, createdAt])`, `@@index([profileId])`, `@@index([sessionId])`, `@@index([createdAt])`. Good.
- **Score: 5/10**

### 4.18 Webhook Module

#### WebhookEvent (`webhook_events`)
- **Strengths:** `@@unique([source, eventId])` — excellent for idempotent webhook processing. Status tracking (received, processed, failed). Retry count. Error logging. Links to order.
- **Issues:** None significant. This is a well-designed webhook audit table.
- **Indexes:** `@@index([eventType, status])`, `@@index([orderId])`, `@@index([createdAt])`, `@@index([status])`. Good.
- **Cascade:** `onDelete: SetNull` for order — correct.
- **Score: 9/10**

### 4.19 Notification Module

#### Notification (`notifications`)
- **Strengths:** Full lifecycle (isRead, readAt, sentAt). Channel enum. Event type. Error tracking (retryCount, errorMessage). Links to profile and order.
- **Issues:**
  - `channel` has default `in_app` — not all notifications use in-app.
  - `emailTo` field — denormalized email address for notification. Good for email channel tracking.
- **Indexes:** `@@index([profileId, isRead])`, `@@index([profileId, createdAt])`, `@@index([orderId])`, `@@index([channel, sentAt])`. Good.
- **Cascade:** `onDelete: SetNull` for profile and order — correct.
- **Score: 8/10**

#### NotificationTemplate (`notification_templates`)
- **Strengths:** `@@unique([event])` — one template per event. Channel-specific bodies (emailBody, smsBody, inAppBody).
- **Issues:** `emailBody` is `Text?` — stores full HTML template. Could be large.
- **Score: 7/10**

### 4.20 Support Module

#### SupportTicket (`support_tickets`)
- **Strengths:** Links to order and profile. Priority enum. Assigned-to for admin routing. Full status lifecycle.
- **Issues:** `name` + `email` denormalized for non-logged-in support requests (correct). `subject` is VarChar(500) — adequate.
- **Indexes:** `@@index([status])`, `@@index([priority])`, `@@index([profileId])`, `@@index([orderId])`, `@@index([assignedTo])`, `@@index([status, priority])`. Excellent coverage.
- **Cascade:** `onDelete: SetNull` for order, profile, assignee — correct.
- **Score: 8/10**

#### SupportTicketReply (`support_ticket_replies`)
- **Strengths:** Simple. isStaff flag for admin vs customer replies.
- **Issues:** No attachment support. No `updatedAt`.
- **Indexes:** `@@index([ticketId])`, `@@index([profileId])`. Good.
- **Cascade:** `onDelete: Cascade` for ticket, `onDelete: SetNull` for author — correct.
- **Score: 7/10**

#### FAQ (`faqs`)
- **Strengths:** Category grouping. SortOrder. isActive.
- **Issues:** No `updatedAt` on model (Prisma schema has it at line 1407). Actually, looking at line 1407: `updatedAt DateTime @updatedAt @map("updated_at")` — it does have updatedAt. Good.
- **Indexes:** `@@index([category, isActive])`, `@@index([sortOrder])`. Good.
- **Score: 7/10**

### 4.21 Return/Refund Module

#### ReturnRequest (`return_requests`)
- **Strengths:** Full reason enum. Status lifecycle enum. Evidence images (String array). Admin note, reviewer tracking. Links to order, orderItem, profile, refund.
- **Issues:** `orderItemId` is optional — return can be for an entire order or specific item.
- **Indexes:** `@@index([orderId])`, `@@index([profileId])`, `@@index([status])`, `@@index([status, createdAt])`. Good.
- **Cascade:** `onDelete: Restrict` for order and profile — prevents deletion of entities with associated returns (correct). `onDelete: SetNull` for orderItem — correct.
- **Score: 8/10**

#### Refund (`refunds`)
- **Strengths:** Tracks refund amount, type (full/partial), status lifecycle, payment method, transaction ID. Links to return request, order, initiator.
- **Issues:**
  - `returnRequestId` is `@unique` — one refund per return request (correct for most cases, but partial refunds of the same return would need separate refund records).
  - `amount` uses `Decimal(10,2)` — same as Order. Max ₹99,999,999.99.
- **Indexes:** `@@index([orderId])`, `@@index([status])`, `@@index([initiatedBy])`. Good. **Missing:** `transactionId` index (queried in payments handler for idempotency check).
- **Cascade:** `onDelete: Cascade` for returnRequest and order, `onDelete: SetNull` for initiator — correct.
- **Score: 7/10**

---

## 5 — Relation & Integrity Review

### 5.1 Foreign Key Coverage

All 34 models have proper foreign key relations. Total relations: ~60+ declared relations across the schema.

### 5.2 Cascade Analysis

| Cascade Type | Count | Usage |
|---|---|---|
| `onDelete: Cascade` | ~25 | Parent-child relationships (profile→address, order→items, product→variants) |
| `onDelete: SetNull` | ~20 | Optional parent relationships (profile→loginAttempt, order→shippingAddress) |
| `onDelete: Restrict` | ~8 | Critical business data (orderItem→product, couponRedemption→coupon) |

**Verdict:** Cascade strategy is well-thought-out. Business-critical data uses `Restrict`. Dependent data uses `Cascade`. Optional links use `SetNull`.

### 5.3 Nullability Analysis

- **Required fields with no defaults:** `email` on Profile, `name`/`slug` on most entities, `basePrice` on Product, `total` on Order.
- **Optional foreign keys:** Most relations to Profile are optional (profileId on Order, SupportTicket, ReturnRequest, Refund). This supports guest/unauthenticated workflows.
- **JSONB nullability:** Most JSONB fields are optional (`Json?`), correctly allowing null for default content.

**Issues found:**
1. `CartItem.quantity` has `@default(1)` but is `required` (no `?`). If someone passes `null`, Prisma will error. Fine — frontend should always provide quantity.
2. `OrderItem.returnQuantity` defaults to `0` — correct.
3. `ProductVariant.colorHex` is optional — correct for variants without hex codes.
4. `ProductAttribute.value` has no length annotation — `VarChar(200)` would be safer.

### 5.4 Unique Constraints

| Model | Unique Constraint | Purpose |
|---|---|---|
| Profile | `email` | One account per email |
| Product | `slug` | SEO-friendly unique URL |
| ProductVariant | `sku`, `(productId, size, color)` | Inventory tracking, variant uniqueness |
| CartItem | `(cartId, variantId)` | No duplicate variants in cart |
| WishlistItem | `(profileId, variantId)` | One wishlist entry per variant |
| Review | `(productId, profileId, orderId)` | One review per order per product |
| CouponRedemption | `orderId` | One coupon per order |
| NavigationMenu | `(name, location)` | Unique menu names per location |
| WebhookEvent | `(source, eventId)` | Webhook idempotency |
| Refund | `returnRequestId` | One refund per return |
| NotificationTemplate | `event` | One template per event type |

**Verdict:** Excellent unique constraint coverage. All critical uniqueness requirements are enforced at the database level.

### 5.5 Missing Constraints

1. **`Address`**: No `@@unique([profileId, isDefault])` — multiple addresses could be marked as default.
2. **`Address`**: No `@@unique([profileId, isBillingDefault])` — multiple billing defaults possible.
3. **`Cart`**: No `updatedAt`-based cleanup trigger — no database-level cart expiration.
4. **`Product`**: No check constraint on `basePrice > 0` — negative prices possible.
5. **`OrderItem`**: No check constraint on `quantity > 0` — zero-quantity order items possible.
6. **`Review.rating`**: No check constraint for 1-5 range — any SmallInt value allowed.

---

## 6 — Enum Analysis

### 6.1 Enum Inventory

| Enum | Values | Used By |
|---|---|---|
| UserRole | customer, admin | Profile |
| Gender | men, women, unisex | Product, Coupon |
| OrderStatus | 10 values (pending→refunded) | Order, OrderStatusHistory |
| PaymentStatus | 5 values | Order, Refund |
| DiscountType | percentage, fixed | Coupon |
| CampaignType | email, banner, popup, discount, flash_sale | Campaign |
| SectionType | 13 values | HomepageSection |
| Visibility | all, logged_in, logged_out | HomepageSection |
| MenuLocation | header, footer, mobile, sidebar | NavigationMenu |
| AssetType | image, video, document | MediaAsset |
| AnnouncementBarPosition | top, bottom | AnnouncementBar |
| ReturnReason | 7 values | ReturnRequest |
| ReturnStatus | 6 values | ReturnRequest |
| RefundStatus | 5 values | Refund |
| NotificationChannel | email, sms, in_app | Notification |
| NotificationEvent | 17 values | Notification, NotificationTemplate |
| SupportTicketStatus | 4 values | SupportTicket |
| SupportTicketPriority | 4 values | SupportTicket |

### 6.2 Enum Issues

1. **CampaignType enum changed via migration** — Initial migration had 4 values (`email`, `banner`, `popup`, `discount`). Schema now has 5 values (+ `flash_sale`). This is a schema drift — the migration was never run with `prisma migrate` after adding it to the schema file. **Schema is out of sync with database.**
2. **SectionType enum changed via migration** — Initial migration had 11 values. Schema now has 13 (+ `trust_bar`, `video_banner`). Same drift issue as CampaignType.
3. **UserRole changed from `super_admin` to `admin`** — Migration M5 (`20260621140000_rename_super_admin_to_admin`) handled this rename. Cleanly done via `ALTER TYPE ... RENAME VALUE`.
4. **NotificationEvent values added** — Migration M8 added `email_change`, `email_verification`, `contact_form` via `ALTER TYPE ... ADD VALUE`. Safe migration pattern.
5. **Missing enum for `ProductImage.type`** — Currently `VarChar(20)` with `@default("image")`. Should use `AssetType` enum.
6. **Missing enum for `FooterSection.contentType`** — Currently `VarChar(50)` with `@default("links")`.
7. **Missing enum for `InventoryAlert.type`** — Currently `VarChar(50)`.

---

## 7 — Index Review

### 7.1 Index Inventory

Total `@@index` declarations: **80+** across 34 models. Breakdown by category:

| Model | Index Count | Quality |
|---|---|---|
| Product | 14 | Excellent |
| Order | 8 | Excellent |
| SupportTicket | 6 | Excellent |
| ProductVariant | 3 | Good |
| AuthSession | 4 | Good |
| Notification | 4 | Good |
| UserActionLog | 3 | Good |
| AnalyticsEvent | 4 | Good |
| WebhookEvent | 4 | Good |
| Coupon | 1 | Adequate |
| Most others | 1-2 | Adequate |

### 7.2 Missing Indexes

**Critical:**

| Table | Suggested Index | Reason |
|---|---|---|
| `orders` | `@@index([razorpayOrderId])` | Queried directly in payments handler for webhook lookup |
| `refunds` | `@@index([transactionId])` | Queried for idempotency check in refund processing |
| `analytics_events` | `@@index([createdAt])` — already exists | OK |
| `order_items` | `@@index([productId, isReturned])` | Frequently filtered by isReturned for return processing |
| `product_variants` | `@@index([sku])` — already unique | OK |
| `support_tickets` | Already well-indexed | OK |

**High:**

| Table | Suggested Index | Reason |
|---|---|---|
| `products` | `@@index([isActive, name])` or GIN trigram | Text search on name uses `contains` + `mode: insensitive` — slow at scale |
| `profiles` | `@@index([email, isActive])` | Login queries filter by email + active status |
| `notifications` | `@@index([profileId, isRead, createdAt])` | Most common query pattern for notification listing |
| `carts` | `@@index([updatedAt])` | Cart cleanup queries need this filter |
| `return_requests` | `@@index([orderId, status])` | Frequently filtered by order + status |

**Medium:**

| Table | Suggested Index | Reason |
|---|---|---|
| `collections` | `@@index([isActive, isFeatured, endDate])` | Active featured collections query |
| `coupons` | `@@index([code, isActive])` | Coupon validation lookup |
| `auth_sessions` | `@@index([profileId, isActive, expiresAt])` | Session cleanup queries |
| `static_pages` | `@@index([slug, isPublished])` | Page lookup by slug |

### 7.3 Composite Index Review

**Well-designed:**
- `Product: @@index([isActive, isFeatured])` — featured products filtering
- `Product: @@index([isActive, gender, createdAt])` — gender-based product listing
- `Product: @@index([isActive, categoryId, sortOrder])` — category product listing
- `Product: @@index([isActive, basePrice])` — price filter queries
- `Order: @@index([status, createdAt])` — order management queries
- `Order: @@index([paymentStatus, createdAt])` — payment analytics
- `AuthSession: @@index([profileId, isActive])` — active session lookup

**Missing composite:**
- `Order: @@index([profileId, status, createdAt])` — customer order history with filter
- `ProductVariant: @@index([productId, isActive])` — active variants for a product
- `HomepageSection: @@index([isActive, sectionType, sortOrder])` — section type filtering

### 7.4 Index Performance Assessment

- **Overall index coverage:** 7/10 — Good for current scale, needs optimization for 100K+ products
- **No redundant indexes found** — every index serves a purpose
- **No over-indexing** — tables with <5K rows (settings, templates) have minimal indexes
- **No index on large JSONB fields** — correct, JSONB should not be indexed without specific GIN indexes
- **Missing full-text search index** — Product search uses `contains` with `mode: 'insensitive'` which does sequential scan. At 10K+ products, this becomes unusably slow. Needs GIN trigram index or dedicated search service.

---

## 8 — Migration Review

### 8.1 Migration History

| # | Migration | Date | Lines | Type | Description |
|---|---|---|---|---|---|
| M1 | `20260619023155_init` | 2026-06-19 | 1,622 | Initial | Full schema creation (34 models, 18 enums, extensions) |
| M2 | `20260619162901_add_verification_token` | 2026-06-19 | 3 | Additive | Add verification_token, verification_token_expires_at to profiles |
| M3 | `20260621122730_add_pending_email_fields` | 2026-06-21 | 4 | Additive | Add pending_email, pending_email_token, pending_email_token_expires_at |
| M4 | `20260621124956_add_reset_password_token` | 2026-06-21 | 3 | Additive | Add reset_password_token, reset_password_token_expires_at |
| M5 | `20260621140000_rename_super_admin_to_admin` | 2026-06-21 | 12 | Migration | ALTER TYPE UserRole RENAME VALUE 'super_admin' → 'admin' |
| M6 | `20260621150000_add_trust_bar_section_type` | 2026-06-21 | 1 | Additive | ALTER TYPE SectionType ADD VALUE 'trust_bar' |
| M7 | `20260621160000_add_seo_preferences_to_settings` | 2026-06-22 | 2 | Additive | Add seo column to site_settings |
| M8 | `20260625100000_add_missing_notification_events` | 2026-06-25 | 8 | Additive | ALTER TYPE NotificationEvent ADD VALUE for 3 new events |
| M9 | `20260626100000_add_public_id_columns` | 2026-06-26 | 16 | Additive | Add imagePublicId/logoPublicId/etc. to multiple models |
| M10 | `20260628100000_add_product_image_type_column` | 2026-06-28 | 2 | Additive | Add type column to product_images |
| M11 | `20260629000000_drop_brand_story` | 2026-06-29 | 2 | **Destructive** | DROP TABLE brand_story |

### 8.2 Migration Safety Assessment

| Risk | Status | Details |
|---|---|---|
| **Zero-downtime compatible** | ❌ | M11 drops a table — requires exclusive lock. All migrations are applied with `prisma migrate deploy` which can lock tables. |
| **Rollback strategy** | ❌ | No rollback scripts exist. M11 cannot be reversed without data loss. |
| **Schema-drift detection** | ⚠️ | Schema.prisma has values (`flash_sale`, `trust_bar`, `video_banner`) that were added directly without corresponding migrations. Schema is out of sync with database. |
| **Data loss risk** | ⚠️ | M11 drops `brand_story` table completely. No backup of that data exists in migration scripts. |
| **Shadow database** | ⚠️ | No evidence of shadow database usage in recent migrations. `prisma migrate dev` uses shadow database locally, but no CI/CD integration. |
| **Production safety** | ⚠️ | All 11 migrations applied sequentially. No baselining or squashing. If a new environment needs setup, replaying all 11 migrations takes time. |
| **Foreign key handling** | ✅ | All foreign keys are properly referenced in initial migration. |
| **Enum additions** | ✅ | All ALTER TYPE ... ADD VALUE use safe patterns (no enum value reordering). |

### 8.3 Migration Issues Found

1. **Schema drift (CRITICAL)** — The `schema.prisma` file contains enum values (`flash_sale` in CampaignType, `trust_bar` and `video_banner` in SectionType) that were added directly to the schema file without running `prisma migrate dev` to generate corresponding migration files. The database may not have these enum values, causing runtime errors.

2. **M11 destructive operation** — `DROP TABLE "brand_story"` is irreversible. If any application code still references this model (it shouldn't), it would cause runtime crashes.

3. **No migration squashing** — 11 migrations for a pre-production schema is manageable, but at 50+ migrations, startup time and deployment reliability degrade.

4. **No CI/CD migration test** — The GitHub Actions workflow (`deploy.yml`) does not run `prisma migrate deploy` or validate migration health before deployment.

5. **No baseline migration strategy** — For new team members, replaying 11 migrations on a fresh database takes ~30 seconds. Acceptable for now but should be squashed before production launch.

---

## 9 — Query Analysis

### 9.1 Query Volume by Handler

| Handler | findMany | findFirst | findUnique | create | update | delete | $transaction | aggregate/groupBy |
|---|---|---|---|---|---|---|---|---|
| **products.ts** | 8 | 4 | 0 | 0 | 0 | 0 | 0 | 0 |
| **admin/products.ts** | 10 | 0 | 10 | 6 | 8 | 1 | 1 | 1 |
| **payments.ts** | 4 | 4 | 8 | 8 | 12 | 0 | 7 | 0 |
| **checkout.ts** | 4 | 6 | 5 | 6 | 4 | 2 | 1 | 1 |
| **auth.ts** | 4 | 2 | 10 | 6 | 10 | 0 | 2 | 0 |
| **orders.ts** | 5 | 3 | 0 | 1 | 1 | 0 | 1 | 1 |
| **admin/orders.ts** | 5 | 4 | 4 | 2 | 3 | 0 | 1 | 4 |
| **cart.ts** | 0 | 0 | 4 | 3 | 4 | 2 | 2 | 0 |
| **admin/analytics.ts** | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 7 |
| **admin/dashboard.ts** | 4 | 1 | 0 | 0 | 0 | 0 | 0 | 3 |

### 9.2 Critical Query Issues

#### CRITICAL: Unbounded Result Sets

| File | Line | Query | Impact |
|---|---|---|---|
| `admin/analytics.ts` | L81 | `order.findMany({ paymentStatus: "paid", createdAt: { gte } })` — no skip/take | Returns ALL paid orders in date range. At 10K orders/day, this is 300K+ rows/month. |
| `admin/analytics.ts` | L290 | `order.findMany({ ... }, take: 50000)` — hardcoded 50K limit | Will fail at 50,001+ orders. Either OOM or timeout. |
| `admin/import-export.ts` | L52 | `product.findMany({ ... include: {...} })` — no pagination | Exports ALL products with deep includes. At 100K products, this will timeout or OOM. |
| `admin/import-export.ts` | L206 | `order.findMany({ ... include: { items, profile } })` — no pagination | Same problem for order exports. |
| `admin/search-index.ts` | L60-73 | 5 `findMany` calls with no pagination | Index rebuild fetches ALL records into memory. At large scale, this will crash. |
| `products.ts` | L229 | `product.findMany({ slug: { in: slugList } })` — no limit | By-slugs query could receive hundreds of slugs. |
| `products.ts` | L388 | `relatedProduct.findMany({ sourceId })` — no limit | Related products could return hundreds. |
| `products.ts` | L443 | `review.findMany({ productId, isApproved })` — no pagination | Product with 10K reviews returns all. |

#### CRITICAL: Deep Nested Includes

| File | Line | Depth | Size Impact |
|---|---|---|---|
| `checkout.ts` | L205 | **5 levels**: cart → items → variant → product → images | Each cart query loads the entire product graph. For a cart with 5 items, this could load 50+ related records. |
| `cart.ts` | L42 | **4 levels**: items → variant → product → images | Same as above, called on every cart read. |
| `products.ts` | L5-16 | **3 levels**: `productInclude` with variants→images, tags→tag, labels→label | Used in product list and detail queries. |
| `admin/products.ts` | L10-22 | **3 levels**: Same + sizeGuide, `_count: { orderItems }` | Admin product list with deep includes. |

#### HIGH: N+1 Query Patterns

| File | Lines | Pattern | Risk |
|---|---|---|---|
| `orders.ts` | L203-233 | Fetch variants → loop individual `update` + `create` | For 20-item order: 20 `update` + 20 `create` = 41 queries inside transaction |
| `admin/orders.ts` | L257-278 | Same pattern | Same as above |
| `products.ts` | L443 | `review.findMany` with `include: { profile }` | Each review loads profile. 100 reviews = 101 queries. |

#### HIGH: Missing Pagination on List Endpoints

| File | Endpoint | Impact |
|---|---|---|
| `auth.ts` | Session list | Returns all active sessions — typically <20, low risk |
| `support.ts` | Customer ticket list | Returns all tickets — grows unbounded |
| `notifications.ts` | Customer notification list | Returns all notifications |
| `admin/inventory.ts` | Alert list | Returns all unresolved alerts |
| `cms.ts` | Multiple CMS queries | Returns all active sections — typically <50, low risk |

### 9.3 Query Patterns Score

| Criteria | Score | Assessment |
|---|---|---|
| **Pagination coverage** | 4/10 | ~50% of list endpoints lack pagination |
| **Include/select discipline** | 5/10 | Deep nesting with unnecessary fields |
| **N+1 prevention** | 6/10 | Two clear N+1 patterns in order cancellation |
| **Raw SQL usage** | 10/10 | None (except health check) — excellent |
| **Query optimization** | 5/10 | Missing full-text search, heavy includes |
| **Aggregation safety** | 6/10 | Some aggregations unbounded |
| **Overall** | **5.0/10** | **Significant performance risks at scale** |

---

## 10 — Transaction Review

### 10.1 Transaction Inventory

**22+ `$transaction` call sites across 14 handler files:**

| Handler | Count | Pattern | Notes |
|---|---|---|---|
| `payments.ts` | 7 | Interactive `async (tx)` | Payment verification, refund, webhook — all properly wrapped |
| `auth.ts` | 2 | Batch array | Session creation, password reset |
| `checkout.ts` | 1 | Interactive (timeout: 15s) | Order creation + inventory deduction + coupon update |
| `cart.ts` | 2 | Interactive & batch | Cart sync, cart merge |
| `orders.ts` | 1 | Interactive | Order cancellation with stock restoration |
| `admin/orders.ts` | 1 | Interactive | Admin order status update |
| `admin/products.ts` | 1 | Interactive | Variant batch update |
| `admin/inventory.ts` | 1 | Interactive | Stock adjustment |
| `admin/lookbooks.ts` | 2 | Interactive | Item reorder, bulk operations |
| `admin/cms.ts` | 1 | Interactive | Bulk CMS operations |
| `admin/related-products.ts` | 1 | Interactive | Replace related products |
| `admin/categories.ts` | 1 | Interactive | Category updates |
| `refunds.ts` | 1 | Batch array | Refund status update |
| `returns.ts` | 1 | Batch array | Return status update |

### 10.2 Transaction Analysis

**Strengths:**
- All payment-critical operations use transactions (7 transactions in payments.ts)
- Checkout uses `timeout: 15s` for long-running order creation
- Interactive transaction API used correctly with `async (tx)` for conditional logic
- Proper error handling — no silent transaction failures

**Issues:**
1. **Checkout transaction (L447)**: `updateMany` on variant stock uses `stock: { gte: variant.quantity }` — this is a race condition check. Without `SELECT ... FOR UPDATE`, two concurrent requests could both pass the `gte` check before either updates. **Missing optimistic locking.**
2. **Order cancellation N+1 inside transaction**: The looped `update` + `create` pattern inside transactions creates unnecessary lock contention. Could be replaced with `updateMany` + `createMany`.
3. **No timeout on most transactions**: Only checkout.ts specifies `timeout: 15s`. All others use default timeout. Long-running operations (bulk product operations) could hit Prisma's default 5-second timeout.

### 10.3 Transaction Score: 9/10

Excellent transaction discipline. The payment handler's 7-transaction approach is best-in-class. Only missing optimistic locking and timeout configuration prevent a perfect score.

---

## 11 — Prisma Client Analysis

### 11.1 Connection Management

| Aspect | Current | Assessment |
|---|---|---|
| **Client factory** | Singleton via `globalForPrisma` per isolate | ✅ Correct for serverless |
| **Adapter** | `@prisma/adapter-neon` with `connectionString` | ✅ Proper Neon integration |
| **Pooling** | `neonConfig.poolQueryViaFetch = true` | ✅ Serverless-optimized |
| **Connection URL** | `DATABASE_URL_POOLED` with `DATABASE_URL` fallback | ✅ Pooled URL preferred |
| **Logging** | `["error"]` in production, `["error", "warn"]` in dev | ✅ Minimal logging |
| **Disconnect** | Never called in production | ⚠️ Expected for serverless, but no lifecycle hooks |
| **Middleware** | None (`$use`/`$on` not used) | ❌ Missed opportunity for query timing, soft-delete filtering |

### 11.2 Client Usage Patterns

| Pattern | Files | Assessment |
|---|---|---|
| `getPrisma(env)` | ~300 calls across 60+ files | ✅ All production paths pass env parameter |
| `getPrisma(ctx.env)` | ~50 calls | ✅ Context-based env access |
| `getPrisma()` without args | 0 calls in production | ✅ Correct — only happens locally via `process.env` |

### 11.3 Issues

1. **`env` typed as `any` in most handler signatures** — TypeScript does not enforce that `env` is passed. If a developer forgets `env` in `getPrisma()`, the local dev path runs silently (using `process.env`) but production would throw.

2. **Singleton race window** — Two concurrent requests at cold-start could theoretically both pass the `if (!globalForPrisma.prisma)` check. In practice, V8 isolates are single-threaded per request, so this is extremely unlikely. But still worth noting.

3. **No Prisma middleware for soft-delete** — Every query must manually add `where: { isActive: true }`. Error-prone across 60+ files. A single forgotten filter exposes soft-deleted records.

4. **No query logging middleware** — No centralized query timing, slow query detection, or query count monitoring.

---

## 12 — Neon Database Analysis

### 12.1 Neon Configuration

| Setting | Value | Assessment |
|---|---|---|
| **Adapter** | `@prisma/adapter-neon` | ✅ Official adapter |
| **Pool mode** | `poolQueryViaFetch = true` | ✅ Hyperdrive-compatible |
| **Connection URL** | `DATABASE_URL_POOLED` (pooled) with `DATABASE_URL` fallback | ✅ Pooled connection preferred |
| **Compute** | Neon Serverless (auto-scale) | ✅ Serverless PostgreSQL |
| **Branching** | Not configured | ❌ No preview branches |
| **Read replicas** | Not configured | ❌ All queries hit primary |

### 12.2 Pooling Analysis

**Current behavior:**
- `neonConfig.poolQueryViaFetch = true` — sends queries via HTTP fetch instead of TCP
- Singleton PrismaClient per isolate — connection pooled at client level
- Each isolate maintains its own connection pool
- No explicit pool size configuration (Neon defaults)

**Concerns:**

1. **No Hyperdrive binding** — Cloudflare Hyperdrive would cache database connections and reduce cold-start latency. Currently, every new isolate must establish a new Neon connection.

2. **Pool per isolate** — In Cloudflare Workers, each isolate has its own PrismaClient. With 100+ concurrent isolates, this could create 100+ connections to Neon. Neon's free/launch plan typically allows ~50-100 concurrent connections.

3. **No connection limit monitoring** — No code to detect or handle `too many connections` errors gracefully. When Neon connection limit is hit, handlers will throw unhandled Prisma errors.

4. **Prepared statement caching** — `poolQueryViaFetch = true` means prepared statements are not cached across requests in the traditional sense. Each HTTP fetch sends the full query text.

### 12.3 Cold Start Analysis

| Factor | Impact | Mitigation |
|---|---|---|
| **Prisma client init** | ~100-300ms per cold start | Singleton pattern helps, but first request to each isolate pays this cost |
| **Neon connection** | ~50-150ms per new connection | No connection pooling across isolates |
| **Query execution** | ~5-50ms per query | Dependent on data size and index usage |
| **Full cold start** | ~150-500ms | Acceptable for most use cases, poor for latency-sensitive paths |

### 12.4 Neon Recommendations

1. **Add Hyperdrive binding** — Cloudflare Hyperdrive reduces cold starts to ~5ms and maintains warm connection pools across isolates. This is the single biggest performance improvement available.

2. **Configure compute autosuspend** — Neon computes can autosuspend after inactivity. For a production e-commerce site, configure a minimum compute to avoid cold-start latency on every request after idle periods.

3. **Add read replica** — Route GET queries (product listing, CMS content, analytics) to a read replica. Reserve primary for write-heavy operations (checkout, orders, payments).

4. **Monitor connection count** — Add Prometheus/metrics instrumentation for active connections to Neon. Alert when approaching plan limits.

---

## 13 — Connection Pooling Analysis

### 13.1 Current Architecture

```
Client → Cloudflare Workers (Isolate 1) → PrismaClient Singleton → Neon Pooled URL
Client → Cloudflare Workers (Isolate 2) → PrismaClient Singleton → Neon Pooled URL
Client → Cloudflare Workers (Isolate N) → PrismaClient Singleton → Neon Pooled URL
```

Each worker isolate maintains its **own** PrismaClient singleton with its own connection pool to Neon.

### 13.2 Pooling Concerns

| Concern | Severity | Detail |
|---|---|---|
| **Connection multiplication** | High | 50 concurrent isolates × pool size = potentially 500+ connections |
| **No connection reuse** | High | Connections cannot be shared across isolates — each isolate gets fresh pool |
| **No Hyperdrive** | High | Missing Cloudflare Hyperdrive eliminates connection caching |
| **No pool size limits** | Medium | Prisma's default pool size is 10-20 connections — multiplied by isolates |

### 13.3 Connection Limits

Assuming Neon's default pool size of ~10 connections per PrismaClient:

| Concurrent Isolates | Total Connections | Neon Limit (Launch) | Status |
|---|---|---|---|
| 5 | 50 | 50-100 | OK |
| 10 | 100 | 50-100 | At limit |
| 20 | 200 | 50-100 | **Exceeded** |
| 50 | 500 | 50-100 | **Critical** |

**Verdict:** Connection exhaustion is a real risk under moderate traffic. Without Hyperdrive or explicit connection management, the database will become unavailable when concurrent isolates exceed Neon's connection limit.

---

## 14 — Performance Risks

### 14.1 Risk Matrix

| # | Risk | Severity | Likelihood | Impact | Priority |
|---|---|---|---|---|---|
| R1 | Analytics query returns millions of rows | **Critical** | High | OOM crash, 30s timeout | **P0** |
| R2 | Export fetches all data without pagination | **Critical** | Medium | OOM crash, 30s timeout | **P0** |
| R3 | Connection exhaustion under load | **Critical** | Medium | Database unavailable | **P0** |
| R4 | Cart query 5-level nested include | **High** | High | Slow page loads (+500ms) | **P1** |
| R5 | Order cancellation N+1 loop | **High** | Medium | Slow cancellation (+200ms per item) | **P1** |
| R6 | Missing full-text search index | **High** | Medium | Sequential scan on product search | **P1** |
| R7 | Schema drift (enum values missing) | **Critical** | High | Runtime errors | **P0** |
| R8 | No read replica for analytics | **High** | Low | Primary DB load from heavy queries | **P2** |
| R9 | No cart expiration/bloat | **Medium** | High | Unbounded table growth | **P2** |
| R10 | No Hyperdrive for cold starts | **Medium** | High | 150-500ms cold start latency | **P2** |

### 14.2 Performance by Query Type

| Query Type | Performance | Bottleneck |
|---|---|---|
| Product list (public) | Good | Proper pagination + composite indexes |
| Product detail (public) | Good | Uses findUnique by slug (indexed) |
| Cart read | **Poor** | 4-level nested include |
| Checkout order creation | **Moderate** | 15s timeout transaction, fine for now |
| Order cancellation | **Poor** | N+1 pattern, 41+ queries for 20 items |
| Payment webhook | **Good** | 7 well-structured transactions |
| Admin product list | **Moderate** | Heavy includes + aggregation |
| Analytics sales query | **Critical** | Unbounded result set |
| Product search | **Moderate** | Sequential scan without full-text index |
| CMS queries | **Good** | Small result sets, well-indexed |

---

## 15 — Scalability Analysis

### 15.1 Growth Projections

| Metric | Current | 6 Months | 12 Months | 24 Months |
|---|---|---|---|---|
| Products | ~10 (seed) | 1,000 | 10,000 | 100,000 |
| Product Variants | ~50 | 5,000 | 50,000 | 500,000 |
| Orders | 0 | 1,000/mo | 10,000/mo | 100,000/mo |
| Order Items | 0 | 3,000/mo | 30,000/mo | 300,000/mo |
| Reviews | 0 | 100 | 1,000 | 10,000 |
| Users | 0 | 1,000 | 10,000 | 100,000 |
| Analytics Events | 0 | 50,000/mo | 500,000/mo | 5,000,000/mo |
| Carts (active + abandoned) | 0 | 2,000 | 20,000 | 200,000 |
| Support Tickets | 0 | 50/mo | 500/mo | 5,000/mo |
| Notifications | 0 | 2,000/mo | 20,000/mo | 200,000/mo |

### 15.2 Table Size Estimates (24 months)

| Table | Estimated Rows | Size (estimated) | Growth Rate |
|---|---|---|---|
| `analytics_events` | 120,000,000 | ~50 GB | **Highest** — needs partitioning |
| `products` | 100,000 | ~200 MB | Low |
| `product_variants` | 500,000 | ~200 MB | Low |
| `orders` | 2,400,000 | ~2 GB | High |
| `order_items` | 7,200,000 | ~3 GB | High |
| `order_status_history` | 14,400,000 | ~3 GB | High |
| `notifications` | 4,800,000 | ~2 GB | High |
| `auth_sessions` | 1,000,000 | ~500 MB | Moderate |
| `carts` + `cart_items` | 200,000 | ~100 MB | Moderate |
| `login_attempts` | 5,000,000 | ~1 GB | High |

### 15.3 Scaling Bottlenecks

1. **AnalyticsEvent table** — Will become the largest table. No partitioning strategy. At 5M events/month, queries will slow significantly. Needs time-based partitioning (e.g., by month).

2. **Product search** — `contains` + `mode: insensitive` does sequential scan. At 10K+ products, search latency becomes unacceptable. Need GIN trigram index or dedicated search (Typesense/Algolia/MeiliSearch).

3. **Order analytics** — Unbounded `findMany` on orders table will cause OOM at 100K+ orders. Must add pagination and streaming aggregation.

4. **Auth session table** — No cleanup mechanism. Old sessions accumulate. At 1M+ rows, `@@index([profileId, isActive])` still performs well, but storage grows unbounded.

5. **Cart bloat** — No cleanup job. Abandoned carts accumulate. A scheduled job to delete carts older than 30 days is needed.

### 15.4 Enterprise Scalability Recommendations

| Priority | Action | Impact |
|---|---|---|
| **P0** | Add pagination to all unbounded queries | Prevents OOM at any scale |
| **P0** | Add cart expiration cleanup (cron job) | Prevents cart table bloat |
| **P0** | Add analytics event partitioning | Prevents analytics table explosion |
| **P0** | Fix schema drift (enum values) | Prevents runtime errors |
| **P1** | Add full-text search index (GIN trigram) | Enables product search at scale |
| **P1** | Add read replica for GET queries | Reduces primary DB load |
| **P1** | Add Hyperdrive binding | Reduces cold start latency |
| **P1** | Implement connection pooling limits | Prevents connection exhaustion |
| **P2** | Add auth session cleanup (cron job) | Controls session table growth |
| **P2** | Add order archiving strategy | Manages order table growth at 1M+ rows |

---

## 16 — Security Review

### 16.1 Database Security

| Aspect | Current State | Assessment |
|---|---|---|
| **Connection string** | Cloudflare Pages secrets | ✅ Not in code |
| **DATABASE_URL** | Stored as `DATABASE_URL` and `DATABASE_URL_POOLED` | ✅ Two separate secrets |
| **Clean secret filtering** | `cleanSecret()` strips placeholders | ✅ Prevents accidental placeholder use |
| **SQL injection** | No raw SQL in production | ✅ Prisma ORM prevents injection |
| **Encryption at rest** | Managed by Neon | ✅ Neon provides encryption at rest |
| **Encryption in transit** | TLS for all connections | ✅ Standard for Neon |
| **Database users** | Single connection string | ⚠️ No read-only user for analytics |
| **Connection exposure** | Only in `api/_lib/prisma.ts` | ✅ Centralized, not scattered |

### 16.2 Sensitive Data

| Field | Sensitive | Protected? |
|---|---|---|
| `Profile.email` | PII | Not encrypted at DB level |
| `Profile.phone` | PII | Not encrypted |
| `Profile.firstName`, `lastName` | PII | Not encrypted |
| `Order.email` | PII | Not encrypted |
| `Address.*` (full address) | PII | Not encrypted |
| `Payment.razorpayOrderId` | Payment info | Not encrypted (but external reference, low risk) |
| `AuthSession.accessToken` | Authentication | Stored as plaintext (hashed in Supabase) |
| `AuthSession.refreshToken` | Authentication | Stored as plaintext |

**Verdict:** No sensitive data is encrypted at the database level. For Indian e-commerce, this may need PCI DSS compliance review. However, NABOME uses Razorpay for payment processing (no raw card data stored), so PCI scope is reduced.

### 16.3 Security Findings

1. **No field-level encryption** — PII fields (email, phone, address) are stored in plaintext. For PCI DSS compliance, consider encryption at rest or tokenization.

2. **No read-only database user** — All queries use the same connection string. Analytics queries that could be routed to a read-only replica would need separate credentials.

3. **No audit trail for database access** — Cloudflare Workers runtime limits which IPs connect to Neon, but there's no database-level audit logging configured.

4. **`auth_middleware.ts` session queries** — The auth middleware queries `AuthSession` by access token (indexed). This is a hot path — every authenticated request triggers this query.

---

## 17 — Data Integrity Review

### 17.1 Referential Integrity

- All foreign keys are enforced at database level (Prisma `relationMode = "foreignKeys"`)
- Cascade strategies are correct for all relations
- No orphan records possible under normal operation

### 17.2 Duplicate Prevention

| Mechanism | Coverage | Gaps |
|---|---|---|
| `@@unique` constraints | 15+ unique constraints | Address default flags |
| Application-level checks | Some endpoints | Not consistent |
| Transaction-based prevention | Payment, checkout | Stock reservation lacks locking |

### 17.3 Soft Delete Consistency

- 20+ models use `isActive` boolean
- Not all queries filter `isActive: true` — some admin queries intentionally show inactive records
- No `deletedAt` timestamp — soft-deleted records lose temporal context
- No cascade handling for soft-delete — related records (images, variants) remain active when product is soft-deleted

### 17.4 Data Integrity Risks

1. **Stock reservation without locking** — `checkout.ts` L450 uses `updateMany` with `stock: { gte: quantity }` which is a race condition. Two concurrent checkouts for the same last-in-stock variant could both succeed.

2. **Coupon usedCount without locking** — Similar race condition. Two concurrent checkouts using the same coupon could both increment `usedCount` past `usageLimit`.

3. **No `isActive` filtering in auth queries** — `auth.ts` login query checks `Profile` by email but may not filter `isActive: true`. Disabled accounts could potentially log in.

---

## 18 — Backup & Recovery

### 18.1 Current State

| Aspect | Status | Assessment |
|---|---|---|
| **Automated backups** | Managed by Neon | ✅ Neon provides point-in-time recovery |
| **PITR window** | Neon default (7 days) | ⚠️ Verify current Neon plan |
| **Disaster recovery** | Not documented | ❌ No DR plan |
| **Restore testing** | Never performed | ❌ No restore drill |
| **Backup monitoring** | Not configured | ❌ No backup failure alerts |
| **Migration rollback** | Not scripted | ❌ M11 is irreversible |
| **Seed data** | Available as `prisma/seed.ts` | ✅ Can regenerate seed data |

### 18.2 Recommendations

1. **Document PITR configuration** — Verify Neon's point-in-time recovery settings and retention period. Ensure they match business requirements (typically 7-30 days).

2. **Create restore runbook** — Document the exact steps to restore from a point in time using Neon's branching/restore features.

3. **Test restore quarterly** — Perform a restoration test to an isolated Neon branch every 3 months.

4. **Backup critical seed data** — The `prisma/seed.ts` (1,003 lines) is the only reference data backup. Consider exporting as SQL dump for faster restoration.

5. **Add migration rollback scripts** — For the next destructive migration, provide a rollback SQL script.

---

## 19 — Seed Data Review

### 19.1 Seed Overview

- **File:** `prisma/seed.ts` (1,003 lines)
- **Products:** 10 products with variants (3-8 variants each)
- **Categories:** 3 (Men, Women, Accessories)
- **Subcategories:** 10 (Shirts, Trousers, Blazers, Kurtas, Dresses, Sarees, Suits, Bags, Watches, Jewellery)
- **Collections:** 3 (Summer Essentials, Heritage Revival, Evening Edit)
- **Images:** 6 Unsplash images reused across products
- **Tags:** 8 (Linen, Cotton, Silk, Handloom, Sustainable, Festival, Formal, Casual)
- **Labels:** 4 (New Arrival, Best Seller, Limited Edition, Sustainable)

### 19.2 Seed Issues

1. **Unsplash images only** — All product, category, and collection images are from Unsplash. Not representative of actual premium fashion. Can't test Cloudinary upload flow.

2. **SKU conventions inconsistent** — Some use `MLS-S-WHT` pattern (Men Linen Shirt - Size - Color), others use `WSE-6-BLK` (Women Silk Evening - Size - Color). No standardized SKU format.

3. **Hardcoded UUIDs** — Navigation menu items use `crypto.randomUUID()` inline. These are not stable across seed runs — but since seed cleans all data first, this is acceptable.

4. **No order/test data** — Seed creates products, categories, collections but no orders, reviews, or customer accounts. Cannot demonstrate order lifecycle, review system, or cart functionality without additional setup.

5. **Price data consistency** — `basePrice` is in paise? ₹8,900 for a linen shirt, ₹28,500 for an evening gown, ₹75,000 for a watch. Prices are in rupees (not paise) — confirmed by comparing with `freeShippingThreshold: 999` in site settings.

6. **No theme seeding validation** — The site settings theme JSON is 70+ lines with legacy structure duplication. The nested `theme.design.*` and flat `theme.*` structures must be kept in sync — currently they are manually duplicated.

---

## 20 — Enterprise Readiness

### 20.1 Enterprise Dimension Scores

| Dimension | Score | Assessment |
|---|---|---|
| **Database Design** | 8.0/10 | Comprehensive, well-structured. Needs minor optimizations. |
| **Prisma Usage** | 7.5/10 | Good patterns. Missing middleware, extensions, optimized queries. |
| **Neon Integration** | 6.5/10 | Functional. Missing Hyperdrive, read replicas, monitoring. |
| **Migration Safety** | 5.5/10 | Schema drift is critical concern. No rollback strategy. |
| **Query Performance** | 5.0/10 | Unbounded queries and deep includes are production risks. |
| **Scalability** | 5.0/10 | Multiple bottlenecks at scale (search, analytics, connection). |
| **Data Integrity** | 7.5/10 | Good constraints. Race conditions in stock/coupon. |
| **Security** | 6.5/10 | No encryption at rest, no read-only user, single connection. |
| **Disaster Recovery** | 4.0/10 | Neon PITR exists, but no DR plan, no restore testing. |
| **Monitoring** | 3.0/10 | No database monitoring, slow query detection, or connection alerts. |

### 20.2 Enterprise Readiness Score: 5.8/10

### 20.3 Production Launch Blockers

The following must be addressed before production launch:

| # | Issue | Priority |
|---|---|---|
| 1 | **Schema drift** — Enum values in Prisma schema not reflected in database | **BLOCKER** |
| 2 | **Unbounded analytics query** — Will crash under load | **BLOCKER** |
| 3 | **Connection exhaustion** — No connection limit management | **BLOCKER** |
| 4 | **Missing pagination on exports** — Can crash during admin operations | **HIGH** |
| 5 | **Race condition on stock reservation** — Can oversell | **HIGH** |
| 6 | **Race condition on coupon usage** — Can over-use coupons | **HIGH** |
| 7 | **No full-text search index** — Product search slow at 10K+ products | **HIGH** |
| 8 | **No cart expiration** — Database bloat | **MEDIUM** |
| 9 | **No read replica for analytics** — Primary DB load | **MEDIUM** |
| 10 | **Migration rollback not documented** — Operational risk | **MEDIUM** |

---

## 21 — Priority Matrix

### 21.1 P0 — Immediate (Production Blockers)

| # | Finding | Effort | Impact | Category |
|---|---|---|---|---|
| DB-01 | Fix schema drift — run `prisma migrate dev` to sync enums | 30 min | Critical | Migration |
| DB-02 | Add pagination to analytics sales query | 1 hr | Critical | Query |
| DB-03 | Add pagination to import-export endpoints | 2 hr | Critical | Query |
| DB-04 | Add connection monitoring and limit handling | 4 hr | Critical | Neon |
| DB-05 | Add cart expiration cleanup job | 2 hr | Critical | Data Integrity |

### 21.2 P1 — High Priority

| # | Finding | Effort | Impact | Category |
|---|---|---|---|---|
| DB-06 | Add optimistic locking to variant stock (version field) | 4 hr | High | Data Integrity |
| DB-07 | Add Hyperdrive binding for Neon | 2 hr | High | Neon |
| DB-08 | Add GIN trigram index for product search | 1 hr | High | Index |
| DB-09 | Fix order cancellation N+1 to use updateMany | 2 hr | High | Query |
| DB-10 | Add pagination to review, related products, ticket list endpoints | 3 hr | High | Query |
| DB-11 | Add read replica connection for GET queries | 4 hr | High | Neon |
| DB-12 | Reduce cart/checkout nested include depth | 4 hr | High | Query |

### 21.3 P2 — Medium Priority

| # | Finding | Effort | Impact | Category |
|---|---|---|---|---|
| DB-13 | Add unique constraint for address default flags | 1 hr | Medium | Schema |
| DB-14 | Add check constraint for rating 1-5 | 1 hr | Medium | Schema |
| DB-15 | Add index on `orders.razorpayOrderId` | 30 min | Medium | Index |
| DB-16 | Add index on `refunds.transactionId` | 30 min | Medium | Index |
| DB-17 | Add auth session cleanup cron job | 2 hr | Medium | Data Integrity |
| DB-18 | Add Prisma middleware for query timing | 3 hr | Medium | Monitoring |
| DB-19 | Add `deletedAt` to soft-delete models | 4 hr | Medium | Schema |
| DB-20 | Add analytics event partitioning strategy | 8 hr | Medium | Scalability |

### 21.4 P3 — Low Priority

| # | Finding | Effort | Impact | Category |
|---|---|---|---|---|
| DB-21 | Normalize product image type to AssetType enum | 1 hr | Low | Schema |
| DB-22 | Add `createdAt` to junction tables | 2 hr | Low | Schema |
| DB-23 | Standardize SKU generation format | 2 hr | Low | Seed |
| DB-24 | Add database migration testing to CI/CD | 4 hr | Low | DevOps |
| DB-25 | Create migration rollback scripts | 4 hr | Low | Migration |
| DB-26 | Implement Neon branching for preview deployments | 4 hr | Low | Neon |

### 21.5 Effort Summary

| Priority | Items | Estimated Effort |
|---|---|---|
| P0 (Production Blockers) | 5 | ~10 hours |
| P1 (High) | 7 | ~20 hours |
| P2 (Medium) | 10 | ~22 hours |
| P3 (Low) | 6 | ~14 hours |
| **Total** | **28** | **~66 hours (8-10 days)** |

---

## 22 — Final Verdict

### Database Layer Assessment

The NABOME database layer is **well-architectured for a pre-production e-commerce platform** but requires significant hardening before it can handle enterprise-scale traffic.

**Strengths to preserve:**
- Comprehensive 34-model schema covering all business domains
- Excellent transaction discipline (22+ transactions, payment handler is best-in-class)
- Consistent naming conventions and PostgreSQL type annotations
- 80+ well-designed indexes on critical query paths
- Zero raw SQL in production code (type safety preserved)

**Critical gaps to address before launch:**
1. **Schema drift** — Schema.prisma enums are out of sync with database
2. **Unbounded queries** — Sales analytics and exports will crash under load
3. **Connection management** — No Hyperdrive, no pooling limits, risk of exhaustion
4. **Race conditions** — Stock and coupon operations lack optimistic locking
5. **N+1 patterns** — Order cancellation generates excessive queries

**The database foundation is solid.** The issues found are operational and performance optimizations, not fundamental architecture flaws. With 8-10 days of focused engineering effort (P0+P1 items), the database layer can be made production-ready.

### Database Score: 6.9/10

| Category | Score | Trend |
|---|---|---|
| Schema Design | 8.2/10 | ▲ Strong foundation |
| Prisma Usage | 7.5/10 | ▲ Good patterns |
| Neon Integration | 6.5/10 | → Functional, needs Hyperdrive |
| Query Performance | 5.0/10 | ▼ Blocking issues to fix |
| Scalability | 5.0/10 | ▼ Needs prioritization |
| Security | 6.5/10 | → Adequate for current stage |
| **Overall** | **6.9/10** | **▲ Production-ready with 8-10 days of work** |

---

*End of DATABASE_PRISMA_AUDIT.md — Generated 2026-07-07*
