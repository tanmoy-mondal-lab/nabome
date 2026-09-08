# MASTER EXTERNAL INTEGRATIONS FORENSIC AUDIT — NABOME

Date: 2026-09-08. Methodology: DISCOVER → TRACE → REPRODUCE → ROOT CAUSE → MINIMAL FIX → REGRESSION TEST → LIVE VERIFICATION. No secret values printed. No architecture changes. Preserves all prior audit fixes (Prisma, storage, payment-webhook lookup, settlement auth, email fail-closed, storage timeouts).

Prior reports read: `EXTERNAL_SERVICES_INTEGRATION_AUDIT.md`, `PRODUCTION_EXTERNAL_INFRASTRUCTURE_VERIFICATION.md`, `PRISMA_FORENSIC_AUDIT_AND_REPAIR.md`, `STORAGE_FORENSIC_AUDIT_AND_REPAIR.md`. Nothing reverted.

## Executive Summary

Full-repo discovery confirms 9 LIVE external integrations (Neon/Hyperdrive+Prisma, B2 storage, Razorpay, Resend, Turnstile, self-JWT, KV, settlement cron→internal API, browser→API) and ~12 claimed-but-unused stubs (Stripe/SSLCommerz/bKash/Nagad/PayPal adapters, courier APIs, tax provider, search provider, analytics SDKs, Sentry, OAuth, SMTP/SMS, R2/D1/Queues/DO — all verified absent from runtime paths).

4 confirmed defects found and fixed minimally (M-01…M-04), 6 regression tests added, all suites green (api 126/126, payment 50/50), typecheck + env validation pass, live probes pass (health 200, webhook 401-enforced, provider hosts reachable). Remaining items are dashboard/manual or policy decisions documented below.

## Existing Architecture

```text
Browser (customer/admin/shop, VITE_* only)
  ↓ fetch PUBLIC_API_URL
Pages Functions ([[path]].ts 45s+retry, _middleware initPrisma+JWT+CSRF+KV rate-limit)
  ├→ Prisma → Hyperdrive → Neon Postgres
  ├→ B2 S3-compat (aws4fetch PUT/DELETE/HEAD, 30/15/15s)
  ├→ Razorpay api.razorpay.com/v1 (Basic, paise, HMAC, idempotency key)
  ├→ Resend api.resend.com/emails (Bearer, 10s, fail-closed guard)
  ├→ Turnstile siteverify (10s, fail-closed on network)
  ├→ KV (rate-limit/session, fail-open if missing)
  └→ Internal settlement ← Worker cron (0 2 * * 1, x-settlement-secret, now 30s timeout)
No R2/D1/Queues/DO/AI (intentional). No axios/graphql/SMTP/SMS/OAuth SDKs.
```

## Complete External Dependency Inventory

| Integration | Provider | Runtime | Config | Code | Status |
|---|---|---|---|---|---|
| Database | Neon + Hyperdrive + Prisma 6.19.3 | Pages edge (nodejs_compat) | HYPERDRIVE binding / DATABASE_URL local | `_lib/prisma.ts`, `functions/_middleware.ts:73-77` | VERIFIED (prior audit) |
| Storage | Backblaze B2 S3-compat (aws4fetch) | Pages edge | STORAGE_* (6) | `_lib/storage/s3.ts`, `_lib/media/service.ts`, `_handlers/media` | VERIFIED (prior audit) |
| Payment | Razorpay | Pages edge | RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET, PAYMENT_PROVIDER | `packages/payment/gateway/razorpay.ts`, `_lib/payment/*`, `_handlers/payments` | FIXED M-01/M-03/M-04 |
| Webhooks | Razorpay HMAC + platform HMAC | Pages edge | WEBHOOK_SECRET, RAZORPAY_WEBHOOK_SECRET | `_handlers/webhooks`, `_lib/payment/webhook-service.ts` | FIXED M-04 |
| Email | Resend | Pages edge | RESEND_API_KEY/FROM_EMAIL, APP_URL | `_lib/email/service.ts`, `_handlers/auth` | VERIFIED (fail-closed) |
| CAPTCHA | Turnstile | Server + browser | TURNSTILE_SECRET_KEY, VITE_TURNSTILE_SITE_KEY, BYPASS (test-only) | `_lib/turnstile.ts`, `_handlers/auth` | POLICY GAP (documented) |
| Auth session | Self JWT HS256 + bcrypt + DB | Pages edge | JWT_SECRET ≥32 | `_lib/auth/jwt.ts`, `functions/_middleware.ts:185` | POLICY GAP (documented) |
| KV | Cloudflare KV | Pages edge | KV binding | `_lib/ratelimit.ts`, `_middleware.ts:109` | PASS (isolated) |
| Cron | Settlement Worker → internal API | Worker cron + fetch | SETTLEMENT_CRON_SECRET, SETTLEMENT_API_URL | `workers/settlement/src/index.ts` | FIXED M-02 |
| CDN | Cloudflare Pages/CDN + B2 public URLs | Edge + B2 | STORAGE_PUBLIC_URL | `_lib/storage/s3.ts:37-42` | PASS |
| Shipping | NONE (internal ledger only) | — | — | `_lib/shipping/service.ts` (static rates) | N/A (no external call) |
| Tax | NONE (internal 18% GST split) | — | — | `_lib/checkout/tax-service.ts` | N/A |
| Search | NONE (Postgres SearchDocument LIKE) | — | — | `_lib/search/*` | N/A |
| Analytics | NONE (internal DB; GA/PostHog stubs no-op) | — | — | `_lib/analytics/service.ts`, `customer/lib/analytics.ts:{}` | N/A |
| SMS/push | NONE | — | smsEnabled:false | toggles only | N/A |
| OAuth | NONE (no SDK/keys) | — | — | — | N/A |
| R2/D1/Queues/DO/AI | NONE by design (B2+Neon+KV) | — | — | — | N/A |
| Stripe/bKash/Nagad/PayPal/SSLCommerz | Adapters registered, never resolved | dead | — | `packages/payment/gateway/*.ts` throw PROVIDER_NOT_CONFIGURED | UNUSED |

Verify-actual-usage: every "NONE/UNUSED" above confirmed by zero `fetch` to provider hosts + zero credential wiring (`buildGatewayCredentials` only builds razorpay+mock; zero `twilio/smtp/algolia/posthog/sentry/R2Bucket/D1Database/Queue` in runtime code).

## Environment / Secret Matrix

Flow: `.env` (local, gitignored) → `scripts/validate-env.mjs` + `packages/config/env.ts` (startup only, not edge) → `wrangler secret put` / `.dev.vars` → Pages `env` → service clients. Frontends: only `VITE_PUBLIC_API_URL/APP_URL/TURNSTILE_SITE_KEY` — no leakage.

| Variable | Prod | Staging | Verdict |
|---|---|---|---|
| HYPERDRIVE binding | CONFIGURED | SHARED-WITH-PROD | MANUAL BLOCKER (staging writes prod) |
| KV binding | CONFIGURED (separate ID) | CONFIGURED (separate ID) | PRESENT |
| JWT_SECRET / CSRF_SECRET | UNKNOWN (dashboard) | UNKNOWN | MANUAL confirm (≥32/≥16) |
| RAZORPAY_KEY_ID/SECRET/WEBHOOK_SECRET | UNKNOWN | test keys expected | MANUAL |
| RESEND_API_KEY / FROM_EMAIL | UNKNOWN | UNKNOWN | MANUAL |
| STORAGE_* (6) | UNKNOWN | shared bucket `nabome-media` | MANUAL (M-01 staging bucket) |
| TURNSTILE_SECRET_KEY | UNKNOWN | UNKNOWN | MANUAL |
| TURNSTILE_BYPASS_SECRET | must be ABSENT | test only | MANUAL verify absent prod |
| WEBHOOK_SECRET | UNKNOWN | UNKNOWN | MANUAL |
| SETTLEMENT_CRON_SECRET | COMPROMISED→ROTATE (git history `2dffcff`) | n/a | BLOCKER rotate |
| DATABASE_URL | local only | n/a | PRESENT local |

Dead/mismatched (documented, not changed): `HYPERDRIVE_URL` never read; `SESSION_SECRET/CSRF_COOKIE_NAME` in example have no code counterpart; root `.env` `VITE_PUBLIC_API_URL=www` wrong locally (do not promote).

## Runtime Compatibility

`nodejs_compat` set on API + worker. Storage/email/turnstile paths use only `fetch`, `AbortSignal.timeout`, WebCrypto, `crypto.randomUUID` — Workers-native. `jsonwebtoken/bcryptjs/pg/node:crypto` work under flag (non-idiomatic vs `jose`/WebCrypto long-term; not changed per rules). No `fs` in Functions. No browser secret leakage. `process.env` fallbacks in `prisma.ts:66`/`scheduled/handler.ts:11` dead on Workers, harmless. M-01/M-02 timeouts use `AbortSignal.timeout` (Workers-supported).

## Authentication Integrations

Self-JWT HS256 (`issuer nabome-api`) + DB session. Findings (policy, NOT changed — rewriting auth is out of scope; code does not enforce prod guards):

- A-01 (P1): `jwtSecret: env.JWT_SECRET ?? ''` (`_handlers/auth/index.ts:156,299,446,805,809`) signs/verifies with `''` when unset. Middleware path is fail-closed (`_middleware.ts:185`); handlers are not. Needs fail-closed policy decision.
- A-02 (P1): `TURNSTILE_BYPASS_SECRET` / `x-turnstile-bypass` skips CAPTCHA + CSRF (`_middleware.ts:150-156`) + auto-verifies email + `POST auth/test-token` mints real tokens (`index.ts:757-837`) with no prod guard. Must be ABSENT in prod (dashboard) — code cannot fix without policy.
- A-03 (P2): opaque `session-manager.ts` accessToken never persisted (no server revocation; 15-min bearer) vs V1 JWT stack — divergent stacks, handlers use V1, middleware JWT-only. Documented; no change without repro.
- A-04 (P3): login allows `pending_verification`; register conflict enumerable vs legacy generic; refresh CSRF Origin exemption. Policy decisions, not changed.

## Payment Integrations

Razorpay `https://api.razorpay.com/v1`, paise correct (`toPaise`), HMAC `order|payment` + `timingSafeEqualHex` correct, `X-Razorpay-Idempotency-Key` forwarded. Prior fixes preserved (refund `/refunds`, capture currency, refund/payment idempotency, webhook OR-lookup). This audit fixes:

- M-01: unbounded gateway fetch → 15s timeout.
- M-03: recon provider default `|| 'mock'` → canonical `getPaymentProvider` (razorpay in prod).
- M-04: webhook/recon `verifyAndCapture` without signature → `webhookAttested` fetchPayment path.

Not changed (arch/policy): handler `processRefund` allows customer with `packages/payment` service bypassing lib admin/idempotency/180-day guards (`_handlers/payments/index.ts:602-725` vs `_lib/payment/service.ts:393-553`) — two-stack divergence; restricting to admin-only would change public contract, needs product decision. `verify` 200-on-`verified:false`, `voidPayment` throws, expiry never releases hold — documented.

## Webhooks

Route `POST webhooks/gateway/{provider}` → raw `text()` → platform HMAC (optional) + mandatory gateway HMAC → `@@unique(provider,eventId)` → dispatch (OR-lookup fixed previously). This audit:

- M-04 fixes the dispatch→capture break (was guaranteed `INVALID_SIGNATURE` → `failed` + infinite provider retries).

Remaining (documented, not changed): platform-signature skip when header absent / HMAC skip when `WEBHOOK_SECRET` unset (fail-open by design — set secret); check-then-create race on `webhookEvent` (second concurrent redelivery 500s instead of idempotent ack — needs `upsert`/ON CONFLICT, speculative without repro); no provider-scheme freshness (Razorpay has no timestamp; mitigation is `@@unique` + 5-min platform window); `payloadHash` stored but not compared on conflict; Razorpay `eventId = event:paymentId:orderId` synthesized (cross-type collision theoretical); unknown-payment silent ack (hides misrouted money — needs alerting, not code).

## Email

Resend `POST /emails`, Bearer, 10s timeout, throws on missing key / non-OK (fail-closed transport — prior fix preserved). Callers `try/catch console.error` and return success (fail-open UX — intentional so register never blocks on email; no outbox/queue table exists, adding one is architectural). `buildEmailConfig({} as any)` in legacy `services.ts:127,447` always throws → legacy-path emails never send (V1 path used by handlers is correct). Handler defaults `FROM ?? noreply@…` / `APP_URL ?? nabome.online` mask misconfig; unverified Resend domain → silent drops. No change (needs outbox design decision + dashboard domain verification).

## SMS / Notifications

No provider. `smsEnabled:false`, shipment events publish to in-memory `logisticsEventPublisher` only — status events have no delivery channel (silently dropped). Needs product decision (add provider vs remove toggles). No OTP-in-logs exposure found (no OTP flow exists).

## CAPTCHA / Bot Protection

Server verify posts `secret+response+remoteip`, 10s, fail-closed on network (correct). Gaps (policy, not changed): `hostname/challenge_ts/action` never asserted (cross-site token reuse theoretical); `register/login` schema `turnstileToken` optional and skipped when absent; frontend never mounts widget (zero `turnstile.render/getResponse`; site key read but unused) — only `password-reset` requires token. Enforcing now would lock out all clients until widget ships. Documented as auth-policy decision.

## Shipping

No external API. Static `standard/express/free` INR math, 2 static carriers, `shippingCost:0` hardcoded in order path, manual tracking numbers, stub reconcile zeros. `CarrierType SHIPROCKETS…` is DB enum only. No defect to fix (no provider to verify); live tracking/labels need a provider decision.

## Tax

No external provider. DB `findTaxRulesByRegion` else hardcoded 18% GST CGST/SGST split; 3 divergent implementations (`tax-service.ts`, `cart/service.ts:302-312`, `order-snapshot-service.ts:229`); no IGST/inter-state, no HSN rates. Never silently mischarges due to external failure (no external call). Unification needs product/tax decision — not changed.

## Search

No external provider. Postgres `SearchDocument` `contains-insensitive` (`LIKE %q%`) — no FTS/trigram, typo/facet scaling risk. Search is optimization-only (DB authoritative), so no DB-corruption risk. No change without repro.

## Analytics

No external SDK (zero `posthog/sentry/GA` deps; lockfile 0 `@sentry` post-removal). GA provider no-op (fetch commented out), console provider real, internal DB aggregations, frontend `initAnalytics(){}` no-op, wishlist beacon internal-only. Consequence: zero prod error-monitoring after Sentry removal (Cloudflare logs only). Adding monitoring is a product decision — not changed. Analytics failures cannot break commerce (no-ops).

## CDN / Media Delivery

B2 public-by-construction (`{STORAGE_PUBLIC_URL}/{key}`), no presign (by design), `PUT` sets MIME Content-Type, B2 serves length/ETag. `GET /products` sets `Cache-Control: public,max-age=300`; no `Cache-Control` on `PUT` (B2 defaults apply — acceptable). CORS echo allowlist (never `*`). Delete-failure swallowed but DB delete proceeds (safe direction; worst case orphan object cost). No defect fixed here (storage chain fully audited previously).

## Cloudflare Infrastructure

Bindings match code (`KV`, `HYPERDRIVE` only). `observability.enabled:true`, `nodejs_compat` set. KV IDs isolated prod vs staging (CORRECT — prior audit overstated). Defects: staging shares prod Hyperdrive ID (BLOCKER, dashboard-only); settlement secrets unused-but-declared `HYPERDRIVE/KV` in worker (harmless); `queue-status` admin endpoint returns unimplemented (no Queue binding — by design). M-02 adds the missing worker-fetch timeout.

## Other External APIs

None. All HTTP is native `fetch`/`AwsClient.fetch` (zero `axios/ky/graphql`). Finance internal ledger; `COD_ENABLED` defaults diverge (`'false'` in payments handler vs `'true'` in finance config — documented inconsistency, not changed: flipping either default changes checkout behavior without evidence).

## Timeout / Retry Audit

| Call | Before | After |
|---|---|---|
| B2 PUT/DELETE/HEAD | 30/15/15s | unchanged (prior fix) |
| Resend | 10s | unchanged |
| Turnstile siteverify | 10s | unchanged |
| `[[path]].ts` handler | 45s + 500ms single retry | unchanged |
| Razorpay gateway `request()` | UNBOUNDED | M-01: `AbortSignal.timeout(15000)` |
| Settlement worker → internal API | UNBOUNDED | M-02: `AbortSignal.timeout(30000)` |
| Finance `for(attempt<retries)` loop | bounded loop | unchanged |
| `setTimeout` backoff (`transaction.ts:107`, `webhook-engine.ts:400`) | fragile on Workers | unchanged (no repro; retry of non-idempotent ops is riskier) |

No blind retries added to non-idempotent operations.

## Idempotency Audit

Payments: `x-idempotency-key` → gateway header (prior fix) + `@@unique(idempotencyKey)`; refunds: `getRefundByIdempotencyKey` (prior fix). Webhooks: `@@unique(provider,eventId)` ack-on-duplicate (race caveat above). Orders: `createFromCheckout` has no client key (duplicate-submit under double-click theoretical — needs idempotency-key contract decision, not changed). M-04 paths are idempotent (captured/completed no-op guards + `capture:` prefixed transaction keys).

## Error Handling Audit

No new silent failures introduced. M-04 preserves error taxonomy (`PAYMENT_AMOUNT_MISMATCH` passthrough via `instanceof ApiError` rethrow; gateway errors mapped as before). Storage S-01/S-02 passthroughs preserved. Email fail-open preserved intentionally. `catch {}` sweeps: no credentials in messages (B2 body truncated 200 chars, XML only; gateway messages structured `GatewayFailure`).

## Security Audit

- Working tree sweep: no plaintext secrets; frontends `VITE_*` only. Settlement plaintext removed from tree (history still compromised → rotate).
- `TURNSTILE_BYPASS_SECRET` + `auth/test-token` live route: test backdoor surface — dashboard mitigation (absent prod), code policy pending.
- Empty-JWT-secret `?? ''`: forgery-if-unset — startup validation pending.
- Webhook fail-open when secrets unset: set secrets (dashboard).
- No SSRF: no user-controlled URLs fetched (all provider hosts hardcoded constants; `SETTLEMENT_API_URL` operator-controlled).
- No unvalidated-external-response writes beyond amount/status-checked capture.

## Database ↔ External Service Consistency

| Flow | Result |
|---|---|
| Payment ↔ order (webhook capture) | FIXED M-04: was gateway-attested success but local stuck `initiated` + retry storm; now fetchPayment-confirmed capture → `captured` → order `confirmed` + finance records |
| Recon ↔ gateway | FIXED M-03/M-04: was diffing prod against mock map + fix-up always threw; now canonical provider + attested fix-up |
| Upload PUT ↔ `productMedia.create` | compensating delete (prior S-03) preserved |
| Email ↔ user state | register succeeds with `pending_verification` even if email drops (intentional fail-open; outbox pending) |
| Shipping/tax/search ↔ DB | no external writes; DB authoritative — no divergence possible |

## Live Connectivity Results

Non-destructive probes, 2026-09-08 (no charges, shipments, emails, writes):

```text
Production API /api/v1/health → 200 (PASS)
Unsigned POST /api/v1/webhooks/gateway/razorpay → 401 WEBHOOK_SIGNATURE_INVALID (PASS — enforcement verified)
api.resend.com/emails POST w/o key → 401 (PASS — host reachable, auth-required as expected)
api.razorpay.com/v1 → 404 on base path (PASS — host reachable; subpaths require auth)
challenges.cloudflare.com siteverify w/o params → 400 (PASS — host reachable)
DB live query / KV live op / B2 write / charge / send → NOT RUN (needs prod creds / would mutate; MANUAL)
```

Classification per provider: CONFIGURATION valid (static) / AUTHENTICATION manual (dashboard secrets) / CONNECTIVITY pass / REQUEST+RESPONSE pass (negative tests) / APPLICATION PROCESSING fixed+unit-verified (M-04 logic; positive provider delivery test manual via dashboard webhook URL).

## Problems Found

ID: M-01
Severity: P1
Integration: Payment / Razorpay gateway
Provider: Razorpay api.razorpay.com
File: `packages/payment/src/gateway/razorpay.ts:69-73`
Observed Behavior: `fetch` with no `signal` — gateway hang holds the Worker unbounded (wall-time/CPU exhaustion, §21 violation). Every sibling integration (B2/Resend/Turnstile) already bounded.
Expected Behavior: Bounded 15s timeout mapping to transient `GATEWAY_UNAVAILABLE` via existing catch path.
Root Cause: Missing `AbortSignal.timeout` on the single shared `request()` helper.
Evidence: Source read; sibling timeout pattern in `s3.ts:66,89,112`, `email/service.ts:43`, `turnstile.ts:35`.
Fix: `signal: AbortSignal.timeout(15000)` in `request()`.
Regression Test: `external-integrations-forensic.test.ts` → "M-01 razorpay gateway fetch is time-bounded".
Result: PASS (api 126/126, payment 50/50).

ID: M-02
Severity: P2
Integration: Cron / Settlement Worker → internal API
Provider: internal (Cloudflare Worker fetch)
File: `workers/settlement/src/index.ts:40-44`
Observed Behavior: `fetch` settlement/run with no timeout — stalled API hangs the cron invocation.
Expected Behavior: Bounded 30s timeout (cron cadence weekly; API handler itself 45s).
Root Cause: Missing `signal` on worker fetch.
Evidence: Source read; prior settlement auth fix left fetch unbounded.
Fix: `signal: AbortSignal.timeout(30000)`.
Regression Test: "M-02 settlement worker fetch is time-bounded".
Result: PASS.

ID: M-03
Severity: P1
Integration: Payment / Reconciliation
Provider: Razorpay (vs mock)
File: `apps/api/_lib/payment/reconciliation.ts:150-152`
Observed Behavior: `providerFor = env.PAYMENT_PROVIDER || 'mock'` — prod without explicit `PAYMENT_PROVIDER` diffs live payments against the mock in-memory map → phantom `GATEWAY_UNAVAILABLE`/`STALE_LOCAL`, and fix-up hits the wrong gateway.
Expected Behavior: Same canonical default as every other path: razorpay in production, mock elsewhere (`config.ts:41-46`).
Root Cause: Duplicated default logic drifted from `getPaymentProvider`.
Evidence: `config.ts:41-46` vs `reconciliation.ts:150-152` source diff.
Fix: `providerFor` delegates to `getPaymentProvider(env)`.
Regression Test: "M-03 reconciliation uses canonical provider default" + "provider default is razorpay in production".
Result: PASS.

ID: M-04
Severity: P0
Integration: Payment / Webhook + Reconciliation capture
Provider: Razorpay
File: `apps/api/_lib/payment/webhook-service.ts:168-172`, `apps/api/_lib/payment/reconciliation.ts:82-85` → `apps/api/_lib/payment/service.ts:252-263`
Observed Behavior: Webhook calls `verifyAndCapture({paymentId, gatewayPaymentId})` with `signature` omitted → `opts.signature ?? ''` → `gateway.verifyPayment({signature:''})` throws `INVALID_SIGNATURE` (mock HMAC and Razorpay `order|payment` HMAC both reject `''`). Webhook marks event `failed` and rethrows → provider retries forever; capture via webhook never completes; paid orders stuck `initiated`. Recon has the identical bug.
Expected Behavior: Webhook path (HMAC already verified) confirms via `fetchPayment` + amount match, then captures — never reuses the interactive checkout signature flow.
Root Cause: Wrong-layer reuse: server-to-server attestation forced through the browser-checkout signature contract.
Evidence: `service.ts:259,265` (`signature ?? ''`), `razorpay.ts:124-136` (HMAC reject), `mock.ts:92-105` (HMAC reject), `webhook-service.ts:168-172` (no signature passed), `reconciliation.ts:82-85` (same).
Fix: `VerifyAndCaptureOptions.webhookAttested?: boolean` (server-only flag, never client input); when true, `fetchPayment` + amount-equality check replaces `verifyPayment`; `ApiError` passthrough preserved; webhook + recon pass `webhookAttested: true` (webhook also forwards `event.amountPaise`).
Regression Test: "M-04 verifyAndCapture supports webhook-attested capture" + "webhook and recon pass webhookAttested".
Result: PASS.

Checked and cleared (no defect): Resend transport/timeout/fail-closed guard; Turnstile network fail-closed; B2 chain (prior audit, HEAD-404 probe); KV isolation (separate IDs — prior "shared KV" claim corrected); Hyperdrive binding names; `process.env` edge fallbacks (harmless); `COD_ENABLED` default divergence (contract risk, no evidence); shipping/tax/search/analytics/SMS/OAuth/R2/D1/Queues/DO absence (verified no runtime path — no fix possible or needed).

## Fixes Applied

| File | Change | Risk | Test |
|---|---|---|---|
| `packages/payment/src/gateway/razorpay.ts` | `signal: AbortSignal.timeout(15000)` in `request()` | Low — maps to existing transient path | payment 50 pass; api 126 pass |
| `workers/settlement/src/index.ts` | `signal: AbortSignal.timeout(30000)` | Low — cron only | static regression |
| `apps/api/_lib/payment/service.ts` | `+webhookAttested?` + fetchPayment/amount branch + ApiError rethrow | Low — interactive path untouched; flag server-only | api 126 pass |
| `apps/api/_lib/payment/webhook-service.ts` | pass `webhookAttested: true` + event amount | Low — previously always threw | api 126 pass |
| `apps/api/_lib/payment/reconciliation.ts` | `providerFor → getPaymentProvider`; fix-up passes `webhookAttested: true` | Low — aligns to canonical default | api 126 pass |

## Tests Added

`apps/api/_lib/payment/external-integrations-forensic.test.ts` (6): M-01 timeout present; M-02 timeout present; M-03 canonical provider + prod/mock defaults; M-04 `webhookAttested` + `fetchPayment` branch + both call sites pass attestation.

## Full Test Results

```text
API unit (pnpm --filter @nabome/api test:unit): 13 files, 126 tests — PASS (baseline 120 + 6 new)
Payment (pnpm --filter @nabome/payment test): 5 files, 50 tests — PASS (untouched baseline)
Typecheck (@nabome/api tsc --noEmit): PASS
Env validation (scripts/validate-env.mjs): PASS
Live probes: health 200, webhook-unsigned 401, resend 401 (auth-required), razorpay base 404 (host ok), turnstile 400 (params-required) — all CONNECTIVITY-OK
Prod writes/charges/sends/shipments: NOT RUN by design
No existing passing test regressed.
```

## Manual Provider Actions

1. Hyperdrive isolation (BLOCKER): dashboard → new staging Hyperdrive (new Neon DB/branch) → IDs into `wrangler.staging.jsonc` + `wrangler.jsonc env.preview.hyperdrive` → redeploy staging → verify staging write lands in staging DB.
2. Settlement secret rotation (BLOCKER): new secret → `wrangler secret put SETTLEMENT_CRON_SECRET` on worker + API (+staging) → verify new 200 / old 401. Old value in git history `2dffcff` — accept-and-rotate (purge optional).
3. Prod secrets (MANUAL): confirm `JWT_SECRET≥32, CSRF_SECRET≥16, RAZORPAY_*×3, RESEND_*×2, STORAGE_*×6, TURNSTILE_SECRET_KEY, WEBHOOK_SECRET`; confirm `TURNSTILE_BYPASS_SECRET` ABSENT in prod; staging Razorpay = TEST keys.
4. Webhook wiring (MANUAL): Razorpay dashboard URL → `https://<prod-api>/api/v1/webhooks/gateway/razorpay` + secret → send test event → confirm paid order reconciles end-to-end (exercises M-04).
5. Read-only live checks (MANUAL, with creds): Hyperdrive prod query, KV get, B2 HEAD/list, Resend test-send to operator inbox.
6. Staging bucket (MANUAL): separate B2 bucket + staging `STORAGE_*` (staging currently shares `nabome-media`).
7. Policy decisions (PRODUCT/AUTH, not code): Turnstile enforcement + frontend widget; JWT fail-closed at startup; `auth/test-token` + bypass removal/disabling in prod; email outbox vs fail-open; customer-refund vs return-request flow; order idempotency-key contract; error-monitoring (post-Sentry); shipping/tax/search/analytics provider selections.

## Remaining Risks

- Staging→prod DB contamination until (1); cron secret compromise until (2).
- Webhook dedupe race (concurrent redelivery 500s) — needs `upsert` + `payloadHash` compare; speculative without repro.
- `TURNSTILE_BYPASS_SECRET`/test-token + empty-JWT-secret + unset-secret webhook skip: exploitable only if dashboard misconfigured; code policy pending per §32 rules (no auth rewrite).
- Order-number sequence + inventory read→write races under burst (prior Prisma audit) — unchanged, no evidence.
- `origin_connection_limit:20` vs per-isolate `max:5` under burst — monitor before tuning.
- SVG uploads served from B2 origin (script executes in B2 origin, not app) — hardening candidate.

## Final Verification

Chain re-verified after fixes: NABOME → config (validate-env PASS) → env (matrix above) → runtime (Workers-native + timeouts bounded) → SDK/client (fetch/AwsClient + HMAC) → auth (webhook 401 live) → network (all provider hosts reachable) → provider resource (dashboard-gated) → response (negative tests map correctly) → processing (M-04 attested capture, idempotent) → Prisma (prior audit guards hold) → user result (paid order can now reach `captured/confirmed` via webhook).

```text
EXTERNAL INTEGRATION DEFECTS FOUND — FIXED AND VERIFIED
```
