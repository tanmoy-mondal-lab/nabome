/**
 * Cleanup script — removes generated/build artifacts from the workspace.
 *
 *   pnpm clean         # artifacts only (dist, coverage, .wrangler, …)
 *   pnpm clean:all     # artifacts + all node_modules (full reset)
 *
 * Never touches source files, lockfiles, or .env files. Uses only node
 * built-ins; safe to run from a dirty tree.
 */
import { rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const all = process.argv.includes('--all');

const ARTIFACTS = [
  'dist',
  'dist-ssr',
  'coverage',
  'playwright-report',
  'test-results',
  '.wrangler',
  '.turbo',
  '.nyc_output',
  'node_modules/.vite',
];

const removed = [];

const walkForTsbuildinfo = (dir) => {
  if (!dir) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      walkForTsbuildinfo(p);
    } else if (entry.name.endsWith('.tsbuildinfo')) {
      rmSync(p, { force: true });
      removed.push(p);
    }
  }
};

for (const artifact of ARTIFACTS) {
  const target = join(ROOT, artifact);
  const isViteCache = artifact.endsWith('.vite');
  rmSync(target, { recursive: true, force: true });
  if (!isViteCache) removed.push(artifact);
}

// Generated Prisma client
rmSync(join(ROOT, 'apps/api/prisma/generated'), {
  recursive: true,
  force: true,
});

// Stray tsbuildinfo files across the workspace
walkForTsbuildinfo(join(ROOT, 'apps'));
walkForTsbuildinfo(join(ROOT, 'packages'));
walkForTsbuildinfo(join(ROOT, 'e2e'));
walkForTsbuildinfo(join(ROOT, 'tests'));

if (all) {
  const dirs = ['apps', 'packages', 'e2e', 'tests', 'infra'];
  for (const dir of dirs) {
    rmSync(join(ROOT, dir, 'node_modules'), { recursive: true, force: true });
  }
  rmSync(join(ROOT, 'node_modules'), { recursive: true, force: true });
  removed.push('node_modules (all workspace projects)');
}

if (removed.length === 0) {
  console.log('Nothing to clean — workspace is already clean.');
  process.exit(0);
}

console.log(`Removed ${removed.length} artifact(s):`);
for (const item of removed) console.log(`  - ${item}`);

if (all) {
  console.log(
    '\nRun `pnpm bootstrap` (or `pnpm install && pnpm db:generate`) to rebuild.',
  );
} else {
  console.log('\nReinstall nothing — only build artifacts were removed.');
}
