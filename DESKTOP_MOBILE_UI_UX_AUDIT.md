# NABOME — Desktop vs Mobile UI/UX Consistency Audit

> **Audit type:** Static code inspection (production read-only audit). No code was modified.
> **Codebase:** Vite + React 19 + Tailwind CSS SPA. Single storefront app; "desktop" and "mobile" are the same SPA switched at the `md` breakpoint (768px) via Tailwind responsive utilities (`hidden md:block`, `md:hidden`, `lg:`, etc.).
> **Date:** 2026-07-12
> **Scope:** Every customer-facing page, flow, and component; admin→storefront synchronization; responsive breakpoints; accessibility; browser behavior.

---

## ⚠️ Screenshot limitation

This audit was performed as a **static source-code inspection**. The storefront depends on a live CMS/DB/API (Prisma + Supabase + admin-published data) that is not running in this environment, so automated browser screenshots (Chrome/Edge/Safari/Firefox, Mobile Chrome/Safari) could **not** be captured. The report therefore documents every mismatch with precise `file:line` references and the exact screenshot filename that **should** be captured by QA before deployment, using the naming convention requested (`desktop-*.png` / `mobile-*.png`). All findings below are reproducible by reading the cited lines.

---

# Executive Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| Overall UI Consistency | **72 / 100** | Strong shared-component reuse, but several places ship *two* implementations (ProductCard vs MobileProductCard, Header vs MobileNav, CartDrawer vs CartPage). |
| Overall UX | **68 / 100** | Mobile users lose key entry points: Notifications, persistent Search, several account sub-pages, and a sticky PDP add-to-cart bar. |
| Responsive | **78 / 100** | Mostly robust grids; a few overflow/touch/overlap risks at 320–414px and fixed-overlay collisions. |
| Admin Synchronization | **55 / 100** | **Critical:** Navigation is stored per `location` (`header` vs `mobile`) and admin edits to one do **not** propagate to the other. |
| Production Readiness | **NOT READY** | 1 Critical (nav parity), 2 High structural gaps, plus several High UX/a11y defects must be fixed before launch. |

### Headline conclusions

1. **The single biggest risk is the navigation architecture.** Desktop reads `useNavigation("header")` (`Header.tsx:27`) while the mobile drawer reads `useNavigation("mobile")` (`MobileNav.tsx:41`). These are **independent admin records** (`HeaderBuilder.tsx` saves per `location`). An admin who edits the header menu will *believe* mobile is updated — it is not. Worse, the default `mobile` menu is **flat** (no Men/Women subcategories) while the default `header` menu is a **mega menu**, so even out-of-the-box the two diverge.
2. **Mobile is missing several desktop affordances** with no functional equivalent: Notifications bell + unread badge, Admin entry (for admin users), a persistent Search trigger, and a sticky PDP Add-to-Cart bar.
3. **Two product-card implementations coexist** (`ProductCard.tsx` used everywhere except `ProductListingPage`/`CategoryPage`, which hand-roll `MobileProductCard`). The hand-rolled card drops wishlist, add-to-cart, color swatches, and badges on mobile — while `CollectionPage`/`SearchResultsPage` keep the full card. Inconsistent *within the same site*.
4. **Fixed overlays collide on mobile:** the Cookie consent and PWA install banners (`z-50`/`z-40`, `bottom-0`) sit on top of the `BottomNav` (`z-40`), blocking it until dismissed.
5. **Quick View is dead code** — the trigger exists only in desktop list view and the modal is never mounted.

---

# Critical Issues

### C1. [CRITICAL] Desktop and mobile navigation are two independent data sources that do not sync
- **Desktop:** `src/storefront/layout/Header.tsx:27` → `useNavigation("header")`, rendered with mega menu (`MegaMenu.tsx`).
- **Mobile:** `src/storefront/layout/MobileNav.tsx:41` → `useNavigation("mobile")`.
- **Admin:** `src/admin/cms/HeaderBuilder.tsx:161-180` stores/saves each menu by `location` (`header | footer | mobile | sidebar`); `saveMutation` writes only the single menu being edited — there is **no cross-location propagation**. The admin UI even exposes a separate **"Mobile Menu"** option (`HeaderBuilder.tsx:563`).
- **Default divergence:** `useNavigation.ts:44-91` (header) defines `Men`/`Women` as `mega_menu` with subcategory columns; `useNavigation.ts:98-106` (mobile) defines them as flat `type:"link"` with no children. So even with zero admin configuration, **mobile cannot reach any Men/Women subcategory** that desktop exposes.
- **Root cause:** Navigation is keyed by `location` and consumed by two different storefront components; admin treats them as separate menus with no sync.
- **Suggested fix (do not implement):** Unify header + mobile into a **single** menu and render it as a mega menu on desktop and an accordion in the mobile drawer, OR add an explicit "Apply to Mobile" / "Copy from Header" action and a stale-menu warning in admin. Also auto-propagate category/collection link items to both locations.

### C2. [CRITICAL] Mobile product listing cards are a separate, feature-stripped implementation
- **Files:** `src/storefront/pages/ProductListingPage.tsx:57-137` (`MobileProductCard`) rendered at `:654` (`md:hidden`); `src/storefront/pages/CategoryPage.tsx:98-166` (`MobileProductCard`) rendered at `:595`.
- **Desktop:** `ProductGrid` → `ProductCard` (wishlist, add-to-cart, color swatches, badges, hover).
- **Mobile (Listing/Category):** `MobileProductCard` has **no** wishlist, **no** add-to-cart, **no** color swatches, **no** product labels, different typography/spacing.
- **Mobile (Collection/Search):** These pages use the full `ProductCard`, so their mobile cards *do* have wishlist + add-to-cart + badges.
- **Root cause:** Two mobile-card implementations coexist; Listing/Category introduced a bespoke card; Collection/Search didn't.
- **Suggested fix:** Delete `MobileProductCard` and use the existing responsive `ProductCard` (it already has desktop/mobile blocks) everywhere, or make `MobileProductCard` feature-complete and apply it uniformly.

---

# High Priority

### H1. [HIGH] Notifications are unreachable on mobile
- **Files:** `Header.tsx:124` (upper utility bar `hidden md:block` contains the `Bell` + unread badge at `:186-193`); `BottomNav.tsx:8-14` (no notifications); `MobileNav.tsx` (no notifications link anywhere).
- **Desktop:** Bell with live unread count → `/account/notifications`. **Mobile:** No bell, no unread count, no link.
- **Root cause:** Notifications live only in the desktop-only upper bar.
- **Suggested fix:** Add a Notifications entry (with unread badge) to `MobileNav` account section and/or `BottomNav`.

### H2. [HIGH] Admin entry point exists on desktop, missing on mobile
- **Files:** `Header.tsx:199-203` (`isAdmin` → `/admin`); not present in `MobileNav.tsx` or `BottomNav.tsx`.
- **Root cause:** Hardcoded in the desktop-only upper bar.
- **Suggested fix:** Add an `isAdmin`-gated Admin link to `MobileNav`.

### H3. [HIGH] Mobile drawer cannot reach most account sub-pages
- **Files:** `MobileNav.tsx:227-241` (Support = FAQ/Contact/Shipping only); `MobileNav.tsx:246-270` (account block = My Account + Wishlist + Cart). Missing: Orders, Addresses, Notifications, Settings, Support tickets.
- **Desktop:** Persistent `DashboardSidebar` (`DashboardSidebar.tsx`) lists all 7 sections on every account page.
- **Reachability:** Mobile users *can* reach them, but only via the per-page `DashboardSidebar` FAB (`lg:hidden fixed bottom-20 right-4`), i.e. two taps deep and only while already on an account page.
- **Suggested fix:** Add the account sub-links to `MobileNav`, or auto-open the sidebar drawer from the hamburger.

### H4. [HIGH] Wishlist points to two different routes with inconsistent auth gating
- **Files:** `MobileNav.tsx:93` Quick-Action tile → `/wishlist` (ungated); `MobileNav.tsx:254-255`, `Header.tsx:182`, `BottomNav.tsx:11,22-40` → `/account/wishlist` (gated).
- **Routes:** `routes.tsx:51` `/wishlist` (public `WishlistPage`); `routes.tsx:69` `/account/wishlist` (ProtectedRoute). Two routes render the same page, one guarded.
- **Root cause:** One of two identical links in the same drawer was wired to the public route.
- **Suggested fix:** Standardize on a single wishlist route with consistent auth handling across all surfaces.

### H5. [HIGH] Quick View is dead code across all listing pages
- **Files:** `ProductCard.tsx:107` (trigger only); `ProductGrid.tsx:9,59` (optional, never supplied); `QuickViewModal.tsx` (never mounted in any scoped page).
- **Root cause:** The modal is never mounted and `onQuickView` is never passed.
- **Suggested fix:** Mount `<QuickViewModal>` once per listing page, pass `onQuickView` through `ProductGrid`, and add a mobile affordance.

### H6. [HIGH] Category page filter facets are a strict subset of Product Listing
- **Files:** `ProductListingPage.tsx:427-507` (Category, Subcategory, Collection, Brand, Size, Color, Price) vs `CategoryPage.tsx:458-489` (Subcategory + Gender only).
- **Root cause:** `CategoryPage` filters are hardcoded to subcategories + a fixed Gender `<select>`; it never loads Brand/Color/Size/Collection.
- **Suggested fix:** Reuse the shared filter-fetch/render logic in both pages.

### H7. [HIGH] Footer bottom bar fails WCAG AA contrast
- **File:** `Footer.tsx:145-148` (`text-neutral-600`/`text-neutral-500` copyright + policy links over `bg-luxe-charcoal`).
- **Impact:** ~2.4–3.0:1 contrast (needs 4.5:1). Affects both viewports.
- **Suggested fix:** Raise to `text-neutral-400`+ (≥4.5:1) or opacity > 0.5.

### H8. [HIGH] Missing global `:focus-visible` indicator on most controls
- **Files:** `Header.tsx:177-316`, `BottomNav.tsx:48`, `ProductCard.tsx:97-271`, `MegaMenu.tsx` links, `MobileNav.tsx` links, `Footer.tsx` links, `ImageGallery.tsx:129-154`, `SearchOverlay.tsx` buttons.
- **Impact:** Keyboard users get no visible focus ring on the majority of storefront controls.
- **Suggested fix:** Add a global `:focus-visible` ring utility or per-element `focus-visible:ring-2`.

### H9. [HIGH] Mobile-specific logo (`branding.logoMobile`) configured in admin but never used
- **Admin:** `src/admin/theme/ThemeBuilder.tsx:400` exposes "Logo URL (Mobile)".
- **Storefront:** `Header.tsx:76` reads only `logoUrl || themeBranding?.logo` (no `logoMobile`); `MobileNav.tsx:74` renders **text brand name only** — no logo image at all.
- **Root cause:** `logoMobile` field is dead in the storefront.
- **Suggested fix:** Read `themeBranding?.logoMobile` for the mobile breakpoint and render it in both the mobile header row and `MobileNav` top bar.

### H10. [HIGH] `/contact` reachable on mobile but not on desktop (reverse asymmetry)
- **Files:** `MobileNav.tsx:234` (`/contact`); desktop header/footer have no `/contact` link (only footer email/phone text, `Footer.tsx:132-138`).
- **Suggested fix:** Add `/contact` to desktop nav/footer parity, or remove it from `MobileNav` if unsupported.

---

# Medium

### M1. [MEDIUM] CartDrawer shows incomplete totals (no discount/tax/shipping)
- **Files:** `CartDrawer.tsx:13,166-178` (subtotal only) vs `CartPage.tsx:243-278` (subtotal, shipping, discount, tax, total).
- **Root cause:** Drawer only destructures `subtotal`/`total`; never consumes `couponCode`/`discountAmount`/`shippingCost` available on the cart store.
- **Suggested fix:** Surface discount, shipping, and computed total in the drawer footer.

### M2. [MEDIUM] CartDrawer ignores an already-applied coupon/discount
- **Files:** `CartDrawer.tsx:13,166-178` vs `CartPage.tsx:258-265` and `CheckoutPage.tsx:858-890`.
- **Suggested fix:** Render a green discount row + coupon chip in the drawer when present.

### M3. [MEDIUM] Checkout Order Summary is non-sticky and rendered *after* the form on mobile
- **Files:** `CheckoutPage.tsx:505-944` (single column below `lg`), `OrderSummary.tsx:20` (`sticky top-24` only at `lg`).
- **Impact:** Mobile users must scroll past the entire address/payment form to see itemised totals; no persistent total while filling the form.
- **Suggested fix:** Add a sticky mobile order-total bar (mirror `CartPage.tsx:367`).

### M4. [MEDIUM] DashboardSidebar FAB overlaps BottomNav / weak discoverability
- **File:** `DashboardSidebar.tsx:25-31` (`fixed bottom-20 right-4 z-30`). `BottomNav` is `z-40`. On ≤360px the FAB can collide with the BottomNav Account item.
- **Suggested fix:** Clear BottomNav safe-area on small screens; consider a persistent in-page sub-nav strip on mobile.

### M5. [MEDIUM] Mobile fullscreen/lightbox entry missing in ImageGallery
- **File:** `ImageGallery.tsx:136-144` (`max-md:hidden`). Desktop has a "View fullscreen" button; mobile has only tap-zoom/swipe.
- **Suggested fix:** Show a fullscreen affordance on mobile.

### M6. [MEDIUM] Collection & Search pages have no loading skeletons (spinner only)
- **Files:** `CollectionPage.tsx:29-34`, `SearchResultsPage.tsx:102-105` vs `ProductListingPage.tsx:646-651`, `CategoryPage.tsx:580-592` (skeleton grids).
- **Suggested fix:** Use the same skeleton-grid on all four pages.

### M7. [MEDIUM] `megaMenuColumns` gating differs between desktop and mobile renderers
- **Desktop:** `MegaMenu.tsx:55` requires `type === "mega_menu"`.
- **Mobile:** `MobileNav.tsx:113` checks length only (type-agnostic).
- **Impact:** An item with `megaMenuColumns` but wrong `type` renders columns on mobile but not desktop.
- **Suggested fix:** Use the same predicate in both renderers.

### M8. [MEDIUM] Promotional mega item drops its image on mobile
- **Desktop:** `MegaMenu.tsx:65-83` renders `promotionalContent.image`.
- **Mobile:** `MobileNav.tsx:144-161` renders title/description/link only — no image.
- **Suggested fix:** Render `promotionalContent.image` in the mobile block.

### M9. [MEDIUM] Desktop truncates nav children/columns; mobile renders all (content divergence)
- **Desktop:** `MegaMenu.tsx:134` `slice(0,4)` columns, `:193` `slice(4,6)` banner; `Header.tsx:250` caps top-level at `maxNavItems` (default 10).
- **Mobile:** `MobileNav.tsx:188` maps all children; `:111` renders all top-level (no cap).
- **Suggested fix:** Apply consistent limits (or none) across both; honor `maxNavItems` on mobile if global.

### M10. [MEDIUM] Mobile drawer uses `100vh`, risking clipped content on mobile browsers
- **File:** `MobileNav.tsx:85` `h-[calc(100vh-4rem)]`. `100vh` includes dynamic browser chrome; the Follow Us/social block at the bottom can be cut off.
- **Suggested fix:** Use `100dvh` or make the inner `nav` `flex-1` within the `bottom-0` aside.

### M11. [MEDIUM] Cookie consent banner overlaps mobile BottomNav
- **File:** `CookieConsent.tsx:93` `fixed bottom-0 left-0 right-0 z-50` (global, `App.tsx:53`); `BottomNav` is `z-40` `bottom-0`.
- **Impact:** On mobile the banner (z-50) fully covers BottomNav until dismissed.
- **Suggested fix:** Offset above BottomNav on mobile: `bottom-[calc(60px+env(safe-area-inset-bottom,0px))]` + safe-area padding.

### M12. [MEDIUM] PWA install prompt overlaps mobile BottomNav
- **File:** `PwaInstallPrompt.tsx:56` `fixed bottom-0 left-0 right-0 z-40` (global, `App.tsx:54`) — same z/position as BottomNav.
- **Suggested fix:** Offset above BottomNav on mobile or `md:bottom-4`.

### M13. [MEDIUM] Connectivity indicators are desktop-only by design and also dead code
- **Files:** `ConnectivityIndicators.tsx:16,22,27,48,68` (early-returns/`null` when `isMobile`); `OfflineBanner.tsx` never imported anywhere.
- **Impact:** Mobile is explicitly excluded; neither indicator is mounted at all (only `ConnectivityProvider` is).
- **Suggested fix:** Mount mobile-friendly variants (top snackbar respecting safe-area) or remove the `isMobile` suppression if mobile support is intended.

### M14. [MEDIUM] Offline banner overlaps the fixed Header (dead code)
- **File:** `OfflineBanner.tsx:15` `fixed top-0 z-50` with no offset below the header; equal z-index with `Header.tsx:94`.
- **Suggested fix:** Position below header on mobile (`top-[64px] md:top-[112px]`) or render inside the header stack. (Component currently not mounted.)

### M15. [MEDIUM] MobileNav "Support" section omits Privacy & Terms
- **File:** `MobileNav.tsx:227-241` (FAQ, Contact, Shipping & Returns only) vs `Footer.tsx` (Privacy/Terms/Shipping/FAQ).
- **Suggested fix:** Add Privacy/Terms to the drawer Support section.

### M16. [MEDIUM] ProductCard color swatches are desktop-only
- **File:** `ProductCard.tsx:233-240` (`hidden md:flex`). Mobile shoppers can't see available colors on the card.
- **Suggested fix:** Show a condensed swatch row in the mobile block.

### M17. [MEDIUM] Product Detail page has no mobile sticky Add-to-Cart bar
- **File:** `ProductDetailPage.tsx` — add-to-cart is inline-only (no `fixed`/`sticky` mobile bar), unlike `CartPage.tsx:366-380`.
- **Impact:** After scrolling past product info, the CTA leaves the viewport with no persistent bar.
- **Suggested fix:** Add a mobile sticky add-to-cart bar above BottomNav.

### M18. [MEDIUM] Persistent Search is unreachable on mobile while scrolling
- **Files:** `Header.tsx:47-59` (header auto-hides on scroll-down <768); `BottomNav.tsx:8-14` (no Search; "Browse" icon is actually `/products`); `MobileNav.tsx:87-105` (no Search).
- **Suggested fix:** Add a real Search trigger to `BottomNav`/`MobileNav`.

---

# Low / Cosmetic

- **L1 [Low]** Cart access inconsistency: Header icons → drawer (`openCart()`); drawer link + BottomNav → full `/cart` page (`Header.tsx:205,316`, `MobileNav.tsx:262`, `BottomNav.tsx:12`). Pick one model per context.
- **L2 [Low]** Quantity stepper diverges: drawer replaces "−" with Trash at qty 1 (`CartDrawer.tsx:138-146`) vs `QuantitySelector` disables "−" (`QuantitySelector.tsx:13,17`). Reuse `QuantitySelector` in drawer.
- **L3 [Low]** AddressForm fields render half-width on mobile (`checkout/AddressForm.tsx:67,87,96,106,111` — `grid-cols-2` only keyed to `sm`). Make City/State/Pincode/Country `col-span-2` below `sm`.
- **L4 [Low]** `Header` height constants (112 desktop / 64 mobile, `Layout.tsx:48-65`) don't match real bar heights and ignore the announcement bar / brand-flip. Measure via `headerRef` + `ResizeObserver`.
- **L5 [Low]** Announcement bar height not accounted for in `main` padding (`Layout.tsx:153`) — content can slide under the header when the bar is present.
- **L6 [Low]** Announcement `position: "bottom"` and `bgColor`/`textColor` configured in admin but ignored by storefront (`Header.tsx:110`, `useAnnouncements.ts:22-25`). Affects both viewports (admin-sync gap, not D/M parity).
- **L7 [Low]** Cart-count truncation inconsistent: header shows "9+" (`Header.tsx:216,325`), bottom nav shows "99+" (`BottomNav.tsx:57`). Standardize.
- **L8 [Low]** MegaMenu contains a `md:hidden` promo bar (`MegaMenu.tsx:214-222`) that never appears (mega menu is desktop-hover only) — dead code.
- **L9 [Low]** Lookbook detail has no mobile swipe gallery (`LookbookDetailPage.tsx:109-187`) — vertical scroll both platforms.
- **L10 [Low]** Error pages use off-brand palette and render outside `StorefrontLayout` (`ErrorPages.tsx:22,41,107`; `App.tsx:46`) — no Header/Footer/BottomNav on either platform.
- **L11 [Low]** Hero slider no-slides fallback hardcodes mobile CTAs (`HeroSliderSection.tsx:133-134`) ignoring admin content; real-slide path is consistent.
- **L12 [Low]** CMS PageBuilder desktop/tablet/mobile device toggles are not enforced on the storefront (`StaticPage.tsx:114` only checks `isVisible`); a section hidden on "mobile" in admin still renders on mobile.
- **L13 [Low]** Three separate skeleton implementations for the same card (`ProductListingPage.tsx:44-55` local, `ProductGrid.tsx:15-34`, standalone `ProductCardSkeleton.tsx` unused). Consolidate.
- **L14 [Low]** Discount badge color mismatch: card badge `bg-accent-gold` (`ProductCard.tsx:157`) vs inline price `text-accent-rose` (`PriceDisplay.tsx:24`).
- **L15 [Low]** WishlistPage remove control is hover-only (`group-hover:opacity-100`) and untappable on mobile (`WishlistPage.tsx:180-191`). Make it `opacity-100 md:opacity-0 md:group-hover:opacity-100`.
- **L16 [Low]** ImageGallery prev/next chevrons `w-10 h-10` (40px, below 44) (`ImageGallery.tsx:129,132`). Bump to 44px.
- **L17 [Low]** Several icon/format controls < 44px on mobile: grid/list toggle (`ProductListingPage.tsx:349,353`, `CategoryPage.tsx:409,416`), Reviews "Write a Review" (`Reviews.tsx:77`), MegaMenu nested links (`MegaMenu.tsx:129,178,196`), QuickViewModal close (`QuickViewModal.tsx:142`).
- **L18 [Cosmetic]** Heading scale direction inconsistent across pages (`CategoryPage.tsx:294` desktop larger; `CollectionPage.tsx:70`/`CollectionsIndexPage.tsx:43` desktop smaller).
- **L19 [Cosmetic]** Cookie/PWA banners lack `env(safe-area-inset-*)` padding (`CookieConsent.tsx:93`, `PwaInstallPrompt.tsx:56`).
- **L20 [Cosmetic]** Widespread `text-[9px]`–`text-[10px]` muted labels with low contrast (`ProductCard.tsx:226-238`, `Header.tsx:113,278`, `MegaMenu.tsx`, `Reviews.tsx`, etc.). Bump critical labels to `text-xs` / `text-neutral-500+`.
- **L21 [Cosmetic]** Lookbooks duplicated in mobile drawer with a misleading `Instagram` icon (`MobileNav.tsx:101-104` vs `:103`).
- **L22 [Cosmetic]** BottomNav "Browse" uses a `Search` icon (`BottomNav.tsx:10`) — icon/label mismatch.
- **L23 [Cosmetic]** About/Help CMS pages are linked nowhere on either platform (`StaticPage.tsx:26-33`, `useNavigation.ts` defaults, `Footer.tsx`). Discoverability gap.

---

# Desktop vs Mobile Comparison Table

| Component | Desktop | Mobile | Match | Severity |
|-----------|----------|---------|--------|----------|
| Navigation source | `useNavigation("header")` mega menu | `useNavigation("mobile")` drawer (flat defaults) | ❌ | Critical (C1) |
| Men/Women subcategories | Mega menu columns | Flat links, no drill-down | ❌ | Critical (C1) |
| Utility icons (Search/Wishlist/Notif/Account/Cart) | Upper bar `hidden md:block` | Search+Cart in header; rest in BottomNav/drawer | ⚠ (Notif missing) | High (H1) |
| Notifications + unread badge | Present (bell) | Absent everywhere | ❌ | High (H1) |
| Admin link | Present (`isAdmin`) | Absent | ❌ | High (H2) |
| Account sub-pages (Orders/Addresses/etc.) | DashboardSidebar persistent | FAB only, 2 taps deep | ⚠ | High (H3) |
| Wishlist route | `/account/wishlist` (gated) | `/wishlist` (ungated) in quick action | ❌ | High (H4) |
| Search entry | Header button + overlay | Header button only (auto-hides) | ⚠ | Medium (M18) |
| Product card (Listing/Category) | `ProductCard` (full) | `MobileProductCard` (stripped) | ❌ | Critical (C2) |
| Product card (Collection/Search) | `ProductCard` (full) | `ProductCard` (full) | ✅ | — |
| Product card color swatches | Shown | Hidden (`hidden md:flex`) | ❌ | Medium (M16) |
| Quick View | Trigger only, modal dead | Not rendered | ❌ | High (H5) |
| Category filters | 7 facets | 2 facets (subset) | ❌ | High (H6) |
| Filters UI | Sidebar `w-72` | Bottom sheet | ✅ | — |
| Cart (drawer) totals | subtotal only | subtotal only | ✅ | Medium (M1/M2) |
| Cart (page) vs drawer parity | Full totals / coupon | Subtotal only | ❌ | Medium (M1/M2) |
| Checkout order summary | Sticky `lg` right col | Below form, non-sticky | ❌ | Medium (M3) |
| PDP Add-to-Cart | In flow | No sticky bar | ❌ | Medium (M17) |
| ImageGallery fullscreen | Button present | `max-md:hidden` | ❌ | Medium (M5) |
| Loading skeletons (Listing/Category) | Skeleton grid | Skeleton grid | ✅ | — |
| Loading skeletons (Collection/Search) | Spinner | Spinner | ✅ (but inconsistent w/ siblings) | Medium (M6) |
| Footer | Full, low-contrast legal | Full, low-contrast legal | ✅ (a11y issue both) | High (H7) |
| Mobile logo (`logoMobile`) | Uses desktop logo | Text only (logoMobile ignored) | ❌ | High (H9) |
| Announcement bar | Top, brand colors hardcoded | Top, brand colors hardcoded | ✅ (admin-sync gap) | Low (L6) |
| Cookie consent | No bottom nav | Overlaps BottomNav | ❌ | Medium (M11) |
| PWA prompt | No bottom nav | Overlaps BottomNav | ❌ | Medium (M12) |
| Connectivity indicators | Desktop-only (also dead) | Suppressed | ❌ | Medium (M13) |
| Error pages | Outside layout | Outside layout | ✅ (both) | Low (L10) |

---

# Admin Sync Issues

| Admin Action | Desktop | Mobile | Status |
|--------------|---------|---------|--------|
| Edit **Header** navigation menu | ✅ Updates | ❌ Stale (separate `mobile` record) | **BROKEN** (C1) |
| Edit **Mobile Menu** navigation | ❌ Stale | ✅ Updates | **BROKEN** (C1) |
| Reorder hero slider | ✅ | ✅ (shared `HeroCarousel`) | OK |
| Enable/disable homepage section | ✅ | ✅ (shared `SectionRenderer`) | OK |
| Change theme/brand colors & fonts | ✅ (CSS vars) | ✅ (CSS vars) | OK |
| Set **mobile logo** (`logoMobile`) | n/a | ❌ Ignored (text only) | **BROKEN** (H9) |
| Set announcement `bgColor`/`textColor` | ❌ Ignored | ❌ Ignored | Admin-sync gap (L6) |
| Set announcement `position: bottom` | ❌ Renders top | ❌ Renders top | Admin-sync gap (L6) |
| Toggle CMS page section device visibility | ❌ Ignored (desktop) | ❌ Ignored (still renders) | Admin-sync gap (L12) |
| Edit footer links | ✅ | ✅ (shared `Footer`) | OK |
| Toggle header icon visibility | ✅ | ✅ (shared `headerConfig`) | OK |
| Toggle category/collection visibility | ✅ | ✅ (shared APIs) | OK |

**Root cause of all BROKEN rows:** navigation and branding are stored/fetched per `location` (`header`/`mobile`) and the storefront consumes them through two different hooks/components with no propagation. The admin `HeaderBuilder` saves one menu at a time.

---

# Responsive Issues

- **Overflow:** MegaMenu mobile promo bar can clip two text spans on 320–360px (`MegaMenu.tsx:215-221`, no `flex-wrap`). ProductDetail feature row uses edge-bleed `-mx-4` horizontal scroll (`ProductDetailPage.tsx:334`) — contained but verify at 320px. Filter chip rows are correctly `overflow-x-auto`.
- **Touch targets (<44px):** grid/list toggle (`ProductListingPage.tsx:349,353`, `CategoryPage.tsx:409,416`), ImageGallery chevrons (40px, `ImageGallery.tsx:129,132`), QuickViewModal close (40px), Reviews button, MegaMenu nested links. Cart/Checkout surfaces are good (44px).
- **Fixed/overlap:** Cookie/PWA banners over BottomNav (M11/M12); Offline banner over Header (M14, dead code); `100vh` mobile drawer clip (M10); checkout keeps 60px bottom padding though BottomNav is hidden (minor).
- **Images:** Aspect ratios consistent (`aspect-[3/4]` product imagery, `object-cover`); `SafeImage` used throughout. Good.
- **Animations:** Reduced-motion coverage is good (`useReducedMotion` in Layout/MobileNav/ProductCard/CartDrawer/QuickView/Wishlist/HeroCarousel). Minor: PDP `layoutId` tab indicator not motion-gated.

---

# Accessibility Issues

- **Contrast (H7):** Footer legal text fails WCAG AA on dark (`Footer.tsx:145-148`).
- **Focus visibility (H8):** No global `:focus-visible`; most icon/links lack a visible keyboard focus ring.
- **Small text (L20):** Pervasive `text-[9px]`–`text-[10px]` muted labels with low contrast on mobile.
- **Touch targets (see Responsive):** several sub-44px controls.
- **Positive:** Skip link present and correctly offset on mobile (`Layout.tsx:150`); aria-labels on icon buttons/dialogs are strong; MobileNav is a focus-trapped `role="dialog"`; reduced-motion widely honored; color-only indicators generally have text/aria support.

---

# Browser Specific Issues

This was a static audit; live cross-browser rendering could not be executed. Flagged *potential* browser-specific risks to verify in QA:

- **iOS Safari:** `100vh` drawer clip (M10), missing `env(safe-area-inset-*)` on Cookie/PWA banners (L19), double horizontal scrollbars from nested `overflow-x-auto` strips (ImageGallery thumbnails).
- **Safari/Chrome (mobile):** `backdrop-blur` performance on the fixed header and MobileNav overlay.
- **Firefox:** `color-mix()` usage in `Layout.tsx:133-141` (brand color tokens) — verify support; older Firefox may drop brand coloring.
- **Edge/Chrome:** `prefers-reduced-motion` honored; verify the un-gated `layoutId` PDP tab animation.
- **All:** Overlay `z-50` stacking collisions (SearchOverlay, CartDrawer, QuickViewModal, MobileNav, CookieConsent) when multiple open — both set `body overflow hidden`.

---

# Root Cause Analysis

1. **Separate navigation data sources (primary root cause of C1/H1/H2/H3/H4/H9/M7/M8/M9).** `Header`/`MegaMenu` consume `useNavigation("header")`; `MobileNav` consumes `useNavigation("mobile")`. Admin stores these as independent `location`-keyed menus (`HeaderBuilder.tsx`) with no sync, and the default arrays differ structurally (mega vs flat). Admin edits to one device's menu silently leave the other stale.
2. **Hardcoded per-surface links instead of a shared config (H1/H2/H4/H9/M11/M12).** Notifications, Admin, Wishlist route, mobile logo, Cookie/PWA positioning are each written inline in one component rather than sourced from a single device-agnostic config.
3. **Two product-card implementations (C2).** `MobileProductCard` was hand-rolled for Listing/Category and never feature-parity-matched to `ProductCard`; Collection/Search kept `ProductCard`, so the site is internally inconsistent.
4. **Responsive toggles without mobile equivalents (M5/M16/M17/M18).** Features gated behind `hidden md:block`/`max-md:hidden` (notifications, color swatches, fullscreen, persistent search, sticky PDP CTA) have no `<md` counterpart.
5. **Static layout magic numbers (L4/L5).** `headerHeight` is hardcoded (112/64) instead of measured; announcement bar height is ignored, risking content-under-header.
6. **Fixed overlay positioning not accounting for BottomNav (M11/M12/M14).** Global bottom-fixed banners assume no persistent mobile chrome.
7. **Dead/duplicate code (H5, L8, L13, M13/M14).** QuickView never mounted; MegaMenu `md:hidden` promo dead; three skeleton variants; connectivity indicators suppressed on mobile and unmounted.

---

# Recommended Fix Priority

## Phase 1 — Launch blockers (Critical + key High)
1. **Unify navigation (C1):** single menu → mega on desktop, accordion on mobile; or add admin "Apply to Mobile" + stale warning. Ensure Men/Women subcategories render on mobile.
2. **Delete `MobileProductCard` (C2):** use responsive `ProductCard` everywhere with wishlist/ATC/swatches/badges.
3. **Add mobile Notifications entry + unread badge (H1).**
4. **Add mobile Admin link for admin users (H2).**
5. **Expose account sub-pages in MobileNav (H3).**
6. **Fix Wishlist route to a single gated path (H4).**
7. **Fix Cookie/PWA banner overlap with BottomNav (M11/M12).**

## Phase 2 — High-impact UX/a11y
8. Wire or remove Quick View (H5). 9. Equalize Category filters with Listing (H6). 10. Footer contrast (H7). 11. Global `:focus-visible` (H8). 12. Use `logoMobile` on mobile (H9). 13. Add `/contact` to desktop or remove from mobile (H10). 14. Mobile sticky PDP Add-to-Cart (M17). 15. Mobile persistent Search (M18). 16. CartDrawer totals + coupon (M1/M2). 17. Sticky mobile checkout summary (M3).

## Phase 3 — Polish / robustness
18. ImageGallery mobile fullscreen (M5). 19. Skeletons on Collection/Search (M6). 20. MegaMenu/mobile renderer predicate parity (M7/M8/M9). 21. `100dvh` drawer (M10). 22. DashboardSidebar FAB safe-area (M4). 23. Connectivity indicators (M13) / offline banner (M14). 24. Header height measurement (L4/L5). 25. Touch-target bumps (L17). 26. CMS device-visibility enforcement (L12). 27. Announcement color/position support (L6). 28. Consolidate skeletons (L13); discount color (L14); wishlist mobile remove (L15).

---

# Final Verdict

**Can this storefront be considered visually identical between Desktop and Mobile? — NO.**

The two surfaces are *mostly* built from shared components and the homepage/theme/footer data is synchronized, **but** the navigation layer, the mobile product card, and several key entry points/overlays diverge. Before production deployment, the following inconsistencies remain and must be resolved:

### Must-fix before launch (Critical/High)
- [ ] C1 — Desktop/mobile navigation are independent, unsynced menus (Men/Women subcategories missing on mobile).
- [ ] C2 — Mobile listing/category cards are feature-stripped vs desktop/Collection/Search.
- [ ] H1 — Notifications unreachable on mobile.
- [ ] H2 — Admin link missing on mobile.
- [ ] H3 — Account sub-pages not in mobile drawer.
- [ ] H4 — Wishlist route mismatch (`/wishlist` ungated vs `/account/wishlist`).
- [ ] H5 — Quick View is dead code.
- [ ] H6 — Category filters are a subset of Listing filters.
- [ ] H7 — Footer legal text fails WCAG AA contrast.
- [ ] H8 — No global focus-visible indicator.
- [ ] H9 — Mobile logo (`logoMobile`) ignored.
- [ ] H10 — `/contact` reachable on mobile only.
- [ ] M11/M12 — Cookie & PWA banners overlap the mobile BottomNav.

### Should-fix (Medium) prior to or immediately after launch
- [ ] M1/M2 — CartDrawer missing totals/coupon.
- [ ] M3 — Checkout summary non-sticky/below form on mobile.
- [ ] M5 — ImageGallery fullscreen missing on mobile.
- [ ] M6 — Collection/Search missing skeletons.
- [ ] M7/M8/M9 — MegaMenu vs mobile renderer predicate/content divergence.
- [ ] M10 — Drawer `100vh` clip.
- [ ] M13/M14 — Connectivity/offline indicators (dead + mobile-suppressed).
- [ ] M15 — Mobile drawer omits Privacy/Terms.
- [ ] M16 — Color swatches desktop-only.
- [ ] M17 — No mobile sticky PDP Add-to-Cart.
- [ ] M18 — Persistent Search unreachable while scrolling on mobile.

### Recommended QA artifacts (not produced in this static audit)
Capture the following screenshots at 375px (mobile) and 1440px (desktop) for each mismatch above, named per convention, e.g.:
`desktop-home-navbar.png`, `mobile-home-navbar.png`, `desktop-category.png`, `mobile-category.png`, `desktop-product.png`, `mobile-product.png`, `desktop-cart-drawer.png`, `mobile-cart-drawer.png`, `desktop-checkout.png`, `mobile-checkout.png`, `mobile-wishlist.png`, `desktop-footer.png`, `mobile-footer.png`, `mobile-cookie-overlap.png`, `mobile-nav-drawer.png`.

**Overall readiness: NOT PRODUCTION READY** until Phase 1 items are closed.
