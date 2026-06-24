import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import type { Env } from "./env";

const globalForPrisma = globalThis as unknown as { 
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(env?: Env): string {
  // Debug logging
  console.log("[PRISMA DEBUG] env parameter:", env);
  console.log("[PRISMA DEBUG] env type:", typeof env);
  console.log("[PRISMA DEBUG] env keys:", env ? Object.keys(env) : "env is null/undefined");
  console.log("[PRISMA DEBUG] env.DATABASE_URL:", env?.DATABASE_URL ? "SET" : "UNDEFINED");
  console.log("[PRISMA DEBUG] env.DATABASE_URL_POOLED:", env?.DATABASE_URL_POOLED ? "SET" : "UNDEFINED");
  
  const url = env?.DATABASE_URL || env?.DATABASE_URL_POOLED ||
    (typeof process !== "undefined" && process.env?.DATABASE_URL) ||
    (typeof process !== "undefined" && process.env?.DATABASE_URL_POOLED) ||
    "";
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
  
  // In Cloudflare Pages, always create client per-request with env
  return createPrismaClient(env);
}