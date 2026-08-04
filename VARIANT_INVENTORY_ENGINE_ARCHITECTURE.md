# নবME (Nabome) — Variant, Attribute & Inventory Engine Architecture Standard

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for variant generation, attribute management, SKU strategy, inventory engine, stock lifecycle, and inventory architecture
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), PRODUCT_ENGINE_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [Global Attribute System](#2-global-attribute-system)
3. [Variant Engine](#3-variant-engine)
4. [SKU Strategy](#4-sku-strategy)
5. [Inventory Engine](#5-inventory-engine)
6. [Stock Operations](#6-stock-operations)
7. [Pricing Relationship](#7-pricing-relationship)
8. [Product Relationship](#8-product-relationship)
9. [Search & Filters](#9-search--filters)
10. [Validation](#10-validation)
11. [Permissions](#11-permissions)
12. [Performance](#12-performance)
13. [Security](#13-security)
14. [Accessibility](#14-accessibility)
15. [Future Readiness](#15-future-readiness)
16. [Mandatory Rules for AI Agents](#16-mandatory-rules-for-ai-agents)

---

## 1. Architecture Philosophy

### 1.1 What

The foundational principles governing the Variant Engine, Global Attribute System, SKU strategy, and Inventory Engine for the Nabome platform.

### 1.2 Why

- **Dynamic by design:** Admin defines variant types; the system never hardcodes them
- **Scalability:** Supports millions of variants without redesign
- **Independence:** Variant Engine and Inventory Engine are independent modules
- **Consistency:** Every stock movement is auditable, every SKU is permanent
- **Future-proof:** Architecture expands for warehouses, multi-location, AI suggestions

### 1.3 Where

Every product listing, variant selector, cart item, order line, inventory dashboard, stock report, and admin panel across the Nabome platform.

---

### 1.4 Core Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Variant types are never hardcoded** | Admin defines variant types globally; shop owners select what they need | Unlimited product categories without redesign |
| **Attributes are global** | Attributes exist at platform level, not product level | Consistency, reuse, filtering |
| **Every SKU is permanent** | Once created, a SKU never changes | Order history integrity, inventory tracking |
| **Every stock movement is auditable** | Every add, reduce, reserve, release is logged | Compliance, debugging, reconciliation |
| **Inventory is independent** | Inventory Engine does not depend on Product Engine | Modular architecture, future flexibility |
| **Stock consistency is non-negotiable** | Concurrent updates must never corrupt stock | Revenue protection, customer trust |
| **Combinations are generated, not manual** | System generates all valid combinations from selected attributes | Efficiency, completeness |
| **Mobile-first inventory** | Admin inventory management works perfectly on mobile | 70%+ admin traffic is mobile |

### 1.5 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hardcode variant types (Size, Color) | Cannot support shoes, electronics, food | Dynamic variant types via database |
| Put stock on product level | Cannot track per-SKU inventory | Stock on variant level |
| Allow SKU changes after creation | Breaks order history, inventory tracking | SKU is immutable after creation |
| Skip inventory audit logs | Cannot debug stock discrepancies | Log every stock movement |
| Couple inventory to product | Cannot add warehouses, multi-location | Independent inventory module |
| Manual combination entry | Human error, incomplete matrices | Auto-generate combinations |
| No reserved stock | Overselling during checkout | Reserve stock during checkout |
| Negative stock | Impossible inventory state | Enforce non-negative constraint |

---

## 2. Global Attribute System

### 2.1 What

A platform-level system where administrators define attribute types (Color, Size, Material, Weight, etc.), attribute values, and attribute groups. Shop owners select which attributes apply to their products. No attribute is hardcoded.

### 2.2 Why

- **Dynamic products:** Fashion, electronics, food, furniture — all use different attributes
- **Consistency:** Same attribute names across all products (no "colour" vs "color")
- **Filtering:** Global attributes power dynamic filter systems
- **Reusability:** One attribute definition serves millions of products
- **Scalability:** New attributes added without schema changes

### 2.3 Where

Admin panel attribute management, product creation forms, product detail pages, search filters, API handlers in `api/_handlers/admin/attributes/`, frontend components in `src/features/admin/attributes/`.

---

### 2.4 Attribute Philosophy

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Ownership** | Platform (admin) owns attributes | Consistency across all shops |
| **Hierarchy** | Platform → Attribute Type → Attribute → Value | Structured organization |
| **Reuse** | One attribute serves unlimited products | No duplication |
| **Validation** | Each attribute defines its own validation rules | Type-safe values |
| **Visibility** | Attributes can be visible/hidden per product | Flexible display |
| **Extensibility** | Custom attributes via JSONB | Future-proof |

### 2.5 Attribute Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTRIBUTE HIERARCHY                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Platform (Admin)                             │   │
│  │  Defines: Attribute Types, Attribute Groups               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Attribute Types                              │   │
│  │  Color | Size | Material | Weight | Capacity | ...       │   │
│  │  Each type has: name, slug, dataType, validationRules    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Attribute Values                             │   │
│  │  Red (#FF0000) | Blue (#0000FF) | Cotton | Polyester     │   │
│  │  Each value has: name, slug, hexCode (optional), meta    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Product Attribute Selection                  │   │
│  │  Shop owner selects: Which attribute types for product    │   │
│  │  System generates: All valid combinations as variants     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 Attribute Types

| Type | Purpose | DataType | Validation | Example Values |
|------|---------|----------|------------|----------------|
| **Color** | Visual options | `color` | hexCode required, name required | Red (#FF0000), Blue (#0000FF) |
| **Size** | Physical dimensions | `select` | values from predefined list | XS, S, M, L, XL, XXL |
| **Material** | Composition | `select` | values from predefined list | Cotton, Polyester, Silk |
| **Weight** | Physical weight | `text` | numeric with unit | 180 GSM, 250g |
| **Capacity** | Volume/space | `text` | numeric with unit | 256GB, 500ml |
| **Finish** | Surface treatment | `select` | values from predefined list | Matte, Glossy, Brushed |
| **Edition** | Special versions | `select` | values from predefined list | Standard, Limited, Collector |
| **Length** | Dimension | `text` | numeric with unit | 30cm, 12in |
| **Width** | Dimension | `text` | numeric with unit | 20cm, 8in |
| **Custom** | Future extensibility | `text` | any string | Any value |

### 2.7 Attribute Data Types

| DataType | Description | Storage | Validation | Example |
|----------|-------------|---------|------------|---------|
| `color` | Color with hex code | `name` + `hexCode` | hex format `#RRGGBB` | Red (#FF0000) |
| `select` | Single selection from list | `valueId` | must exist in attribute values | Size: M |
| `multi_select` | Multiple selections | `valueIds[]` | each must exist | Tags: [Cotton, Premium] |
| `text` | Free text | `value` | max 100 chars | "180 GSM" |
| `number` | Numeric value | `value` | valid number | "250" |
| `boolean` | True/false | `value` | "true" or "false" | "true" |

### 2.8 Attribute Ownership

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Platform admin** | Creates attribute types and values | Consistency across all shops |
| **Shop owner** | Selects which attributes apply to their products | Product-specific configuration |
| **No shop-specific attributes** | All attributes are global | Prevents duplication, enables filtering |
| **Attribute values** | Platform-managed, shop owner cannot create | Data consistency |

### 2.9 Attribute Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTRIBUTE LIFECYCLE                            │
│                                                                  │
│  1. Admin creates Attribute Type                                 │
│     → Name, slug, dataType, validationRules                     │
│     → Status: active                                             │
│                                                                  │
│  2. Admin creates Attribute Values                               │
│     → Name, slug, hexCode (for color), sortOrder                 │
│     → Status: active                                             │
│                                                                  │
│  3. Shop Owner selects Attribute Types for Product               │
│     → e.g., "This product uses Color + Size"                    │
│     → System shows available values for selected types           │
│                                                                  │
│  4. System generates Combinations                                │
│     → Cartesian product of selected attribute values              │
│     → Each combination = one variant                             │
│                                                                  │
│  5. Shop Owner configures Variants                               │
│     → SKU, stock, price per combination                          │
│                                                                  │
│  6. Admin can deactivate Attribute Type                          │
│     → Existing products unaffected                               │
│     → New products cannot select deactivated type                │
│                                                                  │
│  7. Admin can deactivate Attribute Value                         │
│     → Existing variants with this value stay active              │
│     → New combinations cannot use deactivated value              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.10 Attribute Visibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Filter visible** | Attribute powers search filters | Customer discovery |
| **Detail visible** | Attribute shown on product detail page | Inform purchase |
| **Card visible** | Attribute shown on product cards | Quick identification |
| **Hidden** | Attribute exists but not displayed | Internal use only |
| **Admin only** | Attribute visible only in admin panel | Internal categorization |

### 2.11 Attribute Validation Rules

```typescript
interface AttributeValidationRules {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  allowedValues?: string[];
  customValidator?: string;
}
```

### 2.12 Attribute Reuse

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Cross-product** | Same attribute serves multiple products | Consistency |
| **Cross-category** | Attribute available across categories | Flexibility |
| **Cross-shop** | Same attribute available in all shops | Platform consistency |
| **Inheritance** | Category can suggest default attributes | Efficiency |

### 2.13 Attribute Examples

| Attribute | Type | DataType | Values | Used By |
|-----------|------|----------|--------|---------|
| **Color** | visual | `color` | Red, Blue, Black, White, Navy | Fashion, Electronics |
| **Size** | physical | `select` | XS, S, M, L, XL, XXL | Fashion |
| **Material** | composition | `select` | Cotton, Polyester, Silk, Leather | Fashion, Furniture |
| **Weight** | physical | `text` | 180 GSM, 250g | Fashion, Food |
| **Capacity** | volume | `text` | 256GB, 512GB, 1TB | Electronics |
| **Finish** | surface | `select` | Matte, Glossy, Brushed | Electronics, Furniture |
| **Edition** | version | `select` | Standard, Limited, Collector | Collectibles |
| **Length** | dimension | `text` | 30cm, 12in | Fashion, Furniture |
| **Width** | dimension | `text` | 20cm, 8in | Fashion, Furniture |

### 2.14 Common Attribute Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Hardcode "Color" and "Size" | Cannot support other product types | Dynamic attribute types |
| Shop-specific attributes | Duplication, inconsistent filtering | Platform-level attributes |
| No validation rules | Invalid attribute values | Define validation per type |
| No attribute ordering | Random display order | sortOrder on attributes |
| No attribute groups | Unrelated attributes mixed | Group related attributes |
| Allow shop owners to create attributes | Inconsistent data | Platform admin only |

---

## 3. Variant Engine

### 3.1 What

The dynamic system that generates product variants from selected attributes, manages variant combinations, handles SKU generation, and provides variant-level operations for inventory and pricing.

### 3.2 Why

- **Dynamic:** Supports any product type without code changes
- **Efficient:** Auto-generate combinations from attribute matrix
- **Complete:** Every valid combination is a purchasable SKU
- **Flexible:** Shop owners select only relevant attributes
- **Scalable:** Millions of variants without performance degradation

### 3.3 Where

Product creation form (variant builder), product detail page (variant selector), cart, checkout, order items, inventory management, search filters.

---

### 3.4 Variant Types

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Source** | Global Attribute System | Dynamic, not hardcoded |
| **Selection** | Shop owner selects per product | Only relevant attributes |
| **Minimum** | At least 1 variant type per product | Product must have variants |
| **Maximum** | No limit (recommended ≤ 5) | Performance, UX |
| **Ordering** | Admin sets display order | Consistent presentation |

### 3.5 Variant Values

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Source** | Attribute Values from Global System | Consistent values |
| **Selection** | Shop owner selects values per attribute type | Product-specific |
| **Minimum** | At least 1 value per selected attribute type | Must have something to combine |
| **Maximum** | No limit (recommended ≤ 20 per type) | Performance |
| **Ordering** | Admin sets display order | Consistent presentation |

### 3.6 Variant Groups

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Group related variant types | Organized display |
| **Examples** | "Physical" (Size, Weight), "Visual" (Color, Finish) | Logical grouping |
| **Admin control** | Admin creates groups | Flexible organization |
| **Display** | Groups shown in variant selector | Structured selection |

### 3.7 Variant Combinations

#### 3.7.1 Combination Generation

```
┌─────────────────────────────────────────────────────────────────┐
│                    VARIANT COMBINATION MATRIX                     │
│                                                                  │
│  Product: Premium Cotton T-Shirt                                 │
│  Selected Attributes: Color, Size                                │
│                                                                  │
│  Color Values: Red, Blue, Black                                  │
│  Size Values: S, M, L                                            │
│                                                                  │
│  ┌─────────┬─────────┬─────────┬─────────┐                      │
│  │         │   Red   │  Blue   │  Black  │                      │
│  ├─────────┼─────────┼─────────┼─────────┤                      │
│  │    S    │  VAR-1  │  VAR-2  │  VAR-3  │                      │
│  │    M    │  VAR-4  │  VAR-5  │  VAR-6  │                      │
│  │    L    │  VAR-7  │  VAR-8  │  VAR-9  │                      │
│  └─────────┴─────────┴─────────┴─────────┘                      │
│                                                                  │
│  Total variants: 3 colors × 3 sizes = 9 variants                │
│  Each variant has: unique SKU, individual stock, optional price  │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.7.2 Combination Validation

| Check | Standard | Action |
|-------|----------|--------|
| **Duplicate detection** | Same attribute values = same combination | Prevent duplicate variants |
| **Incomplete combinations** | All selected attributes must have values | Reject incomplete |
| **Invalid combinations** | Some attribute combinations may be invalid | Admin marks invalid combos |
| **Maximum combinations** | Warn if > 100 combinations | Performance warning |

#### 3.7.3 Combination Visibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **All combinations visible** | All generated variants shown in admin | Full control |
| **Selective visibility** | Shop owner can hide specific combinations | Flexible display |
| **Out of stock** | Visible but marked "Out of Stock" | Back-in-stock interest |
| **Inactive** | Hidden from storefront | Granular control |

#### 3.7.4 Combination Status

| Status | Description | Display |
|--------|-------------|---------|
| **Active** | Available for purchase | Normal display |
| **Inactive** | Hidden from storefront | Admin only |
| **Out of Stock** | No available stock | "Out of Stock" badge |
| **Low Stock** | Below threshold | "Only X left" badge |
| **Discontinued** | No longer produced | "Discontinued" badge |

#### 3.7.5 Combination Ordering

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Default** | Alphabetical by attribute values | Predictable |
| **Admin control** | Drag-and-drop reordering | Curated experience |
| **Display order** | Lowest sortOrder first | Consistent |
| **Group ordering** | Attributes displayed in admin-defined order | Structured |

### 3.8 Dynamic Variants

| Operation | Description | Validation | Audit |
|-----------|-------------|------------|-------|
| **Add variant type** | Admin adds new attribute to product | Attribute must exist | Log change |
| **Remove variant type** | Admin removes attribute from product | Check existing orders | Log change |
| **Add variant value** | Admin adds new value to attribute type | Value must exist | Log change |
| **Remove variant value** | Admin removes value from attribute type | Check existing orders | Log change |
| **Bulk create** | Generate all combinations from matrix | Validate completeness | Log bulk |
| **Bulk update** | Update stock/price for multiple variants | Validate values | Log bulk |
| **Bulk deactivate** | Deactivate multiple variants | Check cart/order impact | Log bulk |

### 3.9 Variant Status

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Active** | `isActive = true` | Variant available for purchase |
| **Inactive** | `isActive = false` | Variant hidden, not purchasable |
| **Inherit product status** | Variant inherits product visibility | No orphaned variants |
| **Independent stock** | Each variant has own stock | Per-SKU inventory |
| **Independent price** | Each variant can have own price | Flexible pricing |

### 3.10 Variant Visibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Product draft** | All variants hidden | No premature visibility |
| **Product published** | Active variants visible | Clean storefront |
| **Variant inactive** | Hidden even if product published | Granular control |
| **Out of stock** | Visible but marked "Out of Stock" | Back-in-stock interest |
| **Filter display** | Only show available variants in filters | Clean filtering |

### 3.11 Variant Validation

| Field | Required | Validation | Error Code |
|-------|----------|------------|------------|
| `sku` | Yes | Unique, 1-50 chars, alphanumeric + hyphens | `VARIANT_SKU_INVALID` |
| `attributeValues` | Yes | At least 1 attribute value | `VARIANT_ATTRIBUTES_REQUIRED` |
| `price` | No | Positive decimal if provided | `VARIANT_PRICE_INVALID` |
| `stock` | Yes | Non-negative integer | `VARIANT_STOCK_INVALID` |
| `isActive` | No | Boolean, defaults to true | `VARIANT_ACTIVE_INVALID` |

### 3.12 Common Variant Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Hardcoded Size + Color | Cannot support other product types | Dynamic attribute system |
| No combination validation | Duplicate or invalid variants | Validate before creation |
| No variant ordering | Random display | Admin-defined sortOrder |
| Stock on product level | Cannot track per-SKU | Stock on variant level |
| Price on product only | Cannot override per variant | Allow variant price override |
| Inactive variant in cart | Confusing checkout | Warn customer at checkout |

---

## 4. SKU Strategy

### 4.1 What

The complete architecture for SKU generation, SKU formats, SKU uniqueness, SKU inheritance, and SKU lifecycle across the platform.

### 4.2 Why

- **Permanence:** Once created, a SKU never changes — order history and inventory tracking depend on it
- **Uniqueness:** Every SKU is globally unique across all products and shops
- **Human-readable:** SKUs are meaningful to humans, not just random strings
- **Scalable:** SKU format supports millions of products without collision
- **Auditable:** SKU changes would break historical data

### 4.3 Where

Product variant creation, order items, inventory tracking, warehouse operations, barcode systems, search, admin panels.

---

### 4.4 SKU Types

| Type | Purpose | Format | Example |
|------|---------|--------|---------|
| **Display SKU** | Customer-facing, human-readable | `{PRODUCT}-{ATTRIBUTES}` | `TSH-RED-M` |
| **Internal SKU** | System-level, permanent | `{PREFIX}-{UUID-SUFFIX}` | `NB-7F3A2B` |
| **Barcode SKU** | Physical barcode, scannable | EAN-13 or UPC | `8901234567890` |
| **Variant SKU** | Unique per variant, permanent | Generated on creation | `NB-TSH-RED-M-001` |

### 4.5 SKU Generation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-generation** | System generates if admin doesn't provide | Convenience |
| **Admin override** | Admin can customize SKU format | Business needs |
| **Permanence** | SKU never changes after creation | Order history integrity |
| **Uniqueness** | Global unique constraint | Inventory integrity |
| **Human-readable** | Meaningful format | Easy identification |
| **Immutable** | No SKU updates allowed | Data integrity |

### 4.6 SKU Format Standards

#### 4.6.1 Display SKU Format

```
{PRODUCT-SLUG}-{ATTRIBUTE-VALUES}

Examples:
  TSH-RED-M        → T-Shirt, Red, Medium
  TSH-BLK-L        → T-Shirt, Black, Large
  SNE-WHT-42       → Sneakers, White, Size 42
  PHN-BLK-256GB    → Phone, Black, 256GB
```

#### 4.6.2 Internal SKU Format

```
NB-{UUID-SUFFIX}

Examples:
  NB-7F3A2B
  NB-1D4E8C
  NB-9A2F5D
```

#### 4.6.3 Barcode SKU Format

```
EAN-13: 8901234567890
UPC: 012345678905
```

### 4.7 SKU Uniqueness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Global unique** | SKU unique across all products | No confusion |
| **Database constraint** | `@unique` on SKU column | Enforced at DB level |
| **Application check** | Validate before creation | User-friendly errors |
| **Cross-shop unique** | Same SKU cannot exist in different shops | Platform integrity |

### 4.8 SKU Inheritance

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **No inheritance** | Each variant has own SKU | Independent identity |
| **No parent SKU** | Product does not have a SKU | Variants are the SKUs |
| **Order snapshot** | OrderItem stores SKU at order time | Historical accuracy |
| **Cart snapshot** | CartItem stores SKU at add time | Consistency |

### 4.9 SKU Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SKU LIFECYCLE                                  │
│                                                                  │
│  1. Variant Created                                              │
│     → System generates SKU (or admin provides)                   │
│     → SKU stored in database                                     │
│     → SKU is now permanent                                       │
│                                                                  │
│  2. Variant Active                                               │
│     → SKU used in product listings                               │
│     → SKU used in cart items                                     │
│     → SKU used in order items                                    │
│                                                                  │
│  3. Variant Deactivated                                          │
│     → SKU remains in database                                    │
│     → SKU remains in historical orders                           │
│     → SKU not used for new orders                                │
│                                                                  │
│  4. SKU NEVER changes                                            │
│     → No update operation allowed                                │
│     → No delete operation allowed                                │
│     → SKU is immutable after creation                            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.10 SKU Validation

| Check | Standard | Error Code |
|-------|----------|------------|
| **Required** | SKU must be provided or auto-generated | `SKU_REQUIRED` |
| **Unique** | SKU must not exist in database | `SKU_DUPLICATE` |
| **Format** | Alphanumeric + hyphens only | `SKU_INVALID_FORMAT` |
| **Length** | 1-50 characters | `SKU_INVALID_LENGTH` |
| **No spaces** | Spaces replaced with hyphens | `SKU_INVALID_FORMAT` |
| **No special chars** | Only letters, numbers, hyphens | `SKU_INVALID_FORMAT` |

### 4.11 Common SKU Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Allow SKU changes | Breaks order history | SKU is immutable |
| No unique constraint | Duplicate SKUs | Database unique constraint |
| Auto-increment SKU | Predictable, sequential | UUID-based or random |
| SKU on product level | Products have multiple variants | SKU on variant level |
| No SKU validation | Invalid formats | Validate before creation |
| Human-editable after creation | Data corruption risk | Immutable after creation |

---

## 5. Inventory Engine

### 5.1 What

The complete inventory management system covering stock tracking, stock statuses, inventory lifecycle, stock movements, inventory history, and inventory operations.

### 5.2 Why

- **Revenue:** Accurate stock prevents overselling
- **Trust:** Real-time availability builds customer confidence
- **Operations:** Stock alerts enable timely restocking
- **Compliance:** Every stock movement is auditable
- **Scalability:** Supports single shop to multi-warehouse

### 5.3 Where

Product detail page, cart, checkout, order processing, admin inventory dashboard, stock reports, search filters, email notifications.

---

### 5.4 Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Location** | `ProductVariant.stock` column | Per-SKU tracking |
| **Type** | Non-negative integer | Cannot have negative stock |
| **Default** | 0 on variant creation | Safe default |
| **Update** | Decrement on order, increment on restock | Real-time tracking |
| **Validation** | Cannot go below 0 | Business rule |
| **Atomic** | Database-level atomic operations | Race condition prevention |

### 5.5 Available Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Formula** | `availableStock = stock - reservedStock` | Real-time availability |
| **In stock** | `availableStock > 0` | Purchasable |
| **Out of stock** | `availableStock <= 0` | Not purchasable |
| **Low stock** | `availableStock <= lowStockThreshold` | Alert trigger |
| **Display** | "In Stock", "Out of Stock", "Only X left" | Customer communication |

### 5.6 Reserved Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Stock reserved during checkout | Prevent overselling |
| **Increment** | When customer proceeds to checkout | Temporary reservation |
| **Decrement** | When order placed or checkout abandoned | Release reservation |
| **Timeout** | 15 minutes for abandoned checkouts | Prevent permanent reservation |
| **Concurrency** | Database-level atomic decrement | Race condition prevention |

#### 5.6.1 Reserved Stock Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESERVED STOCK FLOW                            │
│                                                                  │
│  1. Customer adds to cart                                         │
│     → Stock unchanged                                            │
│     → ReservedStock unchanged                                    │
│                                                                  │
│  2. Customer proceeds to checkout                                 │
│     → ReservedStock incremented                                  │
│     → AvailableStock = Stock - ReservedStock                     │
│     → Other customers see reduced availability                   │
│                                                                  │
│  3a. Order placed successfully                                    │
│     → Stock decremented                                          │
│     → ReservedStock decremented                                  │
│     → OrderItem created with quantity                            │
│                                                                  │
│  3b. Checkout abandoned (15min timeout)                          │
│     → ReservedStock decremented                                  │
│     → AvailableStock restored                                    │
│     → Stock unchanged                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 5.7 Incoming Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Track stock on order from suppliers | Planning |
| **Storage** | `incomingStock` column on variant | Visibility |
| **Update** | Admin adds incoming stock manually | Control |
| **Display** | Admin dashboard shows incoming | Awareness |
| **Auto-add** | When incoming arrives, move to stock | Automation (future) |

### 5.8 Low Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Threshold** | Configurable per variant, default 10 | Flexible alerting |
| **Admin notification** | Email when stock falls below threshold | Timely restocking |
| **Product page** | "Only X left in stock" when below threshold | Urgency signal |
| **Cart warning** | Warn if adding more than available stock | Customer communication |
| **Search filter** | "In Stock" filter excludes out-of-stock | Clean browsing |

### 5.9 Out of Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Detection** | `availableStock <= 0` | Automatic |
| **Product page** | "Out of Stock" badge, disable "Add to Cart" | Clear communication |
| **Variant selector** | Out-of-stock variant shown but disabled | Visual feedback |
| **Cart handling** | Existing cart items show warning | Checkout awareness |
| **Search behavior** | Include in results but mark clearly | Back-in-stock interest |
| **Restock notification** | Optional "Notify When Available" signup | Customer retention |
| **Back in stock** | Auto-email customers who signed up | Revenue recovery |

### 5.10 Inventory Status

| Status | Condition | Display | Purchasable |
|--------|-----------|---------|-------------|
| **In Stock** | `availableStock > 10` | "In Stock" | Yes |
| **Low Stock** | `1 < availableStock <= 10` | "Only X left" | Yes |
| **Last Few** | `availableStock == 1` | "Only 1 left" | Yes |
| **Out of Stock** | `availableStock <= 0` | "Out of Stock" | No |
| **Discontinued** | `isDiscontinued == true` | "Discontinued" | No |

### 5.11 Inventory History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Track all stock movements | Audit trail |
| **Storage** | `InventoryHistory` table | Append-only log |
| **Fields** | variantId, type, quantity, referenceId, adminId, timestamp | Complete context |
| **Retention** | Indefinite (never delete) | Compliance |
| **Query** | By variant, by date range, by admin | Reporting |

#### 5.11.1 Inventory History Schema

```typescript
interface InventoryHistory {
  id: string;
  variantId: string;
  type: InventoryMovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reservedBefore: number;
  reservedAfter: number;
  referenceId?: string;
  referenceType?: string;
  reason?: string;
  adminId?: string;
  createdAt: Date;
}

type InventoryMovementType =
  | 'STOCK_ADD'
  | 'STOCK_REDUCE'
  | 'STOCK_RESERVE'
  | 'STOCK_RELEASE'
  | 'STOCK_ADJUST'
  | 'ORDER_PLACE'
  | 'ORDER_CANCEL'
  | 'ORDER_SHIP'
  | 'ORDER_RETURN'
  | 'CHECKOUT_RESERVE'
  | 'CHECKOUT_RELEASE'
  | 'BULK_UPDATE';
```

### 5.12 Inventory Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    INVENTORY LIFECYCLE                            │
│                                                                  │
│  1. Variant Created                                              │
│     → stock = 0, reservedStock = 0                              │
│     → availableStock = 0                                         │
│     → Status: Out of Stock                                       │
│                                                                  │
│  2. Stock Added (Admin)                                          │
│     → stock += quantity                                          │
│     → availableStock recalculated                                │
│     → InventoryHistory logged                                    │
│     → Status: In Stock (if above threshold)                      │
│                                                                  │
│  3. Customer Reserves (Checkout)                                 │
│     → reservedStock += quantity                                  │
│     → availableStock decreased                                   │
│     → Status: may change to Low Stock                            │
│                                                                  │
│  4a. Order Placed                                                │
│     → stock -= quantity                                          │
│     → reservedStock -= quantity                                  │
│     → availableStock recalculated                                │
│     → InventoryHistory logged                                    │
│     → Status: may change                                         │
│                                                                  │
│  4b. Checkout Abandoned                                          │
│     → reservedStock -= quantity                                  │
│     → availableStock restored                                    │
│     → InventoryHistory logged                                    │
│                                                                  │
│  5. Low Stock Alert                                              │
│     → availableStock <= threshold                                │
│     → Admin notified                                             │
│     → "Only X left" displayed                                    │
│                                                                  │
│  6. Out of Stock                                                 │
│     → availableStock <= 0                                        │
│     → "Out of Stock" displayed                                   │
│     → Add to Cart disabled                                       │
│     → Restock notification available                             │
│                                                                  │
│  7. Restock                                                      │
│     → Admin adds stock                                           │
│     → Status: In Stock                                           │
│     → Back-in-stock emails sent                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.13 Common Inventory Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Stock on product level | Cannot track per-SKU | Stock on variant level |
| No reserved stock | Overselling during checkout | Reserve during checkout |
| No low stock alerts | Missed restocking | Email alerts |
| Negative stock | Impossible inventory | Enforce non-negative |
| No inventory history | Cannot debug discrepancies | Log every movement |
| No concurrent protection | Race conditions | Atomic database operations |
| Hard delete variants | Lost inventory history | Soft delete only |

---

## 6. Stock Operations

### 6.1 What

The complete architecture for stock manipulation operations — add, reduce, reserve, release, adjust, and audit.

### 6.2 Why

- **Accuracy:** Every stock change is controlled and validated
- **Auditability:** Every movement is logged with context
- **Consistency:** Atomic operations prevent race conditions
- **Recovery:** Every operation can be reversed or corrected

### 6.3 Where

Admin inventory dashboard, checkout flow, order processing, webhook handlers, bulk operations.

---

### 6.4 Add Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin manually adds stock, supplier delivery | Restocking |
| **Operation** | `stock += quantity` | Increase available |
| **Validation** | Quantity must be positive | Business rule |
| **Audit** | Log: type=STOCK_ADD, quantity, adminId | Accountability |
| **Notification** | Optional: notify customers waiting for restock | Revenue recovery |

### 6.5 Reduce Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin manual reduction, damage, loss | Stock correction |
| **Operation** | `stock -= quantity` | Decrease available |
| **Validation** | Cannot reduce below reservedStock | Business rule |
| **Audit** | Log: type=STOCK_REDUCE, quantity, reason, adminId | Accountability |
| **Reason required** | Admin must provide reason | Traceability |

### 6.6 Reserve Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer proceeds to checkout | Prevent overselling |
| **Operation** | `reservedStock += quantity` | Temporary hold |
| **Validation** | availableStock >= quantity | Sufficient stock |
| **Timeout** | 15 minutes for abandoned checkout | Release reservation |
| **Audit** | Log: type=STOCK_RESERVE, orderId | Tracking |

### 6.7 Release Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Order cancelled, checkout abandoned, timeout | Free up stock |
| **Operation** | `reservedStock -= quantity` | Release hold |
| **Validation** | reservedStock >= quantity | Cannot release more than reserved |
| **Audit** | Log: type=STOCK_RELEASE, reason | Tracking |
| **Automatic** | Background job releases expired reservations | Cleanup |

### 6.8 Manual Adjustment

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin corrects stock count | Error correction |
| **Operation** | Set stock to absolute value | Direct correction |
| **Validation** | New value must be >= reservedStock | Business rule |
| **Audit** | Log: type=STOCK_ADJUST, oldStock, newStock, reason | Accountability |
| **Reason required** | Admin must provide reason | Traceability |
| **Approval** | Optional: require second admin approval | Security |

### 6.9 Automatic Adjustment

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | System detects discrepancy | Data integrity |
| **Operation** | Correct stock based on truth source | Alignment |
| **Audit** | Log: type=AUTO_ADJUST, reason | Tracking |
| **Notification** | Alert admin of automatic adjustment | Awareness |

### 6.10 Bulk Adjustment

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Admin updates multiple variants at once | Efficiency |
| **Operation** | Apply same change to multiple variants | Batch processing |
| **Validation** | Validate each variant individually | Data integrity |
| **Batch size** | Max 100 variants per batch | Performance |
| **Progress** | Show real-time progress | UX feedback |
| **Partial success** | Report which succeeded, which failed | Transparency |
| **Audit** | Log each individual change | Accountability |

### 6.11 Inventory Audit

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Verify stock accuracy | Reconciliation |
| **Frequency** | Weekly or on-demand | Regular verification |
| **Method** | Compare system stock vs physical count | Truth verification |
| **Discrepancy** | Auto-adjust with audit log | Correction |
| **Report** | Generate audit report | Compliance |
| **Admin required** | Only admin can run audit | Security |

### 6.12 Inventory Recovery

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Recover from stock errors | Data integrity |
| **Method** | Reverse incorrect stock movements | Correction |
| **Validation** | Verify recovery is valid | Prevent new errors |
| **Audit** | Log recovery action | Accountability |
| **Approval** | Require admin approval | Security |

### 6.13 Common Stock Operation Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No atomic operations | Race conditions | Use database transactions |
| No audit logging | Cannot debug issues | Log every movement |
| No timeout for reservations | Permanent stock hold | 15-min timeout |
| No reason for adjustments | No accountability | Require reason |
| No batch limits | Performance issues | Max 100 per batch |
| No recovery mechanism | Permanent errors | Allow recovery with audit |

---

## 7. Pricing Relationship

### 7.1 What

The architecture for pricing at product and variant levels, including base price, variant price, sale price, and future dynamic pricing.

### 7.2 Why

- **Flexibility:** Different prices per variant (e.g., XL costs more)
- **Promotions:** Sale prices for marketing campaigns
- **Transparency:** Clear price resolution rules
- **Future-proof:** Supports dynamic pricing, AI suggestions

### 7.3 Where

Product detail page, cart, checkout, order items, pricing reports, marketing campaigns.

---

### 7.4 Base Price

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Location** | `Product.basePrice` | Default price for all variants |
| **Type** | `DECIMAL(10,2)` | Exact precision |
| **Required** | Yes | Core product data |
| **Currency** | INR (default) | India market |

### 7.5 Variant Price

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Location** | `ProductVariant.price` (nullable) | Optional override |
| **Type** | `DECIMAL(10,2)` | Exact precision |
| **Default** | null (inherits from product) | Inheritance |
| **Override** | If set, used instead of basePrice | Per-SKU pricing |

### 7.6 Price Resolution

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRICE RESOLUTION                               │
│                                                                  │
│  1. Check variant.price                                          │
│     → If set: use variant.price                                  │
│     → If null: fall through to step 2                            │
│                                                                  │
│  2. Check product.basePrice                                      │
│     → Always set: use product.basePrice                          │
│                                                                  │
│  3. Check salePrice (future)                                     │
│     → If active sale: use salePrice                              │
│     → Otherwise: use resolved price                              │
│                                                                  │
│  Resolution: variant.price ?? product.basePrice                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.7 Sale Price

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Location** | `Product.meta.salePrice` or `ProductVariant.meta.salePrice` | Flexible storage |
| **Active period** | `saleStartsAt` and `saleEndsAt` timestamps | Time-bound |
| **Validation** | Must be less than regular price | Business rule |
| **Display** | Show original price strikethrough + sale price | Marketing |
| **Priority** | Variant salePrice > Product salePrice > Regular price | Resolution |

### 7.8 Future Dynamic Pricing

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Time-based pricing** | Price changes by time of day | Scheduled price rules |
| **Volume pricing** | Discount for bulk purchases | Price tiers |
| **Loyalty pricing** | Discount for repeat customers | Customer segments |
| **AI pricing** | AI-suggested optimal pricing | ML model integration |
| **Competitor pricing** | Match competitor prices | Price monitoring |
| **Demand pricing** | Price based on demand | Surge pricing |

### 7.9 Price Validation

| Check | Standard | Error Code |
|-------|----------|------------|
| **Positive** | Price must be > 0 | `PRICE_INVALID` |
| **Precision** | Max 2 decimal places | `PRICE_INVALID_PRECISION` |
| **Max value** | Price <= 999999.99 | `PRICE_TOO_HIGH` |
| **Sale < Regular** | Sale price < regular price | `SALE_PRICE_INVALID` |
| **Currency match** | All prices in same currency | `CURRENCY_MISMATCH` |

### 7.10 Common Pricing Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Float for money | Precision loss | Use DECIMAL(10,2) |
| No sale price validation | Sale > regular price | Validate sale < regular |
| Price on product only | Cannot price per variant | Allow variant override |
| No currency tracking | Multi-currency confusion | Store currency code |
| Hardcoded prices | Cannot change dynamically | Support price rules |

---

## 8. Product Relationship

### 8.1 What

The architecture for parent-product relationships, variant-product relationships, product availability, visibility, and status management.

### 8.2 Why

- **Clarity:** Clear ownership hierarchy
- **Consistency:** Status propagation rules
- **Visibility:** Controlled display across platform
- **Lifecycle:** Products and variants follow defined lifecycles

### 8.3 Where

Product listing, product detail page, admin dashboard, search results, cart, checkout.

---

### 8.4 Parent Product

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Ownership** | Product owns all variants | Lifecycle consistency |
| **Status** | Product status controls variant visibility | No orphaned variants |
| **Price** | Product provides default price | Fallback pricing |
| **Category** | Product belongs to one category | Structural clarity |
| **Media** | Product owns all images | Visual showcase |

### 8.5 Variant Product

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Ownership** | Variant belongs to exactly one product | Structural clarity |
| **Independence** | Each variant has own SKU, stock, price | Per-SKU management |
| **Visibility** | Inherits product status | No orphaned variants |
| **Lifecycle** | Follows product lifecycle | Consistency |
| **Deletion** | Cascade delete with product | Cleanup |

### 8.6 Product Availability

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Formula** | Product available if any variant available | Customer experience |
| **Stock check** | Check all variants for availability | Complete picture |
| **Display** | "Available in X sizes/colors" | Marketing |
| **Cart** | Can add if specific variant available | Granular |
| **Search** | Show if any variant in stock | Discovery |

### 8.7 Product Visibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Product draft** | All variants hidden | No premature visibility |
| **Product published** | Active, in-stock variants visible | Clean storefront |
| **Variant inactive** | Hidden even if product published | Granular control |
| **Out of stock** | Visible but marked | Back-in-stock interest |
| **Archived** | All variants hidden | Complete removal |

### 8.8 Product Status

| Status | Variants | Display | Cart | Orders |
|--------|----------|---------|------|--------|
| **draft** | Hidden | Admin only | No | N/A |
| **scheduled** | Hidden until date | Admin only | No | N/A |
| **published** | Visible if active | Storefront | Yes | Purchasable |
| **archived** | Hidden | Admin only | No | Historical |

### 8.9 Common Product Relationship Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Orphaned variants | Variants without product | Cascade delete |
| No status propagation | Inconsistent visibility | Product controls variants |
| Variant without product | Data integrity | FK constraint |
| No availability check | Broken purchase flow | Check variant stock |

---

## 9. Search & Filters

### 9.1 What

The architecture for variant search, dynamic filters, inventory filters, and availability filters powered by the attribute system.

### 9.2 Why

- **Discovery:** Customers find products by attributes
- **Efficiency:** Dynamic filters adapt to product types
- **Performance:** Pre-computed filter counts
- **Flexibility:** Filters change as attributes change

### 9.3 Where

Search results, category pages, collection pages, admin inventory view.

---

### 9.4 Variant Search

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Index** | Variant attributes indexed | Searchable |
| **Fuzzy** | Handle typos in attribute values | User-friendly |
| **Weight** | Attribute values weighted by relevance | Better results |
| **Autocomplete** | Suggest attribute values | Speed |

### 9.5 Dynamic Filters

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Source** | Generated from active attributes | Always current |
| **Adaptive** | Filters change per category | Relevant only |
| **Counts** | Show number of products per filter | Decision help |
| **Multi-select** | Allow multiple selections | Flexible |
| **Reset** | Clear all filters option | Easy reset |

### 9.6 Inventory Filters

| Filter | Type | Source | Display |
|--------|------|--------|---------|
| **In Stock** | Toggle | `availableStock > 0` | "In Stock" |
| **Out of Stock** | Toggle | `availableStock <= 0` | "Out of Stock" |
| **Low Stock** | Toggle | `availableStock <= threshold` | "Low Stock" |
| **Price Range** | Range | `variant.price ?? product.basePrice` | Price slider |

### 9.7 Availability Filters

| Filter | Type | Source | Display |
|--------|------|--------|---------|
| **Available Now** | Toggle | `availableStock > 0` | "Available Now" |
| **Coming Soon** | Toggle | `incomingStock > 0` | "Coming Soon" |
| **Pre-order** | Toggle | Future availability | "Pre-order" |

### 9.8 Common Search & Filter Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Hardcoded filters | Cannot adapt to attributes | Dynamic filters |
| No filter counts | Hard to decide | Show counts |
| No inventory filters | Cannot filter by stock | Include stock filters |
| No mobile filters | Poor mobile UX | Responsive filter UI |

---

## 10. Validation

### 10.1 What

The complete validation system for variants, attributes, combinations, stock, SKU, and pricing.

### 10.2 Why

- **Data quality:** Valid data prevents broken displays
- **Security:** Input validation prevents injection
- **UX:** Clear error messages guide correction
- **Performance:** Catch errors early

### 10.3 Where

Product creation form, variant creation, API handlers, bulk operations.

---

### 10.4 Duplicate Variants

| Check | Method | Action |
|-------|--------|--------|
| **Same attributes** | Unique constraint on productId + attributeValues | Reject duplicate |
| **Same SKU** | Unique constraint on SKU | Reject duplicate |
| **Same combination** | Check before creation | Prevent duplicate |

### 10.5 Invalid Combinations

| Check | Method | Action |
|-------|--------|--------|
| **Missing attributes** | Validate all selected attributes have values | Reject incomplete |
| **Invalid values** | Validate values exist in attribute system | Reject invalid |
| **Conflicting values** | Check for impossible combinations | Warn admin |

### 10.6 Missing Attributes

| Check | Method | Action |
|-------|--------|--------|
| **No attributes selected** | Require at least 1 attribute type | Reject product |
| **Empty attribute values** | Require at least 1 value per type | Reject variant |
| **Required attributes** | Check category-required attributes | Warn admin |

### 10.7 Stock Validation

| Check | Method | Action |
|-------|--------|--------|
| **Non-negative** | `stock >= 0` constraint | Reject negative |
| **Available >= 0** | `availableStock >= 0` | Reject impossible |
| **Reserve <= stock** | `reservedStock <= stock` | Prevent inconsistency |
| **Sufficient for order** | `availableStock >= quantity` | Reject oversell |

### 10.8 SKU Validation

| Check | Method | Action |
|-------|--------|--------|
| **Unique** | Database constraint | Reject duplicate |
| **Format** | Regex validation | Reject invalid |
| **Length** | 1-50 chars | Reject too long |
| **Immutable** | No update after creation | Prevent changes |

### 10.9 Pricing Validation

| Check | Method | Action |
|-------|--------|--------|
| **Positive** | `price > 0` | Reject zero/negative |
| **Precision** | Max 2 decimals | Reject invalid |
| **Sale < Regular** | `salePrice < regularPrice` | Reject invalid |
| **Max value** | `price <= 999999.99` | Reject too high |

### 10.10 Common Validation Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Client-only validation | Security bypass | Always validate server-side |
| No duplicate check | Duplicate variants | Unique constraints |
| No stock validation | Overselling | Validate before operations |
| No SKU validation | Invalid formats | Validate before creation |
| No price validation | Invalid prices | Validate before save |

---

## 11. Permissions

### 11.1 What

The permission standards for admin, shop owner, inventory, variant, and attribute operations.

### 11.2 Why

- **Security:** Users can only access what they're allowed to
- **Compliance:** Meets enterprise access control
- **Auditability:** All access attempts are logged
- **Scalability:** New roles added without restructuring

### 11.3 Where

All inventory endpoints, admin panel, API handlers.

---

### 11.4 Admin Permissions

| Operation | Allowed | Endpoint |
|-----------|---------|----------|
| Manage attribute types | Yes | `POST /api/admin/attributes` |
| Manage attribute values | Yes | `POST /api/admin/attributes/:id/values` |
| View all inventory | Yes | `GET /api/admin/inventory` |
| Adjust any stock | Yes | `PATCH /api/admin/inventory/:variantId` |
| Run inventory audit | Yes | `POST /api/admin/inventory/audit` |
| Bulk operations | Yes | `POST /api/admin/inventory/bulk` |
| View inventory history | Yes | `GET /api/admin/inventory/history` |

### 11.5 Shop Owner Permissions

| Operation | Allowed | Endpoint |
|-----------|---------|----------|
| View own inventory | Yes | `GET /api/admin/inventory` |
| Update own stock | Yes | `PATCH /api/admin/inventory/:variantId` |
| View other sellers' inventory | No | - |
| Adjust stock | No (admin only) | - |
| Run inventory audit | No (admin only) | - |
| View inventory history | Yes (own) | `GET /api/admin/inventory/history` |

### 11.6 Inventory Permissions

| Permission | Shop Owner | Admin |
|------------|-----------|-------|
| View own inventory | Yes | Yes |
| Update own stock | Yes | Yes |
| View other sellers' inventory | No | Yes |
| Bulk stock update | Yes (own) | Yes |
| Stock adjustment | No | Yes |
| Inventory reports | Yes (own) | Yes |
| Inventory audit | No | Yes |

### 11.7 Variant Permissions

| Permission | Shop Owner | Admin |
|------------|-----------|-------|
| Create variants | Yes (own products) | Yes |
| Edit variants | Yes (own products) | Yes |
| Delete variants | Yes (own products, draft only) | Yes |
| Bulk variant operations | Yes (own) | Yes |

### 11.8 Attribute Permissions

| Permission | Shop Owner | Admin |
|------------|-----------|-------|
| Create attribute types | No | Yes |
| Edit attribute types | No | Yes |
| Deactivate attribute types | No | Yes |
| Create attribute values | No | Yes |
| Edit attribute values | No | Yes |
| Select attributes for product | Yes | Yes |

### 11.9 Permission Enforcement

| Layer | Implementation | Rationale |
|-------|----------------|-----------|
| **API middleware** | `authenticate()` + `authorize()` on every endpoint | Security |
| **Route guards** | `AdminRoute` component on admin pages | Frontend protection |
| **Resource ownership** | Check `product.sellerId === user.id` | Data isolation |
| **Audit logging** | Log all permission checks | Accountability |
| **Error responses** | 403 Forbidden for unauthorized | Clear feedback |

### 11.10 Common Permission Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No ownership check | Sellers see each other's inventory | Check sellerId |
| Client-only checks | Security bypass | Always enforce server-side |
| No audit logging | No accountability | Log all checks |
| Overly broad permissions | Security risk | Least privilege |

---

## 12. Performance

### 12.1 What

Performance standards for large inventories, bulk processing, search optimization, inventory synchronization, and background processing.

### 12.2 Why

- **User experience:** Fast page loads, responsive interactions
- **SEO:** Core Web Vitals affect rankings
- **Scalability:** Performance degrades gracefully
- **Cost:** Efficient operations reduce infrastructure costs

### 12.3 Where

Product listing, product detail, search results, admin dashboard, API responses.

---

### 12.4 Large Inventories

| Scale | Strategy | Rationale |
|-------|----------|-----------|
| **< 1,000 variants** | Simple queries, basic indexes | Fast to build |
| **1,000-10,000 variants** | Composite indexes, caching | Performance tuning |
| **10,000-100,000 variants** | Read replicas, materialized views | Read scaling |
| **100,000+ variants** | Search service (Meilisearch), CDN | Full-text search |

#### 12.4.1 Query Performance Targets

| Query Type | Target | Strategy |
|-----------|--------|----------|
| **Variant list** | < 200ms | Composite indexes, pagination |
| **Stock check** | < 50ms | Primary key lookup, cache |
| **Filter counts** | < 500ms | Pre-computed, cached |
| **Inventory report** | < 1s | Materialized views |
| **Bulk operations** | < 5s per 100 | Background processing |

### 12.5 Bulk Processing

| Operation | Batch Size | Strategy | Timeout |
|-----------|-----------|----------|---------|
| **Bulk stock update** | 100 variants | Background job | 5 minutes |
| **Bulk price update** | 100 variants | Background job | 5 minutes |
| **Bulk variant create** | 50 products | Background job | 10 minutes |
| **Inventory audit** | All variants | Background job | 30 minutes |
| **Search reindex** | 500 products | Background job | 10 minutes |

### 12.6 Search Optimization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Index** | Index all filter columns | Query speed |
| **Composite** | Composite indexes for common queries | Multi-column filtering |
| **Partial** | Partial indexes for active records | Smaller index size |
| **GIN** | GIN indexes for JSONB queries | JSON performance |
| **Full-text** | pg_trgm for text search | Fuzzy matching |

### 12.7 Inventory Synchronization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Real-time** | Stock changes reflected immediately | Customer accuracy |
| **Cache invalidation** | Invalidate cache on stock change | Fresh data |
| **Search update** | Update search index on stock change | Accurate availability |
| **Webhook** | Notify external systems of stock changes | Integration |

### 12.8 Background Processing

| Job | Frequency | Strategy | Rationale |
|-----|-----------|----------|-----------|
| **Reserved stock cleanup** | Every 5 minutes | Cron job | Release abandoned checkouts |
| **Low stock alerts** | Every hour | Cron job | Timely notifications |
| **Inventory audit** | Weekly | Cron job | Regular verification |
| **Search reindex** | On change + daily full | Event + cron | Fresh results |
| **Cache invalidation** | On change | Event-driven | Fresh cache |

### 12.9 Common Performance Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No pagination | Loading all variants | Paginate at 24 per page |
| No caching | Repeated database queries | Cache at edge |
| No indexes on filters | Full table scans | Index all filter columns |
| Synchronous bulk ops | Blocking requests | Background processing |
| No search index | Slow text search | Full-text search index |

---

## 13. Security

### 13.1 What

Security standards for inventory integrity, stock consistency, concurrent updates, audit logging, and permission enforcement.

### 13.2 Why

- **Data integrity:** Prevent malicious stock manipulation
- **Revenue:** Accurate stock prevents financial loss
- **Compliance:** Meet enterprise security requirements
- **Trust:** Users trust platform with their data

### 13.3 Where

All inventory endpoints, stock operations, API handlers.

---

### 13.4 Inventory Integrity

| Check | Implementation | Rationale |
|-------|----------------|-----------|
| **Non-negative stock** | Database constraint `stock >= 0` | Business rule |
| **Atomic operations** | Database transactions | Race condition prevention |
| **Optimistic locking** | Version check on updates | Concurrency control |
| **Input validation** | Zod schema validation | Type safety |

### 13.5 Stock Consistency

| Check | Implementation | Rationale |
|-------|----------------|-----------|
| **Available = Stock - Reserved** | Computed, not stored | Always accurate |
| **Reserve <= Stock** | Constraint | Prevent inconsistency |
| **Release <= Reserved** | Constraint | Prevent negative reserved |
| **Order <= Available** | Validation | Prevent overselling |

### 13.6 Concurrent Updates

| Check | Implementation | Rationale |
|-------|----------------|-----------|
| **Database transactions** | `$transaction` for multi-step ops | Atomicity |
| **Optimistic locking** | Version column on updates | Conflict detection |
| **Pessimistic locking** | `SELECT FOR UPDATE` for critical ops | Exclusive access |
| **Retry logic** | Retry on conflict | Resilience |

### 13.7 Audit Logging

| Event | Data Logged | Rationale |
|-------|-------------|-----------|
| **Stock add** | Admin ID, quantity, reason, timestamp | Accountability |
| **Stock reduce** | Admin ID, quantity, reason, timestamp | Accountability |
| **Stock adjust** | Admin ID, old/new value, reason, timestamp | Accountability |
| **Stock reserve** | Order ID, quantity, timestamp | Tracking |
| **Stock release** | Order ID, quantity, reason, timestamp | Tracking |
| **Bulk operation** | Admin ID, operation, count, timestamp | Accountability |
| **Permission denied** | User ID, endpoint, timestamp | Security |

### 13.8 Permission Enforcement

| Layer | Implementation | Rationale |
|-------|----------------|-----------|
| **Authentication** | `authenticate()` middleware | Identity verification |
| **Authorization** | `authorize()` middleware | Role verification |
| **Ownership** | Check `product.sellerId === user.id` | Data isolation |
| **Audit** | Log all permission checks | Accountability |
| **Error responses** | 401/403 for unauthorized | Clear feedback |

### 13.9 Common Security Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No atomic operations | Race conditions | Database transactions |
| No audit logging | Cannot trace issues | Log every operation |
| No ownership check | Data leakage | Ownership-based queries |
| No concurrent protection | Stock corruption | Optimistic locking |
| No input validation | Injection attacks | Validate all input |

---

## 14. Accessibility

### 14.1 What

Accessibility standards for inventory management, variant selection, and admin interfaces.

### 14.2 Why

- **Inclusivity:** All users can manage inventory
- **Compliance:** WCAG 2.2 AA requirements
- **Usability:** Clear interfaces for all abilities

### 14.3 Where

Admin inventory dashboard, product creation form, variant selector.

---

### 14.4 Beginner-Friendly Inventory

| Requirement | Implementation | Rationale |
|------------|----------------|-----------|
| **Clear labels** | Visible labels on all inputs | No guesswork |
| **Helpful tooltips** | Context help on complex fields | Guidance |
| **Progressive disclosure** | Show basic first, advanced on demand | Not overwhelming |
| **Validation messages** | Clear, specific error messages | Easy correction |
| **Undo capability** | Allow undo within 5 minutes | Safety net |

### 14.5 Responsive Editing

| Requirement | Implementation | Rationale |
|------------|----------------|-----------|
| **Mobile-first forms** | Large touch targets, clear labels | Mobile accessibility |
| **Touch targets** | Minimum 44x44px | Accessibility |
| **Text size** | Minimum 16px on mobile | Readability |
| **Color contrast** | 4.5:1 minimum ratio | WCAG AA |
| **Form labels** | Visible labels, not just placeholders | Accessibility |

### 14.6 Keyboard Support

| Requirement | Implementation | Rationale |
|------------|----------------|-----------|
| **Tab navigation** | All interactive elements focusable | Keyboard access |
| **Focus visible** | Clear focus indicators | Visual feedback |
| **Enter/Space** | Activate buttons and links | Standard behavior |
| **Arrow keys** | Navigate tables, lists | Natural interaction |
| **Escape** | Close modals, dropdowns | Expected behavior |

### 14.7 Common Accessibility Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No labels | Screen readers can't identify fields | Always use labels |
| No keyboard navigation | Keyboard users can't interact | Full keyboard support |
| No focus indicators | Users can't see where they are | Clear focus styles |
| Low contrast | Hard to read for low vision | 4.5:1 minimum ratio |
| Small touch targets | Hard to tap on mobile | Minimum 44x44px |

---

## 15. Future Readiness

### 15.1 What

Architecture for warehouses, multi-location inventory, barcode support, QR codes, RFID, supplier inventory, inventory forecasting, automated replenishment, and AI inventory suggestions.

### 15.2 Why

- **Scalability:** Platform grows without rewrites
- **Flexibility:** New features extend existing architecture
- **Investment protection:** Current work supports future needs
- **Competitive advantage:** Platform adapts to market needs

### 15.3 Where

Inventory Engine architecture, database schema, API design, admin interfaces.

---

### 15.4 Warehouses

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Multi-warehouse** | Stock per location | Add `warehouseId` to inventory |
| **Warehouse management** | Create, edit, deactivate warehouses | New `Warehouse` table |
| **Stock transfer** | Move stock between warehouses | New `StockTransfer` table |
| **Warehouse dashboard** | Per-warehouse inventory view | New admin section |

#### 15.4.1 Warehouse Schema

```typescript
interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WarehouseInventory {
  id: string;
  warehouseId: string;
  variantId: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StockTransfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  variantId: string;
  quantity: number;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  initiatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 15.5 Multi-Location Inventory

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Location-based stock** | Stock per warehouse per variant | `WarehouseInventory` table |
| **Location visibility** | Show stock per location | Admin dashboard |
| **Fulfillment routing** | Route orders to nearest warehouse | Routing algorithm |
| **Location transfers** | Move stock between locations | `StockTransfer` table |

### 15.6 Barcode Support

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Barcode generation** | Generate barcodes for variants | Barcode library |
| **Barcode scanning** | Scan to find variant | Camera/scanner integration |
| **Barcode labels** | Print barcode labels | Label printer integration |
| **Barcode lookup** | Search by barcode | Index on barcode field |

### 15.7 QR Codes

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **QR generation** | Generate QR codes for variants | QR library |
| **QR scanning** | Scan to view product | Camera integration |
| **QR labels** | Print QR labels | Label printer integration |
| **QR redirect** | QR links to product page | URL shortener |

### 15.8 RFID

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **RFID tags** | Attach RFID tags to products | RFID hardware integration |
| **RFID scanning** | Bulk scan for inventory | RFID reader integration |
| **RFID tracking** | Track product movement | Real-time location |
| **RFID audit** | Automated inventory audit | RFID batch scanning |

### 15.9 Supplier Inventory

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Supplier management** | Track suppliers per product | New `Supplier` table |
| **Purchase orders** | Create POs to suppliers | New `PurchaseOrder` table |
| **Supplier stock** | Track supplier inventory | `SupplierInventory` table |
| **Lead time** | Track supplier lead times | `leadTimeDays` field |

### 15.10 Inventory Forecasting

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Demand forecasting** | Predict future demand | ML model integration |
| **Seasonal patterns** | Account for seasonal trends | Historical data analysis |
| **Trend analysis** | Identify product trends | Sales velocity tracking |
| **Stock projections** | Project when stock runs out | Consumption rate calculation |

### 15.11 Automated Replenishment

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Reorder points** | Auto-reorder when stock low | Reorder point calculation |
| **Auto-PO** | Generate purchase orders automatically | Automation rules |
| **Supplier integration** | Direct supplier API integration | API connectors |
| **Approval workflow** | Approve auto-generated POs | Workflow engine |

### 15.12 AI Inventory Suggestions

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Smart restocking** | AI suggests restock quantities | ML model |
| **Price optimization** | AI suggests optimal pricing | ML model |
| **Demand prediction** | AI predicts demand spikes | ML model |
| **Anomaly detection** | AI detects unusual patterns | ML model |
| **Bundle suggestions** | AI suggests product bundles | Recommendation engine |

### 15.13 Future Readiness Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **JSONB for extensibility** | Use `meta` JSONB for custom fields | No schema changes |
| **UUID primary keys** | All new tables use UUID PKs | Distributed systems |
| **Soft delete** | All new tables use `isActive` | Referential integrity |
| **Timestamps** | All new tables have `createdAt`/`updatedAt` | Audit trail |
| **Indexing strategy** | Index all FKs + common filters | Performance |
| **API versioning** | Version API endpoints | Backward compatibility |
| **Schema migration** | Backward-compatible migrations | Zero-downtime deploys |

---

## 16. Mandatory Rules for AI Agents

### 16.1 Variant Engine Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never hardcode variant types** | Use Global Attribute System | Dynamic products |
| **Auto-generate combinations** | System generates from attributes | Efficiency, completeness |
| **Validate before creation** | Check duplicates, invalid combos | Data integrity |
| **SKU is permanent** | Never allow SKU changes | Order history integrity |
| **Stock on variant level** | Not product level | Per-SKU inventory |
| **Audit every stock movement** | Log all operations | Compliance |

### 16.2 Attribute System Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Platform owns attributes** | Admin creates, shops select | Consistency |
| **No shop-specific attributes** | All attributes are global | Prevents duplication |
| **Validate attribute values** | Check against defined values | Data integrity |
| **Attribute ordering** | Admin sets sortOrder | Consistent display |
| **Deactivate, don't delete** | Soft delete attributes | Referential integrity |

### 16.3 Inventory Engine Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Atomic operations** | Use database transactions | Race condition prevention |
| **Non-negative stock** | Enforce `stock >= 0` | Business rule |
| **Reserve during checkout** | Prevent overselling | Revenue protection |
| **Release on timeout** | 15-min reservation timeout | Prevent permanent hold |
| **Log every movement** | InventoryHistory for all ops | Audit trail |
| **No hard deletes** | Soft delete variants | Data integrity |

### 16.4 SKU Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **SKU is permanent** | Never change after creation | Order history integrity |
| **SKU is unique** | Global unique constraint | Inventory integrity |
| **SKU is human-readable** | Meaningful format | Easy identification |
| **No SKU on product** | SKU on variant only | Per-SKU tracking |
| **Auto-generate if not provided** | System generates SKU | Convenience |

### 16.5 Data Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **UUID primary keys** | All tables use UUID PKs | Distributed systems |
| **Soft delete only** | No hard deletes | Data integrity |
| **Timestamps always** | Every table has timestamps | Audit trail |
| **Foreign keys indexed** | Every FK has index | Performance |
| **Unique constraints** | SKUs, slugs are unique | Data integrity |
| **DECIMAL for money** | All price fields use DECIMAL | Financial accuracy |
| **JSONB for extensibility** | Use `meta` for custom fields | No schema changes |

### 16.6 API Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **REST conventions** | Follow Nabome API conventions | Consistency |
| **Validation always** | Every endpoint validates input | Security |
| **Authentication always** | Every endpoint authenticates | Security |
| **Authorization always** | Every endpoint authorizes | Security |
| **Audit logging** | Log all mutations | Compliance |
| **Error handling** | Use standard error classes | Consistency |
| **Rate limiting** | Apply rate limits | Abuse prevention |

### 16.7 Frontend Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Feature isolation** | Variant feature doesn't import from other features | Modularity |
| **Shared UI only** | Use `shared/ui` components | Consistency |
| **Server state** | Variant data via TanStack Query | Caching, sync |
| **Form state** | Variant forms via React Hook Form | Form management |
| **URL state** | Filters, search in URL params | Shareable, bookmarkable |
| **Accessibility** | WCAG 2.2 AA compliance | Inclusivity |
| **Mobile-first** | Design for mobile, enhance for desktop | 70%+ mobile traffic |

### 16.8 Performance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Pagination** | 24 variants per page default | Performance |
| **Caching** | Cache at edge with KV | Global performance |
| **Lazy loading** | Load below-fold on demand | Initial load speed |
| **Background jobs** | Heavy operations async | Request performance |
| **Search indexing** | Index published variants only | Clean results |
| **Bulk operations** | Max 100 per batch | Performance |

### 16.9 Security Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Input sanitization** | Strip HTML, scripts | XSS prevention |
| **CSRF protection** | CSRF token on all mutations | CSRF prevention |
| **Rate limiting** | Per-endpoint rate limits | Abuse prevention |
| **File validation** | Validate type, size | Upload security |
| **Permission enforcement** | Server-side authorization | Security |
| **Audit logging** | Log all security events | Accountability |

---

## Appendix A: Database Schema Reference

### A.1 Attribute Tables

```prisma
model AttributeType {
  id              String   @id @default(uuid())
  name            String   @db.VarChar(100)
  slug            String   @unique @db.VarChar(100)
  dataType        String   @db.VarChar(50) // color, select, multi_select, text, number, boolean
  validationRules Json?
  description     String?
  sortOrder       Int      @default(0)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  values          AttributeValue[]
  productAttributes ProductAttribute[]

  @@index([isActive])
  @@index([sortOrder])
}

model AttributeValue {
  id              String   @id @default(uuid())
  attributeTypeId String
  attributeType   AttributeType @relation(fields: [attributeTypeId], references: [id], onDelete: Cascade)
  name            String   @db.VarChar(100)
  slug            String   @db.VarChar(100)
  hexCode         String?  @db.VarChar(7) // For color attributes
  sortOrder       Int      @default(0)
  isActive        Boolean  @default(true)
  meta            Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  productAttributes ProductAttribute[]

  @@unique([attributeTypeId, slug])
  @@index([attributeTypeId, isActive])
  @@index([sortOrder])
}

model ProductAttribute {
  id              String   @id @default(uuid())
  productId       String
  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  attributeTypeId String
  attributeType   AttributeType @relation(fields: [attributeTypeId], references: [id], onDelete: Cascade)
  isRequired      Boolean  @default(false)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())

  variantAttributes VariantAttribute[]

  @@unique([productId, attributeTypeId])
  @@index([productId])
  @@index([attributeTypeId])
}
```

### A.2 Variant Tables

```prisma
model ProductVariant {
  id            String   @id @default(uuid())
  productId     String
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku           String   @unique @db.VarChar(50)
  price         Decimal? @db.Decimal(10, 2)
  stock         Int      @default(0)
  reservedStock Int      @default(0)
  incomingStock Int      @default(0)
  lowStockThreshold Int @default(10)
  isActive      Boolean  @default(true)
  sortOrder     Int      @default(0)
  meta          Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  variantAttributes VariantAttribute[]
  cartItems     CartItem[]
  orderItems    OrderItem[]
  wishlistItems Wishlist[]
  inventoryHistory InventoryHistory[]

  @@index([productId, isActive])
  @@index([isActive, stock])
  @@index([sku])
  @@index([productId, isActive, stock])
}

model VariantAttribute {
  id              String   @id @default(uuid())
  variantId       String
  variant         ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  attributeValueId String
  attributeValue  AttributeValue @relation(fields: [attributeValueId], references: [id], onDelete: Cascade)
  createdAt       DateTime @default(now())

  @@unique([variantId, attributeValueId])
  @@index([variantId])
  @@index([attributeValueId])
}

model InventoryHistory {
  id            String   @id @default(uuid())
  variantId     String
  variant       ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  type          String   @db.VarChar(50) // STOCK_ADD, STOCK_REDUCE, STOCK_RESERVE, etc.
  quantity      Int
  stockBefore   Int
  stockAfter    Int
  reservedBefore Int
  reservedAfter Int
  referenceId   String?
  referenceType String?
  reason        String?
  adminId       String?
  createdAt     DateTime @default(now())

  @@index([variantId, createdAt])
  @@index([type])
  @@index([createdAt])
  @@index([adminId])
}
```

### A.3 Future Tables

```prisma
model Warehouse {
  id        String   @id @default(uuid())
  name      String   @db.VarChar(200)
  code      String   @unique @db.VarChar(50)
  address   String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  inventory WarehouseInventory[]
  outgoingTransfers StockTransfer[] @relation("outgoing")
  incomingTransfers StockTransfer[] @relation("incoming")
}

model WarehouseInventory {
  id            String   @id @default(uuid())
  warehouseId   String
  warehouse     Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  variantId     String
  variant       ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  stock         Int      @default(0)
  reservedStock Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([warehouseId, variantId])
  @@index([warehouseId])
  @@index([variantId])
}

model StockTransfer {
  id                String   @id @default(uuid())
  fromWarehouseId   String
  fromWarehouse     Warehouse @relation("outgoing", fields: [fromWarehouseId], references: [id], onDelete: Restrict)
  toWarehouseId     String
  toWarehouse       Warehouse @relation("incoming", fields: [toWarehouseId], references: [id], onDelete: Restrict)
  variantId         String
  variant           ProductVariant @relation(fields: [variantId], references: [id], onDelete: Restrict)
  quantity          Int
  status            String   @default("pending") // pending, in_transit, completed, cancelled
  initiatedBy       String
  notes             String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([fromWarehouseId])
  @@index([toWarehouseId])
  @@index([variantId])
  @@index([status])
}
```

---

## Appendix B: API Endpoint Reference

### B.1 Attribute Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/attributes` | Admin | List attribute types |
| `POST` | `/api/admin/attributes` | Admin | Create attribute type |
| `PATCH` | `/api/admin/attributes/:id` | Admin | Update attribute type |
| `DELETE` | `/api/admin/attributes/:id` | Admin | Deactivate attribute type |
| `GET` | `/api/admin/attributes/:id/values` | Admin | List attribute values |
| `POST` | `/api/admin/attributes/:id/values` | Admin | Create attribute value |
| `PATCH` | `/api/admin/attributes/:id/values/:valueId` | Admin | Update attribute value |
| `DELETE` | `/api/admin/attributes/:id/values/:valueId` | Admin | Deactivate attribute value |

### B.2 Variant Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/products/:id/variants` | Admin | List product variants |
| `POST` | `/api/admin/products/:id/variants` | Admin | Create variant |
| `POST` | `/api/admin/products/:id/variants/generate` | Admin | Generate combinations |
| `PATCH` | `/api/admin/products/:id/variants/:variantId` | Admin | Update variant |
| `DELETE` | `/api/admin/products/:id/variants/:variantId` | Admin | Delete variant |
| `POST` | `/api/admin/products/:id/variants/bulk` | Admin | Bulk variant operations |

### B.3 Inventory Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/inventory` | Admin | List inventory |
| `GET` | `/api/admin/inventory/:variantId` | Admin | Get variant inventory |
| `PATCH` | `/api/admin/inventory/:variantId` | Admin | Update stock |
| `POST` | `/api/admin/inventory/:variantId/reserve` | Admin | Reserve stock |
| `POST` | `/api/admin/inventory/:variantId/release` | Admin | Release stock |
| `POST` | `/api/admin/inventory/bulk` | Admin | Bulk stock update |
| `GET` | `/api/admin/inventory/history` | Admin | Inventory history |
| `GET` | `/api/admin/inventory/history/:variantId` | Admin | Variant inventory history |
| `POST` | `/api/admin/inventory/audit` | Admin | Run inventory audit |

---

## Appendix C: Error Code Reference

### C.1 Attribute Error Codes

| Code | HTTP Status | Message |
|------|-------------|---------|
| `ATTRIBUTE_TYPE_NOT_FOUND` | 404 | Attribute type not found |
| `ATTRIBUTE_TYPE_DUPLICATE` | 409 | Attribute type with this slug already exists |
| `ATTRIBUTE_VALUE_NOT_FOUND` | 404 | Attribute value not found |
| `ATTRIBUTE_VALUE_DUPLICATE` | 409 | Attribute value with this slug already exists |
| `ATTRIBUTE_TYPE_INACTIVE` | 410 | Attribute type is deactivated |
| `ATTRIBUTE_VALUE_INACTIVE` | 410 | Attribute value is deactivated |

### C.2 Variant Error Codes

| Code | HTTP Status | Message |
|------|-------------|---------|
| `VARIANT_NOT_FOUND` | 404 | Variant not found |
| `VARIANT_SKU_DUPLICATE` | 409 | SKU already exists |
| `VARIANT_SKU_INVALID` | 400 | Invalid SKU format |
| `VARIANT_ATTRIBUTES_REQUIRED` | 400 | At least one attribute required |
| `VARIANT_DUPLICATE_COMBINATION` | 409 | This combination already exists |
| `VARIANT_STOCK_INVALID` | 400 | Invalid stock value |
| `VARIANT_PRICE_INVALID` | 400 | Invalid price value |

### C.3 Inventory Error Codes

| Code | HTTP Status | Message |
|------|-------------|---------|
| `INSUFFICIENT_STOCK` | 400 | Insufficient stock available |
| `STOCK_CANNOT_BE_NEGATIVE` | 400 | Stock cannot be negative |
| `RESERVED_EXCEEDS_STOCK` | 400 | Reserved stock exceeds total stock |
| `RELEASE_EXCEEDS_RESERVED` | 400 | Release quantity exceeds reserved |
| `INVENTORY_ADJUSTMENT_FAILED` | 500 | Inventory adjustment failed |
| `BULK_OPERATION_PARTIAL_SUCCESS` | 200 | Some operations succeeded, some failed |

---

**Document Version:** 1.0
**Last Updated:** August 03, 2026
**Next Review:** September 03, 2026

*This document is the official Variant, Attribute & Inventory Engine Architecture Standard for the Nabome Commerce Operating System. Every AI agent must follow these standards when working with variants, attributes, or inventory.*
