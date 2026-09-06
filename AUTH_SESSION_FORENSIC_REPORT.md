# AUTH SESSION FORENSIC REPORT — NABOME P0-A

Date: 2026-09-06 (UTC). Baseline: `59036e8` + uncommitted auth fix (see
`AUTH_SESSION_EXPIRATION_FORENSIC_AND_FIX_REPORT.md`).

## 1. Auth flow map

- Login: `POST /auth/login` → `apps/api/_handlers/auth/index.ts:handleLogin` →
  `services-v1.login` (bcrypt verify, DB `Session` create, max 5 sessions, oldest
  revoked). Sets `access_token` (15 min), `refresh_token` (7d, 30d w/ rememberMe),
  `csrf_token` (4h) cookies: `Path=/; HttpOnly(access/refresh); Secure;
  SameSite=None`, host-only. Returns `{user, session, csrfToken}` JSON.
- Requests: `access_token` cookie (or Bearer) verified HS256
  (iss `nabome-api`, aud `nabome-clients`) in `_middleware` → `context.userId/sessionId`.
- Refresh: `POST /auth/refresh` → `handleRefresh` accepts `refresh_token` cookie
  (CSRF double-submit or allowlisted-Origin) or Bearer; `refreshSession` verifies
  JWT, matches SHA-256 session row, rotates all three tokens, preserves
  `rememberMe` expiry. Logout: revokes row, clears cookies incl. legacy Lax variants.
- Frontend: zustand profile-only store (`nabome-auth`), `credentials:include`
  fetch client with single-flight refresh-and-retry, `SESSION_EXPIRED_EVENT`
  listener → clear + redirect (guest paths exempted).

## 2. Root causes of unexpected logout

1. (Pre-existing, fixed in worktree, NOT deployed) Dead cookie refresh path,
   `SameSite=Lax` cross-site, wrong CSRF cookie name, reload-wiped auth flags —
   full detail in `AUTH_SESSION_EXPIRATION_FORENSIC_AND_FIX_REPORT.md`.
2. (Fixed here) `shop`/`admin` API clients had NO refresh/retry: any 401 →
   immediate session-expired event. Same 15-min logout bug as customer pre-fix.
3. (Fixed here) `shop`/`admin` `partialize` persisted `{user}` only → every
   reload reset `isAuthenticated=false` → instant redirect to `/login`.
4. (Fixed here) No startup bootstrap anywhere: fresh browser profile with a
   valid cookie session was treated as guest and bounced to `/login` on any
   protected route. Guards had no loading state.

Remember-me: functional (checkbox → `rememberMe` → 30d session + cookie,
preserved across refresh via JWT claim). Not cosmetic.

## 3. Exact fix (this change)

- `apps/shop|admin/src/lib/api/client.ts`: ported single-flight
  `refreshSession()` + retry-once + `skipRefresh`, memory CSRF + `setCsrfToken`.
- `apps/shop|admin/src/lib/api/session.ts` (new): expiry listener + `bootstrapSession()`.
- `apps/{customer,shop,admin}/src/stores/auth-store.ts`: persist
  `isAuthenticated`+`status`; initial `status:'idle'`; added `setLoading()`.
- `apps/customer/src/lib/api/session.ts`: added `bootstrapSession()` (raw fetch,
  never dispatches the global 401 event, refresh-once on 401) + reset in test helper.
- Guards (`ProtectedRoute`, `GuestRoute`, `ShopRoute`, `AdminRoute`): render
  `Loading…` while `status` is `idle`/`loading` instead of redirecting.
- `*/app/main.tsx`: `initSessionListener()` + `void bootstrapSession()` at startup.
- `routes.test.tsx`: `beforeEach(clearUser)` so guest-redirect tests assert the
  genuine-guest path, not the bootstrap-loading path.

No never-expiring JWT, no localStorage secrets, HttpOnly/CSRF/RBAC/tenant paths untouched.
Refresh failures still clear auth + redirect; 5xx/network never touch auth state.

## 4. Security implications

- Cookie refresh still requires CSRF double-submit unless Origin is allowlisted
  (browser-enforced). Bootstrap uses GET-only, no state change, no event side effects.
- Multi-tab: rotation replaces the hashed refresh token; concurrent 401s share one
  refresh promise (single-flight) so tabs don't invalidate each other. A tab holding
  a pre-rotation cookie that already rotated will fail refresh → clean re-login
  (fail-closed, acceptable; reuse detection beyond row-match is future work).

## 5. Tests performed

- customer: 169 passed (incl. 3 new bootstrap tests). api: 101 passed.
  shop: 84 passed. admin: 4 passed.
- typecheck clean (customer/shop/admin/api); production builds pass (all four).
- eslint: 0 errors on changed files (1 pre-existing warning).
