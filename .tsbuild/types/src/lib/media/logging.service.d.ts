/**
 * Media Management Module - Structured Logging Service
 *
 * SERVER-ONLY: This service uses Pino (Node.js logging library) and must not
 * be imported from browser/client code. It will throw if bundled for the browser.
 */
/**
 * Log levels
 */
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal"
}
/**
 * Log entry structure
 */
export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: string;
    operation?: string;
    entityType?: string;
    entityId?: string;
    assetId?: string;
    publicId?: string;
    folder?: string;
    userId?: string;
    requestId?: string;
    duration?: number;
    error?: {
        name: string;
        message: string;
        stack?: string;
        code?: string;
    };
    metadata?: Record<string, unknown>;
}
/**
 * Logger configuration options
 */
export interface LoggerConfig {
    level?: LogLevel;
    pretty?: boolean;
    destination?: string;
    context?: string;
}
/**
 * Media Logger class
 */
export declare class MediaLogger {
    private logger;
    private context;
    constructor(config?: LoggerConfig);
    debug(message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void;
    fatal(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void;
    child(childContext: string, metadata?: Record<string, unknown>): MediaLogger;
    startOperation(operation: string, metadata?: Record<string, unknown>): string;
    completeOperation(operation: string, operationId: string, metadata?: Record<string, unknown>): void;
    failOperation(operation: string, operationId: string, error?: Error, metadata?: Record<string, unknown>): void;
    withTiming<T>(operation: string, fn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<T>;
}
export declare function getLogger(): MediaLogger;
export declare function setLogger(logger: MediaLogger): void;
export declare function createLoggerInstance(config?: LoggerConfig): MediaLogger;
export type LifecycleEventType = "upload" | "replace" | "delete" | "delete_entity" | "slug_change" | "cleanup" | "verification" | "rollback" | "migration";
export declare function logLifecycleEvent(eventType: LifecycleEventType, success: boolean, metadata?: {
    entityType?: string;
    entityId?: string;
    slug?: string;
    assetId?: string;
    oldAssetId?: string;
    publicId?: string;
    oldPublicId?: string;
    folder?: string;
    error?: string;
    duration?: number;
    [key: string]: unknown;
}): void;
export declare function logMediaOperation(operation: string, entityType: string, entityId: string, metadata?: Record<string, unknown>): string;
export declare function logMediaOperationResult(operation: string, operationId: string, success: boolean, metadata?: Record<string, unknown>): void;
