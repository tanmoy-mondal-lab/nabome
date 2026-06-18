# Deployment Checklist — নবME

## Pre-Deployment

### 1. Environment Variables — Vercel Dashboard

| Variable | Source | Required | Notes |
|----------|--------|----------|-------|
| `DATABASE_URL` | Supabase → Project Settings → Database | ✅ | Direct connection string |
| `DATABASE_URL_POOLED` | Supabase → Project Settings → Database (Pooled) | ✅ | `?pgbouncer=true&connection_limit=1` suffix |
| `SUPABASE_URL` | Supabase → Project Settings → API | ✅ | Same as `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` key | ✅ | **Keep secret** — full admin access |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` public key | ✅ | Same as `VITE_SUPABASE_ANON_KEY` |
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL` | ✅ | Exposed to client |
| `VITE_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` | ✅ | Exposed to client |
| `VITE_RAZORPAY_KEY_ID` | Razorpay → Settings → API Keys | ✅ | Public key, exposed to client |
| `RAZORPAY_KEY_ID` | Same as `VITE_RAZORPAY_KEY_ID` | ✅ | |
| `RAZORPAY_KEY_SECRET` | Razorpay → Settings → API Keys | ✅ | **Keep secret** |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay → Settings → Webhooks | ✅ | **Keep secret** |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard | ✅ | Same as `CLOUDINARY_CLOUD_NAME` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard | ✅ | |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload → Presets | ⚠️ | Must be unsigned preset or create signed upload |
| `RESEND_API_KEY` | Resend Dashboard → API Keys | ⚠️ | Required for transactional emails |
| `EMAIL_FROM` | Verified domain in Resend | ⚠️ | Must be `*@nabome.online` or verified |
| `ADMIN_EMAILS` | Comma-separated list | ⚠️ | Admin notification recipients |
| `VITE_SITE_URL` | `https://www.nabome.online` | ✅ | Used for canonical URLs |
| `SITE_URL` | `https://www.nabome.online` | ⚠️ | Password reset redirect |
| `VITE_GA_ID` | Google Analytics | Optional | `G-T0HLCQE1B9` |
| `SUPABASE_JWT_SECRET` | Supabase → Project Settings → API | ⚠️ | JWT signing — may be needed for custom auth |

**Total: 22 variables (19 required, 2 optional, 1 may be needed)**

### 2. Vercel Project Settings

- [ ] **Framework Preset**: Vite (auto-detected)
- [ ] **Build Command**: `npm run build` (set in `vercel.json`)
- [ ] **Output Directory**: `dist`
- [ ] **Install Command**: `npm install && npx prisma generate`
- [ ] **Root Directory**: `./`
- [ ] **Node.js Version**: 20.x or 22.x (LTS)
- [ ] **Function Region**: `iad1` (US East) — closest to Supabase

### 3. Database — Production Migration

- [ ] Run `npx prisma migrate deploy` against production (using `DATABASE_URL` direct)
- [ ] Verify all 42 models, 16 enums are created
- [ ] Verify indexes exist (especially on `auth_sessions`, `orders`, `products`)
- [ ] Run `npx prisma db seed -- --environment production` if needed
- [ ] Verify connection pooling:
  - Create pooled URL: `postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
  - Set as `DATABASE_URL_POOLED`
  - Verify Prisma works with pooled connection (no `JOIN` issues with PgBouncer transaction mode)

### 4. DNS & SSL — Cloudflare

- [ ] **DNS Records**:
  | Type | Name | Value | Proxy |
  |------|------|-------|-------|
  | CNAME | `www` | `cname.vercel-dns.com` | Proxied (orange cloud) |
  | CNAME | `@` | `cname.vercel-dns.com` | Proxied |
  | CNAME | `*` | `cname.vercel-dns.com` | Proxied (optional — wildcard) |

- [ ] **SSL/TLS**: Full (Strict) — requires valid cert on origin
- [ ] **Always Use HTTPS**: ON
- [ ] **Minimum TLS Version**: 1.2
- [ ] **Opportunistic Encryption**: ON
- [ ] **Automatic HTTPS Rewrites**: ON

- [ ] **WAF / Security Level**: Medium (or High during launch)
- [ ] **Bot Fight Mode**: ON
- [ ] **Rate Limiting Rules**: Create rules for auth endpoints

### 5. Vercel Domain Configuration

- [ ] Add `nabome.online` and `www.nabome.online` in Vercel Dashboard → Domains
- [ ] Wait for SSL provisioning (Vercel + Cloudflare)
- [ ] Verify `https://www.nabome.online` loads
- [ ] Verify `https://nabome.online` redirects to `https://www.nabome.online`

### 6. Razorpay — Webhook Configuration

- [ ] Razorpay Dashboard → Settings → Webhooks → Add Webhook
  - **URL**: `https://www.nabome.online/api/payments/webhook`
  - **Events**: `payment.captured` ✅, `payment.failed` ✅, `refund.created` ✅, `refund.processed` ✅
  - **Secret**: Set `RAZORPAY_WEBHOOK_SECRET` same value
- [ ] Verify webhook ping (`POST` test event)
- [ ] **API Keys**: Generate and copy to Vercel env vars

### 7. Resend — Email Configuration

- [ ] Resend Dashboard → Domains → Add Domain: `nabome.online`
- [ ] Add DKIM, SPF, DMARC DNS records to Cloudflare
- [ ] Wait for verification (can take a few minutes)
- [ ] Create API key with "sending" permission
- [ ] Verify `EMAIL_FROM` matches verified domain

### 8. Cloudinary Configuration

- [ ] Verify upload preset exists and is unsigned
- [ ] Or implement signed upload (more secure) — requires `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- [ ] Test upload via admin media library
- [ ] Verify `f_auto,q_auto` transformation URLs work

---

## Deployment Steps

### Phase 1: Database
```bash
# Set DATABASE_URL to direct connection string
npx prisma migrate deploy
# Verify tables exist
npx prisma db push --accept-data-loss  # if schema drift
```

### Phase 2: Environment Variables
```bash
# Set all 22 env vars in Vercel Dashboard
# Do NOT set SUPABASE_JWT_SECRET unless custom auth is implemented
```

### Phase 3: Deploy
```bash
git push main  # auto-deploys via GitHub integration

# Or manual deploy:
npx vercel --prod
```

### Phase 4: Verify
- [ ] `curl -I https://www.nabome.online` → 200 (index.html)
- [ ] `curl -I https://www.nabome.online/api/auth/me` → 401 (expected — no token)
- [ ] `curl -I https://www.nabome.online/api/products` → 200
- [ ] Register a test account
- [ ] Login → get tokens → verify /me returns profile
- [ ] Browse products
- [ ] Add to cart
- [ ] Complete a COD order
- [ ] Complete a Razorpay order (test mode)
- [ ] Verify webhook fires on payment
- [ ] Verify email notifications arrive
- [ ] Admin login → dashboard loads
- [ ] Admin → verify all CRUD operations

### Phase 5: Go Live
- [ ] Switch Razorpay from test to live mode
- [ ] Verify DNS propagation
- [ ] Submit sitemap to Google Search Console
- [ ] Verify GA tracking events fire
- [ ] Monitor Vercel logs for 4xx/5xx
- [ ] Monitor Neon DB connections (< 100 concurrent)

---

## Post-Deployment Monitoring

| Metric | Target | Tool |
|--------|--------|------|
| Response time (API) | < 200ms p95 | Vercel Analytics |
| Response time (static) | < 50ms p95 | Cloudflare |
| Error rate | < 0.1% | Vercel Logs |
| DB connections | < 50 avg | Neon Dashboard |
| Email delivery rate | > 98% | Resend Dashboard |
| Payment success rate | > 95% | Razorpay Dashboard |
