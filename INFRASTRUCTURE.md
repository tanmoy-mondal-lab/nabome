# Infrastructure Architecture — নবME

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLOUDFLARE (CDN + WAF)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  DNS (CNAME) │  │  SSL (Full)  │  │  WAF / Bot   │              │
│  │  → Vercel    │  │  Strict      │  │  Fight Mode  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────── VERCEL (Edge + Serverless) ─────────────────────┐
│                                                                     │
│  ┌──────────────────┐    ┌──────────────────────────────────────┐  │
│  │  STATIC FILES    │    │  SERVERLESS FUNCTIONS (us-east-1)    │  │
│  │  (dist/ — Vite)  │    │                                      │  │
│  │                  │    │  ┌────────────────────────────────┐  │  │
│  │  /assets/*       │    │  │  api/[...path].ts             │  │  │
│  │  /images/*       │───►│  │  ├── /api/auth/* (11 routes)  │  │  │
│  │  /index.html     │    │  │  ├── /api/products/*           │  │  │
│  │  /sitemap.xml    │    │  │  ├── /api/orders/*             │  │  │
│  │  /robots.txt     │    │  │  ├── /api/checkout/*           │  │  │
│  │  /favicon.*      │    │  │  ├── /api/payments/*           │  │  │
│  │                  │    │  │  ├── /api/admin/* (90+ routes) │  │  │
│  └──────────────────┘    │  │  └── (240+ total routes)      ┘  │  │
│                           │  └────────────────────────────────┘  │
│                           │                                       │
│                           │  512MB memory, 30s timeout             │
└───────────────────────────┼───────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   SUPABASE      │ │  CLOUDINARY  │ │    RESEND        │
│   (PostgreSQL)  │ │  Image CDN   │ │  Email Service   │
│                 │ │              │ │                  │
│  ┌───────────┐  │ │  unsigned    │ │  POST /emails    │
│  │  Auth     │  │ │  upload      │ │  DKIM + SPF     │
│  │  (JWT)    │  │ │  preset     │ │  from verified   │
│  │           │  │ │              │ │  domain          │
│  │  Database  │  │ │  f_auto     │ │                  │
│  │  (42 models│  │ │  q_auto     │ │  9 templates     │
│  │  16 enums) │  │ │  transforms │ │                  │
│  └───────────┘  │  └──────────────┘ └──────────────────┘
│                 │
│  Pooled conn    │      ┌──────────────────┐
│  :6543/pgbouncer│      │    RAZORPAY      │
│  Direct conn    │      │  Payment Gateway │
│  :5432/direct   │      │                  │
└─────────────────┘      │  Checkout SDK    │
                         │  Webhooks (4)    │
                         │  Refunds         │
                         └──────────────────┘

          ┌─────────────────────────────────────┐
          │         GOOGLE ANALYTICS            │
          │     G-T0HLCQE1B9 (GA4)              │
          └─────────────────────────────────────┘
```

## Data Flow

### Static Page Request
```
User → Cloudflare (DNS + SSL) → Vercel Edge → dist/index.html → Client
                                               └── /assets/*.js (immutable cache)
```

### API Request (Authenticated)
```
User → Cloudflare → Vercel Serverless → api/[...path].ts
  → authenticateRequest (Supabase auth.getUser)
  → rate limit check (in-memory)
  → CSRF validation (double-submit cookie)
  → route dispatcher (240+ routes)
  → handler → Prisma → Supabase/PostgreSQL
  → Response → Cloudflare → User
```

### Checkout + Payment Flow
```
User → /checkout → Vite SPA
  → POST /api/checkout → creates order (COD)
  → OR POST /api/payments/verify → Razorpay SDK
  → Razorpay Webhook → POST /api/payments/webhook
    → HMAC verification
    → Dedup via WebhookEvent table
    → Update order payment status
    → Send email notification (Resend)

  CREATE Order → Prisma TX:
    1. Create order (with items, addresses)
    2. Create payment record
    3. Deduct stock / update reservedStock
    4. Create order status history
    5. Clear cart
    6. Apply coupon usage (if any)
  → Send confirmation email → Resend
  → Return order details
```

## Network Segments

| Segment | Components | Protocols |
|---------|-----------|-----------|
| Public Edge | Cloudflare CDN, WAF | HTTPS (TLS 1.3) |
| Application | Vercel Serverless Functions | HTTPS, Node.js 20 |
| Database | Supabase (Neon Postgres) | TCP :5432 (direct), :6543 (pooled) |
| Media | Cloudinary | HTTPS (REST API) |
| Email | Resend | HTTPS (REST API) |
| Payments | Razorpay | HTTPS (REST + Webhook) |
| Analytics | Google Analytics | JS SDK (client-side) |

## Security Boundaries

```
INTERNET
   │
   ▼
┌─────────────────────────────────────┐
│ CLOUDFLARE (Layer 7 DDoS, WAF)     │ ← TLS termination
│  ├─ Bot Fight Mode                  │
│  ├─ Rate Limiting (auth endpoints)  │
│  └─ IP Geolocation blocking         │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ VERCEL                              │
│  ├─ Security Headers (CSP, HSTS)    │
│  ├─ CSRF Double-Submit Cookie       │
│  ├─ Rate Limiting (in-memory)       │
│  ├─ JWT Verification (Supabase)     │
│  ├─ Role Check (customer/super_admin)│
│  └─ Webhook HMAC Verification       │
└──────────┬──────────────────────────┘
           │
     ┌─────┴─────┐
     ▼            ▼
┌──────────┐ ┌──────────┐
│ Supabase │ │  Resend  │
│(auth+db) │ │  (email) │
│          │ │          │
│ RLS: OFF │ │ API Key  │
│(bypassed)│ │ Auth     │
└──────────┘ └──────────┘
```

## Database Connection Strategy

| Connection | URL | Purpose | Pool |
|-----------|-----|---------|------|
| Direct | `:5432/postgres` | Prisma Migrate, seed scripts, admin tasks | ❌ Direct |
| Pooled | `:6543/postgres?pgbouncer=true&connection_limit=1` | Production API (serverless) | ✅ Transaction mode |

**Vercel env vars:**
- `DATABASE_URL` — Direct (for migrations)
- `DATABASE_URL_POOLED` — Pooled (for runtime API calls via Prisma)

## Caching Strategy

| Resource | Cache Duration | CDN Cache | Stale-While-Revalidate |
|----------|---------------|-----------|----------------------|
| `/assets/*.js,*.css` | 1 year (immutable) | ✅ Yes | N/A |
| `/images/*` | 1 year (immutable) | ✅ Yes | N/A |
| `/favicon.*` | 1 day | ✅ Yes | 7 days |
| `/sitemap.xml` | 1 hour | ✅ Yes | 1 day |
| `/robots.txt` | 1 day | ✅ Yes | 7 days |
| `/index.html` | 0 (must revalidate) | ✅ Yes | No |
| `/api/products` | 60s | ❌ No (dynamic) | 5 min |
| `/api/categories` | 60s | ❌ No | 5 min |
| `/api/auth/*` | No store | ❌ No | No |
| `/api/admin/*` | No store | ❌ No | No |
| `/api/checkout,payments,orders` | No store | ❌ No | No |
