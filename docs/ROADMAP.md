# NABOME PRODUCT & ENGINEERING ROADMAP

Date: 2026-09-01
Baseline Commit: f46a780 (features) / 995e3e0 (deep audit) — production live
Production Status: VERIFIED (prod + staging 200, env correct, 53/53 customer tests PASS)

## 1. Executive Summary

NABOME V1 is production-verified with 0 P0 / 0 P1. The 96 TODO occurrences are **not 96 features** — they collapse to **11 meaningful product workstreams + 1 operational item (B2)**, plus ~22 intentional non-actionable / test-fixture / defensive notes. No unexplained production mocks, no fake business data, no hidden P1.

The roadmap optimizes for business value, shop-owner value, revenue, and free/open-source-first feasibility while preserving the stable Cloudflare Pages + Hyperdrive + Neon + KV + B2 architecture. Sentry, R2 migration, and Redis are **DO NOT IMPLEMENT** by design.

**Top 5 next:** Timeline Retrieval > Global Settings Persistence > Commerce Rules Engine (tax/shipping/promo phased) > Background Jobs (lightweight) > Staff Management. PDF full rendering, WebSocket, and external analytics remain deferred — the in-DB reports/analytics are sufficient for V1.

## 2. Current Production Baseline

| Area           | State    | Evidence                                                                                                              |
| -------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| Frontend       | VERIFIED | https://nabome.pages.dev / nabome.online 200                                                                          |
| Production API | VERIFIED | https://nabome-api.pages.dev 200 env production commit f46a780                                                        |
| Staging API    | VERIFIED | https://nabome-api-staging.pages.dev 200 env staging commit f46a780                                                   |
| DB             | READY    | Neon pooled AP + Hyperdrive e2b5c6e70f164e189bebf1cc1282428f, 2 migrations, PITR daily                                |
| KV             | READY    | RATE_LIMIT_STORE 6969b59... / staging 2db985... / preview 7cb2d64...                                                  |
| Storage        | READY*   | B2 nabome-media s3.us-east-005.backblazeb2.com — *versioning/lifecycle = external console verification (non-blocking) |
| Payments       | READY    | Razorpay keys configured, webhook signature + 5-min freshness + nonce replay verified                                 |
| Email          | READY    | Resend API key + FROM_EMAIL                                                                                           |
| Bot protection | READY    | Turnstile secret + site key                                                                                           |
| Quality gates  | PASS     | typecheck PASS, lint 0 errors, api 84/84, customer 53/53, app 121/121, CSV real, tenant-isolated reports/analytics    |
| P0 / P1        | 0 / 0    | FINAL_DEEP_PRODUCTION_AUDIT 995e3e0 — PASS WITH FINDINGS=NONE                                                         |

Remaining deferred intent: PDF text-placeholder, no queue table, no pricing-tier model, promotion/tax/shipping engines not in scope, internal DB analytics (no GA/Mixpanel), WebSocket requires DO, single-owner-per-shop, B2 console verification.

## 3. 96 TODO Analysis

### TODO Occurrence Breakdown

Verified via source grep (excluding `dist/` and `node_modules`):

```
TODO occurrences: 96 (apps + packages, source only)
dist duplicates: 22 (build artifact, not counted)
node_modules: ~1657 (dependency, ignored)
```

Classification by inspection (`apps/api`, `apps/customer`, `packages/order`, `packages/customer`, `packages/returns`):

| Category                                                                                                                                                               | Count                            | Nature                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| Commerce engines (Promotion/Tax/Shipping in pricing.ts + customer pricing tier)                                                                                        | 4                                | Intentional deferred — engines not in scope                                 |
| External analytics sinks (GA4 3 + PostHog 6 + wishlist 3 + admin/cart analytics 3)                                                                                     | 15                               | Intentional deferred — internal DB used                                     |
| WebSocket realtime                                                                                                                                                     | 2                                | Intentional deferred — requires Durable Objects                             |
| Background job / DLQ / retry                                                                                                                                           | 1 + 6 subscriber stubs = 7 TODOs | 1 workstream — intentionally deferred                                       |
| Order timeline & persistence (api/order 2 + packages/order service 6 + repo schema gaps 7 + event subscribers 6)                                                       | 21                               | 1–2 workstreams — low-effort retrieval                                      |
| Returns analytics/notifications wiring (@nabome/analytics 8 + @nabome/notifications 3)                                                                                 | 11                               | Deferred package integration                                                |
| Frontend completeness (Address modals 2, Profile avatar 1, Loyalty 1, Reviews 1, Promo banner storage 1, Newsletter/PostHog 2, returns page 1, wishlist analytics 3)   | 12                               | Low-value deferred UI polish                                                |
| Auth/account (MFA 1, notification prefs 1, account deletion 2, order snapshot user fetch 1, returns refund gateway 1, cart shipping distance note already implemented) | 6                                | Deferred / requires policy decision                                         |
| Customer package hooks — `TODO: Implement API call ...` (profile 2, prefs 2, addresses 5, sessions 2, notifications 3, dashboard 1)                                    | 15                               | Defensive — API already exists; hooks are client placeholders; not blocking |
| Test fixtures (`TODO: Mock database call`, `Verify ...`)                                                                                                               | 7                                | Non-actionable — correctly isolated                                         |
| **Total**                                                                                                                                                              | **96**                           |                                                                             |

### Meaningful Workstreams

```
96 TODO occurrences ≠ 96 features

TODO occurrences:              96
Meaningful feature/workstreams: 11  (product) + 1 operational (B2)
Intentional non-actionable TODOs: ~18 (defensive notes, audit-log/WebSocket/analytics sink comments with reason)
Test fixtures:                  7  (packages/customer __tests__)
Documentation:                  0  (beyond this register)
Frontend minor polish bundled:  1 workstream (Loyalty/Reviews/modals — LOW value, not roadmap-driving)
```

Grouping rationale: `promotion/tax/shipping` → **Pricing & Commerce Rules Engine**; `GA/Mixpanel/PostHog` → **External Analytics Integration**; `admin/events + cart/events WebSocket` → **Realtime**; `event-publisher subscribers + retry` → **Background Jobs**; `timeline schema exists + retrieval stub` → **Timeline Retrieval**. This avoids TODO-count thinking.

## 4. Workstream Inventory

| #   | Workstream                                    | Source Files                                                                                                                                                                                                           | TODOs                                   | Current State                                                                                                                                                                                                                                                                          | Why It Exists                                                                                                                                                                      |
| --- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | **PDF Export — Full Rendering**               | `apps/api/_lib/reports/service.ts:579` (`exportToPDF` text-based Buffer + `%PDF-1.4` header)                                                                                                                           | 0 TODO (deferred comment, not grep-hit) | CSV real; PDF returns text placeholder Buffer; Workers incompatible with Node pdf libs (pdfkit/jspdf)                                                                                                                                                                                  | Compliance-grade export for shop/admin; invoice archiving; auditor asks. Not currently blocking — shops use CSV.                                                                   |
| B   | **Background Jobs / Queue**                   | `packages/order/src/event-publisher.ts:127` (retry/DLQ), subscribers 323–436 (console.log stubs)                                                                                                                       | 7                                       | In-memory `EventPublisher` with `eventQueue[]`, `processQueue()` — synchronous, no table, no persistence, no retry                                                                                                                                                                     | Email delivery, report generation, reservation expiry, analytics aggregation, cleanup, notifications — all currently synchronous or console.                                       |
| C   | **Customer-Specific Pricing Tiers**           | `apps/api/_lib/cart/service.ts:192` (commented `pricingTier === premium`)                                                                                                                                              | 1                                       | No `pricingTier` column on User/Shop; no tier model; `applyPricingRules` already does volume (5%/10%) + bulk (2%/3%) discounts                                                                                                                                                         | Wholesale/B2B, VIP/loyalty pricing. Not in V1 retail model.                                                                                                                        |
| D   | **Promotion Engine**                          | `apps/api/_lib/cart/pricing.ts:59`                                                                                                                                                                                     | 1 (grouped)                             | `calculateDiscountTotal` returns 0; `Coupon` model exists (code/type/value/maxDiscount/minOrder/maxUses/validFrom/Until) but not wired to pricing                                                                                                                                      | Percentage/fixed/free-shipping, min order, product/category/shop restriction, usage limits, date windows, stacking. `Coupon` + `CheckoutSession.couponCode` exist; engine missing. |
| E   | **Tax Engine**                                | `apps/api/_lib/cart/pricing.ts:70`, `apps/api/_lib/cart/service.ts:206` (currently inline 18% + full country/state matrices already implemented)                                                                       | 1 (grouped)                             | `calculateTaxTotal` hardcodes 18% GST; `CartService.calculateTax` already implements country/state rates + tax-exempt categories — but TODO notes "Integrate with Tax Engine" — engine formalization missing                                                                           | GST/VAT inclusive vs exclusive, product tax classes, shop/customer/shipping location, exemptions, invoice tax line. India GST is 18% flat currently — sufficient for V1.           |
| F   | **Shipping Engine**                           | `apps/api/_lib/cart/pricing.ts:85`, `apps/api/_lib/cart/service.ts:340` (weight, dimensional weight, volume, distance multiplier, location rates, free ≥₹2000/₹500)                                                    | 1 (grouped)                             | Hardcoded flat + location tables in code; `ShippingRate`, `Shipment`, `Carrier` models exist but not used for rate calculation; no zone logic in pricing path                                                                                                                          | Flat/weight/distance/zone/shop-specific/carrier/free-shipping threshold/delivery estimate. Partial exists in `calculateShipping`.                                                  |
| G   | **External Analytics (GA4/Mixpanel/PostHog)** | `apps/api/_lib/checkout/analytics.ts:75,92,96` (GoogleAnalyticsProvider stubs), `apps/api/_lib/admin/events.ts:241`, `apps/api/_lib/cart/events.ts:251`, `apps/customer/src/features/home/*:PostHog 6`, `wishlist/*:3` | 15                                      | `ConsoleAnalyticsProvider` real; `GoogleAnalyticsProvider` no-ops; internal DB analytics real and tenant-isolated                                                                                                                                                                      | Marketing funnel, attribution, session replay. Current DB analytics covers ops. External adds bundle cost, privacy, Cloudflare compat burden.                                      |
| H   | **Staff Management**                          | No schema; `Shop.ownerId @unique` → V1 single owner; `REMAINING_WORK_REGISTER` notes intentionally deferred                                                                                                            | 0 TODO (register note)                  | RBAC additive hierarchy (guest 0 → system 100) exists; `Shop` enforces single owner                                                                                                                                                                                                    | Multi-user shop teams, invitation, roles, permissions, activation, ownership transfer, audit, session scoping. Highest org-change value.                                           |
| I   | **WebSocket Realtime**                        | `apps/api/_lib/admin/events.ts:243`, `apps/api/_lib/cart/events.ts:253`                                                                                                                                                | 2                                       | `AdminEventEmitter` in-memory Map, no persistence, no DO; polling not implemented either                                                                                                                                                                                               | Admin dashboard, order/cart/inventory/notifications live. No evidence of user demand for sub-second latency in V1.                                                                 |
| J   | **Global Settings Persistence**               | `REMAINING_WORK_REGISTER P3` — commission/tax/shipping beyond in-memory; `wrangler.jsonc vars` FINANCE_COMMISSION_RATE etc, `CommissionRate` + `TaxRule` + `ShippingRate` models already exist                         | 0 TODO (register note)                  | Vars in `wrangler.jsonc` (15/50/7/100); `CommissionRate` scoped, `InventorySettings` per shop — some persisted, some in-memory; audit logged                                                                                                                                           | Commission/tax/shipping settings must survive worker restart; shop-specific vs global; audit history. Vars require redeploy today.                                                 |
| K   | **Order Timeline Retrieval**                  | `apps/api/_lib/order/service.ts:95,941`, `packages/order/src/service.ts:247,287,323,370` (persist), `packages/order/src/repository.ts` gaps, `prisma TimelineEvent` exists indexed                                     | 8+                                      | `TimelineEvent` model + `timelineService` exists; `OrderService.getOrderTimeline` returns typed empty `{events:[], totalEvents:0}`; create stubs commented in `createFromCheckout`; `packages/order` service can already query `getTimelineEvents(orderId)` — not wired to API handler | Customer/shop/admin visibility, already writing some events; retrieval is trivial query. Highest value/low cost.                                                                   |
| L   | **B2 Lifecycle/Versioning Verification**      | `FINAL_PROJECT_STATUS` external action                                                                                                                                                                                 | 0                                       | Bucket `nabome-media` live; versioning/lifecycle = owner console action                                                                                                                                                                                                                | Operational complete after console toggle; not engineering.                                                                                                                        |
| M   | **Returns/Payments Gateway Completion**       | `apps/api/_lib/returns/service.ts:416` (Razorpay refund), `packages/order/src/service.ts:278,314,325`                                                                                                                  | 4                                       | `Refund` + `ReturnRequest` models ready; `OrderService.processRefund` creates DB refund with idempotency; but `packages/order` `requestReturn`/`processRefund` still stubbed, gateway refund not called                                                                                | Full/partial return+refund flow already exists in API layer; package stubs are secondary.                                                                                          |

Plus bundled minor: Loyalty/Reviews package integration, AddressBook modals, Profile avatar dialog, PromotionalBanner dismissal storage — **not roadmap-driving** (LOW value, HIGH novelty cost).

## 5. Priority Model

Scoring 1–5 (5 highest). Qualitative priority = `VERY HIGH | HIGH | MEDIUM | LOW | DO NOT IMPLEMENT` — not mathematical.

| Workstream                                       | Customer | Shop-owner | Admin | Revenue | Operational | Risk reduction | Frequency | Qualitative   | Reasoning                                                                                                                                                                                                            |
| ------------------------------------------------ | -------- | ---------- | ----- | ------- | ----------- | -------------- | --------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K Timeline Retrieval                             | 4        | 5          | 4     | 2       | 3           | 4              | 5         | **VERY HIGH** | Every order’s explainability; support burden drops; schema + service already exist; ~10 lines of wiring unlocks customer/shop/admin visibility.                                                                      |
| J Global Settings Persistence                    | 2        | 5          | 5     | 4       | 5           | 5              | 3         | **VERY HIGH** | Financial correctness (commission/tax/shipping) must survive restart + be audited; currently vars require redeploy; `CommissionRate`/`TaxRule`/`ShippingRate` already modelled.                                      |
| D/E/F Commerce Rules Engine (promo/tax/shipping) | 4        | 5          | 3     | 5       | 3           | 4              | 5         | **HIGH**      | Directly affects grandTotal + revenue + promotions; India GST flat is okay for V1 but promo + structured shipping unlock pricing strategy. Phased: keepInlineTaxShipping V1, add Coupon wiring V1.5, full engine V2. |
| B Background Jobs                                | 2        | 3          | 4     | 3       | 5           | 4              | 4         | **HIGH**      | Reservation expiry (15-min), email, cleanup — currently synchronous; failure loses work; but V1 can stay sync + Cron for expiry.                                                                                     |
| H Staff Management                               | 2        | 5          | 4     | 3       | 4           | 4              | 3         | **HIGH**      | Single-owner blocks team shops; highest org-value after pricing; extends existing RBAC cleanly.                                                                                                                      |
| A PDF Full Rendering                             | 1        | 4          | 4     | 1       | 2           | 2              | 2         | **MEDIUM**    | Shops request printable invoices; but CSV satisfies reporting V1; Workers incompatibility forces external service/R2 worker — cost not justified yet. Keep placeholder or remove PDF UI until V2.                    |
| C Customer-Specific Pricing                      | 2        | 3          | 1     | 3       | 2           | 1              | 2         | **LOW**       | B2B/wholesale not in V1 retail thesis; adds tier model + UI + pricing branching; defer until wholesale demand proven.                                                                                                |
| I WebSocket Realtime                             | 1        | 2          | 3     | 1       | 2           | 1              | 2         | **LOW**       | Polling/SSE sufficient; DO adds cost + state + deploy complexity; no sub-second requirement evidenced.                                                                                                               |
| G External Analytics                             | 1        | 2          | 3     | 2       | 1           | 1              | 3         | **LOW**       | Internal DB analytics already real + tenant-isolated; external adds paid vendor, privacy review, bundle weight, event reliability loss.                                                                              |
| M Returns/Payments Gateway (package stubs)       | 3        | 3          | 2     | 3       | 3           | 3              | 3         | **MEDIUM**    | API layer already handles Razorpay refunds; package stubs are internal alignment, not user-facing. Finish when `packages/order` is promoted to API source of truth.                                                  |
| Frontend polish (Loyalty/Reviews/modals)         | 2        | 1          | 0     | 1       | 0           | 0              | 2         | **LOW**       | Nice-to-have; no package exists yet; defer.                                                                                                                                                                          |

**DO NOT IMPLEMENT** — Sentry (0 refs, intentionally removed — Cloudflare logs), R2 migration (B2 retained per §3), Redis (KV used where safe). Test fixtures & defensive `TODO: Implement API call` hooks are not features.

## 6. Dependency Graph

```
B2 lifecycle (L) ─── OPERATIONAL COMPLETE / OWNER ACTION (no code dep)
         │
Settings Persistence (J) ──► Commerce Rules (D/E/F) ──► Customer Pricing (C)
         │                           │
         │                           ├─► Promotion Engine (D) uses Coupon + Cart
         │                           ├─► Tax Engine (E) uses TaxRule + location
         │                           └─► Shipping Engine (F) uses ShippingRate/Carrier
         │                                    │
         │                                    ▼
         │                          Reports/Tax/Shipping reports already real
         │
Timeline (K) ──────────── independent ──► enables support + admin audit UX
         │
Background Jobs (B) ───── independent (Cron/Queue/DO) ──► enables:
         │                    ├─ reservation expiry
         │                    ├─ email (Resend already sync)
         │                    └─ analytics aggregation
         │
Staff (H) ── depends on: J (settings scoping) + RBAC ──► enables: multi-user shop ops
         │
PDF (A) ── depends on: Reports real (done) ──► optionally needs: external PDF service or R2 worker
         │
External Analytics (G) ── depends on: events (B) ──► enables: marketing funnel (no hard dep)
         │
Realtime (I) ── depends on: Events (B) + DO ──► enables: live admin/order UI (optional)
                Can be done via polling first; DO not required for V1

Commerce Rules ──► Advanced reports/analytics (already done)
Customer Pricing ──► depends on Commerce Rules (promo precedence)
```

Key: no chronological illusion — K and J can ship independently and first; D/E/F can phase independently (coupon wiring before full promo); I and G are leaves.

## 7. Phase 1 — High Value

Low-medium risk, high customer/shop value, no new infra, fits free-first.

### 1) K — Order Timeline Retrieval — VERY HIGH / LOW complexity — COMPLETED

- Why: cheapest unlock; every persona needs order explainability; support cost drops; retention risk if invisible.
- Users: Customer (track), Shop owner (support), Admin (governance).
- Dependencies: none (TimelineEvent + timelineService exist).
- Complexity: LOW (DB query + API wiring + UI list).
- Status: COMPLETED — indexed retrieval + write path + pagination + tenant isolation + customerVisible filtering + shop/admin endpoints.

### 2) J — Global Settings Persistence — VERY HIGH / MEDIUM

- Why: financial correctness; vars redeploy is risky; `CommissionRate`/`TaxRule`/`ShippingRate`/`InventorySettings` already exist — just scope + UI.
- Users: Admin (platform), Shop owner (shop-specific).
- Dependencies: none.
- Complexity: MEDIUM (DB table vs KV decision, audit, scope).

### 3) D/E/F — Commerce Rules Engine (phased: coupon wiring + keep inline tax/shipping) — HIGH / MEDIUM

- Why: revenue + promotions; Coupon model unused today; wiring it is small but unlocks discount strategy.
- Users: Shop owner, Customer, Finance.
- Dependencies: J (rate source).
- Complexity: MEDIUM (see phased V1.5).

### 4) B — Background Jobs (lightweight: Cron for reservation expiry + in-memory DLQ log) — HIGH / MEDIUM

- Why: 15-min `StockReservation.expiresAt` today has no sweeper; expiry correctness reduces oversell.
- Users: Platform operator, Shop owner.
- Dependencies: none.
- Complexity: MEDIUM (Cron Trigger + idempotent sweeper; Queues optional later).

## 8. Phase 2 — Core Platform Expansion

Requires deeper architecture / schema / multi-user.

### 5) H — Staff Management — HIGH / HIGH

- Domains: invitation, membership, roles, permissions, activation/deactivation, ownership transfer, audit, session scoping — extends additive RBAC.

### 6) D/E/F — Full Promotion/Tax/Shipping Engines — HIGH / HIGH

- Promotion: percentage/fixed, min order, product/category/shop restriction, usage limits, customer limits, date windows, stacking, coupon compat, refund compat.
- Tax: jurisdictions, inclusive/exclusive, tax classes, shop/customer/shipping location, exemptions, invoice lines — evaluate if India-only 18% is insufficient → then external provider (e.g., Avalara) is external dependency.
- Shipping: flat, weight, dimensional weight, volume, distance/zone, shop-specific, carrier, free threshold, estimates — migrate hardcoded `calculateShipping` to `ShippingRate`+`Carrier` DB.

### 7) M — Returns/Payments Gateway Completion (package alignment) — MEDIUM / MEDIUM

- Finish `packages/order` `requestReturn`/`processRefund` + Razorpay refund call parity with `apps/api/_lib/returns/service.ts:416`.

### 8) A — PDF Full Rendering (if demand proven) — MEDIUM / MEDIUM

- Requires external service or R2-based worker; otherwise remove PDF UI and keep CSV.

## 9. Phase 3 — Advanced / Optional

### 9) I — WebSocket Realtime — LOW / HIGH

- Polling/SSE first; DO only if admin needs sub-second order feed. Not justified by current workflows.

### 10) G — External Analytics — LOW / MEDIUM

- GA4/Mixpanel/PostHog push — keep internal DB; revisit only if marketing demands attribution not satisfiable internally.

### 11) C — Customer-Specific Pricing Tiers — LOW / HIGH

- Wholesale/retail/Volume/shop-specific — defer until B2B demand; requires new model + cart branching.

### 12) Frontend polish (Loyalty/Reviews/modals/banner storage) — LOW / LOW

- Implement when `@nabome/loyalty`/`@nabome/reviews` packages exist; not roadmap-driving.

## 10. V1 Scope

**CURRENT V1 — SHIPPED f46a780** — what NABOME is:

- Catalog, cart (server-price, no client trust), checkout (transactional), orders (state machine), inventory (reservation/decrement), payments (Razorpay signature/idempotency/replay), shipments, multi-shop tenant isolation, auth (JWT httpOnly + CSRF + requireAuth + requireShopAccess), RBAC additive, KV rate limit, B2 media, Resend, Turnstile, reports/analytics (real DB, CSV, text PDF placeholder), admin audit/sessions/RBAC/permissions, cart sync, wishlist bulk, newsletter throttled, checkout events internal.

Success = `No production blockers + No fake production behavior + Clear product roadmap + Features implemented according to business value` — **not 96→0**.

## 11. V1.5 Scope

High-value / low-medium risk — recommended next 1–2 quarters:

- K Timeline Retrieval
- J Settings Persistence (KV for ephemeral/session + DB for financial)
- D (Coupon wiring) — percentage/fixed/free-shipping + minOrder + date window + usage limits
- B Cron sweeper for `StockReservation` expiry + DLQ log
- Keep tax/shipping inline (E/F V1) — formalize to engines later

## 12. V2 Scope

Core platform expansion — after V1.5 proven:

- H Staff Management (multi-user shop teams)
- D/E/F Full engines (promo stacking, tax jurisdictions/classes, shipping zones/carrier)
- A Full PDF (external service) or explicitly remove PDF UI
- M Package parity
- Re-evaluate I/G/C only on demand signal

## 13. Top 5 Recommended Next Features

### 1. K — Order Timeline Retrieval — VERY HIGH — COMPLETED

- Why now: smallest effort, largest trust/support payoff; schema + service already built; unblocks admin governance UX.
- Business value: 5/5 (support cost, retention).
- Technical risk: LOW (no migration, idempotent read).
- Dependencies: none.
- Expected user impact: HIGH (customer + shop + admin daily).
- Status: COMPLETED.

### 2. J — Global Settings Persistence — VERY HIGH

- Why now: financial integrity; redeploy-on-change is operational debt; models already exist.
- Business value: HIGH (revenue + correctness).
- Technical risk: MEDIUM (KV vs DB semantics, audit history).
- Dependencies: none; enables D/E/F.
- Impact: HIGH (admin + shop owner).

### 3. D/E/F — Commerce Rules Engine (coupon wiring phase) — HIGH

- Why now: directly monetizable; Coupon model sits unused; incremental slice avoids big-bang engine.
- Business value: HIGH (promotions drive conversion).
- Risk: MEDIUM (coupon validation + idempotency).
- Dependencies: J.
- Impact: HIGH (shop owner + customer, every checkout).

### 4. B — Background Jobs (Cron sweeper) — HIGH

- Why now: reservation expiry correctness prevents oversell; synchronous email is okay but sweeper is not — gap today.
- Business value: MEDIUM (ops) + risk reduction HIGH.
- Risk: MEDIUM (Cron idempotency, Workers limits).
- Dependencies: none.
- Impact: MEDIUM (platform operator, shop).

### 5. H — Staff Management — HIGH

- Why now: top org-change value after pricing; but sequenced after pricing/settings so permissions can be scoped correctly.
- Business value: HIGH (unlocks team shops).
- Risk: HIGH (RBAC extension, ownership transfer, session).
- Dependencies: J + RBAC.
- Impact: HIGH (shop owner — changes how shops operate).

## 14. Features Intentionally Deferred

Keep deferred — do not build in next cycle unless demand signal:

- **A Full PDF rendering** — Workers-incompatible Node libs; text placeholder is explicit; CSV meets V1 reporting; revisit V2 with external service if shops demand printable invoices (see §9).
- **G External Analytics (GA4/Mixpanel/PostHog)** — internal DB analytics is real, private, free, tenant-isolated; external adds cost/privacy/bundle/reliability cost.
- **I WebSocket Realtime** — polling/SSE satisfies admin/order/cart inventory; DO cost not justified.
- **C Customer-Specific Pricing** — no B2B thesis yet; volume tiers already in `CartService`.
- **Frontend polish** (Loyalty/Reviews package, AddressBook modals, PromotionalBanner localStorage, wishlist PostHog) — LOW value until packages exist.

## 15. Features That Should Not Be Implemented

### DO NOT IMPLEMENT

| Item             | Reason                                                                                                                                                           | Current State                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Sentry**       | Explicitly prohibited per register & FINAL_PROJECT_STATUS; Cloudflare/application logs are primary visibility; 0 refs, 0 deps, 0 secrets — intentionally removed | 0 refs verified; do not reintroduce |
| **R2 migration** | B2 `nabome-media` retained per §3; s3.us-east-005.backblazeb2.com configured; no benefit to migrate — cost + migration risk with no feature gain                 | NOT DONE — by design                |
| **Redis**        | KV used where safe (rate limit); Hyperdrive+Neon pooled + KV suffices; no cache coherence need requiring Redis                                                   | NOT USED — by design                |

Also not work: **test fixtures** (`TODO: Mock database call` 7 occurrences) and **defensive `TODO: Implement API call`** hooks in `packages/customer/src/hooks.ts` (15) — client placeholders where API already exists; not engineering work. Do not count toward progress.

## 16. Infrastructure Strategy

| Concern    | Recommendation                                                          | Reason                                                                   |
| ---------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Compute    | Cloudflare Pages + Functions (Hono) — keep                              | Verified prod+staging, Compiled Worker 141 files, `nodejs_compat`        |
| DB         | Neon pooled via Hyperdrive v3 — keep                                    | Pooled AP, 2 migrations, PITR daily — sufficient                         |
| KV         | Keep for rate limit + ephemeral settings/cache                          | 3 namespaces verified; no Redis needed                                   |
| Storage    | B2 — keep; no R2                                                        | External verification only B2 lifecycle/versioning — bucket already live |
| Jobs       | Cron Triggers for sweepers; Queues/DO only if needed later              | Synchronous today; Cron is free, serverless, fits NABOME free-first      |
| Realtime   | Polling / short polling first; SSE if needed; DO only if Phase 3 demand | DO adds cost/state; not justified now                                    |
| Monitoring | Cloudflare runtime/application logs — keep; no Sentry                   | Explicitly prohibited; do not add                                        |
| Secrets    | `wrangler pages secret put` via stdin — keep 15+                        | Verified encrypted, never in repo/jsonc                                  |

Paid infra gate: new paid service only if `existing infra + open-source + serverless` cannot satisfy.

## 17. Database Strategy

- **Existing models sufficient for Phase 1:** `TimelineEvent` (retrieve), `CommissionRate`/`TaxRule`/`ShippingRate`/`InventorySettings`/`Shop` (settings), `Coupon`/`CheckoutSession` (promo), `StockReservation` (sweeper). No new model for K/J/B-Phase-1.
- **New model required for H (staff):** `ShopMember` / `ShopInvitation` (shopId, userId, role, invitedBy, status, createdAt), unique [shopId,userId], index [userId]. Requires migration + backfill single-owner → member. See §24 HIGH.
- **New model deferred for C (pricing tiers):** `CustomerPricingTier` + `CustomerTierMembership` — not V1.
- **Indices:** timeline `[orderId, occurredAt]` already exists; settings scoped `[shopId, effectiveFrom]` already exists.
- **Historical migration:** ownership → membership backfill; commission snapshot per order already preserved (`Order.commissionSnapshot`) — never retroactive.

## 18. API Strategy

- **New endpoints (Phase 1):** `GET /api/v1/orders/:id/timeline` (auth + shop/customer scope, paginated), `GET/PUT /api/v1/settings` (admin global + shop-scoped; requireShopAccess or admin), `POST /api/v1/coupons/validate` + wire `couponCode` into `CartService`/`CartPricingService`.
- **Modifications:** `GET /api/v1/cart/totals` already location-aware — pass through to persisted `TaxRule`/`ShippingRate`; `GET /api/v1/reports/:type?format=csv|pdf` keep PDF placeholder with `Note:` header until full rendering or remove `pdf` option.
- **Auth:** requireAuth on all settings/timeline; requireShopAccess on shop-scoped writes; admin-only on global commission.
- **Backward compat:** additive fields; PDF `Content-Type: application/pdf` retains placeholder Buffer — no contract break.
- **Webhooks/rate limit:** existing Razorpay webhook + KV rate limit unchanged.

## 19. Frontend Strategy

| App      | Impact                                                                            | Pages/Components                                                                                                                                                   | State/UX                                                   |
| -------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Customer | K Timeline (HIGH), D coupon input (MEDIUM)                                        | Order detail → Timeline list (orderCreated→delivered), Cart → coupon field + discount line                                                                         | Loading/empty (no events yet) + error + tenant empty state |
| Shop     | K Timeline (HIGH), J Settings (HIGH), D Coupon admin (MEDIUM), B job status (LOW) | Shop Orders → timeline drawer; Settings → Commission/Tax/Shipping forms + audit link; Reports → keep CSV, PDF button `disabled` with tooltip or text note until V2 | Form validation, optimistic update, error boundary         |
| Admin    | J Global settings (HIGH), H Staff (V2)                                            | Admin → Settings + Staff invitations, Orders → timeline + audit                                                                                                    | RBAC-gated, pagination, `hasMore`                          |

Frontend work is bounded — no realtime bundle yet; PostHog/GA snippet not added (avoids bundle impact).

## 20. Security Strategy

Per workstream:

| Workstream     | Auth                 | AuthZ / Tenant                                                             | Financial integrity                                                                               | Audit                               | Rate limit             |
| -------------- | -------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------- |
| K Timeline     | requireAuth          | shopId in ownedShopIds OR userId===order.userId; customerVisible filter    | read-only                                                                                         | log reads for admin                 | public limiter on list |
| J Settings     | requireAuth          | admin for global, requireShopAccess for shop                               | snapshot per order, no retroactive rate                                                           | logger+LoginHistory actor/action/IP | admin burst limit      |
| D/E/F Commerce | requireAuth for cart | shop isolation on rate lookup                                              | server-side price only (no client trust), Decimal-safe, coupon idempotent, stacking deterministic | finance record                      | checkout/cart limiter  |
| B Jobs         | system cron secret   | —                                                                          | idempotent sweeper, no double-release                                                             | emitted                             | —                      |
| H Staff        | requireAuth          | requireShopAccess via membership, ownershipTransfer requires owner+confirm | settlement payout scoping via membership                                                          | audit membership changes            | invite limiter         |

No new data exposure if tenant isolation preserved (verified: `getOwnedShopIds→shopId in []`, no bare `findUnique`).

## 21. Testing Strategy

- **K:** unit on `getOrderTimeline` (empty + with events + tenant denied), integration via `prisma.timelineEvent` seed, E2E order create → timeline shows `order_created`.
- **J:** unit on rate resolution (scope precedence platform→category→shop), integration on `CommissionRate` versioned lookup, security test on cross-shop write denied.
- **D:** unit on coupon validation matrix (min order, product/category/shop, usage limits, date window, stacking cap), integration on `calculateCartTotals` with coupon, security on tenant isolation.
- **B:** unit on sweeper idempotency (expired→released once), integration on `StockReservation` expiry → availableStock unchanged but reserved released.
- **H:** unit on invite→accept→permission check, isolation test wrong shop denied, ownership transfer 2-step.
- Keep existing gates: format PASS, lint 0 errors (warnings non-blocking), typecheck, 84+53+121 unit, integration (checkout/catalog/health), 20+ security, 4 E2E, build 288kB.

## 22. Performance Strategy

| Workstream     | DB queries                                     | Request duration | Bundle | Cache                     |
| -------------- | ---------------------------------------------- | ---------------- | ------ | ------------------------- |
| K Timeline     | 1 indexed query `[orderId, occurredAt]`        | <50 ms           | ~0     | KV optional 60s per order |
| J Settings     | 1 lookup per request (or KV)                   | <20 ms           | ~0     | KV for hot rates (TTL 5m) |
| D/E/F Commerce | +1 coupon +1 rate per totals                   | +10–30 ms        | ~0     | KV rate cache             |
| B Jobs         | Cron 1 sweep `status=active AND expiresAt<now` | cron 5m          | 0      | —                         |
| H Staff        | +1 membership lookup per shop route            | +5 ms            | ~0     | —                         |

No Redis needed. Aggregation already avoids N+1 (reports/analytics). Workers limits respected: no new DO/KV hot loop.

## 23. Cost / Free-First Strategy

| Workstream           | Existing infra?                            | Paid?                                  | Open-source alt                                | Verdict                                                                                |
| -------------------- | ------------------------------------------ | -------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| K Timeline           | Neon+Hyperdrive                            | No                                     | —                                              | FREE — uses existing table                                                             |
| J Settings           | Neon or KV                                 | No                                     | —                                              | FREE — KV or DB table later                                                            |
| D Coupon wiring      | Neon                                       | No                                     | —                                              | FREE — model exists                                                                    |
| B Cron sweeper       | Cloudflare Cron                            | No (free tier)                         | —                                              | FREE                                                                                   |
| H Staff              | Neon                                       | No                                     | —                                              | FREE                                                                                   |
| A Full PDF           | **Requires external service or R2 worker** | Potentially paid (PDF service, R2 ops) | `pdf-lib` Workers-compatible pure-JS (limited) | DEFER — evaluate `pdf-lib` vs external; if not Workers-compatible at quality, keep CSV |
| G External analytics | Internal DB vs paid vendor                 | Yes (GA/Mixpanel/PostHog)              | Plausible/Umami self-host, but adds ops        | KEEP DEFERRED — internal DB suffices                                                   |
| I WebSocket          | Polling vs DO (paid beyond free)           | DO cost                                | —                                              | KEEP DEFERRED                                                                          |
| C Pricing tiers      | Neon                                       | No                                     | —                                              | DEFER (no demand)                                                                      |

All Phase 1 fits `existing infra + open source + serverless` on Cloudflare/Neon/B2 — no new paid infrastructure.

## 24. Migration Risk

| Workstream                    | Risk          | Why                                                                                                                                        |
| ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| K Timeline Retrieval          | **NONE**      | Read-only; no schema change; events already written; empty-state safe.                                                                     |
| J Global Settings Persistence | **LOW**       | New scope resolution; vars → DB/KV cutover is additive; snapshot preserves history; no backfill of existing orders.                        |
| D Coupon wiring (Phase1)      | **LOW**       | Additive to pricing; no schema change; coupon table already exists.                                                                        |
| B Cron sweeper                | **LOW**       | Idempotent `UPDATE status=released WHERE status=active AND expiresAt<now`; no inventory double-release if guarded.                         |
| H Staff Management            | **HIGH**      | New `ShopMember` + `ShopInvitation` tables; backfill single owner; RBAC middleware change; ownership transfer edge cases; session scoping. |
| D/E/F Full engines            | **MEDIUM**    | Depends on J+H; rate logic change touches every `grandTotal`; requires thorough discount/tax/shipping matrix testing.                      |
| A Full PDF                    | **MEDIUM**    | External service or R2 worker = new deployment + failure mode; or UI removal = no risk.                                                    |
| C Pricing tiers               | **HIGH**      | Branching `CartService` pricing; tier precedence vs coupon stacking; new indexes.                                                          |
| I WebSocket                   | **VERY HIGH** | DO state, hibernation, fan-out, auth — major complexity for LOW value.                                                                     |
| G External analytics          | **MEDIUM**    | Frontend bundle + event reliability + privacy review.                                                                                      |

## 25. Acceptance Criteria

### K — Order Timeline Retrieval — COMPLETED

- [x] `TimelineEvent` retrieval by `orderId` ordered `occurredAt ASC`, paginated
- [x] Tenant isolation: shop sees own orders, customer sees own, admin explicit `shopId` or all with auth
- [x] `customerVisible` filter respected
- [x] `GET /api/v1/orders/:id/timeline` returns `{orderId, events:[], totalEvents, limit, offset, hasMore}` (+ shop/admin variants)
- [x] UI: Customer order detail already wired (loading/empty/error), shop/admin stores enhanced
- [x] Events already emitted on `order_created` / `status_changed` are persisted (fix `TODO: Create timeline event` in `createFromCheckout` + transition + cancel + note)
- [x] Tests: api 84/84 + 121 customer + 53 package PASS, typecheck/lint/build PASS, no Sentry, no migration

### J — Global Settings Persistence

- [ ] Commission/tax/shipping settings survive worker restart
- [ ] Shop-specific vs global scoping (`CommissionRate.scope` + `shopId`, `TaxRule.applicableRegions`, `ShippingRate.applicableRegions`)
- [ ] KV vs DB decision documented; KV for ephemeral cache, DB for financial source of truth
- [ ] Admin UI to read/update with validation
- [ ] Audit log on change (actor/action/timestamp/IP via `logger`+`LoginHistory`)
- [ ] `Order.commissionSnapshot` still frozen at order time — no retroactive apply
- [ ] Rate resolution covered by tests (platform < shop < category precedence)

### D/E/F — Commerce Rules Engine (Phase-1 coupon wiring)

- [ ] Server-side `calculateDiscountTotal` uses `Coupon` (percentage/fixed/free-shipping)
- [ ] Validation: `isActive`, `validFrom/Until`, `minOrderAmount`, `maxUses>usedCount`, `maxDiscount` cap
- [ ] Product/category/shop restriction if `Coupon` extended (V1.5: code + type + value only)
- [ ] `CheckoutSession.couponCode` → `Order.couponCode` persisted; `discountTotal` on `Order`
- [ ] Stacking: single coupon V1 (no stacking), cap 50% already in `CartService`
- [ ] Refund compatibility: refund prorated if discount applied
- [ ] Shop isolation: coupon usable only if applicable to shop
- [ ] Tests: coupon matrix + isolation

Full D/E/F (V2) adds: stacking rules, customer limits, tax-inclusive vs exclusive + tax classes + exemptions, shipping zones + carrier integration.

### B — Background Jobs

- [ ] Cron Trigger sweeper: `StockReservation` `active && expiresAt < now` → `released` + `releasedAt` + `StockMovement type=release`
- [ ] Idempotent (re-run safe, no double release)
- [ ] DLQ / retry log (console → structured log, not Sentry)
- [ ] No queue table V1; Cloudflare Queues evaluated only if email/report burst demands
- [ ] Monitoring via Cloudflare logs

### H — Staff Management

- [ ] Invite by email + accept flow
- [ ] `ShopMember` membership with roles (owner, manager, staff) mapped to existing RBAC
- [ ] `requireShopAccess` extended to check membership, not just `ownerId`
- [ ] Activation / deactivation
- [ ] Ownership transfer (2-step confirm)
- [ ] Audit of member changes
- [ ] Session management per member

### A — PDF Full Rendering (if implemented V2)

- [ ] Workers-compatible rendering (e.g., `pdf-lib` pure JS) or external service identified with cost approved
- [ ] Shop-isolated, date-filtered, Decimal-safe — same as CSV
- [ ] `Content-Type: application/pdf` + `Content-Disposition`
- [ ] If not implemented: PDF button removed or disabled with "CSV available" — no placeholder shipped as real PDF

### G/I/C — Deferred (no acceptance until prioritized)

- No criteria — keep deferred; revisit on demand signal.

## 26. Recommended Implementation Order

Explicit order — not P2/P3 label order — justified by value, risk, and dependencies.

```
01. K — Order Timeline Retrieval — COMPLETED
    Why first: zero deps, ~1 query, schema exists, unblocks trust/support for all personas; proves `TimelineEvent` write path works.
    Risk NONE, enables no one but benefits everyone.
    Status: COMPLETED — 7e750a2 → timeline-retrieval.

02. J — Global Settings Persistence
    Why second: financial operational debt (vars redeploy) is next highest risk; already modelled; enables D/E/F correctly.
    Risk LOW, enables Commerce.

03. D — Promotion Engine (coupon wiring slice)
    Why third: monetizable slice of Commerce; Coupon model exists; thin vertical slice avoids big-bang engine; depends on J for rate source clarity.
    Risk LOW, depends on J.

04. B — Background Jobs (Cron sweeper for StockReservation expiry)
    Why fourth: correctness gap (15-min reservation has no sweeper today); Cron is free and isolated; can run in parallel with 03.
    Risk LOW, independent.

05. M — Returns/Payments Gateway Completion (package alignment)
    Why fifth: API layer already correct; package stubs are gap to close before promoting `packages/order` as source of truth; low user impact if left stubbed.
    Risk LOW, independent.

06. H — Staff Management
    Why sixth: highest org value but sequenced after J (settings scope) and pricing so permissions are scoped right; HIGH risk so later.
    Risk HIGH, depends on J+RBAC.

07. E/F — Tax & Shipping Engines (full)
    Why seventh: full jurisdictions/zones/carrier formalization after coupon proven and staff scoping stable; inline logic suffices until then.
    Risk MEDIUM–HIGH, depends on J.

08. A — PDF Full Rendering (or remove PDF UI)
    Why eighth: only if shop demand proven; otherwise remove button and keep CSV — explicit decision point.
    Risk MEDIUM (infra), depends on Reports.

09. G — External Analytics (GA4/PostHog)
    Why ninth: leaf; no hard dep; internal DB is superior for privacy/cost; only if marketing demands attribution not satisfiable internally.
    Risk MEDIUM, depends on events.

10. I — WebSocket Realtime (polling first)
    Why tenth: leaf, VERY HIGH complexity for LOW value; polling/SSE first; DO only on proven sub-second need.

11. C — Customer-Specific Pricing Tiers
    Why last: no B2B thesis; keep deferred until wholesale demand; HIGH branching cost.

12. L — B2 Lifecycle/Versioning — EXTERNAL OWNER ACTION
    Not engineering ordered; do via Backblaze Console → nabome-media → Lifecycle/Versioning now (non-blocking).
```

Re-ranking explanation: P3 `K Timeline` outranks P2 `Customer Pricing` and `External Analytics` because value×frequency×risk favors it (register P2/P3 is technical maturity, not business priority). Similarly `J Settings` outranks `B Queue` despite both P2/P3 because financial correctness > operational nicety.

## 27. Final Recommendation

Build **Phase 1 (K→J→D-coupon→B-sweeper) now** — all fit free-first, no new infra, no migration risk, and close the highest support/financial/revenue gaps. **Phase 2 (H + full D/E/F)** next quarter only after Phase 1 proves stable. **Keep Phase 3 (I, G, C, full PDF)** explicitly deferred — success is not `96→0` but `0 P0 + 0 P1 + no fake behavior + clear roadmap + features shipped by business value`. Do not reintroduce Sentry/R2/Redis; do not chase TODO count; ship the five above, measure, then decide.

---

Verified: No source files changed · No database changes · No migrations · No package installation · No deployment · No environment changes · `docs/ROADMAP.md` created · 96 TODOs grouped into 11 workstreams + 1 operational · Dependencies mapped · Value/complexity/infra/security/cost assessed · Top 5 + V1/V1.5/V2 defined · Deferred & Do-Not-Implement identified.
