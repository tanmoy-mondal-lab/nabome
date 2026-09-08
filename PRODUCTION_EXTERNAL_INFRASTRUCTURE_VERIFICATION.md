# PRODUCTION EXTERNAL INFRASTRUCTURE VERIFICATION — NABOME

Date: 2026-09-08. Follows `EXTERNAL_SERVICES_INTEGRATION_AUDIT.md`. No secret values printed. No architecture changes.

## Executive Summary

Code fixes from the audit are verified live where safely possible: production API health is 200 (`environment: production`), webhook signature enforcement returns 401 on unsigned requests, provider endpoints (Razorpay, Resend, Turnstile) and the production site are reachable. KV isolation is CORRECT (separate prod/staging namespace IDs — the audit overstated this gap). One real isolation defect remains: staging shares the production Hyperdrive ID (staging writes prod DB). The committed settlement secret is removed from the working tree but present in git history — treat as compromised until rotated. Final status: PRODUCTION READY WITH MANUAL BLOCKERS (3 dashboard actions).

## Production Resource Map

```text
PRODUCTION (apps/api/wrangler.jsonc top-level + workers/settlement/wrangler.toml)
 ├── Database/Hyperdrive → binding HYPERDRIVE, shared ID (see §Hyperdrive)
 ├── KV → binding KV, prod namespace (id differs from staging)
 ├── Storage → Backblaze B2 S3-compat via STORAGE_* secrets (aws4fetch, timeouts fixed)
 ├── Payment → Razorpay via RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET (code fixed)
 ├── Email → Resend via RESEND_API_KEY (fail-closed guard fixed)
 ├── Captcha → Turnstile via TURNSTILE_SECRET_KEY
 ├── Webhooks → /api/v1/webhooks/gateway/razorpay, HMAC enforced (401 verified live)
 └── Cron → nabome-settlement worker (cron 0 2 * * 1 + authed POST /run)
```

## Staging Resource Map

```text
STAGING (wrangler.jsonc env.preview + wrangler.staging.jsonc)
 ├── Database/Hyperdrive → binding HYPERDRIVE, SAME ID as production (BLOCKER)
 ├── KV → binding KV, staging namespace (separate ID — CORRECT)
 ├── Storage → same bucket vars pattern (no separate staging bucket documented)
 ├── Payment → PAYMENT_PROVIDER=razorpay (test keys expected; mock default outside prod)
 ├── Email/App URLs → staging.nabome.online origins (CORRECT)
 └── Settlement worker → no staging worker; prod worker calls prod API (acceptable)
LOCAL → postgres://localhost:5432/nabome + preview KV id (CORRECT isolation)
```

## Hyperdrive Verification

- Binding name `HYPERDRIVE`: consistent in code (`functions/_middleware.ts`, `scheduled/handler.ts`) and all three configs. CORRECT.
- ID: identical in prod, preview, staging file, and settlement worker. INCORRECT for staging.
- `localConnectionString` (localhost) present in API configs; settlement worker has none (it only calls HTTP — its HYPERDRIVE/KV bindings are unused but harmless).

```text
Production Hyperdrive: CORRECT (points at prod DB; health 200, pool stable per code)
Staging Hyperdrive: INCORRECT (same ID as production — staging writes prod)
Cross-environment contamination: YES (staging → production database)
```

Fix requires dashboard: create staging Hyperdrive → new Neon DB/branch, put its ID in `wrangler.staging.jsonc` + `wrangler.jsonc` `env.preview.hyperdrive`. IDs cannot be fabricated — no config change made.

## KV Verification

- Prod namespace ID differs from staging/preview namespace ID in both `wrangler.jsonc` (`env.preview`) and `wrangler.staging.jsonc`. CORRECT (audit's claim of shared KV was wrong; only `preview_id` local slot is shared, which is by design).
- Code uses `env.KV` for rate-limit/session paths with graceful degradation. CORRECT.

```text
Production Worker → Production KV: CORRECT
Staging Worker → Staging KV: CORRECT
Cross-environment contamination: NO (KV)
```

No change made. Settlement worker declares prod KV (unused by its code — harmless).

## Storage Verification

B2 S3-compat via `aws4fetch`; all `STORAGE_*` required (fail-closed). Timeouts added (30/15/15s). No R2 binding — intentional. Live object operations not run (would create/delete prod objects). Storage host + public URL pattern consistent between `.dev.vars.example` and `.env.example`. Status: CONFIGURED, code path VERIFIED statically, live write NOT TESTED (by design).

## Payment Configuration

Razorpay code defects fixed and unit-tested (refund `/refunds`, capture currency, refund + payment idempotency). Provider endpoint reachable (HTTP 200 on base host). No live charge created (by design — sandbox only). Required dashboard items: live `RAZORPAY_KEY_ID/SECRET` in prod secret store, webhook URL → `/api/v1/webhooks/gateway/razorpay` with `RAZORPAY_WEBHOOK_SECRET`. Status: CODE CORRECT, live keys + webhook URL are MANUAL.

## Email Configuration

Resend base endpoint reachable (HTTP 200). `sendEmail` now throws when `RESEND_API_KEY` missing (fail-closed). No prod email sent (by design). Required: `RESEND_API_KEY` + `RESEND_FROM_EMAIL` in prod secret store. Status: CODE CORRECT, MANUAL.

## Webhook Configuration

Route live and enforcing: unsigned `POST .../webhooks/gateway/razorpay` → `401 WEBHOOK_SIGNATURE_INVALID` (verified 2026-09-08). Dispatch lookup fixed (OR over gatewayReference/razorpayPaymentId/razorpayOrderId). Required: provider dashboard webhook URL + secret. Status: VERIFIED (negative test); positive delivery test is MANUAL.

## Production Secret Matrix

| Variable | Required | Production | Staging | Used by | Status |
|---|---|---|---|---|---|
| HYPERDRIVE binding | YES | CONFIGURED | SHARED-WITH-PROD | Pages/Worker runtime | BLOCKED (staging isolation) |
| KV binding | YES | CONFIGURED | CONFIGURED (separate) | rate-limit/session | PASS |
| JWT_SECRET (≥32) | YES | UNKNOWN (dashboard) | UNKNOWN | auth middleware/JWT | MANUAL |
| CSRF_SECRET (≥16) | YES | UNKNOWN | UNKNOWN | CSRF | MANUAL |
| RAZORPAY_KEY_ID/SECRET | YES | UNKNOWN | test keys expected | payment gateway | MANUAL |
| RAZORPAY_WEBHOOK_SECRET | YES | UNKNOWN | UNKNOWN | webhook verify (401 live) | MANUAL |
| RESEND_API_KEY/FROM | YES | UNKNOWN | UNKNOWN | email (fail-closed) | MANUAL |
| STORAGE_* (6 vars) | YES | UNKNOWN | UNKNOWN | media upload | MANUAL |
| TURNSTILE_SECRET_KEY | YES | UNKNOWN | UNKNOWN | captcha verify | MANUAL |
| TURNSTILE_BYPASS_SECRET | NO | must be ABSENT | test only | auth bypass | MANUAL (verify absent in prod) |
| WEBHOOK_SECRET | YES | UNKNOWN | UNKNOWN | platform signature | MANUAL |
| SETTLEMENT_CRON_SECRET | YES | COMPROMISED→ROTATE | n/a | worker→internal API | BLOCKED (rotate) |
| CORS_ORIGINS | YES | CONFIGURED (vars) | CONFIGURED | CORS | PASS (review subdomains) |
| DATABASE_URL | CLI/tests | local only | n/a | Prisma CLI/seeds | PASS |

UNKNOWN = not visible from repo (dashboard secret store); presence must be confirmed by an operator with access. Nothing here blocks code — all consumers degrade or fail closed except noted P1s (Turnstile-optional, empty-JWT fallback remain as documented auth-policy decisions).

## Secret Exposure Audit

- Working tree: no plaintext secrets. Targeted sweeps for assignment patterns (`KEY=...`, `re_...`, private-key blocks) in `apps/ packages/ workers/ scripts/` → clean. Old settlement value no longer present in any file.
- Git history: the old `SETTLEMENT_CRON_SECRET` value IS present in history (commit `2dffcff`, file `workers/settlement/wrangler.toml`). CRITICAL SECURITY FINDING — Location: git history of that file — Credential type: cron shared secret — Action: ROTATE (history cannot be trusted even after file fix).
- `.env` (live local secrets): gitignored, untracked — PASS, but one `git add -f` away from disaster; never force-add.
- Frontends: only `VITE_PUBLIC_API_URL/APP_URL/TURNSTILE_SITE_KEY` (public) — PASS, no secret leakage.
- Build output `apps/api/dist/`, `.wrangler/`: gitignored — PASS (not committed).

## Connectivity Results

```text
Env validation (scripts/validate-env.mjs): PASS
Typecheck (@nabome/api): PASS
Provider reachability: api.resend.com 200, api.razorpay.com 200, challenges.cloudflare.com 200
Production site www.nabome.online: 200
Production API /api/v1/health: 200 {"status":"ok","environment":"production"}
Webhook negative test (unsigned POST): 401 WEBHOOK_SIGNATURE_INVALID (enforcement VERIFIED)
Database live query: NOT RUN (needs prod creds; read-only check is MANUAL)
KV live op: NOT RUN (dashboard-gated; MANUAL)
Storage live op: NOT RUN (would mutate objects; MANUAL)
Payment live charge: NOT RUN (sandbox only; MANUAL)
Email live send: NOT RUN (would send mail; MANUAL)
```

## Cross-Environment Contamination Audit

- Hyperdrive ID staging == prod: YES — BLOCKER (staging writes prod DB).
- KV IDs: separate — NO contamination.
- URLs: prod (`nabome-api.pages.dev`, `www.nabome.online`) vs staging (`staging-api.nabome.online`, `staging.nabome.online`) — correctly separated in vars. Root `.env` has wrong `VITE_PUBLIC_API_URL` (www instead of API origin) — local-only, do not promote.
- Buckets/keys/secrets: no prod values in staging files (all secrets via dashboard, not in repo) — NO contamination in repo.
- Payment env: `PAYMENT_PROVIDER=razorpay` both envs; staging must use test keys (dashboard) — MANUAL to confirm.

## Changes Made

| File | Change | Reason | Risk | Test |
|---|---|---|---|---|
| `apps/api/_lib/env.ts` | +`TURNSTILE_BYPASS_SECRET?`, `+SETTLEMENT_CRON_SECRET?` | Both consumed via `(as any)` casts but undeclared — verification proved gap | None (optional fields) | api typecheck PASS |
| `apps/api/.dev.vars.example` | +`TURNSTILE_BYPASS_SECRET`, `SETTLEMENT_CRON_SECRET`, `WEBHOOK_SECRET` placeholders | Operators had no documented slots for required secrets | None (example only) | validate-env PASS |

No resource IDs changed, no secrets added, no functionality altered.

## Manual Actions Required

1. Hyperdrive isolation (BLOCKER): Cloudflare dashboard → create staging Hyperdrive (new Neon DB/branch) → put new ID in `apps/api/wrangler.staging.jsonc` hyperdrive + `apps/api/wrangler.jsonc` `env.preview.hyperdrive` → redeploy staging → verify staging health reports staging + staging write lands in staging DB.
2. Settlement secret rotation (BLOCKER): generate new secret → `wrangler secret put SETTLEMENT_CRON_SECRET` on `nabome-settlement` worker AND on `nabome-api` (+ staging equivalents) → verify cron `POST /run` with new secret returns 200 and old value returns 401. Consider git-history purge or accept-and-rotate (rotation alone suffices if old value is revoked everywhere).
3. Production secrets (MANUAL): confirm via dashboard (names only) `JWT_SECRET, CSRF_SECRET, RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET, RESEND_API_KEY/FROM, STORAGE_* (6), TURNSTILE_SECRET_KEY, WEBHOOK_SECRET`; confirm `TURNSTILE_BYPASS_SECRET` ABSENT in prod; confirm staging Razorpay keys are TEST keys.
4. Provider wiring (MANUAL): Razorpay webhook URL → `https://<prod-api>/api/v1/webhooks/gateway/razorpay`; send test event → confirm payment reconciles (exercises the fixed OR-lookup end to end).
5. Live read-only checks (MANUAL, with creds): Hyperdrive → prod DB query; KV get; B2 HEAD/list; Resend test-send to operator inbox.

## Final Status

```text
PRODUCTION READY WITH MANUAL BLOCKERS
```

Code and live-reachable configuration are verified (health 200, webhook 401-enforced, endpoints reachable, KV isolated, secrets absent from repo). Production is NOT unconditionally ready because: staging shares the production Hyperdrive ID, and the settlement secret in git history must be rotated. Both are dashboard/human actions this environment cannot perform without fabricating resource IDs or touching irreversible provider state.
