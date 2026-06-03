# নবME — Vercel Deployment Guide

## Environment Setup

1. Fork/clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in values:
   ```bash
   cp .env.example .env
   ```
3.1 If you rotate the Neon connection string in the Neon console, update `VITE_NEON_DATABASE_URL` in both your local `.env` file and the Vercel dashboard, then redeploy.
4. Run locally:
   ```bash
   npm run dev
   ```

## Build Optimization

### Current Build Stats
- Build time: ~1.2s
- Total modules: ~2881
- Chunk splitting:
  - `vendor` — React / React-DOM (228 KB)
  - `supabase` — @supabase/supabase-js (209 KB)
  - `motion` — Framer Motion (137 KB)
  - `charts` — Recharts (408 KB)
  - `icons` — Lucide React (26 KB)
  - `qrcode` — qrcode.react (17 KB)
- Route-level code splitting via `React.lazy()` on all 30+ pages

### Optimization Tips
- If Recharts chunk is too large, consider dynamic import of chart components
- Enable Brotli compression (Vercel default)
- Use Cloudinary for all product/banner/avatar images with `f_auto,q_auto`

## Vercel Deployment

### Automated (GitHub)
1. Push to GitHub
2. Import repo in Vercel dashboard
3. Set framework preset: **Vite**
4. Add environment variables (all `VITE_*` vars)
5. Deploy

### Manual (CLI)
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Production Configuration

### Environment Variables (Vercel Dashboard)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `VITE_ADMIN_EMAIL` | Yes | Admin login email |
| `VITE_NEON_DATABASE_URL` | Yes | Neon PostgreSQL connection string for server-side API routes; keep secret and configure in Vercel |
| `VITE_GA_ID` | No | Google Analytics 4 ID |

### Custom Domain
1. Add domain in Vercel: `nabome.online` + `www.nabome.online`
2. Update DNS nameservers to Vercel's
3. Enable HTTPS (automatic with Vercel)

### Post-Deployment
1. Run `src/lib/schema.sql` in Supabase SQL editor
2. Verify RLS policies are active
3. Test registration → login → browse → cart → checkout end-to-end
4. Submit sitemap to Google Search Console
5. Verify GA4 events firing in DebugView
6. Test all 3 roles: customer, vendor, admin

### Serverless API Routes
The following Vercel serverless functions are available at `/api/*`:
- `register-user.mjs` — Supabase user registration
- `reset-password.mjs` — Password reset
- `send-otp.mjs` — OTP generation and storage
- `verify-otp.mjs` — OTP verification
- `cloudinary-upload.mjs` — Cloudinary signed upload parameters

## Monitoring

- **Vercel Analytics** — Traffic, performance, errors
- **Google Analytics 4** — User behavior, conversions, ecommerce
- **Google Search Console** — SEO performance, crawl errors
- **Supabase Logs** — Database queries, auth events
- **Audit Logging** — `system_logs` table + localStorage fallback

## Rollback

Vercel retains previous deployments. To rollback:
1. Go to Vercel Dashboard → Deployments
2. Find the last known-good deployment
3. Click "..." → Promote to Production
