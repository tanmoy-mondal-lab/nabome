# নবME (Nabome) — Global Navigation, Header & Footer Architecture Standard

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for navigation architecture, header system, footer system, search integration, account navigation, and menu behavior
> **Supersedes:** None — complements DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), RESPONSIVE_LAYOUT_ARCHITECTURE.md (v1.0), COMPONENT_LIBRARY_ARCHITECTURE.md (v1.0), UX_ARCHITECTURE.md (v1.0), ARCHITECTURE.md (v3.0)

---

## Table of Contents

1. [Navigation Philosophy](#1-navigation-philosophy)
2. [Header Architecture](#2-header-architecture)
3. [Navigation System](#3-navigation-system)
4. [Search Architecture](#4-search-architecture)
5. [Profile & Account Navigation](#5-profile--account-navigation)
6. [Footer Architecture](#6-footer-architecture)
7. [Responsive Behavior](#7-responsive-behavior)
8. [Accessibility](#8-accessibility)
9. [Performance](#9-performance)
10. [CMS Integration](#10-cms-integration)
11. [UX Requirements](#11-ux-requirements)
12. [Component Location Reference](#12-component-location-reference)
13. [Mandatory Rules for AI Agents](#13-mandatory-rules-for-ai-agents)

---

## 1. Navigation Philosophy

### 1.1 What

The foundational principles that govern every navigation decision across the Nabome platform — how users move between pages, find content, orient themselves, and accomplish goals.

### 1.2 Why

- **Orientation:** Users always know where they are, where they can go, and how to get back.
- **Efficiency:** Users reach any goal in minimal taps.
- **Trust:** Predictable navigation builds confidence.
- **Premium feel:** Navigation should disappear into the experience, never competing with content.
- **Inclusivity:** Every user, regardless of ability or device, can navigate effortlessly.

### 1.3 Where

Every page, every screen, every interaction point.

### 1.4 Core Navigation Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Invisible when done right** | Navigation should feel natural, not mechanical | Minimal chrome, generous spacing, intuitive placement |
| **Mobile-first** | Design for the smallest screen, enhance upward | Bottom nav on mobile, top nav on desktop |
| **One-handed** | All primary actions reachable by thumb on mobile | Bottom navigation, thumb-zone CTAs |
| **Persistent** | Primary navigation is always visible | Fixed header, fixed bottom nav |
| **Minimal** | Show only what's needed, when needed | Progressive disclosure, hidden secondary nav |
| **Predictable** | Same navigation behavior everywhere | Consistent placement, consistent order |
| **Recoverable** | Users can always go back or undo | Back button, breadcrumbs, undo toasts |
| **Accessible** | Every user can navigate via keyboard, screen reader, or touch | ARIA landmarks, focus management, skip links |

### 1.5 Navigation DNA

```
┌─────────────────────────────────────────────────────────────────┐
│                    NABOME NAVIGATION DNA                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    APPLE                                   │   │
│  │  • Navigation that disappears into content                │   │
│  │  • Smooth, purposeful transitions                         │   │
│  │  • Consistent placement across all apps                   │   │
│  │  • Minimal chrome, maximum content                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          +                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ZARA                                    │   │
│  │  • Category-driven navigation                             │   │
│  │  • Fast, frictionless transitions                         │   │
│  │  • Bold visual navigation with imagery                   │   │
│  │  • Horizontal scroll for discovery                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          =                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    NABOME                                  │   │
│  │  • Bottom nav on mobile (thumb-first)                     │   │
│  │  • Mega menu on desktop (efficient browsing)              │   │
│  │  • Search always one tap away                             │   │
│  │  • Cart always visible with count                         │   │
│  │  • Account always accessible                              │   │
│  │  • Premium, calm, minimal, intelligent                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Too many navigation items (>7) | Decision paralysis | Max 5-7 primary items |
| Hidden primary navigation | Users can't find it | Always visible primary nav |
| Inconsistent back behavior | Confusion, broken expectations | Consistent back behavior across all pages |
| No orientation cues | Users get lost | Breadcrumbs, active states, page titles |
| Navigation that disappears on scroll | Lost on long pages | Sticky/fixed navigation |
| Desktop-first navigation | 70%+ mobile traffic suffers | Mobile-first, bottom nav |
| Cluttered header | Visual noise, not premium | Minimal, essential items only |
| Hamburger on mobile for primary nav | Hides what's important | Bottom navigation for primary |
| No search prominence | Discovery suffers | Search always one tap away |
| Over-nesting menus | Cognitive overload | Max 3 levels, progressive disclosure |

---

## 2. Header Architecture

### 2.1 What

The persistent top bar that serves as the primary orientation and action hub across every page — containing brand identity, navigation, search, and utility actions.

### 2.2 Why

- **Orientation:** Logo anchors users to the brand.
- **Navigation:** Primary links are always accessible.
- **Actions:** Search, cart, and account are always one tap away.
- **Consistency:** Same header across all storefront pages.

### 2.3 Where

Every storefront page. Admin pages use a separate top bar within the dashboard layout.

### 2.4 Header Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Lightweight** | Header must load fast, render fast | First thing users see |
| **Minimal** | Only essential elements visible | Premium, calm aesthetic |
| **Persistent** | Always accessible on scroll | Navigation always available |
| **Adaptive** | Changes contextually (transparent on hero, solid on scroll) | Visual polish |
| **Accessible** | Keyboard navigable, screen reader friendly | Inclusivity |

### 2.5 Header Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEADER HIERARCHY                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 1: BRAND                                          │   │
│  │  Logo — always visible, always links to home              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 2: PRIMARY NAVIGATION                             │   │
│  │  Desktop: Shop, Collections, New Arrivals, Sale           │   │
│  │  Mobile: Bottom nav tabs                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 3: UTILITY ACTIONS                                │   │
│  │  Search, Wishlist, Cart, Account                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 4: SECONDARY ACTIONS                              │   │
│  │  Hamburger menu (mobile), Dashboard switch, Quick actions │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.6 Sticky Behavior

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default** | Sticky on scroll | Navigation always accessible |
| **Transparent → Solid** | Transparent on hero, solid after scroll | Premium visual effect |
| **Shrink on scroll** | Reduce height on scroll (80px → 64px) | More content visible |
| **Backdrop blur** | `backdrop-blur-md` on scroll | Premium glass effect |
| **Border on scroll** | Subtle border appears on scroll | Visual separation from content |
| **Hide on scroll down** | Optional: hide on scroll down, show on scroll up | More content visible (power users) |
| **Z-index** | `z-sticky` (100) | Above page content, below modals |

### 2.7 Responsive Header Layout

#### Mobile (< 640px)

```
┌──────────────────────────────────────────────┐
│ ☰  [Logo]              🔍  ♡  🛒(3)  👤    │
│ Hamburger  Brand        Search Wishlist Cart  │
│            (links home)        (badge) Account│
└──────────────────────────────────────────────┘
Height: 56px
```

| Element | Position | Behavior |
|---------|----------|----------|
| **Hamburger** | Left | Opens mobile drawer menu |
| **Logo** | Center-left | Links to home |
| **Search** | Right | Opens search overlay |
| **Wishlist** | Right | Links to wishlist (badge if items) |
| **Cart** | Right | Links to cart with item count badge |
| **Account** | Right | Opens account dropdown or links to login |

#### Tablet (640px - 1023px)

```
┌──────────────────────────────────────────────────────────┐
│ [Logo]     Shop  Collections  New  Sale    🔍  🛒(3) 👤│
│ Brand      Center navigation               Search Cart  │
│ (links home)                                        Acct │
└──────────────────────────────────────────────────────────┘
Height: 64px
```

#### Desktop (1024px+)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]        Shop ▾  Collections  New Arrivals  Sale  🔍  🛒(3) 👤│
│ Brand         Center navigation with mega menu      Search Cart Acct│
│ (links home)                                                      │
└──────────────────────────────────────────────────────────────────┘
Height: 80px
Max-width: 1280px, centered
```

### 2.8 Scroll Behavior

| Phase | Header State | Visual |
|-------|-------------|--------|
| **Top of page** | Transparent (if hero present) or solid white | Full height, no border |
| **Scrolled** | Solid white, backdrop blur | Shrunk height, border-bottom |
| **Scrolling down** | Optional: hide | More content visible |
| **Scrolling up** | Reappear | Navigation accessible |

### 2.9 Collapse Behavior

| Scenario | Behavior | Rationale |
|----------|----------|-----------|
| **Mobile** | Logo + essential actions only | Space efficiency |
| **Tablet** | Logo + nav + essential actions | Balanced |
| **Desktop** | Full header with all elements | Full experience |
| **Checkout** | Minimal: logo + secure badge | Focus on checkout |
| **Admin** | Separate admin top bar | Different context |
| **Auth pages** | Minimal: logo only | Focus on form |

### 2.10 Brand Identity

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Logo placement** | Left-aligned on all devices | Consistent anchor point |
| **Logo links to home** | Always | Primary navigation anchor |
| **Logo alt text** | "Nabome — Go to homepage" | Accessibility |
| **Logo size** | 32px height mobile, 40px desktop | Consistent |
| **Logo animation** | Subtle entrance animation on page load | Premium feel |
| **No text logo variant** | Symbol-only on mobile, full logo on desktop | Space efficiency |

### 2.11 Navigation Balance

| Section | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Left** | Hamburger, Logo | Logo | Logo |
| **Center** | — | Nav links | Nav links |
| **Right** | Search, Wishlist, Cart, Account | Search, Cart, Account | Search, Cart, Account |

### 2.12 CTA Placement

| CTA | Position | Visibility |
|-----|----------|------------|
| **Primary CTA** | Header right (e.g., "Shop Now" on homepage) | Only on landing/hero pages |
| **Cart** | Always visible | Persistent utility |
| **Search** | Always visible | Persistent utility |
| **Account** | Always visible | Persistent utility |
| **Promotional banner** | Above header or inline | Optional, dismissible |

### 2.13 Header Element Standards

#### Animated Logo

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Entrance** | Subtle fade-in + scale on page load | Premium feel |
| **Duration** | 300ms ease-luxe-out | Smooth, not distracting |
| **Hover** | No hover animation (logo is a link) | Clean |
| **Fallback** | Static logo if animation disabled | Accessibility |

#### Search Icon

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Right side of header | Consistent |
| **Icon size** | 20px (h-5 w-5) | Touch-friendly |
| **Touch target** | 44x44px minimum | Accessibility |
| **Behavior (mobile)** | Opens full-screen search overlay | Focus on search |
| **Behavior (desktop)** | Expands inline search bar | Space-efficient |
| **Keyboard shortcut** | `/` to focus search | Power users |
| **ARIA label** | "Search products" | Screen readers |

#### Wishlist Icon

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Right side, next to cart | Consistent |
| **Icon** | Heart (outline when empty, filled when items) | Visual state |
| **Badge** | Show count if > 0 | Information |
| **Behavior** | Links to `/account/wishlist` | Direct navigation |
| **ARIA label** | "Wishlist, X items" | Screen readers |

#### Cart Icon

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Right side, next to account | Consistent |
| **Icon** | ShoppingCart from Lucide | Consistent icon library |
| **Badge** | Show item count (always, even if 0) | Information |
| **Badge color** | brand-500 background, white text | Brand consistency |
| **Behavior** | Links to `/cart` | Direct navigation |
| **ARIA label** | "Shopping cart, X items" | Screen readers |
| **Empty state** | "0" badge, link still works | Consistent |

#### Notifications Icon

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Account dropdown (not header) | Reduces header clutter |
| **Icon** | Bell from Lucide | Familiar pattern |
| **Badge** | Unread notification count | Information |
| **Behavior** | Opens notification panel/dropdown | Quick view |
| **ARIA label** | "Notifications, X unread" | Screen readers |

#### Profile / Account Icon

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Rightmost in header actions | Consistent |
| **Icon** | User from Lucide (logged in: avatar thumbnail) | Personal |
| **Avatar** | 32px circle, user photo or initials | Personal touch |
| **Behavior (logged out)** | Links to `/login` | Clear path |
| **Behavior (logged in)** | Opens account dropdown menu | Quick access |
| **ARIA label** | "Account menu" or "Log in" | Screen readers |

#### Dashboard Switch

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Visibility** | Only for users with admin/shop owner roles | Role-based |
| **Placement** | Inside account dropdown menu | Not cluttering header |
| **Icon** | LayoutDashboard from Lucide | Recognizable |
| **Label** | "Dashboard" or "Admin Panel" | Clear |
| **Behavior** | Links to `/admin` or shop dashboard | Direct navigation |
| **ARIA label** | "Switch to admin dashboard" | Screen readers |

#### Quick Actions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Usage** | Admin dashboard only | Different context |
| **Placement** | Admin top bar, right side | Quick access |
| **Actions** | Create product, View orders, etc. | Efficiency |
| **Pattern** | Dropdown with icon + label | Compact |

#### Account Menu (Dropdown)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Click/tap on account icon | Familiar pattern |
| **Position** | Below account icon, right-aligned | Consistent |
| **Max height** | 80vh, scrollable | Don't overflow viewport |
| **Animation** | Fade in + slide down, 150ms | Smooth |
| **Close** | Click outside, Escape, navigate away | Multiple paths |
| **Keyboard** | Arrow keys to navigate, Enter to select | Accessibility |

**Logged-in Account Menu Items:**

| Order | Item | Icon | Path |
|-------|------|------|------|
| 1 | My Profile | User | `/account/profile` |
| 2 | My Orders | Package | `/account/orders` |
| 3 | My Wishlist | Heart | `/account/wishlist` |
| 4 | My Addresses | MapPin | `/account/addresses` |
| 5 | Settings | Settings | `/account/settings` |
| 6 | — divider — | — | — |
| 7 | Dashboard (if admin) | LayoutDashboard | `/admin` |
| 8 | — divider — | — | — |
| 9 | Log Out | LogOut | (triggers logout) |

**Logged-out Account Menu Items:**

| Order | Item | Path |
|-------|------|------|
| 1 | Log In | `/login` |
| 2 | Create Account | `/register` |

---

## 3. Navigation System

### 3.1 What

The complete navigation system that enables users to move between pages, sections, and features across the platform — including primary, secondary, mobile, desktop, and contextual navigation patterns.

### 3.2 Why

- **Findability:** Users find what they need without searching aimlessly.
- **Orientation:** Users always know where they are.
- **Efficiency:** Users reach their goal with minimal effort.
- **Discoverability:** Users find features they didn't know existed.

### 3.3 Where

Every page, every screen, every interaction point.

### 3.4 Navigation Depth Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max nesting depth** | 3 levels | Prevents getting lost |
| **Primary nav items** | 5-7 maximum | Decision paralysis prevention |
| **Secondary nav items** | 10-15 maximum | Organized but not overwhelming |
| **Mega menu columns** | 3-4 maximum | Scannable |
| **Mega menu items per column** | 8-10 maximum | Readable |
| **Breadcrumb depth** | Show last 2-3 items on mobile | Space efficiency |

### 3.5 Primary Navigation

#### Mobile Primary Navigation (Bottom Bar)

| Position | Item | Icon | Path | Badge | Always Visible |
|----------|------|------|------|-------|----------------|
| 1 | Home | Home | `/` | No | Yes |
| 2 | Shop | Grid3x3 | `/shop` | No | Yes |
| 3 | Search | Search | `/search` | No | Yes |
| 4 | Cart | ShoppingCart | `/cart` | Item count | Yes |
| 5 | Account | User | `/account` | None | Yes |

**Bottom Navigation Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Items** | Exactly 5 | Thumb-friendly maximum |
| **Order** | Home, Shop, Search, Cart, Account | Consistent muscle memory |
| **Labels** | Always visible below icons | Clarity |
| **Icons** | Lucide icons, 20px (h-5 w-5) | Consistent |
| **Active state** | brand-500 color + filled icon variant | Clear orientation |
| **Inactive state** | neutral-500 color + outline icon | Subtle |
| **Badge on cart** | Item count, always visible | Information at a glance |
| **Fixed position** | Bottom of viewport | Always accessible |
| **Height** | 64px + safe area inset | Touch-friendly |
| **Safe area** | `env(safe-area-inset-bottom)` padding | Prevent overlap with home indicator |
| **Border** | Top border (neutral-200) | Visual separation |
| **Background** | White with backdrop-blur | Premium feel |
| **Z-index** | `z-sticky` (100) | Above page content |
| **Shadow** | `shadow-subtle` on scroll | Visual depth |

#### Desktop Primary Navigation (Top Bar)

| Position | Item | Path | Behavior |
|----------|------|------|----------|
| Left | Logo | `/` | Home link |
| Center | Shop | `/shop` | Mega menu on hover |
| Center | Collections | `/shop?tab=collections` | Direct link |
| Center | New Arrivals | `/shop?sort=new` | Direct link |
| Center | Sale | `/shop?sale=true` | Direct link |
| Right | Search | `/search` | Expandable search |
| Right | Wishlist | `/account/wishlist` | Direct link (logged in) |
| Right | Cart | `/cart` | Badge + link |
| Right | Account | — | Dropdown menu |

**Desktop Navigation Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Position** | Fixed top | Always accessible |
| **Height** | 80px | Consistent |
| **Max width** | 1280px, centered | Readable content width |
| **Logo** | Left-aligned, links to home | Brand anchor |
| **Nav items** | Center-aligned | Balanced layout |
| **Actions** | Right-aligned | Consistent |
| **Active state** | brand-500 text color + underline | Clear orientation |
| **Hover state** | brand-600 text color | Interactive feedback |
| **Sticky** | Always visible on scroll | Navigation always available |

### 3.6 Secondary Navigation

| Context | Pattern | Items | Placement |
|---------|---------|-------|-----------|
| **Category pages** | Horizontal tabs | Men, Women, Kids, All | Below header, scrollable |
| **Account pages** | Sidebar (desktop) / List (mobile) | Profile, Orders, Wishlist, Addresses, Settings | Left side |
| **Admin pages** | Sidebar | Dashboard, Products, Orders, etc. | Left side, 280px |
| **Product detail** | Breadcrumb | Home > Category > Product | Below header |
| **Search results** | Filter chips | Active filters | Below search input |

### 3.7 Mobile Navigation

#### Bottom Navigation (Primary)

Covered in Section 3.5.

#### Hamburger Menu (Secondary)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Top-left hamburger icon (☰) | Familiar pattern |
| **Animation** | Slide from left | Natural gesture (drawer) |
| **Content** | Secondary links, categories, settings | Not primary navigation |
| **Close** | Tap X, swipe left, tap outside, Escape | Multiple recovery paths |
| **Overlay** | Semi-transparent backdrop (neutral-900/50) | Focus |
| **Max width** | 85% of screen | Don't overwhelm |
| **Z-index** | `z-modal` (200) | Above everything |
| **Scroll** | Content scrolls independently | Many items |
| **Active state** | brand-500 text + background tint | Clear orientation |

**Mobile Drawer Menu Structure:**

```
┌─────────────────────────────────┐
│  ✕  Menu                    (close)
├─────────────────────────────────┤
│                                 │
│  Shop                           │
│  ├── Men                        │
│  ├── Women                      │
│  ├── Kids                       │
│  └── All Products               │
│                                 │
│  Collections                    │
│  ├── Summer Collection          │
│  ├── Winter Collection          │
│  └── View All                   │
│                                 │
│  New Arrivals                   │
│  Sale                           │
│  Blog                           │
│                                 │
├─────────────────────────────────┤
│  Help & Support                 │
│  About Nabome                   │
│  Contact Us                     │
├─────────────────────────────────┤
│  Log In / Create Account        │
│  (or: My Account, Log Out)      │
└─────────────────────────────────┘
```

### 3.8 Tablet Navigation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Breakpoint** | 640px - 1023px | Tablet range |
| **Pattern** | Top navigation (like desktop) | More space available |
| **Touch targets** | 44x44px minimum | Touch-friendly |
| **Grid** | 4-8 columns | Medium screen optimization |
| **Mega menu** | Available on hover/tap | Full experience |
| **Bottom nav** | Hidden on tablet | Desktop pattern takes over |

### 3.9 Desktop Navigation

Covered in Sections 3.5 and 3.6.

### 3.10 Mega Menu (Desktop Shop Dropdown)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Hover on "Shop" with 100ms delay | Prevents accidental opens |
| **Layout** | 3-4 columns: Categories, Subcategories, Featured | Organized |
| **Column 1** | Main categories (Men, Women, Kids, All) | Primary navigation |
| **Column 2** | Subcategories for hovered category | Secondary navigation |
| **Column 3** | Featured collection or promotion | Engagement |
| **Column 4** | (Optional) Trending or sale items | Discovery |
| **Close** | Mouse leaves menu area with 200ms delay | Natural dismissal |
| **Keyboard** | Tab through items, Enter to activate, Escape to close | Accessibility |
| **Animation** | Fade in + slide down, 150ms | Smooth |
| **Max height** | 70vh | Don't overflow viewport |
| **Background** | White with subtle border | Clean |
| **Featured image** | Optional hero image in right column | Visual appeal |
| **Z-index** | `z-dropdown` (50) | Above page content |

### 3.11 Dropdown Menu

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Click/tap (not hover on touch devices) | Touch-friendly |
| **Position** | Below trigger, left or right aligned | Consistent |
| **Max height** | 80vh, scrollable | Don't overflow |
| **Animation** | Fade in + slide down, 150ms | Smooth |
| **Close** | Click outside, Escape, navigate | Multiple paths |
| **Keyboard** | Arrow keys, Enter, Escape | Accessibility |
| **Focus trap** | Keyboard stays within menu | Accessibility |
| **Dividers** | Separate menu groups | Organization |
| **Icons** | Optional, left-aligned | Visual clarity |
| **Disabled items** | Grayed out, not interactive | Clarity |
| **Danger items** | Red text, confirmation required | Safety |

### 3.12 Context Menu

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Right-click (desktop), long-press (mobile) | Platform conventions |
| **Position** | At pointer/touch point | Natural |
| **Items** | Context-specific actions only | Relevance |
| **Close** | Click outside, Escape, tap away | Multiple paths |
| **Keyboard** | Shift+F10 or Menu key | Accessibility |
| **Animation** | Fade in, 100ms | Fast |

### 3.13 Breadcrumbs

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Below header, above content | Orientation |
| **Format** | Home > Category > Subcategory > Product | Hierarchy |
| **Links** | All items except current page are links | Navigation |
| **Separator** | `/` or `>` chevron | Visual clarity |
| **Mobile** | Show last 2 items with "..." truncation | Space efficiency |
| **Truncation** | Show "..." for deep hierarchies | Prevent overflow |
| **Schema** | Use structured data (BreadcrumbList) | SEO |
| **Current page** | Not a link, bold or distinct style | Orientation |
| **Max items** | Show all on desktop, truncate on mobile | Responsive |

### 3.14 Category Navigation

| Context | Pattern | Behavior |
|---------|---------|----------|
| **Homepage** | Category cards with images | Click to category page |
| **Shop page** | Horizontal category tabs | Switch between categories |
| **Mega menu** | Category columns | Hover to reveal subcategories |
| **Mobile drawer** | Category list with expand/collapse | Tap to expand |
| **Sidebar (desktop)** | Category tree with checkboxes | Filter products |

### 3.15 Collection Navigation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Shop navigation, homepage featured | Discovery |
| **Display** | Card with hero image + name | Visual appeal |
| **URL** | `/shop?collection=slug` | Bookmarkable |
| **Count** | Show product count in collection | Information |
| **Sort** | Collections have their own sort | Flexibility |
| **Filter** | Collections support filtering | Refinement |

### 3.16 CMS Navigation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Blog** | `/blog` with category tabs | Content discovery |
| **Blog post** | `/blog/:slug` | Direct access |
| **About** | `/about` | Company info |
| **Contact** | `/contact` | Support |
| **FAQ** | `/faq` | Self-service |
| **Terms** | `/terms` | Legal |
| **Privacy** | `/privacy` | Legal |
| **Footer links** | All CMS pages linked in footer | Discoverability |

### 3.17 Dynamic Menus

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Source** | Admin CMS manages menu items | No hardcoded menus |
| **Structure** | Hierarchical (parent/child) | Flexible |
| **Ordering** | Admin configurable | Priority control |
| **Visibility** | Admin configurable (show/hide) | Context control |
| **Icons** | Optional per menu item | Visual clarity |
| **Links** | Internal or external URLs | Flexibility |
| **Nested menus** | Max 3 levels deep | Prevent complexity |
| **Cache** | Cache menu structure in KV | Performance |
| **Fallback** | Default menu if CMS unavailable | Resilience |

### 3.18 Admin Menu

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Layout** | Left sidebar, 280px (collapsible to 64px) | Always visible |
| **Items** | Dashboard, Products, Orders, Customers, Categories, Collections, Brands, Coupons, CMS, Media, Analytics, Settings | Comprehensive |
| **Groups** | Organized with section labels | Organization |
| **Icons** | Always visible (even collapsed) | Identification |
| **Active state** | brand-500 background + text | Clear orientation |
| **Badges** | Notification counts (pending orders, low stock) | Information |
| **Mobile** | Drawer overlay (not inline) | Space efficiency |
| **Collapsible** | Toggle button in top bar | Screen real estate |
| **Scrollable** | Overflow-y auto | Many items |
| **Search** | Top bar search for quick actions | Efficiency |

### 3.19 Shop Menu (Shop Owner)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Layout** | Same as admin sidebar | Consistency |
| **Items** | Dashboard, Products, Orders, Customers, Settings | Focused |
| **Scope** | Only shop-specific data | Boundary |

### 3.20 Customer Menu

| Context | Pattern | Items |
|---------|---------|-------|
| **Bottom nav** | 5 tabs | Home, Shop, Search, Cart, Account |
| **Account dropdown** | Dropdown menu | Profile, Orders, Wishlist, Addresses, Settings, Logout |
| **Account sidebar** | Sidebar (desktop) | Same as dropdown, always visible |
| **Account list** | List (mobile) | Same as sidebar, stacked |

### 3.21 Guest Menu

| Context | Pattern | Items |
|---------|---------|-------|
| **Bottom nav** | 5 tabs | Home, Shop, Search, Cart, Account |
| **Account dropdown** | Dropdown menu | Log In, Create Account |
| **Cart** | Full experience | Guest checkout available |
| **Wishlist** | Prompt to login | Save wishlist |

---

## 4. Search Architecture

### 4.1 What

The complete search experience that enables users to find products, categories, collections, and content quickly — from input to results to empty states.

### 4.2 Why

- **Findability:** Users find products fast.
- **Conversion:** Search drives purchase intent.
- **Discovery:** Users find products they didn't know existed.
- **Efficiency:** Quick search with autocomplete.

### 4.3 Where

Header search icon, search page, admin search.

### 4.4 Search Interface Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SEARCH ARCHITECTURE                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SEARCH TRIGGER                                           │   │
│  │  • Header search icon (always visible)                    │   │
│  │  • Keyboard shortcut: `/`                                 │   │
│  │  • Touch target: 44x44px                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SEARCH INPUT (Mobile: full-screen overlay)               │   │
│  │  • Auto-focus on activation                               │   │
│  │  • Clear button (X) when has value                        │   │
│  │  • Placeholder: "Search products..."                      │   │
│  │  • Back button (mobile) to close                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AUTOCOMPLETE DROPDOWN                                    │   │
│  │  • Recent searches (top, if no query)                     │   │
│  │  • Popular searches (if no query)                         │   │
│  │  • Product suggestions (as user types, min 2 chars)       │   │
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
│  │  • Product grid (2 col mobile, 3 tablet, 4 desktop)       │   │
│  │  • Load more / pagination                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EMPTY STATE                                              │   │
│  │  • "No results for X"                                     │   │
│  │  • Spelling suggestions ("Did you mean...")               │   │
│  │  • Popular products                                       │   │
│  │  • Clear search button                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Global Search Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Header, always visible | Discoverability |
| **Auto-focus** | Focus input on activation | Speed |
| **Debounce** | 300ms before API call | Performance |
| **Min query** | 2 characters for autocomplete | Prevent noise |
| **Max results** | 8 suggestions in dropdown | Scannable |
| **Recent searches** | Store last 5 in localStorage | Convenience |
| **Popular searches** | Show trending searches | Discovery |
| **Keyboard** | `/` to focus, arrows to navigate, Enter to select, Escape to close | Power users |
| **Clear** | X button to clear query | Ease |
| **Result count** | Always show "X results for Y" | Context |
| **No results** | Helpful suggestions + popular products | Guidance |
| **Analytics** | Track search queries | Business intelligence |

### 4.6 Product Search

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Fields** | Name, description, brand, category, SKU | Comprehensive |
| **Typo tolerance** | Levenshtein distance 2 | Forgiving |
| **Fuzzy matching** | Partial matches included | Discovery |
| **Weighting** | Name > Brand > Category > Description | Relevance |
| **Highlight** | Bold matching text in results | Visual feedback |
| **Image** | Show product image in suggestions | Quick identification |
| **Price** | Show price in suggestions | Decision factor |
| **Stock** | Show "Out of stock" for unavailable | Transparency |

### 4.7 Category Search

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Match** | Category name | Direct |
| **Display** | Category name + product count | Information |
| **Click** | Navigate to category page | Direct navigation |
| **Icon** | Category image or icon | Visual |

### 4.8 Collection Search

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Match** | Collection name | Direct |
| **Display** | Collection name + product count | Information |
| **Click** | Navigate to collection page | Direct navigation |
| **Image** | Collection hero image | Visual |

### 4.9 Blog Search

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Match** | Article title, content, tags | Comprehensive |
| **Display** | Title + excerpt + date | Information |
| **Click** | Navigate to article | Direct |
| **Category** | Show article category | Context |

### 4.10 Suggestions

| Type | Trigger | Display | Action |
|------|---------|---------|--------|
| **Recent** | No query | Last 5 searches with clock icon | Populate search input |
| **Popular** | No query | Trending searches with fire icon | Populate search input |
| **Product** | 2+ characters | Product card (image, name, price) | Navigate to product |
| **Category** | 2+ characters | Category name + count | Navigate to category |
| **Collection** | 2+ characters | Collection name + count | Navigate to collection |

### 4.11 Recent Searches

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Storage** | localStorage | Persistent across sessions |
| **Max items** | 5 most recent | Don't overwhelm |
| **Display** | Clock icon + query text | Clear |
| **Delete** | Swipe or X button per item | Control |
| **Clear all** | "Clear recent searches" link | Bulk action |
| **Privacy** | Clear on logout | Security |

### 4.12 Popular Searches

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Source** | API (aggregated from search logs) | Data-driven |
| **Display** | Fire icon + query text | Visual |
| **Max items** | 6-8 | Scannable |
| **Update** | Daily or weekly | Fresh |
| **Fallback** | Default popular items if API fails | Resilience |

### 4.13 Typo Tolerance

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Algorithm** | Levenshtein distance | Industry standard |
| **Threshold** | Max 2 character differences | Forgiving but accurate |
| **Suggestion** | "Did you mean X?" | Helpful |
| **Fallback** | Show results for corrected query | Automatic |

### 4.14 Voice Search Ready

| Rule | Standard | Rationale |
|------|----------|-----------|
| **API** | Web Speech API (SpeechRecognition) | Native browser |
| **Icon** | Microphone icon next to search | Discoverable |
| **Feedback** | Visual indicator when listening | Confirmation |
| **Fallback** | Hide icon if not supported | Graceful |
| **Privacy** | Request permission before listening | Trust |

### 4.15 Image Search Ready

| Rule | Standard | Rationale |
|------|----------|-----------|
| **API** | Future: visual search API | Innovation |
| **Icon** | Camera icon in search | Discoverable |
| **Behavior** | Open file picker or camera | Intuitive |
| **Fallback** | Hide if not supported | Graceful |
| **Use case** | "Find similar products" | Discovery |

---

## 5. Profile & Account Navigation

### 5.1 What

The navigation system for user account management — how guests, customers, shop owners, and admins access their profiles, settings, and role-specific dashboards.

### 5.2 Why

- **Personalization:** Users manage their own data.
- **Orientation:** Users know what they can access.
- **Security:** Role-based access is clear.
- **Efficiency:** Quick access to common actions.

### 5.3 Where

Account icon in header, account pages, admin dashboard.

### 5.4 Guest Navigation

| Element | Behavior | Path |
|---------|----------|------|
| **Account icon** | Links to login page | `/login` |
| **Register link** | Below login form | `/register` |
| **Cart** | Full experience, guest checkout | `/cart` |
| **Wishlist** | Prompt to login to save | `/login?redirect=/account/wishlist` |

**Guest Account Menu:**

| Item | Path |
|------|------|
| Log In | `/login` |
| Create Account | `/register` |

### 5.5 Customer Navigation

| Element | Behavior | Path |
|---------|----------|------|
| **Account icon** | Opens account dropdown | — |
| **Avatar** | Shows user photo or initials | — |
| **Account page** | Full account dashboard | `/account` |

**Customer Account Menu:**

| Order | Item | Icon | Path |
|-------|------|------|------|
| 1 | My Profile | User | `/account/profile` |
| 2 | My Orders | Package | `/account/orders` |
| 3 | My Wishlist | Heart | `/account/wishlist` |
| 4 | My Addresses | MapPin | `/account/addresses` |
| 5 | Settings | Settings | `/account/settings` |
| 6 | — divider — | — | — |
| 7 | Log Out | LogOut | (triggers logout) |

**Customer Account Sidebar (Desktop):**

| Order | Item | Icon | Path |
|-------|------|------|------|
| 1 | Overview | LayoutDashboard | `/account` |
| 2 | My Profile | User | `/account/profile` |
| 3 | My Orders | Package | `/account/orders` |
| 4 | My Wishlist | Heart | `/account/wishlist` |
| 5 | My Addresses | MapPin | `/account/addresses` |
| 6 | Settings | Settings | `/account/settings` |
| 7 | — divider — | — | — |
| 8 | Log Out | LogOut | (triggers logout) |

### 5.6 Shop Owner Navigation

| Element | Behavior | Path |
|---------|----------|------|
| **Dashboard switch** | In account dropdown | `/admin` |
| **Shop dashboard** | Same as admin, scoped to shop | `/admin` |

**Shop Owner Account Menu:**

| Order | Item | Icon | Path |
|-------|------|------|------|
| 1 | My Profile | User | `/account/profile` |
| 2 | My Orders | Package | `/account/orders` |
| 3 | — divider — | — | — |
| 4 | Shop Dashboard | LayoutDashboard | `/admin` |
| 5 | — divider — | — | — |
| 6 | Settings | Settings | `/account/settings` |
| 7 | Log Out | LogOut | (triggers logout) |

### 5.7 Admin Navigation

| Element | Behavior | Path |
|---------|----------|------|
| **Dashboard switch** | In account dropdown | `/admin` |
| **Admin sidebar** | Full admin navigation | Left sidebar |
| **Admin top bar** | Search, notifications, profile | Top |

**Admin Account Menu:**

| Order | Item | Icon | Path |
|-------|------|------|------|
| 1 | My Profile | User | `/account/profile` |
| 2 | — divider — | — | — |
| 3 | Admin Dashboard | LayoutDashboard | `/admin` |
| 4 | — divider — | — | — |
| 5 | Settings | Settings | `/account/settings` |
| 6 | Log Out | LogOut | (triggers logout) |

### 5.8 Dashboard Switch

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Visibility** | Only for users with admin/shop owner roles | Role-based |
| **Placement** | Inside account dropdown menu | Not cluttering header |
| **Icon** | LayoutDashboard from Lucide | Recognizable |
| **Label** | "Dashboard" or "Admin Panel" | Clear |
| **Behavior** | Links to `/admin` or shop dashboard | Direct navigation |
| **ARIA label** | "Switch to admin dashboard" | Screen readers |
| **Return** | "Back to store" link in admin header | Easy return |

### 5.9 Login Entry

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Account icon (logged out) → login page | Clear path |
| **Header** | Minimal: logo only | Focus on form |
| **Form** | Centered, max-width 400px | Clean |
| **Social login** | Google, Apple (if configured) | Convenience |
| **Register link** | Below form | New users |
| **Forgot password** | Below form | Recovery |
| **Redirect** | After login, return to previous page | Continuity |

### 5.10 Registration Entry

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | "Create Account" link on login page | Clear path |
| **Header** | Minimal: logo only | Focus on form |
| **Form** | Centered, max-width 400px | Clean |
| **Fields** | Name, email, password (minimal) | Low friction |
| **Terms** | Below form | Legal |
| **Login link** | Below form | Existing users |
| **After register** | Welcome page + email verification | Onboarding |

### 5.11 Profile Menu

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Account icon click/tap | Familiar |
| **Position** | Below account icon, right-aligned | Consistent |
| **User info** | Avatar + name + email at top | Personal |
| **Items** | Organized with dividers | Clear groups |
| **Active state** | Bold text for current page | Orientation |
| **Logout** | Bottom, with confirmation | Safety |

### 5.12 Settings

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Path** | `/account/settings` | Direct |
| **Sections** | Profile, Email, Password, Notifications, Delete Account | Organized |
| **Layout** | Single column form | Focused |
| **Save** | Auto-save or explicit save button | Feedback |
| **Confirmation** | For dangerous actions (delete account) | Safety |

### 5.13 Logout

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | "Log Out" in account menu | Clear |
| **Confirmation** | Dialog: "Are you sure you want to log out?" | Safety |
| **Behavior** | Clear session, redirect to home | Clean |
| **Cart** | Preserve guest cart | Don't lose work |
| **Wishlist** | Preserve wishlist (tied to account) | Don't lose data |

### 5.14 Account Switching

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single account** | No multi-account switching in v1 | Simplicity |
| **Future** | Account switcher in profile menu | Scalability |
| **Role switching** | Dashboard switch for admin/shop owner | Already defined |
| **Logout + login** | For switching accounts | Current approach |

---

## 6. Footer Architecture

### 6.1 What

The persistent bottom section of every storefront page that provides secondary navigation, company information, support links, legal pages, newsletter signup, and trust signals.

### 6.2 Why

- **Completeness:** Every page feels complete with a footer.
- **Discovery:** Users find secondary pages they didn't know existed.
- **Trust:** Company information and policies build confidence.
- **SEO:** Footer links help search engine crawling.
- **Support:** Users find help when they need it.

### 6.3 Where

Every storefront page. Admin pages do not show the storefront footer (they have their own layout).

### 6.4 Footer Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Organized** | Links grouped logically | Findability |
| **Minimal** | Not cluttered, generous spacing | Premium feel |
| **Trustworthy** | Company info, policies, trust signals | Confidence |
| **Actionable** | Newsletter signup, social links | Engagement |
| **Responsive** | Collapsible on mobile, full on desktop | Space efficiency |
| **Accessible** | Keyboard navigable, proper landmarks | Inclusivity |

### 6.5 Footer Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    FOOTER HIERARCHY                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 1: NEWSLETTER                                     │   │
│  │  Email signup — primary CTA in footer                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 2: LINK COLUMNS                                   │   │
│  │  Shop, Company, Support, Legal — organized groups         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 3: SOCIAL & TRUST                                 │   │
│  │  Social icons, payment methods, trust badges              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 4: COPYRIGHT                                      │   │
│  │  © 2026 Nabome. All rights reserved.                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.6 Responsive Layout

#### Desktop (1024px+)

```
┌──────────────────────────────────────────────────────────────────┐
│  NEWSLETTER                                                       │
│  Subscribe for updates        [Email input] [Subscribe]           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Shop           Company        Support        Legal              │
│  Men            About          Contact Us     Privacy Policy     │
│  Women          Careers        FAQ            Terms of Service    │
│  Kids           Blog           Shipping Info  Return Policy      │
│  New Arrivals   Press          Size Guide     Cookie Policy       │
│  Sale           Sustainability Track Order                       │
│  Collections                    Help Center                      │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  [Facebook] [Instagram] [Twitter] [Pinterest]   [Visa] [MC] [UPI]│
├──────────────────────────────────────────────────────────────────┤
│  © 2026 Nabome. All rights reserved.                             │
└──────────────────────────────────────────────────────────────────┘
```

#### Mobile (< 640px)

```
┌──────────────────────────────────────┐
│  NEWSLETTER                           │
│  Subscribe for updates                │
│  [Email input]                        │
│  [Subscribe]                          │
├──────────────────────────────────────┤
│                                      │
│  Shop                          ▾     │
│  ├── Men                            │
│  ├── Women                          │
│  ├── Kids                           │
│  └── Sale                           │
│                                      │
│  Company                       ▾     │
│  ├── About                          │
│  ├── Careers                        │
│  └── Blog                           │
│                                      │
│  Support                       ▾     │
│  ├── Contact Us                     │
│  ├── FAQ                            │
│  └── Help Center                    │
│                                      │
│  Legal                         ▾     │
│  ├── Privacy Policy                 │
│  ├── Terms of Service               │
│  └── Return Policy                  │
│                                      │
├──────────────────────────────────────┤
│  [Facebook] [Instagram] [Twitter]    │
│  [Visa] [Mastercard] [UPI]          │
├──────────────────────────────────────┤
│  © 2026 Nabome. All rights reserved. │
└──────────────────────────────────────┘
```

### 6.7 Footer Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max width** | 1280px, centered | Consistent with header |
| **Background** | neutral-900 (dark) | Visual separation from content |
| **Text color** | neutral-400 (links), white (headings) | Readable on dark |
| **Link color** | neutral-400 → white on hover | Interactive feedback |
| **Padding** | py-12 sm:py-16 lg:py-20 | Generous spacing |
| **Section spacing** | gap-8 lg:gap-12 | Organized |
| **Column gap** | gap-8 lg:gap-12 | Readable |
| **Mobile columns** | Collapsible accordion sections | Space efficiency |
| **Newsletter** | Always visible, prominent | Engagement |
| **Social icons** | 20px, neutral-400 → white hover | Subtle |
| **Payment icons** | Grayscale, 32px height | Trust signals |
| **Copyright** | Bottom, centered | Legal |
| **Z-index** | `z-base` (0) | Normal stacking |

### 6.8 Link Organization

| Column | Links | Purpose |
|--------|-------|---------|
| **Shop** | Men, Women, Kids, New Arrivals, Sale, Collections | Product discovery |
| **Company** | About, Careers, Blog, Press, Sustainability | Brand information |
| **Support** | Contact Us, FAQ, Shipping Info, Size Guide, Track Order, Help Center | Customer support |
| **Legal** | Privacy Policy, Terms of Service, Return Policy, Cookie Policy | Legal compliance |

### 6.9 Company Information

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Logo** | Nabome logo (white variant) | Brand identity |
| **Tagline** | Optional brand tagline | Personality |
| **Address** | Physical address (if applicable) | Trust |
| **Email** | Support email | Contact |
| **Phone** | Support phone (if applicable) | Contact |

### 6.10 Customer Support

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Contact** | `/contact` page | Direct support |
| **FAQ** | `/faq` page | Self-service |
| **Shipping** | `/shipping` or FAQ section | Common question |
| **Size Guide** | `/size-guide` or modal | Pre-purchase help |
| **Track Order** | `/account/orders/:id/tracking` | Post-purchase |
| **Help Center** | `/help` or FAQ | Comprehensive support |

### 6.11 Policies

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Privacy Policy** | `/privacy` | Legal requirement |
| **Terms of Service** | `/terms` | Legal requirement |
| **Return Policy** | `/returns` or `/policy/returns` | Customer trust |
| **Cookie Policy** | `/cookies` or `/policy/cookies` | Legal requirement |
| **Shipping Policy** | `/shipping` or `/policy/shipping` | Customer information |
| **Accessibility** | `/accessibility` | Inclusivity statement |

### 6.12 Newsletter

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Top of footer, full width | Prominent |
| **Headline** | "Stay in the loop" or similar | Engaging |
| **Description** | Brief value proposition | Motivation |
| **Input** | Email input, full width on mobile | Easy |
| **Button** | "Subscribe" or "Join" | Clear CTA |
| **Privacy** | "We respect your privacy" note | Trust |
| **Success** | Toast confirmation + clear input | Feedback |
| **Error** | Inline error message | Guidance |
| **Loading** | Button spinner during submit | Feedback |
| **Debounce** | Prevent double-submit | Reliability |

### 6.13 Social Links

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Platforms** | Facebook, Instagram, Twitter/X, Pinterest | Relevant platforms |
| **Icon size** | 20px (h-5 w-5) | Subtle |
| **Color** | neutral-400 → white on hover | Interactive |
| **Target** | `_blank` (new tab) | Don't navigate away |
| **Rel** | `noopener noreferrer` | Security |
| **ARIA label** | "Follow us on [Platform]" | Accessibility |
| **Position** | Below link columns, above copyright | Visible but not dominant |

### 6.14 Copyright

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Text** | "© 2026 Nabome. All rights reserved." | Legal |
| **Position** | Bottom of footer | Standard |
| **Alignment** | Centered | Balanced |
| **Color** | neutral-500 | Subtle |
| **Links** | Privacy, Terms inline (optional) | Legal access |

### 6.15 Trust Elements

| Element | Placement | Purpose |
|---------|-----------|---------|
| **Payment methods** | Footer, right side | Trust signals |
| **SSL badge** | Footer or checkout | Security |
| **Certifications** | Footer (if applicable) | Trust |
| **Reviews badge** | Footer (if applicable) | Social proof |
| **Free shipping** | Footer or banner | Incentive |
| **Easy returns** | Footer or banner | Trust |

### 6.16 Footer Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Cluttered footer | Overwhelming | Organized columns, generous spacing |
| Too many links | Decision paralysis | Group by purpose, max 6-8 per column |
| Hidden legal pages | Legal risk | Always visible in footer |
| No newsletter | Missed engagement | Prominent newsletter signup |
| No social links | Missed engagement | Visible social icons |
| No trust signals | Low confidence | Payment icons, badges |
| Fixed footer on mobile | Covers content | Normal flow footer |
| Broken links | Unprofessional | Regular link audits |

---

## 7. Responsive Behavior

### 7.1 What

How the navigation system adapts across different screen sizes — from small phones to large desktop monitors — ensuring optimal usability at every breakpoint.

### 7.2 Why

- **70%+ mobile traffic:** Mobile must be the primary experience.
- **Thumb-friendly:** One-handed usage on phones.
- **Progressive enhancement:** Desktop gets more features.
- **Consistency:** Same navigation identity across all sizes.

### 7.3 Where

Every navigation component across all breakpoints.

### 7.4 Breakpoint Navigation Behavior

| Breakpoint | Width | Header | Primary Nav | Secondary Nav | Search | Footer |
|------------|-------|--------|-------------|---------------|--------|--------|
| **Small phone** | < 375px | Hamburger + Logo + Actions | Bottom nav (5 tabs) | Drawer menu | Full-screen overlay | Collapsible columns |
| **Large phone** | 375px - 639px | Hamburger + Logo + Actions | Bottom nav (5 tabs) | Drawer menu | Full-screen overlay | Collapsible columns |
| **Tablet** | 640px - 1023px | Logo + Nav + Actions | Top nav (horizontal) | Tabs or sidebar | Expandable in header | 4-column grid |
| **Desktop** | 1024px - 1279px | Logo + Nav + Mega Menu + Actions | Top nav + mega menu | Sidebar or tabs | Expandable in header | 4-column grid |
| **Large desktop** | 1280px+ | Logo + Nav + Mega Menu + Actions | Top nav + mega menu | Sidebar or tabs | Expandable in header | 4-column grid |

### 7.5 Small Phone (< 375px)

| Element | Behavior | Rationale |
|---------|----------|-----------|
| **Header** | Hamburger + Logo + essential actions only | Extreme space efficiency |
| **Bottom nav** | 5 tabs, icons + labels, 56px height | Thumb-friendly |
| **Search** | Full-screen overlay | Focus on search |
| **Cart** | Badge with count | Information |
| **Footer** | All sections collapsed by default | Space efficiency |
| **Mega menu** | Not available (use drawer) | Too small |
| **Breadcrumbs** | Truncated to last 2 items | Space efficiency |
| **Account menu** | Full-screen or bottom sheet | Touch-friendly |

### 7.6 Large Phone (375px - 639px)

| Element | Behavior | Rationale |
|---------|----------|-----------|
| **Header** | Hamburger + Logo + actions | Standard mobile |
| **Bottom nav** | 5 tabs, icons + labels, 64px height | Thumb-friendly |
| **Search** | Full-screen overlay | Focus on search |
| **Cart** | Badge with count | Information |
| **Footer** | Collapsible sections, expanded by default | Readable |
| **Mega menu** | Not available (use drawer) | Too small |
| **Breadcrumbs** | Truncated to last 2-3 items | Space efficiency |
| **Account menu** | Full-screen or bottom sheet | Touch-friendly |

### 7.7 Tablet (640px - 1023px)

| Element | Behavior | Rationale |
|---------|----------|-----------|
| **Header** | Logo + horizontal nav + actions | More space |
| **Bottom nav** | Hidden (top nav takes over) | Desktop pattern |
| **Search** | Expandable in header | Space-efficient |
| **Cart** | Badge with count | Information |
| **Footer** | 4-column grid | Full layout |
| **Mega menu** | Available on hover/tap | Full experience |
| **Breadcrumbs** | Full display | Enough space |
| **Account menu** | Dropdown | Standard |
| **Sidebar** | Collapsible | Space management |

### 7.8 Desktop (1024px - 1279px)

| Element | Behavior | Rationale |
|---------|----------|-----------|
| **Header** | Logo + nav + mega menu + actions | Full experience |
| **Bottom nav** | Hidden | Desktop pattern |
| **Search** | Expandable in header | Space-efficient |
| **Cart** | Badge with count | Information |
| **Footer** | 4-column grid, full width | Complete |
| **Mega menu** | Full 3-4 column layout | Efficient browsing |
| **Breadcrumbs** | Full display | Orientation |
| **Account menu** | Dropdown | Standard |
| **Sidebar** | 280px fixed | Always visible |

### 7.9 Large Desktop (1280px+)

| Element | Behavior | Rationale |
|---------|----------|-----------|
| **Header** | Logo + nav + mega menu + actions, max-width 1280px | Centered, premium |
| **Bottom nav** | Hidden | Desktop pattern |
| **Search** | Expandable in header | Space-efficient |
| **Cart** | Badge with count | Information |
| **Footer** | 4-column grid, max-width 1280px | Centered, premium |
| **Mega menu** | Full layout with more spacing | Premium feel |
| **Breadcrumbs** | Full display | Orientation |
| **Account menu** | Dropdown | Standard |
| **Sidebar** | 280px fixed | Always visible |

### 7.10 Responsive Transition Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile-first** | Base styles for mobile, enhance for larger | 70%+ traffic |
| **Progressive enhancement** | Add features for larger screens | Better UX |
| **No horizontal scroll** | Content stays within viewport | UX |
| **Consistent identity** | Same brand, same colors, same patterns | Consistency |
| **Touch-friendly** | 44px targets on all touch devices | Accessibility |
| **No content loss** | All content accessible at every size | Completeness |
| **No layout shift** | Stable layouts during resize | Performance |

### 7.11 Responsive Navigation Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hamburger on tablet+ | Wasted space | Use horizontal nav |
| Bottom nav on tablet+ | Unusual pattern | Use top nav |
| Stacked nav on desktop | Wasted space | Horizontal nav |
| Fixed widths | Breaks on different screens | Responsive widths |
| Hidden content | Users can't find it | Always accessible |
| Different ordering | Confusing | Consistent order |
| No safe area handling | Content overlaps device UI | Use env() insets |

---

## 8. Accessibility

### 8.1 What

WCAG 2.2 AA compliance standards for every navigation component — ensuring all users, regardless of ability, can navigate the platform effectively.

### 8.2 Why

- **Legal compliance:** Meet accessibility laws.
- **Inclusivity:** Everyone can use the platform.
- **SEO:** Search engines favor accessible sites.
- **Quality:** Accessible code is better code.

### 8.3 Where

Every navigation component, every interaction, every page.

### 8.4 Keyboard Navigation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical, follows visual flow | Intuitive |
| **Focus visible** | Clear focus ring (2px brand-500) | Orientation |
| **No keyboard trap** | Always able to escape | Recovery |
| **Skip link** | "Skip to main content" as first element | Screen reader users |
| **Shortcuts** | `/` for search, `ESC` for close | Efficiency |
| **Arrow keys** | Navigate within menus, tabs, lists | Familiar |
| **Enter/Space** | Activate buttons and links | Standard |
| **Escape** | Close modals, menus, dropdowns | Recovery |
| **Home/End** | Navigate to first/last item in lists | Efficiency |
| **Focus management** | Return focus to trigger on close | Accessibility |

### 8.5 Focus Order

| Order | Element | Rationale |
|-------|---------|-----------|
| 1 | Skip to content link | First priority |
| 2 | Logo (home link) | Brand anchor |
| 3 | Navigation links | Primary navigation |
| 4 | Search | Utility action |
| 5 | Cart | Utility action |
| 6 | Account | Utility action |
| 7 | Main content | Page content |
| 8 | Footer links | Secondary navigation |

### 8.6 Screen Readers

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic HTML** | `<nav>`, `<main>`, `<header>`, `<footer>`, `<button>` | Meaning |
| **ARIA landmarks** | `role="navigation"`, `role="banner"`, `role="contentinfo"` | Navigation |
| **ARIA labels** | On all icon buttons and interactive elements | Identification |
| **Hidden decorative** | `aria-hidden="true"` for decorative icons | Reduce noise |
| **Live regions** | `aria-live="polite"` for dynamic content updates | Updates |
| **Current page** | `aria-current="page"` on active nav item | Orientation |
| **Menu semantics** | `role="menu"`, `role="menuitem"` for dropdowns | Meaning |
| **Expand state** | `aria-expanded` on toggle buttons | State |
| **Loading** | `aria-busy` during loading states | State |
| **Announcements** | Announce page changes, cart updates | Updates |

### 8.7 ARIA Patterns

```tsx
// ✓ CORRECT: Skip to content link
<a href=\"#main-content\" className=\"sr-only focus:not-sr-only focus:absolute focus:z-50 ...\">
  Skip to main content
</a>

// ✓ CORRECT: Navigation landmark
<nav aria-label=\"Main navigation\">
  {/* Navigation items */}
</nav>

// ✓ CORRECT: Active page indicator
<a href=\"/shop\" aria-current=\"page\" className=\"text-brand-500 font-semibold\">
  Shop
</a>

// ✓ CORRECT: Mobile menu toggle
<button
  aria-expanded={isMenuOpen}
  aria-controls=\"mobile-menu\"
  aria-label=\"Open navigation menu\"
>
  <MenuIcon aria-hidden=\"true\" />
</button>

// ✓ CORRECT: Dropdown menu
<div role=\"menu\" aria-label=\"Account menu\">
  <a role=\"menuitem\" href=\"/account/profile\">My Profile</a>
  <a role=\"menuitem\" href=\"/account/orders\">My Orders</a>
</div>

// ✓ CORRECT: Cart badge
<button aria-label={`Shopping cart, ${itemCount} items`}>
  <ShoppingCart aria-hidden=\"true\" />
  <span aria-hidden=\"true\">{itemCount}</span>
</button>
```

### 8.8 Touch Accessibility

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Min target** | 44x44px | Ease of use |
| **Spacing** | 8px between targets | Prevent miss-taps |
| **No hover only** | Works without hover | Touch devices |
| **Gesture alternatives** | Button alternatives for gestures | Accessibility |
| **Bottom nav** | Reachable by thumb | One-handed use |
| **Safe areas** | Respect device insets | Prevent overlap |

### 8.9 Color Contrast

| Element | Foreground | Background | Ratio | WCAG |
|---------|------------|------------|-------|------|
| **Nav link (default)** | neutral-700 | white | 8.6:1 | AAA |
| **Nav link (hover)** | brand-600 | white | 5.7:1 | AA |
| **Nav link (active)** | brand-500 | white | 4.6:1 | AA |
| **Bottom nav (active)** | brand-500 | white | 4.6:1 | AA |
| **Bottom nav (inactive)** | neutral-500 | white | 4.6:1 | AA |
| **Footer text** | neutral-400 | neutral-900 | 7.1:1 | AAA |
| **Footer links** | neutral-400 | neutral-900 | 7.1:1 | AAA |
| **Footer links (hover)** | white | neutral-900 | 15.4:1 | AAA |
| **Cart badge** | white | brand-500 | 4.6:1 | AA |

### 8.10 Reduced Motion

```css
/* ✓ CORRECT: Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  /* Disable mega menu animation */
  .mega-menu {
    transition: none;
  }

  /* Disable drawer slide animation */
  .drawer {
    transition: none;
  }

  /* Disable search overlay animation */
  .search-overlay {
    transition: none;
  }

  /* Disable header shrink on scroll */
  .header {
    transition: none;
  }
}
```

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Honor preference** | Check `prefers-reduced-motion` | Vestibular disorders |
| **Disable animations** | Set `transition: none` | Comfort |
| **Disable auto-play** | No auto-playing carousels | Control |
| **No flashing** | No content flashes > 3 times/second | Seizure prevention |
| **Essential motion** | Keep functional motion (scroll, focus) | Usability |

### 8.11 Accessibility Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| No skip link | Screen reader users must tab through nav | Add skip link |
| No focus ring | Keyboard users can't see where they are | Visible focus ring |
| No ARIA labels | Screen readers can't identify icons | Add aria-label |
| Keyboard trap in menu | Users can't escape | Allow Escape to close |
| No aria-current | Users don't know active page | Add aria-current |
| Color-only indicators | Colorblind users can't see state | Use icons + text |
| No reduced motion | Vestibular disorders triggered | Honor preference |
| Missing alt text | Screen readers can't describe images | Add descriptive alt |
| No semantic HTML | Meaning lost for assistive tech | Use semantic elements |
| Auto-focus trap | Focus moves unexpectedly | Manage focus intentionally |

---

## 9. Performance

### 9.1 What

Performance standards for navigation components — ensuring fast load times, smooth interactions, and minimal impact on page performance.

### 9.2 Why

- **First impression:** Header is the first thing users see.
- **Navigation speed:** Users expect instant navigation.
- **Perceived performance:** Fast navigation feels premium.
- **SEO:** Fast pages rank higher.

### 9.3 Where

Every navigation component, every page load, every interaction.

### 9.4 Lazy Loading

| Component | Lazy Load | Rationale |
|-----------|-----------|-----------|
| **Header** | No (always needed) | Critical path |
| **Bottom nav** | No (always needed on mobile) | Critical path |
| **Footer** | Yes (below fold) | Not critical |
| **Mega menu content** | Yes (load on hover) | On-demand |
| **Search results** | Yes (load on query) | On-demand |
| **Account menu** | Yes (load on click) | On-demand |
| **Mobile drawer** | Yes (load on open) | On-demand |

### 9.5 Navigation Speed

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Header render** | < 100ms | First paint |
| **Bottom nav render** | < 100ms | First paint |
| **Mega menu open** | < 150ms | Feels instant |
| **Drawer open** | < 200ms | Smooth |
| **Search overlay open** | < 150ms | Responsive |
| **Page navigation** | < 300ms | Fast transitions |
| **Dropdown open** | < 150ms | Responsive |
| **Menu close** | < 100ms | Immediate |

### 9.6 Search Responsiveness

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Input debounce** | 300ms | Prevent excessive API calls |
| **Autocomplete response** | < 200ms | Feels instant |
| **Results page load** | < 500ms | Fast navigation |
| **Filter apply** | < 300ms | Responsive |
| **Sort apply** | < 300ms | Responsive |
| **Skeleton display** | Immediately on loading | Perceived performance |

### 9.7 Animation Performance

| Rule | Standard | Rationale |
|------|----------|-----------|
| **60fps** | All animations run at 60fps | Smooth |
| **CSS transforms** | Use `transform` and `opacity` only | GPU-accelerated |
| **No layout thrashing** | Don't trigger reflows during animation | Performance |
| **Will-change** | Use sparingly for known animations | Optimization |
| **RequestAnimationFrame** | For JS-driven animations | Smooth |
| **Hardware acceleration** | Use `transform3d` for GPU | Performance |
| **Duration** | Max 300ms for most animations | Don't waste time |

### 9.8 Layout Stability

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No CLS from header** | Header has fixed height | No layout shift |
| **No CLS from bottom nav** | Bottom nav has fixed height | No layout shift |
| **No CLS from footer** | Footer loads below content | No layout shift |
| **Reserve space** | Mega menu reserves space or uses absolute | No content jump |
| **Skeleton loading** | Show skeletons for dynamic content | No content jump |
| **Image dimensions** | Always specify width/height | No content jump |

### 9.9 Caching Strategy

| Component | Cache | Rationale |
|-----------|-------|-----------|
| **Menu structure** | KV cache, 5 min TTL | Reduce DB queries |
| **Categories** | KV cache, 15 min TTL | Change infrequently |
| **Collections** | KV cache, 15 min TTL | Change infrequently |
| **Search suggestions** | KV cache, 1 hour TTL | Change infrequently |
| **Popular searches** | KV cache, 1 hour TTL | Change infrequently |
| **User profile** | React Query, 5 min TTL | Personal data |
| **Cart** | React Query, 0 min TTL (always fresh) | Real-time |

### 9.10 Performance Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Render mega menu on page load | Unnecessary weight | Lazy load on hover |
| Fetch search on every keystroke | Excessive API calls | Debounce 300ms |
| Animate layout properties | Triggers reflow, janky | Use transform/opacity |
| No skeleton loading | Content jumps in | Show skeletons |
| Inline styles for animation | Not GPU-accelerated | Use CSS classes |
| Synchronous menu fetch | Blocks rendering | Async + cache |
| No image dimensions | Layout shift | Always specify |
| Heavy footer on mobile | Slow initial load | Simplify on mobile |

---

## 10. CMS Integration

### 10.1 What

How header and footer content is managed through the admin CMS — enabling non-technical administrators to modify navigation, links, menus, and footer content without code changes.

### 10.2 Why

- **Autonomy:** Admins modify navigation without developer involvement.
- **Flexibility:** Menus change with business needs.
- **Speed:** Navigation updates are instant.
- **A/B testing:** Test different menu structures.
- **Seasonal:** Promote seasonal collections and sales.

### 10.3 Where

Admin CMS → Navigation Manager → Header menus, Footer links, Mega menu content.

### 10.4 Dynamic Menu Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMS NAVIGATION MANAGEMENT                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ADMIN CMS                                                │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  Navigation Manager                               │    │   │
│  │  │  ├── Header Menu Items (desktop nav)              │    │   │
│  │  │  ├── Mobile Menu Items (drawer)                   │    │   │
│  │  │  ├── Mega Menu Content                            │    │   │
│  │  │  ├── Footer Columns                               │    │   │
│  │  │  └── Promotional Banners                          │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  API / KV CACHE                                           │   │
│  │  Menu structure stored in database, cached in KV          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FRONTEND                                                 │   │
│  │  Fetches menu on mount, renders dynamically              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 10.5 Menu Ordering

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Admin configurable** | Drag-and-drop reordering | Flexibility |
| **Default order** | Alphabetical or by creation date | Sensible default |
| **Position support** | Left, center, right for header | Layout control |
| **Priority field** | Numeric priority for ordering | Fine control |
| **Bulk reorder** | Select multiple, move up/down | Efficiency |

### 10.6 Visibility Controls

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Show/hide toggle** | Per menu item | Quick control |
| **Date-based** | Schedule start/end dates | Seasonal promotions |
| **Role-based** | Show to specific user roles | Personalization |
| **Device-based** | Show on mobile only, desktop only, or both | Device optimization |
| **A/B test** | Show variant A or B | Optimization |

### 10.7 Icons

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Optional** | Icons are not required | Flexibility |
| **Library** | Lucide icons (consistent with platform) | Consistency |
| **Size** | 16px (sm) or 20px (md) | Consistent |
| **Position** | Left of label | Standard |
| **Custom** | Upload custom SVG (future) | Brand flexibility |

### 10.8 Nested Menus

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max depth** | 3 levels | Prevent complexity |
| **Parent items** | Can be links or just labels | Flexibility |
| **Children** | Always links | Navigation |
| **Expand/collapse** | On mobile, accordion pattern | Space efficiency |
| **Desktop** | Mega menu for 2+ levels | Visual hierarchy |
| **Max children** | 10 per parent | Readability |

### 10.9 Future Expansion

| Feature | Description | Priority |
|---------|-------------|----------|
| **A/B testing** | Test different menu structures | High |
| **Analytics** | Track menu item clicks | High |
| **Personalization** | Show different menus per user segment | Medium |
| **Multi-language** | Menu items in multiple languages | Medium |
| **Scheduled changes** | Auto-publish menu changes on date | Medium |
| **Menu templates** | Pre-built menu structures | Low |
| **Import/export** | Menu structure import/export | Low |

### 10.10 CMS Menu Data Structure

```typescript
interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  target?: '_self' | '_blank';
  rel?: string;
  children?: MenuItem[];
  isActive: boolean;
  isVisible: boolean;
  position: 'left' | 'center' | 'right';
  priority: number;
  showOnMobile: boolean;
  showOnDesktop: boolean;
  showOnDate?: string;
  hideOnDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface FooterSection {
  id: string;
  title: string;
  items: MenuItem[];
  priority: number;
  isActive: boolean;
}

interface NavigationConfig {
  headerItems: MenuItem[];
  mobileMenuItems: MenuItem[];
  megaMenuContent: {
    categories: Category[];
    featured: FeaturedItem[];
  };
  footerSections: FooterSection[];
  newsletter: {
    headline: string;
    description: string;
    placeholder: string;
    buttonText: string;
  };
  socialLinks: SocialLink[];
  updatedAt: string;
}
```

---

## 11. UX Requirements

### 11.1 What

UX standards that every navigation interaction must meet — ensuring the navigation system is not just functional but delightful, intuitive, and premium.

### 11.2 Why

- **Trust:** Consistent, predictable navigation builds confidence.
| **Efficiency:** Users accomplish goals with minimal effort.
| **Delight:** Premium interactions reinforce brand perception.
| **Accessibility:** Every user can navigate effortlessly.

### 11.3 Where

Every navigation interaction, every page, every device.

### 11.4 Minimize Clicks

| Rule | Standard | Rationale |
|------|----------|-----------|
| **3 taps to any goal** | Any page reachable in 3 taps on mobile | Efficiency |
| **2 taps to search results** | Tap search → type → see results | Speed |
| **2 taps to cart** | Tap cart icon → view cart | Speed |
| **1 tap to home** | Tap logo | Speed |
| **1 tap to search** | Tap search icon | Speed |
| **1 tap to account** | Tap account icon | Speed |

### 11.5 Reduce Cognitive Load

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Familiar patterns** | Use standard navigation conventions | No learning curve |
| **Clear labels** | "Shop" not "Browse Products" | Intuitive |
| **Visual hierarchy** | Primary items larger/bolder | Focus |
| **White space** | Generous spacing between items | Clarity |
| **Progressive disclosure** | Show only what's needed | Don't overwhelm |
| **Consistent placement** | Same position everywhere | Predictable |

### 11.6 Encourage Exploration

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Featured collections** | Highlight curated content | Discovery |
| **Mega menu** | Show subcategories visually | Browse |
| **Search suggestions** | Popular searches, trending | Inspiration |
| **Related products** | Cross-sell on product pages | Discovery |
| **New arrivals** | Prominent placement | Freshness |
| **Sale** | Visible but not aggressive | Value |

### 11.7 Never Confuse Beginners

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Clear labels** | Descriptive, not technical | Understandable |
| **Helpful placeholders** | "Search products..." | Guidance |
| **Visible states** | Active, hover, focus clearly marked | Orientation |
| **Error prevention** | Confirm before destructive actions | Safety |
| **Help available** | Support link in footer | Assistance |
| **No jargon** | "Cart" not "Shopping Session" | Plain language |

### 11.8 Feel Predictable

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Consistent behavior** | Same action, same result | Predictable |
| **No surprises** | No unexpected navigation changes | Trust |
| **Browser back works** | Always respect history | Expectation |
| **Logo links home** | Always | Anchor |
| **Cart badge updates** | Immediately on add | Feedback |
| **Active state clear** | Obvious current page | Orientation |

### 11.9 Remain Visually Calm

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimal chrome** | No heavy borders, no busy backgrounds | Premium |
| **Generous white space** | Navigation breathes | Calm |
| **Subtle animations** | Smooth, not flashy | Elegant |
| **Neutral colors** | neutral-700 for text, neutral-200 for borders | Calm |
| **Brand accents** | brand-500 for active/hover only | Focused |
| **No clutter** | Every element earns its place | Clean |

### 11.10 Support One-Handed Mobile Usage

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Bottom nav** | Primary actions at thumb reach | Ergonomics |
| **Large touch targets** | 44x44px minimum | Ease |
| **Thumb zone** | Primary CTAs in bottom 40% | Comfort |
| **Swipe gestures** | Natural interactions | Intuitive |
| **No top-heavy actions** | Primary actions not at top | One-handed |
| **Reachable search** | Bottom nav search icon | Comfort |

### 11.11 Maintain Consistency

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Same header everywhere** | Identical on all storefront pages | Consistent |
| **Same footer everywhere** | Identical on all storefront pages | Consistent |
| **Same bottom nav** | Same 5 items, same order | Muscle memory |
| **Same back behavior** | Always goes to previous page | Predictable |
| **Same search** | Same behavior on all pages | Familiar |
| **Same account menu** | Same items, same order | Familiar |
| **Same active state** | brand-500 color everywhere | Consistent |

### 11.12 Navigation UX Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Navigation changes between pages | Confusing | Consistent navigation |
| Hidden back button | Users feel trapped | Always visible on mobile |
| No loading indicators | Users think it's broken | Show spinners/skeletons |
| No empty states | Blank screens confuse | Show helpful guidance |
| No error recovery | Users get stuck | Clear error messages + retry |
| No orientation cues | Users get lost | Active states, breadcrumbs |
| Too many options | Decision paralysis | Progressive disclosure |
| Inconsistent placement | Confusing | Same position everywhere |
| No visual feedback | Actions feel uncertain | Immediate visual response |
| Aggressive popups | Annoying, not premium | Subtle, dismissible |

---

## 12. Component Location Reference

### 12.1 What

Exact file locations for every navigation component, ensuring developers and AI agents know where to find, create, and modify navigation code.

### 12.2 Where

Every navigation-related component in the codebase.

### 12.3 Navigation Component Files

| Component | File Location | Layer | Responsibility |
|-----------|---------------|-------|----------------|
| **Header** | `src/shared/layout/Header.tsx` | Composition | Top navigation bar |
| **Footer** | `src/shared/layout/Footer.tsx` | Composition | Bottom links and info |
| **BottomNav** | `src/shared/layout/BottomNav.tsx` | Composition | Mobile bottom navigation |
| **MobileNav** | `src/shared/layout/MobileNav.tsx` | Composition | Mobile drawer menu |
| **MegaMenu** | `src/shared/layout/MegaMenu.tsx` | Composition | Desktop mega menu |
| **Layout** | `src/shared/layout/Layout.tsx` | Template | Page layout wrapper |
| **Sidebar** | `src/shared/layout/Sidebar.tsx` | Composition | Dashboard sidebar |
| **AdminLayout** | `src/features/admin/layout/AdminLayout.tsx` | Template | Admin page layout |
| **Breadcrumbs** | `src/shared/ui/Breadcrumbs.tsx` | Primitive | Breadcrumb navigation |
| **DropdownMenu** | `src/shared/ui/DropdownMenu.tsx` | Primitive | Dropdown menus |
| **Tabs** | `src/shared/ui/Tabs.tsx` | Primitive | Tab navigation |
| **Pagination** | `src/shared/ui/Pagination.tsx` | Primitive | Page navigation |
| **SearchInput** | `src/shared/ui/SearchInput.tsx` | Primitive | Search input component |
| **SkipToContent** | `src/shared/feedback/SkipToContent.tsx` | Feedback | Accessibility skip link |

### 12.4 Hook Files

| Hook | File Location | Responsibility |
|------|---------------|----------------|
| **useNavigation** | `src/shared/layout/hooks/useNavigation.ts` | Navigation state |
| **useSearch** | `src/features/search/hooks/useSearch.ts` | Search functionality |
| **useMediaQuery** | `src/lib/hooks/useMediaQuery.ts` | Responsive detection |
| **useScrollDirection** | `src/lib/hooks/useScrollDirection.ts` | Scroll behavior |
| **useClickOutside** | `src/lib/hooks/useClickOutside.ts` | Menu dismissal |
| **useFocusTrap** | `src/lib/hooks/useFocusTrap.ts` | Accessibility |
| **useKeyboardNavigation** | `src/lib/hooks/useKeyboardNavigation.ts` | Keyboard support |

### 12.5 Store Files

| Store | File Location | Responsibility |
|-------|---------------|----------------|
| **ui-store** | `src/stores/ui-store.ts` | UI state (sidebar, modals, drawers) |
| **auth-store** | `src/stores/auth-store.ts` | Auth state (session, user) |

### 12.6 Type Files

| Types | File Location | Responsibility |
|-------|---------------|----------------|
| **Navigation types** | `src/types/navigation.ts` | NavItem, MenuConfig, etc. |
| **User types** | `src/types/user.ts` | User, Profile, Role |

---

## 13. Mandatory Rules for AI Agents

### 13.1 What

Hard rules that every AI agent must follow when designing, implementing, or reviewing navigation components.

### 13.2 Why

- **Consistency:** No exceptions to the rules.
- **Quality:** Every navigation interaction meets the standard.
- **Maintainability:** Predictable patterns.

### 13.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Mobile-first** | Design for mobile first, enhance for desktop | 70%+ traffic |
| **Bottom nav on mobile** | Primary navigation at bottom of screen | One-handed usage |
| **Max 5 bottom nav items** | Never exceed 5 tabs | Thumb-friendly |
| **Max 7 desktop nav items** | Never exceed 7 top nav items | Decision paralysis |
| **Search always visible** | Search icon always accessible in header | Discoverability |
| **Cart always visible** | Cart icon always accessible in header | Commerce |
| **Account always visible** | Account icon always accessible | Personalization |
| **Logo links home** | Always | Navigation anchor |
| **Active state** | Always show current page | Orientation |
| **44px touch targets** | Minimum touch target size | Accessibility |
| **Keyboard navigable** | All navigation accessible via keyboard | Accessibility |
| **ARIA labels** | On all icon-only buttons | Screen readers |
| **Skip link** | First element in DOM | Accessibility |
| **No hardcoded menus** | Menus from CMS or config | Maintainability |
| **Consistent order** | Same nav order everywhere | Muscle memory |
| **Backdrop blur** | On sticky header scroll | Premium feel |
| **Safe area padding** | For bottom nav on notched phones | Device compatibility |
| **Reduced motion** | Honor prefers-reduced-motion | Accessibility |
| **No horizontal scroll** | Content stays within viewport | UX |
| **Max 3 menu levels** | Never nest deeper | Prevent complexity |

### 13.4 Soft Rules

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **Transparent header** | On hero pages | Landing pages |
| **Shrink header** | Reduce height on scroll | Long pages |
| **Mega menu** | For complex category navigation | Desktop only |
| **Back to top button** | On long-scroll pages | UX improvement |
| **Newsletter in footer** | Always include newsletter signup | Engagement |
| **Social links in footer** | Always include social icons | Engagement |
| **Trust signals** | Payment icons, badges in footer | Trust |
| **Promotional banner** | Above header for sales/promos | When relevant |

### 13.5 Agent Decision Framework

When implementing any navigation component, agent must ask:

1. **Is this mobile-first?** — Would this work on a 375px screen?
2. **Is this accessible?** — Can a keyboard-only user navigate this?
3. **Is this clear?** — Would a first-time user understand this?
4. **Is this consistent?** — Does this match existing navigation patterns?
5. **Is this minimal?** — Can any element be removed?
6. **Is this persistent?** — Is primary navigation always visible?
7. **Is this recoverable?** — Can the user always go back?
8. **Is this performant?** — Will this load fast and animate smoothly?
9. **Is this CMS-manageable?** — Can an admin modify this without code?
10. **Is this responsive?** — Does this work on every screen size?

### 13.6 Code Standards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No default exports** | Named exports only | Better refactoring |
| **forwardRef** | All navigation primitives use forwardRef | Composability |
| **displayName** | Set on all components | DevTools debugging |
| **No business logic** | Components are pure UI | Separation of concerns |
| **No API calls** | Components receive data via props | Testability |
| **No Zustand imports** | Shared components use props | Flexibility |
| **No feature imports** | Shared components can't import from features | Prevents circular deps |
| **Responsive by default** | Components work on all sizes | Mobile-first |
| **Accessible by default** | ARIA, keyboard, contrast | WCAG compliance |
| **No hardcoded values** | Use design tokens | Maintainability |

---

**Document Version:** 1.0
**Last Updated:** August 03, 2026
**Next Review:** September 03, 2026
