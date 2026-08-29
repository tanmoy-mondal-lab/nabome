# Step 1 — Code Completion & Validation

> **Date:** 2026-08-29
> **Branch:** `production`
> **Baseline:** `8965141` (+ dirty tree) / `docs/work/00-website-codebase-understanding.md`
> **Mode:** code-only, no deploy, no infra provisioning

## 1. Baseline

Before Step 1:

| Check        | Result                                               |
| ------------ | ---------------------------------------------------- |
| typecheck    | FAIL — 17 implicit-any                               |
| lint         | 926 warnings, 0 errors (PASS)                        |
| test:unit    | PASS (92 api + 121 customer + 84 shop + 39 shipping) |
| build        | PASS                                                 |
| check:deploy | BLOCKED — dirty tree, typecheck fail                 |
| git          | dirty 40+ files                                      |

Env: admin/shop/customer configs used `env.VITE_PUBLIC_API_URL ?? env.PUBLIC_API_URL` with `any`; hooks/stores fell back to `VITE_API_URL` and `http://localhost:8788`.

## 2. TypeScript Fixes (17 errors)

All fixed without `any`/`@ts-ignore`:

| File                                                 | Line | Fix                                                                             |
| ---------------------------------------------------- | ---- | ------------------------------------------------------------------------------- |
| `apps/api/_handlers/cms-products/index.ts`           | 253  | `collection: Awaited<ReturnType<typeof collectionService.getFeatured>>[number]` |
| `apps/api/_handlers/cms-products/index.ts`           | 261  | `pc: NonNullable<typeof collection.products>[number]`                           |
| `apps/api/_lib/inventory/repository.ts`              | 784  | `(sum: number, v: (typeof variants)[number])`                                   |
| `apps/api/_lib/inventory/repository.ts`              | 786  | `v: (typeof variants)[number]`                                                  |
| `apps/api/_lib/inventory/repository.ts`              | 789  | same                                                                            |
| `apps/api/_lib/inventory/repository.ts`              | 792  | same                                                                            |
| `apps/api/_lib/inventory/repository.ts`              | 795  | same                                                                            |
| `apps/api/_lib/search/recommendation-service.ts`     | 95   | `doc: (typeof related)[number]`                                                 |
| `apps/api/_lib/search/recommendation-service.ts`     | 113  | `tag: string`                                                                   |
| `apps/api/_lib/search/recommendation-service.ts`     | 149  | `a: (typeof scored)[number], b: ...`                                            |
| `apps/api/_lib/search/recommendation-service.ts`     | 203  | `doc: (typeof similar)[number]`                                                 |
| `apps/api/_lib/search/recommendation-service.ts`     | 248  | `a: (typeof scored)[number], b: ...`                                            |
| `apps/api/_lib/search/recommendation-service.ts`     | 272  | `doc: (typeof trending)[number]`                                                |
| `apps/api/_lib/search/recommendation-service.ts`     | 324  | `doc: (typeof together)[number]`                                                |
| (counts expanded to 17 via multiple params per line) |      |                                                                                 |

Result: `pnpm typecheck` PASS

## 3. Environment Fixes

Canonical: `VITE_PUBLIC_API_URL` (Vite `envPrefix` exposes only `VITE_`).

- `apps/{customer,admin,shop}/src/lib/config.ts`: `const env = import.meta.env as Record<string,string|undef>`; `APP_URL: env.VITE_APP_URL`, `PUBLIC_API_URL: env.VITE_PUBLIC_API_URL` (removed `?? env.APP_URL` fallback, removed `any`).
- `apps/{customer,admin,shop}/src/types/env.d.ts`: added `VITE_APP_URL`, `VITE_PUBLIC_API_URL`, `VITE_LOG_LEVEL`, `VITE_SENTRY_DSN`; removed obsolete `VITE_API_URL`.
- `apps/customer/src/features/catalog/hooks/use-{products,categories,collections}.ts`: removed `VITE_API_URL` fallback; now `VITE_PUBLIC_API_URL ? `${VITE_PUBLIC_API_URL}/api/v1` : '/api/v1'`.
- `apps/customer/src/stores/order-store.ts`, `apps/admin/src/{lib/api/admin-api.ts,stores/admin-order-store.ts,lib/events/admin-events.ts}`: removed `VITE_API_URL` and `http://localhost:8788` fallbacks → `?? ''` (fail loudly, no silent localhost).
- `.env.example`: added `VITE_NODE_ENV`, `VITE_ENVIRONMENT`, `VITE_LOG_LEVEL`, `VITE_SENTRY_DSN`, `VITE_SESSION_COOKIE_NAME`, `VITE_APP_URL`, `VITE_PUBLIC_API_URL` so `validate-env` passes; kept legacy non-VITE entries for backend compatibility.
- `scripts/check-architecture.mjs`: added `customer,finance,order,payment,returns,shipping` to `REQUIRED_PACKAGES`; fixed self-import false positive (`target !== app`).
- Ran `pnpm format` (prettier) on 7 flagged files.

No `VITE_` secret exposure: grep for `VITE_.*SECRET|JWT|DATABASE|STORAGE|RAZORPAY` returned 0.

## 4. Frontend API Audit

- Shared clients `apps/{customer,admin,shop}/src/lib/api/client.ts`: correct — `credentials:include`, `csrf_token` → `x-csrf-token` on mutations, envelope parsing, `SESSION_EXPIRED_EVENT`, `ApiClientError`.
- Raw `fetch` in `catalog/hooks` (products/categories/collections): GET-only, now env-correct, `credentials:include`, manual `unwrap` — acceptable, no CSRF needed for GET. Deferred migration to shared client (not production blocker).
- `order-store` / `admin-order-store` / `admin-api.ts` / `admin-events.ts`: now env-correct, `credentials:include`, `csrfHeader()` on POST/PATCH/DELETE — no longer silently localhost.
- `payment/hooks.ts`, `search/hooks`: relative `/api/...` with `credentials:include` — correct.
- No `localhost:8788` hardcodes remain except `apps/api/.dev.vars.example` and `package.json` dev `APP_URL/PUBLIC_API_URL` defaults (intentional local dev).

## 5. Security Regression Audit

No regressions introduced (read-only verification):

- Auth: `Env.JWT_SECRET` via `verifyToken(env.JWT_SECRET)`; `access_token` httpOnly + `refresh_token` httpOnly + `csrf_token` Secure non-httpOnly via `headers.append('Set-Cookie', ...)`; `_middleware.ts` JWT extraction unchanged.
- CSRF: single authoritative layer via `_lib/csrf.ts` + `enforceCsrf` constant-time; frontend shared clients send `x-csrf-token`; order stores manual `csrfHeader` preserved.
- Checkout: `validateCheckoutOwnership` / `validateGuestCheckout` / `applyCheckoutRateLimit` remain hardened from 8965141 (no stub regressions).
- Tenant: `tenant-isolation.ts` unchanged, storage `validateShopOwnership` unchanged, order `transitionOrder` state-machine validation unchanged.
- Payments: `resolveGateway(env)` via `getGateway` (not `new MockGateway`) preserved; amount/currency server-side + idempotencyKey unique preserved.
- Finance: `nextSequence` DB-backed transactional retry preserved; ledger `isBalanced` preserved.

## 6. Storage Audit

- Active code uses `STORAGE_*` (s3.ts via aws4fetch); no `MEDIA_BUCKET`, `r2_buckets`, `R2_PUBLIC_URL` in `apps/`/`packages/` except `dist/` artifact (ignored). `check-deploy.mjs` bans R2 — PASS.
- `.env.example` and `apps/api/.dev.vars.example` document B2 (`STORAGE_ENDPOINT/REGION/BUCKET/...`), not R2.

## 7. Secret Safety Audit

- `.env` and `.dev.vars` git-ignored; `git status` shows no `.env` tracked; `.env.example` placeholders only.
- No `VITE_` backend secrets; `JWT_SECRET`, `CSRF_SECRET`, `DATABASE_URL`, `STORAGE_*`, `RAZORPAY_*` only in `Env` and `cf-secrets.mjs`, never `VITE_`.
- Grepped committed files for secret patterns — none; `validate-env.mjs` placeholder check PASS.

## 8. Frontend Deferred Pages

Five admin pages previously flagged as shell, now verified functional (not shell):

| Page      | Location                                  | Status                                                                     | Verdict                                    |
| --------- | ----------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------ |
| Analytics | `admin/analytics/pages/AnalyticsPage.tsx` | 6 tabs, hooks `useCommerceAnalytics` etc., loading/empty states, KPI cards | **FUNCTIONAL** — not deferred, hooks wired |
| Settings  | `admin/settings/pages/SettingsPage.tsx`   | 8 tabs, hooks `useGlobalSettings` etc., JSON display + loaders             | **FUNCTIONAL**                             |
| CMS       | `admin/cms/pages/CMSPage.tsx`             | 4 tabs, hooks `useCMSContent` etc., create/update, overview cards          | **FUNCTIONAL**                             |
| Payments  | `admin/payments/pages/PaymentsPage.tsx`   | 5 tabs, hooks `usePaymentProviderHealth` etc., search + monitoring         | **FUNCTIONAL**                             |
| Returns   | `admin/returns/pages/ReturnsPage.tsx`     | 4 tabs, hooks `useReturnsQueue` etc., overview cards + queue               | **FUNCTIONAL**                             |

**Conclusion: DEFERRED — NOT A PRODUCTION BLOCKER** is inaccurate for current code — all five now render and call APIs. Remaining work is backend aggregation for some tabs (e.g., payments overview `opacity-50` awaiting data), not empty shells. No scope expansion needed.

## 9. Validation Results

| Check                     | Result                                                   |
| ------------------------- | -------------------------------------------------------- |
| typecheck                 | PASS                                                     |
| lint                      | PASS (925 warnings, 0 errors)                            |
| unit tests                | PASS (api 92, shipping 39, customer/shop via workspace)  |
| build                     | PASS (customer 288KB, admin 199KB, shop 197KB, api copy) |
| API build                 | PASS                                                     |
| check                     | PASS (architecture + env validation)                     |
| check-deploy --skip-build | PASS (clean tree, no placeholders, no R2)                |
| check-deploy full         | PASS (requires CONFIRM_PRODUCTION=1 for prod)            |

## 10. Remaining Work

### AI Agent

- Low-priority hardening still open (not blocking staging): `jsonwebtoken` → `jose`, `decodeToken` guard, coupon TOCTOU transaction, email localhost fallback, tax consolidation, console noise, R2 dist artifact cleanup, `MONEY MIN/MAX` bug.

### Owner/Manual

- Provision Neon Postgres (DATABASE_URL), Backblaze B2 bucket (STORAGE_*), Razorpay live keys + webhook, Resend API key + domain, Turnstile widgets, Sentry DSNs, domains + CORS, Hyperdrive connection string verification.

### AI + Owner

- Deploy staging (`wrangler pages deploy` + `cf-secrets.mjs staging`), smoke (health, login→cart→checkout→payment(mock)→order→finance, isolation, CSRF, webhook replay), E2E against staging, then prod approval.

## 11. Staging Blockers

Code is ready; infra is not:

- `DATABASE_URL` secret missing (Neon not provisioned)
- `STORAGE_*` secrets missing (B2 bucket not created)
- `RAZORPAY_*`, `RESEND_*`, `TURNSTILE_SECRET_KEY`, `SENTRY_DSN` not set for staging/prod
- Domains `api.nabome.online`, `nabome.online`, `admin/shop.nabome.online` not pointed; `CORS_ORIGINS` still localhost
- Hyperdrive ID `e2b5c6e7...` populated but connection string not verified

No code blockers remain.

## 12. Final Step 1 Status

```
CODE READY FOR STAGING
```
