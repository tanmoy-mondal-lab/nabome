# AUTH SESSION REGRESSION TEST REPORT

Date: 2026-09-06 (UTC). Suites: `customer 169`, `api 101`, `shop 84`, `admin 4` — all PASS.

| # | Test | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | Login 200 sets cookies + csrfToken | session persists | verified in prior report (live curl) | PASS |
| 2 | API 401 → single refresh → retry succeeds | 1 refresh for N concurrent 401s | `client.test.ts` single-flight | PASS |
| 3 | Refresh failure → clear + redirect | event only after failed refresh | `client.test.ts` | PASS |
| 4 | 500 / network error | no logout, no event | `client.test.ts` | PASS |
| 5 | Reload preserves auth | persisted flags | auth-store partialize + routes tests | PASS |
| 6 | Fresh profile + valid cookie → bootstrap restores user | authenticated, no redirect | new `bootstrapSession` test | PASS |
| 7 | Fresh profile, no session, public page | guest, stays on page, no redirect | new bootstrap test | PASS |
| 8 | Expired access + valid refresh at startup | refresh → profile → authenticated | new bootstrap test | PASS |
| 9 | Guest visits protected route | redirect `/login?from=…`, never NotFound | `routes.test.tsx` (11 paths) | PASS |
| 10 | Explicit logout | server revokes, cookies cleared | `clearAuthCookies` + handler tests | PASS |
| 11 | Revoked/expired refresh | 401, app redirects to login | `refresh-handler.test.ts` (7) | PASS |
| 12 | Cookie attributes | HttpOnly/Secure/SameSite=None/Path/Max-Age | `cookies.test.ts` (6) | PASS |
| 13 | No infinite refresh loop | refresh uses raw fetch + `skipRefresh` path | code + single-flight | PASS |
| 14 | Multi-tab rotation race | one refresh per 401 burst | single-flight unit test | PASS (unit-level) |

Mobile: `Header.test.tsx` (5) PASS; build PASS customer/shop/admin/api;
typecheck PASS all four; eslint 0 errors. Viewport matrix code-audited only.
