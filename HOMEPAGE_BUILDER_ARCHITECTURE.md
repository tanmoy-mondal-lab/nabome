# নবME (Nabome) — Homepage Builder (CMS) Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for Homepage Builder, Visual Page Builder, Section System, Rendering Engine, and CMS Configuration  
> **Supersedes:** None — complements DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), COMPONENT_LIBRARY_ARCHITECTURE.md (v1.0), DATABASE_ARCHITECTURE.md (v1.0), RESPONSIVE_LAYOUT_ARCHITECTURE.md (v1.0), UX_ARCHITECTURE.md (v1.0), FOLDER_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0)

---

## Table of Contents

1. [Builder Philosophy & Foundation](#1-builder-philosophy--foundation)
2. [Rendering Architecture](#2-rendering-architecture)
3. [Section Lifecycle](#3-section-lifecycle)
4. [Configuration System](#4-configuration-system)
5. [Preview Architecture](#5-preview-architecture)
6. [Publishing Workflow](#6-publishing-workflow)
7. [Draft & Version Management](#7-draft--version-management)
8. [Section Management Operations](#8-section-management-operations)
9. [Supported Section Types](#9-supported-section-types)
10. [Section Configuration Standards](#10-section-configuration-standards)
11. [Layout System](#11-layout-system)
12. [Responsive Behavior](#12-responsive-behavior)
13. [CMS Experience Standards](#13-cms-experience-standards)
14. [Performance Standards](#14-performance-standards)
15. [Security Standards](#15-security-standards)
16. [Accessibility Standards](#16-accessibility-standards)
17. [Future Extensibility](#17-future-extensibility)
18. [Database Schema](#18-database-schema)
19. [API Design](#19-api-design)
20. [Frontend Architecture](#20-frontend-architecture)
21. [Architectural Rules](#21-architectural-rules)

---

## 1. Builder Philosophy & Foundation

### 1.1 What

The foundational principles that govern the Homepage Builder — a visual, CMS-driven system that enables non-technical administrators to create, configure, and publish premium landing pages without writing code.

### 1.2 Why

- **No Hardcoding:** The homepage must never be hardcoded; every element is CMS-controlled
- **Beginner-Friendly:** Admins without technical knowledge create premium pages
- **Premium Quality:** The builder produces Apple/Zara-level landing pages
- **Scalability:** New sections, layouts, and features plug in without redesign
- **Maintainability:** One system, one pattern, one mental model

### 1.3 Where

The Admin Dashboard at `/admin/cms/homepage` and the public-facing homepage at `/`.

### 1.4 Core Philosophy

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Configuration over code** | Every visual decision is a database record | JSONB config stored in PostgreSQL |
| **Section as unit** | Homepage = ordered list of sections | Each section is a self-contained config unit |
| **What you see is what you get** | Preview matches published output | Identical rendering engine for both |
| **Beginner-first UX** | Every action is obvious without instructions | Clear labels, helpful hints, undo |
| **Mobile-first by default** | Every section renders mobile-first | Responsive rules enforced at config level |
| **Design system compliance** | Every section uses the Nabome Design System | Tokens, typography, spacing enforced |
| **Performance by design** | Lazy loading, asset optimization built-in | No afterthought optimization |
| **Secure by default** | All content validated and sanitized | Zero trust for user input |

### 1.5 Builder DNA

```
┌─────────────────────────────────────────────────────────────────┐
│                    NABOME BUILDER DNA                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    SHOPIFY-LIKE                            │   │
│  │  • Section-based page building                            │   │
│  │  • Theme-compatible section system                        │   │
│  │  • Drag-and-drop reordering                               │   │
│  │  • Real-time preview                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          +                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    WEBFLOW-LIKE                            │   │
│  │  • Visual layout control                                  │   │
│  │  • Responsive breakpoint editing                          │   │
│  │  • Animation configuration                                │   │
│  │  • Advanced spacing control                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          =                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    NABOME                                  │   │
│  │  • Simpler than Shopify, cleaner than Webflow             │   │
│  │  • Premium output, beginner-friendly input                │   │
│  │  • One brand, one aesthetic, infinite combinations        │   │
│  │  • Config-driven, never code-driven                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 What NOT to Build

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hardcoded homepage sections | Can't be changed without code deploys | CMS-driven sections |
| Free-form HTML editing | Security risk, inconsistent design | Structured section configs |
| Per-page CSS overrides | Maintenance nightmare, breaks design system | Token-based configuration |
| Section-specific renderers | Code duplication, inconsistent rendering | Unified rendering engine |
| Client-side only rendering | SEO penalty, slow initial load | Server-ready architecture |
| Complex builder for simple pages | Over-engineering, bad UX | Progressive disclosure |

---

## 2. Rendering Architecture

### 2.1 What

The engine that transforms CMS configuration into the final rendered homepage — responsible for interpreting section configs, resolving data sources, applying responsive rules, and producing the DOM.

### 2.2 Why

- **Consistency:** Same config → same output, always
- **Performance:** Optimized rendering pipeline
- **Maintainability:** One renderer, many section types
- **Preview parity:** Admin preview matches public output exactly

### 2.3 Where

`src/features/home/components/HomepageRenderer.tsx` and the section registry at `src/features/home/sections/`.

### 2.4 Rendering Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERING PIPELINE                              │
│                                                                  │
│  1. FETCH CONFIG                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Database → HomepageConfig (ordered sections + settings)  │   │
│  │  Cache: KV edge cache, 5-minute TTL                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  2. VALIDATE CONFIG                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Zod schema validation → strip unknown fields            │   │
│  │  Apply defaults for missing optional fields              │   │
│  │  Log validation warnings (don't block rendering)         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  3. RESOLVE DATA SOURCES                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  For each section with dynamic data:                      │   │
│  │    Product Grid → Query products by source config         │   │
│  │    Featured Collection → Query collection products        │   │
│  │    Blog Preview → Query latest articles                   │   │
│  │  Batch queries to prevent N+1                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  4. BUILD SECTION TREE                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Map each section config → React component               │   │
│  │  Apply layout wrapper (Full Width / Boxed / Split)       │   │
│  │  Apply spacing tokens (sectionPadding, gap)              │   │
│  │  Apply background (color / image / gradient)             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  5. APPLY RESPONSIVE RULES                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Resolve breakpoint-specific overrides                   │   │
│  │  Apply mobile/tablet/desktop column configs              │   │
│  │  Apply visibility rules per breakpoint                   │   │
│  │  Apply animation configs (respect prefers-reduced-motion)│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  6. RENDER                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React components render with resolved props             │   │
│  │  Lazy-load below-the-fold sections                        │   │
│  │  Intersection Observer for animations                     │   │
│  │  SEO: Structured data, meta tags applied                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Section Registry

The section registry maps section type identifiers to their React components and default configurations.

```typescript
// src/features/home/sections/registry.ts

interface SectionDefinition {
  type: string;
  component: React.LazyExoticComponent<React.ComponentType<SectionProps>>;
  defaultConfig: SectionConfig;
  schema: ZodSchema;
  label: string;
  description: string;
  thumbnail: string;
  category: 'hero' | 'products' | 'content' | 'social' | 'utility';
}

const SECTION_REGISTRY: Record<string, SectionDefinition> = {
  'hero-banner': {
    type: 'hero-banner',
    component: lazy(() => import('./HeroBannerSection')),
    defaultConfig: heroBannerDefaults,
    schema: heroBannerSchema,
    label: 'Hero Banner',
    description: 'Full-width hero with image, headline, and CTA',
    thumbnail: '/admin/thumbnails/hero-banner.svg',
    category: 'hero',
  },
  // ... other sections
};
```

### 2.6 Rendering Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Config-driven** | Every visual decision comes from config | CMS control |
| **Lazy by default** | Sections below fold use React.lazy() | Performance |
| **Error boundaries** | Each section wrapped in error boundary | Resilience |
| **Suspense fallbacks** | Skeleton loaders during lazy load | UX |
| **No hardcoded values** | All values from design tokens | Consistency |
| **Accessibility first** | ARIA, keyboard, focus management | WCAG compliance |
| **SEO aware** | Structured data, semantic HTML | Search ranking |
| **Preview parity** | Same renderer for admin and public | Accuracy |

### 2.7 Common Rendering Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|----------------|------------------|
| Inline styles from config | Bypasses design system | Map config to Tailwind classes |
| Missing error boundaries | One section crash breaks entire page | Wrap each section in ErrorBoundary |
| No loading states | Flash of empty content | Skeleton loaders for lazy sections |
| Eager loading all sections | Slow initial page load | Lazy-load below-the-fold |
| Hardcoded section order | Can't reorder from CMS | Order from database config |
| Ignoring prefers-reduced-motion | Accessibility violation | Respect user motion preferences |

---

## 3. Section Lifecycle

### 3.1 What

The complete lifecycle of a section from creation to publication, including all states and transitions.

### 3.2 Why

- **Predictability:** Everyone understands section states
- **Safety:** No accidental publication of incomplete sections
- **Auditability:** Track who did what and when
- **Recovery:** Roll back to any previous state

### 3.3 Lifecycle States

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECTION LIFECYCLE                               │
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                 │
│  │  CREATED  │────▶│  DRAFT   │────▶│  REVIEW  │                 │
│  └──────────┘     └──────────┘     └──────────┘                 │
│       │                │                │                        │
│       │                │                │                        │
│       ▼                ▼                ▼                        │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                 │
│  │ DELETED  │     │ ARCHIVED │     │PUBLISHED │                 │
│  └──────────┘     └──────────┘     └──────────┘                 │
│                                         │                        │
│                                         ▼                        │
│                                    ┌──────────┐                  │
│                                    │ UNPUBLISHED│                │
│                                    └──────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 State Definitions

| State | Description | Visibility | Editable | Publishable |
|-------|-------------|------------|----------|-------------|
| **Created** | Section added to page config | Admin only | Yes | No |
| **Draft** | Section being edited | Admin only | Yes | Yes |
| **Review** | Section submitted for review | Admin + Reviewer | No (review only) | Yes (reviewer) |
| **Published** | Section visible on public site | Public | Yes (creates draft) | No (already live) |
| **Unpublished** | Section hidden from public | Admin only | Yes | Yes |
| **Archived** | Section removed but preserved | Admin only | No | No |
| **Deleted** | Section permanently removed | Nowhere | No | No |

### 3.5 State Transitions

| From | To | Trigger | Conditions |
|------|----|---------|------------|
| Created | Draft | Auto | On first save |
| Draft | Review | Manual | All required fields valid |
| Review | Published | Approve | Reviewer approves |
| Review | Draft | Reject | Reviewer rejects with feedback |
| Published | Unpublished | Manual | Admin action |
| Unpublished | Published | Manual | Admin action |
| Published | Draft | Edit | Creates new draft version |
| Any | Archived | Manual | Admin action |
| Archived | Draft | Restore | Admin action |
| Any | Deleted | Manual | Soft delete (isActive=false) |

### 3.6 Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Soft delete only** | `isActive = false`, never hard delete | Referential integrity |
| **Version on publish** | Increment version number on each publish | Rollback capability |
| **Audit on transition** | Log every state change with user ID | Accountability |
| **Validation before publish** | All required fields must be valid | Prevent broken pages |
| **Preview before publish** | Preview mode available in all editable states | Safety |
| **Auto-save drafts** | Auto-save every 30 seconds while editing | Prevent data loss |
| **Undo readiness** | Every action reversible within session | Error recovery |

---

## 4. Configuration System

### 4.1 What

The standardized configuration framework that defines how every section's appearance, behavior, and content is specified.

### 4.2 Why

- **Consistency:** Same config structure for all sections
- **Validation:** Zod schemas ensure valid configs
- **Type safety:** TypeScript types generated from schemas
- **CMS-friendly:** JSON structure maps to admin UI controls
- **Future-proof:** New config fields don't break existing sections

### 4.3 Config Structure

Every section configuration follows this universal structure:

```typescript
interface SectionConfig {
  // Identity
  id: string;                    // UUID, auto-generated
  type: string;                  // Section type identifier
  version: number;               // Config version (incremented on publish)

  // Content
  title?: string;                // Section heading
  subtitle?: string;             // Section subheading
  description?: string;          // Rich text description
  cta?: CtaConfig;               // Call-to-action button

  // Visual
  background: BackgroundConfig;  // Section background
  layout: LayoutConfig;          // Layout settings
  theme: ThemeConfig;            // Color and typography overrides
  spacing: SpacingConfig;        // Section and element spacing

  // Display
  visibility: VisibilityConfig;  // When/where to show
  displayRules: DisplayRule[];   // Conditional display rules
  responsive: ResponsiveConfig;  // Per-breakpoint overrides

  // Media
  media?: MediaConfig;           // Images, videos, icons

  // Animation
  animation?: AnimationConfig;   // Entrance and interaction animations

  // Data Source (for dynamic sections)
  source?: DataSourceConfig;     // Product, category, collection sources
  sorting?: SortingConfig;       // How to sort dynamic content

  // Meta
  isActive: boolean;             // Soft delete flag
  sortOrder: number;             // Position in page
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  publishedAt?: string;          // Last publish timestamp
  publishedBy?: string;          // Admin ID who published
}
```

### 4.4 Sub-Configuration Types

#### Background Config

```typescript
interface BackgroundConfig {
  type: 'color' | 'image' | 'gradient' | 'video' | 'none';
  color?: string;              // CSS color value or token
  imageUrl?: string;           // Cloudinary URL
  imageAlt?: string;           // Alt text for background image
  gradient?: {
    type: 'linear' | 'radial';
    direction?: string;        // CSS gradient direction
    stops: Array<{ color: string; position: number }>;
  };
  overlay?: {
    color: string;
    opacity: number;           // 0-100
  };
  videoUrl?: string;           // Cloudinary video URL
  videoPoster?: string;        // Poster image URL
}
```

#### Layout Config

```typescript
interface LayoutConfig {
  container: 'full-width' | 'boxed' | 'wide' | 'narrow';
  maxWidth?: number;           // Max width in px (for boxed)
  columns?: {
    mobile: number;            // 1-4
    tablet: number;            // 1-8
    desktop: number;           // 1-12
  };
  gap?: {
    mobile: number;            // px
    tablet: number;
    desktop: number;
  };
  alignment?: 'left' | 'center' | 'right';
  splitRatio?: number;         // For split layouts (0-100)
}
```

#### Theme Config

```typescript
interface ThemeConfig {
  textColor?: string;          // Override text color
  headingColor?: string;       // Override heading color
  accentColor?: string;        // Override accent color
  fontFamily?: 'display' | 'body';  // Font family override
  textAlignment?: 'left' | 'center' | 'right';
}
```

#### Spacing Config

```typescript
interface SpacingConfig {
  sectionPadding: {
    top: SpacingToken;
    bottom: SpacingToken;
    left: SpacingToken;
    right: SpacingToken;
  };
  elementGap: SpacingToken;    // Gap between child elements
}

type SpacingToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
```

#### Visibility Config

```typescript
interface VisibilityConfig {
  isActive: boolean;            // Master toggle
  showOn: ('mobile' | 'tablet' | 'desktop')[];  // Device visibility
  dateRange?: {                 // Scheduled visibility
    start?: string;             // ISO date
    end?: string;               // ISO date
  };
  audience?: 'all' | 'logged-in' | 'guest';  // User type
}
```

#### Responsive Config

```typescript
interface ResponsiveConfig {
  mobile?: Partial<SectionConfig>;   // Mobile overrides
  tablet?: Partial<SectionConfig>;   // Tablet overrides
  desktop?: Partial<SectionConfig>;  // Desktop overrides
}
```

#### Animation Config

```typescript
interface AnimationConfig {
  entrance?: {
    type: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'none';
    duration: 'fast' | 'normal' | 'slow';
    delay: number;              // ms
    once: boolean;              // Animate only once
  };
  hover?: {
    type: 'scale' | 'lift' | 'glow' | 'none';
    intensity: 'subtle' | 'medium' | 'strong';
  };
  parallax?: {
    enabled: boolean;
    speed: number;              // 0.1-1.0
  };
}
```

#### CTA Config

```typescript
interface CtaConfig {
  label: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline' | 'gold' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  openInNewTab: boolean;
  icon?: string;                // Lucide icon name
  iconPosition?: 'left' | 'right';
}
```

#### Media Config

```typescript
interface MediaConfig {
  desktop?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  mobile?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  video?: {
    url: string;
    poster?: string;
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
  };
}
```

### 4.5 Configuration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Zod validation** | Every config validated against schema | Prevent invalid data |
| **Sensible defaults** | Every optional field has a default | Sections render without full config |
| **Token-based values** | Use design tokens, not raw values | Consistency |
| **Responsive by default** | Every section has mobile config | Mobile-first |
| **No secrets in config** | No API keys, tokens, or credentials | Security |
| **Version on change** | Increment version on every edit | Rollback capability |
| **Immutable published** | Published config frozen until next edit | Stability |

---

## 5. Preview Architecture

### 5.1 What

The system that enables admins to see exactly how the homepage will look before publishing, with real-time updates as they edit.

### 5.2 Why

- **Confidence:** Admins know exactly what will be published
- **Safety:** No accidental publication of broken layouts
- **Speed:** Real-time feedback during editing
- **Accuracy:** Preview matches published output exactly

### 5.3 Where

`/admin/cms/homepage/preview` — Admin-only preview route.

### 5.4 Preview Modes

| Mode | Description | When Used |
|------|-------------|-----------|
| **Live Preview** | Side-by-side editor + preview | During editing |
| **Full Preview** | Full-page preview, no editor | Before publishing |
| **Device Preview** | Simulate mobile/tablet/desktop | Responsive testing |
| **Share Preview** | Generate shareable preview URL | Stakeholder review |

### 5.5 Preview Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PREVIEW ARCHITECTURE                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ADMIN EDITOR (Left Panel)                                │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Section List (drag to reorder)                     │  │   │
│  │  │  Section Config Form (edit fields)                  │  │   │
│  │  │  Responsive Toggle (mobile/tablet/desktop)          │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          │ PostMessage / Zustand                 │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PREVIEW FRAME (Right Panel)                              │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  HomepageRenderer (same as public)                  │  │   │
│  │  │  + Device frame (mobile/tablet/desktop)             │  │   │
│  │  │  + Hot reload on config change                      │  │   │
│  │  │  + No analytics, no tracking                        │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.6 Preview Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Same renderer** | Public and preview use identical renderer | Accuracy |
| **No analytics** | Preview doesn't fire tracking events | Data integrity |
| **No caching** | Preview always fetches latest config | Fresh data |
| **Device frames** | Show device bezels for context | Realistic preview |
| **Hot reload** | Update preview on every config change | Real-time feedback |
| **Preview URL** | `/admin/cms/homepage/preview` | Bookmarkable |
| **Auth required** | Preview only accessible to admins | Security |
| **Noindex** | Preview pages marked `noindex` | SEO protection |

---

## 6. Publishing Workflow

### 6.1 What

The controlled process of making draft changes live on the public homepage.

### 6.2 Why

- **Safety:** Prevent accidental publication of incomplete changes
- **Review:** Optional review step before publication
- **Auditability:** Track who published what and when
- **Rollback:** Easy recovery from problematic publications

### 6.3 Publishing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLISHING WORKFLOW                             │
│                                                                  │
│  1. EDIT                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Admin edits sections in draft mode                      │   │
│  │  Changes saved as draft (not live)                        │   │
│  │  Auto-save every 30 seconds                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  2. VALIDATE                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Client-side validation on every field change            │   │
│  │  Server-side validation on publish request               │   │
│  │  Block publish if validation fails                        │   │
│  │  Show clear error messages for each issue                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  3. PREVIEW                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Admin reviews full preview before publishing            │   │
│  │  Device preview (mobile, tablet, desktop)                 │   │
│  │  Optional: share preview URL with stakeholders           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  4. CONFIRM                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Confirmation dialog: "Publish these changes?"            │   │
│  │  Show summary: X sections changed, Y sections added      │   │
│  │  Optional: publish note (what changed and why)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  5. PUBLISH                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Server atomically swaps draft → published               │   │
│  │  Increment version number                                 │   │
│  │  Clear edge cache (KV invalidation)                       │   │
│  │  Audit log: who, what, when                               │   │
│  │  Success toast: "Homepage published successfully"         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  6. POST-PUBLISH                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Invalidate CDN cache                                     │   │
│  │  Notify stakeholders (optional)                           │   │
│  │  Schedule next review (optional)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Publishing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Validation required** | All required fields must pass validation | Prevent broken pages |
| **Confirmation dialog** | Always show before publishing | Prevent accidents |
| **Atomic publish** | All changes publish atomically | Consistency |
| **Cache invalidation** | Clear KV cache on publish | Fresh content |
| **Audit logging** | Log publish event with admin ID | Accountability |
| **Version increment** | Version number incremented on publish | Rollback tracking |
| **Draft preserved** | Draft not deleted after publish | Re-edit capability |
| **Optional notes** | Admin can add publish notes | Communication |

---

## 7. Draft & Version Management

### 7.1 What

The system for managing multiple versions of the homepage, including drafts, published versions, and historical versions.

### 7.2 Why

- **Safety:** Always have a working version to revert to
- **Collaboration:** Multiple admins can work on drafts
- **Auditability:** Complete history of all changes
- **Flexibility:** Work on next version while current is live

### 7.3 Version Strategy

```typescript
interface HomepageVersion {
  id: string;
  version: number;              // Sequential version number
  status: 'draft' | 'published' | 'archived';
  sections: SectionConfig[];    // Ordered section configs
  settings: HomepageSettings;   // Global page settings
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  note?: string;                // Admin's publish note
}
```

### 7.4 Version Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One active draft** | Only one draft version at a time | Prevent merge conflicts |
| **One published** | Only one published version at a time | Single source of truth |
| **Keep last 50 versions** | Archive older versions | Storage management |
| **Draft is editable** | Only draft version can be edited | Safe editing |
| **Published is frozen** | Published version is read-only | Stability |
| **Rollback = publish old** | Rollback publishes a previous version | Simple recovery |
| **Auto-archive** | Auto-archive versions older than 90 days | Cleanup |

### 7.5 Rollback Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROLLBACK PROCESS                               │
│                                                                  │
│  1. Admin selects version from history list                      │
│  2. System creates new draft from selected version               │
│  3. Admin reviews the rolled-back content                        │
│  4. Admin publishes the rolled-back version                      │
│  5. Previous published version archived automatically            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Section Management Operations

### 8.1 What

The complete set of operations that admins can perform on sections within the Homepage Builder.

### 8.2 Why

- **Flexibility:** Full control over page composition
- **Efficiency:** Quick manipulation of sections
- **Safety:** Every operation is reversible
- **Intuitive:** Operations match real-world mental models

### 8.3 Operations Reference

| Operation | Description | Trigger | Feedback | Undo |
|-----------|-------------|---------|----------|------|
| **Add Section** | Add new section to page | Click "Add Section" in toolbar | Section appears at bottom | Remove the section |
| **Duplicate Section** | Copy section with all config | Click duplicate icon on section | Copy appears below original | Remove the duplicate |
| **Copy Section** | Copy section config to clipboard | Click copy icon on section | Toast: "Section copied" | Paste overwrites clipboard |
| **Paste Section** | Insert copied section at position | Click paste button | Section inserted at position | Remove the pasted section |
| **Move Section** | Change section order | Drag handle / arrow buttons | Section moves to new position | Move back to original position |
| **Delete Section** | Remove section from page | Click delete icon → confirm | Section removed with undo toast | Click "Undo" in toast (5s) |
| **Hide Section** | Temporarily hide from public | Toggle visibility switch | Section dims in editor, hidden on public | Toggle visibility back on |
| **Show Section** | Make hidden section visible | Toggle visibility switch | Section brightens in editor, visible on public | Toggle visibility off |
| **Enable Section** | Activate section | Toggle enable switch | Section active | Toggle enable off |
| **Disable Section** | Deactivate section | Toggle enable switch | Section inactive, shows placeholder | Toggle enable on |
| **Reorder Sections** | Change section order | Drag and drop / move buttons | Section moves to new position | Move back |
| **Preview Section** | See section in isolation | Click preview icon | Section shown in full preview | Close preview |
| **Configure Section** | Edit section settings | Click section or edit icon | Config panel opens | Cancel editing |

### 8.4 Operation UX Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Confirmation on delete** | Dialog: "Delete this section?" | Prevent accidents |
| **Undo toast** | Toast with "Undo" button for 5 seconds | Easy recovery |
| **Drag feedback** | Visual placeholder during drag | Clear feedback |
| **Disabled state** | Grayed out section when disabled | Visual clarity |
| **Empty state** | Placeholder when no sections | Guidance |
| **Keyboard support** | All operations accessible via keyboard | Accessibility |
| **Touch support** | Long-press to reorder on mobile | Mobile optimization |
| **Batch operations** | Select multiple for bulk actions (future) | Efficiency |

### 8.5 Section Reorder Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                    REORDER MECHANICS                               │
│                                                                  │
│  Desktop:                                                        │
│  • Drag handle on left side of section header                    │
│  • Visual placeholder follows cursor                             │
│  • Drop zone highlights on hover                                 │
│  • Smooth animation on drop                                      │
│                                                                  │
│  Mobile:                                                         │
│  • Long-press on section to enter reorder mode                   │
│  • Move up/down buttons appear                                   │
│  • Haptic feedback on move                                       │
│  • Auto-scroll when near edge                                    │
│                                                                  │
│  Keyboard:                                                       │
│  • Focus section header                                          │
│  • Arrow Up/Down to move section                                 │
│  • Enter to confirm position                                     │
│  • Escape to cancel                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Supported Section Types

### 9.1 What

The complete catalog of section types available in the Homepage Builder, each with its own configuration schema, rendering component, and default settings.

### 9.2 Why

- **Completeness:** Cover all common homepage needs
- **Flexibility:** Mix and match sections for unique pages
- **Quality:** Each section is designed to premium standards
- **Extensibility:** New sections plug into the registry

### 9.3 Section Type Catalog

#### 9.3.1 Hero Sections

##### Hero Banner

| Property | Value |
|----------|-------|
| **Type ID** | `hero-banner` |
| **Category** | `hero` |
| **Description** | Full-width hero with background image, headline, subtitle, and CTA |
| **Best For** | Primary homepage hero, promotional launches |
| **Layout** | Full-width, centered content |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Main headline |
| `subtitle` | string | No | — | Supporting text |
| `description` | string | No | — | Extended description |
| `cta` | CtaConfig | Yes | — | Primary CTA button |
| `secondaryCta` | CtaConfig | No | — | Secondary CTA button |
| `media` | MediaConfig | Yes | — | Background image/video |
| `layout` | LayoutConfig | No | `full-width, centered` | Layout settings |
| `background` | BackgroundConfig | No | Image from media | Background settings |
| `animation` | AnimationConfig | No | `fade-in` | Entrance animation |

**Responsive Behavior:**

| Breakpoint | Height | Content Position | Typography |
|------------|--------|------------------|------------|
| Mobile | 80dvh | Bottom-aligned | text-3xl |
| Tablet | 80dvh | Center | text-4xl |
| Desktop | 100dvh | Center | text-5xl |

##### Hero Video

| Property | Value |
|----------|-------|
| **Type ID** | `hero-video` |
| **Category** | `hero` |
| **Description** | Full-width hero with background video, headline, and CTA |
| **Best For** | Brand storytelling, product showcases |
| **Layout** | Full-width, centered content |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Main headline |
| `subtitle` | string | No | — | Supporting text |
| `cta` | CtaConfig | Yes | — | Primary CTA button |
| `media` | MediaConfig | Yes | — | Background video with poster |
| `autoplay` | boolean | No | `true` | Auto-play video |
| `loop` | boolean | No | `true` | Loop video |
| `muted` | boolean | No | `true` | Mute video (required for autoplay) |

**Responsive Behavior:**

| Breakpoint | Video | Content |
|------------|-------|---------|
| Mobile | Poster image only | Bottom-aligned |
| Tablet | Video plays | Center |
| Desktop | Video plays | Center |

#### 9.3.2 Product Sections

##### Product Grid

| Property | Value |
|----------|-------|
| **Type ID** | `product-grid` |
| **Category** | `products` |
| **Description** | Grid of products from a dynamic source |
| **Best For** | New arrivals, best sellers, sale items |
| **Layout** | Boxed, responsive grid |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Section heading |
| `subtitle` | string | No | — | Section subheading |
| `source` | DataSourceConfig | Yes | — | Product source configuration |
| `columns` | ResponsiveColumns | No | `2/3/4` | Grid columns per breakpoint |
| `maxItems` | number | No | `8` | Maximum products to show |
| `cta` | CtaConfig | No | — | "View All" link |
| `layout` | LayoutConfig | No | `boxed` | Layout settings |

**Data Source Config:**

```typescript
interface ProductSourceConfig {
  type: 'collection' | 'category' | 'manual' | 'best-sellers' | 'new-arrivals' | 'sale';
  collectionId?: string;     // For 'collection' type
  categoryId?: string;       // For 'category' type
  productIds?: string[];     // For 'manual' type
  limit?: number;            // Max products (default: 8)
  sortBy?: string;           // Sort field
  sortOrder?: 'asc' | 'desc';
}
```

##### Featured Collection

| Property | Value |
|----------|-------|
| **Type ID** | `featured-collection` |
| **Category** | `products` |
| **Description** | Highlight a single collection with hero imagery |
| **Best For** | Seasonal collections, curated edits |
| **Layout** | Split or full-width |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Section heading |
| `collectionId` | string | Yes | — | Collection to feature |
| `layout` | `'split' \| 'grid' \| 'hero'` | No | `'split'` | Layout variant |
| `maxProducts` | number | No | `4` | Products to show |
| `cta` | CtaConfig | No | — | "Shop Collection" link |
| `background` | BackgroundConfig | No | — | Section background |

##### Featured Categories

| Property | Value |
|----------|-------|
| **Type ID** | `featured-categories` |
| **Category** | `products` |
| **Description** | Grid of category cards with images |
| **Best For** | Category navigation, shop by type |
| **Layout** | Boxed, responsive grid |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Section heading |
| `categories` | string[] | Yes | — | Category IDs to show |
| `layout` | ResponsiveColumns | No | `2/3/4` | Grid columns |
| `showProductCount` | boolean | No | `true` | Show product count |
| `cta` | CtaConfig | No | — | "View All Categories" link |

#### 9.3.3 Promotional Sections

##### Promotional Banner

| Property | Value |
|----------|-------|
| **Type ID** | `promo-banner` |
| **Category** | `content` |
| **Description** | Promotional banner with image, text, and CTA |
| **Best For** | Sales, launches, announcements |
| **Layout** | Full-width or boxed |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Promo headline |
| `subtitle` | string | No | — | Promo subheading |
| `description` | string | No | — | Promo details |
| `cta` | CtaConfig | Yes | — | Action button |
| `media` | MediaConfig | No | — | Banner image |
| `background` | BackgroundConfig | No | — | Background color/gradient |
| `layout` | `'left' \| 'center' \| 'right'` | No | `'center'` | Content alignment |

##### Flash Sale

| Property | Value |
|----------|-------|
| **Type ID** | `flash-sale` |
| **Category** | `products` |
| **Description** | Time-limited sale section with countdown |
| **Best For** | Flash sales, limited offers |
| **Layout** | Boxed, with countdown |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Sale headline |
| `endTime` | string | Yes | — | Sale end time (ISO) |
| `source` | ProductSourceConfig | Yes | — | Sale products |
| `badge` | string | No | `'SALE'` | Sale badge text |
| `background` | BackgroundConfig | No | Red accent | Sale background |

##### Countdown

| Property | Value |
|----------|-------|
| **Type ID** | `countdown` |
| **Category** | `content` |
| **Description** | Countdown timer to an event |
| **Best For** | Product launches, event countdowns |
| **Layout** | Centered, full-width or boxed |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Countdown headline |
| `subtitle` | string | No | — | Supporting text |
| `targetDate` | string | Yes | — | Target date/time (ISO) |
| `background` | BackgroundConfig | No | — | Section background |
| `onComplete` | `'show-message' \| 'redirect' \| 'hide'` | No | `'show-message'` | What happens when timer ends |
| `completeMessage` | string | No | `'Coming Soon!'` | Message after completion |

#### 9.3.4 Content Sections

##### Newsletter

| Property | Value |
|----------|-------|
| **Type ID** | `newsletter` |
| **Category** | `social` |
| **Description** | Email newsletter signup section |
| **Best For** | Building email list |
| **Layout** | Centered, boxed |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Signup headline |
| `subtitle` | string | No | — | Supporting text |
| `placeholder` | string | No | `'Enter your email'` | Input placeholder |
| `buttonLabel` | string | No | `'Subscribe'` | Button text |
| `background` | BackgroundConfig | No | Brand color | Section background |
| `disclaimer` | string | No | — | Privacy disclaimer text |

##### Testimonials

| Property | Value |
|----------|-------|
| **Type ID** | `testimonials` |
| **Category** | `social` |
| **Description** | Customer testimonials carousel or grid |
| **Best For** | Social proof, trust building |
| **Layout** | Boxed, carousel or grid |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Section heading |
| `testimonials` | Testimonial[] | Yes | — | Testimonial entries |
| `layout` | `'carousel' \| 'grid' \| 'single'` | No | `'carousel'` | Display layout |
| `background` | BackgroundConfig | No | — | Section background |

```typescript
interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  rating: number;          // 1-5
  text: string;
  product?: string;        // Related product name
}
```

##### Blog Preview

| Property | Value |
|----------|-------|
| **Type ID** | `blog-preview` |
| **Category** | `content` |
| **Description** | Latest blog articles preview |
| **Best For** | Content marketing, SEO |
| **Layout** | Boxed, responsive grid |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | Section heading |
| `count` | number | No | `3` | Number of articles |
| `category` | string | No | — | Filter by category |
| `layout` | `'grid' \| 'featured'` | No | `'grid'` | Layout variant |
| `cta` | CtaConfig | No | — | "Read More" link |

##### Rich Content

| Property | Value |
|----------|-------|
| **Type ID** | `rich-content` |
| **Category** | `content` |
| **Description** | Rich text content block with formatting |
| **Best For** | About sections, descriptions, policies |
| **Layout** | Boxed, narrow for readability |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `content` | string | Yes | — | Rich text (sanitized HTML) |
| `layout` | `'left' \| 'center' \| 'right'` | No | `'center'` | Text alignment |
| `maxWidth` | number | No | `640` | Max content width (px) |
| `background` | BackgroundConfig | No | — | Section background |

##### Image Gallery

| Property | Value |
|----------|-------|
| **Type ID** | `image-gallery` |
| **Category** | `content` |
| **Description** | Grid or masonry of images |
| **Best For** | Lookbooks, lifestyle imagery |
| **Layout** | Full-width or boxed |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | No | — | Section heading |
| `images` | GalleryImage[] | Yes | — | Gallery images |
| `layout` | `'grid' \| 'masonry' \| 'carousel'` | No | `'grid'` | Layout variant |
| `columns` | ResponsiveColumns | No | `2/3/4` | Grid columns |
| `aspectRatio` | `'1:1' \| '3:4' \| '16:9'` | No | `'3:4'` | Image aspect ratio |

```typescript
interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  link?: string;
}
```

##### Video Block

| Property | Value |
|----------|-------|
| **Type ID** | `video-block` |
| **Category** | `content` |
| **Description** | Embedded video player |
| **Best For** | Product videos, brand videos |
| **Layout** | Boxed or full-width |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | No | — | Video heading |
| `videoUrl` | string | Yes | — | Video URL (Cloudinary) |
| `poster` | string | No | — | Thumbnail image |
| `autoplay` | boolean | No | `false` | Auto-play on load |
| `loop` | boolean | No | `false` | Loop video |
| `aspectRatio` | `'16:9' \| '9:16' \| '1:1'` | No | `'16:9'` | Video aspect ratio |

##### CTA Block

| Property | Value |
|----------|-------|
| **Type ID** | `cta-block` |
| **Category** | `content` |
| **Description** | Call-to-action section with buttons |
| **Best For** | Conversion, signups, downloads |
| **Layout** | Centered, full-width or boxed |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `title` | string | Yes | — | CTA headline |
| `subtitle` | string | No | — | Supporting text |
| `primaryCta` | CtaConfig | Yes | — | Primary button |
| `secondaryCta` | CtaConfig | No | — | Secondary button |
| `background` | BackgroundConfig | No | — | Section background |

#### 9.3.5 Utility Sections

##### Spacer

| Property | Value |
|----------|-------|
| **Type ID** | `spacer` |
| **Category** | `utility` |
| **Description** | Empty space between sections |
| **Best For** | Visual breathing room |
| **Layout** | N/A |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `height` | ResponsiveSpacing | No | `48/48/64` | Height per breakpoint |

```typescript
interface ResponsiveSpacing {
  mobile: number;   // px
  tablet: number;
  desktop: number;
}
```

##### Divider

| Property | Value |
|----------|-------|
| **Type ID** | `divider` |
| **Category** | `utility` |
| **Description** | Horizontal line separator |
| **Best For** | Visual separation |
| **Layout** | Full-width or boxed |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `style` | `'solid' \| 'dashed' \| 'dotted' \| 'gradient'` | No | `'solid'` | Line style |
| `color` | string | No | `neutral-200` | Line color |
| `thickness` | number | No | `1` | Line thickness (px) |
| `width` | `'full' \| 'container'` | No | `'container'` | Line width |

##### Custom Section

| Property | Value |
|----------|-------|
| **Type ID** | `custom` |
| **Category** | `content` |
| **Description** | Custom HTML/CSS section (advanced) |
| **Best For** | Unique layouts, third-party embeds |
| **Layout** | Configurable |

**Config Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `html` | string | Yes | — | Sanitized HTML content |
| `css` | string | No | — | Scoped CSS styles |
| `javascript` | string | No | — | Embedded scripts (sandboxed) |

> **Security Note:** Custom sections are sandboxed. External scripts loaded via iframe. Inline JavaScript restricted to admin-only sections. All HTML sanitized with DOMPurify.

### 9.4 Section Type Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One type per section** | Each section has exactly one type | Clarity |
| **Type immutability** | Cannot change type after creation | Prevent config corruption |
| **Default config** | Every type provides sensible defaults | Sections render without full config |
| **Schema validation** | Every type has a Zod schema | Prevent invalid configs |
| **Lazy loading** | Every type component is lazy-loaded | Performance |
| **Error boundary** | Every type renders inside error boundary | Resilience |
| **Accessibility** | Every type produces accessible HTML | WCAG compliance |
| **Responsive** | Every type works on mobile, tablet, desktop | Mobile-first |

---

## 10. Section Configuration Standards

### 10.1 What

Universal configuration standards that apply to all section types, defining what every section must support.

### 10.2 Why

- **Consistency:** Same configuration patterns across all sections
- **Discoverability:** Admins know what to expect from each section
- **Maintainability:** Changes to common patterns apply everywhere
- **Quality:** Every section meets minimum configuration standards

### 10.3 Universal Config Fields

Every section, regardless of type, must support these configuration fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string (UUID) | Auto | Unique section identifier |
| `type` | string | Yes | Section type identifier |
| `title` | string | Yes | Section heading (visible or hidden) |
| `subtitle` | string | No | Section subheading |
| `description` | string | No | Rich text description |
| `background` | BackgroundConfig | Yes | Section background |
| `layout` | LayoutConfig | Yes | Layout settings |
| `theme` | ThemeConfig | No | Color/typography overrides |
| `visibility` | VisibilityConfig | Yes | When/where to show |
| `displayRules` | DisplayRule[] | No | Conditional display rules |
| `responsive` | ResponsiveConfig | No | Per-breakpoint overrides |
| `animation` | AnimationConfig | No | Entrance/hover animations |
| `cta` | CtaConfig | No | Primary call-to-action |
| `media` | MediaConfig | No | Images/videos |
| `sorting` | SortingConfig | No | Content sorting |
| `source` | DataSourceConfig | No | Dynamic data source |
| `isActive` | boolean | Auto | Soft delete flag |
| `sortOrder` | number | Auto | Position in page |
| `createdAt` | string | Auto | Creation timestamp |
| `updatedAt` | string | Auto | Last update timestamp |

### 10.4 Display Rules

Display rules define conditions under which a section is shown or hidden:

```typescript
interface DisplayRule {
  id: string;
  type: 'date-range' | 'device' | 'audience' | 'locale' | 'url-pattern';
  condition: 'show' | 'hide';
  value: string | string[];
}
```

**Example Display Rules:**

| Rule Type | Condition | Value | Effect |
|-----------|-----------|-------|--------|
| `date-range` | `show` | `["2026-12-01", "2026-12-31"]` | Show only during December |
| `device` | `hide` | `["mobile"]` | Hide on mobile |
| `audience` | `show` | `["logged-in"]` | Show only to logged-in users |
| `locale` | `show` | `["en-IN", "hi-IN"]` | Show only for Indian locales |
| `url-pattern` | `show` | `["/shop/*"]` | Show only on shop pages |

### 10.5 Configuration UX Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Inline editing** | Edit title directly on preview | Fast, intuitive |
| **Form panel** | Detailed config in side panel | Complete control |
| **Validation on blur** | Validate when leaving field | Immediate feedback |
| **Default values** | Pre-fill with sensible defaults | Reduce friction |
| **Help text** | Tooltip or helper text on complex fields | Guidance |
| **Required indicators** | Asterisk on required fields | Clarity |
| **Field grouping** | Group related fields in panels | Organization |
| **Progressive disclosure** | Advanced settings behind "More options" | Simplicity |

---

## 11. Layout System

### 11.1 What

The standard layout patterns and container system that all homepage sections must follow, ensuring consistent spacing, alignment, and responsive behavior.

### 11.2 Why

- **Consistency:** Same layout patterns across all sections
- **Readability:** Proper container widths for content
- **Premium feel:** Generous spacing signals quality
- **Responsive:** Adapts to all screen sizes

### 11.3 Where

Every section's layout wrapper and inner content structure.

### 11.4 Container Types

| Container | Max Width | Padding | Usage | Tailwind |
|-----------|-----------|---------|-------|----------|
| **Full Width** | 100% | 16/24/32px | Hero, backgrounds | `w-full` |
| **Wide** | 1440px | 16/24/32px | Hero content, editorial | `max-w-[1440px] mx-auto` |
| **Boxed (Default)** | 1280px | 16/24/32px | Most sections | `max-w-7xl mx-auto` |
| **Narrow** | 640px | 16/24/32px | Text content, forms | `max-w-screen-sm mx-auto` |

### 11.5 Section Spacing

| Spacing Token | Mobile | Tablet | Desktop | Tailwind |
|---------------|--------|--------|---------|----------|
| `none` | 0 | 0 | 0 | `py-0` |
| `xs` | 16px | 24px | 32px | `py-4 sm:py-6 lg:py-8` |
| `sm` | 24px | 32px | 48px | `py-6 sm:py-8 lg:py-12` |
| `md` (default) | 32px | 48px | 64px | `py-8 sm:py-12 lg:py-16` |
| `lg` | 48px | 64px | 80px | `py-12 sm:py-16 lg:py-20` |
| `xl` | 64px | 80px | 96px | `py-16 sm:py-20 lg:py-24` |
| `2xl` | 80px | 96px | 128px | `py-20 sm:py-24 lg:py-32` |
| `3xl` | 96px | 128px | 160px | `py-24 sm:py-32 lg:py-40` |

### 11.6 Grid Layouts

| Layout | Mobile | Tablet | Desktop | Tailwind |
|--------|--------|--------|---------|----------|
| **1 Column** | 1 | 1 | 1 | `grid grid-cols-1` |
| **2 Column** | 1 | 2 | 2 | `grid grid-cols-1 sm:grid-cols-2` |
| **3 Column** | 1 | 2 | 3 | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| **4 Column** | 2 | 3 | 4 | `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` |
| **Split** | Stacked | 50/50 | 50/50 | `grid grid-cols-1 lg:grid-cols-2` |
| **Sidebar** | Stacked | Stacked | 280px + flex | `flex flex-col lg:flex-row` |

### 11.7 Layout Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile-first** | Base styles for mobile, enhance for larger | 70%+ traffic |
| **Consistent padding** | Same padding across all containers | Visual rhythm |
| **Max content width** | Never exceed 1440px for text | Readability |
| **Full-width backgrounds** | Backgrounds extend to viewport edges | Premium feel |
| **Centered content** | Content always centered in container | Balance |
| **No horizontal scroll** | `overflow-x: hidden` on sections | UX |
| **Safe area awareness** | Account for device safe areas | Modern devices |

---

## 12. Responsive Behavior

### 12.1 What

Standards for how sections adapt across mobile, tablet, desktop, and large screen breakpoints.

### 12.2 Why

- **Mobile-first:** 70%+ traffic is mobile
- **Consistency:** Same breakpoints as DESIGN_SYSTEM_ARCHITECTURE.md
- **Quality:** Premium experience on every device
- **Accessibility:** Readable and usable at every size

### 12.3 Breakpoint Definitions

| Name | Width | Tailwind Prefix | Target |
|------|-------|-----------------|--------|
| **Mobile** | 0–639px | (none) | Phones |
| **Tablet** | 640–1023px | `sm:` | Tablets |
| **Desktop** | 1024–1279px | `md:` | Laptops |
| **Wide** | 1280px+ | `lg:` | Desktops |

### 12.4 Responsive Rules by Section Type

#### Hero Sections

| Breakpoint | Height | Typography | CTA Size | Content Position |
|------------|--------|------------|----------|------------------|
| Mobile | 80dvh | text-3xl | sm | Bottom-aligned |
| Tablet | 80dvh | text-4xl | md | Center |
| Desktop | 100dvh | text-5xl | lg | Center |

#### Product Grids

| Breakpoint | Columns | Gap | Card Size |
|------------|---------|-----|-----------|
| Mobile | 2 | 12px | Full-width |
| Tablet | 3 | 16px | Medium |
| Desktop | 4 | 24px | Standard |

#### Content Sections

| Breakpoint | Max Width | Typography | Spacing |
|------------|-----------|------------|---------|
| Mobile | 100% | text-base | py-8 |
| Tablet | 640px | text-lg | py-12 |
| Desktop | 640px | text-lg | py-16 |

### 12.5 Responsive Configuration

```typescript
interface ResponsiveConfig {
  mobile?: {
    layout?: Partial<LayoutConfig>;
    spacing?: Partial<SpacingConfig>;
    typography?: { fontSize?: string; lineHeight?: string };
    columns?: number;
    hidden?: boolean;
  };
  tablet?: {
    layout?: Partial<LayoutConfig>;
    spacing?: Partial<SpacingConfig>;
    typography?: { fontSize?: string; lineHeight?: string };
    columns?: number;
    hidden?: boolean;
  };
  desktop?: {
    layout?: Partial<LayoutConfig>;
    spacing?: Partial<SpacingConfig>;
    typography?: { fontSize?: string; lineHeight?: string };
    columns?: number;
    hidden?: boolean;
  };
}
```

### 12.6 Responsive Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile-first** | Base styles = mobile | 70%+ traffic |
| **Progressive enhancement** | Add styles for larger screens | Better UX |
| **Touch targets** | Min 44x44px on mobile | Accessibility |
| **Text scaling** | Use rem/em, not px | Accessibility |
| **No horizontal scroll** | Content stays within viewport | UX |
| **Test at breakpoints** | Verify layout at each breakpoint | Consistency |
| **Image optimization** | Serve appropriate sizes per device | Performance |

### 12.7 Large Screen Optimization

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max width 1440px** | Content doesn't stretch on ultrawide | Readability |
| **Increased spacing** | More generous padding on large screens | Premium feel |
| **Larger typography** | Scale up text for large viewports | Readability |
| **Multi-column layouts** | Take advantage of extra space | Efficient use |

---

## 13. CMS Experience Standards

### 13.1 What

UX standards for the Homepage Builder admin interface, ensuring it's usable by non-technical administrators.

### 13.2 Why

- **Adoption:** Admins actually use the builder
- **Efficiency:** Tasks complete quickly
- **Confidence:** Admins trust the system
- **Reduced support:** Fewer support tickets

### 13.3 Editing Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Drag-and-drop reorder** | Visual drag handles on sections | Intuitive |
| **Inline editing** | Click text to edit directly | Fast |
| **Form panel** | Detailed config in side panel | Complete control |
| **Real-time preview** | Preview updates as you type | Immediate feedback |
| **Auto-save** | Save every 30 seconds | Prevent data loss |
| **Keyboard shortcuts** | Ctrl+Z undo, Ctrl+S save | Power users |
| **Copy/paste sections** | Duplicate entire section configs | Efficiency |
| **Undo/redo** | Full undo stack within session | Error recovery |

### 13.4 Preview Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Device preview** | Mobile/tablet/desktop toggle | Responsive testing |
| **Full-page preview** | Preview entire homepage | Complete picture |
| **Share preview URL** | Generate temporary preview link | Stakeholder review |
| **Preview mode indicator** | Clear "Preview Mode" banner | Orientation |
| **Exit preview** | One-click return to editor | Easy navigation |

### 13.5 Saving Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Auto-save** | Every 30 seconds | Prevent data loss |
| **Manual save** | Ctrl+S or Save button | Explicit control |
| **Save indicator** | Show "Saved" / "Unsaved changes" | Transparency |
| **Save confirmation** | Toast: "Changes saved" | Feedback |
| **Conflict detection** | Warn if another admin editing | Collaboration |

### 13.6 Publishing Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Validation before publish** | Block if invalid | Prevent broken pages |
| **Confirmation dialog** | "Publish these changes?" | Prevent accidents |
| **Publish notes** | Optional note with each publish | Communication |
| **Publish history** | View all published versions | Audit trail |
| **Scheduled publish** | Set future publish date/time | Flexibility |

### 13.7 Validation Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Inline validation** | Validate on field blur | Immediate feedback |
| **Required field indicators** | Asterisk on required fields | Clarity |
| **Error messages** | Clear, actionable error text | Guidance |
| **Field-level errors** | Errors below each field | Association |
| **Form-level errors** | Summary at top of form | Overview |
| **Prevent invalid publish** | Block publish until errors fixed | Safety |

### 13.8 Error Prevention Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Smart defaults** | Pre-fill with sensible values | Reduce errors |
| **Input constraints** | Min/max for numbers, format for dates | Prevent invalid input |
| **Confirmation on destructive** | Confirm before delete | Prevent accidents |
| **Preview before publish** | Always preview before going live | Catch mistakes |
| **Draft mode** | Changes not live until published | Safe editing |
| **Auto-recovery** | Auto-save prevents data loss | Resilience |

### 13.9 Undo & History Standards

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Session undo** | Undo stack within editing session | Quick recovery |
| **Undo toast** | "Undo" button on action toasts | Easy access |
| **Version history** | View and restore previous versions | Long-term recovery |
| **Change tracking** | Show what changed between versions | Transparency |
| **Audit log** | Track who did what and when | Accountability |

---

## 14. Performance Standards

### 14.1 What

Performance standards for the Homepage Builder and the rendered homepage, ensuring fast load times and smooth interactions.

### 14.2 Why

- **User experience:** Fast pages convert better
- **SEO:** Core Web Vitals affect ranking
- **Mobile:** Slow pages lose mobile users
- **Brand:** Premium brands have premium performance

### 14.3 Lazy Rendering

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Above the fold** | Hero section loads immediately | Fast first paint |
| **Below the fold** | Other sections use React.lazy() | Reduce initial bundle |
| **Intersection Observer** | Trigger loading when section enters viewport | Smart loading |
| **Skeleton loaders** | Show skeletons during lazy load | Perceived performance |
| **Progressive loading** | Load critical CSS first, defer rest | Faster render |

### 14.4 Asset Loading

| Asset | Strategy | Rationale |
|-------|----------|-----------|
| **Images** | Lazy load with `loading="lazy"` | Performance |
| **Images** | Responsive `srcSet` for different sizes | Bandwidth |
| **Images** | WebP/AVIF via Cloudinary `f_auto` | Size reduction |
| **Videos** | Poster image, lazy-load player | Performance |
| **Videos** | Compress for mobile bandwidth | Mobile UX |
| **Fonts** | `font-display: swap` | Prevent FOIT |
| **Fonts** | Subset to needed characters | Size reduction |
| **CSS** | Critical CSS inline, rest deferred | First paint |
| **JS** | Code split per section type | Bundle size |

### 14.5 Image Optimization

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Auto format** | Cloudinary `f_auto` for WebP/AVIF | Size reduction |
| **Auto quality** | Cloudinary `q_auto` for smart compression | Quality/size balance |
| **Responsive sizes** | Generate srcSet for 320-2560px | Bandwidth |
| **Lazy loading** | `loading="lazy"` on below-fold images | Performance |
| **Aspect ratio** | CSS `aspect-ratio` to prevent CLS | Layout stability |
| **Alt text** | Always provide descriptive alt text | Accessibility |
| **Blur placeholder** | Show blurred preview while loading | Perceived performance |

### 14.6 Video Optimization

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Poster image** | Show static image before play | Fast initial render |
| **Lazy load** | Don't load video until play | Bandwidth |
| **Compress** | Cloudinary auto-transcode | File size |
| **Adaptive streaming** | Serve appropriate quality | Bandwidth |
| **Muted autoplay** | Required for mobile autoplay | Browser policy |
| **Loop for hero** | Loop background videos | Continuous content |

### 14.7 Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|------|---------------|-----|--------------|
| Published homepage config | KV edge | 5 minutes | On publish |
| Section data (products) | TanStack Query | 5 minutes | On stale |
| Images | Cloudflare CDN | 1 year | On upload |
| Static assets | Cloudflare CDN | 1 year | On deploy |

### 14.8 Performance Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **INP** | < 200ms | Interaction to Next Paint |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **FCP** | < 1.8s | First Contentful Paint |
| **TTFB** | < 600ms | Time to First Byte |
| **Bundle size** | < 200KB initial | First load JS |

---

## 15. Security Standards

### 15.1 What

Security standards for the Homepage Builder, ensuring all content is validated, sanitized, and safe.

### 15.2 Why

- **XSS prevention:** User-generated content can be malicious
- **Data integrity:** Invalid configs break the page
- **Access control:** Only authorized admins can edit
- **Compliance:** Meet security standards

### 15.3 Content Validation

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Zod schemas** | Validate all config fields | Type safety |
| **URL validation** | Validate all URLs are HTTPS | Security |
| **Image validation** | Validate file types and sizes | Security |
| **Rich text sanitization** | DOMPurify for all HTML content | XSS prevention |
| **Input length limits** | Max length on all text fields | Abuse prevention |
| **No eval()** | Never evaluate user input as code | Code injection |

### 15.4 HTML Sanitization

```typescript
// All rich text content sanitized with DOMPurify
import DOMPurify from 'dompurify';

const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};
```

### 15.5 Safe Embeds

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **iframe sandbox** | All embeds in sandboxed iframes | Isolation |
| **No inline scripts** | Custom sections use sandboxed execution | XSS prevention |
| **CSP headers** | Content Security Policy restricts sources | Defense in depth |
| **No data: URLs** | Prevent data URI attacks | Security |
| **No javascript: URLs** | Prevent JS URI attacks | Security |

### 15.6 Safe Uploads

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **File type whitelist** | Only allow specific image/video types | Security |
| **File size limits** | Max 10MB images, 50MB videos | Abuse prevention |
| **Dimension limits** | Max 4000x4000px | Resource protection |
| **Virus scanning** | Scan uploads before processing | Security |
| **CDN delivery** | Serve via Cloudflare CDN | Performance + security |

### 15.7 Configuration Validation

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Server-side validation** | Validate on every save/publish | Security |
| **Client-side validation** | Validate on input for UX | UX |
| **Schema versioning** | Version schemas for backward compat | Migration |
| **Unknown field stripping** | Remove unknown fields on save | Cleanliness |
| **Type coercion prevention** | Strict type checking | Security |

---

## 16. Accessibility Standards

### 16.1 What

Accessibility standards ensuring the Homepage Builder and rendered homepage are usable by everyone, including users with disabilities.

### 16.2 Why

- **Legal compliance:** WCAG 2.2 AA is the standard
- **Inclusivity:** Everyone can use the platform
- **SEO:** Accessible pages rank better
- **Brand:** Premium brands are accessible brands

### 16.3 Keyboard Support

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Tab navigation** | All interactive elements tab-focusable | Keyboard access |
| **Focus visible** | Clear focus ring on all focusable elements | Visibility |
| **Focus trap** | Modals trap focus inside | Prevent getting lost |
| **Escape key** | ESC closes modals, dropdowns | Recovery |
| **Arrow keys** | Navigate within components | Familiar pattern |
| **Enter/Space** | Activate buttons and links | Standard behavior |
| **Skip link** | "Skip to content" link at top | Navigation aid |

### 16.4 Screen Reader Support

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Semantic HTML** | Use `<nav>`, `<main>`, `<section>`, `<article>` | Structure |
| **ARIA labels** | Label all interactive elements | Identification |
| **ARIA landmarks** | Define page regions | Navigation |
| **Image alt text** | All images have descriptive alt text | Content |
| **Headings hierarchy** | Proper h1-h6 nesting | Structure |
| **Live regions** | Announce dynamic content changes | Updates |
| **Role attributes** | Define custom component roles | Meaning |

### 16.5 Color Contrast

| Standard | Ratio | Usage |
|----------|-------|-------|
| **Normal text** | 4.5:1 minimum | Body text, labels |
| **Large text** | 3:1 minimum | Headlines (18px+ bold) |
| **Interactive** | 3:1 minimum | Buttons, links |
| **Focus indicators** | 3:1 minimum | Focus rings |
| **Error messages** | 4.5:1 minimum | Error text |

### 16.6 Responsive Readability

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **Min font size** | 16px on mobile | Readability |
| **Line height** | 1.5-1.6 for body text | Readability |
| **Line length** | 65-75 characters max | Readability |
| **Paragraph spacing** | Adequate space between paragraphs | Readability |
| **Touch targets** | Min 44x44px | Mobile accessibility |

### 16.7 Reduced Motion

| Standard | Implementation | Rationale |
|----------|---------------|-----------|
| **prefers-reduced-motion** | Respect user preference | Accessibility |
| **Disable animations** | When reduced motion preferred | Comfort |
| **Static fallback** | Show final state without animation | Content access |
| **No auto-play** | Don't auto-play animations | User control |

---

## 17. Future Extensibility

### 17.1 What

The plugin architecture that enables future additions of new sections, widgets, templates, layouts, personalization, A/B testing, and localization.

### 17.2 Why

- **Scalability:** New features without redesign
- **Community:** Third-party section plugins
- **Innovation:** Easy to experiment with new section types
- **Marketplace:** Premium section templates

### 17.3 Plugin Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLUGIN ARCHITECTURE                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CORE (Nabome-built)                                      │   │
│  │  • Hero sections                                          │   │
│  │  • Product sections                                       │   │
│  │  • Content sections                                       │   │
│  │  • Utility sections                                       │   │
│  │  • Rendering engine                                       │   │
│  │  • Configuration system                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PLUGIN API                                               │   │
│  │  • registerSection(type, component, schema, defaults)    │   │
│  │  • registerWidget(type, component, schema)               │   │
│  │  • registerTemplate(config)                              │   │
│  │  • registerLayout(type, component)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FUTURE EXTENSIONS                                        │   │
│  │  • Personalization engine (user-based content)           │   │
│  │  • A/B testing (variant configs)                         │   │
│  │  • Localization (multi-language sections)                │   │
│  │  • Third-party section marketplace                       │   │
│  │  • AI-generated sections                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 17.4 New Section Plugin Interface

```typescript
// Plugin registration interface
interface SectionPlugin {
  type: string;
  component: React.ComponentType<SectionProps>;
  defaultConfig: SectionConfig;
  schema: ZodSchema;
  label: string;
  description: string;
  thumbnail: string;
  category: string;
  version: string;
  author: string;
}

// Plugin registration function
function registerSection(plugin: SectionPlugin): void;
```

### 17.5 Future Feature Readiness

| Feature | Schema Impact | Implementation Strategy |
|---------|---------------|------------------------|
| **New Sections** | Add to registry | `registerSection()` |
| **New Widgets** | Add widget type | `registerWidget()` |
| **New Templates** | Add template config | `registerTemplate()` |
| **New Layouts** | Add layout component | `registerLayout()` |
| **Personalization** | Add audience rules | Display rule engine |
| **A/B Testing** | Add variant configs | Version + percentage split |
| **Localization** | Add locale fields | i18n layer on config |
| **AI Sections** | Add AI generation | Config generation API |

### 17.6 Extensibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Plugin isolation** | Plugins can't access other plugins | Security |
| **Schema validation** | All plugin configs validated | Safety |
| **Type safety** | Full TypeScript support for plugins | Quality |
| **Lazy loading** | Plugins lazy-loaded | Performance |
| **Error boundaries** | Plugin errors don't crash page | Resilience |
| **Version compatibility** | Plugins declare compatible versions | Stability |
| **No core modification** | Plugins extend, never modify core | Maintainability |

---

## 18. Database Schema

### 18.1 What

The PostgreSQL schema for storing homepage configurations, section data, and version history.

### 18.2 Why

- **Persistence:** Configs survive server restarts
- **Versioning:** Complete history of changes
- **Performance:** Indexed for fast reads
- **Integrity:** Constraints prevent invalid data

### 18.3 Schema Design

```prisma
// prisma/schema.prisma — CMS & Homepage tables

// ─── Homepage Configuration ──────────────────────────────────────
model HomepageConfig {
  id            String   @id @default(uuid())
  version       Int      @default(1)
  status        HomepageStatus @default(draft)
  settings      Json     // HomepageSettings (global page settings)
  publishedAt   DateTime?
  publishedBy   String?
  createdBy     String
  note          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  sections      HomepageSection[]

  // Indexes
  @@index([status])
  @@index([version])
  @@index([createdAt])
}

enum HomepageStatus {
  draft
  published
  archived
}

// ─── Homepage Sections ───────────────────────────────────────────
model HomepageSection {
  id            String   @id @default(uuid())
  configId      String   // FK to HomepageConfig
  type          String   @db.VarChar(100)
  sortOrder     Int      @default(0)
  isActive      Boolean  @default(true)
  config        Json     // SectionConfig (type-specific)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  config        HomepageConfig @relation(fields: [configId], references: [id], onDelete: Cascade)

  // Indexes
  @@index([configId])
  @@index([type])
  @@index([configId, sortOrder])
  @@index([isActive])
}

// ─── Section Versions (Audit Trail) ─────────────────────────────
model SectionVersion {
  id            String   @id @default(uuid())
  sectionId     String
  version       Int
  config        Json
  changedBy     String
  changeType    String   @db.VarChar(50) // 'create', 'update', 'delete', 'reorder'
  createdAt     DateTime @default(now())

  // Indexes
  @@index([sectionId])
  @@index([sectionId, version])
  @@index([createdAt])
}

// ─── Homepage Templates ──────────────────────────────────────────
model HomepageTemplate {
  id            String   @id @default(uuid())
  name          String   @db.VarChar(200)
  description   String?
  thumbnail     String?
  config        Json     // Full homepage config
  isSystem      Boolean  @default(false)
  createdBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Indexes
  @@index([isSystem])
  @@index([createdAt])
}

// ─── Media (Extended for CMS) ────────────────────────────────────
// Uses existing Media table from DATABASE_ARCHITECTURE.md
// Add CMS-specific folder structure:
// /cms/homepage/sections/{sectionId}/
// /cms/homepage/banners/
// /cms/homepage/thumbnails/
```

### 18.4 Schema Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **UUID v4 primary keys** | All tables use UUID v4 | Globally unique |
| **Timestamps on all** | `createdAt` + `updatedAt` on every table | Audit trail |
| **Soft delete** | `isActive` boolean, never hard delete | Referential integrity |
| **JSONB for config** | Store section configs as JSONB | Flexible, queryable |
| **Cascade delete** | Delete sections when config deleted | Clean removal |
| **Index foreign keys** | All FK columns indexed | Query performance |
| **Version tracking** | Version number incremented on publish | Rollback capability |

---

## 19. API Design

### 19.1 What

REST API endpoints for managing homepage configurations and sections.

### 19.2 Why

- **Separation:** Backend manages data, frontend renders
- **Security:** Server-side validation and authorization
- **Performance:** Edge caching via Cloudflare KV
- **Scalability:** Stateless handlers scale infinitely

### 19.3 API Endpoints

#### Homepage Config Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cms/homepage` | Public | Get published homepage config |
| `GET` | `/api/cms/homepage/draft` | Admin | Get current draft config |
| `POST` | `/api/cms/homepage/sections` | Admin | Add new section |
| `PATCH` | `/api/cms/homepage/sections/:id` | Admin | Update section config |
| `DELETE` | `/api/cms/homepage/sections/:id` | Admin | Delete section |
| `POST` | `/api/cms/homepage/sections/:id/duplicate` | Admin | Duplicate section |
| `POST` | `/api/cms/homepage/sections/:id/move` | Admin | Move section position |
| `POST` | `/api/cms/homepage/publish` | Admin | Publish draft to live |
| `GET` | `/api/cms/homepage/versions` | Admin | Get version history |
| `POST` | `/api/cms/homepage/versions/:id/rollback` | Admin | Rollback to version |

#### Section Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cms/sections/:id` | Admin | Get section details |
| `PUT` | `/api/cms/sections/:id` | Admin | Full section update |
| `PATCH` | `/api/cms/sections/:id/config` | Admin | Partial config update |
| `POST` | `/api/cms/sections/:id/preview` | Admin | Generate preview data |

### 19.4 API Response Format

```typescript
// Success response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    version?: number;
  };
}

// Error response
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### 19.5 API Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Authentication** | All admin endpoints require auth | Security |
| **Authorization** | Only admins can edit homepage | Security |
| **Validation** | All inputs validated with Zod | Security |
| **Rate limiting** | 100 requests/minute per admin | Abuse prevention |
| **Caching** | Public endpoint cached in KV | Performance |
| **Audit logging** | Log all write operations | Accountability |
| **Idempotency** | Use idempotency keys for mutations | Safety |

---

## 20. Frontend Architecture

### 20.1 What

The React component architecture for the Homepage Builder admin interface and the public homepage renderer.

### 20.2 Why

- **Maintainability:** Clear component hierarchy
- **Reusability:** Components compose from shared primitives
- **Performance:** Lazy loading and code splitting
- **Testability:** Components are pure and isolated

### 20.3 File Structure

```
src/features/home/
├── components/
│   ├── HomepageRenderer.tsx          # Main renderer (public + preview)
│   ├── HomepageEditor.tsx            # Admin editor interface
│   ├── SectionList.tsx               # Drag-and-drop section list
│   ├── SectionConfigPanel.tsx        # Config editing panel
│   ├── SectionPreview.tsx            # Individual section preview
│   ├── PublishButton.tsx             # Publish action button
│   ├── VersionHistory.tsx            # Version history panel
│   └── DevicePreviewToggle.tsx       # Device preview selector
│
├── sections/
│   ├── registry.ts                   # Section type registry
│   ├── HeroBannerSection.tsx         # Hero banner renderer
│   ├── HeroVideoSection.tsx          # Hero video renderer
│   ├── ProductGridSection.tsx        # Product grid renderer
│   ├── FeaturedCollectionSection.tsx # Featured collection renderer
│   ├── FeaturedCategoriesSection.tsx # Featured categories renderer
│   ├── PromoBannerSection.tsx        # Promotional banner renderer
│   ├── FlashSaleSection.tsx          # Flash sale renderer
│   ├── CountdownSection.tsx          # Countdown timer renderer
│   ├── NewsletterSection.tsx         # Newsletter signup renderer
│   ├── TestimonialsSection.tsx       # Testimonials renderer
│   ├── BlogPreviewSection.tsx        # Blog preview renderer
│   ├── RichContentSection.tsx        # Rich content renderer
│   ├── ImageGallerySection.tsx       # Image gallery renderer
│   ├── VideoBlockSection.tsx         # Video block renderer
│   ├── CtaBlockSection.tsx           # CTA block renderer
│   ├── SpacerSection.tsx             # Spacer renderer
│   ├── DividerSection.tsx            # Divider renderer
│   └── CustomSection.tsx             # Custom HTML renderer
│
├── hooks/
│   ├── useHomepage.ts                # Homepage data fetching
│   ├── useHomepageEditor.ts          # Editor state management
│   ├── useSectionConfig.ts           # Section config form state
│   ├── useDragReorder.ts             # Drag-and-drop reorder
│   ├── usePreview.ts                 # Preview mode management
│   └── usePublish.ts                 # Publish action handler
│
├── api/
│   └── homepage.ts                   # Homepage API client
│
├── store/
│   └── homepage-editor-store.ts      # Zustand store for editor state
│
├── validators/
│   └── homepage.ts                   # Zod schemas for all section types
│
└── types.ts                          # Homepage TypeScript types
```

### 20.4 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HomepageRenderer (public)                                │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  ErrorBoundary (per section)                        │  │   │
│  │  │  ┌──────────────────────────────────────────────┐  │  │   │
│  │  │  │  Suspense (with Skeleton fallback)            │  │  │   │
│  │  │  │  ┌────────────────────────────────────────┐  │  │  │   │
│  │  │  │  │  Section Component (lazy-loaded)        │  │  │  │   │
│  │  │  │  │  ┌──────────────────────────────────┐  │  │  │  │   │
│  │  │  │  │  │  SectionWrapper (layout, spacing) │  │  │  │  │   │
│  │  │  │  │  │  ┌────────────────────────────┐  │  │  │  │  │   │
│  │  │  │  │  │  │  SectionContent (data)      │  │  │  │  │  │   │
│  │  │  │  │  │  └────────────────────────────┘  │  │  │  │  │   │
│  │  │  │  │  └──────────────────────────────────┘  │  │  │  │   │
│  │  │  │  └────────────────────────────────────────┘  │  │  │   │
│  │  │  └──────────────────────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HomepageEditor (admin)                                   │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  EditorToolbar (add section, publish, preview)     │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  EditorLayout                                       │  │   │
│  │  │  ┌──────────────┬──────────────────────────────┐  │  │   │
│  │  │  │  SectionList  │  SectionConfigPanel          │  │  │   │
│  │  │  │  (drag/drop)  │  (edit selected section)     │  │  │   │
│  │  │  └──────────────┴──────────────────────────────┘  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 20.5 Component Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Named exports only** | No default exports | Better refactoring |
| **forwardRef on all** | All UI primitives use forwardRef | Composability |
| **displayName set** | All components have displayName | Debugging |
| **One component per file** | File name matches component name | Consistency |
| **Lazy loading** | Section components are lazy-loaded | Performance |
| **Error boundaries** | Each section in error boundary | Resilience |
| **Skeleton fallbacks** | Suspense with skeleton UI | UX |
| **No hardcoded values** | All values from config or tokens | CMS control |

---

## 21. Architectural Rules

### 21.1 What

Hard rules that every Homepage Builder implementation must follow without exception.

### 21.2 Why

- **Consistency:** No deviations from the standard
- **Quality:** Every implementation meets the standard
- **Maintainability:** Predictable patterns
- **Scalability:** Architecture scales without redesign

### 21.3 Hard Rules

| Rule | Description | Violation Consequence |
|------|-------------|----------------------|
| **No hardcoded homepage** | Every element is CMS-controlled | Feature can't be changed without deploy |
| **Every section reusable** | Sections work on any page, not just homepage | Code duplication |
| **Every config CMS-controlled** | All visual decisions from database | Inconsistent branding |
| **Every section responsive** | Works on mobile, tablet, desktop | Broken mobile experience |
| **Every section follows Design System** | Uses tokens, typography, spacing | Inconsistent aesthetics |
| **Builder remains simple** | Non-technical users can operate | Low adoption |
| **Architecture scales** | New sections without redesign | Technical debt |
| **Security first** | All content validated and sanitized | XSS attacks |
| **Accessibility first** | WCAG 2.2 AA compliance | Legal liability |
| **Performance first** | Lazy loading, optimization built-in | Slow pages |

### 21.4 Soft Rules

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **Preview before publish** | Always preview before going live | When possible |
| **Auto-save enabled** | Save every 30 seconds | Always |
| **Undo available** | Every action reversible | Within session |
| **Version history** | Keep last 50 versions | Always |
| **Audit logging** | Log all admin actions | Always |

### 21.5 Compliance Matrix

| Rule | Section Types | Rendering | CMS | API | Database |
|------|--------------|-----------|-----|-----|----------|
| No hardcoded homepage | All | All | All | All | All |
| Reusable sections | All | Registry | Config | Schema | JSONB |
| CMS-controlled config | All | Config-driven | Forms | Validation | JSONB |
| Responsive | All | Responsive rules | Per-breakpoint | N/A | Config |
| Design System | All | Token usage | Defaults | N/A | Defaults |
| Simple builder | N/A | N/A | UX | N/A | N/A |
| Scalable architecture | Registry | Plugin API | Plugin UI | Plugin API | Schema |
| Security | All | Sanitization | Validation | Auth | Constraints |
| Accessibility | All | Semantic HTML | N/A | N/A | N/A |
| Performance | All | Lazy loading | N/A | Caching | Indexing |

---

## Appendix A: Design Token Mapping

### Section Backgrounds

| Token | Value | Usage |
|-------|-------|-------|
| `background-transparent` | `transparent` | No background |
| `background-white` | `white` | Clean sections |
| `background-neutral-50` | `#fafaf9` | Subtle contrast |
| `background-brand-50` | `#faf6f1` | Brand tint |
| `background-brand-500` | `#8b6940` | Brand sections |
| `background-accent-gold` | `#c9a84c` | Premium sections |

### Section Spacing

| Token | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| `spacing-none` | 0 | 0 | 0 |
| `spacing-xs` | 16px | 24px | 32px |
| `spacing-sm` | 24px | 32px | 48px |
| `spacing-md` | 32px | 48px | 64px |
| `spacing-lg` | 48px | 64px | 80px |
| `spacing-xl` | 64px | 80px | 96px |
| `spacing-2xl` | 80px | 96px | 128px |

### Typography Scale

| Element | Font | Size | Weight | Tailwind |
|---------|------|------|--------|----------|
| Section H1 | Cormorant Garamond | 3.5rem | 300 | `text-5xl font-display font-light` |
| Section H2 | Cormorant Garamond | 2.5rem | 400 | `text-4xl font-display` |
| Section H3 | Manrope | 1.5rem | 600 | `text-2xl font-semibold` |
| Section Body | Manrope | 1rem | 400 | `text-base` |
| Section CTA | Manrope | 0.875rem | 600 | `text-sm font-semibold uppercase tracking-widest` |

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
