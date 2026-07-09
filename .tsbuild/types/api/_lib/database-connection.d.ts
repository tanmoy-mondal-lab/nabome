import { getPrisma } from "./prisma";
import type { Env } from "./env";
export interface ConnectionRetryOptions {
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
}
export declare class DatabaseConnectionError extends Error {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
export declare function withConnectionRetry<T>(operation: (prisma: ReturnType<typeof getPrisma>) => Promise<T>, env?: Env, options?: ConnectionRetryOptions): Promise<T>;
export declare function testConnection(env?: Env): Promise<boolean>;
export declare function getConnectionHealth(env?: Env): Promise<{
    connected: boolean;
    latency?: number;
    error?: string;
}>;
