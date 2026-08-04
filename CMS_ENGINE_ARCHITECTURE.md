# নবME (Nabome) — CMS Core Engine & Content Management Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for CMS engine, content lifecycle, publishing workflow, reusable content, SEO integration, and content governance  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), HOMEPAGE_BUILDER_ARCHITECTURE.md (v1.0), COMPONENT_LIBRARY_ARCHITECTURE.md (v1.0), STORAGE_ENGINE_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0), API_SERVICE_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), RESPONSIVE_LAYOUT_ARCHITECTURE.md (v1.0), UX_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [CMS Philosophy & Foundation](#1-cms-philosophy--foundation)
2. [Content Lifecycle](#2-content-lifecycle)
3. [Content Ownership & Relationships](#3-content-sources--relationships)
4. [Content Hierarchy & Taxonomy](#4-content-hierarchy--taxonomy)
5. [Content Types](#5-content-types)
6. [Content Blocks Architecture](#6-content-blocks-architecture)
7. [Reusable Content Framework](#7-reusable-content-framework)
8. [Content Workflow & Publishing](#8-content-workflow--publishing)
9. [Content Editor Standards](#9-content-editor-standards)
10. [SEO Architecture](#10-seo-architecture)
11. [Media Management Standards](#11-media-management-standards)
12. [Content Relationships](#12-content-relationships)
13. [CMS Management Dashboard](#13-cms-management-dashboard)
14. [Security Standards](#14-security-standards)
15. [Accessibility Standards](#15-accessibility-standards)
16. [Performance Standards](#16-performance-standards)
17. [Content Discovery & Search](#17-content-discovery--search)
18. [Content Rendering Engine](#18-content-rendering-engine)
19. [Database Schema Design](#19-database-schema-design)
20. [API Design](#20-api-design)
21. [Frontend Architecture](#21-frontend-architecture)
22. [Future Readiness](#22-future-readiness)
23. [Architectural Rules](#23-architectural-rules)

---

## 1. CMS Philosophy & Foundation

### 1.1 Why CMS Engine

The CMS Engine is the central nervous system for all editorial and marketing content in Nabome. Unlike the Homepage Builder which focuses on homepage-specific section composition, the CMS Engine manages **every piece of content** that appears across the platform — from landing pages and blog articles to announcements, FAQs, and policy documents.

### 1.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **One CMS, All Content** | Every content type follows the same lifecycle, same API patterns, same governance |
| **Mobile-First Authoring** | Admins can create, edit, and manage content from any device |
| **Block-Based Composition** | Content is assembled from typed, reusable blocks — not monolithic HTML |
| **Version Everything** | Every save creates a version; rollback is always possible |
| **SEO by Default** | Every piece of content is SEO-optimized out of the box |
| **Accessibility Native** | WCAG 2.1 AA compliance built into every block and template |
| **Zero Hardcoding** | No content exists that cannot be managed through the CMS |

### 1.3 Relationship to Homepage Builder

The Homepage Builder (HOMEPAGE_BUILDER_ARCHITECTURE.md) handles homepage-specific section composition with its drag-and-drop system. The CMS Engine **generalizes this pattern** for all content types:

| Aspect | Homepage Builder | CMS Engine |
|--------|-----------------|------------|
| Scope | Homepage sections only | All platform content |
| Block Types | 13 homepage-specific sections | 23+ general-purpose blocks |
| Pages | Single page | Multiple pages of any type |
| Navigation | Section reordering | Full site hierarchy |
| Templates | Homepage layout presets | Page-type templates |

**Rule:** The Homepage Builder imports CMS blocks for homepage sections. The CMS does not import Homepage Builder logic.

---

## 2. Content Lifecycle

### 2.1 Universal Lifecycle States

Every content type follows the same lifecycle. No content type skips states or has a different flow.

```
Created → Draft → Pending Review → Approved → Published → Scheduled → Unpublished → Archived → Deleted
```

| State | Description | Visibility | Editable |
|-------|-------------|------------|----------|
| `created` | Initial state on creation | Private | Yes |
| `draft` | Work in progress | Private | Yes |
| `pending_review` | Submitted for approval | Private (reviewers see) | No (awaiting review) |
| `approved` | Approved by reviewer | Private | No (ready to publish) |
| `published` | Live on the platform | Public | Yes (creates new version) |
| `scheduled` | Queued for future publish | Private | Yes |
| `unpublished` | Removed from public view | Private | Yes |
| `archived` | Retained but inactive | Private | No (read-only) |
| `deleted` | Soft-deleted, recoverable | None | No |

### 2.2 State Transitions

```
created → draft → pending_review → approved → published
   ↓        ↓           ↓             ↓          ↓
draft   pending_   approved      published  unpublished
   ↓     review                     ↓          ↓
created   ↓                     scheduled  archived
          ↓                                ↓
       published                        deleted
```

### 2.3 Transition Rules

| From | Allowed To | Condition |
|------|-----------|-----------|
| `created` | `draft` | Content saved with body |
| `draft` | `pending_review` | User clicks "Submit for Review" |
| `draft` | `published` | Admin user publishes directly |
| `pending_review` | `approved` | Reviewer approves |
| `pending_review` | `draft` | Reviewer requests changes |
| `approved` | `published` | Admin publishes |
| `approved` | `scheduled` | Admin sets publish date |
| `published` | `unpublished` | Admin unpublishes |
| `published` | `scheduled` | Admin reschedules |
| `unpublished` | `published` | Admin republishes |
| `unpublished` | `archived` | Admin archives |
| `archived` | `deleted` | Admin deletes |
| `scheduled` | `published` | Cron job reaches scheduled date |
| `scheduled` | `draft` | Admin cancels schedule |
| Any except `deleted` | `deleted` | Admin soft-deletes |

### 2.4 Version Tracking

Every state change that modifies content creates a new version:

```typescript
interface ContentVersion {
  id: string;                    // UUID
  contentId: string;             // FK to content
  versionNumber: number;         // Auto-incrementing per content
  contentSnapshot: JsonB;        // Full content at this version
  metadataSnapshot: JsonB;       // Title, slug, SEO at this version
  changeType: 'auto' | 'manual' | 'review';
  changeSummary: string;         // "Saved draft", "Submitted for review", etc.
  createdBy: string;             // User ID
  createdAt: Date;
}
```

**Rules:**
- Every publish, unpublish, or review action creates a version
- Auto-save creates versions every 30 seconds if changes detected
- Versions are immutable — never updated after creation
- Maximum 100 versions per content; oldest auto-archived beyond limit
- Version comparison available for any two versions of same content

---

## 3. Content Sources & Relationships

### 3.1 Content Ownership

| Role | Can Create | Can Edit | Can Review | Can Publish | Can Delete |
|------|-----------|----------|------------|-------------|------------|
| `admin` | All types | All types | All types | All types | All types |
| `editor` | All types | All types | All types | Limited | Limited |
| `author` | Assigned types | Own content only | No | No | No |
| `reviewer` | No | Assigned content | Assigned content | No | No |
| `vendor` | Products, FAQs | Own content | No | No | No |

### 3.2 Content Attribution

Every content piece tracks:

```typescript
interface ContentAttribution {
  createdBy: string;       // User who created
  createdAt: Date;
  updatedBy: string;       // User who last modified
  updatedAt: Date;
  publishedBy?: string;    // User who published
  publishedAt?: Date;
  reviewedBy?: string;     // User who reviewed
  reviewedAt?: Date;
}
```

### 3.3 Content Relationships

Content types can relate to each other through a relationship system:

```typescript
interface ContentRelationship {
  id: string;
  sourceContentId: string;
  targetContentId: string;
  relationshipType: 
    | 'related'      // General related content
    | 'parent'       // Parent in hierarchy
    | 'child'        // Child in hierarchy
    | 'reference'    // Referenced by
    | 'series'       // Part of a series
    | 'alternative'; // Alternative version
  metadata: JsonB;         // Additional relationship data
  createdAt: Date;
}
```

**Auto-Relationships:**
- Blog articles in same category auto-suggest as related
- FAQs in same topic group auto-relate
- Landing pages auto-relate to their referenced products/courses

---

## 4. Content Hierarchy & Taxonomy

### 4.1 Site Hierarchy

The CMS organizes content in a tree structure:

```
Homepage
├── Landing Pages
│   ├── /courses
│   │   ├── /courses/online
│   │   └── /courses/in-person
│   ├── /pricing
│   └── /about
├── Blog
│   ├── /blog/category/teaching
│   ├── /blog/category/parenting
│   └── /blog/category/research
├── Support
│   ├── /faq
│   ├── /contact
│   └── /help
└── Legal
    ├── /privacy
    ├── /terms
    └── /cookies
```

### 4.2 Taxonomy System

All content shares a unified taxonomy:

```typescript
interface Taxonomy {
  id: string;
  name: string;              // "Categories", "Tags", "Topics"
  slug: string;
  type: 'category' | 'tag' | 'topic' | 'custom';
  parentId?: string;         // For hierarchical taxonomies
  metadata: JsonB;
  children?: Taxonomy[];
}
```

### 4.3 Content Classification

| Content Type | Primary Taxonomy | Secondary Taxonomy |
|--------------|------------------|-------------------|
| Page | Category | - |
| Landing Page | Category | Tags |
| Blog Article | Category | Tags, Topics |
| Announcement | - | Tags |
| FAQ | Topic | Tags |
| Policy | Category | - |
| Reusable Block | Category | Tags |

---

## 5. Content Types

### 5.1 Content Type Registry

The CMS uses a registry pattern for content types. Each type defines its schema, blocks, and behaviors:

```typescript
interface ContentTypeConfig {
  id: string;                    // "page", "landing-page", etc.
  name: string;                  // Human-readable name
  description: string;
  icon: string;                  // Lucide icon name
  allowedBlocks: string[];       // Block type IDs this content can use
  requiredBlocks?: string[];     // Blocks that must be present
  maxBlocks?: number;
  hasSEO: boolean;
  hasScheduling: boolean;
  hasCategories: boolean;
  hasTags: boolean;
  hasReusableBlocks: boolean;
  defaultStatus: ContentStatus;
  permissions: {
    create: UserRole[];
    edit: UserRole[];
    review: UserRole[];
    publish: UserRole[];
  };
  fields: ContentTypeField[];
}
```

### 5.2 Base Content Interface

All content types extend this base:

```typescript
interface BaseContent {
  id: string;                    // UUID v4
  type: string;                  // Content type ID
  title: string;
  slug: string;                  // URL-safe, auto-generated from title
  status: ContentStatus;
  blocks: ContentBlock[];        // Array of blocks
  metadata: JsonB;               // Type-specific metadata
  seo: SeoMetadata;
  taxonomy: {
    categories: string[];        // Category IDs
    tags: string[];             // Tag IDs
    topics: string[];           // Topic IDs
  };
  attribution: ContentAttribution;
  version: number;
  locale: string;                // "bn-BD" | "en-US"
  isArchived: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledAt?: Date;
}
```

### 5.3 Content Type Definitions

#### 5.3.1 Page
- **Purpose:** Static informational pages (About, Contact, etc.)
- **Blocks:** Text, Image, Gallery, CTA, FAQ
- **SEO:** Full SEO metadata
- **Scheduling:** No (always published or unpublished)
- **Categories:** Single category
- **Templates:** Default, Full-Width, Sidebar

#### 5.3.2 Landing Page
- **Purpose:** Marketing/promotional pages for campaigns
- **Blocks:** All 23 block types
- **SEO:** Full SEO metadata
- **Scheduling:** Yes (campaign scheduling)
- **Categories:** Single category
- **Templates:** Hero-Led, Feature-Focused, Event, Product Showcase

#### 5.3.3 Blog Article
- **Purpose:** Educational content, thought leadership
- **Blocks:** Text, Image, Gallery, Video, Code, Quote, CTA, Author
- **SEO:** Full SEO metadata + structured data (Article schema)
- **Scheduling:** Yes
- **Categories:** Single category + multiple tags + topics
- **Templates:** Standard, Tutorial, Case Study, Interview

#### 5.3.4 Announcement
- **Purpose:** Platform updates, feature announcements
- **Blocks:** Text, Image, CTA
- **SEO:** Basic SEO
- **Scheduling:** Yes (timed announcements)
- **Categories:** Tags only
- **Templates:** Default, Urgent, Feature Update

#### 5.3.5 FAQ
- **Purpose:** Frequently asked questions
- **Blocks:** Accordion
- **SEO:** FAQ structured data (FAQPage schema)
- **Scheduling:** No
- **Categories:** Topic-based
- **Templates:** Default, Grouped, Searchable

#### 5.3.6 Policy
- **Purpose:** Legal and compliance documents
- **Blocks:** Text, Table, List
- **SEO:** Basic SEO
- **Scheduling:** No (effective dates handled separately)
- **Categories:** Single category
- **Templates:** Default, Legal

#### 5.3.7 Reusable Block
- **Purpose:** Shared content components used across pages
- **Blocks:** Any single block type
- **SEO:** No
- **Scheduling:** No
- **Categories:** Tag-based
- **Templates:** None (block is the template)

---

## 6. Content Blocks Architecture

### 6.1 Block System Overview

Content is assembled from typed blocks. Each block is a self-contained unit with its own schema, rendering, and validation.

```typescript
interface ContentBlock {
  id: string;                    // UUID
  type: string;                  // Block type ID
  data: JsonB;                  // Block-specific data
  settings: BlockSettings;       // Common settings (padding, visibility, etc.)
  order: number;                 // Position in content
  isLocked: boolean;            // Cannot be moved/deleted
  reusableBlockId?: string;     // Reference to reusable block source
}

interface BlockSettings {
  padding: 'none' | 'sm' | 'md' | 'lg';
  backgroundColor?: string;
  textColor?: string;
  visibility: 'all' | 'desktop' | 'mobile';
  animation?: 'none' | 'fade-in' | 'slide-up';
  customClasses?: string[];
}
```

### 6.2 Block Type Registry

```typescript
interface BlockTypeConfig {
  id: string;
  name: string;
  category: 'text' | 'media' | 'layout' | 'commerce' | 'interactive' | 'advanced';
  icon: string;
  schema: ZodSchema;            // Zod validation schema
  preview: React.ComponentType;
  editor: React.ComponentType;
  defaults: JsonB;
}
```

### 6.3 Block Categories & Types

#### Text Blocks
| Block Type | ID | Purpose |
|------------|-----|---------|
| Rich Text | `text` | WYSIWYG text content |
| Heading | `heading` | Section headings (h2-h6) |
| List | `list` | Bulleted/numbered lists |
| Quote | `quote` | Blockquotes with attribution |
| Code | `code` | Syntax-highlighted code blocks |

#### Media Blocks
| Block Type | ID | Purpose |
|------------|-----|---------|
| Image | `image` | Single image with caption |
| Gallery | `gallery` | Image carousel/grid |
| Video | `video` | Embedded video (YouTube/Vimeo) |
| Audio | `audio` | Audio player |
| File | `file` | Downloadable document |

#### Layout Blocks
| Block Type | ID | Purpose |
|------------|-----|---------|
| Columns | `columns` | Multi-column layouts |
| Divider | `divider` | Horizontal rule |
| Spacer | `spacer` | Vertical spacing |
| Container | `container` | Content wrapper |

#### Commerce Blocks
| Block Type | ID | Purpose |
|------------|-----|---------|
| Product | `product` | Product display card |
| Pricing | `pricing` | Pricing table |
| Testimonial | `testimonial` | Customer testimonial |

#### Interactive Blocks
| Block Type | ID | Purpose |
|------------|-----|---------|
| CTA | `cta` | Call-to-action button/banner |
| Form | `form` | Contact/lead capture form |
| FAQ Accordion | `accordion` | Collapsible Q&A |
| Tabs | `tabs` | Tabbed content |

#### Advanced Blocks
| Block Type | ID | Purpose |
|------------|-----|---------|
| Author | `author` | Author bio card |
| Related Content | `related` | Related articles/products |
| Newsletter | `newsletter` | Email signup |
| Social Proof | `social-proof` | Social metrics/proof |

### 6.4 Block Validation

Every block is validated using Zod schemas:

```typescript
const TextBlockSchema = z.object({
  content: z.string().min(1).max(50000),
  alignment: z.enum(['left', 'center', 'right']).default('left'),
  variant: z.enum(['body', 'lead', 'caption']).default('body'),
});

const ImageBlockSchema = z.object({
  src: z.string().url(),
  alt: z.string().min(1).max(200),
  caption: z.string().max(500).optional(),
  width: z.number().min(100).max(4000).optional(),
  height: z.number().min(100).max(4000).optional(),
  loading: z.enum(['lazy', 'eager']).default('lazy'),
});
```

### 6.5 Block Rendering

Blocks render differently based on context:

| Context | Rendering |
|---------|-----------|
| Admin Editor | Editable with controls |
| Admin Preview | Read-only preview |
| Public Page | Full rendering with SEO |
| API Response | JSON data only |

---

## 7. Reusable Content Framework

### 7.1 What Are Reusable Blocks

Reusable blocks are content components that can be embedded in multiple pages. When the source block is updated, all instances update automatically.

**Use Cases:**
- Company boilerplate text
- Standard CTAs across pages
- Team member bios
- Product feature highlights
- Legal disclaimers

### 7.2 Reusable Block Structure

```typescript
interface ReusableBlock {
  id: string;                    // UUID
  name: string;                  // Display name in admin
  slug: string;                  // Unique identifier
  type: string;                  // Block type ID (one block per reusable)
  data: JsonB;                  // Block data
  metadata: {
    description: string;
    usageCount: number;         // Auto-tracked
    lastUsedAt?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
```

### 7.3 Embedding Reusable Blocks

In content blocks, reference a reusable block:

```typescript
interface ContentBlock {
  // ... standard block fields
  reusableBlockId?: string;     // Reference to reusable block
  overrides?: JsonB;            // Override specific fields
}
```

**Override Rules:**
- `overrides` can only modify fields explicitly allowed in `overrideFields` config
- Text blocks allow content override (for localization)
- Image blocks allow src/alt override
- CTA blocks allow label/URL override
- All overrides are marked visually in admin

### 7.4 Usage Tracking

The CMS tracks where each reusable block is used:

```typescript
interface ReusableBlockUsage {
  id: string;
  reusableBlockId: string;
  contentId: string;
  blockId: string;              // ID of the block referencing it
  createdAt: Date;
}
```

**Admin Features:**
- View all usages of a reusable block
- Update source → preview all instances before publishing
- Bulk update all instances
- Dependency graph visualization

---

## 8. Content Workflow & Publishing

### 8.1 Publishing Models

The CMS supports three publishing workflows:

#### Direct Publishing (Default for Admins)
```
Draft → Published
```
- Admin users can publish directly without review
- Single-click publish with confirmation dialog
- Creates version snapshot

#### Review Workflow (Required for Authors)
```
Draft → Pending Review → Approved → Published
```
- Authors submit for review
- Reviewers see pending queue
- Reviewer can approve, request changes, or reject
- Approved content waits for admin to publish

#### Scheduled Publishing
```
Draft → Approved → Scheduled → Published (auto)
```
- Set publish date/time in future
- Cron job checks every minute
- Publishes automatically at scheduled time
- Creates version with scheduled metadata

### 8.2 Scheduled Publishing System

```typescript
interface ScheduledPublish {
  id: string;
  contentId: string;
  scheduledAt: Date;             // When to publish
  publishedAt?: Date;            // When actually published
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  cronJobId?: string;           // Reference to cron job
  createdAt: Date;
}
```

**Cron Job Behavior:**
- Runs every minute via `node-cron`
- Queries `ScheduledPublish` for items where `scheduledAt <= now()` AND `status = 'pending'`
- Publishes content, creates version, updates status
- Logs success/failure
- Retries failed publishes up to 3 times with exponential backoff

### 8.3 Review Assignment

```typescript
interface ReviewAssignment {
  id: string;
  contentId: string;
  reviewerId: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'rejected';
  feedback?: string;
  assignedAt: Date;
  completedAt?: Date;
}
```

**Assignment Rules:**
- Authors cannot review their own content
- Reviewers are assigned based on content category
- Auto-assignment based on workload balancing
- Escalation if review pending > 48 hours

### 8.4 Publishing Checklist

Before content is published, CMS validates:

- [ ] Title is present and unique
- [ ] Slug is unique and URL-safe
- [ ] At least one block has content
- [ ] All required blocks are present
- [ ] SEO metadata is complete
- [ ] Images have alt text
- [ ] Links are valid and not broken
- [ ] Content passes accessibility checks
- [ ] Scheduled date is in future (if scheduled)
- [ ] User has publish permission

---

## 9. Content Editor Standards

### 9.1 Editor Requirements

The content editor must be:

1. **Mobile-First:** Fully functional on phones and tablets
2. **Keyboard-Accessible:** All operations via keyboard
3. **Fast:** < 100ms response to user actions
4. **Intuitive:** No training needed for basic content creation
5. **Powerful:** Advanced features for power users

### 9.2 Editor Features

#### Block Operations
- Add block (via block picker or `/` command)
- Drag-and-drop reordering
- Duplicate block
- Delete block (with confirmation)
- Move block up/down
- Lock/unlock block (prevent editing)

#### Inline Editing
- Click to edit text directly
- Floating toolbar for formatting
- Paste from Word/Google Docs (clean HTML)
- Auto-save every 30 seconds

#### Content Tools
- Word count / reading time
- SEO score preview
- Accessibility checker
- Content structure outline
- Version history browser
- Preview on different devices

### 9.3 Editor Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save draft |
| `Ctrl/Cmd + Shift + P` | Publish |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + D` | Duplicate block |
| `Ctrl/Cmd + Delete` | Delete block |
| `/` | Open block picker |
| `Escape` | Close modals/menus |

### 9.4 Auto-Save System

```typescript
interface AutoSaveConfig {
  enabled: boolean;
  intervalMs: number;           // Default: 30000 (30 seconds)
  debounceMs: number;           // Default: 1000
  maxRetries: number;           // Default: 3
  conflictDetection: boolean;   // Detect concurrent edits
}
```

**Behavior:**
- Saves after 1 second of inactivity (debounce)
- Also saves every 30 seconds during active editing
- Shows save indicator (spinner → checkmark)
- Conflicts detected via version comparison
- User prompted to resolve conflicts

---

## 10. SEO Architecture

### 10.1 SEO Metadata Structure

Every content type has SEO metadata:

```typescript
interface SeoMetadata {
  title: string;                 // Page title (50-60 chars)
  description: string;           // Meta description (150-160 chars)
  keywords: string[];            // Focus keywords (max 10)
  canonicalUrl?: string;         // Canonical URL
  ogImage?: string;              // Open Graph image
  ogTitle?: string;              // Override OG title
  ogDescription?: string;        // Override OG description
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex: boolean;              // true = prevent indexing
  noFollow: boolean;             // true = prevent following
  structuredData?: JsonB;        // JSON-LD structured data
}
```

### 10.2 Auto-Generated SEO

The CMS auto-generates SEO elements when not provided:

| Element | Auto-Generation Rule |
|---------|---------------------|
| `title` | Content title + " | নবME" |
| `description` | First 155 chars of first text block |
| `ogImage` | First image block in content |
| `canonicalUrl` | `https://nabome.com/{locale}/{slug}` |
| `structuredData` | Based on content type |

### 10.3 Structured Data by Content Type

#### Blog Article
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "author": { "@type": "Person", "name": "..." },
  "datePublished": "...",
  "dateModified": "...",
  "image": "...",
  "publisher": { "@type": "Organization", "name": "নবME" }
}
```

#### FAQ Page
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "...",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
```

#### Course Landing Page
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "...",
  "description": "...",
  "provider": { "@type": "Organization", "name": "নবME" },
  "offers": {
    "@type": "Offer",
    "price": "...",
    "priceCurrency": "BDT"
  }
}
```

### 10.4 SEO Validation Rules

| Rule | Validation |
|------|-----------|
| Title Length | 50-60 characters |
| Description Length | 150-160 characters |
| Slug Format | Lowercase, hyphens only, no special chars |
| Image Alt Text | Required for all images |
| Heading Hierarchy | Sequential (h1 → h2 → h3, no skipping) |
| Internal Links | At least 1 per page |
| Keyword Density | 1-2% for primary keyword |

### 10.5 Sitemap Integration

The CMS feeds into sitemap generation:

```typescript
interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;             // 0.0 to 1.0
  images?: SitemapImage[];
}
```

**Sitemap Rules:**
- Published content included automatically
- Archived content excluded
- Images in content included with captions
- Priority based on content type (Homepage: 1.0, Blog: 0.8, FAQ: 0.6)
- Updates when content is published/unpublished

---

## 11. Media Management Standards

### 11.1 Media Types & Storage

| Media Type | Storage | Max Size | Formats |
|------------|---------|----------|---------|
| Images | Cloudinary | 10MB | JPG, PNG, WebP, SVG |
| Videos | Cloudinary | 500MB | MP4, WebM, MOV |
| Documents | R2 | 50MB | PDF, DOC, DOCX, XLS |
| Audio | R2 | 100MB | MP3, WAV, OGG |
| Icons | Cloudinary | 1MB | SVG, PNG |

### 11.2 Image Processing

When images are uploaded:

1. **Original** stored in Cloudinary
2. **Thumbnails** auto-generated: 150x150, 300x300, 600x600
3. **Responsive versions:** 480w, 768w, 1024w, 1440w
4. **Format optimization:** WebP with JPEG fallback
5. **Lazy loading** enabled by default

### 11.3 Media in Blocks

Every media block enforces:

```typescript
interface MediaBlockData {
  src: string;
  alt: string;                  // Required, min 1 char
  caption?: string;
  width: number;
  height: number;
  loading: 'lazy' | 'eager';
  priority: boolean;            // true = preload (LCP images)
}
```

**Rules:**
- `alt` is required and cannot be empty
- Images without `alt` blocked from publishing
- Videos require captions/subtitles
- Decorative images use `alt=""` explicitly

### 11.4 Media Search & Organization

- **Folder structure:** Mirror site hierarchy
- **Tagging:** Auto-tag by upload context
- **Search:** Full-text search across name, alt, tags
- **Usage tracking:** See where each media item is used
- **Duplicate detection:** Hash-based deduplication

---

## 12. Content Relationships

### 12.1 Relationship Types

| Type | Description | Example |
|------|-------------|---------|
| `related` | General related content | Blog articles on similar topics |
| `parent` | Parent in hierarchy | Category → Article |
| `child` | Child in hierarchy | Article → Comments |
| `reference` | Explicitly referenced | Article references Course |
| `series` | Part of a series | Multi-part tutorial |
| `alternative` | Alternative version | English → Bengali translation |

### 12.2 Auto-Relationships

The CMS auto-generates relationships:

| Trigger | Relationship Created |
|---------|---------------------|
| Same category | `related` with category affinity |
| Shared tags | `related` with tag affinity |
| Same author | `related` with author affinity |
| Sequential slugs | `series` relationship |
| Same topic | `related` for FAQs |

### 12.3 Related Content Algorithm

```typescript
function calculateRelatedContent(
  content: BaseContent,
  candidates: BaseContent[]
): RelatedContent[] {
  return candidates
    .map(candidate => ({
      content: candidate,
      score: calculateAffinityScore(content, candidate)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function calculateAffinityScore(a: BaseContent, b: BaseContent): number {
  let score = 0;
  
  // Same category: +10
  if (a.taxonomy.categories.some(c => b.taxonomy.categories.includes(c))) {
    score += 10;
  }
  
  // Shared tags: +5 per tag
  const sharedTags = a.taxonomy.tags.filter(t => b.taxonomy.tags.includes(t));
  score += sharedTags.length * 5;
  
  // Same type: +3
  if (a.type === b.type) score += 3;
  
  // Keyword overlap: +2 per keyword
  const aKeywords = a.seo?.keywords || [];
  const bKeywords = b.seo?.keywords || [];
  const sharedKeywords = aKeywords.filter(k => bKeywords.includes(k));
  score += sharedKeywords.length * 2;
  
  return score;
}
```

---

## 13. CMS Management Dashboard

### 13.1 Dashboard Overview

The CMS dashboard provides at-a-glance content metrics:

```typescript
interface CmsDashboard {
  stats: {
    totalContent: number;
    published: number;
    draft: number;
    pendingReview: number;
    scheduled: number;
  };
  recentActivity: ContentActivity[];
  contentByType: ContentTypeStats[];
  contentByStatus: ContentStatusStats[];
  upcomingScheduled: ScheduledContent[];
  pendingReviews: ReviewAssignment[];
}
```

### 13.2 Content List View

Features:
- **Filters:** Status, type, author, date range, category
- **Sort:** Title, date, status, author
- **Search:** Full-text across title, slug, content
- **Bulk Operations:** Delete, change status, assign category
- **Columns:** Customizable column visibility
- **Pagination:** 20/50/100 per page

### 13.3 Content Analytics

Track content performance:

| Metric | Description |
|--------|-------------|
| Page Views | Total views since publish |
| Unique Visitors | Distinct users |
| Avg. Time on Page | Engagement duration |
| Bounce Rate | Single-page sessions |
| Share Count | Social media shares |
| SEO Score | Automated SEO audit score |
| Accessibility Score | WCAG compliance score |

### 13.4 Content Calendar

Visual calendar for scheduling:

- **Month View:** See all published/scheduled content
- **Week View:** Detailed daily planning
- **Drag-and-Drop:** Reschedule by dragging
- **Filters:** By content type, author, status
- **Quick Actions:** Create, edit, publish from calendar

---

## 14. Security Standards

### 14.1 Content Security

| Control | Implementation |
|---------|---------------|
| Input Sanitization | DOMPurify on all user input |
| XSS Prevention | Content Security Policy headers |
| CSRF Protection | CSRF tokens on all forms |
| SQL Injection | Prisma parameterized queries |
| File Upload | Type validation, size limits, virus scanning |
| Access Control | Role-based permissions per content type |

### 14.2 HTML Sanitization Rules

All HTML content passes through DOMPurify:

```typescript
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr',
    'strong', 'em', 'b', 'i', 'u', 's',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'pre', 'code',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'div', 'span',
    'figure', 'figcaption',
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'width', 'height',
    'class', 'id', 'target', 'rel',
    'colspan', 'rowspan',
    'loading', 'decoding',
  ],
  ALLOW_DATA_ATTR: false,
};
```

**Blocked Tags:** `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<input>`, `<textarea>`, `<select>`
**Blocked Attributes:** `onclick`, `onerror`, `onload`, `style` (unless whitelisted)

### 14.3 Content Permissions Matrix

| Action | Admin | Editor | Author | Reviewer | Vendor |
|--------|-------|--------|--------|----------|--------|
| Create Page | ✓ | ✓ | ✗ | ✗ | ✗ |
| Create Blog | ✓ | ✓ | ✓ | ✗ | ✗ |
| Create Landing | ✓ | ✓ | ✗ | ✗ | ✗ |
| Edit Any | ✓ | ✓ | ✗ | ✗ | ✗ |
| Edit Own | ✓ | ✓ | ✓ | ✗ | ✓ |
| Review | ✓ | ✓ | ✗ | ✓ | ✗ |
| Publish | ✓ | Limited | ✗ | ✗ | ✗ |
| Delete | ✓ | Limited | ✗ | ✗ | ✗ |

### 14.4 Audit Logging

Every CMS action is logged:

```typescript
interface CmsAuditLog {
  id: string;
  action: string;              // "content.create", "content.publish", etc.
  entityType: string;          // "content", "media", "reusable-block"
  entityId: string;
  userId: string;
  metadata: JsonB;             // Before/after states
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```

**Retention:** 90 days active, 1 year archived

---

## 15. Accessibility Standards

### 15.1 WCAG 2.1 AA Compliance

All CMS content must meet WCAG 2.1 AA:

| Criterion | Requirement |
|-----------|-------------|
| Color Contrast | 4.5:1 for normal text, 3:1 for large text |
| Keyboard Navigation | All interactive elements focusable |
| Screen Reader | Proper ARIA labels, roles |
| Alt Text | Required for all images |
| Heading Hierarchy | Sequential, no skipping |
| Link Text | Descriptive, not "click here" |
| Form Labels | All inputs labeled |
| Error Messages | Clear, actionable |

### 15.2 Block Accessibility Checklist

Each block type has specific accessibility requirements:

| Block | Requirements |
|-------|-------------|
| Text | Proper heading hierarchy, semantic markup |
| Image | Alt text required, caption optional |
| Video | Captions required, audio description optional |
| Gallery | Keyboard navigation, aria-roledescription |
| CTA | Focusable, clear action text |
| Form | Labels, error messages, aria-describedby |
| Table | Headers, captions, scope attributes |
| Accordion | aria-expanded, aria-controls |

### 15.3 Auto-Accessibility Checks

The CMS runs accessibility audits:

```typescript
interface AccessibilityCheck {
  blockId: string;
  blockType: string;
  issues: AccessibilityIssue[];
  score: number;                // 0-100
}

interface AccessibilityIssue {
  rule: string;                 // "image-alt", "heading-order", etc."
  severity: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  fix?: string;
}
```

**Blocking Issues:** Content cannot be published with accessibility errors.

---

## 16. Performance Standards

### 16.1 Content Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Total Blocking Time | < 200ms | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Time to Interactive | < 3.0s | Lighthouse |

### 16.2 Content Caching Strategy

| Content Type | Cache Duration | Invalidation |
|--------------|---------------|--------------|
| Published Content | 1 hour | On publish/unpublish |
| Reusable Blocks | 30 minutes | On update |
| Categories/Tags | 24 hours | On taxonomy change |
| Media URLs | 7 days | On media delete |
| Sitemap | 1 hour | On content change |

### 16.3 Content Optimization

**Image Optimization:**
- Lazy loading by default
- `priority: true` for LCP images only
- Responsive srcset for all images
- WebP format with JPEG fallback

**Content Optimization:**
- Blocks rendered server-side where possible
- Critical CSS inlined
- Non-critical JS deferred
- Prefetch next-page content on hover

### 16.4 Database Performance

| Optimization | Implementation |
|--------------|---------------|
| Indexing | Slug, status, type, publishedAt |
| Pagination | Cursor-based for lists |
| Eager Loading | Relations loaded in single query |
| Connection Pooling | PgBouncer via Prisma |
| Query Monitoring | Slow query logging (> 200ms) |

---

## 17. Content Discovery & Search

### 17.1 Search Implementation

Content search uses full-text search with ranking:

```typescript
interface ContentSearchQuery {
  query: string;
  type?: string;                // Filter by content type
  category?: string;            // Filter by category
  tags?: string[];              // Filter by tags
  status?: ContentStatus;       // Filter by status
  author?: string;              // Filter by author
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  page?: number;
  limit?: number;
}

interface ContentSearchResult {
  content: BaseContent;
  score: number;
  highlights: {
    field: string;
    fragment: string;
  }[];
}
```

### 17.2 Search Ranking Algorithm

| Factor | Weight |
|--------|--------|
| Title match | 3x |
| Tag match | 2x |
| Category match | 1.5x |
| Content match | 1x |
| Recency | 0.5x boost for < 7 days |
| Popularity | 0.3x based on views |

### 17.3 Content Suggestions

The CMS suggests related content:

- **During Editing:** Suggests related articles when writing
- **On Publish:** Suggests linking to new content from existing pages
- **In Sidebar:** "Related Articles" auto-populated
- **In Search:** "Did you mean..." and "People also searched for"

---

## 18. Content Rendering Engine

### 18.1 Rendering Pipeline

```
Content Blocks → Validation → Sanitization → Optimization → Rendering → Caching
```

### 18.2 Block Rendering Rules

Each block type has a renderer:

```typescript
interface BlockRenderer {
  type: string;
  render: (data: JsonB, context: RenderContext) => ReactNode;
  preview: (data: JsonB) => ReactNode;
  serverRender?: (data: JsonB) => string;  // For SSR
}

interface RenderContext {
  locale: string;
  isPreview: boolean;
  isAmp: boolean;              // AMP version
  device: 'desktop' | 'mobile' | 'tablet';
  user?: User;                 // For personalized content
}
```

### 18.3 Responsive Rendering

Blocks render differently based on viewport:

| Block | Desktop | Tablet | Mobile |
|-------|---------|--------|--------|
| Columns | Side-by-side | Stacked | Stacked |
| Gallery | Grid (3-4 cols) | Grid (2 cols) | Carousel |
| Pricing | 3 columns | 2 columns | Stacked |
| Hero | Full-width | Full-width | Full-width |

### 18.4 SEO Rendering

For SEO, the server renders:

- Semantic HTML5 (`<article>`, `<section>`, `<nav>`)
- JSON-LD structured data
- Open Graph meta tags
- Twitter Card meta tags
- Canonical URLs
- hreflang for locales

---

## 19. Database Schema Design

### 19.1 Core CMS Tables

```sql
-- Content types
CREATE TABLE "CmsContentType" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "config" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Content
CREATE TABLE "CmsContent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "typeId" TEXT NOT NULL REFERENCES "CmsContentType"("id"),
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'draft',
  "blocks" JSONB NOT NULL DEFAULT '[]',
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "seo" JSONB NOT NULL DEFAULT '{}',
  "locale" TEXT NOT NULL DEFAULT 'bn-BD',
  "version" INTEGER NOT NULL DEFAULT 1,
  "isArchived" BOOLEAN NOT NULL DEFAULT false,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdBy" TEXT NOT NULL REFERENCES "User"("id"),
  "updatedBy" TEXT NOT NULL REFERENCES "User"("id"),
  "publishedBy" TEXT REFERENCES "User"("id"),
  "publishedAt" TIMESTAMP(3),
  "scheduledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  UNIQUE("typeId", "slug", "locale")
);

-- Content versions
CREATE TABLE "CmsContentVersion" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "contentId" TEXT NOT NULL REFERENCES "CmsContent"("id"),
  "versionNumber" INTEGER NOT NULL,
  "contentSnapshot" JSONB NOT NULL,
  "metadataSnapshot" JSONB NOT NULL,
  "changeType" TEXT NOT NULL,
  "changeSummary" TEXT,
  "createdBy" TEXT NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  UNIQUE("contentId", "versionNumber")
);

-- Reusable blocks
CREATE TABLE "CmsReusableBlock" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "description" TEXT,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdBy" TEXT NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Taxonomy
CREATE TABLE "CmsTaxonomy" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL,
  "parentId" TEXT REFERENCES "CmsTaxonomy"("id"),
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Content-Taxonomy relations
CREATE TABLE "CmsContentTaxonomy" (
  "contentId" TEXT NOT NULL REFERENCES "CmsContent"("id"),
  "taxonomyId" TEXT NOT NULL REFERENCES "CmsTaxonomy"("id"),
  PRIMARY KEY ("contentId", "taxonomyId")
);

-- Content relationships
CREATE TABLE "CmsContentRelationship" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sourceContentId" TEXT NOT NULL REFERENCES "CmsContent"("id"),
  "targetContentId" TEXT NOT NULL REFERENCES "CmsContent"("id"),
  "relationshipType" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- Review assignments
CREATE TABLE "CmsReviewAssignment" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "contentId" TEXT NOT NULL REFERENCES "CmsContent"("id"),
  "reviewerId" TEXT NOT NULL REFERENCES "User"("id"),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "feedback" TEXT,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMP(3)
);

-- Scheduled publishing
CREATE TABLE "CmsScheduledPublish" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "contentId" TEXT NOT NULL REFERENCES "CmsContent"("id"),
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

-- Audit logs
CREATE TABLE "CmsAuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);
```

### 19.2 Indexes

```sql
-- Content queries
CREATE INDEX "CmsContent_typeId_idx" ON "CmsContent"("typeId");
CREATE INDEX "CmsContent_status_idx" ON "CmsContent"("status");
CREATE INDEX "CmsContent_slug_idx" ON "CmsContent"("slug");
CREATE INDEX "CmsContent_publishedAt_idx" ON "CmsContent"("publishedAt");
CREATE INDEX "CmsContent_createdBy_idx" ON "CmsContent"("createdBy");
CREATE INDEX "CmsContent_locale_idx" ON "CmsContent"("locale");
CREATE INDEX "CmsContent_isDeleted_idx" ON "CmsContent"("isDeleted");

-- Full-text search
CREATE INDEX "CmsContent_title_idx" ON "CmsContent" USING GIN(to_tsvector('english', "title"));

-- Version queries
CREATE INDEX "CmsContentVersion_contentId_idx" ON "CmsContentVersion"("contentId");

-- Scheduled publishing
CREATE INDEX "CmsScheduledPublish_scheduledAt_status_idx" ON "CmsScheduledPublish"("scheduledAt", "status");

-- Audit logs
CREATE INDEX "CmsAuditLog_entityType_entityId_idx" ON "CmsAuditLog"("entityType", "entityId");
CREATE INDEX "CmsAuditLog_userId_idx" ON "CmsAuditLog"("userId");
CREATE INDEX "CmsAuditLog_createdAt_idx" ON "CmsAuditLog"("createdAt");
```

---

## 20. API Design

### 20.1 Content API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/content` | List content (with filters) |
| POST | `/api/cms/content` | Create content |
| GET | `/api/cms/content/:id` | Get content by ID |
| PUT | `/api/cms/content/:id` | Update content |
| DELETE | `/api/cms/content/:id` | Soft delete content |
| POST | `/api/cms/content/:id/publish` | Publish content |
| POST | `/api/cms/content/:id/unpublish` | Unpublish content |
| POST | `/api/cms/content/:id/schedule` | Schedule publish |
| GET | `/api/cms/content/:id/versions` | Get version history |
| POST | `/api/cms/content/:id/versions/:version/restore` | Restore version |

### 20.2 Reusable Block API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/reusable-blocks` | List reusable blocks |
| POST | `/api/cms/reusable-blocks` | Create reusable block |
| PUT | `/api/cms/reusable-blocks/:id` | Update reusable block |
| DELETE | `/api/cms/reusable-blocks/:id` | Delete reusable block |
| GET | `/api/cms/reusable-blocks/:id/usage` | Get usage list |

### 20.3 Taxonomy API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/taxonomy` | List taxonomies |
| POST | `/api/cms/taxonomy` | Create taxonomy |
| PUT | `/api/cms/taxonomy/:id` | Update taxonomy |
| DELETE | `/api/cms/taxonomy/:id` | Delete taxonomy |

### 20.4 Dashboard API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cms/dashboard` | Dashboard stats |
| GET | `/api/cms/dashboard/activity` | Recent activity |
| GET | `/api/cms/dashboard/scheduled` | Upcoming scheduled |
| GET | `/api/cms/dashboard/reviews` | Pending reviews |

### 20.5 API Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: JsonB;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

### 20.6 API Validation

All inputs validated with Zod:

```typescript
const CreateContentSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(1).max(500),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  blocks: z.array(ContentBlockSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
  seo: SeoMetadataSchema.partial().optional(),
  taxonomy: z.object({
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    topics: z.array(z.string()).optional(),
  }).optional(),
  locale: z.enum(['bn-BD', 'en-US']).default('bn-BD'),
});
```

---

## 21. Frontend Architecture

### 21.1 File Structure

```
src/features/admin/cms/
├── components/
│   ├── editor/
│   │   ├── ContentEditor.tsx
│   │   ├── BlockPicker.tsx
│   │   ├── BlockRenderer.tsx
│   │   ├── BlockToolbar.tsx
│   │   └── blocks/
│   │       ├── TextBlock.tsx
│   │       ├── ImageBlock.tsx
│   │       └── ... (23 block components)
│   ├── dashboard/
│   │   ├── CmsDashboard.tsx
│   │   ├── ContentList.tsx
│   │   ├── ContentCalendar.tsx
│   │   └── ReviewQueue.tsx
│   ├── media/
│   │   ├── MediaLibrary.tsx
│   │   ├── MediaUploader.tsx
│   │   └── MediaPicker.tsx
│   └── seo/
│       ├── SeoEditor.tsx
│       ├── SeoPreview.tsx
│       └── StructuredDataEditor.tsx
├── hooks/
│   ├── useContentEditor.ts
│   ├── useBlockManager.ts
│   ├── useAutoSave.ts
│   ├── usePublishWorkflow.ts
│   └── useCmsSearch.ts
├── services/
│   ├── contentApi.ts
│   ├── mediaApi.ts
│   ├── taxonomyApi.ts
│   └── dashboardApi.ts
├── stores/
│   ├── contentEditorStore.ts
│   ├── cmsDashboardStore.ts
│   └── mediaLibraryStore.ts
├── types/
│   ├── content.types.ts
│   ├── block.types.ts
│   ├── seo.types.ts
│   └── dashboard.types.ts
└── utils/
    ├── contentHelpers.ts
    ├── slugGenerator.ts
    ├── seoUtils.ts
    └── blockUtils.ts
```

### 21.2 Key Components

#### ContentEditor
- Main editor container
- Manages block list state
- Handles save/publish actions
- Integrates auto-save

#### BlockPicker
- Modal/dropdown for adding blocks
- Search/filter block types
- Category grouping
- Keyboard navigation

#### BlockRenderer
- Renders blocks based on type
- Switch between edit/preview modes
- Handles block-specific settings

### 21.3 State Management

```typescript
interface ContentEditorState {
  content: BaseContent | null;
  blocks: ContentBlock[];
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  versions: ContentVersion[];
  selectedBlockId: string | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  seoScore: number;
  accessibilityScore: number;
}
```

---

## 22. Future Readiness

### 22.1 Extensibility Points

The CMS is designed for future expansion:

| Extension Point | How to Extend |
|-----------------|---------------|
| New Content Type | Add to registry, define schema |
| New Block Type | Add to block registry, create component |
| New Taxonomy Type | Add to taxonomy system |
| New Workflow | Add to state machine |
| New SEO Feature | Extend SeoMetadata interface |
| New Media Type | Add to storage engine |
| New Integration | Add to webhook system |

### 22.2 Planned Future Features

| Phase | Feature | Effort |
|-------|---------|--------|
| Phase 2 | Multi-language content | 2 weeks |
| Phase 2 | A/B testing for content | 1 week |
| Phase 2 | Content personalization | 2 weeks |
| Phase 3 | AI content suggestions | 3 weeks |
| Phase 3 | Content performance analytics | 2 weeks |
| Phase 3 | Collaborative editing | 4 weeks |
| Phase 4 | Headless CMS mode | 2 weeks |
| Phase 4 | Content API marketplace | 3 weeks |

### 22.3 Migration Strategy

When extending the CMS:

1. **New Block Types:** Add to registry, no migration needed
2. **New Content Types:** Create type config, no DB migration
3. **Schema Changes:** Use Prisma migrations with backward compatibility
4. **Breaking Changes:** Version the API, support old versions for 6 months

---

## 23. Architectural Rules

### 23.1 Absolute Rules (Never Violate)

1. **Every content follows the same lifecycle** — no custom workflows per type
2. **All HTML must be sanitized** — DOMPurify on all user input
3. **Alt text required for images** — content cannot publish without it
4. **Version everything** — every publish creates a version
5. **Soft delete only** — no hard deletes for content
6. **Mobile-first editor** — all features work on phones
7. **Accessibility required** — WCAG 2.1 AA compliance
8. **No hardcoded content** — everything through CMS
9. **SEO by default** — every page SEO-optimized
10. **Audit all changes** — complete change history

### 23.2 Strong Guidelines (Follow Unless Justified)

1. Use block-based composition for all new content
2. Store content as JSONB for flexibility
3. Cache aggressively, invalidate on change
4. Use Zod for all validation
5. Follow REST conventions for API
6. Use feature-first file structure
7. TypeScript strict mode everywhere
8. Unit test all block renderers
9. Integration test all API endpoints
10. E2E test critical content flows

### 23.3 Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Content Types | kebab-case | `landing-page` |
| Block Types | kebab-case | `rich-text` |
| API Endpoints | kebab-case | `/api/cms/content-types` |
| DB Tables | PascalCase | `CmsContent` |
| DB Columns | camelCase | `createdAt` |
| React Components | PascalCase | `ContentEditor` |
| TypeScript Interfaces | PascalCase | `BaseContent` |
| Zod Schemas | PascalCase + Schema | `ContentBlockSchema` |

### 23.4 File Naming

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase.tsx | `ContentEditor.tsx` |
| Hooks | camelCase.ts | `useContentEditor.ts` |
| Services | camelCase.ts | `contentApi.ts` |
| Types | camelCase.types.ts | `content.types.ts` |
| Utils | camelCase.ts | `contentHelpers.ts` |
| Stores | camelCaseStore.ts | `contentEditorStore.ts` |

---

**End of CMS Engine & Content Management Architecture Standard**
