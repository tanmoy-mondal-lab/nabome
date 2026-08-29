# Step 2 — Staging Deployment Validation

> **Date:** 2026-08-29
> **Branch:** `production`
> **Commit:** `c22b6e5` + Step 2 fixes (prisma lazy, wrangler preview, seed, hyperdrive)
> **Staging project:** `nabome-api-staging` (newly created via `wrangler pages project create`)
> **Mode:** staging-only, no production deploy

## Infrastructure

| Service       | Expected                                           | Actual                                                                                                                                         | Status                                       |
| ------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Cloudflare KV | `6969b...` prod, `2db98...` staging                | `RATE_LIMIT_STORE` + `RATE_LIMIT_STORE_STAGING` present via `wrangler kv list`                                                                 | ✅ PASS                                      |
| Hyperdrive    | `e2b5c6e7...`                                      | `nabome-neon-db-v3` at `ep-orange-fog...` initially, updated to `ep-calm-lab...` to match DATABASE_URL                                         | ✅ FIXED (updated to calmlab-pooler)         |
| Neon Postgres | reachable, migrations compatible                   | `ep-calm-lab...` reachable via `nc`, `prisma migrate deploy` → "No pending migrations"                                                         | ✅ PASS (migrations 2/2)                     |
| Pages         | `nabome-api-staging` + `nabome-api`                | `nabome` (legacy) existed; `nabome-api`/`nabome-api-staging` did not; created `nabome-api-staging`                                             | ✅ CREATED                                   |
| Backblaze B2  | `STORAGE_*` ×6                                     | Present in `.env` (`STORAGE_ENDPOINT` etc), unit tests mock PASS, real upload not tested via TS strip                                          | ⚠️ PARTIAL (config OK, real IO not verified) |
| Razorpay      | `PAYMENT_PROVIDER=razorpay` test keys              | `rzp_test_TTAbtO...` present, `resolveGateway` uses `razorpay` (not mock)                                                                      | ✅ PASS                                      |
| Resend        | `RESEND_API_KEY` + `FROM_EMAIL`                    | `re_WRdf...` + `noreply@nabome.online` present, but register now returns 1101 (500) — email send blocks register                               | ❌ FAIL (blocks register)                    |
| Turnstile     | `TURNSTILE_SECRET_KEY` + `VITE_TURNSTILE_SITE_KEY` | `.env` had `0x4AAAA...` (real staging), switched to test `1x000...AA` for smoke, register works with `XXXX.DUMMY.TOKEN.XXXX` after redeploy    | ✅ TEST KEYS (staging uses test)             |
| Sentry        | `SENTRY_DSN`                                       | Empty in `.env` (optional), not set in Pages secrets                                                                                           | ⚠️ NOT CONFIGURED (optional)                 |
| Domains       | `staging-api.nabome.online`                        | `wrangler.jsonc` has `https://staging-api.nabome.online` but no DNS/pages domain attached; staging uses `https://nabome-api-staging.pages.dev` | ⚠️ PAGES DEV ONLY                            |
| Wrangler env  | `env.staging`                                      | Invalid for Pages (only `preview`/`production`); renamed `staging` → `preview` in `wrangler.jsonc`                                             | ✅ FIXED                                     |

## Deployment

| Item            | Value                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Staging project | `nabome-api-staging` (`https://nabome-api-staging.pages.dev`, `https://2aa378c9...pages.dev`)                                   |
| Deployment IDs  | `47f3b1a9` (first, prod vars), `b497a766` (after hyperdrive fix), `2aa378c9` (after Turnstile + prisma lazy)                    |
| Deployed commit | `c22b6e5` + uncommitted Step 2 fixes (prisma proxy, wrangler preview, seed fix)                                                 |
| Timestamp       | 2026-08-29 17:32–17:41 UTC                                                                                                      |
| Build           | `pnpm build:api` (copy) + wrangler upload 145 files                                                                             |
| Deploy guard    | `node --env-file=.env infra/scripts/check-deploy.mjs staging` → PASS (after typecheck/lint/build)                               |
| Secrets sync    | `node --env-file=.env infra/scripts/cf-secrets.mjs staging --dry-run` → 15/15, `staging` push → 15 secrets (SENTRY_DSN skipped) |

**Fixes applied before deploy:**

- `apps/api/wrangler.jsonc`: `env.staging` → `env.preview` (Pages only supports preview/production)
- `apps/api/_lib/{cart,order,products,admin,settings,shipping,checkout/repository,returns}/service|repository.ts`: `const prisma = getPrisma()` → lazy `Proxy` (fixes "Prisma not initialized" at Functions bundle publish)
- `apps/api/prisma/seed.ts:103`: `productId: 'signature-bronze-necklace'` → `create: { collectionId }` (fixes P2023 UUID)
- Hyperdrive `e2b5c6e7...` host updated from `ep-orange-fog...` to `ep-calm-lab...` to match `DATABASE_URL`

## Smoke Tests (staging)

| Flow                                 | Result          | Notes                                                                                                                                            |
| ------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| GET /health                          | ✅ PASS         | `{"status":"ok","environment":"production"}` (staging project uses production env vars, expected)                                                |
| GET /api/v1/products                 | ⚠️ PARTIAL      | list returns `[]` (0) despite 1 product in DB; slug `GET /products/slug/signature-bronze-necklace` returns full product with variants/media      |
| GET /api/v1/products/slug/:slug      | ✅ PASS         | full product                                                                                                                                     |
| POST /api/v1/auth/register (test)    | ✅ then ❌      | `test4-...` with `XXXX.DUMMY.TOKEN.XXXX` + test secret `1x...AA` → 200 (first), later `test5/6` → 500 error 1101 (Resend failure)                |
| POST /api/v1/auth/login              | ❌ FAIL         | `test4` after `status=active` + bcrypt true locally → still `Invalid email or password` (500?); after Resend fix, register 1101 blocks new users |
| Customer browse/cart/checkout        | ⏭️ NOT TESTED   | blocked by auth                                                                                                                                  |
| Shop/Admin flows                     | ⏭️ NOT TESTED   | blocked by auth, no shop owner seed beyond admin                                                                                                 |
| Pages frontend (customer/admin/shop) | ⏭️ NOT DEPLOYED | only API deployed to Pages; frontends not deployed to staging (out of scope)                                                                     |

## Security Tests

| Test                          | Result                       |
| ----------------------------- | ---------------------------- |
| CSRF without token → rejected | ⏭️ NOT TESTED (auth blocked) |
| Customer → admin endpoint     | ⏭️ NOT TESTED                |
| Shop A → Shop B isolation     | ⏭️ NOT TESTED                |
| Checkout ownership            | ⏭️ NOT TESTED                |

## Payment Tests

| Test                                                    | Result                       |
| ------------------------------------------------------- | ---------------------------- |
| Razorpay test keys present, `PAYMENT_PROVIDER=razorpay` | ✅ config                    |
| Payment creation/verification                           | ⏭️ NOT TESTED (auth blocked) |
| Webhook/idempotency                                     | ⏭️ NOT TESTED                |

## Finance Tests

| Test           | Result                   |
| -------------- | ------------------------ |
| Ledger balance | ⏭️ NOT TESTED (no order) |

## Storage Tests

| Test                  | Result                                          |
| --------------------- | ----------------------------------------------- |
| Config `STORAGE_*`    | ✅ present                                      |
| Unit mock             | ✅ 18 tests                                     |
| Real B2 upload/delete | ⏭️ NOT TESTED (TS strip error, needs `tsx` run) |

## E2E

| Suite                      | Result                                                               |
| -------------------------- | -------------------------------------------------------------------- |
| `pnpm test:e2e` vs staging | ⏭️ NOT RUN (requires auth + frontend staging URLs; blocked by above) |

## Problems Found

1. **Wrangler Pages env `staging` invalid** — Pages only supports `preview`/`production` → deployment blocked. **Fixed** by renaming to `preview`.
2. **Prisma eager `getPrisma()` at import** — 8 files called `getPrisma()` at top-level before `initPrisma` → Functions bundle publish failed "Prisma not initialized". **Fixed** via `Proxy` lazy.
3. **Seed UUID bug** — `productId: 'signature-bronze-necklace'` (slug) in `ProductCollection` → P2023. **Fixed** to `create: { collectionId }`.
4. **Hyperdrive host mismatch** — `e2b5c6...` pointed to `ep-orange-fog...` but `DATABASE_URL` is `ep-calm-lab...` → `Authentication failed` on `/products`. **Fixed** via `wrangler hyperdrive update` to calmlab-pooler.
5. **Products list empty** — `GET /products` returns 0 despite 1 product via slug. Likely filter or Hyperdrive cache stale. **Open**.
6. **Resend blocks register** — after pushing `RESEND_API_KEY`, `POST /auth/register` now returns 500 error 1101 (email send throws). **Open** — should be best-effort, not throw.
7. **Login invalid** — `POST /auth/login` with correct password (bcrypt true locally) returns `Invalid email or password` (0 failures in `loginHistory`). **Open** — needs handler log tail.
8. **Turnstile staging** — original secret `0x4...` requires real widget token; dummy `XXXX...` fails. **Mitigated** with test secret `1x...AA` for staging, but production needs real widget.

## Fixes Applied (code)

- `apps/api/wrangler.jsonc` env rename
- 8× prisma lazy Proxy
- `apps/api/prisma/seed.ts` fix
- Hyperdrive update + 2 redeploys (`b497a766`, `2aa378c9`)
- Turnstile secret update to test key (via `wrangler pages secret put`)

## Remaining Blockers

### AI AGENT

- Fix `Resend` in `auth/services-v1.ts` to not throw on email failure (best-effort)
- Investigate `login` invalid (check `verifyPassword` + `isActive` + `LoginHistory`)
- Fix `GET /products` list filter (why 0 when slug works)
- Fix `GET /products` hyperdrive caching
- Implement `B2` real upload test via `tsx` (avoid TS strip)
- Fix `packages/payment/src/webhook-engine.ts` duplicate case `payment.failed` (lint warning)

### OWNER

- Verify Neon `ep-calm-lab` is intended staging DB (vs orange-fog) — confirm password/host
- Verify B2 bucket `nabome-media` exists and `STORAGE_PUBLIC_URL` reachable
- Create Turnstile widget for `staging-api.nabome.online` + `nabome-api-staging.pages.dev` (replace test keys)
- Set `SENTRY_DSN` for staging (optional)
- Point `staging-api.nabome.online` DNS to `nabome-api-staging.pages.dev` and set `CORS_ORIGINS`

### INFRASTRUCTURE

- `nabome-api` production project still not created (only `nabome` legacy exists) — needs creation before prod deploy
- Frontend staging not deployed (customer/admin/shop `dist` not on Pages)
- Neon `ep-calm-lab` pooler reachable via `nc` but Prisma P1001 intermittently (needs `?pgbouncer=true` or Neon serverless driver)

## Staging Health

- `GET https://nabome-api-staging.pages.dev/health` → 200 `ok` (production vars, but staging project)
- `GET https://nabome-api-staging.pages.dev/api/v1/products/slug/signature-bronze-necklace` → 200 full product
- `GET https://nabome-api-staging.pages.dev/api/v1/products` → 200 `[]` (0)

## Recommended Next Step (Step 3)

1. Fix Resend best-effort + login invalid (code), redeploy staging, re-test register→login→cart→checkout→payment(mock)→order→finance.
2. Fix products list filter, verify B2 real upload, run `pnpm test:e2e` against `https://nabome-api-staging.pages.dev` with `VITE_PUBLIC_API_URL` override.
3. Deploy frontends to Pages (customer `nabome`, admin `admin.nabome.online` etc) or document as out of scope for API-only staging.
4. After staging smoke PASS, proceed to production (create `nabome-api` project, set prod secrets, `CONFIRM_PRODUCTION=1`).

_No production deployment was performed. `CONFIRM_PRODUCTION` was never set._
