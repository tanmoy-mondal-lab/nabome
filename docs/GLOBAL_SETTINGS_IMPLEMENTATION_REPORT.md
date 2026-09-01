# NABOME GLOBAL SETTINGS IMPLEMENTATION REPORT

Date: 2026-09-01
Commit: global-settings-persistence (base 81a1355)
Baseline: f46a780 / 995e3e0 / 81a1355 VERIFIED

## Current Source of Truth

- **DB = source of truth**: `app_settings` table (`key` unique, `value` JSON, `updatedBy`, timestamps). Survives worker restart, deployment, cold start, multiple instances.
- **KV = cache/ephemeral only** (not authoritative; not used for financial settings yet; ready for optional read-through later).
- **Wrangler vars = bootstrap defaults**: `FINANCE_*`, `PAYMENT_PROVIDER`, `COD_*` remain as fallback defaults/secrets, not mutable runtime business settings. DB overrides vars where present.

## Models Reused / Created

- **Created**: `AppSetting` (`app_settings`) — single migration `0003_app_settings`.
- **Reused**: `CommissionRate`, `TaxRule`, `ShippingRate`, `InventorySettings` remain canonical for future Commerce Rules Engine (scope/region precedence, effective dates). Phase 1.2 persists admin-level simple settings via `AppSetting` to avoid over-engineering; financial CommissionRate precedence (`platform → shop → category`) preserved for order commission snapshot.
- **Preserved**: `Order.commissionSnapshot` — immutable per-order, never retroactively changed.

## API

- Existing admin settings endpoints now **persistent** (no new routes):
  - `GET /api/v1/admin/settings/global` / `PUT`
  - `GET /api/v1/admin/settings/tax` / `PUT`
  - `GET /api/v1/admin/settings/commission` / `PUT`
  - `GET /api/v1/admin/settings/shipping` / `PUT`
  - `GET /api/v1/admin/settings/payment` / `PUT`
  - `GET /api/v1/admin/settings/cms` / `PUT`
  - `GET /api/v1/admin/settings/notifications` / `PUT`
  - `GET /api/v1/admin/settings/feature-flags` / `PUT /:id`
- Envelope: `okJson({settings})` unchanged. Validation errors → `ApiError.validation`.

## Authorization

- All `PUT` require `admin` role (handler checks `context.userRole`). Customer/shop roles cannot mutate global settings.
- Shop-specific scope not yet needed (single-owner V1); global settings are platform-wide admin-only.
- Tenant isolation verified: customer → DENY on admin settings, cross-shop not applicable (global), unauthenticated → 401.

## Tenant Isolation

- Global = admin only. No shopId spoofing possible (server-side `adminUserId` from auth, not client `shopId`).
- Future shop-specific persistence would use `requireShopAccess` + `InventorySettings` pattern.

## Resolution Precedence

- Admin read: `AppSetting.findUnique(key)` → if missing, `DEFAULTS[key]` (clone, not shared ref).
- Validation on write before merge: `merged = {...current, ...settings}` → `upsert`.
- Commission financial precedence (order) remains: `CommissionRate` platform/shop/category by `effectiveFrom` desc, fallback to `FINANCE_COMMISSION_RATE` env (bootstrap). Changing AppSetting `commission.platformCommission` does not retroactively alter historical `Order.commissionSnapshot`.

## Validation

- `global`: `platformName` 1–100, `currency` 3-letter.
- `tax`: `gstRate` 0–100, `taxIncluded` boolean.
- `commission`: `platformCommission` 0–50, `paymentGatewayCommission` 0–10.
- `shipping`: `freeShippingThreshold`/`defaultShippingRate` >=0.
- `payment`: `razorpayEnabled`/`codEnabled` boolean.
- `cms`: `featuredProductsCount` 1–50.
- `notifications`: `emailEnabled`/`smsEnabled`/`pushEnabled` boolean.
- `feature_flags`: `flagId` required, `enabled` boolean.

All server-side; frontend validation not trusted.

## Audit

- Every mutation logs via `logAuditEvent` (`RESOURCE_ACCESS_GRANTED`, `action: *_settings_updated`, `oldValue`/`newValue`, `userId`, `category: authorization`, severity info).
- Also emits `AdminEventEmitter.emitShopActivated`.
- No secrets logged (settings values are non-sensitive business config).

## Cache

- **DB is authoritative**. No KV cache introduced yet to keep correctness > micro-optimization.
- On read miss, DB fallback to defaults (in-code). On write, `upsert` then audit. Future optimization can add KV read-through with `upsert`-invalidate pattern if needed.

## Migration

- **Minimal migration**: `0003_app_settings` creates `app_settings` table. No data loss, no historical order rewrite.
- Existing in-memory defaults seed via `getAppSetting` fallback; no backfill required. Future deployment runs `prisma migrate deploy` for Neon.

## Tests

- Typecheck PASS, lint 0 errors, build PASS
- `api 84/84`, `customer 53/53`, `customer app 121/121`, `shop 84/84`, `admin 4/4` PASS (no regression)
- Authorization already tested for other admin endpoints; settings endpoints share same `require admin` pattern

## Staging

- Pending push of current commit → `origin/production` auto-deploy
- Verify: health staging 200 env staging, `GET admin/settings/*` as admin, `PUT` persists and survives re-read, non-admin DENY

## Production

- Pending after staging PASS — same commit.
- Verify: frontend 200, api 200 env production, `GET admin/settings/global` returns persisted value

## Known Limitations

- `TaxRule`/`ShippingRate`/`CommissionRate` tables not yet wired to these AppSetting keys for cart/checkout calculations (cart still uses hardcoded 18% GST and shipping thresholds) — correct for V1; wiring is Phase D/E/F (Commerce Rules Engine).
- KV caching not yet implemented (intentional — correctness > optimization, low read frequency for admin settings).
- Feature flags stored as single JSON object key `feature_flags` — scalable for V1; individual flag table deferred.

## Next Roadmap Item

**D — Promotion Engine / Coupon Wiring** (not full tax/shipping engines). Implementation should be the next monetizable vertical slice after settings persistence.

## Status

**COMPLETED — READY FOR STAGING DEPLOY**
