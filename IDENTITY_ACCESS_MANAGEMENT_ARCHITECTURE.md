# নবME (Nabome) — Identity & Access Management Architecture

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for identity, authentication, authorization, and account lifecycle
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), TECH_STACK.md, DATABASE_ARCHITECTURE.md, API_SERVICE_ARCHITECTURE.md, and FOLDER_ARCHITECTURE.md

---

## Table of Contents

1. [Identity Architecture](#1-identity-architecture)
2. [User Types & Roles](#2-user-types--roles)
3. [Role Hierarchy](#3-role-hierarchy)
4. [Permission Structure](#4-permission-structure)
5. [Authentication Flow](#5-authentication-flow)
6. [Registration Flow](#6-registration-flow)
7. [Login Flow](#7-login-flow)
8. [Logout Flow](#8-logout-flow)
9. [Session Management](#9-session-management)
10. [Token Lifecycle](#10-token-lifecycle)
11. [Cookie Policy](#11-cookie-policy)
12. [Password Management](#12-password-management)
13. [Email Verification](#13-email-verification)
14. [Phone Verification](#14-phone-verification)
15. [Password Reset](#15-password-reset)
16. [Account Recovery](#16-account-recovery)
17. [Remember Device](#17-remember-device)
18. [Session Expiration](#18-session-expiration)
19. [Multi-Device Login](#19-multi-device-login)
20. [Device Management](#20-device-management)
21. [Dashboard Switching](#21-dashboard-switching)
22. [Role Assignment](#22-role-assignment)
23. [Permission Inheritance](#23-permission-inheritance)
24. [Permission Overrides](#24-permission-overrides)
25. [Access Policies](#25-access-policies)
26. [Route Protection](#26-route-protection)
27. [Middleware Strategy](#27-middleware-strategy)
28. [Security Events](#28-security-events)
29. [Login History](#29-login-history)
30. [Account Lifecycle](#30-account-lifecycle)
31. [Account Deletion](#31-account-deletion)
32. [Soft Deletion & Archived Accounts](#32-soft-deletion--archived-accounts)
33. [Guest Experience](#33-guest-experience)
34. [Customer → Shop Owner Conversion](#34-customer--shop-owner-conversion)
35. [Shop Owner → Customer Conversion](#35-shop-owner--customer-conversion)
36. [Admin-Only Operations](#36-admin-only-operations)
37. [Permission Conflicts](#37-permission-conflicts)
38. [Inactive Accounts](#38-inactive-accounts)
39. [Security Requirements](#39-security-requirements)
40. [UX Requirements](#40-ux-requirements)
41. [Future Readiness](#41-future-readiness)
42. [Database Schema](#42-database-schema)
43. [API Endpoints](#43-api-endpoints)
44. [Error Handling](#44-error-handling)
45. [Mandatory Rules for AI Agents](#45-mandatory-rules-for-ai-agents)

---

## 1. Identity Architecture

### 1.1 What

The complete identity foundation that governs how users are identified, authenticated, authorized, and managed throughout their lifecycle on the Nabome platform.

### 1.2 Why

- **Security:** Every request must be verifiable — zero trust mindset
- **Scalability:** Identity system must support growth from 0 to 1M+ users
- **Modularity:** Authentication is independent from business logic
- **Future-proof:** Ready for social login, MFA, SSO without rewrites
- **Compliance:** Meets enterprise security and audit requirements

### 1.3 Where

Every request, every session, every user interaction across frontend and backend.

### 1.4 Identity Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Identity is global** | One user identity across all features | Consistency |
| **Auth independent from business** | Authentication logic never mixed with feature logic | Maintainability |
| **Authorization centralized** | All permission checks in one place | Auditability |
| **Least privilege** | Users get minimum required permissions | Security |
| **Secure by default** | Default deny, require explicit permission | Security |
| **Zero trust** | Every request validated regardless of source | Security |

### 1.5 Identity Ownership

| Entity | Owner | Location |
|--------|-------|----------|
| User identity | Auth domain | `api/_handlers/auth/` |
| Session management | Auth domain | `api/_lib/auth/` |
| Role assignment | Auth domain | `api/_lib/auth/` |
| Permission checks | Auth domain | `api/_lib/auth/middleware.ts` |
| Frontend auth state | Auth feature | `src/features/auth/` |
| Auth store | Global store | `src/stores/auth-store.ts` |

---

## 2. User Types & Roles

### 2.1 What

The four distinct user types that exist on the Nabome platform, each with specific capabilities and access levels.

### 2.2 Why

- **Clear boundaries:** Each user type has defined access
- **Business alignment:** Roles map to business functions
- **Security:** Users cannot access超出 their role
- **Scalability:** New roles added without restructuring

### 2.3 User Types

| Type | Description | Authentication Required | Primary Access |
|------|-------------|------------------------|----------------|
| **Guest** | Unidentified visitor | No | Public storefront only |
| **Customer** | Registered shopper | Yes (email/password) | Storefront + Account |
| **Shop Owner** | Future marketplace seller | Yes (email/password) | Seller dashboard + Storefront |
| **Admin** | Platform administrator | Yes (email/password) | Admin panel + Storefront |

### 2.4 User Type Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Guest is default** | All visitors start as guests | Zero friction entry |
| **Registration required** | Must register for any authenticated action | Security |
| **One primary role** | User has one primary role at a time | Clarity |
| **Role visible** | User knows their current role | Transparency |
| **Role switching** | Explicit action required to change roles | Security |
| **Admin elevated** | Admin access requires explicit grant | Security |

### 2.5 Guest Capabilities

| Capability | Allowed | Rationale |
|------------|---------|-----------|
| Browse products | Yes | Revenue driver |
| View product details | Yes | Revenue driver |
| Search products | Yes | Discovery |
| Add to cart | Yes | Conversion funnel |
| Checkout as guest | Yes | Conversion optimization |
| View order tracking | Yes (with order number) | Customer service |
| Access admin panel | No | Security |
| Manage users | No | Security |
| View other users' data | No | Privacy |

### 2.6 Customer Capabilities

| Capability | Allowed | Rationale |
|------------|---------|-----------|
| All Guest capabilities | Yes | Inheritance |
| Manage own profile | Yes | Self-service |
| Manage addresses | Yes | Self-service |
| View own orders | Yes | Self-service |
| Manage own wishlist | Yes | Self-service |
| Write reviews | Yes | Engagement |
| Access admin panel | No | Security |
| Manage other users | No | Security |
| Modify product catalog | No | Security |

### 2.7 Shop Owner Capabilities

| Capability | Allowed | Rationale |
|------------|---------|-----------|
| All Customer capabilities | Yes | Inheritance |
| Access seller dashboard | Yes | Business function |
| Manage own listings | Yes | Business function |
| View own sales analytics | Yes | Business function |
| Manage own inventory | Yes | Business function |
| Access admin panel | No | Security |
| Manage platform settings | No | Security |
| Access other sellers' data | No | Privacy |

### 2.8 Admin Capabilities

| Capability | Allowed | Rationale |
|------------|---------|-----------|
| All Customer capabilities | Yes | Inheritance |
| Full CRUD on all resources | Yes | Platform management |
| Access admin panel | Yes | Operations |
| Manage users | Yes | Operations |
| Manage products | Yes | Operations |
| Manage orders | Yes | Operations |
| View analytics | Yes | Operations |
| Manage settings | Yes | Operations |
| Audit logs | Yes | Compliance |

---

## 3. Role Hierarchy

### 3.1 What

The hierarchical relationship between roles that determines permission inheritance and conflict resolution.

### 3.2 Why

- **Simplicity:** Admin inherits all customer permissions
- **Clarity:** Clear escalation path
- **Flexibility:** Permissions compose naturally

### 3.3 Role Hierarchy Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ROLE HIERARCHY                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      ADMIN                                │   │
│  │  • Full platform access                                   │   │
│  │  • All customer permissions inherited                     │   │
│  │  • Additional admin-only permissions                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                     inherits from                                │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   CUSTOMER                                │   │
│  │  • All guest permissions inherited                        │   │
│  │  • Account management                                     │   │
│  │  • Order management                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                     inherits from                                │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      GUEST                                │   │
│  │  • Public storefront access                               │   │
│  │  • No authentication required                             │   │
│  │  • Limited capabilities                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   SHOP OWNER                              │   │
│  │  • Inherits from Customer                                 │   │
│  │  • Additional seller capabilities                         │   │
│  │  • Future marketplace role                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Role Hierarchy Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Hierarchical** | Higher roles inherit lower permissions | Simplicity |
| **Admin is supreme** | Admin has all permissions | Platform management |
| **Shop Owner is parallel** | Shop Owner has customer + seller permissions | Business function |
| **No circular hierarchy** | Roles form a tree, not a graph | Prevents permission loops |
| **Explicit assignment** | Roles assigned explicitly, not inferred | Clarity |

---

## 4. Permission Structure

### 4.1 What

The granular permission model that defines what each role can do on the platform.

### 4.2 Why

- **Granularity:** Fine-grained control over access
- **Auditability:** Clear what each role can do
- **Flexibility:** Permissions can be composed
- **Security:** Default deny, explicit grant

### 4.3 Permission Categories

| Category | Permissions | Roles |
|----------|-------------|-------|
| **Product** | `product:read`, `product:create`, `product:update`, `product:delete` | Guest (read), Customer (read), Admin (all) |
| **Cart** | `cart:read`, `cart:update`, `cart:delete` | Guest (all), Customer (all) |
| **Order** | `order:read`, `order:create`, `order:cancel` | Customer (own), Admin (all) |
| **Address** | `address:read`, `address:create`, `address:update`, `address:delete` | Customer (own), Admin (all) |
| **Wishlist** | `wishlist:read`, `wishlist:create`, `wishlist:delete` | Customer (own) |
| **Review** | `review:read`, `review:create`, `review:update`, `review:delete` | Customer (own), Admin (all) |
| **Profile** | `profile:read`, `profile:update` | Customer (own), Admin (all) |
| **User** | `user:read`, `user:create`, `user:update`, `user:delete` | Admin (all) |
| **Settings** | `settings:read`, `settings:update` | Admin (all) |
| **Analytics** | `analytics:read` | Admin (all) |
| **Audit** | `audit:read` | Admin (all) |

### 4.4 Permission Format

```typescript
// Permission format: {resource}:{action}
type Permission =
  | 'product:read'
  | 'product:create'
  | 'product:update'
  | 'product:delete'
  | 'cart:read'
  | 'cart:update'
  | 'cart:delete'
  | 'order:read'
  | 'order:create'
  | 'order:cancel'
  | 'address:read'
  | 'address:create'
  | 'address:update'
  | 'address:delete'
  | 'wishlist:read'
  | 'wishlist:create'
  | 'wishlist:delete'
  | 'review:read'
  | 'review:create'
  | 'review:update'
  | 'review:delete'
  | 'profile:read'
  | 'profile:update'
  | 'user:read'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'settings:read'
  | 'settings:update'
  | 'analytics:read'
  | 'audit:read';
```

### 4.5 Role Permission Matrix

| Permission | Guest | Customer | Shop Owner | Admin |
|------------|-------|----------|------------|-------|
| `product:read` | ✓ | ✓ | ✓ | ✓ |
| `product:create` | ✗ | ✗ | Future | ✓ |
| `product:update` | ✗ | ✗ | Future | ✓ |
| `product:delete` | ✗ | ✗ | Future | ✓ |
| `cart:read` | ✓ | ✓ | ✓ | ✓ |
| `cart:update` | ✓ | ✓ | ✓ | ✓ |
| `cart:delete` | ✓ | ✓ | ✓ | ✓ |
| `order:read` | ✗ | Own | Own | All |
| `order:create` | Guest checkout | ✓ | ✓ | ✓ |
| `order:cancel` | ✗ | Own | Own | All |
| `address:read` | ✗ | Own | Own | All |
| `address:create` | ✗ | ✓ | ✓ | ✓ |
| `address:update` | ✗ | Own | Own | All |
| `address:delete` | ✗ | Own | Own | All |
| `wishlist:read` | ✗ | ✓ | ✓ | ✓ |
| `wishlist:create` | ✗ | ✓ | ✓ | ✓ |
| `wishlist:delete` | ✗ | ✓ | ✓ | ✓ |
| `review:read` | ✓ | ✓ | ✓ | ✓ |
| `review:create` | ✗ | ✓ | ✓ | ✓ |
| `review:update` | ✗ | Own | Own | All |
| `review:delete` | ✗ | Own | Own | All |
| `profile:read` | ✗ | Own | Own | All |
| `profile:update` | ✗ | Own | Own | All |
| `user:read` | ✗ | ✗ | ✗ | ✓ |
| `user:create` | ✗ | ✗ | ✗ | ✓ |
| `user:update` | ✗ | ✗ | ✗ | ✓ |
| `user:delete` | ✗ | ✗ | ✗ | ✓ |
| `settings:read` | ✗ | ✗ | ✗ | ✓ |
| `settings:update` | ✗ | ✗ | ✗ | ✓ |
| `analytics:read` | ✗ | ✗ | ✗ | ✓ |
| `audit:read` | ✗ | ✗ | ✗ | ✓ |

### 4.6 Permission Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Resource ownership** | Customers access only their own resources | Privacy |
| **Admin override** | Admin can access all resources | Platform management |
| **No permission duplication** | Define permission once, reference everywhere | DRY |
| **Centralized definition** | All permissions in one place | Auditability |
| **Explicit grant** | Permissions must be explicitly granted | Security |
| **Default deny** | No access unless permission granted | Security |

---

## 5. Authentication Flow

### 5.1 What

The complete authentication flow from request to response, including all security checks.

### 5.2 Why

- **Security:** Every protected endpoint follows the same flow
- **Consistency:** Predictable behavior across the platform
- **Debuggability:** Clear understanding of where issues occur

### 5.3 Where

All protected API endpoints and frontend routes.

### 5.4 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                            │
│                                                                  │
│  1. Client sends request                                         │
│     → HTTP method + URL + headers + body                         │
│                                                                  │
│  2. Cloudflare edge receives request                             │
│     → Security headers applied                                  │
│     → CORS check                                                │
│                                                                  │
│  3. Rate limiting check                                          │
│     → KV-based rate limiter                                     │
│     → Return 429 if exceeded                                    │
│                                                                  │
│  4. CSRF validation (for mutations)                              │
│     → Double-submit cookie pattern                              │
│     → Return 403 if invalid                                     │
│                                                                  │
│  5. Turnstile verification (for public mutations)                │
│     → Verify CAPTCHA token                                      │
│     → Return 403 if invalid                                     │
│                                                                  │
│  6. Authentication (if required)                                 │
│     → Extract session from cookies                              │
│     → Validate session in database                              │
│     → Return 401 if unauthenticated                             │
│                                                                  │
│  7. Authorization (if required)                                  │
│     → Check user role                                           │
│     → Check resource ownership                                  │
│     → Return 403 if unauthorized                                │
│                                                                  │
│  8. Input validation                                             │
│     → Zod schema validation                                     │
│     → Return 400 if invalid                                     │
│                                                                  │
│  9. Business logic                                               │
│     → Handler executes service calls                            │
│     → Services interact with infrastructure                     │
│                                                                  │
│  10. Response construction                                       │
│      → Standard format: { success, data, error, meta }          │
│      → Set appropriate status code                              │
│                                                                  │
│  11. Audit logging (if required)                                 │
│      → Log request details                                      │
│      → Log response status                                      │
│                                                                  │
│  12. Response sent to client                                     │
│      → HTTP response with headers                               │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Authentication Middleware

```typescript
// api/_lib/auth/middleware.ts

export async function authenticate(request: Request): Promise<User> {
  // 1. Extract session from cookies
  const session = await getSession(request);
  if (!session) {
    throw new UnauthorizedError('Authentication required');
  }

  // 2. Validate session is active
  if (!session.isActive) {
    throw new UnauthorizedError('Session expired');
  }

  // 3. Check session expiry
  if (session.expiresAt < new Date()) {
    await invalidateSession(session.id);
    throw new UnauthorizedError('Session expired');
  }

  // 4. Return user
  return session.user;
}

export async function optionalAuth(request: Request): Promise<User | null> {
  try {
    return await authenticate(request);
  } catch {
    return null;
  }
}
```

### 5.6 Authentication Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Authenticate first** | Authentication before any operation | Security |
| **Fail fast** | Return error as soon as detected | Better UX |
| **Log failures** | All authentication failures logged | Security monitoring |
| **No silent failures** | Always return appropriate error | Debuggability |
| **Session validation** | Check session exists, is active, not expired | Security |
| **User exists** | Verify user still exists in database | Security |

---

## 6. Registration Flow

### 6.1 What

The complete user registration flow from form submission to account activation.

### 6.2 Why

- **Conversion:** Minimal steps to register
- **Security:** Prevent fake accounts
- **Verification:** Email verification ensures valid email
- **Compliance:** Meets data collection requirements

### 6.3 Where

`POST /api/auth/register`

### 6.4 Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   REGISTRATION FLOW                              │
│                                                                  │
│  1. User opens registration form                                 │
│     → GET /register                                              │
│                                                                  │
│  2. User fills form                                              │
│     → Email, password, first name, last name                     │
│     → Client-side validation (Zod)                               │
│                                                                  │
│  3. User submits form                                            │
│     → POST /api/auth/register                                   │
│                                                                  │
│  4. Rate limit check                                             │
│     → 10 requests per minute                                    │
│     → Return 429 if exceeded                                    │
│                                                                  │
│  5. Turnstile verification                                       │
│     → Verify CAPTCHA token                                      │
│     → Return 403 if invalid                                     │
│                                                                  │
│  6. Input validation                                             │
│     → Zod schema validation                                     │
│     → Return 400 if invalid                                     │
│                                                                  │
│  7. Check email uniqueness                                       │
│     → Query database for existing email                          │
│     → Return 409 if duplicate                                   │
│                                                                  │
│  8. Create Supabase Auth user                                    │
│     → Email + password                                           │
│     → Return error if failed                                    │
│                                                                  │
│  9. Create profile in database                                   │
│     → profile table with user data                               │
│     → Set role to 'customer'                                     │
│                                                                  │
│  10. Send verification email                                     │
│      → Email with verification link                              │
│      → Link expires in 24 hours                                  │
│                                                                  │
│  11. Return success response                                     │
│      → { success: true, data: { message: 'Registration successful' } } │
│                                                                  │
│  12. Client shows success message                                │
│      → "Please check your email to verify your account"          │
└─────────────────────────────────────────────────────────────────┘
```

### 6.5 Registration Schema

```typescript
// api/_handlers/auth/register.ts

import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  turnstileToken: z.string().min(1, 'Please complete the CAPTCHA'),
});
```

### 6.6 Registration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Email required** | Valid email format | Communication |
| **Password policy** | Min 8 chars, mixed case, number, special | Security |
| **Email uniqueness** | One account per email | Data integrity |
| **Email verification** | Must verify before full access | Security |
| **Turnstile required** | CAPTCHA on registration | Bot prevention |
| **Rate limited** | 10 requests per minute | Abuse prevention |
| **Welcome email** | Sent after registration | Engagement |
| **Default role** | 'customer' on registration | Business rule |

---

## 7. Login Flow

### 7.1 What

The complete user login flow from form submission to session creation.

### 7.2 Why

- **Security:** Secure credential verification
- **UX:** Fast, frictionless login
- **Monitoring:** Track login attempts

### 7.3 Where

`POST /api/auth/login`

### 7.4 Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                                  │
│                                                                  │
│  1. User opens login form                                        │
│     → GET /login                                                 │
│                                                                  │
│  2. User fills form                                              │
│     → Email + password                                           │
│     → "Remember me" checkbox (optional)                          │
│                                                                  │
│  3. User submits form                                            │
│     → POST /api/auth/login                                      │
│                                                                  │
│  4. Rate limit check                                             │
│     → 20 requests per minute                                    │
│     → Return 429 if exceeded                                    │
│                                                                  │
│  5. Turnstile verification                                       │
│     → Verify CAPTCHA token                                      │
│     → Return 403 if invalid                                     │
│                                                                  │
│  6. Input validation                                             │
│     → Zod schema validation                                     │
│     → Return 400 if invalid                                     │
│                                                                  │
│  7. Check lockout status                                         │
│     → Query failed attempts                                     │
│     → Return 423 if locked out                                  │
│                                                                  │
│  8. Authenticate with Supabase Auth                              │
│     → Verify email/password                                      │
│     → Return 401 if invalid                                     │
│                                                                  │
│  9. Create session in database                                   │
│     → auth_sessions table                                        │
│     → Generate access + refresh tokens                           │
│                                                                  │
│  10. Set httpOnly cookies                                        │
│      → access_token (15min)                                      │
│      → refresh_token (7 days)                                    │
│      → csrf_token (4 hours)                                      │
│                                                                  │
│  11. Log successful login                                        │
│      → Audit log entry                                           │
│      → Reset failed attempt counter                              │
│                                                                  │
│  12. Return user data                                            │
│      → Profile info (not tokens)                                 │
│                                                                  │
│  13. Client stores user in Zustand                               │
│      → Auth store updated                                        │
│                                                                  │
│  14. Redirect to previous page                                   │
│      → Or homepage                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Login Schema

```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
  turnstileToken: z.string().min(1, 'Please complete the CAPTCHA'),
});
```

### 7.6 Login Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Email required** | Valid email format | Identification |
| **Password required** | Non-empty string | Authentication |
| **Turnstile required** | CAPTCHA on login | Bot prevention |
| **Rate limited** | 20 requests per minute | Abuse prevention |
| **Lockout after failures** | 5 attempts, 15-minute lockout | Brute force protection |
| **Log all attempts** | Success and failure logged | Security monitoring |
| **Session creation** | Create session in database | Session management |
| **Cookie setting** | httpOnly cookies for tokens | XSS prevention |
| **Redirect after login** | Return to previous page | UX |

---

## 8. Logout Flow

### 8.1 What

The complete logout flow from user action to session invalidation.

### 8.2 Why

- **Security:** Proper session termination
- **UX:** Clean logout experience
- **Compliance:** Meets security requirements

### 8.3 Where

`POST /api/auth/logout`

### 8.4 Logout Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOGOUT FLOW                                 │
│                                                                  │
│  1. User clicks "Logout"                                         │
│     → POST /api/auth/logout                                     │
│                                                                  │
│  2. Extract session from cookies                                 │
│     → Get access_token cookie                                    │
│                                                                  │
│  3. Validate session exists                                      │
│     → Query database for session                                 │
│     → Return success if not found (idempotent)                   │
│                                                                  │
│  4. Invalidate session in database                               │
│     → Set session.isActive = false                               │
│     → Delete session record                                      │
│                                                                  │
│  5. Clear cookies                                                │
│     → Clear access_token cookie                                  │
│     → Clear refresh_token cookie                                 │
│     → Clear csrf_token cookie                                    │
│                                                                  │
│  6. Log logout event                                             │
│     → Audit log entry                                           │
│                                                                  │
│  7. Return success response                                      │
│     → { success: true, data: { message: 'Logged out' } }        │
│                                                                  │
│  8. Client clears auth store                                     │
│     → Zustand auth store reset                                   │
│     → Redirect to homepage                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 8.5 Logout Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Idempotent** | Logout succeeds even if already logged out | UX |
| **Session invalidation** | Mark session as inactive | Security |
| **Cookie clearing** | Clear all auth cookies | Security |
| **Audit logging** | Log logout event | Security monitoring |
| **Client cleanup** | Clear auth store on client | State consistency |
| **Redirect** | Redirect to homepage after logout | UX |

---

## 9. Session Management

### 9.1 What

The complete session lifecycle including creation, validation, rotation, and invalidation.

### 9.2 Why

- **Security:** Proper session handling prevents attacks
- **UX:** Seamless login/logout experience
- **Scalability:** Sessions work across multiple devices

### 9.3 Where

`api/_lib/auth/session.ts`

### 9.4 Session Schema

```prisma
model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken  String   @unique
  refreshToken String   @unique
  csrfToken    String
  ipAddress    String?  @db.VarChar(45)
  userAgent    String?
  deviceName   String?
  isActive     Boolean  @default(true)
  expiresAt    DateTime
  lastAccessedAt DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
  @@index([accessToken])
  @@index([refreshToken])
  @@index([expiresAt])
  @@index([isActive])
}
```

### 9.5 Session Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly cookies** | Tokens stored in httpOnly cookies | Prevent XSS |
| **Secure cookies** | HTTPS only | Prevent MITM |
| **SameSite lax** | CSRF protection | Prevent CSRF |
| **Token rotation** | On sensitive operations | Security |
| **Max sessions** | 5 per user | Prevent abuse |
| **Session cleanup** | Delete expired sessions | Performance |
| **IP tracking** | Log IP for audit | Security |
| **User agent tracking** | Log device info | Security |
| **Last accessed** | Update on each request | Session validity |

### 9.6 Session Operations

```typescript
// Create session
export async function createSession(
  userId: string,
  request: Request,
  rememberMe: boolean
): Promise<SessionTokens> {
  // 1. Generate tokens
  const accessToken = generateAccessToken();
  const refreshToken = generateRefreshToken();
  const csrfToken = generateCsrfToken();

  // 2. Hash tokens before storage
  const hashedAccessToken = await hashToken(accessToken);
  const hashedRefreshToken = await hashToken(refreshToken);

  // 3. Create session in database
  const session = await db.session.create({
    data: {
      userId,
      accessToken: hashedAccessToken,
      refreshToken: hashedRefreshToken,
      csrfToken,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      expiresAt: rememberMe
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // 4. Enforce max sessions
  await enforceMaxSessions(userId);

  return { accessToken, refreshToken, csrfToken };
}

// Validate session
export async function validateSession(
  accessToken: string
): Promise<Session | null> {
  // 1. Hash the provided token
  const hashedToken = await hashToken(accessToken);

  // 2. Find session in database
  const session = await db.session.findUnique({
    where: { accessToken: hashedToken },
    include: { user: true },
  });

  // 3. Validate session
  if (!session) return null;
  if (!session.isActive) return null;
  if (session.expiresAt < new Date()) {
    await invalidateSession(session.id);
    return null;
  }

  // 4. Update last accessed
  await db.session.update({
    where: { id: session.id },
    data: { lastAccessedAt: new Date() },
  });

  return session;
}

// Invalidate session
export async function invalidateSession(sessionId: string): Promise<void> {
  await db.session.update({
    where: { id: sessionId },
    data: { isActive: false },
  });
}

// Invalidate all sessions for user
export async function invalidateAllSessions(userId: string): Promise<void> {
  await db.session.updateMany({
    where: { userId },
    data: { isActive: false },
  });
}
```

---

## 10. Token Lifecycle

### 10.1 What

The complete lifecycle of authentication tokens from generation to expiration.

### 10.2 Why

- **Security:** Short-lived tokens limit exposure
- **UX:** Refresh tokens maintain sessions
- **Control:** Token rotation prevents replay attacks

### 10.3 Where

`api/_lib/auth/tokens.ts`

### 10.4 Token Types

| Token | Purpose | TTL | Storage | Readable by Client |
|-------|---------|-----|---------|-------------------|
| **Access Token** | Authenticate requests | 15 minutes | httpOnly cookie | No |
| **Refresh Token** | Renew access token | 7 days | httpOnly cookie | No |
| **CSRF Token** | Prevent CSRF attacks | 4 hours | Regular cookie | Yes |

### 10.5 Token Generation

```typescript
// Generate access token (JWT)
export function generateAccessToken(): string {
  return jwt.sign(
    {
      type: 'access',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes
    },
    env.JWT_SECRET
  );
}

// Generate refresh token
export function generateRefreshToken(): string {
  return jwt.sign(
    {
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    },
    env.JWT_REFRESH_SECRET
  );
}

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash token for storage
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### 10.6 Token Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Short access token** | 15 minutes | Limit exposure |
| **Long refresh token** | 7 days | UX balance |
| **Hashed storage** | Never store plain tokens | Security |
| **Rotation on use** | Refresh token rotated on use | Security |
| **Revocation** | Tokens revoked on logout | Security |
| **No client storage** | Tokens in httpOnly cookies only | XSS prevention |

---

## 11. Cookie Policy

### 11.1 What

The complete cookie policy for authentication tokens.

### 11.2 Why

- **Security:** Proper cookie configuration prevents attacks
- **Compliance:** Meets privacy requirements
- **UX:** Cookies persist appropriately

### 11.3 Where

All authentication flows.

### 11.4 Cookie Configuration

```typescript
// Base cookie options
const baseCookieOptions = {
  httpOnly: true,
  secure: true,        // HTTPS only
  sameSite: 'lax',    // CSRF protection
  path: '/',
};

// Access token cookie
const accessTokenOptions = {
  ...baseCookieOptions,
  maxAge: 15 * 60,      // 15 minutes
  name: 'access_token',
};

// Refresh token cookie
const refreshTokenOptions = {
  ...baseCookieOptions,
  maxAge: 7 * 24 * 60 * 60, // 7 days
  name: 'refresh_token',
};

// CSRF token cookie (readable by client)
const csrfTokenOptions = {
  ...baseCookieOptions,
  httpOnly: false,      // Client needs to read this
  maxAge: 4 * 60 * 60, // 4 hours
  name: 'csrf_token',
};

// Remember me extension
const rememberMeRefreshTokenOptions = {
  ...refreshTokenOptions,
  maxAge: 30 * 24 * 60 * 60, // 30 days
};
```

### 11.5 Cookie Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly** | All auth cookies except CSRF | XSS prevention |
| **Secure** | All cookies in production | MITM prevention |
| **SameSite lax** | All cookies | CSRF prevention |
| **Path** | `/` for all cookies | Consistency |
| **No localStorage** | Never store tokens in localStorage | XSS prevention |
| **No sessionStorage** | Never store tokens in sessionStorage | Security |
| **Clear on logout** | All cookies cleared on logout | Security |
| **Rotation** | Refresh token rotated on use | Security |

---

## 12. Password Management

### 12.1 What

The complete password lifecycle including creation, validation, storage, and changes.

### 12.2 Why

- **Security:** Strong passwords protect accounts
- **UX:** Clear password requirements
- **Compliance:** Meets security standards

### 12.3 Where

`api/_handlers/auth/register.ts`, `api/_handlers/auth/password-reset.ts`

### 12.4 Password Policy

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Minimum length** | 8 characters | Security |
| **Maximum length** | 128 characters | Prevent abuse |
| **Uppercase required** | At least 1 uppercase letter | Complexity |
| **Lowercase required** | At least 1 lowercase letter | Complexity |
| **Number required** | At least 1 number | Complexity |
| **Special character required** | At least 1 special character | Complexity |
| **No common passwords** | Check against breached passwords | Security |
| **No personal info** | Cannot contain email/name | Security |

### 12.5 Password Storage

```typescript
// Hash password before storage
export async function hashPassword(password: string): Promise<string> {
  // Use bcrypt with salt rounds of 12
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

### 12.6 Password Change

```typescript
// api/_handlers/auth/password-change.ts

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export async function changePassword(request: Request, env: Env) {
  // 1. Authenticate
  const user = await authenticate(request);

  // 2. Validate input
  const body = await validateRequest(request, passwordChangeSchema);

  // 3. Verify current password
  const isValid = await verifyPassword(body.currentPassword, user.password);
  if (!isValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // 4. Hash new password
  const hashedPassword = await hashPassword(body.newPassword);

  // 5. Update password
  await db.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // 6. Invalidate all sessions (security best practice)
  await invalidateAllSessions(user.id);

  // 7. Log password change
  await auditLogger.log({
    type: 'PASSWORD_CHANGED',
    userId: user.id,
    ip: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
    resource: 'User',
    resourceId: user.id,
  });

  // 8. Return success
  return success({ message: 'Password changed successfully' });
}
```

---

## 13. Email Verification

### 13.1 What

The complete email verification flow from account creation to email confirmation.

### 13.2 Why

- **Security:** Verify email ownership
- **Communication:** Ensure valid email for notifications
- **Compliance:** Meets anti-spam requirements

### 13.3 Where

`POST /api/auth/verify-email`

### 13.4 Email Verification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 EMAIL VERIFICATION FLOW                          │
│                                                                  │
│  1. User registers                                               │
│     → Verification email sent                                    │
│     → Link contains verification token                          │
│                                                                  │
│  2. User clicks verification link                                │
│     → GET /verify-email?token=xxx                                │
│                                                                  │
│  3. Verify token                                                 │
│     → Validate token exists and not expired                      │
│     → Return error if invalid                                    │
│                                                                  │
│  4. Update user email_verified status                            │
│     → Set emailVerified = true                                   │
│                                                                  │
│  5. Send welcome email                                           │
│     → Welcome email sent                                         │
│                                                                  │
│  6. Redirect to login                                            │
│     → "Email verified, please login"                             │
└─────────────────────────────────────────────────────────────────┘
```

### 13.5 Email Verification Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Token expiry** | 24 hours | Security |
| **Single use** | Token invalidated after use | Security |
| **Resend limit** | 3 emails per hour | Abuse prevention |
| **Auto-login after verify** | No (must login separately) | Security |
| **Verification required** | Before full account access | Security |
| **Resend option** | User can request new verification email | UX |

---

## 14. Phone Verification

### 14.1 What

Phone verification readiness for future implementation.

### 14.2 Why

- **Future-proof:** Ready for SMS verification
- **MFA readiness:** Phone as second factor
- **Alternative contact:** Backup communication method

### 14.3 Where

Future: `POST /api/auth/verify-phone`

### 14.4 Phone Verification Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Format** | E.164 format (+91XXXXXXXXXX) | International support |
| **OTP length** | 6 digits | Security |
| **OTP expiry** | 5 minutes | Security |
| **Attempt limit** | 3 attempts | Brute force protection |
| **Cooldown** | 60 seconds between OTPs | Abuse prevention |
| **Verification required** | Before phone-based actions | Security |

---

## 15. Password Reset

### 15.1 What

The complete password reset flow from request to password change.

### 15.2 Why

- **Recovery:** Users can regain account access
- **Security:** Secure reset process
- **UX:** Clear, simple reset flow

### 15.3 Where

`POST /api/auth/password-reset`

### 15.4 Password Reset Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   PASSWORD RESET FLOW                            │
│                                                                  │
│  1. User clicks "Forgot password"                                │
│     → GET /forgot-password                                       │
│                                                                  │
│  2. User enters email                                            │
│     → POST /api/auth/password-reset                             │
│                                                                  │
│  3. Rate limit check                                             │
│     → 5 requests per hour                                       │
│     → Return 429 if exceeded                                    │
│                                                                  │
│  4. Check if email exists                                        │
│     → Always return success (don't reveal if email exists)       │
│                                                                  │
│  5. Generate reset token                                         │
│     → Cryptographically random token                             │
│     → Hash before storage                                        │
│                                                                  │
│  6. Store reset token                                            │
│     → password_resets table                                      │
│     → Expires in 1 hour                                          │
│                                                                  │
│  7. Send reset email                                             │
│     → Email with reset link                                      │
│     → Link contains reset token                                  │
│                                                                  │
│  8. User clicks reset link                                       │
│     → GET /reset-password?token=xxx                              │
│                                                                  │
│  9. User enters new password                                     │
│     → POST /api/auth/password-reset/confirm                      │
│                                                                  │
│  10. Validate token                                              │
│      → Verify token exists and not expired                       │
│      → Return error if invalid                                   │
│                                                                  │
│  11. Update password                                             │
│      → Hash new password                                         │
│      → Update user password                                      │
│                                                                  │
│  12. Invalidate all sessions                                     │
│      → Security best practice                                    │
│                                                                  │
│  13. Log password reset                                          │
│      → Audit log entry                                           │
│                                                                  │
│  14. Return success                                              │
│      → "Password reset successful"                               │
└─────────────────────────────────────────────────────────────────┘
```

### 15.5 Password Reset Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Rate limited** | 5 requests per hour | Abuse prevention |
| **Token expiry** | 1 hour | Security |
| **Single use** | Token invalidated after use | Security |
| **No email disclosure** | Always return success message | Security |
| **Invalidate sessions** | All sessions revoked on reset | Security |
| **Strong password required** | Same as registration | Security |

---

## 16. Account Recovery

### 16.1 What

The complete account recovery flow for users who cannot access their email.

### 16.2 Why

- **Recovery:** Users can regain access
- **Security:** Secure recovery process
- **Support:** Customer support assistance

### 16.3 Where

Customer support flow.

### 16.4 Account Recovery Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Identity verification** | Must verify identity | Security |
| **Support ticket** | Required for account recovery | Audit trail |
| **Admin approval** | Admin must approve recovery | Security |
| **Limited recovery** | One recovery per 30 days | Abuse prevention |
| **New email required** | Cannot use old email if compromised | Security |
| **Session invalidation** | All sessions revoked | Security |

---

## 17. Remember Device

### 17.1 What

The "Remember me" functionality that extends session duration.

### 17.2 Why

- **UX:** Less frequent logins for trusted devices
- **Security:** Extended sessions only on explicit request
- **Control:** User chooses session duration

### 17.3 Where

Login flow.

### 17.4 Remember Device Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default off** | Remember me unchecked by default | Security |
| **Extended TTL** | 30 days vs 7 days | UX |
| **Device tracking** | Store device info | Security |
| **Revocable** | User can revoke remembered devices | Security |
| **Max remembered** | 5 devices max | Security |
| **Visual indicator** | Show remembered devices | Transparency |

---

## 18. Session Expiration

### 18.1 What

Session expiration policies and handling.

### 18.2 Why

- **Security:** Limit session lifetime
- **UX:** Balance security and convenience
- **Compliance:** Meets security requirements

### 18.3 Where

Session management.

### 18.4 Session Expiration Rules

| Session Type | TTL | Rationale |
|--------------|-----|-----------|
| **Access token** | 15 minutes | Short-lived for security |
| **Refresh token** | 7 days | UX balance |
| **Remember me refresh** | 30 days | Extended UX |
| **CSRF token** | 4 hours | Regular rotation |
| **Idle timeout** | 30 minutes | Inactivity security |
| **Absolute timeout** | 24 hours | Maximum session length |

### 18.5 Session Expiration Handling

```typescript
// Check if session is expired
export function isSessionExpired(session: Session): boolean {
  // 1. Check absolute expiry
  if (session.expiresAt < new Date()) {
    return true;
  }

  // 2. Check idle timeout (30 minutes)
  const idleTimeout = 30 * 60 * 1000; // 30 minutes
  if (Date.now() - session.lastAccessedAt.getTime() > idleTimeout) {
    return true;
  }

  return false;
}

// Handle expired session
export async function handleExpiredSession(session: Session): Promise<void> {
  // 1. Invalidate session
  await invalidateSession(session.id);

  // 2. Log expiration
  await auditLogger.log({
    type: 'SESSION_EXPIRED',
    userId: session.userId,
    resource: 'Session',
    resourceId: session.id,
  });
}
```

---

## 19. Multi-Device Login

### 19.1 What

The ability for users to be logged in on multiple devices simultaneously.

### 19.2 Why

- **UX:** Users access from multiple devices
- **Flexibility:** Mobile + desktop usage
- **Security:** Controlled by session limits

### 19.3 Where

Session management.

### 19.4 Multi-Device Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max sessions** | 5 per user | Prevent abuse |
| **Session limit enforcement** | Oldest session revoked | Security |
| **Device identification** | Store device info | Transparency |
| **Independent sessions** | Each device has own session | Isolation |
| **Revocation** | User can revoke specific sessions | Control |
| **Global logout** | Invalidate all sessions option | Security |

---

## 20. Device Management

### 20.1 What

The ability for users to view and manage their active sessions/devices.

### 20.2 Why

- **Transparency:** Users see where they're logged in
- **Security:** Users can revoke suspicious sessions
- **Control:** Users manage their devices

### 20.3 Where

`GET /api/auth/sessions`, `DELETE /api/auth/sessions/:id`

### 20.4 Device Management Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **List sessions** | Show all active sessions | Transparency |
| **Device info** | Show IP, user agent, last active | Identification |
| **Revoke session** | User can revoke any session | Control |
| **Revoke all** | User can revoke all sessions | Security |
| **Current session** | Mark current session | UX |
| **Cannot revoke current** | Must logout to end current session | UX |

---

## 21. Dashboard Switching

### 21.1 What

The ability for users with multiple roles to switch between dashboards.

### 21.2 Why

- **UX:** Seamless role switching
- **Efficiency:** No need to logout/login
- **Control:** User chooses which dashboard to access

### 21.3 Where

Frontend routing.

### 21.4 Dashboard Switching Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Explicit action** | Must click to switch | Security |
| **Role verification** | Verify role before switching | Security |
| **URL-based** | Different URL per dashboard | Bookmarkability |
| **Visual indicator** | Show current dashboard | Transparency |
| **Permission-based** | Only show available dashboards | Clarity |

---

## 22. Role Assignment

### 22.1 What

How roles are assigned to users and the rules governing role changes.

### 22.2 Why

- **Security:** Controlled role assignment
- **Auditability:** Track role changes
- **Compliance:** Meets access control requirements

### 22.3 Where

Admin operations, user management.

### 22.4 Role Assignment Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default role** | 'customer' on registration | Business rule |
| **Admin assignment** | Only by existing admin | Security |
| **Role change logging** | All changes logged | Audit trail |
| **Self-assignment prohibited** | Users cannot assign自己 roles | Security |
| **Role verification** | Verify role exists before assignment | Data integrity |
| **Immediate effect** | Role changes take effect immediately | UX |

---

## 23. Permission Inheritance

### 23.1 How

Higher roles inherit permissions from lower roles.

### 23.2 Why

- **Simplicity:** Admin automatically has all customer permissions
- **Clarity:** Clear permission structure
- **Maintainability:** Permissions compose naturally

### 23.3 Where

Permission checking.

### 23.4 Permission Inheritance Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Hierarchical** | Higher inherits from lower | Simplicity |
| **Additive only** | Cannot remove inherited permissions | Clarity |
| **Explicit override** | Specific permissions can be overridden | Flexibility |
| **Audit trail** | Track permission changes | Compliance |

---

## 24. Permission Overrides

### 24.1 What

The ability to override inherited permissions for specific users.

### 24.2 Why

- **Flexibility:** Handle edge cases
- **Security:** Temporary permission elevation
- **Control:** Admin can grant/revoke specific permissions

### 24.3 Where

Admin user management.

### 24.4 Permission Override Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Admin only** | Only admins can override | Security |
| **Time-limited** | Overrides expire after duration | Security |
| **Audit logged** | All overrides logged | Compliance |
| **Explicit grant** | Must be explicitly granted | Security |
| **Revocable** | Admin can revoke any override | Control |

---

## 25. Access Policies

### 25.1 What

The complete access policy framework that governs who can access what.

### 25.2 Why

- **Security:** Clear access rules
- **Compliance:** Meets regulatory requirements
- **Auditability:** All access decisions logged

### 25.3 Where

All protected endpoints and routes.

### 25.4 Access Policy Matrix

| Resource | Guest | Customer | Shop Owner | Admin |
|----------|-------|----------|------------|-------|
| **Public pages** | ✓ | ✓ | ✓ | ✓ |
| **Product catalog** | ✓ | ✓ | ✓ | ✓ |
| **Cart** | ✓ | ✓ | ✓ | ✓ |
| **Checkout** | ✓ | ✓ | ✓ | ✓ |
| **Account** | ✗ | ✓ | ✓ | ✓ |
| **Orders** | ✗ | Own | Own | All |
| **Addresses** | ✗ | Own | Own | All |
| **Wishlist** | ✗ | ✓ | ✓ | ✓ |
| **Reviews** | ✗ | Own | Own | All |
| **Admin panel** | ✗ | ✗ | ✗ | ✓ |
| **User management** | ✗ | ✗ | ✗ | ✓ |
| **Settings** | ✗ | ✗ | ✗ | ✓ |
| **Analytics** | ✗ | ✗ | ✗ | ✓ |

---

## 26. Route Protection

### 26.1 What

Frontend route protection using React Router.

### 26.2 Why

- **Security:** Unauthorized users cannot access protected routes
- **UX:** Clear redirect to login
- **Consistency:** Same protection pattern everywhere

### 26.3 Where

`src/shared/auth/ProtectedRoute.tsx`, `src/shared/auth/AdminRoute.tsx`

### 26.4 Route Protection Rules

| Route Type | Protection | Redirect | Example |
|------------|------------|----------|---------|
| **Public** | None | None | `/`, `/products`, `/cart` |
| **Protected** | Auth required | `/login` | `/account`, `/orders` |
| **Admin** | Admin role required | `/` | `/admin/*` |
| **Guest only** | No auth required | `/` | `/login`, `/register` |

### 26.5 Route Protection Implementation

```tsx
// src/shared/auth/ProtectedRoute.tsx

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Usage in routes
<Route
  path="/account"
  element={
    <ProtectedRoute>
      <AccountPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/*"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminLayout />
    </ProtectedRoute>
  }
/>
```

---

## 27. Middleware Strategy

### 27.1 What

The middleware pipeline that processes every request.

### 27.2 Why

- **Security:** Consistent security checks
- **Performance:** Early rejection of invalid requests
- **Maintainability:** Centralized security logic

### 27.3 Where

`api/_lib/security/`, `api/_lib/auth/middleware.ts`

### 27.4 Middleware Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE PIPELINE                           │
│                                                                  │
│  1. Security Headers                                             │
│     → CSP, HSTS, X-Frame-Options, etc.                          │
│                                                                  │
│  2. CORS                                                         │
│     → Validate origin                                            │
│                                                                  │
│  3. Rate Limiting                                                │
│     → KV-based rate limiter                                     │
│     → Return 429 if exceeded                                    │
│                                                                  │
│  4. CSRF Protection                                              │
│     → Double-submit cookie pattern                              │
│     → Return 403 if invalid                                     │
│                                                                  │
│  5. Turnstile (public endpoints)                                 │
│     → Verify CAPTCHA token                                      │
│     → Return 403 if invalid                                     │
│                                                                  │
│  6. Authentication                                               │
│     → Validate session                                          │
│     → Return 401 if unauthenticated                             │
│                                                                  │
│  7. Authorization                                                │
│     → Check role/permission                                      │
│     → Return 403 if unauthorized                                │
│                                                                  │
│  8. Validation                                                   │
│     → Zod schema validation                                     │
│     → Return 400 if invalid                                     │
│                                                                  │
│  9. Handler                                                      │
│     → Business logic                                             │
│                                                                  │
│  10. Audit Logging                                               │
│      → Log request/response                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 27.5 Middleware Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Order matters** | Security headers → Rate limit → CSRF → Auth → Validation → Handler | Defense in depth |
| **Fail fast** | Return error as soon as detected | Performance |
| **Log everything** | All middleware decisions logged | Auditability |
| **Independent** | Each middleware is independent | Testability |
| **Configurable** | Each endpoint configures required middleware | Flexibility |

---

## 28. Security Events

### 28.1 What

Security events that must be logged and monitored.

### 28.2 Why

- **Detection:** Identify security incidents
- **Compliance:** Meet audit requirements
- **Forensics:** Investigate security issues

### 28.3 Where

`api/_lib/logging/audit.ts`

### 28.4 Security Events

| Event | Severity | Description | Response |
|-------|----------|-------------|----------|
| `LOGIN_SUCCESS` | Info | Successful login | Log |
| `LOGIN_FAILED` | Warning | Failed login attempt | Log + rate limit |
| `LOGIN_LOCKED` | Critical | Account locked due to failures | Log + notify |
| `LOGOUT` | Info | User logged out | Log |
| `PASSWORD_CHANGED` | Warning | Password changed | Log + invalidate sessions |
| `PASSWORD_RESET_REQUESTED` | Warning | Password reset requested | Log |
| `PASSWORD_RESET_COMPLETED` | Warning | Password reset completed | Log + invalidate sessions |
| `EMAIL_CHANGED` | Warning | Email changed | Log + verify new email |
| `ROLE_CHANGED` | Critical | User role changed | Log + notify |
| `SESSION_CREATED` | Info | New session created | Log |
| `SESSION_EXPIRED` | Info | Session expired | Log |
| `SESSION_REVOKED` | Warning | Session revoked | Log |
| `UNAUTHORIZED_ACCESS` | Critical | Unauthorized access attempt | Log + alert |
| `RATE_LIMIT_EXCEEDED` | Warning | Rate limit exceeded | Log + block |
| `CSRF_FAILURE` | Critical | CSRF validation failed | Log + block |
| `TURNSTILE_FAILURE` | Warning | CAPTCHA validation failed | Log + rate limit |

### 28.5 Security Event Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Log all auth events** | Login, logout, password change | Security |
| **Log all security events** | Unauthorized access, CSRF failure | Detection |
| **Log admin actions** | Role changes, user management | Compliance |
| **Never log secrets** | No passwords, tokens, keys | Security |
| **Immutable** | Audit logs are append-only | Compliance |
| **Retention** | Keep audit logs for 7 years | Legal requirement |

---

## 29. Login History

### 29.1 What

The login history that tracks all login attempts.

### 29.2 Why

- **Security:** Detect suspicious activity
- **UX:** Users see their login history
- **Compliance:** Meets audit requirements

### 29.3 Where

`api/_handlers/auth/sessions.ts`

### 29.4 Login History Schema

```prisma
model LoginHistory {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ipAddress  String?  @db.VarChar(45)
  userAgent  String?
  deviceName String?
  success    Boolean
  failureReason String?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

### 29.5 Login History Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Log all attempts** | Success and failure | Security |
| **Store IP address** | For tracking | Security |
| **Store user agent** | For device identification | Security |
| **Retention** | Keep for 1 year | Compliance |
| **User visibility** | Users can view own history | Transparency |
| **Admin visibility** | Admins can view all history | Operations |

---

## 30. Account Lifecycle

### 30.1 What

The complete account lifecycle from creation to deletion.

### 30.2 Why

- **Management:** Clear account states
- **Security:** Proper account handling
- **Compliance:** Meets data retention requirements

### 30.3 Where

Account management.

### 30.4 Account States

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACCOUNT LIFECYCLE                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    UNVERIFIED                             │   │
│  │  • Email not verified                                     │   │
│  │  • Limited access                                         │   │
│  │  • Can verify email                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                     verify email                                 │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     ACTIVE                                │   │
│  │  • Full access                                            │   │
│  │  • Can use all features                                   │   │
│  │  • Default state                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                     90 days inactive                             │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    INACTIVE                               │   │
│  │  • Limited access                                         │   │
│  │  • Can reactivate by logging in                           │   │
│  │  • Warning emails sent                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                     180 days inactive                            │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    SUSPENDED                              │   │
│  │  • No access                                              │   │
│  │  • Can appeal via support                                 │   │
│  │  • Admin can reactivate                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                     user request or admin                        │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    DELETED                                │   │
│  │  • Soft deleted (isActive = false)                        │   │
│  │  • Data retained for 30 days                              │   │
│  │  • Can be restored by admin                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                     30 days after delete                         │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    ARCHIVED                               │   │
│  │  • Hard deleted                                           │   │
│  │  • Data permanently removed                               │   │
│  │  • Cannot be restored                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 30.5 Account State Rules

| State | Access | Duration | Recovery |
|-------|--------|----------|----------|
| **Unverified** | Limited | Until verified | Verify email |
| **Active** | Full | Until inactive | N/A |
| **Inactive** | Limited | 90 days → Suspended | Login to reactivate |
| **Suspended** | None | Until admin action | Appeal via support |
| **Deleted** | None | 30 days → Archived | Admin restore |
| **Archived** | None | Permanent | None |

---

## 31. Account Deletion

### 31.1 What

The complete account deletion flow.

### 31.2 Why

- **Compliance:** Right to be forgotten (GDPR)
- **User control:** Users can delete their accounts
- **Security:** Proper data handling

### 31.3 Where

`DELETE /api/auth/account`

### 31.4 Account Deletion Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   ACCOUNT DELETION FLOW                          │
│                                                                  │
│  1. User requests account deletion                               │
│     → POST /api/auth/account/delete                             │
│                                                                  │
│  2. Authenticate                                                  │
│     → Verify user is logged in                                   │
│                                                                  │
│  3. Password verification                                        │
│     → User must enter password                                   │
│                                                                  │
│  4. Check for pending orders                                      │
│     → Cannot delete if orders in progress                        │
│     → Return error if pending orders                             │
│                                                                  │
│  5. Soft delete account                                          │
│     → Set isActive = false                                       │
│     → Set deletedAt = now()                                      │
│                                                                  │
│  6. Invalidate all sessions                                      │
│     → All sessions revoked                                       │
│                                                                  │
│  7. Schedule data deletion                                       │
│     → Data deleted after 30 days                                 │
│     → Retain for legal/compliance                                │
│                                                                  │
│  8. Send confirmation email                                       │
│     → Account deletion confirmed                                 │
│     → 30-day recovery window                                     │
│                                                                  │
│  9. Log deletion                                                 │
│     → Audit log entry                                           │
└─────────────────────────────────────────────────────────────────┘
```

### 31.5 Account Deletion Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Soft delete** | Set isActive = false | Referential integrity |
| **30-day grace** | Data retained for 30 days | Recovery option |
| **Password required** | Must verify password | Security |
| **Pending orders check** | Cannot delete with pending orders | Business rule |
| **Session invalidation** | All sessions revoked | Security |
| **Email confirmation** | Confirmation email sent | Audit trail |
| **Admin restore** | Admin can restore within 30 days | Recovery |

---

## 32. Soft Deletion & Archived Accounts

### 32.1 What

The soft deletion and archival strategy for accounts.

### 32.2 Why

- **Referential integrity:** Deleted accounts don't break FK references
- **Recovery:** Accidental deletions can be undone
- **Compliance:** Meets data retention requirements

### 32.3 Where

Database schema, account management.

### 32.4 Soft Deletion Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Use isActive boolean** | Not `deletedAt` timestamp | Simpler queries |
| **Default to true** | New accounts are active | No accidental deletes |
| **Never hard delete** | Keep all records | Referential integrity |
| **Index isActive** | Partial index for active records | Query performance |
| **Filter by default** | Always filter isActive: true | Show only active records |
| **Admin can restore** | Set isActive = true | Undo accidental deletes |

### 32.5 Archival Strategy

| Scenario | Strategy | Rationale |
|----------|----------|-----------|
| **Soft delete** | Set isActive = false | Default for all accounts |
| **Archive old sessions** | Delete after 30 days | Security, storage |
| **Archive old audit logs** | Move to audit_log_archive table | Performance |
| **Permanent deletion** | After 30-day grace period | Compliance |

---

## 33. Guest Experience

### 33.1 What

The guest user experience and capabilities.

### 33.2 Why

- **Conversion:** Minimize friction for first-time visitors
- **UX:** Guests can browse and add to cart
- **Security:** Guests cannot access sensitive data

### 33.3 Where

Public storefront.

### 33.4 Guest Capabilities

| Capability | Allowed | Rationale |
|------------|---------|-----------|
| Browse products | Yes | Revenue driver |
| View product details | Yes | Revenue driver |
| Search products | Yes | Discovery |
| Add to cart | Yes | Conversion funnel |
| Checkout as guest | Yes | Conversion optimization |
| View order tracking | Yes (with order number) | Customer service |
| Create account | Yes | Registration |
| Login | Yes | Authentication |
| Access admin panel | No | Security |
| Manage users | No | Security |
| View other users' data | No | Privacy |

### 33.5 Guest → Customer Conversion

| Trigger | Action | Incentive |
|---------|--------|-----------|
| **Checkout** | Prompt to create account | Save address, track orders |
| **Cart abandonment** | Email reminder (if email collected) | Recover sale |
| **Browse history** | Show recently viewed | Re-engagement |
| **Wishlist** | Prompt to login to save wishlist | Engagement |

---

## 34. Customer → Shop Owner Conversion

### 34.1 What

The flow for customers to become shop owners (future marketplace feature).

### 34.2 Why

- **Growth:** Enable marketplace model
- **Revenue:** Commission on sales
- **Engagement:** sellers become power users

### 34.3 Where

Future: `POST /api/seller/apply`

### 34.4 Customer → Shop Owner Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Application required** | Must apply to become seller | Quality control |
| **Admin approval** | Admin must approve application | Security |
| **Identity verification** | Must verify identity | Compliance |
| **Business verification** | Must verify business (if applicable) | Compliance |
| **Role upgrade** | Role changed from 'customer' to 'shop_owner' | Business rule |
| **Data preservation** | Customer data preserved during upgrade | UX |

---

## 35. Shop Owner → Customer Conversion

### 35.1 What

The flow for shop owners to revert to customer status.

### 35.2 Why

- **Flexibility:** Sellers can stop selling
- **UX:** No need to create new account
- **Data preservation:** Keep order history

### 35.3 Where

Seller dashboard.

### 35.4 Shop Owner → Customer Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **No pending orders** | Cannot convert with pending orders | Business rule |
| **No active listings** | Must deactivate all listings first | Business rule |
| **Role downgrade** | Role changed from 'shop_owner' to 'customer' | Business rule |
| **Data preservation** | Seller data preserved | Analytics |
| **Confirmation required** | Must confirm conversion | Security |

---

## 36. Admin-Only Operations

### 36.1 What

Operations that only administrators can perform.

### 36.2 Why

- **Security:** Critical operations restricted
- **Compliance:** Meets access control requirements
- **Auditability:** Admin actions logged

### 36.3 Where

Admin panel, admin API endpoints.

### 36.4 Admin-Only Operations

| Operation | Endpoint | Rationale |
|-----------|----------|-----------|
| User management | `GET/PATCH/DELETE /api/admin/users` | Platform management |
| Role assignment | `PATCH /api/admin/users/:id/role` | Access control |
| Order management | `PATCH /api/admin/orders/:id` | Operations |
| Product CRUD | `POST/PATCH/DELETE /api/admin/products` | Catalog management |
| Settings | `PATCH /api/admin/settings` | Platform configuration |
| Analytics | `GET /api/admin/analytics` | Business intelligence |
| Audit logs | `GET /api/admin/audit-logs` | Compliance |
| System health | `GET /api/admin/health` | Operations |

---

## 37. Permission Conflicts

### 37.1 What

How permission conflicts are resolved.

### 37.2 Why

- **Clarity:** Clear rules for conflict resolution
- **Security:** Default to most restrictive
- **Predictability:** Consistent behavior

### 37.3 Where

Permission checking.

### 37.4 Permission Conflict Rules

| Conflict | Resolution | Rationale |
|----------|------------|-----------|
| **Role vs override** | Override wins | Explicit grant |
| **Multiple roles** | Most permissive wins | User benefit |
| **Resource ownership** | Owner wins | Privacy |
| **Admin override** | Admin wins | Platform management |
| **Default deny** | Deny wins | Security |

---

## 38. Inactive Accounts

### 38.1 What

How inactive accounts are handled.

### 38.2 Why

- **Security:** Limit exposure of abandoned accounts
- **UX:** Notify users before deactivation
- **Compliance:** Meets data retention requirements

### 38.3 Where

Account management.

### 38.4 Inactive Account Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **90 days inactive** | Account marked inactive | Security |
| **Warning emails** | Send before deactivation | UX |
| **Login reactivates** | Login restores active status | UX |
| **180 days inactive** | Account suspended | Security |
| **Admin notification** | Notify admin of suspensions | Operations |
| **Data retention** | Data retained for 1 year | Compliance |

---

## 39. Security Requirements

### 39.1 What

Security requirements for the identity system.

### 39.2 Why

- **Protection:** Prevent common attacks
- **Compliance:** Meets security standards
- **Trust:** Users trust platform with their data

### 39.3 Where

All authentication and authorization flows.

### 39.4 Security Requirements

| Requirement | Standard | Rationale |
|-------------|----------|-----------|
| **Least privilege** | Users get minimum required permissions | Security |
| **Secure defaults** | Default deny, require explicit permission | Security |
| **Zero trust** | Every request validated regardless of source | Security |
| **Brute-force protection** | Rate limiting + lockout | Security |
| **Session hijacking prevention** | httpOnly cookies, token rotation | Security |
| **CSRF protection** | Double-submit cookie pattern | Security |
| **XSS prevention** | httpOnly cookies, no localStorage | Security |
| **Secure password policy** | Strong passwords required | Security |
| **Secure token handling** | Tokens hashed before storage | Security |
| **Secure logout** | Session invalidation, cookie clearing | Security |
| **Secure account recovery** | Identity verification required | Security |
| **Audit logging** | All security events logged | Compliance |

---

## 40. UX Requirements

### 40.1 What

UX requirements for authentication flows.

### 40.2 Why

- **Conversion:** Minimize friction
- **Satisfaction:** Users enjoy the experience
- **Accessibility:** Everyone can use the platform

### 40.3 Where

All authentication UI.

### 40.4 UX Requirements

| Requirement | Standard | Rationale |
|-------------|----------|-----------|
| **Minimal steps** | Fewest clicks to complete | Conversion |
| **Clear feedback** | Success/error messages | UX |
| **Beginner-friendly** | Clear labels, helpful hints | Accessibility |
| **Fast login** | < 2 seconds to authenticate | UX |
| **Mobile-first** | Optimized for thumb | 70%+ mobile traffic |
| **Easy account recovery** | Simple reset flow | UX |
| **Accessible forms** | Labels, ARIA, keyboard support | Accessibility |
| **Consistent experience** | Same patterns everywhere | Predictability |

---

## 41. Future Readiness

### 41.1 What

Readiness for future authentication features.

### 41.2 Why

- **Scalability:** Platform grows without rewrites
- **Innovation:** Ready for new auth methods
- **Competitive:** Stay ahead of requirements

### 41.3 Where

Architecture planning.

### 41.4 Future Readiness

| Feature | Readiness | Implementation |
|---------|-----------|----------------|
| **Social login** | Schema ready | Add OAuth providers |
| **MFA** | Schema ready | Add MFA table + flow |
| **SSO** | Schema ready | Add SAML/OIDC support |
| **Passkeys** | Schema ready | Add WebAuthn support |
| **Phone login** | Schema ready | Add phone verification |
| **Biometric** | Schema ready | Add biometric auth |

---

## 42. Database Schema

### 42.1 What

The complete database schema for identity and access management.

### 42.2 Why

- **Data integrity:** Proper schema prevents bad data
- **Performance:** Proper indexes ensure fast queries
- **Security:** Proper access patterns prevent attacks

### 42.3 Where

`prisma/schema.prisma`

### 42.4 Identity Schema

```prisma
// ─── Enums ──────────────────────────────────────────────────
enum UserRole {
  customer
  shop_owner
  admin
}

enum AccountStatus {
  unverified
  active
  inactive
  suspended
  deleted
  archived
}

// ─── Identity Models ────────────────────────────────────────
model User {
  id            String        @id @default(uuid())
  email         String        @unique
  password      String
  firstName     String        @db.VarChar(100)
  lastName      String        @db.VarChar(100)
  role          UserRole      @default(customer)
  status        AccountStatus @default(unverified)
  emailVerified Boolean       @default(false)
  phoneVerified Boolean       @default(false)
  phone         String?       @db.VarChar(20)
  avatarUrl     String?
  preferences   Json?
  lastLoginAt   DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  sessions              Session[]
  addresses             Address[]
  orders                Order[]
  cart                  Cart?
  wishlist              Wishlist[]
  reviews               Review[]
  loginHistory          LoginHistory[]
  passwordResets        PasswordReset[]

  @@index([email])
  @@index([role])
  @@index([status])
  @@index([createdAt])
}

model Session {
  id             String    @id @default(uuid())
  userId         String
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken    String    @unique
  refreshToken   String    @unique
  csrfToken      String
  ipAddress      String?   @db.VarChar(45)
  userAgent      String?
  deviceName     String?
  isActive       Boolean   @default(true)
  expiresAt      DateTime
  lastAccessedAt DateTime  @default(now())
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([userId])
  @@index([accessToken])
  @@index([refreshToken])
  @@index([expiresAt])
  @@index([isActive])
}

model LoginHistory {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ipAddress     String?  @db.VarChar(45)
  userAgent     String?
  deviceName    String?
  success       Boolean
  failureReason String?
  createdAt     DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
  @@index([success])
}

model PasswordReset {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}

model EmailVerification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@index([expiresAt])
}
```

### 42.5 Schema Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **UUID v4 primary keys** | All tables use UUID v4 | Globally unique |
| **Timestamps** | createdAt + updatedAt on all tables | Audit trail |
| **Foreign keys indexed** | All FK columns indexed | Query performance |
| **Cascade delete** | User owns sessions, login history | Data integrity |
| **Soft delete** | User status instead of hard delete | Referential integrity |
| **Unique constraints** | Email, tokens unique | Data integrity |

---

## 43. API Endpoints

### 43.1 What

Complete list of authentication API endpoints.

### 43.2 Why

- **Consistency:** All endpoints follow same patterns
- **Documentation:** Clear API reference
- **Development:** Clear implementation guide

### 43.3 Where

`api/_handlers/auth/`

### 43.4 Auth Endpoints

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| `POST` | `/api/auth/register` | No | 10/min | Register new account |
| `POST` | `/api/auth/login` | No | 20/min | Login |
| `POST` | `/api/auth/logout` | Yes | None | Logout |
| `POST` | `/api/auth/refresh` | Yes | None | Refresh access token |
| `POST` | `/api/auth/password-reset` | No | 5/hr | Request password reset |
| `POST` | `/api/auth/password-reset/confirm` | No | 5/hr | Confirm password reset |
| `POST` | `/api/auth/verify-email` | No | 10/min | Verify email |
| `POST` | `/api/auth/verify-email/resend` | No | 3/hr | Resend verification |
| `PATCH` | `/api/auth/profile` | Yes | None | Update profile |
| `PATCH` | `/api/auth/password` | Yes | None | Change password |
| `GET` | `/api/auth/sessions` | Yes | None | List active sessions |
| `DELETE` | `/api/auth/sessions/:id` | Yes | None | Revoke session |
| `DELETE` | `/api/auth/sessions` | Yes | None | Revoke all sessions |
| `DELETE` | `/api/auth/account` | Yes | None | Delete account |

---

## 44. Error Handling

### 44.1 What

Authentication-specific error handling.

### 44.2 Why

- **Consistency:** Same error format everywhere
- **Security:** Don't leak sensitive information
- **UX:** Clear error messages

### 44.3 Where

All authentication endpoints.

### 44.4 Auth Error Codes

| Code | Status | Message | Rationale |
|------|--------|---------|-----------|
| `UNAUTHORIZED` | 401 | Authentication required | No session |
| `INVALID_CREDENTIALS` | 401 | Invalid email or password | Wrong credentials |
| `SESSION_EXPIRED` | 401 | Session expired | Token expired |
| `FORBIDDEN` | 403 | Insufficient permissions | Wrong role |
| `CSRF_INVALID` | 403 | Invalid CSRF token | CSRF failure |
| `TURNSTILE_INVALID` | 403 | Invalid CAPTCHA | Bot detected |
| `EMAIL_EXISTS` | 409 | Email already registered | Duplicate email |
| `EMAIL_NOT_VERIFIED` | 403 | Email not verified | Unverified account |
| `ACCOUNT_LOCKED` | 423 | Account temporarily locked | Too many failures |
| `ACCOUNT_SUSPENDED` | 403 | Account suspended | Suspended account |
| `ACCOUNT_DELETED` | 403 | Account deleted | Deleted account |
| `PASSWORD_RESET_EXPIRED` | 400 | Reset link expired | Token expired |
| `PASSWORD_RESET_USED` | 400 | Reset link already used | Token used |
| `EMAIL_VERIFICATION_EXPIRED` | 400 | Verification link expired | Token expired |
| `WEAK_PASSWORD` | 400 | Password too weak | Password policy |

### 44.5 Error Handling Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Don't reveal existence** | Same error for wrong email/password | Security |
| **Don't leak tokens** | Never include tokens in errors | Security |
| **User-friendly messages** | Clear, actionable messages | UX |
| **Log technical details** | Log details for debugging | Debuggability |
| **Consistent format** | Same error response format | API consistency |

---

## 45. Mandatory Rules for AI Agents

### 45.1 What

Rules that every AI agent MUST follow when implementing authentication and authorization.

### 45.2 Why

- **Consistency:** All implementations follow same patterns
- **Security:** No security shortcuts
- **Quality:** Enterprise-grade code

### 45.3 Where

All authentication and authorization code.

### 45.4 Mandatory Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never duplicate permission logic** | Use centralized authorization | DRY |
| **Never hardcode roles** | Use role constants from schema | Maintainability |
| **Never mix auth with business logic** | Keep authentication independent | Separation of concerns |
| **Keep auth independent** | Auth module has no feature dependencies | Modularity |
| **Keep authorization centralized** | All permission checks in one place | Auditability |
| **Always authenticate before authorizing** | Know who before what | Security |
| **Always validate input** | Zod schema validation | Security |
| **Always rate limit auth endpoints** | Prevent abuse | Security |
| **Always log security events** | Audit trail | Compliance |
| **Never expose tokens in errors** | Security best practice | Security |
| **Always use httpOnly cookies** | Never localStorage for tokens | XSS prevention |
| **Always hash tokens before storage** | Security best practice | Security |
| **Always enforce max sessions** | Prevent abuse | Security |
| **Always invalidate sessions on password change** | Security best practice | Security |
| **Always verify email before full access** | Security best practice | Security |
| **Always use secure cookie settings** | httpOnly, secure, sameSite | Security |
| **Always implement CSRF protection** | Double-submit cookie pattern | Security |
| **Always implement rate limiting** | Prevent brute force | Security |
| **Always audit log security events** | Compliance | Compliance |
| **Build for future expansion** | Social login, MFA, SSO ready | Future-proof |

---

## Summary

This document establishes the complete Identity & Access Management architecture for the Nabome platform. Every AI agent must follow these standards to ensure:

1. **Enterprise-grade security** across all authentication and authorization flows
2. **Consistent patterns** for session management, token handling, and permission checking
3. **Future-proof design** ready for social login, MFA, and SSO
4. **Comprehensive audit logging** for compliance and security monitoring
5. **Mobile-first UX** with minimal friction for users
6. **Modular architecture** where authentication is independent from business logic

---

*Last updated: August 03, 2026*
