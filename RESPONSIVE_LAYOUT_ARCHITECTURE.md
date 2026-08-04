# নবME (Nabome) — Responsive Layout & Page Framework Architecture

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for layout architecture, page frameworks, and responsive behavior  
> **Supersedes:** None — complements DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), COMPONENT_LIBRARY_ARCHITECTURE.md (v1.0), UX_ARCHITECTURE.md (v1.0), ARCHITECTURE.md (v3.0), FOLDER_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Layout Philosophy](#1-layout-philosophy)
2. [Application Shell](#2-application-shell)
3. [Viewport & Safe Area Handling](#3-viewport--safe-area-handling)
4. [Container System](#4-container-system)
5. [Responsive Grid System](#5-responsive-grid-system)
6. [Spacing Hierarchy](#6-spacing-hierarchy)
7. [Breakpoint System](#7-breakpoint-system)
8. [Global Layout Patterns](#8-global-layout-patterns)
9. [Page Framework Standards](#9-page-framework-standards)
10. [Dashboard Framework](#10-dashboard-framework)
11. [Scrolling Architecture](#11-scrolling-architecture)
12. [Content Organization Patterns](#12-content-organization-patterns)
13. [Responsive Behavior Rules](#13-responsive-behavior-rules)
14. [Mobile Optimization](#14-mobile-optimization)
15. [Tablet Optimization](#15-tablet-optimization)
16. [Desktop Optimization](#16-desktop-optimization)
17. [Layout Metrics & Constraints](#17-layout-metrics--constraints)
18. [Accessibility in Layouts](#18-accessibility-in-layouts)
19. [Performance in Layouts](#19-performance-in-layouts)
20. [Mandatory Rules for AI Agents](#20-mandatory-rules-for-ai-agents)

---

## 1. Layout Philosophy

### 1.1 What

The foundational principles that govern every spatial decision across the Nabome platform — how elements occupy space, relate to each other, and adapt across devices.

### 1.2 Why

- **Cognitive ease:** Consistent spatial patterns reduce mental effort
- **Trust:** Predictable layouts feel professional and reliable
- **Efficiency:** Users learn the layout once, apply everywhere
- **Scalability:** New pages compose from existing spatial patterns
- **Brand:** Premium spacing communicates luxury

### 1.3 Where

Every pixel of space between, around, and within elements on every page.

### 1.4 Core Layout Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Content-first** | Layout serves content, never decorates it | White space is deliberate, not accidental |
| **One page, one rhythm** | Every page shares the same spatial DNA | Consistent spacing scale, container widths, section gaps |
| **Breathing room** | Generous white space signals premium | Never cram — always pad, always separate |
| **Visual hierarchy through space** | More space = less related, less space = more related | Proximity groups, separation divides |
| **Mobile is the canvas** | Desktop extends mobile, never replaces it | Base styles for 375px, enhance upward |
| **No spatial surprises** | Same element, same space, every context | Tokens, not magic numbers |

### 1.5 Layout DNA

```
┌─────────────────────────────────────────────────────────────────┐
│                    NABOME LAYOUT DNA                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    APPLE                                   │   │
│  │  • Consistent spacing rhythm                              │   │
│  │  • Content breathes in generous white space               │   │
│  │  • Every element has deliberate position                  │   │
│  │  • Typography scales with viewport                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          +                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ZARA                                    │   │
│  │  • Editorial full-bleed layouts                           │   │
│  │  • Bold imagery with generous margins                     │   │
│  │  • Minimal chrome, maximum content                        │   │
│  │  • Grid precision at every scale                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          =                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    NABOME                                  │   │
│  │  • Mobile-first, thumb-friendly                           │   │
│  │  • Premium spacing, never cramped                         │   │
│  │  • One visual rhythm across every screen                  │   │
│  │  • Layout adapts, personality never changes               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Cramped layouts | Feels cheap, not premium | Generous white space |
| Inconsistent margins | Visual noise, unprofessional | Use spacing tokens |
| Fixed-width layouts | Breaks on different screens | Responsive containers |
| Centered everything | No visual hierarchy | Left-aligned content, centered hero |
| Equal spacing everywhere | No grouping, no hierarchy | Proximity-based spacing |
| Desktop-first layout | 70%+ mobile traffic suffers | Mobile-first responsive |
| Full-width content on wide screens | Unreadable line lengths | Max-width containers |

---

## 2. Application Shell

### 2.1 What

The outermost structural wrapper that defines how the entire application occupies the viewport — the frame within which all pages render.

### 2.2 Why

- **Consistency:** Every page has the same outer structure
- **Orientation:** Header and navigation are always present
- **Scrolling:** Content scrolls within a defined area
- **Performance:** Shell renders once, pages swap inside

### 2.3 Where

Every page in the application.

### 2.4 Shell Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION SHELL                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HEADER (fixed, z-100)                                    │   │
│  │  Height: 56px mobile | 64px tablet | 80px desktop         │   │
│  │  Logo | Navigation | Search | Cart | Account              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MAIN CONTENT (scrollable)                                │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  Page content renders here                          │  │   │
│  │  │  Inside container: max-width 1280px, centered       │  │   │
│  │  │  Padding: 16px mobile | 24px tablet | 32px desktop  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BOTTOM NAV (mobile only, fixed bottom, z-100)           │   │
│  │  Height: 64px + safe area inset                           │   │
│  │  Home | Shop | Search | Cart | Account                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FOOTER (desktop only)                                    │   │
│  │  Below main content, full width                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Shell Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Header fixed** | Always visible on scroll | Navigation always accessible |
| **Header z-index** | `z-sticky` (100) | Above page content, below modals |
| **Main scrollable** | `overflow-y: auto` on main | Content scrolls independently |
| **Bottom nav fixed** | Always at viewport bottom | Thumb-friendly navigation |
| **Bottom nav z-index** | `z-sticky` (100) | Above page content |
| **Safe area padding** | Bottom nav accounts for device insets | Prevents content overlap |
| **No horizontal scroll** | `overflow-x: hidden` on shell | Prevents broken layouts |
| **Scroll snap** | Not on shell — on specific containers | Only where appropriate |

### 2.6 Shell Components Location

| Component | File Location | Responsibility |
|-----------|---------------|----------------|
| **AppShell** | `src/shared/layout/AppShell.tsx` | Outermost wrapper, viewport handling |
| **Header** | `src/shared/layout/Header.tsx` | Top navigation bar |
| **Footer** | `src/shared/layout/Footer.tsx` | Bottom links and information |
| **BottomNav** | `src/shared/layout/BottomNav.tsx` | Mobile bottom navigation |
| **Sidebar** | `src/shared/layout/Sidebar.tsx` | Dashboard/admin side navigation |

---

## 3. Viewport & Safe Area Handling

### 3.1 What

How the layout responds to viewport dimensions, device notches, safe areas, and system UI elements.

### 3.2 Why

- **Modern devices:** Notched phones, rounded corners, system gestures
- **PWA support:** Standalone mode has different safe areas
- **Accessibility:** Zoom and text scaling must not break layouts
- **Consistency:** Content never overlaps system UI

### 3.3 Where

Every page, every viewport condition.

### 3.4 Viewport Configuration

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Meta viewport** | `width=device-width, initial-scale=1` | Standard responsive behavior |
| **No maximum-scale** | Allow user zoom | Accessibility |
| **No minimum-scale** | Allow pinch-to-zoom out | Accessibility |
| **CSS env()** | Use `env(safe-area-inset-*)` | Device-specific safe areas |
| **Dynamic viewport** | Use `dvh` for full-height sections | Correct mobile viewport |

### 3.5 Safe Area Rules

| Area | Standard | Implementation |
|------|----------|----------------|
| **Top (notch)** | `env(safe-area-inset-top)` | Header padding-top in standalone PWA |
| **Bottom (home indicator)** | `env(safe-area-inset-bottom)` | Bottom nav padding-bottom |
| **Left (landscape notch)** | `env(safe-area-inset-left)` | Content padding in landscape |
| **Right (landscape notch)** | `env(safe-area-inset-right)` | Content padding in landscape |

### 3.6 Safe Area Implementation

```css
/* ✓ CORRECT: Safe area padding for bottom navigation */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0px);
  height: calc(64px + env(safe-area-inset-bottom, 0px));
}

/* ✓ CORRECT: Safe area padding for header in PWA standalone */
.header-pwa {
  padding-top: env(safe-area-inset-top, 0px);
}

/* ✓ CORRECT: Content safe area in landscape */
@media (orientation: landscape) {
  .content-area {
    padding-left: env(safe-area-inset-left, 0px);
    padding-right: env(safe-area-inset-right, 0px);
  }
}
```

### 3.7 Viewport Handling Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **100dvh for hero** | Use `dvh` not `vh` | Correct height on mobile (accounts for browser chrome) |
| **No fixed height on body** | Let content determine height | Content varies per page |
| **Overflow-x hidden** | On html and body | Prevent horizontal scroll |
| **Scroll-behavior smooth** | On html | Smooth anchor navigation |
| **Text size adjust** | `-webkit-text-size-adjust: 100%` | Prevent iOS text inflation |

### 3.8 Common Viewport Mistakes

| Mistake | Why It's Wrong | Correct Approach |
|---------|----------------|------------------|
| Using `vh` on mobile | Browser chrome causes jump | Use `dvh` |
| Ignoring safe areas | Content hidden behind notch/home indicator | Use `env()` insets |
| Disabling zoom | Accessibility violation | Allow user zoom |
| Fixed viewport width | Breaks responsive design | Use `device-width` |
| No PWA safe area handling | Content overlaps in standalone mode | Test in standalone mode |

---

## 4. Container System

### 4.1 What

Standard container widths, padding, and centering behavior for content across all breakpoints.

### 4.2 Why

- **Readable line length:** Content width constrained for readability
- **Consistent margins:** Same container everywhere
- **Alignment:** Content aligns across pages
- **Premium feel:** Generous padding signals quality

### 4.3 Where

Every page, every content section, every component that contains text or grid content.

### 4.4 Container Specifications

| Container | Max Width | Padding | Usage | Tailwind |
|-----------|-----------|---------|-------|----------|
| **Narrow** | 640px | 16px / 24px / 32px | Forms, single-column content | `max-w-screen-sm mx-auto px-4 sm:px-6 lg:px-8` |
| **Default** | 1280px | 16px / 24px / 32px | Most page content | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| **Wide** | 1440px | 16px / 24px / 32px | Hero sections, full-bleed editorial | `max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8` |
| **Full** | 100% | 16px / 24px / 32px | Background sections, full-width heroes | `w-full px-4 sm:px-6 lg:px-8` |

### 4.5 Container Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max width 1280px** | Default container | Readable line length (~75 chars) |
| **Max width 1440px** | Editorial/hero sections | Premium full-bleed feel |
| **Always centered** | `mx-auto` on containers | Symmetrical layout |
| **Responsive padding** | 16px → 24px → 32px | More space on larger screens |
| **No full-width text** | Always inside container | Readability on wide screens |
| **Consistent padding** | Same padding across all containers | Visual rhythm |

### 4.6 Container Examples

```tsx
// ✓ CORRECT: Default page container
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Page content */}
</div>

// ✓ CORRECT: Narrow form container
<div className="mx-auto max-w-screen-sm px-4 sm:px-6 lg:px-8">
  <LoginForm />
</div>

// ✓ CORRECT: Full-width background with centered content
<div className="w-full bg-brand-50 py-16 sm:py-20 lg:py-24">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* Content inside full-width section */}
  </div>
</div>

// ✓ CORRECT: Editorial hero (wider container)
<div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
  <HeroSection />
</div>

// ✗ WRONG: No container on wide screens
<div className="w-full">
  <p>This text will be unreadable at 2560px</p>
</div>
```

---

## 5. Responsive Grid System

### 5.1 What

The column-based grid system that structures page layouts across all breakpoints.

### 5.2 Why

- **Alignment:** Content stays aligned across sections
- **Responsiveness:** Layout adapts to screen size
- **Consistency:** Same grid everywhere
- **Simplicity:** Tailwind utilities make grids easy

### 5.3 Where

All page layouts, product grids, dashboard layouts, card arrangements.

### 5.4 Grid Specifications

| Breakpoint | Columns | Gutter | Margin | Tailwind Classes |
|------------|---------|--------|--------|------------------|
| **Mobile** (< 640px) | 4 | 16px | 16px | `grid grid-cols-4 gap-4` |
| **Tablet** (640px - 1023px) | 8 | 24px | 24px | `sm:grid-cols-8 sm:gap-6` |
| **Desktop** (1024px - 1279px) | 12 | 32px | 32px | `lg:grid-cols-12 lg:gap-8` |
| **Wide** (1280px+) | 12 | 32px | 32px | `xl:grid-cols-12 xl:gap-8` |

### 5.5 Grid Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **4 columns mobile** | 2-column product grids, stacked content | Thumb-friendly, readable |
| **8 columns tablet** | 3-4 column grids, sidebar + content | Medium screen optimization |
| **12 columns desktop** | Complex layouts, multi-column | Full layout flexibility |
| **Consistent gutters** | Same gutter across a page section | Visual harmony |
| **No gutter on edges** | Use container padding, not grid gutter | Clean edges |
| **Responsive nesting** | Nested grids adapt to parent | Flexible compositions |

### 5.6 Common Grid Patterns

#### Product Grid

| Breakpoint | Columns | Gap | Product Cards Per Row |
|------------|---------|-----|----------------------|
| **Mobile** | 2 | 12px | 2 |
| **Tablet** | 3 | 16px | 3 |
| **Desktop** | 4 | 24px | 4 |

```tsx
// ✓ CORRECT: Responsive product grid
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

#### Dashboard Stats Grid

| Breakpoint | Columns | Gap |
|------------|---------|-----|
| **Mobile** | 2 | 12px |
| **Tablet** | 2 | 16px |
| **Desktop** | 4 | 24px |

```tsx
// ✓ CORRECT: Stats grid
<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
  <StatisticCard label="Revenue" value="₹12,345" />
  <StatisticCard label="Orders" value="156" />
  <StatisticCard label="Customers" value="89" />
  <StatisticCard label="Products" value="234" />
</div>
```

#### Sidebar + Content Layout

| Breakpoint | Layout | Sidebar |
|------------|--------|---------|
| **Mobile** | Stacked (full-width) | Hidden (drawer) |
| **Tablet** | Stacked or 2-column | Collapsible |
| **Desktop** | 2-column (280px sidebar + content) | Visible |

```tsx
// ✓ CORRECT: Dashboard layout
<div className="flex min-h-screen">
  <Sidebar className="hidden lg:block lg:w-[280px] lg:flex-shrink-0" />
  <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
    {children}
  </main>
</div>
```

### 5.7 Grid Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Fixed pixel widths | Breaks on different screens | Use grid columns with responsive classes |
| No gap between items | Cramped, unreadable | Use gap utilities |
| Equal columns on all sizes | Mobile too cramped | Responsive column counts |
| Full-width grid on wide screens | Items stretch too wide | Constrain with max-width container |
| Nesting grids too deep | Complexity, maintainability | Max 2 levels of nesting |

---

## 6. Spacing Hierarchy

### 6.1 What

The consistent spacing scale used for margins, padding, gaps, and all spatial relationships.

### 6.2 Why

- **Visual rhythm:** Consistent spacing creates harmony
- **Proximity:** Related items closer, unrelated items farther
- **Readability:** Proper whitespace improves comprehension
- **Maintainability:** Tokens prevent magic numbers

### 6.3 Where

Every margin, padding, gap, and spatial relationship in the application.

### 6.4 Spacing Scale

| Token | Value | Tailwind | Usage Context |
|-------|-------|----------|---------------|
| `space-0` | 0px | `p-0`, `m-0`, `gap-0` | No spacing |
| `space-0.5` | 2px | `p-0.5`, `m-0.5`, `gap-0.5` | Tightest inline spacing |
| `space-1` | 4px | `p-1`, `m-1`, `gap-1` | Icon to text, label to input |
| `space-1.5` | 6px | `p-1.5`, `m-1.5`, `gap-1.5` | Small inline gaps |
| `space-2` | 8px | `p-2`, `m-2`, `gap-2` | Inline spacing, small padding |
| `space-3` | 12px | `p-3`, `m-3`, `gap-3` | Component inner padding |
| `space-4` | 16px | `p-4`, `m-4`, `gap-4` | Card padding, form spacing |
| `space-5` | 20px | `p-5`, `m-5`, `gap-5` | Comfortable padding |
| `space-6` | 24px | `p-6`, `m-6`, `gap-6` | Section padding, card gaps |
| `space-8` | 32px | `p-8`, `m-8`, `gap-8` | Large section spacing |
| `space-10` | 40px | `p-10`, `m-10`, `gap-10` | Section breaks |
| `space-12` | 48px | `p-12`, `m-12`, `gap-12` | Major section breaks |
| `space-16` | 64px | `p-16`, `m-16`, `gap-16` | Page-level spacing |
| `space-20` | 80px | `p-20`, `m-20`, `gap-20` | Hero section padding |
| `space-24` | 96px | `p-24`, `m-24`, `gap-24` | Large hero spacing |
| `space-32` | 128px | `p-32`, `m-32`, `gap-32` | Maximum spacing |

### 6.5 Spacing Rules by Context

| Context | Mobile | Tablet | Desktop | Tailwind Pattern |
|---------|--------|--------|---------|------------------|
| **Inline (icon-text)** | 4px | 4px | 4px | `gap-1` |
| **Label to input** | 4px | 4px | 4px | `mt-1` |
| **Between form fields** | 16px | 16px | 16px | `space-y-4` |
| **Card inner padding** | 16px | 20px | 24px | `p-4 sm:p-5 lg:p-6` |
| **Between cards (grid gap)** | 12px | 16px | 24px | `gap-3 sm:gap-4 lg:gap-6` |
| **Section spacing** | 48px | 64px | 80px | `py-12 sm:py-16 lg:py-20` |
| **Page top/bottom padding** | 24px | 32px | 48px | `pt-6 sm:pt-8 lg:pt-12` |
| **Container side padding** | 16px | 24px | 32px | `px-4 sm:px-6 lg:px-8` |

### 6.6 Proximity Principle

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROXIMITY PRINCIPLE                            │
│                                                                  │
│  RELATED items → CLOSE together (gap-2 to gap-4)                │
│  ┌─────────────┐                                                 │
│  │  Label       │ ← 4px gap                                     │
│  │  [Input   ]  │ ← 4px gap                                     │
│  │  Helper text │                                                │
│  └─────────────┘                                                 │
│                                                                  │
│  UNRELATED items → FAR apart (gap-8 to gap-12)                  │
│  ┌─────────────┐                                                 │
│  │  Form Section A  │                                            │
│  └─────────────┘                                                 │
│         ↑ 32px gap                                               │
│  ┌─────────────┐                                                 │
│  │  Form Section B  │                                            │
│  └─────────────┘                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.7 Spacing Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Magic numbers (`13px`, `17px`) | Inconsistent, unmaintainable | Use spacing tokens |
| Equal spacing everywhere | No visual hierarchy | Use proximity principle |
| No spacing between sections | Content bleeds together | Use section spacing tokens |
| Inconsistent card padding | Visual noise | Same padding per card type |
| Tight spacing on mobile | Touch targets too close | Minimum 8px between targets |

---

## 7. Breakpoint System

### 7.1 What

The standard viewport width breakpoints that trigger layout changes across the platform.

### 7.2 Why

- **Consistency:** Same breakpoints everywhere
- **Predictability:** Developers know when styles apply
- **Mobile-first:** Base styles for mobile, enhanced for larger
- **Alignment with DESIGN_SYSTEM_ARCHITECTURE.md:** Same values

### 7.3 Where

All responsive styles, all layout decisions, all component adaptations.

### 7.4 Breakpoint Definitions

| Name | Min Width | Max Width | Tailwind Prefix | Target Device |
|------|-----------|-----------|-----------------|---------------|
| **Mobile** | 0px | 639px | (none) | Phones |
| **Tablet** | 640px | 1023px | `sm:` | Tablets, large phones |
| **Desktop** | 1024px | 1279px | `md:` | Laptops |
| **Wide** | 1280px | — | `lg:` | Desktops, monitors |

### 7.5 Breakpoint Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile-first** | Base styles = mobile | 70%+ traffic is mobile |
| **Progressive enhancement** | Add styles for larger screens | Better UX |
| **No mobile breakpoints above lg** | Don't add `xl:`, `2xl:` prefixes | Keep it simple |
| **Test at breakpoints** | Verify layout at each breakpoint | Consistency |
| **Content determines breakpoints** | Break where content needs it | Natural adaptation |

### 7.6 Breakpoint Usage Patterns

```tsx
// ✓ CORRECT: Mobile-first responsive
<div className="
  grid grid-cols-2 gap-3          /* Mobile: 2 columns */
  sm:grid-cols-3 sm:gap-4         /* Tablet: 3 columns */
  lg:grid-cols-4 lg:gap-6         /* Desktop: 4 columns */
">

// ✓ CORRECT: Show/hide per breakpoint
<div className="hidden sm:block">   {/* Hidden on mobile, visible on tablet+ */}
<div className="block lg:hidden">   {/* Visible on mobile/tablet, hidden on desktop */}

// ✓ CORRECT: Responsive typography
<h1 className="text-3xl sm:text-4xl lg:text-5xl">

// ✓ CORRECT: Responsive spacing
<section className="py-12 sm:py-16 lg:py-20">
```

### 7.7 Breakpoint Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Desktop-first (`@media (min-width: 1024px)`) | Mobile users get wrong styles | Use Tailwind mobile-first |
| Too many breakpoints | Complexity, maintenance burden | Use only sm, md, lg |
| Pixel-perfect at every breakpoint | Wasted effort | Focus on breakpoints where layout changes |
| Ignoring tablet | Medium screens get bad layout | Always consider tablet |

---

## 8. Global Layout Patterns

### 8.1 What

Standard layout patterns used across the entire platform for common page structures.

### 8.2 Why

- **Consistency:** Same patterns everywhere
- **Predictability:** Users know where to find things
- **Efficiency:** Developers reuse patterns
- **Maintainability:** Changes apply uniformly

### 8.3 Where

Every page in the application.

### 8.4 Layout Pattern Catalog

#### Pattern 1: Single Column (Centered)

```
┌──────────────────────────────────────────────────────┐
│                      HEADER                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│            ┌──────────────────────┐                  │
│            │                      │                  │
│            │   Centered Content   │                  │
│            │   Max-width: 640px   │                  │
│            │                      │                  │
│            └──────────────────────┘                  │
│                                                      │
├──────────────────────────────────────────────────────┤
│                      FOOTER                           │
└──────────────────────────────────────────────────────┘
```

**Usage:** Login, register, forgot password, settings forms, single-column content.

**Rules:**
- Max-width: 640px (Narrow container)
- Centered with `mx-auto`
- Consistent vertical padding

#### Pattern 2: Two Column (Sidebar + Content)

```
┌──────────────────────────────────────────────────────┐
│                      HEADER                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────┐  ┌──────────────────────────────────┐   │
│  │        │  │                                    │   │
│  │ Sidebar│  │         Main Content               │   │
│  │ 280px  │  │                                    │   │
│  │        │  │                                    │   │
│  └────────┘  └──────────────────────────────────┘   │
│                                                      │
├──────────────────────────────────────────────────────┤
│                      FOOTER                           │
└──────────────────────────────────────────────────────┘
```

**Usage:** Account pages, admin dashboard, product detail (images + info).

**Rules:**
- Sidebar: 280px fixed width (desktop), hidden on mobile (drawer)
- Content: flex-1, scrollable
- Mobile: Stacked (sidebar becomes full-width menu or drawer)

#### Pattern 3: Grid (Equal Items)

```
┌──────────────────────────────────────────────────────┐
│                      HEADER                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  Item  │ │  Item  │ │  Item  │ │  Item  │       │
│  │   1    │ │   2    │ │   3    │ │   4    │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  Item  │ │  Item  │ │  Item  │ │  Item  │       │
│  │   5    │ │   6    │ │   7    │ │   8    │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│                                                      │
├──────────────────────────────────────────────────────┤
│                      FOOTER                           │
└──────────────────────────────────────────────────────┘
```

**Usage:** Product listings, category pages, search results.

**Rules:**
- 2 columns mobile, 3 tablet, 4 desktop
- Consistent gap between items
- Items wrap to next row

#### Pattern 4: Hero + Content

```
┌──────────────────────────────────────────────────────┐
│                      HEADER                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                                │   │
│  │              HERO SECTION                      │   │
│  │         Full-width, 80vh mobile               │   │
│  │              100vh desktop                     │   │
│  │                                                │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │              Content Section                   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
├──────────────────────────────────────────────────────┤
│                      FOOTER                           │
└──────────────────────────────────────────────────────┘
```

**Usage:** Homepage, landing pages, collection pages.

**Rules:**
- Hero: Full-width, constrained height
- Hero content: Centered, max-width container
- Content below: Standard container

#### Pattern 5: Dashboard (Sidebar + Scrollable Content)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ┌────────┐  ┌──────────────────────────────────┐   │
│  │        │  │  TOP BAR (search, notifications)  │   │
│  │        │  ├──────────────────────────────────┤   │
│  │ Sidebar│  │                                    │   │
│  │ 280px  │  │         Dashboard Content          │   │
│  │        │  │         (scrollable)               │   │
│  │        │  │                                    │   │
│  └────────┘  └──────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Usage:** Admin dashboard, shop dashboard.

**Rules:**
- Sidebar: Fixed, 280px, collapsible to 64px (icon-only)
- Top bar: 64px height, sticky
- Content: Scrollable, padded
- Mobile: Sidebar becomes drawer overlay

#### Pattern 6: Full-Width Background with Centered Content

```
┌──────────────────────────────────────────────────────┐
│                      HEADER                           │
├──────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░  ┌──────────────────────────────────────────┐  ░░░│
│░░  │          Centered Content                 │  ░░░│
│░░  │          Max-width: 1280px                │  ░░░│
│░░  └──────────────────────────────────────────┘  ░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├──────────────────────────────────────────────────────┤
│                      FOOTER                           │
└──────────────────────────────────────────────────────┘
```

**Usage:** Featured sections, testimonials, CTAs, newsletter.

**Rules:**
- Background: Full-width color/image
- Content: Centered, max-width 1280px
- Padding: Generous (py-16 to py-24)

---

## 9. Page Framework Standards

### 9.1 What

Standard page structures for every page type in the platform, defining which layout pattern to use, what sections to include, and how to organize content.

### 9.2 Why

- **Consistency:** Same page type → same structure
- **Predictability:** Users know where to find information
- **Efficiency:** New pages compose from templates
- **Maintainability:** Changes to a page type apply everywhere

### 9.3 Where

Every route in the application.

### 9.4 Page Framework Catalog

#### 9.4.1 Public Pages (Storefront)

##### Homepage

| Section | Pattern | Priority | Height |
|---------|---------|----------|--------|
| **Header** | Fixed top | Always visible | 56px / 80px |
| **Hero** | Full-width background | First viewport | 80vh mobile / 100vh desktop |
| **Featured Collection** | Grid (2-4 items) | Below hero | Auto |
| **New Arrivals** | Product grid | Second section | Auto |
| **Categories** | Category grid | Third section | Auto |
| **Best Sellers** | Product grid | Fourth section | Auto |
| **Blog/Editorial** | Card grid | Fifth section | Auto |
| **Footer** | Full-width | Bottom | Auto |
| **Bottom Nav** | Fixed bottom (mobile) | Always visible | 64px + safe area |

##### Product Listing Page (Category/Collection)

| Section | Pattern | Priority |
|---------|---------|----------|
| **Header** | Fixed top | Always visible |
| **Breadcrumb** | Below header | Orientation |
| **Page Title** | Below breadcrumb | Identification |
| **Filter Bar** | Horizontal (mobile: bottom sheet) | Refinement |
| **Product Grid** | 2-col mobile / 3 tablet / 4 desktop | Main content |
| **Pagination** | Below grid | Navigation |
| **Footer** | Bottom | Completeness |

##### Product Detail Page

| Section | Pattern | Priority |
|---------|---------|----------|
| **Header** | Fixed top | Always visible |
| **Breadcrumb** | Below header | Orientation |
| **Product Images** | Carousel (mobile) / Gallery (desktop) | First viewport |
| **Product Info** | Right column (desktop) / Below images (mobile) | First viewport |
| **Description** | Below info | Details |
| **Reviews** | Below description | Social proof |
| **Related Products** | Product grid | Cross-sell |
| **Footer** | Bottom | Completeness |

##### Cart Page

| Section | Pattern | Priority |
|---------|---------|----------|
| **Header** | Fixed top | Always visible |
| **Cart Items** | List with quantity controls | Main content |
| **Order Summary** | Right column (desktop) / Sticky bottom (mobile) | Always visible |
| **Empty State** | Centered illustration + CTA | When empty |

##### Checkout Page

| Section | Pattern | Priority |
|---------|---------|----------|
| **Header** | Minimal (logo + secure badge) | Trust |
| **Stepper** | Top, horizontal | Progress |
| **Contact Info** | First form section | Required |
| **Shipping Address** | Second form section | Required |
| **Shipping Method** | Third form section | Required |
| **Payment** | Fourth form section | Required |
| **Order Summary** | Right column (desktop) / Collapsible (mobile) | Always visible |
| **Place Order** | Full-width CTA | Conversion |

##### Search Results Page

| Section | Pattern | Priority |
|---------|---------|----------|
| **Header** | Fixed top with active search | Always visible |
| **Search Input** | Prominent, auto-focused | Primary action |
| **Active Filters** | Horizontal chips | Refinement |
| **Sort** | Dropdown, top-right | Organization |
| **Results Grid** | Product grid | Main content |
| **Empty State** | "No results" + suggestions | When no results |

#### 9.4.2 Authentication Pages

##### Login Page

| Section | Pattern | Priority |
|---------|---------|----------|
| **Header** | Minimal (logo only) | Brand |
| **Form** | Single column, max-width 400px | Centered |
| **Social Login** | Below form | Alternative |
| **Register Link** | Below form | Registration |

##### Register Page

| Section | Pattern | Priority |
|---------|---------|----------|
| **Header** | Minimal (logo only) | Brand |
| **Form** | Single column, max-width 400px | Centered |
| **Terms** | Below form | Legal |
| **Login Link** | Below form | Existing users |

#### 9.4.3 Account Pages

| Page | Layout | Sidebar |
|------|--------|---------|
| **Account Overview** | Welcome + quick actions + recent orders | Mobile: list / Desktop: sidebar |
| **Profile** | Single column form | Mobile: list / Desktop: sidebar |
| **Orders** | List with status | Mobile: list / Desktop: sidebar |
| **Order Detail** | Full detail view | Mobile: list / Desktop: sidebar |
| **Addresses** | List + add/edit | Mobile: list / Desktop: sidebar |
| **Wishlist** | Product grid | Mobile: list / Desktop: sidebar |
| **Settings** | Single column form | Mobile: list / Desktop: sidebar |

#### 9.4.4 Admin Dashboard Pages

| Page | Layout | Sidebar |
|------|--------|---------|
| **Dashboard** | Stats + charts + tables | Always visible (collapsible) |
| **Products** | Table with actions | Always visible |
| **Product Create/Edit** | Form (full-width) | Always visible |
| **Orders** | Table with filters | Always visible |
| **Order Detail** | Detail view + timeline | Always visible |
| **Customers** | Table with search | Always visible |
| **Categories** | Tree/table | Always visible |
| **Settings** | Tabbed form | Always visible |

#### 9.4.5 CMS Pages

| Page | Layout | Container |
|------|--------|-----------|
| **About** | Editorial (hero + content) | Wide |
| **Contact** | Two column (info + form) | Default |
| **FAQ** | Accordion list | Narrow |
| **Terms** | Single column text | Narrow |
| **Privacy** | Single column text | Narrow |

#### 9.4.6 Error Pages

| Page | Layout | Content |
|------|--------|---------|
| **404** | Centered | Illustration + message + CTA |
| **500** | Centered | Illustration + message + CTA |
| **403** | Centered | Illustration + message + CTA |
| **Offline** | Centered | Illustration + message |

### 9.5 Page Framework Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One primary purpose** | Each page has one clear goal | Focus |
| **Consistent header** | Same header on all pages of same type | Orientation |
| **Consistent footer** | Same footer on all public pages | Completeness |
| **Breadcrumb on deep pages** | Always on category, product, account pages | Orientation |
| **Empty states** | Every list page has an empty state | Guidance |
| **Loading states** | Every data-dependent page has skeletons | Perceived performance |
| **Error boundaries** | Every page wrapped in error boundary | Resilience |
| **Back button** | Always visible on mobile sub-pages | Navigation |

---

## 10. Dashboard Framework

### 10.1 What

The layout framework for admin and shop dashboard pages, including sidebar, header, content area, and widget placement.

### 10.2 Why

- **Efficiency:** Dashboard users need quick access to data
- **Organization:** Information is logically grouped
- **Consistency:** Same dashboard patterns everywhere
- **Scalability:** New metrics and features fit existing layout

### 10.3 Where

Admin dashboard, shop dashboard, analytics pages.

### 10.4 Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    DASHBOARD LAYOUT                               │
│                                                                  │
│  ┌──────────┐  ┌────────────────────────────────────────────┐   │
│  │          │  │  TOP BAR                                     │   │
│  │          │  │  ┌────────────────────┐ ┌────────────────┐  │   │
│  │          │  │  │  Page Title         │ │ Search | Notif │  │   │
│  │          │  │  └────────────────────┘ └────────────────┘  │   │
│  │ SIDEBAR  │  ├────────────────────────────────────────────┤   │
│  │          │  │                                              │   │
│  │ 280px    │  │  DASHBOARD CONTENT (scrollable)             │   │
│  │          │  │  ┌──────────────────────────────────────┐  │   │
│  │  Nav     │  │  │  Stats Cards (4 across)               │  │   │
│  │  Items   │  │  ├──────────────────────────────────────┤  │   │
│  │          │  │  │  Charts (2 across)                     │  │   │
│  │          │  │  ├──────────────────────────────────────┤  │   │
│  │          │  │  │  Tables (full width)                   │  │   │
│  │          │  │  └──────────────────────────────────────┘  │   │
│  └──────────┘  └────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 10.5 Dashboard Sidebar Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Width** | 280px expanded, 64px collapsed | Consistent |
| **Position** | Fixed left | Always accessible |
| **Height** | Full viewport height | Complete navigation |
| **Scrollable** | Overflow-y auto | Many nav items |
| **Active state** | Brand color background + text | Clear orientation |
| **Collapsible** | Toggle button in top bar | Screen real estate |
| **Mobile** | Drawer overlay (not inline) | Space efficiency |
| **Sections** | Grouped with labels | Organization |
| **Icons** | Always visible (even collapsed) | Identification |
| **Badges** | Notification counts on items | Information |

### 10.6 Dashboard Top Bar Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Height** | 64px | Consistent |
| **Position** | Sticky top | Always accessible |
| **Left** | Page title + breadcrumb | Orientation |
| **Right** | Search, notifications, profile | Quick access |
| **Z-index** | Above sidebar content | Layering |
| **Border** | Bottom border (neutral-200) | Separation |

### 10.7 Dashboard Content Area Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Padding** | 24px (consistent) | Breathing room |
| **Max width** | None (uses full available space) | Data density |
| **Scroll** | Vertical scroll | Long content |
| **Background** | neutral-50 | Subtle contrast |
| **Section spacing** | 24px between sections | Visual hierarchy |

### 10.8 Dashboard Widget Placement

| Widget Type | Grid | Width | Priority |
|-------------|------|-------|----------|
| **Statistic card** | 4 across | Equal width | Top of page |
| **Chart** | 2 across | Equal width | Below stats |
| **Table** | Full width | 100% | Below charts |
| **Quick actions** | Inline or sidebar | Variable | Top-right |

### 10.9 Dashboard Table Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Sticky header** | Table header sticks on scroll | Context |
| **Row hover** | Subtle background change | Interactivity |
| **Responsive** | Horizontal scroll on mobile | Overflow handling |
| **Actions** | Right-aligned, consistent | Predictability |
| **Empty state** | "No items" with CTA | Guidance |
| **Loading** | Skeleton rows | Perceived performance |
| **Pagination** | Below table, right-aligned | Navigation |
| **Bulk actions** | Checkbox column + action bar | Efficiency |

### 10.10 Dashboard Form Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Layout** | Single column or two-column (desktop) | Readability |
| **Max width** | 720px for single column | Readable line length |
| **Section spacing** | 32px between form sections | Visual grouping |
| **Field spacing** | 16px between fields | Comfortable |
| **Submit** | Sticky bottom bar on mobile | Always accessible |
| **Cancel** | Top-right or bottom-left | Recovery |
| **Auto-save** | Draft saved automatically | Don't lose work |

---

## 11. Scrolling Architecture

### 11.1 What

How content scrolls across the application — vertical scrolling, horizontal scrolling, sticky elements, fixed elements, and scroll behavior.

### 11.2 Why

- **Navigation:** Users find content efficiently
- **Context:** Sticky elements maintain orientation
- **Performance:** Efficient scrolling prevents jank
- **UX:** Scroll restoration prevents disorientation

### 11.3 Where

Every scrollable page and container.

### 11.4 Vertical Scrolling Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Page scroll** | Full page scrolls vertically | Standard behavior |
| **No horizontal scroll on page** | `overflow-x: hidden` on body | Prevents broken layouts |
| **Smooth scroll** | `scroll-behavior: smooth` on html | Smooth anchor navigation |
| **Scroll restoration** | Scroll position saved on navigation | Don't lose place |
| **Content determines height** | No fixed page height | Flexible |

### 11.5 Horizontal Scrolling Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile carousels** | Horizontal scroll with snap | Touch-friendly browsing |
| **Mobile tabs** | Scrollable tab bar | Many tabs |
| **Desktop** | Avoid horizontal scroll | Full-width content |
| **Admin tables** | Horizontal scroll wrapper | Data overflow |
| **Snap points** | `scroll-snap-type: x mandatory` | Clean landing |
| **Fade indicators** | Gradient fade at edges | Discoverability |

```tsx
// ✓ CORRECT: Horizontal scroll carousel with snap
<div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
  {items.map((item) => (
    <div key={item.id} className="w-[280px] flex-shrink-0 snap-start">
      {/* Card content */}
    </div>
  ))}
</div>

// ✓ CORRECT: Scrollable tabs on mobile
<div className="flex gap-4 overflow-x-auto scrollbar-hide">
  {tabs.map((tab) => (
    <button key={tab.id} className="flex-shrink-0 whitespace-nowrap pb-2">
      {tab.label}
    </button>
  ))}
</div>
```

### 11.6 Sticky Elements

| Element | Behavior | z-index | When |
|---------|----------|---------|------|
| **Header** | Sticky top | `z-sticky` (100) | All pages |
| **Dashboard top bar** | Sticky top | `z-sticky` (100) | Dashboard only |
| **Table header** | Sticky top | `z-base` (0) | When scrolling table |
| **Product CTA** | Sticky bottom (mobile) | `z-sticky` (100) | Product detail on scroll |
| **Filter bar** | Sticky below header | `z-base` (0) | Product listing |

### 11.7 Fixed Elements

| Element | Position | z-index | When |
|---------|----------|---------|------|
| **Bottom nav** | Fixed bottom | `z-sticky` (100) | Mobile only |
| **Modal backdrop** | Fixed, full viewport | `z-modal` (200) | When modal open |
| **Toast** | Fixed top-right | `z-toast` (300) | When toast visible |
| **Tooltip** | Fixed, near trigger | `z-tooltip` (400) | When tooltip visible |

### 11.8 Scroll Restoration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Back navigation** | Restore scroll position | Don't lose place |
| **Tab switching** | Maintain scroll position | Don't reset |
| **Infinite scroll** | Append, don't replace | Continuity |
| **Page refresh** | Scroll to top | Fresh start |
| **Anchor links** | Scroll to element, offset for header | Don't hide behind header |

### 11.9 Infinite Scroll vs Pagination

| Context | Pattern | Rationale |
|---------|---------|-----------|
| **Product listings** | Load more button | User control |
| **Search results** | Load more button | User control |
| **Admin tables** | Numbered pagination | Data precision |
| **Feed/timeline** | Infinite scroll | Content discovery |
| **Order history** | Numbered pagination | Reference |

### 11.10 Scroll Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Horizontal page scroll | Broken layout on wide screens | `overflow-x: hidden` |
| No scroll restoration | Users lose place on back | Implement scroll restoration |
| Infinite scroll on admin tables | Hard to reference specific rows | Use numbered pagination |
| Sticky elements without offset | Content hidden behind sticky | Add top padding/margin |
| Smooth scroll on everything | Performance impact, disorienting | Only on anchor links |

---

## 12. Content Organization Patterns

### 12.1 How

Standard patterns for organizing different types of content across the platform.

### 12.2 Where

Every content-heavy section of the application.

### 12.3 Hero Sections

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Height** | 80vh mobile, 100vh desktop | First viewport impact |
| **Background** | Full-width image or video | Premium feel |
| **Content** | Centered, max-width 720px | Readable headline |
| **CTA** | One primary button | Clear action |
| **Text color** | White on dark bg / dark on light bg | Contrast |
| **Overlay** | Dark overlay on images | Text readability |
| **Mobile** | Shorter height, stacked content | Space efficiency |

### 12.4 Cards

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Border radius** | `radius-lg` (12px) | Modern, friendly |
| **Padding** | 16px mobile / 20px tablet / 24px desktop | Breathing room |
| **Border** | 1px neutral-100 | Subtle separation |
| **Shadow** | `shadow-subtle` default, `shadow-card` on hover | Depth, interactivity |
| **Hover** | Shadow elevation + slight translate | Interactive feedback |
| **Max width** | None (fills grid column) | Responsive |
| **Image** | Aspect ratio enforced (3:4 product, 16:9 content) | Consistency |

### 12.5 Lists

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Item spacing** | 0 (border separation) or gap-3 (space separation) | Clean |
| **Dividers** | 1px neutral-200 horizontal line | Clear separation |
| **Padding** | 16px horizontal, 12-16px vertical | Touch-friendly |
| **Active state** | Brand-50 background | Clear selection |
| **Hover** | Neutral-50 background | Interactive feedback |

### 12.6 Tables

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Header** | Neutral-50 background, font-semibold | Clear header |
| **Row height** | 48px minimum | Touch-friendly |
| **Cell padding** | 12px-16px | Readable |
| **Border** | 1px neutral-200 between rows | Separation |
| **Hover** | Neutral-50 background | Interactive feedback |
| **Sticky header** | Sticky on scroll | Context |
| **Responsive** | Horizontal scroll wrapper on mobile | Overflow |

### 12.7 Forms

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single column** | One field per row | Mobile-friendly |
| **Max width** | 480px (simple) / 720px (complex) | Readable |
| **Field spacing** | 16px between fields | Comfortable |
| **Label to input** | 4px | Tight association |
| **Section spacing** | 32px between sections | Visual grouping |
| **Submit button** | Full-width on mobile, auto on desktop | Thumb-friendly |
| **Error placement** | Below input, red text | Clear association |

### 12.8 Product Grids

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Columns** | 2 mobile / 3 tablet / 4 desktop | Responsive |
| **Gap** | 12px mobile / 16px tablet / 24px desktop | Breathing room |
| **Card aspect** | 3:4 for product images | Fashion standard |
| **Skeleton** | Match card shape while loading | Perceived performance |
| **Load more** | Button at bottom | User control |

### 12.9 Category Grids

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Columns** | 2 mobile / 3-4 desktop | Responsive |
| **Aspect** | 1:1 (square) | Consistent |
| **Image** | Cover, rounded corners | Premium |
| **Overlay** | Category name, bottom-left | Clear identification |
| **Hover** | Scale effect | Interactive feedback |

### 12.10 CMS Blocks

| Block Type | Max Width | Padding | Usage |
|------------|-----------|---------|-------|
| **Text block** | 720px | Standard | Articles, descriptions |
| **Image block** | 100% (full-width) | None | Hero images, banners |
| **Two-column** | 1280px | Standard | Side-by-side content |
| **Quote block** | 720px | Standard | Testimonials |
| **Feature grid** | 1280px | Standard | Feature highlights |

---

## 13. Responsive Behavior Rules

### 13.1 What

How specific UI elements adapt across breakpoints.

### 13.2 Where

Every interactive and display element.

### 13.3 Images

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Fluid** | `max-width: 100%` | Don't overflow container |
| **Aspect ratio** | Enforced via `aspect-*` classes | Consistent |
| **Lazy loading** | `loading="lazy"` below fold | Performance |
| **Object fit** | `object-cover` for fixed sizes | No distortion |
| **Responsive srcSet** | Cloudinary auto-format | Performance |
| **Placeholder** | Neutral-50 background while loading | No layout shift |
| **Skeleton** | Match image dimensions | Perceived performance |

### 13.4 Videos

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Fluid** | `max-width: 100%` | Don't overflow container |
| **Aspect ratio** | 16:9 standard | Consistent |
| **Poster** | Show thumbnail before play | Faster load |
| **Lazy load** | Don't autoplay below fold | Performance |
| **Mobile** | Reduce quality if possible | Bandwidth |

### 13.5 Typography

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Responsive sizing** | `text-3xl sm:text-4xl lg:text-5xl` | Scale with viewport |
| **Max line length** | 65-75 characters | Readability |
| **Line height** | 1.5-1.6 for body | Readability |
| **No size below 12px** | Minimum 0.75rem | Accessibility |
| **No size above 96px** | Maximum 6rem | Readability |

### 13.6 Buttons

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Full width on mobile** | `w-full` for primary actions | Thumb-friendly |
| **Min height** | 40px (md), 48px (lg) | Touch-friendly |
| **Min width** | 44px | Touch target |
| **Icon spacing** | gap-2 (8px) | Comfortable |
| **Loading state** | Spinner replaces text | Feedback |

### 13.7 Navigation

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Primary nav** | Bottom bar (5 items) | Top nav | Top nav |
| **Secondary nav** | Hamburger menu | Top nav | Mega menu |
| **Back button** | Top-left arrow | Top-left arrow | Top-left arrow |
| **Search** | Header icon → expand | Header expandable | Header expandable |
| **Cart** | Header icon + badge | Header link + badge | Header link + badge |
| **Account** | Header icon → dropdown | Header dropdown | Header dropdown |

### 13.8 Tables

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile** | Horizontal scroll wrapper | Data overflow |
| **Tablet** | Reduced columns or scroll | Medium screen |
| **Desktop** | Full table | Full experience |
| **Sticky header** | Always | Context |
| **Row actions** | Inline or dropdown | Efficiency |

### 13.9 Forms

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile** | Single column, full-width inputs | Touch-friendly |
| **Tablet** | Single or two-column | Space available |
| **Desktop** | Two-column possible | Efficiency |
| **Submit button** | Full-width on mobile | Thumb-friendly |
| **Keyboard** | Avoid covering inputs | Visible labels |

### 13.10 Dialogs & Drawers

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Modal** | Full-screen | Centered, max 560px | Centered, max 560px |
| **Drawer** | Full-width from right | 400px from right | 400px from right |
| **Bottom sheet** | Full-width, 80% height | Centered modal | Centered modal |
| **Toast** | Top, full-width | Top-right, 400px | Top-right, 400px |

### 13.11 Empty States

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Centered** | Vertically and horizontally | Focus |
| **Illustration** | Simple, on-brand | Delight |
| **Message** | Clear, helpful | Guidance |
| **CTA** | One primary action | Direction |
| **Compact** | Not too tall | Respectful |

---

## 14. Mobile Optimization

### 14.1 What

Layout rules specific to mobile devices, ensuring one-handed usage, thumb reachability, and optimal mobile experience.

### 14.2 Why

- **70%+ traffic** is mobile
- **Thumb zone** is the primary interaction area
- **One-handed usage** is the norm
- **Screen real estate** is precious

### 14.3 Thumb Zone Layout

```
┌─────────────────────────────────┐
│           HARD TO REACH          │
│  ┌───────────────────────────┐  │
│  │  Header actions (search,  │  │
│  │  account) — reach when    │  │
│  │  needed, not frequent     │  │
│  └───────────────────────────┘  │
│                                  │
│           MEDIUM REACH           │
│  ┌───────────────────────────┐  │
│  │  Content area — scroll    │  │
│  │  and read, less active    │  │
│  │  interaction              │  │
│  └───────────────────────────┘  │
│                                  │
│           EASY TO REACH          │
│  ┌───────────────────────────┐  │
│  │  Bottom nav — primary     │  │
│  │  navigation, always       │  │
│  │  accessible               │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  FAB / Primary CTA —     │  │
│  │  most important action    │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### 14.4 Mobile Layout Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Bottom navigation** | Fixed, 5 items max | Thumb-friendly |
| **Primary CTA** | Bottom-fixed when important | Reachable |
| **Back button** | Top-left, always visible | Predictable |
| **No hover states** | Touch-only interactions | Mobile-first |
| **Touch targets** | Minimum 44x44px | Accessibility |
| **Spacing between targets** | Minimum 8px | Prevent miss-taps |
| **Full-width buttons** | Primary actions span width | Thumb-friendly |
| **Stacked layouts** | One column | Space efficiency |
| **Swipe gestures** | Natural for carousels, lists | Familiar |
| **Bottom sheets** | For filters, options | Reachable |

### 14.5 Mobile Keyboard Avoidance

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Input focus scroll** | Scroll input into view above keyboard | Visibility |
| **Fixed bottom CTA** | Not covered by keyboard | Accessibility |
| **Viewport resize** | Handle virtual keyboard | Layout stability |
| **Input type** | Use correct `type` for keyboard | Correct keyboard |

### 14.6 Mobile Safe Touch Areas

| Area | Standard | Rationale |
|------|----------|-----------|
| **Bottom nav items** | 44px minimum height | Touch target |
| **Header actions** | 44px minimum hit area | Touch target |
| **List items** | 48px minimum height | Touch target |
| **Cards** | Entire card tappable (if navigable) | Large target |
| **Remove buttons** | Swipe-to-reveal or long-press | Prevent accidents |

### 14.7 Mobile Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Hover-dependent UI | No hover on touch | Touch states |
| Tiny touch targets (< 44px) | Miss-taps, frustration | Minimum 44px |
| Top navigation on mobile | Hard to reach | Bottom navigation |
| Multi-column forms | Too cramped | Single column |
| Horizontal scroll on page | Broken layout | `overflow-x: hidden` |
| Fixed layouts | Don't adapt | Responsive units |

---

## 15. Tablet Optimization

### 15.1 What

Layout rules specific to tablet devices (640px - 1023px), optimizing for medium screens in both portrait and landscape.

### 15.2 Why

- **Growing segment:** Tablets are increasingly popular
- **More space:** Medium screens deserve enhanced layouts
- **Orientation changes:** Portrait and landscape must both work
- **Touch-primary:** Still touch-first, not mouse-first

### 15.3 Tablet Layout Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Top navigation** | Horizontal nav bar (like desktop) | Space available |
| **Grid columns** | 3-4 columns for product grids | Medium optimization |
| **Sidebar** | Optional (collapsible or hidden) | Space varies |
| **Forms** | Single or two-column | Space available |
| **Tables** | Full table (no horizontal scroll needed) | Space available |
| **Container padding** | 24px | More space than mobile |

### 15.4 Tablet Portrait vs Landscape

| Aspect | Portrait | Landscape |
|--------|----------|-----------|
| **Navigation** | Top nav | Top nav |
| **Grid** | 3 columns | 4 columns |
| **Sidebar** | Hidden or collapsed | Visible |
| **Content width** | ~768px | ~1024px |
| **Typography** | Tablet scale | Desktop scale |

### 15.5 Tablet Split Layout

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Product detail** | Image left, info right | Use space |
| **Dashboard** | Sidebar + content | Full experience |
| **Account** | Sidebar + content | Full experience |
| **Checkout** | Form left, summary right | Efficiency |

---

## 16. Desktop Optimization

### 16.1 What

Layout rules specific to desktop/laptop screens (1024px+), optimizing for large screens with mouse/keyboard input.

### 16.2 Why

- **Productivity:** Desktop users expect efficiency
- **More space:** Full layout potential
- **Keyboard:** Full keyboard navigation support
- **Mouse:** Hover states available

### 16.3 Desktop Layout Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max content width** | 1280px (default), 1440px (editorial) | Readable line length |
| **Sidebar** | 280px fixed (dashboard) | Always visible |
| **Top navigation** | Full nav with mega menu | Complete navigation |
| **Grid columns** | 4+ for product grids | Full experience |
| **Hover states** | All interactive elements | Mouse interaction |
| **Keyboard shortcuts** | `/` for search, `ESC` for close | Power users |
| **Multi-panel** | Sidebar + content + detail | Productivity |

### 16.4 Desktop Multi-Panel Layouts

| Layout | Panels | Usage |
|--------|--------|-------|
| **Two-panel** | Sidebar (280px) + Content (flex) | Dashboard, settings |
| **Three-panel** | Sidebar (280px) + List (320px) + Detail (flex) | Email, orders |
| **Split view** | 50/50 or 40/60 | Product compare, checkout |

### 16.5 Desktop Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Stretched content | Unreadable on wide screens | Max-width container |
| No hover states | Wasted desktop affordance | Add hover interactions |
| Mobile-width content | Wasted space | Use available space |
| Ignoring keyboard | Power users frustrated | Full keyboard support |

---

## 17. Layout Metrics & Constraints

### 17.1 What

Hard numeric constraints for layout decisions.

### 17.2 Where

Every layout decision.

### 17.3 Maximum Content Width

| Context | Max Width | Tailwind | Rationale |
|---------|-----------|----------|-----------|
| **Default content** | 1280px | `max-w-7xl` | Readable line length |
| **Editorial content** | 1440px | `max-w-[1440px]` | Premium full-bleed |
| **Forms** | 480px | `max-w-screen-sm` | Focused input |
| **Article text** | 720px | `max-w-prose` | Optimal reading |
| **Dashboard** | 100% | — | Use full available space |

### 17.4 Minimum Touch Targets

| Element | Minimum Size | Standard |
|---------|-------------|----------|
| **Buttons** | 40px height × 44px width | WCAG 2.2 |
| **Icon buttons** | 44px × 44px | WCAG 2.2 |
| **List items** | 48px height | Material Design |
| **Checkboxes/Radios** | 44px × 44px hit area | WCAG 2.2 |
| **Links in text** | 44px height (line-height) | WCAG 2.2 |

### 17.5 Responsive Spacing Summary

| Context | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Container padding** | 16px | 24px | 32px |
| **Section vertical padding** | 48px | 64px | 80px |
| **Card padding** | 16px | 20px | 24px |
| **Grid gap** | 12px | 16px | 24px |
| **Form field spacing** | 16px | 16px | 16px |
| **Between sections** | 48px | 64px | 80px |

### 17.6 Alignment Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Text alignment** | Left-aligned (default) | Readability (LTR) |
| **Center alignment** | Headlines, CTAs, hero content | Focus |
| **Right alignment** | Numbers, prices (optional) | Scanning |
| **Grid alignment** | Left-aligned grid items | Clean edges |
| **Vertical alignment** | Top-aligned in grids | Consistent |

### 17.7 Overflow Handling

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Page level** | `overflow-x: hidden` | No horizontal scroll |
| **Text overflow** | `text-ellipsis` with `line-clamp` | Clean truncation |
| **Long words** | `overflow-wrap: break-word` | Prevent overflow |
| **Images** | `overflow: hidden` on container | Respect boundaries |
| **Tables** | Horizontal scroll wrapper on mobile | Data access |

### 17.8 Content Density

| Density Level | Usage | Padding | Font Size |
|---------------|-------|---------|-----------|
| **Compact** | Admin tables, data-heavy | 8px-12px | 13-14px |
| **Default** | Most content | 16px | 14-16px |
| **Comfortable** | Consumer-facing, product pages | 20-24px | 16px |
| **Spacious** | Hero sections, CTAs | 32-48px | 18-20px |

---

## 18. Accessibility in Layouts

### 18.1 What

Layout-specific accessibility requirements ensuring all users can navigate and interact with the layout.

### 18.2 Where

Every layout, every page, every interactive element.

### 18.3 Screen Zoom

| Rule | Standard | Rationale |
|------|----------|-----------|
| **200% zoom** | Layout must work at 200% zoom | WCAG 1.4.4 |
| **Reflow** | No horizontal scroll at 320px CSS width | WCAG 1.4.10 |
| **Text resize** | Layout adapts to 200% text size | WCAG 1.4.4 |
| **No fixed heights** | Content determines height | Prevents overflow |

### 18.4 Keyboard Navigation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical, follows visual flow | WCAG 2.4.3 |
| **Focus visible** | Clear focus ring on all interactive elements | WCAG 2.4.7 |
| **No keyboard trap** | Always able to escape modals/menus | WCAG 2.1.2 |
| **Skip link** | "Skip to main content" as first element | WCAG 2.4.1 |
| **Focus management** | Focus moves to modal on open, returns on close | WCAG 2.4.3 |

### 18.5 Focus Visibility

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Focus ring** | 2px brand-500, 2px offset | Visible on all backgrounds |
| **Contrast** | 3:1 minimum against background | WCAG 2.4.7 |
| **Consistent** | Same focus style everywhere | Predictable |
| **Not removed** | Never `outline: none` without replacement | Accessibility |

### 18.6 Responsive Readability

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Line length** | 65-75 characters max | Readability |
| **Line height** | 1.5-1.6 for body text | Readability |
| **Paragraph spacing** | 1em between paragraphs | Visual separation |
| **No justified text** | Left-aligned | Readability |

### 18.7 Reduced Motion

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Honor prefers-reduced-motion** | Disable non-essential animations | WCAG 2.3.3 |
| **No auto-playing animation** | User controls playback | Accessibility |
| **No flashing** | Nothing flashes > 3 times/second | Seizure prevention |
| **Essential animation** | Keep layout-affecting transitions | Functionality |

### 18.8 Large Text Support

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Layout adapts** | Text containers expand | Don't clip |
| **No fixed-height containers** | Use min-height or auto | Accommodate |
| **Overflow handling** | Scroll or expand | Don't hide |

---

## 19. Performance in Layouts

### 19.1 What

Layout-specific performance requirements ensuring fast, stable rendering.

### 19.2 Where

Every layout decision, every component render.

### 19.3 Layout Stability (CLS Prevention)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No layout shift** | CLS < 0.1 | WCAG / Core Web Vitals |
| **Reserve space** | Set width/height on images | Prevents shift |
| **Skeleton loading** | Match content dimensions | Prevents shift |
| **Font loading** | `font-display: optional` | Prevents shift |
| **Ad insertion** | Reserve space for ads | Prevents shift |
| **Dynamic content** | Use min-height for containers | Prevents shift |

### 19.4 Fast Rendering

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Critical CSS** | Inline critical styles | Faster FCP |
| **Lazy load** | Images below fold | Faster initial load |
| **Code splitting** | Route-level lazy loading | Faster initial load |
| **Minimal DOM** | Don't render hidden elements | Faster paint |
| **CSS containment** | Use `contain` where possible | Faster repaint |

### 19.5 Layout Performance Patterns

| Pattern | Performance Impact | Optimization |
|---------|-------------------|--------------|
| **CSS Grid** | Excellent | Use for page layouts |
| **Flexbox** | Excellent | Use for component layouts |
| **CSS transforms** | GPU-accelerated | Use for animations |
| **CSS `contain`** | Limits repaint scope | Use on independent sections |
| **`will-change`** | Hint for GPU optimization | Use sparingly for animations |

### 19.6 Performance Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Rendering all products at once | Slow initial load | Virtualize or paginate |
| No skeleton loading | Layout shift, poor perceived performance | Show skeletons |
| Blocking fonts | Delayed text render | `font-display: swap` or `optional` |
| Large DOM trees | Slow rendering | Minimize DOM depth |
| Layout-triggering animations | Jank, CLS | Use transform/opacity only |

---

## 20. Mandatory Rules for AI Agents

### 20.1 What

Hard rules that every AI agent must follow when designing, implementing, or reviewing layouts.

### 20.2 Why

- **Consistency:** No exceptions to the rules
- **Quality:** Every layout meets the standard
- **Maintainability:** Predictable patterns
- **Accessibility:** Everyone can use the platform

### 20.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Mobile-first** | Design for 375px, enhance for larger | 70%+ traffic suffers |
| **Container max-width** | Default 1280px, always centered | Unreadable on wide screens |
| **Spacing tokens only** | Never use arbitrary pixel values | Inconsistent spacing |
| **No horizontal scroll** | `overflow-x: hidden` on body | Broken mobile layout |
| **Touch targets 44px** | Minimum on all interactive elements | Accessibility violation |
| **Safe area handling** | Use `env(safe-area-inset-*)` | Content behind notch |
| **Accessible focus** | Visible focus ring on all interactive elements | Keyboard users lost |
| **Reduced motion** | Honor `prefers-reduced-motion` | Vestibular disorders |
| **No layout shift** | Reserve space, use skeletons | CLS > 0.1 |
| **Consistent containers** | Same container widths everywhere | Visual inconsistency |
| **Consistent spacing** | Same spacing scale everywhere | Visual noise |
| **No full-width text** | Always inside container | Unreadable on wide screens |
| **No fixed page height** | Content determines height | Overflow clipping |
| **No hover-only UI** | Touch-first interactions | Mobile users excluded |
| **One primary action** | One CTA per viewport section | Decision paralysis |
| **Empty states** | Every list has an empty state | Blank screens |
| **Loading states** | Every data page has skeletons | Layout shift |
| **Error boundaries** | Every page wrapped | Blank screen on error |

### 20.4 Soft Rules

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **Generous white space** | Premium feel | Always |
| **Visual rhythm** | Consistent spacing | Always |
| **Progressive disclosure** | Show only what's needed | Complex interfaces |
| **Dark mode readiness** | Use CSS variables | All new components |
| **i18n readiness** | Logical properties for RTL | All new layouts |
| **Performance** | Lazy load, skeleton, code split | All new features |

### 20.5 Agent Decision Framework

When implementing any layout, the agent must ask:

1. **Is this mobile-first?** — Does it work on 375px?
2. **Is this container-constrained?** — Is max-width set for wide screens?
3. **Is spacing consistent?** — Are tokens used, not magic numbers?
4. **Is it accessible?** — Can keyboard/screen reader users navigate?
5. **Is it stable?** — Will there be layout shift?
6. **Is it performant?** — Will it render fast?
7. **Is it maintainable?** — Can another developer understand it?
8. **Is it scalable?** — Can new content fit without redesign?

### 20.6 Layout Checklist

Before completing any layout task, verify:

- [ ] Mobile-first responsive at all breakpoints (375px, 640px, 1024px, 1280px+)
- [ ] Container max-width applied (1280px default)
- [ ] Spacing uses tokens (no magic numbers)
- [ ] Touch targets ≥ 44px
- [ ] Safe area insets handled
- [ ] No horizontal scroll
- [ ] Focus ring visible on interactive elements
- [ ] Empty state defined for lists
- [ ] Loading skeleton defined for data pages
- [ ] Error boundary wraps page
- [ ] `prefers-reduced-motion` honored
- [ ] CLS reserved space for dynamic content
- [ ] Images lazy loaded below fold
- [ ] Typography responsive and readable
- [ ] Layout works at 200% zoom

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
