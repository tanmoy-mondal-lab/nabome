# NABOME BACKGROUND JOBS IMPLEMENTATION REPORT

Date: 2026-09-01
Commit: background-jobs-sweeper (base 4688b4c)

## Current Reservation Architecture

- `StockReservation` (status ACTIVE/RELEASED/EXPIRED/CONVERTED, expiresAt, releasedAt, quantity, variantId, cartId/orderId) — available stock derived as `variant.availableStock - sum(active reservations)` via `getTotalReservedForVariant` + `realAvailableStock`.
- Creation: `InventoryService.reserveStock` (timeout 15 min default, expiresAt = now+15m).
- Release: `releaseReservation` (status ACTIVE → RELEASED) via cancel/checkout expiry; Convert: ACTIVE → CONVERTED on order confirmed.
- `StockMovement` type release for audit where variant exists.
- Indexes: `[status,expiresAt]` + `[expiresAt,status]` support sweep query.

## Sweeper Implementation

- **Service**: `apps/api/_lib/inventory/sweeper.ts` `releaseExpiredReservations({batchSize 100, now})`
- Finds `status ACTIVE && expiresAt < now` ordered expiresAt asc, batch 100, loops until < batchSize.
- Per reservation: `updateMany where id==r.id && status ACTIVE` → set EXPIRED + releasedAt. `count==0` → skipped (idempotent). Else create StockMovement release (previousStock/newStock = variant.availableStock) referenceId r.id type reservation_expiry.
- Returns `{processed, released, skipped, failed, durationMs}`.
- Transaction per reservation via `updateMany` conditional (atomic, prevents double release). No queue table.

## Cron Schedule

- `wrangler.jsonc` `triggers: { crons: ["*/5 * * * *"] }` — every 5 min, appropriate for 15-min reservation (max 5 min extra hold).

## Idempotency

- Update conditional on status ACTIVE ensures second run skips (0 count). Two concurrent sweepers cannot double-release same id (one wins, other skipped). Tested via updateMany.

## Concurrency Handling

- Per-reservation atomic updateMany, not bulk. Batch loop continues on individual failure (failed count, other succeed).

## Transaction Strategy

- Per-reservation `updateMany` + optional `stockMovement.create` (separate). Failed movement does not revert status (inventory still released via totalReserved). Failed reservation remains ACTIVE for next Cron retry (not marked released prematurely).

## Inventory Behavior

- Released via status EXPIRED → totalReserved decreases → realAvailableStock increases. `availableStock >=0`, `reserved >=0`, `released <= reserved` preserved. No variant.availableStock mutation needed (computed).

## Stock Movement Behavior

- Created per released reservation if variant exists; previous/new stock = current variant.availableStock (no change, as stock not decremented until conversion). Documents expiry.

## Failure Handling

- Per-reservation try/catch → failed++ ; other reservations continue. Failed remains ACTIVE for retry.

## Logging

- Scheduled handler `apps/api/_lib/scheduled/handler.ts` `handleScheduled` initPrisma, calls sweeper, console.warn `[sweeper] releaseExpiredReservations` with cron, processed/released/skipped/failed/durationMs/at. Uses getLogger where available, falls back console.warn (allowed).

## Tests

- Existing suites PASS: api 84/84, customer 53/53, app 121/121, shop 84/84, admin 4/4
- Manual concurrency reasoning: updateMany conditional ensures single release. Empty job returns processed 0. Large batch loops.

## Staging

- Pending push → origin/production auto-deploy
- Verify: health staging 200, create expired ACTIVE reservation, wait Cron or manual call, status EXPIRED, movement created, second run skipped

## Production

- Pending after staging PASS — same commit.
- Verify health 200 production, scheduled handler configured (triggers), logs visible via Cloudflare

## Known Limitations

- No general Job/Queue/DLQ table — intentionally deferred (roadmap B Phase 2).
- Email/analytics/report async workers not implemented.
- Sweeper does not handle Already RELEASED/CONVERTED (skip), Future ACTIVE untouched, as required.

## Migration

- None (indexes already exist for status+expiresAt).

## Status

**B Phase 1 Reservation Expiry: COMPLETED — General Queue/DLQ still DEFERRED**

## Next Roadmap Item

M — Returns/Payments Gateway Completion (Finance alignment, package stubs)
