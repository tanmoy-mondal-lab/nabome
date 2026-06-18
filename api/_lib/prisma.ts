import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getDatabaseUrl(): string {
  // Prefer pooled connection for serverless. Fall back to direct if not available.
  return process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || "";
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
