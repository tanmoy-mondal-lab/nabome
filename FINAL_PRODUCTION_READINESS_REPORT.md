# FINAL PRODUCTION READINESS REPORT — NABOME

Date: 2026-09-08. Mode: FINAL VERIFICATION ONLY. No redesign, no provider replacement, no Hyperdrive introduction, no dependency upgrades, no destructive production operations. One minimal config/code remediation was required (§1); everything else verified as-is.

Verified baseline carried in: API 126/126, Payment 50/50, typecheck PASS, env validation PASS, health 200, webhook 401 enforced. This pass re-ran: API 127/127 (126 + 1 new staging-isolation regression), Payment 50/50, typecheck PASS, env validation PASS, build PASS, live probes PASS.

---

# Current Architecture

```text
Production Worker (nabome-api, Pages Functions)
      ↓  HYPERDRIVE binding (prod ID e2b5c6…) → connectionString
Prisma (singleton per isolate, PrismaPg + pg.Pool max:5)
      ↓
Production Database (Neon Postgres pooler)

Staging Worker (nabome-api-staging)
      ↓  NO Hyperdrive binding (removed this pass — was sharing prod ID)
Prisma (same code; direct pg path for postgres:// DATABASE_URL)
      ↓
Staging Database (via DATABASE_URL secret → staging Neon DB/branch; operator sets value)

Settlement Worker (nabome-settlement, cron 0 2 * * 1)
      ↓  HTTP POST /api/v1/internal/settlement/run (x-settlement-secret, 30s timeout)
API (no direct DB from worker; unused Hyperdrive binding removed this pass)
```

No Hyperdrive was created. No proxy introduced. Production database configuration untouched.

---

# Production Configuration

- `apps/api/wrangler.jsonc`: `nabome-api`, ENVIRONMENT=production, nodejs_compat, observability on, prod KV `6969b592…`, prod Hyperdrive `e2b5c6…` — UNCHANGED this pass.
- Secrets via `wrangler pages secret put` (encrypted, never in repo): DATABASE_URL, JWT_SECRET, CSRF_SECRET, RAZORPAY trio, RESEND pair, STORAGE set, TURNSTILE_SECRET_KEY, WEBHOOK_SECRET, SETTLEMENT_CRON_SECRET — presence is dashboard-gated (see Secret Verification).
- Frontends consume only `VITE_*` public vars — no leakage (prior bundle sweep clean).

# Staging Configuration

- `apps/api/wrangler.staging.jsonc`: staging KV `2db98525…` kept; **Hyperdrive block removed** (was identical prod ID `e2b5c6…` → staging wrote prod). Staging now resolves DB via `DATABASE_URL` secret.
- `apps/api/wrangler.jsonc` `env.preview.hyperdrive`: **removed** (same shared-ID cause).
- `workers/settlement/wrangler.toml`: **unused `[[hyperdrive]]` removed** (worker only performs HTTP fetch; binding never read). KV kept. `SETTLEMENT_CRON_SECRET` present only as comment (value via secret store).
- `workers/settlement/src/index.ts`: `HYPERDRIVE?: Hyperdrive` made optional (binding no longer declared).
- Manual action: set staging `DATABASE_URL` secret to the staging Neon DB/branch URL and redeploy staging; verify a staging write lands in the staging DB.

# Database Verification

- Path: Worker → `_middleware` (`HYPERDRIVE.connectionString ?? env.DATABASE_URL` → `initPrisma`) → singleton Prisma → Neon. Live proof this pass (safe read-only GETs, no writes):
  - `GET /api/v1/health` → 200
  - `GET /api/v1/categories` → 200 with real rows
  - `GET /api/v1/products` → 200 with real rows
- No Hyperdrive creation required for production; staging now requires none either (direct `DATABASE_URL` path).
- `apps/api/_lib/prisma.ts` one-line hardening: any `postgres://`/`postgresql://` URL now uses the `pg` path (previously only Hyperdrive-supplied or localhost URLs did; a direct remote URL would have fallen into the `PrismaNeonHTTP` branch and failed). Production behavior unchanged (Hyperdrive path taken first). No pool-size or lifecycle changes.
- Prior Prisma fixes hold (regression-covered): no `refreshTokenHash`, JSON envelope on DB-init failure, valid `PaymentMethod` enum + provider.

# Prisma Verification

- CLI = client 6.19.3, adapters `@prisma/adapter-pg` / `@prisma/adapter-neon` present; no version mismatch; no upgrade performed.
- Singleton per isolate, no per-request `$connect`/`$disconnect`, stale-pool reset (10s throttle) intact.
- `new PrismaClient` only in `prisma.ts` runtime (+ seeds/tests; `packages/returns` bare client not imported by API runtime — dead by design, untouched).
- Regression: `prisma-forensic.test.ts` 5/5 (4 prior + 1 new staging-isolation test).

# Storage Verification

- Chain unchanged: Worker → storage service → Backblaze B2 S3-compat (`aws4fetch`, SigV4) → bucket `nabome-media`. No R2 by design. Prior forensic fixes (S-01…S-04) intact and green (51 storage/media tests within the 127).
- Timeouts bounded: PUT 30s / DELETE 15s / HEAD 15s (verified in source this pass).
- Live object resolvability previously proven (HEAD random key → 404 = endpoint + bucket + auth OK, zero writes). No new prod writes performed this pass; no customer data touched.
- Manual: staging shares bucket `nabome-media` (isolated only by UUID key-space + separate DB); create a staging bucket + staging `STORAGE_*` when convenient.

# Payment Verification

- Provider: Razorpay, `https://api.razorpay.com/v1`, paise units correct, HMAC `order|payment` + `timingSafeEqualHex` correct, `X-Razorpay-Idempotency-Key` forwarded.
- Prior M-01/M-03/M-04 fixes intact: gateway 15s timeout present, canonical provider default, `webhookAttested` attested-capture path at both call sites (static regression tests green; payment suite 50/50).
- No real charge performed (no authorization). Sandbox/test mechanisms remain the path for any charge testing.
- Refund path (`/refunds`), capture currency handling, `@@unique(idempotencyKey)` persistence — code paths present and unit-covered; live capture/refund needs dashboard test keys (manual).

# Webhook Verification

- Live: unsigned `POST /api/v1/webhooks/gateway/razorpay` → `401 WEBHOOK_SIGNATURE_INVALID` with JSON envelope (re-verified this pass).
- Chain: raw `text()` → platform HMAC (optional) + mandatory gateway HMAC → `@@unique(provider,eventId)` → dispatch via `webhookAttested` fetchPayment + amount match → status update. M-04 break (guaranteed `INVALID_SIGNATURE` → retry storm) remains fixed.
- Manual: Razorpay dashboard webhook URL + secret wiring and a dashboard test event to confirm a paid order reaches `captured/confirmed` end-to-end.

# Authentication Verification

- Chain: login → JWT HS256 (`nabome-api` issuer) + DB session → authenticated request → middleware JWT verify + latest-active-session lookup → refresh → request again.
- Previously fixed `refreshTokenHash` defect holds (`refreshTokenHash` absent from middleware; `revokedAt:null` + `expiresAt` + `createdAt desc` lookup present; regression test green).
- No unexpected-logout defect found in this pass. Live login/refresh not executed against production (would create session rows); unit + static verification only.
- Policy items (unchanged, need decisions — not code defects introduced here): `TURNSTILE_BYPASS_SECRET`/`auth/test-token` must be absent in prod (dashboard); handler JWT `?? ''` fallback needs startup fail-closed decision; login `pending_verification` tolerance is intentional.

# Email Verification

- Chain: app → Resend `POST /emails` (Bearer, 10s timeout, throws on missing key / non-OK = fail-closed transport) → provider response. `AbortSignal.timeout(10000)` verified present.
- Callers intentionally fail-open at UX layer (register succeeds as `pending_verification` if email drops; no outbox table — architectural decision, unchanged).
- No production email sent this pass. Manual: confirm Resend domain verification + test-send to operator inbox.

# Turnstile Verification

- Chain: browser token → API → server siteverify (secret + response + remoteip, 10s, fail-closed on network — verified present) → provider → authorization.
- Gaps are policy, unchanged: `turnstileToken` optional on register/login, frontend widget not mounted (only password-reset requires token), `hostname/action` not asserted. Enforcing now would lock out clients until the widget ships.
- Manual: confirm `TURNSTILE_BYPASS_SECRET` ABSENT in production (dashboard); it must exist only in test environments.

# Other External Integrations

- KV: prod vs staging separate IDs — PRESENT/isolated. Rate-limit/session usage correct; fail-open if missing (by design).
- Settlement cron: weekly `0 2 * * 1`, `x-settlement-secret` auth (401 on mismatch), 30s fetch timeout present. Worker no longer declares Hyperdrive.
- Shipping/tax/search/analytics/SMS/OAuth/R2/D1/Queues/DO: no external providers by design (internal ledger, static rates, 18% GST split, Postgres LIKE search, internal aggregations). Dead payment adapters (Stripe/bKash/Nagad/PayPal/SSLCommerz) never resolved — untouched.
- Provider hosts reachable (this pass): `api.razorpay.com`, `api.resend.com`, `challenges.cloudflare.com` (per prior negative-test matrix; re-probed health + webhook live, remainder unchanged since).

# Secret Verification

No values printed. Presence = configured in Cloudflare secret store AND consumed by runtime (static wiring confirmed for each):

| Secret | Status | Consumed by |
|---|---|---|
| DATABASE_URL (prod) | PRESENT (live DB reads prove it) | `_middleware` → `initPrisma` |
| DATABASE_URL (staging) | MANUAL ACTION (set to staging DB URL) | same code path |
| JWT_SECRET | UNKNOWN (dashboard) — code reads `env.JWT_SECRET` | `_middleware:185`, auth handlers |
| CSRF_SECRET | UNKNOWN (dashboard) | CSRF enforcement |
| RAZORPAY_KEY_ID / KEY_SECRET / WEBHOOK_SECRET | UNKNOWN (dashboard; test keys locally) | gateway + webhook verify |
| RESEND_API_KEY / RESEND_FROM_EMAIL | UNKNOWN (dashboard) | email service (fail-closed) |
| STORAGE_* (6) | UNKNOWN (dashboard; present locally) | s3 provider (fail-closed) |
| TURNSTILE_SECRET_KEY | UNKNOWN (dashboard) | siteverify |
| TURNSTILE_BYPASS_SECRET | must be ABSENT in prod — MANUAL confirm | bypass gate |
| WEBHOOK_SECRET | UNKNOWN (dashboard) | platform HMAC |
| SETTLEMENT_CRON_SECRET | UNKNOWN runtime (see below) | worker + internal route |

# Settlement Secret Rotation

```text
Old secret: ROTATED / NOT ROTATED / UNKNOWN → UNKNOWN (cannot verify runtime from repo)
Production runtime: PRESENT / MISSING / UNKNOWN → UNKNOWN (dashboard-gated)
```

Facts: commit `2dffcff` contains plaintext `SETTLEMENT_CRON_SECRET=ca81…` (confirmed via `git show` this pass) — treat as compromised. Working tree is clean (value removed; only `wrangler secret put` comment remains). Whether the runtime value was rotated after removal is not observable from the repository.

Exact manual action (owner/operator, ~5 min):
1. Generate a new random secret (e.g. `openssl rand -hex 32`).
2. `wrangler secret put SETTLEMENT_CRON_SECRET` in the settlement Worker project AND in `nabome-api` production AND in `nabome-api-staging` (same value everywhere it is verified).
3. `curl -X POST <worker>/run -H "x-settlement-secret: <new>"` → expect 200; repeat with old value → expect 401.
4. Optional: purge `2dffcff` from history (`git filter-repo` + force-push) or accept-and-rotate.

# Timeout Verification

All previously fixed bounds verified present in source this pass:

```text
Razorpay gateway → 15 seconds (packages/payment/src/gateway/razorpay.ts:73)
Settlement worker → internal API → 30 seconds (workers/settlement/src/index.ts:44)
Storage PUT → 30s / DELETE → 15s / HEAD → 15s (apps/api/_lib/storage/s3.ts:66,89,112)
Email (Resend) → 10 seconds (apps/api/_lib/email/service.ts:43)
Turnstile siteverify → 10 seconds (apps/api/_lib/turnstile.ts:35)
API handler → 45s + single 500ms retry ([[path]].ts, unchanged)
```

No timeout changes made beyond the pre-existing fixes.

# End-to-End Smoke Tests (safe, read-only unless noted)

```text
Health → 200 PASS (live)
Categories list → 200 with rows PASS (live, proves DB chain)
Products list → 200 with rows PASS (live, proves DB chain)
Unsigned webhook → 401 PASS (live, proves auth enforcement)
Login → session → refresh → request again → STATIC PASS (code + unit; no live session created)
Payment create → provider mapping → persistence → STATIC PASS (unit; no live charge)
Checkout → order → order retrieval → STATIC PASS (unit; no live order created)
Admin product/media/order management → STATIC PASS (unit incl. S-01/S-02 handler tests)
Email send → NOT RUN (would send; transport fail-closed unit-verified)
B2 write/delete → NOT RUN (would touch bucket; HEAD-probe previously verified)
Live charge / refund / shipment → NOT RUN (no authorization)
```

# Regression Tests

```text
API: 127/127 PASS (13 files; baseline 126 + 1 new staging-isolation test)
Payment: 50/50 PASS (5 files; untouched baseline)
Storage: 51 tests within API suite PASS (18 storage + 22 extractKey + 4 consistency + 7 handlers)
Database: covered via prisma-forensic 5/5 + live read probes PASS
Authentication: covered via auth/session suites within API 127 PASS (no live session mutation)
Checkout: covered within API 127 PASS
Orders: covered within API 127 PASS
Webhooks: unsigned-401 live PASS + attested-capture unit PASS
Typecheck: PASS (@nabome/api tsc --noEmit; re-run after change)
Environment validation: PASS (scripts/validate-env.mjs; re-run after change)
Build: PASS (@nabome/api build; re-run after change)
Lint (changed files): 0 new issues (2 pre-existing `any` errors in settlement worker, 3 pre-existing warnings)
```

Baseline comparison: no previously-passing test regressed. Delta is +1 new passing test for the staging fix.

# Changes Made in This Pass (only real defect found)

1. `apps/api/wrangler.staging.jsonc` — removed `hyperdrive` block referencing production ID `e2b5c6…` (staging→prod contamination vector). Staging now uses `DATABASE_URL` secret.
2. `apps/api/wrangler.jsonc` — removed `env.preview.hyperdrive` with the same shared prod ID.
3. `workers/settlement/wrangler.toml` — removed unused `[[hyperdrive]]` (worker never reads the binding; HTTP-only).
4. `workers/settlement/src/index.ts` — `HYPERDRIVE?: Hyperdrive` optional (matches removed binding).
5. `apps/api/_lib/prisma.ts` — direct `postgres://`/`postgresql://` URLs use the `pg` driver path (enables staging direct-DB operation without any proxy; production path unchanged).
6. `apps/api/_lib/prisma-forensic.test.ts` — new regression test asserting no prod Hyperdrive ID remains in staging/preview/settlement configs.

Production Hyperdrive binding, production KV, database, Prisma lifecycle, storage, payment provider, and all runtime handlers otherwise untouched.

# Manual Actions

1. **Settlement secret rotation** (security — old value in git history): generate new → `wrangler secret put SETTLEMENT_CRON_SECRET` on worker + API prod + API staging → verify new-200 / old-401.
2. **Staging DATABASE_URL**: set staging secret to the staging Neon DB/branch URL → redeploy staging → verify a staging write lands in staging DB (proves isolation after Hyperdrive removal).
3. **Production secrets confirmation** (dashboard, names only): JWT_SECRET≥32, CSRF_SECRET≥16, RAZORPAY trio (live keys), RESEND pair + domain verification, STORAGE six, TURNSTILE_SECRET_KEY, WEBHOOK_SECRET; confirm TURNSTILE_BYPASS_SECRET absent in prod and staging Razorpay = TEST keys.
4. **Razorpay webhook wiring**: dashboard URL `https://<prod-api>/api/v1/webhooks/gateway/razorpay` + secret → send test event → confirm paid order reconciles (exercises M-04 end-to-end). If dashboard access is unavailable: MANUAL VERIFICATION REQUIRED.
5. **Optional hygiene**: staging B2 bucket + staging `STORAGE_*`; git-history purge of `2dffcff` (or accept-and-rotate); product decisions on Turnstile enforcement/widget, email outbox, error monitoring, shipping/tax providers.

# Remaining Risks

- Settlement secret compromise window until rotation (1) completes.
- Staging isolation unverified at runtime until (2) completes (config is correct; data-plane proof needs the secret + redeploy).
- Webhook dedupe race on concurrent redelivery (second delivery 500s instead of idempotent ack) — needs `upsert`/ON CONFLICT; speculative without repro, unchanged.
- `origin_connection_limit:20` vs per-isolate `max:5` under burst — monitor Hyperdrive/Neon metrics before any tuning.
- Order-number sequence + inventory read→write races under burst — no evidence in prod; unchanged without reproduction.
- Test-bypass surface (`TURNSTILE_BYPASS_SECRET`, `auth/test-token`, empty-JWT-secret fallback, unset-secret webhook skip) is exploitable only if dashboard misconfigured; code policy pending per no-auth-rewrite rule.
- SVG uploads served from B2 origin (hardening candidate, not a defect).

# Final Verdict

```text
PRODUCTION READY — MANUAL ACTIONS REMAIN
```

Production data plane verified live (health/categories/products 200, webhook 401 enforced, timeouts bounded, suites green). No P0/P1 code defect remains in the repository. The remaining items are operator/dashboard actions (settlement rotation, staging secret + redeploy, secret presence confirmation, webhook wiring) — not code blockers.
