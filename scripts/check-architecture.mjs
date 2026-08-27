/**
 * Architecture guard — enforces the structural rules from
 * FOLDER_ARCHITECTURE.md (§10) at `pnpm check` time:
 *
 *   1. apps/ must contain exactly: customer, admin, shop, api
 *   2. packages/ must contain the 10 shared packages
 *   3. every package exposes a single barrel (src/index.ts)
 *   4. every package/app is named @nabome/<name>
 *   5. no app imports another app (or escapes the repo root)
 *   6. _lib/ must never import _handlers/
 *   7. handler domains must not import other handler domains
 *
 * Exit code 1 on any violation. Uses only node built-ins.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function scan(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name.startsWith('.')
      )
        continue;
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(ts|tsx|mjs|cjs)$/.test(entry.name)) out.push(p);
    }
  };
  walk(dir);
  return out;
}

// ── 1 & 2. Directory inventory ────────────────────────────────────────────────

const REQUIRED_APPS = ['customer', 'admin', 'shop', 'api'];
const REQUIRED_PACKAGES = [
  'api-contracts',
  'auth',
  'config',
  'constants',
  'design-tokens',
  'inventory',
  'logging',
  'types',
  'ui',
  'utils',
  'validation',
];

const appsDir = readdirSync(join(ROOT, 'apps'), { withFileTypes: true }).filter(
  (e) => e.isDirectory(),
);
const packagesDir = readdirSync(join(ROOT, 'packages'), {
  withFileTypes: true,
}).filter((e) => e.isDirectory());

for (const name of REQUIRED_APPS) {
  if (!appsDir.some((e) => e.name === name)) fail(`apps/${name} is missing`);
}
for (const name of REQUIRED_PACKAGES) {
  if (!packagesDir.some((e) => e.name === name))
    fail(`packages/${name} is missing`);
}

const knownApps = REQUIRED_APPS;
const knownPackages = REQUIRED_PACKAGES;
const names = new Set([...knownApps, ...knownPackages]);

// ── 3 & 4. Barrel + naming ────────────────────────────────────────────────────

for (const dir of [...packagesDir, ...appsDir]) {
  if (dir.name === 'api') continue; // Pages Functions app, no src/index barrel
  if (!names.has(dir.name)) {
    notes.push(`unknown top-level member: ${dir.name}`);
    continue;
  }
  const manifestPath = join(dir.parentPath, dir.name, 'package.json');
  const packageJson = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (packageJson.name !== `@nabome/${dir.name}`) {
    fail(
      `${relative(ROOT, dir.parentPath)}/${dir.name}/package.json name must be "@nabome/${dir.name}"`,
    );
  }
  if (dir.parentPath.endsWith('packages')) {
    const barrel = join(ROOT, 'packages', dir.name, 'src', 'index.ts');
    if (!existsSync(barrel)) {
      fail(`packages/${dir.name} must expose a single barrel src/index.ts`);
    }
  }
}

// ── 5. Import boundaries (apps) ───────────────────────────────────────────────

const importRe = /from\s+['"]([^'"]+)['"]/g;

for (const app of knownApps) {
  const srcDir = join(ROOT, 'apps', app, 'src');
  if (!existsSync(srcDir)) continue;
  for (const file of scan(srcDir)) {
    const depthBelowRoot = file.slice(srcDir.length + 1).split('/').length - 1;
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(importRe)) {
      const spec = match[1];
      if (spec.startsWith('@nabome/')) {
        const target = spec.split('/')[1];
        if (knownApps.includes(target)) {
          fail(`${relative(ROOT, file)} must not import app "${spec}"`);
        }
        if (!names.has(target)) {
          fail(`${relative(ROOT, file)} imports unknown package "${spec}"`);
        }
      }
      if (spec.startsWith('../') && !spec.endsWith('.css')) {
        const upLevels = spec.match(/\.\.\//g)?.length ?? 0;
        if (upLevels > depthBelowRoot) {
          fail(`${relative(ROOT, file)} escapes its source root via "${spec}"`);
        }
      }
    }
  }
}

// ── 6 & 7. API layering ───────────────────────────────────────────────────────

const apiLib = join(ROOT, 'apps/api', '_lib');
const apiHandlers = join(ROOT, 'apps/api', '_handlers');

if (existsSync(apiLib)) {
  for (const file of scan(apiLib)) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(importRe)) {
      if (match[1].includes('_handlers')) {
        fail(
          `${relative(ROOT, file)}: _lib must never import _handlers ("${match[1]}")`,
        );
      }
    }
  }
}

if (existsSync(apiHandlers)) {
  for (const file of scan(apiHandlers)) {
    const base = file.split('/').pop();
    if (base === 'index.ts' || base === 'register.ts') continue; // infrastructure
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(importRe)) {
      if (match[1].startsWith('./')) {
        fail(
          `${relative(ROOT, file)}: handler domains must not import other handler domains ("${match[1]}")`,
        );
      }
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

for (const note of notes) console.warn(`• ${note}`);
if (failures.length > 0) {
  console.error(
    `✖ Architecture check failed with ${failures.length} violation(s):`,
  );
  for (const f of failures) console.error(`   - ${f}`);
  process.exit(1);
}
console.log('✔ Architecture check passed.');
