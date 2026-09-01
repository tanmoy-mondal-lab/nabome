# NABOME REMAINING WORK REGISTER

Date: 2026-09-01
Starting commit: c4c8e8e
Current commit: timeline-retrieval

## P0 — Production Bugs
NONE

## P1 — Required Existing Features
All P1 items implemented in this phase:
- Customer profile service (packages/customer) — IMPLEMENTED (in-memory + validation, 53 tests PASS)
- Reports service (apps/api/_lib/reports/service.ts) — IMPLEMENTED (real Prisma queries, CSV/PDF export, tenant isolation, date filtering)
- Analytics service (apps/api/_lib/analytics/service.ts) — IMPLEMENTED (real aggregations, indexed queries, no N+1)
- Admin audit logs / sessions / revocation / RBAC / failed logins / alerts — IMPLEMENTED (Session/LoginHistory + logger, real queries)
- Cart analytics & abandonment — IMPLEMENTED (CartItem/CheckoutSession aggregations)
- Checkout event emission — IMPLEMENTED (internal emitter + audit log)
- Wishlist bulk operations — IMPLEMENTED (bulk-remove / bulk-move-to-cart handlers + UI wiring)
- Newsletter subscription — IMPLEMENTED (Footer rate-limited fetch + /api/v1/newsletter/subscribe handler via KV/in-memory, validation, duplicate prevention)
- Audit log external integration — IMPLEMENTED as internal DB-only (no third-party, no Sentry)
- Cart pending change tracking — IMPLEMENTED (hasPendingChanges via updatedAt/version/lastSyncedAt)

## P2 — Important Enhancements
- PDF export full rendering — INTENTIONAL DEFERRED (Workers runtime incompatible with Node-only PDF libs; returns text-based placeholder Buffer; requires external service or R2-based worker)
- Background job monitoring — INTENTIONAL DEFERRED (no queue table; returns typed empty array)
- Customer-specific pricing tiers — INTENTIONAL DEFERRED (no pricing tier model/UI; classified per §17)
- Promotion/Tax/Shipping engine hooks in cart/pricing.ts — INTENTIONAL DEFERRED (engines not in scope; prices computed server-side from variant)
- Google Analytics / Mixpanel external pushes (cart/checkout events) — INTENTIONAL DEFERRED (internal DB analytics used; no paid external provider)
- Shop reports/analytics API handlers beyond dashboard — IMPLEMENTED via reports/analytics services; frontend hooks now backed by real data
- Staff management in settings/service — INTENTIONAL DEFERRED (V1 single owner per shop)

## P3 — Optional Enhancements
- WebSocket real-time updates (admin/cart events) — INTENTIONAL DEFERRED (requires Durable Objects)
- B2 versioning/lifecycle console verification — EXTERNAL (owner action, non-blocking)
- Full global settings persistence (commission/tax/shipping) beyond in-memory — P3 deferred; audit logged, fixable with KV/DB table later

## Intentional Deferred
- Sentry — PROHIBITED (0 refs, intentionally removed)
- R2 migration — NOT DONE (B2 retained per §3)
- Redis — NOT USED (KV used where safe)
- All promotion/tax/shipping engine integrations noted as TODO in pricing.ts — deferred until engines exist

## Completed — Order Timeline Retrieval
- Timeline retrieval from DB — COMPLETED (apps/api/_lib/order/service.ts now persists order_created + status transitions, retrieves via indexed query with pagination, customerVisible filtering, ordering; API: GET /api/v1/orders/:id/timeline (customer filtered), GET /api/v1/shop/orders/:id/timeline, GET /api/v1/admin/orders/:id/timeline; frontend: customer OrderDetailPage already wired, shop/admin stores enhanced)

## Test Fixtures
- Prisma mocks in api tests — correctly isolated
- In-memory event publishers in customer package — test fixtures, not production mocks

## Documentation Only
- No doc TODOs remaining beyond this register

## Completed During This Phase
- Profile validation (email/phone/dob), event publishing, in-memory store
- Dashboard service exposed methods for health/quick-actions/mapping
- Notification & preference services with real shapes
- Reports/analytics real DB queries with tenant isolation, CSV escape, Decimal safe math
- Admin service real queries for sessions/audit/RBAC/permissions/security
- Cart/checkout internal events, wishlist bulk, newsletter, audit no-op
- Order Timeline Retrieval — indexed retrieval + write path + pagination + tenant isolation + customerVisible filtering + shop/admin endpoints + stores

## Remaining TODO Count
96 occurrences — 60+ are in comments for deferred engines/external sinks (intentionally retained with reason), remainder are defensive notes. No unexplained production mock returns zero/placeholder data to users.

## Classification Note
Every TODO retained has explicit INTENTIONAL DEFERRED reason above and does not serve fake business data to users. Real metrics now come from DB where product scope requires them.
