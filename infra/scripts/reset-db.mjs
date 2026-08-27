/**
 * Reset the local database to a clean schema + seed.
 *   node infra/scripts/reset-db.mjs
 *
 * Uses the same DATABASE_URL default as .env.example. Prisma pushes the
 * canonical schema (apps/api/prisma/schema.prisma) then runs the seed.
 */
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://nabome:nabome@localhost:5432/nabome?schema=public';

const run = (cmd) =>
  execSync(cmd, {
    stdio: 'inherit',
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL },
  });

console.log('↻ Resetting database schema (prisma db push)...');
run('pnpm --filter @nabome/api exec prisma db push --force-reset');
console.log('↻ Seeding baseline data...');
run('pnpm db:seed');
console.log('✔ Database reset complete.');
