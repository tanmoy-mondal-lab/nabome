# নবME (Nabome) — Customer Website & Shopping Experience Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for the complete customer-facing shopping experience  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), UX_ARCHITECTURE.md (v1.0), NAVIGATION_ARCHITECTURE.md (v1.0), RESPONSIVE_LAYOUT_ARCHITECTURE.md (v1.0), PRODUCT_ENGINE_ARCHITECTURE.md (v1.0), CATALOG_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Customer Experience Foundation](#1-customer-experience-foundation)
2. [Public Website Architecture](#2-public-website-architecture)
3. [Product Experience Architecture](#3-product-experience-architecture)
4. [Shopping Experience Architecture](#4-shopping-experience-architecture)
5. [Customer Account Architecture](#5-customer-account-architecture)
6. [Checkout Preparation Architecture](#6-checkout-preparation-architecture)
7. [UX Principles & Standards](#7-ux-principles--standards)
8. [Trust Building Architecture](#8-trust-building-architecture)
9. [Responsive Behavior Architecture](#9-responsive-behavior-architecture)
10. [Performance Architecture](#10-performance-architecture)
11. [Accessibility Architecture](#11-accessibility-architecture)
12. [Future Readiness Architecture](#12-future-readiness-architecture)
13. [Mandatory Rules for AI Agents](#13-mandatory-rules-for-agents)

---

## 1. Customer Experience Foundation

### 1.1 What

The foundational philosophy, brand promise, experience standards, and governing principles that define every customer interaction on the Nabome platform — from the first impression to post-purchase loyalty.

### 1.2 Why

- **Brand integrity:** Every touchpoint reinforces Nabome as a premium destination.
- **Consistency:** Customers experience the same quality everywhere.
- **Trust:** Predictable, reliable interactions build confidence.
- **Differentiation:** The experience stands apart from competitors.
- **Scalability:** New features extend the experience without redesign.

### 1.3 Where

Every pixel, every interaction, every page, every flow — the entire customer-facing surface.

### 1.4 Core Experience Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Nabome-only brand** | Customers see only Nabome — never Shop Owners | Brand integrity |
| **Premium minimalism** | Less is more; every element earns its place | Luxury aesthetic |
| **Effortless discovery** | Finding products feels natural, not forced | Conversion |
| **Trust at every step** | Security signals, transparent policies, clear communication | Confidence |
| **Mobile-first luxury** | Premium experience on the smallest screen | 70%+ mobile traffic |
| **Speed is a feature** | Fast browsing, instant feedback, zero wait | Retention |
| **Inclusive by design** | Accessible to every user regardless of ability | Inclusivity |
| **Personal, not invasive** | Personalization that feels helpful, not creepy | Privacy |

### 1.5 Brand Promise

```
┌─────────────────────────────────────────────────────────────────┐
│                    NABOME BRAND PROMISE                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Customers experience:                                    │   │
│  │  • Premium, curated products                              │   │
│  │  • Effortless, minimal shopping                           │   │
│  │  • Trustworthy, secure transactions                       │   │
│  │  • Beautiful, fast browsing                               │   │
│  │  • Responsive, helpful support                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Customers never experience:                              │   │
│  │  • Shop Owner identities                                  │   │
│  │  • Cluttered, busy interfaces                             │   │
│  │  • Slow, frustrating interactions                         │   │
│  │  • Confusing navigation                                   │   │
│  │  • Uncertain checkout                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Experience Quality Standards

| Standard | Target | Measurement |
|----------|--------|-------------|
| **First impression** | "Premium, trustworthy" within 3 seconds | User testing |
| **Task completion** | 90%+ users complete primary task | Analytics |
| **Error recovery** | 100% errors have clear recovery path | QA audits |
| **Mobile satisfaction** | 4.5+ star rating on mobile experience | App store / feedback |
| **Page load** | < 2.5s LCP on mobile 4G | Lighthouse |
| **Checkout completion** | < 3 minutes from cart to confirmation | Analytics |
| **Support resolution** | First-contact resolution > 80% | Support metrics |

### 1.7 Experience Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Shop Owner identity leakage | Breaks Nabome brand | Always show Nabome brand only |
| Visual clutter | Distracts from products | Minimal, premium interface |
| Forced registration | Friction before purchase | Guest checkout first |
| Hidden costs | Trust erosion | Transparent pricing throughout |
| Slow interactions | Abandonment | Optimistic updates, instant feedback |
| Generic messaging | Feels impersonal | Contextual, helpful communication |
| Overwhelming choices | Decision fatigue | Progressive disclosure, smart defaults |

---

## 2. Public Website Architecture

### 2.1 What

The complete architecture for all public-facing pages that customers browse before, during, and after shopping — including homepage, categories, collections, product listings, product details, search, blog, and static pages.

### 2.2 Why

- **First impression:** The public website defines brand perception.
- **Discovery:** Customers find products through multiple paths.
- **SEO:** Public pages drive organic traffic.
- **Conversion:** Every page guides toward purchase.

### 2.3 Where

Every publicly accessible route on the storefront.

### 2.4 Page Architecture Catalog

#### 2.4.1 Homepage

| Section | Purpose | Priority | Layout |
|---------|---------|----------|--------|
| **Header** | Navigation, search, cart | Always visible | Sticky, 80px desktop / 56px mobile |
| **Hero** | Brand statement, primary CTA | First viewport | Full-width, 80vh mobile / 100vh desktop |
| **Featured Collection** | Curated products | Engagement | Horizontal scroll (mobile) / grid (desktop) |
| **New Arrivals** | Latest products | Freshness | 2-col mobile / 4-col desktop |
| **Categories** | Shop by category | Discovery | 2-col mobile / 3-4-col desktop |
| **Best Sellers** | Social proof | Trust | 2-col mobile / 4-col desktop |
| **Editorial/Content** | Brand story, SEO | Engagement | Full-width background + centered content |
| **Footer** | Secondary links, trust signals | Completeness | Full-width, multi-column |

**Homepage Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Hero priority** | One focal point: brand message + CTA | Clear entry |
| **Section rhythm** | Consistent spacing between sections (py-16 to py-24) | Visual harmony |
| **Progressive scroll** | Each section reveals one idea | Cognitive load |
| **Mobile hero** | Max 80vh to show content below fold | Encourage scroll |
| **Desktop hero** | 100vh for immersive experience | Premium feel |
| **Featured products** | Max 8-12 products visible | Curated, not overwhelming |
| **Lazy load below fold** | Images load on scroll | Performance |
| **No auto-play video** | User-initiated only | Respect, performance |

#### 2.4.2 Category Pages

| Section | Purpose | Priority |
|---------|---------|----------|
| **Breadcrumb** | Orientation | Below header |
| **Page title** | Category name | Below breadcrumb |
| **Category description** | SEO, context | Below title |
| **Filter bar** | Refine results | Below description |
| **Sort control** | Order results | Top-right of grid |
| **Product grid** | Display products | Main content |
| **Pagination** | Navigate pages | Below grid |
| **Empty state** | No results | Center of grid |

**Category Page Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Breadcrumb always visible** | Home > Category | Orientation |
| **Filter accessibility** | Bottom sheet on mobile, sidebar on desktop | Device-appropriate |
| **Product grid** | 2-col mobile / 3 tablet / 4 desktop | Responsive |
| **Image aspect ratio** | 3:4 for fashion | Industry standard |
| **Skeleton loading** | Match card shape while loading | Perceived performance |
| **Result count** | "X products" always visible | Context |
| **Infinite scroll alternative** | "Load more" button | User control |
| **Category image** | Hero banner for category | Visual identity |
| **Subcategory navigation** | Horizontal tabs or grid | Easy refinement |

#### 2.4.3 Collection Pages

| Section | Purpose | Priority |
|---------|---------|----------|
| **Collection hero** | Curated identity | First viewport |
| **Description** | Editorial context | Below hero |
| **Filter/Sort** | Refinement | Below description |
| **Product grid** | Curated products | Main content |
| **CTA** | Continue shopping | Below grid |

**Collection Page Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Editorial feel** | More visual than category pages | Curated experience |
| **Hero image** | Full-width, branded | Collection identity |
| **Product limit** | Show all products in collection | Complete view |
| **Sort default** | "Featured" (admin-curated order) | Merchandising intent |
| **Cross-linking** | Link to related collections | Discovery |

#### 2.4.4 Product Listing Pages

| Section | Purpose | Priority |
|---------|---------|----------|
| **Page header** | Context (category, collection, search) | Below header |
| **Active filters** | Show applied filters | Below header |
| **Sort** | Order results | Top-right |
| **Product grid** | Display products | Main content |
| **Load more** | Navigate additional results | Below grid |

**Product Listing Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Consistent card layout** | Same card everywhere | Predictability |
| **Product card content** | Image + name + price + CTA | Essential info |
| **Hover state** | Subtle elevation + secondary image | Desktop engagement |
| **Quick add** | "Add to Cart" on hover (desktop) | Speed |
| **Mobile tap** | Tap card to navigate to detail | Mobile convention |
| **Skeleton loading** | 8-card skeleton on load | Perceived speed |
| **Empty grid** | "No products found" + suggestions | Guidance |

#### 2.4.5 Product Detail Page

| Section | Purpose | Priority |
|---------|---------|----------|
| **Breadcrumb** | Orientation | Below header |
| **Product gallery** | Visual showcase | First viewport (mobile: full-width) |
| **Product info** | Title, price, rating, variants | First viewport (desktop: right column) |
| **Add to Cart** | Primary CTA | Below variants, sticky on mobile |
| **Description** | Product details | Below info |
| **Specifications** | Technical details | Below description |
| **Size guide** | Sizing help | Link or modal |
| **Reviews** | Social proof | Below description |
| **Questions** | Community Q&A | Below reviews |
| **Related products** | Cross-sell | Below reviews |
| **Recently viewed** | Browsing history | Below related |

**Product Detail Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Gallery mobile** | Swipeable carousel, full-width | Thumb-friendly |
| **Gallery desktop** | Main image + thumbnails | Selection control |
| **Sticky CTA** | "Add to Cart" fixed on scroll | Always accessible |
| **Variant selector** | Visual: color swatches, size buttons | Intuitive selection |
| **Price display** | Prominent, includes currency | Decision factor |
| **Stock indication** | Real-time availability | Transparency |
| **Out of stock** | Grayed variant, clear message | Honest communication |
| **Size guide** | Modal or expandable section | Accessible help |
| **Reviews summary** | Star rating + count above fold | Social proof |
| **Image zoom** | Pinch-to-zoom on mobile, hover on desktop | Detail inspection |
| **Video support** | Product videos in gallery | Rich media |
| **Breadcrumbs** | Home > Category > Product | Orientation |

#### 2.4.6 Search Pages

| Section | Purpose | Priority |
|---------|---------|----------|
| **Search input** | Query entry | Top, prominent |
| **Autocomplete** | Suggestions | Below input |
| **Active filters** | Applied refinements | Below input |
| **Sort** | Order results | Top-right |
| **Results grid** | Matching products | Main content |
| **Empty state** | No results | Center |

**Search Page Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-focus** | Focus input on page load | Speed |
| **Debounce** | 300ms before API call | Performance |
| **Min query** | 2 characters for suggestions | Prevent noise |
| **Recent searches** | Show last 5 in localStorage | Convenience |
| **Popular searches** | Trending queries | Discovery |
| **Result count** | "X results for Y" | Context |
| **Typo tolerance** | Levenshtein distance 2 | Forgiving |
| **Keyboard shortcut** | `/` to focus, `ESC` to close | Power users |
| **No results** | Spelling suggestions + popular products | Guidance |
| **Analytics** | Track search queries | Intelligence |

#### 2.4.7 Blog Pages

| Section | Purpose | Priority |
|---------|---------|----------|
| **Blog listing** | Article discovery | Main content |
| **Category tabs** | Filter by topic | Below header |
| **Featured article** | Hero article | First section |
| **Article grid** | Recent articles | Below featured |
| **Article detail** | Full content | Individual page |

**Blog Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Editorial layout** | Magazine-style, image-heavy | Brand storytelling |
| **Reading experience** | Max-width 720px for body text | Readability |
| **Social sharing** | Share buttons on articles | Distribution |
| **Related articles** | 3 articles below content | Engagement |
| **Author info** | Author name + avatar | Credibility |
| **Publish date** | Always visible | Freshness indicator |

#### 2.4.8 Static Pages

| Page | Layout | Container |
|------|--------|-----------|
| **About** | Hero + editorial content | Wide (1440px) |
| **Contact** | Two-column: info + form | Default (1280px) |
| **FAQ** | Accordion list | Narrow (640px) |
| **Terms of Service** | Single-column text | Narrow (640px) |
| **Privacy Policy** | Single-column text | Narrow (640px) |
| **Shipping Policy** | Single-column text | Narrow (640px) |
| **Return Policy** | Single-column text | Narrow (640px) |

**Static Page Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Consistent header** | Same header as storefront | Orientation |
| **Consistent footer** | Same footer as storefront | Completeness |
| **Breadcrumb** | Home > Page name | Orientation |
| **Mobile-friendly** | Single column, readable | Accessibility |
| **SEO metadata** | Title, description, OG tags | Discovery |
| **Last updated** | Date visible on policy pages | Transparency |

### 2.5 URL Architecture

| Pattern | Example | Rationale |
|---------|---------|-----------|
| **Homepage** | `/` | Root |
| **Shop** | `/shop` | Collection root |
| **Category** | `/shop/men`, `/shop/women` | Logical grouping |
| **Subcategory** | `/shop/men/shirts` | Hierarchy |
| **Collection** | `/shop/collection/summer-2026` | Curated |
| **Product** | `/shop/product/premium-cotton-tee` | Human-readable slug |
| **Search** | `/search?q=cotton+tee` | Query-based |
| **Cart** | `/cart` | Simple, memorable |
| **Checkout** | `/checkout` | Sequential |
| **Account** | `/account` | Personal space |
| **Blog** | `/blog` | Content area |
| **Blog post** | `/blog/style-guide-summer` | Human-readable |
| **Static** | `/about`, `/contact`, `/faq` | Simple paths |

**URL Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lowercase only** | `/shop`, not `/Shop` | Consistency |
| **Hyphens for spaces** | `premium-cotton-tee` | Readability |
| **No trailing slashes** | `/shop`, not `/shop/` | Canonical |
| **No query params for core routes** | `/shop/men` not `/shop?category=men` | SEO |
| **Slug format** | `kebab-case` | Standard |
| **Max depth** | 3 levels (`/shop/men/shirts`) | Findability |

### 2.6 SEO Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Title format** | `Page Name — Nabome` | Brand consistency |
| **Meta description** | 155 chars, compelling, keyword-rich | Click-through |
| **OG image** | 1200x630px, branded | Social sharing |
| **Canonical URLs** | Self-referencing canonicals | Duplicate prevention |
| **Structured data** | Product, BreadcrumbList, Organization | Rich results |
| **Sitemap** | Auto-generated, submitted to Search Console | Crawling |
| **Robots.txt** | Allow all public, block admin | Crawling control |
| **Hreflang** | Ready for multi-language | Future readiness |
| **Alt text** | Descriptive, keyword-aware | Accessibility + SEO |

---

## 3. Product Experience Architecture

### 3.1 What

Standards for how products are presented to customers — viewing, gallery, videos, information, specifications, variants, related products, recommendations, reviews, questions, availability, pricing, and promotions.

### 3.2 Why

- **Conversion:** Product presentation directly drives purchase decisions.
- **Trust:** Complete, accurate information builds confidence.
- **Discovery:** Related products and recommendations increase basket size.
- **Engagement:** Rich media keeps customers browsing.

### 3.3 Where

Product detail pages, product cards, search results, cart items, order history, wishlist, recommendations.

### 3.4 Product Viewing Standards

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Primary image** | Full-width on mobile, 50% on desktop | Visual impact |
| **Image count** | Show "1 of N" indicator | Orientation |
| **Zoom** | Pinch-to-zoom on mobile, hover on desktop | Detail inspection |
| **Gallery navigation** | Swipe on mobile, arrows on desktop | Natural gestures |
| **Thumbnail strip** | Below main image, scrollable | Quick selection |
| **Active thumbnail** | Border highlight on selected | Clear state |
| **Loading** | Skeleton placeholder while loading | Perceived speed |
| **Error state** | "Image unavailable" + retry | Graceful degradation |

### 3.5 Product Gallery Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT GALLERY ARCHITECTURE                   │
│                                                                  │
│  MOBILE                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │                                                    │  │   │
│  │  │              MAIN IMAGE (swipeable)                │  │   │
│  │  │              Full-width, 3:4 aspect                │  │   │
│  │  │                                                    │  │   │
│  │  │              [1 of 5] indicator                    │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │   │
│  │  │ thumb│ │ thumb│ │ thumb│ │ thumb│ │ thumb│ ← scroll  │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  DESKTOP                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌────────────────────┐  ┌────────────────────────────┐  │   │
│  │  │                    │  │                            │  │   │
│  │  │   MAIN IMAGE       │  │   THUMBNAIL COLUMN         │  │   │
│  │  │   (hover to zoom)  │  │   ┌──────┐                 │  │   │
│  │  │                    │  │   │ thumb│ ← active         │  │   │
│  │  │                    │  │   ├──────┤                 │  │   │
│  │  │                    │  │   │ thumb│                 │  │   │
│  │  │                    │  │   ├──────┤                 │  │   │
│  │  │                    │  │   │ thumb│                 │  │   │
│  │  │                    │  │   ├──────┤                 │  │   │
│  │  │                    │  │   │ thumb│                 │  │   │
│  │  └────────────────────┘  │   └──────┘                 │  │   │
│  │                          └────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Gallery Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Image aspect ratio** | 3:4 for fashion, 1:1 for accessories | Industry standard |
| **Background** | `neutral-50` or white | Clean, premium |
| **Swipe threshold** | 30% of width to trigger | Prevent accidental |
| **Snap** | Snap to image boundary | Clean landing |
| **Keyboard arrows** | Left/Right to navigate | Desktop accessibility |
| **Preload** | Preload next/previous images | Smooth navigation |
| **Lazy load** | Load images on demand | Performance |
| **Alt text** | Descriptive, product-name included | Accessibility + SEO |

### 3.6 Product Video Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | In gallery, after images | Rich media |
| **Autoplay** | Never autoplay | Respect, performance |
| **Controls** | Always show controls | User control |
| **Aspect ratio** | 16:9 or match images | Consistency |
| **Poster** | Custom thumbnail image | Professional |
| **Mobile** | Full-width, same container | Consistency |
| **Desktop** | Same space as main image | Consistency |
| **Lazy load** | Don't load video until play | Performance |
| **Format** | MP4 (H.264) for compatibility | Universal support |

### 3.7 Product Information Architecture

| Field | Display | Priority |
|-------|---------|----------|
| **Product name** | Large, prominent | First |
| **Brand** | Link to brand page | Second |
| **Rating** | Star rating + review count | Third |
| **Price** | Prominent, with currency | Fourth |
| **Sale price** | Strikethrough original + new price | Contextual |
| **Color** | Visual swatches | Fifth |
| **Size** | Button selection | Sixth |
| **Description** | Expandable/collapsible | Below fold |
| **Specifications** | Table format | Below description |
| **Size guide** | Link or modal | Near size selector |

**Information Hierarchy Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Name first** | Product name always most prominent | Identification |
| **Price prominent** | Larger than description text | Decision factor |
| **Rating visible** | Above fold, next to name | Social proof |
| **Variant selection** | Visual, not dropdown | Intuitive |
| **Progressive disclosure** | Description collapsible | Clean layout |
| **Specifications table** | Clean, scannable | Technical details |

### 3.8 Product Specifications Architecture

| Standard | Rationale |
|----------|-----------|
| **Table format** | Scannable, organized |
| **Two columns** | Label + value |
| **Alternating rows** | Visual separation |
| **Grouped sections** | Related specs grouped |
| **Mobile** | Single column, stacked | Readable on small screens |
| **Expandable** | Collapse by default | Clean layout |

### 3.9 Variant Selection Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    VARIANT SELECTION ARCHITECTURE                 │
│                                                                  │
│  COLOR SELECTION                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Color: Black                                             │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │   │
│  │  │ ●  │ │ ○  │ │ ○  │ │ ○  │  ← circular swatches       │   │
│  │  │Black│ │White│ │Navy │ │Sage │  ← labels below          │   │
│  │  └────┘ └────┘ └────┘ └────┘                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  SIZE SELECTION                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Size: M                                                  │   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                     │   │
│  │  │ XS │ │  S │ │ [M]│ │  L │ │ XL │  ← button style     │   │
│  │  └────┘ └────┘ └────┘ └────┘ └────┘                     │   │
│  │  Size Guide →                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  OUT OF STOCK                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐                             │   │
│  │  │ XS │ │  S │ │  M │ │✕ L │  ← strikethrough + X       │   │
│  │  └────┘ └────┘ └────┘ └────┘                             │   │
│  │  Notify me when available                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Variant Selection Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Color swatches** | Circular, 32px diameter | Visual, touchable |
| **Color label** | Show selected color name | Clarity |
| **Size buttons** | Rectangular, 44x44px min | Touch-friendly |
| **Selected state** | Brand-500 border + fill | Clear selection |
| **Out of stock** | Strikethrough + disabled | Honest |
| **Low stock** | "Only X left" message | Urgency |
| **Size guide** | Always visible near size | Help available |
| **Auto-select** | If only one option, auto-select | Speed |
| **URL sync** | Variant reflected in URL | Shareable |
| **Image change** | Gallery updates on color select | Visual confirmation |

### 3.10 Related Products Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Below reviews, above footer | Discovery |
| **Count** | 4-8 products | Scannable |
| **Layout** | Horizontal scroll (mobile) / grid (desktop) | Responsive |
| **Title** | "You may also like" or "Complete the look" | Contextual |
| **Same category** | Prioritize same category products | Relevance |
| **Exclude current** | Don't show viewed product | Obvious |
| **Lazy load** | Load when scrolled into view | Performance |

### 3.11 Recommendations Architecture

| Type | Source | Placement | Trigger |
|------|--------|-----------|---------|
| **Related** | Same category/brand | Product detail page | Always |
| **Frequently bought together** | Purchase history | Product detail page | Always |
| **Recently viewed** | Browsing history | Homepage, product page | Logged in |
| **Trending** | Aggregated data | Homepage, category page | Always |
| **Personalized** | User behavior | Homepage (logged in) | Logged in |
| **New for you** | Category preference | Homepage | Logged in |

**Recommendation Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Manual curation first** | Admin-curated before algorithmic | Premium quality |
| **Maximum shown** | 4-8 per section | Not overwhelming |
| **Lazy load** | Load below fold | Performance |
| **Hide purchased** | Don't recommend bought items | Smart |
| **Real-time** | Update based on session | Relevant |
| **A/B testable** | Architecture supports testing | Optimization |

### 3.12 Reviews Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Summary** | Star rating + count + distribution | At-a-glance |
| **Rating breakdown** | 5-1 star with percentage bars | Transparency |
| **Review list** | Newest first, paginated | Fresh content |
| **Review content** | Star rating + title + body + date | Complete |
| **Reviewer info** | Name + verified badge | Trust |
| **Photos** | Customer-uploaded images | Social proof |
| **Helpful votes** | "Was this helpful?" + count | Quality signal |
| **Sort** | Newest, highest, lowest, most helpful | User control |
| **Filter** | By rating, with photos, verified | Refinement |
| **Write review** | CTA for purchasers | Engagement |
| **Empty state** | "No reviews yet. Be the first!" | Encouragement |

**Review Display Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Above fold** | Star rating visible without scroll | Social proof |
| **Verified badge** | Checkmark for verified purchases | Trust |
| **Photos** | Thumbnail grid, tap to expand | Visual proof |
| **Moderation** | Reviews moderated before display | Quality |
| **Response** | Admin can respond to reviews | Engagement |
| **Pagination** | 5 reviews per page | Performance |
| **Rich snippets** | Schema.org AggregateRating | SEO |

### 3.13 Questions Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Q&A section** | Below reviews | Community |
| **Ask question** | CTA for any visitor | Engagement |
| **Answers** | Admin or community answers | Helpfulness |
| **Upvote** | "Helpful" count on answers | Quality |
| **Sort** | Most helpful, newest | User control |
| **Empty state** | "No questions yet. Ask one!" | Encouragement |

### 3.14 Availability Architecture

| Signal | Display | Rationale |
|--------|---------|-----------|
| **In stock** | "In Stock" in green | Confidence |
| **Low stock** | "Only X left" in amber | Urgency |
| **Out of stock** | "Out of Stock" in red | Honesty |
| **Pre-order** | "Pre-order — Ships [date]" | Transparency |
| **Back in stock** | "Notify me" button | Recovery |
| **Delivery estimate** | "Delivery in 3-5 days" | Planning |
| **Free shipping** | "Free shipping on orders over ₹999" | Incentive |

**Availability Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Real-time** | Check stock on variant select | Accuracy |
| **Never oversell** | Validate stock at checkout | Integrity |
| **Clear messaging** | No ambiguous stock states | Trust |
| **Delivery estimate** | Show when product is selected | Planning |
| **Back-in-stock** | Email notification opt-in | Recovery |

### 3.15 Pricing Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Currency** | ₹ (INR) with Indian formatting | Local |
| **Format** | ₹1,999 (comma-separated) | Readable |
| **Sale price** | Strikethrough original + new price | Savings visibility |
| **Tax** | "Inclusive of all taxes" | Transparency |
| **EMI** | "Starting from ₹X/month" if applicable | Affordability |
| **Price per unit** | For applicable products | Comparison |
| **Dynamic pricing** | Price updates on variant select | Accuracy |

**Pricing Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No hidden costs** | All costs visible before checkout | Trust |
| **Tax inclusive** | Display prices with tax | Transparency |
| **Sale countdown** | Timer for limited sales | Urgency |
| **Coupon display** | Show savings from applied coupon | Reinforcement |
| **Price match** | Never show different price at checkout | Integrity |

### 3.16 Promotions Architecture

| Promotion Type | Display | Placement |
|---------------|---------|-----------|
| **Sale badge** | "Sale" tag on product card | Product card, top-left |
| **Discount percentage** | "20% OFF" badge | Product card |
| **Free shipping** | "Free Shipping" badge | Product card or cart |
| **Bundle deal** | "Buy 2 Get 1 Free" | Product detail |
| **Coupon code** | Input in cart and checkout | Cart, checkout |
| **Flash sale** | Countdown timer | Homepage, category |
| **Loyalty points** | "Earn X points" | Product detail |

**Promotion Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Clear terms** | Show original price + savings | Transparency |
| **No fake urgency** | Only real countdown timers | Trust |
| **Stacking rules** | Clear which promotions combine | Predictability |
| **Expiry visible** | Show promotion end date | Honesty |
| **Badge consistency** | Same badge style everywhere | Brand |

---

## 4. Shopping Experience Architecture

### 4.1 What

Standards for every interaction between product discovery and checkout — wishlist, cart, mini cart, checkout entry, buy now, continue shopping, saved items, and recently viewed.

### 4.2 Why

- **Conversion:** Smooth shopping flow drives purchases.
- **Retention:** Saved items and wishlist bring customers back.
- **Efficiency:** Minimal steps from intent to purchase.
- **Trust:** Cart and checkout feel secure and transparent.

### 4.3 Where

Product detail pages, cart page, mini cart overlay, checkout entry, header, account pages.

### 4.4 Wishlist Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Add to wishlist** | Heart icon on product card and detail | Discoverable |
| **Icon state** | Outline (empty) / Filled (saved) | Visual state |
| **Feedback** | Toast "Added to wishlist" | Confirmation |
| **View wishlist** | `/account/wishlist` | Direct access |
| **Header badge** | Wishlist count on icon | Information |
| **Move to cart** | "Add to Cart" button on wishlist item | Conversion |
| **Remove** | Swipe on mobile, button on desktop | Easy removal |
| **Empty state** | "Your wishlist is empty" + CTA | Guidance |
| **Guest handling** | Prompt to login to save | Conversion |
| **Persistence** | Saved across sessions | Don't lose work |

**Wishlist Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Instant toggle** | Add/remove without confirmation | Speed |
| **Sync across devices** | Logged-in users see same wishlist everywhere | Continuity |
| **Price tracking** | Show price changes on wishlisted items | Value |
| **Back in stock** | Notify when wishlisted item returns | Recovery |
| **Share** | Share wishlist link | Social |
| **Maximum items** | No artificial limit | Freedom |

### 4.5 Cart Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Add to cart** | Primary CTA on product detail | Conversion |
| **Cart badge** | Item count on header cart icon | Information |
| **Mini cart** | Dropdown/slide-in preview on desktop | Quick view |
| **Full cart page** | `/cart` for complete management | Full control |
| **Quantity controls** | +/- buttons, min 1, max stock | Adjustment |
| **Remove** | Swipe on mobile, button on desktop | Easy removal |
| **Price update** | Real-time on quantity change | Transparency |
| **Subtotal** | Below items | Context |
| **Promo code** | Input field in cart | Discount |
| **Checkout CTA** | Primary button, always visible | Conversion |
| **Cross-sell** | "You might also like" below cart | Revenue |
| **Empty state** | "Your cart is empty" + CTA | Guidance |

**Cart Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Cart persistence** | Saved across sessions | Don't lose work |
| **Guest cart** | Works without login | Zero friction |
| **Merge on login** | Guest cart merges with account cart | Continuity |
| **Stock validation** | Real-time on quantity change | Accuracy |
| **Quantity max** | Limited to available stock | Business rule |
| **Remove undo** | Toast with undo, not confirmation | Speed |
| **Sticky checkout** | Checkout button always visible on mobile | Conversion |
| **Price transparency** | All costs visible before checkout | Trust |
| **Item limit** | Max 10 per product | Business rule |

### 4.6 Mini Cart Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MINI CART ARCHITECTURE                         │
│                                                                  │
│  TRIGGER                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Cart icon in header → Click/tap → Opens mini cart        │   │
│  │  Badge shows item count (always visible)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  DESKTOP (dropdown)                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Shopping Cart (3 items)                     [X]   │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  ┌──────┐ Product Name                    ₹999    │  │   │
│  │  │  │ img  │ Color: Black, Size: M     [-] 1 [+]     │  │   │
│  │  │  └──────┘                              [Remove]    │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  ┌──────┐ Product Name                    ₹1,499  │  │   │
│  │  │  │ img  │ Color: White, Size: L     [-] 2 [+]     │  │   │
│  │  │  └──────┘                              [Remove]    │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  Subtotal                              ₹3,997      │  │   │
│  │  │  Shipping                              Calculated at│  │   │
│  │  │                                        checkout     │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  [View Cart]              [Checkout →]             │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  MOBILE (full-screen overlay or bottom sheet)                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Shopping Cart (3 items)                     [X]   │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  (same item layout as desktop)                     │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  Subtotal                              ₹3,997      │  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │  [View Cart]                                      │  │   │
│  │  │  [Checkout →] ← full-width, primary button         │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Mini Cart Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Desktop** | Dropdown from cart icon | Space efficient |
| **Mobile** | Full-screen overlay or bottom sheet | Thumb-friendly |
| **Close** | X button, click outside, ESC | Multiple paths |
| **Quantity edit** | Inline +/- controls | Speed |
| **Remove** | Button per item | Easy removal |
| **Subtotal** | Always visible | Context |
| **Checkout CTA** | Prominent, primary button | Conversion |
| **View cart link** | "View Cart" for full experience | Flexibility |
| **Empty state** | "Your cart is empty" | Guidance |
| **Animation** | Slide in from right (desktop), slide up (mobile) | Smooth |

### 4.7 Checkout Entry Architecture

| Entry Point | Behavior | Rationale |
|------------|----------|-----------|
| **Cart → Checkout** | Navigate to `/checkout` | Primary path |
| **Mini cart → Checkout** | Navigate to `/checkout` | Quick path |
| **Buy Now** | Skip cart, go directly to checkout | Speed |
| **Add to cart toast** | Toast with "Go to Cart" link | Alternative |

**Checkout Entry Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Guest checkout** | Available without account | Zero friction |
| **Cart validation** | Validate stock before entry | Accuracy |
| **Redirect** | If cart empty, redirect to shop | Guard |
| **Auth check** | Optional: prompt login for saved info | Convenience |
| **Continue shopping** | Back link to last viewed page | Recovery |
| **Minimal header** | Logo + secure badge only | Focus |

### 4.8 Buy Now Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Secondary button on product detail | Alternative to cart |
| **Behavior** | Add to cart + redirect to checkout | Speed |
| **Single item** | Only one product per "Buy Now" | Simplified |
| **Variant required** | Must select variant first | Accuracy |
| **Stock check** | Validate before redirect | Accuracy |
| **Feedback** | Brief loading state | Confirmation |

### 4.9 Continue Shopping Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Below checkout CTA on cart page | Alternative |
| **Behavior** | Returns to last viewed category/shop page | Continuity |
| **Default** | `/shop` if no history | Fallback |
| **Cart preserved** | Cart maintained while browsing | Don't lose work |
| **Toast** | "Item saved in cart" on navigation | Reassurance |

### 4.10 Saved Items Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Definition** | Items in wishlist + recently viewed | Combined |
| **Access** | Account section + homepage widget | Discoverable |
| **Sync** | Synced across devices for logged-in users | Continuity |
| **Guest** | Stored locally, prompt to save | Conversion |
| **Price changes** | Highlight price drops on saved items | Value |
| **Back in stock** | Notification for saved items | Recovery |

### 4.11 Recently Viewed Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Storage** | localStorage (last 20 products) | Performance |
| **Display** | Horizontal scroll section | Browsing aid |
| **Placement** | Homepage, below related products | Discovery |
| **Logged in** | Personalized, synced | Continuity |
| **Guest** | Local storage only | Zero friction |
| **Privacy** | Clear on logout | Security |
| **Empty state** | Hidden if no history | Clean |

---

## 5. Customer Account Architecture

### 5.1 What

Standards for the complete customer account experience — registration, login, profile management, addresses, orders, wishlist, reviews, returns, refunds, notifications, settings, and account deletion.

### 5.2 Why

- **Self-service:** Customers manage their own data.
- **Retention:** Account features bring customers back.
- **Trust:** Account management feels secure and personal.
- **Efficiency:** Saved data speeds up future purchases.

### 5.3 Where

Account pages, header dropdown, login/register pages, checkout.

### 5.4 Registration Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Trigger** | "Create Account" link on login page | Clear path |
| **Form fields** | Name, email, password (minimal) | Low friction |
| **Validation** | Inline, on blur | Immediate feedback |
| **Password strength** | Visual indicator | Guidance |
| **Terms** | "By creating an account, you agree to..." | Legal |
| **CAPTCHA** | Turnstile (invisible) | Bot prevention |
| **Email verification** | Required before full access | Security |
| **After register** | "Check your email" message | Clear next step |
| **Social login** | Google, Apple (if configured) | Convenience |
| **Guest option** | "Continue as guest" prominent | Zero friction |

**Registration Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimal fields** | Only required info | Low friction |
| **Email uniqueness** | Check in real-time | Immediate feedback |
| **Password policy** | Min 8 chars, mixed case, number, special | Security |
| **Auto-login** | After email verification | Seamless |
| **Welcome email** | Sent immediately | Engagement |
| **Optional fields** | Phone, birthday — ask later | Progressive |
| **Redirect** | Return to previous page after register | Continuity |

### 5.5 Login Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Trigger** | Account icon (logged out) → login page | Clear path |
| **Form** | Email + password + remember me | Simple |
| **Validation** | Inline, on blur | Immediate feedback |
| **CAPTCHA** | Turnstile (invisible) | Bot prevention |
| **Error handling** | "Invalid email or password" (generic) | Security |
| **Lockout** | 5 attempts, 15-minute lockout | Brute force protection |
| **Forgot password** | Link below form | Recovery |
| **Social login** | Google, Apple (if configured) | Convenience |
| **After login** | Redirect to previous page | Continuity |
| **Session** | httpOnly cookies, secure | Security |

**Login Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimal header** | Logo only on auth pages | Focus |
| **Centered form** | Max-width 400px | Clean |
| **Remember me** | Optional, extends session | Convenience |
| **Generic error** | "Invalid email or password" | Security (no enumeration) |
| **Rate limiting** | 20 requests per minute | Abuse prevention |
| **Redirect** | Return to page that triggered login | Continuity |
| **Logout confirmation** | "Are you sure?" dialog | Safety |

### 5.6 Profile Management Architecture

| Field | Editable | Validation |
|-------|----------|------------|
| **First name** | Yes | Min 1 char |
| **Last name** | Yes | Min 1 char |
| **Email** | Yes (with verification) | Valid email |
| **Phone** | Yes (with OTP) | Valid phone |
| **Avatar** | Yes (upload or URL) | Image only |
| **Birthday** | Yes | Optional |
| **Gender** | Yes | Optional |

**Profile Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-save** | Save on field blur | Don't lose work |
| **Optimistic update** | Show changes immediately | Perceived speed |
| **Email change** | Requires verification of new email | Security |
| **Phone change** | Requires OTP verification | Security |
| **Avatar upload** | Crop tool included | Quality |
| **Delete account** | Requires password confirmation | Safety |
| **Data export** | GDPR-ready data export | Compliance |

### 5.7 Address Management Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Address list** | Cards with full address | Visual |
| **Add address** | Modal or new page | Focused |
| **Edit address** | Inline or modal | Quick |
| **Delete** | Confirmation dialog | Safety |
| **Default** | One default shipping, one default billing | Speed |
| **Max addresses** | 10 per customer | Limits |
| **Autocomplete** | Google Places API | Speed |
| **Validation** | Address, city, state, pincode | Accuracy |
| **Pincode check** | Validate delivery availability | Transparency |

**Address Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Pre-fill checkout** | Use saved addresses | Speed |
| **One default** | Clear default selection | Predictability |
| **Indian format** | Name, phone, address, city, state, pincode | Local |
| **Phone required** | For delivery contact | Logistics |
| **Pincode validation** | Check serviceability | Transparency |
| **Edit from checkout** | Allow address edit during checkout | Flexibility |

### 5.8 Orders Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Order list** | chronological, with status | Overview |
| **Order card** | Image + name + status + date + total | Quick scan |
| **Order detail** | Full breakdown + timeline | Complete info |
| **Status badges** | Color-coded: pending, processing, shipped, delivered | Visual |
| **Track order** | Link to tracking page | Transparency |
| **Reorder** | "Buy again" button | Convenience |
| **Cancel** | Available before shipping | Control |
| **Return** | Available within return window | Recovery |
| **Invoice** | Download PDF invoice | Documentation |
| **Empty state** | "No orders yet" + CTA | Guidance |

**Order Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Real-time status** | Status updates reflected immediately | Accuracy |
| **Email notifications** | Status change emails sent | Reassurance |
| **Tracking link** | Direct link to carrier tracking | Transparency |
| **Return window** | 7 days from delivery | Policy |
| **Cancel window** | Before "Shipped" status | Control |
| **Order number** | Human-readable format (NAB-XXXXXX) | Professional |

### 5.9 Returns & Refunds Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Return request** | Available in order detail | Self-service |
| **Return reasons** | Predefined list + other | Data collection |
| **Return window** | 7 days from delivery | Policy |
| **Refund method** | Original payment method | Fairness |
| **Refund timeline** | 5-7 business days | Transparency |
| **Status tracking** | Return request → Approved → Received → Refunded | Visibility |
| **Email updates** | Status change notifications | Reassurance |

**Return Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Easy initiation** | One-click return request | Self-service |
| **Reason required** | For quality improvement | Data |
| **Photo upload** | Optional, for damage claims | Evidence |
| **Pickup scheduling** | Carrier pickup from address | Convenience |
| **Refund tracking** | Visible in order detail | Transparency |
| **Exchange option** | Alternative to refund | Retention |

### 5.10 Notifications Architecture

| Notification Type | Channel | Trigger |
|------------------|---------|---------|
| **Order confirmation** | Email + in-app | Order placed |
| **Payment confirmation** | Email + in-app | Payment successful |
| **Shipping update** | Email + in-app | Order shipped |
| **Delivery confirmation** | Email + in-app | Order delivered |
| **Return status** | Email + in-app | Return processed |
| **Refund processed** | Email + in-app | Refund issued |
| **Price drop** | Email (opt-in) | Wishlisted item price drops |
| **Back in stock** | Email (opt-in) | Wishlisted item returns |
| **Promotional** | Email (opt-in) | Sales, new arrivals |

**Notification Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Transactional always** | Order, payment, shipping always sent | Required |
| **Promotional opt-in** | Marketing emails require consent | Compliance |
| **Unsubscribe** | One-click unsubscribe in all emails | Compliance |
| **In-app center** | Notification history in account | Access |
| **Read state** | Mark as read on view | Clean |
| **Badge count** | Unread count in header | Information |

### 5.11 Settings Architecture

| Setting | Standard | Rationale |
|---------|----------|-----------|
| **Email preferences** | Toggle per notification type | Control |
| **Password change** | Current + new password form | Security |
| **Two-factor auth** | TOTP-based (future readiness) | Security |
| **Language** | Language selector (future readiness) | i18n |
| **Currency** | Currency selector (future readiness) | Multi-currency |
| **Theme** | Light/dark toggle (future readiness) | Preference |
| **Data export** | Download personal data | GDPR |
| **Account deletion** | Permanent, requires confirmation | Right to delete |

### 5.12 Account Deletion Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Location** | Settings page, bottom | Not prominent |
| **Confirmation** | Multi-step: reason → password → confirm | Safety |
| **Data export** | Offer data export before deletion | GDPR |
| **Warning** | "This action is permanent" | Clarity |
| **Processing time** | 30-day grace period | Recovery |
| **Email confirmation** | Confirmation email sent | Security |
| **Cart/wishlist** | Cleared on deletion | Cleanup |
| **Orders** | Historical orders retained (anonymized) | Legal |

---

## 6. Checkout Preparation Architecture

### 6.1 What

Standards for preparing the cart for checkout — cart validation, shipping readiness, coupon readiness, order review, and customer confirmation.

### 6.2 Why

- **Accuracy:** Cart is validated before checkout entry.
- **Transparency:** All costs visible before payment.
- **Trust:** Customer confirms before committing.
- **Efficiency:** Minimal steps to complete purchase.

### 6.3 Where

Cart page, checkout page, order confirmation.

### 6.4 Cart Validation Architecture

| Validation | Timing | Response |
|-----------|--------|----------|
| **Stock availability** | On checkout entry | "X is no longer available" |
| **Price changes** | On checkout entry | "Price updated to ₹X" |
| **Variant availability** | On checkout entry | "Select a different variant" |
| **Minimum order** | On checkout entry | "Minimum order is ₹X" |
| **Shipping restrictions** | On address entry | "Cannot ship to this address" |
| **Coupon validity** | On coupon apply | "Coupon expired" or "Minimum not met" |

**Cart Validation Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Validate early** | Check on cart page, not just checkout | Catch issues early |
| **Clear messaging** | Specific error per item | Actionable |
| **Auto-remove** | Remove unavailable items with toast | Don't block |
| **Price update** | Show updated price, don't hide | Transparency |
| **Preserve state** | Don't clear cart on validation error | Don't lose work |

### 6.5 Shipping Readiness Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Address required** | Before shipping method | Calculation |
| **Pincode check** | Validate serviceability | Accuracy |
| **Shipping options** | Show available methods + prices | Choice |
| **Delivery estimate** | Show estimated delivery date | Planning |
| **Free shipping threshold** | Show progress toward free shipping | Incentive |
| **Shipping cost** | Included in order total | Transparency |

**Shipping Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Address first** | Require address before showing options | Accuracy |
| **Real-time rates** | Calculate based on address + weight | Accuracy |
| **Free shipping** | Highlight when threshold met | Incentive |
| **Delivery date** | Show estimated date, not just days | Planning |
| **Multiple options** | Standard + express at minimum | Choice |
| **Shipping cost visible** | Before "Place Order" | Transparency |

### 6.6 Coupon Readiness Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Input field** | In cart and checkout | Accessible |
| **Apply button** | Next to input | Clear action |
| **Validation** | Real-time on apply | Immediate feedback |
| **Success** | Show discount amount + new total | Reinforcement |
| **Error** | Specific message (expired, minimum not met) | Actionable |
| **Remove** | X button to remove applied coupon | Control |
| **Coupon display** | Show coupon code + savings in summary | Transparency |

**Coupon Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One at a time** | Only one coupon per order | Business rule |
| **Minimum order** | Show minimum before apply | Expectation |
| **Expiry date** | Show if coupon has expiry | Transparency |
| **Stacking** | Clear which promotions combine | Predictability |
| **Savings display** | Show exactly how much saved | Reinforcement |

### 6.7 Order Review Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Order summary** | Always visible (collapsible on mobile) | Transparency |
| **Items list** | Image + name + variant + quantity + price | Complete |
| **Subtotal** | Before discounts and shipping | Context |
| **Discount** | Applied coupons/sales | Savings visibility |
| **Shipping** | Cost + method | Transparency |
| **Tax** | Included in total | Transparency |
| **Total** | Final amount, prominent | Decision factor |
| **Place Order** | Primary CTA, full-width on mobile | Conversion |

**Order Review Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never hidden** | Summary always visible | Transparency |
| **Collapsible on mobile** | Expand to see full details | Space efficiency |
| **Final confirmation** | "Place Order" requires explicit tap | Prevent accidents |
| **Loading state** | Spinner during payment processing | Feedback |
| **Error recovery** | "Try again" on payment failure | Resilience |
| **Success page** | Full-page confirmation with order number | Clear completion |

### 6.8 Customer Confirmation Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Confirmation page** | Full-page with order number | Clear completion |
| **Success message** | "Order placed successfully!" | Positive reinforcement |
| **Order number** | Prominent, copyable | Reference |
| **What's next** | Timeline of what happens next | Orientation |
| **Email confirmation** | "Confirmation email sent" | Reassurance |
| **Continue shopping** | CTA to return to shop | Engagement |
| **Track order** | Link to order tracking | Transparency |
| **Share** | Share order confirmation (optional) | Social |

---

## 7. UX Principles & Standards

### 7.1 What

Detailed UX standards for every interaction pattern — one-handed usage, thumb-friendly actions, minimal clicks, progressive disclosure, error prevention, recovery from mistakes, clear feedback, and premium interactions.

### 7.2 Why

- **Usability:** Every interaction feels obvious.
- **Efficiency:** Users accomplish goals fast.
- **Delight:** Every interaction feels polished.
- **Accessibility:** Every user can interact.

### 7.3 Where

Every interactive element, every flow, every screen.

### 7.4 One-Handed Usage Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Primary actions in thumb zone** | Bottom 1/3 of mobile screen | Ergonomics |
| **Bottom navigation** | 5 tabs, always visible | Thumb-friendly |
| **Sticky CTAs** | Primary buttons fixed on scroll | Always accessible |
| **Swipe actions** | Swipe to delete, not tap tiny button | Natural gesture |
| **Pull to refresh** | Standard pull gesture | Familiar |
| **Large touch targets** | Minimum 44x44px | Accuracy |

### 7.5 Thumb-Friendly Actions Standards

| Zone | Reachability | Actions |
|------|-------------|---------|
| **Bottom zone** | Easy | Navigation, CTAs, quantity controls |
| **Middle zone** | Moderate | Content, product cards |
| **Top zone** | Hard | Header actions (search, cart, account) |
| **Left edge** | Easy (right thumb) | Back button |
| **Right edge** | Easy (left thumb) | Secondary actions |

### 7.6 Minimal Clicks Standards

| Goal | Maximum Taps | Path |
|------|-------------|------|
| **Browse products** | 1 tap | Bottom nav → Shop |
| **View product** | 1 tap | Product card → Detail |
| **Add to cart** | 2 taps | Select variant → Add to Cart |
| **Checkout** | 1 tap | Cart → Checkout |
| **Search** | 1 tap | Search icon → Input |
| **View orders** | 2 taps | Account → Orders |
| **Track order** | 2 taps | Orders → Track |

### 7.7 Progressive Disclosure Standards

| Context | Show First | Show on Demand |
|---------|-----------|----------------|
| **Product card** | Image, name, price | Variant options, description |
| **Product detail** | Images, name, price, variants | Description, specs, reviews |
| **Cart** | Items, subtotal, checkout | Shipping, promo code, totals |
| **Checkout** | Required fields only | Optional fields, order summary |
| **Account** | Overview, quick actions | Full settings, data export |

### 7.8 Error Prevention Standards

| Context | Prevention | Implementation |
|---------|-----------|----------------|
| **Out of stock** | Disable "Add to Cart" | Grayed button + message |
| **Invalid email** | Real-time validation | Inline error on blur |
| **Weak password** | Strength indicator | Visual feedback |
| **Address validation** | Pincode lookup | Auto-fill city/state |
| **Duplicate account** | Email check on register | Real-time feedback |
| **Cart limit** | Max quantity enforcement | Disabled + button |
| **Double submit** | Disable button during submit | Loading state |

### 7.9 Recovery from Mistakes Standards

| Mistake | Recovery | Implementation |
|---------|----------|----------------|
| **Wrong item in cart** | Remove or edit quantity | Inline controls |
| **Wrong address** | Edit during checkout | Edit button |
| **Wrong variant** | Change selection | Re-select variant |
| **Applied wrong coupon** | Remove coupon | X button |
| **Accidental purchase** | Cancel before shipping | Cancel button |
| **Navigated away** | Cart preserved | Persistence |
| **Form error** | Preserve form data | Don't clear on error |

### 7.10 Clear Feedback Standards

| Action | Feedback | Implementation |
|--------|----------|----------------|
| **Add to cart** | Toast + cart badge update | Immediate confirmation |
| **Remove from cart** | Undo toast | Reversible action |
| **Wishlist toggle** | Icon state change + toast | Instant visual |
| **Form submit** | Spinner + success/error | Clear outcome |
| **Payment** | Processing state + result | Transparent |
| **Search** | Result count + grid | Context |
| **Filter** | Updated grid + count | Confirmation |
| **Sort** | Reordered grid | Immediate |

### 7.11 Premium Interactions Standards

| Interaction | Standard | Rationale |
|-------------|----------|-----------|
| **Page transitions** | Fade + slide, 300ms | Smooth navigation |
| **Card hover** | Subtle elevation + shadow | Interactive feel |
| **Button press** | Scale down 98%, 150ms | Tactile feedback |
| **Image gallery** | Smooth swipe with momentum | Fluid browsing |
| **Modal open** | Scale up + fade in | Focused attention |
| **Toast** | Slide in from right | Non-intrusive |
| **Skeleton loading** | Shimmer animation | Perceived speed |
| **Scroll animations** | Fade in on scroll | Delightful |
| **Micro-interactions** | Subtle, purposeful motion | Premium feel |

---

## 8. Trust Building Architecture

### 8.1 What

Standards for building and maintaining customer trust throughout the shopping experience — product confidence, secure checkout indicators, return policy visibility, shipping information, customer reassurance, premium branding, and consistent messaging.

### 8.2 Why

- **Conversion:** Trust directly drives purchases.
- **Retention:** Trusted customers return.
- **Brand:** Premium brands feel trustworthy.
- **Differentiation:** Trust separates from competitors.

### 8.3 Where

Every page, every interaction, every communication.

### 8.4 Product Confidence Architecture

| Signal | Placement | Rationale |
|--------|-----------|-----------|
| **High-quality images** | Product detail, gallery | Visual confidence |
| **Customer reviews** | Product detail, above fold | Social proof |
| **Verified purchase badge** | On reviews | Authenticity |
| **Customer photos** | In reviews | Real-world proof |
| **Star rating** | Product card + detail | Quick assessment |
| **Review count** | Next to star rating | Volume signal |
| **Product videos** | In gallery | Rich demonstration |
| **Size guide** | Near size selector | Fit confidence |
| **Material details** | In description/specs | Quality signal |
| **Brand page** | Link to brand | Brand trust |

### 8.5 Secure Checkout Architecture

| Signal | Placement | Rationale |
|--------|-----------|-----------|
| **SSL badge** | Checkout header | Security |
| **Secure payment icons** | Payment section | Trust |
| **Padlock icon** | In header during checkout | Visual security |
| **"Secure checkout" text** | Checkout page | Verbal reassurance |
| **Payment method logos** | Payment section | Recognition |
| **Encryption notice** | Below payment | Technical trust |
| **No redirects** | Stay on Nabome domain | Continuity |
| **Order summary** | Always visible | Transparency |

### 8.6 Return Policy Architecture

| Signal | Placement | Rationale |
|--------|-----------|-----------|
| **Policy link** | Footer, product detail | Discoverable |
| **"Easy returns" badge** | Product cards | Reassurance |
| **Return window** | Product detail, checkout | Transparency |
| **Free returns** | If applicable, prominent | Incentive |
| **Return process** | Dedicated page with steps | Clarity |
| **Instant refund** | If applicable, highlighted | Trust |

### 8.7 Shipping Information Architecture

| Signal | Placement | Rationale |
|--------|-----------|-----------|
| **Free shipping threshold** | Product cards, cart | Incentive |
| **Delivery estimate** | Product detail, checkout | Planning |
| **Shipping methods** | Checkout | Choice |
| **Tracking available** | Order confirmation, orders | Transparency |
| **Carrier partnership** | Order tracking page | Credibility |

### 8.8 Customer Reassurance Architecture

| Signal | Placement | Rationale |
|--------|-----------|-----------|
| **Trust badges** | Homepage, footer | Platform trust |
| **Customer testimonials** | Homepage | Social proof |
| **Media mentions** | Homepage | Credibility |
| **Contact information** | Footer, contact page | Accessibility |
| **Response time** | Contact page | Expectation |
| **Live chat** | Floating button (future) | Immediate help |

### 8.9 Premium Branding Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Logo consistency** | Same logo everywhere | Recognition |
| **Color consistency** | Brand colors used consistently | Identity |
| **Typography consistency** | Cormorant Garamond + Manrope | Editorial feel |
| **Spacing consistency** | Generous white space | Luxury |
| **Image quality** | High-resolution, consistent style | Premium |
| **Copy tone** | Warm, confident, minimal | Brand voice |
| **No third-party branding** | Never show Shop Owner names | Nabome-only |

### 8.10 Consistent Messaging Architecture

| Context | Message Style | Example |
|---------|--------------|---------|
| **Success** | Positive, confirmative | "Added to cart" |
| **Error** | Helpful, specific | "Please select a size" |
| **Empty state** | Inviting, directional | "Your cart is empty. Start exploring." |
| **Loading** | Reassuring | "Loading products..." |
| **Confirmation** | Clear, complete | "Order #NAB-123456 confirmed" |
| **Policy** | Transparent, honest | "Free returns within 7 days" |

---

## 9. Responsive Behavior Architecture

### 9.1 What

Standards for how the customer experience adapts across mobile, tablet, desktop, and orientation changes — ensuring premium experience at every viewport.

### 9.2 Why

- **Mobile-first:** 70%+ traffic is mobile.
- **Consistency:** Same brand feel across devices.
- **Accessibility:** Works on every screen size.
- **Performance:** Appropriate resources per device.

### 9.3 Where

Every page, every component, every interaction.

### 9.4 Mobile Standards (< 640px)

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Navigation** | Bottom nav, 5 tabs | Thumb-friendly |
| **Header** | Hamburger + logo + actions | Space-efficient |
| **Product grid** | 2 columns | Visible products |
| **Product detail** | Full-width gallery, stacked info | Visual priority |
| **Cart** | Full-width items | Readable |
| **Checkout** | Single column, stacked | Simple |
| **Filters** | Bottom sheet | Touch-friendly |
| **Modals** | Full-screen | Immersive |
| **Touch targets** | 44x44px minimum | Accuracy |
| **Font size** | 16px minimum | Readability |

### 9.5 Tablet Standards (640px - 1023px)

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Navigation** | Top nav, horizontal | More space |
| **Product grid** | 3 columns | Medium optimization |
| **Product detail** | 2-column: gallery + info | Balanced |
| **Cart** | 2-column: items + summary | Balanced |
| **Checkout** | 2-column: form + summary | Efficient |
| **Filters** | Left sidebar | Always visible |
| **Modals** | Centered, 560px | Focused |

### 9.6 Desktop Standards (1024px+)

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Navigation** | Top nav + mega menu | Full experience |
| **Product grid** | 4 columns | Maximum visibility |
| **Product detail** | 2-column: gallery (50%) + info (50%) | Balanced |
| **Cart** | 2-column: items + summary | Clear |
| **Checkout** | 2-column: form + summary | Efficient |
| **Filters** | Left sidebar, 280px | Always visible |
| **Modals** | Centered, max 720px | Focused |
| **Hover states** | Full hover effects | Desktop engagement |
| **Keyboard nav** | Full keyboard support | Accessibility |

### 9.7 Orientation Change Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Preserve state** | Don't lose scroll position | Continuity |
| **Re-layout** | Adapt to new dimensions | Optimal view |
| **No content loss** | All content accessible | Completeness |
| **Smooth transition** | No jarring reflow | Comfort |
| **Test both** | Verify landscape and portrait | Quality |

---

## 10. Performance Architecture

### 10.1 What

Standards for customer-facing performance — fast browsing, lazy loading, optimized media, smooth transitions, Core Web Vitals, and low bandwidth readiness.

### 10.2 Why

- **Retention:** Fast experiences keep customers.
- **Conversion:** Slow pages lose sales.
- **SEO:** Performance affects rankings.
- **Trust:** Fast = professional.

### 10.3 Where

Every page, every interaction, every image, every animation.

### 10.4 Core Web Vitals Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **LCP** | < 2.5s | Largest Contentful Paint |
| **INP** | < 200ms | Interaction to Next Paint |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **FCP** | < 1.5s | First Contentful Paint |
| **TTFB** | < 800ms | Time to First Byte |
| **TTI** | < 3.5s | Time to Interactive |

### 10.5 Lazy Loading Architecture

| Resource | Strategy | Implementation |
|----------|----------|----------------|
| **Below-fold images** | Lazy load on scroll | `loading="lazy"` |
| **Product gallery** | Load first, lazy rest | Priority + lazy |
| **Recommendations** | Load when scrolled into view | Intersection Observer |
| **Videos** | Load poster only, video on play | Poster + defer |
| **Modals** | Load content on open | Dynamic import |
| **Infinite scroll** | Load next page on scroll | Intersection Observer |

### 10.6 Optimized Media Architecture

| Resource | Optimization | Rationale |
|----------|-------------|-----------|
| **Images** | WebP/AVIF format | Smaller files |
| **Images** | Responsive srcset | Right size per device |
| **Images** | Cloudinary transformations | On-the-fly optimization |
| **Images** | Lazy loading | Faster initial load |
| **Videos** | Compressed MP4 | Smaller files |
| **Videos** | Poster images | Fast preview |
| **Fonts** | Subset Latin + Devanagari | Smaller files |
| **Fonts** | `font-display: swap` | No invisible text |

### 10.7 Smooth Transitions Architecture

| Transition | Duration | Easing |
|------------|----------|--------|
| **Page navigation** | 300ms | ease-luxe-out |
| **Modal open/close** | 300ms | ease-spring |
| **Toast appear/disappear** | 300ms | ease-luxe-out |
| **Card hover** | 300ms | ease-luxe-out |
| **Button press** | 150ms | ease-luxe-in |
| **Skeleton shimmer** | 800ms | linear |
| **Scroll fade-in** | 500ms | ease-luxe-out |

### 10.8 Low Bandwidth Architecture

| Strategy | Implementation | Rationale |
|----------|---------------|-----------|
| **Skeleton loading** | Show content shape immediately | Perceived speed |
| **Optimistic updates** | Show result before server confirms | Perceived speed |
| **Service worker** | Cache static assets | Offline support |
| **Progressive loading** | Low-res → high-res images | Faster initial |
| **Code splitting** | Route-level chunks | Smaller bundles |
| **Compression** | Brotli/gzip on all assets | Smaller transfer |
| **CDN** | Cloudflare edge caching | Global speed |
| **Preload critical** | Preload above-fold resources | Faster render |

---

## 11. Accessibility Architecture

### 11.1 What

WCAG 2.2 AA compliance standards for every customer-facing component, page, and interaction — keyboard support, screen readers, touch accessibility, reduced motion, readable typography, and focus management.

### 11.2 Why

- **Legal compliance:** Meet accessibility laws.
- **Inclusivity:** Everyone can use the platform.
- **Quality:** Accessible code is better code.
- **SEO:** Search engines favor accessible sites.

### 11.3 Where

Every user-facing component and page.

### 11.4 Keyboard Support Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical, follows visual flow | Intuitive |
| **Focus visible** | Clear focus ring (brand-500) | Orientation |
| **No keyboard trap** | Always able to escape | Recovery |
| **Shortcuts** | `/` search, `ESC` close, `Enter` activate | Efficiency |
| **Arrow keys** | Navigate within components | Familiar |
| **Skip link** | "Skip to main content" | Efficiency |
| **Focus management** | Return focus on modal close | Continuity |

### 11.5 Screen Reader Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic HTML** | `<nav>`, `<main>`, `<button>`, `<article>` | Meaning |
| **ARIA landmarks** | Label regions | Navigation |
| **Alt text** | Descriptive for meaningful images | Understanding |
| **Hidden decorative** | `aria-hidden="true"` for icons | Reduce noise |
| **Live regions** | `aria-live` for dynamic content | Updates |
| **Form labels** | Associated with inputs | Understanding |
| **Error association** | `aria-describedby` for errors | Clarity |
| **Headings** | Proper H1-H6 hierarchy | Navigation |
| **Lists** | Use `<ul>`, `<ol>` for lists | Structure |
| **Tables** | Proper `<th>`, `<caption>` for tables | Data |

### 11.6 Touch Accessibility Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Min target** | 44x44px | Ease of use |
| **Spacing** | 8px between targets | Prevent miss-taps |
| **No hover only** | Works without hover | Touch devices |
| **Gesture alternatives** | Button alternatives for gestures | Accessibility |
| **Long press** | Optional, not required | Not all users |

### 11.7 Reduced Motion Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Honor preference** | `prefers-reduced-motion: reduce` | Vestibular disorders |
| **Disable animations** | Use CSS media query | Comfort |
| **Alternative feedback** | Use opacity/color instead of motion | Still informative |
| **No auto-play** | User controls playback | Control |
| **No flashing** | No content flashes > 3 times/second | Seizure prevention |

### 11.8 Readable Typography Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Min font size** | 16px body, 12px caption | Readability |
| **Line height** | 1.5-1.6 for body | Readability |
| **Max line length** | 65-75 characters | Readability |
| **Contrast ratio** | 4.5:1 normal, 3:1 large | WCAG AA |
| **No justified text** | Left-aligned | Readability |
| **Text scaling** | Works up to 200% zoom | Accessibility |

### 11.9 Focus Management Standards

| Context | Standard | Rationale |
|---------|----------|-----------|
| **Page load** | Focus on main content | Skip header |
| **Modal open** | Focus moves to modal | Trap focus |
| **Modal close** | Focus returns to trigger | Continuity |
| **Tab navigation** | Focus visible, logical order | Orientation |
| **Error** | Focus moves to first error | Guidance |
| **Form submit** | Focus moves to success/error | Feedback |

---

## 12. Future Readiness Architecture

### 12.1 What

Architecture standards for future customer experience features — AI shopping assistant, personalized homepage, smart recommendations, voice shopping, image shopping, loyalty program, gift registry, multi-language, and multi-currency.

### 12.2 Why

- **Scalability:** New features extend without redesign.
- **Competitiveness:** Ready for market demands.
- **Innovation:** Architecture supports experimentation.
- **Investment:** Future-proof development effort.

### 12.3 Where

New features, extensions, integrations.

### 12.4 AI Shopping Assistant Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Trigger** | Floating button, bottom-right | Discoverable |
| **Interface** | Chat-like overlay | Familiar |
| **Capabilities** | Product search, recommendations, Q&A | Helpful |
| **Context** | Aware of browsing history | Personalized |
| **Fallback** | "Talk to support" link | Human backup |
| **Privacy** | Clear data usage | Trust |

### 12.5 Personalized Homepage Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Personalized sections** | "Recommended for you", "Recently viewed" | Relevant |
| **Fallback** | Show generic sections for guests | Zero friction |
| **Opt-out** | Allow disabling personalization | Control |
| **Data usage** | Transparent about data used | Trust |
| **A/B testing** | Architecture supports variant testing | Optimization |

### 12.6 Smart Recommendations Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Data sources** | Browse history, purchase history, wishlist | Comprehensive |
| **Algorithm** | Collaborative + content-based filtering | Accuracy |
| **Real-time** | Update during session | Relevant |
| **Fallback** | Category-based for new users | Cold start |
| **Explainability** | "Because you viewed X" | Transparency |

### 12.7 Voice Shopping Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Trigger** | Microphone icon in search | Discoverable |
| **API** | Web Speech API | Native browser |
| **Feedback** | Visual indicator when listening | Confirmation |
| **Fallback** | Hide if not supported | Graceful |
| **Privacy** | Request permission before listening | Trust |

### 12.8 Image Shopping Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Trigger** | Camera icon in search | Discoverable |
| **Input** | Camera capture or file upload | Flexible |
| **Processing** | Visual similarity search | Smart |
| **Results** | Similar products grid | Discovery |
| **Fallback** | Hide if not supported | Graceful |

### 12.9 Loyalty Program Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Points display** | Visible in account and cart | Motivation |
| **Earning** | Points per purchase | Engagement |
| **Redemption** | Apply points at checkout | Value |
| **Tiers** | Bronze, Silver, Gold, Platinum | Aspiration |
| **Benefits** | Clear per-tier benefits | Transparency |
| **Expiry** | Points expiry policy | Urgency |

### 12.10 Gift Registry Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Create** | In account section | Self-service |
| **Share** | Link sharing | Social |
| **Contribution** | Partial contribution support | Flexibility |
| **Tracking** | Show purchased vs. remaining | Transparency |
| **Thank you** | Auto thank-you notes | Gratitude |

### 12.11 Multi-Language Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Language selector** | In header or settings | Discoverable |
| **Default** | Based on browser/locale | Automatic |
| **Persistence** | Save preference | Continuity |
| **URL** | Language prefix or subdomain | SEO |
| **Content** | Admin-managed translations | CMS |
| **Products** | Translatable fields | Completeness |

### 12.12 Multi-Currency Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Currency selector** | In header or settings | Discoverable |
| **Default** | Based on IP/location | Automatic |
| **Persistence** | Save preference | Continuity |
| **Conversion** | Real-time exchange rates | Accuracy |
| **Display** | Symbol + formatted amount | Readable |
| **Checkout** | Charge in selected currency | Transparency |

---

## 13. Mandatory Rules for AI Agents

### 13.1 What

Hard rules that every AI agent must follow when designing, implementing, or reviewing the customer experience.

### 13.2 Why

- **Consistency:** No exceptions to the rules.
- **Quality:** Every interaction meets the standard.
- **Brand integrity:** Nabome brand is always protected.

### 13.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Nabome-only brand** | Never expose Shop Owner identity to customers | Brand integrity |
| **Mobile-first** | Design for 375px, enhance upward | 70%+ traffic |
| **Premium minimalism** | Every element earns its place | Luxury feel |
| **Trust at every step** | Security, transparency, honesty | Conversion |
| **Guest checkout** | Available without registration | Zero friction |
| **Transparent pricing** | All costs visible before payment | Trust |
| **Cart persistence** | Cart saved across sessions | Don't lose work |
| **Error recovery** | Every error has clear recovery path | Resilience |
| **Accessibility** | WCAG 2.2 AA compliance | Inclusivity |
| **Performance** | < 2.5s LCP on mobile | Retention |
| **One-handed usage** | Thumb-friendly on mobile | Ergonomics |
| **Progressive disclosure** | Show only what's needed | Cognitive load |
| **Clear feedback** | Every action has visible response | Trust |
| **Consistent patterns** | Same behavior everywhere | Predictability |
| **No visual clutter** | Minimal, premium interface | Brand |
| **No forced registration** | Guest experience first | Conversion |
| **No hidden costs** | Transparent pricing | Trust |
| **No hover dependency** | Works on touch | Mobile-first |
| **No color-only indicators** | Use icons + text | Accessibility |
| **No auto-play** | User-initiated media only | Respect |

### 13.4 Agent Decision Framework

When implementing any customer-facing feature, agent must ask:

1. **Is this Nabome-only?** — Does this expose any Shop Owner identity?
2. **Is this mobile-first?** — Would this work on a 375px screen?
3. **Is this premium?** — Does this feel luxurious and minimal?
4. **Is this trustworthy?** — Does this build or maintain trust?
5. **Is this accessible?** — Can every user complete this?
6. **Is this fast?** — Will this feel instant?
7. **Is this clear?** — Would a first-time user understand this?
8. **Is this consistent?** — Does this match existing patterns?
9. **Is this recoverable?** — Can the user undo or go back?
10. **Is this minimal?** — Can any element be removed?

### 13.5 Customer Experience Checklist

Before shipping any customer-facing feature:

- [ ] Mobile-first design verified at 375px
- [ ] Touch targets minimum 44x44px
- [ ] Keyboard navigation works
- [ ] Screen reader announces all content
- [ ] Focus management correct
- [ ] Loading states present
- [ ] Error states with recovery
- [ ] Empty states with guidance
- [ ] Trust signals visible
- [ ] Transparent pricing
- [ ] No Shop Owner identity leakage
- [ ] Premium visual treatment
- [ ] Consistent with existing patterns
- [ ] Performance budget met
- [ ] Accessibility audit passed

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
