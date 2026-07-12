# BUG FIX CHANGELOG

Storefront Desktop ↔ Mobile UI/UX parity fixes.
Source audit: `DESKTOP_MOBILE_UI_UX_AUDIT.md`.
Approach: minimal, surgical changes only. No redesign, no new features, no
refactor of working code. Build/typecheck/lint verified after each group.

---

## C1 — [CRITICAL] Navigation: mobile could not reach Men/Women subcategories
- **Root Cause:** `MobileNav` consumed `useNavigation("mobile")` (flat defaults) while the desktop `Header` consumed `useNavigation("header")` (mega menu with subcategory columns). Two independent data sources.
- **Files Modified:** `src/storefront/layout/MobileNav.tsx`
- **Change:** Switched the drawer to `useNavigation("header")` so it renders the same menu (MegaMenu columns render as accordions via the existing `hasMegaColumns` branch). Men/Women subcategories are now reachable on mobile.
- **Risk Level:** Medium (admin-edited "mobile" menu is no longer used on the storefront; this is the documented parity fix).
- **Testing:** `tsc -b` + `eslint` + `vite build` pass.
- **Regression Check:** Mobile drawer still renders categories, account block, support; desktop unchanged.
- **Status:** Fixed

## C2 — [CRITICAL] Stripped mobile product cards (Listing/Category)
- **Root Cause:** `ProductListingPage` and `CategoryPage` hand-rolled `MobileProductCard` (no wishlist / add-to-cart / swatches / badges) while Collection/Search used the full `ProductCard`.
- **Files Modified:** `src/storefront/pages/ProductListingPage.tsx`, `src/storefront/pages/CategoryPage.tsx`
- **Change:** Replaced the `md:hidden` `MobileProductCard` blocks with the responsive `ProductGrid` (full `ProductCard`) everywhere. Removed the dead `MobileProductCard` functions and their now-unused helpers/imports (`ProductRecord`, `asString/asRecord/asArray`, `SafeImage`, `formatPrice`, `Link`).
- **Risk Level:** Medium (removed ~80 LOC of bespoke markup; verified no other references).
- **Testing:** `tsc -b` (caught unused `Link`/`SafeImage`/`formatPrice` → removed) + `eslint` + `vite build` pass.
- **Regression Check:** Product card now feature-complete on mobile (wishlist, ATC, swatches, badges) matching desktop/Collection/Search.
- **Status:** Fixed

## H1 — [HIGH] Notifications unreachable on mobile
- **Files Modified:** `src/storefront/layout/MobileNav.tsx`
- **Change:** Added a Notifications entry (with live unread-count badge) to the account block, reusing the same `/api/notifications/unread-count` query as the desktop header.
- **Risk Level:** Low
- **Status:** Fixed

## H2 — [HIGH] Admin entry missing on mobile
- **Files Modified:** `src/storefront/layout/MobileNav.tsx`
- **Change:** Added an Admin link (`/admin`) gated by `isAdmin` in the account block.
- **Risk Level:** Low
- **Status:** Fixed

## H3 — [HIGH] Account sub-pages not in mobile drawer
- **Files Modified:** `src/storefront/layout/MobileNav.tsx`
- **Change:** Added Orders, Addresses, Notifications, Settings, Support links to the account block (consistent auth-gating with the rest of the drawer).
- **Risk Level:** Low
- **Status:** Fixed

## H4 — [HIGH] Wishlist route mismatch
- **Files Modified:** `src/storefront/layout/MobileNav.tsx`
- **Change:** Quick-action tile pointed to public `/wishlist`; changed to gated `/account/wishlist` to match the rest of the surfaces.
- **Risk Level:** Low
- **Status:** Fixed

## H7 — [HIGH] Footer legal text fails WCAG AA contrast
- **Files Modified:** `src/storefront/layout/Footer.tsx`
- **Change:** Copyright, policy links and "Back to top" raised from `text-neutral-500/600` to `text-neutral-400` (≥4.5:1 on `bg-luxe-charcoal`).
- **Risk Level:** Low
- **Status:** Fixed

## H9 — [HIGH] Mobile logo (`logoMobile`) ignored
- **Files Modified:** `src/storefront/layout/MobileNav.tsx`, `src/storefront/layout/Header.tsx`
- **Change:** Read `themeBranding.logoMobile` and render it in the MobileNav top bar and the mobile header row (falling back to `logoUrl` / brand name).
- **Risk Level:** Low
- **Status:** Fixed

## H10 — [HIGH] `/contact` reachable on mobile only
- **Files Modified:** `src/storefront/layout/Footer.tsx`
- **Change:** Added a "Contact Us" link to the footer contact column for desktop parity (mobile already linked it).
- **Risk Level:** Low
- **Status:** Fixed

## H6 — [HIGH] Category filters a subset of Listing
- **Files Modified:** `src/storefront/pages/CategoryPage.tsx`
- **Change:** Added Brand, Size and Color facets (plus active-filter chips and Filters-badge) to both the desktop sidebar and the mobile filter sheet, mirroring `ProductListingPage`. Wired `brand` into query params.
- **Risk Level:** Low (additive; existing Subcategory/Gender filters untouched)
- **Status:** Fixed

## M1 / M2 — [MEDIUM] CartDrawer missing totals & discount/coupon
- **Files Modified:** `src/storefront/components/CartDrawer.tsx`
- **Change:** Footer now shows Subtotal, Discount (with coupon code), Shipping, Tax and computed Total, mirroring `CartPage` (using `discountAmount`/`couponCode` from the cart store and shipping/tax settings).
- **Risk Level:** Low
- **Status:** Fixed

## M3 — [MEDIUM] Checkout summary non-sticky on mobile
- **Files Modified:** `src/storefront/pages/CheckoutPage.tsx` (change reverted)
- **Change (reverted):** A mobile sticky total bar was added above the BottomNav. **Reverted** — the production directive explicitly forbids "Sticky checkout bars" under DO NOT ENHANCE UX. Desktop already renders the summary sticky at `lg`; mobile parity is a UX enhancement, not a broken-behavior bug.
- **Risk Level:** n/a (reverted)
- **Status:** Reverted — out of production scope (move to a feature branch if desired)

## M4 — [MEDIUM] DashboardSidebar FAB overlaps BottomNav
- **Files Modified:** `src/storefront/components/DashboardSidebar.tsx`
- **Change:** FAB bottom offset now `bottom-[calc(76px+env(safe-area-inset-bottom))]` so it clears the BottomNav safe-area.
- **Risk Level:** Low
- **Status:** Fixed

## M5 — [MEDIUM] ImageGallery fullscreen missing on mobile
- **Files Modified:** `src/storefront/components/ImageGallery.tsx` (change reverted)
- **Change (reverted):** The "View fullscreen" button was revealed on mobile (`max-md:opacity-100`). **Reverted** to `max-md:hidden` — exposing a new mobile control is an added UI behavior, not a fix for broken functionality (tap-zoom/swipe already work on mobile).
- **Risk Level:** n/a (reverted)
- **Status:** Reverted — out of production scope (parity candidate for a feature branch)

## M6 — [MEDIUM] Collection/Search missing loading skeletons
- **Files Modified:** `src/storefront/pages/CollectionPage.tsx`, `src/storefront/pages/SearchResultsPage.tsx`, `src/storefront/components/ProductGrid.tsx` (changes reverted)
- **Change (reverted):** Spinners were replaced with `<ProductGrid isLoading />` skeletons. **Reverted** — the directive explicitly forbids "Skeleton loaders replacing spinners" under DO NOT ENHANCE UX. The spinner is the existing, working loading state; skeleton parity is an enhancement.
- **Risk Level:** n/a (reverted)
- **Status:** Reverted — out of production scope

## M10 — [MEDIUM] Mobile drawer `100vh` clip
- **Files Modified:** `src/storefront/layout/MobileNav.tsx`
- **Change:** `h-[calc(100vh-4rem)]` → `h-[calc(100dvh-4rem)]` to avoid clipping on mobile browser chrome.
- **Risk Level:** Low
- **Status:** Fixed

## M11 / M12 — [MEDIUM] Cookie / PWA banners overlap BottomNav
- **Files Modified:** `src/components/CookieConsent.tsx`, `src/components/PwaInstallPrompt.tsx`
- **Change:** Both banners offset to `bottom-[calc(60px+env(safe-area-inset-bottom))]` on mobile (`md:bottom-0` on desktop).
- **Risk Level:** Low
- **Status:** Fixed

## M15 — [MEDIUM] Mobile drawer omits Privacy/Terms
- **Files Modified:** `src/storefront/layout/MobileNav.tsx`
- **Change:** Added Privacy Policy and Terms of Service to the Support section.
- **Risk Level:** Low
- **Status:** Fixed

## M16 — [MEDIUM] Color swatches desktop-only
- **Files Modified:** `src/storefront/components/ProductCard.tsx`
- **Change:** Added a condensed color-swatch row (`md:hidden`) in the mobile info block.
- **Risk Level:** Low
- **Status:** Fixed

## M17 — [MEDIUM] No mobile sticky PDP Add-to-Cart
- **Files Modified:** `src/storefront/pages/ProductDetailPage.tsx` (change reverted)
- **Change (reverted):** A mobile sticky Add-to-Cart bar was added above the BottomNav. **Reverted** — the directive explicitly forbids "Sticky add-to-cart bars" under DO NOT ENHANCE UX. The inline Add-to-Cart already works; a persistent bar is a UX enhancement, not a bug fix.
- **Risk Level:** n/a (reverted)
- **Status:** Reverted — out of production scope (move to a feature branch if desired)

## M18 — [MEDIUM] Persistent Search unreachable while scrolling on mobile
- **Files Modified:** `src/storefront/layout/BottomNav.tsx` (change reverted)
- **Change (reverted):** A Search action item was added to the BottomNav. **Reverted** — the directive forbids "Additional Bottom Navigation items" / new UI entry points under DO NOT ENHANCE UX / DO NOT CREATE NEW UI. Search remains reachable via the (scrollable) header, which is existing behavior.
- **Risk Level:** n/a (reverted)
- **Status:** Reverted — out of production scope (move to a feature branch if desired)

## H8 — [HIGH] No global focus-visible indicator
- **Note:** A global `*:focus-visible` ring already exists in `src/styles/globals.css` (base layer, lines ~65-67). No change required; verified present.
- **Status:** Already handled (no modification needed)

---

## H5 — [HIGH] Quick View dead code (REMAINING ISSUE — fixed)

- **Root Cause:** `QuickViewModal` was never mounted and `onQuickView` was never supplied by any listing page, even though `ProductGrid`/`ProductCard` already forward the callback and the list-view card already renders a "Quick View" trigger (`ProductCard.tsx:107`).
- **Files Modified:**
  - `src/storefront/pages/ProductListingPage.tsx`
  - `src/storefront/pages/CategoryPage.tsx`
  - `src/storefront/pages/CollectionPage.tsx`
  - `src/storefront/pages/SearchResultsPage.tsx`
- **Change:** In each `ProductGrid` consumer, imported `QuickViewModal`, added `quickViewProduct` state, passed `onQuickView={(product) => setQuickViewProduct(product)}` to `ProductGrid`, and mounted `<QuickViewModal isOpen product={quickViewProduct} onClose={...} />` when a product is selected. This is a minimal, localized reconnection — `ProductGrid`, `ProductCard`, routing and modal architecture are untouched. The grid-view card still has no Quick View trigger (by design / not a completed-fix file), so Quick View is active wherever the list-view trigger already exists.
- **Risk Level:** Low (additive wiring in page components; no completed-fix files altered).
- **Testing:** `tsc -b` + `eslint` + `vite build` pass. No new test failures versus baseline (70 pre-existing failures unrelated to this change, identical before/after).
- **Regression Check:** Completed fixes in these pages (C2, H6) unaffected; no behavior change except Quick View now opens from list-view cards.
- **Status:** Fixed

---

## Items intentionally NOT modified (documented but out of safe-scope)

- **M7 / M8 / M9 (mega-menu renderer predicate / promo image / cap parity):** Largely resolved by C1 (both surfaces now consume the header menu). Remaining divergence (desktop `maxNavItems` cap not applied on mobile) is cosmetic, not breaking — left unchanged to avoid altering navigation structure.
- **M13 (Connectivity indicators):** `OfflineIndicator` / `EmergencyModeIndicator` are dead/unmounted; only `ConnectivityProvider` (the manager) is mounted in `src/app/main.tsx`. Mounting the visible indicators would introduce new fixed-position overlays, which the production directive explicitly forbids ("DO NOT IMPLEMENT: New overlays") and which the components themselves early-return `null` for on mobile (desktop-only by design). No existing application logic imports/renders them, so they are intentionally disabled dead code. Left untouched — no redesign of connectivity UX.
- **M14 (Offline banner):** `OfflineBanner` is dead/unmounted (never imported anywhere). Mounting it would add a new fixed `top-0` overlay (forbidden new overlay; also overlaps the fixed Header with equal `z-50`, a pre-existing collision noted in the audit). No app logic expects it to render. Left untouched.
- **L1–L23 (cosmetic / low):** Per directive, only the production-blocking and documented functional inconsistencies were addressed; cosmetic low-priority items left untouched.
