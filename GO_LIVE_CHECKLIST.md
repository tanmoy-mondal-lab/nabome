# Go-Live Checklist — নবME (Nabome)

**Version:** 1.0.0
**Date:** 2026-07-08
**Status:** 🔴 NOT READY — 7 P0 blockers remain

---

## 🔴 PREREQUISITES (MUST PASS)

### Security
- [ ] Rotate ALL production secrets (Supabase service_role, Neon DB, Razorpay key secret, Cloudinary API secret, Resend API key)
- [ ] Migrate JWT tokens from localStorage to httpOnly cookies
- [ ] Run `gitleaks` or `trufflehog` on git history; remove any leaked secrets
- [ ] Add pre-commit hook for secret scanning
- [ ] Add CSP `report-uri` / `report-to` directive
- [ ] Add Turnstile to `/auth/verify-reset-code` and `/auth/reset-password`
- [ ] Confirm no `.env` in deployment artifacts
- [ ] Run `npm audit` and fix any vulnerabilities

### Performance
- [ ] Enable Cloudflare Smart Placement for the Worker
- [ ] Add Hyperdrive binding for Neon database
- [ ] Verify database connection pool settings (Neon max connections)
- [ ] Confirm TTFB < 1s on homepage after optimizations
- [ ] Add pagination/limits to analytics and export endpoints
- [ ] Add cart expiration mechanism (TTL index on `Cart.expiresAt`)

### Database
- [ ] Run `prisma migrate deploy` to apply all 12 migrations
- [ ] Add indexes on `orders.razorpay_order_id` and `orders.razorpay_payment_id`
- [ ] Fix `orders` model: move `referrals`/`giftCards` relation fields before `@@index` declarations
- [ ] Fix coupon per-user limit race condition (unique constraint or `SELECT FOR UPDATE`)
- [ ] Move Razorpay API call outside of `prisma.$transaction` in checkout flow
- [ ] Fix refund status marking (don't mark "completed" before async confirmation)
- [ ] Add `createdAt`/`updatedAt` to 14 models that lack them
- [ ] Verify all 34 models have proper indexes

### Testing
- [ ] All 513 Vitest tests pass
- [ ] TypeScript compilation: 0 errors
- [ ] ESLint: 0 errors (warnings are acceptable)
- [ ] Playwright E2E tests pass across Chromium/Firefox/WebKit
- [ ] Test coverage > 30% (currently ~15-25%)
- [ ] Add CI gate: tests MUST fail the build (remove `|| echo` fallbacks)

### Legal & Compliance
- [ ] Privacy policy page published (`/privacy`)
- [ ] Terms & conditions page published (`/terms`)
- [ ] Cookie consent banner active
- [ ] Shipping policy page (`/shipping-returns`) — verify content
- [ ] Return policy page published
- [ ] Refund policy page published (**missing** — create `/refund-policy`)
- [ ] GDPR/DPDP compliance verified
- [ ] `security.txt` file up to date
- [ ] `robots.txt` correct for production

---

## 🟡 DEPLOYMENT PREPARATION

### Infrastructure
- [ ] Wrangler config correct for production (`wrangler.jsonc`)
- [ ] `RATE_LIMIT_STORE` KV namespace created and bound
- [ ] `FEATURE_FLAGS_KV` KV namespace created and bound
- [ ] Cloudflare Pages project configured: `nabome`
- [ ] Custom domain `nabome.online` + `www.nabome.online` configured
- [ ] SSL/TLS: Full (strict)
- [ ] Always Use HTTPS: ON
- [ ] Brotli compression: ON
- [ ] Auto Minify: ON
- [ ] Polish: ON
- [ ] Cache level: Standard
- [ ] Edge Cache TTL: Respect origin headers

### Environment Variables (Cloudflare Pages Secrets)
- [ ] `DATABASE_URL` — Neon pooled connection string
- [ ] `DATABASE_URL_POOLED` — Same as above
- [ ] `SUPABASE_URL` — Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — 🔴 Must rotate first
- [ ] `SUPABASE_ANON_KEY` — Public, but verify
- [ ] `RAZORPAY_KEY_ID` — Production key (not test)
- [ ] `RAZORPAY_KEY_SECRET` — Production secret
- [ ] `RAZORPAY_WEBHOOK_SECRET` — Set in Razorpay dashboard
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `RESEND_API_KEY` — Production API key
- [ ] `EMAIL_FROM` — Verified sender
- [ ] `ADMIN_EMAILS` — Comma-separated admin emails
- [ ] `TURNSTILE_SECRET_KEY` — Production key
- [ ] `SITE_URL` — `https://www.nabome.online`
- [ ] `NODE_ENV` — `production`
- [ ] `CF_PAGES` — `1`

### DNS
- [ ] `nabome.online` CNAME → `nabome.pages.dev`
- [ ] `www.nabome.online` CNAME → `nabome.pages.dev`
- [ ] TXT record for domain ownership verification
- [ ] SPF record for email sending
- [ ] DKIM record for email signing
- [ ] DMARC record (p=quarantine or p=reject)

---

## 🟢 PRE-LAUNCH CHECKS

### Build & Deploy
- [ ] `npm run pages:build` succeeds (headers sync → prisma generate → typecheck → vite build)
- [ ] Deploy to staging/preview environment
- [ ] Smoke test all critical flows in staging
- [ ] Verify Cloudflare Pages deployment logs (no errors)
- [ ] Check analytics (GA4) tag fires correctly
- [ ] Verify sitemap.xml is accessible and valid
- [ ] Verify robots.txt allows/disallows correct paths

### Smoke Tests (Staging → Production)
- [ ] Homepage loads with all sections
- [ ] Product listing page renders with filters
- [ ] Product detail page shows image gallery + variants
- [ ] Add to cart (with/without variant selection)
- [ ] Cart page: update quantity, remove item, apply coupon
- [ ] Checkout flow: address → shipping → payment → confirmation
- [ ] Razorpay payment modal opens and processes payment
- [ ] Order confirmation page with order details
- [ ] Email receipt received
- [ ] User registration + email verification
- [ ] User login
- [ ] Profile: edit name/phone/address
- [ ] Order history page
- [ ] Wishlist: add/remove/share
- [ ] Search: returns results, handles no results
- [ ] Admin login
- [ ] Admin dashboard: metrics load
- [ ] Admin product CRUD
- [ ] Admin order management
- [ ] Admin CMS page builder
- [ ] Mobile: all above on 375px viewport
- [ ] Tablet: all above on 768px viewport

### Performance Validation
- [ ] Lighthouse Performance ≥ 80 (after Hyperdrive)
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Lighthouse Best Practices ≥ 90
- [ ] Lighthouse SEO ≥ 95
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1

### Security Validation
- [ ] SecurityHeaders.com grade A+
- [ ] Observatory by Mozilla grade B+
- [ ] CSP evaluated with no bypasses
- [ ] All forms include CSRF token
- [ ] Turnstile active on login/register/contact
- [ ] Rate limiting triggers correctly (test with 6 rapid auth attempts)
- [ ] File upload rejects invalid types
- [ ] SQL injection payloads rejected (verify on search endpoint)

---

## 🚀 LAUNCH DAY

### Final Steps
- [ ] Set `NODE_ENV=production` and `CF_PAGES=1`
- [ ] Deploy to `production` branch via GitHub Actions
- [ ] Monitor Cloudflare dashboard for errors
- [ ] Verify production secrets loaded (check Workers logs)
- [ ] Manually process a test order end-to-end
- [ ] Verify Razorpay webhook reaches the Worker
- [ ] Check Neon database connections (should be pooled)
- [ ] Verify Resend email delivery
- [ ] Verify Cloudinary image loading
- [ ] Run Lighthouse on production URL
- [ ] Check `https://www.nabome.online` resolves
- [ ] Check `https://nabome.online` redirects to www
- [ ] Verify `security.txt` is accessible at `/.well-known/security.txt`

### Monitoring
- [ ] Cloudflare Analytics dashboard configured
- [ ] Workers metrics (requests, CPU, errors) tracked
- [ ] Neon database monitoring (connections, queries, CPU)
- [ ] Error monitoring enabled (Sentry or similar — currently missing)
- [ ] Uptime check configured (every 5 min)
- [ ] Alert for 5xx errors > 1% of requests
- [ ] Alert for database connection pool exhaustion
- [ ] Alert for payment webhook failures

### Rollback Plan
- [ ] Previous successful deployment identified and tagged
- [ ] Git revert command prepared
- [ ] Cloudflare quick rollback documented
- [ ] Database migration rollback script ready

---

## ✅ POST-LAUNCH (24-48h)

- [ ] Verify no 500 errors in logs
- [ ] Verify payment webhooks processing correctly
- [ ] Verify email delivery (transactional + admin notifications)
- [ ] Check database connection pool utilization
- [ ] Monitor CPU/memory on Neon
- [ ] Run Lighthouse audit on production
- [ ] Verify analytics data flowing to GA4
- [ ] Check CSP violation reports
- [ ] Review Worker CPU usage (stay under 10ms/request)
- [ ] Check CDN cache hit ratio (target > 70%)
- [ ] Verify all admin workflows operational
- [ ] Test customer support ticket submission

---

## Reference

- **Live site:** https://www.nabome.online
- **CI/CD:** `.github/workflows/deploy.yml`
- **Secrets:** Cloudflare Pages → Settings → Environment Variables
- **Database:** Neon Console → `ep-orange-fog-at9k2le6`
- **Auth:** Supabase Dashboard → `xerabhkitzrlszcsvrnk`
- **Payments:** Razorpay Dashboard → Live Mode
- **Email:** Resend Dashboard
- **Media:** Cloudinary Dashboard
