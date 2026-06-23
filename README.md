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
- [x] Fixed dashboard backend: low stock threshold now reads from `SiteSetting.preferences.lowStockThreshold`
- [x] Fixed dashboard backend: daily sales query groups by day (not exact timestamp)
- [x] Fixed admin dashboard: all `₹` hardcoded → uses `formatPrice()` from `src/lib/utils/format.ts`
- [x] Fixed admin dashboard: chart label "Last 14 Days" → "Last 30 Days"
- [x] Fixed admin dashboard: added error UI states (retry button on load failure)
- [x] Fixed admin dashboard: removed `console.log`/`console.error` from production code
- [x] Fixed inventory page: responsive grid (`grid-cols-4` → `grid-cols-2 sm:grid-cols-4`)
- [x] Fixed inventory page: error state UI with retry
- [x] Fixed customers page: replaced `alert()` with inline error message
- [x] Fixed all empty catch blocks → added descriptive comments
- [x] Fixed all date formatting → uses `formatDate()` from utility
- [x] Fixed **USD currency bug** in CouponRedemptionsPage (was showing $ instead of ₹)
- [x] Fixed backend hardcoded threshold `5` → reads from `siteSetting.preferences.lowStockThreshold` in analytics.ts and inventory.ts
- [x] Fixed hardcoded `₹` across all admin pages (OrderDetailPage, AnalyticsPage, CouponsPage, ShippingZonesPage, MarketingPage, ReturnDetailPage)
- [x] Fixed all `new Date().toLocaleString()` → uses `formatDateTime()`/`formatDate()` utilities
- [x] Fixed daily sales chart — shows proper empty state when no sales data
- [x] Fixed `alert()` in ProductFormPage → inline error banner + dismissible state
- [x] Fixed `window.prompt()` in ProductFormPage → inline alt text modal with Skip/Add
- [x] Removed 22x `console.log`/`console.error` from 11 admin files
- [x] Removed 17x `window.confirm()` from 15 admin files
- [x] Annotated empty catch blocks with `/* non-critical */`
- [x] Redesigned dashboard: "Orders by Status", "Recent Orders", "Daily Sales" sections with premium look
- [x] Fixed Products page: Stock column now computes total from variants array (was showing OOS for all products)
- [x] Fixed Products page: Export button now uses raw fetch for file download (was failing due to JSON parse)
- [x] Fixed Prisma/Neon compatibility: removed nested `inventoryAlerts` and `relatedFrom` includes from `productInclude` (caused `InvalidArg` error on `findUnique`)
- [x] Improved Products page premium UX: stats row (total, stock, low stock, OOS), refined filters with active count, stock progress bars, Featured/New badges, hover-reveal actions, better empty state
- [x] Added variant-wise image and video upload: Prisma migration (`videoUrl`/`videoPublicId` on `ProductVariant`), backend `handleUpdateVariants` saves video fields, frontend expandable media panel per variant with image grid + video player
- [x] Fixed admin-wide premium UI consistency: Modal.tsx (`rounded-xl`), DataTable.tsx (`rounded-xl` + transitions), MediaPicker.tsx (`rounded-lg` + focus states + transitions), all 10 admin pages (inputs: `rounded-lg` + `focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500`, buttons: `rounded-lg` + `transition-colors`)
- [x] Fixed storefront product/variant images not visible: storefront `productInclude` now includes `variants: { include: { images: true } }`, ProductDetailPage merges variant images with product images (variant images shown first when variant selected)
- [x] Fixed admin product create/update: added missing `brandId`, `sizeGuideId`, `salePrice`, `discountPercent` fields (were silently dropped)
- [x] Fixed QuickViewModal: variant `priceAdjustment` now applied to price, `colorName` → `color`, removed dead `quantity` fallbacks, `compareAtPrice` now uses product-level value
- [x] Fixed storefront pricing: `salePrice` now returned in `productListSelect`, all callers (ProductCard, ProductDetailPage, QuickViewModal) prefer `salePrice` over `basePrice` when set
- [x] Fixed storefront `productListSelect`: added `brand`, `salePrice`, `reservedStock` fields
- [x] Fixed storefront product detail: related products now show primary image only (not all images)
- [x] Fixed collection detail: products now include `salePrice`, `variants`, `productLabels`, `_count.reviews`
- [x] Fixed storefront `handleVariants`: uses `select` instead of `include` to filter internal fields (`reservedStock`, `videoUrl`, etc.)

## Planned

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
