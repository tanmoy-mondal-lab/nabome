/**
 * Media Management Module - Structured Logging Service
 *
 * This service provides persistent structured logging for all media operations.
 * It uses Pino for high-performance JSON logging with support for multiple transports.
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
    /**
     * Log a debug message
     */
    debug(message: string, metadata?: Record<string, unknown>): void;
    /**
     * Log an info message
     */
    info(message: string, metadata?: Record<string, unknown>): void;
    /**
     * Log a warning message
     */
    warn(message: string, metadata?: Record<string, unknown>): void;
    /**
     * Log an error message
     */
    error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void;
    /**
     * Log a fatal error message
     */
    fatal(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void;
    /**
     * Create a child logger with additional context
     */
    child(childContext: string, metadata?: Record<string, unknown>): MediaLogger;
    /**
     * Log the start of an operation
     */
    startOperation(operation: string, metadata?: Record<string, unknown>): string;
    /**
     * Log the completion of an operation
     */
    completeOperation(operation: string, operationId: string, metadata?: Record<string, unknown>): void;
    /**
     * Log the failure of an operation
     */
    failOperation(operation: string, operationId: string, error?: Error, metadata?: Record<string, unknown>): void;
    /**
     * Log with timing information
     */
    withTiming<T>(operation: string, fn: () => Promise<T>, metadata?: Record<string, unknown>): Promise<T>;
}
/**
 * Get the default logger instance
 */
export declare function getLogger(): MediaLogger;
/**
 * Set the default logger instance
 */
export declare function setLogger(logger: MediaLogger): void;
/**
 * Create a new logger instance with custom configuration
 */
export declare function createLoggerInstance(config?: LoggerConfig): MediaLogger;
/**
 * Lifecycle event types for logging
 */
export type LifecycleEventType = "upload" | "replace" | "delete" | "delete_entity" | "slug_change" | "cleanup" | "verification" | "rollback" | "migration";
/**
 * Log a lifecycle event
 */
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
/**
 * Log a media operation
 */
export declare function logMediaOperation(operation: string, entityType: string, entityId: string, metadata?: Record<string, unknown>): string;
/**
 * Log a media operation result
 */
export declare function logMediaOperationResult(operation: string, operationId: string, success: boolean, metadata?: Record<string, unknown>): void;
