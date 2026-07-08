# Release Notes — নবME (Nabome) v1.0.0

**Release Date:** 2026-07-08
**Status:** ⚠️ PRE-RELEASE — Not for production use until P0 blockers resolved

---

## About

নবME ("Nabome" — Bengali for "New Me") is a premium single-brand fashion e-commerce platform. This is the initial release (v1.0.0) targeting the Indian market with a luxury shopping experience.

**Live URL:** https://www.nabome.online
**Stack:** React 19 + TypeScript + Cloudflare Pages + PostgreSQL (Neon)

---

## Features

### Storefront (Customer-Facing)
- **Homepage:** Dynamic CMS-managed sections (hero sliders, featured categories, new arrivals, trending products, testimonials, brand showcase, blog feed, newsletter signup, trust badges)
- **Product Catalog:** Grid/list views, category/collection filtering, size/color/brand/price filters, search with autocomplete
- **Product Detail:** Image gallery with zoom, variant selection (size/color), stock indicator, reviews with ratings, social share buttons, related products
- **Cart:** Full cart management (add, update quantity, remove), coupon code application, persistent across sessions (Zustand + localStorage)
- **Checkout:** Address management, order summary, Razorpay payment integration, coupon + tax + shipping calculations
- **Orders:** Order confirmation, order history, order detail with status timeline
- **Wishlist:** Add/remove products, share wishlist
- **Reviews:** Submit product reviews with ratings
- **Account:** Registration, login, password management, profile editing, address book
- **Legal:** Privacy policy, terms & conditions, shipping/returns policy, cookie consent banner
- **Contact:** Contact form with Turnstile bot protection
- **Newsletter:** Email subscription

### Admin Dashboard (46 Modules)
- **Dashboard:** 6 stat cards, sales chart, daily area chart, low-stock alerts, pending reviews, recent orders and customers
- **Products:** Full CRUD with grid/list toggle, bulk actions, CSV import/export, variant management, image gallery, SEO fields, scheduling
- **Orders:** Status tabs (10), search, timeline, status progression actions, admin notes
- **Customers:** DataTable with detail modal, order history, marketing toggle
- **Categories:** Hierarchical tree, CRUD with image, slug auto-generation
- **CMS:** Page builder with 14 section types, drag-and-drop, homepage builder, hero builder, header builder, footer builder
- **Marketing:** Coupons with usage limits, campaigns, announcements with color picker
- **Inventory:** Stock overview, low-stock alerts, movement history, stock adjustment
- **Returns:** Full return workflow (request → approve/reject → refund), evidence images, timeline
- **Settings:** 6 tabs (General, Shipping, Notifications, SEO, Newsletter, Footer)
- **Media Library:** Full-featured with drag-and-drop upload, folders, search, grid view, preview, edit
- **Users:** Auth activity (sessions + login attempts), role management
- **Support:** Tickets with replies, FAQ management
- **SEO:** Global meta, OG images, structured data, sitemap, robots.txt
- **Theme:** 8-tab design system editor (branding, colors, typography, buttons, layout, header, footer, custom CSS)
- **Integrations:** Social media links, webhook events, feature flags
- **Additional:** Brands, collections, size guides, lookbooks, labels, tags, gift cards, loyalty, referrals, abandoned carts, audit log, contacts, newsletter, search index, notifications

### Payment Processing
- Razorpay checkout integration (cards, UPI, net banking, wallets, EMI)
- Server-side payment verification (HMAC SHA-256)
- Webhook event handling (captured, failed, refund created, refund processed)
- Webhook idempotency via database dedup
- Admin refund reconciliation with Razorpay API

### Infrastructure
- Cloudflare Pages (edge rendering via Workers)
- Cloudflare Workers (API backend, edge functions)
- PostgreSQL on Neon (serverless, auto-scaling)
- Supabase Auth (JWT, email/password, magic link)
- Cloudinary (image CDN with transformations)
- Resend (transactional email)
- Cloudflare Turnstile (bot protection)
- Cloudflare KV (distributed rate limiting + feature flags)
- Cloudflare CDN (static assets with cache headers)
- GitHub Actions (CI/CD pipeline)
- Playwright (E2E tests across 3 browsers)
- Vitest (unit/integration tests)

---

## What's New Since Last Audit

### Fixed
- **Auth middleware session tests:** Fixed incomplete mock (missing `lastActiveAt`, `id` fields) causing `TypeError: Cannot read properties of undefined (reading 'getTime')` — 2 tests now passing
- **CSRF enforcement:** Verified active on all mutation endpoints
- **Webhook idempotency:** Verified via `@@unique([source, eventId])` constraint
- **Legal pages:** Privacy policy, terms, cookie consent, shipping/returns policy all published
- **Enum drift resolved:** CampaignType/SectionType synchronized with database
- **Database indexes:** 80+ composite indexes added for common query patterns
- **N+1 in order cancellation:** Replaced with batch operations (4 queries instead of ~2N+2)
- **P2 completion:** 21 of 24 P2 items resolved (87.5%)

### Changed
- Test count grew from 34 to 513 across 31 files (14x improvement)
- Admin sidebar consolidated from 50 to 46 items (removed duplicates)

### Deprecated
- None

### Known Issues
See `KNOWN_LIMITATIONS.md` for full list.

### Breaking Changes
- None (v1.0.0 initial release)

---

## Upgrade Notes

N/A — This is the initial release.

---

## Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 90+ | ✅ Full |
| Safari 15+ | ✅ Full |
| Edge 90+ | ✅ Full |
| iOS Safari 15+ | ✅ Full |
| Chrome Android | ✅ Full |
| Samsung Internet | ✅ Full |

### Screen Sizes
- Mobile: 320px–639px
- Tablet: 640px–1023px
- Desktop: 1024px+

---

## Performance Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| TTFB | < 800ms | ~13.6s | 🔴 (no Hyperdrive/Smart Placement) |
| FCP | < 1.5s | ~3-5s | 🔴 |
| LCP | < 2.5s | ~5-8s | 🔴 |
| TTI | < 3.5s | ~6-10s | 🔴 |
| CLS | < 0.1 | ~0.05 | ✅ |
| Lighthouse Performance | ≥ 90 | ~45-55 | 🔴 |
| Lighthouse Accessibility | ≥ 90 | ~92 | 🟡 |
| Lighthouse Best Practices | ≥ 90 | ~85 | 🟡 |
| Lighthouse SEO | ≥ 90 | ~95 | ✅ |

---

## Dependencies

### Runtime (19)
react 19, react-dom 19, react-router-dom 7, @tanstack/react-query 5, zustand 5, zod 3, framer-motion 12, i18next 26, lucide-react, class-variance-authority, clsx, tailwind-merge, @prisma/client 6, @neondatabase/serverless, @supabase/supabase-js, react-helmet-async, react-i18next, @dnd-kit/core, @dnd-kit/sortable

### Dev (18)
vite 6, vitest 4, playwright 1.61, typescript 5.8, eslint 10, tailwindcss 3.4, prisma 6, wrangler 4, postcss, autoprefixer, jsdom, @testing-library/react, @testing-library/jest-dom, tsx, dotenv, lightningcss, node-fetch, openapi-types

---

## Contributors

- **Developer:** Solo project (Tanmoy Mondal)

---

## Support & Feedback

- **Issues:** Report bugs via GitHub Issues
- **Security:** Report vulnerabilities to security@nabome.online (see `public/security.txt`)
- **Email:** support@nabome.online

---

## License

Proprietary — All rights reserved.

---

## Changelog Summary

### v1.0.0 (2026-07-08)
- Initial release
- Full storefront with 77+ routes
- Admin dashboard with 46 modules
- 170+ API endpoints
- Razorpay payment integration
- Supabase authentication
- 513 unit tests + 8 E2E specs
- CI/CD via GitHub Actions to Cloudflare Pages
