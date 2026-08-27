/**
 * Environment guard — enforces env hygiene at `pnpm check` time:
 *
 *   1. `.env.example` (root) + `apps/api/.dev.vars.example` must exist
 *   2. every env var referenced in code is declared in an example file
 *   3. example files contain placeholders only (no real secret material)
 *   4. no committed file may contain secret-looking values
 *
 * Exit code 1 on any violation. Uses only node built-ins.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const failures = [];

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
        entry.name === 'coverage' ||
        entry.name === '.git' ||
        entry.name.startsWith('.wrangler') ||
        entry.name === 'prisma/generated'
      ) {
        continue;
      }
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (/\.(ts|tsx|mjs|js|cjs)$/.test(entry.name)) out.push(p);
    }
  };
  walk(dir);
  return out;
}

// ── 1. Example files exist ───────────────────────────────────────────────────

const rootExample = join(ROOT, '.env.example');
const apiExample = join(ROOT, 'apps/api/.dev.vars.example');
if (!existsSync(rootExample)) fail('.env.example is missing at repo root');
if (!existsSync(apiExample)) fail('apps/api/.dev.vars.example is missing');

// ── 2. Every referenced variable is declared ──────────────────────────────────

function declaredVars(file) {
  if (!existsSync(file)) return new Set();
  const content = readFileSync(file, 'utf8');
  return new Set(
    [...content.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((m) => m[1]),
  );
}

const rootVars = declaredVars(rootExample);
const apiVars = declaredVars(apiExample);
const allVars = new Set([...rootVars, ...apiVars]);

const BINDING_NAMES = new Set([
  'KV',
  'MEDIA_BUCKET',
  'HYPERDRIVE',
  'NOTIFICATION_QUEUE',
  'EMAIL_QUEUE',
]);

const seen = new Set();
for (const file of scan(join(ROOT, 'apps'))) {
  const content = readFileSync(file, 'utf8');
  for (const m of content.matchAll(/env\.([A-Z][A-Z0-9_]*)/g)) seen.add(m[1]);
  for (const m of content.matchAll(/import\.meta\.env\.([A-Z][A-Z0-9_]*)/g))
    seen.add(m[1]);
  for (const m of content.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g))
    seen.add(m[1]);
}
for (const file of scan(join(ROOT, 'packages'))) {
  const content = readFileSync(file, 'utf8');
  for (const m of content.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g))
    seen.add(m[1]);
}

for (const name of seen) {
  if (BINDING_NAMES.has(name)) continue; // wrangler bindings, not env vars
  if (!allVars.has(name)) {
    fail(
      `env var "${name}" is referenced in code but missing from .env.example / apps/api/.dev.vars.example`,
    );
  }
}

// ── 3 & 4. No real secrets ───────────────────────────────────────────────────

const secretPatterns = [
  /sk-live-[A-Za-z0-9]{8,}/, // Stripe-like
  /AKIA[0-9A-Z]{16}/, // AWS access key
  /ghp_[A-Za-z0-9]{20,}/, // GitHub token
  /re_[A-Za-z0-9]{20,}/, // Resend key
  /rzp_(?:live|test)_[A-Za-z0-9]{14,}/, // Razorpay key
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, // private keys
  /change-me-(?:in-production|now)/, // must-never-commit placeholder
];

const placeholderValue = (value) =>
  value === '' ||
  /(xxxx|your-|change-me|^re_xxxxxxxx|^rzp_(test|live)_xxxxxxxx|\.supabase\.co)/.test(
    value,
  );

const isSecretName = (name) =>
  /(KEY|SECRET|TOKEN|PASSWORD|PASSPHRASE|DSN)$/.test(name) ||
  /RAZORPAY_WEBHOOK/.test(name);

for (const file of scan(join(ROOT, 'apps'))) {
  const content = readFileSync(file, 'utf8');
  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      fail(`possible secret material in ${file} (${pattern.source})`);
    }
  }
}

const exampleFiles = [rootExample, apiExample];
for (const file of exampleFiles) {
  if (!existsSync(file)) continue;
  const content = readFileSync(file, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/);
    if (!m) continue;
    const [, name, value] = m;
    if (isSecretName(name) && !placeholderValue(value)) {
      fail(
        `${file}: "${name}" looks like a real secret — keep placeholders only`,
      );
    }
  }
}

// ── Report ───────────────────────────────────────────────────────────────────

if (failures.length > 0) {
  console.error(`✖ Env validation failed with ${failures.length} problem(s):`);
  for (const f of failures) console.error(`   - ${f}`);
  process.exit(1);
}
console.log('✔ Env validation passed.');
