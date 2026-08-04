# নবME (Nabome) — UX, Navigation & Information Architecture Standard

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for UX architecture, navigation, information hierarchy, and usability standards
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0)

---

## Table of Contents

1. [UX Philosophy](#1-ux-philosophy)
2. [Information Architecture](#2-information-architecture)
3. [Navigation Architecture](#3-navigation-architecture)
4. [Page Hierarchy & Organization](#4-page-hierarchy--organization)
5. [User Journey Architecture](#5-user-journey-architecture)
6. [Interaction Architecture](#6-interaction-architecture)
7. [Search & Discovery Architecture](#7-search--discovery-architecture)
8. [Dashboard Architecture](#8-dashboard-architecture)
9. [Error Recovery Architecture](#9-error-recovery-architecture)
10. [Empty State Architecture](#10-empty-state-architecture)
11. [First-time User Experience](#11-first-time-user-experience)
12. [Accessibility Architecture](#12-accessibility-architecture)
13. [Performance UX Architecture](#13-performance-ux-architecture)
14. [Consistency Standards](#14-consistency-standards)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. UX Philosophy

### 1.1 What

The foundational UX principles that govern every interaction across the Nabome platform.

### 1.2 Why

- **Effortless experience:** Every action should feel obvious without instructions.
- **Trust:** Users must always know where they are, what they can do, what happens next, and how to recover from mistakes.
- **Premium feel:** The experience must feel premium, minimal, elegant, and trustworthy.
- **Mobile-first:** 70%+ traffic is mobile; every design decision starts with mobile.

### 1.3 Where

Every screen, every interaction, every flow, every decision.

### 1.4 Core UX Tenets

| Tenet | Description | Rationale |
|-------|-------------|-----------|
| **Effortless** | Every action is obvious without instructions | Zero learning curve |
| **Oriented** | Users always know where they are | Orientation prevents confusion |
| **Transparent** | Users always know what they can do | Empowerment, not guessing |
| **Predictable** | Users always know what happens next | Trust through predictability |
| **Forgiving** | Users always know how to recover from mistakes | Confidence to explore |
| **Premium** | Every interaction feels elegant | Brand perception |
| **Minimal** | Fewer clicks, fewer steps, fewer decisions | Cognitive load reduction |
| **Intentional** | Every interaction feels purposeful | No wasted effort |

### 1.5 Design Priorities (Ranked)

| Priority | Standard | Rationale |
|----------|----------|-----------|
| **Mobile-first** | Design for thumb, enhance for desktop | 70%+ traffic is mobile |
| **One-handed mobile usage** | All primary actions reachable by thumb | Ergonomics |
| **Tablet optimized** | Enhanced layout, not stretched mobile | Medium screens |
| **Desktop refined** | Full experience, keyboard accessible | Power users |
| **Beginner-friendly** | First-time user succeeds immediately | Accessibility |
| **Minimal learning curve** | Familiar patterns, clear labels | Adoption |
| **Premium interactions** | Apple-level micro-interactions | Brand |
| **Minimal clicks** | 3 taps to any goal | Efficiency |
| **Clear information hierarchy** | One focal point per viewport | Comprehension |
| **Accessibility by default** | WCAG 2.2 AA compliance | Inclusivity |

### 1.6 Anti-Patterns to Avoid

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Overwhelming users with choices | Decision paralysis | Progressive disclosure |
| Hiding important actions | Users can't find what they need | Prominent CTAs |
| Requiring unnecessary navigation | Wasted effort | Inline actions |
| Unintentional interactions | Confusion, accidental actions | Purposeful design |
| Effort-heavy workflows | Frustration, abandonment | Streamlined flows |
| Mobile decisions first | 70%+ traffic is mobile | Always design mobile first |

---

## 2. Information Architecture

### 2.1 What

The structural design of the information space — how content is organized, labeled, and connected so users can find what they need.

### 2.2 Why

- **Findability:** Users find what they need without searching aimlessly.
- **Comprehension:** Users understand the relationship between content.
- **Predictability:** Users can anticipate where content lives.
- **Scalability:** New content fits naturally into existing structure.

### 2.3 Where

Every page, every navigation decision, every content relationship.

### 2.4 Content Taxonomy

```
┌─────────────────────────────────────────────────────────────────┐
│                    NABOME INFORMATION ARCHITECTURE                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    STOREFRONT                              │   │
│  │                                                           │   │
│  │  Homepage                                                 │   │
│  │  ├── Shop                                                 │   │
│  │  │   ├── Categories (Men, Women, Kids)                    │   │
│  │  │   │   └── Subcategories (Shirts, Pants, etc.)          │   │
│  │  │   ├── Collections (Curated groupings)                  │   │
│  │  │   ├── Brands                                           │   │
│  │  │   └── New Arrivals / Best Sellers / Sale                │   │
│  │  ├── Search                                               │   │
│  │  ├── Cart                                                 │   │
│  │  ├── Checkout                                             │   │
│  │  ├── Account                                              │   │
│  │  │   ├── Profile                                          │   │
│  │  │   ├── Orders                                           │   │
│  │  │   ├── Addresses                                        │   │
│  │  │   ├── Wishlist                                         │   │
│  │  │   └── Settings                                         │   │
│  │  └── Blog                                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ADMIN PANEL                             │   │
│  │                                                           │   │
│  │  Dashboard                                                │   │
│  │  ├── Products                                             │   │
│  │  ├── Orders                                               │   │
│  │  ├── Customers                                            │   │
│  │  ├── Categories                                           │   │
│  │  ├── Collections                                          │   │
│  │  ├── Brands                                               │   │
│  │  ├── Coupons                                              │   │
│  │  ├── CMS                                                  │   │
│  │  ├── Media                                                │   │
│  │  ├── Analytics                                            │   │
│  │  └── Settings                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Content Hierarchy Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Flat over deep** | Max 3 levels of nesting | Findability |
| **Descriptive labels** | "My Orders" not "Orders" | Clarity |
| **Predictable structure** | Same hierarchy everywhere | Consistency |
| **Scalable taxonomy** | New items fit existing structure | Maintainability |
| **One primary purpose per page** | Clear page goals | Focus |
| **Progressive disclosure** | Show only what's needed | Cognitive load |

### 2.6 Label Standards

| Context | Pattern | Example |
|---------|---------|---------|
| **Navigation** | Noun or noun-phrase | Shop, Cart, Account |
| **Actions** | Verb + noun | Add to Cart, Place Order |
| **Page titles** | Descriptive phrase | My Orders, Order Details |
| **Empty states** | Explains absence + action | "No orders yet. Start shopping." |
| **Errors** | What happened + how to fix | "Item out of stock. Try a different size." |

### 2.7 URL Architecture

| Pattern | Example | Rationale |
|---------|---------|-----------|
| **Resource listing** | `/shop` | Collection page |
| **Resource detail** | `/shop/:slug` | Human-readable slugs |
| **Category** | `/shop/:category` | Logical grouping |
| **Search** | `/search?q=term` | Query-based |
| **Cart** | `/cart` | Simple, memorable |
| **Checkout** | `/checkout` | Sequential |
| **Account** | `/account` | Personal space |
| **Admin** | `/admin` | Separate area |
| **Blog** | `/blog` | Content area |
| **Blog post** | `/blog/:slug` | Human-readable |

### 2.8 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Deep nesting (4+ levels) | Users get lost | Flat hierarchy |
| Ambiguous labels ("Stuff") | Users can't predict content | Descriptive labels |
| Inconsistent naming ("Settings" vs "Preferences") | Confusion | Consistent terminology |
| Technical jargon ("FK references") | Users don't understand | Plain language |
| Hidden content | Users can't find it | Visible navigation |

---

## 3. Navigation Architecture

### 3.1 What

The system that allows users to move between pages and sections, maintaining orientation and enabling efficient task completion.

### 3.2 Why

- **Orientation:** Users always know where they are.
- **Efficiency:** Users reach their goal with minimal effort.
- **Discoverability:** Users find features they didn't know existed.
- **Consistency:** Same navigation behavior everywhere.

### 3.3 Where

Every page, every screen, every interaction.

### 3.4 Navigation Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Mobile-first** | Design navigation for mobile, enhance for desktop | 70%+ traffic |
| **One-handed** | All primary navigation reachable by thumb | Ergonomics |
| **Persistent** | Primary navigation always visible | Orientation |
| **Minimal** | Show only essential navigation | Reduce cognitive load |
| **Predictable** | Same navigation behavior everywhere | Consistency |
| **Recoverable** | Users can always go back | Control |

### 3.5 Navigation Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAVIGATION HIERARCHY                           │
│                                                                  │
│  Level 1: PRIMARY NAVIGATION                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Mobile: Bottom navigation (5 tabs)                       │   │
│  │  Desktop: Top navigation bar                              │   │
│  │  Always visible, always accessible                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Level 2: SECONDARY NAVIGATION                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Category navigation, subcategory tabs, account menu      │   │
│  │  Visible within context, contextual to section            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Level 3: CONTEXTUAL NAVIGATION                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Breadcrumbs, back buttons, related links                 │   │
│  │  Appears when needed, supports orientation                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Level 4: UTILITY NAVIGATION                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Search, filters, settings, help                          │   │
│  │  Available when needed, never overwhelming                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Mobile Navigation

#### 3.6.1 Bottom Navigation (Primary)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Items** | Exactly 5 items | Thumb-friendly maximum |
| **Order** | Home, Shop, Search, Cart, Account | Consistent muscle memory |
| **Labels** | Always visible | Clarity |
| **Icons** | Lucide icons, consistent style | Visual harmony |
| **Active state** | Brand color + filled icon | Clear orientation |
| **Badge** | Cart shows item count | Information at a glance |
| **Fixed position** | Always at bottom | Always accessible |
| **Height** | 64px including safe area | Touch-friendly |
| **Safe area** | Respect device safe areas | Prevent overlap |

#### 3.6.2 Bottom Navigation Items

| Position | Item | Icon | Path | Badge |
|----------|------|------|------|-------|
| 1 | Home | Home | `/` | None |
| 2 | Shop | Grid3x3 | `/shop` | None |
| 3 | Search | Search | `/search` | None |
| 4 | Cart | ShoppingCart | `/cart` | Item count |
| 5 | Account | User | `/account` | None |

#### 3.6.3 Mobile Back Navigation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Back button** | Top-left, always visible | Predictable location |
| **Behavior** | Goes to previous page in history | User expectation |
| **Label** | Arrow icon only (no "Back" text) | Space efficiency |
| **Context** | Shows parent page title when applicable | Orientation |
| **Deep links** | Back goes to parent section | Logical hierarchy |

#### 3.6.4 Mobile Hamburger Menu

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Top-right corner | Familiar pattern |
| **Animation** | Slide from right | Natural gesture |
| **Content** | Secondary links, settings, help | Not primary navigation |
| **Close** | Tap X, swipe right, tap outside | Multiple recovery paths |
| **Overlay** | Semi-transparent backdrop | Focus |
| **Max width** | 80% of screen | Don't overwhelm |

### 3.7 Desktop Navigation

#### 3.7.1 Top Navigation Bar

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Position** | Fixed top | Always accessible |
| **Height** | 80px | Consistent |
| **Logo** | Left-aligned, links to home | Brand anchor |
| **Nav items** | Center or left-aligned | Discoverable |
| **Actions** | Right-aligned (search, cart, account) | Consistent |
| **Sticky** | Always visible on scroll | Navigation always available |
| **Max width** | 1280px, centered | Readable content width |

#### 3.7.2 Desktop Navigation Items

| Position | Item | Path | Behavior |
|----------|------|------|----------|
| Left | Logo | `/` | Home link |
| Center | Shop | `/shop` | Dropdown with categories |
| Center | Collections | `/shop?collection=...` | Direct link |
| Center | New Arrivals | `/shop?sort=new` | Direct link |
| Center | Sale | `/shop?sale=true` | Direct link |
| Right | Search | `/search` | Expandable search |
| Right | Account | `/account` | Dropdown menu |
| Right | Cart | `/cart` | Badge + link |

#### 3.7.3 Mega Menu (Shop Dropdown)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Hover on "Shop" | Desktop convention |
| **Layout** | 3-column: Categories, Subcategories, Featured | Organized |
| **Categories** | Men, Women, Kids, All | Clear taxonomy |
| **Featured** | Featured collection or promotion | Engagement |
| **Close** | Mouse leaves menu area | Natural dismissal |
| **Keyboard** | Tab through items, Escape to close | Accessibility |
| **Animation** | Fade in, 150ms | Smooth |

#### 3.7.4 Desktop Search

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Top-right, expandable | Familiar pattern |
| **Expand** | Click search icon, input appears | Space efficient |
| **Autocomplete** | Show suggestions as user types | Speed |
| **Keyboard** | `/` to focus, Escape to close | Power users |
| **Results** | Dropdown with product previews | Quick access |
| **Full page** | "See all results" links to search page | Comprehensive |

### 3.8 Tablet Navigation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Breakpoint** | 640px-1023px | Tablet range |
| **Navigation** | Top navigation (like desktop) | More space available |
| **Touch targets** | 44x44px minimum | Touch-friendly |
| **Grid** | 4-8 columns | Medium screen optimization |

### 3.9 Breadcrumb Navigation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Below header, above content | Orientation |
| **Format** | Home > Category > Subcategory > Product | Hierarchy |
| **Links** | All items except current page are links | Navigation |
| **Separator** | `/` or `>` | Visual clarity |
| **Mobile** | Show last 2 items with "..." for truncation | Space efficiency |
| **Truncation** | Show "..." for deep hierarchies | Prevent overflow |
| **Schema** | Use structured data (BreadcrumbList) | SEO |

### 3.10 Back Navigation Rules

| Context | Standard | Rationale |
|---------|----------|-----------|
| **Mobile header** | Left arrow, goes to previous page | Consistent |
| **Browser back** | Works correctly with history | User expectation |
| **Modal close** | ESC or X button returns to previous state | Recovery |
| **Deep link** | Back returns to parent section | Logical |
| **Form abandon** | Confirm if unsaved changes | Data protection |
| **Cart → Shop** | Back returns to last viewed shop page | Continuity |

### 3.11 Navigation Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Too many nav items (>7) | Decision paralysis | Max 5-7 primary items |
| Hidden navigation | Users can't find it | Always visible primary nav |
| Inconsistent back behavior | Confusion, broken expectations | Consistent back behavior |
| No orientation cues | Users get lost | Breadcrumbs, active states |
| Broken browser back | Frustration | Proper history management |
| Navigation on scroll away | Lost on long pages | Sticky/fixed navigation |

---

## 4. Page Hierarchy & Organization

### 4.1 What

Standards for organizing content within each page type, establishing visual hierarchy, and guiding user attention.

### 4.2 Why

- **Scannability:** Users scan, don't read; hierarchy guides the eye.
- **Focus:** One primary action per page.
- **Clarity:** Clear relationships between elements.
- **Efficiency:** Users accomplish goals faster.

### 4.3 Where

Every page in the application.

### 4.4 Universal Page Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One primary purpose** | Each page has one clear goal | Focus |
| **One focal point** | One primary element per viewport | Clear attention |
| **Clear hierarchy** | Size, color, spacing create order | Scannability |
| **Generous white space** | Premium feel, breathing room | Luxury aesthetic |
| **No visual clutter** | Every element earns its place | Focus |
| **Progressive disclosure** | Show only what's needed | Cognitive load |
| **Consistent layout** | Same patterns across pages | Predictability |
| **Responsive** | Works on all screen sizes | Accessibility |

### 4.5 Homepage Organization

| Section | Purpose | Priority |
|---------|---------|----------|
| **Header** | Navigation, search, cart | Always visible |
| **Hero** | Brand statement, primary CTA | First viewport |
| **Featured Collection** | Curated products | Engagement |
| **New Arrivals** | Latest products | Freshness |
| **Categories** | Shop by category | Discovery |
| **Best Sellers** | Social proof | Trust |
| **Blog/Content** | Editorial, SEO | Engagement |
| **Footer** | Secondary links, trust signals | Completeness |

#### Homepage Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (sticky, 80px)                                          │
│  Logo | Shop | Collections | New | Sale | 🔍 👤 🛒             │
├─────────────────────────────────────────────────────────────────┤
│  HERO SECTION                                                   │
│  Full-width image + headline + CTA                              │
│  Max height: 80vh mobile, 100vh desktop                         │
├─────────────────────────────────────────────────────────────────┤
│  FEATURED COLLECTION                                            │
│  Section title + horizontal scroll (mobile) / grid (desktop)    │
│  2-4 products visible                                           │
├─────────────────────────────────────────────────────────────────┤
│  NEW ARRIVALS                                                   │
│  Section title + product grid                                   │
│  2 cols mobile, 4 cols desktop                                  │
├─────────────────────────────────────────────────────────────────┤
│  CATEGORIES                                                     │
│  Category cards with images                                     │
│  2 cols mobile, 3-4 cols desktop                                │
├─────────────────────────────────────────────────────────────────┤
│  BEST SELLERS                                                   │
│  Section title + product grid                                   │
├─────────────────────────────────────────────────────────────────┤
│  BLOG / EDITORIAL                                               │
│  Featured posts, 1-3 articles                                   │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                         │
│  Links, newsletter, trust signals                               │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Product Listing Page (Category/Collection)

| Section | Purpose | Placement |
|---------|---------|-----------|
| **Page title** | Category name | Top, below header |
| **Breadcrumb** | Orientation | Below header |
| **Filters** | Refine results | Left sidebar (desktop), bottom sheet (mobile) |
| **Sort** | Order results | Top-right of grid |
| **Product grid** | Display products | Main content area |
| **Pagination** | Navigate pages | Below grid |
| **Empty state** | No results | Center of grid area |

#### Product Grid Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile** | 2 columns | Thumb-friendly, visible products |
| **Tablet** | 3 columns | Medium screen optimization |
| **Desktop** | 4 columns | Full experience |
| **Gap** | 16px mobile, 24px desktop | Breathing room |
| **Product card** | Image + name + price + CTA | Essential information |
| **Image aspect** | 3:4 ratio | Fashion standard |
| **Skeleton loading** | Match card shape | Perceived performance |

### 4.7 Product Detail Page

| Section | Purpose | Priority |
|---------|---------|----------|
| **Product images** | Visual showcase | First viewport |
| **Product title** | Identification | Below images |
| **Price** | Purchase decision | Below title |
| **Variant selector** | Size, color | Below price |
| **Add to Cart** | Primary CTA | Below variants |
| **Description** | Product details | Scrollable section |
| **Size guide** | Sizing help | Link or modal |
| **Reviews** | Social proof | Below description |
| **Related products** | Cross-sell | Below reviews |

#### Product Detail Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Home > Category > Product Name                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │                      │  │  Product Title        │             │
│  │   Product Image      │  │  ★★★★☆ (12 reviews)   │             │
│  │   (Swipeable on      │  │  ₹1,999               │             │
│  │    mobile)           │  │                       │             │
│  │                      │  │  Color: ● ● ●        │             │
│  │   [Thumbnail row]    │  │  Size: S M L XL      │             │
│  │                      │  │                       │             │
│  └──────────────────────┘  │  [Add to Cart]        │             │
│                             │  [Add to Wishlist]    │             │
│                             │                       │             │
│                             │  Description...       │             │
│                             │  Size Guide           │             │
│                             └──────────────────────┘             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  REVIEWS SECTION                                                 │
│  ★★★★☆ 4.2 out of 5 (12 reviews)                                │
│  [Review 1] [Review 2] [Review 3]                                │
├─────────────────────────────────────────────────────────────────┤
│  RELATED PRODUCTS                                                │
│  [Product] [Product] [Product] [Product]                         │
└─────────────────────────────────────────────────────────────────┘
```

#### Product Detail Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Images** | Swipeable carousel on mobile | Space efficiency |
| **Thumbnails** | Below main image, scrollable | Image selection |
| **Sticky CTA** | Add to Cart fixed on scroll | Always accessible |
| **Variant selection** | Visual (color swatches, size buttons) | Intuitive |
| **Out of stock** | Grayed out, clear message | Transparency |
| **Breadcrumbs** | Always visible | Orientation |
| **Price** | Prominent, clear | Decision factor |
| **Reviews** | Star rating visible above fold | Social proof |

### 4.8 Cart Page

| Section | Purpose | Priority |
|---------|---------|----------|
| **Cart items** | List of products | Main content |
| **Quantity controls** | Adjust quantities | Inline with items |
| **Remove** | Remove items | Swipe or button |
| **Subtotal** | Item total | Below items |
| **Shipping estimate** | Delivery info | Below subtotal |
| **Promo code** | Discount input | Below shipping |
| **Order total** | Final amount | Below promo |
| **Checkout CTA** | Primary action | Bottom, fixed on mobile |

#### Cart Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Empty state** | "Your cart is empty" + CTA | Guidance |
| **Quantity max** | Limit to stock quantity | Business rule |
| **Quantity min** | 1 (remove instead of 0) | UX |
| **Remove confirm** | Undo toast, not confirmation dialog | Speed |
| **Sticky checkout** | Checkout button always visible | Conversion |
| **Cross-sell** | "You might also like" below cart | Revenue |
| **Price update** | Real-time on quantity change | Transparency |
| **Mobile** | Swipe to remove | Natural gesture |

### 4.9 Checkout Page

| Section | Purpose | Priority |
|---------|---------|----------|
| **Order summary** | What they're buying | Right sidebar (desktop), collapsible (mobile) |
| **Contact info** | Email, phone | First form section |
| **Shipping address** | Delivery address | Second form section |
| **Shipping method** | Delivery options | Third form section |
| **Payment** | Payment method | Fourth form section |
| **Place order** | Final CTA | Bottom, prominent |

#### Checkout Flow Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Steps** | Single page with sections (not multi-page) | Speed |
| **Progress** | Visual progress indicator | Orientation |
| **Guest checkout** | Available without account | Reduce friction |
| **Auto-fill** | Use browser autofill | Speed |
| **Validation** | Inline, on blur | Immediate feedback |
| **Back** | Can go back to edit any section | Recovery |
| **Order summary** | Always visible (collapsible on mobile) | Transparency |
| **Security signals** | SSL badge, secure payment icons | Trust |
| **Place order** | Full-width button on mobile | Thumb-friendly |

### 4.10 Account Pages

| Page | Purpose | Layout |
|------|---------|--------|
| **Profile** | Edit personal info | Single column form |
| **Orders** | Order history | List with status |
| **Order detail** | Single order view | Full details |
| **Addresses** | Manage addresses | List + add/edit |
| **Wishlist** | Saved products | Product grid |
| **Settings** | Account settings | Single column form |

#### Account Navigation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile** | List menu (not sidebar) | Space efficiency |
| **Desktop** | Left sidebar + content | Two-column layout |
| **Active state** | Highlight current section | Orientation |
| **Back** | Back to account main | Hierarchy |
| **Logout** | Bottom of settings | Always accessible |

### 4.11 Admin Dashboard

| Section | Purpose | Layout |
|---------|---------|--------|
| **Dashboard** | Overview metrics | Stats cards + charts |
| **Products** | Product management | Table with actions |
| **Orders** | Order management | Table with filters |
| **Customers** | Customer management | Table with search |
| **Categories** | Category management | Tree/table |
| **Settings** | Platform settings | Forms |

#### Admin Layout Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Sidebar** | Left sidebar, 280px | Always visible |
| **Top bar** | Search, notifications, profile | Quick access |
| **Content** | Right of sidebar, scrollable | Main work area |
| **Mobile sidebar** | Drawer overlay | Space efficiency |
| **Active state** | Highlight sidebar item | Orientation |
| **Collapsible** | Sidebar can collapse to icons | Screen real estate |

---

## 5. User Journey Architecture

### 5.1 What

Complete user flows for every major task, defining entry points, steps, decision points, and exit points.

### 5.2 Why

- **Completeness:** Every user goal has a clear path.
- **Efficiency:** Minimize steps to complete tasks.
- **Recovery:** Every flow has error recovery paths.
- **Conversion:** Optimize for business goals.

### 5.3 Where

Every user-facing workflow.

### 5.4 Shopping Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHOPPING JOURNEY                               │
│                                                                  │
│  1. DISCOVER                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Homepage → Category → Product List → Product Detail      │   │
│  │  OR: Search → Product List → Product Detail               │   │
│  │  OR: Collection → Product List → Product Detail           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  2. EVALUATE                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  View images → Read description → Check size guide        │   │
│  │  → Read reviews → Compare variants → Check price          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  3. DECIDE                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Select variant → Add to cart → Continue shopping         │   │
│  │  OR: Add to wishlist → Later                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  4. PURCHASE                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  View cart → Apply promo → Proceed to checkout            │   │
│  │  → Enter details → Select shipping → Pay → Confirm        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  5. POST-PURCHASE                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Order confirmation → Email → Track order → Receive        │   │
│  │  → Review → Return (if needed)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### Shopping Journey Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Add to cart feedback** | Toast + cart badge update | Immediate confirmation |
| **Cart persistence** | Cart saved across sessions | Don't lose work |
| **Guest checkout** | Available without account | Reduce friction |
| **Promo code** | Apply in cart and checkout | Flexibility |
| **Stock check** | Real-time on variant selection | Prevent disappointment |
| **Price transparency** | All costs visible before payment | Trust |
| **Order confirmation** | Full-page with order number | Clear completion |
| **Email confirmation** | Sent immediately | Reassurance |

### 5.5 Search Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEARCH JOURNEY                                 │
│                                                                  │
│  1. ENTER QUERY                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tap search icon → Type query → See autocomplete          │   │
│  │  → Select suggestion OR press enter                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  2. VIEW RESULTS                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Results grid → Apply filters → Sort results              │   │
│  │  → Refine query                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  3. SELECT PRODUCT                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Tap product → Product detail → Add to cart               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  4. NO RESULTS                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  "No results for X" → Suggest alternatives                │   │
│  │  → Show popular products → Clear search                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### Search Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Debounce** | 300ms before API call | Performance |
| **Autocomplete** | Show suggestions as user types | Speed |
| **Recent searches** | Show last 5 searches | Convenience |
| **Popular searches** | Show trending searches | Discovery |
| **Keyboard** | `/` to focus, Escape to close | Power users |
| **Clear** | X button to clear query | Ease |
| **Result count** | "X results for Y" | Context |
| **Empty state** | Helpful suggestions | Guidance |
| **Filters** | Available on search results | Refinement |

### 5.6 Checkout Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKOUT JOURNEY                               │
│                                                                  │
│  1. CART REVIEW                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Review items → Adjust quantities → Apply promo           │   │
│  │  → See order summary → Proceed to checkout                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  2. CONTACT & SHIPPING                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Enter email → Enter address → Select shipping method     │   │
│  │  → See shipping cost → Continue                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  3. PAYMENT                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Select payment method → Enter details → See total        │   │
│  │  → Place order → Process payment                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  4. CONFIRMATION                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Success page → Order number → What's next                │   │
│  │  → Email sent → Track order                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### Checkout Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Guest checkout** | Available without account | Reduce friction |
| **Auto-fill** | Browser autofill enabled | Speed |
| **Inline validation** | Validate on blur | Immediate feedback |
| **Progress indicator** | Show current step | Orientation |
| **Order summary** | Always visible | Transparency |
| **Back navigation** | Can edit any section | Recovery |
| **Security signals** | SSL, secure payment icons | Trust |
| **Loading state** | Spinner during payment | Feedback |
| **Error recovery** | Clear error messages, retry | Resilience |
| **Confirmation** | Full-page with order number | Completion |

### 5.7 Profile Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROFILE JOURNEY                                │
│                                                                  │
│  1. ACCESS                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Bottom nav → Account → Profile                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  2. VIEW/Edit                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  View info → Edit fields → Save changes                   │   │
│  │  → Change password → Update email                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  3. MANAGE                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Addresses → Add/edit/delete                              │   │
│  │  Orders → View history → Track → Return                   │   │
│  │  Wishlist → View saved → Move to cart                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.8 Admin Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN JOURNEY                                  │
│                                                                  │
│  1. LOGIN                                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Admin login → Verify credentials → Dashboard             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  2. MANAGE                                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Products → Create/Edit/Delete                            │   │
│  │  Orders → View/Update status/Process                      │   │
│  │  Customers → View/Manage                                  │   │
│  │  Content → CMS/Pages/Blog                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  3. ANALYZE                                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Dashboard → Metrics → Reports → Export                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.9 Shop Journey (Shop Owner)

| Section | Purpose | Layout |
|---------|---------|--------|
| **Dashboard** | Shop overview | Stats + recent activity |
| **Products** | Product management | Table + CRUD |
| **Orders** | Order management | Table + status updates |
| **Customers** | Customer insights | Table + analytics |
| **Settings** | Shop configuration | Forms |

---

## 6. Interaction Architecture

### 6.1 What

Standards for how users interact with interface elements — taps, swipes, gestures, and input patterns.

### 6.2 Why

- **Predictability:** Same interaction produces same result everywhere.
- **Efficiency:** Gestures reduce steps.
- **Accessibility:** Keyboard and screen reader support.
- **Delight:** Premium micro-interactions.

### 6.3 Where

Every interactive element.

### 6.4 Tap Standards

| Element | Behavior | Feedback |
|---------|----------|----------|
| **Button** | Executes action | Visual press state (150ms) |
| **Link** | Navigates | Color change |
| **Card** | Navigates to detail | Subtle elevation |
| **Icon button** | Executes action | Visual press state |
| **Tab** | Switches content | Active indicator |
| **Toggle** | Switches state | Smooth animation |
| **Input** | Focuses field | Border color change |
| **Select** | Opens dropdown | Chevron rotation |

#### Tap Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Min target** | 44x44px | Accessibility |
| **Feedback** | Visual state change within 100ms | Responsiveness |
| **No hover dependency** | Works on touch | Mobile-first |
| **Debounce** | Prevent double-tap | Prevent duplicates |
| **Loading** | Show spinner on async actions | Feedback |
| **Disabled** | Gray out, no pointer events | Clarity |

### 6.5 Swipe Standards

| Context | Direction | Action |
|---------|-----------|--------|
| **Product images** | Left/Right | Navigate images |
| **Cart items** | Left | Remove item |
| **Carousel** | Left/Right | Next/previous |
| **Bottom sheet** | Down | Dismiss |
| **Gallery** | Left/Right | Next image |

#### Swipe Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Discoverable** | Visual hint (peek, arrows) | Discoverability |
| **Threshold** | 30% of width to trigger | Prevent accidental |
| **Snap** | Snap to elements | Clean landing |
| **Feedback** | Haptic or visual | Confirmation |
| **Animation** | Smooth spring | Premium feel |

### 6.6 Long Press Standards

| Context | Behavior | Use Case |
|---------|----------|----------|
| **Product image** | Open context menu | Quick actions |
| **Link** | Preview URL | Power users |
| **Text** | Select text | Content pages |

#### Long Press Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Duration** | 500ms | Prevent accidental |
| **Feedback** | Visual scale + haptic | Confirmation |
| **Menu** | Contextual actions | Relevance |
| **Cancel** | Lift finger to cancel | Recovery |
| **Optional** | Not required for any flow | Accessibility |

### 6.7 Drag & Drop Standards

| Context | Behavior | Use Case |
|---------|----------|----------|
| **Admin reorder** | Drag to reorder items | Priority ordering |
| **Image upload** | Drag to upload zone | File upload |
| **Kanban** | Drag between columns | Status changes |

#### Drag & Drop Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Visual hint** | Drag handle visible | Discoverability |
| **Placeholder** | Show drop target | Clarity |
| **Animation** | Smooth during drag | Premium feel |
| **Undo** | Allow undo after drop | Recovery |
| **Mobile** | Use native reorder or long-press + move | Touch-friendly |

### 6.8 Infinite Scroll vs Pagination

| Context | Pattern | Rationale |
|---------|---------|-----------|
| **Product listings** | Load more button | User control |
| **Search results** | Load more button | User control |
| **Admin tables** | Numbered pagination | Data precision |
| **Feed/timeline** | Infinite scroll | Content discovery |

#### Scroll Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Load more** | Button, not auto-load | User control |
| **Skeleton** | Show skeleton while loading | Perceived performance |
| **Back to top** | Floating button on long scroll | Navigation |
| **Position memory** | Return to scroll position on back | Continuity |
| **Max items** | Cap at 100 items per page | Performance |

### 6.9 Filter & Sort Standards

| Element | Mobile | Desktop |
|---------|--------|---------|
| **Filters** | Bottom sheet | Left sidebar |
| **Sort** | Bottom sheet | Dropdown top-right |
| **Active filters** | Horizontal scroll chips | Inline chips |
| **Clear all** | "Clear all" button | "Clear all" link |

#### Filter Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default** | No filters applied | Show all products |
| **Apply** | Auto-apply on selection | Speed |
| **Clear** | Easy to clear each filter | Recovery |
| **Count** | Show result count while filtering | Context |
| **Empty** | "No products match" + clear | Guidance |
| **Mobile** | Bottom sheet, full-width | Touch-friendly |
| **URL sync** | Filters reflected in URL | Shareable, bookmarkable |

### 6.10 Menu Standards

| Type | Trigger | Behavior |
|------|---------|----------|
| **Dropdown** | Click/hover | Positioned below trigger |
| **Context menu** | Right-click/long-press | Positioned at pointer |
| **Bottom sheet** | Tap | Slides up from bottom |
| **Drawer** | Tap hamburger | Slides from side |
| **Mega menu** | Hover (desktop) | Full-width dropdown |

#### Menu Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Close** | Tap outside, Escape | Recovery |
| **Keyboard** | Arrow keys navigate | Accessibility |
| **Active item** | Highlight current | Orientation |
| **Icons** | Optional, contextual | Visual clarity |
| **Dividers** | Separate groups | Organization |
| **Max height** | 80vh, scrollable | Don't overflow viewport |

### 6.11 Dialog & Sheet Standards

| Type | Size | Usage | Close |
|------|------|-------|-------|
| **Small dialog** | 400px | Confirmations | X, ESC, outside |
| **Medium dialog** | 560px | Forms, details | X, ESC, outside |
| **Large dialog** | 720px | Complex content | X, ESC, outside |
| **Full dialog** | 100% | Mobile modals | X, swipe down |
| **Bottom sheet** | 80% height | Mobile menus/options | Swipe down, handle |
| **Slide-over** | 400px right | Quick edit/view | X, outside |

#### Dialog Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One at a time** | No stacked modals | Prevent confusion |
| **Focus trap** | Keyboard stays inside | Accessibility |
| **Return focus** | Focus trigger on close | Accessibility |
| **Backdrop** | Semi-transparent black | Visual separation |
| **Animation** | Scale up + fade in | Premium feel |
| **Max height** | 90vh | Prevent overflow |
| **Scroll** | Content scrolls, not dialog | Usability |

### 6.12 Notification & Toast Standards

| Type | Color | Duration | Position |
|------|-------|----------|----------|
| **Success** | Green | 4 seconds | Top-right (desktop), top (mobile) |
| **Error** | Red | 5 seconds | Top-right (desktop), top (mobile) |
| **Warning** | Amber | 4 seconds | Top-right (desktop), top (mobile) |
| **Info** | Blue | 4 seconds | Top-right (desktop), top (mobile) |

#### Toast Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max visible** | 3 toasts | Don't overwhelm |
| **Dismissible** | Close button | User control |
| **Stacked** | Newest on top | Chronological |
| **Animation** | Slide in from right | Smooth |
| **Action** | Optional action button | Recovery |
| **Auto-dismiss** | 4-5 seconds | Non-blocking |
| **No hover dismiss** | Only close button | Prevent accidental |

---

## 7. Search & Discovery Architecture

### 7.1 What

The complete search experience including input, autocomplete, results, filters, and empty states.

### 7.2 Why

- **Findability:** Users find products fast.
- **Efficiency:** Quick search with autocomplete.
- **Conversion:** Search drives purchase intent.
- **Discovery:** Users find products they didn't know existed.

### 7.3 Where

Search icon, search page, admin search.

### 7.4 Search Interface Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEARCH ARCHITECTURE                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SEARCH INPUT                                             │   │
│  │  • Prominent placement (header)                           │   │
│  │  • Auto-focus on activation                               │   │
│  │  • Clear button (X)                                       │   │
│  │  • Placeholder: "Search products..."                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AUTOCOMPLETE DROPDOWN                                    │   │
│  │  • Recent searches (top)                                  │   │
│  │  • Popular searches (if no query)                         │   │
│  │  • Product suggestions (as user types)                    │   │
│  │  • Category suggestions                                   │   │
│  │  • "See all results" at bottom                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SEARCH RESULTS PAGE                                      │   │
│  │  • Result count ("X results for Y")                       │   │
│  │  • Active filter chips                                    │   │
│  │  • Sort dropdown                                          │   │
│  │  • Filter button → Bottom sheet (mobile) / Sidebar (desk) │   │
│  │  • Product grid                                           │   │
│  │  • Load more / pagination                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EMPTY STATE                                              │   │
│  │  • "No results for X"                                     │   │
│  │  • Spelling suggestions                                   │   │
│  │  • Popular products                                       │   │
│  │  • Clear search button                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Search Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Header, always visible | Discoverability |
| **Auto-focus** | Focus on activation | Speed |
| **Debounce** | 300ms before API call | Performance |
| **Min query** | 2 characters | Prevent noise |
| **Autocomplete** | Show after 2 characters | Relevance |
| **Recent searches** | Store last 5 | Convenience |
| **Popular searches** | Show trending | Discovery |
| **Keyboard** | `/` to focus, arrows to navigate, Enter to select, ESC to close | Power users |
| **Clear** | X button to clear | Ease |
| **Result count** | Always show | Context |
| **No results** | Helpful suggestions | Guidance |
| **Analytics** | Track searches | Business intelligence |

### 7.6 Discovery Features

| Feature | Purpose | Placement |
|---------|---------|-----------|
| **Collections** | Curated groupings | Shop navigation |
| **New Arrivals** | Latest products | Homepage, Shop |
| **Best Sellers** | Popular products | Homepage, Shop |
| **Sale** | Discounted products | Homepage, Shop |
| **Related Products** | Cross-sell | Product detail |
| **Recently Viewed** | Browsing history | Homepage (logged in) |

---

## 8. Dashboard Architecture

### 8.1 What

Standards for organizing information on dashboard pages — admin dashboard, shop dashboard, and account dashboard.

### 8.2 Why

- **At a glance:** Users understand status immediately.
- **Actionable:** Clear next steps are visible.
- **Scalable:** New metrics fit existing layout.
- **Organized:** Information is logically grouped.

### 8.3 Where

Admin dashboard, shop dashboard, account overview.

### 8.4 Admin Dashboard Organization

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  STATS ROW                                                │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │   │
│  │  │Revenue │ │Orders  │ │Customers│ │Products│            │   │
│  │  │₹12,345 │ │156     │ │89      │ │234     │            │   │
│  │  │↑ 12%   │ │↑ 8%    │ │↑ 15%   │ │↑ 3%    │            │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CHARTS ROW                                               │   │
│  │  ┌─────────────────────┐ ┌─────────────────────┐         │   │
│  │  │  Revenue Chart       │ │  Orders Chart        │         │   │
│  │  │  (Line/Bar)          │ │  (Line/Bar)          │         │   │
│  │  └─────────────────────┘ └─────────────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RECENT ACTIVITY                                          │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  Recent Orders (table, 5 rows)                    │    │   │
│  │  │  Order # | Customer | Amount | Status | Action    │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  Low Stock Products (table, 5 rows)               │    │   │
│  │  │  Product | Stock | Category | Action               │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 Dashboard Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Stats cards** | 4 across, responsive | Key metrics at a glance |
| **Trend indicators** | Up/down arrows with % | Performance context |
| **Charts** | 2 across on desktop, stacked on mobile | Visual analytics |
| **Tables** | 5 rows default, "View all" link | Summary + detail |
| **Loading** | Skeleton for all sections | Perceived performance |
| **Empty** | "No data yet" with guidance | First-time users |
| **Refresh** | Auto-refresh every 5 minutes | Fresh data |
| **Actions** | Quick actions in each section | Efficiency |

### 8.6 Account Dashboard Organization

| Section | Content | Priority |
|---------|---------|----------|
| **Welcome** | Greeting + recent order | First |
| **Quick actions** | Track order, Continue shopping | Second |
| **Recent orders** | Last 3 orders with status | Third |
| **Wishlist** | Saved products | Fourth |
| **Profile shortcut** | Edit profile link | Fifth |

---

## 9. Error Recovery Architecture

### 9.1 What

Standards for handling errors, guiding recovery, and maintaining user confidence.

### 9.2 Why

- **Trust:** Errors don't break user confidence.
- **Recovery:** Users can always recover.
- **Clarity:** Users understand what went wrong.
- **Prevention:** Errors are prevented when possible.

### 9.3 Where

Every interaction that can fail.

### 9.4 Error Types & Responses

| Error Type | Response | Recovery |
|------------|----------|----------|
| **Network error** | Toast + retry | Automatic retry, manual retry button |
| **Validation error** | Inline field errors | Fix and resubmit |
| **Authentication error** | Redirect to login | Login and return |
| **Authorization error** | Toast + redirect | Request access or go back |
| **Not found** | Full-page 404 | Search, go home, breadcrumbs |
| **Server error** | Full-page 500 | Retry, contact support |
| **Rate limit** | Toast + wait | Wait and retry |
| **Payment error** | Inline error + retry | Retry payment |
| **Out of stock** | Inline message + alternatives | Choose different variant |
| **Cart error** | Toast + cart refresh | Refresh and continue |

### 9.5 Error Recovery Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never blame user** | "Something went wrong" not "You made an error" | Friendly |
| **Be specific** | "Email already registered" not "Error occurred" | Actionable |
| **Offer recovery** | "Try again" / "Go back" / "Contact support" | Empowering |
| **Preserve state** | Don't lose form data on error | Don't waste effort |
| **Auto-retry** | Retry network errors automatically | Resilience |
| **Undo over confirm** | Allow undo instead of confirmation dialogs | Speed |
| **Visual distinction** | Errors clearly marked in red | Clear feedback |
| **Accessible** | Error messages associated with fields | Screen readers |

### 9.6 Error Page Standards

| Page | Content | Actions |
|------|---------|---------|
| **404** | "Page not found" + illustration | Go home, Search, Go back |
| **500** | "Something went wrong" + illustration | Retry, Go home, Contact support |
| **403** | "Access denied" + message | Go home, Contact support |
| **Offline** | "You're offline" + illustration | Retry when online |

---

## 10. Empty State Architecture

### 10.1 What

Standards for displaying meaningful content when no data is available.

### 10.2 Why

- **Guidance:** Users know what to do next.
- **Delight:** Empty doesn't mean boring.
- **Conversion:** Empty states drive action.
- **Orientation:** Users understand why the state is empty.

### 10.3 Where

Empty lists, no results, first-time use.

### 10.4 Empty State Types

| Type | Context | Content | CTA |
|------|---------|---------|-----|
| **No items** | Empty cart, wishlist | Illustration + message | "Start shopping" |
| **No results** | Search, filter | Message + suggestions | "Clear filters" / "Browse all" |
| **First time** | New account, first login | Welcome + getting started | "Complete profile" / "Browse shop" |
| **Error** | Failed to load | Error message | "Retry" |
| **Coming soon** | Feature not available | Teaser + message | "Notify me" |

### 10.5 Empty State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never blank** | Always show something | Guidance |
| **Helpful message** | Explain why empty | Clarity |
| **Clear CTA** | Obvious next step | Direction |
| **Illustration** | Simple, on-brand | Delight |
| **Compact** | Not too tall | Respectful |
| **Contextual** | Specific to the empty state | Relevant |

### 10.6 Empty State Examples

| Context | Message | CTA |
|---------|---------|-----|
| **Empty cart** | "Your cart is empty" | "Start shopping" |
| **Empty wishlist** | "Your wishlist is empty" | "Discover products" |
| **No search results** | "No results for X" | "Clear search" / "Browse all" |
| **No orders** | "You haven't placed any orders yet" | "Start shopping" |
| **No addresses** | "No saved addresses" | "Add address" |
| **Empty admin** | "No products yet" | "Add your first product" |

---

## 11. First-time User Experience

### 11.1 What

Standards for onboarding new users, reducing friction, and driving first conversion.

### 11.2 Why

- **Retention:** First experience determines return visits.
- **Conversion:** Guide users to first purchase.
- **Confidence:** Users feel comfortable using the platform.
- **Discovery:** Users find products they want.

### 11.3 Where

Registration, first visit, first login.

### 11.4 Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDING FLOW                                │
│                                                                  │
│  1. FIRST VISIT                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Homepage → Browse products → Add to cart → Prompt login   │   │
│  │  → Register → Continue shopping → Checkout                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  2. REGISTRATION                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Simple form (email, name, password) → Email verify       │   │
│  │  → Welcome page → Personalize (optional)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  3. FIRST LOGIN                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Welcome back message → Recent views (if any)             │   │
│  │  → Recommended products → Complete profile (optional)     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  4. FIRST PURCHASE                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Celebration → Order confirmation → What's next           │   │
│  │  → Track order → Rate products → Refer friend             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 11.5 Onboarding Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No forced onboarding** | Let users explore freely | Don't block |
| **Progressive** | Ask for info as needed | Don't overwhelm |
| **Optional** | Personalization is optional | Respect time |
| **Welcome** | Greet on first login | Delight |
| **Guide** | Subtle hints for key features | Discoverability |
| **Celebrate** | Mark first purchase | Reinforce behavior |
| **Remind** | Gentle reminders for incomplete profile | Don't nag |
| **Skip** | Always skippable | User control |

---

## 12. Accessibility Architecture

### 12.1 What

WCAG 2.2 AA compliance standards for every component, page, and interaction.

### 12.2 Why

- **Legal compliance:** Meet accessibility laws.
- **Inclusivity:** Everyone can use the platform.
- **SEO:** Search engines favor accessible sites.
- **Quality:** Accessible code is better code.

### 12.3 Where

Every user-facing component and page.

### 12.4 WCAG 2.2 AA Standards

| Criterion | Standard | Implementation |
|-----------|----------|----------------|
| **Color contrast** | 4.5:1 normal, 3:1 large text | Use design tokens |
| **Focus indicators** | Visible on all interactive elements | `focus-visible` ring |
| **Skip link** | "Skip to main content" | First element in DOM |
| **ARIA labels** | On all icons and interactive elements | `aria-label` |
| **Keyboard navigation** | All features accessible via keyboard | Tab, Enter, Escape |
| **Reduced motion** | Honor `prefers-reduced-motion` | CSS media query |
| **Alt text** | On all meaningful images | `alt` attribute |
| **Form labels** | On all inputs | `<label>` element |
| **Error messages** | Clear, descriptive, associated with inputs | `aria-describedby` |
| **Heading hierarchy** | Proper H1-H6 order | One H1 per page |
| **Landmark regions** | `<main>`, `<nav>`, `<header>`, `<footer>` | Semantic HTML |
| **Live regions** | For dynamic content updates | `aria-live` |

### 12.5 Keyboard Navigation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical, follows visual flow | Intuitive |
| **Focus visible** | Clear focus ring | Orientation |
| **No keyboard trap** | Always able to escape | Recovery |
| **Shortcuts** | `/` for search, `ESC` for close | Efficiency |
| **Arrow keys** | Navigate within components | Familiar |
| **Enter/Space** | Activate buttons and links | Standard |
| **Escape** | Close modals, menus, dropdowns | Recovery |

### 12.6 Screen Reader Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic HTML** | Use `<nav>`, `<main>`, `<button>` | Meaning |
| **ARIA landmarks** | Label regions | Navigation |
| **Alt text** | Descriptive for meaningful images | Understanding |
| **Hidden decorative** | `aria-hidden="true"` for icons | Reduce noise |
| **Live regions** | Announce dynamic content | Updates |
| **Form labels** | Associated with inputs | Understanding |
| **Error association** | Errors linked to fields | Understanding |
| **Skip link** | Skip navigation | Efficiency |

### 12.7 Touch Accessibility

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Min target** | 44x44px | Ease of use |
| **Spacing** | 8px between targets | Prevent miss-taps |
| **No hover only** | Works without hover | Touch devices |
| **Gesture alternatives** | Button alternatives for gestures | Accessibility |

### 12.8 Motion Accessibility

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Reduced motion** | Honor `prefers-reduced-motion` | Vestibular disorders |
| **No auto-play** | User controls playback | Control |
| **No flashing** | No content flashes more than 3 times/second | Seizure prevention |
| **Subtle animations** | Under 300ms, non-distracting | Comfort |

---

## 13. Performance UX Architecture

### 13.1 What

Standards for perceived and actual performance that directly impact user experience.

### 13.2 Why

- **Retention:** Fast experiences keep users.
- **Conversion:** Slow pages lose sales.
- **Perception:** Perceived performance matters more than actual.
- **Trust:** Fast = professional.

### 13.3 Where

Every page load, every interaction, every transition.

### 13.4 Performance Standards

| Metric | Target | Rationale |
|--------|--------|-----------|
| **First Contentful Paint** | < 1.5s | Users see content |
| **Largest Contentful Paint** | < 2.5s | Main content visible |
| **Cumulative Layout Shift** | < 0.1 | No layout shifts |
| **First Input Delay** | < 100ms | Interactive quickly |
| **Time to Interactive** | < 3.5s | Fully interactive |
| **Total Blocking Time** | < 200ms | No jank |

### 13.5 Perceived Performance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Skeleton loading** | Show content shape while loading | Perceived speed |
| **Optimistic updates** | Show result before server confirms | Perceived speed |
| **Instant feedback** | Visual response within 100ms | Responsiveness |
| **Progress indicators** | For operations > 1 second | Orientation |
| **Lazy loading** | Load images on demand | Faster initial load |
| **Code splitting** | Route-level splitting | Faster initial load |
| **Preload** | Preload critical resources | Faster navigation |
| **Cache** | Aggressive caching | Instant repeat visits |

### 13.6 Loading Pattern Rules

| Pattern | Usage | Timing |
|---------|-------|--------|
| **Spinner** | Inline, button loading | Any duration |
| **Skeleton** | Content loading | > 300ms |
| **Progress bar** | Known duration | File upload, multi-step |
| **Button loading** | Form submission | Async action |
| **Page skeleton** | Full page load | > 500ms |

### 13.7 Smooth Transitions

| Transition | Duration | Easing |
|------------|----------|--------|
| **Hover states** | 150ms | ease-luxe-out |
| **Card hover** | 300ms | ease-luxe-out |
| **Modal open** | 300ms | ease-spring |
| **Page transition** | 500ms | ease-luxe-out |
| **Loading skeleton** | 800ms | linear |
| **Button click** | 150ms | ease-luxe-in |

---

## 14. Consistency Standards

### 14.1 What

Rules that ensure identical behavior across the entire platform.

### 14.2 Why

- **Predictability:** Same action, same result everywhere.
- **Efficiency:** Users learn once, apply everywhere.
- **Quality:** Consistent = professional.
- **Maintainability:** Changes apply uniformly.

### 14.3 Where

Every interaction, every page, every component.

### 14.4 Navigation Consistency

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Back button** | Top-left, arrow icon, goes to previous page | Predictable |
| **Home** | Logo always links to home | Anchor |
| **Search** | Header, always visible | Discoverable |
| **Cart** | Header with badge | Accessible |
| **Account** | Header/nav, dropdown on desktop | Consistent |
| **Active state** | Brand color + filled icon | Clear orientation |

### 14.5 Button Placement Consistency

| Context | Primary CTA | Secondary CTA |
|---------|-------------|---------------|
| **Modal** | Bottom-right | Bottom-left |
| **Form** | Bottom, full-width on mobile | Cancel, top-right |
| **Card** | Bottom of card | Inline |
| **Page** | Top-right or bottom-fixed | Top-left |
| **Dialog** | Right | Left |

### 14.6 Search Placement Consistency

| Device | Placement | Behavior |
|--------|-----------|----------|
| **Mobile** | Header, icon | Expands to input |
| **Desktop** | Header, expandable | Expands inline |
| **Admin** | Top bar | Expandable |

### 14.7 Filter Placement Consistency

| Device | Placement | Behavior |
|--------|-----------|----------|
| **Mobile** | Bottom sheet | Tap filter icon |
| **Desktop** | Left sidebar | Always visible |
| **Admin** | Top bar or sidebar | Context-dependent |

### 14.8 Form Behavior Consistency

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Labels** | Always visible, not floating | Accessibility |
| **Validation** | On blur, inline | Immediate feedback |
| **Errors** | Below field, red text | Clear association |
| **Submit** | Button disabled while submitting | Prevent duplicates |
| **Success** | Toast + redirect or update | Confirmation |
| **Auto-save** | Draft saved automatically | Don't lose work |

### 14.9 Confirmation Behavior Consistency

| Action | Confirmation Type | Rationale |
|--------|-------------------|-----------|
| **Delete** | Confirmation dialog | Destructive action |
| **Remove from cart** | Undo toast | Non-destructive, recoverable |
| **Logout** | Confirmation dialog | Session end |
| **Place order** | Confirmation page | Major action |
| **Cancel order** | Confirmation dialog | Destructive action |
| **Save changes** | No confirmation (auto-save) | Non-destructive |

### 14.10 Notification Behavior Consistency

| Trigger | Type | Duration |
|---------|------|----------|
| **Success action** | Success toast | 4 seconds |
| **Error action** | Error toast | 5 seconds |
| **Warning** | Warning toast | 4 seconds |
| **Information** | Info toast | 4 seconds |
| **Destructive action** | Confirmation dialog | Until user acts |
| **Critical error** | Full-page error | Until resolved |

---

## 15. Mandatory Rules for AI Agents

### 15.1 What

Hard rules that every AI agent must follow when designing, implementing, or reviewing UX.

### 15.2 Why

- **Consistency:** No exceptions to the rules.
- **Quality:** Every interaction meets the standard.
- **Maintainability:** Predictable patterns.

### 15.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Mobile-first** | Design for mobile first, enhance for desktop | 70%+ traffic |
| **One primary action per screen** | Clear CTAs, no competing actions | Focus |
| **3 taps to any goal** | Deep but discoverable navigation | Efficiency |
| **Visible state changes** | Users always know what happened | Feedback |
| **Undo over confirmation** | Allow recovery, not just prevention | Flexibility |
| **Save automatically** | Don't lose user work | Trust |
| **Progress indicators** | Show where user is in a flow | Orientation |
| **Empty states guide** | Never show blank screens | Helpfulness |
| **One-handed mobile usage** | Bottom nav, thumb-friendly | Ergonomics |
| **Clear navigation** | Users always know where they are | Orientation |
| **Beginner-first interactions** | First-time user succeeds immediately | Onboarding |
| **Progressive disclosure** | Show only what's needed, when needed | Focus |
| **Error prevention** | Prevent mistakes before they happen | Trust |
| **Easy recovery** | Mistakes are easy to fix | Flexibility |
| **Clear feedback** | Every action has visible response | Trust |
| **Accessibility by default** | WCAG 2.2 AA compliance | Inclusivity |
| **No hover dependency** | Works without hover | Mobile-first |
| **No color-only indicators** | Use icons + text | Accessibility |
| **No visual clutter** | Minimal interface | Premium feel |
| **No gratuitous animation** | Purposeful motion only | Performance |

### 15.4 Soft Rules

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **White space** | Generous spacing | Always |
| **Visual rhythm** | Consistent spacing | Always |
| **Progressive disclosure** | Show only what's needed | Complex interfaces |
| **Dark mode readiness** | Use CSS variables | All new components |
| **i18n readiness** | Text in variables | All new features |
| **Analytics tracking** | Track key events | All new features |

### 15.5 Agent Decision Framework

When implementing any UI, agent must ask:

1. **Is this mobile-first?** — Would this work on a 375px screen?
2. **Is this accessible?** — Can a keyboard-only user complete this?
3. **Is this clear?** — Would a first-time user understand this?
4. **Is this consistent?** — Does this match existing patterns?
5. **Is this minimal?** — Can any element be removed?
6. **Is this feedback-rich?** — Does the user know what happened?
7. **Is this recoverable?** — Can the user undo or go back?
8. **Is this performant?** — Will this feel fast?

---

**Document Version:** 1.0
**Last Updated:** August 03, 2026
**Next Review:** September 03, 2026
