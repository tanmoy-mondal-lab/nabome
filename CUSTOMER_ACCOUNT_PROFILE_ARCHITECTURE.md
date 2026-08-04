# নবME (Nabome) — Customer Account & Profile Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for customer account management, profile, address book, settings, preferences, privacy, and identity  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), IDENTITY_ACCESS_MANAGEMENT_ARCHITECTURE.md (v1.0), CUSTOMER_EXPERIENCE_ARCHITECTURE.md (v1.0), DATABASE_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Account Foundation](#1-account-foundation)
2. [Profile Management](#2-profile-management)
3. [Address Book](#3-address-book)
4. [Account Settings](#4-account-settings)
5. [Account Lifecycle](#5-account-lifecycle)
6. [Customer Features](#6-customer-features)
7. [Privacy Architecture](#7-privacy-architecture)
8. [Security Architecture](#8-security-architecture)
9. [Notifications Architecture](#9-notifications-architecture)
10. [Permissions Architecture](#10-permissions-architecture)
11. [Performance Architecture](#11-performance-architecture)
12. [Accessibility Architecture](#12-accessibility-architecture)
13. [Future Readiness Architecture](#13-future-readiness-architecture)
14. [Mandatory Rules for AI Agents](#14-mandatory-rules-for-ai-agents)

---

## 1. Account Foundation

### 1.1 What

The foundational philosophy, ownership model, identity standards, data consistency rules, and integrity guarantees that govern every customer account on the Nabome platform.

### 1.2 Why

- **Trust:** Customers must feel their data is safe, private, and under their control.
- **Consistency:** Every account interaction follows predictable patterns.
- **Integrity:** Account data must never be corrupted, lost, or exposed.
- **Scalability:** Account system must support 0 to 10M+ customers without redesign.
- **Compliance:** Meets GDPR, DPDP Act, and enterprise data protection requirements.

### 1.3 Where

Every customer-facing and backend interaction involving customer identity, profile data, addresses, preferences, and account settings.

### 1.4 Account Philosophy

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Customer owns their data** | Every piece of customer data belongs to the customer | Legal compliance, trust |
| **Minimal collection** | Collect only what's necessary for commerce | Privacy by design |
| **Transparent usage** | Customer knows exactly how data is used | Trust |
| **Easy deletion** | Customer can delete their account and data | Right to deletion |
| **Secure by default** | All data encrypted, access controlled | Security |
| **Personal, not invasive** | Personalization that feels helpful, not creepy | Privacy |
| **Mobile-first** | Account management optimized for mobile | 70%+ mobile traffic |
| **Beginner-friendly** | Every feature immediately understandable | Accessibility |

### 1.5 Account Lifecycle States

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCOUNT LIFECYCLE STATES                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    GUEST                                  │   │
│  │  • No account, browsing only                              │   │
│  │  • Cart saved locally                                     │   │
│  │  • Can checkout as guest                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                    Registration                                  │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  UNVERIFIED                               │   │
│  │  • Account created                                        │   │
│  │  • Email not verified                                     │   │
│  │  • Limited functionality                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                   Email Verified                                 │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ACTIVE                                 │   │
│  │  • Full functionality                                     │   │
│  │  • Can place orders                                       │   │
│  │  • Can manage profile                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│              ┌───────────┼───────────┐                          │
│              ▼           ▼           ▼                          │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐      │
│  │   INACTIVE     │ │  SUSPENDED     │ │  DEACTIVATED   │      │
│  │ No activity    │ │ Violation      │ │ Self-initiated │      │
│  │ 90+ days       │ │ Temporary      │ │ Temporary      │      │
│  └────────────────┘ └────────────────┘ └────────────────┘      │
│              │           │           │                          │
│              └───────────┼───────────┘                          │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   ARCHIVED                                │   │
│  │  • Account soft-deleted                                   │   │
│  │  • Data retained for legal compliance                     │   │
│  │  • Recoverable within 30 days                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                   30 days elapsed                                │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  PERMANENTLY DELETED                      │   │
│  │  • All personal data removed                              │   │
│  │  • Anonymized order history retained                      │   │
│  │  • Irrecoverable                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.6 Account Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Guest is default** | All visitors start as guests | Zero friction entry |
| **Registration minimal** | Only email + password + name required | Low barrier |
| **Email verification required** | Must verify before full access | Security, valid communication |
| **Active is normal state** | Account stays active unless action taken | UX |
| **Inactive after 90 days** | No activity triggers inactive status | Cleanup |
| **Suspend for violations** | Admin can suspend for policy violations | Enforcement |
| **Self-deactivation** | Customer can deactivate temporarily | Control |
| **Archive on deletion request** | Soft-delete with 30-day grace period | Recovery |
| **Permanent delete after 30 days** | Irrecoverable after grace period | GDPR compliance |
| **Anonymize order history** | Personal data removed, order data anonymized | Legal compliance |

### 1.7 Identity Ownership

| Entity | Owner | Location | Access |
|--------|-------|----------|--------|
| **User identity** | Auth domain | `api/_handlers/auth/` | System only |
| **Profile data** | Customer | `api/_handlers/profile/` | Customer + Admin (read) |
| **Address data** | Customer | `api/_handlers/address/` | Customer only |
| **Preferences** | Customer | `api/_handlers/preferences/` | Customer only |
| **Session data** | Auth domain | `api/_lib/auth/` | System only |
| **Order history** | Shared | `api/_handlers/orders/` | Customer + Shop Owner (product only) |
| **Wishlist** | Customer | `api/_handlers/wishlist/` | Customer only |
| **Reviews** | Customer | `api/_handlers/reviews/` | Customer (own) + Public (read) |

### 1.8 Account Data Consistency

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Single source of truth** | Profile table is authoritative for profile data | Prevents drift |
| **Optimistic updates** | UI updates immediately, syncs with server | Perceived speed |
| **Conflict resolution** | Last-write-wins for non-critical fields | Simplicity |
| **Version control** | Profile version field prevents stale writes | Integrity |
| **Real-time sync** | Profile changes reflected across sessions | Continuity |
| **Offline resilience** | Cache profile locally, sync when online | Mobile experience |

### 1.9 Account Integrity Guarantees

| Guarantee | Implementation | Rationale |
|-----------|----------------|-----------|
| **No orphaned data** | FK constraints with appropriate cascade | Data integrity |
| **No duplicate accounts** | Unique email constraint | One account per email |
| **No data leakage** | RLS policies on all tables | Privacy |
| **No unauthorized access** | Middleware authentication + authorization | Security |
| **Audit trail** | All sensitive operations logged | Compliance |
| **Immutable history** | Account history records are append-only | Audit integrity |

---

## 2. Profile Management

### 2.1 What

The complete architecture for customer profile data — personal information, profile photo, name, phone, email, birthday, gender, preferences, verification status, and profile lifecycle.

### 2.2 Why

- **Personalization:** Profile enables personalized shopping experience.
- **Communication:** Contact information for order updates.
- **Trust:** Verified profiles build platform trust.
- **Efficiency:** Saved data speeds up future purchases.
- **Compliance:** Meets data protection requirements.

### 2.3 Where

Account pages, checkout pre-fill, order history, customer support, admin dashboard (read-only).

### 2.4 Profile Data Model

```typescript
// Profile data structure
interface Profile {
  // Identity
  id: string;                          // UUID, primary key
  userId: string;                      // FK to User table
  
  // Personal Information
  firstName: string;                   // Required, min 1 char
  lastName: string;                    // Required, min 1 char
  displayName?: string;                // Optional, auto-generated if not set
  
  // Contact Information
  email: string;                       // Required, unique, verified
  phone?: string;                      // Optional, E.164 format
  
  // Profile Photo
  avatarUrl?: string;                  // Optional, Cloudinary URL
  avatarPublicId?: string;             // Optional, Cloudinary public ID
  
  // Demographics (optional, for future personalization)
  dateOfBirth?: Date;                  // Optional, birthday readiness
  gender?: Gender;                     // Optional, enum: men, women, other, prefer_not_to_say
  
  // Verification Status
  emailVerified: boolean;              // Default: false
  phoneVerified: boolean;              // Default: false
  identityVerified: boolean;           // Default: false (future)
  
  // Preferences
  preferences: ProfilePreferences;     // JSONB column
  
  // Metadata
  lastLoginAt?: Date;                  // Last login timestamp
  loginCount: number;                  // Total logins
  createdAt: Date;                     // Account creation
  updatedAt: Date;                     // Last profile update
  version: number;                     // Optimistic locking version
}

interface ProfilePreferences {
  language: 'en' | 'hi';              // Default: 'en'
  currency: 'INR';                     // Default: 'INR'
  theme: 'light' | 'dark' | 'system'; // Default: 'system'
  emailNotifications: boolean;         // Default: true
  smsNotifications: boolean;           // Default: false
  marketingEmails: boolean;            // Default: false
  orderUpdates: boolean;               // Default: true
  priceAlerts: boolean;                // Default: false
  backInStockAlerts: boolean;          // Default: false
}
```

### 2.5 Personal Information Standards

| Field | Required | Validation | Editable | Rationale |
|-------|----------|------------|----------|-----------|
| **First name** | Yes | Min 1 char, max 100 chars | Yes | Identification |
| **Last name** | Yes | Min 1 char, max 100 chars | Yes | Identification |
| **Display name** | No | Auto-generated from first + last name | Yes | Personalization |
| **Email** | Yes | Valid email format, unique | Yes (with verification) | Communication, login |
| **Phone** | No | E.164 format (+91XXXXXXXXXX) | Yes (with OTP) | Delivery contact |
| **Date of birth** | No | Valid date, must be 13+ years old | Yes | Birthday offers |
| **Gender** | No | Enum value | Yes | Personalization |

### 2.6 Profile Photo Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Upload** | Drag-and-drop or tap to upload | Intuitive |
| **Format** | JPG, PNG, WebP only | Security |
| **Max size** | 5MB | Performance |
| **Crop tool** | Square crop with zoom | Quality |
| **Storage** | Cloudinary with transformations | Optimization |
| **Default** | Initials-based avatar if no photo | Clean |
| **Deletion** | Option to remove photo | Control |
| **CDN** | Served via Cloudflare CDN | Performance |

### 2.7 Name Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Display** | "First Last" format | Readability |
| **Order display** | Full name on orders | Professional |
| **Email greeting** | First name only | Personal |
| **Admin display** | Full name + email | Identification |
| **Character support** | Unicode (Devanagari, etc.) | Inclusivity |
| **Trim whitespace** | Auto-trim on save | Clean data |

### 2.8 Phone Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Format** | E.164 (+91XXXXXXXXXX) | International support |
| **Verification** | OTP required before saving | Security |
| **Primary use** | Delivery contact | Logistics |
| **Display** | Masked in UI (+91 XXXXX67890) | Privacy |
| **Multiple phones** | Single phone per profile (v1) | Simplicity |
| **WhatsApp readiness** | Future WhatsApp notifications | Future-proof |

### 2.9 Email Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Uniqueness** | One account per email | Identity integrity |
| **Verification** | Required before full access | Security |
| **Change process** | Verify new email before switching | Security |
| **Display** | Masked in admin (j***@email.com) | Privacy |
| **Login identifier** | Email is the login username | Simplicity |
| **Case insensitive** | Stored lowercase | Consistency |

### 2.10 Birthday Readiness Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Collection** | Optional during registration, ask later | Progressive |
| **Age verification** | Must be 13+ years old | Legal compliance |
| **Storage** | Date only, no year display in UI | Privacy |
| **Usage** | Birthday offers, personalized greetings | Personalization |
| **Display** | "Happy Birthday, [Name]!" on birthday | Delight |
| **Privacy** | Never shared with Shop Owners | Privacy |

### 2.11 Gender Readiness Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Options** | Men, Women, Other, Prefer not to say | Inclusivity |
| **Collection** | Optional, ask during profile completion | Progressive |
| **Usage** | Product recommendations, sizing | Personalization |
| **Privacy** | Never shared publicly | Privacy |
| **Future** | Ready for additional options | Scalability |

### 2.12 Verification Status Standards

| Status | Indicator | Meaning |
|--------|-----------|---------|
| **Email verified** | Green checkmark | Email confirmed |
| **Phone verified** | Green checkmark | Phone confirmed via OTP |
| **Identity verified** | Gold badge | Government ID verified (future) |
| **Unverified** | Gray indicator | Verification pending |

### 2.13 Profile Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROFILE LIFECYCLE                              │
│                                                                  │
│  1. REGISTRATION                                                 │
│     → Create profile with: firstName, lastName, email            │
│     → Set emailVerified = false                                  │
│     → Set loginCount = 0                                         │
│     → Set version = 1                                            │
│                                                                  │
│  2. EMAIL VERIFICATION                                           │
│     → Customer verifies email                                    │
│     → Set emailVerified = true                                   │
│     → Send welcome email                                         │
│                                                                  │
│  3. PROFILE COMPLETION                                           │
│     → Customer adds: phone, avatar, birthday, gender             │
│     → Customer sets preferences                                  │
│     → Profile completion percentage tracked                      │
│                                                                  │
│  4. ACTIVE USAGE                                                 │
│     → Customer edits profile as needed                           │
│     → Preferences updated                                        │
│     → Login count incremented                                    │
│                                                                  │
│  5. ACCOUNT DELETION                                             │
│     → Profile archived (soft delete)                             │
│     → Personal data anonymized                                   │
│     → Order history retained (anonymized)                        │
└─────────────────────────────────────────────────────────────────┘
```

### 2.14 Profile Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-save** | Save on field blur | Don't lose work |
| **Optimistic update** | Show changes immediately | Perceived speed |
| **Version check** | Prevent stale writes | Integrity |
| **Email change** | Verify new email before switching | Security |
| **Phone change** | Verify via OTP before switching | Security |
| **Avatar upload** | Crop tool included | Quality |
| **Delete account** | Requires password confirmation | Safety |
| **Data export** | GDPR-ready data export | Compliance |
| **Profile completion** | Track and encourage completion | Engagement |
| **Privacy first** | Only share what customer allows | Trust |

---

## 3. Address Book

### 3.1 What

The complete architecture for customer address management — multiple addresses, default addresses, billing/shipping distinction, address validation, labels, history, and lifecycle.

### 3.2 Why

- **Convenience:** Saved addresses speed up checkout.
- **Accuracy:** Validated addresses reduce delivery failures.
- **Flexibility:** Multiple addresses for different use cases.
- **Trust:** Transparent address management builds confidence.

### 3.3 Where

Checkout, account address book, order history, customer support.

### 3.4 Address Data Model

```typescript
// Address data structure
interface Address {
  // Identity
  id: string;                          // UUID, primary key
  profileId: string;                   // FK to Profile
  
  // Address Type
  type: AddressType;                   // enum: home, work, other
  label?: string;                      // Custom label (e.g., "Mom's house")
  
  // Recipient Information
  recipientName: string;               // Full name of recipient
  recipientPhone: string;              // Delivery contact phone
  
  // Address Lines
  line1: string;                       // Street address (required)
  line2?: string;                      // Apartment, suite, floor (optional)
  
  // Location
  city: string;                        // City/Town
  state: string;                       // State/Province
  pincode: string;                     // PIN code (6 digits for India)
  country: string;                     // Country code (default: IN)
  
  // Metadata
  isDefaultShipping: boolean;          // Default for shipping
  isDefaultBilling: boolean;           // Default for billing
  isVerified: boolean;                 // Address verified via API
  verificationSource?: string;         // Google Places, manual, etc.
  
  // Delivery Intelligence
  deliveryAvailable?: boolean;         // Whether delivery is available
  estimatedDeliveryDays?: number;      // Estimated delivery time
  
  // Usage Tracking
  lastUsedAt?: Date;                   // Last time used in order
  usageCount: number;                  // Times used in orders
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

type AddressType = 'home' | 'work' | 'other';
```

### 3.5 Multiple Addresses Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Maximum addresses** | 10 per customer | Prevent abuse |
| **Minimum addresses** | 0 (can delete all) | Freedom |
| **Address types** | Home, Work, Other | Common use cases |
| **Custom labels** | User-defined labels | Flexibility |
| **Display** | Card layout with full address | Visual |
| **Sort** | Most recently used first | Relevance |
| **Search** | Search by label or city | Discovery |

### 3.6 Default Address Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **One default shipping** | Exactly one default for shipping | Predictability |
| **One default billing** | Exactly one default for billing | Predictability |
| **Auto-select** | Pre-select default in checkout | Speed |
| **Change default** | Easy toggle to set new default | Control |
| **First address** | Auto-set as default if first | UX |
| **Delete default** | Prompt to set new default | Continuity |

### 3.7 Billing Address Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Payment verification, invoicing | Financial |
| **Required** | Yes, for all orders | Business rule |
| **Pre-fill** | Use default billing address | Speed |
| **Edit** | Can edit during checkout | Flexibility |
| **Same as shipping** | "Same as shipping" option | Convenience |
| **GST details** | Ready for GST invoice fields | Future-proof |

### 3.8 Shipping Address Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Purpose** | Order delivery | Logistics |
| **Required** | Yes, for all physical orders | Business rule |
| **Pre-fill** | Use default shipping address | Speed |
| **Edit** | Can edit during checkout | Flexibility |
| **Validation** | PIN code validation for delivery | Accuracy |
| **Delivery check** | Real-time delivery availability | Transparency |
| **Instructions** | Optional delivery instructions | Communication |

### 3.9 Address Validation Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **PIN code validation** | Validate against India Post database | Accuracy |
| **Google Places API** | Autocomplete for address entry | Speed |
| **Delivery availability** | Check if delivery is available to PIN | Transparency |
| **Real-time feedback** | Show validation results immediately | UX |
| **Fallback** | Manual entry if API unavailable | Resilience |
| **Cache results** | Cache validation for repeat use | Performance |

### 3.10 Address Labels Standards

| Label | Description | Use Case |
|-------|-------------|----------|
| **Home** | Primary residence | Default |
| **Work** | Office/workplace | Business hours delivery |
| **Other** | Any other location | Flexible |
| **Custom** | User-defined label | Personal |

### 3.11 Address History Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Track usage** | Record when address is used | Intelligence |
| **Usage count** | Count orders per address | Insights |
| **Last used** | Track last usage date | Relevance |
| **Sort by usage** | Most used addresses first | Convenience |
| **Never delete history** | Keep address history even if deleted | Audit |

### 3.12 Address Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADDRESS LIFECYCLE                              │
│                                                                  │
│  1. CREATION                                                     │
│     → Customer adds new address                                  │
│     → Validate PIN code                                          │
│     → Check delivery availability                                │
│     → If first address, set as default                           │
│                                                                  │
│  2. VERIFICATION                                                 │
│     → Google Places API validation                               │
│     → Mark as verified                                           │
│     → Store delivery estimate                                    │
│                                                                  │
│  3. USAGE                                                        │
│     → Used in checkout                                           │
│     → Usage count incremented                                    │
│     → Last used timestamp updated                                │
│                                                                  │
│  4. MODIFICATION                                                 │
│     → Customer edits address                                     │
│     → Re-validate if PIN code changed                            │
│     → Update delivery availability                               │
│                                                                  │
│  5. DELETION                                                     │
│     → Customer deletes address                                   │
│     → Soft delete (preserve history)                             │
│     → If default, prompt to set new default                      │
│                                                                  │
│  6. ARCHIVAL                                                     │
│     → Address archived but not hard deleted                      │
│     → Historical orders retain address reference                 │
│     → Available for customer support                             │
└─────────────────────────────────────────────────────────────────┘
```

### 3.13 Address Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Phone required** | For delivery contact | Logistics |
| **PIN code required** | 6-digit Indian PIN code | Validation |
| **City/state auto-fill** | Auto-fill from PIN code | Speed |
| **One default shipping** | Exactly one default | Predictability |
| **One default billing** | Exactly one default | Predictability |
| **Pre-fill checkout** | Use saved addresses | Speed |
| **Edit from checkout** | Allow address edit during checkout | Flexibility |
| **Delivery check** | Validate delivery before order | Accuracy |
| **Address instructions** | Optional delivery notes | Communication |
| **No hard delete** | Soft delete only | Data integrity |

---

## 4. Account Settings

### 4.1 What

The complete architecture for customer account settings — personal settings, account settings, privacy settings, security settings, notification settings, language readiness, and currency readiness.

### 4.2 Why

- **Control:** Customers manage their own experience.
- **Security:** Settings protect customer data.
- **Personalization:** Preferences tailor the experience.
- **Compliance:** Meets data protection requirements.

### 4.3 Where

Account settings page, header dropdown, mobile bottom navigation.

### 4.4 Settings Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCOUNT SETTINGS ARCHITECTURE                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PERSONAL SETTINGS                                        │   │
│  │  • Profile information                                    │   │
│  │  • Profile photo                                          │   │
│  │  • Name                                                   │   │
│  │  • Phone                                                  │   │
│  │  • Email                                                  │   │
│  │  • Birthday                                               │   │
│  │  • Gender                                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ACCOUNT SETTINGS                                         │   │
│  │  • Change password                                        │   │
│  │  • Linked accounts (future)                               │   │
│  │  • Account status                                         │   │
│  │  • Login history                                          │   │
│  │  • Active sessions                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PRIVACY SETTINGS                                         │   │
│  │  • Data visibility                                        │   │
│  │  • Profile visibility                                     │   │
│  │  • Data export                                            │   │
│  │  • Account deletion                                       │   │
│  │  • Consent management                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SECURITY SETTINGS                                        │   │
│  │  • Change password                                        │   │
│  │  • Two-factor authentication (future)                     │   │
│  │  • Active sessions                                        │   │
│  │  • Trusted devices                                        │   │
│  │  • Login alerts                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  NOTIFICATION SETTINGS                                    │   │
│  │  • Email notifications                                    │   │
│  │  • SMS notifications                                      │   │
│  │  • Push notifications (future)                            │   │
│  │  • Marketing preferences                                  │   │
│  │  • Order updates                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PREFERENCE SETTINGS                                      │   │
│  │  • Language                                               │   │
│  │  • Currency                                               │   │
│  │  • Theme                                                  │   │
│  │  • Display preferences                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Personal Settings Standards

| Setting | Standard | Rationale |
|---------|----------|-----------|
| **Profile editing** | Inline editing with save button | Control |
| **Photo upload** | Crop tool, preview before save | Quality |
| **Name editing** | Real-time validation | Feedback |
| **Phone editing** | OTP verification required | Security |
| **Email editing** | Verify new email before switching | Security |
| **Birthday editing** | Date picker with age validation | UX |
| **Gender editing** | Dropdown selection | Simplicity |

### 4.6 Account Settings Standards

| Setting | Standard | Rationale |
|---------|----------|-----------|
| **Change password** | Current + new password form | Security |
| **Password strength** | Visual strength indicator | Guidance |
| **Login history** | Show last 10 logins with IP, device, time | Transparency |
| **Active sessions** | Show all active sessions | Control |
| **Revoke sessions** | User can revoke any session | Security |
| **Account status** | Show current status (active, inactive, etc.) | Transparency |

### 4.7 Privacy Settings Standards

| Setting | Standard | Rationale |
|---------|----------|-----------|
| **Profile visibility** | Public/Private toggle | Control |
| **Review display** | Show name or anonymous | Privacy |
| **Data export** | Download personal data (GDPR) | Compliance |
| **Account deletion** | Multi-step deletion process | Safety |
| **Consent management** | View and manage consents | Transparency |
| **Cookie preferences** | Manage cookie settings | Compliance |

### 4.8 Security Settings Standards

| Setting | Standard | Rationale |
|---------|----------|-----------|
| **Change password** | Requires current password | Security |
| **Two-factor auth** | TOTP-based (future readiness) | Security |
| **Active sessions** | List with revoke option | Control |
| **Trusted devices** | Remember device for 30 days | UX |
| **Login alerts** | Email on new device login | Security |
| **Password strength** | Require strong password | Security |

### 4.9 Notification Settings Standards

| Setting | Standard | Rationale |
|---------|----------|-----------|
| **Order updates** | Email + in-app, always on | Required |
| **Shipping updates** | Email + in-app, always on | Required |
| **Refund updates** | Email + in-app, always on | Required |
| **Security alerts** | Email + in-app, always on | Required |
| **Marketing emails** | Opt-in, toggleable | Compliance |
| **SMS notifications** | Opt-in, toggleable | Compliance |
| **Push notifications** | Opt-in, toggleable (future) | Compliance |
| **Price alerts** | Opt-in, toggleable | Personalization |
| **Back in stock** | Opt-in, toggleable | Personalization |

### 4.10 Language Readiness Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Default** | English (en) | Market default |
| **Supported** | English, Hindi (hi) | India market |
| **Selection** | In settings page | User control |
| **Persistence** | Saved to profile | Continuity |
| **Fallback** | English if translation missing | Graceful |
| **URL** | Query parameter or cookie | SEO-ready |
| **Content** | Admin-translated via CMS | Scalability |

### 4.11 Currency Readiness Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Default** | INR (₹) | India market |
| **Format** | ₹1,999 (Indian comma format) | Local |
| **Selection** | In settings page | User control |
| **Persistence** | Saved to profile | Continuity |
| **Conversion** | Real-time exchange rates (future) | Future-proof |
| **Display** | Symbol + formatted amount | Readable |

---

## 5. Account Lifecycle

### 5.1 What

The complete workflow for customer account states — registration, verification, active, inactive, temporary removal, permanent deletion, archive, and restoration readiness.

### 5.2 Why

- **Security:** Controlled account states prevent abuse.
- **Compliance:** Meets data protection requirements.
- **UX:** Clear account status for customers.
- **Operations:** Admin can manage accounts effectively.

### 5.3 Where

Auth flows, account pages, admin dashboard, customer support.

### 5.4 Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                              │
│                                                                  │
│  1. CUSTOMER INITIATES                                           │
│     → Clicks "Create Account"                                    │
│     → Fills minimal form: name, email, password                  │
│                                                                  │
│  2. VALIDATION                                                   │
│     → Client-side validation (Zod)                               │
│     → Server-side validation                                     │
│     → Email uniqueness check                                     │
│     → Turnstile CAPTCHA verification                             │
│                                                                  │
│  3. ACCOUNT CREATION                                             │
│     → Create User record                                         │
│     → Create Profile record                                      │
│     → Set role = 'customer'                                      │
│     → Set emailVerified = false                                  │
│                                                                  │
│  4. VERIFICATION EMAIL                                           │
│     → Send verification email                                    │
│     → Link expires in 24 hours                                   │
│     → Rate limit: 3 emails per hour                              │
│                                                                  │
│  5. CUSTOMER VERIFIES                                            │
│     → Clicks verification link                                   │
│     → Set emailVerified = true                                   │
│     → Send welcome email                                         │
│     → Redirect to login                                          │
│                                                                  │
│  6. FIRST LOGIN                                                  │
│     → Create session                                             │
│     → Redirect to account setup                                  │
│     → Encourage profile completion                               │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Verification Flow

| Step | Action | Result |
|------|--------|--------|
| 1 | Customer registers | Unverified account created |
| 2 | Verification email sent | Token generated, email sent |
| 3 | Customer clicks link | Token validated |
| 4 | Email verified | Full access granted |
| 5 | Welcome email sent | Engagement initiated |

### 5.6 Active State Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Full access** | All features available | Normal state |
| **Profile editing** | Can edit all profile fields | Self-service |
| **Order placement** | Can place orders | Commerce |
| **Address management** | Can manage addresses | Self-service |
| **Wishlist** | Can manage wishlist | Engagement |
| **Reviews** | Can write reviews | Engagement |
| **Notifications** | Receives all notifications | Communication |

### 5.7 Inactive State Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | No activity for 90 days | Cleanup |
| **Notification** | Email warning before inactive | Communication |
| **Data preserved** | All data retained | Recovery |
| **Reactivation** | Login reactivates account | Simple |
| **Email frequency** | Reduced to essential only | Respect |

### 5.8 Temporary Removal (Deactivation) Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer requests deactivation | Control |
| **Effect** | Account hidden, not deleted | Recovery |
| **Duration** | Indefinite until reactivation | Flexibility |
| **Data preserved** | All data retained | Recovery |
| **Orders** | Existing orders continue processing | Business |
| **Reactivation** | Login with password reactivates | Simple |
| **Notification** | Confirmation email sent | Communication |

### 5.9 Permanent Deletion Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | Customer requests deletion | Control |
| **Confirmation** | Multi-step: reason → password → confirm | Safety |
| **Data export** | Offer data export before deletion | GDPR |
| **Grace period** | 30-day grace period | Recovery |
| **Processing** | Personal data anonymized | Compliance |
| **Order history** | Retained (anonymized) | Legal |
| **Wishlist** | Deleted | Cleanup |
| **Reviews** | Anonymized (kept for community) | Integrity |
| **Cannot undo** | After 30 days, permanent | Finality |

### 5.10 Archive Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Trigger** | After 30-day grace period | Policy |
| **Process** | Soft delete → Archive | Data integrity |
| **Personal data** | Removed or anonymized | GDPR |
| **Order data** | Retained (anonymized) | Legal |
| **Profile** | Marked as archived | Status |
| **Recovery** | Not recoverable after archive | Finality |

### 5.11 Restoration Readiness Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Within 30 days** | Can reactivate by logging in | Recovery |
| **After 30 days** | Not recoverable | Policy |
| **Reactivation** | Simple login reactivates | UX |
| **Data restored** | All data restored on reactivation | Continuity |
| **Notification** | Welcome back email | Engagement |

---

## 6. Customer Features

### 6.1 What

Standards for customer-facing features tied to the account — orders, wishlist, reviews, returns, refunds, complaints, notifications, and saved preferences.

### 6.2 Why

- **Self-service:** Customers manage their own experience.
- **Engagement:** Features bring customers back.
- **Trust:** Transparency in all customer interactions.
- **Efficiency:** Saved data speeds up future actions.

### 6.3 Where

Account pages, order history, product pages, checkout.

### 6.4 Orders Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Order list** | Chronological with status | Overview |
| **Order card** | Image + name + status + date + total | Quick scan |
| **Order detail** | Full breakdown + timeline | Complete info |
| **Status badges** | Color-coded statuses | Visual |
| **Track order** | Link to tracking page | Transparency |
| **Reorder** | "Buy again" button | Convenience |
| **Cancel** | Available before shipping | Control |
| **Return** | Available within return window | Recovery |
| **Invoice** | Download PDF invoice | Documentation |
| **Empty state** | "No orders yet" + CTA | Guidance |

### 6.5 Wishlist Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Add to wishlist** | Heart icon on product card and detail | Discoverable |
| **Icon state** | Outline (empty) / Filled (saved) | Visual state |
| **Feedback** | Toast "Added to wishlist" | Confirmation |
| **View wishlist** | `/account/wishlist` | Direct access |
| **Header badge** | Wishlist count on icon | Information |
| **Move to cart** | "Add to Cart" button on wishlist item | Conversion |
| **Remove** | Swipe on mobile, button on desktop | Easy removal |
| **Empty state** | "Your wishlist is empty" + CTA | Guidance |
| **Price tracking** | Show price changes on wishlisted items | Value |
| **Back in stock** | Notify when wishlisted item returns | Recovery |
| **Share** | Share wishlist link | Social |

### 6.6 Reviews Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Write review** | CTA for purchasers | Engagement |
| **Review content** | Star rating + title + body + date | Complete |
| **Edit review** | Can edit within 30 days | Flexibility |
| **Delete review** | Can delete own reviews | Control |
| **Helpful votes** | "Was this helpful?" + count | Quality signal |
| **Photos** | Customer-uploaded images | Social proof |
| **Empty state** | "You haven't reviewed yet" + CTA | Guidance |

### 6.7 Returns Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Return request** | Available in order detail | Self-service |
| **Return reasons** | Predefined list + other | Data collection |
| **Return window** | 7 days from delivery | Policy |
| **Photo upload** | Optional, for damage claims | Evidence |
| **Status tracking** | Return request → Approved → Received → Refunded | Visibility |
| **Email updates** | Status change notifications | Reassurance |

### 6.8 Refunds Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Refund method** | Original payment method | Fairness |
| **Refund timeline** | 5-7 business days | Transparency |
| **Refund tracking** | Visible in order detail | Transparency |
| **Partial refund** | Supported for partial returns | Flexibility |
| **Email notification** | Refund processed notification | Reassurance |

### 6.9 Complaints Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Submit complaint** | Via account or contact form | Accessibility |
| **Complaint categories** | Predefined list | Organization |
| **Track complaint** | Status updates visible | Transparency |
| **Response time** | 24-hour initial response | Service |
| **Resolution** | Clear resolution and feedback | Satisfaction |

### 6.10 Notifications Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Notification center** | In-app notification history | Access |
| **Unread count** | Badge in header | Information |
| **Read state** | Mark as read on view | Clean |
| **Notification types** | Order, shipping, refund, account, security | Organization |
| **Preferences** | Per-type toggleable | Control |
| **Email fallback** | In-app + email for critical | Reliability |

### 6.11 Saved Preferences Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Language** | Saved to profile | Continuity |
| **Currency** | Saved to profile | Continuity |
| **Theme** | Saved to profile | Personalization |
| **Notification prefs** | Saved to profile | Control |
| **Sort preferences** | Saved locally | Convenience |
| **Filter preferences** | Saved locally | Convenience |

---

## 7. Privacy Architecture

### 7.1 What

Standards for customer data privacy — personal data handling, data visibility, consent management, data export readiness, data deletion, and privacy controls.

### 7.2 Why

- **Compliance:** Meets GDPR, DPDP Act requirements.
- **Trust:** Customers control their data.
- **Transparency:** Clear data usage policies.
- **Security:** Protect customer information.

### 7.3 Where

Account settings, privacy page, data export, account deletion, cookie banner.

### 7.4 Personal Data Standards

| Data Type | Category | Retention | Access |
|-----------|----------|-----------|--------|
| **Name** | Identity | Account lifetime | Customer, Admin (read) |
| **Email** | Contact | Account lifetime | Customer, Admin (read) |
| **Phone** | Contact | Account lifetime | Customer, Admin (read) |
| **Address** | Location | Account lifetime | Customer only |
| **DOB** | Demographic | Account lifetime | Customer only |
| **Gender** | Demographic | Account lifetime | Customer only |
| **Orders** | Transaction | 7 years (legal) | Customer, Shop Owner (product only) |
| **Wishlist** | Preference | Account lifetime | Customer only |
| **Reviews** | Content | Indefinite (anonymized) | Public (read) |
| **Browsing history** | Behavioral | 90 days | Customer only |
| **Search history** | Behavioral | 30 days | Customer only |
| **Device info** | Technical | Session lifetime | System only |

### 7.5 Data Visibility Standards

| Data | Customer | Shop Owner | Admin | Public |
|------|----------|------------|-------|--------|
| **Own profile** | Full | — | Read | — |
| **Own addresses** | Full | — | — | — |
| **Own orders** | Full | Product only | Full | — |
| **Own wishlist** | Full | — | — | — |
| **Own reviews** | Full | — | Read | Read |
| **Own preferences** | Full | — | — | — |
| **Other customer data** | — | — | Full | — |
| **Shop Owner data** | — | — | Full | — |

### 7.6 Consent Management Standards

| Consent Type | Required | Granularity | Withdrawal |
|--------------|----------|-------------|------------|
| **Terms of Service** | Yes | All or nothing | Account deletion |
| **Privacy Policy** | Yes | All or nothing | Account deletion |
| **Marketing emails** | No | Per-type | One-click unsubscribe |
| **SMS notifications** | No | Per-type | Toggle in settings |
| **Data sharing** | No | Per-partner | Toggle in settings |
| **Analytics** | No | All or nothing | Cookie settings |

### 7.7 Data Export Readiness Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Format** | JSON (primary), CSV (secondary) | Machine-readable |
| **Content** | All personal data | GDPR compliance |
| **Request** | Via account settings | Self-service |
| **Processing** | Within 48 hours | Timely |
| **Notification** | Email when ready | Communication |
| **Download** | Secure link, expires in 7 days | Security |
| **Scope** | Profile, orders, addresses, wishlist, reviews | Complete |

### 7.8 Data Deletion Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Request** | Via account settings | Self-service |
| **Confirmation** | Multi-step: reason → password → confirm | Safety |
| **Grace period** | 30 days | Recovery |
| **Processing** | Personal data anonymized | Compliance |
| **Order history** | Retained (anonymized) | Legal |
| **Reviews** | Anonymized (kept for community) | Integrity |
| **Wishlist** | Deleted | Cleanup |
| **Addresses** | Deleted | Cleanup |
| **Sessions** | All invalidated | Security |

### 7.9 Privacy Controls Standards

| Control | Location | Standard |
|---------|----------|----------|
| **Profile visibility** | Privacy settings | Public/Private toggle |
| **Review anonymity** | Privacy settings | Show name or anonymous |
| **Data sharing** | Privacy settings | Per-partner toggle |
| **Marketing consent** | Notification settings | Per-channel toggle |
| **Cookie preferences** | Footer link | Granular control |
| **Third-party data** | Privacy page | Opt-out available |

### 7.10 Privacy Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimal collection** | Collect only what's necessary | Privacy by design |
| **Purpose limitation** | Use data only for stated purposes | Trust |
| **No sale of data** | Never sell customer data | Trust |
| **No third-party sharing** | Without explicit consent | Privacy |
| **Encryption at rest** | All personal data encrypted | Security |
| **Encryption in transit** | HTTPS everywhere | Security |
| **Access logging** | Log all data access | Audit |
| **Retention limits** | Delete data when no longer needed | Compliance |
| **Anonymization** | Anonymize data for analytics | Privacy |

---

## 8. Security Architecture

### 8.1 What

Standards for customer account security — password management, email changes, phone changes, device management, login history, session management, verification, and account recovery.

### 8.2 Why

- **Protection:** Prevent unauthorized access.
- **Trust:** Customers feel their accounts are safe.
- **Compliance:** Meets security requirements.
- **Integrity:** Prevent data tampering.

### 8.3 Where

Auth flows, account settings, security settings, admin dashboard.

### 8.4 Password Management Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Minimum length** | 8 characters | Security |
| **Maximum length** | 128 characters | Prevent abuse |
| **Complexity** | Uppercase, lowercase, number, special char | Security |
| **No common passwords** | Check against breached passwords | Security |
| **No personal info** | Cannot contain email/name | Security |
| **Storage** | bcrypt with salt rounds of 12 | Security |
| **History** | Prevent reuse of last 5 passwords | Security |
| **Expiry** | No forced expiry (NIST recommendation) | UX |
| **Strength indicator** | Visual feedback on creation | Guidance |

### 8.5 Email Change Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Current email required** | Verify identity | Security |
| **New email required** | Must be different | Validation |
| **Verification** | Verify new email before switching | Security |
| **Notification** | Email to old and new address | Security |
| **Cooldown** | 24 hours between changes | Abuse prevention |
| **Audit log** | Log all email changes | Compliance |

### 8.6 Phone Change Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **OTP verification** | Verify new phone via OTP | Security |
| **Current phone** | Optional: verify current phone | Security |
| **Format** | E.164 format required | Validation |
| **Notification** | SMS to old and new phone | Security |
| **Cooldown** | 24 hours between changes | Abuse prevention |
| **Audit log** | Log all phone changes | Compliance |

### 8.7 Device Management Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Active sessions** | Show all active sessions | Transparency |
| **Device info** | IP, user agent, last active | Identification |
| **Revoke session** | User can revoke any session | Control |
| **Revoke all** | User can revoke all sessions | Security |
| **Current session** | Mark current session | UX |
| **Max sessions** | 5 per user | Prevent abuse |

### 8.8 Login History Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Last 10 logins** | Show recent login history | Transparency |
| **Info displayed** | IP, device, location, time | Identification |
| **Failed attempts** | Show failed login attempts | Security |
| **Suspicious activity** | Flag unusual login patterns | Security |
| **Export** | Export login history (future) | Compliance |

### 8.9 Session Management Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Access token** | 15 minutes TTL | Security |
| **Refresh token** | 7 days TTL | UX |
| **Remember me** | 30 days TTL | UX |
| **CSRF token** | 4 hours TTL | Security |
| **Idle timeout** | 30 minutes | Security |
| **Absolute timeout** | 24 hours | Security |
| **Token rotation** | On refresh | Security |
| **Secure cookies** | httpOnly, secure, SameSite | Security |

### 8.10 Verification Standards

| Type | Method | Purpose |
|------|--------|---------|
| **Email verification** | Link with token | Confirm email ownership |
| **Phone verification** | OTP via SMS | Confirm phone ownership |
| **Identity verification** | Government ID (future) | High-trust verification |
| **Password verification** | Current password | Confirm identity for changes |

### 8.11 Account Recovery Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Password reset** | Email with reset link | Recovery |
| **Reset token** | 1-hour expiry | Security |
| **Single use** | Token invalidated after use | Security |
| **No email disclosure** | Always return success message | Security |
| **Invalidate sessions** | All sessions revoked on reset | Security |
| **Support recovery** | Admin-assisted recovery | Fallback |

### 8.12 Security Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Encrypt at rest** | All sensitive data encrypted | Security |
| **Encrypt in transit** | HTTPS everywhere | Security |
| **No plain text passwords** | Never store or log passwords | Security |
| **Rate limiting** | All auth endpoints rate limited | Abuse prevention |
| **Account lockout** | 5 attempts, 15-minute lockout | Brute force protection |
| **Audit logging** | All security events logged | Compliance |
| **Session invalidation** | On password change/reset | Security |
| **Secure headers** | CSP, HSTS, X-Frame-Options | Security |
| **CSRF protection** | Double-submit cookie pattern | Security |
| **Turnstile CAPTCHA** | On all public mutations | Bot prevention |

---

## 9. Notifications Architecture

### 9.1 What

Standards for customer notifications — order notifications, shipping notifications, refund notifications, account notifications, security notifications, and marketing preferences.

### 9.2 Why

- **Communication:** Keep customers informed.
- **Trust:** Transparent updates build confidence.
- **Engagement:** Notifications bring customers back.
- **Compliance:** Meets communication requirements.

### 9.3 Where

Email, in-app notification center, SMS (future), push (future).

### 9.4 Notification Types

| Category | Type | Channel | Trigger | Required |
|----------|------|---------|---------|----------|
| **Order** | Order confirmation | Email + In-app | Order placed | Yes |
| **Order** | Payment confirmation | Email + In-app | Payment successful | Yes |
| **Order** | Order cancellation | Email + In-app | Order cancelled | Yes |
| **Shipping** | Order shipped | Email + In-app | Order shipped | Yes |
| **Shipping** | Out for delivery | Email + In-app | Out for delivery | Yes |
| **Shipping** | Delivered | Email + In-app | Order delivered | Yes |
| **Refund** | Refund initiated | Email + In-app | Refund started | Yes |
| **Refund** | Refund processed | Email + In-app | Refund completed | Yes |
| **Account** | Welcome | Email | Registration | Yes |
| **Account** | Email verification | Email | Registration | Yes |
| **Account** | Password reset | Email | Reset request | Yes |
| **Account** | Profile updated | In-app | Profile change | Yes |
| **Security** | New device login | Email + In-app | New device detected | Yes |
| **Security** | Password changed | Email + In-app | Password change | Yes |
| **Security** | Email changed | Email + In-app | Email change | Yes |
| **Marketing** | Promotional | Email (opt-in) | Campaign | No |
| **Marketing** | Price drop alert | Email (opt-in) | Price drop | No |
| **Marketing** | Back in stock | Email (opt-in) | Stock return | No |
| **Marketing** | New arrivals | Email (opt-in) | New products | No |

### 9.5 In-App Notification Center Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Location** | Account page, header icon | Discoverable |
| **Badge count** | Unread count on icon | Information |
| **List view** | Chronological list | Overview |
| **Read state** | Mark as read on view | Clean |
| **Mark all read** | "Mark all as read" button | Efficiency |
| **Delete** | Swipe to delete (mobile) | Control |
| **Filter** | By type (order, shipping, etc.) | Organization |
| **Empty state** | "No notifications" message | Guidance |

### 9.6 Email Notification Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Template** | Branded, responsive template | Brand consistency |
| **Unsubscribe** | One-click unsubscribe in all emails | Compliance |
| **Preference link** | Link to notification settings | Control |
| **Mobile-friendly** | Responsive design | Mobile-first |
| **Personalization** | Use customer name | Personal |
| **Clear CTA** | Single primary action | Clarity |
| **Footer** | Required legal information | Compliance |

### 9.7 Marketing Preferences Standards

| Preference | Default | Toggleable | Granularity |
|------------|---------|------------|-------------|
| **Promotional emails** | Off | Yes | Per-type |
| **SMS marketing** | Off | Yes | Per-type |
| **Price alerts** | Off | Yes | Per-product |
| **Back in stock** | Off | Yes | Per-product |
| **New arrivals** | Off | Yes | Per-category |
| **Sale alerts** | Off | Yes | General |

### 9.8 Notification Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Transactional always** | Order, payment, shipping always sent | Required |
| **Promotional opt-in** | Marketing requires explicit consent | Compliance |
| **Unsubscribe** | One-click unsubscribe in all emails | Compliance |
| **Frequency cap** | Max 1 promotional email per day | Respect |
| **Personalization** | Use customer name, order details | Personal |
| **Timing** | Send during appropriate hours | Respect |
| **Preference respect** | Honor all notification preferences | Trust |
| **Critical alerts** | Security alerts cannot be disabled | Security |

---

## 10. Permissions Architecture

### 10.1 What

Standards for customer access control — customer access, admin access, editable fields, and restricted fields.

### 10.2 Why

- **Security:** Customers can only access their own data.
- **Privacy:** Shop Owners cannot see customer personal data.
- **Integrity:** Prevent unauthorized modifications.
- **Compliance:** Meets access control requirements.

### 10.3 Where

API endpoints, middleware, admin dashboard.

### 10.4 Customer Access Standards

| Resource | Read | Create | Update | Delete |
|----------|------|--------|--------|--------|
| **Own profile** | ✓ | — | ✓ | — |
| **Own addresses** | ✓ | ✓ | ✓ | ✓ |
| **Own orders** | ✓ | — | — | — |
| **Own wishlist** | ✓ | ✓ | — | ✓ |
| **Own reviews** | ✓ | ✓ | ✓ | ✓ |
| **Own notifications** | ✓ | — | ✓ | — |
| **Own preferences** | ✓ | — | ✓ | — |
| **Other customer data** | ✗ | ✗ | ✗ | ✗ |
| **Shop Owner data** | ✗ | ✗ | ✗ | ✗ |
| **Product catalog** | ✓ | — | — | — |
| **CMS content** | ✓ | — | — | — |

### 10.5 Admin Access Standards

| Resource | Read | Create | Update | Delete |
|----------|------|--------|--------|--------|
| **All customer profiles** | ✓ | — | ✓ | — |
| **All customer addresses** | ✓ | — | ✓ | ✓ |
| **All orders** | ✓ | — | ✓ | — |
| **All reviews** | ✓ | — | ✓ | ✓ |
| **All notifications** | ✓ | ✓ | ✓ | ✓ |
| **System settings** | ✓ | — | ✓ | — |
| **Audit logs** | ✓ | — | — | — |
| **Analytics** | ✓ | — | — | — |

### 10.6 Editable Fields Standards

| Field | Customer | Admin | Shop Owner |
|-------|----------|-------|------------|
| **First name** | ✓ | ✓ | — |
| **Last name** | ✓ | ✓ | — |
| **Email** | ✓ (with verification) | ✓ | — |
| **Phone** | ✓ (with OTP) | ✓ | — |
| **Avatar** | ✓ | ✓ | — |
| **Birthday** | ✓ | ✓ | — |
| **Gender** | ✓ | ✓ | — |
| **Addresses** | ✓ (own) | ✓ | — |
| **Preferences** | ✓ | ✓ | — |
| **Password** | ✓ (own) | Reset only | — |
| **Role** | ✗ | ✓ | — |
| **Account status** | ✗ | ✓ | — |

### 10.7 Restricted Fields Standards

| Field | Customer | Admin | Rationale |
|-------|----------|-------|-----------|
| **User ID** | ✗ | Read | Internal identifier |
| **Password hash** | ✗ | ✗ | Security |
| **Session tokens** | ✗ | ✗ | Security |
| **Audit logs** | ✗ | Read | Compliance |
| **IP addresses** | Own only | All | Privacy |
| **Device info** | Own only | All | Privacy |
| **Login history** | Own only | All | Privacy |

### 10.8 Permission Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Resource ownership** | Customers access only their own resources | Privacy |
| **Admin override** | Admin can access all resources | Platform management |
| **No permission duplication** | Define permission once, reference everywhere | DRY |
| **Centralized definition** | All permissions in one place | Auditability |
| **Explicit grant** | Permissions must be explicitly granted | Security |
| **Default deny** | No access unless permission granted | Security |

---

## 11. Performance Architecture

### 11.1 What

Standards for customer account performance — fast profile loading, responsive editing, efficient synchronization, and optimized data retrieval.

### 11.2 Why

- **UX:** Fast account management feels premium.
- **Retention:** Slow experiences lose customers.
- **Mobile:** Performance critical on mobile networks.
- **Trust:** Fast = professional.

### 11.3 Where

Profile pages, address book, settings, order history.

### 11.4 Fast Profile Loading Standards

| Metric | Target | Implementation |
|--------|--------|----------------|
| **Profile load** | < 500ms | Optimized query, caching |
| **Address list** | < 300ms | Indexed query |
| **Order history** | < 500ms | Paginated query |
| **Settings load** | < 200ms | Cached preferences |
| **Notification center** | < 300ms | Indexed query |

### 11.5 Responsive Editing Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Optimistic updates** | Show changes immediately | Perceived speed |
| **Auto-save** | Save on field blur | Don't lose work |
| **Debounce** | 300ms debounce on inputs | Performance |
| **Inline validation** | Real-time validation | Feedback |
| **Save indicator** | Show save status | Transparency |

### 11.6 Efficient Synchronization Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Version control** | Profile version field | Prevent stale writes |
| **Conflict resolution** | Last-write-wins for non-critical | Simplicity |
| **Real-time sync** | Profile changes reflected across sessions | Continuity |
| **Offline cache** | Cache profile locally | Mobile experience |
| **Background sync** | Sync when app comes to foreground | Efficiency |

### 11.7 Optimized Data Retrieval Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Lazy loading** | Load data on demand | Performance |
| **Pagination** | Paginate order history | Scalability |
| **Field selection** | Select only needed fields | Performance |
| **Caching** | Cache frequent queries | Performance |
| **CDN** | Serve static assets via CDN | Global speed |

### 11.8 Performance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Profile load < 500ms** | Fast profile loading | UX |
| **Optimistic updates** | Show changes immediately | Perceived speed |
| **Auto-save** | Don't lose work | UX |
| **Lazy loading** | Load data on demand | Performance |
| **Pagination** | Paginate large lists | Scalability |
| **Caching** | Cache frequent queries | Performance |
| **CDN** | Serve static assets via CDN | Global speed |
| **Compression** | Compress API responses | Performance |
| **Minimal data** | Transfer only needed data | Mobile |

---

## 12. Accessibility Architecture

### 12.1 What

WCAG 2.2 AA compliance standards for customer account management — mobile editing, keyboard navigation, screen readers, responsive forms, and reduced motion.

### 12.2 Why

- **Legal compliance:** Meet accessibility laws.
- **Inclusivity:** Everyone can manage their account.
- **Quality:** Accessible code is better code.
- **SEO:** Search engines favor accessible sites.

### 12.3 Where

All account pages, forms, settings, and interactive elements.

### 12.4 Mobile Editing Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Touch targets** | 44x44px minimum | Ease of use |
| **Input sizing** | 16px minimum font | Readability |
| **Full-width inputs** | Mobile-optimized layout | Usability |
| **Clear labels** | Visible labels, not just placeholders | Accessibility |
| **Error messages** | Below input, clear text | Guidance |
| **Success feedback** | Visual confirmation | Feedback |

### 12.5 Keyboard Navigation Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Tab order** | Logical, follows visual flow | Intuitive |
| **Focus visible** | Clear focus ring | Orientation |
| **No keyboard trap** | Always able to escape | Recovery |
| **Enter to submit** | Form submission via Enter | Efficiency |
| **Escape to cancel** | Close modals via Escape | Efficiency |
| **Arrow keys** | Navigate within components | Familiar |

### 12.6 Screen Reader Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Semantic HTML** | Use proper HTML elements | Meaning |
| **ARIA labels** | Label all interactive elements | Navigation |
| **Alt text** | Descriptive for meaningful images | Understanding |
| **Form labels** | Associated with inputs | Understanding |
| **Error association** | `aria-describedby` for errors | Clarity |
| **Live regions** | `aria-live` for dynamic content | Updates |
| **Headings** | Proper H1-H6 hierarchy | Navigation |

### 12.7 Responsive Forms Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Single column** | Mobile-first, single column | Readability |
| **Logical grouping** | Related fields grouped | Organization |
| **Clear labels** | Always visible, not just placeholders | Accessibility |
| **Helper text** | Below input, helpful hints | Guidance |
| **Error messages** | Below input, specific | Clarity |
| **Success states** | Visual confirmation | Feedback |
| **Loading states** | Show during async operations | Feedback |

### 12.8 Reduced Motion Standards

| Aspect | Standard | Rationale |
|--------|----------|-----------|
| **Honor preference** | `prefers-reduced-motion: reduce` | Vestibular disorders |
| **Disable animations** | Use CSS media query | Comfort |
| **Alternative feedback** | Use opacity/color instead of motion | Still informative |
| **No auto-play** | User controls playback | Control |
| **No flashing** | No content flashes > 3 times/second | Seizure prevention |

### 12.9 Accessibility Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **WCAG 2.2 AA** | Full compliance | Legal, inclusivity |
| **Keyboard accessible** | All features work with keyboard | Accessibility |
| **Screen reader tested** | Test with NVDA, VoiceOver | Quality |
| **Color contrast** | 4.5:1 minimum | Readability |
| **Focus management** | Clear focus indicators | Navigation |
| **Error prevention** | Clear error messages | Guidance |
| **Touch targets** | 44x44px minimum | Mobile |
| **Responsive design** | Works on all screen sizes | Accessibility |

---

## 13. Future Readiness Architecture

### 13.1 What

Architecture standards for future customer account features — loyalty program, membership, saved payment methods, saved gift cards, AI personalization, multi-language, multi-currency, and family accounts.

### 13.2 Why

- **Scalability:** New features extend without redesign.
- **Competitiveness:** Ready for market demands.
- **Innovation:** Architecture supports experimentation.
- **Investment:** Future-proof development effort.

### 13.3 Where

Account extensions, new features, integrations.

### 13.4 Loyalty Program Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Points display** | Visible in account and cart | Motivation |
| **Earning** | Points per purchase | Engagement |
| **Redemption** | Apply points at checkout | Value |
| **Tiers** | Bronze, Silver, Gold, Platinum | Aspiration |
| **Benefits** | Clear per-tier benefits | Transparency |
| **Expiry** | Points expiry policy | Urgency |
| **History** | Points earning/spending history | Transparency |

### 13.5 Membership Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Tiers** | Free, Plus, Premium | Aspiration |
| **Benefits** | Free shipping, early access, discounts | Value |
| **Pricing** | Monthly/annual plans | Flexibility |
| **Management** | Self-service in account | Control |
| **Cancellation** | Easy cancellation | Trust |
| **Trial** | Free trial period | Conversion |

### 13.6 Saved Payment Methods Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Storage** | PCI-compliant vault | Security |
| **Methods** | Cards, UPI, netbanking | Flexibility |
| **Default** | Set default payment method | Speed |
| **Delete** | Remove saved methods | Control |
| **Display** | Masked card numbers | Privacy |
| **Expiration** | Auto-update expired cards | UX |

### 13.7 Saved Gift Cards Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Balance** | Show gift card balance | Transparency |
| **Redeem** | Apply at checkout | Convenience |
| **History** | Gift card transaction history | Transparency |
| **Transfer** | Transfer to another customer (future) | Social |
| **Expiry** | Show expiry date | Transparency |

### 13.8 AI Personalization Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Recommendations** | Personalized product suggestions | Relevance |
| **Browsing history** | Track and use for personalization | Intelligence |
| **Purchase history** | Use for recommendations | Relevance |
| **Opt-out** | Allow disabling personalization | Control |
| **Transparency** | Explain why recommendations shown | Trust |
| **Privacy** | Clear data usage policies | Trust |

### 13.9 Multi-Language Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Language selector** | In settings page | Discoverable |
| **Default** | Based on browser/locale | Automatic |
| **Persistence** | Save preference | Continuity |
| **URL** | Language prefix or cookie | SEO |
| **Content** | Admin-managed translations | CMS |
| **Products** | Translatable fields | Completeness |

### 13.10 Multi-Currency Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Currency selector** | In settings page | Discoverable |
| **Default** | Based on IP/location | Automatic |
| **Persistence** | Save preference | Continuity |
| **Conversion** | Real-time exchange rates | Accuracy |
| **Display** | Symbol + formatted amount | Readable |
| **Checkout** | Charge in selected currency | Transparency |

### 13.11 Family Accounts Architecture

| Element | Standard | Rationale |
|---------|----------|-----------|
| **Primary account** | Adult manages family | Control |
| **Sub-accounts** | Family members under primary | Convenience |
| **Shared addresses** | Family address book | Efficiency |
| **Individual preferences** | Each member has own preferences | Personalization |
| **Shared payment** | Primary payment method shared | Convenience |
| **Parental controls** | Restrict sub-account features | Safety |

---

## 14. Mandatory Rules for AI Agents

### 14.1 What

Hard rules that every AI agent must follow when designing, implementing, or reviewing customer account features.

### 14.2 Why

- **Consistency:** No exceptions to the rules.
- **Quality:** Every interaction meets the standard.
- **Trust:** Customer data is always protected.

### 14.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Customer owns data** | Customer data belongs only to the customer | Trust violation |
| **No unauthorized access** | Shop Owners cannot access customer private data beyond business requirements | Privacy violation |
| **Soft delete only** | Never hard delete customer data | Data integrity |
| **Audit trail** | Every customer action must remain auditable where required | Compliance |
| **Minimal and beginner-friendly** | Keep the experience minimal and beginner-friendly | UX violation |
| **Mobile-first** | Mobile usability always has highest priority | UX violation |
| **Enterprise-scale** | Design for enterprise-scale growth without redesign | Scalability violation |
| **Secure by default** | All data encrypted, access controlled | Security violation |
| **Transparent privacy** | Customer knows exactly how data is used | Trust violation |
| **Easy deletion** | Customer can delete their account and data | Compliance violation |

### 14.4 Agent Decision Framework

When implementing any customer account feature, agent must ask:

1. **Does this respect customer ownership?** — Does the customer control their data?
2. **Is this minimal?** — Can any element be removed?
3. **Is this beginner-friendly?** — Would a first-time user understand this?
4. **Is this mobile-first?** — Would this work on a 375px screen?
5. **Is this secure?** — Does this protect customer data?
6. **Is this private?** — Does this respect customer privacy?
7. **Is this transparent?** — Does the customer understand what's happening?
8. **Is this reversible?** — Can the customer undo this action?
9. **Is this performant?** — Will this feel fast?
10. **Is this accessible?** — Can every user complete this?

### 14.5 Customer Account Checklist

Before shipping any customer account feature:

- [ ] Customer data ownership respected
- [ ] No unauthorized data access
- [ ] Soft delete only (no hard deletes)
- [ ] Audit trail for sensitive operations
- [ ] Minimal and beginner-friendly
- [ ] Mobile-first design at 375px
- [ ] Enterprise-scale ready
- [ ] Secure by default
- [ ] Transparent privacy
- [ ] Easy account deletion
- [ ] WCAG 2.2 AA compliance
- [ ] Performance budget met
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Error states with recovery
- [ ] Empty states with guidance
- [ ] Loading states present
- [ ] Trust signals visible

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
