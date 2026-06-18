# Authentication Session Flow

## Token Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                   TOKEN LIFECYCLE                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐     ┌──────────┐     ┌──────────────┐          │
│  │  ISSUE  │ ──► │  ACTIVE  │ ──► │  REFRESH/    │          │
│  │ (login) │     │          │     │  EXPIRES     │          │
│  └─────────┘     └──────────┘     └──────┬───────┘          │
│                                          │                  │
│                    ┌─────────────────────┼──────────┐        │
│                    ▼                     ▼          ▼        │
│             ┌──────────┐         ┌──────────┐  ┌──────────┐ │
│             │ REFRESH  │         │ EXPIRED  │  │ LOGOUT   │ │
│             │ (rotate) │         │ (auto)   │  │ (manual) │ │
│             └────┬─────┘         └──────────┘  └────┬─────┘ │
│                  │                                   │       │
│                  ▼                                   ▼       │
│             ┌──────────┐                        ┌──────────┐│
│             │  NEW     │                        │ REVOKED  ││
│             │ SESSION  │                        │ + audit  ││
│             └──────────┘                        └──────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Session Data Model

```
AuthSession
├── id: UUID (PK)
├── profileId: UUID → Profile (FK)
├── accessToken: TEXT (unique, Supabase JWT)
├── refreshToken: TEXT (unique, Supabase refresh)
├── refreshTokenExpiresAt: TIMESTAMPTZ? (30-day TTL)
├── userAgent: TEXT?
├── ipAddress: VARCHAR(45)?
├── deviceName: VARCHAR(200)?
├── isActive: BOOLEAN (default true)
├── revokedAt: TIMESTAMPTZ? (audit trail)
├── rotatedFromSessionId: UUID? → AuthSession (self-ref FK)
├── lastActiveAt: TIMESTAMPTZ
├── expiresAt: TIMESTAMPTZ (access token expiry)
└── createdAt: TIMESTAMPTZ

Indexes:
  - (profileId, isActive)    — user's active sessions
  - (refreshToken)           — refresh lookup
  - (accessToken)            — logout lookup
  - (expiresAt)              — cleanup queries
  - (refreshTokenExpiresAt)  — expired refresh cleanup
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create account (Supabase + Profile) |
| POST | `/api/auth/login` | No | Password sign-in, create session, return tokens |
| POST | `/api/auth/refresh` | No | Rotate refresh token, return new pair |
| POST | `/api/auth/logout` | Yes | Revoke session, sign out from Supabase |
| GET | `/api/auth/me` | No | Current user profile (token-based) |
| PUT | `/api/auth/me` | Yes | Update profile fields |
| GET | `/api/auth/sessions` | Yes | List active sessions (masked IPs) |
| DELETE | `/api/auth/sessions/:id` | Yes | Terminate a specific session |
| POST | `/api/auth/forgot-password` | No | Send branded password reset email |
| POST | `/api/auth/reset-password` | No | Set new password (recovery token) |
| POST | `/api/auth/change-password` | Yes | Verify current, set new, revoke all sessions |

## Refresh Token Rotation

```
Initial login:
  AuthSession #1 { accessToken: A, refreshToken: R, isActive: true }

POST /api/auth/refresh { refreshToken: R }:
  ├── Validate R exists + isActive + !expired
  ├── Call Supabase setSession(accessToken=A, refreshToken=R)
  │   ├── Success → get new tokens (A', R')
  │   └── Failure → revoke Session #1 (revokedAt = now)
  │
  └── Transaction:
      ├── INSERT AuthSession #2 { refreshToken: R', rotatedFromSessionId: #1.id }
      └── UPDATE AuthSession #1 { isActive: false, revokedAt: now }

  Return { accessToken: A', refreshToken: R', expiresAt }
```

### Rotation Chain Properties
- Each refresh creates a new session record; old one is marked `revokedAt`
- `rotatedFromSessionId` creates a linked list: `#3 → #2 → #1`
- If an old, revoked refresh token is presented, it's rejected (no replay)
- If Supabase rejects the refresh, the session is immediately revoked (no dangling)

## Client-Side Flow

### Startup / Page Load
```
1. Zustand persist rehydrates from localStorage
2. useAuth() effect runs:
   a. If accessToken exists, but user is null → call GET /api/auth/me
      - Success → setUser(), isLoading=false
      - Failure → clearAuth(), isLoading=false
   b. If accessToken + user both exist → isLoading=false
   c. If nothing → isLoading=false
3. ProtectedRoute reads isLoading + isAuthenticated
   - isLoading=true → spinner
   - !isAuthenticated → redirect to /auth/login
   - isAuthenticated → render children
```

### API Request
```
1. client.ts reads accessToken from localStorage
2. Sets Authorization: Bearer <token>
3. Fires fetch()
4. On 401:
   a. If not already refreshing:
      - Set isRefreshing=true
      - POST /api/auth/refresh { refreshToken }
      - On success: update localStorage tokens, retry original request
      - On failure: clearAuth(), dispatch auth:logout event
   b. If already refreshing:
      - Wait for existing refreshPromise
      - If refreshed: retry with new token
      - If failed: throw SessionExpired error
5. On 204: return empty object
6. On error: throw ApiError
```

### Proactive Refresh Timer
```
1. useAuth() sets up setInterval(checkAndRefresh, 30_000)
2. On each tick, and immediately on mount:
   a. Check if refreshToken exists && expiresAt exists
   b. Calculate timeUntilExpiry = expiresAt - now (seconds)
   c. If timeUntilExpiry > 60s → skip (still fresh)
   d. If timeUntilExpiry <= 60s → call POST /api/auth/refresh
      - Success → setTokens(new tokens in store)
      - Failure → clearAuth() (session truly expired)
```

## Session Expiry Scenarios

| Scenario | Behavior | UX |
|----------|----------|-----|
| Token expires during active use | 401 → auto-refresh → retry | Transparent |
| Token expires while tab is backgrounded | On focus: API call triggers 401 → refresh → retry | Transparent |
| Token + refresh both expired | 401 → refresh fails → `clearAuth()` + `auth:logout` → user sees login page | Must re-login |
| Logout from another device | Supabase issues new token on login; old token invalidated silently | Transparent |
| Admin signs out all sessions | Next API call → 401 → refresh fails → must re-login | Must re-login |
| Password changed | All sessions revoked via `supabase.auth.admin.signOut(userId)` → next call fails | Must re-login (shown in UI) |
| localStorage cleared | No token found → `isAuthenticated: false` → redirect to login | Must re-login |

## Session Cleanup Strategy

### Current (no scheduled cleanup)
- `AuthSession` rows accumulate indefinitely
- `expiresAt` and `refreshTokenExpiresAt` allow queries to identify stale records

### Recommended (post-launch)
- Add a daily cron/edge function to:
  ```sql
  DELETE FROM auth_sessions
  WHERE isActive = false
    AND revokedAt IS NOT NULL
    AND revokedAt < NOW() - INTERVAL '90 days';
  ```
- Archive rotation chains older than 90 days
- Keep `LoginAttempt` records for 1 year (security audit)

## Verification Checklist

### Customer Auth
- [x] Register → profile created + email verification
- [x] Login → tokens returned + AuthSession created
- [x] Protected page (/account) → loads with valid token
- [x] Token expiry → auto-refresh → page stays functional
- [x] Manual logout → session revoked → redirected to login
- [x] Password reset → branded email sent with recovery link
- [x] Multiple sessions → listed in account settings → can terminate individually

### Admin Auth
- [x] Login as super_admin → isAdmin=true
- [x] Admin route (/admin/dashboard) → renders
- [x] Non-admin trying admin route → redirected to /
- [x] Admin API endpoints without admin role → 403 Forbidden
- [x] Admin session expiry → refresh → still admin

### Protected Routes
- [x] `{ auth: true }` route without token → 401
- [x] `{ admin: true }` route without token → 401
- [x] `{ admin: true }` route with customer role → 403
- [x] `{ auth: false }` public route → accessible without token
- [x] Client `ProtectedRoute` → loading spinner while checking
- [x] Client `AdminRoute` → redirects non-admin to /
