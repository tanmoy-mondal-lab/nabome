# Known Limitations — নবME (Nabome) v1.0.0

**Last Updated:** 2026-07-08
**Status:** Documented limitations for production awareness

---

## Functional Limitations

### Payments
- **Single gateway only:** Razorpay is the only payment provider. No PayPal, Stripe, or COD (beyond what Razorpay offers).
- **INR only:** All transactions in Indian Rupees. No multi-currency support.
- **Refund timing:** Admin-initiated refunds marked "completed" before Razorpay async confirmation — may show incorrect status briefly.
- **No saved payment methods:** Customers must enter card details every checkout. No card-on-file / tokenization.
- **No subscription billing:** Subscription models exist in schema but no active subscription payment flows.

### Customer Experience
- **No infinite scroll:** Product listing uses page-number pagination (not infinite scroll).
- **No back-in-stock notifications:** Out-of-stock items have no "Notify me" feature.
- **No order editing:** Orders cannot be modified after placement (no add/remove items, no address change).
- **No guest checkout with email verification:** Guest profiles created with `emailVerified: true` — potential account collision.
- **Abandoned cart recovery:** Cart listing exists in admin but no automated recovery emails/SMS.
- **Stock reservation:** Reserved stock is never released for abandoned checkouts. No TTL/cron cleanup.
- **No order tracking on customer portal:** Basic order history exists but no real-time tracking.

### Admin
- **Missing admin modules:** `currencies/` and `subscriptions/` directories are empty (no implementation).
- **Support ticket detail page:** Functional but lacks file attachments and assign/unassign workflow.
- **Marketing page:** No frontend UI — backend API exists only.
- **Search index:** In-memory only, resets on every Worker restart. Requires manual rebuild.
- **Gift cards/Loyalty/Referrals:** Minimal admin UIs. Heavy `any` types, no pagination, basic CRUD only.
- **Campaigns:** No analytics, no A/B testing, no audience targeting.
- **Analytics:** No CSV/PDF export, no date range comparison, no custom date picker.

### Internationalization (i18n)
- Bengali font support (Noto Serif Bengali) exists in the design system
- i18next library is installed (v26) with English, Bengali, Hindi locales in `src/lib/i18n/`
- **Actual translation coverage is minimal** — most UI text remains in English

### Mobile
- **Bottom toast overlap:** Toast notifications can overlap bottom navigation on mobile (P1-019).
- **MobileNav wishlist link:** Links to Collections instead of wishlist (P1-021) — UX bug.

---

## Technical Limitations

### Performance
- **13.6s TTFB on cold start:** No Hyperdrive (150-500ms per-request penalty), no Smart Placement. First request after idle is very slow.
- **No Hyperdrive:** Database connections go through Neon pooler directly, adding latency.
- **Unbounded queries:** Analytics and export endpoints have no pagination/limits — risk OOM at scale.
- **N+1 not fully eliminated:** Order cancellation refactored but other query paths may still have N+1.
- **No query result caching:** Beyond HTTP-level caching on CMS and product endpoints.

### Infrastructure
- **No error monitoring:** No Sentry, DataDog, or similar. Errors only visible in Cloudflare logs.
- **No structured logging:** No request ID propagation across services. `crypto.randomUUID()` used per-request but not in a structured format.
- **No staging environment:** Only `production` and `main` branches. PR deployments via Cloudflare preview.
- **No feature flags system:** `FEATURE_FLAGS_KV` namespace exists but no frontend/API toggle framework.
- **No rollback mechanism:** Database rollback scripts exist but no automated deployment rollback.
- **KV dependency for rate limiting:** If `RATE_LIMIT_STORE` KV binding is missing, all requests get 429 (fail-closed).

### Security
- **JWT in localStorage:** Auth tokens accessible to JavaScript — XSS vulnerability (CVSS 8.5).
- **95+ `as never` casts:** Type safety bypasses throughout the codebase.
- **~300 `any` type usages:** Weak typing in critical paths (admin data fetching, webhook processing).
- **Inconsistent input validation:** Zod schemas defined for only ~30% of handlers. 70% use manual `req.json()` + ad-hoc checks.
- **CSP `unsafe-inline`:** Required for React SPA hydration. Weakens XSS defense.
- **CSRF exempt on `/api/contact`:** Public POST endpoint without CSRF (mitigated by Turnstile + 3/hr rate limit).
- **Turnstile not on all auth endpoints:** Missing on `/auth/verify-reset-code` and `/auth/reset-password`.

### Database
- **Missing indexes on `orders.razorpay_order_id` and `orders.razorpay_payment_id`:** Full table scans on every webhook event.
- **No cart expiration:** Abandoned carts accumulate unboundedly. No cleanup job.
- **14 models lack `updatedAt`:** `InventoryAlert`, `ProductImage`, `ProductAttribute`, etc.
- **Coupon per-user limit race condition:** READ COMMITTED isolation allows bypass.
- **Razorpay API inside DB transaction:** External API call inside `prisma.$transaction` — orphan risk.
- **Singleton Prisma client:** Shared across all requests on the same isolate. Fine with current adapter but prevents request-scoped customization.
- **Webhook payload stored as raw JSON:** `event as never` cast in `WebhookEvent.payload` — no type validation.

### Code Quality
- **Monolithic handlers:** `auth.ts` (1,194 lines), `payments.ts` (1,058 lines), admin API client `admin.ts` (399 lines).
- **String-based action dispatch:** No typed route-to-handler mapping.
- **No barrel exports for many components:** Deep import paths in admin modules.
- **Manual form state management:** No form library (React Hook Form, Formik) — verbose `useState` with manual validation.
- **Duplicated API client code:** `callRazorpay` in `payments.ts` and `createRazorpayOrder` in `checkout.ts` are virtually identical.

---

## Business Limitations

- **Single brand only:** Not a marketplace (no multi-vendor / seller workflows). This is expected for D2C.
- **India-focused:** INR currency, Indian address format, Razorpay payment. Not localized for other markets.
- **No loyalty/rewards program:** Schema exists (`LoyaltyPoints`, `LoyaltyTier`) but no active customer-facing program.
- **No referral program:** Schema exists (`ReferralCode`, `Referral`) but no active referral flow.
- **No gift cards:** Schema exists (`GiftCard`) but no purchase/redeem flow.
- **No multi-language support:** i18n library installed, translations minimal. English-only for most UI.

---

## Known Bugs (Verified)

| ID | File | Bug | Severity |
|----|------|-----|----------|
| B1 | `src/admin/auth/AuthActivityPage.tsx:299` | CSS typo: `textneutral-600` should be `text-neutral-600` | Low |
| B2 | `src/admin/labels/LabelsPage.tsx:90` | `"color" in item` always false for TagItem | Low |
| B3 | `src/admin/feature-flags/FeatureFlagsPage.tsx:3` | Import path escapes `src/` | Medium |
| B4 | `src/admin/loyalty/LoyaltyPage.tsx:44` | Uses `prompt()` for point adjustment | Low |
| B5 | `src/admin/campaigns/CampaignsPage.tsx:145` | Non-standard CSS class `btn-primary` | Low |
| B6 | `src/admin/auth/AuthActivityPage.tsx:249` | Fragile `as Record<string, unknown>` | Low |

---

## Dependency on External Services

| Service | Dependency | Fallback if Down |
|---------|-----------|-----------------|
| Supabase Auth | Login, registration, JWT verification | Site is read-only (no auth) |
| Neon (PostgreSQL) | All data | Complete outage |
| Razorpay | Payments | Cannot process orders |
| Cloudinary | Images, media | Broken images (has fallback placeholder) |
| Resend | Transactional emails | No email delivery |
| Cloudflare KV | Rate limiting, feature flags | Rate limiting fails closed (all 429); feature flags assume defaults |
| Cloudflare Pages | Hosting, Workers | Complete outage |

---

## Capacity & Scaling Limits

| Resource | Limit | Impact at Scale |
|----------|-------|-----------------|
| Neon free tier | 500 connections, 0.5vCPU, 1GB RAM | Will throttle under load |
| Cloudflare Workers | 10ms CPU per request, 128MB memory | Complex DB queries may timeout |
| Razorpay | Standard API rate limits | Payment failures under high order volume |
| Cloudinary free tier | 25GB storage, 25GB bandwidth/month | Will exhaust with high-res product images |
| KV free tier | 1GB storage, 10M reads/month | Rate limiting counters may exceed |

> **Note:** Current deployment uses free/development tiers for all services. Production launch MUST upgrade Neon (at least Scale tier), Cloudinary (at least Advanced plan), and Resend (at least Growth plan).
