/**
 * Shared Prisma client singleton for Cloudflare Pages Functions.
 * Uses Neon serverless HTTP driver adapter for edge-compatible database access.
 * Initialize with `initPrisma(url)` at startup; then use `getPrisma()` everywhere.
 */
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
let initialized = false;

/**
 * Initialize the Prisma singleton with a database URL.
 * Call once from middleware before any `getPrisma()` calls.
 */
export function initPrisma(databaseUrl: string): PrismaClient {
  if (initialized) return prisma!;
  if (!databaseUrl) {
    throw new Error('No database URL — set DATABASE_URL secret in Cloudflare');
  }
  const adapter = new PrismaNeonHTTP(databaseUrl, {});
  prisma = new PrismaClient({ adapter });
  initialized = true;
  return prisma!;
}

/**
 * Get the Prisma client singleton.
 * Must call `initPrisma(url)` first. Falls back to DATABASE_URL env var for local dev.
 */
export function getPrisma(): PrismaClient {
  if (prisma) return prisma;
  // Local dev fallback — process.env is not available in Cloudflare Workers
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'Prisma not initialized — call initPrisma(url) in middleware first',
    );
  }
  return initPrisma(databaseUrl);
}
