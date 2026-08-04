# নবME (Nabome) — Performance, Scalability & Infrastructure Architecture Standard

> **Version:** 1.0
> **Date:** August 03, 2026
> **Status:** Active — All AI agents must follow this document
> **Priority:** This document is the single source of truth for performance, scalability, infrastructure, deployment, availability, recovery, observability, and platform growth design
> **Supersedes:** None — complements ARCHITECTURE.md (v3.0), TECH_STACK.md (v1.0), DATABASE_ARCHITECTURE.md (v1.0), SECURITY_ARCHITECTURE.md (v1.0), STORAGE_ENGINE_ARCHITECTURE.md (v1.0), and FOLDER_ARCHITECTURE.md (v1.0)

---

## Table of Contents

1. [Performance Foundation](#1-performance-foundation)
2. [Scalability](#2-scalability)
3. [Caching](#3-caching)
4. [Database Scaling](#4-database-scaling)
5. [Background Processing](#5-background-processing)
6. [Media Delivery](#6-media-delivery)
7. [Deployment](#7-deployment)
8. [High Availability](#8-high-availability)
9. [Disaster Recovery](#9-disaster-recovery)
10. [Observability](#10-observability)
11. [Infrastructure Security](#11-infrastructure-security)
12. [Operational Permissions](#12-operational-permissions)
13. [Performance Testing](#13-performance-testing)
14. [Accessibility Delivery](#14-accessibility-delivery)
15. [Future Readiness](#15-future-readiness)
16. [Mandatory Rules for AI Agents](#16-mandatory-rules-for-ai-agents)
17. [Architectural Checklist](#17-architectural-checklist)

---

## 1. Performance Foundation

### 1.1 Performance Philosophy

**What:** The governing principle that performance is a product feature with the same priority as functionality, security, and correctness. Nabome must remain fast from the first customer to millions of users, and growth must never require an architectural redesign.

**Why:**
- **Conversion:** Slow sites lose sales — a 100ms latency increase measurably reduces conversion rate in e-commerce.
- **Retention:** Users abandon slow experiences; e-commerce users are especially sensitive to load time.
- **SEO:** Google uses Core Web Vitals (LCP, INP, CLS) as ranking signals; performance is a marketing cost.
- **Cost:** Efficient systems serve more users with fewer resources, reducing infrastructure spend per user.
- **Trust:** Enterprise-grade positioning demands enterprise-grade responsiveness.

**Where:** Every layer — frontend bundle, edge runtime, API handlers, database queries, third-party integrations, media delivery, and infrastructure configuration.

**Best practices:**
- Treat every performance decision as a product decision with an owner and a measured outcome.
- Measure before optimizing; never optimize blindly. Use real traffic data, not assumptions.
- Default to the fastest safe option: edge-first execution, caching by default, bounded queries.
- Optimize the critical path first (LCP, checkout, search) before long-tail optimizations.
- Make performance failures visible in CI: budget checks fail the build.
- Revisit budgets quarterly; what is fast today may be slow after a feature is added.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Optimizing code before measuring | Wasted effort, added complexity | Profile first, optimize second |
| Performance treated as a "nice to have" | Slow releases, unhappy users | Performance budget gates in CI |
| Optimizing only the homepage | Checkout/admin regressions | Test all critical flows |
| Micro-optimizing at the expense of clarity | Unmaintainable code | Optimize with measured justification |
| Chasing the 99th percentile while ignoring the median | Poor experience for the majority | Optimize p50/p95 first, then p99 |

### 1.2 Performance Budgets

**What:** Hard, quantified limits on resource cost per page and per interaction, enforced in CI. A budget is a contract that regressions must not violate.

**Why:**
- **Prevention over detection:** Budgets catch performance regressions at merge time, not after a user complains.
- **Accountability:** Quantified targets make performance reviewable and actionable.
- **Scaling safety:** Budgets ensure new features cannot silently degrade the platform as it grows.

**Where:** Build pipeline, every route, every API endpoint, every asset pipeline.

**Best practices — mandatory budget table (baseline targets, revisited quarterly):**

| Metric | Budget | Where Enforced |
|--------|--------|----------------|
| **Initial JS bundle (main chunk)** | < 200KB gzip | CI bundle-size check |
| **Total route-level JS** | < 350KB gzip per route | CI bundle-size check |
| **CSS delivery** | < 50KB gzip | CI bundle-size check |
| **Hero image weight** | < 150KB | Build-time asset check |
| **LCP** | < 2.5s (p75 on real devices) | CI Lighthouse + RUM |
| **INP** | < 200ms (p75) | CI Lighthouse + RUM |
| **CLS** | < 0.1 (p75) | CI Lighthouse + RUM |
| **FCP** | < 1.8s (p75) | CI Lighthouse + RUM |
| **TTFB** | < 800ms (p75, edge) | Synthetic + RUM |
| **API response (p95)** | < 200ms read, < 400ms write | Synthetic + RUM |
| **Database query (p95)** | < 100ms | Query monitoring |
| **Third-party script count** | < 5 total | CI asset check |
| **Uncompressed transfer on 4G** | < 2MB per page view | Lighthouse |

**Budget enforcement rules:**
- Add `size-limit` or equivalent bundle checks to the CI pipeline (`pnpm size-check`).
- Lighthouse CI fails the build if any Core Web Vital budget is exceeded.
- A feature that exceeds a budget must either be split, deferred, or explicitly approved with a documented exception and a date to re-measure.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Budgets set but never enforced | Regressions slip in silently | Enforce in CI, fail builds |
| Budgets too generous | Slow product shipped "in budget" | Set budgets from real device data |
| No budget for routes/features | Payload grows per feature | Per-route budgets |
| Ignoring third-party scripts | Hidden page weight | Count and cap all third parties |
| Budgets as a one-time exercise | Drift over time | Quarterly review and adjust |

### 1.3 Core Web Vitals

**What:** The three user-centric web performance metrics standardized by Google — Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) — plus supporting metrics (FCP, TTFB, TBT).

**Why:**
- **User experience:** These metrics measure what users actually experience, not theoretical page load.
- **SEO ranking:** Core Web Vitals are Google ranking signals.
- **Mobile-first:** Nabome is mobile-first; these metrics are specifically mobile-centric.

**Where:** All user-facing pages on the storefront, account areas, and admin panel.

**Best practices — targets and techniques:**

| Metric | Target | Technique |
|--------|--------|-----------|
| **LCP** | < 2.5s | Preload LCP image/hero, code-split non-critical JS, edge caching, `fetchpriority="high"` on LCP element |
| **INP** | < 200ms | Keep main thread free: code-split, avoid long tasks, minimize effect cascades, keep interaction handlers cheap |
| **CLS** | < 0.1 | Reserve space for images/videos (width/height + `aspect-ratio`), font-display swap, avoid injecting content above the fold after load |
| **FCP** | < 1.8s | Render-critical CSS inline, defer non-critical CSS, minimal blocking scripts |
| **TTFB** | < 800ms | Edge execution, KV/CDN caching, Hyperdrive connection pooling |
| **TBT** | < 200ms | Break up long JS tasks, lazy hydrate heavy components |

**LCP-specific rules:**
- The LCP element must be discoverable: include its dimensions, use modern formats (AVIF/WebP), and avoid lazy-loading it.
- The hero/LCP image must be served from the CDN edge with `f_auto`/`q_auto` (current platform: Cloudinary).
- Font loading must use `font-display: swap` and preloaded, subsetted fonts.

**INP-specific rules:**
- No synchronous network or database work in event handlers.
- Animations must run on compositor-only properties (`transform`, `opacity`).
- Avoid re-render storms: memoize expensive subtrees, keep lists virtualized.

**CLS-specific rules:**
- Every image and video requires explicit dimensions or `aspect-ratio`.
- Ad/embedded widgets must reserve their slot.
- Dynamic content (banners, toasts) must not shift layout.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Lazy-loading the LCP image | LCP explosion | Never lazy-load LCP element |
| Fonts blocking render | Slow FCP/LCP | `font-display: swap`, preload critical fonts |
| No dimensions on images | CLS spikes | Always set width/height or aspect-ratio |
| Measuring on desktop only | Mobile misses | Measure mobile 4G real devices |
| Ignoring real-user data | Synthetic-only blind spots | Use RUM (Sentry/PostHog) + synthetic (Lighthouse) |

### 1.4 Backend Performance

**What:** The performance standards for server-side and edge-side execution — handlers, business logic, integrations, and runtime configuration.

**Why:**
- Backend latency dominates TTFB and API response times.
- Edge execution must be fast; any logic added to the request path multiplies across every request.
- Backend performance errors are the most common cause of degraded UX (slow checkout, failed payments).

**Where:** Cloudflare Pages Functions / edge handlers, `_lib/` utilities, service integrations, database access layer.

**Best practices:**
- **Edge-first:** Execute all API handlers on the edge (current platform: Cloudflare Pages Functions) for global low latency.
- **Handler size limit:** Keep handlers under 150 lines (see FOLDER_ARCHITECTURE.md) — small handlers are fast and maintainable.
- **No heavy computation in request path:** CPU-bound work (image processing, report generation, large exports) must be moved to background processing (see Section 5).
- **Connection pooling:** Use Hyperdrive for all database connections; never open a connection per request.
- **Reuse clients:** Singleton Prisma client, singleton third-party clients (Resend, Cloudinary, Razorpay).
- **Async offloading:** Fire-and-forget non-critical work (emails, notifications, analytics) via queues, never in the request cycle.
- **Early return:** Validate and reject bad requests before touching the database.
- **Parallelism:** Fetch independent data concurrently with `Promise.all`, never sequentially.
- **Bounded work:** Always paginate, always cap result sets, never load full tables.

**Backend latency budget per request (p95):**

| Phase | Budget |
|-------|--------|
| Request routing + middleware | < 10ms |
| Auth + rate limiting | < 15ms |
| Input validation | < 5ms |
| Business logic (CPU) | < 50ms |
| Database read (with pooling + cache) | < 50ms |
| Response serialization | < 10ms |
| **Total read request** | **< 200ms** |
| **Total write request** | **< 400ms** |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| CPU work in the request path | Timeouts and cold starts | Move to background jobs |
| New DB connection per request | Connection exhaustion | Hyperdrive pooling |
| Sequential awaits on independent data | Latency = sum of parts | `Promise.all` |
| Full-table scans / no pagination | Memory pressure, slow responses | Always paginate, index filters |
| Sync email/notification sends | Blocked user flow | Queue everything non-critical |

### 1.5 API Performance

**What:** The performance standards for the HTTP API layer — payload size, response shape, pagination, HTTP semantics, and caching headers.

**Why:**
- API latency directly drives UI perceived speed (TanStack Query waits on the API).
- Well-designed HTTP semantics enable caching at the edge, CDN, and browser for free.
- Fat payloads waste mobile bandwidth and decode time.

**Where:** All `/api/*` endpoints, webhooks, admin API surface, and the shared API client.

**Best practices:**
- **Standard response envelope:** `{ success, data, error, meta }` with `meta` for pagination (see TECH_STACK.md §6).
- **Field selection:** Endpoints must not return fields the client does not use; use Prisma `select` on the backend.
- **Pagination everywhere:** Offset pagination `?page=&limit=` with capped `limit` (max 50) and total counts; migrate to cursor pagination for high-volume lists when offset slows down (see Section 4.4).
- **HTTP caching headers:** Public, immutable GET endpoints return `Cache-Control: public, s-maxage=..., stale-while-revalidate=...`; personalized responses return `private, no-store` as appropriate.
- **Conditional requests:** Support `ETag`/`Last-Modified` + `If-None-Match` for expensive GETs.
- **Compression:** Enable Brotli (CDN default) for all API responses.
- **Idempotency keys:** Mutating operations accept an `Idempotency-Key` header and are deduplicated server-side (critical for payments and order creation).
- **No nested fan-out:** Batch endpoints (`POST /api/cart/batch`) over client-side loops.
- **Rate limiting with graceful `429`:** Return structured `Retry-After` headers and `X-RateLimit-*` headers.

**API performance budget:**

| Endpoint Class | p95 Budget | Notes |
|----------------|-----------|-------|
| Public read (catalog, search, product detail) | < 200ms | CDN/KV cacheable |
| Personalized read (cart, orders, wishlist) | < 250ms | DB + private cache |
| Mutations (checkout, order create) | < 500ms | Async steps queued |
| Admin bulk/report endpoints | < 2s | Cached aggregations |
| Webhook handlers | < 5s | Ack fast, process async |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Returning full entities everywhere | Fat payloads, slow mobile | Field selection |
| No caching headers | Every hit hits origin | Cache-Control on all GETs |
| Client-side pagination loops | N+1 network requests | Server-side batch/keyset |
| No idempotency on payments | Duplicate charges | Idempotency-Key everywhere money moves |
| Sequential batch processing in webhooks | Timeouts and retries | Acknowledge immediately, process via queue |

### 1.6 Database Performance

**What:** The performance standards for the database tier — query design, indexing, connection management, and query observability. Full standards live in DATABASE_ARCHITECTURE.md; this section defines the performance contract.

**Why:**
- The database is the most common bottleneck in e-commerce as traffic grows.
- A query that is fast at 10K users can be catastrophic at 1M users.
- Database performance issues surface slowly and are expensive to fix late.

**Where:** Prisma schema, all handlers, `_lib/database/`, migrations, and query code.

**Best practices:**
- **Index everything queried:** All foreign keys, all filter columns, all sort columns; composite indexes for the common query patterns in DATABASE_ARCHITECTURE.md Appendix A.
- **Use `select` and `include`:** Never `findMany()` without selecting columns; never loop with per-row queries (N+1).
- **Connection pooling always:** Hyperdrive; monitor pool saturation.
- **Query cost caps:** No unbounded scans; every query must be boundable (pagination, date range, tenant scope).
- **Transaction discipline:** Keep transactions short; never hold a transaction open across network calls (external API calls) — that serializes writes and bloats locks.
- **Read-heavy paths bypass the DB:** Catalog, categories, settings read from KV/cache first; DB is the source of truth, not the first stop (see Section 3).
- **Analytics off the hot path:** Aggregations via scheduled jobs into cache/materialized views; never compute analytics live in a request.
- **Monitor query time:** Instrument every query with timing; alert on p95 > 100ms.

**Database performance budget:**

| Metric | Budget |
|--------|--------|
| Query p95 (indexed, cached paths) | < 50ms |
| Query p95 (uncached, complex joins) | < 100ms |
| Transaction duration | < 200ms |
| Connection pool utilization | < 80% sustained |
| Slow query rate (> 100ms) | < 0.1% of queries |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Missing indexes on new FKs | Latency grows with rows | Add index in same migration |
| N+1 queries via loops | O(n) queries per request | `include`/`select`, or batch |
| Unbounded `findMany` | Memory + lock pressure | Pagination mandatory |
| Transactions across external calls | Lock contention, deadlocks | Keep txn local, queue external calls |
| Live aggregation in requests | DB melts under load | Precompute via jobs/cache |
| Ignoring EXPLAIN/query plans | Mystery slow paths | Query plan review in code review |

### 1.7 Infrastructure Efficiency

**What:** The standard for using platform resources (compute, cache, storage, bandwidth) efficiently so cost grows sub-linearly with traffic.

**Why:**
- Efficient infrastructure is the difference between a sustainable business and one whose costs explode at scale.
- Efficiency is also a performance lever: less work = less latency.
- Vendor-neutral efficiency standards protect against lock-in and allow cost optimization.

**Where:** All platform configuration — edge functions, caching layers, storage tiers, background jobs, and asset pipelines.

**Best practices:**
- **Serve from cache first:** Every request should be satisfiable by the CDN/KV/edge cache before reaching origin compute or the database (cache hit ratio targets in Section 3).
- **Compute only when necessary:** Move cold, repeatable work into scheduled jobs; cache its output.
- **Right-size storage tiers:** Hot data in cache, warm data in primary storage, cold/archival data in archival tiers (see STORAGE_ENGINE_ARCHITECTURE.md).
- **Media optimization before delivery:** Never ship original images to users — transform at the CDN (Cloudinary `f_auto`/`q_auto`, responsive srcSet).
- **Bandwidth discipline:** Compress everything, minify everything, cap image/video sizes, respect `Accept-Encoding`.
- **Off-peak heavy work:** Exports, re-encodes, aggregations run on schedules, not during peak traffic.
- **Scale-to-zero readiness:** Components must be able to scale to zero when idle and burst on demand (see Section 2.6).
- **Waste detection:** Track cache hit ratios, origin error rates, and unused storage; remove orphaned assets and dead code.

**Infrastructure efficiency budgets:**

| Metric | Target |
|--------|--------|
| Static/CDN cache hit ratio | > 95% |
| KV/edge cache hit ratio (read endpoints) | > 85% |
| Origin error rate | < 0.1% |
| Image bytes delivered vs source | < 30% of source size |
| Storage orphan/duplicate rate | < 5% (cleanup cadence) |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Caching disabled "to be safe" | Origin overload, slow response | Default cache on, opt out deliberately |
| Serving original media | Huge bandwidth bills, slow mobile | Transform at delivery |
| Recomputing cold data per request | Wasted compute | Cache + scheduled recompute |
| No orphan cleanup | Storage bloat and cost | Scheduled reconciliation |
| Ignoring cache hit ratios | Silent inefficiency | Dashboard + alert |

---

## 2. Scalability

### 2.1 Horizontal Scaling

**What:** The strategy of adding more instances of a service (more edge processes, more workers, more replicas) rather than making a single instance larger. Horizontal scaling is the default growth mechanism for Nabome.

**Why:**
- **Unbounded growth:** Horizontal scaling has no practical ceiling; vertical scaling hits hardware limits.
- **Resilience:** More instances means fewer single points of failure.
- **Cost control:** Scale to exactly the traffic you have, in small increments.

**Where:** The compute tier (edge functions/workers), background workers, and read replicas.

**Best practices:**
- **Statelessness is a prerequisite** (see Section 2.3) — instances must be interchangeable and disposable.
- Design for any number of instances from day one: no in-memory session affinity, no local filesystem state.
- Prefer many small instances over few large ones for finer-grained scaling and smaller blast radius.
- Scale the narrowest bottleneck first (verify with metrics, not instinct).
- Every component must handle its neighbors scaling in/out mid-request (retries, reconnection).

**Horizontal scaling triggers (draft, refined with real data):**

| Component | Scale-Out Trigger | Scale-In Trigger |
|-----------|-------------------|------------------|
| Edge handlers | CPU/concurrency approaching limit | Idle for sustained period |
| Workers | Queue depth > threshold | Queue drained |
| Read replicas | Read QPS > replica capacity | Read QPS low for sustained period |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Scaling before statelessness | Broken sessions, data loss | Stateless first |
| Scaling everything when one component is the bottleneck | Wasteful cost | Instrument and scale the bottleneck |
| Instance-affine state (in-memory cache, sticky sessions) | Inconsistent behavior | Externalize to KV/cache |
| Manual scaling | Over/under-provisioning at the worst times | Autoscaling rules |

### 2.2 Vertical Scaling

**What:** Increasing the size/power of a single instance (more CPU, memory, storage). Vertical scaling is a tactical, short-term lever — never the long-term growth strategy.

**Why:**
- **Quick relief:** One configuration change can relieve a bottleneck within minutes.
- **Inevitability:** Even horizontally scaled systems vertically scale some layer (a single database writer, a single cache leader) temporarily.

**Where:** Database writer capacity, cache capacity, and edge function resource limits.

**Best practices:**
- Use vertical scaling as a bridge while horizontal capacity is provisioned, not as the plan.
- Only vertically scale components that cannot be sharded or replicated easily (the write path).
- Pair every vertical scale-up with a plan to distribute the load (read replicas, sharding, caching) so the single node never becomes a permanent ceiling.
- Document size decisions: know why a given instance size was chosen and when it must be re-evaluated.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Treating vertical as the strategy | Hard ceiling hit at scale | Horizontal by default |
| Scaling only on symptoms | Repeated firefighting | Root-cause with metrics |
| Oversized single points of failure | Expensive downtime | Distribute load |
| Forgetting to re-evaluate | Stale sizing | Quarterly capacity review |

### 2.3 Stateless Services

**What:** The architectural rule that every service instance (edge handler, worker, job runner) holds no request-scoped or instance-local state. Any state lives in explicit, external stores (database, KV, object storage).

**Why:**
- **Prerequisite for horizontal scaling:** Stateless instances are interchangeable; traffic can route to any of them.
- **Graceful failure:** An instance can die mid-request without losing user state.
- **Operational simplicity:** Deployments, rollbacks, and autoscaling become trivial when instances are disposable.

**Where:** All handlers, `_lib/` utilities, background workers, scheduled jobs, and any future service.

**Best practices:**
- **Explicit state inventory:** Every piece of state must have a defined home — session → DB/httpOnly cookie, server cache → KV, uploads → object storage, filesystem → nothing.
- **No local filesystem writes** in production handlers; use object storage.
- **No in-memory session affinity**; sessions are validated from signed cookies + DB.
- **Idempotent handlers:** Replays and retries must be safe (idempotency keys, idempotent writes).
- **Stateless + bounded:** Handlers must not accumulate process-local data that grows with traffic.
- **Warm-start awareness:** Never assume a process lives longer than a single request.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| In-memory rate-limit/cache stores | Wrong counts across instances | KV-based stores |
| Local temp files | Lost on instance recycle | Object storage / streams |
| Sticky sessions | Breaks autoscaling and failover | Stateless auth via cookies/JWT |
| Non-idempotent retried work | Duplicate orders/emails | Idempotency keys |

### 2.4 Load Distribution

**What:** The mechanism that spreads incoming traffic across available instances so no single instance is overwhelmed and the fleet is utilized evenly.

**Why:**
- Even distribution maximizes throughput and latency quality.
- Distribution enables rolling deployments, canary releases, and regional failover (see Sections 7 and 8).
- Without distribution, scaling is meaningless — all traffic lands on one instance.

**Where:** Edge routing layer, API gateway surface, worker queues, and (future) service mesh.

**Best practices:**
- **Global edge routing:** Requests terminate at the nearest edge location (current platform: Cloudflare), so distribution is inherently geographic and automatic.
- **Connection-pooled DB access:** Hyperdrive distributes connections so edge instances never exhaust the database's connection budget.
- **Round-robin/least-connection semantics** for background workers; assign work by queue, not by affinity.
- **Respect `Retry-After` and backoff** when a target is slow; never hammer a degraded node (fail-fast and move on).
- **Traffic steering for deploys:** Canary and blue-green release traffic splitting (see Section 7) to limit blast radius.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Uneven shard/hash routing | Hot spots | Consistent hashing with virtual nodes |
| No health-aware routing | Traffic to dead nodes | Health-checked routing (Section 8.2) |
| Ignoring backpressure | Cascade failures | Circuit breakers, bounded queues |
| Client affinity assumptions | Broken UX after failover | Client retry on `Retry-After` |

### 2.5 Resource Isolation

**What:** The separation of workloads and tenants so that one workload's behavior (a traffic spike, a runaway job, a noisy neighbor) cannot degrade another.

**Why:**
- **Blast radius control:** A failure in one domain must not cascade to others.
- **Deterministic performance:** Checkout must not be slowed by an export job.
- **Tenant safety (future marketplace):** One seller's load must never affect another seller.

**Where:** Between domains (read-heavy catalog vs. transactional checkout), between job classes (priority vs. batch), between environments, and between tenants (future).

**Best practices:**
- **Separate worker queues by priority and workload class** (see Section 5.7) so batch jobs never starve interactive jobs.
- **Separate cache namespaces** per domain with independent TTL and capacity.
- **Database workload isolation:** Analytics/reporting reads go to replicas; interactive reads and writes stay on the primary path.
- **Rate limit and quota per tenant** (future marketplace) so a single tenant cannot consume shared capacity.
- **Environment isolation** (see Section 11.4) so test/load traffic never touches production resources.
- **Capacity caps per queue/job type** (concurrency limits, max messages) prevent one class from exploding.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| One shared queue for everything | Batch jobs block checkout | Separate queues per class |
| Shared cache key space | Cross-domain eviction storms | Namespaced keys + separate TTLs |
| Analytics on the writer | Interactive latency spikes | Replicas for analytics |
| No tenant quotas | Marketplace noisy neighbors | Per-tenant rate limits |

### 2.6 Elastic Scaling

**What:** The ability to automatically add and remove capacity in response to demand — scale to zero when idle and burst on demand during spikes (festival sales, flash sales, launches).

**Why:**
- **Cost:** Pay only for used capacity.
- **Performance:** Capacity exists when it is needed, without manual intervention.
- **Predictability:** Peak season (Diwali, Great Indian Festival, flash sales) is when e-commerce either wins or fails; elasticity is what makes spikes survivable.

**Where:** Edge functions (auto-burst), background workers (queue-driven concurrency), and database/read replicas (load-driven).

**Best practices:**
- **Design every component to scale independently** and to scale to zero (serverless-first).
- **Warm the path before the spike:** Pre-warm caches (product detail, categories, search) before a known sale.
- **Queue-driven worker elasticity:** Worker concurrency follows queue depth, not fixed sizing.
- **Provision ahead for known events:** Flash sales get pre-provisioned capacity and pre-warmed caches (see Section 2.7).
- **Autoscaling must be tested** during load tests, not discovered during a real sale.
- **Scale-down grace:** Never scale down faster than in-flight requests drain; use grace periods and drain signals.

**Elastic scaling triggers (event-driven model):**

| Workload | Scale Up | Scale Down |
|----------|----------|------------|
| Edge compute | Concurrency > 70% capacity | Concurrency < 30% sustained |
| Workers | Queue depth > N, or age > Ns | Queue empty + no work |
| Read replicas | Read QPS > 70% capacity | Read QPS < 30% sustained |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Elasticity designed after a failure | The sale is over | Design elasticity before the event |
| Cold cache at spike start | Cache miss stampede | Pre-warm before launch |
| Scale-down too aggressive | Thrashed instances, dropped work | Drain + grace periods |
| Untested autoscaling | Surprise during the real spike | Load-test autoscaling paths |
| Hard-coded instance counts | Wasted money or short capacity | Autoscaling by metrics |

### 2.7 Capacity Planning

**What:** The practice of forecasting resource needs from growth data and business calendar, and provisioning (or auto-scaling) accordingly — so capacity exists exactly when needed, without waste.

**Why:**
- **Availability:** Running out of capacity during a sale is a revenue and trust disaster.
- **Cost control:** Over-provisioned idle capacity is wasted spend.
- **Trust:** Enterprise buyers expect the platform to hold up under load.

**Where:** Quarterly planning cycle, pre-event (sale/launch) checklists, and the capacity monitoring dashboard (Section 10.8).

**Best practices:**
- **Model growth:** Track DAU/MAU, orders/day, peak QPS, DB size growth, media growth; project forward.
- **Build a scaling model:** For each tier (compute, cache, DB, storage, bandwidth), define capacity units, current headroom, and the trigger to add capacity.
- **Calendar-driven planning:** Map every business event (sale, launch, festival, campaign) to a capacity plan + pre-warm task list.
- **Headroom rule:** Sustain < 60% utilization on the critical path at projected peak; keep 40% headroom for spikes and failover.
- **Rehearse:** Run load tests at projected peak + 50% before major events (see Section 13).
- **Record decisions:** Capacity reviews produce a documented plan with owners and dates.

**Capacity planning inputs (track quarterly):**

| Input | Tracked As | Action When... |
|-------|-----------|----------------|
| Active users | DAU/MAU trend | Project peak concurrency |
| Order volume | Orders/day | Project write QPS + inventory ops |
| Read traffic | QPS by endpoint | Plan cache capacity + replicas |
| Data volume | DB size growth | Plan archiving + replica capacity |
| Media volume | Assets stored + delivered | Plan storage tiers + bandwidth |
| Peak factor | Peak-to-average ratio | Size autoscaling bounds |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No capacity model | Scrambling during growth | Documented tier model |
| Planning only from current usage | Under-built for growth | Project with growth rate |
| Ignoring the business calendar | Outage during the big sale | Event-linked capacity plans |
| No headroom reserve | Failover failure | 40% headroom rule |
| Capacity planning without load tests | False confidence | Rehearse before the event |

---

## 3. Caching

### 3.1 Caching Philosophy

**What:** The organizing principle that caching is the primary performance lever in Nabome: serve reads from the nearest/fastest layer, use the database as the source of truth, and invalidate deterministically. A cache miss is a design signal, not a routine event.

**Why:**
- Reads dominate e-commerce traffic (browse → search → detail before buy).
- Every cache hit saves a round trip to origin compute and the database.
- Cache layers are the difference between a 50ms edge response and a 500ms origin response.

**Where:** Browser, CDN, edge cache (KV), API responses, database query results, search results, media, sessions, and configuration.

**Best practices:**
- **Cache everything read-heavy that is cacheable; cache invalidation is the only excuse not to.**
- **Default TTLs and invalidation per data type** (see tables below).
- **Never cache personalized data in shared caches** unless explicitly scoped (private cache only).
- **Cache the response, not the mechanism:** set `Cache-Control` headers on APIs so every layer can cache; don't hand-roll application caching when HTTP caching suffices.
- **Stale-while-revalidate** to absorb origin blips: serve stale from cache while refreshing in the background.
- **Measure hit ratios** on every cache layer and alert on regressions.

**Cache layers and their hit-ratio targets:**

| Layer | Target Hit Ratio | Notes |
|-------|------------------|-------|
| CDN (static assets) | > 95% | Immutable hashed assets, `immutable` |
| CDN (public API/HTML) | > 90% | `s-maxage` + stale-while-revalidate |
| Edge cache (KV) | > 85% | Catalog, settings, search facets |
| TanStack Query (client) | n/a | `staleTime`/`gcTime` tuned (Section 3.4) |
| Browser cache | n/a | Long TTL for hashed assets |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Caching without invalidation plan | Stale data, trust loss | Invalidate on every write |
| Over-caching personalized data | Data leaks between users | `private`/`no-store` correctly |
| No hit-ratio monitoring | Silent cache death | Dashboard + alerts |
| TTLs as a substitute for invalidation | Stale catalog after updates | Write-through invalidation |
| Ignoring `Vary` headers | Wrong cached variant served | `Vary: Accept-Encoding`, etc. |

### 3.2 Browser Cache

**What:** Browser-level caching of static assets and responses via `Cache-Control`/`ETag` so repeat visits don't re-download what hasn't changed.

**Why:**
- Repeat visits are the majority of e-commerce traffic.
- Eliminates redundant network transfer and decode work.
- Fastest cache is the one that requires zero network requests.

**Where:** All static assets (JS, CSS, images, fonts) and public read API responses.

**Best practices:**
- **Hashed, immutable assets:** Vite emits content-hashed filenames; serve with `Cache-Control: public, max-age=31536000, immutable`.
- **Non-hashed static files:** Short `max-age` (e.g., 1h) + `ETag` revalidation.
- **Public API responses:** `private`/`no-store` for personalized; `public, s-maxage=..., stale-while-revalidate=...` for public GETs.
- **Images from the media CDN:** Long cache with revalidation; Cloudinary appends transformation params to cache keys.
- **PWA/SW (future):** Use service worker cache for app shell and navigation, with versioned updates.

**Browser cache policy table:**

| Asset Class | Cache Policy |
|-------------|--------------|
| Hashed JS/CSS (`*.hash.js`, `*.hash.css`) | `public, max-age=31536000, immutable` |
| Un-hashed static (robots, manifest, fonts subset) | `public, max-age=3600` + `ETag` |
| Public API GETs | `public, s-maxage=60..3600, stale-while-revalidate=86400` |
| Personalized API GETs | `private, no-store` (or short `private, max-age=...` for cart) |
| HTML shell (SPA `index.html`) | `no-cache` (revalidate every load) |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Caching `index.html` with `immutable` | Users stuck on old bundle | `no-cache` for the shell |
| No immutable flag on hashed assets | Wasted revalidation | `immutable` for hashed |
| Caching personalized data in browser-shared proxy | Cross-user leakage | `private` on personalized |
| Cache-busting by query strings only | Proxy/CDN misses | Content-hash filenames |

### 3.3 CDN Cache

**What:** Caching responses and static assets at the global CDN edge (current platform: Cloudflare) so users are served from a nearby edge without reaching origin.

**Why:**
- Eliminates cross-continent round trips (TTFB drops from hundreds of ms to tens).
- Absorbs traffic spikes at the edge before they reach origin compute or the database.
- Mobile users on slow networks benefit most from edge proximity.

**Where:** Static assets, public HTML responses, public API responses, redirects, and robots/sitemap.

**Best practices:**
- **Cache at the CDN for anything public and non-personalized.**
- **Use `s-maxage` + `stale-while-revalidate`** for API responses; CDN refreshes in the background after expiry.
- **`Cache-Control` is the contract:** the CDN honors origin headers; set them correctly in handlers.
- **Purge on write:** purge the affected CDN/KV keys after catalog/settings changes (see Section 3.10).
- **Cache key discipline:** include `Accept-Encoding`, locale, and (for public but variant content) `Vary` headers; never let tenant/user context leak into shared cache keys.
- **Serve Brotli** for text responses; the CDN negotiates with the client.

**CDN cache policy (public read endpoints):**

| Endpoint | `s-maxage` | `stale-while-revalidate` |
|----------|-----------|---------------------------|
| Product list / detail | 300s | 3600s |
| Categories / collections | 3600s | 86400s |
| Search results | 60s | 600s |
| Site settings / static content | 600s | 3600s |
| Sitemap / robots | 3600s | 86400s |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Caching personalized responses at the CDN | User A sees user B's cart | `private`/`no-store` |
| No purge on write | Stale catalog after admin edit | Purge on every write |
| Not setting `s-maxage` | CDN never caches | Explicit headers in handlers |
| Ignoring `Vary` | Wrong compression/locale served | Correct `Vary` headers |
| Cache keys including user context | Cache explosion + leaks | Keep public keys clean |

### 3.4 API Cache

**What:** Application-level caching of API responses — at the client (TanStack Query) and at the edge (KV) — to avoid repeated origin computation and database hits.

**Why:**
- Client caching gives instant, offline-capable-feeling navigation (back-button, tab-switch, refocus).
- Edge caching avoids recomputing the same response for every user.
- Together they reduce origin load by an order of magnitude.

**Where:** Client data layer (TanStack Query), edge handlers for public GETs, and cache-helper utilities in `api/_lib/cache/`.

**Best practices:**
- **TanStack Query defaults** (from TECH_STACK.md §7.2): `staleTime: 300s`, `gcTime: 1800s`, `retry: 2`, `refetchOnWindowFocus: false`.
- **Tune per query type:** inventory/price → short `staleTime`; catalog/settings → longer; cart/orders → `staleTime: 0` or refetch on focus.
- **Query keys must be deterministic and complete** (all params that affect the result); invalidate keys on mutations.
- **Optimistic updates** for cart/wishlist mutations with rollback on error.
- **Edge KV caching in handlers:** check KV, fall through to DB, write-through to KV with TTL (via `api/_lib/cache/kv.ts`).
- **Never cache mutations** or anything with side effects.

**Query cache policy table:**

| Query Type | `staleTime` | `gcTime` | Invalidate On |
|------------|-------------|----------|---------------|
| Product list/detail | 300s | 1800s | Product write |
| Categories/collections | 3600s | 3600s | Category write |
| Search results | 60s | 900s | Search-specific |
| Cart/orders | 0s | 1800s | Cart/order mutation |
| Wishlist | 0s | 1800s | Wishlist mutation |
| Site settings | 600s | 3600s | Settings write |
| Inventory (live) | 30s | 600s | Inventory write |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Not invalidating query keys | Stale UI after mutation | Invalidate on mutation success |
| `staleTime: 0` everywhere | No client caching benefit | Per-type tuning |
| Incomplete query keys | Wrong data shown | Keys include all params |
| Caching with `useState` instead of Query | No dedup, no cache | TanStack Query only |
| Ignoring optimistic rollback | Corrupted cart state | Rollback on error |

### 3.5 Query Cache

**What:** Caching the results of expensive database queries (full product lists, facets, aggregations, computed prices) so the database is not recomputing the same answer.

**Why:**
- The database is the scarcest resource; every cache hit preserves DB capacity for writes and personalized queries.
- Complex aggregations (facets, analytics) are expensive and should be computed once, not per request.

**Where:** `api/_lib/cache/strategies.ts`, handlers serving catalog/search/analytics, and scheduled job outputs.

**Best practices:**
- **Cache computed/aggregate results** (search facets, category trees, filter counts) in KV with TTL.
- **Materialized views** (from DATABASE_ARCHITECTURE.md §28) for complex analytics queries, refreshed on schedule.
- **Cache key = exact query parameters** (filters, sort, page); use normalized keys to avoid duplicates.
- **Invalidate on the write that changes the data:** product/category/settings writes purge the affected keys.
- **Cache the object, not the serialized response** where reuse is needed; otherwise cache the final response.
- **Version cache schemas:** include a schema version in keys so cache format changes don't corrupt reads.

**Query cache policy:**

| Query | Cache Layer | TTL | Refresh |
|-------|-------------|-----|---------|
| Product list (page of 20) | KV | 300s | On product write / TTL |
| Facets/category tree | KV | 3600s | On category write |
| Search results | KV | 60s | TTL |
| Analytics aggregates | Materialized view | schedule | Hourly/daily job |
| Price/badge computed fields | KV | 60s | On price change |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Caching without invalidation | Wrong prices displayed | Write-through invalidation |
| Identical queries with different key shapes | Cache waste | Canonical key builders |
| Caching unbounded result sets | Memory bloat | Cache paged, bounded results only |
| No schema version in cache | Format drift corrupts reads | Versioned keys |
| Caching stale analytics | Misleading business decisions | Scheduled refresh + expiry |

### 3.6 Search Cache

**What:** Caching search query results and the search index state so search stays fast under high query volume and type-ahead traffic.

**Why:**
- Search is one of the highest-QPS endpoints in e-commerce and drives a large share of conversions.
- Type-ahead sends a query per keystroke; without caching, every keystroke hits the database.
- Slow search directly kills discovery and revenue.

**Where:** Search handler (`GET /api/products/search`), type-ahead endpoints, and (future) dedicated search engine.

**Best practices:**
- **Cache normalized search queries** (filters + sort + page) in KV with a short TTL (60s default) — search freshness matters more than catalog freshness.
- **Debounce type-ahead on the client** (`useDebounce`) and cache suggestions.
- **Cache the search index state, not just results:** refresh the underlying materialized search view on product writes (daily or event-driven).
- **Facet counts are cacheable** and change slowly; cache with the facets.
- **Invalidate per-catalog writes** that affect what should appear in results (isActive, price, stock).
- **Graceful fallback:** on cache miss, serve from `pg_trgm` search (current platform) or the search engine; never block the user on index freshness.

**Search cache policy:**

| Cache Item | TTL | Invalidation |
|------------|-----|--------------|
| Search results (page) | 60s | Product catalog writes |
| Type-ahead suggestions | 60s | Product catalog writes |
| Facet counts | 300s | Product catalog writes |
| Trending/related searches | 3600s | TTL |
| Search index (materialized) | daily / on batch | Catalog re-index job |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No caching on type-ahead | DB melt during search | Debounce + cache suggestions |
| Long search TTL | Sold-out/stale items shown | Short TTL + write invalidation |
| Caching personalized search | Cross-user leak | Private cache only |
| Search index out of sync | Missing new products | Event-driven index refresh |
| Blocking on index freshness | Slow search UX | Serve what's indexed, refresh async |

### 3.7 Media Cache

**What:** Caching optimized media (images, video) at the delivery CDN with the correct transforms, formats, and revalidation so the same asset is never re-transformed or re-fetched from origin.

**Why:**
- Media dominates page weight (images are the single largest transfer on most e-commerce pages).
- Transformation is CPU-heavy; caching transformed output avoids redoing it.
- Mobile-first means media weight directly decides LCP and data cost.

**Where:** Image/video delivery layer (current platform: Cloudinary CDN), R2-hosted non-image assets, and the media component layer.

**Best practices:**
- **Transform once, serve everywhere:** generate responsive variants (`srcSet`) with `f_auto`/`q_auto`; the CDN caches each variant.
- **Long-lived cache with revalidation** on media URLs; media is immutable in practice (re-upload = new URL).
- **Version media URLs** on re-upload (new asset ID / new public_id) instead of mutating in place.
- **Video:** use adaptive streaming with pre-generated poster images; cache the poster for LCP.
- **R2-hosted files:** prefix CDN delivery, cache with `immutable` for versioned filenames, set `Content-Type`/`Content-Length` correctly.
- **Bandwidth budget:** every media request is measured against the per-page weight budget (Section 1.2).

**Media cache policy:**

| Asset | Cache Policy | Notes |
|-------|--------------|-------|
| Image variants (srcSet) | Long-lived, immutable by URL | Variants cache separately |
| Image original | Never delivered publicly | Only transformed variants |
| Video segments / playlists | Long-lived | Vary by quality/format |
| Video poster | Long-lived | Used for LCP |
| R2 versioned files | `immutable` | Versioned filename |
| R2 unversioned files | Revalidate | Short TTL + ETag |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Serving original images | Massive page weight | Transform at delivery |
| Mutating assets in place | Stale cached variants everywhere | New URL per version |
| No srcSet | Large images on small screens | Responsive variants |
| Video autoplay without poster | LCP disaster | Poster + lazy player |
| Ignoring cache headers on R2 | Wasted re-fetches | Correct headers per type |

### 3.8 Session Cache

**What:** The session and authentication state strategy — sessions are stored server-side (database) with client-side httpOnly cookies referencing them; no session state lives in instance memory or shared cache unless explicitly cached with correct isolation.

**Why:**
- Sessions must survive any instance churn (stateless services, Section 2.3).
- Sessions are highly sensitive; caching them in shared layers risks leakage.
- Fast session validation keeps authentication cheap (< 10ms per request, per SECURITY_ARCHITECTURE.md §12).

**Where:** Auth middleware (`api/_lib/auth/`), session CRUD, and rate-limit counters.

**Best practices:**
- **Cookie-based session identifier** (httpOnly, Secure, SameSite) + server-side session row; access token 15min, refresh 7d (from TECH_STACK.md §4.1).
- **DB is the session source of truth.** If caching session reads, cache only non-sensitive validity metadata with short TTL, keyed per-user, `private` by nature.
- **Session rotation on sensitive operations** (password change, privilege change).
- **Max sessions per user (5)** enforced at login; old sessions invalidated.
- **Rate-limit counters in KV** (from TECH_STACK.md §10.3) — KV is appropriate for counters, not for session payloads.
- **Cache-bust on logout/session kill** immediately; never rely on TTL for security-critical invalidation.

**Session cache policy:**

| Item | Storage | TTL | Invalidation |
|------|---------|-----|--------------|
| Session row | Database | 30d (per retention) | Logout, rotation, expiry |
| Session validity lookup (optional) | KV (per-user key) | 60s | Logout / rotation |
| Rate-limit counters | KV | per-limit window | TTL |
| Access/refresh tokens | httpOnly cookie only | 15m / 7d | Rotation |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Sessions in instance memory | Lost logins on scale/failover | DB-backed sessions |
| Session payloads in shared cache | Data leakage risk | Never cache sensitive payloads |
| Relying on TTL for invalidation | Revoked session still valid | Immediate cache-bust on logout |
| Tokens in localStorage | XSS theft | httpOnly cookies only |
| Sessions never rotated | Long-lived stolen tokens | Rotation on sensitive ops |

### 3.9 Configuration Cache

**What:** Caching configuration and reference data (site settings, feature flags, shipping rules, tax config, coupon rules, RBAC roles) so every request does not hit the database for data that changes rarely.

**Why:**
- Configuration reads are among the highest-frequency DB calls and almost never change.
- Caching config removes a database round trip from nearly every request path.
- Feature flags need fast, near-real-time propagation.

**Where:** Settings/config service, feature flag checks, RBAC role lookups, `api/_lib/config.ts` and related handlers.

**Best practices:**
- **Cache config in KV with TTL (10min default)** and invalidate on settings write (from TECH_STACK.md §7.1).
- **Feature flags:** cached client- and server-side with short TTL; kill switches must propagate within seconds — support immediate cache-bust on flag change.
- **Version config blobs** so a rollback of config is instant (keep previous version keyed by version).
- **RBAC/permission data:** cache role→permission maps; invalidate on role change.
- **Never let config cache staleness block traffic:** if a config key is missing, fall back to defaults (graceful degradation).

**Configuration cache policy:**

| Config Type | Cache | TTL | Invalidation |
|-------------|-------|-----|--------------|
| Site settings | KV | 600s | Settings write |
| Feature flags | KV + client | 60s | Flag change (immediate bust for kill switch) |
| Shipping/tax/coupon rules | KV | 600s | Rules write |
| RBAC role maps | KV | 300s | Role change |
| Localization/currency config | KV | 3600s | Config write |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Config read per request from DB | Wasted DB load | Cache config |
| Kill switch with long TTL | Can't stop a bad feature | Short TTL + immediate bust |
| No fallback when cache misses | Outage on cache failure | Defaults + stale-on-error |
| Config change not versioned | Can't roll back | Versioned blobs |
| Caching config in client permanently | Stale UI settings | Short client TTL + refetch |

### 3.10 Cache Invalidation

**What:** The deterministic system for removing stale cached data the moment the underlying source changes — every write must know exactly which cache entries it invalidates.

**Why:**
- Caching without invalidation is the leading cause of "why is the data wrong?" incidents.
- Deterministic invalidation allows aggressive caching (long TTLs) without staleness risk.
- It is the difference between a cache that is trusted and a cache that must be worked around.

**Where:** Every write path — product/category/settings/order mutations, media re-uploads, feature flag changes, and background job outputs.

**Best practices:**
- **Pattern: write-through invalidation.** The handler that writes the source of truth also triggers cache invalidation (KV delete + CDN purge) before responding, or enqueues it.
- **Single invalidation service/utility** (`api/_lib/cache/strategies.ts`) with a documented mapping: write → affected cache keys.
- **Key namespace discipline:** `{domain}:{entity}:{id}` and `{domain}:{collection}:{query-hash}` so invalidation is enumerable.
- **Versioned cache keys** so a format change invalidates without purging every key.
- **Invalidate collections too:** updating one product must bust list pages it appears on (product detail key + collection/list keys + search keys + facets).
- **Purge CDN + KV on catalog/settings writes**; the CDN purge API (or Cache API) is used from the write path or a purge queue.
- **Scheduled reconciliation** (e.g., nightly) to catch any drift between DB and cache.
- **Never partially invalidate:** an aborted write must not leave the cache reflecting a half-state; commit-then-invalidate.

**Invalidation mapping (canonical example):**

| Write | Keys Invalidated / Purged |
|-------|---------------------------|
| Product update | `products:{id}`, product list pages, product search keys, facets, collection lists containing it |
| Category update | `categories:*`, category page, facet tree |
| Settings update | `settings:*`, config keys, flag caches |
| Order/payment update | `cart:{user}`, `orders:{user}`, order detail |
| Media re-upload | old asset URL variants (new version served) |
| Feature flag change | `flags:*` (immediate) |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No invalidation on write | Stale data silently | Write-through invalidation |
| Invalidating only the detail key | Stale list/search/facets | Invalidate all affected keys |
| Cache-bust with random tokens | Cache useless | Deterministic versioning |
| Invalidate before commit | Window of staleness on failure | Commit-then-invalidate |
| No reconciliation | Drift accumulates | Scheduled cache/DB reconciliation |

---

## 4. Database Scaling

### 4.1 Read Scaling

**What:** Distributing read traffic across additional database capacity (read replicas) so the primary handles only writes and single-row critical reads.

**Why:**
- E-commerce is read-dominated (browse/search/detail are > 90% of queries).
- Replicas offload the primary, keeping write latency stable and protecting against read spikes.
- Read scaling is the first and cheapest database scaling step (DATABASE_ARCHITECTURE.md §28).

**Where:** PostgreSQL tier via managed replication (current platform: Neon), activated at the growth trigger (> 1000 read QPS or primary CPU saturation).

**Best practices:**
- **Route reads to replicas by policy:** analytics, reporting, heavy list queries, and search-support reads go to replicas; reads that must see the latest write (cart, order after create) go to the primary or use read-your-writes handling.
- **Replica lag awareness:** never let a read-your-writes flow hit a lagging replica (short-circuit to primary right after a write, or tolerate bounded staleness).
- **Connection pooling through Hyperdrive** for replicas too; replicas are connected via a separate binding.
- **Autoscale replica count** from read QPS (Section 2.6); scale in/out without downtime.
- **Monitor lag:** alert if replica lag exceeds a threshold (e.g., > 5s) because stale reads then become user-visible.
- **Never write to replicas.**

**Read/write routing table:**

| Read Type | Target | Notes |
|-----------|--------|-------|
| Catalog list/detail/search | Replica or cache | Cache-first |
| Analytics/reporting/BI | Replica | Heavy aggregation off primary |
| Admin dashboard aggregates | Replica | Off-primary |
| Cart/orders/account after mutation | Primary | Read-your-writes |
| Auth/session validation | Primary | Correctness critical |
| Health checks | Replica (read-only) | No load on primary |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Read-your-writes hitting replicas | User sees stale cart/order | Route post-write reads to primary |
| Unmonitored replica lag | Subtle stale-data bugs | Lag alerting |
| Analytics on the primary | Interactive latency spikes | Route to replicas |
| Writes to replicas | Data divergence, broken replication | Enforce read-only replicas |
| Scaling replicas only for reads without capacity model | Over/under-provisioning | QPS-driven autoscale |

### 4.2 Write Scaling

**What:** The strategy for handling increasing write volume (orders, inventory, sessions, audit logs) without degrading the primary database. Writes are the hardest to scale; the design must protect the write path from day one.

**Why:**
- Writes are serialized on the primary; the primary is the ultimate ceiling.
- Sale events concentrate writes (order bursts, inventory decrements), which is exactly when failures are most costly.
- Preventing write-path degradation requires design discipline, not just hardware.

**Where:** Primary database, order/inventory/payment flows, and background write offload.

**Best practices:**
- **Protect the write path by design:** keep transactions short, index all write-filter columns, avoid long-running locks.
- **Write less per request:** defer non-critical writes (audit logs, analytics events, notifications) to background queues (Section 5) — only the authoritative state change happens synchronously.
- **Batch writes:** group audit/analytics/notification writes into batched inserts by workers rather than one insert per event.
- **Avoid write hot spots:** UUID v4 primary keys (from DATABASE_ARCHITECTURE.md) avoid the sequential-insert hotspot of `BIGSERIAL`; per-entity unique keys avoid lock contention.
- **Optimistic concurrency** for inventory/cart updates where acceptable; enforce atomic `UPDATE ... WHERE stock >= n` style decrements (via Prisma transactions) rather than read-modify-write.
- **Write-side caching of derived data:** computed totals, review counts, and stock counts are maintained on write (or via scheduled jobs), never recomputed by readers (which converts writes into read pressure).
- **Archiving offloads writes long-term:** move old orders/audit rows to archive tables (DATABASE_ARCHITECTURE.md §26) to keep the active write set small.

**Write scaling triggers:**

| Metric | Threshold | Action |
|--------|-----------|--------|
| Write QPS | > 100 QPS sustained | Batch/defer writes, archiving review |
| Primary CPU | > 70% sustained | Offload reads to replicas, review indexes |
| Transaction duration | p95 > 200ms | Shorten transactions, review locks |
| Lock wait time | Rising p95 | Review hot rows, optimistic concurrency |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Synchronous non-critical writes | Write path congestion | Queue audit/analytics/notifications |
| Read-modify-write for stock | Overselling, race conditions | Atomic conditional updates |
| Sequential BIGSERIAL hot rows | Index write contention | UUID v4 PKs |
| Long transactions with external calls | Lock pile-up | Keep txn local |
| Recomputing aggregates on read | Write storms | Maintain on write / scheduled jobs |

### 4.3 Index Strategy

**What:** The discipline of matching database indexes to the queries the application actually runs, so that reads stay fast as tables grow. Full index naming rules live in DATABASE_ARCHITECTURE.md; this section defines the operational standard.

**Why:**
- An index that matches the query plan is the difference between O(n) scans and O(log n) lookups.
- Every additional index costs write performance and storage; indexes must be justified.
- Missing indexes are the most common cause of gradual, embarrassing slowdowns.

**Where:** Prisma schema migrations, every new query, and periodic index review.

**Best practices:**
- **Index every column used in `where`, `orderBy`, `groupBy`, and joins** (all FKs are mandatory-indexed per DATABASE_ARCHITECTURE.md §30).
- **Composite indexes in query order:** `(filter1, filter2, sort)` — put equality filters first, then range, then sort column. Add `isActive` to public catalog indexes.
- **Covering indexes for hot reads:** include `select` columns to avoid table fetches for the hottest queries.
- **Partial indexes** for common narrow filters (e.g., `WHERE isActive = true`).
- **`pg_trgm` indexes** for search-support columns (from TECH_STACK.md §3.1).
- **No over-indexing:** each index added is a write-tax; merge overlapping indexes.
- **Review with EXPLAIN:** new queries get `EXPLAIN ANALYZE` in code review; dead indexes are dropped in maintenance windows.

**Index review cadence:**

| Activity | Cadence |
|----------|---------|
| EXPLAIN on new/changed queries | With every change |
| Index usage analysis (`pg_stat_user_indexes`) | Quarterly |
| Drop unused indexes | Quarterly |
| Composite index merge | Quarterly |
| Full query-plan audit | Before every major release |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Indexing every column | Write-tax, storage bloat | Justify each index |
| Single-column indexes where composite is needed | Query ignores them | Composite in query order |
| Missing `isActive` in catalog indexes | Dead rows scanned | Add status filters to indexes |
| Ignoring index usage stats | Dead indexes stay forever | Quarterly usage review |
| Indexes added without EXPLAIN | Indexes that don't help | EXPLAIN-driven indexing |

### 4.4 Partition Readiness

**What:** Designing the schema and query layer so that logical partitioning (sharding by tenant, or time-based partitioning for append-heavy tables) can be introduced without rewriting the application. Partitioning is a last-resort scale lever — readiness is designed now, activation happens only if needed.

**Why:**
- Sharding is complex (cross-shard queries, transactions, joins) and expensive; it must be a deliberate, late decision.
- Time-based partitioning of append-heavy tables (audit logs, order history) is cheap and prevents unbounded table growth.
- The cost of partitioning readiness is tiny now; the cost of retrofitting is enormous.

**Where:** Database schema (current platform: Neon/PostgreSQL), Prisma models, and query patterns.

**Best practices:**
- **Tenant-aware schema (future marketplace):** every tenant-owned table carries a `shopId`/`tenantId` column and is queried with the tenant scope from day one — the future shard key is present before sharding is needed.
- **Time-partitionable tables:** append-heavy, old-dominated tables (audit logs, order status history, sessions, analytics events) are designed to be partitioned by time (e.g., by month) — the write path never updates old rows, so natural partitions apply cleanly.
- **No global stateful sequences:** UUID v4 PKs keep rows movable and shardable (no auto-increment identity to break).
- **Queries always bounded by tenant + time:** no unbounded global scans; every query includes the partition key.
- **Cross-shard assumptions removed:** reports and analytics run against replicas/warehouse, not cross-tenant OLTP queries.
- **Document the shard key decision** (tenant for marketplace, time for event tables) so it is deliberate.

**Partition-readiness checklist (design-time):**

| Check | Standard |
|-------|----------|
| Every tenant-owned table has tenant FK | Mandatory |
| Every tenant query filters by tenant | Mandatory |
| Append-heavy tables have time dimension | Mandatory |
| PKs are UUID (movable) | Mandatory |
| No cross-tenant OLTP queries | Mandatory |
| Analytics over aggregated replica/warehouse | Mandatory |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Adding tenant sharding after the schema is built | Massive migration pain | Tenant FK from day one |
| Auto-increment PKs | Cannot shard | UUID v4 |
| Unbounded global queries | Impossible to partition | Tenant+time bounded queries |
| Cross-tenant joins | Blocked by sharding | Tenant-local queries |
| Partitioning prematurely | Complexity before payoff | Readiness now, activation only when triggered |

### 4.5 Replication Readiness

**What:** Ensuring the schema, connection layer, and application routing are ready for primary-replica replication and automated failover — even before replicas are provisioned.

**Why:**
- Replication readiness is cheap to design (read routing, lag tolerance) and costly to retrofit (application must learn to route reads).
- Managed PostgreSQL (current platform: Neon) provides replication + automatic failover; the application must be built to use it correctly from the start.

**Where:** `api/_lib/database/connection.ts` (Hyperdrive bindings), read/write routing, and application query code.

**Best practices:**
- **Centralized routing:** all database access goes through `api/_lib/database/`; read/write targets are configured there, never scattered in handlers — this is the seam where replica routing is added.
- **Read-your-writes policy implemented at the client layer** (short-circuit to primary after a write, or a per-request "I just wrote" marker).
- **Hyperdrive bindings for each target** (primary, replica) with the correct pool sizes; swap targets via config, not code.
- **Idempotent and retry-safe writes** so failover (which may retry a connection) never duplicates side effects (orders, payments).
- **Replication lag budget** defined and monitored (alert > 5s).
- **Failover rehearsal** documented and tested with the DR plan (Section 9.4).

**Replication readiness checklist:**

| Item | Standard |
|------|----------|
| All DB access through `database/` seam | Mandatory |
| Read/write routing configurable | Mandatory |
| Read-your-writes policy implemented | Mandatory |
| Idempotent writes | Mandatory |
| Lag monitoring + alert | Mandatory |
| Failover tested | Per DR schedule |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Ad-hoc DB access in handlers | Cannot re-route reads later | Central seam only |
| No read-your-writes handling | Post-failover stale reads | Implement policy now |
| Non-idempotent writes | Duplicates after failover retry | Idempotency keys |
| Unmonitored lag | User-visible staleness | Lag alerts |
| Failover never rehearsed | Chaos during real failure | DR rehearsal |

### 4.6 Backup Strategy

**What:** The automated, encrypted, tested backup system for all data — continuous (point-in-time) for the database, periodic snapshots for object storage, and versioned for configuration. (Operational standard; provider specifics live in DATABASE_ARCHITECTURE.md §25.)

**Why:**
- Backups are the foundation of disaster recovery and business continuity (Section 9).
- A backup that is never tested is not a backup.
- Data loss is the only failure that cannot be patched.

**Where:** Database (current platform: Neon point-in-time recovery), object storage (R2/Cloudinary originals), and configuration/feature-flag state.

**Best practices:**
- **Database:** continuous point-in-time recovery (PITR) enabled + daily full snapshots; retention 30 days minimum (DATABASE_ARCHITECTURE.md §25.3).
- **Object storage:** versioning on (immutable/versioned buckets), cross-region replication for originals, periodic inventory snapshots.
- **Configuration:** versioned config/flag state exported on change; restore is a config rollback.
- **Encryption:** all backups encrypted at rest and in transit.
- **Test restores on a schedule:** quarterly restore rehearsal to a scratch database and validate data integrity (row counts, referential integrity, business invariants).
- **Backup monitoring:** backup success/failure alerts; a missed backup is a paging event.
- **Backups are not a substitute for replication** — replication protects against hardware failure; backups protect against logical corruption and human error.

**Backup schedule table:**

| Asset | Cadence | Retention | Test Restore |
|-------|---------|-----------|--------------|
| Database PITR | Continuous | 7–30 days | Quarterly |
| Database snapshots | Daily | 30 days | Quarterly |
| Object storage originals | Versioned + daily snapshot | 30 days+ | Quarterly |
| Media (Cloudinary originals) | Export on schedule | Per retention policy | Quarterly |
| Configuration/feature flags | On change | 30 versions | With rollback test |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Backups never restored/tested | Discovery of corrupt backups at disaster time | Scheduled restore tests |
| No backup failure alerting | Silent backup gaps | Alert on every missed backup |
| Backup storage in same region | Region disaster destroys both | Off-site/region-isolated copies |
| Unencrypted backups | Breach exposes all data | Encrypt everything |
| Replication confused with backup | Logical corruption unrecoverable | Both: replication + backups |

### 4.7 Failover Readiness

**What:** The prepared, tested path to shift database service from a failing primary to a healthy replica with minimal downtime and zero data loss beyond the RPO.

**Why:**
- Database failure is a full-platform outage if not handled.
- Automated failover must be trusted; trust comes from rehearsal.
- E-commerce cannot afford minutes of write outage during peak hours.

**Where:** Managed PostgreSQL failover (current platform: Neon automatic failover), Hyperdrive/connection layer, and application write path.

**Best practices:**
- **Managed automatic failover** with a defined failover policy (RPO = last committed transaction, RTO in minutes) via the managed service.
- **Connection layer resilience:** Hyperdrive reconnects transparently; the application must retry transient failures with backoff and never surface raw connection errors to users.
- **Idempotent writes + idempotency keys** so a retried write after failover does not duplicate (Section 1.5).
- **Application graceful degradation during failover:** reads continue from replicas/cache; the read-mostly storefront keeps serving even if the primary is down briefly.
- **Failover runbook + rehearsal:** documented steps, tested quarterly with the DR plan (Section 9.4); the rehearsal is a scheduled, measured exercise.
- **Post-failover checks:** verify lag, verify read-your-writes, verify monitoring, then declare recovered.
- **Never rely on the application to "choose" a new primary** — the managed layer handles election; the app reconnects.

**Failover readiness checklist:**

| Item | Standard |
|------|----------|
| Automatic failover enabled | Mandatory |
| Connection-layer retry + backoff | Mandatory |
| Idempotent write paths | Mandatory |
| Read-mostly serving during failover | Mandatory |
| Documented runbook | Mandatory |
| Quarterly rehearsal measured | Mandatory |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No automatic failover | Manual, slow recovery | Managed auto-failover |
| Raw connection errors surfaced | Ugly outages, panic | Transparent reconnect + retry |
| Non-idempotent writes retried | Duplicate orders/payments | Idempotency keys |
| Failover never rehearsed | First rehearsal is the real outage | Quarterly rehearsal |
| No post-failover verification | Undetected lag/divergence | Structured post-check |

---

## 5. Background Processing

### 5.1 Queues

**What:** The asynchronous processing backbone: work that does not need to block the user response (emails, notifications, index refreshes, exports, webhook fan-out) is enqueued and processed out-of-band.

**Why:**
- **Response latency:** deferring work keeps p95 API responses in budget (Section 1.5).
- **Resilience:** queued work survives worker restarts and retries.
- **Burst absorption:** queues smooth traffic spikes by decoupling producers from consumers.

**Where:** Every non-critical, non-instant write path: email send, notifications, analytics events, cache warming, index refresh, exports, re-encodes, webhook processing.

**Best practices:**
- **Enqueue by default:** if a step is not needed to produce the user's response, it is enqueued.
- **Payload discipline:** queue the minimal data (IDs + context); consumers read the source of truth, never embed large payloads.
- **Idempotent consumers:** every queue message is processed at-least-once; consumers must be idempotent (dedupe by event/message ID).
- **Dead-letter queues (DLQ):** failed messages go to a DLQ with a retention window, inspected, replayed or discarded deliberately — never silently dropped.
- **Bounded queues:** capacity caps and concurrency limits prevent unbounded backlog.
- **Message visibility/lease:** a consumer crash does not lose the message; it becomes visible again after the lease.

**Queue design standards:**

| Aspect | Standard |
|--------|----------|
| Message content | Event ID + entity IDs + context only |
| Delivery guarantee | At-least-once |
| Consumer idempotency | Mandatory (dedupe key) |
| Failure handling | Retry with backoff → DLQ |
| Queue capacity | Bounded with alert on depth |
| Priority | Per-class queues (Section 5.7) |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Processing everything synchronously | Slow APIs | Enqueue by default |
| Large payloads in messages | Queue bloat, slow consumers | IDs + context only |
| Non-idempotent consumers | Duplicate emails/orders | Dedupe by message ID |
| No DLQ | Silent work loss | DLQ + review process |
| No queue depth alerting | Unbounded backlog | Alert on depth/age |

### 5.2 Workers

**What:** The consumer processes that execute queued work. Workers are stateless, horizontally scalable, and independently auto-scaled by queue load.

**Why:**
- Workers isolate heavy work from the interactive edge path.
- Stateless + scalable workers make background throughput elastic (Section 2.6).
- Separation of worker classes prevents one workload from starving another.

**Where:** All queue consumers, and the scheduled-job executor (Section 5.4).

**Best practices:**
- **Stateless workers:** no local state, no local filesystem; everything durable lives in DB/object storage.
- **Class-separated workers:** interactive-priority, batch, and scheduled classes run with isolated concurrency (see Section 5.7).
- **Concurrency limits per worker class** prevent a runaway job from exhausting shared resources.
- **Worker health and visibility:** workers log progress with IDs; long jobs emit heartbeat/progress so they can be monitored (Section 10).
- **Auto-scaling by queue depth:** concurrency scales with backlog, not fixed size.
- **Graceful shutdown:** workers drain in-flight work before stopping during deploys/scaling.
- **Per-message timeout + retry** so one poisoned message cannot hold a worker forever.

**Worker class matrix:**

| Class | Examples | Concurrency | Priority |
|-------|----------|-------------|----------|
| Interactive (critical) | Payment verification follow-up, order confirmation email | High | Highest |
| Standard | Notifications, cache warming, index refresh | Medium | Medium |
| Batch | Exports, report generation, re-encodes | Capped | Low |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| One worker pool for everything | Batch jobs delay interactive email | Class-separated workers |
| No concurrency caps | Resource exhaustion | Per-class limits |
| Local state in workers | Inconsistent results at scale | Stateless workers |
| No progress/heartbeat | Blind long jobs | Structured progress logs |
| No drain on shutdown | Dropped in-flight work | Graceful drain |

### 5.3 Batch Jobs

**What:** Long-running, high-volume processing that operates over many records at once — data exports, report generation, re-indexing, media re-encoding, data migrations, cleanup, and archiving.

**Why:**
- Batch work is CPU/IO heavy and must never run inside requests or interactive queues.
- Batches are the natural home for cross-cutting maintenance (retention, archiving, cache reconciliation).
- Predictable scheduling keeps batch load off peak traffic.

**Where:** Exports (admin), BI/reporting, media processing, retention/archiving (DATABASE_ARCHITECTURE.md §26), cache reconciliation, and schema migrations at scale.

**Best practices:**
- **Chunked processing:** process in bounded batches (e.g., 1,000 rows) with progress tracking and resumability; never load everything at once.
- **Checkpoint/resume:** a batch job writes progress so a restart continues from the last checkpoint, not from zero.
- **Idempotent batch operations:** re-running a batch must be safe (upserts, `ON CONFLICT`, processed-marker).
- **Scheduled off-peak:** heavy batches run in low-traffic windows unless event-triggered (see Section 5.4).
- **Resource caps:** batch workers have explicit memory/time/concurrency limits; a runaway batch cannot consume the platform.
- **Observable output:** batches emit per-chunk progress and a final summary (processed, failed, elapsed).
- **Manual triggers:** admin can trigger/restart a batch (via the platform admin console) with clear state (queued/running/failed/done).

**Batch job standard:**

| Aspect | Standard |
|--------|----------|
| Chunk size | Bounded (configurable) |
| Progress | Persisted checkpoint |
| Re-run safety | Idempotent |
| Failure | Retry chunk → DLQ / abort-with-summary |
| Schedule | Off-peak by default |
| Monitoring | Progress + completion alert |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Loading all records into memory | OOM, worker crash | Chunked processing |
| No checkpoint | Restart = start over | Persisted progress |
| Non-idempotent batches | Duplicate exports/charges | Idempotent operations |
| Running batches during peak | User-facing latency | Off-peak scheduling |
| No failure summary | Blind partial success | Structured summaries |

### 5.4 Scheduled Jobs

**What:** Time/cron-triggered background jobs that run on a schedule — cleanup, retention, index refresh, cache reconciliation, analytics rollups, backup verification, and health probes.

**Why:**
- Housekeeping keeps the platform fast and lean over time (retention/archiving, cache drift, orphan cleanup).
- Scheduled pre-computation keeps interactive queries fast (rollups, index refresh).
- Periodic verification (backup restores, cert checks) catches silent failures.

**Where:** Scheduled executor (edge-scheduler/cron binding or worker scheduler), operating on a cron-like cadence.

**Best practices:**
- **One declarative schedule registry** (job name, cron expression, handler, timeout, concurrency guard) so schedules are auditable and reviewable.
- **Overlap guard (singleton):** a scheduled job that is still running must not be started again (lock in KV with lease); the platform must never run two instances of the same job.
- **Off-peak defaults:** destructive/heavy jobs (retention, archiving) run in low-traffic windows.
- **Idempotent + resumable** like all batch jobs.
- **Monitoring:** every scheduled job emits success/failure and duration; missed schedules and failures alert (Section 10).
- **Timezone discipline:** India-first (IST) business windows are the default for maintenance; express schedules in a documented timezone.

**Scheduled job registry (draft):**

| Job | Cadence | Owner |
|-----|---------|-------|
| Session/cart cleanup (retention) | Daily off-peak | Platform |
| Order archiving (7-year retention) | Monthly | Finance |
| Search index refresh | Daily + event-driven | Search |
| Cache/DB reconciliation | Daily | Platform |
| Analytics rollups | Hourly + daily | BI |
| Backup restore test | Quarterly | Platform |
| Orphan media cleanup | Weekly | Media |
| Performance trend report | Weekly | Platform |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No overlap guard | Two jobs corrupt each other | KV lease lock |
| Jobs running during peak | Latency/cost spikes | Off-peak scheduling |
| Unmonitored jobs | Silent failures | Success/failure alerting |
| Timezone ambiguity | Jobs at wrong times | Documented timezone |
| No schedule registry | Unauditable cron sprawl | Declarative registry |

### 5.5 Retry Strategy

**What:** The governed policy for retrying failed operations — how many times, with what backoff, and when to give up and escalate.

**Why:**
- Retries absorb transient failures (network blips, replicas lagging, upstream 503s) without user impact.
- Unbounded or instant retries amplify outages (retry storms) and duplicate side effects.
- A clear retry ladder is the difference between resilient and fragile background processing.

**Where:** Queue consumers, API client retries (TanStack Query `retry: 2`), webhook processing, and external integrations.

**Best practices:**
- **Exponential backoff with jitter:** e.g., `delay = base * 2^attempt + jitter`, capped at a max delay (e.g., 60s → 5min cap).
- **Retry only transient failures:** idempotency/validation errors are not retried (they will never succeed); 4xx is not retried, 5xx and network errors are.
- **Attempt budget:** default 3–5 attempts, then the message goes to the DLQ (Section 5.1) for human review — never infinite retries.
- **Idempotency everywhere:** because delivery is at-least-once, consumers must dedupe (Section 5.1).
- **Dead-letter handling:** DLQ is reviewed on a cadence; replay after root cause fixed, discard deliberately for poison messages.
- **External API retry:** payment/email/notification providers get retry with backoff and jitter; webhooks acknowledge fast and process via queue.
- **Client-side:** TanStack Query `retry: 2` with backoff; API client retries safe idempotent requests only.

**Retry ladder (standard):**

| Class | Attempts | Backoff | After Exhaustion |
|-------|----------|---------|------------------|
| Queue consumer | 3–5 | 1s→60s exp + jitter | DLQ |
| Webhook processing | 3–5 | 1s→60s exp | DLQ + alert |
| External provider call | 3 | 100ms→2s exp | Surface/queue error |
| Client API call | 2 (TanStack) | built-in | Error state to user |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Instant fixed-interval retries | Retry storms on outage | Exp backoff + jitter |
| Retrying 4xx errors | Wasted work forever | Retry only transient |
| Infinite retries | Poison messages loop forever | Attempt budget + DLQ |
| No idempotency with retries | Duplicate side effects | Dedupe keys |
| DLQ never reviewed | Silent losses accumulate | Scheduled DLQ review |

### 5.6 Failure Recovery

**What:** The end-to-end behavior when background processing fails — jobs retry, degrade, or escalate predictably, and in-flight work is never silently lost or duplicated.

**Why:**
- Background work is invisible to users until it fails (missed order emails, failed exports).
- Recovery must be automatic where safe, human-reviewed where risky.
- The platform's reliability is judged by how failures are handled, not whether they occur.

**Where:** Queue infrastructure, workers, scheduled jobs, and their monitoring (Section 10).

**Best practices:**
- **At-least-once + idempotent processing** is the invariant; all consumers are safe to re-run.
- **Visibility/lease model:** a crashed consumer returns its message to the queue after the lease; no message is lost on crash.
- **Graceful degradation:** if a downstream system (email, payment, media) is down, queue the work and continue; the user-facing flow succeeds and the notification is sent when the system recovers.
- **Poison-message isolation:** a message that repeatedly fails moves to the DLQ instead of blocking the queue.
- **Recovery runbook per class:** document what "recovered" means for each job class (replayed DLQ, re-triggered batch, re-indexed).
- **Post-incident:** failed batches re-run from checkpoint; partial successes are reported, not assumed complete.

**Failure recovery matrix:**

| Failure | Behavior | Recovery |
|---------|----------|----------|
| Consumer crash mid-message | Message re-visible after lease | Re-process (idempotent) |
| Downstream provider down | Retry with backoff | Queue holds, send on recovery |
| Poison message | Retries exhausted | DLQ + alert, human review |
| Batch job crash | Checkpoint persisted | Resume from checkpoint |
| Scheduled job miss | Alert + overlap-guard cleared | Manual or next-schedule run |
| Duplicate delivery | Consumer dedupes | No-op on duplicate key |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Assuming exactly-once delivery | Duplicate side effects | Idempotent consumers |
| Losing messages on crash | Silent data loss | Lease/visibility model |
| Blocking user flow on downstream outage | Failed checkouts | Queue + continue |
| No DLQ review process | Poison messages linger | Scheduled DLQ review |
| No partial-success reporting | False "job done" | Chunk summaries |

### 5.7 Priority Processing

**What:** The class-based priority system that guarantees critical work (order confirmation, payment follow-up) is processed before and without starvation by lower-priority work (exports, re-encodes).

**Why:**
- Customer-facing timeliness matters: order confirmations and payment verifications are trust-critical.
- A flood of batch work must never delay interactive messaging.
- Priority is achieved by queue separation and concurrency policy, not by sorting one queue (sorting a FIFO doesn't protect against a backlog).

**Where:** Queue configuration, worker classes, and scheduling.

**Best practices:**
- **Separate queues per priority class** (Interactive / Standard / Batch) with independent workers and concurrency (Section 5.2).
- **Interactive class gets dedicated capacity** so it is never shared with batch load.
- **SLA per class:** define and monitor age targets — interactive messages process within seconds; batch jobs within their schedule window.
- **Preemption by capacity, not interruption:** batch workers yield capacity when interactive queues rise (concurrency is reserved, not borrowed mid-job).
- **SLA alerting per class:** age > threshold alerts per class (Section 10.6).

**Priority SLA table:**

| Class | Target Age (p95) | Concurrency | Examples |
|-------|-------------------|-------------|----------|
| Interactive | < 15s | Highest, reserved | Order confirmation, payment follow-up |
| Standard | < 5min | Medium | Notifications, index refresh |
| Batch | Within schedule | Capped, off-peak | Exports, re-encodes, archiving |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| One queue with "priority field" | Backlog still starves critical work | Separate queues per class |
| Shared worker pool | Batch flood delays emails | Dedicated interactive capacity |
| No per-class SLA alerting | Critical delays unnoticed | Age-based alerts |
| Batch work allowed to consume all capacity | Interactive degradation | Reserved concurrency |

---

## 6. Media Delivery

### 6.1 Image Optimization

**What:** The standard for delivering every image optimally — right format, right size, right quality, right compression — at the delivery CDN (current platform: Cloudinary).

**Why:**
- Images are the dominant component of page weight; optimization is the biggest single performance lever.
- Optimized images directly improve LCP and data cost on mobile.
- Modern formats (AVIF/WebP) deliver equal quality at a fraction of the bytes.

**Where:** All product, category, homepage, CMS, avatar, and admin media images.

**Best practices:**
- **Auto format/quality:** `f_auto` (AVIF/WebP) + `q_auto` (per-content quality) on every media URL.
- **Responsive srcSet:** multiple widths per image (e.g., 320/480/640/960/1280) with `sizes` attribute; the browser downloads the right variant.
- **Explicit dimensions:** width/height or `aspect-ratio` reserved to prevent CLS (Section 1.3).
- **LCP image:** `fetchpriority="high"`, never lazy-loaded, preloaded.
- **Compression targets:** images delivered at target weights (hero < 150KB; card images < 50KB; thumbnails < 15KB).
- **WebP/AVIF for photos, SVG for logos/icons**, PNG only for transparency-critical graphics.
- **Source discipline:** upload max 4000×4000, max 10MB (from TECH_STACK.md §5.1); the delivery layer optimizes from there.

**Image weight budget:**

| Usage | Target Weight |
|-------|---------------|
| Hero / LCP | < 150KB |
| Product card image | < 50KB |
| Thumbnail | < 15KB |
| Category tile | < 60KB |
| Banner | < 120KB |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Missing `f_auto`/`q_auto` | JPEG-only, oversized | Enforce on every URL |
| One size for all screens | Huge images on mobile | srcSet + sizes |
| No dimensions on images | CLS spikes | Reserve space |
| Lazy-loading the LCP image | LCP explosion | Never lazy-load LCP |
| Uploading originals unoptimized | Delivery layer fix-up cost | Cap upload size + pre-process |

### 6.2 Video Delivery

**What:** The standard for delivering video efficiently — transcoded, adaptive, poster-backed, and lazy-loaded (current platform: Cloudinary for video).

**Why:**
- Video is the heaviest media type; badly delivered video destroys page performance and data budgets.
- Adaptive streaming matches quality to connection, critical on mobile networks.
- Most users never play the video; loading it eagerly wastes the entire weight.

**Where:** Product videos, homepage video, campaign video, admin media.

**Best practices:**
- **Transcode + adaptive streaming:** multiple qualities/resolutions served via adaptive streaming (HLS) so playback adapts to the connection.
- **Poster images always:** a compressed poster is the LCP/visual placeholder; the player loads only on interaction.
- **Lazy load players:** load the player bundle and stream only when the user taps play (or when visible + likely to play).
- **Mobile bandwidth awareness:** cap default quality on mobile; offer quality selection.
- **Preload strategy:** `preload="none"`/`metadata` for most videos; only the poster is eager.
- **Autoplay only muted + small (never)** for e-commerce; respect data costs.

**Video delivery standard:**

| Aspect | Standard |
|--------|----------|
| Streaming | Adaptive (HLS) |
| Poster | Compressed, preloaded, used for LCP |
| Player load | Lazy (on interaction) |
| Quality | Auto by connection |
| File size (source) | Capped; transcoded to variants |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Eager video loading | Huge page weight, slow LCP | Lazy load + poster |
| Single-quality MP4 | Wasted bandwidth on mobile | Adaptive streaming |
| No poster | Blank/CLS before play | Poster image |
| Autoplay without consent control | Data-cost anger | Tap-to-play |
| Uploading raw 4K unprocessed | Delivery and storage bloat | Transcode pipeline |

### 6.3 CDN Readiness

**What:** Ensuring all media and static assets are served from the global CDN edge with correct cache policies, and that the platform can move media delivery to any CDN-capable provider without application changes.

**Why:**
- Edge delivery is what makes the platform fast globally (Section 3.3).
- Media is the highest-bandwidth payload; it must be served from the edge, never origin.
- Vendor-neutral delivery standards protect against lock-in and allow cost/performance optimization.

**Where:** All image/video/document URLs, static assets, and R2-backed files.

**Best practices:**
- **One delivery abstraction:** media URLs are built by a single helper (transform + CDN prefix), so provider/domain changes are config, not code.
- **Correct cache headers** per asset class (Section 3.7): immutable for versioned, revalidate for unversioned.
- **Edge-cacheable by nature:** media URLs are cache-friendly (public, deterministic, no user context).
- **Signed URLs for private assets** (e.g., order invoices, exports) with short TTLs; public assets are unsigned.
- **Graceful degradation:** if the media CDN is down, images degrade to a low-fi placeholder (alt text, dominant-color background) — never blank layout.
- **Performance budget enforcement:** media weight is measured per page (Section 1.2).

**CDN readiness checklist:**

| Item | Standard |
|------|----------|
| Single delivery abstraction | Mandatory |
| Correct cache headers per class | Mandatory |
| Private assets signed with TTL | Mandatory |
| Media-offline degradation | Mandatory |
| Weight budgets enforced | Mandatory |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Hard-coded media provider URLs | Lock-in, migration pain | Delivery abstraction |
| Serving media from origin | Global latency, cost | CDN-only media URLs |
| Unsigned private assets | Data exposure | Signed short-TTL URLs |
| No offline placeholder | Blank pages on CDN failure | Degradation placeholders |
| Media URLs with user context | Cache explosion | Clean, public keys |

### 6.4 Compression

**What:** The standard for minimizing bytes on the wire — format-level compression for media and text-level compression (Brotli/gzip) for all responses and static assets.

**Why:**
- Compression is the cheapest performance win: it reduces transfer time, bandwidth cost, and mobile data use with no quality loss.
- Media format choice (AVIF/WebP) is the dominant form of "compression" for images.

**Where:** CDN delivery, all API responses, all static assets, and media transforms.

**Best practices:**
- **Text responses:** Brotli (fallback gzip) for HTML, JS, CSS, JSON, SVG — enabled at the CDN (current default).
- **Media:** format-level compression via `f_auto`/`q_auto` (AVIF/WebP); never gzip images.
- **Minification:** Vite minifies JS/CSS; HTML minified at build; remove unused code (tree-shaking).
- **Fonts:** subset + WOFF2 (brotli-compressed) — the largest font reduction.
- **`Accept-Encoding` negotiation** handled by the CDN; `Vary: Accept-Encoding` respected in cache keys.
- **Verify compression** in CI and in real traffic (Sentry/PostHog transfer-size signals).

**Compression policy:**

| Content | Method | Notes |
|---------|--------|-------|
| HTML/JS/CSS/JSON/SVG | Brotli (gzip fallback) | CDN-level |
| Images | AVIF → WebP → JPEG | Format-level |
| Video | H.264/HEVC + adaptive | Codec-level |
| Fonts | WOFF2 | Subset first |
| Binary (PDF, exports) | None (format-native) | Already compressed |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Gzipping images | Wasted CPU, no gain | Format-level only |
| No Brotli | ~20% larger text payloads | Enable Brotli |
| Uncompressed fonts | Major weight | WOFF2 + subset |
| Forgetting `Vary: Accept-Encoding` | Wrong cached variant | Correct Vary |
| Not verifying compression | Silent regression | CI + traffic checks |

### 6.5 Lazy Loading

**What:** Deferring non-critical resource loading (below-the-fold images, videos, heavy route components, embeds) until needed, so the critical path stays light.

**Why:**
- Only the above-the-fold content matters for initial render and LCP.
- Eagerly loading everything doubles or triples initial page weight.
- Mobile-first: deferring resources is the largest mobile UX improvement.

**Where:** All below-the-fold images, video players, route-level code (React lazy), CMS banners, embeds, and admin-heavy widgets.

**Best practices:**
- **Images:** `loading="lazy"` for below-the-fold, `decoding="async"`, with `srcset`/`sizes`; **never** lazy-load the LCP image.
- **Code splitting:** `React.lazy()` per route and for heavy components (from ARCHITECTURE.md §29.6); preload on hover for likely navigation.
- **IntersectionObserver** for scroll-triggered loading (media, infinite scroll).
- **Video:** `preload="none"`/`metadata` + tap-to-play (Section 6.2).
- **Embeds/widgets:** load after interaction or idle (`requestIdleCallback`).
- **Guarded lazy:** always provide skeleton/placeholder so lazy regions don't cause layout shift (Section 1.3).

**Lazy-loading matrix:**

| Resource | Loading Strategy |
|----------|------------------|
| LCP image | Eager, `fetchpriority=high`, preloaded |
| Above-fold images | Eager, srcset-sized |
| Below-fold images | `loading=lazy` + srcset |
| Videos | `preload=none` + poster, tap-to-play |
| Heavy routes | `React.lazy` + hover preload |
| Embeds/analytics | Idle/after-interaction |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Lazy-loading everything including LCP | Slow LCP | Eager LCP only |
| No placeholder for lazy regions | CLS when they load | Reserved space/skeleton |
| Eager embeds | Third-party weight at start | Defer to idle/interaction |
| Lazy video without poster | Blank area | Poster + lazy player |
| Loading entire app eagerly | Payload bloat | Route code splitting |

### 6.6 Responsive Assets

**What:** Serving the right asset variant for each device and viewport — resolution, size, and format matched to the client, not one-size-fits-all.

**Why:**
- Mobile devices have small screens and often slow, metered connections; serving desktop-size assets wastes bandwidth and slows render.
- Retina displays need higher density; responsive delivery serves the right density only where needed.
- This is core to the "fast mobile networks" and "low-end devices" requirements (Section 14).

**Where:** All images, videos, and the responsive image component layer (`src/shared/` image primitives).

**Best practices:**
- **`srcset` with widths + `sizes`** on every image; the browser picks the right variant for the viewport/density.
- **Density handling:** serve `1x`/`2x` variants based on `device-pixel-ratio`; cap 2x (higher is wasteful).
- **Viewport-matched dimensions:** `sizes` reflect actual rendered width (`min()`/`vw`), so the browser doesn't over-fetch.
- **Preload critical variants** (LCP) so the right size is known early.
- **Video:** connection-aware quality (Section 6.2).
- **Test on real low-end devices** — emulation hides memory/CPU reality.

**Responsive asset standard:**

| Device Class | Image Width | Format | Notes |
|--------------|-------------|--------|-------|
| Small phone (320–480) | 320–640px | AVIF/WebP | Below-fold lazy |
| Phone (480–768) | 480–768px | AVIF/WebP | |
| Tablet (768–1024) | 768–1024px | AVIF/WebP | |
| Desktop (1024+) | 1024–1920px | AVIF/WebP | 2x cap |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No `sizes` attribute | Browser downloads desktop image | Correct `sizes` |
| 4x density images | Wasteful bandwidth | Cap at 2x |
| One image for all screens | Slow mobile render | srcSet per viewport |
| Emulation-only testing | Real-device misses | Real device testing |
| LCP not preloaded | Late hero paint | Preload LCP variant |

---

## 7. Deployment

### 7.1 Environment Strategy

**What:** The environment topology — local, preview, testing, staging, production — with clear purpose, isolation, promotion rules, and parity requirements.

**Why:**
- Isolation prevents environment contamination (test data in prod, prod data in dev).
- Parity (staging mirrors production) is what makes staging validation meaningful.
- Promotion rules make releases predictable and auditable.

**Where:** CI/CD pipeline, environment configuration (Cloudflare Pages projects/environments), and infrastructure configuration.

**Best practices:**
- **Environment set (matches TECH_STACK.md §14 / ARCHITECTURE.md §33):** local (`feature/*`), preview (PR), testing (test runs), staging (`develop`), production (`main`).
- **Isolation:** separate databases, secrets, and domains per environment (Section 11.4).
- **Parity:** staging runs the same build, same schema, same provider configs as production (except data volume and secrets).
- **Promotion rules:** changes flow feature → preview → staging → production; production only from `main` after gates pass.
- **One-click promotion** with a documented, audited path; no hand-edits in production.
- **Environment parity for performance:** load tests run against a staging-scale copy, not production (Section 13).

**Environment matrix:**

| Environment | Branch | Domain | Data | Purpose |
|-------------|--------|--------|------|---------|
| Local | `feature/*` | localhost | Local seed | Development |
| Preview | PR | `*.nabome.pages.dev` | Staging (read-only) | Review |
| Testing | CI | ephemeral | Ephemeral | Automated tests |
| Staging | `develop` | staging.nabome.online | Staging (anonymized) | Validation |
| Production | `main` | nabome.online | Production | Live |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Staging diverging from production | Stage-valid, prod-broken | Parity checks |
| Sharing databases across envs | Cross-env corruption | Isolated DBs |
| Hand-editing production | Unreproducible state | Automation only |
| No preview per PR | Late discovery of issues | PR previews |
| Load-testing production | User-facing degradation | Staging-scale tests |

### 7.2 Development

**What:** The local development experience — fast, isolated, reproducible, and mirroring production behavior.

**Why:**
- Developer velocity depends on a fast local loop.
- Environment differences (dev vs prod) are the root of "works on my machine."
- Local parity prevents surprises at deployment time.

**Where:** `pnpm dev` (Vite dev server), local edge runtime (wrangler), Docker Compose for local Postgres (TECH_STACK.md §14.3).

**Best practices:**
- **One command to start:** `pnpm dev` runs the frontend + functions + local database with seeded data.
- **Local edge runtime:** run Pages Functions locally (wrangler dev) so handler behavior matches production edge behavior.
- **Deterministic seeds:** reproducible seed data (FOLDER_ARCHITECTURE.md §4) for every domain.
- **Env templates:** `.env.example` with placeholders; validate at startup (Zod) so missing vars fail fast.
- **Fast feedback:** unit tests < 100ms, hot reload, typecheck on save.
- **Never use production data locally;** anonymized fixtures only (Section 11.4).

**Development performance standards:**

| Aspect | Standard |
|--------|----------|
| Startup command | `pnpm dev` (single command) |
| HMR | < 300ms |
| Unit test feedback | < 100ms |
| Local parity | Functions + DB + media local |
| Seed determinism | Reproducible |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Prod-only bugs caught late | Expensive fixes | Local edge runtime parity |
| No seed data | Blocked local development | Deterministic seeds |
| Prod data in dev | Compliance/security risk | Anonymized fixtures |
| Missing env vars fail silently | Mysterious runtime bugs | Startup validation |
| Slow local build | Developer productivity loss | Dev-only optimizations |

### 7.3 Testing

**What:** The automated verification environment — unit, integration, and E2E tests running in CI against ephemeral, isolated test infrastructure before any deployment.

**Why:**
- Tests are the gate that keeps regressions (including performance regressions) out of staging/production.
- Ephemeral test infrastructure prevents test pollution and parallel-run conflicts.
- Testing in CI is the only reproducible test environment.

**Where:** GitHub Actions pipeline (`.github/workflows/ci.yml`), Vitest + Playwright, ephemeral databases.

**Best practices:**
- **Pipeline stages (from FOLDER_ARCHITECTURE.md §7):** lint → typecheck → unit → integration → build → E2E → bundle/budget check → deploy.
- **Ephemeral databases:** each test run gets a fresh migrated DB (or Neon branch), torn down after — deterministic tests (ARCHITECTURE.md §32).
- **Performance gates in CI:** bundle-size budget check, Lighthouse CI on preview deployments (Section 1.2).
- **Parallel-safe:** tests never depend on shared mutable state.
- **E2E against preview/staging builds**, not local-only.
- **Coverage gates:** critical paths (auth, payments, checkout) at 100% (TECH_STACK.md §13.1).

**Test environment standard:**

| Aspect | Standard |
|--------|----------|
| Isolation | Ephemeral per run |
| Determinism | No flaky tests |
| Performance gate | Bundle + Lighthouse budgets |
| E2E target | Preview/staging build |
| Coverage gates | Critical paths 100% |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Tests run against shared DB | Flaky, cross-contaminating | Ephemeral DBs |
| No performance gate | Perf regressions ship | Budgets in CI |
| E2E on local only | CI-only failures | E2E on deployable build |
| Slow test suite | Skipped tests | Keep fast, prune flaky |
| Skipping lint/typecheck | Type rot, bugs | Gate all stages |

### 7.4 Staging

**What:** The pre-production environment that mirrors production as closely as possible — the last line of validation before release.

**Why:**
- Staging is where integration, migration, and performance issues surface before real users.
- Staging validation of migrations is mandatory (DATABASE_ARCHITECTURE.md §4.3).
- A well-run staging environment is what makes production deploys boring.

**Where:** `develop` branch → staging project/domain; staging database; staged load-test capacity.

**Best practices:**
- **Production parity:** same build pipeline, same provider configs (sandboxed), same schema.
- **Migrate-first-then-deploy:** run migrations on staging before deploying the new build; validate the migration path here.
- **Feature-flag validation:** release gating is validated in staging (Section 7.8).
- **Performance validation:** run the performance test suite (Section 13) against staging-scale before major releases.
- **Realistic-ish data:** anonymized, representative volume so performance behavior approximates production.
- **Staging is not for load-testing at production scale** — scale tests use dedicated test capacity (Section 13.7).

**Staging gate checklist:**

| Check | Purpose |
|-------|---------|
| Migrations applied + verified | Zero-downtime readiness |
| E2E + critical path tests pass | Functional correctness |
| Performance suite passes | No regressions |
| Feature flags behave | Safe rollout |
| Rollback path rehearsed | Recovery confidence |
| Smoke of third-party integrations | Provider compatibility |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Skipping staging | Production surprises | Mandatory staging gate |
| Staging ≠ production config | False confidence | Parity checklist |
| Migrations only in prod | Prod migration failure | Migrate on staging first |
| No performance validation in staging | Scale regressions | Performance suite |
| Staging treated as dev | Unreviewed changes | Controlled promotions |

### 7.5 Production

**What:** The live environment — the strictest gates, the most rigorous change management, and the strongest monitoring.

**Why:**
- Production serves real users and real money.
- Every production change carries risk; the process must minimize it.
- Production is where reliability is measured (SLA, Section 8.5).

**Where:** `main` branch → production project/domain; production database, secrets, and monitoring.

**Best practices:**
- **Deployment from `main` only**, after all gates (lint, test, E2E, budgets, staging validation) pass.
- **Database migrations first, then code** — expand/contract migration pattern so old code works during deploy (Section 8.6).
- **Release discipline:** release during low-traffic windows by default; big changes get canary/blue-green (Sections 7.7–7.8).
- **Post-deploy verification:** run smoke checks + watch error rates/dashboards for 15–30 minutes after deploy (Section 10).
- **Rollback ready:** every deploy is instantly revertible (Section 7.6).
- **No ad-hoc production changes:** everything is code-reviewed and deployed through the pipeline.
- **Production monitoring:** SLO/SLA dashboards, alerting, and on-call (Section 10).

**Production release checklist:**

| Step | Check |
|------|-------|
| Migrations applied (expanded) | Backward compatible |
| Deploy new build | Rollback ready |
| Smoke checks pass | Health endpoints green |
| Error rate watch (15–30 min) | No regressions |
| Metrics compare vs baseline | No latency/cost regression |
| Rollback decision criteria documented | Known when to revert |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Deploying directly to production without gates | Reckless releases | Pipeline only |
| Code-before-migration order | Broken deploys | Migrate first |
| No post-deploy monitoring | Silent regressions | Watch window + dashboards |
| Ad-hoc hotfixes outside pipeline | Unreproducible prod | Everything via pipeline |
| Big-bang releases | Large blast radius | Canary/blue-green |

### 7.6 Rollback Strategy

**What:** The guaranteed ability to revert any deployment (code, migrations, config) to the previous known-good state within minutes.

**Why:**
- Every release can fail; the difference between a bad deploy and an outage is the rollback path.
- Fast, rehearsed rollback limits blast radius and preserves user trust.
- Rollback readiness must be tested, not assumed.

**Where:** CI/CD pipeline, deployment tooling, feature flags, and database migration process.

**Best practices:**
- **Deployments are reversible by design:** every production deploy can be instantly reverted to the prior version (Cloudflare Pages version rollback — one click).
- **DB migrations are forward-only with reverse-rollback for code:** use expand/contract — expand schema (additive, backward-compatible), deploy code, then contract (remove old) in a later release; never a destructive migration that blocks rollback.
- **Feature-flag kill switches:** release risky features behind flags so the "rollback" for a feature can be a flag flip instead of a code revert (Section 7.8).
- **Rollback decision criteria documented:** pre-defined symptoms that trigger rollback (error rate > X, p95 > Y).
- **Rehearsed:** rollback is part of every release rehearsal and the DR exercises.
- **Config rollback:** config/flag changes are versioned and revertible (Section 3.9).

**Rollback tiers:**

| Tier | Mechanism | Time |
|------|-----------|------|
| Feature rollback | Kill-switch flag flip | Seconds |
| Code rollback | Revert to previous build/version | Minutes |
| Config rollback | Revert config version | Minutes |
| Data rollback | Restore from PITR (last resort) | Per RPO/RTO |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Destructive migrations | Rollback impossible | Expand/contract pattern |
| No flag for risky features | Full revert needed for one feature | Flag-gate releases |
| No rollback criteria | Slow, agonizing decisions | Pre-defined triggers |
| Rollback never rehearsed | Chaotic during incident | Rehearse in DR |
| Code and data rollback conflated | Data loss risk | Distinct tiers |

### 7.7 Blue-Green Readiness

**What:** The deployment model where two identical environments (blue = current, green = new) exist; traffic switches instantly from blue to green, enabling instant rollback by switching back.

**Why:**
- Blue-green gives near-instant rollback (flip back) and near-zero downtime.
- It isolates the new version completely during validation.
- It is the safest model for stateful-facing or critical releases.

**Where:** Production releases that cannot use canary safely (infrastructure-level changes, schema-critical changes), and future containerized workloads.

**Best practices:**
- **Two fully provisioned environments** with identical config; green validated (smoke, health) before switch.
- **Traffic switch via routing/edge** (DNS or edge routing toggle) — instant, atomic, reversible.
- **State considerations:** the database is shared across blue/green — schema changes must be backward-compatible with both versions (expand/contract), or the DB layer must support both.
- **Post-switch:** monitor green; if degraded, flip back to blue instantly.
- **Green becomes new blue** after soak; old blue is retained as the rollback target for a retention window.
- **Cost:** blue-green holds two environments; use it for planned major releases, not every deploy.

**Blue-green readiness checklist:**

| Item | Standard |
|------|----------|
| Dual environment provisioning | Mandatory for major releases |
| Green validation before switch | Mandatory |
| Atomic traffic switch | Mandatory |
| Backward-compatible schema for both versions | Mandatory |
| Post-switch monitoring + flip-back | Mandatory |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Blue-green with destructive migrations | Green breaks blue on flip-back | Expand/contract schema |
| No green validation | Switching to a broken version | Smoke before switch |
| Stateful services assumed in one env | Lost sessions/state | Stateless + external state |
| Blue-green for every deploy | Wasteful dual cost | Reserve for major releases |
| Old blue discarded immediately | Lost rollback target | Retention window |

### 7.8 Canary Readiness

**What:** The deployment model where a new version is released to a small percentage of traffic (e.g., 1–5%), monitored, and gradually rolled to 100% — or instantly killed.

**Why:**
- Canaries catch regressions with minimal blast radius.
- They validate real-user behavior (not just synthetic) before full rollout.
- They are the standard model for feature rollouts and A/B testing (TECH_STACK.md §12.2).

**Where:** Production releases, feature-flag rollouts, and gradual migration of high-risk changes.

**Best practices:**
- **Canary by feature flag** (current platform: PostHog flags / Cloudflare Flagship): the new code path is flag-gated; rollout percentage increases as confidence grows.
- **Traffic-split canary:** where flag-gating is insufficient, route a small % of traffic to the new version and compare metrics (error rate, latency, conversions) against the baseline.
- **Observable comparison:** canary dashboards compare canary vs. stable on errors, p95, and business metrics.
- **Auto-abort criteria:** pre-defined thresholds (e.g., error rate +1%, p95 +20%) trigger automatic rollback of the canary.
- **Progressive rollout ladder:** e.g., 1% → 5% → 25% → 100%, with a soak period at each step.
- **Revert path is a flag flip or traffic re-route** — seconds, not a deploy.

**Canary rollout ladder:**

| Stage | Traffic | Soak | Abort Criteria |
|-------|---------|------|----------------|
| Canary | 1–5% | 15–60 min | Error rate > baseline +1%, p95 +20% |
| Expand | 25% | 1–4 hours | Same |
| Broad | 100% | — | — |
| (Rollback) | 0% | — | Flag flip / re-route |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Canary without metric comparison | Blind rollout | Canary vs baseline dashboards |
| No auto-abort | Canary failure spreads | Auto-abort thresholds |
| Jumping 1% → 100% | No safety net | Progressive ladder |
| Canary changes mixed with other deploys | Can't attribute regressions | Isolate canary changes |
| Feature flag never removed after rollout | Flag debt, complexity | Flag cleanup after full rollout |

---

## 8. High Availability

### 8.1 Redundancy

**What:** No single point of failure — every critical component (compute, cache, database, storage, edge) has redundancy at the instance, availability-zone/region, and vendor level where the platform's SLA requires it.

**Why:**
- Availability is the product of the availability of every component in the path.
- A single non-redundant component (a single cache, a single DB) becomes the platform's ceiling and its biggest outage risk.
- Redundancy is the foundation that health checks, auto-recovery, and failover build on.

**Where:** Compute (edge functions — inherently redundant), cache (KV — replicated), database (replicas + managed failover), storage (replicated object storage), and the CDN edge.

**Best practices:**
- **N+1 redundancy on critical paths:** at least one extra unit of capacity beyond what is required (the "spare").
- **Stateless compute redundancy is automatic** — which is why statelessness (Section 2.3) is mandatory.
- **Database:** primary + replicas with automatic failover (current platform: Neon) — the DB is never single-instance.
- **Cache:** use replicated/global KV, never a single in-memory cache that dies with an instance.
- **Storage:** replicated object storage (R2/Cloudinary) — media and exports survive node loss.
- **Cross-provider redundancy (future, for the highest SLAs):** DNS/edge-level failover between vendors (Section 15.3) so even a vendor-wide event degrades, not dies.
- **Document the redundancy topology** — what is redundant, at what level, and what fails gracefully (Section 9).

**Redundancy matrix:**

| Component | Redundancy Level |
|-----------|------------------|
| Edge compute | Inherent (global, stateless) |
| CDN/cache | Replicated globally |
| Database | Primary + replicas + auto-failover |
| Object storage | Replicated, versioned |
| Configuration/flags | Replicated, versioned |
| DNS/routing | Managed, redundant |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Single-instance components | Hard ceiling + single point of failure | Redundancy review per component |
| In-memory caches | Cache loss on instance death | Replicated KV |
| Single-region storage | Region loss = data loss | Replicated storage |
| Assuming "cloud = redundant" | False assurance | Explicit redundancy mapping |
| Redundant but not tested | False redundancy | Failover rehearsal |

### 8.2 Health Checks

**What:** Lightweight, fast probes that verify a component is actually serving correctly — used by routing, load distribution, auto-recovery, and dashboards.

**Why:**
- Routing to a dead instance is a wasted request and a user-visible failure.
- Health checks are the signal that drives failover and auto-recovery (Sections 8.3–8.4).
- Health checks must verify real serving capability, not just "process is up."

**Where:** `api/health.ts` (FOLDER_ARCHITECTURE.md §3.1), cache/D B/service integration probes, and external uptime checks.

**Best practices:**
- **Liveness vs. readiness:** liveness = process running; readiness = capable of serving (includes critical dependencies). Readiness gates traffic; liveness gates restart.
- **Depth:** a readiness check verifies the critical path — database reachable (replica-safe read), cache reachable, and identity/service config available — without expensive work.
- **Fast:** health endpoints respond in < 50ms with a small payload; they are themselves load-tested and not on the hot path.
- **No side effects:** health checks are read-only; they must not create writes, emails, or analytics events.
- **Externally reachable:** a public or restricted health endpoint (`/api/health`) for external uptime monitoring; plus internal per-component probes.
- **Degraded status:** return `200` healthy / `503` degraded with a structured payload (component → status) so dashboards show what failed.

**Health check contract:**

| Endpoint | Purpose | Returns |
|----------|---------|---------|
| `/api/health/live` | Process liveness | `200` |
| `/api/health/ready` | Serving readiness (DB, cache, config) | `200` or `503` + component statuses |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Health check that never checks the DB | "Healthy" but failing | Readiness depth |
| Health check with side effects | Pollution from probing | Read-only probes |
| Slow health endpoint | Probe timeouts | < 50ms target |
| Health checks hitting the primary write path | Load amplification | Replica-safe reads |
| No external probes | Blind to CDN/DNS failures | External uptime checks |

### 8.3 Auto Recovery

**What:** Automatic detection and remediation of failing components — restart, redeploy, or fail over — without human intervention, for the classes of failure where automation is safe.

**Why:**
- Most infrastructure failures (instance death, process crash, node loss) are recovered in seconds by automation, versus minutes by humans.
- Automation is the difference between "barely noticed" and "incident."
- Auto-recovery must be bounded and governed so it never makes things worse.

**Where:** Edge compute (managed), worker/queue consumers, database failover, and storage replication.

**Best practices:**
- **Managed compute recovery:** the edge platform restarts/re-provisions failed instances (serverless — instances are disposable by design).
- **Worker recovery:** a crashed worker's in-flight message re-queues after lease expiry (Section 5.6) — no human needed.
- **Database auto-failover:** managed failover to a replica on primary loss (Section 4.7).
- **Bounded automation:** auto-recovery acts only on documented failure classes; anything ambiguous escalates to a human (Section 10.5).
- **No recovery loops:** protect against rapid restart churn (backoff, circuit breaker) — a crash-looping component must trip a breaker and page, not restart forever.
- **Post-recovery verification:** auto-recovery verifies the component is actually healthy before re-admitting traffic (Section 8.2).

**Auto-recovery classes:**

| Component | Automated Action | Escalation |
|-----------|------------------|------------|
| Edge instance | Re-provision (managed) | Persistent failure → alert |
| Worker | Re-queue in-flight message | Poison → DLQ + alert |
| Database primary | Auto-failover to replica | Post-check + alert |
| Cache | Rebuild from source of truth | Persistent miss → alert |
| Queue backlog | Autoscale workers | Depth > threshold → alert |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No auto-recovery | Minutes-long manual recovery | Automation by failure class |
| Unbounded restart loops | Churn, worse outage | Circuit breakers |
| Recovery without verification | Re-admitting broken component | Post-recovery health |
| Automating ambiguous failures | Wrong actions | Human escalation path |
| Auto-recovery untested | Fails at the worst time | Chaos/DR rehearsal |

### 8.4 Failover

**What:** The coordinated shift of service from a failed component to its redundant counterpart — database primary→replica, provider→provider (future), edge location→location — with defined RPO/RTO.

**Why:**
- Failover is the operationalization of redundancy: redundancy without a rehearsed failover is decoration.
- Failover keeps the platform serving (reads via replicas, cache) while recovery happens.
- Unrehearsed failover is the classic way a "small" incident becomes a major one.

**Where:** Database tier, object storage access, third-party provider integrations, and (future) multi-region routing.

**Best practices:**
- **Database:** automatic primary→replica failover with documented RPO/RTO (managed service + Section 4.7).
- **Graceful degradation during failover:** the read-mostly storefront keeps serving from cache/replicas; writes queue or retry — users see slowness, not outage (Section 9.1 "failures degrade gracefully").
- **Provider failover (future):** integration-layer abstraction (email, media, search) supports a secondary provider on a documented trigger (Section 15.3).
- **Connection layer reconnects transparently** (Hyperdrive/retry with backoff) — applications never handle raw failover.
- **Rehearsed:** failover is exercised quarterly (Section 9.4) with measured RTO.
- **Post-failover:** verify health, lag, and read-your-writes before declaring recovered (Section 4.7).

**Failover targets:**

| Component | Failover Mechanism | RPO | RTO |
|-----------|--------------------|-----|-----|
| Database primary | Auto-failover to replica | 0 (last commit) | Minutes |
| Edge location | Global routing | 0 | Automatic |
| Cache | Replicated KV | 0 | Automatic |
| Provider (email/media/search, future) | Secondary provider | Minutes | Minutes–hours |
| Storage | Replicated object store | 0 | Automatic |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Failover not rehearsed | First rehearsal = real outage | Quarterly rehearsal |
| No degradation during failover | Full outage instead of slow | Cache/replica serving |
| App handles raw failover | Buggy, brittle | Connection-layer retry |
| No post-failover verification | Latent issues after "recovery" | Post-checks |
| Provider failover unplanned | Vendor outage = platform outage | Provider abstraction |

### 8.5 Service Availability

**What:** The measurable availability commitment — the platform's SLA/SLO with target uptime, and the error budgets that govern releases.

**Why:**
- Availability is a promise; promises need numbers, dashboards, and consequences.
- An SLO turns "be reliable" into "keep error rate below X and p95 below Y."
- Error budgets determine when it is safe to release.

**Where:** Service health dashboards (Section 10.7), release gates, and incident management.

**Best practices:**
- **SLO targets (from TECH_STACK.md §18):** uptime 99.9% (≈ 8.8h/year downtime budget); RPO < 1h; RTO < 4h. Raise to 99.95%+ as the platform matures (multi-region).
- **Define availability the way users experience it:** request success rate (error budget = requests failing above threshold), not just "process is up."
- **Error budget policy:** 99.9% availability ≈ 0.1% error budget per month; releases are throttled when budget is low.
- **Track:** monthly availability, weekly error budget burn, and trailing-28-day SLO compliance.
- **Degraded-service reporting:** when a dependency degrades (not fails), it still counts against the SLO if user requests fail or slow.

**Availability SLO table:**

| SLO | Target | Measured By |
|-----|--------|-------------|
| Platform uptime | 99.9% monthly | Edge request success |
| API request success | > 99.9% | 5xx / total requests |
| API p95 latency | < 300ms | RUM/synthetic |
| Core Web Vitals pass | > 90% of sessions | RUM (Sentry) |
| Backup success | 100% of scheduled | Backup job results |
| Recovery drills | 100% pass | DR rehearsal log |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Uptime measured but not user-facing success | Missed real outages | Request-level error SLO |
| SLOs without dashboards | Unmeasurable promise | Always instrument |
| No error budget | Release regardless of risk | Budget-gated releases |
| Ignoring dependency degradation | Silent SLO burn | Track dependency health |
| Unrealistic SLO (five nines early) | Impossible promises | 99.9% → 99.95% path |

### 8.6 Zero Downtime Readiness

**What:** The discipline that deployments and migrations never require downtime — users are never presented with an unavailable or broken site during a release.

**Why:**
- E-commerce downtime is lost revenue and lost trust; even 30 seconds of failure at peak is expensive.
- Zero-downtime readiness is achieved by deployable design (statelessness, migrate-first, canary), not by luck.
- Every new release must be designed so it could ship without a maintenance window.

**Where:** All deployments, all database migrations, all configuration changes.

**Best practices:**
- **Stateless, immutable, independently deployable** components (Sections 2.3, 7.7).
- **Expand/contract migrations:** (1) expand — additive, backward-compatible schema change; (2) deploy code that uses the new shape; (3) contract — remove old columns/backfill in a later release. Old code works throughout.
- **Migrate-before-deploy** with staging validation (Section 7.4).
- **Canary/blue-green** for release traffic (Sections 7.7–7.8).
- **Rollback-ready** at every step (Section 7.6).
- **No destructive operations in the deploy path:** nothing that breaks the running version during rollout.
- **Long-running migrations** (large backfills, index builds) run as scheduled background jobs (Section 5) with progress, never blocking a deploy.

**Zero-downtime migration pattern:**

```
Release 1: ADD column (nullable) + backfill job   → safe for old+new code
Release 2: Deploy code reading/writing new column
Release 3: DROP old column (after verification)    → safe, old code already gone
```

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Destructive migration in the same deploy as code | Broken running version | Expand/contract |
| Code that breaks with old schema during rollout | Intermittent errors | Backward compatibility |
| Blocking deploy on long migration | Downtime window | Async migration jobs |
| No rollback path in the release | Outage on failure | Rollback-ready |
| Skipping staging migration test | Prod migration failure | Staging gate |

---

## 9. Disaster Recovery

### 9.1 Recovery Strategy

**What:** The end-to-end plan for restoring service after a major failure (region event, provider outage, data loss, cyber incident) — covering people, process, and technology.

**Why:**
- Disasters are rare but total; the plan determines whether the platform survives them.
- A plan that is documented but unrehearsed is a plan that fails.
- Recovery strategy defines what "degraded" and "recovered" mean for every scenario.

**Where:** DR plan document, runbooks, the recovery team (Section 12.6), and rehearsal schedule.

**Best practices:**
- **Failure-graceful design is the primary strategy:** stateless services, cache-first reads, queue-backed writes, and replica reads mean most failures degrade gracefully rather than require full recovery (Section 8.4).
- **Scenario inventory:** map every realistic disaster to its recovery path (table below).
- **Runbooks:** step-by-step recovery procedures per scenario, with owners, times, and verification steps.
- **Rehearsal cadence:** full DR rehearsal quarterly; tabletop review after any major change.
- **Post-recovery: root cause + validation + improved plan** (Section 9.7).
- **Continuity of credentials and access:** recovery operators can access the platform even if SSO/IAM is the thing that failed (out-of-band access, Section 12.6).

**Disaster scenario matrix:**

| Scenario | Impact | Recovery Path | Target RTO |
|----------|--------|---------------|------------|
| Single edge node/location loss | Minor degradation | Global routing | Automatic |
| Provider outage (one vendor) | Degraded / partial | Provider abstraction + cache-first | Minutes–hours |
| Database primary failure | Write outage | Auto-failover to replica | Minutes |
| Data corruption / human error | Data integrity | PITR restore | Per RPO/RTO |
| Region/DC-scale event | Broad outage | Replicas + storage in secondary region | Hours |
| Cyber incident (breach/ransomware) | Availability + integrity | Containment → clean restore | Per incident |
| Total vendor failure | Total outage | Secondary-vendor failover (future) | Hours–days |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No scenario inventory | Rebuilding the plan during the disaster | Mapped scenarios |
| Runbooks unowned/undated | Stale, wrong procedures | Owners + review cadence |
| No rehearsal | First run is the real event | Quarterly rehearsal |
| Recovery operators locked out by the failure | Can't even start | Out-of-band access |
| Confusing degradation with recovery | Declared "fine" while broken | Verification steps |

### 9.2 Backup Recovery

**What:** The tested procedure for restoring data from backups — the safety net for logical corruption, human error, and destructive incidents.

**Why:**
- Backups (Section 4.6) only matter when they restore correctly; the recovery procedure is what makes them valuable.
- Restore accuracy (RPO) determines how much data is lost.
- A restore must be verified, not assumed.

**Where:** Database restore (PITR), object storage restore, configuration restore, and the restore test schedule.

**Best practices:**
- **Restore procedure documented and rehearsed** for each backup type (DB, storage, config).
- **PITR for databases:** restore to a specific point (the incident, or a healthy moment) — the standard is RPO < 1 hour, ideally near-zero for committed transactions.
- **Restore to a scratch environment first:** validate data integrity (counts, referential integrity, business invariants) before considering production restore.
- **Storage restore:** object versioning + replicated copies restore originals; verify inventory after restore.
- **Config restore:** revert configuration/flag versions (Section 3.9) — instant, no data restore needed.
- **Record the restore:** what was restored, from when, what was lost (the RPO gap), and the decision sign-off.
- **Restore tests are part of DR rehearsal** — a quarterly measured restore of the full DB and a media inventory.

**Restore procedure checklist:**

| Step | Action |
|------|--------|
| 1 | Identify the restore point (PITR timestamp) |
| 2 | Restore to scratch environment |
| 3 | Validate integrity (counts, FKs, invariants) |
| 4 | Stand up secondary on restored data |
| 5 | Verify read-your-writes + business flows |
| 6 | Switch traffic / promote |
| 7 | Document RPO gap + sign-off |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Restoring to production first | Amplifies errors | Scratch restore first |
| No PITR (snapshots only) | Loses recent commits | PITR + snapshots |
| Untested restores | Discovery of corruption at disaster time | Quarterly restore tests |
| No RPO-gap documentation | False assumptions about data loss | Record the gap |
| Storage originals not restorable | Media loss | Versioning + replication |

### 9.3 Infrastructure Recovery

**What:** The procedure for rebuilding the platform's infrastructure (compute, routing, config) after a loss — restoring environments from code, not from memory.

**Why:**
- Code-defined infrastructure is the only reproducible recovery — hand-built environments cannot be rebuilt under pressure.
- "Infrastructure as code" makes recovery a re-apply, not a re-invention.
- Recovery speed is determined by how well the platform is codified and documented.

**Where:** Deployment pipeline, environment configuration, wrangler/project configuration, CI workflows.

**Best practices:**
- **Everything as code:** deployments, environment config, feature flags, and routing are all defined in the repository (FOLDER_ARCHITECTURE.md §8); recovery = re-run the pipeline.
- **Reproducible from scratch:** documented steps + pipeline to recreate any environment (local, staging, prod) from the repository + secrets store alone.
- **Versioned configuration:** every environment's config is a versioned artifact; rollback = apply previous version (Section 7.6).
- **Secrets availability for recovery:** secrets live in the platform secrets store (Section 11.3); recovery operators can re-apply them without re-collection.
- **Recovery drill:** a quarterly "rebuild staging from scratch" exercise that proves the pipeline.
- **Order of recovery:** routing/edge → compute → storage → database (data via Section 9.2) → verification.

**Infrastructure recovery steps:**

```
1. Verify credentials/access (out-of-band if needed)
2. Re-run deployment pipeline to target environments
3. Re-apply configuration/flags from versioned artifacts
4. Restore data (DB PITR, storage) per Sections 9.2/9.4/9.5
5. Verify health + smoke checks per Section 8.2
6. Re-point DNS/routing when verified
```

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Hand-built infrastructure | Unrebuildable environments | Infrastructure as code |
| Config only in someone's head | Lost in disaster | Versioned config |
| Secrets unrecoverable | Blocked rebuild | Platform secrets store |
| No from-scratch drill | Surprise mid-disaster | Quarterly rebuild drill |
| Recovering in the wrong order | Waste and rework | Defined order |

### 9.4 Database Recovery

**What:** The specific procedures for database recovery — failover (availability loss) and restore (data loss) — as distinct, rehearsed paths.

**Why:**
- The database is the most critical and most failure-prone component in e-commerce.
- Availability failure and data loss require different procedures; confusing them is a common incident-amplifier.
- Database recovery is where RPO/RTO are actually exercised.

**Where:** Database tier, connection layer, and recovery runbooks.

**Best practices:**
- **Two distinct procedures:**
  - *Failover* (availability): managed auto-failover to replica, RPO 0, RTO minutes (Section 4.7).
  - *Restore* (data integrity): PITR restore to a point, RPO < 1h, RTO per target (Section 9.2).
- **Choose by diagnosis:** a healthy replica + corrupt data ⇒ restore; a dead primary + clean data ⇒ failover. Never mix them.
- **Connection-layer recovery:** re-point Hyperdrive/pool config if targets change; applications reconnect transparently (Section 4.7).
- **Verification after either path:** health, replica lag, read-your-writes, and business-flow smoke (Section 4.7).
- **Rehearsed quarterly:** both failover and restore are measured in DR rehearsal.

**Database recovery decision table:**

| Situation | Procedure | RPO | RTO |
|-----------|-----------|-----|-----|
| Primary unreachable, data intact | Auto-failover to replica | 0 | Minutes |
| Data corrupted / deleted | PITR restore | < 1h (target near-0) | Per target |
| Region lost | Restore from replicated backup/secondary region | Per DR target | Hours |
| Mixed (primary + data issue) | Restore, then failover path | Per target | Per target |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Running restore when failover is the fix | Unnecessary downtime | Diagnosis-first decision table |
| Failover when data is corrupt | Propagates corruption | Restore for data issues |
| Connection config not re-pointed | Apps hit dead endpoint | Config-driven connections |
| No post-recovery verification | Latent issues | Verification checklist |
| Rehearsing one path only | Untested path fails | Both procedures rehearsed |

### 9.5 Storage Recovery

**What:** The procedure for recovering object storage and media — originals, exports, invoices, and generated files — after loss or corruption.

**Why:**
- Storage holds the platform's digital assets and records; loss is permanent if unreplicated.
- Media originals are re-derivable only from source (Cloudinary originals, R2 objects); their loss is unrecoverable.
- Storage recovery validates that the platform's redundancy (Section 8.1) actually works.

**Where:** R2 (non-image files, exports, backups), Cloudinary originals (media), and generated artifacts.

**Best practices:**
- **Versioning enabled** on all object storage buckets (Section 4.6) so accidental deletes/overwrites are recoverable.
- **Replication across regions** for critical originals (RPO 0 for replicated copies).
- **Inventory validation:** scheduled reconciliation compares object listings against the database of record (orphan detection + missing detection, STORAGE_ENGINE_ARCHITECTURE.md §18).
- **Restore drill:** quarterly restore of a media/export sample to verify integrity.
- **Regenerable artifacts:** anything derivable (thumbnails, transcodes, exports) is regenerated from source rather than "restored" — recovery prefers regeneration for derived, restore for originals.
- **Signed-access recovery:** restore operators can access storage via out-of-band credentials (Section 11.3).

**Storage recovery matrix:**

| Asset | Recovery Method |
|-------|-----------------|
| R2 originals (exports, invoices, backups) | Version restore / replicated copy |
| Cloudinary media originals | Download from source / replicated export |
| Derived artifacts (thumbnails, transcodes) | Regenerate from source |
| Generated reports/exports | Re-run generation job |
| Bucket inventory metadata | Reconcile from DB of record |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No versioning | Deletes are permanent | Versioning on |
| Single-region storage | Region loss = asset loss | Cross-region replication |
| No inventory reconciliation | Silent asset loss | Scheduled reconciliation |
| Restoring derived artifacts | Wasteful, may be stale | Regenerate instead |
| Storage credentials lost with infra | Can't recover | Out-of-band access |

### 9.6 Recovery Objectives

**What:** The quantified targets that define acceptable data loss (RPO) and downtime (RTO), plus the classification of data by recovery priority.

**Why:**
- Without numbers, "recover" is unmeasurable and unrehearsable.
- RPO/RTO set expectations, drive architecture (replication vs. backup), and are contractual for enterprise buyers.
- Data is not equally critical; recovery priority orders the restore.

**Where:** DR plan, SLAs (Section 8.5), and every recovery runbook.

**Best practices:**
- **RPO (Recovery Point Objective):** maximum acceptable data loss — current target < 1 hour; near-zero for transactions via PITR + replication.
- **RTO (Recovery Time Objective):** maximum acceptable downtime — current target < 4 hours; minutes for failover-class failures.
- **Data classification by recovery priority:**

| Data Class | Priority | Recovery Method | RPO |
|------------|----------|-----------------|-----|
| Transactions (orders, payments) | Critical | PITR + replication | Near-0 |
| Customer identity/accounts | Critical | PITR | Near-0 |
| Inventory/stock | Critical | PITR | Near-0 |
| Media originals | High | Versioned + replicated | 0 |
| Catalog/config | High | PITR + versioned config | Near-0 |
| Analytics/logs | Medium | Restore from warehouse/archive | Hours–days |

- **Objective review:** RPO/RTO reviewed with each major architecture change and each DR rehearsal measurement.

**Recovery objective table:**

| Metric | Target | Measure |
|--------|--------|---------|
| RPO (transactions) | Near-0 | Replication lag |
| RPO (general) | < 1 hour | PITR granularity |
| RTO (failover class) | Minutes | Failover rehearsal |
| RTO (full restore) | < 4 hours | Restore rehearsal |
| DR drill pass rate | 100% | Rehearsal log |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No quantified RPO/RTO | Unmeasurable recovery | Set numbers |
| Single RPO for all data | Wrong protection for critical data | Data classification |
| RTO targets not rehearsed | Targets are fiction | Measure in drills |
| Objectives unchanged as architecture changes | Stale targets | Review cadence |
| Promising objectives the architecture can't meet | Breach at disaster | Design to objective |

### 9.7 Business Continuity

**What:** The operational continuity plan — how the business keeps functioning during a disaster: communication, decision-making, prioritization, and resumption.

**Why:**
- Technology recovery is worthless if the people and process don't work together.
- Continuity defines who decides what (declaration, escalation, cutover), how users are informed, and what "back to normal" means.
- Enterprise trust depends on predictable, professional response.

**Where:** Incident response plan (SECURITY_ARCHITECTURE.md §9 extends this for security incidents), DR team, and user communication channels.

**Best practices:**
- **Roles and responsibilities:** declared owners for declaring the disaster, leading recovery, communicating, and approving cutover (see Section 12.6).
- **Decision thresholds:** pre-defined triggers for declaring a disaster (e.g., RTO risk exceeded, data loss suspected, provider-wide outage) — decisions are made calmly, not in panic.
- **Communication plan:** internal (recovery team channel, status page) and external (user-facing status page, email/notification) with templates prepared in advance.
- **Prioritization:** restore revenue-critical flows first (browse → search → checkout → payments → account), then back-office (admin, reporting, exports).
- **Status page:** a public status page showing degraded/recovered states during incidents (also used for routine maintenance).
- **Post-incident review:** every disaster drill and real incident produces an after-action review: timeline, root cause, what worked, what didn't, action items with owners (Section 10.7).

**Continuity plan structure:**

```
1. Activation triggers + who declares
2. Roles: Recovery Lead, Comms Lead, Engineers, Approvers
3. Communication channels + templates (internal, status page, users)
4. Recovery priority order (checkout-critical flows first)
5. Cutover decision process + sign-off
6. Post-recovery verification + after-action review
```

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No declared decision-maker | Paralysis during disaster | Pre-declared roles |
| No communication templates | Slow, inconsistent messaging | Prepared templates |
| Restoring non-critical systems first | Revenue-critical path waits | Prioritized order |
| No status page | Users in the dark | Public status page |
| No after-action review | Repeat failures | Mandated post-review |

---

## 10. Observability

### 10.1 Logging

**What:** Structured, centralized, searchable logging of application and infrastructure events (current platform: Pino for structured JSON logs), following the standards in ARCHITECTURE.md §15 and SECURITY_ARCHITECTURE.md §8.

**Why:**
- Logs are the first tool for debugging incidents and understanding behavior.
- Structured JSON logs are machine-searchable and correlate across systems via request IDs.
- Logs are evidence for security incidents and compliance (audit trail).

**Where:** All handlers, workers, jobs, integrations, and edge middleware.

**Best practices:**
- **Structured JSON with consistent schema:** `level, timestamp, message, requestId, service, operation, durationMs, status, userId (when relevant)`.
- **Request correlation:** every request gets a `requestId` propagated to all logs, traces, and audit records — one incident → one ID (ARCHITECTURE.md §15).
- **Level discipline:** `error` = failures; `warn` = degraded; `info` = important business events; `debug` = development (TECH_STACK.md §11.1).
- **Never log secrets/PII:** tokens, passwords, payment data, and full PII are excluded by policy and sanitizers (SECURITY_ARCHITECTURE.md §8).
- **Bounded log volume:** high-frequency debug paths are sampled; every log line is justified (log volume is a cost and a signal-to-noise issue).
- **Central aggregation:** logs flow to a central sink (current platform: Sentry for errors; platform log pipeline for structured logs) searchable by requestId.
- **Audit events** go to the audit store (database `audit_log`) per SECURITY_ARCHITECTURE.md — operational logs and audit logs are separate concerns.

**Log standard:**

| Field | Required | Purpose |
|-------|----------|---------|
| `requestId` | Yes | Correlation |
| `service` | Yes | Source |
| `level` | Yes | Severity |
| `timestamp` | Yes | Timeline |
| `durationMs` | Recommended | Performance |
| `status` | Recommended | Outcome |
| `operation` | Recommended | Action |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Logging secrets/PII | Breach evidence, compliance risk | Sanitizers + policy |
| No requestId | Cannot correlate an incident | Propagate requestId |
| Logs not aggregated | Debugging across instances impossible | Central sink |
| Unbounded log volume | Cost + noise | Sampling + justification |
| Console.log | No structure, no correlation | Pino only |

### 10.2 Metrics

**What:** Time-series measurements of the system — request rates, latencies, error rates, saturation, queue depths, cache hit ratios, and business counts — collected continuously.

**Why:**
- Metrics give the trend-based view that logs cannot (latency over time, capacity trends).
- Metrics drive alerting, capacity planning (Section 2.7), and SLO reporting (Section 8.5).
- Metrics distinguish "healthy" from "degrading" before a threshold is crossed.

**Where:** All handlers, workers, jobs, database access, queue infrastructure, and the edge.

**Best practices:**
- **RED method for services:** Rate (requests/sec), Errors (error rate), Duration (latency percentiles p50/p95/p99).
- **USE method for resources:** Utilization, Saturation, Errors (DB, cache, pool).
- **Standard metric set:**

| Category | Metrics |
|----------|---------|
| Traffic | Requests/sec by route, page views, sessions |
| Latency | p50/p95/p99 by endpoint, TTFB, query time |
| Errors | 4xx/5xx rates, error rate by endpoint, exception rate |
| Saturation | Queue depth/age, pool utilization, cache hit ratio, DB connections |
| Business | Orders/hr, revenue, checkout funnel step rates, search queries |
| Cost/efficiency | Cache hit ratios, bytes served, storage used |

- **Instrument at the boundaries:** every handler, every query, every external call emits a metric with labels (route, status, class).
- **Labels disciplined:** bounded cardinality — never put user IDs or random values in metric labels (cardinality explosion kills the metrics store).
- **Percentiles over averages:** p95/p99 drive the experience; averages hide outliers.

**Metric budget:**

| Signal | Metrics |
|--------|---------|
| API | `http_requests_total{route,method,status}`, `http_request_duration_seconds{p50,p95,p99}` |
| DB | `db_query_duration`, `db_pool_utilization`, `db_replica_lag` |
| Cache | `cache_hit_ratio{layer}`, `cache_evictions`, `cache_invalidation_errors` |
| Queue | `queue_depth{class}`, `queue_age{class}`, `job_duration`, `job_failures` |
| Business | `orders_total`, `checkout_steps_total`, `cart_abandonment` |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Averaging latency only | Hidden outliers | Percentiles |
| High-cardinality labels (user IDs) | Metrics store melts | Bounded labels |
| No saturation metrics | Missed capacity issues | USE method |
| Metrics only in prod | No baseline | Instrument staging too |
| No business metrics | Can't tie perf to revenue | Business counters |

### 10.3 Tracing

**What:** Distributed request tracing that follows a request across every hop — edge handler → query → cache → external call — to find where time actually goes (current platform: Sentry performance / structured spans).

**Why:**
- Latency is a journey across hops; logs and metrics can't show the path.
- Traces answer "why is this request slow?" — the key debugging question.
- Tracing is essential once any request fans out across services/caches/integrations.

**Where:** Every request path, background jobs, and external provider calls.

**Best practices:**
- **Trace the critical paths:** catalog reads, search, cart, checkout, order creation, webhooks, exports.
- **Spans for every boundary:** handler, auth, validation, cache read, DB query, external API, response serialization — each with start/end and status.
- **Propagate the trace/request ID** across all spans (same ID as logs, Section 10.1).
- **Sampling strategy:** sample 100% of errors, sample a representative slice of successful traffic (e.g., 10%), so the store doesn't drown.
- **Trace the background:** jobs and workers are traced too — "slow email" is a background trace.
- **Query attribution:** DB spans include the query/model and query time, linking to the slow-query signal (Section 10.8).

**Tracing standard:**

| Span | Data |
|------|------|
| HTTP request | method, route, status, duration |
| Auth/validation | duration, result |
| Cache | layer, hit/miss, duration |
| Database | model/query, duration, rows |
| External call | provider, operation, duration, status |
| Total | traceId + requestId correlation |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No tracing at all | Blind latency debugging | Instrument critical paths |
| No error sampling | Errors untraced | 100% error sampling |
| Trace IDs not shared with logs | Broken correlation | Shared requestId |
| No DB spans | Can't find slow queries | Query instrumentation |
| Traces without background | Background latency invisible | Trace workers/jobs |

### 10.4 Monitoring

**What:** Continuous collection and automated analysis of logs, metrics, and traces into a unified operational view, with the tools to observe the platform (current platform: Sentry for errors/perf, PostHog for product/UX, platform log/metrics pipeline).

**Why:**
- Monitoring is how the platform "sees itself" — the raw material for dashboards, alerts, and decisions.
- Unified monitoring connects user experience (RUM), application (traces), and infrastructure (metrics).
- Monitoring coverage is what makes reliability (Section 8.5) measurable.

**Where:** Edge, API, database, queue, media, and the browser (RUM).

**Best practices:**
- **Three pillars unified:** logs (what happened), metrics (trends), traces (why) under one operational view, correlated by `requestId`.
- **Real-user monitoring (RUM):** Core Web Vitals + errors from actual sessions (current platform: Sentry + PostHog) — this is the true performance truth (Section 1.3).
- **Synthetic monitoring:** periodic scripted checks from multiple regions for uptime and latency (health endpoints, critical flows) — catches what RUM misses (empty traffic windows).
- **Environment coverage:** monitoring in staging and production; production is always fully instrumented.
- **Alert thresholds defined from observed baselines**, not guesses; revisit after incidents.
- **Avoid blind spots:** monitor external dependencies (payment, email, media) — their latency/failures are your users' experience.

**Monitoring coverage matrix:**

| Layer | Monitored By |
|-------|--------------|
| Browser (CWV, errors) | RUM (Sentry/PostHog) |
| Edge/API (RED) | Metrics + traces + logs |
| Database (latency, pool, lag) | Metrics + query logs |
| Queue/workers | Metrics (depth, age, failures) |
| Media/storage | Metrics (bytes, errors, hit ratio) |
| External providers | Metrics + synthetic probes |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Synthetic-only monitoring | Missed real-user experience | RUM + synthetic |
| No external dependency monitoring | Vendor outage = surprise | Provider probes |
| Staging unmonitored | Perf changes hidden | Instrument staging |
| Alert thresholds from guesses | Alert storm or blind spots | Baseline-derived thresholds |
| Monitoring not correlated | Firefighting without context | Unified requestId view |

### 10.5 Alerting

**What:** Rule-based notification when monitored signals cross thresholds that require attention — designed to be actionable, not noisy.

**Why:**
- Alerts are the mechanism that converts monitoring into response.
- Alert fatigue (too many false alarms) destroys the alerting system's credibility.
- Well-designed alerts page engineers on real problems and stay quiet otherwise.

**Where:** All monitored signals (Section 10.4), routed to the on-call channel (current: Slack + email + SMS escalation ladder).

**Best practices:**
- **Alert on user impact, not raw numbers alone:** error rate SLO burn, p95 breach, queue age exceeding SLA — the user-facing consequence.
- **Severity ladder with response times (aligned with SECURITY_ARCHITECTURE.md §8.6):**

| Severity | Examples | Response |
|----------|----------|----------|
| **Critical** | Full outage, SLO burn, data loss risk | Immediate (page/on-call) |
| **High** | Error rate spike, p95 breach, queue backlog | < 15 min |
| **Medium** | Cache hit ratio drop, replica lag | < 4 hours |
| **Low** | Backup warning, capacity trend | < 24 hours |

- **Every alert has a runbook:** what to check, what to do, when to escalate (DR runbooks, Section 9).
- **No alert without action:** if no one should act, it's a dashboard, not an alert.
- **SLO burn alerts:** alert when error budget burns faster than expected (release-risk signal, Section 8.5).
- **Suppression during maintenance/windows** to avoid false alarms from planned changes.
- **Alert review cadence:** monthly triage of triggered alerts; tune thresholds; remove noisy alerts.

**Alert standard:**

| Rule | Condition | Severity |
|------|-----------|----------|
| API error rate | 5xx rate > 1% for 5 min | High/Critical |
| p95 latency | > 300ms for 10 min | High |
| Queue age | > SLA per class | High |
| Cache hit ratio | Drop > 10 pts | Medium |
| Replica lag | > 5s | Medium |
| Backup failure | Missed/failed backup | Critical |
| DB pool | > 80% sustained | High |
| SLO burn | Budget burn > 2x for the hour | Critical |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Too many alerts | Alert fatigue, ignored pages | Minimal actionable alerts |
| No runbooks | Slow, chaotic response | Attach runbook to each alert |
| Alerting on noise | Wasted attention | Monthly triage |
| No SLO-burn alerts | Discover too late | Burn-rate alerts |
| Thresholds never tuned | Stale, wrong alerts | Review after incidents |

### 10.6 Dashboards

**What:** Purpose-built visual views that answer specific operational questions at a glance — reliability, performance, capacity, business health.

**Why:**
- Dashboards turn raw signals into decisions (release yes/no, capacity needed, incident confirmed).
- Well-designed dashboards reduce time-to-answer in incidents.
- Dashboards are the shared operational language across the team.

**Where:** Operations/observability platform (metrics + traces + logs views), plus RUM/product dashboards.

**Best practices:**
- **Dashboard by audience and question:**

| Dashboard | Audience | Answers |
|-----------|----------|---------|
| **Reliability/SLO** | On-call | Are we meeting SLOs? Error budget remaining |
| **Performance** | Engineers | CWV, API p95, DB p95, queue age |
| **Capacity** | Platform | Utilization trends, headroom, growth (Section 10.8) |
| **Business** | Product/Platform | Orders, revenue, funnel, search — correlated with perf |
| **Security** | Security | Auth failures, anomalies, audit (SECURITY_ARCHITECTURE.md §8) |
| **Release** | Engineers | Deploy vs. error/latency overlay |

- **Consistent chart conventions:** p95 over avg; error rates in red; time-aligned axes; annotations for deploys/incidents.
- **Deploy overlays:** mark releases on latency/error charts — instantly see "did the deploy cause this?"
- **Live + historical:** dashboards support drill-down from alert to live view to incident timeline.
- **Minimum viable set:** no dashboard sprawl; each must earn its place and be reviewed.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| One giant dashboard | Can't answer questions fast | Question-based dashboards |
| No deploy annotations | Can't attribute regressions | Release overlays |
| Averages only | Hides outliers | Percentiles |
| Dashboard sprawl | Nobody maintains | Review + prune |
| Dashboards without alerts | Problems seen too late | Dashboards + alerting |

### 10.7 Service Health

**What:** The consolidated view of platform health — SLO status, component health, and degraded state — plus the incident workflow (detection → response → resolution → review).

**Why:**
- Health must be knowable at a glance: is the platform OK right now?
- A single health view avoids "which dashboard do I check first?"
- Structured incident workflow makes every incident a learning opportunity.

**Where:** Service health dashboard, status page, and incident/response tooling.

**Best practices:**
- **Single health view:** overall SLO status + per-component health (edge, API, DB, cache, queue, media, providers) from health checks (Section 8.2) and RED metrics (Section 10.2).
- **Incident workflow (aligned with SECURITY_ARCHITECTURE.md §9 for security incidents):**
  1. **Detect** (alert/RUM/user report)
  2. **Triage/severity** (impact + priority)
  3. **Respond** (runbook, communication, status page)
  4. **Resolve** (fix, verify, monitor)
  5. **Review** (after-action: timeline, root cause, actions, owners)
- **Status page:** public status page reflects real health during incidents and maintenance (Section 9.7).
- **After-action reviews are mandatory** for every High/Critical incident — producing action items with owners and dates, tracked to closure.
- **Health is user-defined:** the SLO (Section 8.5) is the north star; health = SLO compliance, not "processes running."

**Service health components:**

| Component | Health Signal |
|-----------|---------------|
| Edge/API | Request success + latency SLO |
| Database | Query latency, pool, replica lag, failover status |
| Cache | Hit ratio, error rate, KV health |
| Queue | Depth, age vs. SLA, DLQ size |
| Media/storage | Delivery errors, storage errors |
| Providers | Synthetic probes, integration errors |
| Business flows | Checkout/payment/order success rates |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No single health view | Slow incident assessment | Consolidated dashboard |
| Incidents without review | Repeat failures | Mandated after-action |
| Health defined by processes | False "healthy" | SLO-driven health |
| No status page | Users confused during outage | Public status page |
| Action items never tracked | Improvement lost | Tracked closures |

### 10.8 Capacity Monitoring

**What:** Continuous tracking of resource utilization and growth trends to predict when capacity is needed — the telemetry arm of capacity planning (Section 2.7).

**Why:**
- Capacity problems are gradual; only trends reveal them before the threshold.
- Proactive capacity avoids both outages (too late) and waste (too early).
- Capacity data is the basis of the quarterly planning review (Section 2.7).

**Where:** Utilization and growth metrics, tracked per component with headroom thresholds.

**Best practices:**
- **Track utilization with headroom:** utilization %, growth rate/week, and projected date-to-threshold (extrapolated).
- **Per-component capacity signals:**

| Component | Capacity Signal | Headroom Alert |
|-----------|-----------------|----------------|
| Edge compute | Concurrency, CPU-bound spans | > 70% sustained |
| Cache (KV) | Storage used, eviction rate | > 70% or rising evictions |
| Database | Pool utilization, disk, connections, replica lag | > 80% sustained |
| Storage (R2/media) | Bytes used, growth rate | > 70% |
| Bandwidth | Bytes served, growth | > 70% projected |
| Queue | Peak depth vs. capacity | Within 2x of peak |

- **Growth-rate projection:** record weekly growth and extrapolate; alert on "will exceed capacity in < 30 days."
- **Trend vs. spike:** capacity alerts are trend-based (sustained), not spike-based — spikes are handled by elasticity (Section 2.6).
- **Calendar-aware:** project capacity against the business calendar (sales, launches — Section 2.7).
- **Quarterly review output:** documented capacity report with actions (add capacity, add replica, archive, optimize).

**Capacity alerting examples:**

| Alert | Condition |
|-------|-----------|
| DB disk | > 70% sustained |
| KV storage | > 70% or rising evictions |
| Storage growth | Projected full in < 30 days |
| Pool saturation | > 80% sustained |
| Bandwidth | Projected 2x in < 90 days |
| Queue peak | Within 2x of configured peak |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No capacity tracking | Outage at the worst time | Continuous signals |
| Alerting on spikes | Noise, no foresight | Trend-based alerts |
| Ignoring growth rate | Slow-motion outage | Projection + alerts |
| Capacity only checked quarterly | Missed between reviews | Continuous monitoring |
| No calendar linkage | Sale overloads unplanned | Event-aware planning |

---

## 11. Infrastructure Security

### 11.1 Infrastructure Security

**What:** Security controls for the platform infrastructure itself — the edge, compute, storage, cache, and database — beyond application-level security (SECURITY_ARCHITECTURE.md §7 is the primary source; this section is the operational standard).

**Why:**
- Infrastructure is the foundation; a compromised foundation compromises everything above it.
- Infra misconfigurations are the leading cause of breaches.
- Security must be applied where the platform is built and deployed, not bolted on later.

**Where:** Edge configuration, routing, storage buckets, cache namespaces, database access, and deployment pipeline.

**Best practices:**
- **Edge/WAF protections active by default:** bot protection (Turnstile), rate limiting, and managed WAF rules on public traffic (from TECH_STACK.md §10).
- **Storage access control:** buckets private by default; access via signed URLs or the platform service role; no public bucket listing (STORAGE_ENGINE_ARCHITECTURE.md §19).
- **Cache namespace isolation:** KV namespaces and cache keys are scoped; no cross-tenant cache reads (Section 3.1).
- **Database network control:** the database accepts connections only from authorized pool/edge sources; service credentials not exposed to clients.
- **Dependency/registry security:** pinned, verified dependencies; `pnpm` lockfile; dependency scanning in CI (SECURITY_ARCHITECTURE.md §7.3).
- **Infrastructure as code:** all infra config versioned and reviewed (Section 9.3) — nothing is hand-configured in production.
- **Least-privilege defaults:** every binding, bucket, and namespace is scoped to what the code needs.

**Infrastructure security matrix:**

| Layer | Control |
|-------|---------|
| Edge | WAF, rate limiting, bot protection, HTTPS |
| Compute | Stateless, immutable, least-privilege bindings |
| Storage | Private by default, signed access, no public listing |
| Cache | Scoped namespaces, no cross-tenant keys |
| Database | Network-restricted, scoped credentials |
| Pipeline | Secrets in platform store, dependency scanning, IAC review |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Public buckets | Data exposure | Private by default |
| WAF/rate limiting disabled | Unfiltered attacks | Default-on protections |
| Hand-configured infra | Unreviewed, divergent config | Infrastructure as code |
| Over-privileged service roles | Blast radius | Least privilege |
| Unscanned dependencies | Supply-chain risk | CI scanning |

### 11.2 Network Security

**What:** Protection of the platform's network paths — traffic in transit, access boundaries, and exposure surface.

**Why:**
- All traffic must be encrypted and tamper-evident in transit.
- Reducing exposure surface reduces attack surface.
- Network-level rules (WAF, DDoS, rate limiting) operate before the application even runs.

**Where:** Public ingress, edge routing, database connectivity, and any future service-to-service traffic.

**Best practices:**
- **Encryption everywhere:** HTTPS-only (HSTS preload per SECURITY_ARCHITECTURE.md §7), TLS 1.2+, secure cipher config; no plaintext traffic.
- **DDoS/attack filtering at the edge:** the CDN/WAF absorbs volumetric attacks before origin (default).
- **Rate limiting at the edge** for public endpoints (TECH_STACK.md §10.3), including auth-specific limits.
- **Admin/back-office restrictions:** administrative and internal endpoints restricted by IP/identity policy (SECURITY_ARCHITECTURE.md §7.2), never publicly browsable.
- **Database network boundary:** connections only from authorized pools; no public database access.
- **Future service-to-service:** mutual TLS / service identity for inter-service calls (Section 15.7).
- **Header hygiene:** security headers on all responses (CSP, HSTS, nosniff, X-Frame-Options — ARCHITECTURE.md §30.5).

**Network security standard:**

| Boundary | Control |
|----------|---------|
| Public ingress | HTTPS, WAF, DDoS filtering, rate limits |
| Edge → origin | TLS, no public origin exposure |
| Admin/internal | IP/identity-restricted access |
| Database | Network-restricted, pooled access |
| API responses | Full security headers |
| Future services | mTLS / service identity |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Public origin exposed | WAF bypass | Edge-only origin |
| Admin routes public | Unauthorized access | Identity/IP restriction |
| HTTP allowed | Eavesdropping | HTTPS-only + HSTS |
| Missing security headers | XSS/clickjacking | Header set |
| Database publicly reachable | Credential brute-force | Network restriction |

### 11.3 Secret Management

**What:** The disciplined management of all secrets (API keys, database credentials, signing keys, tokens) — stored in the platform's secrets store, never in code or repositories.

**Why:**
- Secret leakage is the #1 cause of credential-based breaches.
- Secrets in code become permanent exposure (git history never forgets).
- Rotatable, centrally-managed secrets are a security and compliance requirement (SECURITY_ARCHITECTURE.md §7.6).

**Where:** Cloudflare Pages secrets / platform secrets store, CI/CD secrets, local `.env` (never committed), and environment-specific values.

**Best practices:**
- **Secrets only in the platform secrets store** (and CI secrets where needed); never in code, config files, or `.env` in the repo.
- **`.env.example` with placeholders** is the only env template committed (FOLDER_ARCHITECTURE.md §8).
- **Per-environment secrets:** production, staging, and preview have isolated secret sets (Section 11.4).
- **Least privilege:** each environment/component gets only the secrets it needs (scoped service keys, not master keys).
- **Rotation schedule (from SECURITY_ARCHITECTURE.md §7.6):** JWT keys 90d, DB password 90d, API keys 90d, webhook secrets on compromise, encryption keys annually.
- **Rotation procedure:** rotate without downtime (dual keys during transition), update all references, then invalidate the old secret.
- **No secrets in logs/errors:** sanitization at the logging boundary (Section 10.1).
- **Secret scanning:** CI pre-commit hooks + repository scanning detect accidental commits (SECURITY_ARCHITECTURE.md §7.3).

**Secret inventory (reference):**

| Secret | Store | Rotation |
|--------|-------|----------|
| `DATABASE_URL` / `HYPERDRIVE_URL` | Platform secrets | 90d |
| Supabase keys | Platform secrets | 90d |
| Razorpay keys | Platform secrets | 90d |
| Resend key | Platform secrets | 90d |
| Cloudinary keys | Platform secrets | 90d |
| Turnstile secret | Platform secrets | On need |
| CSRF secret | Platform secrets | On need |
| JWT/signing keys | Platform secrets | 90d |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| `.env` committed | Permanent exposure | Gitignored + scanning |
| Hard-coded keys | Immediate breach | Platform secrets only |
| Shared secrets across envs | Blast radius | Per-env isolation |
| No rotation | Stale, exposed keys | Scheduled rotation |
| Secrets in logs/errors | Accidental leak | Log sanitization |

### 11.4 Environment Isolation

**What:** Complete separation of environments (local, preview, staging, production) in data, secrets, and configuration (from SECURITY_ARCHITECTURE.md §7.1).

**Why:**
- Production data must never appear in development.
- Security controls differ per environment; weakest links must not connect to production.
- Cross-environment contamination is a compliance and availability risk.

**Where:** All environments and their databases, secrets, domains, and access levels.

**Best practices:**
- **Separate databases, secrets, domains, and access** per environment (SECURITY_ARCHITECTURE.md §7.1 matrix).
- **Production data never in dev/staging:** anonymized, representative fixtures only.
- **Preview environments use staging (read-only) data**, never production.
- **Separate credentials** per environment so a staging leak cannot touch production.
- **Production access is restricted** (IP/identity policy) and audited.
- **The pipeline enforces isolation:** staging can never accidentally target the production project/DB, and vice versa.

**Environment isolation matrix:**

| Environment | Data | Secrets | Access |
|-------------|------|---------|--------|
| Local | Local seed | Local .env | Developer |
| Preview | Staging (read-only) | Staging | Reviewer |
| Testing | Ephemeral | Test | CI |
| Staging | Anonymized | Staging | Team |
| Production | Production | Production | Restricted + audited |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Shared DB across envs | Cross-contamination | Isolated databases |
| Same secrets across envs | Staging leak → prod breach | Per-env secrets |
| Production data in dev | Compliance breach | Anonymized fixtures |
| Preview using prod data | Data exposure | Read-only staging data |
| Mis-targeted deployments | Prod disruption | Pipeline isolation |

### 11.5 Access Control

**What:** Identity-based, least-privilege access to the platform's infrastructure — who can read, change, or deploy what (see Section 12 for the role matrix).

**Why:**
- Least privilege limits the blast radius of any account compromise.
- Auditable access is required for enterprise and compliance trust.
- Separation of duties (no single person controls both code and production secrets end-to-end) is a core control.

**Where:** Platform consoles, CI/CD, secrets store, databases, and deployment permissions.

**Best practices:**
- **Role-based access with least privilege:** map operational roles (Section 12) to concrete permissions; grant the minimum.
- **No shared accounts:** every human operator has a unique identity; no generic credentials.
- **MFA required** for all platform/cloud/console access.
- **Break-glass accounts:** emergency access accounts with long keys stored securely, logged, and audited — used only when normal access fails (Section 12.6).
- **Access reviews:** quarterly review of who has what; revoke stale access.
- **Audit of privileged actions:** deploy, secret changes, infra changes are logged and attributed (SECURITY_ARCHITECTURE.md §8).

**Access control standard:**

| Resource | Who | Control |
|----------|-----|---------|
| Code repository | Engineering | Review + merge rules |
| CI/CD pipeline | Engineering + Platform | Restricted runners, reviewed workflows |
| Platform console | Infrastructure/Platform Admin | MFA, least privilege |
| Secrets store | Platform Admin only | Scoped, audited |
| Database | Platform Admin/Infra | Scoped credentials |
| Deployment to prod | Platform/Deploy role | Pipeline-gated |
| Observability | Monitoring role | Read-only |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Shared accounts | Unattributable actions | Unique identities |
| No MFA | Account takeover | MFA mandatory |
| Admin-everyone | Massive blast radius | Least privilege |
| No access reviews | Stale, risky access | Quarterly reviews |
| No audit of privileged actions | Blind to abuse | Audit logging |

### 11.6 Secure Deployments

**What:** Deploying code and configuration through a secure, verified, auditable pipeline — nothing reaches production except through review, checks, and controlled execution.

**Why:**
- The deployment pipeline is a high-value target; a compromised pipeline deploys compromised code.
- Unreviewed or hand-applied changes are unverifiable and unreproducible.
- Auditability of deployments is required for enterprise trust.

**Where:** GitHub Actions workflows, build artifacts, deployment commands, and environment promotion.

**Best practices:**
- **Everything through the pipeline:** no ad-hoc production deploys, no hand-applied config (Section 9.3).
- **Protected branches:** `main` requires review + passing gates; only CI can deploy (branch protection).
- **Reproducible builds:** locked dependencies (`pnpm-lock.yaml`), pinned base images, content-hashed artifacts (Section 9.3).
- **Supply-chain protection:** dependency scanning, verified registry sources, signature checks on critical deps (SECURITY_ARCHITECTURE.md §7.3).
- **Secrets in CI:** CI secrets stored in the CI secrets store, scoped to environments/jobs, never printed.
- **Signed/verified artifacts:** deployment artifacts are verified (integrity hashes) before promotion to production.
- **Audit trail:** every deploy is recorded (who/what/when, artifact hash, environment) and reviewable in the release log.

**Secure deployment standard:**

| Step | Control |
|------|---------|
| Code review | Required for `main` |
| CI gates | Lint, typecheck, test, budget, scan |
| Artifact | Reproducible, hashed, signed |
| Secrets | CI secret store, scoped |
| Promotion | Pipeline-only, audited |
| Post-deploy | Verification + monitoring (Section 7.5) |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Ad-hoc production deploys | Unreviewed changes | Pipeline only |
| Non-reproducible builds | Unverifiable artifacts | Locked deps + hashes |
| Unscanned dependencies | Supply-chain compromise | CI scanning |
| CI secrets broad scope | Secret leakage risk | Job-scoped secrets |
| No release audit | Untraceable changes | Release log |

---

## 12. Operational Permissions

### 12.1 Role Model Overview

**What:** The operational role model for platform infrastructure — distinct roles with distinct permissions (least privilege), aligned with the application-level RBAC in SECURITY_ARCHITECTURE.md §11.

**Why:**
- Operational roles separate duties so no single person controls the full platform path.
- Least-privilege roles limit blast radius and are auditable.
- Clear roles make on-call, incident response, and audits deterministic.

**Where:** Platform consoles, secrets store, CI/CD, observability tools, and the DR team.

**Best practices:**
- **Roles are granted per person, least-privilege, MFA-protected** (Section 11.5).
- **Separation of duties:** the person who deploys is not the only one who approves; recovery access is distinct from day-to-day access.
- **Break-glass path** exists for emergencies and is audited (Section 12.6).
- **Quarterly access review** (Section 11.5) covers all roles.

### 12.2 Infrastructure Admin

**What:** The highest-privilege operational role — owns platform configuration, secrets, networking, and capacity decisions.

**Why:**
- Someone must own the infrastructure foundation and be accountable for it.
- This role is the boundary for everything below it.

**Where:** Platform console, secrets store, capacity planning (Section 2.7), DR ownership.

**Permissions:**

| Area | Permission |
|------|------------|
| Platform configuration | Full |
| Secrets store | Full (create, rotate, revoke) |
| Network/edge config | Full |
| Capacity/autoscaling config | Full |
| Database configuration | Full |
| DR plan ownership | Full |
| **Access** | Restricted to named Infra Admins, MFA, audited |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Infra Admin granted to everyone | Massive blast radius | Named, restricted |
| No rotation authority separation | Single point of failure | Break-glass path |
| Infra changes unrecorded | Unauditable state | Audit all changes |

### 12.3 Platform Admin

**What:** The day-to-day operations role — monitors health, runs scheduled jobs, manages feature flags, and coordinates releases (not infra-root).

**Why:**
- Operations need broad platform visibility and control without full infra-root.
- Separating Platform Admin from Infra Admin preserves least privilege.

**Where:** Observability dashboards, feature flags, scheduled jobs, release coordination.

**Permissions:**

| Area | Permission |
|------|------------|
| Observability/dashboards | Full (read) + run queries |
| Feature flags | Manage (not delete guardrails) |
| Scheduled jobs | Trigger/restart non-destructive |
| Releases | Coordinate + approve |
| Backup monitoring | Read + trigger on-demand backups |
| **Not granted** | Secrets, infra-root, DR cutover alone |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Platform Admin can change secrets | Over-privilege | Split roles |
| Flag changes unlogged | Unauditable rollouts | Audit flag changes |
| Platform Admin as on-call without infra support | Skill-boundary issues | Clear escalation |

### 12.4 Monitoring

**What:** The read-only observability role — sees everything, changes nothing.

**Why:**
- Monitoring must be usable by anyone on-call and by auditors without granting change access.
- Read-only monitoring is the safest broad-access role.

**Where:** Dashboards, logs, metrics, traces, alert configuration (review), status page.

**Permissions:**

| Area | Permission |
|------|------------|
| Dashboards | Full read |
| Logs/metrics/traces | Read + query |
| Alerts | Read + propose (approval to change) |
| Status page | Update status (delegated) |
| **Not granted** | Any change, secrets, deploys |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Monitoring role granted write | Accidental changes | Read-only |
| Monitoring without alert propose | Bottleneck on ops | Propose + review |
| Everyone has monitoring | Unattributable reads | Named access |

### 12.5 Deployment

**What:** The role that executes and observes deployments through the pipeline — no ad-hoc infra changes, no secrets access beyond what CI injects.

**Why:**
- Deploy power must be separated from infra-root and secrets.
- Pipeline-based deploys keep this role safe and audited.

**Where:** CI/CD pipeline, release log, post-deploy monitoring.

**Permissions:**

| Area | Permission |
|------|------------|
| Pipeline execution | Full (promote preview → staging → prod) |
| Rollback | Execute rollback per runbook |
| Release log | Write + review |
| Post-deploy monitoring | Read + verify |
| **Not granted** | Secrets, infra-root, config changes outside pipeline |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Deploy role holds secrets | Credential exposure risk | CI-injected secrets only |
| Rollback without runbook | Wrong rollback action | Runbook-bound |
| Deploys unlogged | Untraceable releases | Release log |

### 12.6 Backup & Recovery

**What:** The operational role for backup and recovery — performs backup verification, restores, and DR drills, with separate break-glass recovery access.

**Why:**
- Backup/recovery must work even when day-to-day access fails (the disaster scenario).
- Restores are privileged, destructive-capable actions needing authority and audit.

**Where:** Backup job monitoring, restore procedures (Section 9.2), DR rehearsal, break-glass access.

**Permissions:**

| Area | Permission |
|------|------------|
| Backup jobs | Trigger, monitor, verify |
| Restore to scratch | Full |
| Restore to production | With Infra Admin + Platform Admin sign-off |
| DR drills | Full (scratch environments) |
| Break-glass accounts | Emergency-only, logged, audited |

**Break-glass standard:**

| Aspect | Standard |
|--------|----------|
| Availability | Out-of-band (survives normal-access failure) |
| Use | Emergency only |
| Logging | Every use logged + alerted |
| Credentials | Long, securely stored, rotated on use |
| Review | Post-incident review mandatory |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Recovery access locked by the failure | Can't recover | Out-of-band break-glass |
| Restores without sign-off | Unauthorized data changes | Dual sign-off |
| Break-glass used casually | Audit blindness | Alert + review on use |
| No DR drill authority | Rehearsals never happen | Drill permissions |

### 12.7 Permission Matrix

**What:** The consolidated least-privilege permission matrix for operational roles.

**Why:**
- A single matrix makes the model auditable and reviewable at a glance.
- It is the reference for granting, reviewing, and revoking access (Section 11.5).

**Where:** Access control reviews, onboarding, and audit.

| Area | Infra Admin | Platform Admin | Monitoring | Deployment | Backup/Recovery |
|------|:-----------:|:--------------:|:----------:|:----------:|:---------------:|
| Platform config | ✓ | — | — | — | — |
| Secrets store | ✓ | — | — | — | — |
| Network/edge config | ✓ | — | — | — | — |
| Feature flags | ✓ | ✓ | — | — | — |
| Scheduled jobs | ✓ | ✓ | — | — | — |
| Release coordination | ✓ | ✓ | — | ✓ | — |
| Deploys/rollbacks | ✓ | — | — | ✓ | — |
| Dashboards/logs/metrics | ✓ | ✓ | ✓ | ✓ | ✓ (read) |
| Backups | ✓ | ✓ (monitor) | — | — | ✓ |
| Restores (scratch) | ✓ | — | — | — | ✓ |
| Restores (production) | ✓ (sign-off) | ✓ (sign-off) | — | — | ✓ (execute) |
| Break-glass | ✓ | — | — | — | ✓ (emergency) |
| DR ownership | ✓ | — | — | — | ✓ |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Matrix not enforced | Drift to over-privilege | Enforce + review |
| Roles overlapping fully | Separation of duties broken | Distinct scopes |
| Matrix undocumented | Ambiguous ownership | This table + review |
| Granting "just in case" | Blast radius growth | Request-based grants |

---

## 13. Performance Testing

### 13.1 Performance Testing Philosophy

**What:** The standard for validating that performance and scalability requirements hold before they are needed — performance tests are part of the definition of done for major changes, not a post-mortem activity.

**Why:**
- Performance is a feature (Section 1.1); it must be verified like one.
- Catching a scalability problem in production at peak is the most expensive way to find it.
- Tested performance builds confidence for sales, launches, and enterprise deals.

**Where:** CI (budget checks, Section 1.2), scheduled performance runs against staging/test capacity, and pre-event validation.

**Best practices:**
- **Test on a staging-scale environment**, never production (Section 7.1).
- **Test with realistic data volume and mix** (browse/search/detail/checkout proportion), not uniform synthetic traffic.
- **Test against realistic device/network profiles** (mobile 4G, low-end devices) for frontend metrics.
- **Every major release and every capacity change** triggers the performance suite.
- **Performance is a regression risk:** the suite must catch regressions, so it runs on a schedule, not only at release time.

### 13.2 Load Testing

**What:** Testing the platform's behavior under expected/typical load — verifies the platform meets performance budgets at forecast traffic levels.

**Why:**
- Confirms response-time budgets (Section 1.5) hold at expected volumes.
- Validates autoscaling behavior within the expected range.
- Provides the baseline for all other performance tests.

**Where:** Staging-scale environment, modeled on forecast traffic (Section 2.7).

**Best practices:**
- **Realistic workload model:** mix of read endpoints (catalog/search) + write flows (checkout) with the platform's real ratios.
- **Measured objectives:** p95 API < budget, no errors, autoscaling keeps up, cache hit ratios hold.
- **Gradual ramp:** ramp to target load to observe scaling behavior and identify thresholds.
- **Repeatable:** fixed scenarios, fixed data, recorded results for comparison over time.

**Load test definition (draft):**

| Aspect | Value |
|--------|-------|
| Target | Forecast peak load (Section 2.7) |
| Mix | 70% read, 20% browse/search, 10% transactional |
| Duration | 30–60 min at target |
| Pass criteria | p95 < budgets, error rate < 0.1%, no saturation |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Uniform synthetic traffic | Wrong conclusions | Realistic mix |
| Testing below forecast | False confidence | Forecast-based load |
| No recorded baseline | Can't compare regressions | Versioned results |
| Load-testing production | User degradation | Staging-scale env |

### 13.3 Stress Testing

**Testing beyond expected load to find the platform's breaking point and behavior at failure.**

**Why:** Determines failure characteristics (graceful degradation vs. crash), informs autoscaling limits, and validates resilience (Section 8).

**Where:** Dedicated test capacity, incrementally past expected peak.

**Best practices:**
- **Incremental ramp past peak** (e.g., 2x, 3x, 4x forecast) to find where saturation occurs.
- **Observe degradation mode:** does the platform degrade gracefully (slow, but serving; queues absorbing) or crash?
- **Identify limits:** connection limits, cache eviction onset, DB saturation, queue backlog growth.
- **Document breaking points** to inform autoscaling caps (Section 2.6) and capacity planning (Section 2.7).

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Stopping at expected load | No breaking-point knowledge | Push past peak |
| Stress on shared environments | Environment damage | Dedicated test capacity |
| Not documenting breaking point | Limit unknown | Recorded limits |

### 13.4 Spike Testing

**Testing sudden, rapid traffic increases — flash sales, launches, festival bursts.**

**Why:**
- E-commerce lives on spikes; the platform must absorb them (Section 2.6).
- Spikes stress autoscaling speed, cache warmness, and queue absorption in ways steady load cannot.
- A spike test rehearses the real sale.

**Where:** Staging-scale environment, simulating a sale-shaped traffic curve.

**Best practices:**
- **Sale-shaped curve:** sudden ramp to peak (e.g., 10x in seconds), hold, then fall — matching flash-sale behavior.
- **Cold-cache spike:** test both warm and cold-cache spike scenarios (pre-warm vs. not) to validate the pre-warm checklist (Section 2.7).
- **Validate elastic behavior:** does autoscaling provision fast enough? Do queues absorb the write burst?
- **Validate checkout under spike:** payment/order paths at peak write volume.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Testing steady load only | Unprepared for real spikes | Spike curves |
| Warm-cache only | Cold spike failure | Both scenarios |
| No write-burst validation | Checkout melt at sale | Spike checkout flows |

### 13.5 Endurance Testing

**Long-duration testing to detect slow degradation — memory leaks, cache growth, connection leaks, queue creep.**

**Why:**
- Some failures appear only after hours/days (leaks, drift, gradual slowdowns).
- Endurance testing finds the failures that load tests miss.

**Where:** Staging-scale environment, sustained load over an extended period (hours).

**Best practices:**
- **Sustained typical load** for hours (e.g., 4–24h) at expected levels.
- **Trend the metrics over time:** latency drift, memory/resource growth, cache eviction increase, queue depth creep, replica lag.
- **Look for monotonic trends** — anything that grows without bound is a leak/bug.
- **Endurance for scheduled-job effects:** daily jobs (archiving, cleanup, reconciliation) must run correctly during sustained load.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Short test only | Missed leaks | Hours-long runs |
| Not trending metrics | Gradual drift missed | Time-series analysis |
| Jobs not tested under load | Job/load interaction bugs | Include scheduled jobs |

### 13.6 Performance Monitoring

**Continuous performance observation in production via RUM + synthetic (Section 10.4) — the permanent extension of performance testing.**

**Why:**
- Testing is periodic; real users are constant.
- Only production monitoring catches the long tail of real-device/network behavior.
- Monitoring feeds the regression baseline (Section 13.7) and the SLOs (Section 8.5).

**Where:** Production RUM (Core Web Vitals, errors), synthetic probes, and performance dashboards (Section 10.6).

**Best practices:**
- **RUM always on:** CWV, API latency, JS errors from real sessions.
- **Synthetic checks** from multiple regions on critical flows (health, search, checkout-smoke).
- **Performance dashboards with budgets** (Section 1.2) and alerting on budget breach (Section 10.5).
- **Release overlay:** watch performance signals after every deploy (Section 7.5).
- **Trend vs. threshold:** monitor trends to catch gradual degradation before threshold breaches.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Testing without production monitoring | Blind after release | RUM + synthetic |
| No release performance watch | Deploy regression unnoticed | Post-deploy overlay |
| Threshold-only monitoring | Missed graduals | Trend monitoring |

### 13.7 Regression Testing

**Performance regression gates that ensure the platform never ships slower than its baseline.**

**Why:**
- Performance regressions accumulate silently across features.
- Regression gates make performance a first-class CI citizen (Section 1.2).
- They protect the "no redesign needed" promise by keeping every layer fast as it grows.

**Where:** CI (budget checks, Lighthouse CI), scheduled performance suite, and production trend monitoring.

**Best practices:**
- **CI gates:** bundle size budgets, Lighthouse Core Web Vitals budgets on preview deploys — fail the build (Section 1.2).
- **Scheduled performance suite:** the load/endurance suite (Sections 13.2, 13.5) runs on a schedule and compares against the stored baseline.
- **Baseline management:** versioned baselines per environment; any change beyond tolerance is a regression to investigate.
- **Production trends:** RUM metrics compared weekly against the previous period; regressions alert (Section 10.5).
- **Per-release regression report:** each release compares its performance signals to the prior release.

**Regression gate matrix:**

| Gate | When | Fails On |
|------|------|----------|
| Bundle size budgets | Every PR | Exceeded budget |
| Lighthouse CWV | Preview deploy | Any CWV budget breached |
| API latency budget | Scheduled suite | p95 > budget vs baseline |
| RUM trends | Weekly | CWV p75 regression > tolerance |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No CI budget gate | Silent bundle growth | Budget in CI |
| Baselines unversioned | Can't detect drift | Versioned baselines |
| Regressions only caught by users | Late, costly fixes | Scheduled suite |
| Tolerances too loose | Regressions pass | Meaningful tolerances |
| No per-release comparison | Unattributed slowdowns | Release reports |

---

## 14. Accessibility Delivery

### 14.1 Performance for All Networks

**What:** Infrastructure and delivery standards that ensure the platform is fast and usable for every user, regardless of network and device — the performance expression of accessibility.

**Why:**
- Mobile-first means many users are on 3G/4G with metered data.
- Low-end Android devices are a large share of Indian e-commerce traffic.
- Slow experience on low-end devices is a form of exclusion and a revenue loss.

**Where:** Delivery pipeline, bundle strategy, media strategy, and the responsive layer.

### 14.2 Fast Mobile Networks

**What:** The delivery standard for good networks (4G/5G/Wi-Fi) — fast, but never bloated.

**Why:**
- Even on fast networks, page weight hurts render and battery.
- Fast networks should get near-instant experiences, which is what "high-performance" positioning promises.

**Best practices:**
- All budgets in Section 1.2 apply on fast networks too (they are the floor, not the ceiling).
- HTTP/3, Brotli, CDN edge proximity for minimum TTFB (Section 1.4).
- LCP under budget with preloaded, optimized hero (Section 1.3).
- Adaptive media quality (Section 6.2) still respects user settings.

### 14.3 Slow Networks

**What:** The delivery standard for slow/unreliable networks (2G/3G, congested 4G) — graceful, efficient, and data-aware.

**Why:**
- Slow-network users are the most likely to abandon; every byte matters.
- E-commerce reach depends on being usable where connectivity is poor.

**Best practices:**
- **Media:** data-conscious variants (lower widths/quality on slow connections via `srcset`/`sizes`), AVIF/WebP to cut bytes (Section 6.1).
- **Text-first:** critical content (product, price, add-to-cart) loads and is usable before media completes.
- **Offline resilience (future PWA):** service-worker-cached shell lets users re-open the site from cache; queued actions retry on reconnect.
- **Resilient fetch:** client retries with backoff for transient network failures (Section 5.5); TanStack Query `retry: 2`.
- **Reduce dependency on third parties** on slow connections — every script is weight and failure risk (Section 1.2).
- **`preconnect`/`dns-prefetch`** to critical origins to shave connection setup.

**Slow-network standard:**

| Area | Standard |
|------|----------|
| Media | Low-width, AVIF/WebP, lazy below fold |
| Critical path | Text/content before media |
| Retries | Client backoff + retry |
| Third parties | Minimized |
| Future | Service-worker shell |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Desktop-weight assets on mobile | Slow-network abandonment | srcSet + sizes |
| Blocking render on media/scripts | Content delayed | Text-first, defer |
| No client retry | Failed interactions on flaky nets | Backoff retries |
| Many third-party scripts | Weight + failure points | Minimize |

### 14.4 Low-End Devices

**What:** The delivery standard for low-memory/low-CPU devices — the experience must not freeze, drop frames, or crash.

**Why:**
- Budget Android devices are common in the target market; heavy JS destroys their experience.
- INP (Section 1.3) is precisely the metric that low-end devices punish.
- A platform that is unusable on the devices most users own is unusable.

**Best practices:**
- **Bundle discipline:** route code splitting, tree-shaking, and budget gates (Section 1.2) keep JS light and parse fast.
- **Main-thread discipline:** no long tasks, compositor-only animations, no render storms (Section 1.3 INP rules).
- **Memory hygiene:** virtualize long lists (product grids, order lists), avoid unbounded caches, release listeners.
- **Reduced data:** lighter assets and lower-resolution media on constrained devices.
- **`prefers-reduced-motion`:** animations are disabled/reduced by default for users who request it (already respected by Framer Motion, TECH_STACK.md §1.6).
- **Test on real low-end hardware**, not just DevTools throttling — memory/CPU reality differs.

**Low-end device standard:**

| Area | Standard |
|------|----------|
| JS payload | Budget-enforced (Section 1.2) |
| Main thread | No long tasks, cheap interactions |
| Lists | Virtualized |
| Animations | Reduced-motion compliant |
| Media | Lower-res variants |
| Testing | Real low-end devices |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Testing only desktop | Low-end disasters uncaught | Real-device matrix |
| Heavy lists unmemoized | Janky scroll, memory spikes | Virtualization |
| Long task in interaction | INP explosion | Keep handlers cheap |
| Ignoring reduced-motion | Uncomfortable/misaligned users | Respect preference |
| Unbounded client caches | Memory pressure | Bounded caches |

### 14.5 Responsive Delivery

**What:** The infrastructure side of responsive design — the platform serves the right variant to every viewport/device from the same URLs, with correct cache behavior.

**Why:**
- Responsive delivery is what makes "one codebase, every device" fast (Section 6.6).
- Correct `Vary`/cache behavior ensures variants don't bleed across devices.
- Responsive delivery is a prerequisite for all the accessibility-delivery standards above.

**Best practices:**
- **Responsive media URLs** via `srcset`/`sizes`; variants cached per width/format (Section 6.6).
- **`Vary` correctness** so cached variants are served only to matching clients (`Accept-Encoding`, locale where relevant) (Section 3.3).
- **Responsive layout with fluid typography/grid** (RESPONSIVE_LAYOUT_ARCHITECTURE.md) so content reflows without horizontal scroll on any viewport.
- **Viewport-aware resource hints:** preload only the LCP variant for the current viewport.
- **Test the full device matrix** (phone/tablet/desktop, low/high DPR) in E2E and performance suites.

**Responsive delivery standard:**

| Layer | Standard |
|--------|----------|
| Media | srcSet + sizes, cached per variant |
| Cache | Correct `Vary` headers |
| Layout | Fluid, no horizontal scroll |
| Preload | Viewport-correct LCP |
| Testing | Full device matrix |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| No `Vary` on variant content | Wrong variant cached | Vary headers |
| Fixed-width design | Poor small-screen UX | Fluid layouts |
| Preloading wrong-size LCP | Slow LCP on devices | Viewport-aware preload |
| Incomplete device testing | Missed breakpoints | Device matrix |

---

## 15. Future Readiness

### 15.1 Future Readiness Philosophy

**What:** Every architectural decision in this document is made so the platform can grow from the first customer to millions of users and across geographies **without redesign** — the growth path is designed now, activated when needed (from TECH_STACK.md §17 and ARCHITECTURE.md §35).

**Why:**
- Redesign under growth pressure is the costliest failure mode.
- Readiness is cheap at design time and expensive to retrofit.
- Enterprise and international growth depend on a platform that scales with the business.

**Best practices:**
- **Layered, modular architecture** (this document's seams: delivery abstraction, DB access seam, cache layer, provider abstraction) is the retrofit-free growth path.
- **Readiness ≠ deployment:** the standards below define *readiness* — the design constraints that make activation safe — while activation is triggered by measured thresholds (Section 2.7).
- **Every new feature is assessed against future-readiness constraints** before it is approved.

### 15.2 Global CDN

**What:** The delivery standard that the platform already meets and must maintain — global edge delivery of all public content, media, and APIs.

**Why:**
- Global users must get the same fast experience regardless of geography.
- The CDN is the growth foundation for international expansion.

**Where:** All static assets, media, and public APIs (current platform: Cloudflare CDN/edge).

**Best practices:**
- Maintain edge-first delivery (Sections 1.4, 3.3, 6.3) — everything public is served from the edge.
- Media delivery abstraction (Section 6.3) keeps CDN provider swappable.
- Cache policies (Section 3) scale internationally without change.
- **Readiness only:** activation = geographic expansion via the existing CDN; no architectural change needed.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Origin-direct delivery as traffic globalizes | Global latency | Edge-first default |
| CDN lock-in via hard-coded URLs | Migration cost | Delivery abstraction |

### 15.3 Multi-Region Deployment

**What:** The readiness for operating from multiple regions (for data residency, latency, and resilience) without redesign.

**Why:**
- International expansion requires data residency and low regional latency.
- Multi-region adds availability depth (Section 8.1).
- Multi-region is an activation decision (measured need), designed now.

**Where:** Edge (already global), database (managed, region-aware), storage (region-aware replication), and config.

**Best practices — readiness constraints:**
- **Stateless everywhere** (Section 2.3): any region can serve any request — no region-affine state.
- **Database:** managed Postgres with region-aware replication/read replicas; read-heavy traffic served from regional replicas; primary region per data-residency zone (Section 4).
- **Storage:** region-aware replication for originals (Section 9.5); media delivered from the nearest edge.
- **Config is regionalizable:** locale/currency/pricing config is data, not code (Sections 3.9).
- **Cache:** global KV replication gives consistent public reads (Section 3.3).
- **Activation triggers:** measured regional latency, data-residency requirements, or a second data-center requirement for availability (Section 8.1).

**Multi-region readiness checklist:**

| Item | Standard |
|------|----------|
| Stateless request serving | Mandatory |
| DB regional replicas | Ready (managed) |
| Storage regional replication | Ready |
| Regionalized config | Ready |
| Cache global consistency | Ready |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Region-affine state | Cannot serve from other regions | Stateless |
| Single-region data with residency needs | Compliance failure | Regional DB/storage |
| Config hard-coded per region | Config chaos | Regionalized config |

### 15.4 Multi-Cloud Readiness

**What:** The readiness to run on or fail over to another cloud provider — without application redesign.

**Why:**
- Avoids vendor lock-in and enables provider-level resilience (Section 8.1).
- Enables cost/performance optimization across providers.
- Multi-cloud is an activation decision (cost/resilience need), designed now.

**Where:** Compute/runtime abstraction, storage, database, media, and config.

**Best practices — readiness constraints:**
- **Runtime portability:** edge/worker handlers are standard JavaScript/TypeScript with platform-abstracted bindings (`api/_lib/` seams); the application never depends on vendor-specific APIs directly (FOLDER_ARCHITECTURE.md §3).
- **Storage abstraction:** object storage access is S3-compatible via a seam (Section 6.3); media delivery is behind the delivery abstraction.
- **Database:** PostgreSQL is portable; connection access goes through the `database/` seam (Section 4.5).
- **Cache seam:** KV/cache access is behind a cache layer so the backing store is swappable (Section 3).
- **Secrets/config:** in a platform secrets store that is provider-agnostic (Section 11.3).
- **Activation triggers:** cost optimization, provider-level SLA need, or regulatory requirement.

**Multi-cloud readiness checklist:**

| Item | Standard |
|------|----------|
| Vendor-abstracted bindings | Mandatory |
| S3-compatible storage seam | Mandatory |
| Portable database access | Mandatory |
| Cache seam | Mandatory |
| Provider-agnostic secrets/config | Mandatory |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Vendor-specific APIs in handlers | Lock-in | Abstraction seams |
| Storage tightly coupled to one provider | Migration pain | S3-compatible seam |
| No multi-cloud rationale | Pointless complexity | Activation by measured need |

### 15.5 Edge Computing

**What:** The evolution of compute closer to the user — the platform already executes at the edge; readiness means all future workloads can run at the edge, and heavier workloads can migrate out without redesign.

**Why:**
- Edge execution is the latency foundation (Sections 1.4, 2.4).
- Future workloads (personalization, dynamic pricing, localized rendering) belong at the edge.
- The boundary between edge and centralized compute must remain flexible.

**Where:** Edge runtime (current platform: Cloudflare Pages Functions/Workers), and the seam to heavier compute (Section 15.8) when needed.

**Best practices:**
- **Keep handlers stateless and small** so they can run anywhere (Section 2.3, FOLDER_ARCHITECTURE.md §3).
- **Heavy compute migrates via queue/job seams** (Section 5) — a workload that outgrows the edge moves to a job worker, not a rewrite.
- **Edge cache usage** (KV) stays the primary read path for global low latency.
- **Smart placement:** database-heavy handlers use placement tuning to reduce DB round-trip latency (TECH_STACK.md §2.1).
- **Readiness only:** no new architecture needed — future edge workloads reuse the same seams.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Stateful edge logic | Breaks edge distribution | Stateless |
| CPU-heavy work forced to edge | Cold-start/latency hits | Queue seam to workers |
| Edge/central logic divergence | Inconsistent behavior | Same seams everywhere |

### 15.6 AI Infrastructure

**What:** The readiness for AI workloads (personalization, recommendations, search ranking, support automation, content generation) without redesign.

**Why:**
- AI will power personalization and efficiency as the platform grows.
- AI workloads have distinct needs (inference latency, embeddings, model serving, data pipelines).
- AI must be added through existing seams, not a parallel architecture.

**Where:** Feature flag/personalization layer, search, support, analytics, and the data/event pipeline (Section 15.9).

**Best practices — readiness constraints:**
- **Feature-flag + experiment plumbing exists** (Section 7.8) for AI-driven changes (recommendations, personalization) with gradual rollout.
- **Data pipeline readiness (Section 15.9):** the event stream feeds AI (behavioral data) without schema rework.
- **Search seam:** the search handler abstraction (Section 3.6) can swap `pg_trgm` for a dedicated search/AI-ranking engine without changing callers.
- **Inference isolation:** heavy inference runs in background workers (Section 5), never in the request path; results are cached (Section 3).
- **Embedding/vector storage:** evaluated against the existing storage seams when needed; no new architectural pattern required.
- **Observability (Section 10):** AI calls are traced/metriced like any external provider.

**AI readiness checklist:**

| Item | Standard |
|------|----------|
| Experiment/flag plumbing | Ready |
| Event data pipeline | Ready |
| Search seam | Ready |
| Inference off request path | Ready |
| Caching of AI results | Ready |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Blocking requests on inference | Slow UX | Background inference + cache |
| AI without experiment gate | Uncontrolled change | Flag + A/B |
| Hard-wiring one AI provider | Lock-in | Seam-based integration |

### 15.7 Container Orchestration

**What:** Readiness for running containerized workloads (jobs, worker fleets, or services) under an orchestrator (Kubernetes-class) when compute needs outgrow serverless.

**Why:**
- Some workloads (long-running, GPU, specialized) fit containers.
- Orchestration is an activation decision (workload need), designed to be additive — not a rewrite.

**Where:** Background workers and future dedicated services; the queue/job seams (Section 5) and service boundary (Section 15.9).

**Best practices — readiness constraints:**
- **Work is queue-driven and stateless** (Section 5) — the natural fit for containerized workers; the same jobs run on serverless or containers behind the same queue.
- **Deployment is pipeline-based and container-buildable** (Section 9.3) — the platform's Docker usage (TECH_STACK.md §14.3) extends to production workloads.
- **Service seams exist** (Section 15.9) so a workload can become a dedicated service without coupling.
- **Orchestration is additive:** existing edge/serverless paths remain; only the migrated workload changes.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Moving everything to orchestration | Unneeded complexity | Additive migration |
| Stateful containers | Scheduling problems | Stateless + queues |
| Rebuilding the platform for containers | Redesign | Same seams |

### 15.8 Service Mesh

**What:** Readiness for service-to-service networking (traffic control, observability, mTLS) when a multi-service topology exists — designed as a seam, not a prerequisite.

**Why:**
- If/When services proliferate (Section 15.9), controlled, observable service communication is essential.
- mTLS and fine-grained traffic policy secure the service graph (Section 11.2).
- Mesh is an activation decision (topology need), designed now.

**Where:** Future service boundaries (Section 15.9); today the platform is a single logical service with seams.

**Best practices — readiness constraints:**
- **Service boundaries are clear seams** (Section 15.9) — a future mesh simply routes between them.
- **Traffic control readiness:** canary/split semantics (Section 7.8) already define the model.
- **Identity readiness:** every service gets an identity (Section 11.2) enabling mTLS when the mesh is added.
- **Observability readiness:** `requestId` correlation (Section 10.3) extends across services unchanged.
- **No mesh today:** a mesh for one service is pure overhead; readiness is the design, not the deployment.

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Adopting mesh before services exist | Overhead with no benefit | Activation by topology |
| Services without identity | mTLS retrofit pain | Identity-ready |
| Broken correlation across services | Undebuggable | Shared requestId |

### 15.9 Event Streaming

**What:** The readiness for an event-driven backbone (streaming events: orders, inventory, analytics, notifications) to decouple systems and feed analytics/AI.

**Why:**
- Event-driven architecture decouples producers from consumers — the natural evolution of the queue system (Section 5).
- A durable event log is the foundation for analytics (Section 10.2), AI (Section 15.6), and cross-system consistency.
- Streaming is an activation decision (event volume need), designed now.

**Where:** The queue/background system (Section 5), audit events, and business events (orders, payments, inventory).

**Best practices — readiness constraints:**
- **Events are first-class:** business events (order placed, payment captured, inventory changed, user registered) are defined events with IDs and schemas — the queue today, a stream tomorrow (Section 5.1).
- **Outbox pattern readiness:** writes that also emit events (order created → email/analytics/notification) use a transactional outbox so events are never lost with the write.
- **Idempotent consumers** (Section 5.1) make replay-safe streaming possible.
- **Event schema versioning:** events are versioned so consumer evolution is safe.
- **Analytics reads from events/aggregates** (Section 3.5) rather than OLTP queries.

**Event standard (design-time):**

| Aspect | Standard |
|--------|----------|
| Event definition | Named, ID, schema, version |
| Production | Transactional outbox on writes |
| Delivery | At-least-once + idempotent consumers |
| Consumption | Queue today → stream when needed |
| Analytics | From events/aggregates |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Events only as side effects | Lost events, untraceable | Outbox pattern |
| No event schema/versioning | Consumer breaks on change | Versioned events |
| Non-idempotent consumers | Duplicate on replay | Idempotency |
| Adopting a stream before need | Overhead | Queue today, stream on trigger |

### 15.10 Microservices Migration

**What:** The readiness for splitting the platform into services only if/when boundaries demand it — the seams exist, so migration is incremental, never a redesign.

**Why:**
- Microservices are a cost (operational complexity), justified only by clear boundary pressure (team scale, independent scaling, distinct performance domains).
- Redesigning into microservices under pressure is the classic failure.
- The platform's seams make future service extraction a safe, incremental move.

**Where:** The domain seams in this document: cache (3), database access (4), queues (5), media (6), observability (10), and events (15.9).

**Best practices — readiness constraints:**
- **Bounded contexts already exist** (FOLDER_ARCHITECTURE.md §2/§3: features and domains with ownership rules) — future services map to existing boundaries.
- **Service extraction path:** a domain (e.g., search, notifications, exports) becomes a service only when it needs independent scaling or ownership; the seams (queues, events, cache) already isolate it.
- **Shared data anti-pattern avoided:** services own their data; cross-service access goes through service APIs, not shared tables — the tenant/ownership model (DATABASE_ARCHITECTURE.md §4) supports this.
- **Monolith-first is the strategy:** one deployable with clean seams; extraction is measured, not speculative.
- **Activation triggers:** team size/velocity, independent scaling need, or performance isolation need (Section 2.5).

**Microservices readiness checklist:**

| Item | Standard |
|------|----------|
| Bounded contexts | Ready |
| Data ownership per domain | Ready |
| Service seams (queues/events/cache) | Ready |
| Observability across services | Ready (requestId) |
| Monolith-first posture | Mandatory |

**Common implementation mistakes:**
| Mistake | Impact | Prevention |
|---------|--------|------------|
| Premature microservices | Operational complexity, no payoff | Monolith-first |
| Shared database across "services" | Coupling + coordination | Data ownership |
| Extraction as a rewrite | Costly redesign | Incremental via seams |
| No observable seam before split | Unmaintainable after split | requestId + seams first |

---

## 16. Mandatory Rules for AI Agents

### 16.1 What

Rules that every AI agent must follow when working on Nabome performance, scalability, or infrastructure-related work.

### 16.2 Why

- **Consistency:** All agents apply the same performance and infrastructure standards.
- **No redesign:** Agents must preserve the seams and readiness constraints that make growth safe.
- **Quality:** Agents must not introduce performance regressions, single points of failure, or lock-in.

### 16.3 Performance Rules

| # | Rule |
|---|------|
| P1 | Never add a database query where a cache hit is possible — use the cache layer (Section 3). |
| P2 | Never fetch data the client won't use — use `select`/field selection (Section 1.5). |
| P3 | Never lazy-load the LCP image and never ship an image without dimensions (Section 1.3). |
| P4 | Never put CPU-heavy or slow work in the request path — enqueue it (Section 5). |
| P5 | Always paginate and bound result sets (Section 1.5, 4). |
| P6 | Every write must invalidate its cache keys deterministically (Section 3.10). |
| P7 | Every new endpoint must emit logs, metrics, and (for critical paths) traces (Section 10). |
| P8 | Never commit without passing the performance budget gates (Section 1.2, 13.7). |

### 16.4 Scalability & Availability Rules

| # | Rule |
|---|------|
| S1 | Keep all handlers and workers stateless (Section 2.3). |
| S2 | All database access goes through the `database/` seam — never ad-hoc connections (Section 4.5). |
| S3 | All media delivery goes through the delivery abstraction — never hard-coded provider URLs (Section 6.3). |
| S4 | All background work is queued with idempotent consumers and DLQs (Section 5). |
| S5 | Scheduled jobs must be singletons with overlap guards (Section 5.4). |
| S6 | All migrations are additive/backward-compatible (expand/contract) (Section 8.6). |
| S7 | No secrets in code, logs, or config — platform secrets store only (Section 11.3). |
| S8 | No new single point of failure — every component has a redundancy/failover story (Section 8.1). |

### 16.5 Observability & Security Rules

| # | Rule |
|---|------|
| O1 | Every log includes `requestId` and follows the structured schema (Section 10.1). |
| O2 | Never log secrets or PII (Section 10.1, 11.3). |
| O3 | Every alert has a runbook and an actionable response (Section 10.5). |
| O4 | All infrastructure changes are code-reviewed and pipeline-deployed (Sections 9.3, 11.6). |
| O5 | Every new integration/endpoint gets a capacity signal + SLO consideration (Section 10.8). |

### 16.6 Future-Readiness Rules

| # | Rule |
|---|------|
| F1 | Preserve abstraction seams — do not bypass the cache, database, media, or provider seams (Sections 15.3–15.10). |
| F2 | Tenant-aware design on new tables (tenant FK + tenant-scoped queries) (Section 4.4). |
| F3 | Events are defined, versioned, outbox-produced, and idempotently consumed (Section 15.9). |
| F4 | New features are assessed for performance budgets and capacity impact before approval (Sections 1.2, 2.7). |
| F5 | Vendor-neutral by default — nothing is committed that cannot run on another provider through the existing seams (Section 15.4). |

---

## 17. Architectural Checklist

### 17.1 Performance Checklist

- [ ] Bundle/budget gates enforced in CI
- [ ] Core Web Vitals budgets met (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] All images optimized (srcSet, AVIF/WebP, dimensions, no lazy-LCP)
- [ ] Read endpoints served from cache (CDN/KV) with correct headers
- [ ] Writes invalidate cache deterministically
- [ ] No CPU work in the request path; background work queued
- [ ] API latency budgets met (read p95 < 200ms, write p95 < 400ms)
- [ ] DB queries indexed, selected, paginated (query p95 < 100ms)

### 17.2 Scalability Checklist

- [ ] All services stateless
- [ ] DB access through `database/` seam; Hyperdrive pooling
- [ ] Read replicas ready (read routing + read-your-writes)
- [ ] Tenant/time partition readiness in schema
- [ ] Elastic scaling configured + load-tested
- [ ] Capacity model + headroom tracked (Section 2.7)
- [ ] Cache hit ratios monitored (CDN > 95%, KV > 85%)

### 17.3 Availability & Recovery Checklist

- [ ] No single point of failure
- [ ] Health checks (liveness + readiness) on critical path
- [ ] Auto-recovery with circuit breakers and escalation
- [ ] DB auto-failover configured and rehearsed
- [ ] Backups scheduled, encrypted, and restore-tested quarterly
- [ ] Zero-downtime deploy pattern (migrate-first, expand/contract, canary)
- [ ] Rollback path rehearsed; kill-switch flags for risky features
- [ ] RPO < 1h, RTO < 4h documented and measured

### 17.4 Observability Checklist

- [ ] Structured logs with requestId
- [ ] RED metrics for every endpoint; USE metrics for resources
- [ ] Tracing on critical paths + background jobs
- [ ] RUM (Core Web Vitals) + synthetic monitoring active
- [ ] SLO dashboards with error budget
- [ ] Actionable alerts with runbooks; no alert noise
- [ ] Capacity monitoring with growth projections

### 17.5 Security & Operations Checklist

- [ ] Secrets in platform store; rotation schedule followed
- [ ] Environment isolation (data, secrets, access)
- [ ] Least-privilege operational roles enforced (Section 12)
- [ ] Break-glass recovery access available and audited
- [ ] Deployments pipeline-only, reviewed, audited
- [ ] WAF, rate limiting, bot protection default-on

### 17.6 Future-Readiness Checklist

- [ ] Abstraction seams intact (cache, DB, media, provider)
- [ ] Global CDN delivery maintained for all public content
- [ ] Multi-region/multi-cloud readiness constraints met
- [ ] Events defined, versioned, outbox-produced, idempotent
- [ ] Microservices extraction path documented (monolith-first)
- [ ] No vendor-specific APIs in handlers

---

## Summary

The Performance, Scalability & Infrastructure Architecture Standard defines how Nabome stays fast from the first customer to millions of users without redesign:

- **Performance is a feature:** quantified budgets, enforced in CI, monitored in production (Section 1).
- **Scalability is designed before it is needed:** stateless services, elastic scaling, capacity planning, and prepared scaling levers (Sections 2, 4).
- **Caching is the primary lever:** layered caching with deterministic invalidation (Section 3).
- **Background processing keeps the path fast:** queues, workers, retries, and priority classes (Section 5).
- **Delivery is global and device-aware:** optimized media, CDN delivery, and accessibility for slow networks and low-end devices (Sections 6, 14).
- **Deployment is safe by design:** environments, rollbacks, canary and blue-green readiness, zero-downtime migrations (Sections 7, 8).
- **Recovery is rehearsed, not assumed:** redundancy, failover, backup/restore, RPO < 1h, RTO < 4h, business continuity (Sections 8, 9).
- **The platform sees itself:** logging, metrics, tracing, monitoring, alerting, dashboards, and capacity signals (Section 10).
- **Infrastructure is secure and vendor-neutral:** least-privilege operations, environment isolation, secrets discipline, and abstraction seams (Sections 11, 12, 15).
- **Growth never requires redesign:** every decision preserves the seams and readiness constraints that make global, multi-cloud, event-driven, and service-based futures incremental activations — not rewrites.

---

**Document Version:** 1.0
**Last Updated:** August 03, 2026
