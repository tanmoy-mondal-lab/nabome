# নবME — Premium Fashion E-Commerce

## Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **API** | Serverless Functions (Cloudflare Pages Functions) |
| **Database** | PostgreSQL via Neon (serverless) + Prisma ORM |
| **Auth** | Supabase Auth |
| **Payments** | Razorpay |
| **Email** | Resend |
| **Media** | Cloudinary |
| **Hosting** | Cloudflare Pages (production) |

## Project Structure

```
api/                    Core API handlers (Pages Functions)
  _handlers/            Route handler modules (auth, products, orders, etc.)
  _lib/                 Utilities (prisma, auth, email, cloudinary, etc.)
  [...path].ts          Catch-all router
  sitemap.xml.ts        Sitemap generator
functions/
  api/[[path]].ts       Cloudflare Pages adapter → delegates to api/[...path].ts
scripts/                Dev utilities
  api-dev-server.ts     Local Node.js API dev server
  seed-admin.ts         Admin seeding script
public/                 Static files (copied to dist/ by Vite)
  _headers              Cloudflare caching rules
  _redirects            SPA fallback + API routing
src/                    React frontend
prisma/                 Database schema + migrations
wrangler.toml           Cloudflare Pages config
```

## Completed

- [x] Moved `api/index.ts` → `scripts/api-dev-server.ts` (keeps functions directory clean)
- [x] Created `public/_headers` with caching rules for Cloudflare Pages
- [x] Deleted `vercel.json` (legacy)
- [x] Deleted `dev-server.mjs` (duplicate legacy dev server)
- [x] Added `.wrangler/` to `.gitignore`
- [x] Updated `package.json` `api:dev` script path

## Planned

- [ ] Deploy latest build to Cloudflare Pages (`npm run build && wrangler pages deploy dist`)
- [ ] Set all secrets via `wrangler pages secret put`
- [ ] Migrate to Cloudflare Workers + Static Assets (after Pages is stable in production)

## Decisions

| Decision | Rationale |
|---|---|
| Cloudflare Pages over Vercel | Primary deployment on Cloudflare |
| Pages before Workers | Start with Pages (simpler), migrate to Workers later |
| Functions in `api/` + adapter in `functions/api/` | Single source of truth in `api/`; adapter pattern for Cloudflare compatibility |
| Neon PostgreSQL + Prisma | Serverless-optimized; works in Cloudflare with `nodejs_compat` |
| Supabase Auth | Handles JWT, sessions, OAuth out of the box |
| Razorpay | Standard for Indian e-commerce payments |

## Local Development

```bash
npm run dev        # Vite dev server on :5173
npm run api:dev    # API dev server on :3001 (tsx watch scripts/api-dev-server.ts)
npm run build      # prisma generate + tsc -b + vite build
```

## Deploy

```bash
npm run build
wrangler pages deploy dist
```
