# নবME (Nabome) — API & Service Architecture Standards

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for API and service design  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), DATABASE_ARCHITECTURE.md (v1.0), and FOLDER_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [API Philosophy](#1-api-philosophy)
2. [Module Communication](#2-module-communication)
3. [Service Boundaries](#3-service-boundaries)
4. [Internal Services](#4-internal-services)
5. [API Classification](#5-api-classification)
6. [Authentication Flow](#6-authentication-flow)
7. [Authorization Flow](#7-authorization-flow)
8. [Session Handling](#8-session-handling)
9. [Request Lifecycle](#9-request-lifecycle)
10. [Response Structure](#10-response-structure)
11. [Error Handling](#11-error-handling)
12. [Validation Pipeline](#12-validation-pipeline)
13. [API Versioning](#13-api-versioning)
14. [Pagination](#14-pagination)
15. [Filtering](#15-filtering)
16. [Sorting](#16-sorting)
17. [Searching](#17-searching)
18. [File Upload APIs](#18-file-upload-apis)
19. [Background Job Communication](#19-background-job-communication)
20. [Notification Services](#20-notification-services)
21. [Document Generation Services](#21-document-generation-services)
22. [Finance Services](#22-finance-services)
23. [Storage Services](#23-storage-services)
24. [Search Services](#24-search-services)
25. [Logging Services](#25-logging-services)
26. [Audit Services](#26-audit-services)
27. [Cache Strategy](#27-cache-strategy)
28. [Rate Limiting](#28-rate-limiting)
29. [Retry Strategy](#29-retry-strategy)
30. [Timeout Strategy](#30-timeout-strategy)
31. [Idempotency](#31-idempotency)
32. [Event Communication](#32-event-communication)
33. [Queue Integration](#33-queue-integration)
34. [Webhook Readiness](#34-webhook-readiness)
35. [Third-Party Integration Strategy](#35-third-party-integration-strategy)
36. [Future Microservice Readiness](#36-future-microservice-readiness)
37. [Naming Standards](#37-naming-standards)
38. [HTTP Standards](#38-http-standards)
39. [API Documentation](#39-api-documentation)
40. [API Testing](#40-api-testing)
41. [Architectural Rules](#41-architectural-rules)

---

## 1. API Philosophy

### 1.1 What

The foundational principles guiding all API design decisions for the Nabome platform.

### 1.2 Why

- **Consistency:** Every endpoint behaves the same way
- **Predictability:** Developers can guess API behavior correctly
- **Scalability:** APIs grow without breaking existing consumers
- **Security:** Every endpoint is secure by default
- **Developer Experience:** Easy to learn, easy to use

### 1.3 Where

Every API endpoint, service interface, and inter-module communication.

### 1.4 Core Principles

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **REST-first** | Use REST for all CRUD operations | Standard, cacheable, predictable |
| **Resource-oriented** | URLs represent resources, not actions | Clear mental model |
| **Consistent responses** | Same format everywhere | Frontend can parse uniformly |
| **Fail fast** | Validate early, return clear errors | Better UX, easier debugging |
| **Secure by default** | Auth + validation on every endpoint | No accidental exposure |
| **Stateless** | No server-side session state | Edge-compatible, scalable |
| **Idempotent** | Safe to retry operations | Network resilience |
| **Versioned** | Breaking changes get new versions | Backward compatibility |

### 1.5 What NOT to Do

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| RPC-style URLs (`/api/createProduct`) | Not RESTful, not cacheable | Use `POST /api/products` |
| Different response formats per endpoint | Frontend can't parse uniformly | Use standard `{ success, data, error, meta }` |
| Exposing database structure | Couples frontend to schema | Use DTOs (Data Transfer Objects) |
| Returning full objects | Over-fetching, performance waste | Use `select` in Prisma |
| No error handling | Silent failures, hard debugging | Use typed error classes |
| Hardcoded URLs | Fragile, breaks on change | Use configuration |

---

## 2. Module Communication

### 2.1 What

How different application modules communicate with each other.

### 2.2 Why

- **Decoupling:** Modules can change independently
- **Testability:** Modules can be mocked in isolation
- **Maintainability:** Changes don't cascade across modules
- **Scalability:** Modules can be scaled independently

### 2.3 Where

All communication between `api/_handlers/` and `api/_lib/`.

### 2.4 Communication Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Handlers never call handlers** | Handlers are isolated | Prevents tight coupling |
| **Handlers use services** | Services handle cross-cutting concerns | Reusable logic |
| **Services never call handlers** | Services are infrastructure, not business | Clear separation |
| **Services communicate via interfaces** | Not direct imports | Testability |
| **Shared state via database** | Not in-memory state | Edge-compatible |

### 2.5 Module Dependency Matrix

| From \ To | Handlers | Services | Database | External |
|-----------|----------|----------|----------|----------|
| **Handlers** | ✗ | ✓ | ✓ | ✗ |
| **Services** | ✗ | ✓ | ✓ | ✓ |
| **Database** | ✗ | ✗ | — | ✗ |
| **External** | ✗ | ✗ | ✗ | — |

### 2.6 Communication Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE COMMUNICATION FLOW                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Handler Layer (Business Logic)               │   │
│  │                                                          │   │
│  │  • One function per endpoint                             │   │
│  │  • Orchestrates services                                 │   │
│  │  • Never calls other handlers                            │   │
│  │  • Returns standardized responses                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Service Layer (Infrastructure)               │   │
│  │                                                          │   │
│  │  • EmailService (Resend)                                 │   │
│  │  • CacheService (KV)                                     │   │
│  │  • AuditService (Database)                               │   │
│  │  • PaymentService (Razorpay)                             │   │
│  │  • StorageService (R2)                                   │   │
│  │  • SearchService (pg_trgm)                               │   │
│  │  • NotificationService (Email + future SMS/Push)         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Infrastructure Layer                         │   │
│  │                                                          │   │
│  │  • Prisma (Database)                                     │   │
│  │  • Resend (Email)                                        │   │
│  │  • Razorpay (Payments)                                   │   │
│  │  • Cloudflare KV (Cache)                                 │   │
│  │  • Cloudflare R2 (Storage)                               │   │
│  │  • Cloudflare D1 (Analytics - future)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Service Boundaries

### 3.1 What

Clear boundaries between services that prevent tight coupling.

### 3.2 Why

- **Independent Development:** Services can be modified without affecting others
- **Testability:** Services can be mocked or stubbed in tests
- **Reusability:** Services can be used by multiple handlers
- **Scalability:** Services can be scaled independently

### 3.3 Where

All services in `api/_lib/`.

### 3.4 Service Boundaries Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Single responsibility** | One service, one concern | Easy to understand |
| **No business logic** | Services handle infrastructure only | Clear separation |
| **Dependency injection** | Services receive config via constructor | Testability |
| **Interface-based** | Services expose interfaces, not implementations | Swappable |
| **Error propagation** | Services throw typed errors | Consistent error handling |
| **No cross-service calls** | Handlers orchestrate, services execute | Prevents tight coupling |

### 3.5 Service Interface Pattern

```typescript
// ✓ CORRECT: Service interface
export interface IEmailService {
  sendOrderConfirmation(order: Order): Promise<void>;
  sendPasswordReset(email: string, token: string): Promise<void>;
  sendWelcome(email: string, firstName: string): Promise<void>;
}

// ✓ CORRECT: Service implementation
export class EmailService implements IEmailService {
  constructor(private resend: Resend) {}

  async sendOrderConfirmation(order: Order): Promise<void> {
    await this.resend.emails.send({
      from: 'orders@nabome.online',
      to: order.email,
      subject: `Order ${order.orderNumber} confirmed`,
      react: OrderConfirmationTemplate({ order }),
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    await this.resend.emails.send({
      from: 'security@nabome.online',
      to: email,
      subject: 'Password reset requested',
      react: PasswordResetTemplate({ token }),
    });
  }

  async sendWelcome(email: string, firstName: string): Promise<void> {
    await this.resend.emails.send({
      from: 'hello@nabome.online',
      to: email,
      subject: 'Welcome to Nabome!',
      react: WelcomeTemplate({ firstName }),
    });
  }
}

// ✗ WRONG: Service with business logic
export class EmailService {
  async processOrder(order: Order) {
    // This is business logic, not email service
    const updatedOrder = await this.db.order.update({
      where: { id: order.id },
      data: { status: 'confirmed' },
    });
    await this.sendConfirmation(updatedOrder);
  }
}
```

---

## 4. Internal Services

### 4.1 What

Standard list of internal services and their responsibilities.

### 4.2 Why

- **Consistency:** Every team uses the same services
- **Reusability:** No duplicate implementations
- **Maintainability:** One place to fix bugs
- **Testability:** Services can be mocked uniformly

### 4.3 Where

All services in `api/_lib/`.

### 4.4 Service Registry

| Service | Location | Responsibility |
|---------|----------|----------------|
| **AuthService** | `api/_lib/auth/` | Authentication, session management |
| **DatabaseService** | `api/_lib/database/` | Prisma client, query helpers |
| **EmailService** | `api/_lib/email/` | Transactional emails (Resend) |
| **PaymentService** | `api/_lib/payments/` | Razorpay integration |
| **CacheService** | `api/_lib/cache/` | KV caching |
| **StorageService** | `api/_lib/storage/` | R2 file storage |
| **AuditService** | `api/_lib/audit/` | Audit logging |
| **RateLimitService** | `api/_lib/security/` | Rate limiting |
| **ValidationService** | `api/_lib/validation/` | Zod validation |
| **SearchService** | `api/_lib/search/` | Full-text search (pg_trgm) |
| **NotificationService** | `api/_lib/notifications/` | Multi-channel notifications |
| **MediaService** | `api/_lib/media/` | Image/video processing |
| **LogService** | `api/_lib/logging/` | Structured logging (Pino) |

### 4.5 Service Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE DEPENDENCY GRAPH                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    AuthService                           │   │
│  │  Dependencies: DatabaseService, CacheService, LogService │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  NotificationService                     │   │
│  │  Dependencies: EmailService, LogService                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   PaymentService                         │   │
│  │  Dependencies: DatabaseService, AuditService, LogService │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   CacheService                           │   │
│  │  Dependencies: None (leaf service)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  DatabaseService                         │   │
│  │  Dependencies: None (leaf service)                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. API Classification

### 5.1 What

How APIs are classified by access level and consumer.

### 5.2 Why

- **Security:** Different access levels require different protection
- **Documentation:** Clear which APIs are for which consumers
- **Rate Limiting:** Different limits for different consumers
- **Versioning:** Public APIs need stricter versioning

### 5.3 Where

All API endpoints in `api/_handlers/`.

### 5.4 API Types

| Type | Path | Auth | Rate Limit | Audience |
|------|------|------|------------|----------|
| **Public** | `/api/products/*`, `/api/categories/*` | None | Low | Anyone |
| **Shop** | `/api/cart/*`, `/api/checkout/*` | Customer | Medium | Logged-in customers |
| **Customer** | `/api/account/*`, `/api/orders/*` | Customer | Medium | Logged-in customers |
| **Admin** | `/api/admin/*` | Admin | High | Admin panel |
| **Webhook** | `/api/webhooks/*` | Signature | None | Third-party services |
| **Internal** | `/api/health`, `/api/debug` | None | None | System monitoring |

### 5.5 API Classification Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Public APIs** | No auth, high cacheability | SEO, performance |
| **Shop APIs** | Session auth, medium cache | Customer experience |
| **Customer APIs** | Session auth, no cache | Personal data |
| **Admin APIs** | Admin role, no cache | Sensitive operations |
| **Webhook APIs** | Signature verification | Third-party trust |
| **Internal APIs** | Network-only access | System monitoring |

---

## 6. Authentication Flow

### 6.1 What

Standard authentication flow for all protected endpoints.

### 6.2 Why

- **Security:** Consistent authentication across all endpoints
- **User Experience:** Seamless login/logout flows
- **Compliance:** Meets enterprise security requirements

### 6.3 Where

All endpoints in `api/_handlers/auth/` and protected endpoints in other handlers.

### 6.4 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTHENTICATION FLOW                            │
│                                                                  │
│  1. User submits credentials                                     │
│     → POST /api/auth/login                                      │
│                                                                  │
│  2. Validate input (Zod)                                         │
│     → Email format, password length                              │
│                                                                  │
│  3. Verify Turnstile CAPTCHA                                     │
│     → Prevent bot attacks                                        │
│                                                                  │
│  4. Authenticate with Supabase Auth                              │
│     → Verify email/password                                      │
│                                                                  │
│  5. Create session in database                                   │
│     → auth_sessions table                                        │
│                                                                  │
│  6. Set httpOnly cookies                                         │
│     → access_token (15min)                                       │
│     → refresh_token (7 days)                                     │
│     → csrf_token (4 hours)                                       │
│                                                                  │
│  7. Return user data                                             │
│     → Profile info (not tokens)                                  │
│                                                                  │
│  8. Client stores user in Zustand                                │
│     → Auth store updated                                         │
│                                                                  │
│  9. Redirect to previous page                                    │
│     → Or homepage                                                │
└─────────────────────────────────────────────────────────────────┘
```

### 6.5 Authentication Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly cookies** | Never store tokens in localStorage | Prevent XSS theft |
| **Short access tokens** | 15-minute TTL | Security |
| **Long refresh tokens** | 7-day TTL | User experience |
| **CSRF protection** | Double-submit cookie pattern | Prevent CSRF |
| **Session rotation** | On sensitive operations | Prevent session fixation |
| **Max sessions** | 5 per user | Prevent abuse |
| **Brute force protection** | Rate limiting + lockout | Security |

### 6.6 Authentication Middleware

```typescript
// ✓ CORRECT: Authentication middleware
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

// ✓ CORRECT: Optional authentication
export async function optionalAuth(request: Request): Promise<User | null> {
  try {
    return await authenticate(request);
  } catch {
    return null;
  }
}
```

---

## 7. Authorization Flow

### 7.1 What

Standard authorization flow for all protected resources.

### 7.2 Why

- **Security:** Users can only access what they're allowed to
- **Compliance:** Meets enterprise access control requirements
- **Auditability:** All access attempts are logged

### 7.3 Where

All endpoints that require role-based or resource-based access control.

### 7.4 Authorization Types

| Type | Description | Example |
|------|-------------|---------|
| **Role-based** | Check user role | Admin-only endpoints |
| **Resource-based** | Check resource ownership | Customer's own orders |
| **Permission-based** | Check specific permission | Future granular permissions |

### 7.5 Authorization Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always after auth** | Authorization happens after authentication | Must know who before what |
| **Fail closed** | Deny by default | Security first |
| **Log all denials** | Audit trail for security | Compliance |
| **Ownership check** | Customers can only access their own data | Privacy |
| **Admin override** | Admins can access all resources | Business requirement |

### 7.6 Authorization Middleware

```typescript
// ✓ CORRECT: Role-based authorization
export function authorize(user: User, role: UserRole): void {
  if (user.role !== role) {
    throw new ForbiddenError('Insufficient permissions');
  }
}

// ✓ CORRECT: Resource ownership check
export async function authorizeOwnership(
  user: User,
  resource: { profileId: string }
): Promise<void> {
  if (user.role !== 'admin' && resource.profileId !== user.id) {
    throw new ForbiddenError('Access denied');
  }
}

// ✓ CORRECT: Usage in handler
export async function getOrderDetail(request: Request, orderId: string) {
  const user = await authenticate(request);
  const order = await db.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new NotFoundError('Order');
  }

  // Ownership check
  await authorizeOwnership(user, order);

  return success(order);
}
```

---

## 8. Session Handling

### 8.1 What

Standard for managing user sessions.

### 8.2 Why

- **Security:** Proper session lifecycle prevents attacks
- **User Experience:** Seamless login/logout
- **Performance:** Efficient session storage and retrieval

### 8.3 Where

All authentication flows and protected endpoints.

### 8.4 Session Schema

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
  isActive     Boolean  @default(true)
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([userId])
  @@index([accessToken])
  @@index([refreshToken])
  @@index([expiresAt])
}
```

### 8.5 Session Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly cookies** | Tokens stored in httpOnly cookies | Prevent XSS |
| **Secure cookies** | HTTPS only | Prevent MITM |
| **SameSite lax** | CSRF protection | Prevent CSRF |
| **Token rotation** | On sensitive operations | Security |
| **Max sessions** | 5 per user | Prevent abuse |
| **Session cleanup** | Delete expired sessions | Performance |
| **IP tracking** | Log IP for audit | Security |

### 8.6 Cookie Configuration

```typescript
// ✓ CORRECT: Cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
};

// Access token (15 minutes)
setCookie('access_token', accessToken, {
  ...cookieOptions,
  maxAge: 15 * 60,
});

// Refresh token (7 days)
setCookie('refresh_token', refreshToken, {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60,
});

// CSRF token (4 hours, readable by client)
setCookie('csrf_token', csrfToken, {
  ...cookieOptions,
  httpOnly: false,
  maxAge: 4 * 60 * 60,
});
```

---

## 9. Request Lifecycle

### 9.1 What

The complete lifecycle of an API request from client to response.

### 9.2 Why

- **Consistency:** Every request follows the same path
- **Debuggability:** Clear understanding of where issues occur
- **Performance:** Identify bottlenecks in the pipeline

### 9.3 Where

Every API endpoint.

### 9.4 Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    REQUEST LIFECYCLE                              │
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
│  5. Authentication (if required)                                 │
│     → Extract session from cookies                              │
│     → Validate session                                          │
│     → Return 401 if unauthenticated                             │
│                                                                  │
│  6. Authorization (if required)                                  │
│     → Check user role                                           │
│     → Check resource ownership                                  │
│     → Return 403 if unauthorized                                │
│                                                                  │
│  7. Input validation                                             │
│     → Zod schema validation                                     │
│     → Return 400 if invalid                                     │
│                                                                  │
│  8. Business logic                                               │
│     → Handler executes service calls                            │
│     → Services interact with infrastructure                     │
│                                                                  │
│  9. Response construction                                        │
│     → Standard format: { success, data, error, meta }           │
│     → Set appropriate status code                               │
│                                                                  │
│  10. Audit logging (if required)                                 │
│      → Log request details                                      │
│      → Log response status                                      │
│                                                                  │
│  11. Response sent to client                                     │
│      → HTTP response with headers                               │
└─────────────────────────────────────────────────────────────────┘
```

### 9.5 Request Lifecycle Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Validate first** | Input validation before business logic | Fail fast |
| **Auth before business** | Authentication before any operations | Security |
| **Authz after auth** | Authorization after authentication | Must know who |
| **Audit last** | Audit logging after response | Don't block response |
| **Fail fast** | Return error as soon as detected | Better UX |
| **Log everything** | Structured logging for debugging | Observability |

---

## 10. Response Structure

### 10.1 What

Standard response format for all API endpoints.

### 10.2 Why

- **Consistency:** Frontend can parse uniformly
- **Type Safety:** TypeScript interfaces for all responses
- **Debuggability:** Clear error information

### 10.3 Where

Every API endpoint.

### 10.4 Response Format

```typescript
// ✓ CORRECT: Standardized response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 10.5 Response Examples

```typescript
// Success response (single resource)
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Premium Cotton T-Shirt",
    "slug": "premium-cotton-t-shirt",
    "basePrice": 2999
  }
}

// Success response (list with pagination)
{
  "success": true,
  "data": [
    { "id": "uuid1", "name": "Product 1" },
    { "id": "uuid2", "name": "Product 2" }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}

// Not found response
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

### 10.6 Response Helper Functions

```typescript
// ✓ CORRECT: Response helpers
export function success<T>(data: T, statusCode = 200): Response {
  return new Response(
    JSON.stringify({ success: true, data }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export function successWithMeta<T>(
  data: T,
  meta: PaginationMeta,
  statusCode = 200
): Response {
  return new Response(
    JSON.stringify({ success: true, data, meta }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export function error(
  code: string,
  statusCode: number,
  message: string,
  details?: Record<string, string[]>
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: { code, message, details },
    }),
    {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
```

---

## 11. Error Handling

### 11.1 What

Standard error handling across all API endpoints.

### 11.2 Why

- **Consistency:** Same error format everywhere
- **Debuggability:** Clear error information for developers
- **User Experience:** Meaningful error messages for users
- **Security:** No sensitive information leaked

### 11.3 Where

Every function that can fail.

### 11.4 Error Classes

```typescript
// ✓ CORRECT: Typed error classes
export class AppError extends Error {
  constructor(
    public code: string,
    public statusCode: number,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super('VALIDATION_ERROR', 400, 'Validation failed', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', 404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super('FORBIDDEN', 403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super('CONFLICT', 409, message);
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('RATE_LIMIT_EXCEEDED', 429, 'Too many requests');
  }
}

export class BusinessRuleError extends AppError {
  constructor(code: string, message: string) {
    super(code, 422, message);
  }
}
```

### 11.5 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `UNPROCESSABLE_ENTITY` | 422 | Business rule violation |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `INSUFFICIENT_STOCK` | 422 | Product out of stock |
| `PAYMENT_FAILED` | 422 | Payment processing failed |
| `COUPON_INVALID` | 422 | Coupon code invalid |
| `ADDRESS_INVALID` | 422 | Address validation failed |

### 11.6 Error Handling Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never expose internals** | Don't leak stack traces or DB errors | Security |
| **Log unexpected errors** | Use Pino logger | Debugging |
| **Return user-friendly messages** | Technical details in logs only | UX |
| **Use error codes** | Machine-readable error codes | Frontend parsing |
| **Field-level details** | Validation errors include field names | Better UX |

### 11.7 Error Handler Pattern

```typescript
// ✓ CORRECT: Handler error handling
export async function createProduct(request: Request, env: Env) {
  try {
    const user = await authenticate(request);
    authorize(user, 'admin');
    const body = await validateRequest(request, schema);
    const product = await db.product.create({ data: body });
    return success(product, 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.code, error.statusCode, error.message, error.details);
    }
    logger.error({ error, requestId: getRequestId(request) }, 'Unexpected error');
    return errorResponse('INTERNAL_ERROR', 500, 'An unexpected error occurred');
  }
}
```

---

## 12. Validation Pipeline

### 12.1 What

Standard input validation using Zod schemas.

### 12.2 Why

- **Security:** Prevent injection attacks
- **Data Integrity:** Ensure data conforms to expected shapes
- **Developer Experience:** Shared schemas between frontend and backend
- **Type Safety:** Runtime validation with TypeScript types

### 12.3 Where

Every API endpoint that accepts input.

### 12.4 Validation Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side always** | Every endpoint validates input | Security cannot depend on client |
| **Client-side for UX** | Forms validate before submission | Better UX |
| **Shared schemas** | Same Zod schema for both | No duplication |
| **No `z.any()`** | Every field has a type | Type safety |
| **Explicit rules** | min, max, pattern, enum | Clear constraints |
| **Error details** | Field-level error messages | Better UX |

### 12.5 Validation Middleware

```typescript
// ✓ CORRECT: Validation middleware
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    const details: Record<string, string[]> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(err.message);
    });
    throw new ValidationError(details);
  }

  return result.data;
}

// ✓ CORRECT: Query parameter validation
export function validateQuery<T>(
  url: URL,
  schema: z.ZodSchema<T>
): T {
  const params = Object.fromEntries(url.searchParams);
  const result = schema.safeParse(params);

  if (!result.success) {
    const details: Record<string, string[]> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(err.message);
    });
    throw new ValidationError(details);
  }

  return result.data;
}
```

### 12.6 Schema Examples

```typescript
// ✓ CORRECT: Product creation schema
export const createProductSchema = z.object({
  name: z.string().min(1).max(300).trim(),
  description: z.string().optional(),
  shortDescription: z.string().max(500).optional(),
  basePrice: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  gender: z.enum(['men', 'women', 'unisex']),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
});

// ✓ CORRECT: Query parameter schema
export const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['createdAt', 'basePrice', 'name']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  category: z.string().uuid().optional(),
  brand: z.string().uuid().optional(),
  gender: z.enum(['men', 'women', 'unisex']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  search: z.string().max(200).optional(),
});
```

---

## 13. API Versioning

### 13.1 What

Standard for API versioning to maintain backward compatibility.

### 13.2 Why

- **Backward Compatibility:** Existing consumers don't break
- **Gradual Migration:** Consumers can migrate at their pace
- **Clear Communication:** Version numbers signal breaking changes

### 13.3 Where

All public APIs.

### 13.4 Versioning Strategy

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **URL prefix** | Breaking changes | `/api/v2/products` |
| **Header** | Minor additions | `Accept: application/vnd.nabome.v2+json` |
| **Query param** | Temporary experiments | `/api/products?version=2` |

### 13.5 Versioning Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **URL prefix for breaking** | `/api/v2/...` | Clear, cacheable |
| **No version for additions** | New fields don't break clients | Backward compatible |
| **Deprecation headers** | `Deprecation: true` | Notify consumers |
| **Sunset period** | 6 months minimum | Migration time |
| **Current version** | `/api/...` (no prefix) | Always latest |

### 13.6 Versioning Example

```typescript
// ✓ CORRECT: Versioned routes
// api/v1/products.ts (deprecated)
export async function getProductsV1(request: Request) {
  const products = await db.product.findMany();
  // V1 response format
  return success(products);
}

// api/v2/products.ts (current)
export async function getProductsV2(request: Request) {
  const products = await db.product.findMany();
  // V2 response format (includes meta)
  return successWithMeta(products, meta);
}

// api/products.ts (alias for current version)
export { getProductsV2 as getProducts };
```

---

## 14. Pagination

### 14.1 What

Standard pagination format for list endpoints.

### 14.2 Why

- **Performance:** Prevent large result sets
- **User Experience:** Predictable page navigation
- **Scalability:** Handle millions of records

### 14.3 Where

All list endpoints.

### 14.4 Pagination Format

```typescript
// Request
GET /api/products?page=1&limit=20&sort=createdAt&order=desc

// Query parameters
interface PaginationParams {
  page?: number;      // Default: 1
  limit?: number;     // Default: 20, Max: 100
  sort?: string;      // Default: createdAt
  order?: 'asc' | 'desc'; // Default: desc
}

// Response
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 14.5 Pagination Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default page size** | 20 | Balance between data and performance |
| **Max page size** | 100 | Prevent abuse |
| **Total count** | Always include | Client needs to know total |
| **Total pages** | Always include | Client needs to navigate |
| **Offset-based** | Use offset/limit | Simple, predictable |
| **Cursor-based** | Future optimization | Better for infinite scroll |

### 14.6 Pagination Implementation

```typescript
// ✓ CORRECT: Pagination implementation
export async function paginate<T>(
  model: any,
  where: any,
  options: PaginationParams
): Promise<{ data: T[]; meta: PaginationMeta }> {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const sort = options.sort ?? 'createdAt';
  const order = options.order ?? 'desc';

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    model.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

---

## 15. Filtering

### 15.1 What

Standard filtering format for list endpoints.

### 15.2 Why

- **User Experience:** Users can find what they need
- **Performance:** Filtered queries return less data
- **Flexibility:** Support complex filter combinations

### 15.3 Where

All list endpoints.

### 15.4 Filter Format

```typescript
// Request
GET /api/products?category=shirts&brand=nike&minPrice=1000&maxPrice=5000&gender=men

// Supported filters (varies by resource)
interface ProductFilters {
  category?: string;      // Category ID
  subcategory?: string;   // Subcategory ID
  collection?: string;    // Collection ID
  brand?: string;         // Brand ID
  gender?: 'men' | 'women' | 'unisex';
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  search?: string;        // Full-text search
}
```

### 15.5 Filter Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Query params** | Filters via query params | RESTful, cacheable |
| **Type coercion** | Auto-convert string to number/boolean | User-friendly |
| **Optional filters** | All filters optional | Flexible |
| **Multiple values** | Comma-separated for arrays | `?color=red,blue` |
| **Range filters** | `min`/`max` prefix | `?minPrice=1000&maxPrice=5000` |
| **Date filters** | ISO 8601 format | `?from=2024-01-01&to=2024-12-31` |

### 15.6 Filter Implementation

```typescript
// ✓ CORRECT: Filter implementation
export function buildProductFilters(query: URLSearchParams): ProductFilters {
  return {
    category: query.get('category') ?? undefined,
    brand: query.get('brand') ?? undefined,
    gender: query.get('gender') as 'men' | 'women' | 'unisex' ?? undefined,
    minPrice: query.get('minPrice') ? Number(query.get('minPrice')) : undefined,
    maxPrice: query.get('maxPrice') ? Number(query.get('maxPrice')) : undefined,
    isFeatured: query.get('isFeatured') === 'true',
    isNew: query.get('isNew') === 'true',
    inStock: query.get('inStock') === 'true',
    search: query.get('search') ?? undefined,
  };
}
```

---

## 16. Sorting

### 16.1 What

Standard sorting format for list endpoints.

### 16.2 Why

- **User Experience:** Users can order results as needed
- **Performance:** Sorted queries use indexes efficiently
- **Consistency:** Same sorting format everywhere

### 16.3 Where

All list endpoints.

### 16.4 Sorting Format

```typescript
// Request
GET /api/products?sort=basePrice&order=asc

// Query parameters
interface SortParams {
  sort?: string;           // Field name to sort by
  order?: 'asc' | 'desc'; // Sort direction
}

// Supported sort fields (varies by resource)
type ProductSortField = 'createdAt' | 'basePrice' | 'name' | 'updatedAt';
type OrderSortField = 'createdAt' | 'total' | 'status';
type UserSortField = 'createdAt' | 'email' | 'firstName';
```

### 16.5 Sorting Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default sort** | `createdAt desc` | Most recent first |
| **Single sort** | One sort field at a time | Simplicity |
| **Ascending default** | If order not specified | Predictable |
| **Sortable fields** | Only indexed fields | Performance |
| **No arbitrary sort** | Whitelist allowed fields | Security |

---

## 17. Searching

### 17.1 What

Standard search format for full-text search.

### 17.2 Why

- **User Experience:** Users can find products by description
- **Performance:** pg_trgm-based search is fast
- **Relevance:** Results ranked by relevance

### 17.3 Where

Product search, CMS search, customer search (admin).

### 17.4 Search Format

```typescript
// Request
GET /api/products?search=cotton+tshirt

// Query parameter
interface SearchParams {
  search?: string;  // Search query
}

// Response includes relevance score
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Premium Cotton T-Shirt",
      "relevance": 0.85
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### 17.5 Search Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **pg_trgm** | Use trigram similarity | Fuzzy matching |
| **GIN index** | Index for search performance | Query speed |
| **Relevance ranking** | Weight by field importance | Better results |
| **Limit results** | Max 100 results per page | Performance |
| **Highlight matches** | Show matching text | Better UX |

---

## 18. File Upload APIs

### 18.1 What

Standard for file upload endpoints.

### 18.2 Why

- **Security:** Validate file types and sizes
- **Performance:** Optimize uploads for mobile
- **Consistency:** Same upload experience everywhere

### 18.3 Where

Product images, avatars, CMS media.

### 18.4 Upload Format

```typescript
// Request
POST /api/upload
Content-Type: multipart/form-data

// Form data
{
  "file": File,
  "folder": "products" | "avatars" | "cms",
  "alt"?: string
}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://cdn.nabome.online/products/uuid/image.jpg",
    "alt": "Product image",
    "width": 800,
    "height": 800,
    "filesize": 1024000,
    "mimetype": "image/jpeg"
  }
}
```

### 18.5 Upload Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max file size** | 10MB | Prevent abuse |
| **Allowed types** | JPEG, PNG, WebP, GIF, SVG | Standard formats |
| **Max dimensions** | 4000x4000px | Prevent oversized |
| **Validation** | Server-side validation | Security |
| **CDN delivery** | Use Cloudflare R2 | Performance |
| **Transformation** | Auto-format, auto-quality | Optimization |

---

## 19. Background Job Communication

### 19.1 What

Standard for communicating with background job processors.

### 19.2 Why

- **Reliability:** Jobs survive server restarts
- **Scalability:** Process jobs asynchronously
- **Observability:** Track job status and failures

### 19.3 Where

Email sending, image processing, analytics aggregation.

### 19.4 Job Communication Pattern

```typescript
// ✓ CORRECT: Job queue interface
export interface IJobQueue {
  enqueue<T>(job: Job<T>): Promise<string>;
  status(jobId: string): Promise<JobStatus>;
  cancel(jobId: string): Promise<void>;
}

// ✓ CORRECT: Job types
export type Job =
  | SendEmailJob
  | ProcessImageJob
  | GenerateInvoiceJob
  | AggregateAnalyticsJob;

export interface SendEmailJob {
  type: 'send_email';
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export interface ProcessImageJob {
  type: 'process_image';
  mediaId: string;
  operations: ImageOperation[];
}

// ✓ CORRECT: Job enqueue
await jobQueue.enqueue({
  type: 'send_email',
  to: order.email,
  subject: `Order ${order.orderNumber} confirmed`,
  template: 'order-confirmation',
  data: { order },
});
```

### 19.5 Job Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Async by default** | Don't block request | Performance |
| **Retry on failure** | 3 attempts with backoff | Reliability |
| **Dead letter queue** | Failed jobs go to DLQ | Debugging |
| **Idempotent jobs** | Safe to retry | Prevent duplicates |
| **Job timeout** | 5 minutes max | Prevent hanging |
| **Logging** | Log job start, success, failure | Observability |

---

## 20. Notification Services

### 20.1 What

Standard for notification delivery across channels.

### 20.2 Why

- **Consistency:** Same notification experience everywhere
- **Reliability:** Notifications are delivered
- **Extensibility:** Easy to add new channels

### 20.3 Where

Order confirmations, password resets, marketing emails.

### 20.4 Notification Channels

| Channel | Provider | Use Case |
|---------|----------|----------|
| **Email** | Resend | Transactional emails |
| **SMS** | Future (Twilio) | OTP, delivery updates |
| **Push** | Future (Firebase) | Marketing, order updates |
| **In-app** | Future | Notifications center |

### 20.5 Notification Interface

```typescript
// ✓ CORRECT: Notification service interface
export interface INotificationService {
  send(notification: Notification): Promise<void>;
}

export type Notification =
  | EmailNotification
  | SmsNotification
  | PushNotification
  | InAppNotification;

export interface EmailNotification {
  channel: 'email';
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

// ✓ CORRECT: Notification service implementation
export class NotificationService implements INotificationService {
  constructor(
    private emailService: IEmailService,
    private logService: ILogService
  ) {}

  async send(notification: Notification): Promise<void> {
    switch (notification.channel) {
      case 'email':
        await this.emailService.send(notification);
        break;
      default:
        this.logService.warn({ channel: notification.channel }, 'Unsupported notification channel');
    }
  }
}
```

---

## 21. Document Generation Services

### 21.1 What

Standard for generating documents (invoices, receipts, etc.).

### 21.2 Why

- **Consistency:** Same document format everywhere
- **Branding:** Professional-looking documents
- **Automation:** Generate documents automatically

### 21.3 Where

Order invoices, shipping labels, return labels.

### 21.4 Document Types

| Document | Trigger | Format |
|----------|---------|--------|
| **Invoice** | Order confirmed | PDF |
| **Shipping label** | Order shipped | PDF |
| **Return label** | Return approved | PDF |
| **Receipt** | Payment captured | PDF |

### 21.5 Document Generation Interface

```typescript
// ✓ CORRECT: Document generation service
export interface IDocumentService {
  generateInvoice(order: Order): Promise<Buffer>;
  generateShippingLabel(order: Order, tracking: TrackingInfo): Promise<Buffer>;
  generateReturnLabel(order: Order, item: OrderItem): Promise<Buffer>;
}

// ✓ CORRECT: Document generation implementation
export class DocumentService implements IDocumentService {
  async generateInvoice(order: Order): Promise<Buffer> {
    const template = await this.loadTemplate('invoice');
    const html = template.render({ order });
    const pdf = await this.htmlToPdf(html);
    return pdf;
  }
}
```

---

## 22. Finance Services

### 22.1 What

Standard for financial operations (payments, refunds, etc.).

### 22.2 Why

- **Accuracy:** Financial data must be precise
- **Compliance:** Meet regulatory requirements
- **Auditability:** Track all financial transactions

### 22.3 Where

Checkout, payments, refunds, invoices.

### 22.4 Finance Interface

```typescript
// ✓ CORRECT: Payment service interface
export interface IPaymentService {
  createOrder(amount: number, currency: string): Promise<PaymentOrder>;
  verifyPayment(paymentId: string, orderId: string): Promise<boolean>;
  refund(orderId: string, amount: number, reason: string): Promise<Refund>;
}

// ✓ CORRECT: Payment service implementation
export class PaymentService implements IPaymentService {
  constructor(private razorpay: Razorpay) {}

  async createOrder(amount: number, currency: string): Promise<PaymentOrder> {
    const order = await this.razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
    });
    return { id: order.id, amount, currency };
  }

  async verifyPayment(paymentId: string, orderId: string): Promise<boolean> {
    const signature = await this.razorpay.payments.fetch(paymentId);
    return this.verifySignature(orderId, paymentId, signature);
  }
}
```

---

## 23. Storage Services

### 23.1 What

Standard for file storage operations.

### 23.2 Why

- **Performance:** CDN delivery for fast loading
- **Scalability:** Handle millions of files
- **Cost:** Efficient storage usage

### 23.3 Where

Product images, avatars, CMS media, invoices.

### 23.4 Storage Interface

```typescript
// ✓ CORRECT: Storage service interface
export interface IStorageService {
  upload(file: File, folder: string): Promise<StorageResult>;
  delete(path: string): Promise<void>;
  getUrl(path: string): string;
  getSignedUrl(path: string, expiresIn: number): Promise<string>;
}

// ✓ CORRECT: Storage service implementation
export class StorageService implements IStorageService {
  constructor(private bucket: R2Bucket) {}

  async upload(file: File, folder: string): Promise<StorageResult> {
    const key = `${folder}/${crypto.randomUUID()}/${file.name}`;
    await this.bucket.put(key, file);
    return { key, url: this.getUrl(key) };
  }

  getUrl(path: string): string {
    return `https://cdn.nabome.online/${path}`;
  }
}
```

---

## 24. Search Services

### 24.1 What

Standard for search operations.

### 24.2 Why

- **Performance:** Fast, relevant search results
- **Scalability:** Handle millions of products
- **Extensibility:** Easy to add new search features

### 24.3 Where

Product search, customer search (admin), CMS search.

### 24.4 Search Interface

```typescript
// ✓ CORRECT: Search service interface
export interface ISearchService {
  search(query: string, options: SearchOptions): Promise<SearchResult<T>>;
  index(id: string, data: T): Promise<void>;
  remove(id: string): Promise<void>;
}

// ✓ CORRECT: Search service implementation
export class SearchService implements ISearchService {
  constructor(private db: PrismaClient) {}

  async search(query: string, options: SearchOptions): Promise<SearchResult<Product>> {
    const results = await this.db.$queryRaw`
      SELECT
        p.*,
        similarity(p.name, ${query}) as relevance
      FROM products p
      WHERE
        p.is_active = true
        AND (
          p.name % ${query}
          OR p.description % ${query}
        )
      ORDER BY relevance DESC
      LIMIT ${options.limit}
    `;
    return { results, total: results.length };
  }
}
```

---

## 25. Logging Services

### 25.1 What

Standard for structured logging.

### 25.2 Why

- **Debuggability:** Understand what happened
- **Monitoring:** Track errors and performance
- **Compliance:** Audit trail for operations

### 25.3 Where

All backend operations.

### 25.4 Logging Interface

```typescript
// ✓ CORRECT: Logging service interface
export interface ILogService {
  info(data: Record<string, unknown>, message: string): void;
  warn(data: Record<string, unknown>, message: string): void;
  error(data: Record<string, unknown>, message: string): void;
  debug(data: Record<string, unknown>, message: string): void;
}

// ✓ CORRECT: Logging service implementation
export class LogService implements ILogService {
  private logger: Pino;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL ?? 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  info(data: Record<string, unknown>, message: string): void {
    this.logger.info(data, message);
  }

  error(data: Record<string, unknown>, message: string): void {
    this.logger.error(data, message);
  }
}
```

---

## 26. Audit Services

### 26.1 What

Standard for audit logging.

### 26.2 Why

- **Compliance:** Meet regulatory requirements
- **Security:** Track unauthorized access
- **Debugging:** Understand what happened

### 26.3 Where

Authentication, data modifications, security events.

### 26.4 Audit Interface

```typescript
// ✓ CORRECT: Audit service interface
export interface IAuditService {
  log(event: AuditEvent): Promise<void>;
}

export interface AuditEvent {
  type: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
}

// ✓ CORRECT: Audit service implementation
export class AuditService implements IAuditService {
  constructor(private db: PrismaClient) {}

  async log(event: AuditEvent): Promise<void> {
    await this.db.auditLog.create({
      data: {
        event: event.type,
        userId: event.userId,
        ip: event.ip,
        userAgent: event.userAgent,
        resource: event.resource,
        resourceId: event.resourceId,
        changes: event.changes,
      },
    });
  }
}
```

---

## 27. Cache Strategy

### 27.1 What

Standard caching strategy using Cloudflare KV.

### 27.2 Why

- **Performance:** Reduce database load
- **Scalability:** Handle traffic spikes
- **Cost:** Reduce infrastructure costs

### 27.3 Where

Product listings, categories, CMS content.

### 27.4 Cache Strategy

| Resource | TTL | Invalidation |
|----------|-----|--------------|
| **Product listings** | 5 minutes | On product update |
| **Product detail** | 10 minutes | On product update |
| **Categories** | 1 hour | On category update |
| **Collections** | 1 hour | On collection update |
| **CMS pages** | 1 hour | On page update |
| **User session** | 15 minutes | On logout |
| **Rate limit counters** | 1 minute | Automatic |

### 27.5 Cache Interface

```typescript
// ✓ CORRECT: Cache service interface
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl: number): Promise<void>;
  delete(key: string): Promise<void>;
  invalidate(pattern: string): Promise<void>;
}

// ✓ CORRECT: Cache service implementation
export class CacheService implements ICacheService {
  constructor(private kv: KVNamespace) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.kv.get(key, 'json');
    return data as T | null;
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.kv.put(key, JSON.stringify(value), { expirationTtl: ttl });
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.kv.list({ prefix: pattern });
    await Promise.all(keys.keys.map((key) => this.kv.delete(key.name)));
  }
}
```

### 27.6 Cache Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Cache aside** | Read from cache, fallback to DB | Standard pattern |
| **Write through** | Update DB, then invalidate cache | Consistency |
| **TTL always** | Every cached value has TTL | Prevent stale data |
| **Key naming** | `{domain}:{id}:{field}` | Organized |
| **Never cache PII** | Don't cache personal data | Privacy |

---

## 28. Rate Limiting

### 28.1 What

Standard rate limiting for all API endpoints.

### 28.2 Why

- **Security:** Prevent abuse
- **Fairness:** Equal access for all users
- **Performance:** Protect backend from overload

### 28.3 Where

All public and authenticated endpoints.

### 28.4 Rate Limits

| Endpoint Type | Limit | Window | Rationale |
|---------------|-------|--------|-----------|
| **Public** | 100 requests | 1 minute | Prevent abuse |
| **Authenticated** | 200 requests | 1 minute | More for logged-in |
| **Admin** | 500 requests | 1 minute | More for admin |
| **Auth endpoints** | 20 requests | 1 minute | Prevent brute force |
| **Upload** | 10 requests | 1 minute | Prevent abuse |

### 28.5 Rate Limiting Implementation

```typescript
// ✓ CORRECT: Rate limiting middleware
export async function rateLimit(
  request: Request,
  options: { limit: number; window: number }
): Promise<void> {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const key = `ratelimit:${ip}:${request.url}`;

  const current = await kv.get(key, 'json');
  const count = current ? current.count + 1 : 1;

  if (count > options.limit) {
    throw new RateLimitError();
  }

  await kv.put(key, JSON.stringify({ count }), {
    expirationTtl: options.window,
  });
}
```

---

## 29. Retry Strategy

### 29.1 What

Standard retry strategy for failed operations.

### 29.2 Why

- **Reliability:** Transient failures are retried
- **User Experience:** Operations succeed eventually
- **Resilience:** System recovers from failures

### 29.3 Where

External API calls, database operations, job processing.

### 29.4 Retry Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max retries** | 3 attempts | Balance between reliability and performance |
| **Backoff** | Exponential (1s, 2s, 4s) | Prevent thundering herd |
| **Retry on** | 5xx, network errors | Transient failures |
| **Don't retry on** | 4xx, validation errors | Permanent failures |
| **Idempotent only** | Only retry idempotent operations | Prevent duplicates |

### 29.5 Retry Implementation

```typescript
// ✓ CORRECT: Retry utility
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxRetries: number; backoff: number }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < options.maxRetries) {
        const delay = options.backoff * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
```

---

## 30. Timeout Strategy

### 30.1 What

Standard timeout values for all operations.

### 30.2 Why

- **Performance:** Prevent hanging operations
- **Resource Management:** Free up resources quickly
- **User Experience:** Fail fast, show error

### 30.3 Where

All external calls and long-running operations.

### 30.4 Timeout Values

| Operation | Timeout | Rationale |
|-----------|---------|-----------|
| **API request** | 30 seconds | Edge timeout limit |
| **Database query** | 10 seconds | Prevent slow queries |
| **External API** | 5 seconds | Prevent hanging |
| **File upload** | 60 seconds | Large files |
| **File download** | 30 seconds | Large files |
| **Email send** | 10 seconds | External service |
| **Payment** | 30 seconds | Financial operation |

### 30.5 Timeout Implementation

```typescript
// ✓ CORRECT: Timeout utility
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  );

  return Promise.race([promise, timeout]);
}

// Usage
const product = await withTimeout(
  db.product.findUnique({ where: { id } }),
  10000
);
```

---

## 31. Idempotency

### 31.1 What

Standard for ensuring operations can be safely retried.

### 31.2 Why

- **Reliability:** Network failures don't cause duplicates
- **Consistency:** Same result on retry
- **User Experience:** No duplicate orders/payments

### 31.3 Where

Payment processing, order creation, email sending.

### 31.4 Idempotency Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Idempotency key** | Client-generated unique key | Prevent duplicates |
| **Store result** | Cache result for 24 hours | Return cached on retry |
| **Check before execute** | Check if key exists | Skip if already processed |
| **Payment idempotency** | Razorpay handles natively | Built-in |

### 31.5 Idempotency Implementation

```typescript
// ✓ CORRECT: Idempotency middleware
export async function idempotent<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  // Check if already processed
  const cached = await cache.get(`idempotent:${key}`);
  if (cached) {
    return cached as T;
  }

  // Process and cache result
  const result = await fn();
  await cache.set(`idempotent:${key}`, result, 86400); // 24 hours

  return result;
}

// Usage
const order = await idempotent(idempotencyKey, async () => {
  return await createOrder(data);
});
```

---

## 32. Event Communication

### 32.1 What

Standard for event-driven communication between services.

### 32.2 Why

- **Decoupling:** Services don't need to know about each other
- **Scalability:** Events can be processed asynchronously
- **Extensibility:** Easy to add new event handlers

### 32.3 Where

Order lifecycle, user actions, system events.

### 32.4 Event Types

| Event | Trigger | Handlers |
|-------|---------|----------|
| `order.created` | Order placed | Email, inventory |
| `order.paid` | Payment captured | Email, fulfill |
| `order.shipped` | Order shipped | Email, tracking |
| `user.registered` | User signs up | Welcome email |
| `user.password_reset` | Password reset | Email |
| `product.updated` | Product modified | Cache invalidation |
| `review.created` | Review submitted | Moderation |

### 32.5 Event Interface

```typescript
// ✓ CORRECT: Event interface
export interface Event {
  type: string;
  payload: Record<string, unknown>;
  timestamp: string;
  source: string;
}

// ✓ CORRECT: Event emitter
export interface IEventEmitter {
  emit(event: Event): Promise<void>;
}

// ✓ CORRECT: Event handler
export interface IEventHandler {
  handle(event: Event): Promise<void>;
}

// ✓ CORRECT: Event implementation
export class EventEmitter implements IEventEmitter {
  async emit(event: Event): Promise<void> {
    // Store event for processing
    await kv.put(`event:${event.type}:${event.timestamp}`, JSON.stringify(event));
  }
}
```

---

## 33. Queue Integration

### 33.1 What

Standard for integrating with job queues.

### 33.2 Why

- **Reliability:** Jobs survive server restarts
- **Scalability:** Process jobs asynchronously
- **Observability:** Track job status

### 33.3 Where

Email sending, image processing, analytics.

### 33.4 Queue Implementation

```typescript
// ✓ CORRECT: Queue interface
export interface IQueue {
  enqueue<T>(job: Job<T>): Promise<string>;
  process(handler: JobHandler): Promise<void>;
  status(jobId: string): Promise<JobStatus>;
}

// ✓ CORRECT: Queue implementation (Cloudflare Queues)
export class Queue implements IQueue {
  constructor(private queue: Queue<Job>) {}

  async enqueue<T>(job: Job<T>): Promise<string> {
    const jobId = crypto.randomUUID();
    await this.queue.send({ ...job, jobId });
    return jobId;
  }

  async process(handler: JobHandler): Promise<void> {
    // Process jobs from queue
  }
}
```

---

## 34. Webhook Readiness

### 34.1 What

Standard for receiving webhook notifications from third-party services.

### 34.2 Why

- **Integration:** Receive real-time updates from services
- **Automation:** Trigger workflows on external events
- **Reliability:** Process events reliably

### 34.3 Where

Razorpay payments, email delivery status, shipping updates.

### 34.4 Webhook Implementation

```typescript
// ✓ CORRECT: Webhook verification
export function verifyWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return timingSafeEqual(signature, expectedSignature);
}

// ✓ CORRECT: Webhook handler
export async function handleWebhook(request: Request, env: Env) {
  const payload = await request.text();
  const signature = request.headers.get('x-webhook-signature');

  if (!verifyWebhook(payload, signature, env.WEBHOOK_SECRET)) {
    throw new ForbiddenError('Invalid webhook signature');
  }

  const event = JSON.parse(payload);

  switch (event.type) {
    case 'payment.captured':
      await handlePaymentCaptured(event.data);
      break;
    case 'payment.failed':
      await handlePaymentFailed(event.data);
      break;
  }

  return success({ received: true });
}
```

---

## 35. Third-Party Integration Strategy

### 35.1 What

Standard for integrating with third-party services.

### 35.2 Why

- **Reliability:** Handle third-party failures gracefully
- **Security:** Protect API keys and credentials
- **Extensibility:** Easy to add new integrations

### 35.3 Where

Razorpay, Resend, Cloudinary, future integrations.

### 35.4 Integration Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Wrapper pattern** | Wrap third-party SDKs | Easy to swap |
| **Timeout always** | Never wait forever | Prevent hanging |
| **Retry with backoff** | 3 attempts, exponential | Reliability |
| **Circuit breaker** | Stop calling if failing | Prevent cascade |
| **Mock in tests** | Never call real API in tests | Test isolation |
| **Secrets in env** | Never hardcode | Security |

### 35.5 Integration Interface

```typescript
// ✓ CORRECT: Third-party integration wrapper
export interface IPaymentProvider {
  createOrder(amount: number, currency: string): Promise<PaymentOrder>;
  verifyPayment(paymentId: string, signature: string): Promise<boolean>;
  refund(paymentId: string, amount: number): Promise<Refund>;
}

// ✓ CORRECT: Razorpay implementation
export class RazorpayProvider implements IPaymentProvider {
  constructor(private client: Razorpay) {}

  async createOrder(amount: number, currency: string): Promise<PaymentOrder> {
    const order = await this.client.orders.create({
      amount: amount * 100,
      currency,
    });
    return { id: order.id, amount, currency };
  }
}
```

---

## 36. Future Microservice Readiness

### 36.1 What

How to design the monolith to be easily split into microservices later.

### 36.2 Why

- **Scalability:** Split when needed
- **Team Scaling:** Multiple teams can work independently
- **Deployment:** Deploy services independently

### 36.3 Where

All service boundaries.

### 36.4 Microservice Readiness Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Clear boundaries** | Services don't share database tables | Easy to split |
| **API contracts** | Services communicate via interfaces | Easy to replace |
| **Event-driven** | Services emit events, not direct calls | Loose coupling |
| **Own database** | Each service owns its tables | Data isolation |
| **Stateless services** | No in-memory state | Horizontal scaling |

### 36.5 Migration Path

| Phase | Action | Trigger |
|-------|--------|---------|
| **1. Monolith** | Single deployment | Current state |
| **2. Modular monolith** | Clear service boundaries | Team grows |
| **3. Service extraction** | Split high-load services | Traffic spike |
| **4. Full microservices** | All services independent | Multiple teams |

---

## 37. Naming Standards

### 37.1 What

Standard naming conventions for API resources.

### 37.2 Why

- **Consistency:** Same patterns everywhere
- **Discoverability:** Developers can guess URLs
- **Maintainability:** Predictable naming

### 37.3 Where

All API endpoints.

### 37.4 Route Naming

| Pattern | Example | Rationale |
|---------|---------|-----------|
| **Plural nouns** | `/api/products` | Collection |
| **Singular for actions** | `/api/cart/add` | Action endpoint |
| **No verbs in URLs** | `/api/orders` not `/api/getOrders` | RESTful |
| **Nested resources** | `/api/products/:id/reviews` | Related resources |
| **Admin prefix** | `/api/admin/products` | Admin-specific |

### 37.5 Endpoint Naming

| Method | Pattern | Example | Status |
|--------|---------|---------|--------|
| **GET** | `/api/{resource}` | `GET /api/products` | 200 |
| **GET** | `/api/{resource}/:id` | `GET /api/products/uuid` | 200 |
| **POST** | `/api/{resource}` | `POST /api/products` | 201 |
| **PATCH** | `/api/{resource}/:id` | `PATCH /api/products/uuid` | 200 |
| **DELETE** | `/api/{resource}/:id` | `DELETE /api/products/uuid` | 204 |

### 37.6 Resource Naming

| Resource | Plural | Singular | Rationale |
|----------|--------|----------|-----------|
| **Products** | `/api/products` | `/api/products/:id` | Collection |
| **Categories** | `/api/categories` | `/api/categories/:id` | Collection |
| **Orders** | `/api/orders` | `/api/orders/:id` | Collection |
| **Users** | `/api/users` | `/api/users/:id` | Collection |
| **Cart** | `/api/cart` | - | Singleton per user |
| **Wishlist** | `/api/wishlist` | - | Singleton per user |

---

## 38. HTTP Standards

### 38.1 What

Standard HTTP methods and status codes.

### 38.2 Why

- **Consistency:** Same behavior everywhere
- **Cacheability:** Proper HTTP caching
- **Debuggability:** Clear status codes

### 38.3 Where

All API endpoints.

### 38.4 HTTP Methods

| Method | Idempotent | Safe | Use Case |
|--------|------------|------|----------|
| **GET** | Yes | Yes | Read resources |
| **POST** | No | No | Create resources |
| **PUT** | Yes | No | Replace resources |
| **PATCH** | No | No | Partial update |
| **DELETE** | Yes | No | Remove resources |

### 38.5 HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| **200** | OK | Successful GET, PATCH |
| **201** | Created | Successful POST |
| **204** | No Content | Successful DELETE |
| **400** | Bad Request | Validation error |
| **401** | Unauthorized | Not authenticated |
| **403** | Forbidden | Not authorized |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Duplicate resource |
| **422** | Unprocessable Entity | Business rule violation |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unexpected error |

### 38.6 Response Headers

```typescript
// ✓ CORRECT: Standard response headers
{
  'Content-Type': 'application/json',
  'X-Request-Id': requestId,
  'X-Rate-Limit-Remaining': '99',
  'Cache-Control': 'public, max-age=300',
  'Deprecation': 'true', // If deprecated
  'Sunset': '2024-12-31', // If being removed
}
```

---

## 39. API Documentation

### 39.1 What

Standard for documenting APIs.

### 39.2 Why

- **Developer Experience:** Easy to understand and use
- **Onboarding:** New developers can learn quickly
- **Maintenance:** Clear contracts for changes

### 39.3 Where

All public APIs.

### 39.4 Documentation Standards

| Standard | Tool | Rationale |
|----------|------|-----------|
| **API specification** | OpenAPI 3.0 | Industry standard |
| **Interactive docs** | Swagger UI | Try APIs in browser |
| **Code examples** | Request/Response samples | Easy to understand |
| **Error documentation** | All error codes listed | Debugging help |

### 39.5 Documentation Requirements

| Requirement | Description | Rationale |
|-------------|-------------|-----------|
| **Endpoint description** | What the endpoint does | Understanding |
| **Request format** | All parameters documented | Usage |
| **Response format** | All fields documented | Usage |
| **Error codes** | All possible errors | Debugging |
| **Examples** | Request/Response samples | Learning |
| **Authentication** | Required auth type | Security |

---

## 40. API Testing

### 40.1 What

Standard for testing APIs.

### 40.2 Why

- **Reliability:** APIs work as expected
- **Regression:** Changes don't break existing functionality
- **Documentation:** Tests show how APIs should be used

### 40.3 Where

All API endpoints.

### 40.4 Testing Levels

| Level | Tool | What to Test |
|-------|------|--------------|
| **Unit** | Vitest | Service functions, utilities |
| **Integration** | Vitest | API handlers, middleware |
| **E2E** | Playwright | Full request lifecycle |

### 40.5 Testing Rules

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Test all endpoints** | Every endpoint has tests | Coverage |
| **Test auth** | Test authenticated and unauthenticated | Security |
| **Test errors** | Test all error scenarios | Debugging |
| **Test edge cases** | Test boundary conditions | Robustness |
| **Mock externals** | Never call real APIs in tests | Isolation |

### 40.6 Test Structure

```typescript
// ✓ CORRECT: API integration test
import { describe, it, expect, beforeEach } from 'vitest';
import { createProduct } from './create-product';

describe('createProduct', () => {
  beforeEach(async () => {
    await db.product.deleteMany();
  });

  it('creates product with valid data', async () => {
    const request = new Request('http://localhost/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Product',
        basePrice: 2999,
        categoryId: 'uuid',
      }),
    });

    const response = await createProduct(request, env);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Test Product');
  });

  it('returns 400 for invalid data', async () => {
    const request = new Request('http://localhost/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });

    const response = await createProduct(request, env);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });
});
```

---

## 41. Architectural Rules

### 41.1 What

Hard rules that every API design must follow.

### 41.2 Why

- **Consistency:** No exceptions to the rules
- **Quality:** Every API meets the standard
- **Maintainability:** Predictable patterns

### 41.3 Hard Rules

| Rule | Description | Violation |
|------|-------------|-----------|
| **Standard response format** | Every endpoint returns `{ success, data, error, meta }` | Frontend can't parse |
| **Input validation** | Every endpoint validates with Zod | Security vulnerability |
| **Authentication** | Protected endpoints require auth | Data exposure |
| **Authorization** | Check permissions before operations | Data exposure |
| **Error handling** | Typed errors with codes | Debugging difficulty |
| **Rate limiting** | All public endpoints rate limited | Abuse |
| **CSRF protection** | All mutation endpoints | CSRF attacks |
| **Audit logging** | All sensitive operations | Compliance |
| **Idempotency** | Payment and order creation | Duplicate operations |
| **No business logic in services** | Services handle infrastructure only | Tight coupling |

### 41.4 Soft Rules

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **Pagination** | Use standard pagination format | List endpoints |
| **Filtering** | Use query parameters for filters | List endpoints |
| **Sorting** | Use query parameters for sort | List endpoints |
| **Caching** | Cache read-heavy endpoints | Performance |
| **Versioning** | Version breaking changes | Breaking changes |

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
