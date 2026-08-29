import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ENV = process.argv[2] ?? 'production';
const SKIP_BUILD = process.argv.includes('--skip-build');

function fail(m) {
  console.error(`✖ ${m}`);
  process.exit(1);
}
function ok(m) {
  console.log(`✔ ${m}`);
}

try {
  execSync('git diff --quiet && git diff --cached --quiet', {
    stdio: 'ignore',
  });
  ok('git tree clean');
} catch {
  fail('git tree dirty — commit or stash before deploy');
}

const wrangler = readFileSync('apps/api/wrangler.jsonc', 'utf8');
const yourMatches = [...wrangler.matchAll(/YOUR_/g)];
if (yourMatches.length > 0) {
  const envSection = ENV === 'staging' ? 'staging' : 'production';
  const hasPlaceholders = wrangler.includes('YOUR_');
  if (ENV !== 'development' && hasPlaceholders) {
    console.warn(
      `⚠ wrangler.jsonc still contains YOUR_ placeholders — KV/Hyperdrive not provisioned for ${envSection}`,
    );
    if (ENV === 'production')
      fail(
        'production deploy blocked: YOUR_ placeholders remain in wrangler.jsonc',
      );
  }
}

const requiredVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'STORAGE_ENDPOINT',
  'STORAGE_REGION',
  'STORAGE_BUCKET',
  'STORAGE_ACCESS_KEY_ID',
  'STORAGE_SECRET_ACCESS_KEY',
  'STORAGE_PUBLIC_URL',
];
for (const v of requiredVars) {
  if (!process.env[v])
    console.warn(`⚠ ${v} not in environment — will need Cloudflare secret`);
}
if (
  wrangler.includes('MEDIA_BUCKET') ||
  wrangler.includes('r2_buckets') ||
  wrangler.includes('R2_PUBLIC_URL')
) {
  fail(
    'wrangler.jsonc still contains R2-specific binding (MEDIA_BUCKET/r2_buckets/R2_PUBLIC_URL) — must use S3-compatible storage',
  );
}

if (!SKIP_BUILD) {
  console.log('→ pnpm typecheck');
  execSync('pnpm typecheck', { stdio: 'inherit' });
  console.log('→ pnpm lint');
  execSync('pnpm lint', { stdio: 'inherit' });
  console.log('→ pnpm test:unit');
  execSync('pnpm test:unit', { stdio: 'inherit' });
  console.log('→ pnpm build');
  execSync('pnpm build', { stdio: 'inherit' });
}

if (ENV === 'production') {
  console.log(
    '⚠ production deploy requires explicit approval — set CONFIRM_PRODUCTION=1',
  );
  if (process.env.CONFIRM_PRODUCTION !== '1')
    fail('production deploy blocked: set CONFIRM_PRODUCTION=1 to proceed');
}

ok(`deploy guard passed for ${ENV}`);
