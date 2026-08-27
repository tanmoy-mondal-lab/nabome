/**
 * Bootstrap script — one-command developer environment setup.
 *
 *   pnpm bootstrap                    # first-time bootstrap
 *   pnpm bootstrap -- --force         # re-install deps from scratch
 *   pnpm bootstrap -- --skip-db       # skip Prisma client generation
 *
 * (pnpm consumes options after the script name, so script flags go after
 * the `--` separator.)
 *
 * Steps:
 *   1. verify Node >= 22 and pnpm >= 10
 *   2. verify this is the Nabome git repository
 *   3. pnpm install (skipped when node_modules exists unless --force)
 *   4. generate the Prisma client (apps/api)
 *   5. scaffold local env files from the tracked examples (.env, .dev.vars)
 *   6. run the architecture + env guard scripts as a sanity check
 *   7. print next steps
 *
 * Exit code 1 on any failed step. Uses only node built-ins.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const force = args.has('--force');
const skipDb = args.has('--skip-db');
const help = args.has('--help');

if (help) {
  console.log(`
Nabome bootstrap — setup the developer environment.

Usage: pnpm bootstrap [-- --force] [-- --skip-db]

  --force      re-run pnpm install even if node_modules exists
  --skip-db    skip Prisma client generation
  --help       show this help

(Flags go after the "--" separator: pnpm consumes its own options first.)
`);
  process.exit(0);
}

const fail = (message) => {
  console.error(`✖ ${message}`);
  process.exit(1);
};

const step = (message) => console.log(`\n› ${message}`);

const run = (command, argsList, opts = {}) => {
  const result = spawnSync(command, argsList, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  if (result.status !== 0) {
    fail(
      `"${command} ${argsList.join(' ')}" failed with exit code ${result.status}`,
    );
  }
};

// ── 1. Toolchain ─────────────────────────────────────────────────────────────

step('Verifying toolchain');

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (Number.isNaN(nodeMajor) || nodeMajor < 22) {
  fail(
    `Node 22+ required (found ${process.version}). Use nvm or the installer, then retry.`,
  );
}
console.log(`  node ${process.version} ✓`);

const pnpmCheck = spawnSync('pnpm', ['--version'], { encoding: 'utf8' });
if (pnpmCheck.status !== 0) {
  fail('pnpm is not installed. Run: npm install -g pnpm@10');
}
const pnpmVersion = pnpmCheck.stdout.trim();
const pnpmMajor = Number(pnpmVersion.split('.')[0]);
if (Number.isNaN(pnpmMajor) || pnpmMajor < 10) {
  fail(`pnpm 10+ required (found ${pnpmVersion}). Run: npm install -g pnpm@10`);
}
console.log(`  pnpm ${pnpmVersion} ✓`);

// ── 2. Repository ────────────────────────────────────────────────────────────

step('Verifying repository');

if (!existsSync(join(ROOT, '.git'))) {
  fail('This does not appear to be the Nabome repository (.git missing).');
}
if (!existsSync(join(ROOT, 'pnpm-workspace.yaml'))) {
  fail('pnpm-workspace.yaml is missing — run this script from the repo root.');
}
console.log('  workspace root ✓');

// ── 3. Dependencies ──────────────────────────────────────────────────────────

const nodeModules = join(ROOT, 'node_modules');
if (force || !existsSync(nodeModules)) {
  step('Installing workspace dependencies (pnpm install)');
  run('pnpm', ['install']);
} else {
  step('Dependencies already installed (use --force to re-install)');
  run('pnpm', ['install', '--frozen-lockfile'], { stdio: 'inherit' });
}

// ── 4. Prisma client ─────────────────────────────────────────────────────────

if (!skipDb) {
  step('Generating Prisma client (apps/api)');
  run('pnpm', ['db:generate']);
} else {
  console.log('  skipped (--skip-db)');
}

// ── 5. Local env files ───────────────────────────────────────────────────────

step('Scaffolding local environment files');

const rootEnv = join(ROOT, '.env');
if (!existsSync(rootEnv)) {
  copyFileSync(join(ROOT, '.env.example'), rootEnv);
  console.log('  created .env from .env.example — edit with real values');
} else {
  console.log('  .env already exists (left untouched)');
}

const devVars = join(ROOT, 'apps/api/.dev.vars');
if (!existsSync(devVars)) {
  copyFileSync(join(ROOT, 'apps/api/.dev.vars.example'), devVars);
  console.log(
    '  created apps/api/.dev.vars from .dev.vars.example — edit with real values',
  );
} else {
  console.log('  apps/api/.dev.vars already exists (left untouched)');
}

// ── 6. Sanity checks ─────────────────────────────────────────────────────────

step('Running repository guards');
run('node', ['scripts/check-architecture.mjs']);
run('node', ['scripts/validate-env.mjs']);

// ── 7. Next steps ────────────────────────────────────────────────────────────

step('Bootstrap complete');

console.log(`
Next steps:
  1. Start Postgres 17 (if you need the API + database):
       docker compose -f infra/docker-compose.yml up -d
  2. Apply the database schema:
       pnpm db:migrate   (dev)  |  pnpm db:deploy  (migrations only)
     and seed: pnpm db:seed
  3. Edit your local env files with real values:
       .env               (frontends)
       apps/api/.dev.vars (API secrets)
  4. Run everything:
       pnpm dev           # customer 5173 · admin 5174 · shop 5175 · api 8788
  5. Validate the gate before committing:
       pnpm check

See docs/SETUP_GUIDE.md for the full walkthrough.`);
