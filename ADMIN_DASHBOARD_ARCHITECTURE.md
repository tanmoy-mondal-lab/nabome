# নবME (Nabome) — Admin Dashboard Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for admin dashboard architecture, management interfaces, analytics, permissions, global controls, productivity features, and administration standards  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DESIGN_SYSTEM_ARCHITECTURE.md (v1.0), RESPONSIVE_LAYOUT_ARCHITECTURE.md (v1.0), COMPONENT_LIBRARY_ARCHITECTURE.md (v1.0), UX_ARCHITECTURE.md (v1.0), NAVIGATION_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0), FINANCE_ENGINE_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), CMS_ENGINE_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Dashboard Foundation](#1-dashboard-foundation)
2. [Global Dashboard](#2-global-dashboard)
3. [Module Navigation](#3-module-navigation)
4. [Management Workspace](#4-management-workspace)
5. [Global Search](#5-global-search)
6. [Productivity](#6-productivity)
7. [Permissions](#7-permissions)
8. [Reporting](#8-reporting)
9. [System Management](#9-system-management)
10. [Responsive UX](#10-responsive-ux)
11. [Performance](#11-performance)
12. [Security](#12-security)
13. [Accessibility](#13-accessibility)
14. [Future Readiness](#14-future-readiness)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Dashboard Foundation

### 1.1 What

The foundational architecture that governs the entire admin dashboard — how the workspace is organized, how information is prioritized, how modules remain isolated, and how productivity is maximized for platform administrators.

### 1.2 Why

- **Operational efficiency:** Admins manage the entire platform from one unified workspace — every design decision must reduce time-to-task.
- **Enterprise-grade reliability:** The dashboard is the command center — errors here have cascading business impact.
- **Consistency:** Every module follows the same UX patterns — admins learn once, apply everywhere.
- **Scalability:** New modules, new data types, new workflows fit the existing architecture without redesign.
- **Security:** Admin actions have elevated consequences — every action must be auditable, reversible where possible, and permission-gated.

### 1.3 Where

Every screen, component, and interaction within the `/admin` route space — all files under `src/features/admin/`.

### 1.4 Dashboard Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Command center mindset** | Admins orchestrate the entire platform from this workspace | One place for everything |
| **Information density over decoration** | Every pixel serves a purpose — data, action, or navigation | Enterprise productivity |
| **Progressive disclosure** | Show summary first, details on demand | Prevent cognitive overload |
| **Keyboard-first** | Every action accessible via keyboard shortcuts | Power user productivity |
| **Audit by default** | Every admin action logged and traceable | Security and compliance |
| **Module isolation** | Each management module is an independent feature | Prevents coupling, enables parallel development |
| **Mobile administration** | Full admin capability on mobile devices | Anywhere management |
| **Real-time awareness** | Dashboard reflects current system state | Operational awareness |

### 1.5 Dashboard DNA

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD DNA                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    SHOPIFY                                 │   │
│  │  • Clean, sidebar-based admin layout                      │   │
│  │  • Data-dense tables with inline actions                  │   │
│  │  • Quick actions and bulk operations                      │   │
│  │  • Mobile admin app                                       │   │
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
│  │  • Premium aesthetic carried into admin                    │   │
│  │  • Mobile-first administration                            │   │
│  │  • Enterprise-grade with beginner friendliness            │   │
│  │  • Consistent with storefront design language             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Workspace Organization

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN WORKSPACE ORGANIZATION                    │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    LAYER 1: SHELL                          │   │
│  │                                                           │   │
│  │  Sidebar │ Top Bar │ Main Content Area                     │   │
│  │  (nav)   │ (search,│ (scrollable)                          │   │
│  │          │ alerts, │                                       │   │
│  │          │ profile)│                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    LAYER 2: MODULES                        │   │
│  │                                                           │   │
│  │  Dashboard │ Products │ Orders │ Customers │ Settings │   │   │
│  │  (overview)│ (CRUD)   │ (CRUD) │ (CRUD)    │ (config) │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    LAYER 3: WORKSPACES                     │   │
│  │                                                           │   │
│  │  Tables │ Forms │ Detail Views │ Reports │ Bulk Actions   │   │
│  │  (data) │ (edit)│ (single)     │ (charts)│ (operations)  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    LAYER 4: OVERLAYS                       │   │
│  │                                                           │   │
│  │  Dialogs │ Side Panels │ Context Menus │ Toasts │ modals  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.7 Information Hierarchy

| Level | Purpose | Examples |
|-------|---------|----------|
| **Level 1: At-a-glance** | Current state in one look | KPI cards, status indicators, notification badges |
| **Level 2: Summary** | Trends and patterns | Charts, tables with key columns, activity feeds |
| **Level 3: Detail** | Deep investigation | Full tables with all columns, detail pages, reports |
| **Level 4: Action** | Execute operations | Forms, bulk actions, confirmations, workflows |

### 1.8 Productivity Principles

| Principle | Implementation | Rationale |
|-----------|---------------|-----------|
| **3-click rule** | Any admin action reachable in 3 clicks max | Efficiency |
| **One primary action per page** | Clear CTAs, no competing primaries | Focus |
| **Context preservation** | Sidebar state, filter state, scroll position preserved | Workflow continuity |
| **Quick create** | Floating action button for common creates | Speed |
| **Bulk operations** | Select multiple, act once | Scale |
| **Keyboard shortcuts** | Cmd+K for search, shortcuts for common actions | Power users |
| **Saved views** | Persistent filter/sort configurations | Repeated tasks |
| **Undo over confirm** | Allow recovery instead of blocking confirmations | Speed + safety |

### 1.9 Navigation Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN NAVIGATION HIERARCHY                      │
│                                                                  │
│  Level 1: SIDEBAR (Persistent)                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Dashboard │ Products │ Orders │ Customers │ ... │ Settings│   │
│  │  → Always visible, always accessible                      │   │
│  │  → Collapsible on desktop, drawer on mobile               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Level 2: MODULE TABS (Contextual)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Products: All │ Active │ Draft │ Archived                 │   │
│  │  Orders: All │ Pending │ Processing │ Shipped │ Delivered  │   │
│  │  → Horizontal tabs within module                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Level 3: BREADCRUMBS (Orientation)                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Admin > Products > Edit Product: "Cotton Tee"             │   │
│  │  → Always shows current location                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  Level 4: ACTION MENU (Contextual)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Table row actions: Edit │ Duplicate │ Archive │ Delete    │   │
│  │  → Context-sensitive, permission-gated                    │   │
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
| **Feature-first** | Each admin module in `src/features/admin/{module}/` | Co-location per ARCHITECTURE.md |
| **No cross-module imports** | Modules cannot import from each other | Prevents coupling |
| **Shared via lib/** | Common admin utilities in `src/features/admin/shared/` | DRY without coupling |
| **Independent data fetching** | Each module owns its API calls | Independent caching |
| **Independent routing** | Each module defines its own routes | Independent loading |
| **Shared components only** | Use `src/shared/ui/` for UI primitives | Design system consistency |

### 1.12 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Monolithic admin component | Unmaintainable, untestable | Feature-first modules |
| Cross-module state sharing | Tight coupling | Independent module state |
| Duplicated management interfaces | Inconsistent UX | Unified management patterns |
| Hardcoded workflows | Cannot adapt to business changes | Configurable workflows |
| Desktop-only admin | 70%+ mobile traffic for admins too | Mobile-first admin |
| No audit logging | Security blind spots | Every action auditable |
| Overloaded pages | Cognitive overload | Progressive disclosure |

---

## 2. Global Dashboard

### 2.1 What

The overview dashboard that provides at-a-glance visibility into platform health, business metrics, and operational status — the first screen admins see when entering the admin panel.

### 2.2 Why

- **Operational awareness:** Admins understand current platform state immediately
- **Priority identification:** Problems and opportunities surface instantly
- **Action orientation:** Quick actions reduce time-to-response
- **Context setting:** Sets the stage for focused work in specific modules

### 2.3 Where

`/admin` — the root admin route. `src/features/admin/dashboard/`.

### 2.4 Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR │  TOP BAR: Admin Dashboard    🔔 3  👤 Admin          │
│          ├───────────────────────────────────────────────────────┤
│  Dash    │                                                       │
│  Prods   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  Orders  │  │Revenue│ │Orders│ │Custs │ │Prods │               │
│  Custs   │  │₹1.2L │ │ 156  │ │  89  │ │ 234  │               │
│  Cats    │  │↑12%  │ │↑8%   │ │↑15%  │ │↑3%   │               │
│  CMS     │  └──────┘ └──────┘ └──────┘ └──────┘               │
│  Blogs   │                                                       │
│  Finance │  ┌─────────────────────┐ ┌─────────────────────┐     │
│  Reports │  │   Revenue Trend     │ │  Orders by Status   │     │
│  Settings│  │   (line chart)      │ │  (donut chart)      │     │
│          │  │                     │ │                     │     │
│          │  └─────────────────────┘ └─────────────────────┘     │
│          │                                                       │
│          │  ┌─────────────────────┐ ┌─────────────────────┐     │
│          │  │   Recent Orders     │ │  Activity Feed      │     │
│          │  │   (table, 5 rows)   │ │  (list, 10 items)   │     │
│          │  │                     │ │                     │     │
│          │  └─────────────────────┘ └─────────────────────┘     │
│          │                                                       │
│          │  ┌───────────────────────────────────────────────┐   │
│          │  │   Pending Tasks: 3 returns, 2 refunds, 5 low  │   │
│          │  │   stock alerts                                 │   │
│          │  └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 KPI Cards

| Metric | Format | Trend | Comparison | Icon |
|--------|--------|-------|------------|------|
| **Total Revenue** | ₹XX,XXX | Percentage change | vs. previous period | IndianRupee |
| **Total Orders** | XXX | Percentage change | vs. previous period | ShoppingCart |
| **Total Customers** | XXX | Percentage change | vs. previous period | Users |
| **Total Products** | XXX | Absolute count | — | Package |

**KPI Card Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Grid layout** | 2 columns mobile, 4 columns desktop | Responsive |
| **Value prominence** | Large, bold number (text-2xl font-semibold) | Quick scan |
| **Trend indicator** | Green arrow up / Red arrow down + percentage | Trend awareness |
| **Comparison period** | "vs. last 30 days" label below | Context |
| **Click to detail** | Click navigates to relevant module | Quick drill-down |
| **Loading state** | Skeleton matching card shape | Perceived performance |
| **Time range selector** | Today, 7 days, 30 days, 90 days, Custom | Flexibility |

### 2.6 Statistics Charts

| Chart | Type | Data | Purpose |
|-------|------|------|---------|
| **Revenue Trend** | Line chart | Daily revenue over time | Revenue trajectory |
| **Orders by Status** | Donut chart | Order status distribution | Operational health |
| **Top Products** | Horizontal bar chart | Top 10 products by revenue | Product performance |
| **Customer Growth** | Line chart | New customer registrations | Growth trajectory |

**Chart Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Responsive** | 1 column mobile, 2 columns desktop | Layout adaptation |
| **Loading state** | Chart skeleton during data fetch | Perceived performance |
| **Empty state** | "No data yet" with helpful message | Guidance |
| **Tooltip** | Show exact value on hover/tap | Precision |
| **Time range** | Synced with KPI time range selector | Consistency |
| **Export** | Chart export as image option (desktop) | Reporting |

### 2.7 Activity Feed

| Event | Icon | Description | Timestamp |
|-------|------|-------------|-----------|
| **New order** | ShoppingCart | "Order #1234 placed by Customer Name" | Relative time |
| **Payment received** | IndianRupee | "Payment of ₹1,234 received for Order #1234" | Relative time |
| **Refund processed** | RotateCcw | "Refund of ₹567 processed for Order #1230" | Relative time |
| **New customer** | UserPlus | "New customer: john@email.com" | Relative time |
| **Product update** | Package | "Product 'Cotton Tee' stock updated" | Relative time |
| **Low stock alert** | AlertTriangle | "Product 'Silk Dress' below threshold" | Relative time |

**Activity Feed Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max items** | 10 most recent | Scannable |
| **Relative time** | "2 minutes ago", "1 hour ago" | Quick context |
| **Click to detail** | Click navigates to relevant entity | Quick drill-down |
| **Filter by type** | Filter by event category | Focused view |
| **Auto-refresh** | Update every 30 seconds | Real-time awareness |
| **Empty state** | "No recent activity" | Guidance |

### 2.8 Quick Actions

| Action | Icon | Permission | Shortcut |
|--------|------|------------|----------|
| **Create Product** | Plus | `product:create` | `Cmd+Shift+P` |
| **View Orders** | ShoppingCart | `order:read` | `Cmd+Shift+O` |
| **View Customers** | Users | `user:read` | `Cmd+Shift+C` |
| **Create Coupon** | Tag | `coupon:create` | `Cmd+Shift+D` |
| **View Reports** | BarChart3 | `analytics:read` | `Cmd+Shift+R` |

**Quick Actions Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Top-right of dashboard, below top bar | Discoverable |
| **Mobile** | Floating action button (bottom-right) | Thumb-friendly |
| **Permission-gated** | Only show actions user can perform | Security |
| **Keyboard shortcut** | Display shortcut next to action | Power users |
| **Icon + label** | Always show both | Clarity |
| **Max 5 actions** | Most common actions only | Focus |

### 2.9 Alerts

| Alert Type | Priority | Icon | Action |
|------------|----------|------|--------|
| **Low stock** | High | AlertTriangle | Navigate to product |
| **Failed payment** | High | XCircle | Navigate to order |
| **Pending returns** | Medium | RotateCcw | Navigate to returns |
| **Pending refunds** | Medium | AlertCircle | Navigate to refunds |
| **System maintenance** | Critical | Shield | View maintenance status |
| **Security event** | Critical | ShieldAlert | View audit logs |

**Alert Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Top of dashboard content, below KPIs | Visibility |
| **Auto-dismiss** | Dismiss after acknowledgment | Don't nag |
| **Badge count** | Show alert count in sidebar item | At-a-glance |
| **Priority color** | Red for critical, amber for high, blue for info | Severity |
| **Action required** | Always link to resolution page | Action-oriented |
| **Max visible** | 5 most critical, "View all" for more | Don't overwhelm |

### 2.10 Notifications

| Notification Type | Source | Persistence | Action |
|-------------------|--------|-------------|--------|
| **Order placed** | Webhook | 7 days | View order |
| **Payment received** | Webhook | 7 days | View order |
| **Refund requested** | Webhook | Until resolved | Handle refund |
| **Return request** | Webhook | Until resolved | Handle return |
| **Low stock** | Cron job | Until restocked | View product |
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

### 2.11 Recent Activity

| Section | Content | Max Items |
|---------|---------|-----------|
| **Recent Orders** | Table with order number, customer, amount, status | 5 |
| **Recent Customers** | Table with name, email, registration date | 5 |
| **Top Products** | Table with name, revenue, units sold | 5 |

### 2.12 Pending Tasks

| Task Type | Count Badge | Priority | Action |
|-----------|-------------|----------|--------|
| **Pending returns** | Number | High | Navigate to returns |
| **Pending refunds** | Number | High | Navigate to refunds |
| **Low stock alerts** | Number | Medium | Navigate to inventory |
| **Pending reviews** | Number | Low | Navigate to reviews |
| **Scheduled content** | Number | Low | Navigate to CMS |

### 2.13 System Status

| Status | Indicator | Meaning |
|--------|-----------|---------|
| **Operational** | Green dot | All systems running |
| **Degraded** | Amber dot | Some systems affected |
| **Down** | Red dot | Critical system failure |

**System Status Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Bottom of dashboard sidebar | Reference, not primary |
| **Update frequency** | Every 5 minutes | Near real-time |
| **Click for details** | Navigate to system status page | Deep investigation |
| **History** | Show status history for past 24 hours | Trend awareness |

---

## 3. Module Navigation

### 3.1 What

The complete navigation architecture for all admin modules — how modules are organized in the sidebar, how module routes are defined, how module states are managed, and how navigation between modules works.

### 3.2 Why

- **Discoverability:** Admins find modules instantly
- **Orientation:** Admins always know where they are
- **Efficiency:** Quick switching between modules
- **Scalability:** New modules fit the existing navigation pattern
- **Consistency:** Same navigation behavior across all modules

### 3.3 Where

`src/features/admin/layout/AdminSidebar.tsx`, `src/app/routes.tsx`.

### 3.4 Module Catalog

| Module | Route | Icon | Sidebar Group | Badge |
|--------|-------|------|---------------|-------|
| **Dashboard** | `/admin` | LayoutDashboard | — | — |
| **Products** | `/admin/products` | Package | Catalog | Product count |
| **Shop Products** | `/admin/shop-products` | Store | Catalog | — |
| **Orders** | `/admin/orders` | ShoppingCart | Operations | Pending count |
| **Shipping** | `/admin/shipping` | Truck | Operations | — |
| **Returns** | `/admin/returns` | RotateCcw | Operations | Pending count |
| **Refunds** | `/admin/refunds` | AlertCircle | Operations | Pending count |
| **Categories** | `/admin/categories` | FolderTree | Catalog | — |
| **Collections** | `/admin/collections` | Layers | Catalog | — |
| **Homepage Builder** | `/admin/homepage` | Layout | Content | — |
| **CMS** | `/admin/cms` | FileText | Content | Draft count |
| **Blogs** | `/admin/blogs` | PenTool | Content | Draft count |
| **Customers** | `/admin/customers` | Users | People | — |
| **Shop Owners** | `/admin/shop-owners` | Store | People | — |
| **Coupons** | `/admin/coupons` | Tag | Marketing | Active count |
| **Discounts** | `/admin/discounts` | Percent | Marketing | — |
| **Labels** | `/admin/labels` | Bookmark | Marketing | — |
| **Tags** | `/admin/tags` | Hash | Marketing | — |
| **Finance** | `/admin/finance` | IndianRupee | Finance | — |
| **Payments** | `/admin/payments` | CreditCard | Finance | Failed count |
| **Storage** | `/admin/storage` | HardDrive | System | — |
| **Notifications** | `/admin/notifications` | Bell | System | — |
| **Documents** | `/admin/documents` | File | System | — |
| **Reports** | `/admin/reports` | BarChart3 | Analytics | — |
| **Audit Logs** | `/admin/audit-logs` | Shield | Analytics | — |
| **Exports** | `/admin/exports` | Download | System | — |
| **Settings** | `/admin/settings` | Settings | System | — |

### 3.5 Sidebar Groupings

```
┌──────────────────────────────────────────┐
│  NABOME                                   │
│  ───────────────────────────────────────  │
│                                           │
│  ◉ Dashboard                             │
│                                           │
│  CATALOG                                  │
│  ├── 📦 Products                         │
│  ├── 🏪 Shop Products                    │
│  ├── 📂 Categories                       │
│  └── 📚 Collections                      │
│                                           │
│  OPERATIONS                               │
│  ├── 🛒 Orders           (3)             │
│  ├── 🚚 Shipping                         │
│  ├── ↩️ Returns          (2)             │
│  └── 💸 Refunds          (1)             │
│                                           │
│  CONTENT                                  │
│  ├── 🏠 Homepage Builder                 │
│  ├── 📝 CMS                (5 drafts)    │
│  └── ✍️ Blogs              (2 drafts)    │
│                                           │
│  PEOPLE                                   │
│  ├── 👥 Customers                        │
│  └── 🏪 Shop Owners                      │
│                                           │
│  MARKETING                                │
│  ├── 🏷️ Coupons          (12 active)     │
│  ├── 💰 Discounts                        │
│  ├── 📌 Labels                           │
│  └── #️⃣ Tags                             │
│                                           │
│  FINANCE                                  │
│  ├── 💵 Finance                          │
│  └── 💳 Payments                         │
│                                           │
│  ANALYTICS                                │
│  ├── 📊 Reports                          │
│  └── 🛡️ Audit Logs                      │
│                                           │
│  SYSTEM                                   │
│  ├── 💾 Storage                          │
│  ├── 🔔 Notifications                    │
│  ├── 📄 Documents                        │
│  ├── 📥 Exports                          │
│  └── ⚙️ Settings                        │
│                                           │
│  ───────────────────────────────────────  │
│  ● System Operational                    │
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
| **User info** | Bottom of sidebar: avatar, name, role | Identity awareness |

### 3.7 Module Route Structure

```
/admin                              → Dashboard overview
/admin/products                     → Product list
/admin/products/create              → Create product
/admin/products/:id                 → Product detail
/admin/products/:id/edit            → Edit product
/admin/orders                       → Order list
/admin/orders/:id                   → Order detail
/admin/customers                    → Customer list
/admin/customers/:id                → Customer detail
/admin/settings                     → Settings (tabbed)
/admin/settings/general             → General settings
/admin/settings/shipping            → Shipping settings
/admin/settings/payment             → Payment settings
/admin/settings/tax                 → Tax settings
/admin/settings/notifications       → Notification settings
```

### 3.8 Route Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Nested routes** | Use React Router nested routes | Layout preservation |
| **Lazy loading** | `React.lazy()` for each module | Performance |
| **Error boundaries** | Each module wrapped in ErrorBoundary | Resilience |
| **Loading states** | Skeleton loaders during route transitions | Perceived performance |
| **Back navigation** | Breadcrumbs + browser back | Orientation |
| **Deep linking** | Every admin page has a direct URL | Shareability |
| **404 handling** | "Page not found" with link to dashboard | Recovery |

---

## 4. Management Workspace

### 4.1 What

The standardized workspace patterns for all management operations — tables, forms, detail views, bulk actions, filters, search, sorting, pagination, and all interactive management interfaces.

### 4.2 Why

- **Consistency:** Every module uses the same workspace patterns
- **Learnability:** Learn one module, know all modules
- **Efficiency:** Standardized patterns reduce cognitive load
- **Maintainability:** Shared workspace components, not duplicated UI
- **Enterprise-grade:** Workspace patterns support scale operations

### 4.3 Where

All management modules under `/admin/*`. Shared workspace components in `src/features/admin/shared/`.

### 4.4 Tables

**Standard Table Structure:**

```
┌──────────────────────────────────────────────────────────────┐
│  Module Title                          [+ Create] [Bulk Actions] │
├──────────────────────────────────────────────────────────────┤
│  🔍 Search...    Filter ▼    Sort ▼    Columns ▼    Export ▼  │
├──────────────────────────────────────────────────────────────┤
│  ☐  │ Name      │ Status    │ Date      │ Amount  │ Actions  │
│─────┼───────────┼───────────┼───────────┼─────────┼──────────│
│  ☐  │ Product 1 │ Active    │ Jan 1     │ ₹1,234  │ ⋮ Edit   │
│  ☐  │ Product 2 │ Draft     │ Jan 2     │ ₹2,345  │ ⋮ Edit   │
│  ☐  │ Product 3 │ Archived  │ Jan 3     │ ₹3,456  │ ⋮ Edit   │
├──────────────────────────────────────────────────────────────┤
│  Showing 1-20 of 156          ← 1 2 3 ... 8 →              │
└──────────────────────────────────────────────────────────────┘
```

**Table Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Sticky header** | Table header fixed on scroll | Column context always visible |
| **Checkbox column** | First column, optional | Bulk selection |
| **Actions column** | Last column, context menu | Row-level operations |
| **Row click** | Click row to view detail | Quick drill-down |
| **Hover state** | Subtle background on hover | Interactivity feedback |
| **Sortable columns** | Click header to sort | Data organization |
| **Sort indicator** | Arrow up/down on sorted column | Sort direction clarity |
| **Empty state** | Illustration + message + CTA | Guidance |
| **Loading state** | Skeleton rows matching table shape | Perceived performance |
| **Responsive** | Horizontal scroll on mobile | Table integrity |
| **Row height** | 48px (compact) or 64px (comfortable) | Density option |
| **Stripe rows** | Alternating background (optional) | Readability |
| **Max rows** | 20 per page default, configurable | Performance |
| **Selection count** | "X items selected" above table | Bulk action context |

### 4.5 Forms

**Standard Form Structure:**

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Module          Create Product                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Basic Information                                    │     │
│  │                                                       │     │
│  │  Product Name *                                       │     │
│  │  ┌─────────────────────────────────────────────────┐ │     │
│  │  │ Enter product name                               │ │     │
│  │  └─────────────────────────────────────────────────┘ │     │
│  │                                                       │     │
│  │  Description                                         │     │
│  │  ┌─────────────────────────────────────────────────┐ │     │
│  │  │                                                  │ │     │
│  │  │  Rich text editor                                │ │     │
│  │  │                                                  │ │     │
│  │  └─────────────────────────────────────────────────┘ │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Pricing                                              │     │
│  │                                                       │     │
│  │  Base Price *        Compare at Price                 │     │
│  │  ┌──────────────┐   ┌──────────────┐                 │     │
│  │  │ ₹ 1,234      │   │ ₹ 1,500      │                 │     │
│  │  └──────────────┘   └──────────────┘                 │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Images                                               │     │
│  │                                                       │     │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                │     │
│  │  │  +   │ │      │ │      │ │      │                │     │
│  │  │ Add  │ │  img │ │  img │ │  img │                │     │
│  │  └──────┘ └──────┘ └──────┘ └──────┘                │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  ┌──────────┐  ┌──────────┐                          │     │
│  │  │  Cancel  │  │  Save    │                          │     │
│  │  └──────────┘  └──────────┘                          │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

**Form Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Labels always visible** | Not floating, not placeholder-only | Accessibility per DESIGN_SYSTEM_ARCHITECTURE.md |
| **Required indicator** | Asterisk after label | Clarity |
| **Inline validation** | Validate on blur | Immediate feedback |
| **Error placement** | Below input, red text | Clear association |
| **Section grouping** | Related fields grouped with headers | Organization |
| **Sticky save** | Save button fixed at bottom on scroll | Always accessible |
| **Auto-save** | Draft auto-saved every 30 seconds | Data protection |
| **Unsaved changes** | Warn on navigation if unsaved | Data protection |
| **Keyboard submit** | Cmd+Enter to save | Power users |
| **Cancel** | "Cancel" link, not button | Secondary action |
| **Success redirect** | Redirect to list after create, stay on edit after update | Workflow |
| **Toast feedback** | "Product created successfully" | Confirmation |
| **Max width** | 720px for forms | Readable line length |

### 4.6 Detail Pages

**Standard Detail Page Structure:**

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Products    Product: Cotton Tee    [Edit] [⋮]     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  │
│  │  Images                   │  │  Basic Info               │  │
│  │  ┌──────┐ ┌──────┐       │  │                           │  │
│  │  │      │ │      │       │  │  Name: Cotton Tee         │  │
│  │  │ img  │ │ img  │       │  │  SKU: CT-001              │  │
│  │  └──────┘ └──────┘       │  │  Status: Active           │  │
│  │  ┌──────┐ ┌──────┐       │  │  Category: T-Shirts       │  │
│  │  │      │ │      │       │  │  Created: Jan 1, 2026     │  │
│  │  │ img  │ │ img  │       │  │  Updated: Jan 15, 2026    │  │
│  │  └──────┘ └──────┘       │  │                           │  │
│  └──────────────────────────┘  └──────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  Tabs: Overview │ Variants │ Inventory │ SEO │ Reviews    │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │                                                           │ │
│  │  Tab content here                                         │ │
│  │                                                           │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

**Detail Page Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Back link** | Always visible, goes to list | Navigation |
| **Title** | Entity name prominently displayed | Identification |
| **Edit button** | Primary action, top-right | Quick action |
| **Action menu** | Secondary actions in dropdown | Space efficiency |
| **Two-column layout** | Content + sidebar (desktop) | Information density |
| **Single-column** | Stacked on mobile | Responsive |
| **Tabs** | Organize related data | Progressive disclosure |
| **Metadata** | Created/updated timestamps, actor | Audit trail |
| **Status badge** | Visual status indicator | Quick scan |

### 4.7 Bulk Actions

**Bulk Action Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Selection** | Checkbox column in table | Multi-select |
| **Select all** | Header checkbox (selects current page) | Efficiency |
| **Selection bar** | "X items selected" bar appears above table | Context |
| **Available actions** | Based on selection and permissions | Security |
| **Confirmation** | Confirmation dialog for destructive actions | Safety |
| **Progress** | Show progress for bulk operations | Feedback |
| **Results** | Show success/failure count | Transparency |
| **Undo** | Undo option in toast for 5 seconds | Recovery |
| **Max selection** | 100 items per bulk action | Performance |

**Standard Bulk Actions:**

| Action | Available For | Confirmation Required |
|--------|--------------|----------------------|
| **Delete** | Products, Categories, Coupons | Yes |
| **Archive** | Products, Orders | Yes |
| **Activate** | Products, Coupons, Discounts | No |
| **Deactivate** | Products, Coupons, Discounts | No |
| **Export** | All list views | No |
| **Update status** | Orders | Yes |
| **Add tag** | Products, Customers | No |
| **Remove tag** | Products, Customers | No |

### 4.8 Filters

**Standard Filter Patterns:**

| Filter Type | Usage | Implementation |
|-------------|-------|----------------|
| **Status dropdown** | Filter by status (Active/Draft/Archived) | Select component |
| **Date range** | Filter by creation date | DatePicker range |
| **Category** | Filter by category | MultiSelect |
| **Price range** | Filter by price | Slider or dual input |
| **Search** | Text search within module | SearchInput |
| **Tag** | Filter by tags | MultiSelect |
| **Quick filters** | Predefined filter combinations | Button group |

**Filter Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Active filters** | Show as chips above table | Visibility |
| **Remove filter** | Click X on chip to remove | Easy removal |
| **Clear all** | "Clear filters" link | Bulk removal |
| **Filter count** | Show "X filters applied" | Awareness |
| **URL state** | Filters reflected in URL params | Shareable, bookmarkable |
| **Reset** | "Reset filters" option | Quick reset |
| **Mobile** | Bottom sheet filters | Touch-friendly |
| **Sticky** | Filter bar sticky below top bar on scroll | Always accessible |

### 4.9 Search

**Module Search Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Placement** | Top of module content area | Discoverable |
| **Debounce** | 300ms before API call | Performance |
| **Placeholder** | "Search {module}..." | Context |
| **Clear button** | X button when has value | Ease |
| **Keyboard** | Enter to search, Escape to clear | Power users |
| **Results** | Filter table rows in real-time | Instant feedback |
| **No results** | "No {module} found matching '{query}'" | Guidance |

### 4.10 Sorting

**Sorting Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default sort** | Newest first (createdAt desc) | Most relevant |
| **Sortable columns** | Click header to sort | User control |
| **Sort indicator** | Arrow icon on sorted column | Direction clarity |
| **Multi-sort** | Hold Shift + click for secondary sort | Power users |
| **Sort persistence** | Saved in URL params | Shareable |
| **Reset sort** | "Reset sort" option | Quick reset |

### 4.11 Pagination

**Pagination Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default per page** | 20 items | Performance |
| **Options** | 20, 50, 100 per page | User control |
| **Position** | Below table, right-aligned | Standard |
| **Page info** | "Showing 1-20 of 156" | Context |
| **First/Last** | First and last page buttons | Efficiency |
| **Previous/Next** | Always available (disabled when N/A) | Navigation |
| **Keyboard** | Arrow keys for page navigation | Power users |
| **URL state** | Page number in URL params | Shareable, bookmarkable |
| **Scroll to top** | Auto-scroll to top on page change | Orientation |

### 4.12 Side Panels

**Side Panel Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Click action button in table row | Contextual |
| **Width** | 480px (desktop), full-width (mobile) | Responsive |
| **Position** | Right side, sliding in | Standard |
| **Close** | X button, click outside, Escape | Multiple paths |
| **Content** | Quick preview or edit form | Efficiency |
| **Z-index** | `z-modal` (200) | Above content |
| **Animation** | Slide in from right, 300ms | Smooth |
| **Focus trap** | Keyboard stays within panel | Accessibility |
| **Scroll** | Panel content scrolls independently | Many fields |

### 4.13 Dialogs

**Dialog Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **One at a time** | No stacked dialogs | Prevent confusion |
| **ESC to close** | Always | User control |
| **Click outside** | Close (optional, configurable) | User control |
| **Focus trap** | Keyboard stays inside | Accessibility |
| **Return focus** | Focus trigger on close | Accessibility |
| **Backdrop** | Semi-transparent black | Visual separation |
| **Animation** | Scale up + fade in, 150ms | Smooth |
| **Max height** | 90vh | Prevent overflow |
| **Sizes** | sm (400px), md (560px), lg (720px), full | Flexibility |

**Standard Dialogs:**

| Dialog | Size | Usage |
|--------|------|-------|
| **Confirm delete** | sm | "Are you sure you want to delete X?" |
| **Confirm status change** | sm | "Change status from X to Y?" |
| **Quick edit** | md | Inline edit form |
| **Bulk action confirm** | sm | "Apply X to Y items?" |
| **Export options** | md | Configure export format |
| **Filter panel** | lg | Advanced filter options |

### 4.14 Context Menus

**Context Menu Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Three-dot icon (⋮) in table row | Standard |
| **Position** | Below trigger, right-aligned | Standard |
| **Items** | Context-specific actions only | Relevance |
| **Icons** | Optional, left-aligned | Visual clarity |
| **Dividers** | Separate destructive from non-destructive | Safety |
| **Danger items** | Red text for delete/archive | Warning |
| **Disabled items** | Grayed out with tooltip | Permission awareness |
| **Close** | Click outside, Escape, navigate away | Multiple paths |
| **Keyboard** | Arrow keys, Enter, Escape | Accessibility |

### 4.15 Action Menus

**Action Menu Patterns:**

| Pattern | Usage | Example |
|---------|-------|---------|
| **Row action** | Actions for specific table row | Edit, Duplicate, Archive, Delete |
| **Page action** | Actions for current page/module | Create, Export, Bulk Edit |
| **Detail action** | Actions for current detail view | Edit, Delete, Status Change |
| **Header action** | Global admin actions | Quick Create, Search, Notifications |

---

## 5. Global Search

### 5.1 What

The universal search system that enables admins to find any entity across all modules — products, customers, orders, finances, documents, and audit logs — from a single search interface.

### 5.2 Why

- **Efficiency:** Find any entity without navigating to specific modules
- **Discoverability:** Find related entities across modules
- **Power:** Keyboard-driven search for rapid access
- **Context:** Search results show module context for orientation

### 5.3 Where

Top bar search input, Command palette (Cmd+K). `src/features/admin/shared/components/AdminSearch.tsx`.

### 5.4 Search Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN GLOBAL SEARCH                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TRIGGER                                                   │   │
│  │  • Top bar search input (always visible)                   │   │
│  │  • Keyboard shortcut: Cmd+K (Mac) / Ctrl+K (Windows)      │   │
│  │  • Command palette overlay                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SEARCH INPUT                                              │   │
│  │  • Auto-focus on activation                                │   │
│  │  • Placeholder: "Search products, orders, customers..."    │   │
│  │  • Clear button (X) when has value                         │   │
│  │  • Debounce: 200ms                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RESULTS                                                   │   │
│  │  • Grouped by module: Products, Orders, Customers, etc.    │   │
│  │  • Max 5 results per module group                          │   │
│  │  • Entity name, status, key metadata                       │   │
│  │  • Click to navigate to entity                             │   │
│  │  • "See all results in {module}" link                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  QUICK ACTIONS                                             │   │
│  │  • Below search results                                    │   │
│  │  • "Create Product", "View Orders", etc.                   │   │
│  │  • Permission-gated                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Search Scope

| Module | Searchable Fields | Result Format |
|--------|-------------------|---------------|
| **Products** | Name, SKU, description, tags | Product card (image, name, price, status) |
| **Customers** | Name, email, phone | Profile card (avatar, name, email, order count) |
| **Orders** | Order number, customer name, email | Order card (number, customer, amount, status) |
| **Shop Owners** | Shop name, owner name, email | Shop card (name, owner, product count) |
| **Coupons** | Code, description | Coupon card (code, discount, expiry, status) |
| **Finance** | Transaction ID, reference | Transaction card (ID, amount, type, date) |
| **Documents** | Title, content | Document card (title, type, date) |
| **Audit Logs** | Actor, action, resource | Log card (actor, action, resource, timestamp) |

### 5.6 Search Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Debounce** | 200ms before API call | Performance |
| **Min query** | 2 characters | Prevent noise |
| **Max results** | 5 per module, 20 total | Scannable |
| **Recent searches** | Store last 10 in localStorage | Convenience |
| **Keyboard** | Cmd+K to open, arrows to navigate, Enter to select, Escape to close | Power users |
| **Result grouping** | Grouped by module with section headers | Organization |
| **Result preview** | Key metadata in result card | Context |
| **Click to navigate** | Click result navigates to entity detail | Quick access |
| **Permission-gated** | Only show results user has access to | Security |
| **Highlight** | Bold matching text in results | Visual feedback |
| **Loading state** | Spinner during search | Feedback |
| **Empty state** | "No results found. Try a different search term." | Guidance |
| **Analytics** | Track search queries for UX improvement | Business intelligence |

---

## 6. Productivity

### 6.1 What

The productivity features that maximize admin efficiency — quick create, quick edit, bulk operations, saved filters, keyboard shortcuts, favorites, recent items, and draft recovery.

### 6.2 Why

- **Speed:** Reduce time-to-action for common tasks
- **Efficiency:** Minimize clicks and navigation
- **Workflow continuity:** Preserve state across sessions
- **Power user support:** Keyboard shortcuts for rapid operations
- **Error prevention:** Auto-save and draft recovery

### 6.3 Where

Global admin features across all modules. `src/features/admin/shared/`.

### 6.4 Quick Create

**Quick Create Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Floating action button (mobile) / Quick actions dropdown (desktop) | Discoverable |
| **Available creates** | Product, Category, Coupon, Blog Post, Page | Common actions |
| **Permission-gated** | Only show creates user has permission for | Security |
| **Dialog-based** | Quick create in dialog, not full page | Speed |
| **Minimal fields** | Only required fields in quick create | Speed |
| **"Open full form"** | Link to full create form for advanced options | Flexibility |
| **Success redirect** | Navigate to created entity after success | Verification |

### 6.5 Quick Edit

**Quick Edit Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Trigger** | Double-click table row, or "Quick Edit" in context menu | Discoverable |
| **Side panel** | Opens in side panel, not full page | Context preservation |
| **Editable fields** | Status, price, stock, featured flag | Common changes |
| **Auto-save** | Save on field blur | Speed |
| **Undo** | Toast with undo option for 5 seconds | Recovery |
| **Keyboard** | Cmd+Enter to save, Escape to cancel | Power users |

### 6.6 Bulk Operations

**Bulk Operation Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    BULK OPERATION FLOW                            │
│                                                                  │
│  1. SELECT                                                       │
│     → Checkbox column in table                                   │
│     → "Select all" checkbox in header                            │
│     → Selection count displayed                                  │
│                                                                  │
│  2. CHOOSE ACTION                                                │
│     → Bulk action bar appears above table                        │
│     → Dropdown with available actions                            │
│     → Actions filtered by permissions                            │
│                                                                  │
│  3. CONFIRM                                                      │
│     → Confirmation dialog for destructive actions                │
│     → Show affected item count                                   │
│     → Show sample of affected items                              │
│                                                                  │
│  4. EXECUTE                                                      │
│     → Progress indicator during execution                        │
│     → Can cancel if taking too long                              │
│     → Results shown after completion                             │
│                                                                  │
│  5. RESULT                                                       │
│     → Success count + failure count                              │
│     → Download failure report if any failures                    │
│     → Undo option for 5 seconds                                  │
│     → Table refreshes with updated data                          │
└─────────────────────────────────────────────────────────────────┘
```

### 6.7 Saved Filters

**Saved Filter Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Save current filters** | "Save filter" button when filters applied | Efficiency |
| **Name filter** | User provides a name for the filter | Identification |
| **Access saved filters** | Dropdown above table | Quick access |
| **Default filter** | Option to set as default view | Workflow |
| **Share filter** | Option to share with team (future) | Collaboration |
| **Delete filter** | Option to delete saved filters | Management |
| **Max saved** | 20 saved filters per user | Performance |
| **URL sync** | Filter state in URL params | Shareable, bookmarkable |

### 6.8 Keyboard Shortcuts

**Global Shortcuts:**

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Cmd+K` / `Ctrl+K` | Open global search | Global |
| `Cmd+Shift+P` | Quick create product | Global |
| `Cmd+Shift+O` | Navigate to orders | Global |
| `Cmd+Shift+C` | Navigate to customers | Global |
| `Cmd+S` | Save current form | Form context |
| `Cmd+Enter` | Submit current form | Form context |
| `Escape` | Close dialog/panel/menu | Context |
| `?` | Show keyboard shortcuts help | Global |

**Module Shortcuts:**

| Shortcut | Action | Scope |
|----------|--------|-------|
| `R` | Refresh current list | List context |
| `N` | Create new entity | List context |
| `E` | Edit selected entity | Detail context |
| `D` | Delete selected entity | Detail context |
| `←` / `→` | Previous / Next item | Detail context |
| `1-9` | Switch between tabs | Tab context |

**Shortcut Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Help overlay** | Press `?` to show all shortcuts | Discoverability |
| **Conflict-free** | No conflicts with browser shortcuts | Reliability |
| **Context-aware** | Shortcuts change based on context | Relevance |
| **Disabled in forms** | Shortcuts disabled when typing in inputs | Prevent conflicts |
| **Mac/Windows** | Support both Cmd and Ctrl | Cross-platform |
| **Tooltips** | Show shortcut in tooltip on buttons | Discoverability |

### 6.9 Favorites

**Favorites Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Star icon** | Click star to favorite/unfavorite entity | Simple toggle |
| **Favorites section** | Dedicated section in sidebar or dashboard | Quick access |
| **Max favorites** | 50 per user | Performance |
| **Cross-module** | Favorites span all modules | Flexibility |
| **Persistent** | Saved in database, synced across devices | Continuity |
| **Quick access** | Favorites appear in global search results | Efficiency |

### 6.10 Recent Items

**Recent Items Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-track** | Automatically track viewed entities | Zero effort |
| **Max items** | 20 most recent per module | Performance |
| **Cross-module** | Recent items span all modules | Flexibility |
| **Time-based** | Sorted by most recently viewed | Relevance |
| **Quick access** | Recent items in sidebar or dashboard | Efficiency |
| **Clear** | Option to clear recent history | Privacy |
| **Persistent** | Saved in localStorage + database | Cross-device |

### 6.11 Draft Recovery

**Draft Recovery Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-save** | Forms auto-saved every 30 seconds | Data protection |
| **Draft indicator** | "Draft saved" indicator in form header | Awareness |
| **Recovery prompt** | "You have unsaved changes" on navigation | Prevention |
| **Draft list** | List of saved drafts in relevant module | Organization |
| **Expiry** | Drafts expire after 7 days | Cleanup |
| **Conflict resolution** | If another device saved, show conflict dialog | Data integrity |
| **Manual save** | Cmd+S to manually save draft | Power users |

---

## 7. Permissions

### 7.1 What

The admin permission architecture that defines what each admin role can see, create, edit, delete, export, and override across all admin modules.

### 7.2 Why

- **Security:** Admins only access what they need
- **Compliance:** Audit trail of permission assignments
- **Scalability:** New permissions added without restructuring
- **Clarity:** Clear what each role can do
- **Flexibility:** Permission groups for team organization

### 7.3 Where

`api/_lib/auth/middleware.ts`, `src/features/admin/shared/permissions.ts`.

### 7.4 Admin Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | Full platform access, no restrictions | All modules, all actions |
| **Admin** | Standard admin with full CRUD | All modules, standard actions |
| **Editor** | Content-focused admin | Content modules, read-only for operations |
| **Viewer** | Read-only access | All modules, no modifications |
| **Finance** | Finance-focused admin | Finance modules, read-only for others |

### 7.5 Permission Groups

| Group | Permissions | Modules |
|-------|-------------|---------|
| **Catalog** | `product:read`, `product:create`, `product:update`, `product:delete`, `category:*`, `collection:*` | Products, Categories, Collections |
| **Operations** | `order:read`, `order:update`, `shipping:*`, `return:*`, `refund:*` | Orders, Shipping, Returns, Refunds |
| **Content** | `cms:*`, `blog:*`, `homepage:*` | CMS, Blogs, Homepage Builder |
| **People** | `customer:read`, `customer:update`, `shop_owner:*` | Customers, Shop Owners |
| **Marketing** | `coupon:*`, `discount:*`, `label:*`, `tag:*` | Coupons, Discounts, Labels, Tags |
| **Finance** | `finance:read`, `payment:*`, `settlement:*` | Finance, Payments |
| **Analytics** | `report:read`, `audit:read` | Reports, Audit Logs |
| **System** | `settings:*`, `storage:*`, `notification:*`, `export:*` | Settings, Storage, Notifications, Exports |

### 7.6 Module Permissions

| Module | Read | Create | Edit | Delete | Export | Override |
|--------|------|--------|------|--------|--------|----------|
| **Products** | ✓ (all) | ✓ (permission) | ✓ (permission) | ✓ (permission) | ✓ (permission) | — |
| **Orders** | ✓ (all) | — | ✓ (status only) | ✗ | ✓ (permission) | — |
| **Customers** | ✓ (all) | ✗ | ✓ (limited) | ✗ | ✓ (permission) | — |
| **Categories** | ✓ (all) | ✓ (permission) | ✓ (permission) | ✓ (permission) | — | — |
| **Coupons** | ✓ (all) | ✓ (permission) | ✓ (permission) | ✓ (permission) | — | — |
| **Finance** | ✓ (permission) | ✗ | ✗ | ✗ | ✓ (permission) | — |
| **Settings** | ✓ (permission) | — | ✓ (super admin) | ✗ | — | ✓ (super admin) |
| **Audit Logs** | ✓ (permission) | ✗ | ✗ | ✗ | ✓ (permission) | — |

### 7.7 Feature Permissions

| Feature | Permission | Description |
|---------|------------|-------------|
| **Bulk delete** | `{module}:delete` | Delete multiple items |
| **Bulk export** | `{module}:read` + `export:create` | Export data |
| **Bulk update** | `{module}:update` | Update multiple items |
| **Override price** | `product:update` + `override:price` | Override calculated prices |
| **Override commission** | `finance:update` + `override:commission` | Override commission rates |
| **Manage admin** | `admin:create`, `admin:update`, `admin:delete` | Manage other admins |
| **View analytics** | `analytics:read` | View analytics dashboards |
| **View audit logs** | `audit:read` | View audit trail |
| **System settings** | `settings:update` | Modify system configuration |
| **Maintenance mode** | `settings:maintenance` | Toggle maintenance mode |

### 7.8 Permission Enforcement

**Frontend Enforcement:**

```typescript
// Permission check in component
const { hasPermission } = useAdminPermissions();

// Conditional rendering
{hasPermission('product:create') && (
  <Button onClick={handleCreate}>Create Product</Button>
)}

// Conditional actions
const actions = [
  { label: 'Edit', onClick: handleEdit, permission: 'product:update' },
  { label: 'Delete', onClick: handleDelete, permission: 'product:delete' },
].filter(action => !action.permission || hasPermission(action.permission));
```

**Backend Enforcement:**

```typescript
// Permission check in API handler
export async function updateProduct(request: Request, env: Env) {
  const user = await authenticate(request);
  authorize(user, 'product:update'); // Throws ForbiddenError if no permission
  
  // ... handler logic
}
```

### 7.9 Permission Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default deny** | No access unless explicitly granted | Security |
| **Least privilege** | Grant minimum required permissions | Security |
| **Role-based** | Permissions assigned via roles | Manageability |
| **Permission groups** | Organized by module for clarity | Organization |
| **Audit logging** | All permission checks logged | Compliance |
| **Frontend + Backend** | Enforce on both sides | Defense in depth |
| **Cache permissions** | Cache in Zustand store | Performance |
| **Refresh on role change** | Re-fetch permissions on role update | Consistency |

---

## 8. Reporting

### 8.1 What

The analytics and reporting architecture that provides data-driven insights across all business dimensions — dashboard analytics, business metrics, financial metrics, customer metrics, shop metrics, product metrics, and operational metrics.

### 8.2 Why

- **Data-driven decisions:** Insights drive business strategy
- **Performance tracking:** Monitor KPIs against targets
- **Trend identification:** Spot patterns before they become problems
- **Operational efficiency:** Identify bottlenecks and optimize
- **Compliance:** Financial and operational audit trails

### 8.3 Where

`/admin/reports`, `/admin/finance`. `src/features/admin/reports/`, `src/features/admin/finance/`.

### 8.4 Dashboard Analytics

| Metric | Visualization | Time Range | Drill-down |
|--------|---------------|------------|------------|
| **Revenue** | Line chart | Daily/Weekly/Monthly | → Finance details |
| **Orders** | Line chart + bar chart | Daily/Weekly/Monthly | → Orders list |
| **Customers** | Line chart | Daily/Weekly/Monthly | → Customers list |
| **Conversion rate** | Line chart | Daily/Weekly/Monthly | → Funnel analysis |
| **Average order value** | Line chart | Daily/Weekly/Monthly | → Order details |
| **Cart abandonment** | Funnel chart | Daily/Weekly/Monthly | → Cart analytics |

### 8.5 Business Metrics

| Metric | Description | Target | Alert |
|--------|-------------|--------|-------|
| **Revenue growth** | Month-over-month revenue change | +10% MoM | Alert if negative |
| **Order volume** | Total orders per period | Trending up | Alert if declining |
| **Customer acquisition** | New customers per period | Trending up | Alert if declining |
| **Customer retention** | Repeat customer rate | >30% | Alert if below 20% |
| **Average order value** | Average ₹ per order | Trending up | Alert if declining |
| **Return rate** | Returns / Orders | <5% | Alert if above 10% |

### 8.6 Financial Metrics

| Metric | Description | Source |
|--------|-------------|--------|
| **Total revenue** | Gross revenue from all orders | Order payments |
| **Net revenue** | Revenue minus refunds | Orders - Refunds |
| **Platform commission** | Total commission earned | Commission records |
| **Shop earnings** | Total shop owner earnings | Settlement records |
| **Pending settlements** | Amount pending payout | Settlement records |
| **Refund rate** | Refunds / Revenue | Refund records |
| **Tax collected** | Total GST collected | Tax records |

### 8.7 Customer Metrics

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Total customers** | Registered customers | KPI card |
| **New customers** | Customers registered in period | Line chart |
| **Active customers** | Customers with orders in period | Line chart |
| **Customer lifetime value** | Average revenue per customer | Distribution chart |
| **Customer segments** | Customers grouped by behavior | Bar chart |
| **Geographic distribution** | Customers by location | Map (future) |

### 8.8 Shop Metrics

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Total shops** | Registered shop owners | KPI card |
| **Active shops** | Shops with products listed | KPI card |
| **Shop performance** | Revenue per shop | Bar chart |
| **Top shops** | Shops by revenue | Ranked list |
| **Shop growth** | New shops per period | Line chart |

### 8.9 Product Metrics

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Total products** | Active products | KPI card |
| **Products sold** | Units sold in period | Line chart |
| **Top products** | Products by revenue | Ranked list |
| **Product views** | Page views per product | Bar chart |
| **Conversion rate** | Add-to-cart / Product views | Funnel |
| **Inventory turnover** | How fast stock sells | Line chart |

### 8.10 Operational Metrics

| Metric | Description | Visualization |
|--------|-------------|---------------|
| **Fulfillment time** | Average time from order to shipment | Line chart |
| **Shipping time** | Average delivery time | Line chart |
| **Return rate** | Returns per order | Line chart |
| **Customer satisfaction** | Review ratings | Distribution |
| **Support tickets** | Open tickets | KPI card |
| **System uptime** | Platform availability | Status indicator |

### 8.11 Reporting Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Date range selector** | All reports have configurable date range | Flexibility |
| **Comparison periods** | Compare with previous period | Trend awareness |
| **Export** | Export reports as CSV/PDF | Offline analysis |
| **Refresh** | Auto-refresh every 5 minutes | Real-time awareness |
| **Empty states** | "No data for selected period" | Guidance |
| **Loading states** | Skeleton charts during data fetch | Perceived performance |
| **Drill-down** | Click chart element to see details | Investigation |
| **Permission-gated** | Only users with `analytics:read` can access | Security |

---

## 9. System Management

### 9.1 What

The system administration architecture for global settings, feature toggles, configuration management, environment readiness, maintenance mode, and health monitoring.

### 9.2 Why

- **Operational control:** Admins manage platform behavior
- **Feature management:** Gradual rollouts and kill switches
- **Configuration:** Business rules without code changes
- **Reliability:** System health monitoring and maintenance
- **Security:** System-level security controls

### 9.3 Where

`/admin/settings`. `src/features/admin/settings/`.

### 9.4 Global Settings

| Setting Category | Settings | Access |
|------------------|----------|--------|
| **General** | Store name, logo, contact info, timezone | Super Admin |
| **Commerce** | Currency, tax rates, shipping zones | Admin |
| **Payment** | Razorpay config, payment methods | Super Admin |
| **Email** | Email templates, sender config | Admin |
| **Notifications** | Notification preferences, channels | Admin |
| **SEO** | Meta tags, sitemap, robots.txt | Admin |
| **Security** | Password policy, session settings, 2FA | Super Admin |
| **Legal** | Terms, privacy policy, refund policy | Admin |

### 9.5 Feature Toggles

| Feature | Toggle | Default | Description |
|---------|--------|---------|-------------|
| **Maintenance mode** | `MAINTENANCE_MODE` | false | Show maintenance page |
| **Guest checkout** | `GUEST_CHECKOUT_ENABLED` | true | Allow guest checkout |
| **Wishlist** | `WISHLIST_ENABLED` | true | Enable wishlist feature |
| **Reviews** | `REVIEWS_ENABLED` | true | Enable product reviews |
| **Blog** | `BLOG_ENABLED` | true | Enable blog section |
| **Multi-currency** | `MULTI_CURRENCY_ENABLED` | false | Enable multi-currency |
| **AI recommendations** | `AI_RECOMMENDATIONS_ENABLED` | false | Enable AI recommendations |

### 9.6 Configuration Management

**Configuration Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Admin-configurable** | Business rules editable via admin UI | No code changes needed |
| **Validation** | All config changes validated before save | Prevent invalid config |
| **Audit logging** | All config changes logged | Accountability |
| **Rollback** | Ability to revert to previous config | Recovery |
| **Environment-specific** | Config per environment (dev/staging/prod) | Flexibility |
| **Cache invalidation** | Config changes invalidate relevant caches | Consistency |

### 9.7 Environment Readiness

| Check | Status | Action |
|-------|--------|--------|
| **Database** | Connected / Disconnected | Alert if disconnected |
| **Storage** | Available / Unavailable | Alert if unavailable |
| **Email** | Configured / Not configured | Alert if not configured |
| **Payments** | Active / Inactive | Alert if inactive |
| **Cache** | Healthy / Degraded | Alert if degraded |

### 9.8 Maintenance Mode

**Maintenance Mode Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Toggle** | Super Admin only | Security |
| **Confirmation** | Confirmation dialog with consequences | Safety |
| **Message** | Customizable maintenance message | Communication |
| **Whitelist** | Admin IPs can bypass maintenance | Admin access |
| **Duration** | Scheduled start/end time | Planning |
| **Notification** | Email notification to team | Awareness |
| **Audit** | Log maintenance mode changes | Accountability |

### 9.9 Health Monitoring

| Component | Metric | Threshold | Alert |
|-----------|--------|-----------|-------|
| **API response time** | p95 latency | >500ms | Warning |
| **Error rate** | 5xx errors per minute | >10 | Critical |
| **Database** | Connection pool usage | >80% | Warning |
| **Cache hit rate** | KV cache hit ratio | <90% | Warning |
| **Storage** | R2 storage usage | >80% | Warning |
| **Email** | Send failure rate | >5% | Warning |

---

## 10. Responsive UX

### 10.1 What

The responsive design standards for the admin dashboard across all device sizes — mobile administration, tablet optimization, desktop productivity, and large screen layouts.

### 10.2 Why

- **Anywhere management:** Admins manage from any device
- **Touch-friendly:** Mobile admin must be fully functional
- **Productivity:** Desktop admin maximizes screen real estate
- **Consistency:** Same experience quality across all devices

### 10.3 Where

All admin components and layouts.

### 10.4 Mobile Dashboard

```
┌────────────────────────────────┐
│ ☰  Admin Dashboard    🔔 👤   │  ← Compact top bar
├────────────────────────────────┤
│                                │
│  ┌──────┐ ┌──────┐            │  ← 2-column KPI grid
│  │Rev   │ │Orders│            │
│  │₹1.2L │ │ 156  │            │
│  └──────┘ └──────┘            │
│  ┌──────┐ ┌──────┐            │
│  │Custs │ │Prods │            │
│  │  89  │ │ 234  │            │
│  └──────┘ └──────┘            │
│                                │
│  ┌────────────────────────┐   │  ← Charts stacked
│  │   Revenue Trend        │   │
│  │   (full width)         │   │
│  └────────────────────────┘   │
│                                │
│  ┌────────────────────────┐   │  ← Tables horizontal scroll
│  │   Recent Orders        │   │
│  │   (horizontal scroll)  │   │
│  └────────────────────────┘   │
│                                │
│  ┌────────────────────────┐   │  ← Activity feed
│  │   Activity Feed        │   │
│  └────────────────────────┘   │
│                                │
├────────────────────────────────┤
│  📊  📦  🛒  👥  ⚙️          │  ← Bottom action bar
└────────────────────────────────┘
```

**Mobile Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Sidebar** | Hidden, hamburger trigger | Space efficiency |
| **Top bar** | Compact: hamburger, title, notifications, avatar | Essential actions |
| **KPI grid** | 2 columns | Readable on small screens |
| **Charts** | Full width, stacked | Maximum readability |
| **Tables** | Horizontal scroll | Preserve table structure |
| **Forms** | Single column, full width | Thumb-friendly |
| **Dialogs** | Full screen or bottom sheet | Touch-friendly |
| **Bottom actions** | Fixed bottom bar for key actions | Thumb-zone |
| **Touch targets** | Minimum 44x44px | Accessibility |
| **Swipe gestures** | Swipe to delete/archive | Natural interaction |
| **Pull to refresh** | Pull down to refresh data | Mobile convention |

### 10.5 Tablet Dashboard

```
┌──────────────────────────────────────────────────────┐
│  ☰  Admin Dashboard              🔔 3  👤 Admin      │
├────────┬─────────────────────────────────────────────┤
│        │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  Dash  │  │Rev   │ │Orders│ │Custs │ │Prods │       │
│  Prods │  │₹1.2L │ │ 156  │ │  89  │ │ 234  │       │
│  Orders│  └──────┘ └──────┘ └──────┘ └──────┘       │
│  Custs │                                             │
│  Cats  │  ┌─────────────────┐ ┌─────────────────┐   │
│  CMS   │  │   Revenue Trend │ │  Orders Status  │   │
│  ...   │  └─────────────────┘ └─────────────────┘   │
│        │                                             │
│        │  ┌─────────────────────────────────────┐   │
│  64px  │  │   Recent Orders (full width)         │   │
│ collapsed│ └─────────────────────────────────────┘   │
└────────┴─────────────────────────────────────────────┘
```

**Tablet Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Sidebar** | Collapsed (icons only, 64px) | Space efficiency |
| **KPI grid** | 4 columns | Medium screen optimization |
| **Charts** | 2 columns | Balanced layout |
| **Tables** | Full width, no horizontal scroll | Better readability |
| **Forms** | 2-column where appropriate | Space efficiency |
| **Touch targets** | 44x44px minimum | Touch-friendly |

### 10.6 Desktop Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│  SIDEBAR │  TOP BAR: Admin Dashboard    🔔 3  👤 Admin           │
│  280px   ├───────────────────────────────────────────────────────┤
│          │                                                       │
│  Expanded│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  with    │  │Rev   │ │Orders│ │Custs │ │Prods │               │
│  labels  │  │₹1.2L │ │ 156  │ │  89  │ │ 234  │               │
│          │  └──────┘ └──────┘ └──────┘ └──────┘               │
│          │                                                       │
│          │  ┌─────────────────────┐ ┌─────────────────────┐     │
│          │  │   Revenue Trend     │ │  Orders Status      │     │
│          │  │   (line chart)      │ │  (donut chart)      │     │
│          │  └─────────────────────┘ └─────────────────────┘     │
│          │                                                       │
│          │  ┌─────────────────────┐ ┌─────────────────────┐     │
│          │  │   Recent Orders     │ │  Activity Feed      │     │
│          │  └─────────────────────┘ └─────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

### 10.7 Large Screens (1920px+)

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max content width** | 1440px, centered | Readable line length |
| **Sidebar** | Expanded (280px) | Full navigation |
| **KPI grid** | 4 columns | Full density |
| **Charts** | 2-3 columns | Maximum information |
| **Tables** | Full width with all columns | Complete data |
| **Side panels** | 480px, don't crowd content | Comfortable editing |

### 10.8 One-Hand Usage

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Primary actions** | Bottom of screen on mobile | Thumb-zone |
| **Navigation** | Bottom bar on mobile | Thumb-zone |
| **Destructive actions** | Bottom of dialogs on mobile | Prevent accidental taps |
| **Swipe actions** | Swipe left/right on table rows | Natural gesture |
| **Pull to refresh** | Pull down on lists | Natural gesture |
| **Long press** | Context menu on long press | Natural gesture |

### 10.9 Productivity Layouts

| Layout | Usage | Description |
|--------|-------|-------------|
| **Dashboard** | Overview | KPIs + Charts + Tables + Feed |
| **List** | Module browsing | Table with filters + pagination |
| **Detail** | Entity investigation | Two-column with tabs |
| **Form** | Entity creation/editing | Centered form with sections |
| **Split** | Compare/edit | List + detail side by side |
| **Full-screen** | Focus work | Hide sidebar, maximize content |

---

## 11. Performance

### 11.1 What

The performance architecture for the admin dashboard — handling large datasets, background loading, lazy rendering, real-time updates, efficient queries, and dashboard optimization.

### 11.2 Why

- **Responsiveness:** Admins expect instant feedback
- **Scale:** Dashboard must handle 100K+ products, orders, customers
- **Efficiency:** Background operations don't block UI
- **Real-time:** Dashboard reflects current state

### 11.3 Where

All admin components and data fetching.

### 11.4 Large Datasets

| Strategy | Implementation | Rationale |
|----------|---------------|-----------|
| **Virtual scrolling** | React Virtual for tables with 1000+ rows | DOM performance |
| **Pagination** | Offset-based pagination (20/50/100 per page) | Standard approach |
| **Infinite scroll** | For activity feeds, logs | Continuous browsing |
| **Lazy loading** | Load modules on demand | Initial load speed |
| **Code splitting** | `React.lazy()` per admin module | Bundle size |
| **Image lazy loading** | `loading="lazy"` on all images | Bandwidth savings |
| **Debounced search** | 200ms debounce on search inputs | API efficiency |

### 11.5 Background Loading

| Operation | Strategy | UI Feedback |
|-----------|----------|-------------|
| **Data fetching** | TanStack Query with stale-while-revalidate | Skeleton loaders |
| **Bulk operations** | Background API calls with progress | Progress bar |
| **Export generation** | Background job, notify when ready | Toast notification |
| **Report generation** | Background processing | "Generating..." indicator |
| **File uploads** | Chunked upload with progress | Progress bar |

### 11.6 Lazy Rendering

| Component | Strategy | Rationale |
|-----------|----------|-----------|
| **Charts** | Render only when visible (IntersectionObserver) | Performance |
| **Heavy tables** | Virtual scroll for 1000+ rows | DOM performance |
| **Modals** | Render on open, destroy on close | Memory efficiency |
| **Side panels** | Render on open, destroy on close | Memory efficiency |
| **Tab content** | Lazy load tab content on first view | Performance |
| **Maps** | Load map library on demand | Bundle size |

### 11.7 Real-time Updates

| Update Type | Strategy | Frequency |
|-------------|----------|-----------|
| **Dashboard KPIs** | Polling with TanStack Query | Every 30 seconds |
| **Order status** | WebSocket (future) / Polling | Every 10 seconds |
| **Inventory levels** | Polling | Every 60 seconds |
| **Notifications** | Polling | Every 30 seconds |
| **Activity feed** | Polling | Every 30 seconds |
| **System status** | Polling | Every 5 minutes |

### 11.8 Efficient Queries

| Strategy | Implementation | Rationale |
|----------|---------------|-----------|
| **Select only needed fields** | Prisma `select` for list views | Reduce data transfer |
| **Eager loading** | Prisma `include` for relations | Prevent N+1 |
| **Indexing** | Index on filter/sort columns | Query performance |
| **Cursor pagination** | For infinite scroll lists | Consistent pagination |
| **Server-side filtering** | Filter on database, not client | Performance |
| **Aggregate queries** | Use SQL aggregates for KPIs | Accuracy + performance |

### 11.9 Dashboard Optimization

| Metric | Target | Strategy |
|--------|--------|----------|
| **Initial load** | < 2 seconds | Code splitting, lazy loading |
| **Route transition** | < 300ms | Preloading, skeleton loaders |
| **Table render** | < 100ms for 100 rows | Virtual scrolling, memoization |
| **Search response** | < 500ms | Debouncing, indexing |
| **Chart render** | < 200ms | Data aggregation, lazy rendering |
| **Form submission** | < 1 second | Optimistic updates |

---

## 12. Security

### 12.1 What

The security architecture for the admin dashboard — admin authentication, permission enforcement, audit logging, sensitive actions, confirmation workflows, and session security.

### 12.2 Why

- **Elevated risk:** Admin actions have platform-wide consequences
- **Compliance:** Audit trails required for financial and legal compliance
- **Trust:** Customers and shop owners trust admin integrity
- **Accountability:** Every admin action must be attributable

### 12.3 Where

All admin components and API handlers.

### 12.4 Admin Authentication

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Login required** | All admin routes require authentication | Security |
| **Role verification** | Verify user has admin role on every request | Authorization |
| **Session validation** | Validate session on every request | Security |
| **IP logging** | Log IP address for all admin actions | Audit trail |
| **User agent logging** | Log device/browser for all admin actions | Audit trail |
| **Failed login alerts** | Email alert on failed admin login | Security monitoring |
| **Session timeout** | 30 minutes inactivity timeout | Security |
| **Max sessions** | 3 concurrent admin sessions | Security |

### 12.5 Permission Enforcement

| Layer | Standard | Rationale |
|-------|----------|-----------|
| **Frontend** | Hide/disable UI elements based on permissions | UX |
| **API middleware** | Check permissions on every API request | Security |
| **Database** | Row-level security where applicable | Defense in depth |
| **Audit** | Log all permission checks | Compliance |

### 12.6 Audit Logging

**Audit Log Schema:**

```typescript
interface AuditLog {
  id: string;                    // UUID
  actorId: string;               // Admin user ID
  actorEmail: string;            // Admin email (snapshot)
  actorRole: string;             // Admin role (snapshot)
  action: string;                // 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
  resource: string;              // 'Product', 'Order', 'Customer', etc.
  resourceId: string;            // Entity ID
  changes?: JsonB;               // Before/after values for updates
  metadata?: JsonB;              // Additional context
  ipAddress: string;             // Request IP
  userAgent: string;             // Request user agent
  timestamp: Date;               // UTC timestamp
}
```

**Audit Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Log all writes** | Create, Update, Delete logged | Accountability |
| **Log sensitive reads** | View customer data, financial data | Privacy compliance |
| **Immutable** | Audit logs never modified or deleted | Integrity |
| **Retention** | 7 years minimum | Legal compliance |
| **Searchable** | Full-text search on audit logs | Investigation |
| **Exportable** | Export audit logs as CSV | Compliance |
| **Real-time** | Audit logs written asynchronously | Performance |

### 12.7 Sensitive Actions

| Action | Sensitivity | Protection |
|--------|-------------|------------|
| **Delete product** | High | Confirmation dialog + audit log |
| **Delete customer data** | Critical | Double confirmation + super admin only |
| **Modify pricing** | High | Confirmation + audit log |
| **Process refund** | High | Confirmation + audit log |
| **Modify commission rates** | Critical | Super admin only + confirmation |
| **Change system settings** | High | Confirmation + audit log |
| **Toggle maintenance mode** | Critical | Super admin only + confirmation |
| **Export customer data** | High | Confirmation + audit log + notification |
| **Modify admin roles** | Critical | Super admin only + confirmation |

### 12.8 Confirmation Workflows

**Confirmation Dialog Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Destructive actions** | Always require confirmation | Safety |
| **Reversible actions** | "Undo" toast instead of confirmation | Speed |
| **Bulk actions** | Confirmation with affected count | Awareness |
| **Financial actions** | Confirmation with amount displayed | Accuracy |
| **Permission changes** | Confirmation with impact explanation | Understanding |
| **Cancel option** | Always available, keyboard-accessible | Recovery |

### 12.9 Session Security

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly cookies** | All auth tokens in httpOnly cookies | XSS prevention |
| **Secure cookies** | HTTPS only in production | MITM prevention |
| **SameSite lax** | CSRF protection | CSRF prevention |
| **Session timeout** | 30 minutes inactivity | Security |
| **Max sessions** | 3 per admin user | Security |
| **Session rotation** | Rotate on sensitive operations | Security |
| **IP binding** | Optional: bind session to IP | Security |

---

## 13. Accessibility

### 13.1 What

The accessibility standards for the admin dashboard — keyboard navigation, screen readers, focus management, responsive tables, high contrast, and reduced motion.

### 13.2 Why

- **Inclusivity:** All admins must be able to use the dashboard
- **Compliance:** WCAG 2.2 AA minimum
- **Legal:** Accessibility requirements in many jurisdictions
- **Productivity:** Keyboard navigation is faster for power users

### 13.3 Where

All admin components and interactions.

### 13.4 Keyboard Navigation

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Tab` | Move to next interactive element | Global |
| `Shift+Tab` | Move to previous interactive element | Global |
| `Enter` / `Space` | Activate button/link | Global |
| `Escape` | Close dialog/panel/menu | Context |
| `Arrow keys` | Navigate within groups | Tables, menus, tabs |
| `Home` | Move to first item | Tables, lists |
| `End` | Move to last item | Tables, lists |
| `Page Up/Down` | Scroll by page | Lists, tables |

**Keyboard Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical, left-to-right, top-to-bottom | Predictability |
| **Focus visible** | Visible focus ring on all interactive elements | Visibility |
| **Focus trap** | Trap focus in modals, dialogs, panels | Accessibility |
| **Return focus** | Return focus to trigger on close | Accessibility |
| **Skip links** | "Skip to content" link at top | Screen reader UX |
| **No keyboard traps** | Escape always works | Recovery |

### 13.5 Screen Readers

| Rule | Standard | Rationale |
|------|----------|-----------|
| **ARIA labels** | On all interactive elements | Identification |
| **ARIA landmarks** | `role="main"`, `role="navigation"`, etc. | Orientation |
| **ARIA live regions** | For dynamic content updates | Announcements |
| **Alt text** | On all images | Image description |
| **Table headers** | `<th>` with `scope` attribute | Table comprehension |
| **Form labels** | Associated via `htmlFor`/`id` | Form comprehension |
| **Error announcements** | `aria-live="polite"` for errors | Feedback |

### 13.6 Focus Management

| Scenario | Standard | Rationale |
|----------|----------|-----------|
| **Page load** | Focus on main content or first interactive | Orientation |
| **Dialog open** | Focus moves to dialog | Context |
| **Dialog close** | Focus returns to trigger | Orientation |
| **Tab switch** | Focus moves to new tab content | Context |
| **Error** | Focus moves to error message | Feedback |
| **Success** | Focus moves to success indicator | Feedback |

### 13.7 Responsive Tables

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Horizontal scroll** | Tables scroll horizontally on mobile | Preserve structure |
| **Sticky header** | Header fixed on scroll | Context |
| **Sticky first column** | Entity name column fixed on scroll | Identity |
| **Row expansion** | Tap row to see full details on mobile | Progressive disclosure |
| **Card view** | Optional card view for mobile | Mobile-friendly |

### 13.8 High Contrast

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Focus ring** | 2px solid `brand-500` with 2px offset | Visibility |
| **Text contrast** | 4.5:1 minimum for normal text | WCAG AA |
| **Large text contrast** | 3:1 minimum for large text | WCAG AA |
| **Interactive contrast** | 3:1 for interactive elements | WCAG AA |
| **Color not sole indicator** | Status uses icon + color | Color blindness |

### 13.9 Reduced Motion

| Rule | Standard | Rationale |
|------|----------|-----------|
| **prefers-reduced-motion** | Respect system setting | Accessibility |
| **Disable animations** | Remove non-essential animations | Comfort |
| **Instant transitions** | Use opacity/scale without animation | Comfort |
| **Loading indicators** | Use static indicators, not animated | Comfort |
| **Framer Motion** | Respects `prefers-reduced-motion` automatically | Implementation |

---

## 14. Future Readiness

### 14.1 What

The architecture provisions for future capabilities — AI admin assistant, workflow automation, multi-admin collaboration, approval queues, real-time monitoring, plugin modules, multi-brand support, and multi-region support.

### 14.2 Why

- **Scalability:** Architecture supports growth without redesign
- **Innovation:** Ready for AI-powered features
- **Collaboration:** Multi-admin workflows
- **Enterprise:** Multi-brand and multi-region requirements

### 14.3 Where

Architecture provisions in current codebase, features added incrementally.

### 14.4 AI Admin Assistant

| Capability | Description | Architecture |
|------------|-------------|--------------|
| **Natural language queries** | "Show me orders from last week over ₹5000" | Search API + NL processing |
| **Automated insights** | "Sales dropped 15% this week — here's why" | Analytics + AI analysis |
| **Smart suggestions** | "Consider restocking Product X — selling fast" | Inventory + AI prediction |
| **Auto-categorization** | Suggest categories for new products | ML classification |
| **Anomaly detection** | "Unusual spike in returns for Product Y" | Statistical analysis |

**AI Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Opt-in** | AI features disabled by default | Privacy |
| **Explainable** | AI decisions explained to user | Trust |
| **Overrideable** | Admins can override AI suggestions | Control |
| **Audited** | AI actions logged like human actions | Accountability |
| **Private** | Data stays within platform | Security |

### 14.5 Workflow Automation

| Automation | Trigger | Action |
|------------|---------|--------|
| **Auto-approve orders** | Order amount < threshold | Set status to confirmed |
| **Low stock alert** | Stock below threshold | Send notification |
| **Auto-archive** | Order completed for 30 days | Move to archive |
| **Welcome email** | New customer registration | Send welcome email |
| **Review request** | Order delivered for 7 days | Send review request |

**Automation Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Configurable** | Admins define automation rules | Flexibility |
| **Auditable** | All automation actions logged | Accountability |
| **Reversible** | Automation can be undone | Safety |
| **Testable** | Test automation before enabling | Reliability |
| **Rate-limited** | Prevent automation loops | Safety |

### 14.6 Multi-Admin Collaboration

| Feature | Description | Architecture |
|---------|-------------|--------------|
| **Real-time presence** | See who's editing what | WebSocket (future) |
| **Conflict resolution** | Handle simultaneous edits | Optimistic locking |
| **Comments** | Comment on entities | Comment system |
| **Assignments** | Assign tasks to team members | Task system |
| **Activity feed** | See team activity | Real-time feed |

### 14.7 Approval Queues

| Queue | Trigger | Approvers |
|-------|---------|-----------|
| **Product publish** | Product submitted for review | Editor, Admin |
| **Content publish** | Content submitted for review | Editor, Admin |
| **Refund approval** | Refund requested | Finance, Admin |
| **Discount approval** | Discount created | Admin, Super Admin |
| **Setting change** | Critical setting modified | Super Admin |

### 14.8 Real-time Monitoring

| Monitor | Update Frequency | Alert |
|---------|------------------|-------|
| **Active users** | Every 5 seconds | — |
| **Order velocity** | Every 30 seconds | Anomaly detection |
| **Error rates** | Every 10 seconds | Threshold alert |
| **Performance metrics** | Every 30 seconds | Degradation alert |
| **Security events** | Real-time | Critical alert |

### 14.9 Plugin Modules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Module interface** | Standard module interface for plugins | Extensibility |
| **Registration** | Plugins register via config | Dynamic loading |
| **Permissions** | Plugins define their own permissions | Security |
| **API** | Plugins can define API endpoints | Functionality |
| **UI** | Plugins can add sidebar items, pages | Integration |
| **Isolation** | Plugins cannot access other plugins | Security |

### 14.10 Multi-Brand Support

| Feature | Description | Architecture |
|---------|-------------|--------------|
| **Brand switching** | Switch between brands in admin | Brand context |
| **Per-brand settings** | Different settings per brand | Brand-scoped config |
| **Per-brand products** | Products assigned to brands | Brand FK |
| **Per-brand analytics** | Analytics filtered by brand | Brand filter |
| **Per-brand permissions** | Admin access per brand | Brand-scoped permissions |

### 14.11 Multi-Region Support

| Feature | Description | Architecture |
|---------|-------------|--------------|
| **Region switching** | Switch between regions in admin | Region context |
| **Per-region pricing** | Different prices per region | Region-scoped pricing |
| **Per-region inventory** | Inventory per warehouse/region | Region-scoped inventory |
| **Per-region shipping** | Shipping rules per region | Region-scoped shipping |
| **Per-region tax** | Tax rules per region | Region-scoped tax |

---

## 15. Mandatory Rules for AI Agents

### 15.1 What

Non-negotiable rules that every AI agent must follow when working on the admin dashboard.

### 15.2 Why

- **Consistency:** Every implementation follows the same patterns
- **Quality:** No shortcuts that compromise the architecture
- **Security:** Security is never optional
- **Maintainability:** Code must be maintainable by humans

### 15.3 Rules

| # | Rule | Standard | Rationale |
|---|------|----------|-----------|
| 1 | **Module isolation** | Each admin module in `src/features/admin/{module}/` | Prevents coupling |
| 2 | **No cross-module imports** | Modules cannot import from each other | Prevents circular dependencies |
| 3 | **Shared components only** | Use `src/shared/ui/` for UI primitives | Design system consistency |
| 4 | **Permission enforcement** | Frontend + Backend permission checks | Security |
| 5 | **Audit logging** | Every admin action logged | Compliance |
| 6 | **Mobile-first** | Design mobile, then enhance | 70%+ mobile traffic |
| 7 | **Keyboard accessible** | Every action keyboard-accessible | Accessibility |
| 8 | **Loading states** | Every data-dependent page has skeletons | Perceived performance |
| 9 | **Empty states** | Every list page has empty state guidance | UX |
| 10 | **Error handling** | Every error caught and displayed | Resilience |
| 11 | **Confirmation dialogs** | Destructive actions require confirmation | Safety |
| 12 | **Undo over confirm** | Prefer undo toast over blocking confirmation | Speed + safety |
| 13 | **No hardcoded data** | All data from API, not hardcoded | Maintainability |
| 14 | **Consistent UX** | Same patterns across all modules | Learnability |
| 15 | **Audit trail** | Every status change logged with actor | Accountability |
| 16 | **Permission-gated UI** | Hide/disable elements based on permissions | Security |
| 17 | **Keyboard shortcuts** | Common actions have keyboard shortcuts | Productivity |
| 18 | **URL state** | Filters, pagination, sort in URL | Shareable, bookmarkable |
| 19 | **No duplicated interfaces** | One management pattern per entity type | Consistency |
| 20 | **Configurable workflows** | Business rules in settings, not code | Flexibility |

### 15.4 File Structure Standard

```
src/features/admin/
├── layout/                          # Admin layout components
│   ├── AdminLayout.tsx              # Main admin layout
│   ├── AdminSidebar.tsx             # Sidebar navigation
│   ├── AdminTopBar.tsx              # Top bar with search, notifications
│   └── index.ts
├── dashboard/                       # Dashboard overview
│   ├── components/
│   │   ├── KPICard.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── OrdersChart.tsx
│   │   ├── RecentOrders.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── PendingTasks.tsx
│   ├── hooks/
│   │   └── useDashboardData.ts
│   ├── api/
│   │   └── dashboard.ts
│   └── types.ts
├── products/                        # Products module
│   ├── components/
│   │   ├── ProductList.tsx
│   │   ├── ProductTable.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductDetail.tsx
│   │   └── ProductFilters.tsx
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   └── useProductForm.ts
│   ├── api/
│   │   └── products.ts
│   ├── validators/
│   │   └── product.ts
│   └── types.ts
├── orders/                          # Orders module
├── customers/                       # Customers module
├── categories/                      # Categories module
├── collections/                     # Collections module
├── cms/                             # CMS module
├── blogs/                           # Blogs module
├── coupons/                         # Coupons module
├── finance/                         # Finance module
├── reports/                         # Reports module
├── settings/                        # Settings module
├── shared/                          # Shared admin utilities
│   ├── components/
│   │   ├── AdminSearch.tsx
│   │   ├── BulkActions.tsx
│   │   ├── DataTable.tsx
│   │   ├── FilterBar.tsx
│   │   ├── Pagination.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── SidePanel.tsx
│   ├── hooks/
│   │   ├── useAdminPermissions.ts
│   │   ├── useBulkSelection.ts
│   │   ├── useSavedFilters.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── api/
│   │   └── admin.ts
│   └── types.ts
└── index.ts                         # Admin barrel export
```

### 15.5 Component Standard

Every admin component must follow:

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Named export** | No default exports | Consistency with ARCHITECTURE.md |
| **forwardRef** | On all UI primitives | Composability |
| **displayName** | Set on all components | React DevTools debugging |
| **TypeScript** | Strict types, no `any` | Type safety |
| **Permission-aware** | Check permissions for actions | Security |
| **Loading state** | Skeleton or spinner during data fetch | UX |
| **Error state** | Error display with retry | Resilience |
| **Empty state** | Guidance when no data | UX |
| **Responsive** | Works on mobile, tablet, desktop | Accessibility |
| **Keyboard accessible** | All actions keyboard-accessible | Accessibility |

### 15.6 API Handler Standard

Every admin API handler must follow:

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Authentication** | `authenticate(request)` on every handler | Security |
| **Authorization** | `authorize(user, 'permission')` before action | Security |
| **Validation** | Zod schema validation on every input | Security |
| **Audit logging** | Log action with actor, resource, changes | Compliance |
| **Error handling** | Structured error responses | Debuggability |
| **Standard response** | `{ success, data, error, meta }` format | Consistency |
| **Rate limiting** | Rate limit on write operations | Security |
| **Transaction** | Multi-step operations in database transaction | Integrity |

---

*Last updated: August 03, 2026*  
*This document is the official Admin Dashboard Architecture Standard for the Nabome Commerce Operating System.*
