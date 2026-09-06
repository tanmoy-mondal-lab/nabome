# PRODUCTION VERIFICATION REPORT

Date: 2026-09-06 (UTC). Hostname: `https://www.nabome.online`.
API: `https://nabome-api.pages.dev`. Commit: uncommitted (see `git status`).
Deployment: NOT DEPLOYED (no Cloudflare credentials in this environment).

## Live probes (2026-09-06)

- `GET /api/v1/products?limit=1` → 200.
- `OPTIONS /api/v1/auth/refresh` (Origin `https://www.nabome.online`) → 204 with
  `access-control-allow-origin: https://www.nabome.online` (exact, no wildcard),
  `access-control-allow-credentials: true`, methods GET/POST/PATCH/PUT/DELETE/OPTIONS.
- `GET https://www.nabome.online/` → 200.

## Auth verification

- CORS/credentials path is production-correct for cookie transport.
- Full LOGIN → 401 → REFRESH → RETRY → RELOAD → LOGOUT sequence against
  production NOT verified (needs real credentials + deployed backend containing
  the worktree auth fix). Prior report verified the loop locally (unit + live curl).
- New code in this change (shop/admin refresh, bootstrap) verified by unit tests
  + builds only.

## Mobile verification

- Code audit + unit tests only; no device lab. Viewport matrix listed in
  `MOBILE_NAV_FORENSIC_REPORT.md` §3 requires on-device confirmation.

## Remaining risks

1. Worktree auth fix (incl. this change) is undeployed → production still runs
   the old logout-prone behavior until deployed.
2. `_middleware` `refreshTokenHash` dead lookup → latest-session fallback
   (multi-session logout precision, pre-existing).
3. Aggressive rotation + two tabs racing refresh can fail one tab closed
   (fail-safe re-login; reuse-detection window is future work).
4. `packages/returns` bare `PrismaClient` workerd hazard (different domain).

## Final status: PARTIAL — code complete, tested, uncommitted, undeployed.
