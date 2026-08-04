# নবME (Nabome) — System Configuration, Feature Flags & Platform Settings Architecture

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for all platform configuration, feature flags, global settings, runtime configuration, and centralized business configuration standards
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), SECURITY_ARCHITECTURE.md (v1.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), DATABASE_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0), ADMIN_DASHBOARD_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Configuration Foundation](#1-configuration-foundation)
2. [Global Settings Architecture](#2-global-settings-architecture)
3. [Business Settings Architecture](#3-business-settings-architecture)
4. [Feature Flag Engine](#4-feature-flag-engine)
5. [System Settings Architecture](#5-system-settings-architecture)
6. [Localization Architecture](#6-localization-architecture)
7. [Branding Architecture](#7-branding-architecture)
8. [Search & Management Architecture](#8-search--management-architecture)
9. [Configuration Versioning & History](#9-configuration-versioning--history)
10. [Configuration Permissions](#10-configuration-permissions)
11. [Configuration Security](#11-configuration-security)
12. [Configuration Performance](#12-configuration-performance)
13. [Configuration Accessibility](#13-configuration-accessibility)
14. [Future Readiness](#14-future-readiness)
15. [Mandatory Rules for AI Agents](#15-mandatory-rules-for-ai-agents)

---

## 1. Configuration Foundation

### 1.1 What

The foundational philosophy, ownership model, lifecycle, hierarchy, and runtime/static configuration standards that govern every configurable behavior on the Nabome platform.

### 1.2 Why

- **Zero-deployment changes:** Business rules must change without code deployments
- **Auditability:** Every configuration change must be traceable
- **Security:** Sensitive settings must be encrypted and access-controlled
- **Scalability:** Configuration system must support multi-brand, multi-region expansion
- **Reliability:** Configuration changes must be atomic and reversible
- **Consistency:** One centralized system, not scattered config files

### 1.3 Where

Every module, every feature, every API handler, every UI component that reads configurable behavior.

### 1.4 Configuration Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Centralized** | All configuration in one system | Single source of truth |
| **Runtime configurable** | Changes apply without restart or redeploy | Operational agility |
| **Auditable** | Every change logged with actor, timestamp, diff | Compliance + debugging |
| **Validated** | All configuration validated against schemas before apply | Prevent misconfigurations |
| **Hierarchical** | Settings have clear ownership and precedence | Avoid conflicts |
| **Secure by default** | Default configurations are always secure | Protection against mistakes |
| **Environment-aware** | Settings can differ per environment (dev/staging/prod) | Safe testing |
| **Rollback-ready** | Every change can be reverted | Recovery |
| **Feature-flag independent** | Configuration and feature flags are separate concerns | Clean separation |
| **Modular** | Configuration groups are independent modules | Scalability |

### 1.5 Configuration Ownership

| Configuration Domain | Owner | Location |
|---------------------|-------|----------|
| **Platform Settings** | System Admin | `api/_lib/config/platform.ts` |
| **Business Settings** | Admin | `api/_lib/config/business.ts` |
| **Company Settings** | Admin | `api/_lib/config/company.ts` |
| **Feature Flags** | Product/Engineering | `api/_lib/config/feature-flags.ts` |
| **System Settings** | DevOps/SRE | `api/_lib/config/system.ts` |
| **Localization Settings** | Admin | `api/_lib/config/localization.ts` |
| **Branding Settings** | Admin | `api/_lib/config/branding.ts` |
| **Security Settings** | Security Admin | `api/_lib/config/security.ts` |
| **Email Settings** | Admin | `api/_lib/config/email.ts` |
| **Notification Settings** | Admin | `api/_lib/config/notifications.ts` |
| **Client-side Config** | Frontend | `src/lib/config.ts` |

### 1.6 Configuration Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                 CONFIGURATION LIFECYCLE                           │
│                                                                  │
│  1. DEFINE                                                       │
│     → Schema defined with Zod                                    │
│     → Default values specified                                   │
│     → Validation rules documented                                │
│     → Permission requirements declared                           │
│                                                                  │
│  2. STORE                                                        │
│     → Database (AdminSetting table)                              │
│     → KV cache for hot settings                                  │
│     → Environment variables for secrets                          │
│                                                                  │
│  3. READ                                                         │
│     → API handler reads config                                   │
│     → Config cached at edge (KV)                                 │
│     → TTL-based refresh                                          │
│                                                                  │
│  4. MODIFY                                                       │
│     → Admin UI or API modifies config                            │
│     → Validation runs before save                                │
│     → Audit log created                                          │
│                                                                  │
│  5. PUBLISH                                                      │
│     → Draft config saved                                         │
│     → Admin approves and publishes                               │
│     → KV cache invalidated                                       │
│                                                                  │
│  6. ROLLBACK (if needed)                                         │
│     → Previous version restored                                  │
│     → KV cache invalidated                                       │
│     → Audit log records rollback                                 │
│                                                                  │
│  7. ARCHIVE                                                      │
│     → Old versions retained for history                          │
│     → Config snapshots stored                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.7 Configuration Hierarchy

Configuration resolution order (highest to lowest priority):

```
┌─────────────────────────────────────────────────────────────────┐
│                 CONFIGURATION HIERARCHY                           │
│                                                                  │
│  1. ENVIRONMENT VARIABLES (highest priority)                     │
│     → Secrets, API keys, database URLs                           │
│     → Never changeable at runtime                                │
│                                                                  │
│  2. DATABASE SETTINGS (runtime configurable)                     │
│     → AdminSetting table                                         │
│     → Changes apply immediately                                  │
│                                                                  │
│  3. KV CACHE (cached from database)                              │
│     → Read-optimized cache                                       │
│     → Invalidated on database change                             │
│                                                                  │
│  4. FEATURE FLAGS (runtime toggleable)                           │
│     → Independent of business settings                           │
│     → Environment-specific overrides                             │
│                                                                  │
│  5. CODE DEFAULTS (lowest priority)                              │
│     → Hardcoded defaults in source code                          │
│     → Used when no other config exists                           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.8 Runtime Configuration

**What:** Configuration that can be changed while the system is running, without restart or redeployment.

**Why:**
- Business rules change frequently (shipping rates, tax rules, feature availability)
- Emergency changes must apply immediately (maintenance mode, kill switches)
- Admin operations should not require engineering deployment

**Where:** All business settings, feature flags, system toggles.

**Runtime Configuration Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Immediate effect** | Changes apply within cache TTL (max 5 min) | Operational agility |
| **Atomic updates** | All-or-nothing config group changes | Consistency |
| **Cache invalidation** | KV cache invalidated on change | Fresh reads |
| **Validation** | Zod schema validation before apply | Prevent invalid config |
| **Audit logging** | Every runtime change logged | Accountability |
| **Rollback** | Previous version retrievable | Recovery |
| **No restart required** | Changes apply in-process | Zero downtime |

### 1.9 Static Configuration

**What:** Configuration that requires code changes and deployment to modify.

**Why:**
- Some settings are infrastructure-level (database URLs, API keys)
- Security-critical secrets must never be runtime-modifiable
- Environment-specific deployment configuration

**Where:** Environment variables, `wrangler.jsonc`, build-time config.

**Static Configuration Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never in code** | Use environment variables | Security |
| **Validated at startup** | Zod schema validates all env vars | Fail-fast |
| **Secrets encrypted** | Cloudflare Pages Secrets for sensitive values | Security |
| **Environment-specific** | Separate configs per environment | Safe testing |
| **Documented** | `.env.example` with descriptions | Developer experience |

### 1.10 Dynamic Configuration

**What:** Configuration that changes based on runtime context (user, location, time, feature flag state).

**Why:**
- A/B testing requires variant-based config
- Regional settings differ by user location
- Time-based features (flash sales, seasonal rules)

**Where:** Feature flags, localization, A/B testing.

**Dynamic Configuration Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Context-dependent** | Config resolves based on request context | Personalization |
| **Cacheable** | Dynamic configs can be cached per context | Performance |
| **Fallback chain** | Always provide fallback values | Reliability |
| **No N+1** | Batch context-dependent config lookups | Performance |

---

## 2. Global Settings Architecture

### 2.1 What

The complete architecture for platform-wide settings that define how the Nabome platform looks, behaves, and communicates.

### 2.2 Why

- **Consistency:** One place to manage platform identity
- **Branding:** Unified brand experience across all touchpoints
- **Compliance:** Centralized legal and contact information
- **Scalability:** Settings support future multi-brand expansion

### 2.3 Where

`api/_lib/config/platform.ts`, `api/_handlers/admin/settings/`, `AdminSetting` database table.

### 2.4 Platform Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Platform Name** | `platform.name` | string | "Nabome" | Super Admin |
| **Platform Tagline** | `platform.tagline` | string | "" | Admin |
| **Platform URL** | `platform.url` | string | Required | Super Admin |
| **Platform Status** | `platform.status` | enum | `active` | Super Admin |
| **Support Email** | `platform.supportEmail` | string | Required | Admin |
| **Support Phone** | `platform.supportPhone` | string? | null | Admin |
| **Legal Entity Name** | `platform.legalEntity` | string | Required | Super Admin |
| **Tax ID (GSTIN)** | `platform.taxId` | string? | null | Super Admin |
| **Default Currency** | `platform.currency` | enum | `INR` | Super Admin |
| **Default Language** | `platform.language` | enum | `en` | Admin |
| **Default Timezone** | `platform.timezone` | string | `Asia/Kolkata` | Admin |
| **Maintenance Mode** | `platform.maintenanceMode` | boolean | `false` | Super Admin |
| **Maintenance Message** | `platform.maintenanceMessage` | string? | null | Super Admin |

### 2.5 Business Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Store Name** | `business.storeName` | string | Required | Admin |
| **Store Description** | `business.storeDescription` | string? | null | Admin |
| **Business Type** | `business.type` | enum | `b2c` | Super Admin |
| **Registration Required** | `business.registrationRequired` | boolean | `true` | Admin |
| **Guest Checkout** | `business.guestCheckout` | boolean | `true` | Admin |
| **Minimum Order Amount** | `business.minOrderAmount` | decimal | `0` | Admin |
| **Maximum Order Amount** | `business.maxOrderAmount` | decimal | `999999` | Admin |
| **Order Number Prefix** | `business.orderPrefix` | string | `ORD-` | Admin |
| **Invoice Prefix** | `business.invoicePrefix` | string | `INV-` | Admin |

### 2.6 Company Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Company Name** | `company.name` | string | Required | Admin |
| **Company Address Line 1** | `company.address1` | string | Required | Admin |
| **Company Address Line 2** | `company.address2` | string? | null | Admin |
| **Company City** | `company.city` | string | Required | Admin |
| **Company State** | `company.state` | string | Required | Admin |
| **Company Pincode** | `company.pincode` | string | Required | Admin |
| **Company Country** | `company.country` | string | `IN` | Admin |
| **Company Phone** | `company.phone` | string | Required | Admin |
| **Company Email** | `company.email` | string | Required | Admin |
| **Company Website** | `company.website` | string? | null | Admin |
| **Company Logo** | `company.logo` | string? | null | Admin |

### 2.7 Contact Information

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Contact Email** | `contact.email` | string | Required | Admin |
| **Contact Phone** | `contact.phone` | string? | null | Admin |
| **Contact WhatsApp** | `contact.whatsapp` | string? | null | Admin |
| **Contact Address** | `contact.address` | string? | null | Admin |
| **Business Hours** | `contact.hours` | json | `{"mon-fri":"9am-6pm"}` | Admin |
| **Social Links** | `contact.social` | json | `{}` | Admin |

### 2.8 Settings Schema

```typescript
// api/_lib/config/schemas.ts

import { z } from 'zod';

const PlatformSettingsSchema = z.object({
  name: z.string().min(1).max(100),
  tagline: z.string().max(200).optional(),
  url: z.string().url(),
  status: z.enum(['active', 'inactive', 'maintenance']),
  supportEmail: z.string().email(),
  supportPhone: z.string().optional(),
  legalEntity: z.string().min(1).max(200),
  taxId: z.string().optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']),
  language: z.enum(['en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa']),
  timezone: z.string(),
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
});

const BusinessSettingsSchema = z.object({
  storeName: z.string().min(1).max(200),
  storeDescription: z.string().max(1000).optional(),
  type: z.enum(['b2c', 'b2b', 'marketplace']),
  registrationRequired: z.boolean().default(true),
  guestCheckout: z.boolean().default(true),
  minOrderAmount: z.number().min(0).default(0),
  maxOrderAmount: z.number().min(0).default(999999),
  orderPrefix: z.string().max(10).default('ORD-'),
  invoicePrefix: z.string().max(10).default('INV-'),
});

const CompanySettingsSchema = z.object({
  name: z.string().min(1).max(200),
  address1: z.string().min(1).max(300),
  address2: z.string().max(300).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().min(1).max(20),
  country: z.string().length(2).default('IN'),
  phone: z.string().min(1).max(20),
  email: z.string().email(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
});
```

### 2.9 Global Settings Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Validated on save** | Zod schema validates every change | Prevent invalid config |
| **Cached in KV** | Hot settings cached with 5-min TTL | Performance |
| **Audit logged** | Every change logged with diff | Accountability |
| **Immutable history** | Previous versions retained | Rollback capability |
| **Environment-aware** | Settings can differ per environment | Safe testing |
| **Mobile-editable** | All settings editable from mobile admin | Anywhere management |
| **Secret protection** | Sensitive settings encrypted at rest | Security |

**Best practices:**
- Define default values that are secure and functional
- Validate settings against business constraints (e.g., minOrderAmount < maxOrderAmount)
- Cache settings at edge for fast reads
- Invalidate cache immediately on settings update
- Document every setting with description and allowed values

**Common implementation mistakes:**
- Not validating settings before save (allows invalid config)
- Not caching settings (causes DB overload on every read)
- Not invalidating cache after update (stale config served)
- Not logging settings changes (no audit trail)
- Hardcoding settings instead of using the config system

---

## 3. Business Settings Architecture

### 3.1 What

The complete architecture for configurable business rules that govern commerce operations without code changes.

### 3.2 Why

- **Agility:** Business rules change without deployment
- **Compliance:** Business rules must be auditable
- **Flexibility:** Different markets may need different rules
- **Transparency:** Business rules visible in admin UI

### 3.3 Where

`api/_lib/config/business-rules/`, `api/_handlers/admin/settings/`, `AdminSetting` database table.

### 3.4 Commission Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Commission Enabled** | `commission.enabled` | boolean | `false` | Super Admin |
| **Commission Type** | `commission.type` | enum | `percentage` | Super Admin |
| **Commission Rate** | `commission.rate` | decimal | `0` | Super Admin |
| **Minimum Commission** | `commission.minAmount` | decimal | `0` | Super Admin |
| **Maximum Commission** | `commission.maxAmount` | decimal | `999999` | Super Admin |
| **Commission On** | `commission.on` | enum | `selling_price` | Super Admin |

### 3.5 Shipping Rules

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Free Shipping Threshold** | `shipping.freeThreshold` | decimal | `999` | Admin |
| **Flat Rate Shipping** | `shipping.flatRate` | decimal | `0` | Admin |
| **Shipping Enabled** | `shipping.enabled` | boolean | `true` | Admin |
| **COD Available** | `shipping.codAvailable` | boolean | `false` | Admin |
| **COD Charges** | `shipping.codCharges` | decimal | `0` | Admin |
| **Express Shipping** | `shipping.expressEnabled` | boolean | `false` | Admin |
| **Express Surcharge** | `shipping.expressSurcharge` | decimal | `0` | Admin |
| **Max Shipping Weight** | `shipping.maxWeightKg` | decimal | `30` | Admin |
| **Shipping Restrictions** | `shipping.restrictedPincodes` | json | `[]` | Admin |

### 3.6 Order Rules

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Order Auto-Confirm** | `orders.autoConfirm` | boolean | `false` | Admin |
| **Order Cancellation Window** | `orders.cancellationWindowHours` | int | `24` | Admin |
| **Max Items Per Order** | `orders.maxItems` | int | `50` | Admin |
| **Max Quantity Per Item** | `orders.maxQuantityPerItem` | int | `10` | Admin |
| **Order Expiry Hours** | `orders.expiryHours` | int | `72` | Admin |
| **Auto-Cancel Unpaid** | `orders.autoCancelUnpaidHours` | int | `24` | Admin |
| **Order Status Transitions** | `orders.allowedTransitions` | json | Configured | Admin |

### 3.7 Return Rules

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Returns Enabled** | `returns.enabled` | boolean | `true` | Admin |
| **Return Window Days** | `returns.windowDays` | int | `7` | Admin |
| **Return Reason Required** | `returns.reasonRequired` | boolean | `true` | Admin |
| **Return Pickup Available** | `returns.pickupAvailable` | boolean | `false` | Admin |
| **Return Restocking Fee** | `returns.restockingFeePercent` | decimal | `0` | Admin |
| **Return Auto-Approve** | `returns.autoApprove` | boolean | `false` | Admin |
| **Return Eligible Categories** | `returns.eligibleCategories` | json | `[]` | Admin |

### 3.8 Refund Rules

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Refunds Enabled** | `refunds.enabled` | boolean | `true` | Admin |
| **Refund Method** | `refunds.method` | enum | `original_payment` | Admin |
| **Refund Processing Days** | `refunds.processingDays` | int | `5` | Admin |
| **Store Credit Option** | `refunds.storeCreditEnabled` | boolean | `false` | Admin |
| **Partial Refund Allowed** | `refunds.partialAllowed` | boolean | `true` | Admin |
| **Refund Auto-Approve** | `refunds.autoApprove` | boolean | `false` | Admin |

### 3.9 Inventory Rules

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Low Stock Threshold** | `inventory.lowStockThreshold` | int | `5` | Admin |
| **Out of Stock Action** | `inventory.outOfStockAction` | enum | `hide` | Admin |
| **Backorder Allowed** | `inventory.backorderAllowed` | boolean | `false` | Admin |
| **Stock Reservation Minutes** | `inventory.reservationMinutes` | int | `15` | Admin |
| **Inventory Tracking** | `inventory.trackingEnabled` | boolean | `true` | Admin |
| **Negative Stock Allowed** | `inventory.negativeAllowed` | boolean | `false` | Admin |

### 3.10 Checkout Rules

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Guest Checkout** | `checkout.guestEnabled` | boolean | `true` | Admin |
| **Address Required** | `checkout.addressRequired` | boolean | `true` | Admin |
| **Phone Required** | `checkout.phoneRequired` | boolean | `true` | Admin |
| **Email Verification Required** | `checkout.emailVerificationRequired` | boolean | `false` | Admin |
| **Max Addresses** | `checkout.maxAddresses` | int | `10` | Admin |
| **Coupon Stacking** | `checkout.couponStacking` | boolean | `false` | Admin |
| **Price Display** | `checkout.priceDisplay` | enum | `inclusive` | Admin |

### 3.11 Registration Rules

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Registration Enabled** | `registration.enabled` | boolean | `true` | Admin |
| **Email Verification** | `registration.emailVerificationRequired` | boolean | `true` | Admin |
| **Phone Verification** | `registration.phoneVerificationRequired` | boolean | `false` | Admin |
| **Default Role** | `registration.defaultRole` | enum | `customer` | Super Admin |
| **Allowed Domains** | `registration.allowedDomains` | json | `[]` | Admin |
| **Blocked Domains** | `registration.blockedDomains` | json | Common providers | Admin |
| **Auto-Approve** | `registration.autoApprove` | boolean | `true` | Admin |

### 3.12 Review Rules

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Reviews Enabled** | `reviews.enabled` | boolean | `true` | Admin |
| **Review Moderation** | `reviews.moderationRequired` | boolean | `true` | Admin |
| **Verified Purchase Required** | `reviews.verifiedPurchaseRequired` | boolean | `true` | Admin |
| **Max Review Length** | `reviews.maxLength` | int | `2000` | Admin |
| **Image Reviews Allowed** | `reviews.imageAllowed` | boolean | `true` | Admin |
| **Max Images Per Review** | `reviews.maxImages` | int | `5` | Admin |
| **Duplicate Review Prevention** | `reviews.duplicatePrevention` | boolean | `true` | Admin |
| **Review Incentive** | `reviews.incentiveEnabled` | boolean | `false` | Admin |

### 3.13 CMS Rules

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Blog Enabled** | `cms.blogEnabled` | boolean | `true` | Admin |
| **Blog Moderation** | `cms.blogModerationRequired` | boolean | `true` | Admin |
| **Comments Enabled** | `cms.commentsEnabled` | boolean | `false` | Admin |
| **Page Publishing** | `cms.pagePublishingEnabled` | boolean | `true` | Admin |
| **SEO Auto-Generate** | `cms.seoAutoGenerate` | boolean | `true` | Admin |
| **Rich Text Editor** | `cms.richTextEditor` | enum | `tiptap` | Admin |

### 3.14 Business Rules Schema

```typescript
// api/_lib/config/business-rules/schemas.ts

import { z } from 'zod';

const ShippingRulesSchema = z.object({
  freeThreshold: z.number().min(0).default(999),
  flatRate: z.number().min(0).default(0),
  enabled: z.boolean().default(true),
  codAvailable: z.boolean().default(false),
  codCharges: z.number().min(0).default(0),
  expressEnabled: z.boolean().default(false),
  expressSurcharge: z.number().min(0).default(0),
  maxWeightKg: z.number().min(0.1).default(30),
  restrictedPincodes: z.array(z.string()).default([]),
});

const OrderRulesSchema = z.object({
  autoConfirm: z.boolean().default(false),
  cancellationWindowHours: z.number().min(0).max(720).default(24),
  maxItems: z.number().min(1).max(100).default(50),
  maxQuantityPerItem: z.number().min(1).max(100).default(10),
  expiryHours: z.number().min(1).max(720).default(72),
  autoCancelUnpaidHours: z.number().min(1).max(168).default(24),
});
```

### 3.15 Business Settings Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Validated against constraints** | Cross-setting validation (min < max) | Business logic integrity |
| **Defaults are safe** | Default values work for most businesses | Out-of-box experience |
| **Grouped by domain** | Related settings grouped together | Discoverability |
| **Independent modules** | Each rule domain is independent | Modularity |
| **Admin-configurable** | All business rules editable via admin UI | No code changes |
| **Audit logged** | Every rule change logged | Accountability |
| **Rollback capable** | Previous rule versions retrievable | Recovery |

**Best practices:**
- Group related settings (shipping, returns, refunds) into logical domains
- Provide sensible defaults that work for most businesses
- Validate cross-setting constraints (e.g., cancellationWindow < orderExpiry)
- Cache business rules at edge for fast access during checkout
- Document business impact of each setting change

**Common implementation mistakes:**
- Hardcoding business rules in application code
- Not validating cross-setting constraints
- Not caching business rules (DB overload on every checkout)
- Not logging business rule changes
- Making business rules depend on feature flags (wrong dependency direction)

---

## 4. Feature Flag Engine

### 4.1 What

The complete feature flag system that controls feature availability, gradual rollouts, A/B testing, emergency disable, and environment-specific feature toggles.

### 4.2 Why

- **Safe rollouts:** Gradually enable features to subsets of users
- **Kill switches:** Instantly disable problematic features
- **A/B testing:** Compare feature variants for optimization
- **Beta programs:** Control access to experimental features
- **Maintenance:** Disable features during maintenance without full outage
- **Compliance:** Control feature availability by region

### 4.3 Where

`api/_lib/config/feature-flags/`, `PostHog` (current), `Cloudflare Flagship` (future), `src/lib/feature-flags.ts` (client-side).

### 4.4 Feature Flag Types

| Type | Description | Lifecycle | Use Case |
|------|-------------|-----------|----------|
| **Release** | Toggle feature on/off | Temporary → Permanent | New feature launch |
| **Experiment** | A/B test with variants | Temporary | Optimization |
| **Ops** | Operational toggle | Permanent | Maintenance, rate limiting |
| **Permission** | Access control toggle | Permanent | Beta access, premium features |
| **Kill Switch** | Emergency disable | Permanent | Problem mitigation |

### 4.5 Feature Flag Naming Convention

```
{domain}.{feature}.{variant}

Examples:
  checkout.guestCheckout.enabled
  homepage.aiRecommendations.enabled
  catalog.newFilterDesign.enabled
  payments.razorpayV2.enabled
  auth.socialLogin.google.enabled
  admin.advancedAnalytics.enabled
```

### 4.6 Standard Feature Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `platform.maintenanceMode` | Ops | `false` | Show maintenance page |
| `checkout.guestCheckout.enabled` | Release | `true` | Allow guest checkout |
| `features.wishlist.enabled` | Release | `true` | Enable wishlist feature |
| `features.reviews.enabled` | Release | `true` | Enable product reviews |
| `features.blog.enabled` | Release | `true` | Enable blog section |
| `features.search.enabled` | Release | `true` | Enable search feature |
| `features.cartPersistence.enabled` | Release | `true` | Persist cart across sessions |
| `features.socialLogin.enabled` | Release | `false` | Enable social login |
| `features.multiCurrency.enabled` | Release | `false` | Enable multi-currency |
| `features.aiRecommendations.enabled` | Experiment | `false` | AI-powered recommendations |
| `features.newFilterDesign.enabled` | Experiment | `false` | New catalog filter UI |
| `features.checkoutV2.enabled` | Experiment | `false` | Redesigned checkout flow |
| `admin.advancedAnalytics.enabled` | Permission | `false` | Advanced analytics dashboard |
| `admin.bulkOperations.enabled` | Release | `false` | Bulk product/order operations |
| `ops.rateLimiting.enabled` | Ops | `true` | Enable rate limiting |
| `ops.botProtection.enabled` | Ops | `true` | Enable Turnstile bot protection |
| `ops.cacheEnabled` | Ops | `true` | Enable edge caching |

### 4.7 Feature Flag Evaluation

```
┌─────────────────────────────────────────────────────────────────┐
│                 FEATURE FLAG EVALUATION FLOW                      │
│                                                                  │
│  1. Request arrives                                              │
│     → Extract context (user ID, role, location, device)          │
│                                                                  │
│  2. Check override                                               │
│     → Environment variable override (highest priority)           │
│     → Admin override for specific user                           │
│                                                                  │
│  3. Check target rules                                           │
│     → Percentage rollout                                         │
│     → User segment match                                         │
│     → Geographic match                                           │
│     → Role-based access                                          │
│                                                                  │
│  4. Return flag value                                            │
│     → true/false                                                 │
│     → Variant string (for experiments)                           │
│     → Config object (for dynamic config)                         │
│                                                                  │
│  5. Track exposure                                               │
│     → Log flag evaluation for analytics                          │
│     → Track experiment variant assignment                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.8 Feature Flag Evaluation Rules

```typescript
// api/_lib/config/feature-flags/evaluate.ts

interface FeatureFlagContext {
  userId?: string;
  userRole?: 'customer' | 'admin';
  countryCode?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  environment: 'development' | 'staging' | 'production';
}

interface FeatureFlagResult {
  enabled: boolean;
  variant?: string;
  reason: 'default' | 'override' | 'rollout' | 'segment' | 'targeting';
}

function evaluateFlag(
  flagKey: string,
  context: FeatureFlagContext,
  flags: FeatureFlagConfig
): FeatureFlagResult {
  const envOverride = getEnvironmentOverride(flagKey, context.environment);
  if (envOverride !== undefined) {
    return { enabled: envOverride, reason: 'override' };
  }

  const adminOverride = getAdminOverride(flagKey, context.userId);
  if (adminOverride !== undefined) {
    return { enabled: adminOverride, reason: 'override' };
  }

  const targeting = evaluateTargeting(flagKey, context, flags);
  if (targeting) {
    return targeting;
  }

  return { enabled: flags[flagKey]?.default ?? false, reason: 'default' };
}
```

### 4.9 Feature Flag Targeting Rules

| Rule Type | Description | Example |
|-----------|-------------|---------|
| **Percentage Rollout** | Enable for X% of users | Enable for 10% of users |
| **User Segment** | Enable for specific user groups | Enable for beta testers |
| **Role-based** | Enable for specific roles | Enable for admin only |
| **Geographic** | Enable for specific countries | Enable for India only |
| **Device-based** | Enable for specific devices | Enable for mobile only |
| **Date Range** | Enable during specific dates | Enable Dec 15 - Jan 15 |
| **User Attribute** | Enable based on user properties | Enable for users with 5+ orders |

### 4.10 Feature Flag Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Independent of business logic** | Feature flags control visibility, not business rules | Clean separation |
| **Default safe** | New flags default to `false` (disabled) | Safe by default |
| **Temporary by default** | Feature flags should have a sunset date | Prevent flag sprawl |
| **Naming convention** | `{domain}.{feature}.{variant}` format | Discoverability |
| **Documented** | Every flag has description, owner, and sunset date | Maintainability |
| **Evaluated at edge** | Flag evaluation happens at Cloudflare edge | Performance |
| **Cached** | Flag evaluation results cached per request | Performance |
| **Tracked** | Flag evaluations logged for analytics | Experimentation |
| **No side effects** | Flag evaluation is pure, no mutations | Safety |
| **Kill switch ready** | Any feature can be instantly disabled | Emergency response |

### 4.11 Experimental Features

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Experiment ID** | `experiment.id` | string | Auto-generated | System |
| **Experiment Name** | `experiment.name` | string | Required | Product |
| **Variants** | `experiment.variants` | json | `[{key:"control",weight:50},{key:"treatment",weight:50}]` | Product |
| **Traffic Percentage** | `experiment.traffic` | int | `100` | Product |
| **Start Date** | `experiment.startDate` | datetime | Required | Product |
| **End Date** | `experiment.endDate` | datetime | Required | Product |
| **Primary Metric** | `experiment.metric` | string | Required | Product |
| **Status** | `experiment.status` | enum | `draft` | Product |

### 4.12 Beta Features

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Beta Users** | `beta.users` | json | `[]` | Product |
| **Beta Groups** | `beta.groups` | json | `[]` | Product |
| **Beta Domains** | `beta.domains` | json | `[]` | Product |
| **Beta Max Users** | `beta.maxUsers` | int | `100` | Product |
| **Beta Feedback URL** | `beta.feedbackUrl` | string? | null | Product |

### 4.13 Emergency Disable

**What:** Instant kill switch capability for any feature, configurable via admin UI.

**Why:**
- Security incidents require immediate feature disable
- Bad deployments need instant rollback without code deployment
- Business events may require temporary feature restriction

**Emergency Disable Flow:**
```
1. Admin identifies problematic feature
2. Admin navigates to System Settings → Feature Flags
3. Admin toggles kill switch for the feature
4. Feature is immediately disabled for all users
5. KV cache is invalidated
6. Audit log records the emergency action
7. Alert notification sent to engineering team
```

### 4.14 Environment-specific Features

| Environment | Flag Override Behavior | Use Case |
|-------------|----------------------|----------|
| **Development** | All flags default to `true` | Feature development |
| **Staging** | Flags match production with testing overrides | QA testing |
| **Preview** | Flags match production | PR preview testing |
| **Production** | Flags set by admin | Live environment |

### 4.15 Feature Flag Lifecycle Management

| Phase | Action | Duration |
|-------|--------|----------|
| **Draft** | Flag created, not yet active | Until ready |
| **Active** | Flag enabled, monitoring metrics | 1-4 weeks |
| **Rollout** | Gradual percentage increase | 1-2 weeks |
| **Complete** | Flag removed, feature always on | N/A |
| **Sunset** | Flag deprecated, cleanup scheduled | 30 days |
| **Removed** | Flag deleted from system | N/A |

**Best practices:**
- Always provide a kill switch for new features
- Track feature flag usage to prevent flag sprawl
- Set sunset dates for all temporary flags
- Evaluate flags at the edge for performance
- Keep flag evaluation logic simple and pure
- Log all flag evaluations for analytics

**Common implementation mistakes:**
- Using feature flags for business logic (wrong abstraction)
- Not providing kill switches for risky features
- Forgetting to clean up old feature flags
- Making flag evaluation depend on database queries
- Not tracking flag exposure for experiments
- Coupling feature flags to configuration settings

---

## 5. System Settings Architecture

### 5.1 What

The complete architecture for system-level settings that control infrastructure behavior, performance, security, and operational parameters.

### 5.2 Why

- **Operations:** System settings control infrastructure behavior
- **Performance:** Cache, storage, and queue settings affect performance
- **Security:** Security settings protect the platform
- **Monitoring:** Logging and debug settings control observability

### 5.3 Where

`api/_lib/config/system.ts`, `api/_handlers/admin/system/`, `AdminSetting` database table, `wrangler.jsonc`.

### 5.4 Maintenance Mode Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Maintenance Enabled** | `maintenance.enabled` | boolean | `false` | Super Admin |
| **Maintenance Message** | `maintenance.message` | string | `"We're performing scheduled maintenance."` | Super Admin |
| **Maintenance End Time** | `maintenance.endTime` | datetime? | null | Super Admin |
| **Admin Bypass** | `maintenance.adminBypass` | boolean | `true` | Super Admin |
| **Bypass IPs** | `maintenance.bypassIps` | json | `[]` | Super Admin |
| **Bypass User Roles** | `maintenance.bypassRoles` | json | `["admin"]` | Super Admin |
| **Maintenance Page URL** | `maintenance.pageUrl` | string? | null | Super Admin |

### 5.5 Debug Mode Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Debug Mode** | `debug.enabled` | boolean | `false` | Super Admin |
| **Log Level** | `debug.logLevel` | enum | `info` | Super Admin |
| **API Debug** | `debug.apiEnabled` | boolean | `false` | Super Admin |
| **Query Debug** | `debug.queryEnabled` | boolean | `false` | Super Admin |
| **Performance Tracing** | `debug.tracingEnabled` | boolean | `false` | Super Admin |
| **Error Reporting** | `debug.errorReportingEnabled` | boolean | `true` | Super Admin |

### 5.6 Logging Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Log Level** | `logging.level` | enum | `info` | Super Admin |
| **Log Format** | `logging.format` | enum | `json` | Super Admin |
| **Log Retention Days** | `logging.retentionDays` | int | `30` | Super Admin |
| **Audit Log Retention Days** | `logging.auditRetentionDays` | int | `2555` | Super Admin |
| **Error Log Alerting** | `logging.errorAlertingEnabled` | boolean | `true` | Super Admin |
| **Performance Logging** | `logging.performanceEnabled` | boolean | `true` | Super Admin |

### 5.7 Cache Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Cache Enabled** | `cache.enabled` | boolean | `true` | Super Admin |
| **Product Cache TTL** | `cache.productTtlSeconds` | int | `300` | Admin |
| **Category Cache TTL** | `cache.categoryTtlSeconds` | int | `3600` | Admin |
| **Settings Cache TTL** | `cache.settingsTtlSeconds` | int | `300` | Admin |
| **Search Cache TTL** | `cache.searchTtlSeconds` | int | `60` | Admin |
| **Stale-While-Revalidate** | `cache.staleWhileRevalidate` | boolean | `true` | Super Admin |
| **Cache Invalidation Key** | `cache.invalidationKey` | string | Auto-generated | System |

### 5.8 Storage Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Primary Storage** | `storage.primary` | enum | `cloudinary` | Super Admin |
| **Max Upload Size MB** | `storage.maxUploadSizeMb` | int | `10` | Admin |
| **Allowed Image Types** | `storage.allowedImageTypes` | json | `["image/jpeg","image/png","image/webp"]` | Admin |
| **Allowed Document Types** | `storage.allowedDocTypes` | json | `["application/pdf"]` | Admin |
| **Image Max Dimensions** | `storage.imageMaxDimensions` | json | `{"width":4000,"height":4000}` | Admin |
| **CDN Enabled** | `storage.cdnEnabled` | boolean | `true` | Super Admin |
| **Auto-Optimize Images** | `storage.autoOptimize` | boolean | `true` | Admin |

### 5.9 Search Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Search Enabled** | `search.enabled` | boolean | `true` | Admin |
| **Search Provider** | `search.provider` | enum | `pg_trgm` | Super Admin |
| **Min Search Length** | `search.minLength` | int | `2` | Admin |
| **Max Results** | `search.maxResults` | int | `100` | Admin |
| **Fuzzy Matching** | `search.fuzzyEnabled` | boolean | `true` | Admin |
| **Search Suggestions** | `search.suggestionsEnabled` | boolean | `true` | Admin |
| **Search Analytics** | `search.analyticsEnabled` | boolean | `true` | Admin |

### 5.10 Queue Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Email Queue** | `queue.emailEnabled` | boolean | `true` | Super Admin |
| **Webhook Queue** | `queue.webhookEnabled` | boolean | `true` | Super Admin |
| **Max Retries** | `queue.maxRetries` | int | `3` | Super Admin |
| **Retry Delay Seconds** | `queue.retryDelaySeconds` | int | `60` | Super Admin |
| **Queue Monitor** | `queue.monitoringEnabled` | boolean | `true` | Super Admin |

### 5.11 Notification Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Email Notifications** | `notifications.emailEnabled` | boolean | `true` | Admin |
| **SMS Notifications** | `notifications.smsEnabled` | boolean | `false` | Admin |
| **Push Notifications** | `notifications.pushEnabled` | boolean | `false` | Admin |
| **Order Notifications** | `notifications.orderEmails` | boolean | `true` | Admin |
| **Marketing Emails** | `notifications.marketingEnabled` | boolean | `false` | Admin |
| **Security Alerts** | `notifications.securityAlerts` | boolean | `true` | Super Admin |

### 5.12 Email Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Email Provider** | `email.provider` | enum | `resend` | Super Admin |
| **Sender Name** | `email.senderName` | string | Required | Admin |
| **Sender Email** | `email.senderEmail` | string | Required | Admin |
| **Reply-To Email** | `email.replyTo` | string | Required | Admin |
| **Rate Limit Per Day** | `email.rateLimitPerDay` | int | `1000` | Super Admin |
| **Email Templates** | `email.templatesEnabled` | boolean | `true` | Admin |

### 5.13 Security Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Password Min Length** | `security.passwordMinLength` | int | `8` | Super Admin |
| **Password Require Uppercase** | `security.passwordRequireUppercase` | boolean | `true` | Super Admin |
| **Password Require Numbers** | `security.passwordRequireNumbers` | boolean | `true` | Super Admin |
| **Password Require Special** | `security.passwordRequireSpecial` | boolean | `true` | Super Admin |
| **Max Login Attempts** | `security.maxLoginAttempts` | int | `5` | Super Admin |
| **Lockout Duration Minutes** | `security.lockoutDurationMinutes` | int | `15` | Super Admin |
| **Session Timeout Minutes** | `security.sessionTimeoutMinutes` | int | `15` | Super Admin |
| **Refresh Token Days** | `security.refreshTokenDays` | int | `7` | Super Admin |
| **Max Sessions Per User** | `security.maxSessionsPerUser` | int | `5` | Super Admin |
| **CSRF Protection** | `security.csrfEnabled` | boolean | `true` | Super Admin |
| **Rate Limiting** | `security.rateLimitingEnabled` | boolean | `true` | Super Admin |
| **IP Whitelist Admin** | `security.ipWhitelistAdmin` | json | `[]` | Super Admin |

### 5.14 System Settings Schema

```typescript
// api/_lib/config/system/schemas.ts

import { z } from 'zod';

const MaintenanceSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  message: z.string().max(500).default("We're performing scheduled maintenance."),
  endTime: z.string().datetime().optional(),
  adminBypass: z.boolean().default(true),
  bypassIps: z.array(z.string()).default([]),
  bypassRoles: z.array(z.enum(['admin'])).default(['admin']),
  pageUrl: z.string().url().optional(),
});

const CacheSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  productTtlSeconds: z.number().min(0).max(86400).default(300),
  categoryTtlSeconds: z.number().min(0).max(86400).default(3600),
  settingsTtlSeconds: z.number().min(0).max(86400).default(300),
  searchTtlSeconds: z.number().min(0).max(86400).default(60),
  staleWhileRevalidate: z.boolean().default(true),
});

const SecuritySettingsSchema = z.object({
  passwordMinLength: z.number().min(6).max(128).default(8),
  passwordRequireUppercase: z.boolean().default(true),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireSpecial: z.boolean().default(true),
  maxLoginAttempts: z.number().min(3).max(20).default(5),
  lockoutDurationMinutes: z.number().min(5).max(1440).default(15),
  sessionTimeoutMinutes: z.number().min(5).max(1440).default(15),
  refreshTokenDays: z.number().min(1).max(90).default(7),
  maxSessionsPerUser: z.number().min(1).max(20).default(5),
  csrfEnabled: z.boolean().default(true),
  rateLimitingEnabled: z.boolean().default(true),
  ipWhitelistAdmin: z.array(z.string()).default([]),
});
```

### 5.15 System Settings Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Super Admin only** | System settings require Super Admin | Security |
| **Validated strictly** | All system settings validated against schema | Prevent misconfiguration |
| **Audit logged** | Every system setting change logged | Accountability |
| **Immediate effect** | Changes apply within cache TTL | Operational agility |
| **Safe defaults** | Default values are secure and functional | Protection |
| **Environment-aware** | Settings can differ per environment | Safe testing |

**Best practices:**
- Never expose debug settings in production
- Rotate security settings with caution (may lock out users)
- Log all system settings changes with before/after values
- Cache system settings for fast reads during request handling
- Validate system settings against infrastructure constraints

**Common implementation mistakes:**
- Enabling debug mode in production
- Not logging system settings changes
- Making system settings editable by non-admins
- Not validating settings against infrastructure limits
- Caching system settings without invalidation on change

---

## 6. Localization Architecture

### 6.1 What

The complete localization system that supports multiple languages, currencies, timezones, date formats, and regional settings.

### 6.2 Why

- **Global reach:** Support customers in multiple regions
- **Compliance:** Meet regional legal and regulatory requirements
- **UX:** Localized experience increases conversion
- **Scalability:** Ready for international expansion

### 6.3 Where

`api/_lib/config/localization.ts`, `src/lib/i18n/`, `AdminSetting` database table.

### 6.4 Language Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Default Language** | `localization.defaultLanguage` | enum | `en` | Admin |
| **Enabled Languages** | `localization.enabledLanguages` | json | `["en"]` | Admin |
| **Language Selector** | `localization.languageSelectorEnabled` | boolean | `true` | Admin |
| **Auto-Detect Language** | `localization.autoDetect` | boolean | `true` | Admin |
| **Translation Fallback** | `localization.fallbackLanguage` | enum | `en` | Admin |

### 6.5 Supported Languages

| Code | Language | Native Name | RTL | Status |
|------|----------|-------------|-----|--------|
| `en` | English | English | No | Active |
| `hi` | Hindi | हिन्दी | No | Active |
| `bn` | Bengali | বাংলা | No | Planned |
| `ta` | Tamil | தமிழ் | No | Planned |
| `te` | Telugu | తెలుగు | No | Planned |
| `mr` | Marathi | मराठी | No | Planned |
| `gu` | Gujarati | ગુજરાતી | No | Planned |
| `kn` | Kannada | ಕನ್ನಡ | No | Planned |
| `ml` | Malayalam | മലയാളം | No | Planned |
| `pa` | Punjabi | ਪੰਜਾਬੀ | No | Planned |

### 6.6 Currency Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Default Currency** | `localization.defaultCurrency` | enum | `INR` | Super Admin |
| **Enabled Currencies** | `localization.enabledCurrencies` | json | `["INR"]` | Super Admin |
| **Currency Display** | `localization.currencyDisplay` | enum | `symbol` | Admin |
| **Decimal Places** | `localization.decimalPlaces` | int | `2` | Admin |
| **Thousands Separator** | `localization.thousandsSeparator` | enum | `comma` | Admin |
| **Decimal Separator** | `localization.decimalSeparator` | enum | `dot` | Admin |

### 6.7 Supported Currencies

| Code | Symbol | Name | Decimal Places | Country |
|------|--------|------|----------------|---------|
| `INR` | ₹ | Indian Rupee | 2 | India |
| `USD` | $ | US Dollar | 2 | United States |
| `EUR` | € | Euro | 2 | European Union |
| `GBP` | £ | British Pound | 2 | United Kingdom |
| `AED` | د.إ | UAE Dirham | 2 | UAE |
| `SGD` | S$ | Singapore Dollar | 2 | Singapore |

### 6.8 Timezone Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Default Timezone** | `localization.defaultTimezone` | string | `Asia/Kolkata` | Admin |
| **Auto-Detect Timezone** | `localization.autoDetectTimezone` | boolean | `true` | Admin |
| **Display Timezone** | `localization.displayTimezone` | enum | `user_local` | Admin |

### 6.9 Date Format Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Date Format** | `localization.dateFormat` | enum | `dd/MM/yyyy` | Admin |
| **Time Format** | `localization.timeFormat` | enum | `12h` | Admin |
| **Week Start** | `localization.weekStart` | enum | `monday` | Admin |

### 6.10 Number Format Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Number Format** | `localization.numberFormat` | enum | `indian` | Admin |
| **Currency Position** | `localization.currencyPosition` | enum | `before` | Admin |

### 6.11 RTL Readiness

**What:** Support for right-to-left languages (Arabic, Hebrew, Urdu).

**Why:**
- Future international expansion may require RTL languages
- RTL support must be architected from the start, not bolted on

**Where:** All UI components, layout, typography.

**RTL Architecture Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Logical properties** | Use CSS logical properties (`margin-inline-start`) | RTL-compatible |
| **No hardcoded direction** | Use `dir` attribute, not hardcoded `left`/`right` | RTL-ready |
| **Icon mirroring** | Directional icons mirror in RTL | Correct UX |
| **Text alignment** | Use `text-align: start/end` not `left/right` | RTL-ready |
| **Flexbox/Grid** | Use `start/end` not `left/right` | RTL-ready |

### 6.12 Regional Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Country** | `localization.country` | string | `IN` | Admin |
| **State** | `localization.state` | string? | null | Admin |
| **Phone Format** | `localization.phoneFormat` | enum | `indian` | Admin |
| **Address Format** | `localization.addressFormat` | enum | `indian` | Admin |
| **Tax Display** | `localization.taxDisplay` | enum | `inclusive` | Admin |

### 6.13 Localization Schema

```typescript
// api/_lib/config/localization/schemas.ts

import { z } from 'zod';

const LanguageSchema = z.enum([
  'en', 'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa',
]);

const CurrencySchema = z.enum([
  'INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD',
]);

const LocalizationSettingsSchema = z.object({
  defaultLanguage: LanguageSchema.default('en'),
  enabledLanguages: z.array(LanguageSchema).default(['en']),
  defaultCurrency: CurrencySchema.default('INR'),
  enabledCurrencies: z.array(CurrencySchema).default(['INR']),
  defaultTimezone: z.string().default('Asia/Kolkata'),
  dateFormat: z.enum([
    'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd',
    'dd.MM.yyyy', 'dd-MM-yyyy',
  ]).default('dd/MM/yyyy'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
  weekStart: z.enum(['sunday', 'monday']).default('monday'),
  numberFormat: z.enum(['indian', 'international']).default('indian'),
  currencyDisplay: z.enum(['symbol', 'code', 'name']).default('symbol'),
  currencyPosition: z.enum(['before', 'after']).default('before'),
  decimalPlaces: z.number().min(0).max(4).default(2),
  thousandsSeparator: z.enum(['comma', 'dot', 'space']).default('comma'),
  decimalSeparator: z.enum(['dot', 'comma']).default('dot'),
  country: z.string().length(2).default('IN'),
});
```

### 6.14 Localization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default to India** | INR, IST, dd/MM/yyyy, Indian number format | Primary market |
| **UTF-8 everywhere** | All text fields support full Unicode | Multi-language |
| **Locale-aware formatting** | Numbers, dates, currency formatted per locale | Correct UX |
| **RTL-ready architecture** | CSS logical properties from day one | Future-proof |
| **Fallback chain** | Always fall back to English | Never break UX |
| **Admin-configurable** | All localization settings editable via admin | No code changes |

**Best practices:**
- Use ICU message format for translations
- Store all user-facing text in translation files, not hardcoded
- Use CSS logical properties for layout direction
- Format dates, numbers, and currency per user locale
- Provide translation management in admin UI

**Common implementation mistakes:**
- Hardcoding date formats in application code
- Not supporting Unicode in database fields
- Using `left`/`right` CSS instead of logical properties
- Not providing fallback translations
- Not testing with RTL languages

---

## 7. Branding Architecture

### 7.1 What

The complete branding system that controls visual identity across all touchpoints — storefront, admin, emails, PDFs, and notifications.

### 7.2 Why

- **Brand consistency:** Unified visual identity across all touchpoints
- **Professionalism:** Premium brand experience
- **Trust:** Consistent branding builds customer trust
- **Differentiation:** Unique brand identity in the market

### 7.3 Where

`api/_lib/config/branding.ts`, `src/lib/branding/`, `AdminSetting` database table.

### 7.4 Logo Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Primary Logo** | `branding.logo.primary` | string? | null | Admin |
| **Logo Light Mode** | `branding.logo.light` | string? | null | Admin |
| **Logo Dark Mode** | `branding.logo.dark` | string? | null | Admin |
| **Logo Favicon** | `branding.logo.favicon` | string? | null | Admin |
| **Logo Square** | `branding.logo.square` | string? | null | Admin |
| **Logo Width** | `branding.logo.width` | int | `150` | Admin |
| **Logo Height** | `branding.logo.height` | int | `40` | Admin |
| **Logo Alt Text** | `branding.logo.altText` | string | "Nabome" | Admin |

### 7.5 App Name Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **App Name** | `branding.appName` | string | "Nabome" | Admin |
| **App Tagline** | `branding.appTagline` | string? | null | Admin |
| **App Description** | `branding.appDescription` | string? | null | Admin |
| **App Short Name** | `branding.appShortName` | string | "Nabome" | Admin |

### 7.6 Meta Information

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Meta Title** | `branding.meta.title` | string | "Nabome — Premium Commerce" | Admin |
| **Meta Description** | `branding.meta.description` | string | "" | Admin |
| **Meta Keywords** | `branding.meta.keywords` | json | `[]` | Admin |
| **OG Image** | `branding.meta.ogImage` | string? | null | Admin |
| **OG Title** | `branding.meta.ogTitle` | string? | null | Admin |
| **OG Description** | `branding.meta.ogDescription` | string? | null | Admin |
| **Twitter Card** | `branding.meta.twitterCard` | enum | `summary_large_image` | Admin |

### 7.7 Theme Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Primary Color** | `branding.theme.primary` | hex | `#000000` | Admin |
| **Secondary Color** | `branding.theme.secondary` | hex | `#FFFFFF` | Admin |
| **Accent Color** | `branding.theme.accent` | hex | `#0066FF` | Admin |
| **Background Color** | `branding.theme.background` | hex | `#FFFFFF` | Admin |
| **Surface Color** | `branding.theme.surface` | hex | `#F5F5F5` | Admin |
| **Text Primary** | `branding.theme.textPrimary` | hex | `#1A1A1A` | Admin |
| **Text Secondary** | `branding.theme.textSecondary` | hex | `#6B7280` | Admin |
| **Error Color** | `branding.theme.error` | hex | `#DC2626` | Admin |
| **Success Color** | `branding.theme.success` | hex | `#16A34A` | Admin |
| **Warning Color** | `branding.theme.warning` | hex | `#D97706` | Admin |
| **Dark Mode Enabled** | `branding.theme.darkModeEnabled` | boolean | `true` | Admin |
| **Border Radius** | `branding.theme.borderRadius` | enum | `md` | Admin |

### 7.8 Typography Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Heading Font** | `branding.typography.headingFont` | string | `Inter` | Admin |
| **Body Font** | `branding.typography.bodyFont` | string | `Inter` | Admin |
| **Mono Font** | `branding.typography.monoFont` | string | `JetBrains Mono` | Admin |
| **Font Size Base** | `branding.typography.baseSize` | int | `16` | Admin |
| **Line Height** | `branding.typography.lineHeight` | decimal | `1.5` | Admin |
| **Font Weight Normal** | `branding.typography.weightNormal` | int | `400` | Admin |
| **Font Weight Bold** | `branding.typography.weightBold` | int | `700` | Admin |

### 7.9 Email Branding

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Email Header Logo** | `branding.email.headerLogo` | string? | null | Admin |
| **Email Footer Text** | `branding.email.footerText` | string? | null | Admin |
| **Email Primary Color** | `branding.email.primaryColor` | hex | `#000000` | Admin |
| **Email Background** | `branding.email.backgroundColor` | hex | `#FFFFFF` | Admin |
| **Email Social Links** | `branding.email.socialLinks` | json | `{}` | Admin |

### 7.10 PDF Branding

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Invoice Logo** | `branding.pdf.invoiceLogo` | string? | null | Admin |
| **Invoice Footer** | `branding.pdf.invoiceFooter` | string? | null | Admin |
| **Invoice Terms** | `branding.pdf.invoiceTerms` | string? | null | Admin |
| **Invoice Color** | `branding.pdf.invoiceColor` | hex | `#000000` | Admin |
| **Invoice Font** | `branding.pdf.invoiceFont` | string | `Inter` | Admin |

### 7.11 Notification Branding

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Push Icon** | `branding.notifications.pushIcon` | string? | null | Admin |
| **Push Color** | `branding.notifications.pushColor` | hex | `#000000` | Admin |
| **In-App Logo** | `branding.notifications.inAppLogo` | string? | null | Admin |
| **Notification Sound** | `branding.notifications.sound` | string? | null | Admin |

### 7.12 Branding Schema

```typescript
// api/_lib/config/branding/schemas.ts

import { z } from 'zod';

const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

const BrandingSettingsSchema = z.object({
  appName: z.string().min(1).max(100).default('Nabome'),
  appTagline: z.string().max(200).optional(),
  appDescription: z.string().max(500).optional(),
  appShortName: z.string().min(1).max(20).default('Nabome'),
  logo: z.object({
    primary: z.string().url().optional(),
    light: z.string().url().optional(),
    dark: z.string().url().optional(),
    favicon: z.string().url().optional(),
    square: z.string().url().optional(),
    width: z.number().min(1).max(500).default(150),
    height: z.number().min(1).max(200).default(40),
    altText: z.string().max(100).default('Nabome'),
  }),
  meta: z.object({
    title: z.string().max(100).default('Nabome — Premium Commerce'),
    description: z.string().max(300).default(''),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().url().optional(),
    ogTitle: z.string().max(100).optional(),
    ogDescription: z.string().max(300).optional(),
    twitterCard: z.enum(['summary', 'summary_large_image']).default('summary_large_image'),
  }),
  theme: z.object({
    primary: HexColorSchema.default('#000000'),
    secondary: HexColorSchema.default('#FFFFFF'),
    accent: HexColorSchema.default('#0066FF'),
    background: HexColorSchema.default('#FFFFFF'),
    surface: HexColorSchema.default('#F5F5F5'),
    textPrimary: HexColorSchema.default('#1A1A1A'),
    textSecondary: HexColorSchema.default('#6B7280'),
    error: HexColorSchema.default('#DC2626'),
    success: HexColorSchema.default('#16A34A'),
    warning: HexColorSchema.default('#D97706'),
    darkModeEnabled: z.boolean().default(true),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']).default('md'),
  }),
  typography: z.object({
    headingFont: z.string().default('Inter'),
    bodyFont: z.string().default('Inter'),
    monoFont: z.string().default('JetBrains Mono'),
    baseSize: z.number().min(12).max(24).default(16),
    lineHeight: z.number().min(1).max(2).default(1.5),
    weightNormal: z.number().min(100).max(900).default(400),
    weightBold: z.number().min(100).max(900).default(700),
  }),
});
```

### 7.13 Branding Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Accessible colors** | All colors meet WCAG 4.5:1 contrast ratio | Accessibility |
| **Logo format** | SVG preferred, PNG fallback | Quality at all sizes |
| **Dark mode support** | Light and dark logo variants | Modern UX |
| **Responsive logos** | Logo scales appropriately on all devices | Mobile-first |
| **Consistent branding** | Same branding across all touchpoints | Brand consistency |
| **Admin-configurable** | All branding editable via admin UI | No code changes |

**Best practices:**
- Provide both light and dark mode logo variants
- Ensure all brand colors meet accessibility contrast requirements
- Use SVG for logos (resolution-independent)
- Apply branding consistently across storefront, emails, PDFs, and notifications
- Test branding on all device sizes

**Common implementation mistakes:**
- Hardcoding brand colors in CSS instead of using config
- Not providing dark mode logo variant
- Not testing color contrast for accessibility
- Inconsistent branding across touchpoints
- Not validating logo dimensions and formats

---

## 8. Search & Management Architecture

### 8.1 What

The system for organizing, searching, categorizing, and managing configuration settings in the admin UI.

### 8.2 Why

- **Discoverability:** Admins find settings quickly
- **Organization:** Settings grouped logically
- **Efficiency:** Frequently used settings are easily accessible
- **Auditability:** Recently modified settings are trackable

### 8.3 Where

`src/features/admin/settings/`, `api/_handlers/admin/settings/search.ts`.

### 8.4 Setting Search

**What:** Full-text search across all configuration settings.

**Search Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Full-text search** | Search setting name, description, and value | Discoverability |
| **Fuzzy matching** | Typo-tolerant search | UX |
| **Instant results** | Search results appear as user types | Responsiveness |
| **Highlighted matches** | Search terms highlighted in results | Clarity |
| **Recent searches** | Remember recent searches | Efficiency |
| **Keyboard shortcut** | Cmd+K / Ctrl+K to open search | Power users |

### 8.5 Setting Categories

| Category | Subcategories | Icon |
|----------|---------------|------|
| **General** | Platform, Business, Company, Contact | ⚙️ |
| **Commerce** | Shipping, Orders, Returns, Refunds, Inventory | 🛒 |
| **Payments** | Payment Methods, Payouts, Commissions | 💳 |
| **Marketing** | SEO, Social, Promotions, Reviews | 📢 |
| **Content** | CMS, Blog, Pages, Media | 📝 |
| **Users** | Registration, Profiles, Roles | 👥 |
| **Notifications** | Email, SMS, Push, In-App | 🔔 |
| **Appearance** | Branding, Theme, Typography | 🎨 |
| **Localization** | Language, Currency, Timezone | 🌍 |
| **System** | Cache, Storage, Queue, Debug | 🔧 |
| **Security** | Auth, Sessions, Rate Limiting, CSRF | 🔒 |
| **Features** | Feature Flags, Experiments, Beta | 🚀 |

### 8.6 Setting Groups

Settings within categories are organized into groups:

```
Commerce
├── Shipping Rules
│   ├── Free Shipping Threshold
│   ├── Flat Rate Shipping
│   └── COD Settings
├── Order Rules
│   ├── Auto-Confirm
│   ├── Cancellation Window
│   └── Max Items
├── Return Rules
│   ├── Return Window
│   ├── Return Method
│   └── Auto-Approve
└── Inventory Rules
    ├── Low Stock Threshold
    ├── Out of Stock Action
    └── Backorder Settings
```

### 8.7 Setting Favorites

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Favorite Settings** | `admin.favorites` | json | `[]` | User |

**Favorite Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Per-user** | Each admin has own favorites | Personalization |
| **Persistent** | Favorites saved to database | Cross-device |
| **Quick access** | Favorites shown at top of settings | Efficiency |
| **Max 20** | Maximum 20 favorite settings | UI clarity |

### 8.8 Recently Modified Settings

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **Recently Modified** | `admin.recentlyModified` | json | `[]` | User |

**Recently Modified Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Per-user** | Each admin has own history | Personalization |
| **Last 10** | Show last 10 modified settings | UI clarity |
| **Persistent** | History saved to database | Cross-device |
| **Timestamp shown** | Show when each setting was last modified | Context |
| **Quick revert** | One-click revert to previous value | Efficiency |

### 8.9 Configuration History

| Setting | Key | Type | Default | Access |
|---------|-----|------|---------|--------|
| **History Enabled** | `config.historyEnabled` | boolean | `true` | Super Admin |
| **History Retention Days** | `config.historyRetentionDays` | int | `365` | Super Admin |
| **History Max Versions** | `config.historyMaxVersions` | int | `50` | Super Admin |

**History Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Every change logged** | Every config change creates a history entry | Audit trail |
| **Before/after values** | Store both old and new values | Diff visibility |
| **Actor tracking** | Log who made the change | Accountability |
| **Timestamp** | Log when the change was made | Timeline |
| **Reason field** | Optional reason for the change | Context |
| **Diff view** | Show visual diff of changes | Clarity |

### 8.10 Setting Search Schema

```typescript
// api/_lib/config/search/schemas.ts

import { z } from 'zod';

const SettingSearchQuerySchema = z.object({
  query: z.string().min(1).max(100),
  category: z.string().optional(),
  group: z.string().optional(),
  recentlyModified: z.boolean().optional(),
  favorites: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

const SettingHistoryEntrySchema = z.object({
  id: z.string().uuid(),
  settingKey: z.string(),
  settingGroup: z.string(),
  oldValue: z.unknown(),
  newValue: z.unknown(),
  changedBy: z.string().uuid(),
  changedByName: z.string(),
  changedAt: z.string().datetime(),
  reason: z.string().optional(),
});
```

### 8.11 Search & Management Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Grouped logically** | Settings grouped by business domain | Discoverability |
| **Searchable** | All settings full-text searchable | Efficiency |
| **Favorited** | Frequently used settings can be favorited | Personalization |
| **History tracked** | All changes tracked with diff | Accountability |
| **Mobile-optimized** | Settings management works on mobile | Anywhere admin |
| **Keyboard accessible** | All settings accessible via keyboard | Accessibility |

**Best practices:**
- Group settings by business domain, not technical structure
- Provide full-text search across all settings
- Allow admins to favorite frequently used settings
- Track recently modified settings for quick access
- Show configuration history with before/after diffs

**Common implementation mistakes:**
- Flat list of all settings (no grouping)
- No search functionality
- No recently modified tracking
- No configuration history
- Not optimizing settings UI for mobile

---

## 9. Configuration Versioning & History

### 9.1 What

The complete versioning system for configuration changes including history tracking, rollback capability, draft configuration, and publish workflow.

### 9.2 Why

- **Recovery:** Undo misconfigurations quickly
- **Compliance:** Audit trail of all configuration changes
- **Collaboration:** Multiple admins can work on config safely
- **Safety:** Draft changes don't affect production until published

### 9.3 Where

`api/_lib/config/versioning.ts`, `api/_handlers/admin/settings/history.ts`, `ConfigHistory` database table.

### 9.4 Configuration History Schema

```prisma
model ConfigHistory {
  id           String   @id @default(uuid())
  settingKey   String   @db.VarChar(200)
  settingGroup String   @db.VarChar(100)
  oldValue     Json?
  newValue     Json?
  version      Int      @default(1)
  changedBy    String
  changedByName String  @db.VarChar(200)
  changedAt    DateTime @default(now())
  reason       String?  @db.VarChar(500)
  isPublished  Boolean  @default(true)
  isDraft      Boolean  @default(false)

  @@index([settingKey])
  @@index([settingGroup])
  @@index([changedBy])
  @@index([changedAt])
  @@index([isPublished])
}
```

### 9.5 Configuration Versioning Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Incremental versions** | Each change increments version number | Clear history |
| **Immutable history** | History entries never modified | Audit integrity |
| **Before/after values** | Store both old and new values | Diff visibility |
| **Actor tracking** | Log who made the change | Accountability |
| **Timestamp** | Log when the change was made | Timeline |
| **Reason field** | Optional reason for the change | Context |
| **Max versions** | Keep last 50 versions per setting | Storage efficiency |

### 9.6 Rollback Architecture

**What:** The ability to restore a configuration setting to a previous version.

**Why:**
- Misconfigurations must be recoverable instantly
- Bad feature flag states need immediate revert
- Business rule changes may need to be undone

**Rollback Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│                 ROLLBACK FLOW                                    │
│                                                                  │
│  1. Admin identifies misconfiguration                            │
│     → Navigates to Settings → History                            │
│                                                                  │
│  2. Admin views configuration history                            │
│     → Sees list of changes with before/after values              │
│                                                                  │
│  3. Admin selects version to restore                             │
│     → Clicks "Restore" on desired version                        │
│                                                                  │
│  4. System validates restored value                              │
│     → Runs Zod schema validation                                 │
│     → Checks business constraints                                │
│                                                                  │
│  5. System applies restored value                                │
│     → Updates database setting                                   │
│     → Creates new history entry (restore action)                 │
│     → Invalidates KV cache                                       │
│                                                                  │
│  6. Audit log records rollback                                   │
│     → Logs who restored what                                     │
│     → Logs what was restored from/to                              │
│                                                                  │
│  7. Notification sent                                             │
│     → Alert to team that rollback occurred                       │
└─────────────────────────────────────────────────────────────────┘
```

### 9.7 Draft Configuration

**What:** Configuration changes saved as drafts before being published to production.

**Why:**
- Multiple changes can be batched and published together
- Changes can be reviewed before going live
- Prevents accidental misconfiguration

**Draft Rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Draft by default** | New changes saved as drafts first | Safety |
| **Batch publish** | Multiple draft changes published together | Atomicity |
| **Review required** | Drafts must be reviewed before publish | Quality |
| **Draft expiry** | Drafts older than 30 days auto-archived | Cleanup |
| **Draft diff** | Show diff of draft vs current value | Clarity |
| **Draft validation** | All drafts validated before publish | Safety |

### 9.8 Publish Configuration

**What:** The workflow for publishing draft configuration changes to production.

**Publish Flow:**
```
┌─────────────────────────────────────────────────────────────────┐
│                 PUBLISH FLOW                                     │
│                                                                  │
│  1. Admin reviews draft changes                                  │
│     → Views diff of each change                                  │
│     → Validates all changes                                      │
│                                                                  │
│  2. Admin clicks "Publish"                                       │
│     → Confirmation dialog with change summary                    │
│                                                                  │
│  3. System validates all changes                                 │
│     → Zod schema validation                                      │
│     → Business constraint validation                             │
│     → Cross-setting dependency validation                        │
│                                                                  │
│  4. System applies all changes atomically                        │
│     → All changes applied in single transaction                  │
│     → Or all changes rejected                                    │
│                                                                  │
│  5. System creates history entries                               │
│     → Each change logged with before/after                       │
│                                                                  │
│  6. System invalidates KV cache                                  │
│     → All affected caches invalidated                            │
│                                                                  │
│  7. System logs audit event                                      │
│     → Publish event logged with all changes                      │
│                                                                  │
│  8. Notification sent                                             │
│     → Alert to team that config was published                    │
└─────────────────────────────────────────────────────────────────┘
```

### 9.9 Versioning Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Atomic publish** | All draft changes published together or none | Consistency |
| **Validation before publish** | All changes validated before apply | Safety |
| **Cache invalidation** | KV cache invalidated on publish | Fresh reads |
| **Audit logging** | Every publish logged | Accountability |
| **Rollback ready** | Previous version always available | Recovery |
| **Notification** | Team notified on publish | Awareness |

**Best practices:**
- Always validate configuration before publishing
- Use draft/publish workflow for critical settings
- Keep configuration history for at least 1 year
- Provide visual diff for configuration changes
- Log all configuration changes with actor and timestamp

**Common implementation mistakes:**
- Not validating configuration before publish
- Not creating history entries on change
- Not invalidating cache after publish
- Not providing rollback capability
- Publishing drafts without review

---

## 10. Configuration Permissions

### 10.1 What

The permission model for who can view, edit, publish, rollback, export, and restore configuration settings.

### 10.2 Why

- **Security:** Not all admins should access all settings
- **Compliance:** Configuration changes must be authorized
- **Accountability:** Clear who can change what
- **Safety:** Critical settings require elevated permissions

### 10.3 Where

`api/_lib/auth/middleware.ts`, `api/_lib/config/permissions.ts`.

### 10.4 Configuration Permission Matrix

| Permission | Admin | Super Admin | System Services |
|------------|-------|-------------|-----------------|
| **View Settings** | ✓ (non-sensitive) | ✓ (all) | ✓ (all) |
| **Edit Business Settings** | ✓ | ✓ | ✗ |
| **Edit Platform Settings** | ✗ | ✓ | ✗ |
| **Edit Security Settings** | ✗ | ✓ | ✗ |
| **Edit System Settings** | ✗ | ✓ | ✓ |
| **Toggle Feature Flags** | ✓ (non-critical) | ✓ (all) | ✓ (all) |
| **Toggle Maintenance Mode** | ✗ | ✓ | ✗ |
| **Publish Drafts** | ✓ (business) | ✓ (all) | ✗ |
| **Rollback Settings** | ✓ (business) | ✓ (all) | ✗ |
| **Export Settings** | ✓ (non-sensitive) | ✓ (all) | ✓ |
| **Import Settings** | ✗ | ✓ | ✗ |
| **View Config History** | ✓ (own changes) | ✓ (all) | ✓ |
| **View Audit Logs** | ✗ | ✓ | ✗ |

### 10.5 Permission Enforcement

```typescript
// api/_lib/config/permissions.ts

type ConfigPermission =
  | 'config:read'
  | 'config:edit:business'
  | 'config:edit:platform'
  | 'config:edit:security'
  | 'config:edit:system'
  | 'config:feature-flags:edit'
  | 'config:maintenance:toggle'
  | 'config:publish'
  | 'config:rollback'
  | 'config:export'
  | 'config:import'
  | 'config:history:read'
  | 'config:audit:read';

const rolePermissions: Record<string, ConfigPermission[]> = {
  admin: [
    'config:read',
    'config:edit:business',
    'config:feature-flags:edit',
    'config:publish',
    'config:rollback',
    'config:export',
    'config:history:read',
  ],
  super_admin: [
    'config:read',
    'config:edit:business',
    'config:edit:platform',
    'config:edit:security',
    'config:edit:system',
    'config:feature-flags:edit',
    'config:maintenance:toggle',
    'config:publish',
    'config:rollback',
    'config:export',
    'config:import',
    'config:history:read',
    'config:audit:read',
  ],
};

function hasConfigPermission(
  role: string,
  permission: ConfigPermission
): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}
```

### 10.6 Permission Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Least privilege** | Admins get minimum required permissions | Security |
| **Explicit grant** | Permissions must be explicitly granted | Security |
| **Default deny** | No access unless permission granted | Security |
| **Audit logged** | Permission checks logged | Accountability |
| **No bypass** | Permissions enforced at API level | Security |
| **Separation of duties** | Critical settings require multiple approvals | Safety |

**Best practices:**
- Enforce permissions at the API level, not just UI
- Log all permission checks (success and failure)
- Require elevated permissions for security-critical settings
- Review permissions quarterly
- Use role-based access control with clear permission matrix

**Common implementation mistakes:**
- Only checking permissions in UI (bypassable)
- Granting Super Admin for convenience
- Not logging permission checks
- Not reviewing permissions regularly
- Using single role for all admin operations

---

## 11. Configuration Security

### 11.1 What

Security standards for protecting configuration data, secrets, sensitive settings, and ensuring configuration integrity.

### 11.2 Why

- **Data protection:** Configuration may contain sensitive business data
- **Integrity:** Configuration must not be tampered with
- **Compliance:** Configuration changes must be auditable
- **Availability:** Configuration must be available when needed

### 11.3 Where

All configuration storage, access, and modification paths.

### 11.4 Secret Protection

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never in database** | Secrets stored in Cloudflare Pages Secrets | Security |
| **Never in code** | Secrets in environment variables | Security |
| **Never in logs** | Secrets never logged | Security |
| **Never in responses** | Secrets never returned in API responses | Security |
| **Encrypted at rest** | Sensitive settings encrypted | Security |
| **Access-controlled** | Secrets accessible only to authorized services | Security |

### 11.5 Sensitive Settings

| Category | Settings | Protection |
|----------|----------|------------|
| **Payment** | Razorpay keys, webhook secrets | Environment variables |
| **Authentication** | JWT secrets, CSRF secrets | Environment variables |
| **Database** | Database URLs, passwords | Environment variables |
| **Email** | API keys, sender credentials | Environment variables |
| **Storage** | Cloudinary API secrets | Environment variables |
| **Security** | Rate limit keys, encryption keys | Environment variables |

### 11.6 Encryption Readiness

| Rule | Standard | Rationale |
|------|----------|-----------|
| **AES-256** | Use AES-256 for encrypted settings | Industry standard |
| **Key rotation** | Encryption keys rotatable | Security hygiene |
| **Key storage** | Keys stored in Cloudflare Secrets | Security |
| **Encryption at rest** | Sensitive database fields encrypted | Data protection |
| **Encryption in transit** | All config access over HTTPS | Transport security |

### 11.7 Permission Enforcement

| Rule | Standard | Rationale |
|------|----------|-----------|
| **API-level enforcement** | Permissions checked at API, not UI | Security |
| **Every request validated** | Permission checked on every config access | Security |
| **No bypass** | No way to skip permission checks | Security |
| **Audit logged** | All permission checks logged | Accountability |
| **Rate limited** | Config modification endpoints rate limited | Abuse prevention |

### 11.8 Audit Logging

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Every change logged** | All config changes create audit entry | Accountability |
| **Actor tracking** | Log who made the change | Accountability |
| **Before/after values** | Store both old and new values | Diff visibility |
| **Timestamp** | Log when the change was made | Timeline |
| **IP tracking** | Log IP address of change | Security |
| **User agent** | Log user agent of change | Security |
| **Immutable** | Audit logs never modified | Integrity |
| **Retention** | Keep audit logs for 7 years | Compliance |

### 11.9 Configuration Validation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Schema validation** | All config validated against Zod schema | Data integrity |
| **Business validation** | Cross-setting constraints validated | Business logic |
| **Type validation** | Config values match expected types | Type safety |
| **Range validation** | Numeric values within acceptable ranges | Business rules |
| **Format validation** | String values match expected formats | Data integrity |
| **Dependency validation** | Dependent settings validated together | Consistency |

### 11.10 Security Settings Schema

```typescript
// api/_lib/config/security/schemas.ts

import { z } from 'zod';

const ConfigSecuritySettingsSchema = z.object({
  encryptionEnabled: z.boolean().default(true),
  encryptionAlgorithm: z.enum(['aes-256-gcm']).default('aes-256-gcm'),
  keyRotationDays: z.number().min(30).max(365).default(90),
  auditLogRetentionDays: z.number().min(30).max(2555).default(2555),
  sensitiveFieldsEncrypted: z.boolean().default(true),
  configAccessLogging: z.boolean().default(true),
  configModificationLogging: z.boolean().default(true),
});
```

### 11.11 Security Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Secrets in env vars** | Never in database or code | Security |
| **Encryption at rest** | Sensitive settings encrypted | Data protection |
| **Permission enforcement** | API-level permission checks | Security |
| **Audit logging** | All config changes logged | Accountability |
| **Validation** | All config validated before apply | Integrity |
| **Rate limiting** | Config modification endpoints rate limited | Abuse prevention |

**Best practices:**
- Store all secrets in Cloudflare Pages Secrets, never in database
- Encrypt sensitive settings at rest
- Enforce permissions at API level
- Log all configuration changes
- Validate all configuration before applying
- Rate-limit configuration modification endpoints

**Common implementation mistakes:**
- Storing secrets in database instead of environment variables
- Not encrypting sensitive settings
- Not enforcing permissions at API level
- Not logging configuration changes
- Not validating configuration before apply

---

## 12. Configuration Performance

### 12.1 What

Performance standards for configuration loading, caching, and delivery to ensure fast request handling.

### 12.2 Why

- **Latency:** Configuration reads happen on every request
- **Scalability:** Configuration must scale with traffic
- **Reliability:** Configuration must be available even during DB issues
- **UX:** Slow configuration reads degrade user experience

### 12.3 Where

`api/_lib/config/cache.ts`, `api/_lib/cache/kv.ts`, Cloudflare KV.

### 12.4 Runtime Loading

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Edge-first** | Configuration loaded at Cloudflare edge | Low latency |
| **KV caching** | Hot configuration cached in KV | Fast reads |
| **Fallback** | Database fallback if KV unavailable | Reliability |
| **Lazy loading** | Configuration loaded on first access | Performance |
| **Background refresh** | Stale configuration refreshed in background | Fresh data |

### 12.5 Configuration Cache

| Data | TTL | Invalidation | Storage |
|------|-----|--------------|---------|
| **Platform Settings** | 5 min | On update | KV |
| **Business Settings** | 5 min | On update | KV |
| **Feature Flags** | 1 min | On update | KV |
| **System Settings** | 5 min | On update | KV |
| **Security Settings** | 5 min | On update | KV |
| **Localization** | 1 hour | On update | KV |
| **Branding** | 1 hour | On update | KV |

### 12.6 Cache Strategy

```typescript
// api/_lib/config/cache.ts

interface ConfigCacheOptions {
  key: string;
  ttl: number;
  fetcher: () => Promise<T>;
}

async function getCachedConfig<T>(options: ConfigCacheOptions): Promise<T> {
  const { key, ttl, fetcher } = options;

  const cached = await KV.get(key, { type: 'json' });
  if (cached) {
    return cached as T;
  }

  const fresh = await fetcher();

  await KV.put(key, JSON.stringify(fresh), { expirationTtl: ttl });

  return fresh;
}

async function invalidateConfigCache(pattern: string): Promise<void> {
  const keys = await KV.list({ prefix: pattern });
  for (const key of keys.keys) {
    await KV.delete(key.name);
  }
}
```

### 12.7 Lazy Loading

| Rule | Standard | Rationale |
|------|----------|-----------|
| **On-demand** | Configuration loaded only when needed | Performance |
| **Grouped loading** | Load all settings in a group at once | Reduce queries |
| **Preload critical** | Preload critical config at request start | Latency |
| **Background refresh** | Stale config refreshed in background | Fresh data |

### 12.8 Background Refresh

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Stale-while-revalidate** | Serve stale, refresh in background | Performance |
| **Max stale time** | 5 minutes max stale time | Freshness |
| **Refresh on access** | Refresh when accessed while stale | Lazy refresh |
| **Error handling** | Serve stale on refresh failure | Reliability |

### 12.9 High Availability

| Rule | Standard | Rationale |
|------|----------|-----------|
| **KV redundancy** | KV globally replicated | Availability |
| **Database fallback** | Database available if KV fails | Reliability |
| **Circuit breaker** | Circuit breaker for config service | Resilience |
| **Health check** | Config service health endpoint | Monitoring |
| **Graceful degradation** | Use defaults if config unavailable | Reliability |

### 12.10 Performance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **< 50ms reads** | Configuration reads complete in < 50ms | Performance |
| **< 100ms writes** | Configuration writes complete in < 100ms | Performance |
| **No N+1** | Batch configuration reads | Performance |
| **Connection pooling** | Use Hyperdrive for database connections | Performance |
| **Edge caching** | All configuration cached at edge | Performance |

**Best practices:**
- Cache configuration at the edge with appropriate TTLs
- Use stale-while-revalidate for fresh reads without latency
- Invalidate cache immediately on configuration updates
- Provide fallback values for when configuration is unavailable
- Monitor configuration cache hit rates

**Common implementation mistakes:**
- Not caching configuration (DB overload)
- Caching without invalidation (stale config)
- Not providing fallback values (availability issues)
- N+1 configuration reads (performance)
- Not monitoring cache hit rates (no visibility)

---

## 13. Configuration Accessibility

### 13.1 What

Accessibility standards for configuration management UI, ensuring all admins can manage settings regardless of device or ability.

### 13.2 Why

- **Inclusivity:** All team members must be able to manage settings
- **Compliance:** Meet accessibility standards (WCAG 2.1)
- **Legal:** Accessibility is a legal requirement in many jurisdictions
- **Efficiency:** Accessible UIs are more efficient for all users

### 13.3 Where

All admin settings UI components.

### 13.4 Mobile Administration

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Responsive layout** | Settings UI works on all screen sizes | Mobile-first |
| **Touch targets** | Minimum 44x44px for interactive elements | Touch-friendly |
| **No horizontal scroll** | Content fits mobile viewport | Mobile UX |
| **Bottom actions** | Primary actions in thumb zone | Mobile ergonomics |
| **Pull to refresh** | Pull down to refresh settings | Mobile convention |
| **Swipe gestures** | Swipe to reveal actions | Natural interaction |

### 13.5 Responsive Forms

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single column mobile** | Forms stack on mobile | Readability |
| **Two column desktop** | Forms use two columns on desktop | Space efficiency |
| **Inline validation** | Validate on blur, not on every keystroke | UX |
| **Clear labels** | Labels always visible (not floating) | Clarity |
| **Help text** | Help text below inputs | Guidance |
| **Error messages** | Clear, actionable error messages | Usability |

### 13.6 Keyboard Navigation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Tab order** | Logical tab order through settings | Keyboard access |
| **Focus visible** | Clear focus indicator on all elements | Keyboard visibility |
| **Keyboard shortcuts** | Cmd+K for search, Esc to close | Power users |
| **No keyboard traps** | All elements reachable via keyboard | Accessibility |
| **Enter to submit** | Enter key submits forms | Expected behavior |
| **Escape to cancel** | Escape key cancels operations | Expected behavior |

### 13.7 Screen Readers

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic HTML** | Use semantic elements (button, input, label) | Screen reader support |
| **ARIA labels** | Provide ARIA labels where needed | Screen reader support |
| **Status announcements** | Announce save/error status | Screen reader support |
| **Form associations** | Labels associated with inputs | Screen reader support |
| **Error announcements** | Errors announced to screen readers | Accessibility |

### 13.8 Clear Validation

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Inline validation** | Validate on blur | Immediate feedback |
| **Error summary** | Show error summary at top of form | Overview |
| **Field-level errors** | Show errors next to relevant field | Clarity |
| **Success feedback** | Show success message on save | Confirmation |
| **Warning messages** | Show warnings for risky changes | Safety |
| **Confirmation dialogs** | Confirm destructive actions | Safety |

### 13.9 Accessibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **WCAG 2.1 AA** | Meet WCAG 2.1 Level AA | Compliance |
| **Color contrast** | 4.5:1 minimum contrast ratio | Visibility |
| **Keyboard accessible** | All functionality available via keyboard | Accessibility |
| **Screen reader compatible** | All content readable by screen readers | Inclusivity |
| **Mobile accessible** | All settings editable on mobile | Anywhere admin |

**Best practices:**
- Test settings UI with keyboard-only navigation
- Test with screen readers (VoiceOver, NVDA)
- Ensure all color combinations meet contrast requirements
- Provide clear focus indicators
- Announce status changes to screen readers

**Common implementation mistakes:**
- Not testing keyboard navigation
- Missing ARIA labels
- Low color contrast
- Not announcing status changes
- Not testing with screen readers

---

## 14. Future Readiness

### 14.1 What

Architecture readiness for future configuration needs — multi-brand, multi-region, plugin settings, dynamic modules, AI configuration assistant, environment promotion, and configuration APIs.

### 14.2 Why

- **Scalability:** Configuration system must support growth
- **Extensibility:** New configuration domains added without redesign
- **Innovation:** AI-assisted configuration management
- **Efficiency:** Automated configuration promotion across environments

### 14.3 Where

Architecture decisions made now, implemented when needed.

### 14.4 Multi-brand Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Brand-scoped settings** | Settings scoped to brand ID | Multi-brand support |
| **Brand inheritance** | Brand inherits platform defaults | Configuration reuse |
| **Brand override** | Brand-specific settings override platform | Customization |
| **Brand isolation** | Brand settings isolated from other brands | Security |

**Multi-brand Schema Extension:**
```typescript
interface BrandScopedConfig {
  brandId: string;
  settings: Record<string, unknown>;
  inheritedFrom: 'platform' | 'parent_brand';
  overriddenKeys: string[];
}
```

### 14.5 Multi-region Architecture

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Region-scoped settings** | Settings scoped to region ID | Multi-region support |
| **Region defaults** | Region inherits platform defaults | Configuration reuse |
| **Region override** | Region-specific settings override platform | Localization |
| **Region isolation** | Region settings isolated | Compliance |

### 14.6 Plugin Settings

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Plugin namespace** | Plugin settings namespaced to plugin ID | Isolation |
| **Plugin schema** | Plugins define own settings schema | Extensibility |
| **Plugin validation** | Plugin settings validated by plugin schema | Safety |
| **Plugin lifecycle** | Plugin settings created/deleted with plugin | Cleanup |
| **Plugin permissions** | Plugin settings access controlled by plugin | Security |

**Plugin Settings Schema:**
```typescript
interface PluginConfig {
  pluginId: string;
  pluginVersion: string;
  settings: Record<string, unknown>;
  schema: z.ZodSchema;
  enabled: boolean;
}
```

### 14.7 Dynamic Modules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Module registration** | Modules register own settings | Extensibility |
| **Module schema** | Modules define own settings schema | Type safety |
| **Module lifecycle** | Module settings created/destroyed with module | Cleanup |
| **Module permissions** | Module settings access controlled | Security |

### 14.8 AI Configuration Assistant

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Natural language** | Admin describes desired config in natural language | Ease of use |
| **AI interpretation** | AI translates description to config changes | Automation |
| **AI validation** | AI validates changes before applying | Safety |
| **AI explanation** | AI explains what changes do | Transparency |
| **AI rollback** | AI can revert changes if issues arise | Recovery |

**AI Assistant Flow:**
```
1. Admin describes desired change in natural language
2. AI interprets intent and generates config changes
3. AI shows proposed changes with explanation
4. Admin reviews and approves changes
5. AI applies changes with validation
6. AI monitors for issues and offers rollback
```

### 14.9 Environment Promotion

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Promotion pipeline** | Config promoted: dev → staging → production | Safe testing |
| **Diff view** | Show diff between environments | Clarity |
| **Selective promotion** | Promote specific settings, not all | Flexibility |
| **Conflict resolution** | Handle conflicts during promotion | Safety |
| **Audit trail** | Log all promotions | Accountability |

**Environment Promotion Flow:**
```
1. Admin selects settings to promote
2. System shows diff between source and target environment
3. Admin reviews and resolves conflicts
4. System applies changes to target environment
5. System creates audit log entry
6. System invalidates target environment cache
```

### 14.10 Configuration APIs

| Rule | Standard | Rationale |
|------|----------|-----------|
| **REST API** | Configuration accessible via REST API | Integration |
| **Webhook support** | Configuration changes trigger webhooks | Automation |
| **Bulk operations** | Support bulk config read/write | Efficiency |
| **Filtering** | Support filtering by category, group, key | Discoverability |
| **Pagination** | Support pagination for large config sets | Performance |

**Configuration API Endpoints:**
```
GET    /api/admin/settings                    # List all settings
GET    /api/admin/settings/:key               # Get specific setting
PATCH  /api/admin/settings/:key               # Update setting
POST   /api/admin/settings/publish            # Publish draft changes
POST   /api/admin/settings/rollback           # Rollback to previous version
GET    /api/admin/settings/history            # Get configuration history
GET    /api/admin/settings/history/:key       # Get history for specific setting
POST   /api/admin/settings/export             # Export configuration
POST   /api/admin/settings/import             # Import configuration
GET    /api/admin/settings/search             # Search settings
POST   /api/admin/settings/favorites          # Manage favorites
GET    /api/admin/settings/categories         # List setting categories
GET    /api/admin/settings/health             # Configuration health check
```

**Best practices:**
- Design configuration APIs for future plugin and module integration
- Support multi-brand and multi-region configuration from day one
- Plan for AI-assisted configuration management
- Design environment promotion workflows for safe testing
- Provide comprehensive configuration API documentation

**Common implementation mistakes:**
- Not designing for multi-brand from the start
- Not providing configuration APIs for integration
- Not planning for environment promotion
- Not designing for plugin settings
- Not considering AI-assisted configuration

---

## 15. Mandatory Rules for AI Agents

### 15.1 What

Every AI agent working on the Nabome codebase must follow these rules when working with configuration, feature flags, and platform settings.

### 15.2 Why

- **Consistency:** All agents follow the same configuration standards
- **Security:** Configuration security cannot be compromised
- **Reliability:** Configuration changes must be safe and auditable
- **Scalability:** Configuration decisions must support future growth

### 15.3 Configuration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Centralize everything** | All configurable behavior managed from one system | Single source of truth |
| **No code changes for business rules** | Business rules configurable via admin UI | Operational agility |
| **Validate before apply** | All configuration validated against Zod schema | Prevent misconfiguration |
| **Audit every change** | Every configuration change logged with actor | Accountability |
| **Protect secrets** | Secrets in environment variables, never in code or database | Security |
| **Cache with invalidation** | Configuration cached in KV with proper invalidation | Performance |
| **Rollback ready** | Every configuration change reversible | Recovery |
| **Feature flags independent** | Feature flags separate from business configuration | Clean separation |
| **Mobile-accessible** | All configuration editable from mobile admin | Anywhere admin |
| **Document every setting** | Every setting has description, type, and default | Maintainability |

### 15.4 Feature Flag Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default disabled** | New feature flags default to `false` | Safe by default |
| **Kill switch always** | Every feature has emergency disable capability | Emergency response |
| **Naming convention** | `{domain}.{feature}.{variant}` format | Discoverability |
| **Sunset date** | Every temporary flag has a sunset date | Prevent flag sprawl |
| **Independent** | Feature flags don't control business logic | Clean separation |
| **Tracked** | Flag evaluations logged for analytics | Experimentation |

### 15.5 Security Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Permissions enforced at API** | Configuration permissions checked at API level | Security |
| **Secrets never in database** | All secrets in Cloudflare Pages Secrets | Security |
| **Encryption at rest** | Sensitive configuration encrypted | Data protection |
| **Audit logging** | All configuration access and changes logged | Accountability |
| **Rate limiting** | Configuration modification endpoints rate limited | Abuse prevention |
| **Validation** | All configuration validated before apply | Integrity |

### 15.6 Performance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Edge caching** | Configuration cached at Cloudflare edge | Low latency |
| **< 50ms reads** | Configuration reads complete in < 50ms | Performance |
| **Cache invalidation** | KV cache invalidated on configuration update | Fresh data |
| **Fallback values** | Default values available when config unavailable | Reliability |
| **No N+1** | Batch configuration reads | Performance |

### 15.7 Documentation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Schema documented** | Every setting has Zod schema with description | Maintainability |
| **Default values** | Every setting has documented default value | Out-of-box experience |
| **Access control** | Every setting has documented access requirements | Security |
| **Business impact** | Every setting has documented business impact | Transparency |
| **Dependencies** | Setting dependencies documented | Cross-setting validation |

---

*Last updated: August 03, 2026*
