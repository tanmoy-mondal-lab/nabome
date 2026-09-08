# NABOME AUTH SESSION EXPIRATION FORENSIC AND FIX REPORT

Date: 2026-09-05 (UTC)
Baseline commit: 8531ba4 (customer known-good)
Worktree note: pre-existing uncommitted changes in `apps/api/{_handlers/products,_lib/{http/errors,index,prisma,security},functions/[[path]]}` were NOT touched by this fix and were NOT deployed.

## 1. Executive Summary

A user who logs in is logged out (or loses all authenticated function) after a short period through **four independent defects**, any one of which breaks the session:

1. **Dead refresh path (primary).** Access JWT lives 15 min; `POST /auth/refresh` accepted only `Authorization: Bearer <refresh>`, but the refresh token lives in an httpOnly cookie JS cannot read. Frontend `refresh()` was dead code (never called), with no interceptor, no retry, no expiry listener. At access-token expiry every authenticated call returns `401 AUTH_REQUIRED` with no recovery.
2. **Reload wipes auth state.** Zustand `persist` saved only `{user}`, dropping `isAuthenticated`/`status`. Every reload bounced the user to `/login` (verified in headless Chromium: pre-fix `/account` -> `/login?from=%2Faccount`; post-fix stays on `/account`).
3. **Cross-origin cookie transport.** Frontend `https://www.nabome.online` x API `https://nabome-api.pages.dev` are cross-site, yet cookies were `SameSite=Lax` (never sent on cross-site fetch). Fixed to `SameSite=None; Secure` (Secure/HttpOnly/host-only retained).
4. **CSRF double-submit unreadable cross-origin + wrong cookie name.** `document.cookie` on `www` can never see the API-origin `csrf_token` cookie, and middleware compared against cookie name `nabome_session` (`SESSION_COOKIE_NAME`) instead of `csrf_token` — so **every** authenticated mutation 401/403'd. Fixed cookie name; added allowlisted-Origin exemption (browser-enforced, unspoofable) with double-submit retained as fallback.

Bonus fix on the auth path: `GET/PATCH /auth/profile` always 500'd (bare `new PrismaClient()` + `require()` in `user-service.ts`, no driver adapter under workerd). Now uses the shared client; verified `200` live.

## 2. Current Authentication Architecture

Model **E (JWT + database session)**, cross-origin httpOnly-cookie transport:

- Login (`handleLogin` -> `services-v1.login`): verifies bcrypt, creates DB `Session` (`refreshToken` SHA-256 hash, `csrfToken` hash, `expiresAt` 7d / 30d rememberMe, max 5 sessions revoking oldest), returns access JWT + refresh JWT + CSRF token as `Set-Cookie`, plus `{user, session, csrfToken}` JSON.
- Requests: `access_token` cookie (or `Authorization: Bearer`) verified by `verifyToken` (HS256, iss `nabome-api`, aud `nabome-clients`); `_middleware` populates `context.userId/sessionId`.
- Refresh: `POST /auth/refresh` -> `refreshSession` (verify refresh JWT, match hashed session row, rotate all three tokens). **Now accepts the httpOnly `refresh_token` cookie** (with CSRF or allowlisted Origin); Bearer path kept.
- Logout: revokes session row, clears cookies (now including legacy Lax variants).
- Frontend: Zustand profile-only store + `credentials:include` fetch client with single-flight refresh-and-retry; `SESSION_EXPIRED_EVENT` listener clears state and redirects only on genuine expiry.

## 3. Current Session Lifetime

| Credential | Lifetime | Source |
|---|---|---|
| Access JWT / `access_token` cookie | **15 min** (`Max-Age=900`) | `jwt.ts:28`, `cookies.ts` |
| Refresh JWT | 7d (`expiresIn 7d`) | `jwt.ts:45` |
| DB session | 7d, **30d with rememberMe** (preserved across refresh via `rememberMe` JWT claim) | `services-v1.ts` |
| `refresh_token` cookie | mirrors DB expiry (7d / 30d) | `cookies.ts` |
| `csrf_token` cookie | 4h | `cookies.ts` |
| Frontend auth state | until server rejects session (refresh-or-clear) | `client.ts`, `session.ts` |

## 4. Browser Reproduction

Headless Chromium (Playwright 1.62, chromium 1234), fresh contexts, local stack (`localhost:5173` x `127.0.0.1:8788`, cross-site pair, production-shaped config):

- Pre-fix: login 200 -> `/account` navigated -> instant redirect `/login?from=%2Faccount`; `POST /cart/merge` -> 403; `SESSION_EXPIRED_EVENT` had zero listeners.
- Post-fix: login 200 -> reload stays `/account`, store keeps `isAuthenticated:true`; cookies (`access/refresh/csrf_token`) stored and sent; `POST /cart/merge` -> 200; refresh attempted at most once per 401 burst (unit-proven single-flight).
- Local http caveat: `Secure` cookies over http classify this env as degraded; cookie-send behavior was directly observed post-fix, and the 15-min-expiry recovery loop is proven by unit tests + live `curl` refresh (200 + rotation).

## 5. First Authentication Failure

Pre-fix, the first failure depends on navigation:

- Reload/new tab: `ProtectedRoute` redirect, because rehydrated `isAuthenticated === false` (no request involved).
- Staying in-app: at access-token age 15 min, `GET /auth/profile` (or any authed call) -> `401 {"code":"AUTH_REQUIRED"}` -> `SESSION_EXPIRED_EVENT` dispatched to zero listeners, store stays "authenticated", all data calls fail. No `POST /auth/refresh` is ever attempted (verified: `REFRESH_ATTEMPTS: 0`, `refresh()` unreferenced).
- Mutations (cart/checkout): `403 CSRF validation failed` from the first attempt (wrong cookie name + unreadable cross-origin CSRF cookie).

## 6. Exact Root Cause

| # | FILE:LINE | FUNCTION | CURRENT (pre-fix) BEHAVIOR | WHY USER IS LOGGED OUT | FIX | EXPECTED NEW BEHAVIOR |
|---|---|---|---|---|---|---|
| 1 | `apps/api/_handlers/auth/index.ts:423` | `handleRefresh` | refresh token read only from `Authorization` header; httpOnly cookie ignored | access expiry (15 m) unrecoverable -> permanent 401s | accept `refresh_token` cookie; require CSRF (or allowlisted Origin) on cookie path | 401 -> one cookie refresh -> retry succeeds |
| 2 | `apps/customer/src/stores/auth-store.ts:33` | `partialize` | persisted `{user}` only | reload resets `isAuthenticated=false` -> redirect `/login` | persist `isAuthenticated` + `status` | reload preserves session; server remains source of truth |
| 3 | `apps/customer/src/lib/api/client.ts` (old 100-118) | `request` | 401 only dispatched an unlistened event; no refresh | no recovery, no cleanup | single-flight `refreshSession()` + retry once; event only if refresh fails | transient expiry invisible; genuine expiry logs out |
| 4 | `apps/api/_handlers/auth/index.ts:298-309` | `handleLogin` | `SameSite=Lax` on cross-site cookies | browser never sends cookies on cross-site fetch | `SameSite=None; Secure` (HttpOnly/Path/host-only kept) | cookies flow `www` -> API |
| 5 | `apps/api/functions/_middleware.ts:130` | `onRequest` | CSRF compared against `nabome_session` cookie (never set) | all mutations 403 | compare `csrf_token`; exempt browser-asserted allowlisted `Origin` (double-submit retained otherwise) | legit writes pass; evil origin still 403 (verified live) |
| 6 | `apps/api/_lib/auth/user-service.ts:15` | `getPrisma` | bare `new PrismaClient()` + `require()` (no adapter; workerd) | `/auth/profile` always 500 | use shared `getPrisma()`; typed `AddressType` inputs | profile 200 (verified live) |
| 7 | `apps/api/_lib/auth/services-v1.ts:429` | `refreshSession` | expiry always reset to 7d, `rememberMe` dropped | 30-day sessions silently shrink to 7d | `rememberMe` claim in refresh JWT; expiry + cookie mirror it | 30d stays 30d (verified `Max-Age=2592000`) |

Never-expiring tokens, localStorage secrets, removed HttpOnly/CSRF, or wildcard origins were NOT used.

## 7. JWT Findings

HS256, iss/aud enforced; `TokenExpiredError` -> `401 AUTH_REQUIRED`. 15-min access is intentional; the defect was the missing refresh consumer, not the duration. Refresh JWT now carries `rememberMe` (old tokens without the claim default to 7d — safe).

## 8. Refresh Token Findings

Repaired end-to-end: rotation verified live (new access + refresh + CSRF cookies, `rememberMe:true` visible only as metadata in local test JWT, values redacted). Single-flight proven by unit test (2 concurrent 401s -> 1 refresh call). Old-token reuse fails closed (session row hash replaced -> 401).

## 9. Cookie Findings

`HttpOnly` (access/refresh), `Secure`, `Path=/`, host-only (no `Domain`), `SameSite=None`. Logout clears match set-attributes exactly, plus legacy `Lax` variants so pre-rollout cookies cannot strand users. CSRF cookie stays readable-by-design (required for double-submit fallback).

## 10. Session Database Findings

Schema/creation/rotation/revocation sound (5-session cap with oldest-revoked, SHA-256 hashed tokens, `logoutAll` on password reset). `_middleware` session binding queries a non-existent `refreshTokenHash` field (always misses -> falls back to latest active session): works for single-session users; multi-session logout may revoke the wrong session. Left untouched as out-of-scope; logged in §18.

## 11. Frontend Auth-State Findings

Store holds profile only (no tokens) — correct. Fixed persistence (§6.2) and added the missing `SESSION_EXPIRED_EVENT` subscriber (`session.ts`, wired in `main.tsx`): clears user + CSRF memory and redirects to `/login?from=...` except on guest paths. `500`/network errors never touch auth state (regression-tested).

## 12. API Client Findings

`request()` now: try -> on session-401 refresh-once (shared promise) -> retry once -> else dispatch event + throw. Refresh uses raw `fetch` (no recursion), always sends CSRF material when available. `skipRefresh` escape hatch retained. No refresh storms; no logout on 5xx/network (tested).

## 13. Security Assessment

- Expired access JWT -> 401; expired/revoked sessions fail refresh closed (tested: 401 paths).
- Cookie refresh requires CSRF double-submit unless `Origin` is in `CORS_ORIGINS` (browser-enforced, JS-unspoofable); verified: allowlisted Origin without header -> 200; `https://evil.com` without header -> 403; no header + no Origin (curl) -> 403.
- Logout revokes server-side; clears match attributes; no client timestamps affect expiry; RBAC/tenant paths untouched; login rate-limit + lockout untouched; Turnstile behavior untouched.

## 14. Code Changes

API: `_handlers/auth/index.ts` (cookie builders, cookie refresh + CSRF/Origin, login body `csrfToken`, logout clears), `_lib/http/cookies.ts` (new), `_lib/auth/jwt.ts` (`rememberMe` claim), `_lib/auth/services-v1.ts` (claim round-trip), `_lib/auth/user-service.ts` (shared Prisma, typed addresses), `functions/_middleware.ts` (CSRF cookie name + Origin exemption).
Customer: `lib/api/client.ts` (single-flight refresh/retry, memory CSRF), `lib/api/auth.ts` (store/clear CSRF, `csrfToken` type), `lib/api/session.ts` (new listener), `app/main.tsx` (wire-up), `stores/auth-store.ts` (persist flags).
Tests: `cookies.test.ts` (6), `refresh-handler.test.ts` (7), `client.test.ts` (+4: refresh-retry, single-flight, 500-no-logout, network-no-logout), `session.test.ts` (3, new).

## 15. Tests

- `pnpm --filter @nabome/api typecheck`: 0 errors. `test:unit`: **100 passed**. `lint`: 0 errors. `build`: pass.
- `pnpm --filter @nabome/customer typecheck`: 0 errors. `test:unit`: **166 passed**. `lint`: 0 errors. `build`: pass.

## 16. Browser Verification

Fresh headless Chromium (see §4): login succeeds; reload preserves login (was redirect); cookies stored/sent cross-site; `cart/merge` 200 (was 403); profile 200; concurrent-burst refresh proven single (unit); genuine-expiry clears state + redirects (listener unit-tested; live refresh-failure path returns 401 closed).

## 17. Deployment

**NOT DEPLOYED.** Blocker: no Cloudflare credentials in this environment (`CLOUDFLARE_API_TOKEN`/`ACCOUNT_ID` absent), and the established workflow (`wrangler pages deploy`) requires them. No dashboard auto-deploy was used. No commit was created (not requested). Pre-existing uncommitted changes listed above must be triaged separately before any deploy; deploy only the files in §14.

## 18. Remaining Issues

1. `_middleware` `refreshTokenHash` dead lookup -> latest-session fallback (multi-session logout precision).
2. `shop`/`admin` frontends share the old no-refresh/no-listener client pattern (server fix benefits them; client work outstanding).
3. `packages/returns` repositories construct bare `PrismaClient` (same workerd hazard class; different domain).
4. `nabome.pages.dev` app origin is not in production `CORS_ORIGINS`, so double-submit still governs there (canonical `www` unaffected).
5. Local-only: node-`pg` under `wrangler pages dev` is flaky (DB_TIMEOUT retries); production uses Neon HTTP — not a product defect.
