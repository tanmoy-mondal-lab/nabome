// ─────────────────────────────────────────────────────────────
// DATABASE CONNECTION MANAGEMENT
// ─────────────────────────────────────────────────────────────
// Connection retry logic and connection pool management
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "./prisma";
import type { Env } from "./env";

export interface ConnectionRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
}

export class DatabaseConnectionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = "DatabaseConnectionError";
  }
}

export async function withConnectionRetry<T>(
  operation: (prisma: ReturnType<typeof getPrisma>) => Promise<T>,
  env?: Env,
  options: ConnectionRetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error | undefined;
  let currentDelay = retryDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const prisma = getPrisma(env);
      return await operation(prisma);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw new DatabaseConnectionError(
          `Database operation failed after ${maxRetries} retries`,
          lastError
        );
      }

      // Wait before retrying with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError || new DatabaseConnectionError("Unknown database error");
}

export async function testConnection(env?: Env): Promise<boolean> {
  try {
    const prisma = getPrisma(env);
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

export async function getConnectionHealth(env?: Env): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const prisma = getPrisma(env);
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    
    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
