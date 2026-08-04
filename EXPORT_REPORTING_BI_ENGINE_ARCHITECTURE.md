# নবME (Nabome) — Export, Reporting & Business Intelligence Engine Architecture Standard

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for exports, reporting, analytics, business intelligence, visualization, dashboards, and enterprise data access
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), TECH_STACK.md (v1.0), DATABASE_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), FINANCE_ENGINE_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), SHOP_OWNER_DASHBOARD_ARCHITECTURE.md (v1.0), ADMIN_DASHBOARD_ARCHITECTURE.md (v1.0), ENGINEERING_HANDBOOK.md (v1.0)

---

## Table of Contents

1. [Reporting Foundation](#1-reporting-foundation)
2. [Analytics Architecture](#2-analytics-architecture)
3. [KPI Architecture](#3-kpi-architecture)
4. [Report Types](#4-report-types)
5. [Export Engine](#5-export-engine)
6. [Analytics Modules](#6-analytics-modules)
7. [Filtering Architecture](#7-filtering-architecture)
8. [Search Architecture](#8-search-architecture)
9. [Visualization Architecture](#9-visualization-architecture)
10. [Permissions Architecture](#10-permissions-architecture)
11. [Performance Architecture](#11-performance-architecture)
12. [Security Architecture](#12-security-architecture)
13. [Accessibility Architecture](#13-accessibility-architecture)
14. [Future Readiness Architecture](#14-future-readiness-architecture)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Reporting Foundation

### 1.1 What

The foundational philosophy, design principles, and architectural standards that govern how every report, export, dashboard, and analytical feature is designed, built, and maintained across the Nabome platform.

### 1.2 Why

- **Actionable intelligence:** Reports must drive decisions, not just display numbers. A report that doesn't help the user make a better decision is a failed report.
- **Trust:** Business owners stake real money on reported numbers. Every metric must be accurate, reproducible, and auditable.
- **Consistency:** Every report across every module must follow the same patterns — same filters, same formatting, same export behavior.
- **Performance:** Enterprise-scale datasets (millions of orders, products, customers) must return reports in seconds, not minutes.
- **Independence:** The reporting engine must not couple to business modules — changing order logic must never break revenue reports.

### 1.3 Where

Every report, dashboard widget, export function, analytics module, and data visualization across the entire Nabome platform.

### 1.4 Reporting Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Decision-first design** | Every report answers a specific business question | Reports without purpose waste user time |
| **Authoritative data** | Reports query the single source of truth (PostgreSQL) | No stale caches, no conflicting numbers |
| **Reproducible results** | Same filters always produce same numbers | Trust and debugging |
| **Progressive detail** | Summary → Breakdown → Drill-down → Individual record | Prevent cognitive overload |
| **Mobile-first visualization** | Reports work perfectly on phones before desktop | 70%+ mobile traffic |
| **Permission-scoped** | Users see only what their role allows | Privacy, security |
| **Performance-guaranteed** | Reports complete within defined SLAs | User trust |
| **Audit-trail ready** | Every report generation is logged | Compliance |
| **Future-proof** | Architecture supports AI analytics without redesign | Long-term viability |
| **Beginner-friendly** | Non-technical users understand reports without training | Adoption |

### 1.5 Reporting Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    REPORTING LIFECYCLE                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. DATA COLLECTION                                        │   │
│    │  • Business events create records in PostgreSQL          │   │
│  │  • Orders, payments, reviews, inventory changes           │   │
│  │  • All events timestamped in UTC                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 2. DATA AGGREGATION                                       │   │
│  │  • Materialized views for common aggregations             │   │
│  │  • Cached summaries updated periodically                  │   │
│  │  • Real-time queries for live dashboards                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 3. REPORT GENERATION                                      │   │
│  │  • API handlers query aggregated/raw data                 │   │
│  │  • Apply filters, date ranges, groupings                  │   │
│  │  • Return structured response for visualization           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 4. VISUALIZATION                                          │   │
│  │  • Frontend renders charts, tables, KPI cards             │   │
│  │  • Responsive layouts for mobile/desktop                  │   │
│  │  • Interactive filters and drill-downs                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 5. EXPORT                                                 │   │
│  │  • User triggers export (CSV, Excel, PDF)                 │   │
│  │  • Background job generates file                          │   │
│  │  • Secure download link provided                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 6. SCHEDULING & SHARING (Future)                          │   │
│  │  • Scheduled report generation                            │   │
│  │  • Email delivery of reports                              │   │
│  │  • Dashboard sharing with permissions                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Data Ownership

| Data Domain | Owner Module | Report Scope | Export Scope |
|-------------|-------------|--------------|--------------|
| **Products** | Product Engine | Product performance, catalog health | Product lists, catalog exports |
| **Orders** | Order Management | Sales, order trends, fulfillment | Order lists, fulfillment exports |
| **Finance** | Finance Engine | Revenue, commissions, settlements | Financial statements, tax reports |
| **Inventory** | Variant & Inventory | Stock levels, movement, health | Inventory snapshots, stock exports |
| **Customers** | Identity & Access | Customer growth, segments | Customer lists, segment exports |
| **Shipping** | Shipping & Delivery | Delivery performance, carrier metrics | Shipping logs, carrier reports |
| **Reviews** | Customer Feedback | Review trends, sentiment | Review exports, moderation reports |
| **CMS** | CMS Engine | Content performance | Content inventories |
| **System** | Platform | System health, audit logs | Audit exports, system reports |

### 1.7 Reporting Consistency Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single source** | All reports query PostgreSQL directly or via materialized views | No conflicting numbers |
| **No report-specific tables** | Reports use existing business tables | Data integrity |
| **UTC storage, local display** | All timestamps stored UTC, converted for display | Timezone consistency |
| **Currency in INR** | All monetary values in Indian Rupees (DECIMAL(10,2)) | Financial accuracy |
| **Percentage precision** | Percentages to 2 decimal places | Readability |
| **Null handling** | Null values displayed as "N/A" or "—" in reports | Clarity |
| **Empty state** | Zero-result reports show helpful empty states, not errors | UX |
| **Filter defaults** | Every report has sensible default filters | Beginner-friendly |
| **Date range defaults** | Default to "Last 30 days" unless context dictates otherwise | Relevance |
| **Sort defaults** | Most recent first for time-series, highest value for rankings | Discoverability |

---

## 2. Analytics Architecture

### 2.1 What

The technical architecture for how analytics data is collected, stored, aggregated, queried, and served to the frontend for rendering reports and dashboards.

### 2.2 Why

- **Performance:** Raw queries on millions of rows are slow — pre-aggregated data is fast
- **Scalability:** Analytics must handle growth from 0 to 1M+ records without redesign
- **Accuracy:** Pre-aggregated data must be refreshed reliably to prevent drift
- **Independence:** Analytics infrastructure is separate from business logic

### 2.3 Where

`api/_lib/analytics/` for shared analytics utilities, `api/_handlers/admin/analytics/` for admin analytics handlers, `src/features/admin/analytics/` for admin analytics UI.

### 2.4 Analytics Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS ARCHITECTURE                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DATA SOURCES                            │   │
│  │                                                           │   │
│  │  PostgreSQL (Neon Serverless)                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ Products │ │ Orders   │ │ Finance  │ │ Customers│   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 AGGREGATION LAYER                          │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────────┐│   │
│  │  │  Materialized Views (PostgreSQL)                     ││   │
│  │  │  • daily_sales_summary                               ││   │
│  │  │  • monthly_revenue_summary                           ││   │
│  │  │  • product_performance_summary                       ││   │
│  │  │  • customer_growth_summary                           ││   │
│  │  │  • inventory_health_summary                          ││   │
│  │  │  • shipping_performance_summary                      ││   │
│  │  └──────────────────────────────────────────────────────┘│   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────────┐│   │
│  │  │  Cached Aggregates (KV)                              ││   │
│  │  │  • Dashboard KPIs (5-min TTL)                        ││   │
│  │  │  • Real-time counters (1-min TTL)                    ││   │
│  │  │  • Trend data (15-min TTL)                           ││   │
│  │  └──────────────────────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 QUERY LAYER                                │   │
│  │                                                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ Report   │ │ Dashboard│ │ Export   │ │ Real-time│   │   │
│  │  │ Queries  │ │ Queries  │ │ Queries  │ │ Queries  │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 API LAYER                                  │   │
│  │                                                           │   │
│  │  GET /api/admin/analytics/dashboard                       │   │
│  │  GET /api/admin/analytics/sales                           │   │
│  │  GET /api/admin/analytics/revenue                         │   │
│  │  GET /api/admin/analytics/products                        │   │
│  │  GET /api/admin/analytics/customers                       │   │
│  │  GET /api/admin/analytics/inventory                       │   │
│  │  GET /api/admin/analytics/shipping                        │   │
│  │  GET /api/admin/reports/:reportId/export                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Analytics Data Flow Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Read from views** | Dashboard queries read from materialized views | Performance |
| **Refresh views periodically** | Materialized views refreshed on schedule (hourly/daily) | Freshness vs. performance trade-off |
| **Real-time for critical metrics** | Revenue, order count use direct queries with caching | Accuracy for money |
| **KV caching** | Dashboard KPIs cached in KV with appropriate TTLs | Edge performance |
| **Cache invalidation** | Invalidate KV on write events | Freshness |
| **No analytics in transactions** | Analytics queries never inside business transactions | Isolation |
| **Batch aggregation** | Heavy aggregations run as background jobs | Performance |
| **Incremental updates** | Only re-aggregate changed data when possible | Efficiency |

### 2.6 Materialized View Strategy

| View Name | Refresh Interval | Data Scope | Used By |
|-----------|-----------------|------------|---------|
| `daily_sales_summary` | Hourly | Orders grouped by day | Sales reports, dashboards |
| `monthly_revenue_summary` | Daily | Revenue grouped by month | Revenue reports, trends |
| `product_performance_summary` | Hourly | Products ranked by sales, revenue | Product reports, rankings |
| `customer_growth_summary` | Daily | Customer registrations by period | Customer reports, growth |
| `inventory_health_summary` | Hourly | Stock levels, movement rates | Inventory reports, alerts |
| `shipping_performance_summary` | Hourly | Delivery times, success rates | Shipping reports |
| `refund_trend_summary` | Daily | Refund rates by period | Refund reports, trends |
| `category_performance_summary` | Hourly | Categories ranked by metrics | Category reports |

### 2.7 Materialized View Refresh Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Non-blocking refresh** | Use `REFRESH MATERIALIZED VIEW CONCURRENTLY` | No report downtime |
| **Staggered schedule** | Don't refresh all views simultaneously | Database load management |
| **Error handling** | Log refresh failures, alert on repeated failures | Reliability |
| **Refresh tracking** | Store last refresh timestamp per view | Freshness visibility |
| **Manual trigger** | Admin can force refresh for critical reports | Emergency freshness |
| **Idempotent refresh** | Refresh is safe to run multiple times | Reliability |

---

## 3. KPI Architecture

### 3.1 What

The complete system for defining, calculating, displaying, and tracking Key Performance Indicators across every business domain on the Nabome platform.

### 3.2 Why

- **Decision speed:** KPIs give instant business health visibility
- **Alignment:** Everyone looks at the same metrics
- **Accountability:** KPIs create measurable goals
- **Trend awareness:** KPIs with trends show trajectory, not just snapshot

### 3.3 Where

Every dashboard, report summary, and analytics view across admin, shop owner, and customer interfaces.

### 3.4 KPI Design Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Actionable** | Each KPI implies a decision or action | KPIs without action are vanity metrics |
| **Comparative** | Every KPI shows period-over-period comparison | Context enables decisions |
| **Trended** | Every KPI includes sparkline or trend direction | Trajectory matters more than snapshot |
| **Contextual** | KPIs show target/benchmark when available | Numbers without context are meaningless |
| **Accessible** | KPIs are readable on mobile with screen readers | Inclusive design |
| **Consistent** | Same KPI calculated identically everywhere | Trust |

### 3.5 Global KPI Definitions

#### 3.5.1 Revenue KPIs

| KPI | Formula | Default Period | Comparison | Trend |
|-----|---------|---------------|------------|-------|
| **Total Revenue** | SUM(orders.total) WHERE status NOT IN ('cancelled', 'refunded') | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Net Revenue** | Total Revenue - Refunds - Returns | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Average Order Value (AOV)** | Total Revenue / Order Count | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Revenue Per Customer** | Total Revenue / Unique Customers | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Gross Margin** | (Revenue - COGS) / Revenue × 100 | Last 30 days | vs. Previous 30 days | 12-month sparkline |

#### 3.5.2 Order KPIs

| KPI | Formula | Default Period | Comparison | Trend |
|-----|---------|---------------|------------|-------|
| **Total Orders** | COUNT(orders) WHERE status NOT IN ('cancelled') | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Orders Per Day** | Total Orders / Days in Period | Last 30 days | vs. Previous 30 days | 30-day sparkline |
| **Conversion Rate** | (Orders / Unique Visitors) × 100 | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Cancellation Rate** | (Cancelled Orders / Total Orders) × 100 | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Average Fulfillment Time** | AVG(deliveredAt - createdAt) | Last 30 days | vs. Previous 30 days | 12-month sparkline |

#### 3.5.3 Customer KPIs

| KPI | Formula | Default Period | Comparison | Trend |
|-----|---------|---------------|------------|-------|
| **Total Customers** | COUNT(DISTINCT profileId) WHERE role = 'customer' | Current | All-time | 12-month sparkline |
| **New Customers** | COUNT(DISTINCT profileId) WHERE createdAt IN period | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Repeat Purchase Rate** | (Customers with 2+ orders / Total Customers) × 100 | Last 90 days | vs. Previous 90 days | 12-month sparkline |
| **Customer Lifetime Value (CLV)** | Average Order Value × Purchase Frequency × Lifespan | Current | vs. Previous period | 12-month sparkline |
| **Customer Churn Rate** | (Customers inactive 90+ days / Total Customers) × 100 | Current | vs. Previous period | 12-month sparkline |

#### 3.5.4 Product KPIs

| KPI | Formula | Default Period | Comparison | Trend |
|-----|---------|---------------|------------|-------|
| **Total Products** | COUNT(products) WHERE isActive = true | Current | All-time | 12-month sparkline |
| **Products Sold** | COUNT(DISTINCT orderItems.variantId) | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Average Product Rating** | AVG(reviews.rating) WHERE status = 'approved' | Current | vs. Previous period | 12-month sparkline |
| **Out of Stock Rate** | (Products with stock = 0 / Total Products) × 100 | Current | vs. Previous period | 12-month sparkline |
| **Top Selling Products** | Products ranked by quantity sold | Last 30 days | vs. Previous 30 days | — |

#### 3.5.5 Inventory KPIs

| KPI | Formula | Default Period | Comparison | Trend |
|-----|---------|---------------|------------|-------|
| **Total Stock Units** | SUM(variants.stock) | Current | vs. Previous period | 12-month sparkline |
| **Stock Value** | SUM(variants.stock × variants.price) | Current | vs. Previous period | 12-month sparkline |
| **Low Stock Items** | COUNT(variants) WHERE stock <= lowStockThreshold | Current | vs. Previous period | 12-month sparkline |
| **Inventory Turnover** | COGS / Average Inventory Value | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Days of Supply** | Total Stock Units / Average Daily Sales | Current | vs. Previous period | — |

#### 3.5.6 Shipping KPIs

| KPI | Formula | Default Period | Comparison | Trend |
|-----|---------|---------------|------------|-------|
| **Average Delivery Time** | AVG(deliveredAt - shippedAt) | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **On-Time Delivery Rate** | (Delivered on time / Total delivered) × 100 | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Shipping Cost per Order** | Total Shipping Costs / Orders Shipped | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Return Rate** | (Returned Orders / Delivered Orders) × 100 | Last 30 days | vs. Previous 30 days | 12-month sparkline |

#### 3.5.7 Finance KPIs

| KPI | Formula | Default Period | Comparison | Trend |
|-----|---------|---------------|------------|-------|
| **Total Collections** | SUM(payments.captured) | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Pending Settlements** | SUM(settlements WHERE status = 'pending') | Current | vs. Previous period | — |
| **Commission Earned** | SUM(commissions) | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Refund Amount** | SUM(refunds.amount) | Last 30 days | vs. Previous 30 days | 12-month sparkline |
| **Net Profit** | Revenue - COGS - Shipping - Commission - Refunds | Last 30 days | vs. Previous 30 days | 12-month sparkline |

### 3.6 KPI Display Standards

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Primary KPIs** | Large number + label + trend indicator + comparison percentage | Instant readability |
| **Trend direction** | Up arrow (green) = positive, Down arrow (red) = negative, Neutral (gray) = no change | Quick interpretation |
| **Comparison format** | "+12.5% vs. last month" or "-3.2% vs. last month" | Context |
| **Sparkline** | 12-point line chart showing 12-month trend | Trajectory |
| **Null state** | "—" with tooltip "No data available for this period" | Clarity |
| **Loading state** | Skeleton KPI card with shimmer | Perceived performance |
| **Mobile layout** | 2-column grid on mobile, 4-column on desktop | Responsive |
| **Color coding** | Use semantic colors: green (positive), red (negative), blue (neutral) | Accessibility |

### 3.7 KPI Calculation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Period alignment** | KPIs compare same-length periods (30 days vs. 30 days) | Fair comparison |
| **Excluded statuses** | Cancelled/refunded orders excluded from revenue unless specified | Accuracy |
| **Currency formatting** | All monetary KPIs prefixed with ₹ and formatted with Indian comma system (₹1,23,456) | Localization |
| **Percentage formatting** | 2 decimal places (12.50%) | Precision |
| **Integer formatting** | Large numbers abbreviated (1.2K, 3.5M) | Readability |
| **Time formatting** | Duration in hours/minutes (2.5 hours, not 150 minutes) | Readability |
| **Zero handling** | Show "0" not "—" for zero values | Clarity |
| **Negative handling** | Negative values in parentheses or with minus sign, colored red | Financial convention |

---

## 4. Report Types

### 4.1 What

The complete taxonomy of every report type supported by the Nabome platform, including their data sources, visualization types, filter capabilities, and export formats.

### 4.2 Why

- **Completeness:** Every business domain has dedicated reports
- **Consistency:** Same report patterns across all domains
- **Discoverability:** Users find the right report quickly
- **Extensibility:** New report types follow established patterns

### 4.3 Report Taxonomy

#### 4.3.1 Dashboard Reports

| Report | Owner | Data Source | Visualizations | Refresh |
|--------|-------|-------------|----------------|---------|
| **Admin Overview Dashboard** | Admin | Aggregated across all domains | KPI cards, line charts, bar charts, tables | 5-min cache |
| **Shop Owner Dashboard** | Shop Owner | Shop-scoped data | KPI cards, line charts, top products table | 5-min cache |
| **Customer Order Dashboard** | Customer | Own order data | Order timeline, status cards | Real-time |
| **Real-time Activity Feed** | Admin | Audit log, order events | Live list, counters | Real-time |

#### 4.3.2 Sales Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Sales Overview** | Admin | Orders | KPI cards, line chart, summary table | CSV, Excel |
| **Sales by Period** | Admin | Orders grouped by day/week/month | Bar chart, line chart, table | CSV, Excel |
| **Sales by Product** | Admin | Order items joined with products | Ranked table, bar chart | CSV, Excel |
| **Sales by Category** | Admin | Order items joined with categories | Pie chart, bar chart, table | CSV, Excel |
| **Sales by Brand** | Admin | Order items joined with brands | Bar chart, table | CSV, Excel |
| **Sales by Payment Method** | Admin | Orders grouped by payment method | Pie chart, table | CSV, Excel |
| **Sales by Region** | Admin | Orders grouped by shipping state/city | Map (future), table | CSV, Excel |
| **Sales Comparison** | Admin | Two periods side by side | Dual bar chart, comparison table | CSV, Excel |

#### 4.3.3 Revenue Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Revenue Overview** | Admin | Finance records | KPI cards, line chart, summary | CSV, Excel |
| **Revenue by Period** | Admin | Finance records grouped by time | Bar chart, line chart, table | CSV, Excel |
| **Revenue by Product** | Admin | Finance records joined with products | Ranked table, bar chart | CSV, Excel |
| **Revenue by Shop** | Admin | Finance records grouped by shop | Bar chart, table | CSV, Excel |
| **Net Revenue** | Admin | Revenue minus refunds/returns | Line chart, table | CSV, Excel |
| **Revenue Forecast** | Admin | Historical trends | Line chart with projection | CSV, Excel |

#### 4.3.4 Finance Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Financial Summary** | Admin | Finance engine records | KPI cards, summary table | CSV, Excel, PDF |
| **Commission Report** | Admin | Commission records | Table, bar chart | CSV, Excel |
| **Settlement Report** | Admin | Settlement records | Timeline, table | CSV, Excel |
| **Refund Report** | Admin | Refund records | Table, trend chart | CSV, Excel |
| **Tax Report (GST)** | Admin | Orders with tax breakdown | Summary table, export | CSV, Excel, PDF |
| **P&L Statement** | Admin | Revenue and expense records | Summary, comparison | PDF |
| **Payment Reconciliation** | Admin | Payment records vs. settlements | Table, discrepancy list | CSV, Excel |

#### 4.3.5 Order Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Order Overview** | Admin | Orders | KPI cards, status distribution, table | CSV, Excel |
| **Orders by Status** | Admin | Orders grouped by status | Pie chart, table | CSV, Excel |
| **Orders by Period** | Admin | Orders grouped by time | Bar chart, line chart | CSV, Excel |
| **Order Details** | Admin | Single order with all relations | Detail view, timeline | PDF |
| **Pending Orders** | Admin | Orders WHERE status = 'pending' | Table with actions | CSV, Excel |
| **Bulk Order Export** | Admin | Filtered orders | Table | CSV, Excel |
| **Shop Owner Orders** | Shop Owner | Orders containing shop's products | Table, status cards | CSV, Excel |
| **Customer Orders** | Customer | Own orders | Order timeline | — |

#### 4.3.6 Product Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Product Catalog** | Admin | Products with variants | Table, grid view | CSV, Excel |
| **Product Performance** | Admin | Products with sales/review data | Ranked table, charts | CSV, Excel |
| **Product Inventory** | Admin | Products with stock data | Table with stock indicators | CSV, Excel |
| **Low Stock Alert** | Admin | Products below threshold | Alert table | CSV, Excel |
| **New Products** | Admin | Products added in period | Table, timeline | CSV, Excel |
| **Product Returns** | Admin | Products with return data | Table, chart | CSV, Excel |
| **Shop Owner Products** | Shop Owner | Own products | Table, status cards | CSV, Excel |

#### 4.3.7 Inventory Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Inventory Overview** | Admin | Variants with stock data | KPI cards, table | CSV, Excel |
| **Stock Levels** | Admin | Variants grouped by product | Table with indicators | CSV, Excel |
| **Stock Movement** | Admin | Inventory change history | Timeline, table | CSV, Excel |
| **Low Stock Report** | Admin | Variants below threshold | Alert table | CSV, Excel |
| **Out of Stock** | Admin | Variants with stock = 0 | Table | CSV, Excel |
| **Dead Stock** | Admin | Variants with no sales in 90 days | Table | CSV, Excel |
| **Inventory Valuation** | Admin | Stock × cost price | Summary, table | CSV, Excel, PDF |
| **Shop Owner Inventory** | Shop Owner | Own inventory | Table, alerts | CSV, Excel |

#### 4.3.8 Customer Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Customer Overview** | Admin | Profiles with order data | KPI cards, growth chart | CSV, Excel |
| **Customer List** | Admin | All customer profiles | Searchable table | CSV, Excel |
| **New Customers** | Admin | Registrations in period | Growth chart, table | CSV, Excel |
| **Repeat Customers** | Admin | Customers with 2+ orders | Table, segment chart | CSV, Excel |
| **Customer Segments** | Admin | Customers grouped by behavior | Pie chart, table | CSV, Excel |
| **Customer LTV** | Admin | Customer lifetime value calculation | Ranked table | CSV, Excel |
| **Churned Customers** | Admin | Customers inactive 90+ days | Table | CSV, Excel |
| **Customer Orders** | Customer | Own order history | Timeline | — |

#### 4.3.9 Shop Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Shop Performance** | Admin | Aggregated shop metrics | Ranked table, comparison | CSV, Excel |
| **Shop Sales** | Shop Owner | Own sales data | KPI cards, charts | CSV, Excel |
| **Shop Products** | Shop Owner | Own product catalog | Table | CSV, Excel |
| **Shop Customers** | Shop Owner | Customers who bought shop products | Table | CSV, Excel |
| **Shop Settlements** | Shop Owner | Own settlement history | Timeline, table | CSV, Excel |

#### 4.3.10 Shipping Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Shipping Overview** | Admin | Shipping records | KPI cards, charts | CSV, Excel |
| **Delivery Performance** | Admin | Delivery times by carrier | Bar chart, table | CSV, Excel |
| **Shipping Costs** | Admin | Shipping charges by carrier | Bar chart, table | CSV, Excel |
| **Failed Deliveries** | Admin | Returned/failed shipments | Table | CSV, Excel |
| **Carrier Comparison** | Admin | Performance by carrier | Comparison table | CSV, Excel |
| **Shop Owner Shipping** | Shop Owner | Own shipping data | Table, metrics | CSV, Excel |

#### 4.3.11 Return Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Return Overview** | Admin | Return requests | KPI cards, chart | CSV, Excel |
| **Returns by Product** | Admin | Products with returns | Ranked table | CSV, Excel |
| **Returns by Reason** | Admin | Return reasons grouped | Pie chart, table | CSV, Excel |
| **Return Timeline** | Admin | Returns over time | Line chart, table | CSV, Excel |
| **Shop Owner Returns** | Shop Owner | Own return data | Table | CSV, Excel |
| **Customer Returns** | Customer | Own return requests | Timeline | — |

#### 4.3.12 Refund Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Refund Overview** | Admin | Refund records | KPI cards, chart | CSV, Excel |
| **Refunds by Period** | Admin | Refunds over time | Line chart, table | CSV, Excel |
| **Refunds by Product** | Admin | Products with refunds | Ranked table | CSV, Excel |
| **Refund Rate** | Admin | Refund rate over time | Line chart | CSV, Excel |
| **Pending Refunds** | Admin | Awaiting processing | Table | CSV, Excel |
| **Shop Owner Refunds** | Shop Owner | Own refund data | Table | CSV, Excel |

#### 4.3.13 Notification Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Email Delivery** | Admin | Email send logs | KPI cards, chart | CSV, Excel |
| **Email Open Rates** | Admin | Email tracking data | Chart, table | CSV, Excel |
| **Notification History** | Admin | Notification logs | Table | CSV, Excel |

#### 4.3.14 Storage Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Storage Usage** | Admin | Cloudinary/R2 metrics | KPI cards, breakdown | — |
| **File Inventory** | Admin | Media records | Table | CSV, Excel |
| **Storage by Type** | Admin | Files grouped by type | Pie chart, table | — |

#### 4.3.15 Audit Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **Audit Log** | Admin | Audit log records | Searchable table | CSV, Excel |
| **Security Events** | Admin | Security-related audit events | Filtered table | CSV, Excel |
| **Login History** | Admin | Login audit events | Table, chart | CSV, Excel |
| **Admin Actions** | Admin | Admin audit events | Table | CSV, Excel |
| **Data Changes** | Admin | CRUD audit events | Diff view, table | CSV, Excel |

#### 4.3.16 System Reports

| Report | Owner | Data Source | Visualizations | Export |
|--------|-------|-------------|----------------|--------|
| **System Health** | Admin | Platform metrics | KPI cards, status indicators | — |
| **API Performance** | Admin | Request/response metrics | Charts, tables | CSV, Excel |
| **Error Rates** | Admin | Error logs | Charts, tables | CSV, Excel |
| **Database Performance** | Admin | Query metrics | Charts, tables | CSV, Excel |
| **User Activity** | Admin | User action logs | Charts, tables | CSV, Excel |

### 4.4 Report Configuration Standards

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Report ID** | Unique identifier (e.g., `sales-overview`, `inventory-stock-levels`) | Routing, caching, permissions |
| **Report name** | Human-readable name (e.g., "Sales Overview") | Display |
| **Description** | One-line description of what the report shows | Discoverability |
| **Owner role** | Which roles can access this report | Security |
| **Default date range** | Pre-selected date range on load | UX |
| **Available filters** | List of filters this report supports | Flexibility |
| **Visualizations** | Chart types and table configurations | Rendering |
| **Export formats** | Supported export formats (CSV, Excel, PDF) | Functionality |
| **Refresh interval** | How often data is refreshed | Freshness |
| **Data retention** | How long report data is available | Compliance |

---

## 5. Export Engine

### 5.1 What

The complete system for exporting report data into downloadable files (CSV, Excel, PDF) with proper formatting, pagination, permission enforcement, and security.

### 5.2 Why

- **External analysis:** Users need data in spreadsheets for further analysis
- **Compliance:** Regulatory requirements may demand downloadable reports
- **Sharing:** Reports shared via file when real-time access isn't possible
- **Backup:** Periodic exports serve as business data backups

### 5.3 Where

`api/_handlers/admin/exports/` for export handlers, `api/_lib/exports/` for shared export utilities, `src/features/admin/exports/` for export UI components.

### 5.4 Export Engine Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPORT ENGINE ARCHITECTURE                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 EXPORT REQUEST                             │   │
│  │                                                           │   │
│  │  User clicks "Export" → Select format → Confirm           │   │
│  │  OR                                                       │   │
│  │  Scheduled export triggers → Auto-generate                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 PERMISSION CHECK                           │   │
│  │                                                           │   │
│  │  1. Authenticate user                                     │   │
│  │  2. Authorize export permission                           │   │
│  │  3. Validate data scope (shop-scoped, user-scoped)        │   │
│  │  4. Check rate limits                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 EXPORT GENERATION                          │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────────┐│   │
│  │  │  Small Dataset (< 10K rows)                          ││   │
│  │  │  → Synchronous generation                            ││   │
│  │  │  → Return file directly                              ││   │
│  │  └──────────────────────────────────────────────────────┘│   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────────┐│   │
│  │  │  Large Dataset (> 10K rows)                          ││   │
│  │  │  → Background job                                    ││   │
│  │  │  → Stream to R2                                      ││   │
│  │  │  → Notify user when ready                            ││   │
│  │  │  → Provide signed download URL                       ││   │
│  │  └──────────────────────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 FILE DELIVERY                              │   │
│  │                                                           │   │
│  │  • Signed URL with expiry (15 minutes)                    │   │
│  │  • One-time download (URL invalidated after download)     │   │
│  │  • Content-Disposition: attachment                        │   │
│  │  • Audit log entry for download                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Export Formats

#### 5.5.1 CSV Export

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Encoding** | UTF-8 with BOM | Excel compatibility |
| **Delimiter** | Comma (`,`) | Standard CSV |
| **Quote character** | Double quote (`"`) | RFC 4180 compliance |
| **Escape character** | Double quote (`""`) | RFC 4180 compliance |
| **Line endings** | CRLF (`\r\n`) | Windows compatibility |
| **Date format** | `YYYY-MM-DD HH:MM:SS` | ISO 8601 |
| **Currency format** | Plain number (no currency symbol) | Spreadsheet formulas |
| **Boolean format** | `TRUE` / `FALSE` | Spreadsheet compatibility |
| **Null format** | Empty cell | Clean data |
| **Header row** | Always included | Usability |
| **Max filename** | 100 characters | Filesystem compatibility |
| **Filename pattern** | `{report-name}_{date}_{time}.csv` | Identification |

#### 5.5.2 Excel Export

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Format** | `.xlsx` (Office Open XML) | Universal compatibility |
| **Sheet naming** | Report name (max 31 chars) | Excel limits |
| **Header styling** | Bold, background color, frozen row | Readability |
| **Column auto-width** | Auto-fit to content | Readability |
| **Number formatting** | Locale-aware number formatting | Correct display |
| **Currency formatting** | ₹ symbol with Indian comma system | Localization |
| **Date formatting** | Locale-aware date formatting | Readability |
| **Conditional formatting** | Color coding for status columns | Quick scanning |
| **Multiple sheets** | Summary sheet + detail sheets | Organization |
| **Formula support** | Summary rows with SUM, AVERAGE | Usability |

#### 5.5.3 PDF Export

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Format** | PDF/A-1b | Archival quality |
| **Page size** | A4 | Indian standard |
| **Orientation** | Landscape for tables, Portrait for summaries | Readability |
| **Header** | Report title, date range, generation timestamp | Context |
| **Footer** | Page numbers, "Generated by Nabome" | Professionalism |
| **Branding** | Nabome logo, consistent styling | Brand identity |
| **Charts** | Embedded as images | Self-contained |
| **Tables** | Paginated with repeating headers | Multi-page readability |
| **Font** | System fonts (Arial, Helvetica) | Rendering consistency |
| **Security** | No encryption (PDF is for reading) | Simplicity |

### 5.6 Export Handler Structure

```typescript
// api/_handlers/admin/exports/sales-export.ts

import { z } from 'zod';
import { db } from '../../../_lib/database/client';
import { authenticate, authorize } from '../../../_lib/auth/middleware';
import { validateRequest } from '../../../_lib/validation/middleware';
import { success } from '../../../_lib/response';
import { generateCsv } from '../../../_lib/exports/csv-generator';
import { generateExcel } from '../../../_lib/exports/excel-generator';
import { checkExportRateLimit } from '../../../_lib/exports/rate-limit';

const exportSchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf']),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  filters: z.object({
    status: z.array(z.string()).optional(),
    categoryId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
  }).optional(),
});

export async function exportSalesReport(request: Request, env: Env) {
  const user = await authenticate(request);
  authorize(user, 'admin');

  await checkExportRateLimit(user.id);

  const params = await validateRequest(request, exportSchema);

  const data = await db.order.findMany({
    where: {
      createdAt: {
        gte: new Date(params.dateFrom),
        lte: new Date(params.dateTo),
      },
      status: { notIn: ['cancelled'] },
      ...buildFilters(params.filters),
    },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      profile: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const columns = [
    { key: 'orderNumber', header: 'Order #', width: 20 },
    { key: 'customerName', header: 'Customer', width: 25 },
    { key: 'total', header: 'Total (₹)', width: 15, format: 'currency' },
    { key: 'status', header: 'Status', width: 15 },
    { key: 'createdAt', header: 'Date', width: 20, format: 'datetime' },
  ];

  const rows = data.map(order => ({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
  }));

  switch (params.format) {
    case 'csv':
      return generateCsv(rows, columns, 'sales-report');
    case 'excel':
      return generateExcel(rows, columns, 'sales-report', {
        summary: { totalRevenue: sum(rows, 'total'), rowCount: rows.length },
      });
    case 'pdf':
      return generatePdf(rows, columns, 'sales-report', {
        title: 'Sales Report',
        dateRange: { from: params.dateFrom, to: params.dateTo },
      });
  }
}
```

### 5.7 Export Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Permission check** | Verify user has export permission before generating | Security |
| **Data scope** | Shop owners export only their own data | Privacy |
| **Rate limiting** | 10 exports per hour per user | Resource protection |
| **Row limit** | Max 100,000 rows per export | Performance |
| **File size limit** | Max 50MB per export file | Storage management |
| **Signed URLs** | Download URLs expire after 15 minutes | Security |
| **One-time download** | URL invalidated after first download | Security |
| **Audit logging** | Log every export: who, what, when, format | Compliance |
| **Filename convention** | `{report-type}_{date}_{time}.{ext}` | Identification |
| **Progress indication** | Show progress for large exports | UX |
| **Error handling** | Graceful failure with retry option | Resilience |
| **Background processing** | Large exports (> 10K rows) processed async | Performance |
| **No sensitive data in URLs** | Export parameters in request body, not URL | Security |
| **Character encoding** | UTF-8 with BOM for CSV | International character support |
| **Number formatting** | Indian comma system (₹1,23,456.78) | Localization |

### 5.8 Bulk Export

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Multi-report export** | Export multiple reports in single request | Efficiency |
| **ZIP packaging** | Multiple files packaged in ZIP archive | Convenience |
| **Progress tracking** | Track individual file generation progress | UX |
| **Partial failure** | Generate available files even if one fails | Resilience |
| **Download all** | Single download link for entire package | Convenience |

### 5.9 Individual Record Export

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Order PDF** | Single order as printable PDF | Customer/admin use |
| **Invoice PDF** | Order with tax breakdown as PDF | Compliance |
| **Product data sheet** | Single product with all details | Catalog management |
| **Customer data export** | GDPR-compliant personal data export | Compliance |

---

## 6. Analytics Modules

### 6.1 What

The detailed architecture for each analytics module that powers specific business domains on the Nabome platform.

### 6.2 Revenue Trends Analytics

| Aspect | Specification |
|--------|--------------|
| **Data source** | Finance records, order records |
| **Granularity** | Daily, weekly, monthly, quarterly, yearly |
| **Visualizations** | Line chart (primary), bar chart (comparison), area chart (cumulative) |
| **Filters** | Date range, product category, payment method, shop |
| **KPIs** | Total revenue, net revenue, revenue growth rate, AOV |
| **Comparisons** | Period-over-period, year-over-year |
| **Drill-down** | Click data point → daily breakdown → order list |
| **Export** | CSV, Excel |

### 6.3 Order Trends Analytics

| Aspect | Specification |
|--------|--------------|
| **Data source** | Order records |
| **Granularity** | Daily, weekly, monthly |
| **Visualizations** | Line chart (trend), bar chart (volume), stacked bar (status breakdown) |
| **Filters** | Date range, status, payment method, customer type |
| **KPIs** | Order count, AOV, conversion rate, cancellation rate |
| **Comparisons** | Period-over-period |
| **Drill-down** | Click data point → order list filtered by period |
| **Export** | CSV, Excel |

### 6.4 Customer Growth Analytics

| Aspect | Specification |
|--------|--------------|
| **Data source** | Profile records, order records |
| **Granularity** | Daily, weekly, monthly |
| **Visualizations** | Line chart (growth), bar chart (new vs. returning), cohort table |
| **Filters** | Date range, customer segment, acquisition source |
| **KPIs** | New customers, repeat rate, CLV, churn rate |
| **Comparisons** | Period-over-period |
| **Drill-down** | Click segment → customer list |
| **Export** | CSV, Excel |

### 6.5 Product Performance Analytics

| Aspect | Specification |
|--------|--------------|
| **Data source** | Product records, order items, reviews |
| **Granularity** | Per product, per category, per brand |
| **Visualizations** | Ranked table, scatter plot (price vs. sales), bar chart |
| **Filters** | Date range, category, brand, price range, stock status |
| **KPIs** | Units sold, revenue, rating, review count, return rate |
| **Comparisons** | Period-over-period |
| **Drill-down** | Click product → product detail → order list |
| **Export** | CSV, Excel |

### 6.6 Inventory Health Analytics

| Aspect | Specification |
|--------|--------------|
| **Data source** | Variant records, order items |
| **Granularity** | Per variant, per product, per category |
| **Visualizations** | Heat map (stock levels), bar chart (distribution), alert list |
| **Filters** | Category, stock status, price range |
| **KPIs** | Total stock, stock value, low stock count, turnover rate |
| **Comparisons** | Period-over-period |
| **Drill-down** | Click product → stock movement history |
| **Export** | CSV, Excel |

### 6.7 Shipping Performance Analytics

| Aspect | Specification |
|--------|--------------|
| **Data source** | Order records with shipping data |
| **Granularity** | Per carrier, per region, per period |
| **Visualizations** | Bar chart (delivery time), line chart (trend), comparison table |
| **Filters** | Date range, carrier, region, status |
| **KPIs** | Average delivery time, on-time rate, cost per order |
| **Comparisons** | Carrier comparison, period comparison |
| **Drill-down** | Click carrier → shipment list |
| **Export** | CSV, Excel |

### 6.8 Refund Trends Analytics

| Aspect | Specification |
|--------|--------------|
| **Data source** | Refund records, order records |
| **Granularity** | Daily, weekly, monthly |
| **Visualizations** | Line chart (rate trend), pie chart (reasons), bar chart (by product) |
| **Filters** | Date range, reason, product, status |
| **KPIs** | Refund rate, refund amount, average refund value |
| **Comparisons** | Period-over-period |
| **Drill-down** | Click data point → refund list |
| **Export** | CSV, Excel |

### 6.9 Finance Trends Analytics

| Aspect | Specification |
|--------|--------------|
| **Data source** | Finance engine records |
| **Granularity** | Daily, weekly, monthly |
| **Visualizations** | Stacked area chart (revenue components), waterfall chart |
| **Filters** | Date range, type (revenue/commission/settlement) |
| **KPIs** | Revenue, commission, settlements, net profit |
| **Comparisons** | Period-over-period, budget vs. actual (future) |
| **Drill-down** | Click component → transaction list |
| **Export** | CSV, Excel, PDF |

### 6.10 Platform Health Analytics

| Aspect | Specification |
|--------|--------------|
| **Data source** | System metrics, API logs, error logs |
| **Granularity** | Per hour, per day |
| **Visualizations** | Line chart (API response time), bar chart (error rates), status indicators |
| **Filters** | Date range, endpoint, error type |
| **KPIs** | API response time, error rate, uptime, active users |
| **Comparisons** | Period-over-period |
| **Drill-down** | Click metric → individual request logs |
| **Export** | CSV, Excel |

---

## 7. Filtering Architecture

### 7.1 What

The complete system for filtering report data across all report types, ensuring consistent filter behavior, URL persistence, and cross-report filter reuse.

### 7.2 Why

- **Relevance:** Users see only the data they need
- **Performance:** Filtered queries are faster than full scans
- **UX:** Consistent filter behavior across all reports
- **Shareability:** Filtered views are shareable via URL

### 7.3 Where

Every report and analytics view across admin, shop owner, and customer interfaces.

### 7.4 Filter Types

#### 7.4.1 Date Filters

| Filter | Options | Default | Implementation |
|--------|---------|---------|---------------|
| **Quick ranges** | Today, Yesterday, Last 7 days, Last 30 days, This month, Last month, This quarter, Last quarter, This year, Last year | Last 30 days | URL param: `?dateRange=last30` |
| **Custom range** | Start date + End date picker | — | URL params: `?dateFrom=2026-01-01&dateTo=2026-01-31` |
| **Comparison** | Enable period-over-period comparison toggle | Off | URL param: `?compare=true` |

#### 7.4.2 Status Filters

| Report Domain | Status Options | Default |
|---------------|---------------|---------|
| **Orders** | Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Returned, Refunded | All |
| **Payments** | Pending, Authorized, Captured, Failed, Refunded, Partially Refunded | All |
| **Products** | Active, Inactive, Draft | Active |
| **Reviews** | Pending, Approved, Rejected | All |
| **Refunds** | Pending, Approved, Rejected, Processed | All |
| **Settlements** | Pending, Processing, Completed, Failed | All |

#### 7.4.3 User Filters

| Filter | Scope | Implementation |
|--------|-------|---------------|
| **Shop Owner** | Own data only | Auto-applied based on role |
| **Customer** | Own data only | Auto-applied based on role |
| **Admin** | All data | No auto-filter |

#### 7.4.4 Shop Filters

| Filter | Options | Implementation |
|--------|---------|---------------|
| **Single shop** | Dropdown of shops | URL param: `?shopId=uuid` |
| **All shops** | "All Shops" option | Default for admin |

#### 7.4.5 Category Filters

| Filter | Options | Implementation |
|--------|---------|---------------|
| **Single category** | Dropdown (hierarchical) | URL param: `?categoryId=uuid` |
| **Multiple categories** | Multi-select | URL params: `?categories=uuid1,uuid2` |
| **All categories** | "All Categories" option | Default |

#### 7.4.6 Product Filters

| Filter | Options | Implementation |
|--------|---------|---------------|
| **Single product** | Searchable dropdown | URL param: `?productId=uuid` |
| **Multiple products** | Searchable multi-select | URL params: `?products=uuid1,uuid2` |
| **Price range** | Min/max inputs | URL params: `?minPrice=100&maxPrice=5000` |
| **Stock status** | In Stock, Low Stock, Out of Stock | URL param: `?stockStatus=in_stock` |

#### 7.4.7 Finance Filters

| Filter | Options | Implementation |
|--------|---------|---------------|
| **Payment method** | Razorpay, COD, UPI, Netbanking | URL param: `?paymentMethod=razorpay` |
| **Amount range** | Min/max inputs | URL params: `?minAmount=100&maxAmount=10000` |
| **Settlement status** | Pending, Completed | URL param: `?settlementStatus=pending` |

#### 7.4.8 Custom Filters

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Filter builder** | Add/remove filter conditions dynamically | Power users |
| **Filter presets** | Save commonly used filter combinations | Efficiency |
| **Filter sharing** | Share filtered view via URL | Collaboration |
| **Filter persistence** | Filters persist across page navigation (URL state) | UX |

### 7.5 Filter Implementation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **URL state** | All filters stored in URL search params | Shareable, bookmarkable |
| **Default values** | Every filter has sensible defaults | Beginner-friendly |
| **Clear all** | "Clear Filters" button resets to defaults | UX |
| **Active indicator** | Show count of active filters | Awareness |
| **Mobile layout** | Filters collapse into bottom sheet on mobile | Responsive |
| **Debounce text inputs** | 300ms debounce on search-type filters | Performance |
| **Server-side filtering** | All filtering happens on server, not client | Performance |
| **Filter validation** | Validate filter values on server before querying | Security |
| **Empty state** | Show helpful message when filters return no results | UX |
| **Filter chips** | Active filters shown as removable chips | Visibility |

---

## 8. Search Architecture

### 8.1 What

The system for searching within reports, searching for exports, saving filter presets, and tracking report generation history.

### 8.2 Why

- **Discovery:** Users find specific reports quickly
- **Efficiency:** Saved filters prevent repeated configuration
- **Auditability:** Report history shows what was generated and when
- **Reuse:** Previous exports can be re-downloaded

### 8.3 Where

Report listing pages, export history pages, and report detail pages.

### 8.4 Report Search

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Search scope** | Report name, description, category | Discoverability |
| **Search method** | Server-side search with debounced input | Performance |
| **Result ranking** | By relevance (name match > description match) | Quality |
| **Recent reports** | Show recently accessed reports at top | Efficiency |
| **Category browsing** | Group reports by domain (Sales, Finance, etc.) | Organization |
| **Quick access** | Pin favorite reports to dashboard | Power users |

### 8.5 Export Search

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Search scope** | Export filename, report type, date range | Discoverability |
| **History list** | Paginated list of past exports | Audit trail |
| **Re-download** | Re-download expired exports (regenerate) | Convenience |
| **Filter by status** | Completed, Failed, Expired | Management |
| **Bulk delete** | Select and delete export history | Cleanup |
| **Storage awareness** | Show total export storage used | Resource management |

### 8.6 Saved Filters

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Save filter preset** | Name and save current filter configuration | Efficiency |
| **Apply preset** | One-click apply saved filter | Efficiency |
| **Share preset** | Share filter preset with other users (future) | Collaboration |
| **Default preset** | Set a preset as default for a report | Personalization |
| **Max presets** | 20 saved presets per user | Storage management |
| **Preset naming** | User-defined name, max 100 characters | Identification |

### 8.7 Report History

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Generation log** | Log every report generation: report type, filters, timestamp, row count | Audit |
| **Access history** | Track which reports each user accesses | Analytics |
| **Usage analytics** | Most-used reports, least-used reports | Product improvement |
| **Export history** | List of all exports with status | Management |
| **Re-generation** | Re-generate report with same parameters | Efficiency |
| **Expiration** | Export files expire after 7 days | Storage management |

---

## 9. Visualization Architecture

### 9.1 What

The complete design system for data visualization components including tables, charts, KPI cards, and comparison views.

### 9.2 Why

- **Consistency:** Same chart types render identically across all reports
- **Readability:** Charts communicate insights faster than raw numbers
- **Accessibility:** All visualizations are accessible to screen readers
- **Performance:** Charts render efficiently on mobile devices

### 9.3 Where

Every report, dashboard, and analytics view across admin, shop owner, and customer interfaces.

### 9.4 Visualization Components

#### 9.4.1 Tables

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Responsive** | Horizontal scroll on mobile with sticky first column | Mobile usability |
| **Sortable columns** | Click header to sort asc/desc | Interactivity |
| **Pagination** | 20, 50, 100 rows per page (configurable) | Performance |
| **Row selection** | Checkbox column for bulk actions | Efficiency |
| **Sticky header** | Header remains visible while scrolling | Context |
| **Column resizing** | Drag column borders to resize (desktop) | Customization |
| **Empty state** | Friendly message with illustration when no data | UX |
| **Loading state** | Skeleton rows while loading | Perceived performance |
| **Row hover** | Highlight row on hover (desktop only) | Interactivity |
| **Zebra striping** | Alternating row backgrounds | Readability |
| **Number alignment** | Numbers right-aligned, text left-aligned | Financial convention |
| **Currency formatting** | ₹ symbol with Indian comma system | Localization |

#### 9.4.2 KPI Cards

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Layout** | Large number + label + trend + comparison | Instant readability |
| **Trend indicator** | Arrow up (green), arrow down (red), dash (gray) | Quick interpretation |
| **Comparison text** | "+12.5% vs. last period" | Context |
| **Sparkline** | Small inline chart showing trend | Trajectory |
| **Loading state** | Skeleton with shimmer effect | Perceived performance |
| **Null state** | "—" with tooltip explanation | Clarity |
| **Mobile layout** | 2-column grid | Responsive |
| **Desktop layout** | 4-column grid | Responsive |
| **Color coding** | Green (positive), Red (negative), Blue (neutral) | Semantic |
| **Accessibility** | ARIA labels describing the metric | Inclusive |

#### 9.4.3 Line Charts

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Library** | Recharts (or lightweight alternative) | Performance |
| **Responsive** | SVG-based, scales to container | Mobile |
| **Tooltips** | Show exact values on hover/tap | Precision |
| **Grid lines** | Subtle horizontal grid lines | Readability |
| **Axis labels** | Date/number labels on axes | Context |
| **Multiple lines** | Max 4 lines per chart for readability | Clarity |
| **Colors** | Distinct colors with legend | Differentiation |
| **Area fill** | Optional semi-transparent area under line | Visual weight |
| **Animation** | Subtle entrance animation (< 300ms) | Polish |
| **Null points** | Gap in line for missing data | Accuracy |

#### 9.4.4 Bar Charts

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Horizontal** | For categorical data with long labels | Readability |
| **Vertical** | For time-series data | Convention |
| **Stacked** | For composition analysis | Multi-dimensional |
| **Grouped** | For comparison across categories | Side-by-side |
| **Tooltips** | Show exact values on hover/tap | Precision |
| **Labels** | Value labels on bars (when space permits) | Direct reading |
| **Max bars** | 12 bars per chart for readability | Clarity |
| **Colors** | Consistent color scheme across charts | Brand consistency |
| **Animation** | Subtle entrance animation (< 300ms) | Polish |

#### 9.4.5 Pie Charts

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Usage** | Only for composition (parts of whole) | Appropriate use |
| **Max segments** | 6 segments + "Other" category | Readability |
| **Labels** | Percentage labels on segments | Direct reading |
| **Legend** | Color-coded legend with values | Context |
| **Donut variant** | Default to donut (hole in center) for modern look | Aesthetics |
| **Center label** | Total value in center of donut | Summary |
| **Tooltips** | Show exact values and percentages | Precision |
| **Animation** | Subtle entrance animation (< 300ms) | Polish |

#### 9.4.6 Trend Indicators

| Indicator | Usage | Visual |
|-----------|-------|--------|
| **Up arrow (green)** | Positive trend | ↑ +12.5% |
| **Down arrow (red)** | Negative trend | ↓ -3.2% |
| **Dash (gray)** | No change / neutral | — 0.0% |
| **Up arrow (red)** | Negative metric increasing (e.g., refund rate) | ↑ +2.1% (red) |
| **Down arrow (green)** | Negative metric decreasing (e.g., churn rate) | ↓ -1.5% (green) |

#### 9.4.7 Comparison Views

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Side-by-side** | Two periods displayed adjacent | Direct comparison |
| **Dual axis** | Two metrics on same chart (when scales align) | Correlation |
| **Delta highlight** | Highlight differences between periods | Insight |
| **Winner indicator** | Highlight which period performed better | Quick decision |

#### 9.4.8 Summary Cards

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Layout** | Card with title, value, icon, optional description | Organization |
| **Grouping** | Group related KPIs in card clusters | Hierarchy |
| **Actions** | Optional action button (e.g., "View Details") | Navigation |
| **Badge** | Status badge for current state (e.g., "Healthy", "Warning") | Quick status |

### 9.5 Visualization Color System

| Category | Colors | Usage |
|----------|--------|-------|
| **Primary** | Blue (#3B82F6) | Default chart color, primary actions |
| **Success** | Green (#10B981) | Positive trends, completed status |
| **Danger** | Red (#EF4444) | Negative trends, error status |
| **Warning** | Amber (#F59E0B) | Warning status, caution |
| **Neutral** | Gray (#6B7280) | Default, inactive, no change |
| **Extended palette** | Indigo, Cyan, Rose, Violet | Multi-series charts |

### 9.6 Visualization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Chart type selection** | Use the right chart for the data type | Clarity |
| **Data-ink ratio** | Maximize data, minimize decoration | Readability |
| **Consistent scales** | Same axis scales for same metrics across reports | Comparability |
| **Color accessibility** | Colors pass WCAG AA contrast ratio | Inclusive |
| **Screen reader support** | ARIA labels on all chart elements | Accessibility |
| **Print-friendly** | Charts work in grayscale (PDF export) | Export quality |
| **Progressive loading** | Show skeleton → chart | Perceived performance |
| **Animation respect** | Respect prefers-reduced-motion | Accessibility |
| **Tooltip availability** | All data points have tooltips | Precision |
| **No 3D charts** | 2D only for accuracy | Readability |

---

## 10. Permissions Architecture

### 10.1 What

The complete permission model for reports, exports, scheduling, sharing, and archival across all user roles on the Nabome platform.

### 10.2 Why

- **Security:** Users see only data they're authorized to view
- **Compliance:** Export of sensitive data requires proper authorization
- **Privacy:** Customer data protected from unauthorized access
- **Auditability:** All report access and export activity is logged

### 10.3 Where

Every report, export, and analytics endpoint across the platform.

### 10.4 Permission Matrix

#### 10.4.1 View Permissions

| Report Category | Customer | Shop Owner | Admin |
|----------------|----------|------------|-------|
| **Dashboard (overview)** | ✗ | ✓ (own shop) | ✓ (all) |
| **Sales Reports** | ✗ | ✓ (own sales) | ✓ (all) |
| **Revenue Reports** | ✗ | ✓ (own revenue) | ✓ (all) |
| **Finance Reports** | ✗ | ✓ (own settlements) | ✓ (all) |
| **Order Reports** | ✓ (own orders) | ✓ (own orders) | ✓ (all) |
| **Product Reports** | ✗ | ✓ (own products) | ✓ (all) |
| **Inventory Reports** | ✗ | ✓ (own inventory) | ✓ (all) |
| **Customer Reports** | ✗ | ✗ | ✓ (all) |
| **Shop Reports** | ✗ | ✓ (own shop) | ✓ (all) |
| **Shipping Reports** | ✓ (own shipments) | ✓ (own shipments) | ✓ (all) |
| **Return Reports** | ✓ (own returns) | ✓ (own returns) | ✓ (all) |
| **Refund Reports** | ✓ (own refunds) | ✓ (own refunds) | ✓ (all) |
| **Notification Reports** | ✗ | ✗ | ✓ |
| **Storage Reports** | ✗ | ✗ | ✓ |
| **Audit Reports** | ✗ | ✗ | ✓ |
| **System Reports** | ✗ | ✗ | ✓ |

#### 10.4.2 Export Permissions

| Export Action | Customer | Shop Owner | Admin |
|--------------|----------|------------|-------|
| **Export own data** | ✓ (order history) | ✓ (own reports) | ✓ (all reports) |
| **Export other users' data** | ✗ | ✗ | ✓ |
| **Bulk export** | ✗ | ✓ (own data) | ✓ (all data) |
| **PDF export** | ✓ (own orders) | ✓ (own reports) | ✓ (all reports) |
| **Schedule export** | ✗ | ✗ | ✓ (future) |
| **Export audit logs** | ✗ | ✗ | ✓ |

#### 10.4.3 Schedule Permissions (Future)

| Schedule Action | Customer | Shop Owner | Admin |
|----------------|----------|------------|-------|
| **Schedule own reports** | ✗ | ✗ | ✓ |
| **Schedule for others** | ✗ | ✗ | ✓ |
| **Modify schedule** | ✗ | ✗ | ✓ |
| **Delete schedule** | ✗ | ✗ | ✓ |

#### 10.4.4 Share Permissions (Future)

| Share Action | Customer | Shop Owner | Admin |
|-------------|----------|------------|-------|
| **Share dashboard view** | ✗ | ✓ (own) | ✓ (all) |
| **Share with specific users** | ✗ | ✗ | ✓ |
| **Public dashboard link** | ✗ | ✗ | ✓ |

#### 10.4.5 Archive Permissions

| Archive Action | Customer | Shop Owner | Admin |
|---------------|----------|------------|-------|
| **Archive export** | ✓ (own) | ✓ (own) | ✓ (all) |
| **Delete export** | ✓ (own) | ✓ (own) | ✓ (all) |
| **View archive** | ✓ (own) | ✓ (own) | ✓ (all) |

### 10.5 Permission Implementation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default deny** | No report access without explicit permission | Security |
| **Role-based** | Permissions derived from user role | Consistency |
| **Resource-scoped** | Shop owners see only their shop's data | Privacy |
| **Data filtering** | Server enforces data scope, never client-side | Security |
| **Export authorization** | Verify permission before every export | Security |
| **Audit logging** | Log all report access and export events | Compliance |
| **Session validation** | Verify session on every report request | Security |
| **Rate limiting** | Limit report requests per user per minute | Performance |
| **IP logging** | Log IP address for sensitive report access | Security |

---

## 11. Performance Architecture

### 11.1 What

The complete performance strategy for reports, exports, and analytics ensuring enterprise-scale datasets load within acceptable timeframes.

### 11.2 Why

- **User trust:** Slow reports erode confidence in the platform
- **Productivity:** Time spent waiting is time wasted
- **Scalability:** Performance must hold as data grows
- **Cost:** Efficient queries reduce database load and cost

### 11.3 Where

Every report query, export generation, and analytics computation across the platform.

### 11.4 Performance SLAs

| Operation | Target | Maximum | Measurement |
|-----------|--------|---------|-------------|
| **Dashboard load** | < 2 seconds | < 5 seconds | Time to interactive |
| **Report data fetch** | < 1 second | < 3 seconds | API response time |
| **Chart rendering** | < 500ms | < 1 second | Time to paint |
| **Small export (< 10K rows)** | < 5 seconds | < 15 seconds | Time to download |
| **Large export (10K-100K rows)** | < 30 seconds | < 2 minutes | Background job time |
| **Materialized view refresh** | < 30 seconds | < 5 minutes | Refresh duration |
| **KPI calculation** | < 500ms | < 2 seconds | Query time |

### 11.5 Performance Strategies

#### 11.5.1 Large Dataset Handling

| Strategy | Implementation | Rationale |
|----------|---------------|-----------|
| **Materialized views** | Pre-aggregate common queries | Fast dashboard loads |
| **Cursor-based pagination** | Use cursor instead of offset for large datasets | Consistent performance |
| **Column selection** | SELECT only needed columns, never SELECT * | Reduced I/O |
| **Index optimization** | Composite indexes for common query patterns | Query speed |
| **Query limiting** | Limit result sets with appropriate page sizes | Memory management |
| **Lazy loading** | Load visible data first, defer rest | Perceived performance |

#### 11.5.2 Background Generation

| Strategy | Implementation | Rationale |
|----------|---------------|-----------|
| **Async processing** | Large exports processed in background | Non-blocking |
| **Queue system** | Cloudflare Queues for export jobs | Reliable processing |
| **Progress tracking** | Real-time progress updates via polling | UX |
| **Retry logic** | Automatic retry on transient failures | Resilience |
| **Priority queue** | Admin exports get higher priority | Business needs |
| **Worker isolation** | Export workers don't affect API performance | Isolation |

#### 11.5.3 Queue Processing

| Strategy | Implementation | Rationale |
|----------|---------------|-----------|
| **Cloudflare Queues** | Message queue for background jobs | Reliability |
| **Dead letter queue** | Failed jobs moved to DLQ for investigation | Debugging |
| **Retry with backoff** | Exponential backoff on retries | Resource protection |
| **Batch processing** | Process multiple exports in batch | Efficiency |
| **Concurrency control** | Limit concurrent export jobs | Resource management |
| **Timeout handling** | Kill jobs exceeding time limit | Resource protection |

#### 11.5.4 Caching

| Strategy | Implementation | TTL | Invalidation |
|----------|---------------|-----|--------------|
| **Dashboard KPIs** | KV cache | 5 minutes | On write event |
| **Report data** | KV cache | 15 minutes | On data change |
| **Materialized views** | PostgreSQL refresh | Hourly/Daily | Scheduled refresh |
| **Static aggregations** | KV cache | 1 hour | On data change |
| **Chart configurations** | Client-side cache | Session | Never |

#### 11.5.5 Incremental Loading

| Strategy | Implementation | Rationale |
|----------|---------------|-----------|
| **Progressive rendering** | Show summary first, details after | Perceived performance |
| **Skeleton screens** | Show layout placeholders while loading | Perceived performance |
| **Streaming data** | Stream large datasets in chunks | Memory management |
| **Virtual scrolling** | Render only visible rows in large tables | DOM performance |
| **Lazy chart loading** | Load charts below fold after initial render | Initial load speed |

#### 11.5.6 Export Optimization

| Strategy | Implementation | Rationale |
|----------|---------------|-----------|
| **Streaming writes** | Write to file incrementally | Memory management |
| **Compression** | Gzip exports > 1MB | Download speed |
| **Chunked generation** | Generate in 1000-row chunks | Memory management |
| **Connection pooling** | Use Hyperdrive for export queries | Connection efficiency |
| **Read replicas** | Query read replicas for exports | Reduce primary load |

### 11.6 Performance Monitoring

| Metric | Alert Threshold | Action |
|--------|----------------|--------|
| **API response time** | > 3 seconds | Investigate query, add index |
| **Export generation time** | > 2 minutes | Optimize query, increase resources |
| **Materialized view refresh** | > 5 minutes | Check refresh query, add index |
| **Cache hit rate** | < 80% | Review cache strategy |
| **Database connection count** | > 80% pool | Scale connection pool |
| **Error rate** | > 1% | Investigate and fix |

---

## 12. Security Architecture

### 12.1 What

The complete security model for reports, exports, and analytics data ensuring data privacy, authorization enforcement, audit compliance, and secure file delivery.

### 12.2 Why

- **Data privacy:** Reports contain sensitive business and customer data
- **Compliance:** Regulatory requirements for data access and export
- **Trust:** Users must trust their data is protected
- **Accountability:** All access must be traceable

### 12.3 Where

Every report endpoint, export handler, and analytics query across the platform.

### 12.4 Security Standards

#### 12.4.1 Data Privacy

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **PII masking** | Customer emails, phones masked in exports unless authorized | Privacy |
| **Data minimization** | Export only fields the user needs | Least privilege |
| **Encryption at rest** | R2 objects encrypted with SSE | Storage security |
| **Encryption in transit** | HTTPS for all report/export traffic | Transport security |
| **Retention limits** | Export files deleted after 7 days | Data minimization |
| **No client-side data** | All filtering/pagination server-side | Security |

#### 12.4.2 Export Authorization

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Permission check** | Verify export permission before generation | Authorization |
| **Data scope** | Enforce data scope (shop, customer) on exports | Privacy |
| **Rate limiting** | 10 exports per hour per user | Abuse prevention |
| **Row limit** | Max 100,000 rows per export | Resource protection |
| **File size limit** | Max 50MB per export file | Storage protection |
| **Signed URLs** | Time-limited, one-time download URLs | Secure delivery |
| **URL expiry** | 15-minute expiry on download URLs | Time-bound access |
| **Download logging** | Log every download with timestamp and IP | Audit trail |

#### 12.4.3 Audit Logging

| Event | Data Captured | Retention |
|-------|--------------|-----------|
| **Report viewed** | User ID, report type, filters, timestamp, IP | 1 year |
| **Export generated** | User ID, report type, format, row count, timestamp, IP | 1 year |
| **Export downloaded** | User ID, file name, timestamp, IP | 1 year |
| **Export failed** | User ID, report type, error, timestamp | 1 year |
| **Filter saved** | User ID, preset name, filters, timestamp | 1 year |
| **Report scheduled** | User ID, report type, schedule, timestamp | 1 year |

#### 12.4.4 Sensitive Reports

| Report | Sensitivity | Additional Security |
|--------|------------|-------------------|
| **Financial reports** | High | Admin-only, audit logging |
| **Audit logs** | High | Admin-only, IP logging |
| **Customer data** | High | Admin-only, PII masking |
| **Revenue reports** | Medium | Admin + Shop Owner (own) |
| **System reports** | High | Admin-only |
| **Payment reconciliation** | High | Admin-only, audit logging |

#### 12.4.5 Secure Downloads

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Signed URLs** | HMAC-signed URLs with expiry | Prevent URL guessing |
| **One-time use** | URL invalidated after download | Prevent sharing |
| **HTTPS only** | Downloads over HTTPS only | Transport security |
| **No directory listing** | R2 bucket not publicly browsable | Security |
| **Content-Disposition** | Force download, not inline display | Security |
| **Virus scanning** | Scan exports > 1MB before delivery (future) | Malware prevention |

#### 12.4.6 Permission Enforcement

| Layer | Responsibility | Implementation |
|-------|---------------|---------------|
| **API Gateway** | Rate limiting, CORS | Cloudflare |
| **Middleware** | Authentication, CSRF | Custom middleware |
| **Handler** | Authorization, data scope | Role + resource checks |
| **Query** | Row-level filtering | Prisma where clauses |
| **Export** | Permission re-check | Verify before file generation |
| **Download** | URL validation, one-time use | Signed URL + R2 rules |

### 12.5 Security Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Zero trust** | Every request validated regardless of source | Security |
| **Least privilege** | Users get minimum required permissions | Security |
| **Defense in depth** | Multiple security layers | Resilience |
| **Fail securely** | Deny access on error, not grant | Security |
| **No security through obscurity** | Security doesn't rely on hidden URLs | Robustness |
| **Audit everything** | All access logged for investigation | Compliance |
| **Encrypt sensitive data** | PII encrypted at rest and in transit | Privacy |
| **Regular security review** | Quarterly permission and access review | Compliance |

---

## 13. Accessibility Architecture

### 13.1 What

The complete accessibility standards for reports, exports, charts, and dashboards ensuring all users can access and understand business data regardless of ability.

### 13.2 Why

- **Inclusivity:** Every user deserves access to their business data
- **Compliance:** Meets WCAG 2.1 AA standards
- **Legal:** Accessibility is a legal requirement in many jurisdictions
- **Business:** Accessible reports serve more users

### 13.3 Where

Every report, dashboard, chart, table, and export across the platform.

### 13.4 Accessibility Standards

#### 13.4.1 Mobile Reporting

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Touch targets** | Minimum 44x44px tap targets | Mobile usability |
| **Readable fonts** | Minimum 14px body text, 16px for data | Readability |
| **Sufficient contrast** | 4.5:1 contrast ratio for text | WCAG AA |
| **Gesture alternatives** | All gestures have tap alternatives | Inclusive |
| **Orientation** | Works in portrait and landscape | Flexibility |
| **Zoom support** | Reports zoom up to 200% without breaking | Accessibility |

#### 13.4.2 Responsive Tables

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Horizontal scroll** | Tables scroll horizontally on mobile | Content access |
| **Sticky first column** | Key identifier column stays visible | Context |
| **Sticky header** | Column headers visible while scrolling | Context |
| **Compact mode** | Reduced padding on small screens | Space efficiency |
| **Priority columns** | Most important columns visible first | Information hierarchy |
| **Expandable rows** | Tap to expand for additional details | Progressive disclosure |

#### 13.4.3 Keyboard Navigation

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Tab order** | Logical tab order through interactive elements | Navigation |
| **Focus indicators** | Visible focus ring on all interactive elements | Visibility |
| **Keyboard shortcuts** | Common actions accessible via keyboard | Power users |
| **Escape key** | Close modals, clear filters | Convention |
| **Arrow keys** | Navigate within tables and charts | Convention |
| **Enter/Space** | Activate buttons and links | Convention |
| **Skip links** | "Skip to content" for report pages | Efficiency |

#### 13.4.4 Screen Readers

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **ARIA labels** | All charts have descriptive ARIA labels | Description |
| **Data tables** | Proper `<th>`, `<caption>`, `scope` attributes | Structure |
| **Live regions** | Announce data updates via `aria-live` | Awareness |
| **Chart alternatives** | Text summary of chart data available | Alternative access |
| **Form labels** | All filter inputs have associated labels | Identification |
| **Error announcements** | Errors announced via `aria-live="assertive"` | Awareness |
| **Loading announcements** | Loading states announced | Awareness |

#### 13.4.5 High Contrast

| Standard | Specification | Rationale |
|----------|--------------|-----------|
| **Color contrast** | 4.5:1 for text, 3:1 for large text | WCAG AA |
| **Chart colors** | Distinct colors pass contrast checks | Visibility |
| **Non-color indicators** | Don't rely solely on color for meaning | Color blindness |
| **Pattern fills** | Use patterns in addition to color for charts | Accessibility |
| **Focus indicators** | High contrast focus rings | Visibility |
| **Dark mode** | Full support for dark mode reports | Preference |

### 13.5 Accessibility Testing

| Test | Tool | Frequency |
|------|------|-----------|
| **Automated scan** | axe-core | Every build |
| **Manual testing** | Keyboard-only navigation | Every PR |
| **Screen reader testing** | VoiceOver (macOS), NVDA (Windows) | Monthly |
| **Color contrast check** | Contrast checker tool | Every design change |
| **Mobile testing** | Real device testing | Every release |

---

## 14. Future Readiness Architecture

### 14.1 What

The architectural readiness for future analytics capabilities including AI analytics, predictive reporting, scheduled reports, dashboard sharing, and data warehouse integration.

### 14.2 Why

- **Scalability:** Current architecture must support future features without redesign
- **Competitive advantage:** AI analytics differentiates Nabome from competitors
- **Enterprise needs:** Scheduled reports and sharing are enterprise requirements
- **Data maturity:** Data warehouse enables advanced analytics

### 14.3 Where

Architecture decisions in this section inform current implementation to ensure future compatibility.

### 14.4 AI Analytics

| Aspect | Specification |
|--------|--------------|
| **Natural language queries** | Users ask questions in plain English, system generates reports |
| **Anomaly detection** | AI identifies unusual patterns in sales, revenue, traffic |
| **Smart recommendations** | "Products with declining sales may need price adjustment" |
| **Automated insights** | "Revenue increased 15% this month, driven by Category X" |
| **Predictive forecasting** | "Based on trends, next month's revenue is projected at ₹X" |
| **Architecture requirement** | All report data must be queryable via structured API for AI consumption |

### 14.5 Predictive Reporting

| Aspect | Specification |
|--------|--------------|
| **Revenue forecasting** | ML model trained on historical revenue data |
| **Demand forecasting** | Predict product demand for inventory planning |
| **Churn prediction** | Identify customers likely to churn |
| **Seasonal trends** | Predict seasonal patterns for planning |
| **Architecture requirement** | Historical data must be retained and structured for model training |

### 14.6 Scheduled Reports (Future)

| Aspect | Specification |
|--------|--------------|
| **Schedule types** | Daily, weekly, monthly, quarterly |
| **Delivery methods** | Email attachment, dashboard notification, webhook |
| **Report types** | All report types support scheduling |
| **Management** | Create, edit, delete schedules via UI |
| **Architecture requirement** | Export engine must support programmatic generation |

### 14.7 Email Reports (Future)

| Aspect | Specification |
|--------|--------------|
| **Email templates** | Branded email templates for report delivery |
| **Attachment formats** | PDF and Excel attachments |
| **Frequency** | Matches schedule configuration |
| **Unsubscribe** | Users can opt out of email reports |
| **Architecture requirement** | Resend integration must support attachment sending |

### 14.8 Dashboard Sharing (Future)

| Aspect | Specification |
|--------|--------------|
| **Share with users** | Share dashboard view with specific users |
| **Share with roles** | Share with all users of a role |
| **Public links** | Generate public view-only links (no auth required) |
| **Permission inheritance** | Shared dashboards respect source permissions |
| **Architecture requirement** | Dashboard state must be serializable and shareable |

### 14.9 Executive Dashboards (Future)

| Aspect | Specification |
|--------|--------------|
| **High-level view** | C-suite focused metrics only |
| **Real-time updates** | Live data feed |
| **Customizable layout** | Drag-and-drop widget arrangement |
| **Presentation mode** | Full-screen mode for meetings |
| **Architecture requirement** | Dashboard widget system must support custom layouts |

### 14.10 Real-time Analytics (Future)

| Aspect | Specification |
|--------|--------------|
| **Live data** | Sub-second data freshness |
| **WebSocket updates** | Push updates to dashboard |
| **Live counters** | Real-time order count, revenue counter |
| **Live activity feed** | Real-time event stream |
| **Architecture requirement** | WebSocket infrastructure must be available |

### 14.11 Custom Report Builder (Future)

| Aspect | Specification |
|--------|--------------|
| **Drag-and-drop** | Visual report builder interface |
| **Custom columns** | User selects which columns to display |
| **Custom filters** | User defines filter conditions |
| **Custom groupings** | User selects grouping dimensions |
| **Save custom reports** | Users save custom report configurations |
| **Architecture requirement** | Query builder must support dynamic column/filter/group selection |

### 14.12 Data Warehouse Readiness (Future)

| Aspect | Specification |
|--------|--------------|
| **ETL pipeline** | Extract, Transform, Load from PostgreSQL to data warehouse |
| **Data warehouse** | BigQuery, Snowflake, or ClickHouse |
| **Historical data** | Full historical data available for analysis |
| **Cross-source analytics** | Combine Nabome data with external data sources |
| **Architecture requirement** | All business data must be exportable in structured format |

---

## 15. Mandatory Rules for AI Agents

### 15.1 What

Non-negotiable rules that every AI agent must follow when implementing any report, export, dashboard, or analytics feature for the Nabome platform.

### 15.2 Why

- **Consistency:** Every implementation follows the same patterns
- **Quality:** Prevent common mistakes and anti-patterns
- **Security:** Prevent data leaks and permission violations
- **Performance:** Prevent slow queries and resource exhaustion

### 15.3 Rules

| # | Rule | Rationale | Violation Example |
|---|------|-----------|-------------------|
| 1 | **All reports must query PostgreSQL as single source of truth** | Prevents conflicting numbers | Caching stale data as source |
| 2 | **All exports must verify permission before generation** | Security | Generating export without auth check |
| 3 | **All report data must be filterable via URL params** | Shareability, bookmarkability | Filters in client-only state |
| 4 | **All KPIs must show period-over-period comparison** | Context enables decisions | Showing number without comparison |
| 5 | **All charts must have text alternative for screen readers** | Accessibility | Chart without ARIA label |
| 6 | **All exports must use signed URLs with expiry** | Security | Permanent download URLs |
| 7 | **All large exports must be processed asynchronously** | Performance | Blocking API for 100K row export |
| 8 | **All materialized views must use CONCURRENTLY refresh** | Availability | Locking tables during refresh |
| 9 | **All monetary values must use DECIMAL(10,2) and ₹ symbol** | Financial accuracy | Floating point for money |
| 10 | **All report queries must use indexed columns** | Performance | Full table scans |
| 11 | **All exports must be logged in audit trail** | Compliance | Export without audit entry |
| 12 | **All reports must handle empty results gracefully** | UX | Error on zero results |
| 13 | **All report APIs must follow REST conventions** | Consistency | Non-standard endpoint design |
| 14 | **All KPI calculations must exclude cancelled/refunded orders unless specified** | Accuracy | Including cancelled in revenue |
| 15 | **All report data must respect user's data scope (shop, customer)** | Privacy | Shop owner seeing other shop data |
| 16 | **All export files must be named with convention `{type}_{date}_{time}.{ext}`** | Identification | Random filenames |
| 17 | **All report components must be mobile-first** | Mobile-first principle | Desktop-only design |
| 18 | **All materialized views must have refresh tracking** | Observability | Unknown refresh state |
| 19 | **All report filters must have sensible defaults** | Beginner-friendliness | No defaults forcing configuration |
| 20 | **All export rate limits must be enforced** | Resource protection | Unlimited exports |

### 15.4 Anti-Patterns to Avoid

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|---------------|------------------|
| **SELECT * in report queries** | Fragile, slow, over-fetches | Use Prisma `select` for specific columns |
| **Client-side filtering for reports** | Insecure, slow for large datasets | Server-side filtering with Prisma where |
| **Caching reports without invalidation** | Stale data | Cache with TTL + event-based invalidation |
| **Hardcoding chart colors** | Inconsistency | Use design token color system |
| **Export without permission check** | Security vulnerability | Always authenticate + authorize |
| **Blocking API for large exports** | Timeout, poor UX | Background job + signed URL |
| **Modifying materialized view data** | Views are read-only | Create separate write tables |
| **Using float for monetary calculations** | Precision loss | Use DECIMAL(10,2) |
| **Logging sensitive data in exports** | Privacy violation | Mask PII in logs |
| **Generating exports without rate limiting** | Resource exhaustion | Enforce per-user rate limits |

---

*Last updated: August 03, 2026*
