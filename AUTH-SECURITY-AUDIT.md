# Authentication Security Audit

## Scope
Full-stack audit of নবME authentication: API (Supabase + Prisma), client (React + Zustand), route guards.

---

## Current Architecture

| Layer | Technology | Role |
|-------|-----------|------|
| Identity Provider | Supabase Auth | Password hashing, JWT signing, user CRUD |
| Session Tracking | Prisma `AuthSession` table | Maps Supabase tokens to local user sessions |
| API Auth Middleware | `api/_lib/auth.ts` | `authenticateRequest()` — Bearer token → Supabase `getUser()` |
| Enhanced Middleware | `api/_lib/auth-middleware.ts` | `authenticate()` — wraps auth + rate-limit + CSRF + role check |
| Client State | Zustand `useAuthStore` (persisted to localStorage) | `accessToken`, `refreshToken`, `expiresAt`, `user` |
| HTTP Client | `src/lib/api/client.ts` | Token injection, now with 401 → refresh intercept |
| Route Guard (client) | `ProtectedRoute` / `AdminRoute` | Client-side redirect, server enforces |
| Route Guard (server) | `[...path].ts` per-route `{ auth, admin }` flags | JWT validation + role check before handler |

---

## Implementation Status

### ✅ Implemented — Pre-Existing

1. **Password hashing** — Delegated to Supabase Auth (bcrypt)
2. **JWT signing/validation** — Delegated to Supabase Auth (HS256 with `SUPABASE_JWT_SECRET`)
3. **Server-side route guards** — 240+ routes with `{ auth: true }` or `{ admin: true }`
4. **Role-based access control** — `role: "customer" | "super_admin"` in `user_metadata`
5. **CSRF double-submit cookie** — All POST/PUT/DELETE on `/api/*` (except webhooks)
6. **Rate limiting** — Per-IP sliding window: auth 5/min, admin 30/min, standard 60/min
7. **Security headers** — CSP, HSTS, XFO, COEP, COOP, CORP, RP, PP
8. **Login attempt audit** — `LoginAttempt` table records every attempt with IP, UA, success/fail
9. **Session management UI** — `GET /api/auth/sessions`, `DELETE /api/auth/sessions/:id`
10. **Change password** — Verifies current password via sign-in, updates via admin API, signs out all sessions
11. **CORS whitelist** — Explicit origin allowlist

### 🆕 Implemented — This Audit

12. **Token refresh endpoint** — `POST /api/auth/refresh` with rotation
13. **Refresh token rotation** — Old session revoked, new session linked via `rotatedFromSessionId`
14. **Refresh token expiry** — `refreshTokenExpiresAt` field, 30-day TTL
15. **Revocation audit trail** — `revokedAt` timestamp on session records
16. **Client-side auto-refresh** — 401 interceptor in `client.ts` attempts refresh before failing
17. **Proactive refresh timer** — Checks every 30s, refreshes 60s before expiry
18. **Session expiry recovery** — On page load, if `accessToken` exists but no `user`, fetches `/me`
19. **Forced logout event** — `window.dispatchEvent(new CustomEvent("auth:logout"))` on failed refresh
20. **Routing dedup** — `refresh` route added to `[...path].ts` and dispatched in auth handler
21. **Duplicate store fix** — `src/storefront/stores/auth-store.ts` now re-exports main store

---

## Security Posture Summary

### Risk Matrix (Post-Fix)

| Severity | Count | Issues |
|----------|-------|--------|
| CRITICAL | 0 | — |
| HIGH | 2 | Access & refresh tokens in localStorage (XSS vector); In-memory rate limiter (resets on restart, no multi-instance) |
| MEDIUM | 2 | CSRF cookie not HttpOnly (design choice for SPA); Dual auth middleware (router uses older `auth.ts` without per-route CSRF) |
| LOW | 2 | Login attempt/ session creation errors silently swallowed; IPv6 IP masking returns raw value |
| INFO | 3 | Login payload validated (Zod), forgot/reset password not; `handleMe` redundantly authenticates; Logout could validate token ownership |

### HIGH — Token in localStorage
- **Risk**: XSS vulnerability → attacker reads `nabome-auth` key → full account takeover
- **Mitigation**: CSP restricts script-src (no inline, only trusted CDNs). SameSite cookies mitigate CSRF. HttpOnly cookies would be more secure but require OAuth flow redesign.
- **Recommendation (post-launch)**: Migrate to HttpOnly cookie-based sessions with CSRF token, or use WebAuthn/passkeys.

### HIGH — In-memory Rate Limiter
- **Risk**: Serverless cold starts reset counters. Multiple instances don't share state.
- **Recommendation (post-launch)**: Replace with Upstash Redis for distributed rate limiting.

---

## Key Security Flows

### Authentication Flow (Post-Audit)
```
Login →
  Anon Supabase signInWithPassword(email, password) →
  Return session { accessToken, refreshToken, expiresIn } →
  Create AuthSession record with tokens, IP, UA, device →
  Return session + profile to client →
  Client stores in Zustand localStorage →
  Redirect to dashboard

API Request →
  client.ts reads accessToken from localStorage →
  Sets Authorization: Bearer <token> →
  Server authenticatesRequest() → supabase.auth.getUser(token) →
  If valid, attach { userId, userRole } to context →
  Route handler executes

401 Response →
  client.ts interceptor fires →
  POST /api/auth/refresh { refreshToken } →
  Server finds AuthSession by refreshToken →
  Validates isActive + refreshTokenExpiresAt →
  Calls supabase.auth.setSession() →
  Supabase returns new accessToken, refreshToken, expiresIn →
  Transaction: create new AuthSession, revoke old (rotatedFromSessionId) →
  Return new tokens →
  Client updates localStorage →
  Retry original request with new accessToken

Expired Checks →
  On mount: useAuth checks accessToken exists but no user → calls /me
  Every 30s: proactive refresh timer checks expiresAt - now < 60s → calls refresh
  Failed refresh → clearAuth() + auth:logout event
```

### Logout Flow
```
Logout →
  POST /api/auth/logout →
  Server marks AuthSession isActive=false, revokedAt=now →
  Server calls supabase.auth.admin.signOut(userId) (invalidates all Supabase sessions) →
  Client clears localStorage (nabome-auth) →
  Redirect to login
```

---

## Files Changed

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `refreshTokenExpiresAt`, `revokedAt`, `rotatedFromSessionId`, self-referencing relation `SessionRotation` |
| `api/_handlers/auth.ts` | Added `handleRefresh` (full rotation logic); Enhanced `handleLogout` (adds `revokedAt`); Added `"refresh"` to switch |
| `api/[...path].ts` | Added `POST /api/auth/refresh` route |
| `src/stores/auth-store.ts` | Added `setTokens` action |
| `src/lib/api/auth.ts` | Added `refresh()` method |
| `src/lib/api/client.ts` | Complete rewrite: 401 interceptor, `attemptTokenRefresh()`, `setStoredTokens()`, `clearStoredAuth()`, dedup concurrent refreshes, `auth:logout` event |
| `src/hooks/useAuth.ts` | Added proactive refresh timer (30s interval), `auth:logout` listener, session restore logic |
| `src/storefront/stores/auth-store.ts` | Replaced with re-export of main store (eliminates duplicate localStorage writes) |
| `src/features/checkout/hooks/useCheckout.ts` | Fixed import to use main auth store |
| `src/features/customer/hooks/useCustomer.ts` | Fixed import to use main auth store |
| `src/storefront/components/DashboardSidebar.tsx` | Fixed `logout` → `clearAuth` for main store API |
| `src/storefront/pages/DashboardPage.tsx` | Fixed `user.name` → `user.firstName` |
