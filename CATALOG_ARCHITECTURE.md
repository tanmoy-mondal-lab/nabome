# নবME (Nabome) — Product Catalog, Category & Collection Architecture Standard

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for catalog architecture
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), UX_ARCHITECTURE.md (v1.0), FOLDER_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Catalog Foundation](#1-catalog-foundation)
2. [Product Organization](#2-product-organization)
3. [Category System](#3-category-system)
4. [Collection System](#4-collection-system)
5. [Product Discovery](#5-product-discovery)
6. [Filter Architecture](#6-filter-architecture)
7. [Sorting Standards](#7-sorting-standards)
8. [Catalog Visibility](#8-catalog-visibility)
9. [SEO Architecture](#9-seo-architecture)
10. [CMS Integration](#10-cms-integration)
11. [Performance Standards](#11-performance-standards)
12. [Accessibility Standards](#12-accessibility-standards)
13. [Future Readiness](#13-future-readiness)
14. [Architectural Rules](#14-architectural-rules)

---

## 1. Catalog Foundation

### 1.1 What

The foundational philosophy, hierarchy, ownership, and scalability principles governing the entire product catalog.

### 1.2 Why

- **Unified Mental Model:** Every AI agent and developer shares the same understanding of how products, categories, and collections relate.
- **Scalability Without Redesign:** The catalog grows from 100 products to 1,000,000 without architectural changes.
- **Browsing Experience:** Customers discover products naturally with minimal cognitive load.
- **Enterprise-Grade:** The system handles complex product relationships while remaining simple to administer.

### 1.3 Where

Every product listing, category page, collection page, search result, filter interaction, and recommendation engine across the Nabome platform.

### 1.4 Catalog Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Product-centric** | Products are the atomic unit; everything else organizes around them | Core business object |
| **Hierarchy over flat** | Categories provide structure; collections provide curation | Organized discovery |
| **Inheritance over duplication** | Child categories inherit parent attributes | Consistency, reduced maintenance |
| **Manual curation first** | Human-curated collections before algorithmic | Premium brand quality |
| **Progressive disclosure** | Show essential info first, details on demand | Mobile-first browsing |
| **Zero-conflict ownership** | Every product belongs to exactly one primary category | No ambiguity |
| **Multi-collection membership** | A product can belong to unlimited collections | Flexible merchandising |

### 1.5 Catalog Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    NABOME CATALOG HIERARCHY                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    CATALOG ROOT                            │   │
│  │  The complete set of all products in the store            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              ▼                       ▼                          │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   CATEGORIES      │    │   COLLECTIONS     │                   │
│  │   (Taxonomy)      │    │   (Merchandising) │                   │
│  │                    │    │                    │                   │
│  │  Structural home   │    │  Curated groupings │                   │
│  │  for products      │    │  for products      │                   │
│  │                    │    │                    │                   │
│  │  Logical           │    │  Editorial         │                   │
│  │  Permanent         │    │  Flexible          │                   │
│  │  Hierarchical      │    │  Flat or themed    │                   │
│  └──────────────────┘    └──────────────────┘                   │
│              │                       │                          │
│              ▼                       ▼                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    PRODUCTS                                │   │
│  │  The atomic unit of the catalog                            │   │
│  │                                                            │   │
│  │  • One primary category (mandatory)                        │   │
│  │  • Zero or more collections (optional)                     │   │
│  │  • One brand (optional)                                    │   │
│  │  • Multiple variants (size, color)                         │   │
│  │  • Multiple images                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Product Organization

#### 1.6.1 Product Entity Ownership

| Field | Standard | Rationale |
|-------|----------|-----------|
| **Primary category** | Exactly one `categoryId` per product | Structural clarity |
| **Brand** | Optional `brandId` per product | Brand filtering |
| **Collections** | Many-to-many via `ProductCollection` junction | Flexible curation |
| **Tags** | Array of strings for flexible labeling | Dynamic filtering |
| **Gender** | Enum: `men`, `women`, `unisex` | Audience targeting |
| **Status** | Visibility enum for lifecycle control | Publishing workflow |

#### 1.6.2 Parent Products vs Variant Products

| Concept | Definition | Database | Example |
|---------|-----------|----------|---------|
| **Parent product** | The base product entity | `Product` table | "Premium Cotton T-Shirt" |
| **Variant product** | A specific SKU (size + color combination) | `ProductVariant` table | "Premium Cotton T-Shirt, Medium, Black" |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One parent, many variants** | Parent owns all variants | Single source of truth |
| **Variant = SKU** | Each variant has a unique SKU | Inventory tracking |
| **Price on parent** | `basePrice` on `Product`, price override on variant | Base pricing |
| **Stock on variant** | `stock` and `reservedStock` on `ProductVariant` | Per-SKU inventory |
| **Images on parent** | All images belong to parent product | Visual showcase |
| **Variant selection** | Customer selects variant on product detail page | Purchase flow |
| **Out of stock** | Variant `stock - reservedStock <= 0` | Real-time availability |

#### 1.6.3 Product Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT LIFECYCLE                              │
│                                                                  │
│  DRAFT ──────▶ SCHEDULED ──────▶ PUBLISHED ──────▶ ARCHIVED     │
│    │              │                  │                  │         │
│    │              │                  │                  │         │
│    ▼              ▼                  ▼                  ▼         │
│  Not visible   Visible at       Visible to         Not visible  │
│  anywhere      scheduled time   everyone           anywhere     │
│                                                                  │
│  Any state can return to DRAFT via admin action                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.7 Catalog Scalability

| Scale | Product Count | Strategy | Rationale |
|-------|--------------|----------|-----------|
| **Startup** | 100-1,000 | Simple queries, basic indexes | Fast to build |
| **Growth** | 1,000-10,000 | Composite indexes, caching | Performance tuning |
| **Scale** | 10,000-100,000 | Read replicas, materialized views | Read scaling |
| **Enterprise** | 100,000+ | Search service (Meilisearch/Typesense), CDN | Full-text search |

### 1.8 Future Extensibility

| Future Feature | How It Extends the Catalog | Migration Path |
|---------------|---------------------------|----------------|
| **Multi-vendor** | Add `sellerId` to Product | Add column + FK |
| **Product bundles** | Add `ProductBundle` junction table | New table |
| **Subscriptions** | Add `SubscriptionPlan` table | New table |
| **Digital products** | Add `isDigital` flag + download URL | Add column |
| **Gift cards** | New entity type | New table |
| **Multi-language** | Add `ProductTranslation` table | New table |
| **Multi-currency** | Add `ProductPrice` table per currency | New table |
| **Regional catalogs** | Add `regionId` to Product | Add column + FK |

---

## 2. Product Organization

### 2.1 What

Standards for how products are structured, grouped, displayed, and managed throughout their lifecycle.

### 2.2 Why

- **Consistency:** Every product follows the same structure.
- **Discoverability:** Products are findable through multiple paths.
- **Merchandising:** Business can promote, feature, and organize products effectively.
- **Data Integrity:** No orphaned or ambiguous product relationships.

### 2.3 Where

Product creation (admin), product listing pages, product detail pages, search results, recommendations, cart, checkout, order history.

### 2.4 Product Schema (Reference)

```prisma
model Product {
  id           String   @id @default(uuid())
  name         String   @db.VarChar(300)
  slug         String   @unique @db.VarChar(300)
  description  String?
  basePrice    Decimal  @db.Decimal(10, 2)
  currency     String   @default("INR") @db.VarChar(3)

  // Relationships
  categoryId   String?
  category     Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  brandId      String?
  brand        Brand?    @relation(fields: [brandId], references: [id], onDelete: SetNull)

  // Visibility & Discovery
  status       ProductStatus @default(draft)
  isFeatured   Boolean       @default(false)
  isNew        Boolean       @default(false)
  isTrending   Boolean       @default(false)
  gender       Gender        @default(unisex)
  sortOrder    Int           @default(0)

  // SEO
  metaTitle       String? @db.VarChar(300)
  metaDescription String? @db.VarChar(500)
  ogImage         String?

  // Denormalized (cached) for display
  reviewCount   Int      @default(0)
  averageRating Decimal  @db.Decimal(3, 2) @default(0)
  totalSold     Int      @default(0)

  // Flexible data
  tags          String[]
  meta          Json?
  // Expected meta shape: { material: string, care: string[], origin: string }

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  variants      ProductVariant[]
  images        ProductImage[]
  reviews       Review[]
  collections   ProductCollection[]

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

enum ProductStatus {
  draft
  scheduled
  published
  archived
}
```

### 2.5 Product Visibility Standards

| Status | Public Store | Admin Panel | Search Index | Cache |
|--------|-------------|-------------|--------------|-------|
| **draft** | Not visible | Visible (draft badge) | Not indexed | Not cached |
| **scheduled** | Not visible until date | Visible (scheduled badge) | Not indexed until date | Not cached |
| **published** | Visible | Visible | Indexed | Cached |
| **archived** | Not visible | Visible (archived badge) | De-indexed | Not cached |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default status** | `draft` on creation | Never auto-publish |
| **Status transitions** | Admin-controlled only | Prevent accidental publishing |
| **Scheduled publishing** | `scheduledAt` timestamp triggers status change | Time-based publishing |
| **Soft delete** | Set to `archived`, never hard delete | Referential integrity |
| **Restoration** | Set back to `draft` or `published` | Undo capability |

### 2.6 Product Grouping

| Group Type | Purpose | Ownership | Example |
|-----------|---------|-----------|---------|
| **Category** | Structural taxonomy | Permanent, logical | "Men > T-Shirts" |
| **Collection** | Curated merchandising | Flexible, editorial | "Summer Essentials" |
| **Brand** | Brand grouping | Permanent | "Nabome Originals" |
| **Tag** | Flexible labeling | Ad-hoc | "cotton", "oversized", "premium" |
| **Gender** | Audience targeting | Permanent | "Women", "Unisex" |
| **Featured** | Business promotion | Admin-controlled | Homepage hero |
| **New** | Fresh arrivals | Time-based or manual | "New This Week" |
| **Trending** | Popularity-based | Algorithm or manual | "Trending Now" |

### 2.7 Featured Products

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Products manually selected for homepage, landing pages, and promotional sections | Business decides what to promote |
| **How** | `isFeatured = true` boolean flag | Simple, fast queries |
| **Limit** | Max 20 featured products at a time | Prevent dilution |
| **Display** | Horizontal scroll on mobile, grid on desktop | Premium browsing |
| **Rotation** | Admin updates weekly/monthly | Fresh content |

### 2.8 Trending Products

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Products with high recent sales velocity | Social proof |
| **How** | `isTrending` flag + `totalSold` in last 7 days | Popularity signal |
| **Calculation** | Daily batch job or real-time aggregation | Performance |
| **Display** | Dedicated "Trending Now" section | Discovery |
| **Limit** | Max 12 trending products | Curated feel |

### 2.9 New Arrivals

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Recently published products | Freshness signal |
| **How** | `isNew = true` flag OR `createdAt` within last 14 days | Dual approach |
| **Duration** | `isNew` auto-clears after 14 days (configurable) | Prevent stale labels |
| **Display** | "New Arrivals" section on homepage + shop | Discovery |
| **Sorting** | Default sort: newest first | Freshness priority |

### 2.10 Recommended Products

| Type | Trigger | Algorithm | Display Location |
|------|---------|-----------|-----------------|
| **Related** | Product detail page | Same category + similar attributes | Below product description |
| **Similar** | Product detail page | Same brand + price range + tags | "You May Also Like" |
| **Cross-sell** | Cart / checkout | Complementary products | Cart drawer, checkout |
| **Upsell** | Product detail | Higher-priced alternatives | Product detail sidebar |
| **Recently viewed** | Browsing history | User's recent views | Homepage, product page |
| **Recently added** | Admin action | Newest published products | Homepage, shop |

### 2.11 Recently Viewed Products

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Storage** | Client-side (localStorage) + optional server-side | Privacy + performance |
| **Limit** | Last 20 viewed products | Storage efficiency |
| **Privacy** | Not tied to user identity unless logged in | Guest support |
| **Display** | "Continue Shopping" section on homepage | Convenience |
| **Expiry** | 30 days for logged-in, session for guests | Data freshness |

### 2.12 Product Naming & Slugs

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Name format** | `{Attribute} {Type} {Style}` e.g., "Premium Cotton Oversized T-Shirt" | Readable, SEO-friendly |
| **Slug format** | kebab-case from name: `premium-cotton-oversized-t-shirt` | URL-friendly |
| **Slug uniqueness** | `@unique` constraint on slug | URL integrity |
| **Slug generation** | Auto-generated from name, admin can override | Automation + control |
| **Slug changes** | Preserve old slugs with 301 redirect | SEO preservation |

### 2.13 Product Pricing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Base price** | `DECIMAL(10,2)` on Product | Parent pricing |
| **Variant override** | Optional price on ProductVariant | Per-SKU pricing |
| **Display price** | `variant.price ?? product.basePrice` | Resolution logic |
| **Currency** | INR by default, multi-currency ready | Business requirement |
| **Sale price** | Stored in `meta` JSON or separate `SalePrice` field | Flexible discounting |
| **Price formatting** | `₹1,999` format via `Intl.NumberFormat('en-IN')` | Indian convention |

### 2.14 Common Product Organization Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No primary category | Product has no structural home | Always assign categoryId |
| Too many tags (>20) | Tag pollution, no filtering value | Limit to 10 relevant tags |
| Parent price on variant | Confusing pricing model | Base price on parent, override on variant |
| No image alt text | Accessibility and SEO violation | Always set descriptive alt text |
| Publishing without review | Quality control failure | Always review before publishing |
| Slug from ID | Not human-readable or SEO-friendly | Slug from name |
| Ignoring stock levels | Overselling, customer disappointment | Track stock per variant |

---

## 3. Category System

### 3.1 What

The structural taxonomy that provides a logical home for every product. Categories are the permanent, hierarchical backbone of the catalog.

### 3.2 Why

- **Navigation backbone:** Categories are the primary way customers browse.
- **SEO structure:** Category pages rank for category keywords.
- **Logical organization:** Products have a clear, unambiguous home.
- **Filter foundation:** Categories power the primary filter dimension.

### 3.3 Where

Main navigation, mega menu, category listing pages, breadcrumbs, filter sidebar, sitemap, structured data.

### 3.4 Category Schema

```prisma
model Category {
  id          String  @id @default(uuid())
  name        String  @db.VarChar(100)
  slug        String  @unique @db.VarChar(100)
  description String?

  // Hierarchy
  parentId    String?
  parent      Category?  @relation(fields: [parentId], references: [id], onDelete: SetNull)
  children    Category[]

  // Display
  image       String?
  icon        String?
  banner      String?
  sortOrder   Int     @default(0)
  isActive    Boolean @default(true)
  isHidden    Boolean @default(false)

  // SEO
  metaTitle       String? @db.VarChar(300)
  metaDescription String? @db.VarChar(500)

  // Inheritance
  // Child categories inherit: gender, brandId, tags from parent (configurable)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  products    Product[]

  @@index([parentId])
  @@index([isActive])
  @@index([isHidden])
  @@index([parentId, sortOrder])
  @@index([isActive, parentId])
}
```

### 3.5 Category Hierarchy Design

#### 3.5.1 Root Categories

| Root Category | Slug | Description | Gender |
|--------------|------|-------------|--------|
| **Men** | `/shop/men` | Men's fashion | men |
| **Women** | `/shop/women` | Women's fashion | women |
| **Kids** | `/shop/kids` | Kids' fashion | unisex |
| **Accessories** | `/shop/accessories` | All accessories | unisex |

#### 3.5.2 Nested Categories (Example: Men)

```
Men
├── T-Shirts
│   ├── Plain T-Shirts
│   ├── Graphic T-Shirts
│   └── Polo T-Shirts
├── Shirts
│   ├── Formal Shirts
│   └── Casual Shirts
├── Pants
│   ├── Jeans
│   ├── Chinos
│   └── Joggers
├── Outerwear
│   ├── Jackets
│   └── Hoodies
└── Footwear
    ├── Sneakers
    └── Sandals
```

#### 3.5.3 Category Depth Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Recommended depth** | 2-3 levels | Browsing sweet spot |
| **Maximum depth** | 5 levels absolute max | Prevents navigation complexity |
| **Minimum categories at root** | 3 | Enough structure for browsing |
| **Minimum categories per level** | 2 | Splits are meaningful |
| **Maximum categories per level** | 15 | Prevents overwhelming navigation |

### 3.6 Category Inheritance

| Inherited Attribute | Source | Override | Rationale |
|-------------------|--------|----------|-----------|
| **Gender** | Parent category | Child can override | Audience filtering |
| **Default sort** | Parent category | Child can override | Consistent browsing |
| **Display style** | Parent category | Child can override | Visual consistency |
| **Meta defaults** | Parent category | Child overrides for SEO | SEO flexibility |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Inherit by default** | Children inherit parent attributes | Consistency |
| **Override explicitly** | Only override when child needs different behavior | Intentional changes |
| **Cascade sort order** | Parent sortOrder affects children | Organized navigation |

### 3.7 Category Landing Pages

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Hero banner** | Optional full-width image | Visual impact |
| **Category title** | H1, clear and descriptive | SEO and clarity |
| **Description** | 1-2 sentence summary | SEO content |
| **Subcategory grid** | Visual cards for child categories | Navigation |
| **Product grid** | Products in this category | Primary content |
| **Breadcrumbs** | Home > Parent > Current | Orientation |

### 3.8 Category Banners & Images

| Asset | Dimensions | Format | Usage |
|-------|-----------|--------|-------|
| **Category image** | 400x400px | WebP/JPG | Category card in grid |
| **Category icon** | 64x64px | SVG | Navigation, filters |
| **Category banner** | 1200x400px | WebP/JPG | Category landing page hero |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Required image** | Every category has at least one image | Visual browsing |
| **Alt text** | Descriptive text on all images | Accessibility, SEO |
| **Lazy load** | Below-fold images use lazy loading | Performance |
| **CDN delivery** | All images via Cloudflare CDN | Speed |

### 3.9 Hidden Categories

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Categories not shown in navigation but accessible via URL | Special-purpose pages |
| **When** | Seasonal, internal, or temporary categories | Flexible merchandising |
| **SEO** | Can be indexed or noindexed | Controlled crawling |
| **Example** | "Diwali Collection", "Staff Picks" | Time-limited or internal |

### 3.10 Archived Categories

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Categories no longer active but preserved | Historical data |
| **Display** | Not in navigation, not in search | Clean experience |
| **Products** | Products remain, category set to null on product | Referential integrity |
| **SEO** | 301 redirect to parent or relevant category | Link equity preservation |

### 3.11 Category Management Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Admin-only creation** | Categories created by admins only | Quality control |
| **Slug auto-generated** | From category name, admin override | URL consistency |
| **Reordering** | Admin sets sortOrder for display order | Merchandising control |
| **Soft delete** | Set `isActive = false`, never hard delete | Referential integrity |
| **Move category** | Admin can change parent | Restructuring |
| **Product reassignment** | Admin must handle products in moved/deleted categories | Data integrity |

### 3.12 Common Category Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Too many root categories (>10) | Navigation overwhelm | Max 5-7 root categories |
| Same product in multiple categories | Confusing primary assignment | One primary category, use collections for overlap |
| Categories without products | Confusing browsing | Archive empty categories |
| Deep nesting (>5 levels) | Users get lost | Flatten hierarchy |
| No images on categories | Bland browsing experience | Every category has an image |
| Inconsistent naming | "T-Shirts" vs "tshirts" vs "TShirts" | Standardize names |

---

## 4. Collection System

### 4.1 What

Curated groupings of products for merchandising, promotions, editorial features, and seasonal campaigns. Collections are flexible, thematic, and marketing-driven.

### 4.2 Why

- **Merchandising:** Business teams curate products for specific campaigns.
- **Discovery:** Collections provide alternative browsing paths beyond categories.
- **Promotions:** Time-limited collections drive urgency.
- **Storytelling:** Collections tell a brand story around products.
- **Cross-category:** Collections can span multiple categories.

### 4.3 Where

Homepage featured sections, shop page, navigation links, promotional banners, email campaigns, social media landing pages.

### 4.4 Collection Schema

```prisma
model Collection {
  id          String  @id @default(uuid())
  name        String  @db.VarChar(200)
  slug        String  @unique @db.VarChar(200)
  description String?

  // Display
  image       String?
  banner      String?
  sortOrder   Int     @default(0)
  isActive    Boolean @default(true)
  isFeatured  Boolean @default(false)

  // Type
  type        CollectionType @default(manual)

  // Scheduling
  startsAt    DateTime?
  endsAt      DateTime?

  // SEO
  metaTitle       String? @db.VarChar(300)
  metaDescription String? @db.VarChar(500)

  // Rules (for dynamic collections)
  rules       Json?
  // Expected shape: { filters: [{ field: string, operator: string, value: string }] }

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  products    ProductCollection[]

  @@index([isActive])
  @@index([isFeatured])
  @@index([type])
  @@index([startsAt, endsAt])
  @@index([isActive, isFeatured])
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

enum CollectionType {
  manual
  dynamic
  smart
}
```

### 4.5 Collection Types

| Type | Definition | Rules | Admin Control |
|------|-----------|-------|---------------|
| **Manual** | Admin hand-picks products | None | Full control over membership and order |
| **Dynamic** | Products match filter rules | Filter-based | Admin defines rules |
| **Smart** | Algorithm-driven (future) | AI/ML-based | System-generated, admin reviews |

### 4.6 Featured Collections

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Collections highlighted on homepage and navigation | Business priority |
| **Flag** | `isFeatured = true` | Simple filtering |
| **Limit** | Max 6 featured collections | Curated feel |
| **Display** | Homepage section + navigation link | Maximum visibility |
| **Rotation** | Updated monthly or per campaign | Fresh content |

### 4.7 Seasonal Collections

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Time-limited collections for festivals, seasons, events | Urgency and relevance |
| **Scheduling** | `startsAt` and `endsAt` timestamps | Automated publishing |
| **Auto-archive** | Collection auto-deactivates after `endsAt` | No manual cleanup |
| **Examples** | "Summer Essentials", "Diwali Special", "Back to School" | Seasonal merchandising |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Schedule in advance** | Set dates when creating | No last-minute rush |
| **Auto-hide after end** | `endsAt` triggers deactivation | Clean storefront |
| **Archive after season** | Set `isActive = false` after season | Data preservation |
| **SEO preservation** | 301 redirect after archive | Link equity |

### 4.8 Luxury Collections

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Premium, curated collections for high-end products | Brand positioning |
| **Visual treatment** | Larger images, more white space, editorial layout | Luxury feel |
| **Product count** | 10-30 products per collection | Exclusive, not overwhelming |
| **Examples** | "The Edit", "Editor's Picks", "Premium Selection" | Curated luxury |

### 4.9 Promotional Collections

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Sale, clearance, and discount collections | Revenue generation |
| **Pricing** | Show original price + sale price | Value perception |
| **Badge** | "Sale" badge on product cards | Visual signal |
| **Time limit** | Always has an end date | Urgency |
| **Examples** | "End of Season Sale", "Clearance", "Under ₹999" | Promotional |

### 4.10 Curated Collections

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **What** | Editorially curated, story-driven collections | Brand storytelling |
| **Content** | May include editorial text, lookbook images | Rich experience |
| **Examples** | "Office Essentials", "Weekend Style", "Travel Edit" | Lifestyle curation |

### 4.11 Manual vs Dynamic Collections

| Aspect | Manual | Dynamic |
|--------|--------|---------|
| **Product selection** | Admin picks each product | Rules determine membership |
| **Sort order** | Admin sets custom order | By rule (newest, price, etc.) |
| **Maintenance** | High (manual updates) | Low (auto-updates) |
| **Use case** | Editorial, featured, curated | Category-based, price-based |
| **Flexibility** | Full control | Rule-constrained |

### 4.12 Dynamic Collection Rules

| Rule Field | Operators | Example |
|-----------|-----------|---------|
| **category** | equals, in | `category = "T-Shirts"` |
| **brand** | equals, in | `brand = "Nabome Originals"` |
| **price** | gte, lte, between | `price >= 999 AND price <= 2999` |
| **gender** | equals | `gender = "women"` |
| **tags** | contains, in | `tags CONTAINS "cotton"` |
| **created_at** | gte, lte | `created_at >= 14 days ago` |
| **is_featured** | equals | `is_featured = true` |
| **stock** | gt, gte | `stock > 0` |
| **total_sold** | gte | `total_sold >= 100` |

### 4.13 Collection Management Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Admin-only creation** | Collections created by admins | Quality control |
| **Slug auto-generated** | From collection name | URL consistency |
| **Max products per collection** | 500 (soft limit) | Performance |
| **Product ordering** | Admin sets `sortOrder` on junction | Curated display |
| **No duplicate products** | `@@unique([productId, collectionId])` | Clean data |
| **Soft delete** | Set `isActive = false` | Data preservation |

### 4.14 Common Collection Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No end date on sale collections | Stale promotions visible | Always set end dates |
| Too many products (>100) | Collection feels uncurated | Curate to 50 or fewer |
| Collections without images | Bland browsing | Every collection has a hero image |
| Overlapping featured collections | Confusing prioritization | Max 6 featured at a time |
| No description | Poor SEO, no context | Always add a brief description |

---

## 5. Product Discovery

### 5.1 What

The complete system that helps customers find products through browsing, searching, navigating, filtering, sorting, and recommendations.

### 5.2 Why

- **Revenue:** Better discovery = more conversions.
- **Experience:** Customers feel smart when they find what they want easily.
- **Engagement:** Discovery keeps customers browsing longer.
- **Brand:** Premium discovery = premium brand perception.

### 5.3 Where

Homepage, shop page, category pages, collection pages, search results, product detail page, cart, email campaigns, social media.

### 5.4 Discovery Paths

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT DISCOVERY PATHS                        │
│                                                                  │
│  1. NAVIGATION                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Header nav → Category → Subcategory → Product List      │   │
│  │  Mega menu → Featured items → Product Detail             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  2. SEARCH                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Search bar → Query → Results → Filter → Product Detail  │   │
│  │  Autocomplete → Suggestions → Quick add                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  3. BROWSING                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Shop page → All products → Sort/Filter → Product Detail │   │
│  │  Collection page → Curated list → Product Detail         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  4. RECOMMENDATIONS                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Product page → Related products → Product Detail        │   │
│  │  Homepage → Featured/Trending → Product Detail           │   │
│  │  Cart → Cross-sell → Product Detail                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  5. EXTERNAL                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Social media → Landing page → Product                   │   │
│  │  Email campaign → Collection → Product                   │   │
│  │  Google search → Category/Product page                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Browsing Architecture

#### 5.5.1 Shop Page

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Default view** | All published products | Complete catalog access |
| **Default sort** | Featured (manual priority) | Business control |
| **Grid** | 2 cols mobile, 3 tablet, 4 desktop | Responsive |
| **Pagination** | 24 products per page | Balance of content and performance |
| **Filters** | Always accessible | Refinement |
| **Result count** | "X products" always visible | Context |

#### 5.5.2 Category Page

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Title** | Category name as H1 | SEO, clarity |
| **Breadcrumb** | Home > Parent > Current | Orientation |
| **Description** | Optional, below title | SEO content |
| **Subcategories** | Grid of child categories (if any) | Navigation |
| **Products** | Products in this category | Primary content |
| **Filters** | Category-specific filters | Refinement |

#### 5.5.3 Collection Page

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Title** | Collection name as H1 | SEO, clarity |
| **Hero image** | Optional banner | Visual impact |
| **Description** | Editorial text | Storytelling |
| **Products** | Curated product grid | Primary content |
| **Sort** | By admin order (manual) or by rule (dynamic) | Curation control |

### 5.6 Search Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full-text search** | `pg_trgm` extension on product name, description | Fast, accurate |
| **Autocomplete** | Show suggestions after 2+ characters | Speed |
| **Fuzzy matching** | Handle typos and variations | User-friendly |
| **Weighted results** | Name (0.7) > Description (0.3) | Relevance |
| **Search within category** | Optional category scope | Precision |
| **Recent searches** | Show last 5 searches | Convenience |
| **Popular searches** | Show trending queries | Discovery |
| **No results** | Suggest alternatives, show popular products | Recovery |

### 5.7 Navigation Integration

| Touchpoint | Discovery Mechanism | Implementation |
|-----------|-------------------|----------------|
| **Header** | Primary nav links to categories | Static links |
| **Mega menu** | Desktop dropdown with categories + featured | CMS-driven |
| **Mobile bottom nav** | Shop tab → category selection | Static links |
| **Breadcrumbs** | Trail from home to current page | Dynamic from hierarchy |
| **Footer** | Secondary links to categories, collections | Static links |
| **Back button** | Returns to previous browsing context | History-based |

### 5.8 Cross-selling & Upselling

| Strategy | Trigger | Display | Implementation |
|----------|---------|---------|---------------|
| **Cross-sell** | Cart page, product page | "Complete the Look", "Pairs Well With" | Admin-curated or rule-based |
| **Upsell** | Product detail page | "You Might Prefer" | Higher-priced alternatives |
| **Bundle** | Cart page | "Add X for ₹Y more" | Complementary products |
| **Recently viewed** | Homepage, product page | "Continue Shopping" | Browsing history |

### 5.9 Category Suggestions

| Context | Suggestion Type | Display |
|---------|----------------|---------|
| **Search with no results** | Related categories | "Browse {category} instead" |
| **Search with results** | Category refinement | "See all in {category}" |
| **Homepage** | Popular categories | Category grid |
| **Product page** | Parent category link | Breadcrumb + "Shop {category}" |

### 5.10 Common Discovery Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No search functionality | Customers can't find specific products | Full-text search |
| No breadcrumbs | Users get lost | Always show breadcrumbs |
| No "back" path | Users can't return | Clear back navigation |
| Overwhelming results (>100 per page) | Slow loading, poor UX | Paginate, 24 per page |
| No empty state guidance | Dead-end experience | Suggest alternatives |
| No product count | Users don't know scope | Always show result count |

---

## 6. Filter Architecture

### 6.1 What

The system that allows customers to narrow down product listings based on specific attributes, preferences, and requirements.

### 6.2 Why

- **Efficiency:** Find specific products faster.
- **Relevance:** Show only products that match customer needs.
- **Conversion:** Filtered results convert better.
- **Experience:** Filtering feels powerful and intuitive.

### 6.3 Where

Shop page, category pages, collection pages, search results page.

### 6.4 Filter Types

#### 6.4.1 Dynamic Filters

| Filter | Type | Source | Behavior |
|--------|------|--------|----------|
| **Category** | Multi-select | Category hierarchy | Show/hide subcategories |
| **Price range** | Range slider | Product basePrice | Min/max inputs |
| **Size** | Multi-select | ProductVariant.size | Only available sizes shown |
| **Color** | Visual swatches | ProductVariant.colorHex | Color circle selection |
| **Brand** | Multi-select | Product.brandId | Brand list |
| **Gender** | Single-select | Product.gender | Men/Women/Unisex |
| **Availability** | Toggle | ProductVariant.stock | In stock only |
| **Rating** | Minimum stars | Product.averageRating | Star filter |
| **Tags** | Multi-select | Product.tags | Tag cloud |

#### 6.4.2 Category-Specific Filters

| Category | Additional Filters | Rationale |
|----------|-------------------|-----------|
| **T-Shirts** | Sleeve type, neckline, pattern | Product-specific attributes |
| **Pants** | Fit, length, wash | Product-specific attributes |
| **Shirts** | Collar type, sleeve length, pattern | Product-specific attributes |
| **Footwear** | Shoe size, sole type | Product-specific attributes |

#### 6.4.3 Future Custom Filters

| Filter | Implementation | Rationale |
|--------|---------------|-----------|
| **Material** | `product.meta.material` | Product attribute |
| **Care instructions** | `product.meta.care` | Product attribute |
| **Origin** | `product.meta.origin` | Product attribute |
| **Custom attribute** | `product.meta.custom` | Flexible extension |

### 6.5 Filter Schema Design

```typescript
// api/_lib/types/filters.ts

interface FilterOption {
  id: string;
  label: string;
  count: number; // Product count for this option
  value: string;
  selected: boolean;
}

interface FilterGroup {
  id: string;
  label: string;
  type: 'multi-select' | 'single-select' | 'range' | 'toggle' | 'swatch';
  options: FilterOption[];
  expanded: boolean; // Default state
}

interface FilterState {
  groups: FilterGroup[];
  activeFilters: Record<string, string[]>; // { color: ['black', 'white'], size: ['M'] }
  priceRange: { min: number; max: number } | null;
}
```

### 6.6 Filter Display Rules

| Context | Desktop | Mobile |
|---------|---------|--------|
| **Placement** | Left sidebar (280px) | Bottom sheet (full width) |
| **Visibility** | Always visible | Tap "Filters" button to open |
| **Active filters** | Chips below filter bar | Chips below filter bar |
| **Clear all** | "Clear all" button | "Clear all" button |
| **Apply** | Auto-apply on selection | "Show X results" button |
| **Count** | Show product count per option | Show product count per option |

### 6.7 Filter Behavior Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Real-time counts** | Update product counts as filters change | Context |
| **OR within group** | Selecting multiple options in same group = OR | Intuitive |
| **AND between groups** | Filters across groups = AND | Precise |
| **URL sync** | Filter state reflected in URL params | Shareable, bookmarkable |
| **Reset capability** | "Clear all" resets all filters | Easy recovery |
| **Mobile apply** | Explicit "Show results" on mobile | Prevent confusion |
| **Skeleton loading** | Show skeleton while filters load | Perceived performance |
| **Empty options** | Hide filter groups with 0 products | Clean UI |

### 6.8 Filter Accessibility

| Requirement | Implementation | Rationale |
|------------|---------------|-----------|
| **Keyboard navigation** | Tab through all filter options | Keyboard users |
| **Screen reader** | `aria-label` on filter groups | Accessibility |
| **Focus management** | Focus moves to filter panel when opened | Orientation |
| **Color swatches** | `aria-label` with color name | Non-visual users |
| **Count announcements** | `aria-live="polite"` on result count | Dynamic updates |

### 6.9 Common Filter Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No product counts | Users don't know filter impact | Always show counts |
| Filters not in URL | Can't share filtered views | URL-synced filters |
| Too many filter options | Overwhelming | Limit to top options, show "More" |
| No mobile filter UX | Poor mobile experience | Bottom sheet with apply button |
| Filters that return 0 results | Dead-end experience | Hide empty filters |

---

## 7. Sorting Standards

### 7.1 What

The system that allows customers to order product listings by different criteria.

### 7.2 Why

- **User control:** Customers sort by what matters to them.
- **Discovery:** Different sorts reveal different products.
- **Business:** Default sort promotes business priorities.

### 7.3 Where

Shop page, category pages, collection pages, search results.

### 7.4 Sort Options

| Sort Option | Value | Behavior | Default Use |
|------------|-------|----------|-------------|
| **Featured** | `featured` | Manual `sortOrder` | Homepage, featured sections |
| **Newest** | `new` | `createdAt` DESC | New arrivals |
| **Price: Low to High** | `price_asc` | `basePrice` ASC | Budget browsing |
| **Price: High to Low** | `price_desc` | `basePrice` DESC | Premium browsing |
| **Popularity** | `popular` | `totalSold` DESC | Best sellers |
| **Rating** | `rating` | `averageRating` DESC | Quality browsing |
| **Discount** | `discount` | Discount percentage DESC | Sale browsing |
| **Name: A-Z** | `name_asc` | `name` ASC | Alphabetical |
| **Name: Z-A** | `name_desc` | `name` DESC | Reverse alphabetical |

### 7.5 Sort Behavior Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default sort** | Featured (manual priority) | Business control |
| **URL sync** | Sort param in URL (`?sort=new`) | Shareable, bookmarkable |
| **Persist selection** | Remember sort during session | Convenience |
| **Sort dropdown** | Dropdown on desktop, bottom sheet on mobile | Responsive |
| **Visual indicator** | Active sort highlighted | Orientation |
| **Reset on category change** | Sort resets when navigating categories | Fresh context |

### 7.6 Sort Implementation

```typescript
// Sort resolution logic
function resolveSort(sortParam: string): Prisma.ProductOrderByWithRelationInput {
  switch (sortParam) {
    case 'new':
      return { createdAt: 'desc' };
    case 'price_asc':
      return { basePrice: 'asc' };
    case 'price_desc':
      return { basePrice: 'desc' };
    case 'popular':
      return { totalSold: 'desc' };
    case 'rating':
      return { averageRating: 'desc' };
    case 'name_asc':
      return { name: 'asc' };
    case 'name_desc':
      return { name: 'desc' };
    case 'featured':
    default:
      return { sortOrder: 'asc' };
  }
}
```

### 7.7 Common Sort Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No default sort | Random, confusing order | Default to featured |
| Sort not in URL | Can't share sorted views | URL-synced sort |
| Too many sort options | Decision paralysis | Max 7 sort options |
| Sort persists across categories | Confusing context | Reset on navigation |

---

## 8. Catalog Visibility

### 8.1 What

Rules governing when and where products, categories, and collections are visible across the platform.

### 8.2 Why

- **Control:** Business decides what customers see.
- **Workflow:** Draft → Review → Publish workflow.
- **Scheduling:** Time-based publishing for campaigns.
- **Data integrity:** Never lose data through hard deletes.

### 8.3 Where

Public storefront, admin panel, search index, API responses, CDN cache.

### 8.4 Product Visibility Matrix

| Status | Public Store | Admin Panel | Search API | Sitemap | Cache |
|--------|-------------|-------------|------------|---------|-------|
| **draft** | Hidden | Visible (draft) | Not indexed | Not included | Not cached |
| **scheduled** | Hidden until date | Visible (scheduled) | Not indexed until date | Not included | Not cached |
| **published** | Visible | Visible | Indexed | Included | Cached |
| **archived** | Hidden | Visible (archived) | De-indexed | Not included | Not cached |

### 8.5 Category Visibility Matrix

| Status | Public Store | Admin Panel | Navigation | Filter Options |
|--------|-------------|-------------|------------|---------------|
| **active** | Visible | Visible | Included | Included |
| **hidden** | Accessible via URL | Visible (hidden badge) | Not in nav | Not shown |
| **inactive** | Hidden | Visible (inactive badge) | Not in nav | Not shown |

### 8.6 Collection Visibility Matrix

| Status | Public Store | Admin Panel | Homepage | Navigation |
|--------|-------------|-------------|----------|------------|
| **active** | Visible | Visible | If featured | If featured |
| **inactive** | Hidden | Visible (inactive badge) | Not shown | Not shown |
| **scheduled** | Hidden until date | Visible (scheduled) | Not shown | Not shown |
| **expired** | Hidden | Visible (expired badge) | Not shown | Not shown |

### 8.7 Visibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Parent affects children** | Inactive parent hides all children | Hierarchy integrity |
| **Product inherits category** | Product hidden if category inactive | Consistent browsing |
| **Published = public** | Only published items visible to customers | Clear workflow |
| **Draft = internal** | Drafts only visible in admin | Development workflow |
| **Schedule precision** | `startsAt` and `endsAt` use UTC | Timezone consistency |
| **Cache invalidation** | Status change triggers cache purge | Fresh content |

### 8.8 Scheduled Publishing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Products** | `scheduledAt` timestamp triggers publish | Time-based publishing |
| **Collections** | `startsAt` and `endsAt` control visibility | Campaign management |
| **Categories** | `isActive` toggle (no scheduling needed) | Permanent structure |
| **Batch operations** | Admin can schedule multiple items | Campaign efficiency |
| **Notification** | Admin notified when items publish | Awareness |

### 8.9 Common Visibility Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Publishing without review | Quality issues go live | Review before publish |
| No scheduled end dates | Stale campaigns visible | Always set end dates |
| Hard deleting products | Breaks order history | Soft delete only |
| Hidden categories in search | Confusing SEO | Properly noindex hidden |

---

## 9. SEO Architecture

### 9.1 What

Standards for making the product catalog search-engine friendly, ensuring products, categories, and collections are discoverable via Google and other search engines.

### 9.2 Why

- **Organic traffic:** SEO drives free, sustainable traffic.
- **Discovery:** Customers find products via search engines.
- **Brand authority:** High rankings build trust.
- **Revenue:** Organic traffic converts at high rates.

### 9.3 Where

Product pages, category pages, collection pages, sitemap, robots.txt, structured data, meta tags.

### 9.4 URL Architecture

| Page Type | URL Pattern | Example |
|-----------|-------------|---------|
| **Shop** | `/shop` | `/shop` |
| **Category** | `/shop/{category-slug}` | `/shop/men` |
| **Subcategory** | `/shop/{parent-slug}/{child-slug}` | `/shop/men/t-shirts` |
| **Product** | `/shop/{category-slug}/{product-slug}` | `/shop/men/premium-cotton-tee` |
| **Collection** | `/collections/{collection-slug}` | `/collections/summer-essentials` |
| **Search** | `/search?q={query}` | `/search?q=cotton+t-shirt` |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lowercase** | All slugs lowercase | URL consistency |
| **Hyphens** | Words separated by hyphens | Readability |
| **No special characters** | Only alphanumeric and hyphens | URL safety |
| **Descriptive** | Slugs describe content | SEO keywords |
| **Immutable** | Slugs never change after creation | URL stability |
| **Short** | Max 5-6 words in slug | Readability |

### 9.5 Slug Management

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Auto-generation** | Generated from name on creation | Automation |
| **Admin override** | Admin can customize slug | SEO control |
| **Uniqueness** | Global unique constraint | No duplicate URLs |
| **Preservation** | Old slugs preserved with 301 redirect | Link equity |
| **Conflict handling** | Append `-1`, `-2` if slug exists | Uniqueness |

### 9.6 Meta Information

| Page | Title Format | Description Format |
|------|-------------|-------------------|
| **Product** | `{Product Name} - Buy Online at Nabome` | `{Short description} - Free shipping on orders above ₹999` |
| **Category** | `{Category Name} - Shop Online at Nabome` | `{Category description} - Browse {count} products` |
| **Collection** | `{Collection Name} - Nabome` | `{Collection description}` |
| **Shop** | `Shop All Products - Nabome` | `Discover premium fashion at Nabome. Free shipping on orders above ₹999` |
| **Search** | `Search Results for "{query}" - Nabome` | `{count} results for "{query}"` |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Title length** | 50-60 characters | Google display limit |
| **Description length** | 150-160 characters | Google display limit |
| **Unique** | Every page has unique meta | No duplicate content |
| **Keywords** | Include primary keyword | SEO relevance |
| **Brand** | Include "Nabome" | Brand visibility |

### 9.7 Structured Data (Schema.org)

| Page Type | Schema Type | Required Properties |
|-----------|------------|-------------------|
| **Product** | `Product` | name, image, description, sku, brand, offers |
| **Category** | `CollectionPage` | name, description |
| **Collection** | `CollectionPage` | name, description |
| **Breadcrumb** | `BreadcrumbList` | itemListElement |
| **Organization** | `Organization` | name, logo, url |

**Product Schema:**

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Cotton T-Shirt",
  "image": "https://nabome.online/images/product.jpg",
  "description": "A premium cotton t-shirt...",
  "sku": "TEE-BLK-M",
  "brand": {
    "@type": "Brand",
    "name": "Nabome"
  },
  "offers": {
    "@type": "Offer",
    "price": "999",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "url": "https://nabome.online/shop/men/premium-cotton-tee"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "12"
  }
}
```

### 9.8 Breadcrumbs

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always visible** | Show on all product, category, collection pages | Orientation |
| **Structured data** | BreadcrumbList schema on every page | SEO |
| **Linked** | All items except current are clickable links | Navigation |
| **Mobile truncation** | Show last 2 items with "..." | Space efficiency |
| **Home always first** | "Home" always the first breadcrumb | Orientation |

### 9.9 Canonical URLs

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Self-referencing** | Every page has a canonical URL | Duplicate prevention |
| **Product variants** | Canonical to parent product | No duplicate product pages |
| **Filter params** | Canonical to unfiltered URL | Clean index |
| **Sort params** | Canonical to default sort URL | Clean index |
| **Pagination** | Canonical to first page or self | Clean index |

### 9.10 Sitemap

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-generated** | Generated from published products, categories, collections | Fresh sitemap |
| **Last modified** | Include `lastmod` for each URL | Crawl efficiency |
| **Priority** | Products: 0.8, Categories: 0.9, Collections: 0.7 | Importance signal |
| **Change frequency** | Products: weekly, Categories: monthly | Crawl hints |
| **Size limit** | Max 50,000 URLs per sitemap file | Standard limit |
| **Index file** | Sitemap index for multiple sitemaps | Scalability |

### 9.11 Image SEO

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Alt text** | Descriptive text on all product images | Accessibility, image search |
| **File naming** | `{product-slug}-{variant}.webp` | URL SEO |
| **Lazy loading** | Below-fold images use `loading="lazy"` | Performance |
| **Srcset** | Responsive images for different viewports | Performance |
| **WebP format** | Modern format for smaller file sizes | Speed |

### 9.12 Common SEO Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Duplicate content | Google penalizes duplicates | Canonical URLs |
| Missing meta tags | Lost ranking opportunity | Every page has meta |
| No structured data | Missing rich snippets | Schema.org on all pages |
| Broken URLs | 404 errors hurt ranking | 301 redirects |
| Missing alt text | Accessibility and image SEO violation | Always set alt text |
| Slow pages | Google penalizes slow sites | Optimize images, lazy load |

---

## 10. CMS Integration

### 10.1 How products, categories, and collections integrate with the CMS engine, homepage builder, and content pages.

### 10.2 Why

- **Unified content:** Products and content coexist seamlessly.
- **Marketing power:** Content drives product discovery.
- **Flexibility:** Content teams can feature products anywhere.
- **SEO:** Content pages link to products for link equity.

### 10.3 Where

Homepage, CMS pages, blog posts, promotional sections, email templates.

### 10.4 Homepage Builder Integration

| Section Type | Data Source | Content |
|-------------|------------|---------|
| **Hero** | CMS media + product/collection link | Banner with CTA |
| **Featured Products** | `isFeatured = true` products | Product grid |
| **Categories** | Active root categories | Category cards |
| **Collections** | `isFeatured = true` collections | Collection cards |
| **New Arrivals** | `isNew = true` OR recent `createdAt` | Product grid |
| **Best Sellers** | `totalSold` DESC | Product grid |
| **Trending** | `isTrending = true` | Product grid |
| **Blog** | Latest CMS blog posts | Article cards |
| **Testimonials** | CMS testimonials | Quote cards |
| **Newsletter** | Static section | Email signup |

### 10.5 CMS Page Integration

| Content Element | Data Source | Usage |
|----------------|------------|-------|
| **Product block** | Product by ID or slug | Inline product showcase |
| **Category block** | Category by ID or slug | Category feature |
| **Collection block** | Collection by ID or slug | Collection feature |
| **Product grid** | Filtered product query | Dynamic product listing |
| **Category grid** | Active categories | Category navigation |

### 10.6 Blog Integration

| Integration | Usage | SEO Value |
|------------|-------|-----------|
| **Product links** | Link to products in blog content | Internal linking |
| **Category links** | Link to categories in blog content | Category authority |
| **Collection features** | Feature collections in blog posts | Collection promotion |
| **Product reviews** | Blog posts reviewing products | Long-tail keywords |

### 10.7 Search Integration

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Index source** | Products, categories, collections | Complete search |
| **Weighting** | Product name > category > collection > blog | Relevance |
| **Freshness** | Reindex on any content change | Current results |
| **Suggestions** | Include category and collection suggestions | Discovery |

### 10.8 Recommendation Integration

| Recommendation Type | Data Source | Display |
|-------------------|------------|---------|
| **Homepage featured** | Admin-curated | Homepage sections |
| **Product page related** | Same category + attributes | Product detail |
| **Cart cross-sell** | Complementary products | Cart drawer |
| **Email recommendations** | Purchase history + trending | Email campaigns |
| **Social recommendations** | Trending + new | Social media |

### 10.9 Promotional Section Integration

| Section | Content Source | Update Frequency |
|---------|---------------|-----------------|
| **Flash sale banner** | Sale collection + countdown | Real-time |
| **Seasonal promotion** | Seasonal collection | Campaign-based |
| **Category spotlight** | Featured category | Monthly |
| **Brand feature** | Brand collection | Monthly |

### 10.10 CMS Integration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No hardcoded products** | All product references via IDs/slugs | Dynamic content |
| **Cache product data** | Product info cached in CMS | Performance |
| **Stale content handling** | CMS shows "product unavailable" for inactive | Graceful degradation |
| **Preview mode** | CMS preview shows draft products | Admin workflow |
| **Version control** | CMS content versioned | Rollback capability |

### 10.11 Common CMS Integration Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Hardcoded product IDs in templates | Can't update without code changes | Dynamic references |
| No fallback for inactive products | Broken content | Graceful degradation |
| CMS not caching product data | Slow page loads | Cache product queries |
| No preview mode | Can't verify before publish | Always implement preview |

---

## 11. Performance Standards

### 11.1 What

Standards for ensuring the catalog loads fast, images render quickly, and browsing feels instant.

### 11.2 Why

- **Conversion:** Every 100ms delay costs 1% in conversions.
- **SEO:** Google ranks fast sites higher.
- **Experience:** Fast browsing = premium browsing.
- **Mobile:** Slow sites lose mobile users immediately.

### 11.3 Where

All product listing pages, product detail pages, search results, filters, sorting.

### 11.4 Lazy Loading

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Product images** | Use `loading="lazy"` for below-fold images | Fast initial load |
| **Thumbnail images** | Load on demand when variant selected | Reduce initial load |
| **Category images** | Lazy load below-fold category cards | Fast navigation |
| **Collection images** | Lazy load below-fold collection cards | Fast navigation |
| **Intersection Observer** | Use for custom lazy loading behaviors | Flexible implementation |

### 11.5 Pagination

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Page size** | 24 products per page | Balance of content and speed |
| **Type** | Numbered pagination (not infinite scroll) | SEO, orientation |
| **URL sync** | `?page=2` in URL | Shareable, bookmarkable |
| **Scroll to top** | Scroll to top on page change | Orientation |
| **Loading state** | Skeleton grid during page load | Perceived performance |
| **Total count** | Show "Page 1 of 10 (240 products)" | Context |

**Note:** Infinite scrolling is NOT recommended for the initial launch. It causes SEO issues, makes pagination impossible, and hurts accessibility. Numbered pagination is the standard. Infinite scroll can be considered for future mobile-specific experiences only.

### 11.6 Caching Strategy

| Data Type | Cache Duration | Invalidation | Storage |
|-----------|---------------|--------------|---------|
| **Product listings** | 5 minutes | On product change | Cloudflare KV |
| **Product detail** | 10 minutes | On product change | Cloudflare KV |
| **Category listings** | 30 minutes | On category change | Cloudflare KV |
| **Collection listings** | 15 minutes | On collection change | Cloudflare KV |
| **Filter options** | 5 minutes | On product/variant change | Cloudflare KV |
| **Search suggestions** | 1 hour | On product change | Cloudflare KV |
| **Static pages** | 1 hour | On content change | Cloudflare CDN |

**Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Stale-while-revalidate** | Serve cached, update in background | Speed |
| **Tag-based invalidation** | Invalidate by entity type | Granular control |
| **CDN edge caching** | Cache at edge for global speed | Performance |
| **Admin bypass** | Admin always sees fresh data | Accuracy |

### 11.7 Image Optimization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Format** | WebP with JPEG fallback | Smaller files |
| **Responsive** | Srcset with 3 breakpoints (400, 800, 1200px) | Right size for device |
| **Compression** | 80% quality for product images | Quality vs size |
| **Dimensions** | Always specify width/height | Prevent layout shift |
| **CDN** | Serve via Cloudflare CDN | Global speed |
| **Lazy loading** | Below-fold images lazy loaded | Initial load speed |

### 11.8 Search Indexing Performance

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Index type** | GIN index on `pg_trgm` | Fast text search |
| **Query optimization** | Use `similarity()` with threshold | Relevant results |
| **Result limit** | Max 50 results per query | Performance |
| **Debounce** | 300ms debounce on search input | Reduce API calls |
| **Caching** | Cache search results for 5 minutes | Reduce DB load |

### 11.9 Query Optimization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Select only needed fields** | Use Prisma `select` | Reduce data transfer |
| **Eager load relations** | Use Prisma `include` for needed relations | Prevent N+1 |
| **Pagination** | Always use `take` and `skip` | Prevent large result sets |
| **Composite indexes** | Index common query patterns | Fast filtering |
| **Connection pooling** | Use Hyperdrive for connection pooling | Edge performance |

### 11.10 Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP** | < 2.5 seconds | Largest Contentful Paint |
| **INP** | < 200ms | Interaction to Next Paint |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **FCP** | < 1.8 seconds | First Contentful Paint |
| **TBT** | < 200ms | Total Blocking Time |
| **API response** | < 200ms | Server response time |
| **Search response** | < 100ms | Search query time |
| **Image load** | < 200ms | Image render time |

### 11.11 Common Performance Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No image optimization | Slow page loads | WebP + responsive images |
| Loading all images at once | Massive initial load | Lazy loading |
| No caching | Every request hits database | Cache aggressively |
| N+1 queries | Exponential DB queries | Eager load relations |
| No pagination | Load all 10,000 products | Paginate results |
| No skeleton loading | Perceived slowness | Show skeletons during load |

---

## 12. Accessibility Standards

### 12.1 What

Standards for ensuring the product catalog is usable by everyone, including users with disabilities.

### 12.2 Why

- **Inclusivity:** Everyone deserves access to products.
- **Legal:** WCAG 2.2 AA compliance required.
- **SEO:** Accessible sites rank higher.
- **Business:** Accessible design benefits all users.

### 12.3 Where

All product listing pages, product detail pages, filters, sorting, navigation, search.

### 12.4 Keyboard Navigation

| Element | Keyboard Behavior | Rationale |
|---------|------------------|-----------|
| **Product cards** | Tab to card, Enter to open | Keyboard access |
| **Filter options** | Tab through options, Space to select | Keyboard filtering |
| **Sort dropdown** | Tab to trigger, Arrow keys to navigate, Enter to select | Keyboard sorting |
| **Pagination** | Tab to page links, Enter to navigate | Keyboard pagination |
| **Search** | `/` to focus search, Escape to close | Keyboard search |
| **Image gallery** | Arrow keys to navigate images | Keyboard browsing |

### 12.5 Screen Reader Support

| Element | ARIA Attribute | Value |
|---------|---------------|-------|
| **Product card** | `role="article"` | Semantics |
| **Product name** | `aria-label` | Full product name with price |
| **Add to cart** | `aria-label` | "Add {product} to cart" |
| **Filter group** | `role="group"` + `aria-label` | "Filter by {type}" |
| **Filter option** | `role="checkbox"` + `aria-checked` | Selection state |
| **Color swatch** | `aria-label` | Color name (e.g., "Black") |
| **Size button** | `aria-label` | "Size {size}, {availability}" |
| **Sort dropdown** | `role="listbox"` + `aria-label` | "Sort products by" |
| **Result count** | `aria-live="polite"` | Dynamic count updates |
| **Price** | `aria-label` | "Price: ₹999" |
| **Rating** | `aria-label` | "Rating: 4.5 out of 5 stars" |

### 12.6 Filter Accessibility

| Requirement | Implementation | Rationale |
|------------|---------------|-----------|
| **Keyboard reachable** | All filters reachable via Tab | Keyboard users |
| **Announce changes** | `aria-live="polite"` on result count | Dynamic updates |
| **Focus management** | Focus moves to filter panel on open | Orientation |
| **Clear labels** | Every filter has visible label | Understanding |
| **State indication** | `aria-checked` for selected filters | Status communication |

### 12.7 Responsive Browsing

| Breakpoint | Behavior | Rationale |
|-----------|----------|-----------|
| **Mobile** | 2-col grid, bottom sheet filters, sticky CTA | Touch-first |
| **Tablet** | 3-col grid, sidebar filters | Medium screen |
| **Desktop** | 4-col grid, sidebar filters, hover states | Full experience |
| **Touch targets** | Min 44x44px for all interactive elements | Touch accessibility |
| **Font size** | Min 16px for body text | Readability |

### 12.8 Reduced Motion

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Query** | `prefers-reduced-motion` media query | User preference |
| **Animations** | Disable non-essential animations | Comfort |
| **Transitions** | Use `opacity` instead of `transform` | Simpler motion |
| **Carousels** | No auto-advance | User control |
| **Loading states** | Use opacity fade instead of slide | Subtle feedback |

### 12.9 Color & Contrast

| Element | Minimum Contrast | Standard |
|---------|-----------------|----------|
| **Body text** | 4.5:1 on white | WCAG AA |
| **Large text** | 3:1 on white | WCAG AA |
| **Interactive elements** | 3:1 | WCAG AA |
| **Focus indicators** | 3:1 | WCAG AA |
| **Color swatches** | Border for non-color differentiation | Color-blind users |
| **Error messages** | 4.5:1 | WCAG AA |

### 12.10 Common Accessibility Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No alt text on images | Screen readers can't describe images | Always set alt text |
| No keyboard navigation | Keyboard users can't browse | Full keyboard support |
| No focus indicators | Users can't see where they are | Visible focus rings |
| Auto-playing carousels | Distracting, hard to stop | Manual carousel control |
| No ARIA labels | Screen readers can't understand elements | Comprehensive ARIA |
| Low contrast text | Hard to read for low-vision users | WCAG AA contrast |

---

## 13. Future Readiness

### 13.1 What

Architecture designed to support future features without requiring fundamental redesigns.

### 13.2 Why

- **Investment protection:** Current architecture supports future growth.
- **Scalability:** System handles increased complexity.
- **Flexibility:** New features plug into existing patterns.
- **Competitive advantage:** Ready for market demands.

### 13.3 Where

Schema design, API structure, component architecture, caching strategy.

### 13.4 AI Recommendations

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Data collection** | Track views, purchases, wishlist adds | Training data |
| **Schema readiness** | `totalSold`, `averageRating`, tags for ML features | Feature engineering |
| **API readiness** | `/api/recommendations` endpoint structure | Integration point |
| **Display readiness** | "Recommended for You" section placeholder | UI ready |
| **Cold start** | Fallback to trending/popular for new users | Graceful degradation |

### 13.5 Personalization

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Browsing history** | Track recently viewed (client-side) | Privacy-first |
| **Preference storage** | User preferences in profile | Personalization data |
| **Dynamic sorting** | Personalized default sort (future) | Relevance |
| **Dynamic filters** | Preferred sizes, colors surfaced first | Convenience |
| **A/B testing readiness** | Feature flags for catalog variations | Experimentation |

### 13.6 Multi-language

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Schema readiness** | `ProductTranslation` table design | i18n support |
| **Slug handling** | Localized slugs per language | SEO per language |
| **Meta translation** | Title and description per language | SEO per language |
| **URL structure** | `/en/shop/...` or `/hi/shop/...` | Language prefix |
| **Content translation** | CMS content per language | Full i18n |

### 13.7 Multi-currency

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Schema readiness** | `ProductPrice` table per currency | Price flexibility |
| **Display format** | `Intl.NumberFormat` with locale | Correct formatting |
| **Conversion rates** | Admin-set or API-fetched rates | Accuracy |
| **Price caching** | Currency-specific cache keys | Performance |
| **Checkout** | Currency locked at checkout | Prevent confusion |

### 13.8 Regional Catalogs

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Schema readiness** | `regionId` on Product | Regional availability |
| **Visibility rules** | Region-based product visibility | Regional merchandising |
| **Pricing** | Region-specific pricing | Market pricing |
| **Shipping** | Region-specific shipping rules | Logistics |
| **Tax** | Region-specific tax rules | Compliance |

### 13.9 Marketplace Expansion

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Schema readiness** | `sellerId` on Product | Multi-vendor support |
| **Ownership** | Product belongs to seller | Seller management |
| **Commission** | Transaction fee tracking | Revenue model |
| **Seller pages** | `/sellers/{seller-slug}` | Seller branding |
| **Seller ratings** | Review system per seller | Quality control |

### 13.10 Product Bundles

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Schema readiness** | `ProductBundle` junction table | Bundle definition |
| **Pricing** | Bundle price vs individual total | Discount display |
| **Inventory** | Bundle stock = min(individual stocks) | Availability logic |
| **Cart** | Bundle as single cart item | Checkout simplicity |
| **Display** | "Buy together and save" | Cross-sell |

### 13.11 Subscription Products

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Schema readiness** | `SubscriptionPlan` table | Plan management |
| **Pricing** | Recurring price + interval | Subscription billing |
| **Inventory** | Subscription stock management | Recurring availability |
| **Cart** | Subscription as cart item type | Checkout integration |
| **Management** | Customer portal for subscription management | Self-service |

### 13.12 Future Readiness Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Schema extensions** | Add new tables/columns, never modify existing | Backward compatibility |
| **API versioning** | Version API endpoints | Breaking change protection |
| **Feature flags** | Gate new features behind flags | Safe rollout |
| **Data migration** | Plan migration paths for schema changes | Zero downtime |
| **Backward compatibility** | New features don't break existing | Stability |

---

## 14. Architectural Rules

### 14.1 What

Hard rules that every catalog implementation must follow. No exceptions.

### 14.2 Why

- **Consistency:** Every AI agent follows the same patterns.
- **Quality:** Every implementation meets the standard.
- **Maintainability:** Predictable patterns reduce complexity.

### 14.3 Hard Rules

| Rule | Description | Violation Consequence |
|------|-------------|----------------------|
| **One primary category** | Every product has exactly one `categoryId` | Structural ambiguity |
| **Soft delete only** | Never hard delete products, categories, or collections | Referential integrity break |
| **UUID v4 primary keys** | All entities use UUID v4 | Security, distributed systems |
| **DECIMAL for money** | All currency fields use `DECIMAL(10,2)` | Financial inaccuracy |
| **Index all FKs** | Every foreign key column has an index | Query performance |
| **Status-controlled visibility** | Products only visible when `status = published` | Accidental publishing |
| **Slug uniqueness** | All slugs globally unique | URL conflicts |
| **Image alt text** | All product images have descriptive alt text | Accessibility violation |
| **URL-synced state** | Filters, sort, page in URL params | Shareable links |
| **No barrel files** | Direct imports only in catalog features | Tree-shaking |
| **No `any` types** | Full TypeScript types for catalog entities | Type safety |
| **No console.log** | Use Pino logger for all logging | Production quality |

### 14.4 Soft Rules

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **24 products per page** | Standard pagination size | Default, adjust for specific views |
| **Max 6 featured collections** | Limit featured collections | Homepage, navigation |
| **Max 20 featured products** | Limit featured products | Homepage sections |
| **5-minute cache** | Standard cache duration | Product listings |
| **300ms search debounce** | Standard search debounce | Search input |
| **44x44px touch targets** | Minimum touch target size | All interactive elements |

### 14.5 File Organization Rules

| Artifact | Location | Naming |
|----------|----------|--------|
| **Product components** | `src/features/products/components/` | PascalCase |
| **Product hooks** | `src/features/products/hooks/` | camelCase with `use` prefix |
| **Product types** | `src/features/products/types.ts` | PascalCase |
| **Product API** | `src/features/products/api/` | camelCase |
| **Admin product components** | `src/features/admin/products/` | PascalCase |
| **Product handlers** | `api/_handlers/products/` | kebab-case |
| **Admin handlers** | `api/_handlers/admin/` | kebab-case |
| **Validators** | `src/lib/validators/product.ts` | camelCase |

### 14.6 API Response Standards

| Endpoint | Response Shape | Pagination |
|----------|---------------|------------|
| `GET /api/products` | `{ success, data: Product[], meta: { total, page, pageSize } }` | Yes |
| `GET /api/products/:id` | `{ success, data: Product }` | No |
| `GET /api/products/search` | `{ success, data: Product[], meta: { total, query } }` | Yes |
| `GET /api/categories` | `{ success, data: Category[] }` | No |
| `GET /api/categories/:slug` | `{ success, data: Category }` | No |
| `GET /api/collections` | `{ success, data: Collection[] }` | No |
| `GET /api/collections/:slug` | `{ success, data: Collection }` | No |

### 14.7 Error Handling

| Error Code | HTTP Status | Message | When |
|-----------|-------------|---------|------|
| `PRODUCT_NOT_FOUND` | 404 | "Product not found" | Invalid product ID/slug |
| `PRODUCT_INACTIVE` | 410 | "Product is no longer available" | Inactive product |
| `CATEGORY_NOT_FOUND` | 404 | "Category not found" | Invalid category |
| `COLLECTION_NOT_FOUND` | 404 | "Collection not found" | Invalid collection |
| `INVALID_FILTER` | 400 | "Invalid filter parameters" | Bad filter input |
| `INVALID_SORT` | 400 | "Invalid sort option" | Bad sort parameter |
| `SEARCH_QUERY_REQUIRED` | 400 | "Search query is required" | Empty search |

### 14.8 Documentation Standards

| Artifact | Documentation Required |
|---------|----------------------|
| **New entity** | Schema definition, relationships, indexes |
| **New filter** | Filter type, options, behavior, accessibility |
| **New sort** | Sort field, direction, default, use case |
| **New collection type** | Type definition, rules, admin workflow |
| **New API endpoint** | Request/response schema, error codes |
| **New component** | Props, accessibility, responsive behavior |

---

## Appendix A: Entity Relationship Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    CATALOG ENTITY RELATIONSHIPS                   │
│                                                                  │
│  Category ──┐                                                   │
│             │ 1:N                                                │
│             ▼                                                    │
│  Brand ─────┤                                                    │
│             │ 1:N                                                │
│             ▼                                                    │
│  Product ───┼────────────────────────────┐                      │
│             │                            │                      │
│             │ 1:N                        │ M:N                  │
│             ▼                            ▼                      │
│  ProductVariant                  ProductCollection              │
│             │                            │                      │
│             │ 1:N                        │                      │
│             ▼                            │                      │
│  ProductImage                          Collection               │
│             │                                                    │
│             │ N:1                                                │
│             ▼                                                    │
│  Media                                                         │
│                                                                  │
│  Review ──── Product (N:1)                                     │
│  Wishlist ── ProductVariant (N:1)                               │
│  CartItem ── ProductVariant (N:1)                               │
│  OrderItem ─ ProductVariant (N:1)                               │
└─────────────────────────────────────────────────────────────────┘
```

## Appendix B: Query Patterns Reference

| Query Pattern | SQL/Prisma | Use Case |
|--------------|-----------|----------|
| **Active products** | `where: { status: 'published' }` | Public storefront |
| **Featured products** | `where: { status: 'published', isFeatured: true }` | Homepage |
| **New arrivals** | `where: { status: 'published', isNew: true }` | New section |
| **Products by category** | `where: { categoryId, status: 'published' }` | Category page |
| **Products by collection** | Via `ProductCollection` join | Collection page |
| **Products by brand** | `where: { brandId, status: 'published' }` | Brand page |
| **Search products** | `pg_trgm` similarity query | Search results |
| **Filter by price** | `where: { basePrice: { gte, lte } }` | Price filter |
| **Filter by size** | Via `variants` relation | Size filter |
| **Filter by color** | Via `variants` relation | Color filter |
| **Sort by price** | `orderBy: { basePrice: 'asc' }` | Price sort |
| **Sort by newest** | `orderBy: { createdAt: 'desc' }` | New sort |
| **Sort by popularity** | `orderBy: { totalSold: 'desc' }` | Popular sort |
| **Paginated** | `take: 24, skip: (page - 1) * 24` | Pagination |
| **Related products** | Same `categoryId` + similar tags | Product detail |
| **Cross-sell** | Admin-curated or complementary rules | Cart, product page |

## Appendix C: Implementation Checklist

For every new catalog feature, verify:

- [ ] Schema follows naming conventions
- [ ] All foreign keys indexed
- [ ] Soft delete (never hard delete)
- [ ] Status-controlled visibility
- [ ] Slug unique and URL-friendly
- [ ] Alt text on all images
- [ ] Meta title and description set
- [ ] Structured data included
- [ ] Breadcrumbs implemented
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Responsive on all breakpoints
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Empty states implemented
- [ ] Cache strategy defined
- [ ] API response follows standard format
- [ ] URL state sync (filters, sort, page)
- [ ] TypeScript types defined
- [ ] Tests written

---

**Document Version:** 1.0
**Last Updated:** August 03, 2026
**Next Review:** September 03, 2026
**Owner:** Product Catalog Architecture Team
