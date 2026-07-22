import type { PrismaClient } from "@prisma/client";
import type { Env } from "./env";
export interface TransactionOptions {
    maxRetries?: number;
    isolationLevel?: "ReadUncommitted" | "ReadCommitted" | "RepeatableRead" | "Serializable";
    timeout?: number;
}
export declare class TransactionError extends Error {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
export declare class TransactionRollbackError extends Error {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
/**
 * Execute a callback within a Prisma transaction with automatic retry and rollback
 */
export declare function withTransaction<T>(callback: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => Promise<T>, env?: Env, options?: TransactionOptions): Promise<T>;
/**
 * Execute a callback within a transaction with explicit rollback capability
 */
export declare function withTransactionAndRollback<T>(callback: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">, rollback: () => void) => Promise<T>, env?: Env, options?: TransactionOptions): Promise<T>;
/**
 * Execute multiple operations in a transaction with atomicity guarantees
 */
export declare function atomicOperations<T>(operations: Array<(tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => Promise<T>>, env?: Env, options?: TransactionOptions): Promise<T[]>;
/**
 * Execute a callback with transaction-like behavior for single operations
 */
export declare function withRetry<T>(callback: () => Promise<T>, options?: {
    maxRetries?: number;
    backoffMs?: number;
}): Promise<T>;
