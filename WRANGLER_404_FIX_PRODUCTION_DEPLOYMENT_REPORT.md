# NABOME WRANGLER 404 FIX PRODUCTION DEPLOYMENT REPORT

## 1. Source Commit

- Commit: `8531ba4` (`docs(customer): record 404 audit commit and pending dashboard deploy`)
- Fix commit: `c4e4c85` (`fix(customer): resolve 404 audit findings`)
- Branch: `production` — verified via `git log`; only the 10 audit files were
  committed (unrelated `apps/api/*` working-tree modifications left untouched).
- No code modified during this deploy flow (docs-only report commit excluded from
  the built bundle path).

## 2. Build Verification

Built from `8531ba4` with repo scripts (`apps/customer`):

- typecheck (`tsc --noEmit`): PASS
- lint (`eslint src`): PASS (0 errors, 121 pre-existing warnings)
- tests: PASS — `apps/customer` 12 files / 159 tests (incl. 38 route tests),
  `packages/customer` 4 files / 53 tests → **212 total, exit 0**
- build (`vite build`): PASS, 2.55s

Dist forensics (`apps/customer/dist`):

- `index.html` exists; all 5 referenced JS/CSS assets verified present on disk.
- 14 lazy route page chunks present (`ShopPage`, `ProductDetailPage`,
  `CheckoutPage`, `WishlistPage`, …). No stale hashes, no missing files.
- `_redirects` emitted with `/* /index.html 200` (SPA fallback codified).
- API origin: bundle targets `https://nabome-api.pages.dev`; localhost strings are
  inert config fallbacks — runtime `resolvePublicApiUrl()` returns the production
  origin on the live hostname (`apps/customer/src/lib/config.ts`).

## 3. Wrangler Configuration

No customer wrangler config exists in-repo (by design — static Pages deploy).
Project discovered via `wrangler pages project list` (authenticated as
nabome.official@gmail.com, wrangler 4.103.0):

| Project | Domains | Git |
|---|---|---|
| **nabome** | nabome.pages.dev, nabome.online, www.nabome.online | Yes |
| nabome-api | nabome-api.pages.dev | No |

- Production branch: `production`; build output: `apps/customer/dist`.
- Note: dashboard git auto-builds for `c4e4c85`/`8531ba4` show **Failure** — which
  is why the dashboard never picked up the fix and Wrangler CLI deploy was required.

## 4. Exact Wrangler Deployment Command

```bash
wrangler pages deploy apps/customer/dist --project-name nabome --branch production --commit-hash 8531ba4
```

## 5. Deployment Output

```text
Warning: Your working directory is a git repo and has uncommitted changes
Uploading... (61/61)
Success! Uploaded 44 files (17 already uploaded) (3.61 sec)
Uploading _redirects
Deploying...
Deployment complete! Take a peek over at https://9cdd335b.nabome.pages.dev
```

(The uncommitted-changes warning refers to unrelated `apps/api/*` files; the
deployed `dist/` was built solely from committed customer sources.)

## 6. Deployment ID

- ID: `9cdd335b-a5c9-474a-9b7d-e7128c14a63a`
- Environment: Production, Branch: production, Source: 8531ba4
- Timestamp: 2026-09-05T16:53:33Z (verified live minutes after deploy)

## 7. Live Domain Verification

`https://www.nabome.online/` serves the new build: live HTML references
`assets/index-DQrGwtaI.js`, byte-identical to the deployed `dist/index.html`.
Old build no longer referenced. CUSTOM DOMAIN: PASS.

## 8. 404 Verification

| URL | BEFORE (prod crawl) | AFTER (live) | STATUS |
|---|---|---|---|
| /wishlist | 404 UI | login redirect (protected) | FIXED |
| /categories | 404 UI | controlled NotFound | FIXED (link → /shop) |
| /products, /products/:slug | 404 UI | controlled NotFound | FIXED (links → /shop, /product/:slug) |
| /about /careers /press /sustainability | 404 UI | placeholder page renders | FIXED |
| /help/contact /help/shipping /help/returns /help/faq | 404 UI | placeholder page renders | FIXED |
| /legal/terms /legal/privacy /legal/cookies /legal/refunds | 404 UI | placeholder page renders | FIXED |
| /forgot-password | 404 UI | controlled NotFound (dead link removed) | FIXED |
| /account/login | 404 UI | controlled NotFound (link → /login) | FIXED |
| /account/payments /account/settings /account/returns | 404 UI | placeholder (protected) | FIXED |
| /account/orders/:id/cancel | 404 UI | controlled NotFound (quick-cancel → detail page) | FIXED |
| /account/orders/:id/return | 404 UI | controlled NotFound (button disabled, no fake flow) | FIXED |
| /nonexistent-xyz-123 | 404 UI | controlled NotFound | INTENTIONAL |

0 unintended 404s. 404 STATUS: PASS.

## 9. Route Guard Verification

Fresh unauthenticated Chromium session, live domain: `/wishlist`, `/checkout`,
`/account`, `/account/orders`, `/account/wishlist`, `/account/addresses`,
`/account/payments`, `/account/settings`, `/account/returns`,
`/order-confirmation/o1` → **all redirect guests to login**, zero protected-content
leak (pre-fix, `/checkout` rendered to guests with an unhandled auth error).
ROUTE GUARD STATUS: PASS.

## 10. API Routing Regression Check

Live crawl captured every same-origin request: **0 requests to
`www.nabome.online/api/*`**. Product API calls target
`https://nabome-api.pages.dev/api/v1/...` (incl. correct API-side 404 for unknown
slugs). 0 HTML-as-JSON, 0 `Unexpected token '<'`. API ROUTING: PASS.

## 11. Original 500 Regression Check

`/ /shop /search /login /register /cart` on live: ServerErrorPage = 0,
`Maximum update depth exceeded` = 0, uncaught exceptions = 0, lazy chunk
failures = 0. ORIGINAL 500: FIXED (no regression).

## 12. Browser Results

Fresh headless Chromium (Playwright 1.62.1) against `https://www.nabome.online`,
40 checks: **39 PASS, 1 script-strictness note** — `/product/no-such-slug-xyz`
renders route + chrome with no exception; its console entry is the backend's
correct API 404 for a nonexistent object (frontend-route 404 ≠ API 404 per audit
rules). Observation (pre-existing, unchanged, not a defect): the product page shows
an empty content region for unknown slugs rather than an explicit message — no
crash, no exception, out of scope for this deploy (no code changed).

## 13. Final Production Status

Wrangler deployment succeeded, commit `8531ba4` is live on the custom domain,
all valid routes render, all previously broken routes fixed or honestly stubbed,
guards enforced, no 500/API/chunk regressions.
