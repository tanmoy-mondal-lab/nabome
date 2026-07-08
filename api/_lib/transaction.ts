import { getPrisma } from "./prisma";
import type { PrismaClient, Prisma } from "@prisma/client";
import type { Env } from "./env";

export interface TransactionOptions {
  maxRetries?: number;
  isolationLevel?: "ReadUncommitted" | "ReadCommitted" | "RepeatableRead" | "Serializable";
  timeout?: number;
}

export class TransactionError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = "TransactionError";
  }
}

export class TransactionRollbackError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = "TransactionRollbackError";
  }
}

/**
 * Execute a callback within a Prisma transaction with automatic retry and rollback
 */
export async function withTransaction<T>(
  callback: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => Promise<T>,
  env?: Env,
  options: TransactionOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    isolationLevel = "ReadCommitted",
    timeout = 10000,
  } = options;

  const prisma = getPrisma(env);
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          return await callback(tx);
        },
        {
          maxWait: timeout,
          timeout: timeout,
          isolationLevel,
        }
      );
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Check if error is retryable (deadlock, serialization failure, etc.)
      const isRetryable = isRetryableError(error);
      
      if (!isRetryable || attempt === maxRetries) {
        throw new TransactionError(
          `Transaction failed after ${attempt + 1} attempt(s)`,
          lastError
        );
      }

      // Exponential backoff
      const backoffMs = Math.min(100 * Math.pow(2, attempt), 1000);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw new TransactionError(
    `Transaction failed after ${maxRetries + 1} attempt(s)`,
    lastError
  );
}

/**
 * Execute a callback within a transaction with explicit rollback capability
 */
export async function withTransactionAndRollback<T>(
  callback: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">, rollback: () => void) => Promise<T>,
  env?: Env,
  options: TransactionOptions = {}
): Promise<T> {
  const prisma = getPrisma(env);
  let shouldRollback = false;

  const rollback = () => {
    shouldRollback = true;
  };

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const result = await callback(tx, rollback);
        if (shouldRollback) {
          throw new TransactionRollbackError("Explicit rollback requested");
        }
        return result;
      },
      {
        maxWait: options.timeout || 10000,
        timeout: options.timeout || 10000,
        isolationLevel: options.isolationLevel || "ReadCommitted",
      }
    );
    return result;
  } catch (error) {
    if (error instanceof TransactionRollbackError) {
      throw error;
    }
    throw new TransactionError("Transaction failed", error as Error);
  }
}

/**
 * Execute multiple operations in a transaction with atomicity guarantees
 */
export async function atomicOperations<T>(
  operations: Array<(tx: any) => Promise<T>>,
  env?: Env,
  options: TransactionOptions = {}
): Promise<T[]> {
  return withTransaction(async (tx) => {
    const results: T[] = [];
    for (const operation of operations) {
      const result = await operation(tx);
      results.push(result);
    }
    return results;
  }, env, options);
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    const retryablePatterns = [
      "deadlock",
      "serialization failure",
      "could not serialize",
      "connection",
      "timeout",
      "network",
    ];
    return retryablePatterns.some((pattern) => errorMessage.includes(pattern));
  }
  return false;
}

/**
 * Execute a callback with transaction-like behavior for single operations
 */
export async function withRetry<T>(
  callback: () => Promise<T>,
  options: { maxRetries?: number; backoffMs?: number } = {}
): Promise<T> {
  const { maxRetries = 3, backoffMs = 100 } = options;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callback();
    } catch (error) {
      lastError = error as Error;
      const isRetryable = isRetryableError(error);

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, backoffMs * Math.pow(2, attempt)));
    }
  }

  throw lastError;
}
