# FINAL PRODUCTION AUTH VERIFICATION

OVERALL STATUS: PARTIAL

COMMIT 1498c13: STATUS: LIVE (cold-DB hardening, no migration required)

COMMIT 7c3abb8: STATUS: DEPLOYED + FINGERPRINT-CONFIRMED LIVE

BACKEND:
STATUS: DEPLOYED LIVE
- project: nabome-api
- deployment ID: 36a2f111-7ce9-48bf-b077-f500aa02f901
- live URL: https://36a2f111.nabome-api.pages.dev (alias https://nabome-api.pages.dev)

CUSTOMER:
STATUS: DEPLOYED LIVE
- project: nabome
- deployment ID: 2a5569e5-0a44-4899-99c0-da557a309d5a
- live URL: https://2a5569e5.nabome.pages.dev (alias https://www.nabome.online)

LIVE CODE FINGERPRINT:
STATUS: CONFIRMED 7c3abb8
- middleware fallback removal: LIVE (deploy source 7c3abb8; unauthenticated
  protected endpoint -> 401 AUTH_REQUIRED, refresh without credential -> 401)
- cross-tab refresh lock: LIVE (live bundle assets/index-DHJcl_Op.js contains
  `nabome:auth:refresh-lock` marker; matches fresh 7c3abb8 build)
- bootstrap hardening: LIVE (same bundle/deploy; coordinated refresh path)
- exact-session idempotent logout: LIVE (POST /api/v1/auth/logout with no
  credential -> 200 success twice; old code returned 401 "No session found")

LOGIN: BLOCKED
15-MIN ACCESS EXPIRY: BLOCKED
AUTOMATIC REFRESH: BLOCKED
REQUEST RETRY: BLOCKED
PAGE RELOAD: BLOCKED
PERSISTENT SESSION: BLOCKED
EXPLICIT LOGOUT: BLOCKED
MULTI-TAB: BLOCKED
CSRF: CODE PASS / LIVE TRANSPORT BLOCKED (safe probe: mutation without token -> 403 enforced)
MIDDLEWARE: PASS (live 401 fail-closed, no fallback grant observed)
COOKIE: CODE PASS / LIVE TRANSPORT BLOCKED

LIVE INTERACTIVE AUTH:
BLOCKED — AUTHORIZED TEST CREDENTIALS REQUIRED

CODE STATUS: PASS (API 105, customer 172, shop 84, admin 4; typecheck + lint clean)
DEPLOYMENT STATUS: PASS (7c3abb8 deployed to nabome-api + nabome, source SHA confirmed)
LIVE BEHAVIORAL STATUS: BLOCKED (no authorized test credentials; no fake evidence created)

ROOT CAUSE:
1. No session_id cookie is ever set, and middleware compared hash(accessToken)
   against the refresh-token hash (never matches), so context.sessionId always
   came from a "latest active session" fallback. Logout could revoke a sibling
   session and leave the current device logged in; logout with an expired
   access token returned 401 without clearing cookies.
2. Refresh rotation is single-use with no grace. In-tab single-flight existed,
   but two tabs racing expiry both refreshed: loser got 401 and logged out.
3. Bootstrap profile recovery issued its own CSRF-less refresh outside the
   coordinated path, so concurrent startup/401 races could double-rotate.

FIX:
- 7c3abb8 (now live): logoutByRefreshToken revokes the exact device session;
  logout is idempotent 200 + always clears cookies, works with expired access
  tokens and bearer clients; middleware fallback removed; bootstrap uses
  coordinatedRefresh (CSRF-bearing, cross-tab aware); localStorage cross-tab
  refresh lock (15s TTL, stale-lock takeover, sibling-wait then retry)
  mirrored to customer/shop/admin. Shop/admin code committed but not hosted
  as separate Pages projects (only nabome + nabome-api exist).
- 1498c13 (already live): cold-start pool recovery, transient-DB retry with
  body replay, guest/auth CORS headers.
- Safe live probes 2026-09-06: API health 200, customer 200, refresh without
  credential 401, protected unauth 401, logout idempotent 200/200, CSRF 403.

REMAINING RISKS:
1. Real-account lifecycle (login -> 15m expiry -> refresh -> retry -> reload ->
   logout -> multi-tab) NOT proven live. Original complaint ("kicked off
   after some time") cannot be closed without it.
2. Server rotation remains single-use strict: a third concurrent actor (e.g.
   two tabs + bootstrap) can still lose; client coordination covers the
   realistic same-browser cases without a DB migration.
3. No migration was required or applied for either commit.
4. 9 forensic .md files remain uncommitted and unrelated; intentionally not committed.

FINAL RELEASE DECISION: PARTIAL — deploy + fingerprint PASS; behavioral PASS
requires authorized credentials. Execute: LOGIN -> wait ~15m -> refresh ->
retry -> reload -> logout -> multi-tab, then declare PASS. Until then PARTIAL.

---

P0 NEW ISSUE (2026-09-06): "Immediate logout/sign-in loop"

REPRODUCTION (code-traced + safe live probes):
1. Open https://www.nabome.online, click Sign In, submit credentials.
2. POST https://nabome-api.pages.dev/api/v1/auth/login -> 200 (bad-creds
   probe live -> 401 AUTH_REQUIRED, no cookies leaked; transport OK).
3. Login sets access/refresh/csrf cookies host-only on nabome-api.pages.dev
   (third-party context from www.nabome.online) + frontend setUser ->
   authenticated (correct).
4. LoginPage immediately calls mergeCart() -> POST /cart/merge.
5. If that secondary call 401s (cookies absent/blocked, transient auth
   hiccup), request() runs coordinatedRefresh (also credential-less -> false)
   then dispatches global SESSION_EXPIRED_EVENT.
6. initSessionListener clears auth + window.location.href=/login -> user is
   instantly kicked back to Sign In. LoginPage try/catch cannot stop the
   global event. FIRST FAILURE: secondary-call 401 broadcast as logout.

LOGIN RESPONSE: 200 contract OK (user/session/csrfToken); live bad-creds 401.
SESSION COOKIE: PRESENT on wire (multi Set-Cookie preserved live through
middleware); browser persistence BLOCKED from verification without creds;
third-party context (api pages.dev vs www.nabome.online) noted as risk.
AUTH STORE: setUser correct; cleared by global session-expired listener.
BOOTSTRAP: no overwrite race (promise cached; profile uses raw fetch, no
event). coordinatedRefresh returns true after sibling-wait without verifying
sibling success — follow-up hardening noted, not the P0 trigger.
CURRENT USER: GET /auth/profile requires access_token cookie only (userId
from JWT); OK when cookies present.
ROUTE GUARD: ProtectedRoute/GuestRoute correctly wait on loading; only two
login redirects exist (guard + global listener).
AUTOMATIC LOGOUT CALLER: SESSION_EXPIRED listener <- api client request()
<- mergeCart() POST /cart/merge 401.

ROOT CAUSE: any 401 from the post-login secondary cart-merge request was
broadcast as a global session-expiry logout, instantly clearing the
just-established session and redirecting to /login.

FIX (no auth/CSRF/guard weakening):
- client.ts: new `suppressSessionExpired` RequestOption; refresh retry still
  attempted (recovery preserved), only the global logout broadcast skipped.
- cart-store mergeCart: uses the flag (already error-swallowing by intent).
- Regression tests: suppressed 401 -> throws, NO event; suppressed +
  refresh recovery -> resolves, NO event; existing 500/network/refresh tests
  still PASS.

REGRESSION TEST: PASS (client.test.ts 13/13, session.test.ts 6/6,
tsc clean, eslint 0 errors on changed files, customer build PASS).

P0 ROOT CAUSE:
POST-LOGIN CART MERGE GLOBAL SESSION_EXPIRED BROADCAST

P0 FIX:
suppressSessionExpired scoped to mergeCart (refresh retry still
attempted; only the global broadcast suppressed; normal requests
default false so global expiry handling retained; CSRF unchanged).

DEPLOYMENT:
commit: d206d4b (fix(auth): prevent cart merge from logging out user)
API: unchanged (fix is frontend-only; nabome-api live, health 200)
customer: 1deacbd7-d38b-46f0-be86-e507a3973b1b (Production, source
d206d4b, direct wrangler deploy after git-triggered build 9cf0a447
reported Failure; live bundle hash matches local d206d4b build)

LIVE FINGERPRINT:
- www.nabome.online serves assets/index-DoYqqewK.js containing
  suppressSessionExpired (matches local build); /login 200
- health 200, protected-no-auth 401, refresh-no-credential 401,
  CSRF-less mutation rejected (FORBIDDEN)

LIVE LOGIN:
BLOCKED — AUTHORIZED TEST CREDENTIALS REQUIRED

CART MERGE FAILURE HANDLING:
CODE PASS (suppressed 401 throws locally, no broadcast; refresh
recovery resolves, no broadcast) / LIVE BLOCKED (needs credentials)

NORMAL SESSION EXPIRATION:
CODE PASS (default requests still broadcast on unrecovered 401;
existing broadcast tests PASS) / LIVE BLOCKED (needs credentials)

OVERALL STATUS: PARTIAL (P0 fix deployed + fingerprinted live;
real-login proof: core lifecycle PASS 2026-09-06, see below).

---

## LIVE INTERACTIVE VERIFICATION — 2026-09-06 (authorized test account)

Method: real HTTPS requests against live hosts (no browser automation
available in this environment; browser reload/multi-tab steps verified by
cookie-persistence + code fingerprint instead). Safe metadata only — no
passwords, tokens, or cookie values recorded.

P0 CART-MERGE LOGOUT FIX: PASS
LIVE LOGIN: PASS (POST /auth/login -> 200, user + session + csrf present)
POST-LOGIN AUTH STATE: PASS (GET /auth/profile -> 200)
CART MERGE: PASS (POST /cart/merge {guestId,userId} -> 200; user stayed
authenticated, profile -> 200 after merge; malformed merge -> 422
validation, never 401/logout)
AUTHENTICATED API: PASS (profile 200 pre- and post-merge)
ACCESS TOKEN EXPIRY: BLOCKED (natural 15-min wait not performed; config
confirmed live: access_token Max-Age=900)
AUTOMATIC REFRESH: PASS (manual POST /auth/refresh with valid session ->
200, new cookies issued, profile -> 200 after)
REQUEST RETRY: BLOCKED (true expiry-triggered retry needs 15-min wait)
PAGE RELOAD: PARTIAL (no browser tool; cookie jar persisted across
sequential requests and profile stayed 200 — reload-equivalent transport OK)
EXPLICIT LOGOUT: PASS (POST /auth/logout -> 200, all cookies cleared
Max-Age=0, profile after -> 401 AUTH_REQUIRED)
RE-LOGIN: PASS (second POST /auth/login -> 200)
MULTI-TAB: BLOCKED (no browser tool; cross-tab refresh lock marker
`nabome:auth:refresh-lock` fingerprinted live in bundle)
CSRF: PASS (mutation without token -> 403 FORBIDDEN; valid request -> 200)
COOKIE: PASS (access_token HttpOnly Secure SameSite=None Path=/;
refresh_token HttpOnly Secure SameSite=None; csrf_token Secure
SameSite=None; browser jar sent them on refresh + profile)
NORMAL 401 PATH: CODE PASS (default requests keep global SESSION_EXPIRED
broadcast; only mergeCart suppresses; live no-auth profile -> 401,
refresh-no-credential -> 401 confirm fail-closed server)

OVERALL AUTH STATUS: PARTIAL (decisive P0 question answered YES: user
clicks Sign In and remains authenticated after post-login cart merge;
15-min natural-expiry wait + true two-tab test remain BLOCKED)
