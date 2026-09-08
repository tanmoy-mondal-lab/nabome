# PRODUCTION AUTH + MOBILE VERIFICATION

Date: 2026-09-06 (UTC). Production host: `https://www.nabome.online`.
API: `https://nabome-api.pages.dev`.

OVERALL STATUS: PARTIAL
AUTH STATUS: PARTIAL
CUSTOMER AUTH: PARTIAL
SHOP AUTH: NOT HOSTED
ADMIN AUTH: NOT HOSTED
MOBILE NAV STATUS: PASS (production headless-Chromium matrix; no physical device)
COOKIE STATUS: PASS (code-deployed + transport-verified; live Set-Cookie not captured — no credentials)
CORS STATUS: PASS
MULTI-TAB STATUS: KNOWN LIMITATION
MIDDLEWARE STATUS: PASS WITH KNOWN LIMITATION

ROOT CAUSE:

1. Dead cookie refresh (Bearer-only, unreadable httpOnly cookie), `SameSite=Lax`
   on cross-site cookies, wrong CSRF cookie name, reload-wiped auth flags
   (fixed, deployed).
2. shop/admin clients with no refresh/retry + user-only persist (fixed in repo;
   apps not hosted, so no production surface).
3. No startup bootstrap: fresh profile + valid cookie treated as guest (fixed,
   deployed, live bundle verified).
4. Mobile: double safe-area top offset, page-end hidden behind bottom nav,
   320px header crowding (logo crushed to 12px), sub-44px icon buttons,
   focusable closed drawer, no overflow-x guard (all fixed, deployed, verified).

COMMIT: `02a1b96` (auth/nav core `e7e78aa`; wishlist-collapse + test-path fixup
in `02a1b96`). Branch `production`, pushed to origin.

BACKEND DEPLOYMENT: project `nabome-api` → `https://5d4f1ca0.nabome-api.pages.dev`
(`wrangler pages deploy dist`, commit `c731fca`; runtime files identical through
`02a1b96` — only a test file changed after). Health 200 `production`.
Note: `nabome` dashboard git auto-builds FAIL pre-existing (also for 8531ba4);
CLI deploy is the established procedure per prior report.

CUSTOMER DEPLOYMENT: project `nabome` → `https://acb57535.nabome.pages.dev`
(commit `02a1b96`). Live `www` HTML references the new bundle hash (verified equal
to local `dist`).

SHOP DEPLOYMENT: N/A — no Pages project; `shop.nabome.online` does not resolve.
Code fixed in repo, unit-tested (84 pass).

ADMIN DEPLOYMENT: N/A — no Pages project; `admin.nabome.online` does not resolve.
Code fixed in repo, unit-tested (4 pass). RBAC untouched.

AUTH TEST RESULTS:

- Unit: customer 169, api 101 (incl. 7 refresh-handler), shop 84, admin 4 — PASS.
  Typecheck/build/eslint clean.
- Live refresh fingerprint: no cookie → 401 `Refresh token required`; garbage
  `refresh_token` cookie + `Origin: www` → 401 `Invalid refresh token` (proves
  cookie path live; old code ignored cookies); evil origin + cookie → 403 CSRF.
- Live bundle contains `/auth/profile` bootstrap + `Checking session` guard.
- Guest `/account` → `/login?from=...` in headless Chromium (bootstrap resolves,
  no crash, no false-authenticated state).
- NOT performed (no user credentials in this environment): interactive login,
  access-expiry wait, reload-persistence, remember-me close/reopen, explicit
  logout, revoked-refresh logout, two-tab race. These need a real account.

MOBILE TEST RESULTS (headless Chromium, production):

320x568, 375x667, 390x844, 393x852, 412x915, 430x932, 768x1024, landscape 844x390:
overflow-x 0 everywhere; sticky header 64–65px; logo/menu/search/cart/account/theme
present; desktop nav `display:none` below 1024px; bottom nav present; login form +
remember-me render; guest account → login. All header controls 44x44 (logo text
51x28 after wishlist collapse; wishlist stays reachable via bottom nav + drawer).
Shipped CSS verified: `overflow-x:clip`, `padding-bottom:calc(4rem +
env(safe-area-inset-bottom))` + `desktop:pb-0` override. No physical iPhone/Android
tested.

REMAINING RISKS:

1. Interactive login/logout/persistence/multi-tab flows unverified — need a real
   account (or seeded test user) + 15-min expiry wait.
2. Multi-tab rotation race fails closed (losing tab must re-login); server-side
   reuse grace would need schema/migration review — kept as KNOWN LIMITATION.
3. `_middleware` binds `sessionId` via `refreshTokenHash` lookup that always misses
   → latest-active-session fallback. Auth decisions use verified JWT (no
   unauthorized-access vector); only multi-session logout precision affected.
   Proper fix = sessionId claim in access JWT (future).
4. Excluded from this commit (still uncommitted): cold-DB resilience
   (`prisma.ts`, `[[path]].ts`, `products`, `errors.ts`, `security.ts`, `index.ts`)
   — triage separately; production runs without them today.
5. Dashboard git auto-build for `nabome` fails independently of this change.
