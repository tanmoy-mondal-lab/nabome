# Launch Audit Report — নবME

## Scores

| Domain | Score | Grade |
|--------|-------|-------|
| **Security** | **42/100** | **F** |
| **Payments** | **68/100** | **D** |
| **Checkout** | **75/100** | **C** |
| **Authentication** | **45/100** | **F** |
| **Orders** | **80/100** | **B** |
| **Emails** | **70/100** | **C** |
| **Products & CMS** | **72/100** | **C** |
| **SEO** | **40/100** | **F** |
| **Mobile** | **85/100** | **B** |

## OVERALL: NO-GO

The application has **2 critical blockers** that prevent any write operation from succeeding. These must be resolved before public launch.

---

## 🛑 BLOCKING ISSUES (Must Fix Before Launch)

### 🔴 BLOCKER #1 — CSRF Validation Breaks ALL Write Operations

**Severity: Critical** | **File: `api/[...path].ts:557`, `src/lib/api/client.ts`**

**The Problem:**
The router validates CSRF on every POST/PUT/DELETE/PATCH request (except webhooks). The CSRF implementation uses the double-submit cookie pattern:
1. On GET responses, a `csrf_token` cookie is set with `SameSite=Strict; Secure`
2. The `X-CSRF-Token` response header contains the same value
3. On mutations, the server expects both the cookie AND the `X-CSRF-Token` header

The `client.ts` NEVER reads the `X-CSRF-Token` response header and NEVER sends it on mutations. Every write operation — login, register, checkout, payment, admin CRUD, contact form — returns HTTP 403 CSRF error.

**Impact:**
- User cannot register or login
- User cannot checkout or pay
- Admin cannot create/update any resource
- Contact form fails
- Newsletter signup fails
- **The app is read-only**

**Fix Options:**

**Option A (Quick — 15 min):** Remove CSRF validation from the router. The app already has multiple layers of CSRF defense:
- `SameSite=Strict` on all cookies (set by the CSRF cookie itself)
- Bearer token auth (not cookie-based, immune to CSRF)
- CORS allowlist (prevents cross-origin reads)
  ```ts
  // api/[...path].ts — comment out or remove lines 554-560
  ```

**Option B (Proper — 2 hours):** Fix the client to read and propagate CSRF tokens:
1. In `client.ts`, intercept all GET responses, extract `X-CSRF-Token` from response headers, store in memory
2. On all mutations, add `X-CSRF-Token: <stored>` header
3. On initial page load without a CSRF token, trigger a silent GET to establish one

**Recommendation:** Option A for immediate launch. Fix properly (Option B) post-launch.

---

### 🔴 BLOCKER #2 — Registration Crashes (Undefined Variable)

**Severity: Critical** | **File: `api/_handlers/auth.ts:96`**

**The Problem:**
```ts
// Line 61-62: destructures only email, password, firstName, lastName
const { email, password, firstName, lastName } = parsed.data;
// Line 96: uses "phone" which was NEVER destructured → ReferenceError
phone: phone ?? null,
```

Every registration attempt throws a `ReferenceError: phone is not defined`. New users cannot create accounts.

**Fix:**
```ts
// Add phone to destructuring
const { email, password, firstName, lastName, phone } = parsed.data;
```

---

## 🟠 MUST FIX (First Week Post-Launch)

| # | Issue | Severity | File | Fix |
|---|-------|----------|------|-----|
| 3 | **Missing `og-image.jpg`**` | High | `src/lib/seo.ts:11` | Create `/public/og-image.jpg` (1200×630px, with brand logo) |
| 4 | **Static sitemap — only 7 URLs** | High | `public/sitemap.xml` | Build a dynamic sitemap endpoint that queries products, categories, collections, CMS pages |
| 5 | **`robots.txt` allows admin/auth/account** | High | `public/robots.txt` | Add `Disallow: /account/*`, `Disallow: /auth/*`, `Disallow: /admin/*`, `Disallow: /api/*`, `Disallow: /cart`, `Disallow: /wishlist`, `Disallow: /checkout` |
| 6 | **Search pagination broken — count ≠ results** | High | `api/_handlers/products.ts:242-249` | Make `count` query match `findMany` query (same `where` clause + same joins) |
| 7 | **No Cache-Control headers on any endpoint** | High | `api/[...path].ts:47-61` | Cache products (60s), categories (300s), CMS (300s), collections (300s) |
| 8 | **Categories include inactive children** | High | `api/_handlers/categories.ts:25` | Change `children: true` to `children: { where: { isActive: true } }` |
| 9 | **Homepage ignores `visibility` field** | High | `api/_handlers/cms.ts:33-35` | Filter sections by `visibility` field based on `ctx.userId` presence |
| 10 | **No HTML escaping in email templates** | High | `api/_lib/email-templates.ts` | Escape all user-supplied values (`customerName`, `reason`, `message`, etc.) |
| 11 | **Password reset link unguarded** | High | `api/_lib/email-templates.ts:249` | Guard `resetLink` with fallback URL or validation |
| 12 | **Admin contact notification event wrong** | Medium | `api/_lib/email-templates.ts:349` | Change `notificationEvent: "order_placed"` to `"contact_submitted"` |

---

## ⚪ Should Fix (Within One Month)

| # | Issue | Severity | Details |
|---|-------|----------|---------|
| 13 | **`handleLogout` revokes ALL sessions** | High | `admin.signOut(userId)` logs out all devices. Should only revoke current session's token. |
| 14 | **Password reset doesn't invalidate old sessions** | High | After reset, old session tokens remain valid. Stolen tokens survive password change. |
| 15 | **Session revocation not checked on auth** | Medium | `authenticateRequest()` checks JWT validity via Supabase but never checks if the session was revoked in `AuthSession` table. Revoked tokens work until JWT expiry (1h). |
| 16 | **Registration fetches ALL users** | Medium | `supabase.auth.admin.listUsers()` returns every user. Replace with `getUserByEmail()`. |
| 17 | **`isAdmin` persisted stale in localStorage** | Medium | Role changes don't propagate until page reload. |
| 18 | **Webhook always returns 200 on errors** | Medium | Razorpay stops retrying failed webhooks. Should return 4xx for transient failures. |
| 19 | **Stock deduction race in checkout** | Medium | Stock check and deduction aren't atomic — two concurrent checkouts for the last item can both succeed. |
| 20 | **Guest checkout creates profile without password** | Medium | Abandoned guest accounts accumulate in the database with zero security. |
| 21 | **`profileId!` non-null assertions crash on guest orders** | Medium | `handleVerify` line 110 uses `order.profileId!` — crashes for guest COD orders. |
| 22 | **In-memory rate limiter doesn't work in serverless** | Medium | Per-instance Map. Vercel serverless isolates each invocation. No rate limiting. Replace with Vercel KV. |
| 23 | **`setInterval` in serverless context** | Medium | `rate-limit.ts:14` — harmless (function is killed after 30s anyway) but indicates architectural misunderstanding. |
| 24 | **No health check endpoint** | Low | No `/api/health` to verify DB, email, payment config. |
| 25 | **CORS origins hardcoded** | Low | Should be env-var driven. |
| 26 | **OG image quality overridden** | Low | `q_80` pushed before `q_auto` — custom quality silently ignored. |
| 27 | **Double-counting refund in webhook handlers** | Medium | `handleRefundCreated` and `handleRefundProcessed` both double-count refunded amounts. Financial reporting would be wrong. |

---

## ✅ Working Correctly

- **Razorpay Checkout SDK** — Dynamic script loading, proper promise-based API
- **Payment verification** — HMAC SHA-256 signature validation
- **Webhook HMAC verification** — Properly validates `x-razorpay-signature`
- **Webhook dedup** — `WebhookEvent` table with `@@unique([source, eventId])`
- **Order creation** — Transactional with stock deduction, coupon usage, cart clear
- **Order status flow** — Validated transitions, timestamps, audit trail
- **Email notification system** — 9 template types, Resend API integration, admin alerting
- **Admin webhook reprocess/reconcile** — Manual retry and Razorpay state reconciliation
- **Rate limit on auth paths** — Conceptually correct (needs Redis for multi-instance)
- **Security headers** — CSP, HSTS, XFO, COEP, COOP, CORP all properly configured
- **Protected routes** — Both client-side (ProtectedRoute) and server-side (auth flags in router)
- **Session management UI** — List sessions, terminate individual sessions
- **Cloudinary upload** — Works with unsigned preset
- **Mobile responsive** — Bottom nav, filter drawer, swipe gallery, responsive grids
- **React 19 + Vite 6** — Modern, fast build pipeline
- **SEO infrastructure** — JSON-LD schemas, canonical URLs, OG tags, Twitter Cards — all implemented correctly (just missing the og-image file)

---

## Security Score Breakdown: 42/100

| Category | Score | Notes |
|----------|-------|-------|
| CSRF Protection | 0/20 | Implementation exists but client doesn't send token |
| Authentication | 5/15 | JWT refresh implemented, but session revocation unchecked, registration crashes |
| Authorization | 10/15 | Route guards work, but no role hierarchy |
| Rate Limiting | 3/15 | Concept exists, broken in serverless |
| Input Validation | 5/10 | Zod on login/register, nothing on other endpoints |
| Output Security | 5/10 | CSP configured, but no HTML escaping in emails |
| Transport Security | 10/10 | HSTS, TLS 1.3, security headers all present |
| Session Management | 4/5 | Sessions tracked, but no expiry cleanup |

## SEO Score Breakdown: 40/100

| Category | Score | Notes |
|----------|-------|-------|
| Sitemap | 0/20 | Static, 7 hardcoded URLs, no products |
| Meta Tags | 10/15 | OG/JSON-LD code exists, but og-image.jpg missing |
| Structured Data | 10/15 | Product/Collection/Breadcrumb schemas implemented |
| Robots.txt | 2/10 | Exists but disallows nothing |
| Performance (Core Web Vitals) | 12/20 | Lazy loading, Cloudinary transforms, but no cache headers |
| Mobile Friendliness | 6/10 | Responsive design, but no AMP/no mobile-specific SEO |
| Content | 0/10 | No blog, no category descriptions, no rich content |

## Performance Score Breakdown: 65/100

| Category | Score | Notes |
|----------|-------|-------|
| Caching | 10/25 | vercel.json has correct immutable asset caching but API has no cache headers |
| Code Splitting | 15/15 | Manual chunks (vendor, state, ui) + route-based splitting |
| Image Optimization | 15/15 | Cloudinary `f_auto,q_auto`, lazy loading, fetchPriority |
| Build Size | 15/15 | 240KB main (76KB gzip), 2.6s build |
| API Latency | 5/15 | No DB connection pooling, no query optimization visible |
| Server Cold Starts | 5/15 | 512MB function, but Prisma client initialization adds latency |

---

## Go / No-Go Decision

### 🛑 NO-GO — 2 Critical Blockers

**The application cannot be launched in its current state.** Two issues make it non-functional:

1. **CSRF validation blocks every write operation** (login, register, checkout, payments, admin). The app is effectively read-only.

2. **Registration crashes** with a `ReferenceError`. No new users can sign up.

### Path to GO

**Phase 1 (30 minutes):**
1. Remove CSRF validation from the router (`api/[...path].ts:554-560`)
2. Fix the `phone` variable in `handleRegister` (add to destructuring)

**Phase 2 (1-2 days):**
3. Create `/public/og-image.jpg` (1200×630px)
4. Add `Disallow` rules to `robots.txt`
5. Fix search pagination (`count` query)
6. Fix categories inactive children filter
7. Fix homepage `visibility` check
8. Guard `resetLink` in email template
9. Fix admin contact notification event type

**Phase 3 (1 week):**
10. Build dynamic sitemap (query products/categories/collections/CMS)
11. Add Cache-Control headers to API responses
12. Add HTML escaping to email templates
13. Fix logout to only revoke current session

### Re-Evaluation Criteria

- [ ] CSRF either removed or client properly sends tokens
- [ ] Registration flow works end-to-end
- [ ] Login → Browse → Add to Cart → Checkout → Pay → Email notification → Success
- [ ] Admin login → Create product → Create category → View order → Manage
- [ ] OG image present and social share previews work
- [ ] Sitemap includes all dynamic content
- [ ] Build: 0 TypeScript errors
