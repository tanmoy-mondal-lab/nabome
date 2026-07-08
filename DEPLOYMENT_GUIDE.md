# Deployment Guide — নবME (Nabome) v1.0.0

**Platform:** Cloudflare Pages + Workers
**Database:** Neon (PostgreSQL)
**CI/CD:** GitHub Actions

---

## 1. Prerequisites

### Accounts & Services
- Cloudflare account with Pages access
- Neon (PostgreSQL) account
- Supabase account (Auth)
- Razorpay merchant account
- Cloudinary account
- Resend account (email)
- GitHub repository

### Local Tools
```bash
node >= 20
npm >= 9
wrangler >= 4.105.0
git
```

Install wrangler:
```bash
npm install -g wrangler
wrangler login
```

---

## 2. Environment Configuration

### Cloudflare Pages Secrets

Set all secrets via wrangler:
```bash
# Database
wrangler pages secret put DATABASE_URL
wrangler pages secret put DATABASE_URL_POOLED

# Supabase
wrangler pages secret put SUPABASE_URL
wrangler pages secret put SUPABASE_SERVICE_ROLE_KEY

# Razorpay (production keys)
wrangler pages secret put RAZORPAY_KEY_ID
wrangler pages secret put RAZORPAY_KEY_SECRET
wrangler pages secret put RAZORPAY_WEBHOOK_SECRET

# Cloudinary
wrangler pages secret put CLOUDINARY_CLOUD_NAME
wrangler pages secret put CLOUDINARY_API_KEY
wrangler pages secret put CLOUDINARY_API_SECRET

# Email
wrangler pages secret put RESEND_API_KEY
wrangler pages secret put EMAIL_FROM

# Turnstile
wrangler pages secret put TURNSTILE_SECRET_KEY

# Site
wrangler pages secret put SITE_URL
wrangler pages secret put ADMIN_EMAILS
wrangler pages secret put NODE_ENV production
wrangler pages secret put CF_PAGES 1
```

**Or** set via Cloudflare Dashboard:
`Cloudflare Dashboard → Pages → nabome → Settings → Environment Variables → Production`

### KV Namespaces

```bash
# Create KV namespaces
wrangler kv:namespace create RATE_LIMIT_STORE
wrangler kv:namespace create FEATURE_FLAGS_KV

# Bind in wrangler.jsonc (already configured)
```

### Local `.env` (development only)
```bash
cp .env.example .env
# Edit .env with your local/dev credentials
```

---

## 3. Build & Deploy

### Manual Deployment
```bash
# 1. Install dependencies
npm ci

# 2. Generate Prisma client
npx prisma generate

# 3. Run database migrations
npx prisma migrate deploy

# 4. Build
npm run pages:build

# 5. Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name nabome --branch production
```

### Automated Deployment (GitHub Actions)

The workflow at `.github/workflows/deploy.yml` deploys on pushes to:
- `main` → `main` branch on Cloudflare Pages
- `staging` → `staging` branch
- `production` → `production` branch

**Required GitHub Secrets:**
| Secret | Value |
|--------|-------|
| `DATABASE_URL` | Neon pooled connection string |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |

### CI/CD Pipeline
```
Push → GitHub Actions
  ├── quality job:
  │   ├── npm ci
  │   ├── prisma generate
  │   ├── tsc --noEmit (typecheck)
  │   ├── npm run lint
  │   └── npm test (vitest)
  │   └── ⚠️ All quality steps use `|| echo` — they warn but don't fail
  └── deploy job:
      ├── npm ci
      ├── prisma generate
      ├── npm run pages:build
      └── wrangler pages deploy
```

**Important:** The CI quality gates have `|| echo` fallbacks, meaning lint or test failures will NOT block deployment. For production safety, remove the fallbacks.

---

## 4. Database Migrations

### Apply Migrations
```bash
npx prisma migrate deploy
```

### Create New Migration
```bash
npx prisma migrate dev --name description_of_change
```

### Rollback (if needed)
```bash
# Identify the target migration
npx prisma migrate status

# Rollback manually via script
npx tsx scripts/rollback-migration.ts
```

### Seed Database
```bash
npx prisma db seed
```

### Generate Prisma Client
```bash
npx prisma generate
```

---

## 5. Razorpay Webhook Configuration

1. Navigate to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://www.nabome.online/api/payments/webhook`
3. Select events:
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
   - `refund.processed`
4. Set webhook secret → copy to `RAZORPAY_WEBHOOK_SECRET` secret
5. Test webhook delivery using Razorpay's test tool

---

## 6. Supabase Setup

1. Create Supabase project
2. Enable email auth provider
3. Configure site URL: `https://www.nabome.online`
4. Set redirect URLs for auth flows
5. Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY` (public) to secrets
6. Copy `SUPABASE_SERVICE_ROLE_KEY` to secret (⚠️ keep private)
7. Configure email templates (verification, password reset)

---

## 7. Cloudinary Setup

1. Create Cloudinary account
2. Note cloud name, API key, API secret
3. Upload preset (optional, for signed uploads)
4. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` secrets

---

## 8. Resend (Email) Setup

1. Create Resend account
2. Verify sending domain (`nabome.online`)
3. Add SPF, DKIM, DMARC DNS records
4. Create API key
5. Set `RESEND_API_KEY` and `EMAIL_FROM` secrets

---

## 9. Post-Deployment Verification

### Run Smoke Tests
```bash
# Automated E2E tests
npm run test:e2e

# Manual checks (see GO_LIVE_CHECKLIST.md for full list)
```

### Verify Critical Endpoints
```bash
# Health check
curl https://www.nabome.online/api/health

# Sitemap
curl https://www.nabome.online/sitemap.xml

# Robots
curl https://www.nabome.online/robots.txt

# Products API
curl https://www.nabome.online/api/products
```

### Verify Security Headers
```bash
curl -I https://www.nabome.online | grep -E "(strict-transport-security|content-security-policy|x-content-type-options)"
```

---

## 10. Troubleshooting

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| All requests return 429 | Rate limiting KV missing | Check `RATE_LIMIT_STORE` binding in wrangler.jsonc |
| Database connection errors | Missing `DATABASE_URL` secret | Set Neon connection string as secret |
| Images not loading | Cloudinary config missing | Check `CLOUDINARY_*` secrets |
| Emails not sending | Resend API key invalid | Verify key in Resend dashboard |
| Auth failures | Supabase URL/key mismatch | Check `SUPABASE_*` secrets |
| Razorpay payments failing | Wrong key (test vs production) | Switch to production keys |
| 404 on routes | Pages Functions routing issue | Check `functions/` directory and `wrangler.jsonc` |

### Logs
- **Cloudflare Workers logs:** Dashboard → Workers & Pages → nabome → Logs
- **Neon logs:** Neon Console → Monitor → Query History
- **Supabase logs:** Supabase Dashboard → Logs
- **Razorpay logs:** Razorpay Dashboard → Settings → Webhooks → Logs
- **Resend logs:** Resend Dashboard → Logs

### Rollback
```bash
# 1. Revert to previous commit
git revert HEAD

# 2. Re-deploy
git push origin production

# 3. Rollback database if needed
npx tsx scripts/rollback-migration.ts

# OR use Cloudflare quick rollback:
# Dashboard → Pages → nabome → Deployments → ⋮ → Rollback
```

---

## 11. Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Browser   │────▶│ Cloudflare   │────▶│ Cloudflare  │
│ (React SPA) │     │ CDN + Workers│     │ Pages (dist)│
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │ API Workers  │
                    │ (functions/) │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼───┐ ┌──────▼───┐ ┌──────▼───┐
       │ Neon DB  │ │Supabase  │ │ Cloudinary│
       │(Postgres)│ │ Auth     │ │ Media     │
       └──────────┘ └──────────┘ └──────────┘
                      ┌──────────┐ ┌──────────┐
                      │ Razorpay │ │ Resend   │
                      │ Payments │ │ Email    │
                      └──────────┘ └──────────┘
```

### Key Files
| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Cloudflare Pages + Workers config |
| `vite.config.ts` | Frontend build config |
| `api/[...path].ts` | API router (829 lines) |
| `functions/_middleware.ts` | Edge middleware (SEO, cache) |
| `prisma/schema.prisma` | Database schema (34 models) |
| `.github/workflows/deploy.yml` | CI/CD pipeline |

---

## 12. Infrastructure as Code

While not using Terraform/Pulumi, the following files define infrastructure:

| File | Defines |
|------|---------|
| `wrangler.jsonc` | Pages project, KV bindings, compatibility flags |
| `.github/workflows/deploy.yml` | CI/CD pipeline, secrets, branch config |
| `prisma/schema.prisma` | Database schema + indexes |
| `public/_headers` | Static security + cache headers |
| `public/_redirects` | URL redirects |
| `scripts/` | Database backup, restore, migration rollback |
