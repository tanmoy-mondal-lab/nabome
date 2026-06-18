# Deployment Report — নবME (nabome.online)

*Generated: June 18, 2026*

---

## 1. Production-Ready ✅

### Architecture
- **Prisma schema**: 41 models, 16 enums — covers full e-commerce domain with interactive transactions on critical paths (checkout, payment, refund)
- **API routing**: 237 routes in `api/[...path].ts` with clean handler separation (20+ files)
- **Security**: Rate limiting (all routes), CSRF (all mutations), Zod validation (8 schemas), security headers (CSP/HSTS/COEP/COOP/CORP/XFO/RP/PP), admin role verification (130+ routes)
- **SEO**: Sitemap, canonical URLs, JSON-LD schemas, OG/Twitter cards, robots meta, favicon — Lighthouse SEO: **95/100**
- **Performance**: Cloudinary auto-format/q_auto transforms, lazy loading, fetchPriority, lightningcss, preconnect hints, Cache-Control headers — Lighthouse Perf: **88/100**
- **TypeScript**: Zero errors — `npx tsc --noEmit` passes. Build: 2.79s, 240KB main (76KB gzip)
- **Mobile UX**: Bottom nav, swipe gallery, filter drawer, responsive components
- **Admin dashboard**: Full CRUD for products/orders/customers/CMS/analytics/media/theme

### Infrastructure
- **Hosting**: Vite + SPA (static export-ready)
- **Database**: Supabase PostgreSQL (Neon under the hood)
- **Auth**: Supabase Auth (magic link for admin, email/password for customers)
- **Payments (server)**: Razorpay REST API — order creation, HMAC signature verification, refunds (full/partial)
- **Images**: Cloudinary — upload via signed presets, delivery via f_auto/q_auto transforms
- **Analytics**: Google Analytics 4 (VITE_GA_ID configured)

---

## 2. NOT Production-Ready ❌ (Critical Gaps)

### 🔴 P0 — Blocking for any public launch

| Gap | Impact | File(s) |
|-----|--------|---------|
| **Razorpay frontend is simulated** | `window.confirm()` used instead of Razorpay Checkout SDK. Fake payment IDs sent. Real `razorpaySignature` never generated. | `src/storefront/pages/CheckoutPage.tsx:209-320`, `src/features/checkout/hooks/useCheckout.ts:115-140` |
| **No payment webhook** | No server-side confirmation of payment success. If user closes browser before callback fires, order stays `pending`. | Missing entirely |
| **Email (Resend) not integrated** | No order confirmations, password resets, or notifications sent via email. In-app notifications only. | Not referenced anywhere in codebase |
| **JWT token refresh not implemented** | Client sessions expire after ~1 hour (default Supabase JWT) with no auto-refresh. Users will get 401 errors mid-session. | `src/lib/supabase/client.ts` |
| **Missing 6 env vars** | `DATABASE_URL` (placeholder pw), `SUPABASE_SERVICE_ROLE_KEY` (empty), `CLOUDINARY_API_KEY` (empty), `CLOUDINARY_API_SECRET` (empty), `RAZORPAY_KEY_ID` (not in .env), `RAZORPAY_KEY_SECRET` (not in .env) | `.env` |
| **No database migrations** | `prisma migrate` never run. Schema managed via `db push` only. No migration history for rollback. | `prisma/migrations/` doesn't exist |

### 🟠 P1 — Should fix before significant traffic

| Gap | Impact | File(s) |
|-----|--------|---------|
| **No connection pooling** | Direct Supabase Postgres connections via `DATABASE_URL`. No PgBouncer configuration. | `api/_lib/prisma.ts` |
| **No deployment configuration** | No `vercel.json`, custom build commands, or environment group config. Vercel defaults may not handle SPA + API routes. | Missing |
| **Rate limiter is in-memory** | Resets on every server restart. Not shared across Vercel serverless instances. | `api/_lib/rate-limit.ts` |
| **No monitoring/error tracking** | No Sentry, no logging service, no uptime monitoring. Blind to production issues. | Missing |
| **No database backups configured** | Relies on Supabase/Neon defaults. No explicit backup schedule or verification. | — |

### 🟡 P2 — Quality of life

| Gap | Impact |
|-----|--------|
| No social login (Google, Apple) | Users must register with email/password |
| No abandoned cart recovery | Lost revenue from cart abandoners |
| No back-in-stock notifications | Lost revenue from out-of-stock products |
| No admin audit log | No traceability for admin actions |
| No staff roles | All admins are super admins |
| No Apple Pay / Google Pay | Mobile conversion friction |
| No order export (CSV/Excel) | Admin inconvenience |

---

## 3. Launch Recommendation

**🟡 BETA LAUNCH — NOT PUBLIC LAUNCH**

The platform is architecturally sound and visually polished, but missing critical non-functional requirements. Proceed with:

### Phase 1 — Pre-Beta (Week 1)
Fix P0 gaps before inviting any users:

- [ ] **Replace simulated checkout** with real Razorpay Checkout SDK (`razorpay.checkout.js`) — ~2 days
- [ ] **Add Razorpay webhook endpoint** (`POST /api/payments/webhook`) with HMAC verification — ~1 day
- [ ] **Integrate Resend** — order confirmation, password reset, payment receipt emails — ~2 days
- [ ] **Implement token refresh** — Supabase `onAuthStateChange` + auto-refresh — ~1 day
- [ ] **Fill all env vars** — get production secrets from Supabase/Cloudinary/Razorpay/Resend
- [ ] **Run `prisma migrate dev`** against production DB

### Phase 2 — Beta Launch (Week 2)
- [ ] **Internal testing** — 5-10 test orders (COD + Razorpay), admin CRUD, CMS
- [ ] **Add Vercel deployment config** (`vercel.json` with SPA fallback + rewrites)
- [ ] **Configure Vercel env vars** (9 variables)
- [ ] **Point DNS** — `nabome.online` → Vercel, enable Cloudflare proxy
- [ ] **Submit sitemap to Google Search Console**
- [ ] **Test GA4 tracking**
- [ ] **Verify Lighthouse scores** on production URL

### Phase 3 — Gradual Rollout (Week 3-4)
- [ ] **P0 items completed**: Real Razorpay frontend, webhook, email, token refresh, all env vars, migrations
- [ ] **P1 items**: Connection pooler, monitoring (Sentry), vercel.json, DB backups
- [ ] **Invite第一批 users** (50-100) via beta invite code
- [ ] **Monitor error rates, order success rate, email delivery**

### Post-Launch (Month 2+)
- [ ] Social login, Apple Pay/GPay
- [ ] Abandoned cart recovery
- [ ] Back-in-stock notifications
- [ ] Admin audit log + staff roles

---

## 4. Environment Variables Reference

| Variable | Required | Where | Source |
|----------|----------|-------|--------|
| `VITE_SUPABASE_URL` | ✅ | Frontend + API | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Frontend + API | Supabase Dashboard → Settings → API |
| `VITE_SITE_URL` | ✅ | Frontend | Your domain (https://www.nabome.online) |
| `VITE_GA_ID` | ✅ | Frontend | Google Analytics → Admin → Data Streams |
| `VITE_CLOUDINARY_CLOUD_NAME` | ✅ | Frontend | Cloudinary Dashboard |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | ✅ | Frontend | Cloudinary → Settings → Upload → Presets |
| `DATABASE_URL` | ✅ | API (Prisma) | Supabase Dashboard → Settings → Database → URI (replace pw) |
| `SUPABASE_URL` | ✅ | API | Same as VITE_SUPABASE_URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | API | Supabase Dashboard → Settings → API → service_role (secret!) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | API | Same as VITE_CLOUDINARY_CLOUD_NAME |
| `CLOUDINARY_API_KEY` | ✅ | API | Cloudinary Dashboard → Account Details |
| `CLOUDINARY_API_SECRET` | ✅ | API | Cloudinary Dashboard → Account Details (secret!) |
| `CLOUDINARY_UPLOAD_PRESET` | ✅ | API | Same as VITE_CLOUDINARY_UPLOAD_PRESET |
| `RAZORPAY_KEY_ID` | ✅ | API | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | ✅ | API | Razorpay Dashboard → Settings → API Keys (secret!) |
| `RESEND_API_KEY` | ⬜ (future) | API | Resend Dashboard → API Keys |

**Total: 16 vars (9 server-only, 6 client-safe, 1 future)**

---

## 5. Deployment Architecture

```
User → Cloudflare (DNS + DDoS) → Vercel → [Static SPA] + [Serverless API]
                                          → Supabase (Postgres + Auth)
                                          → Cloudinary (Images)
                                          → Razorpay (Payments)
                                          → Resend (Email) [future]
                                          → Google Analytics
```

- **SPA**: Vite build → `dist/` → served as static files from Vercel edge
- **API**: Vercel serverless functions at `api/*.ts` → connected to Supabase direct
- **No SSR/SSG** — pure SPA with client-side data fetching

---

## 6. Build & Verify Commands

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Preview build
npm run preview

# DB (production)
npx prisma migrate dev   # generates migration + applies
npx prisma db push       # alternative (no migration history)
npx tsx prisma/seed.ts   # seed initial data

# Verify routes
npm run dev
```

---

## 7. Monitoring Gaps Log

| What's missing | Recommendation | Priority |
|----------------|---------------|----------|
| Error tracking | Sentry.io (free tier: 5k events/mo) | P1 |
| Uptime monitoring | Better Uptime / Pulsetic (free tier) | P1 |
| Server-side logging | Neon Postgres logs (built-in) or Axiom | P2 |
| Performance monitoring | Vercel Analytics (built-in with Pro) | P2 |
| Email delivery tracking | Resend webhooks (built-in) | P2 |
