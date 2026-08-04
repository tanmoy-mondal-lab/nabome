# নবME (Nabome) — Design System & UI Architecture Standards

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for design and UI architecture  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), API_SERVICE_ARCHITECTURE.md (v1.0), and FOLDER_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [User Experience Principles](#2-user-experience-principles)
3. [Interface Hierarchy](#3-interface-hierarchy)
4. [Visual Hierarchy](#4-visual-hierarchy)
5. [Design Tokens](#5-design-tokens)
6. [Color Palette](#6-color-palette)
7. [Typography](#7-typography)
8. [Spacing System](#8-spacing-system)
9. [Grid System](#9-grid-system)
10. [Layout System](#10-layout-system)
11. [Breakpoints](#11-breakpoints)
12. [Border Radius](#12-border-radius)
13. [Elevation & Shadows](#13-elevation--shadows)
14. [Surface Styles](#14-surface-styles)
15. [Icon System](#15-icon-system)
16. [Image Presentation](#16-image-presentation)
17. [Navigation](#17-navigation)
18. [Forms](#18-forms)
19. [Buttons](#19-buttons)
20. [Inputs](#20-inputs)
21. [Search](#21-search)
22. [Cards](#22-cards)
23. [Modals & Dialogs](#23-modals--dialogs)
24. [Toasts & Notifications](#24-toasts--notifications)
25. [Empty States](#25-empty-states)
26. [Loading States](#26-loading-states)
27. [Error States](#27-error-states)
28. [Success States](#28-success-states)
29. [Pagination](#29-pagination)
30. [Carousels](#30-carousels)
31. [Tabs & Accordions](#31-tabs--accordions)
32. [Animations & Motion](#32-animations--motion)
33. [Touch Interactions](#33-touch-interactions)
34. [Accessibility](#34-accessibility)
35. [Dark Mode Readiness](#35-dark-mode-readiness)
36. [Internationalization Readiness](#36-internationalization-readiness)
37. [UX Rules](#37-ux-rules)
38. [Architectural Rules](#38-architectural-rules)

---

## 1. Design Philosophy

### 1.1 What

The foundational design principles that guide every visual decision for the Nabome platform.

### 1.2 Why

- **Brand Identity:** Establishes Nabome as a premium luxury destination
- **Consistency:** Every screen feels like the same product
- **User Trust:** Premium appearance builds confidence
- **Differentiation:** Stands apart from competitors

### 1.3 Where

Every pixel, every interaction, every animation.

### 1.4 Core Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Timeless over trendy** | Design for years, not months | Luxury endures |
| **Effortless elegance** | Complexity hidden, simplicity revealed | Premium experience |
| **Intentional restraint** | Less is more, every element earns its place | Focus and clarity |
| **Quiet confidence** | Let the product speak, not the UI | Content is king |
| **Human warmth** | Earth tones, organic shapes, personal touch | Approachable luxury |

### 1.5 Design DNA

```
┌─────────────────────────────────────────────────────────────────┐
│                    NABOME DESIGN DNA                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    APPLE                                   │   │
│  │  • Precision in every detail                              │   │
│  │  • Clean, minimal interfaces                              │   │
│  │  • Smooth, purposeful animations                          │   │
│  │  • Typography as design element                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          +                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ZARA                                    │   │
│  │  • Editorial layout                                      │   │
│  │  • Bold imagery over decoration                          │   │
│  │  • Fast, frictionless shopping                            │   │
│  │  • Fashion-forward aesthetic                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          =                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    NABOME                                  │   │
│  │  • Premium but not pretentious                            │   │
│  │  • Beautiful but never distracting                        │   │
│  │  • Simple but never simplistic                            │   │
│  │  • Familiar but uniquely ours                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Visual clutter | Distracts from products | Minimal interface |
| Gratuitous decoration | Feels cheap, not premium | Purposeful design |
| Trendy effects | Dates quickly | Timeless aesthetics |
| Heavy animations | Slows perception | Subtle motion |
| Complex navigation | Confuses beginners | Clear, simple paths |
| Busy layouts | Overwhelms users | White space and hierarchy |

---

## 2. User Experience Principles

### 2.1 What

Core UX principles that guide every user interaction.

### 2.2 Why

- **Usability:** Users accomplish goals effortlessly
- **Delight:** Every interaction feels polished
- **Trust:** Consistent behavior builds confidence
- **Accessibility:** Everyone can use the platform

### 2.3 Where

Every screen, every flow, every interaction.

### 2.4 Core UX Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Mobile-first** | Design for thumb, enhance for desktop | Bottom nav, large touch targets |
| **Beginner-first** | First-time user succeeds immediately | Clear labels, helpful hints |
| **Progressive disclosure** | Show only what's needed, when needed | Expandable sections, step-by-step |
| **Immediate feedback** | Every action has visible response | Loading states, success toasts |
| **Error prevention** | Prevent mistakes before they happen | Validation, confirmation dialogs |
| **Easy recovery** | Mistakes are easy to fix | Undo, clear error messages |
| **Minimal cognitive load** | Don't make users think | Familiar patterns, clear hierarchy |
| **Consistent patterns** | Same behavior everywhere | Design system components |

### 2.5 UX Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One primary action per screen** | Clear CTAs | Focus |
| **3 clicks to any goal** | Deep but discoverable navigation | Efficiency |
| **Visible state changes** | Users always know what happened | Feedback |
| **Undo over confirmation** | Allow recovery, not just prevention | Flexibility |
| **Save automatically** | Don't lose user work | Trust |
| **Progress indicators** | Show where user is in a flow | Orientation |
| **Empty states guide** | Never show blank screens | Helpfulness |

---

## 3. Interface Hierarchy

### 3.1 What

How interface elements are organized by importance and function.

### 3.2 Why

- **Scannability:** Users find what they need fast
- **Focus:** Attention flows to the right place
- **Clarity:** Clear information architecture

### 3.3 Where

Every page and component.

### 3.4 Interface Levels

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERFACE HIERARCHY                            │
│                                                                  │
│  Level 1: CHROME                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Header, Footer, Navigation, Search                      │   │
│  │  Always visible, never changes                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Level 2: CONTENT                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Product grids, Article text, Images                     │   │
│  │  Primary focus, changes per page                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Level 3: CONTEXTUAL                                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Filters, Sort options, Side panels                      │   │
│  │  Appears when needed, dismissible                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Level 4: OVERLAY                                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Modals, Drawers, Toasts, Tooltips                       │   │
│  │  Temporary, requires action or dismissal                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Hierarchy Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Chrome is constant** | Header/footer never change | Orientation |
| **Content is primary** | Products, images, text | Focus on what matters |
| **Contextual appears on demand** | Filters, panels | Don't clutter by default |
| **Overlays require attention** | Modals block interaction | Force focus |
| **One overlay at a time** | No stacked modals | Prevent confusion |
| **Escape always works** | ESC closes overlays | User control |

---

## 4. Visual Hierarchy

### 4.1 How visual elements guide the user's eye.

### 4.2 Why

- **Scanning:** Users scan, don't read
- **Focus:** Guide attention to key elements
- **Comprehension:** Clear relationships between elements

### 4.3 Visual Hierarchy Techniques

| Technique | Application | Example |
|-----------|-------------|---------|
| **Size** | Larger = more important | H1 > H2 > Body |
| **Color** | Brand color = primary action | CTA buttons |
| **Weight** | Bolder = more emphasis | Bold headlines |
| **Spacing** | More space = separation | Section gaps |
| **Position** | Top-left = first seen | Logo, nav |
| **Contrast** | High contrast = attention | CTAs on neutral bg |
| **White space** | More space = premium feel | Luxury aesthetic |

### 4.4 Hierarchy Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One focal point** | One primary element per viewport | Clear focus |
| **Z-pattern scanning** | Logo → nav → CTA → content | Natural eye flow |
| **F-pattern reading** | Headlines → paragraphs → lists | Content scanning |
| **Consistent alignment** | Left-aligned text, grid alignment | Order |
| **Generous white space** | Premium feel, breathing room | Luxury aesthetic |

---

## 5. Design Tokens

### 5.1 What

Centralized design values for consistent visual language.

### 5.2 Why

- **Consistency:** Same values used everywhere
- **Maintainability:** Change once, update everywhere
- **Themeability:** Easy to create dark mode or custom themes
- **Documentation:** Tokens serve as living style guide

### 5.3 Where

All CSS and Tailwind configuration.

### 5.4 Token Categories

```css
:root {
  /* ─── Color Tokens ──────────────────────────────────────── */
  --color-brand-50: #faf6f1;
  --color-brand-100: #f0e6d6;
  --color-brand-200: #e0ccb0;
  --color-brand-300: #c9a87a;
  --color-brand-400: #b08850;
  --color-brand-500: #8b6940;
  --color-brand-600: #7a5c38;
  --color-brand-700: #664d2f;
  --color-brand-800: #523d25;
  --color-brand-900: #3d2e1c;
  --color-brand-950: #1f1710;

  --color-accent-gold: #c9a84c;
  --color-accent-goldDark: #a88a3a;
  --color-accent-rose: #c47070;
  --color-accent-sage: #7a9a7a;
  --color-accent-ink: #2c3e50;
  --color-accent-cream: #faf6f1;

  --color-neutral-50: #fafaf9;
  --color-neutral-100: #f5f5f4;
  --color-neutral-200: #e7e5e4;
  --color-neutral-300: #d6d3d1;
  --color-neutral-400: #a8a29e;
  --color-neutral-500: #78716c;
  --color-neutral-600: #57534e;
  --color-neutral-700: #44403c;
  --color-neutral-800: #292524;
  --color-neutral-900: #1c1917;
  --color-neutral-950: #0c0a09;

  --color-status-success: #22c55e;
  --color-status-warning: #f59e0b;
  --color-status-error: #ef4444;
  --color-status-info: #3b82f6;

  /* ─── Spacing Tokens ────────────────────────────────────── */
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;

  /* ─── Typography Tokens ─────────────────────────────────── */
  --font-display: 'Cormorant Garamond', serif;
  --font-body: 'Manrope', sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 2.5rem;
  --font-size-5xl: 3.5rem;

  /* ─── Shadow Tokens ─────────────────────────────────────── */
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-elevated: 0 10px 40px rgba(0, 0, 0, 0.10);
  --shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.15);

  /* ─── Animation Tokens ──────────────────────────────────── */
  --ease-luxe-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-luxe-in: cubic-bezier(0.55, 0, 0.75, 0.25);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --duration-slower: 800ms;

  /* ─── Border Radius Tokens ──────────────────────────────── */
  --radius-none: 0;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* ─── Z-Index Tokens ────────────────────────────────────── */
  --z-base: 0;
  --z-dropdown: 50;
  --z-sticky: 100;
  --z-modal: 200;
  --z-toast: 300;
  --z-tooltip: 400;

  /* ─── Border Tokens ─────────────────────────────────────── */
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 3px;
  --border-color: var(--color-neutral-200);
  --border-color-strong: var(--color-neutral-300);
}
```

### 5.5 Token Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always use tokens** | Never hardcode values | Consistency |
| **No arbitrary values** | No `[123px]` in Tailwind | Maintainability |
| **Semantic naming** | Use descriptive names | Readability |
| **Document tokens** | Comment each token | Developer experience |
| **CSS custom properties** | Define in `:root` | Themeability |

---

## 6. Color Palette

### 6.1 What

Complete color system for the Nabome brand.

### 6.2 Why

- **Brand Identity:** Warm, luxurious earth tones
- **Accessibility:** Sufficient contrast ratios
- **Flexibility:** Enough variants for all use cases
- **Dark Mode:** Easy to create dark variants

### 6.3 Where

All visual elements.

### 6.4 Primary Palette

| Color | Hex | Usage | Contrast on White |
|-------|-----|-------|-------------------|
| **brand-50** | `#faf6f1` | Backgrounds, subtle tints | N/A |
| **brand-100** | `#f0e6d6` | Light backgrounds | N/A |
| **brand-200** | `#e0ccb0` | Borders, dividers | N/A |
| **brand-300** | `#c9a87a` | Subtle accents | N/A |
| **brand-400** | `#b08850` | Hover states | 4.6:1 (AA) |
| **brand-500** | `#8b6940` | Primary actions | 4.6:1 (AA) |
| **brand-600** | `#7a5c38` | Hover states | 5.7:1 (AA) |
| **brand-700** | `#664d2f` | Active states | 7.2:1 (AAA) |
| **brand-800** | `#523d25` | Dark accents | 9.8:1 (AAA) |
| **brand-900** | `#3d2e1c` | Text on light | 12.1:1 (AAA) |

### 6.5 Neutral Palette

| Color | Hex | Usage | Contrast on White |
|-------|-----|-------|-------------------|
| **neutral-50** | `#fafaf9` | Page background | N/A |
| **neutral-100** | `#f5f5f4` | Card backgrounds | N/A |
| **neutral-200** | `#e7e5e4` | Borders | N/A |
| **neutral-300** | `#d6d3d1` | Disabled borders | N/A |
| **neutral-400** | `#a8a29e` | Placeholder text | 3.0:1 (Large) |
| **neutral-500** | `#78716c` | Secondary text | 4.6:1 (AA) |
| **neutral-600** | `#57534e` | Body text | 5.7:1 (AA) |
| **neutral-700** | `#44403c` | Emphasized text | 8.6:1 (AAA) |
| **neutral-800** | `#292524` | Headings | 12.4:1 (AAA) |
| **neutral-900** | `#1c1917` | Primary text | 15.4:1 (AAA) |

### 6.6 Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **accent-gold** | `#c9a84c` | Premium accents, badges |
| **accent-goldDark** | `#a88a3a` | Gold hover states |
| **accent-rose** | `#c47070` | Sale badges, warnings |
| **accent-sage** | `#7a9a7a` | Success, nature |
| **accent-ink** | `#2c3e50` | Dark accents |
| **accent-cream** | `#faf6f1` | Light backgrounds |

### 6.7 Status Colors

| Color | Hex | Usage | WCAG |
|-------|-----|-------|------|
| **success** | `#22c55e` | Success messages | 4.6:1 (AA) |
| **warning** | `#f59e0b` | Warning messages | 3.0:1 (Large) |
| **error** | `#ef4444` | Error messages | 4.6:1 (AA) |
| **info** | `#3b82f6` | Informational | 4.6:1 (AA) |

### 6.8 Color Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Primary actions** | brand-500 | Brand consistency |
| **Hover states** | brand-600 | Darker on interaction |
| **Active states** | brand-700 | Darkest on press |
| **Gold accents** | accent-gold | Premium feel |
| **Text primary** | neutral-900 | Readability |
| **Text secondary** | neutral-600 | Hierarchy |
| **Text tertiary** | neutral-500 | Subtle text |
| **Borders** | neutral-200 | Subtle separation |
| **Backgrounds** | neutral-50, white | Clean aesthetic |
| **Errors** | error | Clear feedback |
| **Success** | success | Clear feedback |

---

## 7. Typography

### 7.1 What

Complete typography system using Cormorant Garamond and Manrope.

### 7.2 Why

- **Brand Identity:** Editorial, luxury aesthetic
- **Readability:** Appropriate sizes for each context
- **Hierarchy:** Clear visual hierarchy
- **Consistency:** Same type styles everywhere

### 7.3 Where

All text elements in the application.

### 7.4 Font Families

| Font | Usage | Fallback |
|------|-------|----------|
| **Cormorant Garamond** | Display headlines (H1, H2) | Georgia, serif |
| **Manrope** | Body text, UI elements | system-ui, sans-serif |

### 7.5 Typography Scale

| Element | Font | Size | Weight | Letter Spacing | Line Height | Tailwind |
|---------|------|------|--------|----------------|-------------|----------|
| **Display H1** | Cormorant Garamond | 3.5rem (56px) | 300 | -0.02em | 1.15 | `text-5xl font-display font-light` |
| **Display H2** | Cormorant Garamond | 2.5rem (40px) | 400 | -0.01em | 1.2 | `text-4xl font-display` |
| **Heading H3** | Manrope | 1.5rem (24px) | 600 | 0 | 1.33 | `text-2xl font-semibold` |
| **Heading H4** | Manrope | 1.25rem (20px) | 600 | 0 | 1.4 | `text-xl font-semibold` |
| **Body Large** | Manrope | 1.125rem (18px) | 400 | 0 | 1.6 | `text-lg` |
| **Body** | Manrope | 1rem (16px) | 400 | 0 | 1.6 | `text-base` |
| **Body Small** | Manrope | 0.875rem (14px) | 400 | 0 | 1.5 | `text-sm` |
| **Caption** | Manrope | 0.75rem (12px) | 500 | 0.05em | 1.5 | `text-xs font-medium tracking-wide` |
| **Label** | Manrope | 0.6875rem (11px) | 600 | 0.1em | 1.5 | `text-[0.6875rem] font-semibold uppercase tracking-widest` |
| **Editorial** | Cormorant Garamond | 1.25rem (20px) | 400 | 0.02em | 1.5 | `text-xl font-display` |

### 7.6 Typography Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max 2 fonts** | Cormorant Garamond + Manrope | Brand consistency |
| **Display for headlines** | Cormorant Garamond for H1-H2 | Editorial aesthetic |
| **Body for everything else** | Manrope for H3+ and body | Readability |
| **Uppercase for labels** | Letter-spacing 0.1em | Premium feel |
| **No font size below 12px** | Minimum 0.75rem | Accessibility |
| **Contrast ratio** | 4.5:1 minimum | WCAG AA compliance |
| **Line height** | 1.5-1.6 for body | Readability |
| **Max line length** | 65-75 characters | Readability |

### 7.7 Typography Examples

```tsx
// ✓ CORRECT: Display headline
<h1 className="font-display text-5xl font-light tracking-tight text-neutral-900">
  Discover Your Style
</h1>

// ✓ CORRECT: Section heading
<h2 className="text-2xl font-semibold text-neutral-800">
  Featured Collection
</h2>

// ✓ CORRECT: Body text
<p className="text-base leading-relaxed text-neutral-600">
  Premium cotton t-shirt crafted from the finest materials.
</p>

// ✓ CORRECT: Label
<span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
  New Arrival
</span>

// ✗ WRONG: Using wrong font for body
<p className="font-display text-base">
  This should use Manrope, not Cormorant Garamond.
</p>
```

---

## 8. Spacing System

### 8.1 What

Consistent spacing scale for margins, padding, and gaps.

### 8.2 Why

- **Visual rhythm:** Consistent spacing creates harmony
- **Readability:** Proper whitespace improves readability
- **Maintainability:** Use tokens, not arbitrary values
- **Responsiveness:** Scale spacing for different screens

### 8.3 Where

All layout and component spacing.

### 8.4 Spacing Scale

| Token | Value | Usage | Tailwind |
|-------|-------|-------|----------|
| `space-0` | 0px | No spacing | `p-0`, `m-0`, `gap-0` |
| `space-1` | 4px | Tight spacing | `p-1`, `m-1`, `gap-1` |
| `space-2` | 8px | Small spacing | `p-2`, `m-2`, `gap-2` |
| `space-3` | 12px | Compact spacing | `p-3`, `m-3`, `gap-3` |
| `space-4` | 16px | Default spacing | `p-4`, `m-4`, `gap-4` |
| `space-5` | 20px | Comfortable spacing | `p-5`, `m-5`, `gap-5` |
| `space-6` | 24px | Section spacing | `p-6`, `m-6`, `gap-6` |
| `space-8` | 32px | Large spacing | `p-8`, `m-8`, `gap-8` |
| `space-10` | 40px | Extra large spacing | `p-10`, `m-10`, `gap-10` |
| `space-12` | 48px | Section break | `p-12`, `m-12`, `gap-12` |
| `space-16` | 64px | Page margins | `p-16`, `m-16`, `gap-16` |
| `space-20` | 80px | Hero spacing | `p-20`, `m-20`, `gap-20` |
| `space-24` | 96px | Large hero | `p-24`, `m-24`, `gap-24` |
| `space-32` | 128px | Extra large | `p-32`, `m-32`, `gap-32` |

### 8.5 Spacing Rules

| Context | Scale | Example |
|---------|-------|---------|
| **Inline spacing** | space-1 to space-2 | Icon to text gap |
| **Component padding** | space-3 to space-6 | Button, input padding |
| **Component gap** | space-4 to space-6 | Gap between items |
| **Section spacing** | space-8 to space-12 | Between page sections |
| **Page margins** | space-6 to space-16 | Page edge margins |
| **Hero spacing** | space-16 to space-32 | Hero section padding |

---

## 9. Grid System

### 9.1 What

Responsive grid system for page layouts.

### 9.2 Why

- **Consistency:** Same grid everywhere
- **Responsiveness:** Adapts to all screen sizes
- **Alignment:** Content stays aligned
- **Simplicity:** Easy to use with Tailwind

### 9.3 Where

All page and component layouts.

### 9.4 Grid Configuration

| Screen | Columns | Gutter | Max Width | Tailwind |
|--------|---------|--------|-----------|----------|
| **Mobile** | 4 | 16px | 100% | `grid-cols-4 gap-4` |
| **Tablet** | 8 | 24px | 768px | `sm:grid-cols-8 sm:gap-6` |
| **Desktop** | 12 | 32px | 1280px | `lg:grid-cols-12 lg:gap-8` |
| **Wide** | 12 | 32px | 1440px | `xl:grid-cols-12 xl:gap-8` |

### 9.5 Grid Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Container** | Max-width 1280px, centered | Readable line length |
| **Editorial** | Max-width 1440px for hero sections | Premium feel |
| **Mobile-first** | Start with 4 columns, add more | 70%+ mobile traffic |
| **Consistent gutters** | Same gutter across breakpoints | Visual harmony |
| **Responsive** | Use Tailwind breakpoints | Consistent behavior |
| **No horizontal scroll** | Content stays within viewport | UX |

### 9.6 Grid Examples

```tsx
// ✓ CORRECT: Responsive grid
<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 lg:grid-cols-12 lg:gap-8">
  {/* Grid items */}
</div>

// ✓ CORRECT: Container
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Page content */}
</div>

// ✓ CORRECT: Product grid
<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>

// ✗ WRONG: Fixed widths
<div style={{ width: '1200px', margin: '0 auto' }}>
  {/* Not responsive! */}
</div>
```

---

## 10. Layout System

### 10.1 What

Standard layout patterns for all pages.

### 10.2 Why

- **Consistency:** Same layout patterns everywhere
- **Predictability:** Users know where to find things
- **Maintainability:** Easy to create new pages

### 10.3 Where

All page layouts.

### 10.4 Layout Patterns

| Pattern | Usage | Description |
|---------|-------|-------------|
| **Single column** | Login, forms, settings | Centered, narrow content |
| **Two column** | Product detail, account | Content + sidebar |
| **Grid** | Product listing, category | Multiple equal items |
| **Hero + content** | Homepage, landing | Large hero, grid below |
| **Dashboard** | Admin panel | Sidebar + main content |

### 10.5 Layout Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max content width** | 1280px | Readable line length |
| **Content padding** | 16px mobile, 24px tablet, 32px desktop | Breathing room |
| **Section spacing** | 48px mobile, 64px tablet, 96px desktop | Visual separation |
| **Sidebar width** | 280px fixed | Consistent |
| **Header height** | 64px mobile, 80px desktop | Consistent |

---

## 11. Breakpoints

### 11.1 What

Standard breakpoints for responsive design.

### 11.2 Why

- **Consistency:** Same breakpoints everywhere
- **Predictability:** Developers know when styles apply
- **Mobile-first:** Design for mobile first, enhance for larger screens
- **Performance:** Load appropriate resources per device

### 11.3 Where

All responsive styles.

### 11.4 Breakpoints

| Name | Width | Tailwind Prefix | Target | Usage |
|------|-------|-----------------|--------|-------|
| **Mobile** | 0-639px | (none) | Phones | Primary design target |
| **Tablet** | 640-1023px | `sm:` | Tablets | Enhanced layout |
| **Desktop** | 1024-1279px | `md:` | Laptops | Full experience |
| **Wide** | 1280px+ | `lg:` | Desktops | Premium experience |

### 11.5 Breakpoint Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile-first** | Base styles for mobile | 70%+ traffic |
| **Progressive enhancement** | Add styles for larger screens | Better UX |
| **Touch targets** | Minimum 44x44px on mobile | Accessibility |
| **Text size** | Minimum 16px on mobile | Readability |
| **Navigation** | Bottom nav on mobile, top nav on desktop | UX pattern |
| **No horizontal scroll** | Content stays within viewport | UX |

### 11.6 Responsive Patterns

```tsx
// ✓ CORRECT: Mobile-first responsive
<div className="
  grid grid-cols-2 gap-4
  sm:grid-cols-4 sm:gap-6
  lg:grid-cols-12 lg:gap-8
">
  {/* Items */}
</div>

// ✓ CORRECT: Conditional rendering
<div className="hidden md:block">
  {/* Desktop only */}
</div>

<div className="block md:hidden">
  {/* Mobile only */}
</div>

// ✓ CORRECT: Responsive typography
<h1 className="text-3xl sm:text-4xl lg:text-5xl">
  Responsive headline
</h1>
```

---

## 12. Border Radius

### 12.1 What

Standard border radius values for all components.

### 12.2 Why

- **Consistency:** Same radius everywhere
- **Brand Feel:** Subtle, refined curves
- **Modern Aesthetic:** Slightly rounded corners

### 12.3 Where

All components with rounded corners.

### 12.4 Border Radius Scale

| Token | Value | Usage | Tailwind |
|-------|-------|-------|----------|
| `radius-none` | 0 | Sharp corners | `rounded-none` |
| `radius-sm` | 4px | Subtle rounding | `rounded-sm` |
| `radius-md` | 8px | Default rounding | `rounded-md` |
| `radius-lg` | 12px | Card rounding | `rounded-lg` |
| `radius-xl` | 16px | Modal rounding | `rounded-xl` |
| `radius-2xl` | 24px | Large cards | `rounded-2xl` |
| `radius-full` | 9999px | Pills, circles | `rounded-full` |

### 12.5 Border Radius Rules

| Component | Radius | Rationale |
|-----------|--------|-----------|
| **Buttons** | `radius-md` | Subtle, clickable |
| **Inputs** | `radius-md` | Consistent with buttons |
| **Cards** | `radius-lg` | Slightly more rounded |
| **Modals** | `radius-xl` | Prominent, friendly |
| **Avatars** | `radius-full` | Circular |
| **Badges** | `radius-full` | Pills |
| **Images** | `radius-md` | Subtle rounding |
| **Toasts** | `radius-lg` | Visible, friendly |

---

## 13. Elevation & Shadows

### 13.1 What

Standard shadow system for depth and hierarchy.

### 13.2 Why

- **Depth:** Creates visual hierarchy
- **Focus:** Elevated elements draw attention
- **Premium Feel:** Subtle shadows feel luxurious

### 13.3 Where

Cards, modals, dropdowns, buttons.

### 13.4 Shadow Scale

| Token | Value | Usage | Tailwind |
|-------|-------|-------|----------|
| `shadow-subtle` | `0 1px 3px rgba(0,0,0,0.08)` | Subtle depth | `shadow-subtle` |
| `shadow-card` | `0 2px 8px rgba(0,0,0,0.08)` | Card elevation | `shadow-card` |
| `shadow-elevated` | `0 10px 40px rgba(0,0,0,0.10)` | Dropdowns, popovers | `shadow-elevated` |
| `shadow-modal` | `0 20px 60px rgba(0,0,0,0.15)` | Modals, dialogs | `shadow-modal` |

### 13.5 Shadow Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Subtle by default** | Use shadow-subtle for most | Premium feel |
| **Elevation on hover** | Increase shadow on hover | Interactive feedback |
| **Modal shadow** | Use shadow-modal for overlays | Clear separation |
| **No harsh shadows** | Low opacity, soft edges | Luxury aesthetic |
| **Consistent spread** | Same shadow across components | Visual harmony |

### 13.6 Shadow Examples

```tsx
// ✓ CORRECT: Card with subtle shadow
<div className="rounded-lg border border-neutral-100 bg-white shadow-subtle hover:shadow-card transition-shadow duration-300">
  {/* Card content */}
</div>

// ✓ CORRECT: Modal with heavy shadow
<div className="rounded-xl bg-white shadow-modal">
  {/* Modal content */}
</div>

// ✗ WRONG: Harsh shadows
<div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
  {/* Too harsh! */}
</div>
```

---

## 14. Surface Styles

### 14.1 What

Standard surface styles for backgrounds and cards.

### 14.2 Why

- **Hierarchy:** Different surfaces create depth
- **Consistency:** Same surfaces everywhere
- **Premium Feel:** Clean, elegant surfaces

### 14.3 Where

Page backgrounds, cards, panels.

### 14.4 Surface Types

| Surface | Background | Border | Shadow | Usage |
|---------|------------|--------|--------|-------|
| **Page** | `neutral-50` | None | None | Page background |
| **Card** | `white` | `neutral-100` | `shadow-subtle` | Product cards |
| **Elevated** | `white` | None | `shadow-elevated` | Dropdowns |
| **Modal** | `white` | None | `shadow-modal` | Dialogs |
| **Inset** | `neutral-50` | `neutral-200` | None | Input backgrounds |
| **Brand** | `brand-500` | None | None | CTA sections |
| **Gold** | `accent-gold` | None | None | Premium badges |

### 14.5 Surface Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **White for cards** | Clean, readable | Premium feel |
| **Neutral-50 for pages** | Subtle contrast | Visual hierarchy |
| **No busy backgrounds** | Clean surfaces | Content focus |
| **Consistent padding** | Same padding per surface | Visual rhythm |
| **Border for separation** | Use borders, not shadows | Clean aesthetic |

---

## 15. Icon System

### 15.1 What

Standard icon library and sizing system.

### 15.2 Why

- **Consistency:** Same icon style everywhere
- **Performance:** Single icon library
- **Accessibility:** Proper ARIA labels

### 15.3 Where

All icons in the application.

### 15.4 Icon Library

| Library | Usage | Rationale |
|---------|-------|-----------|
| **Lucide React** | All UI icons | Clean, consistent, tree-shakeable |

### 15.5 Icon Sizes

| Size | Pixels | Usage | Tailwind |
|------|--------|-------|----------|
| **xs** | 12px | Inline badges | `h-3 w-3` |
| **sm** | 16px | Inline with text | `h-4 w-4` |
| **md** | 20px | Button icons | `h-5 w-5` |
| **lg** | 24px | Standalone icons | `h-6 w-6` |
| **xl** | 32px | Feature icons | `h-8 w-8` |
| **2xl** | 48px | Hero icons | `h-12 w-12` |

### 15.6 Icon Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Consistent style** | Use Lucide only | Visual harmony |
| **Match text size** | Icon matches adjacent text | Alignment |
| **ARIA labels** | On all interactive icons | Accessibility |
| **Decorative icons** | `aria-hidden="true"` | Screen reader UX |
| **Color inherits** | Use `currentColor` | Theme support |
| **No filled icons** | Outline style only | Clean aesthetic |

### 15.7 Icon Examples

```tsx
// ✓ CORRECT: Icon with label
<button aria-label="Add to cart">
  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
</button>

// ✓ CORRECT: Icon with text
<a href="/cart" className="flex items-center gap-2">
  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
  <span>Cart</span>
</a>

// ✗ WRONG: Icon without label
<button>
  <ShoppingCart />
</button>
```

---

## 16. Image Presentation

### 16.1 What

Standard for presenting images across the platform.

### 16.2 Why

- **Performance:** Optimized loading
- **Consistency:** Same image treatment everywhere
- **Premium Feel:** High-quality presentation

### 16.3 Where

Product images, avatars, CMS media.

### 16.4 Image Types

| Type | Aspect Ratio | Background | Usage |
|------|--------------|------------|-------|
| **Product card** | 3:4 | `neutral-50` | Product listings |
| **Product detail** | 1:1 | `white` | Product pages |
| **Hero** | 16:9 | `brand-500` | Homepage hero |
| **Avatar** | 1:1 | `brand-100` | User profiles |
| **CMS** | 16:9 | `neutral-50` | Content images |

### 16.5 Image Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lazy loading** | Use `loading="lazy"` | Performance |
| **Alt text** | Always provide alt text | Accessibility |
| **Object fit** | `object-cover` for fixed sizes | Consistency |
| **Placeholder** | Show skeleton while loading | UX |
| **Aspect ratio** | Use `aspect-*` classes | Consistency |
| **No distortion** | Never stretch images | Quality |

### 16.6 Image Examples

```tsx
// ✓ CORRECT: Product image
<div className="aspect-[3/4] overflow-hidden rounded-lg bg-neutral-50">
  <img
    src={product.imageUrl}
    alt={product.name}
    className="h-full w-full object-cover"
    loading="lazy"
  />
</div>

// ✓ CORRECT: Avatar
<div className="h-10 w-10 overflow-hidden rounded-full bg-brand-100">
  <img
    src={user.avatarUrl}
    alt={user.firstName}
    className="h-full w-full object-cover"
  />
</div>

// ✗ WRONG: Image without alt
<img src={product.imageUrl} />
```

---

## 17. Navigation

### 17.1 What

Standard navigation patterns for all devices.

### 17.2 Why

- **Usability:** Users always know where they are
- **Consistency:** Same navigation everywhere
- **Accessibility:** Keyboard and screen reader friendly

### 17.3 Where

All pages.

### 17.4 Navigation Patterns

| Device | Pattern | Description |
|--------|---------|-------------|
| **Mobile** | Bottom navigation | 5 primary tabs |
| **Tablet** | Top navigation | Horizontal menu |
| **Desktop** | Top navigation + mega menu | Full navigation |

### 17.5 Navigation Items

| Position | Item | Icon | Path |
|----------|------|------|------|
| 1 | Home | Home | `/` |
| 2 | Shop | Grid | `/shop` |
| 3 | Search | Search | `/search` |
| 4 | Cart | ShoppingCart | `/cart` |
| 5 | Account | User | `/account` |

### 17.6 Navigation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max 5 items** | Mobile bottom nav | Thumb-friendly |
| **Active state** | Highlight current page | Orientation |
| **Consistent order** | Same order everywhere | Muscle memory |
| **Visible labels** | Text labels on mobile | Clarity |
| **Badge on cart** | Show item count | Information |
| **Sticky header** | Always accessible | Navigation |

### 17.7 Mobile Navigation

```tsx
// ✓ CORRECT: Bottom navigation
<nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white md:hidden">
  <div className="flex items-center justify-around py-2">
    {navItems.map((item) => (
      <a
        key={item.path}
        href={item.path}
        className={`flex flex-col items-center gap-1 px-3 py-1 ${
          isActive ? 'text-brand-500' : 'text-neutral-500'
        }`}
      >
        <item.icon className="h-5 w-5" />
        <span className="text-xs">{item.label}</span>
      </a>
    ))}
  </div>
</nav>
```

---

## 18. Forms

### 18.1 What

Standard form patterns and validation.

### 18.2 Why

- **Usability:** Forms are easy to complete
- **Validation:** Clear error messages
- **Consistency:** Same form behavior everywhere

### 18.3 Where

All forms: login, checkout, account, admin.

### 18.4 Form Layout

| Element | Width | Spacing |
|---------|-------|---------|
| **Form container** | Max 480px | Centered |
| **Field spacing** | 16px | Between fields |
| **Label to input** | 4px | Tight |
| **Input to error** | 4px | Tight |
| **Section spacing** | 32px | Between sections |

### 18.5 Form Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Labels always visible** | Not floating, not placeholder | Accessibility |
| **Required indicator** | Asterisk after label | Clarity |
| **Inline validation** | Validate on blur | Immediate feedback |
| **Error placement** | Below input, red text | Clear association |
| **Disabled state** | Gray out, lower opacity | Visual feedback |
| **Loading state** | Spinner on submit button | Feedback |
| **Single column** | One field per row | Mobile-friendly |
| **Autofill** | Use proper `autocomplete` | Speed |

### 18.6 Form Examples

```tsx
// ✓ CORRECT: Form field
<div>
  <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
    Email address <span className="text-red-500">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    autoComplete="email"
    aria-describedby="email-error"
    aria-invalid={hasError}
    className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
  />
  {hasError && (
    <p id="email-error" className="mt-1 text-sm text-red-500">
      Please enter a valid email
    </p>
  )}
</div>

// ✗ WRONG: Placeholder as label
<input placeholder="Email" />
```

---

## 19. Buttons

### 19.1 What

Standard button styles and sizes.

### 19.2 Why

- **Consistency:** Same button behavior everywhere
- **Clarity:** Clear primary vs secondary actions
- **Accessibility:** Proper focus states

### 19.3 Where

All interactive actions.

### 19.4 Button Variants

| Variant | Background | Text | Border | Usage |
|---------|------------|------|--------|-------|
| **Primary** | `brand-500` | `white` | None | Primary actions |
| **Secondary** | `white` | `brand-500` | `brand-500` | Secondary actions |
| **Ghost** | `transparent` | `brand-500` | None | Tertiary actions |
| **Outline** | `transparent` | `neutral-700` | `neutral-300` | Subtle actions |
| **Gold** | `accent-gold` | `white` | None | Premium actions |
| **Danger** | `error` | `white` | None | Destructive actions |

### 19.5 Button Sizes

| Size | Height | Padding | Font Size | Tailwind |
|------|--------|---------|-----------|----------|
| **sm** | 32px | 12px 16px | 14px | `h-8 px-4 text-sm` |
| **md** | 40px | 16px 24px | 14px | `h-10 px-6 text-sm` |
| **lg** | 48px | 24px 32px | 16px | `h-12 px-8 text-base` |

### 19.6 Button Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One primary per section** | Clear CTAs | Focus |
| **Min touch target** | 44x44px | Accessibility |
| **Loading state** | Spinner replaces text | Feedback |
| **Disabled state** | Gray, pointer-events-none | Clarity |
| **Icon support** | Left or right icon | Flexibility |
| **Full width on mobile** | `w-full` on small screens | Thumb-friendly |

### 19.7 Button Examples

```tsx
// ✓ CORRECT: Primary button
<button className="inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-6 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
  Add to Cart
</button>

// ✓ CORRECT: Button with icon
<button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-500 px-6 text-sm font-medium text-white">
  <ShoppingCart className="h-4 w-4" />
  Add to Cart
</button>

// ✓ CORRECT: Loading state
<button disabled className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-500 px-6 text-sm font-medium text-white opacity-75">
  <Spinner className="h-4 w-4" />
  Adding...
</button>

// ✗ WRONG: Multiple primary buttons
<div>
  <button className="bg-brand-500 text-white">Save</button>
  <button className="bg-brand-500 text-white">Cancel</button>
</div>
```

---

## 20. Inputs

### 20.1 What

Standard input styles and states.

### 20.2 Why

- **Consistency:** Same input behavior everywhere
- **Clarity:** Clear states (default, focus, error, disabled)
- **Accessibility:** Proper labels and ARIA

### 20.3 Where

All form inputs.

### 20.4 Input States

| State | Border | Background | Text |
|-------|--------|------------|------|
| **Default** | `neutral-300` | `white` | `neutral-900` |
| **Focus** | `brand-500` | `white` | `neutral-900` |
| **Error** | `error` | `white` | `neutral-900` |
| **Disabled** | `neutral-200` | `neutral-100` | `neutral-400` |
| **Success** | `success` | `white` | `neutral-900` |

### 20.5 Input Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Labels always visible** | Not floating | Accessibility |
| **Min height** | 40px | Touch-friendly |
| **Padding** | 12px horizontal | Comfortable |
| **Border radius** | `radius-md` | Consistent |
| **Focus ring** | brand-500, 2px | Accessibility |
| **Error text** | Below input, red | Clear feedback |
| **Helper text** | Below input, gray | Guidance |

---

## 21. Search

### 21.1 What

Standard search interface patterns.

### 21.2 Why

- **Discoverability:** Users find products fast
- **Efficiency:** Quick search with autocomplete
- **Consistency:** Same search experience everywhere

### 21.3 Where

Header search, search page, admin search.

### 21.4 Search Patterns

| Pattern | Usage | Description |
|---------|-------|-------------|
| **Header search** | Quick search | Expandable in header |
| **Search page** | Full search | Dedicated page with filters |
| **Autocomplete** | Suggestions | Dropdown with results |
| **Recent searches** | History | Show recent queries |

### 21.5 Search Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Prominent placement** | Header, always visible | Discoverability |
| **Instant results** | Show results as user types | Speed |
| **Debounce input** | 300ms debounce | Performance |
| **Empty state** | Show helpful suggestions | Guidance |
| **Clear button** | Easy to clear search | Usability |
| **Keyboard support** | Arrow keys, Enter, ESC | Accessibility |

---

## 22. Cards

### 22.1 What

Standard card component for displaying content.

### 22.2 Why

- **Consistency:** Same card treatment everywhere
- **Hierarchy:** Cards create visual groups
- **Premium Feel:** Clean, elegant cards

### 22.3 Where

Product listings, featured content, admin dashboards.

### 22.4 Card Types

| Type | Usage | Description |
|------|-------|-------------|
| **Product card** | Product listings | Image + info + CTA |
| **Content card** | Articles, blog | Image + text |
| **Action card** | Admin dashboard | Icon + title + description |
| **Stats card** | Analytics | Number + label + trend |

### 22.5 Card Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Consistent padding** | 16px or 24px | Visual rhythm |
| **Subtle border** | `neutral-100` | Separation |
| **Subtle shadow** | `shadow-subtle` | Depth |
| **Hover elevation** | `shadow-card` on hover | Interactivity |
| **Border radius** | `radius-lg` | Modern feel |
| **No heavy decoration** | Clean, minimal | Premium feel |

---

## 23. Modals & Dialogs

### 23.1 What

Standard modal and dialog patterns.

### 23.2 Why

- **Focus:** User attention on important content
- **Consistency:** Same modal behavior everywhere
- **Accessibility:** Focus trap, keyboard support

### 23.3 Where

Confirmations, forms, detail views.

### 23.4 Modal Types

| Type | Size | Usage |
|------|------|-------|
| **Small** | 400px | Confirmations |
| **Medium** | 560px | Forms |
| **Large** | 720px | Detail views |
| **Full screen** | 100% | Mobile modals |

### 23.5 Modal Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One modal at a time** | No stacked modals | Prevent confusion |
| **ESC to close** | Always | User control |
| **Click outside to close** | Optional | User control |
| **Focus trap** | Keyboard stays inside | Accessibility |
| **Return focus** | Focus trigger element on close | Accessibility |
| **Backdrop** | Semi-transparent black | Visual separation |
| **Animation** | Scale up + fade in | Premium feel |
| **Max height** | 90vh | Prevent overflow |

---

## 24. Toasts & Notifications

### 24.1 What

Standard toast notification patterns.

### 24.2 Why

- **Feedback:** User knows action succeeded/failed
- **Non-blocking:** Doesn't interrupt workflow
- **Consistency:** Same toast behavior everywhere

### 24.3 Where

Success messages, errors, warnings.

### 24.4 Toast Types

| Type | Color | Icon | Usage |
|------|-------|------|-------|
| **Success** | `success` | Check | Action completed |
| **Error** | `error` | X | Action failed |
| **Warning** | `warning` | Alert | Caution needed |
| **Info** | `info` | Info | Information |

### 24.5 Toast Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Position** | Top-right | Visible, non-blocking |
| **Duration** | 5 seconds auto-dismiss | Don't block |
| **Max toasts** | 3 visible | Don't overwhelm |
| **Dismissible** | Close button | User control |
| **Stacked** | Newest on top | Chronological |
| **Animation** | Slide in from right | Smooth |

---

## 25. Empty States

### 25.1 What

Standard empty state patterns.

### 25.2 Why

- **Guidance:** Users know what to do next
- **Delight:** Empty doesn't mean boring
- **Consistency:** Same empty state treatment everywhere

### 25.3 Where

Empty lists, no results, first-time use.

### 25.4 Empty State Types

| Type | Content | CTA |
|------|---------|-----|
| **No items** | Illustration + message | Action button |
| **No results** | Message + suggestions | Refine search |
| **First time** | Welcome + getting started | Onboarding |
| **Error** | Error message | Retry button |

### 25.5 Empty State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never blank** | Always show something | Guidance |
| **Helpful message** | Explain why empty | Clarity |
| **Action button** | Clear next step | Direction |
| **Illustration** | Simple, on-brand | Delight |
| **Compact** | Not too tall | Respectful |

---

## 26. Loading States

### 26.1 What

Standard loading state patterns.

### 26.2 Why

- **Feedback:** User knows something is happening
- **Performance:** Perceived performance improvement
- **Consistency:** Same loading treatment everywhere

### 26.3 Where

Data fetching, form submission, page transitions.

### 26.4 Loading Patterns

| Pattern | Usage | Description |
|---------|-------|-------------|
| **Spinner** | Inline loading | Small, centered |
| **Skeleton** | Content loading | Placeholder content |
| **Progress bar** | Known duration | Linear progress |
| **Button loading** | Form submission | Spinner in button |

### 26.5 Loading Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Immediate feedback** | Show loading within 200ms | Perception |
| **Skeleton for lists** | Match content shape | Smoothness |
| **Spinner for actions** | Button loading | Feedback |
| **No layout shift** | Maintain space | Stability |
| **Fade in content** | Smooth transition | Polish |

---

## 27. Error States

### 27.1 What

Standard error state patterns.

### 27.2 Why

- **Clarity:** User knows what went wrong
- **Recovery:** User knows how to fix it
- **Consistency:** Same error treatment everywhere

### 27.3 Where

Form errors, API errors, page errors.

### 27.4 Error Types

| Type | Usage | Content |
|------|-------|---------|
| **Inline** | Form fields | Red border + message |
| **Banner** | Page-level | Red background + message |
| **Full page** | Critical errors | Illustration + message + retry |
| **Toast** | Transient errors | Red toast + message |

### 27.5 Error Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Clear message** | Plain language | Understanding |
| **Specific** | What went wrong | Debugging |
| **Actionable** | How to fix | Recovery |
| **Non-blaming** | "Something went wrong" | Friendly |
| **Red for errors** | Consistent color | Recognition |

---

## 28. Success States

### 28.1 What

Standard success state patterns.

### 28.2 Why

- **Confirmation:** User knows action succeeded
- **Delight:** Celebration of completion
- **Consistency:** Same success treatment everywhere

### 28.3 Where

Form submission, checkout completion, account actions.

### 28.4 Success Patterns

| Pattern | Usage | Content |
|---------|-------|---------|
| **Toast** | Quick actions | Green toast + message |
| **Inline** | Form success | Green border + message |
| **Full page** | Major actions | Illustration + message + next steps |
| **Animation** | Delightful moments | Checkmark animation |

### 28.5 Success Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Clear confirmation** | "Success!" | Clarity |
| **Next steps** | What to do next | Direction |
| **Non-blocking** | Toast for small actions | Flow |
| **Celebratory** | Animation for big moments | Delight |
| **Green for success** | Consistent color | Recognition |

---

## 29. Pagination

### 29.1 What

Standard pagination patterns.

### 29.2 Why

- **Navigation:** Users browse large lists
- **Performance** Only load what's needed
- **Consistency:** Same pagination everywhere

### 29.3 Where

Product listings, order history, admin tables.

### 29.4 Pagination Types

| Type | Usage | Description |
|------|-------|-------------|
| **Numbered** | Admin tables | Page numbers |
| **Load more** | Product listings | Button to load more |
| **Infinite scroll** | Feeds | Auto-load on scroll |

### 29.5 Pagination Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Show current page** | Highlight active | Orientation |
| **Show total** | "Page 1 of 10" | Context |
| **Previous/Next** | Always available | Navigation |
| **Disabled states** | Gray out unavailable | Clarity |
| **Mobile-friendly** | Touch targets 44px | Accessibility |

---

## 30. Carousels

### 30.1 What

Standard carousel patterns.

### 30.2 Why

- **Space efficiency** Show multiple items in limited space
- **Engagement** Encourage exploration
- **Consistency** Same carousel behavior everywhere

### 30.3 Where

Homepage hero, product images, related products.

### 30.4 Carousel Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-play optional** | User can pause | Control |
| **Manual navigation** | Arrows + dots | Accessibility |
| **Swipe support** | Touch gestures | Mobile UX |
| **Loop optional** | Depends on content | Context |
| **Lazy load** | Load images on demand | Performance |
| **Keyboard accessible** | Arrow keys | Accessibility |

---

## 31. Tabs & Accordions

### 31.1 What

Standard tab and accordion patterns.

### 31.2 Why

- **Organization** Group related content
- **Progressive disclosure** Show only what's needed
- **Consistency** Same behavior everywhere

### 31.3 Where

Product details, settings, FAQs.

### 31.4 Tab Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Clear active state** | Highlighted tab | Orientation |
| **Keyboard navigation** | Arrow keys | Accessibility |
| **Lazy load content** | Load on tab switch | Performance |
| **Smooth transitions** | Fade or slide | Polish |
| **Mobile: scrollable** | Horizontal scroll | Touch-friendly |

### 31.5 Accordion Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single or multi** | Configurable | Flexibility |
| **Clear expand/collapse** | Icon + animation | Feedback |
| **Keyboard accessible** | Enter/Space to toggle | Accessibility |
| **Smooth animation** | Height transition | Polish |
| **Header always visible** | Content hidden | Progressive disclosure |

---

## 32. Animations & Motion

### 32.1 What

Standard animation principles and timing.

### 32.2 Why

- **Premium feel** Apple-level micro-interactions
- **Performance** Smooth 60fps animations
- **Accessibility** Respect reduced motion preferences
- **Consistency** Same timing and easing everywhere

### 32.3 Where

All interactive elements and transitions.

### 32.4 Animation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| **ease-luxe-out** | `cubic-bezier(0.22, 1, 0.36, 1)` | Smooth deceleration |
| **ease-luxe-in** | `cubic-bezier(0.55, 0, 0.75, 0.25)` | Smooth acceleration |
| **ease-spring** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy, playful |
| **duration-fast** | 150ms | Hover states |
| **duration-normal** | 300ms | Transitions |
| **duration-slow** | 500ms | Page transitions |
| **duration-slower** | 800ms | Complex animations |

### 32.5 Animation Rules

| Element | Duration | Easing | Effect |
|---------|----------|--------|--------|
| **Hover states** | 150ms | ease-luxe-out | Color change |
| **Card hover** | 300ms | ease-luxe-out | Lift + shadow |
| **Modal open** | 300ms | ease-spring | Scale up |
| **Page transition** | 500ms | ease-luxe-out | Fade + slide |
| **Loading skeleton** | 800ms | linear | Shimmer |
| **Button click** | 150ms | ease-luxe-in | Scale down |

### 32.6 Motion Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Purposeful** | Every animation has a purpose | No decoration |
| **Fast** | Under 500ms for most | Don't waste time |
| **Smooth** | Use CSS transforms, not layout properties | 60fps performance |
| **Respectful** | Honor `prefers-reduced-motion` | Accessibility |
| **Consistent** | Same timing and easing | Cohesive experience |
| **Subtle** | Don't distract from content | Premium feel |

### 32.7 Reduced Motion

```css
/* ✓ CORRECT: Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 33. Touch Interactions

### 33.1 What

Standard touch interaction patterns for mobile.

### 33.2 Why

- **Mobile-first** 70%+ traffic from mobile
- **Thumb-friendly** One-handed usage
- **Gesture support** Natural interactions

### 33.3 Where

All mobile interactions.

### 33.4 Touch Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Min touch target** | 44x44px | Accessibility |
| **Thumb zone** | Bottom of screen | Ergonomics |
| **Swipe gestures** | Natural scrolling | Familiarity |
| **Pull to refresh** | Standard pattern | Expectation |
| **Long press** | Context menus | Power users |
| **No hover dependency** | Works without hover | Mobile-first |

### 33.5 Touch Examples

```tsx
// ✓ CORRECT: Touch-friendly button
<button className="h-11 min-w-[44px] px-6">
  Add to Cart
</button>

// ✓ CORRECT: Swipeable product images
<div className="flex snap-x snap-mandatory overflow-x-auto">
  {images.map((image) => (
    <div key={image.id} className="w-full flex-shrink-0 snap-center">
      <img src={image.url} alt={image.alt} />
    </div>
  ))}
</div>
```

---

## 34. Accessibility

### 34.1 What

WCAG 2.2 AA compliance for all components and pages.

### 34.2 Why

- **Legal compliance** Meet accessibility laws
- **Inclusivity** Everyone can use the platform
- **SEO** Search engines favor accessible sites
- **Quality** Accessible code is better code

### 34.3 Where

All user-facing components and pages.

### 34.4 Accessibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Color contrast** | 4.5:1 for normal text, 3:1 for large text | Readability |
| **Focus indicators** | Visible on all interactive elements | Keyboard navigation |
| **Skip link** | Skip to main content link | Screen reader users |
| **ARIA labels** | On all icons and interactive elements | Screen reader users |
| **Keyboard navigation** | All features accessible via keyboard | Motor disabilities |
| **Reduced motion** | Honor `prefers-reduced-motion` | Vestibular disorders |
| **Alt text** | On all meaningful images | Screen reader users |
| **Form labels** | On all inputs | Screen reader users |
| **Error messages** | Clear, descriptive, associated with inputs | All users |
| **Heading hierarchy** | Proper H1-H6 order | Screen reader users |

### 34.5 ARIA Patterns

```tsx
// ✓ CORRECT: Proper ARIA usage
<button aria-label="Add to cart" onClick={addToCart}>
  <ShoppingCartIcon aria-hidden="true" />
</button>

// ✓ CORRECT: Form with proper labels
<div>
  <label htmlFor="email" className="block text-sm font-medium">
    Email address
  </label>
  <input
    id="email"
    type="email"
    aria-describedby="email-error"
    aria-invalid={hasError}
  />
  {hasError && (
    <p id="email-error" className="text-sm text-red-500">
      Please enter a valid email
    </p>
  )}
</div>

// ✓ CORRECT: Modal with focus trap
<Dialog role="dialog" aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Dialog Title</h2>
  {/* Dialog content */}
</Dialog>
```

---

## 35. Dark Mode Readiness

### 35.1 What

Standards for future dark mode support.

### 35.2 Why

- **User preference** Many users prefer dark mode
- **Accessibility** Reduces eye strain
- **Modern** Expected feature

### 35.3 Where

All components and styles.

### 35.4 Dark Mode Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use CSS variables** | Define colors as variables | Easy theming |
| **Separate concerns** | Don't mix colors with layout | Theme support |
| **Test contrast** | Ensure sufficient contrast | Accessibility |
| **Use Tailwind dark:** | Prefix for dark styles | Consistency |
| **No pure black** | Use `neutral-950` | Softer on eyes |

### 35.5 Dark Mode Preparation

```css
:root {
  --bg-primary: var(--color-neutral-50);
  --text-primary: var(--color-neutral-900);
  --border-color: var(--color-neutral-200);
}

.dark {
  --bg-primary: var(--color-neutral-950);
  --text-primary: var(--color-neutral-50);
  --border-color: var(--color-neutral-800);
}
```

---

## 36. Internationalization Readiness

### 36.1 What

Standards for supporting multiple languages.

### 36.2 Why

- **Global reach** Future international expansion
- **Inclusivity** Support for Indian languages
- **SEO** Language-specific content

### 36.3 Where

All text content and layouts.

### 36.4 i18n Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Text in variables** | Never hardcode strings | Translation |
| **RTL support** | Use logical properties | Future RTL languages |
| **Flexible layouts** | Accommodate longer text | Translation |
| **Date formats** | Use locale-aware formatting | Localization |
| **Number formats** | Use locale-aware formatting | Localization |
| **Currency formats** | Use locale-aware formatting | Localization |

---

## 37. UX Rules

### 37.1 What

Hard UX rules that every interface must follow.

### 37.2 Why

- **Usability** Users accomplish goals effortlessly
- **Delight** Every interaction feels polished
- **Trust** Consistent behavior builds confidence

### 37.3 Where

Every screen, every flow, every interaction.

### 37.4 UX Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One primary action per screen** | Clear CTAs | Focus |
| **3 clicks to any goal** | Deep but discoverable navigation | Efficiency |
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
| **Easy recovery from mistakes** | Mistakes are easy to fix | Flexibility |
| **Clear feedback for every action** | Every action has visible response | Trust |

---

## 38. Architectural Rules

### 38.1 What

Hard rules that every UI design must follow.

### 38.2 Why

- **Consistency** No exceptions to the rules
- **Quality** Every UI meets the standard
- **Maintainability** Predictable patterns

### 38.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Mobile-first** | Design for mobile first, enhance for desktop | 70%+ traffic |
| **Accessibility** | WCAG 2.2 AA compliance | Legal requirement |
| **Consistency** | Same patterns everywhere | Brand integrity |
| **Performance** | No layout shift, fast rendering | User experience |
| **No comments** | Code must be self-documenting | Comments rot |
| **No arbitrary values** | Use design tokens | Maintainability |
| **No visual clutter** | Minimal interface | Premium feel |
| **No gratuitous animation** | Purposeful motion only | Performance |
| **No hover dependency** | Works without hover | Mobile-first |
| **No color-only indicators** | Use icons + text | Accessibility |

### 38.4 Soft Rules

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **White space** | Generous spacing | Always |
| **Visual rhythm** | Consistent spacing | Always |
| **Progressive disclosure** | Show only what's needed | Complex interfaces |
| **Dark mode readiness** | Use CSS variables | All new components |
| **i18n readiness** | Text in variables | All new features |

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
