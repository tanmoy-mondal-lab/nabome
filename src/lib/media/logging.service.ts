/**
 * Media Management Module - Structured Logging Service
 *
 * SERVER-ONLY: This service uses Pino (Node.js logging library) and must not
 * be imported from browser/client code. It will throw if bundled for the browser.
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
  pretty: false,
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
    try {
      const pinoPretty = _require("pino-pretty");
      destination = pinoPretty({
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
        singleLine: false,
      });
    } catch {
      // pino-pretty not available
    }
  }

  return pino(pinoConfig, destination);
}

function stringifyUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  try {
    const json = JSON.stringify(value, (_key, nestedValue) =>
      typeof nestedValue === "bigint" ? nestedValue.toString() : nestedValue
    );
    return json ?? String(value);
  } catch {
    return String(value);
  }
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;

  const normalized = new Error(stringifyUnknown(error));
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.name === "string") normalized.name = record.name;
    if (typeof record.stack === "string") normalized.stack = record.stack;
    if (typeof record.code === "string") {
      (normalized as Error & { code?: string }).code = record.code;
    }
  }
  return normalized;
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

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.logger.debug({ context: this.context, ...metadata }, message);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.logger.info({ context: this.context, ...metadata }, message);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.logger.warn({ context: this.context, ...metadata }, message);
  }

  error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    const errorObj = normalizeError(error);
    this.logger.error(
      {
        context: this.context,
        err: errorObj,
        ...metadata,
      },
      message
    );
  }

  fatal(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void {
    const errorObj = normalizeError(error);
    this.logger.fatal(
      {
        context: this.context,
        err: errorObj,
        ...metadata,
      },
      message
    );
  }

  child(childContext: string, metadata?: Record<string, unknown>): MediaLogger {
    const childLogger = new MediaLogger({
      context: `${this.context}:${childContext}`,
    });

    childLogger.logger = this.logger.child({
      context: childContext,
      ...metadata,
    });

    return childLogger;
  }

  startOperation(operation: string, metadata?: Record<string, unknown>): string {
    const operationId = crypto.randomUUID();
    this.info(`Starting operation: ${operation}`, {
      operationId,
      operation,
      ...metadata,
    });
    return operationId;
  }

  completeOperation(operation: string, operationId: string, metadata?: Record<string, unknown>): void {
    this.info(`Completed operation: ${operation}`, {
      operationId,
      operation,
      ...metadata,
    });
  }

  failOperation(operation: string, operationId: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.error(`Failed operation: ${operation}`, error, {
      operationId,
      operation,
      ...metadata,
    });
  }

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

let defaultLogger: MediaLogger | null = null;

export function getLogger(): MediaLogger {
  if (!defaultLogger) {
    defaultLogger = new MediaLogger();
  }
  return defaultLogger;
}

export function setLogger(logger: MediaLogger): void {
  defaultLogger = logger;
}

export function createLoggerInstance(config?: LoggerConfig): MediaLogger {
  return new MediaLogger(config);
}

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
  const message = `Lifecycle event: ${eventType}`;
  const payload = {
    eventType,
    success,
    ...metadata,
  };

  if (success) {
    logger.info(message, payload);
    return;
  }

  logger.error(message, metadata?.error ?? "Media lifecycle event failed", payload);
}

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
