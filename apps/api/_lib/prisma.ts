import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

let prisma: PrismaClient | null = null;
let initialized = false;
let pool: pg.Pool | null = null;

function isLocalConnectionString(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

export function initPrisma(
  databaseUrl: string,
  opts?: { viaHyperdrive?: boolean },
): PrismaClient {
  if (initialized) return prisma!;
  if (!databaseUrl) {
    throw new Error('No database URL — set DATABASE_URL secret in Cloudflare');
  }
  const usePg = Boolean(
    opts?.viaHyperdrive || isLocalConnectionString(databaseUrl),
  );
  if (usePg) {
    pool = new pg.Pool({
      connectionString: databaseUrl,
      max: 10,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 30000,
      allowExitOnIdle: true,
    });
    pool.on('error', (err) => {
      console.error('pg Pool error', err.message);
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    const adapter = new PrismaNeonHTTP(databaseUrl, {});
    prisma = new PrismaClient({ adapter });
  }
  initialized = true;
  return prisma!;
}

export function getPrisma(): PrismaClient {
  if (prisma) return prisma;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'Prisma not initialized — call initPrisma(url) in middleware first',
    );
  }
  return initPrisma(databaseUrl, {
    viaHyperdrive: isLocalConnectionString(databaseUrl),
  });
}

export function __resetPrismaForTests(): void {
  prisma = null;
  initialized = false;
  if (pool) {
    void pool.end().catch((error) => {
      console.warn('Failed to close Prisma connection pool:', error);
    });
    pool = null;
  }
}
