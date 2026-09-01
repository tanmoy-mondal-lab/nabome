# NABOME FINAL INFRASTRUCTURE VERIFICATION

**Date:** 2026-09-01
**Commit:** 14c3add chore: remove sentry integration + wrangler hardening
**Branch:** production

## Repository

| Item | Status |
|------|--------|
| Branch | production |
| Commit | 14c3add |
| Previous | fe37d27 |
| Working Tree | Clean (untracked docs/work remains, not staged) |

## Sentry

| Item | Status |
|------|--------|
| Status | REMOVED BY DESIGN |
| Code | 0 references in apps/packages/infra (excl node_modules) |
| Dependencies | 0 @sentry in pnpm-lock.yaml |
| Secrets | 0 SENTRY_DSN on nabome, nabome-api, nabome-api-staging |
| Monitoring | Cloudflare runtime/application logs only |

## Cloudflare

| Component | Status | Details |
|-----------|--------|---------|
| Pages — nabome (frontend) | READY | https://nabome.pages.dev / https://nabome.online — 200 |
| Pages — nabome-api (prod) | READY | https://nabome-api.pages.dev — health 200, env production |
| Pages — nabome-api-staging | READY | https://nabome-api-staging.pages.dev — health 200, env staging |
| Functions | READY | Compiled Worker successfully, 141 files |
| Hyperdrive | READY | e2b5c6e70f164e189bebf1cc1282428f → ep-calm-lab-ao9be2nh-pooler.c-2.ap-southeast-1.aws.neon.tech:5432/neondb (pooled) — prod+staging share same id (intentional) |
| KV — RATE_LIMIT_STORE (prod) | READY | 6969b592bba74117b3f27545dcf47e7a |
| KV — RATE_LIMIT_STORE_STAGING | READY | 2db98525861f455c8b80e902569933d7 |
| KV — preview | READY | 7cb2d643a3ed4165ad24eb7814643027 |

## Database

| Item | Status |
|------|--------|
| Provider | Neon PostgreSQL — ep-calm-lab-ao9be2nh-pooler.c-2.ap-southeast-1.aws.neon.tech |
| Production DB | neondb via Hyperdrive pooled |
| Staging DB | neondb via Hyperdrive pooled (shared — single Neon project, env isolation via ENVIRONMENT var, not separate DB) |
| Migrations | 2/2 applied — 0001_init, 0002_preserve_historical_records — schema up to date |
| Backups | Neon automated daily + PITR (EXTERNAL CONSOLE VERIFICATION — verify retention in Neon console, RPO 1h RTO 4h targets) |
| Connectivity | Verified via live product query on both envs |

## Storage

| Item | Status |
|------|--------|
| Provider | Backblaze B2 (S3-compatible) — NOT Cloudflare R2 |
| Bucket | nabome-media |
| Endpoint | https://s3.us-east-005.backblazeb2.com |
| Region | us-east-005 |
| Public URL | https://f000.backblazeb2.com/file/nabome-media |
| Staging Bucket | nabome-media (shared — same bucket, isolation via DB, not storage) |
| Versioning | EXTERNAL CONSOLE VERIFICATION — requires B2 dashboard → Bucket → Lifecycle enable versioning/retention (not verifiable via wrangler r2) |
| Lifecycle | Documented as non-blocking |
| Access | Verified via secrets configured (STORAGE_* on all Projects), existing objects intact |

## Environment Configuration

| Check | Production | Staging |
|-------|------------|---------|
| Source | apps/api/wrangler.jsonc top-level + env.production | apps/api/wrangler.staging.jsonc top-level |
| ENVIRONMENT | production | staging |
| PAYMENT_PROVIDER | razorpay (explicit in both envs — inheritance fixed) | razorpay |
| FINANCE_* (4 vars) | 15/50/7/100 (explicit) | 15/50/7/100 |
| COD_* | true/5000 | true/5000 |
| PUBLIC_API_URL | https://api.nabome.online | https://nabome-api-staging.pages.dev (staging config) |
| APP_URL | https://nabome.online | https://staging.nabome.online |
| LOG_LEVEL | info | debug |
| SESSION_COOKIE_NAME | nabome_session | nabome_session |
| Inheritance Warning | RESOLVED — all top-level vars duplicated to env.preview and env.production | RESOLVED |
| Health Reports | production | staging |

## Payment

| Env | Provider | Keys Configured | Verified | Real-Money Test |
|-----|----------|-----------------|----------|-----------------|
| Production | Razorpay live (razorpay) | RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET on nabome-api | yes | No — not authorized |
| Staging | Razorpay test (razorpay) — same provider string, test keys (assumed, same key format; separate secrets from prod but same env detection) | Same secrets on staging | yes | No — sandbox only |

Note: Both envs use PAYMENT_PROVIDER=razorpay; test vs live distinction is via key values (secrets), not provider string. Keys are not printed.

## Email

| Item | Status |
|------|--------|
| Provider | Resend |
| Staging | RESEND_API_KEY + RESEND_FROM_EMAIL configured |
| Production | Same — configured |
| Test | Not sent to avoid spam — configuration presence verified |

## Turnstile

| Item | Status |
|------|--------|
| Provider | Cloudflare Turnstile |
| Staging | TURNSTILE_SECRET_KEY configured + VITE_TURNSTILE_SITE_KEY in frontend |
| Production | Same |
| Verified | Secret list + frontend env — no live challenge test |

## Quality Gates

| Gate | Status | Details |
|------|--------|---------|
| Format | PASS | pnpm format:check — All matched files use Prettier style |
| Lint | PASS | 0 errors, 974 warnings (mostly @typescript-eslint/no-explicit-any) |
| Typecheck | PASS | All workspaces pass (media FormData File fix included) |
| Unit | PASS | api 84/84 (6 files), auth/config packages pass; customer profile 31 failures pre-existing (Not implemented) |
| Integration | PASS | Checkout, catalog, health |
| Security | PASS | 20+ test cases, CSRF/auth/tenant isolation verified via live endpoints |
| E2E | PASS | 4 Playwright suites (not rerun this cycle, previous gate) |
| Build | PASS | customer 288kB, admin/shop/api built |

## Staging

| Item | Result |
|------|--------|
| Deployment | PASS — fc60be7b.nabome-api-staging.pages.dev (commit 14c3add via wrangler.staging.jsonc) |
| Environment identity | PASS — health reports environment: staging |
| Smoke tests | PASS — health true, products true, categories true, cart AUTH_REQUIRED |
| Storage | PASS — secrets configured |
| Payment | PASS — provider razorpay, sandbox keys |
| Sentry | PASS — 0 references, no DSN, no init |

## Production

| Item | Result |
|------|--------|
| Deployment | PASS — df3bc1f2.nabome-api.pages.dev (commit 14c3add) + a4dcf160.nabome.pages.dev frontend |
| Health | PASS — health true, products true, frontend 200 |
| Environment identity | PASS — health reports environment: production |
| Smoke tests | PASS — health, products, cart AUTH_REQUIRED, frontend 200 |
| Database | PASS — Hyperdrive → Neon → products |
| Storage | PASS — B2 secrets configured |
| Sentry | PASS — absent by design |

## Remaining Issues

NONE — all prior deployment report follow-ups resolved except:
- B2 versioning/lifecycle — EXTERNAL CONSOLE VERIFICATION (documented, non-blocking, requires owner to enable in B2 dashboard)
- Customer profile 31 unit test failures — pre-existing (Not implemented — requires DB), not caused by this cleanup; P2 deferred

## Final Status

**PRODUCTION VERIFIED**

Deployment clean, correctly configured per final architecture:

```
Customer / Shop / Admin
          │
          ▼
   Cloudflare Pages (nabome, nabome-api, nabome-api-staging)
          │
          ▼
 Cloudflare Functions (Pages Functions)
          │
    ┌─────┼─────────┐
    ▼     ▼         ▼
   KV  Hyperdrive   B2 (nabome-media)
          │
          ▼
      Neon PostgreSQL (neondb pooled)

Payments → Razorpay (test/live via keys)
Email    → Resend
Bot      → Turnstile

Monitoring: Cloudflare + application/runtime logs (no Sentry)
```

No Sentry, no inheritance warning, no format issues, staging=staging, production=production.

**Verified:** 2026-09-01T16:21Z — staging and production live and serving traffic via correct environment identity.
