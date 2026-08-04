# নবME (Nabome) — Product Management Engine Architecture Standard

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for product lifecycle, creation, media, variants, inventory, publishing, validation, and administration
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), CATALOG_ARCHITECTURE.md (v1.0), STORAGE_ENGINE_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Product Foundation](#1-product-foundation)
2. [Product Creation & Workflow](#2-product-creation--workflow)
3. [Product Information Architecture](#3-product-information-architecture)
4. [Media Management](#4-media-management)
5. [Variant Architecture](#5-variant-architecture)
6. [Inventory Integration](#6-inventory-integration)
7. [Product Relationships](#7-product-relationships)
8. [Validation Architecture](#8-validation-architecture)
9. [Search Readiness](#9-search-readiness)
10. [Permission Architecture](#10-permission-architecture)
11. [Performance Standards](#11-performance-standards)
12. [Security Architecture](#12-security-architecture)
13. [Accessibility Standards](#13-accessibility-standards)
14. [Future Readiness](#14-future-readiness)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Product Foundation

### 1.1 What

The foundational philosophy, ownership model, lifecycle, states, visibility rules, relationships, inheritance patterns, validation principles, and extensibility points that govern every product on the Nabome platform.

### 1.2 Why

- **Unified mental model:** Every AI agent and developer shares the same understanding of what a product is, how it behaves, and what rules govern it.
- **Scalability without redesign:** The product engine grows from 100 to 1,000,000 products without architectural changes.
- **Module independence:** The Product Engine is a standalone foundation — every future module (cart, checkout, orders, recommendations, marketplace) depends on it without owning it.
- **Auditability:** Every product action is traceable, reversible, and logged.

### 1.3 Where

Every product listing, creation form, detail page, search result, cart item, order line, recommendation, and admin dashboard across the Nabome platform.

---

### 1.4 Product Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Product is the atomic unit** | Everything in commerce orbits the product | Core business object |
| **One product, one home** | Exactly one primary category per product | Structural clarity, no ambiguity |
| **Parent owns children** | Product owns variants, images, collections | Lifecycle consistency |
| **Draft-first** | Every product starts as draft, never auto-published | Quality control |
| **Soft operations only** | No hard deletes — soft delete, archive, restore | Data integrity |
| **Every action auditable** | Every create, update, publish, archive logged | Compliance, debugging |
| **No duplicated logic** | Product Engine provides services; modules consume | Single source of truth |
| **Future-compatible** | Schema extends without breaking existing data | Long-term viability |

### 1.5 Product Ownership

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Primary owner** | Exactly one `categoryId` per product | Structural clarity |
| **Brand** | Optional `brandId` per product | Brand filtering |
| **Collections** | Many-to-many via `ProductCollection` junction | Flexible merchandising |
| **Tags** | Array of strings (max 10) for flexible labeling | Dynamic filtering |
| **Gender** | Enum: `men`, `women`, `unisex` | Audience targeting |
| **Status** | `ProductStatus` enum for lifecycle control | Publishing workflow |
| **Media** | One-to-many via `ProductImage` junction | Visual showcase |
| **Variants** | One-to-many via `ProductVariant` | SKU management |

### 1.6 Product Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT LIFECYCLE                              │
│                                                                  │
│                    ┌──────────┐                                  │
│                    │  DRAFT   │                                  │
│                    │ (default)│                                  │
│                    └────┬─────┘                                  │
│                         │                                        │
│              ┌──────────┼──────────┐                             │
│              ▼          ▼          ▼                             │
│        ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│        │SCHEDULED │ │PUBLISHED │ │ ARCHIVED │                   │
│        │          │ │          │ │          │                   │
│        └────┬─────┘ └────┬─────┘ └────┬─────┘                   │
│             │            │            │                          │
│             └────────────┼────────────┘                          │
│                          ▼                                       │
│                    ┌──────────┐                                  │
│                    │  DRAFT   │ (restore via admin action)       │
│                    └──────────┘                                  │
│                                                                  │
│  RULES:                                                          │
│  • DRAFT → PUBLISHED (admin publishes)                           │
│  • DRAFT → SCHEDULED (admin schedules for future publish)        │
│  • SCHEDULED → PUBLISHED (auto at scheduledAt time)              │
│  • PUBLISHED → ARCHIVED (admin archives)                         │
│  • ARCHIVED → DRAFT (admin restores)                             │
│  • Any state → DRAFT (admin unpublishes)                         │
│  • DRAFT → deleted (permanent, admin only, requires confirmation)│
└─────────────────────────────────────────────────────────────────┘
```

### 1.7 Product States

| State | Public Store | Admin Panel | Search Index | Cart | Orders | Cache |
|-------|-------------|-------------|--------------|------|--------|-------|
| **draft** | Not visible | Visible (draft badge) | Not indexed | Not addable | N/A | Not cached |
| **scheduled** | Not visible until date | Visible (scheduled badge) | Indexed at scheduledAt | Not addable | N/A | Not cached |
| **published** | Visible | Visible (live badge) | Indexed | Addable | Purchasable | Cached |
| **archived** | Not visible | Visible (archived badge) | De-indexed | Not addable | Historical | Not cached |

### 1.8 Product Visibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default status** | `draft` on creation | Never auto-publish |
| **Status transitions** | Admin-controlled only | Prevent accidental publishing |
| **Scheduled publishing** | `scheduledAt` timestamp triggers status change | Time-based publishing |
| **Soft delete** | Set to `archived`, never hard delete | Referential integrity |
| **Restoration** | Set back to `draft` or `published` | Undo capability |
| **Variant visibility** | Variant inherits product visibility | No orphaned variants |
| **Image visibility** | Image inherits product visibility | No orphaned images |
| **Collection visibility** | Product visible if collection is active | Clean storefront |

### 1.9 Product Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT RELATIONSHIP MAP                       │
│                                                                  │
│                    ┌──────────────────┐                          │
│                    │     Product      │                          │
│                    │   (Parent)       │                          │
│                    └────────┬─────────┘                          │
│                             │                                    │
│          ┌──────────────────┼──────────────────┐                 │
│          │                  │                  │                 │
│          ▼                  ▼                  ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Category    │  │    Brand     │  │  Collection  │          │
│  │  (1:1)       │  │  (N:1)       │  │  (M:N)       │          │
│  │  mandatory   │  │  optional    │  │  optional    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                             │                                    │
│          ┌──────────────────┼──────────────────┐                 │
│          │                  │                  │                 │
│          ▼                  ▼                  ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Variant    │  │    Image     │  │    Tag       │          │
│  │  (1:N)       │  │  (1:N)       │  │  (array)     │          │
│  │  required    │  │  required    │  │  optional    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                             │                                    │
│          ┌──────────────────┼──────────────────┐                 │
│          │                  │                  │                 │
│          ▼                  ▼                  ▼                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Review     │  │   Wishlist   │  │   OrderItem  │          │
│  │  (1:N)       │  │  (M:N)       │  │  (1:N)       │          │
│  │  read-only   │  │  read-only   │  │  read-only   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.10 Product Inheritance

| Inherited Attribute | Source | Override | Rationale |
|-------------------|--------|----------|-----------|
| **Gender** | Category → Product | Product can override | Audience filtering |
| **Status** | Product → Variant | Variant inherits | Lifecycle consistency |
| **Status** | Product → Image | Image inherits | Lifecycle consistency |
| **Base price** | Product → Variant | Variant can override | Per-SKU pricing |
| **SEO defaults** | Category → Product | Product overrides | SEO flexibility |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Inherit by default** | Children inherit parent attributes | Consistency |
| **Override explicitly** | Only override when child needs different behavior | Intentional changes |
| **Never inherit mutable state** | Don't inherit stock, price changes | Data integrity |

### 1.11 Product Validation Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Fail fast** | Validate at creation, not at publish | Early error detection |
| **Progressive validation** | Draft has minimal requirements, publish has full | Flexible workflow |
| **Shared schemas** | Same Zod schema frontend and backend | No duplication |
| **Field-level errors** | Every error maps to a specific field | Better UX |
| **Completeness scoring** | Product completeness percentage guides admins | Quality control |

### 1.12 Product Extensibility

| Extension Point | How to Extend | Migration Path |
|----------------|---------------|----------------|
| **Custom attributes** | `meta` JSONB column on Product | Add fields to meta object |
| **Product templates** | New `ProductTemplate` table | New table + FK to Product |
| **Product versioning** | New `ProductVersion` table | New table + FK to Product |
| **Bundles** | New `ProductBundle` junction table | New table |
| **Digital products** | Add `isDigital` flag + download URL | Add column |
| **Subscriptions** | New `SubscriptionPlan` table | New table |
| **Multi-language** | New `ProductTranslation` table | New table |
| **Multi-currency** | New `ProductPrice` table per currency | New table |
| **Marketplace** | Add `sellerId` to Product | Add column + FK |

---

## 2. Product Creation & Workflow

### 2.1 What

The complete architecture for creating, editing, duplicating, publishing, unpublishing, archiving, restoring, and permanently deleting products — including bulk operations and future scheduling.

### 2.2 Why

- **Efficiency:** Admins create products in minimal steps
- **Quality:** Every product passes validation before publishing
- **Safety:** No accidental publishes, no accidental deletes
- **Auditability:** Every workflow action is logged
- **Scalability:** Bulk operations handle hundreds of products

### 2.3 Where

Admin panel product management, API handlers in `api/_handlers/admin/products/`, frontend components in `src/features/admin/products/`.

---

### 2.4 Create Product

#### 2.4.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE PRODUCT WORKFLOW                        │
│                                                                  │
│  1. Admin clicks "Create Product"                                │
│     → Empty product form loads                                   │
│                                                                  │
│  2. Admin fills required fields                                  │
│     → name, categoryId, basePrice                               │
│                                                                  │
│  3. Admin saves as draft                                         │
│     → Product created with status = draft                        │
│     → Auto-generated slug from name                              │
│     → Audit log: PRODUCT_CREATED                                 │
│                                                                  │
│  4. Admin optionally adds                                        │
│     → Description, images, variants, SEO, tags                   │
│                                                                  │
│  5. Admin publishes (optional)                                   │
│     → Validation runs (full publish validation)                  │
│     → Product status → published                                 │
│     → Product indexed in search                                  │
│     → Product cached                                             │
│     → Audit log: PRODUCT_PUBLISHED                               │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.4.2 Create Product API

```
POST /api/admin/products

Required fields:
  - name: string (1-300 chars)
  - categoryId: string (UUID)
  - basePrice: number (positive, DECIMAL(10,2))

Optional fields:
  - description: string
  - brandId: string (UUID)
  - gender: enum (men, women, unisex)
  - tags: string[] (max 10)
  - meta: JSONB
  - isFeatured: boolean
  - isNew: boolean

Response: 201 Created
  - Product object with status = draft
  - Auto-generated slug
  - createdAt timestamp
```

#### 2.4.3 Create Product Validation

| Field | Required | Validation | Error Code |
|-------|----------|------------|------------|
| `name` | Yes | 1-300 chars, trimmed | `PRODUCT_NAME_REQUIRED` |
| `categoryId` | Yes | Valid UUID, category exists and isActive | `PRODUCT_CATEGORY_INVALID` |
| `basePrice` | Yes | Positive number, max 2 decimal places | `PRODUCT_PRICE_INVALID` |
| `brandId` | No | Valid UUID if provided, brand exists | `PRODUCT_BRAND_INVALID` |
| `gender` | No | Enum value, defaults to `unisex` | `PRODUCT_GENDER_INVALID` |
| `tags` | No | Array of strings, max 10 items, max 50 chars each | `PRODUCT_TAGS_INVALID` |
| `slug` | Auto | Auto-generated from name, unique | `PRODUCT_SLUG_DUPLICATE` |

#### 2.4.4 Create Product Best Practices

| Practice | Standard | Rationale |
|----------|----------|-----------|
| **Minimal required fields** | Only name, category, price required | Fast creation |
| **Auto-generate slug** | From name, admin can override | URL consistency |
| **Default to draft** | Never auto-publish | Quality control |
| **Auto-generate SKU** | If no SKU provided, generate from product name + variant | Inventory tracking |
| **Validate category exists** | Check category isActive before linking | Data integrity |
| **Log creation** | Audit log with admin ID and timestamp | Accountability |

#### 2.4.5 Common Create Product Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Auto-publishing on create | Quality control failure | Always start as draft |
| No slug generation | Broken URLs | Auto-generate from name |
| Skipping category validation | Orphaned products | Validate category exists |
| No audit logging | No accountability | Log every creation |
| Allowing empty name | Broken displays | Enforce name requirement |

---

### 2.5 Duplicate Product

#### 2.5.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DUPLICATE PRODUCT WORKFLOW                     │
│                                                                  │
│  1. Admin selects product to duplicate                           │
│     → "Duplicate" action in product list or detail               │
│                                                                  │
│  2. System creates copy                                          │
│     → Copies: name (prefixed "Copy of "), description,           │
│       categoryId, brandId, gender, tags, meta                    │
│     → Does NOT copy: slug (regenerated), status (draft),         │
│       variants, images, collections, reviews,                    │
│       SEO overrides, createdAt/updatedAt                         │
│                                                                  │
│  3. Admin edits duplicated product                               │
│     → Adjusts name, adds images, creates variants                │
│                                                                  │
│  4. Admin publishes                                              │
│     → Full validation runs                                       │
│     → Product goes live                                          │
│     → Audit log: PRODUCT_DUPLICATED + PRODUCT_PUBLISHED          │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.5.2 Duplicate Product Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Copy metadata only** | Name, description, category, brand, gender, tags | Start fresh with structure |
| **New slug** | Regenerate from (copy of) name | URL uniqueness |
| **Draft status** | Always start as draft | Quality control |
| **No variants** | Variants are SKU-specific, don't duplicate | Fresh inventory |
| **No images** | Images are product-specific | Avoid licensing issues |
| **No collections** | Collections are curated per product | Manual assignment |
| **No reviews** | Reviews are product-specific | Authenticity |
| **No SEO overrides** | SEO is product-specific | Fresh optimization |
| **Audit both** | Log original product ID and new product ID | Traceability |

#### 2.5.3 Common Duplicate Product Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Copying variants | SKU conflicts, inventory confusion | Fresh variants only |
| Copying images | Licensing, storage waste | Fresh images only |
| Copying slug | URL conflicts | Regenerate slug |
| Copying status | Accidental publish | Always draft |
| Copying reviews | Fake social proof | Fresh reviews only |

---

### 2.6 Edit Product

#### 2.6.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EDIT PRODUCT WORKFLOW                          │
│                                                                  │
│  1. Admin opens product for editing                              │
│     → Product form loads with current data                       │
│                                                                  │
│  2. Admin modifies fields                                        │
│     → Real-time validation on each field                         │
│     → Unsaved changes indicator                                  │
│                                                                  │
│  3. Admin saves changes                                          │
│     → Validation runs on changed fields only                     │
│     → PATCH request to API                                       │
│     → Audit log: PRODUCT_UPDATED with field changes              │
│                                                                  │
│  4. If publishing required fields changed                        │
│     → Re-validate publish requirements                           │
│     → If product was published, re-index in search               │
│     → If slug changed, 301 redirect from old slug                │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.6.2 Edit Product API

```
PATCH /api/admin/products/:id

Allowed fields (partial update):
  - name: string
  - description: string
  - categoryId: string (UUID)
  - brandId: string (UUID)
  - basePrice: number
  - gender: enum
  - tags: string[]
  - meta: JSONB
  - isFeatured: boolean
  - isNew: boolean
  - isTrending: boolean
  - sortOrder: number
  - metaTitle: string
  - metaDescription: string

Response: 200 OK
  - Updated product object
  - updatedAt timestamp
```

#### 2.6.3 Edit Product Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Partial updates only** | Only send changed fields | Bandwidth, audit clarity |
| **Validate on save** | Run Zod schema on changed fields | Data integrity |
| **Audit field changes** | Log old value → new value for each change | Accountability |
| **Slug regeneration** | If name changes, optionally regenerate slug | URL consistency |
| **Re-index on publish** | If published product edited, update search index | Fresh search results |
| **Re-cache on publish** | If published product edited, invalidate cache | Fresh cached data |
| **301 redirect** | If slug changed, create redirect from old to new | SEO preservation |
| **No status change via edit** | Status changes require explicit publish/unpublish action | Intentional transitions |

#### 2.6.4 Common Edit Product Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Full replace on edit | Overwrites unchanged fields | Partial update only |
| No audit logging | No change history | Log every change |
| Slug change without redirect | Broken links, SEO loss | 301 redirect |
| Editing archived products | Confusing state | Unarchive first |
| No re-index after edit | Stale search results | Re-index published products |

---

### 2.7 Save Draft

#### 2.7.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SAVE DRAFT WORKFLOW                            │
│                                                                  │
│  1. Admin creates new product or edits existing                  │
│     → Fills in available fields                                  │
│                                                                  │
│  2. Admin clicks "Save Draft"                                    │
│     → Minimal validation (name only required)                    │
│     → Product saved with status = draft                          │
│     → No search indexing                                          │
│     → No caching                                                 │
│     → Audit log: PRODUCT_DRAFT_SAVED                             │
│                                                                  │
│  3. Admin can return later to complete                           │
│     → Draft appears in admin product list                        │
│     → Draft badge visible                                        │
│     → Completeness percentage shown                              │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.7.2 Save Draft Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimal validation** | Only name required for draft | Flexible workflow |
| **No publish validation** | Don't require images, variants for draft | Save partial progress |
| **Auto-save** | Optional auto-save every 30 seconds | Prevent data loss |
| **Completeness score** | Show percentage of required fields completed | Guide completion |
| **Draft expiration** | Drafts older than 90 days flagged for review | Clean admin panel |
| **No public visibility** | Drafts never visible on storefront | Quality control |

---

### 2.8 Publish

#### 2.8.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLISH WORKFLOW                               │
│                                                                  │
│  1. Admin clicks "Publish" on draft product                     │
│     → Full publish validation runs                               │
│                                                                  │
│  2. Validation passes                                             │
│     → Product status → published                                 │
│     → Product indexed in search                                  │
│     → Product cached at edge                                     │
│     → Audit log: PRODUCT_PUBLISHED                               │
│                                                                  │
│  3. Validation fails                                              │
│     → Error messages displayed                                   │
│     → Product remains draft                                      │
│     → Admin fixes issues                                         │
│     → Retries publish                                            │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.8.2 Publish Validation Requirements

| Field | Required | Validation | Error Code |
|-------|----------|------------|------------|
| `name` | Yes | 1-300 chars | `PUBLISH_NAME_REQUIRED` |
| `categoryId` | Yes | Valid, active category | `PUBLISH_CATEGORY_REQUIRED` |
| `basePrice` | Yes | Positive decimal | `PUBLISH_PRICE_REQUIRED` |
| `description` | Yes | 10-5000 chars | `PUBLISH_DESCRIPTION_REQUIRED` |
| `images` | Yes | At least 1 image | `PUBLISH_IMAGE_REQUIRED` |
| `variants` | Yes | At least 1 active variant | `PUBLISH_VARIANT_REQUIRED` |
| `slug` | Yes | Unique, valid format | `PUBLISH_SLUG_REQUIRED` |

#### 2.8.3 Publish Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Full validation** | All required fields must be present | Quality control |
| **Admin-initiated** | Only admin can publish | Intentional action |
| **Audit log** | Log publish action with admin ID | Accountability |
| **Search indexing** | Index product in search immediately | Discoverability |
| **Cache warming** | Add product to edge cache | Performance |
| **Re-publish on edit** | If published product edited, re-index | Fresh results |

#### 2.8.4 Common Publish Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Publishing without images | Broken product page | Require at least 1 image |
| Publishing without variants | Cannot purchase | Require at least 1 variant |
| Auto-publishing | Quality control failure | Always require admin action |
| No publish validation | Incomplete products go live | Full validation on publish |

---

### 2.9 Unpublish

#### 2.9.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNPUBLISH WORKFLOW                             │
│                                                                  │
│  1. Admin clicks "Unpublish" on published product               │
│     → Confirmation dialog displayed                              │
│                                                                  │
│  2. Admin confirms                                               │
│     → Product status → draft                                     │
│     → Product de-indexed from search                             │
│     → Product removed from cache                                 │
│     → Product removed from collections (optional)                │
│     → Audit log: PRODUCT_UNPUBLISHED                             │
│                                                                  │
│  3. Product visible only in admin panel                          │
│     → Draft badge shown                                          │
│     → Can be re-published at any time                            │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.9.2 Unpublish Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Confirmation required** | Admin must confirm unpublish | Prevent accidents |
| **Status → draft** | Return to draft state | Reversible |
| **De-index immediately** | Remove from search | No stale results |
| **Cache invalidation** | Remove from edge cache | No stale cache |
| **Cart handling** | Items in cart remain (checkout warning) | Don't break cart |
| **Order preservation** | Historical orders unaffected | Data integrity |
| **Audit log** | Log unpublish with reason | Accountability |

---

### 2.10 Archive

#### 2.10.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHIVE WORKFLOW                               │
│                                                                  │
│  1. Admin clicks "Archive" on product                           │
│     → Confirmation dialog with warning                           │
│                                                                  │
│  2. Admin confirms with reason                                   │
│     → Product status → archived                                  │
│     → Product de-indexed from search                             │
│     → Product removed from cache                                 │
│     → Product removed from all collections                       │
│     → Product images hidden from public                          │
│     → Audit log: PRODUCT_ARCHIVED with reason                    │
│                                                                  │
│  3. Product visible only in admin panel                          │
│     → Archived badge shown                                       │
│     → Can be restored to draft                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.10.2 Archive Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Reason required** | Admin must provide reason | Accountability |
| **Confirmation required** | Double confirmation for archive | Prevent accidents |
| **De-index immediately** | Remove from search | No stale results |
| **Cache invalidation** | Remove from edge cache | No stale cache |
| **Collection removal** | Remove from all active collections | Clean storefront |
| **Image hiding** | Images hidden, not deleted | Reversible |
| **Cart handling** | Cart items show "no longer available" | Customer communication |
| **Order preservation** | Historical orders unaffected | Data integrity |

---

### 2.11 Restore

#### 2.11.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RESTORE WORKFLOW                               │
│                                                                  │
│  1. Admin selects archived product                               │
│     → Clicks "Restore"                                           │
│                                                                  │
│  2. System restores product                                      │
│     → Product status → draft                                     │
│     → Product visible in admin panel                             │
│     → Audit log: PRODUCT_RESTORED                                │
│                                                                  │
│  3. Admin reviews and re-publishes                               │
│     → Updates any outdated information                           │
│     → Re-adds to collections if needed                           │
│     → Publishes when ready                                       │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.11.2 Restore Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Restore to draft** | Not directly to published | Quality control |
| **Review before publish** | Admin must review restored product | Prevent stale data |
| **Re-index on publish** | Search indexing only on publish | No premature indexing |
| **Audit log** | Log restore action | Accountability |

---

### 2.12 Permanent Delete

#### 2.12.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERMANENT DELETE WORKFLOW                       │
│                                                                  │
│  1. Admin selects draft product for deletion                     │
│     → Only draft products can be permanently deleted             │
│     → Confirmation dialog with warnings                          │
│                                                                  │
│  2. Admin types product name to confirm                          │
│     → Double confirmation required                               │
│                                                                  │
│  3. System processes deletion                                     │
│     → Archives all product images to R2                          │
│     → Deletes images from Cloudinary                             │
│     → Deletes product variants                                   │
│     → Deletes product record                                     │
│     → Audit log: PRODUCT_PERMANENTLY_DELETED                     │
│                                                                  │
│  4. Product removed from all systems                             │
│     → Not in admin panel                                         │
│     → Not in search                                              │
│     → Not in any collection                                      │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.12.2 Permanent Delete Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Draft only** | Only draft products can be permanently deleted | Prevent accidental deletion of live products |
| **Double confirmation** | Type product name + click confirm | Prevent accidents |
| **Archive images first** | Move images to R2 before deletion | Compliance, recovery |
| **Cascade delete** | Delete variants, images, junction records | Data integrity |
| **Audit log** | Log with reason, admin ID, timestamp | Accountability |
| **No orders referencing** | Cannot delete if orders reference product | Referential integrity |
| **No reviews referencing** | Cannot delete if reviews exist | Data integrity |

---

### 2.13 Bulk Operations

#### 2.13.1 Supported Bulk Operations

| Operation | Description | Validation | Limit |
|-----------|-------------|------------|-------|
| **Bulk publish** | Publish multiple draft products | Each product validated | 50 per batch |
| **Bulk unpublish** | Unpublish multiple products | Confirmation required | 50 per batch |
| **Bulk archive** | Archive multiple products | Reason required per product | 50 per batch |
| **Bulk delete** | Permanently delete multiple drafts | Double confirmation | 20 per batch |
| **Bulk category assign** | Move products to different category | Category validation | 100 per batch |
| **Bulk price update** | Update base price for multiple products | Price validation | 100 per batch |
| **Bulk tag add** | Add tags to multiple products | Tag validation | 100 per batch |
| **Bulk featured toggle** | Feature/unfeature multiple products | Max 20 featured | 50 per batch |

#### 2.13.2 Bulk Operation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Batch size limit** | Max 50 operations per batch | Performance, error recovery |
| **Individual validation** | Validate each product individually | Data integrity |
| **Partial success handling** | Report which succeeded, which failed | Transparency |
| **Progress indication** | Show real-time progress for bulk ops | UX feedback |
| **Undo capability** | Allow undo within 5 minutes of bulk action | Safety |
| **Audit bulk actions** | Log each individual product change | Accountability |
| **Rate limiting** | Max 3 bulk operations per minute | Prevent abuse |
| **Background processing** | Large batches processed in background | Request performance |

#### 2.13.3 Bulk Operation Error Handling

```typescript
// Bulk operation response format
interface BulkOperationResult {
  success: boolean;
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{
    productId: string;
    success: boolean;
    error?: {
      code: string;
      message: string;
    };
  }>;
  summary: {
    succeeded: string[]; // Product IDs that succeeded
    failed: Array<{
      productId: string;
      productName: string;
      error: string;
    }>;
  };
}
```

---

### 2.14 Future Scheduling

#### 2.14.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FUTURE SCHEDULING WORKFLOW                     │
│                                                                  │
│  1. Admin creates or edits product                               │
│     → Sets "scheduledAt" date/time                               │
│                                                                  │
│  2. System saves product                                         │
│     → Product status → scheduled                                 │
│     → Product not visible on storefront                          │
│     → Product not indexed in search                              │
│     → Audit log: PRODUCT_SCHEDULED                               │
│                                                                  │
│  3. At scheduledAt time                                           │
│     → Background job checks for scheduled products               │
│     → Validates product for publish                              │
│     → If valid: status → published, indexed, cached              │
│     → If invalid: status → draft, admin notified                 │
│     → Audit log: PRODUCT_AUTO_PUBLISHED                          │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.14.2 Scheduling Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Future date only** | scheduledAt must be in the future | Prevent immediate publish |
| **Validation on schedule** | Validate all publish requirements at schedule time | Catch issues early |
| **Re-validation on trigger** | Re-validate at scheduled time | Data may have changed |
| **Failure handling** | If validation fails at trigger, set to draft + notify admin | Prevent broken publishes |
| **Background job** | Cron job every minute checks scheduled products | Reliable triggering |
| **Timezone aware** | Store and trigger in UTC | Consistency |
| **Admin notification** | Email admin when product auto-publishes or fails | Awareness |

---

## 3. Product Information Architecture

### 3.1 What

The complete architecture for all product information fields — naming, descriptions, rich content, specifications, attributes, highlights, care instructions, additional information, and SEO metadata.

### 3.2 Why

- **Consistency:** Every product follows the same information structure
- **SEO:** Structured data improves search rankings
- **Discoverability:** Complete products are more findable
- **Customer experience:** Rich information helps purchase decisions
- **Accessibility:** Structured data enables assistive technologies

### 3.3 Where

Product creation form, product detail page, search results, structured data, sitemap, social media previews.

---

### 3.4 Product Name

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Format** | `{Attribute} {Type} {Style}` e.g., "Premium Cotton Oversized T-Shirt" | Readable, SEO-friendly |
| **Max length** | 300 characters | Prevent overflow |
| **Min length** | 1 character | Prevent empty names |
| **Required** | Yes (for draft and publish) | Core identifier |
| **Unique** | Slug is unique, name is not | Multiple products can share names |
| **Trimmed** | Auto-trim whitespace | Clean data |
| **No HTML** | Plain text only | Security, consistency |

### 3.5 Short Description

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | One-liner for product cards, search results | Quick scanning |
| **Max length** | 160 characters | Fits in search results |
| **Min length** | Optional (recommended for publish) | SEO benefit |
| **Content** | Key selling point, material, or feature | Hook the customer |
| **No HTML** | Plain text only | Card display |

### 3.6 Full Description

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Complete product description for detail page | Informed purchase |
| **Max length** | 5000 characters | Prevent bloat |
| **Min length** | 10 characters (required for publish) | SEO content |
| **Format** | Rich text (limited HTML) | Formatting flexibility |
| **Allowed HTML** | `p`, `br`, `strong`, `em`, `ul`, `ol`, `li`, `h3`, `h4` | Safe formatting |
| **No scripts** | Strip all `<script>`, `<iframe>`, event handlers | Security |
| **SEO** | Include relevant keywords naturally | Search ranking |

### 3.7 Rich Content

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Editorial content, lookbooks, detailed guides | Premium experience |
| **Format** | JSONB array of content blocks | Flexible structure |
| **Block types** | `text`, `image`, `video`, `gallery`, `specification`, `callout` | Common patterns |
| **Storage** | `meta.richContent` JSONB column | No schema change needed |
| **Rendering** | Component-based renderer on frontend | Consistent display |
| **Validation** | Validate block structure at save time | Data integrity |

#### 3.7.1 Rich Content Block Schema

```typescript
type RichContentBlock =
  | { type: 'text'; content: string; align?: 'left' | 'center' | 'right' }
  | { type: 'image'; url: string; alt: string; caption?: string; width?: number; height?: number }
  | { type: 'video'; url: string; poster?: string; caption?: string }
  | { type: 'gallery'; images: Array<{ url: string; alt: string; caption?: string }> }
  | { type: 'specification'; title: string; items: Array<{ label: string; value: string }> }
  | { type: 'callout'; variant: 'info' | 'warning' | 'tip'; content: string };
```

### 3.8 Specifications

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Technical details (material, weight, dimensions) | Informed purchase |
| **Format** | JSONB array of key-value pairs | Flexible structure |
| **Storage** | `meta.specifications` JSONB column | No schema change needed |
| **Display** | Structured table on product detail page | Easy scanning |
| **Searchable** | Indexed for filter matching | Discoverability |

#### 3.8.1 Specifications Schema

```typescript
interface ProductSpecification {
  group: string;        // e.g., "Material", "Dimensions", "Care"
  items: Array<{
    label: string;      // e.g., "Fabric", "Weight"
    value: string;      // e.g., "100% Cotton", "180 GSM"
  }>;
}
```

### 3.9 Attributes

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Filterable product characteristics | Discovery, filtering |
| **Storage** | ProductVariant `size`, `color`, `colorHex` columns | Structured filtering |
| **Extensible** | `meta.attributes` JSONB for custom attributes | Future-proof |
| **Filterable** | All attributes power filter system | Customer discovery |

### 3.10 Product Highlights

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | 3-5 key selling points | Quick scanning |
| **Format** | JSONB array of strings | Simple structure |
| **Storage** | `meta.highlights` JSONB column | No schema change needed |
| **Display** | Bullet points on product detail page | Visual hierarchy |
| **Max items** | 5 highlights | Prevent overwhelming |

### 3.11 Care Instructions

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Product care guidance | Customer satisfaction |
| **Format** | JSONB array of strings | Simple structure |
| **Storage** | `meta.careInstructions` JSONB column | No schema change needed |
| **Display** | Icon + text on product detail page | Visual clarity |

### 3.12 Additional Information

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Any extra product details | Flexibility |
| **Format** | JSONB object with arbitrary keys | Unlimited extension |
| **Storage** | `meta.additionalInfo` JSONB column | No schema change needed |
| **Display** | Expandable section on product detail page | Progressive disclosure |

### 3.13 SEO Information

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Meta title** | 1-300 chars, defaults to product name | Search ranking |
| **Meta description** | 1-500 chars, defaults to short description | Search ranking |
| **OG image** | Defaults to primary product image | Social sharing |
| **Canonical URL** | Auto-generated from slug | Duplicate content prevention |
| **Structured data** | JSON-LD Product schema auto-generated | Rich snippets |
| **Sitemap** | Auto-included for published products | Crawlability |

#### 3.13.1 Structured Data Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Cotton Oversized T-Shirt",
  "description": "Premium quality oversized t-shirt...",
  "image": "https://res.cloudinary.com/nabome/image/upload/...",
  "brand": {
    "@type": "Brand",
    "name": "Nabome Originals"
  },
  "offers": {
    "@type": "Offer",
    "price": "1999",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "url": "https://nabome.online/products/premium-cotton-oversized-t-shirt"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "120"
  }
}
```

### 3.14 Product Meta JSONB Structure

```typescript
interface ProductMeta {
  // Content
  richContent?: RichContentBlock[];
  highlights?: string[];
  careInstructions?: string[];
  additionalInfo?: Record<string, string>;

  // Specifications
  specifications?: ProductSpecification[];
  material?: string;
  origin?: string;
  weight?: string;

  // SEO
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };

  // Attributes
  attributes?: Record<string, string>;

  // Pricing
  salePrice?: number;
  compareAtPrice?: number;
  costPrice?: number;

  // Future extensions
  [key: string]: unknown;
}
```

### 3.15 Common Product Information Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No product description | Poor SEO, no context | Minimum 10 chars for publish |
| No alt text on images | Accessibility violation | Always set descriptive alt |
| No SEO meta tags | Missed search traffic | Auto-generate defaults |
| Overly long name | Truncation in cards | Max 300 chars |
| No specifications | Incomplete product info | Add specifications for publish |
| No highlights | Missed selling points | Add 3-5 highlights |

---

## 4. Media Management

### 4.1 What

The complete architecture for product images, product videos, galleries, featured images, ordering, alt text, compression, and responsive delivery — integrating with the Nabome Storage Engine.

### 4.2 Why

- **Visual commerce:** Products sell through images
- **Performance:** Optimized media loads fast on mobile
- **Accessibility:** Alt text enables screen reader access
- **SEO:** Image optimization improves search rankings
- **Brand consistency:** Uniform image quality and style

### 4.3 Where

Product creation form, product detail page, product cards, search results, cart, checkout, social sharing, structured data.

---

### 4.4 Product Images

#### 4.4.1 Image Standards

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Max images per product** | 8 images | Mobile UX, loading performance |
| **Max file size** | 10MB per image | Prevent abuse |
| **Allowed formats** | JPEG, PNG, WebP, GIF | Standard web formats |
| **Preferred format** | WebP (auto-converted by Cloudinary) | Best compression |
| **Max dimensions** | 4000x4000px | Prevent oversized uploads |
| **Min dimensions** | 400x400px | Ensure quality |
| **Aspect ratio** | 3:4 (portrait) for fashion | Industry standard |
| **Background** | White/transparent | Clean product display |

#### 4.4.2 Image Storage

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Storage provider** | Cloudinary | Auto-optimization, CDN |
| **Folder path** | `nabome/products/{product-uuid}/original/` | Organized storage |
| **File naming** | `{uuid}.{ext}` (no user input) | Security, no collisions |
| **Database record** | `Media` table + `ProductImage` junction | Ownership tracking |
| **CDN URL** | Generated from Cloudinary public_id | Fast delivery |

#### 4.4.3 Image Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE PROCESSING PIPELINE                      │
│                                                                  │
│  1. Upload                                                       │
│     → Client uploads via presigned URL                           │
│     → Server validates file type, size, dimensions               │
│                                                                  │
│  2. Process                                                      │
│     → Auto-convert to WebP/AVIF                                  │
│     → Auto-optimize quality                                      │
│     → Generate responsive variants (400w, 600w, 800w, 1200w)     │
│     → Generate thumbnail (200x200px)                             │
│     → Generate blur-up placeholder                               │
│     → Strip EXIF data (privacy)                                  │
│                                                                  │
│  3. Store                                                        │
│     → Upload to Cloudinary                                       │
│     → Create Media record in database                            │
│     → Create ProductImage junction record                        │
│     → Generate CDN URLs for all variants                         │
│                                                                  │
│  4. Deliver                                                      │
│     → Browser selects appropriate srcSet variant                 │
│     → CDN serves cached version                                  │
│     → Lazy loading for below-fold images                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Product Videos

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Max videos per product** | 2 videos | Mobile bandwidth |
| **Max file size** | 100MB | Prevent abuse |
| **Allowed formats** | MP4, WebM | Web video standards |
| **Max duration** | 60 seconds | Product videos, not long-form |
| **Max resolution** | 1920x1080 (1080p) | Mobile bandwidth |
| **Recommended resolution** | 720p | Balance quality and size |
| **Codec** | H.264 (MP4), VP9 (WebM) | Browser compatibility |
| **Thumbnail** | Auto-generated at 0s, 25%, 50%, 75% | Preview selection |
| **Poster image** | Required — first frame or custom | Fast initial render |
| **Autoplay** | Never autoplay with sound | UX best practice |
| **Lazy loading** | Always — load on interaction | Performance |

### 4.6 Galleries

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Organized image groups (lifestyle, detail, flat lay) | Rich browsing |
| **Structure** | Array of images with optional group labels | Flexible organization |
| **Display** | Thumbnail strip + main image + swipe | Mobile-first browsing |
| **Ordering** | Admin sets display order | Curated experience |
| **Zoom** | Pinch-to-zoom on mobile, hover-zoom on desktop | Detail inspection |

### 4.7 Featured Image

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Primary product image for cards, search, social | First impression |
| **Selection** | Admin marks one image as `isPrimary` | Clear designation |
| **Display** | Product cards, search results, cart, social sharing | Consistent representation |
| **Default** | First uploaded image is primary | Sensible default |
| **Changeable** | Admin can change primary image | Flexibility |
| **Structured data** | Used as `og:image` and JSON-LD `image` | SEO |

### 4.8 Image Ordering

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Method** | `sortOrder` integer on `ProductImage` | Simple, effective |
| **Default** | Order of upload | Sensible default |
| **Admin control** | Drag-and-drop reordering in admin panel | Curated experience |
| **Display** | Lowest sortOrder first | Predictable |
| **Reorderable** | Admin can change order at any time | Flexibility |

### 4.9 Video Ordering

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Method** | `sortOrder` integer on product video records | Simple, effective |
| **Default** | Order of upload | Sensible default |
| **Admin control** | Drag-and-drop reordering | Curated experience |
| **Display** | Lowest sortOrder first | Predictable |

### 4.10 Alt Text

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Accessibility, SEO | Screen readers, search |
| **Required** | Yes (for publish validation) | Accessibility compliance |
| **Format** | Descriptive text of image content | Meaningful description |
| **Max length** | 125 characters | Screen reader best practice |
| **No "image of"** | Don't start with "Image of" or "Photo of" | Redundant for screen readers |
| **AI suggestion** | Optional AI-generated alt text (future) | Speed up workflow |

#### 4.10.1 Alt Text Best Practices

| Good Examples | Bad Examples |
|---------------|--------------|
| "Black cotton oversized t-shirt front view" | "Product image" |
| "White sneakers side profile on white background" | "IMG_20260803.jpg" |
| "Model wearing navy blue chinos with brown belt" | "Photo" |

### 4.11 Compression

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Auto-format** | WebP/AVIF via Cloudinary `f_auto` | 25-50% smaller files |
| **Auto-quality** | Cloudinary `q_auto` | Optimize quality vs size |
| **Progressive** | Progressive JPEG via `fl_progressive` | Better perceived loading |
| **Strip metadata** | Remove EXIF data | Privacy, smaller files |
| **Target size** | < 200KB for product cards | Fast mobile loading |

### 4.12 Responsive Images

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **srcSet** | 400w, 600w, 800w, 1200w variants | Right size per device |
| **Sizes** | `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw` | Responsive loading |
| **Lazy loading** | `loading="lazy"` for below-fold images | Performance |
| **Blur placeholder** | Tiny base64 placeholder while loading | Perceived performance |
| **Width/height** | Always set explicit dimensions | Prevent CLS |

#### 4.12.1 Responsive Image HTML Pattern

```html
<img
  src="https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_800/products/{uuid}/image.jpg"
  srcset="
    https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_400/products/{uuid}/image.jpg 400w,
    https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_600/products/{uuid}/image.jpg 600w,
    https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_800/products/{uuid}/image.jpg 800w,
    https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_1200/products/{uuid}/image.jpg 1200w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Black cotton oversized t-shirt front view"
  loading="lazy"
  decoding="async"
  width="800"
  height="1067"
/>
```

### 4.13 Common Media Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No alt text | Accessibility violation | Always set descriptive alt |
| No responsive images | Slow mobile loading | Generate srcSet variants |
| No lazy loading | Slow initial page load | Lazy load below-fold images |
| No width/height | Layout shift (CLS) | Always set dimensions |
| Large unoptimized images | Bandwidth waste | Auto-optimize on upload |
| No featured image | Broken product cards | Always set primary image |

---

## 5. Variant Architecture

### 5.1 What

The complete architecture for product variants — variant types, combinations, dynamic variants, SKU relationships, status, visibility, and validation.

### 5.2 Why

- **Inventory tracking:** Each variant is a unique SKU
- **Pricing flexibility:** Different prices per variant
- **Customer choice:** Size, color, and other options
- **Stock management:** Per-SKU inventory tracking
- **Analytics:** Track which variants sell best

### 5.3 Where

Product creation form, product detail page variant selector, cart, checkout, order items, inventory management, search filters.

---

### 5.4 Variant Types

| Variant Type | Purpose | Values | Required |
|-------------|---------|--------|----------|
| **Size** | Physical dimensions | XS, S, M, L, XL, XXL, etc. | Yes (at least one) |
| **Color** | Visual options | Any color with hex code | Yes (at least one) |
| **Custom** | Future extensibility | Configurable | No |

#### 5.4.1 Size Standards

| Category | Available Sizes | Standard |
|----------|----------------|----------|
| **T-Shirts** | XS, S, M, L, XL, XXL | Indian standard |
| **Shirts** | XS, S, M, L, XL, XXL | Indian standard |
| **Pants** | 28, 30, 32, 34, 36, 38, 40 | Waist in inches |
| **Footwear** | 6, 7, 8, 9, 10, 11 | UK standard |

#### 5.4.2 Color Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Name** | Human-readable color name | Customer understanding |
| **Hex code** | 7-character hex color | Visual swatch display |
| **Required** | Both name and hex | Complete data |
| **Format** | `#RRGGBB` | Standard hex format |

### 5.5 Variant Combinations

#### 5.5.1 Combination Generation

```
┌─────────────────────────────────────────────────────────────────┐
│                    VARIANT COMBINATION MATRIX                     │
│                                                                  │
│  Product: Premium Cotton T-Shirt                                 │
│  Sizes: S, M, L                                                 │
│  Colors: Black, White                                            │
│                                                                  │
│  ┌─────────┬─────────┬─────────┐                                │
│  │         │  Black  │  White  │                                │
│  ├─────────┼─────────┼─────────┤                                │
│  │    S    │  SKU-1  │  SKU-2  │                                │
│  │    M    │  SKU-3  │  SKU-4  │                                │
│  │    L    │  SKU-5  │  SKU-6  │                                │
│  └─────────┴─────────┴─────────┘                                │
│                                                                  │
│  Total variants: 3 sizes × 2 colors = 6 variants                │
│  Each variant has: unique SKU, individual stock, optional price  │
└─────────────────────────────────────────────────────────────────┘
```

#### 5.5.2 SKU Generation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Format** | `{PRODUCT-SLUG}-{SIZE}-{COLOR}` | Human-readable |
| **Example** | `PREMIUM-COTTON-TSHIRT-M-BLK` | Clear identification |
| **Uniqueness** | `@unique` constraint on SKU | Inventory integrity |
| **Auto-generation** | System generates if admin doesn't provide | Convenience |
| **Admin override** | Admin can customize SKU format | Business needs |

### 5.6 Dynamic Variants

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Add variant** | Admin adds new size/color combination | Flexible |
| **Remove variant** | Admin deactivates variant (soft delete) | Reversible |
| **Edit variant** | Admin updates stock, price, SKU | Management |
| **Bulk create** | Generate all combinations from size × color matrix | Efficiency |
| **Bulk update** | Update stock/price for multiple variants | Efficiency |

### 5.7 SKU Relationship

```
┌─────────────────────────────────────────────────────────────────┐
│                    SKU RELATIONSHIP MODEL                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Product (Parent)                        │   │
│  │  • name: "Premium Cotton T-Shirt"                         │   │
│  │  • basePrice: ₹1999                                       │   │
│  │  • categoryId: {uuid}                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│          ┌───────────────┼───────────────┐                      │
│          ▼               ▼               ▼                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │  Variant 1   │ │  Variant 2   │ │  Variant 3   │            │
│  │  SKU: TSH-M-B│ │  SKU: TSH-L-B│ │  SKU: TSH-M-W│            │
│  │  Size: M     │ │  Size: L     │ │  Size: M     │            │
│  │  Color: Black│ │  Color: Black│ │  Color: White│            │
│  │  Stock: 50   │ │  Stock: 30   │ │  Stock: 25   │            │
│  │  Price: null │ │  Price: null │ │  Price: null │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  Price resolution: variant.price ?? product.basePrice           │
│  Stock: variant.stock - variant.reservedStock                    │
│  SKU: variant.sku (unique across all products)                   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.8 Variant Status

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Active** | `isActive = true` | Variant available for purchase |
| **Inactive** | `isActive = false` | Variant hidden, not purchasable |
| **Inherit** | Variant inherits product status | No orphaned variants |
| **Independent stock** | Each variant has own stock | Per-SKU inventory |
| **Independent price** | Each variant can have own price | Flexible pricing |

### 5.9 Variant Visibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Product draft** | All variants hidden | No premature visibility |
| **Product published** | Active variants visible | Clean storefront |
| **Variant inactive** | Hidden even if product published | Granular control |
| **Out of stock** | Visible but marked "Out of Stock" | Back-in-stock interest |
| **Filter display** | Only show available variants in filters | Clean filtering |

### 5.10 Variant Validation

| Field | Required | Validation | Error Code |
|-------|----------|------------|------------|
| `sku` | Yes | Unique, 1-50 chars, alphanumeric + hyphens | `VARIANT_SKU_INVALID` |
| `size` | Yes | 1-50 chars, from allowed sizes | `VARIANT_SIZE_REQUIRED` |
| `color` | Yes | 1-100 chars | `VARIANT_COLOR_REQUIRED` |
| `colorHex` | Yes | Valid hex color `#RRGGBB` | `VARIANT_COLOR_HEX_INVALID` |
| `price` | No | Positive decimal if provided | `VARIANT_PRICE_INVALID` |
| `stock` | Yes | Non-negative integer | `VARIANT_STOCK_INVALID` |
| `isActive` | No | Boolean, defaults to true | `VARIANT_ACTIVE_INVALID` |

### 5.11 Common Variant Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No variants | Cannot purchase | Require at least 1 variant |
| Duplicate SKUs | Inventory corruption | Enforce unique constraint |
| No color hex | Broken color swatches | Always provide hex code |
| Stock on product | Wrong inventory model | Stock on variant |
| Price on product only | Cannot override per variant | Allow variant price override |
| Inactive variant in cart | Confusing checkout | Warn customer at checkout |

---

## 6. Inventory Integration

### 6.1 What

The integration rules for stock management, availability, reserved stock, low stock alerts, out of stock handling, and future inventory module readiness.

### 6.2 Why

- **Revenue:** Accurate stock prevents overselling
- **Customer trust:** Real-time availability builds confidence
- **Operations:** Stock alerts enable timely restocking
- **Analytics:** Stock data informs purchasing decisions

### 6.3 Where

Product detail page, cart, checkout, order processing, admin inventory dashboard, search filters, email notifications.

---

### 6.4 Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Location** | `ProductVariant.stock` column | Per-SKU tracking |
| **Type** | Non-negative integer | Cannot have negative stock |
| **Default** | 0 on variant creation | Safe default |
| **Update** | Decrement on order, increment on restock | Real-time tracking |
| **Validation** | Cannot go below 0 | Business rule |

### 6.5 Availability

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Formula** | `availableStock = stock - reservedStock` | Real-time availability |
| **In stock** | `availableStock > 0` | Purchasable |
| **Out of stock** | `availableStock <= 0` | Not purchasable |
| **Display** | "In Stock", "Out of Stock", "Only X left" | Customer communication |
| **Low stock threshold** | Configurable, default 10 | Alert trigger |

### 6.6 Reserved Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Stock reserved during checkout | Prevent overselling |
| **Increment** | When customer proceeds to checkout | Temporary reservation |
| **Decrement** | When order placed or checkout abandoned | Release reservation |
| **Timeout** | 15 minutes for abandoned checkouts | Prevent permanent reservation |
| **Concurrency** | Database-level atomic decrement | Race condition prevention |

#### 6.6.1 Reserved Stock Flow

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

### 6.7 Low Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Threshold** | Configurable per variant, default 10 | Flexible alerting |
| **Admin notification** | Email when stock falls below threshold | Timely restocking |
| **Product page** | "Only X left in stock" when below threshold | Urgency signal |
| **Cart warning** | Warn if adding more than available stock | Customer communication |
| **Search filter** | "In Stock" filter excludes out-of-stock | Clean browsing |

### 6.8 Out of Stock

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Detection** | `availableStock <= 0` | Automatic |
| **Product page** | "Out of Stock" badge, disable "Add to Cart" | Clear communication |
| **Variant selector** | Out-of-stock variant shown but disabled | Visual feedback |
| **Cart handling** | Existing cart items show warning | Checkout awareness |
| **Search behavior** | Include in results but mark clearly | Back-in-stock interest |
| **Restock notification** | Optional "Notify When Available" signup | Customer retention |
| **Back in stock** | Auto-email customers who signed up | Revenue recovery |

### 6.9 Future Inventory Module

| Feature | Description | Migration Path |
|---------|-------------|----------------|
| **Multi-warehouse** | Stock per location | Add `warehouseId` to inventory |
| **Stock transfers** | Move stock between warehouses | New `StockTransfer` table |
| **Purchase orders** | Track incoming stock | New `PurchaseOrder` table |
| **Stock adjustments** | Manual stock corrections | New `StockAdjustment` table |
| **Inventory forecasting** | Predict stock needs | New analytics module |
| **Batch tracking** | Track stock by batch/lot | Add `batchId` to inventory |
| **Expiry tracking** | Track expiration dates | Add `expiresAt` to inventory |

### 6.10 Common Inventory Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Stock on product level | Cannot track per-SKU | Stock on variant |
| No reserved stock | Overselling during checkout | Reserve during checkout |
| No low stock alerts | Missed restocking | Email alerts |
| Negative stock | Impossible inventory | Enforce non-negative |
| No out-of-stock handling | Broken purchase flow | Disable add-to-cart |
| Hard delete variant | Lost inventory history | Soft delete only |

---

## 7. Product Relationships

### 7.1 What

The architecture for categories, collections, labels, tags, related products, cross-sell, up-sell, and recommendation systems.

### 7.2 Why

- **Discovery:** Multiple paths to find products
- **Merchandising:** Business teams promote products effectively
- **Revenue:** Cross-sell and up-sell increase average order value
- **SEO:** Structured relationships improve crawlability
- **Personalization:** Recommendations drive engagement

### 7.3 Where

Navigation, category pages, collection pages, product detail page, cart, checkout, homepage, search results, email campaigns.

---

### 7.4 Categories

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Relationship** | Many products → one category (mandatory) | Structural home |
| **Hierarchy** | 2-3 levels, max 5 | Navigation simplicity |
| **Primary** | Exactly one primary category per product | No ambiguity |
| **Inheritance** | Child categories inherit parent attributes | Consistency |
| **SEO** | Category pages rank for category keywords | Search traffic |

**See:** `CATALOG_ARCHITECTURE.md` Section 3 for complete category system.

### 7.5 Collections

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Relationship** | Many products ↔ many collections (optional) | Flexible merchandising |
| **Types** | Manual, Dynamic, Smart | Different curation styles |
| **Featured** | Max 6 featured collections | Curated feel |
| **Seasonal** | Time-limited with auto-archive | Urgency |
| **Ordering** | Admin sets product order within collection | Curated display |

**See:** `CATALOG_ARCHITECTURE.md` Section 4 for complete collection system.

### 7.6 Labels

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Visual badges on product cards | Quick identification |
| **Types** | "New", "Sale", "Limited", "Bestseller" | Common labels |
| **Assignment** | Admin assigns labels per product | Manual control |
| **Display** | Badge on product card, color-coded | Visual signal |
| **Max labels** | 3 per product | Prevent clutter |

### 7.7 Tags

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Flexible product labeling | Dynamic filtering |
| **Format** | Array of strings on Product | Simple structure |
| **Max tags** | 10 per product | Prevent pollution |
| **Max length** | 50 characters per tag | Clean data |
| **Usage** | Filter system, search, recommendations | Discovery |
| **Examples** | "cotton", "oversized", "premium", "sustainable" | Product attributes |

### 7.8 Related Products

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Products related to current product | Discovery |
| **Display** | "Related Products" section on product detail | Cross-browsing |
| **Algorithm** | Same category + similar price range | Relevance |
| **Count** | Show 4-8 related products | Curated feel |
| **Admin control** | Admin can override algorithm picks | Manual curation |
| **Refresh** | Recalculate weekly or on product change | Freshness |

### 7.9 Cross-Sell

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Complementary products | Increase AOV |
| **Display** | "Complete the Look", "Pairs Well With" | Contextual |
| **Trigger** | Product detail page, cart, checkout | Multiple touchpoints |
| **Algorithm** | Same category, different subcategory | Complementary |
| **Admin control** | Admin can manually assign cross-sell products | Curation |
| **Count** | 3-5 cross-sell products | Not overwhelming |

### 7.10 Up-Sell

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Higher-priced alternatives | Increase AOV |
| **Display** | "You Might Prefer" sidebar | Non-intrusive |
| **Trigger** | Product detail page | Comparison shopping |
| **Algorithm** | Same category, higher price, better reviews | Quality signal |
| **Admin control** | Admin can manually assign up-sell products | Curation |
| **Count** | 2-3 up-sell products | Not overwhelming |

### 7.11 Recommendations

| Type | Trigger | Algorithm | Display Location |
|------|---------|-----------|-----------------|
| **Related** | Product detail page | Same category + similar attributes | Below product description |
| **Similar** | Product detail page | Same brand + price range + tags | "You May Also Like" |
| **Cross-sell** | Cart / checkout | Complementary products | Cart drawer, checkout |
| **Upsell** | Product detail | Higher-priced alternatives | Product detail sidebar |
| **Recently viewed** | Browsing history | User's recent views | Homepage, product page |
| **Recently added** | Admin action | Newest published products | Homepage, shop |
| **Best sellers** | Sales data | Highest `totalSold` | Homepage, category pages |
| **Trending** | Sales velocity | High recent sales | "Trending Now" section |

### 7.12 Common Relationship Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No related products | Missed discovery | Auto-generate related |
| Too many tags (>10) | Tag pollution | Limit to 10 relevant tags |
| No cross-sell | Missed AOV increase | Auto-generate cross-sell |
| Overlapping recommendations | Confusing display | Deduplicate recommendations |
| No admin override | Can't curate | Allow manual overrides |

---

## 8. Validation Architecture

### 8.1 What

The complete validation system for required fields, optional fields, product completeness, media validation, duplicate prevention, and publishing validation.

### 8.2 Why

- **Data quality:** Valid data prevents broken displays
- **Security:** Input validation prevents injection attacks
- **UX:** Clear error messages guide correction
- **Performance:** Catch errors early, before database writes
- **Consistency:** Same validation frontend and backend

### 8.3 Where

Product creation form, product edit form, API handlers, publish workflow, bulk operations.

---

### 8.4 Required Fields

| Field | Draft | Publish | Error Code |
|-------|-------|---------|------------|
| `name` | Required | Required | `VALIDATION_NAME_REQUIRED` |
| `categoryId` | Required | Required | `VALIDATION_CATEGORY_REQUIRED` |
| `basePrice` | Required | Required | `VALIDATION_PRICE_REQUIRED` |
| `slug` | Auto-generated | Required | `VALIDATION_SLUG_REQUIRED` |
| `description` | Optional | Required (min 10 chars) | `VALIDATION_DESCRIPTION_REQUIRED` |
| `images` | Optional | Required (min 1) | `VALIDATION_IMAGE_REQUIRED` |
| `variants` | Optional | Required (min 1 active) | `VALIDATION_VARIANT_REQUIRED` |
| `alt text` | Optional | Required per image | `VALIDATION_ALT_TEXT_REQUIRED` |

### 8.5 Optional Fields

| Field | Validation | Error Code |
|-------|------------|------------|
| `brandId` | Valid UUID if provided | `VALIDATION_BRAND_INVALID` |
| `gender` | Enum value | `VALIDATION_GENDER_INVALID` |
| `tags` | Array of strings, max 10, max 50 chars each | `VALIDATION_TAGS_INVALID` |
| `meta` | Valid JSONB | `VALIDATION_META_INVALID` |
| `isFeatured` | Boolean | `VALIDATION_FEATURED_INVALID` |
| `isNew` | Boolean | `VALIDATION_NEW_INVALID` |
| `metaTitle` | Max 300 chars | `VALIDATION_META_TITLE_INVALID` |
| `metaDescription` | Max 500 chars | `VALIDATION_META_DESCRIPTION_INVALID` |

### 8.6 Product Completeness

| Completeness Score | Fields Completed | Admin Action |
|-------------------|------------------|--------------|
| **0-25%** | Name, category, price | Initial draft |
| **25-50%** | + Description, brand, gender | Draft in progress |
| **50-75%** | + Images, basic variant | Almost ready |
| **75-100%** | + Full variants, SEO, tags | Ready to publish |

#### 8.6.1 Completeness Calculation

```typescript
function calculateCompleteness(product: Product): number {
  const fields = [
    { weight: 15, check: !!product.name },
    { weight: 10, check: !!product.categoryId },
    { weight: 10, check: !!product.basePrice },
    { weight: 15, check: !!product.description && product.description.length >= 10 },
    { weight: 15, check: product.images.length >= 1 },
    { weight: 15, check: product.variants.length >= 1 },
    { weight: 5, check: !!product.brandId },
    { weight: 5, check: product.tags.length > 0 },
    { weight: 5, check: !!product.metaTitle },
    { weight: 5, check: !!product.metaDescription },
  ];

  const completed = fields.filter(f => f.check).reduce((sum, f) => sum + f.weight, 0);
  return Math.round(completed);
}
```

### 8.7 Media Validation

| Check | Standard | Error Code |
|-------|----------|------------|
| **File type** | JPEG, PNG, WebP, GIF only | `MEDIA_TYPE_INVALID` |
| **File size** | Max 10MB per image | `MEDIA_SIZE_TOO_LARGE` |
| **Dimensions** | Min 400x400px, max 4000x4000px | `MEDIA_DIMENSIONS_INVALID` |
| **Aspect ratio** | 3:4 recommended for fashion | `MEDIA_ASPECT_RATIO_WARNING` |
| **Alt text** | Required for publish | `MEDIA_ALT_TEXT_REQUIRED` |
| **Duplicate** | Check checksum for duplicates | `MEDIA_DUPLICATE_DETECTED` |
| **MIME type** | Validate Content-Type + magic bytes | `MEDIA_MIME_INVALID` |

### 8.8 Duplicate Prevention

| Check | Method | Action |
|-------|--------|--------|
| **Slug uniqueness** | Database unique constraint | Reject with error |
| **SKU uniqueness** | Database unique constraint | Reject with error |
| **Image duplicate** | Checksum comparison | Return existing, skip upload |
| **Product name** | Allow duplicates (slugs differ) | No prevention needed |

### 8.9 Publishing Validation

| Check | Standard | Error Code |
|-------|----------|------------|
| **All required fields** | Name, category, price, description | `PUBLISH_FIELDS_INCOMPLETE` |
| **At least 1 image** | Image uploaded and processed | `PUBLISH_IMAGE_REQUIRED` |
| **At least 1 variant** | Active variant with stock | `PUBLISH_VARIANT_REQUIRED` |
| **Valid slug** | Unique, valid format | `PUBLISH_SLUG_INVALID` |
| **Category active** | Linked category is active | `PUBLISH_CATEGORY_INACTIVE` |
| **Stock available** | At least 1 variant in stock | `PUBLISH_NO_STOCK` |

### 8.10 Validation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Shared schemas** | Same Zod schema frontend and backend | No duplication |
| **Server-side always** | Every endpoint validates | Security |
| **Client-side for UX** | Forms validate before submission | Better UX |
| **Field-level errors** | Every error maps to a field | Clear correction |
| **Progressive validation** | Draft minimal, publish full | Flexible workflow |
| **No `z.any()`** | Every field typed | Type safety |

### 8.11 Common Validation Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Client-only validation | Security bypass | Always validate server-side |
| No field-level errors | Confusing UX | Map errors to fields |
| Same validation for draft and publish | Inflexible workflow | Progressive validation |
| No duplicate slug check | Broken URLs | Enforce unique constraint |
| No image validation | Broken displays | Validate type, size, dimensions |

---

## 9. Search Readiness

### 9.1 What

The standards for search indexing, filter data, sort data, SEO data, and recommendation data that ensure every product is discoverable.

### 9.2 Why

- **Revenue:** Better search = more conversions
- **SEO:** Structured data improves organic traffic
- **Discovery:** Filters help customers find specific products
- **Performance:** Pre-computed data enables fast queries

### 9.3 Where

Search bar, autocomplete, search results, category pages, collection pages, filters, structured data, sitemap.

---

### 9.4 Search Indexing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Engine** | PostgreSQL full-text search (pg_trgm) initially, Meilisearch at scale | Progressive |
| **Fields indexed** | name (weight 0.7), description (weight 0.3), tags (weight 0.5) | Relevance |
| **Index trigger** | On product publish, on product update | Freshness |
| **De-index trigger** | On product unpublish, on product archive | Clean results |
| **Fuzzy matching** | Handle typos and variations | User-friendly |
| **Autocomplete** | Show suggestions after 2+ characters | Speed |

#### 9.4.1 Search Index Schema

```typescript
interface ProductSearchDocument {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  tags: string[];
  categoryId: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  gender: string;
  basePrice: number;
  salePrice?: number;
  averageRating: number;
  reviewCount: number;
  totalSold: number;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  inStock: boolean;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 9.5 Filter Data

| Filter | Type | Source | Indexed |
|--------|------|--------|---------|
| **Category** | Multi-select | Category hierarchy | Yes |
| **Price range** | Range | Product basePrice | Yes |
| **Size** | Multi-select | ProductVariant.size | Yes |
| **Color** | Visual swatches | ProductVariant.colorHex | Yes |
| **Brand** | Multi-select | Product.brandId | Yes |
| **Gender** | Single-select | Product.gender | Yes |
| **Availability** | Toggle | ProductVariant.stock | Yes |
| **Rating** | Minimum stars | Product.averageRating | Yes |
| **Tags** | Multi-select | Product.tags | Yes |
| **New** | Toggle | Product.isNew | Yes |
| **Featured** | Toggle | Product.isFeatured | Yes |

### 9.6 Sort Data

| Sort Option | Value | Database Column | Indexed |
|------------|-------|-----------------|---------|
| **Featured** | `featured` | `sortOrder` | Yes |
| **Newest** | `new` | `createdAt` | Yes |
| **Price: Low to High** | `price_asc` | `basePrice` | Yes |
| **Price: High to Low** | `price_desc` | `basePrice` | Yes |
| **Popularity** | `popular` | `totalSold` | Yes |
| **Rating** | `rating` | `averageRating` | Yes |
| **Name: A-Z** | `name_asc` | `name` | Yes |

### 9.7 SEO Data

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Structured data** | JSON-LD Product schema on every product page | Rich snippets |
| **Sitemap** | Auto-included for all published products | Crawlability |
| **Canonical URL** | Auto-generated from slug | Duplicate prevention |
| **Open Graph** | Product name, image, price, description | Social sharing |
| **Meta tags** | Title, description per product | Search ranking |
| **Breadcrumbs** | Home > Category > Product | Navigation, SEO |

### 9.8 Recommendation Data

| Data Point | Source | Usage |
|-----------|--------|-------|
| **View count** | Product page views | Popularity signal |
| **Purchase count** | Order items | Sales velocity |
| **Cart add count** | Cart events | Interest signal |
| **Wishlist count** | Wishlist events | Aspiration signal |
| **Rating average** | Reviews | Quality signal |
| **Review count** | Reviews | Social proof |

### 9.9 Common Search Readiness Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No search indexing | Products not discoverable | Index all published products |
| No filter data | Cannot narrow results | Pre-compute filter counts |
| No structured data | Missed rich snippets | Auto-generate JSON-LD |
| No sitemap entries | Poor crawlability | Auto-include in sitemap |
| No recommendation data | No personalization | Track engagement signals |

---

## 10. Permission Architecture

### 10.1 What

The permission standards for shop owner access, admin access, edit permissions, publish permissions, media permissions, and inventory permissions.

### 10.2 Why

- **Security:** Users can only access what they're allowed to
- **Compliance:** Meets enterprise access control requirements
- **Auditability:** All access attempts are logged
- **Scalability:** New roles added without restructuring

### 10.3 Where

All product management endpoints, admin panel, API handlers.

---

### 10.4 Shop Owner Access

| Capability | Allowed | Endpoint |
|------------|---------|----------|
| View own products | Yes | `GET /api/admin/products` |
| Create product | Yes | `POST /api/admin/products` |
| Edit own products | Yes | `PATCH /api/admin/products/:id` |
| Publish own products | Yes | `POST /api/admin/products/:id/publish` |
| Unpublish own products | Yes | `POST /api/admin/products/:id/unpublish` |
| Upload media | Yes | `POST /api/upload` |
| Delete own products | Yes (draft only) | `DELETE /api/admin/products/:id` |
| View other sellers' products | No | - |
| Edit other sellers' products | No | - |
| Manage categories | No | - |
| Manage collections | No | - |

### 10.5 Admin Access

| Capability | Allowed | Endpoint |
|------------|---------|----------|
| View all products | Yes | `GET /api/admin/products` |
| Create product | Yes | `POST /api/admin/products` |
| Edit any product | Yes | `PATCH /api/admin/products/:id` |
| Publish any product | Yes | `POST /api/admin/products/:id/publish` |
| Unpublish any product | Yes | `POST /api/admin/products/:id/unpublish` |
| Archive any product | Yes | `POST /api/admin/products/:id/archive` |
| Restore any product | Yes | `POST /api/admin/products/:id/restore` |
| Permanently delete | Yes (draft only) | `DELETE /api/admin/products/:id` |
| Bulk operations | Yes | `POST /api/admin/products/bulk` |
| Manage categories | Yes | `POST /api/admin/categories` |
| Manage collections | Yes | `POST /api/admin/collections` |
| Manage media | Yes | `POST /api/upload` |

### 10.6 Edit Permissions

| Permission | Shop Owner | Admin |
|------------|-----------|-------|
| Edit own products | Yes | Yes |
| Edit other sellers' products | No | Yes |
| Edit product name | Yes (own) | Yes |
| Edit product price | Yes (own) | Yes |
| Edit product category | Yes (own) | Yes |
| Edit product description | Yes (own) | Yes |
| Edit product images | Yes (own) | Yes |
| Edit product variants | Yes (own) | Yes |
| Edit product SEO | Yes (own) | Yes |
| Edit product tags | Yes (own) | Yes |

### 10.7 Publish Permissions

| Permission | Shop Owner | Admin |
|------------|-----------|-------|
| Publish own products | Yes | Yes |
| Publish other sellers' products | No | Yes |
| Unpublish own products | Yes | Yes |
| Unpublish other sellers' products | No | Yes |
| Schedule publishing | Yes | Yes |
| Bulk publish | Yes (own) | Yes |

### 10.8 Media Permissions

| Permission | Shop Owner | Admin |
|------------|-----------|-------|
| Upload product images | Yes (own products) | Yes |
| Delete product images | Yes (own products) | Yes |
| Reorder product images | Yes (own products) | Yes |
| Set featured image | Yes (own products) | Yes |
| Upload CMS media | No | Yes |
| Delete CMS media | No | Yes |

### 10.9 Inventory Permissions

| Permission | Shop Owner | Admin |
|------------|-----------|-------|
| View own inventory | Yes | Yes |
| Update own stock | Yes | Yes |
| View other sellers' inventory | No | Yes |
| Bulk stock update | Yes (own) | Yes |
| Stock adjustment | No | Yes |
| Inventory reports | Yes (own) | Yes |

### 10.10 Permission Enforcement

| Layer | Implementation | Rationale |
|-------|----------------|-----------|
| **API middleware** | `authenticate()` + `authorize()` on every endpoint | Security |
| **Route guards** | `AdminRoute` component on admin pages | Frontend protection |
| **Resource ownership** | Check `product.sellerId === user.id` | Data isolation |
| **Audit logging** | Log all permission checks | Accountability |
| **Error responses** | 403 Forbidden for unauthorized access | Clear feedback |

### 10.11 Common Permission Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No ownership check | Sellers see each other's products | Check sellerId |
| Client-only permission checks | Security bypass | Always enforce server-side |
| No audit logging | No accountability | Log all permission checks |
| Overly broad permissions | Security risk | Least privilege |
| No resource isolation | Data leakage | Ownership-based queries |

---

## 11. Performance Standards

### 11.1 What

Performance standards for large catalogs, bulk operations, lazy processing, background jobs, and media optimization.

### 11.2 Why

- **User experience:** Fast page loads, responsive interactions
- **SEO:** Core Web Vitals affect rankings
- **Scalability:** Performance degrades gracefully at scale
- **Cost:** Efficient operations reduce infrastructure costs

### 11.3 Where

Product listing pages, product detail pages, search results, admin dashboard, API responses, media delivery.

---

### 11.4 Large Catalogs

| Scale | Strategy | Rationale |
|-------|----------|-----------|
| **< 1,000 products** | Simple queries, basic indexes | Fast to build |
| **1,000-10,000 products** | Composite indexes, caching | Performance tuning |
| **10,000-100,000 products** | Read replicas, materialized views | Read scaling |
| **100,000+ products** | Search service (Meilisearch), CDN | Full-text search |

#### 11.4.1 Query Performance Targets

| Query Type | Target | Strategy |
|-----------|--------|----------|
| **Product list** | < 200ms | Composite indexes, pagination |
| **Product detail** | < 100ms | Primary key lookup, cache |
| **Search results** | < 300ms | Full-text search index |
| **Filter counts** | < 500ms | Pre-computed, cached |
| **Autocomplete** | < 100ms | Search index, debounced |
| **Admin product list** | < 300ms | Paginated, indexed |

### 11.5 Bulk Operations

| Operation | Batch Size | Strategy | Timeout |
|-----------|-----------|----------|---------|
| **Bulk publish** | 50 products | Background job | 5 minutes |
| **Bulk unpublish** | 50 products | Background job | 5 minutes |
| **Bulk archive** | 50 products | Background job | 5 minutes |
| **Bulk delete** | 20 products | Background job | 3 minutes |
| **Bulk price update** | 100 products | Background job | 5 minutes |
| **Search reindex** | 500 products | Background job | 10 minutes |

### 11.6 Lazy Processing

| Operation | Trigger | Strategy | Rationale |
|-----------|---------|----------|-----------|
| **Image optimization** | On upload | Async processing | Don't block upload |
| **Search indexing** | On publish/update | Async processing | Don't block save |
| **Cache warming** | On publish/update | Background job | Don't block save |
| **Thumbnail generation** | On upload | Async processing | Don't block upload |
| **Video transcoding** | On upload | Background job | Long-running process |
| **Recommendation recalculation** | Daily cron | Background job | Batch processing |

### 11.7 Background Jobs

| Job | Frequency | Strategy | Rationale |
|-----|-----------|----------|-----------|
| **Scheduled publishing** | Every minute | Cron job | Reliable triggering |
| **Reserved stock cleanup** | Every 5 minutes | Cron job | Release abandoned checkouts |
| **Draft expiration** | Daily | Cron job | Clean admin panel |
| **Search reindex** | On change + daily full | Event + cron | Fresh results |
| **Cache invalidation** | On change | Event-driven | Fresh cache |
| **Low stock alerts** | Every hour | Cron job | Timely notifications |
| **Image optimization** | On upload | Async queue | Don't block request |

### 11.8 Media Optimization

| Strategy | Implementation | Benefit |
|----------|----------------|---------|
| **Auto-format** | Cloudinary `f_auto` | 25-50% smaller files |
| **Auto-quality** | Cloudinary `q_auto` | 15-30% smaller files |
| **Responsive variants** | srcSet with 4 sizes | Right size per device |
| **Lazy loading** | `loading="lazy"` | Faster initial load |
| **Blur placeholder** | Base64 tiny image | Perceived performance |
| **CDN caching** | Edge caching | Global performance |
| **Image compression** | Strip EXIF, optimize | Bandwidth savings |

### 11.9 Caching Strategy

| Data | Cache Layer | TTL | Invalidation |
|------|-------------|-----|--------------|
| **Product detail** | KV (edge) | 5 minutes | On product update |
| **Product list** | KV (edge) | 2 minutes | On product publish/unpublish |
| **Filter counts** | KV (edge) | 5 minutes | On product change |
| **Search results** | Search index | Real-time | On index update |
| **Category tree** | KV (edge) | 1 hour | On category change |
| **Collection products** | KV (edge) | 5 minutes | On collection change |

### 11.10 Common Performance Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No pagination | Loading all products | Paginate at 24 per page |
| No caching | Repeated database queries | Cache at edge |
| No lazy loading | Slow initial page load | Lazy load below-fold |
| No search index | Slow text search | Full-text search index |
| No background jobs | Blocking requests | Async processing |
| No image optimization | Bandwidth waste | Auto-optimize on upload |

---

## 12. Security Architecture

### 12.1 What

Security standards for product validation, upload protection, permission enforcement, and audit logging.

### 12.2 Why

- **Data integrity:** Prevent malicious data injection
- **Privacy:** Protect user and product data
- **Compliance:** Meet enterprise security requirements
- **Trust:** Users trust platform with their data

### 12.3 Where

All product management endpoints, file uploads, admin operations, API handlers.

---

### 12.4 Validation Security

| Check | Implementation | Rationale |
|-------|----------------|-----------|
| **Input sanitization** | Strip HTML, scripts, event handlers | XSS prevention |
| **SQL injection** | Prisma parameterized queries | SQL injection prevention |
| **CSRF protection** | CSRF token on all mutations | CSRF prevention |
| **Rate limiting** | Per-endpoint rate limits | Abuse prevention |
| **Size limits** | Max file size, max field length | DoS prevention |
| **Type validation** | Zod schema validation | Type safety |

### 12.5 Upload Protection

| Check | Implementation | Rationale |
|-------|----------------|-----------|
| **File type validation** | MIME type + magic bytes | Malicious file prevention |
| **File size limits** | Per-type limits | Storage abuse prevention |
| **Filename sanitization** | UUID-based, no user input | Path traversal prevention |
| **Virus scanning** | Content signature check (future) | Malware prevention |
| **EXIF stripping** | Remove metadata from images | Privacy, smaller files |
| **Access control** | Private for drafts, public for published | Data isolation |

### 12.6 Permission Enforcement

| Layer | Implementation | Rationale |
|-------|----------------|-----------|
| **Authentication** | `authenticate()` middleware | Identity verification |
| **Authorization** | `authorize()` middleware | Role verification |
| **Ownership** | `product.sellerId === user.id` check | Data isolation |
| **Audit** | Log all permission checks | Accountability |
| **Error responses** | 401/403 for unauthorized | Clear feedback |

### 12.7 Audit Logging

| Event | Data Logged | Rationale |
|-------|-------------|-----------|
| **Product created** | Admin ID, product data, timestamp | Accountability |
| **Product updated** | Admin ID, field changes, timestamp | Change tracking |
| **Product published** | Admin ID, timestamp | Publish tracking |
| **Product unpublished** | Admin ID, reason, timestamp | Unpublish tracking |
| **Product archived** | Admin ID, reason, timestamp | Archive tracking |
| **Product deleted** | Admin ID, reason, timestamp | Delete tracking |
| **Bulk operation** | Admin ID, operation, count, timestamp | Bulk tracking |
| **Permission denied** | User ID, endpoint, timestamp | Security tracking |

#### 12.7.1 Audit Log Schema

```typescript
interface ProductAuditEvent {
  type: 'PRODUCT_CREATED' | 'PRODUCT_UPDATED' | 'PRODUCT_PUBLISHED' | 'PRODUCT_UNPUBLISHED' | 'PRODUCT_ARCHIVED' | 'PRODUCT_RESTORED' | 'PRODUCT_DELETED' | 'PRODUCT_BULK_OPERATION';
  userId: string;
  ip: string;
  userAgent: string;
  resource: 'Product';
  resourceId: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}
```

### 12.8 Common Security Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No input sanitization | XSS vulnerability | Strip HTML/scripts |
| No CSRF protection | CSRF attacks | CSRF tokens |
| No rate limiting | Abuse | Per-endpoint limits |
| No audit logging | No accountability | Log all actions |
| No ownership check | Data leakage | Ownership-based queries |
| Storing files without validation | Malware risk | Validate on upload |

---

## 13. Accessibility Standards

### 13.1 What

Accessibility standards for image accessibility, keyboard support, screen readers, and responsive editing.

### 13.2 Why

- **Inclusivity:** All users can access product information
- **Compliance:** WCAG 2.2 AA requirements
- **SEO:** Accessible content is better indexed
- **Legal:** Meet accessibility regulations

### 13.3 Where

Product detail page, product cards, search results, admin panel, forms, media.

---

### 13.4 Image Accessibility

| Requirement | Implementation | Rationale |
|------------|----------------|-----------|
| **Alt text** | Required on all product images | Screen reader access |
| **Descriptive** | Describe image content, not "image of" | Meaningful description |
| **Max length** | 125 characters | Screen reader best practice |
| **Decorative** | Use empty alt for decorative images | Skip non-informative images |
| **Complex images** | Long description via `aria-describedby` | Detailed description |

### 13.5 Keyboard Support

| Requirement | Implementation | Rationale |
|------------|----------------|-----------|
| **Tab navigation** | All interactive elements focusable | Keyboard access |
| **Focus visible** | Clear focus indicators | Visual feedback |
| **Enter/Space** | Activate buttons and links | Standard behavior |
| **Arrow keys** | Navigate image gallery, filters | Natural interaction |
| **Escape** | Close modals, dropdowns | Expected behavior |
| **Skip links** | "Skip to content" link | Navigation efficiency |

### 13.6 Screen Readers

| Requirement | Implementation | Rationale |
|------------|----------------|-----------|
| **Semantic HTML** | `<article>`, `<nav>`, `<button>` | Structure |
| **ARIA labels** | `aria-label` on interactive elements | Description |
| **ARIA live** | `aria-live="polite"` on dynamic updates | Announcements |
| **ARIA expanded** | On expandable sections | State communication |
| **ARIA selected** | On variant selector | Selection state |
| **Role attributes** | `role="tablist"`, `role="tab"` where needed | Pattern communication |

### 13.7 Responsive Editing

| Requirement | Implementation | Rationale |
|------------|----------------|-----------|
| **Mobile-first forms** | Large touch targets, clear labels | Mobile accessibility |
| **Touch targets** | Minimum 44x44px | Accessibility |
| **Text size** | Minimum 16px on mobile | Readability |
| **Color contrast** | 4.5:1 minimum ratio | WCAG AA |
| **Form labels** | Visible labels, not just placeholders | Accessibility |
| **Error messages** | Clear, specific, field-associated | Usability |

### 13.8 Common Accessibility Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No alt text | Screen readers can't describe images | Always set alt text |
| No keyboard navigation | Keyboard users can't interact | Full keyboard support |
| No focus indicators | Users can't see where they are | Clear focus styles |
| Low contrast | Hard to read for low vision | 4.5:1 minimum ratio |
| No ARIA labels | Screen readers lack context | Add ARIA attributes |
| Small touch targets | Hard to tap on mobile | Minimum 44x44px |

---

## 14. Future Readiness

### 14.1 What

Architecture for AI product assistant, product templates, product versioning, marketplace expansion, bundles, digital products, subscription products, multi-language, and multi-currency.

### 14.2 Why

- **Scalability:** Platform grows without rewrites
- **Flexibility:** New features extend existing architecture
- **Investment protection:** Current work supports future needs
- **Competitive advantage:** Platform adapts to market needs

### 14.3 Where

Product Engine architecture, database schema, API design, frontend components.

---

### 14.4 AI Product Assistant

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Auto-generate descriptions** | AI writes product descriptions | LLM integration |
| **Auto-generate alt text** | AI describes product images | Vision model |
| **Auto-generate SEO** | AI creates meta titles/descriptions | LLM integration |
| **Auto-categorize** | AI suggests product category | Classification model |
| **Price suggestion** | AI suggests optimal pricing | Market data analysis |
| **Content enhancement** | AI improves existing content | LLM integration |

#### 14.4.1 AI Assistant Integration Points

| Integration Point | Trigger | Output |
|------------------|---------|--------|
| **Description generation** | Admin clicks "Generate Description" | Draft description |
| **Alt text generation** | Image uploaded | Suggested alt text |
| **SEO generation** | Product created | Meta title + description |
| **Category suggestion** | Product created | Suggested category |
| **Tag suggestion** | Product created | Suggested tags |
| **Bulk enhancement** | Admin selects products | Batch improvements |

### 14.5 Product Templates

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Template creation** | Save product as template | New `ProductTemplate` table |
| **Template application** | Create product from template | Pre-fill form fields |
| **Template categories** | Organize templates by type | Template grouping |
| **Template sharing** | Share templates between admins | Access control |
| **Template versioning** | Track template changes | Version history |

#### 14.5.1 Template Schema

```typescript
interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  defaultFields: Partial<Product>;
  defaultVariants: Partial<ProductVariant>[];
  defaultMeta: Partial<ProductMeta>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 14.6 Product Versioning

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Version tracking** | Track product changes | New `ProductVersion` table |
| **Version comparison** | Compare versions side-by-side | Diff view |
| **Version rollback** | Restore previous version | Version restore |
| **Version publishing** | Publish specific version | Version-based publishing |
| **Version audit** | Track who changed what | Audit trail |

#### 14.6.1 Version Schema

```typescript
interface ProductVersion {
  id: string;
  productId: string;
  version: number;
  data: Partial<Product>;
  metadata: Partial<ProductMeta>;
  createdBy: string;
  createdAt: Date;
  publishedAt?: Date;
}
```

### 14.7 Marketplace Expansion

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Multi-seller** | Multiple sellers per product | Add `sellerId` to Product |
| **Seller dashboard** | Seller-specific product management | New admin section |
| **Seller verification** | Verify seller identity | New verification flow |
| **Seller analytics** | Seller-specific reporting | New analytics module |
| **Commission system** | Platform takes commission | New commission table |
| **Seller ratings** | Rate sellers | New rating system |

### 14.8 Bundles

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Product bundles** | Group products as bundle | New `ProductBundle` table |
| **Bundle pricing** | Discounted bundle price | Price calculation logic |
| **Bundle inventory** | Track bundle stock | Aggregate variant stock |
| **Bundle images** | Bundle cover image | Media handling |
| **Bundle variants** | Bundle variant combinations | Variant matrix |

#### 14.8.1 Bundle Schema

```typescript
interface ProductBundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  bundlePrice: number;
  products: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    originalPrice: number;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 14.9 Digital Products

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Digital flag** | Mark product as digital | Add `isDigital` to Product |
| **Download URL** | Secure download link | R2 signed URLs |
| **Download limit** | Limit downloads per purchase | Download tracking |
| **License key** | Generate unique license keys | License generation |
| **Access control** | Verify purchase before download | Order verification |

### 14.10 Subscription Products

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Subscription plans** | Recurring billing | New `SubscriptionPlan` table |
| **Billing intervals** | Weekly, monthly, yearly | Interval configuration |
| **Subscription management** | Pause, cancel, upgrade | Subscription API |
| **Recurring orders** | Auto-generate orders | Order automation |
| **Subscription analytics** | MRR, churn, LTV | Analytics module |

### 14.11 Multi-Language

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Product translations** | Translate product content | New `ProductTranslation` table |
| **Language switching** | UI language toggle | i18n framework |
| **Localized SEO** | Per-language meta tags | Translation SEO |
| **Translated search** | Search in selected language | Language-aware search |
| **Fallback content** | Default to primary language | Fallback logic |

#### 14.11.1 Translation Schema

```typescript
interface ProductTranslation {
  id: string;
  productId: string;
  language: string; // ISO 639-1 code
  name: string;
  description: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 14.12 Multi-Currency

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Product prices** | Prices per currency | New `ProductPrice` table |
| **Currency conversion** | Real-time exchange rates | Currency API integration |
| **Localized pricing** | Display price in user's currency | Currency detection |
| **Price locking** | Lock price at checkout | Price snapshot |
| **Currency admin** | Admin manages currencies | Currency configuration |

#### 14.12.1 Multi-Currency Schema

```typescript
interface ProductPrice {
  id: string;
  productId: string;
  variantId?: string;
  currency: string; // ISO 4217 code
  price: number;
  salePrice?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 14.13 Future Readiness Rules

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

## 15. Mandatory Rules for AI Agents

### 15.1 Product Engine Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One lifecycle** | Every product follows the defined lifecycle | Consistency |
| **Engine independence** | Product Engine is independent from other modules | Modularity |
| **No duplicated logic** | Product Engine provides services; modules consume | Single source of truth |
| **No hardcoded workflows** | All workflows configurable via database | Flexibility |
| **Every action auditable** | All product actions logged to AuditLog | Compliance |
| **Future-compatible** | All changes support future modules | Long-term viability |
| **Scale without redesign** | Architecture supports 100 to 1M+ products | Scalability |

### 15.2 Data Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **UUID primary keys** | All product tables use UUID PKs | Distributed systems |
| **Soft delete only** | No hard deletes on product data | Data integrity |
| **Timestamps always** | Every table has `createdAt` + `updatedAt` | Audit trail |
| **Foreign keys indexed** | Every FK column has index | Performance |
| **Unique constraints** | Slugs, SKUs are unique | Data integrity |
| **DECIMAL for money** | All price fields use `DECIMAL(10,2)` | Financial accuracy |
| **JSONB for extensibility** | Use `meta` JSONB for custom fields | No schema changes |

### 15.3 API Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **REST conventions** | Follow Nabome API conventions | Consistency |
| **Validation always** | Every endpoint validates input | Security |
| **Authentication always** | Every endpoint authenticates | Security |
| **Authorization always** | Every endpoint authorizes | Security |
| **Audit logging** | Log all mutations | Compliance |
| **Error handling** | Use standard error classes | Consistency |
| **Rate limiting** | Apply rate limits to all endpoints | Abuse prevention |

### 15.4 Frontend Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Feature isolation** | Products feature doesn't import from other features | Modularity |
| **Shared UI only** | Use `shared/ui` components | Consistency |
| **Server state** | Product data via TanStack Query | Caching, sync |
| **Form state** | Product forms via React Hook Form | Form management |
| **URL state** | Filters, search in URL params | Shareable, bookmarkable |
| **Accessibility** | WCAG 2.2 AA compliance | Inclusivity |
| **Mobile-first** | Design for mobile, enhance for desktop | 70%+ mobile traffic |

### 15.5 Validation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Shared schemas** | Same Zod schema frontend and backend | No duplication |
| **Progressive validation** | Draft minimal, publish full | Flexible workflow |
| **Field-level errors** | Every error maps to a field | Clear correction |
| **Server-side always** | Every endpoint validates | Security |
| **No `z.any()`** | Every field typed | Type safety |

### 15.6 Performance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Pagination** | 24 products per page default | Performance |
| **Caching** | Cache at edge with KV | Global performance |
| **Lazy loading** | Load below-fold content on demand | Initial load speed |
| **Background jobs** | Heavy operations async | Request performance |
| **Image optimization** | Auto-optimize on upload | Bandwidth savings |
| **Search indexing** | Index published products only | Clean results |

### 15.7 Security Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Input sanitization** | Strip HTML, scripts from user input | XSS prevention |
| **CSRF protection** | CSRF token on all mutations | CSRF prevention |
| **Rate limiting** | Per-endpoint rate limits | Abuse prevention |
| **File validation** | Validate type, size, dimensions | Upload security |
| **Permission enforcement** | Server-side authorization | Security |
| **Audit logging** | Log all security events | Accountability |

---

## Appendix A: Database Schema Reference

### A.1 Product Tables

```prisma
model Product {
  id              String        @id @default(uuid())
  name            String        @db.VarChar(300)
  slug            String        @unique @db.VarChar(300)
  description     String?
  basePrice       Decimal       @db.Decimal(10, 2)
  currency        String        @default("INR") @db.VarChar(3)

  // Relationships
  categoryId      String?
  category        Category?     @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  brandId         String?
  brand           Brand?        @relation(fields: [brandId], references: [id], onDelete: SetNull)

  // Visibility & Discovery
  status          ProductStatus @default(draft)
  isFeatured      Boolean       @default(false)
  isNew           Boolean       @default(false)
  isTrending      Boolean       @default(false)
  gender          Gender        @default(unisex)
  sortOrder       Int           @default(0)

  // Scheduling
  scheduledAt     DateTime?

  // SEO
  metaTitle       String?       @db.VarChar(300)
  metaDescription String?       @db.VarChar(500)
  ogImage         String?

  // Denormalized (cached) for display
  reviewCount     Int           @default(0)
  averageRating   Decimal       @db.Decimal(3, 2) @default(0)
  totalSold       Int           @default(0)

  // Flexible data
  tags            String[]
  meta            Json?
  // Expected meta shape:
  // {
  //   richContent: RichContentBlock[],
  //   highlights: string[],
  //   careInstructions: string[],
  //   specifications: ProductSpecification[],
  //   material: string,
  //   origin: string,
  //   salePrice: number,
  //   compareAtPrice: number,
  //   attributes: Record<string, string>,
  //   additionalInfo: Record<string, string>
  // }

  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  variants        ProductVariant[]
  images          ProductImage[]
  reviews         Review[]
  collections     ProductCollection[]
  orderItems      OrderItem[]
  wishlistItems   Wishlist[]

  // Indexes
  @@index([categoryId])
  @@index([brandId])
  @@index([status])
  @@index([status, isFeatured])
  @@index([status, isNew])
  @@index([status, isTrending])
  @@index([status, gender, createdAt])
  @@index([status, categoryId, sortOrder])
  @@index([status, basePrice])
  @@index([createdAt])
  @@index([sortOrder])
}

model ProductVariant {
  id            String  @id @default(uuid())
  productId     String
  product       Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku           String  @unique @db.VarChar(50)
  size          String  @db.VarChar(50)
  color         String  @db.VarChar(100)
  colorHex      String? @db.VarChar(7)
  price         Decimal @db.Decimal(10, 2)?
  stock         Int     @default(0)
  reservedStock Int     @default(0)
  isActive      Boolean @default(true)
  sortOrder     Int     @default(0)

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  cartItems     CartItem[]
  orderItems    OrderItem[]
  wishlistItems Wishlist[]

  @@unique([productId, size, color])
  @@index([productId, isActive])
  @@index([isActive, stock])
}

model ProductImage {
  id        String  @id @default(uuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  mediaId   String
  media     Media   @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  alt       String?
  isPrimary Boolean @default(false)
  sortOrder Int     @default(0)

  @@index([productId])
  @@index([mediaId])
  @@index([productId, isPrimary])
}

model ProductCollection {
  id           String     @id @default(uuid())
  productId    String
  product      Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  sortOrder    Int        @default(0)

  createdAt    DateTime   @default(now())

  @@unique([productId, collectionId])
  @@index([productId])
  @@index([collectionId])
  @@index([collectionId, sortOrder])
}

enum ProductStatus {
  draft
  scheduled
  published
  archived
}
```

---

## Appendix B: API Endpoint Reference

### B.1 Product Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | Public | List published products |
| `GET` | `/api/products/:slug` | Public | Get product by slug |
| `GET` | `/api/products/:id/variants` | Public | Get product variants |
| `POST` | `/api/admin/products` | Admin | Create product |
| `PATCH` | `/api/admin/products/:id` | Admin | Update product |
| `DELETE` | `/api/admin/products/:id` | Admin | Delete product (draft only) |
| `POST` | `/api/admin/products/:id/publish` | Admin | Publish product |
| `POST` | `/api/admin/products/:id/unpublish` | Admin | Unpublish product |
| `POST` | `/api/admin/products/:id/archive` | Admin | Archive product |
| `POST` | `/api/admin/products/:id/restore` | Admin | Restore product |
| `POST` | `/api/admin/products/bulk` | Admin | Bulk operations |
| `GET` | `/api/admin/products` | Admin | List all products (admin) |

### B.2 Variant Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/admin/products/:id/variants` | Admin | Create variant |
| `PATCH` | `/api/admin/products/:id/variants/:variantId` | Admin | Update variant |
| `DELETE` | `/api/admin/products/:id/variants/:variantId` | Admin | Delete variant |
| `POST` | `/api/admin/products/:id/variants/bulk` | Admin | Bulk variant operations |

### B.3 Media Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/admin/products/:id/images` | Admin | Upload product image |
| `DELETE` | `/api/admin/products/:id/images/:imageId` | Admin | Delete product image |
| `PATCH` | `/api/admin/products/:id/images/reorder` | Admin | Reorder product images |
| `POST` | `/api/admin/products/:id/images/:imageId/primary` | Admin | Set featured image |

---

## Appendix C: Error Code Reference

### C.1 Product Error Codes

| Code | HTTP Status | Message |
|------|-------------|---------|
| `PRODUCT_NOT_FOUND` | 404 | Product not found |
| `PRODUCT_NAME_REQUIRED` | 400 | Product name is required |
| `PRODUCT_CATEGORY_INVALID` | 400 | Invalid or inactive category |
| `PRODUCT_PRICE_INVALID` | 400 | Invalid product price |
| `PRODUCT_SLUG_DUPLICATE` | 409 | Product slug already exists |
| `PRODUCT_BRAND_INVALID` | 400 | Invalid brand |
| `PRODUCT_GENDER_INVALID` | 400 | Invalid gender value |
| `PRODUCT_TAGS_INVALID` | 400 | Invalid tags |
| `PRODUCT_INACTIVE` | 410 | Product is no longer available |
| `PUBLISH_NAME_REQUIRED` | 400 | Name required for publishing |
| `PUBLISH_CATEGORY_REQUIRED` | 400 | Category required for publishing |
| `PUBLISH_PRICE_REQUIRED` | 400 | Price required for publishing |
| `PUBLISH_DESCRIPTION_REQUIRED` | 400 | Description required for publishing |
| `PUBLISH_IMAGE_REQUIRED` | 400 | At least one image required |
| `PUBLISH_VARIANT_REQUIRED` | 400 | At least one variant required |
| `PUBLISH_SLUG_REQUIRED` | 400 | Slug required for publishing |
| `PUBLISH_NO_STOCK` | 400 | No variants in stock |
| `VARIANT_SKU_INVALID` | 400 | Invalid or duplicate SKU |
| `VARIANT_SIZE_REQUIRED` | 400 | Variant size is required |
| `VARIANT_COLOR_REQUIRED` | 400 | Variant color is required |
| `VARIANT_STOCK_INVALID` | 400 | Invalid stock value |
| `MEDIA_TYPE_INVALID` | 400 | Invalid file type |
| `MEDIA_SIZE_TOO_LARGE` | 400 | File exceeds size limit |
| `MEDIA_DIMENSIONS_INVALID` | 400 | Invalid image dimensions |
| `MEDIA_ALT_TEXT_REQUIRED` | 400 | Alt text required for publishing |
| `MEDIA_DUPLICATE_DETECTED` | 409 | Duplicate image detected |

---

*This document is the official Product Management Engine Architecture Standard for the Nabome Commerce Operating System. Every AI agent must follow these standards when working with products.*
