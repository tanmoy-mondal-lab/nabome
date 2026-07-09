# MASTER_ARCHITECTURE.md — নবME (Nabome)

> **Generated**: 2026-07-09
> **Purpose**: Complete technical documentation of the entire project.

---

## 1. Executive Summary

- **Project Name**: নবME (Nabome)
- **Purpose**: Premium fashion e-commerce platform — "where heritage craftsmanship meets contemporary elegance"
- **Target Users**: Fashion-conscious consumers in India (primarily) and globally
- **Supported Roles**: Guest (unauthenticated), Customer (authenticated), Admin
- **Business Flow**: Browse → Search → Filter → Product Detail → Cart → Checkout → Payment (Razorpay) → Order → Delivery → Returns/Reviews
- **Major Features**: Product catalog with variants (size/color), CMS-driven homepage, admin dashboard, customer dashboard, wishlist, cart (guest + authenticated), checkout, Razorpay payments, order management, returns/refunds, reviews, lookbooks, loyalty points, referral system, gift cards, subscriptions, support tickets, coupon/discount system, multi-language (EN/BN/HI), PWA support, dark mode, media management (Cloudinary), SEO engine, i18n
- **Technology Stack**: React 19 + TypeScript 5 + Vite 6 + TailwindCSS 3 + Cloudflare Pages + Neon PostgreSQL + Prisma 6 + Supabase Auth + Zustand + TanStack Query + Zod + Razorpay + Cloudinary + Resend + Cloudflare Turnstile
- **Current Version**: 1.0.0 (private)
- **Build Status**: CI/CD via GitHub Actions to Cloudflare Pages
- **Deployment Status**: Deployed at https://www.nabome.online
- **Known Limitations**: Hyperdrive disabled (530 errors on Prisma model queries); some env vars use placeholder values; no Sentry/error tracking integration; type errors exist in build pipeline (suppressed); seed data may not fully reflect production state

---

## 2. Technology Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | React (with Vite) | ^19.1.0 | UI library |
| **Build Tool** | Vite | ^6.3.2 | Frontend bundler |
| **Language** | TypeScript | ^5.8.3 | Type safety |
| **Styling** | Tailwind CSS | ^3.4.17 | Utility-first CSS |
| **CSS Minify** | Lightning CSS | ^1.32.0 | CSS optimization |
| **State (Global)** | Zustand | ^5.0.3 | Client state management |
| **State (Server)** | TanStack React Query | ^5.75.5 | Server state + caching |
| **Validation** | Zod | ^3.24.4 | Schema validation (client + server) |
| **Routing** | React Router DOM | ^7.5.0 | Client-side routing |
| **ORM** | Prisma | ^6.6.0 | Database ORM |
| **Database** | PostgreSQL (Neon) | Serverless | Primary data store |
| **Neon Adapter** | @prisma/adapter-neon | ^6.6.0 | Neon Prisma adapter |
| **Neon Serverless** | @neondatabase/serverless | ^1.1.0 | Neon driver |
| **Auth** | Supabase Auth | ^2.49.1 | Authentication provider |
| **Icons** | Lucide React | ^0.510.0 | Icon library |
| **Animation** | Framer Motion | ^12.9.2 | Page/component animations |
| **Drag & Drop** | @dnd-kit/core, sortable, utilities | ^6.3.1 / ^10.0.0 | Drag-and-drop CMS builder |
| **i18n** | i18next + react-i18next | ^26.3.4 / ^17.0.8 | Internationalization |
| **Lang Detector** | i18next-browser-languagedetector | ^8.2.1 | Auto language detection |
| **Helmet** | react-helmet-async | ^3.0.0 | SEO meta tags |
| **Classnames** | clsx + tailwind-merge + cva | Various | Utility class management |
| **Payment** | Razorpay (custom wrapper) | -- | Payment gateway |
| **Media CDN** | Cloudinary | -- | Image/video hosting + optimization |
| **Email** | Resend API | -- | Transactional emails |
| **Bot Protection** | Cloudflare Turnstile | -- | CAPTCHA replacement |
| **Cloud Provider** | Cloudflare Pages / Workers | -- | Hosting + serverless functions |
| **CI/CD** | GitHub Actions | -- | Deployment pipeline |
| **Testing (Unit)** | Vitest + Testing Library | ^4.1.9 / ^16.3.2 | Unit + component tests |
| **Testing (E2E)** | Playwright | ^1.61.1 | End-to-end tests |
| **Testing (Coverage)** | @vitest/coverage-v8 | ^4.1.10 | Code coverage |
| **ESLint** | ESLint + typescript-eslint | ^10.6.0 / ^8.62.1 | Linting |
| **Wrangler** | wrangler | ^4.105.0 | Cloudflare Pages CLI |
| **Logger** | pino + pino-pretty | ^10.3.1 / ^13.1.3 | Server-side logging |
| **Dotenv** | dotenv | ^16.6.1 | Local env management |
| **tsx** | tsx | ^4.19.4 | Run TypeScript scripts |

---

## 3. Project Folder Architecture

```
nabome/
  .env                          # Local environment variables (gitignored)
  .env.example                  # Environment variable template
  .github/workflows/deploy.yml  # CI/CD pipeline
  api/                          # Cloudflare Pages Functions (serverless API)
    [...path].ts                # Catch-all API router (main entry for all /api/*)
    health.ts                   # Health check endpoint
    robots.txt.ts / sitemap.xml.ts
    _handlers/                  # Route handlers (73 files: auth, products, cart, admin/*, etc.)
    _lib/                       # Shared server utilities (40 files: auth-middleware, prisma, email, etc.)
  dist/                         # Build output
  docs/phase13/
  e2e/                          # Playwright end-to-end tests (9 spec files)
  functions/                    # Legacy Cloudflare Pages Functions (SSR SEO middleware)
    _middleware.ts              # SSR SEO middleware
    api/[[path]].ts             # Legacy API router
  prisma/
    schema.prisma               # Complete DB schema (53 models, 18 enums)
    migrations/                 # 14 migrations
    seed-new/                   # Organized seed system (65 files)
    seed.ts                     # Legacy seed script
  public/                       # Static assets
    _headers, _redirects, sw.js, favicon.svg, icon-*.png, og-image.svg, site.webmanifest
  scripts/                      # Utility scripts (15 files)
  src/                          # Frontend source
    app/                        # App shell (main.tsx, App.tsx, routes.tsx)
    admin/                      # Admin panel (82 files)
    cms/                        # CMS type definitions (3 files)
    components/                 # Shared UI components
      ui/                       # Design system (17 components)
      auth/                     # Auth guards
      (AuthLoader, ErrorBoundary, SafeImage, etc.)
    hooks/                      # Shared React hooks (11)
    lib/                        # Shared libraries
      api/                      # API client + services (6 files)
      i18n/                     # Internationalization (EN, BN, HI)
      media/                    # Media management service (21 files)
      razorpay/                 # Razorpay integration (3 files)
      utils/                    # Utilities (cn, format, haptic, responsive)
      config.ts, constants.ts, seo.ts, validators.ts, etc.
    pages/                      # Standalone pages (LoginPage, RegisterPage, etc.)
    storefront/                 # Customer-facing storefront
      pages/                    # 27 pages
      components/               # 27 components
      sections/                 # 14 homepage sections
      layout/                   # 7 layout components
      hooks/                    # 11 storefront hooks
      stores/                   # 2 Zustand stores
      lib/                      # 1 recommendation engine
    stores/                     # Global stores (auth-store.ts)
    styles/globals.css          # Global styles + Tailwind
    types/product.ts            # Type definitions
  tailwind.config.ts, vite.config.ts, wrangler.jsonc, tsconfig.json, etc.
```

### Folder Purposes

| Folder | Purpose |
|---|---|
| `api/` | Cloudflare Pages Functions - serverless API backend handling all `/api/*` requests. Contains router, per-domain handlers, and shared utilities. |
| `functions/` | Legacy Cloudflare Pages Functions - SSR SEO middleware that injects meta tags into HTML responses. |
| `src/` | All frontend React application code |
| `src/app/` | App shell: entry point, root component, route definitions |
| `src/admin/` | Admin dashboard panel (40+ pages for management) |
| `src/cms/` | CMS type definitions and section registry for drag-and-drop homepage builder |
| `src/components/` | Shared UI components - design system, auth guards, error handling, PWA |
| `src/hooks/` | Shared React hooks - auth, dark mode, wishlist, recently viewed, product comparison |
| `src/lib/` | Shared libraries - API client, i18n, media management, Razorpay, SEO, validation |
| `src/pages/` | Top-level pages (auth pages, error pages) |
| `src/storefront/` | Customer-facing storefront - pages, components, layout, sections, hooks, stores |
| `src/stores/` | Global Zustand stores (auth) |
| `src/styles/` | Global CSS with Tailwind directives and design tokens |
| `src/types/` | TypeScript type definitions |
| `prisma/` | Database schema, migrations, seed data |
| `public/` | Static assets - favicon, PWA icons, service worker, headers, redirects |
| `scripts/` | Utility scripts for database ops, media cleanup, deployment helpers |
| `e2e/` | Playwright end-to-end tests |
| `.github/` | GitHub Actions CI/CD workflows |

---

## 4. Route Architecture

### Public Routes (unauthenticated)

| Route | Purpose | Component |
|---|---|---|
| `/` | Homepage | `HomePage` |
| `/products` | Product listing with filters | `ProductListingPage` |
| `/products/:slug` | Product detail | `ProductDetailPage` |
| `/search` | Search results | `SearchResultsPage` |
| `/cart` | Shopping cart | `CartPage` |
| `/wishlist` | Wishlist (localStorage guest) | `WishlistPage` |
| `/collections` | All collections | `CollectionsIndexPage` |
| `/collections/:slug` | Collection detail | `CollectionPage` |
| `/categories/:slug` | Category detail | `CategoryPage` |
| `/checkout` | Checkout flow | `CheckoutPage` |
| `/privacy` / `/terms` / `/shipping-returns` | Policy pages | `StaticPage` |
| `/faq` | FAQ page | `FaqPage` |
| `/lookbooks` | Lookbook listing | `LookbookPage` |
| `/lookbooks/:slug` | Lookbook detail with shoppable hotspots | `LookbookDetailPage` |
| `/:slug` | Generic CMS static pages | `StaticPage` |

### Auth Routes

| Route | Component |
|---|---|
| `/login`, `/auth/login` | `LoginPage` |
| `/register`, `/auth/register` | `RegisterPage` |
| `/forgot-password`, `/auth/forgot-password` | `ForgotPasswordPage` |
| `/reset-password`, `/auth/reset-password` | `ResetPasswordPage` |
| `/verify-email`, `/auth/verify-email` | `VerifyEmailPage` |

### Protected Routes (authenticated customer, via ProtectedRoute)

| Route | Component |
|---|---|
| `/account` | `DashboardPage` |
| `/account/orders` | `OrdersPage` |
| `/account/orders/:id` | `OrderDetailPage` |
| `/account/orders/:id/return` | `ReturnRequestPage` |
| `/account/orders/:id/tracking` | `OrderTrackingPage` |
| `/account/addresses` | `AddressesPage` |
| `/account/wishlist` | `WishlistPage` (server-synced) |
| `/account/notifications` | `NotificationsPage` |
| `/account/settings` | `SettingsPage` |
| `/account/support` | `SupportTicketsPage` |
| `/account/loyalty` | `LoyaltyPage` |
| `/account/referral` | `ReferralPage` |
| `/account/gift-cards` | `GiftCardsPage` |
| `/account/subscriptions` | `SubscriptionPage` |

### Admin Routes (require admin role, via AdminRoute)

All under `/admin/*` with `AdminRoutes` as the route tree. 40+ admin pages covering: dashboard, products, orders, customers, categories, collections, brands, coupons, inventory, analytics, CMS, settings, reviews, returns, support, campaigns, media, lookbooks, abandoned-carts, gift-cards, loyalty, referrals, newsletter, SEO, contacts, announcements, FAQ, size-guides, labels, templates, theme, import-export, social, webhooks, wishlists, audit-log, auth-activity, feature-flags, search-index.

### Protected Route Implementation

- **Guest Access**: Cart, wishlist, product browsing work without auth (localStorage-based)
- **Customer Access**: `/account/*` wrapped in `<ProtectedRoute>` checking `useAuthStore.isAuthenticated`
- **Admin Access**: `/admin/*` wrapped in `<AdminRoute>` -> `<ProtectedRoute requireAdmin>` additionally checking `useAuthStore.isAdmin`
- **API Protection**: Server-side `authenticate()` middleware validates Supabase JWT, session validity (expiry + idle timeout), and role

---

## 5. Complete Database Architecture

### Overview

- **Database**: PostgreSQL on Neon (serverless)
- **ORM**: Prisma 6 with `@prisma/adapter-neon`
- **Extensions**: `pg_trgm` (fuzzy text search), `pgcrypto`
- **Migration Strategy**: Prisma Migrate with 14 migrations
- **Relation Mode**: `foreignKeys`
- **Naming Convention**: snake_case for DB columns, camelCase for Prisma fields

### Enums (18 total)

| Enum | Values |
|---|---|
| `UserRole` | `customer`, `admin` |
| `Gender` | `men`, `women`, `unisex` |
| `OrderStatus` | `pending`, `confirmed`, `processing`, `packed`, `shipped`, `out_for_delivery`, `delivered`, `cancelled`, `returned`, `refunded` |
| `PaymentStatus` | `pending`, `paid`, `failed`, `refunded`, `partially_refunded` |
| `DiscountType` | `percentage`, `fixed` |
| `CampaignType` | `email`, `banner`, `popup`, `discount`, `flash_sale` |
| `SectionType` | `hero_slider`, `featured_collections`, `new_arrivals`, `categories_grid`, `brand_story`, `newsletter`, `testimonials`, `instagram_feed`, `banner_promo`, `product_grid`, `trust_bar`, `custom_html`, `video_banner` |
| `Visibility` | `all`, `logged_in`, `logged_out` |
| `MenuLocation` | `header`, `footer`, `mobile`, `sidebar` |
| `MediaType` | `image`, `video`, `document` |
| `ResourceType` | `image`, `video`, `raw` |
| `EntityType` | `settings`, `homepage`, `products`, `categories`, `collections`, `brands`, `labels`, `lookbooks`, `blogs`, `cms`, `sellers`, `users`, `temp` |
| `AnnouncementBarPosition` | `top`, `bottom` |
| `ReturnReason` | `wrong_item`, `damaged_product`, `size_issue`, `quality_issue`, `not_as_described`, `changed_mind`, `other` |
| `ReturnStatus` | `pending`, `approved`, `rejected`, `item_received`, `refund_initiated`, `completed` |
| `RefundStatus` | `pending`, `approved`, `processing`, `completed`, `failed` |
| `NotificationChannel` | `email`, `sms`, `in_app` |
| `NotificationEvent` | `order_placed`, `payment_success`, `payment_failed`, `order_confirmed`, `order_shipped`, `order_delivered`, `order_cancelled`, `return_requested`, `return_approved`, `return_rejected`, `refund_processed`, `welcome`, `password_reset`, `account_update`, `email_change`, `email_verification`, `contact_form` |
| `SupportTicketStatus` | `open`, `in_progress`, `resolved`, `closed` |
| `SupportTicketPriority` | `low`, `medium`, `high`, `urgent` |
| `AssetType` | `image`, `video`, `document` |

### Models (53 total)

**Profile** (`profiles`): Primary user model. Fields: id, role (UserRole, default customer), email (unique), firstName, lastName, phone, avatarUrl, isActive, emailVerified, verificationToken, verificationTokenExpiresAt, pendingEmail, pendingEmailToken, pendingEmailTokenExpiresAt, resetPasswordToken, resetPasswordTokenExpiresAt, lastLoginAt, loginCount, preferences (JSON), phoneVerified, marketingOptIn, notificationPreferences (JSON), timestamps. Relations: addresses, sessions, cart, couponRedemptions, purchasedGiftCards, redeemedGiftCards, loginAttempts, loyaltyPoints, notifications, orderHistoryEntries, orders, referralCode, referredReferrals, refunds, returnRequests, reviews, subscriptions, supportReplies, assignedTickets, supportTickets, userActionLogs, verificationAttempts, wishlistItems.

**AuthSession** (`auth_sessions`): Tracks active sessions for JWT refresh rotation + device management. Fields: id, profileId, accessToken (unique, hashed), refreshToken (unique, hashed), refreshTokenExpiresAt, userAgent, ipAddress, deviceName, isActive, revokedAt, rotatedFromSessionId, lastActiveAt, expiresAt, timestamps. Relations: profile, rotatedFrom (self-ref), rotatedSessions (self-ref).

**LoginAttempt** (`login_attempts`): Audit log for login attempts.

**VerificationAttempt** (`verification_attempts`): Rate limiting for email verification.

**UserActionLog** (`user_action_logs`): General audit log for user actions.

**ApiKey** (`api_keys`): API keys for programmatic access with versioning and deprecation.

**Category** (`categories`): Hierarchical (self-referencing parent). Fields: id, name, slug (unique), description, imageUrl, imagePublicId, parentId, sortOrder, isActive, metaTitle, metaDesc, timestamps. Relations: parent, children, products, sizeGuides, subcategories.

**Subcategory** (`subcategories`): Sub-categories under a category. Fields: id, name, slug (unique), description, imageUrl, imagePublicId, categoryId (FK, cascade), sortOrder, isActive, timestamps.

**Collection** (`collections`): Product collections/curations. Fields: id, name, slug (unique), description, heroImageUrl, heroImagePublicId, isActive, isFeatured, startDate, endDate, sortOrder, metaTitle, metaDesc, timestamps.

**Brand** (`brands`): Product brands. Fields: id, name, slug (unique), description, logoUrl, logoPublicId, websiteUrl, sortOrder, isActive, timestamps.

**SizeGuide** (`size_guides`): Size guide charts. Fields: id, name, slug (unique), description, categoryId (opt), type (default: clothing), unit (default: inches), imageUrl, imagePublicId, measurements (JSON), isActive, timestamps.

**Product** (`products`): Core product entity. 30+ fields including name, slug (unique), description, shortDescription, categoryId, subcategoryId, collectionId, brandId, basePrice (Decimal), compareAtPrice, costPrice, salePrice, discountPercent (SmallInt), currency (INR), material, careInstructions, sizeChartUrl, sizeChartPublicId, sizeGuideId, isActive, isFeatured, isNew, gender (Gender), sortOrder, publishedAt, scheduledPublishAt, scheduledArchiveAt, metaTitle, metaDesc, timestamps. 15 indexes for optimized queries.

**ProductVariant** (`product_variants`): SKU-level variant with size/color/stock. Fields: id, productId, sku (unique), size, color, colorHex, priceAdjustment (Decimal), stock, reservedStock, weight, videoUrl, videoPublicId, isActive, timestamps. Unique: [productId, size, color].

**ProductImage** (`product_images`): Product images with optional variant association. Fields: id, productId, variantId, url, publicId, altText, sortOrder, isPrimary, type (default: image).

**ProductAttribute** (`product_attributes`): Key-value attributes (e.g., Fabric: Cotton).

**RelatedProduct** (`related_products`): Bidirectional product relations with type (related, upsell, cross_sell).

**ProductTag** / **ProductTagOnProduct**: Many-to-many product tags.

**ProductLabel** / **ProductLabelOnProduct**: Many-to-many product labels with color.

**InventoryAlert** (`inventory_alerts`): Low stock/out-of-stock alerts with thresholds.

**InventoryMovement** (`inventory_movements`): Audit trail for stock changes.

**Cart** (`carts`): One per profile with expiry. Fields: id, profileId (unique), expiresAt, timestamps.

**CartItem** (`cart_items`): Items in cart with saved-for-later. Unique: [cartId, variantId].

**Order** (`orders`): Complete order with payment/shipping tracking. 30+ fields including orderNumber (unique), profileId, email, status (OrderStatus), subtotal, shippingCost, tax, discount, couponCode, total, currency, paymentMethod, paymentStatus (PaymentStatus), razorpayOrderId, razorpayPaymentId, shippingAddressId, billingAddressId, giftMessage, notes, shippedAt, deliveredAt, cancelledAt, cancellationReason, refundedAt, internalNotes, invoiceUrl, returnRequestedAt, trackingNumber, carrier, trackingUrl. 14 indexes.

**OrderItem** (`order_items`): Denormalized snapshot of product at order time.

**OrderStatusHistory** (`order_status_history`): Audit trail for status changes.

**Address** (`addresses`): Unified shipping/billing addresses. Fields: id, profileId, label, fullName, phone, line1, line2, city, district, state, pincode, country (default: India), isDefault, isBillingDefault, addressType (default: shipping), timestamps.

**WishlistItem** (`wishlist_items`): Per-user wishlist. Unique: [profileId, variantId].

**Review** (`reviews`): Product reviews with images and approval workflow. Unique: [productId, profileId, orderId].

**ReturnRequest** (`return_requests`): Customer returns with evidence images and admin review.

**Refund** (`refunds`): Refund records linked to return requests.

**Coupon** (`coupons`): Discount codes with usage limits, conditions, and dates.

**CouponRedemption** (`coupon_redemptions`): Tracks coupon usage per user per order.

**Campaign** (`campaigns`): Marketing campaigns of various types.

**AnnouncementBar** (`announcement_bars`): Top/bottom announcement banners with scheduling.

**HomepageSection** (`homepage_sections`): CMS-driven homepage sections (drag-and-drop orderable, 13 types).

**NavigationMenu** (`navigation_menus`): Navigational menus for header/footer/mobile/sidebar.

**FooterSection** (`footer_sections`): Footer content columns.

**StaticPage** (`static_pages`): CMS-managed static pages with templates and SEO.

**Lookbook** / **LookbookItem**: Curated lookbooks with shoppable hotspot items.

**FAQ** (`faqs`): Frequently asked questions with categories.

**PageTemplate** (`page_templates`): Reusable page layout templates.

**MediaAsset** (`media_assets`): Centralized media asset tracking. 25+ fields covering Cloudinary integration, entity association, metadata.

**SiteSetting** (`site_settings`): Global site configuration (single row). 20+ fields for branding, contact, analytics, theme, SEO, preferences.

**SocialMediaLink** (`social_media_links`): Social media profile links.

**Currency** (`currencies`): Multi-currency support with exchange rates.

**ContactSubmission** (`contact_submissions`): Contact form entries.

**NewsletterSubscriber** (`newsletter_subscribers`): Email subscriptions.

**Notification** (`notifications`): In-app and email notifications with read tracking and retry.

**NotificationTemplate** (`notification_templates`): Content templates per event type.

**SupportTicket** / **SupportTicketReply**: Customer support tickets with thread replies, priority, assignment.

**LoyaltyPoints** / **LoyaltyTransaction** / **LoyaltyTier**: Points-based loyalty program with tiered benefits.

**ReferralCode** / **Referral**: Referral program tracking.

**GiftCard** (`gift_cards`): Digital gift cards with balance tracking.

**SubscriptionPlan** / **Subscription** / **SubscriptionInvoice**: Subscription management with Razorpay integration.

**AnalyticsEvent** (`analytics_events`): Raw analytics event tracking.

**WebhookEvent** (`webhook_events`): Incoming webhook event log (Razorpay).

### Key Relationships (Conceptual ER)

```
Profile --1:1-- Cart
Profile --1:N-- Address | Order | Review | WishlistItem | Notification | SupportTicket | ReturnRequest | AuthSession
Profile --1:1-- LoyaltyPoints | ReferralCode
Product --N:1-- Category | Subcategory | Collection | Brand
Product --1:N-- ProductVariant | ProductImage | ProductAttribute | Review
Product --M:N-- ProductTag (via ProductTagOnProduct) | ProductLabel (via ProductLabelOnProduct)
Product --M:N-- RelatedProduct (self-ref)
ProductVariant --1:N-- CartItem | OrderItem | WishlistItem | InventoryMovement | InventoryAlert
Order --1:N-- OrderItem | OrderStatusHistory | ReturnRequest | Refund | Notification | WebhookEvent
Category --self-ref (parent/children) --1:N-- Subcategory | SizeGuide
Lookbook --1:N-- LookbookItem --N:1-- Product
Coupon --1:N-- CouponRedemption
ReferralCode --1:N-- Referral
SubscriptionPlan --1:N-- Subscription --1:N-- SubscriptionInvoice
SupportTicket --1:N-- SupportTicketReply
MediaAsset --(polymorphic via entityType/entityId)-- any entity
```

---

## 6. Authentication Architecture

### Approach

Nabome uses **Supabase Auth** for authentication with a **custom session management** layer built on top.

1. **Registration**: Email + password + profile info -> Supabase creates user -> Profile row created -> Email verification sent
2. **Login**: Credentials verified by Supabase -> Session created in custom `auth_sessions` table -> JWT returned
3. **Session**: Access token (short-lived JWT) + Refresh token (long-lived, hash stored in `auth_sessions`) + Expiry
4. **Token Refresh**: Proactive refresh before expiry (60s margin) via 30s interval; also automatic 401 -> refresh -> retry in API client
5. **Logout**: Supabase session invalidated + `auth_sessions` row deactivated + client state cleared

### Components

| Component | File | Purpose |
|---|---|---|
| Auth Store | `src/stores/auth-store.ts` | Zustand store (persisted to localStorage) holds user, tokens, auth state |
| Auth API | `src/lib/api/auth.ts` | API client methods for all auth endpoints |
| API Client | `src/lib/api/client.ts` | HTTP client with Bearer token injection, 401 auto-refresh, CSRF |
| Auth Middleware | `api/_lib/auth-middleware.ts` | Server-side JWT verification, session resolution, role check |
| useAuth Hook | `src/hooks/useAuth.ts` | React hook wrapping auth store + API with auto-refresh timer |
| ProtectedRoute | `src/components/auth/ProtectedRoute.tsx` | Route guard checking isAuthenticated |
| AdminRoute | `src/components/auth/AdminRoute.tsx` | Route guard also checking isAdmin |
| AuthLoader | `src/components/AuthLoader.tsx` | Component that restores session on app mount |

### Session Management

- **Access Token**: JWT issued by Supabase, verified via `supabase.auth.getUser(token)`
- **Refresh Token**: SHA-256 hashed in `auth_sessions`, rotated on refresh (token rotation)
- **Idle Timeout**: 2 hours of inactivity -> session revoked
- **Device Tracking**: userAgent, ipAddress, deviceName per session
- **Concurrent Sessions**: Multiple sessions per user supported

### Security Measures

- **Password Policy**: Min 8 chars, uppercase + lowercase + number (Zod)
- **Rate Limiting**: Auth endpoints: 5 req/min per IP
- **Turnstile**: Login, register, password reset, email verification
- **CSRF**: Double-submit cookie for state-changing requests
- **Token Hashing**: SHA-256 before DB storage
- **Email Verification**: Required for certain operations (configurable)
- **Session Rotation**: Old session deactivated when new token issued

---

## 7. Authorization Matrix

| Feature | Guest | Customer | Admin |
|---|---|---|---|
| Browse products | Yes | Yes | Yes |
| View product detail | Yes | Yes | Yes |
| Search & filter | Yes | Yes | Yes |
| View cart | Yes | Yes | Yes |
| Add to cart (localStorage) | Yes | Yes | Yes |
| Add to wishlist (localStorage) | Yes | Yes | Yes |
| Checkout | No | Yes | Yes |
| Place order | No | Yes | Yes |
| View own orders | No | Yes | Yes |
| Manage addresses | No | Yes | Yes |
| Submit reviews | No | Yes | Yes |
| Request returns | No | Yes | Yes |
| Support tickets | No | Yes | Yes |
| Loyalty & referrals | No | Yes | Yes |
| Account settings | No | Yes | Yes |
| Admin dashboard | No | No | Yes |
| CRUD products | No | No | Yes |
| Manage orders (all) | No | No | Yes |
| Manage customers | No | No | Yes |
| Manage CMS | No | No | Yes |
| Manage site settings | No | No | Yes |
| Moderate reviews | No | No | Yes |
| Manage coupons | No | No | Yes |
| View analytics | No | No | Yes |
| Import/export data | No | No | Yes |
| Manage feature flags | No | No | Yes |
| View audit logs | No | No | Yes |
| Manage media library | No | No | Yes |
| Process returns/refunds | No | No | Yes |

---

## 8. Backend Architecture

### Request Pipeline

```
Request -> Cloudflare CDN -> Pages Functions SSR Middleware (functions/_middleware.ts)
                         -> API Router (api/[...path].ts)
                             -> Auth Middleware (JWT + session + role)
                             -> Rate Limiter (KV sliding window)
                             -> CSRF Validation
                             -> Turnstile (sensitive endpoints)
                             -> Dispatch to Handler
                                 -> Validate Body (Zod)
                                 -> Business Logic (Prisma)
                                 -> Media Service (Cloudinary + DB)
                                 -> Email Service (Resend)
                             -> Response (standardized JSON)
```

### Services Layer

| Service | File | Purpose |
|---|---|---|
| Auth Middleware | `api/_lib/auth-middleware.ts` | JWT, session, role, rate-limit, CSRF |
| Prisma | `api/_lib/prisma.ts` | Singleton PrismaClient with Neon adapter |
| Email | `api/_lib/email.ts` | Send via Resend API |
| Email Templates | `api/_lib/email-templates.ts` | HTML template builder (12 types) |
| Rate Limiter | `api/_lib/rate-limit.ts` | KV sliding window |
| CSRF | `api/_lib/csrf.ts` | Double-submit cookie |
| Turnstile | `api/_lib/turnstile.ts` | Cloudflare Turnstile verification |
| Media Service | `api/_lib/media-service.ts` | Orchestrates Cloudinary + DB |
| Validation | `api/_lib/validate.ts` | Zod body validation |
| Response | `api/_lib/response.ts` | Standardized JSON helpers |
| Audit Trail | `api/_lib/audit-trail.ts` | User action logging |
| Cache | `api/_lib/cache.ts` | In-memory TTL cache |
| Cache Purge | `api/_lib/cache-purge.ts` | Cache invalidation |
| Query Optimizer | `api/_lib/query-optimizer.ts` | Prisma query optimization |
| Logger | `api/_lib/logger.ts` | Pino structured logging |
| Token Hash | `api/_lib/token-hash.ts` | SHA-256 for tokens |
| Transaction | `api/_lib/transaction.ts` | Prisma transaction wrapper |
| Backup Automation | `api/_lib/backup-automation.ts` | Automated DB backup |
| Health Monitor | `api/_lib/health-monitor.ts` | System health checks |

### Background Jobs

No dedicated background job system exists. Email sending and notifications happen inline. Cron jobs are not implemented (scripts exist but must be run manually).

---

## 9. Frontend Architecture

### App Component Tree

```
main.tsx
  HelmetProvider
    ConnectivityProvider
      App.tsx
        QueryClientProvider (staleTime: 5min, retry: 1)
          BrowserRouter
            Suspense (lazy loading)
              ErrorBoundary
                Toaster
                  Routes
                    StorefrontLayout (Header + Footer + MobileNav + BottomNav + CartDrawer + SearchOverlay)
                    AuthRoutes (standalone)
                    AdminRoutes (AdminLayout)
                AuthLoader
                GoogleAnalytics
                CookieConsent
                PwaInstallPrompt
```

### Key Patterns

- **Lazy Loading**: All pages via `React.lazy()` + `Suspense`
- **Error Boundaries**: Routes wrapped in `ErrorBoundary`
- **Server State**: TanStack React Query for API data
- **Client State**: Zustand for auth, cart, UI state (persisted)
- **Route Guards**: `ProtectedRoute` and `AdminRoute`
- **SEO**: `react-helmet-async`
- **i18n**: `react-i18next` with EN/BN/HI
- **Animations**: Framer Motion
- **PWA**: Service worker + web manifest + install prompt
- **Design System**: TailwindCSS + CSS variables (gold/luxe palette)
- **Dark Mode**: System preference detection + localStorage

---

## 10. UI Component Inventory

### Design System (src/components/ui/)

Button, Input, Select, Badge, Card, Label, Toaster (with useToast hook), Dialog, Skeleton, LoadingSpinner, Breadcrumbs, ImageGallery, VariantSelector, ProductQA, RelatedProducts.

### Storefront Components (src/storefront/components/)

ProductCard, ProductGrid, HeroCarousel, CartDrawer, QuickViewModal, ImageGallery, SizeSelector, ColorSelector, QuantitySelector, PriceDisplay, StarRating, Reviews, SocialShare, Breadcrumbs, NewsletterForm, RecentlyViewed, ProductRecommendations, FrequentlyBoughtTogether, ShopTheLook, SocialProof, ConnectivityIndicators, ScrollToTop, DashboardSidebar, checkout/AddressForm, checkout/OrderSummary.

### Homepage Sections (src/storefront/sections/)

SectionRenderer, HeroSliderSection, CollectionGridSection (featured collections), NewArrivalsSection, CategoriesGridSection, BrandStorySection, NewsletterSection, TestimonialsSection, InstagramFeedSection, BannerPromoSection, ProductGridSection, TrustBarSection, CustomHTMLSection, VideoBannerSection.

### Admin Common Components

DataTable, EmptyState, MediaPicker, Modal, StatsCard, StatusBadge. Skeletons: TableSkeleton, CardGridSkeleton, DetailSkeleton, FormSkeleton, StatsSkeleton.

### Shared Components

SafeImage (with Cloudinary transforms, lazy loading, fallback, retry), ErrorBoundary, ErrorPages (401/403/404/500/maintenance), AuthLoader, ConfirmDialog, CookieConsent, CurrencySelector, LanguageSwitcher, OfflineBanner, PasswordInput, PhoneInput, PwaInstallPrompt, SkipToContent, TurnstileWidget, GoogleAnalytics.

---

## 11. State Management

### Architecture

- **React State**: Component-local (form inputs, toggles)
- **Zustand (Global Client State)**: auth-store (persisted), cart-store (persisted per-user), ui-store, connectivity-store
- **TanStack React Query (Server State)**: All API data with 5min stale time
- **localStorage Persistence**: nabome-auth, nabome-cart-{userId}, nabome-wishlist, nabome-recently-viewed, nabome-comparison, nabome-lang, nabome-dark-mode

### Zustand Stores

| Store | File | Persisted | Purpose |
|---|---|---|---|
| auth-store | `src/stores/auth-store.ts` | Yes | User, tokens, auth state |
| cart-store | `src/storefront/stores/cart-store.ts` | Yes (per-user) | Cart items, coupon, totals, sync |
| ui-store | `src/storefront/stores/ui-store.ts` | No | Search, menu, mega menu, cart drawer |
| connectivity-store | `src/storefront/store/connectivity-store.ts` | No | Online/offline state |

---

## 12. Product System

### Data Model

Product -> Variants (size + color, SKU, stock, price adjustment), Images (with primary flag), Attributes (key-value), Related Products (bidirectional), Reviews, Tags (M:N), Labels (M:N), Size Guide.

### Pricing: basePrice + variant.priceAdjustment = effective price. Optional compareAtPrice (strikethrough), salePrice (override), costPrice (internal).

### Inventory: stock - reservedStock = available. Audit trail via InventoryMovement. Alerts via InventoryAlert.

### Coupons: percentage or fixed, with minOrderValue, maxDiscount, usage limits, per-user limits, gender restriction, date range.

### Search: PostgreSQL pg_trgm full-text search, filterable by category, collection, brand, gender, price, size, color.

### Reviews: 1-5 stars, with approval workflow, images, unique per product+profile+order.

### Recently Viewed: localStorage, max 20 items.

### Wishlist: Guest = localStorage, Authenticated = server-synced.

### Product Comparison: localStorage, max 4 items.

### Recommendations: Manual (RelatedProduct) + Algorithmic (category/brand/collection similarity).

---

## 13. Customer Flow

Landing -> Browse -> Product Detail -> Cart -> Checkout -> Payment (Razorpay) -> Order Confirmation -> Order Tracking -> Returns -> Reviews -> Account Dashboard.

---

## 14. Seller Flow

**Not implemented.** No seller/merchant role exists. DB has `EntityType.sellers` and `prisma/seed-new/sellers/` was planned but not implemented.

---

## 15. Admin Flow

Complete admin panel with 40+ pages: Dashboard, Products (CRUD, bulk, variants, images, related), Orders (list, detail, status updates, tracking), Categories (hierarchical), Collections, Brands, Customers, Coupons, Inventory, Analytics, CMS (Homepage builder with 13 section types, header, footer, hero, pages), Media Library, Reviews (moderation), Returns (approve/reject/refund), Support Tickets, Settings (site, shipping, tax, payment, analytics, SEO, theme), Campaigns, Announcements, Newsletter, SEO, Lookbooks, Loyalty, Gift Cards, Referrals, Abandoned Carts, Import/Export, Feature Flags, Webhooks, Audit Log, Auth Activity, Search Index, Size Guides, Labels, Page Templates, Theme Builder, Notifications.

---

## 16. CMS Architecture

### Editable Content Areas

Homepage (13 section types, drag-and-drop, visibility scheduling), Header navigation, Footer content, Hero slides, Announcement bars, Static pages, FAQs, SEO defaults, Lookbooks with shoppable hotspots, Navigation menus, Page templates.

### Homepage Builder Sections

1. hero_slider (full-width carousel)
2. featured_collections (grid)
3. new_arrivals (latest products)
4. categories_grid
5. brand_story
6. newsletter (email signup)
7. testimonials (carousel)
8. instagram_feed
9. banner_promo
10. product_grid (custom selection)
11. trust_bar (free shipping, returns)
12. custom_html (embeds)
13. video_banner

Each section has: sectionType, content (JSON), styles (JSON), sortOrder, visibility (all/logged_in/logged_out), publishAt/expireAt.

---

## 17. API Documentation

### Standard Response Format

Success: `{ "success": true, "data": {...}, "timestamp": "..." }`
Error: `{ "success": false, "error": { "code": "...", "message": "...", "status": 400 }, "requestId": "...", "timestamp": "..." }`
Paginated: `{ "success": true, "data": [...], "pagination": { "total": N, "page": 1, "pageSize": 12, "totalPages": N }, "timestamp": "..." }`

### Key Endpoint Groups

**Auth** (14 endpoints): register, login, logout, refresh, me, updateMe, forgot-password, verify-reset-code, reset-password, change-password, verify-email, resend-verification, change-email, verify-email-change, sessions

**Products** (9 endpoints): GET /products, GET /products/:slug, admin CRUD + images + variants

**Cart & Checkout** (9 endpoints): GET cart, add/update/remove items, apply/remove coupon, merge guest cart, checkout (authenticated + guest)

**Orders** (9 endpoints): customer order list/detail/cancel/tracking/invoice, admin CRUD + status update

**Payments** (3 endpoints): verify payment, report failed, retry

**CMS** (10+ endpoints): homepage sections CRUD, reorder, static pages, navigation, footer

**Dashboard** (2 endpoints): customer dashboard, admin dashboard

**Media** (5+ endpoints): upload, media library CRUD, integrity check

Plus 30+ additional handler groups for categories, collections, brands, coupons, reviews, returns, refunds, support, notifications, settings, etc.

---

## 18. Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| DATABASE_URL | Yes | Neon PostgreSQL direct connection |
| DATABASE_URL_POOLED | Yes | Neon pooled connection (used in prod) |
| SUPABASE_URL | Yes | Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Yes | Supabase admin key (server-only) |
| SUPABASE_ANON_KEY | Yes | Supabase anon key |
| RAZORPAY_KEY_ID | Yes | Razorpay API key |
| RAZORPAY_KEY_SECRET | Yes | Razorpay secret |
| RAZORPAY_WEBHOOK_SECRET | If webhooks | Webhook signing secret |
| RESEND_API_KEY | If email | Resend API key |
| EMAIL_FROM | If email | Sender address |
| ADMIN_EMAILS | If admin notifications | Comma-separated admin emails |
| CLOUDINARY_CLOUD_NAME | Yes | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Yes | Cloudinary API key |
| CLOUDINARY_API_SECRET | Yes | Cloudinary API secret |
| CLOUDINARY_UPLOAD_PRESET | If upload | Upload preset |
| TURNSTILE_SECRET_KEY | If bot protection | Turnstile secret key |
| SITE_URL | Yes | Production site URL |
| VITE_SUPABASE_URL | Yes | Supabase URL (browser) |
| VITE_SUPABASE_ANON_KEY | Yes | Supabase anon key (browser) |
| VITE_RAZORPAY_KEY_ID | Yes | Razorpay key (browser) |
| VITE_SITE_URL | Yes | Site URL (browser) |
| VITE_GA_ID | If analytics | Google Analytics ID |
| VITE_CLOUDINARY_CLOUD_NAME | Yes | Cloudinary cloud (browser) |
| VITE_CLOUDINARY_UPLOAD_PRESET | If upload | Upload preset (browser) |
| VITE_TURNSTILE_SITE_KEY | If bot protection | Turnstile site key (browser) |

---

## 19. Third Party Services

| Service | Purpose | Integration |
|---|---|---|
| Supabase | Authentication | Server-side admin client + client-side anon |
| Neon | Serverless PostgreSQL | @neondatabase/serverless + @prisma/adapter-neon |
| Cloudinary | Image/video hosting + CDN | Custom service layer (src/lib/media/) |
| Razorpay | Payment gateway | Client SDK + server-side webhooks |
| Resend | Transactional email | Direct API (fetch to api.resend.com) |
| Cloudflare Turnstile | Bot detection | Widget + server-side verification |
| Google Analytics (GA4) | Visitor analytics | Client-side script |
| Cloudflare Pages | Hosting + CDN + Functions | Wrangler CLI |
| Cloudflare KV | Rate limiting + feature flags | Wrangler binding |
| Cloudflare Hyperdrive | DB connection pooling | DISABLED (530 errors) |
| GitHub Actions | CI/CD | GitHub workflow |

---

## 20. Deployment Architecture

### Pipeline

Developer Push -> GitHub Actions -> Quality checks (npm ci, prisma generate, tsc, lint, test) -> Build (npm run pages:build -> dist/) -> Deploy to Cloudflare Pages

### Environments

- main/production -> https://www.nabome.online
- staging -> staging.nabome.pages.dev
- PR -> Preview deployment with comment

### Infrastructure

| Component | Technology |
|---|---|
| Hosting | Cloudflare Pages (global edge) |
| Compute | Cloudflare Pages Functions (serverless) |
| Database | Neon PostgreSQL (serverless, auto-scaling) |
| Media CDN | Cloudinary |
| DNS | Cloudflare DNS |
| Domain | nabome.online |
| SSL/TLS | Automatic (Cloudflare) |
| Email | Resend API |
| Rate Limiting | Cloudflare KV |
| Caching | Cloudflare edge + in-memory |

---

## 21. Performance Architecture

Lazy Loading (React.lazy + Suspense), Code Splitting (Vite manualChunks: vendor-state, vendor-ui, vendor-validation, vendor-core), Image Optimization (Cloudinary f_auto, q_auto, responsive srcSet), Lazy Image Loading (loading=lazy), CSS Optimization (Tailwind JIT + Lightning CSS), JS Minification (esbuild), CDN Caching (Cloudflare edge), API Caching (in-memory TTL), Query Caching (TanStack React Query 5min stale), Connection Pooling (Neon pooled + singleton Prisma), Database Indexes (50+ across all tables).

**Not implemented**: Streaming SSR, database read replicas, background job queue.

---

## 22. Security Architecture

| Measure | Implementation |
|---|---|
| Authentication | Supabase Auth (password hashing, JWT) |
| Authorization | Role-based (customer/admin) via middleware + route guards |
| Input Validation | Zod schemas on all API inputs |
| Input Sanitization | HTML sanitization for user content |
| CSRF Protection | Double-submit cookie pattern |
| XSS Prevention | Content sanitization + React escaping |
| SQL Injection | Prisma parameterized queries |
| Rate Limiting | KV sliding window (auth: 5/min, standard: 30/10s, admin: 60/min) |
| Security Headers | CORS, Content-Type, X-Content-Type-Options |
| Secrets Management | Environment variables + cleanSecret utility |
| Token Hashing | SHA-256 for stored tokens |
| Session Management | Expiry, idle timeout (2h), rotation |
| Bot Protection | Cloudflare Turnstile |
| Audit Logging | UserActionLog, LoginAttempt, VerificationAttempt |
| Password Policy | Min 8 chars, uppercase, lowercase, number |
| HTTPS Only | Cloudflare SSL/TLS enforced |

---

## 23. SEO Architecture

Two levels: Client-side (react-helmet-async for per-page meta) + Server-side (Pages Functions middleware for SSR meta injection, structured data, OpenGraph, Twitter Cards).

Features: Per-page meta, OpenGraph (og:title, og:description, og:image, og:url), Twitter Cards, JSON-LD structured data (Website, Product, BreadcrumbList, Organization), Canonical URLs, Sitemap (/sitemap.xml), Robots.txt, Breadcrumbs, Product/Category/Collection SEO fields.

---

## 24. File Storage

**Provider**: Cloudinary. **Upload**: Server proxy or direct. **Content**: Images, videos, documents. **Optimization**: f_auto, q_auto, responsive widths. **Folder structure**: {entity_type}/{slug}/{asset_id}/. **DB Tracking**: MediaAsset table. **Integrity**: Cloudinary vs DB consistency checks. **Security**: File type + content validation, access control.

---

## 25. Notifications

### Events (17 types)

order_placed, payment_success, payment_failed, order_confirmed, order_shipped, order_delivered, order_cancelled, return_requested, return_approved, return_rejected, refund_processed, welcome, password_reset, account_update, email_change, email_verification, contact_form.

### Channels: Email (Resend) + In-app. SMS channel defined but not integrated.

### Flow: Event -> Create Notification DB record -> Send email via Resend (fire-and-forget) -> Admin notification CC. Retry on failure.

---

## 26. Business Logic

### Order Status Flow
pending -> confirmed -> processing -> packed -> shipped -> out_for_delivery -> delivered (with cancellation allowed from pending/confirmed/processing/packed states, return from shipped/out_for_delivery/delivered states).

### Pricing: unitPrice = basePrice + variant.priceAdjustment. salePrice overrides. discountPercent = (compareAtPrice - effective) / compareAtPrice * 100.

### Inventory: availableStock = stock - reservedStock. Reserved on checkout start, decremented on success, released on failure.

### Cart Merge: On login, guest cart items merged with server cart (same variant = sum quantities).

### Returns: Only for delivered orders, requires evidence images, admin approval, linked to refund.

### Coupon Validation: Code exists + active + date range + usage limit + per-user limit + min order value + gender match + discount application capped at maxDiscount.

---

## 27. Existing Problems

### TypeScript / Build
- Type errors exist but are suppressed in CI (2>/dev/null || echo warnings)
- Admin API uses `unknown` types extensively
- Duplicate components: Breadcrumbs, ImageGallery in both ui/ and storefront/components/
- Duplicate useWishlist hook (localStorage vs API-backed)

### Dead Code
- Legacy seed script (prisma/seed.ts) alongside seed-new/
- Legacy functions/ directory
- Hyperdrive binding configured but disabled (530 errors)
- Soft-delete utility unused
- Seller seed module without seller implementation

### Performance
- No background job system (emails/notifications inline)
- No streaming SSR
- No database read replicas

### Security
- Placeholder env vars (RESEND, Turnstile, Razorpay webhook secret)
- Audit logging not consistently applied across all handlers

### Incomplete
- No seller/marketplace role
- No SMS provider integrated
- Subscription billing pipeline appears partial
- Abandoned cart automation missing

### UI/UX
- Error pages use blue-600 (inconsistent with brand color)
- Toast overlapped with bottom nav on mobile
- Missing comprehensive ARIA labels

---

## 28. Future Improvement Opportunities

- Implement background job queue (Cloudflare Queues)
- Add database read replicas
- Implement GraphQL or tRPC
- Add streaming SSR (React Server Components)
- Full PWA offline support
- Predictive prefetching
- Remove duplicate components
- Comprehensive E2E tests
- Strict TypeScript mode
- Implement proper RBAC permission system
- SMS notification provider
- Seller/marketplace role
- Abandoned cart automation
- Payment retry/refund automation
- Sentry error tracking
- API rate limit dashboard
- Comprehensive ARIA accessibility
- Database migration automation
- Docker/local development environment
- API versioning strategy

---

## 29. Missing Features

- Seller/marketplace role (DB schema exists, not implemented)
- SMS notifications (channel defined, no provider)
- Full subscription billing pipeline (partial Razorpay integration)
- Abandoned cart automated emails
- Product Q&A (ProductQA component exists but partial)
- Guest checkout order tracking (no account required)
- Social login (OAuth via Google/Facebook - Supabase supports but not implemented)
- Advanced search (faceted, Elasticsearch/Algolia)
- Multi-warehouse inventory
- Printful/Print-on-demand integration
- Affiliate program
- Bulk discount/volume pricing
- Product bundles
- Scheduled publishing for products (schema fields exist)
- Invoice generation (invoiceUrl field exists, generation partial)
- Email template customization UI
- Cache warmup
- Rate limiting dashboard for admins
- Webhook retry automation
- Security scanning in CI

---

## 30. Code Quality Report

| Category | Score (1-10) | Notes |
|---|---|---|
| Architecture | 8 | Well-structured, clear separation of concerns, serverless SPA architecture |
| Backend | 7 | Good middleware pipeline, but inconsistent error handling patterns |
| Frontend | 8 | Clean component structure, good use of hooks and stores |
| Database | 8 | Comprehensive schema with proper indexes and relationships |
| Security | 7 | Good foundation (CSRF, rate limiting, Turnstile) but audit logging incomplete |
| Performance | 6 | No streaming, no background jobs, no read replicas |
| Maintainability | 6 | Duplicate components, legacy code, suppressed type errors |
| Scalability | 7 | Serverless architecture scales well, but DB could be bottleneck |
| Documentation | 5 | README exists, but this MASTER_ARCHITECTURE.md is the first comprehensive doc |
| Testing | 5 | Some unit tests, some E2E tests, but limited coverage |
| UI | 8 | Premium design, consistent branding, responsive |
| UX | 7 | Good flow overall, but some rough edges (mobile toast, ARIA) |
| Accessibility | 4 | Skip link exists, focus management partial, ARIA labels missing |
| SEO | 8 | Excellent SEO implementation with SSR middleware |
| **Overall** | **6.8** | Solid medium-to-high maturity project with clear areas for improvement |

---

## 31. Dependency Graph

```
src/storefront  -->  src/hooks, src/stores, src/lib/api, src/lib/utils, src/components/ui
src/admin       -->  src/hooks, src/stores, src/lib/api, src/lib/utils, src/components/ui, src/components/auth
src/components  -->  src/lib/utils, src/lib/seo, src/lib/config
src/pages       -->  src/components/auth, src/hooks, src/lib/api
src/lib/api     -->  (standalone HTTP client)
src/lib/media   -->  (standalone Cloudinary service layer)
api/_handlers   -->  api/_lib/prisma, api/_lib/auth-middleware, api/_lib/email, api/_lib/response, api/_lib/validate
api/_lib        -->  @prisma/client, @neondatabase/serverless, @supabase/supabase-js, zod
functions       -->  api/_lib/prisma, api/_lib/env
```

---

## 32. Full Feature Inventory

### Core E-Commerce Features
- [x] Product catalog with variants (size/color)
- [x] Product images with primary flag
- [x] Categories (hierarchical with subcategories)
- [x] Collections
- [x] Brands
- [x] Product tags and labels
- [x] Related products
- [x] Product attributes
- [x] Pricing (base, compare-at, sale, cost)
- [x] Discount percentage display
- [x] Guest cart (localStorage)
- [x] Authenticated cart (server-synced)
- [x] Cart merge on login
- [x] Save for later
- [x] Coupon/discount system
- [x] Checkout (authenticated + guest)
- [x] Payment gateway (Razorpay)
- [x] Order management
- [x] Order status workflow
- [x] Order tracking
- [x] Order cancellation
- [x] Returns and refunds
- [x] Product reviews with moderation
- [x] Wishlist (guest + authenticated)
- [x] Recent products
- [x] Product comparison (max 4)
- [x] Product recommendations

### Search & Discovery
- [x] Full-text search (pg_trgm)
- [x] Filtering (category, brand, price, size, color, gender)
- [x] Sorting (newest, price, popularity)
- [x] Pagination
- [x] Sitemap generation
- [ ] Elasticsearch/Algolia integration

### CMS & Content
- [x] Homepage builder (13 section types, drag-and-drop)
- [x] Header navigation builder
- [x] Footer builder
- [x] Hero slider management
- [x] Announcement bars (scheduled)
- [x] Static pages
- [x] FAQs
- [x] Lookbooks with shoppable hotspots
- [x] Page templates
- [x] Social media links

### Admin Features
- [x] Dashboard with stats and charts
- [x] Product CRUD with variants manager
- [x] Order management with status updates
- [x] Customer management
- [x] Category/collection/brand management
- [x] Coupon management
- [x] Inventory management with alerts
- [x] Analytics dashboard
- [x] Review moderation
- [x] Return/refund processing
- [x] Support ticket management
- [x] Media library
- [x] Settings (site, shipping, tax, analytics, SEO, theme)
- [x] Campaign management
- [x] Newsletter subscribers
- [x] SEO management
- [x] Feature flags
- [x] Import/export
- [x] Audit log
- [x] Auth activity monitoring
- [x] Abandoned carts view
- [x] Gift card management
- [x] Loyalty program management
- [x] Webhook event log
- [x] Size guide management
- [x] Product label management
- [x] Page template management
- [x] Theme builder

### Customer Account
- [x] Dashboard overview
- [x] Order history
- [x] Order detail and tracking
- [x] Return requests
- [x] Address book (CRUD)
- [x] Profile settings
- [x] Password change
- [x] Email change
- [x] Notification center
- [x] Support tickets
- [x] Loyalty points and tiers
- [x] Referral program
- [x] Gift cards
- [x] Subscriptions

### Authentication & Security
- [x] Email/password authentication
- [x] Email verification
- [x] Password reset flow
- [x] Session management
- [x] JWT refresh rotation
- [x] CSRF protection
- [x] Rate limiting
- [x] Turnstile bot protection
- [x] Role-based access (customer/admin)
- [ ] OAuth social login
- [ ] Two-factor authentication
- [ ] API key management UI

### Internationalization
- [x] English
- [x] Bengali
- [x] Hindi
- [ ] More languages

### Design & UX
- [x] Premium fashion design
- [x] Responsive layout
- [x] Dark mode
- [x] Animations (Framer Motion)
- [x] Mega menu navigation
- [x] Mobile bottom navigation
- [x] Search overlay
- [x] Cart drawer
- [x] Quick view modal
- [x] PWA support
- [x] Cookie consent
- [x] Offline indicator
- [x] Toast notifications
- [x] Skeleton loading states
- [x] Error boundaries

### Missing / Incomplete Features
- [ ] Seller/marketplace role
- [ ] SMS notifications
- [ ] Subscription billing (partial)
- [ ] Abandoned cart emails
- [ ] Product Q&A (partial)
- [ ] Social login
- [ ] Invoice generation (partial)
- [ ] Email template customization UI
- [ ] Full streaming SSR
- [ ] Database read replicas
- [ ] Background job queue
- [ ] Comprehensive testing
- [ ] Accessibility audit

---

## 33. Final Summary

### Overall Project Maturity: **6.8 / 10**

Nabome is a **production-ready premium fashion e-commerce platform** with comprehensive features covering the full customer journey, a powerful admin panel with 40+ management pages, and a sophisticated CMS. The architecture is well-structured for a serverless SPA approach using modern technologies (React 19, TypeScript 5, Vite 6, TailwindCSS 3, Cloudflare Pages, Neon PostgreSQL, Prisma 6).

### Production Readiness

The platform is **deployed and live** at https://www.nabome.online with CI/CD via GitHub Actions. Core e-commerce flows (browse, cart, checkout, payment, orders, returns) are functional. The admin panel is extensive. Security measures include CSRF protection, rate limiting, Turnstile bot protection, and session management.

### Highest Priority Issues

1. **TypeScript errors suppressed in CI** - Risk of runtime errors reaching production
2. **Placeholder env vars** - Turnstile, Resend, Razorpay webhook secrets not configured
3. **No background job system** - Email sending and notifications are synchronous, blocking request processing
4. **Hyperdrive disabled** - DB connection pooling not optimized for production load
5. **Incomplete test coverage** - Low confidence in refactoring safety

### Critical Blockers

- None immediately blocking production use, but the Hyperdrive issue and placeholder Turnstile/Resend keys should be addressed before scaling

### Recommended Implementation Order

1. Fix placeholder environment variables
2. Enable strict TypeScript mode and fix type errors
3. Improve test coverage (critical paths: checkout, payment, auth)
4. Implement background job queue (Cloudflare Queues)
5. Remove duplicate components and dead code
6. Implement SMS notifications
7. Add seller/marketplace role
8. Full subscription billing pipeline
9. Abandoned cart automation
10. Accessibility audit and fixes

### Estimated Completion Percentage

| Category | Completion |
|---|---|
| Core E-Commerce | 90% |
| Admin Panel | 85% |
| CMS | 80% |
| Customer Account | 85% |
| Security | 75% |
| Performance | 55% |
| Testing | 35% |
| Documentation | 50% |
| Accessibility | 30% |
| **Overall** | **65%** |
