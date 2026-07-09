/**
 * Media Management Module - Structured Logging Service
 * 
 * This service provides persistent structured logging for all media operations.
 * It uses Pino for high-performance JSON logging with support for multiple transports.
 */

import { createRequire } from "module";
import pino from "pino";

const _require = createRequire(import.meta.url);

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
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
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  pretty: process.env.NODE_ENV === "development",
  context: "MediaService",
};

/**
 * Create a Pino logger instance
 */
function createLogger(config: LoggerConfig = DEFAULT_CONFIG): pino.Logger {
  const pinoConfig: pino.LoggerOptions = {
    level: config.level || LogLevel.INFO,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      error: pino.stdSerializers.err,
    },
  };

  let destination = pino.destination(1); // stdout

  if (config.destination) {
    destination = pino.destination({
      dest: config.destination,
      sync: false,
    });
  } else if (config.pretty) {
    // Use pino-pretty for pretty printing in development
    try {
      const pinoPretty = _require("pino-pretty");
      destination = pinoPretty({
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        singleLine: false,
      });
    } catch {
      // pino-pretty not available, using default output
    }
  }

  return pino(pinoConfig, destination);
}

/**
 * Media Logger class
 */
export class MediaLogger {
  private logger: pino.Logger;
  private context: string;

  constructor(config: LoggerConfig = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    this.context = finalConfig.context || "MediaService";
    this.logger = createLogger(finalConfig);
  }

  /**
   * Log a debug message
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug({ context: this.context, ...metadata }, message);
  }

  /**
   * Log an info message
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info({ context: this.context, ...metadata }, message);
  }

  /**
   * Log a warning message
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn({ context: this.context, ...metadata }, message);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.logger.error(
      {
        context: this.context,
        err: errorObj,
        ...metadata,
      },
      message
    );
  }

  /**
   * Log a fatal error message
   */
  fatal(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.logger.fatal(
      {
        context: this.context,
        err: errorObj,
        ...metadata,
      },
      message
    );
  }

  /**
   * Create a child logger with additional context
   */
  child(childContext: string, metadata?: Record<string, unknown>): MediaLogger {
    const childLogger = new MediaLogger({
      context: `${this.context}:${childContext}`,
    });
    
    // Bind the child logger to the parent's logger
    childLogger.logger = this.logger.child({
      context: childContext,
      ...metadata,
    });
    
    return childLogger;
  }

  /**
   * Log the start of an operation
   */
  startOperation(operation: string, metadata?: Record<string, unknown>): string {
    const operationId = crypto.randomUUID();
    this.info(`Starting operation: ${operation}`, {
      operationId,
      operation,
      ...metadata,
    });
    return operationId;
  }

  /**
   * Log the completion of an operation
   */
  completeOperation(operation: string, operationId: string, metadata?: Record<string, unknown>): void {
    this.info(`Completed operation: ${operation}`, {
      operationId,
      operation,
      ...metadata,
    });
  }

  /**
   * Log the failure of an operation
   */
  failOperation(operation: string, operationId: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.error(`Failed operation: ${operation}`, error, {
      operationId,
      operation,
      ...metadata,
    });
  }

  /**
   * Log with timing information
   */
  withTiming<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    const startTime = Date.now();
    const operationId = this.startOperation(operation, metadata);

    return fn()
      .then((result) => {
        const duration = Date.now() - startTime;
        this.completeOperation(operation, operationId, { duration, ...metadata });
        return result;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        this.failOperation(operation, operationId, error, { duration, ...metadata });
        throw error;
      });
  }
}

/**
 * Default logger instance
 */
let defaultLogger: MediaLogger | null = null;

/**
 * Get the default logger instance
 */
export function getLogger(): MediaLogger {
  if (!defaultLogger) {
    defaultLogger = new MediaLogger();
  }
  return defaultLogger;
}

/**
 * Set the default logger instance
 */
export function setLogger(logger: MediaLogger): void {
  defaultLogger = logger;
}

/**
 * Create a new logger instance with custom configuration
 */
export function createLoggerInstance(config?: LoggerConfig): MediaLogger {
  return new MediaLogger(config);
}

/**
 * Lifecycle event types for logging
 */
export type LifecycleEventType =
  | "upload"
  | "replace"
  | "delete"
  | "delete_entity"
  | "slug_change"
  | "cleanup"
  | "verification"
  | "rollback"
  | "migration";

/**
 * Log a lifecycle event
 */
export function logLifecycleEvent(
  eventType: LifecycleEventType,
  success: boolean,
  metadata?: {
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
  }
): void {
  const logger = getLogger();
  const level = success ? "info" : "error";
  const message = `Lifecycle event: ${eventType}`;

  logger[level](message, {
    eventType,
    success,
    ...metadata,
  });
}

/**
 * Log a media operation
 */
export function logMediaOperation(
  operation: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
): string {
  const logger = getLogger();
  return logger.startOperation(operation, {
    entityType,
    entityId,
    ...metadata,
  });
}

/**
 * Log a media operation result
 */
export function logMediaOperationResult(
  operation: string,
  operationId: string,
  success: boolean,
  metadata?: Record<string, unknown>
): void {
  const logger = getLogger();
  if (success) {
    logger.completeOperation(operation, operationId, metadata);
  } else {
    logger.failOperation(operation, operationId, undefined, metadata);
  }
}
