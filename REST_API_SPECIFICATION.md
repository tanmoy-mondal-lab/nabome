# নবME (Nabome) Commerce OS — REST API Specification

**Version:** 1.0 · **Date:** August 03, 2026 · **Status:** Approved for implementation planning
**Priority:** Active — all frontend (customer SPA, shop-owner dashboard, admin dashboard), mobile, backend, and third-party AI agents must follow this document
**Supersedes:** None — this document **converts** the approved `MASTER_ARCHITECTURE_BLUEPRINT.md` (v1.0) and `BACKEND_SERVICE_SPECIFICATION.md` (v1.0) into the binding REST API contract. It complements `API_SERVICE_ARCHITECTURE.md` and `API_INTEGRATION_ARCHITECTURE.md` (API delivery references), `DATABASE_SPECIFICATION.md` (entity contract), and the 44 module architecture documents.
**Authority:** Derived from the Master Architecture Blueprint (Prompts 01–44) and the approved Backend Service Specification. The Backend Service Specification's service catalog (S01–S30), canonical envelope, error taxonomy, performance budgets, and security rules are the binding inputs to every endpoint in this catalog. Business logic never belongs in APIs; this document specifies the API layer only.

> **Rule of precedence:** Where any module document or API reference conflicts with the Master Architecture Blueprint, the Blueprint's canonical resolution wins. Where this document conflicts with any other document, this document wins for API-facing contracts (it is the consolidated, conflict-resolved REST contract). Where this document is silent, the Backend Service Specification, the owning module document, and `ENGINEERING_HANDBOOK.md` apply. No task prompt may waive any rule in this specification (GOVERNANCE_CONSTITUTION §2.3). All values quoted as canonical (enums, limits, TTLs, rate limits, error codes) come from Blueprint Appendix B and the Backend Service Specification §8 and are binding; they are **quoted, not re-decided**.

---

## Table of Contents

1. [Purpose, Scope & Output Requirements](#1-purpose-scope--output-requirements)
2. [API Foundation](#2-api-foundation)
3. [Authentication & Authorization Model](#3-authentication--authorization-model)
4. [Request Standards](#4-request-standards)
5. [Response Standards](#5-response-standards)
6. [Error Handling](#6-error-handling)
7. [Endpoint Catalog](#7-endpoint-catalog)
8. [File & Media APIs](#8-file--media-apis)
9. [Webhook Readiness](#9-webhook-readiness)
10. [Performance Standards](#10-performance-standards)
11. [Security Standards](#11-security-standards)
12. [Documentation & Change Management](#12-documentation--change-management)
13. [Integration Guidelines](#13-integration-guidelines)
14. [References & Binding Sources](#14-references--binding-sources)

---

# 1. Purpose, Scope & Output Requirements

## 1.1 Purpose

This document is the **official REST API Specification for নবME (Nabome) Commerce OS**. It is the single contract all consumers program against:

- **Frontend:** customer SPA, shop-owner dashboard (`/shop`), admin dashboard (`/admin`).
- **Mobile:** mobile-first web experience (v1); native clients follow the same contract (Bearer-token variant, §3.6).
- **Backend:** internal service-to-service calls use the same contract conventions (§3.8).
- **Third-party AI agents and future integrations (ERP/CRM):** consume the public/partner APIs with API-key credentials (§3.7, §9).

It defines the complete REST API contract: foundation, authentication model, request/response standards, error handling, the full endpoint catalog (all 30 services), file APIs, webhook readiness, performance, security, and integration guidelines.

## 1.2 Scope

**In scope:**

1. API philosophy, versioning, naming, URI and resource conventions, HTTP method usage, idempotency.
2. Authentication and authorization behavior for Public, Customer, Shop Owner, Admin, Internal, and Service API classes.
3. Complete endpoint catalog for: Authentication, Users, Customers, Shop Owners, Products, Categories, Collections, Variants, Inventory, Search, Cart, Wishlist, Checkout, Orders, Shipping, Payments, Finance, Returns, Refunds, Reviews, CMS, Homepage Builder, Notifications, Messaging, Documents, Reports, Audit, Configuration, Workflow, Storage — plus platform health and webhook endpoints.
4. Request standards (headers, parameters, validation, pagination, sorting, filtering, search, batch).
5. Response standards (envelope, metadata, errors, validation messages).
6. Error handling (all classes + retry guidance).
7. File APIs (upload/download/delete/replace/validation/media references).
8. Webhook readiness (payloads, retry, verification, delivery status).
9. Performance, security, documentation, and integration standards.

**Out of scope (by instruction):** no endpoint implementation, no backend code, no framework selection, no business-logic redesign, no changes to the approved architecture. This document defines the API contract only; all business rules, state machines, calculations, and validations are owned by the services registered in the Backend Service Specification §8 and are referenced (never re-defined) here.

**Hard constraints honored from the binding sources:**

- Business logic never belongs in APIs. Handlers orchestrate: authn/authz → rate limit → validation → service call → envelope (Blueprint mandatory rule 9; BSS §5).
- Every endpoint follows exactly one response envelope (§5).
- APIs remain backward compatible; breaking changes require a new version (§2.2).
- No duplicated endpoints: one owner per resource; cross-service facts arrive via events, never via duplicated endpoints (§2.5).
- Enterprise-scale: 0 → 1M+ users, T0 path integrity (auth, payments, checkout, orders, refunds, settlements), audit-grade compliance, retention discipline (Blueprint §1, BSS §1).
- Versioned, secure, mobile-first, predictable, future-proof.

## 1.3 Output Requirements (deliverables of this document)

| # | Deliverable | Section |
|---|---|---|
| 1 | Complete API catalog (all domains, all endpoints) | §7 |
| 2 | Endpoint specifications (name, URI, method, purpose, permissions, request, response, success/error responses, validation, events, performance) | §7 |
| 3 | Request standards | §4 |
| 4 | Response standards | §5 |
| 5 | Authentication standards | §3 |
| 6 | Error standards | §6 |
| 7 | File API standards | §8 |
| 8 | Webhook readiness | §9 |
| 9 | Integration guidelines (incl. third-party AI agents) | §13 |

---

# 2. API Foundation

## 2.1 API Philosophy

1. **REST-first, resource-oriented.** URLs name resources (nouns), HTTP methods express actions (verbs). Actions that are not CRUD are explicit POST sub-resources (`/orders/:id/cancel`). The API is fully HTTP-semantic so that caching, conditional requests, retries, and tooling work predictably.
2. **Predictability over cleverness.** One base URL, one version prefix, one response envelope, one error object, one pagination convention. A client that can call one list endpoint can call all list endpoints.
3. **Versioned and stable.** `/api/v1` is the canonical version prefix (Blueprint B.10, IS-11). Additive changes never break consumers; breaking changes only via a new major version with a documented sunset (§2.2).
4. **Secure by default.** Default-deny authorization, server-side enforcement only, 404 for unauthorized resource access (never 403 existence leaks), idempotency keys on every state change, signed webhooks, PII masking by role (Blueprint §6.3, IS-01; BSS §13).
5. **Mobile-first.** Payloads are lean (fields are explicit, never `SELECT *`), pagination is mandatory on all lists, deep payloads are flattened or embedded only where the mobile UI needs them; response sizes are budgeted (§10.4).
6. **The API exposes services, not implementation.** Endpoints map 1:1 to service responsibilities (BSS §8). Internal table names, adapter names, provider concepts (Razorpay order IDs are returned, but no provider mechanics), and internal identifiers never leak. Display IDs (`NAB-…`, `INV-…`, SKUs) are the only identifiers shown to humans; UUID v4 is the wire identifier.
7. **Backward compatible whenever possible.** Adding fields, endpoints, or enum values is non-breaking; removing or renaming is breaking (§2.2.4).
8. **Business logic never belongs in APIs.** Endpoints never compute prices, never transition state machines, never enforce business rules. They validate input (L1), call the owning service, and format the envelope (BSS §5, §9).
9. **Everything is auditable and traceable.** Every request carries a `requestId`; every state change is an append-only audit fact (S27) and an event (outbox) (BSS §5, §11.3).

## 2.2 Versioning Strategy

### 2.2.1 Canonical versioning

- **Version prefix:** `/api/v1` — version is part of the URL path (Blueprint B.10: "`/api/v1` versioned"). Example: `https://api.nabome.online/api/v1/products`.
- **No version aliases.** The un-prefixed path is **not** served for external APIs (no silent "latest" behavior); clients must pin a version. (Deviation from API_INTEGRATION §2.4's "current version alias" — rejected for enterprise stability.)
- **Version is immutable.** Once published, `v1` never changes semantics. Fixes within a version are backward-compatible only.
- **Semantics:** `major.minor.patch` tracked in the changelog (§12.4). The URL carries `major` only. Minor/patch changes are additive and never require client changes.

### 2.2.2 Breaking vs non-breaking

| Type of change | Classification | Action |
|---|---|---|
| Adding an optional request field | Non-breaking | Same version; documented |
| Adding a response field | Non-breaking | Same version; documented |
| Adding an endpoint | Non-breaking | Same version; documented |
| Adding an enum value | Non-breaking (clients must treat unknown enum values as forward-compatible) | Same version; documented |
| Adding an error code | Non-breaking | Same version; registered in error registry (§6.7) |
| Changing rate limits | Non-breaking | Same version; announced |
| Removing a response field | **Breaking** | New major version |
| Changing a field type / shape | **Breaking** | New major version |
| Adding a required request field | **Breaking** | New major version |
| Changing URL structure or method | **Breaking** | New major version |
| Changing authentication mechanism | **Breaking** | New major version |
| Changing error response format | **Breaking** | New major version |
| Changing pagination default/max | **Breaking** | New major version |

### 2.2.3 Deprecation lifecycle

- Deprecated endpoints respond with `Deprecation: true` header plus a human hint, and a `Sunset: <RFC-1123 date>` header giving the removal date.
- **Sunset period: 6 months minimum** between deprecation and removal (API_INTEGRATION §2.4).
- Deprecated behavior is documented in the changelog with migration path.

### 2.2.4 Backward-compatibility rules

1. Clients may not depend on undocumented fields; undocumented fields may change without notice.
2. Field order in JSON objects is not guaranteed; clients must not parse by position.
3. Unknown fields in responses are forward-compatibility signals — clients must ignore them.
4. Money fields are strings or numbers with exactly 2 decimals per canonical convention (§4.5); a client must never coerce money to float.
5. Enums: clients must treat an unrecognized enum value as "unknown state" and continue (never crash).

## 2.3 Naming Standards

| Element | Convention | Example |
|---|---|---|
| Base path | `/api/{version}` | `/api/v1` |
| URL segments | kebab-case, plural nouns | `/api/v1/cart-items` |
| Query parameters | camelCase | `?minPrice=1000&inStock=true` |
| Request/response fields | camelCase | `createdAt`, `availableStock`, `totalPages` |
| Resource IDs | UUID v4 (wire) | `550e8400-e29b-41d4-a716-446655440000` |
| Display IDs | SCREAMING/upper prefixes per canonical registry | `NAB-20260803-000123`, `INV-2026-000123`, SKU `TSH-RED-M` |
| Enums (API values) | snake_case (state machines per Blueprint B.1–B.6) | `ready_to_ship`, `partially_refunded` |
| Error codes | SCREAMING_SNAKE_CASE | `INSUFFICIENT_STOCK` |
| Event names | dot-notation from the canonical registry | `order.shipped`, `payment.captured` |
| Filter parameter names | camelCase, `minX/maxX` for ranges | `minPrice`, `maxPrice` |
| Action sub-resources | verb-noun POST | `/api/v1/orders/:id/cancel` |
| Time | ISO 8601 UTC (`2026-08-03T10:30:00Z`) | — |
| Money | DECIMAL(10,2), 2 decimals, no float | `2999.00` |

**Enum casing rule (binding):** state-machine and status values use the canonical snake_case registries of Blueprint Appendix B (order 18-state, payment, refund, settlement, shipment 12-state, product, inventory bands, CMS, homepage, document, job). API enum values are the canonical values, verbatim — the API never renames a state. `sort` allowlists and filter operators use their documented lowercase forms.

## 2.4 URI Conventions

1. **Base URI:** `https://api.nabome.online/api/v1` (production). Preview/staging host is deployment-defined per DI-06 (distinct environments; host differs, path never differs).
2. **Collection pattern:** `GET /resources` (list), `POST /resources` (create).
3. **Singleton pattern:** `GET|PATCH|DELETE /resources/:id`.
4. **User-scoped singletons:** `GET|PATCH /cart`, `GET /account` (one per actor — no `:id`).
5. **Nested relationships:** `/products/:id/variants`, `/products/:id/reviews`, `/orders/:id/items`, `/orders/:id/status-history`. Nesting is limited to **one level** of genuine containment; everything else is flat with `?filter=` (avoid deep hierarchies).
6. **Actions:** `POST /resources/:id/{action}` (e.g., `POST /orders/:id/cancel`, `POST /products/:id/publish`). Actions return 200 with the updated resource, or 204 where nothing is returned.
7. **Admin prefix:** `/api/v1/admin/**` for platform-wide administration (API_INTEGRATION §2.2). Shop-owner scoped administration lives under `/api/v1/shop/**` only for dashboard aggregates; domain resources (`/products`, `/orders`, `/shipments`, …) are shared with ownership enforced per resource.
8. **Webhooks (inbound):** `/api/v1/webhooks/gateway/{provider}` and `/api/v1/webhooks/courier/{provider}` — signed, provider-registered (§9).
9. **Internal endpoints:** `/api/v1/internal/**` — not reachable from the public internet; service-identity authenticated (§3.8).
10. **Trailing slashes are not supported** (`/products/` → 404-compatible routing); `/products` and `/products/:id` are distinct routes.
11. **Case sensitivity:** paths are lowercase; IDs are case-insensitive UUIDs (canonical lowercase form).
12. **`OPTIONS`** is answered on every route for CORS preflight (allowed origins registered per environment).

## 2.5 Resource Conventions

1. **One owner per resource** (BSS B3, §3.3): each resource has exactly one owning service; no duplicated endpoints. Examples: order creation happens only at `POST /checkout/verify-payment` (never `POST /orders`); payment initiation happens only at `POST /checkout/sessions/:id/payment`; document generation is triggered by events or `POST /documents/request` (never by business endpoints); finance records are never written by payment endpoints.
2. **Read-side role scoping:** every GET returns only what the actor's role may see (PII masking is enforced at the owning service read API — BSS §9.5). Shop owners see masked customer addresses (city/state only) and payment status only.
3. **Soft-delete first:** `DELETE` on governed resources is a soft delete (7-day recovery window) unless the resource is a draft or the delete is explicitly a "permanent" variant (≤ 100 records/batch, admin approval, double confirmation) (Blueprint mandatory rule 21).
4. **Immutable facts:** history, movements, audit, messages, and finance records are append-only. The API exposes them read-only; corrections are new rows (BSS B6).
5. **State transitions:** only through transition endpoints owned by the state machine's owning service (BSS §9.4). A transition request must carry `{ to, reason? }`; the server validates legality, actor, and window. No endpoint accepts direct status writes.
6. **Money values:** always DECIMAL(10,2) INR; amounts never negative; totals always server-computed (client is never trusted for price, amount, stock, or eligibility — BSS §15.4).
7. **Time:** all timestamps ISO 8601 UTC with `Z`; display localization is client-side; `date` query parameters accept `YYYY-MM-DD`.
8. **Identifiers:** UUID v4 on the wire; `NAB-…`, `INV-…`, SKU are business display identifiers usable as lookup keys in documented read endpoints (e.g., `GET /orders/by-number/NAB-20260803-000123`).

## 2.6 HTTP Method Usage

| Method | Semantics | Body | Success | Notes |
|---|---|---|---|---|
| `GET` | Read (list/detail); never changes state | No body | 200 | Cacheable, conditional-request-capable (§10.3) |
| `POST` | Create, or action/transition | Yes | 201 (create) / 200 (action) | Idempotency key required for state-changing POSTs |
| `PATCH` | Partial update of a mutable resource | Yes | 200 | Idempotency key required; optimistic-lock header `If-Match` supported |
| `PUT` | Full replace (rare; used for draft configs, e.g., homepage draft) | Yes | 200 | Idempotency key required |
| `DELETE` | Delete (soft by default) | Optional body for reasons | 204 | Batch deletes ≤ 20 (≤ 100 permanent with admin) |
| `HEAD` | Metadata-only read (file/media URLs) | — | 200 | Supported on media/download URLs |

**Rules:**

1. `GET` and `HEAD` never mutate; violations are defects (BSS §15).
2. `POST` for actions returns 200 with the resulting resource (or a 202 + job `id` for background operations — see §4.8 Batch).
3. `PATCH` replaces only provided fields; `null` means explicit clear where documented; absent means no change.
4. `DELETE` returns 204 with no body, or 200 with a soft-delete receipt where the resource remains queryable (e.g., `archivedAt`).
5. Method not allowed → `405` with `Allow` header listing permitted methods.

## 2.7 Idempotency Rules

Idempotency is the platform's exactly-once guarantee for state-changing operations (Blueprint mandatory rule 18; BSS B8, §15.6).

1. **Header:** clients send `Idempotency-Key: <uuid-or-opaque-string>` on every POST/PATCH/PUT/DELETE that changes state (create, transition, action, upload-complete, webhook-handled operations). Format: 8–128 chars, `[A-Za-z0-9_-]`.
2. **Server behavior:** keys are unique per (actor, key). A duplicate key on a retry returns **the original result** — HTTP status and body of the first execution — with `Idempotent-Replay: true` header. First execution returns `Idempotent-Replay: false`.
3. **Scope:** the key is bound to the authenticated actor (or guest token); a key used by a different actor is a new operation.
4. **Persistence:** keys and their stored results are retained 24 hours (retry horizon); a new key is required after that window.
5. **Money and orders:** payment capture, order confirmation, refunds, settlements, webhook processing, and notifications additionally enforce unique business constraints (`gatewayPaymentId` unique, `refundId` unique, outbox event ids unique) — idempotency keys are defense-in-depth, not the only guarantee (BSS §6.1, §6.3).
6. **Error handling:** a request that fails with a 5xx or 429 may be retried with the same key; a request that fails 4xx (validation/authz/business) consumed its key only if the error was emitted after state change — by design, failed 4xx validation does **not** store a result, so the client may correct input and retry with a fresh key.
7. **Duplicate-order protection:** checkout enforces a 5-minute cooldown between orders from the same user plus unique constraint on `(userId, paymentId)` — a client that double-submits receives the same order (or `DUPLICATE_ORDER` 409 per the canonical rule) (BSS §8.13).
8. **Responses:** successful idempotent operations that created a resource return 201 the first time and 200 with the same `data` on replay (plus `Idempotent-Replay: true`). The envelope `meta` always includes the idempotency echo: `meta.idempotencyKey` and `meta.idempotentReplay`.

---

# 3. Authentication & Authorization Model

## 3.1 API Classes

Every endpoint belongs to exactly one access class. The class determines the required authentication mechanism, the default rate tier, and the authorization model.

| Class | Consumers | Auth mechanism | Default rate tier | Representative paths |
|---|---|---|---|---|
| **Public** | Anonymous browsers, mobile, SEO bots, partners | None (guest tokens for cart/wishlist) | Public 60/min/IP | `/products`, `/search`, `/categories`, `/cms/content/*`, `/cart` (guest cookie) |
| **Customer** | Logged-in customers | Session cookie (web) or Bearer access token (mobile) | Authenticated 120/min | `/account`, `/orders`, `/returns`, `/reviews`, `/notifications` |
| **Shop Owner** | Shop owners + staff | Session cookie or Bearer token | Authenticated 120/min (shop-scoped) | `/shop/**`, `/products` (own), `/orders` (own shop), `/shipments` |
| **Admin** | Platform admins, super_admin, compliance | Session cookie or Bearer token | Admin 300/min | `/admin/**`, all domains full visibility (masked PII per tier) |
| **Internal** | Platform services (S01–S30) | Service-to-service credentials (mTLS/service JWT) | Internal (registered per service) | `/internal/**` |
| **Service** | Third-party partners/AI agents (ERP/CRM readiness) | API key (hash-stored, scoped) | API Key 100/min · Premium 500/min | Partner-scoped endpoints, webhook subscriptions |

**Rate tiers (canonical, IS-03 / B.10):** Public 60 · Authenticated 120 · Admin 300 · API Key 100 · Premium 500 per minute. Per-endpoint overrides are registered in §7 (e.g., login 20/min, bulk 3/min, presign 10/min).

## 3.2 Authentication Requirements

1. **Identity provider:** Supabase Auth adapter (IS-02). No app-side password storage ever; credentials live only behind the adapter boundary.
2. **Web SPA:** httpOnly, SameSite cookies carry the session. Access token 15 min, refresh token 7 days; **tokens never stored in localStorage** (Blueprint mandatory rule 11). CSRF double-submit cookie + `x-csrf-token` header on all mutations (Blueprint mandatory rule 12).
3. **Mobile:** Bearer access token (15 min) + refresh token (7 days) obtained at `POST /auth/login` (and `POST /auth/refresh`); refresh token held in secure device storage, rotated on use.
4. **Sessions:** max 5 concurrent sessions per user; every login creates a session row; refresh rotation invalidates the old token atomically (T12). Idle timeout 30 min; session archive after 30 days (IS-04/IS-10).
5. **Guest sessions:** cryptographically random UUID in an httpOnly cookie (`nabome_guest`) for cart/wishlist; guests never reach authenticated resources.
6. **Turnstile** is required on `POST /auth/register` and `POST /auth/login` (failure → 422 `TURNSTILE_FAILED`).
7. **Lockout:** per-account 20/min AND per-IP 10/hr login attempts; lockout → 423 `ACCOUNT_LOCKED`.
8. **Sensitive operations** (password change, settlement-destination change, admin overrides, refunds, permanent deletes) require re-authentication/verification code (10-min expiry) per the Sensitive-Operations Register (BSS §13.2).
9. **API keys (S02):** issued via `POST /api/v1/admin/api-keys`; stored as hashes only; scoped to least privilege `{scope}:{resource}:{action}`; instantly revocable. Used in `Authorization: Bearer <key>` for Service/partner class.
10. **Health/version endpoints** are unauthenticated public (no PII, no state).

## 3.3 Authorization Model

1. **Role hierarchy (canonical, additive — IS-01 / B.8):** `Guest 0 → Customer 10 → Shop Owner 20 → Admin 30 → System 100`. Higher roles inherit lower roles' permissions. `super_admin` is a capability flag, not a role. Compliance is a scoped role.
2. **Permission format:** `{scope}:{resource}:{action}` (e.g., `orders:order:cancel`, `catalog:product:create`, `finance:settlement:approve`).
3. **Default-deny:** no permission → no access. Enforcement is server-side on every request (Blueprint mandatory rule 13); UI hiding is never the control.
4. **Resource ownership:** in addition to role permissions, every request passes an ownership check owned by the owning service (`product.sellerId === user.id`, `order.profileId === user.id`, address `profileId` scoping, `shopId` isolation on all shop data).
5. **No existence disclosure:** a request for a resource the actor may not see returns **404**, never 403 (BSS §13.1). 403 `FORBIDDEN` is reserved for authenticated actors attempting known operations they lack permission for.
6. **RLS parity:** row-level security enforces the same truth at the database layer; the API never trusts client-supplied `shopId`/`profileId` scoping.
7. **Permission validation order (all requests):** rate limit → authenticate → authorize → input validate (L1) → business validate (L2) → ownership (L3) → audit (BSS §13.1). Authorization is evaluated **before** input validation so unauthorized actors cannot probe schemas.

## 3.4 Token & Session Handling

| Token | TTL | Transport | Rotation |
|---|---|---|---|
| Access token | 15 min | httpOnly cookie (web) / Authorization Bearer (mobile) | Not rotated; re-issued via refresh |
| Refresh token | 7 days | httpOnly cookie (web) / secure storage (mobile) | Rotated on every use; old token invalidated atomically |
| Guest token | 7 days (cart) | httpOnly cookie | Fixed per browser until merge/clear |
| API key | Configurable (default 1 year) | Authorization Bearer | Revocable; rotation via new key + revoke old |
| Verification codes (OTP) | 10 min, 6 digits | Email (Resend) | Single-use; resend limited 3/hr |

1. `POST /auth/logout` revokes the current session (all sessions on `POST /auth/logout-all`); `auth.session.revoked` event emitted; audit `LOGOUT` row.
2. A revoked/expired refresh token returns 401 `SESSION_EXPIRED` with `Retry-After`-free 401; clients must re-login. Silent refresh is the client's job via `POST /auth/refresh`; the API never auto-refreshes.
3. Session count is capped at 5; the oldest session is revoked when a 6th login occurs (documented behavior, not an error).
4. All auth failures are audited (`LOGIN_FAILED` Warning, `TURNSTILE_FAILURE` Warning) with user ID/guest marker, endpoint, timestamp — never credentials.

## 3.5 Session Behavior by Class

| Class | Unauthenticated request | Session expiry | Notes |
|---|---|---|---|
| Public | Proceeds (no identity) | n/a | Guest cookie attached automatically on cart/wishlist writes |
| Customer | 401 `AUTH_REQUIRED` | 401 `SESSION_EXPIRED` (retry after refresh) | Cart merge on login (T13) is event-driven, transparent |
| Shop Owner | 401 | 401 | Shop context derived from session, never from client params |
| Admin | 401 | 401 | Session elevation never downgraded mid-request |
| Internal | 401 (service credentials) | 401 | Service identity + least-privilege scopes |
| Service (API key) | 401 `API_KEY_INVALID` | 401 `API_KEY_EXPIRED` | Key revocation is immediate (cache invalidated by event) |

## 3.6 Authorization Examples (permission strings)

| Endpoint | Required permission (illustrative, authoritative registry in S02) |
|---|---|
| `POST /products` | `catalog:product:create` (Shop Owner 20+, ownership-scoped) |
| `POST /products/:id/publish` | `catalog:product:publish` |
| `POST /orders/:id/cancel` | `orders:order:cancel` (own orders: Customer; pre-packing window) |
| `POST /admin/orders/:id/hold` | `orders:order:hold` (Admin 30 only) |
| `POST /finance/settlements/:id/approve` | `finance:settlement:approve` (Admin 30 only) |
| `POST /admin/users/:id/roles` | `identity:user:roles` (Admin 30 / super_admin) |
| `GET /audit/events` | `audit:event:read` (Admin 30 / Compliance) |

## 3.7 Service APIs (third-party / AI agents)

- Credential: API key (`Authorization: Bearer`), scoped per partner contract (e.g., `catalog:product:read`, `orders:order:read`, `finance:settlement:read`). Keys are never scoped to money-moving write actions by default.
- Partners consume the same `/api/v1` contract, same envelope, same errors; only the credential differs.
- Partner actions are audited with the API-key owner as actor; partner requests carry `X-Client-Id` (key id) and are subject to per-key rate limits (100/min standard, 500/min premium).
- Outbound webhook subscriptions (ERP/CRM readiness) are managed in §9; subscription endpoints are Service-class.
- Readiness note: OAuth 2.0 authorization-code flow for partner apps is future (API_INTEGRATION §3.7); v1 ships API keys only.

## 3.8 Internal & Service-to-Service APIs

- **Scope:** module-API contract surfaces (BSS §10.2) such as `inventory.reserve`, `shipping.calculateRates`, `orders.transition`, `payments.verifyCapture`, `config.get` — exposed under `/api/v1/internal/**` for cross-service orchestration where a synchronous hop is justified (BSS §10.1.4).
- **Credential:** service identity (short-lived service JWT, 1h, rotated) or mTLS per environment; never user sessions.
- **Rules:** internal endpoints enforce the same canonical envelope, validation, and error registry; they never accept user-supplied scoping; payloads are validated against the same Zod schemas; every call is audited with the service actor.
- **Availability:** internal endpoints are not routed to the public internet (edge firewall / worker route separation).

---

# 4. Request Standards

## 4.1 Headers

| Header | Required | Applies to | Purpose / rules |
|---|---|---|---|
| `Content-Type: application/json` | Yes (body-bearing requests) | POST/PATCH/PUT | Multipart/form-data for file uploads (§8) |
| `Accept: application/json` | Yes (recommended) | All | Server returns JSON; other Accept values → 406 |
| `Idempotency-Key` | Yes (state-changing) | POST/PATCH/PUT/DELETE | §2.7 |
| `x-csrf-token` | Yes (web mutations) | POST/PATCH/PUT/DELETE | Double-submit CSRF, HMAC-signed with `CSRF_SECRET`, timing-safe compare (IS-02/DI-02) |
| `If-Match` | Optional (optimistic lock) | PATCH/DELETE on versioned resources | ETag of the current state; mismatch → 412 `PRECONDITION_FAILED` |
| `If-None-Match` | Optional (conditional GET) | GET | 304 Not Modified handling (§10.3) |
| `Authorization: Bearer <token>` | For mobile/API-key | Authenticated/Service class | Access token or API key; never for cookie sessions |
| `X-Nabome-Signature` | Outbound webhooks | Provider deliveries | `${timestamp}.${payload}` HMAC-SHA256 (Blueprint mandatory rule 14; §9.3) |
| `Accept-Language` | Optional | Localization | `en-IN`, `bn-IN`, `hi-IN` (canonical locales, ML-01); errors localized at the edge |
| `X-Requested-With` | Optional | Web | `XMLHttpRequest` marker; not an auth control |
| `Retry-After` | Response header | 429/503 | Seconds before retry (§6.5) |
| `Deprecation` / `Sunset` | Response header | Deprecated endpoints | §2.2.3 |

**Client must send:** `Content-Type`, `Accept`, `Idempotency-Key` (mutations), `x-csrf-token` (web mutations), `Authorization` where applicable. All other headers are optional or server-managed. Server must send: `requestId` in body `meta` and `X-Request-Id` header, `Cache-Control` on GET (§10.2), `Vary` where content varies.

## 4.2 Parameters

1. **Path parameters:** UUID v4 or canonical display ID (documented per endpoint). Example: `/orders/:id`, `/orders/by-number/{number}`.
2. **Query parameters:** camelCase; typed; validated by L1 schemas. Unknown query parameters are **ignored** (forward compatibility) except on endpoints with strict filter allowlists, where unknown **filters** are rejected 400 `INVALID_FILTER`.
3. **Request body:** JSON, UTF-8, max 1 MB (except multipart uploads, §8); unknown fields are **stripped** (never silently stored, never echoed); no `z.any()` in server schemas (BSS §15.2).
4. **Nullable semantics:** `null` = explicit null/clear; absent = no change (PATCH). For POST creates, absent required field → 422.
5. **ID conventions:** wire IDs are UUID v4; display IDs accepted where documented (`/orders/by-number/NAB-…`, SKU lookups).
6. **Dates:** ISO 8601 UTC (`2026-08-03T10:30:00Z`); date-only filters `YYYY-MM-DD` (interpreted as UTC day boundaries).

## 4.3 Validation

1. **Five layers (binding, BSS §7):** L1 input (shared Zod schemas, 422 field-level) → L2 business (owning service, 409/410/422 domain codes) → L3 cross-module contract (owner module API, e.g., `INSUFFICIENT_STOCK` 409) → L4 security (middleware: 401/403/429) → L5 database constraints (last line of defense, mapped to integrity errors, never leaking SQL).
2. **Server-side validation is mandatory on every boundary; client-side validation is convenience only.** The client is never trusted for price, amount, stock, eligibility, or ownership (BSS §7).
3. **Re-validation at every flow stage:** checkout re-validates cart, stock, price, address, coupon, shipping at entry, at payment initiation, and at verification (BSS §8.13). Multi-stage flows always carry a server-issued session token that records validated state.
4. **Sanitization:** HTML sanitized per CMS block whitelist (DOMPurify); product fields allow only `p, br, strong, em, ul, ol, li, h3, h4`; `script/iframe/object/embed/form/input/textarea/select` and `on*`/`style` attributes blocked (BSS §8.21).
5. **Validation failure shape:** 422 with `error.field` set and `error.details` carrying per-field message arrays (§5.4).

## 4.4 Pagination

| Convention | Value |
|---|---|
| Default page size | **24** (canonical; Blueprint B.10, BSS §12.2) |
| Maximum page size | **100** (offset lists) / **50** (search results, canonical cap) |
| Search & autocomplete | **Cursor-based** (`cursor` param, `meta.nextCursor`); never offset for search (BSS §8.10) |
| Other lists | **Offset-based** with bounds (`page`, `limit`) (BSS §12.5) |
| Messaging lists | 50/page default |
| Oversized limit | clamp to max (never error); documented per endpoint |

**Offset form:** `?page=1&limit=24` → `meta: { page, limit, total, totalPages, hasMore }`. Page beyond total returns `data: []` with correct `total` — never an error. **Cursor form:** `?cursor=<opaque>` → `meta: { nextCursor, hasMore }`; first page omits `cursor`; `nextCursor` null on last page. Empty results are `data: []`, not errors.

## 4.5 Sorting

- Parameters: `sort=<field>&order=asc|desc`. Default `order=desc` for time-based sorts; explicit per endpoint.
- **Allowlist enforced:** unknown `sort` → 400 `INVALID_SORT` (BSS §8.10). Only indexed fields are sortable (documented per endpoint).
- Search sort allowlist (canonical): `featured | relevance | newest | price_asc | price_desc | best selling | rating` (BSS §8.10).
- One sort field per request; multi-field sorting is not supported in v1.

## 4.6 Filtering

- **Format:** typed query params; arrays comma-separated (`?tags=a,b`); ranges `minX`/`maxX` (`?minPrice=500&maxPrice=5000`); booleans `true/false`; enums whitelisted per endpoint; dates `from`/`to` ISO.
- **Semantics:** OR within a facet group, AND between groups (BSS §8.10). Applied server-side only.
- **Filter allowlists:** each list endpoint documents its supported filters in §7. Unknown filter for a resource → 400 `INVALID_FILTER` (search) or ignored-with-documentation (browse lists per endpoint rules).
- **Existence filters:** `inStock`, `isActive`, `status`, `isFeatured` are server-computed; the client cannot inject arbitrary SQL — all filters compile to parameterized queries.

## 4.7 Search

- `q` ≤ 200 chars; min 2 chars for autocomplete; HTML/SQL keywords stripped; parameterized `to_tsquery` always (BSS §8.10).
- Max **50 results** (canonical); cursor pagination; cache TTLs: autocomplete 5 min, results 1 min.
- Facets returned in `meta.facets` (computed < 20 ms); zero results is a UX state (empty `data`), not an error.
- Search never reads product tables at request time — it reads the derived index only (SEARCH §1.1). Results are published content only; no out-of-stock items in recommendations.

## 4.8 Batch Operations

| Operation class | Limit (canonical) | Execution model |
|---|---|---|
| Bulk create/update (products, variants, inventory, orders) | **≤ 100 per batch** | Background job; per-item validation; partial-success result |
| Bulk delete | **≤ 20 per batch** | Background job; partial-success result |
| Bulk publish/unpublish/archive/featured (products) | **≤ 50 per batch** | Background job; ≤ 3 bulk ops/min; archive requires per-product reason |
| Bulk inventory update | ≤ 100 variants | < 5s target |
| Notification send | ≤ 500 recipients/batch | Queue; 10s between batches |
| Document generation | ≤ 50 docs/batch | < 2 min target |
| Export | ≤ 100,000 rows / 50 MB | Background; async download URL |

1. **Batch request:** `POST /resources/bulk/{operation}` with `{ items: [...] }`, one `Idempotency-Key`.
2. **Batch response:** `202 Accepted` with `data: { jobId }` (job status at `GET /workflow/jobs/:jobId`), or synchronous `200` with `BulkOperationResult` for fast paths: `{ processed, succeeded, failed: [{ item, code, message }] }` (BSS §12.4).
3. **Partial success is the contract:** a batch succeeds as a whole only in all-or-nothing atomic units (T1 reservation, T2 order confirmation); elsewhere per-item results are reported, never aborted wholesale.
4. **Undo windows:** product bulk operations are undoable within 5 minutes (BSS §8.5).
5. Batch endpoints require the same permissions as the single-item variant.

---

# 5. Response Standards

## 5.1 Canonical Envelope (binding — BSS §5, §11.2)

```
Success: { success: true,  data: <resource | resource[]>, meta?: { ... } }
Error:   { success: false, error: { code, message, field?, details? }, meta: { requestId } }
```

```json
{
  "success": true,
  "data": { "id": "550e8400-e29b-41d4-a716-446655440000", "name": "Premium Cotton T-Shirt" },
  "meta": {
    "requestId": "req_01HZX9K...",
    "version": "v1"
  }
}
```

**Rules:**
1. Every endpoint, every path (including errors and 4xx/5xx), returns the envelope. No exceptions — including webhook ack endpoints (200 `{ success: true }`).
2. `data` is an object, array, or `null` (204 has no body and is exempt).
3. `meta` is optional for simple resources but **always** includes `requestId` (echoed in `X-Request-Id` header) and `version`; list endpoints always add pagination fields (§5.3).
4. `success` is always a boolean; clients check it first.
5. Never expose stack traces, SQL, provider internals, or raw exceptions (BSS §11.2).
6. Envelope formatting happens at the handler boundary only; services return domain results, never envelopes.

## 5.2 Success Responses

| HTTP | When | Body |
|---|---|---|
| 200 | Read, update, action, batch result | Envelope with `data` |
| 201 | Create | Envelope with `data` (created resource, full shape) + `Location` header |
| 202 | Accepted (background job started) | Envelope with `data: { jobId }` |
| 204 | Delete / no-content mutation | No body |
| 304 | Conditional GET (If-None-Match) | No body |

Idempotent replays of 201-creates return 200 with the same `data` and `Idempotent-Replay: true` (§2.7).

## 5.3 Metadata & Pagination Metadata

`meta` fields (all optional except where marked):

| Field | List (offset) | List (cursor) | Single resource | Purpose |
|---|---|---|---|---|
| `requestId` | ✅ | ✅ | ✅ | Trace id (also `X-Request-Id` header) |
| `version` | ✅ | ✅ | ✅ | `"v1"` |
| `page` / `limit` | ✅ / ✅ | — | — | Offset page + size |
| `total` / `totalPages` | ✅ / ✅ | — | — | Counts (bounded queries) |
| `hasMore` | ✅ | ✅ | — | Next page exists |
| `nextCursor` | — | ✅ | — | Opaque cursor for next page (null on last) |
| `idempotencyKey` / `idempotentReplay` | — | — | mutations | §2.7 |
| `facets` | search | search | — | Facet buckets |
| `cache` | read endpoints | — | — | `{ ttlSeconds, staleWhileRevalidate }` informational |

Example offset list:

```json
{
  "success": true,
  "data": [ { "...": "..." } ],
  "meta": {
    "requestId": "req_01HZX9K...",
    "version": "v1",
    "page": 1, "limit": 24, "total": 150, "totalPages": 7, "hasMore": true
  }
}
```

Example cursor list (search):

```json
{
  "success": true,
  "data": [ { "...": "..." } ],
  "meta": {
    "requestId": "req_01HZX9K...",
    "version": "v1",
    "nextCursor": "eyJvZmZzZXQiOjI0fQ==",
    "hasMore": true,
    "facets": { "category": [ { "value": "tshirts", "count": 42 } ] }
  }
}
```

## 5.4 Error Object

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for variant TSH-RED-M (requested 3, available 1)",
    "field": "items[0].quantity",
    "details": { "variantId": "550e8400-...", "available": 1, "requested": 3 }
  },
  "meta": { "requestId": "req_01HZX9K...", "version": "v1" }
}
```

| Field | Required | Content |
|---|---|---|
| `code` | ✅ | Registered SCREAMING_SNAKE error code (§6.7); machine-readable |
| `message` | ✅ | User-facing text, localized at the edge by `Accept-Language`; never PII; never internals |
| `field` | 422 only | Pointer to offending field (dot path / array index) |
| `details` | optional | Extra machine context; never PII; keys documented per error in §7 |

**Validation messages:** 422 responses include `details` as `{ fieldName: ["message1", "message2"], ... }` for aggregated field errors when applicable, with `error.field` set to the first failing field. Messages are exact Zod-derived strings registered in the shared schemas (BSS §7, §11.2) — the API never invents message text.

## 5.5 Standard Error Codes (registry prefix table)

Full registry in §6.7. Every code is unique across services; a code maps to exactly one HTTP status; a new code is added to the registry, never shadowed (BSS §11.2).

## 5.6 Localization

- `message` is localized at the edge; `code` is locale-independent. Locales: `en-IN` (default), `bn-IN`, `hi-IN` (ML-01, UX-12).
- Dates/times display localized client-side; API always returns UTC ISO 8601.
- Money is always INR (₹) DECIMAL(10,2) in API responses; formatting to paise/₹ symbols is client-side.

---

# 6. Error Handling

## 6.1 Error Taxonomy (binding — BSS §11.1)

| Class | HTTP | Semantics | Retryable? | Client action |
|---|---|---|---|---|
| **Authentication** | 401 | No/invalid/expired identity | No | Re-authenticate / refresh |
| **Authorization** | 403 / 404 | No permission (403) or resource hidden (404) | No | Stop; fix access |
| **Validation (L1)** | 422 | Field-level input errors (Zod) | No | Fix input per `details` |
| **Business (L2)** | 409 / 410 / 422 | Domain rule violation (state, window, caps, eligibility) | No (refresh state) | Refresh resource state, adjust |
| **Contract (L3)** | 409 / 422 | Cross-module gate (stock, price, serviceability, shipment-state) | Refresh state, then retry | Re-read state; re-run flow stage |
| **Idempotency** | 200 / 409 | Duplicate key → original result (200); real conflict (409) | No | Inspect `Idempotent-Replay` |
| **Rate limit** | 429 | Quota exhausted | Yes — after `Retry-After` | Back off per header |
| **Locked** | 423 | Account locked (auth brute-force) | Yes — after lockout window | Wait; verify identity |
| **Infrastructure** | 5xx | Adapter/DB/queue failures | Yes (backoff §6.6) | Retry with same idempotency key |
| **Unavailable** | 503 | Channel/external dependency down | Yes (documented per code) | Retry per `Retry-After` |

**Rules:**
1. Errors never echo raw input beyond the offending field; `details` never contains PII, secrets, tokens, or stack traces (BSS §11.2).
2. 404 is the universal "not visible to you" response — for missing resources **and** for unauthorized resource access (no existence disclosure, BSS §13.1).
3. A failed 4xx validation does not consume an `Idempotency-Key` result (§2.7); a failed 5xx/429 may be retried with the same key.
4. Never retry 4xx; never retry invalid signatures; never retry permanent declines/bounces (BSS §6.3).

## 6.2 Authentication Errors

| Code | HTTP | When | Notes |
|---|---|---|---|
| `AUTH_REQUIRED` | 401 | No credential on protected endpoint | `WWW-Authenticate: Bearer` |
| `INVALID_CREDENTIALS` | 401 | Login with wrong email/password | Generic message; never reveals which part failed |
| `SESSION_EXPIRED` | 401 | Access/refresh token expired or revoked | Client refreshes or re-logins |
| `API_KEY_INVALID` | 401 | API key malformed/unknown/revoked | |
| `API_KEY_EXPIRED` | 401 | API key past expiry | Renew via admin |
| `ACCOUNT_LOCKED` | 423 | Lockout policy (20/min/account AND 10/hr/IP) | Include retry window hint in message |
| `CSRF_INVALID` | 403 | Missing/wrong `x-csrf-token` | Web clients only |
| `TURNSTILE_FAILED` | 422 | Turnstile challenge failed on register/login | |
| `VERIFICATION_CODE_INVALID` | 400 | Wrong OTP | |
| `VERIFICATION_CODE_EXPIRED` | 410 | OTP older than 10 min | Request new code (3/hr cap) |
| `PASSWORD_RESET_TOKEN_INVALID` | 400 | Bad reset token | |

## 6.3 Authorization Errors

| Code | HTTP | When |
|---|---|---|
| `FORBIDDEN` | 403 | Authenticated actor lacks the required permission for a known operation |
| `NOT_FOUND` | 404 | Resource missing **or** hidden (default for unauthorized resource reads) |
| `ROLE_NOT_FOUND` | 404 | Role assignment target unknown |
| `PERMISSION_INVALID` | 422 | Malformed permission string |
| `EXPORT_FORBIDDEN` | 403 | Report/export beyond role tier or PII authorization |
| `DOCUMENT_ACCESS_DENIED` | 403 | Document not in actor's scope |
| `REGENERATION_REQUIRES_REASON` | 422 | Document regeneration without a reason (admin only) |
| `AUDIT_EXPORT_FORBIDDEN` | 403 | Audit export beyond role |

## 6.4 Validation & Business Errors (canonical codes, per service — full registry in §7)

Every code is registered once, with one HTTP status, one owning service (BSS §11.2). The catalog below is the canonical master list; each endpoint in §7 references its codes.

| Code | HTTP | Owning service | Meaning |
|---|---|---|---|
| `INSUFFICIENT_STOCK` | **409** | S09 | Availability gate failed (canonical resolution; VI App C.3 400 and SC 422 overridden — BSS §8.9) |
| `STOCK_CANNOT_BE_NEGATIVE` | 400 | S09 | Reduce below zero |
| `RESERVED_EXCEEDS_STOCK` | 400 | S09 | Reserve > stock |
| `RELEASE_EXCEEDS_RESERVED` | 400 | S09 | Release > reserved |
| `INVENTORY_ADJUSTMENT_FAILED` | 500 | S09 | Absolute adjust failed |
| `BULK_OPERATION_PARTIAL_SUCCESS` | 200 | All | Partial success reported in body |
| `PRODUCT_NOT_FOUND` | 404 | S05 | Also used by S10 for recommendation context |
| `PRODUCT_INACTIVE` | 410 | S05 | Archived/inactive product surfaced |
| `PRODUCT_SLUG_DUPLICATE` | 409 | S05 | Slug conflict |
| `PRODUCT_CATEGORY_INVALID` | 400 | S05 | Category invalid/inactive |
| `PRODUCT_PRICE_INVALID` | 400 | S05 | Price not positive DECIMAL(10,2) |
| `PUBLISH_*` | 400 | S05 | Publish gate failures (e.g., `PUBLISH_NO_STOCK`, missing image/description) |
| `MEDIA_TYPE_INVALID` / `MEDIA_SIZE_TOO_LARGE` / `MEDIA_DIMENSIONS_INVALID` | 400 | S05 | Media validation |
| `MEDIA_DUPLICATE_DETECTED` | 409 | S05 | Checksum duplicate |
| `CATEGORY_NOT_FOUND` / `CATEGORY_SLUG_DUPLICATE` | 404 / 409 | S06 | |
| `CATEGORY_DEPTH_EXCEEDED` | 422 | S06 | Depth > 5 levels |
| `CATEGORY_INACTIVE` | 410 | S06 | Surfaced inactive category |
| `COLLECTION_NOT_FOUND` / `COLLECTION_RULE_INVALID` / `COLLECTION_LIMIT_EXCEEDED` / `DUPLICATE_MEMBERSHIP` | 404/422/409/409 | S07 | |
| `VARIANT_NOT_FOUND` / `VARIANT_SKU_DUPLICATE` / `VARIANT_SKU_INVALID` / `VARIANT_DUPLICATE_COMBINATION` / `VARIANT_STOCK_INVALID` / `VARIANT_PRICE_INVALID` | 404/409/400/409/400/400 | S08 | SKU immutable; format 1–50 alphanumeric+hyphen |
| `SKU_INVALID_FORMAT` / `SKU_INVALID_LENGTH` / `SKU_DUPLICATE` | 400/400/409 | S08 | |
| `ATTRIBUTE_TYPE_NOT_FOUND` / `ATTRIBUTE_TYPE_DUPLICATE` / `ATTRIBUTE_VALUE_INACTIVE` | 404/409/410 | S08 | Global attribute system |
| `VARIANT_ATTRIBUTES_REQUIRED` / `SALE_PRICE_INVALID` | 400/400 | S08 | ≥ 1 attribute value; sale < regular |
| `INVALID_FILTER` / `INVALID_SORT` / `SEARCH_QUERY_REQUIRED` | 400 | S10 | |
| `CART_EMPTY` | 400 | S11 | |
| `ITEM_OUT_OF_STOCK` | 422 | S11 | Cart-context revalidation |
| `INSUFFICIENT_STOCK` (cart) | 422 | S11 | Cart-context (canonical deviation retained, BSS §8.11) |
| `PRICE_CHANGED` | 422 | S11/S13 | Price revalidation at flow stages |
| `COUPON_INVALID` / `COUPON_EXPIRED` / `COUPON_MINIMUM_NOT_MET` | 422 | S13 | |
| `ADDRESS_INVALID` | 422 | S13 | |
| `PINCODE_NOT_SERVICEABLE` | 422 | S13 | |
| `PAYMENT_FAILED` | 422 | S16 | |
| `ORDER_CREATION_FAILED` | 500 | S14 | |
| `DUPLICATE_ORDER` | 409 | S14/S16 | Cooldown/unique-constraint duplicate |
| `PAYMENT_AMOUNT_MISMATCH` | 422 | S16 | |
| `INVALID_PAYMENT_SIGNATURE` | 422 | S16 | |
| `REFUND_EXCEEDS_PAYMENT` | 400 | S16 | |
| `REFUND_WINDOW_EXPIRED` | 400 | S16 | > 180 days from payment |
| `ALREADY_REFUNDED` | 409 | S16 | |
| `REFUND_FAILED` | 500 | S16 | Retry queue + admin alert |
| `SETTLEMENT_NOT_FOUND` / `SETTLEMENT_STATE_INVALID` / `DUPLICATE_SETTLEMENT` / `SETTLEMENT_MINIMUM_NOT_MET` | 404/409/409/422 | S17 | |
| `COMMISSION_INVALID` | 422 | S17 | Out of range |
| `RETURN_WINDOW_EXPIRED` | 410 | S18 | > 7 days from delivery |
| `RETURN_ALREADY_EXISTS` | 409 | S18 | |
| `ITEM_NOT_RETURNABLE` | 422 | S18 | Exceptions (undergarments, final sale) |
| `EVIDENCE_REQUIRED` | 422 | S18 | |
| `RESOLUTION_NOT_FOUND` | 404 | S18 | |
| `RATING_VALUE_INVALID` / `REVIEW_RATING_INVALID` | 422 | S20 | Rating not 1–5 |
| `REVIEW_WINDOW_EXPIRED` | 410 | S20 | > 90 days from delivery |
| `REVIEW_NOT_VERIFIED_PURCHASE` | 403 | S20 | Hard rule #1 |
| `REVIEW_EDIT_WINDOW_EXPIRED` | 410 | S20 | > 30 days from submission |
| `REVIEW_ALREADY_EXISTS` | 409 | S20 | Same product within 24h |
| `REVIEW_RATE_LIMITED` | 429 | S20 | |
| `CONTENT_NOT_FOUND` / `CONTENT_SLUG_DUPLICATE` / `CONTENT_BLOCK_INVALID` / `CONTENT_PUBLISH_REQUIRES_BLOCK` / `CONTENT_ACCESSIBILITY_BLOCKED` / `CONTENT_VERSION_LIMIT` / `CONTENT_NOT_EDITABLE_IN_STATE` | 404/409/422/422/422/409/409 | S21 | |
| `HOMEPAGE_NOT_FOUND` / `HOMEPAGE_VERSION_LIMIT` / `SECTION_TYPE_IMMUTABLE` / `SECTION_CONFIG_INVALID` / `HOMEPAGE_DRAFT_EXISTS` / `HOMEPAGE_PUBLISHED_EXISTS` | 404/409/409/422/409/409 | S22 | |
| `TEMPLATE_NOT_FOUND` | 404 | S23/S25 | |
| `CHANNEL_UNAVAILABLE` | 503 | S23 | Retryable |
| `RECIPIENT_INVALID` | 422 | S23 | No retry |
| `BOUNCE_PERMANENT` | 410 | S23 | |
| `PREFERENCE_BLOCKED` | 403 | S23 | Security/in-app channels cannot be disabled |
| `CONVERSATION_NOT_FOUND` / `MESSAGE_TOO_LONG` / `ATTACHMENT_LIMIT` / `CONVERSATION_LINKED_ENTITY_CONFLICT` | 404/422/422/409 | S24 | |
| `DOCUMENT_TYPE_INVALID` / `DOCUMENT_DATA_INVALID` / `DOCUMENT_GENERATION_FAILED` / `DOCUMENT_NOT_FOUND` | 422/422/500/404 | S25 | |
| `REPORT_INVALID_FILTER` / `EXPORT_LIMIT_EXCEEDED` / `REPORT_NOT_FOUND` / `EXPORT_EXPIRED` | 400/422/404/410 | S26 | |
| `AUDIT_EVENT_INVALID` / `AUDIT_QUERY_TOO_WIDE` | 422/400 | S27 | |
| `CONFIG_KEY_NOT_FOUND` / `CONFIG_VALUE_INVALID` / `CONFIG_KEY_READONLY` / `CONFIG_FLAG_UNKNOWN` | 404/422/409/404 | S28 | |
| `JOB_NOT_FOUND` / `JOB_CLAIM_CONFLICT` / `JOB_EXHAUSTED` / `JOB_DEFINITION_INVALID` | 404/409/410/422 | S29 | |
| `FILE_TOO_LARGE` / `FILE_TYPE_INVALID` / `UPLOAD_TOKEN_INVALID` / `UPLOAD_TOKEN_EXPIRED` / `UPLOAD_RATE_LIMITED` / `MEDIA_NOT_FOUND` / `INTEGRITY_MISMATCH` | 422/422/401/410/429/404/500 | S30 | |
| `PINCODE_INVALID` / `PHONE_INVALID` / `PROFILE_FIELD_INVALID` / `MAX_ADDRESSES_REACHED` | 422/422/422/409 | S03 | |
| `CUSTOMER_NOT_FOUND` / `ADDRESS_NOT_FOUND` | 404 | S03 | |
| `SHOP_NOT_FOUND` / `SHOP_OWNER_CONFLICT` / `STAFF_LIMIT_REACHED` / `GSTIN_INVALID` / `SETTINGS_INVALID` | 404/409/409/422/422 | S04 | |
| `ROLE_ASSIGNMENT_INVALID` | 422 | S02 | |

**Validation message convention:** 422 with `error.field` set to the first failing field and `error.details` as `{ field: string[] }`. Codes above are the L2/L3 domain codes; L1 field errors use the shared-schema codes (e.g., `INVALID_EMAIL_FORMAT`) registered per contract.

## 6.5 Rate-Limit Errors

- `429 RATE_LIMITED` (or per-endpoint specific codes like `UPLOAD_RATE_LIMITED`, `REVIEW_RATE_LIMITED`).
- Response includes `Retry-After: <seconds>` (and `RateLimit-Remaining`, `RateLimit-Limit`, `RateLimit-Reset` informational headers).
- Rate limit tiers: Public 60 / Authenticated 120 / Admin 300 / API Key 100 / Premium 500 per minute (canonical IS-03 / B.10); per-endpoint overrides registered in §7.
- Retry guidance: respect `Retry-After` exactly; do not retry 429 with a different key for the same operation unless the window is known to have passed; bulk ceilings (§4.8) and login lockouts are separate mechanisms that may surface as 429/423.

## 6.6 System Errors & Retry Guidance

| Code | HTTP | Meaning | Retry policy |
|---|---|---|---|
| `INTERNAL_ERROR` | 500 | Unexpected failure | Backoff 1s/2s/4s, max 3, same idempotency key |
| `ORDER_CREATION_FAILED` | 500 | Order pipeline failure | Retry with same key; state remains `pending` |
| `REFUND_FAILED` | 500 | Gateway refund failure | Automatic retry queue (backoff 1s/2s/4s/8s, max 3, DLQ + admin alert); client observes `failed` status and may call `POST /refunds/:id/retry` (admin) |
| `DOCUMENT_GENERATION_FAILED` | 500 | Generation pipeline failure | Automatic retry 3, DLQ; client polls job status |
| `CHANNEL_UNAVAILABLE` | 503 | Notification channel down | Retryable (priority-class policy, §9.4) |
| `SERVICE_UNAVAILABLE` | 503 | Dependency/maintenance | Respect `Retry-After` |
| `INTEGRITY_MISMATCH` | 500 | Media checksum mismatch | Quarantine + flag; regenerate |
| `INVENTORY_ADJUSTMENT_FAILED` | 500 | Adjustment transaction failure | Retry with same key |

**General retry matrix (canonical, BSS §6.3):** synchronous DB conflicts — 1s/2s/4s, max 3, re-fetch state before retry; outbound async jobs (email/export/document/webhook) — exponential 1s/2s/4s/8s, max 3, DLQ after max; gateway calls — 30s cooldown, transient errors only, circuit breaker; courier APIs — 1s/2s/4s/8s max 3 with manual-update fallback; inbound webhooks — return non-2xx on failure so the provider retries; **never retry** 4xx validation/auth, invalid signature, bounced email, permanent declines.

**Conflict resolution guidance:** `409 INSUFFICIENT_STOCK`, `409 DUPLICATE_ORDER`, `412 PRECONDITION_FAILED`, and `409` state-machine conflicts must be handled by **refreshing state** (re-GET the resource), not blind retry (BSS §10.4.5).

## 6.7 Error Registry

- Single registry: `api/_lib/errors/` (implementation location per BSS §15). Each code registers: owning service, HTTP status, default message, retryable flag, localizations.
- Codes are unique platform-wide; no two services reuse a code with different semantics (BSS §11.2).
- New codes are additive (non-breaking); a new code requires a registry entry, never an inline message.
- The registry is published in machine-readable form (`GET /api/v1/meta/errors`) for client SDK generation and error-lookup tooling (Admin/Public class, no PII).

---

# 7. Endpoint Catalog

## 7.0 Catalog Conventions

**Access notation:** `P` = Public · `C` = Customer · `S` = Shop Owner · `A` = Admin · `I` = Internal · `K` = Service/API key. Roles are additive (C includes P; S includes C; A includes S — §3.3). Every endpoint lists its **minimum** access class; resource ownership is enforced separately (§3.3.4).

**Endpoint spec format** (binding for every entry):

```
`METHOD /path` — ID · Name
- **Purpose:** …
- **Access:** P · rate 60/min
- **Request:** body/query/params (L1 schema reference)
- **Success:** 200/201/202/204 + envelope shape
- **Errors:** codes (full registry §6.4; per-endpoint specifics listed)
- **Validation:** L1/L2/L3 notes (business rules owned by the service — quoted, not redefined)
- **Events:** dot-notation canonical events published/consumed
- **Performance:** budget/cache TTL (BSS §12)
```

**Shared conventions applied to all endpoints:** envelope (§5), idempotency (§2.7), pagination 24/max-100 offset (cursor for search), CSRF + `Idempotency-Key` on all mutations, 404-on-hidden-resource, `requestId` in every response. The `Errors:` line lists only the codes **additional** to the universal set (400 malformed, 401, 403, 404, 422 field, 429, 5xx, 409 conflicts, 410 gone).

**Cross-cutting rules (no duplicated endpoints):**
- Order creation exists only at `POST /checkout/verify-payment`; no `POST /orders`.
- Payment initiation exists only at `POST /checkout/sessions/:id/payment`; payment verification only at `POST /checkout/verify-payment`; no standalone payment-verify endpoint.
- Refund initiation is triggered by events (cancellation/rejection/return-approval); the only manual refund endpoints are admin (`POST /refunds`, `POST /refunds/:id/retry`).
- Product publishing gates (`name, category, price, description, ≥1 image, ≥1 active variant, unique slug`) are enforced by S05 via `POST /products/:id/publish` — never re-validated by other endpoints.
- Invoice/label/receipt generation is always event-triggered via S25; the API exposes downloads and on-demand requests only (`POST /documents/request`).
- Stock truth is only readable via inventory endpoints or product availability fields — never derivable from product payloads.

---

## 7.1 Authentication (S01 · T0)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| AUTH-01 | `POST /auth/register` | P | Create account (Turnstile) |
| AUTH-02 | `POST /auth/login` | P | Sign in (Turnstile) |
| AUTH-03 | `POST /auth/logout` | C+ | End current session |
| AUTH-04 | `POST /auth/logout-all` | C+ | Revoke all sessions |
| AUTH-05 | `POST /auth/refresh` | C+ | Rotate refresh token → new access token |
| AUTH-06 | `POST /auth/verify-email` | C+ | Verify email with 6-digit code |
| AUTH-07 | `POST /auth/resend-verification` | C+ | Resend verification code (3/hr) |
| AUTH-08 | `POST /auth/forgot-password` | P | Request password reset (5/hr) |
| AUTH-09 | `POST /auth/reset-password` | P | Set new password with reset token |
| AUTH-10 | `POST /auth/verify-otp` | C+ | Re-verification for sensitive operations |
| AUTH-11 | `GET /auth/session` | C+ | Current session + user summary |
| AUTH-12 | `GET /auth/sessions` | C+ | List active sessions (max 5) |
| AUTH-13 | `POST /auth/sessions/:id/revoke` | C+ | Revoke one session |

`POST /auth/register` — **AUTH-01 · Register**
- **Purpose:** create a customer account; profile bootstrap (S03 consumes `auth.user.registered`).
- **Access:** P · rate **10/min/IP** (IDENTITY §7); Turnstile required.
- **Request:** `{ email, password, name, phone?, consentMarketing: boolean }` — L1 Zod (email format, password policy per IAM; phone `/^\+91[6-9]\d{9}$/` optional).
- **Success 201:** `data: { user: { id, email, name, role: "customer" }, verificationRequired: true }` + session cookies (auto-login).
- **Errors:** 422 `TURNSTILE_FAILED`, `PHONE_INVALID` · 400 `VERIFICATION_CODE_INVALID` (email) · 409 (existing email → generic "account exists" 409 `ACCOUNT_EXISTS`).
- **Validation:** L1 formats; L2 account lockout state; L4 rate limit.
- **Events:** `auth.user.registered`; audit `TURNSTILE_FAILURE` on challenge failure.
- **Performance:** KV rate limiter; auth endpoints meet p95 < 300ms (T0).

`POST /auth/login` — **AUTH-02 · Login**
- **Purpose:** authenticate with email+password; issue session.
- **Access:** P · rate **20/min** per account AND **10/hr** per IP (IS-03).
- **Request:** `{ email, password }` + Turnstile token.
- **Success 200:** `data: { user, sessionExpiresAt, mfaRequired: false }`; sets httpOnly session cookies (access 15 min / refresh 7 days).
- **Errors:** 401 `INVALID_CREDENTIALS` (generic) · 423 `ACCOUNT_LOCKED` · 422 `TURNSTILE_FAILED` · 429 `RATE_LIMITED`.
- **Validation:** L1 email/password format; L2 lockout window; L4 rate limit.
- **Events:** `auth.user.login` (triggers cart merge T13); audit `LOGIN_FAILED` (Warning) on failure.
- **Performance:** bcrypt cost 12 deliberately slow (brute-force defense); KV rate limiter; p95 < 300ms.

`POST /auth/logout` — **AUTH-03 · Logout**
- **Purpose:** revoke current session, clear cookies.
- **Access:** C+ · CSRF required.
- **Request:** — (session cookie identifies session).
- **Success 204:** no body.
- **Errors:** 401 `SESSION_EXPIRED`.
- **Events:** `auth.user.logout`.
- **Performance:** trivial; session purge via scheduled job (30-day archive).

`POST /auth/logout-all` — **AUTH-04 · Logout all sessions**
- **Purpose:** revoke every session of the user (T12: atomic revocation + audit rows).
- **Access:** C+ · CSRF required.
- **Success 204.**
- **Errors:** 401.
- **Events:** `auth.session.revoked` per session (reg.); audit `SESSION_REVOKED`.
- **Performance:** batched row update + outbox events.

`POST /auth/refresh` — **AUTH-05 · Refresh token**
- **Purpose:** rotate refresh token (7 days, httpOnly cookie or `refreshToken` body for mobile) and issue new access token (15 min).
- **Access:** C+ (refresh credential).
- **Request:** body optional `{ refreshToken }` (mobile); web uses cookie.
- **Success 200:** `data: { accessToken?, expiresIn, sessionExpiresAt }` — web returns cookie-set only; mobile receives `accessToken`.
- **Errors:** 401 `SESSION_EXPIRED` (revoked/stale) · 400 `VERIFICATION_CODE_INVALID`-style format errors.
- **Validation:** rotation invalidates old token atomically (T12); max 5 concurrent sessions.
- **Performance:** p95 < 300ms; no cache (session data always fresh).

`POST /auth/verify-email` — **AUTH-06 · Verify email**
- **Purpose:** confirm email with 6-digit code (10-min expiry).
- **Access:** C+.
- **Request:** `{ code }`.
- **Success 200:** `data: { emailVerified: true }`.
- **Errors:** 400 `VERIFICATION_CODE_INVALID` · 410 `VERIFICATION_CODE_EXPIRED` · 429 `RATE_LIMITED` (3/hr resend cap).
- **Validation:** L1 6-digit numeric; L2 window.
- **Events:** `auth.user.registered` follow-up (`customer.profile.updated` on verification state).

`POST /auth/resend-verification` — **AUTH-07 · Resend verification**
- **Purpose:** re-send email verification code (3/hr cap).
- **Access:** C+.
- **Success 202:** `data: { resentAt }`.
- **Errors:** 429 `RATE_LIMITED`.
- **Performance:** queued email (priority High); never blocks request.

`POST /auth/forgot-password` — **AUTH-08 · Forgot password**
- **Purpose:** send password-reset link/OTP (5/hr rate).
- **Access:** P.
- **Request:** `{ email }`.
- **Success 200:** generic `{ success: true }` — never reveals whether the email exists (no enumeration).
- **Errors:** 429 `RATE_LIMITED`.
- **Events:** `auth.password.reset` (notification Email/Urgent).
- **Performance:** queued; < 5s processing budget.

`POST /auth/reset-password` — **AUTH-09 · Reset password**
- **Purpose:** set new password with reset token.
- **Access:** P.
- **Request:** `{ resetToken, newPassword }`.
- **Success 200:** `data: { passwordChanged: true }`; all sessions revoked.
- **Errors:** 400 `PASSWORD_RESET_TOKEN_INVALID` · 410 expired · 422 password policy.
- **Events:** `auth.password.changed`; audit `PASSWORD_CHANGED`.
- **Performance:** session revocation batched.

`POST /auth/verify-otp` — **AUTH-10 · Verify OTP (sensitive ops)**
- **Purpose:** 6-digit re-verification code for sensitive operations (password change, settlement-destination change, admin overrides — BSS §13.2); returns short-lived `verification` claim consumed by the target operation.
- **Access:** C+.
- **Request:** `{ code, purpose }` (`password_change | settlement_change | admin_override | refund_override`).
- **Success 200:** `data: { verified: true, verificationId, expiresAt }`.
- **Errors:** 400 `VERIFICATION_CODE_INVALID` · 410 `VERIFICATION_CODE_EXPIRED` · 429 (3/hr).
- **Events:** audit `SENSITIVE_OP_VERIFIED`.
- **Performance:** p95 < 300ms; claim stored server-side (10-min TTL).

`GET /auth/session` — **AUTH-11 · Current session**
- **Purpose:** resolve current session + minimal user summary for SPA bootstrap (replaces profile fetch on load).
- **Access:** C+.
- **Success 200:** `data: { sessionId, user: { id, email, name, role }, permissions: […] }` — permission set from S02 cache.
- **Errors:** 401 `AUTH_REQUIRED` / `SESSION_EXPIRED`.
- **Performance:** KV-cached permission set; < 100ms target.

`GET /auth/sessions` — **AUTH-12 · List sessions**
- **Purpose:** list active sessions (id, device, browser, createdAt, lastActiveAt).
- **Access:** C+.
- **Success 200:** `data: [ … ]` (max 5, no pagination needed).
- **Performance:** fresh DB read; no cache.

`POST /auth/sessions/:id/revoke` — **AUTH-13 · Revoke session**
- **Purpose:** revoke a specific session (e.g., lost device).
- **Access:** C+ (own sessions only; Admin may revoke any user's sessions via admin user endpoints).
- **Success 200:** `data: { revoked: true }` or 204.
- **Errors:** 404 (hidden if not own).
- **Events:** `auth.session.revoked` (reg.).
- **Performance:** atomic revoke + audit rows (T12).

---

## 7.2 Users & Identity Administration (S01 user profile · S02 authorization · T0)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| USR-01 | `GET /users/me` | C+ | Self user profile (auth-owned identity) |
| USR-02 | `PATCH /users/me` | C+ | Update display name/avatar/phone |
| USR-03 | `DELETE /users/me` | C+ | GDPR account anonymization (async) |
| USR-04 | `GET /admin/users` | A | User list (filters, masked PII) |
| USR-05 | `GET /admin/users/:id` | A | User detail (masked PII) |
| USR-06 | `POST /admin/users/:id/roles` | A | Assign/change role |
| USR-07 | `POST /admin/users/:id/block` | A | Block account |
| USR-08 | `POST /admin/users/:id/unblock` | A | Unblock account |
| USR-09 | `GET /roles` | A | Role catalog |
| USR-10 | `POST /roles` | A | Create custom role |
| USR-11 | `PATCH /roles/:id` | A | Update role |
| USR-12 | `POST /roles/:id/permissions` | A | Grant/revoke permissions on role |
| USR-13 | `GET /api-keys` | A | List API keys (hashes never returned) |
| USR-14 | `POST /api-keys` | A | Create scoped API key |
| USR-15 | `DELETE /api-keys/:id` | A | Revoke API key (instant) |

`GET /users/me` — **USR-01 · My user profile**
- **Purpose:** read the auth-owned identity record (email, name, phone, avatar, emailVerified, role, superAdmin flag).
- **Access:** C+.
- **Success 200:** `data: { id, email, name, phone?, avatarUrl?, emailVerified, role, createdAt }`.
- **Errors:** 401.
- **Performance:** KV-cached short TTL, invalidated on profile update event.

`PATCH /users/me` — **USR-02 · Update my profile**
- **Purpose:** update mutable identity fields (name ≤ 100, avatar media ref, phone — re-verification via OTP when changed).
- **Access:** C+ · CSRF + `Idempotency-Key`.
- **Request:** `{ name?, avatarMediaId?, phone? }`.
- **Success 200:** updated profile.
- **Errors:** 422 `PROFILE_FIELD_INVALID` · 422 `PHONE_INVALID` · 400 `VERIFICATION_CODE_INVALID` (phone change).
- **Events:** `customer.profile.updated` (reg.) for downstream consumers.
- **Performance:** KV invalidate on write.

`DELETE /users/me` — **USR-03 · Request account anonymization (GDPR)**
- **Purpose:** enqueue data-lifecycle anonymization (3-year retention class, anonymize-don't-delete — Blueprint §6.4). Requires OTP re-verification.
- **Access:** C+ · OTP claim required.
- **Success 202:** `data: { jobId, expectedCompletionAt }`.
- **Errors:** 401/403 · 400 `VERIFICATION_CODE_INVALID`.
- **Events:** audit `ACCOUNT_ANONYMIZATION_REQUESTED`; Workflow job (cleanup class).
- **Performance:** background job; never synchronous deletion.

`GET /admin/users` — **USR-04 · User list (admin)**
- **Purpose:** platform user administration with filters `status`, `role`, `createdAtFrom/To`, `search` (email/name), pagination.
- **Access:** A · rate 300/min.
- **Success 200:** `data: [{ id, email (masked per tier), name, role, status, createdAt }]` + pagination meta. PII masked per report tiers (BSS §13.3).
- **Errors:** 400 `AUDIT_QUERY_TOO_WIDE`-style bounded-query guards (admin lists bounded).
- **Performance:** offset pagination, composite indexes; < 300ms admin budget.

`GET /admin/users/:id` — **USR-05 · User detail (admin)**
- **Purpose:** full admin view of a user (masked PII: phone/email masked unless authorized — BSS §13.3).
- **Access:** A.
- **Errors:** 404 (hidden).
- **Performance:** < 300ms.

`POST /admin/users/:id/roles` — **USR-06 · Assign role**
- **Purpose:** set role on a user (additive hierarchy; `super_admin` as capability flag).
- **Access:** A (super_admin for role elevation).
- **Request:** `{ role: "customer"|"shop_owner"|"admin"|"compliance" }` + optional `scope: { shopId? }`.
- **Success 200:** `data: { id, role, scope }`.
- **Errors:** 422 `ROLE_ASSIGNMENT_INVALID` · 403 `FORBIDDEN` (self-elevation prohibited).
- **Events:** `auth.role.assigned` (invalidates permission caches platform-wide).
- **Performance:** cache invalidation via event.

`POST /admin/users/:id/block` — **USR-07 · Block account**
- **Purpose:** block a user (all sessions revoked; login rejected).
- **Access:** A · reason required.
- **Request:** `{ reason }`.
- **Success 200.**
- **Events:** `auth.session.revoked` × sessions; audit `USER_BLOCKED` with reason.
- **Performance:** batched revocation.

`POST /admin/users/:id/unblock` — **USR-08 · Unblock account**
- **Purpose:** lift a block; lockout counters reset.
- **Access:** A · reason required.
- **Success 200.**
- **Events:** audit `USER_UNBLOCKED`.

`GET /roles` — **USR-09 · Role catalog**
- **Purpose:** list roles with permission sets (Guest 0 → Customer 10 → Shop Owner 20 → Admin 30 → System 100 + custom).
- **Access:** A.
- **Success 200:** `data: [{ id, name, level, permissions: ["scope:resource:action"] }]`.
- **Performance:** KV-cached, event-invalidated.

`POST /roles` — **USR-10 · Create role**
- **Purpose:** create custom role with permission set.
- **Access:** A.
- **Request:** `{ name, permissions: [] }`.
- **Success 201.**
- **Errors:** 422 `PERMISSION_INVALID`.
- **Events:** `auth.permission.changed`.
- **Performance:** cache invalidation event.

`PATCH /roles/:id` — **USR-11 · Update role**
- **Access:** A · reason optional.
- **Success 200.**
- **Errors:** 404 `ROLE_NOT_FOUND`.
- **Events:** `auth.permission.changed`.

`POST /roles/:id/permissions` — **USR-12 · Grant/revoke permissions**
- **Purpose:** delta apply `{ grant: [], revoke: [] }` on a role.
- **Access:** A.
- **Request:** `{ grant: [perms], revoke: [perms] }` — format `{scope}:{resource}:{action}`.
- **Success 200:** `data: { effectivePermissions }`.
- **Errors:** 422 `PERMISSION_INVALID`.
- **Events:** `auth.permission.changed` — instant cache invalidation for all services.
- **Performance:** event-driven invalidation; no per-request DB reads.

`GET /api-keys` — **USR-13 · List API keys**
- **Purpose:** list API keys (id, scopes, createdAt, lastUsedAt, status). **Hash only — key value never returned.**
- **Access:** A.
- **Success 200.**
- **Performance:** KV-cached, event-invalidated.

`POST /api-keys` — **USR-14 · Create API key**
- **Purpose:** create scoped, least-privilege API key (hash stored). Key value shown once.
- **Access:** A.
- **Request:** `{ name, scopes: ["catalog:product:read"], expiresAt? }`.
- **Success 201:** `data: { id, key: "nabome_…", scopes, expiresAt }` — key returned once.
- **Errors:** 422 `PERMISSION_INVALID` · 403 (money-move scopes denied by default).
- **Events:** `api.key.created` (reg.); audit with scopes.
- **Performance:** instant revocation capability (cache-invalidate event).

`DELETE /api-keys/:id` — **USR-15 · Revoke API key**
- **Purpose:** immediate revocation.
- **Access:** A.
- **Success 204.**
- **Errors:** 404 (hidden).
- **Events:** audit `API_KEY_REVOKED`.

---

## 7.3 Customers (S03 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| CUS-01 | `GET /account` | C | Self customer profile |
| CUS-02 | `PATCH /account` | C | Update profile |
| CUS-03 | `GET /account/addresses` | C | Address book |
| CUS-04 | `POST /account/addresses` | C | Add address |
| CUS-05 | `GET /account/addresses/:id` | C | Address detail |
| CUS-06 | `PATCH /account/addresses/:id` | C | Update address |
| CUS-07 | `DELETE /account/addresses/:id` | C | Remove address (soft) |
| CUS-08 | `POST /account/addresses/:id/default` | C | Set default address |
| CUS-09 | `GET /account/preferences` | C | Notification/marketing preferences |
| CUS-10 | `PATCH /account/preferences` | C | Update preferences |
| CUS-11 | `GET /account/stats` | C | Customer stats (derived) |
| CUS-12 | `GET /admin/customers` | A | Customer list (masked) |
| CUS-13 | `GET /admin/customers/:id` | A | Customer detail (masked) |
| CUS-14 | `GET /admin/customers/:id/orders` | A | Customer orders (admin) |

`GET /account` — **CUS-01 · My customer profile**
- **Purpose:** read full self profile (profile + default address + summary preferences). Shop-owner view of other customers is masked city/state only (BSS §9.5) and available only via admin.
- **Access:** C.
- **Success 200:** `data: { profile, defaultAddress?, statsSummary }`.
- **Performance:** KV-cached (event-invalidated); < 100ms.

`PATCH /account` — **CUS-02 · Update profile**
- **Purpose:** update profile fields (displayName, dateOfBirth?, gender?, marketingOptIn?) — PII changes are audit class 2y.
- **Access:** C · CSRF + key.
- **Request:** `{ displayName?, dateOfBirth?, gender?, marketingOptIn? }`.
- **Success 200.**
- **Errors:** 422 `PROFILE_FIELD_INVALID`.
- **Events:** `customer.profile.updated` (reg.).
- **Performance:** KV invalidate.

`GET /account/addresses` — **CUS-03 · Address book**
- **Purpose:** list own addresses (full PII to self; masked to shop/admin roles elsewhere).
- **Access:** C.
- **Success 200:** `data: [ { id, label, name, phone, line1, line2, city, state, pincode, isDefault, isActive } ]`.
- **Errors:** none beyond universal.
- **Performance:** fresh read (addresses are sensitive-fact rows); no cache.

`POST /account/addresses` — **CUS-04 · Add address**
- **Purpose:** create address (L1: phone `/^[6-9]\d{9}$/` checkout form or `+91` full; pincode 6-digit India Post; L2: max addresses per config key).
- **Access:** C · key required.
- **Request:** `{ label?, name, phone, line1, line2?, city, state, pincode, isDefault? }`.
- **Success 201:** full address.
- **Errors:** 422 `PINCODE_INVALID`, `PHONE_INVALID` · 409 `MAX_ADDRESSES_REACHED`.
- **Events:** `customer.address.added` (reg.).
- **Performance:** serviceability lookup (India Post pincode) cached 24h per pincode.

`GET /account/addresses/:id` — **CUS-05 · Address detail**
- **Access:** C (own only; else 404).
- **Success 200.**
- **Errors:** 404 `ADDRESS_NOT_FOUND`.

`PATCH /account/addresses/:id` — **CUS-06 · Update address**
- **Access:** C · ownership check every op (BSS §8.3).
- **Success 200.**
- **Errors:** 404 · 422 `PINCODE_INVALID`.
- **Events:** `customer.address.updated` (reg.).

`DELETE /account/addresses/:id` — **CUS-07 · Remove address**
- **Purpose:** soft-delete (addresses referenced by orders are retained immutably via order snapshots).
- **Access:** C.
- **Success 204.**
- **Events:** `customer.address.removed` (reg.).

`POST /account/addresses/:id/default` — **CUS-08 · Set default**
- **Purpose:** promote address to default (single default invariant).
- **Access:** C.
- **Success 200.**
- **Events:** `customer.address.updated`.

`GET /account/preferences` — **CUS-09 · Preferences**
- **Purpose:** read notification/marketing preferences (owned here; consumed by S23 — BSS §8.3).
- **Access:** C.
- **Success 200:** `data: { channels: { email, inApp, sms? }, topics: { order, marketing, review, offer }, marketingOptIn }`.
- **Performance:** KV-cached 5 min, event-invalidated.

`PATCH /account/preferences` — **CUS-10 · Update preferences**
- **Purpose:** update preferences; security + in-app channels cannot be disabled (BSS §8.23 — 403 `PREFERENCE_BLOCKED` on server if attempted); marketing requires explicit opt-in (CAN-SPAM).
- **Access:** C · rate 10/min.
- **Success 200.**
- **Errors:** 403 `PREFERENCE_BLOCKED`.
- **Events:** `customer.preference.updated` (reg.).

`GET /account/stats` — **CUS-11 · Customer stats**
- **Purpose:** derived counters (orders count, returns count, reviews count, wishlist count) — derived, never stored without invalidation (FINANCE §11 rule mirrored, BSS §8.3).
- **Access:** C.
- **Success 200:** `data: { orderCount, returnCount, reviewCount, wishlistItemCount }`.
- **Performance:** event-invalidated aggregates; < 200ms.

`GET /admin/customers` — **CUS-12 · Customer list (admin)**
- **Purpose:** admin search/list with filters (`search`, `city`, `createdAtFrom/To`, `isBlocked`), pagination.
- **Access:** A.
- **Success 200:** masked PII per tier (phones/emails masked unless authorized — BSS §13.3).
- **Performance:** offset pagination, composite indexes; admin budget < 300ms.

`GET /admin/customers/:id` — **CUS-13 · Customer detail (admin)**
- **Access:** A.
- **Success 200:** masked PII.
- **Errors:** 404.

`GET /admin/customers/:id/orders` — **CUS-14 · Customer orders (admin)**
- **Purpose:** admin-scoped order history for the customer (bounded, paginated).
- **Access:** A.
- **Success 200:** order list (masked address fields per role).
- **Performance:** composite index `(profileId, status, createdAt)`; pagination.

---

## 7.4 Shop Owners (S04 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| SHOP-01 | `POST /shop` | S | Create shop (one per owner) |
| SHOP-02 | `GET /shop` | S | Own shop profile |
| SHOP-03 | `PATCH /shop` | S | Update shop profile |
| SHOP-04 | `GET /shop/staff` | S | Staff list |
| SHOP-05 | `POST /shop/staff/invite` | S | Invite staff |
| SHOP-06 | `DELETE /shop/staff/:id` | S | Remove staff |
| SHOP-07 | `PATCH /shop/staff/:id` | S | Change staff role |
| SHOP-08 | `GET /shop/settings` | S | Shop settings |
| SHOP-09 | `PATCH /shop/settings` | S | Update settings |
| SHOP-10 | `GET /shop/settings/settlement-method` | S | Settlement method (masked) |
| SHOP-11 | `PATCH /shop/settings/settlement-method` | S | Change settlement destination (re-verification) |
| SHOP-12 | `GET /admin/shops` | A | Shop list |
| SHOP-13 | `GET /admin/shops/:id` | A | Shop detail |

`POST /shop` — **SHOP-01 · Create shop**
- **Purpose:** create the shop entity for a shop-owner account (unique one-shop-per-owner).
- **Access:** S (role grant from admin precedes).
- **Request:** `{ name, slug, description?, logoMediaId?, gstin?, bankAccount?, bankIfsc? }`.
- **Success 201:** `data: { shop }` — triggers KYC/document verification flow.
- **Errors:** 409 `SHOP_OWNER_CONFLICT` · 422 `GSTIN_INVALID`, `SETTINGS_INVALID`.
- **Events:** `shop.profile.updated`; Document generation (GSTIN verification docs, event-triggered).
- **Performance:** < 300ms; bank/GST data financial class (7y retention, highest-sensitivity PII).

`GET /shop` — **SHOP-02 · Own shop profile**
- **Purpose:** read own shop (owner sees full; staff see non-sensitive fields).
- **Access:** S.
- **Success 200.**
- **Performance:** KV-cached 5 min, event-invalidated (BSS §8.4).

`PATCH /shop` — **SHOP-03 · Update shop profile**
- **Purpose:** update profile fields; only owner or Admin may mutate (staff cannot).
- **Access:** S (owner/Admin).
- **Success 200.**
- **Events:** `shop.profile.updated` (reg.).
- **Performance:** KV invalidate.

`GET /shop/staff` — **SHOP-04 · Staff list**
- **Purpose:** list staff bindings (role = shop-owner scope within this shop).
- **Access:** S.
- **Success 200:** `data: [ { id, userId, name, email, role, status } ]` — < 200ms target.
- **Performance:** no heavy joins; bounded.

`POST /shop/staff/invite` — **SHOP-05 · Invite staff**
- **Purpose:** invite a staff member with role binding (atomic invite + role, staff limit per config).
- **Access:** S (owner).
- **Request:** `{ email, role, permissions? }`.
- **Success 201:** `data: { inviteId, status: "pending" }`.
- **Errors:** 409 `STAFF_LIMIT_REACHED`.
- **Events:** `shop.staff.invited` (reg.); notification Email/High.
- **Performance:** single atomic unit.

`DELETE /shop/staff/:id` — **SHOP-06 · Remove staff**
- **Purpose:** remove staff binding + role (owner only).
- **Access:** S (owner).
- **Success 204.**
- **Events:** `shop.staff.removed` (reg.); permission cache invalidation.

`PATCH /shop/staff/:id` — **SHOP-07 · Change staff role**
- **Access:** S (owner).
- **Success 200.**
- **Events:** `auth.role.assigned` + `shop.staff.*`.

`GET /shop/settings` — **SHOP-08 · Shop settings**
- **Purpose:** settings (shipping config reference, GSTIN, brand fields, notification config). Bank data excluded (separate settlement-method endpoint).
- **Access:** S.
- **Success 200.**
- **Performance:** KV-cached 5 min, event-invalidated.

`PATCH /shop/settings` — **SHOP-09 · Update settings**
- **Purpose:** update settings; every change audited with before/after (financial class where GSTIN/bank-adjacent).
- **Access:** S (owner) / A.
- **Success 200.**
- **Errors:** 422 `GSTIN_INVALID`, `SETTINGS_INVALID`.
- **Events:** `shop.settings.updated` (reg.).

`GET /shop/settings/settlement-method` — **SHOP-10 · Settlement method**
- **Purpose:** read settlement destination (masked: `bankName`, `accountLast4`, `ifsc`, `upiId?`, `status: verified|pending`).
- **Access:** S (owner) / A / Finance internal read.
- **Success 200:** masked fields only; full value never leaves the API except to Finance consumers.
- **Performance:** financial class; fresh read.

`PATCH /shop/settings/settlement-method` — **SHOP-11 · Change settlement destination**
- **Purpose:** update bank/UPI details for payouts. **Re-verification required** (OTP claim §3.2.8) + settlement-hold awareness: pending settlements continue to the old destination until approved batch cut-off.
- **Access:** S (owner).
- **Request:** `{ bankAccount?, bankIfsc?, upiId?, verificationId }`.
- **Success 200:** `data: { status: "pending_review" }` — re-verification before activation.
- **Errors:** 422 `SETTINGS_INVALID` · 403 (missing verification claim).
- **Events:** audit `SETTLEMENT_DESTINATION_CHANGED` (financial class 7y); `shop.settings.updated`.
- **Security:** highest-sensitivity PII (BSS §8.4); masked to non-owner staff.

`GET /admin/shops` — **SHOP-12 · Shop list (admin)**
- **Purpose:** platform shop administration (filters: `status`, `gstinVerified`, `createdAtFrom/To`, search).
- **Access:** A.
- **Success 200:** masked settlement fields.
- **Performance:** offset pagination; < 300ms.

`GET /admin/shops/:id` — **SHOP-13 · Shop detail (admin)**
- **Access:** A.
- **Success 200.**
- **Errors:** 404.

---

## 7.5 Products (S05 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| PRD-01 | `GET /products` | P | Public browse/list (published only) |
| PRD-02 | `GET /products/by-slug/:slug` | P | Public product detail (SEO canonical) |
| PRD-03 | `GET /products/:id` | P/C/S/A | Role-scoped product detail |
| PRD-04 | `POST /products` | S/A | Create draft product |
| PRD-05 | `PATCH /products/:id` | S/A | Update product |
| PRD-06 | `POST /products/:id/publish` | S/A | Publish (gate-validated) |
| PRD-07 | `POST /products/:id/unpublish` | S/A | Unpublish |
| PRD-08 | `POST /products/:id/archive` | S/A | Archive (reason) |
| PRD-09 | `POST /products/:id/restore` | S/A | Restore from archive |
| PRD-10 | `POST /products/:id/duplicate` | S/A | Duplicate product |
| PRD-11 | `DELETE /products/:id` | S/A | Permanent delete (drafts only) |
| PRD-12 | `GET /products/:id/completeness` | S/A | Completeness score |
| PRD-13 | `POST /products/bulk/publish` | S/A | Bulk publish (≤ 50) |
| PRD-14 | `POST /products/bulk/unpublish` | S/A | Bulk unpublish (≤ 50) |
| PRD-15 | `POST /products/bulk/archive` | S/A | Bulk archive (≤ 50, per-product reason) |
| PRD-16 | `POST /products/bulk/featured` | S/A | Bulk featured toggle (≤ 50) |
| PRD-17 | `POST /products/bulk/update` | S/A | Bulk category/price/tags update (≤ 100) |
| PRD-18 | `GET /products/:id/media` | P/S/A | Product media list |
| PRD-19 | `POST /products/:id/media` | S/A | Attach uploaded media |
| PRD-20 | `DELETE /products/:id/media/:mediaId` | S/A | Detach media |

**Shared product validation (quoted from BSS §8.5, binding):** `name` 1–300 no HTML; `slug` auto, unique (409 `PRODUCT_SLUG_DUPLICATE`); `categoryId` valid + active (400 `PRODUCT_CATEGORY_INVALID`); `basePrice` positive DECIMAL(10,2) (400 `PRODUCT_PRICE_INVALID`); `gender` `men|women|unisex`; `tags` ≤ 10 × ≤ 50 chars; `meta` JSONB `{material, care[], origin}` only; publish requires name + category + price + description (10–5000) + ≥ 1 image + ≥ 1 active variant + unique slug (`PUBLISH_*` codes); draft requires name only. Media JPEG/PNG/WebP/GIF ≤ 10MB, 400×400–4000×4000, alt ≤ 125 required on publish, checksum dedupe, max 8 images + 2 videos. Featured ≤ 20, trending ≤ 12, `isNew` clears after 14 days. Cache TTLs: detail 5 min (invalidate on update), list 2 min, filter counts 5 min. Budgets: list < 200ms, detail < 100ms, admin list < 300ms.

`GET /products` — **PRD-01 · Product list (public)**
- **Purpose:** browse published products with filters `categoryId`, `collectionId`, `gender`, `minPrice`, `maxPrice`, `tags`, `inStock`, `isFeatured`, `isNew`, `sort` (allowlist: `featured|relevance|newest|price_asc|price_desc|best selling|rating`), pagination.
- **Access:** P · rate 60/min.
- **Success 200:** `data: [{ id, slug, name, basePrice, salePrice?, images, rating, availableStock (band), status: "published" }]` + meta.
- **Errors:** 400 `INVALID_SORT`, `INVALID_FILTER`.
- **Validation:** published-only visibility; availability from S09 truth.
- **Events:** cache invalidation consumed (`product.published`/`product.archived`).
- **Performance:** KV list cache 2 min; p95 < 200ms; pagination 24/max 100.

`GET /products/by-slug/:slug` — **PRD-02 · Product detail (public, by slug)**
- **Purpose:** public detail for SEO URL `/product/{slug}` (CC-13); published products only.
- **Access:** P.
- **Success 200:** full public payload: name, description (sanitized), images, variants (active), price + sale price, rating aggregate, availability bands per variant, meta `{material, care[], origin}`, category breadcrumb.
- **Errors:** 404 `PRODUCT_NOT_FOUND` · 410 `PRODUCT_INACTIVE` (surfaced as 404-equivalent for SEO: unpublished → 404).
- **Performance:** KV detail cache 5 min, event-invalidated; p95 < 100ms.

`GET /products/:id` — **PRD-03 · Product detail (role-scoped)**
- **Purpose:** public published view (same as by-slug); shop owner sees own products in any state; admin sees all states.
- **Access:** P (published) / S (own, all states) / A (all).
- **Success 200:** state-dependent `status: draft|scheduled|published|archived`.
- **Errors:** 404 (hidden for non-owners of drafts).
- **Performance:** cache per role segment; detail < 100ms.

`POST /products` — **PRD-04 · Create product**
- **Purpose:** create draft (name only required — CC-10).
- **Access:** S (own shop) / A · key required.
- **Request:** `{ name, slug?, categoryId?, gender?, basePrice?, description?, tags?, meta?, mediaIds? }`.
- **Success 201:** `data: { product, status: "draft" }`.
- **Errors:** 400 `PRODUCT_CATEGORY_INVALID`, `PRODUCT_PRICE_INVALID` · 409 `PRODUCT_SLUG_DUPLICATE`.
- **Events:** `product.created`.
- **Performance:** < 300ms; slug uniqueness indexed.

`PATCH /products/:id` — **PRD-05 · Update product**
- **Purpose:** partial update; ownership `product.sellerId === user.id` enforced (BSS §8.5).
- **Access:** S (own) / A · key + CSRF.
- **Request:** subset of product fields.
- **Success 200.**
- **Errors:** 409 `PRODUCT_SLUG_DUPLICATE` · 400 price/category codes.
- **Events:** `product.updated` (cache invalidation; search reindex < 2s).
- **Performance:** event-driven invalidation of KV detail cache.

`POST /products/:id/publish` — **PRD-06 · Publish**
- **Purpose:** run the publish gate (T9): status change + search-index event + cache-invalidation event + history, one atomic unit (BSS §6.1 T9). Scheduled publish: `PATCH /products/:id` with `scheduledAt` → cron at trigger re-validates; failure → draft + admin email.
- **Access:** S (own) / A.
- **Request:** `{ scheduledAt? }`.
- **Success 200:** `data: { status: "published"|"scheduled" }`.
- **Errors:** 400 `PUBLISH_NO_STOCK`, `PUBLISH_MISSING_IMAGE`, `PUBLISH_MISSING_DESCRIPTION`, `PUBLISH_NO_ACTIVE_VARIANT`, `PUBLISH_SLUG_REQUIRED` · 409 `PRODUCT_SLUG_DUPLICATE`.
- **Events:** `product.published` (consumers: Search, Cache, Notifications, Collections).
- **Performance:** atomic; search index < 2s per change.

`POST /products/:id/unpublish` — **PRD-07 · Unpublish**
- **Access:** S (own) / A.
- **Success 200.**
- **Events:** `product.unpublished` (search + cache invalidation).

`POST /products/:id/archive` — **PRD-08 · Archive**
- **Purpose:** archive with required reason; soft state (restorable).
- **Access:** S (own) / A.
- **Request:** `{ reason }`.
- **Success 200.**
- **Events:** `product.archived` (search removal, collection recompute).

`POST /products/:id/restore` — **PRD-09 · Restore**
- **Purpose:** restore archived product to prior state within 7-day recovery window.
- **Access:** S (own) / A.
- **Success 200.**
- **Events:** `product.restored`.

`POST /products/:id/duplicate` — **PRD-10 · Duplicate**
- **Purpose:** deep copy (fields, variants, media refs) with fresh slug/SKUs.
- **Access:** S (own) / A · key.
- **Success 201:** `data: { product, sourceId }`.
- **Performance:** background for large variant sets; job id returned when async.

`DELETE /products/:id` — **PRD-11 · Permanent delete**
- **Purpose:** permanent delete **drafts only**; double confirmation + admin approval; ≤ 100/batch, retention check (BSS §13.2).
- **Access:** S (own, own drafts) / A · key.
- **Request:** `{ confirmation: true }`.
- **Success 204.**
- **Errors:** 409 (not a draft) · 422 (missing confirmation).
- **Events:** `product.deleted` (search removal).
- **Security:** permanent-delete register (≤ 100 records, admin approval).

`GET /products/:id/completeness` — **PRD-12 · Completeness score**
- **Purpose:** read completeness score (weights 15/10/10/15/15/15/5/5/5/5 per BSS §8.5) with missing-requirements list.
- **Access:** S (own) / A.
- **Success 200:** `data: { score, missing: [..] }`.
- **Performance:** computed on read; < 200ms.

`POST /products/bulk/publish` — **PRD-13 · Bulk publish**
- **Purpose:** publish ≤ 50 products per batch; ≤ 3 bulk ops/min; 5-min undo window; per-item validation with partial-success result.
- **Access:** S (own) / A · key.
- **Request:** `{ items: [{ id, scheduledAt? }] }`.
- **Success 202:** `data: { jobId }` or 200 `BulkOperationResult`.
- **Errors:** 429 (bulk ceiling) · partial failures in body (`BULK_OPERATION_PARTIAL_SUCCESS` 200).
- **Events:** `product.published` per item.
- **Performance:** background job; publish timeout 5 min.

`POST /products/bulk/unpublish` — **PRD-14 · Bulk unpublish**
- **Access:** S (own) / A.
- **Request:** `{ items: [{ id }] }`.
- **Success 202/200** as PRD-13.
- **Events:** `product.unpublished`.

`POST /products/bulk/archive` — **PRD-15 · Bulk archive**
- **Purpose:** archive ≤ 50; **per-product reason required**.
- **Access:** S (own) / A.
- **Request:** `{ items: [{ id, reason }] }`.
- **Success 202.**
- **Events:** `product.archived`.

`POST /products/bulk/featured` — **PRD-16 · Bulk featured toggle**
- **Purpose:** toggle featured ≤ 50; caps enforced (featured ≤ 20) — items beyond cap fail per-item.
- **Access:** S (own) / A.
- **Success 202.**
- **Events:** `product.updated`.

`POST /products/bulk/update` — **PRD-17 · Bulk update (category/price/tags)**
- **Purpose:** ≤ 100 items; fields `categoryId | basePrice | tags` (one field per request).
- **Access:** S (own) / A.
- **Request:** `{ field: "categoryId"|"basePrice"|"tags", value, items: [ids] }`.
- **Success 202.**
- **Errors:** per-item codes; partial success contract.
- **Events:** `product.updated` per item.
- **Performance:** delete timeout 3 min; background.

`GET /products/:id/media` — **PRD-18 · Product media**
- **Purpose:** list media (images/videos) with role-scoped URLs (draft = private URLs; published = public CDN).
- **Access:** P (published) / S (own) / A.
- **Success 200:** `data: [{ mediaId, kind, url, alt, position }]`.
- **Performance:** CDN URL cache 24h.

`POST /products/:id/media` — **PRD-19 · Attach media**
- **Purpose:** register completed uploads to the product (max 8 images + 2 videos); media record from S30.
- **Access:** S (own) / A · key.
- **Request:** `{ mediaIds: [uuid], alt? }` — alt ≤ 125 required at publish.
- **Success 201.**
- **Errors:** 409 `MEDIA_DUPLICATE_DETECTED` · 422 `MEDIA_TYPE_INVALID`.
- **Events:** `product.updated` (draft-state only; publish gate counts media).
- **Performance:** no image processing in request path (async pipeline: presign → WebP/AVIF → 400/600/800/1200w → thumbnail → blur-up → EXIF strip).

`DELETE /products/:id/media/:mediaId` — **PRD-20 · Detach media**
- **Access:** S (own) / A.
- **Success 204.**
- **Events:** `storage.media.deleted` cascade (soft).

---

## 7.6 Categories (S06 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| CAT-01 | `GET /categories` | P | Public category tree |
| CAT-02 | `GET /categories/:id` | P | Category detail + products |
| CAT-03 | `POST /categories` | A | Create category |
| CAT-04 | `PATCH /categories/:id` | A | Update category |
| CAT-05 | `POST /categories/:id/move` | A | Move under parent |
| CAT-06 | `POST /categories/reorder` | A | Reorder siblings |
| CAT-07 | `POST /categories/:id/activate` | A | Activate/hide |
| CAT-08 | `POST /categories/:id/deactivate` | A | Deactivate (soft) |
| CAT-09 | `DELETE /categories/:id` | A | Archive category (products reassigned first) |

**Shared validation (BSS §8.6):** `name` ≤ 100; `slug` unique lowercase/hyphen, immutable (301 preserved on change of ancestors); depth ≤ 5 absolute; inactive parent hides all children; archived category → products `categoryId` null + 301 to parent; tree cache KV TTL 1h.

`GET /categories` — **CAT-01 · Category tree**
- **Purpose:** full active tree (public storefront navigation, sitemap data).
- **Access:** P.
- **Success 200:** nested tree with product counts (filter counts cache 5 min).
- **Performance:** KV tree cache 1h, invalidated on category change; < 200ms.

`GET /categories/:id` — **CAT-02 · Category detail + products**
- **Purpose:** landing data: category + child tree + paginated products (filters/sort as PRD-01 scoped to category).
- **Access:** P.
- **Success 200:** `data: { category, children, products }` + pagination.
- **Errors:** 404 · 410 `CATEGORY_INACTIVE`.
- **Performance:** landing pages 24/page; < 200ms.

`POST /categories` — **CAT-03 · Create category (admin)**
- **Purpose:** create category node.
- **Access:** A (shop owners: No — BSS §8.6).
- **Request:** `{ name, slug?, parentId?, genderDefault?, sortDefault?, displayStyle?, meta? }`.
- **Success 201.**
- **Errors:** 409 `CATEGORY_SLUG_DUPLICATE` · 422 `CATEGORY_DEPTH_EXCEEDED`.
- **Events:** `category.created` (reg.).
- **Performance:** tree cache invalidation.

`PATCH /categories/:id` — **CAT-04 · Update category**
- **Access:** A.
- **Success 200.**
- **Errors:** 409 `CATEGORY_SLUG_DUPLICATE`.
- **Events:** `category.updated` (tree invalidation; product-tree consumers react).

`POST /categories/:id/move` — **CAT-05 · Move category**
- **Purpose:** change parent (depth ≤ 5 enforced; subtree moves).
- **Access:** A.
- **Request:** `{ parentId | null }`.
- **Success 200.**
- **Errors:** 422 `CATEGORY_DEPTH_EXCEEDED`.
- **Events:** `category.updated`; 301 rewrites for affected slugs (SEO).

`POST /categories/reorder` — **CAT-06 · Reorder siblings**
- **Request:** `{ parentId, orderedIds: [..] }`.
- **Access:** A.
- **Success 200.**
- **Events:** `category.updated`.

`POST /categories/:id/activate` — **CAT-07 · Activate**
- **Purpose:** set `isActive = true` (children visibility follows).
- **Access:** A.
- **Success 200.**
- **Events:** `category.updated`.

`POST /categories/:id/deactivate` — **CAT-08 · Deactivate**
- **Purpose:** soft deactivate (never hard delete — BSS §8.6); hides children; products become hidden (categoryId nulled on archive only).
- **Access:** A.
- **Success 200.**
- **Events:** `category.deactivated` (reg.).

`DELETE /categories/:id` — **CAT-09 · Archive category**
- **Purpose:** archive; requires all products reassigned first (400 otherwise).
- **Access:** A.
- **Success 204.**
- **Errors:** 400 (products still assigned).
- **Events:** `category.updated` + product reassignment events.

---

## 7.7 Collections (S07 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| COL-01 | `GET /collections` | P | Public collection list (active/scheduled) |
| COL-02 | `GET /collections/:id` | P | Collection detail + products |
| COL-03 | `POST /collections` | A | Create collection |
| COL-04 | `PATCH /collections/:id` | A | Update collection |
| COL-05 | `POST /collections/:id/publish` | A | Publish (scheduled window) |
| COL-06 | `POST /collections/:id/archive` | A | Archive (301 to parent) |
| COL-07 | `POST /collections/:id/members` | A | Add members (manual) |
| COL-08 | `DELETE /collections/:id/members` | A | Remove members |
| COL-09 | `POST /collections/:id/members/reorder` | A | Manual sort order |

**Shared validation (BSS §8.7):** slug unique lowercase/hyphen; rules JSON against operator whitelist (`category`, `brand`, `price`, `gender`, `tags`, `created_at`, `is_featured`, `stock`, `total_sold` with `equals|in|gte|lte|between|contains|gt`); max 500 products/collection (soft, guidance ≤ 50); max 6 featured collections; promotional collections require `endsAt`; visibility `active|inactive|scheduled|expired`; products cache 5 min.

`GET /collections` — **COL-01 · Collection list**
- **Purpose:** active + scheduled (visible) collections for storefront.
- **Access:** P.
- **Success 200.**
- **Performance:** products cache 5 min; < 200ms.

`GET /collections/:id` — **COL-02 · Collection detail + products**
- **Purpose:** collection metadata + paginated product membership (manual order preserved; dynamic recomputed on events).
- **Access:** P.
- **Success 200.**
- **Errors:** 404 · 410 `COLLECTION_LIMIT_EXCEEDED`-adjacent (expired → 410 `COLLECTION_INACTIVE`).
- **Performance:** KV products cache 5 min, invalidated on collection change.

`POST /collections` — **COL-03 · Create collection (admin)**
- **Purpose:** create manual/dynamic collection.
- **Access:** A.
- **Request:** `{ name, slug?, type: "manual"|"dynamic"|"smart", rules?, startsAt?, endsAt?, isFeatured? }`.
- **Success 201.**
- **Errors:** 422 `COLLECTION_RULE_INVALID` · 409 `COLLECTION_LIMIT_EXCEEDED` (featured > 6).
- **Events:** `collection.published`/`collection.updated` (reg.).
- **Performance:** dynamic membership computed on event, never at request time.

`PATCH /collections/:id` — **COL-04 · Update collection**
- **Purpose:** update metadata/rules/window. `type` immutable after creation.
- **Access:** A.
- **Success 200.**
- **Errors:** 422 `COLLECTION_RULE_INVALID` · 409 (immutable type).
- **Events:** `collection.updated` (reg.).

`POST /collections/:id/publish` — **COL-05 · Publish**
- **Purpose:** activate now or per window (`scheduled` until `startsAt`, auto-deactivate at `endsAt` via cron).
- **Access:** A.
- **Success 200.**
- **Events:** `collection.published` (reg.); homepage data-source refresh.

`POST /collections/:id/archive` — **COL-06 · Archive**
- **Purpose:** soft archive; storefront redirects 301 to parent.
- **Access:** A.
- **Success 200.**
- **Events:** `collection.archived` (reg.).

`POST /collections/:id/members` — **COL-07 · Add members**
- **Purpose:** manual membership add (array ≤ 100 per request; `@@unique([productId, collectionId])`).
- **Access:** A.
- **Request:** `{ productIds: [uuid] }`.
- **Success 200:** `BulkOperationResult`.
- **Errors:** 409 `DUPLICATE_MEMBERSHIP` (per-item) · 422 inactive product.
- **Events:** audit per product membership change.

`DELETE /collections/:id/members` — **COL-08 · Remove members**
- **Request:** `{ productIds: [uuid] }`.
- **Access:** A.
- **Success 200.**
- **Events:** audit per product.

`POST /collections/:id/members/reorder` — **COL-09 · Reorder members**
- **Purpose:** manual sort order for manual collections.
- **Request:** `{ orderedIds: [uuid] }`.
- **Access:** A.
- **Success 200.**
- **Events:** `collection.updated`.

---

## 7.8 Variants (S08 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| VAR-01 | `GET /products/:productId/variants` | P (published parent) | Variant list for product |
| VAR-02 | `GET /variants/:id` | P/C/S/A | Variant detail |
| VAR-03 | `POST /products/:productId/variants` | S/A | Create variant |
| VAR-04 | `POST /products/:productId/variants/generate` | S/A | Generate combination matrix |
| VAR-05 | `POST /variants/bulk` | S/A | Bulk variant create/update (≤ 100) |
| VAR-06 | `PATCH /variants/:id` | S/A | Update variant (SKU immutable) |
| VAR-07 | `POST /variants/:id/deactivate` | S/A | Soft-deactivate variant |
| VAR-08 | `GET /variants/by-sku/:sku` | C/S/A/I | SKU lookup (cart/order snapshot) |
| VAR-09 | `GET /attribute-types` | A | Global attribute types |
| VAR-10 | `POST /attribute-types` | A | Create attribute type |
| VAR-11 | `PATCH /attribute-types/:id` | A | Update attribute type |
| VAR-12 | `GET /attribute-types/:id/values` | A | Attribute values |
| VAR-13 | `POST /attribute-types/:id/values` | A | Add attribute value |
| VAR-14 | `PATCH /attribute-values/:id` | A | Update attribute value |
| VAR-15 | `POST /attribute-types/:id/deactivate` | A | Deactivate attribute type |

**Shared validation (BSS §8.8):** SKU 1–50 alphanumeric+hyphen, globally unique, **immutable — no update, no delete**; display `{PRODUCT}-{ATTRIBUTES}`; internal `NB-{UUID-SUFFIX}`; barcode EAN-13/UPC; `attributeValues` ≥ 1 (`VARIANT_ATTRIBUTES_REQUIRED`); duplicate combination 409; price = `variant.price ?? product.basePrice`, sale priority Variant > Product > Regular, `SALE_PRICE_INVALID`; dataType per attribute (color `#RRGGBB`, select/multi_select valueId, text ≤ 100, number, boolean); ≤ 5 types, ≤ 20 values/type recommended; soft-delete only; search indexes published variants only.

`GET /products/:productId/variants` — **VAR-01 · Variant list**
- **Purpose:** variants of a product (public: active only, with availability bands; owner/admin: all incl. inactive, stock).
- **Access:** P (published parent) / S (own) / A.
- **Success 200:** `data: [{ id, sku, attributes, price, salePrice, stockBand, isActive }]`.
- **Performance:** variant list < 200ms; stock via S09 read (< 50ms) batched.

`GET /variants/:id` — **VAR-02 · Variant detail**
- **Access:** P/C/S/A (role-scoped fields).
- **Success 200.**
- **Errors:** 404 `VARIANT_NOT_FOUND`.
- **Performance:** < 100ms cached.

`POST /products/:productId/variants` — **VAR-03 · Create variant**
- **Purpose:** single variant create (SKU assign atomic; combination uniqueness).
- **Access:** S (own) / A · key.
- **Request:** `{ sku, attributeValues: [{ attributeTypeId, valueId|value }], price?, salePrice?, barcode? }`.
- **Success 201.**
- **Errors:** 409 `VARIANT_SKU_DUPLICATE`, `VARIANT_DUPLICATE_COMBINATION` · 400 `SKU_INVALID_FORMAT`, `SKU_INVALID_LENGTH`, `VARIANT_ATTRIBUTES_REQUIRED`, `VARIANT_PRICE_INVALID`, `SALE_PRICE_INVALID`.
- **Events:** `variant.created` (Inventory + Search consume).
- **Performance:** atomic; < 300ms.

`POST /products/:productId/variants/generate` — **VAR-04 · Generate combinations**
- **Purpose:** generate full combination matrix from selected attribute types/values (bulk job, per-item validation, partial success).
- **Access:** S (own) / A · key.
- **Request:** `{ attributeTypes: [{ attributeTypeId, valueIds: [..] }] }`.
- **Success 202:** `data: { jobId, estimatedCount }`.
- **Errors:** 422 `VARIANT_ATTRIBUTES_REQUIRED` · warn > 100 combinations (per-item cap).
- **Events:** `variant.created` per generated variant.
- **Performance:** background job; heavy ops off the request path.

`POST /variants/bulk` — **VAR-05 · Bulk variants**
- **Purpose:** ≤ 100 variant creates/updates with per-item validation.
- **Access:** S (own) / A · key.
- **Success 202/200** `BulkOperationResult`.
- **Events:** `variant.created`/`variant.updated` per item.

`PATCH /variants/:id` — **VAR-06 · Update variant**
- **Purpose:** update price/salePrice/attributes/barcode/stock-adjacent flags. **SKU field rejected** (immutable contract — carts/orders snapshot SKUs; mutation is a defect, BSS §8.8).
- **Access:** S (own) / A.
- **Success 200.**
- **Errors:** 400 `VARIANT_PRICE_INVALID` · 409 (SKU attempted → 409 `SKU_IMMUTABLE`).
- **Events:** `variant.updated` (cart/order SKU snapshots unaffected; search reindex).

`POST /variants/:id/deactivate` — **VAR-07 · Deactivate**
- **Purpose:** soft-deactivate (inventory history preserved; soft-delete only — CC-19).
- **Access:** S (own) / A.
- **Request:** `{ reason? }`.
- **Success 200.**
- **Events:** `variant.deactivated` (payload `variantId, productId` → Inventory, Search).

`GET /variants/by-sku/:sku` — **VAR-08 · SKU lookup**
- **Purpose:** resolve SKU → variant (internal snapshot reads for carts/orders; public for display SKU).
- **Access:** C/S/A/I.
- **Success 200:** `data: { id, sku, productId, price, isActive, stockBand }`.
- **Errors:** 404 `VARIANT_NOT_FOUND`.
- **Performance:** SKU-indexed read; < 100ms.

`GET /attribute-types` — **VAR-09 · Attribute types (admin)**
- **Purpose:** global attribute system (platform-global, admin-defined — CC-01).
- **Access:** A.
- **Success 200.**
- **Performance:** cached 10 min.

`POST /attribute-types` — **VAR-10 · Create attribute type**
- **Purpose:** register type (`color|select|multi_select|text|number|boolean`).
- **Access:** A.
- **Request:** `{ name, dataType, options? }`.
- **Success 201.**
- **Errors:** 409 `ATTRIBUTE_TYPE_DUPLICATE`.
- **Events:** `attribute.type.updated` (variant validation consumers).

`PATCH /attribute-types/:id` — **VAR-11 · Update type**
- **Access:** A.
- **Success 200.**
- **Errors:** 404 `ATTRIBUTE_TYPE_NOT_FOUND`.

`GET /attribute-types/:id/values` — **VAR-12 · Values**
- **Access:** A.
- **Success 200.**

`POST /attribute-types/:id/values` — **VAR-13 · Add value**
- **Access:** A.
- **Request:** `{ value, label?, colorHex? }`.
- **Success 201.**
- **Errors:** 409 `ATTRIBUTE_TYPE_DUPLICATE` (dup value).
- **Events:** `attribute.value.created`.

`PATCH /attribute-values/:id` — **VAR-14 · Update value**
- **Access:** A.
- **Success 200.**
- **Errors:** 410 `ATTRIBUTE_VALUE_INACTIVE`.

`POST /attribute-types/:id/deactivate` — **VAR-15 · Deactivate type**
- **Purpose:** soft-deactivate (existing variants retain values; no new assignments).
- **Access:** A.
- **Success 200.**
- **Events:** `attribute.type.deactivated`.

---

## 7.9 Inventory (S09 · T0)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| INV-01 | `GET /inventory/availability?variantIds=` | P/I | Availability bands (public) |
| INV-02 | `GET /inventory/variants/:id` | S/A/I | Stock detail (role-scoped) |
| INV-03 | `POST /inventory/variants/:id/add` | S/A | Add stock |
| INV-04 | `POST /inventory/variants/:id/reduce` | S/A | Reduce stock |
| INV-05 | `POST /inventory/variants/:id/adjust` | A | Absolute adjust (reason; optional 2nd approval) |
| INV-06 | `POST /inventory/bulk` | S/A | Bulk update (≤ 100 variants, < 5s) |
| INV-07 | `GET /inventory/movements` | S/A | Movement ledger (append-only) |
| INV-08 | `GET /inventory/low-stock` | S/A | Low-stock list |

**Canonical truth (BSS §8.9, CC-07):** `availableStock = stock − reservedStock`, computed never stored. Public API exposes **bands only** (`in_stock | low_stock | last_few | out_of_stock | discontinued`, threshold default 10); numeric stock is owner/admin-only. Reservation/release are internal module APIs (T1) — never exposed to clients; they occur at checkout payment initiation with 15-min timeout.

`GET /inventory/availability` — **INV-01 · Availability**
- **Purpose:** batch availability bands for published variants (`variantIds` comma-separated, ≤ 50 per request).
- **Access:** P · rate 60/min.
- **Success 200:** `data: { variants: [{ variantId, band, availableStock? }] }` — numeric availableStock only for authenticated owner/admin of the product.
- **Errors:** 400 `INVALID_FILTER`.
- **Performance:** **stock check < 50ms** (PK + cache); batch call.

`GET /inventory/variants/:id` — **INV-02 · Stock detail**
- **Purpose:** numeric stock view for shop owner (own) / admin: `{ stock, reservedStock, availableStock, statusBand, updatedAt }`.
- **Access:** S (own) / A / I.
- **Errors:** 404 (hidden for other shops).
- **Performance:** < 50ms; KV-cached with short TTL, event-invalidated.

`POST /inventory/variants/:id/add` — **INV-03 · Add stock**
- **Purpose:** stock add (positive quantity; movement type `STOCK_ADD`).
- **Access:** S (own) / A · key.
- **Request:** `{ quantity, note? }`.
- **Success 200:** `data: { stock, reservedStock, availableStock }`.
- **Errors:** 400 `STOCK_CANNOT_BE_NEGATIVE`.
- **Events:** `stock.changed` (search stock_status update; back-in-stock notifications if band improves).
- **Performance:** atomic conditional update; movement row in same transaction.

`POST /inventory/variants/:id/reduce` — **INV-04 · Reduce stock**
- **Purpose:** manual reduction; cannot go below `reservedStock`.
- **Access:** S (own) / A.
- **Request:** `{ quantity, note?, reason? }`.
- **Success 200.**
- **Errors:** 400 `STOCK_CANNOT_BE_NEGATIVE`, `RESERVED_EXCEEDS_STOCK`.
- **Events:** `stock.changed` (movement `STOCK_REDUCE`).
- **Performance:** atomic; DB constraint `reservedStock <= stock`.

`POST /inventory/variants/:id/adjust` — **INV-05 · Absolute adjust**
- **Purpose:** set absolute stock value; **reason required**; optional second admin approval per policy (BSS §13.2); sets `>= reservedStock`.
- **Access:** A (shop owner may view/update own, **not** adjust/audit/bulk — BSS §8.9).
- **Request:** `{ value, reason, secondApproval? }`.
- **Success 200:** `data: { stock, reservedStock, availableStock }`.
- **Errors:** 400 `RESERVED_EXCEEDS_STOCK` · 422 missing reason.
- **Events:** `stock.adjusted` (reg.); movement `STOCK_ADJUST` with old/new values audited.
- **Performance:** pessimistic lock; < 200ms.

`POST /inventory/bulk` — **INV-06 · Bulk update**
- **Purpose:** ≤ 100 variants `{ variantId, operation: add|reduce, quantity, note }` — background, < 5s, partial success.
- **Access:** S (own) / A · key.
- **Success 202/200** `BulkOperationResult`.
- **Events:** `stock.changed` per item.
- **Performance:** batched writes; < 5s per 100.

`GET /inventory/movements` — **INV-07 · Movement ledger**
- **Purpose:** append-only ledger (filters: `variantId`, `type` (`STOCK_ADD|STOCK_REDUCE|STOCK_RESERVE|STOCK_RELEASE|STOCK_ADJUST|ORDER_PLACE|ORDER_CANCEL|ORDER_SHIP|ORDER_RETURN|CHECKOUT_RESERVE|CHECKOUT_RELEASE|BULK_UPDATE|AUTO_ADJUST`), `from`, `to`, pagination).
- **Access:** S (own shop) / A.
- **Success 200:** `data: [{ id, variantId, sku, type, quantity, before, after, referenceId?, referenceType?, actor, reason?, createdAt }]`.
- **Performance:** append-only index; bounded queries; offset pagination.

`GET /inventory/low-stock` — **INV-08 · Low-stock list**
- **Purpose:** variants at/below threshold (default 10, config key `inventory.lowStockThreshold`) for the shop.
- **Access:** S (own) / A.
- **Success 200:** paginated.
- **Events:** hourly low-stock alert job feeds this list; back-in-stock notifications are T1 consumers of `stock.changed`.
- **Performance:** materialized summary refresh; < 300ms.

---

## 7.10 Search (S10 · T2)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| SCH-01 | `GET /search` | P | Product search (cursor, max 50) |
| SCH-02 | `GET /search/autocomplete` | P | Autocomplete suggestions |
| SCH-03 | `GET /search/recommendations` | P/C | Recommendations (similar/bought-together/trending/personalized) |

**Canonical rules (BSS §8.10):** index-backed only (never product tables at request time); `q` ≤ 200 chars, HTML/SQL stripped, parameterized `to_tsquery`; sort allowlist `featured|relevance|newest|price_asc|price_desc|best selling|rating`; filters whitelisted; OR within facet group, AND between groups; cursor pagination only; max 50 results; default 24; KV TTL autocomplete 5 min, results 1 min; rate limits search 100/min/IP, autocomplete 60/min/IP, recommendations 30/min/IP; no out-of-stock in recommendations; published content only; no personal data in the index.

`GET /search` — **SCH-01 · Search**
- **Purpose:** full-text product search with filters (`categoryId`, `gender`, `minPrice`, `maxPrice`, `tags`, `inStock`, `isFeatured`), facets, cursor.
- **Access:** P · rate 100/min/IP.
- **Request:** `q` (≤ 200), filters, `sort`, `cursor`, `limit` (≤ 50).
- **Success 200:** `data: [products]` + `meta: { nextCursor, hasMore, facets }`; zero results = empty `data`.
- **Errors:** 400 `INVALID_FILTER`, `INVALID_SORT` · 422 `SEARCH_QUERY_REQUIRED` (no `q`).
- **Validation:** filter whitelist; query sanitization.
- **Performance:** **< 200ms** p95; cache 1 min; cursor pagination; cache hit > 80%.

`GET /search/autocomplete` — **SCH-02 · Autocomplete**
- **Purpose:** suggestions (min 2 chars, 300ms client debounce): products ≤ 5 + categories ≤ 3 + suggestion phrases ≤ 5.
- **Access:** P · rate 60/min/IP.
- **Success 200:** `data: { suggestions: [], products: [], categories: [] }`.
- **Errors:** 422 `SEARCH_QUERY_REQUIRED` (< 2 chars → empty result, not error).
- **Performance:** **< 100ms**; cache 5 min; KV edge.

`GET /search/recommendations` — **SCH-03 · Recommendations**
- **Purpose:** `?type=similar|boughtTogether|trending|personalized` + `productId`/`userId` context. Never recommends out-of-stock.
- **Access:** P (similar/boughtTogether/trending) · C (personalized).
- **Success 200:** `data: [products]` — similar ≤ 6, bought-together ≤ 4, trending ≤ 8, personalized ≤ 8.
- **Errors:** 404 `PRODUCT_NOT_FOUND` (similar context).
- **Performance:** **< 100ms**; cold start < 500ms with popularity fallback; rate 30/min/IP.

---

## 7.11 Cart (S11 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| CRT-01 | `GET /cart` | P (guest token)/C | Read cart |
| CRT-02 | `POST /cart/items` | P/C | Add item |
| CRT-03 | `PATCH /cart/items/:id` | P/C | Update quantity |
| CRT-04 | `DELETE /cart/items/:id` | P/C | Remove item |
| CRT-05 | `DELETE /cart` | P/C | Clear cart |
| CRT-06 | `POST /cart/validate` | P/C | Revalidate price/stock/availability |
| CRT-07 | `GET /cart/count` | P/C | Badge count (fresh) |

**Canonical rules (BSS §8.11, SC §5.4):** cart = **no cache, always fresh** (client cache is never authoritative); guest via httpOnly `nabome_guest` cookie (random UUID); quantity `int 1–10` (or stock limit); max **50 unique items**; INR only, price > ₹0, totals server-computed; availability checks at validation (product active, variant active, `availableStock > 0`, `availableStock ≥ quantity`, not discontinued); **cart never cleared on error**; merge on login (T13, event-driven): duplicates sum capped at stock, inactive/out-of-stock skipped, current price adopted; coupon attempts rate-limited 10/min; no admin access to customer carts (privacy); audit add/remove with userId/guestToken; TTLs: guest 7 days, customer 90 days (cleanup job daily).

`GET /cart` — **CRT-01 · Read cart**
- **Purpose:** full cart state: lines (variant, name, image, SKU, unit price, sale price, quantity, line total, stock band), totals (subtotal, discounts, shipping?, gst, total), validation flags (`priceChanged`, `outOfStock`), coupon.
- **Access:** P (guest cookie) / C.
- **Success 200:** `data: { id, lines: [], totals: { subtotal, discount, gst, total }, flags: {}, coupon? }` — empty cart = `lines: []` with zero totals, never an error.
- **Errors:** none beyond universal.
- **Performance:** no cache; fresh read; 500ms client debounce on quantity; < 200ms.

`POST /cart/items` — **CRT-02 · Add item**
- **Purpose:** add variant to cart (`variantId` UUID, `quantity` 1–10); server re-validates availability and price.
- **Access:** P/C · key.
- **Request:** `{ variantId, quantity }`.
- **Success 201:** updated cart (full shape).
- **Errors:** 422 `ITEM_OUT_OF_STOCK`, `INSUFFICIENT_STOCK` (cart context — canonical deviation retained, BSS §8.11), `PRICE_CHANGED` · 400 `CART_EMPTY`-adjacent caps → 422 `CART_LIMIT_EXCEEDED` (50 items).
- **Events:** `cart.updated` (reg.).
- **Performance:** availability read via S09 (< 50ms hop); product price cache 5 min; < 200ms.

`PATCH /cart/items/:id` — **CRT-03 · Update quantity**
- **Purpose:** set quantity 1–10 (or stock limit); server re-checks availability.
- **Access:** P/C · key.
- **Request:** `{ quantity }`.
- **Success 200:** updated cart.
- **Errors:** 422 `INSUFFICIENT_STOCK`, `ITEM_OUT_OF_STOCK` · 404 (hidden).
- **Events:** `cart.updated`.

`DELETE /cart/items/:id` — **CRT-04 · Remove item**
- **Access:** P/C · key.
- **Success 204.**
- **Events:** `cart.updated`.

`DELETE /cart` — **CRT-05 · Clear cart**
- **Access:** P/C · key.
- **Success 204.**
- **Events:** `cart.updated`.

`POST /cart/validate` — **CRT-06 · Revalidate**
- **Purpose:** explicit revalidation entry (checkout pre-validation): price changes, stock changes, coupon expiry, discontinuation — returns flags; **never modifies cart** (client applies changes via PATCH).
- **Access:** P/C · rate 60/min.
- **Success 200:** `data: { valid: bool, flags: [{ lineId, kind: "price_changed"|"out_of_stock"|"inactive"|"coupon_expired", details }] }`.
- **Performance:** stock read < 50ms per variant (batched); coupon = no cache.

`GET /cart/count` — **CRT-07 · Badge count**
- **Purpose:** fresh item-count for the header badge.
- **Access:** P/C.
- **Success 200:** `data: { count, subtotal }`.
- **Performance:** always fresh; no cache; < 100ms.

---

## 7.12 Wishlist (S12 · T2)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| WSH-01 | `GET /wishlist` | C | Read wishlist |
| WSH-02 | `POST /wishlist/items` | C | Toggle add item |
| WSH-03 | `DELETE /wishlist/items/:id` | C | Remove item |
| WSH-04 | `POST /wishlist/items/:id/move-to-cart` | C | Move to cart |
| WSH-05 | `DELETE /wishlist` | C | Clear wishlist |
| WSH-06 | `GET /wishlist/shared/:shareToken` | P | Shared wishlist view (no PII) |

**Canonical rules (BSS §8.12):** `@@unique([profileId, variantId])` — duplicate add is a toggle, not an error; guest wishlist = localStorage (client-side, max 50 items, login prompt) — no server endpoint for guest wishlist; price-drop/back-in-stock tracking opt-in (preferences in S03); share links expose item names + images only; cache TTL 5 min, invalidated on add/remove.

`GET /wishlist` — **WSH-01 · Read wishlist**
- **Purpose:** items with current price + price-change highlight, availability, in-cart marker.
- **Access:** C.
- **Success 200:** `data: [ { id, variantId, productId, name, image, price, salePrice, priceDropped, inStock, inCart } ]`.
- **Performance:** cache 5 min, invalidated on add/remove; price deltas on load.

`POST /wishlist/items` — **WSH-02 · Toggle add**
- **Purpose:** add item; duplicate → toggle-remove (200 with `removed: true`).
- **Access:** C · key.
- **Request:** `{ variantId }`.
- **Success 201/200:** `data: { added: true|false, item? }`.
- **Errors:** 404 `VARIANT_NOT_FOUND` (inactive).
- **Events:** `wishlist.added` / `wishlist.removed` (reg.); notifications engine compares price/stock on `product.updated`/`stock.changed` for opt-in alerts.
- **Performance:** atomic toggle; cache invalidate.

`DELETE /wishlist/items/:id` — **WSH-03 · Remove**
- **Access:** C.
- **Success 204.**
- **Events:** `wishlist.removed`.

`POST /wishlist/items/:id/move-to-cart` — **WSH-04 · Move to cart**
- **Purpose:** call into cart add (S11) + remove from wishlist; stock check first.
- **Access:** C · key.
- **Success 200:** `data: { cart, wishlistItemRemoved: true }`.
- **Errors:** 422 `INSUFFICIENT_STOCK` (cart context) — item stays in wishlist.
- **Performance:** two owner transactions ordered by user event.

`DELETE /wishlist` — **WSH-05 · Clear**
- **Access:** C.
- **Success 204.**
- **Events:** `wishlist.removed` per item.

`GET /wishlist/shared/:shareToken` — **WSH-06 · Shared view**
- **Purpose:** public share page data — **item names + images only, no personal info, no prices?** (prices permitted; no PII — BSS §8.12 security).
- **Access:** P.
- **Success 200:** `data: { title, items: [{ name, image, url }] }`.
- **Errors:** 404 `WISHLIST_SHARE_NOT_FOUND` (expired/invalid token).
- **Performance:** cache 5 min.

---

## 7.13 Checkout (S13 · T0)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| COT-01 | `POST /checkout/sessions` | P/C | Create checkout session (stage 1) |
| COT-02 | `GET /checkout/sessions/:id` | P/C | Read session state + stage |
| COT-03 | `POST /checkout/sessions/:id/address` | P/C | Set address (stage 2) |
| COT-04 | `GET /checkout/sessions/:id/shipping-methods` | P/C | Available shipping methods + rates |
| COT-05 | `POST /checkout/sessions/:id/shipping` | P/C | Select shipping method (stage 3) |
| COT-06 | `POST /checkout/sessions/:id/coupon` | P/C | Apply coupon |
| COT-07 | `DELETE /checkout/sessions/:id/coupon` | P/C | Remove coupon |
| COT-08 | `POST /checkout/sessions/:id/payment` | P/C | Initiate payment (stage 4 — reservation) |
| COT-09 | `POST /checkout/verify-payment` | P/C | Verify capture → order creation |
| COT-10 | `GET /checkout/sessions/:id/order` | P/C | Resolve created order (confirmation page) |

**Canonical flow (BSS §8.13, Blueprint §5.3.2):** 5-stage machine `CART REVIEW → ADDRESS → SHIPPING → PAYMENT → CONFIRMATION`; guest checkout supported; **atomic synchronous reservation at payment initiation (15-min timeout)**; re-validation at every stage (entry, payment initiation, verification): cart not empty, `availableStock ≥ quantity`, server amount = gateway amount, address valid + pincode serviceable, shipping method valid for address + weight, coupon valid (one per order, active, min order, usage), signature valid, Total > ₹0; 5-min cooldown between orders from same user; `razorpayPaymentId` unique; duplicate prevention (button disable + key + cooldown + unique constraint + webhook idempotency); on verification failure → reservation released, payment per canonical machine; payment timeout 15 min → `expired` → inventory release.

`POST /checkout/sessions` — **COT-01 · Create session**
- **Purpose:** enter checkout from cart (CART REVIEW stage); runs pre-validation (cart not empty, items active/in-stock).
- **Access:** P (guest) / C · key.
- **Request:** `{ cartId? }` (session-scoped; server resolves actor cart) — or empty body.
- **Success 201:** `data: { sessionId, stage: "cart_review", cart, validations }`.
- **Errors:** 400 `CART_EMPTY` · 422 `ITEM_OUT_OF_STOCK`, `INSUFFICIENT_STOCK`, `PRICE_CHANGED`.
- **Events:** `checkout.session.created` (reg.).
- **Performance:** < 200ms; pre-validate on entry; cart fresh.

`GET /checkout/sessions/:id` — **COT-02 · Session state**
- **Purpose:** read session (stage, validated cart, address, shipping, coupon, totals, reservation status). Server records validated facts per stage.
- **Access:** P/C (session-bound).
- **Success 200:** `data: { session }`.
- **Errors:** 404 (session not found/expired) · 410 `SESSION_EXPIRED`.
- **Performance:** < 200ms; no cache.

`POST /checkout/sessions/:id/address` — **COT-03 · Set address**
- **Purpose:** address stage: reuse `addressId` or inline address (L1: phone `/^[6-9]\d{9}$/`, pincode `/^\d{6}$/`, city/state ≤ 100, country default `IN`); pincode serviceability check (L3).
- **Access:** P/C · key.
- **Request:** `{ addressId } | { address: { name, phone, line1, line2?, city, state, pincode } }`.
- **Success 200:** `data: { stage: "address", address, serviceable: true, shippingMethods? }`.
- **Errors:** 422 `ADDRESS_INVALID`, `PINCODE_NOT_SERVICEABLE` · 404 `ADDRESS_NOT_FOUND`.
- **Validation:** re-validated at every subsequent stage; pincode lookup cached 24h.
- **Events:** audit checkout start (userId/guestToken, cartTotal).

`GET /checkout/sessions/:id/shipping-methods` — **COT-04 · Shipping methods**
- **Purpose:** rates for the chosen address: `{ id, name, rate, etaDays, codAvailable }` — computed server-side only (S15 module API; zone > base, free ≥ ₹999 standard only, dimensional weight L×W×H/5000, weight ≤ 30kg standard / 25kg express, size ≤ 150cm, COD ≤ ₹5000).
- **Access:** P/C.
- **Success 200.**
- **Errors:** 422 `ADDRESS_INVALID` (address required first).
- **Performance:** rates cache 1 min (on address change); < 200ms.

`POST /checkout/sessions/:id/shipping` — **COT-05 · Select shipping**
- **Purpose:** lock shipping method (stage 3).
- **Access:** P/C · key.
- **Request:** `{ shippingMethodId }`.
- **Success 200:** `data: { stage: "shipping", totals }`.
- **Errors:** 422 `SHIPPING_METHOD_INVALID`, `PINCODE_NOT_SERVICEABLE` · 400 weight/size exceeded.
- **Performance:** re-validated at payment initiation.

`POST /checkout/sessions/:id/coupon` — **COT-06 · Apply coupon**
- **Purpose:** apply coupon (≤ 50 chars, min 6 chars alphanumeric; one per order; rate 10/min).
- **Access:** P/C · key.
- **Request:** `{ code }`.
- **Success 200:** updated totals with discount breakdown.
- **Errors:** 422 `COUPON_INVALID`, `COUPON_EXPIRED`, `COUPON_MINIMUM_NOT_MET`, `COUPON_USAGE_LIMIT` · 429 (coupon rate limit).
- **Validation:** coupon validation = no cache; server-side only.
- **Events:** audit coupon applied.

`DELETE /checkout/sessions/:id/coupon` — **COT-07 · Remove coupon**
- **Access:** P/C.
- **Success 200:** totals recalculated.

`POST /checkout/sessions/:id/payment` — **COT-08 · Initiate payment**
- **Purpose:** **payment initiation (stage 4)**: full re-validation (cart, stock, price match, address, shipping, coupon) → **atomic synchronous inventory reservation (T1, 15-min timeout)** → create payment `created → initiated` → gateway order (paise, INR) → returns `razorpayOrderId` for the client SDK.
- **Access:** P/C · key (per attempt) · CSRF.
- **Request:** `{ paymentMethod: "razorpay", idempotencyKey }`.
- **Success 200:** `data: { paymentId, gatewayOrderId, amount, currency: "INR", expiresAt, keyId? }`.
- **Errors:** 422 `PAYMENT_FAILED`, `INSUFFICIENT_STOCK` (409), `PRICE_CHANGED`, `PINCODE_NOT_SERVICEABLE` · 409 `DUPLICATE_ORDER` · 5-min cooldown enforced.
- **Events:** reservation events `stock.reserved`; payment `initiated`.
- **Performance:** T0 path; reservation all-or-nothing across variants; < 200ms + gateway hop (30s cooldown retries, circuit breaker).

`POST /checkout/verify-payment` — **COT-09 · Verify payment (order creation)**
- **Purpose:** verify gateway signature + amount server-side (HMAC) → **T4/T2**: payment `captured` + order creation chain (Order + items snapshots + `OrderStatusHistory pending→confirmed` + stock deduction + cart clear + outbox) — single atomic unit. Webhook fallback idempotent (`gatewayPaymentId` unique) — never double-creates.
- **Access:** P/C · key (per attempt) · CSRF.
- **Request:** `{ razorpayOrderId, razorpayPaymentId, razorpaySignature }` (`verifyPaymentSchema` — BSS §8.13).
- **Success 201:** `data: { order: { id, orderNumber, status: "confirmed", totals } }` + `Location: /order-confirmed/{orderId}`.
- **Errors:** 422 `INVALID_PAYMENT_SIGNATURE`, `PAYMENT_AMOUNT_MISMATCH`, `PAYMENT_FAILED` · 409 `DUPLICATE_ORDER` · 500 `ORDER_CREATION_FAILED` (retry with same key; state remains pending).
- **Events:** `payment.captured` (consumers: Finance records, Documents invoice + order summary, Notifications) · `order.created`, `order.confirmed` · `checkout.recovery.sent` (reg.) on abandonment.
- **Performance:** T0; webhook fallback < 5s; invoice generated at confirmation (not delivery — canonical ML-04).

`GET /checkout/sessions/:id/order` — **COT-10 · Resolve order**
- **Purpose:** confirmation-page data: created order + payment status + next steps (order number, ETA).
- **Access:** P/C (session-bound).
- **Success 200:** `data: { order, payment }`.
- **Errors:** 404 (not yet created) — client shows pending state.
- **Performance:** < 200ms.

---

## 7.14 Orders (S14 · T0)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| ORD-01 | `GET /orders` | C/S/A | Order list (role-scoped) |
| ORD-02 | `GET /orders/by-number/:number` | C/S/A | Lookup by display number |
| ORD-03 | `GET /orders/:id` | C/S/A | Order detail (role-scoped views) |
| ORD-04 | `GET /orders/:id/items` | C/S/A | Order items (snapshots) |
| ORD-05 | `GET /orders/:id/status-history` | C/S/A | Append-only status history |
| ORD-06 | `POST /orders/:id/cancel` | C/S/A | Cancel order (window-gated) |
| ORD-07 | `POST /orders/:id/status` | S/A | Transition endpoint (T3 engine) |
| ORD-08 | `POST /orders/:id/hold` | A | Admin hold |
| ORD-09 | `POST /orders/:id/resume` | A | Resume from hold |
| ORD-10 | `POST /orders/:id/notes` | S/A/C | Add note |
| ORD-11 | `GET /orders/:id/notes` | S/A | Read notes |
| ORD-12 | `POST /orders/:id/address-correction` | C/S | Correct address before shipped |
| ORD-13 | `GET /orders/:id/track` | C/S/A | Tracking (orders + shipments) |
| ORD-14 | `POST /orders/batch` | A | Batch order ops (≤ 100, background) |
| ORD-15 | `GET /admin/orders` | A | Admin order list + filters |

**Canonical rules (BSS §8.14, Blueprint B.1):** order is an **immutable record; status is the only mutable field**; 18-state canonical machine (`pending → confirmed → processing → accepted → rejected → packing → ready_to_ship → shipped → in_transit → delivered → completed → cancelled → failed → returned → refunded → archived` + guarded `failed_delivery`, `held`); transitions per OM §3.5 with actor-validated legality, reason always required; customer cancel before `packing`; shop cancel pre-shipment; admin any state; return within 7 days of delivery; accept/reject within 48h (SLA); refund 5–7 business days; order number `NAB-YYYYMMDD-XXXXXX` generated on confirmation, unique per day; notes ≤ 500 chars; address correction before `shipped` (revalidated + serviceable, shipping recalculated); unauthorized access → 404; shop owners see masked addresses (city/state only) and payment status only (OM §10.4); fraud-readiness signals (Low log / Medium flag / High hold+notify / Critical cancel+block).

`GET /orders` — **ORD-01 · Order list**
- **Purpose:** own orders (C); shop orders (S, own shop); all (A). Filters: `status`, `dateFrom/To`, `orderNumber`, `search`, pagination.
- **Access:** C/S/A.
- **Success 200:** `data: [{ id, orderNumber, status, totals, createdAt, itemCount }]` + meta. Customer-visible status mapping per Blueprint B.2 is applied at the edge (`displayStatus` field).
- **Performance:** composite index `(profileId, status, createdAt)` / `(shopId, status, createdAt)`; offset pagination; < 300ms admin.

`GET /orders/by-number/:number` — **ORD-02 · Lookup by number**
- **Purpose:** resolve `NAB-YYYYMMDD-XXXXXX` → order (owner/scope-gated).
- **Access:** C (own) / S (own shop) / A.
- **Success 200:** same as ORD-03.
- **Errors:** 404 (hidden).

`GET /orders/:id` — **ORD-03 · Order detail**
- **Purpose:** role-scoped full view: items (snapshots), totals breakdown (subtotal → discounts → coupon → shipping → GST split → total), payment sub-status (`pending|authorized|captured|refunding|refunded|failed`), shipment summary, customer-visible status, timeline.
- **Access:** C (own) / S (own shop — **masked address city/state only**) / A.
- **Success 200.**
- **Errors:** 404 `ORDER_NOT_FOUND` (or hidden).
- **Performance:** Hyperdrive pooled reads; p95 < 300ms.

`GET /orders/:id/items` — **ORD-04 · Items**
- **Purpose:** order item snapshots (SKU, name, image, price, quantity, line totals, return eligibility flags).
- **Access:** C (own) / S (own shop) / A.
- **Success 200.**
- **Performance:** snapshot read; < 200ms.

`GET /orders/:id/status-history` — **ORD-05 · Status history**
- **Purpose:** append-only immutable history `[{ status, to, actor, reason?, at }]`.
- **Access:** C (own) / S (own shop) / A.
- **Success 200.**
- **Performance:** index `(orderId, at)`.

`POST /orders/:id/cancel` — **ORD-06 · Cancel**
- **Purpose:** cancellation: Customer pre-`packing`; Shop pre-shipment; Admin any state; **reason required**. T3: status change + history row + `STOCK_RELEASE` + (if paid) refund initiation + outbox — one unit (CC-16: `cancelled → refunded` path).
- **Access:** C (own, window) / S (own shop) / A · key.
- **Request:** `{ reason, reasonCode? }` (e.g., `changed_mind | price_issue | duplicate | other`).
- **Success 200:** `data: { status: "cancelled", paymentSubStatus, refundPending }`.
- **Errors:** 400 `INVALID_TRANSITION` (window missed) · 403 actor mismatch · 409 `DUPLICATE_ORDER`-adjacent conflicts.
- **Events:** `order.cancelled` (consumers: Inventory restock, Finance adjustment, Refund initiation, Notifications).
- **Performance:** atomic T3; refund async (5–7 business days ETA shown).

`POST /orders/:id/status` — **ORD-07 · Transition**
- **Purpose:** generic canonical transition engine (`orders.transition(orderId, to, actor, reason)` — T3). Legality per OM §3.5 only; one status per request; optimistic locking (`If-Match` with order `version`).
- **Access:** S (own shop, allowed transitions) / A (any) · key.
- **Request:** `{ to, reason?, reference? }` — `to` from the 18-state registry (never arbitrary).
- **Success 200:** `data: { status, paymentSubStatus }`.
- **Errors:** 400 `INVALID_TRANSITION` · 403 actor · 412 `PRECONDITION_FAILED` (stale version) · 409 state conflict.
- **Events:** `order.<state>` per transition (`order.accepted`, `order.packing`, `order.ready_to_ship`, …).
- **Performance:** optimistic lock + re-fetch on stale; per-order event ordering (outbox).

`POST /orders/:id/hold` — **ORD-08 · Admin hold**
- **Purpose:** `held` state (admin-only, any pre-delivery state; audited; CC-18).
- **Access:** A · reason required · CSRF.
- **Request:** `{ reason }`.
- **Success 200:** `data: { status: "held" }`.
- **Events:** `order.held`; notifications to customer + shop.

`POST /orders/:id/resume` — **ORD-09 · Resume**
- **Purpose:** `held → resume` (previous state).
- **Access:** A · reason required.
- **Success 200.**
- **Events:** `order.resumed`.

`POST /orders/:id/notes` — **ORD-10 · Add note**
- **Purpose:** internal note (≤ 500 chars); customer-visible flag `visibleToCustomer`.
- **Access:** S (own shop) / A · C (own, `visibleToCustomer: true` only).
- **Request:** `{ note, visibleToCustomer? }`.
- **Success 201.**
- **Events:** notification if visible to customer.

`GET /orders/:id/notes` — **ORD-11 · Read notes**
- **Access:** S (own shop) / A (internal notes); C sees only `visibleToCustomer` notes.

`POST /orders/:id/address-correction` — **ORD-12 · Address correction**
- **Purpose:** correct delivery address **before `shipped`**; re-validated (pincode serviceable, shipping recalculated); full address to shop re-masked.
- **Access:** C (own) / S (own shop) / A.
- **Request:** `{ address: {…} }`.
- **Success 200:** `data: { shippingMethod, shippingCharge }` (recalculated).
- **Errors:** 400 (after shipped) · 422 `PINCODE_NOT_SERVICEABLE`.
- **Events:** audit `ORDER_ADDRESS_CORRECTED`.

`GET /orders/:id/track` — **ORD-13 · Tracking**
- **Purpose:** customer-facing tracking: order status + shipment states + tracking events timeline (no PII).
- **Access:** C (own) / S (own shop) / A.
- **Success 200:** `data: { orderStatus, shipments: [{ id, courier, trackingNumber, status, events }] }`.
- **Performance:** real-time status sync, 30s polling fallback for active shipments.

`POST /orders/batch` — **ORD-14 · Batch ops (admin)**
- **Purpose:** ≤ 100 order operations (status transitions, notes) as background job with per-item validation and partial-success result.
- **Access:** A · key.
- **Request:** `{ items: [{ id, op, … }] }`.
- **Success 202:** `data: { jobId }`.
- **Performance:** background; job status via Workflow endpoints.

`GET /admin/orders` — **ORD-15 · Admin order list**
- **Purpose:** platform-wide order administration (filters: status, date range, shop, amount range, fraud flags).
- **Access:** A.
- **Success 200:** masked PII.
- **Performance:** composite indexes; < 300ms; pagination.

---

## 7.15 Shipping (S15 · T0)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| SHP-01 | `POST /shipping/quote` | P/C | Shipping rate quote |
| SHP-02 | `GET /shipments` | S/A | Shipment list |
| SHP-03 | `GET /shipments/:id` | C/S/A | Shipment detail |
| SHP-04 | `POST /shipments` | S/A | Create shipment (from `ready_to_ship`) |
| SHP-05 | `POST /shipments/:id/assign-courier` | S/A | Assign courier |
| SHP-06 | `POST /shipments/:id/tracking` | S/A | Update tracking number |
| SHP-07 | `POST /shipments/:id/status` | A | Shipment state transition |
| SHP-08 | `POST /shipments/:id/exception` | S/A | Report exception |
| SHP-09 | `GET /shipments/:id/tracking-events` | C/S/A | Tracking events |
| SHP-10 | `GET /shipments/track/:trackingNumber` | P | Public tracking (no PII) |
| SHP-11 | `GET /shipments/:id/label` | S/A | Shipping label download |

**Canonical rules (BSS §8.15, Blueprint B.5):** 12-state shipment machine (`shipment_created → ready_to_pack → packed → ready_for_pickup → picked_up → in_transit → out_for_delivery → delivered → closed` + `delivery_failed`, `exception`, `returned_to_sender`); one order → one or more shipments; transitions per SH §3.6 with actor + reason (reason required for `delivery_failed`, `exception`, `returned_to_sender`); order must be `ready_to_ship`; weight ≤ 30 kg standard / 25 kg express; dimensional weight L×W×H/5000, charge higher; size ≤ 150 cm (L+W+H); COD not offered above `cod.maxAmount = 5000`; order completes when **all shipments delivered**; failed delivery → retry next business day, **max 3 attempts** then `returned_to_sender` + refund (shipping cost refunded on failed delivery); stale flag if no updates 48h; courier webhook-first + 30-min polling fallback; **status/cancel/reassign/delivery-proof Admin only**; create/assign/update-tracking Shop(own)+Admin; courier API failure → backoff 1s/2s/4s/8s max 3, DLQ, manual-update fallback.

`POST /shipping/quote` — **SHP-01 · Rate quote**
- **Purpose:** public rate quote `{ pincode, items: [{ weightGrams, length, width, height, value }], method? }` — server-side only (never client-computed).
- **Access:** P · rate 60/min.
- **Success 200:** `data: { methods: [{ id, name, rate, etaDays, codAvailable }], serviceable: true }`.
- **Errors:** 422 `PINCODE_NOT_SERVICEABLE` · 400 weight/size limits.
- **Performance:** rates cache 1 min; < 200ms.

`GET /shipments` — **SHP-02 · Shipment list**
- **Purpose:** shop (own) / admin; filters `status`, `orderId`, `courier`, `dateFrom/To`; pagination.
- **Access:** S (own) / A.
- **Success 200.**
- **Performance:** offset pagination; < 300ms; archive + offset pagination for closed.

`GET /shipments/:id` — **SHP-03 · Shipment detail**
- **Purpose:** role-scoped: shop/admin full; customer sees tracking view only (via ORD-13).
- **Access:** C (via order) / S (own) / A.
- **Success 200:** `data: { id, orderId, status, courier, trackingNumber, weight, items, eventsSummary, createdAt }`.
- **Errors:** 404 (hidden).
- **Performance:** KV-cached summary, event-invalidated.

`POST /shipments` — **SHP-04 · Create shipment**
- **Purpose:** create shipment for `ready_to_ship` order items; atomic: Shipment + ShipmentItems + ShipmentEvent `created` + order→`shipped` in one unit (SH §2.5).
- **Access:** S (own shop) / A · key.
- **Request:** `{ orderId, orderItemIds, method, weight? }`.
- **Success 201.**
- **Errors:** 400 `INVALID_TRANSITION` (order not ready_to_ship) · 422 weight/size.
- **Events:** `shipment.created` (drives Document label pipeline `SHL` 3y retention).
- **Performance:** T0; atomic; < 300ms.

`POST /shipments/:id/assign-courier` — **SHP-05 · Assign courier**
- **Purpose:** assign courier (Shiprocket/Delhivery/BlueDart/DTDC or manual fallback); generates label via Document pipeline.
- **Access:** S (own) / A · key.
- **Request:** `{ courier: "shiprocket"|"delhivery"|"bluedart"|"dtdc"|"manual", providerReference? }`.
- **Success 200:** `data: { trackingNumber?, labelDocumentId? }`.
- **Errors:** 503 `CARRIER_UNAVAILABLE` (retryable, backoff; manual fallback).
- **Events:** `shipment.created` follow-up; label document event-triggered.

`POST /shipments/:id/tracking` — **SHP-06 · Update tracking**
- **Purpose:** set/update tracking number (format per courier, uniqueness, existence verification).
- **Access:** S (own) / A.
- **Request:** `{ trackingNumber }`.
- **Success 200.**
- **Errors:** 422 `TRACKING_INVALID`.
- **Events:** audit `SHIPMENT_TRACKING_UPDATED`.

`POST /shipments/:id/status` — **SHP-07 · Shipment transition (admin)**
- **Purpose:** manual transition through the 12-state machine; optimistic locking; reason required for failure states.
- **Access:** **A only** (status/cancel/reassign/delivery-proof — BSS §8.15).
- **Request:** `{ to, reason?, at? }` (`at` for back-dated events with reason).
- **Success 200.**
- **Errors:** 400 `INVALID_TRANSITION` · 412 stale.
- **Events:** `shipment.<state>`; order status sync when terminal (`shipment.delivered` → order `delivered`, hold starts).
- **Performance:** transition = event row + order sync + outbox, one unit; webhook/polling dedup.

`POST /shipments/:id/exception` — **SHP-08 · Report exception**
- **Purpose:** record exception (`exception` state, reason required; carrier API failure path).
- **Access:** S (own) / A.
- **Request:** `{ reason, note? }`.
- **Success 200.**
- **Events:** `shipment.exception`; notification to customer (retry next business day, max 3 attempts).

`GET /shipments/:id/tracking-events` — **SHP-09 · Tracking events**
- **Purpose:** append-only timestamp-ordered events.
- **Access:** C (own) / S (own) / A.
- **Success 200:** `data: [ { status, location?, note?, at } ]`.
- **Performance:** webhook-first, 30-min polling fallback; append-only index.

`GET /shipments/track/:trackingNumber` — **SHP-10 · Public tracking**
- **Purpose:** anonymous tracking page data: status + last events + ETA — **no PII** (receiver name masked, no address).
- **Access:** P.
- **Success 200.**
- **Errors:** 404 `TRACKING_NOT_FOUND`.
- **Performance:** cache 5 min per tracking number.

`GET /shipments/:id/label` — **SHP-11 · Label download**
- **Purpose:** signed URL to shipping label document (`SHL`, 3y retention; Document service owns generation).
- **Access:** S (own) / A.
- **Success 200:** `data: { url, expiresAt }` (1h signed URL).
- **Errors:** 404 `DOCUMENT_NOT_FOUND` · 403.

---

## 7.16 Payments (S16 · T0)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| PAY-01 | `GET /payments/methods` | P/C | Available payment methods |
| PAY-02 | `GET /payments/:id` | C/S/A | Payment detail (role-scoped) |
| PAY-03 | `GET /orders/:id/payment` | C/S/A | Order's payment + sub-status |
| PAY-04 | `GET /payments` | S/A | Payment list (filters) |
| PAY-05 | `GET /admin/payments/reconciliation` | A | Reconciliation report |
| PAY-06 | `POST /admin/payments/reconciliation/run` | A | Trigger reconciliation |
| PAY-07 | `POST /webhooks/gateway/:provider` | I | Gateway webhook (signed) |

**Canonical rules (BSS §8.16, Blueprint B.3):** payment states `created → initiated → processing → authorized → captured → completed` + `failed`, `cancelled`, `expired` + refund transitions `captured/completed → partially_refunded → refunded`; money INR only, min ₹1, max ₹10,00,000, exactly 2 decimals, DECIMAL(10,2); paise conversion only at adapter boundary; signature (HMAC-SHA256) + amount match server-side; refund preconditions (captured, not already refunded, ≤ original, ≤ remaining refundable, within 180 days, reason); payment timeout 15 min → `expired` → release inventory; webhook signature + 5-min freshness + nonce/replay; per-user velocity 5-min cooldown, max 5 payments/hr; gateway is source of truth for conflicts (PAYMENT §9.8); payment initiation/verification endpoints live in Checkout (§7.13) — not duplicated here.

`GET /payments/methods` — **PAY-01 · Payment methods**
- **Purpose:** available methods for the market/cart (`razorpay` online; COD if `cod.enabled` and order ≤ `cod.maxAmount = 5000`).
- **Access:** P/C.
- **Success 200:** `data: [{ id, name, type: "online"|"cod", enabled }]`.
- **Performance:** config KV cache 10 min.

`GET /payments/:id` — **PAY-02 · Payment detail**
- **Purpose:** payment record view: amount, currency, status, method, timestamps, refund aggregate (`refunded`/`partially_refunded` derived from refund records — never stored), failure reason (retryable flag).
- **Access:** C (own) / S (own shop — payment status only) / A.
- **Success 200.**
- **Errors:** 404 (hidden).
- **Performance:** derived aggregate on read; < 200ms.

`GET /orders/:id/payment` — **PAY-03 · Order payment**
- **Purpose:** order payment sub-status (`pending|authorized|captured|refunding|refunded|failed` — CC-28) + amounts + refunds summary.
- **Access:** C (own) / S (own shop) / A.
- **Success 200.**
- **Errors:** 404.
- **Performance:** < 200ms.

`GET /payments` — **PAY-04 · Payment list**
- **Purpose:** shop (own) / admin list; filters `status`, `method`, `dateFrom/To`, `orderId`, `amountRange`.
- **Access:** S (own) / A.
- **Success 200:** masked customer PII.
- **Performance:** offset pagination; append-only records; < 300ms.

`GET /admin/payments/reconciliation` — **PAY-05 · Reconciliation**
- **Purpose:** gateway reconciliation view (gateway recon, settlement match, payment verify) — conflict resolution: **gateway is source of truth**.
- **Access:** A.
- **Success 200:** `data: { mismatches: [], lastRunAt, summary }`.
- **Performance:** materialized recon; daily automated; real-time for critical.

`POST /admin/payments/reconciliation/run` — **PAY-06 · Run reconciliation**
- **Purpose:** trigger daily reconciliation job on demand.
- **Access:** A · key.
- **Success 202:** `data: { jobId }`.
- **Performance:** background; < 5s webhook-class budget.

`POST /webhooks/gateway/:provider` — **PAY-07 · Gateway webhook**
- **Purpose:** inbound provider webhook (`payment.captured`, `refund.processed`, COD collection): signature verified (provider scheme + platform `X-Nabome-Signature` for verified callbacks), 5-min freshness, nonce/replay tracked, **idempotent** (`gatewayPaymentId` unique; processed once, cached result); **return non-2xx on failure so the provider retries** (PAYMENT §15.3).
- **Access:** I (provider-registered).
- **Success 200:** `{ success: true }`.
- **Errors:** 401 signature · 422 `PAYMENT_AMOUNT_MISMATCH` · 409 duplicate — non-2xx propagates to provider.
- **Events:** consumes `payment.captured`/`refund.processed`; emits forward events to Orders/Finance.
- **Performance:** processing < 5s; never return 200 on failure; replay-safe.

---

## 7.17 Finance (S17 · T0)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| FIN-01 | `GET /finance/earnings` | S/A | Earnings summary |
| FIN-02 | `GET /finance/ledger` | S/A | Earnings ledger (append-only) |
| FIN-03 | `GET /finance/settlements` | S/A | Settlement list |
| FIN-04 | `GET /finance/settlements/:id` | S/A | Settlement detail |
| FIN-05 | `POST /finance/settlements` | A | Create settlement (period run) |
| FIN-06 | `POST /finance/settlements/:id/approve` | A | Approve settlement |
| FIN-07 | `POST /finance/settlements/:id/reject` | A | Reject settlement |
| FIN-08 | `POST /finance/settlements/:id/reverse` | A | Reverse settlement (COMPLETED/PAID only) |
| FIN-09 | `GET /finance/commission-rules` | A | Commission rules |
| FIN-10 | `POST /finance/commission-rules` | A | Create rule |
| FIN-11 | `PATCH /finance/commission-rules/:id` | A | Update rule |
| FIN-12 | `GET /finance/records` | S/A | Finance records list |

**Canonical rules (BSS §8.17, Blueprint B.4):** Finance **records, never processes money** (PAYMENT §1.2 independence); records created on `order.confirmed` (canonical trigger — ML-10); commission default 15% (0–50%), cap default 50% (config 10–100%), hierarchy Shop > Category > Global, snapshot at order time, `commission = itemTotal × rate / 100` rounded 2dp, capped; 7-day hold from `delivered` (`finance.holdDays`); settlement period weekly default (Mon–Sun, cut-off 23:59:59 UTC), min ₹100; settlement states `PENDING → ELIGIBLE → CREATED → REVIEW → APPROVED → PROCESSING → COMPLETED → PAID` (+ `REJECTED → PENDING`, `FAILED`, `REVERSED`); reversal from `COMPLETED`/`PAID` only — forward state, never deletion, admin approval + reason + audit (ML-09/12); balances computed from append-only log — never cached without invalidation; settlement approval `approve`/`create` Admin only; payouts Digital (UPI/bank via gateway) default, Manual admin-processed.

`GET /finance/earnings` — **FIN-01 · Earnings summary**
- **Purpose:** shop earnings dashboard: `{ periodEarnings, availableBalance, inHoldBalance, settledTotal, pendingSettlements, nextSettlementDate }` — computed from ledger.
- **Access:** S (own shop) / A.
- **Success 200.**
- **Performance:** computed from append-only log; < 300ms; never cached without invalidation.

`GET /finance/ledger` — **FIN-02 · Earnings ledger**
- **Purpose:** append-only ledger rows (orderId, type `sale|commission|shipping|adjustment|refund|settlement`, amount, balanceAfter, createdAt); filters `dateFrom/To`, `type`, `orderId`.
- **Access:** S (own) / A.
- **Success 200:** paginated.
- **Performance:** append-only index; offset pagination; 1M+ rows scale.

`GET /finance/settlements` — **FIN-03 · Settlement list**
- **Purpose:** own settlements (S) / all (A); filters `status`, `periodFrom/To`.
- **Access:** S (own) / A.
- **Success 200.**
- **Performance:** < 300ms.

`GET /finance/settlements/:id` — **FIN-04 · Settlement detail**
- **Purpose:** settlement + earnings rows + payout method + status history.
- **Access:** S (own) / A.
- **Success 200:** masked payout destination.
- **Errors:** 404 `SETTLEMENT_NOT_FOUND` (hidden).
- **Performance:** < 200ms.

`POST /finance/settlements` — **FIN-05 · Create settlement**
- **Purpose:** run settlement period (weekly default; eligible = delivered ≥ 7 days, ≥ ₹100 minimum); idempotent per period (409 `DUPLICATE_SETTLEMENT`).
- **Access:** **A only**.
- **Request:** `{ periodStart?, periodEnd? }` (defaults to config period).
- **Success 201:** `data: { settlementId, status: "CREATED", amount }`.
- **Errors:** 409 `DUPLICATE_SETTLEMENT` · 422 `SETTLEMENT_MINIMUM_NOT_MET`.
- **Events:** `settlement.created`; consumers: Document `STL` settlement report, Notifications.
- **Performance:** T8 atomic; background for large periods.

`POST /finance/settlements/:id/approve` — **FIN-06 · Approve**
- **Purpose:** `REVIEW → APPROVED → PROCESSING`; admin approval + reason.
- **Access:** **A only**.
- **Request:** `{ reason?, payoutMethod: "digital"|"manual" }`.
- **Success 200.**
- **Errors:** 409 `SETTLEMENT_STATE_INVALID`.
- **Events:** `settlement.approved`; `settlement.paid` after payout confirmation (digital via gateway / manual admin-processed).

`POST /finance/settlements/:id/reject` — **FIN-07 · Reject**
- **Purpose:** `REVIEW → REJECTED → PENDING` (re-eligible next period).
- **Access:** A.
- **Request:** `{ reason }`.
- **Success 200.**
- **Errors:** 409 `SETTLEMENT_STATE_INVALID`.

`POST /finance/settlements/:id/reverse` — **FIN-08 · Reverse**
- **Purpose:** **from `COMPLETED` or `PAID` only** (per canonical machine — ML-12); forward `REVERSED` state, never deletion; admin approval + reason + new finance record; idempotent on `(settlementId, orderId)`/`refundId`.
- **Access:** A (approval workflow) · key.
- **Request:** `{ reason, approvalRef? }`.
- **Success 200:** `data: { status: "REVERSED", reversalRecordId }`.
- **Errors:** 403 (missing approval) · 409 `SETTLEMENT_STATE_INVALID`.
- **Events:** `settlement.reversed`; audit financial class 7y.

`GET /finance/commission-rules` — **FIN-09 · Commission rules**
- **Purpose:** hierarchy Shop > Category > Global rules.
- **Access:** A.
- **Success 200.**
- **Performance:** config-style cache 10 min.

`POST /finance/commission-rules` — **FIN-10 · Create rule**
- **Purpose:** create rule `{ scope: shop|category|global, scopeId?, rate (0–50), maxCap? }`.
- **Access:** A.
- **Success 201.**
- **Errors:** 422 `COMMISSION_INVALID` (out of range).
- **Events:** `config.updated`-class invalidation (rules snapshot per order — existing orders unaffected).

`PATCH /finance/commission-rules/:id` — **FIN-11 · Update rule**
- **Purpose:** update; applies to future orders only (snapshot discipline).
- **Access:** A.
- **Success 200.**
- **Errors:** 422 `COMMISSION_INVALID`.

`GET /finance/records` — **FIN-12 · Finance records**
- **Purpose:** append-only finance record list (transaction/earnings/commission/settlement) with filters.
- **Access:** S (own) / A.
- **Success 200:** paginated.
- **Performance:** materialized views for reporting; offset pagination; 7y retention, archived never deleted.

---

## 7.18 Returns & Resolution (S18 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| RTR-01 | `POST /returns` | C (order owner, incl. guest + email) | Request return |
| RTR-02 | `GET /returns` | C/S/A | Return list |
| RTR-03 | `GET /returns/:id` | C/S/A | Return detail |
| RTR-04 | `POST /returns/:id/evidence` | C | Upload evidence photo |
| RTR-05 | `POST /returns/:id/approve` | S/A | Approve (48h SLA) |
| RTR-06 | `POST /returns/:id/reject` | S/A | Reject |
| RTR-07 | `POST /returns/:id/appeal` | C | Appeal rejection |
| RTR-08 | `POST /returns/:id/pickup` | S/A | Schedule pickup (reverse logistics) |
| RTR-09 | `POST /returns/:id/receive` | A | Confirm receipt → restock |

**Canonical flow (BSS §8.18, Blueprint §5.3.3):** request (≤ 7 days from delivery, one-time per item, unused with tags, exceptions non-returnable) → evidence + reason → review (48h SLA `sla.reviewHours`) → approved → reverse logistics (S15) → received → restock (`ORDER_RETURN`) → refund initiated (S16). Each step its own atomic unit, chained by events (T7 — no long-running transaction). Reasons: `wrong_size | wrong_item | defective | not_as_described | changed_mind | quality_issue`. Partial returns supported; dropping below free-shipping threshold → shipping charged. Refund amount never computed client-side.

`POST /returns` — **RTR-01 · Request return**
- **Purpose:** create return request for delivered order items (guest: `orderNumber` + registered email).
- **Access:** C (own order) · key.
- **Request:** `{ orderId, items: [{ orderItemId, quantity, reason }], note?, evidenceMediaIds? }`.
- **Success 201:** `data: { resolutionId, status: "requested", slaDeadline }`.
- **Errors:** 410 `RETURN_WINDOW_EXPIRED` · 409 `RETURN_ALREADY_EXISTS` · 422 `ITEM_NOT_RETURNABLE`, `EVIDENCE_REQUIRED`, `RETURN_REASON_INVALID`.
- **Validation:** window (7 days from delivery — `sla.returnWindowDays`); one-time per item; reasons enum.
- **Events:** `return.requested` (reg.); notification `return_requested`; 48h review SLA job alert.
- **Performance:** SLA enforced by Workflow job; < 300ms.

`GET /returns` — **RTR-02 · Return list**
- **Purpose:** own (C) / shop (S, own) / all (A); filters `status`, `dateFrom/To`.
- **Access:** C/S/A.
- **Success 200.**
- **Performance:** offset pagination; < 300ms.

`GET /returns/:id` — **RTR-03 · Return detail**
- **Purpose:** resolution state + items + evidence + timeline + refund status.
- **Access:** C (own) / S (own shop) / A.
- **Success 200.**
- **Errors:** 404 `RESOLUTION_NOT_FOUND` (hidden).
- **Performance:** state cached via events; < 200ms.

`POST /returns/:id/evidence` — **RTR-04 · Upload evidence**
- **Purpose:** attach evidence photo(s) (via S30 presigned upload; ≤ 5 photos).
- **Access:** C (own) · key.
- **Request:** `{ mediaIds: [uuid] }`.
- **Success 200.**
- **Errors:** 422 `EVIDENCE_REQUIRED` (at review time if missing).
- **Events:** resolution updated (audit every step).

`POST /returns/:id/approve` — **RTR-05 · Approve**
- **Purpose:** approve within 48h SLA (auto-escalation job alerts after `sla.reviewHours`); triggers reverse-logistics shipment (S15).
- **Access:** S (own shop) / A · key.
- **Request:** `{ note? }`.
- **Success 200:** `data: { status: "approved", pickupScheduled?, returnShipmentId? }`.
- **Errors:** 409 `RETURN_STATE_INVALID` (after SLA auto-decision).
- **Events:** `return.approved` (reg.); consumers: Shipping reverse logistics, Notifications, Documents (`RET` return slip).

`POST /returns/:id/reject` — **RTR-06 · Reject**
- **Purpose:** reject with reason; customer may appeal.
- **Access:** S (own shop) / A.
- **Request:** `{ reason }`.
- **Success 200.**
- **Errors:** 409 state invalid.
- **Events:** `return.rejected` (reg.); notification.

`POST /returns/:id/appeal` — **RTR-07 · Appeal**
- **Purpose:** customer appeals rejection (window per config; admin re-review).
- **Access:** C (own) · key.
- **Request:** `{ reason, note? }`.
- **Success 200:** `data: { status: "appealed" }`.
- **Events:** `return.appealed`; admin review job.

`POST /returns/:id/pickup` — **RTR-08 · Schedule pickup**
- **Purpose:** schedule reverse-logistics pickup (courier slot; future courier API).
- **Access:** S (own shop) / A.
- **Request:** `{ pickupDate, pickupSlot?, courier? }`.
- **Success 200.**
- **Events:** `return.pickup_scheduled`; shipment created.

`POST /returns/:id/receive` — **RTR-09 · Confirm receipt**
- **Purpose:** confirm goods received → **restock (`ORDER_RETURN`)** + refund initiation (CC-32); admin override allowed with reason.
- **Access:** A (warehouse) · key.
- **Request:** `{ receivedItems?, note? }`.
- **Success 200:** `data: { status: "received", refundInitiated: true }`.
- **Errors:** 409 state invalid.
- **Events:** `shipment.return_received` (reg.); `return.received`; refund initiation (`refund.initiated`); inventory restock.

---

## 7.19 Refunds (S16/S19 · T0)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| RFS-01 | `GET /refunds` | C/S/A | Refund list |
| RFS-02 | `GET /refunds/:id` | C/S/A | Refund detail |
| RFS-03 | `POST /refunds` | A | Manual refund initiation |
| RFS-04 | `POST /refunds/:id/retry` | A | Retry failed refund |

**Canonical rules (BSS §8.19, Blueprint B.3):** refund lifecycle `initiated → processing → completed → settled` (+ `failed` retryable); owned by S16 Payments, orchestrated by S14/S18; triggers: order cancellation/rejection (pre-shipment, CC-16), return approval→receipt (ML-09 — post-shipment refunds require return-received signal); preconditions: payment captured, not already refunded, ≤ original, ≤ remaining refundable, within **180 days** of payment, reason required; partial refunds supported (multiple, remaining tracked); timeline 5–7 business days (ETA shown); refunds only to original payment method; aggregate `refunded`/`partially_refunded` derived on read (ML-03); idempotency key + unique constraint per refund — no double payout.

`GET /refunds` — **RFS-01 · Refund list**
- **Purpose:** own (C) / shop (S, own) / all (A); filters `status`, `orderId`, `dateFrom/To`.
- **Access:** C/S/A.
- **Success 200:** `data: [{ id, orderId, amount, status, eta, createdAt }]`.
- **Performance:** append-only; offset pagination; < 300ms.

`GET /refunds/:id` — **RFS-02 · Refund detail**
- **Purpose:** refund + payment aggregate + gateway reference (masked) + ETA + failure reason.
- **Access:** C (own) / S (own shop) / A.
- **Success 200.**
- **Errors:** 404 (hidden).
- **Performance:** aggregate derived on read; < 200ms.

`POST /refunds` — **RFS-03 · Manual refund**
- **Purpose:** admin-initiated refund (override path; reasons: admin correction, settlement reversal, fraud return). Normal refunds are event-triggered — this endpoint exists for the registered admin override only.
- **Access:** A · key · reason required.
- **Request:** `{ paymentId, amount, reason, verificationId? }`.
- **Success 201:** `data: { refundId, status: "initiated", eta }`.
- **Errors:** 400 `REFUND_EXCEEDS_PAYMENT`, `REFUND_WINDOW_EXPIRED` · 409 `ALREADY_REFUNDED`.
- **Events:** `refund.initiated` (reg.) → `refund.processed` → `refund.settled` (Finance reversal idempotent on `refundId`).
- **Performance:** async processing with backoff (1s/2s/4s/8s max 3, DLQ after max + admin alert).

`POST /refunds/:id/retry` — **RFS-04 · Retry failed refund**
- **Purpose:** re-queue a `failed` refund (gateway decline → retry with backoff, DLQ after 3).
- **Access:** A · key.
- **Success 202:** `data: { status: "processing" }`.
- **Errors:** 409 `REFUND_STATE_INVALID` (not failed).
- **Events:** `refund.processed` on success.

---

## 7.20 Reviews, Ratings & Questions (S20 · T2)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| RVS-01 | `GET /products/:id/reviews` | P | Published reviews list |
| RVS-02 | `GET /products/:id/rating-summary` | P | Rating aggregates |
| RVS-03 | `GET /products/:id/questions` | P | Questions + answers |
| RVS-04 | `POST /products/:id/reviews` | C | Submit review (verified purchase) |
| RVS-05 | `PATCH /reviews/:id` | C | Edit review (30-day window) |
| RVS-06 | `POST /reviews/:id/helpful` | C | Helpful vote |
| RVS-07 | `DELETE /reviews/:id` | C | Delete own review |
| RVS-08 | `POST /products/:id/questions` | C | Ask question |
| RVS-09 | `POST /questions/:id/answers` | S/A | Answer question |
| RVS-10 | `POST /reviews/:id/report` | C | Report review/abuse |
| RVS-11 | `GET /admin/reviews/moderation-queue` | A | Moderation queue (24h SLA) |
| RVS-12 | `POST /admin/reviews/:id/moderate` | A | Moderate (approve/hide/remove) |
| RVS-13 | `POST /admin/reviews/:id/feature` | A | Feature review |

**Canonical rules (BSS §8.20):** rating integer 1–5 (`RATING_VALUE_INVALID`); **only verified purchasers may publish** (hard rule #1 — 403 `REVIEW_NOT_VERIFIED_PURCHASE`); rating allowed 24h after delivery; review window **90 days from delivery**; edit window **30 days from submission**; every edit = new version record (ReviewVersion, retained indefinitely); no same-product review within 24h (`REVIEW_ALREADY_EXISTS`); rate limits: create 5/24h, edit 10/24h, question 5/24h, report 10/24h, helpful vote 50/24h; moderation SLA 24h; aggregates derived, event-invalidated; shop owners cannot edit customer reviews; photos WebP; no PII in published reviews.

`GET /products/:id/reviews` — **RVS-01 · Reviews list**
- **Purpose:** published, verified-badged reviews; filters `rating`, `withMedia`, `sort` (`newest|helpful|rating`); pagination 24.
- **Access:** P.
- **Success 200:** `data: [{ id, rating, title?, body, verified: true, helpfulCount, media, createdAt }]`.
- **Performance:** aggregate + list cache, event-invalidated; < 200ms.

`GET /products/:id/rating-summary` — **RVS-02 · Rating summary**
- **Purpose:** `{ average, count, distribution: { 1..5 }, withMediaCount }` — derived, never stored without invalidation.
- **Access:** P.
- **Success 200.**
- **Performance:** derived aggregate; cache event-invalidated.

`GET /products/:id/questions` — **RVS-03 · Questions**
- **Purpose:** questions + answers (answered only; unanswered visible to asker).
- **Access:** P.
- **Success 200.**
- **Performance:** pagination 24.

`POST /products/:id/reviews` — **RVS-04 · Submit review**
- **Purpose:** publish review; gating: verified purchase + ≥ 24h post-delivery + ≤ 90 days + no prior review in 24h.
- **Access:** C · key · rate 5/24h.
- **Request:** `{ rating (1–5), title?, body?, mediaIds? }`.
- **Success 201:** `data: { reviewId, status: "pending_moderation" }`.
- **Errors:** 403 `REVIEW_NOT_VERIFIED_PURCHASE` · 410 `REVIEW_WINDOW_EXPIRED` · 409 `REVIEW_ALREADY_EXISTS` · 422 `RATING_VALUE_INVALID` · 429 `REVIEW_RATE_LIMITED`.
- **Events:** `review.created` (moderation queue); notification consumed `order.delivered` (review request 24h post-delivery).
- **Performance:** moderation 24h SLA via Workflow.

`PATCH /reviews/:id` — **RVS-05 · Edit review**
- **Purpose:** edit within 30 days of submission; **every edit = new version** (append-only ReviewVersion).
- **Access:** C (own) · rate 10/24h.
- **Success 200.**
- **Errors:** 410 `REVIEW_EDIT_WINDOW_EXPIRED` · 429.
- **Events:** `review.updated` (versioned).

`POST /reviews/:id/helpful` — **RVS-06 · Helpful vote**
- **Purpose:** toggle helpful vote; rate 50/24h.
- **Access:** C.
- **Success 200:** `data: { helpfulCount, voted: true }`.
- **Errors:** 429 `REVIEW_RATE_LIMITED`.

`DELETE /reviews/:id` — **RVS-07 · Delete own**
- **Purpose:** soft-delete own review.
- **Access:** C (own).
- **Success 204.**
- **Events:** `review.moderated` (removal); aggregate invalidation.

`POST /products/:id/questions` — **RVS-08 · Ask question**
- **Purpose:** post question (rate 5/24h; profanity filter).
- **Access:** C.
- **Request:** `{ body (≤ 500) }`.
- **Success 201.**
- **Events:** notification to shop (answer SLA).

`POST /questions/:id/answers` — **RVS-09 · Answer**
- **Purpose:** shop/admin answers product question.
- **Access:** S (own shop) / A.
- **Success 201.**
- **Events:** notification to asker.

`POST /reviews/:id/report` — **RVS-10 · Report**
- **Purpose:** report abuse; rate 10/24h; feeds moderation queue.
- **Access:** C.
- **Request:** `{ reason }`.
- **Success 202.**
- **Performance:** moderation SLA 24h; flagged-content SLA 4h (S21 register).

`GET /admin/reviews/moderation-queue` — **RVS-11 · Moderation queue**
- **Purpose:** pending reviews/questions/reports (age-ordered; 24h SLA).
- **Access:** A.
- **Success 200.**
- **Performance:** bounded; < 300ms.

`POST /admin/reviews/:id/moderate` — **RVS-12 · Moderate**
- **Purpose:** `{ action: "approve"|"hide"|"remove", reason? }` — admin may moderate all content (shop owners cannot edit customer reviews).
- **Access:** A.
- **Success 200.**
- **Events:** `review.moderated`; audit.

`POST /admin/reviews/:id/feature` — **RVS-13 · Feature**
- **Purpose:** feature review (trust signal).
- **Access:** A.
- **Success 200.**
- **Events:** `review.updated`.

---

## 7.21 CMS (S21 · T2)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| CMS-01 | `GET /cms/content/by-slug/:slug` | P | Published content by slug |
| CMS-02 | `GET /cms/content` | S/A | Content list (role-scoped) |
| CMS-03 | `GET /cms/content/:id` | P (published)/S/A | Content detail |
| CMS-04 | `POST /cms/content` | A/editor roles | Create content |
| CMS-05 | `PATCH /cms/content/:id` | A/editor roles | Update content |
| CMS-06 | `POST /cms/content/:id/submit` | A/editor roles | Submit for review |
| CMS-07 | `POST /cms/content/:id/approve` | A (reviewer) | Approve |
| CMS-08 | `POST /cms/content/:id/publish` | A | Publish (atomic swap) |
| CMS-09 | `POST /cms/content/:id/schedule` | A | Schedule publish |
| CMS-10 | `POST /cms/content/:id/unpublish` | A | Unpublish |
| CMS-11 | `POST /cms/content/:id/archive` | A | Archive (soft) |
| CMS-12 | `DELETE /cms/content/:id` | A | Soft delete |
| CMS-13 | `GET /cms/content/:id/versions` | A | Version history |
| CMS-14 | `GET /cms/blocks` | S/A | Reusable blocks |
| CMS-15 | `POST /cms/blocks` | S/A | Create reusable block |
| CMS-16 | `PATCH /cms/blocks/:id` | S/A | Update block |
| CMS-17 | `GET /cms/taxonomy` | P | Content taxonomy |

**Canonical rules (BSS §8.21):** 7 content types (`page | landing-page | blog-article | announcement | faq | policy | reusable-block`) in one `CmsContent`; lifecycle `created → draft → pending_review → approved → published` (+ `scheduled`, `unpublished`, `archived`, `deleted`); role matrix `admin | editor | author | reviewer | vendor` per type; authors cannot review own content; escalation if review pending > 48h; publish gate: blocks present + no accessibility errors + image alt text; 25 canonical block types (Zod-validated, registry-driven); DOMPurify whitelist (blocked `script, iframe, object, embed, form, input, textarea, select`; blocked attrs `onclick/onerror/onload/style`); title ≤ 500; slug `/^[a-z0-9-]+$/` unique per `(typeId, slug, locale)`; locale `en-IN | bn-IN | hi-IN` (canonical UX-12); max 100 versions per content (oldest auto-archived); SEO title 50–60 / description 150–160; published cache 1h; sitemap regenerated on publish.

`GET /cms/content/by-slug/:slug` — **CMS-01 · Published content**
- **Purpose:** storefront content (pages, landing pages, policies, FAQs, announcements) by slug (+ `locale` query).
- **Access:** P.
- **Success 200:** `data: { id, type, title, slug, blocks, seo, updatedAt }`.
- **Errors:** 404 `CONTENT_NOT_FOUND` (unpublished = 404).
- **Performance:** KV published cache 1h, invalidated on publish/unpublish; < 200ms.

`GET /cms/content` — **CMS-02 · Content list**
- **Purpose:** admin/editor list with filters `type`, `status`, `locale`, `author`, search; pagination.
- **Access:** A (role matrix per type).
- **Success 200.**
- **Performance:** offset pagination; < 300ms.

`GET /cms/content/:id` — **CMS-03 · Content detail**
- **Purpose:** published view for public; full (incl. draft body, review state) for authorized roles.
- **Access:** P (published)/A.
- **Success 200.**
- **Errors:** 404 (hidden for unpublished non-authorized).
- **Performance:** cache per status segment.

`POST /cms/content` — **CMS-04 · Create content**
- **Purpose:** create draft of a content type.
- **Access:** A/editor/author/vendor (per type matrix).
- **Request:** `{ type, title, slug?, locale, blocks?, seo?, scheduledAt? }`.
- **Success 201.**
- **Errors:** 409 `CONTENT_SLUG_DUPLICATE` · 422 `CONTENT_BLOCK_INVALID`.
- **Events:** `cms.content.review_requested` (reg.) on submit.

`PATCH /cms/content/:id` — **CMS-05 · Update**
- **Purpose:** edit in `draft`/`created` state only (`CONTENT_NOT_EDITABLE_IN_STATE` otherwise).
- **Access:** A/editor roles (author of own drafts).
- **Success 200.**
- **Errors:** 409 `CONTENT_NOT_EDITABLE_IN_STATE`.
- **Events:** version snapshot on publish only (draft edits not versioned).

`POST /cms/content/:id/submit` — **CMS-06 · Submit for review**
- **Purpose:** `draft → pending_review`; assigns reviewer (not the author — no self-review).
- **Access:** A/editor roles.
- **Success 200.**
- **Events:** `cms.content.review_requested` (reg.); 48h escalation job.

`POST /cms/content/:id/approve` — **CMS-07 · Approve**
- **Purpose:** `pending_review → approved` (reviewer role).
- **Access:** A (reviewer; never self).
- **Success 200.**
- **Errors:** 409 `CONTENT_NOT_EDITABLE_IN_STATE`.

`POST /cms/content/:id/publish` — **CMS-08 · Publish**
- **Purpose:** **T10 atomic**: version snapshot + status change + KV invalidation + audit (draft→published swap). Gate: blocks present (`CONTENT_PUBLISH_REQUIRES_BLOCK`), no accessibility errors (`CONTENT_ACCESSIBILITY_BLOCKED`), image alt text.
- **Access:** A.
- **Success 200:** `data: { status: "published", version }`.
- **Errors:** 422 `CONTENT_PUBLISH_REQUIRES_BLOCK`, `CONTENT_ACCESSIBILITY_BLOCKED`.
- **Events:** `cms.content.published` (reg.); sitemap regenerated.

`POST /cms/content/:id/schedule` — **CMS-09 · Schedule**
- **Purpose:** `scheduledAt`; cron publishes every minute; failure → draft + admin email; retries 3 exponential.
- **Access:** A.
- **Request:** `{ scheduledAt }`.
- **Success 200.**
- **Events:** `cms.content.published` at trigger.

`POST /cms/content/:id/unpublish` — **CMS-10 · Unpublish**
- **Access:** A.
- **Success 200.**
- **Events:** `cms.content.unpublished` (reg.); cache invalidation.

`POST /cms/content/:id/archive` — **CMS-11 · Archive**
- **Access:** A.
- **Success 200.**
- **Events:** `cms.content.archived` (reg.).

`DELETE /cms/content/:id` — **CMS-12 · Soft delete**
- **Purpose:** soft delete (`isDeleted`); 7-day recovery.
- **Access:** A.
- **Success 204.**

`GET /cms/content/:id/versions` — **CMS-13 · Versions**
- **Purpose:** version snapshots (max 100; oldest auto-archived).
- **Access:** A.
- **Success 200:** paginated 24.

`GET /cms/blocks` — **CMS-14 · Reusable blocks**
- **Purpose:** reusable-block library (cache 30 min).
- **Access:** S/A (per type matrix).
- **Success 200.**

`POST /cms/blocks` — **CMS-15 · Create block**
- **Request:** `{ name, type, config }` (block type from 25-type registry).
- **Access:** S/A.
- **Success 201.**
- **Errors:** 422 `CONTENT_BLOCK_INVALID`.

`PATCH /cms/blocks/:id` — **CMS-16 · Update block**
- **Access:** S/A.
- **Success 200.**

`GET /cms/taxonomy` — **CMS-17 · Taxonomy**
- **Purpose:** content taxonomy (categories/tags for content).
- **Access:** P.
- **Success 200.**
- **Performance:** taxonomy cache 24h.

---

## 7.22 Homepage Builder (S22 · T2)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| HMP-01 | `GET /cms/homepage` | P | Rendered published homepage |
| HMP-02 | `GET /cms/homepage/draft` | A | Current draft |
| HMP-03 | `PUT /cms/homepage/draft` | A | Save draft (full config) |
| HMP-04 | `POST /cms/homepage/draft/publish` | A | Publish draft |
| HMP-05 | `POST /cms/homepage/rollback` | A | Rollback to previous version |
| HMP-06 | `GET /cms/homepage/versions` | A | Version history (last 50) |
| HMP-07 | `GET /cms/homepage/templates` | A | Templates |
| HMP-08 | `POST /cms/homepage/templates/:id/apply` | A | Apply template to draft |

**Canonical rules (BSS §8.22):** `HomepageConfig` status `draft | published | archived` — **one active draft, one published only**; 18 canonical section types (`hero-banner, hero-video, product-grid, featured-collection, featured-categories, promo-banner, flash-sale, countdown, newsletter, testimonials, blog-preview, rich-content, image-gallery, video-block, cta-block, spacer, divider, custom`); section `type` immutable after creation; every type has a Zod schema; URL/HTTPS validation on CTAs; DOMPurify on `custom` HTML, sandboxed JS (admin-only inline); images ≤ 10MB/≤ 4000×4000; token-based values only (no hardcoded colors/typography); keep last 50 versions; versions older than 90 days auto-archived; rendered config KV cache 5 min invalidated on publish; admin-only (`/api/cms/homepage/*`); rate 100 req/min/admin; idempotency keys on all writes; published config frozen read-only; soft-delete only.

`GET /cms/homepage` — **HMP-01 · Rendered homepage**
- **Purpose:** published homepage config (sections + data-source refs) for storefront render.
- **Access:** P.
- **Success 200:** `data: { publishedAt, version, sections: [{ type, config, data? }] }` — data-source sections (product-grid, featured-collection, featured-categories) resolve live product/collection refs.
- **Performance:** **KV rendered config 5-min TTL, invalidated on publish**; < 200ms.

`GET /cms/homepage/draft` — **HMP-02 · Draft**
- **Purpose:** current draft config (or `null` if none).
- **Access:** A · rate 100/min.
- **Success 200.**
- **Errors:** 404 `HOMEPAGE_NOT_FOUND` (no draft).

`PUT /cms/homepage/draft` — **HMP-03 · Save draft**
- **Purpose:** full replace of the draft (sections array; unknown fields stripped; token-based values only; section type immutable per existing section id).
- **Access:** A · key.
- **Request:** `{ sections: [{ type, config, id? }] }`.
- **Success 200:** `data: { draft }`.
- **Errors:** 422 `SECTION_CONFIG_INVALID` · 409 `SECTION_TYPE_IMMUTABLE`.
- **Events:** none (draft saves not events); audit every write.

`POST /cms/homepage/draft/publish` — **HMP-04 · Publish**
- **Purpose:** **T10 atomic**: draft→published swap + version increment + KV invalidation + audit + optional publish note.
- **Access:** A · key.
- **Request:** `{ note? }`.
- **Success 200:** `data: { version, publishedAt }`.
- **Errors:** 409 `HOMEPAGE_DRAFT_EXISTS`-adjacent (no draft) · 422 `SECTION_CONFIG_INVALID`.
- **Events:** `homepage.published` (reg.); data-source sections refresh on collection/product events.
- **Performance:** cache invalidated instantly; publish < 300ms.

`POST /cms/homepage/rollback` — **HMP-05 · Rollback**
- **Purpose:** create draft from an older version then publish (two-step rollback).
- **Access:** A · key.
- **Request:** `{ version }`.
- **Success 200:** `data: { version, publishedAt }`.
- **Errors:** 404 `HOMEPAGE_VERSION_LIMIT`-adjacent (version not found) · 409 (version > current).
- **Events:** `homepage.rolled_back` (reg.).

`GET /cms/homepage/versions` — **HMP-06 · Versions**
- **Purpose:** version list (keep last 50; older auto-archived).
- **Access:** A.
- **Success 200.**
- **Performance:** offset pagination 24.

`GET /cms/homepage/templates` — **HMP-07 · Templates**
- **Access:** A.
- **Success 200.**
- **Performance:** cache 30 min.

`POST /cms/homepage/templates/:id/apply` — **HMP-08 · Apply template**
- **Purpose:** seed draft from template (draft overwritten; no publish).
- **Access:** A · key.
- **Success 200.**
- **Errors:** 422 `SECTION_CONFIG_INVALID` (template validation).

---

## 7.23 Notifications (S23 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| NTF-01 | `GET /notifications` | C/S/A | In-app notification list |
| NTF-02 | `GET /notifications/:id` | C/S/A | Notification detail |
| NTF-03 | `POST /notifications/:id/read` | C/S/A | Mark read |
| NTF-04 | `POST /notifications/read-all` | C/S/A | Mark all read |
| NTF-05 | `GET /notifications/unread-count` | C/S/A | Unread badge |
| NTF-06 | `GET /notifications/search` | C/S/A | Full-text search (min 2 chars) |
| NTF-07 | `GET /notifications/deliveries` | A | Delivery-attempt records (ops) |

**Canonical rules (BSS §8.23):** every communication triggered by a business event; event→channel/priority matrix (canonical NTF §3.5 — e.g., `auth.password_reset` Email/Urgent, `order.shipped` Email+In-App/High, `order.packing` In-App/Normal, `settlement.paid` Email+In-App/High, `inventory.low_stock` Email/Normal); security + in-app channels cannot be disabled; marketing explicit opt-in; quiet hours + timezone (`Asia/Kolkata` default); retry classes Urgent 5@1s · High 3 exp · Normal 3 exp · Low 2 linear · Background 1; no retry on 4xx/invalid email/bounce; DLQ > 10/hr alert; **retention: user-facing in-app rows 90 days then deleted; delivery/audit records per audit class** (PS-01 canonical); notification content immutable after creation; one-click unsubscribe on marketing; rate limits: read 100 ops/min, search 30/min, preference changes 10/min, email 500/hr.

`GET /notifications` — **NTF-01 · Notification list**
- **Purpose:** own in-app notifications; filters `unread`, `type`, `dateFrom/To`; pagination.
- **Access:** C/S/A (own).
- **Success 200:** `data: [{ id, type, title, body, deepLink?, read, createdAt }]` + unread count.
- **Performance:** 30s polling pattern; offset pagination; user rows deleted after 90 days (cleanup job).

`GET /notifications/:id` — **NTF-02 · Detail**
- **Access:** C/S/A (own).
- **Errors:** 404 (hidden/expired).

`POST /notifications/:id/read` — **NTF-03 · Mark read**
- **Access:** C/S/A (own) · rate 100 ops/min.
- **Success 200.**
- **Performance:** read-state update atomic.

`POST /notifications/read-all` — **NTF-04 · Mark all read**
- **Access:** C/S/A (own).
- **Success 200:** `data: { marked }`.

`GET /notifications/unread-count` — **NTF-05 · Unread count**
- **Purpose:** badge counter (fresh).
- **Access:** C/S/A.
- **Success 200:** `data: { unread }`.
- **Performance:** fresh read; < 100ms.

`GET /notifications/search` — **NTF-06 · Search**
- **Purpose:** full-text search over own notifications (min 2 chars, max 50 results).
- **Access:** C/S/A · rate 30/min.
- **Success 200.**
- **Performance:** full-text index; < 200ms.

`GET /notifications/deliveries` — **NTF-07 · Delivery records (ops)**
- **Purpose:** delivery-attempt/status records (append-only; channels, attempts, bounces) for ops; retention per audit class (security 5y, financial 7y).
- **Access:** A.
- **Success 200:** filters `channel`, `status`, `eventType`, dates.
- **Performance:** append-only index; bounded queries.

---

## 7.24 Messaging (S24 · T2)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| MSG-01 | `GET /conversations` | S/A | Conversation list |
| MSG-02 | `POST /conversations` | S/A | Open thread for linked entity |
| MSG-03 | `GET /conversations/:id` | S/A | Thread + participants |
| MSG-04 | `POST /conversations/:id/messages` | S/A | Send message |
| MSG-05 | `GET /conversations/:id/messages` | S/A | Messages (50/page) |
| MSG-06 | `POST /conversations/:id/resolve` | S/A | Resolve |
| MSG-07 | `POST /conversations/:id/reopen` | S/A | Reopen |
| MSG-08 | `POST /conversations/:id/close` | S/A | Close |
| MSG-09 | `GET /conversations/:id/unread-count` | S/A | Unread count |
| MSG-10 | `PATCH /messages/:id` | S/A | Edit (internal notes flag) |
| MSG-11 | `DELETE /messages/:id` | S/A | Delete own (10 min) / admin soft |

**Canonical rules (BSS §8.24):** **Admin ↔ Shop Owner only** (no shop↔shop, no customer threads); linked-entity threads (`order | product | finance | settlement | refund | return`) — one thread per linked entity (`CONVERSATION_LINKED_ENTITY_CONFLICT`); status `open | resolved | closed`, auto-close after 14 days inactivity (either party reopens); priority `low | normal | high | urgent`; category `order | product | finance | general | system`; content sanitized (rich text/markdown, profanity filter); attachments ≤ 5/message (images ≤ 5MB, docs ≤ 10MB, malware-scanned); spam control max 10 messages/conversation/min; pagination 50/page; **permanent append-only business records — never physically deleted (canonical — supersedes 90-day lifecycle)**; edits preserve original + edit timestamp; sender deletes own message within 10 minutes, admin soft-delete any; `isInternal` admin notes never visible to shop owners.

`GET /conversations` — **MSG-01 · Conversation list**
- **Purpose:** threads for the actor's side (admin sees all; shop sees own shop threads); filters `status`, `category`, `priority`, `linkedEntity`, search; pagination 50.
- **Access:** S/A.
- **Success 200.**
- **Performance:** index `(shopId, status, updatedAt)`; < 300ms.

`POST /conversations` — **MSG-02 · Open thread**
- **Purpose:** open (or reuse) a thread for a linked entity.
- **Access:** S/A.
- **Request:** `{ category, priority?, linkedEntity: { type, id }, initialMessage?, isInternal? }`.
- **Success 201:** `data: { conversationId, status: "open" }`.
- **Errors:** 409 `CONVERSATION_LINKED_ENTITY_CONFLICT` (existing thread returned instead).
- **Events:** `messaging.conversation.created` (reg.).

`GET /conversations/:id` — **MSG-03 · Thread detail**
- **Purpose:** thread + participants + read state.
- **Access:** S (own shop) / A.
- **Errors:** 404 `CONVERSATION_NOT_FOUND` (hidden — `isInternal` invisible to shop).

`POST /conversations/:id/messages` — **MSG-04 · Send message**
- **Purpose:** append message (append-only; read receipts updated atomically).
- **Access:** S/A.
- **Request:** `{ body (≤ 2000), attachments?: [{ mediaId }], isInternal? }`.
- **Success 201.**
- **Errors:** 422 `MESSAGE_TOO_LONG`, `ATTACHMENT_LIMIT` · 429 (spam control 10/min).
- **Events:** `messaging.message.sent` (reg.).
- **Performance:** **message send < 100ms** target.

`GET /conversations/:id/messages` — **MSG-05 · Messages**
- **Purpose:** paginated 50/page; lazy loading + virtualization contract.
- **Access:** S/A.
- **Success 200.**
- **Performance:** append-only index; cursor-friendly (50/page).

`POST /conversations/:id/resolve` — **MSG-06 · Resolve**
- **Access:** S/A.
- **Success 200.**
- **Events:** `messaging.conversation.resolved` (reg.); auto-close job after 14 days inactivity.

`POST /conversations/:id/reopen` — **MSG-07 · Reopen**
- **Access:** S/A.
- **Success 200.**

`POST /conversations/:id/close` — **MSG-08 · Close**
- **Access:** S/A.
- **Success 200.**

`GET /conversations/:id/unread-count` — **MSG-09 · Unread**
- **Access:** S/A.
- **Success 200:** `data: { unread }`.

`PATCH /messages/:id` — **MSG-10 · Edit**
- **Purpose:** edit own message (original preserved + edit timestamp); toggle `isInternal` (admin).
- **Access:** S (own, within edit window) / A.
- **Success 200.**

`DELETE /messages/:id` — **MSG-11 · Delete**
- **Purpose:** sender deletes own message within 10 minutes; admin soft-delete any (permanent records retained in audit layer).
- **Access:** S (own, ≤ 10 min) / A.
- **Success 204.**
- **Performance:** soft-delete flag; never physical delete.

---

## 7.25 Documents (S25 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| DOC-01 | `GET /documents` | C/S/A | Document list (role-scoped) |
| DOC-02 | `GET /documents/:id` | C/S/A | Document metadata |
| DOC-03 | `GET /documents/:id/download` | C/S/A | Signed download URL |
| DOC-04 | `GET /documents/:id/versions` | C/S/A | Version chain |
| DOC-05 | `POST /documents/request` | C/S/A | On-demand generation |
| DOC-06 | `POST /documents/:id/regenerate` | A | Regenerate (reason required) |

**Canonical rules (BSS §8.25, PS-04):** **no business module generates documents — all generation flows through this pipeline**; document type registry prefixes `INV/PRC/ORD/PKS/RET/RFD/STL/FIN/EXP/AUD/CST/SST/SHL/CUS/CRT`; display ID `{PREFIX}-YYYY-NNNNNN` year-scoped, never reused; `publicId` `GDOC_` + base32; generation pipeline TRIGGER → VALIDATE → SELECT TEMPLATE → POPULATE → RENDER HTML → GENERATE PDF (SHA-256 checksum) → STORE → NOTIFY → SERVE; no in-place updates — every regeneration is a new version chained via `replacedBy`, all versions retained; invoice at order confirmation (canonical ML-04); signed URLs **1 hour expiry** (KV-cached 55 min), optional single-use, `Cache-Control: private, no-cache`; download 60/user/min; retention: INV/PRC/RFD/STL/FIN/AUD 7y permanent, ORD/RET/CST/SST 3y, PKS/SHL 1–3y, EXP 30 days; financial/audit documents never deleted even if parent hard-deleted; hard-delete only after retention + 7 days, admin only; template changes never affect existing documents.

`GET /documents` — **DOC-01 · Document list**
- **Purpose:** own documents (C: own orders' docs; S: own shop docs; A: all); filters `type`, `orderId`, `dateFrom/To`.
- **Access:** C/S/A.
- **Success 200:** `data: [{ publicId, type, displayId, businessId, version, status, checksum?, createdAt }]`.
- **Performance:** offset pagination; < 300ms.

`GET /documents/:id` — **DOC-02 · Metadata**
- **Access:** C (own) / S (own shop) / A.
- **Success 200:** metadata + version chain summary.
- **Errors:** 404 `DOCUMENT_NOT_FOUND` (hidden) · 403 `DOCUMENT_ACCESS_DENIED`.
- **Performance:** < 200ms.

`GET /documents/:id/download` — **DOC-03 · Download**
- **Purpose:** one-hour signed URL (single-use optional); PDF bytes never in DB — served from R2; checksum verified on every download (mismatch → flag + notify + regenerate).
- **Access:** C/S/A (scope-gated).
- **Success 200:** `data: { url, expiresAt, checksum }`.
- **Errors:** 404 · 403 · 429 (60/user/min).
- **Performance:** signed URL < 100ms; first byte < 500ms; URL cache 55 min.

`GET /documents/:id/versions` — **DOC-04 · Versions**
- **Purpose:** version chain (`replacedBy`), all versions retained, no limit.
- **Access:** C/S/A.
- **Success 200.**
- **Performance:** chain read; < 200ms.

`POST /documents/request` — **DOC-05 · On-demand request**
- **Purpose:** request generation for documented types (e.g., customer re-download order summary `ORD`; shop export `EXP`); **T11 idempotent enqueue on `(documentType, businessId, version)`**.
- **Access:** C (own) / S (own shop) / A.
- **Request:** `{ type, businessId, format?: "pdf"|"csv"|"xlsx" }`.
- **Success 202:** `data: { documentId?, jobId, status: "queued" }`.
- **Errors:** 422 `DOCUMENT_TYPE_INVALID`, `DOCUMENT_DATA_INVALID` · 429 (generate 10/user/min).
- **Events:** `document.generated` (reg.) on completion → notification (download link).
- **Performance:** single doc < 5s (PDF < 3s); concurrency ≤ 5 parallel, 10 workers.

`POST /documents/:id/regenerate` — **DOC-06 · Regenerate (admin)**
- **Purpose:** new version of an existing document; **reason required**; previous version retained (`replacedBy` chain).
- **Access:** A · key · rate 5/min.
- **Request:** `{ reason }`.
- **Success 202:** `data: { newVersionId, jobId }`.
- **Errors:** 422 `REGENERATION_REQUIRES_REASON`.
- **Events:** `document.regenerated` (reg.).

---

## 7.26 Reports & Exports (S26 · T2)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| RPT-01 | `GET /reports/:family` | S/A | Dashboard KPI report |
| RPT-02 | `POST /reports/exports` | S/A | Request export (CSV/XLSX) |
| RPT-03 | `GET /reports/exports/:id` | S/A | Export status |
| RPT-04 | `GET /reports/exports/:id/download` | S/A | One-time download URL |

**Canonical rules (BSS §8.26, EXPORT):** read-only service over PostgreSQL/materialized views (single source, no conflicting numbers — EXPORT §1.7); report families (16): `daily-sales`, `monthly-revenue`, `product-performance`, `customer-growth`, `inventory-health`, `shipping-performance`, `refund-trend`, `category-performance`, `orders`, `payments`, `settlements`, `returns`, `reviews`, `audit`, `finance`, `custom`; row limit **100,000 rows**, file size **50MB**; formats CSV (UTF-8 BOM, CRLF, RFC 4180) / XLSX; small datasets (< 10K rows) synchronous, large background job streamed to R2; signed URLs **15-min expiry, one-time use** (regenerate with same parameters within retention); retention **30 days** then deleted (daily 2am cleanup); sensitivity tiers: Financial/Audit High, Revenue Medium — PII masked in exports unless authorized; currency DECIMAL(10,2) ₹; UTC storage, local display; KV caches: dashboard KPIs 5 min, real-time counters 1 min, trend data 15 min, report data 15 min.

`GET /reports/:family` — **RPT-01 · Report data**
- **Purpose:** dashboard KPIs / trend data for a family with `dateFrom/To`, `groupBy`, `shopId?` filters.
- **Access:** S (own shop scope) / A (full; PII-masked per tier).
- **Success 200:** `data: { summary, series }` + meta.
- **Errors:** 404 `REPORT_NOT_FOUND` · 400 `REPORT_INVALID_FILTER` · 403 `EXPORT_FORBIDDEN`.
- **Performance:** KV caches 5/1/15 min (write-event invalidated); materialized view reads; < 300ms.

`POST /reports/exports` — **RPT-02 · Request export**
- **Purpose:** enqueue export job `{ family, filters, format }`.
- **Access:** S (own shop) / A · key.
- **Request:** `{ family, filters?, format: "csv"|"xlsx" }`.
- **Success 202:** `data: { exportId, status: "queued", estimatedRows? }` — synchronous for < 10K rows (200 with URL).
- **Errors:** 422 `EXPORT_LIMIT_EXCEEDED` (rows/size) · 403 `EXPORT_FORBIDDEN` (tier/PII).
- **Events:** `report.export_requested` (reg.); `report.export_ready` (reg.) → notification.
- **Performance:** large exports background; streamed to R2; 30-day retention.

`GET /reports/exports/:id` — **RPT-03 · Export status**
- **Access:** S/A.
- **Success 200:** `data: { status: "queued"|"processing"|"ready"|"failed"|"expired", rows, size, expiresAt }`.
- **Errors:** 404 `REPORT_NOT_FOUND`.
- **Performance:** status KV 1 min.

`GET /reports/exports/:id/download` — **RPT-04 · Download**
- **Purpose:** **15-minute expiry, one-time-use signed URL**; regenerate with same parameters within retention (410 `EXPORT_EXPIRED` + regenerate allowed).
- **Access:** S/A.
- **Success 200:** `data: { url, expiresAt }`.
- **Errors:** 410 `EXPORT_EXPIRED` · 403.
- **Performance:** URL minted on demand; audit of every download.

---

## 7.27 Audit (S27 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| AUD-01 | `GET /audit/events` | A | Query audit trail |
| AUD-02 | `GET /audit/events/:id` | A | Audit entry detail |
| AUD-03 | `POST /audit/exports` | A | Request audit export |
| AUD-04 | `GET /audit/exports/:id/download` | A | Export download |

**Canonical rules (BSS §8.27, AUDIT §8.3):** append-only — **nothing is ever edited or deleted**; every service emits state-change events with full context (actor {id, role}, action, resource {type, id}, context {ip, userAgent, shopId}, before/after, timestamp UTC); retention classes: Financial 7y · Tax 7y · Consent account-lifetime + 7y · Security 5y · Configuration 5y · Authentication 3y · Product 3y · User actions 2y · System 1y · User/Shop-scoped account/shop lifetime + 7y; warm archive 90d–2y compressed, cold 2–7y archive table, never hard-deleted; tamper-evidence via checksums/chaining; admin-only reads/exports (masked PII per tiers); audit of audit-access itself; bounded queries (`AUDIT_QUERY_TOO_WIDE`).

`GET /audit/events` — **AUD-01 · Query audit trail**
- **Purpose:** query with filters `actorId`, `resourceType`, `resourceId`, `action`, `shopId`, `dateFrom/To`, `search`; **bounded** (max date-range + pagination; wider → 400 `AUDIT_QUERY_TOO_WIDE`).
- **Access:** A (incl. Compliance scoped role).
- **Success 200:** `data: [{ id, at, actor, action, resource, context, changes }]` — masked PII.
- **Errors:** 400 `AUDIT_QUERY_TOO_WIDE` · 403 `AUDIT_EXPORT_FORBIDDEN`.
- **Performance:** append-only + bounded queries; pagination 24; < 500ms with narrow ranges.

`GET /audit/events/:id` — **AUD-02 · Entry detail**
- **Access:** A.
- **Success 200:** full entry incl. before/after + checksum chain info.
- **Errors:** 404.

`POST /audit/exports` — **AUD-03 · Audit export**
- **Purpose:** export bounded query result (admin, masked PII; goes through S26 pipeline).
- **Access:** A · key.
- **Success 202:** `data: { exportId }`.
- **Errors:** 403 · 400 `AUDIT_QUERY_TOO_WIDE`.
- **Events:** audit of audit-access; `report.export_ready`.

`GET /audit/exports/:id/download` — **AUD-04 · Export download**
- **Purpose:** 15-min one-time URL (per report rules).
- **Access:** A.
- **Success 200.**
- **Errors:** 410 `EXPORT_EXPIRED`.

---

## 7.28 Configuration (S28 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| CFG-01 | `GET /config/public` | P | Public-safe config |
| CFG-02 | `GET /config/flags/:flag` | P/C/S/A | Feature-flag evaluation |
| CFG-03 | `GET /config` | A | Key list (typed) |
| CFG-04 | `GET /config/:key` | A | Key value |
| CFG-05 | `PUT /config/:key` | A | Set key (atomic + history) |

**Canonical rules (BSS §8.28):** typed keys (Decimal/Int/Bool/Enum/JSON); canonical keys binding (quoted, not re-decided): `shipping.standardRate = 99`, `shipping.expressRate = 199`, `shipping.freeThreshold = 999`, `finance.holdDays = 7`, `finance.commissionDefault = 15`, `finance.commissionMax = 50`, `finance.minimumSettlement = 100`, `sla.responseHours = 24`, `sla.reviewHours = 48`, `sla.acceptHours = 48`, `sla.resolutionDays = 7`, `sla.flaggedContentHours = 4`, `cod.maxAmount = 5000`, `cod.enabled`, `cart.guestTtlDays = 7`, `cart.customerTtlDays = 90`, `inventory.lowStockThreshold = 10`, `inventory.reservationTimeoutMin = 15`, `pagination.defaultSize = 24`, `search.maxResults = 50`, `notifications.maxBatch = 500`; unknown keys rejected; env-locked keys readonly (409); values validated within documented ranges; KV cache 10 min, invalidated on change event; flags default-deny (off); change history immutable; admin-only mutation; secrets never exposed via API.

`GET /config/public` — **CFG-01 · Public config**
- **Purpose:** client bootstrap config (public-safe only: currency, locale list, feature flags public subset, rate-limit hints, media limits).
- **Access:** P.
- **Success 200:** `data: { currency: "INR", locales: ["en-IN","bn-IN","hi-IN"], flags: {}, limits: {…} }`.
- **Errors:** none beyond universal.
- **Performance:** KV cache 10 min; < 100ms.

`GET /config/flags/:flag` — **CFG-02 · Flag evaluation**
- **Purpose:** evaluate feature flag for the caller's segment (default-deny — off unless enabled).
- **Access:** P/C/S/A.
- **Success 200:** `data: { flag, enabled, variant? }`.
- **Errors:** 404 `CONFIG_FLAG_UNKNOWN`.
- **Performance:** KV cache 10 min, event-invalidated; cache hit in request path.

`GET /config` — **CFG-03 · Key list (admin)**
- **Purpose:** typed key registry with current values (env-overridden keys flagged `source: "env"`).
- **Access:** A.
- **Success 200:** paginated.
- **Performance:** KV cache 10 min.

`GET /config/:key` — **CFG-04 · Key value**
- **Access:** A.
- **Success 200:** `data: { key, type, value, source, updatedAt }`.
- **Errors:** 404 `CONFIG_KEY_NOT_FOUND`.
- **Performance:** KV cache 10 min.

`PUT /config/:key` — **CFG-05 · Set key**
- **Purpose:** atomic single-key update + immutable history row + audit (5y class); values validated within documented ranges.
- **Access:** A · key.
- **Request:** `{ value }` (typed).
- **Success 200.**
- **Errors:** 422 `CONFIG_VALUE_INVALID` · 409 `CONFIG_KEY_READONLY` (env-locked).
- **Events:** `config.updated` / `config.flag_changed` (reg.) → cache invalidation consumers.

---

## 7.29 Workflow & Jobs (S29 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| WFL-01 | `GET /workflow/jobs` | A | Job list (filters) |
| WFL-02 | `GET /workflow/jobs/:id` | A | Job detail |
| WFL-03 | `POST /workflow/jobs/:id/retry` | A | Re-queue failed job |
| WFL-04 | `GET /workflow/jobs/dead-letter` | A | DLQ view |
| WFL-05 | `POST /workflow/jobs/dead-letter/:id/replay` | A | Replay DLQ entry |
| WFL-06 | `GET /workflow/jobs/register` | A | Scheduled-job register |

**Canonical rules (BSS §8.29, AUTOMATION):** PG job tables (durable leases) + Cloudflare Queues (fire-and-forget); lease-based claims prevent double execution; job classes with per-class timeouts (cleanup 60 min, archive 30 min, backup 60 min, restore 120 min); retries per definition, DLQ after max; scheduled-job register binding (cart expiry daily, order auto-complete 30 days post-delivery, reservation-release every 5 min, settlement timers, daily 2am cleanup, daily 3am orphan detection, weekly media integrity, monthly archive verification, hourly low-stock, review-request 24h post-delivery, content scheduled-publish every minute, audit archival); DLQ alerting > 10/hour; jobs idempotent by construction; DLQ review admin-only.

`GET /workflow/jobs` — **WFL-01 · Job list**
- **Purpose:** jobs (filters `class`, `status: pending|processing|completed|failed|dead_letter`, `dateFrom/To`).
- **Access:** A.
- **Success 200.**
- **Performance:** PG index; offset pagination; < 300ms.

`GET /workflow/jobs/:id` — **WFL-02 · Job detail**
- **Purpose:** job + attempts + payload metadata (payload validated, no secrets).
- **Access:** A.
- **Errors:** 404 `JOB_NOT_FOUND`.

`POST /workflow/jobs/:id/retry` — **WFL-03 · Retry job**
- **Purpose:** re-queue a failed job (admin).
- **Access:** A · key.
- **Success 202.**
- **Errors:** 409 `JOB_CLAIM_CONFLICT` (lease held) · 410 `JOB_EXHAUSTED`.

`GET /workflow/jobs/dead-letter` — **WFL-04 · DLQ**
- **Purpose:** dead-letter entries (defect signals, not destinations).
- **Access:** A.
- **Success 200.**
- **Performance:** bounded; alert threshold > 10/hr.

`POST /workflow/jobs/dead-letter/:id/replay` — **WFL-05 · Replay**
- **Purpose:** replay after fix (idempotent by construction).
- **Access:** A · key.
- **Success 202.**

`GET /workflow/jobs/register` — **WFL-06 · Scheduled-job register**
- **Purpose:** canonical scheduled-job register (cadence, timeout, retry policy, owner).
- **Access:** A.
- **Success 200.**

---

## 7.30 Storage & Media (S30 · T1)

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| STR-01 | `POST /storage/presign-upload` | C/S/A | Presigned upload URL + token |
| STR-02 | `POST /storage/uploads/:token/complete` | P/C/S/A | Complete upload (finalize media record) |
| STR-03 | `GET /media` | C/S/A | Media list |
| STR-04 | `GET /media/:id` | C/S/A | Media metadata + URLs |
| STR-05 | `GET /media/:id/url` | C/S/A | Signed retrieval URL |
| STR-06 | `DELETE /media/:id` | C/S/A | Soft delete |
| STR-07 | `POST /media/:id/replace` | C/S/A | Replace asset (new version) |
| STR-08 | `DELETE /media/bulk` | C/S/A | Batch soft delete (≤ 20) |

**Canonical rules (BSS §8.30, STORAGE §9, DI-04/05/07):** per-type limits (binding): image ≤ 10MB JPEG/PNG/WebP/GIF, 400×400–4000×4000px; CMS image ≤ 10MB (+SVG) ≤ 4000×2000; video ≤ 100MB MP4/WebM, 320×240–1920×1080; document/export ≤ 50MB CSV/XLSX; MIME + magic-byte checks server-side; key pattern `nabome/{domain}/{entity-uuid}/{asset-type}/{filename}`; buckets environment-suffixed; rate limits: presign **10/min**, per-type upload throttles (image 5/min, video 2/min, document 5/min); **direct-to-provider uploads (never through API handlers)**; tokens single-use, short expiry, scoped to entity + owner; ACL private-for-draft / public-for-published; orphan detection daily 3am; weekly media integrity; EXIF stripping; format conversion WebP/AVIF + responsive variants; CDN 24h image cache.

`POST /storage/presign-upload` — **STR-01 · Presign**
- **Purpose:** mint single-use upload token + presigned provider URL: `{ domain, entityId, assetType, meta: { fileName, mimeType, size, dimensions? } }` — scoped to entity + owner; domain from allowlist (`product | cms | review | resolution | message | document | avatar | export`).
- **Access:** C/S/A (domain-gated: product media = S/A, review/return evidence = C, etc.).
- **Success 201:** `data: { uploadToken, presignedUrl, expiresAt, provider }`.
- **Errors:** 422 `FILE_TOO_LARGE`, `FILE_TYPE_INVALID` · 429 `UPLOAD_RATE_LIMITED` (10/min presign).
- **Validation:** size/mime/dimension pre-check (final check at complete + integrity job); per-type throttles.
- **Performance:** mint < 100ms; token KV-bound with short TTL.

`POST /storage/uploads/:token/complete` — **STR-02 · Complete upload**
- **Purpose:** finalize: verify provider receipt (size, checksum), create MediaAsset record + audit (atomic with token consumption); triggers format pipeline (WebP/AVIF, responsive variants, EXIF strip, blur-up).
- **Access:** P/C/S/A (token-holder) · key.
- **Request:** `{ uploadToken, providerObjectKey?, size, checksum? }`.
- **Success 201:** `data: { mediaId, urls: { original, variants }, status: "processing" }`.
- **Errors:** 401 `UPLOAD_TOKEN_INVALID` · 410 `UPLOAD_TOKEN_EXPIRED`.
- **Events:** `storage.upload.completed` (reg.).
- **Performance:** metadata write only — image pipeline async.

`GET /media` — **STR-03 · Media list**
- **Purpose:** own media; filters `domain`, `entityId`, `status`.
- **Access:** C/S/A.
- **Success 200.**
- **Performance:** offset pagination; CDN URLs cached 24h.

`GET /media/:id` — **STR-04 · Media metadata**
- **Purpose:** metadata + URLs (role-scoped: draft-private URLs only for owner/roles).
- **Access:** C (own) / S (own shop) / A.
- **Success 200.**
- **Errors:** 404 `MEDIA_NOT_FOUND` (hidden).

`GET /media/:id/url` — **STR-05 · Retrieval URL**
- **Purpose:** short-lived signed URL for private assets (public assets return CDN URL).
- **Access:** C/S/A.
- **Success 200:** `data: { url, expiresAt }`.
- **Performance:** signed URL serving < 500ms.

`DELETE /media/:id` — **STR-06 · Soft delete**
- **Purpose:** soft-first delete (orphan detection daily 3am completes cleanup); entity cascade via events.
- **Access:** C (own) / S (own) / A.
- **Success 204.**
- **Events:** `storage.media.deleted` (reg.).

`POST /media/:id/replace` — **STR-07 · Replace**
- **Purpose:** new version of an asset (presigned upload for new content); URL versioning keeps CDN correctness.
- **Access:** C/S/A.
- **Success 200:** `data: { mediaId, newVersion }`.
- **Performance:** version-based CDN cache busting.

`DELETE /media/bulk` — **STR-08 · Batch delete**
- **Purpose:** ≤ 20 soft deletes in one call.
- **Access:** C/S/A · key.
- **Success 200:** `BulkOperationResult`.
- **Events:** per-item `storage.media.deleted`.

---

## 7.31 Platform: Health, Meta & Inbound Webhooks

| ID | Method & URI | Access | Purpose |
|---|---|---|---|
| PLT-01 | `GET /health` | P | Liveness/readiness |
| PLT-02 | `GET /meta/errors` | P | Machine-readable error registry |
| PLT-03 | `GET /meta/openapi` | P | OpenAPI document (this spec) |
| PLT-04 | `POST /webhooks/gateway/:provider` | I | Gateway webhook (see PAY-07) |
| PLT-05 | `POST /webhooks/courier/:provider` | I | Courier webhook (signed) |

`GET /health` — **PLT-01 · Health**
- **Purpose:** liveness (200 `{ success: true, data: { status: "ok", version } }`) + readiness variant `?probe=ready` (checks DB/queue/pooled dependencies with bounded timeout — **no business data**).
- **Access:** P (no rate-limit impact; monitoring probes).
- **Success 200.**
- **Errors:** 503 when dependency degraded (readiness probe only).
- **Performance:** < 100ms; never caches failures longer than probe interval.

`GET /meta/errors` — **PLT-02 · Error registry**
- **Purpose:** machine-readable error codes (code, HTTP, retryable, message keys) for client SDKs and tooling (§6.7).
- **Access:** P.
- **Success 200:** `data: { codes: [...] }` — no PII, no internals.
- **Performance:** static asset, CDN-cached 24h.

`GET /meta/openapi` — **PLT-03 · OpenAPI**
- **Purpose:** this specification in OpenAPI 3.1 form (generated from the registered contracts; source of truth remains this document).
- **Access:** P.
- **Success 200.**
- **Performance:** static, versioned with the API version.

`POST /webhooks/courier/:provider` — **PLT-05 · Courier webhook**
- **Purpose:** inbound courier events (status updates, delivery, exception, COD collection): **signature verified** (provider scheme), sources registered, webhook + polling **dedup** (one event, not two — SH §11.6), idempotent handling, non-2xx on failure so the provider retries.
- **Access:** I (provider-registered).
- **Success 200:** `{ success: true }`.
- **Events:** consumes courier events → `shipment.*` transitions; COD collection → payment `captured`.
- **Performance:** < 5s; 30-min polling fallback for active shipments.

---

# 8. File & Media APIs

## 8.1 Upload Model (presign → provider → complete)

```
POST /storage/presign-upload          → { uploadToken, presignedUrl }      (§7.30 STR-01)
PUT  <presignedUrl> (direct to provider; multipart/stream, never via API handlers)
POST /storage/uploads/:token/complete → { mediaId, urls }                  (§7.30 STR-02)
```

1. **Never upload through API handlers.** Uploads go directly to the provider (R2 primary, Cloudinary for images) using the presigned URL. API handlers only mint tokens and finalize records.
2. **Tokens:** single-use, short expiry, scoped to (owner, entityId, assetType); consumed atomically at complete.
3. **Limits (binding):** image ≤ 10MB JPEG/PNG/WebP/GIF, 400×400–4000×4000px; CMS image ≤ 10MB (+SVG) ≤ 4000×2000; video ≤ 100MB MP4/WebM, 320×240–1920×1080; document/export ≤ 50MB CSV/XLSX; per-type throttles image 5/min, video 2/min, document 5/min; presign 10/min.
4. **Validation:** MIME + magic-byte verification; size/dimension checks at presign (pre-check) and complete (enforced); checksum duplicate detection for product media (409 `MEDIA_DUPLICATE_DETECTED`); virus-scan readiness.
5. **Pipeline (async):** EXIF strip → WebP/AVIF conversion → responsive variants (400/600/800/1200w) → thumbnail → blur-up → provider CDN. Media record returns `status: processing → ready`; variant URLs available via `GET /media/:id`.
6. **ACL:** private-for-draft / public-for-published — draft media is never publicly readable; URLs are role-scoped signed URLs.
7. **Key layout (binding):** `nabome/{domain}/{entity-uuid}/{asset-type}/{filename}`; buckets environment-suffixed (DI-05/07).
8. **Integrity:** weekly media-integrity job; checksum mismatch → flag + quarantine (`INTEGRITY_MISMATCH` 500); orphan detection daily 3am.

## 8.2 Download Model

- Public CDN URL for published media (Cache-Control 24h, versioned URL for cache-busting).
- Private/draft assets: `GET /media/:id/url` → short-lived signed URL (1h documents / 15-min one-time exports).
- Documents: `GET /documents/:id/download` → 1h signed URL (optional single-use); checksum verified on every download.
- Exports: `GET /reports/exports/:id/download` → 15-min one-time URL; regenerate within 30-day retention.
- Downloads are audited (actor, resource, checksum); rate-limited (documents 60/user/min).

## 8.3 Delete & Replace

- **Soft-delete first** (`DELETE /media/:id` → 204; record marked deleted, 7-day recovery); completion by orphan job.
- **Replace:** `POST /media/:id/replace` — new version; previous version retained per retention class; CDN version-based.
- Batch deletes ≤ 20 (`DELETE /media/bulk`); permanent deletes ≤ 100 with admin approval + retention check (financial/audit media never deleted — BSS §13.2).
- Entity cascade: deleting an entity (product, content, conversation) triggers `storage.media.deleted` events; cleanup is event-driven, never inline.

## 8.4 Media References

- Media is referenced by `mediaId` (UUID) in entity payloads (`mediaIds: []` on create/attach); URLs are resolved server-side by the owning service — clients never construct storage URLs.
- Alt text ≤ 125 required at product publish and CMS image blocks (accessibility gate).
- Media payloads never contain PII (EXIF stripped at ingest).

---

# 9. Webhook Readiness

## 9.1 Model

- **Inbound (provider → Nabome):** gateway (`/webhooks/gateway/:provider`) and courier (`/webhooks/courier/:provider`) — signature-verified, idempotent, non-2xx-on-failure (§7.31, PAY-07).
- **Outbound (Nabome → partners):** event-driven deliveries of canonical domain events to registered partner endpoints (ERP/CRM/AI-agent readiness). Delivery records, retry, and DLQ per the notification/queue standards.

## 9.2 Outbound Event Payload (BusinessEvent — binding, BSS §10.3)

```json
{
  "eventId": "uuid",
  "eventType": "order.shipped",
  "timestamp": "2026-08-03T10:30:00Z",
  "actor": { "id": "uuid", "role": "system", "email": null },
  "resource": { "type": "order", "id": "uuid", "data": { "orderNumber": "NAB-…", "status": "shipped", "totals": { "…": "…" } } },
  "context": { "ip": null, "userAgent": null, "shopId": "uuid", "channel": "webhook" },
  "metadata": { "version": "v1" }
}
```

- **Fields are stable; `resource.data` carries the snapshot consumers need** — consumers never re-read mutable master data (BSS §10.3).
- Event names come only from the canonical registry (dot-notation); new events are registered, never invented (§6.7, BSS §9.6).
- Versioning: payload additions are non-breaking; removal/rename = new major API version (webhook payloads version with the API version and carry `metadata.version`).

## 9.3 Security Verification (binding — Blueprint mandatory rule 14, IS-08)

- **Header:** `X-Nabome-Signature: <timestamp>.<hmac-sha256-hex>` where the HMAC is computed over the **raw payload body** with the shared secret: `HMAC_SHA256(secret, timestamp + "." + payload)`.
- **Timestamp freshness:** ≤ 5 minutes; stale → 401.
- **Replay protection:** nonce/replay tracking — each `eventId` processed exactly once; duplicates return the stored result (idempotency).
- **Verification must be timing-safe** and fail closed: any signature failure → 401, no partial processing.
- Partner endpoints must verify the same way for deliveries they receive; the delivery secret is per-subscription and never logged.

## 9.4 Retry & Delivery Status

| Aspect | Standard (binding — BSS §6.3, API_INTEGRATION §4.4–4.6) |
|---|---|
| Retry policy (outbound) | Exponential backoff 1s/2s/4s/8s, max 3 attempts, DLQ after max |
| Priority classes | Urgent 5@1s · High 3 exp · Normal 3 exp · Low 2 linear · Background 1 |
| Acknowledgement | Partner must return 2xx within 5s; non-2xx/timeout → retry |
| DLQ | Dead-letter with admin alert (> 10/hr); replayable after fix |
| Inbound | Process < 5s; return non-2xx on any failure so the provider retries; never 200-on-failure |
| Delivery status records | Append-only: `pending → delivering → delivered → failed` (+ `bounced`, `expired`); queried via notifications deliveries (NTF-07) |
| Idempotency | `eventId` unique per delivery; consumers dedupe; double effect is a defect |

## 9.5 Subscription Management (partner readiness — v1.1 gate)

- Future endpoints (Service class, API-key scoped): `POST /webhooks/subscriptions` (endpoint URL, eventType filters, secret), `GET /webhooks/subscriptions`, `DELETE /webhooks/subscriptions/:id`, `POST /webhooks/subscriptions/:id/rotate-secret`, `GET /webhooks/subscriptions/:id/deliveries`.
- **v1 behavior:** outbound webhook delivery machinery is defined above and is ready; subscription administration endpoints ship behind the feature flag `platform.webhooks.enabled` (default off) per Blueprint rule 30 (no future features in v1 without ADR). The delivery contract (§9.2–9.4) is binding regardless.

---

# 10. Performance Standards

## 10.1 Performance Budgets (binding — Blueprint §6.2, BSS §12.2)

| Path | Budget |
|---|---|
| API p95 / p99 | < 300ms / < 1s |
| Product detail | < 100ms |
| Stock check / availability | < 50ms |
| Search results / autocomplete | < 200ms / < 100ms |
| Filter counts / sort | < 500ms / < 50ms |
| Admin product/order/shop lists | < 300ms |
| Webhook processing (inbound) | < 5s |
| Document generation (single / PDF) | < 5s / < 3s |
| Message send | < 100ms |
| Signed URL serving | < 500ms (first byte < 500ms) |
| Auth endpoints (T0) | p95 < 300ms |
| Checkout API | < 200ms |

Budgets are contracts (BSS B11): they are enforced by the G4 quality gate in CI, not aspirational. Per-endpoint budgets are quoted in §7.

## 10.2 Caching Headers

| Resource class | `Cache-Control` | Cacheability | Notes |
|---|---|---|---|
| Public read (products, categories, collections, CMS, homepage) | `public, max-age=<TTL>, stale-while-revalidate` | KV edge cache | TTLs per BSS §12.1 (detail 5m, list 2m, tree 1h, content 1h, homepage 5m) |
| Search results / autocomplete | `public, max-age=60/300` | KV edge | TTL-driven |
| Authenticated reads (orders, account) | `private, no-store` (or `no-cache` where revalidation is used) | Never shared | PII-bearing |
| Documents/downloads | `private, no-cache` | Never shared | Signed URLs, audited |
| Cart | `no-store` | Never cached | Always fresh (BSS §12.1) |
| Media/CDN | `public, max-age=86400` (images 24h) | CDN | Version-based URLs |
| Errors | `no-store` | — | Never cached |
| Config public | `public, max-age=600` | KV | Event-invalidated |

**Rules:** caches are derived artifacts (B5); every cache has an owner, a TTL, and an invalidation event — a cache without all three is a defect (BSS §12.1). KV must never be the authority for stock, money, or state. Responses that vary by role/locale send `Vary: Accept-Language, Authorization`.

## 10.3 Conditional Requests

- **ETag:** all single-resource GETs return `ETag` (strong hash of the resource representation). Mutations return the new `ETag`.
- **`If-None-Match`:** 304 Not Modified (no body) when unchanged — used by SPAs to avoid re-download.
- **`If-Match`:** optimistic locking on state-changing resources (orders, drafts, configs) — 412 `PRECONDITION_FAILED` on mismatch; client re-fetches and re-applies.
- Cacheability and conditional support are required on every list/detail GET per §10.2 — this is what makes the storefront fast and cheap at 1M+ users.

## 10.4 Efficient Payloads

1. **Explicit field selection is not offered in v1** (predictability over flexibility); instead, payloads are designed lean per role and endpoint. The public product list is a projection, not the full record.
2. **Embedding:** single-level embeds only (e.g., order → shipment summary). Deep data is linked, never embedded.
3. **Pagination is mandatory** on every list (§4.4); offset lists are bounded; search is cursor-based.
4. **Compression:** responses are gzip/brotli-compressed at the edge (Cloudflare); clients must send `Accept-Encoding`; compression is transparent in the contract.
5. **Response size budgets:** list rows are kept < 2KB typical; product detail < 12KB; notification rows < 1KB. No `SELECT *` (BSS §12.5).
6. **Idempotency storage and rate-limit state** are KV-backed; they never sit in the request hot path beyond a cache read.

## 10.5 Background Processing

1. **Async contract:** long operations return `202 { data: { jobId } }`; progress via `GET /workflow/jobs/:id` (admin/owner-scoped). Batch endpoints follow the partial-success contract (§4.8).
2. **Event-driven side effects** (notifications, documents, finance records, search index) never block the request path; they consume outbox events (BSS §10.3).
3. **Queues:** Cloudflare Queues for fire-and-forget; PG job tables (durable leases, per-class timeouts, retries, DLQ) for scheduled/durable work (Blueprint rule 8; DI-01).
4. **No floating promises in handlers** — background work always goes through the queue/job layer (Blueprint mandatory rule 28).
5. **Index maintenance:** search index update < 2s per change; bulk < 30s; full rebuild < 10 min background; materialized views refreshed CONCURRENTLY (non-blocking).

## 10.6 Scale Behavior

- The API contract is scale-invariant: 0 → 1M+ users changes runtime tiers (composite indexes → read replicas + materialized views → dedicated search engine → data warehouse), never the contract (BSS §12.4).
- Cold-cache behavior is design-reviewed per endpoint: popular public reads are KV/edge-cached; T0 money paths are DB-first with Hyperdrive pooling.
- Rate-limit tiers are the first line of abuse defense and the scale enabler for public paths (IS-03).

---

# 11. Security Standards

## 11.1 Transport & Headers

- **HTTPS everywhere** (TLS 1.2+); no plaintext API access ever.
- Secure headers on all responses: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy` (rendered CMS/homepage output), `Referrer-Policy`, `X-Frame-Options: DENY`.
- CORS: registered origins only, environment-scoped; credentials allowed for cookie sessions with explicit origin allowlist.

## 11.2 Input Validation (L1 at the API boundary)

- All input validated by shared Zod schemas at every handler (Blueprint mandatory rule 16); unknown fields stripped; no `z.any()`; HTML sanitized (DOMPurify per CMS rules — §4.3).
- Length/type/enum/format limits per §4; body ≤ 1MB (uploads via presign, §8).
- Re-validation at every stage of multi-stage flows (checkout is the model — BSS §7).
- **The client is never trusted** for price, amount, stock, eligibility, ownership, or scoping — every such value is server-derived or server-revalidated.

## 11.3 Output Validation

- Every response passes through the envelope formatter; fields are typed, enums come from canonical registries, and nothing is echoed back beyond the offending field on errors.
- PII masking enforced at the owning service read API: shop owners see masked customer addresses (city/state only) and payment status only; exports mask phones/emails unless authorized; share links and public tracking expose no PII (BSS §13.3).
- Error `details` never contains PII, secrets, tokens, or stack traces (BSS §11.2).

## 11.4 Rate Limiting (binding — IS-03 / B.10, per-endpoint overrides in §7)

| Tier | Limit | Enforced per |
|---|---|---|
| Public | 60/min | IP |
| Authenticated (Customer) | 120/min | User |
| Shop Owner | 120/min (shop-scoped) | User |
| Admin | 300/min | User |
| API Key | 100/min (Premium 500/min) | Key |
| Login | 20/min per account + 10/hr per IP | Account/IP |
| Register / OTP resend | 10/min · 3/hr | IP/User |
| Password reset | 5/hr | Account/IP |
| Coupon attempts | 10/min | User |
| Search / autocomplete / recommendations | 100 / 60 / 30 per min per IP | IP |
| Bulk operations (products) | 3/min | User |
| Upload presign | 10/min (image 5, video 2, document 5) | User |
| Notification reads / search / preferences | 100 / 30 / 10 per min | User |
| Document generate / regenerate / download | 10/min · 5/min · 60/min | User |
| Messaging (per conversation) | 10 msgs/min | Conversation |
| Review actions | create 5/24h · edit 10/24h · question 5/24h · report 10/24h · helpful 50/24h | User |

Responses: `429 RATE_LIMITED` + `Retry-After` + informational `RateLimit-*` headers (§6.5). Rate-limit state is KV-backed, evaluated before authentication (L4 order).

## 11.5 Replay Protection

- Inbound webhooks: `X-Nabome-Signature` (timestamp.payload HMAC-SHA256) + **5-minute freshness** + nonce/replay tracking; each event processed once (PAY-07, PLT-05, §9.3).
- Payment verification: signature + amount match server-side; `gatewayPaymentId` unique constraint; webhook idempotency (BSS §8.16).
- Idempotency keys (§2.7) protect all state-changing endpoints against client-side double submission.
- CSRF double-submit + `x-csrf-token` HMAC (timing-safe) on all cookie-authenticated mutations (Blueprint mandatory rule 12).

## 11.6 Sensitive Data Protection

- **Never logged/returned:** passwords, tokens, refresh tokens, webhook signatures, card data, full address lines, phone numbers, gateway keys (BSS §11.3). Redaction at the logger boundary, not by convention.
- PII and financial data encrypted at rest; payment data under PCI DSS readiness (no card data beyond gateway tokens).
- Tokens: httpOnly cookies only on web; never localStorage; refresh rotation; max 5 sessions.
- Secrets: env-only, adapter-confined, never in responses.
- Verification codes: 6-digit, 10-min expiry, single-use, re-verification for sensitive ops (§3.2.8).

## 11.7 Audit Integration

- Every state change is an append-only audit fact (S27) — actor, action, resource, before/after, context — emitted by the owning service in the same transaction as the change (outbox).
- Sensitive operations require extra verification/audit per the Sensitive-Operations Register (BSS §13.2): money movement (idempotency + unique constraints), refund/settlement reversal (admin approval + reason), permanent deletes (≤ 100, admin, double confirmation), inventory absolute adjust (reason + optional second approval), settlement-destination change (re-verification), document regeneration (admin + reason), admin order override (reason + notify + audit).
- Audit of audit-access itself; `requestId` links the API call to its audit trail and logs.

---

# 12. Documentation & Change Management

## 12.1 Documentation Standards

Every endpoint is documented with: description (purpose + business context), request example (headers + body + params), response example (envelope), error examples (each class: 4xx validation, 4xx business, 429, 5xx), authentication example (cookie vs Bearer vs API key), and rate limits. Examples must match the shared schemas exactly (they are generated from the schemas to prevent drift).

## 12.2 Deliverables

1. This specification (binding, human-readable).
2. OpenAPI 3.1 document at `GET /api/v1/meta/openapi` (machine-readable, generated from registered contracts — §7.31).
3. Machine-readable error registry at `GET /api/v1/meta/errors` (§6.7).
4. Shared Zod schemas per contract (FE/BE co-located — BSS §15.2) as the source for request/response examples.
5. Per-endpoint rate-limit register (this spec §7 + implementation registry).

## 12.3 Documentation Rules

- Public endpoints are documented without version pinning ceremony; breaking changes always document the migration path.
- Deprecated endpoints carry `Deprecation`/`Sunset` headers and changelog entries (§2.2.3).
- Every new endpoint, field, enum value, and error code is added to the changelog on the same change that ships it.
- No documentation may contradict the canonical registries (Blueprint Appendix B, BSS §8); contradictions are defects, resolved by this specification.

## 12.4 Changelog

`CHANGELOG-API.md` (to be maintained with the implementation): entries per version with `Added | Changed | Deprecated | Removed | Fixed`, cross-referenced to ADRs where applicable. v1.0 baseline = this document. Changes are classified per §2.2.2 (breaking vs non-breaking) and every breaking change announces a Sunset ≥ 6 months.

---

# 13. Integration Guidelines

## 13.1 For Frontend Clients (SPA, dashboards, mobile)

1. **Bootstrap:** `GET /config/public` + `GET /auth/session` (or refresh) on app start; then domain data per route.
2. **Auth:** cookie sessions on web (send `x-csrf-token` on mutations; refresh silently via `POST /auth/refresh` on 401 `SESSION_EXPIRED` — once, then re-login); Bearer + refresh on mobile.
3. **Idempotency:** generate a UUID per user action (add-to-cart, checkout attempt, payment verify, publish) and reuse it on retries; expect `Idempotent-Replay` for duplicates.
4. **Pagination:** render with `hasMore`; infinite scroll for search (cursor); paged controls for lists (`page`, `totalPages`).
5. **Optimistic UI:** allowed for reads and low-risk mutations (wishlist toggle) **only where the server re-validates**; cart/checkout must reconcile server state (`GET /cart` after any mutation).
6. **Error handling:** switch on `error.code` (never `message` text); respect `Retry-After`; refresh state on 409 contract errors; retry 5xx with backoff and same key.
7. **Money:** treat amounts as DECIMAL strings with 2 decimals; never float arithmetic.
8. **Search UX:** min 2 chars, 300ms debounce, cursor pagination, render zero-results as empty state.

## 13.2 For Shop Owner & Admin Dashboards

1. Shop scope is server-derived; never send `shopId` in request bodies except where documented (admin only).
2. Use `If-Match` on order transitions and draft saves; resolve 412 by re-fetching.
3. Bulk operations: expect `202 + jobId`; poll `GET /workflow/jobs/:id`; handle partial-success `BulkOperationResult`.
4. Batch ceilings (§4.8) are hard: chunk client-side to the documented limits.
5. Sensitive actions (approve settlement, reverse, refund, permanent delete, adjust stock) require the documented reasons/verification claims; surface OTP re-verification prompts from `401/403` responses with `verificationRequired` hints.

## 13.3 For Third-Party AI Agents & Partners (Service class)

1. **Credential:** scoped API key (`Authorization: Bearer`); request via `POST /api/v1/admin/api-keys` (admin) or partner onboarding. Keys are hash-stored, instantly revocable, least-privilege by default.
2. **Read-first:** catalog (`/products`, `/categories`, `/collections`), orders (scoped), settlements (scoped), reports — for AI agents, read + compute + synthesize; writes require explicit scoped permissions and are always audited with the key owner as actor.
3. **Webhook consumption:** when subscribing to outbound events (v1.1), verify `X-Nabome-Signature` (timestamp.payload HMAC-SHA256, 5-min freshness), process idempotently on `eventId`, ack 2xx within 5s, and never re-read mutable master data (payloads carry snapshots).
4. **Contract stability:** depend only on documented fields; treat unknown enum values as forward-compatible; pin the version (`/api/v1`); monitor `Deprecation`/`Sunset` headers.
5. **Rate & quota discipline:** honor `Retry-After`; avoid bulk scans (use cursor pagination + date filters); heavy extraction should use exports (`POST /reports/exports`, ≤ 100K rows / 50MB).
6. **AI-agent guardrails:** never generate or mutate money-move, refund, settlement, or order-state facts on behalf of users without the documented admin/owner verification claims; never store or log tokens, keys, signatures, or PII beyond the integration's retention obligation; comply with the platform's audit expectations (every agent action is traceable to its key).

## 13.4 General Integration Rules

1. One response envelope everywhere; one error object everywhere; one pagination model.
2. Unknown response fields must be ignored (forward compatibility); undocumented request fields are stripped.
3. All times UTC ISO 8601; display localized.
4. `requestId` must be propagated into support tickets and logs.
5. Integration tests should pin: envelope shape, error codes, idempotency replay behavior, rate-limit headers, ETag/conditional behavior, and the state-machine transitions used by the client.

---

# 14. References & Binding Sources

This specification is derived from, and binding over, the following hierarchy (rule of precedence per the header):

1. **MASTER_ARCHITECTURE_BLUEPRINT.md (v1.0)** — primary binding source; Sections 4–7, Section 10, and Appendix B (canonical enums: order 18-state, payment/refund, settlement, shipment 12-state, product/inventory, roles, retention, money/ID/time, API & delivery standards) are canonical and quoted here, never re-decided.
2. **BACKEND_SERVICE_SPECIFICATION.md (v1.0)** — the consolidated backend contract: service catalog (S01–S30) defines the endpoint inventory, canonical envelope, error taxonomy + registry, idempotency rules, batch/volume limits, caching TTLs, performance budgets, security rules, and module-API boundaries referenced throughout this document.
3. **DATABASE_SPECIFICATION.md (v1.0)** — authoritative entity/relationship contract and canonical runtime values (TTLs, thresholds, enum storage).
4. **API_SERVICE_ARCHITECTURE.md / API_INTEGRATION_ARCHITECTURE.md** — API delivery references (auth flows, response format ancestry, webhook system, external integrations); where they conflict with the Blueprint/BSS, this document applies the canonical resolution (e.g., envelope `meta` shape, `/api/v1` path versioning, pagination default 24, `INSUFFICIENT_STOCK` 409, 404-on-hidden-resource).
5. **44 module architecture documents (v1.0)** — owning documents per domain (Product, Catalog, Cart/Checkout, Orders, Payments, Finance, Shipping, Resolution, Reviews, CMS, Homepage, Notifications, Messaging, Documents, Reports, Audit, Configuration, Workflow, Storage, IAM, Security, Search, …); binding where this specification is silent.
6. **ENGINEERING_HANDBOOK.md / TECH_STACK.md / FOLDER_ARCHITECTURE.md / IDENTITY_NAMING_ARCHITECTURE.md / GOVERNANCE_CONSTITUTION.md** — engineering conventions, stack citations, event-naming convention, tier rules, header/status discipline.

**Canonical resolutions applied in this document (recorded deviations, per BSS §16):** `INSUFFICIENT_STOCK` → 409 (422 retained for cart context) · cart TTLs guest 7d / customer 90d · invoice at order confirmation · shipping label `SHL` in Document registry · finance records on `order.confirmed` · notification retention 90-day user rows + class-based delivery logs · conversations permanent append-only · CMS locale `en-IN` canonical · search max 50 results · reservation at payment initiation (15-min timeout) · export retention 30 days · express rate flat ₹199.

---

*End of REST API Specification v1.0 — the single contract for all frontend, mobile, backend, and third-party consumers of নবME (Nabome) Commerce OS. Versioned per §2.2; changelog maintained per §12.4. Next review: September 03, 2026.*
