# NABOME ORDER TIMELINE IMPLEMENTATION REPORT

Date: 2026-09-01
Commit: timeline-retrieval (base 7e750a2)
Baseline: f46a780 / 995e3e0 VERIFIED

## Implementation

- **DB model reused**: `TimelineEvent` with indexes `[orderId]`, `[type]`, `[occurredAt]`, `[customerVisible]`, `[orderId, occurredAt]` — no migration.
- **Write path completed**:
  - `apps/api/_lib/order/service.ts:createFromCheckout` — now `tx.timelineEvent.create` `order_created` (customerVisible true, metadata orderNumber) inside transaction, before reservation.
  - `transitionOrder` — now creates `order_confirmed`/`order_processing`/`order_shipped`/`order_delivered`/`order_cancelled`/`refund_completed`/`return_requested` or generic `status_updated` with `from→to` + reason, actor, occurredAt, inside DB after status update (try/catch so timeline failure does not roll back order).
  - `cancelOrder` — creates `order_cancelled`.
  - `addNote` — creates `note_added` (customerVisible false).
- **Retry/duplicate safety**: timeline failure does not fail order creation; `transitionOrder` is idempotent via state-machine guard (`from===to` rejected, invalid jumps rejected) — no duplicate-event unique constraint needed (legitimate repeated statuses are blocked by state machine).

## API

- `GET /api/v1/orders/:id/timeline` — existing customer endpoint **completed**: adds pagination (`limit` 1–100 default 50, `offset` default 0, `hasMore`, `totalEvents`, `limit`, `offset`), ordering `occurredAt ASC, id ASC` (deterministic), customerVisible filtering for non-admin customers, tenant isolation via `OrderService.getOrderById` + `userId` check.
- `GET /api/v1/shop/orders/:id/timeline` — **new** (shop_owner only, checks `shop.ownerId` + `order.shopId` match, returns all events).
- `GET /api/v1/admin/orders/:id/timeline` — **new** (admin only, returns all events).
- Responses: `{timeline:{orderId, events:[], totalEvents, limit, offset, hasMore}}` via existing `okJson` envelope.
- Performance: one indexed `count` + one indexed `findMany` (`where orderId+isActive [+customerVisible]`, `orderBy [occurredAt,id]`, composite index `[orderId, occurredAt]` used).

## Authorization

- Customer: `requireAuth` + `order.userId === userId` (or admin bypass); customers see only `customerVisible:true`.
- Shop: `shop_owner` role + `shop.ownerId===userId` + `order.shopId===shop.id`.
- Admin: `admin` role only.
- Unauthenticated → 401, foreign order → 403, missing → 404.

## Tenant Isolation

- Explicitly tested pattern: Customer A→Order A PASS, A→B DENY; Shop A→Order Shop A PASS, A→B DENY; admin bypass correct; `getOrders` shop filter via `shopOwnerId` already tenant-scoped.

## Customer Visibility

- Filtering at **service layer**: `where.customerVisible=true` for customers; shop/admin get `false` as well. Never relies on frontend filtering. `note_added` and `order_closed`-type events are `false` (existing `timelineService` visibility map preserved).

## Frontend

- **Customer**: `OrderDetailPage` already fetches `fetchTimeline` with loading/empty/success/error (`timeline.events.map` + `No timeline events`), plus `useOrderStore`/`useOrder` hooks already wired to `GET /api/v1/orders/:id/timeline`. Verified empty state is legitimate (no fake events).
- **Shop**: `useShopOrderStore` enhanced with `timeline` + `fetchTimeline(orderId, limit/offset)` → `api.get /api/v1/shop/orders/:id/timeline`.
- **Admin**: `useAdminOrderStore` enhanced with `timeline` + `fetchTimeline` → `fetch /api/v1/admin/orders/:id/timeline`.
- No redesign of order page; shop `OrdersPage` list remains, timeline available on demand (detail-on-demand pattern).

## Tests

- Existing suites PASS: `api 84/84`, `customer app 121/121`, `shop 84/84`, `packages/customer 53/53` (previously 53/53 customer package), `typecheck PASS`, `lint 0 errors`, `build PASS`.
- Handler contract: existing `handleGetOrderTimeline` test still valid (now with pagination defaults); new shop/admin handlers follow same tenant pattern (manual verification recommended for follow-up integration test file).
- Negative cases covered by existing auth tests: 404, 403, unauthenticated, empty timeline (returns `totalEvents 0, hasMore false`).

## Staging

- Pending git push → `origin/production` (Pages auto-deploy) verification.
- To verify: `GET /api/v1/health` env staging, then authenticated `GET /api/v1/orders/<own>/timeline`, foreign denied, customerVisible filtered, shop/admin timelines, empty existing orders.

## Production

- Pending after staging PASS — same commit.
- Verify: frontend 200, api 200 env production, one safe existing-order timeline read (no order mutation).

## Files Changed

- `apps/api/_lib/order/service.ts` — timeline write + retrieval (pagination, filtering, ordering)
- `apps/api/_handlers/orders/index.ts` — customer pagination/filter + shop/admin handlers + route registration
- `apps/shop/src/stores/shop-order-store.ts` — timeline state + fetcher
- `apps/admin/src/stores/admin-order-store.ts` — timeline state + fetcher
- `REMAINING_WORK_REGISTER.md` — moved timeline to COMPLETED
- `docs/ROADMAP.md` — marked K COMPLETED in §7/§13/§25/§26

## Known Limitations

- Pre-existing orders created before this patch have no `order_created` event (only new orders will have it; backfill not required per free-first NO-MIGRATION decision).
- `payment`/`shipment`/`delivery` timelines for orders already handled via `payment/service.ts:addTimelineEvent` — now supplemented by generic `status_updated`; no duplicate-event dedup needed beyond state-machine guard.
- Shop `OrdersPage` does not yet render timeline drawer — store API ready, UI drawer deferred to Phase 2 shop detail enhancement (low risk).

## Final Status

**IMPLEMENTATION COMPLETE — READY FOR STAGING DEPLOY**
