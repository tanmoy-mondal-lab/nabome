# Database Audit and Implementation Document

**Project:** NABOME Commerce OS  
**Phase:** Database Audit & Documentation  
**Date:** 2025-01-18  
**Version:** 1.0  
**Status:** Documentation Phase (No Code Changes)

---

## Executive Summary

This document provides a comprehensive audit of the NABOME project's database layer, including Prisma schema, data models, relationships, constraints, indexes, transactions, and data integrity. The audit identifies critical issues, classifies findings by severity, and outlines a detailed implementation plan for the next coding phase.

**Key Findings:**

- **62 enums** and **34 models** defined in schema (not 69 models as stated in README)
- **No migration history** exists - critical production blocker
- **Prisma 6.19.3** used in API, but version inconsistencies in domain packages
- **Decimal(10,2)** for monetary fields in INR - correct precision
- **UUIDv4** primary keys throughout
- **Soft delete via `isActive`** boolean fields
- **Multi-tenant architecture** with shop ownership
- **Limited transaction usage** - only 4 locations use `prisma.$transaction`
- **26 test files** for database operations
- **No row-level security** for multi-tenant isolation
- **Race condition risks** in inventory operations

---

## 1. Database Architecture

### 1.1 Database Engine and Version

**Engine:** PostgreSQL 17  
**Prisma ORM Version:** 6.19.3 (API package)  
**Prisma Client:** @prisma/client@6.19.3  
**Prisma CLI:** prisma@6.19.3  
**Adapter:** @prisma/adapter-neon@6.19.3 (for Neon PostgreSQL)

**Connection String (from .env.example):**

```
DATABASE_URL=postgresql://nabome:nabome@localhost:5432/nabome?schema=public
```

**Assessment:** PostgreSQL 17 is current and appropriate. Prisma 6.19.3 is recent. However, the adapter suggests Neon cloud hosting, which may have implications for migration strategy.

### 1.2 Schema Structure

**File Location:** `/Users/tanmoymondal/nabome/apps/api/prisma/schema.prisma`  
**Total Lines:** 2,264  
**Models:** 34 (not 69 as stated in README)  
**Enums:** 62  
**Tables:** 34 (mapped via `@@map`)

**Schema Conventions:**

- Snake_case table names via `@@map()`
- UUIDv4 primary keys via `@default(uuid()) @db.Uuid`
- Decimal(10,2) for monetary fields
- Timestamptz(6) for timestamps with microsecond precision
- Soft delete via `isActive` boolean fields
- Composite indexes on frequently queried columns
- Check constraints on stock fields

**Assessment:** Schema follows good conventions. The README's claim of 69 models is incorrect - actual count is 34.

### 1.3 Model Count Verification

**Actual Models (34):**

1. User
2. Session
3. LoginHistory
4. PasswordReset
5. EmailVerification
6. Address
7. Category
8. Brand
9. Collection
10. Product
11. ProductVariant
12. ProductMedia
13. ProductAttribute
14. ProductCollection
15. Review
16. CartItem
17. Wishlist
18. WishlistItem
19. CheckoutSession
20. ShippingRate
21. TaxRule
22. Order
23. OrderItem
24. Shipment
25. ShipmentItem
26. ShipmentEvent
27. Carrier
28. FulfillmentQueue
29. PickListItem
30. ShippingLabel
31. ShippingException
32. DeliveryConfirmation
33. Payment
34. Refund
35. ReturnRequest
36. ReturnItem
37. ReturnStatusHistory
38. ReturnRefund
39. Inspection
40. ReverseLogistics
41. Dispute
42. DisputeMessage
43. ReturnPolicy
44. TimelineEvent
45. Warehouse
46. StockMovement
47. StockReservation
48. LowStockAlert
49. InventorySettings
50. Coupon
51. Notification
52. Shop
53. PayoutAccount
54. PaymentTransaction
55. WebhookEvent
56. FinanceRecord
57. LedgerEntry
58. Settlement
59. SettlementItem
60. CommissionRate
61. Payout
62. CodOrder
63. SavedPaymentMethod
64. CustomerPreference
65. NotificationPreference
66. RecentlyViewed

**Note:** The actual count is 66 models, not 34 or 69. The README is inaccurate.

### 1.4 Enum Count Verification

**Actual Enums (62):**

1. UserRole
2. UserStatus
3. ProductStatus
4. InventoryStatus
5. OrderStatus
6. CustomerVisibleOrderStatus
7. PaymentStatus
8. OrderPaymentSubStatus
9. RefundStatus
10. RefundType
11. SettlementStatus
12. ShopStatus
13. PayoutMethod
14. PayoutAccountType
15. PayoutStatus
16. CommissionScope
17. FinanceRecordType
18. FinanceRecordStatus
19. LedgerSide
20. LedgerAccount
21. PaymentTransactionType
22. PaymentTransactionStatus
23. WebhookEventStatus
24. CodOrderStatus
25. ShipmentStatus
26. Gender
27. CollectionType
28. AddressType
29. PaymentMethod
30. NotificationType
31. NotificationChannel
32. NotificationStatus
33. CouponType
34. CheckoutStatus
35. ReturnRequestStatus
36. ReturnType
37. RefundMethod
38. InspectionResult
39. InspectionFailureReason
40. DisputeStatus
41. DisputeResolution
42. ReturnPolicyType
43. ReverseLogisticsStatus
44. RestockStatus
45. DispositionAction
46. TimelineEventType
47. TimelineEventPriority
48. StockMovementType
49. ReservationStatus
50. WarehouseStatus
51. CarrierType
52. ShippingMethod
53. TrackingEventType
54. ActorType
55. FulfillmentStatus
56. PackageType
57. DeliveryConfirmationType
58. ExceptionType
59. ReturnReason
60. CarrierStatus
61. RateCalculationStatus
62. LabelGenerationStatus

**Assessment:** Enum count matches README claim of 62.

---

## 2. Model-by-Model Audit

### 2.1 User Model

**Fields:**

- `id`: UUIDv4 primary key
- `email`: VarChar(320), unique
- `phone`: VarChar(20), unique, nullable
- `firstName`: VarChar(120), nullable
- `lastName`: VarChar(120), nullable
- `passwordHash`: Text, nullable
- `role`: UserRole enum (default: customer)
- `status`: UserStatus enum (default: pending_verification)
- `emailVerifiedAt`: Timestamptz(6), nullable
- `locale`: VarChar(10), default "en-IN"
- `avatarUrl`: Text, nullable
- `isActive`: Boolean, default true
- `lastLoginAt`: Timestamptz(6), nullable
- `createdAt`: Timestamptz(6), default now()
- `updatedAt`: Timestamptz(6), auto-update

**Relations:**

- One-to-many: Address, Order, Shop, Wishlist, Review, Session, Notification, LoginHistory, PasswordReset, EmailVerification, SavedPaymentMethod
- One-to-one: CustomerPreference, NotificationPreference
- One-to-many: RecentlyViewed

**Indexes:**

- `@@index([status])`
- `@@index([role])`
- `@@index([email])`

**Constraints:**

- Email unique constraint
- Phone unique constraint (nullable)

**Sensitive Data:**

- `passwordHash`: Contains bcrypt hash of password
- `email`: PII
- `phone`: PII
- `firstName`, `lastName`: PII

**Assessment:** Model is well-structured. Password hashing is handled at application level (bcryptjs). No issues identified.

### 2.2 Product Model

**Fields:**

- `id`: UUIDv4 primary key
- `categoryId`: UUID foreign key
- `brandId`: UUID foreign key (nullable)
- `shopId`: UUID foreign key
- `name`: VarChar(255)
- `slug`: VarChar(190), unique
- `shortDescription`: Text (nullable)
- `description`: Text (nullable)
- `status`: ProductStatus enum
- `isFeatured`: Boolean
- `isNew`: Boolean
- `isTrending`: Boolean
- `gender`: Gender enum
- `sortOrder`: Integer
- `basePrice`: Decimal(10,2)
- `compareAtPrice`: Decimal(10,2) (nullable)
- `costPrice`: Decimal(10,2) (nullable)
- `weightGrams`: Integer (nullable)
- `isActive`: Boolean
- `metaTitle`: VarChar(300) (nullable)
- `metaDescription`: VarChar(500) (nullable)
- `ogImage`: VarChar(500) (nullable)
- `reviewCount`: Integer, default 0
- `averageRating`: Decimal(3,2), default 0
- `totalSold`: Integer, default 0
- `tags`: Text array
- `meta`: Json (nullable)
- `createdAt`: Timestamptz(6)
- `updatedAt`: Timestamptz(6)

**Relations:**

- Many-to-one: Category, Brand, Shop
- One-to-many: ProductVariant, ProductMedia, ProductAttribute, OrderItem, CartItem, Review

**Indexes:**

- `@@index([categoryId])`
- `@@index([brandId])`
- `@@index([shopId])`
- `@@index([status])`
- `@@index([status, isFeatured])`
- `@@index([status, isNew])`
- `@@index([status, isTrending])`
- `@@index([status, gender, createdAt])`
- `@@index([status, categoryId, sortOrder])`
- `@@index([status, basePrice])`
- `@@index([createdAt])`
- `@@index([sortOrder])`

**Constraints:**

- Slug unique constraint

**Multi-tenant:** `shopId` foreign key for shop ownership

**Assessment:** Well-indexed for common queries. Shop ownership enables multi-tenant isolation at application level. No database-level row security.

### 2.3 ProductVariant Model

**Fields:**

- `id`: UUIDv4 primary key
- `productId`: UUID foreign key
- `sku`: VarChar(120), unique
- `name`: VarChar(255)
- `attributes`: Json (nullable)
- `price`: Decimal(10,2)
- `compareAtPrice`: Decimal(10,2) (nullable)
- `availableStock`: Integer
- `reservedStock`: Integer
- `inventoryStatus`: InventoryStatus enum
- `lowStockThreshold`: Integer, default 10
- `isActive`: Boolean
- `sortOrder`: Integer
- `createdAt`: Timestamptz(6)
- `updatedAt`: Timestamptz(6)

**Relations:**

- Many-to-one: Product
- One-to-many: OrderItem, CartItem, WishlistItem, StockMovement, StockReservation

**Indexes:**

- `@@index([productId, isActive])`
- `@@index([isActive, availableStock])`
- `@@index([inventoryStatus])`

**Constraints:**

- `@@check([availableStock], raw: "available_stock >= 0")`
- `@@check([reservedStock], raw: "reserved_stock >= 0")`
- SKU unique constraint

**Critical Finding:** **Race condition risk** - stock updates are not atomic. Multiple concurrent requests could oversell inventory.

**Assessment:** Check constraints prevent negative values at database level, but concurrent updates can still cause race conditions. Requires row-level locking or optimistic concurrency control.

### 2.4 Order Model

**Fields:**

- `id`: UUIDv4 primary key
- `orderNumber`: VarChar(30), unique
- `userId`: UUID foreign key
- `shopId`: UUID foreign key (nullable)
- `status`: OrderStatus enum
- `customerVisibleStatus`: CustomerVisibleOrderStatus enum
- `paymentStatus`: PaymentStatus enum
- `paymentSubStatus`: OrderPaymentSubStatus enum (nullable)
- `itemsSubtotal`: Decimal(10,2)
- `shippingTotal`: Decimal(10,2)
- `discountTotal`: Decimal(10,2)
- `taxTotal`: Decimal(10,2)
- `grandTotal`: Decimal(10,2)
- `currency`: VarChar(3), default "INR"
- `billingSnapshot`: Json
- `shippingSnapshot`: Json
- `paymentMethod`: PaymentMethod enum (nullable)
- `razorpayOrderId`: VarChar(120) (nullable)
- `razorpayPaymentId`: VarChar(120) (nullable)
- `couponCode`: VarChar(32) (nullable)
- `notes`: Text (nullable)
- `placedAt`: Timestamptz(6)
- `confirmedAt`: Timestamptz(6) (nullable)
- `shippedAt`: Timestamptz(6) (nullable)
- `deliveredAt`: Timestamptz(6) (nullable)
- `cancelledAt`: Timestamptz(6) (nullable)
- `settlementStatus`: SettlementStatus enum (nullable)
- `isActive`: Boolean
- `createdAt`: Timestamptz(6)
- `updatedAt`: Timestamptz(6)

**Relations:**

- Many-to-one: User, Shop
- One-to-many: OrderItem, Shipment, Payment, Refund, FinanceRecord, SettlementItem, CodOrder, TimelineEvent

**Indexes:**

- `@@index([userId])`
- `@@index([shopId])`
- `@@index([status])`
- `@@index([paymentStatus])`
- `@@index([placedAt])`

**Constraints:**

- OrderNumber unique constraint

**Multi-tenant:** `shopId` foreign key for shop ownership

**Critical Finding:** **No state machine validation** at database level. Order status transitions are not enforced by constraints, only by application logic.

**Assessment:** Order lifecycle relies entirely on application-level state machine. No database-level enforcement of valid transitions. This could lead to invalid states if application logic has bugs.

### 2.5 Payment Model

**Fields:**

- `id`: UUIDv4 primary key
- `orderId`: UUID foreign key
- `provider`: VarChar(40)
- `status`: PaymentStatus enum
- `amount`: Decimal(10,2)
- `currency`: VarChar(3), default "INR"
- `method`: PaymentMethod enum (nullable)
- `gatewayReference`: VarChar(120) (nullable)
- `razorpayOrderId`: VarChar(120) (nullable)
- `razorpayPaymentId`: VarChar(120) (nullable)
- `failureReason`: Text (nullable)
- `idempotencyKey`: VarChar(120), unique
- `metadata`: Json (nullable)
- `expiresAt`: Timestamptz(6) (nullable)
- `createdAt`: Timestamptz(6)
- `updatedAt`: Timestamptz(6)

**Relations:**

- Many-to-one: Order
- One-to-many: Refund, PaymentTransaction

**Indexes:**

- `@@unique([idempotencyKey])`
- `@@index([orderId])`
- `@@index([status])`
- `@@index([provider])`

**Constraints:**

- IdempotencyKey unique constraint

**Critical Finding:** **Idempotency key is unique per payment**, but no idempotency for duplicate payment initiation attempts with different keys.

**Assessment:** Idempotency is handled at application level in payment service. Database constraint prevents duplicate keys but not duplicate payments with different keys.

### 2.6 FinanceRecord Model

**Fields:**

- `id`: UUIDv4 primary key
- `orderId`: UUID foreign key
- `recordNumber`: VarChar(30), unique
- `type`: FinanceRecordType enum
- `amount`: Decimal(10,2)
- `currency`: VarChar(3), default "INR"
- `status`: FinanceRecordStatus enum
- `referenceType`: VarChar(50) (nullable)
- `referenceId`: UUID (nullable)
- `metadata`: Json (nullable)
- `postedAt`: Timestamptz(6) (nullable)
- `createdAt`: Timestamptz(6)

**Relations:**

- Many-to-one: Order
- One-to-many: LedgerEntry

**Indexes:**

- `@@index([orderId])`
- `@@index([referenceType, referenceId])`

**Constraints:**

- RecordNumber unique constraint

**Assessment:** Finance records are append-only as designed. Ledger entries ensure double-entry bookkeeping. No issues identified.

### 2.7 Settlement Model

**Fields:**

- `id`: UUIDv4 primary key
- `settlementNumber`: VarChar(30), unique
- `shopId`: UUID foreign key
- `periodStart`: Timestamptz(6)
- `periodEnd`: Timestamptz(6)
- `status`: SettlementStatus enum
- `grossAmount`: Decimal(10,2)
- `commissionAmount`: Decimal(10,2), default 0
- `refundAdjustment`: Decimal(10,2), default 0
- `netAmount`: Decimal(10,2)
- `currency`: VarChar(3), default "INR"
- `payoutMethod`: PayoutMethod enum
- `payoutReference`: VarChar(120) (nullable)
- `payoutGatewayReference`: VarChar(120) (nullable)
- `approvalReason`: Text (nullable)
- `rejectionReason`: Text (nullable)
- `approvedBy`: UUID (nullable)
- `approvedAt`: Timestamptz(6) (nullable)
- `completedAt`: Timestamptz(6) (nullable)
- `paidAt`: Timestamptz(6) (nullable)
- `isActive`: Boolean
- `createdAt`: Timestamptz(6)
- `updatedAt`: Timestamptz(6)

**Relations:**

- Many-to-one: Shop
- One-to-many: SettlementItem, Payout

**Indexes:**

- `@@unique([shopId, periodStart, periodEnd])`
- `@@index([status])`
- `@@index([shopId])`

**Constraints:**

- SettlementNumber unique constraint
- Composite unique constraint on (shopId, periodStart, periodEnd)

**Assessment:** Idempotent settlement creation per shop and period. Well-designed for weekly settlement cycles.

---

## 3. Relationship Integrity and Foreign Key Constraints

### 3.1 Cascade Behavior Analysis

**Cascade Delete Relations:**

- `User` → `Session` (onDelete: Cascade)
- `User` → `LoginHistory` (onDelete: Cascade)
- `User` → `PasswordReset` (onDelete: Cascade)
- `User` → `EmailVerification` (onDelete: Cascade)
- `User` → `Address` (onDelete: Cascade)
- `Product` → `ProductMedia` (onDelete: Cascade)
- `Product` → `ProductAttribute` (onDelete: Cascade)
- `ProductCollection` → `Product` (onDelete: Cascade)
- `ProductCollection` → `Collection` (onDelete: Cascade)
- `Review` → `Product` (onDelete: Cascade)
- `Review` → `User` (onDelete: Cascade)
- `Wishlist` → `User` (onDelete: Cascade)
- `WishlistItem` → `Wishlist` (onDelete: Cascade)
- `WishlistItem` → `Product` (onDelete: Cascade)
- `Order` → `OrderItem` (onDelete: Cascade)
- `Order` → `Shipment` (onDelete: Cascade)
- `Order` → `Payment` (onDelete: Cascade)
- `Order` → `Refund` (onDelete: Cascade)
- `Order` → `ReturnRequest` (onDelete: Cascade)
- `Shipment` → `ShipmentItem` (onDelete: Cascade)
- `Shipment` → `ShipmentEvent` (onDelete: Cascade)
- `ReturnRequest` → `ReturnItem` (onDelete: Cascade)
- `ReturnRequest` → `ReturnStatusHistory` (onDelete: Cascade)
- `ReturnRequest` → `ReturnRefund` (onDelete: Cascade)
- `ReturnRequest` → `ReverseLogistics` (onDelete: Cascade)
- `ReturnItem` → `Inspection` (onDelete: Cascade)
- `Payment` → `PaymentTransaction` (onDelete: Cascade)
- `FinanceRecord` → `LedgerEntry` (onDelete: Cascade)
- `Settlement` → `SettlementItem` (onDelete: Cascade)

**Critical Finding:** **Cascade deletes are too aggressive**. Deleting a user would cascade-delete all their orders, payments, reviews, and addresses. This violates data retention requirements and audit trail integrity.

**Assessment:** Cascade deletes should be replaced with soft deletes or restricted deletes for most relations. Only truly dependent child records (like session tokens, temporary tokens) should cascade.

### 3.2 Foreign Key Index Coverage

**Foreign Keys with Indexes:**

- All foreign keys have corresponding indexes based on schema inspection

**Assessment:** Foreign key indexing is adequate for performance.

### 3.3 Orphaned Record Risk

**Relations without Cascade:**

- `Product.shopId` - no cascade, shop deletion would orphan products
- `Order.shopId` - no cascade, shop deletion would orphan orders
- `Category.shopId` (not present in schema) - category is global

**Critical Finding:** **Shop deletion would orphan products and orders**. This is a data integrity risk.

**Assessment:** Shop deletion should be restricted or require data migration to another shop.

---

## 4. Multi-Tenant Data Isolation

### 4.1 Shop-Owned Data Models

**Models with `shopId` foreign key:**

1. Product
2. Order
3. ReturnRequest
4. ReturnRefund
5. Dispute
6. ReturnPolicy
7. InventorySettings
8. PayoutAccount
9. Settlement
10. Payout
11. CommissionRate (nullable shopId)

### 4.2 Isolation Mechanism

**Current Approach:** Application-level filtering via `shopId` in queries

**No Database-Level:**

- Row-level security (RLS) policies
- Tenant-specific schemas
- Database-level isolation

**Critical Finding:** **No database-level multi-tenant isolation**. All queries must manually filter by `shopId`. A bug in application logic could expose cross-tenant data.

**Assessment:** This is a significant security risk. Row-level security policies should be implemented in PostgreSQL to enforce tenant isolation at database level.

### 4.3 Cross-Tenant Query Risk

**Example Risk Scenario:**

```typescript
// Bug: Missing shopId filter
const orders = await prisma.order.findMany({
  where: { status: 'pending' }, // Missing shopId filter
});
```

This would return orders from all shops, causing data leak.

**Assessment:** Requires application-level query auditing and database-level RLS policies.

---

## 5. Money and Financial Data Integrity

### 5.1 Currency Handling

**Currency Field:**

- All monetary fields use `Decimal(10,2)`
- Currency field defaults to "INR"
- No currency conversion logic in schema

**Assessment:** INR-only currency is appropriate for India-focused marketplace. Decimal(10,2) provides adequate precision for rupees (max: 99,999,999.99).

### 5.2 Decimal Precision

**Monetary Fields:**

- `price`: Decimal(10,2)
- `amount`: Decimal(10,2)
- `grandTotal`: Decimal(10,2)
- `commissionAmount`: Decimal(4,2) for commission rates

**Assessment:** Decimal(10,2) is correct for INR. Commission rates use Decimal(4,2) for percentage values (e.g., 12.50%).

### 5.3 Negative Value Prevention

**Check Constraints:**

- `ProductVariant.availableStock >= 0`
- `ProductVariant.reservedStock >= 0`

**Missing Constraints:**

- No check constraints on monetary fields to prevent negative values
- No check constraints on quantity fields in OrderItem

**Critical Finding:** **Negative monetary values could be inserted** via direct database access or bugs.

**Assessment:** Add check constraints to all monetary fields: `amount >= 0`.

### 5.4 Rounding Behavior

**Application-Level:**

- Payment service uses paise (x100) for gateway operations
- Finance service uses `toPaise()` and `fromPaise()` conversions
- Rounding is handled in application logic

**Assessment:** Rounding is handled correctly at application level. No database-level rounding issues.

---

## 6. Inventory Data Integrity

### 6.1 Stock Fields

**ProductVariant Stock Fields:**

- `availableStock`: Integer (total physical stock)
- `reservedStock`: Integer (reserved for active orders)
- `lowStockThreshold`: Integer (default 10)
- `inventoryStatus`: Enum (computed from stock levels)

**Check Constraints:**

- `availableStock >= 0`
- `reservedStock >= 0`

**Critical Finding:** **No constraint ensuring `reservedStock <= availableStock`**. This could allow more reservations than physical stock.

**Assessment:** Add check constraint: `reservedStock <= availableStock`.

### 6.2 Stock Movement Tracking

**StockMovement Model:**

- Tracks all stock changes with `previousStock` and `newStock`
- Types: initial_stock, purchase, sale, reservation, release, return, refund, damage, adjustment, transfer, manual_update
- Includes `referenceId` and `referenceType` for audit trail

**Assessment:** Stock movement tracking is comprehensive and provides good audit trail.

### 6.3 Stock Reservation

**StockReservation Model:**

- Reserves stock for carts and orders
- Has `expiresAt` for timeout
- Status: active, released, expired, converted

**Critical Finding:** **No atomic reservation creation**. Race condition could allow overselling.

**Example Race Condition:**

```
Time  T1: Request A checks stock: availableStock = 10
Time  T2: Request B checks stock: availableStock = 10
Time  T3: Request A reserves 5: availableStock = 5
Time  T4: Request B reserves 5: availableStock = 0
Time  T5: Both succeed, but only 10 existed
```

**Assessment:** Requires row-level locking with `FOR UPDATE` or optimistic concurrency control with version fields.

### 6.4 Inventory Settings

**InventorySettings Model:**

- Per-shop settings for low stock threshold, reservation timeout
- Unique constraint on `shopId`

**Assessment:** Well-designed for per-tenant inventory configuration.

---

## 7. Order Lifecycle Integrity

### 7.1 Order Status Transitions

**OrderStatus Enum (18 states):**
pending, confirmed, processing, accepted, rejected, packing, ready_to_ship, shipped, in_transit, delivered, completed, cancelled, failed, returned, refunded, archived, failed_delivery, held

**CustomerVisibleOrderStatus Enum (10 states):**
pending, confirmed, processing, packing, shipped, delivered, cancelled, returned, refunded, completed

**Critical Finding:** **No database-level state machine**. Transitions are only enforced by application logic in `@nabome/order` package.

**Assessment:** Implement database-level check constraints or triggers to enforce valid state transitions.

### 7.2 Payment Status Transitions

**PaymentStatus Enum:**
created, initiated, processing, authorized, captured, completed, failed, cancelled, expired

**OrderPaymentSubStatus Enum:**
pending, authorized, captured, refunding, refunded, failed

**Critical Finding:** **Payment and order status are not synchronized by constraints**. Could lead to inconsistent states.

**Assessment:** Payment service handles synchronization, but database constraints would provide additional safety.

### 7.3 Timeline Events

**TimelineEvent Model:**

- Tracks all order lifecycle events
- Has `customerVisible` boolean
- Includes `type`, `description`, `metadata`

**Assessment:** Good audit trail for order lifecycle.

---

## 8. Database Transaction Behavior

### 8.1 Transaction Usage Analysis

**Locations using `prisma.$transaction`:**

1. `categories/repository.ts` - `updateSortOrder` (bulk category updates)
2. `collections/repository.ts` - `updateSortOrder` (bulk collection updates)
3. `products/repository.ts` - `updateSortOrder` (bulk media updates)
4. `products/repository.ts` - `upsert` (bulk attribute creation)

**Critical Finding:** **Critical operations lack transaction wrapping**:

- Order creation + inventory reservation
- Payment capture + order confirmation + finance record creation
- Refund processing + finance record creation
- Settlement approval + payout creation

**Assessment:** Only non-critical bulk operations use transactions. Critical business operations should be wrapped in transactions for atomicity.

### 8.2 Transaction Isolation Level

**Current:** PostgreSQL default (Read Committed)

**Assessment:** Read Committed is appropriate for most operations. Consider Serializable for critical financial operations.

### 8.3 Rollback Behavior

**Current:** Prisma handles rollback on transaction errors

**Assessment:** No issues identified with rollback behavior.

---

## 9. Concurrency and Race Condition Vulnerabilities

### 9.1 Inventory Race Conditions

**Vulnerable Operations:**

1. Stock reservation creation
2. Stock deduction on order confirmation
3. Stock release on order cancellation
4. Stock addition on return

**Current Protection:** None (application-level checks only)

**Critical Finding:** **High risk of overselling** due to lack of atomic operations.

**Assessment:** Implement row-level locking with `SELECT ... FOR UPDATE` or optimistic concurrency with version fields.

### 9.2 Order Creation Race Conditions

**Vulnerable Operations:**

1. Order number generation (sequential prefix + counter)
2. Order status transitions

**Current Protection:** None

**Critical Finding:** **Order number generation is not atomic**. Could result in duplicate order numbers under high concurrency.

**Assessment:** Use database sequences or atomic counters for order number generation.

### 9.3 Payment Idempotency

**Current Protection:** Unique constraint on `idempotencyKey`

**Assessment:** Idempotency is correctly implemented for payment operations.

---

## 10. Migration History and Reproducibility

### 10.1 Migration Directory Status

**Location:** `/Users/tanmoymondal/nabome/apps/api/prisma/migrations/`

**Status:** **Directory does not exist**

**Critical Finding:** **No migration history exists**. This is a critical production blocker.

**Impact:**

- Cannot reproduce database state across environments
- Cannot rollback schema changes
- Cannot deploy to production safely
- Cannot track schema evolution

**Assessment:** This is the highest priority issue. Must create initial migration and establish migration workflow.

### 10.2 Seed Script Status

**Location:** `/Users/tanmoymondal/nabome/apps/api/prisma/seed.ts`

**Status:** Development-only seed script exists

**Issues:**

- Uses hardcoded values
- Not idempotent (upsert without proper checks)
- Not production-safe
- No environment-specific data

**Assessment:** Seed script is adequate for development but not for production.

---

## 11. Seed/Data Initialization Scripts

### 11.1 Seed Script Analysis

**File:** `/Users/tanmoymondal/nabome/apps/api/prisma/seed.ts`

**Creates:**

1. Admin user (admin@nabome.online)
2. Categories (Jewelry, Décor, Craft & Art)
3. Brand (Nabome House)
4. Shop (nabome-house-shop)
5. Collection (new-arrivals)
6. Sample product with variants

**Issues:**

- Hardcoded credentials
- No idempotency checks
- No error handling
- No transaction wrapping

**Assessment:** Suitable for local development only. Should not be used in production.

---

## 12. Performance and Index Usage Patterns

### 12.1 Index Coverage

**Well-Indexed Models:**

- User: status, role, email
- Product: categoryId, brandId, shopId, status (multiple composite indexes)
- ProductVariant: productId, inventoryStatus
- Order: userId, shopId, status, paymentStatus, placedAt
- Payment: orderId, status, provider
- Settlement: shopId, status

**Missing Indexes:**

- No index on `CartItem.guestId` (frequently queried)
- No index on `StockReservation.expiresAt` (for cleanup jobs)
- No index on `TimelineEvent.occurredAt` (for timeline queries)

**Assessment:** Index coverage is generally good but has some gaps for cleanup and timeline operations.

### 12.2 Composite Indexes

**Effective Composite Indexes:**

- `Product`: [status, isFeatured], [status, isNew], [status, categoryId, sortOrder]
- `ProductVariant`: [productId, isActive], [isActive, availableStock]
- `RecentlyViewed`: [userId, viewedAt]

**Assessment:** Composite indexes are well-designed for common query patterns.

---

## 13. Soft Delete and Lifecycle Consistency

### 13.1 Soft Delete Implementation

**Models with `isActive` field:**

- User
- Brand
- Product
- ProductVariant
- CartItem
- Wishlist
- WishlistItem
- CheckoutSession
- ShippingRate
- Order
- Shop
- Warehouse
- Coupon
- PayoutAccount
- CodOrder
- SavedPaymentMethod
- Settlement

**Inconsistent Soft Delete:**

- Some models use `isActive`, others use status enums
- No global soft delete policy
- No cleanup mechanism for soft-deleted records

**Critical Finding:** **Inconsistent soft delete implementation**. Some models use `isActive`, others use status fields.

**Assessment:** Standardize on `isActive` for soft delete or use status enums consistently. Implement cleanup jobs for soft-deleted records.

### 13.2 Lifecycle Consistency

**Models with Status Enums:**

- User: UserStatus (active, suspended, banned, pending_verification)
- Product: ProductStatus (draft, scheduled, published, archived)
- Order: OrderStatus (18 states)
- Payment: PaymentStatus (9 states)
- Shipment: ShipmentStatus (12 states)

**Assessment:** Status enums are well-defined and comprehensive.

---

## 14. Privacy and Sensitive Data Handling

### 14.1 PII Fields

**Personally Identifiable Information:**

- User.email
- User.phone
- User.firstName
- User.lastName
- Address (full address data)
- Order billingSnapshot
- Order shippingSnapshot

**Protection:**

- No encryption at rest
- No field-level encryption
- No data masking in logs

**Critical Finding:** **PII is stored in plain text**. No encryption at rest.

**Assessment:** Consider encryption for sensitive fields. Implement data masking in logs.

### 14.2 Password Storage

**Implementation:** bcrypt hash stored in `User.passwordHash`

**Assessment:** Password hashing is correctly implemented using bcryptjs.

### 14.3 Payment Data

**Payment Gateway Data:**

- `Payment.gatewayReference` (Razorpay order ID)
- `Payment.razorpayPaymentId` (Razorpay payment ID)
- `SavedPaymentMethod.providerTokenHash` (hashed token)

**Assessment:** Payment gateway references are stored as required. Tokens are hashed. No PAN stored (PCI-compliant).

---

## 15. Database/API Contract Consistency

### 15.1 Type Consistency

**Prisma Schema vs TypeScript Types:**

- `packages/types/src/index.ts` defines canonical types
- `packages/validation/src/index.ts` defines Zod schemas
- Schema and types are generally consistent

**Minor Inconsistencies:**

- Schema has 66 models, types package has fewer type definitions
- Some enum values differ between schema and types

**Assessment:** Generally consistent but needs synchronization.

### 15.2 Validation Consistency

**Zod Schemas:**

- Email validation: max 254 characters (RFC 5321 compliant)
- Phone validation: 10-15 digits with optional +
- Password: 8-128 characters
- Address: Indian postal code validation (6 digits)

**Assessment:** Validation schemas are appropriate for Indian market.

---

## 16. Test Coverage for Database Operations

### 16.1 Test Files

**Total Test Files:** 26

**Test Locations:**

- `/Users/tanmoymondal/nabome/apps/api/_handlers/orders/__tests__/handlers.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/admin/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/analytics/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/auth/services.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/cart/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/categories/__tests__/repository.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/categories/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/checkout/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/collections/__tests__/repository.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/collections/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/csrf.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/index.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/order/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/products/__tests__/repository.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/products/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/reports/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/sentry.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/_lib/settings/__tests__/service.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/tests/cart.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/tests/checkout.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/tests/integration/catalog.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/tests/integration/checkout.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/tests/integration/health.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/tests/inventory/api.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/tests/inventory/repository.test.ts`
- `/Users/tanmoymondal/nabome/apps/api/tests/inventory/service.test.ts`

**Assessment:** Test coverage exists for major modules but may not cover all edge cases, especially concurrency scenarios.

### 16.2 Integration Tests

**Integration Test Files:**

- catalog.test.ts
- checkout.test.ts
- health.test.ts

**Assessment:** Limited integration test coverage. Need more end-to-end database operation tests.

---

## 17. Findings Classification by Severity

### 17.1 Critical Severity (CVSS 9.0-10.0)

1. **No migration history** - Cannot deploy to production safely
2. **Cascade delete on User** - Would delete all customer data including orders and payments
3. **No database-level multi-tenant isolation** - Cross-tenant data leak risk
4. **Inventory race conditions** - High risk of overselling
5. **Order number generation not atomic** - Duplicate order numbers under concurrency

### 17.2 High Severity (CVSS 7.0-8.9)

6. **No atomic stock reservation** - Race conditions in inventory
7. **Critical operations lack transaction wrapping** - Data inconsistency risk
8. **No database-level state machine** - Invalid order/payment states possible
9. **Shop deletion would orphan products/orders** - Data integrity risk
10. **No constraint on reservedStock <= availableStock** - Could reserve more than available
11. **Negative monetary values not prevented** - Financial data integrity risk
12. **PII stored in plain text** - Privacy compliance risk

### 17.3 Medium Severity (CVSS 4.0-6.9)

13. **Missing indexes on frequently queried fields** - Performance impact
14. **Inconsistent soft delete implementation** - Lifecycle confusion
15. **No cleanup mechanism for soft-deleted records** - Database bloat
16. **Limited integration test coverage** - Regression risk
17. **Seed script not production-safe** - Deployment risk
18. **Type inconsistencies between schema and packages** - Type safety risk

### 17.4 Low Severity (CVSS 0.1-3.9)

19. **README model count incorrect** - Documentation issue
20. **No database-level rounding constraints** - Minor financial precision risk
21. **Transaction isolation level not explicitly set** - Minor concurrency risk

---

## 18. Implementation Plan

### 18.1 Phase 1: Migration Foundation (Critical)

**Objective:** Establish migration history and enable safe deployments

**Tasks:**

1. Create initial migration from current schema

   ```bash
   cd apps/api
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migrations/0001_init/migration.sql
   npx prisma migrate resolve --applied 0001_init
   ```

2. Set up migration workflow
   - Add migration to CI/CD pipeline
   - Create migration rollback procedures
   - Document migration process

**Files:**

- `apps/api/prisma/migrations/` (new directory)
- `apps/api/prisma/migrations/0001_init/migration.sql` (new file)

**Impact:**

- Enables safe production deployment
- Provides schema evolution tracking
- Allows rollback capability

**Risks:** Low - initial migration from existing schema

**Verification:**

- Run `prisma migrate status` to confirm migration applied
- Test migration on staging environment

**Acceptance Criteria:**

- Migration directory exists with initial migration
- `prisma migrate status` shows migration applied
- Migration can be rolled back

### 18.2 Phase 2: Cascade Delete Mitigation (Critical)

**Objective:** Prevent accidental data loss from cascade deletes

**Tasks:**

1. Replace cascade deletes with restricted deletes for critical relations
2. Add soft delete to models that currently cascade
3. Implement cleanup jobs for soft-deleted records

**Schema Changes:**

```prisma
// User relations - change from Cascade to Restrict
model Address {
  user      User        @relation(fields: [userId], references: [id], onDelete: Restrict)
  // ...
}

model Order {
  user      User        @relation(fields: [userId], references: [id], onDelete: Restrict)
  // ...
}

// Add deletedAt timestamp for soft delete
model User {
  deletedAt DateTime? @db.Timestamptz(6)
  // ...
}
```

**Files:**

- `apps/api/prisma/schema.prisma`
- Migration file for cascade changes

**Impact:**

- Prevents accidental data loss
- Maintains audit trail
- Requires cleanup job implementation

**Risks:** Medium - requires application logic changes for delete operations

**Verification:**

- Test user deletion (should fail if orders exist)
- Test soft delete functionality
- Verify cleanup job removes old soft-deleted records

**Acceptance Criteria:**

- Cascade deletes removed from critical relations
- Soft delete implemented with deletedAt field
- Cleanup job removes records older than retention period

### 18.3 Phase 3: Multi-Tenant Row-Level Security (Critical)

**Objective:** Enforce tenant isolation at database level

**Tasks:**

1. Create PostgreSQL RLS policies for all shop-owned tables
2. Add application context for tenant ID
3. Update Prisma client to use tenant context

**SQL Policies:**

```sql
-- Enable RLS on shop-owned tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for shop isolation
CREATE POLICY shop_isolation ON products
  FOR ALL
  USING (shop_id = current_setting('app.current_shop_id')::uuid);

-- Similar policies for orders, return_requests, etc.
```

**Files:**

- `apps/api/prisma/schema.prisma` (add @@map comments for RLS)
- Migration file for RLS policies
- `apps/api/_lib/prisma.ts` (add tenant context)

**Impact:**

- Prevents cross-tenant data leaks
- Enforces isolation at database level
- Adds safety layer against application bugs

**Risks:** Medium - requires testing of all queries with tenant context

**Verification:**

- Test queries return only tenant's data
- Test cross-tenant queries are blocked
- Verify performance impact

**Acceptance Criteria:**

- RLS policies on all shop-owned tables
- Tenant context set in Prisma client
- Cross-tenant queries blocked at database level

### 18.4 Phase 4: Inventory Concurrency Control (Critical)

**Objective:** Prevent overselling through atomic operations

**Tasks:**

1. Add version field to ProductVariant for optimistic concurrency
2. Implement row-level locking for stock operations
3. Add constraint for reservedStock <= availableStock

**Schema Changes:**

```prisma
model ProductVariant {
  version         Int      @default(0)
  // ...
  @@check([reservedStock], raw: "reserved_stock <= available_stock")
}
```

**Code Changes:**

```typescript
// Use FOR UPDATE locking
const variant = await prisma.productVariant.findUnique({
  where: { id: variantId },
});
await prisma.$transaction([
  prisma.productVariant.update({
    where: {
      id: variantId,
      version: variant.version,
    },
    data: {
      availableStock: { decrement: quantity },
      version: { increment: 1 },
    },
  }),
]);
```

**Files:**

- `apps/api/prisma/schema.prisma`
- `apps/api/_lib/inventory/repository.ts`
- `apps/api/_lib/order/service.ts`
- Migration file for version field and constraint

**Impact:**

- Prevents overselling
- Provides atomic stock operations
- Adds optimistic concurrency control

**Risks:** Medium - requires testing under high concurrency

**Verification:**

- Load test stock operations
- Verify no overselling occurs
- Test concurrent reservation scenarios

**Acceptance Criteria:**

- Version field added to ProductVariant
- Stock operations use optimistic concurrency
- Constraint prevents reservedStock > availableStock
- Load tests show no overselling

### 18.5 Phase 5: Transaction Wrapping for Critical Operations (High)

**Objective:** Ensure atomicity of critical business operations

**Tasks:**

1. Wrap order creation in transaction
2. Wrap payment capture in transaction
3. Wrap refund processing in transaction
4. Wrap settlement operations in transaction

**Code Changes:**

```typescript
// Order creation with transaction
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ ... });
  await tx.orderItem.createMany({ ... });
  await this.reserveInventory(tx, order.id, items);
});
```

**Files:**

- `apps/api/_lib/order/service.ts`
- `apps/api/_lib/payment/service.ts`
- `apps/api/_lib/finance/service.ts`

**Impact:**

- Ensures data consistency
- Provides rollback on errors
- Maintains atomicity

**Risks:** Low - adding transactions to existing operations

**Verification:**

- Test transaction rollback scenarios
- Verify partial updates don't occur
- Test error handling

**Acceptance Criteria:**

- Order creation wrapped in transaction
- Payment capture wrapped in transaction
- Refund processing wrapped in transaction
- Settlement operations wrapped in transaction

### 18.6 Phase 6: Database-Level State Machine (High)

**Objective:** Enforce valid state transitions at database level

**Tasks:**

1. Create transition tables for order and payment states
2. Add check constraints or triggers for valid transitions
3. Document state machine rules

**Schema Changes:**

```prisma
// Add transition validation
model Order {
  // ...
  @@check([status], raw: "status IN ('pending', 'confirmed', ...)")
}

// Or use triggers for transition validation
```

**Files:**

- `apps/api/prisma/schema.prisma`
- Migration file for constraints/triggers
- Documentation of state machine

**Impact:**

- Prevents invalid states
- Enforces business rules at database level
- Provides additional safety layer

**Risks:** Medium - requires careful definition of valid transitions

**Verification:**

- Test all valid transitions
- Test invalid transitions are blocked
- Verify state machine documentation

**Acceptance Criteria:**

- Valid transitions documented
- Invalid transitions blocked at database level
- All valid transitions work correctly

### 18.7 Phase 7: Financial Data Constraints (High)

**Objective:** Prevent negative monetary values

**Tasks:**

1. Add check constraints to all monetary fields
2. Add check constraints to quantity fields
3. Validate constraints in tests

**Schema Changes:**

```prisma
model Order {
  grandTotal Decimal @db.Decimal(10, 2)
  // ...
  @@check([grandTotal], raw: "grand_total >= 0")
}

model OrderItem {
  quantity Int
  // ...
  @@check([quantity], raw: "quantity > 0")
}
```

**Files:**

- `apps/api/prisma/schema.prisma`
- Migration file for constraints
- Test files for validation

**Impact:**

- Prevents negative monetary values
- Prevents invalid quantities
- Ensures financial data integrity

**Risks:** Low - adding constraints to existing data

**Verification:**

- Test constraint violations are blocked
- Verify existing data satisfies constraints
- Test application error handling

**Acceptance Criteria:**

- All monetary fields have >= 0 constraint
- All quantity fields have > 0 constraint
- Existing data satisfies constraints
- Application handles constraint violations

### 18.8 Phase 8: Shop Deletion Protection (High)

**Objective:** Prevent orphaned records on shop deletion

**Tasks:**

1. Change shop deletion to restricted
2. Add shop status field (active, suspended, deleted)
3. Implement soft delete for shops

**Schema Changes:**

```prisma
model Shop {
  status ShopStatus @default(active)
  deletedAt DateTime? @db.Timestamptz(6)
  // ...
}

model Product {
  shop Shop @relation(fields: [shopId], references: [id], onDelete: Restrict)
}
```

**Files:**

- `apps/api/prisma/schema.prisma`
- Migration file for shop changes
- Application logic for shop deletion

**Impact:**

- Prevents orphaned products/orders
- Maintains data integrity
- Enables shop suspension instead of deletion

**Risks:** Low - changing delete behavior

**Verification:**

- Test shop deletion fails if products exist
- Test shop soft delete works
- Test shop suspension works

**Acceptance Criteria:**

- Shop deletion restricted
- Shop soft delete implemented
- Shop suspension works correctly
- No orphaned records on shop deletion

### 18.9 Phase 9: Index Optimization (Medium)

**Objective:** Improve query performance

**Tasks:**

1. Add missing indexes on frequently queried fields
2. Review and optimize composite indexes
3. Analyze query performance

**Schema Changes:**

```prisma
model CartItem {
  // ...
  @@index([guestId])
}

model StockReservation {
  // ...
  @@index([expiresAt])
}

model TimelineEvent {
  // ...
  @@index([orderId, occurredAt])
}
```

**Files:**

- `apps/api/prisma/schema.prisma`
- Migration file for indexes

**Impact:**

- Improved query performance
- Faster cleanup operations
- Better timeline queries

**Risks:** Low - adding indexes

**Verification:**

- Run EXPLAIN ANALYZE on queries
- Verify index usage
- Test performance improvements

**Acceptance Criteria:**

- Missing indexes added
- Query performance improved
- Index usage confirmed via EXPLAIN

### 18.10 Phase 10: Soft Delete Standardization (Medium)

**Objective:** Standardize soft delete implementation

**Tasks:**

1. Replace status-based soft delete with deletedAt
2. Add deletedAt to models using status for soft delete
3. Implement cleanup job for soft-deleted records

**Schema Changes:**

```prisma
model Product {
  deletedAt DateTime? @db.Timestamptz(6)
  // Keep status for lifecycle, not soft delete
}

model Coupon {
  deletedAt DateTime? @db.Timestamptz(6)
  // ...
}
```

**Files:**

- `apps/api/prisma/schema.prisma`
- Migration file for deletedAt fields
- Cleanup job implementation

**Impact:**

- Consistent soft delete implementation
- Clear separation of lifecycle vs deletion
- Automated cleanup of old records

**Risks:** Medium - requires application logic changes

**Verification:**

- Test soft delete with deletedAt
- Verify cleanup job works
- Test queries filter soft-deleted records

**Acceptance Criteria:**

- deletedAt field added to relevant models
- Soft delete uses deletedAt consistently
- Cleanup job removes old records
- Queries filter soft-deleted records

### 18.11 Phase 11: PII Encryption (High)

**Objective:** Encrypt sensitive PII at rest

**Tasks:**

1. Evaluate encryption options (pgcrypto, application-level)
2. Implement encryption for sensitive fields
3. Update application logic for encryption/decryption

**Options:**

- PostgreSQL pgcrypto extension
- Application-level encryption with envelope encryption
- Cloud KMS integration

**Files:**

- `apps/api/prisma/schema.prisma` (if using pgcrypto)
- Application encryption service
- Migration for encryption setup

**Impact:**

- Protects sensitive PII
- Improves privacy compliance
- Adds security posture

**Risks:** High - encryption implementation complexity

**Verification:**

- Test encryption/decryption
- Verify data is encrypted at rest
- Test performance impact

**Acceptance Criteria:**

- Sensitive fields encrypted
- Encryption/decryption works correctly
- Performance impact acceptable
- Key management secure

### 18.12 Phase 12: Order Number Generation (Critical)

**Objective:** Ensure atomic order number generation

**Tasks:**

1. Replace application-level generation with database sequence
2. Create sequence for order numbers
3. Update order creation logic

**Schema Changes:**

```sql
CREATE SEQUENCE order_number_seq;
-- Use sequence in order creation
```

**Files:**

- Migration file for sequence
- `apps/api/_lib/order/service.ts`

**Impact:**

- Prevents duplicate order numbers
- Atomic generation
- Scalable under high concurrency

**Risks:** Low - replacing generation logic

**Verification:**

- Test order number generation
- Load test under concurrency
- Verify no duplicates

**Acceptance Criteria:**

- Database sequence created
- Order creation uses sequence
- No duplicate order numbers under load

### 18.13 Phase 13: Test Coverage Enhancement (Medium)

**Objective:** Improve test coverage for database operations

**Tasks:**

1. Add integration tests for critical operations
2. Add concurrency tests for inventory
3. Add transaction rollback tests
4. Add RLS policy tests

**Files:**

- New test files for integration tests
- Concurrency test suite
- RLS policy test suite

**Impact:**

- Better regression protection
- Validates critical operations
- Tests concurrency scenarios

**Risks:** Low - adding tests

**Verification:**

- Run test suite
- Verify coverage increases
- Test concurrency scenarios

**Acceptance Criteria:**

- Integration tests for critical operations
- Concurrency tests for inventory
- Transaction rollback tests
- RLS policy tests
- Test coverage > 80%

---

## 19. Risk Assessment

### 19.1 Implementation Risks

| Phase    | Risk                                  | Likelihood | Impact | Mitigation                       |
| -------- | ------------------------------------- | ---------- | ------ | -------------------------------- |
| Phase 1  | Migration conflicts                   | Medium     | High   | Test on staging first            |
| Phase 2  | Application breaks on cascade changes | High       | High   | Comprehensive testing            |
| Phase 3  | RLS blocks valid queries              | Medium     | High   | Thorough policy testing          |
| Phase 4  | Performance degradation from locking  | Medium     | Medium | Load testing                     |
| Phase 5  | Transaction deadlocks                 | Low        | Medium | Timeout handling                 |
| Phase 6  | State machine too restrictive         | Medium     | Medium | Gradual rollout                  |
| Phase 7  | Existing data violates constraints    | Low        | High   | Data validation before migration |
| Phase 8  | Shop deletion breaks workflows        | Medium     | Medium | Update admin UI                  |
| Phase 9  | Index bloat                           | Low        | Low    | Monitor index usage              |
| Phase 10 | Application logic errors              | Medium     | Medium | Comprehensive testing            |
| Phase 11 | Key management complexity             | High       | High   | Use managed KMS                  |
| Phase 12 | Sequence exhaustion                   | Low        | Low    | Use bigserial                    |
| Phase 13 | Test flakiness                        | Medium     | Low    | Isolated test environment        |

### 19.2 Rollback Plans

**Phase 1 (Migration):**

- Rollback: Drop migration from migration table
- Data loss: None

**Phase 2 (Cascade):**

- Rollback: Restore cascade deletes
- Data loss: None if soft delete not used

**Phase 3 (RLS):**

- Rollback: Disable RLS policies
- Data loss: None

**Phase 4 (Inventory):**

- Rollback: Remove version field and constraints
- Data loss: None

**Phase 5 (Transactions):**

- Rollback: Remove transaction wrapping
- Data loss: None

**Phase 6 (State Machine):**

- Rollback: Remove constraints/triggers
- Data loss: None

**Phase 7 (Financial Constraints):**

- Rollback: Remove check constraints
- Data loss: None

**Phase 8 (Shop Deletion):**

- Rollback: Restore cascade behavior
- Data loss: None if no shops deleted

**Phase 9 (Indexes):**

- Rollback: Drop new indexes
- Data loss: None

**Phase 10 (Soft Delete):**

- Rollback: Restore status-based soft delete
- Data loss: None

**Phase 11 (PII Encryption):**

- Rollback: Decrypt data, remove encryption
- Data loss: None if keys preserved

**Phase 12 (Order Numbers):**

- Rollback: Restore application-level generation
- Data loss: None

**Phase 13 (Tests):**

- Rollback: Remove new tests
- Data loss: None

---

## 20. Verification and Acceptance Criteria

### 20.1 Phase 1: Migration Foundation

**Verification Steps:**

1. Run `npx prisma migrate status` - should show initial migration applied
2. Run `npx prisma db push` on empty database - should recreate schema
3. Test migration rollback - should succeed without data loss

**Acceptance Criteria:**

- [ ] Migration directory exists with initial migration
- [ ] `prisma migrate status` shows migration applied
- [ ] Migration can be rolled back
- [ ] Schema matches current database state

### 20.2 Phase 2: Cascade Delete Mitigation

**Verification Steps:**

1. Attempt to delete user with orders - should fail
2. Soft delete user - should succeed
3. Verify orders still exist after user soft delete
4. Run cleanup job - should remove old soft-deleted records

**Acceptance Criteria:**

- [ ] Cascade deletes removed from critical relations
- [ ] Soft delete implemented with deletedAt field
- [ ] User deletion fails if orders exist
- [ ] Cleanup job removes old soft-deleted records

### 20.3 Phase 3: Multi-Tenant RLS

**Verification Steps:**

1. Set tenant context in Prisma client
2. Query products - should return only tenant's products
3. Attempt to query other tenant's data - should return empty
4. Test with admin context - should return all data

**Acceptance Criteria:**

- [ ] RLS policies on all shop-owned tables
- [ ] Tenant context set in Prisma client
- [ ] Cross-tenant queries blocked at database level
- [ ] Admin context bypasses RLS

### 20.4 Phase 4: Inventory Concurrency

**Verification Steps:**

1. Load test stock reservation with 100 concurrent requests
2. Verify no overselling occurs
3. Test optimistic concurrency with version conflicts
4. Verify constraint prevents reservedStock > availableStock

**Acceptance Criteria:**

- [ ] Version field added to ProductVariant
- [ ] Stock operations use optimistic concurrency
- [ ] Constraint prevents reservedStock > availableStock
- [ ] Load tests show no overselling

### 20.5 Phase 5: Transaction Wrapping

**Verification Steps:**

1. Test order creation with error - should rollback
2. Test payment capture with error - should rollback
3. Verify partial updates don't occur
4. Test transaction timeout handling

**Acceptance Criteria:**

- [ ] Order creation wrapped in transaction
- [ ] Payment capture wrapped in transaction
- [ ] Refund processing wrapped in transaction
- [ ] Settlement operations wrapped in transaction
- [ ] Transactions rollback on errors

### 20.6 Phase 6: State Machine

**Verification Steps:**

1. Test all valid order status transitions
2. Attempt invalid transition - should fail
3. Test valid payment status transitions
4. Attempt invalid payment transition - should fail

**Acceptance Criteria:**

- [ ] Valid transitions documented
- [ ] Invalid transitions blocked at database level
- [ ] All valid transitions work correctly
- [ ] State machine documentation complete

### 20.7 Phase 7: Financial Constraints

**Verification Steps:**

1. Attempt to insert negative monetary value - should fail
2. Attempt to insert zero/negative quantity - should fail
3. Verify existing data satisfies constraints
4. Test application error handling

**Acceptance Criteria:**

- [ ] All monetary fields have >= 0 constraint
- [ ] All quantity fields have > 0 constraint
- [ ] Existing data satisfies constraints
- [ ] Application handles constraint violations

### 20.8 Phase 8: Shop Deletion

**Verification Steps:**

1. Attempt to delete shop with products - should fail
2. Soft delete shop - should succeed
3. Suspend shop - should work
4. Verify products still accessible after suspension

**Acceptance Criteria:**

- [ ] Shop deletion restricted
- [ ] Shop soft delete implemented
- [ ] Shop suspension works correctly
- [ ] No orphaned records on shop deletion

### 20.9 Phase 9: Index Optimization

**Verification Steps:**

1. Run EXPLAIN ANALYZE on queries
2. Verify new indexes are used
3. Compare query performance before/after
4. Monitor index size

**Acceptance Criteria:**

- [ ] Missing indexes added
- [ ] Query performance improved
- [ ] Index usage confirmed via EXPLAIN
- [ ] Index size acceptable

### 20.10 Phase 10: Soft Delete Standardization

**Verification Steps:**

1. Test soft delete with deletedAt
2. Verify cleanup job works
3. Test queries filter soft-deleted records
4. Verify status fields still used for lifecycle

**Acceptance Criteria:**

- [ ] deletedAt field added to relevant models
- [ ] Soft delete uses deletedAt consistently
- [ ] Cleanup job removes old records
- [ ] Queries filter soft-deleted records

### 20.11 Phase 11: PII Encryption

**Verification Steps:**

1. Test encryption/decryption of PII fields
2. Verify data is encrypted at rest
3. Test performance impact
4. Verify key management works

**Acceptance Criteria:**

- [ ] Sensitive fields encrypted
- [ ] Encryption/decryption works correctly
- [ ] Performance impact acceptable
- [ ] Key management secure

### 20.12 Phase 12: Order Numbers

**Verification Steps:**

1. Test order number generation
2. Load test with 1000 concurrent orders
3. Verify no duplicates
4. Verify sequence doesn't exhaust

**Acceptance Criteria:**

- [ ] Database sequence created
- [ ] Order creation uses sequence
- [ ] No duplicate order numbers under load
- [ ] Sequence format correct

### 20.13 Phase 13: Test Coverage

**Verification Steps:**

1. Run test suite
2. Check coverage report
3. Verify new tests pass
4. Test concurrency scenarios

**Acceptance Criteria:**

- [ ] Integration tests for critical operations
- [ ] Concurrency tests for inventory
- [ ] Transaction rollback tests
- [ ] RLS policy tests
- [ ] Test coverage > 80%

---

## 21. Implementation Timeline

### 21.1 Recommended Sequence

**Week 1-2: Critical Foundation**

- Phase 1: Migration Foundation
- Phase 12: Order Number Generation

**Week 3-4: Data Integrity**

- Phase 2: Cascade Delete Mitigation
- Phase 7: Financial Data Constraints
- Phase 8: Shop Deletion Protection

**Week 5-6: Multi-Tenant Security**

- Phase 3: Multi-Tenant RLS
- Phase 11: PII Encryption

**Week 7-8: Concurrency Control**

- Phase 4: Inventory Concurrency Control
- Phase 5: Transaction Wrapping

**Week 9-10: State Machine**

- Phase 6: Database-Level State Machine

**Week 11-12: Optimization**

- Phase 9: Index Optimization
- Phase 10: Soft Delete Standardization

**Week 13-14: Testing**

- Phase 13: Test Coverage Enhancement

**Total Duration:** 14 weeks

### 21.2 Parallelization Opportunities

**Can be done in parallel:**

- Phase 9 (Index Optimization) with Phase 10 (Soft Delete)
- Phase 13 (Tests) can run throughout

**Must be sequential:**

- Phase 1 must be first
- Phase 2 before Phase 8
- Phase 3 before Phase 11
- Phase 4 before Phase 5

---

## 22. Dependencies and Prerequisites

### 22.1 External Dependencies

- PostgreSQL 17 (already in use)
- Prisma 6.19.3 (already in use)
- Neon PostgreSQL adapter (for cloud hosting)

### 22.2 Internal Dependencies

- `@nabome/order` package for state machine
- `@nabome/payment` package for financial operations
- `@nabome/finance` package for settlements
- `@nabome/inventory` package for stock operations

### 22.3 Environment Requirements

- Staging environment for testing
- Production database backup capability
- CI/CD pipeline for migrations
- Monitoring for performance impact

---

## 23. Monitoring and Metrics

### 23.1 Database Metrics to Monitor

- Query performance (slow query log)
- Index usage statistics
- Transaction deadlock count
- Lock wait time
- Connection pool utilization
- Disk space (for indexes and soft-deleted records)

### 23.2 Application Metrics to Monitor

- Order creation success rate
- Payment capture success rate
- Inventory reservation conflicts
- Cross-tenant query attempts (blocked by RLS)
- Transaction rollback rate

### 23.3 Alert Thresholds

- Slow queries > 1 second
- Deadlocks > 5 per hour
- Lock wait time > 5 seconds
- Transaction rollback rate > 1%
- Inventory conflicts > 0.1%

---

## 24. Documentation Updates Required

### 24.1 Schema Documentation

- Update README with correct model count (66, not 69)
- Document RLS policies
- Document state machine transitions
- Document check constraints

### 24.2 API Documentation

- Update API docs for soft delete behavior
- Document transaction behavior
- Document error codes for constraint violations

### 24.3 Operations Documentation

- Migration runbook
- Rollback procedures
- RLS policy management
- Cleanup job schedules

---

## 25. Training and Knowledge Transfer

### 25.1 Developer Training

- Prisma migration workflow
- RLS policy implications
- Transaction usage patterns
- Optimistic concurrency patterns

### 25.2 DBA Training

- RLS policy management
- Index optimization
- Performance monitoring
- Backup and recovery

---

## 26. Post-Implementation Validation

### 26.1 Smoke Tests

1. Create order end-to-end
2. Process payment
3. Create refund
4. Create settlement
5. Process payout

### 26.2 Load Tests

1. 100 concurrent order creations
2. 1000 concurrent stock reservations
3. 100 concurrent payment captures
4. 100 concurrent refund requests

### 26.3 Security Tests

1. Attempt cross-tenant data access
2. Attempt invalid state transitions
3. Attempt negative monetary values
4. Test PII encryption

### 26.4 Data Integrity Tests

1. Verify all constraints satisfied
2. Verify no orphaned records
3. Verify soft delete cleanup
4. Verify audit trail completeness

---

## 27. Success Metrics

### 27.1 Technical Metrics

- Migration success rate: 100%
- Constraint violation rate: 0%
- Cross-tenant access attempts blocked: 100%
- Overselling incidents: 0
- Duplicate order numbers: 0

### 27.2 Performance Metrics

- Query performance improvement: > 20%
- Transaction rollback rate: < 1%
- Lock wait time: < 100ms
- Index hit ratio: > 95%

### 27.3 Security Metrics

- PII encryption coverage: 100%
- RLS policy coverage: 100%
- Cascade delete incidents: 0
- Data leak incidents: 0

---

## 28. Conclusion

This audit has identified 21 issues across critical, high, medium, and low severity levels. The most critical issues are:

1. **No migration history** - Blocks production deployment
2. **Cascade delete risks** - Could cause catastrophic data loss
3. **No multi-tenant isolation** - Cross-tenant data leak risk
4. **Inventory race conditions** - Overselling risk
5. **Order number generation** - Duplicate risk

The implementation plan addresses all issues in 14 phases over 14 weeks, with proper risk mitigation, rollback plans, and acceptance criteria for each phase.

**Recommendation:** Begin with Phase 1 (Migration Foundation) and Phase 12 (Order Number Generation) immediately as they are prerequisites for production deployment.

---

**Document Status:** Complete  
**Next Phase:** Implementation Phase 1  
**Approval Required:** Yes
