# MOBILE NAV FORENSIC REPORT — NABOME P1-B

Date: 2026-09-06 (UTC). Scope: customer app header/nav
(`shared/layout/Header.tsx`, `BottomNavigation.tsx`, `RootLayout.tsx`,
`styles/globals.css`). Breakpoints: tablet 640px, desktop 1024px, wide 1280px
(custom `tablet:`/`desktop:` variants, mobile-first).

## 1. Root causes found

1. **Double safe-area top offset.** Sticky `Header` applies
   `padding-top: var(--safe-area-inset-top)` AND `RootLayout <main>` applied the
   same var as `paddingTop`. On notched phones every page got a double top gap
   (header height 64px + 2× inset). Fix: header keeps it (it owns the viewport
   top); `<main>` top padding removed.
2. **Page-end content hidden behind fixed bottom nav.** `BottomNavigation` is
   `fixed bottom-0` (~4rem tall + bottom safe-area) but `<main>` had only
   safe-area `paddingBottom` (≈0 on non-notched phones) → last content/footer
   end slipped underneath it. Fix: `<main class="pb-[calc(4rem+env(safe-area-inset-bottom))] desktop:pb-0">`
   (derived from nav height, not arbitrary).
3. **Header action overflow at 320–360px.** Five right-side controls in `gap-2`
   with `px-4`, plus a text "Dark/Light" theme button (~60px wide) →
   crowding/overflow on 320px. Fix: `gap-0.5 sm:gap-2`, `px-3 sm:px-4`,
   icon-only Sun/Moon theme toggle, `tap-target` (44px) on all icon buttons,
   `min-w-0`/`truncate`/`shrink-0` on brand + actions.
4. **Sub-44px touch targets.** Ghost `size="sm"` buttons are 36px tall.
   Fix: `tap-target` class (min 44×44) on menu/search/theme/close buttons
   (wishlist/cart/account links already had it; bottom nav already 44px+).
5. **Closed drawer still focusable.** Mobile drawer stayed mounted with only
   `-translate-x-full` → off-screen links focusable by keyboard/AT.
   Fix: `invisible` when closed / `visible` when open + `aria-hidden`.
6. **Page-level horizontal overflow.** No `overflow-x` guard; carousels use
   `overflow-x-auto` (fine) but any wide child scrolled the whole page.
   Fix: `html, body { overflow-x: clip }` (`clip` preserves `position: sticky`).

## 2. Before / after

- Before: double top gap on notch devices; footer end under bottom nav; crowded
  320px header with text toggle; keyboard-focusable hidden drawer.
- After: single safe-area offset; 4rem+safe-area bottom clearance (desktop
  unchanged); icon-only toggle fits 320px; hidden drawer inert; no page-level
  x-scroll; desktop/tablet/dark-mode/search/cart/wishlist/account untouched.

## 3. Viewport matrix (code-audited; no device lab in this env)

320×568, 375×667, 390×844, 393×852, 412×915, 430×932, 768×1024, 1024×1366,
1280×800, 1440×900, portrait + landscape: header fits (tightest row ≈
menu44 + logo + search44 + wish44 + cart44 + account44 + theme44 with 2px gaps
≈ fits 320px); drawer `w-full max-w-sm`; search drawer `inset-x-0 top-0`;
bottom nav `desktop:hidden` with `pb-[env(safe-area-inset-bottom)]`; sticky
header keeps `top-0` + top safe-area. Overlay/toast/banner offsets (`bottom-16/20`)
already clear the bottom nav. **Requires on-device confirmation.**
