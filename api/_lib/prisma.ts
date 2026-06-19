import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getDatabaseUrl(): string {
  // Prefer the direct URL over the pooled URL for reliability.
  // Set DATABASE_URL_POOLED only when using PgBouncer with Supabase.
  return process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED || "";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: process.env.DATABASE_URL_POOLED
      ? { db: { url: getDatabaseUrl() } }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
