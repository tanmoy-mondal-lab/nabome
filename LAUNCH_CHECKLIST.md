# নবME — Launch Readiness Audit

## 1. PRODUCTION CHECKLIST

### Environment
- [ ] `VITE_SUPABASE_URL` configured with production Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` configured with production anon key
- [ ] `VITE_CLOUDINARY_CLOUD_NAME` configured
- [ ] `VITE_CLOUDINARY_UPLOAD_PRESET` configured
- [ ] `VITE_ADMIN_EMAIL` set to admin email
- [ ] `VITE_GA_ID` set to production GA4 property ID
- [ ] `VITE_BREVO_API_KEY` configured for transactional emails
- [ ] Database schema applied via `src/lib/schema.sql`
- [ ] Supabase RLS policies enabled and tested
- [ ] Custom domain configured in Vercel + Supabase

### Build
- [ ] `npm run build` — zero errors
- [ ] `npx tsc -b --noEmit` — zero errors
- [ ] Bundle size verified (no chunk >500KB)
- [ ] Sourcemaps disabled in production
- [ ] Manual chunk splitting configured in `vite.config.ts`

### Deployment
- [ ] Vercel project linked to production branch
- [ ] Environment variables set in Vercel dashboard
- [ ] `vercel.json` configured with rewrites + security headers
- [ ] Custom domain pointed to Vercel nameservers
- [ ] HTTPS enforced (Vercel default)
- [ ] API serverless functions deployed and tested

---

## 2. SECURITY CHECKLIST

### Authentication
- [ ] Supabase Auth configured with email/password sign-in
- [ ] Password strength validation on registration
- [ ] Rate limiting on login (5 attempts / 15 min)
- [ ] Rate limiting on registration (3 attempts / hour)
- [ ] Rate limiting on password reset (3 attempts / hour)
- [ ] Session timeout configured (Supabase default: 1 hour)
- [ ] Admin routes protected by `RoleGuard` with `allowedRoles={["admin"]}`
- [ ] Vendor routes protected by `RoleGuard` with `allowedRoles={["vendor"]}`
- [ ] Customer routes protected by `ProtectedRoute`

### Data Validation
- [ ] Input sanitization (`sanitizeHtml`, `sanitizeFilename`)
- [ ] Email validation on registration
- [ ] Phone number validation on registration
- [ ] Form validation on all inputs
- [ ] File upload validation (type, size limits)

### Headers (Vercel)
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` camera/microphone/geolocation disabled

### Database (Supabase)
- [ ] RLS policies enabled on all tables
- [ ] `auth.uid()` checks on user-scoped tables
- [ ] Role-based access on sensitive operations
- [ ] Trigger `handle_new_user()` creates `public.users` row on signup
- [ ] No service role key exposed client-side

---

## 3. PERFORMANCE CHECKLIST

### Bundle
- [ ] Code splitting via `React.lazy()` on all routes
- [ ] Manual chunks: vendor, supabase, motion, charts, icons, qrcode
- [ ] Tree-shaking enabled (esbuild minification)
- [ ] CSS in single file (23 KB gzip: 6 KB)

### Images
- [ ] Cloudinary image transformations (`f_auto`, `q_auto`, `w_*`)
- [ ] Image lazy loading via `IntersectionObserver`
- [ ] Responsive image presets (product, thumbnail, banner, avatar, gallery)
- [ ] Favicon and apple-touch-icon defined
- [ ] Preconnect to Google Analytics + Supabase

### Caching
- [ ] Assets: `max-age=31536000, immutable`
- [ ] Images: `max-age=604800` (1 week)
- [ ] Service worker registered for offline support

### Metrics (Targets)
- [ ] Lighthouse Performance > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1

---

## 4. SEO CHECKLIST

### Meta Tags
- [ ] Unique `<title>` per page
- [ ] Unique `<meta name="description">` per page
- [ ] `<meta name="robots">` — index, follow on canonical pages; noindex on search/auth
- [ ] `<meta name="keywords">` on key pages
- [ ] `<meta name="viewport">` with `initial-scale=1.0`

### Open Graph
- [ ] `og:title` — per page
- [ ] `og:description` — per page
- [ ] `og:image` — per page with full URL
- [ ] `og:url` — canonical URL
- [ ] `og:type` — website / product / article
- [ ] `og:locale` — en_IN
- [ ] `og:site_name` — নবME

### Twitter Cards
- [ ] `twitter:card` — summary_large_image
- [ ] `twitter:site` — @nabome_online
- [ ] `twitter:title` / `twitter:description` / `twitter:image`

### Structured Data (JSON-LD)
- [ ] Organization (ClothingStore)
- [ ] Website (with SearchAction)
- [ ] Product (on product pages)
- [ ] BreadcrumbList (on all pages)
- [ ] Review (on product reviews)
- [ ] FAQ (on FAQ page)
- [ ] CollectionPage (on category pages)

### Technical
- [ ] Canonical URL on every page
- [ ] `sitemap.xml` submitted to Google Search Console
- [ ] `robots.txt` allowing all crawlers
- [ ] Hreflang alternate links configured
- [ ] 404 page returns proper 404 status
- [ ] Google Analytics + Search Console verified

### URLs
- [ ] Clean URL structure (`/product/name`, `/category/name`, `/shop/name`)
- [ ] No duplicate content issues
- [ ] No broken internal links

---

## 5. MARKETPLACE CHECKLIST

### Customer Experience
- [ ] Registration → Login flow works end-to-end
- [ ] Product browsing with category filtering
- [ ] Product detail with variant selection (size/color)
- [ ] Add to cart → Cart page → Checkout flow
- [ ] Order placement → Order success → Order tracking
- [ ] Wishlist add/remove
- [ ] Address management (CRUD)
- [ ] Profile update
- [ ] Password change
- [ ] Recently viewed products

### Vendor Experience
- [ ] Vendor registration → approval flow
- [ ] Vendor dashboard with analytics
- [ ] Product management (create/edit/delete)
- [ ] Order management
- [ ] Review management
- [ ] Inventory tracking
- [ ] Shop profile management

### Admin Experience
- [ ] Admin dashboard with revenue/vendor/customer stats
- [ ] Vendor approval/rejection/suspension
- [ ] Product moderation
- [ ] Category management
- [ ] Customer management
- [ ] Order management
- [ ] Review moderation
- [ ] Coupon management
- [ ] Banner management
- [ ] Notification management
- [ ] Reports and analytics
- [ ] System logs

### Transactions
- [ ] UPI QR code payment flow
- [ ] Cash on delivery flow
- [ ] WhatsApp assisted checkout
- [ ] Order status timeline
- [ ] Return request flow
- [ ] Invoice generation

### Legal
- [ ] Shipping policy
- [ ] Return policy
- [ ] Refund policy
- [ ] Cancellation policy
- [ ] Privacy policy
- [ ] Terms of service
- [ ] GDPR/CCPA compliance ready
