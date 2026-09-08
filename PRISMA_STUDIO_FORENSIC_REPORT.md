# PRISMA STUDIO FORENSIC REPORT — Blank UI Diagnosis

Date: 2026-09-08 | Repo: `/Users/tanmoymondal/nabome` | Mode: read-only diagnosis, no migrations

## 1. Status

```text
FIXED
```

Studio launches and serves HTTP 200 with the schema loaded once it is started
from the correct project directory, with the pinned CLI, explicit schema path,
and `DATABASE_URL` exported. Root cause was launch context, not schema/DB/CLI.

## 2. Root Cause

Triple launch-context failure (categories A + B + F), proven by direct evidence:

- **A. Wrong schema path.** No `schema.prisma` exists at the repo root.
  The only canonical schema is `apps/api/prisma/schema.prisma`
  (`dist/prisma/schema.prisma` is a build copy). Studio started from the root
  has no schema to discover, so the UI has nothing to display.
- **B. Wrong Prisma CLI at root.** Root `package.json` declares no `prisma`
  dependency, so `npx prisma` from the root fetches `8.0.0-rc.13`, which
  registers **neither `studio` nor `validate`**
  (`No command registered for 'studio'`). The working CLI is the pinned
  `prisma 6.19.3` inside `apps/api` (bundles Studio `0.511.0`).
- **F. Env loading.** `apps/api` has no `.env`; Prisma CLI does not read the
  root `.env` or `apps/api/.dev.vars`. Without an exported `DATABASE_URL`,
  `prisma validate` fails with `P1012: Environment variable not found:
  DATABASE_URL`, and Studio cannot construct a client → blank model list.

Ruled out: C (schema holds 74 models), D (both databases are populated —
Neon 75 tables, local 70), E (both reachable), G (Studio serves HTTP 200
once launched correctly).

## 3. Prisma Project

- Prisma project directory: `apps/api`
- Schema path: `apps/api/prisma/schema.prisma`
- Prisma CLI version: `6.19.3` (repo-pinned; Studio `0.511.0`)
- Prisma Client version: `6.19.3` (`@prisma/client`, `@prisma/adapter-pg`)
- Counter-evidence: repo-root `npx prisma` resolves to `8.0.0-rc.13`
  (no `studio` command) because root has no `prisma` dependency.

## 4. Schema

- Datasource provider: `postgresql`, `url = env("DATABASE_URL")`
- Models: 74 (`grep -cE '^model '`); ~50 enums
- Validation: **PASS** — `The schema at prisma/schema.prisma is valid`
  (only when `DATABASE_URL` is exported; otherwise P1012 as documented above)
- No `prisma.config.*` file exists; no workspace misconfiguration found.

## 5. Database Connectivity

Read-only checks via `information_schema` (no secrets printed, nothing written):

```text
root .env  (Neon pooled) : reachable=YES tables=75 has_migrations_table=1
apps/api/.dev.vars (localhost:5432): reachable=YES tables=70 has_migrations_table=1
```

- Tables present: YES on both. Appears empty: NO.
- Environment: root `.env` URL → remote Neon (staging/production-class —
  treat as sensitive, do not mutate); `.dev.vars` URL → local development.
- For local Studio use the local development URL to keep staging/production
  isolated. `db pull` was deliberately NOT run (read-only SQL was sufficient).

## 6. Studio

Correct command (from `apps/api`, `DATABASE_URL` exported):

```bash
cd apps/api
export DATABASE_URL="$(grep '^DATABASE_URL=' /Users/tanmoymondal/nabome/.env | cut -d= -f2-)"
pnpm db:studio
# or: npx prisma studio --schema prisma/schema.prisma
```

- Startup result: `Prisma Studio is up on http://localhost:5563`, HTTP 200 on `/`
- Models discovered: YES (schema loads with no P1012; both databases verified
  populated, so the model browser has content)
- Failing variants captured: root `npx prisma studio` →
  `CLI.UNKNOWN_COMMAND ... No command registered for 'studio'`;
  `apps/api` without env → `P1012 Environment variable not found: DATABASE_URL`.

## 7. Changes Made

- `apps/api/package.json`: added `"db:studio": "prisma studio --schema prisma/schema.prisma"`
  (pins correct directory + schema + repo CLI; no secrets, no logic change).
- This report: `PRISMA_STUDIO_FORENSIC_REPORT.md` (new file).
- Pre-existing, untouched by this diagnosis: `FINAL_PRODUCTION_DEPLOYMENT_REPORT.md`
  (was already modified in the working tree before this session).

No schema, migration, handler, middleware, auth, or business-logic files changed.

## 8. Verification

```text
Prisma validation: PASS  (schema valid with DATABASE_URL exported)
Database inspection: PASS (Neon 75 tables, local 70 tables, both reachable)
Studio startup: PASS (up on :5561 and :5563 probes, HTTP 200)
Models visible: PASS (schema loads clean; populated DBs confirmed)
Typecheck: PASS (apps/api `tsc --noEmit`, exit 0)
Tests: NOT RUN (no logic changed; unit/integration suites untouched)
```

## 9. Safety

```text
No migration executed.
No db push executed.
No db reset executed.
No production data modified.
No production schema modified.
No secrets exposed.
No Hyperdrive introduced.
```

`db pull` was not executed; connectivity was proven with read-only SQL only.

## 10. Remaining Action

None required for Studio. For daily use, prefer the local database so
staging/production stay isolated:

```bash
cd /Users/tanmoymondal/nabome/apps/api
export DATABASE_URL="postgres://nabome:nabome@localhost:5432/nabome"
pnpm db:studio
```

(Uses the `DATABASE_URL` already present in `apps/api/.dev.vars`.)
If Studio ever shows blank again, re-check in order:
correct directory → pinned CLI (`6.19.3`) → explicit `--schema` →
`DATABASE_URL` exported → database reachable.
