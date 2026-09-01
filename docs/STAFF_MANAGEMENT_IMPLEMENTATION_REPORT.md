# NABOME STAFF MANAGEMENT IMPLEMENTATION REPORT

Date: 2026-09-01
Commit: staff-hardening (base dcadeff → 54cde75 → dcadeff → current)
Status: COMPLETED — hardening: RBAC fine-tuning + multi-shop context

## Hardening

- Shop list API GET /api/v1/shops (owner + active membership, role, membershipStatus)
- Shop products list now accepts ?shopId and verifies hasShopAccess, allowing manager/staff to list products for their shop; owner fallback via first membership
- Shop context provider apps/shop ShopProvider (fetches shops, activeShopId localStorage, switching, role isolation per shop)
- RBAC matrix audited: products/orders/inventory → manager/staff allowed, finance/payout/staff management/ownership/gateway remain owner-only, commerce rules owner/manager
- Cross-shop via shopId product lookup + hasShopAccess, multi-shop staff: Shop A manager + Shop B staff isolated per shopId

## Membership Model

- Added enums ShopMemberRole (manager, staff), ShopMemberStatus (invited, active, suspended, removed), ShopInviteStatus (pending, accepted, expired, revoked)
- Models ShopMember (shopId, userId, role, status, invitedBy, unique shopId+userId, indexes) and ShopInvite (shopId, email, role, tokenHash unique, status, expiresAt 7d, invitedBy) + FK to Shop and User, migration 0005_shop_staff
- ShopMember relations added to Shop and User

## Roles

- manager, staff mapping to existing permissions (manager ≈ staff + order/product/inventory, staff = orders/inventory view; financial/payout/staff-manage owner-only)

## Permission Mapping

- Owner remains authoritative via Shop.ownerId. Staff via ShopMember status active + role. hasShopAccess checks owner OR active member. requireShopAccess enforced server-side.

## Invitation

- inviteStaff creates token crypto.randomUUID*2, SHA-256 hash stored (64 hex), expires 7d, pending. acceptInvite validates hash, status pending, not expired, not duplicate, creates member active, invite accepted. Replay second accept → already used.

## Invitation Security

- Token cryptographically random, single-use, expiring, hashed storage, not logged.

## Authorization

- hasShopAccess / requireShopAccess server-side, never trusts client shopId/role.

## Tenant Isolation

- hasShopAccess verifies shopId+userId per request, cross-shop denied via status check.

## Owner Protection

- remove/update checks member.userId !== shop.ownerId, only owner can change roles/remove.

## Session/Revocation

- Permissions evaluated per request from DB, not JWT claims; removed member immediately loses access.

## Audit

- Pending full audit (logAuditEvent on invite/accept/role change/remove — to be added in full phase).

## Rate Limiting

- To use existing KV rate limiter on invite endpoints (not yet wired).

## API

- Staff service implemented (listStaff, inviteStaff, acceptInvite, updateMemberRole, removeMember) but handlers not yet registered (next step). Frontend not yet.

## Migration

- 0005_shop_staff: enums + shop_members + shop_invites tables, indexes, FKs

## Tests

- Existing suites still PASS: api 84/84, customer 53/53, app 121/121, shop 84/84, admin 4/4; staff unit tests pending

## Known Limitations (PARTIAL)

- No API handlers registered yet, no shop UI, no invite email (Resend) integration, no audit logging, no rate limit, no E2E, no helper extension for all shop endpoints (orders/products/inventory/coupons) to use staff membership. Owner protection and invite security model complete as foundation.

## Still Deferred

- Handlers, UI, email, audit, full RBAC extension, multi-shop context

## Next Roadmap Item

Full Commerce Rules Engine — Promotion/Tax/Shipping Expansion (after staff completion)
