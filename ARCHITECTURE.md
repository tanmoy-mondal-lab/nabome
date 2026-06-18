# ARCHITECTURE — Premium Fashion E-Commerce Platform

## 1. SYSTEM OVERVIEW

```
┌────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
├────────────────────────────────────────────────────────────┤
│  React App (Vite + TypeScript)                             │
│  ┌──────────┬──────────┬──────────┬──────────────────┐    │
│  │  Pages   │ Features │  Admin   │  Shared/Ui       │    │
│  │          │  Modules │  Panel   │  Components      │    │
│  └────┬─────┴────┬─────┴────┬─────┴──────────────────┘    │
│       │          │          │                              │
│  ┌────┴──────────┴──────────┴──────────────────────┐      │
│  │           Service Layer (Hooks + API)             │      │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │      │
│  │  │  Auth    │ │  Data    │ │  Media (Cldnry)   │  │      │
│  │  └──────────┘ └──────────┘ └──────────────────┘  │      │
│  └──────────────────┬────────────────────────────────┘      │
└─────────────────────┼──────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────┼──────────────────────────────────────┐
│          ┌──────────┴──────────┐                            │
│          │    Supabase SDK     │  ← Direct client-safe       │
│          │  (Auth + queries)   │     queries via RLS         │
│          └──────────┬──────────┘                            │
│          ┌──────────┴──────────┐                            │
│          │  Cloudinary SDK     │  ← Direct uploads           │
│          └─────────────────────┘                            │
├────────────────────────────────────────────────────────────┤
│                   Server Layer                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Supabase        │  │  Cloudinary      │                │
│  │  (PostgreSQL +   │  │  (Image CDN +    │                │
│  │   Auth + RLS)    │  │   Transform)     │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  3rd Party:  Razorpay │ Resend (email) │ Google Analytics   │
└────────────────────────────────────────────────────────────┘
```

## 2. TECH STACK

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Framework   | React 18 + TypeScript (strict)                  |
| Build       | Vite 5                                          |
| Styling     | Tailwind CSS v3 + CSS Modules for complex UI    |
| Routing     | React Router v6 (loaders, actions, lazy routes) |
| State       | Zustand (client) + TanStack Query (server)      |
| Forms       | React Hook Form + Zod                           |
| Animation   | Framer Motion                                   |
| Icons       | Lucide React                                    |
| Auth        | Supabase Auth (email/password + magic link)     |
| Database    | Supabase PostgreSQL                             |
| ORM/Queries | Supabase JS Client (raw SQL via RPC when needed)|
| Media       | Cloudinary (upload + CDN + transformations)     |
| Payments    | Razorpay                                        |
| Emails      | Resend                                          |
| Analytics   | Google Analytics 4 (gtag.js)                    |
| Hosting     | Vercel (frontend) + Supabase (backend)          |

## 3. FOLDER STRUCTURE

```
src/
├── app/                          # App bootstrap
│   ├── main.tsx                  # Entry point
│   ├── App.tsx                   # Root component with providers
│   ├── providers.tsx             # All context providers stacked
│   └── routes.tsx                # Route definitions (lazy)
│
├── assets/                       # Static assets (SVGs, fonts)
│
├── styles/
│   ├── globals.css               # Tailwind directives + CSS vars
│   └── design-tokens.ts          # Brand design tokens as TS
│
├── types/                        # Global TypeScript types
│   ├── index.ts                  # Barrel export
│   ├── auth.ts
│   ├── product.ts
│   ├── order.ts
│   ├── cms.ts
│   ├── collection.ts
│   └── common.ts                 # Shared types (Address, Media, etc.)
│
├── lib/                          # Core libraries & utilities
│   ├── supabase/
│   │   ├── client.ts             # Supabase client singleton
│   │   ├── admin-client.ts       # Service-role client (server-only)
│   │   └── middleware.ts         # Auth middleware helpers
│   ├── cloudinary/
│   │   └── upload.ts             # Upload helpers
│   ├── payment/
│   │   └── razorpay.ts           # Razorpay integration
│   ├── analytics/
│   │   └── ga4.ts               # GA4 wrapper
│   ├── email/
│   │   └── resend.ts            # Email service
│   ├── utils/
│   │   ├── format.ts            # Price, date formatters
│   │   ├── validators.ts        # Zod schemas
│   │   ├── cn.ts                # clsx + tailwind-merge
│   │   └── seo.ts               # SEO metadata helpers
│   └── constants.ts             # App-wide constants
│
├── hooks/                        # Shared hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useWishlist.ts
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   ├── useIntersectionObserver.ts
│   └── useScrollRestoration.ts
│
├── stores/                       # Zustand stores (client state)
│   ├── cart-store.ts
│   ├── wishlist-store.ts
│   ├── ui-store.ts              # Sidebars, modals, toasts
│   └── search-store.ts
│
├── services/                     # API service layer (TanStack Query)
│   ├── query-client.ts           # QueryClient configuration
│   ├── products.ts               # Product queries & mutations
│   ├── collections.ts
│   ├── categories.ts
│   ├── orders.ts
│   ├── addresses.ts
│   ├── reviews.ts
│   ├── cms.ts                    # Pages, banners, site settings
│   ├── search.ts
│   ├── auth.ts                   # Auth queries & mutations
│   └── admin/                    # Admin-only queries
│       ├── dashboard.ts
│       ├── products.ts
│       ├── orders.ts
│       ├── customers.ts
│       ├── cms.ts
│       └── analytics.ts
│
├── features/                     # Domain feature modules
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   ├── SocialLogin.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── schemas.ts
│   │
│   ├── products/
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductGallery.tsx
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── SizeSelector.tsx
│   │   │   ├── ColorSelector.tsx
│   │   │   ├── ProductReviews.tsx
│   │   │   ├── RelatedProducts.tsx
│   │   │   ├── RecentlyViewed.tsx
│   │   │   ├── QuickView.tsx
│   │   │   ├── ProductBreadcrumb.tsx
│   │   │   └── AddToCartButton.tsx
│   │   └── hooks/
│   │       ├── useProducts.ts
│   │       └── useProductDetail.ts
│   │
│   ├── collections/
│   │   ├── components/
│   │   │   ├── CollectionCard.tsx
│   │   │   ├── CollectionGrid.tsx
│   │   │   ├── CollectionHero.tsx
│   │   │   └── CollectionFilters.tsx
│   │   └── hooks/
│   │       └── useCollections.ts
│   │
│   ├── cart/
│   │   ├── components/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   ├── CartCounter.tsx
│   │   │   └── SavedForLater.tsx
│   │   └── hooks/
│   │       └── useCart.ts
│   │
│   ├── wishlist/
│   │   ├── components/
│   │   │   ├── WishlistButton.tsx      (heart toggle)
│   │   │   ├── WishlistDrawer.tsx
│   │   │   └── WishlistPage.tsx
│   │   └── hooks/
│   │       └── useWishlist.ts
│   │
│   ├── checkout/
│   │   ├── components/
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── ShippingForm.tsx
│   │   │   ├── PaymentSelector.tsx
│   │   │   ├── OrderSummary.tsx
│   │   │   ├── CouponInput.tsx
│   │   │   ├── GiftOptions.tsx
│   │   │   └── OrderConfirmation.tsx
│   │   └── hooks/
│   │       └── useCheckout.ts
│   │
│   ├── orders/
│   │   ├── components/
│   │   │   ├── OrderCard.tsx
│   │   │   ├── OrderTimeline.tsx
│   │   │   ├── OrderItems.tsx
│   │   │   ├── ReturnForm.tsx
│   │   │   ├── Invoice.tsx
│   │   │   └── TrackOrder.tsx
│   │   └── hooks/
│   │       └── useOrders.ts
│   │
│   ├── search/
│   │   ├── components/
│   │   │   ├── SearchInput.tsx
│   │   │   ├── SearchSuggestions.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   └── SearchHistory.tsx
│   │   └── hooks/
│   │       └── useSearch.ts
│   │
│   ├── customer/
│   │   ├── components/
│   │   │   ├── AddressBook.tsx
│   │   │   ├── AddressForm.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── DeleteAccount.tsx
│   │   │   └── PreferencesForm.tsx
│   │   └── hooks/
│   │       └── useCustomer.ts
│   │
│   ├── cms/                         # Public CMS display
│   │   ├── components/
│   │   │   ├── Banner.tsx
│   │   │   ├── BannerCarousel.tsx
│   │   │   ├── CMSBlock.tsx         # Renders dynamic blocks
│   │   │   ├── HeroSection.tsx
│   │   │   └── NewsletterSignup.tsx
│   │   └── hooks/
│   │       └── useCMS.ts
│   │
│   └── blog/
│       ├── components/
│       │   ├── BlogCard.tsx
│       │   ├── BlogList.tsx
│       │   ├── BlogPost.tsx
│       │   ├── BlogSidebar.tsx
│       │   └── ShareButtons.tsx
│       └── hooks/
│           └── useBlog.ts
│
├── admin/
│   ├── layout/
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   └── AdminGuard.tsx
│   ├── dashboard/
│   │   ├── AdminDashboard.tsx
│   │   ├── StatsCards.tsx
│   │   ├── RevenueChart.tsx
│   │   ├── RecentOrders.tsx
│   │   └── TopProducts.tsx
│   ├── products/
│   │   ├── ProductList.tsx
│   │   ├── ProductForm.tsx
│   │   ├── ProductVariants.tsx
│   │   ├── ProductImages.tsx
│   │   ├── ProductSEO.tsx
│   │   ├── BulkUpload.tsx
│   │   └── CategoryManager.tsx
│   ├── collections/
│   │   ├── CollectionList.tsx
│   │   └── CollectionForm.tsx
│   ├── orders/
│   │   ├── OrderList.tsx
│   │   ├── OrderDetail.tsx
│   │   └── OrderStatusManager.tsx
│   ├── customers/
│   │   └── CustomerList.tsx
│   ├── cms/
│   │   ├── PageList.tsx
│   │   ├── PageEditor.tsx         # Rich text / block editor
│   │   ├── BannerManager.tsx
│   │   ├── SiteSettings.tsx
│   │   └── NavigationManager.tsx
│   ├── marketing/
│   │   ├── CouponManager.tsx
│   │   ├── EmailCampaigns.tsx
│   │   └── SEOAnalysis.tsx
│   ├── blog/
│   │   ├── PostList.tsx
│   │   └── PostEditor.tsx
│   ├── reviews/
│   │   └── ReviewModeration.tsx
│   ├── analytics/
│   │   ├── AnalyticsOverview.tsx
│   │   ├── SalesReport.tsx
│   │   ├── InventoryReport.tsx
│   │   └── CustomerInsights.tsx
│   └── settings/
│       ├── GeneralSettings.tsx
│       ├── PaymentSettings.tsx
│       ├── ShippingSettings.tsx
│       ├── EmailSettings.tsx
│       └── TeamManagement.tsx
│
├── components/                   # Shared UI components
│   ├── ui/                       # Design system atoms
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Drawer.tsx
│   │   ├── Toast.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Spinner.tsx
│   │   ├── Accordion.tsx
│   │   ├── Tabs.tsx
│   │   ├── Table.tsx
│   │   ├── Pagination.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LazyImage.tsx
│   │   └── Icon.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   ├── AnnouncementBar.tsx
│   │   ├── Newsletter.tsx
│   │   ├── SearchOverlay.tsx
│   │   └── ScrollToTop.tsx
│   └── common/
│       ├── SEOHead.tsx
│       ├── Breadcrumbs.tsx
│       ├── Rating.tsx
│       ├── Price.tsx
│       ├── QuantitySelector.tsx
│       ├── ShareButton.tsx
│       ├── SocialLinks.tsx
│       └── BackButton.tsx
│
└── pages/                         # Route page components (thin)
    ├── Home.tsx
    ├── CollectionPage.tsx
    ├── CategoryPage.tsx
    ├── ProductPage.tsx
    ├── SearchPage.tsx
    ├── CartPage.tsx
    ├── CheckoutPage.tsx
    ├── OrderConfirmationPage.tsx
    ├── OrderHistoryPage.tsx
    ├── OrderDetailPage.tsx
    ├── WishlistPage.tsx
    ├── AccountPage.tsx
    ├── LoginPage.tsx
    ├── RegisterPage.tsx
    ├── ForgotPasswordPage.tsx
    ├── ResetPasswordPage.tsx
    ├── PageView.tsx                # CMS dynamic page renderer
    ├── BlogPage.tsx
    ├── BlogPostPage.tsx
    ├── ContactPage.tsx
    ├── FAQPage.tsx
    ├── SizeGuidePage.tsx
    ├── NotFoundPage.tsx
    └── admin/
        ├── AdminDashboardPage.tsx
        ├── AdminProductsPage.tsx
        ├── AdminProductFormPage.tsx
        ├── AdminCollectionsPage.tsx
        ├── AdminOrdersPage.tsx
        ├── AdminOrderDetailPage.tsx
        ├── AdminCustomersPage.tsx
        ├── AdminCMSPagesPage.tsx
        ├── AdminCMSPageEditor.tsx
        ├── AdminBannersPage.tsx
        ├── AdminBlogPage.tsx
        ├── AdminBlogEditor.tsx
        ├── AdminCouponsPage.tsx
        ├── AdminReviewsPage.tsx
        ├── AdminAnalyticsPage.tsx
        └── AdminSettingsPage.tsx
```

## 4. ROUTING ARCHITECTURE

```
PUBLIC ROUTES (React Router v6 layout routes)
├── RootLayout (Header + Footer + AnnouncementBar)
│   ├── /                          → Home.tsx
│   ├── /collections               → CollectionPage.tsx
│   ├── /collections/:slug         → CollectionPage (filtered)
│   ├── /c/:slug                   → CategoryPage.tsx
│   ├── /p/:slug                   → ProductPage.tsx
│   ├── /search                    → SearchPage.tsx
│   ├── /cart                      → CartPage.tsx
│   ├── /pages/:slug              → PageView.tsx (CMS)
│   ├── /blog                      → BlogPage.tsx
│   ├── /blog/:slug               → BlogPostPage.tsx
│   ├── /contact                   → ContactPage.tsx
│   ├── /faq                       → FAQPage.tsx
│   ├── /size-guide               → SizeGuidePage.tsx
│   └── /404                       → NotFoundPage.tsx
│
├── AuthLayout (minimal)
│   ├── /auth/login               → LoginPage.tsx
│   ├── /auth/register            → RegisterPage.tsx
│   ├── /auth/forgot-password     → ForgotPasswordPage.tsx
│   └── /auth/reset-password      → ResetPasswordPage.tsx
│
├── AccountLayout (sidebar)
│   ├── /account                   → AccountPage.tsx (redirect to orders)
│   ├── /account/orders            → OrderHistoryPage.tsx
│   ├── /account/orders/:id        → OrderDetailPage.tsx
│   ├── /account/wishlist          → WishlistPage.tsx
│   ├── /account/addresses         → AddressBook
│   └── /account/settings          → Profile/Settings
│
├── CheckoutLayout (clean, minimal)
│   ├── /checkout                  → CheckoutPage.tsx
│   └── /checkout/confirmation     → OrderConfirmationPage.tsx
│
└── AdminLayout (sidebar + header)
    └── /admin                     → Redirect to /admin/dashboard
        ├── /admin/dashboard       → AdminDashboardPage.tsx
        ├── /admin/products        → AdminProductsPage.tsx
        ├── /admin/products/new    → AdminProductFormPage.tsx
        ├── /admin/products/:id    → AdminProductFormPage.tsx
        ├── /admin/collections     → AdminCollectionsPage.tsx
        ├── /admin/collections/new → AdminCollectionForm
        ├── /admin/collections/:id → AdminCollectionForm
        ├── /admin/categories      → CategoryManager
        ├── /admin/orders           → AdminOrdersPage.tsx
        ├── /admin/orders/:id       → AdminOrderDetailPage.tsx
        ├── /admin/customers        → AdminCustomersPage.tsx
        ├── /admin/pages            → AdminCMSPagesPage.tsx
        ├── /admin/pages/new        → AdminCMSPageEditor
        ├── /admin/pages/:id        → AdminCMSPageEditor
        ├── /admin/banners          → AdminBannersPage.tsx
        ├── /admin/blog             → AdminBlogPage.tsx
        ├── /admin/blog/new         → AdminBlogEditor
        ├── /admin/blog/:id         → AdminBlogEditor
        ├── /admin/coupons          → AdminCouponsPage.tsx
        ├── /admin/reviews          → AdminReviewsPage.tsx
        ├── /admin/analytics        → AdminAnalyticsPage.tsx
        └── /admin/settings         → AdminSettingsPage.tsx
```

## 5. DATABASE ARCHITECTURE

### Table: `profiles`
| Column        | Type      | Notes                          |
|---------------|-----------|--------------------------------|
| id            | uuid PK   | References auth.users          |
| role          | user_role | 'customer' | 'super_admin'    |
| first_name    | text      |                                |
| last_name     | text      |                                |
| phone         | text      |                                |
| avatar_url    | text      | Cloudinary URL                 |
| is_active     | boolean   | Admin can deactivate           |
| created_at    | timestamptz |                              |
| updated_at    | timestamptz |                              |

### Table: `categories`
| Column      | Type        | Notes                     |
|-------------|-------------|---------------------------|
| id          | uuid PK     |                           |
| name        | text        |                           |
| slug        | text UNIQUE | URL-friendly              |
| description | text        |                           |
| image_url   | text        |                           |
| parent_id   | uuid FK     | Self-referencing (null=top)|
| sort_order  | integer     |                           |
| is_active   | boolean     |                           |
| created_at  | timestamptz |                           |

### Table: `collections`
| Column       | Type        | Notes                   |
|--------------|-------------|-------------------------|
| id           | uuid PK     |                         |
| name         | text        |                         |
| slug         | text UNIQUE |                         |
| description  | text        |                         |
| hero_image   | text        | Full-width hero         |
| meta_title   | text        | SEO                     |
| meta_desc    | text        | SEO                     |
| is_active    | boolean     |                         |
| is_featured  | boolean     | Show on homepage        |
| start_date   | date        | Seasonal collections    |
| end_date     | date        |                         |
| sort_order   | integer     |                         |
| created_at   | timestamptz |                         |

### Table: `products`
| Column          | Type        | Notes                      |
|-----------------|-------------|----------------------------|
| id              | uuid PK     |                            |
| name            | text        |                            |
| slug            | text UNIQUE |                            |
| description     | text        | Rich text                  |
| short_desc      | text        | Card excerpt               |
| category_id     | uuid FK     |                            |
| collection_id   | uuid FK     | Optional                   |
| base_price      | numeric     | Before variant adjustments |
| compare_at_price| numeric     | Sale strikethrough         |
| cost_price      | numeric     | Internal only              |
| currency        | text        | INR default                |
| material        | text        | e.g., "Pure Linen"         |
| care_instructions| text       |                            |
| size_chart_url  | text        |                            |
| meta_title      | text        | SEO                        |
| meta_desc       | text        | SEO                        |
| is_active       | boolean     |                            |
| is_featured     | boolean     |                            |
| is_new          | boolean     | "New Arrival" badge        |
| tags            | text[]      | For filtering/search       |
| gender          | gender_enum | 'men' | 'women' | 'unisex' |
| sort_order      | integer     |                            |
| published_at    | timestamptz | When made visible          |
| created_at      | timestamptz |                            |
| updated_at      | timestamptz |                            |

### Table: `product_variants`
| Column       | Type        | Notes                       |
|--------------|-------------|-----------------------------|
| id           | uuid PK     |                             |
| product_id   | uuid FK     |                             |
| sku          | text UNIQUE |                             |
| size         | text        | e.g., "S", "M", "L", "XL"  |
| color        | text        | e.g., "Ivory", "Navy"      |
| color_hex    | text        | #HEX for swatch             |
| price_adjust | numeric     | +/- from base_price         |
| stock        | integer     |                             |
| weight       | numeric     | For shipping                |
| is_active    | boolean     |                             |
| created_at   | timestamptz |                             |

### Table: `product_images`
| Column      | Type        | Notes                       |
|-------------|-------------|-----------------------------|
| id          | uuid PK     |                             |
| product_id  | uuid FK     |                             |
| variant_id  | uuid FK     | Nullable (color-specific)   |
| url         | text        | Cloudinary URL              |
| alt_text    | text        |                             |
| sort_order  | integer     |                             |
| is_primary  | boolean     | First image shown           |

### Table: `addresses`
| Column        | Type        | Notes                |
|---------------|-------------|----------------------|
| id            | uuid PK     |                      |
| profile_id    | uuid FK     |                      |
| label         | text        | "Home", "Work"       |
| full_name     | text        |                      |
| phone         | text        |                      |
| line1         | text        |                      |
| line2         | text        |                      |
| city          | text        |                      |
| state         | text        |                      |
| pincode       | text        |                      |
| country       | text        | Default "India"      |
| is_default    | boolean     |                      |
| created_at    | timestamptz |                      |

### Table: `orders`
| Column          | Type        | Notes                  |
|-----------------|-------------|------------------------|
| id              | uuid PK     |                        |
| order_number    | text UNIQUE | e.g., "NB-20241201-XXXX" |
| profile_id      | uuid FK     |                        |
| email           | text        | Guest checkout         |
| status          | order_status| 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' |
| subtotal        | numeric     |                        |
| shipping_cost   | numeric     |                        |
| tax             | numeric     |                        |
| discount        | numeric     |                        |
| coupon_code     | text        |                        |
| total           | numeric     |                        |
| currency        | text        |                        |
| payment_method  | text        | 'razorpay'             |
| payment_status  | payment_status | 'pending' | 'paid' | 'failed' | 'refunded' |
| razorpay_order_id | text     |                        |
| razorpay_payment_id | text   |                        |
| shipping_address_id | uuid FK |                      |
| billing_address_id  | uuid FK |                      |
| gift_message    | text        | Optional               |
| notes           | text        | Customer notes         |
| shipped_at      | timestamptz |                        |
| delivered_at    | timestamptz |                        |
| cancelled_at    | timestamptz |                        |
| created_at      | timestamptz |                        |
| updated_at      | timestamptz |                        |

### Table: `order_items`
| Column          | Type        | Notes                |
|-----------------|-------------|----------------------|
| id              | uuid PK     |                      |
| order_id        | uuid FK     |                      |
| product_id      | uuid FK     |                      |
| variant_id      | uuid FK     | Snapshot             |
| product_name    | text        | Snapshot             |
| variant_label   | text        | e.g., "M / Navy"     |
| sku             | text        | Snapshot             |
| quantity        | integer     |                      |
| unit_price      | numeric     | Snapshot             |
| total_price     | numeric     |                      |
| image_url       | text        | Snapshot             |

### Table: `order_status_history`
| Column     | Type        | Notes                |
|------------|-------------|----------------------|
| id         | uuid PK     |                      |
| order_id   | uuid FK     |                      |
| status     | order_status|                      |
| note       | text        | Internal note        |
| created_by | uuid FK     | profile_id           |
| created_at | timestamptz |                      |

### Table: `reviews`
| Column       | Type        | Notes                |
|--------------|-------------|----------------------|
| id           | uuid PK     |                      |
| product_id   | uuid FK     |                      |
| profile_id   | uuid FK     |                      |
| order_id     | uuid FK     | Verified purchase    |
| rating       | smallint    | 1-5                  |
| title        | text        |                      |
| body         | text        |                      |
| images       | text[]      | Cloudinary URLs      |
| is_approved  | boolean     | Admin moderation     |
| created_at   | timestamptz |                      |

### Table: `carts`
| Column     | Type        | Notes                |
|------------|-------------|----------------------|
| id         | uuid PK     |                      |
| profile_id | uuid FK     | Null for guest       |
| session_id | text        | For guest carts      |
| created_at | timestamptz |                      |
| updated_at | timestamptz |                      |

### Table: `cart_items`
| Column     | Type        | Notes                |
|------------|-------------|----------------------|
| id         | uuid PK     |                      |
| cart_id    | uuid FK     |                      |
| variant_id | uuid FK     |                      |
| quantity   | integer     |                      |
| saved_for_later | boolean |                      |
| created_at | timestamptz |                      |

### Table: `wishlists`
| Column     | Type        | Notes                |
|------------|-------------|----------------------|
| id         | uuid PK     |                      |
| profile_id | uuid FK     |                      |
| variant_id | uuid FK     |                      |
| created_at | timestamptz |                      |
| UNIQUE     | (profile_id, variant_id) |            |

### Table: `coupons`
| Column        | Type        | Notes                    |
|---------------|-------------|--------------------------|
| id            | uuid PK     |                          |
| code          | text UNIQUE |                          |
| description   | text        |                          |
| discount_type | text        | 'percentage' | 'fixed'  |
| discount_value| numeric     |                          |
| min_order_value | numeric   |                          |
| max_discount  | numeric     | For percentage           |
| usage_limit   | integer     | Total uses               |
| used_count    | integer     |                          |
| per_user_limit| integer     |                          |
| is_active     | boolean     |                          |
| start_date    | timestamptz |                          |
| end_date      | timestamptz |                          |
| created_at    | timestamptz |                          |

### Table: `coupon_redemptions`
| Column      | Type        | Notes                |
|-------------|-------------|----------------------|
| id          | uuid PK     |                      |
| coupon_id   | uuid FK     |                      |
| order_id    | uuid FK     |                      |
| profile_id  | uuid FK     |                      |
| created_at  | timestamptz |                      |

### Table: `cms_pages`
| Column      | Type        | Notes                    |
|-------------|-------------|--------------------------|
| id          | uuid PK     |                          |
| title       | text        |                          |
| slug        | text UNIQUE |                          |
| content     | jsonb       | Block-based content      |
| meta_title  | text        | SEO                      |
| meta_desc   | text        | SEO                      |
| is_published| boolean     |                          |
| published_at| timestamptz |                          |
| created_at  | timestamptz |                          |
| updated_at  | timestamptz |                          |

### Table: `banners`
| Column      | Type        | Notes                    |
|-------------|-------------|--------------------------|
| id          | uuid PK     |                          |
| title       | text        |                          |
| subtitle    | text        |                          |
| cta_text    | text        |                          |
| cta_link    | text        |                          |
| desktop_image| text       | Cloudinary URL           |
| mobile_image| text        | Cloudinary URL           |
| position    | text        | 'hero' | 'promo' | 'bottom' |
| sort_order  | integer     |                          |
| is_active   | boolean     |                          |
| bg_color    | text        | Optional                 |
| start_date  | timestamptz |                          |
| end_date    | timestamptz |                          |
| created_at  | timestamptz |                          |

### Table: `blog_posts`
| Column       | Type        | Notes                |
|--------------|-------------|----------------------|
| id           | uuid PK     |                      |
| title        | text        |                      |
| slug         | text UNIQUE |                      |
| excerpt      | text        |                      |
| content      | jsonb       | Block-based          |
| cover_image  | text        | Cloudinary URL       |
| author_name  | text        |                      |
| tags         | text[]      |                      |
| meta_title   | text        | SEO                  |
| meta_desc    | text        | SEO                  |
| is_published | boolean     |                      |
| published_at | timestamptz |                      |
| created_at   | timestamptz |                      |
| updated_at   | timestamptz |                      |

### Table: `site_settings`
| Column    | Type        | Notes                    |
|-----------|-------------|--------------------------|
| id        | uuid PK     | Singleton row            |
| site_name | text        | "NABOME"                 |
| tagline   | text        |                          |
| logo_url  | text        | Cloudinary URL           |
| favicon_url| text       |                          |
| og_image  | text        | Social share default     |
| email     | text        | Contact email            |
| phone     | text        |                          |
| address   | text        |                          |
| social_links | jsonb    | {instagram, youtube, etc}|
| shipping_info | text    | Rich text                |
| return_policy | text    | Rich text                |
| about_us  | text        | Rich text                |
| currency  | text        | INR                      |
| tax_rate  | numeric     |                          |
| free_shipping_threshold | numeric |                  |
| created_at| timestamptz |                          |
| updated_at| timestamptz |                          |

### Enums
```sql
CREATE TYPE user_role AS ENUM ('customer', 'super_admin');
CREATE TYPE gender_enum AS ENUM ('men', 'women', 'unisex');
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'cancelled', 'returned', 'refunded'
);
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
```

## 6. API ARCHITECTURE

### Principle: Supabase Client SDK (Direct-to-Database Pattern)

For a SaaS like Supabase, we use the **Supabase JS client** directly from the browser with **Row-Level Security (RLS)** policies. This eliminates the need for a traditional REST API layer for standard CRUD.

```
Client → Supabase Client SDK → RLS Policy → Database
```

### Serverless API Routes (when needed)

Operations that require `service_role` (admin actions, payment webhooks, email) go through Vercel serverless functions:

```
Client → Vercel API Route (service_role) → Supabase Admin Client → Database
```

### Data Flow Patterns

```
┌────────────────────────────────────────────────────────┐
│                    TANSTACK QUERY                       │
│                                                         │
│  useQuery / useMutation                                 │
│       │                                                 │
│       ├──> supabase.from('products').select('...')      │
│       │         ↓                                       │
│       │    RLS Policy → Database                        │
│       │                                                 │
│       └──> fetch('/api/razorpay/create-order')          │
│                 ↓                                       │
│            Vercel Function → Razorpay API               │
│                 ↓                                       │
│            Response → Client                            │
└─────────────────────────────────────────────────────────┘
```

### Service Modules (TanStack Query)

Each service module exports:
- **Query hooks**: `useProducts()`, `useProduct(slug)` — data fetching with caching
- **Mutation hooks**: `useCreateProduct()`, `useUpdateOrderStatus()` — data mutations
- **Prefetch functions**: For SSR/loader-based data loading

### API Routes (Vercel)

| Route                          | Purpose                        |
|--------------------------------|--------------------------------|
| POST /api/razorpay/create-order| Create Razorpay order          |
| POST /api/razorpay/verify     | Verify payment signature       |
| POST /api/contact             | Contact form -> email          |
| POST /api/newsletter/subscribe | Newsletter signup             |
| POST /api/cloudinary/upload   | Signed upload (if needed)      |
| GET  /api/sitemap.xml         | Dynamic sitemap                |

## 7. AUTHENTICATION ARCHITECTURE

```
┌────────────────────────────────────────────────────────────┐
│                    SUPABASE AUTH                           │
│                                                             │
│  Built-in features used:                                   │
│  ├── Email + Password                                      │
│  ├── Magic Link                                            │
│  ├── Google OAuth                                          │
│  └── Session Management (auto-refresh)                    │
│                                                             │
│  RLS Policies enforce:                                     │
│  ├── Customers see only their own data                     │
│  ├── Admin sees all data                                   │
│  └── Public sees only active products/pages               │
└────────────────────────────────────────────────────────────┘
```

### Auth Flow

```
Register/Login → Supabase Auth → Session stored in cookie (HTTP-only)
  → On app load: supabase.auth.getSession()
  → If valid: fetch profile + role
  → If admin: allow admin routes
  → If invalid: redirect to /auth/login
```

### Role-Based Access Control

```typescript
type Role = 'customer' | 'super_admin';

// Supabase RLS uses `auth.uid()` and `auth.jwt()`
// Custom JWT claim `user_role` is set on signup

// Example RLS:
// Customers can read own profile:
//   auth.uid() = id
// Admins can read all profiles:
//   auth.jwt() ->> 'user_role' = 'super_admin'
```

### Frontend Auth Guard

```typescript
// <AuthGuard> wraps protected routes
// <AdminGuard> wraps admin routes
// Both check session + role before rendering children
// On unauthorized: redirect to /auth/login or /404
```

## 8. STATE MANAGEMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE LAYERS                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         TANSTACK QUERY (Server State)               │   │
│  │  - Products, Collections, Orders, Reviews           │   │
│  │  - Automatic caching, refetching, invalidation     │   │
│  │  - Optimistic updates for mutations                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         ZUSTAND (Client State)                      │   │
│  │  - Cart (persisted to localStorage)                 │   │
│  │  - Wishlist (persisted to localStorage)             │   │
│  │  - UI state (open drawers, modals, toasts)          │   │
│  │  - Search history (persisted)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         URL STATE (React Router)                    │   │
│  │  - Search query, filters, page number, sort         │   │
│  │  - Shareable URLs                                   │   │
│  │  - Browser back/forward navigation                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         COMPONENT STATE (useState/useReducer)       │   │
│  │  - Form inputs, toggle states                       │   │
│  │  - Component-specific ephemeral state               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 8. SECURITY ARCHITECTURE

| Concern              | Mitigation                                           |
|----------------------|------------------------------------------------------|
| Auth                 | Supabase Auth (bcrypt, email verification, MFA opt) |
| SQL Injection        | Supabase JS client (parameterized queries)           |
| XSS                  | React JSX escaping, no dangerouslySetInnerHTML        |
| CSRF                 | Supabase uses httpOnly cookies for session            |
| API Abuse            | Rate limiting via Vercel firewall + Supabase          |
| Media Upload         | Cloudinary signed uploads, file type restrictions     |
| Payment Security     | Razorpay (PCI DSS compliant, tokenization)            |
| Secrets              | Never in client bundle; only in Vercel env            |
| RBAC                 | RLS policies enforce row-level permissions            |
| Data Validation      | Zod schemas at form + API boundaries                 |
| HTTPS                | Vercel + Supabase enforce TLS                         |
| CORS                 | Supabase config restricts origins                     |

## 9. PREMIUM FASHION FEATURES INVENTORY

| Feature                | Implementation                          |
|------------------------|-----------------------------------------|
| Editorial Homepage     | CMS-driven hero, featured collections   |
| Lookbook / Collections | Collection pages with hero images       |
| Quick Shop             | QuickView modal from product card       |
| Size Guide             | Size guide modal on product page        |
| Save for Later         | Cart item flag                          |
| Wishlist               | Heart toggle, dedicated page            |
| Recently Viewed        | localStorage-based, shown on product    |
| Advanced Search        | Algolia-like with debounced suggestions |
| Gifting Options        | Gift message at checkout                |
| Order Tracking         | Status timeline on order detail         |
| Returns Portal         | Self-service return request             |
| Email Receipts         | Resend transactional emails             |
| Newsletter             | CMS-managed signup                      |
| SEO Framework          | Structured data, OG tags, sitemap       |
| Analytics              | GA4 event tracking                      |
| Blog                   | CMS-managed editorial content           |
| Dynamic Pages          | CMS-managed static pages                |
| Responsive Images      | Cloudinary transforms (f_auto,q_auto)   |
| Lazy Loading           | IntersectionObserver for images          |
| Infinite Scroll        | Product grid pagination                 |
| Breadcrumbs            | SEO-friendly navigation trail           |
| Social Share           | Share product/page buttons              |
| Announcement Bar       | CMS-managed top banner                  |
| Guest Checkout         | Email-only checkout, no account needed  |
| Abandoned Cart         | Saved to localStorage, prompt on return |
```

## 10. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Days 1–3)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS with design tokens (premium fashion palette)
- [ ] Set up folder structure (all directories)
- [ ] Implement Supabase client singleton
- [ ] Set up TanStack Query client
- [ ] Set up Zustand stores (cart, wishlist, ui)
- [ ] Create base UI components (Button, Input, Modal, Drawer, Toast, etc.)
- [ ] Implement layout components (Header, Footer, MobileNav, AnnouncementBar)
- [ ] Set up React Router with all route definitions
- [ ] Implement AuthGuard and AdminGuard

### Phase 2: Authentication (Days 3–4)
- [ ] Create Supabase auth service queries
- [ ] Implement Login, Register, Forgot Password pages
- [ ] Implement Social Login (Google OAuth)
- [ ] Create AuthGuard component with role checking
- [ ] Create AdminGuard component
- [ ] Implement session persistence and auto-refresh
- [ ] Create profile creation trigger/function in Supabase

### Phase 3: Product System (Days 4–6)
- [ ] Create Supabase tables and RLS policies
- [ ] Implement product queries (list, detail, filters)
- [ ] Build ProductCard component
- [ ] Build ProductGrid with pagination
- [ ] Build ProductGallery (zoom, lightbox)
- [ ] Build ProductInfo (size, color selectors)
- [ ] Build size selector with size chart modal
- [ ] Implement product search with suggestions
- [ ] Build category and collection pages
- [ ] Create recently-viewed tracking

### Phase 4: Cart & Wishlist (Days 6–7)
- [ ] Implement cart store (Zustand + localStorage)
- [ ] Build CartDrawer (slide-out)
- [ ] Build AddToCartButton
- [ ] Implement cart quantity management
- [ ] Implement "Save for Later"
- [ ] Build WishlistButton (heart toggle)
- [ ] Build WishlistDrawer
- [ ] Build WishlistPage

### Phase 5: Checkout & Orders (Days 7–9)
- [ ] Build CheckoutForm (multi-step)
- [ ] Build ShippingForm (address selection/entry)
- [ ] Implement Razorpay payment integration
- [ ] Create order in Supabase after payment
- [ ] Build OrderConfirmation page
- [ ] Build OrderHistory page
- [ ] Build OrderDetail page with timeline
- [ ] Implement order status tracking
- [ ] Build ReturnForm (self-service returns)

### Phase 6: Customer Account (Days 9–10)
- [ ] Build Account page with tab navigation
- [ ] Implement AddressBook (CRUD)
- [ ] Build ProfileSettings form
- [ ] Implement account deletion flow

### Phase 7: Admin Panel (Days 10–14)
- [ ] Admin dashboard with stats cards and charts
- [ ] Product management (CRUD, variants, images)
- [ ] Collection management (CRUD)
- [ ] Category management (CRUD)
- [ ] Order management (list, detail, status updates)
- [ ] Customer management (list, view)
- [ ] CMS page editor (block-based)
- [ ] Banner manager (hero, promo banners)
- [ ] Blog post editor
- [ ] Coupon manager
- [ ] Review moderation
- [ ] Analytics dashboard
- [ ] Site settings
- [ ] Navigation manager

### Phase 8: CMS & Content (Days 14–15)
- [ ] CMS block content renderer (public)
- [ ] Dynamic page renderer (`/pages/:slug`)
- [ ] Blog post renderer
- [ ] Announcement bar controller
- [ ] Newsletter signup with Supabase
- [ ] Contact form with email

### Phase 9: SEO & Analytics (Days 15–16)
- [ ] Implement dynamic sitemap.xml
- [ ] robots.txt configuration
- [ ] Meta tags management (per-page from CMS)
- [ ] Structured data (Product, Organization, BreadcrumbList)
- [ ] OG tags for social sharing
- [ ] GA4 event tracking across user journey
- [ ] Page speed optimization
- [ ] Lighthouse audit

### Phase 10: Polish & Launch (Days 16–18)
- [ ] Responsive testing (mobile, tablet, desktop)
- [ ] Error boundaries on all page components
- [ ] Loading skeletons for all data states
- [ ] Empty states for all list components
- [ ] Toast notifications for all actions
- [ ] Animations (page transitions, hover effects)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Security audit (RLS, env vars, auth flows)
- [ ] Final build verification
- [ ] Vercel deployment configuration

## 11. DESIGN TOKENS (Premium Fashion Brand)

```typescript
// Brand: NABOME — Premium Fashion
export const tokens = {
  colors: {
    brand: {
      50:  '#faf5f0',  // Warm cream
      100: '#f0e6d8',  // Light champagne
      200: '#e0ccb0',  // Champagne
      300: '#c4a882',  // Warm beige
      400: '#a8885e',  // Golden brown
      500: '#8b6940',  // Primary brand brown
      600: '#6f5030',  // Dark brown
      700: '#5a3f25',  // Deep brown
      800: '#3d2a18',  // Espresso
      900: '#241810',  // Nearly black
    },
    neutral: {
      50:  '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    accent: {
      gold:   '#c9a84c',
      rose:   '#c65f5f',
      sage:   '#8a9a7b',
      ink:    '#1a1a2e',
    },
  },
  fonts: {
    display:  "'Cormorant Garamond', serif",     // Headings
    body:     "'Manrope', sans-serif",            // Body text
    alt:      "'Noto Serif Bengali', serif",      // Bengali
  },
  spacing: {
    page:    'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-16 md:py-24',
  },
  animation: {
    fast:    '150ms ease',
    normal:  '300ms ease',
    slow:    '500ms ease',
  },
};
```

## 12. SUPABASE RLS POLICY TEMPLATE

```sql
-- Products: Public can see active products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Products: Admin can manage all products
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    auth.jwt() ->> 'user_role' = 'super_admin'
  );

-- Orders: Customers see own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = profile_id
    OR auth.jwt() ->> 'user_role' = 'super_admin'
  );

-- Orders: Admin can manage all
CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  USING (
    auth.jwt() ->> 'user_role' = 'super_admin'
  );

-- Profiles: Users see own profile; admin sees all
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id
    OR auth.jwt() ->> 'user_role' = 'super_admin'
  );
```

---

*Architecture v1.0 — Generated before any code is written.*
