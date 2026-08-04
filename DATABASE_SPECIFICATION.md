# নবME (Nabome) Commerce OS — Database Specification

**Version:** 1.0 · **Date:** August 03, 2026
**Status:** Approved for implementation planning
**Authority:** Derived from the Master Architecture Blueprint (Prompts 01–44) and the 44 module architecture documents.
**Companion document:** `DATABASE_ARCHITECTURE.md` (database standards, indexing, and conventions) — this specification is the authoritative entity/relationship/migration contract; `DATABASE_ARCHITECTURE.md` remains the reference for implementation-level standards.

> **Rule of precedence:** Where any module document conflicts with the Master Architecture Blueprint, the Blueprint's canonical resolution (conflict registry, Appendix B/C) wins. Where this specification conflicts with any module document, this specification wins (it is the consolidated, conflict-resolved contract). Where this specification is silent, `DATABASE_ARCHITECTURE.md` applies.

---

# 1. Purpose & Scope

This document is the **complete production-ready database specification** for the নবME (Nabome) Commerce Operating System. It defines:

1. **Database philosophy** — the principles that govern all data modeling.
2. **Data ownership** — every entity has exactly one owning module; no duplicate entities.
3. **Entity catalog** — purpose, fields, types, required/optional, defaults, constraints, validation, relationships, ownership, and lifecycle for every entity across all 24 modules.
4. **Relationship map & aggregate boundaries** — 1:1, 1:N, M:N, parent–child, referential integrity, and what belongs in which transaction boundary.
5. **Data integrity** — invariants, check constraints, unique constraints, and business rules enforced at the database layer.
6. **Transaction strategy** — atomic boundaries, reservation semantics, outbox, idempotency.
7. **Soft delete & archive strategy** — retention classes, recovery windows, append-only rules.
8. **Indexing standards** — primary/secondary/composite, full-text readiness, search optimization.
9. **Migration strategy** — initial, incremental, rollbacks, backward compatibility, production safety.
10. **Performance** — query optimization, partition readiness, read scaling, write optimization.
11. **Naming standards** — universal conventions.
12. **Implementation guidelines** — binding rules for whoever implements the physical database.

**Out of scope (by instruction):** no SQL is implemented, no ORM code is written, no database vendor is selected in this document. The chosen stack (PostgreSQL + Prisma conventions) is referenced only as established in `TECH_STACK.md` / `DATABASE_ARCHITECTURE.md`.

**Hard constraints honored from the Blueprint:**

- The architecture does not change. The database serves the architecture.
- No duplicated entities. Every entity has exactly one owner module.
- Every relationship is justified by a documented use case.
- The design targets enterprise scale (multi-tenant seller commerce, per-order financial integrity, audit-grade compliance).

---

# 2. Database Philosophy

The following principles are normative. Every schema decision in this document traces to one of these principles.

### P1 — Supabase Auth is the identity authority; the application database is the profile authority
- Authentication (credentials, providers, password hashing, MFA secrets) lives in Supabase Auth (`auth.users`). The application schema **never** stores passwords or auth secrets.
- Application-side identity is a `User` row keyed 1:1 by `auth.users.id`. No application login flow re-implements auth.
- All authorization decisions (role, capabilities, permissions) are evaluated from application tables, never from Supabase metadata.

### P2 — Additive role hierarchy with capability flags
- Roles are strictly additive integers: `Guest 0 < Customer 10 < Shop Owner 20 < Admin 30 < System 100`.
- A user's effective access = role's base permissions + explicit capability flags (`superAdmin` is a flag, not a role).
- Permissions are expressed as `{scope}:{resource}:{action}` strings. A permission grants access; nothing is implied by omission.

### P3 — Identifiers are opaque, universal, immutable
- Primary keys: UUID v4 for all application entities.
- Human-facing identifiers (order numbers, invoice numbers, document numbers, SKUs) are **business identifiers** — separate columns with their own uniqueness constraints. They are display/storage keys for humans, never join keys.
- Business identifiers, once issued, are never reused or reassigned.

### P4 — Time is absolute, immutable, UTC
- All timestamps are `TIMESTAMPTZ`, stored in UTC, rendered per user locale.
- `createdAt` is set once at insert and never changes. `updatedAt` is maintained by the data layer on every update.
- Entities that must be provably immutable (financial records, audit logs, status history, messages) carry **no** `updatedAt`; new facts are new rows (append-only). Exception carve-outs are explicit per entity below.

### P5 — Money is decimal, currency-scoped, and never computed from floats
- All monetary columns are `DECIMAL(10,2)` (INR). No `FLOAT`/`DOUBLE` for money, ever.
- Every money column carries a companion currency code (`INR` canonical; multi-currency is display-only — see UX-12/ML-01).
- Financial snapshots on orders/documents are stored **at transaction time**; they are never re-read from mutable master data at report time.

### P6 — Soft delete by default, hard delete by exception
- Every mutable business entity has an `isActive` / `isDeleted` soft-delete flag (per `DATABASE_ARCHITECTURE.md` §12).
- Soft-deleted rows are excluded from all reads by default (RLS + query defaults), never from compliance/audit joins.
- Financial, tax, security, and audit data are **never** hard-deleted; they are archived (see §11).
- Hard delete exists only where legally required or for ephemeral data, and requires admin approval + a bounded operation (max 100 records).

### P7 — Append-only for anything that is a fact
- Order status history, shipment events, finance records, settlement lifecycle, audit entries, refund records, conversation messages: immutable, insert-only, ordered, indexed on `createdAt` + `(entityId)`.
- Corrections are new rows with a `reason` / linked previous row — never in-place edits.

### P8 — Flexible schemas are JSONB and validated; fixed schemas are columns
- Anything with a documented, enumerable set of fields is typed columns.
- Dynamic or configuration-shaped content (product detail attributes like material/care/origin, CMS section payloads, workflow action payloads, filter configs) is `JSONB` with application-layer Zod validation (per Blueprint CC-14 — `meta` shape is canonical).
- JSONB columns are never indexed with generic BTREE over the whole document; they are indexed via expression/GIN where query patterns justify it.

### P9 — Every entity has exactly one owner module
- The owning module defines the schema, writes to it, and is accountable for it.
- Other modules read through defined read paths (views, services) and may create referential edges only if the owner approves (documented in §3).
- No entity in this catalog appears in two modules' ownership.

### P10 — Referential integrity is enforced in the database
- Foreign keys with explicit `ON DELETE` behavior (see §5.3). Orphans are a defect.
- Exceptions: cross-database references (Supabase Auth ↔ app User) and external provider references (gateway IDs, carrier IDs) are string FKs with documented semantics.
- Indexing foreign keys is a hard rule (`DATABASE_ARCHITECTURE.md` §27): every FK column has an index.

### P11 — Idempotency and exactly-once effects
- Payment, settlement, export, and notification side effects carry idempotency keys or unique business identifiers so retries are safe.
- Distributed consistency is achieved via the **event outbox** pattern (§8.3): DB writes and outgoing events commit in the same transaction.

### P12 — The database is the source of truth; caches are derived
- Read caches (KV autocomplete, dashboard aggregates, BI materialized views) are derived, rebuildable, and never the authority.
- Search reads its own derived index, never product tables at request time.

### P13 — Locale & currency are user preferences, not global state
- Canonical content locale is `en-IN`; `bn-IN`, `hi-IN` are display locales (UX-12 = ML-01).
- Currency is `INR` everywhere in storage; formatted for display per locale (Indian comma grouping).

### P14 — Schema is small, named, and permissioned
- Tables are grouped into a small set of named schemas (see §3.1) with per-schema access rules; credentials are least-privilege (audit schema has its own restricted credentials).

---

# 3. Data Ownership

## 3.1 Schema organization

All tables live in the application database (PostgreSQL per `TECH_STACK.md`). Logical schema groups (implementation maps them to PostgreSQL schemas or prefixes; no vendor decision is made here):

| Logical group | Content | Write access |
|---|---|---|
| `identity` | User, Role, Permission, RolePermission, Session, ApiKey, AuthChallenge, TrustDevice | IAM module; Supabase Auth writes `auth.users` only |
| `customer` | CustomerProfile, Address, CustomerPreference, CustomerStats | Customer Account module |
| `shop` | Shop, ShopOwner, ShopSetting, StaffInvitation, PayoutAccount | Shop Owner module |
| `catalog` | Category, Product, ProductCategory, ProductMedia, Attribute, AttributeValue, Variant, VariantAttribute, StockReservation | Product Engine / Catalog / Variant Inventory modules |
| `commerce` | Cart, CartItem, Wishlist, WishlistItem, CheckoutSession, Order, OrderItem, OrderStatusHistory, OrderAddress, CancellationRequest | Cart/Checkout + Order Management modules |
| `payments` | PaymentIntent, PaymentMethod, PaymentTransaction, PaymentRefund, CodOrder | Payment Engine module |
| `logistics` | Shipment, ShipmentEvent, ShipmentItem, DeliveryZone, ShippingRate, CarrierAccount, PickupTask, DeliveryAttempt | Shipping & Logistics module |
| `finance` | FinanceRecord, LedgerEntry, Settlement, SettlementItem, CommissionRate, Payout, Invoice, FinancialHold, TaxBreakdown | Finance Engine module |
| `resolution` | ReturnRequest, ReturnItem, ResolutionConversation, ResolutionMessage | Resolution Engine module |
| `feedback` | Review, ReviewMedia, ReviewHelpfulness, Question, QuestionAnswer, QuestionVote, RatingAggregate | Feedback/Reviews module |
| `content` | Media, CmsContent, CmsContentVersion, CmsBlock, Homepage, HomepageSection, CmsSlide, NavigationMenu, NavigationItem | CMS / Homepage Builder / Navigation modules |
| `communication` | Notification, NotificationPreference, NotificationDelivery, Conversation, ConversationMessage, ConversationParticipant | Notification & Messaging module |
| `documents` | Document, DocumentTemplate, DocumentVersion | Document Engine module |
| `search` | SearchDocument | Search Engine module (planned: SearchSynonym, SearchAnalytics — Phase 2) |
| `reporting` | ExportJob, ExportSchedule, (materialized views) | Export/Reporting/BI module |
| `audit` | AuditLog | Audit & Compliance module (restricted credentials) |
| `platform` | SystemConfig, BrandingConfig, WorkflowDefinition, WorkflowExecution, WorkflowExecutionLog, ScheduledJob, JobQueue*, EventOutbox, ArchiveJob, ConsentRecord | Platform services (Config / Workflow / Lifecycle modules) |

## 3.2 Ownership matrix (single owner per entity)

| Entity | Owner module | Other readers |
|---|---|---|
| User, Role, Permission, RolePermission, Session, ApiKey | Identity & Access Management | All (via auth context) |
| CustomerProfile, Address, CustomerPreference | Customer Account | Order (snapshot), Shipping (snapshot) |
| Shop, ShopOwner, ShopSetting, StaffInvitation, PayoutAccount | Shop Owner Dashboard | Finance (payout), Catalog (products) |
| Category, Product, ProductMedia, Attribute, AttributeValue, Variant, VariantAttribute | Product Engine / Catalog | Search (index build), Order (snapshot) |
| StockReservation | Variant Inventory | Checkout (create), Order (consume/release) |
| Cart, CartItem, Wishlist, WishlistItem, CheckoutSession | Cart/Wishlist/Checkout | Order (conversion) |
| Order, OrderItem, OrderStatusHistory, OrderAddress, CancellationRequest | Order Management | Finance, Logistics, Payments, Resolution |
| PaymentIntent, PaymentMethod, PaymentTransaction, PaymentRefund, CodOrder | Payment Engine | Order, Finance, Resolution |
| Shipment, ShipmentEvent, ShipmentItem, DeliveryZone, ShippingRate, CarrierAccount, PickupTask, DeliveryAttempt | Shipping & Logistics | Order, Notification (events) |
| FinanceRecord, LedgerEntry, Settlement, SettlementItem, CommissionRate, Payout, Invoice, FinancialHold, TaxBreakdown | Finance Engine | Order, Documents (invoice), Reporting |
| ReturnRequest, ReturnItem, ResolutionConversation, ResolutionMessage | Resolution Engine | Order, Finance, Notification |
| Review, ReviewMedia, ReviewHelpfulness, Question, QuestionAnswer, QuestionVote, RatingAggregate | Feedback/Reviews | Catalog (display), Search (boost) |
| Media | Storage Engine | CMS, Products, Reviews (all attach) |
| CmsContent, CmsContentVersion, CmsBlock, Homepage, HomepageSection, CmsSlide | CMS Engine / Homepage Builder | Search (pages), Customer Experience |
| NavigationMenu, NavigationItem | Navigation | Frontend |
| Notification, NotificationPreference, NotificationDelivery | Notification & Messaging | All (fire from events) |
| Conversation, ConversationMessage, ConversationParticipant | Notification & Messaging | Resolution (threads) |
| Document, DocumentTemplate, DocumentVersion | Document Engine | Finance (invoices), Orders, Reporting |
| SearchDocument | Search Engine | Catalog (reads source tables for rebuild) |
| ExportJob, ExportSchedule, BI views | Export/Reporting/BI | Admin Dashboard |
| AuditLog | Audit & Compliance | Security, Platform (read-only) |
| SystemConfig, BrandingConfig | System Configuration | All (read) |
| WorkflowDefinition, WorkflowExecution, WorkflowExecutionLog, ScheduledJob, JobQueue* | Automation/Workflow + Platform | All (effects via events) |
| EventOutbox | Platform (shared infra) | All modules enqueue |
| ArchiveJob, ConsentRecord | Data Lifecycle | Audit, Compliance |

## 3.3 Cross-module reference rules

1. **Snapshot, don't reference, mutable master data in orders and financials.** Order items snapshot product name/SKU/price/tax/discount at purchase time; order addresses snapshot address text; settlement/invoice snapshots financial figures. Mutable entities (Product price, Category name, Address) are referenced by ID **for enrichment only**, never for financial calculation.
2. **Read-through IDs are allowed.** Order → Product (to show current product), Review → Product, CartItem → Variant, etc. These FKs are non-nullable where the business relationship is mandatory.
3. **No entity may be created by a non-owner module.** e.g., Finance may not insert Order rows; Checkout may not insert PaymentTransaction rows (it creates PaymentIntent through the Payment Engine's API only).

---

# 4. Entity Catalog

> **Legend:** fields are given as `name` (`type`, required/optional, default) — constraint notes. Types use logical names: `UUID`, `TEXT`, `VARCHAR(n)`, `INT`, `DECIMAL(10,2)`, `BOOLEAN`, `TIMESTAMPTZ`, `DATE`, `JSONB`, `ENUM/status-string`. Status values are canonical strings (Appendix A). `[u]` = unique, `[fk→table]` = foreign key, `[ck]` = check constraint, `[ix]` = secondary index.

**Universal columns (present on every mutable entity unless explicitly noted):** `id UUID [u, PK]`, `createdAt TIMESTAMPTZ [default NOW()]`, `updatedAt TIMESTAMPTZ [default NOW(), maintained]`, `isActive BOOLEAN [default true]` (soft delete). Append-only entities (audit, history, messages, finance facts) omit `updatedAt` and use `isDeleted` only where specified. These universal columns are not repeated per entity below.

---

## 4.1 Authentication & Identity (IAM + Security)

### 4.1.1 `User` (Profile)
**Purpose:** Application-side identity; extends Supabase Auth (`auth.users.id`). Owner: IAM.
- `id UUID [u, PK]` — equals `auth.users.id`; application never generates it.
- `email CITEXT [u]` — canonical login identity (Supabase Auth normalized).
- `phone VARCHAR(20) [u, optional]` — E.164 normalized; OTP channel.
- `fullName VARCHAR(120)`, `avatarUrl TEXT [optional]`
- `roleId INT [fk→Role] [default 10 Customer]` — additive role, may only be elevated (never lowered by self-service).
- `isSuperAdmin BOOLEAN [default false]` — capability flag (Admin only, assignable by System).
- `status ENUM: active, suspended, deactivated [default active]` — `suspended` blocks all sessions.
- `lastLoginAt TIMESTAMPTZ [optional]`
- **Lifecycle:** never hard-deleted; deactivated + anonymized per retention policy (PII 3y).

### 4.1.2 `Role`
**Purpose:** Additive role definitions. Owner: IAM. Seed data is immutable.
- `id INT [u, PK]` — 0, 10, 20, 30, 100 (Guest, Customer, Shop Owner, Admin, System).
- `name VARCHAR(50) [u]`, `rank INT [u]` — numeric rank drives additive escalation.
- `isSystem BOOLEAN [default true]`

### 4.1.3 `Permission`
**Purpose:** Capability definitions. Owner: IAM.
- `id UUID [u, PK]`, `code VARCHAR(100) [u]` — format `{scope}:{resource}:{action}`, e.g. `shop:product:update`.
- `scope VARCHAR(50)`, `resource VARCHAR(50)`, `action VARCHAR(50)`, `description TEXT [optional]`

### 4.1.4 `RolePermission` (join)
**Purpose:** Role → Permission grants. Owner: IAM.
- `roleId INT [fk→Role, PK part]`, `permissionId UUID [fk→Permission, PK part]`

### 4.1.5 `Session`
**Purpose:** Server-issued sessions. Owner: IAM.
- `id UUID [u, PK]`, `userId UUID [fk→User]`
- `accessTokenHash VARCHAR(64)`, `refreshTokenHash VARCHAR(64)` — plaintext never stored.
- `accessTokenExpiresAt TIMESTAMPTZ` — **15 minutes** (canonical).
- `refreshTokenExpiresAt TIMESTAMPTZ` — **7 days** (canonical).
- `sessionExpiresAt TIMESTAMPTZ [optional]` — absolute bound.
- `deviceInfo JSONB [optional]` — user agent, platform, device fingerprint.
- `isRevoked BOOLEAN [default false]`, `revokedAt TIMESTAMPTZ [optional]`, `revokedReason VARCHAR(50) [optional]`
- **Constraints:** max **5 active sessions per user** (new session evicts oldest); refresh-token rotation — a rotated refresh token is invalidated immediately (reuse detection). Admin elevated sessions: idle **30 min**, absolute **8 h**.
- `[ix] userId+isRevoked`; `[ix] refreshTokenHash [u]`

### 4.1.6 `RefreshTokenRotation`
**Purpose:** Rotated refresh token audit (reuse detection). Owner: IAM.
- `id UUID [u, PK]`, `sessionId [fk→Session]`, `previousTokenHash VARCHAR(64)`, `replacedAt TIMESTAMPTZ`, `ip VARCHAR(45) [optional]`
- Retention: security class, 5 years.

### 4.1.7 `AuthChallenge`
**Purpose:** OTP / 2FA / magic-link verification records. Owner: IAM.
- `id UUID [u, PK]`, `userId UUID [fk→User, optional — guest flow allows email-only]`
- `channel ENUM: email, sms, authenticator_app`; `purpose ENUM: login, password_reset, email_verify, phone_verify, mfa, sensitive_action`
- `codeHash VARCHAR(64)` — hashed; `expiresAt TIMESTAMPTZ` — OTP TTL **10 min** (canonical).
- `attempts INT [default 0]` — max **5 attempts**, then locked (canonical).
- `consumedAt TIMESTAMPTZ [optional]`; `isConsumed BOOLEAN [default false]`
- `[ix] userId+purpose+consumedAt`; retention security class 5y.

### 4.1.8 `TrustDevice`
**Purpose:** Remembered devices for step-up/2FA trust. Owner: IAM.
- `id UUID [u, PK]`, `userId UUID [fk→User]`, `deviceFingerprintHash VARCHAR(64)`
- `trustedUntil TIMESTAMPTZ` — default **30 days** (canonical). `[u] userId+fingerprintHash`

### 4.1.9 `ApiKey`
**Purpose:** Server-to-server / integration credentials. Owner: IAM.
- `id UUID [u, PK]`, `shopId UUID [fk→Shop, optional — platform keys have none]`
- `name VARCHAR(100)`, `keyHash VARCHAR(64) [u]` — key shown once at issue, only hash stored.
- `scopes TEXT[]` — permission codes granted; `expiresAt TIMESTAMPTZ [optional]`
- `lastUsedAt TIMESTAMPTZ [optional]`, `isRevoked BOOLEAN [default false]`
- Retention: security class 5y.

### 4.1.10 `LoginAttempt` (Security)
**Purpose:** Authentication attempt telemetry & brute-force detection. Owner: IAM/Security.
- `id UUID [u, PK]`, `userId UUID [fk→User, optional]`, `email VARCHAR(255) [optional]`
- `ip VARCHAR(45)`, `userAgent TEXT [optional]`, `success BOOLEAN`
- `failureReason VARCHAR(100) [optional]`, `attemptedAt TIMESTAMPTZ [default NOW()]`
- `[ix] ip+attemptedAt`; `[ix] userId+attemptedAt`; retention security class 5y. Aggregated for rate limiting (e.g., lock after N failures per IP/user per window per `SECURITY_ARCHITECTURE.md`).

### 4.1.11 `SecurityEvent`
**Purpose:** Security-relevant audit events (MFA added, password changed, privilege elevated, session revoked, 2FA reset). Owner: Security (writes also to AuditLog with `security` class).
- `id UUID [u, PK]`, `userId UUID [fk→User]`, `type VARCHAR(80)` — canonical event codes.
- `severity ENUM: info, warning, critical`, `details JSONB [optional]`
- `createdAt TIMESTAMPTZ` (no `updatedAt` — append-only). Retention: security class 5y.

---

## 4.2 Customer Account

### 4.2.1 `CustomerProfile`
**Purpose:** Commerce-specific customer data (1:1 with User of role ≥ Customer). Owner: Customer Account.
- `userId UUID [u, fk→User]` — PK/identity; `customerSince TIMESTAMPTZ`
- `preferredLocale VARCHAR(10) [default 'en-IN']` — canonical; `bn-IN`, `hi-IN` display locales.
- `preferredCurrency VARCHAR(3) [default 'INR']`
- `marketingOptIn BOOLEAN [default false]`, `newsletterOptIn BOOLEAN [default false]`
- `isGuest BOOLEAN [default false]` — guest profiles are ephemeral (cart TTL 7 days, retention 90 days).

### 4.2.2 `Address`
**Purpose:** Reusable customer addresses (billing/shipping). Owner: Customer Account.
- `id UUID [u, PK]`, `userId UUID [fk→User]`
- `label VARCHAR(50) [optional]` — "Home", "Office"; `fullName VARCHAR(120)`, `phone VARCHAR(20)`
- `line1 VARCHAR(200)`, `line2 VARCHAR(200) [optional]`, `landmark VARCHAR(200) [optional]`
- `city VARCHAR(100)`, `state VARCHAR(100)`, `postalCode VARCHAR(10)` — PIN code validated.
- `country VARCHAR(100) [default 'India']`
- `isDefaultShipping BOOLEAN [default false]`, `isDefaultBilling BOOLEAN [default false]` — at most one of each per user `[u] userId+isDefaultShipping (partial)`, `[u] userId+isDefaultBilling (partial)`.
- `isActive BOOLEAN [default true]` — soft delete; orders keep immutable snapshots.
- `[ix] userId`

### 4.2.3 `CustomerPreference`
**Purpose:** Per-user UX preferences. Owner: Customer Account.
- `userId UUID [u, fk→User]`
- `theme VARCHAR(20) [optional]`, `notifications JSONB [optional]` — channel toggles per type (echoes NotificationPreference, validated against it).
- `savedSearches JSONB [optional]` — max 20.

### 4.2.4 `CustomerStats` (aggregate)
**Purpose:** Derived customer KPIs for profile/segment display. Owner: Customer Account (write); Order/Finance (feed via events).
- `userId UUID [u, fk→User]`
- `ordersCount INT [default 0]`, `totalSpent DECIMAL(10,2) [default 0]`, `totalSpentCurrency VARCHAR(3) [default 'INR']`
- `reviewsCount INT [default 0]`, `lastOrderAt TIMESTAMPTZ [optional]`
- **Rebuildable** — derived aggregates only (P12).

---

## 4.3 Shop Owner

### 4.3.1 `Shop` (Store)
**Purpose:** Seller storefront entity. Owner: Shop Owner.
- `id UUID [u, PK]`, `name VARCHAR(120)`, `slug VARCHAR(80) [u]` — storefront URL segment.
- `status ENUM: pending_verification, active, suspended, closed [default pending_verification]`
- `description TEXT [optional]`, `logoUrl TEXT [optional]`, `coverUrl TEXT [optional]`
- `gstin VARCHAR(15) [optional]` — validated; `bankAccountLast4 VARCHAR(4) [optional]`
- `commissionRate DECIMAL(4,2) [optional]` — per-shop override; otherwise platform default 15%; capped 10–50% `[ck] 10 ≤ commissionRate ≤ 50`.
- `verifiedAt TIMESTAMPTZ [optional]`
- `[ix] slug [u]`; `[ix] status`

### 4.3.2 `ShopOwner`
**Purpose:** User ↔ Shop staff relationship with role-in-shop. Owner: Shop Owner.
- `id UUID [u, PK]`, `shopId UUID [fk→Shop]`, `userId UUID [fk→User]`
- `role ENUM: owner, manager, staff [default staff]`
- `permissions JSONB [optional]` — additional granular grants within shop.
- `status ENUM: active, suspended, invited [default active]`
- `[u] shopId+userId`; `[ix] userId`

### 4.3.3 `StaffInvitation`
**Purpose:** Pending staff invites. Owner: Shop Owner.
- `id UUID [u, PK]`, `shopId UUID [fk→Shop]`, `email VARCHAR(255)`, `invitedBy UUID [fk→User]`
- `tokenHash VARCHAR(64)`, `expiresAt TIMESTAMPTZ` — **72 hours** (canonical).
- `status ENUM: pending, accepted, expired, revoked [default pending]`
- `[u] tokenHash`

### 4.3.4 `ShopSetting`
**Purpose:** Shop-scoped configuration (JSONB, schema-validated). Owner: Shop Owner.
- `shopId UUID [u, fk→Shop]`, `settings JSONB` — shipping defaults, return policy text, SEO, branding overrides.
- `version INT [default 1]` — bumped on change; audit-logged.

### 4.3.5 `PayoutAccount`
**Purpose:** Seller payout instrument. Owner: Shop Owner (write); Finance (read).
- `id UUID [u, PK]`, `shopId UUID [fk→Shop]`
- `type ENUM: bank, upi [default bank]`, `accountHolderName VARCHAR(120)`
- `details JSONB` — masked account/IFSC/UPI id; full data encrypted at rest, never logged.
- `isVerified BOOLEAN [default false]`, `isDefault BOOLEAN [default false]` — at most one default per shop (partial unique).

---

## 4.4 Product Engine / Catalog / Variant Inventory

### 4.4.1 `Category`
**Purpose:** Product taxonomy (self-referential tree). Owner: Catalog.
- `id UUID [u, PK]`, `parentId UUID [fk→Category, optional]` — root categories have NULL.
- `name VARCHAR(120)`, `slug VARCHAR(120)`
- `description TEXT [optional]`, `imageUrl TEXT [optional]`, `iconUrl TEXT [optional]`
- `sortOrder INT [default 0]`, `isActive BOOLEAN [default true]`, `isDeleted BOOLEAN [default false]`
- `seo JSONB [optional]` — title, description, keywords.
- **Constraints:** slug unique per parent `[u] (parentId, slug)` (NULL-safe via coalesce for roots); depth ≤ **4** levels (canonical); cycle prevention enforced at application layer + trigger guard.
- `[ix] parentId`; `[ix] slug`

### 4.4.2 `Product`
**Purpose:** Sellable item master (template for variants). Owner: Product Engine.
- `id UUID [u, PK]`
- `shopId UUID [fk→Shop]` — seller ownership; platform products: platform shop.
- `name VARCHAR(200)`, `description TEXT`
- `slug VARCHAR(160)` — canonical URL `/shop/{category-slug}/{product-slug}` (CC-13).
- `status ENUM: draft, scheduled, published, archived [default draft]` — single source of truth for visibility.
- `publishAt TIMESTAMPTZ [optional]` — required when `scheduled`; auto-transition handled by scheduler.
- `salePrice DECIMAL(10,2)` — **typed column** (not in meta); `compareAtPrice DECIMAL(10,2) [optional]`
- `currency VARCHAR(3) [default 'INR']`
- `meta JSONB [optional]` — **canonical shape (CC-14):** only unstructured detail attributes (material, care, origin) + brand. No pricing, no status, no identifiers in meta.
- `brand VARCHAR(120) [optional]`, `tags TEXT[] [optional]` — max 20 tags, normalized lowercase.
- `isPromoted BOOLEAN [default false]` — feeds search boost (promoted 1.4).
- `isActive BOOLEAN [default true]`
- **Constraints:** `[ck] salePrice ≥ 0`, `[ck] compareAtPrice IS NULL OR compareAtPrice ≥ salePrice`; `[ck] status='published' ⇒ has ≥1 published variant AND salePrice IS NOT NULL`.
- `[ix] shopId+status`; `[ix] slug [u]` (global); `[ix] salePrice`; `[ix] isPromoted`; `[ix] tags (GIN)`

### 4.4.3 `ProductCategory` (join, M:N)
**Purpose:** Product ↔ Category. Owner: Catalog.
- `productId UUID [fk→Product, PK part]`, `categoryId UUID [fk→Category, PK part]`
- `isPrimary BOOLEAN [default false]` — exactly one primary per product (partial unique).

### 4.4.4 `ProductMedia`
**Purpose:** Gallery attachment (link table to `Media`). Owner: Product Engine (media rows owned by Storage).
- `id UUID [u, PK]`, `productId UUID [fk→Product]`, `mediaId UUID [fk→Media]`
- `role ENUM: image, video, document [default image]`
- `sortOrder INT [default 0]`, `isPrimary BOOLEAN [default false]` — one primary image per product (partial unique).
- `[u] (productId, mediaId)`

### 4.4.5 `Attribute` (Global Attribute System)
**Purpose:** Dynamic variant dimensions (size, color, material, etc. — no hardcoded columns). Owner: Catalog.
- `id UUID [u, PK]`, `code VARCHAR(60) [u]` — lowercase snake, e.g. `size`, `color`.
- `name VARCHAR(120)`, `type ENUM: text, number, select, color_hex [default select]`
- `unit VARCHAR(20) [optional]` — cm, g, ml; `validation JSONB [optional]` — regex/min/max/options.
- `isGlobal BOOLEAN [default true]` — shared attribute definitions; shop-specific overrides allowed via `shopId` NULL vs set.
- **Seed:** `size` and `color` pre-seeded (canonical).

### 4.4.6 `AttributeValue`
**Purpose:** Allowed/observed values per attribute. Owner: Catalog.
- `id UUID [u, PK]`, `attributeId UUID [fk→Attribute]`
- `value VARCHAR(120)`, `shortCode VARCHAR(20)` — uppercase code used in SKU (e.g., `S`, `RED`).
- `sortOrder INT [default 0]`, `isActive BOOLEAN [default true]`
- `[u] (attributeId, value)`; `[u] (attributeId, shortCode)` — case-insensitive.

### 4.4.7 `Variant`
**Purpose:** Concrete sellable unit with inventory & pricing. Owner: Variant Inventory (inventory fields) / Product Engine (identity).
- `id UUID [u, PK]`, `productId UUID [fk→Product]`
- `skuDisplay VARCHAR(50) [u]` — format `{PRODUCT-CODE}-{ATTRIBUTE-SHORTCODES}` (e.g., `NB-TS-01-S-RED`); **immutable once issued**; `[ck] 1–50 chars, alphanumeric + hyphen`.
- `skuInternal VARCHAR(32) [u]` — `NB-{UUID-SUFFIX}`; **immutable**.
- `barcode VARCHAR(20) [optional, u]` — EAN-13 / UPC; validated checksum.
- `salePrice DECIMAL(10,2)`, `compareAtPrice DECIMAL(10,2) [optional]` — variant overrides product defaults.
- `weightGrams INT [optional]`, `lengthCm/widthCm/heightCm DECIMAL(6,2) [optional]`
- `isPrimary BOOLEAN [default false]` — master variant; one per product (partial unique).
- `isActive BOOLEAN [default true]` — soft delete (inventory history preserved).
- `[ck] salePrice ≥ 0`; `[ck] compareAtPrice ≥ salePrice OR NULL`
- `[ix] productId+isActive`; `[ix] skuDisplay`; `[ix] barcode`

### 4.4.8 `VariantAttribute` (join)
**Purpose:** Variant → AttributeValue assignments. Owner: Catalog.
- `variantId UUID [fk→Variant, PK part]`, `attributeValueId UUID [fk→AttributeValue, PK part]`
- `isPrimary BOOLEAN [default false]` — the display dimension (size for apparel).
- **Constraints:** every variant must have ≥1 assignment; SKU shortCodes derived from assignments; combination unique per product `[u] (variantId, attributeValueId)`.

### 4.4.9 `StockReservation`
**Purpose:** Atomic availability hold during checkout/payment (the only reservation mechanism). Owner: Variant Inventory.
- `id UUID [u, PK]`, `variantId UUID [fk→Variant]`
- `orderId UUID [fk→Order, optional]` — bound when order is placed.
- `quantity INT [ck > 0]`
- `status ENUM: active, consumed, released, expired [default active]`
- `expiresAt TIMESTAMPTZ` — **15 minutes** (canonical); expired rows are released by sweeper (status `expired`) and stock restored.
- **Invariant:** `availableStock = stock − reservedStock` where `reservedStock = Σ(active reservations.quantity)`; reservation is a synchronous DB transaction at payment initiation (P11).
- `[ix] variantId+status`; `[ix] orderId`; `[ix] expiresAt (partial: status='active')`

### 4.4.10 `VariantStock` (per-seller inventory ledger)
**Purpose:** Stock ledger with immutable movements (append-only facts). Owner: Variant Inventory.
- `id UUID [u, PK]`, `variantId UUID [fk→Variant]`
- `type ENUM: initial, purchase, restock, sale, return, adjustment, damaged, reservation, release, expiry`
- `quantityDelta INT` (signed), `balanceAfter INT` — running balance (prevents drift).
- `referenceType VARCHAR(50) [optional]`, `referenceId UUID [optional]` — order, reservation, return.
- `note TEXT [optional]`, `actorId UUID [fk→User, optional]`
- `createdAt TIMESTAMPTZ` (append-only, no `updatedAt`).
- `[ix] variantId+createdAt`

---

## 4.5 Cart / Wishlist / Checkout

### 4.5.1 `Cart`
**Purpose:** Active shopping context per user (guest or customer). Owner: SCWC.
- `id UUID [u, PK]`, `userId UUID [fk→User, optional]` — NULL for anonymous guest carts.
- `guestToken VARCHAR(64) [u, optional]` — anonymous cart identity.
- `status ENUM: active, converted, expired, abandoned [default active]`
- `currency VARCHAR(3) [default 'INR']`, `locale VARCHAR(10) [default 'en-IN']`
- `expiresAt TIMESTAMPTZ` — guest **7 days**, customer **90 days** (canonical TTLs).
- `[ck] userId IS NOT NULL OR guestToken IS NOT NULL`
- `[ix] userId+status`; `[ix] guestToken`; `[ix] expiresAt (partial status='active')`

### 4.5.2 `CartItem`
**Purpose:** Cart line. Owner: SCWC.
- `id UUID [u, PK]`, `cartId UUID [fk→Cart, ON DELETE CASCADE]`
- `variantId UUID [fk→Variant]`, `quantity INT [ck 1 ≤ quantity ≤ 99]`
- `priceSnapshot DECIMAL(10,2)` — price at add-time (display only; final price recomputed at checkout).
- `isSelected BOOLEAN [default true]`, `addedAt TIMESTAMPTZ`
- `[u] (cartId, variantId)`; `[ix] variantId`

### 4.5.3 `Wishlist`
**Purpose:** Saved-for-later list. Owner: SCWC.
- `id UUID [u, PK]`, `userId UUID [fk→User]`, `name VARCHAR(100) [default 'Default']`
- **Constraint:** max **50 items** per user total (canonical, enforced on insert).
- `[u] (userId, name)`

### 4.5.4 `WishlistItem`
**Purpose:** Wishlist line. Owner: SCWC.
- `id UUID [u, PK]`, `wishlistId UUID [fk→Wishlist, ON DELETE CASCADE]`, `variantId UUID [fk→Variant]`
- `addedAt TIMESTAMPTZ`; `[u] (wishlistId, variantId)`

### 4.5.5 `CheckoutSession`
**Purpose:** Checkout attempt state machine. Owner: SCWC.
- `id UUID [u, PK]`, `cartId UUID [fk→Cart]`, `userId UUID [fk→User, optional]`
- `status ENUM: started, address_entered, payment_pending, payment_processing, completed, abandoned, expired [default started]`
- `shippingAddressId UUID [fk→Address, optional]`, `billingAddressId UUID [fk→Address, optional]` — or snapshot JSONB `addresses JSONB`.
- `shippingRateId UUID [fk→ShippingRate, optional]`, `shippingFee DECIMAL(10,2) [optional]`
- `totals JSONB` — item total, discount, shipping, codFee, tax, grandTotal (checked at completion).
- `expiresAt TIMESTAMPTZ` — **30 minutes** (canonical).
- `[ix] cartId`

---

## 4.6 Order Management

### 4.6.1 `Order`
**Purpose:** Order aggregate root. Owner: Order Management.
- `id UUID [u, PK]`
- `orderNumber VARCHAR(22) [u]` — format `NAB-YYYYMMDD-XXXXXX` (6-digit zero-padded daily sequence); issued at creation, immutable.
- `userId UUID [fk→User]`, `guestEmail VARCHAR(255) [optional]` — required for guest orders.
- `shopId UUID [fk→Shop]` — single-seller assumption for MVP order; multi-seller split documented as future (order stays per-shop).
- `status VARCHAR(30)` — **18 canonical states** (Appendix A.1), enforceable state machine via status history (no arbitrary transitions).
- `customerVisibleStatus VARCHAR(30)` — derived per UX-11 mapping; maintained by the same transition code (not user-editable).
- `paymentStatus ENUM: pending, authorized, captured, refunding, refunded, failed [default pending]`
- `fulfillmentStatus ENUM: unfulfilled, partially_fulfilled, fulfilled [default unfulfilled]`
- `subtotal DECIMAL(10,2)`, `discountTotal DECIMAL(10,2) [default 0]`, `shippingFee DECIMAL(10,2)`, `codFee DECIMAL(10,2) [default 0]`, `taxTotal DECIMAL(10,2) [default 0]`, `grandTotal DECIMAL(10,2)`
- `currency VARCHAR(3) [default 'INR']`, `locale VARCHAR(10) [default 'en-IN']` — snapshot at order time.
- `paymentMethodType ENUM: prepaid, cod [default prepaid]`
- `placedAt TIMESTAMPTZ`, `confirmedAt TIMESTAMPTZ [optional]`, `deliveredAt TIMESTAMPTZ [optional]`, `cancelledAt TIMESTAMPTZ [optional]`
- `isArchived BOOLEAN [default false]` — archival is a retention operation, not status.
- `[ck] grandTotal = subtotal − discountTotal + shippingFee + codFee + taxTotal` (enforced by insert trigger).
- `[ix] userId+placedAt`; `[ix] shopId+status`; `[ix] orderNumber [u]`; `[ix] status`

### 4.6.2 `OrderItem`
**Purpose:** Immutable purchase snapshot per variant. Owner: Order Management.
- `id UUID [u, PK]`, `orderId UUID [fk→Order, ON DELETE RESTRICT]`
- `variantId UUID [fk→Variant, nullable — kept after variant deletion]`
- `productName VARCHAR(200)` — snapshot; `variantLabel VARCHAR(200)` — snapshot (e.g., "Size: M, Color: Red").
- `skuDisplay VARCHAR(50)` — snapshot; `barcode VARCHAR(20) [optional]` — snapshot.
- `unitPrice DECIMAL(10,2)`, `discountPerUnit DECIMAL(10,2) [default 0]`, `taxPerUnit DECIMAL(10,2) [default 0]`
- `quantity INT [ck > 0]`, `lineTotal DECIMAL(10,2)` — `(unitPrice − discountPerUnit) × quantity + tax`.
- `imageUrl TEXT [optional]` — snapshot.
- `[ix] orderId`; `[ix] variantId`

### 4.6.3 `OrderStatusHistory` (append-only)
**Purpose:** State machine journal. Owner: Order Management.
- `id UUID [u, PK]`, `orderId UUID [fk→Order]`
- `fromStatus VARCHAR(30) [optional]`, `toStatus VARCHAR(30)`
- `changedBy UUID [fk→User, optional]` — NULL = system.
- `reason VARCHAR(200) [optional]`, `metadata JSONB [optional]`
- `createdAt TIMESTAMPTZ` (no `updatedAt`).
- `[ix] orderId+createdAt`; `[ix] toStatus+createdAt`

### 4.6.4 `OrderAddress` (snapshot)
**Purpose:** Immutable billing/shipping snapshot. Owner: Order Management.
- `id UUID [u, PK]`, `orderId UUID [fk→Order]`
- `type ENUM: billing, shipping`, `fullName VARCHAR(120)`, `phone VARCHAR(20)`
- `line1, line2, landmark, city, state, postalCode, country` — copied verbatim from Address at placement; never updated afterwards.
- `[u] (orderId, type)`; `[ix] orderId`

### 4.6.5 `CancellationRequest`
**Purpose:** Customer-initiated cancellation. Owner: Order Management.
- `id UUID [u, PK]`, `orderId UUID [u, fk→Order]`
- `status ENUM: pending, approved, rejected, processed [default pending]`
- `reasonCode VARCHAR(50) [optional]`, `reasonText TEXT [optional]`
- `requestedAt TIMESTAMPTZ`, `decidedAt TIMESTAMPTZ [optional]`
- **Rule (CC-15):** customer cancellation allowed only while `status ∈ {pending, confirmed, processing}` — i.e., **pre-packing**; after `packing`, cancellation goes through Resolution Engine.

---

## 4.7 Payment Engine

### 4.7.1 `PaymentIntent`
**Purpose:** Payment attempt lifecycle per order. Owner: Payment Engine.
- `id UUID [u, PK]`, `orderId UUID [fk→Order]`
- `amount DECIMAL(10,2)`, `currency VARCHAR(3) [default 'INR']`
- `status VARCHAR(30)` — **canonical states:** `created, initiated, processing, authorized, captured, completed, failed, cancelled, expired, partially_refunded, refunded`.
- `methodType ENUM: card, upi, netbanking, wallet, cod, saved_card`
- `gatewayId VARCHAR(100) [optional]` — provider reference.
- `idempotencyKey VARCHAR(120) [u, optional]` — retry safety (P11).
- `expiresAt TIMESTAMPTZ` — payment window **15 minutes** (canonical, aligned with reservation).
- `[ix] orderId`; `[ix] status`

### 4.7.2 `PaymentMethod`
**Purpose:** Saved instruments & tokens (PCI-safe: no PAN stored). Owner: Payment Engine.
- `id UUID [u, PK]`, `userId UUID [fk→User]`
- `type ENUM: card, upi, wallet, netbanking`
- `providerTokenHash VARCHAR(64) [u]` — gateway token reference (token stored encrypted by gateway); app stores hash only.
- `displayLabel VARCHAR(100)` — e.g., "HDFC •• 4242"; `expiryMonth/Year INT [optional]` — card only.
- `isDefault BOOLEAN [default false]` — one per user (partial unique).
- **Security:** last4 + expiry only; PAN/CVV never in application DB. Retention security class 5y.

### 4.7.3 `PaymentTransaction`
**Purpose:** Immutable gateway transaction record. Owner: Payment Engine.
- `id UUID [u, PK]`, `paymentIntentId UUID [fk→PaymentIntent]`
- `type ENUM: authorize, capture, refund, void`
- `amount DECIMAL(10,2)`, `currency VARCHAR(3) [default 'INR']`
- `status ENUM: succeeded, pending, failed [default pending]`
- `gatewayReference VARCHAR(120) [u, optional]` — provider's transaction ID.
- `gatewayResponse JSONB [optional]` — sanitized provider payload (no card data).
- `failureCode VARCHAR(80) [optional]`, `failureMessage TEXT [optional]`
- `idempotencyKey VARCHAR(120) [u]` — required for all gateway calls.
- `createdAt TIMESTAMPTZ` (append-only).
- `[ix] paymentIntentId`; `[ix] gatewayReference`

### 4.7.4 `PaymentRefund`
**Purpose:** Refund lifecycle (see also Resolution Engine link). Owner: Payment Engine (finance coordinates).
- `id UUID [u, PK]`, `paymentIntentId UUID [fk→PaymentIntent]`
- `returnRequestId UUID [fk→ReturnRequest, optional]` — linkage.
- `amount DECIMAL(10,2)`, `currency VARCHAR(3) [default 'INR']`
- `type ENUM: full, partial [default full]` — `credit_note` reserved for future (documented, not activated).
- `status ENUM: initiated, processing, completed, settled, failed [default initiated]`
- `gatewayReference VARCHAR(120) [u, optional]`, `reasonCode VARCHAR(50) [optional]`
- `requestedBy UUID [fk→User]`, `requestedAt TIMESTAMPTZ`, `completedAt TIMESTAMPTZ [optional]`
- `[ix] paymentIntentId`; `[ix] returnRequestId`

### 4.7.5 `CodOrder`
**Purpose:** COD-specific facts. Owner: Payment Engine.
- `orderId UUID [u, fk→Order]`
- `codLimit DECIMAL(10,2)` — order amount; **rule: COD not offered above ₹5,000** (canonical `cod.maxAmount`).
- `status ENUM: awaiting_pickup, in_transit, delivered, failed, paid_to_seller [default awaiting_pickup]`
- `cashCollected DECIMAL(10,2) [optional]`, `collectedAt TIMESTAMPTZ [optional]`

---

## 4.8 Shipping & Logistics

### 4.8.1 `Shipment`
**Purpose:** Physical fulfillment unit per order (1:N — partial shipment allowed). Owner: Logistics.
- `id UUID [u, PK]`, `orderId UUID [fk→Order]`
- `status VARCHAR(30)` — **12 canonical states** (Appendix A.2).
- `carrierAccountId UUID [fk→CarrierAccount, optional]`, `carrierReference VARCHAR(120) [optional]` — AWB / tracking.
- `trackingNumber VARCHAR(120) [u, optional]`, `trackingUrl TEXT [optional]`
- `packedAt, pickedUpAt, inTransitAt, outForDeliveryAt, deliveredAt TIMESTAMPTZ [optional]`
- `addressSnapshot JSONB` — shipping address copy (same snapshot rule as OrderAddress).
- `isActive BOOLEAN [default true]`
- `[ix] orderId`; `[ix] status`; `[ix] trackingNumber`

### 4.8.2 `ShipmentEvent` (append-only)
**Purpose:** Carrier/self-reported timeline events. Owner: Logistics.
- `id UUID [u, PK]`, `shipmentId UUID [fk→Shipment]`
- `type VARCHAR(80)` — canonical event codes (picked_up, in_transit, out_for_delivery, delivered, delivery_failed, exception…).
- `location VARCHAR(200) [optional]`, `description TEXT [optional]`
- `occurredAt TIMESTAMPTZ`, `createdAt TIMESTAMPTZ` (no `updatedAt`).
- `[ix] shipmentId+occurredAt`

### 4.8.3 `ShipmentItem`
**Purpose:** Which order items ship in this shipment. Owner: Logistics.
- `id UUID [u, PK]`, `shipmentId UUID [fk→Shipment]`, `orderItemId UUID [fk→OrderItem]`
- `quantity INT [ck > 0]`; `[u] (shipmentId, orderItemId)`

### 4.8.4 `DeliveryZone`
**Purpose:** Serviceable areas & PIN-code mapping. Owner: Logistics.
- `id UUID [u, PK]`, `name VARCHAR(100)` — e.g., "Metro North".
- `pincodes TEXT[]` — array of 6-digit PINs; `state VARCHAR(100) [optional]`
- `isActive BOOLEAN [default true]`; `[ix] pincodes (GIN)`

### 4.8.5 `ShippingRate`
**Purpose:** Rate cards (standard/express/free threshold). Owner: Logistics (values sourced from SystemConfig canonical defaults).
- `id UUID [u, PK]`, `name VARCHAR(60)` — **Standard**, **Express** (canonical).
- `rate DECIMAL(10,2)` — standard **₹99**, express **₹199** defaults.
- `freeThreshold DECIMAL(10,2) [optional]` — standard free above **₹999** (canonical).
- `etaMinDays INT`, `etaMaxDays INT`, `isActive BOOLEAN [default true]`
- `[ix] isActive`

### 4.8.6 `CarrierAccount`
**Purpose:** Integrated logistics providers. Owner: Logistics.
- `id UUID [u, PK]`, `name VARCHAR(100)` — Delhivery, BlueDart, DTDC, Ekart…
- `credentialsRef VARCHAR(200) [optional]` — reference to secrets store (never plaintext in DB).
- `isActive BOOLEAN [default true]`, `testMode BOOLEAN [default true]`

### 4.8.7 `PickupTask`
**Purpose:** Seller-side pickup scheduling (COD & prepaid). Owner: Logistics.
- `id UUID [u, PK]`, `shipmentId UUID [fk→Shipment]`
- `status ENUM: scheduled, pending_confirmation, confirmed, picked_up, failed [default scheduled]`
- `scheduledWindow JSONB` — date/time slots; `addressSnapshot JSONB`
- `attempts INT [default 0]`, `lastAttemptAt TIMESTAMPTZ [optional]`

### 4.8.8 `DeliveryAttempt`
**Purpose:** Failed delivery attempts & redelivery scheduling. Owner: Logistics.
- `id UUID [u, PK]`, `shipmentId UUID [fk→Shipment]`
- `attemptNumber INT`, `status ENUM: attempted, failed, rescheduled, delivered`
- `failureReason VARCHAR(100) [optional]`, `rescheduledAt TIMESTAMPTZ [optional]`
- `createdAt TIMESTAMPTZ` (append-only). `[ix] shipmentId`

---

## 4.9 Finance Engine

> **Principles:** all finance rows are append-only facts with business-identifier columns; figures are snapshotted; a finance record exists for every order from confirmation onward.

### 4.9.1 `FinanceRecord`
**Purpose:** Master ledger of every financial event for an order (sale, hold, commission, settlement eligibility). Owner: Finance.
- `id UUID [u, PK]`, `orderId UUID [fk→Order]`
- `recordNumber VARCHAR(30) [u]` — human identifier (prefix `FIN-`).
- `type ENUM: sale, commission, hold, release, settlement, refund, reversal, adjustment`
- `amount DECIMAL(10,2)`, `currency VARCHAR(3) [default 'INR']`
- `status ENUM: pending, posted, reversed [default pending]`
- `referenceType VARCHAR(50) [optional]`, `referenceId UUID [optional]`
- `postedAt TIMESTAMPTZ [optional]` — when immutable posted.
- `createdAt TIMESTAMPTZ` (append-only; corrections = new rows with `reversal`).
- `[ix] orderId`; `[ix] referenceType+referenceId`

### 4.9.2 `LedgerEntry` (double-entry)
**Purpose:** Posting detail (debits/credits balance to zero). Owner: Finance.
- `id UUID [u, PK]`, `financeRecordId UUID [fk→FinanceRecord]`
- `account VARCHAR(60)` — canonical chart of accounts (seller_payable, commission_income, cash, refunds…).
- `side ENUM: debit, credit`, `amount DECIMAL(10,2)`
- `createdAt TIMESTAMPTZ` (append-only).
- **Invariant:** every FinanceRecord's ledger entries sum to zero `[ck via aggregate trigger]`.
- `[ix] financeRecordId`; `[ix] account`

### 4.9.3 `Settlement`
**Purpose:** Seller payout cycle per order. Owner: Finance.
- `id UUID [u, PK]`, `orderId UUID [u, fk→Order]` — one settlement per order (idempotency via `(settlementId, orderId)`).
- `settlementId VARCHAR(80) [u]` — gateway/external settlement reference.
- `status ENUM: PENDING, ELIGIBLE, CREATED, REVIEW, APPROVED, PROCESSING, COMPLETED, PAID, REJECTED, FAILED, REVERSED` — canonical full set.
- `schedule JSONB` — cycle metadata; `createdAt`, `eligibleAt TIMESTAMPTZ [optional]` — **7-day hold** from delivery (canonical `finance.holdDays`).
- `commissionAmount DECIMAL(10,2)`, `commissionRate DECIMAL(4,2)` — snapshot (platform default **15%**, per-shop override, cap **10–50%**).
- `netAmount DECIMAL(10,2)`, `currency VARCHAR(3) [default 'INR']`
- `payoutId UUID [fk→Payout, optional]`
- `[ix] status`; `[ix] payoutId`

### 4.9.4 `SettlementItem`
**Purpose:** Line detail of settlement (order-level already; items retained for audit). Owner: Finance.
- `id UUID [u, PK]`, `settlementId UUID [fk→Settlement]`, `orderId UUID [fk→Order]`
- `grossAmount, commissionAmount, refundAdjustment, netAmount DECIMAL(10,2)`
- `[ix] settlementId`

### 4.9.5 `CommissionRate`
**Purpose:** Commission definitions (platform default + category/shop overrides). Owner: Finance.
- `id UUID [u, PK]`, `scope ENUM: platform, shop, category`
- `shopId UUID [fk→Shop, optional]`, `categoryId UUID [fk→Category, optional]`
- `rate DECIMAL(4,2) [ck 10 ≤ rate ≤ 50]` — cap enforced (canonical).
- `effectiveFrom DATE`, `effectiveTo DATE [optional]` — versioned by date range; overlapping ranges invalid (partial unique on scope+target+date).
- `[ix] scope+shopId+effectiveFrom`

### 4.9.6 `Payout`
**Purpose:** Actual money movement to seller account. Owner: Finance.
- `id UUID [u, PK]`, `shopId UUID [fk→Shop]`, `payoutAccountId UUID [fk→PayoutAccount]`
- `amount DECIMAL(10,2)`, `currency VARCHAR(3) [default 'INR']`
- `status ENUM: QUEUED, PROCESSING, COMPLETED, FAILED, REVERSED`
- `batchReference VARCHAR(120) [u, optional]` — bank/gateway batch ID.
- `requestedAt TIMESTAMPTZ`, `completedAt TIMESTAMPTZ [optional]`
- `[ix] shopId+status`; `[ix] status`

### 4.9.7 `Invoice`
**Purpose:** Tax-compliant seller invoice. Owner: Finance (content rendered by Document Engine).
- `id UUID [u, PK]`, `shopId UUID [fk→Shop]`, `orderId UUID [fk→Order]`
- `invoiceNumber VARCHAR(20) [u]` — `INV-YYYY-NNNNNN` (canonical).
- `status ENUM: draft, issued, cancelled [default draft]` — issued invoices immutable.
- `totals JSONB` — taxable, tax split (CGST/SGST/IGST), invoice total.
- `issuedAt TIMESTAMPTZ [optional]`; `documentId UUID [fk→Document, optional]`
- **Lifecycle:** financial document — never hard-deleted; 7-year archive.

### 4.9.8 `FinancialHold`
**Purpose:** 7-day delivery hold bookkeeping. Owner: Finance.
- `id UUID [u, PK]`, `settlementId UUID [fk→Settlement]`
- `heldAmount DECIMAL(10,2)`, `status ENUM: active, released`
- `heldFrom TIMESTAMPTZ`, `releaseAt TIMESTAMPTZ` — `deliveredAt + 7 days`.
- `releasedAt TIMESTAMPTZ [optional]`; `[ix] releaseAt (partial status='active')`

### 4.9.9 `TaxBreakdown`
**Purpose:** Order/item tax detail (GST). Owner: Finance (reads from Order).
- `id UUID [u, PK]`, `orderId UUID [fk→Order]` / `orderItemId UUID [fk→OrderItem, optional]`
- `taxType ENUM: CGST, SGST, IGST`, `rate DECIMAL(5,2)`, `baseAmount DECIMAL(10,2)`, `taxAmount DECIMAL(10,2)`
- `[ix] orderId`

---

## 4.10 Resolution Engine (Returns / Refunds / Disputes)

### 4.10.1 `ReturnRequest`
**Purpose:** Customer return RMA. Owner: Resolution.
- `id UUID [u, PK]`, `orderId UUID [fk→Order]`, `userId UUID [fk→User]`
- `rmaNumber VARCHAR(24) [u]` — `RET-{orderNumber}-{seq}` (canonical prefix `RET`).
- `reasonCode VARCHAR(60)`, `reasonText TEXT [optional]`
- `status ENUM: submitted, under_review, approved, rejected, item_received, refund_initiated, refund_completed, closed [default submitted]`
- **Rule:** return window **7 days** from delivery (canonical `resolution.returnWindowDays`); RMA valid only within window.
- `requestedAt TIMESTAMPTZ`, `approvedAt TIMESTAMPTZ [optional]`, `itemReceivedAt TIMESTAMPTZ [optional]`
- `[ix] orderId`; `[ix] status`

### 4.10.2 `ReturnItem`
**Purpose:** Per-item return detail. Owner: Resolution.
- `id UUID [u, PK]`, `returnRequestId UUID [fk→ReturnRequest]`
- `orderItemId UUID [fk→OrderItem]`, `quantity INT [ck > 0]`
- `condition ENUM: new, used, damaged, missing_parts [optional]`
- `refundAmount DECIMAL(10,2) [optional]` — computed at approval.
- `[u] (returnRequestId, orderItemId)`

### 4.10.3 `ResolutionConversation`
**Purpose:** Customer↔support thread scoped to a resolution. Owner: Resolution.
- `id UUID [u, PK]`, `returnRequestId UUID [fk→ReturnRequest]`
- `subject VARCHAR(200)`, `status ENUM: open, pending_customer, resolved, escalated [default open]`
- **SLA fields (canonical config):** `initialResponseAt` within **24 h**; `reviewDeadlineAt` **48 h**; `acceptRejectDeadlineAt` **48 h**; `resolutionDeadlineAt` **7 days**; flagged content re-review **4 h**.
- `[ix] status`

### 4.10.4 `ResolutionMessage` (append-only)
**Purpose:** Message in resolution thread. Owner: Resolution.
- `id UUID [u, PK]`, `conversationId UUID [fk→ResolutionConversation]`
- `senderType ENUM: customer, support, system`, `senderId UUID [fk→User, optional]`
- `body TEXT`, `attachments JSONB [optional]` — same shape as message attachments.
- `createdAt TIMESTAMPTZ` (no `updatedAt`).
- `[ix] conversationId+createdAt`

---

## 4.11 Feedback / Reviews / Questions

### 4.11.1 `Review`
**Purpose:** Product review. Owner: Feedback.
- `id UUID [u, PK]`, `productId UUID [fk→Product]`, `userId UUID [fk→User]`
- `rating INT [ck 1 ≤ rating ≤ 5]`, `title VARCHAR(150) [optional]`, `body TEXT`
- `status ENUM: pending, approved, rejected, flagged [default pending]` — flagged items re-reviewed within **4 h** (canonical SLA).
- `isVerifiedPurchase BOOLEAN [default false]` — derived from Order.
- `helpfulCount INT [default 0]`, `reportCount INT [default 0]`
- `moderationNote TEXT [optional]`
- `publishedAt TIMESTAMPTZ [optional]`
- **Rules:** one review per user per product (partial unique on (productId, userId) where status ≠ rejected); reviews allowed only for verified orders.
- `[ix] productId+status`; `[ix] rating`

### 4.11.2 `ReviewMedia`
**Purpose:** Review images/videos (link to Media). Owner: Feedback.
- `id UUID [u, PK]`, `reviewId UUID [fk→Review]`, `mediaId UUID [fk→Media]`, `sortOrder INT`
- `[u] (reviewId, mediaId)`

### 4.11.3 `ReviewHelpfulness`
**Purpose:** Helpful votes (deduplicated). Owner: Feedback.
- `id UUID [u, PK]`, `reviewId UUID [fk→Review]`, `userId UUID [fk→User]`
- `isHelpful BOOLEAN`, `createdAt TIMESTAMPTZ`; `[u] (reviewId, userId)`

### 4.11.4 `Question`
**Purpose:** Customer question on product. Owner: Feedback.
- `id UUID [u, PK]`, `productId UUID [fk→Product]`, `userId UUID [fk→User]`
- `body TEXT`, `status ENUM: open, answered, closed [default open]`
- `createdAt TIMESTAMPTZ`; `[ix] productId+status`

### 4.11.5 `QuestionAnswer`
**Purpose:** Answer to a question. Owner: Feedback.
- `id UUID [u, PK]`, `questionId UUID [fk→Question]`
- `answererType ENUM: seller, customer, admin`, `answererId UUID [fk→User, optional]`
- `body TEXT`, `isAccepted BOOLEAN [default false]`, `createdAt TIMESTAMPTZ`

### 4.11.6 `QuestionVote`
**Purpose:** Votes on answers. Owner: Feedback.
- `id UUID [u, PK]`, `answerId UUID [fk→QuestionAnswer]`, `userId UUID [fk→User]`, `vote ENUM: up, down`
- `[u] (answerId, userId)`

### 4.11.7 `RatingAggregate` (derived)
**Purpose:** Product rating summary for display & search boost. Owner: Feedback (write via events); Catalog/Search (read).
- `productId UUID [u, fk→Product]`
- `averageRating DECIMAL(3,2)`, `ratingCount INT`, `distribution JSONB` — counts per star.
- Rebuildable derived aggregate (P12).

---

## 4.12 CMS / Homepage Builder / Navigation

### 4.12.1 `Media` (Storage Engine — single source of truth for all assets)
**Purpose:** Registry of every uploaded/generated asset. Owner: Storage Engine; every other module references it (never stores URLs directly except legacy snapshots).
- `id UUID [u, PK]`, `objectKey VARCHAR(500) [u]` — R2 path `nabome/{domain}/{entityId}/{assetType}/{filename}` (canonical).
- `bucket VARCHAR(50)`, `domain ENUM: products, cms, reviews, documents, exports, avatars, misc`
- `entityType VARCHAR(50)`, `entityId UUID [optional]` — polymorphic owner reference (product, cms content, review…).
- `mimeType VARCHAR(100)`, `sizeBytes INT [ck ≤ 10MB]`
- `width INT [optional]`, `height INT [optional]` — images constrained 400×400–4000×4000 px (canonical).
- `checksumSha256 VARCHAR(64)`, `altText VARCHAR(300) [optional]`, `caption TEXT [optional]`
- `status ENUM: pending, processed, failed, archived [default pending]`
- `[ix] entityType+entityId`; `[ix] domain`; `[ix] status`

### 4.12.2 `CmsContent`
**Purpose:** Pages & articles (pages are `CmsContent` rows typed by `typeId` — no separate `CmsPage` table). Owner: CMS.
- `id UUID [u, PK]`, `typeId VARCHAR(50)` — `page`, `article`, `product_landing`…
- `title JSONB` — localized `{en-IN, bn-IN, hi-IN}` (canonical locale shape); `body JSONB` — localized rich content.
- `slug VARCHAR(160) [u]` — URL segment, unique globally.
- `status ENUM: draft, published, archived [default draft]`; `publishedAt TIMESTAMPTZ [optional]`
- `authorId UUID [fk→User, optional]`
- `seo JSONB [optional]` — meta title/description, canonical URL, structured data.
- `currentVersionId UUID [fk→CmsContentVersion, optional]`
- `isActive BOOLEAN [default true]`
- `[ix] typeId+status`; `[ix] slug`

### 4.12.3 `CmsContentVersion`
**Purpose:** Version history of content rows (auditable drafts). Owner: CMS.
- `id UUID [u, PK]`, `contentId UUID [fk→CmsContent]`
- `versionNumber INT`, `title JSONB`, `body JSONB`, `seo JSONB [optional]`
- `createdBy UUID [fk→User, optional]`, `createdAt TIMESTAMPTZ`
- `[u] (contentId, versionNumber)`; append-only (no `updatedAt`).

### 4.12.4 `CmsBlock`
**Purpose:** Reusable content blocks (hero, CTA, rich text, product grid…). Owner: CMS.
- `id UUID [u, PK]`, `name VARCHAR(120)`, `typeId VARCHAR(60)` — block template type.
- `content JSONB` — schema-validated payload per type.
- `status ENUM: draft, published, archived [default draft]`
- `isActive BOOLEAN [default true]`; `[ix] typeId+status`

### 4.12.5 `Homepage`
**Purpose:** Homepage configuration root (versioned). Owner: Homepage Builder.
- `id UUID [u, PK]`, `name VARCHAR(120) [default 'Default']`
- `status ENUM: draft, live, archived [default draft]`
- `publishedVersionId UUID [fk→HomepageSection] — reference to published section set]
- `createdAt/updatedAt` standard.

### 4.12.6 `HomepageSection`
**Purpose:** Ordered section instance on a homepage. Owner: Homepage Builder.
- `id UUID [u, PK]`, `homepageId UUID [fk→Homepage]`
- `sectionType VARCHAR(60)` — hero, categories, featured_products, collections, banners…
- `content JSONB` — section payload (title, items, links, media references by Media id).
- `sortOrder INT [default 0]`, `status ENUM: draft, published [default published]`
- `isVisible BOOLEAN [default true]`; `[ix] homepageId+sortOrder`

### 4.12.7 `CmsSlide`
**Purpose:** Carousel/banner slides. Owner: CMS (media cascade via `Media` path `cms/slides/{uuid}/`).
- `id UUID [u, PK]`, `name VARCHAR(120)`, `mediaId UUID [fk→Media, optional]`
- `headline JSONB [optional]`, `subheadline JSONB [optional]`, `cta JSONB [optional]` — localized.
- `linkUrl VARCHAR(500) [optional]`, `sortOrder INT`, `isActive BOOLEAN [default true]`

### 4.12.8 `NavigationMenu` / `NavigationItem`
**Purpose:** Storefront navigation (SSOT: `NAVIGATION_ARCHITECTURE.md`). Owner: Navigation.
- `NavigationMenu`: `id UUID [u, PK]`, `name VARCHAR(100)`, `location VARCHAR(50)` — header/footer/mobile; `isActive BOOLEAN [default true]`.
- `NavigationItem`: `id UUID [u, PK]`, `menuId UUID [fk→NavigationMenu]`, `parentId UUID [fk→NavigationItem, optional]`
- `label JSONB` — localized; `linkType ENUM: category, product, page, url, collection`; `linkTarget VARCHAR(500)`
- `sortOrder INT`, `isActive BOOLEAN [default true]`; `[ix] menuId+sortOrder`

---

## 4.13 Notification & Messaging

### 4.13.1 `Notification`
**Purpose:** In-app + channel notifications. Owner: Communication.
- `id UUID [u, PK]`, `userId UUID [fk→User]`, `type VARCHAR(80)` — canonical event codes.
- `channel ENUM: in_app, email [default in_app]` — SMS/Slack extensibility points (future).
- `priority ENUM: urgent, high, normal, low, background [default normal]` — drives retry policy (Appendix A.4).
- `title VARCHAR(200)`, `body TEXT`, `payload JSONB [optional]` — deep-link data.
- `status ENUM: pending, sent, delivered, failed [default pending]`
- `readAt TIMESTAMPTZ [optional]` — in-app only.
- **Retention:** in-app rows deleted after **90 days** (canonical); delivery/failure history retained per audit class.
- `[ix] userId+createdAt`; `[ix] status`; `[ix] type`

### 4.13.2 `NotificationPreference`
**Purpose:** Per-user per-type channel opt-in. Owner: Communication.
- `id UUID [u, PK]`, `userId UUID [fk→User]`, `type VARCHAR(80)`
- `channels JSONB` — `{in_app: bool, email: bool}`; `[u] (userId, type)`

### 4.13.3 `NotificationDelivery`
**Purpose:** Provider delivery log per channel send. Owner: Communication.
- `id UUID [u, PK]`, `notificationId UUID [fk→Notification]`
- `channel`, `provider VARCHAR(50)` — e.g., `resend`, `fcm`.
- `providerMessageId VARCHAR(120) [optional]`, `providerStatus VARCHAR(30)` — `sent/delivered/failed/bounced`.
- `attempts INT [default 0]`, `lastError TEXT [optional]`
- `createdAt TIMESTAMPTZ` (append-only).
- **Retries (canonical):** Urgent 5 @1s; High 3 @2s; Normal 3 @5s; Low 2 linear; Background 1. Dead-letter to job DLQ after exhaustion.
- `[ix] notificationId`; `[ix] providerMessageId`

### 4.13.4 `Conversation`
**Purpose:** Permanent customer support thread (append-only, never deleted). Owner: Communication.
- `id UUID [u, PK]`, `customerId UUID [fk→User]`
- `subject VARCHAR(200) [optional]`, `status ENUM: open, pending_customer, resolved, closed [default open]`
- `channel ENUM: webchat, email`; `lastMessageAt TIMESTAMPTZ [optional]`
- `[ix] customerId+status`

### 4.13.5 `ConversationMessage`
**Purpose:** Message row (attachments embedded as JSONB). Owner: Communication.
- `id UUID [u, PK]`, `conversationId UUID [fk→Conversation]`
- `senderType ENUM: customer, support, system`, `senderId UUID [fk→User, optional]`
- `body TEXT`, `attachments JSONB [optional]` — `[{mediaId, type, url, name, sizeBytes}]`.
- `createdAt TIMESTAMPTZ` (append-only, no `updatedAt`).
- `[ix] conversationId+createdAt`

### 4.13.6 `ConversationParticipant`
**Purpose:** Support staff in a thread (routing). Owner: Communication.
- `id UUID [u, PK]`, `conversationId UUID [fk→Conversation]`, `userId UUID [fk→User]`
- `role ENUM: assignee, observer`, `assignedAt TIMESTAMPTZ`
- `[u] (conversationId, userId)`

---

## 4.14 Document Engine

### 4.14.1 `Document`
**Purpose:** Generated/uploaded documents (invoices, packing slips, returns, statements). Owner: Documents.
- `id UUID [u, PK]`, `type VARCHAR(20)` — canonical registry (Appendix A.3).
- `documentNumber VARCHAR(30) [u]` — `INV-YYYY-NNNNNN` etc. (prefix per type).
- `shopId UUID [fk→Shop, optional]`, `orderId UUID [fk→Order, optional]` — context links.
- `status ENUM: generated, issued, revoked, archived [default generated]`
- `mediaId UUID [fk→Media, optional]` — rendered file (PDF) in R2.
- `payload JSONB` — snapshot of rendered facts (immutable after issue).
- `issueAt TIMESTAMPTZ [optional]`
- **Retention:** active→archive after **2 years**; financial documents **7 years** in cold archive; **never hard-deleted**.
- `[ix] type+documentNumber`; `[ix] orderId`; `[ix] shopId`

### 4.14.2 `DocumentTemplate`
**Purpose:** Rendering templates per type/locale. Owner: Documents.
- `id UUID [u, PK]`, `type VARCHAR(20)`, `locale VARCHAR(10) [default 'en-IN']`
- `templateRef VARCHAR(200)` — template engine reference; `version INT`
- `isActive BOOLEAN [default true]`; `[u] (type, locale, version)`

### 4.14.3 `DocumentVersion`
**Purpose:** Document re-issue history (amended invoices). Owner: Documents.
- `id UUID [u, PK]`, `documentId UUID [fk→Document]`, `versionNumber INT`
- `documentNumberSuffix VARCHAR(10) [optional]` — re-issue numbering; `mediaId UUID [fk→Media]`
- `createdAt TIMESTAMPTZ` (append-only); `[u] (documentId, versionNumber)`

---

## 4.15 Search Engine

### 4.15.1 `SearchDocument` (derived index — the only search read path)
**Purpose:** Denormalized product index built from product/category tables; search reads **only** this table (never product tables at request time). Owner: Search.
- `id UUID [u, PK]`, `productId UUID [u, fk→Product]`
- `name VARCHAR(200)`, `description TEXT`, `brand VARCHAR(120) [optional]`
- `categoryId UUID [fk→Category, optional]`, `categoryName VARCHAR(120)`, `categorySlug VARCHAR(120)`
- `slug VARCHAR(160)`, `price DECIMAL(10,2)`
- `stock INT`, `isInStock BOOLEAN`, `isPromoted BOOLEAN`, `isPublished BOOLEAN`
- `tags TEXT[]`, `imageUrl TEXT [optional]`
- `searchVector TSVECTOR` — maintained on write (full-text readiness); `nameNormalized TEXT` — lowercase fold.
- `orders30d INT [default 0]`, `averageRating DECIMAL(3,2) [default 0]`
- `lastIndexedAt TIMESTAMPTZ`
- **Population:** product create/update → async < **2 s**; delete → < 2 s; bulk import < **30 s** batch; full rebuild < **10 min** background job.
- `[u] productId`; `[ix] searchVector (GIN)`; `[ix] name trgm (GIN)`; `[ix] price`; `[ix] categoryName`
- **Query contract:** cursor pagination (`id > cursor`, LIMIT 24); facets via `GROUP BY categoryName` LIMIT 20; max results **50** (canonical; doc appendix says 500 — overridden); min 2 chars; 300 ms debounce; autocomplete max 5 suggestions.

### 4.15.2 `SearchSynonym` (planned — Phase 2)
**Purpose:** Synonym dictionary for fuzzy matching. Owner: Search. **No schema yet**; listed for planning only (Phase 2 item).

### 4.15.3 `SearchAnalytics` (planned — Phase 2)
**Purpose:** CTR/conversion analytics. Owner: Search. **No schema yet**; constraint: queries never store PII; analytics **anonymized after 30 days** (canonical).

---

## 4.16 Export / Reporting / BI

### 4.16.1 `ExportJob`
**Purpose:** User-triggered data exports. Owner: Reporting.
- `id UUID [u, PK]`, `userId UUID [fk→User]`
- `type VARCHAR(60)` — orders, products, finance, customers, inventory…
- `filters JSONB [optional]` — immutable filter snapshot.
- `status ENUM: queued, running, completed, failed, expired [default queued]`
- `fileMediaId UUID [fk→Media, optional]` — exported file.
- `rowCount INT [optional]`, `progressPercent INT [optional]`
- **Limits:** max **100,000 rows** / **50 MB** per export (canonical); completion URL one-time, expires **15 min**; file retained **30 days**.
- `[ix] userId+createdAt`; `[ix] status`

### 4.16.2 `ExportSchedule` (planned)
**Purpose:** Recurring exports. Owner: Reporting. Placeholder entity — `cron JSONB`, `lastRunAt`, `isActive`; activation Phase 2.

### 4.16.3 BI materialized views (8 canonical)
**Purpose:** Pre-aggregated reporting facts. Owner: Reporting. Rebuildable (P12); KV cache TTL: dashboard 5 min, search 1 min, autocomplete 5 min.
1. `mv_daily_revenue` (date, shop, gross, net, commissions, refunds)
2. `mv_sales_by_category`
3. `mv_sales_by_product` (30/90-day windows)
4. `mv_order_funnel` (status distribution)
5. `mv_settlement_summary` (by shop, period, status)
6. `mv_customer_lifetime_value`
7. `mv_return_rate` (by product/shop/category)
8. `mv_inventory_health` (stock levels, low-stock counts)
- All keyed on `date`/`period` + dimension columns, refreshed per schedule (daily default), replaceable.

---

## 4.17 Audit & Compliance

### 4.17.1 `AuditLog`
**Purpose:** Immutable, append-only audit trail for every sensitive action. Owner: Audit & Compliance. **Separate schema with restricted credentials** (write-only for services, read-only for auditors).
- `id VARCHAR(36) [u, PK]` — format `aud_{base36-timestamp}_{random}`; **no UUID default, no `updatedAt`** (canonical).
- `actorId UUID [fk→User, optional]`, `actorType ENUM: user, system, api_key`
- `action VARCHAR(100)` — canonical verb+resource codes.
- `resourceType VARCHAR(60)`, `resourceId VARCHAR(60) [optional]`
- `before JSONB [optional]`, `after JSONB [optional]` — mutated state diff.
- `ip VARCHAR(45) [optional]`, `userAgent TEXT [optional]`, `sessionId UUID [fk→Session, optional]`
- `severity ENUM: info, warning, critical [default info]`
- `retentionClass ENUM: auth, user_action, security, financial, system` — drives retention (Appendix A.5).
- `createdAt TIMESTAMPTZ` (append-only).
- `[ix] actorId+createdAt`; `[ix] resourceType+resourceId`; `[ix] action+createdAt`; `[ix] retentionClass`

### 4.17.2 `ConsentRecord`
**Purpose:** Privacy consents (GDPR-style): marketing, cookies, data processing. Owner: Data Lifecycle/Compliance.
- `id UUID [u, PK]`, `userId UUID [fk→User, optional]`, `guestEmail VARCHAR(255) [optional]`
- `consentType VARCHAR(60)`, `granted BOOLEAN`, `version VARCHAR(20)`, `grantedAt TIMESTAMPTZ`
- `revokedAt TIMESTAMPTZ [optional]`; append-only history (one row per change).
- `[ix] userId+consentType`

### 4.17.3 `DataRetentionPolicy`
**Purpose:** Versioned retention rules per class. Owner: Data Lifecycle.
- `id UUID [u, PK]`, `class ENUM: auth, user_action, security, financial, system, cms, notification, search`
- `retentionYears INT`, `anonymizeAfterYears INT [optional]` — PII **3 years** (canonical).
- `effectiveFrom DATE`, `isActive BOOLEAN`; `[u] (class, effectiveFrom)`

---

## 4.18 System Configuration

### 4.18.1 `SystemConfig`
**Purpose:** Single source for tunable platform behavior (seeded canonical values). Owner: Configuration.
- `id UUID [u, PK]`, `section VARCHAR(50)`, `key VARCHAR(80)`
- `value JSONB`, `type VARCHAR(30)` — string/int/decimal/bool/json.
- `isSecret BOOLEAN [default false]` — secret values encrypted at rest, redacted in reads.
- `isOverridable BOOLEAN [default true]`, `description TEXT [optional]`
- `version INT [default 1]`, `updatedBy UUID [fk→User, optional]`
- `[u] (section, key)`
- **Canonical seed keys (values in Appendix A.6):** `shipping.standardRate`, `shipping.expressRate`, `shipping.freeThreshold`, `finance.holdDays`, `sla.responseHours`, `sla.reviewHours`, `sla.acceptHours`, `sla.resolutionDays`, `sla.flaggedContentHours`, `cod.maxAmount`, `lowStockThreshold`, `cart.guestTtlDays`, `cart.customerTtlDays`, `search.maxResults`, `commission.platformDefault`.

### 4.18.2 `BrandingConfig`
**Purpose:** Platform/shop visual & copy config (footer text, logos, emails). Owner: Configuration.
- `shopId UUID [u, fk→Shop, optional]` — NULL = platform defaults.
- `config JSONB` — `branding.email.footerText`, logo refs, colors, support contacts.
- `version INT`, `updatedAt TIMESTAMPTZ`; `[u] (shopId)` (platform row: NULL).

---

## 4.19 Workflow / Automation

### 4.19.1 `WorkflowDefinition`
**Purpose:** Declarative automation rules (trigger → condition → actions). Owner: Automation.
- `id UUID [u, PK]`, `name VARCHAR(120)`, `trigger VARCHAR(80)` — canonical event names.
- `condition JSONB` — rule conditions; `actions JSONB` — action list (notify, status change, HTTP call).
- `isActive BOOLEAN [default true]`, `version INT [default 1]`
- `[ix] trigger+isActive`

### 4.19.2 `WorkflowExecution`
**Purpose:** Per-event workflow run. Owner: Automation.
- `id UUID [u, PK]`, `workflowDefinitionId UUID [fk→WorkflowDefinition]`
- `triggerEventId UUID [fk→EventOutbox, optional]`
- `status ENUM: pending, running, succeeded, failed, retrying [default pending]`
- `retryCount INT [default 0]`, `maxRetries INT [default 3]`
- `startedAt TIMESTAMPTZ [optional]`, `finishedAt TIMESTAMPTZ [optional]`
- `[ix] status+startedAt`

### 4.19.3 `WorkflowExecutionLog`
**Purpose:** Step-level execution trace (append-only). Owner: Automation.
- `id UUID [u, PK]`, `executionId UUID [fk→WorkflowExecution]`
- `step VARCHAR(80)`, `level ENUM: info, warn, error`, `message TEXT`, `metadata JSONB [optional]`
- `createdAt TIMESTAMPTZ`; `[ix] executionId`

### 4.19.4 `ScheduledJob`
**Purpose:** Cron-like platform jobs (sweepers: reservation expiry, cart TTL, settlement eligibility, retention). Owner: Platform.
- `id UUID [u, PK]`, `name VARCHAR(120)`, `cron VARCHAR(100)`
- `handler VARCHAR(120)`, `isActive BOOLEAN [default true]`
- `lastRunAt TIMESTAMPTZ [optional]`, `lastRunStatus ENUM: success, failure [optional]`

### 4.19.5 Job queue tables (PostgreSQL-backed durable queue; two-tier with Cloudflare Queues)
**Purpose:** Durable async execution with audit trail. Owner: Platform.
- `job_queue`: `id UUID [u, PK]`, `queue VARCHAR(50)`, `type VARCHAR(80)`, `payload JSONB`, `priority ENUM: urgent, high, normal, low, background`, `runAfter TIMESTAMPTZ [default NOW()]`, `status ENUM: queued, claimed, completed, failed, dead_lettered [default queued]`, `attempts INT [default 0]`, `maxAttempts INT` (per priority class), `availableAt TIMESTAMPTZ`, `createdAt TIMESTAMPTZ`
- `job_claimed`: `id UUID [u, PK]`, `jobId UUID [fk→job_queue]`, `workerId VARCHAR(80)`, `claimedAt TIMESTAMPTZ`, `heartbeatAt TIMESTAMPTZ`, `leasedUntil TIMESTAMPTZ`
- `job_completed`: `jobId UUID [u, PK]`, `result JSONB [optional]`, `completedAt TIMESTAMPTZ`
- `job_failed`: `id UUID [u, PK]`, `jobId UUID [fk→job_queue]`, `attempt INT`, `errorCode VARCHAR(120) [optional]`, `errorMessage TEXT`, `failedAt TIMESTAMPTZ`
- `job_dead_letter`: `jobId UUID [u, PK]`, `payload JSONB`, `failures JSONB`, `deadLetteredAt TIMESTAMPTZ`
- Retention: completed/failed rows purged after **30 days**; dead-letter reviewed, retention 90 days.

### 4.19.6 `EventOutbox`
**Purpose:** Outbox pattern — DB writes and domain events commit atomically (P11). Owner: Platform.
- `eventId UUID [u, PK]`, `eventType VARCHAR(100)`
- `aggregateType VARCHAR(50)`, `aggregateId UUID` — originating entity.
- `payload JSONB`, `headers JSONB [optional]` — tenant/context.
- `status ENUM: pending, published, failed [default pending]`
- `attempts INT [default 0]`, `lastError TEXT [optional]`, `createdAt TIMESTAMPTZ`, `publishedAt TIMESTAMPTZ [optional]`
- `[ix] status+createdAt` — publisher sweeper claim window.

---

## 4.20 Storage / Data Lifecycle

### 4.20.1 `ArchiveJob`
**Purpose:** Warm→cold archival & purge orchestrations. Owner: Data Lifecycle.
- `id UUID [u, PK]`, `type ENUM: warm_archive, cold_archive, purge, anonymize`
- `retentionClass ENUM: …(A.5)`, `status ENUM: queued, running, completed, failed [default queued]`
- `rowsProcessed INT [default 0]`, `summary JSONB [optional]`
- `startedAt TIMESTAMPTZ [optional]`, `completedAt TIMESTAMPTZ [optional]`
- `[ix] type+status`

### 4.20.2 Retention & deletion rules (operational, not a table)
- **Warm archive:** row-level `isArchived`/partition moves at retention boundary (1–7 years by class).
- **Cold archive:** file-level move to R2 cold tier (7+ years, financial/security/audit only).
- **Permanent:** never delete; cryptographic retention.
- **Recovery window:** soft-deleted rows restorable for **7 days** (canonical); hard delete requires admin approval, max **100 records** per operation (canonical).
- **PII:** anonymized after **3 years** (mask name/email/phone; keep aggregates).

---

# 5. Relationships & Aggregate Boundaries

## 5.1 Cardinality summary (relationship map)

| # | Relationship | Cardinality | Owner edge | Notes |
|---|---|---|---|---|
| R1 | User → CustomerProfile | 1:1 | Customer | PK = userId |
| R2 | User → Address | 1:N | Customer | Order snapshots, never FK at read time |
| R3 | User → Session | 1:N | IAM | Max 5 active |
| R4 | User → Cart | 1:N | SCWC | One active cart per user enforced app-side |
| R5 | User → Order | 1:N | Order | |
| R6 | User → Review/Question | 1:N | Feedback | One review per product per user |
| R7 | Shop → Product | 1:N | Product | |
| R8 | Shop → ShopOwner | 1:N | Shop | |
| R9 | Shop → PayoutAccount | 1:N | Shop | One default |
| R10 | Shop → Settlement/Payout | 1:N | Finance | |
| R11 | Category → Category (parent) | 1:N self | Catalog | Depth ≤ 4 |
| R12 | Category → Product | M:N | Catalog | Via ProductCategory; one primary |
| R13 | Product → Variant | 1:N | Product/Variant | Variant inherits product defaults |
| R14 | Product → AttributeValue | M:N | Catalog | Via VariantAttribute |
| R15 | Variant → StockReservation | 1:N | Inventory | Expires 15 min |
| R16 | Variant → CartItem / WishlistItem / OrderItem | 1:N | SCWC/Order | OrderItem snapshot fields |
| R17 | Cart → CartItem | 1:N (cascade) | SCWC | Cascade delete allowed |
| R18 | Cart → CheckoutSession | 1:N | SCWC | One active session |
| R19 | Order → OrderItem | 1:N (restrict) | Order | Never cascade-deleted |
| R20 | Order → OrderStatusHistory | 1:N | Order | Append-only |
| R21 | Order → OrderAddress | 1:2 | Order | billing+shipping |
| R22 | Order → PaymentIntent | 1:N | Payments | Multiple intents on retry; one active |
| R23 | Order → Shipment | 1:N | Logistics | Partial shipments |
| R24 | Order → FinanceRecord | 1:N | Finance | Created at confirmation |
| R25 | Order → ReturnRequest | 1:N | Resolution | RMA within 7-day window |
| R26 | Order → Invoice | 1:1 (unique) | Finance | INV-YYYY-NNNNNN |
| R27 | PaymentIntent → PaymentTransaction | 1:N | Payments | Append-only |
| R28 | PaymentIntent → PaymentRefund | 1:N | Payments | |
| R29 | Shipment → ShipmentEvent/ShipmentItem/DeliveryAttempt/PickupTask | 1:N | Logistics | |
| R30 | FinanceRecord → LedgerEntry | 1:N | Finance | Double-entry, sums to zero |
| R31 | Settlement → SettlementItem | 1:N | Finance | |
| R32 | Settlement → FinancialHold | 1:1 | Finance | 7-day hold |
| R33 | ReturnRequest → ReturnItem | 1:N | Resolution | |
| R34 | ReturnRequest → ResolutionConversation | 1:N | Resolution | SLA-tracked |
| R35 | Product → Review/RatingAggregate | 1:N / 1:1 | Feedback | Aggregate derived |
| R36 | Product → SearchDocument | 1:1 | Search | Derived index |
| R37 | Media → (products/cms/reviews/docs) | N:1 polymorphic | Storage | Via link tables or entityType/entityId |
| R38 | CmsContent → CmsContentVersion | 1:N | CMS | Versioned |
| R39 | Homepage → HomepageSection | 1:N | Homepage | Ordered sections |
| R40 | NavigationMenu → NavigationItem | 1:N (self-nest) | Navigation | |
| R41 | Notification → NotificationDelivery | 1:N | Communication | Retry-per-class |
| R42 | Conversation → ConversationMessage/Participant | 1:N | Communication | Permanent |
| R43 | Document → DocumentVersion | 1:N | Documents | Re-issues |
| R44 | User → AuditLog | 1:N | Audit | Actor |
| R45 | WorkflowDefinition → WorkflowExecution → Log | 1:N → 1:N | Automation | |
| R46 | EventOutbox → (all modules) | 1:N | Platform | Publisher claim |
| R47 | PaymentRefund → ReturnRequest | N:1 optional | Payments | Resolution linkage |

## 5.2 Aggregate boundaries (transaction/scoping units)

**Aggregates are the only units that may be read/written atomically. Cross-aggregate consistency is achieved through the outbox, not distributed transactions.**

| Aggregate root | Members | Reason for boundary |
|---|---|---|
| **User** | User, CustomerProfile, CustomerPreference, Address (root-owned subset), ConsentRecord | Identity consistency; profile changes are personal-scoped |
| **Session** | Session, RefreshTokenRotation, TrustDevice, LoginAttempt | Security coherence; rotation atomicity |
| **Shop** | Shop, ShopOwner, StaffInvitation, ShopSetting, PayoutAccount | Seller operations are shop-atomic; staff permissions consistent |
| **Product** | Product, Category links, ProductMedia, Attribute assignments, Variant, VariantAttribute | Catalog publish/unpublish must be variant-consistent (published ⇒ ≥1 published variant) |
| **Inventory** | VariantStock ledger, StockReservation | Reservation + movement updates must be atomic; the only place `availableStock` changes |
| **Cart** | Cart, CartItem | Conversion atomicity |
| **Order** | Order, OrderItem, OrderStatusHistory, OrderAddress, CancellationRequest, TaxBreakdown | Order facts immutable; status transitions atomic |
| **Payment** | PaymentIntent, PaymentTransaction, PaymentRefund, CodOrder | Gateway idempotency; refunds atomic |
| **Shipment** | Shipment, ShipmentEvent, ShipmentItem, DeliveryAttempt, PickupTask | Carrier transitions atomic; timeline consistent |
| **Finance** | FinanceRecord, LedgerEntry, Settlement, SettlementItem, CommissionRate (read), Payout (reference), FinancialHold, Invoice | Double-entry balance atomic; settlement lifecycle immutable |
| **Resolution** | ReturnRequest, ReturnItem, ResolutionConversation, ResolutionMessage | SLA tracking consistent |
| **Feedback** | Review, ReviewMedia, ReviewHelpfulness, Question, QuestionAnswer, QuestionVote, RatingAggregate | Moderation transitions atomic |
| **Content** | CmsContent, CmsContentVersion, CmsBlock | Publish = version freeze |
| **Homepage** | Homepage, HomepageSection | Live publish atomic |
| **Communication** | Notification (+deliveries), Conversation (+messages/participants) | Delivery retries consistent |
| **Document** | Document, DocumentVersion | Issue/re-issue immutable |
| **Workflow** | WorkflowDefinition, WorkflowExecution, WorkflowExecutionLog | Run lifecycle consistent |
| **Platform jobs** | job_queue + claimed/completed/failed/DLQ + EventOutbox | Claim/handoff atomic; outbox = exactly-once |

**Boundary rules:**
1. Cross-aggregate reads are joins allowed only on FK edges in §5.1.
2. Cross-aggregate writes happen via (a) outbox events consumed by the owning module, or (b) an owning module's public write API — never direct foreign writes.
3. The Order ↔ Finance and Order ↔ Inventory edges are strictly event-driven (order confirmed → finance record; payment initiated → reservation consume/release).

## 5.3 Deletion semantics (ON DELETE)

| Behavior | Applied to | Rationale |
|---|---|---|
| `RESTRICT` | OrderItem←Order; LedgerEntry←FinanceRecord; ShipmentEvent←Shipment; messages/history | Financial/factual rows cannot be orphaned |
| `CASCADE` | CartItem←Cart; WishlistItem←Wishlist; HomepageSection←Homepage; WorkflowExecutionLog←Execution (retention-purge only) | Ephemeral containers own their lines |
| `SET NULL` | Media.link refs (entityType/entityId), optional contextual FKs (orderId on Shipment refs), staff self-reference | Non-essential context |
| Soft delete only | Products, Variants, Categories, Content, Notifications (by policy), Conversations (never) | History/SEO/compliance value; restorable 7 days |

---

# 6. Data Integrity

### 6.1 Universal invariants
1. All monetary columns `DECIMAL(10,2)`; currency snapshot present wherever money is stored cross-entity.
2. `grandTotal = subtotal − discountTotal + shippingFee + codFee + taxTotal` — enforced at insert (trigger), recalculated only by Order Management service.
3. `availableStock = stock − Σ(active reservations)` — a view `variant_availability` is the **only** truth read by checkout; all mutations go through the inventory aggregate.
4. Published product invariant: `status='published' ⇒ salePrice NOT NULL AND EXISTS(published variant)`.
5. Settlement per order is unique (`orderId` unique) — a second settlement requires a `REVERSED` chain (append-only).
6. Every `FinanceRecord` has ledger entries summing to zero.
7. Locale values are drawn from the canonical set `{en-IN, bn-IN, hi-IN}`; currency `{INR}` (display-only others).
8. Session count ≤ 5 active per user; OTP attempts ≤ 5; cart quantity 1–99; review rating 1–5.

### 6.2 Check constraints (canonical list)
- `price ≥ 0` on all money columns that are amounts (not rates).
- `compareAtPrice ≥ salePrice OR compareAtPrice IS NULL` (product & variant).
- Commission rates: `10.00 ≤ rate ≤ 50.00`.
- `quantity > 0` on OrderItem, ReturnItem, CartItem, ShipmentItem, StockReservation.
- SKU display: length 1–50, pattern `^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$`.
- Order number pattern `^NAB-\d{8}-\d{6}$`; invoice `^INV-\d{4}-\d{6}$`.
- Cart/user mutual presence: `userId OR guestToken` required.
- GSTIN: 15-char validated format (UI-validated, DB pattern-checked).

### 6.3 Unique constraints (canonical list)
- `User.email` (case-insensitive), `User.phone` (nullable), `Role.name`, `Permission.code`.
- `Shop.slug`, `Category` (parentId, slug), `Product.slug`, `Attribute.code`, `AttributeValue` (attributeId, value), `AttributeValue` (attributeId, shortCode).
- `Variant.skuDisplay`, `Variant.skuInternal`, `Variant.barcode`.
- `Order.orderNumber`, `PaymentTransaction.idempotencyKey`, `PaymentIntent.idempotencyKey`, `Settlement.orderId`, `Settlement.settlementId`, `Payout.batchReference`, `Invoice.invoiceNumber`, `Document.documentNumber`, `SearchDocument.productId`, `ShippingRate.name`, `Media.objectKey`.
- Partial uniques: default shipping/billing address per user, primary category per product, primary variant per product, primary media per product, default payout account per shop, one review per user per product (non-rejected), (userId, consentType) consent.

### 6.4 Application-layer validations the DB enforces via JSONB schema
- `Product.meta` — Zod schema (CC-14): allowed keys only (material, care, origin, brand); no pricing/status/identifiers.
- CMS payloads (`CmsBlock.content`, `HomepageSection.content`) — per-type Zod schemas.
- `WorkflowDefinition.condition/actions`, `SystemConfig.value` — per-type schemas.
- Filter config JSONB (`filters[] {id, type, source, display, multiSelect, currency, minRating}`) — canonical shape.

---

# 7. Transaction Strategy

### 7.1 Atomic units
- **Write transaction scope = aggregate (per §5.2).** No transaction spans two aggregates.
- Default isolation: **Read Committed**; read-only replicas serve reads (see §10.2).
- `SERIALIZABLE` (or optimistic versioning) only where noted: settlement eligibility checks, commission rate overlapping ranges, session-count enforcement.

### 7.2 Reservation semantics (Inventory aggregate)
1. Checkout reads `variant_availability` (consistent snapshot).
2. At payment initiation, a single transaction inserts `StockReservation` rows (status `active`, `expiresAt = NOW()+15min`) and writes the inventory ledger delta (`reservation` type). Failure to reserve any line aborts the whole cart reservation (all-or-nothing).
3. Order placement consumes reservations (status `consumed`) within the same Order aggregate transaction, decrementing stock.
4. Sweeper (`ScheduledJob`) releases expired reservations: status → `expired`, ledger `expiry` entries — batched, idempotent.

### 7.3 Payment & refund idempotency
- Every gateway call carries `idempotencyKey`; unique index prevents double-charge.
- Refund creation is guarded by `(paymentIntentId, amount, returnRequestId)` uniqueness; retries reuse the same row.
- COD: no authorization; `CodOrder` transitions drive settlement eligibility.

### 7.4 Outbox pattern (exactly-once effects)
- Every aggregate transaction that must emit a domain event inserts into `EventOutbox` **in the same DB transaction**.
- Publisher sweeper claims `pending` events (atomic update with lease), publishes, marks `published`; failures retry with capped attempts → DLQ.
- Consumers are idempotent (process event by `eventId`; unique index on consumer-processing table or `DISTINCT ON`).

### 7.5 Job durability
- Jobs enqueue atomically with the triggering transaction (same DB), then claim/lease via `job_claimed` (heartbeat renews lease; stale leases reclaimed).
- Priority classes map to retry policies (Appendix A.4) and separate worker pools (urgent/high vs rest).

### 7.6 Concurrency notes
- Optimistic concurrency (`updatedAt` or `version` check) on: `SystemConfig` (version), `ShopSetting`, `CmsContent` (versioned), `HomepageSection`.
- Status transition guards are **compare-and-swap style**: `UPDATE ... WHERE id=? AND status=?`; failed CAS means the state moved — read fresh state and re-apply business rule (state machine enforced in OrderStatusHistory + service).

---

# 8. Soft Delete & Archive Strategy

### 8.1 Soft delete mechanics
- Mutable business entities carry `isActive` (or `isDeleted` for non-active-first tables); default `true`.
- All production reads filter `isActive = true` by default (RLS policy + query defaults); audit/compliance joins bypass via dedicated role.
- `deletedAt TIMESTAMPTZ [optional]` set by the same update; **7-day recovery window** (canonical) — restore permitted by admins within window; after window, rows eligible for archival/hard-purge per class.
- Rationale: SEO integrity (products), invoice/order history, compliance, accidental-deletion recovery.

### 8.2 What is never soft-deleted and why
- Append-only facts (AuditLog, OrderStatusHistory, ShipmentEvent, LedgerEntry, PaymentTransaction, ConversationMessage, ResolutionMessage, FinanceRecord, Settlement) — corrections are new rows.
- Conversations: permanent by policy.
- Financial/tax/security/audit data: archived, never removed.

### 8.3 Retention classes (canonical)

| Class | Entities | Retention | Action at boundary |
|---|---|---|---|
| `auth` | Session, AuthChallenge, TrustDevice, RefreshTokenRotation, LoginAttempt | 3 years | Archive → anonymize |
| `user_action` | AuditLog user actions, carts (guest 90d), notifications (in-app 90d) | 2 years | Archive → anonymize |
| `security` | SecurityEvent, AuditLog security class, ApiKey, PaymentMethod metadata | 5 years | Cold archive |
| `financial` | Order, OrderItem, FinanceRecord, LedgerEntry, Settlement, Invoice, Document (financial), TaxBreakdown, Payment* | 7 years | Cold archive (R2); never delete |
| `system` | AuditLog system, job logs, workflow logs, search index remnants | 1 year | Purge |
| `content` | CMS rows, media, reviews | 2 years after archival | Cold archive |
| `notification` | In-app notifications | 90 days | Hard delete (ephemeral by design) |
| `search` | SearchAnalytics | 30 days anonymized | Anonymize |

### 8.4 Lifecycle pipeline (Data Lifecycle Engine)
- **Active** → **Warm Archive** (row-level, partition move or archive table at retention boundary, 1–7 y) → **Cold Archive** (R2, files + JSON export, 7+ y) → **Permanent** (never delete).
- Each transition is an `ArchiveJob` with batch limits, resumability, and audit logging.
- Hard delete is an exception: admin approval, ≤ 100 records/op, only for ephemeral classes; never for financial/tax/security/audit.
- PII (name, email, phone on User/Address/OrderAddress snapshots) anonymized at 3 years: masked values replace originals in warm/cold copies; aggregates preserved.

---

# 9. Indexing Standards

> Implementation conventions follow `DATABASE_ARCHITECTURE.md` §21/§27. This section defines the **contractual index set**; physical tuning is implementation detail.

### 9.1 Universal rules
1. Every FK column is indexed (hard rule).
2. Every `[u]` unique constraint implies an index (unique B-tree).
3. Status+createdAt composite indexes on append-only tables (history scans).
4. No function-based indexes unless the query pattern is proven (e.g., `lower(email)`, trgm).
5. JSONB indexes only via expression/GIN for proven query patterns; no generic btree-on-JSONB.
6. Partial indexes preferred over full-column indexes for status filters (`WHERE status='active'`).

### 9.2 Canonical index catalog (contract)

| Table | Index | Type | Serves |
|---|---|---|---|
| SearchDocument | (name) GIN `gin_trgm_ops` | GIN | Fuzzy/typo search |
| SearchDocument | (searchVector) | GIN | Full-text |
| SearchDocument | (price), (categoryName), (productId unique) | BTREE | Facets, cursor pagination |
| AuditLog | (actorId, createdAt), (resourceType, resourceId), (action, createdAt), (retentionClass) | BTREE | Audit queries |
| Order | (userId, placedAt), (shopId, status), (orderNumber unique), (status) | BTREE | Customer/admin views |
| OrderStatusHistory | (orderId, createdAt), (toStatus, createdAt) | BTREE | Timeline, funnel analytics |
| StockReservation | (variantId, status), (orderId), (expiresAt partial active) | BTREE/partial | Reservation sweeper |
| Variant | (productId, isActive), (skuDisplay unique), (barcode unique) | BTREE | Catalog, admin |
| Cart | (userId, status), (guestToken unique), (expiresAt partial active) | BTREE/partial | TTL sweeper |
| Shipment | (orderId), (status), (trackingNumber unique) | BTREE | Logistics ops |
| EventOutbox | (status, createdAt) | BTREE | Publisher claim |
| job_queue | (status, runAfter), (queue, status) | BTREE | Worker claim |
| Notification | (userId, createdAt), (status), (type) | BTREE | Inbox, sweepers |
| Settlement | (status), (payoutId), (orderId unique) | BTREE | Payout cycles |
| Search-ready text columns | (nameNormalized) on Product/Category | GIN trgm | Admin search |
| Category | (parentId), (slug) | BTREE | Tree traversal |

### 9.3 Full-text readiness
- `SearchDocument.searchVector` maintained by the Search Engine on write (trigger/service); document-level tsvector on CmsContent (title/body) for page search (Phase 2 activation).
- Analyzer: simple + lowercase + custom stopword list (English); Bengali/Hindi analyzers deferred to Phase 2 (documented).
- Migration path (canonical): PostgreSQL + pg_trgm (MVP) → dedicated engine (Meilisearch/Typesense class, Phase 2) → vector (AI search, Phase 3). The index table contract is stable across all phases; `SearchDocument` remains the read interface.

### 9.4 Query optimization guardrails
- Cursor pagination (`WHERE id > $cursor ORDER BY id LIMIT n`) on all list endpoints; no `OFFSET` beyond page 1.
- Facet computation via grouped aggregates with LIMIT (max 20).
- Dashboard/BI queries read materialized views; KV cache TTLs (5 min dashboard, 1 min search results, 5 min autocomplete).
- `EXPLAIN` review mandatory for any new join on catalog/commerce/finance tables (per `ENGINEERING_HANDBOOK.md`).

---

# 10. Performance

### 10.1 Workload profile
- Read-heavy storefront (product browse/search/cart reads) vs write-heavy commerce pipeline (orders, inventory, payments) vs near-write-only analytics (audit, events).
- Target p95: catalog reads < 50 ms; order placement < 500 ms end-to-end; reservation round-trip < 200 ms; search < 150 ms; dashboard queries < 2 s (via aggregates).

### 10.2 Read scaling
- Primary for writes; **read replicas** for storefront/search/dashboard read paths (implementation detail; contract: reads may not require session-visible write-after-read within 50 ms — enforce via primary-read flags where needed, e.g., post-checkout cart refresh).
- BI materialized views refreshed off-peak (daily default; configurable via `ScheduledJob`).
- KV caching layers: autocomplete 5 min, search results 1 min, home/storefront fragments 15 min (canonical TTLs).

### 10.3 Write optimization
- Writes are batched where aggregate-safe: status history inserts batch with status CAS; inventory ledger + reservation in one statement/transaction; outbox insert in same tx.
- Index budget discipline: contract indexes only (§9.2); add indexes only with measured need.
- Append-only tables use minimal secondary indexes (time-bucketed queries served by (id/createdAt) ranges).
- Job/outbox tables partitioned by time (rolling retention partitions) — implementation detail, partition-ready design required from day 1.

### 10.4 Partition readiness (contract)
- Partition-ready candidates: `AuditLog`, `EventOutbox`, `job_queue*`, `OrderStatusHistory`, `ShipmentEvent`, `LedgerEntry`, `PaymentTransaction`, `Notification` (by month, range-partitioned on createdAt).
- Partitioning is **required** for tables projected > 50M rows within 3 years (AuditLog, EventOutbox, job history) — design tables partition-ready now (all range queries carry createdAt bounds).
- Archived data moves to archive partitions/tables (not deleted) — keeps hot partitions small.

### 10.5 Table size budget guidance
- Hot tables targeted < 10M rows (catalog, orders active window); large tables are append-only (audit, events, ledger) or derived (SearchDocument ~1× published products).
- Derived aggregates (`RatingAggregate`, `CustomerStats`, BI views) keep heavy scans off hot tables.

---

# 11. Migration Strategy

### 11.1 Principles
1. **Forward-compatible, backward-safe:** every migration must allow rollback (down migration provided) and must not break the previous release's reads/writes during deploy (expand-migrate-contract, emc style).
2. **Schema migrations are versioned & sequential**; zero mutable history (no editing of applied migrations).
3. Migration to production requires: automated test run (CI), review approval, and execution during low-traffic windows; no destructive change without documented data audit.
4. All migrations are transactional where the engine allows; data-heavy migrations run as batched idempotent jobs (never a single multi-hour lock).
5. **No ORM-generated migrations as the sole source of truth** — versioned migrations authored per this contract, then mirrored into the ORM schema.

### 11.2 Phases
- **Phase 0 — Baseline:** empty migration creating all schemas (identity/catalog/commerce/payments/logistics/finance/resolution/feedback/content/communication/documents/search/reporting/audit/platform), universal columns, enums (as canonical status strings or enum types), all tables with contract constraints and indexes.
- **Phase 1 — Seed:** canonical rows: Roles (5), Permission catalog, seed Attributes (size, color) + common values, SystemConfig canonical keys, ShippingRate defaults, commission default, SLA defaults, DataRetentionPolicy rows, Navigation defaults, document type registry.
- **Phase 2 — Incremental feature migrations:** every future change is a new migration: entity add → column add (nullable or defaulted first) → backfill job → constraint/index add → code release (expand), then remove deprecated columns in a later migration (contract).
- **Phase 3 — Refactor/scale:** partition conversions, read-replica wiring, index consolidation — executed only with validation queries and rollback plans.

### 11.3 Backward compatibility contract
- Removing a column: two-release rule — mark deprecated (release N), stop writes (N+1), drop (N+2) after verification.
- Renaming: add new column + backfill + dual-write + switch reads + drop old.
- Enum/status additions: additive only; removal requires code-versioned deprecation (values stay valid in history rows).
- Soft-delete vs hard-delete migrations: never a migration that hard-deletes rows that audit/retention requires.

### 11.4 Production safety
- Every migration ships with: rollback script, estimated affected rows, verification query, and owner sign-off (owner module accountable).
- Data backfills are idempotent jobs (job_queue) with checkpoints; re-runnable.
- Migration status visible in CI pipeline; failed migration auto-rollback and alert.
- Row-level locking during index creation where online DDL is unavailable; maintenance windows for the heaviest indexes.

### 11.5 Rollback strategy
- Down migrations restore previous contract (add back columns with defaults; drop only additive structures).
- Data rollbacks for idempotent writes are achieved by replaying the inverse ledger/outbox events (system of record), not by schema gymnastics.

---

# 12. Naming Standards

> Full normative reference: `IDENTITY_NAMING_ARCHITECTURE.md`; the contract-level standards:

1. **Tables:** PascalCase singular entity names (`Order`, `OrderItem`, `PaymentIntent`).
2. **Columns:** camelCase (`createdAt`, `grandTotal`, `skuDisplay`).
3. **Constants/enums:** SCREAMING_SNAKE for values (`PENDING`, `COMPLETED`); canonical status string sets in Appendix A are case-sensitive and immutable.
4. **Indexes:** `idx_{table}_{columns}`; unique: `uk_{table}_{columns}`; FK: `fk_{table}_{column}` (lowercase table/column, snake).
5. **Business identifiers:** prefixed per type — `NAB-` orders, `INV-` invoices, `RET-` RMAs, `FIN-` finance records, `aud_` audit ids.
6. **JSONB keys:** camelCase, documented in the owning module's schema.
7. **Money columns:** suffix `Amount`/`Total`/`Rate` for amounts, `Price` for per-unit; companion `Currency` column where ambiguity possible.
8. **Timestamps:** `createdAt`, `updatedAt`, `{event}At` (`placedAt`, `deliveredAt`); append-only tables: only `createdAt`/`{event}At`.
9. **Status columns:** `status` for state machines, `{entity}Status` where disambiguation needed; soft-delete flag `isActive`/`isDeleted` + `deletedAt`.
10. **FK to polymorphic refs:** `{entityType}, {entityId}` pair pattern only in Media; elsewhere, explicit link tables.
11. **Locale-aware text:** `{field} JSONB` localized with canonical keys `en-IN`, `bn-IN`, `hi-IN`.

---

# 13. Implementation Guidelines

### 13.1 Binding rules for implementers
1. Implement exactly the entity catalog in §4; no entity outside this catalog may be introduced without a new spec revision (owner module + architecture sign-off).
2. Canonical status/enum values (Appendix A) are immutable — no spelling variants, no additions without versioning.
3. All writes flow through the owning module's service layer; RLS enforces read scope (`customer reads own data; seller reads own shop; admin reads all; audit reads via auditor role only`).
4. The audit schema is accessed only by services with the restricted credential; `AuditLog` writes are non-negotiable for every mutation listed in `AUDIT_COMPLIANCE_ENGINE_ARCHITECTURE.md`.
5. No direct table access from frontends; no ORM raw-queries bypassing the migration contract.
6. Money arithmetic in code uses integer-paise or decimal types; floats are forbidden.
7. Every JSONB column has a versioned application-level schema validated on write and read.
8. Outbox events are the only inter-module effect channel; direct cross-aggregate writes are a design defect (review gate).
9. Search consumers read `SearchDocument` only; product tables are never queried by search at request time.
10. New status transitions must update both `Order.status` and `OrderStatusHistory` and the customer-visible mapping atomically.
11. All bulk operations (imports, backfills, exports, archives) execute as `job_queue` jobs with checkpoints; no unbounded transactions.
12. Deploy gates: lint + unit + integration + migration CI; performance budget checks for new indexes/queries (§9.4, §10.1).

### 13.2 Deliverable artifacts
- This specification → entity catalog + relationship map + naming standards + migration strategy (the contract).
- `DATABASE_ARCHITECTURE.md` → implementation standards (Prisma conventions, schema organization, soft-delete mechanics, search indexing).
- Owner modules produce: per-entity field specs (already captured in module docs), JSONB schemas (Zod), and outbox event catalogs.

---

# Appendix A — Canonical Value Sets (normative)

### A.1 Order status — 18 canonical states (`Order.status`)
`pending`, `confirmed`, `processing`, `accepted`, `rejected`, `packing`, `ready_to_ship`, `shipped`, `in_transit`, `delivered`, `completed`, `cancelled`, `failed`, `returned`, `refunded`, `archived`, `failed_delivery`, `held`

**Customer-visible mapping (UX-11, binding):**

| Order.status | customerVisibleStatus |
|---|---|
| pending | pending |
| confirmed | confirmed |
| processing | processing |
| accepted | processing |
| packing | packing |
| ready_to_ship | packing |
| shipped | shipped |
| in_transit | shipped |
| delivered | delivered |
| completed | completed |
| cancelled | cancelled |
| failed | cancelled |
| returned | returned |
| refunded | refunded |
| archived | completed |
| failed_delivery | cancelled |
| held | processing |

### A.2 Shipment status — 12 canonical states
`shipment_created`, `ready_to_pack`, `packed`, `ready_for_pickup`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `closed`, `delivery_failed`, `exception`, `returned_to_sender`

### A.3 Document type registry (prefixes)
`INV` (invoice), `ORD` (order), `PKS` (packing slip), `RET` (RMA), `RFD` (refund), `STL` (settlement), `FIN` (finance), `EXP` (export), `AUD` (audit), `CST` (consent), `SST` (statement), `CUS` (custom), `PRC` (price list), `SHL` (shipping label), `CRT` (certificate). Numbering: `INV-YYYY-NNNNNN`; others `{PREFIX}-{YYYY}-{NNNNNN}` unless documented otherwise.

### A.4 Notification retry policy (per priority)
`urgent` 5 attempts @1 s · `high` 3 @2 s · `normal` 3 @5 s · `low` 2 linear · `background` 1. Exhaustion → dead-letter.

### A.5 Audit retention classes
`auth` 3y · `user_action` 2y · `security` 5y · `financial` 7y · `system` 1y. Financial/security/audit: never hard-deleted.

### A.6 Canonical SystemConfig seed values
`shipping.standardRate = 99` · `shipping.expressRate = 199` · `shipping.freeThreshold = 999` · `finance.holdDays = 7` · `sla.responseHours = 24` · `sla.reviewHours = 48` · `sla.acceptHours = 48` · `sla.resolutionDays = 7` · `sla.flaggedContentHours = 4` · `cod.maxAmount = 5000` · `lowStockThreshold = 10` · `cart.guestTtlDays = 7` · `cart.customerTtlDays = 90` · `search.maxResults = 50` · `commission.platformDefault = 15` (cap 10–50).

### A.7 Inventory status derivation (not stored)
`In Stock` (availableStock > threshold) · `Low Stock` (1 ≤ availableStock ≤ threshold) · `Last Few` (availableStock = 1) · `Out of Stock` (availableStock ≤ 0) · `Discontinued` (variant inactive). Derived from `variant_availability`; not a stored column.

---

*End of Database Specification v1.0. This document is the consolidated, conflict-resolved contract. Any future schema change requires an amendment to this document with the owning module's sign-off.*
