# JWT to HttpOnly Cookies Migration Plan

## Overview
This document outlines the migration plan for moving JWT tokens from localStorage to httpOnly cookies to address the critical security vulnerability identified in the security audit (CVSS 7.5 - HIGH RISK).

## Current State
- **Location:** `/src/stores/auth-store.ts`
- **Storage Method:** localStorage via Zustand persist middleware
- **Tokens Stored:** `accessToken`, `refreshToken`, `expiresAt`, `user`
- **Security Risk:** XSS attacks can steal tokens from localStorage

## Target State
- **Storage Method:** httpOnly cookies for refresh tokens, in-memory for access tokens
- **Security Benefits:** 
  - httpOnly cookies cannot be accessed via JavaScript (XSS protection)
  - Secure flag ensures HTTPS-only transmission
  - SameSite flag prevents CSRF attacks
  - Automatic cookie handling by browser

## Migration Architecture

### Backend Changes

#### 1. Cookie Configuration (`api/_lib/cookies.ts`)
```typescript
// Create new cookie management utility
export const COOKIE_CONFIG = {
  ACCESS_TOKEN: {
    name: 'access_token',
    httpOnly: false, // Access token needs to be accessible to JS for API calls
    secure: true,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  },
  REFRESH_TOKEN: {
    name: 'refresh_token',
    httpOnly: true, // Refresh token must be httpOnly
    secure: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  },
  CSRF_TOKEN: {
    name: 'csrf_token',
    httpOnly: false, // CSRF token needs to be accessible to JS
    secure: true,
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  },
};
```

#### 2. Auth Handler Modifications (`api/_handlers/auth.ts`)

**Login Endpoint:**
- Set httpOnly refresh token cookie
- Return access token in response body (for in-memory storage)
- Generate and set CSRF token cookie
- Return CSRF token in response body

**Register Endpoint:**
- Same as login for new registrations

**Refresh Endpoint:**
- Read refresh token from httpOnly cookie
- Validate and generate new access token
- Update refresh token cookie if needed
- Generate new CSRF token
- Return new access token and CSRF token

**Logout Endpoint:**
- Clear refresh token cookie
- Clear CSRF token cookie
- Invalidate session in database

**Me Endpoint:**
- Read access token from Authorization header (in-memory)
- Validate and return user data

#### 3. CSRF Protection Enhancement (`api/_lib/csrf.ts`)
- Ensure CSRF middleware validates tokens on all mutation endpoints
- Double-submit cookie pattern already implemented
- Add validation for cookie-based tokens

### Frontend Changes

#### 1. Auth Store Refactoring (`src/stores/auth-store.ts`)
```typescript
// Remove localStorage persistence
// Use in-memory storage for access token
// Read refresh token from cookies via API

interface AuthState {
  user: User | null;
  accessToken: string | null; // In-memory only
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Remove persist middleware
export const useAuthStore = create<AuthState>((set, get) => ({
  // ... existing state
  // Remove: persist middleware
}));
```

#### 2. API Client Modifications (`src/lib/api/client.ts`)
```typescript
// Add automatic token inclusion from in-memory store
// Add CSRF token inclusion from cookie
// Handle 401 responses with automatic token refresh

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Important for cookies
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  // Add CSRF token for mutation requests
  const csrfToken = getCookie('csrf_token');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    config.headers['x-csrf-token'] = csrfToken;
  }
  
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry original request
        return apiClient.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
```

#### 3. Cookie Utility (`src/lib/utils/cookies.ts`)
```typescript
// Utility to read cookies (for CSRF token)
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}
```

#### 4. Auth Flow Updates

**Login Flow:**
1. User submits credentials
2. API returns access token (body) and sets refresh token (cookie)
3. Store access token in memory (auth store)
4. CSRF token automatically set in cookie

**Token Refresh Flow:**
1. API client detects 401 error
2. Call refresh endpoint (uses refresh token from cookie)
3. API returns new access token and CSRF token
4. Update in-memory access token
5. Retry failed request

**Logout Flow:**
1. Call logout endpoint
2. API clears refresh token and CSRF cookies
3. Clear in-memory access token
4. Clear user data from auth store

## Migration Steps

### Phase 1: Backend Infrastructure (Priority: HIGH)
1. Create cookie management utility
2. Update auth handler to set cookies on login/register
3. Update refresh endpoint to read from cookies
4. Update logout endpoint to clear cookies
5. Test cookie-based auth flow with curl/Postman

### Phase 2: Frontend Infrastructure (Priority: HIGH)
1. Refactor auth store to remove localStorage persistence
2. Update API client to use in-memory tokens
3. Add cookie utility for CSRF token reading
4. Implement automatic token refresh logic
5. Update all auth-related components

### Phase 3: CSRF Protection (Priority: HIGH)
1. Ensure CSRF middleware validates on all mutation endpoints
2. Test CSRF protection with and without cookies
3. Verify double-submit cookie pattern works correctly

### Phase 4: Testing & Validation (Priority: HIGH)
1. Test complete auth flow (register, login, refresh, logout)
2. Test token expiration and refresh
3. Test CSRF protection
4. Test XSS resistance (verify tokens not accessible via JS)
5. Test cross-domain behavior
6. Load testing with cookie-based auth

### Phase 5: Deployment (Priority: HIGH)
1. Deploy backend changes first
2. Deploy frontend changes
3. Monitor for auth failures
4. Rollback plan ready

## Security Considerations

### XSS Protection
- httpOnly cookies cannot be accessed via JavaScript
- Access tokens in memory are cleared on page refresh
- Short-lived access tokens (15 minutes) limit exposure

### CSRF Protection
- SameSite=strict on refresh token prevents CSRF
- CSRF token validation on mutations
- Double-submit cookie pattern already implemented

### Token Security
- Refresh tokens: 7-day expiry, httpOnly, secure, SameSite=strict
- Access tokens: 15-minute expiry, in-memory only
- Automatic token rotation on refresh

### Session Management
- Server-side session invalidation on logout
- Multiple session support (device-specific refresh tokens)
- Session revocation capability

## Rollback Plan

If issues arise during migration:
1. Revert frontend to localStorage-based auth
2. Backend can support both cookie and header-based tokens temporarily
3. Feature flag to switch between auth methods
4. Monitor auth failure rates

## Testing Checklist

- [ ] Register new user with cookie-based auth
- [ ] Login existing user with cookie-based auth
- [ ] Token refresh on expiration
- [ ] Logout clears all cookies and memory
- [ ] CSRF protection blocks invalid requests
- [ ] XSS cannot steal httpOnly cookies
- [ ] Multiple sessions work correctly
- [ ] Mobile browsers handle cookies correctly
- [ ] Private/incognito mode works
- [ ] Cross-domain behavior correct
- [ ] Load testing with cookie auth
- [ ] Performance impact assessment

## Estimated Timeline

- Phase 1: 2-3 days
- Phase 2: 2-3 days  
- Phase 3: 1 day
- Phase 4: 2-3 days
- Phase 5: 1 day

**Total: 8-10 days**

## Dependencies

- None blocking - can proceed independently
- Should be completed before full production launch
- Can be tested in staging environment first

## Success Criteria

1. All auth flows work with cookie-based tokens
2. XSS attacks cannot steal tokens
3. CSRF protection is effective
4. No performance degradation
5. No increase in auth failure rates
6. Mobile and desktop browsers work correctly

## Notes

- This is a critical security fix (CVSS 7.5)
- Should be prioritized over other non-critical features
- Requires thorough testing before production deployment
- Consider security audit after implementation
