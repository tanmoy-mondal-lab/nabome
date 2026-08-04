# নবME (Nabome) — Storage Engine & Digital Asset Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for storage, media, and digital asset management  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0), and API_SERVICE_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Storage Philosophy](#1-storage-philosophy)
2. [Storage Providers & Responsibilities](#2-storage-providers--responsibilities)
3. [Folder Hierarchy](#3-folder-hierarchy)
4. [Asset Ownership Model](#4-asset-ownership-model)
5. [Parent-Child Relationships](#5-parent-child-relationships)
6. [Asset Types & Standards](#6-asset-types--standards)
7. [Asset Lifecycle](#7-asset-lifecycle)
8. [Naming Standards](#8-naming-standards)
9. [Metadata & Versioning](#9-metadata--versioning)
10. [Validation Standards](#10-validation-standards)
11. [Image Standards](#11-image-standards)
12. [Video Standards](#12-video-standards)
13. [Document Standards](#13-document-standards)
14. [Generated Files](#14-generated-files)
15. [Temporary & Cached Files](#15-temporary--cached-files)
16. [Upload Standards](#16-upload-standards)
17. [Asset Retrieval & Delivery](#17-asset-retrieval--delivery)
18. [Cleanup & Integrity](#18-cleanup--integrity)
19. [Security Standards](#19-security-standards)
20. [Performance Standards](#20-performance-standards)
21. [UX Standards](#21-ux-standards)
22. [Database Schema](#22-database-schema)
23. [API Design](#23-api-design)
24. [Hard Rules](#24-hard-rules)
25. [Soft Rules](#25-soft-rules)

---

## 1. Storage Philosophy

### 1.1 What

The foundational principles governing all digital asset storage, lifecycle management, and file operations for the Nabome platform.

### 1.2 Why

- **Zero Orphan Files:** Every file must have exactly one logical owner — no file exists without a parent
- **Automatic Lifecycle:** Assets are created, processed, optimized, served, and cleaned up automatically
- **Parent-Child Ownership:** The parent controls the lifecycle of its children — deleting a parent deletes or archives its children
- **No Duplicate Storage Logic:** One centralized Storage Engine handles all file operations — no per-feature storage code
- **Independence:** The Storage Engine is independent from business modules — it provides a service that modules consume

### 1.3 Where

Every file upload, download, transformation, and deletion across the entire platform.

### 1.4 Core Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **One owner, one lifecycle** | Every asset belongs to exactly one parent entity | Prevents orphan files, simplifies cleanup |
| **Database is the source of truth** | The `Media` table tracks every asset; storage is just bytes | Enables integrity checks, cleanup, re-processing |
| **Store metadata, not files** | Database stores URLs, dimensions, checksums — not binary data | Fast queries, auditability |
| **CDN-first delivery** | All assets served via Cloudflare CDN or Cloudinary CDN | Global performance |
| **Mobile-first optimization** | All images responsive; all videos optimized for mobile bandwidth | 70%+ mobile traffic |
| **Future cloud-ready** | Storage providers can be swapped without changing business logic | Provider independence |
| **No silent failures** | Every storage operation logs success and failure | Observability |

### 1.5 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Store files without a database record | Creates orphan files, impossible to track | Always create Media record first |
| Store files in code repository | Bloats repo, no versioning | Store in Cloudinary/R2 |
| Upload directly from client to storage | Bypasses validation and security | Upload via API handler |
| Hardcode storage URLs | Breaks when provider changes | Store path/key in database |
| Skip thumbnail generation | Slow page loads on mobile | Generate on upload |
| Store raw images without optimization | Bandwidth waste, slow loading | Auto-optimize on upload |
| Delete parent without cleaning children | Creates orphan files | Use cascade ownership rules |
| Store user-generated content without sanitization | XSS, malware risk | Validate and sanitize on upload |
| Mix public and private files in same folder | Security risk | Separate folders by access level |
| Use filename from user input | Path traversal, collisions | Generate UUID-based filenames |

---

## 2. Storage Providers & Responsibilities

### 2.1 What

Three storage providers handle different asset types, each chosen for specific strengths.

### 2.2 Why

- **Cloudinary:** Best-in-class image/video optimization, automatic format conversion, responsive transformations
- **Cloudflare R2:** S3-compatible object storage for documents, exports, and large files — zero egress fees
- **PostgreSQL:** Metadata, ownership, lifecycle tracking — the source of truth for all assets

### 2.3 Provider Assignment Matrix

| Provider | Asset Types | Use Cases | Why This Provider |
|----------|-------------|-----------|-------------------|
| **Cloudinary** | Images (JPEG, PNG, WebP, GIF, SVG) | Product photos, avatars, CMS media, banners, thumbnails | Auto-format, auto-quality, responsive srcSet, global CDN |
| **Cloudinary** | Videos (MP4, WebM) | Product videos, lookbook clips, tutorials | Transcoding, adaptive streaming, thumbnail extraction |
| **Cloudflare R2** | Documents (PDF, CSV, Excel) | Invoices, shipping labels, return labels, data exports | Zero egress fees, S3-compatible, large file support |
| **Cloudflare R2** | Backups & Archives | Database exports, audit logs, archived orders | Cost-effective, durable storage |
| **Cloudflare R2** | Generated files | Reports, bulk exports, analytics dumps | Temporary large file storage |
| **PostgreSQL** | Metadata | Media records, ownership, dimensions, checksums | Queryable, relational, indexed |

### 2.4 Provider Independence Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Wrap providers in services** | Never use Cloudinary/R2 SDK directly in handlers | Easy to swap providers |
| **Interface-based** | Services expose interfaces, not implementations | Testability, swappability |
| **Store paths in database** | Never hardcode CDN URLs | Provider-agnostic references |
| **No provider-specific logic in handlers** | All provider logic in `_lib/storage/` | Clean separation |
| **Configuration via env vars** | Provider keys in environment variables | Security, flexibility |

### 2.5 Service Locations

| Service | Location | Responsibility |
|---------|----------|----------------|
| **CloudinaryService** | `api/_lib/storage/cloudinary.ts` | Image/video upload, transformation, deletion |
| **R2Service** | `api/_lib/storage/r2.ts` | Document upload, download, deletion |
| **MediaService** | `api/_lib/storage/media.ts` | Orchestrates uploads, tracks metadata, manages lifecycle |
| **UploadService** | `api/_lib/storage/upload.ts` | Handles multipart uploads, validation, routing |

### 2.6 Service Interface Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE SERVICE ARCHITECTURE                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Handler Layer (Business Logic)               │   │
│  │  createProduct, updateAvatar, uploadCmsMedia, etc.        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              MediaService (Orchestration)                 │   │
│  │  upload(), delete(), getUrl(), getMetadata()              │   │
│  │  Routes to correct provider based on asset type           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│              ┌───────────┴───────────┐                          │
│              ▼                       ▼                          │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  CloudinaryService   │  │     R2Service         │            │
│  │  Images, Videos      │  │  Documents, Exports   │            │
│  └──────────────────────┘  └──────────────────────┘            │
│              │                       │                          │
│              ▼                       ▼                          │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │  Cloudinary CDN      │  │  Cloudflare R2 CDN    │            │
│  │  Global delivery     │  │  Zero egress fees     │            │
│  └──────────────────────┘  └──────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Folder Hierarchy

### 3.1 What

Standardized folder structure across all storage providers for organized, predictable file placement.

### 3.2 Why

- **Discoverability:** Developers know exactly where files are stored
- **Cleanup:** Easy to find and remove files by domain
- **Security:** Access controls can be applied per folder
- **Scalability:** Folders map to business domains
- **CDN optimization:** Folder-based cache invalidation

### 3.3 Cloudinary Folder Structure

```
nabome/
├── products/                          # Product-related media
│   └── {product-uuid}/               # One folder per product
│       ├── original/                  # Original uploaded images
│       ├── variants/                  # Generated responsive variants
│       └── videos/                    # Product videos
│
├── categories/                        # Category media
│   └── {category-uuid}/              # One folder per category
│       └── images/                    # Category banner/icon
│
├── collections/                       # Collection media
│   └── {collection-uuid}/            # One folder per collection
│       └── images/                    # Collection cover images
│
├── brands/                            # Brand media
│   └── {brand-uuid}/                 # One folder per brand
│       └── logos/                     # Brand logos
│
├── avatars/                           # User profile images
│   └── {user-uuid}/                  # One folder per user
│       └── avatar/                    # Profile picture
│
├── cms/                               # CMS content media
│   ├── slides/                        # Homepage slides
│   │   └── {slide-uuid}/            # One folder per slide
│   ├── pages/                         # CMS page images
│   │   └── {page-uuid}/             # One folder per page
│   └── blogs/                         # Blog post images
│       └── {blog-uuid}/             # One folder per blog
│
├── homepage/                          # Homepage assets
│   ├── banners/                       # Hero banners
│   ├── featured/                      # Featured product images
│   └── promotional/                   # Promotional graphics
│
├── lookbooks/                         # Lookbook media
│   └── {lookbook-uuid}/              # One folder per lookbook
│       └── images/                    # Lookbook images
│
├── size-guides/                       # Size guide media
│   └── {size-guide-uuid}/            # One folder per size guide
│       └── charts/                    # Size chart images
│
└── reviews/                           # Review media
    └── {review-uuid}/                # One folder per review
        └── images/                    # Review images
```

### 3.4 Cloudflare R2 Folder Structure

```
nabome-r2/
├── invoices/                          # Order invoices
│   └── {order-uuid}/                 # One folder per order
│       └── invoice.pdf                # Generated invoice
│
├── shipping-labels/                   # Shipping labels
│   └── {order-uuid}/                 # One folder per order
│       └── label.pdf                  # Generated shipping label
│
├── return-labels/                     # Return labels
│   └── {return-uuid}/                # One folder per return
│       └── label.pdf                  # Generated return label
│
├── exports/                           # Data exports
│   ├── products/                      # Product catalog exports
│   ├── orders/                        # Order data exports
│   ├── customers/                     # Customer data exports
│   └── analytics/                     # Analytics data exports
│
├── backups/                           # System backups
│   ├── database/                      # Database exports
│   └── audit-logs/                    # Audit log archives
│
└── temp/                              # Temporary files
    ├── uploads/                       # Processing staging area
    └── processing/                    # Files being processed
```

### 3.5 Folder Naming Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lowercase kebab-case** | `size-guides` not `SizeGuides` | URL-safe, consistent |
| **Plural nouns** | `products` not `product` | Contains multiple items |
| **UUID subfolders** | `{uuid}/` for entity isolation | Prevents collisions, easy cleanup |
| **Descriptive names** | `original/`, `variants/`, `thumbnails/` | Clear purpose |
| **No user input in paths** | Generated paths only | Security |
| **No nested beyond 3 levels** | `nabome/products/{uuid}/images/` max | Simplicity |

### 3.6 Folder Path Construction

```
// Pattern: nabome/{domain}/{entity-uuid}/{asset-type}/
// Example: nabome/products/550e8400-e29b-41d4-a716-446655440000/original/

// Cloudinary public_id construction:
const publicId = `nabome/${domain}/${entityId}/${assetType}/${filename}`;

// R2 key construction:
const key = `nabome/${domain}/${entityId}/${assetType}/${filename}`;
```

---

## 4. Asset Ownership Model

### 4.1 What

Every asset has exactly one logical owner — a parent entity that controls its lifecycle.

### 4.2 Why

- **Zero orphans:** Deleting the parent cleans up or archives its assets
- **Clear responsibility:** Business modules manage their own assets
- **Integrity:** References are always valid because cleanup is automatic
- **Auditability:** Every file traces back to its creator

### 4.3 Ownership Matrix

| Owner Entity | Asset Types | Storage Provider | Folder Path | Lifecycle Rule |
|-------------|-------------|------------------|-------------|----------------|
| **Product** | Product images, product videos | Cloudinary | `products/{uuid}/` | Cascade delete (soft delete parent = soft delete images) |
| **ProductVariant** | Variant-specific images | Cloudinary | `products/{product-uuid}/variants/{variant-uuid}/` | Cascade delete with product |
| **Category** | Category banner, icon | Cloudinary | `categories/{uuid}/` | SetNull (product can exist without category) |
| **Collection** | Collection cover images | Cloudinary | `collections/{uuid}/` | SetNull (product can exist without collection) |
| **Brand** | Brand logo | Cloudinary | `brands/{uuid}/` | SetNull (product can exist without brand) |
| **User (Profile)** | Avatar image | Cloudinary | `avatars/{uuid}/` | Cascade delete (user owns avatar) |
| **CmsSlide** | Slide image/video | Cloudinary | `cms/slides/{uuid}/` | Cascade delete (slide owns its media) |
| **CmsPage** | Page images | Cloudinary | `cms/pages/{uuid}/` | Cascade delete (page owns its media) |
| **CmsBlog** | Blog post images | Cloudinary | `cms/blogs/{uuid}/` | Cascade delete (blog owns its media) |
| **Homepage** | Hero banners, promotional | Cloudinary | `homepage/{type}/` | Admin-managed, manual cleanup |
| **Lookbook** | Lookbook images | Cloudinary | `lookbooks/{uuid}/` | Cascade delete |
| **SizeGuide** | Size chart images | Cloudinary | `size-guides/{uuid}/` | Cascade delete |
| **Review** | Review images | Cloudinary | `reviews/{uuid}/` | Restrict (never delete review with images unless user requests) |
| **Order** | Invoice PDF, shipping label | R2 | `invoices/{uuid}/`, `shipping-labels/{uuid}/` | Restrict (never delete order documents) |
| **Return** | Return label PDF | R2 | `return-labels/{uuid}/` | Restrict (compliance) |
| **AdminSetting** | System assets | Cloudinary/R2 | `admin/` | Admin-managed |
| **Export** | CSV/Excel exports | R2 | `exports/{type}/` | Auto-cleanup after 30 days |
| **AuditLog** | Archived audit logs | R2 | `backups/audit-logs/` | Retention: 7 years |

### 4.4 Ownership Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Exactly one owner** | Every Media record links to one parent entity | No ambiguity |
| **Owner controls lifecycle** | Parent's isActive controls asset visibility | Consistent behavior |
| **No cross-owner sharing** | An asset cannot belong to two parents | Prevents cascade conflicts |
| **Ownership transfer** | Not supported — create new asset, delete old | Simplicity |
| **Orphan detection** | Background job scans for Media without valid parent | Data integrity |
| **Ownership audit** | Log all ownership changes | Compliance |

### 4.5 Ownership Database Pattern

```prisma
// Media record with polymorphic ownership
model Media {
  id            String   @id @default(uuid())
  url           String                            // CDN URL
  publicId      String   @unique                  // Cloudinary/R2 key
  alt           String?                           // Alt text
  width         Int?                              // Image width
  height        Int?                              // Image height
  filesize      Int?                              // File size in bytes
  mimetype      String                            // MIME type
  checksum      String?                           // MD5/SHA256 for dedup
  folder        String   @db.VarChar(200)         // Storage folder
  entityType    String   @db.VarChar(50)           // Parent entity type
  entityId      String   @db.VarChar(36)           // Parent entity UUID
  isPublic      Boolean  @default(true)            // Access control
  isActive      Boolean  @default(true)            // Soft delete
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Indexes
  @@index([entityType, entityId])                  // Find assets by owner
  @@index([folder])                                // Folder-based queries
  @@index([isActive])                              // Active asset queries
  @@index([checksum])                              // Duplicate detection
  @@index([createdAt])                             // Time-based queries
}
```

---

## 5. Parent-Child Relationships

### 5.1 What

How parent entities control the lifecycle of their child assets through cascade rules.

### 5.2 Why

- **Data integrity:** No orphan files ever
- **Consistent behavior:** Same cascade rules for all asset types
- **Predictability:** Developers know exactly what happens on deletion
- **Compliance:** Financial documents are never accidentally deleted

### 5.3 Cascade Rules

| Parent Action | Child Asset Behavior | Rationale |
|---------------|---------------------|-----------|
| **Parent soft-deleted** (`isActive = false`) | Assets hidden from public, retained in storage | Reversible, no data loss |
| **Parent restored** (`isActive = true`) | Assets visible again | Undo accidental deletes |
| **Parent hard-deleted** (admin only) | Assets archived to R2, then deleted from Cloudinary | Compliance, storage cleanup |
| **Parent updated** | Assets unchanged unless replaced | Update doesn't affect existing files |
| **Owner entity type changes** | Not supported — create new asset | Simplicity |

### 5.4 Cascade Matrix

| Parent | Child | On Soft Delete | On Hard Delete | On Update |
|--------|-------|----------------|----------------|-----------|
| Product | ProductImage | Hide images | Archive to R2, delete from Cloudinary | Unchanged |
| Product | ProductVariant images | Hide with product | Archive to R2, delete from Cloudinary | Unchanged |
| Category | Category images | Hide images | SetNull (product can exist without category) | Unchanged |
| Collection | Collection images | Hide images | SetNull | Unchanged |
| Brand | Brand logo | Hide logo | SetNull | Unchanged |
| User | Avatar | Hide avatar | Delete from Cloudinary | Replace old on update |
| CmsSlide | Slide media | Hide media | Delete from Cloudinary | Replace old on update |
| CmsPage | Page images | Hide images | Delete from Cloudinary | Replace old on update |
| Order | Invoice PDF | Keep visible (compliance) | Never delete | Unchanged |
| Review | Review images | Hide with review | Delete from Cloudinary | Unchanged |

### 5.5 Cascade Implementation Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                    CASCADE LIFECYCLE FLOW                         │
│                                                                  │
│  1. Parent soft-deleted                                          │
│     → parent.isActive = false                                    │
│     → Media records unchanged                                    │
│     → Frontend filters by parent.isActive                        │
│     → Assets hidden from public view                             │
│                                                                  │
│  2. Parent restored                                              │
│     → parent.isActive = true                                     │
│     → Assets visible again                                       │
│     → No file operations needed                                  │
│                                                                  │
│  3. Parent hard-deleted (admin only)                             │
│     → Archive assets to R2 (if compliance required)              │
│     → Delete assets from Cloudinary/R2                           │
│     → Delete Media records from database                         │
│     → Log all operations for audit                               │
│                                                                  │
│  4. Parent updated                                               │
│     → Existing assets unchanged                                  │
│     → New assets created if replaced                             │
│     → Old assets deleted after new confirmed                     │
└─────────────────────────────────────────────────────────────────┘
```

### 5.6 Broken Reference Detection

| Scenario | Detection Method | Recovery Action |
|----------|-----------------|-----------------|
| Media record exists, file missing | Background integrity scan | Delete Media record, log warning |
| File exists, no Media record | Background orphan scan | Delete file, log warning |
| Media entity references deleted parent | FK constraint check | Delete Media record, log warning |
| CDN URL returns 404 | User report or monitoring | Regenerate from Media metadata |
| Checksum mismatch | Integrity verification | Flag for manual review |

---

## 6. Asset Types & Standards

### 6.1 Images

#### 6.1.1 Product Images

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Max files per product** | 8 images | Mobile UX, loading performance |
| **Max file size** | 10MB per image | Prevent abuse |
| **Allowed formats** | JPEG, PNG, WebP, GIF | Standard web formats |
| **Preferred format** | WebP (auto-converted by Cloudinary) | Best compression |
| **Max dimensions** | 4000x4000px | Prevent oversized uploads |
| **Min dimensions** | 400x400px | Ensure quality |
| **Aspect ratio** | 3:4 (portrait) for fashion | Industry standard |
| **Background** | White/transparent | Clean product display |
| **Thumbnail** | 200x200px auto-generated | Fast grid loading |
| **Responsive variants** | 400w, 600w, 800w, 1200w | Mobile-first delivery |

#### 6.1.2 User Avatars

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Max file size** | 5MB | Prevent abuse |
| **Allowed formats** | JPEG, PNG, WebP | Standard formats |
| **Max dimensions** | 2000x2000px | Prevent oversized |
| **Aspect ratio** | 1:1 (square) | Profile display |
| **Background** | Transparent | Versatile display |
| **Thumbnail** | 80x80px, 120x120px | Navigation, profile |
| **Auto-crop** | Center crop to square | Consistent display |

#### 6.1.3 CMS Media

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Max file size** | 10MB | Prevent abuse |
| **Allowed formats** | JPEG, PNG, WebP, SVG, GIF | Standard formats |
| **Max dimensions** | 4000x2000px | Banner images |
| **Hero banners** | 1920x1080px recommended | Desktop display |
| **Mobile banners** | 750x1334px recommended | Mobile display |
| **SVG** | Sanitized with DOMPurify | Vector graphics |

#### 6.1.4 Category & Collection Images

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Max file size** | 5MB | Prevent abuse |
| **Allowed formats** | JPEG, PNG, WebP | Standard formats |
| **Max dimensions** | 2000x2000px | Prevent oversized |
| **Aspect ratio** | 1:1 (square) for thumbnails | Grid display |
| **Banner ratio** | 16:9 for category banners | Display consistency |

#### 6.1.5 Brand Logos

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Max file size** | 2MB | Prevent abuse |
| **Allowed formats** | PNG, SVG, WebP | Logo formats |
| **Max dimensions** | 1000x1000px | Logo display |
| **Background** | Transparent preferred | Versatile display |
| **Minimum padding** | 10% of dimensions | Visual breathing room |

### 6.2 Videos

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Max file size** | 100MB | Prevent abuse |
| **Allowed formats** | MP4, WebM | Web video standards |
| **Max duration** | 60 seconds | Product videos, not long-form |
| **Max resolution** | 1920x1080 (1080p) | Mobile bandwidth |
| **Recommended resolution** | 720p | Balance quality and size |
| **Codec** | H.264 (MP4), VP9 (WebM) | Browser compatibility |
| **Thumbnail** | Auto-generated at 0s, 25%, 50%, 75% | Preview selection |
| **Poster image** | Required — first frame or custom | Fast initial render |
| **Lazy loading** | Always — load on interaction | Performance |
| **Autoplay** | Never autoplay with sound | UX best practice |

### 6.3 Documents

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Max file size** | 50MB | Prevent abuse |
| **Allowed formats** | PDF, CSV, XLSX | Standard document formats |
| **PDF version** | PDF/A-1a for compliance | Long-term archival |
| **Invoice format** | PDF with proper margins | Print-ready |
| **Export formats** | CSV (default), XLSX (optional) | Data portability |
| **Access control** | Private — signed URLs only | Security |
| **Retention** | 7 years for financial docs | Compliance |

### 6.4 Generated Files

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Invoices** | Generated on order confirmation | Financial compliance |
| **Shipping labels** | Generated on order shipped | Logistics |
| **Return labels** | Generated on return approved | Customer service |
| **Data exports** | Generated on-demand, auto-cleanup | Data portability |
| **Reports** | Generated on-demand, auto-cleanup | Analytics |
| **Retention** | 30 days for exports, 7 years for financial | Cost + compliance |

### 6.5 Temporary Files

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Upload staging** | R2 `temp/uploads/` | Processing buffer |
| **Processing** | R2 `temp/processing/` | Transformation workspace |
| **Retention** | 24 hours maximum | Automatic cleanup |
| **Cleanup** | Cron job every hour | Prevent storage bloat |
| **Access** | Server-only, no public URLs | Security |

### 6.6 Cached Files

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Cloudinary transforms** | Cached at edge automatically | CDN performance |
| **R2 responses** | Cloudflare CDN caching | Global delivery |
| **Cache headers** | `Cache-Control: public, max-age=31536000` for immutable assets | Long-term caching |
| **Cache invalidation** | On asset replacement | Fresh content |
| **ETag support** | Enabled for conditional requests | Bandwidth savings |

---

## 7. Asset Lifecycle

### 7.1 What

The complete lifecycle of a digital asset from creation to permanent deletion.

### 7.2 Why

- **Predictability:** Every asset follows the same lifecycle
- **Integrity:** No asset is lost or orphaned
- **Performance:** Assets are optimized at every stage
- **Compliance:** Financial assets retained per regulations

### 7.3 Lifecycle Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASSET LIFECYCLE                                │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ 1.CREATE │───▶│ 2.UPLOAD │───▶│3.VALIDATE│───▶│4.PROCESS │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │                                              │          │
│       │         ┌──────────┐    ┌──────────┐        │          │
│       │         │8.REPLACE │◀───│7.UPDATE  │◀───────┘          │
│       │         └──────────┘    └──────────┘    ┌──────────┐   │
│       │              │                           │5.OPTIMIZE│   │
│       │              │         ┌──────────┐     └──────────┘   │
│       │              └────────▶│12.DELETE │◀───┐               │
│       │                        └──────────┘    │  ┌──────────┐ │
│       │         ┌──────────┐                   └──│11.ARCHIVE│ │
│       └────────▶│ 6.SERVE  │                      └──────────┘ │
│                 └──────────┘         ┌──────────┐              │
│                                      │10.RETAIN │◀───(default) │
│                                      └──────────┘              │
│                                      ┌──────────┐              │
│                                      │9.THUMBNAIL│              │
│                                      └──────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Stage Details

#### Stage 1: Creation

| Step | Action | Implementation |
|------|--------|----------------|
| 1.1 | Client selects file(s) | Frontend file picker with accept filter |
| 1.2 | Client-side validation | File type, size, dimensions check |
| 1.3 | Request upload URL | `POST /api/upload/presign` |
| 1.4 | Server validates limits | Rate limit, user quota, storage capacity |
| 1.5 | Generate upload token | Temporary token for upload authorization |

#### Stage 2: Upload

| Step | Action | Implementation |
|------|--------|----------------|
| 2.1 | Client uploads to presigned URL | Direct to Cloudinary/R2 via presigned URL |
| 2.2 | Server receives file | Multipart upload handler |
| 2.3 | Generate filename | UUID-based, no user input |
| 2.4 | Determine storage path | Based on entity type and ID |
| 2.5 | Upload to provider | Cloudinary for images/video, R2 for documents |

#### Stage 3: Validation

| Step | Action | Implementation |
|------|--------|----------------|
| 3.1 | MIME type check | Validate against allowed types |
| 3.2 | File size check | Enforce per-type limits |
| 3.3 | Dimension check | Validate image/video dimensions |
| 3.4 | Content validation | Check for malware signatures (future) |
| 3.5 | Filename sanitization | Remove dangerous characters |

#### Stage 4: Processing

| Step | Action | Implementation |
|------|--------|----------------|
| 4.1 | Image optimization | Auto-format (WebP/AVIF), auto-quality |
| 4.2 | Thumbnail generation | Multiple sizes for responsive display |
| 4.3 | Video transcoding | Convert to web-optimized formats |
| 4.4 | Video thumbnail extraction | Generate preview thumbnails |
| 4.5 | Document validation | Verify PDF structure |

#### Stage 5: Optimization

| Step | Action | Implementation |
|------|--------|----------------|
| 5.1 | Responsive variants | Generate srcSet variants (400w, 600w, 800w, 1200w) |
| 5.2 | Blur-up placeholders | Generate tiny base64 placeholder |
| 5.3 | Metadata extraction | Read EXIF, dimensions, color profile |
| 5.4 | Checksum computation | MD5 for duplicate detection |
| 5.5 | Alt text suggestion | AI-generated alt text (future) |

#### Stage 6: Storage & Database Record

| Step | Action | Implementation |
|------|--------|----------------|
| 6.1 | Create Media record | Insert into `media` table with all metadata |
| 6.2 | Link to parent entity | Update parent's media reference |
| 6.3 | Generate CDN URL | Construct Cloudinary/R2 CDN URL |
| 6.4 | Cache URL in KV | Edge-cached for fast retrieval |
| 6.5 | Return to client | Upload response with asset details |

#### Stage 7: Serving (Retrieval)

| Step | Action | Implementation |
|------|--------|----------------|
| 7.1 | Client requests asset | Via CDN URL |
| 7.2 | CDN serves cached version | Edge delivery, <50ms |
| 7.3 | On cache miss | Cloudinary/R2 generates and caches |
| 7.4 | Responsive delivery | Browser selects appropriate srcSet variant |
| 7.5 | Lazy loading | Client loads only visible images |

#### Stage 8: Update/Replacement

| Step | Action | Implementation |
|------|--------|----------------|
| 8.1 | Client uploads replacement | Same as initial upload |
| 8.2 | Server processes new asset | Stages 3-5 |
| 8.3 | Update Media record | New URL, dimensions, checksum |
| 8.4 | Delete old asset | From Cloudinary/R2 |
| 8.5 | Invalidate CDN cache | Purge old cached versions |

#### Stage 9: Thumbnail Generation

| Step | Action | Implementation |
|------|--------|----------------|
| 9.1 | Auto-generate on upload | Multiple sizes: 80px, 120px, 200px, 400px |
| 9.2 | Store as variants | Cloudinary transforms, not separate files |
| 9.3 | Lazy generate on demand | For rarely accessed sizes |
| 9.4 | Cache generated thumbnails | CDN caching |

#### Stage 10: Retention

| Step | Action | Implementation |
|------|--------|----------------|
| 10.1 | Financial documents | Retain for 7 years (invoices, receipts) |
| 10.2 | Audit logs | Retain for 7 years |
| 10.3 | User content | Retain while user account active |
| 10.4 | CMS content | Retain indefinitely |
| 10.5 | Exports | Auto-delete after 30 days |

#### Stage 11: Archiving

| Step | Action | Implementation |
|------|--------|----------------|
| 11.1 | Move to R2 archive | For compliance-required assets |
| 11.2 | Update Media record | Mark as archived, new R2 key |
| 11.3 | Delete from Cloudinary | Remove active CDN copy |
| 11.4 | Generate signed URL | For archive retrieval |

#### Stage 12: Permanent Deletion

| Step | Action | Implementation |
|------|--------|----------------|
| 12.1 | Verify deletion is allowed | Check retention policy, compliance |
| 12.2 | Delete from Cloudinary | Remove CDN copy |
| 12.3 | Delete from R2 | Remove document copy |
| 12.4 | Delete Media record | Remove database record |
| 12.5 | Log deletion | Audit trail entry |
| 12.6 | Verify deletion | Confirm file no longer accessible |

### 7.5 Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never skip validation** | Every upload validated | Security |
| **Never skip optimization** | Every image optimized | Performance |
| **Always create DB record** | Before or during upload | Tracking |
| **Always log operations** | Success and failure | Observability |
| **Always verify deletion** | Confirm file removed | Integrity |
| **Never hard delete without archiving** | Financial/compliance assets | Legal requirement |
| **Background processing** | Heavy operations async | Request performance |
| **Idempotent operations** | Safe to retry any stage | Network resilience |

---

## 8. Naming Standards

### 8.1 What

Standardized naming for files, folders, and storage paths.

### 8.2 Why

- **Consistency:** Same naming patterns everywhere
- **Security:** No user-controlled filenames
- **Collision prevention:** UUID-based naming
- **Discoverability:** Predictable paths

### 8.3 File Naming Rules

| Rule | Standard | Example | Rationale |
|------|----------|---------|-----------|
| **UUID-based** | `{uuid}.{ext}` | `550e8400-e29b-41d4-a716-446655440000.jpg` | No collisions |
| **Original name preserved** | In Media metadata only | Not in filename | Security |
| **Lowercase extension** | `.jpg` not `.JPEG` | Consistent | URL-safe |
| **No spaces** | Use hyphens if needed | `hero-banner.webp` | URL-safe |
| **No special characters** | Alphanumeric, hyphens, underscores only | Safe for all systems | Security |
| **Descriptive for public** | Optional slug prefix | `product-550e8400.jpg` | Human-readable |

### 8.4 Path Naming Rules

| Rule | Standard | Example | Rationale |
|------|----------|---------|-----------|
| **Lowercase kebab-case** | Folder and file names | `size-guides/` | URL-safe |
| **Plural nouns** | Folders contain multiple items | `products/` | Convention |
| **Entity type prefix** | Domain separation | `products/`, `cms/` | Organization |
| **UUID entity folders** | Isolation per entity | `products/{uuid}/` | No collisions |
| **Asset type subfolder** | Organized within entity | `products/{uuid}/original/` | Clarity |

### 8.5 CDN URL Naming

| Pattern | Example | Use Case |
|---------|---------|----------|
| **Cloudinary optimized** | `https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_800/products/{uuid}/image.jpg` | Image delivery |
| **Cloudinary thumbnail** | `https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_200/products/{uuid}/image.jpg` | Thumbnail |
| **R2 direct** | `https://pub-{hash}.r2.dev/invoices/{uuid}/invoice.pdf` | Document delivery |
| **R2 signed** | `https://pub-{hash}.r2.dev/{key}?X-Amz-Signature=...` | Private document access |

### 8.6 What NOT to Name

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| User-provided filename | Path traversal, XSS | UUID-based |
| Sequential numbers | Predictable, enumerable | UUID v4 |
| Timestamps as names | Collision risk | UUID + timestamp in metadata |
| Business names | Changes, collisions | UUID-based |
| Sensitive info in paths | Information disclosure | Generic paths |

---

## 9. Metadata & Versioning

### 9.1 What

Standards for tracking asset metadata, versions, and history.

### 9.2 Why

- **Auditability:** Track who uploaded what and when
- **Integrity:** Verify files haven't been corrupted
- **Performance:** Metadata enables fast queries without file inspection
- **Optimization:** Metadata drives responsive delivery decisions

### 9.3 Required Metadata Fields

| Field | Type | Source | Purpose |
|-------|------|--------|---------|
| `id` | UUID | System | Unique identifier |
| `url` | String | Provider | CDN delivery URL |
| `publicId` | String | Provider | Provider key for transformations |
| `alt` | String? | User/Generated | Accessibility, SEO |
| `width` | Int? | Extracted | Responsive delivery decisions |
| `height` | Int? | Extracted | Responsive delivery decisions |
| `filesize` | Int? | Extracted | Display, validation |
| `mimetype` | String | Detected | Type validation |
| `checksum` | String? | Computed | Duplicate detection, integrity |
| `folder` | String | Constructed | Organization |
| `entityType` | String | Constructed | Ownership tracking |
| `entityId` | String | Constructed | Ownership tracking |
| `isPublic` | Boolean | Configured | Access control |
| `isActive` | Boolean | System | Soft delete |
| `createdAt` | DateTime | System | Audit trail |
| `updatedAt` | DateTime | System | Audit trail |

### 9.4 Optional Metadata Fields

| Field | Type | Source | Purpose |
|-------|------|--------|---------|
| `originalFilename` | String? | User | Display, debugging |
| `uploadedBy` | String? | System | Accountability |
| `processingStatus` | Enum | System | Track async processing |
| `variants` | JSON? | Generated | Responsive variant URLs |
| `blurHash` | String? | Generated | Placeholder display |
| `dominantColor` | String? | Extracted | UI color matching |
| `exifData` | JSON? | Extracted | Camera info (stripped for security) |
| `version` | Int | System | Version tracking |
| `replacedBy` | String? | System | Previous version reference |

### 9.5 Versioning Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Version increment on replace** | `version: version + 1` | Track changes |
| **Keep previous versions** | Soft delete old versions | Recovery, audit |
| **URL changes on version** | New URL for new version | CDN cache invalidation |
| **No in-place updates** | Always create new, delete old | Prevent partial updates |
| **Version history** | Log all version changes | Audit trail |

### 9.6 Checksum Standards

| Algorithm | Use Case | Rationale |
|-----------|----------|-----------|
| **MD5** | Duplicate detection | Fast, sufficient for dedup |
| **SHA-256** | Integrity verification | Cryptographic security |
| **Perceptual hash** | Visual duplicate detection | Find similar images (future) |

### 9.7 Duplicate Detection

| Method | When | Action |
|--------|------|--------|
| **Exact match (checksum)** | On upload | Return existing Media record, skip upload |
| **Visual similarity** | On upload (future) | Warn user of potential duplicate |
| **Filename match** | Never | Don't rely on user filenames |

---

## 10. Validation Standards

### 10.1 What

Comprehensive validation for all uploaded files at client and server levels.

### 10.2 Why

- **Security:** Prevent malware, XSS, path traversal
- **Performance:** Reject invalid files early
- **Data integrity:** Ensure files meet display requirements
- **User experience:** Clear error messages for invalid uploads

### 10.3 Client-Side Validation

| Check | Standard | Implementation |
|-------|----------|----------------|
| **File type** | Check `file.type` against allowlist | `<input accept="image/*">` + JS check |
| **File size** | Check `file.size` against limit | Before upload |
| **Image dimensions** | Check via `Image()` constructor | Before upload |
| **Preview** | Show preview before upload | `URL.createObjectURL()` |
| **Drag & drop** | Support drag-and-drop | `ondrop` handler |

### 10.4 Server-Side Validation

| Check | Standard | Implementation |
|-------|----------|----------------|
| **MIME type** | Validate `Content-Type` header + file magic bytes | Double verification |
| **File size** | Enforce per-type limits | Before storage |
| **Image dimensions** | Read with image library | Before processing |
| **File extension** | Validate against allowlist | Security |
| **Filename sanitization** | Remove special characters | Path traversal prevention |
| **Content scanning** | Malware signature check (future) | Security |
| **EXIF stripping** | Remove metadata from images | Privacy, security |

### 10.5 Validation Error Responses

```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_VALIDATION_ERROR",
    "message": "File validation failed",
    "details": {
      "file": ["File size exceeds 10MB limit"],
      "type": ["Only JPEG, PNG, WebP, GIF formats are allowed"],
      "dimensions": ["Image must be at least 400x400 pixels"]
    }
  }
}
```

### 10.6 Validation Rules by Asset Type

| Asset Type | Max Size | Allowed Types | Min Dimensions | Max Dimensions |
|------------|----------|---------------|----------------|----------------|
| **Product image** | 10MB | JPEG, PNG, WebP, GIF | 400x400px | 4000x4000px |
| **Avatar** | 5MB | JPEG, PNG, WebP | 100x100px | 2000x2000px |
| **CMS image** | 10MB | JPEG, PNG, WebP, SVG, GIF | None | 4000x2000px |
| **Category image** | 5MB | JPEG, PNG, WebP | 200x200px | 2000x2000px |
| **Brand logo** | 2MB | PNG, SVG, WebP | None | 1000x1000px |
| **Video** | 100MB | MP4, WebM | 320x240px | 1920x1080px |
| **Invoice PDF** | 5MB | PDF | None | None |
| **Data export** | 50MB | CSV, XLSX | None | None |

---

## 11. Image Standards

### 11.1 What

Complete standards for image optimization, delivery, and responsive handling.

### 11.2 Why

- **Performance:** Optimized images load faster on mobile
- **Quality:** Consistent visual quality across devices
- **Bandwidth:** Auto-format conversion saves data
- **Accessibility:** Proper alt text and ARIA attributes

### 11.3 Cloudinary Transformation Parameters

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `f_auto` | Auto-format | Serve WebP/AVIF to capable browsers |
| `q_auto` | Auto-quality | Optimize quality vs file size |
| `w_{size}` | Responsive width | Multiple viewport sizes |
| `c_fill` | Crop mode | Maintain aspect ratio |
| `g_auto` | Gravity auto | Smart crop positioning |
| `fl_progressive` | Progressive JPEG | Better perceived loading |

### 11.4 Responsive Image Strategy

```html
<!-- Product image with responsive srcSet -->
<img
  src="https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_800/products/{uuid}/image.jpg"
  srcset="
    https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_400/products/{uuid}/image.jpg 400w,
    https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_600/products/{uuid}/image.jpg 600w,
    https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_800/products/{uuid}/image.jpg 800w,
    https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_1200/products/{uuid}/image.jpg 1200w
  "
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Product name description"
  loading="lazy"
  decoding="async"
  width="800"
  height="1067"
/>

<!-- Avatar with fixed size -->
<img
  src="https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto,w_120,c_fill,g_face/avatars/{uuid}/avatar.jpg"
  alt="User name"
  width="120"
  height="120"
  loading="lazy"
/>

<!-- Blur-up placeholder pattern -->
<img
  src={blurHashPlaceholder}
  data-src={fullImageUrl}
  alt={altText}
  width={width}
  height={height}
  loading="lazy"
  className="blur-up"
/>
```

### 11.5 Image Optimization Checklist

| Step | Action | Benefit |
|------|--------|---------|
| 1 | Auto-format conversion (WebP/AVIF) | 25-50% smaller files |
| 2 | Auto-quality optimization | 15-30% smaller files |
| 3 | Responsive variants | Right size for each device |
| 4 | Lazy loading | Faster initial page load |
| 5 | Blur-up placeholder | Better perceived performance |
| 6 | Width/height attributes | Prevent layout shift (CLS) |
| 7 | Progressive loading | Better perceived performance |
| 8 | Stripped EXIF data | Privacy, smaller files |

---

## 12. Video Standards

### 12.1 What

Standards for video upload, processing, and delivery.

### 12.2 Why

- **Performance:** Optimized for mobile bandwidth
- **UX:** Smooth playback across devices
- **Storage:** Efficient encoding reduces storage costs

### 12.3 Video Processing Pipeline

| Step | Action | Implementation |
|------|--------|----------------|
| 1 | Upload to Cloudinary | Raw video upload |
| 2 | Transcode to H.264 | Browser compatibility |
| 3 | Generate adaptive bitrate | Multiple quality levels |
| 4 | Extract thumbnails | At 0%, 25%, 50%, 75% |
| 5 | Generate poster image | First frame or custom |
| 6 | Create preview GIF | Short animated preview |

### 12.4 Video Delivery Strategy

| Quality | Resolution | Bitrate | Use Case |
|---------|-----------|---------|----------|
| **Low** | 360p | 500kbps | Slow connections |
| **Medium** | 480p | 1Mbps | Default mobile |
| **High** | 720p | 2.5Mbps | WiFi, desktop |
| **Full HD** | 1080p | 5Mbps | Premium quality |

### 12.5 Video Player Standards

| Requirement | Standard | Rationale |
|-------------|----------|-----------|
| **Lazy load** | Never autoplay | Performance |
| **Poster image** | Required | Fast initial render |
| **Controls** | Custom styled | Brand consistency |
| **Responsive** | Fluid width | Mobile-first |
| **Preload** | `metadata` only | Bandwidth savings |
| **Playback** | Single instance | Prevent CPU overload |

---

## 13. Document Standards

### 13.1 What

Standards for document storage, generation, and retrieval.

### 13.2 Why

- **Compliance:** Financial documents must be preserved
- **Security:** Documents contain sensitive data
- **Accessibility:** Documents must be downloadable

### 13.3 Document Types

| Type | Format | Generation | Retention | Access |
|------|--------|------------|-----------|--------|
| **Invoice** | PDF | On order confirmation | 7 years | Signed URL, customer + admin |
| **Shipping label** | PDF | On order shipped | 3 years | Signed URL, admin only |
| **Return label** | PDF | On return approved | 3 years | Signed URL, customer |
| **Receipt** | PDF | On payment captured | 7 years | Signed URL, customer |
| **Product catalog** | CSV/XLSX | On-demand export | 30 days | Signed URL, admin only |
| **Order export** | CSV/XLSX | On-demand export | 30 days | Signed URL, admin only |
| **Customer export** | CSV/XLSX | On-demand export | 30 days | Signed URL, admin only |
| **Audit log archive** | CSV | Monthly archive | 7 years | R2, admin only |

### 13.4 Document Generation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Generate on-demand** | Don't pre-generate all documents | Storage efficiency |
| **Cache generated** | Store in R2 after generation | Avoid re-generation |
| **Signed URLs** | Time-limited access tokens | Security |
| **No public URLs** | All documents private | Security |
| **Version tracking** | Update document version on regenerate | Consistency |

---

## 14. Generated Files

### 14.1 What

Standards for files generated by the system (not uploaded by users).

### 14.2 Why

- **Automation:** Generated files are part of business processes
- **Compliance:** Financial documents must be preserved
- **Performance:** Generated files should be cached

### 14.3 Generation Patterns

| Pattern | Trigger | Storage | Cleanup |
|---------|---------|---------|---------|
| **Invoice** | Order confirmed | R2 `invoices/{order-uuid}/` | Never (compliance) |
| **Shipping label** | Order shipped | R2 `shipping-labels/{order-uuid}/` | Never (compliance) |
| **Return label** | Return approved | R2 `return-labels/{return-uuid}/` | Never (compliance) |
| **Product export** | Admin request | R2 `exports/products/` | After 30 days |
| **Order export** | Admin request | R2 `exports/orders/` | After 30 days |
| **Customer export** | Admin request | R2 `exports/customers/` | After 30 days |
| **Analytics report** | Admin request | R2 `exports/analytics/` | After 30 days |
| **Database backup** | Scheduled | R2 `backups/database/` | After 30 days |

### 14.4 Generation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Async generation** | Don't block request | Performance |
| **Progress tracking** | Return job ID for polling | UX |
| **Error recovery** | Retry failed generations | Reliability |
| **Idempotent** | Same input = same output | Prevent duplicates |
| **Cleanup automation** | Auto-delete expired files | Storage management |

---

## 15. Temporary & Cached Files

### 15.1 What

Standards for temporary files and cached assets.

### 15.2 Why

- **Performance:** Temp files speed up processing
- **Storage management:** Automatic cleanup prevents bloat
- **Security:** Temp files not publicly accessible

### 15.3 Temporary File Locations

| Location | Purpose | Retention | Cleanup |
|----------|---------|-----------|---------|
| `temp/uploads/` | Upload staging | 1 hour | Hourly cron |
| `temp/processing/` | Processing workspace | 24 hours | Hourly cron |
| `temp/exports/` | Export generation | 24 hours | Hourly cron |

### 15.4 Cached Asset Strategy

| Asset Type | Cache Layer | TTL | Invalidation |
|------------|-------------|-----|--------------|
| **Cloudinary images** | Cloudflare CDN | 1 year | On replacement |
| **R2 documents** | Cloudflare CDN | 1 hour | On regeneration |
| **Media URLs (KV)** | Cloudflare KV | 24 hours | On update |
| **Blur placeholders** | Inline base64 | Never | N/A |

### 15.5 Cleanup Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Hourly cleanup** | Cron job every hour | Prevent storage bloat |
| **Max temp size** | 1GB total | Storage limit |
| **Log cleanup operations** | Track what was cleaned | Observability |
| **Never clean active files** | Check references before delete | Safety |

---

## 16. Upload Standards

### 16.1 What

Complete upload flow standards from client to storage.

### 16.2 Why

- **Security:** Validated, authorized uploads only
- **Performance:** Optimized for mobile connections
- **UX:** Progress feedback, retry support

### 16.3 Upload Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    UPLOAD FLOW                                    │
│                                                                  │
│  1. Client selects file(s)                                       │
│     → File picker with accept filter                             │
│     → Client-side validation (type, size, dimensions)            │
│                                                                  │
│  2. Client requests upload token                                 │
│     → POST /api/upload/presign                                  │
│     → Server validates: auth, rate limit, quota                  │
│     → Server returns: presigned URL + upload token               │
│                                                                  │
│  3. Client uploads directly to provider                         │
│     → PUT to presigned URL (Cloudinary/R2)                       │
│     → Progress events for UI feedback                            │
│     → Retry on network failure                                   │
│                                                                  │
│  4. Provider processes file                                      │
│     → Cloudinary: auto-format, auto-quality, resize              │
│     → R2: direct storage                                         │
│                                                                  │
│  5. Provider returns result                                      │
│     → Cloudinary: URL, dimensions, format                        │
│     → R2: key, etag                                              │
│                                                                  │
│  6. Server creates Media record                                  │
│     → Insert into media table                                    │
│     → Link to parent entity                                      │
│     → Generate CDN URL                                           │
│                                                                  │
│  7. Server returns to client                                     │
│     → Media record with CDN URL                                  │
│     → Frontend updates UI                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 16.4 Upload Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/upload/presign` | POST | Get presigned upload URL | Required |
| `/api/upload/image` | POST | Direct image upload (small files) | Required |
| `/api/upload/video` | POST | Video upload initiation | Required |
| `/api/upload/document` | POST | Document upload | Required |
| `/api/upload/status` | GET | Check upload/processing status | Required |
| `/api/upload/{id}` | DELETE | Cancel/delete upload | Required |

### 16.5 Upload Rate Limits

| Endpoint | Limit | Window | Rationale |
|----------|-------|--------|-----------|
| `/api/upload/presign` | 10 requests | 1 minute | Prevent token farming |
| `/api/upload/image` | 5 requests | 1 minute | Prevent abuse |
| `/api/upload/video` | 2 requests | 1 minute | Large file prevention |
| `/api/upload/document` | 5 requests | 1 minute | Normal usage |

### 16.6 Upload Error Handling

| Error | Status | Message | Recovery |
|-------|--------|---------|----------|
| `FILE_TOO_LARGE` | 400 | File exceeds size limit | Reduce file size |
| `INVALID_TYPE` | 400 | File type not allowed | Use allowed format |
| `DIMENSIONS_TOO_SMALL` | 400 | Image too small | Use larger image |
| `DIMENSIONS_TOO_LARGE` | 400 | Image too large | Use smaller image |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many uploads | Wait and retry |
| `QUOTA_EXCEEDED` | 429 | Storage quota reached | Delete old files |
| `UPLOAD_FAILED` | 500 | Upload failed | Retry upload |
| `PROCESSING_FAILED` | 500 | Processing failed | Retry or contact support |

---

## 17. Asset Retrieval & Delivery

### 17.1 What

Standards for serving assets to end users with optimal performance.

### 17.2 Why

- **Performance:** Fast asset delivery improves page load
- **CDN:** Global edge delivery for all users
- **Security:** Signed URLs for private content
- **Accessibility:** Proper alt text and ARIA attributes

### 17.3 Delivery Strategy

| Content Type | Provider | CDN | Cache Policy |
|-------------|----------|-----|--------------|
| **Public images** | Cloudinary | Cloudflare CDN | `public, max-age=31536000, immutable` |
| **Public videos** | Cloudinary | Cloudflare CDN | `public, max-age=3600` |
| **Private documents** | R2 | Signed URLs | `private, no-cache` |
| **Temp files** | R2 | Signed URLs | `private, max-age=300` |

### 17.4 URL Construction

```typescript
// Cloudinary image URL
const imageUrl = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;

// Cloudinary video URL
const videoUrl = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/video/upload/${publicId}`;

// R2 signed URL (for private documents)
const signedUrl = await r2.getSignedUrl(key, { expiresIn: 3600 });
```

### 17.5 Cache Headers

| Asset Type | Cache-Control | ETag | Immutable |
|------------|---------------|------|-----------|
| **Product images** | `public, max-age=31536000, immutable` | Yes | Yes |
| **Avatar images** | `public, max-age=86400` | Yes | No |
| **CMS images** | `public, max-age=3600` | Yes | No |
| **Documents** | `private, no-cache` | No | No |
| **Exports** | `private, max-age=300` | No | No |

---

## 18. Cleanup & Integrity

### 18.1 What

Standards for maintaining storage integrity, detecting orphans, and cleaning up unused assets.

### 18.2 Why

- **Zero orphans:** No file exists without a parent
- **Storage efficiency:** Unused files are cleaned up
- **Data integrity:** Broken references are detected and fixed
- **Compliance:** Financial documents are preserved

### 18.3 Integrity Checks

| Check | Frequency | Method | Action on Failure |
|-------|-----------|--------|-------------------|
| **Orphan files** | Daily | Scan storage for files without DB records | Delete orphan files |
| **Missing files** | Daily | Scan DB records for files not in storage | Delete DB records |
| **Broken references** | Daily | Verify all FK references are valid | Log warning, fix references |
| **Checksum verification** | On access | Compare stored checksum with file | Flag for review |
| **Duplicate detection** | On upload | Compare checksums | Return existing record |
| **CDN URL validation** | On access | Check URL returns 200 | Regenerate URL |

### 18.4 Cleanup Jobs

| Job | Schedule | Action | Safety |
|-----|----------|--------|--------|
| **Orphan cleanup** | Daily 2am | Delete files without DB records | Dry-run first |
| **Missing file cleanup** | Daily 2am | Delete DB records for missing files | Log only |
| **Temp file cleanup** | Hourly | Delete files in temp/ older than 24h | Skip active uploads |
| **Export cleanup** | Daily 2am | Delete exports older than 30 days | Log only |
| **Version cleanup** | Weekly | Soft-delete old versions > 90 days | Keep latest 5 versions |

### 18.5 Cleanup Safety Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Dry-run first** | Log what would be deleted before deleting | Safety |
| **Never delete financial docs** | Invoices, receipts excluded from cleanup | Compliance |
| **Never delete active assets** | Check isActive before deletion | Safety |
| **Log all deletions** | Audit trail for cleanup operations | Observability |
| **Manual override** | Admin can pause cleanup jobs | Safety |
| **Rollback capability** | Keep deleted files for 7 days before permanent removal | Recovery |

### 18.6 Missing File Recovery

| Scenario | Detection | Recovery |
|----------|-----------|----------|
| **CDN 404** | User report or monitoring | Regenerate from Media metadata |
| **File corrupted** | Checksum mismatch | Re-upload from backup |
| **Provider outage** | Health check failure | Serve from backup provider |
| **Accidental deletion** | Integrity scan | Restore from 7-day backup |

---

## 19. Security Standards

### 19.1 What

Security standards for all file operations.

### 19.2 Why

- **Data protection:** Prevent unauthorized access
- **Malware prevention:** Block malicious uploads
- **Privacy:** Protect user data in files
- **Compliance:** Meet security requirements

### 19.3 Upload Security

| Control | Standard | Implementation |
|---------|----------|----------------|
| **Authentication** | All uploads require auth | Session-based auth |
| **Authorization** | Role-based upload permissions | Admin: all, Customer: own |
| **Rate limiting** | Per-user upload limits | KV-based rate limiter |
| **File validation** | MIME type + magic bytes | Double verification |
| **Size limits** | Per-type file size limits | Server-side enforcement |
| **Filename sanitization** | Remove special characters | Path traversal prevention |
| **EXIF stripping** | Remove metadata from images | Privacy protection |

### 19.4 Access Control

| Access Level | Who | How | Use Case |
|-------------|-----|-----|----------|
| **Public** | Anyone | Direct CDN URL | Product images, avatars |
| **Authenticated** | Logged-in users | Session auth + CDN | User's own files |
| **Admin only** | Admin role | Admin auth + signed URL | Internal documents |
| **Private** | Nobody (server only) | Server-side access | Temp files, backups |
| **Time-limited** | Specific user | Signed URL with expiry | Document downloads |

### 19.5 Signed URL Standards

| Property | Standard | Rationale |
|----------|----------|-----------|
| **Expiry** | 1 hour default | Limit exposure |
| **IP restriction** | Optional | Extra security |
| **Download limit** | Optional | Prevent sharing |
| **Path restriction** | Match specific file | Prevent traversal |

### 19.6 Malware Prevention

| Layer | Standard | Implementation |
|-------|----------|----------------|
| **File type** | Strict allowlist | MIME validation |
| **File content** | Signature scanning | Future: ClamAV integration |
| **File size** | Per-type limits | Prevent zip bombs |
| **Filename** | Sanitized | Path traversal prevention |
| **Upload source** | Authorized only | Auth + CSRF protection |

### 19.7 Path Traversal Prevention

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No user-controlled paths** | Server generates all paths | Prevent traversal |
| **UUID filenames** | No user filenames in storage | Prevent traversal |
| **Normalize paths** | Resolve `..` and `.` | Prevent traversal |
| **Validate folder** | Whitelist allowed folders | Prevent traversal |
| **No symlinks** | Don't follow symlinks | Prevent traversal |

---

## 20. Performance Standards

### 20.1 What

Performance standards for storage operations and asset delivery.

### 20.2 Why

- **Page load:** Fast asset delivery improves LCP
- **Mobile:** Optimized for 70%+ mobile traffic
- **Bandwidth:** Reduce data transfer costs
- **UX:** Perceived performance with placeholders

### 20.3 Performance Targets

| Metric | Target | Implementation |
|--------|--------|----------------|
| **Image upload** | < 3 seconds | Direct provider upload |
| **Image processing** | < 5 seconds | Cloudinary async processing |
| **CDN delivery** | < 100ms | Edge caching |
| **Thumbnail generation** | < 1 second | On-demand, cached |
| **Document generation** | < 10 seconds | Async with progress |
| **Largest Contentful Paint** | < 2.5 seconds | Responsive images |
| **Cumulative Layout Shift** | < 0.1 | Width/height attributes |

### 20.4 Lazy Loading Strategy

| Element | Strategy | Implementation |
|---------|----------|----------------|
| **Below-fold images** | `loading="lazy"` | Native lazy loading |
| **Hero images** | Eager load | Above the fold |
| **Thumbnails** | `loading="lazy"` | Grid views |
| **Videos** | Load on interaction | Poster image first |
| **Documents** | Load on click | Never auto-load |

### 20.5 Responsive Image Strategy

| Viewport | Width | Quality | Format |
|----------|-------|---------|--------|
| **Mobile** | 400px | 75% | WebP/AVIF |
| **Tablet** | 600px | 80% | WebP/AVIF |
| **Desktop** | 800px | 85% | WebP/AVIF |
| **Wide** | 1200px | 85% | WebP/AVIF |

---

## 21. UX Standards

### 21.1 What

User experience standards for file upload and media management.

### 21.2 Why

- **Conversion:** Smooth upload flow increases seller adoption
- **Retention:** Good UX keeps users engaged
- **Support:** Clear error messages reduce support tickets

### 21.3 Upload UX

| Element | Standard | Implementation |
|---------|----------|----------------|
| **File picker** | Drag-and-drop + click | Dual input method |
| **Progress bar** | Real-time upload progress | XHR progress events |
| **Preview** | Show before upload | `URL.createObjectURL()` |
| **Validation messages** | Clear, friendly errors | "Image must be at least 400x400 pixels" |
| **Retry** | One-click retry on failure | Automatic + manual retry |
| **Multi-upload** | Select multiple files | `multiple` attribute |
| **Queue management** | Show upload queue | Visual queue with status |
| **Cancel** | Cancel individual uploads | Abort controller |

### 21.4 Media Management UX

| Element | Standard | Implementation |
|---------|----------|----------------|
| **Grid view** | Visual thumbnail grid | For admin media library |
| **List view** | Detailed file list | For admin media library |
| **Search** | Search by name, type, date | Filter functionality |
| **Bulk actions** | Select multiple, delete, move | Checkbox selection |
| **Drag reorder** | Reorder product images | Drag and drop |
| **Delete confirmation** | Confirm before delete | Modal dialog |
| **Empty state** | Helpful empty messages | "No images uploaded yet" |

### 21.5 Error Messages

| Error | User-Friendly Message |
|-------|----------------------|
| `FILE_TOO_LARGE` | "Image is too large. Maximum size is 10MB." |
| `INVALID_TYPE` | "File type not supported. Please use JPEG, PNG, or WebP." |
| `DIMENSIONS_TOO_SMALL` | "Image is too small. Minimum size is 400x400 pixels." |
| `UPLOAD_FAILED` | "Upload failed. Please check your connection and try again." |
| `RATE_LIMIT_EXCEEDED` | "Too many uploads. Please wait a moment and try again." |

---

## 22. Database Schema

### 22.1 What

Complete database schema for the Media model and related tables.

### 22.2 Media Model

```prisma
model Media {
  id              String    @id @default(uuid())
  url             String
  publicId        String    @unique
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
  isActive        Boolean   @default(true)
  uploadedBy      String?
  processingStatus String   @default("completed") @db.VarChar(50)
  version         Int       @default(1)
  replacedBy      String?
  metadata        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([entityType, entityId])
  @@index([folder])
  @@index([isActive])
  @@index([checksum])
  @@index([createdAt])
  @@index([uploadedBy])
}
```

### 22.3 Product Images Junction

```prisma
model ProductImage {
  id        String  @id @default(uuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  mediaId   String
  media     Media   @relation(fields: [mediaId], references: [id], onDelete: Cascade)
  sortOrder Int     @default(0)
  isPrimary Boolean @default(false)

  @@index([productId])
  @@index([mediaId])
  @@unique([productId, mediaId])
}
```

### 22.4 Upload Tracking

```prisma
model UploadJob {
  id              String    @id @default(uuid())
  userId          String
  entityType      String    @db.VarChar(50)
  entityId        String?   @db.VarChar(36)
  status          String    @default("pending") @db.VarChar(50)
  originalFilename String   @db.VarChar(255)
  filesize        Int
  mimetype        String    @db.VarChar(100)
  mediaId         String?
  errorMessage    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  completedAt     DateTime?

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}
```

---

## 23. API Design

### 23.1 What

API endpoints for file upload, management, and retrieval.

### 23.2 Upload APIs

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|------------|
| `/api/upload/presign` | POST | Get presigned upload URL | Required | 10/min |
| `/api/upload/image` | POST | Direct image upload | Required | 5/min |
| `/api/upload/video` | POST | Video upload initiation | Required | 2/min |
| `/api/upload/document` | POST | Document upload | Required | 5/min |
| `/api/upload/status/:id` | GET | Check upload status | Required | 60/min |
| `/api/upload/:id` | DELETE | Delete uploaded file | Required | 10/min |

### 23.3 Media Management APIs

| Endpoint | Method | Purpose | Auth | Rate Limit |
|----------|--------|---------|------|------------|
| `/api/admin/media` | GET | List all media (admin) | Admin | 60/min |
| `/api/admin/media/:id` | GET | Get media details | Admin | 60/min |
| `/api/admin/media/:id` | PATCH | Update media metadata | Admin | 10/min |
| `/api/admin/media/:id` | DELETE | Delete media | Admin | 10/min |
| `/api/admin/media/bulk-delete` | POST | Bulk delete media | Admin | 5/min |
| `/api/admin/media/reorder` | POST | Reorder product images | Admin | 10/min |

### 23.4 Upload Request/Response Format

```typescript
// Request: POST /api/upload/presign
{
  "entityType": "product",
  "entityId": "uuid",
  "fileType": "image",
  "mimeType": "image/jpeg",
  "filesize": 1048576,
  "filename": "product-photo.jpg"
}

// Response: 201
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "presignedUrl": "https://...",
    "publicId": "nabome/products/uuid/original/uuid.jpg",
    "headers": {
      "Content-Type": "image/jpeg"
    }
  }
}

// Request: POST /api/upload/image (direct upload)
// Content-Type: multipart/form-data
// Body: file, entityType, entityId, alt, sortOrder

// Response: 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto/...",
    "publicId": "nabome/products/uuid/original/uuid.jpg",
    "alt": "Product image",
    "width": 800,
    "height": 1067,
    "filesize": 524288,
    "mimetype": "image/jpeg"
  }
}
```

---

## 24. Hard Rules

### 24.1 What

Non-negotiable rules that every storage operation must follow.

### 24.2 Why

- **Security:** No exceptions to security rules
- **Integrity:** Data integrity is non-negotiable
- **Compliance:** Legal requirements must be met

### 24.3 Hard Rules List

| Rule | Description | Violation |
|------|-------------|-----------|
| **Every asset has exactly one owner** | No orphan files ever | Data integrity breach |
| **Every upload creates a DB record** | No files without tracking | Orphan files |
| **Server-side validation always** | Client validation is UX only | Security breach |
| **No user-controlled filenames** | UUID-based naming only | Path traversal risk |
| **No public URLs for private files** | Signed URLs for documents | Data exposure |
| **Financial docs never deleted** | 7-year retention minimum | Compliance violation |
| **No storage logic in handlers** | All in `_lib/storage/` | Code duplication |
| **All uploads authenticated** | No anonymous uploads | Security breach |
| **MIME type validation** | Double-check type + magic bytes | Security breach |
| **EXIF stripping** | Remove metadata from images | Privacy violation |
| **CDN-first delivery** | All assets via CDN | Performance degradation |
| **No `console.log` for storage ops** | Use structured logging | Observability gap |

---

## 25. Soft Rules

### 25.1 What

Recommended best practices that should be followed unless there's a valid reason not to.

### 25.2 Soft Rules List

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **Auto-format images** | Convert to WebP/AVIF | Always for images |
| **Generate thumbnails** | Multiple sizes for responsive | Always for images |
| **Lazy loading** | Load images on scroll | For below-fold images |
| **Blur-up placeholders** | Show blur hash while loading | For hero images |
| **Responsive srcSet** | Multiple viewport sizes | For product images |
| **Async document generation** | Don't block request | For PDF generation |
| **Dry-run cleanup** | Log before deleting | For cleanup jobs |
| **Progress tracking** | Show upload progress | For file uploads |
| **Error retry** | Auto-retry failed uploads | For network errors |
| **Metadata extraction** | Read EXIF, dimensions | For all images |

---

## Appendix A: Storage Configuration Reference

### A.1 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `nabome` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `secret` |
| `R2_ACCOUNT_ID` | Cloudflare account ID | `account-id` |
| `R2_ACCESS_KEY_ID` | R2 access key | `access-key` |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | `secret-key` |
| `R2_BUCKET_NAME` | R2 bucket name | `nabome-storage` |
| `R2_PUBLIC_URL` | R2 public URL | `https://pub-xxx.r2.dev` |
| `CDN_URL` | CDN base URL | `https://cdn.nabome.online` |

### A.2 Storage Limits

| Resource | Limit | Rationale |
|----------|-------|-----------|
| **Max file size (image)** | 10MB | Prevent abuse |
| **Max file size (video)** | 100MB | Video content |
| **Max file size (document)** | 50MB | Large exports |
| **Max images per product** | 8 | Mobile UX |
| **Max images per upload** | 10 | Batch upload |
| **Max storage per account** | Unlimited | Business requirement |
| **Temp file retention** | 24 hours | Cleanup |
| **Export file retention** | 30 days | Cleanup |

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
