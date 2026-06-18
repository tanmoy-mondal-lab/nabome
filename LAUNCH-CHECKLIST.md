# Launch Checklist — নবME

## Final Verification (T-24h)

### DNS & Networking
- [ ] `dig www.nabome.online` → CNAME to `cname.vercel-dns.com`
- [ ] `dig nabome.online` → CNAME to `cname.vercel-dns.com`
- [ ] `curl -sI https://www.nabome.online` → `200` or `304`
- [ ] `curl -sI https://nabome.online` → `301/308` redirect to `https://www.nabome.online/`
- [ ] `curl -sI https://www.nabome.online/api/products` → `200` with CORS headers
- [ ] SSL Labs test: https://www.ssllabs.com/ssltest/ → Grade A+

### Security Headers
```bash
curl -sI https://www.nabome.online | grep -iE "content-security-policy|strict-transport-security|x-content-type-options|x-frame-options|referrer-policy"
```
- [ ] `Content-Security-Policy` present
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`

### Database
- [ ] Prisma migrate deployed — all 42 tables exist
- [ ] Pooled connection URL works: `psql -h [pooler].supabase.co -p 6543 -d postgres`
- [ ] Connection count < 10 at rest
- [ ] Weekly backup configured in Neon/Supabase Dashboard
- [ ] Daily backup verified

### Third-Party Services
- [ ] **Razorpay**: API keys in test mode (switch to live on launch)
- [ ] **Razorpay Webhook**: Test event successfully delivered
- [ ] **Resend**: Domain verified, DKIM/SPF/DMARC DNS records active
- [ ] **Cloudinary**: Upload preset exists and works
- [ ] **Google Analytics**: Real-time report shows activity on staging

### Monitoring
- [ ] Vercel Analytics enabled (Web Analytics + Speed Insights)
- [ ] Vercel Logs drainage configured (or at least accessible via dashboard)
- [ ] Neon monitoring alerts configured:
  - CPU > 80%
  - Connections > 80% of limit
  - Storage > 80%
- [ ] Resend email engagement tracking enabled
- [ ] Razorpay payment failure notifications configured

---

## Launch Day

### T-2h: Pre-Flight

- [ ] Verify all 22 env vars in Vercel Dashboard
- [ ] Take manual DB snapshot (Neon → Branches → Create Branch)
- [ ] Set `RAZORPAY_WEBHOOK_SECRET` — verify matches Razorpay Dashboard
- [ ] Verify `ADMIN_EMAILS` is set correctly
- [ ] Check Vercel deployment: `npx vercel list` — latest deployment is healthy
- [ ] Verify no pending migrations: `npx prisma migrate status`

### T-0: Go Live

- [ ] **Switch Razorpay from test to live mode**
  - Razorpay Dashboard → Settings → Switch to Live
  - Copy LIVE API keys to Vercel env vars
  - Redeploy: `git push main` or manual redeploy in Vercel Dashboard
- [ ] **Verify live payment flow:**
  1. Open `https://www.nabome.online` in incognito
  2. Browse → Add to cart → Checkout
  3. Select Razorpay → Complete payment with test card (live mode has test cards)
  4. Verify order shows in admin
  5. Verify email notification received
- [ ] **Verify COD flow:**
  1. Complete COD order
  2. Verify order shows in admin
- [ ] **Monitor first 10 minutes:**
  - Vercel Functions: check for errors
  - Neon: check connection count
  - Resend: check first emails delivered
  - Cloudflare: check cache hit ratio

### T+1h: Post-Launch

- [ ] Verify Google Analytics receiving data
- [ ] Run lighthouse audit (target: 90+ Performance, 95+ SEO)
- [ ] Submit sitemap to Google Search Console
- [ ] Verify all critical pages:
  - Homepage → 200
  - Category page → 200
  - Product detail → 200
  - Cart → 200
  - Checkout → 200
  - Login/Register → 200
  - Admin dashboard → 200
  - Admin product editor → 200
  - Account dashboard → 200

### T+24h: Day-After

- [ ] Review error logs — < 0.1% error rate
- [ ] Review Vercel function cold starts — < 5s p95
- [ ] Review DB connection pool — < 50 concurrent
- [ ] Review first payments — all successful?
- [ ] Review first emails — all delivered?
- [ ] Check for any CSRF/rate-limit false positives in logs

---

## Rollback Plan

### If deployment is broken:
```bash
# Rollback Vercel
npx vercel rollback <deployment-id>

# Or in Vercel Dashboard → Deployments → ⋮ → Promote to Production
```

### If database migration is broken:
```bash
# Restore from snapshot:
# Neon Dashboard → Branches → Restore from backup
```

### If payment flow is broken:
1. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` back to test mode keys
2. Redeploy Vercel
3. Investigate root cause
4. Switch back to live when fixed

### If email delivery is broken:
1. Check Resend Dashboard → API Keys → Verify key is active
2. Check Resend → Domains → Verify DKIM/SPF records
3. Check `EMAIL_FROM` matches verified domain
4. Verify `RESEND_API_KEY` is set correctly in Vercel

---

## Emergency Contacts

| Service | Contact | SLA |
|---------|---------|-----|
| Vercel | https://vercel.com/support | 99.99% |
| Supabase/Neon | https://supabase.com/dashboard/support | 99.95% |
| Cloudflare | https://support.cloudflare.com | 99.99% |
| Razorpay | https://razorpay.com/contact/ | 99.95% |
| Resend | https://resend.com/support | 99.9% |
| Cloudinary | https://support.cloudinary.com | 99.9% |
