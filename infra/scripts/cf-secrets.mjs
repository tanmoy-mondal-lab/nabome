/**
 * Push Cloudflare Pages project secrets for the nabome-api worker.
 *   node infra/scripts/cf-secrets.mjs <staging|production> [--dry-run]
 *
 * Reads values from environment variables (never from files). Vars marked
 * `required` must be set or the script exits nonzero.
 *
 * Prerequisite: `wrangler login` and a Pages project named nabome-api(-staging).
 */
import { execSync } from 'node:child_process';

const ENV = process.argv[2];
const DRY_RUN = process.argv.includes('--dry-run');

if (!['staging', 'production'].includes(ENV)) {
  console.error(
    'Usage: node infra/scripts/cf-secrets.mjs <staging|production> [--dry-run]',
  );
  process.exit(1);
}

const PROJECT = ENV === 'production' ? 'nabome-api' : 'nabome-api-staging';

const SECRETS = [
  { var: 'DATABASE_URL', required: true },
  { var: 'JWT_SECRET', required: true },
  { var: 'CSRF_SECRET', required: true },
  { var: 'RESEND_API_KEY', required: false },
  { var: 'RAZORPAY_KEY_ID', required: false },
  { var: 'RAZORPAY_KEY_SECRET', required: false },
  { var: 'RAZORPAY_WEBHOOK_SECRET', required: false },
  { var: 'TURNSTILE_SECRET_KEY', required: false },
  { var: 'WEBHOOK_SECRET', required: false },
  { var: 'SENTRY_DSN', required: false },
];

let failures = 0;

for (const { var: name, required } of SECRETS) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    if (required) {
      console.error(`✖ ${name} is required (set ${name}=... before running)`);
      failures += 1;
    } else {
      console.warn(`• skipping optional ${name} (unset)`);
    }
    continue;
  }
  const command = `wrangler pages secret put ${name} --project-name ${PROJECT}`;
  if (DRY_RUN) {
    console.log(`(dry-run) would run: echo "${name}=<redacted>" | ${command}`);
    continue;
  }
  console.log(`↻ setting ${name} on ${PROJECT}...`);
  execSync(command, {
    stdio: 'inherit',
    input: value,
    env: { ...process.env },
  });
}

if (failures > 0) {
  console.error(`✖ ${failures} required secret(s) missing — aborting.`);
  process.exit(1);
}
console.log('✔ Secrets pushed.');
