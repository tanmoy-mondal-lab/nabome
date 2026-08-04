# নবME (Nabome) — Finance, Commission & Settlement Engine Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for financial operations, commission calculations, settlement workflows, and financial integrity  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), ORDER_MANAGEMENT_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Finance Foundation](#1-finance-foundation)
2. [Revenue Model](#2-revenue-model)
3. [Commission Engine](#3-commission-engine)
4. [Settlement Engine](#4-settlement-engine)
5. [Financial Records](#5-financial-records)
6. [Finance Settings](#6-finance-settings)
7. [Reporting](#7-reporting)
8. [Order Integration](#8-order-integration)
9. [Audit Architecture](#9-audit-architecture)
10. [Permissions Architecture](#10-permissions-architecture)
11. [Security Architecture](#11-security-architecture)
12. [Performance Architecture](#12-performance-architecture)
13. [Accessibility Architecture](#13-accessibility-architecture)
14. [Future Readiness Architecture](#14-future-readiness-architecture)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Finance Foundation

### 1.1 What

The foundational philosophy, ownership model, integrity guarantees, traceability standards, and consistency rules that govern every financial event on the Nabome platform.

### 1.2 Why

- **Financial integrity:** Every rupee must be accounted for — no financial event can be lost, duplicated, or corrupted.
- **Compliance:** Indian tax laws (GST), audit requirements, and financial regulations demand complete, immutable records.
- **Trust:** Shop owners must trust that earnings are calculated correctly. Customers must trust that charges are accurate.
- **Scalability:** Financial architecture must handle 0 to 1M+ transactions without redesign.
- **Independence:** Finance Engine operates independently from business modules — orders, products, and inventory can change without breaking financial records.

### 1.3 Where

Every order payment, commission calculation, settlement process, refund, shipping charge, coupon discount, marketing expense, and financial report across the Nabome platform.

### 1.4 Finance Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Immutable history** | Financial records are never physically deleted or modified | Audit trail, compliance, legal |
| **Append-only writes** | All financial changes create new records, never overwrite | Traceability, reproducibility |
| **Every event has a Finance ID** | Permanent, unique identifier for every financial event | Traceability, debugging |
| **Atomic transactions** | Multi-step financial operations use database transactions | Consistency, no partial states |
| **Double-entry readiness** | Architecture supports double-entry bookkeeping | Enterprise accounting |
| **Separation of concerns** | Finance Engine is independent from business modules | Maintainability, testability |
| **Zero tolerance for data loss** | Financial data backed up, replicated, and archived | Business continuity |
| **Real-time accuracy** | Financial balances computed on read, not cached stale values | Accuracy |
| **Audit by default** | Every financial action logged with actor, timestamp, and context | Compliance |
| **Configurable rules** | Commission rates, shipping charges, thresholds are admin-configurable | Business flexibility |

### 1.5 Financial Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINANCE ENGINE ARCHITECTURE                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    EVENT SOURCES                          │   │
│  │                                                           │   │
│  │  Orders │ Refunds │ Returns │ Coupons │ Shipping │       │   │
│  │  Marketing │ Manual Adjustments │ Settlements             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 FINANCE ENGINE CORE                       │   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │Commission│  │Earnings  │  │Settlement│  │Financial ││   │
│  │  │ Calculator│  │ Tracker  │  │ Workflow │  │ Records  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  │                                                           │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│   │
│  │  │Revenue   │  │Reporting │  │Audit     │  │Settings  ││   │
│  │  │ Calculator│  │ Engine   │  │ Logger   │  │ Manager  ││   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘│   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DATA LAYER                              │   │
│  │                                                           │   │
│  │  Finance Records │ Settlement History │ Commission Rules  │   │
│  │  Transaction Log │ Earnings Ledger │ Audit Trail         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Financial Ownership

| Entity | Owner | Location |
|--------|-------|----------|
| Finance records | Finance domain | `api/_handlers/finance/` |
| Commission rules | Finance domain | `api/_handlers/finance/settings/` |
| Settlement workflows | Finance domain | `api/_handlers/finance/settlements/` |
| Earnings calculations | Finance domain | `api/_handlers/finance/earnings/` |
| Revenue reports | Finance domain | `api/_handlers/finance/reports/` |
| Financial settings | Finance domain | `api/_handlers/finance/settings/` |
| Audit trail | Finance domain | `api/_lib/logging/audit.ts` |

### 1.7 Financial Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINANCIAL LIFECYCLE                            │
│                                                                  │
│  1. EVENT OCCURS                                                  │
│     → Order placed │ Refund requested │ Return approved         │
│     → Coupon applied │ Shipping charge │ Manual adjustment      │
│                                                                  │
│  2. FINANCE RECORD CREATED                                        │
│     → Unique Finance ID generated                                │
│     → Event type classified                                      │
│     → Amount calculated                                          │
│     → Linked to source entity (Order, Refund, etc.)              │
│                                                                  │
│  3. COMMISSION CALCULATED                                         │
│     → Platform commission computed                               │
│     → Shop earnings computed                                     │
│     → Commission rule applied                                    │
│     → Snapshot of rule stored                                    │
│                                                                  │
│  4. EARNINGS TRACKED                                              │
│     → Shop earnings updated                                      │
│     → Platform revenue updated                                   │
│     → Running balance maintained                                 │
│                                                                  │
│  5. SETTLEMENT CREATED                                            │
│     → Earnings grouped for payout                                │
│     → Settlement period defined                                  │
│     → Payout method selected                                     │
│                                                                  │
│  6. SETTLEMENT APPROVED                                           │
│     → Admin reviews settlement                                   │
│     → Adjustments applied if needed                              │
│     → Settlement approved                                        │
│                                                                  │
│  7. SETTLEMENT PROCESSED                                          │
│     → Payment initiated                                          │
│     → Transaction recorded                                       │
│     → Settlement marked completed                                │
│                                                                  │
│  8. AUDIT TRAIL                                                   │
│     → Every step logged                                          │
│     → Immutable history maintained                               │
│     → Reports generated                                          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.8 Financial Integrity

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Idempotency** | Every financial operation is idempotent | Prevent duplicate charges/credits |
| **Atomicity** | Multi-step operations use database transactions | No partial financial states |
| **Consistency** | All balances computed from transaction history | No stale or incorrect balances |
| **Isolation** | Concurrent financial operations don't interfere | Prevent race conditions |
| **Durability** | Committed financial data survives crashes | Business continuity |
| **Precision** | All currency values use `DECIMAL(10,2)` | Exact precision, no floating-point errors |
| **Non-repudiation** | Every financial action attributed to an actor | Legal accountability |

### 1.9 Financial Traceability

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Finance ID** | Every financial event gets a unique UUID | Permanent reference |
| **Source linkage** | Every record linked to source entity | Trace back to origin |
| **Actor attribution** | Every action tagged with user/system | Accountability |
| **Timestamp** | UTC timestamp on every record | Temporal accuracy |
| **Context** | Metadata stored with every record | Debugging, reporting |
| **Immutable logs** | Financial logs never modified or deleted | Compliance |

### 1.10 Financial Consistency

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Single source of truth** | Transaction history is the source of truth | No conflicting balances |
| **Computed on read** | Balances computed from transaction log | Always accurate |
| **No cached balances** | Never store pre-computed balances without invalidation | Prevent drift |
| **Reconciliation** | Regular reconciliation between systems | Detect discrepancies |
| **Idempotent operations** | Same operation produces same result | Prevent duplicates |

### 1.11 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Delete financial records | Destroys audit trail, illegal | Append-only, soft delete |
| Use float for currency | Rounding errors accumulate | Use DECIMAL(10,2) |
| Cache balances without invalidation | Stale data, incorrect payouts | Compute on read |
| Skip audit logging | Cannot debug, non-compliant | Log every financial event |
| Hardcode commission rates | Cannot change without deployment | Admin-configurable settings |
| Mix finance with business logic | Tight coupling, hard to maintain | Independent finance module |
| Process settlements synchronously | Blocks user requests, slow | Background processing |
| Allow negative earnings without approval | Financial risk | Require admin approval |
| Skip duplicate detection | Double charges, double payouts | Idempotency keys + unique constraints |
| Trust client-side calculations | Security risk | Server-side calculation only |

---

## 2. Revenue Model

### 2.1 What

The complete architecture for classifying, calculating, tracking, and reporting all revenue streams on the Nabome platform — from product sales to platform commission to shipping revenue.

### 2.2 Why

- **Business clarity:** Every revenue stream must be identifiable and measurable.
- **Financial accuracy:** Revenue classification drives correct accounting and tax reporting.
- **Shop owner trust:** Shop owners must understand exactly how their earnings are calculated.
- **Platform sustainability:** Platform revenue must be tracked for business viability.

### 2.3 Where

Every order, refund, settlement, financial report, and dashboard across the Nabome platform.

### 2.4 Revenue Streams

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVENUE MODEL                                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PRODUCT REVENUE (Gross Sales)                            │   │
│  │  → Sum of all order item totals                           │   │
│  │  → Before deductions                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  DEDUCTIONS                                                │   │
│  │  → Platform Commission (calculated per rule)              │   │
│  │  → Shipping Revenue (platform keeps shipping charges)     │   │
│  │  → Marketing Cost (promotional expenses)                  │   │
│  │  → Coupon Cost (platform-funded discounts)                │   │
│  │  → Refund Adjustment (returned revenue)                   │   │
│  │  → Settlement Adjustment (manual corrections)             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SHOP EARNINGS                                             │   │
│  │  → Product Revenue - Platform Commission                  │   │
│  │  → Amount payable to shop owner                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PLATFORM REVENUE                                          │   │
│  │  → Platform Commission (primary revenue)                  │   │
│  │  + Shipping Revenue (shipping markup)                     │   │
│  │  + Marketing Revenue (promotional fees)                   │   │
│  │  - Coupon Cost (platform-funded discounts)                │   │
│  │  - Refund Adjustments                                     │   │
│  │  = Net Platform Revenue                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Revenue Classification

| Revenue Type | Description | Calculation | Owner |
|--------------|-------------|-------------|-------|
| **Product Revenue** | Gross sales from product items | `Σ(orderItem.quantity × orderItem.unitPrice)` | Shop Owner |
| **Platform Commission** | Platform fee on each sale | `productRevenue × commissionRate` | Platform |
| **Shop Earnings** | Amount payable to shop owner | `productRevenue - platformCommission` | Shop Owner |
| **Shipping Revenue** | Revenue from shipping charges | `shippingChargesCollected - actualShippingCost` | Platform |
| **Marketing Cost** | Cost of promotional activities | Admin-configured per campaign | Platform |
| **Coupon Cost** | Platform-funded coupon discounts | `couponDiscountAmount` (when platform pays) | Platform |
| **Refund Adjustment** | Revenue reversal for refunds | `refundAmount` (deducted from revenue) | Platform/Shop |
| **Settlement Adjustment** | Manual financial corrections | `adjustmentAmount` (admin-approved) | Platform |

### 2.6 Product Revenue Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Calculation** | `quantity × unitPrice` per order item | Accurate per-item revenue |
| **Snapshot** | Price at time of order, not current price | Historical accuracy |
| **Tax handling** | Tax excluded from revenue calculation | Tax is pass-through |
| **Multi-item orders** | Each item tracked separately | Granular revenue tracking |
| **Partial refunds** | Revenue adjusted per refunded item | Accurate net revenue |

### 2.7 Shop Earnings Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Formula** | `productRevenue - platformCommission` | Clear deduction |
| **Accrual timing** | Earnings accrued on order confirmation | When revenue is earned |
| **Settlement timing** | Earnings paid on settlement completion | When cash transfers |
| **Pending period** | 7-day hold after delivery | Return window protection |
| **Deduction on refund** | Earnings reversed on refund | Accuracy |
| **Multi-shop orders** | Earnings calculated per shop per item | Multi-tenant isolation |

### 2.8 Platform Revenue Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Primary source** | Platform commission on each sale | Core business model |
| **Secondary source** | Shipping revenue, marketing fees | Additional revenue |
| **Expenses** | Coupon costs, refund adjustments | Revenue offsets |
| **Net calculation** | `totalCommission + shippingRevenue - couponCosts - refundAdjustments` | Net platform income |
| **Reporting** | Daily, weekly, monthly, yearly | Business intelligence |

### 2.9 Shipping Revenue Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Collection** | Shipping charges collected from customer | Revenue at checkout |
| **Cost** | Actual shipping cost paid to courier | Expense on fulfillment |
| **Net** | `collectedAmount - actualCost` | Shipping profit/loss |
| **Free shipping** | Platform absorbs shipping cost | Marketing incentive |
| **Tracking** | Each shipping transaction recorded | Financial clarity |

### 2.10 Marketing Cost Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Budget** | Admin-configured marketing budget | Financial control |
| **Campaigns** | Individual campaign tracking | ROI measurement |
| **Deduction** | Marketing costs deducted from platform revenue | Accurate profit |
| **Approval** | Marketing spend requires admin approval | Financial governance |
| **Reporting** | Marketing ROI per campaign | Business intelligence |

### 2.11 Coupon Cost Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Platform-funded** | Coupon discount paid by platform | Marketing expense |
| **Shop-funded** | Coupon discount borne by shop | Shop promotion |
| **Split-funded** | Platform and shop share coupon cost | Flexible model |
| **Tracking** | Each coupon usage tracked | Cost measurement |
| **Budget limits** | Maximum coupon budget configurable | Financial control |

### 2.12 Refund Adjustment Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full refund** | Entire order revenue reversed | Complete reversal |
| **Partial refund** | Specific item revenue reversed | Item-level accuracy |
| **Timing** | Refund adjustment on refund completion | When refund is confirmed |
| **Commission reversal** | Commission also reversed on refund | Accurate platform revenue |
| **Earnings reversal** | Shop earnings reversed on refund | Accurate shop balance |

### 2.13 Settlement Adjustment Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Manual adjustments** | Admin can add positive/negative adjustments | Error correction |
| **Approval required** | All adjustments require admin approval | Financial governance |
| **Reason required** | Every adjustment must have a reason | Audit trail |
| **Audit logged** | All adjustments logged with full context | Compliance |
| **Settlement linkage** | Adjustments linked to specific settlements | Traceability |

---

## 3. Commission Engine

### 3.1 What

The complete architecture for defining, calculating, validating, tracking, and managing platform commission on every sale — with support for global rules, category-specific rules, and shop-specific rules.

### 3.2 Why

- **Revenue:** Commission is the primary revenue source for the platform.
- **Flexibility:** Different product categories may require different commission rates.
- **Fairness:** Commission rules must be transparent and consistently applied.
- **Auditability:** Commission calculations must be reproducible and verifiable.
- **Scalability:** Commission engine must handle unlimited rules without performance degradation.

### 3.3 Where

Every order confirmation, financial calculation, settlement process, earnings report, and admin commission configuration across the Nabome platform.

### 3.4 Commission Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Configurable rates** | Commission rates are admin-configurable | Business flexibility |
| **Rule priority** | Shop-specific > Category-specific > Global | Granular control |
| **Snapshot at order time** | Commission rate snapshot stored per order | Historical accuracy |
| **Transparent to shop** | Shop owners see exact commission applied | Trust |
| **Immutable history** | Commission rules are versioned, never deleted | Audit trail |
| **Non-negative rates** | Commission rates cannot be negative | Financial integrity |
| **Maximum cap** | Commission rate cannot exceed configurable maximum | Prevent abuse |

### 3.5 Commission Rule Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMMISSION RULE HIERARCHY                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 1: SHOP-SPECIFIC COMMISSION                        │   │
│  │  → Override for specific shop                             │   │
│  │  → Highest priority                                       │   │
│  │  → Example: "Shop X gets 10% instead of 15%"             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │ (if not set)                          │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 2: CATEGORY-SPECIFIC COMMISSION                    │   │
│  │  → Override for specific product category                 │   │
│  │  → Medium priority                                        │   │
│  │  → Example: "Electronics gets 8% instead of 15%"         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │ (if not set)                          │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  LEVEL 3: GLOBAL COMMISSION                               │   │
│  │  → Default for all shops and categories                   │   │
│  │  → Lowest priority                                        │   │
│  │  → Example: "Default commission is 15%"                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.6 Commission Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Global commission** | Default rate applied to all sales | Baseline revenue |
| **Category commission** | Override rate per product category | Category-specific pricing |
| **Shop commission** | Override rate per shop | Shop-specific agreements |
| **Rate format** | Percentage (0% to 100%) | Standard commission model |
| **Minimum rate** | 0% (can be set to 0 for promotional periods) | Flexibility |
| **Maximum rate** | Configurable cap (default 50%) | Prevent abuse |
| **Decimal precision** | 2 decimal places (e.g., 15.50%) | Accuracy |
| **Effective dates** | Rules have start and end dates | Time-bound agreements |
| **Versioning** | Rules are versioned, not overwritten | Audit trail |
| **Snapshot** | Rate snapshot stored per order | Historical accuracy |

### 3.7 Global Commission Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Default rate** | Configurable (default 15%) | Baseline for all sales |
| **Effective from** | Date when rule takes effect | Time-bound |
| **Effective until** | Optional end date | Promotional periods |
| **Minimum order amount** | Optional threshold for commission | Volume incentives |
| **Maximum commission** | Cap per order | Prevent excessive deductions |
| **Notification** | Shop owners notified of rate changes | Transparency |

### 3.8 Category Commission Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Per-category rates** | Different rates per product category | Category-specific economics |
| **Category hierarchy** | Rates inherit from parent category | Simplified management |
| **Override capability** | Subcategory can override parent rate | Granular control |
| **Effective dates** | Time-bound rules | Seasonal adjustments |
| **Priority** | Category rate overrides global rate | Granular > broad |

### 3.9 Shop Commission Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Per-shop rates** | Different rates per shop | Shop-specific agreements |
| **Negotiated rates** | Rates can be individually negotiated | Business relationships |
| **Volume discounts** | Lower rates for higher volume shops | Incentive alignment |
| **Effective dates** | Time-bound agreements | Contractual periods |
| **Priority** | Shop rate overrides category and global | Highest priority |

### 3.10 Commission Calculation

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMMISSION CALCULATION FLOW                    │
│                                                                  │
│  1. ORDER CONFIRMED                                              │
│     → For each order item:                                       │
│                                                                  │
│  2. LOOKUP COMMISSION RULE                                       │
│     → Check shop-specific commission → If found, use it         │
│     → Check category-specific commission → If found, use it     │
│     → Use global commission → Default fallback                   │
│                                                                  │
│  3. CALCULATE COMMISSION                                         │
│     → commissionAmount = itemTotal × commissionRate / 100        │
│     → Round to 2 decimal places                                  │
│                                                                  │
│  4. APPLY CAPS                                                   │
│     → If commissionAmount > maxCommissionPerOrder                │
│     → Then commissionAmount = maxCommissionPerOrder              │
│                                                                  │
│  5. CREATE FINANCE RECORD                                        │
│     → Store: orderId, itemId, rate, amount, ruleSnapshot        │
│     → Link to order and shop                                     │
│                                                                  │
│  6. UPDATE EARNINGS                                              │
│     → shopEarnings = itemTotal - commissionAmount                │
│     → platformRevenue += commissionAmount                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.11 Commission Validation

| Validation | Timing | Response |
|------------|--------|----------|
| **Rate exists** | Pre-calculation | Use global default |
| **Rate is valid** | Pre-calculation | Reject invalid rate |
| **Rate is non-negative** | Pre-calculation | Reject negative rate |
| **Rate doesn't exceed cap** | Pre-calculation | Cap at maximum |
| **Effective date valid** | Pre-calculation | Use current effective rule |
| **Commission amount positive** | Post-calculation | Ensure non-negative |
| **Commission doesn't exceed item total** | Post-calculation | Cap at item total |

### 3.12 Commission History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Rule changes logged** | Every commission rule change recorded | Audit trail |
| **Version history** | Rules versioned, not overwritten | Historical accuracy |
| **Effective tracking** | Track when rules take effect | Temporal accuracy |
| **Reason for change** | Admin must provide reason for rate changes | Accountability |
| **Notification** | Shop owners notified of applicable rate changes | Transparency |

### 3.13 Commission Changes

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Retroactive rules** | New rules apply to future orders only | No retroactive changes |
| **Existing orders** | Orders use rate at time of confirmation | Historical accuracy |
| **Pending orders** | Orders not yet confirmed use current rate | Pre-confirmation flexibility |
| **Notification** | 7-day advance notice for rate increases | Shop owner planning |
| **Effective date** | Rate changes take effect on specified date | Predictable transitions |

---

## 4. Settlement Engine

### 4.1 What

The complete architecture for creating, approving, processing, completing, reversing, and tracking settlements — the process of paying shop owners their earned funds.

### 4.2 Why

- **Shop owner trust:** Timely, accurate settlements build shop owner confidence.
- **Financial control:** Settlements ensure proper fund disbursement.
- **Compliance:** Settlement records are required for tax and audit purposes.
- **Operational efficiency:** Automated settlement workflows reduce manual effort.
- **Risk management:** Settlement holds protect against refunds and disputes.

### 4.3 Where

Shop owner dashboard, admin settlement panel, financial reports, API handlers (`api/_handlers/finance/settlements/`), email notifications.

### 4.4 Settlement Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Period-based** | Settlements are created for defined periods | Predictable payout schedule |
| **Approval required** | All settlements require admin approval | Financial governance |
| **Hold period** | 7-day hold after delivery before earnings eligible | Return window protection |
| **Partial settlement** | Support settling部分 earnings | Flexibility |
| **Multiple methods** | Support digital, manual, and future bank transfer | Operational flexibility |
| **Immutable history** | Settlement records are append-only | Audit trail |
| **Reversal readiness** | Architecture supports settlement reversal | Error correction |

### 4.5 Settlement Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    SETTLEMENT LIFECYCLE                            │
│                                                                  │
│  ┌──────────┐                                                    │
│  │ PENDING  │ ◀── Earnings accrued but within hold period        │
│  └────┬─────┘                                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │ELIGIBLE   │ ◀── Hold period elapsed, earnings available       │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │CREATED    │ ◀── Settlement batch created by system/admin      │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │REVIEW     │ ◀── Admin reviewing settlement details            │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ├──▶ [REJECTED] ◀── Admin rejected (reason required)      │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │APPROVED   │ ◀── Admin approved settlement                     │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │PROCESSING │ ◀── Payment initiated                             │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ├──▶ [FAILED] ◀── Payment failed (retry or investigate)   │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │COMPLETED  │ ◀── Payment confirmed, settlement done            │
│  └────┬──────┘                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                   │
│  │ PAID      │ ◀── Funds received by shop owner                  │
│  └───────────┘                                                   │
│                                                                  │
│  ALTERNATE PATHS:                                                │
│  ┌──────────┐     ┌──────────┐                                   │
│  │ REJECTED │ ──▶ │ PENDING  │ ◀── Can be resubmitted           │
│  └──────────┘     └──────────┘                                   │
│                                                                  │
│  ┌──────────┐     ┌──────────┐                                   │
│  │ REVERSED │ ◀── │ COMPLETED│ ◀── Settlement reversed           │
│  └──────────┘     └──────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.6 Settlement Creation

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | End of settlement period or manual creation | Scheduled or on-demand |
| **Batch grouping** | Earnings grouped by shop per period | Efficient processing |
| **Hold period** | 7-day hold after delivery before eligibility | Return window |
| **Minimum amount** | Configurable minimum settlement amount | Reduce transaction costs |
| **Automatic creation** | System creates settlement batches automatically | Operational efficiency |
| **Manual creation** | Admin can create ad-hoc settlements | Flexibility |
| **Idempotency** | Prevent duplicate settlement for same period | Financial integrity |

### 4.7 Settlement Approval

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Admin review** | Admin reviews settlement details | Financial governance |
| **Adjustments** | Admin can add deductions or additions | Error correction |
| **Reason required** | Adjustments require reason | Audit trail |
| **Bulk approval** | Admin can approve multiple settlements | Efficiency |
| **Rejection** | Admin can reject with reason | Quality control |
| **Notification** | Shop owner notified of approval/rejection | Transparency |

### 4.8 Settlement Processing

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Payment initiation** | Payment initiated after approval | Controlled disbursement |
| **Method selection** | Digital, manual, or bank transfer | Operational flexibility |
| **Transaction recording** | Every payment transaction recorded | Financial clarity |
| **Retry logic** | Failed payments retried with backoff | Resilience |
| **Reconciliation** | Payments reconciled with bank statements | Accuracy |

### 4.9 Settlement Completion

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Confirmation** | Payment confirmed by payment provider | Proof of payment |
| **Receipt** | Settlement receipt generated | Shop owner record |
| **Notification** | Shop owner notified of completion | Transparency |
| **Archive** | Completed settlement archived | Historical record |
| **Reporting** | Settlement included in financial reports | Business intelligence |

### 4.10 Settlement History

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Complete record** | Every settlement fully documented | Audit trail |
| **Status tracking** | Real-time status visibility | Transparency |
| **Payment proof** | Transaction IDs and receipts stored | Evidence |
| **Adjustment history** | All adjustments logged | Accountability |
| **Immutable** | Settlement records never deleted | Compliance |

### 4.11 Settlement Reversal Readiness

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Reversal trigger** | Failed payment, fraud, error | Error correction |
| **Admin approval** | Reversals require admin approval | Financial governance |
| **Reason required** | Reversal reason mandatory | Audit trail |
| **Earnings restoration** | Earnings restored to shop owner | Accuracy |
| **Finance record** | Reversal creates new finance record | Append-only history |
| **Notification** | Shop owner notified of reversal | Transparency |

### 4.12 Settlement Methods

| Method | Description | Processing Time | Use Case |
|--------|-------------|-----------------|----------|
| **Digital** | UPI, bank transfer via payment gateway | 1-2 business days | Default |
| **Manual** | Admin manually processes payment | Varies | Edge cases |
| **Cash** | Physical cash payment (future) | Immediate | Local shops |
| **Bank Transfer** | Direct bank transfer (future) | 2-3 business days | High-volume |
| **Payment Gateway** | Automated via gateway (future) | 1-2 business days | Scale |

### 4.13 Settlement Period Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Default period** | Weekly (configurable) | Predictable schedule |
| **Custom periods** | Daily, weekly, bi-weekly, monthly | Business flexibility |
| **Period definition** | Monday-Sunday (for weekly) | Clear boundaries |
| **Cut-off time** | End of day (23:59:59 UTC) | Consistent cut-off |
| **Earnings accrual** | Earnings credited to period when delivery confirmed | Accurate timing |

---

## 5. Financial Records

### 5.1 What

The complete architecture for every type of financial record on the Nabome platform — from transaction history to earnings ledger to commission records to settlement records.

### 5.2 Why

- **Auditability:** Every financial event must be traceable.
- **Compliance:** Tax authorities require complete financial records.
- **Reporting:** Financial reports are built from accurate records.
- **Dispute resolution:** Records provide evidence for disputes.
- **Business intelligence:** Financial data drives business decisions.

### 5.3 Where

Every financial calculation, report, dashboard, settlement, and audit across the Nabome platform.

### 5.4 Financial Record Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINANCIAL RECORD TYPES                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  TRANSACTION HISTORY                                      │   │
│  │  → Every financial event recorded                         │   │
│  │  → Unique Finance ID per event                            │   │
│  │  → Source entity linked                                   │   │
│  │  → Amount, type, direction (credit/debit)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EARNINGS HISTORY                                         │   │
│  │  → Shop earnings per order/item                           │   │
│  │  → Running balance per shop                               │   │
│  │  → Accrual and settlement tracking                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  COMMISSION HISTORY                                       │   │
│  │  → Commission charged per order                           │   │
│  │  → Rule applied per calculation                           │   │
│  │  → Platform revenue from commission                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SETTLEMENT HISTORY                                       │   │
│  │  → Settlement created, approved, processed, completed     │   │
│  │  → Payment transactions linked                            │   │
│  │  → Adjustment history                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SHIPPING CHARGES                                         │   │
│  │  → Shipping collected from customer                       │   │
│  │  → Actual shipping cost                                   │   │
│  │  → Net shipping revenue                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  REFUND HISTORY                                           │   │
│  │  → Refund amounts and timing                              │   │
│  │  → Commission reversals                                   │   │
│  │  → Earnings reversals                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MARKETING EXPENSES                                       │   │
│  │  → Campaign costs                                         │   │
│  │  → Promotional spending                                   │   │
│  │  → ROI tracking                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  COUPON EXPENSES                                          │   │
│  │  → Platform-funded discounts                              │   │
│  │  → Shop-funded discounts                                  │   │
│  │  → Split-funded discounts                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PROFIT TRACKING                                          │   │
│  │  → Platform profit = revenue - expenses                   │   │
│  │  → Shop profit = earnings - costs                         │   │
│  │  → Per-order profitability                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CASH FLOW                                                │   │
│  │  → Money in (payments received)                           │   │
│  │  → Money out (settlements paid)                           │   │
│  │  → Net cash flow                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Finance Record Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Unique ID** | UUID v4 for every finance record | Permanent reference |
| **Record type** | Enum classifying the record | Query and reporting |
| **Source entity** | Link to originating entity | Traceability |
| **Source ID** | ID of originating entity | Direct linkage |
| **Amount** | DECIMAL(10,2) with currency | Exact precision |
| **Direction** | Credit or Debit | Financial clarity |
| **Balance** | Running balance after this transaction | Audit trail |
| **Actor** | User or system that created the record | Accountability |
| **Metadata** | JSONB for additional context | Flexibility |
| **Timestamp** | UTC creation time | Temporal accuracy |

### 5.6 Transaction History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Append-only** | New transactions only, never modify | Audit trail |
| **Unique Finance ID** | Every transaction has permanent ID | Traceability |
| **Source linkage** | Every transaction linked to source | Origin tracking |
| **Atomic amounts** | Amounts stored with full precision | Accuracy |
| **Balance tracking** | Running balance maintained | Quick balance checks |
| **Type classification** | Transaction type for filtering | Reporting |
| **Status tracking** | Transaction status for workflow | Process clarity |

### 5.7 Earnings History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Per-shop tracking** | Earnings tracked per shop | Multi-tenant isolation |
| **Per-order tracking** | Earnings linked to specific orders | Granular visibility |
| **Accrual tracking** | When earnings are earned vs. paid | Cash flow management |
| **Hold tracking** | Hold period status visible | Transparency |
| **Balance computation** | Balance computed from transaction history | Accuracy |

### 5.8 Commission History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Per-order tracking** | Commission recorded per order | Granular visibility |
| **Rule snapshot** | Commission rule at time of order stored | Historical accuracy |
| **Rate tracking** | Commission rate applied recorded | Transparency |
| **Platform revenue** | Commission as platform revenue tracked | Business intelligence |

### 5.9 Settlement History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Complete lifecycle** | Every settlement state change recorded | Full audit trail |
| **Payment transactions** | All payment attempts and results stored | Financial clarity |
| **Adjustment history** | All adjustments with reasons logged | Accountability |
| **Reversal records** | Reversals create new records | Append-only |

### 5.10 Shipping Charges Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Collection tracking** | Shipping charges collected from customer | Revenue tracking |
| **Cost tracking** | Actual shipping cost paid to courier | Expense tracking |
| **Net calculation** | `collected - cost = net shipping revenue` | Profit tracking |
| **Free shipping tracking** | Platform-absorbed shipping costs | Marketing expense |

### 5.11 Refund History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Refund tracking** | Every refund recorded with amount and reason | Financial clarity |
| **Commission reversal** | Commission reversed on refund | Accurate platform revenue |
| **Earnings reversal** | Shop earnings reversed on refund | Accurate shop balance |
| **Timing** | Refund timing recorded | Cash flow tracking |

### 5.12 Marketing Expenses Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Campaign tracking** | Each marketing campaign tracked | ROI measurement |
| **Budget tracking** | Marketing budget vs. actual spend | Financial control |
| **Approval workflow** | Marketing spend requires approval | Governance |
| **ROI calculation** | Return on marketing investment | Business intelligence |

### 5.13 Coupon Expenses Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Platform-funded** | Platform absorbs discount cost | Marketing expense |
| **Shop-funded** | Shop absorbs discount cost | Shop promotion |
| **Split-funded** | Cost shared between platform and shop | Flexible model |
| **Usage tracking** | Each coupon usage tracked | Cost measurement |
| **Budget limits** | Maximum coupon budget configurable | Financial control |

### 5.14 Profit Tracking Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Platform profit** | `revenue - expenses = profit` | Business viability |
| **Shop profit** | `shop earnings - shop costs = profit` | Shop performance |
| **Per-order profit** | Profit calculated per order | Granular visibility |
| **Time-based profit** | Daily, weekly, monthly profit | Trend analysis |

### 5.15 Cash Flow Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Money in** | Payments received from customers | Revenue inflow |
| **Money out** | Settlements paid to shop owners | Expense outflow |
| **Net cash flow** | `inflow - outflow = net` | Liquidity tracking |
| **Forecasting** | Cash flow projections | Business planning |

---

## 6. Finance Settings

### 6.1 What

The complete architecture for configurable financial settings that control commission rates, shipping charges, minimum order amounts, coupon budgets, and all other financial parameters.

### 6.2 Why

- **Flexibility:** Business rules change — settings must be adjustable without code deployment.
- **Control:** Admins must have full control over financial parameters.
- **Transparency:** All financial settings visible to authorized users.
- **Auditability:** Setting changes logged with actor and reason.
- **Default safety:** Sensible defaults prevent misconfiguration.

### 6.3 Where

Admin settings panel, financial calculation handlers, commission engine, settlement engine, API handlers (`api/_handlers/finance/settings/`).

### 6.4 Finance Settings Architecture

| Setting | Type | Default | Range | Description |
|---------|------|---------|-------|-------------|
| **Commission Percentage** | Decimal | 15.00% | 0-50% | Global commission rate |
| **Max Commission Percentage** | Decimal | 50.00% | 10-100% | Maximum allowed commission |
| **Free Shipping Threshold** | Decimal | ₹999.00 | ₹0-₹10,000 | Minimum order for free shipping |
| **Standard Shipping Charge** | Decimal | ₹99.00 | ₹0-₹500 | Default shipping charge |
| **Express Shipping Charge** | Decimal | ₹199.00 | ₹0-₹1,000 | Express shipping charge |
| **Minimum Order Amount** | Decimal | ₹0.00 | ₹0-₹10,000 | Minimum order value |
| **Coupon Budget (Monthly)** | Decimal | ₹10,000.00 | ₹0-₹1,00,000 | Monthly coupon budget |
| **Settlement Period** | Enum | Weekly | Daily/Weekly/Bi-weekly/Monthly | Payout frequency |
| **Settlement Hold Days** | Integer | 7 | 0-30 | Days to hold before settlement |
| **Minimum Settlement Amount** | Decimal | ₹100.00 | ₹10-₹10,000 | Minimum payout amount |
| **Return Processing Charge** | Decimal | ₹0.00 | ₹0-₹500 | Charge for return processing |
| **Currency** | String | INR | — | Default currency |
| **Tax Rate (GST)** | Decimal | 18.00% | 0-50% | Default tax rate |
| **Marketing Budget (Monthly)** | Decimal | ₹50,000.00 | ₹0-₹10,00,000 | Monthly marketing budget |

### 6.5 Commission Settings Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Global rate** | Configurable percentage | Baseline commission |
| **Category rates** | Per-category overrides | Category-specific pricing |
| **Shop rates** | Per-shop overrides | Shop-specific agreements |
| **Effective dates** | Time-bound rules | Seasonal adjustments |
| **Change notification** | 7-day notice for increases | Shop owner planning |
| **Version history** | All changes versioned | Audit trail |

### 6.6 Shipping Settings Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Free shipping threshold** | Minimum order amount | Incentive for larger orders |
| **Standard shipping cost** | Default shipping charge | Revenue from shipping |
| **Express shipping cost** | Premium shipping charge | Premium service revenue |
| **Location-based rates** | Future: different rates by location | Logistics accuracy |
| **Weight-based rates** | Future: rates by package weight | Fair pricing |

### 6.7 Free Shipping Rules Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Threshold** | Minimum order amount for free shipping | Incentive |
| **Product exclusions** | Some products may not qualify | Business rules |
| **Category exclusions** | Some categories may not qualify | Business rules |
| **Shop overrides** | Shops can offer free shipping | Marketing tool |
| **Promotional free shipping** | Time-bound free shipping offers | Campaigns |

### 6.8 Minimum Order Amount Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Global minimum** | Platform-wide minimum order | Operational efficiency |
| **Category minimum** | Per-category minimum | Category-specific |
| **Shop minimum** | Per-shop minimum | Shop-specific |
| **Enforcement** | Block checkout if below minimum | Business rule |

### 6.9 Coupon Budget Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Monthly budget** | Maximum monthly coupon spend | Financial control |
| **Per-coupon limit** | Maximum discount per coupon | Risk management |
| **Usage limits** | Maximum uses per coupon | Budget protection |
| **Budget tracking** | Real-time budget consumption | Visibility |
| **Alert threshold** | Alert when budget 80% consumed | Proactive management |

### 6.10 Marketing Adjustment Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Budget control** | Monthly marketing budget | Financial governance |
| **Campaign approval** | Marketing spend requires approval | Governance |
| **ROI tracking** | Measure return on marketing spend | Business intelligence |
| **Adjustment capability** | Admin can adjust marketing budgets | Flexibility |

### 6.11 Tax Readiness Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **GST support** | Indian GST rates configurable | Tax compliance |
| **Tax-exempt products** | Some products may be tax-exempt | Business rules |
| **Tax-inclusive pricing** | Option for tax-inclusive display | Customer experience |
| **Tax reporting** | Tax amounts tracked for reporting | Compliance |
| **Future: Multi-tax** | Support for multiple tax types | International readiness |

### 6.12 Currency Settings Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Default currency** | INR (Indian Rupee) | Primary market |
| **Currency display** | ₹ symbol with proper formatting | User experience |
| **Decimal precision** | 2 decimal places | Financial accuracy |
| **Future: Multi-currency** | Support for multiple currencies | International expansion |

### 6.13 Return Processing Charges Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Chargeable** | Configurable whether returns incur charges | Business rule |
| **Amount** | Configurable return processing charge | Cost recovery |
| **Exemptions** | Some return reasons may be exempt | Customer protection |
| **Deduction** | Charge deducted from refund amount | Automated processing |

---

## 7. Reporting

### 7.1 What

The complete architecture for financial reporting — from revenue reports to earnings reports to commission reports to settlement reports to cash flow to profit & loss to dashboards.

### 7.2 Why

- **Business intelligence:** Financial reports drive business decisions.
- **Compliance:** Tax authorities require financial reports.
- **Transparency:** Shop owners need earnings reports.
- **Performance:** Reports must be fast even with large datasets.
- **Export:** Reports must be exportable for external use.

### 7.3 Where

Admin dashboard, shop owner dashboard, financial reports page, export functionality, API handlers (`api/_handlers/finance/reports/`).

### 7.4 Report Types

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINANCIAL REPORTS                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  REVENUE REPORTS                                          │   │
│  │  → Total revenue by period                                │   │
│  │  → Revenue by category                                    │   │
│  │  → Revenue by shop                                        │   │
│  │  → Revenue trends                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EARNINGS REPORTS                                         │   │
│  │  → Shop earnings by period                                │   │
│  │  → Earnings by product                                    │   │
│  │  → Pending vs. settled earnings                           │   │
│  │  → Earnings trends                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  COMMISSION REPORTS                                       │   │
│  │  → Commission collected by period                         │   │
│  │  → Commission by category                                 │   │
│  │  → Commission by shop                                     │   │
│  │  → Commission trends                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SETTLEMENT REPORTS                                       │   │
│  │  → Settlements by period                                  │   │
│  │  → Pending settlements                                    │   │
│  │  → Completed settlements                                  │   │
│  │  → Settlement success rate                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CASH FLOW REPORTS                                        │   │
│  │  → Cash inflow (customer payments)                        │   │
│  │  → Cash outflow (settlements paid)                        │   │
│  │  → Net cash flow                                          │   │
│  │  → Cash flow forecast                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PROFIT & LOSS                                            │   │
│  │  → Revenue                                                │   │
│  │  → Cost of goods sold                                     │   │
│  │  → Gross profit                                           │   │
│  │  → Operating expenses                                     │   │
│  │  → Net profit                                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  FINANCIAL DASHBOARD                                      │   │
│  │  → Real-time financial metrics                            │   │
│  │  → Key performance indicators                             │   │
│  │  → Trend charts                                           │   │
│  │  → Alerts and anomalies                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  EXPORT READINESS                                         │   │
│  │  → CSV export                                             │   │
│  │  → Excel export                                           │   │
│  │  → PDF export                                             │   │
│  │  → API access for external tools                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Revenue Reports Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Time periods** | Daily, weekly, monthly, yearly, custom | Flexible analysis |
| **Dimensions** | By category, shop, product, location | Multi-dimensional |
| **Metrics** | Total revenue, average order value, growth | Key indicators |
| **Comparison** | Period-over-period comparison | Trend analysis |
| **Real-time** | Dashboard shows real-time data | Current visibility |

### 7.6 Earnings Reports Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Shop-level** | Per-shop earnings reports | Shop owner visibility |
| **Pending earnings** | Earnings not yet settled | Cash flow planning |
| **Settled earnings** | Earnings already paid | Historical accuracy |
| **Product-level** | Earnings per product | Product performance |
| **Trend analysis** | Earnings over time | Growth tracking |

### 7.7 Commission Reports Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Platform view** | Total commission collected | Revenue tracking |
| **Shop view** | Commission charged per shop | Transparency |
| **Category view** | Commission by category | Category economics |
| **Rule effectiveness** | Impact of commission rules | Rule optimization |

### 7.8 Settlement Reports Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Pending settlements** | Settlements awaiting processing | Operational visibility |
| **Completed settlements** | Successfully processed | Historical record |
| **Failed settlements** | Payment failures | Issue resolution |
| **Settlement timeline** | Average time to settlement | Performance metric |

### 7.9 Cash Flow Reports Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Inflow tracking** | Customer payments received | Revenue visibility |
| **Outflow tracking** | Settlements paid to shops | Expense visibility |
| **Net cash flow** | `inflow - outflow` | Liquidity tracking |
| **Forecasting** | Projected cash flow | Business planning |

### 7.10 Profit & Loss Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Revenue** | Total product revenue | Top line |
| **COGS** | Cost of goods sold (shipping, handling) | Direct costs |
| **Gross Profit** | `revenue - COGS` | Profitability |
| **Operating Expenses** | Marketing, platform costs | Operating costs |
| **Net Profit** | `gross profit - operating expenses` | Bottom line |

### 7.11 Financial Dashboard Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Real-time data** | Dashboard updates in real-time | Current visibility |
| **Key metrics** | Revenue, orders, AOV, commission | Quick overview |
| **Trend charts** | Visual trend representation | Pattern recognition |
| **Alerts** | Anomaly detection and alerts | Proactive management |
| **Drill-down** | Click to see detailed data | Investigation |

### 7.12 Export Readiness Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **CSV export** | Tabular data export | Universal compatibility |
| **Excel export** | Formatted spreadsheet | Business use |
| **PDF export** | Formatted report | Sharing, printing |
| **API access** | Programmatic data access | Integration |
| **Scheduled exports** | Automated report generation | Regular reporting |
| **Large dataset support** | Export millions of records | Scalability |

---

## 8. Order Integration

### 8.1 What

The complete architecture for how the Finance Engine integrates with orders, refunds, returns, coupons, shipping, documents, and notifications.

### 8.2 Why

- **Accuracy:** Financial calculations must be synchronized with order state.
- **Timeliness:** Financial events must be processed promptly.
- **Consistency:** Order and financial data must always agree.
- **Automation:** Financial operations should be triggered automatically.
- **Visibility:** All parties must see accurate financial status.

### 8.3 Where

Order creation, order status changes, refund processing, return handling, coupon application, shipping calculation, document generation, notification sending.

### 8.4 Order Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORDER-FINANCE INTEGRATION                      │
│                                                                  │
│  1. ORDER CONFIRMED                                              │
│     → Create finance record for product revenue                 │
│     → Calculate and record commission                            │
│     → Calculate and record shop earnings                         │
│     → Record shipping charge (if applicable)                     │
│     → Record coupon discount (if applicable)                     │
│     → Update earnings balance                                    │
│                                                                  │
│  2. ORDER SHIPPED                                                │
│     → Record shipping cost (actual)                              │
│     → Calculate net shipping revenue                             │
│     → Start hold period timer                                    │
│                                                                  │
│  3. ORDER DELIVERED                                              │
│     → Start 7-day hold period                                    │
│     → Earnings become eligible after hold                        │
│                                                                  │
│  4. ORDER COMPLETED                                              │
│     → Confirm earnings (if hold period elapsed)                  │
│     → Mark as settled-eligible                                   │
│                                                                  │
│  5. ORDER CANCELLED                                              │
│     → Reverse commission                                         │
│     → Reverse shop earnings                                      │
│     → Process refund (if paid)                                   │
│     → Create refund finance record                               │
│                                                                  │
│  6. ORDER REFUNDED                                               │
│     → Reverse commission (proportional to refund)                │
│     → Reverse shop earnings (proportional to refund)             │
│     → Create refund finance record                               │
│     → Update earnings balance                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 Refund Integration Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full refund** | Reverse entire order revenue, commission, earnings | Complete reversal |
| **Partial refund** | Reverse proportional amounts | Item-level accuracy |
| **Timing** | Refund finance record created on refund completion | When refund is confirmed |
| **Commission reversal** | Commission reversed proportionally | Accurate platform revenue |
| **Earnings reversal** | Shop earnings reversed proportionally | Accurate shop balance |
| **Finance record** | New finance record created for refund | Append-only history |

### 8.6 Return Integration Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Return approved** | Finance record created for return | Financial tracking |
| **Return processing** | Return processing charge applied (if configured) | Cost recovery |
| **Return completed** | Refund triggered, commission reversed | Financial accuracy |
| **Return rejected** | No financial impact | Clean rejection |

### 8.7 Coupon Integration Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Coupon applied** | Discount amount recorded | Financial tracking |
| **Platform-funded** | Discount cost charged to platform | Marketing expense |
| **Shop-funded** | Discount cost charged to shop | Shop promotion |
| **Split-funded** | Cost shared per configuration | Flexible model |
| **Coupon budget** | Budget consumption tracked | Financial control |

### 8.8 Shipping Integration Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Shipping charge** | Collected from customer at checkout | Revenue tracking |
| **Shipping cost** | Actual cost paid to courier | Expense tracking |
| **Net shipping** | `collected - cost` | Profit/loss tracking |
| **Free shipping** | Platform absorbs cost | Marketing expense |
| **Shipping method** | Method affects cost calculation | Accuracy |

### 8.9 Document Integration Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Invoice generation** | Financial data for invoice | Legal requirement |
| **Settlement receipt** | Settlement proof for shop owner | Record keeping |
| **Tax invoice** | GST-compliant invoice | Tax compliance |
| **Financial statements** | Period-end financial reports | Business reporting |

### 8.10 Notification Integration Architecture

| Event | Recipient | Channel | Content |
|-------|-----------|---------|---------|
| **Order confirmed** | Shop owner | Email + Dashboard | Order value, commission, earnings |
| **Earnings accrued** | Shop owner | Dashboard | Earnings added |
| **Settlement created** | Shop owner | Email + Dashboard | Settlement amount, period |
| **Settlement approved** | Shop owner | Email + Dashboard | Approval confirmation |
| **Settlement processed** | Shop owner | Email + Dashboard | Payment initiated |
| **Settlement completed** | Shop owner | Email + Dashboard | Payment confirmed |
| **Refund processed** | Shop owner | Email + Dashboard | Refund amount, commission reversal |
| **Commission rate changed** | Shop owner | Email | New rate, effective date |

---

## 9. Audit Architecture

### 9.1 What

The complete architecture for financial auditing — from transaction history to user actions to adjustment history to immutable logs to financial traceability.

### 9.2 Why

- **Compliance:** Financial regulations require complete audit trails.
- **Security:** Audit logs detect unauthorized financial actions.
- **Debugging:** Audit trails help resolve financial discrepancies.
- **Accountability:** Every financial action must be attributed to an actor.
- **Legal:** Audit logs serve as legal evidence.

### 9.3 Where

Every financial operation, setting change, settlement action, commission rule change, and manual adjustment across the Nabome platform.

### 9.4 Financial Timeline Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Chronological order** | Events ordered by timestamp | Temporal clarity |
| **Complete history** | Every financial event included | No gaps |
| **Actor attribution** | Every event tagged with actor | Accountability |
| **Context** | Metadata stored with events | Debugging |
| **Immutable** | Timeline never modified | Audit integrity |

### 9.5 Transaction History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Complete record** | Every transaction logged | No gaps |
| **Unique ID** | Permanent Finance ID | Traceability |
| **Source linkage** | Every transaction linked to source | Origin tracking |
| **Amount tracking** | Precise amounts recorded | Accuracy |
| **Status tracking** | Transaction status recorded | Workflow visibility |

### 9.6 User Actions Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Action logging** | Every user action on finances logged | Accountability |
| **Actor identification** | User ID recorded | Attribution |
| **Timestamp** | UTC timestamp on every action | Temporal accuracy |
| **IP address** | Client IP recorded | Security |
| **User agent** | Browser/device info recorded | Security |

### 9.7 Adjustment History Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **All adjustments logged** | Every manual adjustment recorded | Accountability |
| **Reason required** | Adjustment reason mandatory | Context |
| **Before/after values** | Values before and after adjustment | Impact visibility |
| **Approver** | Who approved the adjustment | Authorization |
| **Timestamp** | When adjustment was made | Temporal accuracy |

### 9.8 Immutable Logs Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Append-only** | Logs only added, never modified | Integrity |
| **No deletion** | Logs physically cannot be deleted | Compliance |
| **Integrity checks** | Log integrity verified periodically | Tamper detection |
| **Backup** | Logs backed up independently | Disaster recovery |
| **Retention** | Logs retained for 7 years minimum | Legal requirement |

### 9.9 Financial Traceability Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **End-to-end trace** | Trace from order to settlement | Complete visibility |
| **Source to destination** | Track money from customer to shop | Financial clarity |
| **Idempotency verification** | Verify no duplicate transactions | Integrity |
| **Reconciliation** | Regular reconciliation between records | Accuracy |

---

## 10. Permissions Architecture

### 10.1 What

The complete architecture for financial permissions — defining what each user role can view, export, settle, adjust, and configure.

### 10.2 Why

- **Security:** Financial data is sensitive — access must be controlled.
- **Separation of duties:** Different roles have different financial responsibilities.
- **Compliance:** Financial regulations require access controls.
- **Trust:** Shop owners must trust that their financial data is secure.
- **Accountability:** Permission enforcement creates audit trail.

### 10.3 Where

Every financial page, API endpoint, report, and setting across the Nabome platform.

### 10.4 Customer Financial Permissions

| Permission | Allowed | Rationale |
|------------|---------|-----------|
| **View own orders** | Yes | Self-service |
| **View own payments** | Yes | Self-service |
| **View own refunds** | Yes | Self-service |
| **View own invoices** | Yes | Legal requirement |
| **Export own data** | Yes | GDPR/data rights |
| **View commission rates** | No | Platform confidential |
| **View shop earnings** | No | Shop confidential |
| **View platform revenue** | No | Platform confidential |
| **Manage settlements** | No | Admin only |
| **Adjust finances** | No | Admin only |
| **Configure settings** | No | Admin only |

### 10.5 Shop Owner Financial Permissions

| Permission | Allowed | Rationale |
|------------|---------|-----------|
| **View own orders** | Yes | Self-service |
| **View own earnings** | Yes | Business visibility |
| **View own commission charged** | Yes | Transparency |
| **View own settlements** | Yes | Business visibility |
| **View own invoices** | Yes | Legal requirement |
| **Export own earnings** | Yes | Business analysis |
| **View other shops' data** | No | Privacy |
| **View platform revenue** | No | Platform confidential |
| **Manage settlements** | No | Admin only |
| **Adjust finances** | No | Admin only |
| **Configure commission rates** | No | Admin only |
| **Configure shipping rates** | No | Admin only |

### 10.6 Admin Financial Permissions

| Permission | Allowed | Rationale |
|------------|---------|-----------|
| **View all orders** | Yes | Platform management |
| **View all earnings** | Yes | Platform management |
| **View all commission** | Yes | Platform management |
| **View all settlements** | Yes | Platform management |
| **View platform revenue** | Yes | Business intelligence |
| **Export all financial data** | Yes | Reporting, compliance |
| **Approve settlements** | Yes | Financial governance |
| **Reject settlements** | Yes | Financial governance |
| **Create manual settlements** | Yes | Operational flexibility |
| **Make manual adjustments** | Yes | Error correction |
| **Configure commission rates** | Yes | Business configuration |
| **Configure shipping rates** | Yes | Business configuration |
| **Configure finance settings** | Yes | Business configuration |
| **View audit logs** | Yes | Compliance |
| **Override financial operations** | Yes | Emergency control |

### 10.7 Permission Matrix

| Action | Customer | Shop Owner | Admin |
|--------|----------|------------|-------|
| View own financial data | ✓ | ✓ | ✓ |
| View other users' financial data | ✗ | ✗ | ✓ |
| Export financial data | Own only | Own only | All |
| Approve settlements | ✗ | ✗ | ✓ |
| Reject settlements | ✗ | ✗ | ✓ |
| Create settlements | ✗ | ✗ | ✓ |
| Make adjustments | ✗ | ✗ | ✓ |
| Configure settings | ✗ | ✗ | ✓ |
| View audit logs | ✗ | ✗ | ✓ |
| Override operations | ✗ | ✗ | ✓ |

### 10.8 View Permissions Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Customer view** | Own orders, payments, refunds only | Self-service, privacy |
| **Shop owner view** | Own earnings, commission, settlements | Business visibility |
| **Admin view** | All financial data | Platform management |
| **Data isolation** | RLS ensures proper isolation | Security |

### 10.9 Export Permissions Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Customer export** | Own data only | Data rights |
| **Shop owner export** | Own earnings data only | Business analysis |
| **Admin export** | All data | Reporting, compliance |
| **Export format** | CSV, Excel, PDF | Flexibility |
| **Export logging** | All exports logged | Audit trail |

### 10.10 Settlement Permissions Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **View settlements** | Shop owner: own, Admin: all | Visibility |
| **Approve settlements** | Admin only | Financial governance |
| **Reject settlements** | Admin only | Financial governance |
| **Create settlements** | Admin only (or automatic) | Control |
| **Process payments** | Admin or automated system | Operational |

### 10.11 Manual Adjustment Permissions Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Create adjustment** | Admin only | Financial governance |
| **Approval** | May require second admin for large amounts | Double-check |
| **Reason required** | Always required | Audit trail |
| **Amount limits** | Configurable limits per admin role | Risk management |

### 10.12 Configuration Permissions Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Commission rates** | Admin only | Business configuration |
| **Shipping rates** | Admin only | Business configuration |
| **Finance settings** | Admin only | Business configuration |
| **Change logging** | All changes logged with actor | Audit trail |
| **Effective dates** | Changes take effect on specified date | Predictable transitions |

---

## 11. Security Architecture

### 11.1 What

The complete architecture for financial security — from integrity guarantees to duplicate prevention to permission enforcement to adjustment validation to immutable history to audit protection.

### 11.2 Why

- **Financial integrity:** Security prevents financial fraud and errors.
- **Compliance:** Financial regulations require security controls.
- **Trust:** Users must trust that their financial data is secure.
- **Liability:** Security breaches can cause financial loss and legal liability.
- **Business continuity:** Security protects against financial disruption.

### 11.3 Where

Every financial operation, API endpoint, database query, and user interaction involving financial data.

### 11.4 Financial Integrity Security

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Server-side calculation** | All financial calculations on server | Prevent tampering |
| **Input validation** | All financial inputs validated with Zod | Prevent injection |
| **Decimal precision** | DECIMAL(10,2) for all currency | Prevent rounding errors |
| **Atomic transactions** | Multi-step operations use transactions | Prevent partial states |
| **Idempotency** | Financial operations are idempotent | Prevent duplicates |
| **Reconciliation** | Regular reconciliation between records | Detect discrepancies |

### 11.5 Duplicate Prevention Security

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Idempotency keys** | Unique keys per financial operation | Prevent duplicate processing |
| **Unique constraints** | Database constraints on financial records | Prevent duplicate records |
| **Time windows** | Cooldown periods for similar operations | Prevent rapid duplicates |
| **Detection** | System detects and prevents duplicates | Integrity protection |

### 11.6 Permission Enforcement Security

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Authentication** | All financial endpoints require auth | Identity verification |
| **Authorization** | Role-based access control | Permission enforcement |
| **Resource ownership** | Users can only access own financial data | Data isolation |
| **RLS policies** | Row-Level Security on all financial tables | Database-level security |
| **Admin approval** | Sensitive operations require admin approval | Double-check |

### 11.7 Adjustment Validation Security

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Reason required** | All adjustments require reason | Audit trail |
| **Amount limits** | Configurable limits per adjustment type | Risk management |
| **Approval workflow** | Large adjustments require approval | Governance |
| **Validation** | Adjustments validated before processing | Prevent errors |
| **Audit logging** | All adjustments logged with full context | Accountability |

### 11.8 Immutable History Security

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Append-only** | Financial records only added, never modified | Integrity |
| **No deletion** | Financial records physically cannot be deleted | Compliance |
| **Integrity verification** | Periodic integrity checks | Tamper detection |
| **Backup** | Independent backup of financial records | Disaster recovery |
| **Retention** | 7-year minimum retention | Legal requirement |

### 11.9 Audit Protection Security

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Audit logging** | Every financial action logged | Accountability |
| **Log integrity** | Audit logs tamper-proof | Compliance |
| **Access control** | Audit logs admin-only access | Security |
| **Retention** | Audit logs retained for 7 years | Legal requirement |
| **Monitoring** | Anomaly detection on financial patterns | Fraud detection |

---

## 12. Performance Architecture

### 12.1 What

The complete architecture for financial performance — from large transaction volume handling to reporting performance to export performance to background processing to financial synchronization.

### 12.2 Why

- **User experience:** Financial pages must load quickly.
- **Scalability:** Performance must be maintained as transaction volume grows.
- **Efficiency:** Background processing prevents blocking user requests.
- **Accuracy:** Financial data must be synchronized in real-time.
- **Reporting:** Reports must be generated quickly even with large datasets.

### 12.3 Where

Every financial calculation, report generation, export operation, and background process across the Nabome platform.

### 12.4 Large Transaction Volume Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Database indexing** | Index all financial query columns | Query performance |
| **Connection pooling** | Hyperdrive for database connections | Connection efficiency |
| **Query optimization** | Optimized queries for financial operations | Performance |
| **Pagination** | Paginated financial data loading | Memory efficiency |
| **Caching** | KV caching for frequently accessed data | Read performance |

### 12.5 Reporting Performance Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Materialized views** | Pre-computed aggregates for reports | Query speed |
| **Background generation** | Reports generated in background | Non-blocking |
| **Incremental updates** | Reports updated incrementally | Efficiency |
| **Export streaming** | Large exports streamed | Memory efficiency |
| **Scheduled reports** | Pre-generated reports on schedule | Fast access |

### 12.6 Export Performance Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Streaming export** | Large exports streamed to client | Memory efficiency |
| **Background processing** | Exports generated in background | Non-blocking |
| **Progress indication** | Export progress visible | User feedback |
| **Cancellation** | Exports can be cancelled | Resource management |
| **Timeout handling** | Long exports timeout gracefully | Resource protection |

### 12.7 Background Processing Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Settlement processing** | Settlements processed in background | Non-blocking |
| **Report generation** | Reports generated in background | Non-blocking |
| **Export generation** | Exports generated in background | Non-blocking |
| **Email sending** | Financial notifications sent async | Non-blocking |
| **Reconciliation** | Reconciliation runs in background | Non-blocking |

### 12.8 Financial Synchronization Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Real-time updates** | Financial data updated in real-time | Accuracy |
| **Event-driven** | Financial events trigger immediate updates | Timeliness |
| **Consistency checks** | Regular consistency verification | Integrity |
| **Conflict resolution** | Concurrent updates handled gracefully | Concurrency |

---

## 13. Accessibility Architecture

### 13.1 What

The complete architecture for financial accessibility — from dashboards to mobile management to responsive tables to keyboard navigation to readable reports.

### 13.2 Why

- **Inclusion:** Financial tools must be usable by everyone.
- **Compliance:** Accessibility regulations require inclusive design.
- **Mobile-first:** 70%+ of admin traffic is mobile.
- **Efficiency:** Accessible tools are more efficient for all users.
- **Brand:** Premium brand requires premium accessibility.

### 13.3 Where

Every financial dashboard, report, table, form, and interaction across the Nabome platform.

### 13.4 Financial Dashboards Accessibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Screen reader support** | All financial data readable by screen readers | Inclusion |
| **Color contrast** | WCAG AA compliance for all text | Readability |
| **Keyboard navigation** | All dashboard interactions keyboard-accessible | Inclusion |
| **Focus indicators** | Visible focus on all interactive elements | Usability |
| **Responsive design** | Dashboards work on all screen sizes | Mobile-first |

### 13.5 Mobile Management Accessibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Touch targets** | Minimum 44px touch targets | Mobile usability |
| **Swipe gestures** | Common actions accessible via swipe | Mobile efficiency |
| **Bottom actions** | Key actions in thumb reach zone | Mobile ergonomics |
| **Simplified views** | Mobile-optimized financial views | Mobile clarity |
| **Offline support** | Critical financial data cached offline | Mobile reliability |

### 13.6 Responsive Tables Accessibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Horizontal scroll** | Tables scroll horizontally on mobile | Data access |
| **Sticky headers** | Column headers visible while scrolling | Context |
| **Sort indicators** | Clear sort direction indicators | Usability |
| **Filter controls** | Accessible filter controls | Usability |
| **Row actions** | Row actions accessible on mobile | Mobile usability |

### 13.7 Keyboard Navigation Accessibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Tab order** | Logical tab order through financial UI | Efficiency |
| **Keyboard shortcuts** | Common actions keyboard-accessible | Power users |
| **Focus management** | Focus managed in modals and dialogs | Usability |
| **Skip links** | Skip to main content links | Screen reader efficiency |

### 13.8 Readable Reports Accessibility

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Clear typography** | Readable fonts and sizes | Readability |
| **Data labels** | All data clearly labeled | Clarity |
| **Units displayed** | Currency units always displayed | Clarity |
| **Color coding** | Color not sole indicator of meaning | Inclusion |
| **Export formats** | Reports exportable in accessible formats | Inclusion |

---

## 14. Future Readiness Architecture

### 14.1 What

The complete architecture for future financial features — from taxes to GST/VAT to multi-currency to international finance to payment gateways to automatic reconciliation to AI financial insights to budget forecasting to subscription billing.

### 14.2 Why

- **Scalability:** Architecture must support business growth.
- **International expansion:** Finance must support multiple countries.
- **Automation:** AI and automation reduce manual work.
- **Compliance:** Tax regulations evolve — architecture must adapt.
- **Innovation:** Future features require forward-thinking architecture.

### 14.3 Where

Finance Engine settings, commission engine, settlement engine, reporting engine, and future API handlers.

### 14.4 Tax Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **GST support** | Indian GST rates configurable | Current requirement |
| **Tax-inclusive pricing** | Option for tax-inclusive display | Customer experience |
| **Tax-exempt products** | Support for tax-exempt items | Business rules |
| **Tax reporting** | Tax amounts tracked for reporting | Compliance |
| **Future: Multi-tax** | Support for multiple tax types | International readiness |

### 14.5 GST/VAT Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **GST rates** | Configurable GST rates (0%, 5%, 12%, 18%, 28%) | Indian tax compliance |
| **HSN codes** | Product-level HSN code support | Tax reporting |
| **GST invoices** | GST-compliant invoice generation | Legal requirement |
| **GST returns** | Data formatted for GST return filing | Compliance |
| **Future: VAT** | Architecture supports VAT for international | International readiness |

### 14.6 Multi-Currency Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Currency support** | Multiple currencies configurable | International readiness |
| **Exchange rates** | Exchange rate management | Currency conversion |
| **Currency display** | Proper currency formatting per locale | User experience |
| **Multi-currency reporting** | Reports in multiple currencies | Business intelligence |
| **Settlement currency** | Settlements in shop owner's currency | Shop owner convenience |

### 14.7 International Finance Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Multi-country** | Support for multiple countries | International expansion |
| **Local payment methods** | Country-specific payment methods | Customer convenience |
| **Local tax compliance** | Country-specific tax rules | Legal requirement |
| **Local banking** | Country-specific bank settlement | Operational efficiency |
| **Localization** | Financial UI localized per country | User experience |

### 14.8 Payment Gateway Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Razorpay** | Primary payment gateway | Current requirement |
| **Future gateways** | Architecture supports additional gateways | Flexibility |
| **Gateway abstraction** | Payment logic independent of gateway | Maintainability |
| **Webhook handling** | Robust webhook processing | Reliability |
| **Reconciliation** | Gateway reconciliation automated | Accuracy |

### 14.9 Automatic Reconciliation Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Bank reconciliation** | Automated bank statement matching | Efficiency |
| **Gateway reconciliation** | Automated gateway settlement matching | Accuracy |
| **Discrepancy detection** | Automatic detection of mismatches | Error prevention |
| **Resolution workflow** | Discrepancy resolution workflow | Issue management |
| **Reporting** | Reconciliation reports generated | Transparency |

### 14.10 AI Financial Insights Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Revenue forecasting** | AI-powered revenue predictions | Business planning |
| **Anomaly detection** | AI detects financial anomalies | Fraud prevention |
| **Trend analysis** | AI identifies financial trends | Business intelligence |
| **Recommendations** | AI provides financial recommendations | Optimization |
| **Natural language** | Natural language financial queries | Accessibility |

### 14.11 Budget Forecasting Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Revenue forecasting** | Project future revenue | Business planning |
| **Expense forecasting** | Project future expenses | Cost management |
| **Cash flow forecasting** | Project future cash flow | Liquidity management |
| **Scenario planning** | Multiple scenario modeling | Risk management |
| **What-if analysis** | Interactive what-if scenarios | Decision support |

### 14.12 Subscription Billing Architecture

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Recurring billing** | Support for subscription products | Business model |
| **Plan management** | Subscription plan management | Product flexibility |
| **Payment cycles** | Automated payment cycles | Operational efficiency |
| **Dunning** | Failed payment retry and management | Revenue protection |
| **Cancellation** | Subscription cancellation handling | Customer service |

---

## 15. Mandatory Rules for AI Agents

### 15.1 What

Non-negotiable rules that every AI agent must follow when working with the Nabome Finance Engine.

### 15.2 Why

- **Financial integrity:** Rules prevent financial data corruption.
- **Compliance:** Rules ensure regulatory compliance.
- **Consistency:** Rules ensure uniform behavior across all implementations.
- **Security:** Rules prevent financial fraud and errors.
- **Auditability:** Rules ensure complete audit trails.

### 15.3 Financial Data Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never delete financial records** | Use soft delete only | Audit trail, compliance |
| **Never modify financial records** | Append-only writes | Integrity, audit trail |
| **Always use DECIMAL(10,2)** | For all currency values | Exact precision |
| **Always use UUID for Finance ID** | Permanent, unique identifier | Traceability |
| **Always use server-side calculation** | Never trust client-side financial logic | Security |
| **Always use atomic transactions** | Multi-step financial operations | Consistency |
| **Always log financial events** | Every financial action logged | Audit trail |
| **Always validate financial inputs** | Use Zod for all financial data | Security |

### 15.4 Commission Engine Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always snapshot commission rate** | Store rate at time of order | Historical accuracy |
| **Always apply rule hierarchy** | Shop > Category > Global | Consistent application |
| **Never apply negative commission** | Commission cannot be negative | Financial integrity |
| **Never exceed commission cap** | Apply maximum commission limit | Prevent abuse |
| **Always notify on rate changes** | 7-day advance notice | Transparency |

### 15.5 Settlement Engine Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always require admin approval** | No auto-approval for settlements | Financial governance |
| **Always enforce hold period** | 7-day hold before settlement eligibility | Return window protection |
| **Always record settlement history** | Complete lifecycle tracking | Audit trail |
| **Always handle failed payments** | Retry with backoff, notify admin | Resilience |
| **Always provide settlement receipt** | Proof of payment for shop owner | Record keeping |

### 15.6 Financial Record Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always create finance record for every event** | No financial event without record | Audit trail |
| **Always link record to source entity** | Every record traceable to origin | Traceability |
| **Always record actor** | Every financial action attributed | Accountability |
| **Always record timestamp** | UTC timestamp on every record | Temporal accuracy |
| **Always use append-only writes** | Never overwrite financial records | Integrity |

### 15.7 Audit Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always log financial actions** | Every action logged with context | Accountability |
| **Never log sensitive data** | No passwords, tokens, keys | Security |
| **Always retain logs for 7 years** | Legal requirement | Compliance |
| **Never modify audit logs** | Tamper-proof audit trail | Integrity |
| **Always back up audit logs** | Independent backup | Disaster recovery |

### 15.8 Security Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always authenticate financial endpoints** | No unauthenticated financial access | Security |
| **Always authorize financial operations** | Role-based access control | Permission enforcement |
| **Always validate financial inputs** | Zod schema validation | Security |
| **Always use idempotency keys** | Prevent duplicate financial operations | Integrity |
| **Always reconcile financial data** | Regular reconciliation checks | Accuracy |

---

*Last updated: August 03, 2026*
