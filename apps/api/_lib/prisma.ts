import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

let prisma: PrismaClient | null = null;
let initialized = false;
let pool: pg.Pool | null = null;
let lastDatabaseUrl = '';
let lastViaHyperdrive = false;
let lastPoolResetAt = 0;
let lastActiveAt = 0;
const STALE_POOL_MS = 10000;

function isLocalConnectionString(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1');
}

export function initPrisma(
  databaseUrl: string,
  opts?: { viaHyperdrive?: boolean },
): PrismaClient {
  if (initialized) {
    const now = Date.now();
    if (now - lastActiveAt > STALE_POOL_MS) resetStalePool();
    lastActiveAt = Date.now();
    return prisma!;
  }
  lastActiveAt = Date.now();
  if (!databaseUrl) {
    throw new Error('No database URL — set DATABASE_URL secret in Cloudflare');
  }
  lastDatabaseUrl = databaseUrl;
  lastViaHyperdrive = Boolean(
    opts?.viaHyperdrive || isLocalConnectionString(databaseUrl),
  );
  const isPostgresUrl =
    databaseUrl.startsWith('postgres://') ||
    databaseUrl.startsWith('postgresql://');
  const usePg = Boolean(
    opts?.viaHyperdrive ||
    isLocalConnectionString(databaseUrl) ||
    isPostgresUrl,
  );
  if (usePg) {
    pool = new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 3000,
      allowExitOnIdle: false,
      keepAlive: true,
      keepAliveInitialDelayMillis: 3000,
      query_timeout: 60000,
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

export function resetStalePool(minIntervalMs = 10000): boolean {
  const now = Date.now();
  if (now - lastPoolResetAt < minIntervalMs) return false;
  lastPoolResetAt = now;
  if (pool) {
    const stale = pool;
    pool = null;
    void stale.end().catch(() => {});
  }
  try {
    void prisma?.$disconnect().catch(() => {});
  } catch {
    // Best-effort pool reset: disconnect failures must not break the retry path.
  }
  prisma = null;
  initialized = false;
  if (lastDatabaseUrl) {
    try {
      initPrisma(lastDatabaseUrl, { viaHyperdrive: lastViaHyperdrive });
    } catch {
      // Best-effort re-init: failure leaves the pool uninitialized and the
      // next request re-initializes via middleware.
    }
  }
  return true;
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
