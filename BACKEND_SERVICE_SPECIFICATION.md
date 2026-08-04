# নবME (Nabome) Commerce OS — Backend Service Specification

**Version:** 1.0 · **Date:** August 03, 2026 · **Status:** Approved for implementation planning
**Priority:** Active — all backend developers and AI coding agents must follow this document
**Supersedes:** None — complements `MASTER_ARCHITECTURE_BLUEPRINT.md` (v1.0), `DATABASE_SPECIFICATION.md` (v1.0), `API_SERVICE_ARCHITECTURE.md`, `API_INTEGRATION_ARCHITECTURE.md`, `ENGINEERING_HANDBOOK.md`, and the 44 module architecture documents.
**Authority:** Derived from the Master Architecture Blueprint (Prompts 01–44) and the approved module architecture documents. It converts the blueprint's consolidated architecture and canonical resolutions into the binding backend implementation contract: service boundaries, module interfaces, business-logic ownership, transactions, validation, error handling, communication, and implementation standards.
**Companion documents:** `DATABASE_SPECIFICATION.md` is the authoritative entity/relationship/migration contract (every service reads and writes only the tables it owns there). `API_SERVICE_ARCHITECTURE.md` / `API_INTEGRATION_ARCHITECTURE.md` remain the reference for API delivery standards. `AUTOMATION_WORKFLOW_ENGINE_ARCHITECTURE.md` Appendix A is the canonical event registry.

> **Rule of precedence:** Where any module document conflicts with the Master Architecture Blueprint, the Blueprint's canonical resolution (Sections 4, 5, 6, 7, Appendix B) wins — and is quoted here verbatim where it binds a service. Where this specification conflicts with any module document, this specification wins (it is the consolidated, conflict-resolved backend contract). Where this specification is silent, the owning module document and `ENGINEERING_HANDBOOK.md` apply. No task prompt may waive any rule in this specification (GOVERNANCE_CONSTITUTION §2.3).

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Backend Philosophy](#2-backend-philosophy)
3. [Module Architecture & Service Boundaries](#3-module-architecture--service-boundaries)
4. [Dependency Direction & Rules](#4-dependency-direction--rules)
5. [Layer Responsibilities](#5-layer-responsibilities)
6. [Transaction Strategy](#6-transaction-strategy)
7. [Validation Layers](#7-validation-layers)
8. [Service Catalog](#8-service-catalog)
9. [Business Logic Ownership](#9-business-logic-ownership)
10. [Module Communication](#10-module-communication)
11. [Error Handling](#11-error-handling)
12. [Performance](#12-performance)
13. [Security](#13-security)
14. [Testability](#14-testability)
15. [Backend Implementation Standards](#15-backend-implementation-standards)
16. [References & Binding Sources](#16-references--binding-sources)

---

# 1. Purpose & Scope

This document is the **complete production-ready backend service specification** for নবME (Nabome) Commerce OS. It defines:

1. **Backend philosophy** — the principles that govern every backend module.
2. **Module architecture & service boundaries** — the 30-service catalog, one business responsibility per service, boundary rules.
3. **Dependency direction** — the binding dependency graph and rules (Blueprint §7.2).
4. **Layer responsibilities** — what controllers, services, and data layers may and may not do.
5. **Transaction strategy** — atomic boundaries, rollback, retry, compensation, consistency (Blueprint §6 + per-service rules).
6. **Validation layers** — the five-layer validation model.
7. **Service catalog** — per service: Responsibility, Inputs, Outputs, Dependencies, Events, Transactions, Validation, Error cases, Performance notes, Security notes.
8. **Business logic ownership** — who owns business rules, calculations, state transitions, authorization, workflow decisions, and event publishing.
9. **Module communication** — synchronous and asynchronous contracts, dependency rules, failure handling.
10. **Error handling** — the error taxonomy, canonical envelope, error registry, logging strategy.
11. **Performance** — caching, background jobs, batch processing, queues, lazy loading, optimization strategy.
12. **Security** — authorization, sensitive operations, audit integration, data protection, secure service communication.
13. **Testability** — unit boundaries, mocking strategy, integration and contract testing readiness.

**Out of scope (by instruction):** no production code, no programming-language selection, no framework selection, no architecture redesign. All references to a concrete stack (Cloudflare Pages Functions, Prisma, PostgreSQL, Cloudflare Queues, R2, KV, Supabase, Razorpay, Resend) are citations of the approved `TECH_STACK.md` / `ARCHITECTURE.md` foundations, not new choices.

**Hard constraints honored from the Blueprint:**

- The architecture does not change; the backend serves the approved architecture.
- One business responsibility per service; no duplicated business logic; business logic never lives in controllers or APIs.
- Modules communicate through defined interfaces; cross-module behavior is event-driven (Blueprint §7.2.3).
- Backend architecture remains independent from the UI; all 44 documents' canonical resolutions apply (Appendix B of the Blueprint is binding).
- The design targets enterprise scale: 0 → 1M+ users, T0 path integrity (auth, payments, checkout, orders, refunds, settlements), audit-grade compliance (GST/RBI/IT Act, PCI DSS readiness), retention discipline.

---

# 2. Backend Philosophy

The following principles are normative. Every design decision in this specification traces to one of them.

### B1 — One service, one business responsibility
Every service owns exactly one domain of business logic. A service is a cohesive set of domain functions in `api/_lib/{domain}/` plus its API handlers in `api/_handlers/{domain}/`. Responsibility boundaries are registered in §3.2; any code that implements another service's responsibility is a defect.

### B2 — Business logic lives in the service layer, never in handlers
API handlers (controllers) perform: authentication/authorization enforcement, rate limiting, input validation against the shared schema, calling the service, envelope formatting, error mapping. They never implement business rules, calculations, or state transitions (Blueprint mandatory rule 9; PAYMENT §1.11 independence rule).

### B3 — One owner per domain; no duplicated logic
Each business domain (product, order, payment, finance, inventory, document, …) has exactly one owning service. Other services read through the owner's public read interfaces and receive facts through events. Finance records are written by the Finance service, never by payment handlers (Blueprint G.13). Documents are generated by the Document service, never by business modules (Blueprint PS-04). Money is processed by the Payment service only.

### B4 — Loose coupling, high cohesion, event-driven boundaries
Cross-module behavior is event-driven through the outbox (Blueprint §7.2.3, DI-01). Direct synchronous calls are permitted only: (a) inside one domain, (b) through an owner-registered read/transaction module API (§10.2), (c) for cross-cutting platform libraries (auth, errors, events, queue, logging, config, storage, validation). No module calls another module's business code directly.

### B5 — The database is the source of truth; caches and indexes are derived
Read caches (KV), search index, and BI materialized views are derived, rebuildable artifacts — never the authority. `availableStock = stock − reservedStock` is the only availability truth (Blueprint CC-07). Money is `DECIMAL(10,2)` INR, never float; paise conversion happens only at the gateway adapter boundary (Blueprint 2.3.1, B.7). Time is `TIMESTAMPTZ` UTC; UUID v4 primary keys; display IDs are business identifiers only (Blueprint B.7).

### B6 — Facts are append-only; state changes are transitions
Anything that is a fact — order status history, shipment events, finance records, audit entries, refund records, conversations, inventory movements — is insert-only, immutable, and ordered. Corrections are new rows with a reason; never in-place edits (DATABASE_SPECIFICATION P7, Blueprint §6.5).

### B7 — State machines are canonical and never improvised
All status enums are transitioned exclusively through the canonical registries (Blueprint Appendix B and §5.3): Order (18 states), Order payment sub-status, Payment, Refund, Settlement, Shipment (12 states), Product, Inventory status bands, CMS lifecycle, Resolution lifecycle. Any new state must be added to the registry, not to a flow (Blueprint §9.4.2).

### B8 — Exactly-once effects via idempotency, outbox, and unique constraints
Every money-moving, order-affecting, webhook-handled, notification-sent, and settlement-triggering operation carries an idempotency key and/or unique business identifier. DB writes and outgoing events commit in the same transaction (event outbox). Retries are safe by construction.

### B9 — Default-deny security, enforced server-side
Authorization is default-deny, additive role hierarchy (Guest 0 → Customer 10 → Shop Owner 20 → Admin 30 → System 100), permissions `{scope}:{resource}:{action}`, enforced on the server for every request, never only in the UI (Blueprint IS-01, B.8). RLS isolates tenants; PII is masked per role (shop owners see only masked customer address data).

### B10 — Retention is class-based and deletion is constrained
Every service enforces retention via the Data Lifecycle service policies (Blueprint B.9, PS-01/03/10): financial/audit/legal records are archived, never hard-deleted (7 years minimum); soft-delete first with a 7-day recovery window; hard delete ≤ 100 records with admin approval. Cleanup jobs key off the AUDIT §8.3 class table.

### B11 — Performance budgets are contracts
Services meet the approved budgets (Blueprint §6.2): API p95 < 300ms, p99 < 1s; product detail < 100ms; stock check < 50ms; search < 200ms; autocomplete < 100ms; webhook processing < 5s. Pagination defaults to 24; bulk operations ≤ 100 (create/update) and ≤ 20 (delete); rate limits per tier (B.10 §13.3).

### B12 — Independent testability
Every service is unit-testable in isolation (pure domain logic), integration-testable against the database, and contract-testable at its public interface. T0 paths (auth, payments, checkout, orders, refunds, settlements and their event consumers) require 100% coverage (Blueprint FG-04).

---

# 3. Module Architecture & Service Boundaries

## 3.1 Layered System Map (Blueprint §5.1, backend view)

```
APPLICATIONS (SPA — no business logic)
  │  calls
▼
APPLICATION LAYER — api/_handlers/{domain}/
  │  authn/authz · rate limit · zod validation · orchestration only · envelope
▼
SERVICE LAYER — api/_lib/{domain}/
  │  business rules · calculations · state machines · module APIs
▼
CROSS-CUTTING PLATFORM LIBRARIES — api/_lib/{errors,auth,events,queue,logging,config,storage,validation}
  │
▼
DATA LAYER — Prisma models per DATABASE_SPECIFICATION.md (one owner per entity)
  │  Postgres (Neon + Hyperdrive) · R2 · KV · Cloudflare Queues · PG job tables
▼
EXTERNAL ADAPTERS — gateway (Razorpay), couriers (Shiprocket/Delhivery/BlueDart/DTDC),
                   email (Resend), pincode lookup, Supabase Auth, Cloudinary
```

## 3.2 Service Catalog (30 services) — Boundaries Register

| # | Service | Domain / owner document | Primary tables (per DATABASE_SPECIFICATION) | Tier (GOVERNANCE §12.3) |
|---|---|---|---|---|
| S01 | Authentication | IDENTITY_ACCESS_MANAGEMENT + SECURITY (IS-02) | auth.users (Supabase), User, Session, AuthChallenge, TrustDevice | T0 |
| S02 | Authorization | SECURITY (IS-01) + IAM | Role, Permission, RolePermission, ApiKey | T0 |
| S03 | Customer | CUSTOMER_ACCOUNT_PROFILE | CustomerProfile, Address, CustomerPreference, CustomerStats | T1 |
| S04 | Shop Owner | SHOP_OWNER_DASHBOARD (backend scope) | Shop, ShopStaff, ShopSettings | T1 |
| S05 | Product | PRODUCT_ENGINE (CC-01/04/10/11/14/26) | Product, ProductImage, ProductCollection | T1 |
| S06 | Category | CATALOG (CC-26) | Category | T1 |
| S07 | Collection | CATALOG | Collection, ProductCollection | T1 |
| S08 | Variant | VARIANT_INVENTORY_ENGINE (CC-01/04/05) | ProductVariant, AttributeType, AttributeValue, VariantAttribute | T1 |
| S09 | Inventory | VARIANT_INVENTORY_ENGINE (CC-02/03/06/07/20/31/32) | ProductVariant.stock/reservedStock, InventoryHistory | T0 |
| S10 | Search | SEARCH_ENGINE (§7.2.9) | search_documents (derived index) | T2 |
| S11 | Cart | SHOPPING_CART_WISHLIST_CHECKOUT (CC-23) | Cart, CartItem | T1 |
| S12 | Wishlist | SHOPPING_CART_WISHLIST_CHECKOUT (CC-21/24) | Wishlist, WishlistItem | T2 |
| S13 | Checkout | SHOPPING_CART_WISHLIST_CHECKOUT (CC-02/03/25/30) | CheckoutSession (guest), coupons | T0 |
| S14 | Orders | ORDER_MANAGEMENT (CC-15/16/17/18/27/28/29/30/31) | Order, OrderItem, OrderStatusHistory, OrderNote | T0 |
| S15 | Shipping | SHIPPING_DELIVERY_LOGISTICS (ML-06/08, PS-06) | Shipment, ShipmentItem, ShipmentEvent, TrackingEvent | T0 |
| S16 | Payments | PAYMENT_ENGINE (ML-02/03/07/09/10, IS-08) | Payment, PaymentHistory, Refund, ReconciliationRecord | T0 |
| S17 | Finance | FINANCE_ENGINE (ML-04/05/08/09/10/11/12/13) | FinanceRecord, Settlement, EarningsLedger, CommissionRule | T0 |
| S18 | Returns | CUSTOMER_RESOLUTION_ENGINE (CC-22/32) | Resolution, ResolutionEvidence | T1 |
| S19 | Refunds | PAYMENT_ENGINE (ML-03/09) + RESOLUTION | Refund (owned by S16; orchestrated by S18/S14) | T0 |
| S20 | Reviews | CUSTOMER_FEEDBACK_REVIEWS | Review, Rating, Question, ReviewVersion | T2 |
| S21 | CMS | CMS_ENGINE (UX-05/07/12/13) | CmsContent, CmsContentVersion, CmsReusableBlock, CmsTaxonomy | T2 |
| S22 | Homepage Builder | HOMEPAGE_BUILDER (UX-04/05/13) | HomepageConfig, HomepageSection, SectionVersion | T2 |
| S23 | Notifications | NOTIFICATION_COMMUNICATION_MESSAGING (PS-01/07/08/12/17) | Notification, NotificationPreference, NotificationDelivery, eventOutbox (shared) | T1 |
| S24 | Messaging | NOTIFICATION_COMMUNICATION_MESSAGING (PS-02) | Conversation, ConversationMessage, ConversationParticipant | T2 |
| S25 | Documents | DOCUMENT_ENGINE (PS-04/05/06/10/11) | Document, DocumentVersion, DocumentTemplate | T1 |
| S26 | Reports | EXPORT_REPORTING_BI (PS-09/15/16) | materialized views, ExportJob, ReportDefinition | T2 |
| S27 | Audit | AUDIT_COMPLIANCE_ENGINE (IS-05/06/07/09, PS-19) | AuditEvent (append-only), AuditExport | T1 |
| S28 | Configuration | SYSTEM_CONFIGURATION (ML-14, UX-15, DI-03) | ConfigEntry, FeatureFlag, config history | T1 |
| S29 | Workflow | AUTOMATION_WORKFLOW_ENGINE (DI-01, PS-21, IS-09) | job_queue, job_claimed, job_completed, job_failed, job_dead_letter; event registry (App A) | T1 |
| S30 | Storage | STORAGE_ENGINE (DI-04/05/07) | UploadToken, MediaAsset; R2 buckets, Cloudinary | T1 |

**Tier rule:** T0 services and their cross-module event consumers (notifications of T0 events, finance records, document generation) require 100% coverage, a second reviewer on every change, and cannot be deployed behind any quality gate (Blueprint FG-04, §8.4).

## 3.3 Service Boundary Rules (binding)

1. **One responsibility per service:** a service's purpose (right column of §3.2, detailed in §8) is its complete mandate. Feature requests that cross into another service's mandate are implemented in that service, or as a new service — never in the requesting service.
2. **No orphan business logic:** any rule, calculation, or transition that is not owned by exactly one service is a defect to be assigned (see §9 ownership tables).
3. **Handlers are thin:** a handler file may not exceed orchestration, validation, and formatting. Business logic in handlers fails review (Blueprint mandatory rule 9).
4. **No cross-handler imports:** `api/_handlers/{domain}/` imports only `api/_lib/**` (GOVERNANCE_CONSTITUTION; handler convention).
5. **Entity ownership:** each entity belongs to one service (DATABASE_SPECIFICATION §3). Other services may read through the owner's read API or event payloads, and may create referential edges only with owner approval.
6. **State-machine ownership:** each state machine (§9.4) is transitioned only by its owning service, invoked either directly (same domain) or through the module API / events.
7. **Money ownership:** only Payment moves money; only Finance records financial facts; only Document generates documents. No other service reimplements these (Blueprint §7.2.5, PS-04).
8. **Availability ownership:** only Inventory evaluates `availableStock`; every service that needs availability must call the Inventory read API (§10.2) — never re-derive it (Blueprint CC-07, §7.2.10).

---

# 4. Dependency Direction & Rules

## 4.1 Binding Dependency Graph (Blueprint §7.1)

```
AUTH (S01) ── identity ─▶ all services
PRODUCT (S05) ─▶ CATEGORY (S06) ─▶ VARIANT (S08) ─▶ INVENTORY (S09)
       └─▶ COLLECTION (S07)        │
VARIANT (S08) ─▶ CART (S11) ─▶ CHECKOUT (S13) ─▶ ORDERS (S14) ─▶ PAYMENTS (S16) ─▶ FINANCE (S17)
                                                        │                    │
                                                        ▼                    ▼
                            SHIPPING (S15) ◀──▶ ORDERS(S14)     DOCUMENTS (S25)
                                                                    │
        EVENT BUS (outbox + Cloudflare Queues + PG job tables) ◀───┘
                │ consumers: NOTIFICATIONS (S23) · AUDIT (S27) · REPORTS (S26)
                │ · DOCUMENTS (S25) · FINANCE (S17) · RETURNS (S18) · WORKFLOW (S29) · STORAGE (S30)
```

## 4.2 Dependency Rules (Blueprint §7.2, binding)

1. **Layering:** Presentation → Applications → Customer domains → Commerce Core → Platform Services → Infrastructure. Lower layers never depend on higher layers.
2. **Direction:** Commerce core depends on platform services (auth, configuration, events, documents, notifications, storage, audit); platform services never depend on commerce business logic (PAYMENT §1.2 independence; PS-04 delegation).
3. **Decoupling:** cross-module behavior is event-driven (event bus + outbox). Direct calls only within a domain, through owner module APIs, or to platform libraries.
4. **Identity:** every record requiring user context references `auth.users.id` (Supabase) via the app-side `User` profile; no app-side passwords (IS-02).
5. **Documents:** no business module generates PDFs; all generation flows through the Document pipeline (PS-04).
6. **Retention:** all modules enforce retention via Data Lifecycle policies with AUDIT §8.3 classes (PS-01/03).
7. **Config:** numeric policy defaults live in SYSTEM_CONFIGURATION keys (§8.28, Blueprint ML-14/UX-15); modules reference keys, never duplicate values.
8. **Scheduling:** durable schedules via PG job tables (AUTOMATION §7.5); fire-and-forget via Cloudflare Queues (DI-01).
9. **Search:** SEARCH reads its own index; never queries product tables at request time (SEARCH §1.1).
10. **Availability:** `availableStock` is the only availability truth (CC-07).

## 4.3 Direction of Each Service's Dependencies

Dependency direction is registered per service in §8 (each entry's *Dependencies* list). In summary:

- **Platform services (S21–S30)** depend only on: Authentication/Authorization (identity), Configuration, Storage, Workflow (scheduling), Audit, Events, Logging. They never import commerce services.
- **Commerce core (S05–S19)** depends on platform services and on upstream commerce services in the graph direction (Product ← Category ← Variant ← Inventory; Variant ← Cart ← Checkout ← Orders ← Payments ← Finance). No reverse dependencies.
- **Customer-facing services (S03, S20, and the read side of commerce)** consume via the owning service's read APIs and event payloads.
- **External adapters** (gateway, courier, email, pincode, Cloudinary, Supabase) are confined to `api/_lib/*/adapters/` boundaries; services depend on adapter *interfaces*, never on adapter internals (replaceable — API_INTEGRATION §1.1).

---

# 5. Layer Responsibilities

| Layer | Location | May do | Must never do |
|---|---|---|---|
| **API handlers** (controllers) | `api/_handlers/{domain}/` | Authenticate + authorize, rate-limit, validate input with shared Zod schema, orchestrate service calls, format envelope, map errors, log request | Implement business rules, calculations, or state transitions; write data directly except through the owning service; read another handler domain |
| **Service layer** | `api/_lib/{domain}/` | Implement the domain's business logic, state machines, calculations, module APIs (read + transaction entry points); own entity writes; publish events via outbox | Import handlers; implement another domain's logic; call external adapters directly except through adapter interfaces |
| **Cross-cutting libraries** | `api/_lib/{errors,auth,events,queue,logging,config,storage,validation,payments,notifications}/` | Provide shared, domain-independent capabilities | Contain commerce business rules; duplicate service logic |
| **Data layer** | Prisma models (DATABASE_SPECIFICATION §3) | Enforce schema, constraints, indexes, RLS; provide typed access | Contain business logic; enforce rules better expressed at the service layer (constraints are the last line of defense, not the first) |
| **External adapters** | `api/_lib/{payments,shipping,email,storage}/adapters/` | Translate the platform contract ↔ external provider; convert paise at gateway boundary; verify provider webhook signatures | Leak provider concepts into domain code |

**Middleware order (canonical request pipeline, API_SERVICE/API_INTEGRATION):**

```
1. Rate limiting (tier) → 2. Authentication (session/API key) → 3. Authorization (role/permission)
→ 4. Input validation (Zod) → 5. Handler execution → 6. State-change audit logging → 7. Envelope formatting
```

**Response envelope (canonical):**
- Success: `{ success: true, data, meta?: { page?, limit?, total?, hasMore?, version? } }`
- Error: `{ success: false, error: { code, message, field?, details? } }`
- HTTP: 200/201/204 · 400 · 401 · 403 · 404 · 409 (conflict) · 410 (gone/inactive) · 422 (validation) · 429 (+`Retry-After`) · 5xx.

---

# 6. Transaction Strategy

## 6.1 Transaction Ownership

| # | Atomic unit | Owning service | Boundary (single DB transaction unless noted) |
|---|---|---|---|
| T1 | Inventory reservation | S09 Inventory (invoked by S13 Checkout/S14 Orders) | `SELECT … FOR UPDATE`/conditional update on all variants; all-or-nothing; 15-min timeout; movement log rows in same transaction; outbox event in same transaction |
| T2 | Order confirmation | S14 Orders | Order + OrderItems snapshots + OrderStatusHistory (`pending→confirmed`) + stock deduction + cart clear + outbox (`order.created`, `order.confirmed`, `payment.captured` side effects owned by consumers) |
| T3 | Order status transition | S14 Orders | Status change + history row + (if cancel/reject) inventory `STOCK_RELEASE`/`ORDER_CANCEL` + (if paid) refund initiation + outbox |
| T4 | Payment capture → order creation | S16 Payment + S14 Orders (orchestrated via checkout flow) | Payment record `captured` + order confirmation chain (T2); `gatewayPaymentId` unique; webhook idempotent (process once, cached result) |
| T5 | Refund | S16 Payment | Refund row + Payment aggregate derivation + outbox (`refund.initiated`) |
| T6 | Refund → finance reversal | S16 + S17 (S17 consumer) | Finance reversal record append-only, idempotent on `(settlementId, orderId)` / `refundId` |
| T7 | Return approval chain | S18 Returns | Resolution status + reverse-logistics trigger + (on receipt) restock `ORDER_RETURN`/`RETURN_RECEIVED` + refund initiation — each step its own atomic unit, chained by events (CC-32) |
| T8 | Settlement | S17 Finance | Settlement status transition + earnings ledger rows + outbox (`settlement.*`) |
| T9 | Product publish | S05 Product | Status change + search-index event + cache-invalidation event + history |
| T10 | CMS/homepage publish | S21/S22 | Version snapshot + status change + KV invalidation + audit (atomic swap draft→published) |
| T11 | Document generation | S25 Documents | Job enqueue (PG job table) idempotent on (documentType, businessId, version) — generation itself is async |
| T12 | Auth session ops | S01 Authentication | Session row + rotation + audit rows |
| T13 | Cart merge on login | S11 Cart | Guest→customer merge + wishlist merge (S12) — per-owner transactions, ordered by user event |

## 6.2 Rollback Rules

1. **Within a transaction:** any failure rolls the whole unit back — no partial states (PAYMENT §1.7: "No partial payment states"; VI §16.3: "No concurrent stock corruption").
2. **Across events:** the outbox guarantees the DB write and the event commit together; a consumer failure never rolls back the producer. Consumers are idempotent and retryable.
3. **Money:** a capture that fails verification rolls back order creation entirely; the payment state remains `pending`/`failed` per the canonical machine (Appendix B.3).
4. **Reservations:** on payment failure or 15-min expiry, `STOCK_RELEASE` restores `availableStock`; stock itself never changes until capture (CC-02/03).
5. **Settlement:** reversal is a forward state (`REVERSED`), never a deletion — new finance record, admin approval, reason, audit (ML-09/12).
6. **Status history:** transitions are never rolled back by overwriting; corrections are new transitions with reasons.

## 6.3 Retry Strategy (canonical)

| Context | Policy |
|---|---|
| Synchronous DB conflicts (optimistic/pessimistic locking) | Retry with backoff 1s/2s/4s, max 3; re-fetch state before retry |
| Outbound async jobs (email, export, document, webhook dispatch) | Exponential backoff 1s/2s/4s/8s, max 3 attempts, DLQ after max |
| Notification priority classes | Urgent 5@1s · High 3 exp · Normal 3 exp · Low 2 linear · Background 1 (NTF §7.6, PS-08) |
| Gateway calls (Razorpay) | Retry cooldown 30s; transient errors only; circuit breaker; fallback gateway readiness |
| Courier API calls | Exponential backoff 1s/2s/4s/8s max 3; manual-update fallback when API unavailable (SH §11.6) |
| Webhook processing | Inbound: < 5s processing, return non-2xx on failure so the provider retries; outbound: retry + DLQ (IS-08) |
| Scheduled jobs (PG job tables) | Lease-based claim; timeout per job class (cleanup 60min, archive 30min, backup 60min, restore 120min); retries per job definition; DLQ + alert |
| **Never retry** | 4xx validation/auth errors, invalid signature, bounced email, permanent declines |

## 6.4 Compensation Readiness

Every long-running flow must define its compensation path at design time (Blueprint §9.4):

| Flow | Compensation |
|---|---|
| Checkout (reserve → pay → confirm) | Payment failure/expiry → release reservation (15-min job); abandoned → release; cancel → release + refund |
| Order rejection (paid) | Status `rejected` + `STOCK_RELEASE` + refund initiation in same unit (CC-31) |
| Return | Approved → reverse logistics → received → restock → refund; rejection → appeal; refund failure → retry queue + admin alert |
| Settlement | `PAID`/`COMPLETED → REVERSED` with admin approval + reason + new finance record (ML-12) |
| COD | Courier collection webhook → `COD_COLLECTED` record → remittance payable → settlement net of courier fee; daily reconciliation (ML-08) |
| Document regeneration | New version; previous version retained; checksum mismatch → flag + notify + regenerate |
| Payment webhook failure | Idempotent reprocessing from provider retry; never double-capture (`gatewayPaymentId` unique) |

## 6.5 Data Consistency

1. **Exactly-once effects:** idempotency keys + unique constraints + outbox (Blueprint mandatory rule 18).
2. **Snapshots:** orders snapshot price/tax/shipping/coupon at creation; settlement snapshots commission rules per order; documents snapshot business data at generation — never re-read mutable master data at report time (DATABASE_SPECIFICATION P5).
3. **Derived state:** payment aggregate status (`refunded`/`partially_refunded`) is derived from refund records (ML-03); `availableStock` computed, never stored (CC-07); balances computed from append-only ledgers — no cached balances without invalidation (FINANCE §11).
4. **Event ordering:** per-order/per-entity ordering guaranteed by outbox insertion order; consumers process independently (OM §12.7).
5. **Read-after-write consistency:** KV caches are invalidated on write (event-driven); TTLs per §12.1.

---

# 7. Validation Layers

Validation is applied in five layers. Each layer has a different owner and failure mode; a value may be rejected at any layer. All user input is validated at every boundary (Blueprint mandatory rule 16).

| Layer | Owner | What it catches | Failure response |
|---|---|---|---|
| L1 Input validation | Shared Zod schemas (`api/_lib/validation/`, co-located per domain, shared FE/BE) at every handler | Format, type, length, enum, regex, ranges | 422 with field-level codes |
| L2 Business validation | Owning service | Domain rules: state legality, windows, caps, eligibility, ownership, dependencies | 409/410/422 with domain codes |
| L3 Cross-module validation | Calling service via owner module API | Contract rules: availability (`availableStock`), price snapshot, serviceable pincode, shipment-state refund gate | 409/422 with contract codes (e.g., `INSUFFICIENT_STOCK` 409 — Blueprint CC-12 default) |
| L4 Security validation | Middleware (authz library) | Identity, roles, permissions, CSRF, rate limits, session validity, idempotency key | 401/403/429 (+`Retry-After`) |
| L5 Database constraints | Prisma schema (DATABASE_SPECIFICATION) | Last line of defense: NOT NULL, CHECK (`stock ≥ 0`, `reservedStock ≤ stock`, money precision), UNIQUE (SKU, slug, idempotency keys), FK integrity, RLS | 500-mapped constraint violation (never leaks SQL); logged as integrity failure |

**Rules:**
1. **Server-side validation is mandatory on every boundary; client-side is convenience** (SC §11.5, OM §13.4). The client is never trusted for price, amount, stock, or eligibility.
2. **One schema owner per contract:** checkout order-creation contract = SC §4.19 schemas (CC-30); auth endpoints, cart/wishlist schemas, review schemas, CMS schemas — each registered with its service in §8.
3. **Re-validation at every stage of a flow:** cart changes, price changes, stock changes, address changes, coupon expiry are re-checked at checkout entry, at payment initiation, and at verification (SC §4.6).
4. **No `z.any()`**; unknown fields are stripped or rejected; HTML is sanitized (DOMPurify config per CMS; product descriptions allow only `p, br, strong, em, ul, ol, li, h3, h4`).
5. **Idempotency keys** (`Idempotency-Key` header) required for state-changing operations; duplicates return the original result (API_INTEGRATION).
6. **Security validation ordering:** rate limit → authn → authz → input → business → cross-module (never expose whether a resource exists before authz — 404 for unauthorized resource access).

---

# 8. Service Catalog

Format per service (binding structure for every entry): **Responsibility · Inputs · Outputs · Dependencies · Events · Transactions · Validation · Error cases · Performance notes · Security notes.**

Legend: `P` = publishes, `C` = consumes. Event names are dot-notation constants from the canonical registry (AUTOMATION Appendix A, per IS-09); events marked **(reg.)** are registered by this specification into that registry because no source document defines them — no other code may invent event names. Where a service's source document defines SCREAMING_SNAKE audit types (e.g. `PRODUCT_PUBLISHED`), the audit type and its dot-notation registry event are the same fact in two registers.

## 8.1 S01 — Authentication (T0)

- **Responsibility:** sole owner of the identity lifecycle: registration, login, logout, session management, password handling, OTP/verification codes, MFA readiness, trusted devices, and the app-side `User` profile. Credential storage is delegated to the Supabase Auth adapter (IS-02); no app-side password storage, ever.
- **Inputs:** credentials (email + password), OTP, device/browser info, session tokens, `Idempotency-Key`; CSRF token for mutations.
- **Outputs:** httpOnly session cookies, access token (15 min) + refresh token (7 days), `User` profile, verification codes (6-digit, 10-min expiry), session revocation state.
- **Dependencies:** Supabase Auth adapter (external), KV rate limiter, Configuration (CSRF secret, lockout policy), Audit (via events), Workflow (scheduled session purge).
- **Events:** P: `auth.user.registered`, `auth.user.login`, `auth.user.logout`, `auth.password.reset`, `auth.password.changed`, `auth.session.revoked` **(reg. for `registered`/`revoked`)**; audit types `LOGIN_FAILED` (Warning), `TURNSTILE_FAILURE` (Warning). C: none.
- **Transactions:** T12 — session row + token rotation + audit rows commit in one DB transaction; refresh rotation invalidates the old token atomically.
- **Validation:** L1 — Zod (email format, password policy); L2 — account lockout state, verification window (10 min), re-verification for sensitive ops; L4 — rate limits **login 20/min, register 10/min, password reset 5/hr, OTP resend 3/hr, lockout 10/hr/IP** (IDENTITY §6/§7/§12), CSRF HMAC, Turnstile on register/login.
- **Error cases:** `INVALID_CREDENTIALS` 401 · `ACCOUNT_LOCKED` 423 · `VERIFICATION_CODE_INVALID` 400 · `VERIFICATION_CODE_EXPIRED` 410 · `SESSION_EXPIRED` 401 · `RATE_LIMITED` 429 (+`Retry-After`) · `TURNSTILE_FAILED` 422.
- **Performance notes:** KV-based rate limiter (edge); bcrypt cost 12 (deliberately slow — hash work is the brute-force defense); session archive/cleanup after 30 days via scheduled job; auth endpoints are T0 and must meet the 300ms p95 budget.
- **Security notes:** bcrypt cost 12 (IDENTITY §20); refresh tokens 7d httpOnly cookies, rotated on use; max 5 concurrent sessions; archive old sessions after 30 days; every failure audited (`LOGIN_FAILED`, `TURNSTILE_FAILURE`); never log credentials or tokens; default-deny on all other services until identity established (B9).

## 8.2 S02 — Authorization (T0)

- **Responsibility:** sole owner of roles, permissions, API keys, permission evaluation, and row-level-security policy definitions. Decides what an authenticated actor may do; never stores credentials.
- **Inputs:** role assignments, permission grants/revocations, API-key creation requests, permission checks from every service's middleware.
- **Outputs:** effective permission sets (cached), scoped API keys (hash stored), RLS policy configuration, permission-denial audit rows.
- **Dependencies:** Authentication (identity resolution), Configuration (policy flags), Audit (events).
- **Events:** P: `auth.role.assigned`, `auth.permission.changed`, `api.key.created` **(reg.)**. C: `auth.user.login` (loads actor's role set).
- **Transactions:** role/permission/API-key mutations are single atomic units; revoking a permission invalidates cached sets via event.
- **Validation:** L1 — permission string format `{scope}:{resource}:{action}`; L2 — role must exist, additive hierarchy **Guest 0 < Customer 10 < Shop Owner 20 < Admin 30 < System 100**; L4 — API key scopes checked before any business validation (404 on unauthorized resource access, never 403 leaks existence).
- **Error cases:** `FORBIDDEN` 403 · `API_KEY_INVALID` 401 · `API_KEY_EXPIRED` 401 · `ROLE_NOT_FOUND` 404 · `PERMISSION_INVALID` 422.
- **Performance notes:** permission sets cached in KV (short TTL, event-invalidated); evaluation is a cache hit in the T0 path; RLS enforcement is pushdown, not app-side loops.
- **Security notes:** default-deny (B9); API keys stored as hashes only, scoped to least privilege, revocable instantly; every permission denial audited with user ID, endpoint, timestamp (VI security rules); role changes propagate to all services via event.

## 8.3 S03 — Customer (T1)

- **Responsibility:** sole owner of the customer profile domain: profile, addresses, preferences, saved payment indicators, customer stats. Reads only — never owns orders, carts, or auth state.
- **Inputs:** profile/address/preference mutations, pincode/phone validation inputs.
- **Outputs:** customer profile views (self view full; shop-owner view masked per B9), address book, preference set (incl. notification preferences owned here per NTF rules).
- **Dependencies:** Authentication (identity), Validation library (India Post pincode, phone, GSTIN), Notifications (preference consumption).
- **Events:** P: `customer.profile.updated`, `customer.address.added/updated/removed`, `customer.preference.updated` **(reg.)**. C: `auth.user.registered` (profile bootstrap).
- **Transactions:** single-profile mutations atomic; address book ops each their own unit.
- **Validation:** L1 — phone `+91` 10-digit, 6-digit India Post pincode, GSTIN format; L2 — max addresses (config key), soft-delete rules, only own resources (ownership check on every address op).
- **Error cases:** `CUSTOMER_NOT_FOUND` 404 · `ADDRESS_NOT_FOUND` 404 · `PINCODE_INVALID` 422 · `PHONE_INVALID` 422 · `PROFILE_FIELD_INVALID` 422 · `MAX_ADDRESSES_REACHED` 409.
- **Performance notes:** profile read is KV-cached (event-invalidated); stats are derived, never cached without invalidation (FINANCE §11 rule applies to balances, mirrored here).
- **Security notes:** PII at rest is encrypted/column-level protected; shop owners see masked address data only (Blueprint IS-01/B9); address and phone are sensitive-fact rows — changes are audit-class 2y (AUDIT §8.3).

## 8.4 S04 — Shop Owner (T1)

- **Responsibility:** sole owner of the shop entity: shop profile, shop staff, shop settings (shipping config reference, GSTIN, bank details for settlement). Dashboard is a view; this service owns the underlying shop data.
- **Inputs:** shop profile/staff/settings mutations, ownership checks (`product.sellerId === user.id` — future marketplace field).
- **Outputs:** shop views, staff role bindings (Shop Owner 20 scope), settlement-relevant settings (bank/GST data exposed only to Finance and the owner).
- **Dependencies:** Authentication, Authorization (staff roles), Finance (settlement method read), Documents (GSTIN verified documents).
- **Events:** P: `shop.profile.updated`, `shop.staff.invited/removed`, `shop.settings.updated` **(reg.)**. C: `auth.user.registered` (shop bootstrap for owner flow).
- **Transactions:** staff invitation + role binding atomic; settings changes audited.
- **Validation:** L1 — GSTIN format, bank IFSC/account rules; L2 — one shop per owner (unique), staff limit, only owner or Admin 30 may mutate shop settings; L4 — owner-scoped authorization on every mutation.
- **Error cases:** `SHOP_NOT_FOUND` 404 · `SHOP_OWNER_CONFLICT` 409 · `STAFF_LIMIT_REACHED` 409 · `GSTIN_INVALID` 422 · `SETTINGS_INVALID` 422.
- **Performance notes:** shop settings KV-cached 5 min (event-invalidated); staff list < 200ms.
- **Security notes:** bank details are highest-sensitivity PII (financial class, 7y retention, AUDIT §8.3); masked to non-owner staff; settlement-destination changes require re-verification (Finance rules); every settings change audited with before/after.

## 8.5 S05 — Product (T1)

- **Responsibility:** single source of truth for product lifecycle, creation, media, publishing, and validation (PRODUCT §1). The atomic unit every commerce module depends on without owning it. Grows 100 → 1,000,000 products without architectural change.
- **Inputs:** product create/update/publish/unpublish/archive/restore/duplicate, bulk operations, media uploads (presigned), search-index triggers.
- **Outputs:** product views (public published-only; admin all states), bulk results, cache-invalidation events, search-index events.
- **Dependencies:** Category (valid + `isActive`), Variant (children), Inventory (availability truth only via S09), Storage/Media (Cloudinary adapter; folder `nabome/products/{product-uuid}/original/`), Search index (async), KV cache, Audit.
- **Events:** P: `product.created`, `product.updated`, `product.published`, `product.archived`, `product.deleted`, `product.unpublished`, `product.restored`; audit types `PRODUCT_*` per registry. C: `category.updated` (tree invalidation), `variant.created` (publish validation).
- **Transactions:** T9 — publish/unpublish/archive = status change + search-index event + cache-invalidation event + history row, one atomic unit; scheduling via cron (every minute, UTC), re-validated at trigger; on trigger failure → draft + admin email (audit `PRODUCT_AUTO_PUBLISHED`).
- **Validation (L1/L2, exact codes):** `name` 1–300 (no HTML); `slug` auto-generated, unique (409 `PRODUCT_SLUG_DUPLICATE`); `categoryId` valid + active (400 `PRODUCT_CATEGORY_INVALID`); `basePrice` positive DECIMAL(10,2) (400 `PRODUCT_PRICE_INVALID`); `gender` `men|women|unisex`; `tags` ≤ 10 × ≤ 50 chars; `meta` JSONB — product-detail attributes only, **`{material, care[], origin}`** (CC-14); publish requires name, category, price, description (10–5000), ≥ 1 image, ≥ 1 **active** variant, unique slug — codes `PUBLISH_*`; draft requires **name only**. Media: JPEG/PNG/WebP/GIF, ≤ 10MB, 400×400–4000×4000px, alt text ≤ 125 required on publish, checksum duplicate detection (409 `MEDIA_DUPLICATE_DETECTED`), max 8 images + 2 videos/product. Completeness score (weights 15/10/10/15/15/15/5/5/5/5). Featured ≤ 20; trending ≤ 12; `isNew` auto-clears after 14 days.
- **Bulk limits (exact):** publish/unpublish/archive/featured-toggle 50/batch (archive requires per-product reason); permanent delete 20/batch (drafts, double confirmation); category assign/price/tag 100/batch; **max 3 bulk operations per minute**; timeouts publish 5 min, delete 3 min; `BulkOperationResult` partial-success shape; undo window 5 minutes.
- **Error cases:** `PRODUCT_NOT_FOUND` 404 · `PRODUCT_INACTIVE` 410 · `PRODUCT_SLUG_DUPLICATE` 409 · `PUBLISH_NO_STOCK` 400 · `MEDIA_TYPE_INVALID`/`MEDIA_SIZE_TOO_LARGE`/`MEDIA_DIMENSIONS_INVALID` 400 · `MEDIA_DUPLICATE_DETECTED` 409 · permission errors 401/403.
- **Performance notes:** KV edge TTLs — **detail 5 min** (invalidate on update), **list 2 min** (invalidate on publish/unpublish), filter counts 5 min; targets — list < 200ms, detail < 100ms, admin list < 300ms; pagination 24/page; composite indexes `[status, …]` per PRODUCT §11.10; image pipeline async (presign → WebP/AVIF → 400/600/800/1200w → thumbnail → blur-up → EXIF strip → Cloudinary); scheduled publish cron every minute; draft-expiry flag after 90 days.
- **Security notes:** XSS sanitization (allow only `p, br, strong, em, ul, ol, li, h3, h4`; strip script/iframe/handlers); CSRF on all mutations; rate limits per endpoint (bulk 3/min); upload MIME + magic-byte verification; private-for-draft/public-for-published media ACL; `authenticate()` + `authorize()` middleware; ownership `product.sellerId === user.id`; every action audited (audit types `PRODUCT_*` with userId/ip/userAgent/changes).

## 8.6 S06 — Category (T1)

- **Responsibility:** sole owner of the hierarchical taxonomy — the permanent backbone of navigation, SEO, breadcrumbs, sitemap, and the primary filter dimension (CATALOG §1). Exactly one primary category per product.
- **Inputs:** category CRUD (admin-only), reorder, move (`parentId`), activate/hide/deactivate.
- **Outputs:** category tree views, inheritance defaults (gender, sort, display style, meta), visibility states.
- **Dependencies:** Product (1:N — products must be reassigned before category delete), KV cache, Search index (category name).
- **Events:** P: `category.created`, `category.updated`, `category.deactivated` **(reg.)**. C: none.
- **Transactions:** category mutation + tree-cache invalidation + audit atomic; move = reassign children + products handled by admin per source rules.
- **Validation:** `name` ≤ 100; `slug` unique lowercase/hyphen (immutable, 301 preserved); `parentId` valid, **depth ≤ 5 levels absolute**; visibility rules — inactive parent hides all children; products hidden if category inactive; archived category → products `categoryId` null + 301 to parent.
- **Error cases:** `CATEGORY_NOT_FOUND` 404 · `CATEGORY_SLUG_DUPLICATE` 409 · `CATEGORY_DEPTH_EXCEEDED` 422 · `CATEGORY_INACTIVE` 410 (surface).
- **Performance notes:** **category tree cache KV TTL 1 hour**, invalidated on category change; category landing pages 24/page; sitemap priority 0.9; targets < 200ms.
- **Security notes:** admin-only mutation (Product Engine §10.5 permission table — shop owners "No"); soft delete only (`isActive = false`), never hard delete; audit every change.

## 8.7 S07 — Collection (T1)

- **Responsibility:** sole owner of curated, marketing-driven product groupings: manual, dynamic (rule-based), and smart (AI, future) collections (CATALOG §7).
- **Inputs:** collection CRUD (admin-only), membership management, rule definitions, featured toggles, seasonal windows.
- **Outputs:** collection views, membership lists (manual sort order), visibility states (`active`/`inactive`/`scheduled`/`expired`).
- **Dependencies:** Product (M:N junction `ProductCollection`, `@@unique([productId, collectionId])`), Search (collection suggestions), CMS (homepage blocks), KV cache.
- **Events:** P: `collection.published`, `collection.updated`, `collection.archived` **(reg.)**. C: `product.published`/`product.archived` (dynamic membership recompute).
- **Transactions:** membership changes audited per product; seasonal auto-deactivate on `endsAt` (cron); archive → 301.
- **Validation:** slug unique lowercase/hyphen; rules JSON against operator whitelist (`category` equals/in, `brand` equals/in, `price` gte/lte/between, `gender` equals, `tags` contains/in, `created_at` gte/lte, `is_featured` equals, `stock` gt/gte, `total_sold` gte); **max 500 products/collection (soft)**, guidance ≤ 50; **max 6 featured collections**; promotional collections must have an end date.
- **Error cases:** `COLLECTION_NOT_FOUND` 404 · `COLLECTION_RULE_INVALID` 422 · `COLLECTION_LIMIT_EXCEEDED` 409 · `DUPLICATE_MEMBERSHIP` 409.
- **Performance notes:** **collection products cache KV TTL 5 min** (invalidate on collection change); dynamic collection membership computed on event, not at request time; targets < 200ms.
- **Security notes:** admin-only mutation; soft delete only; audit every membership change; no PII in collection payloads.

## 8.8 S08 — Variant (T1)

- **Responsibility:** sole owner of the variant system built on the **Global Attribute System** (admin-defined attribute types/values, platform-global, never hardcoded): combination generation, SKU lifecycle, variant pricing, variant status.
- **Inputs:** attribute type/value CRUD (admin), variant create/generate/bulk, variant deactivation.
- **Outputs:** variant views, generated combination matrices, SKUs, variant status.
- **Dependencies:** Product (parent, `onDelete: Cascade`), Inventory (stock/reserved per variant — read via S09 only), Search (publish-variant index), Cart/Order (SKU snapshots).
- **Events:** P: `variant.created`, `variant.updated`, `variant.deactivated` (payload `variantId, productId` → Inventory, Search). C: `product.published` (active-variant validation).
- **Transactions:** variant create + SKU assign atomic; bulk generate = one job, per-item validation, partial success.
- **Validation (exact codes):** SKU 1–50 alphanumeric+hyphens, globally `@unique`, **immutable — no update, no delete** (`SKU_DUPLICATE` 409, `SKU_INVALID_FORMAT` 400, `SKU_INVALID_LENGTH` 400); formats — display `{PRODUCT}-{ATTRIBUTES}` (e.g. `TSH-RED-M`), internal `NB-{UUID-SUFFIX}`, barcode EAN-13/UPC; `attributeValues` ≥ 1 (`VARIANT_ATTRIBUTES_REQUIRED`); duplicate combination 409; price positive DECIMAL(10,2) override of `variant.price ?? product.basePrice`, sale priority Variant > Product > Regular, `SALE_PRICE_INVALID` (sale < regular); dataType validation per attribute type (color `#RRGGBB`, select/multi_select valueId existence, text ≤ 100, number, boolean); recommended ≤ 5 types, ≤ 20 values/type, warn > 100 combinations; soft-delete only (inventory history loss); delete only on own draft products (shop owner).
- **Error cases:** `VARIANT_NOT_FOUND` 404 · `VARIANT_SKU_DUPLICATE` 409 · `VARIANT_SKU_INVALID` 400 · `VARIANT_DUPLICATE_COMBINATION` 409 · `VARIANT_STOCK_INVALID` 400 · `VARIANT_PRICE_INVALID` 400 · `ATTRIBUTE_TYPE_NOT_FOUND` 404 · `ATTRIBUTE_TYPE_DUPLICATE` 409 · `ATTRIBUTE_VALUE_INACTIVE` 410.
- **Performance notes:** variant list < 200ms; bulk 100/batch; background jobs for heavy ops; partial indexes + GIN for JSONB + `pg_trgm`; search indexes published variants only.
- **Security notes:** admin-only attribute management; variant mutations audited; SKU immutability is the anti-corruption contract for carts/orders — never mutated post-creation.

## 8.9 S09 — Inventory (T0)

- **Responsibility:** sole owner of stock truth: per-SKU stock, reservations, movements, inventory history, status bands, low-stock/back-in-stock signaling. **Independent of Product Engine by design; `availableStock = stock − reservedStock` is the only availability truth (CC-07) and is computed, never stored.**
- **Inputs:** stock add/reduce/adjust (admin; shop owner may view/update own, **not** adjust/audit/bulk), reserve/release calls from Checkout/Orders, bulk updates, audit requests.
- **Outputs:** availability readings (< 50ms, PK lookup + cache), movement ledger rows, status bands, low-stock/back-in-stock notifications.
- **Dependencies:** ProductVariant (per-SKU columns), Checkout/Orders (reserve/release), Notifications (low-stock email, back-in-stock email), Search (stock_status), KV cache.
- **Events:** P: `stock.changed`, `stock.reserved`, `stock.released`, `stock.adjusted` **(reg.)**; movement types are the audit register: `STOCK_ADD | STOCK_REDUCE | STOCK_RESERVE | STOCK_RELEASE | STOCK_ADJUST | ORDER_PLACE | ORDER_CANCEL | ORDER_SHIP | ORDER_RETURN | CHECKOUT_RESERVE | CHECKOUT_RELEASE | BULK_UPDATE` (+ `AUTO_ADJUST`). C: `variant.created`, `order.created` (deduction), `order.cancelled` (restock), `return.received` (restock).
- **Transactions:** **T1** — reservation is atomic: conditional update (`availableStock >= quantity`), all-or-nothing across variants, 15-min timeout, movement rows + outbox event in the same transaction; pessimistic `SELECT … FOR UPDATE` for critical ops; optimistic locking via version column; idempotency via `referenceId`/`referenceType` + `orderId`.
- **Validation (L1/L2/L5):** quantity positive for adds; reduce cannot go below `reservedStock`; adjust sets absolute value `>= reservedStock`, reason required (optional second admin approval); DB constraints `stock >= 0`, `reservedStock <= stock`, `order <= available` (no overselling); bulk max 100 variants.
- **Error cases (canonical, recorded deviation):** `INSUFFICIENT_STOCK` → **409 Conflict** (Blueprint CC-12 default — canonical wins; VI App C.3 documents 400, deliberately overridden here) · `STOCK_CANNOT_BE_NEGATIVE` 400 · `RESERVED_EXCEEDS_STOCK` 400 · `RELEASE_EXCEEDS_RESERVED` 400 · `INVENTORY_ADJUSTMENT_FAILED` 500 · `BULK_OPERATION_PARTIAL_SUCCESS` 200.
- **Performance notes:** stock check < 50ms (PK + cache); reservation cleanup job every 5 min; low-stock alerts hourly; bulk < 5s per 100; scale tiers: < 1K simple, 1–10K composite+cache, 10–100K replicas + materialized views, 100K+ dedicated search-backed availability; pagination 24.
- **Security notes:** DB-level atomicity and constraints (never app-only); every movement audited (admin ID, quantity, reason, timestamp; order ID on reserves; old/new on adjusts); permission denials audited; restock and back-in-stock emails are T1 notification consumers of this service's events.

## 8.10 S10 — Search (T2)

- **Responsibility:** independent, read-only search service over its **own** index (`search_documents` — materialized, asynchronously maintained). **Never queries product tables at request time (SEARCH §1.1 mandatory rule).**
- **Inputs:** query `q` (≤ 200 chars), filters, sort, pagination, recommendation type/product/user.
- **Outputs:** search results (max 50, cursor-paginated, default 24), autocomplete (min 2 chars, 300ms debounce, suggestions ≤ 5 + products ≤ 5 + categories ≤ 3), facets (< 20ms compute), recommendations (similar ≤ 6 / bought-together ≤ 4 / trending ≤ 8 / personalized), zero-results fallbacks.
- **Dependencies:** Product events (index population < 2s per change, bulk < 30s, full rebuild < 10 min background), Inventory events (`stock_status`), Config (business boost, thresholds).
- **Events:** P: none (read-only). C: `product.created`, `product.updated`, `product.published`, `product.archived`, `product.deleted`, `stock.changed`.
- **Transactions:** none (no writes to owned tables at request time; index maintenance is a Workflow job).
- **Validation:** query ≤ 200 chars, HTML/SQL keywords stripped; filter values whitelisted; sort allowlist (`featured|relevance|newest|price_asc|price_desc|best selling|rating`); pagination bounded positive ints; always parameterized `to_tsquery`; OR within facet group, AND between groups.
- **Error cases:** `INVALID_FILTER` 400 · `INVALID_SORT` 400 · `SEARCH_QUERY_REQUIRED` 400 · `PRODUCT_NOT_FOUND` 404 (recommendation context). Zero results = UX state, not error.
- **Performance notes:** autocomplete < 100ms · search < 200ms · filter < 150ms · sort < 50ms · recommendations < 100ms · cold start < 500ms (popularity fallback); **KV TTLs: autocomplete 5 min, search results 1 min**; cursor pagination only (never offset); no N+1; cache hit rate target > 80%; rate limits: search 100/min/IP, autocomplete 60/min/IP, recommendations 30/min/IP; scale: MVP 10K products/100 QPS → Enterprise 1M+/10K QPS (Meilisearch/Typesense, then vector DB).
- **Security notes:** no personal data in the index; search queries not logged with PII; user search history encrypted at rest, analytics anonymized after 30 days; never show out-of-stock in recommendations; published-only content in index; per-IP rate limiting; SQL-injection-safe by construction.

## 8.11 S11 — Cart (T1)

- **Responsibility:** sole owner of the cart: add/remove/update/merge/persist/recover cart items from first add-to-cart through checkout entry (SC §2.1). Server-side PostgreSQL is the source of truth; client cache (TanStack Query) is never authoritative.
- **Inputs:** add/update/remove/clear/validate operations (guest token or session), login-merge trigger, recovery email clicks.
- **Outputs:** cart state + validation results (price changes, stock, availability), recovery emails, guest tokens.
- **Dependencies:** Variant/Inventory (availability read via S09), Product (active/price), Notifications (recovery emails), Configuration (TTLs).
- **Events:** P: `cart.updated`, `cart.abandoned` (7-day, TTL), `cart.recovered`, `cart.merged` **(all reg.)**. C: `auth.user.login` (merge trigger), `product.updated`/`stock.changed` (revalidation events).
- **Transactions:** **T13** — guest→customer merge on login: per-item atomic merge (duplicate variants sum quantities capped at stock, skip inactive/out-of-stock, adopt current price), one transaction per cart with outbox event; conflict resolution = higher quantity wins (cross-tab), last-write-wins per item.
- **Validation (L1/L2):** `addToCartSchema`/`updateCartItemSchema` — `variantId` UUID, quantity `int 1–10` (or stock limit); max **50 unique items** per cart; price/currency checks (INR only, price > ₹0, total = Σ lines); availability checks at validation: product active, variant active, `availableStock > 0`, `availableStock ≥ quantity`, not discontinued (SC §5.4).
- **Error cases (SC §8.11):** `CART_EMPTY` 400 · `ITEM_OUT_OF_STOCK` 422 · `INSUFFICIENT_STOCK` 422 (cart context) · `PRICE_CHANGED` 422 · `COUPON_INVALID`/`COUPON_EXPIRED`/`COUPON_MINIMUM_NOT_MET` 422 · `ADDRESS_INVALID` 422 · `PINCODE_NOT_SERVICEABLE` 422 · `PAYMENT_FAILED` 422 · `ORDER_CREATION_FAILED` 500 · `DUPLICATE_ORDER` 409.
- **Performance notes:** **cart = no cache (always fresh)**; shipping methods cache 1 min (on address change); product prices cache 5 min; coupon validation = no cache; 500ms debounce on quantity; error recovery backoff 1s/2s/4s max 3; **cart never cleared on error** (SC §13.3); guest cleanup via Workflow job at `cart.guestTtlDays = 7`, customer at `cart.customerTtlDays = 90` (canonical, DATABASE_SPECIFICATION; SC text internally inconsistent — canonical wins).
- **Security notes:** guest token = cryptographically random UUID in **httpOnly cookie**; RLS on cart tables; **no admin access to customer carts** (privacy, SC §2.10); CSRF double-submit cookie; max 5 sessions; audit add/remove with userId/guestToken; coupon attempts rate-limited 10/min.

## 8.12 S12 — Wishlist (T2)

- **Responsibility:** sole owner of saved-item management, price-drop/back-in-stock tracking, sharing, and recovery — independent from the cart module (SC §3.1).
- **Inputs:** add/remove (toggle), move-to-cart, clear, share-link requests.
- **Outputs:** wishlist views, opt-in notifications (price drop, back-in-stock, weekly digest, sale), share links.
- **Dependencies:** Variant/Product (stock + price tracking), Cart (move-to-cart = `POST /api/cart/add` + `DELETE /api/wishlist/items/:id`), Notifications (opt-in emails), Storage (share images).
- **Events:** P: `wishlist.added`, `wishlist.removed`, `wishlist.price_drop`, `wishlist.back_in_stock` **(reg.)**. C: `product.updated` (price/stock comparisons), `stock.changed`.
- **Transactions:** toggle add/remove single atomic unit; guest→login merge deduplicates by `variantId` (per-item, no conflict errors — duplicate is a toggle, not an error).
- **Validation:** `@@unique([profileId, variantId])` DB constraint + API + client optimistic check (SC §3.16); guest wishlist = localStorage, **max 50 items**, prompts login; stock check before move-to-cart.
- **Error cases:** no enumerated codes; behaviors — out-of-stock shows "Out of stock" (no action), deactivated shows "No longer available"; bulk partial success messaging.
- **Performance notes:** cache TTL **5 min**, invalidated on add/remove; price changes highlighted on load; page < 1s LCP.
- **Security notes:** share links expose **item names + images only — no personal info** (SC §3.9); RLS isolation; server-side validation always; opt-in emails respect notification preferences (owned in S03).

## 8.13 S13 — Checkout (T0)

- **Responsibility:** sole owner of the checkout flow — 5-stage state machine (CART REVIEW → ADDRESS → SHIPPING → PAYMENT → CONFIRMATION, SC §4.5) from cart validation through payment initiation and order handoff. Guest checkout supported.
- **Inputs:** `createOrderSchema` (`addressId`|`address`, `shippingMethodId`, `couponCode` ≤ 50, `paymentMethod` = `razorpay`), `verifyPaymentSchema` (`razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`), `checkoutAddressSchema` (phone `/^[6-9]\d{9}$/`, pincode `/^\d{6}$/`, city/state ≤ 100, `country` default `IN`).
- **Outputs:** `razorpayOrderId` (create-order), created order + redirect `/order-confirmed/:orderId` (verify-payment), checkout recovery emails.
- **Dependencies:** Cart (items), Payments (S16 — gateway order, verification), Inventory (S09 — **atomic synchronous reservation at payment initiation**, 15-min timeout; canonical, Blueprint line 508), Shipping (methods/rates/pincode serviceability), Orders (S14 — order creation on capture), Documents (invoice at order confirmed), Notifications.
- **Events:** P: `checkout.session.created`, `checkout.recovery.sent` **(reg.)**; forwards `payment.captured` → order creation. C: `stock.changed`, `product.updated` (revalidation at every stage).
- **Transactions:** **T4 + T1** — reservation (all-or-nothing, all variants, 15-min timeout) at payment initiation; on verification success, order creation chain (T2) runs; on failure → release reservation, payment state per canonical machine; idempotency: unique `Idempotency-Key` per attempt, `razorpayPaymentId` unique, **5-minute cooldown between orders from same user**, webhook fallback never double-creates (SC §5.10, OM §2.8).
- **Validation (L1/L2/L3, SC §5.4–§5.10, OM §2.7):** cart not empty; stock (`availableStock ≥ quantity`); price match (server amount = Razorpay amount); address valid + pincode serviceable; shipping method selected and available for address + weight limit; coupon valid (exists, active, not expired, minimum order, usage limit, user/product restriction, one per order); payment: signature valid, amount match, duplicate prevention; Total > ₹0; **re-validation at every stage** (checkout entry, payment initiation, verification); rate limit coupon 10/min, coupon min 6 chars alphanumeric.
- **Error cases:** SC §8.11 table (see S11) with `DUPLICATE_ORDER` 409; payment-prep failures (`PAYMENT_FAILED` 422, "Payment service unavailable", timeout — retryable); verification failures "Payment amount mismatch" / "Invalid payment signature" / "Order already processed".
- **Performance notes:** pre-validate cart on entry; pre-fetch shipping methods on address entry; pre-load Razorpay SDK on checkout entry; checkout form < 1.5s LCP; API < 200ms.
- **Security notes:** double validation client+server (SC §11.5); never trust client payment data (OM §13.9); Razorpay signature + amount verified server-side; idempotency keys; duplicate-submission prevention (button disable + key + cooldown + unique constraint + webhook idempotency); audit: checkout start (userId/guestToken, cartTotal), payment success/failure, coupon applied, address created.

## 8.14 S14 — Orders (T0)

- **Responsibility:** sole owner of the order lifecycle: creation pipeline, 18-state canonical machine (16 tabulated states + `failed_delivery` and `held` as guarded states — Blueprint UX-11/OM §1.8), transitions, cancellation, rejection, archival. The order is an **immutable record; status is the only mutable field** (OM §1.4).
- **Inputs:** order creation (from S13 on capture), status transition requests, cancellation/return requests, admin overrides, address corrections, notes.
- **Outputs:** order views (role-scoped), order number, status history, refund/return triggers, notifications, invoice trigger.
- **Dependencies:** Payments (S16 — capture, refund initiation), Inventory (S09 — deduction on confirm, release on cancel), Shipping (S15 — shipment status sync), Finance (S17 — records on `order.confirmed`), Documents (S25 — invoice), Notifications, Product (snapshots).
- **Events:** P: `order.created`, `order.confirmed`, `order.packing`, `order.ready_to_ship`, `order.shipped`, `order.cancelled`, `order.completed`, `order.rejected`, `order.return_requested` **(reg. for rejected/return_requested)**; notification events `order_created`, `payment_confirmed`, `order_accepted`, `order_rejected`, `order_packing`, `order_shipped`, `out_for_delivery`, `order_delivered`, `delivery_failed`, `order_cancelled`, `return_requested`, `return_approved`, `return_rejected`, `refund_processed`, `order_completed` (30 days post-delivery), `review_request` (24h post-delivery). C: `payment.captured` (creation), `shipment.delivered`, `refund.processed`.
- **Transactions:** **T2** — creation: Order + OrderItem snapshots + `OrderStatusHistory` (`pending→confirmed`) + stock deduction + cart clear + outbox, single transaction. **T3** — every transition: status change + append-only history row + (cancel/reject → `STOCK_RELEASE` + refund initiation) + outbox; one status update per request, actor-validated, optimistic locking + re-fetch on stale state.
- **Validation (L2/L3):** transition legality per OM §3.5 table only — anything else returns "Invalid status transition"; actor permissions per OM §10.6 (e.g., `pending→confirmed` Admin only; shop transitions confined to own products); window checks: customer cancel **before `packing`**, shop cancel **pre-shipment**, admin any state, reason always required; return within **7 days of delivery**; accept/reject within **48h** (SLA, `sla.acceptHours`); refund 5–7 business days; order number `NAB-YYYYMMDD-XXXXXX` **generated on confirmation**, unique per day, retry on collision; notes ≤ 500 chars; address correction allowed before `shipped` (revalidated + serviceable, shipping recalculated).
- **Error cases:** "Invalid status transition" 400 · actor mismatch 403 · `DUPLICATE_ORDER` 409 · `ORDER_CREATION_FAILED` 500 · "Payment amount mismatch"/"Invalid payment signature"/"Order already processed" · fraud severity responses (Low log / Medium flag / High hold+notify / Critical cancel+block, OM §13.5) · unauthorized access returns 404 (no existence disclosure).
- **Performance notes:** offset pagination for lists; composite indexes `(profileId, status, createdAt)`; Hyperdrive pooling; batch ops max 100 in background with job ID; status sync real-time with 30s polling fallback; per-order event ordering (outbox).
- **Security notes:** RLS on all order tables; shop owners see **masked addresses (city/state only)** and payment status only (OM §10.4); append-only immutable history, retention 7 years; CSRF; endpoint rate limits; Razorpay signature verification server-side; webhook idempotent; fraud-readiness signals (velocity, high value, new account, address mismatch, bulk purchase, IP anomaly).

## 8.15 S15 — Shipping (T0)

- **Responsibility:** sole owner of shipments: 12-state shipment machine, tracking, rates/zones, delivery/failure handling, courier abstraction (Shiprocket, Delhivery, BlueDart, DTDC; manual fallback), reverse logistics. Shipment is independent from order (one order → one or more shipments; split future) (SH §1.4).
- **Inputs:** shipment creation (from `ready_to_ship` orders), courier webhooks, manual status updates, tracking lookups, rate computations.
- **Outputs:** shipment/tracking views, label/packing-slip/delivery-proof triggers, delivery-confirmation signals, COD collection signals.
- **Dependencies:** Orders (S14 — `ready_to_ship` gate, status sync), Documents (S25 — shipping label on courier assignment `SHL` 3y retention, packing slip on packing, return label on approval, delivery proof on delivery), Notifications, Finance (S17 — cost + revenue recognition on delivery), Returns (S18 — reverse logistics), Inventory (restock on return receipt), Courier adapters.
- **Events:** P: `shipment.created` (drives Document label pipeline), `shipment.delivered` **(reg.)**, `shipment.delivery_failed`, `shipment.return_received` **(reg.)**; notification events per SH §9.4 (`shipment_created`, `packed`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `delivery_failed`, `exception`, `returned_to_sender`, `return_picked_up`). C: `order.accepted`/`order.packing` (order↔shipment mapping), courier webhooks.
- **Transactions:** shipment creation = Shipment + ShipmentItems + ShipmentEvent `created` + order→`shipped`, one unit (SH §2.5); every transition = event row + order sync + outbox; webhook + polling **dedup** (one event, not two); idempotent webhook handling; optimistic locking on status.
- **Validation (L2/L3):** transition legality per SH §3.6 + actor + reason (required for `delivery_failed`, `exception`, `returned_to_sender`); order must be `ready_to_ship`; weight ≤ 30 kg standard / 25 kg express, dimensional weight L×W×H/5000, charge higher; size ≤ 150cm (L+W+H); pincode serviceability + zone assignment; COD not offered above `cod.maxAmount = 5000`; tracking format per courier, uniqueness, existence verification; order completes when **all shipments delivered** (SH §8.4).
- **Error cases:** "Invalid shipment status transition" 400 · stale state → re-fetch (optimistic lock) · carrier API failure → backoff 1s/2s/4s/8s max 3, DLQ, **manual update fallback** (SH §11.6) · delivery failed → retry next business day, **max 3 attempts** then `returned_to_sender` + refund (shipping cost refunded on failed delivery) · stale shipment flag: no updates 48h.
- **Performance notes:** 100,000+ shipments/day target; tracking webhook-first, polling fallback every 30 min for active shipments, batch polling; append-only timestamp-ordered events; archival + offset pagination; per-shipment ordering; rate computation server-side only (never client).
- **Security notes:** courier webhook signature verification; webhook sources registered; courier API keys in env only; HTTPS; data minimization to couriers; logs exclude secrets; RLS on shipment tables; shop owners see masked address (city/state only); edit permissions — create/assign/update-tracking Shop(own)+Admin, **status/cancel/reassign/delivery-proof Admin only**; audit per SH §12.7 (created/status changed/tracking updated/delivery confirmed/exception/manual override).

## 8.16 S16 — Payments (T0)

- **Responsibility:** sole owner of money movement: payment lifecycle, gateway abstraction (Razorpay adapter — replaceable without touching order logic), refund engine, reconciliation, webhook security. **Independent from Finance (PAYMENT §1.2)** — money processing vs. financial recording.
- **Inputs:** payment initiation (from S13), verify-payment, gateway webhooks, refund requests (from S14/S18), reconciliation jobs.
- **Outputs:** payment records, gateway order IDs, verification results, refunds, reconciliation reports.
- **Dependencies:** Gateway adapter (Razorpay; interface `PaymentGatewayAdapter` in `api/_lib/payments/adapters/`), Orders (S14 — order linkage, `pending` guard), Finance (S17 — consumes payment events), Configuration (`GATEWAY_PROVIDER`).
- **Events:** P: `payment.captured` (paymentId, orderId, amount), `refund.processed`; audit `payment.*`. C: webhooks (`payment.captured`, `refund.processed` — signed, idempotent), `order.cancelled`/`order.rejected`/`return.approved` (refund triggers).
- **Transactions:** **T4** — capture: payment record `captured` + order confirmation chain; `gatewayPaymentId` unique; webhook processed once (cached result). **T5** — refund: Refund row + payment aggregate derivation (refunded/partially_refunded computed from refund records, never stored) + outbox.
- **Validation (exact):** amount — INR only, min ₹1, max ₹10,00,000, exactly 2 decimals, DECIMAL(10,2) everywhere; paise conversion **only at adapter boundary**; capture/verify: signature (HMAC-SHA256) + amount match; refund preconditions (PAYMENT §7.7): payment captured, not already refunded, refund ≤ original, ≤ remaining refundable, **within 180 days**, reason required; payment timeout 15 min → `expired` → release inventory; webhook: signature + **5-minute timestamp freshness** + nonce/replay tracking; per-user velocity: 5-min cooldown, max 5 payments/hr.
- **Error cases:** `PAYMENT_FAILED` 422 · `PAYMENT_AMOUNT_MISMATCH` 422 · `INVALID_PAYMENT_SIGNATURE` 422 · `DUPLICATE_ORDER`/duplicate capture 409 · `REFUND_EXCEEDS_PAYMENT` 400 · `REFUND_WINDOW_EXPIRED` 400 · `ALREADY_REFUNDED` 409 · stale webhook → non-2xx (provider retries; never return 200 on failure — PAYMENT §15.3).
- **Performance notes:** webhook processing < 5s (background); retry cooldown 30s, max 3 attempts, transient errors only, circuit breaker; reconciliation daily automated (gateway recon, settlement match, payment verify, daily recon), real-time for critical; conflict resolution: **gateway is source of truth** (PAYMENT §9.8).
- **Security notes:** signature verification on every webhook (HMAC-SHA256, `X-Nabome-Signature` = `${timestamp}.${payload}`); replay prevention; idempotency + unique constraints against double charge; no gateway SDK imports in business handlers; amount verification against order total; COD: courier collection webhook → `captured`, daily courier settlement reconciliation.

## 8.17 S17 — Finance (T0)

- **Responsibility:** sole owner of financial recording: append-only finance records, commission calculation, earnings, settlements, and reversal. **Records business events; never processes money** (PAYMENT §1.2 independence).
- **Inputs:** consumption of order/payment/shipping/return events, settlement period runs, admin settlement actions, manual adjustments.
- **Outputs:** finance records (transaction/earnings/commission/settlement history), settlement state transitions, reversal records, reports data.
- **Dependencies:** Orders (S14), Payments (S16), Shipping (S15 — cost + delivery), Returns (S18), Configuration (rates, hold days), Documents (settlement receipts).
- **Events:** P: `settlement.created`, `settlement.approved`, `settlement.paid`, `settlement.reversed`, `finance.record.created` **(reg.)**. C: `order.confirmed` (**finance records + commission + earnings created here — resolves PAYMENT §6.7 "on capture" vs FINANCE §8.4 "order confirmed" conflict: capture precedes confirmation, so the `order.confirmed` event is the single trigger**), `order.shipped` (actual courier cost recorded), `order.delivered` (**7-day hold starts**), `payment.captured`, `refund.processed`, `order.cancelled`/`return.received` (adjustments).
- **Transactions:** **T8** — settlement transition + earnings ledger rows + outbox, single unit; **T6** — refund→finance reversal: append-only reversal record, idempotent on `(settlementId, orderId)`/`refundId`.
- **Validation (L2):** commission — global default 15% (range 0–50%), max cap default 50% (config 10–100%), hierarchy Shop > Category > Global, snapshot at order time, formula `commission = itemTotal × rate / 100` rounded 2dp, capped at `maxCommissionPerOrder` and never > item total; hold period **7 days from delivery** (`finance.holdDays = 7`); settlement period weekly default (Mon–Sun, cut-off 23:59:59 UTC), min settlement ₹100; idempotent per period; reversal: from `COMPLETED` only (per canonical machine — not from terminal `PAID`; forward state, never deletion), admin approval + reason + audit.
- **Error cases:** `SETTLEMENT_NOT_FOUND` 404 · `SETTLEMENT_STATE_INVALID` 409 · `COMMISSION_INVALID` 422 (out of range) · `DUPLICATE_SETTLEMENT` 409 · `SETTLEMENT_MINIMUM_NOT_MET` 422 · reversal without approval 403.
- **Performance notes:** balances **computed from the transaction log on read — never stored without invalidation** (FINANCE §1.10); append-only ledgers scale to 1M+ records; reports via materialized views / S26; reconciliation of settlement = Σ captured payments minus gateway fees.
- **Security notes:** financial class records, 7-year retention, archived never deleted (AUDIT §8.3); admin-only settlement approval (`approve`, `create` Admin only — FINANCE §10.10); RLS; every record append-only with reason; settlement payout methods: Digital (UPI/bank via gateway) default, Manual admin-processed.

## 8.18 S18 — Returns (T1)

- **Responsibility:** sole owner of return requests: eligibility, evidence, approval/rejection within SLA, reverse-logistics trigger, restock signal, refund handoff. Drives the resolution lifecycle (CC-22/32).
- **Inputs:** return requests (order number + email for guests), evidence photos, approval decisions, pickup scheduling.
- **Outputs:** resolution states, reverse-logistics shipments (via S15), restock events, refund requests (via S16).
- **Dependencies:** Orders (S14 — return window, status → `returned`), Shipping (S15 — reverse logistics), Payments (S16 — refund), Inventory (S09 — restock on receipt), Notifications.
- **Events:** P: `return.requested`, `return.approved`, `return.rejected`, `return.received`, `return.refund_initiated` **(reg.)**; notification `return_requested`/`return_approved`/`return_rejected`. C: `order.delivered` (window opens), `shipment.return_received`.
- **Transactions:** **T7** — chain of atomic units, each step its own transaction, chained by events: approval (+ reverse-logistics trigger) → pickup → received (+ restock `ORDER_RETURN`) → refund initiation (CC-32). No long-running transaction.
- **Validation (L2):** within **7 days of delivery** (`sla.returnWindowDays`); one-time per item; condition unused with tags; exceptions (undergarments, final sale) not returnable; reason required from `wrong_size | wrong_item | defective | not_as_described | changed_mind | quality_issue`; evidence photo; shop responds within **48h** (`sla.reviewHours`); partial returns supported; partial return dropping order below free-shipping threshold → shipping charged.
- **Error cases:** `RETURN_WINDOW_EXPIRED` 410 · `RETURN_ALREADY_EXISTS` 409 · `ITEM_NOT_RETURNABLE` 422 · `EVIDENCE_REQUIRED` 422 · `RESOLUTION_NOT_FOUND` 404.
- **Performance notes:** resolution states cached via events; pickup slots via courier API (future); 48h review SLA enforced by Workflow job alerts.
- **Security notes:** returns scoped to order owner (or order number + email for guests); admin can override any step with reason; every step audited; refund amount never computed client-side.

## 8.19 S19 — Refunds (T0)

- **Responsibility:** sole owner of refund lifecycle mechanics (owned by S16 Payments; orchestrated by S14 Orders and S18 Returns). **Responsibility lives in Payments; this catalog row exists to register the orchestration contract.**
- **Inputs:** refund triggers (order cancellation/rejection/return approval), refund decisions (full/partial), gateway responses.
- **Outputs:** refund records (`initiated → processing → completed → settled`, `failed` retryable), payment aggregate updates, commission/earnings reversals (via S17).
- **Dependencies:** Gateway adapter (Razorpay refund API), Orders (S14), Returns (S18), Finance (S17 — reversals).
- **Events:** P: `refund.initiated`, `refund.processed`, `refund.settled` **(reg.)**; C: `order.cancelled`, `order.rejected`, `return.approved`, `shipment.return_received`, courier `COD` collection failures.
- **Transactions:** **T5/T6** — refund row + aggregate + outbox; reversal idempotent on `refundId`; `refund.processed` consumed by Finance once.
- **Validation (PAYMENT §7.7):** payment captured; not already refunded; amount ≤ original and ≤ remaining refundable; within **180 days** of payment; reason required; partial refunds multiple, remaining balance tracked; refund timeline **5–7 business days** (ETA shown to customer).
- **Error cases:** `REFUND_EXCEEDS_PAYMENT` 400 · `REFUND_WINDOW_EXPIRED` 400 · `ALREADY_REFUNDED` 409 · `REFUND_FAILED` 500 (retry queue + admin alert) · gateway decline → retry with backoff, DLQ after 3.
- **Performance notes:** async processing with backoff; aggregate `refunded`/`partially_refunded` derived on read (ML-03), never stored.
- **Security notes:** refunds only to original payment method; admin-only overrides with reason; 180-day window and settlement reversals audited (7-year financial class); no double payout — idempotency key + unique constraint per refund.

## 8.20 S20 — Reviews (T2)

- **Responsibility:** sole owner of ratings, reviews, questions, and moderation: verified-purchase gating, versioned edits, trust signals (helpful votes, featured), review requests.
- **Inputs:** review/rating submissions, edits, question posts, moderation decisions, report flags.
- **Outputs:** review/rating views, verified badges, review requests, moderation queue, aggregate ratings data.
- **Dependencies:** Orders (S14 — verified purchase, delivery events), Notifications (review request 24h after delivery), Storage (S30 — photo uploads WebP), Audit.
- **Events:** P: `review.created`, `review.updated`, `review.moderated`, `review.request.sent` **(reg.)**; notification `review_request` (24h after delivery). C: `order.delivered`.
- **Validation (L2, exact):** rating integer 1–5 (`RATING_VALUE_INVALID`/`REVIEW_RATING_INVALID`); **only verified purchasers may publish** (hard rule #1); rating allowed **24h after delivery** (premature-rating prevention); review window **90 days from delivery**; edit window **30 days from submission**; every edit creates a new version record — versions retained indefinitely (ReviewVersion, audit trail); cannot review same product within 24h (rapid-fire prevention); rate limits: create 5/24h, edit 10/24h, question 5/24h, report 10/24h, helpful vote 50/24h.
- **Error cases:** `RATING_VALUE_INVALID` 422 · `REVIEW_WINDOW_EXPIRED` 410 · `REVIEW_NOT_VERIFIED_PURCHASE` 403 · `REVIEW_EDIT_WINDOW_EXPIRED` 410 · `REVIEW_ALREADY_EXISTS` 409 · `REVIEW_RATE_LIMITED` 429.
- **Performance notes:** moderation SLA **24h**; aggregate rating derived from review records (never stored without invalidation); caching per product aggregate; photos converted to WebP; pagination 24.
- **Security notes:** moderation of all content within 24h SLA; report/abuse handling; no PII in published reviews; shop owners cannot edit customer reviews (admin may moderate all); version history retained indefinitely for compliance.

## 8.21 S21 — CMS (T2)

- **Responsibility:** sole owner of the content domain: 7 content types (page, landing-page, blog-article, announcement, faq, policy, reusable-block) in one universal `CmsContent` table, versioning, review workflow, taxonomy, relationships, sitemap.
- **Inputs:** content create/edit/submit/review/publish/schedule/archive/soft-delete, block operations, reusable-block operations.
- **Outputs:** published content views, version snapshots, sitemap entries, review assignments, moderation queue.
- **Dependencies:** Storage (S30 — media: Cloudinary images ≤ 10MB, videos ≤ 500MB; R2 docs ≤ 50MB), Audit, Workflow (scheduled publish cron), Notifications (review escalations).
- **Events:** P: `cms.content.published`, `cms.content.unpublished`, `cms.content.archived`, `cms.content.review_requested` **(reg.)**. C: `product.published` (landing/reusable blocks referencing products), `system.maintenance`.
- **Transactions:** **T10** — publish = version snapshot + status change + KV invalidation + audit, atomic (draft→published swap); scheduled publish: cron every minute selects `scheduledAt <= now()` pending rows, retries failed up to 3 (exponential), failure → draft + notify admin.
- **Validation (L1/L2):** lifecycle `created → draft → pending_review → approved → published` (+ `scheduled`, `unpublished`, `archived`, `deleted`); blocks Zod-validated (25 canonical block types, registry-driven); DOMPurify whitelist (blocked: `script, iframe, object, embed, form, input, textarea, select`; blocked attrs `onclick/onerror/onload/style`); content cannot publish with accessibility errors; image blocks require alt text; title ≤ 500; slug regex `/^[a-z0-9-]+$/`, unique per `(typeId, slug, locale)`; locale enum `en-IN | bn-IN | hi-IN` (canonical); max 100 versions per content (oldest auto-archived); SEO title 50–60 / description 150–160; authors cannot review own content; escalation if review pending > 48 hours.
- **Error cases:** `CONTENT_NOT_FOUND` 404 · `CONTENT_SLUG_DUPLICATE` 409 · `CONTENT_BLOCK_INVALID` 422 · `CONTENT_PUBLISH_REQUIRES_BLOCK` 422 · `CONTENT_ACCESSIBILITY_BLOCKED` 422 · `CONTENT_VERSION_LIMIT` 409 · `CONTENT_NOT_EDITABLE_IN_STATE` 409.
- **Performance notes:** published content cached 1h (invalidated on publish/unpublish); sitemap regenerated on publish, cached 1h; taxonomy cache 24h; reusable-block cache 30 min; media URLs cached 7 days; GIN trigram + full-text indexes.
- **Security notes:** role matrix `admin | editor | author | reviewer | vendor` per content type; soft delete only (`isDeleted`); audit log 90 days active / 1 year archived; XSS protection by block whitelist + sanitizer; published-only visibility; RLS.

## 8.22 S22 — Homepage Builder (T2)

- **Responsibility:** sole owner of the homepage structure: ordered section composition, versioned draft/publish lifecycle, rollback, templates, section registry.
- **Inputs:** homepage/section edits (admin-only), publish/rollback, section reorder, template saves.
- **Outputs:** rendered homepage config (KV-cached), section versions, published snapshots.
- **Dependencies:** CMS (block standards), Storage (media), KV (rendered config), Audit.
- **Events:** P: `homepage.published`, `homepage.rolled_back` **(reg.)**. C: `collection.published`, `product.published` (data-source sections refresh).
- **Transactions:** **T10** — atomic draft→published swap + version increment + KV invalidation + audit + optional publish note; rollback = create draft from old version then publish.
- **Validation (L1/L2):** `HomepageConfig` status `draft | published | archived` — one active draft, one published only; 18 canonical section types (hero-banner, hero-video, product-grid, featured-collection, featured-categories, promo-banner, flash-sale, countdown, newsletter, testimonials, blog-preview, rich-content, image-gallery, video-block, cta-block, spacer, divider, custom); section `type` immutable after creation; every type has a Zod schema; URL/HTTPS validation on CTAs; DOMPurify on `custom` HTML, sandboxed JS (admin-only inline); images ≤ 10MB/≤ 4000×4000; unknown fields stripped on save; token-based values only (no hardcoded colors/typography).
- **Error cases:** `HOMEPAGE_NOT_FOUND` 404 · `HOMEPAGE_VERSION_LIMIT` 409 (keep last 50 versions) · `SECTION_TYPE_IMMUTABLE` 409 · `SECTION_CONFIG_INVALID` 422 · `HOMEPAGE_DRAFT_EXISTS` 409 · `HOMEPAGE_PUBLISHED_EXISTS` 409.
- **Performance notes:** rendered config cached in KV edge, **5-min TTL, invalidated on publish**; versions older than 90 days auto-archived; rate limit 100 req/min/admin; idempotency keys on all writes.
- **Security notes:** admin-only endpoints (`/api/cms/homepage/*`); audit every write and state change; published config frozen read-only; soft-delete only (`isActive = false`); CSP enforced on rendered output.

## 8.23 S23 — Notifications (T1)

- **Responsibility:** sole owner of notification delivery: event→channel/priority mapping, in-app rows, email (Resend), delivery attempts, templates, digests (future). Every communication is triggered by a business event (NTF §1.4).
- **Inputs:** business events (via outbox), delivery confirmations/bounces, preference changes.
- **Outputs:** in-app notifications, emails, delivery-attempt records, template renders.
- **Dependencies:** event outbox (shared), Templates, Configuration (senders), Storage (attachments), Customer preferences (owned in S03 — read-only here).
- **Events:** C: every registered domain event (order.*, payment.captured, shipment.*, auth.*, settlement.*, product.published, inventory.low_stock, review.*, system.*); P: `notification.sent`, `notification.delivery_failed`, `notification.bounced` **(reg.)**.
- **Transactions:** notification row + outbox consumption are idempotent on `eventId` (unique); delivery attempt rows append-only; **at-least-once, consumers idempotent, ordered per event type**.
- **Validation (L2/L4):** event→channel/priority matrix (canonical NTF §3.5): e.g., `auth.password_reset` Email/Urgent, `order.shipped` Email+In-App/High, `order.packing` In-App/Normal, `settlement.paid` Email+In-App/High, `inventory.low_stock` Email/Normal; preferences: security + in-app channels cannot be disabled; marketing requires explicit opt-in (CAN-SPAM); quiet hours + timezone honored (default `Asia/Kolkata`); priority retry classes — **Urgent 5@1s, High 3 exp, Normal 3 exp, Low 2 linear, Background 1**; no retry on 4xx/invalid email/bounce; DLQ after max, admin alert if DLQ > 10/hour.
- **Error cases:** `TEMPLATE_NOT_FOUND` 404 · `CHANNEL_UNAVAILABLE` 503 (retryable) · `RECIPIENT_INVALID` 422 (no retry) · `BOUNCE_PERMANENT` 410 · `PREFERENCE_BLOCKED` 403 (security/in-app cannot be disabled) · `DLQ_ALERT` (ops).
- **Performance notes:** queue poll 5s, batch 10, max 3 concurrent workers per channel, 30s timeout per attempt; batch ≤ 500 recipients with 10s between batches; scheduled deliveries separate queue; in-app read via polling 30s (WebSocket future); full-text notification search (min 2 chars, 200ms debounce, max 50 results); rate limits: read 100 ops/min, search 30/min, preference changes 10/min; email rate limit 500/hour; templates cached request-lifetime, one active version per template.
- **Security notes:** RLS on notification tables; **retention canonical: user-facing in-app rows 90 days then deleted; delivery/audit records per audit class (security 5y, financial 7y, never before deadline)** — resolves the Data Lifecycle vs NTF §4.8 conflict in favor of Data Lifecycle's 90-day user rows + class-based delivery logs; notification content immutable after creation; one-click unsubscribe on marketing; transactional From `noreply@nabome.online`, marketing `hello@nabome.online`; DKIM/SPF/DMARC.

## 8.24 S24 — Messaging (T2)

- **Responsibility:** sole owner of internal conversations — **Admin ↔ Shop Owner only** (no shop↔shop, no customer threads via this system); linked-entity threads (order, product, settlement, refund, return), read receipts, internal admin notes.
- **Inputs:** conversation/message create, reply, resolve/close/reopen, report, attachment uploads.
- **Outputs:** thread views, read state, unread counts, internal notes.
- **Dependencies:** Shop Owner (S04 — tenant scoping), Storage (attachments), Audit.
- **Events:** P: `messaging.conversation.created`, `messaging.message.sent`, `messaging.conversation.resolved` **(reg.)**.
- **Transactions:** message insert append-only + read-receipt update atomic; one thread per linked entity.
- **Validation (L2):** conversation category `order | product | finance | general | system`; status `open | resolved | closed` with **auto-close after 14 days inactivity** (either party reopens); priority `low | normal | high | urgent`; content sanitized (rich text/markdown, profanity filter); attachments ≤ 5/message (images ≤ 5MB, documents ≤ 10MB, malware-scanned, encrypted at rest); spam control max 10 messages/conversation/min; pagination 50/page.
- **Error cases:** `CONVERSATION_NOT_FOUND` 404 · `MESSAGE_TOO_LONG` 422 · `ATTACHMENT_LIMIT` 422 · `RATE_LIMITED` 429 · `CONVERSATION_LINKED_ENTITY_CONFLICT` 409.
- **Performance notes:** message send < 100ms target; full-text search (content, sender, date range, status, priority, category, linked entity); lazy loading + virtualization.
- **Security notes:** **permanent append-only business records — never physically deleted (canonical; supersedes Data Lifecycle's 90-day message deletion)**; edits preserve original + edit timestamp; sender deletes own message within 10 minutes, admin soft-delete any; `isInternal` admin notes never visible to shop owners; RLS + multi-tenant `shopId` isolation.

## 8.25 S25 — Documents (T1)

- **Responsibility:** sole owner of document generation — **no business module generates documents; all generation flows through this pipeline (PS-04)**. Immutable official records: PDF in R2, metadata in Postgres (never PDF bytes in DB).
- **Inputs:** generation triggers (events), on-demand requests (admin/customer/shop), regeneration requests (admin, reason required).
- **Outputs:** generated documents (PDF/CSV/XLSX), version chains, signed URLs, audit rows.
- **Dependencies:** Storage (S30 — R2 buckets `nabome-documents`, `nabome-documents-archive`), Workflow (async job queue), Notifications (download-link delivery), Audit.
- **Events:** C: `order.confirmed` (Invoice `INV` + Order Summary `ORD`), `payment.captured`/COD collected (Payment Receipt `PRC`), `order.packing` (Packing Slip `PKS`), `shipment.created`+courier assigned (Shipping Label `SHL` — Blueprint line 971), `return.approved` (Return Slip `RET`), `refund.processed` (Refund Receipt `RFD`), `settlement.completed` (Settlement Report `STL`); P: `document.generated`, `document.regenerated`, `document.failed` **(reg.)**.
- **Transactions:** **T11** — job enqueue idempotent on `(documentType, businessId, version)`; generation itself async (9-step pipeline: TRIGGER → VALIDATE → SELECT TEMPLATE → POPULATE → RENDER HTML → GENERATE PDF (SHA-256 checksum) → STORE → NOTIFY → SERVE); no in-place updates — every regeneration is a new version chained via `replacedBy`, all versions retained, no limit.
- **Validation (L2):** document type registry (prefixes `INV/PRC/ORD/PKS/RET/RFD/STL/FIN/EXP/AUD/CST/SST/SHL/CUS/CRT`); display ID `{PREFIX}-YYYY-NNNNNN` year-scoped, never reused; `publicId` `GDOC_` + base32; invoice data validation — GST rules, CGST+SGST (intra-state) or IGST (inter-state), HSN, seller/buyer GSTIN, tax split consistency, totals = Σ items + shipping − discounts; checksum verification on every download (mismatch → flag + notify + regenerate).
- **Error cases:** `DOCUMENT_TYPE_INVALID` 422 · `DOCUMENT_DATA_INVALID` 422 (validation failure) · `TEMPLATE_NOT_FOUND` 404 · `DOCUMENT_GENERATION_FAILED` 500 (retry 3, DLQ) · `DOCUMENT_NOT_FOUND` 404 · `REGENERATION_REQUIRES_REASON` 422 · `DOCUMENT_ACCESS_DENIED` 403.
- **Performance notes:** concurrency 10 workers, ≤ 5 parallel generations; single doc < 5s, PDF < 3s, render < 1s, upload < 2s, signed URL < 100ms, first byte < 500ms; bulk 50 docs < 2 min; rate limits: generate 10/user/min, regenerate 5/min (admin only); signed URLs **1 hour expiry** (KV-cached 55 min), optional single-use, `Cache-Control: private, no-cache`, download 60/user/min.
- **Security notes:** financial/audit documents **never deleted even if parent is hard-deleted** (compliance); retention per registry (INV/PRC/RFD/STL/FIN/AUD 7y permanent, ORD/RET/CST/SST 3y, PKS/SHL 1–3y, EXP 30 days auto-delete); hard-delete only after retention + 7 days, admin only; RLS; audit every generation/download/regeneration/archive/denial with checksum; template changes never affect existing documents.

## 8.26 S26 — Reports (T2)

- **Responsibility:** sole owner of reporting/BI reads: dashboard KPIs, 16 report families, exports. **Read-only — never writes business data; queries PostgreSQL/materialized views directly (single source, no conflicting numbers — EXPORT §1.7).**
- **Inputs:** report requests (filters, date ranges), export requests, scheduled-report definitions (future).
- **Outputs:** report data (cached), CSV/XLSX exports, dashboard aggregates.
- **Dependencies:** materialized views (owned by S26: `daily_sales_summary`, `monthly_revenue_summary`, `product_performance_summary`, `customer_growth_summary`, `inventory_health_summary`, `shipping_performance_summary`, `refund_trend_summary`, `category_performance_summary`), Storage (R2 export files), Workflow (large jobs), Notifications ("export ready").
- **Events:** P: `report.export_requested`, `report.export_ready`, `report.export_failed` **(reg.)**. C: all business events (materialized-view refresh signals).
- **Transactions:** none (reads only); materialized views refreshed **CONCURRENTLY** (non-blocking).
- **Validation (L2/L4):** row limit **100,000 rows**; file size **50MB**; formats CSV (UTF-8 BOM, CRLF, RFC 4180) / XLSX; small datasets (< 10K rows) synchronous, large (> 10K) background job streamed to R2; signed URLs **15-minute expiry, one-time use** (regenerate with same parameters after expiry within retention); report sensitivity tiers: Financial/Audit High, Revenue Medium — PII masked in exports unless authorized (emails/phones masked); currency DECIMAL(10,2) ₹; UTC storage, local display.
- **Error cases:** `REPORT_INVALID_FILTER` 400 · `EXPORT_LIMIT_EXCEEDED` 422 (rows/size) · `REPORT_NOT_FOUND` 404 · `EXPORT_EXPIRED` 410 (regenerate allowed) · `EXPORT_FORBIDDEN` 403 (tier/PII).
- **Performance notes:** KV caches — dashboard KPIs 5 min (write-event invalidated), real-time counters 1 min, trend data 15 min, report data 15 min; exports/reports retained **30 days** then deleted (daily 2am cleanup); future data warehouse (BigQuery/Snowflake/ClickHouse) behind ETL pipeline — never changes the service contract.
- **Security notes:** role-scoped report access (Admin full, Shop owner own-shop scoped, masked PII); GDPR own-data export; export files deleted after retention, never longer; no personal data beyond authorization; report generation and downloads audited.

## 8.27 S27 — Audit (T1)

- **Responsibility:** sole owner of the append-only audit log: capture, class-based retention, warm/cold archival, audit exports. Every service emits state-change events with full context; **nothing is ever edited or deleted** (IS-05/06/07/09).
- **Inputs:** audit events from all services (outbox), audit export requests.
- **Outputs:** queryable audit trail, class-based retention enforcement, exports.
- **Dependencies:** event outbox (shared), Workflow (archival jobs), Storage (archival).
- **Events:** P: `audit.entry.written`, `audit.archive.completed` **(reg.)**; C: all domain events (state-change capture).
- **Transactions:** append-only insert + outbox, one unit; archive transitions are new rows, never moves.
- **Validation (L2):** event schema: actor {id, role}, action, resource {type, id}, context {ip, userAgent, shopId}, before/after states, timestamp UTC; retention classes per **AUDIT §8.3 (canonical)**: Financial transactions 7y · Tax records 7y · Consent records account-lifetime + 7y · Security events 5y · Configuration changes 5y · Authentication events 3y · Product changes 3y · User actions 2y · System events 1y · User/Shop-scoped events account/shop lifetime + 7y; warm archive 90d–2y (compressed), cold 2–7y (archive table), **never hard-deleted**.
- **Error cases:** `AUDIT_EVENT_INVALID` 422 · `AUDIT_EXPORT_FORBIDDEN` 403 · `AUDIT_QUERY_TOO_WIDE` 400 (bounded queries).
- **Performance notes:** append-only writes are T0-safe (batched, async capture never blocks business transactions); queries bounded with pagination + date ranges; export via S26; tamper-evidence via checksums/chaining.
- **Security notes:** admin-only reads/exports (masked PII per report tiers); append-only enforced at DB layer (no update/delete grants); encryption at rest; audit of audit-access itself; 4-hour flagged-content SLA belongs to content moderation (S20/S21), not this service.

## 8.28 S28 — Configuration (T1)

- **Responsibility:** sole owner of platform configuration and feature flags: typed keys, env-var overrides, change history, flag evaluation (ML-14, UX-15, DI-03). **Modules reference keys — never duplicate values.**
- **Inputs:** config mutations (admin), flag evaluations (all services), env overrides (deploy).
- **Outputs:** typed config values, feature-flag decisions, change history.
- **Dependencies:** Audit (config changes 5y class), Authentication/Authorization.
- **Events:** P: `config.updated`, `config.flag_changed` **(reg.)** — consumed for cache invalidation.
- **Transactions:** single-key atomic update + history row + audit.
- **Validation (L2):** key registry is typed (Decimal/Int/Bool/Enum/JSON); canonical keys (binding): `shipping.standardRate = 99`, `shipping.expressRate = 199`, `shipping.freeThreshold = 999`, `finance.holdDays = 7`, `finance.commissionDefault = 15`, `finance.commissionMax = 50`, `finance.minimumSettlement = 100`, `sla.responseHours = 24`, `sla.reviewHours = 48`, `sla.acceptHours = 48`, `sla.resolutionDays = 7`, `sla.flaggedContentHours = 4`, `cod.maxAmount = 5000`, `cod.enabled`, `cart.guestTtlDays = 7`, `cart.customerTtlDays = 90`, `inventory.lowStockThreshold = 10`, `inventory.reservationTimeoutMin = 15`, `pagination.defaultSize = 24`, `search.maxResults = 50`, `notifications.maxBatch = 500`; unknown keys rejected; env override precedence documented per key; values validated within documented ranges.
- **Error cases:** `CONFIG_KEY_NOT_FOUND` 404 · `CONFIG_VALUE_INVALID` 422 · `CONFIG_KEY_READONLY` 409 (env-locked) · `CONFIG_FLAG_UNKNOWN` 404.
- **Performance notes:** KV cache 10 min, invalidated on change event; flag evaluation is a cache hit in request path; no per-request DB reads.
- **Security notes:** admin-only mutation; change history immutable; env secrets never exposed via API; feature flags default-deny (off) unless enabled; every change audited (5y class).

## 8.29 S29 — Workflow (T1)

- **Responsibility:** sole owner of scheduling and job execution: PG job tables (durable leases), Cloudflare Queues (fire-and-forget), the canonical event registry (AUTOMATION Appendix A), retry/DLQ policy (DI-01, PS-21, IS-09).
- **Inputs:** job definitions from all services, scheduled job triggers, event registrations, retry/DLQ handling.
- **Outputs:** executed jobs, lease claims, dead-letter alerts, registry entries.
- **Dependencies:** Postgres (job tables), Cloudflare Queues, Configuration, Notifications (alerts), Audit.
- **Events:** P: `workflow.job.failed`, `workflow.job.dead_letter`, `workflow.job.scheduled` **(reg.)**; owns the registry that **registers** (not invents) every event named in §8.
- **Transactions:** job enqueue/claim/complete/fail as atomic row operations (lease-based claim prevents double execution); enqueue idempotent by job key.
- **Validation (L2):** job classes with per-class timeouts (cleanup 60min, archive 30min, backup 60min, restore 120min); retries per job definition, DLQ after max; scheduled jobs (binding register): cart expiry daily, order auto-complete 30 days post-delivery, reservation-release every 5 min, settlement period timers, daily 2am cleanup (sessions/carts/exports/reports), daily 3am orphan detection, weekly Sunday 3am media integrity, monthly 1st 3am archive verification, hourly low-stock alerts, review-request 24h after delivery, content scheduled-publish every minute, audit archival jobs.
- **Error cases:** `JOB_NOT_FOUND` 404 · `JOB_CLAIM_CONFLICT` 409 (lease taken — retry) · `JOB_EXHAUSTED` 410 (DLQ) · `JOB_DEFINITION_INVALID` 422.
- **Performance notes:** lease claims with heartbeat; parallel workers bounded per class; per-entity ordering via job keys; DLQ alerting thresholds (e.g., > 10/hour) with admin alert; all jobs idempotent by construction.
- **Security notes:** jobs execute with the least-privilege service identity; job payloads validated; DLQ review admin-only; job history audited.

## 8.30 S30 — Storage (T1)

- **Responsibility:** sole owner of media/file storage and uploads: presigned URLs, upload tokens, provider abstraction (R2 primary, Cloudinary for images), key layout, integrity (DI-04/05/07).
- **Inputs:** presign requests, upload completions, media metadata changes, integrity jobs.
- **Outputs:** presigned upload URLs + tokens, media records, retrieval URLs, integrity reports.
- **Dependencies:** Authentication/Authorization (ownership), Configuration (limits), Workflow (integrity jobs), Audit.
- **Events:** P: `storage.upload.completed`, `storage.media.deleted`, `storage.integrity.failed` **(reg.)**. C: document/entity events (cleanup cascade).
- **Transactions:** upload token issue + media record insert atomic; media delete is soft-first (orphan detection daily 3am).
- **Validation (L2):** per-type limits (binding, STORAGE §9): image ≤ 10MB JPEG/PNG/WebP/GIF, 400×400–4000×4000px; CMS image ≤ 10MB (+SVG) up to 4000×2000; video ≤ 100MB MP4/WebM, 320×240–1920×1080; document/export ≤ 50MB CSV/XLSX; MIME + magic-byte checks; key pattern `nabome/{domain}/{entity-uuid}/{asset-type}/{filename}`; buckets environment-suffixed; rate limits: presign 10/min (anti token-farming), per-type upload throttles (image 5/min, video 2/min, document 5/min).
- **Error cases:** `FILE_TOO_LARGE` 422 · `FILE_TYPE_INVALID` 422 · `UPLOAD_TOKEN_INVALID` 401 · `UPLOAD_TOKEN_EXPIRED` 410 · `UPLOAD_RATE_LIMITED` 429 · `MEDIA_NOT_FOUND` 404 · `INTEGRITY_MISMATCH` 500 (flag + quarantine).
- **Performance notes:** direct-to-provider uploads (never through API handlers); CDN caching (images 24h URL-based); EXIF stripping; automatic format conversion (WebP/AVIF) and responsive variants; weekly media-integrity job; orphan detection daily 3am; signed URL serving < 500ms.
- **Security notes:** private-for-draft/public-for-published ACL (draft media never publicly readable); upload tokens single-use, short expiry, scoped to entity + owner; virus-scan readiness; RLS on media records; audit of upload/delete/deny; PII-bearing media encrypted at rest; retention per owning entity's class (7y documents, 90d exports, etc. — enforced with S25/S26).

---

# 9. Business Logic Ownership

Every business rule, validation rule, calculation, state transition, authorization decision, workflow decision, and event publication has exactly one owning service (B1, B3, §3.3). These tables are the binding assignment; any logic not listed here is a defect to be assigned (§3.3.2).

## 9.1 Business Rules Ownership

| # | Rule | Owning service |
|---|---|---|
| R1 | Product lifecycle, publish gate (≥ 1 active variant with stock), completeness score, featured/trending caps, `meta` shape `{material, care[], origin}` | S05 Product |
| R2 | Category depth ≤ 5, one primary category per product, inactive-parent visibility | S06 Category |
| R3 | Collection rules/operators, 500-item soft cap, ≤ 6 featured, seasonal windows | S07 Collection |
| R4 | Attribute/variant rules, SKU immutability, price resolution `variant.price ?? product.basePrice` + sale priority | S08 Variant |
| R5 | `availableStock = stock − reservedStock` (only availability truth), status bands, movement semantics, 15-min reservation timeout | S09 Inventory |
| R6 | Search relevance/boosts, max 50 results, autocomplete rules, cursor pagination | S10 Search |
| R7 | Cart caps (50 items, qty ≤ 10), merge rules, recovery schedule, guest/customer TTLs | S11 Cart |
| R8 | Wishlist duplicate = toggle, guest 50-item cap, opt-in notifications | S12 Wishlist |
| R9 | Checkout discount/total sequence, coupon rules (one per order, caps, minimums), tax split CGST/SGST/IGST, re-validation at every stage, Total > ₹0 | S13 Checkout |
| R10 | Order number scheme, 16-state + guarded transitions, cancellation matrix, rejection reasons, 48h accept SLA, 30-day auto-complete, notes ≤ 500, address-correction window | S14 Orders |
| R11 | Shipping rates/zones (zone > base), free ≥ ₹999 (standard only), weight/size limits, dimensional weight, 3-attempt failure rule, 48h stale flag | S15 Shipping |
| R12 | Money rules (INR, DECIMAL(10,2), min ₹1 / max ₹10,00,000, paise at adapter only), payment timeout, refund preconditions incl. 180-day window | S16 Payments |
| R13 | Commission hierarchy/formula/caps, 7-day hold, settlement period/minimum/idempotency, reversal approval | S17 Finance |
| R14 | Return window 7 days, one-time per item, exceptions, 48h review SLA, restock on receipt | S18 Returns |
| R15 | Refund timing 5–7 business days, aggregate derivation | S16/S19 Refunds |
| R16 | Review gating (verified purchase, 24h post-delivery, 90-day window, 30-day edit), moderation 24h SLA | S20 Reviews |
| R17 | CMS lifecycle, review workflow (no self-review, 48h escalation), block registry, publish accessibility gate | S21 CMS |
| R18 | Homepage draft/publish invariants (one draft, one published), 50-version cap, 90-day version archive | S22 Homepage |
| R19 | Event→channel/priority matrix, quiet hours, non-disableable channels, marketing opt-in, retry classes | S23 Notifications |
| R20 | Conversation scope (admin↔shop), auto-close 14 days, attachment/spam limits, permanence | S24 Messaging |
| R21 | Document registry, numbering, version chain, GST invoice data rules, regeneration reason | S25 Documents |
| R22 | Report/export limits (100K rows / 50MB / 15-min one-time URL / 30-day retention), PII masking tiers | S26 Reports |
| R23 | Audit classes and retention, append-only enforcement | S27 Audit |
| R24 | Config key types/ranges, env precedence, flag default-deny | S28 Configuration |
| R25 | Job classes/timeouts, lease semantics, scheduled-job register | S29 Workflow |
| R26 | Storage limits per type, key layout, token lifecycle, ACL draft-private/published-public | S30 Storage |

## 9.2 Validation-Rule Ownership

- **L1 format/type/length/enum/regex** → shared Zod schemas per contract, co-located in `api/_lib/validation/` (owner: the service that owns the contract; never duplicated across services).
- **L2 domain rules** → the owning service per the R-table above (e.g., window checks, caps, state legality).
- **L3 cross-module contract rules** → enforced inside the owner's module API (e.g., `INSUFFICIENT_STOCK` raised by S09's reserve API, not by checkout code).
- **L4 security validation** → middleware (S01/S02 libraries) — rate limits, sessions, CSRF, permissions, idempotency keys.
- **L5 database constraints** → Prisma schema per DATABASE_SPECIFICATION (last line of defense: `stock >= 0`, `reservedStock <= stock`, uniqueness, FKs, RLS).

## 9.3 Calculations Ownership

| Calculation | Owner | Notes |
|---|---|---|
| `availableStock` | S09 | computed on read, never stored (CC-07) |
| Order totals (subtotal → discounts → coupon → shipping → GST split → total, always ≥ ₹0) | S13 (S14 snapshots at creation) | GST split per DATABASE_SPECIFICATION `totals` JSONB |
| Payment aggregates (`refunded`/`partially_refunded`) | S16 | derived from refund records (ML-03) |
| Commission `itemTotal × rate / 100`, capped; shop earnings; platform revenue | S17 | snapshot at order time |
| Settlement sums (Σ captured − gateway fees) | S17 | idempotent per period |
| Balances (earnings/ledger) | S17 | computed from append-only log, never cached without invalidation |
| Shipping charge (base/zone/threshold) and dimensional weight (L×W×H/5000) | S15 | server-side only (SH §6.5) |
| Relevance score (0.4/0.2/0.2/0.1/0.1 weighted) and boosts | S10 | index-owned |
| Product completeness score | S05 | weights 15/10/10/15/15/15/5/5/5/5 |
| Cart subtotal + badge count | S11 | always fresh, no cache |
| Rating aggregates | S20 | derived, event-invalidated |
| Document tax rendering (CGST+SGST/IGST) | S25 | renders, never re-computes the authoritative split |

## 9.4 State-Machine Ownership

| State machine | States (canonical) | Transitioned only by |
|---|---|---|
| Order | 18-state canonical (16 tabulated + `failed_delivery`, `held` guarded) | S14 Orders |
| Order payment sub-status | `pending, authorized, captured, refunding, refunded, failed` (CC-28) | S14 surfaces; driven by S16 events |
| Payment | `created, initiated, processing, authorized, captured, completed, failed, cancelled, refunded, partially_refunded, expired` | S16 Payments |
| Refund | `initiated, processing, completed, failed, settled` | S16 Payments |
| Settlement | `PENDING → ELIGIBLE → CREATED → REVIEW → APPROVED → PROCESSING → COMPLETED → PAID` (+ `REJECTED, FAILED, REVERSED`) | S17 Finance |
| Shipment | 12 states (SH §3.5) | S15 Shipping |
| Product | `draft, scheduled, published, archived` | S05 Product |
| CMS content | `created → draft → pending_review → approved → published` (+ `scheduled, unpublished, archived, deleted`) | S21 CMS |
| Homepage | `draft, published, archived` (one each, versions) | S22 Homepage |
| Notification | `created → queued → delivered → read` (+ `archived, expired, failed, cancelled`) | S23 Notifications |
| Conversation | `open, resolved, closed` | S24 Messaging |
| Return/resolution | per S18 chain (approved → pickup → received → restock → refund) | S18 Returns |
| Checkout | 5 stages (SC §4.5) | S13 Checkout |
| Document | `REQUESTED → VALIDATED → RENDERED → GENERATED → STORED → SERVABLE → ARCHIVED → PERMANENT` | S25 Documents |
| Job | `pending, processing, completed, failed` (+ DLQ) | S29 Workflow |

**Rule:** no code outside the listed owner may transition these machines — not even by direct UPDATE. All transitions flow through the owner's module API or the owner's event consumer (B7, §3.3.6).

## 9.5 Authorization Ownership

- **Role/permission registry, API keys, RLS policy definitions** → S02 Authorization (additive hierarchy Guest 0 → Customer 10 → Shop Owner 20 → Admin 30 → System 100; permissions `{scope}:{resource}:{action}`).
- **Resource ownership checks** (`product.sellerId === user.id`, `order.profileId === user.id`, address `profileId` scoping) → each owning service, invoked at its own boundary.
- **Row-level security** → S02 defines policy primitives; each service configures RLS on its own tables per DATABASE_SPECIFICATION.
- **PII visibility** (masked city/state for shop owners; masked phones/emails in exports) → enforced at the owning service's read API; never at the UI.

## 9.6 Workflow & Event-Publication Ownership

- **Who publishes:** the service that owns the state change publishes its events (outbox, same transaction). No service publishes another service's events.
- **Who registers:** S29 Workflow owns the canonical registry (AUTOMATION Appendix A); events marked **(reg.)** in §8 are registered by this specification — new events must be added to the registry, never invented in code (B7, IS-09).
- **Who consumes:** consumers are registered per event in the registry; each consumer owns its side effects (S17 consumes `order.confirmed` for finance records; S23 consumes domain events for notifications; S25 consumes `order.confirmed` for invoice generation — one consumer per concern).
- **Scheduled decisions:** the scheduled-job register (§12.3) is owned by S29; services register their periodic needs as job definitions, never as self-scheduled timers in handlers.

---

# 10. Module Communication

## 10.1 Communication Rules (binding)

1. **Default to events:** cross-module behavior is event-driven through the outbox (Blueprint §7.2.3, DI-01). A synchronous call is only justified when the caller cannot proceed without the result (B4).
2. **Synchronous calls are permitted only for:** (a) calls inside one domain; (b) registered owner module APIs (§10.2) — e.g., availability reads, rate computation, validation gates; (c) cross-cutting platform libraries (auth, errors, events, queue, logging, config, storage, validation).
3. **No module calls another module's business code directly**; no cross-handler imports; no direct table reads of another service's entities except through the owner's read API.
4. **Synchronous call budget:** at most one cross-service synchronous hop per request path; the hop must meet its sub-budget (stock check < 50ms, rate compute < 200ms) and must be callable with cached or event-refreshed data where freshness allows.
5. **Adapter isolation:** external providers (gateway, couriers, email, pincode, Cloudinary, Supabase) are reachable only through adapter interfaces in `api/_lib/*/adapters/`; adapters are replaceable without touching service logic (API_INTEGRATION §1.1).

## 10.2 Module API Register (owner-registered synchronous interfaces)

These names are the registered read/transaction entry points each owner exposes; signatures live in the owning service's module API module. This table is the anti-import-leak contract.

| Owner | Module API (registered) | Purpose |
|---|---|---|
| S09 | `inventory.getAvailability(variantIds)` · `inventory.reserve(items, refId)` · `inventory.release(refId)` | availability truth; atomic reserve/release (T1) |
| S05 | `products.getPublicBySlug(slug)` · `products.getPublishable(id)` | public detail; publish gate |
| S08 | `variants.getBySku(sku)` | SKU snapshot for carts/orders |
| S15 | `shipping.calculateRates(destination, method, items)` · `shipping.isServiceable(pincode)` | rate + serviceability (server-side only) |
| S13 | `checkout.validatePreconditions(cartRef)` | re-validation gate at payment initiation |
| S14 | `orders.getForTransition(orderId, actor)` · `orders.transition(orderId, to, actor, reason)` | transition engine (T3) |
| S16 | `payments.createGatewayOrder(...)` · `payments.verifyCapture(...)` | gateway flow (T4) |
| S17 | `finance.getCommissionRate(shopId, categoryId)` | commission snapshot |
| S23 | `notifications.render(templateId, data, locale)` | template render (cache-first) |
| S25 | `documents.enqueue(type, businessId, data, version)` | idempotent generation job (T11) |
| S28 | `config.get(keys)` | typed config reads (KV cache) |
| S02 | `authz.check(actor, permission, resource)` | permission evaluation (cache-first) |
| S30 | `storage.presign(domain, entityId, assetType, meta)` | upload tokens |

## 10.3 Event Communication

- **Transport:** event outbox (DB, same transaction as the write) → Cloudflare Queues (fire-and-forget) / PG job tables (durable, retryable work) (DI-01, AUTOMATION §7.5).
- **Guarantee:** at-least-once. Producers publish exactly once per transaction; consumers are **idempotent** (unique `eventId`) and retryable; duplicate delivery is expected, double effect is a defect (B8).
- **Payload (BusinessEvent):** `eventId` (UUID), `eventType` (dot-notation, registry-registered), `timestamp` (UTC), `actor {id, role, email}`, `resource {type, id, data(snapshot)}`, `context {ip?, userAgent?, shopId?, channel?}`, `metadata`.
- **Ordering:** per-entity (per-order, per-shipment, per-content) ordering by outbox insertion order; consumers process independently (OM §12.7, SH §11.7).
- **Snapshot discipline:** event payloads carry the snapshot needed by consumers (price, totals, addresses) so consumers never re-read mutable master data (DATABASE_SPECIFICATION P5).
- **Registry rule:** every event name used anywhere must exist in the canonical registry (S29); names not in §8 or the registry are rejected in review.

## 10.4 Failure Handling

1. **Consumer failure never rolls back the producer.** The producer's transaction is already committed; consumers retry per their class policy (§6.3) and go to DLQ after max attempts.
2. **DLQ discipline:** dead-letter entries are admin-visible, alert-triggering (> 10/hour), replayable after fix; DLQ is not a destination, it is a defect signal.
3. **Adapter circuit breakers:** gateway and courier adapters open the circuit on repeated transient failures; the platform continues with the fallback path (manual shipping update, webhook-based retry) rather than failing the business flow.
4. **Webhooks:** inbound — verify signature + freshness, process idempotently, return non-2xx on any failure so the provider retries (PAYMENT §15.3); outbound — retry + DLQ.
5. **Synchronous failures:** a failed module-API call surfaces as a domain error (§11) with retryable flag; callers must handle `409 INSUFFICIENT_STOCK` by refreshing state, not by blind retry.

---

# 11. Error Handling

## 11.1 Taxonomy

| Class | HTTP | Examples | Retryable? |
|---|---|---|---|
| Validation (L1) | 422 | field-level Zod codes, `PINCODE_INVALID`, `SKU_INVALID_FORMAT` | No |
| Business (L2) | 409/410/422 | `PRODUCT_SLUG_DUPLICATE` 409, `RETURN_WINDOW_EXPIRED` 410, `COUPON_EXPIRED` 422 | No (refresh state) |
| Contract (L3) | 409/422 | `INSUFFICIENT_STOCK` 409, `PRICE_CHANGED` 422 | Refresh state, then retry |
| Security (L4) | 401/403/404/429 | `INVALID_CREDENTIALS`, `FORBIDDEN`, unauthorized-as-404, `RATE_LIMITED` | No (429: after `Retry-After`) |
| Infrastructure | 5xx | adapter timeouts, DB failures, generation failures | Yes (backoff per §6.3) |
| Idempotency | 200/409 | duplicate key → original result (200 with `idempotent: true`), `DUPLICATE_ORDER` 409 | No |

## 11.2 Canonical Envelope & Registry

- Envelope per §5: `{ success: false, error: { code, message, field?, details? } }`; machine-readable `code`, user-facing `message` (localized at the edge), optional `field` for 422, optional `details` (never PII).
- **Error registry:** every code is registered in `api/_lib/errors/` with service, HTTP status, message map, and retryable flag. Codes are unique across services; a new code is added to the registry, never shadowed (no two services reuse a code with different semantics).
- Handlers map domain errors to the envelope via the registry; raw exceptions never leak (5xx mapped, SQL constraint violations logged as integrity failures with no SQL exposure — L5).
- Unknown fields are stripped/rejected (no `z.any()`); errors never echo back raw input beyond the offending field.

## 11.3 Logging Strategy

- Structured JSON logs with `requestId` (propagated across queue jobs), service, actor (id only, never email), resource, duration, status.
- **Never logged:** passwords, tokens, refresh tokens, webhook signatures, card data, full address lines, phone numbers, gateway API keys. Redaction is enforced at the logger boundary, not by convention.
- **Logs vs audit:** operational logs (ephemeral, per environment) are distinct from the append-only audit trail (S27, class-based retention). Business facts go to audit; diagnostics go to logs.
- Log retention per environment; no log may contain a customer's payment or verification secrets (PCI DSS readiness, IS-08).

---

# 12. Performance

## 12.1 Caching (binding TTLs, per source)

| Cache | TTL | Invalidation |
|---|---|---|
| Product detail | 5 min | product update event |
| Product list / filter counts | 2 min / 5 min | publish/unpublish event |
| Category tree | 1 hour | category change event |
| Collection products | 5 min | collection change event |
| Homepage rendered config | 5 min | publish event |
| Published CMS content | 1 hour | publish/unpublish event |
| Wishlist | 5 min | add/remove event |
| Shipping methods | 1 min | address change |
| Cart | **no cache — always fresh** | — |
| Coupon validation | no cache | — |
| Dashboard KPIs / counters / trends | 5 min / 1 min / 15 min | write events |
| Search autocomplete / results | 5 min / 1 min | TTL-based (index-driven) |
| Config values | 10 min | config change event |
| Media URLs (CDN) | 24h (images) | version-based |
| Product prices | 5 min | price change event |

**Rules:** caches are derived artifacts (B5); every cache has an owner, a TTL, and an invalidation event — caches without all three are defects; cache hit rate target > 80% for search; KV reads must never be the authority for stock, money, or state.

## 12.2 Performance Budgets (Blueprint §6.2, binding)

| Path | Budget |
|---|---|
| API p95 / p99 | < 300ms / < 1s |
| Product detail | < 100ms |
| Stock check | < 50ms |
| Search results / autocomplete | < 200ms / < 100ms |
| Filter counts / sort | < 500ms / < 50ms |
| Admin product/order lists | < 300ms |
| Webhook processing | < 5s |
| Document generation (single) | < 5s (PDF < 3s) |
| Message send | < 100ms |
| Pagination | 24/page (cursor for search, offset with bounds elsewhere) |

## 12.3 Background-Job Register (owned by S29)

| Job | Cadence |
|---|---|
| Reservation expiry release | every 5 min |
| Scheduled product/content publish | every minute |
| Low-stock alerts | hourly |
| Cart expiry (guest 7d / customer 90d) | daily |
| Order auto-complete (30 days post-delivery) | daily |
| Review-request sends (24h post-delivery) | daily |
| Settlement period timers | per period config |
| Cleanup (sessions, carts, exports, reports) | daily 2am |
| Orphan detection (media/files) | daily 3am |
| Media integrity | weekly Sunday 3am |
| Archive verification | monthly 1st, 3am |
| Search reindex (daily full) + change-driven | daily + < 2s per change |
| Audit archival (warm/cold) | per class schedule |

## 12.4 Batch & Volume Limits (binding)

- Bulk operations: ≤ 100 create/update per batch, ≤ 20 delete, ≤ 50 publish/archive per batch, **≤ 3 bulk ops/minute** (Product); 100 variants per inventory batch; 100 orders per order batch; 50 docs per document batch (< 2 min); 100,000 rows / 50MB per export; ≤ 500 recipients per notification batch.
- All bulk ops run as background jobs with per-item validation, partial-success reporting, and undo windows where documented (5-min product undo).
- Scale strategy: 0 → 1M+ users without architectural change: composite indexes → read replicas + materialized views → dedicated search index (Meilisearch/Typesense) → data warehouse (ETL) — each tier is a runtime change, never a schema/contract change.

## 12.5 Query Discipline

- No N+1 (batch loading, `include`/`select` discipline); composite indexes registered per entity in DATABASE_SPECIFICATION; cursor pagination for search, offset otherwise; `REFRESH MATERIALIZED VIEW CONCURRENTLY` only; connection pooling via Hyperdrive; never query search index tables with business queries and never query product tables with search queries (SEARCH §1.1).

---

# 13. Security

## 13.1 Authorization (enforcement order, all requests)

1. Rate limit (tier) → 2. Authenticate (session/API key, S01) → 3. Authorize (`authz.check`, S02; default-deny; additive hierarchy) → 4. Validate (L1) → 5. Resource ownership check (owning service) → 6. State-change audit (S27). Unauthorized resource access returns 404, never 403 (no existence disclosure). RLS enforces the same truth at the database layer.

## 13.2 Sensitive-Operations Register

Operations that require extra verification, audit, and (where noted) admin approval or MFA readiness:

| Operation | Requirement |
|---|---|
| Money movement (capture, refund, settlement payout) | idempotency keys + unique constraints + audit (S16/S17) |
| Refund/settlement reversal | admin approval + reason + audit (ML-09/12) |
| Permanent delete (any entity) | ≤ 100 records, admin approval, retention check, double confirmation |
| Admin order override (`held`, manual transition, address override) | reason required, all parties notified, audited |
| Inventory absolute adjustment | reason required, optional second approval |
| Settlement-destination (bank) change | re-verification + audit (financial class) |
| API key creation/revocation | scoped, hash-only storage, immediate revocation |
| Webhook endpoints | signature + freshness + nonce verification (S16/S15) |
| Document regeneration | admin only, reason required |

## 13.3 Data Protection

- **At rest:** PII and financial data encrypted; sensitive audit data encrypted at rest (OM §13.8); payment data under PCI DSS readiness (no card data beyond gateway tokens, ever).
- **In transit:** HTTPS everywhere; secure headers (CSP, HSTS); httpOnly cookies (tokens never in localStorage); SameSite Strict/Lax; CSRF double-submit for mutations.
- **Masking:** shop owners see masked customer addresses (city/state only) and payment status only; exports mask phones/emails unless authorized; share links and public tracking expose no PII.
- **Secrets:** env-only, never in code, logs, or responses; courier/gateway keys adapter-confined; `CSRF_SECRET` HMAC-based.
- **Retention & deletion:** class-based per AUDIT §8.3 and §8 (this spec); soft-delete with 7-day recovery; anonymize-don't-delete for user data (3y); financial/audit/legal never hard-deleted (B10); all enforced via S27/S25/S30 policies, never ad hoc.
- **Sensitive ops re-verification:** verification codes 10-min expiry; re-authentication for password change, settlement-destination change, admin overrides.

## 13.4 Secure Service Communication

- Internal services communicate via module APIs with the same authz enforcement as external APIs; queue payloads are validated and scoped by service identity; webhook signatures verified on every inbound provider call (gateway HMAC-SHA256, courier signatures); outbox events carry actor identity for audit.

---

# 14. Testability

## 14.1 Unit Boundaries

- Pure domain logic in `api/_lib/{domain}/` is unit-testable with zero IO: calculations (totals, commission, dimensional weight, relevance, GST split), state-machine transition tables, validation schemas, error mapping.
- Handlers are thin orchestration — tested for envelope, status codes, and middleware wiring, not business rules.

## 14.2 Mocking Strategy

- External adapters (gateway, couriers, email, pincode, Cloudinary, Supabase Auth) are mocked at their interfaces only — tests never simulate provider internals.
- Event consumers tested against recorded `BusinessEvent` fixtures; outbox writes asserted in the same transaction as the state change (exactly-once by construction).
- Time is injectable (scheduling windows: reservation 15 min, return 7 days, hold 7 days, auto-complete 30 days, session 15 min/7 days).

## 14.3 Integration & Contract Tests

- Integration tests run against PostgreSQL with the real schema (constraints, RLS, unique keys) — the L5 layer is tested as defense-in-depth, not as the primary rule source.
- Contract tests pin each module API (§10.2): request/response shapes, error codes, retryable flags — consumers and producers share the contract.
- Provider-contract tests for adapters verify the paise boundary, signature formats, and webhook payload normalization.

## 14.4 Coverage Mandate (Blueprint FG-04)

- **T0 paths require 100% coverage** and a second reviewer on every change: auth, payments, checkout, orders, refunds, settlements, inventory reservation, and all their event consumers (notifications of T0 events, finance records, document generation).
- T1/T2 services follow the organization standard coverage gate; no service deploys below it. State-machine tables are exercised exhaustively (every transition, every actor, every error).

---

# 15. Backend Implementation Standards

1. **Layout:** handlers in `api/_handlers/{domain}/` (kebab-case files); business logic in `api/_lib/{domain}/`; cross-cutting libraries in `api/_lib/{errors,auth,events,queue,logging,config,storage,validation,payments,notifications}/`; adapters in `api/_lib/*/adapters/`. No cross-handler imports; handlers import only `api/_lib/**`.
2. **Contracts:** shared Zod schemas per contract, FE/BE shared, no `z.any()`; unknown fields stripped; re-validation at every flow stage (checkout is the model — SC §4.6).
3. **Money:** DECIMAL(10,2) INR typed columns; paise only at gateway adapter; never float; server-computed amounts only (client is never trusted for price, amount, stock, or eligibility).
4. **Identifiers:** UUID v4 primary keys; display IDs are business identifiers only (`NAB-…` orders, `{PREFIX}-YYYY-NNNNNN` documents, SKUs); timestamps TIMESTAMPTZ UTC with local display.
5. **State:** transitions only through the owner (B7, §9.4); facts append-only; corrections are new rows with reasons.
6. **Idempotency:** `Idempotency-Key` header required on state-changing operations; duplicate keys return the original result; unique constraints back every money/order/webhook path (B8).
7. **Envelope & errors:** canonical envelope (§5); codes registered in `api/_lib/errors/`; retryable flags per §11.1.
8. **Rate limits:** tier-based (Customer/Shop Owner/Admin per API_SERVICE); per-endpoint registration; bulk-op ceilings (§12.4); `Retry-After` on 429.
9. **Pagination:** 24 default; search uses cursor pagination; lists use offset with bounds.
10. **Config:** numbers from S28 keys, never literals duplicated across services (R24; e.g., 15-min reservation, 7-day hold, ₹999 threshold are keys, not constants).
11. **Events:** names only from the canonical registry; **(reg.)** events in §8 registered by this document; producers publish via outbox in-transaction.
12. **Quality gates:** lint + typecheck + tests before any merge; T0 second-review mandate (§14.4); no quality-gate waivers (FG-04).
13. **Compliance posture:** GST-compliant records (7y), RBI-aligned payment integrity, PCI DSS readiness, GDPR/IT Act-aligned retention; all enforced at the service layer, never in the UI.

---

# 16. References & Binding Sources

This specification is derived from, and binding over, the following hierarchy (rule of precedence per the header):

1. **MASTER_ARCHITECTURE_BLUEPRINT.md (v1.0)** — primary binding source; Sections 4–7 and Appendix B are canonical; quoted verbatim where they bind a service.
2. **BACKEND_SERVICE_SPECIFICATION.md (this document, v1.0)** — the consolidated, conflict-resolved backend contract; wins over module documents where they conflict.
3. **DATABASE_SPECIFICATION.md (v1.0)** — authoritative entity/relationship/migration contract; canonical runtime values (TTLs, thresholds, status enums).
4. **Module architecture documents (44, all v1.0, Status: Active)** — owning documents per service (registered in §3.2); binding where this spec is silent.
5. **API_SERVICE_ARCHITECTURE.md / API_INTEGRATION_ARCHITECTURE.md** — API delivery standards, route-to-role mapping, middleware order.
6. **ENGINEERING_HANDBOOK.md / TECH_STACK.md / FOLDER_ARCHITECTURE.md / IDENTITY_NAMING_ARCHITECTURE.md** — engineering conventions, stack citations, folder rules, event-naming convention `{domain}.{action}`.
7. **GOVERNANCE_CONSTITUTION.md** — header/status discipline; §2.3 (no task prompt may waive this specification); §12.3 tier rules.

**Canonical resolutions recorded by this specification** (source conflicts resolved; Blueprint/this spec win):

| Resolution | Source conflict | Decision |
|---|---|---|
| `INSUFFICIENT_STOCK` → 409 | VI App C.3 documents 400; SC §8.11 documents 422 | **409 Conflict** (Blueprint CC-12 default); 422 retained for cart-context revalidation |
| Order machine | OM §1.8 = 16 states; Blueprint UX-11 lists 18 | **18-state canonical**: 16 tabulated + `failed_delivery` (from `in_transit`) + `held` (admin-only, audited) |
| Cart TTLs | SC internally inconsistent (7d vs 90d) | **guest 7 days, customer 90 days** (DATABASE_SPECIFICATION `cart.guestTtlDays`/`cart.customerTtlDays`) |
| Invoice timing | PAYMENT §6.9 "on order confirmed" vs SH §8.9 "on delivery" | **Invoice at order confirmation** (Blueprint ML-04); delivery generates delivery-note artifacts only |
| Shipping label owner | Document Engine "(future)" vs Shipping "current" | **Shipping Label `SHL` in Document Engine registry** (Blueprint line 971), 3-year retention |
| Finance record timing | PAYMENT §6.7 "on capture" vs FINANCE §8.4 "order confirmed" | **`order.confirmed` event** is the single trigger (capture precedes confirmation) |
| Notification retention | NTF §4.8 per-type vs Data Lifecycle 90-day | **90-day user-facing rows, then delete; delivery/audit records per audit class** (security 5y, financial 7y) |
| Conversation retention | NTF "never deleted" vs Data Lifecycle 90-day delete | **Permanent, append-only** (business/audit records) |
| CMS locale | CMS doc default `bn-BD` | **`en-IN` canonical** (locale enum `en-IN | bn-IN | hi-IN`) |
| Search result cap | SEARCH App B.1 `maxResults: 500` | **Max 50 results** (CATALOG §11.8 canonical); default page size 24 |
| Reservation timing | SC §5.5 at checkout entry vs OM §2.6 on payment success | **Atomic synchronous DB reservation at payment initiation**, 15-min timeout (Blueprint line 508) |
| Export retention | EXPORT §12.4.1 "7 days" vs §1.5/Data Lifecycle "30 days" | **30 days** (EXP registry + Data Lifecycle) |
| Express zone rate | SH §5.6 Tier-2 ₹249 vs flat ₹199 | **Flat ₹199**; zone table only overrides where explicitly listed (Tier 3/Remote standard) |

**End of specification — approved for implementation planning.**

