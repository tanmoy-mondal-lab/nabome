# নবME (Nabome) Commerce OS — Frontend Application Implementation Specification

> **Version:** 2.0
> **Date:** August 04, 2026
> **Status:** Active — All frontend AI agents must follow this document
> **Priority:** This document is the official frontend implementation specification for the Nabome Commerce OS
> **Supersedes:** FRONTEND_APPLICATION_IMPLEMENTATION_SPECIFICATION v1.0
> **Authority:** Derived from MASTER_ARCHITECTURE_BLUEPRINT.md (v1.0), BACKEND_SERVICE_SPECIFICATION.md (v1.0), REST_API_SPECIFICATION.md (v1.0), DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), COMPONENT_LIBRARY_ARCHITECTURE.md (v1.0), UX_ARCHITECTURE.md (v1.0), NAVIGATION_ARCHITECTURE.md (v1.0), RESPONSIVE_LAYOUT_ARCHITECTURE.md (v1.0), FOLDER_ARCHITECTURE.md (v1.0), and TECH_STACK.md (v1.0). All canonical resolutions from the Blueprint Appendix B are binding.

---

## Table of Contents

1. [Application Foundation](#1-application-foundation)
2. [Application Structure](#2-application-structure)
3. [Routing](#3-routing)
4. [Layout System](#4-layout-system)
5. [Page Implementation](#5-page-implementation)
6. [Component Composition](#6-component-composition)
7. [State Management](#7-state-management)
8. [Data Fetching](#8-data-fetching)
9. [Responsive Implementation](#9-responsive-implementation)
10. [Performance](#10-performance)
11. [Accessibility](#11-accessibility)
12. [Error Handling](#12-error-handling)
13. [Security](#13-security)
14. [Testability](#14-testability)

---

# 1. Application Foundation

## 1.1 Frontend Philosophy

The frontend implementation is guided by these core principles:

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **One premium application** | Every page feels like the same product | Consistent design language, interaction model, implementation philosophy |
| **Mobile-first** | Design for thumb, enhance for desktop | 70%+ traffic is mobile; base styles for 375px, enhance upward |
| **Enterprise-grade** | Built for scale and maintainability | Modular, reusable, testable, performant |
| **Premium UX** | Apple-level micro-interactions | Smooth animations, generous spacing, intentional restraint |
| **Beginner-friendly** | First-time user succeeds immediately | Clear labels, helpful hints, progressive disclosure |
| **Highly reusable** | No duplicated UI logic | Shared primitives, composition over inheritance |
| **Accessible by default** | WCAG 2.2 AA minimum | ARIA, keyboard, contrast, screen readers |
| **High performance** | Fast, smooth, responsive | Code splitting, lazy loading, optimization |
| **Future-proof** | Ready for dark mode, i18n, PWA | CSS variables, no hardcoded values, extensible architecture |

## 1.2 Application Architecture

### 1.2.1 Layered System

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION ARCHITECTURE                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PRESENTATION LAYER (src/features/*/pages/)             │   │
│  │  Route-level components, data fetching, orchestration    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FEATURE LAYER (src/features/*/components/)            │   │
│  │  Domain-specific components, feature hooks, feature stores │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SHARED LAYER (src/shared/)                             │   │
│  │  UI primitives, layout components, auth guards           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  UTILITY LAYER (src/lib/)                                │   │
│  │  API client, generic hooks, validators, utils           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  STATE LAYER (src/stores/ + TanStack Query)             │   │
│  │  Global state (auth, UI), server state (API data)        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2.2 Rendering Philosophy

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Rendering model** | Client-side rendering (CSR) SPA | Simpler deployment, Cloudflare Pages edge hosting |
| **SSR** | Not used in v1 | Cloudflare middleware handles SEO, no Node.js server needed |
| **Hydration** | Not applicable (no SSR) | Pure SPA with edge API |
| **Streaming** | Not used in v1 | Future optimization path |
| **Code splitting** | Route-level with React.lazy() | Reduce initial bundle, load on demand |
| **Prefetching** | Link prefetch for likely next routes | Improve perceived performance |

### 1.2.3 Module Boundaries

| Module | Boundary | Dependencies |
|--------|----------|-------------|
| **Features** | Self-contained (components, hooks, API, types) | Shared UI, lib utilities, global stores |
| **Shared UI** | Pure UI primitives, no business logic | Design tokens, Lucide icons |
| **Shared Layout** | Layout components (Header, Footer, Nav) | Shared UI, auth stores |
| **Lib** | Generic utilities (no feature logic) | No feature imports |
| **Stores** | Global state only (auth, UI preferences) | No feature-specific state |
| **Types** | Global TypeScript types | No circular dependencies |

### 1.2.4 Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                             │
│                                                                  │
│  LAYER 1: ATOMS (src/shared/ui/)                                │
│  Button, Input, Badge, Card, Dialog, Toast, Skeleton, Label     │
│  → Zero business logic, pure presentation, forwardRef           │
│                                                                  │
│  LAYER 2: MOLECULES (src/shared/ui/)                             │
│  SearchInput, FormField, CardHeader, Select, Checkbox           │
│  → Compose 2-3 atoms, still no business logic                    │
│                                                                  │
│  LAYER 3: ORGANISMS (src/shared/layout/)                         │
│  Header, Footer, Sidebar, MegaMenu, BottomNav                   │
│  → Compose molecules + atoms, layout-aware, responsive          │
│                                                                  │
│  LAYER 4: FEATURE COMPONENTS (src/features/*/components/)       │
│  ProductCard, LoginForm, CartDrawer, OrderList                 │
│  → Domain-specific, use feature hooks/stores, compose primitives │
│                                                                  │
│  LAYER 5: PAGES (src/features/*/pages/)                        │
│  HomePage, ProductPage, CheckoutPage, AdminDashboard            │
│  → Route-level, data fetching, orchestration, compose features  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2.5 Separation of Concerns

| Concern | Location | Rule |
|---------|----------|------|
| **Business logic** | Backend services (api/_lib/{domain}/) | Never in frontend components |
| **State transitions** | Backend services | Frontend only reflects state |
| **Calculations** | Backend services | Frontend displays computed values |
| **Validation** | Backend (L1-L5 layers) | Frontend validation is convenience only |
| **Data fetching** | TanStack Query hooks | Never in useEffect |
| **API calls** | src/lib/api/client.ts + feature API files | Centralized HTTP client |
| **Routing** | React Router v7 | Single route definition file |
| **Styling** | Tailwind CSS + design tokens | No CSS Modules, no inline styles |
| **Icons** | Lucide React | Consistent icon library |

## 1.3 Page Composition

### 1.3.1 Universal Page Structure

Every page follows this composition pattern:

```
┌─────────────────────────────────────────────────────────────────┐
│  PAGE COMPOSITION PATTERN                                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LAYOUT WRAPPER (Layout, PublicLayout, AdminLayout)     │   │
│  │  → Provides Header, Footer, Navigation, Sidebar         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAGE COMPONENT (src/features/*/pages/PageName.tsx)     │   │
│  │  → Data fetching (TanStack Query)                       │   │
│  │  → State management (feature hooks/stores)               │   │
│  │  → Orchestration of feature components                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FEATURE COMPONENTS (src/features/*/components/)        │   │
│  │  → Domain-specific UI, composed from shared primitives  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SHARED PRIMITIVES (src/shared/ui/)                     │   │
│  │  → Button, Input, Card, Dialog, etc.                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3.2 Page Component Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One component per page** | File name matches route name | Easy to find |
| **Data fetching at page level** | TanStack Query hooks in page component | Orchestration at page, display in components |
| **No API calls in components** | Components receive data via props | Testability, reusability |
| **Loading states at page level** | Page shows skeleton, components render data | Consistent loading experience |
| **Error boundaries at page level** | Each page wrapped in error boundary | Graceful degradation |
| **Max 300 lines per page** | Split complex pages into sub-components | Readability |
| **Named exports only** | No default exports | Better refactoring |

---

# 2. Application Structure

## 2.1 Application Folders

### 2.1.1 Complete Frontend Directory Structure

```
src/
├── app/                              # Application shell
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # Entry point
│   ├── providers.tsx                 # Provider composition
│   └── routes.tsx                    # Route definitions
│
├── features/                         # Feature modules (self-contained)
│   ├── auth/                         # Authentication feature
│   │   ├── components/               # UI components
│   │   ├── hooks/                    # Custom hooks
│   │   ├── api/                      # API client functions
│   │   ├── store/                    # Zustand stores (optional)
│   │   ├── validators/               # Zod schemas (optional)
│   │   └── types.ts                  # TypeScript types
│   │
│   ├── products/                     # Product feature
│   ├── cart/                         # Cart feature
│   ├── checkout/                     # Checkout feature
│   ├── orders/                       # Orders feature
│   ├── search/                       # Search feature
│   ├── wishlist/                     # Wishlist feature
│   ├── home/                         # Homepage feature
│   └── admin/                        # Admin panel feature
│
├── shared/                           # Shared components and utilities
│   ├── ui/                           # Design system primitives
│   ├── layout/                       # Layout components
│   ├── auth/                         # Auth guard components
│   └── feedback/                     # Feedback UI components
│
├── lib/                              # Global utilities (no feature logic)
│   ├── api/                          # HTTP client
│   ├── utils/                        # Pure utility functions
│   ├── hooks/                        # Generic hooks
│   ├── validators/                   # Shared Zod schemas
│   ├── config.ts                     # App configuration
│   ├── constants.ts                  # Global constants
│   └── seo.ts                        # SEO helpers
│
├── stores/                           # Global Zustand stores
│   ├── auth-store.ts                 # Auth state
│   ├── ui-store.ts                   # UI state
│   └── index.ts                      # Barrel file
│
├── types/                            # Global TypeScript types
│   ├── product.ts                    # Product types
│   ├── order.ts                      # Order types
│   ├── user.ts                       # User types
│   └── index.ts                      # Barrel file
│
└── styles/
    └── globals.css                   # Global styles, Tailwind config
```

### 2.1.2 Folder Responsibilities

| Folder | Responsibility | Owner |
|--------|---------------|-------|
| `app/` | Application shell, routing, providers | Core |
| `features/` | Feature modules (self-contained) | Feature teams |
| `shared/ui/` | Design system primitives | Design system |
| `shared/layout/` | Layout components | Layout |
| `shared/auth/` | Auth guards | Security |
| `shared/feedback/` | Error boundaries, loading states | UX |
| `lib/api/` | HTTP client, endpoint constants | API integration |
| `lib/utils/` | Pure utility functions | Core |
| `lib/hooks/` | Generic hooks (not feature-specific) | Core |
| `lib/validators/` | Shared Zod schemas | Validation |
| `stores/` | Global Zustand stores | State |
| `types/` | Global TypeScript types | Types |
| `styles/` | Global CSS, Tailwind config | Styling |

## 2.2 Modules

### 2.2.1 Feature Module Structure

Every feature module follows this exact structure:

```
src/features/{feature-name}/
├── components/                       # UI components specific to this feature
│   ├── ComponentName.tsx             # One component per file
│   └── index.ts                      # Barrel file (optional)
│
├── hooks/                            # Custom hooks specific to this feature
│   ├── useHookName.ts                # One hook per file
│   └── index.ts                      # Barrel file (optional)
│
├── api/                              # API client functions
│   └── {feature-name}.ts             # API calls for this feature
│
├── store/                            # Zustand stores (only if needed)
│   └── {feature-name}-store.ts       # Feature-specific state
│
├── validators/                       # Zod schemas (only if forms)
│   └── {feature-name}.ts             # Validation schemas
│
└── types.ts                          # TypeScript types for this feature
```

### 2.2.2 Feature Module Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Self-contained** | Components, hooks, API, types in one folder | Co-location |
| **No cross-feature imports** | Features cannot import from other features | Prevents coupling |
| **One component per file** | File name matches component name | Easy to find |
| **Named exports only** | No default exports | Better refactoring |
| **Types at root** | `types.ts` at feature root | Easy to find |
| **API client separate** | `api/` folder for API calls | Separation of concerns |
| **Store optional** | Only create if feature needs client state | Minimize client state |
| **Validators optional** | Only create if feature has forms | Avoid unused code |

## 2.3 Features

### 2.3.1 Feature Catalog

| Feature | Purpose | Components | Hooks | API | Store |
|---------|---------|------------|-------|-----|-------|
| **auth** | Authentication | LoginForm, RegisterForm, PasswordReset | useAuth | auth API | auth-store |
| **products** | Product browsing | ProductCard, ProductGrid, ProductDetail | useProducts, useProduct | products API | — |
| **cart** | Shopping cart | CartDrawer, CartItem, CartSummary | useCart | cart API | cart-store |
| **checkout** | Checkout flow | CheckoutLayout, ShippingStep, PaymentStep | useCheckout | checkout API | — |
| **orders** | Order management | OrderList, OrderDetail, OrderTracking | useOrders | orders API | — |
| **search** | Product search | SearchOverlay, SearchResults, SearchFilters | useSearch | search API | — |
| **wishlist** | Wishlist management | WishlistButton, WishlistPage | useWishlist | wishlist API | — |
| **home** | Homepage | HeroSection, FeaturedProducts, NewArrivals | useHomepage | home API | — |
| **admin** | Admin dashboard | AdminLayout, Dashboard, ProductManagement | useAdmin | admin API | — |

### 2.3.2 Feature Dependencies

| Feature | Depends On | Dependency Type |
|---------|------------|----------------|
| **auth** | shared/ui, lib/api, stores/auth-store | Shared primitives |
| **products** | shared/ui, lib/api | Shared primitives |
| **cart** | shared/ui, products, lib/api, stores/cart-store | Products (for product data) |
| **checkout** | cart, auth, shared/ui, lib/api | Cart, Auth |
| **orders** | auth, shared/ui, lib/api | Auth |
| **search** | shared/ui, lib/api | Shared primitives |
| **wishlist** | auth, products, shared/ui, lib/api | Auth, Products |
| **home** | products, shared/ui, lib/api | Products |
| **admin** | auth, shared/ui, lib/api | Auth |

## 2.4 Shared Components

### 2.4.1 Shared UI Primitives

Location: `src/shared/ui/`

| Component | Purpose | Props Pattern |
|-----------|---------|--------------|
| **Button** | Primary interactive element | variant, size, isLoading, disabled, leftIcon, rightIcon |
| **Input** | Text input field | label, error, helperText, size, disabled |
| **Select** | Dropdown selection | options, value, onChange, placeholder |
| **Badge** | Status indicator | variant, size, children |
| **Card** | Content container | children, className, variant |
| **Dialog** | Modal dialog | open, onOpenChange, children |
| **Toast** | Notification message | variant, title, description |
| **Skeleton** | Loading placeholder | className, variant |
| **Label** | Form label | htmlFor, children, required |
| **Checkbox** | Binary toggle | checked, onChange, label, disabled |
| **Radio** | Single selection | checked, onChange, label, disabled |
| **Switch** | Toggle switch | checked, onChange, label, disabled |
| **Tabs** | Tab navigation | value, onValueChange, children |
| **Tooltip** | Hover information | children, content |
| **Accordion** | Collapsible content | value, onValueChange, children |
| **Breadcrumbs** | Navigation trail | items |
| **Pagination** | Page navigation | page, totalPages, onPageChange |
| **EmptyState** | Empty content placeholder | title, description, action |

### 2.4.2 Shared Layout Components

Location: `src/shared/layout/`

| Component | Purpose | Responsiveness |
|-----------|---------|----------------|
| **Header** | Site header with navigation | Mobile (56px), Tablet (64px), Desktop (80px) |
| **Footer** | Site footer with links | Desktop only |
| **MobileNav** | Mobile drawer menu | Mobile only |
| **BottomNav** | Mobile bottom navigation | Mobile only (5 tabs) |
| **MegaMenu** | Desktop mega menu | Desktop only |
| **Layout** | Main layout wrapper | Responsive container |
| **Sidebar** | Dashboard sidebar | Desktop (280px), mobile (drawer) |

### 2.4.3 Shared Auth Components

Location: `src/shared/auth/`

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **ProtectedRoute** | Auth-protected route | Redirects to login if not authenticated |
| **AdminRoute** | Admin-only route | Redirects to dashboard if not admin |

### 2.4.4 Shared Feedback Components

Location: `src/shared/feedback/`

| Component | Purpose | Behavior |
|-----------|---------|----------|
| **ErrorBoundary** | React error boundary | Catches errors, shows error page |
| **ErrorPage** | Error page display | Shows error message, retry button |
| **LoadingSpinner** | Loading indicator | Centered spinner |
| **SkipToContent** | Accessibility skip link | Skips to main content |

## 2.5 Shared Utilities

### 2.5.1 API Client

Location: `src/lib/api/`

| File | Purpose |
|------|---------|
| **client.ts** | Fetch wrapper with auth, CSRF, retry logic |
| **endpoints.ts** | API endpoint constants |
| **types.ts** | API response types |

### 2.5.2 Utility Functions

Location: `src/lib/utils/`

| File | Purpose |
|------|---------|
| **cn.ts** | ClassName utility (clsx + tailwind-merge) |
| **format.ts** | Number, currency, date formatting |
| **slug.ts** | Slug generation |
| **responsive.ts** | Responsive helpers |

### 2.5.3 Generic Hooks

Location: `src/lib/hooks/`

| Hook | Purpose |
|------|---------|
| **useDebounce** | Debounce value |
| **useLocalStorage** | LocalStorage hook |
| **useMediaQuery** | Media query hook |
| **useClickOutside** | Click outside hook |
| **useFocusTrap** | Focus trap hook |
| **useInfiniteScroll** | Infinite scroll hook |

### 2.5.4 Shared Validators

Location: `src/lib/validators/`

| File | Purpose |
|------|---------|
| **auth.ts** | Auth validation schemas |
| **product.ts** | Product validation schemas |
| **cart.ts** | Cart validation schemas |
| **checkout.ts** | Checkout validation schemas |
| **index.ts** | Barrel file |

## 2.6 Shared Services

### 2.6.1 Configuration

Location: `src/lib/config.ts`

- App configuration constants
- Environment-specific settings
- Feature flags

### 2.6.2 Constants

Location: `src/lib/constants.ts`

- Global constants (pagination defaults, breakpoints, etc.)
- Magic numbers eliminated

### 2.6.3 SEO Helpers

Location: `src/lib/seo.ts`

- Meta tag generation
- OpenGraph helpers
- Structured data helpers

## 2.7 Assets

### 2.7.1 Asset Location

- **Images:** `public/` (served by Cloudflare Pages)
- **Icons:** Lucide React (tree-shakeable)
- **Fonts:** Google Fonts (Cormorant Garamond, Manrope)

### 2.7.2 Asset Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Images in public/** | Static assets served directly | CDN caching |
| **Optimize images** | Cloudinary auto-format, auto-quality | Performance |
| **Lazy load images** | Loading="lazy" for below-fold images | Performance |
| **Responsive images** | srcSet for different screen sizes | Performance |
| **Icon library** | Lucide React only | Consistency |

## 2.8 Constants

### 2.8.1 Global Constants

Location: `src/lib/constants.ts`

| Constant | Value | Usage |
|-----------|-------|-------|
| **PAGINATION_DEFAULT_PAGE** | 1 | Default page number |
| **PAGINATION_DEFAULT_LIMIT** | 24 | Default items per page |
| **PAGINATION_MAX_LIMIT** | 100 | Maximum items per page |
| **SEARCH_MAX_RESULTS** | 50 | Maximum search results |
| **SEARCH_DEBOUNCE_MS** | 300 | Search debounce delay |
| **BREAKPOINTS** | { mobile: 640, tablet: 1024, desktop: 1280 } | Responsive breakpoints |

## 2.9 Types

### 2.9.1 Global Types

Location: `src/types/`

| File | Purpose |
|------|---------|
| **product.ts** | Product types |
| **order.ts** | Order types |
| **user.ts** | User types |
| **cart.ts** | Cart types |
| **admin.ts** | Admin types |
| **index.ts** | Barrel file |

### 2.9.2 Type Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Export types** | Export types alongside implementations | Type safety |
| **No `any`** | Use `unknown` or proper types | Type safety |
| **Discriminated unions** | For API responses | Type narrowing |
| **Shared types** | In `src/types/` for cross-feature types | Reusability |

---

# 3. Routing

## 3.1 Public Routes

Routes accessible without authentication.

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | HomePage | Homepage |
| `/shop` | ShopPage | Product listing |
| `/shop/:category` | CategoryPage | Category listing |
| `/shop/:category/:slug` | ProductPage | Product detail |
| `/search` | SearchPage | Search results |
| `/about` | AboutPage | About page (CMS) |
| `/contact` | ContactPage | Contact page (CMS) |
| `/faq` | FAQPage | FAQ page (CMS) |
| `/terms` | TermsPage | Terms of service (CMS) |
| `/privacy` | PrivacyPage | Privacy policy (CMS) |
| `/blog` | BlogPage | Blog listing (CMS) |
| `/blog/:slug` | BlogPostPage | Blog post (CMS) |

## 3.2 Customer Routes

Routes requiring customer authentication.

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/account` | AccountPage | Account dashboard | Yes |
| `/account/profile` | ProfilePage | Profile management | Yes |
| `/account/orders` | OrdersPage | Order history | Yes |
| `/account/orders/:id` | OrderDetailPage | Order details | Yes |
| `/account/addresses` | AddressesPage | Address management | Yes |
| `/account/wishlist` | WishlistPage | Wishlist | Yes |
| `/account/settings` | SettingsPage | Account settings | Yes |
| `/cart` | CartPage | Shopping cart | No (guest allowed) |
| `/checkout` | CheckoutPage | Checkout flow | No (guest allowed) |

## 3.3 Shop Owner Routes

Routes requiring shop owner authentication.

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/shop` | ShopDashboard | Shop owner dashboard | Shop Owner |
| `/shop/products` | ShopProducts | Product management | Shop Owner |
| `/shop/orders` | ShopOrders | Order management | Shop Owner |
| `/shop/customers` | ShopCustomers | Customer management | Shop Owner |
| `/shop/analytics` | ShopAnalytics | Shop analytics | Shop Owner |
| `/shop/settings` | ShopSettings | Shop settings | Shop Owner |

## 3.4 Admin Routes

Routes requiring admin authentication.

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/admin` | AdminDashboard | Admin dashboard | Admin |
| `/admin/products` | AdminProducts | Product management | Admin |
| `/admin/orders` | AdminOrders | Order management | Admin |
| `/admin/customers` | AdminCustomers | Customer management | Admin |
| `/admin/categories` | AdminCategories | Category management | Admin |
| `/admin/collections` | AdminCollections | Collection management | Admin |
| `/admin/brands` | AdminBrands | Brand management | Admin |
| `/admin/coupons` | AdminCoupons | Coupon management | Admin |
| `/admin/cms` | AdminCMS | CMS management | Admin |
| `/admin/media` | AdminMedia | Media library | Admin |
| `/admin/analytics` | AdminAnalytics | Analytics dashboard | Admin |
| `/admin/settings` | AdminSettings | Admin settings | Admin |

## 3.5 Protected Routes

Routes wrapped with authentication guards.

### 3.5.1 Protected Route Pattern

```typescript
// Protected route for customer routes
<ProtectedRoute>
  <AccountPage />
</ProtectedRoute>

// Protected route for admin routes
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

### 3.5.2 Protected Route Behavior

| Scenario | Behavior |
|----------|----------|
| **Not authenticated** | Redirect to `/login` with return URL |
| **Authenticated but wrong role** | Redirect to appropriate dashboard or 403 |
| **Authenticated with correct role** | Render component |

## 3.6 Guest Routes

Routes accessible to guest users (no authentication required).

| Route | Component | Guest Behavior |
|-------|-----------|---------------|
| `/cart` | CartPage | Guest cart stored in cookie/localStorage |
| `/checkout` | CheckoutPage | Guest checkout allowed, account creation optional |
| `/login` | LoginPage | Login page |
| `/register` | RegisterPage | Registration page |
| `/forgot-password` | ForgotPasswordPage | Password reset request |
| `/reset-password` | ResetPasswordPage | Password reset with token |

## 3.7 Nested Routes

Routes with child routes for tabbed or sectioned content.

| Parent Route | Child Routes | Pattern |
|--------------|-------------|---------|
| `/account` | `/profile`, `/orders`, `/addresses`, `/wishlist`, `/settings` | Sidebar navigation |
| `/admin` | `/products`, `/orders`, `/customers`, `/categories`, etc. | Sidebar navigation |
| `/shop` | `/:category`, `/:category/:slug` | Category hierarchy |

## 3.8 Dynamic Routes

Routes with dynamic parameters.

| Route Pattern | Parameter | Example |
|---------------|-----------|---------|
| `/shop/:category` | category | `/shop/men` |
| `/shop/:category/:slug` | category, slug | `/shop/men/t-shirt` |
| `/account/orders/:id` | id | `/account/orders/abc-123` |
| `/blog/:slug` | slug | `/blog/summer-collection` |

## 3.9 Error Routes

Routes for error states.

| Route | Component | Purpose |
|-------|-----------|---------|
| `/404` | NotFoundPage | 404 not found |
| `/500` | ServerErrorPage | 500 server error |
| `/error` | ErrorPage | Generic error page |

## 3.10 Route Implementation Standards

### 3.10.1 Route Definition

Location: `src/app/routes.tsx`

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load route components
const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const ShopPage = lazy(() => import('@/features/products/pages/ShopPage'));
// ... other routes

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      // ... other routes
    ],
  },
  // ... other route groups
]);

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
```

### 3.10.2 Route Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lazy load all routes** | React.lazy() for route components | Reduce initial bundle |
| **Suspense boundary** | Suspense with loading fallback | Smooth loading |
| **Single route file** | All routes in `src/app/routes.tsx` | Easy to find |
| **Named exports** | No default exports for page components | Better refactoring |
| **URL state** | Use search params for filters, pagination | Shareable, bookmarkable |
| **Protected routes** | Wrap with ProtectedRoute component | Auth enforcement |

---

# 4. Layout System

## 4.1 Public Layout

### 4.1.1 Purpose

Layout for public-facing pages (homepage, shop, search, CMS pages).

### 4.1.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  PUBLIC LAYOUT                                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HEADER (fixed, z-100)                                    │   │
│  │  Logo | Navigation | Search | Cart | Account              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MAIN CONTENT (scrollable)                                │   │
│  │  Page content with container (max-width 1280px)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BOTTOM NAV (mobile only, fixed bottom, z-100)           │   │
│  │  Home | Shop | Search | Cart | Account                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FOOTER (desktop only)                                    │   │
│  │  Links, newsletter, trust signals                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.1.3 Component

Location: `src/shared/layout/PublicLayout.tsx`

### 4.1.4 Responsive Behavior

| Breakpoint | Header Height | Bottom Nav | Footer |
|------------|--------------|------------|--------|
| **Mobile** (< 640px) | 56px | Visible (64px) | Hidden |
| **Tablet** (640-1023px) | 64px | Hidden | Visible |
| **Desktop** (1024px+) | 80px | Hidden | Visible |

## 4.2 Customer Layout

### 4.2.1 Purpose

Layout for customer account pages.

### 4.2.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  CUSTOMER LAYOUT                                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HEADER (fixed, z-100)                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MAIN CONTENT (scrollable)                                │   │
│  │  ┌──────────────┐  ┌────────────────────────────────┐  │   │
│  │  │              │  │                                │  │   │
│  │  │  SIDEBAR     │  │  PAGE CONTENT                 │  │   │
│  │  │  (desktop)   │  │  (account pages)              │  │   │
│  │  │              │  │                                │  │   │
│  │  └──────────────┘  └────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BOTTOM NAV (mobile only)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2.3 Component

Location: `src/shared/layout/CustomerLayout.tsx`

### 4.2.4 Responsive Behavior

| Breakpoint | Sidebar | Navigation |
|------------|---------|------------|
| **Mobile** (< 640px) | Hidden (drawer) | Bottom nav |
| **Tablet** (640-1023px) | Collapsible | Bottom nav hidden |
| **Desktop** (1024px+) | Visible (280px) | Top nav |

## 4.3 Shop Layout

### 4.3.1 Purpose

Layout for shop owner dashboard pages.

### 4.3.2 Structure

Same as Customer Layout but with shop-specific sidebar items.

### 4.3.3 Component

Location: `src/shared/layout/ShopLayout.tsx`

## 4.4 Admin Layout

### 4.4.1 Purpose

Layout for admin dashboard pages.

### 4.4.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN LAYOUT                                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ADMIN TOP BAR (fixed, z-100)                             │   │
│  │  Logo | Admin Menu | User | Notifications               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MAIN CONTENT (scrollable)                                │   │
│  │  ┌──────────────┐  ┌────────────────────────────────┐  │   │
│  │  │              │  │                                │  │   │
│  │  │  SIDEBAR     │  │  PAGE CONTENT                 │  │   │
│  │  │  (280px)     │  │  (admin pages)                │  │   │
│  │  │              │  │                                │  │   │
│  │  └──────────────┘  └────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4.3 Component

Location: `src/shared/layout/AdminLayout.tsx`

### 4.4.4 Responsive Behavior

| Breakpoint | Sidebar Width | Collapsible |
|------------|---------------|-------------|
| **Mobile** (< 640px) | Full-width drawer | Yes |
| **Tablet** (640-1023px) | 200px | Yes |
| **Desktop** (1024px+) | 280px | Yes |

## 4.5 Authentication Layout

### 4.5.1 Purpose

Layout for authentication pages (login, register, password reset).

### 4.5.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  AUTH LAYOUT                                                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HEADER (minimal, logo only)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MAIN CONTENT (centered)                                  │   │
│  │  ┌──────────────────────┐                                 │   │
│  │  │                      │                                 │   │
│  │  │   AUTH FORM          │                                 │   │
│  │  │   (max-width 640px)  │                                 │   │
│  │  │                      │                                 │   │
│  │  └──────────────────────┘                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FOOTER (minimal)                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5.3 Component

Location: `src/shared/layout/AuthLayout.tsx`

### 4.5.4 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimal header** | Logo only | Focus on form |
| **Centered content** | Max-width 640px, centered | Readability |
| **No navigation** | No nav links | Focus on auth |
| **Full height** | Min-height 100vh | Centered vertically |

## 4.6 CMS Layout

### 4.6.1 Purpose

Layout for CMS pages (blog, about, contact, FAQ).

### 4.6.2 Structure

Same as Public Layout with CMS-specific header/footer.

### 4.6.3 Component

Location: `src/shared/layout/CMSLayout.tsx`

## 4.7 Dashboard Layout

### 4.7.1 Purpose

Layout for dashboard pages (admin and shop owner).

### 4.7.2 Structure

Same as Admin Layout but with configurable sidebar items.

### 4.7.3 Component

Location: `src/shared/layout/DashboardLayout.tsx`

### 4.7.4 Dashboard Layout Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Sidebar fixed** | Fixed position on desktop | Always accessible |
| **Collapsible** | Collapse to icons on desktop | Content space |
| **Mobile drawer** | Full-width drawer on mobile | Touch-friendly |
| **Top bar** | User menu, notifications | Quick access |
| **Content scrollable** | Main content scrolls independently | Performance |

---

# 5. Page Implementation

## 5.1 Homepage

### 5.1.1 Responsibility

Display brand statement, featured products, new arrivals, categories, and editorial content.

### 5.1.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  HOMEPAGE                                                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HERO SECTION                                            │   │
│  │  Full-width image + headline + CTA                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FEATURED COLLECTION                                     │   │
│  │  Section title + horizontal scroll (mobile) / grid       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  NEW ARRIVALS                                             │   │
│  │  Section title + product grid                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CATEGORIES                                               │   │
│  │  Category cards with images                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BEST SELLERS                                             │   │
│  │  Section title + product grid                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BLOG / EDITORIAL                                         │   │
│  │  Featured posts                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.1.3 Component Hierarchy

```
HomePage
├── HeroSection
├── FeaturedCollection
│   └── ProductGrid
├── NewArrivals
│   └── ProductGrid
├── Categories
│   └── CategoryCard
├── BestSellers
│   └── ProductGrid
└── BlogSection
    └── BlogCard
```

### 5.1.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **products API** | API | Fetch featured, new arrivals, best sellers |
| **categories API** | API | Fetch categories |
| **blog API** | API | Fetch blog posts |
| **ProductCard** | Shared UI | Display product |
| **CategoryCard** | Feature component | Display category |

### 5.1.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/products/featured` | GET | Fetch featured products | 5 min |
| `/api/products/new` | GET | Fetch new arrivals | 5 min |
| `/api/products/bestsellers` | GET | Fetch best sellers | 5 min |
| `/api/categories` | GET | Fetch categories | 1 hour |
| `/api/blog/featured` | GET | Fetch featured posts | 10 min |

### 5.1.6 Responsive Behavior

| Section | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Hero** | Full height (80vh) | Full height (100vh) | Full height (100vh) |
| **Featured** | Horizontal scroll | 3 columns | 4 columns |
| **New Arrivals** | 2 columns | 3 columns | 4 columns |
| **Categories** | 2 columns | 3 columns | 4 columns |
| **Best Sellers** | 2 columns | 3 columns | 4 columns |
| **Blog** | 1 column | 2 columns | 3 columns |

### 5.1.7 Accessibility Requirements

- Skip to content link
- Keyboard navigation for all sections
- ARIA labels for carousels
- Alt text for all images
- Focus indicators on CTAs

### 5.1.8 Performance Requirements

- Hero image lazy load below fold
- Product cards lazy load
- Code split sections
- Prefetch next routes (shop, product detail)

## 5.2 Product Listing

### 5.2.1 Responsibility

Display products in a grid with filters, sort, and pagination.

### 5.2.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  PRODUCT LISTING PAGE                                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAGE TITLE + BREADCRUMB                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FILTERS + SORT (desktop sidebar, mobile bottom sheet)  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PRODUCT GRID (2/3/4 columns responsive)                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAGINATION                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2.3 Component Hierarchy

```
ShopPage
├── PageHeader (title + breadcrumb)
├── FilterPanel (desktop sidebar, mobile bottom sheet)
├── SortBar
├── ProductGrid
│   └── ProductCard
└── Pagination
```

### 5.2.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **products API** | API | Fetch products with filters |
| **ProductCard** | Shared UI | Display product |
| **FilterPanel** | Feature component | Filter controls |
| **Pagination** | Shared UI | Page navigation |

### 5.2.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/products` | GET | Fetch products with filters | 5 min |
| Query params: | | | |
| `?category=` | Filter by category | | |
| `?collection=` | Filter by collection | | |
| `?minPrice=` | Filter by min price | | |
| `?maxPrice=` | Filter by max price | | |
| `?inStock=true` | Filter by stock | | |
| `?sort=` | Sort order | | |
| `?page=` | Page number | | |
| `?limit=` | Items per page | | |

### 5.2.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Filters** | Bottom sheet | Left sidebar (200px) | Left sidebar (280px) |
| **Product Grid** | 2 columns | 3 columns | 4 columns |
| **Sort Bar** | Top, horizontal | Top, horizontal | Top, horizontal |
| **Pagination** | Bottom | Bottom | Bottom |

### 5.2.7 Accessibility Requirements

- Filter panel keyboard accessible
- Sort dropdown keyboard accessible
- Product cards keyboard focusable
- ARIA live region for filter count

### 5.2.8 Performance Requirements

- Infinite scroll optional (cursor-based)
- Product images lazy load
- Filter debouncing (300ms)
- Prefetch product detail on hover

## 5.3 Product Details

### 5.3.1 Responsibility

Display product information, images, variants, reviews, and related products.

### 5.3.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  PRODUCT DETAIL PAGE                                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  BREADCRUMB                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PRODUCT IMAGES (swipeable carousel)                     │   │
│  │  THUMBNAILS (scrollable)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PRODUCT INFO                                            │   │
│  │  Title, price, rating, description, size guide            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  VARIANT SELECTOR (size, color)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ADD TO CART + WISHLIST (sticky on scroll)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  REVIEWS SECTION                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RELATED PRODUCTS                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3.3 Component Hierarchy

```
ProductPage
├── Breadcrumbs
├── ProductImageCarousel
│   └── ProductImage
├── ThumbnailRow
├── ProductInfo
│   ├── ProductTitle
│   ├── ProductPrice
│   ├── ProductRating
│   ├── ProductDescription
│   └── SizeGuide
├── VariantSelector
│   ├── SizeSelector
│   └── ColorSelector
├── StickyCTA (Add to Cart + Wishlist)
├── ReviewsSection
│   └── ReviewCard
└── RelatedProducts
    └── ProductCard
```

### 5.3.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **product API** | API | Fetch product details |
| **reviews API** | API | Fetch product reviews |
| **cart API** | API | Add to cart |
| **wishlist API** | API | Add to wishlist |
| **ProductCard** | Shared UI | Display related products |

### 5.3.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/products/:id` | GET | Fetch product details | 5 min |
| `/api/products/:id/reviews` | GET | Fetch product reviews | 10 min |
| `/api/products/:id/related` | GET | Fetch related products | 10 min |
| `/api/cart/add` | POST | Add to cart | None |
| `/api/wishlist/add` | POST | Add to wishlist | None |

### 5.3.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Images** | Swipeable carousel | Swipeable carousel | Grid (left) + thumbnails (right) |
| **Info** | Below images | Below images | Right of images |
| **CTA** | Sticky bottom | Sticky bottom | Sticky below images |
| **Reviews** | 1 column | 1 column | 2 columns |

### 5.3.7 Accessibility Requirements

- Image carousel keyboard navigable
- Variant selector keyboard accessible
- Add to cart button always keyboard focusable
- ARIA labels for variant states

### 5.3.8 Performance Requirements

- First image priority load
- Other images lazy load
- Thumbnails lazy load
- Prefetch related products

## 5.4 Search

### 5.4.1 Responsibility

Display search results with filters, sort, and pagination.

### 5.4.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  SEARCH PAGE                                                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SEARCH INPUT (large, focused)                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ACTIVE FILTERS (chips)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SEARCH RESULTS (product grid)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAGINATION                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4.3 Component Hierarchy

```
SearchPage
├── SearchInput
├── ActiveFilters
├── SearchResults
│   └── ProductCard
└── Pagination
```

### 5.4.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **search API** | API | Fetch search results |
| **ProductCard** | Shared UI | Display product |

### 5.4.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/search` | GET | Search products | 1 min |
| Query params: | | | |
| `?q=` | Search query | | |
| Debounce: 300ms | | | |

### 5.4.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Search Input** | Full width | Full width | Centered, max-width 600px |
| **Results** | 2 columns | 3 columns | 4 columns |

### 5.4.7 Accessibility Requirements

- Search input auto-focus
- Keyboard navigation for filters
- ARIA live region for result count
- Clear search button

### 5.4.8 Performance Requirements

- Debounce search input (300ms)
- Cursor-based pagination
- Prefetch on search submit

## 5.5 Cart

### 5.5.1 Responsibility

Display cart items, allow quantity adjustments, and initiate checkout.

### 5.5.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  CART PAGE                                                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAGE TITLE                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CART ITEMS LIST                                         │   │
│  │  - Product image, name, price                           │   │
│  │  - Quantity controls (+/-)                              │   │
│  │  - Remove button                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ORDER SUMMARY                                          │   │
│  │  - Subtotal                                            │   │
│  │  - Shipping estimate                                    │   │
│  │  - Promo code input                                     │   │
│  │  - Total                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CHECKOUT BUTTON (sticky on mobile)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5.3 Component Hierarchy

```
CartPage
├── CartItemList
│   └── CartItem
├── OrderSummary
├── PromoCodeInput
└── CheckoutButton
```

### 5.5.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **cart API** | API | Fetch cart, update quantity, remove item |
| **CartItem** | Feature component | Display cart item |

### 5.5.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/cart` | GET | Fetch cart | None (session-based) |
| `/api/cart/:id` | PATCH | Update quantity | None |
| `/api/cart/:id` | DELETE | Remove item | None |
| `/api/cart/apply-promo` | POST | Apply promo code | None |

### 5.5.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Cart Items** | Full width | Full width | Full width |
| **Order Summary** | Collapsible | Collapsible | Always visible (right sidebar) |
| **Checkout Button** | Sticky bottom | Sticky bottom | Bottom of summary |

### 5.5.7 Accessibility Requirements

- Quantity controls keyboard accessible
- Remove button confirmation
- ARIA live region for total updates

### 5.5.8 Performance Requirements

- Optimistic updates for quantity changes
- Real-time total calculation
- Prefetch checkout on button hover

## 5.6 Wishlist

### 5.6.1 Responsibility

Display wishlist items and allow removal.

### 5.6.2 Structure

Similar to Cart but without quantity controls.

### 5.6.3 Component Hierarchy

```
WishlistPage
├── WishlistGrid
│   └── ProductCard (with remove button)
└── EmptyState (when empty)
```

### 5.6.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **wishlist API** | API | Fetch wishlist, remove item |
| **ProductCard** | Shared UI | Display product |

### 5.6.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/wishlist` | GET | Fetch wishlist | None |
| `/api/wishlist/:id` | DELETE | Remove item | None |

### 5.6.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Grid** | 2 columns | 3 columns | 4 columns |

### 5.6.7 Accessibility Requirements

- Remove button keyboard accessible
- Empty state guidance

### 5.6.8 Performance Requirements

- Lazy load wishlist items
- Prefetch product detail on hover

## 5.7 Checkout

### 5.7.1 Responsibility

Multi-step checkout flow: contact info, shipping address, shipping method, payment.

### 5.7.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  CHECKOUT PAGE                                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PROGRESS INDICATOR                                      │   │
│  │  Contact → Shipping → Payment → Review                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ORDER SUMMARY (collapsible on mobile)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CHECKOUT FORM (multi-step)                              │   │
│  │  - Contact info (email, phone)                           │   │
│  │  - Shipping address                                     │   │
│  │  - Shipping method                                      │   │
│  │  - Payment method                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PLACE ORDER BUTTON                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.7.3 Component Hierarchy

```
CheckoutPage
├── ProgressIndicator
├── OrderSummary (collapsible)
├── CheckoutForm
│   ├── ContactStep
│   ├── ShippingStep
│   ├── ShippingMethodStep
│   └── PaymentStep
└── PlaceOrderButton
```

### 5.7.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **checkout API** | API | Create checkout session, verify payment |
| **cart API** | API | Fetch cart for summary |
| **React Hook Form** | Library | Form state management |
| **Zod** | Library | Form validation |

### 5.7.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/checkout/session` | POST | Create checkout session | None |
| `/api/checkout/verify-payment` | POST | Verify payment | None |

### 5.7.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Order Summary** | Collapsible (top) | Collapsible (top) | Always visible (right sidebar) |
| **Form** | Full width | Full width | Left column |
| **Progress** | Top (horizontal) | Top (horizontal) | Top (horizontal) |

### 5.7.7 Accessibility Requirements

- Form validation with ARIA
- Keyboard navigation between steps
- Error announcements
- Focus management on step transitions

### 5.7.8 Performance Requirements

- Form validation on blur
- Auto-fill support
- Prefetch payment methods

## 5.8 Orders

### 5.8.1 Responsibility

Display order history and order details.

### 5.8.2 Structure

**Order List:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDERS PAGE                                                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAGE TITLE                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ORDER LIST                                              │   │
│  │  - Order number, date, status, total                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAGINATION                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Order Detail:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDER DETAIL PAGE                                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ORDER INFO (number, date, status)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ORDER ITEMS                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SHIPPING INFO                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAYMENT INFO                                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ACTIONS (cancel, return, track)                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.8.3 Component Hierarchy

```
OrdersPage
├── OrderList
│   └── OrderCard
└── Pagination

OrderDetailPage
├── OrderHeader
├── OrderItems
├── ShippingInfo
├── PaymentInfo
└── OrderActions
```

### 5.8.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **orders API** | API | Fetch orders, order details |
| **OrderCard** | Feature component | Display order summary |

### 5.8.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/orders` | GET | Fetch orders | None (session-based) |
| `/api/orders/:id` | GET | Fetch order details | None |
| `/api/orders/:id/cancel` | POST | Cancel order | None |
| `/api/orders/:id/return` | POST | Request return | None |

### 5.8.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Order List** | 1 column | 1 column | 1 column |
| **Order Detail** | Stacked | Stacked | 2-column (info + items) |

### 5.8.7 Accessibility Requirements

- Order status with ARIA
- Action buttons keyboard accessible
- Status color contrast

### 5.8.8 Performance Requirements

- Lazy load order list pagination
- Prefetch order detail on click

## 5.9 Customer Profile

### 5.9.1 Responsibility

Manage customer profile information.

### 5.9.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  PROFILE PAGE                                                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAGE TITLE                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PROFILE FORM                                            │   │
│  │  - Name, email, phone                                    │   │
│  │  - Avatar upload                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SAVE BUTTON                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.9.3 Component Hierarchy

```
ProfilePage
├── ProfileForm
│   ├── TextInput (name)
│   ├── TextInput (email)
│   ├── TextInput (phone)
│   └── ImageUpload (avatar)
└── SaveButton
```

### 5.9.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **customer API** | API | Fetch profile, update profile |
| **React Hook Form** | Library | Form state |
| **Zod** | Library | Validation |

### 5.9.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/account/profile` | GET | Fetch profile | None |
| `/api/account/profile` | PATCH | Update profile | None |

### 5.9.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Form** | Full width (max 640px) | Full width (max 640px) | Centered (max 640px) |

### 5.9.7 Accessibility Requirements

- Form validation with ARIA
- Avatar upload keyboard accessible
- Save button focus management

### 5.9.8 Performance Requirements

- Optimistic updates for profile changes
- Avatar upload progress indicator

## 5.10 CMS Pages

### 5.10.1 Responsibility

Display CMS content (blog, about, contact, FAQ).

### 5.10.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  CMS PAGE                                                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PAGE TITLE                                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CMS CONTENT (rich text)                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.10.3 Component Hierarchy

```
CMSPage
├── PageHeader
└── CMSContent (rich text renderer)
```

### 5.10.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **CMS API** | API | Fetch CMS content |
| **RichTextRenderer** | Shared UI | Render CMS content |

### 5.10.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/cms/content/:slug` | GET | Fetch CMS content | 10 min |

### 5.10.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Content** | Full width | Max-width 1280px | Max-width 1280px |

### 5.10.7 Accessibility Requirements

- Semantic HTML from CMS
- Alt text for CMS images
- Keyboard navigation for CMS links

### 5.10.8 Performance Requirements

- CMS content caching
- Image lazy load

## 5.11 Shop Dashboard

### 5.11.1 Responsibility

Shop owner dashboard for managing shop.

### 5.11.2 Structure

Similar to Admin Dashboard but with shop-specific features.

### 5.11.3 Component Hierarchy

```
ShopDashboard
├── ShopLayout (sidebar + top bar)
├── DashboardStats
├── RecentOrders
└── QuickActions
```

### 5.11.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **shop API** | API | Fetch shop stats, orders |
| **AdminLayout** | Shared layout | Dashboard layout |

### 5.11.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/shop/dashboard` | GET | Fetch dashboard stats | 5 min |
| `/api/shop/orders` | GET | Fetch recent orders | None |

### 5.11.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Sidebar** | Full-width drawer | Collapsible (200px) | Visible (280px) |
| **Stats** | 2 columns | 2 columns | 4 columns |

### 5.11.7 Accessibility Requirements

- Sidebar keyboard accessible
- Stats cards keyboard focusable
- Dashboard summary for screen readers

### 5.11.8 Performance Requirements

- Dashboard stats caching
- Lazy load recent orders

## 5.12 Admin Dashboard

### 5.12.1 Responsibility

Platform-wide admin dashboard.

### 5.12.2 Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN DASHBOARD                                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ADMIN TOP BAR                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SIDEBAR (280px)                                         │   │
│  │  - Dashboard                                            │   │
│  │  - Products                                             │   │
│  │  - Orders                                               │   │
│  │  - Customers                                            │   │
│  │  - Categories                                           │   │
│  │  - Collections                                          │   │
│  │  - Brands                                               │   │
│  │  - Coupons                                              │   │
│  │  - CMS                                                  │   │
│  │  - Media                                                │   │
│  │  - Analytics                                            │   │
│  │  - Settings                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MAIN CONTENT                                            │   │
│  │  (dashboard stats, charts, tables)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.12.3 Component Hierarchy

```
AdminDashboard
├── AdminLayout (sidebar + top bar)
├── DashboardStats (4 cards)
├── RevenueChart
├── OrdersChart
└── RecentOrdersTable
```

### 5.12.4 Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| **admin API** | API | Fetch admin stats, data |
| **AdminLayout** | Shared layout | Dashboard layout |
| **Chart components** | Feature components | Data visualization |

### 5.12.5 API Interactions

| Endpoint | Method | Purpose | Cache |
|----------|--------|---------|-------|
| `/api/admin/dashboard` | GET | Fetch dashboard stats | 5 min |
| `/api/admin/analytics/revenue` | GET | Fetch revenue data | 10 min |
| `/api/admin/orders` | GET | Fetch recent orders | None |

### 5.12.6 Responsive Behavior

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| **Sidebar** | Full-width drawer | Collapsible (200px) | Visible (280px) |
| **Stats** | 2 columns | 2 columns | 4 columns |
| **Charts** | Full width | Full width | Full width |

### 5.12.7 Accessibility Requirements

- Sidebar keyboard accessible
- Chart data accessible via table
- Table keyboard navigation

### 5.12.8 Performance Requirements

- Dashboard stats caching
- Chart data lazy load
- Table pagination

---

# 6. Component Composition

## 6.1 Atomic Components

### 6.1.1 Definition

Smallest reusable UI primitives with zero business logic.

### 6.1.2 Location

`src/shared/ui/`

### 6.1.3 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Zero business logic** | Pure presentation only | Reusability |
| **forwardRef on all** | All UI primitives use forwardRef | Composability |
| **displayName set** | All components have displayName | Debugging |
| **Named exports only** | No default exports | Better refactoring |
| **Variant-based styling** | Use variant prop for different styles | Consistency |
| **Loading state support** | Accept isLoading prop | UX consistency |
| **Error state support** | Accept error prop | UX consistency |
| **Responsive by default** | Work on mobile, tablet, desktop | Mobile-first |
| **Accessible by default** | ARIA labels, keyboard nav | WCAG compliance |
| **Dark mode ready** | Use CSS variables | Future-proof |

### 6.1.4 Component Template

```typescript
import { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className, children }, ref
) => {
  return (
    <div
      ref={ref}
      className={cn(
        'base-classes',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </div>
  );
});

Component.displayName = 'Component';

export { Component, type ComponentProps };
```

## 6.2 Composite Components

### 6.2.1 Definition

Components that compose 2-3 atomic components.

### 6.2.2 Location

`src/shared/ui/` (for shared compositions) or `src/features/*/components/` (for feature-specific compositions)

### 6.2.3 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Compose atoms** | Use atomic components | Reusability |
| **No business logic** | Still pure presentation | Reusability |
| **Feature-specific** | Feature compositions in features/ | Co-location |
| **Shared compositions** | Shared compositions in shared/ui/ | Reusability |

## 6.3 Containers

### 6.3.1 Definition

Components that orchestrate data fetching and state management.

### 6.3.2 Location

`src/features/*/components/` (feature containers) or `src/features/*/pages/` (page containers)

### 6.3.3 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Data fetching** | TanStack Query hooks | Server state |
| **State management** | Feature hooks/stores | Client state |
| **Orchestration** | Compose feature components | Separation of concerns |
| **No UI logic** | Delegate to components | Reusability |

## 6.4 Page Sections

### 6.4.1 Definition

Major sections of a page (hero, featured, etc.).

### 6.4.2 Location

`src/features/*/components/` (feature-specific sections)

### 6.4.3 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Self-contained** | Section has its own data fetching | Modularity |
| **Reusable** | Can be used across pages | Reusability |
| **Responsive** | Work on all breakpoints | Mobile-first |

## 6.5 Widgets

### 6.5.1 Definition

Small, reusable UI elements (stat cards, badges, etc.).

### 6.5.2 Location

`src/shared/ui/` (shared widgets) or `src/features/*/components/` (feature widgets)

### 6.5.3 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Small and focused** | Single responsibility | Maintainability |
| **Highly reusable** | Used across features | Reusability |

## 6.6 Forms

### 6.6.1 Definition

Form components with validation and state management.

### 6.6.2 Location

`src/features/*/components/` (feature forms)

### 6.6.3 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **React Hook Form** | Form state management | Type safety, performance |
| **Zod validation** | Schema validation | Shared schemas |
| **Field-level errors** | Error display per field | UX |
| **Form-level errors** | Error display at form level | UX |

## 6.7 Tables

### 6.7.1 Definition

Data tables with sorting, pagination, filtering.

### 6.7.2 Location

`src/shared/ui/Table.tsx` (shared table) or `src/features/*/components/` (feature tables)

### 6.7.3 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Keyboard navigation** | Arrow keys, Enter to select | Accessibility |
| **Sort indicators** | Visual sort indicators | UX |
| **Responsive** | Horizontal scroll on mobile | Mobile-first |
| **Pagination** | Built-in pagination | UX |

## 6.8 Dialogs

### 6.8.1 Definition

Modal dialogs with overlay and focus management.

### 6.8.2 Location

`src/shared/ui/Dialog.tsx`

### 6.8.3 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Focus trap** | Focus trapped in dialog | Accessibility |
| **Escape to close** | ESC key closes dialog | UX |
| **Click outside to close** | Click overlay to close | UX |
| **Focus management** | Focus on open, restore on close | Accessibility |
| **Backdrop blur** | Backdrop blur for premium feel | UX |

## 6.9 Drawers

### 6.9.1 Definition

Slide-in panels from side (mobile drawer, sidebar).

### 6.9.2 Location

`src/shared/ui/Drawer.tsx`

### 6.9.3 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Slide animation** | Smooth slide-in animation | UX |
| **Swipe to close** | Swipe gesture to close (mobile) | UX |
| **Click outside to close** | Click overlay to close | UX |
| **Focus trap** | Focus trapped in drawer | Accessibility |

---

# 7. State Management

## 7.1 Global State

### 7.1.1 Definition

State that needs to be accessed across multiple features.

### 7.1.2 Location

`src/stores/`

### 7.1.3 Global State Catalog

| Store | Purpose | Persistence |
|-------|---------|--------------|
| **auth-store** | Auth state (user, session) | localStorage (session) |
| **ui-store** | UI state (theme, sidebar, modals) | localStorage (theme) |

### 7.1.4 Auth Store

**Location:** `src/stores/auth-store.ts`

**State:**
```typescript
interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

**Actions:**
- `setUser(user)`
- `setSession(session)`
- `clearAuth()`
- `refreshSession()`

**Persistence:** localStorage (session only, not tokens)

**Rules:**
- Never store tokens in store (httpOnly cookies only)
- Session refresh on app load
- Clear auth on logout

### 7.1.5 UI Store

**Location:** `src/stores/ui-store.ts`

**State:**
```typescript
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  modalOpen: string | null;
}
```

**Actions:**
- `setTheme(theme)`
- `toggleSidebar()`
- `setMobileMenuOpen(open)`
- `setModalOpen(modal)`

**Persistence:** localStorage (theme only)

**Rules:**
- Theme persists across sessions
- UI state resets on navigation (except theme)

## 7.2 Feature State

### 7.2.1 Definition

State specific to a feature, not shared globally.

### 7.2.2 Location

`src/features/*/store/` (optional, only if needed)

### 7.2.3 Feature State Catalog

| Feature | Store | Purpose | Persistence |
|---------|-------|---------|--------------|
| **cart** | cart-store | Cart items, totals | localStorage |
| **checkout** | (none) | Checkout form state | React Hook Form |
| **search** | (none) | Search query, filters | URL state |

### 7.2.4 Cart Store

**Location:** `src/features/cart/store/cart-store.ts`

**State:**
```typescript
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}
```

**Actions:**
- `addItem(item)`
- `removeItem(id)`
- `updateQuantity(id, quantity)`
- `clearCart()`

**Persistence:** localStorage

**Rules:**
- Sync with server on add/remove/update
- Optimistic updates
- Reconcile with server on page load

### 7.2.5 Feature State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimize client state** | Only create if needed | Server is source of truth |
| **Sync with server** | Reconcile on page load | Consistency |
| **Optimistic updates** | Update UI immediately, sync in background | UX |
| **URL state for filters** | Use React Router search params | Shareable, bookmarkable |

## 7.3 Page State

### 7.3.1 Definition

State specific to a single page, not shared.

### 7.3.2 Location

Page component (React state or URL state)

### 7.3.3 Page State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **URL state for filters** | Use React Router search params | Shareable |
| **React state for UI** | useState for UI-only state | Simplicity |
| **No global page state** | Don't create store for single-page state | Avoid over-engineering |

## 7.4 Local State

### 7.4.1 Definition

Component-level state (open/close, selected tab, etc.).

### 7.4.2 Location

Component (useState, useReducer)

### 7.4.3 Local State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **useState for simple state** | Boolean, string, number | Simplicity |
| **useReducer for complex state** | Multiple related states | Maintainability |
| **No prop drilling** | Use context or store for deep state | Avoid prop drilling |

## 7.5 Form State

### 7.5.1 Definition

Form input state and validation.

### 7.5.2 Location

React Hook Form (all forms)

### 7.5.3 Form State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **React Hook Form** | All forms use React Hook Form | Type safety, performance |
| **Zod validation** | Schema validation with Zod | Shared schemas |
| **Field-level errors** | Display errors per field | UX |
| **Form-level errors** | Display errors at form level | UX |
| **Validation on blur** | Validate on blur, not on every keystroke | UX |

## 7.6 UI State

### 7.6.1 Definition

Transient UI state (modals open, dropdowns open, etc.).

### 7.6.2 Location

Component state or ui-store

### 7.6.3 UI State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Component state for local UI** | useState for component-only UI | Simplicity |
| **ui-store for global UI** | ui-store for sidebar, theme | Shared state |
| **Reset on navigation** | UI state resets on route change | Clean state |

## 7.7 Cache Boundaries

### 7.7.1 Definition

What data is cached and for how long.

### 7.7.2 Cache Boundaries

| Data | Location | TTL | Invalidation |
|------|----------|-----|--------------|
| **Products** | TanStack Query | 5 min | On product update |
| **Categories** | TanStack Query | 1 hour | On category update |
| **Cart** | TanStack Query | None (session-based) | On cart change |
| **User profile** | TanStack Query | 10 min | On profile update |
| **CMS content** | TanStack Query | 10 min | On CMS publish |

### 7.7.3 Cache Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server state in TanStack Query** | All API data in TanStack Query | Consistency |
| **Appropriate TTL** | Set TTL based on data change frequency | Freshness |
| **Invalidation on write** | Invalidate cache on mutations | Consistency |
| **Stale-while-revalidate** | Use SWR strategy | UX |

## 7.8 API State

### 7.8.1 Definition

Server state fetched from API.

### 7.8.2 Location

TanStack Query (all API data)

### 7.8.3 API State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **TanStack Query for all API data** | No useEffect for data fetching | Consistency |
| **Deduplication** | TanStack Query deduplicates requests | Performance |
| **Background refetch** | Refetch on window focus (optional) | Freshness |
| **Retry on failure** | Retry failed requests | Reliability |
| **Loading states** | Use isLoading, isError from query | UX |

---

# 8. Data Fetching

## 8.1 Loading

### 8.1.1 Loading State Pattern

```typescript
const { data, isLoading, isError } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});

if (isLoading) return <Skeleton />;
if (isError) return <ErrorState />;
return <ProductList products={data} />;
```

### 8.1.2 Loading State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Skeleton for structure** | Use Skeleton component for loading state | Perceived performance |
| **Spinner for actions** | Use LoadingSpinner for button loading | UX |
| **Page-level loading** | Show skeleton at page level | Consistent UX |
| **No global loading spinner** | Don't show global spinner for every fetch | UX |

## 8.2 Error States

### 8.2.1 Error State Pattern

```typescript
if (isError) {
  return (
    <ErrorState
      title="Failed to load products"
      message="Please try again later"
      onRetry={() => refetch()}
    />
  );
}
```

### 8.2.2 Error State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **ErrorState component** | Use ErrorState for errors | Consistent UX |
| **Retry button** | Provide retry button for recoverable errors | UX |
| **Error message** | Show helpful error message | UX |
| **Error boundary** | Wrap pages in ErrorBoundary | Graceful degradation |

## 8.3 Empty States

### 8.3.1 Empty State Pattern

```typescript
if (!data || data.length === 0) {
  return (
    <EmptyState
      title="No products found"
      description="Try adjusting your filters"
      action={<Button onClick={clearFilters}>Clear filters</Button>}
    />
  );
}
```

### 8.3.2 Empty State Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **EmptyState component** | Use EmptyState for empty data | Consistent UX |
| **Helpful message** | Explain why data is empty | UX |
| **Action button** | Provide action to resolve empty state | UX |
| **Illustration** | Optional illustration for visual appeal | UX |

## 8.4 Refresh

### 8.4.1 Refresh Pattern

```typescript
const { refetch } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});

<Button onClick={() => refetch()}>Refresh</Button>
```

### 8.4.2 Refresh Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Refetch function** | Use refetch from useQuery | Manual refresh |
| **Refresh on action** | Refetch after mutations | Freshness |
| **Pull-to-refresh** | Implement pull-to-refresh on mobile | UX |

## 8.5 Pagination

### 8.5.1 Pagination Pattern

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['products', page, limit],
  queryFn: () => fetchProducts(page, limit),
});
```

### 8.5.2 Pagination Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Offset-based pagination** | Use page/limit params | Simplicity |
| **Cursor-based for search** | Use cursor for search (infinite scroll) | Performance |
| **Pagination component** | Use Pagination component | Consistent UX |
| **URL state** | Store page in URL params | Shareable |

## 8.6 Infinite Scroll

### 8.6.1 Infinite Scroll Pattern

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
  queryKey: ['products'],
  queryFn: ({ pageParam = 0 }) => fetchProducts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
```

### 8.6.2 Infinite Scroll Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **useInfiniteQuery** | Use TanStack Query infinite query | Built-in support |
| **Cursor-based** | Use cursor for infinite scroll | Performance |
| **Load more button** | Fallback to load more button | Accessibility |
| **Intersection Observer** | Auto-load on scroll | UX |

## 8.7 Optimistic Updates

### 8.7.1 Optimistic Update Pattern

```typescript
const mutation = useMutation({
  mutationFn: updateCart,
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['cart'] });
    
    // Snapshot previous value
    const previousCart = queryClient.getQueryData(['cart']);
    
    // Optimistically update
    queryClient.setQueryData(['cart'], (old) => [...old, newItem]);
    
    // Return context with previous value
    return { previousCart };
  },
  onError: (err, newItem, context) => {
    // Rollback on error
    queryClient.setQueryData(['cart'], context.previousCart);
  },
  onSettled: () => {
    // Refetch on success/error
    queryClient.invalidateQueries({ queryKey: ['cart'] });
  },
});
```

### 8.7.2 Optimistic Update Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Optimistic for cart** | Optimistically update cart on add/remove | UX |
| **Rollback on error** | Rollback on mutation error | Consistency |
| **Refetch on settle** | Refetch after mutation completes | Consistency |
| **Not for critical data** | Don't optimistically update payments | Safety |

## 8.8 Background Refresh

### 8.8.1 Background Refresh Pattern

```typescript
useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  refetchInterval: 5 * 60 * 1000, // 5 minutes
  refetchIntervalInBackground: false,
});
```

### 8.8.2 Background Refresh Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Refetch interval** | Set appropriate refetch interval | Freshness |
| **Not in background** | Don't refetch when tab is inactive | Performance |
| **Manual refresh** | Provide manual refresh button | UX |

---

# 9. Responsive Implementation

## 9.1 Mobile

### 9.1.1 Mobile Breakpoint

**Range:** 0-639px

### 9.1.2 Mobile Implementation Standards

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Bottom navigation** | 5 tabs (Home, Shop, Search, Cart, Account) | Thumb-friendly |
| **Touch targets** | Minimum 44x44px | Accessibility |
| **Single column** | Most content single column | Screen space |
| **Horizontal scroll** | Horizontal scroll for carousels | Natural gesture |
| **Full-width inputs** | Inputs full width | Touch-friendly |
| **Sticky CTAs** | Sticky bottom CTAs | Always accessible |
| **Drawer menus** | Drawer for secondary navigation | Space efficiency |

## 9.2 Tablet

### 9.2.1 Tablet Breakpoint

**Range:** 640-1023px

### 9.2.2 Tablet Implementation Standards

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Top navigation** | Top navigation (like desktop) | More space |
| **3-column grids** | 3 columns for product grids | Medium screen |
| **Collapsible sidebar** | Collapsible sidebar (200px) | Space efficiency |
| **Bottom nav hidden** | Hide bottom navigation | Desktop pattern |

## 9.3 Desktop

### 9.3.1 Desktop Breakpoint

**Range:** 1024-1279px

### 9.3.2 Desktop Implementation Standards

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Top navigation** | Full top navigation with mega menu | Full experience |
| **4-column grids** | 4 columns for product grids | Full experience |
| **Fixed sidebar** | Fixed sidebar (280px) | Always accessible |
| **Two-column layouts** | Sidebar + content layouts | Full experience |
| **Hover interactions** | Hover for menus, tooltips | Desktop convention |

## 9.4 Large Screens

### 9.4.1 Large Screen Breakpoint

**Range:** 1280px+

### 9.4.2 Large Screen Implementation Standards

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Max-width containers** | Max-width 1280px for content | Readability |
| **Editorial sections** | Max-width 1440px for hero sections | Premium feel |
| **More breathing room** | More spacing between elements | Premium feel |

## 9.5 Orientation Changes

### 9.5.1 Orientation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Landscape support** | Support landscape orientation | Tablets |
| **Safe area handling** | Use env(safe-area-inset-*) | Notched devices |
| **No horizontal scroll** | Prevent horizontal scroll | UX |

## 9.6 Responsive Navigation

### 9.6.1 Navigation Rules

| Breakpoint | Navigation Pattern |
|------------|-------------------|
| **Mobile** | Bottom navigation (5 tabs) |
| **Tablet** | Top navigation (like desktop) |
| **Desktop** | Top navigation with mega menu |

### 9.6.2 Navigation Implementation

```typescript
// Bottom navigation (mobile only)
<BottomNav className="block lg:hidden" />

// Top navigation (tablet+)
<TopNav className="hidden lg:block" />
```

## 9.7 Responsive Tables

### 9.7.1 Table Rules

| Breakpoint | Table Behavior |
|------------|---------------|
| **Mobile** | Horizontal scroll, stacked cards |
| **Tablet** | Horizontal scroll |
| **Desktop** | Full table |

### 9.7.2 Table Implementation

```typescript
// Mobile: stacked cards
<div className="lg:hidden">
  {data.map((item) => (
    <Card key={item.id}>{/* stacked content */}</Card>
  ))}
</div>

// Desktop: table
<table className="hidden lg:table">
  {/* table content */}
</table>
```

## 9.8 Responsive Forms

### 9.8.1 Form Rules

| Breakpoint | Form Behavior |
|------------|--------------|
| **Mobile** | Full-width inputs, stacked |
| **Tablet** | Full-width inputs, stacked |
| **Desktop** | Centered (max-width 640px), stacked |

### 9.8.2 Form Implementation

```typescript
<form className="max-w-screen-sm mx-auto px-4 sm:px-6 lg:px-8">
  {/* form fields */}
</form>
```

---

# 10. Performance

## 10.1 Code Splitting

### 10.1.1 Code Splitting Strategy

| Strategy | Implementation | Rationale |
|----------|----------------|-----------|
| **Route-level splitting** | React.lazy() for route components | Reduce initial bundle |
| **Feature-level splitting** | Lazy load feature components | Load on demand |
| **Component-level splitting** | Lazy load heavy components | Load on demand |

### 10.1.2 Code Splitting Implementation

```typescript
// Route-level splitting
const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const ShopPage = lazy(() => import('@/features/products/pages/ShopPage'));

// Suspense boundary
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/shop" element={<ShopPage />} />
  </Routes>
</Suspense>
```

### 10.1.3 Code Splitting Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lazy load all routes** | React.lazy() for all route components | Reduce initial bundle |
| **Suspense boundary** | Wrap lazy components in Suspense | Loading state |
| **Lazy load heavy components** | Lazy load charts, heavy UI | Load on demand |
| **No lazy load shared components** | Shared components in main bundle | Avoid duplication |

## 10.2 Lazy Loading

### 10.2.1 Lazy Loading Strategy

| Asset | Implementation | Rationale |
|-------|----------------|-----------|
| **Images** | loading="lazy" for below-fold images | Performance |
| **Videos** | loading="lazy" for videos | Performance |
| **Components** | React.lazy() for heavy components | Load on demand |

### 10.2.2 Lazy Loading Implementation

```typescript
// Images
<img src={image.src} alt={image.alt} loading="lazy" />

// Components
const HeavyChart = lazy(() => import('./HeavyChart'));
```

### 10.2.3 Lazy Loading Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Lazy load below-fold images** | loading="lazy" for below-fold | Performance |
| **Priority load above-fold** | No lazy load for above-fold | LCP |
| **Lazy load videos** | loading="lazy" for videos | Performance |

## 10.3 Asset Optimization

### 10.3.1 Asset Optimization Strategy

| Asset | Optimization | Rationale |
|-------|-------------|-----------|
| **Images** | Cloudinary auto-format, auto-quality | Performance |
| **Fonts** | Google Fonts with display=swap | Performance |
| **Icons** | Lucide React (tree-shakeable) | Bundle size |

### 10.3.2 Asset Optimization Implementation

```typescript
// Cloudinary image
<img
  src={`https://res.cloudinary.com/nabome/image/upload/f_auto,q_auto/${image}`}
  alt={image.alt}
/>

// Google Fonts
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Manrope:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

### 10.3.3 Asset Optimization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-format images** | Cloudinary f_auto | Performance |
| **Auto-quality images** | Cloudinary q_auto | Performance |
| **Display swap fonts** | display=swap | Performance |
| **Tree-shake icons** | Import specific icons from Lucide | Bundle size |

## 10.4 Image Optimization

### 10.4.1 Image Optimization Strategy

| Optimization | Implementation | Rationale |
|-------------|----------------|-----------|
| **Responsive images** | srcSet for different screen sizes | Performance |
| **WebP format** | Cloudinary auto WebP | Performance |
| **Lazy loading** | loading="lazy" for below-fold | Performance |
| **Blur placeholder** | Blur-up placeholder for LCP | UX |

### 10.4.2 Image Optimization Implementation

```typescript
<img
  srcSet={`
    ${image.mobile} 400w,
    ${image.tablet} 800w,
    ${image.desktop} 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  src={image.desktop}
  alt={image.alt}
  loading="lazy"
/>
```

### 10.4.3 Image Optimization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Responsive srcSet** | Provide srcSet for responsive images | Performance |
| **WebP format** | Use WebP when supported | Performance |
| **Lazy load below-fold** | loading="lazy" for below-fold images | Performance |
| **Blur placeholder** | Use blur-up for LCP images | UX |

## 10.5 Rendering Optimization

### 10.5.1 Rendering Optimization Strategy

| Optimization | Implementation | Rationale |
|-------------|----------------|-----------|
| **React.memo** | Memoize expensive components | Performance |
| **useMemo** | Memoize expensive calculations | Performance |
| **useCallback** | Memoize event handlers | Performance |
| **Virtualization** | Virtualize long lists | Performance |

### 10.5.2 Rendering Optimization Implementation

```typescript
// React.memo
const ProductCard = React.memo(({ product }) => {
  // component
});

// useMemo
const sortedProducts = useMemo(
  () => products.sort((a, b) => a.price - b.price),
  [products]
);

// useCallback
const handleClick = useCallback(() => {
  onAddToCart(product);
}, [product, onAddToCart]);
```

### 10.5.3 Rendering Optimization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Memoize expensive components** | React.memo for heavy components | Performance |
| **Memoize calculations** | useMemo for expensive calculations | Performance |
| **Memoize callbacks** | useCallback for event handlers | Performance |
| **Virtualize long lists** | Use react-window for long lists | Performance |

## 10.6 Bundle Optimization

### 10.6.1 Bundle Optimization Strategy

| Optimization | Implementation | Rationale |
|-------------|----------------|-----------|
| **Tree shaking** | Import specific components | Bundle size |
| **Minification** | Vite minification | Bundle size |
| **Compression** | Brotli compression | Bundle size |
| **Chunk splitting** | Vite chunk splitting | Bundle size |

### 10.6.2 Bundle Optimization Implementation

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': ['@/shared/ui'],
        },
      },
    },
  },
});
```

### 10.6.3 Bundle Optimization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tree shaking** | Import specific components | Bundle size |
| **Manual chunks** | Split vendor and UI chunks | Bundle size |
| **Minification** | Enable Vite minification | Bundle size |
| **Compression** | Enable Brotli compression | Bundle size |

## 10.7 Prefetch

### 10.7.1 Prefetch Strategy

| Resource | Prefetch Timing | Rationale |
|----------|----------------|-----------|
| **Next route** | Prefetch on hover/click | Perceived performance |
| **Product detail** | Prefetch on product card hover | Perceived performance |
| **Checkout** | Prefetch on cart button click | Perceived performance |

### 10.7.2 Prefetch Implementation

```typescript
// React Router prefetch
<Link to="/shop/product/123" prefetch="intent">
  <ProductCard product={product} />
</Link>
```

### 10.7.3 Prefetch Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Prefetch on hover** | Prefetch likely next routes | Perceived performance |
| **Prefetch on click** | Prefetch on navigation intent | Perceived performance |
| **Don't prefetch all** | Don't prefetch all routes | Bandwidth |

---

# 11. Accessibility

## 11.1 Keyboard Navigation

### 11.1.1 Keyboard Navigation Standards

| Element | Keyboard Support | Implementation |
|---------|-------------------|----------------|
| **Navigation** | Tab, Arrow keys | Semantic HTML |
| **Buttons** | Enter, Space | `<button>` element |
| **Links** | Enter | `<a>` element |
| **Forms** | Tab, Arrow keys | Proper labels |
| **Modals** | Escape to close | Focus trap |
| **Dropdowns** | Arrow keys, Enter, Escape | ARIA attributes |

### 11.1.2 Keyboard Navigation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical tab order | Accessibility |
| **Focus indicators** | Visible focus indicators | Accessibility |
| **Skip links** | Skip to content link | Accessibility |
| **Escape to close** | Escape closes modals/drawers | UX |

## 11.2 Screen Readers

### 11.2.1 Screen Reader Standards

| Element | ARIA Support | Implementation |
|---------|--------------|----------------|
| **Images** | alt text | `alt` attribute |
| **Icons** | aria-hidden or aria-label | Lucide icons |
| **Buttons** | aria-label if no text | `aria-label` attribute |
| **Forms** | aria-describedby for errors | ARIA attributes |
| **Live regions** | aria-live for dynamic content | ARIA attributes |
| **Landmarks** | aria-label for landmarks | ARIA attributes |

### 11.2.2 Screen Reader Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Alt text for images** | Descriptive alt text | Accessibility |
| **ARIA labels for icons** | aria-label for interactive icons | Accessibility |
| **ARIA live regions** | aria-live for dynamic content | Accessibility |
| **Semantic HTML** | Use semantic HTML elements | Accessibility |

## 11.3 Focus Management

### 11.3.1 Focus Management Standards

| Scenario | Focus Behavior | Implementation |
|----------|---------------|----------------|
| **Modal open** | Focus first focusable element | Focus trap |
| **Modal close** | Return focus to trigger | Focus restoration |
| **Drawer open** | Focus first focusable element | Focus trap |
| **Drawer close** | Return focus to trigger | Focus restoration |
| **Navigation** | Focus on route change | Focus management |

### 11.3.2 Focus Management Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Focus trap in modals** | Trap focus in modals | Accessibility |
| **Focus restoration** | Restore focus on close | Accessibility |
| **Skip to content** | Skip link to main content | Accessibility |

## 11.4 Semantic Structure

### 11.4.1 Semantic Structure Standards

| Element | Semantic HTML | Implementation |
|---------|---------------|----------------|
| **Header** | `<header>` | Header element |
| **Navigation** | `<nav>` | Nav element |
| **Main** | `<main>` | Main element |
| **Section** | `<section>` | Section element |
| **Article** | `<article>` | Article element |
| **Footer** | `<footer>` | Footer element |
| **Heading** | `<h1>`-`<h6>` | Heading elements |

### 11.4.2 Semantic Structure Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic HTML** | Use semantic HTML elements | Accessibility |
| **Heading hierarchy** | Proper heading hierarchy | Accessibility |
| **Landmarks** | Use ARIA landmarks | Accessibility |

## 11.5 Color Contrast

### 11.5.1 Color Contrast Standards

| Element | Contrast Ratio | Standard |
|---------|---------------|---------|
| **Text** | 4.5:1 (AA) / 7:1 (AAA) | WCAG AA |
| **Large text** | 3:1 (AA) / 4.5:1 (AAA) | WCAG AA |
| **UI components** | 3:1 (AA) | WCAG AA |
| **Graphics** | 3:1 (AA) | WCAG AA |

### 11.5.2 Color Contrast Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **WCAG AA compliance** | 4.5:1 for text (7:1 for AAA) | Accessibility |
| **Design tokens** | Use design tokens for colors | Consistency |
| **Test contrast** | Test color contrast | Accessibility |

## 11.6 Reduced Motion

### 11.6.1 Reduced Motion Standards

| Animation | Reduced Motion | Implementation |
|----------|---------------|----------------|
| **All animations** | Respect prefers-reduced-motion | CSS media query |
| **Framer Motion** | Respect prefers-reduced-motion | Built-in support |

### 11.6.2 Reduced Motion Implementation

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 11.6.3 Reduced Motion Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Respect prefers-reduced-motion** | Disable animations when requested | Accessibility |
| **Framer Motion support** | Framer Motion respects prefers-reduced-motion | Built-in |

## 11.7 Touch Accessibility

### 11.7.1 Touch Accessibility Standards

| Element | Touch Target Size | Standard |
|---------|-----------------|---------|
| **Buttons** | 44x44px minimum | WCAG |
| **Links** | 44x44px minimum | WCAG |
| **Inputs** | 44x44px minimum | WCAG |
| **Touch targets** | 44x44px minimum | WCAG |

### 11.7.2 Touch Accessibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **44x44px touch targets** | Minimum touch target size | Accessibility |
| **Spacing between targets** | 8px spacing between targets | Accessibility |
| **No zooming** | Allow user zooming | Accessibility |

---

# 12. Error Handling

## 12.1 API Errors

### 12.1.1 API Error Pattern

```typescript
const { isError, error } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
});

if (isError) {
  return (
    <ErrorState
      title="Failed to load products"
      message={error.message}
      onRetry={() => refetch()}
    />
  );
}
```

### 12.1.2 API Error Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **ErrorState component** | Use ErrorState for API errors | Consistent UX |
| **Retry button** | Provide retry for recoverable errors | UX |
| **Error message** | Show helpful error message | UX |
| **Log errors** | Log errors to monitoring | Debugging |

## 12.2 Validation Errors

### 12.2.1 Validation Error Pattern

```typescript
// Zod validation
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// React Hook Form
const { register, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});

// Error display
<Input
  {...register('email')}
  error={errors.email?.message}
/>
```

### 12.2.2 Validation Error Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Zod validation** | Use Zod for validation | Type safety |
| **Field-level errors** | Show errors per field | UX |
| **Form-level errors** | Show errors at form level | UX |
| **Validation on blur** | Validate on blur, not on every keystroke | UX |

## 12.3 Offline Readiness

### 12.3.1 Offline Pattern

```typescript
// Network status
const isOnline = useOnline();

// Service worker for offline support
if (!isOnline) {
  return <OfflineState />;
}
```

### 12.3.2 Offline Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Offline state** | Show offline state when offline | UX |
| **Service worker** | Register service worker for offline support | PWA |
| **Retry on reconnect** | Retry failed requests when online | UX |

## 12.4 Recovery

### 12.4.1 Recovery Pattern

```typescript
// Retry logic
const mutation = useMutation({
  mutationFn: updateCart,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### 12.4.2 Recovery Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Retry on failure** | Retry failed requests | Reliability |
| **Exponential backoff** | Exponential backoff for retries | Server load |
| **Max retry limit** | Limit retry attempts | UX |

## 12.5 Retry

### 12.5.1 Retry Pattern

```typescript
// TanStack Query retry
useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### 12.5.2 Retry Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Retry failed requests** | Retry failed requests | Reliability |
| **Exponential backoff** | Exponential backoff for retries | Server load |
| **Don't retry 4xx** | Don't retry client errors | UX |

## 12.6 Global Error Handling

### 12.6.1 Global Error Boundary

```typescript
// Error boundary at app root
<ErrorBoundary
  FallbackComponent={ErrorPage}
  onError={(error) => logError(error)}
>
  <App />
</ErrorBoundary>
```

### 12.6.2 Global Error Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Error boundary at root** | Wrap app in ErrorBoundary | Graceful degradation |
| **Log all errors** | Log errors to monitoring | Debugging |
| **Show error page** | Show error page on unhandled errors | UX |

---

# 13. Security

## 13.1 Authentication

### 13.1.1 Frontend Authentication Responsibilities

| Responsibility | Implementation |
|---------------|----------------|
| **Session management** | Read httpOnly cookies | No localStorage tokens |
| **CSRF protection** | Send x-csrf-token header | Double-submit cookie |
| **Token refresh** | Refresh access token via API | Background refresh |
| **Logout** | Call logout API, clear cookies | Clear session |

### 13.1.2 Authentication Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No localStorage tokens** | Never store tokens in localStorage | Security (Blueprint mandatory rule 11) |
| **httpOnly cookies** | Use httpOnly cookies for tokens | Security |
| **CSRF token** | Send x-csrf-token header on mutations | Security (Blueprint mandatory rule 12) |
| **Refresh on 401** | Refresh token on 401 response | UX |

## 13.2 Authorization

### 13.2.1 Frontend Authorization Responsibilities

| Responsibility | Implementation |
|---------------|----------------|
| **Role-based UI** | Hide/show UI based on role | UX |
| **Protected routes** | Wrap routes in ProtectedRoute | Security |
| **Admin routes** | Wrap admin routes in AdminRoute | Security |
| **Resource ownership** | Check resource ownership in UI | UX |

### 13.2.2 Authorization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Protected routes** | Wrap protected routes in ProtectedRoute | Security |
| **Admin routes** | Wrap admin routes in AdminRoute | Security |
| **Role-based UI** | Hide/show UI based on role | UX |
| **Server-side enforcement** | Authorization enforced server-side | Security |

## 13.3 Secure Storage

### 13.3.1 Secure Storage Rules

| Data | Storage | Rationale |
|------|--------|-----------|
| **Tokens** | httpOnly cookies | Security |
| **User preferences** | localStorage | UX |
| **Cart data** | localStorage (synced with server) | UX |
| **PII** | Never stored in frontend | Security |

### 13.3.2 Secure Storage Implementation

```typescript
// httpOnly cookie (server-side)
Set-Cookie: session=xxx; HttpOnly; Secure; SameSite=Lax; Path=/

// localStorage (client-side)
localStorage.setItem('theme', 'dark');
```

## 13.4 Session Handling

### 13.4.1 Session Handling Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Session refresh** | Refresh session on 401 | UX |
| **Session timeout** | Redirect to login on session expiry | Security |
| **Logout** | Clear cookies, redirect to login | Security |

## 13.5 Input Validation

### 13.5.1 Input Validation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Client-side validation** | Validate on client for UX | UX |
| **Server-side validation** | Server validates all input | Security |
| **Sanitization** | Sanitize HTML content | Security |
| **No trust client** | Never trust client input | Security |

### 13.5.2 Input Validation Implementation

```typescript
// Zod validation
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// DOMPurify sanitization
const sanitized = DOMPurify.sanitize(userInput);
```

## 13.6 Sensitive Data Display

### 13.6.1 Sensitive Data Display Rules

| Data | Display Rule | Rationale |
|------|-------------|-----------|
| **Full credit card** | Never display full card number | Security |
| **Passwords** | Never display passwords | Security |
| **PII** | Mask PII for non-owners | Privacy |
| **API keys** | Never display API keys | Security |

### 13.6.2 Sensitive Data Implementation

```typescript
// Mask credit card
const maskedCard = `**** **** **** ${card.last4}`;

// Mask email
const maskedEmail = `${email[0]}***@${email.split('@')[1]}`;
```

---

# 14. Testability

## 14.1 Component Testing

### 14.1.1 Component Testing Standards

| Component | Test Coverage | Tools |
|-----------|---------------|-------|
| **Shared UI primitives** | 90%+ | Vitest + React Testing Library |
| **Feature components** | 80%+ | Vitest + React Testing Library |
| **Page components** | 70%+ | Vitest + React Testing Library |

### 14.1.2 Component Testing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Test shared UI primitives** | 90%+ coverage for shared UI | Reusability |
| **Test feature components** | 80%+ coverage for feature components | Quality |
| **Test page components** | 70%+ coverage for pages | Quality |
| **Use React Testing Library** | Test user behavior, not implementation | UX testing |

## 14.2 Integration Testing

### 14.2.1 Integration Testing Standards

| Integration | Test Coverage | Tools |
|------------|---------------|-------|
| **API integration** | Critical paths 100% | Vitest + MSW |
| **Auth flow** | 100% | Vitest + MSW |
| **Checkout flow** | 100% | Vitest + MSW |
| **Cart flow** | 80%+ | Vitest + MSW |

### 14.2.2 Integration Testing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Test critical paths** | 100% coverage for T0 paths | Quality (Blueprint FG-04) |
| **Mock API calls** | Use MSW to mock API calls | Isolation |
| **Test auth flow** | Test login, logout, session refresh | Security |
| **Test checkout flow** | Test end-to-end checkout | Quality |

## 14.3 UI Testing

### 14.3.1 UI Testing Standards

| UI Element | Test Coverage | Tools |
|-----------|---------------|-------|
| **Navigation** | 100% | Playwright |
| **Forms** | 100% | Playwright |
| **Checkout flow** | 100% | Playwright |
| **Admin dashboard** | 80%+ | Playwright |

### 14.3.2 UI Testing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Test navigation** | 100% coverage for navigation | Quality |
| **Test forms** | 100% coverage for forms | Quality |
| **Test checkout** | 100% coverage for checkout | Quality |
| **Use Playwright** | Playwright for E2E testing | Cross-browser |

## 14.4 Accessibility Testing

### 14.4.1 Accessibility Testing Standards

| Accessibility | Test Coverage | Tools |
|---------------|---------------|-------|
| **Keyboard navigation** | 100% | Playwright + axe-core |
| **Screen reader** | 100% | Playwright + screen reader |
| **Color contrast** | 100% | axe-core |
| **Semantic HTML** | 100% | axe-core |

### 14.4.2 Accessibility Testing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Test keyboard navigation** | 100% coverage for keyboard nav | Accessibility |
| **Test screen reader** | 100% coverage for screen reader | Accessibility |
| **Test color contrast** | 100% coverage for contrast | Accessibility |
| **Use axe-core** | axe-core for automated testing | Automation |

## 14.5 Visual Regression

### 14.5.1 Visual Regression Standards

| Visual Element | Test Coverage | Tools |
|----------------|---------------|-------|
| **Shared UI primitives** | 100% | Playwright |
| **Critical pages** | 100% | Playwright |
| **Responsive layouts** | 100% | Playwright |

### 14.5.2 Visual Regression Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Test shared UI** | 100% coverage for shared UI | Consistency |
| **Test critical pages** | 100% coverage for critical pages | Quality |
| **Test responsive layouts** | 100% coverage for responsive | Quality |

---

# Conclusion

This Frontend Application Implementation Specification defines the complete frontend implementation standards for the Nabome Commerce OS. All frontend AI agents must follow this specification when implementing the frontend application.

## Key Principles

1. **Mobile-first** - Design for thumb, enhance for desktop
2. **Enterprise-grade** - Built for scale and maintainability
3. **Premium UX** - Apple-level micro-interactions and design
4. **Beginner-friendly** - First-time user succeeds immediately
5. **Highly reusable** - No duplicated UI logic
6. **Accessible by default** - WCAG 2.2 AA minimum
7. **High performance** - Code splitting, lazy loading, optimization
8. **Future-proof** - Ready for dark mode, i18n, PWA

## Binding Authority

This specification is derived from and binds to:
- MASTER_ARCHITECTURE_BLUEPRINT.md (v1.0)
- BACKEND_SERVICE_SPECIFICATION.md (v1.0)
- REST_API_SPECIFICATION.md (v1.0)
- DESIGN_SYSTEM_ARCHITECTURE.md (v1.0)
- COMPONENT_LIBRARY_ARCHITECTURE.md (v1.0)
- UX_ARCHITECTURE.md (v1.0)
- NAVIGATION_ARCHITECTURE.md (v1.0)
- RESPONSIVE_LAYOUT_ARCHITECTURE.md (v1.0)
- FOLDER_ARCHITECTURE.md (v1.0)
- TECH_STACK.md (v1.0)

All canonical resolutions from the Blueprint Appendix B are binding.

## Implementation Readiness

This specification is ready for frontend implementation agents to begin implementing the Nabome Commerce OS frontend application following these standards.

---

**Document Version:** 2.0
**Last Updated:** August 04, 2026
**Next Review:** September 04, 2026
**Author:** Nabome Frontend Architecture Team
