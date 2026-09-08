# EXTERNAL SERVICES INTEGRATION AUDIT — NABOME

Date: 2026-09-08. Scope: forensic audit + targeted repair. No secret values printed.

## Executive Summary

Found 14 integration defects: 4× P0/P1 payment-webhook defects (refund 404, refund double-charge risk, payment idempotency broken, webhook ack-and-drop causing paid orders stuck in `initiated`), 2× P0 infra issues (settlement worker open trigger + committed cron secret), plus P1/P2 hardening gaps (email fail-open, storage unbounded timeouts, capture currency, staging shares prod Hyperdrive/KV). Fixed 8 code defects with minimal patches; all typechecks + unit tests pass. Remaining items need dashboard/manual action (separate Hyperdrive/KV per env, rotate exposed secret, set secrets).

## Architecture Discovered

```
Customer/Admin/Shop (Vite, apps/*) → PUBLIC_API_URL → Pages Functions (apps/api/functions, _handlers, _lib)
→ Prisma (Neon Postgres via Hyperdrive binding) + KV (rate-limit/session) → B2 S3-compatible storage (aws4fetch)
→ Razorpay (payments), Resend (email), Turnstile (captcha) → Settlement cron Worker (workers/settlement → internal API)
```

No R2/D1/Queues/DO in use (intentional: B2 + Neon + KV). No live courier/Stripe/bKash calls; adapters exist but unresolved.

## External Services Inventory

| Service | Provider | Code | Credential source | Runtime | Status |
|---|---|---|---|---|---|
| Database | Neon Postgres + Hyperdrive | `apps/api/_lib/prisma.ts`, `functions/_middleware.ts:73-77`, `prisma/schema.prisma` | Hyperdrive binding `HYPERDRIVE` (prod), `DATABASE_URL` (CLI/tests) | Pages Functions (edge) | Configured, pooling fragile |
| Storage | Backblaze B2 S3-compat | `_lib/storage/s3.ts`, `_lib/media/service.ts`, `_handlers/media/index.ts` | `STORAGE_*` secrets | Pages Functions | Configured, fixed timeouts |
| Payments | Razorpay | `packages/payment/*`, `apps/api/_lib/payment/*`, `_handlers/payments/*` | `RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET` | Pages Functions | Broken → fixed (4 defects) |
| Webhooks | Razorpay + platform HMAC | `_handlers/webhooks/index.ts`, `_lib/payment/webhook-service.ts` | `WEBHOOK_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Pages Functions | Broken → fixed lookup |
| Email | Resend | `_lib/email/service.ts`, `_handlers/auth/index.ts` | `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Pages Functions | Fixed fail-closed guard |
| Captcha | Turnstile | `_lib/turnstile.ts`, `_handlers/auth/index.ts` | `TURNSTILE_SECRET_KEY`, `VITE_TURNSTILE_SITE_KEY` | Server + browser | P1: token optional — not changed |
| Auth session | Self (JWT HS256 + DB) | `_lib/auth/jwt.ts`, `functions/_middleware.ts` | `JWT_SECRET`, `KV` | Pages Functions | P1: empty-secret fallback — documented |
| Cron | Settlement Worker | `workers/settlement/src/index.ts` → `POST /api/v1/internal/settlement/run` | `SETTLEMENT_CRON_SECRET` | Worker cron + fetch | Open trigger → fixed auth |
| KV | Cloudflare KV | `_middleware.ts:92`, `auth/index.ts`, `media` | binding `KV` | Edge | Configured |
| Hyperdrive | Cloudflare Hyperdrive | `wrangler.jsonc`, `wrangler.staging.jsonc`, `settlement/wrangler.toml` | binding `HYPERDRIVE` id `e2b5c6…` | Edge | P0: same ID prod+staging |

## Environment / Secret Mapping

Flow: `.env` (local only, gitignored) → `scripts/validate-env.mjs` + `packages/config/src/env.ts` (zod, not invoked at edge) → `wrangler secret put` (prod) / `.dev.vars` (local) → Pages `env` binding → service clients. Frontends use only `VITE_PUBLIC_API_URL/VITE_APP_URL/VITE_TURNSTILE_SITE_KEY` — no secret leakage found.

Presence (names only): `DATABASE_URL` PRESENT (local), `HYPERDRIVE` CONFIGURED, `RAZORPAY_*` PRESENT (test keys locally; verify prod dashboard), `RESEND_API_KEY` PRESENT, `STORAGE_*` PRESENT, `TURNSTILE_SECRET_KEY` PRESENT, `WEBHOOK_SECRET` PRESENT, `SETTLEMENT_CRON_SECRET` CONFIGURED (was committed — removed, must rotate), `JWT_SECRET/CSRF_SECRET` PRESENT.

Mismatches: `Env.HYPERDRIVE_URL` never read (dead); `SESSION_SECRET/CSRF_COOKIE_NAME` in `.dev.vars.example` have no code counterpart; `TURNSTILE_BYPASS_SECRET` used in code but absent from schema/validator; `validate-env.mjs` skips `workers/`; root `.env` `VITE_PUBLIC_API_URL=https://www.nabome.online` wrong (must be API origin) — do not promote; `CORS_ORIGINS` prod omits pages.dev preview, staging omits admin/shop subdomains.

## Database Audit

`_lib/prisma.ts`: `usePg = viaHyperdrive || isLocal` → `pg.Pool{max:5,connTimeout:30s}` + `PrismaPg`, else `PrismaNeonHTTP`. Singleton per isolate with 10s stale-pool reset; `[[path]].ts` 45s timeout + retry. `pg` over Hyperdrive TCP works only with `nodejs_compat` (set); per-isolate pools risk churn vs Hyperdrive `origin_connection_limit:20`. `process.env.DATABASE_URL` fallbacks (`prisma.ts:66`, `scheduled/handler.ts:11`) are dead on Workers and mask init failures — documented, not changed (middleware path correct). No schema change made.

## Storage Audit

B2 via `aws4fetch AwsClient{service:s3}`; `PUT/DELETE/HEAD` only, no presign (public-by-construction URLs). Guards require all `STORAGE_*` (fail-closed, correct). Fixed: added `AbortSignal.timeout(30s/15s/15s)` to upload/delete/exists (previously unbounded hang). Media flow `uploadProductMedia → validateFile → generateStorageKey → productMedia.create{url}` verified; delete failure swallowed leaving orphan objects (P2, documented); mock provider used for `local|preview` only.

## Cloudflare Infrastructure Audit

Bindings match code (`KV`, `HYPERDRIVE` only; no R2/D1/Queues — intentional). Problems: (a) staging shares prod Hyperdrive + KV IDs (`wrangler.jsonc:36,67`, `wrangler.staging.jsonc:35`, `settlement/wrangler.toml:17`) — staging writes prod; (b) `SETTLEMENT_CRON_SECRET` committed in plaintext — removed from toml, must rotate via `wrangler secret put`; (c) `POST /run` had no auth — fixed to require `x-settlement-secret`; (d) queue-status admin endpoint has no Queue binding (returns unimplemented) — documented.

## Third-Party API Audit

Razorpay: paise units correct (`toPaise`, `amountPaise`), HMAC verify + `timingSafeEqualHex` correct, `X-Razorpay-Idempotency-Key` sent. Resend: `POST /emails`, Bearer, 10s timeout; fixed missing-key guard (was `Bearer ''` → 401). Turnstile: siteverify 10s, catch-all `success:false` (no transient distinction, P3). Shipping: internal ledger only, no courier HTTP; stub reconcile returns zeros (P2).

## Payment Audit

Fixed: refund URL, capture currency, refund idempotency, payment idempotency forwarding (details below). `verify` returns 200 on `verified:false` (P2, kept contract — client checks flag). `mock` provider default outside production is intentional for preview. Amount tolerance ±0.01 server-side check correct; currency mismatch checked.

## Webhook Audit

Route `POST webhooks/gateway/{provider}` → raw `text()` → dual verify (platform optional + mandatory gateway HMAC) → nonce `@@unique(provider,eventId)` → dispatch. Fixed dispatch lookup (was `gatewayReference = pay_*` only, never matched since stored value is `order_*`; now OR over `gatewayReference/razorpayPaymentId/razorpayOrderId` using both `gatewayPaymentId` and `gatewayOrderId` from parsed event). Remaining: check-then-create race can 500 on duplicate under retry (P2); platform-signature skip when `WEBHOOK_SECRET` unset is fail-open by design (P2 — set secret in prod).

## Runtime Compatibility Audit

`nodejs_compat` set on API + worker. `jsonwebtoken`/`bcryptjs`/`pg`/`node:crypto` work under flag but non-idiomatic for edge (prefer `jose`/WebCrypto long-term; not changed). No `fs` in Functions. No browser secret leakage. `process.env` in edge paths documented above.

## Connectivity Test Results

```
CONFIGURATION → VALID (validate-env.mjs passes)
AUTHENTICATION → NOT TESTED LIVE (no prod secret access; test keys only local)
DATABASE → STATIC VALID (Hyperdrive binding + pooling reviewed; no destructive live query run)
STORAGE → STATIC VALID (B2 endpoint/bucket/keys present locally; no live upload — would create objects)
RAZORPAY → STATIC VALID (endpoint/keys present; no live charge — sandbox only)
RESEND → STATIC VALID (key present; no live send)
WEBHOOKS → STATIC VALID (signature + lookup logic fixed; needs provider dashboard URL + secret)
TURNSTILE → STATIC VALID (keys present)
```

## Problems Found

- ID P0-1 · Refund 404 · `packages/payment/src/gateway/razorpay.ts:177` · was `/refund` (singular) · expected `/refunds` · Root: wrong Razorpay path · Evidence: provider API `POST /payments/:id/refunds` · Fix: plural · Status: FIXED
- ID P0-2 · Webhook ack-and-drop · `apps/api/_lib/payment/webhook-service.ts:144-166` · lookup `gatewayReference=pay_*` never matched (`order_*` stored) → paid orders stuck `initiated` · Fix: OR over gatewayReference/razorpayPaymentId + gatewayOrderId/razorpayOrderId · Status: FIXED
- ID P0-3 · Settlement open trigger · `workers/settlement/src/index.ts:22` · `POST /run` unauthenticated · Fix: require `x-settlement-secret` 401 otherwise · Status: FIXED
- ID P0-4 · Committed cron secret · `workers/settlement/wrangler.toml:12` · plaintext secret in git · Fix: removed, left `wrangler secret put` note · Status: FIXED (rotation still required — see Not Fixed)
- ID P1-1 · Refund double-processing · `packages/payment/src/service.ts:426-430` · `getRefundById(idempotencyKey)` never matches → duplicate refunds · Fix: `getRefundByIdempotencyKey` (interface + mock + 4 API shims) · Status: FIXED
- ID P1-2 · Payment idempotency broken · `apps/api/_handlers/payments/index.ts:468` · header key stashed but never forwarded → gateway random key · Fix: forward `idempotencyKey` · Status: FIXED
- ID P1-3 · Capture missing currency · `razorpay.ts:161-166` · sent amount only · Fix: send `currency ?? INR` + optional `currency` on `CaptureRequest` · Status: FIXED
- ID P1-4 · Email fail-open · `_lib/email/service.ts:24` · `Bearer ''` → Resend 401, silent · Fix: throw when `apiKey` missing · Status: FIXED
- ID P2-1 · Storage unbounded hangs · `_lib/storage/s3.ts` · no timeout · Fix: 30s/15s/15s AbortSignal timeouts · Status: FIXED
- ID P1-5 · Staging shares prod DB/KV · wrangler IDs identical · staging writes prod · Status: NOT FIXED (needs dashboard)
- ID P1-6 · Turnstile skippable · `_handlers/auth/index.ts:128,247` · missing token skips CAPTCHA · Status: NOT FIXED (auth policy decision)
- ID P1-7 · Empty JWT/Resend secrets via `?? ''` · `_handlers/auth/*`, `_middleware.ts:168` · silent anon/401 · Status: NOT FIXED (needs fail-closed policy)
- ID P2-2 · Webhook dedupe race; verify 200-on-fail; media delete swallow; `pg.Pool` churn; CORS defaults permissive · Status: documented, not changed (contract/risk)

## Changes Made

| File | Change | Reason | Risk | Test |
|---|---|---|---|---|
| `packages/payment/src/gateway/razorpay.ts` | `/refund`→`/refunds`; capture +currency | Provider 404; capture requires currency | Low — matches provider API | payment unit 50 pass; typecheck pass |
| `packages/payment/src/gateway/types.ts` | `CaptureRequest.currency?` | Carry currency | Low — optional | same |
| `packages/payment/src/repository.ts` | `+getRefundByIdempotencyKey` (interface + mock) | Refund dedupe | Low — optional method | same |
| `packages/payment/src/service.ts` | use `getRefundByIdempotencyKey?.()` | Fix double refund | Low | same |
| `apps/api/_handlers/payments/index.ts` | forward `idempotencyKey`; add `getRefundByIdempotencyKey` ×4 shims | Restore idempotency | Low | api unit 105 pass; typecheck pass |
| `apps/api/_lib/payment/webhook-service.ts` | OR lookup over 4 fields + both event IDs | Fix ack-and-drop | Low — broader match, still provider-scoped | api unit pass; typecheck pass |
| `workers/settlement/src/index.ts` | require `x-settlement-secret` on `/run` | Open trigger | Low — cron uses secret header already | typecheck n/a (worker); eslint pre-existing anys only |
| `workers/settlement/wrangler.toml` | remove committed secret | Credential exposure | Low — must `secret put` + rotate | — |
| `apps/api/_lib/email/service.ts` | throw if `apiKey` missing | Fail-closed email | Low | api unit pass |
| `apps/api/_lib/storage/s3.ts` | timeouts 30/15/15s | Bounded external calls | Low | storage tests 18 pass |

## Problems Not Fixed

- Separate Hyperdrive/KV for staging vs prod (dashboard: new Hyperdrive + KV namespace, update `wrangler.staging.jsonc` + settlement worker envs).
- Rotate `SETTLEMENT_CRON_SECRET` (was committed): `wrangler secret put` on worker + API secret, update internal settlement secret.
- Set prod secrets via dashboard (never `.env`): `RAZORPAY_*`, `RESEND_API_KEY`, `STORAGE_*`, `JWT_SECRET` (≥32), `CSRF_SECRET` (≥16), `TURNSTILE_SECRET_KEY`, `WEBHOOK_SECRET`, remove `TURNSTILE_BYPASS_SECRET` in prod.
- Fix root `.env` `VITE_PUBLIC_API_URL` (must be API origin, not www) locally only.
- Decide Turnstile enforcement (require token when secret set) and JWT fail-closed (throw at startup) — auth policy, out of minimal scope.
- Configure Razorpay webhook URL → `/api/v1/webhooks/gateway/razorpay` with secret; verify live event maps `pay_*` + `order_id`.
- Live connectivity (DB read-only query, B2 list, Resend test send, Razorpay test order) needs prod credentials — not run to avoid destructive/sensitive ops.

## Final Verification

```
Build: not run (full monorepo build heavy; targeted typecheck instead)
Typecheck: payment PASS, api PASS
Tests: payment 50/50 PASS, api 105/105 PASS (incl. storage 18)
Lint: changed files — 0 new issues (2 pre-existing errors in settlement worker anys, 6 warnings pre-existing)
Database: static VALID, live NOT TESTED (needs credentials)
Storage: static VALID + timeout fix, live NOT TESTED
External APIs: static VALID, live NOT TESTED
Webhooks: logic FIXED, live provider test pending
Payments: 4 defects FIXED, live charge NOT TESTED (sandbox only)
Cloudflare: bindings MATCH code; staging/prod separation PENDING (manual)
Production configuration: secrets must be set/rotated via dashboard (see above)
```
