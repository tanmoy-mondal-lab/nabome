import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import type { Env } from "./env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getDatabaseUrl(env?: Env): string {
  // Try env first, fall back to process.env for local dev
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

function getPrismaClient(env?: Env): PrismaClient {
  // In production, we create a new client per request with the correct env
  // In development, we can reuse the global client
  if (globalForPrisma.prisma && !env) {
    return globalForPrisma.prisma;
  }
  return createPrismaClient(env);
}

export function getPrisma(env?: Env): PrismaClient {
  return getPrismaClient(env);
}

// For backward compatibility - use with caution in production
export const prisma = getPrismaClient();
export default prisma;