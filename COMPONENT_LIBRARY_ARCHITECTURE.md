# নবME (Nabome) — Component Library & Reusable UI System Architecture

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for component architecture  
> **Supersedes:** None — complements DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), ARCHITECTURE.md (v3.0), and FOLDER_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Component Philosophy & Foundation](#1-component-philosophy--foundation)
2. [Component Hierarchy & Atomic Design](#2-component-hierarchy--atomic-design)
3. [Component Architecture Rules](#3-component-architecture-rierarchy-rules)
4. [Input Components](#4-input-components)
5. [Navigation Components](#5-navigation-components)
6. [Content Components](#6-content-components)
7. [Feedback Components](#7-feedback-components)
8. [Overlay Components](#8-overlay-components)
9. [Data Components](#9-data-components)
10. [Media Components](#10-media-components)
11. [Form Components](#11-form-components)
12. [Dashboard Components](#12-dashboard-components)
13. [Component State Standards](#13-component-state-standards)
14. [Consistency Rules](#14-consistency-rules)
15. [Accessibility Requirements](#15-accessibility-requirements)
16. [Performance Requirements](#16-performance-requirements)
17. [Component Rules Reference](#17-component-rules-reference)

---

## 1. Component Philosophy & Foundation

### 1.1 What

The foundational principles that govern every component in the Nabome Design System.

### 1.2 Why

- **Brand Cohesion:** Every component feels like part of one premium product
- **Developer Efficiency:** No duplicated effort, no reinvented patterns
- **User Trust:** Consistent behavior across the entire platform
- **Maintainability:** One place to fix, one pattern to follow
- **Scalability:** New features compose from existing building blocks

### 1.3 Where

Every component in `src/shared/ui/`, `src/shared/layout/`, `src/shared/feedback/`, and `src/features/*/components/`.

### 1.4 Core Philosophy

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **One product** | Every screen belongs to Nabome | Same tokens, same patterns |
| **No duplication** | Every component exists once | Shared primitives only |
| **No one-off UI** | Every component is reusable | Generic props, composition |
| **Apple precision** | Every detail is intentional | Micro-interactions, spacing |
| **Zara editorial** | Content is king, UI is silent | Minimal chrome, bold imagery |
| **Mobile-first** | Design for thumb, enhance for desktop | Bottom nav, 44px targets |
| **Accessible by default** | WCAG 2.2 AA minimum | ARIA, keyboard, contrast |
| **Beginner-friendly** | First-time user succeeds | Clear labels, helpful hints |

### 1.5 Component Taxonomy

```
┌─────────────────────────────────────────────────────────────────┐
│                    NABOME COMPONENT TAXONOMY                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: PRIMITIVES (src/shared/ui/)                    │   │
│  │  Button, Input, Badge, Card, Dialog, Toast, Skeleton     │   │
│  │  → Zero business logic, pure UI atoms                    │   │
│  │  → forwardRef, displayName, className prop               │   │
│  │  → Accept variant/size/state props                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: COMPOSITIONS (src/shared/layout/, feedback/)   │   │
│  │  Header, Footer, Layout, ErrorBoundary, LoadingSpinner   │   │
│  │  → Compose primitives into patterns                      │   │
│  │  → Still no business logic                               │   │
│  │  → Layout-aware, responsive                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: FEATURE COMPONENTS (src/features/*/components/) │   │
│  │  ProductCard, LoginForm, CartDrawer, OrderList           │   │
│  │  → Domain-specific compositions                          │   │
│  │  → Use primitives + shared compositions                  │   │
│  │  → May use feature hooks/stores                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: PAGES (src/features/*/pages/)                  │   │
│  │  HomePage, ProductPage, CheckoutPage, AdminDashboard     │   │
│  │  → Route-level components                                │   │
│  │  → Compose feature components                            │   │
│  │  → Handle data fetching and routing                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 What NOT to Build

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Page-specific components | Not reusable, code rot | Compose from shared primitives |
| Duplicated components | Inconsistent behavior | One component, multiple variants |
| Components with business logic | Untestable, coupled | Separate UI from logic |
| Hardcoded colors/values | Inconsistent, hard to theme | Use design tokens |
| Components without accessibility | Excludes users | ARIA, keyboard, contrast |
| Components without responsive props | Broken on mobile | Responsive behavior built-in |
| Components without loading states | Poor UX | Loading states required |
| Components without error states | Poor UX | Error states required |

---

## 2. Component Hierarchy & Atomic Design

### 2.1 What

How components are organized from smallest to largest, ensuring maximum reusability.

### 2.2 Why

- **Reusability:** Atoms compose into molecules, molecules into organisms
- **Consistency:** Same building blocks everywhere
- **Scalability:** Add new features by combining existing pieces
- **Testing:** Test atoms in isolation, molecules with atoms, etc.

### 2.3 Where

All component files across the codebase.

### 2.4 Atomic Design Mapping

| Atomic Level | Nabome Location | Examples | Rules |
|--------------|-----------------|----------|-------|
| **Atoms** | `src/shared/ui/` | Button, Input, Badge, Icon, Label | Zero logic, pure presentation |
| **Molecules** | `src/shared/ui/` | SearchInput, FormField, CardHeader | Compose 2-3 atoms |
| **Organisms** | `src/shared/layout/` | Header, Footer, Sidebar, MegaMenu | Compose molecules + atoms |
| **Templates** | `src/shared/layout/` | Layout, AdminLayout, AuthLayout | Page structure, no data |
| **Pages** | `src/features/*/pages/` | HomePage, ProductPage | Templates + data + logic |

### 2.5 Component Complexity Budget

| Level | Max Lines | Max Props | Max Children | Rationale |
|-------|-----------|-----------|--------------|-----------|
| **Atom** | 100 | 10 | 0-1 | Simple, focused |
| **Molecule** | 150 | 8 | 2-3 | Moderate composition |
| **Organism** | 200 | 6 | 3-5 | Complex but readable |
| **Template** | 150 | 4 | 2-3 | Structure only |
| **Page** | 300 | N/A | N/A | Route-level composition |

### 2.6 Composition Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Compose, don't extend** | Use children/render props, not inheritance | Flexibility |
| **Props over config** | Prefer props for customization | Type safety |
| **Slots for layout** | Use children for content slots | Flexibility |
| **Compound components** | Use dot notation for related pieces | Discoverability |
| **No deep nesting** | Max 3 levels of component nesting | Readability |
| **Flat exports** | Export all compound parts from same file | Easy imports |

---

## 3. Component Architecture Rules

### 3.1 What

The hard rules that every component must follow without exception.

### 3.2 Why

- **Consistency:** Every component behaves the same way
- **Predictability:** Developers know what to expect
- **Quality:** No exceptions to the standard
- **Maintainability:** Uniform patterns reduce cognitive load

### 3.3 Where

Every component file in the codebase.

### 3.4 Hard Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One component per file** | File name matches component name exactly | Easy to find, easy to test |
| **Named exports only** | No default exports | Better refactoring, explicit imports |
| **forwardRef on all** | All UI primitives use forwardRef | Composability with third-party libs |
| **displayName set** | All components have displayName | React DevTools debugging |
| **No business logic** | Components are pure UI | Separation of concerns |
| **No API calls** | Components receive data via props | Testability, reusability |
| **No Zustand imports** | Shared components use props, not global state | Flexibility |
| **No feature imports** | Shared components cannot import from features | Prevents circular deps |
| **Responsive by default** | Components work on mobile, tablet, desktop | Mobile-first |
| **Accessible by default** | ARIA labels, keyboard nav, focus states | WCAG compliance |
| **Loading state support** | Components accept isLoading prop or use Skeleton | UX consistency |
| **Error state support** | Components handle error display | UX consistency |
| **Dark mode ready** | Use CSS variables, not hardcoded colors | Future-proof |
| **i18n ready** | No hardcoded strings in UI | Future internationalization |

### 3.5 Component File Template

```typescript
// ✓ CORRECT: Complete component template
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

// 1. Props interface with JSDoc
interface ComponentProps {
  /** Component variant */
  variant?: 'primary' | 'secondary';
  /** Component size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Component content */
  children: React.ReactNode;
}

// 2. Variant styles mapped to Tailwind classes
const variantStyles = {
  primary: 'bg-brand-500 text-white hover:bg-brand-600',
  secondary: 'bg-white text-brand-500 border border-brand-500 hover:bg-brand-50',
} as const;

const sizeStyles = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-10 px-6 text-sm',
  lg: 'h-12 px-8 text-base',
} as const;

// 3. Component with forwardRef
const Component = forwardRef<HTMLDivElement, ComponentProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading,
      disabled,
      className,
      children,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
      >
        {children}
      </div>
    );
  }
);

// 4. Set displayName
Component.displayName = 'Component';

// 5. Named export with type
export { Component, type ComponentProps };
```

### 3.6 Variant Strategy

| Pattern | Usage | Example |
|---------|-------|---------|
| **String union variants** | Simple, exclusive variants | `variant: 'primary' \| 'secondary'` |
| **Boolean flags** | Independent boolean states | `isLoading`, `disabled`, `isActive` |
| **Size variants** | Consistent sizing across components | `size: 'sm' \| 'md' \| 'lg'` |
| **Color variants** | Status or semantic colors | `color: 'success' \| 'error' \| 'warning'` |
| **Compound variants** | Combinations of variants | `variant + size` → specific styles |

### 3.7 Slot Strategy

| Pattern | Usage | Example |
|---------|-------|---------|
| **children** | Primary content slot | `<Button>Click me</Button>` |
| **render prop** | Dynamic content | `renderIcon={(props) => <Icon {...props} />}` |
| **Named slots** | Multiple content areas | `leftIcon`, `rightIcon`, `prefix`, `suffix` |
| **Compound components** | Related sub-components | `Card.Header`, `Card.Body` |
| **as prop** | Polymorphic rendering | `<Button as="a" href="/url">` |

### 3.8 Theme Support

| Pattern | Implementation | Rationale |
|---------|---------------|-----------|
| **CSS variables** | All colors via `var(--color-*)` | Runtime theming |
| **Tailwind tokens** | Use `brand-*`, `neutral-*` classes | Consistent values |
| **Dark mode prefix** | `dark:` prefix for dark styles | Tailwind convention |
| **No hardcoded values** | Never use `#8b6940` directly | Maintainability |
| **Semantic tokens** | Use `status-*`, `accent-*` | Meaning over appearance |

### 3.9 Responsive Behavior

| Pattern | Implementation | Rationale |
|---------|---------------|-----------|
| **Mobile-first** | Base styles for mobile, `sm:`, `md:`, `lg:` for larger | 70%+ mobile traffic |
| **Responsive props** | `size={{ mobile: 'sm', desktop: 'lg' }}` | Per-breakpoint control |
| **Container queries** | `@container` for component-level responsiveness | Future-proof |
| **Conditional rendering** | `<div className="hidden md:block">` | Show/hide per breakpoint |
| **Responsive typography** | `text-3xl sm:text-4xl lg:text-5xl` | Scale with viewport |

---

## 4. Input Components

### 4.1 Button

**What:** Primary interactive element for user actions.

**Why:**
- Most-used interactive element
- Clear visual hierarchy (primary vs secondary actions)
- Accessible by default

**Where:** All interactive actions across the platform.

**Component:** `src/shared/ui/Button.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'outline' \| 'gold' \| 'danger'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `isLoading` | `boolean` | `false` | Shows spinner, disables interaction |
| `disabled` | `boolean` | `false` | Disables the button |
| `leftIcon` | `React.ReactNode` | — | Icon before label |
| `rightIcon` | `React.ReactNode` | — | Icon after label |
| `as` | `React.ElementType` | `'button'` | Polymorphic rendering |
| `fullWidth` | `boolean` | `false` | Full width on mobile |

**Best Practices:**
- One primary action per section
- Loading state replaces text with spinner
- Minimum touch target 44x44px
- Full width on mobile for primary actions
- `type="submit"` only on form submit buttons

**Common Mistakes:**
- Multiple primary buttons in one section → Use secondary for secondary actions
- No loading state → Always show feedback during async operations
- Missing disabled state → Disable during loading or when action unavailable
- Using `<div onClick>` → Always use `<button>` for accessibility

### 4.2 IconButton

**What:** Button with only an icon, no text label.

**Why:**
- Space-efficient for toolbar actions
- Accessible with aria-label
- Consistent icon sizing

**Where:** Toolbars, card actions, close buttons, navigation.

**Component:** `src/shared/ui/IconButton.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | required | The icon to display |
| `ariaLabel` | `string` | required | Accessible label |
| `variant` | `'primary' \| 'ghost' \| 'outline'` | `'ghost'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |

**Best Practices:**
- Always provide `ariaLabel` for screen readers
- Icon decorative: `aria-hidden="true"`
- Match icon size to button size
- Use ghost variant for secondary actions

**Common Mistakes:**
- No aria-label → Screen readers can't identify the action
- Icon too small for touch target → Minimum 44x44px hit area
- Inconsistent icon sizes → Match to adjacent text size

### 4.3 TextInput

**What:** Standard single-line text input field.

**Why:**
- Consistent input behavior across all forms
- Clear states (default, focus, error, disabled, success)
- Accessible with labels and ARIA

**Where:** All text input forms: login, checkout, search, admin.

**Component:** `src/shared/ui/Input.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Visible label text |
| `error` | `string` | — | Error message |
| `helperText` | `string` | — | Helper text below input |
| `leftAddon` | `React.ReactNode` | — | Content before input |
| `rightAddon` | `React.ReactNode` | — | Content after input |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `disabled` | `boolean` | `false` | Disabled state |

**Best Practices:**
- Labels always visible (not floating, not placeholder-only)
- Error text below input, red, associated via `aria-describedby`
- Helper text below input, gray
- Minimum height 40px for touch targets
- `autocomplete` attribute for speed
- Validate on blur, not on every keystroke

**Common Mistakes:**
- Placeholder as label → Label disappears when typing, bad for accessibility
- No error association → Error must be linked via `aria-describedby`
- No autocomplete → Users can't use browser autofill
- Floating labels → Confusing for beginners, not Nabome style

### 4.4 PasswordInput

**What:** Text input with show/hide password toggle.

**Why:**
- Users need to verify password input
- Security: toggle visibility on demand
- Consistent with TextInput styling

**Where:** Login, registration, password change forms.

**Component:** `src/shared/ui/PasswordInput.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Visible label text |
| `error` | `string` | — | Error message |
| `showToggle` | `boolean` | `true` | Show/hide toggle button |
| `autoComplete` | `string` | `'current-password'` | Autocomplete value |

**Best Practices:**
- Default to hidden (type="password")
- Toggle button with clear icon (Eye/EyeOff)
- aria-label on toggle button
- autocomplete="current-password" for login, "new-password" for registration

### 4.5 SearchInput

**What:** Input with search icon and clear button.

**Why:**
- Discoverable search functionality
- Instant results with debounced input
- Consistent search experience

**Where:** Header search, search page, admin search.

**Component:** `src/shared/ui/SearchInput.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `'Search...'` | Placeholder text |
| `onSearch` | `(value: string) => void` | — | Search callback |
| `onClear` | `() => void` | — | Clear callback |
| `debounceMs` | `number` | `300` | Debounce delay |
| `isLoading` | `boolean` | `false` | Loading indicator |

**Best Practices:**
- Debounce input 300ms for performance
- Show clear button when input has value
- Keyboard support: Enter to search, Escape to clear
- Auto-focus on mount when appropriate

### 4.6 Textarea

**What:** Multi-line text input for longer content.

**Why:**
- Consistent with TextInput styling
- Auto-resize capability
- Character count support

**Where:** Reviews, descriptions, notes, contact forms.

**Component:** `src/shared/ui/Textarea.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Visible label text |
| `error` | `string` | — | Error message |
| `helperText` | `string` | — | Helper text |
| `autoResize` | `boolean` | `false` | Auto-grow with content |
| `maxLength` | `number` | — | Maximum characters |
| `showCount` | `boolean` | `false` | Show character count |

**Best Practices:**
- Auto-resize to prevent scrollbars
- Character count when maxLength is set
- Min 3 rows visible by default
- Max height with scroll for long content

### 4.7 NumberInput

**What:** Input for numeric values with increment/decrement controls.

**Why:**
- Constrain input to numbers only
- Quick adjustment with buttons
- Consistent with TextInput styling

**Where:** Quantity selectors, price inputs, admin forms.

**Component:** `src/shared/ui/NumberInput.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Current value |
| `onChange` | `(value: number) => void` | — | Value change callback |
| `min` | `number` | — | Minimum value |
| `max` | `number` | — | Maximum value |
| `step` | `number` | `1` | Increment step |
| `showControls` | `boolean` | `true` | Show +/- buttons |

**Best Practices:**
- Disable - at min, + at max
- Keyboard arrows for increment/decrement
- Format display (e.g., currency)
- Validate on blur

### 4.8 OTPInput

**What:** One-time password input with separate digit fields.

**Why:**
- Clear visual feedback for verification codes
- Auto-advance between fields
- Paste support

**Where:** Email verification, phone verification, 2FA.

**Component:** `src/shared/ui/OTPInput.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` | `number` | `6` | Number of digits |
| `onComplete` | `(otp: string) => void` | — | Called when all digits entered |
| `autoFocus` | `boolean` | `true` | Auto-focus first field |

**Best Practices:**
- Auto-advance on input
- Auto-backspace on delete
- Support paste of full OTP
- Auto-submit when complete
- Clear error state on new input

### 4.9 Checkbox

**What:** Binary toggle for multiple selections.

**Why:**
- Standard form control
- Accessible with keyboard
- Clear checked/unchecked states

**Where:** Filters, settings, agreements, bulk actions.

**Component:** `src/shared/ui/Checkbox.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Checked state |
| `onChange` | `(checked: boolean) => void` | — | Change callback |
| `label` | `React.ReactNode` | — | Label text |
| `disabled` | `boolean` | `false` | Disabled state |
| `error` | `boolean` | `false` | Error state |

**Best Practices:**
- Minimum 44x44px touch target
- Label clickable to toggle
- Keyboard: Space to toggle
- Indeterminate state support for "select all"

### 4.10 Radio

**What:** Single selection from a group of options.

**Why:**
- Standard form control for exclusive choices
- Accessible with keyboard
- Clear selected state

**Where:** Payment method selection, sort options, form choices.

**Component:** `src/shared/ui/Radio.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Selected state |
| `onChange` | `() => void` | — | Change callback |
| `label` | `React.ReactNode` | — | Label text |
| `disabled` | `boolean` | `false` | Disabled state |

**Best Practices:**
- Group radios with `role="radiogroup"`
- Keyboard: Arrow keys to navigate, Space to select
- Minimum 44x44px touch target
- Label clickable to select

### 4.11 Switch

**What:** Toggle between two states (on/off).

**Why:**
- Clear binary choice
- Immediate feedback
- Familiar mobile pattern

**Where:** Settings, notifications, feature toggles.

**Component:** `src/shared/ui/Switch.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | — | Switch state |
| `onChange` | `(checked: boolean) => void` | — | Change callback |
| `label` | `string` | — | Label text |
| `disabled` | `boolean` | `false` | Disabled state |

**Best Practices:**
- Label on left, switch on right
- Keyboard: Space to toggle
- Immediate state change (no confirmation needed)
- Color change to indicate state (brand-500 when on)

### 4.12 Slider

**What:** Range input for selecting a value within a range.

**Why:**
- Visual selection of continuous values
- Touch-friendly on mobile
- Clear current value display

**Where:** Price range filters, rating filters, volume controls.

**Component:** `src/shared/ui/Slider.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `min` | `number` | required | Minimum value |
| `max` | `number` | required | Maximum value |
| `value` | `[number, number]` | — | Current value(s) |
| `onChange` | `(value: [number, number]) => void` | — | Change callback |
| `step` | `number` | `1` | Step increment |

**Best Practices:**
- Show current value as tooltip or label
- Keyboard arrows for fine control
- Touch-friendly thumb (44px minimum)
- Visual feedback for selected range

### 4.13 Select

**What:** Dropdown selection from a list of options.

**Why:**
- Space-efficient for long option lists
- Keyboard accessible
- Consistent styling

**Where:** Category filters, country selection, sort options.

**Component:** `src/shared/ui/Select.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<{ value: string; label: string }>` | required | Available options |
| `value` | `string` | — | Selected value |
| `onChange` | `(value: string) => void` | — | Change callback |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |

**Best Practices:**
- Custom dropdown for consistent styling
- Keyboard: Arrow keys to navigate, Enter to select, Escape to close
- Search/filter for long lists (combobox pattern)
- Group related options with optgroup

### 4.14 MultiSelect

**What:** Select multiple options from a list.

**Why:**
- Multiple selections in compact space
- Clear selected items display
- Remove individual selections

**Where:** Category filters, tag selection, permission assignment.

**Component:** `src/shared/ui/MultiSelect.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<{ value: string; label: string }>` | required | Available options |
| `value` | `string[]` | — | Selected values |
| `onChange` | `(values: string[]) => void` | — | Change callback |
| `maxSelections` | `number` | — | Maximum selections |
| `placeholder` | `string` | `'Select...'` | Placeholder text |

**Best Practices:**
- Show selected items as tags/chips
- Allow removing individual selections
- Clear all button
- Count display ("3 selected")

### 4.15 Combobox

**What:** Searchable select with autocomplete.

**Why:**
- Fast selection from large lists
- Type-ahead search
- Best of both worlds (input + select)

**Where:** Product search, user search, tag selection.

**Component:** `src/shared/ui/Combobox.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Array<{ value: string; label: string }>` | required | Available options |
| `value` | `string` | — | Selected value |
| `onChange` | `(value: string) => void` | — | Change callback |
| `onSearch` | `(query: string) => void` | — | Search callback |
| `placeholder` | `string` | `'Search...'` | Placeholder text |

**Best Practices:**
- Debounce search input
- Show suggestions as user types
- Keyboard: Arrow keys, Enter to select, Escape to close
- Highlight matching text in suggestions

### 4.16 DatePicker

**What:** Calendar-based date selection.

**Why:**
- Visual date selection
- Prevents invalid dates
- Consistent date format

**Where:** Birth date, delivery date, date range filters.

**Component:** `src/shared/ui/DatePicker.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| null` | — | Selected date |
| `onChange` | `(date: Date \| null) => void` | — | Change callback |
| `min` | `Date` | — | Minimum selectable date |
| `max` | `Date` | — | Maximum selectable date |
| `placeholder` | `string` | `'Select date'` | Placeholder text |

**Best Practices:**
- Mobile: native date picker for better UX
- Desktop: custom calendar dropdown
- Keyboard: Arrow keys to navigate, Enter to select
- Clear format display (DD/MM/YYYY for India)

### 4.17 TimePicker

**What:** Time selection with hours and minutes.

**Why:**
- Consistent time input
- Prevents invalid times
- Clear time display

**Where:** Appointment scheduling, delivery time, event timing.

**Component:** `src/shared/ui/TimePicker.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` | — | Selected time (HH:mm) |
| `onChange` | `(time: string \| null) => void` | — | Change callback |
| `min` | `string` | — | Minimum time |
| `max` | `string` | — | Maximum time |
| `step` | `number` | `15` | Minute increment |

### 4.18 FileUpload

**What:** File upload with drag-and-drop support.

**Why:**
- Intuitive file selection
- Drag-and-drop for desktop
- Touch-friendly for mobile

**Where:** Profile picture, document upload, CSV import.

**Component:** `src/shared/ui/FileUpload.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | — | Accepted file types |
| `maxSize` | `number` | — | Maximum file size in bytes |
| `onUpload` | `(file: File) => void` | — | Upload callback |
| `multiple` | `boolean` | `false` | Allow multiple files |

**Best Practices:**
- Show file type restrictions clearly
- Validate file type and size before upload
- Show upload progress
- Preview uploaded files
- Error messages for rejected files

### 4.19 ImageUpload

**What:** Image-specific upload with preview and crop.

**Why:**
- Preview before upload
- Crop/resize functionality
- Image-specific validation

**Where:** Profile picture, product images, banner images.

**Component:** `src/shared/ui/ImageUpload.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` | — | Current image URL |
| `onChange` | `(file: File \| null) => void` | — | Change callback |
| `aspectRatio` | `number` | `1` | Crop aspect ratio |
| `maxSize` | `number` | `5 * 1024 * 1024` | Max file size (5MB default) |

**Best Practices:**
- Show current image as preview
- Crop tool for aspect ratio enforcement
- Client-side compression before upload
- Clear remove button
- Loading state during upload

### 4.20 VideoUpload

**What:** Video upload with thumbnail generation.

**Why:**
- Video-specific validation
- Thumbnail preview
- Upload progress

**Where:** Product videos, lookbook videos, tutorial videos.

**Component:** `src/shared/ui/VideoUpload.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string \| null` | — | Current video URL |
| `onChange` | `(file: File \| null) => void` | — | Change callback |
| `maxSize` | `number` | `50 * 1024 * 1024` | Max file size (50MB default) |
| `accept` | `string` | `'video/*'` | Accepted video types |

**Best Practices:**
- Show video thumbnail preview
- Display video duration and file size
- Compress before upload when possible
- Progress indicator during upload
- Clear error messages for unsupported formats

---

## 5. Navigation Components

### 5.1 Header

**What:** Site-wide header with logo, navigation, and actions.

**Why:**
- Primary navigation element
- Always accessible
- Brand identity anchor

**Where:** All pages, sticky on scroll.

**Component:** `src/shared/layout/Header.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'transparent' \| 'minimal'` | `'default'` | Header style |
| `sticky` | `boolean` | `true` | Sticky on scroll |
| `children` | `React.ReactNode` | — | Custom header content |

**Best Practices:**
- Logo always links to home
- Search prominent on desktop
- Cart with item count badge
- User account dropdown
- Backdrop blur on scroll
- Height: 64px mobile, 80px desktop

### 5.2 Footer

**What:** Site-wide footer with links and information.

**Why:**
- Secondary navigation
- Legal and company information
- Newsletter signup

**Where:** All pages, bottom of viewport.

**Component:** `src/shared/layout/Footer.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'minimal'` | `'default'` | Footer style |

**Best Practices:**
- Organized link columns
- Social media icons
- Newsletter signup form
- Payment method icons
- Copyright and legal links
- Mobile: collapsible sections

### 5.3 Sidebar

**What:** Vertical navigation panel for dashboard and admin.

**Why:**
- Efficient for many navigation items
- Collapsible for space
- Persistent navigation context

**Where:** Admin panel, account dashboard.

**Component:** `src/shared/layout/Sidebar.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `collapsed` | `boolean` | `false` | Collapsed state |
| `onToggle` | `() => void` | — | Toggle callback |
| `items` | `NavItems[]` | required | Navigation items |

**Best Practices:**
- Collapsible on desktop (icon-only mode)
- Hidden on mobile (use bottom nav or drawer)
- Active state highlighting
- Group related items with sections
- Badge support for notification counts

### 5.4 BottomNavigation

**What:** Mobile bottom tab bar for primary navigation.

**Why:**
- Thumb-friendly on mobile
- Always visible
- Clear active state

**Where:** Mobile view of all customer-facing pages.

**Component:** `src/shared/layout/BottomNav.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavItems[]` | required | Navigation items (max 5) |
| `activePath` | `string` | required | Current active path |

**Best Practices:**
- Maximum 5 items
- Icons + labels always visible
- Active state: brand-500 color
- Badge on cart icon
- Fixed to bottom of viewport
- Safe area padding for notched phones

### 5.5 Breadcrumb

**What:** Hierarchical navigation showing current location.

**Why:**
- Orientation: users know where they are
- Quick navigation to parent pages
- SEO-friendly structure

**Where:** Product pages, category pages, admin pages.

**Component:** `src/shared/ui/Breadcrumbs.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `Array<{ label: string; href?: string }>` | required | Breadcrumb items |
| `separator` | `React.ReactNode` | `'/'` | Separator character |

**Best Practices:**
- Last item is current page (not a link)
- Truncate on mobile (show first + last)
- Schema.org BreadcrumbList for SEO
- Keyboard navigable

### 5.6 Pagination

**What:** Navigation between pages of content.

**Why:**
- Browse large lists efficiently
- Performance: load only current page
- Clear current page indication

**Where:** Product listings, order history, admin tables.

**Component:** `src/shared/ui/Pagination.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentPage` | `number` | required | Current page |
| `totalPages` | `number` | required | Total pages |
| `onPageChange` | `(page: number) => void` | — | Page change callback |
| `variant` | `'numbered' \| 'loadMore' \| 'infinite'` | `'numbered'` | Pagination style |

**Best Practices:**
- Show current page and total
- Previous/Next always available (disabled when not applicable)
- Mobile: simplified (prev/next only)
- Load more for product listings
- Infinite scroll for feeds

### 5.7 Tabs

**What:** Switch between different content views.

**Why:**
- Organize related content
- Progressive disclosure
- Clear active state

**Where:** Product details, settings, account pages.

**Component:** `src/shared/ui/Tabs.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tabs` | `Array<{ id: string; label: string; content: React.ReactNode }>` | required | Tab definitions |
| `activeTab` | `string` | — | Controlled active tab |
| `onChange` | `(tabId: string) => void` | — | Tab change callback |

**Best Practices:**
- Clear active state (underline or background)
- Keyboard: Arrow keys to navigate tabs, Enter to select
- Mobile: scrollable horizontal tabs
- Lazy load tab content for performance
- Smooth transitions between tabs

### 5.8 Stepper

**What:** Multi-step progress indicator.

**Why:**
- Show progress in multi-step flows
- Clear current step
- Allow navigation to completed steps

**Where:** Checkout flow, account setup, onboarding.

**Component:** `src/shared/ui/Stepper.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `Array<{ id: string; label: string; status?: 'completed' \| 'current' \| 'upcoming' }>` | required | Step definitions |
| `currentStep` | `string` | required | Current step ID |
| `onStepClick` | `(stepId: string) => void` | — | Step click callback |

**Best Practices:**
- Show step number and label
- Completed steps: checkmark icon
- Current step: highlighted
- Upcoming steps: muted
- Mobile: horizontal scroll or compact view
- Click only on completed steps (not upcoming)

### 5.9 MegaMenu

**What:** Desktop dropdown with multiple columns of navigation.

**Why:**
- Display many categories at once
- Visual navigation with images
- Quick access to subcategories

**Where:** Desktop header navigation.

**Component:** `src/shared/layout/MegaMenu.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `categories` | `Category[]` | required | Category tree |
| `featured` | `FeaturedItem[]` | — | Featured products/collections |

**Best Practices:**
- Open on hover (desktop) with delay
- Close on mouse leave with delay
- Keyboard: Enter to open, Escape to close
- Smooth animation (fade + slide)
- Featured images for visual appeal

### 5.10 DropdownMenu

**What:** Contextual menu triggered by a button.

**Why:**
- Space-efficient for multiple actions
- Keyboard accessible
- Consistent styling

**Where:** User menu, action menus, filters.

**Component:** `src/shared/ui/DropdownMenu.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `React.ReactNode` | required | Trigger element |
| `items` | `MenuItem[]` | required | Menu items |
| `align` | `'left' \| 'right'` | `'left'` | Alignment |

**Best Practices:**
- Keyboard: Arrow keys to navigate, Enter to select, Escape to close
- Focus trap within menu
- Close on click outside
- Icons support for menu items
- Dividers for grouping
- Disabled state for items

### 5.11 ContextMenu

**What:** Right-click or long-press context menu.

**Why:**
- Power user shortcuts
- Context-specific actions
- Familiar desktop pattern

**Where:** Admin table rows, product images, file management.

**Component:** `src/shared/ui/ContextMenu.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `React.ReactNode` | required | Trigger element |
| `items` | `MenuItem[]` | required | Menu items |

**Best Practices:**
- Right-click on desktop
- Long-press on mobile
- Keyboard: Shift+F10 or Menu key
- Close on click outside or Escape

---

## 6. Content Components

### 6.1 Card

**What:** Generic container for grouping related content.

**Why:**
- Visual grouping
- Consistent padding and styling
- Hover interactions

**Where:** Product listings, admin dashboards, settings.

**Component:** `src/shared/ui/Card.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'elevated' \| 'outlined' \| 'interactive'` | `'default'` | Card style |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Inner padding |
| `hover` | `boolean` | `false` | Hover effect |

**Compound Parts:**
- `Card.Header` — Top section with title/actions
- `Card.Body` — Main content area
- `Card.Footer` — Bottom section with actions
- `Card.Title` — Card title text
- `Card.Description` — Card description text

**Best Practices:**
- Consistent border-radius (radius-lg)
- Subtle border (neutral-100)
- Hover elevation for interactive cards
- No heavy decoration
- Responsive padding

### 6.2 ProductCard

**What:** Card for displaying product information in listings.

**Why:**
- Consistent product presentation
- Key information at a glance
- Quick actions (add to cart, wishlist)

**Where:** Product grids, featured sections, related products.

**Component:** `src/features/products/components/ProductCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `product` | `Product` | required | Product data |
| `layout` | `'grid' \| 'list'` | `'grid'` | Display layout |
| `showQuickActions` | `boolean` | `true` | Show hover actions |

**Best Practices:**
- 3:4 aspect ratio for images
- Product name, price, brand visible
- Wishlist button (heart icon)
- Quick add to cart on hover (desktop)
- Skeleton loading state
- Sale badge when applicable

### 6.3 CollectionCard

**What:** Card for displaying product collections.

**Why:**
- Visual collection discovery
- Hero imagery
- Clear collection name

**Where:** Homepage, category page, featured sections.

**Component:** `src/features/products/components/CollectionCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `collection` | `Collection` | required | Collection data |
| `aspectRatio` | `'1:1' \| '3:4' \| '16:9'` | `'3:4'` | Image aspect ratio |

**Best Practices:**
- Large, compelling imagery
- Collection name overlay
- Product count badge
- Hover zoom effect
- Skeleton loading state

### 6.4 CategoryCard

**What:** Card for displaying product categories.

**Why:**
- Visual category navigation
- Clear category name
- Consistent sizing

**Where:** Homepage, category listing, mega menu.

**Component:** `src/features/products/components/CategoryCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `category` | `Category` | required | Category data |
| `showProductCount` | `boolean` | `false` | Show product count |

**Best Practices:**
- Square or 1:1 aspect ratio
- Category image or icon
- Category name prominently displayed
- Product count (optional)
- Hover scale effect

### 6.5 BlogCard

**What:** Card for displaying blog articles.

**Why:**
- Content discovery
- Consistent article presentation
- Clear read more CTA

**Where:** Blog listing, homepage featured section.

**Component:** `src/features/home/components/BlogCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `article` | `BlogArticle` | required | Article data |
| `variant` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout variant |

**Best Practices:**
- Featured image with 16:9 aspect ratio
- Title, excerpt, date, author
- Read time estimate
- Category tag
- Hover elevation

### 6.6 ProfileCard

**What:** Card for displaying user profile information.

**Why:**
- Consistent profile presentation
- Key user info at a glance
- Action buttons

**Where:** Account page, admin customer list, team pages.

**Component:** `src/shared/ui/ProfileCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `User` | required | User data |
| `variant` | `'compact' \| 'full'` | `'compact'` | Display variant |

**Best Practices:**
- Avatar (circular, 48px+ for compact, 96px+ for full)
- Name and email visible
- Role badge if applicable
- Action buttons (edit, message, etc.)

### 6.7 StatisticCard

**What:** Card for displaying key metrics and KPIs.

**Why:**
- Quick data overview
- Trend visualization
- Dashboard-ready

**Where:** Admin dashboard, analytics pages.

**Component:** `src/features/admin/components/StatisticCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Metric label |
| `value` | `string \| number` | required | Metric value |
| `change` | `number` | — | Percentage change |
| `icon` | `React.ReactNode` | — | Metric icon |

**Best Practices:**
- Large, readable number
- Trend arrow (up/down) with color
- Comparison period label
- Icon for visual association
- Responsive sizing

### 6.8 InformationCard

**What:** Card for displaying informational content with icon.

**Why:**
- Highlight important information
- Visual hierarchy with icon
- Call-to-action support

**Where:** Feature highlights, help sections, onboarding.

**Component:** `src/shared/ui/InformationCard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | required | Information icon |
| `title` | `string` | required | Card title |
| `description` | `string` | required | Card description |
| `action` | `{ label: string; href: string }` | — | Optional action |

**Best Practices:**
- Icon at top or left
- Clear title and description
- Action link if applicable
- Consistent icon sizing (xl or 2xl)

---

## 7. Feedback Components

### 7.1 Alert

**What:** Inline message for important information.

**Why:**
- Draw attention to critical information
- Different severity levels
- Dismissible or persistent

**Where:** Form errors, system messages, promotional banners.

**Component:** `src/shared/ui/Alert.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Alert severity |
| `title` | `string` | — | Alert title |
| `dismissible` | `boolean` | `false` | Show close button |
| `onDismiss` | `() => void` | — | Dismiss callback |

**Best Practices:**
- Icon matching severity
- Clear, concise message
- Action links if applicable
- Color coding: info (blue), success (green), warning (amber), error (red)
- Accessible: `role="alert"` for errors, `role="status"` for others

### 7.2 Toast

**What:** Brief notification that appears and auto-dismisses.

**Why:**
- Non-blocking feedback
- Confirmation of actions
- Consistent notification behavior

**Where:** Action confirmations, success messages, warnings.

**Component:** `src/shared/ui/Toast.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'success' \| 'error' \| 'warning' \| 'info'` | `'info'` | Toast type |
| `title` | `string` | required | Toast title |
| `description` | `string` | — | Toast description |
| `duration` | `number` | `5000` | Auto-dismiss duration |
| `action` | `{ label: string; onClick: () => void }` | — | Action button |

**Best Practices:**
- Position: top-right (desktop), top (mobile)
- Auto-dismiss after 5 seconds
- Max 3 visible at once
- Dismissible with close button
- Stacked: newest on top
- Animation: slide in from right

### 7.3 Snackbar

**What:** Bottom-aligned notification with action.

**Why:**
- Action-oriented feedback
- Undo capability
- Mobile-friendly position

**Where:** Delete confirmations, undo actions, mobile notifications.

**Component:** `src/shared/ui/Snackbar.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | required | Snackbar message |
| `action` | `{ label: string; onClick: () => void }` | — | Action button |
| `duration` | `number` | `5000` | Auto-dismiss duration |

**Best Practices:**
- Position: bottom of viewport
- Single action (often "Undo")
- Auto-dismiss after 5 seconds
- Don't stack: replace previous

### 7.4 Badge

**What:** Small label for status, count, or category.

**Why:**
- Quick status indication
- Count display
- Category labeling

**Where:** Notification counts, status indicators, category tags.

**Component:** `src/shared/ui/Badge.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'gold'` | `'default'` | Badge style |
| `size` | `'sm' \| 'md'` | `'sm'` | Badge size |
| `dot` | `boolean` | `false` | Show dot indicator |

**Best Practices:**
- Pill shape (rounded-full)
- Minimal text (1-2 words)
- Color-coded by status
- No background for dot variant
- Accessible: `aria-label` for icon-only badges

### 7.5 Progress

**What:** Visual indicator of completion or loading progress.

**Why:**
- Show known-duration progress
- Set expectations
- Visual feedback

**Where:** File uploads, multi-step forms, installations.

**Component:** `src/shared/ui/Progress.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Progress percentage (0-100) |
| `variant` | `'linear' \| 'circular'` | `'linear'` | Progress shape |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Progress size |
| `showLabel` | `boolean` | `false` | Show percentage label |

**Best Practices:**
- Smooth animation
- Color: brand-500 for progress
- Background: neutral-200
- Indeterminate variant for unknown duration
- Accessible: `role="progressbar"`, `aria-valuenow`

### 7.6 Spinner

**What:** Indeterminate loading indicator.

**Why:**
- Show that something is loading
- Non-blocking visual feedback
- Consistent loading appearance

**Where:** Button loading, page loading, inline loading.

**Component:** `src/shared/ui/Spinner.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size |
| `color` | `'brand' \| 'white' \| 'neutral'` | `'brand'` | Spinner color |

**Best Practices:**
- Use in buttons during loading
- Center in container for page loading
- Consistent animation speed
- Accessible: `role="status"`, `aria-label="Loading"`

### 7.7 Skeleton

**What:** Placeholder content while data loads.

**Why:**
- Perceived performance
- Prevent layout shift
- Smooth loading experience

**Where:** Product grids, cards, lists, profiles.

**Component:** `src/shared/ui/Skeleton.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'circular' \| 'rectangular'` | `'text'` | Shape |
| `width` | `string \| number` | `'100%'` | Width |
| `height` | `string \| number` | — | Height |
| `lines` | `number` | `1` | Number of text lines |

**Best Practices:**
- Match content shape exactly
- Shimmer animation (800ms linear)
- No layout shift when content loads
- Fade in content after load
- Use for all data fetching states

### 7.8 SuccessState

**What:** Full-page or inline success confirmation.

**Why:**
- Confirm major actions
- Provide next steps
- Celebrate completion

**Where:** Order confirmation, account creation, password reset.

**Component:** `src/shared/ui/SuccessState.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Success message |
| `description` | `string` | — | Additional details |
| `action` | `{ label: string; href: string }` | — | Next step action |
| `icon` | `React.ReactNode` | — | Custom icon |

**Best Practices:**
- Checkmark animation
- Clear, positive messaging
- Next steps guidance
- Compact for inline, spacious for full page

### 7.9 ErrorState

**What:** Error display with recovery options.

**Why:**
- Clear error communication
- Recovery guidance
- Consistent error handling

**Where:** API errors, page errors, form errors.

**Component:** `src/shared/ui/ErrorState.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `'Something went wrong'` | Error title |
| `description` | `string` | — | Error details |
| `retry` | `() => void` | — | Retry callback |
| `variant` | `'inline' \| 'full'` | `'inline'` | Display variant |

**Best Practices:**
- Non-blaming language
- Clear error description
- Retry button when applicable
- Contact support link for persistent errors
- illustration for full-page errors

### 7.10 WarningState

**What:** Warning message with cautionary guidance.

**Why:**
- Prevent user mistakes
- Highlight important caution
- Guide correct behavior

**Where:** Destructive actions, limited resources, experimental features.

**Component:** `src/shared/ui/WarningState.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Warning title |
| `description` | `string` | required | Warning details |
| `action` | `{ label: string; onClick: () => void }` | — | Action button |

**Best Practices:**
- Warning icon (triangle with !)
- Amber/yellow color coding
- Clear consequence explanation
- Action to proceed or cancel

### 7.11 EmptyState

**What:** Display when no content is available.

**Why:**
- Guide users to next action
- Never show blank screens
- Maintain brand experience

**Where:** Empty lists, no search results, first-time use.

**Component:** `src/shared/ui/EmptyState.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ReactNode` | — | Illustration or icon |
| `title` | `string` | required | Empty state title |
| `description` | `string` | — | Explanation |
| `action` | `{ label: string; href: string; onClick: () => void }` | — | Action button |

**Best Practices:**
- Simple, on-brand illustration
- Helpful message explaining why empty
- Clear call-to-action
- Compact: not too tall
- Contextual: different for each empty scenario

---

## 8. Overlay Components

### 8.1 Modal

**What:** Focused overlay for important content or actions.

**Why:**
- Capture user attention
- Block background interaction
- Focused task completion

**Where:** Confirmations, forms, detail views.

**Component:** `src/shared/ui/Modal.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Modal visibility |
| `onClose` | `() => void` | required | Close callback |
| `title` | `string` | — | Modal title |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal size |
| `closeOnOverlay` | `boolean` | `true` | Close on backdrop click |

**Best Practices:**
- One modal at a time (no stacking)
- ESC to close always
- Focus trap within modal
- Return focus to trigger on close
- Backdrop: semi-transparent black
- Animation: scale up + fade in
- Max height: 90vh with scroll
- Mobile: full-screen modal

### 8.2 Dialog

**What:** Modal for confirmations and simple decisions.

**Why:**
- Quick confirmation
- Clear yes/no decisions
- Minimal content

**Where:** Delete confirmations, action confirmations.

**Component:** `src/shared/ui/Dialog.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Dialog visibility |
| `onClose` | `() => void` | required | Close callback |
| `title` | `string` | required | Dialog title |
| `description` | `string` | — | Dialog description |
| `confirmLabel` | `string` | `'Confirm'` | Confirm button text |
| `cancelLabel` | `string` | `'Cancel'` | Cancel button text |
| `onConfirm` | `() => void` | — | Confirm callback |
| `variant` | `'default' \| 'danger'` | `'default'` | Dialog variant |

**Best Practices:**
- Simple, clear message
- Two buttons: confirm and cancel
- Destructive actions: danger variant (red confirm button)
- Keyboard: Enter to confirm, Escape to cancel
- Focus on confirm button by default

### 8.3 Drawer

**What:** Slide-in panel from screen edge.

**Why:**
- Space for complex content
- Doesn't block entire screen
- Mobile-friendly pattern

**Where:** Filters, cart, product details, settings.

**Component:** `src/shared/ui/Drawer.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Drawer visibility |
| `onClose` | `() => void` | required | Close callback |
| `side` | `'left' \| 'right'` | `'right'` | Drawer side |
| `size` | `'sm' \| 'md' \| 'lg' | `'md'` | Drawer width |

**Best Practices:**
- Slide animation from edge
- Backdrop on mobile, optional on desktop
- Close on ESC and backdrop click
- Focus trap within drawer
- Scroll independently from page
- Mobile: full-width or near full-width

### 8.4 BottomSheet

**What:** Mobile-optimized slide-up panel.

**Why:**
- Natural mobile interaction
- Thumb-friendly actions
- Doesn't block full screen

**Where:** Mobile filters, mobile menu, action sheets.

**Component:** `src/shared/ui/BottomSheet.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Sheet visibility |
| `onClose` | `() => void` | required | Close callback |
| `snapPoints` | `number[]` | `[50, 90]` | Snap positions (%) |

**Best Practices:**
- Drag to dismiss
- Snap to predefined positions
- Backdrop with click-to-dismiss
- Handle bar at top for drag indication
- Safe area padding for notched phones
- Smooth spring animation

### 8.5 Popover

**What:** Floating content anchored to a trigger element.

**Why:**
- Contextual information
- Doesn't block entire screen
- Rich content support

**Where:** Help tooltips, date pickers, color pickers.

**Component:** `src/shared/ui/Popover.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `React.ReactNode` | required | Trigger element |
| `content` | `React.ReactNode` | required | Popover content |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Popover side |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment |

**Best Practices:**
- Smart positioning (flip when near edge)
- Close on click outside and Escape
- Focus trap within popover
- Arrow pointing to trigger
- Smooth fade/scale animation

### 8.6 Tooltip

**What:** Brief hint on hover or focus.

**Why:**
- Additional context without clutter
- Non-blocking information
- Keyboard accessible

**Where:** Icon buttons, truncated text, complex UI elements.

**Component:** `src/shared/ui/Tooltip.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | required | Tooltip text |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Tooltip side |
| `delay` | `number` | `300` | Show delay (ms) |

**Best Practices:**
- Short, concise text (1-2 lines)
- Delay before showing (300ms)
- No tooltip for essential information
- Keyboard: visible on focus
- Dark background (neutral-900)
- Not遮挡 interactive elements

### 8.7 ConfirmationDialog

**What:** Specialized dialog for destructive confirmations.

**Why:**
- Prevent accidental destructive actions
- Clear consequence communication
- Two-step confirmation

**Where:** Delete items, cancel orders, remove accounts.

**Component:** `src/shared/ui/ConfirmationDialog.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Dialog visibility |
| `onClose` | `() => void` | required | Close callback |
| `onConfirm` | `() => void` | required | Confirm callback |
| `title` | `string` | required | Confirmation title |
| `description` | `string` | required | Consequence description |
| `confirmLabel` | `string` | `'Delete'` | Confirm button text |
| `isLoading` | `boolean` | `false` | Loading state |

**Best Practices:**
- Danger variant (red confirm button)
- Clear, specific consequence description
- Type-to-confirm for critical actions
- Loading state during execution
- ESC and Cancel to abort

---

## 9. Data Components

### 9.1 Table

**What:** Structured data display in rows and columns.

**Why:**
- Efficient data display
- Sortable and filterable
- Keyboard navigable

**Where:** Admin lists, order history, customer data.

**Component:** `src/shared/ui/Table.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | required | Column definitions |
| `data` | `any[]` | required | Row data |
| `sortable` | `boolean` | `false` | Enable sorting |
| `loading` | `boolean` | `false` | Loading state |

**Best Practices:**
- Sticky header on scroll
- Responsive: horizontal scroll on mobile
- Sort indicators on column headers
- Row hover state
- Loading skeleton state
- Empty state when no data

### 9.2 DataGrid

**What:** Advanced table with pagination, filtering, and bulk actions.

**Why:**
- Complex data management
- Admin-grade functionality
- Efficient bulk operations

**Where:** Admin product list, order management, customer list.

**Component:** `src/shared/ui/DataGrid.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | required | Column definitions |
| `data` | `any[]` | required | Row data |
| `pagination` | `PaginationState` | — | Pagination state |
| `filters` | `Filter[]` | — | Available filters |
| `bulkActions` | `BulkAction[]` | — | Bulk action buttons |

**Best Practices:**
- Pagination with page size selector
- Column filters
- Search/filter bar
- Bulk selection with checkbox
- Bulk actions toolbar
- Export functionality
- Responsive: card view on mobile

### 9.3 List

**What:** Vertical list of items.

**Why:**
- Simple data display
- Mobile-friendly
- Easy to scan

**Where:** Notifications, messages, settings options.

**Component:** `src/shared/ui/List.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ListItem[]` | required | List items |
| `variant` | `'default' \| ' divided' \| 'card'` | `'default'` | List style |
| `loading` | `boolean` | `false` | Loading state |

**Best Practices:**
- Consistent item height
- Clear visual separation
- Loading skeleton state
- Empty state when no items
- Keyboard navigation

### 9.4 Timeline

**What:** Chronological display of events.

**Why:**
- Show order history
- Display activity feeds
- Visual progress tracking

**Where:** Order status, activity logs, version history.

**Component:** `src/shared/ui/Timeline.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TimelineItem[]` | required | Timeline events |
| `variant` | `'default' \| 'compact'` | `'default'` | Display variant |

**Best Practices:**
- Vertical line connecting events
- Icons or dots for each event
- Timestamp and description
- Current event highlighted
- Mobile: compact variant

### 9.5 Accordion

**What:** Collapsible content sections.

**Why:**
- Progressive disclosure
- Space efficiency
- Organized content

**Where:** FAQs, product details, settings sections.

**Component:** `src/shared/ui/Accordion.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `AccordionItem[]` | required | Accordion sections |
| `allowMultiple` | `boolean` | `false` | Allow multiple open |
| `defaultOpen` | `string[]` | — | Initially open items |

**Best Practices:**
- Clear expand/collapse icon (chevron)
- Smooth height animation
- Keyboard: Enter/Space to toggle
- Header always visible
- Single or multi-expand configurable

### 9.6 TreeView

**What:** Hierarchical data display with expand/collapse.

**Why:**
- Display nested structures
- Navigate complex hierarchies
- Select hierarchical items

**Where:** Category management, file systems, org charts.

**Component:** `src/shared/ui/TreeView.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TreeItem[]` | required | Tree data |
| `selected` | `string[]` | — | Selected items |
| `onSelect` | `(ids: string[]) => void` | — | Selection callback |

**Best Practices:**
- Indentation for hierarchy level
- Expand/collapse icons
- Keyboard: arrow keys for navigation
- Checkbox for multi-select
- Lazy loading for large trees

### 9.7 Carousel

**What:** Horizontal scrolling content slider.

**Why:**
- Space-efficient content display
- Engaging interaction
- Mobile swipe support

**Where:** Homepage hero, product images, related products.

**Component:** `src/shared/ui/Carousel.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `CarouselItem[]` | required | Carousel items |
| `autoPlay` | `boolean` | `false` | Auto-advance |
| `interval` | `number` | `5000` | Auto-advance interval |
| `showDots` | `boolean` | `true` | Show dot indicators |
| `showArrows` | `boolean` | `true` | Show arrow navigation |

**Best Practices:**
- Swipe support on mobile
- Arrow navigation on desktop
- Dot indicators for position
- Pause on hover
- Keyboard: arrow keys
- Lazy load off-screen images

### 9.8 Gallery

**What:** Image grid with lightbox viewing.

**Why:**
- Visual content browsing
- Full-screen viewing
- Thumbnail navigation

**Where:** Product images, lookbooks, user uploads.

**Component:** `src/shared/ui/Gallery.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `images` | `GalleryImage[]` | required | Image data |
| `columns` | `number` | `3` | Grid columns |
| `lightBox` | `boolean` | `true` | Enable lightbox |

**Best Practices:**
- Responsive grid (2 cols mobile, 3 tablet, 4 desktop)
- Lightbox with zoom
- Keyboard: arrow keys, Escape to close
- Thumbnail strip in lightbox
- Loading states for images

---

## 10. Media Components

### 10.1 Image

**What:** Optimized image display with lazy loading.

**Why:**
- Performance optimization
- Consistent image treatment
- Responsive images

**Where:** All image display across the platform.

**Component:** `src/shared/ui/Image.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Image source |
| `alt` | `string` | required | Alt text |
| `aspectRatio` | `string` | — | Aspect ratio |
| `objectFit` | `'cover' \| 'contain' \| 'fill'` | `'cover'` | Object fit |
| `loading` | `'lazy' \| 'eager'` | `'lazy'` | Loading strategy |

**Best Practices:**
- Always provide alt text
- Lazy loading by default
- Responsive images with srcset
- Skeleton placeholder while loading
- Error state for failed loads
- WebP format when possible

### 10.2 Video

**What:** Optimized video player with controls.

**Why:**
- Consistent video experience
- Performance optimization
- Mobile-friendly controls

**Where:** Product videos, lookbooks, tutorials.

**Component:** `src/shared/ui/Video.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Video source |
| `poster` | `string` | — | Thumbnail image |
| `autoPlay` | `boolean` | `false` | Auto-play (muted) |
| `controls` | `boolean` | `true` | Show controls |

**Best Practices:**
- Lazy load with Intersection Observer
- Poster image for fast preview
- Muted auto-play for background videos
- Custom controls for consistent styling
- Responsive sizing

### 10.3 Avatar

**What:** User profile image with fallback.

**Why:**
- Consistent user representation
- Fallback for missing images
- Multiple sizes

**Where:** User profiles, comments, reviews, team pages.

**Component:** `src/shared/ui/Avatar.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | — | Image source |
| `alt` | `string` | required | Alt text |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Avatar size |
| `fallback` | `string` | — | Fallback initials |

**Best Practices:**
- Circular shape
- Fallback: initials or icon
- Sizes: xs (24px), sm (32px), md (40px), lg (56px), xl (80px)
- Border for overlap
- Online status indicator (optional)

### 10.4 Logo

**What:** Brand logo display.

**Why:**
- Brand identity
- Consistent logo treatment
- Responsive sizing

**Where:** Header, footer, email templates.

**Component:** `src/shared/ui/Logo.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'full' \| 'icon' \| 'wordmark'` | `'full'` | Logo variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Logo size |
| `dark` | `boolean` | `false` | Dark mode variant |

**Best Practices:**
- SVG format for scalability
- Alt text: "Nabome"
- Responsive sizing
- Dark mode variant for dark backgrounds

### 10.5 Icons

**What:** Consistent icon system using Lucide React.

**Why:**
- Visual consistency
- Tree-shakeable
- Accessible

**Where:** All icon usage across the platform.

**Component:** Lucide React library

| Size | Pixels | Tailwind | Usage |
|------|--------|----------|-------|
| `xs` | 12px | `h-3 w-3` | Inline badges |
| `sm` | 16px | `h-4 w-4` | Inline with text |
| `md` | 20px | `h-5 w-5` | Button icons |
| `lg` | 24px | `h-6 w-6` | Standalone icons |
| `xl` | 32px | `h-8 w-8` | Feature icons |
| `2xl` | 48px | `h-12 w-12` | Hero icons |

**Best Practices:**
- Lucide React only (no other icon libraries)
- `aria-hidden="true"` for decorative icons
- `aria-label` on interactive icon buttons
- Color: inherit from parent or explicit
- Consistent sizing within context

### 10.6 Thumbnail

**What:** Small image preview with consistent treatment.

**Why:**
- Consistent image preview
- Uniform sizing
- Loading states

**Where:** Product variants, file lists, media library.

**Component:** `src/shared/ui/Thumbnail.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | required | Image source |
| `alt` | `string` | required | Alt text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Thumbnail size |
| `rounded` | `boolean` | `true` | Rounded corners |

**Best Practices:**
- Consistent aspect ratio (1:1)
- object-cover for cropping
- Skeleton while loading
- Error state for failed loads

---

## 11. Form Components

### 11.1 FormLayout

**What:** Consistent form layout wrapper.

**Why:**
- Consistent form spacing
- Responsive form layout
- Clear visual hierarchy

**Where:** All forms across the platform.

**Component:** `src/shared/ui/FormLayout.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Form fields |
| `layout` | `'stacked' \| 'inline' \| 'horizontal'` | `'stacked'` | Form layout |
| `maxWidth` | `string` | `'480px'` | Maximum form width |

**Best Practices:**
- Single column for mobile
- Max width 480px for readability
- Consistent field spacing (16px)
- Section spacing (32px)
- Centered on page

### 11.2 Validation

**What:** Form validation display and behavior.

**Why:**
- Clear error communication
- Consistent validation UX
- Prevent submission errors

**Where:** All forms with validation.

**Component:** Validation utilities and patterns

**Best Practices:**
- Validate on blur (not on every keystroke)
- Show error below input, red text
- Associate error with input via `aria-describedby`
- Inline validation for immediate feedback
- Summary validation on submit
- Zod schemas for validation logic

### 11.3 FieldGroup

**What:** Group related form fields.

**Why:**
- Visual grouping
- Clear relationships
- Consistent spacing

**Where:** Address forms, multi-field sections.

**Component:** `src/shared/ui/FieldGroup.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Group label |
| `children` | `React.ReactNode` | required | Form fields |
| `description` | `string` | — | Group description |

**Best Practices:**
- Visual separation from other groups
- Consistent internal spacing
- Group label for context
- Description for guidance

### 11.4 ErrorDisplay

**What:** Form-level error summary.

**Why:**
- Summarize all form errors
- Quick navigation to errors
- Clear error count

**Where:** Top of forms with multiple errors.

**Component:** `src/shared/ui/ErrorDisplay.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `errors` | `string[]` | required | Error messages |
| `title` | `string` | `'Please fix the following errors'` | Error title |

**Best Practices:**
- Show at top of form
- List all errors with links to fields
- Icon and color for error state
- Accessible: `role="alert"`

### 11.5 HelperText

**What:** Guidance text below form fields.

**Why:**
- Provide additional context
- Help users complete fields correctly
- Reduce errors

**Where:** Complex fields, password requirements, format hints.

**Component:** `src/shared/ui/HelperText.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Helper text |
| `variant` | `'default' \| 'error' \| 'success'` | `'default'` | Text variant |

**Best Practices:**
- Below input, gray text
- Error variant: red text
- Success variant: green text
- Associated with input via `aria-describedby`
- Concise and helpful

### 11.6 SuccessMessage

**What:** Success feedback within forms.

**Why:**
- Confirm successful operations
- Positive reinforcement
- Clear completion state

**Where:** After successful form submission, inline success.

**Component:** `src/shared/ui/SuccessMessage.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | required | Success message |
| `icon` | `boolean` | `true` | Show checkmark icon |

**Best Practices:**
- Green text with checkmark icon
- Compact for inline display
- Clear, positive messaging
- Auto-dismiss after appropriate time

---

## 12. Dashboard Components

### 12.1 Widgets

**What:** Reusable dashboard widget containers.

**Why:**
- Consistent widget layout
- Drag-and-drop ready
- Responsive grid

**Where:** Admin dashboard, analytics pages.

**Component:** `src/features/admin/components/Widget.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Widget title |
| `action` | `{ label: string; href: string }` | — | Action link |
| `loading` | `boolean` | `false` | Loading state |

**Best Practices:**
- Consistent padding and spacing
- Title with optional action
- Loading skeleton state
- Responsive sizing

### 12.2 KPICards

**What:** Key Performance Indicator display cards.

**Why:**
- Quick metric overview
- Trend visualization
- Dashboard-ready

**Where:** Admin dashboard, analytics overview.

**Component:** `src/features/admin/components/KPICard.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | KPI label |
| `value` | `string \| number` | required | KPI value |
| `change` | `number` | — | Percentage change |
| `period` | `string` | `'vs last month'` | Comparison period |
| `icon` | `React.ReactNode` | — | KPI icon |

**Best Practices:**
- Large, readable number
- Trend arrow with color (green up, red down)
- Comparison period label
- Icon for visual association
- Responsive: full-width on mobile

### 12.3 ChartsContainer

**What:** Wrapper for chart components with consistent styling.

**Why:**
- Consistent chart presentation
- Loading and error states
- Responsive sizing

**Where:** Analytics dashboards, reports.

**Component:** `src/features/admin/components/ChartsContainer.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | required | Chart title |
| `children` | `React.ReactNode` | required | Chart component |
| `loading` | `boolean` | `false` | Loading state |

**Best Practices:**
- Consistent container styling
- Loading skeleton for charts
- Responsive: full-width on mobile
- Legend and tooltip consistency

### 12.4 ActivityFeed

**What:** Chronological list of recent activities.

**Why:**
- Real-time updates
- Activity tracking
- Quick overview

**Where:** Admin dashboard, user profiles.

**Component:** `src/features/admin/components/ActivityFeed.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activities` | `Activity[]` | required | Activity data |
| `maxItems` | `number` | `10` | Maximum items to show |
| `loading` | `boolean` | `false` | Loading state |

**Best Practices:**
- Chronological order (newest first)
- User avatar and name
- Action description
- Timestamp (relative: "2 hours ago")
- Link to full activity log

### 12.5 StatusIndicators

**What:** Visual status display for orders, payments, etc.

**Why:**
- Quick status recognition
- Consistent color coding
- Icon + text + color

**Where:** Order lists, payment status, inventory status.

**Component:** `src/shared/ui/StatusIndicator.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `string` | required | Status value |
| `variant` | `'dot' \| 'badge' \| 'tag'` | `'badge'` | Display variant |
| `color` | `'success' \| 'warning' \| 'error' \| 'info' \| 'neutral'` | — | Status color |

**Best Practices:**
- Consistent color mapping
- Icon + text (not color alone)
- Accessible: `aria-label` with status
- Compact for tables, larger for cards

### 12.6 QuickActions

**What:** Common action buttons for dashboard shortcuts.

**Why:**
- Quick access to frequent actions
- Reduced navigation
- Dashboard efficiency

**Where:** Admin dashboard, home dashboard.

**Component:** `src/features/admin/components/QuickActions.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `QuickAction[]` | required | Action definitions |
| `columns` | `number` | `4` | Grid columns |

**Best Practices:**
- Icon + label
- Clear, descriptive labels
- Consistent sizing
- Responsive grid (4 cols desktop, 2 mobile)

---

## 13. Component State Standards

### 13.1 What

Standard states that every interactive component must support.

### 13.2 Why

- **Consistency:** Same behavior across all components
- **Predictability:** Users know what to expect
- **Accessibility:** Clear state communication

### 13.3 State Standards

| State | Visual Treatment | Interaction | Accessibility |
|-------|-----------------|-------------|---------------|
| **Default** | Normal appearance | Ready for interaction | Standard ARIA |
| **Hover** | Subtle background change | Pointer cursor | Not applicable |
| **Focus** | 2px ring (brand-500) | Keyboard accessible | `:focus-visible` |
| **Active/Pressed** | Darker background | Responds to click | `aria-pressed` |
| **Disabled** | 50% opacity, gray | No interaction | `aria-disabled="true"` |
| **Loading** | Spinner replaces content | No interaction | `aria-busy="true"` |
| **Selected** | Brand-500 background | Toggleable | `aria-selected="true"` |
| **Error** | Red border/background | Shows error message | `aria-invalid="true"` |
| **Success** | Green border/background | Shows success message | `aria-invalid="false"` |

### 13.4 Loading States

| Pattern | Usage | Implementation |
|---------|-------|----------------|
| **Button loading** | Form submission | Spinner + disabled |
| **Skeleton loading** | Content loading | Placeholder shapes |
| **Inline loading** | Data refresh | Spinner in place |
| **Page loading** | Route transitions | Full-page spinner |

### 13.5 Error States

| Pattern | Usage | Implementation |
|---------|-------|----------------|
| **Inline error** | Form field errors | Red border + message |
| **Banner error** | Page-level errors | Red background + message |
| **Toast error** | Transient errors | Red toast notification |
| **Empty state error** | Failed to load | Error illustration + retry |

---

## 14. Consistency Rules

### 14.1 What

Hard rules for visual consistency across all components.

### 14.2 Why

- **Brand cohesion:** Every screen belongs to Nabome
- **Professional feel:** No visual disjointedness
- **Developer efficiency:** No debates about values

### 14.3 Spacing Rules

| Context | Standard | Tailwind | Rationale |
|---------|----------|----------|-----------|
| **Icon to text** | 4-8px | `gap-1` to `gap-2` | Tight association |
| **Input padding** | 12px horizontal | `px-3` | Comfortable |
| **Button padding** | 16-24px horizontal | `px-4` to `px-6` | Clickable |
| **Card padding** | 16-24px | `p-4` to `p-6` | Breathing room |
| **Section spacing** | 32-48px | `gap-8` to `gap-12` | Visual separation |
| **Page margins** | 16-32px | `px-4` to `px-8` | Edge spacing |

### 14.4 Alignment Rules

| Context | Standard | Rationale |
|---------|----------|-----------|
| **Text alignment** | Left-aligned (LTR) | Readability |
| **Center alignment** | Hero text, CTAs | Focus |
| **Grid alignment** | Consistent gutters | Visual rhythm |
| **Form labels** | Left-aligned, above input | Scannability |
| **Form inputs** | Full width (mobile), max 480px (desktop) | Readability |

### 14.5 Typography Rules

| Context | Font | Size | Weight | Rationale |
|---------|------|------|--------|-----------|
| **Display H1** | Cormorant Garamond | 3.5rem | 300 | Editorial |
| **Display H2** | Cormorant Garamond | 2.5rem | 400 | Editorial |
| **Heading H3** | Manrope | 1.5rem | 600 | Readability |
| **Heading H4** | Manrope | 1.25rem | 600 | Readability |
| **Body** | Manrope | 1rem | 400 | Readability |
| **Caption** | Manrope | 0.75rem | 500 | Subtle |
| **Label** | Manrope | 0.6875rem | 600 uppercase | Premium |

### 14.6 Icon Rules

| Context | Size | Style | Color |
|---------|------|-------|-------|
| **Inline with text** | Match text size | Outline | Inherit |
| **Button icon** | 20px (md) | Outline | Inherit |
| **Navigation icon** | 24px (lg) | Outline | Active: brand-500 |
| **Feature icon** | 32px (xl) | Outline | brand-500 |
| **Hero icon** | 48px (2xl) | Outline | brand-500 |

### 14.7 Border Radius Rules

| Component | Radius | Tailwind | Rationale |
|-----------|--------|----------|-----------|
| **Buttons** | 8px | `rounded-md` | Subtle, clickable |
| **Inputs** | 8px | `rounded-md` | Consistent |
| **Cards** | 12px | `rounded-lg` | Slightly more |
| **Modals** | 16px | `rounded-xl` | Prominent |
| **Badges** | 9999px | `rounded-full` | Pills |
| **Avatars** | 9999px | `rounded-full` | Circular |
| **Images** | 8px | `rounded-md` | Subtle |

### 14.8 Shadow Rules

| Component | Default | Hover | Rationale |
|-----------|---------|-------|-----------|
| **Cards** | `shadow-subtle` | `shadow-card` | Subtle depth |
| **Dropdowns** | `shadow-elevated` | — | Floating |
| **Modals** | `shadow-modal` | — | Overlay |
| **Buttons** | None | None | Flat design |
| **Toasts** | `shadow-elevated` | — | Notification |

### 14.9 Motion Rules

| Interaction | Duration | Easing | Effect |
|-------------|----------|--------|--------|
| **Hover** | 150ms | ease-luxe-out | Color change |
| **Focus** | 0ms | — | Immediate ring |
| **Press** | 150ms | ease-luxe-in | Scale down |
| **Card hover** | 300ms | ease-luxe-out | Lift + shadow |
| **Modal open** | 300ms | ease-spring | Scale up |
| **Page transition** | 500ms | ease-luxe-out | Fade + slide |
| **Skeleton shimmer** | 800ms | linear | Shimmer |

### 14.10 Elevation Rules

| Level | Shadow | Usage | Z-Index |
|-------|--------|-------|---------|
| **Base** | None | Page content | 0 |
| **Raised** | `shadow-subtle` | Cards | 0 |
| **Elevated** | `shadow-card` | Hover states | 0 |
| **Floating** | `shadow-elevated` | Dropdowns, popovers | 50 |
| **Overlay** | `shadow-modal` | Modals, drawers | 200 |
| **Toast** | `shadow-elevated` | Notifications | 300 |
| **Tooltip** | `shadow-elevated` | Tooltips | 400 |

---

## 15. Accessibility Requirements

### 15.1 What

WCAG 2.2 AA compliance standards for all components.

### 15.2 Why

- **Legal compliance:** Meet accessibility laws
- **Inclusivity:** Everyone can use the platform
- **SEO:** Search engines favor accessible sites
- **Quality:** Accessible code is better code

### 15.3 Where

Every component and page in the application.

### 15.4 WCAG 2.2 AA Requirements

| Criterion | Requirement | Implementation |
|-----------|-------------|----------------|
| **1.1.1 Non-text Content** | Alt text on all images | `alt` attribute required |
| **1.3.1 Info and Relationships** | Semantic HTML | Proper headings, lists, tables |
| **1.4.1 Use of Color** | Not color-only indicators | Icons + text + color |
| **1.4.3 Contrast Minimum** | 4.5:1 for text | All text meets contrast |
| **1.4.4 Resize Text** | 200% zoom works | Responsive layouts |
| **2.1.1 Keyboard** | All features keyboard accessible | Tab, Enter, Escape |
| **2.1.2 No Keyboard Trap** | Can navigate away from all components | Focus management |
| **2.4.1 Bypass Blocks** | Skip to main content | SkipToContent component |
| **2.4.3 Focus Order** | Logical tab order | Natural DOM order |
| **2.4.7 Focus Visible** | Visible focus indicator | 2px ring on focus |
| **2.5.5 Target Size** | 44x44px minimum | All interactive elements |
| **3.3.1 Error Identification** | Clear error messages | Error text below inputs |
| **3.3.2 Labels or Instructions** | Labels on all inputs | Visible labels required |

### 15.5 Keyboard Navigation

| Component | Keyboard Behavior |
|-----------|-------------------|
| **Button** | Enter/Space to activate |
| **Link** | Enter to activate |
| **Input** | Tab to focus, type to enter |
| **Checkbox** | Space to toggle |
| **Radio** | Arrow keys to navigate, Space to select |
| **Select** | Arrow keys to navigate, Enter to select, Escape to close |
| **Tabs** | Arrow keys to navigate tabs, Enter to select |
| **Modal** | Focus trap, ESC to close |
| **Dropdown** | Arrow keys to navigate, Enter to select, ESC to close |

### 15.6 ARIA Patterns

| Pattern | ARIA Attributes | Usage |
|---------|-----------------|-------|
| **Alert** | `role="alert"` | Error messages |
| **Status** | `role="status"` | Success/info messages |
| **Dialog** | `role="dialog"`, `aria-modal="true"` | Modals |
| **Tablist** | `role="tablist"`, `role="tab"`, `role="tabpanel"` | Tabs |
| **Accordion** | `aria-expanded`, `aria-controls` | Expandable sections |
| **Progressbar** | `role="progressbar"`, `aria-valuenow` | Progress indicators |
| **Tooltip** | `role="tooltip"`, `aria-describedby` | Tooltips |

### 15.7 Screen Reader Support

| Component | Screen Reader Behavior |
|-----------|----------------------|
| **Icon button** | `aria-label` on button, `aria-hidden` on icon |
| **Image** | `alt` text describes image |
| **Decorative image** | `alt=""` or `aria-hidden="true"` |
| **Loading** | `aria-busy="true"` during loading |
| **Error** | `aria-invalid="true"`, `aria-describedby` for error |
| **Required** | `aria-required="true"` or `required` |

### 15.8 Focus Management

| Situation | Behavior |
|-----------|----------|
| **Modal open** | Focus moves to modal |
| **Modal close** | Focus returns to trigger |
| **Dropdown open** | Focus moves to first item |
| **Tab switch** | Focus moves to new tab panel |
| **Error** | Focus moves to first error |
| **Page load** | Focus on skip link or main content |

---

## 16. Performance Requirements

### 16.1 What

Performance standards for component loading and rendering.

### 16.2 Why

- **User experience:** Fast, responsive interface
- **Business impact:** Faster pages = more conversions
- **Core Web Vitals:** Meet Google's performance standards

### 16.3 Tree Shaking

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Named exports** | No default exports | Better tree shaking |
| **No barrel re-exports** | Only `shared/ui/index.ts` allowed | Prevents bundle bloat |
| **Direct imports** | `import { Button } from '@/shared/ui/Button'` | Optimal bundling |
| **Lucide icons** | Import specific icons only | Only used icons in bundle |

### 16.4 Lazy Loading

| Component | Strategy | Rationale |
|-----------|----------|-----------|
| **Route components** | `React.lazy()` | Code split by route |
| **Heavy components** | Dynamic import | Defer non-critical |
| **Images** | `loading="lazy"` | Load when visible |
| **Off-screen content** | Intersection Observer | Load when approaching |

### 16.5 Code Splitting

| Strategy | Usage | Rationale |
|----------|-------|-----------|
| **Route-based** | Pages are code-split | Faster initial load |
| **Feature-based** | Admin panel separate | Smaller customer bundle |
| **Component-based** | Heavy components deferred | On-demand loading |
| **Vendor splitting** | Third-party libs separate | Better caching |

### 16.6 Memoization Readiness

| Pattern | When to Use | Implementation |
|---------|-------------|----------------|
| **React.memo** | Expensive renders | Wrap component |
| **useMemo** | Expensive calculations | Cache computation |
| **useCallback** | Event handlers passed down | Cache function reference |
| **Virtualization** | Long lists | Only render visible items |

### 16.7 Render Optimization

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No inline objects** | Define outside render | Prevent re-renders |
| **No inline functions** | Use useCallback | Prevent re-renders |
| **Key prop** | Always provide for lists | Efficient reconciliation |
| **Conditional rendering** | Use && or early return | Skip unnecessary renders |
| **List virtualization** | For lists > 50 items | Performance |

---

## 17. Component Rules Reference

### 17.1 Naming Rules

| Item | Convention | Example |
|------|-----------|---------|
| **Component file** | PascalCase | `ProductCard.tsx` |
| **Component name** | PascalCase | `ProductCard` |
| **Props interface** | PascalCase + Props | `ProductCardProps` |
| **Hook file** | camelCase + use | `useCart.ts` |
| **Hook name** | camelCase + use | `useCart` |
| **Utility file** | camelCase | `format.ts` |
| **Type file** | camelCase | `product.ts` |

### 17.2 Props Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **JSDoc on complex props** | Document non-obvious props | Developer experience |
| **Default values** | Provide sensible defaults | Ease of use |
| **Required vs optional** | Only truly required props are required | Flexibility |
| **Union types** | Prefer `'a' \| 'b'` over strings | Type safety |
| **Event handlers** | `on` prefix | React convention |
| **Boolean props** | `is` prefix or descriptive | Clarity |
| **className prop** | Always accept className | Extensibility |

### 17.3 Composition Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Children prop** | Primary content slot | Flexibility |
| **Render props** | Dynamic content | Advanced composition |
| **Compound components** | Dot notation for related parts | Discoverability |
| **as prop** | Polymorphic rendering | Element flexibility |
| **No deep nesting** | Max 3 levels | Readability |
| **Flat exports** | All parts from same file | Easy imports |

### 17.4 Extensibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **className prop** | Always accept custom classes | Override styles |
| **style prop** | Accept inline styles (cautiously) | Edge cases |
| **Ref forwarding** | forwardRef on all UI primitives | Composition |
| **Polymorphic as** | Support `as` prop | Element flexibility |
| **Slot pattern** | Named slots for content areas | Flexibility |

### 17.5 Documentation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **JSDoc** | Document complex props | Developer experience |
| **Examples** | Show usage examples | Learn by example |
| **Storybook** | Visual documentation | Interactive docs |
| **Prop table** | Document all props | Reference |
| **Do/Don't** | Show correct and incorrect usage | Prevent mistakes |

### 17.6 Testing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Unit tests** | Test component behavior | Correctness |
| **Accessibility tests** | Test ARIA and keyboard | Accessibility |
| **Visual tests** | Screenshot comparisons | Visual regression |
| **Interaction tests** | Test user interactions | Behavior |
| **Edge cases** | Test empty, loading, error states | Robustness |

### 17.7 Performance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tree shaking** | Named exports only | Bundle size |
| **Lazy loading** | Defer non-critical | Initial load |
| **Memoization** | For expensive renders | Render performance |
| **Virtualization** | For long lists | Scroll performance |
| **No layout shift** | Maintain dimensions | CLS score |

### 17.8 Accessibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Keyboard accessible** | All interactive elements | Motor disabilities |
| **Screen reader** | Proper ARIA labels | Visual disabilities |
| **Focus visible** | 2px ring on focus | Keyboard users |
| **Color contrast** | 4.5:1 minimum | Low vision |
| **Reduced motion** | Honor prefers-reduced-motion | Vestibular disorders |
| **Touch targets** | 44x44px minimum | Mobile accessibility |

---

## Appendix A: Component Inventory

### A.1 Complete Component List

| Category | Component | Location | Status |
|----------|-----------|----------|--------|
| **Input** | Button | `shared/ui/Button.tsx` | Planned |
| **Input** | IconButton | `shared/ui/IconButton.tsx` | Planned |
| **Input** | TextInput | `shared/ui/Input.tsx` | Planned |
| **Input** | PasswordInput | `shared/ui/PasswordInput.tsx` | Planned |
| **Input** | SearchInput | `shared/ui/SearchInput.tsx` | Planned |
| **Input** | Textarea | `shared/ui/Textarea.tsx` | Planned |
| **Input** | NumberInput | `shared/ui/NumberInput.tsx` | Planned |
| **Input** | OTPInput | `shared/ui/OTPInput.tsx` | Planned |
| **Input** | Checkbox | `shared/ui/Checkbox.tsx` | Planned |
| **Input** | Radio | `shared/ui/Radio.tsx` | Planned |
| **Input** | Switch | `shared/ui/Switch.tsx` | Planned |
| **Input** | Slider | `shared/ui/Slider.tsx` | Planned |
| **Input** | Select | `shared/ui/Select.tsx` | Planned |
| **Input** | MultiSelect | `shared/ui/MultiSelect.tsx` | Planned |
| **Input** | Combobox | `shared/ui/Combobox.tsx` | Planned |
| **Input** | DatePicker | `shared/ui/DatePicker.tsx` | Planned |
| **Input** | TimePicker | `shared/ui/TimePicker.tsx` | Planned |
| **Input** | FileUpload | `shared/ui/FileUpload.tsx` | Planned |
| **Input** | ImageUpload | `shared/ui/ImageUpload.tsx` | Planned |
| **Input** | VideoUpload | `shared/ui/VideoUpload.tsx` | Planned |
| **Navigation** | Header | `shared/layout/Header.tsx` | Planned |
| **Navigation** | Footer | `shared/layout/Footer.tsx` | Planned |
| **Navigation** | Sidebar | `shared/layout/Sidebar.tsx` | Planned |
| **Navigation** | BottomNavigation | `shared/layout/BottomNav.tsx` | Planned |
| **Navigation** | Breadcrumb | `shared/ui/Breadcrumbs.tsx` | Planned |
| **Navigation** | Pagination | `shared/ui/Pagination.tsx` | Planned |
| **Navigation** | Tabs | `shared/ui/Tabs.tsx` | Planned |
| **Navigation** | Stepper | `shared/ui/Stepper.tsx` | Planned |
| **Navigation** | MegaMenu | `shared/layout/MegaMenu.tsx` | Planned |
| **Navigation** | DropdownMenu | `shared/ui/DropdownMenu.tsx` | Planned |
| **Navigation** | ContextMenu | `shared/ui/ContextMenu.tsx` | Planned |
| **Content** | Card | `shared/ui/Card.tsx` | Planned |
| **Content** | ProductCard | `features/products/components/ProductCard.tsx` | Planned |
| **Content** | CollectionCard | `features/products/components/CollectionCard.tsx` | Planned |
| **Content** | CategoryCard | `features/products/components/CategoryCard.tsx` | Planned |
| **Content** | BlogCard | `features/home/components/BlogCard.tsx` | Planned |
| **Content** | ProfileCard | `shared/ui/ProfileCard.tsx` | Planned |
| **Content** | StatisticCard | `features/admin/components/StatisticCard.tsx` | Planned |
| **Content** | InformationCard | `shared/ui/InformationCard.tsx` | Planned |
| **Feedback** | Alert | `shared/ui/Alert.tsx` | Planned |
| **Feedback** | Toast | `shared/ui/Toast.tsx` | Planned |
| **Feedback** | Snackbar | `shared/ui/Snackbar.tsx` | Planned |
| **Feedback** | Badge | `shared/ui/Badge.tsx` | Planned |
| **Feedback** | Progress | `shared/ui/Progress.tsx` | Planned |
| **Feedback** | Spinner | `shared/ui/Spinner.tsx` | Planned |
| **Feedback** | Skeleton | `shared/ui/Skeleton.tsx` | Planned |
| **Feedback** | SuccessState | `shared/ui/SuccessState.tsx` | Planned |
| **Feedback** | ErrorState | `shared/ui/ErrorState.tsx` | Planned |
| **Feedback** | WarningState | `shared/ui/WarningState.tsx` | Planned |
| **Feedback** | EmptyState | `shared/ui/EmptyState.tsx` | Planned |
| **Overlay** | Modal | `shared/ui/Modal.tsx` | Planned |
| **Overlay** | Dialog | `shared/ui/Dialog.tsx` | Planned |
| **Overlay** | Drawer | `shared/ui/Drawer.tsx` | Planned |
| **Overlay** | BottomSheet | `shared/ui/BottomSheet.tsx` | Planned |
| **Overlay** | Popover | `shared/ui/Popover.tsx` | Planned |
| **Overlay** | Tooltip | `shared/ui/Tooltip.tsx` | Planned |
| **Overlay** | ConfirmationDialog | `shared/ui/ConfirmationDialog.tsx` | Planned |
| **Data** | Table | `shared/ui/Table.tsx` | Planned |
| **Data** | DataGrid | `shared/ui/DataGrid.tsx` | Planned |
| **Data** | List | `shared/ui/List.tsx` | Planned |
| **Data** | Timeline | `shared/ui/Timeline.tsx` | Planned |
| **Data** | Accordion | `shared/ui/Accordion.tsx` | Planned |
| **Data** | TreeView | `shared/ui/TreeView.tsx` | Planned |
| **Data** | Carousel | `shared/ui/Carousel.tsx` | Planned |
| **Data** | Gallery | `shared/ui/Gallery.tsx` | Planned |
| **Media** | Image | `shared/ui/Image.tsx` | Planned |
| **Media** | Video | `shared/ui/Video.tsx` | Planned |
| **Media** | Avatar | `shared/ui/Avatar.tsx` | Planned |
| **Media** | Logo | `shared/ui/Logo.tsx` | Planned |
| **Media** | Icons | Lucide React | Planned |
| **Media** | Thumbnail | `shared/ui/Thumbnail.tsx` | Planned |
| **Form** | FormLayout | `shared/ui/FormLayout.tsx` | Planned |
| **Form** | Validation | Utilities | Planned |
| **Form** | FieldGroup | `shared/ui/FieldGroup.tsx` | Planned |
| **Form** | ErrorDisplay | `shared/ui/ErrorDisplay.tsx` | Planned |
| **Form** | HelperText | `shared/ui/HelperText.tsx` | Planned |
| **Form** | SuccessMessage | `shared/ui/SuccessMessage.tsx` | Planned |
| **Dashboard** | Widgets | `features/admin/components/Widget.tsx` | Planned |
| **Dashboard** | KPICards | `features/admin/components/KPICard.tsx` | Planned |
| **Dashboard** | ChartsContainer | `features/admin/components/ChartsContainer.tsx` | Planned |
| **Dashboard** | ActivityFeed | `features/admin/components/ActivityFeed.tsx` | Planned |
| **Dashboard** | StatusIndicators | `shared/ui/StatusIndicator.tsx` | Planned |
| **Dashboard** | QuickActions | `features/admin/components/QuickActions.tsx` | Planned |

### A.2 Component Count Summary

| Category | Count |
|----------|-------|
| Input Components | 20 |
| Navigation Components | 11 |
| Content Components | 8 |
| Feedback Components | 11 |
| Overlay Components | 7 |
| Data Components | 8 |
| Media Components | 6 |
| Form Components | 6 |
| Dashboard Components | 6 |
| **Total** | **83** |

---

## Appendix B: Implementation Checklist

### B.1 Phase 1: Foundation (Week 1-2)

- [ ] Set up design tokens in `globals.css`
- [ ] Configure Tailwind with custom theme
- [ ] Create `cn.ts` utility
- [ ] Create Button component
- [ ] Create Input component
- [ ] Create Badge component
- [ ] Create Card component
- [ ] Create Skeleton component
- [ ] Create Spinner component
- [ ] Create Toast system

### B.2 Phase 2: Forms (Week 3-4)

- [ ] Create all input components (Checkbox, Radio, Switch, Select, etc.)
- [ ] Create form layout components
- [ ] Create validation utilities
- [ ] Create DatePicker, TimePicker
- [ ] Create FileUpload, ImageUpload
- [ ] Create OTPInput

### B.3 Phase 3: Navigation (Week 5-6)

- [ ] Create Header component
- [ ] Create Footer component
- [ ] Create BottomNav component
- [ ] Create Sidebar component
- [ ] Create Breadcrumbs
- [ ] Create Pagination
- [ ] Create Tabs
- [ ] Create DropdownMenu
- [ ] Create MegaMenu

### B.4 Phase 4: Overlays (Week 7-8)

- [ ] Create Modal component
- [ ] Create Dialog component
- [ ] Create Drawer component
- [ ] Create BottomSheet
- [ ] Create Popover
- [ ] Create Tooltip
- [ ] Create ConfirmationDialog

### B.5 Phase 5: Data & Content (Week 9-10)

- [ ] Create Table component
- [ ] Create DataGrid component
- [ ] Create Accordion
- [ ] Create Carousel
- [ ] Create Gallery
- [ ] Create all card variants (Product, Collection, etc.)
- [ ] Create EmptyState, ErrorState, SuccessState

### B.6 Phase 6: Dashboard (Week 11-12)

- [ ] Create admin layout components
- [ ] Create KPICard, StatisticCard
- [ ] Create ChartsContainer
- [ ] Create ActivityFeed
- [ ] Create QuickActions
- [ ] Create StatusIndicators

### B.7 Phase 7: Polish (Week 13-14)

- [ ] Accessibility audit and fixes
- [ ] Performance optimization
- [ ] Storybook documentation
- [ ] Visual regression testing
- [ ] Cross-browser testing
- [ ] Mobile device testing

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
