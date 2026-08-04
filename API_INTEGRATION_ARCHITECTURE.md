# নবME (Nabome) — API, Integration & External Services Architecture Standard

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document is the single source of truth for API architecture, integration framework, external service strategy, webhook system, SDK readiness, and API governance  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), API_SERVICE_ARCHITECTURE.md (v1.0), TECH_STACK.md (v1.0), SECURITY_ARCHITECTURE.md (v1.0), PAYMENT_ENGINE_ARCHITECTURE.md (v1.0), NOTIFICATION_COMMUNICATION_MESSAGING_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [API Foundation](#1-api-foundation)
2. [API Design Standards](#2-api-design-standards)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [Webhook System](#4-webhook-system)
5. [External Services Integration](#5-external-services-integration)
6. [SDK Readiness](#6-sdk-readiness)
7. [Rate Limiting & Quotas](#7-rate-limiting--quotas)
8. [Error Management](#8-error-management)
9. [Monitoring & Observability](#9-monitoring--observability)
10. [Module Integration Standards](#10-module-integration-standards)
11. [Permissions & Access Control](#11-permissions--access-control)
12. [API Security](#12-api-security)
13. [Performance Standards](#13-performance-standards)
14. [Developer Experience & Accessibility](#14-developer-experience--accessibility)
15. [Future Readiness](#15-future-readiness)
16. [Mandatory Rules for AI Agents](#16-mandatory-rules-for-ai-agents)

---

## 1. API Foundation

### 1.1 API Philosophy

**What:** The foundational belief system governing every API decision on the Nabome platform.

**Why:**
- Every internal module and future external application must communicate through clean, secure, versioned, and scalable APIs.
- The architecture must support future Mobile Apps, Desktop Apps, Third-party Services, AI services, and Marketplace integrations without redesign.
- APIs are the contract between all consumers — they must be stable, predictable, and self-documenting.

**Where:** Every API endpoint, service interface, inter-module communication, and external integration.

**Philosophy statements:**

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **API-first** | APIs are designed before implementation | Contract-first development prevents rework |
| **Resource-oriented** | URLs represent resources, not actions | Clear mental model, cacheable |
| **Contract stability** | Once published, API contracts don't break | Consumer trust, backward compatibility |
| **Self-documenting** | APIs describe themselves through consistent patterns | Developer experience |
| **Secure by default** | Every endpoint requires authentication unless explicitly public | Zero-trust architecture |
| **Versioned** | Breaking changes get new versions | Backward compatibility |
| **Replaceable** | No external service is permanent; all must be swappable | Vendor independence |
| **Observable** | Every API call is traceable and measurable | Operational confidence |
| **Idempotent** | Safe to retry any operation | Network resilience |
| **Stateless** | No server-side session state in handlers | Edge-compatible, horizontally scalable |

### 1.2 API Architecture

**What:** The structural architecture governing all API layers in the Nabome platform.

**Why:**
- Clean separation of concerns prevents tight coupling.
- Consistent architecture enables rapid development of new features.
- Clear layer boundaries make the system testable and maintainable.

**Where:** Every API endpoint from client to infrastructure.

**Architecture layers:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    API ARCHITECTURE LAYERS                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CONSUMER LAYER                                │   │
│  │                                                           │   │
│  │  Web SPA │ Mobile App │ Desktop App │ Third-party │ AI   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                    HTTPS/REST API                                │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              EDGE LAYER (Cloudflare Pages Functions)       │   │
│  │                                                           │   │
│  │  Security → Rate Limit → CSRF → Auth → Authz →           │   │
│  │  Validation → Handler → Response                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              SERVICE LAYER (Infrastructure)                │   │
│  │                                                           │   │
│  │  AuthService │ PaymentService │ EmailService │            │   │
│  │  StorageService │ CacheService │ AuditService │            │   │
│  │  SearchService │ NotificationService │ WebhookService      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              INFRASTRUCTURE LAYER                          │   │
│  │                                                           │   │
│  │  PostgreSQL │ KV │ R2 │ Razorpay │ Resend │ Cloudinary   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Best practices:**
- Handlers never call other handlers; they orchestrate services.
- Services never contain business logic; they handle infrastructure concerns.
- Services communicate via interfaces, not direct imports.
- The service layer is the integration boundary for all external services.

**Common implementation mistakes:**
- Putting business logic in services (creates coupling).
- Having handlers directly call external APIs (skips the service abstraction).
- Sharing database tables between service domains (breaks isolation).
- Making services aware of HTTP request/response (services should be transport-agnostic).

### 1.3 Internal APIs

**What:** APIs that enable communication between internal modules within the Nabome monolith.

**Why:**
- Internal APIs establish clean module boundaries even within a monolith.
- They enable future microservice extraction without redesign.
- They make inter-module communication explicit and traceable.

**Where:** All communication between `_handlers/` and `_lib/` modules.

**Internal API rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Handler isolation** | Handlers never call other handlers | Prevents tight coupling |
| **Service orchestration** | Handlers orchestrate services for cross-cutting concerns | Reusable logic |
| **Interface-based** | Services expose interfaces, not implementations | Swappable |
| **Event-driven** | Cross-module communication via events, not direct calls | Loose coupling |
| **Shared state via database** | Never in-memory state between requests | Edge-compatible |

### 1.4 External APIs

**What:** APIs exposed to external consumers — mobile apps, desktop apps, third-party integrations, and future marketplace partners.

**Why:**
- External APIs must be more stable, documented, and versioned than internal APIs.
- They represent the public contract of the Nabome platform.
- They must be designed for consumers who don't have access to internal code.

**Where:** All endpoints under `/api/v{N}/` prefix, webhook endpoints, and future public API surfaces.

**External API rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Versioned prefix** | `/api/v1/...` for external APIs | Backward compatibility |
| **OpenAPI spec** | Every external API has an OpenAPI 3.0 specification | Documentation, code generation |
| **Deprecation policy** | 6 months minimum before removal | Migration time |
| **Changelog** | Every version change documented | Consumer awareness |
| **Rate limiting** | Strict per-consumer limits | Abuse prevention |
| **API key authentication** | External consumers use API keys + OAuth | Security |

### 1.5 API Ownership

**What:** Clear ownership model for every API endpoint and integration.

**Why:**
- Ambiguous ownership leads to unmaintained APIs.
- Clear ownership enables rapid incident response.
- Accountability ensures quality.

**Where:** Every API endpoint, service, and integration.

**Ownership model:**

| Consumer Type | Owner | Responsibility |
|---------------|-------|----------------|
| **Web SPA** | Frontend team | Client-side consumption |
| **Mobile App** | Mobile team (future) | Mobile-specific optimizations |
| **Third-party** | Platform team | API stability, documentation |
| **Internal** | Domain team | Module-specific endpoints |
| **Webhook** | Integration team | Inbound event processing |

### 1.6 API Lifecycle

**What:** The complete lifecycle of an API from design to deprecation.

**Why:**
- APIs must be managed through their entire lifecycle to prevent "API sprawl."
- Deprecated APIs must be tracked and eventually removed.
- Lifecycle management ensures API quality over time.

**Where:** Every API endpoint and integration.

**Lifecycle stages:**

| Stage | Description | Exit Criteria |
|-------|-------------|---------------|
| **Design** | API contract defined (OpenAPI spec) | Spec reviewed and approved |
| **Implement** | API endpoint built with tests | All tests pass |
| **Review** | Code review + security review | Approved by 2 reviewers |
| **Deploy** | Deployed to staging, then production | Health checks pass |
| **Monitor** | Active monitoring for errors and performance | Metrics within thresholds |
| **Maintain** | Bug fixes, security patches | No breaking changes |
| **Deprecate** | Mark as deprecated, notify consumers | Deprecation headers added |
| **Sunset** | Remove endpoint after sunset period | Consumers migrated |

### 1.7 API Governance

**What:** Standards, processes, and tooling that ensure API quality across the organization.

**Why:**
- Governance prevents "API drift" where different endpoints follow different patterns.
- Consistent governance enables faster onboarding and reduces bugs.
- Governance ensures compliance with security and regulatory requirements.

**Where:** Every API design decision, review, and deployment.

**Governance standards:**

| Standard | Tool/Process | Rationale |
|----------|-------------|-----------|
| **Design review** | OpenAPI spec review before implementation | Catch issues early |
| **Code review** | 2 approvals required for API changes | Quality gate |
| **Security review** | Automated + manual security scanning | Prevent vulnerabilities |
| **Breaking change review** | Mandatory review for any breaking change | Consumer protection |
| **Documentation** | Auto-generated from OpenAPI spec | Always up-to-date |
| **Testing** | Automated contract tests | Prevent regressions |
| **Monitoring** | Dashboards for all external APIs | Operational visibility |

---

## 2. API Design Standards

### 2.1 REST Architecture

**What:** RESTful architecture standards for all Nabome APIs.

**Why:**
- REST is the industry standard for web APIs.
- HTTP caching, predictability, and tooling all favor REST.
- REST enables future SDK generation and documentation automation.

**Where:** Every API endpoint.

**REST rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Resource-oriented** | URLs represent resources, not actions | Clear mental model |
| **HTTP methods** | GET=read, POST=create, PATCH=update, DELETE=remove | Standard semantics |
| **Stateless** | No server-side session state | Scalability |
| **Cacheable** | GET responses include cache headers | Performance |
| **Uniform interface** | Same request/response patterns everywhere | Predictability |
| **Layered system** | Clients don't know if they're talking to a proxy | Flexibility |

### 2.2 Resource Design

**What:** How API resources are structured and related.

**Why:**
- Consistent resource design makes APIs predictable.
- Proper nesting prevents flat URL structures that are hard to navigate.
- Resource relationships mirror domain relationships.

**Where:** All API endpoints.

**Resource design rules:**

| Pattern | Example | Rationale |
|---------|---------|-----------|
| **Plural nouns** | `/api/products` | Collections |
| **Singular for user-scoped** | `/api/cart`, `/api/wishlist` | Singleton per user |
| **Nested for relationships** | `/api/products/:id/reviews` | Related resources |
| **Flat for independent** | `/api/orders`, `/api/customers` | No nesting needed |
| **Actions as POST** | `/api/cart/add` | Non-CRUD operations |
| **Admin prefix** | `/api/admin/products` | Admin-specific views |

**Resource relationship mapping:**

```
/api/products                    → Product collection
/api/products/:id                → Single product
/api/products/:id/variants       → Product variants
/api/products/:id/reviews        → Product reviews
/api/categories                  → Category collection
/api/categories/:id/products     → Products in category
/api/orders                      → Order collection (admin)
/api/orders/:id                  → Single order
/api/orders/:id/items            → Order items
/api/customers                   → Customer collection (admin)
/api/customers/:id/orders        → Customer orders
/api/cart                        → Current user's cart
/api/wishlist                    → Current user's wishlist
/api/account                     → Current user's profile
/api/account/addresses           → Current user's addresses
/api/admin/dashboard             → Admin dashboard data
/api/admin/products              → Admin product management
/api/admin/orders                → Admin order management
```

### 2.3 Naming Standards

**What:** Standardized naming conventions for all API resources.

**Why:**
- Consistent naming makes APIs discoverable.
- Predictable naming reduces documentation burden.
- Naming conventions prevent ambiguity.

**Where:** All API endpoint URLs, query parameters, and response fields.

**Naming rules:**

| Element | Convention | Example | Rationale |
|---------|-----------|---------|-----------|
| **URLs** | kebab-case | `/api/cart-items` | URL-friendly |
| **Query params** | camelCase | `?categoryId=uuid` | JavaScript convention |
| **Response fields** | camelCase | `"createdAt"` | JSON convention |
| **Enum values** | SCREAMING_SNAKE_CASE | `"PENDING"`, `"SHIPPED"` | Readability |
| **Error codes** | SCREAMING_SNAKE_CASE | `"VALIDATION_ERROR"` | Machine-readable |
| **Resource names** | Plural nouns | `/api/products` | Collection semantics |
| **Action names** | Verb-noun | `/api/orders/:id/cancel` | Action clarity |

### 2.4 Versioning

**What:** API versioning strategy to maintain backward compatibility.

**Why:**
- Breaking changes must not affect existing consumers.
- Consumers need time to migrate to new API versions.
- Version numbers signal breaking changes clearly.

**Where:** All external and public APIs.

**Versioning strategy:**

| Strategy | When to Use | Example |
|----------|-------------|---------|
| **URL prefix** | Breaking changes | `/api/v2/products` |
| **Header** | Minor additions | `Accept: application/vnd.nabome.v2+json` |
| **Query param** | Temporary experiments | `/api/products?version=2` |

**Versioning rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **URL prefix for breaking** | `/api/v2/...` | Clear, cacheable |
| **No version for additions** | New fields don't break clients | Backward compatible |
| **Deprecation headers** | `Deprecation: true` + `Sunset: <date>` | Notify consumers |
| **Sunset period** | 6 months minimum | Migration time |
| **Current version alias** | `/api/...` (no prefix) → latest version | Convenience |
| **Changelog** | Every version change documented | Consumer awareness |
| **Breaking change definition** | Removing fields, changing types, requiring new fields | Clear criteria |

**Breaking changes (require new version):**
- Removing a response field
- Changing a field type
- Adding a required request field
- Changing endpoint URL structure
- Changing authentication mechanism
- Changing error response format

**Non-breaking changes (no version bump needed):**
- Adding optional request fields
- Adding response fields
- Adding new endpoints
- Adding new enum values (if consumers handle unknowns)
- Changing rate limits

### 2.5 Request Standards

**What:** Standardized request format for all API endpoints.

**Why:**
- Consistent request format simplifies client implementation.
- Validation can be applied uniformly.
- Documentation is consistent across endpoints.

**Where:** All API endpoints.

**Request rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Content-Type** | `application/json` for all requests | Consistency |
| **Body limit** | 1MB maximum | Prevent abuse |
| **Required fields** | Documented in OpenAPI spec | Clarity |
| **Optional fields** | Have explicit defaults | Predictability |
| **Nested objects** | Flatten when possible | Simplicity |
| **Array fields** | Use comma-separated for query params | URL-friendly |
| **Date format** | ISO 8601 (`2024-01-15T10:30:00Z`) | Standard format |
| **ID format** | UUID v4 | Globally unique |
| **Boolean format** | `true`/`false` (not `"true"`) | Type safety |
| **Null vs absent** | Use `null` for explicit null, omit for undefined | Clarity |

### 2.6 Response Standards

**What:** Standardized response format for all API endpoints.

**Why:**
- Frontend can parse responses uniformly.
- Error handling is consistent.
- Type safety between frontend and backend.

**Where:** Every API endpoint response.

**Standard response format:**

```typescript
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
    requestId: string;
  };
}
```

**Response examples:**

```json
// Success (single resource)
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Premium Cotton T-Shirt",
    "slug": "premium-cotton-t-shirt",
    "basePrice": 2999,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "requestId": "req_abc123"
  }
}

// Success (list with pagination)
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
    "totalPages": 8,
    "requestId": "req_def456"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  },
  "meta": {
    "requestId": "req_ghi789"
  }
}
```

**Response rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always include `success`** | Boolean field | Client can check quickly |
| **Always include `requestId`** | In `meta` field | Debugging, tracing |
| **Never expose internals** | No stack traces, DB errors | Security |
| **Consistent timestamps** | ISO 8601 UTC | Timezone safety |
| **Consistent IDs** | UUID v4 strings | Type safety |
| **Consistent booleans** | `true`/`false` | Type safety |
| **Consistent numbers** | No trailing zeros in amounts | Clarity |

### 2.7 Pagination

**What:** Standard pagination format for all list endpoints.

**Why:**
- Prevents large result sets from overwhelming clients.
- Enables efficient data loading.
- Provides predictable navigation.

**Where:** All list/collection endpoints.

**Pagination format:**

```typescript
// Request
GET /api/products?page=1&limit=20&sort=createdAt&order=desc

// Query parameters
interface PaginationParams {
  page?: number;      // Default: 1, Min: 1
  limit?: number;     // Default: 20, Max: 100
  sort?: string;      // Default: createdAt
  order?: 'asc' | 'desc'; // Default: desc
}

// Response meta
{
  "page": 1,
  "limit": 20,
  "total": 150,
  "totalPages": 8,
  "requestId": "req_xyz"
}
```

**Pagination rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default page size** | 20 | Balance between data and performance |
| **Max page size** | 100 | Prevent abuse |
| **Total count** | Always include | Client needs to know total |
| **Total pages** | Always include | Client needs to navigate |
| **Offset-based** | Use offset/limit | Simple, predictable |
| **Cursor-based** | Future optimization | Better for infinite scroll |
| **Empty results** | Return `[]` with `total: 0` | Not an error |
| **Page beyond total** | Return `[]` with correct `total` | Not an error |

### 2.8 Filtering

**What:** Standard filtering format for list endpoints.

**Why:**
- Users can find specific data quickly.
- Filtered queries return less data (better performance).
- Consistent filtering simplifies client implementation.

**Where:** All list endpoints that support filtering.

**Filter format:**

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
  tags?: string;          // Comma-separated tags
}
```

**Filter rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Query params** | Filters via query params | RESTful, cacheable |
| **Type coercion** | Auto-convert string to number/boolean | User-friendly |
| **Optional filters** | All filters optional | Flexible |
| **Multiple values** | Comma-separated for arrays | `?color=red,blue` |
| **Range filters** | `min`/`max` prefix | `?minPrice=1000&maxPrice=5000` |
| **Date filters** | ISO 8601 format | `?from=2024-01-01&to=2024-12-31` |
| **Boolean filters** | `?isFeatured=true` | Type-safe |
| **Enum filters** | Whitelist allowed values | Security |

### 2.9 Sorting

**What:** Standard sorting format for list endpoints.

**Why:**
- Users can order results as needed.
- Sorted queries use indexes efficiently.
- Consistent sorting simplifies client implementation.

**Where:** All list endpoints.

**Sorting format:**

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
```

**Sorting rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Default sort** | `createdAt desc` | Most recent first |
| **Single sort** | One sort field at a time | Simplicity |
| **Ascending default** | If order not specified | Predictable |
| **Sortable fields** | Only indexed fields | Performance |
| **No arbitrary sort** | Whitelist allowed fields | Security |

### 2.10 Search

**What:** Standard search format for full-text search.

**Why:**
- Users can find products by description, not just exact matches.
- pg_trgm-based search provides fuzzy matching.
- Relevance ranking improves results.

**Where:** Product search, CMS search, customer search (admin).

**Search format:**

```typescript
// Request
GET /api/products?search=cotton+tshirt

// Query parameter
interface SearchParams {
  search?: string;  // Search query (max 200 chars)
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

**Search rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **pg_trgm** | Use trigram similarity | Fuzzy matching |
| **GIN index** | Index for search performance | Query speed |
| **Relevance ranking** | Weight by field importance | Better results |
| **Limit results** | Max 100 results per page | Performance |
| **Highlight matches** | Show matching text | Better UX |
| **Minimum length** | 2 characters minimum | Prevent noise |

### 2.11 Error Handling

**What:** Standard error handling across all API endpoints.

**Why:**
- Same error format everywhere simplifies client implementation.
- Clear error information aids debugging.
- Consistent error codes enable programmatic error handling.

**Where:** Every function that can fail.

**Error response format:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

**Error codes reference:**

| Code | Status | Description | Retryable |
|------|--------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Input validation failed | No |
| `UNAUTHORIZED` | 401 | Authentication required | No |
| `FORBIDDEN` | 403 | Insufficient permissions | No |
| `NOT_FOUND` | 404 | Resource not found | No |
| `CONFLICT` | 409 | Resource already exists | No |
| `UNPROCESSABLE_ENTITY` | 422 | Business rule violation | No |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Yes (after delay) |
| `INTERNAL_ERROR` | 500 | Unexpected server error | Yes |
| `SERVICE_UNAVAILABLE` | 503 | External service down | Yes |
| `INSUFFICIENT_STOCK` | 422 | Product out of stock | No |
| `PAYMENT_FAILED` | 422 | Payment processing failed | No |
| `COUPON_INVALID` | 422 | Coupon code invalid | No |
| `ADDRESS_INVALID` | 422 | Address validation failed | No |

**Error handling rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Never expose internals** | Don't leak stack traces or DB errors | Security |
| **Log unexpected errors** | Use Pino logger with request ID | Debugging |
| **Return user-friendly messages** | Technical details in logs only | UX |
| **Use error codes** | Machine-readable error codes | Frontend parsing |
| **Field-level details** | Validation errors include field names | Better UX |
| **Consistent format** | Same error response everywhere | Client predictability |
| **Request ID** | Always include for debugging | Traceability |

### 2.12 Status Codes

**What:** Standard HTTP status codes for all API responses.

**Why:**
- HTTP status codes are the first level of error categorization.
- Consistent status codes enable HTTP-level error handling.
- Proper status codes enable HTTP caching and retry logic.

**Where:** Every API response.

**Status code rules:**

| Code | Meaning | When to Use |
|------|---------|-------------|
| **200** | OK | Successful GET, PATCH |
| **201** | Created | Successful POST (create) |
| **204** | No Content | Successful DELETE |
| **400** | Bad Request | Validation error, malformed JSON |
| **401** | Unauthorized | Not authenticated |
| **403** | Forbidden | Not authorized |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Duplicate email, concurrent edit |
| **422** | Unprocessable Entity | Business rule violation |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unexpected error |
| **502** | Bad Gateway | External service error |
| **503** | Service Unavailable | Maintenance or overload |

---

## 3. Authentication & Authorization

### 3.1 Authentication Architecture

**What:** Complete authentication architecture for all API consumers.

**Why:**
- Consistent authentication across all endpoints prevents security gaps.
- Different consumers (web, mobile, third-party) need different auth mechanisms.
- Authentication is the foundation of all access control.

**Where:** All protected API endpoints.

**Authentication mechanisms:**

| Consumer | Mechanism | Token Location | TTL |
|----------|-----------|----------------|-----|
| **Web SPA** | Session cookies | httpOnly cookies | 15 min (access), 7 days (refresh) |
| **Mobile App** | JWT + refresh token | Authorization header | 15 min (access), 30 days (refresh) |
| **Third-party** | API key + OAuth 2.0 | Authorization header | Configurable |
| **Internal services** | Service-to-service JWT | Authorization header | 1 hour |
| **Webhook** | HMAC signature verification | X-Webhook-Signature header | N/A |

**Authentication flow (Web SPA):**

```
1. User submits credentials → POST /api/auth/login
2. Validate input (Zod) → Email format, password length
3. Verify Turnstile CAPTCHA → Prevent bot attacks
4. Authenticate with Supabase Auth → Verify email/password
5. Create session in database → auth_sessions table
6. Set httpOnly cookies → access_token (15min), refresh_token (7 days), csrf_token (4 hours)
7. Return user data → Profile info (not tokens)
8. Client stores user in Zustand → Auth store updated
```

**Authentication flow (External API):**

```
1. Consumer sends request with API key → Authorization: Bearer {api_key}
2. Validate API key → Check key exists, is active, not expired
3. Check rate limits → Per-key rate limiting
4. Validate OAuth scope → Check requested scope is allowed
5. Attach consumer identity → Set consumer context
6. Process request → Normal handler flow
```

### 3.2 Authorization Architecture

**What:** Standard authorization flow for all protected resources.

**Why:**
- Users can only access what they're allowed to.
- Authorization is the second layer of access control after authentication.
- All access attempts must be logged for audit.

**Where:** All endpoints that require role-based or resource-based access control.

**Authorization types:**

| Type | Description | Example |
|------|-------------|---------|
| **Role-based** | Check user role | Admin-only endpoints |
| **Resource-based** | Check resource ownership | Customer's own orders |
| **Permission-based** | Check specific permission | Future granular permissions |
| **Scope-based** | Check OAuth scope | Third-party API access |

**Authorization rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Always after auth** | Authorization happens after authentication | Must know who before what |
| **Fail closed** | Deny by default | Security first |
| **Log all denials** | Audit trail for security | Compliance |
| **Ownership check** | Customers can only access their own data | Privacy |
| **Admin override** | Admins can access all resources | Business requirement |
| **Default deny** | Require explicit permission | Zero-trust |

### 3.3 Token Management

**What:** Token lifecycle management for all authentication mechanisms.

**Why:**
- Token security prevents session hijacking.
- Token rotation limits exposure window.
- Token revocation enables immediate access termination.

**Where:** All authentication flows.

**Token rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **httpOnly cookies** | Never store tokens in localStorage | Prevent XSS theft |
| **Short access tokens** | 15-minute TTL | Limit exposure window |
| **Long refresh tokens** | 7-day TTL (web), 30-day TTL (mobile) | User experience |
| **CSRF protection** | Double-submit cookie pattern | Prevent CSRF |
| **Session rotation** | On sensitive operations | Prevent session fixation |
| **Max sessions** | 5 per user | Prevent abuse |
| **Token revocation** | On logout, password change | Immediate termination |
| **Refresh token rotation** | On each use | Prevent token reuse |

### 3.4 Session Integration

**What:** Session management across all API consumers.

**Why:**
- Sessions must be consistent across web and mobile.
- Session limits prevent abuse.
- Session lifecycle must be fully auditable.

**Where:** All authentication flows and protected endpoints.

**Session schema:**

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

### 3.5 API Permissions

**What:** Permission model for different API consumer types.

**Why:**
- Different consumers need different access levels.
- Granular permissions enable future marketplace and partner APIs.
- Permission model must be extensible without redesign.

**Where:** All API endpoints.

**Permission matrix:**

| Consumer | Products | Orders | Payments | Users | Admin | Settings |
|----------|----------|--------|----------|-------|-------|----------|
| **Guest** | Read | — | — | — | — | — |
| **Customer** | Read | Read/Write (own) | Read (own) | Read/Write (own) | — | — |
| **Shop Owner** | Read/Write | Read/Write (own shop) | Read (own shop) | Read (own shop) | — | Read/Write (own shop) |
| **Admin** | Full | Full | Full | Full | Full | Full |
| **Third-party** | Read (scoped) | Read (scoped) | — | — | — | — |
| **Internal** | Full | Full | Full | Full | Full | Full |

### 3.6 Service Authentication

**What:** Authentication mechanism for internal service-to-service communication.

**Why:**
- Internal services must authenticate to each other.
- Service authentication prevents unauthorized internal access.
- Service tokens must be rotatable without downtime.

**Where:** All service-to-service calls.

**Service auth rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Service JWT** | Each service has its own identity | Accountability |
| **Short-lived tokens** | 1-hour TTL | Limit exposure |
| **Automatic rotation** | Tokens rotated before expiry | Zero-downtime rotation |
| **Mutual TLS** | mTLS for service communication | Encryption + authentication |
| **Service registry** | Centralized service identity store | Single source of truth |

### 3.7 API Keys Readiness

**What:** Architecture for API key management for external consumers.

**Why:**
- Third-party integrations need API keys.
- API keys must be scoped, rotatable, and revocable.
- API key usage must be auditable.

**Where:** Future public APIs, partner APIs, marketplace APIs.

**API key architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    API KEY LIFECYCLE                              │
│                                                                  │
│  1. KEY GENERATION                                                │
│     → Generate random 32-byte key                                │
│     → Hash key for storage (bcrypt)                              │
│     → Store key prefix for identification                        │
│     → Set scopes, rate limits, expiration                        │
│                                                                  │
│  2. KEY DISTRIBUTION                                              │
│     → Show key once on creation                                  │
│     → Never display full key again                               │
│     → Provide key prefix for identification                      │
│                                                                  │
│  3. KEY USAGE                                                     │
│     → Validate key on every request                              │
│     → Check key is active and not expired                        │
│     → Check key has required scope                               │
│     → Enforce per-key rate limits                                │
│     → Log all key usage                                          │
│                                                                  │
│  4. KEY ROTATION                                                  │
│     → Generate new key                                           │
│     → Keep old key active for grace period                       │
│     → Notify consumer of new key                                 │
│     → Revoke old key after grace period                          │
│                                                                  │
│  5. KEY REVOCATION                                                │
│     → Immediately invalidate key                                 │
│     → Log revocation event                                       │
│     → Notify consumer                                            │
└─────────────────────────────────────────────────────────────────┘
```

**API key format:**

```
nab_live_{32_random_bytes_base64url}
nab_test_{32_random_bytes_base64url}
```

**API key schema:**

```typescript
interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;        // First 8 chars for identification
  keyHash: string;          // Bcrypt hash of full key
  scopes: ApiScope[];
  rateLimit: number;        // Requests per minute
  expiresAt: string | null; // null = never expires
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  consumerId: string;       // Who owns this key
}

type ApiScope =
  | 'products:read'
  | 'products:write'
  | 'orders:read'
  | 'orders:write'
  | 'customers:read'
  | 'customers:write'
  | 'analytics:read'
  | 'webhooks:manage';
```

---

## 4. Webhook System

### 4.1 Webhook Architecture

**What:** Complete webhook architecture for event publishing and subscription.

**Why:**
- Webhooks enable real-time integration with external services.
- Webhooks decouple event producers from consumers.
- Webhooks enable the notification system, payment processing, and shipping updates.

**Where:** All event-driven communication between Nabome and external services, and between internal modules.

**Webhook architecture diagram:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEBHOOK ARCHITECTURE                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              EVENT PUBLISHERS                              │   │
│  │                                                           │   │
│  │  Order Service │ Payment Service │ Shipping Service │     │   │
│  │  User Service │ Product Service │ Inventory Service       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│                          ▼                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              EVENT BUS (Internal)                          │   │
│  │                                                           │   │
│  │  Event Emitter → Event Store → Event Dispatcher           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│              ┌───────────┼───────────┐                          │
│              ▼           ▼           ▼                          │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐      │
│  │ Internal        │ │ External        │ │ Future          │      │
│  │ Subscribers     │ │ Subscribers     │ │ Subscribers     │      │
│  │                 │ │                 │ │                 │      │
│  │ Notification    │ │ Zapier          │ │ Partner APIs    │      │
│  │ Audit Log       │ │ Custom Apps     │ │ Marketplace     │      │
│  │ Analytics       │ │ ERP Systems     │ │ AI Services     │      │
│  └────────────────┘ └────────────────┘ └────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Event Publishing

**What:** Standards for publishing events from internal modules.

**Why:**
- Event publishers must be decoupled from event consumers.
- Events must be reliably delivered (at-least-once).
- Events must contain sufficient context for consumers.

**Where:** All business modules that produce events.

**Event publishing rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Fire-and-forget** | Publishers don't wait for consumers | Don't block business flow |
| **At-least-once** | Events delivered at least once | Reliability over idempotency |
| **Event store** | All events persisted to `event_outbox` table | Durability, replay |
| **Structured events** | Typed event payloads | Type safety |
| **Idempotent events** | Event ID prevents duplicate processing | Consumer safety |
| **Async publishing** | Events published via queue | Don't block request |

**Event types:**

| Event | Trigger | Consumers |
|-------|---------|-----------|
| `order.created` | Order placed | Email, inventory, analytics |
| `order.paid` | Payment captured | Email, fulfill, finance |
| `order.shipped` | Order shipped | Email, tracking, analytics |
| `order.delivered` | Order delivered | Email, review, analytics |
| `order.cancelled` | Order cancelled | Email, inventory, finance |
| `order.returned` | Return processed | Email, inventory, finance |
| `user.registered` | User signs up | Welcome email, analytics |
| `user.password_reset` | Password reset requested | Email |
| `user.email_verified` | Email verified | Welcome email |
| `product.created` | Product created | Cache invalidation, analytics |
| `product.updated` | Product modified | Cache invalidation, search index |
| `product.deleted` | Product removed | Cache invalidation, search index |
| `inventory.low_stock` | Stock below threshold | Alert, email |
| `inventory.out_of_stock` | Stock reached zero | Alert, email |
| `review.created` | Review submitted | Moderation, analytics |
| `payment.captured` | Payment successful | Email, fulfill |
| `payment.failed` | Payment failed | Email, alert |
| `payment.refunded` | Refund processed | Email, finance |
| `shipping.label_created` | Shipping label generated | Email |
| `shipping.in_transit` | Package in transit | Email, tracking |
| `shipping.delivered` | Package delivered | Email, review request |

**Event payload structure:**

```typescript
interface DomainEvent {
  id: string;              // UUID v4, unique event ID
  type: string;            // Event type (e.g., "order.created")
  version: number;         // Event schema version
  timestamp: string;       // ISO 8601 UTC
  source: string;          // Originating service/module
  correlationId: string;   // For distributed tracing
  payload: {
    entityType: string;    // e.g., "order"
    entityId: string;      // e.g., order UUID
    changes?: Record<string, unknown>; // What changed
    metadata?: Record<string, unknown>; // Additional context
  };
  actor: {
    type: 'user' | 'system' | 'webhook';
    id: string;            // User ID, system name, or webhook ID
  };
}
```

**Event outbox pattern:**

```typescript
// Event stored in database before publishing
interface EventOutbox {
  id: string;
  eventType: string;
  payload: string;         // JSON serialized DomainEvent
  status: 'pending' | 'published' | 'failed';
  retryCount: number;
  maxRetries: number;
  nextRetryAt: string | null;
  createdAt: string;
  publishedAt: string | null;
}
```

### 4.3 Event Subscription

**What:** Standards for subscribing to events.

**Why:**
- Subscribers must declare their interest in specific events.
- Subscriptions must be manageable and auditable.
- Subscribers must be isolated from each other.

**Where:** All modules that consume events.

**Subscription rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Declarative** | Subscribers declare event types they handle | Clear contracts |
| **Idempotent** | Subscribers must handle duplicate events | At-least-once delivery |
| **Isolated** | One subscriber's failure doesn't affect others | Fault isolation |
| **Async** | Subscribers process events asynchronously | Don't block publisher |
| **Logged** | All event processing logged | Debugging |
| **Retried** | Failed events retried with backoff | Reliability |

### 4.4 Webhook Delivery

**What:** Standards for delivering webhooks to external endpoints.

**Why:**
- External webhook delivery must be reliable.
- Delivery failures must be tracked and retried.
- Webhook payloads must be verifiable.

**Where:** All outbound webhook deliveries.

**Delivery rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **HTTPS only** | All webhook URLs must be HTTPS | Security |
| **Signature** | Sign payloads with HMAC-SHA256 | Verification |
| **Timeout** | 30-second timeout per delivery | Prevent hanging |
| **Retry** | 5 attempts with exponential backoff | Reliability |
| **Dead letter** | Failed deliveries go to DLQ | Debugging |
| **Rate limit** | 100 deliveries per minute per endpoint | Prevent abuse |
| **Idempotent** | Same event ID = same delivery | Prevent duplicates |

**Delivery format:**

```http
POST https://partner.example.com/webhooks HTTP/1.1
Content-Type: application/json
X-Nabome-Signature: sha256={hmac_signature}
X-Nabome-Event: order.created
X-Nabome-Delivery: {delivery_id}
X-Nabome-Timestamp: 2024-01-15T10:30:00Z

{
  "id": "evt_550e8400-e29b-41d4-a716-446655440000",
  "type": "order.created",
  "version": 1,
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "nabome",
  "correlationId": "corr_abc123",
  "payload": {
    "entityType": "order",
    "entityId": "order_uuid",
    "changes": {
      "status": "PENDING",
      "total": 5998
    }
  },
  "actor": {
    "type": "user",
    "id": "user_uuid"
  }
}
```

### 4.5 Retry Strategy

**What:** Retry strategy for failed webhook deliveries.

**Why:**
- Transient failures (network, service downtime) must be retried.
- Permanent failures (invalid URL, auth failure) must not be retried indefinitely.
- Retry strategy must prevent thundering herd.

**Where:** All webhook delivery failures.

**Retry rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Max retries** | 5 attempts | Balance reliability and resources |
| **Backoff** | Exponential (1min, 5min, 30min, 2hr, 12hr) | Prevent thundering herd |
| **Retry on** | 5xx, timeout, network error | Transient failures |
| **Don't retry on** | 4xx (except 429), permanent failure | Permanent failures |
| **429 handling** | Retry after `Retry-After` header | Respect rate limits |
| **Dead letter** | After max retries | Manual investigation |
| **Circuit breaker** | Stop if 10 consecutive failures | Prevent cascade |

**Retry schedule:**

| Attempt | Delay | Cumulative Time |
|---------|-------|-----------------|
| 1 | Immediate | 0 |
| 2 | 1 minute | 1 minute |
| 3 | 5 minutes | 6 minutes |
| 4 | 30 minutes | 36 minutes |
| 5 | 2 hours | 2 hours 36 minutes |
| Dead letter | — | Manual investigation |

### 4.6 Failure Handling

**What:** Standards for handling webhook delivery failures.

**Why:**
- Failed webhooks must be tracked and investigated.
- Consumers must be notified of persistent failures.
- Failure analysis improves reliability.

**Where:** All webhook delivery failures.

**Failure handling rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Log all failures** | Structured logging with full context | Debugging |
| **Track failure count** | Per-endpoint failure tracking | Pattern detection |
| **Notify on persistent failure** | Alert after 3 consecutive failures | Proactive response |
| **Dead letter queue** | Store permanently failed deliveries | Manual investigation |
| **Failure analytics** | Dashboard for failure rates | Operational visibility |
| **Consumer notification** | Notify webhook consumers of failures | Partner trust |

### 4.7 Webhook Verification

**What:** Standards for verifying incoming webhook signatures.

**Why:**
- Webhook endpoints must verify that payloads are authentic.
- Signature verification prevents forged webhook attacks.
- Verification must be timing-safe.

**Where:** All inbound webhook endpoints.

**Verification rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **HMAC-SHA256** | Industry standard signature algorithm | Security |
| **Timing-safe comparison** | Prevent timing attacks | Security |
| **Timestamp validation** | Reject webhooks older than 5 minutes | Replay attack prevention |
| **Replay prevention** | Track delivery IDs for 24 hours | Prevent replay attacks |
| **Secret rotation** | Support multiple active secrets | Zero-downtime rotation |

**Verification implementation:**

```typescript
// ✓ CORRECT: Webhook signature verification
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string
): boolean {
  // 1. Check timestamp freshness (within 5 minutes)
  const webhookTime = new Date(timestamp);
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  if (webhookTime < fiveMinutesAgo) {
    return false; // Reject stale webhooks
  }

  // 2. Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // 3. Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 4.8 Webhook Security

**What:** Security standards for the webhook system.

**Why:**
- Webhooks are a common attack vector.
- Webhook endpoints must be hardened against abuse.
- Webhook data must be protected in transit and at rest.

**Where:** All webhook endpoints (inbound and outbound).

**Security rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **HTTPS only** | All webhook URLs must use HTTPS | Encryption in transit |
| **IP allowlisting** | Optionally restrict by source IP | Additional security layer |
| **Signature verification** | Always verify inbound signatures | Prevent forgery |
| **Rate limiting** | Rate limit webhook endpoints | Prevent abuse |
| **Input validation** | Validate all webhook payloads | Prevent injection |
| **Secret management** | Secrets stored in environment variables | Never hardcoded |
| **Audit logging** | Log all webhook activity | Forensics |

### 4.9 Webhook Audit

**What:** Audit standards for webhook activity.

**Why:**
- Webhook activity must be traceable for debugging and compliance.
- Failed deliveries must be investigated.
- Webhook usage must be monitored.

**Where:** All webhook activity.

**Audit fields:**

| Field | Type | Rationale |
|-------|------|-----------|
| `deliveryId` | UUID | Unique delivery identifier |
| `eventId` | UUID | Event being delivered |
| `endpointId` | UUID | Target endpoint |
| `status` | Enum | delivered, failed, pending |
| `statusCode` | Number | HTTP response code |
| `responseTime` | Number | Milliseconds |
| `attempts` | Number | Delivery attempts |
| `error` | String | Error message if failed |
| `createdAt` | DateTime | When delivery was attempted |
| `completedAt` | DateTime | When delivery completed |

---

## 5. External Services Integration

### 5.1 Integration Architecture

**What:** Architecture for integrating with all external services.

**Why:**
- External services must be replaceable without redesigning business modules.
- Integration failures must be handled gracefully.
- All external calls must be observable.

**Where:** All integrations with third-party services.

**Integration architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES ARCHITECTURE                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              SERVICE ABSTRACTION LAYER                     │   │
│  │                                                           │   │
│  │  IPaymentProvider │ IEmailProvider │ IStorageProvider │   │   │
│  │  IShippingProvider │ ISearchProvider │ IAnalyticsProvider │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              ADAPTER LAYER                                 │   │
│  │                                                           │   │
│  │  RazorpayAdapter │ ResendAdapter │ CloudinaryAdapter │   │   │
│  │  Future adapters...                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              RESILIENCE LAYER                              │   │
│  │                                                           │   │
│  │  CircuitBreaker │ RetryHandler │ TimeoutHandler │        │   │
│  │  RateLimiter │ FallbackHandler │ HealthChecker            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              EXTERNAL SERVICES                             │   │
│  │                                                           │   │
│  │  Razorpay │ Resend │ Cloudinary │ Cloudflare KV │        │   │
│  │  Supabase │ Future: Twilio, Firebase, etc.                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Wrapper pattern** | Wrap all third-party SDKs | Easy to swap |
| **Interface-based** | Services expose interfaces | Testability |
| **Timeout always** | Never wait forever | Prevent hanging |
| **Retry with backoff** | 3 attempts, exponential | Reliability |
| **Circuit breaker** | Stop calling if failing | Prevent cascade |
| **Fallback** | Graceful degradation when service is down | Availability |
| **Mock in tests** | Never call real APIs in tests | Test isolation |
| **Secrets in env** | Never hardcode credentials | Security |
| **Health checks** | Monitor external service health | Proactive response |
| **Cost monitoring** | Track external service usage costs | Budget management |

### 5.2 Payment Gateways

**What:** Integration architecture for payment gateways.

**Why:**
- Payment processing is critical — failures directly impact revenue.
- Payment gateways must be swappable without business logic changes.
- Payment integrations must be PCI compliant.

**Where:** Checkout, refunds, settlements, payment verification.

**Payment gateway abstraction:**

```typescript
// ✓ CORRECT: Payment provider interface
interface IPaymentProvider {
  createOrder(params: CreateOrderParams): Promise<PaymentOrder>;
  verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerification>;
  refund(params: RefundParams): Promise<RefundResult>;
  getOrderStatus(orderId: string): Promise<PaymentOrderStatus>;
}

// ✓ CORRECT: Provider-agnostic types
interface CreateOrderParams {
  amount: number;          // In smallest currency unit (paise for INR)
  currency: string;        // ISO 4217
  receipt: string;         // Internal receipt ID
  notes?: Record<string, string>;
}

interface PaymentOrder {
  id: string;              // Provider order ID
  amount: number;
  currency: string;
  status: string;
}

interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

interface PaymentVerification {
  verified: boolean;
  amount: number;
  currency: string;
  status: string;
}
```

**Payment integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side verification** | Never trust client-side payment status | Security |
| **Idempotent orders** | Same request = same order | Prevent duplicates |
| **Amount verification** | Verify charged amount matches order amount | Integrity |
| **Webhook processing** | Process payment webhooks asynchronously | Reliability |
| **Refund tracking** | Track all refunds with audit trail | Compliance |
| **Currency handling** | Use smallest unit (paise) to avoid floating point | Accuracy |

### 5.3 Shipping Providers

**What:** Integration architecture for shipping providers.

**Why:**
- Shipping integrations provide real-time tracking.
- Multiple shipping providers must be supported.
- Shipping costs must be calculated accurately.

**Where:** Shipping calculation, label generation, tracking, delivery updates.

**Shipping provider abstraction:**

```typescript
interface IShippingProvider {
  calculateRates(params: ShippingRateParams): Promise<ShippingRate[]>;
  createShipment(params: CreateShipmentParams): Promise<Shipment>;
  trackShipment(shipmentId: string): Promise<TrackingInfo>;
  cancelShipment(shipmentId: string): Promise<void>;
}

interface ShippingRateParams {
  origin: Address;
  destination: Address;
  weight: number;          // In grams
  dimensions: Dimensions;
}

interface ShippingRate {
  provider: string;
  service: string;
  rate: number;            // In paise
  currency: string;
  estimatedDays: number;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  provider: string;
  labelUrl: string;
  estimatedDelivery: string;
}

interface TrackingInfo {
  status: string;
  location: string;
  timestamp: string;
  events: TrackingEvent[];
}
```

### 5.4 Email Providers

**What:** Integration architecture for email providers.

**Why:**
- Email delivery must be reliable and trackable.
- Email templates must be type-safe.
- Email failures must not block user flows.

**Where:** Transactional emails, marketing emails, notifications.

**Email provider abstraction:**

```typescript
interface IEmailProvider {
  send(params: SendEmailParams): Promise<EmailResult>;
  sendBatch(params: SendBatchEmailParams): Promise<EmailResult[]>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

interface SendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

interface EmailResult {
  messageId: string;
  accepted: boolean;
}

interface DeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'bounced' | 'complained';
  timestamp: string;
}
```

**Email integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Async by default** | Don't block request on email send | Performance |
| **Retry on failure** | 3 attempts with backoff | Reliability |
| **Template rendering** | Use React Email for type-safe templates | DX |
| **Delivery tracking** | Track delivery status via webhooks | Visibility |
| **Bounce handling** | Handle bounces and complaints | Deliverability |
| **Unsubscribe** | Support unsubscribe headers | Compliance (CAN-SPAM) |

### 5.5 SMS Providers

**What:** Integration architecture for SMS providers (future).

**Why:**
- SMS is critical for OTP and delivery notifications.
- SMS providers must be swappable.
- SMS costs must be tracked.

**Where:** OTP verification, delivery updates, security alerts (future).

**SMS provider abstraction:**

```typescript
interface ISmsProvider {
  send(params: SendSmsParams): Promise<SmsResult>;
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>;
}

interface SendSmsParams {
  to: string;              // E.164 format
  message: string;
  templateId?: string;     // For templated messages
}

interface SmsResult {
  messageId: string;
  accepted: boolean;
}
```

### 5.6 Cloud Storage

**What:** Integration architecture for cloud storage providers.

**Why:**
- File storage must be scalable and cost-effective.
- CDN delivery must be fast globally.
- Storage providers must be swappable.

**Where:** Product images, avatars, CMS media, documents, exports.

**Storage provider abstraction:**

```typescript
interface IStorageProvider {
  upload(params: UploadParams): Promise<UploadResult>;
  delete(path: string): Promise<void>;
  getSignedUrl(path: string, expiresIn: number): Promise<string>;
  getPublicUrl(path: string): string;
  list(prefix: string): Promise<string[]>;
}

interface UploadParams {
  key: string;             // Storage path
  body: ReadableStream | Buffer;
  contentType: string;
  metadata?: Record<string, string>;
}

interface UploadResult {
  key: string;
  url: string;
  size: number;
  etag: string;
}
```

**Storage rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **CDN delivery** | Serve all assets via CDN | Performance |
| **Auto-optimization** | Convert to WebP, compress | Performance |
| **Folder structure** | `/products/{id}/`, `/avatars/{id}/` | Organization |
| **Max file size** | 10MB | Prevent abuse |
| **Allowed types** | JPEG, PNG, WebP, GIF, SVG | Standard formats |
| **Signed URLs** | For private/temporary access | Security |

### 5.7 AI Services

**What:** Integration architecture for AI services (future).

**Why:**
- AI services will power search, recommendations, and automation.
- AI services must be replaceable as the AI landscape evolves.
- AI service costs must be tracked and optimized.

**Where:** Search ranking, product recommendations, content generation (future).

**AI service abstraction:**

```typescript
interface IAIService {
  search(query: string, context: SearchContext): Promise<AISearchResult>;
  recommend(params: RecommendParams): Promise<ProductRecommendation[]>;
  generate(params: GenerateParams): Promise<GeneratedContent>;
}

interface AISearchResult {
  results: SearchResult[];
  confidence: number;
  processingTime: number;
}

interface ProductRecommendation {
  productId: string;
  score: number;
  reason: string;
}
```

### 5.8 Analytics & Monitoring

**What:** Integration architecture for analytics and monitoring services.

**Why:**
- Analytics provide business insights.
- Monitoring provides operational visibility.
- Both must be non-blocking and reliable.

**Where:** User behavior tracking, error monitoring, performance monitoring.

**Analytics integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Non-blocking** | Analytics calls must not block requests | Performance |
| **Batch events** | Batch analytics events for efficiency | Cost optimization |
| **Privacy-respecting** | Don't track PII | Compliance |
| **Client-side + server-side** | Track from both sides | Complete picture |
| **Error monitoring** | Track all errors with context | Debugging |

### 5.9 Future ERP Integration

**What:** Architecture readiness for ERP system integration.

**Why:**
- Businesses may need to sync with existing ERP systems.
- ERP integration must not couple business modules.
- ERP data must be mapped to Nabome's domain model.

**Where:** Inventory sync, order sync, product catalog sync (future).

**ERP integration readiness:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Adapter pattern** | ERP-specific adapter behind standard interface | Swappable |
| **Batch sync** | Sync data in batches, not real-time | Performance |
| **Conflict resolution** | Define strategy for data conflicts | Data integrity |
| **Audit trail** | Track all ERP sync events | Debugging |
| **Retry on failure** | Retry failed syncs with backoff | Reliability |

### 5.10 Future CRM Integration

**What:** Architecture readiness for CRM system integration.

**Why:**
- Customer data may need to sync with CRM systems.
- CRM integration must be non-blocking.
- CRM data must be mapped to Nabome's customer model.

**Where:** Customer sync, order sync, support ticket sync (future).

**CRM integration readiness:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Webhook-based** | Use webhooks for real-time sync | Reliability |
| **Batch sync** | Sync historical data in batches | Performance |
| **Data mapping** | Map CRM fields to Nabome fields | Compatibility |
| **Conflict resolution** | CRM as source of truth for customer data | Single source |
| **Audit trail** | Track all CRM sync events | Debugging |

---

## 6. SDK Readiness

### 6.1 SDK Architecture

**What:** Architecture standards for future client SDKs.

**Why:**
- SDKs simplify integration for external consumers.
- SDKs must be version-compatible with the API.
- SDKs must be maintainable across platforms.

**Where:** Future JavaScript/TypeScript, Python, Java SDKs.

**SDK architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SDK ARCHITECTURE                               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CLIENT LAYER                                 │   │
│  │                                                           │   │
│  │  TypeScript SDK │ Python SDK │ Java SDK │ Go SDK          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              CORE LAYER                                   │   │
│  │                                                           │   │
│  │  HTTP Client │ Auth Manager │ Retry Handler │             │   │
│  │  Rate Limiter │ Error Handler │ Logger                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API LAYER                                    │   │
│  │                                                           │   │
│  │  Products API │ Orders API │ Customers API │ ...          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          │                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              TYPES LAYER                                  │   │
│  │                                                           │   │
│  │  Auto-generated from OpenAPI spec                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Client Libraries

**What:** Standards for client SDK libraries.

**Why:**
- Client libraries must be consistent across languages.
- Client libraries must handle authentication, retries, and errors.
- Client libraries must be auto-generated from the API spec.

**Where:** Future SDK releases.

**Client library rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Auto-generated** | Generate from OpenAPI spec | Consistency, maintainability |
| **Type-safe** | Full TypeScript/Python type hints | DX |
| **Auth handling** | Automatic token management | Convenience |
| **Retry logic** | Built-in retry with exponential backoff | Reliability |
| **Error handling** | Typed exceptions for all error codes | DX |
| **Logging** | Configurable logging | Debugging |
| **Timeout** | Configurable timeouts | Flexibility |
| **Rate limiting** | Built-in rate limit handling | Prevent abuse |

### 6.3 SDK Documentation

**What:** Documentation standards for SDKs.

**Why:**
- Good documentation is the difference between adoption and rejection.
- Documentation must be auto-generated and always up-to-date.
- Code examples must be runnable.

**Where:** All SDK releases.

**Documentation standards:**

| Standard | Tool | Rationale |
|----------|------|-----------|
| **API reference** | Auto-generated from OpenAPI | Always accurate |
| **Getting started** | Written guide with examples | Onboarding |
| **Code examples** | Runnable snippets | Learning |
| **Error reference** | All error codes documented | Debugging |
| **Migration guide** | Version upgrade instructions | Backward compatibility |
| **Changelog** | Every version change documented | Awareness |

### 6.4 Version Compatibility

**What:** SDK version compatibility with API versions.

**Why:**
- SDK versions must align with API versions.
- Breaking API changes must result in new SDK versions.
- Consumers must know which SDK version to use.

**Where:** All SDK releases.

**Version compatibility rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Semantic versioning** | `MAJOR.MINOR.PATCH` | Clear versioning |
| **API version mapping** | SDK v1.x → API v1, SDK v2.x → API v2 | Clarity |
| **Backward compatible** | Minor versions don't break existing code | Stability |
| **Deprecation warnings** | Warn on deprecated API usage | Migration |
| **Migration tools** | Codemods for major version upgrades | DX |

### 6.5 Backward Compatibility

**What:** Backward compatibility standards for SDKs.

**Why:**
- Existing consumers must not break on SDK updates.
- Breaking changes must be clearly communicated.
- Migration paths must be provided.

**Where:** All SDK releases.

**Backward compatibility rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Additive changes** | New fields, new methods don't break | Safe to upgrade |
| **Deprecation cycle** | Deprecate before removing | Migration time |
| **Breaking changes** | Major version bump only | Clear signal |
| **Migration guide** | Document all breaking changes | DX |
| **Codemods** | Automated migration tools | DX |

---

## 7. Rate Limiting & Quotas

### 7.1 Rate Limiting Architecture

**What:** Comprehensive rate limiting architecture for all API endpoints.

**Why:**
- Rate limiting prevents abuse and ensures fair usage.
- Different consumers have different rate limits.
- Rate limiting protects backend infrastructure.

**Where:** All API endpoints.

**Rate limiting tiers:**

| Tier | Consumer | Limit | Window | Burst |
|------|----------|-------|--------|-------|
| **Public** | Unauthenticated | 60 requests | 1 minute | 10 |
| **Authenticated** | Logged-in users | 120 requests | 1 minute | 20 |
| **Admin** | Admin users | 300 requests | 1 minute | 50 |
| **API Key** | Third-party (default) | 100 requests | 1 minute | 15 |
| **API Key (premium)** | Third-party (premium) | 500 requests | 1 minute | 50 |
| **Internal** | Service-to-service | Unlimited | — | — |

**Endpoint-specific limits:**

| Endpoint | Limit | Window | Rationale |
|----------|-------|--------|-----------|
| `POST /api/auth/login` | 20 | 1 minute | Prevent brute force |
| `POST /api/auth/register` | 10 | 1 minute | Prevent spam |
| `POST /api/auth/password-reset` | 5 | 1 hour | Prevent abuse |
| `POST /api/upload` | 10 | 1 minute | Prevent abuse |
| `POST /api/checkout` | 5 | 1 minute | Prevent fraud |
| `GET /api/products` | 200 | 1 minute | Read-heavy |
| `POST /api/admin/*` | 100 | 1 minute | Admin operations |

### 7.2 Quotas

**What:** Usage quotas for API consumers.

**Why:**
- Quotas prevent unexpected cost overruns.
- Quotas enable fair usage across consumers.
- Quotas can be tied to pricing tiers.

**Where:** All API consumers.

**Quota structure:**

```typescript
interface ApiQuota {
  consumerId: string;
  tier: 'free' | 'starter' | 'business' | 'enterprise';
  limits: {
    requestsPerMonth: number;
    requestsPerMinute: number;
    storageBytes: number;
    bandwidthBytes: number;
    webhooksEndpoints: number;
    apiKeys: number;
  };
  usage: {
    requestsThisMonth: number;
    storageUsedBytes: number;
    bandwidthUsedBytes: number;
  };
}
```

**Quota tiers:**

| Tier | Requests/Month | Storage | Bandwidth | Webhooks | API Keys |
|------|---------------|---------|-----------|----------|----------|
| **Free** | 10,000 | 100MB | 1GB | 3 | 2 |
| **Starter** | 100,000 | 1GB | 10GB | 10 | 5 |
| **Business** | 1,000,000 | 10GB | 100GB | 50 | 20 |
| **Enterprise** | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |

### 7.3 Burst Handling

**What:** Standards for handling traffic bursts.

**Why:**
- Traffic bursts (flash sales, marketing campaigns) must not crash the system.
- Burst handling must be graceful, not abrupt.
- Burst limits must be configurable.

**Where:** All API endpoints.

**Burst handling rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Token bucket** | Use token bucket algorithm | Smooth burst handling |
| **Burst allowance** | Allow 2x normal rate for 10 seconds | Handle spikes |
| **Graceful degradation** | Return 429 with retry-after header | Not a hard failure |
| **Priority queues** | Priority for authenticated users | Fair usage |
| **Auto-scaling** | Cloudflare auto-scales edge functions | Infrastructure handles bursts |

### 7.4 Abuse Prevention

**What:** Standards for preventing API abuse.

**Why:**
- APIs are a common target for abuse.
- Abuse prevention must be multi-layered.
- Abuse patterns must be detected and blocked.

**Where:** All API endpoints.

**Abuse prevention rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **IP-based limiting** | Rate limit by IP address | Prevent DDoS |
| **User-based limiting** | Rate limit by user ID | Prevent account abuse |
| **Endpoint-specific limits** | Different limits per endpoint | Targeted protection |
| **CAPTCHA** | Turnstile for public mutations | Bot prevention |
| **Input validation** | Validate all inputs with Zod | Injection prevention |
| **Anomaly detection** | Detect unusual usage patterns | Proactive blocking |
| **Blocking** | Auto-block abusive IPs/accounts | Enforcement |

### 7.5 API Monitoring

**What:** Monitoring standards for rate limiting and quotas.

**Why:**
- Rate limiting must be monitored for effectiveness.
- Quota usage must be tracked for billing.
- Abuse patterns must be detected.

**Where:** All rate limiting and quota systems.

**Monitoring rules:**

| Metric | Alert Threshold | Action |
|--------|----------------|--------|
| **Rate limit hits** | > 100/hour per IP | Investigate |
| **429 responses** | > 10% of total requests | Review limits |
| **Quota exceeded** | > 80% of quota used | Notify consumer |
| **Abuse patterns** | Unusual traffic spike | Auto-block |

---

## 8. Error Management

### 8.1 Error Classification

**What:** Standard error classification across the platform.

**Why:**
- Different error types require different handling.
- Error classification enables programmatic error handling.
- Error classification enables monitoring and alerting.

**Where:** All API endpoints and services.

**Error categories:**

| Category | Description | Examples | Retryable |
|----------|-------------|----------|-----------|
| **Validation** | Input validation failed | Missing field, invalid format | No |
| **Authentication** | Not authenticated | Expired token, invalid credentials | No |
| **Authorization** | Not authorized | Insufficient permissions | No |
| **Business** | Business rule violation | Insufficient stock, invalid coupon | No |
| **Conflict** | Resource state conflict | Duplicate email, concurrent edit | No |
| **External** | External service failure | Payment gateway down, email failed | Yes |
| **System** | Internal system error | Database error, memory limit | Yes |
| **Rate Limit** | Too many requests | Rate limit exceeded | Yes (after delay) |

### 8.2 Validation Errors

**What:** Standards for validation error responses.

**Why:**
- Validation errors must include field-level details.
- Validation errors must be user-friendly.
- Validation errors must be machine-readable.

**Where:** All input validation.

**Validation error format:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "email": ["Email is required", "Email must be valid"],
      "password": ["Password must be at least 8 characters"],
      "address.zipCode": ["ZIP code must be 6 digits"]
    }
  }
}
```

**Validation error rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Field-level details** | Include field path and message | Better UX |
| **Nested field paths** | Use dot notation for nested objects | Clarity |
| **Multiple errors per field** | Include all validation errors | Complete feedback |
| **User-friendly messages** | Human-readable error messages | UX |
| **No internal details** | Don't expose validation rules | Security |

### 8.3 Business Errors

**What:** Standards for business logic error responses.

**Why:**
- Business errors must be clearly communicated.
- Business errors must include actionable information.
- Business errors must be logged for analysis.

**Where:** All business logic.

**Business error format:**

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Product is out of stock",
    "details": {
      "availableStock": 0,
      "requestedQuantity": 2
    }
  }
}
```

**Business error rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Specific codes** | Use domain-specific error codes | Programmatic handling |
| **User-friendly** | Clear, actionable messages | UX |
| **Context details** | Include relevant context | Better UX |
| **No internal details** | Don't expose business rules | Security |
| **Logged** | Log all business errors | Analysis |

### 8.4 System Errors

**What:** Standards for system error responses.

**Why:**
- System errors must not expose internal details.
- System errors must be logged with full context.
- System errors must be monitored for patterns.

**Where:** All system-level failures.

**System error format:**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

**System error rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Generic message** | "An unexpected error occurred" | Security |
| **Request ID** | Include for debugging | Traceability |
| **Log full error** | Log stack trace, context | Debugging |
| **Monitor** | Alert on system errors | Proactive response |
| **No stack traces** | Never expose to client | Security |

### 8.5 Retryable Errors

**What:** Standards for errors that can be retried.

**Why:**
- Retryable errors must be clearly identified.
- Retry strategy must be documented in the response.
- Retry must not cause duplicate operations.

**Where:** All error responses.

**Retryable error format:**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests"
  },
  "retryAfter": 30
}
```

**Retryable error rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Retry-After header** | Include seconds until retry | Client guidance |
| **Idempotency** | Retryable operations must be idempotent | Prevent duplicates |
| **Max retries** | Client should retry max 3 times | Prevent infinite loops |
| **Backoff** | Exponential backoff recommended | Prevent thundering herd |

### 8.6 Error Logging

**What:** Standards for error logging.

**Why:**
- All errors must be logged with sufficient context.
- Error logs must be structured and searchable.
- Error logs must not contain sensitive data.

**Where:** All error handlers.

**Error logging rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Structured logging** | JSON format with Pino | Searchable |
| **Request context** | Include request ID, user ID | Traceability |
| **Error context** | Include error code, stack trace | Debugging |
| **No sensitive data** | Don't log passwords, tokens | Security |
| **Log level** | Error for system, warn for business | Appropriate urgency |
| **Correlation** | Link related log entries | Distributed tracing |

### 8.7 Debug Information

**What:** Standards for debug information in error responses.

**Why:**
- Debug information aids development and support.
- Debug information must not leak to production.
- Debug information must be structured.

**Where:** All error responses (development mode only).

**Debug information rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Development only** | Debug info only in non-production | Security |
| **Request ID** | Always include for support | Traceability |
| **Error ID** | Unique ID for each error instance | Support ticket correlation |
| **Timestamp** | ISO 8601 UTC | Debugging |
| **Endpoint** | Include request endpoint | Context |

---

## 9. Monitoring & Observability

### 9.1 API Metrics

**What:** Standard metrics for all API endpoints.

**Why:**
- Metrics enable performance monitoring.
- Metrics enable capacity planning.
- Metrics enable anomaly detection.

**Where:** All API endpoints.

**Core metrics:**

| Metric | Description | Tool |
|--------|-------------|------|
| **Request count** | Total requests per endpoint | Cloudflare Analytics |
| **Response time** | p50, p95, p99 latency | Cloudflare Analytics |
| **Error rate** | Errors per endpoint per minute | Sentry |
| **Throughput** | Requests per second | Cloudflare Analytics |
| **Availability** | Uptime percentage | Health checks |
| **Rate limit hits** | Rate limit triggered count | KV counters |

### 9.2 Latency Monitoring

**What:** Standards for monitoring API latency.

**Why:**
- Latency directly impacts user experience.
- Latency regressions must be detected early.
- Latency must be tracked per endpoint.

**Where:** All API endpoints.

**Latency rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **p50 latency** | < 200ms for API endpoints | Median performance |
| **p95 latency** | < 500ms for API endpoints | Tail performance |
| **p99 latency** | < 1000ms for API endpoints | Worst-case performance |
| **Latency alerting** | Alert on p95 > 1s | Proactive response |
| **Per-endpoint tracking** | Track latency per endpoint | Identify slow endpoints |
| **External service tracking** | Track latency per external call | Identify slow services |

### 9.3 Availability Monitoring

**What:** Standards for monitoring API availability.

**Why:**
- Availability is the most critical metric.
- Availability must be measured from the consumer's perspective.
- Availability failures must trigger immediate alerts.

**Where:** All API endpoints.

**Availability rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Health check endpoint** | `/api/health` returns 200 | Monitoring |
| **Health check interval** | Every 60 seconds | Early detection |
| **Availability target** | 99.9% uptime | Enterprise SLA |
| **Alert on downtime** | Immediate alert on health check failure | Rapid response |
| **Multi-region** | Health checks from multiple regions | Global availability |

### 9.4 Error Rate Monitoring

**What:** Standards for monitoring error rates.

**Why:**
- Error rate spikes indicate problems.
- Error rates must be tracked per endpoint.
- Error rates must be alertable.

**Where:** All API endpoints.

**Error rate rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Error rate threshold** | Alert on > 5% error rate | Early detection |
| **Per-endpoint tracking** | Track error rate per endpoint | Identify problematic endpoints |
| **Error categorization** | Track by error category | Understand patterns |
| **Trend analysis** | Track error rate over time | Detect gradual degradation |
| **Real-time alerting** | Alert within 1 minute of threshold breach | Rapid response |

### 9.5 Usage Analytics

**What:** Standards for API usage analytics.

**Why:**
- Usage analytics inform product decisions.
- Usage analytics enable capacity planning.
- Usage analytics identify popular features.

**Where:** All API endpoints.

**Usage analytics rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Endpoint usage** | Track calls per endpoint | Feature popularity |
| **Consumer usage** | Track usage per API key | Billing, fair usage |
| **Temporal patterns** | Track usage over time | Capacity planning |
| **Geographic patterns** | Track usage by region | CDN optimization |
| **Feature adoption** | Track new feature usage | Product decisions |

### 9.6 Health Checks

**What:** Standards for API health checks.

**Why:**
- Health checks detect service degradation.
- Health checks enable load balancer routing.
- Health checks provide operational visibility.

**Where:** All API endpoints and services.

**Health check format:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.2.3",
  "services": {
    "database": {
      "status": "healthy",
      "latency": 12
    },
    "cache": {
      "status": "healthy",
      "latency": 3
    },
    "email": {
      "status": "healthy",
      "latency": 45
    },
    "payment": {
      "status": "degraded",
      "latency": 1200,
      "message": "High latency detected"
    }
  }
}
```

**Health check rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Deep health checks** | Check all dependent services | Complete picture |
| **Latency tracking** | Include service latency | Performance monitoring |
| **Status levels** | healthy, degraded, unhealthy | Graduated response |
| **Version info** | Include application version | Deployment tracking |
| **Caching** | Cache health check for 30 seconds | Don't overwhelm services |

---

## 10. Module Integration Standards

### 10.1 Authentication Module

**What:** Integration standards for the authentication module.

**Why:**
- Authentication is the foundation of all access control.
- Authentication must be consistent across all consumers.
- Authentication failures must be handled gracefully.

**Where:** All protected API endpoints.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Middleware pattern** | Authentication as middleware | Consistent application |
| **Session validation** | Validate session on every request | Security |
| **Token refresh** | Automatic token refresh | UX |
| **Session cleanup** | Clean expired sessions | Performance |
| **Audit logging** | Log all auth events | Security |

### 10.2 Products Module

**What:** Integration standards for the products module.

**Why:**
- Product data is read by many modules.
- Product changes must trigger cache invalidation.
- Product searches must be fast and relevant.

**Where:** Product CRUD, search, recommendations.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Cache invalidation** | Invalidate cache on product changes | Fresh data |
| **Search indexing** | Update search index on product changes | Search accuracy |
| **Event emission** | Emit events on product lifecycle changes | Cross-module communication |
| **CDN delivery** | Serve product images via CDN | Performance |
| **Slug uniqueness** | Enforce unique slugs | SEO |

### 10.3 Inventory Module

**What:** Integration standards for the inventory module.

**Why:**
- Inventory must be accurate to prevent overselling.
- Inventory changes must trigger notifications.
- Inventory must be synchronized across channels.

**Where:** Stock management, low stock alerts, oversell prevention.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Atomic operations** | Use database transactions for stock changes | Consistency |
| **Optimistic locking** | Version checks on stock updates | Prevent race conditions |
| **Low stock alerts** | Emit events when stock is low | Proactive response |
| **Reservation** | Reserve stock during checkout | Prevent overselling |
| **Audit trail** | Track all stock changes | Accountability |

### 10.4 Orders Module

**What:** Integration standards for the orders module.

**Why:**
- Orders are the core business transaction.
- Orders must be consistent across all modules.
- Order lifecycle must be fully auditable.

**Where:** Order creation, status updates, cancellation, returns.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Idempotent creation** | Same request = same order | Prevent duplicates |
| **Status transitions** | Enforce valid status transitions | Data integrity |
| **Event emission** | Emit events on status changes | Cross-module communication |
| **Audit trail** | Log all order changes | Compliance |
| **Atomic operations** | Use transactions for order operations | Consistency |

### 10.5 Shipping Module

**What:** Integration standards for the shipping module.

**Why:**
- Shipping integrates with external providers.
- Shipping status must be synchronized.
- Shipping costs must be accurate.

**Where:** Shipping calculation, label generation, tracking.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Provider abstraction** | Use shipping provider interface | Swappable |
| **Rate caching** | Cache shipping rates | Performance |
| **Webhook processing** | Process shipping webhooks asynchronously | Reliability |
| **Status tracking** | Track shipment status in real-time | UX |
| **Cost accuracy** | Verify shipping costs before charging | Integrity |

### 10.6 Payments Module

**What:** Integration standards for the payments module.

**Why:**
- Payment processing is critical for revenue.
- Payment integrations must be PCI compliant.
- Payment failures must be handled gracefully.

**Where:** Checkout, refunds, settlements.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Provider abstraction** | Use payment provider interface | Swappable |
| **Server-side verification** | Never trust client-side status | Security |
| **Idempotent operations** | Prevent duplicate payments | Integrity |
| **Webhook processing** | Process payment webhooks asynchronously | Reliability |
| **Audit trail** | Log all payment events | Compliance |

### 10.7 Finance Module

**What:** Integration standards for the finance module.

**Why:**
- Financial data must be accurate and auditable.
- Finance module must be independent from payment processing.
- Financial reports must be generated reliably.

**Where:** Revenue tracking, tax calculation, settlements, reports.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Immutable records** | Financial records are never modified | Compliance |
| **Double-entry bookkeeping** | All financial transactions double-entry | Accuracy |
| **Audit trail** | Complete audit trail for all financial events | Compliance |
| **Currency handling** | Use Decimal type for all monetary values | Accuracy |
| **Tax compliance** | Follow Indian GST rules | Legal |

### 10.8 CMS Module

**What:** Integration standards for the CMS module.

**Why:**
- CMS content must be cached for performance.
- CMS changes must trigger cache invalidation.
- CMS must support future localization.

**Where:** Pages, blog posts, banners, content blocks.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Cache everything** | Cache CMS content aggressively | Performance |
| **Preview mode** | Support draft content preview | DX |
| **Media management** | Use storage service for media | Consistency |
| **SEO fields** | Include meta title, description, OG tags | SEO |
| **Localization ready** | Structure for future multi-language | Future-proofing |

### 10.9 Notifications Module

**What:** Integration standards for the notifications module.

**Why:**
- Notifications must be delivered reliably.
- Notifications must be channel-agnostic.
- Notification preferences must be respected.

**Where:** Email, SMS (future), push (future), in-app notifications.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Event-driven** | Notifications triggered by events | Decoupling |
| **Channel abstraction** | Support multiple delivery channels | Extensibility |
| **Preference respect** | Honor user notification preferences | UX |
| **Async delivery** | Send notifications asynchronously | Performance |
| **Delivery tracking** | Track delivery status | Visibility |

### 10.10 Documents Module

**What:** Integration standards for the documents module.

**Why:**
- Documents must be generated reliably.
- Documents must be stored securely.
- Documents must be accessible to authorized users.

**Where:** Invoices, shipping labels, receipts, returns.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Template-based** | Generate documents from templates | Consistency |
| **PDF generation** | Use consistent PDF generation | Professional look |
| **Secure storage** | Store in R2 with access controls | Security |
| **CDN delivery** | Serve via CDN for fast access | Performance |
| **Audit trail** | Track document generation events | Compliance |

### 10.11 Reports Module

**What:** Integration standards for the reports module.

**Why:**
- Reports must be generated efficiently.
- Reports must be cached when possible.
- Reports must support export formats.

**Where:** Sales reports, analytics reports, tax reports.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Async generation** | Generate large reports asynchronously | Performance |
| **Caching** | Cache report results | Performance |
| **Export formats** | Support CSV, Excel, PDF | Flexibility |
| **Scheduled reports** | Support scheduled report generation | Automation |
| **Access control** | Restrict report access by role | Security |

### 10.12 Audit Logs Module

**What:** Integration standards for the audit logs module.

**Why:**
- Audit logs must be immutable.
- Audit logs must be queryable.
- Audit logs must be retained per policy.

**Where:** All sensitive operations.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Immutable** | Audit records are never modified | Compliance |
| **Async writing** | Write audit logs asynchronously | Performance |
| **Structured format** | Use consistent structured format | Queryability |
| **Retention policy** | Retain per regulatory requirements | Compliance |
| **Search capability** | Full-text search on audit logs | Investigation |

### 10.13 Workflow Engine

**What:** Integration standards for the workflow engine.

**Why:**
- Workflows must be triggered by events.
- Workflows must support complex business logic.
- Workflows must be auditable.

**Where:** Order processing, inventory management, notifications.

**Integration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Event-triggered** | Workflows triggered by domain events | Decoupling |
| **Idempotent execution** | Same event = same workflow result | Reliability |
| **State machine** | Use state machines for complex flows | Clarity |
| **Timeout handling** | Set timeouts for workflow steps | Prevent hanging |
| **Audit trail** | Log all workflow executions | Debugging |

---

## 11. Permissions & Access Control

### 11.1 Customer APIs

**What:** Permission standards for customer-facing APIs.

**Why:**
- Customer APIs must protect personal data.
- Customer APIs must be rate-limited.
- Customer APIs must be optimized for mobile.

**Where:** Product browsing, cart, checkout, account management.

**Customer API permissions:**

| Endpoint Category | Authentication | Authorization | Rate Limit |
|-------------------|---------------|---------------|------------|
| **Product browsing** | None | None | Public |
| **Search** | None | None | Public |
| **Cart** | Required | Ownership | Medium |
| **Checkout** | Required | Ownership | Medium |
| **Orders** | Required | Ownership | Medium |
| **Account** | Required | Ownership | Medium |
| **Reviews** | Required | Ownership | Medium |
| **Wishlist** | Required | Ownership | Medium |
| **Addresses** | Required | Ownership | Medium |

### 11.2 Shop APIs

**What:** Permission standards for shop owner APIs.

**Why:**
- Shop owners need access to their own data only.
- Shop APIs must support multi-tenancy.
- Shop APIs must be auditable.

**Where:** Shop dashboard, product management, order management.

**Shop API permissions:**

| Endpoint Category | Authentication | Authorization | Rate Limit |
|-------------------|---------------|---------------|------------|
| **Dashboard** | Admin required | Shop ownership | Medium |
| **Products** | Admin required | Shop ownership | Medium |
| **Orders** | Admin required | Shop ownership | Medium |
| **Customers** | Admin required | Shop ownership | Medium |
| **Analytics** | Admin required | Shop ownership | Medium |
| **Settings** | Admin required | Shop ownership | Low |

### 11.3 Admin APIs

**What:** Permission standards for admin APIs.

**Why:**
- Admin APIs have full access to all resources.
- Admin APIs must be heavily audited.
- Admin APIs must be rate-limited to prevent abuse.

**Where:** Admin panel, system management.

**Admin API permissions:**

| Endpoint Category | Authentication | Authorization | Rate Limit |
|-------------------|---------------|---------------|------------|
| **Dashboard** | Admin required | Admin role | High |
| **Products** | Admin required | Admin role | High |
| **Orders** | Admin required | Admin role | High |
| **Customers** | Admin required | Admin role | High |
| **Settings** | Admin required | Admin role | Low |
| **System** | Admin required | Admin role | Low |

### 11.4 Internal Services

**What:** Permission standards for internal service-to-service communication.

**Why:**
- Internal services must authenticate to each other.
- Internal service access must be auditable.
- Internal service permissions must be minimal.

**Where:** All service-to-service calls.

**Internal service permissions:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Service identity** | Each service has its own identity | Accountability |
| **Minimal scope** | Each service has minimal required scope | Least privilege |
| **mTLS** | Mutual TLS for service communication | Encryption + authentication |
| **Audit logging** | Log all service-to-service calls | Visibility |
| **No shared credentials** | Each service has unique credentials | Security |

### 11.5 Third-party Services

**What:** Permission standards for third-party API access.

**Why:**
- Third-party access must be scoped and limited.
- Third-party access must be revocable.
- Third-party access must be auditable.

**Where:** Partner APIs, marketplace APIs, future integrations.

**Third-party permission rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Scoped access** | API keys have explicit scopes | Least privilege |
| **Rate limited** | Per-key rate limiting | Abuse prevention |
| **Quota limited** | Per-key monthly quotas | Cost control |
| **Revocable** | Keys can be revoked instantly | Security |
| **Auditable** | All API key usage logged | Compliance |
| **Time-limited** | Keys can have expiration dates | Security |

---

## 12. API Security

### 12.1 HTTPS

**What:** HTTPS standards for all API communication.

**Why:**
- HTTPS encrypts data in transit.
- HTTPS prevents man-in-the-middle attacks.
- HTTPS is required for PCI compliance.

**Where:** All API endpoints and external service calls.

**HTTPS rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **TLS 1.3** | Use latest TLS version | Security |
| **HSTS** | Enable HTTP Strict Transport Security | Prevent downgrade attacks |
| **Certificate rotation** | Rotate certificates before expiry | Availability |
| **Certificate pinning** | Pin certificates for mobile apps | Security |
| **Redirect HTTP** | Redirect all HTTP to HTTPS | Enforcement |

### 12.2 Encryption

**What:** Encryption standards for data at rest and in transit.

**Why:**
- Encryption protects sensitive data.
- Encryption is required for compliance.
- Encryption must be applied consistently.

**Where:** All sensitive data storage and transmission.

**Encryption rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **In transit** | TLS 1.3 for all communication | Security |
| **At rest** | AES-256 for sensitive data | Security |
| **Payment data** | PCI DSS compliant encryption | Compliance |
| **PII data** | Encrypt personal information | Privacy |
| **Key management** | Use Cloudflare for key management | Security |

### 12.3 Input Validation

**What:** Input validation standards for all API endpoints.

**Why:**
- Input validation prevents injection attacks.
- Input validation ensures data integrity.
- Input validation must be server-side, never client-side only.

**Where:** All API endpoints.

**Input validation rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Server-side always** | Every endpoint validates input | Security |
| **Zod schemas** | Use Zod for validation | Type safety |
| **No `z.any()`** | Every field has a type | Type safety |
| **Sanitize HTML** | Use DOMPurify for user content | XSS prevention |
| **SQL injection** | Use Prisma (parameterized queries) | SQL injection prevention |
| **File upload validation** | Validate file type, size, content | Security |

### 12.4 Output Validation

**What:** Output validation standards for all API responses.

**Why:**
- Output validation prevents data leakage.
- Output validation ensures response consistency.
- Output validation prevents internal data exposure.

**Where:** All API responses.

**Output validation rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **DTO pattern** | Use Data Transfer Objects | Prevent over-fetching |
| **Field selection** | Use Prisma `select` | Prevent data leakage |
| **No internal IDs** | Don't expose database IDs | Security |
| **No stack traces** | Never expose error details | Security |
| **Consistent format** | Same response format everywhere | Predictability |

### 12.5 Rate Limiting (Security)

**What:** Rate limiting as a security measure.

**Why:**
- Rate limiting prevents brute force attacks.
- Rate limiting prevents DDoS attacks.
- Rate limiting protects backend infrastructure.

**Where:** All API endpoints.

**Security rate limiting rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **IP-based** | Rate limit by IP address | DDoS prevention |
| **User-based** | Rate limit by user ID | Account protection |
| **Endpoint-specific** | Different limits per endpoint | Targeted protection |
| **Adaptive** | Increase limits for known good actors | UX |
| **Blocking** | Auto-block abusive IPs | Enforcement |

### 12.6 API Abuse Prevention

**What:** Standards for preventing API abuse.

**Why:**
- APIs are a common target for abuse.
- Abuse must be detected and blocked proactively.
- Abuse prevention must not impact legitimate users.

**Where:** All API endpoints.

**Abuse prevention rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **CAPTCHA** | Turnstile for public mutations | Bot prevention |
| **Anomaly detection** | Detect unusual usage patterns | Proactive blocking |
| **IP reputation** | Check IP reputation | Threat prevention |
| **Behavior analysis** | Analyze request patterns | Abuse detection |
| **Auto-blocking** | Block confirmed abusers | Enforcement |

### 12.7 Secret Management

**What:** Standards for managing secrets and credentials.

**Why:**
- Secrets must never be hardcoded.
- Secrets must be rotatable without downtime.
- Secrets must be auditable.

**Where:** All API keys, tokens, and credentials.

**Secret management rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Environment variables** | Store secrets in env vars | Security |
| **Never commit** | Never commit secrets to git | Security |
| **Validation** | Validate secrets at startup | Catch missing config |
| **Rotation** | Rotate secrets periodically | Security |
| **Minimal access** | Least privilege for service keys | Security |
| **No logging** | Never log secrets | Security |
| **Wrangler secrets** | Use Cloudflare Pages Secrets | Security |

### 12.8 Audit Logging (Security)

**What:** Audit logging standards for security events.

**Why:**
- Security events must be logged for forensics.
- Audit logs must be immutable.
- Audit logs must be retained per policy.

**Where:** All security-sensitive operations.

**Security audit rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **All auth events** | Log login, logout, password changes | Security |
| **All access denials** | Log authorization failures | Security |
| **All admin actions** | Log all admin operations | Compliance |
| **All payment events** | Log all financial transactions | Compliance |
| **Immutable logs** | Audit logs are never modified | Compliance |
| **Retention** | Retain logs per regulatory requirements | Compliance |

---

## 13. Performance Standards

### 13.1 Caching

**What:** Caching standards for API responses.

**Why:**
- Caching reduces database load.
- Caching improves response times.
- Caching must be invalidated correctly.

**Where:** All read-heavy API endpoints.

**Caching rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Cache GET only** | Only cache GET responses | RESTful |
| **TTL always** | Every cached value has TTL | Prevent stale data |
| **Cache-aside** | Read from cache, fallback to DB | Standard pattern |
| **Write-through** | Update DB, then invalidate cache | Consistency |
| **Key naming** | `{domain}:{id}:{field}` | Organized |
| **Never cache PII** | Don't cache personal data | Privacy |
| **CDN caching** | Use CDN for static API responses | Performance |

**Cache TTLs:**

| Resource | TTL | Invalidation |
|----------|-----|--------------|
| Product listings | 5 minutes | On product update |
| Product detail | 5 minutes | On product update |
| Categories | 1 hour | On category update |
| Collections | 1 hour | On collection update |
| CMS pages | 1 hour | On page update |
| Search results | 1 minute | On search |
| User session | 15 minutes | On logout |
| Rate limit counters | 1 minute | Automatic |

### 13.2 Compression

**What:** Compression standards for API responses.

**Why:**
- Compression reduces bandwidth usage.
- Compression improves response times.
- Compression must be compatible with all clients.

**Where:** All API responses.

**Compression rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Brotli** | Use Brotli for best compression | Performance |
| **Gzip fallback** | Gzip for clients that don't support Brotli | Compatibility |
| **Minimum size** | Compress responses > 1KB | Efficiency |
| **Content-Type** | Only compress text-based content types | Correctness |
| **Cloudflare** | Use Cloudflare's built-in compression | Simplicity |

### 13.3 Efficient Payloads

**What:** Standards for efficient API payloads.

**Why:**
- Large payloads waste bandwidth and increase latency.
- Mobile users are especially affected by large payloads.
- Efficient payloads improve overall performance.

**Where:** All API responses.

**Payload efficiency rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Field selection** | Use `select` to return only needed fields | Prevent over-fetching |
| **Pagination** | Always paginate list endpoints | Prevent large responses |
| **Compression** | Enable response compression | Reduce bandwidth |
| **Image optimization** | Serve optimized images via CDN | Performance |
| **Lazy loading** | Load related data on demand | Performance |
| **Batch endpoints** | Support batch operations | Reduce round trips |

### 13.4 Background Processing

**What:** Standards for background processing.

**Why:**
- Long-running tasks must not block API responses.
- Background tasks must be reliable.
- Background tasks must be observable.

**Where:** Email sending, image processing, report generation.

**Background processing rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Async by default** | Don't block request on background tasks | Performance |
| **Queue-based** | Use Cloudflare Queues for background tasks | Reliability |
| **Retry on failure** | Retry failed tasks with backoff | Reliability |
| **Dead letter** | Store permanently failed tasks | Debugging |
| **Progress tracking** | Track task progress | Visibility |
| **Timeout** | Set timeouts for background tasks | Prevent hanging |

### 13.5 High Availability

**What:** High availability standards for the API.

**Why:**
- High availability ensures business continuity.
- High availability requires redundancy.
- High availability must be monitored.

**Where:** All API endpoints and services.

**High availability rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Multi-region** | Deploy across Cloudflare regions | Geographic redundancy |
| **Auto-scaling** | Auto-scale edge functions | Handle traffic spikes |
| **Health checks** | Monitor all services | Early detection |
| **Failover** | Automatic failover on failure | Business continuity |
| **Graceful degradation** | Degrade gracefully when services are down | Availability |
| **Circuit breaker** | Stop calling failing services | Prevent cascade |

---

## 14. Developer Experience & Accessibility

### 14.1 Clear Documentation

**What:** Documentation standards for all APIs.

**Why:**
- Good documentation is essential for adoption.
- Documentation must be auto-generated and always up-to-date.
- Documentation must include runnable examples.

**Where:** All API endpoints.

**Documentation standards:**

| Standard | Tool | Rationale |
|----------|------|-----------|
| **OpenAPI spec** | OpenAPI 3.0 | Industry standard |
| **Interactive docs** | Swagger UI | Try APIs in browser |
| **Code examples** | Request/Response samples | Learning |
| **Error documentation** | All error codes listed | Debugging |
| **Authentication guide** | Step-by-step auth guide | Onboarding |
| **SDK documentation** | Language-specific guides | DX |
| **Changelog** | Every version change | Awareness |
| **Migration guide** | Version upgrade instructions | Backward compatibility |

### 14.2 Consistent Responses

**What:** Standards for consistent API responses.

**Why:**
- Consistent responses simplify client implementation.
- Consistent responses reduce documentation burden.
- Consistent responses enable code generation.

**Where:** All API endpoints.

**Consistency rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Same format** | Same response format everywhere | Predictability |
| **Same error format** | Same error response everywhere | Client predictability |
| **Same pagination** | Same pagination format everywhere | Client predictability |
| **Same naming** | Same naming conventions everywhere | Discoverability |
| **Same status codes** | Same status code usage everywhere | HTTP-level handling |

### 14.3 Developer Experience

**What:** Standards for developer experience (DX).

**Why:**
- Good DX accelerates adoption.
- Good DX reduces support burden.
- Good DX enables self-service.

**Where:** All API documentation, SDKs, and tools.

**DX standards:**

| Standard | Description | Rationale |
|----------|-------------|-----------|
| **Quick start** | Get started in < 5 minutes | Onboarding |
| **Interactive playground** | Try APIs without writing code | Learning |
| **Code generation** | Auto-generate client code | DX |
| **Error messages** | Clear, actionable error messages | Debugging |
| **Type safety** | Full TypeScript support | DX |
| **IDE support** | Autocomplete, inline docs | DX |
| **Testing tools** | API testing sandbox | DX |

### 14.4 Mobile Optimization

**What:** API optimization for mobile clients.

**Why:**
- 70%+ of Nabome traffic is mobile.
- Mobile networks are slower and less reliable.
- Mobile clients need optimized payloads.

**Where:** All API endpoints consumed by mobile clients.

**Mobile optimization rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Small payloads** | Minimize response size | Bandwidth |
| **Compression** | Always compress responses | Bandwidth |
| **Pagination** | Small page sizes (20 items) | Performance |
| **Image optimization** | Serve optimized images | Performance |
| **Offline support** | Support offline-first patterns | UX |
| **Retry logic** | Handle network failures gracefully | Reliability |
| **Batch requests** | Support batch operations | Reduce round trips |

---

## 15. Future Readiness

### 15.1 GraphQL Readiness

**What:** Architecture readiness for GraphQL.

**Why:**
- GraphQL may be needed for complex data requirements.
- GraphQL must be additive, not replacing REST.
- GraphQL must use the same service layer.

**Where:** Future public APIs, partner APIs.

**GraphQL readiness rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Additive** | GraphQL is added alongside REST, not replacing | Backward compatibility |
| **Same services** | GraphQL resolvers use same service layer | No duplication |
| **Same auth** | GraphQL uses same authentication | Consistency |
| **Same rate limiting** | GraphQL uses same rate limiting | Abuse prevention |
| **Schema-first** | Design GraphQL schema before implementation | Contract-first |

### 15.2 gRPC Readiness

**What:** Architecture readiness for gRPC.

**Why:**
- gRPC may be needed for high-performance internal communication.
- gRPC must use the same service layer.
- gRPC must be backward compatible.

**Where:** Future internal service-to-service communication.

**gRPC readiness rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Same services** | gRPC uses same service layer | No duplication |
| **Same auth** | gRPC uses same authentication | Consistency |
| **Proto definitions** | Define proto files for all services | Contract-first |
| **Backward compatible** | gRPC doesn't break existing REST APIs | Coexistence |

### 15.3 Event Streaming

**What:** Architecture readiness for event streaming.

**Why:**
- Event streaming may be needed for real-time features.
- Event streaming must use the same event bus.
- Event streaming must be scalable.

**Where:** Future real-time features, analytics, AI.

**Event streaming rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Same event bus** | Event streaming uses same event bus | Consistency |
| **Same event format** | Events use same structured format | Compatibility |
| **Scalable** | Event streaming scales horizontally | Performance |
| **Observable** | Event streaming is fully observable | Debugging |

### 15.4 Public APIs

**What:** Architecture readiness for public APIs.

**Why:**
- Public APIs enable ecosystem growth.
- Public APIs must be stable and well-documented.
- Public APIs must be versioned and deprecation-friendly.

**Where:** Future public API launches.

**Public API rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Versioned** | Public APIs are versioned | Backward compatibility |
| **Documented** | Full OpenAPI spec | Developer experience |
| **Rate limited** | Strict per-consumer limits | Abuse prevention |
| **Quota-based** | Monthly quotas per tier | Cost control |
| **Monitored** | Full usage analytics | Business intelligence |

### 15.5 Partner APIs

**What:** Architecture readiness for partner APIs.

**Why:**
- Partner APIs enable business growth.
- Partner APIs must be scoped and secure.
- Partner APIs must be auditable.

**Where:** Future partner integrations.

**Partner API rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Scoped access** | Partners have explicit scopes | Least privilege |
| **Rate limited** | Per-partner rate limits | Abuse prevention |
| **Quota based** | Monthly quotas per partner | Cost control |
| **Revocable** | Partner access can be revoked instantly | Security |
| **Auditable** | All partner API usage logged | Compliance |
| **SLA** | Define SLA for partner APIs | Business agreement |

### 15.6 Marketplace APIs

**What:** Architecture readiness for marketplace APIs.

**Why:**
- Marketplace APIs enable multi-vendor support.
- Marketplace APIs must support complex data models.
- Marketplace APIs must be secure and auditable.

**Where:** Future marketplace launch.

**Marketplace API rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Multi-tenant** | Support multiple vendors | Marketplace |
| **Isolation** | Vendor data isolation | Security |
| **Commission** | Support commission calculations | Business |
| **Payout** | Support vendor payouts | Business |
| **Dispute** | Support dispute resolution | Business |

### 15.7 AI APIs

**What:** Architecture readiness for AI-powered APIs.

**Why:**
- AI will power search, recommendations, and automation.
- AI APIs must be scalable and cost-effective.
- AI APIs must be replaceable as AI evolves.

**Where:** Future AI features.

**AI API rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Provider abstraction** | AI behind standard interface | Swappable |
| **Caching** | Cache AI results when possible | Cost optimization |
| **Fallback** | Fallback to non-AI when AI is down | Availability |
| **Cost tracking** | Track AI service costs | Budget management |
| **Latency budget** | Set latency budgets for AI | Performance |

### 15.8 Mobile Applications

**What:** Architecture readiness for native mobile apps.

**Why:**
- Native mobile apps may be needed in the future.
- Mobile apps must use the same API layer.
- Mobile apps must be optimized for mobile networks.

**Where:** Future iOS and Android apps.

**Mobile app readiness rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Same APIs** | Mobile apps use same REST APIs | No duplication |
| **JWT auth** | Mobile apps use JWT + refresh tokens | Mobile-friendly |
| **Push notifications** | Support push notification APIs | UX |
| **Offline support** | Design APIs for offline-first patterns | Reliability |
| **Optimized payloads** | Small, compressed responses | Performance |

### 15.9 Desktop Applications

**What:** Architecture readiness for desktop applications.

**Why:**
- Desktop apps may be needed for admin or power users.
- Desktop apps must use the same API layer.
- Desktop apps must support rich interactions.

**Where:** Future desktop admin app.

**Desktop app readiness rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Same APIs** | Desktop apps use same REST APIs | No duplication |
| **Rich data** | Support larger payloads for desktop | DX |
| **Real-time** | Support WebSocket for real-time updates | UX |
| **Offline** | Support offline mode | Reliability |

### 15.10 Microservices Migration

**What:** Architecture readiness for microservices migration.

**Why:**
- The monolith may need to be split into microservices.
- Microservices migration must be incremental.
- Microservices must use the same service interfaces.

**Where:** Future microservices migration.

**Microservices migration rules:**

| Rule | Standard | Rationale |
|------|----------|-----------|
| **Clear boundaries** | Services don't share database tables | Easy to split |
| **API contracts** | Services communicate via interfaces | Easy to replace |
| **Event-driven** | Services emit events, not direct calls | Loose coupling |
| **Own database** | Each service owns its tables | Data isolation |
| **Stateless services** | No in-memory state | Horizontal scaling |
| **Incremental migration** | Split one service at a time | Risk management |

**Migration phases:**

| Phase | Action | Trigger |
|-------|--------|---------|
| 1. Monolith | Single deployment | Current state |
| 2. Modular monolith | Clear service boundaries | Team grows |
| 3. Service extraction | Split high-load services | Traffic spike |
| 4. Full microservices | All services independent | Multiple teams |

---

## 16. Mandatory Rules for AI Agents

### 16.1 Hard Rules

**Every AI agent building on the Nabome platform MUST follow these rules:**

| Rule | Description | Violation |
|------|-------------|-----------|
| **API-first design** | Design API contract before implementation | Inconsistent APIs |
| **Standard response format** | Every endpoint returns `{ success, data, error, meta }` | Client breakage |
| **Input validation** | Every endpoint validates with Zod | Security vulnerability |
| **Authentication** | Protected endpoints require auth | Data exposure |
| **Authorization** | Check permissions before operations | Data exposure |
| **Error handling** | Typed errors with codes | Debugging difficulty |
| **Rate limiting** | All public endpoints rate limited | Abuse |
| **CSRF protection** | All mutation endpoints | CSRF attacks |
| **Idempotency** | Payment and order creation are idempotent | Duplicate operations |
| **No business logic in services** | Services handle infrastructure only | Tight coupling |
| **No business logic in API layer** | Business logic in handlers, not middleware | Maintainability |
| **External services are replaceable** | All external services behind interfaces | Vendor lock-in |
| **Event-driven communication** | Cross-module via events, not direct calls | Tight coupling |
| **API versioning** | Breaking changes get new versions | Consumer breakage |
| **Backward compatibility** | APIs don't break existing consumers | Consumer trust |
| **Audit logging** | All sensitive operations logged | Compliance |
| **Secret management** | Never commit secrets, validate at startup | Security |
| **HTTPS only** | All communication encrypted | Security |

### 16.2 Soft Rules

**AI agents SHOULD follow these rules:**

| Rule | Description | When to Follow |
|------|-------------|----------------|
| **OpenAPI spec** | Generate spec from code | External APIs |
| **SDK generation** | Generate SDKs from spec | Public APIs |
| **Documentation** | Auto-generate documentation | All APIs |
| **Monitoring** | Set up monitoring for new endpoints | All endpoints |
| **Caching** | Cache read-heavy endpoints | Performance |
| **Compression** | Enable response compression | All responses |
| **Background processing** | Offload long tasks to queues | Long-running operations |

### 16.3 Architecture Independence

**The API Architecture must remain independent from implementation:**

| Principle | Description | Rationale |
|-----------|-------------|-----------|
| **Interface-based** | Services expose interfaces, not implementations | Swappable |
| **No framework lock-in** | APIs must not depend on specific frameworks | Portability |
| **No vendor lock-in** | External services must be replaceable | Independence |
| **Contract-first** | Design contracts before implementation | Stability |
| **Versioned** | Breaking changes get new versions | Backward compatibility |

### 16.4 Integration Rules

**Every integration MUST follow these rules:**

| Rule | Description | Rationale |
|------|-------------|-----------|
| **Wrapper pattern** | Wrap all third-party SDKs | Easy to swap |
| **Interface-based** | Services expose interfaces | Testability |
| **Timeout always** | Never wait forever | Prevent hanging |
| **Retry with backoff** | 3 attempts, exponential | Reliability |
| **Circuit breaker** | Stop calling if failing | Prevent cascade |
| **Fallback** | Graceful degradation | Availability |
| **Mock in tests** | Never call real APIs in tests | Test isolation |
| **Health checks** | Monitor external service health | Proactive response |

---

**Document Version:** 1.0  
**Last Updated:** August 03, 2026  
**Next Review:** September 03, 2026
