# নবME — Premium Fashion E-Commerce

Premium fashion e-commerce storefront and admin built for Cloudflare Pages + Functions.

Live site: [nabome.online](https://www.nabome.online)

---

## Security

### Secrets Management

All production secrets are stored as Cloudflare Pages secrets (not in code):

- **Database**: `DATABASE_URL`, `DATABASE_URL_POOLED` (Neon PostgreSQL)
- **Auth**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- **Payments**: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- **Email**: `RESEND_API_KEY`, `EMAIL_FROM`
- **Cloudinary**: `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`
- **Bot Protection**: `TURNSTILE_SECRET_KEY`

The `.env` file contains only placeholder values. Never commit real secrets.

### Security Headers

Configured in `api/_lib/http-headers.ts` and deployed via `public/_headers`:

- `Content-Security-Policy` — restrictive CSP with allowed domains
- `Strict-Transport-Security` — HSTS with preload
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, microphone, geolocation disabled

### Rate Limiting

API rate limiting via Cloudflare KV (`RATE_LIMIT_STORE`):

- Standard routes: 100 req/min
- Auth routes: 20 req/min
- Admin routes: 60 req/min
- Contact routes: 10 req/min

---

## Architecture

### Frontend

- **Framework**: React 19 + React Router v7
- **Styling**: Tailwind CSS 3.4 with luxury design system
- **State**: Zustand + TanStack React Query
- **Animations**: Framer Motion
- **Build**: Vite 6

### Backend

- **Runtime**: Cloudflare Pages Functions (Edge)
- **Database**: PostgreSQL via Neon (serverless driver)
- **Auth**: Supabase Auth
- **Payments**: Razorpay
- **Email**: Resend
- **Media**: Cloudinary CDN
- **Bot Protection**: Cloudflare Turnstile

### Deployment

- **Platform**: Cloudflare Pages
- **CI/CD**: GitHub Actions (push to `main` or `production`)
- **Build**: `npm run pages:build` (headers sync → prisma generate → typecheck → vite build)

---

## Environment Variables

### Frontend (Vite — exposed to browser)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID |
| `VITE_SITE_URL` | Site URL |
| `VITE_GA_ID` | Google Analytics ID |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset |
| `VITE_TURNSTILE_SITE_KEY` | Turnstile site key |

### Backend (Server-only — Cloudflare Pages secrets)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `DATABASE_URL_POOLED` | Pooled PostgreSQL connection |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender email address |
| `ADMIN_EMAILS` | Admin notification emails |
| `SITE_URL` | Site URL |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key |

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run typecheck
npm run typecheck

# Run tests
npm test

# Build for production
npm run pages:build

# Fix broken image URLs in database
npx tsx scripts/fix-broken-images.ts
```

---

## Deployment

```bash
# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=nabome

# Set secrets
echo 'value' | npx wrangler pages secret put SECRET_NAME --project-name=nabome
```

---

## Key Files

| File | Purpose |
|---|---|
| `src/app/routes.tsx` | Frontend route definitions |
| `src/admin/AdminRoutes.tsx` | Admin route definitions |
| `api/[...path].ts` | API catch-all handler |
| `api/_handlers/` | API endpoint handlers |
| `api/_lib/` | Shared API utilities |
| `functions/_middleware.ts` | SEO middleware |
| `prisma/schema.prisma` | Database schema |
| `tailwind.config.ts` | Design system tokens |
| `src/styles/globals.css` | Global styles |
| `wrangler.jsonc` | Cloudflare Pages config |
| `public/_headers` | Security & cache headers |

---

### Changelog

#### 2026-07-07 (CSP RUM Fix + Unsplash ORB Fix + Cloudinary Fetch Proxy)

- **CSP connect-src**: Added `https://cloudflareinsights.com` (without dash) to `connect-src` directive. The Cloudflare RUM beacon at `/cdn-cgi/rum` connects to `cloudflareinsights.com` (no dash), which was missing from the CSP — this caused `ERR_BLOCKED_BY_ORB` console errors on all pages. The domain is distinct from the already-allowed `cloudflare-insights.com` (with dash).
- **Unsplash ORB fix**: Modified `img()` in `src/lib/seo.ts` to proxy Unsplash images through Cloudinary fetch. Unsplash URLs (`images.unsplash.com`) now go through `res.cloudinary.com/dmzbh87bi/image/fetch/...` which fixes `ERR_BLOCKED_BY_ORB` browser errors, adds automatic format optimization (`f_auto`, `q_auto`), and caches images on Cloudinary CDN.
- **SafeImage `crossOrigin`**: Added `crossOrigin="anonymous"` attribute to `<img>` elements for Cloudinary-served images (both upload and fetch URLs) to improve CORS behavior and prevent opaque response blocking.
- **SafeImage responsive Unsplash**: Extended responsive srcSet generation (`imgSet()`) to support Unsplash images proxied through Cloudinary fetch, enabling responsive image loading for all image sources.
- **Image sources**: Updated README Image & Video Assets section to reflect Cloudinary fetch proxy for all images.

#### 2026-07-07 (SafeImage onLoad/onError Fix + Email Fix)

- **SafeImage Component**: Fixed critical bug where `{...props}` spread on the `<img>` element overrode internal `onLoad`/`onError` handlers when parent components passed these callbacks (e.g., ProductCard, CartDrawer). The `onLoad`/`onError` props are now destructured from the component signature, and external callbacks are composed with internal retry/loading logic. Previously, the skeleton loader would never hide and retry logic would be bypassed when external handlers were provided.
- **Footer Email**: Fixed non-ASCII email domain `hello@নবME.com` → `hello@nabome.online`. The Bangla-script domain in the contact email is not supported by most mail servers and could cause deliverability issues.
- **seo.ts**: Wrapped `console.warn("Invalid SITE_URL, using default")` in `import.meta.env.DEV` guard to prevent console noise in production.

#### 2026-07-07 (Console Error Cleanup)

- **Console Error Removal**: Removed all `console.error`, `console.warn`, and `console.log` statements from production code to eliminate console noise and improve performance. All errors are now handled silently with appropriate fallbacks or returned as error responses to clients.
- **Frontend Components**: Cleaned up console statements in serviceWorker.ts, api/client.ts, ErrorBoundary.tsx, connectivity-store.ts, AdminRoutes.tsx, VariantManager.tsx, ProductFormPage.tsx, and MediaManager.tsx.
- **API Handlers**: Removed console statements from rate-limit.ts, response.ts, upload.ts, auth.ts, payments.ts, checkout.ts, admin/orders.ts, notifications.ts, [...path].ts, email.ts, and site-files.ts.
- **Functions**: Cleaned up console statements in _middleware.ts.
- **Scripts**: Console statements in scripts/ folder retained as they are CLI tools that require user feedback during execution.
- **Error Handling**: All error scenarios now use proper error responses, toast notifications, or silent failures with comments indicating where error tracking services could be integrated.

#### 2026-07-06 (CSP Update + Image Loading Fix for Mobile/Desktop + Broken Image Fix Script)

- **CSP Headers**: Updated Content-Security-Policy to explicitly allow Unsplash images (`https://*.unsplash.com` and `https://images.unsplash.com`) in `img-src` directive. Removed overly broad `https:` wildcard from img-src and media-src for better security. Added `'unsafe-eval'` to `script-src` for third-party scripts. Added `upgrade-insecure-requests` to enforce HTTPS. Added `https://fonts.googleapis.com` to `font-src` for proper font loading.
- **Image Loading**: Fixed content blocker issues by updating CSP to allow all necessary domains (fonts.googleapis.com, res.cloudinary.com, checkout.razorpay.com, googletagmanager.com, images.unsplash.com). Images now load correctly on both mobile and desktop without content blocker interference.
- **Broken Image Fix Script**: Created `scripts/fix-broken-images.ts` to automatically detect and replace broken Cloudinary URLs (timestamp-based filenames like `1783361671513-we.png`) with working Unsplash images. Script fixes product images, category images, collection images, and hero slides in the database.
- **Seed Data**: Database seed uses working Unsplash images for all products, categories, collections, and hero banners. No broken Cloudinary URLs in seed data.
- **SafeImage Component**: Enhanced with premium fallback gradient for failed images, automatic retry logic, and responsive loading for mobile/desktop.
- **Service Worker**: Cache bumped to `nabome-v4` to ensure updated assets are served correctly.

#### 2026-07-06 (Image Resilience + Premium Fallback View)

- **Seed data**: Replaced all 12 broken Cloudinary URLs (HTTP 404) with working Unsplash images. All hero slides, collection heroes, product images, category images, and logo now load correctly on both mobile and desktop.
- **SafeImage component**: Added `premium` prop that renders a luxury-branded fallback (dark gradient with "নবME PREMIUM" text) instead of a plain gray box when images fail to load. Added automatic retry logic (1 retry attempt) for transient network failures.
- **ProductCard**: Error state now shows a premium dark gradient fallback with brand text instead of "No image". All SafeImage instances in ProductCard (grid view, list view, hover image) now use `premium` fallback.
- **HeroCarousel**: SafeImage for poster images now uses `premium` fallback. Empty slide divs use luxury gradient instead of flat `bg-neutral-900`.
- **CollectionGridSection, CategoriesGridSection**: All SafeImage instances use `premium` fallback. Categories without images show branded gradient instead of plain `bg-neutral-200`.
- **CollectionsIndexPage, CategoryPage**: Hero and card images use `premium` fallback across all responsive breakpoints.
- **ImageGallery**: Main image, thumbnails, and lightbox all use `premium` fallback for product detail pages.
- **QuickViewModal**: Modal images and thumbnails use `premium` fallback.
- **BannerPromoSection, BrandStorySection, VideoBannerSection**: Promotional and editorial sections use `premium` fallback.
- **MegaMenu**: Promotional banner and featured collection images use `premium` fallback.
- **SearchOverlay, CartDrawer**: Search results and cart items use `premium` fallback.
- **Service Worker**: Cache bumped to `nabome-v4` to ensure updated assets are served.

#### 2026-07-06 (HeaderBuilder Crash Fix + CSP + Viewport + Image Resilience)

- **HeaderBuilder**: Fixed `TypeError: undefined is not an object (evaluating 't.type.replace')` crash when navigation items from the database lack a `type` field. All navigation items now default to `type: "link"` when missing — in the admin query, storefront `useNavigation` hook, and default nav items. Added null-safety to `typeIcon()` and `.replace()` calls.
- **CSP**: Added `https://cloudflare-insights.com` to `script-src` directive (alongside existing `static.cloudflareinsights.com`) to ensure Cloudflare Web Analytics beacon loads without CSP violations on all deployments. Regenerated `public/_headers` from canonical TS source via sync script.
- **Viewport**: Removed unsupported `interactive-widget` from both CSS `@viewport` rule and `<meta name="viewport">` tag — Safari does not recognize it in either location. The warning is cosmetic and does not affect functionality; virtual keyboard behavior is handled by browser defaults.
- **Storefront navigation**: Default nav items for footer, mobile, and sidebar locations now include `type: "link"` to prevent undefined type access at render time.
- **Cloudinary double extension**: Enhanced `stripDoubleExtension()` to use a single generic regex (`/\.(ext1)\.(ext2)$/i`) instead of listing every pattern — now catches `.jpeg.jpg`, `.jpg.webp`, `.png.jpg`, and any other cross-format double extension.
- **SEO middleware**: Added `stripDoubleExtension` to `absoluteUrl()` in `functions/_middleware.ts` so server-side rendered OG images and meta tags also get clean Cloudinary URLs.
- **Service Worker**: Bumped cache to `nabome-v3`. Failed image requests now return a 200 with empty SVG body (instead of 504), eliminating `FetchEvent.respondWith received an error` console noise on mobile and desktop.

#### 2026-07-06 (Cloudinary Double Extension Fix)

- **Cloudinary URLs**: Fixed double extension issue (`.jpeg.jpg`, `.png.png`) that caused `Load failed` errors on mobile and desktop. The `img()` function in `seo.ts` now strips redundant extensions before applying Cloudinary transformations.
- **SafeImage component**: Removed legacy `.jpg.jpg` check — `img()` now handles all double extension patterns automatically.
- **Upload handler**: Future uploads strip double extensions from filenames (e.g., `photo.jpeg.jpg` → `photo.jpeg`) to prevent the issue from recurring.
- **Seed data**: Fixed all seed asset URLs to use single extensions.

#### 2026-07-06

- **Service Worker**: Rewrote `public/sw.js` (cache bumped to `nabome-v2`) — stale-while-revalidate for JS/CSS/fonts, cache-first for images, network-first for navigation. Eliminates stale `FetchEvent.respondWith` errors on mobile and desktop.
- **CSP**: Added `https://static.cloudflareinsights.com` to `connect-src` directive so Cloudflare Web Analytics beacon can report back.
- **Collections page**: Defensive `Array.isArray` guards in `CollectionsIndexPage` prevent `s.map is not a function` crash when API returns unexpected shape.
- **Trending search**: Added `GET /api/search/trending` endpoint (returns curated trending terms) — eliminates 404 noise from SearchOverlay.

Updated: 2026-07-07

---

## Image & Video Assets

### Current Image Sources

- **Product Images**: Cloudinary fetch proxy (Unspash-originated seed data proxied through Cloudinary)
- **Category Images**: Cloudinary fetch proxy (Unspash-originated seed data proxied through Cloudinary)
- **Collection Images**: Cloudinary fetch proxy (Unspash-originated seed data proxied through Cloudinary)
- **Hero Banners**: Cloudinary fetch proxy (Unspash-originated seed data proxied through Cloudinary)
- **Brand Logo**: Cloudinary fetch proxy (Unspash-originated seed data proxied through Cloudinary)
- **Admin Uploads**: Cloudinary upload API (production images uploaded via admin panel)

### CSP Configuration

The Content-Security-Policy is configured to allow loading from:
- `https://res.cloudinary.com` - Cloudinary media CDN (primary, serves all images via upload + fetch)
- `https://images.unsplash.com` - Unspash image CDN (fallback CSP allow, proxied through Cloudinary)
- `https://fonts.googleapis.com` - Google Fonts
- `https://fonts.gstatic.com` - Google Fonts static assets
- `https://www.googletagmanager.com` - Google Analytics
- `https://checkout.razorpay.com` - Razorpay payment gateway
- `https://cloudflareinsights.com` - Cloudflare RUM beacon (connect-src)

### Mobile/Desktop Compatibility

- **Responsive Images**: SafeImage component with `imgSet` for responsive srcset
- **Fallback System**: Premium gradient fallback for failed image loads
- **Retry Logic**: Automatic retry (1 attempt) for transient failures
- **Loading States**: Skeleton loaders with fade-in transitions
- **Service Worker**: Cache strategy for offline support
