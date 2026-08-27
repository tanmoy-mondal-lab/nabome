/**
 * Integration test DB helpers — connect to the local Postgres (docker-compose)
 * and reset the schema before each run. Tests are skipped automatically when
 * DATABASE_URL is unreachable (e.g. infra not started).
 */
import { connect } from 'node:net';

import { PrismaClient } from '@prisma/client';

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://nabome:nabome@localhost:5432/nabome?schema=public';

let prisma: PrismaClient | null = null;

export function getDb(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
  }
  return prisma;
}

export async function disconnectDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/** True when something is listening on the Postgres port (no shell dep). */
export async function dbAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host: 'localhost', port: 5432 });
    socket.setTimeout(2_000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
  });
}

/**
 * Wipe all rows (TRUNCATE everything, CASCADE) so each integration run starts
 * from a clean schema. Requires `prisma db push`/migrate to have run first.
 */
export async function resetDb(): Promise<void> {
  const client = getDb();
  const tables = await client.$queryRawUnsafe<{ tablename: string }[]>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != '_prisma_migrations'",
  );
  if (tables.length > 0) {
    await client.$executeRawUnsafe(
      `TRUNCATE TABLE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`,
    );
  }
}
