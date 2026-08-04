# নবME (Nabome) — Shop Owner Dashboard & Workspace Architecture Standard

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for the Shop Owner Dashboard, operational workspace, productivity workflows, permissions, management interfaces, and user experience standards
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), RESPONSIVE_LAYOUT_ARCHITECTURE.md (v1.0), COMPONENT_LIBRARY_ARCHITECTURE.md (v1.0), UX_ARCHITECTURE.md (v1.0), NAVIGATION_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0), FINANCE_ENGINE_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), PRODUCT_ENGINE_ARCHITECTURE.md (v1.0), VARIANT_INVENTORY_ENGINE_ARCHITECTURE.md (v1.0), ADMIN_DASHBOARD_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Workspace Foundation](#1-workspace-foundation)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Module Architecture](#3-module-architecture)
4. [Product Management](#4-product-management)
5. [Order Management](#5-order-management)
6. [Finance & Settlements](#6-finance--settlements)
7. [Communication](#7-communication)
8. [Permissions](#8-permissions)
9. [Search](#9-search)
10. [Productivity](#10-productivity)
11. [Responsive UX](#11-responsive-ux)
12. [Performance](#12-performance)
13. [Security](#13-security)
14. [Accessibility](#14-accessibility)
15. [Future Readiness](#15-future-readiness)
16. [Mandatory Rules for AI Agents](#16-mandatory-rules-for-ai-agents)

---

## 1. Workspace Foundation

### 1.1 What

The complete architectural foundation that governs how the Shop Owner Dashboard is organized, how information is prioritized, how navigation works, and how productivity is maximized for suppliers operating on the Nabome platform.

### 1.2 Why

- **Business operations:** Shop Owners run their entire business from this workspace — every design decision must minimize time-to-task.
- **Non-technical users:** Many Shop Owners are not tech-savvy — the workspace must be intuitive without documentation.
- **Enterprise-grade reliability:** Errors here directly impact revenue — the workspace must be bulletproof.
- **Isolation:** Shop Owners must never see other Shop Owners, customers must never access this workspace.
- **Mobile-first:** 70%+ of Shop Owner activity occurs on mobile devices — mobile is the primary workspace.

### 1.3 Where

Every screen, component, and interaction within the `/shop` route space — all files under `src/features/shop/`.

### 1.4 Workspace Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Business command center** | Shop Owners orchestrate their entire business from this workspace | One place for everything |
| **Information density over decoration** | Every pixel serves a purpose — data, action, or navigation | Enterprise productivity |
| **Progressive disclosure** | Show summary first, details on demand | Prevent cognitive overload for non-technical users |
| **Mobile-first workspace** | Design for thumb, enhance for desktop | 70%+ traffic is mobile |
| **Minimal learning curve** | First-time Shop Owner succeeds immediately | No onboarding required |
| **Audit by default** | Every Shop Owner action logged and traceable | Security and compliance |
| **Module isolation** | Each management module is an independent feature | Prevents coupling, enables parallel development |
| **Real-time awareness** | Dashboard reflects current business state | Operational awareness |
| **Undo over confirm** | Allow recovery instead of blocking confirmations | Speed + safety for non-technical users |
| **One primary action per screen** | Clear CTAs, no competing primaries | Focus and clarity |

### 1.5 Workspace DNA

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHOP OWNER DASHBOARD DNA                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    SHOPIFY                                 │   │
│  │  • Clean, sidebar-based admin layout                      │   │
│  │  • Data-dense tables with inline actions                  │   │
│  │  • Quick actions and bulk operations                      │   │
│  │  • Mobile shop owner app                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          +                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    LINEAR                                  │   │
│  │  • Keyboard-first navigation                              │   │
│  │  • Command palette for power users                        │   │
│  │  • Minimal, focused interface                             │   │
│  │  • Real-time updates                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          +                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    NABOME                                  │   │
│  │  • Premium aesthetic carried into workspace                │   │
│  │  • Mobile-first shop management                           │   │
│  │  • Enterprise-grade with beginner friendliness            │   │
│  │  • Consistent with storefront design language             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Workspace Organization

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHOP OWNER WORKSPACE ORGANIZATION              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    LAYER 1: SHELL                          │   │
│  │  Sidebar | Top Bar | Main Content Area                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          |                                       │
│                          v                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    LAYER 2: MODULES                        │   │
│  │  Dashboard | Products | Orders | Finance | Settings |     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          |                                       │
│                          v                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    LAYER 3: WORKSPACES                     │   │
│  │  Tables | Forms | Detail Views | Charts | Bulk Actions    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          |                                       │
│                          v                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    LAYER 4: OVERLAYS                       │   │
│  │  Dialogs | Side Panels | Context Menus | Toasts | modals  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.7 Information Hierarchy

| Level | Purpose | Examples |
|-------|---------|----------|
| **Level 1: At-a-glance** | Current business state in one look | KPI cards, status indicators, notification badges, pending order count |
| **Level 2: Summary** | Trends and patterns | Revenue charts, order status distribution, sales by category |
| **Level 3: Detail** | Deep investigation | Full order tables, product variants, settlement breakdowns |
| **Level 4: Action** | Execute operations | Product forms, order status updates, bulk price changes |

### 1.8 Productivity Principles

| Principle | Implementation | Rationale |
|-----------|---------------|-----------|
| **3-click rule** | Any shop action reachable in 3 clicks max | Efficiency |
| **One primary action per page** | Clear CTAs, no competing primaries | Focus for non-technical users |
| **Context preservation** | Sidebar state, filter state, scroll position preserved | Workflow continuity |
| **Quick create** | Floating action button for common creates (product, draft) | Speed |
| **Bulk operations** | Select multiple products/orders, act once | Scale |
| **Keyboard shortcuts** | Cmd+K for search, shortcuts for common actions | Power users |
| **Saved views** | Persistent filter/sort configurations | Repeated tasks |
| **Undo over confirm** | Allow recovery instead of blocking confirmations | Speed + safety |
| **Auto-save drafts** | Product drafts auto-saved every 30 seconds | Data protection |
| **Smart defaults** | Pre-fill forms with sensible defaults | Speed for beginners |

### 1.9 Navigation Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHOP OWNER NAVIGATION HIERARCHY                │
│                                                                  │
│  Level 1: SIDEBAR (Persistent)                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Dashboard | Products | Orders | Finance | Messages | ... │   │
│  │  Always visible, always accessible                        │   │
│  │  Collapsible on desktop, drawer on mobile                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          |                                       │
│                          v                                       │
│  Level 2: MODULE TABS (Contextual)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Products: All | Active | Draft | Archived                │   │
│  │  Orders: All | Pending | Processing | Shipped | Delivered  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          |                                       │
│                          v                                       │
│  Level 3: BREADCRUMBS (Orientation)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Products > Edit: "Cotton Tee"                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          |                                       │
│                          v                                       │
│  Level 4: ACTION MENU (Contextual)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Table row actions: Edit | Duplicate | Archive | Delete    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.10 Dashboard Responsiveness

| Breakpoint | Sidebar | Top Bar | Content | Navigation |
|------------|---------|---------|---------|------------|
| **Mobile** (< 640px) | Hidden, hamburger trigger | Compact (search, notifications, avatar) | Full width, stacked | Bottom actions bar |
| **Tablet** (640-1023px) | Collapsed (icons only, 64px) | Standard height | Flex layout | Sidebar icons + labels |
| **Desktop** (1024-1279px) | Expanded (280px) | Full height | Flex layout | Full sidebar with labels |
| **Wide** (1280px+) | Expanded (280px) | Full height | Flex layout | Full sidebar with labels |

### 1.11 Module Isolation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Feature-first** | Each shop module in `src/features/shop/{module}/` | Co-location per ARCHITECTURE.md |
| **No cross-module imports** | Modules cannot import from each other | Prevents coupling |
| **Shared via lib/** | Common shop utilities in `src/features/shop/shared/` | DRY without coupling |
| **Independent data fetching** | Each module owns its API calls | Independent caching |
| **Independent routing** | Each module defines its own routes | Independent loading |
| **Shared components only** | Use `src/shared/ui/` for UI primitives | Design system consistency |

### 1.12 Critical Isolation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Customer isolation** | Customers must never access `/shop/*` routes | Separate workspaces |
| **Shop Owner isolation** | Shop Owners must never see other Shop Owners' data | Privacy and security |
| **Data scoping** | All API queries scoped to authenticated Shop Owner's shop | Multi-tenant isolation |
| **No cross-shop visibility** | Shop Owner A cannot see Shop Owner B's products, orders, or earnings | Business confidentiality |
| **Admin independence** | Shop Owner Dashboard is independent from Admin Dashboard | Separate concerns |

### 1.13 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Monolithic shop component | Unmaintainable, untestable | Feature-first modules |
| Cross-module state sharing | Tight coupling | Independent module state |
| Duplicated management interfaces | Inconsistent UX | Unified management patterns |
| Hardcoded workflows | Cannot adapt to business changes | Configurable workflows |
| Desktop-only workspace | 70%+ mobile traffic for shop owners too | Mobile-first workspace |
| No audit logging | Security blind spots | Every action auditable |
| Overloaded pages | Cognitive overload | Progressive disclosure |
| Showing other shops' data | Privacy violation | Strict data scoping |

---

## 2. Dashboard Overview

### 2.1 What

The overview dashboard that provides at-a-glance visibility into shop health, business metrics, and operational status — the first screen Shop Owners see when entering the dashboard.

### 2.2 Why

- **Operational awareness:** Shop Owners understand current business state immediately
- **Priority identification:** Problems and opportunities surface instantly
- **Action orientation:** Quick actions reduce time-to-response
- **Context setting:** Sets the stage for focused work in specific modules

### 2.3 Where

`/shop` — the root shop route. `src/features/shop/dashboard/`.

### 2.4 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR |  TOP BAR: Shop Dashboard    🔔 3  👤 Shop Owner      │
│          |───────────────────────────────────────────────────────│
│  Dash    |                                                       │
│  Prods   |  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  Orders  |  │Revenue│ │Orders│ │Prods │ │Pend  │               │
│  Finance |  │₹12.5L │ │  89  │ │  45  │ │  7   │               │
│  Messgs  |  │↑12%  │ │↑8%   │ │↑3%   │ │↓2    │               │
│  Setting |  └──────┘ └──────┘ └──────┘ └──────┘               │
│          |                                                       │
│          |  ┌─────────────────────┐ ┌─────────────────────┐     │
│          |  │   Revenue Trend     │ │  Orders by Status   │     │
│          |  │   (line chart)      │ │  (donut chart)      │     │
│          |  └─────────────────────┘ └─────────────────────┘     │
│          |                                                       │
│          |  ┌─────────────────────┐ ┌─────────────────────┐     │
│          |  │   Recent Orders     │ │  Inventory Alerts   │     │
│          |  │   (table, 5 rows)   │  │  (list, 5 items)   │     │
│          |  └─────────────────────┘ └─────────────────────┘     │
│          |                                                       │
│          |  ┌───────────────────────────────────────────────┐   │
│          |  │   Quick Actions: + Product | + Draft | Export  │   │
│          |  └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Today's Summary

| Metric | Format | Trend | Comparison | Icon |
|--------|--------|-------|------------|------|
| **Today's Revenue** | ₹XX,XXX | Percentage change | vs. yesterday | IndianRupee |
| **Today's Orders** | XX | Percentage change | vs. yesterday | ShoppingCart |
| **Pending Orders** | XX | Absolute count | — | Clock |
| **Low Stock Alerts** | XX | Absolute count | — | AlertTriangle |

**Today's Summary Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Grid layout** | 2 columns mobile, 4 columns desktop | Responsive |
| **Value prominence** | Large, bold number (text-2xl font-semibold) | Quick scan |
| **Trend indicator** | Green arrow up / Red arrow down + percentage | Trend awareness |
| **Comparison period** | "vs. yesterday" label below | Context |
| **Click to detail** | Click navigates to relevant module | Quick drill-down |
| **Loading state** | Skeleton matching card shape | Perceived performance |

### 2.6 Pending Orders

| Order | Customer | Amount | Time | Action |
|-------|----------|--------|------|--------|
| #NAB-20260803-0001 | John D. | ₹1,234 | 2h ago | View |
| #NAB-20260803-0002 | Sarah M. | ₹2,567 | 1h ago | View |
| #NAB-20260803-0003 | Mike R. | ₹890 | 30m ago | View |

**Pending Orders Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max items** | 5 most recent pending | Scannable |
| **Relative time** | "2 minutes ago", "1 hour ago" | Quick context |
| **Click to detail** | Click navigates to order detail | Quick drill-down |
| **Badge count** | Show total pending count in sidebar | At-a-glance |
| **Empty state** | "No pending orders" with checkmark icon | Positive feedback |
| **Auto-refresh** | Update every 30 seconds | Real-time awareness |

### 2.7 Sales Summary

| Chart | Type | Data | Purpose |
|-------|------|------|---------|
| **Revenue Trend** | Line chart | Daily revenue over 7/30 days | Revenue trajectory |
| **Orders by Status** | Donut chart | Pending, Processing, Shipped, Delivered | Operational health |
| **Top Products** | Horizontal bar chart | Top 5 products by revenue | Product performance |
| **Sales by Category** | Pie chart | Revenue distribution by category | Category insights |

**Sales Summary Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Responsive** | 1 column mobile, 2 columns desktop | Layout adaptation |
| **Loading state** | Chart skeleton during data fetch | Perceived performance |
| **Empty state** | "No sales data yet" with helpful message | Guidance |
| **Tooltip** | Show exact value on hover/tap | Precision |
| **Time range** | Today, 7 days, 30 days, 90 days, Custom | Flexibility |
| **Export** | Chart export as image option (desktop) | Reporting |

### 2.8 Earnings Summary

| Metric | Format | Description |
|--------|--------|-------------|
| **Total Earnings** | ₹XX,XXX | Gross earnings from all orders |
| **Platform Commission** | ₹X,XXX | Nabome commission deducted |
| **Net Earnings** | ₹XX,XXX | Amount payable after commission |
| **Pending Settlement** | ₹X,XXX | Awaiting settlement processing |
| **Last Settlement** | ₹X,XXX (date) | Most recent settlement amount |

**Earnings Summary Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Commission visibility** | Always show commission amount | Transparency |
| **Net earnings prominence** | Net earnings is the primary number | Shop Owner cares about take-home |
| **Settlement countdown** | Show days until next settlement | Cash flow planning |
| **Click to finance** | Click navigates to finance module | Quick drill-down |
| **Currency formatting** | Indian Rupee (₹) with comma formatting | Local convention |

### 2.9 Inventory Alerts

| Alert | Product | Variant | Current Stock | Threshold | Action |
|-------|---------|---------|---------------|-----------|--------|
| Low Stock | Cotton Tee | M, Blue | 3 | 10 | Restock |
| Out of Stock | Silk Dress | S, Red | 0 | 5 | Restock |
| Low Stock | Denim Jeans | L, Black | 2 | 8 | Restock |

**Inventory Alerts Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Priority color** | Red for out-of-stock, amber for low stock | Severity |
| **Max visible** | 5 most critical, "View all" for more | Don't overwhelm |
| **Click to product** | Click navigates to product inventory | Quick resolution |
| **Auto-refresh** | Update every 5 minutes | Operational awareness |
| **Threshold display** | Show both current and threshold values | Context |
| **Bulk restock** | Checkbox to select multiple for bulk restock | Efficiency |

### 2.10 Notifications

| Notification Type | Source | Persistence | Action |
|-------------------|--------|-------------|--------|
| **New order** | Webhook | 7 days | View order |
| **Payment received** | Webhook | 7 days | View order |
| **Order shipped** | Webhook | 7 days | View order |
| **Return requested** | Webhook | Until resolved | Handle return |
| **Low stock** | Cron job | Until restocked | View product |
| **Commission payout** | Cron job | 30 days | View settlement |
| **System alert** | Monitoring | Until resolved | View status |

**Notification Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Bell icon** | Top bar, right side | Standard pattern |
| **Badge count** | Unread count on bell icon | At-a-glance |
| **Dropdown panel** | Click bell to see notifications | Quick view |
| **Mark as read** | Click notification marks as read | Workflow |
| **Mark all read** | "Mark all as read" button | Bulk action |
| **Filter** | Filter by type, date | Focused view |
| **Empty state** | "No new notifications" | Feedback |

### 2.11 Quick Actions

| Action | Icon | Permission | Shortcut |
|--------|------|------------|----------|
| **Create Product** | Plus | `shop:product:create` | `Cmd+Shift+P` |
| **Create Draft** | FileText | `shop:product:create` | `Cmd+Shift+D` |
| **View Orders** | ShoppingCart | `shop:order:read` | `Cmd+Shift+O` |
| **View Finance** | IndianRupee | `shop:finance:read` | `Cmd+Shift+F` |
| **Export Data** | Download | `shop:export:create` | `Cmd+Shift+E` |

**Quick Actions Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Top-right of dashboard, below top bar | Discoverable |
| **Mobile** | Floating action button (bottom-right) | Thumb-friendly |
| **Permission-gated** | Only show actions user can perform | Security |
| **Keyboard shortcut** | Display shortcut next to action | Power users |
| **Icon + label** | Always show both | Clarity |
| **Max 5 actions** | Most common actions only | Focus |

### 2.12 Recent Activity

| Event | Icon | Description | Timestamp |
|-------|------|-------------|-----------|
| **New order** | ShoppingCart | "Order #NAB-20260803-0001 placed" | Relative time |
| **Payment received** | IndianRupee | "Payment of ₹1,234 received" | Relative time |
| **Product updated** | Package | "Cotton Tee stock updated to 15" | Relative time |
| **Settlement processed** | CreditCard | "Settlement of ₹5,678 processed" | Relative time |

**Recent Activity Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max items** | 10 most recent | Scannable |
| **Relative time** | "2 minutes ago", "1 hour ago" | Quick context |
| **Click to detail** | Click navigates to relevant entity | Quick drill-down |
| **Filter by type** | Filter by event category | Focused view |
| **Auto-refresh** | Update every 30 seconds | Real-time awareness |
| **Empty state** | "No recent activity" | Guidance |

### 2.13 Performance Snapshot

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| **Average Order Value** | ₹1,456 | ₹1,500 | Amber |
| **Fulfillment Rate** | 94% | 95% | Amber |
| **Return Rate** | 3.2% | < 5% | Green |
| **Average Shipping Time** | 3.2 days | < 3 days | Amber |

**Performance Snapshot Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Traffic light** | Green/Amber/Red based on target | Quick assessment |
| **Comparison** | Always show target for context | Goal awareness |
| **Click to detail** | Click navigates to analytics | Deep investigation |
| **Time range** | Configurable comparison period | Flexibility |
| **Mobile** | Compact horizontal layout | Space efficiency |

---

## 3. Module Architecture

### 3.1 What

The complete module architecture for all Shop Owner Dashboard modules — how modules are organized in the sidebar, how module routes are defined, how module states are managed, and how navigation between modules works.

### 3.2 Why

- **Discoverability:** Shop Owners find modules instantly
- **Orientation:** Shop Owners always know where they are
- **Efficiency:** Quick switching between modules
- **Scalability:** New modules fit the existing navigation pattern
- **Consistency:** Same navigation behavior across all modules

### 3.3 Where

`src/features/shop/layout/ShopSidebar.tsx`, `src/app/routes.tsx`.

### 3.4 Module Catalog

| Module | Route | Icon | Sidebar Group | Badge |
|--------|-------|------|---------------|-------|
| **Dashboard** | `/shop` | LayoutDashboard | — | — |
| **Shop Details** | `/shop/details` | Store | Shop | — |
| **Products** | `/shop/products` | Package | Catalog | Product count |
| **Product Drafts** | `/shop/products/drafts` | FileText | Catalog | Draft count |
| **Inventory** | `/shop/inventory` | Package | Catalog | Low stock count |
| **Orders** | `/shop/orders` | ShoppingCart | Operations | Pending count |
| **Shipping** | `/shop/shipping` | Truck | Operations | — |
| **Returns** | `/shop/returns` | RotateCcw | Operations | Pending count |
| **Refunds** | `/shop/refunds` | AlertCircle | Operations | Pending count |
| **Finance** | `/shop/finance` | IndianRupee | Finance | — |
| **Settlements** | `/shop/settlements` | CreditCard | Finance | Pending count |
| **Exports** | `/shop/exports` | Download | Tools | — |
| **Messages** | `/shop/messages` | MessageSquare | Communication | Unread count |
| **Permissions** | `/shop/permissions` | Shield | Settings | — |
| **Settings** | `/shop/settings` | Settings | Settings | — |

### 3.5 Sidebar Groupings

```
┌──────────────────────────────────────────┐
│  NABOME SHOP                              │
│  ───────────────────────────────────────  │
│                                           │
│  ◉ Dashboard                             │
│                                           │
│  SHOP                                     │
│  ├── 🏪 Shop Details                     │
│                                           │
│  CATALOG                                  │
│  ├── 📦 Products                         │
│  ├── 📝 Drafts              (3)          │
│  └── 📊 Inventory          (2 alerts)    │
│                                           │
│  OPERATIONS                               │
│  ├── 🛒 Orders             (7 pending)   │
│  ├── 🚚 Shipping                         │
│  ├── ↩️ Returns            (2 pending)   │
│  └── 💸 Refunds            (1 pending)   │
│                                           │
│  FINANCE                                  │
│  ├── 💵 Finance                          │
│  └── 💳 Settlements                      │
│                                           │
│  COMMUNICATION                            │
│  └── 💬 Messages           (5 unread)    │
│                                           │
│  TOOLS                                    │
│  └── 📥 Exports                          │
│                                           │
│  SETTINGS                                 │
│  ├── 🔐 Permissions                      │
│  └── ⚙️ Settings                        │
│                                           │
│  ───────────────────────────────────────  │
│  Shop: My Fashion Store                   │
└──────────────────────────────────────────┘
```

### 3.6 Sidebar Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Width** | 280px expanded, 64px collapsed | Consistent with RESPONSIVE_LAYOUT_ARCHITECTURE.md |
| **Position** | Fixed left | Always accessible |
| **Height** | Full viewport height | Complete navigation |
| **Scrollable** | `overflow-y: auto` | Many nav items |
| **Active state** | `brand-500` background tint + text color | Clear orientation |
| **Parent active** | Highlight parent when child is active | Hierarchy awareness |
| **Badge counts** | Real-time counts for pending items | Operational awareness |
| **Group labels** | Uppercase, letter-spaced, muted text | Section separation |
| **Collapse toggle** | Button in top bar | Screen real estate |
| **Mobile** | Drawer overlay (not inline) | Space efficiency |
| **Z-index** | `z-modal` (200) on mobile | Above content |
| **Logo** | Top of sidebar, links to dashboard | Brand anchor |
| **Shop info** | Bottom of sidebar: shop name, plan | Identity awareness |

### 3.7 Module Route Structure

```
/shop                              → Dashboard overview
/shop/details                      → Shop details
/shop/products                     → Product list
/shop/products/create              → Create product
/shop/products/drafts              → Product drafts
/shop/products/:id                 → Product detail
/shop/products/:id/edit            → Edit product
/shop/inventory                    → Inventory management
/shop/inventory/:productId         → Product inventory
/shop/orders                       → Order list
/shop/orders/:id                   → Order detail
/shop/shipping                     → Shipping management
/shop/returns                      → Return requests
/shop/refunds                      → Refund requests
/shop/finance                      → Finance overview
/shop/finance/earnings             → Earnings details
/shop/settlements                  → Settlement history
/shop/exports                      → Export management
/shop/messages                     → Message center
/shop/permissions                  → Permission management
/shop/settings                     → Settings (tabbed)
/shop/settings/general             → General settings
/shop/settings/profile             → Profile settings
/shop/settings/notifications       → Notification settings
```

### 3.8 Route Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Nested routes** | Use React Router nested routes | Layout preservation |
| **Lazy loading** | `React.lazy()` for each module | Performance |
| **Error boundaries** | Each module wrapped in ErrorBoundary | Resilience |
| **Loading states** | Skeleton loaders during route transitions | Perceived performance |
| **Back navigation** | Breadcrumbs + browser back | Orientation |
| **Deep linking** | Every shop page has a direct URL | Shareability |
| **404 handling** | "Page not found" with link to dashboard | Recovery |
| **Auth guard** | All `/shop/*` routes require `shop_owner` role | Security |
| **Data scoping** | All route data scoped to authenticated shop | Multi-tenant isolation |

---

## 4. Product Management

### 4.1 What

The complete architecture for how Shop Owners create, edit, duplicate, publish, archive, delete, and manage their products — including media management, inventory updates, bulk operations, and draft workflows.

### 4.2 Why

- **Revenue:** Products are the primary revenue driver
- **Efficiency:** Product management must be fast and intuitive
- **Quality:** Every product must meet standards before publishing
- **Scale:** Bulk operations handle hundreds of products
- **Mobile:** Product management must work perfectly on mobile

### 4.3 Where

Shop Owner dashboard product management, API handlers in `api/_handlers/shop/products/`, frontend components in `src/features/shop/products/`.

### 4.4 Create Product

#### 4.4.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREATE PRODUCT WORKFLOW                        │
│                                                                  │
│  1. Shop Owner clicks "Create Product"                           │
│     → Empty product form loads                                   │
│                                                                  │
│  2. Shop Owner fills required fields                             │
│     → name, categoryId, basePrice                               │
│                                                                  │
│  3. Shop Owner saves as draft                                    │
│     → Product created with status = draft                        │
│     → Auto-generated slug from name                              │
│     → Audit log: PRODUCT_CREATED                                 │
│                                                                  │
│  4. Shop Owner optionally adds                                   │
│     → Description, images, variants, SEO, tags                   │
│                                                                  │
│  5. Shop Owner publishes (optional)                              │
│     → Validation runs (full publish validation)                  │
│     → Product status → published                                 │
│     → Product indexed in search                                  │
│     → Product cached                                             │
│     → Audit log: PRODUCT_PUBLISHED                               │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.4.2 Create Product Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimal required fields** | Only name, category, price required | Fast creation |
| **Auto-generate slug** | From name, shop owner can override | URL consistency |
| **Default to draft** | Never auto-publish | Quality control |
| **Auto-generate SKU** | If no SKU provided, generate from product name + variant | Inventory tracking |
| **Validate category exists** | Check category isActive before linking | Data integrity |
| **Log creation** | Audit log with shop owner ID and timestamp | Accountability |
| **Shop scoping** | Product created under authenticated shop | Multi-tenant isolation |
| **Image upload** | Drag-and-drop, mobile camera capture | Ease of use |
| **Variant builder** | Dynamic attribute selection, auto-generate combinations | Efficiency |

### 4.5 Edit Product

#### 4.5.1 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EDIT PRODUCT WORKFLOW                          │
│                                                                  │
│  1. Shop Owner opens product for editing                         │
│     → Product form loads with current data                       │
│                                                                  │
│  2. Shop Owner modifies fields                                   │
│     → Real-time validation on each field                         │
│     → Unsaved changes indicator                                  │
│                                                                  │
│  3. Shop Owner saves changes                                     │
│     → Validation runs on changed fields only                     │
│     → PATCH request to API                                       │
│     → Audit log: PRODUCT_UPDATED with field changes              │
│                                                                  │
│  4. If publishing required fields changed                        │
│     → Re-validate publish requirements                           │
│     → If product was published, re-index in search               │
│     → If slug changed, 301 redirect from old slug                │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.5.2 Edit Product Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Partial updates only** | Only send changed fields | Bandwidth, audit clarity |
| **Validate on save** | Run Zod schema on changed fields | Data integrity |
| **Audit field changes** | Log old value to new value for each change | Accountability |
| **Slug regeneration** | If name changes, optionally regenerate slug | URL consistency |
| **Re-index on publish** | If published product edited, update search index | Fresh search results |
| **Re-cache on publish** | If published product edited, invalidate cache | Fresh cached data |
| **301 redirect** | If slug changed, create redirect from old to new | SEO preservation |
| **No status change via edit** | Status changes require explicit publish/unpublish action | Intentional transitions |
| **Auto-save** | Draft auto-saved every 30 seconds | Data protection |

### 4.6 Duplicate Product

#### 4.6.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Copy metadata only** | Name, description, category, brand, gender, tags | Start fresh with structure |
| **New slug** | Regenerate from (copy of) name | URL uniqueness |
| **Draft status** | Always start as draft | Quality control |
| **No variants** | Variants are SKU-specific, don't duplicate | Fresh inventory |
| **No images** | Images are product-specific | Avoid licensing issues |
| **No collections** | Collections are curated per product | Manual assignment |
| **No reviews** | Reviews are product-specific | Authenticity |
| **No SEO overrides** | SEO is product-specific | Fresh optimization |
| **Audit both** | Log original product ID and new product ID | Traceability |

### 4.7 Draft Workflow

#### 4.7.1 Draft Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimal validation** | Only name required for draft | Flexible workflow |
| **No publish validation** | Don't require images, variants for draft | Save partial progress |
| **Auto-save** | Auto-save every 30 seconds | Prevent data loss |
| **Completeness score** | Show percentage of required fields completed | Guide completion |
| **Draft expiration** | Drafts older than 90 days flagged for review | Clean dashboard |
| **No public visibility** | Drafts never visible on storefront | Quality control |
| **Draft list** | Dedicated drafts page with completeness indicators | Easy management |

### 4.8 Publish

#### 4.8.1 Publish Requirements

| Field | Required for Publish | Validation |
|-------|---------------------|------------|
| `name` | Yes | 1-300 chars, non-empty |
| `categoryId` | Yes | Valid UUID, category isActive |
| `basePrice` | Yes | Positive number |
| `images` | Yes | At least 1 image |
| `variants` | Yes | At least 1 variant with SKU and stock |
| `description` | Recommended | Helps conversion |
| `seoTitle` | Recommended | SEO optimization |

#### 4.8.2 Publish Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Explicit action** | Shop Owner clicks "Publish" button | Intentional |
| **Validation required** | All publish requirements must pass | Quality control |
| **Confirmation dialog** | "Publish this product?" confirmation | Prevent accidental publish |
| **Audit log** | Log publish action with timestamp | Accountability |
| **Search indexing** | Product added to search index immediately | Discoverability |
| **Cache invalidation** | Product cached for storefront | Performance |
| **Notification** | Optional: notify followers of new product | Engagement |

### 4.9 Archive

#### 4.9.1 Archive Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Soft delete** | Product status → archived, never hard delete | Data integrity |
| **De-index** | Remove from search index | No ghost products |
| **Remove from cache** | Invalidate storefront cache | Fresh data |
| **Preserve history** | Order history preserved | Financial integrity |
| **Restore capability** | Archived products can be restored | Undo capability |
| **Audit log** | Log archive action | Accountability |
| **Bulk archive** | Support archiving multiple products | Efficiency |

### 4.10 Delete

#### 4.10.1 Delete Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Soft delete only** | Status → archived, never physical delete | Data integrity |
| **Confirmation required** | Double confirmation for delete | Safety |
| **No active orders** | Cannot delete product with pending/processing orders | Business rule |
| **Audit log** | Log delete action with reason | Accountability |
| **Bulk delete** | Support soft-deleting multiple products | Efficiency |
| **Reversibility** | Can restore archived products | Undo capability |

### 4.11 Inventory Updates

#### 4.11.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Per-variant stock** | Stock tracked at variant level, not product | Granular inventory |
| **Quick update** | Inline stock editing in product list | Speed |
| **Bulk update** | Select multiple variants, update stock | Scale |
| **Stock history** | Every stock change logged | Audit trail |
| **Low stock alerts** | Automatic alerts below threshold | Prevent stockouts |
| **Out of stock handling** | Auto-hide or show "Out of Stock" badge | Customer experience |
| **Reservation** | Stock reserved during checkout | Prevent overselling |

### 4.12 Media Management

#### 4.12.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Drag-and-drop** | Desktop: drag files to upload | Speed |
| **Mobile camera** | Mobile: capture directly from camera | Convenience |
| **Image compression** | Client-side compression before upload | Performance |
| **Max file size** | 10MB per image | Prevent abuse |
| **Allowed formats** | JPEG, PNG, WebP, GIF | Standard formats |
| **Image reorder** | Drag to reorder images | Merchandising |
| **Primary image** | First image is primary (displayed on card) | Clear presentation |
| **Bulk upload** | Upload multiple images at once | Efficiency |
| **Image crop** | Crop/resize tool for aspect ratio | Consistency |
| **Alt text** | Optional alt text for accessibility | SEO and accessibility |

### 4.13 Bulk Actions

#### 4.13.1 Bulk Action Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Selection** | Checkbox column in product table | Multi-select |
| **Select all** | Header checkbox (selects current page) | Efficiency |
| **Selection bar** | "X products selected" bar appears above table | Context |
| **Available actions** | Based on selection and permissions | Security |
| **Confirmation** | Confirmation dialog for destructive actions | Safety |
| **Progress** | Show progress for bulk operations | Feedback |
| **Results** | Show success/failure count | Transparency |
| **Undo** | Undo option in toast for 5 seconds | Recovery |

#### 4.13.2 Available Bulk Actions

| Action | Permission | Effect |
|--------|------------|--------|
| **Bulk publish** | `shop:product:publish` | Status → published |
| **Bulk archive** | `shop:product:archive` | Status → archived |
| **Bulk delete** | `shop:product:delete` | Status → archived (soft) |
| **Bulk price update** | `shop:product:price:update` | Update base price |
| **Bulk stock update** | `shop:inventory:update` | Update stock levels |
| **Bulk tag** | `shop:product:update` | Add/remove tags |
| **Export selected** | `shop:export:create` | Export product data |

---

## 5. Order Management

### 5.1 What

The complete architecture for how Shop Owners view, accept, reject, process, pack, ship, and manage orders — including status updates, order history, communication, and fulfillment workflows.

### 5.2 Why

- **Revenue:** Orders represent confirmed revenue
- **Customer satisfaction:** Fast, accurate order processing builds trust
- **Operational efficiency:** Streamlined workflows reduce time-to-ship
- **Transparency:** Customers must be informed of every status change

### 5.3 Where

Shop Owner dashboard order management, API handlers in `api/_handlers/shop/orders/`, frontend components in `src/features/shop/orders/`.

### 5.4 Order Visibility

| Stakeholder | Can See | Cannot See |
|-------------|---------|------------|
| **Shop Owner** | Orders containing their products | Other shops' orders, customer personal data |
| **Admin** | All orders | — |
| **Customer** | Own orders only | Other customers' orders |

### 5.5 Accept Order

#### 5.5.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Shop Owner clicks "Accept Order" | Clear action |
| **Validation** | Order must be in `processing` state | State guard |
| **Actor** | Shop Owner or Admin | Authorization |
| **Effect** | Status → `accepted`, notify customer | Progress |
| **Notes** | Optional acceptance note | Context |
| **Time limit** | Must accept/reject within 48 hours | SLA |

### 5.6 Reject Order

#### 5.6.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Shop Owner clicks "Reject Order" | Clear action |
| **Validation** | Order must be in `processing` state | State guard |
| **Actor** | Shop Owner or Admin | Authorization |
| **Reason required** | Must provide rejection reason | Customer communication |
| **Effect** | Status → `rejected`, initiate refund | Financial |
| **Notification** | Email customer with rejection reason + refund ETA | Transparency |
| **Audit log** | Log rejection with reason | Accountability |

### 5.7 Status Updates

#### 5.7.1 Status Transition Rules

| From State | Allowed To States | Actor Required | Reason Required |
|------------|-------------------|----------------|-----------------|
| **processing** | accepted, rejected | Shop Owner | Yes (for rejected) |
| **accepted** | packing, cancelled | Shop Owner/Admin | Yes (for cancelled) |
| **packing** | ready_to_ship | Shop Owner | No |
| **ready_to_ship** | shipped | Shop Owner | No |
| **shipped** | in_transit, delivered | Shop Owner/System | No |

#### 5.7.2 Status Update Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One-click status** | Single button to advance to next status | Speed |
| **Batch status** | Update multiple orders to same status | Scale |
| **Auto-notify** | Customer notified on every status change | Transparency |
| **Tracking number** | Required when marking as shipped | Customer tracking |
| **Audit log** | Every status change logged with actor + timestamp | Accountability |
| **Invalid transitions** | Return error for invalid state changes | State machine integrity |

### 5.8 Packing

#### 5.8.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Packing list** | Auto-generated packing list per order | Operational efficiency |
| **Item checklist** | Checkbox for each item in order | Accuracy |
| **Notes** | Optional packing notes | Special instructions |
| **Auto-advance** | Option to auto-advance to ready_to_ship | Speed |
| **Print label** | Generate shipping label | Fulfillment |

### 5.9 Shipment Preparation

#### 5.9.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Courier selection** | Select from available couriers | Flexibility |
| **Tracking number** | Required field when shipping | Customer tracking |
| **Shipping label** | Auto-generate from courier API | Efficiency |
| **Weight/dimensions** | Optional for rate calculation | Shipping optimization |
| **Bulk shipping** | Ship multiple orders at once | Scale |

### 5.10 Order Search

#### 5.10.1 Search Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Search by order number** | Exact match on order number | Quick lookup |
| **Search by customer name** | Partial match on customer name | Customer service |
| **Search by product name** | Partial match on product name in order | Product lookup |
| **Debounce** | 300ms debounce on search input | Performance |
| **Recent searches** | Show last 5 searches | Convenience |
| **Clear** | X button to clear query | Ease |

### 5.11 Order Filters

#### 5.11.1 Available Filters

| Filter | Options | Default |
|--------|---------|---------|
| **Status** | All, Pending, Processing, Accepted, Packing, Shipped, Delivered | All |
| **Date range** | Today, 7 days, 30 days, Custom | 30 days |
| **Amount** | Min/Max range | — |
| **Product** | Product name autocomplete | — |

#### 5.11.2 Filter Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **URL state** | Filters persisted in URL params | Shareable, bookmarkable |
| **Clear all** | "Clear filters" button | Easy reset |
| **Active filter count** | Show "X filters active" | Awareness |
| **Saved filters** | Save commonly used filter combinations | Efficiency |
| **Mobile** | Filters in bottom sheet | Thumb-friendly |

### 5.12 Order History

#### 5.12.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Status history** | Every status transition logged | Complete audit trail |
| **Action history** | Every create, update, cancel, return logged | Action traceability |
| **Actor history** | Every action tagged with actor (shop/owner/system) | Accountability |
| **Timestamp history** | Every action timestamped with UTC | Temporal accuracy |
| **Reason history** | Every rejection, cancellation, return includes reason | Context |
| **Immutable** | History records are append-only, never modified | Audit integrity |

---

## 6. Finance & Settlements

### 6.1 What

The complete architecture for how Shop Owners view their earnings, understand commission deductions, track settlement history, export financial data, and manage their financial relationship with the Nabome platform.

### 6.2 Why

- **Trust:** Shop Owners must understand exactly how their earnings are calculated
- **Transparency:** Commission rates, deductions, and settlements must be visible
- **Cash flow:** Shop Owners need to plan around settlement cycles
- **Compliance:** Financial records must be accurate and exportable

### 6.3 Where

Shop Owner dashboard finance module, API handlers in `api/_handlers/shop/finance/`, frontend components in `src/features/shop/finance/`.

### 6.4 Earnings Architecture

#### 6.4.1 Earnings Display

| Metric | Format | Description |
|--------|--------|-------------|
| **Gross Sales** | ₹XX,XXX | Total product revenue before deductions |
| **Platform Commission** | ₹X,XXX (XX%) | Nabome commission deducted |
| **Net Earnings** | ₹XX,XXX | Amount payable after commission |
| **Pending Settlement** | ₹X,XXX | Awaiting settlement processing |
| **Settled Amount** | ₹XX,XXX | Successfully paid out |

#### 6.4.2 Earnings Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Commission visibility** | Always show commission rate and amount | Transparency |
| **Net earnings prominence** | Net earnings is the primary number | Shop Owner cares about take-home |
| **Real-time calculation** | Earnings computed on read, not cached | Accuracy |
| **Period breakdown** | Daily, weekly, monthly, yearly views | Flexibility |
| **Export readiness** | CSV/PDF export of earnings data | Reporting |
| **Commission rate display** | Show applicable commission rate per order | Transparency |

### 6.5 Pending Settlement

#### 6.5.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Settlement cycle** | Configurable (default: weekly) | Business flexibility |
| **Hold period** | 7-day hold after delivery | Return window protection |
| **Minimum payout** | Configurable minimum (default: ₹500) | Transaction cost optimization |
| **Settlement countdown** | Show days until next settlement | Cash flow planning |
| **Settlement breakdown** | List all orders included in next settlement | Transparency |
| **Settlement status** | Pending, Processing, Completed | Status awareness |

### 6.6 Settlement History

#### 6.6.1 Settlement History Display

| Field | Format | Description |
|-------|--------|-------------|
| **Settlement ID** | Unique identifier | Reference number |
| **Period** | Date range | Settlement period |
| **Gross Amount** | ₹XX,XXX | Total sales in period |
| **Commission** | ₹X,XXX | Platform commission |
| **Net Amount** | ₹XX,XXX | Amount paid |
| **Status** | Pending/Processing/Completed/Paid | Current status |
| **Paid Date** | Date | When settlement was processed |
| **Transaction ID** | Payment reference | Payment trail |

#### 6.6.2 Settlement History Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Sortable** | Sort by date, amount, status | Data organization |
| **Filterable** | Filter by status, date range | Focused view |
| **Exportable** | CSV/PDF export | Reporting |
| **Detailed view** | Click to see order-level breakdown | Transparency |
| **Empty state** | "No settlements yet" with helpful message | Guidance |
| **Pagination** | 20 settlements per page | Performance |

### 6.7 Commission Visibility

#### 6.7.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Per-order commission** | Show commission amount per order | Transparency |
| **Commission rate** | Show applicable rate per order | Understanding |
| **Commission breakdown** | Show global/category/shop-specific rate | Clarity |
| **Commission history** | Track commission changes over time | Audit trail |
| **Rate change notification** | Notify shop owner of commission rate changes | Transparency |

### 6.8 Financial Reports

#### 6.8.1 Available Reports

| Report | Content | Format |
|--------|---------|--------|
| **Daily Sales** | Orders, revenue, commission per day | Table + chart |
| **Product Performance** | Revenue, units, commission per product | Table + chart |
| **Category Breakdown** | Revenue distribution by category | Pie chart |
| **Settlement Report** | Settlement details per period | Table |
| **Tax Report** | GST breakdown per transaction | Table |

#### 6.8.2 Report Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Date range** | Configurable date range | Flexibility |
| **Export** | CSV, PDF export | Reporting |
| **Print** | Print-friendly layout | Offline use |
| **Charts** | Visual charts for trends | Quick insights |
| **Drill-down** | Click chart element to see details | Investigation |
| **Mobile** | Responsive report layout | Mobile access |

### 6.9 Export Readiness

#### 6.9.1 Export Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **CSV export** | Comma-separated values for spreadsheet | Universal |
| **PDF export** | Formatted PDF for records | Professional |
| **Date range selection** | Export specific time periods | Flexibility |
| **Column selection** | Choose which columns to export | Customization |
| **Async export** | Large exports processed in background | Performance |
| **Download notification** | Notify when export is ready | UX |
| **Export history** | Track past exports | Reference |

---

## 7. Communication

### 7.1 What

The complete architecture for how Shop Owners communicate with the Nabome admin team, receive system messages, manage order-related discussions, and handle product-related inquiries.

### 7.2 Why

- **Support:** Shop Owners need quick access to admin support
- **Transparency:** System messages keep Shop Owners informed
- **Order context:** Order discussions must be linked to specific orders
- **Product context:** Product discussions must be linked to specific products

### 7.3 Where

Shop Owner dashboard messages module, API handlers in `api/_handlers/shop/messages/`, frontend components in `src/features/shop/messages/`.

### 7.4 Admin Messages

#### 7.4.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Direct line** | Shop Owner can message admin directly | Support access |
| **Threaded** | Messages organized in threads | Context preservation |
| **Rich text** | Support formatting, images, links | Expressive |
| **Read receipts** | Show when message was read | Transparency |
| **Response time** | Show expected response time | Expectation setting |
| **Priority** | Mark messages as urgent/normal/low | Triage |

### 7.5 System Messages

#### 7.5.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Automated** | System-generated notifications | Information |
| **Categorized** | Order, finance, product, system categories | Organization |
| **Actionable** | Include action buttons where applicable | Efficiency |
| **Persistent** | System messages retained for 90 days | Reference |
| **Filterable** | Filter by type, date, read/unread | Organization |
| **Bulk actions** | Mark all as read, delete selected | Efficiency |

### 7.6 Linked Conversations

#### 7.6.1 Order Discussions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Order-linked** | Conversation linked to specific order | Context |
| **Auto-context** | Order details shown alongside conversation | Reference |
| **Participant tracking** | Track who said what | Accountability |
| **Resolution status** | Mark conversation as resolved/unresolved | Workflow |
| **Admin escalation** | Escalate to admin if needed | Support |

#### 7.6.2 Product Discussions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Product-linked** | Conversation linked to specific product | Context |
| **Review context** | Show related reviews alongside | Reference |
| **Moderation** | Admin can moderate product discussions | Quality |
| **Resolution status** | Mark as resolved/unresolved | Workflow |

#### 7.6.3 Finance Discussions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Finance-linked** | Conversation linked to specific transaction | Context |
| **Settlement context** | Show related settlement details | Reference |
| **Dispute workflow** | Formal dispute process for financial disagreements | Resolution |
| **Admin review** | Admin reviews financial disputes | Governance |

---

## 8. Permissions

### 8.1 What

The complete permission architecture that governs what Shop Owners and their team members can do within the Shop Owner Dashboard — including product editing, inventory management, price editing, description editing, media editing, publish permissions, and admin delegation.

### 8.2 Why

- **Security:** Not all team members should have full access
- **Accountability:** Clear permission boundaries enable audit trails
- **Delegation:** Shop Owners can delegate tasks without giving full control
- **Compliance:** Enterprise-grade access control

### 8.3 Where

All Shop Owner Dashboard modules, API handlers, and frontend routes.

### 8.4 Permission Format

```typescript
// Permission format: {scope}:{resource}:{action}
type ShopPermission =
  // Product permissions
  | 'shop:product:read'
  | 'shop:product:create'
  | 'shop:product:update'
  | 'shop:product:delete'
  | 'shop:product:publish'
  | 'shop:product:archive'
  // Inventory permissions
  | 'shop:inventory:read'
  | 'shop:inventory:update'
  // Order permissions
  | 'shop:order:read'
  | 'shop:order:accept'
  | 'shop:order:reject'
  | 'shop:order:ship'
  | 'shop:order:cancel'
  // Finance permissions
  | 'shop:finance:read'
  | 'shop:finance:export'
  // Message permissions
  | 'shop:message:read'
  | 'shop:message:send'
  // Settings permissions
  | 'shop:settings:read'
  | 'shop:settings:update'
  | 'shop:permissions:manage'
  // Export permissions
  | 'shop:export:create'
  | 'shop:export:read';
```

### 8.5 Role Permission Matrix

| Permission | Shop Owner | Manager | Staff | Viewer |
|------------|-----------|---------|-------|--------|
| `shop:product:read` | ✓ | ✓ | ✓ | ✓ |
| `shop:product:create` | ✓ | ✓ | ✓ | ✗ |
| `shop:product:update` | ✓ | ✓ | ✓ | ✗ |
| `shop:product:delete` | ✓ | ✓ | ✗ | ✗ |
| `shop:product:publish` | ✓ | ✓ | ✗ | ✗ |
| `shop:product:archive` | ✓ | ✓ | ✗ | ✗ |
| `shop:inventory:read` | ✓ | ✓ | ✓ | ✓ |
| `shop:inventory:update` | ✓ | ✓ | ✓ | ✗ |
| `shop:order:read` | ✓ | ✓ | ✓ | ✓ |
| `shop:order:accept` | ✓ | ✓ | ✗ | ✗ |
| `shop:order:reject` | ✓ | ✓ | ✗ | ✗ |
| `shop:order:ship` | ✓ | ✓ | ✓ | ✗ |
| `shop:order:cancel` | ✓ | ✓ | ✗ | ✗ |
| `shop:finance:read` | ✓ | ✓ | ✗ | ✗ |
| `shop:finance:export` | ✓ | ✗ | ✗ | ✗ |
| `shop:message:read` | ✓ | ✓ | ✓ | ✓ |
| `shop:message:send` | ✓ | ✓ | ✓ | ✗ |
| `shop:settings:read` | ✓ | ✓ | ✓ | ✓ |
| `shop:settings:update` | ✓ | ✗ | ✗ | ✗ |
| `shop:permissions:manage` | ✓ | ✗ | ✗ | ✗ |
| `shop:export:create` | ✓ | ✓ | ✗ | ✗ |
| `shop:export:read` | ✓ | ✓ | ✓ | ✓ |

### 8.6 Product Editing Permissions

#### 8.6.1 Granular Product Permissions

| Permission | Scope | Description |
|------------|-------|-------------|
| `shop:product:name:update` | Product name | Can edit product name |
| `shop:product:description:update` | Product description | Can edit description |
| `shop:product:price:update` | Product pricing | Can edit base price and compare-at price |
| `shop:product:media:update` | Product images | Can upload, reorder, delete images |
| `shop:product:variants:update` | Product variants | Can create, edit, delete variants |
| `shop:product:seo:update` | SEO metadata | Can edit meta title, description |
| `shop:product:tags:update` | Product tags | Can add/remove tags |

#### 8.6.2 Product Editing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Granular control** | Permission per field type | Fine-grained delegation |
| **Role-based defaults** | Each role gets sensible defaults | Ease of setup |
| **Override capability** | Shop Owner can override role defaults | Flexibility |
| **Audit trail** | Every edit logged with actor and permission | Accountability |
| **Visual indicators** | Show which fields user can edit | Clarity |
| **Disabled fields** | Gray out fields user cannot edit | Clear boundaries |

### 8.7 Inventory Editing Permissions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Stock updates** | Separate permission from product editing | Granular control |
| **Bulk updates** | Require elevated permission | Safety |
| **Threshold changes** | Require manager permission | Operational impact |
| **Stock history** | Read-only for all roles | Transparency |

### 8.8 Price Editing Permissions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Base price** | Require explicit permission | Revenue impact |
| **Compare-at price** | Separate permission | Marketing flexibility |
| **Bulk price changes** | Require Shop Owner approval | Financial safety |
| **Price history** | Read-only for all roles | Audit trail |
| **Minimum price** | System-enforced minimum | Prevent losses |

### 8.9 Description Editing Permissions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Rich text** | Permission to edit formatted descriptions | Content quality |
| **Plain text** | Permission to edit plain descriptions | Basic content |
| **Bulk edits** | Require manager approval | Quality control |
| **Character limits** | Enforced per description type | Consistency |

### 8.10 Media Editing Permissions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Upload** | Permission to upload new media | Content addition |
| **Delete** | Permission to delete existing media | Content removal |
| **Reorder** | Permission to change image order | Merchandising |
| **Replace** | Permission to replace existing images | Content updates |
| **Bulk operations** | Permission for bulk media operations | Efficiency |

### 8.11 Publish Permissions

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Publish** | Explicit permission required | Quality gate |
| **Unpublish** | Explicit permission required | Operational impact |
| **Schedule** | Permission to schedule future publish | Marketing flexibility |
| **Bulk publish** | Requires manager approval | Scale safety |
| **Auto-publish** | Not supported — all publishes are manual | Quality control |

### 8.12 Admin Delegation

#### 8.12.1 Delegation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Shop Owner only** | Only Shop Owner can delegate | Authority chain |
| **Role assignment** | Assign roles (Manager, Staff, Viewer) | Structured access |
| **Custom permissions** | Override role defaults per user | Flexibility |
| **Revocation** | Shop Owner can revoke access anytime | Control |
| **Audit log** | All delegation actions logged | Accountability |
| **Max team size** | Configurable limit per shop | Scaling control |
| **Invitation flow** | Email invitation with role assignment | Onboarding |

---

## 9. Search

### 9.1 What

The complete search architecture for the Shop Owner Dashboard — how Shop Owners find products, orders, messages, and financial data across their workspace.

### 9.2 Why

- **Efficiency:** Quick access to any data point
- **Productivity:** Reduce time-to-task for common lookups
- **Discoverability:** Find data that might otherwise be hidden

### 9.3 Where

All Shop Owner Dashboard modules, search API handlers, frontend search components.

### 9.4 Product Search

#### 9.4.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Search by name** | Full-text search on product name | Primary lookup |
| **Search by SKU** | Exact match on SKU | Inventory lookup |
| **Search by category** | Filter by category | Browsing |
| **Search by status** | Filter by draft/published/archived | Workflow |
| **Debounce** | 300ms debounce on search input | Performance |
| **Autocomplete** | Show suggestions as user types | Speed |
| **Recent searches** | Show last 5 searches | Convenience |
| **Empty state** | "No products found" with suggestions | Guidance |

### 9.5 Order Search

#### 9.5.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Search by order number** | Exact match on order number | Quick lookup |
| **Search by customer name** | Partial match on customer name | Customer service |
| **Search by product name** | Partial match on product name in order | Product lookup |
| **Search by date** | Filter by date range | Time-based lookup |
| **Search by status** | Filter by order status | Workflow |
| **Search by amount** | Filter by order amount range | Financial lookup |

### 9.6 Finance Search

#### 9.6.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Search by settlement ID** | Exact match | Quick lookup |
| **Search by date range** | Filter by date | Time-based lookup |
| **Search by amount** | Filter by amount range | Financial lookup |
| **Search by status** | Filter by settlement status | Workflow |

### 9.7 Message Search

#### 9.7.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Search by subject** | Full-text search on message subject | Quick lookup |
| **Search by content** | Full-text search on message body | Deep search |
| **Search by sender** | Filter by sender | Organization |
| **Search by date** | Filter by date range | Time-based lookup |
| **Search by status** | Filter by read/unread | Workflow |

### 9.8 Global Dashboard Search

#### 9.8.1 Search Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GLOBAL SHOP SEARCH                             │
│                                                                  │
│  Trigger: Cmd+K (desktop) or Search icon (mobile)               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Search Input                                             │   │
│  │  "Search products, orders, messages..."                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          |                                       │
│                          v                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Results grouped by module                                │   │
│  │                                                           │   │
│  │  PRODUCTS (3 results)                                     │   │
│  │  ├── Cotton Tee - Published                              │   │
│  │  ├── Cotton Tee (Blue) - Draft                           │   │
│  │  └── Cotton Pants - Published                            │   │
│  │                                                           │   │
│  │  ORDERS (2 results)                                       │   │
│  │  ├── #NAB-20260803-0001 - Pending                        │   │
│  │  └── #NAB-20260803-0002 - Shipped                        │   │
│  │                                                           │   │
│  │  MESSAGES (1 result)                                      │   │
│  │  └── "Shipping delay notification" - Unread              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### 9.8.2 Global Search Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Keyboard shortcut** | Cmd+K (Mac), Ctrl+K (Windows) | Power users |
| **Instant results** | Show results as user types | Speed |
| **Grouped results** | Results organized by module | Clarity |
| **Result preview** | Show key details on hover/tap | Context |
| **Keyboard navigation** | Arrow keys to navigate, Enter to select | Accessibility |
| **Escape to close** | ESC closes search overlay | Recovery |
| **Empty state** | "No results found" with suggestions | Guidance |
| **Mobile** | Full-screen search overlay | Focus |
| **Desktop** | Modal search overlay | Space efficiency |

---

## 10. Productivity

### 10.1 What

The complete productivity architecture for the Shop Owner Dashboard — bulk operations, saved filters, favorites, recent items, quick edit, quick actions, and keyboard shortcuts.

### 10.2 Why

- **Efficiency:** Every second saved compounds over thousands of operations
- **Scale:** Bulk operations handle hundreds of items
- **Workflow:** Saved views and favorites reduce repetitive tasks
- **Power users:** Keyboard shortcuts accelerate common workflows

### 10.3 Where

All Shop Owner Dashboard modules, shared productivity components.

### 10.4 Bulk Operations

#### 10.4.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Multi-select** | Checkbox column in all tables | Selection |
| **Select all** | Header checkbox (current page) | Efficiency |
| **Selection count** | "X items selected" above table | Context |
| **Bulk actions** | Context-sensitive bulk action bar | Operations |
| **Confirmation** | Confirmation dialog for destructive actions | Safety |
| **Progress** | Progress indicator for bulk operations | Feedback |
| **Results** | Success/failure count after completion | Transparency |
| **Undo** | Undo option for 5 seconds | Recovery |

### 10.5 Saved Filters

#### 10.5.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Save filter** | "Save filter" button when filters active | Workflow |
| **Name filter** | Give saved filter a descriptive name | Identification |
| **Apply filter** | One-click to apply saved filter | Speed |
| **Delete filter** | Remove saved filter | Cleanup |
| **Max saved** | 10 saved filters per module | Organization |
| **Share filter** | Copy filter URL with all params | Collaboration |

### 10.6 Favorites

#### 10.6.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Favorite products** | Star icon on product cards/tables | Quick access |
| **Favorite orders** | Star icon on order cards/tables | Quick access |
| **Favorites list** | Dedicated "Favorites" view per module | Organization |
| **Quick access** | Favorites appear first in relevant lists | Priority |
| **Remove favorite** | Toggle star to remove | Ease |

### 10.7 Recent Items

#### 10.7.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Recent products** | Last 10 viewed products | Quick return |
| **Recent orders** | Last 10 viewed orders | Quick return |
| **Recent items widget** | Dashboard widget showing recent items | At-a-glance |
| **Clear history** | Option to clear recent items | Privacy |
| **Persistent** | Recent items persist across sessions | Convenience |

### 10.8 Quick Edit

#### 10.8.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Inline editing** | Edit fields directly in table rows | Speed |
| **Single field** | Edit one field at a time | Focus |
| **Save on blur** | Auto-save when clicking away | Speed |
| **Undo** | Undo option in toast | Recovery |
| **Validation** | Real-time validation on inline edit | Data integrity |
| **Mobile** | Quick edit via bottom sheet | Touch-friendly |

### 10.9 Quick Actions

#### 10.9.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Floating action button** | Mobile: FAB for quick create | Thumb-friendly |
| **Quick actions menu** | Desktop: dropdown for quick actions | Discoverable |
| **Context-sensitive** | Actions change based on current module | Relevance |
| **Permission-gated** | Only show actions user can perform | Security |
| **Keyboard accessible** | All quick actions keyboard accessible | Accessibility |

### 10.10 Keyboard Shortcuts

#### 10.10.1 Shortcut Map

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Cmd+K` | Open global search | Global |
| `Cmd+N` | Create new product | Products |
| `Cmd+S` | Save current form | Forms |
| `Cmd+Shift+P` | Go to products | Global |
| `Cmd+Shift+O` | Go to orders | Global |
| `Cmd+Shift+F` | Go to finance | Global |
| `Cmd+Shift+D` | Create draft | Products |
| `Escape` | Close modal/overlay | Global |
| `?` | Show keyboard shortcuts | Global |

#### 10.10.2 Keyboard Shortcut Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Discoverable** | Show shortcut hints in UI | Learning |
| **Conflict-free** | Don't override browser defaults | Safety |
| **Context-aware** | Shortcuts only work in appropriate context | Prevent errors |
| **Help modal** | `?` opens shortcuts reference | Discovery |
| **Customizable** | Future: allow custom shortcuts | Power users |
| **Mobile** | Shortcuts hidden on mobile (touch-only) | Relevance |

---

## 11. Responsive UX

### 11.1 What

The complete responsive design architecture for the Shop Owner Dashboard — how the workspace adapts across mobile, tablet, and desktop devices.

### 11.2 Why

- **Mobile-first:** 70%+ of Shop Owner activity is on mobile
- **Productivity:** Each device size must be optimized for its context
- **Consistency:** Same functionality, adapted presentation
- **Accessibility:** Every device must be fully accessible

### 11.3 Where

All Shop Owner Dashboard components, layouts, and interactions.

### 11.4 Mobile Workspace

#### 11.4.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Bottom navigation** | Primary nav at bottom of screen | Thumb-friendly |
| **Full-width content** | Content uses full screen width | Space efficiency |
| **Stacked layout** | Single column, stacked elements | Scrollable |
| **Touch targets** | Minimum 44x44px for all interactive elements | Accessibility |
| **Swipe gestures** | Swipe to reveal actions on list items | Natural interaction |
| **Pull to refresh** | Pull down to refresh data | Mobile convention |
| **Bottom sheets** | Filters and actions in bottom sheets | Thumb-friendly |
| **Floating action button** | Quick create button, bottom-right | Always accessible |
| **Safe area padding** | Account for device safe areas | Prevent overlap |
| **Keyboard avoidance** | Forms scroll input into view above keyboard | Usability |

#### 11.4.2 Mobile Layout

```
┌─────────────────────────────┐
│ ☰  Shop Dashboard    🔔 👤  │
│─────────────────────────────│
│                               │
│  ┌──────┐ ┌──────┐          │
│  │Rev   │ │Orders│          │
│  │₹12.5L│ │  89  │          │
│  └──────┘ └──────┘          │
│                               │
│  ┌──────┐ ┌──────┐          │
│  │Prods │ │Pend  │          │
│  │  45  │ │  7   │          │
│  └──────┘ └──────┘          │
│                               │
│  Recent Orders               │
│  ┌─────────────────────┐    │
│  │ #001 - ₹1,234       │    │
│  │ #002 - ₹2,567       │    │
│  │ #003 - ₹890         │    │
│  └─────────────────────┘    │
│                               │
│  ┌─────────────────────┐    │
│  │  Quick Actions:      │    │
│  │  + Product | + Draft │    │
│  └─────────────────────┘    │
│                               │
├─────────────────────────────│
│ 🏠  📦  🛒  💵  ⚙️         │
│ Dash Prods Orders Fin Set   │
└─────────────────────────────┘
```

### 11.5 Tablet Workspace

#### 11.5.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Collapsed sidebar** | Icons only, 64px width | Space efficiency |
| **Two-column layout** | Content + sidebar for detail views | Medium screen optimization |
| **Touch targets** | Minimum 44x44px | Touch-friendly |
| **Hover states** | Show on hover (with touch fallback) | Interactivity |
| **Responsive tables** | Horizontal scroll or card layout | Readability |
| **Responsive forms** | Two-column form layout | Space efficiency |

### 11.6 Desktop Workspace

#### 11.6.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Expanded sidebar** | Full sidebar with labels, 280px | Complete navigation |
| **Multi-column layout** | Content + sidebar for detail views | Information density |
| **Hover interactions** | Hover for quick actions, tooltips | Power user efficiency |
| **Keyboard navigation** | Full keyboard accessibility | Power users |
| **Right-click context** | Context menus on right-click | Desktop convention |
| **Resizable panels** | Sidebar and content panels resizable | Customization |

### 11.7 One-Hand Usage

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Primary actions in thumb zone** | Bottom-right of screen for mobile | Ergonomics |
| **Navigation at bottom** | Bottom nav for primary navigation | Thumb reach |
| **Pull actions** | Pull-to-refresh, swipe-to-action | Natural gestures |
| **Floating action button** | Quick create in thumb zone | Always accessible |
| **Avoid top-left actions** | Hard to reach with thumb on mobile | Ergonomics |

### 11.8 Responsive Tables

#### 11.8.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile** | Card layout (stacked fields) | Space efficiency |
| **Tablet** | Horizontal scroll with fixed first column | Readability |
| **Desktop** | Full table with all columns | Information density |
| **Sticky header** | Table header fixed on scroll | Column context |
| **Sticky first column** | Product/order name always visible | Identification |
| **Column priority** | Define column importance per breakpoint | Responsive |

### 11.9 Responsive Forms

#### 11.9.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Mobile** | Single column, full width | Space efficiency |
| **Tablet** | Two columns for related fields | Space optimization |
| **Desktop** | Multi-column layout, max-width 720px | Readable line length |
| **Sticky save** | Save button fixed at bottom on scroll | Always accessible |
| **Section grouping** | Related fields grouped with headers | Organization |
| **Progressive disclosure** | Show essential fields first, expand for more | Cognitive load |

---

## 12. Performance

### 12.1 What

The complete performance architecture for the Shop Owner Dashboard — how the workspace handles large product catalogs, large order lists, background loading, lazy rendering, and optimized tables.

### 12.2 Why

- **Productivity:** Slow interfaces waste Shop Owner time
- **Scale:** Must handle thousands of products and orders
- **Mobile:** Performance is critical on mobile networks
- **Trust:** Fast interfaces build confidence

### 12.3 Where

All Shop Owner Dashboard modules, API handlers, frontend components.

### 12.4 Large Product Catalogs

#### 12.4.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Virtual scrolling** | Render only visible rows for 100+ products | Performance |
| **Lazy loading** | Load images as they scroll into view | Memory |
| **Pagination** | 20 items per page default | Predictable loading |
| **Search indexing** | Full-text search via database indexes | Speed |
| **Cached queries** | TanStack Query with 5-minute stale time | Reduced API calls |
| **Optimistic updates** | Update UI immediately, sync in background | Perceived speed |

### 12.5 Large Order Lists

#### 12.5.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side pagination** | Don't load all orders at once | Performance |
| **Cursor-based pagination** | Use cursor for infinite scroll option | Scalability |
| **Date partitioning** | Partition orders by date for fast queries | Database performance |
| **Indexed queries** | Index on status, date, shop_id | Query speed |
| **Cached counts** | Cache order counts, invalidate on change | Dashboard speed |

### 12.6 Background Loading

#### 12.6.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Skeleton screens** | Show skeleton matching content shape | Perceived performance |
| **Progressive loading** | Load critical content first, secondary later | Priority |
| **Background refresh** | Refetch data in background on window focus | Fresh data |
| **Optimistic mutations** | Update UI before server confirms | Speed |
| **Error recovery** | Show stale data with retry option on error | Resilience |

### 12.7 Lazy Rendering

#### 12.7.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Route-based splitting** | `React.lazy()` for each module | Bundle size |
| **Component-based splitting** | Lazy load heavy components (charts, editors) | Initial load |
| **Intersection observer** | Load components when they enter viewport | Scroll performance |
| **Tab content** | Lazy load tab content on first view | Tab switching speed |
| **Modal content** | Lazy load modal content on open | Modal open speed |

### 12.8 Optimized Tables

#### 12.8.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Column virtualization** | Render only visible columns for wide tables | Performance |
| **Row height optimization** | Fixed row heights for predictable layout | Scroll performance |
| **Debounced sorting** | Debounce sort operations | Prevent rapid requests |
| **Server-side sorting** | Sort in database, not client | Scalability |
| **Server-side filtering** | Filter in database, not client | Scalability |
| **Memoized rows** | Memoize row components to prevent re-renders | Render performance |

---

## 13. Security

### 13.1 What

The complete security architecture for the Shop Owner Dashboard — permission enforcement, audit logging, session security, secure editing, sensitive actions, and confirmation workflows.

### 13.2 Why

- **Data protection:** Shop Owner data must be secure
- **Financial security:** Earnings and settlement data must be protected
- **Compliance:** Audit trails meet regulatory requirements
- **Trust:** Security builds confidence in the platform

### 13.3 Where

All Shop Owner Dashboard modules, API handlers, and frontend routes.

### 13.4 Permission Enforcement

#### 13.4.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side enforcement** | All permissions checked on server | Security cannot depend on client |
| **Client-side hiding** | Hide UI elements user cannot access | UX |
| **Route protection** | Redirect unauthorized route access | Security |
| **API protection** | Return 403 for unauthorized API calls | Security |
| **UI disabling** | Disable buttons user cannot click | Clarity |
| **Audit log** | Log all permission checks | Monitoring |

### 13.5 Audit Logging

#### 13.5.1 Audit Events

| Event | Data to Log | Rationale |
|-------|-------------|-----------|
| **Product created** | shopId, productId, actorId, timestamp | Accountability |
| **Product updated** | shopId, productId, changes, actorId | Change tracking |
| **Product published** | shopId, productId, actorId | Quality gate |
| **Order accepted** | shopId, orderId, actorId | Operations |
| **Order rejected** | shopId, orderId, reason, actorId | Accountability |
| **Order shipped** | shopId, orderId, trackingNumber, actorId | Fulfillment |
| **Price changed** | shopId, productId, oldPrice, newPrice, actorId | Financial |
| **Stock updated** | shopId, variantId, oldStock, newStock, actorId | Inventory |
| **Settlement viewed** | shopId, settlementId, actorId | Financial |
| **Permission changed** | shopId, targetUserId, oldRole, newRole, actorId | Security |
| **Login** | shopId, userId, ip, userAgent | Security |
| **Failed login** | email, ip, userAgent, reason | Security |

#### 13.5.2 Audit Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Every action logged** | No action escapes audit trail | Compliance |
| **Actor attribution** | Every action tagged with user | Accountability |
| **Timestamp** | UTC timestamp on every event | Temporal accuracy |
| **Immutable** | Audit records never modified or deleted | Integrity |
| **Retention** | Audit logs retained for 7 years | Legal compliance |
| **Searchable** | Audit logs searchable by actor, action, date | Investigation |
| **Exportable** | Audit logs exportable as CSV/PDF | Compliance |

### 13.6 Session Security

#### 13.6.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly cookies** | Tokens stored in httpOnly cookies | XSS prevention |
| **Secure cookies** | HTTPS only in production | MITM prevention |
| **SameSite lax** | CSRF protection | CSRF prevention |
| **Token rotation** | Rotate tokens on sensitive operations | Security |
| **Session timeout** | 15-minute access token, 7-day refresh | Security |
| **Max sessions** | 5 sessions per user | Prevent abuse |
| **Concurrent session warning** | Warn on new login from different device | Security awareness |

### 13.7 Secure Editing

#### 13.7.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Optimistic locking** | Version field on all editable entities | Prevent lost updates |
| **Conflict detection** | Detect concurrent edits on same entity | Data integrity |
| **Auto-save protection** | Auto-save doesn't override explicit saves | Data integrity |
| **Unsaved changes warning** | Warn on navigation with unsaved changes | Data protection |
| **Form validation** | Validate all input before submission | Data integrity |
| **Input sanitization** | Sanitize all text input | XSS prevention |

### 13.8 Sensitive Actions

#### 13.8.1 Confirmation Workflows

| Action | Confirmation Type | Rationale |
|--------|-------------------|-----------|
| **Delete product** | Double confirmation dialog | Data safety |
| **Bulk delete** | Confirmation + count display | Scale safety |
| **Price change** | Confirmation for > 20% change | Financial safety |
| **Reject order** | Required reason field | Customer communication |
| **Archive product** | Single confirmation | Data safety |
| **Permission change** | Confirmation + audit log | Security |
| **Settlement export** | Single confirmation | Financial data |

#### 13.8.2 Sensitive Action Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Destructive actions** | Always require confirmation | Safety |
| **Financial actions** | Always require confirmation | Financial safety |
| **Bulk actions** | Always show count before confirmation | Scale safety |
| **Undo window** | 5-second undo window for non-destructive actions | Speed + safety |
| **Reason field** | Required for rejections, cancellations | Accountability |
| **Audit log** | All sensitive actions logged | Compliance |

---

## 14. Accessibility

### 14.1 What

The complete accessibility architecture for the Shop Owner Dashboard — keyboard navigation, screen readers, focus management, responsive editing, and reduced motion.

### 14.2 Why

- **Inclusivity:** Every Shop Owner must be able to use the dashboard
- **Compliance:** WCAG 2.2 AA compliance required
- **Legal:** Accessibility is a legal requirement in many jurisdictions
- **Quality:** Accessible interfaces are better for everyone

### 14.3 Where

All Shop Owner Dashboard components, layouts, and interactions.

### 14.4 Keyboard Navigation

#### 14.4.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical tab order through all interactive elements | Navigation |
| **Focus visible** | Clear focus indicator on all focused elements | Visibility |
| **Skip links** | "Skip to content" link at top of page | Efficiency |
| **Keyboard shortcuts** | All actions accessible via keyboard | Power users |
| **No keyboard traps** | Focus can always move away from any element | Recovery |
| **Modal focus trap** | Focus trapped within open modals | Context |
| **Escape to close** | ESC closes all modals and overlays | Recovery |

### 14.5 Screen Readers

#### 14.5.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **ARIA landmarks** | Use semantic HTML and ARIA roles | Structure |
| **ARIA labels** | Label all interactive elements | Identification |
| **ARIA live regions** | Announce dynamic content changes | Awareness |
| **Alt text** | All images have descriptive alt text | Image description |
| **Form labels** | All form inputs have associated labels | Form accessibility |
| **Error announcements** | Errors announced via ARIA live regions | Error awareness |
| **Status announcements** | Status changes announced | Workflow awareness |

### 14.6 Focus Management

#### 14.6.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Focus on navigation** | Move focus to main content on route change | Orientation |
| **Focus in modals** | Move focus to first interactive element in modal | Context |
| **Focus restoration** | Return focus to trigger element when modal closes | Context |
| **Focus on error** | Move focus to first error field on validation | Error resolution |
| **Focus on toast** | Don't move focus for toast notifications | Non-blocking |
| **Focus indicators** | Minimum 2px outline, high contrast | Visibility |

### 14.7 Responsive Editing

#### 14.7.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Touch targets** | Minimum 44x44px for all interactive elements | Touch accessibility |
| **Text scaling** | Layout works with 200% text zoom | Visual accessibility |
| **Color independence** | Information not conveyed by color alone | Color blindness |
| **Contrast ratios** | Minimum 4.5:1 for normal text, 3:1 for large text | Readability |
| **Motion reduction** | Respect `prefers-reduced-motion` | Motion sensitivity |

### 14.8 Reduced Motion

#### 14.8.1 Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **prefers-reduced-motion** | Check media query for reduced motion | User preference |
| **Disable animations** | Disable non-essential animations when preferred | Comfort |
| **Disable transitions** | Disable transitions when preferred | Comfort |
| **Essential motion only** | Keep only essential motion (loading indicators) | Functionality |
| **Alternative feedback** | Use opacity/color changes instead of motion | Inclusivity |

---

## 15. Future Readiness

### 15.1 What

The architecture for future capabilities that the Shop Owner Dashboard must be prepared to support — AI product assistant, AI sales insights, workflow automation, multi-user shop accounts, team management, inventory forecasting, and mobile app readiness.

### 15.2 Why

- **Scalability:** The dashboard must grow with the platform
- **Innovation:** Future features must fit the existing architecture
- **Investment protection:** Current architecture decisions must not block future features
- **Competitive advantage:** AI and automation will differentiate Nabome

### 15.3 Where

Architecture decisions across all modules, API handlers, and frontend components.

### 15.4 AI Product Assistant

#### 15.4.1 Architecture Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Product descriptions** | AI-generated descriptions from product attributes | Content automation |
| **SEO optimization** | AI-suggested meta titles and descriptions | SEO automation |
| **Image tagging** | AI-powered image categorization | Organization |
| **Price suggestions** | AI-based pricing recommendations | Revenue optimization |
| **Competitor analysis** | AI-powered competitor price monitoring | Market intelligence |

#### 15.4.2 AI Integration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Opt-in** | AI features are opt-in, not mandatory | User control |
| **Review required** | AI suggestions require human review | Quality control |
| **Transparency** | Clearly label AI-generated content | Trust |
| **Graceful degradation** | AI features fail silently, don't block workflow | Reliability |
| **Cost awareness** | Track AI usage for cost management | Business |

### 15.5 AI Sales Insights

#### 15.5.1 Architecture Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Demand forecasting** | AI predicts product demand | Inventory planning |
| **Trend analysis** | AI identifies sales trends | Strategy |
| **Customer segmentation** | AI groups customers by behavior | Marketing |
| **Churn prediction** | AI identifies at-risk customers | Retention |
| **Recommendation engine** | AI suggests cross-sell/upsell opportunities | Revenue |

### 15.6 Workflow Automation

#### 15.6.1 Architecture Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Rule engine** | Configurable rules for automated actions | Flexibility |
| **Trigger system** | Events trigger automated workflows | Automation |
| **Action library** | Pre-built actions for common tasks | Efficiency |
| **Condition builder** | Visual condition builder for non-technical users | Usability |
| **Audit trail** | All automated actions logged | Accountability |

#### 15.6.2 Automation Examples

| Trigger | Condition | Action |
|---------|-----------|--------|
| **Low stock** | Stock < threshold | Send restock notification |
| **New order** | Order confirmed | Update inventory |
| **Return request** | Return approved | Initiate refund |
| **Settlement** | Settlement processed | Send notification |
| **Draft inactive** | Draft > 30 days old | Flag for review |

### 15.7 Multi-User Shop Accounts

#### 15.7.1 Architecture Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Team roles** | Predefined roles (Owner, Manager, Staff, Viewer) | Structure |
| **Custom roles** | Custom role creation with granular permissions | Flexibility |
| **Invitation flow** | Email invitation with role assignment | Onboarding |
| **Activity tracking** | Track who did what across team | Accountability |
| **Permission inheritance** | Roles inherit permissions, individuals can override | Flexibility |

### 15.8 Team Management

#### 15.8.1 Architecture Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Team roster** | List all team members with roles | Overview |
| **Activity feed** | Team activity timeline | Awareness |
| **Performance metrics** | Per-member productivity metrics | Management |
| **Access logs** | Track team member access patterns | Security |
| **Role management** | Assign, modify, revoke roles | Control |

### 15.9 Inventory Forecasting

#### 15.9.1 Architecture Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Demand prediction** | AI-based demand forecasting | Planning |
| **Reorder points** | Automatic reorder point calculation | Automation |
| **Seasonal trends** | Seasonal demand pattern recognition | Strategy |
| **Supplier integration** | Direct supplier ordering | Efficiency |
| **Stock optimization** | Optimal stock level recommendations | Cost reduction |

### 15.10 Mobile App Readiness

#### 15.10.1 Architecture Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **PWA support** | Progressive Web App capabilities | App-like experience |
| **Offline mode** | Basic functionality without network | Reliability |
| **Push notifications** | Web push for order updates | Engagement |
| **Camera integration** | Product photo capture from camera | Content creation |
| **Biometric auth** | Fingerprint/face recognition | Security + convenience |
| **Deep linking** | Universal links for shareable URLs | Sharing |

#### 15.10.2 Mobile App Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **PWA first** | Build PWA before native app | Investment protection |
| **Offline critical data** | Cache orders, products for offline view | Reliability |
| **Background sync** | Sync data when network available | Data freshness |
| **Battery awareness** | Reduce activity when battery low | User experience |
| **Data usage** | Minimize data transfer on mobile networks | Cost |

---

## 16. Mandatory Rules for AI Agents

### 16.1 What

Non-negotiable rules that every AI agent must follow when working on the Shop Owner Dashboard.

### 16.2 Why

- **Consistency:** Every agent produces compatible code
- **Quality:** No shortcuts that compromise the architecture
- **Security:** No compromises on security rules
- **Maintainability:** Code must be maintainable by human developers

### 16.3 Rules

| Rule | Standard | Consequence |
|------|----------|-------------|
| **Customers never access shop dashboard** | `/shop/*` routes require `shop_owner` role | Security violation |
| **Shop Owners never see other shops** | All data scoped to authenticated shop | Privacy violation |
| **Every action is auditable** | Audit log for all state changes | Compliance violation |
| **Mobile-first always** | Design mobile, then enhance for desktop | UX violation |
| **No hardcoded commission rates** | Use configurable settings from database | Business violation |
| **No financial records deleted** | Append-only financial records | Compliance violation |
| **No SKU changes after creation** | SKUs are immutable after creation | Data integrity violation |
| **No stock below zero** | Enforce non-negative stock constraint | Business violation |
| **No concurrent stock corruption** | Use database transactions for stock updates | Data integrity violation |
| **No secrets in code** | Use environment variables for all secrets | Security violation |
| **No console.log in production** | Use Pino logger for all logging | Code quality violation |
| **No default exports** | Named exports only per ARCHITECTURE.md | Code quality violation |
| **No comments unless asked** | Code must be self-documenting | Code quality violation |
| **No barrel files** | Direct imports only, except `shared/ui/index.ts` | Performance violation |
| **Feature isolation** | No cross-feature imports | Architecture violation |
| **TypeScript strict mode** | No `any`, no `as never`, no type assertions | Type safety violation |
| **Test critical paths** | Test order processing, payment, settlement | Quality violation |
| **Responsive always** | Every component works on mobile, tablet, desktop | UX violation |
| **Accessible always** | WCAG 2.2 AA compliance | Compliance violation |
| **Performance budgets** | Lazy load, virtual scroll, optimized queries | Performance violation |

### 16.4 Compatibility Requirements

| Requirement | Standard | Rationale |
|-------------|----------|-----------|
| **ARCHITECTURE.md compliance** | Follow all conventions in ARCHITECTURE.md v3.0 | Consistency |
| **IAM compliance** | Follow all identity/access rules in IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md | Security |
| **Product Engine compliance** | Follow all product rules in PRODUCT_ENGINE_ARCHITECTURE.md | Product integrity |
| **Order Engine compliance** | Follow all order rules in ORDER_MANAGEMENT_ARCHITECTURE.md | Order integrity |
| **Finance Engine compliance** | Follow all finance rules in FINANCE_ENGINE_ARCHITECTURE.md | Financial integrity |
| **Inventory compliance** | Follow all inventory rules in VARIANT_INVENTORY_ENGINE_ARCHITECTURE.md | Inventory integrity |
| **Admin Dashboard independence** | Shop Dashboard is independent from Admin Dashboard | Separation of concerns |
| **Design System compliance** | Use design tokens from DESIGN_SYSTEM_ARCHITECTURE.md | Visual consistency |
| **Component Library compliance** | Use components from COMPONENT_LIBRARY_ARCHITECTURE.md | Component consistency |
| **UX compliance** | Follow UX patterns from UX_ARCHITECTURE.md | UX consistency |
| **Responsive compliance** | Follow responsive rules from RESPONSIVE_LAYOUT_ARCHITECTURE.md | Layout consistency |
| **Navigation compliance** | Follow navigation patterns from NAVIGATION_ARCHITECTURE.md | Navigation consistency |

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Document** | Shop Owner Dashboard & Workspace Architecture Standard |
| **Version** | 1.0 |
| **Date** | August 03, 2026 |
| **Author** | Nabome Architecture Team |
| **Status** | Active |
| **Priority** | Highest — All AI agents must follow this document |
| **Scope** | Complete Shop Owner Dashboard architecture |
| **Compatibility** | Complements all existing Nabome architecture documents |
| **Review cycle** | Quarterly or on major feature release |
