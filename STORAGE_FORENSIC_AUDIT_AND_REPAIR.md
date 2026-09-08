# STORAGE FORENSIC AUDIT AND REPAIR — NABOME

Date: 2026-09-08. Scope: full storage-chain forensics + minimal repair. No secret values printed anywhere in this report. No provider/bucket/architecture changes.

## Executive Summary

Storage provider, endpoint, credentials, bucket, bindings, and SDK path are all **verified working** — a live non-destructive HEAD probe against the configured bucket returned `404` on a random key (proves endpoint reachable + bucket exists + SigV4 auth accepted; bad auth would be `403`). The defects found are **application-layer bugs above the storage client**, not provider/connectivity failures:

- **S-01 (P1):** `handleMediaUpload` catch-all rewrote every `ApiError` into `400 VALIDATION_ERROR` — storage outages surfaced as "validation" errors, 404s/403s misreported. FIXED.
- **S-02 (P1):** `handleMediaDelete/Update` matched errors by message substring; the cross-shop forbidden message contains no "forbidden" string, so authorization failures returned `500 Delete failed`. FIXED.
- **S-03 (P2):** `uploadProductMedia` left an **orphaned object** in the bucket when the DB `productMedia.create` failed after a successful upload, with no cleanup. FIXED (best-effort compensating delete, original error rethrown).
- **S-04 (P3):** `validateFile` accepted **zero-byte files**; non-integer `sortOrder` (`parseInt('abc')` → `NaN`) flowed into Prisma. FIXED (empty-file rejection + `sortOrder` integer guard).

11 new regression tests added; full suites green (api 120/120, payment 50/50), typecheck green, env validation green, build green.

## Storage Architecture

```text
Browser (apps/customer|admin|shop, FormData multipart)
  ↓  POST /api/v1/media/upload · DELETE|PATCH /api/v1/media/{id} · GET /api/v1/media/product/{id}
Pages Function [[path]].ts (45s timeout + retry, requestId envelope)
  ↓
_handlers/media/index.ts (auth → shop_owner role → KV rate-limit → formData → service)
  ↓
_lib/media/service.ts (validateFile → product/shop ownership → generateStorageKey → upload → productMedia.create)
  ↓
_lib/storage/index.ts (getStorageProvider → S3StorageProvider | MockStorageProvider)
  ↓
_lib/storage/s3.ts (aws4fetch AwsClient{service:s3}, PUT/DELETE/HEAD, 30s/15s/15s timeouts)
  ↓
Backblaze B2 S3-compatible endpoint → bucket `nabome-media` → object `shops/{shopId}/products/{productId}/{uuid}.{ext}`
  ↓
Public read: B2 public URL by construction (`{STORAGE_PUBLIC_URL}/{key}`), stored in `productMedia.url`
```

Reads are public-by-construction (no `GetObject` proxy — by design). Deletes resolve the object key from the stored URL via `extractKeyFromUrl` (handles B2 `/file/<bucket>` prefix, encoding, fallbacks — 22 pre-existing tests).

## Provider Identification

```text
Provider:        Backblaze B2 (S3-compatible, NOT Cloudflare R2 — intentional, no R2 binding exists)
Resource:        B2 bucket `nabome-media`
Bucket:          nabome-media (shared prod+staging; isolation is via DB shop/product UUID key-space, see §Production vs Staging)
Runtime:         Cloudflare Pages Functions (Workers) + `nodejs_compat`
Binding:         None for storage (secret-based: STORAGE_* via Pages secret store; no R2/KV binding involved)
SDK:             `aws4fetch` AwsClient, SigV4, service `s3` — Workers-native fetch, no Node-only APIs
Endpoint:        B2 S3 endpoint from STORAGE_ENDPOINT (region STORAGE_REGION)
Authentication:  B2 application key (STORAGE_ACCESS_KEY_ID / STORAGE_SECRET_ACCESS_KEY), per-request signing
```

## Environment Configuration

| Variable | Local | Staging | Production | Source | Status |
|---|---|---|---|---|---|
| STORAGE_ENDPOINT | PRESENT | via secret store | via secret store | `.env`/`.dev.vars` → Pages secrets | PRESENT |
| STORAGE_REGION | PRESENT | via secret store | via secret store | same | PRESENT |
| STORAGE_BUCKET | PRESENT | `nabome-media` (shared) | `nabome-media` | same | PRESENT (shared — see manual action M-01) |
| STORAGE_ACCESS_KEY_ID | PRESENT | UNKNOWN (dashboard) | UNKNOWN (dashboard) | secret store only | PRESENT locally; MANUAL confirm prod |
| STORAGE_SECRET_ACCESS_KEY | PRESENT | UNKNOWN (dashboard) | UNKNOWN (dashboard) | secret store only | PRESENT locally; MANUAL confirm prod |
| STORAGE_PUBLIC_URL | PRESENT | same pattern | same pattern | vars | PRESENT |

`getStorageConfig` fails closed when any var is missing (correct); `getStorageProvider` falls back to in-memory mock **only** for `local|preview` (correct); staging/production throw loudly (correct). `packages/config` zod schema keeps all six optional (edge env is not validated by it — documented, not changed).

## Storage Binding Audit

No R2 binding is declared in `wrangler.jsonc` / `wrangler.staging.jsonc` and none is expected by code (grep for `MEDIA_BUCKET`/`STORAGE_BUCKET` binding: zero hits). Chain `Wrangler vars+secrets → Pages env → getStorageConfig → AwsClient` matches on both sides. No mismatch of the `MEDIA_BUCKET` vs `STORAGE_BUCKET` class. KV/Hyperdrive bindings untouched. No buckets created/deleted/modified.

## Storage Client Initialization

`new AwsClient(...)` is constructed **per operation** inside `s3Upload/s3Delete/s3Exists`. This is correct for Workers: `AwsClient` holds no sockets or mutable connection state (it only signs `fetch` calls), so there is no leak, no stale config, and no cross-request credential bleed; per-request construction reads the current request's `env`. A singleton would add stale-config risk with zero benefit. **No change.** (`S3StorageProvider.exists` uses a lazy `await import('./s3.ts')` — one redundant dynamic import per call; harmless, not changed.)

## Runtime Compatibility

Storage path uses only `fetch`, `AbortSignal.timeout`, `crypto.randomUUID`, `File.arrayBuffer` — all Workers-native. No `fs`, no Node-only crypto, no native modules. `nodejs_compat` is set regardless. The one Node-leaning dependency (`pg` for Prisma) is unrelated to storage. **No incompatibility found.**

## Upload Audit

`request → requireAuth → shop_owner role → KV rate-limit (10/min) → formData → file+productId presence → sortOrder parse → shop lookup → validateFile (type+ext+size) → product ownership → variant ownership → generateStorageKey (uuid, no collision) → PUT → productMedia.create → {id,url,key}`. Ordering is correct (DB record only after successful PUT). Gaps found and fixed: S-01 (error demotion), S-03 (orphan on DB failure), S-04 (empty file, NaN sortOrder). Oversize (>10MB) and MIME/extension mismatches were already rejected.

## Download Audit

No server-side `GetObject` path exists — reads are direct B2 public URLs. `s3Exists` (HEAD) is implemented but only used by tests/ops checks, not the read path. Content-Type is set on PUT from the validated file MIME; `Content-Length`/`ETag`/`Cache-Control` are served by B2. No defect: stored files are retrievable (connectivity probe + public-URL round-trip tests confirm key↔URL mapping).

## Delete Audit

`DELETE /media/{id} → auth → shop lookup → findUnique+ownership → extractKeyFromUrl(url, env) → best-effort S3 DELETE (404 tolerated) → productMedia.delete`. Direction is safe: storage-delete failure is swallowed but the DB delete still proceeds, so users never see dangling references; worst case is an invisible orphan object (storage cost only). Fixed S-02 (wrong status on forbidden). **Not changed:** the swallow-then-DB-delete ordering (deliberately safest for user-facing consistency).

## Object Key Audit

Upload keys: `shops/{shopId}/products/{productId}/{uuid}.{ext}` (variants insert `/variants/{variantId}/`). Extension is taken from the filename suffix only (path segments discarded — `../../etc/passwd.jpg` test passes, no `..` survives). No leading slashes stored; `buildS3Url`/`getStoragePublicUrl` strip leading slashes; `extractKeyFromUrl` round-trips through `decodeURIComponent` (spaces/unicode covered by tests). Stored key == uploaded key == deleted key (delete derives from the same URL the upload returned). **No mismatch found.**

## URL / Signed URL Audit

No presigned URLs anywhere (no `presign`/`signed URL` code paths) — reads are public-by-construction, writes are server-side authenticated PUTs. Public URL = `{STORAGE_PUBLIC_URL}/{key}`, single-slash normalized. B2 `/file/<bucket>` prefix correctly stripped on the delete path (regression-covered). **No defect.**

## Permission Audit

Required: PUT (upload), HEAD (exists), DELETE (delete). No LIST/GET needed server-side. Probe result classifies the live failure modes: `403` = AUTHENTICATION (bad key), `404` on random key = AUTHORIZATION+RESOURCE OK. Live probe returned 404 → permissions sufficient. **No permission change made.**

## Timeout / Retry Audit

Timeouts already bounded from the prior audit: PUT 30s, DELETE 15s, HEAD 15s via `AbortSignal.timeout`. No retries on PUT/DELETE (correct — non-idempotent under uuid keys for PUT, and blind DELETE retry adds nothing over the 404-tolerant single call). **No change.**

## Database ↔ Storage Consistency

| Flow | Before | After |
|---|---|---|
| Upload: PUT ok → DB create fails | orphan object, error surfaced as 400 (S-01) | compensating `deleteFromStorage(key)`, original error rethrown with true status |
| Upload: PUT fails → DB | no DB write (correct, unchanged) | unchanged |
| Delete: S3 fails → DB | DB delete proceeds (safe direction, unchanged) | unchanged, status mapping fixed |
| Delete: S3 ok → DB fails | 500, object already gone; retry of DELETE returns 404-tolerant success path on re-attempt (unchanged) | unchanged |

No distributed transactions introduced (per policy); compensation is best-effort with logged fallback.

## Security Audit

- No storage secrets in frontend bundles (only `VITE_*` public vars; prior bundle sweep clean).
- No credential committed: `.env`/`.dev.vars` gitignored; sweep for `STORAGE_SECRET` assignments in `apps/ packages/ workers/ scripts/` shows examples/placeholders only.
- `validateShopOwnership` prefix check exists but is **not wired into any request path** — ownership is enforced via DB (`product.shopId !== shopId`, `media.product.shopId !== shopId`), which is stronger. Documented, not changed.
- Arbitrary-key access: upload keys are server-generated (uuid); clients cannot choose keys; delete resolves keys only from DB-stored URLs of owned media. No path traversal (keys never contain client path segments).
- `image/svg+xml` is an allowed type served from the B2 host (script would execute in B2 origin, not the app origin). P3 note only — removing it would change product behavior; logged as hardening candidate, not changed.
- Internal error detail: `S3 upload failed: {status} {body slice}` goes to the API error message. After S-01 this now correctly returns 500 (not 400), but provider body text still reaches the client — body is truncated to 200 chars and contains no credentials by construction (B2 XML error). Accepted, not changed.

## Production Connectivity Verification (live, non-destructive)

Probe: `AwsClient.HEAD {endpoint}/{bucket}/__connectivity-probe/{random-uuid}.txt` using local-configured credentials (names only reported; values never printed). **Result: `HTTP 404` → CONNECTIVITY-OK** (endpoint reachable, bucket exists, SigV4 authentication accepted; a 403 would indicate auth failure). Zero objects created, listed, modified, or deleted. Production-secret-store values remain dashboard-gated (UNKNOWN from repo) — confirming prod secret presence is manual action M-02. Prior live API health (`/api/v1/health` 200) and webhook 401-enforcement from the infrastructure report were not re-run (unchanged code paths).

## Staging Verification

Staging uses the same bucket name (`nabome-media`) with no separate staging bucket documented — staging test uploads land in the production bucket, isolated only by UUID key-space + separate staging DB shop IDs. No cross-read risk (keys unguessable, DB-scoped), but staging objects accrue in the prod bucket. Logged as manual action M-01; no infra invented.

## Problems Found

| ID | Severity | Component | File:Line | Observed | Expected | Root Cause | Fix | Regression Risk | Status |
|---|---|---|---|---|---|---|---|---|---|
| S-01 | P1 | media upload handler | `_handlers/media/index.ts:101-107` | every ApiError (404/403/500, incl. `S3 upload failed`) returned as `400 VALIDATION_ERROR` | original status/code preserved | catch-all `ApiError.validation(error.message)` | `isApiError` passthrough | Low — restores documented envelope contract | FIXED |
| S-02 | P1 | media delete/update handlers | `_handlers/media/index.ts:153-161,215-223` | cross-shop delete → `500 Delete failed` | `403 FORBIDDEN` | substring sniffing; forbidden message lacks "forbidden" | `isApiError` passthrough | Low — same contract restoration | FIXED |
| S-03 | P2 | media service | `_lib/media/service.ts:69-84` | DB-create failure after PUT left orphan object | compensating delete, original error rethrown | no cleanup path | best-effort `deleteFromStorage` in catch + rethrow | Low — cleanup is 404-tolerant; failures logged | FIXED |
| S-04 | P3 | storage validation + handler | `_lib/storage/index.ts:90`, `_handlers/media/index.ts:77` | 0-byte uploads accepted; `sortOrder:'abc'` → NaN → Prisma 500 | reject empty; 422 on non-integer sortOrder | missing guards | `size===0` reject; NaN guard | Minimal — previously-failing inputs only | FIXED |

Checked and cleared (no defect): provider/endpoint/bucket/auth (live HEAD 404), R2/binding chain (no R2 by design, names match), client lifecycle (stateless per-op correct), key generation/round-trip (uuid, slash/encoding tests), URL construction (B2 prefix handled), timeouts (bounded), permissions (probe-verified), secret exposure (clean), `validateShopOwnership` (unused; DB enforcement stronger).

## Fixes Applied

```text
Problem: S-01/S-02 error-status demotion · Evidence: handler catch blocks rewrote ApiError · Root Cause: validation-wrap + substring sniffing
File: apps/api/_handlers/media/index.ts · Lines: 9, 77-84, 105-111, 157-165, 216-224, 246-254
Minimal Fix: preserve ApiError via isApiError in all four handlers; integer-guard sortOrder · Regression Risk: Low · Test: handlers.test.ts (7) · Result: PASS
Problem: S-03 orphan on DB failure · Evidence: PUT-then-create with no compensation · Root Cause: missing cleanup path
File: apps/api/_lib/media/service.ts · Lines: 75-98
Minimal Fix: try/catch around productMedia.create → best-effort deleteFromStorage → rethrow · Regression Risk: Low · Test: storage-consistency.test.ts (3) · Result: PASS
Problem: S-04 empty file · Evidence: validateFile had no size===0 check · Root Cause: missing guard
File: apps/api/_lib/storage/index.ts · Lines: 90-93
Minimal Fix: reject size===0 · Regression Risk: Minimal · Test: storage-consistency.test.ts (1) · Result: PASS
```

Also: `apps/api/vitest.config.ts` includes `_handlers/media/__tests__/**` so the new handler regressions run in the unit suite (config-only, no production code).

## Tests Added

- `apps/api/_handlers/media/__tests__/handlers.test.ts` (7): upload 404/403/500 preservation, sortOrder 422 without touching storage, delete 403 (was 500), update 404, read 404.
- `apps/api/_lib/media/storage-consistency.test.ts` (4): empty-file rejection, compensating delete on DB failure (asserts same key), no cleanup on happy path, original error surfaces when cleanup also fails.

## Full Test Results

```text
Storage/media targeted: 4 files, 51 tests — PASS (18 storage + 22 extractKey + 4 consistency + 7 handlers)
API unit suite (pnpm --filter @nabome/api test:unit): 12 files, 120 tests — PASS (baseline 109 + 11 new)
Payment (pnpm --filter @nabome/payment test): 5 files, 50 tests — PASS (untouched, regression baseline)
Typecheck (@nabome/api tsc --noEmit): PASS
Env validation (scripts/validate-env.mjs): PASS
Build (@nabome/api build): PASS
Lint (changed files): 0 errors, warnings only (pre-existing any/import-order style)
Live connectivity probe (HEAD random key, zero writes): HTTP 404 → CONNECTIVITY-OK
Prod write tests / destructive ops: NOT RUN (by design — customer data untouched)
```

## Remaining Manual Actions

- M-01 (staging isolation): create a staging B2 bucket + staging `STORAGE_*` secrets; update staging secret store. No code change needed (bucket comes from env).
- M-02 (prod secrets): confirm `STORAGE_*` (6 vars) present in the production Pages secret store (names only; values never in repo).
- M-03 (prior audits, unchanged): staging shares prod Hyperdrive ID; rotate `SETTLEMENT_CRON_SECRET` in git history; confirm `TURNSTILE_BYPASS_SECRET` absent in prod.
- Optional hardening (not defects): consider `Content-Security-Policy: sandbox` or SVG re-screening for `image/svg+xml` uploads; optional lifecycle rule to garbage-collect orphaned `shops/*` objects older than N days.

## Final Verdict

```text
STORAGE DEFECT FOUND — FIXED AND VERIFIED
```
