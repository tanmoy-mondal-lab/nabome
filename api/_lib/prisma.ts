import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import type { Env } from "./env";
import { cleanSecret } from "./secrets";
import { getEnv } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

neonConfig.poolQueryViaFetch = true;

function getDatabaseUrl(env?: Env): string {
  // Use provided env, or fall back to process.env for local development
  const effectiveEnv = env || getEnv();
  const url = cleanSecret(effectiveEnv.DATABASE_URL_POOLED) ||
    cleanSecret(effectiveEnv.DATABASE_URL);
  if (!url) {
    throw new Error("[PRISMA] DATABASE_URL is not set. Check Cloudflare Pages secrets or .env file.");
  }
  return url;
}

function createPrismaClient(env?: Env): PrismaClient {
  const connectionString = getDatabaseUrl(env);
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: env?.NODE_ENV === "development"
      ? ["error", "warn"]
      : ["error"],
  });
}

/**
 * Get a Prisma client instance.
 *
 * IMPORTANT: This must be called with `env` parameter in Cloudflare Pages Functions.
 * The env is injected at request time, not module load time.
 *
 * In production (Cloudflare Pages), we reuse a singleton per isolate to avoid
 * creating a new connection pool on every request. Cloudflare Pages Functions
 * run on isolates that persist between requests, so this is safe and avoids
 * exhausting Neon connection limits.
 *
 * @param env - Cloudflare Pages environment (required in production)
 * @returns PrismaClient instance
 */
export function getPrisma(env?: Env): PrismaClient {
  // In local development, reuse global singleton for performance
  if (!env && typeof process !== "undefined" && process.env?.DATABASE_URL) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  }

  // In Cloudflare Pages, reuse singleton per isolate to avoid connection exhaustion.
  // Each isolate persists between requests, so a singleton is safe and efficient.
  // Creating a new PrismaClient per request would exhaust Neon's connection limit
  // under load, causing cascading 500 errors.
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient(env);
  }
  return globalForPrisma.prisma;
}
