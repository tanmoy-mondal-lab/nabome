# নবME (Nabome) — Technology Stack Blueprint

> **Version:** 1.0  
> **Date:** August 03, 2026  
> **Status:** Active — All AI agents must follow this document  
> **Priority:** This document defines the complete technology foundation  
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0)

---

## Table of Contents

1. [Frontend](#1-frontend)
2. [Backend](#2-backend)
3. [Database](#3-database)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Storage & Media](#5-storage--media)
6. [API Design](#6-api-design)
7. [Caching & Performance](#7-caching--performance)
8. [Email & Notifications](#8-email--notifications)
9. [Payments](#9-payments)
10. [Security](#10-security)
11. [Logging & Monitoring](#11-logging--monitoring)
12. [Analytics](#12-analytics)
13. [Testing](#13-testing)
14. [DevOps & Deployment](#14-devops--deployment)
15. [Code Quality](#15-code-quality)
16. [Git & Versioning](#16-git--versioning)
17. [Scalability Strategy](#17-scalability-strategy)
18. [Backup & Disaster Recovery](#18-backup--disaster-recovery)

---

## 1. Frontend

### 1.1 Framework

| Technology | Version | Choice |
|-----------|---------|--------|
| **React** | 19.x | Primary UI framework |
| **TypeScript** | 5.x | Strict mode enabled |
| **Vite** | 6.x | Build tool and dev server |

**Why React 19:**
- Mature ecosystem with 10+ years of production use
- Concurrent rendering for premium micro-interactions
- Excellent developer tooling (React DevTools, fast refresh)
- Largest talent pool for hiring
- Battle-tested at scale (Instagram, Netflix, Airbnb)

**Why not Next.js:**
- SPA on Cloudflare Pages is simpler and faster to deploy
- React Router v7 + Vite provides equivalent routing without SSR complexity
- Cloudflare's edge network already handles global delivery
- No Node.js server needed — pure edge deployment

**Why not Vue/Svelte/Angular:**
- React has the largest ecosystem for e-commerce components
- More third-party libraries compatible with the stack
- Easier to find developers familiar with the stack
- Framer Motion integration is seamless

**Long-term advantages:**
- React's backing by Meta ensures long-term support
- Gradual adoption of React Server Components if needed later
- Massive community ensures security patches and updates

**Limitations:**
- Bundle size can grow without discipline (mitigated by code splitting)
- Requires strict conventions to avoid prop drilling (mitigated by Zustand)
- Client-side rendering means no native SEO (mitigated by Cloudflare middleware)

**Best practices:**
- Use named exports only (no default exports)
- Use `forwardRef` on all UI primitives
- Set `displayName` on all components
- Max 300 lines per component file
- Route-level code splitting with `React.lazy()`
- Never use `useEffect` for data fetching — use TanStack Query

---

### 1.2 Routing

| Technology | Choice |
|-----------|--------|
| **React Router** | v7.x |

**Why React Router v7:**
- Native Cloudflare Pages support
- File-system-like route conventions
- Type-safe route definitions
- Built-in search params for URL state
- Loader support for pre-fetching data

**Why not TanStack Router:**
- React Router has better Cloudflare Pages integration
- Simpler mental model for the team
- More mature and widely adopted

**Best practices:**
- Define routes in `src/app/routes.tsx`
- Use search params for filters, pagination, sort
- Lazy load heavy route components
- Single `ProtectedRoute` wrapper (no duplicate wrapping)

---

### 1.3 Styling System

| Technology | Version | Choice |
|-----------|---------|--------|
| **Tailwind CSS** | 4.x | Utility-first CSS |
| **PostCSS** | — | CSS processing |
| **LightningCSS** | — | CSS bundling and minification |

**Why Tailwind 4:**
- Design token integration via CSS custom properties
- Zero-runtime CSS — no JS bundle cost
- Excellent tree-shaking removes unused utilities
- Consistent spacing, color, and typography system
- Mobile-first responsive utilities built-in

**Why not CSS Modules:**
- No design token system
- No utility classes for rapid prototyping
- Harder to maintain consistency across components

**Why not CSS-in-JS (styled-components, emotion):**
- Runtime performance cost (parsing + injection)
- Larger bundle size
- SSR complexity not needed for SPA
- Worse tree-shaking

**Best practices:**
- Use CSS custom properties for all design tokens
- Never use arbitrary values (`[123px]`) — use tokens
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- One styling system only — no CSS Modules mixed with Tailwind
- Define all tokens in `:root` in `globals.css`

---

### 1.4 Component Library

| Technology | Choice |
|-----------|--------|
| **Custom primitives** | `src/shared/ui/` |
| **No external UI library** | Build own design system |

**Why custom over shadcn/ui, Radix, or Headless UI:**
- Complete control over premium Apple-level styling
- No dependency on external component APIs
- Tailored to Nabome's specific brand aesthetic
- Smaller bundle (only what's used)
- Long-term maintainability — no breaking changes from upstream

**If starting from scratch, shadcn/ui is acceptable** as a starting point because:
- Copy-paste model (no runtime dependency)
- Built on Radix primitives (accessible)
- Tailwind-native styling
- But must be customized heavily to match Nabome's premium aesthetic

**Component standards:**
- One component per file
- Named exports only
- `forwardRef` on all UI primitives
- `displayName` set on all components
- Compound component pattern for complex components (Card, Dialog, etc.)
- Support controlled and uncontrolled modes

**Required primitives:**
Button, Input, Select, Badge, Card, Dialog, Toast, Skeleton, Label, Checkbox, Radio, Switch, Tabs, Tooltip, Accordion, Breadcrumbs, Pagination, EmptyState

---

### 1.5 State Management

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Zustand** | 5.x | Client-side state (UI, auth, preferences) |
| **TanStack React Query** | 5.x | Server state (API data, caching) |
| **React Hook Form** | — | Form state |
| **React Router** | — | URL state (filters, pagination) |

**Why Zustand for client state:**
- Minimal API — `create()` and `useStore()`
- No providers needed (no Provider wrapping)
- Excellent TypeScript support
- Built-in middleware (persist, devtools, immer)
- Tiny bundle (~1KB)

**Why not Redux/Redux Toolkit:**
- Boilerplate-heavy for simple state
- Requires providers, actions, reducers
- Overkill for SPA client state

**Why TanStack Query for server state:**
- Automatic caching and background refetch
- Request deduplication
- Optimistic updates built-in
- Stale-while-revalidate strategy
- No manual loading/error state management

**Why not SWR:**
- TanStack Query has more features (mutations, infinite queries)
- Better DevTools
- More configurable caching strategies

**State location rules:**

| State | Location | Why |
|-------|----------|-----|
| User profile | Zustand (persisted) | Accessed everywhere |
| Cart items | TanStack Query | DB is source of truth |
| Products list | TanStack Query | Cached, refetched on stale |
| Search results | TanStack Query | URL state for filters |
| Theme preference | Zustand (persisted) | UI preference |
| Modal open/closed | Zustand (not persisted) | Transient UI state |
| Form inputs | React Hook Form | Local to form |
| URL filters | React Router search params | Shareable, bookmarkable |

---

### 1.6 Animations

| Technology | Version | Choice |
|-----------|---------|--------|
| **Framer Motion** | 12.x | Declarative animations |

**Why Framer Motion:**
- Declarative API — `motion.div`, `animate`, `variants`
- Layout animations for smooth transitions
- Gesture support (drag, tap, hover)
- `AnimatePresence` for enter/exit animations
- Respects `prefers-reduced-motion` automatically

**Why not React Spring / CSS animations only:**
- Framer Motion has better declarative API
- Layout animations are difficult with CSS alone
- Exit animations require complex state management without Framer Motion
- CSS animations can't respond to gesture input

**Best practices:**
- Use CSS custom properties for animation tokens
- Use `ease-luxe-out: cubic-bezier(0.22, 1, 0.36, 1)` as default easing
- Keep most animations under 300ms
- Respect `prefers-reduced-motion`
- Use layout animations for shared element transitions

---

### 1.7 Icons

| Technology | Choice |
|-----------|--------|
| **Lucide React** | Tree-shakeable icon library |

**Why Lucide:**
- Consistent design language
- Tree-shakeable (only bundle used icons)
- 1000+ icons covering all needs
- MIT license
- Active maintenance

**Best practices:**
- Import only specific icons: `import { ShoppingCart } from 'lucide-react'`
- Set `aria-hidden="true"` on decorative icons
- Set `aria-label` or `sr-only` text for interactive icons
- Consistent sizing via size prop

---

## 2. Backend

### 2.1 Runtime

| Technology | Choice |
|-----------|--------|
| **Cloudflare Pages Functions** | Edge runtime for API handlers |

**Why Cloudflare Pages Functions:**
- Global edge deployment (300+ cities)
- Zero cold starts with warming
- Free tier generous for MVP
- Native integration with KV, R2, D1, Hyperdrive
- No server management required

**Why not AWS Lambda / Vercel Serverless:**
- Cloudflare's edge network is faster globally
- KV caching at the edge reduces latency
- Hyperdrive provides connection pooling for PostgreSQL
- Unified platform (hosting + edge + storage)

**Why not traditional Node.js server:**
- No server management overhead
- Auto-scaling with traffic
- Global distribution out of the box
- Lower cost at current scale

**Best practices:**
- Use Smart Placement for database-heavy handlers
- Enable Hyperdrive for PostgreSQL connection pooling
- Keep handlers under 150 lines
- One handler per file in `_handlers/`
- Share utilities via `_lib/`

---

### 2.2 API Pattern

| Technology | Choice |
|-----------|--------|
| **REST** | RESTful API with type-safe handlers |
| **JSON** | Request/response format |

**Why REST over GraphQL:**
- Simpler to implement and maintain
- Better HTTP caching (GET requests cacheable)
- More predictable performance
- Easier to debug (standard HTTP tools)
- Sufficient for single-brand D2C storefront

**Why not tRPC:**
- REST allows future mobile app consumption
- More standard for external integrations (webhooks)
- Better documentation with OpenAPI spec later

**API conventions:**
- Resource-oriented URLs (`/api/products`, `/api/orders`)
- Standard HTTP methods (GET, POST, PATCH, DELETE)
- Consistent response format: `{ success, data, error, meta }`
- Pagination via query params (`?page=1&limit=20`)
- Versioning via URL prefix if needed (`/api/v2/...`)

---

### 2.3 Programming Language

| Technology | Version | Choice |
|-----------|---------|--------|
| **TypeScript** | 5.x | Strict mode enabled |

**Why TypeScript strict mode:**
- Catch errors at compile time, not runtime
- Better IDE support (autocomplete, refactoring)
- Self-documenting types
- Prevents entire classes of bugs (null, undefined, type mismatches)

**Best practices:**
- No `any` types — use `unknown` or proper types
- No `as never` — refactor to proper types
- Use discriminated unions for API responses
- Use `satisfies` for type narrowing where appropriate
- Export types alongside implementations

---

## 3. Database

### 3.1 Primary Database

| Technology | Choice |
|-----------|--------|
| **PostgreSQL** | Via Neon Serverless |

**Why PostgreSQL:**
- ACID compliance for transactional e-commerce data
- Rich type system (JSONB, arrays, enums)
- Full-text search with `pg_trgm` extension
- Mature, battle-tested at every scale
- Excellent Prisma support

**Why Neon specifically:**
- Serverless — scales to zero when not in use
- Branching for development workflows
- Connection pooling built-in
- Compatible with Hyperdrive for edge access
- Generous free tier for MVP

**Why not MySQL:**
- PostgreSQL has better JSONB support
- PostgreSQL has `pg_trgm` for full-text search
- PostgreSQL has richer type system
- Better Prisma support

**Why not MongoDB:**
- E-commerce data is relational (products, orders, users)
- ACID transactions are critical for payments
- PostgreSQL's JSONB provides document flexibility when needed
- No schema drift — enforced by Prisma

**Best practices:**
- UUID v4 for all primary keys
- `DECIMAL(10,2)` for currency (never float)
- Index all foreign keys
- Composite indexes for common query patterns
- Soft delete via `isActive` boolean
- Timestamps (`createdAt`, `updatedAt`) on all tables

---

### 3.2 ORM

| Technology | Version | Choice |
|-----------|---------|--------|
| **Prisma** | 6.x | Type-safe ORM |

**Why Prisma:**
- Best TypeScript support of any ORM
- Schema-as-code approach
- Auto-generated types from schema
- Migration management built-in
- Excellent query builder with type safety

**Why not Drizzle:**
- Prisma has more mature migration system
- Prisma Studio for visual database management
- Better documentation
- Larger community

**Why not TypeORM / Sequelize:**
- Prisma has better TypeScript DX
- Prisma schema is more readable
- Prisma generates types from schema (single source of truth)

**Best practices:**
- Use Prisma client singleton (never create new instances)
- Use `include`/`select` for relations (prevent N+1)
- Use transactions for multi-step operations
- Never use raw SQL unless absolutely necessary
- One migration per schema change
- Never modify deployed migrations

---

### 3.3 Connection Pooling

| Technology | Choice |
|-----------|--------|
| **Hyperdrive** | Cloudflare-native connection pooling |

**Why Hyperdrive:**
- Reduces cold start latency for database connections
- Connection pooling across edge workers
- Compatible with Neon serverless PostgreSQL
- No application code changes required
- Built into Cloudflare's edge infrastructure

**Best practices:**
- Configure via `wrangler.jsonc` bindings
- Use `HYPERDRIVE_URL` instead of `DATABASE_URL` in edge functions
- Monitor connection pool metrics

---

## 4. Authentication & Authorization

### 4.1 Authentication Provider

| Technology | Choice |
|-----------|--------|
| **Supabase Auth** | Identity management |
| **Custom session management** | httpOnly cookies |

**Why Supabase Auth:**
- Battle-tested identity provider
- Email/password, OAuth, magic links
- Rate limiting and brute force protection built-in
- Easy integration with PostgreSQL
- Free tier sufficient for MVP

**Why not Auth0 / Clerk / Firebase Auth:**
- Supabase is more cost-effective at scale
- Supabase integrates with our PostgreSQL database
- More control over session management
- No vendor lock-in for auth-specific features

**Why custom session management (not Supabase's default):**
- httpOnly cookies prevent XSS token theft
- Custom session table for business rules (max sessions, rotation)
- Full control over token lifecycle

**Session configuration:**
- Access token: 15 minutes (httpOnly cookie)
- Refresh token: 7 days (httpOnly cookie)
- CSRF token: 4 hours (readable by client)
- Max sessions per user: 5
- Session rotation on sensitive operations

---

### 4.2 Authorization

| Technology | Choice |
|-----------|--------|
| **Custom RBAC** | Role-based access control |

**Why custom over Casbin / Oso:**
- Simple two-role system (customer, admin)
- No complex policy language needed
- Full control over authorization logic
- Easy to audit and debug

**Roles:**
- `customer`: View products, manage own cart/orders/profile
- `admin`: Full CRUD on all resources

**Best practices:**
- Authenticate before authorizing
- Check resource ownership for customer endpoints
- Log all authorization failures
- Default deny (require explicit permission)

---

### 4.3 Bot Protection

| Technology | Choice |
|-----------|--------|
| **Cloudflare Turnstile** | CAPTCHA/bot protection |

**Why Turnstile:**
- Invisible to users (no checkbox)
- Free tier generous
- Privacy-friendly (no tracking)
- Cloudflare-native integration
- Better UX than reCAPTCHA

**Best practices:**
- Verify Turnstile on all public mutation endpoints
- Use invisible mode for logged-in users
- Rate limit auth endpoints independently

---

## 5. Storage & Media

### 5.1 Image Storage & CDN

| Technology | Choice |
|-----------|--------|
| **Cloudinary** | Image storage, optimization, and CDN |

**Why Cloudinary:**
- Automatic format conversion (WebP, AVIF)
- On-the-fly transformations (resize, crop, compress)
- Global CDN delivery
- Generous free tier
- Responsive image generation (srcSet)

**Why not AWS S3 + CloudFront:**
- Cloudinary provides image processing built-in
- No need for separate image optimization service
- Simpler integration
- Better developer experience

**Why not imgix / Fastly:**
- Cloudinary has more comprehensive feature set
- Better free tier
- Native upload API

**Best practices:**
- Use auto-format (`f_auto`) and auto-quality (`q_auto`)
- Generate responsive srcSet for all images
- Use folder structure: `/products/{id}/`, `/avatars/{id}/`
- Max file size: 10MB
- Allowed types: JPEG, PNG, WebP, GIF, SVG
- Max dimensions: 4000x4000px

---

### 5.2 File Storage

| Technology | Choice |
|-----------|--------|
| **Cloudflare R2** | Object storage for non-image files |

**Why R2:**
- S3-compatible API
- No egress fees (unlike S3)
- Cloudflare-native integration
- Good for documents, exports, backups

**Use cases:**
- Data exports (CSV, Excel)
- Invoice PDFs
- Backup files
- Large non-image assets

---

### 5.3 Video Storage

| Technology | Choice |
|-----------|--------|
| **Cloudinary** | Video hosting and transformation |

**Why Cloudinary for video:**
- Same platform as images (unified media management)
- Automatic transcoding
- Adaptive streaming
- Thumbnail generation

**Best practices:**
- Use Cloudinary's video player for embedded videos
- Optimize for mobile bandwidth
- Lazy load video players
- Use poster images for faster initial render

---

## 6. API Design

### 6.1 Request Validation

| Technology | Choice |
|-----------|--------|
| **Zod** | Schema validation |

**Why Zod:**
- TypeScript-first schema definition
- Shared schemas between frontend and backend
- Excellent error messages
- Type inference from schemas
- Small bundle size

**Best practices:**
- Validate every API endpoint input
- Share Zod schemas between frontend forms and API handlers
- Never use `z.any()` for user-facing data
- Use `z.discriminatedUnion` for polymorphic content
- Return field-level error details

---

### 6.2 Pagination

| Pattern | Choice |
|---------|--------|
| **Offset-based** | Standard pagination |

**Pagination format:**
```
GET /api/products?page=1&limit=20&sort=createdAt&order=desc
```

**Response meta:**
```json
{
  "page": 1,
  "limit": 20,
  "total": 150,
  "totalPages": 8
}
```

---

### 6.3 Error Handling

| Technology | Choice |
|-----------|--------|
| **Custom error classes** | Typed error hierarchy |

**Error class hierarchy:**
- `AppError` (base)
  - `ValidationError` (400)
  - `UnauthorizedError` (401)
  - `ForbiddenError` (403)
  - `NotFoundError` (404)
  - `ConflictError` (409)
  - `RateLimitError` (429)

**Best practices:**
- Log unexpected errors with request ID
- Never expose internal error details to clients
- Use structured error codes (not free-text messages)
- Return consistent error response format

---

## 7. Caching & Performance

### 7.1 Edge Caching

| Technology | Choice |
|-----------|--------|
| **Cloudflare KV** | Edge key-value cache |

**Why KV:**
- Global edge replication
- Low-latency reads (< 50ms)
- TTL-based expiration
- No cold starts

**Caching strategy:**

| Data | TTL | Invalidation |
|------|-----|--------------|
| Products list | 5 min | On product update |
| Product detail | 5 min | On product update |
| Categories | 1 hour | On category update |
| Site settings | 10 min | On settings update |
| Search results | 1 min | On search |

**Best practices:**
- Cache GET responses only
- Use descriptive cache keys with prefixes
- Implement cache invalidation on writes
- Set appropriate TTLs per data type

---

### 7.2 Client-Side Caching

| Technology | Choice |
|-----------|--------|
| **TanStack Query** | Server state caching |
| **React Router** | Route-level caching |

**TanStack Query configuration:**
- `staleTime: 5 minutes` — how long data is considered fresh
- `gcTime: 30 minutes` — how long unused data stays in cache
- `retry: 2` — retry failed requests twice
- `refetchOnWindowFocus: false` — don't refetch on tab switch

---

### 7.3 CDN

| Technology | Choice |
|-----------|--------|
| **Cloudflare CDN** | Global content delivery |

**What Cloudflare CDN handles:**
- Static assets (JS, CSS, images)
- API responses (via Cache API)
- Brotli compression
- HTTP/3 support
- TLS termination

---

## 8. Email & Notifications

### 8.1 Email Service

| Technology | Choice |
|-----------|--------|
| **Resend** | Transactional email |
| **React Email** | Email templates |

**Why Resend:**
- Simple API (send email in one function call)
- Excellent deliverability
- React Email integration for templates
- Generous free tier (100 emails/day)
- No infrastructure management

**Why not SendGrid / Mailgun:**
- Resend has simpler API
- Better React integration
- More modern developer experience
- Growing rapidly with good community

**Email templates:**
- Order confirmation
- Shipping update
- Password reset
- Email verification
- Welcome email

**Best practices:**
- Use React Email for type-safe templates
- Send critical emails (order, payment) asynchronously
- Log all email send attempts
- Handle email failures gracefully (don't block user flow)

---

### 8.2 Notification System

| Technology | Choice |
|-----------|--------|
| **Database notifications** | In-app notifications |
| **Email** | Transactional notifications |
| **Push (future)** | Web push notifications |

**Notification types:**
- Order status updates
- Payment confirmations
- Shipping updates
- Promotional (opt-in)
- Security alerts (login, password change)

---

## 9. Payments

### 9.1 Payment Provider

| Technology | Choice |
|-----------|--------|
| **Razorpay** | Payment gateway |

**Why Razorpay:**
- Standard for Indian e-commerce
- UPI, cards, netbanking, wallets
- Subscriptions support
- Easy refund API
- Webhook support for async events

**Why not Stripe:**
- Razorpay is the standard for Indian market
- Better UPI integration
- Lower transaction fees for Indian cards
- Razorpay tax invoices for Indian compliance

**Best practices:**
- Always verify webhooks with signature validation
- Implement idempotency keys for payment processing
- Return non-2xx on webhook failures to trigger retries
- Never trust client-side payment status — always verify server-side
- Use `DECIMAL(10,2)` for all monetary values

---

## 10. Security

### 10.1 Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | Restrictive CSP | Prevent XSS |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer |
| `Permissions-Policy` | Restrictive | Limit browser features |

---

### 10.2 CSRF Protection

| Pattern | Choice |
|---------|--------|
| **Double-submit cookie** | CSRF token in cookie + header |

**Implementation:**
1. Generate random CSRF token
2. Store in httpOnly cookie
3. Client reads cookie and sends as `x-csrf-token` header
4. Server compares cookie and header values (timing-safe)

---

### 10.3 Rate Limiting

| Technology | Choice |
|-----------|--------|
| **Cloudflare KV** | Rate limit counter storage |

**Rate limits:**
- Login: 20 requests/minute
- Register: 10 requests/minute
- Password reset: 5 requests/hour
- General API: 100 requests/minute
- File upload: 10 requests/minute

---

### 10.4 Input Sanitization

| Technology | Choice |
|-----------|--------|
| **DOMPurify** | HTML sanitization |
| **Zod** | Input validation |

**Best practices:**
- Sanitize all user-generated HTML content
- Validate all inputs with Zod before processing
- Use parameterized queries (Prisma handles this)
- Never concatenate user input into SQL

---

## 11. Logging & Monitoring

### 11.1 Logging

| Technology | Choice |
|-----------|--------|
| **Pino** | Structured JSON logging |

**Why Pino:**
- Fastest Node.js logger
- Structured JSON output (searchable)
- Low overhead (non-blocking)
- Excellent TypeScript support
- Works in edge runtime

**Why not Winston:**
- Pino is faster (benchmark-proven)
- Pino has smaller bundle
- Pino output is more structured

**Log levels:**
- `error`: System errors, failures
- `warn`: Degraded performance, recoverable issues
- `info`: Important business events
- `debug`: Development debugging

**Best practices:**
- Include request ID in all logs
- Include user ID in auth operation logs
- Never log sensitive data (tokens, passwords, keys)
- Use `pino-pretty` in development
- Use structured JSON in production

---

### 11.2 Error Monitoring

| Technology | Choice |
|-----------|--------|
| **Sentry** | Error tracking and performance monitoring |

**Why Sentry:**
- Industry standard for error monitoring
- Excellent React integration
- Performance monitoring (Core Web Vitals)
- Session replay for debugging
- Free tier sufficient for MVP

**Best practices:**
- Configure before first deployment
- Set up source maps for readable stack traces
- Alert on new error types
- Monitor error rates per endpoint
- Track performance regressions

---

### 11.3 Audit Logging

| Technology | Choice |
|-----------|--------|
| **PostgreSQL audit_log table** | Security audit trail |

**Audit events:**
- Login success/failure
- Password changes
- Admin actions
- Payment events
- Order modifications
- Rate limit hits

---

## 12. Analytics

### 12.1 Web Analytics

| Technology | Choice |
|-----------|--------|
| **PostHog** | Product analytics |

**Why PostHog:**
- Self-hostable (future option)
- Privacy-focused (GDPR compliant)
- Feature flags built-in
- Session replay built-in
- More actionable than Google Analytics for product teams

**Why not Google Analytics:**
- PostHog provides product analytics, not just web analytics
- Feature flags for gradual rollouts
- Session replay for debugging UX issues
- Better privacy compliance

**Best practices:**
- Track key e-commerce events (view product, add to cart, checkout)
- Don't track personally identifiable information
- Use custom event properties for context
- Set up funnels for conversion tracking

---

### 12.2 Feature Flags

| Technology | Choice |
|-----------|--------|
| **Cloudflare Flagship** | Feature flags (future) |
| **PostHog** | Feature flags (current) |

**Use cases:**
- Gradual feature rollouts
- A/B testing
- Kill switches for problematic features
- Beta feature access

---

## 13. Testing

### 13.1 Unit Testing

| Technology | Version | Choice |
|-----------|---------|--------|
| **Vitest** | 4.x | Unit and integration testing |

**Why Vitest:**
- Vite-native (same config, same transforms)
- Compatible with Jest API (easy migration)
- Fast execution (native ESM)
- Built-in coverage support
- TypeScript support out of the box

**Why not Jest:**
- Vitest is faster (Vite native)
- Vitest has better ESM support
- Vitest shares Vite config (no duplication)

**Coverage targets:**
- Utilities and helpers: 90%+
- API handlers: 80%+
- React components: 70%+
- Critical paths (auth, payments): 100%

---

### 13.2 E2E Testing

| Technology | Version | Choice |
|-----------|---------|--------|
| **Playwright** | 1.x | End-to-end testing |

**Why Playwright:**
- Cross-browser support (Chromium, Firefox, WebKit)
- Auto-wait and retry mechanisms
- Network interception for API mocking
- Visual comparison testing
- Excellent debugging tools

**Why not Cypress:**
- Playwright supports multiple browsers
- Playwright is faster in CI
- Playwright has better API testing support
- Playwright handles authentication setup better

**Critical flows to test:**
1. Registration → Login → Logout
2. Browse products → Add to cart → Checkout → Payment
3. Order history → Order tracking → Return request
4. Admin: Product CRUD, order management

---

### 13.3 Testing Rules

- All tests must be deterministic (no flaky tests)
- Unit tests run in < 100ms
- E2E tests complete in < 5 minutes
- CI enforces all tests pass before merge
- Critical paths (auth, payments, checkout) require 100% coverage

---

## 14. DevOps & Deployment

### 14.1 Hosting

| Technology | Choice |
|-----------|--------|
| **Cloudflare Pages** | Static site + edge functions |

**Why Cloudflare Pages:**
- Global edge deployment
- Free tier generous for MVP
- Automatic preview deployments for PRs
- Built-in CI/CD with GitHub integration
- Native Workers support for API handlers

---

### 14.2 CI/CD

| Technology | Choice |
|-----------|--------|
| **GitHub Actions** | CI/CD pipeline |

**Pipeline stages:**
1. **Lint** — ESLint + TypeScript type checking
2. **Test** — Vitest unit/integration tests
3. **E2E** — Playwright tests
4. **Build** — Vite production build
5. **Deploy** — Cloudflare Pages deployment

**Environments:**

| Environment | Branch | Trigger |
|-------------|--------|---------|
| Preview | PR branches | PR opened/updated |
| Staging | `develop` | Push to develop |
| Production | `main` | Push to main |

---

### 14.3 Containerization

| Technology | Choice |
|-----------|--------|
| **Docker** | Local development consistency |
| **Docker Compose** | Multi-service orchestration |

**Use cases:**
- Local PostgreSQL database
- Consistent development environment
- CI/CD runner environment

**Best practices:**
- Use multi-stage builds for smaller images
- Pin base image versions
- Don't run as root
- Use `.dockerignore` to exclude unnecessary files

---

### 14.4 Environment Management

| Technology | Choice |
|-----------|--------|
| **Cloudflare Pages Secrets** | Production secrets |
| **`.env.example`** | Environment variable template |
| **Zod validation** | Runtime env var validation |

**Environment variables (all must be validated at startup):**
- `DATABASE_URL`, `HYPERDRIVE_URL`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `RESEND_API_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `TURNSTILE_SECRET_KEY`
- `CSRF_SECRET`
- `APP_URL`, `NODE_ENV`

**Best practices:**
- Never commit `.env` files
- Validate all env vars at startup with Zod
- Use `.env.example` with placeholders
- Separate configs per environment

---

## 15. Code Quality

### 15.1 Package Manager

| Technology | Choice |
|-----------|--------|
| **pnpm** | Package manager |

**Why pnpm:**
- Faster than npm and yarn
- Disk-efficient (content-addressable storage)
- Strict dependency resolution (prevents phantom dependencies)
- Built-in workspace support

---

### 15.2 Code Formatting

| Technology | Version | Choice |
|-----------|---------|--------|
| **Prettier** | 3.x | Code formatter |

**Formatting rules:**
- 2 spaces indentation
- 100 character line length
- Trailing commas always
- Semicolons always
- Single quotes for strings, double for JSX

---

### 15.3 Linting

| Technology | Version | Choice |
|-----------|---------|--------|
| **ESLint** | 9.x | Code linting |

**Linting rules:**
- No `any` types
- No `console.log` (use Pino)
- No unused imports
- Import ordering (external → internal → types)
- Consistent naming conventions

---

### 15.4 Pre-commit Hooks

| Technology | Choice |
|-----------|--------|
| **Husky** | Git hooks |
| **lint-staged** | Run linters on staged files |

**Pre-commit checks:**
- ESLint on staged `.ts`/`.tsx` files
- Prettier formatting on staged files
- TypeScript type checking

---

## 16. Git & Versioning

### 16.1 Git Workflow

```
main                    ← Production (auto-deploy)
├── develop             ← Integration branch (auto-deploy to staging)
│   ├── feature/*       ← Feature branches
│   ├── fix/*           ← Bug fix branches
│   ├── refactor/*      ← Refactor branches
│   └── chore/*         ← Maintenance branches
```

**Branch naming:**
- `feature/<domain>-<description>` — e.g., `feature/auth-login`
- `fix/<domain>-<description>` — e.g., `fix/checkout-total`
- `refactor/<domain>-<description>` — e.g., `refactor/api-handlers`
- `chore/<description>` — e.g., `chore/update-deps`

**Commit convention (Conventional Commits):**
```
feat(auth): add login endpoint with Supabase integration
fix(cart): prevent duplicate items when variant changes
refactor(api): split auth handler into domain modules
test(checkout): add integration tests for payment flow
chore(deps): update Prisma to 7.0
```

---

### 16.2 Versioning Strategy

| Type | Convention | Example |
|------|-----------|---------|
| **Semantic Versioning** | `MAJOR.MINOR.PATCH` | `1.2.3` |
| **MAJOR** | Breaking changes | API contract, DB schema |
| **MINOR** | New features (non-breaking) | New endpoint, new field |
| **PATCH** | Bug fixes | Fix validation, fix typo |

---

## 17. Scalability Strategy

### 17.1 Scaling Phases

| Phase | Users | Infrastructure |
|-------|-------|---------------|
| **MVP** | 0–10K | Current architecture |
| **Growth** | 10K–100K | Add caching, optimize queries |
| **Scale** | 100K–1M | Read replicas, CDN optimization |
| **Enterprise** | 1M+ | Consider microservices, dedicated infra |

### 17.2 Scaling Principles

| Principle | Implementation |
|-----------|---------------|
| **Edge-first** | All API logic on Cloudflare edge |
| **Stateless handlers** | No in-memory state across requests |
| **Connection pooling** | Hyperdrive for database connections |
| **Caching** | KV for read-heavy data at edge |
| **Horizontal scaling** | Auto-scaling with Cloudflare |
| **Lazy loading** | Code splitting for faster initial load |
| **Background jobs** | Offload email, webhooks from request cycle |

---

## 18. Backup & Disaster Recovery

### 18.1 Database Backup

| Strategy | Implementation |
|----------|---------------|
| **Automated backups** | Neon point-in-time recovery |
| **Manual snapshots** | Before major migrations |
| **Backup retention** | 30 days minimum |

### 18.2 Disaster Recovery

| Scenario | Recovery Plan |
|----------|--------------|
| **Database failure** | Neon automatic failover + restore from backup |
| **Code deployment failure** | One-click rollback to previous Cloudflare Pages version |
| **External service outage** | Graceful degradation (cache stale data, queue operations) |
| **Full platform outage** | Restore from latest backup, notify users |

### 18.3 Recovery Targets

| Metric | Target |
|--------|--------|
| **RPO (Recovery Point Objective)** | < 1 hour |
| **RTO (Recovery Time Objective)** | < 4 hours |
| **Uptime target** | 99.9% |

---

## Summary: Complete Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Frontend Framework** | React | 19.x |
| **Backend Runtime** | Cloudflare Pages Functions | Edge |
| **Programming Language** | TypeScript | 5.x (strict) |
| **Build Tool** | Vite | 6.x |
| **Database** | PostgreSQL (Neon Serverless) | — |
| **ORM** | Prisma | 6.x |
| **Authentication** | Supabase Auth + Custom Sessions | — |
| **Authorization** | Custom RBAC | — |
| **Bot Protection** | Cloudflare Turnstile | — |
| **Image Storage** | Cloudinary | — |
| **File Storage** | Cloudflare R2 | — |
| **Video Storage** | Cloudinary | — |
| **Caching** | Cloudflare KV + TanStack Query | — |
| **Search** | PostgreSQL pg_trgm | — |
| **State Management** | Zustand (client) + TanStack Query (server) | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Component Library** | Custom design system | — |
| **Animations** | Framer Motion | 12.x |
| **Form Handling** | React Hook Form + Zod | — |
| **Validation** | Zod | 3.x |
| **API Design** | REST (JSON) | — |
| **Email Service** | Resend + React Email | — |
| **Payments** | Razorpay | — |
| **Logging** | Pino | — |
| **Error Monitoring** | Sentry | — |
| **Analytics** | PostHog | — |
| **Unit Testing** | Vitest | 4.x |
| **E2E Testing** | Playwright | 1.x |
| **Linting** | ESLint + Prettier | 9.x / 3.x |
| **Package Manager** | pnpm | — |
| **CI/CD** | GitHub Actions | — |
| **Hosting** | Cloudflare Pages | — |
| **CDN** | Cloudflare CDN | — |
| **Containerization** | Docker + Docker Compose | — |
| **Icons** | Lucide React | — |

---

*Last updated: August 03, 2026*
