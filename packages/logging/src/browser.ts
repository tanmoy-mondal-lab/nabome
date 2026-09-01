import type { LogLevel, LoggerOptions } from './logger.ts';

export type { Logger } from './logger.ts';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

/**
 * Browser-safe structured logger (frontends never use raw `console.log` —
 * ESLint `no-console` rule; use this instead). Forwards structured records
 * to the browser console and to optional sinks.
 */
export interface LogSink {
  (level: LogLevel, record: Record<string, unknown>): void;
}

export interface BrowserLogger {
  fatal: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  debug: (message: string, context?: Record<string, unknown>) => void;
  trace: (message: string, context?: Record<string, unknown>) => void;
  /** Derive a logger with extra static bindings (e.g. { feature: 'cart' }). */
  child: (bindings: Record<string, unknown>) => BrowserLogger;
}

interface InternalLoggerOptions {
  level?: LogLevel;
  bindings: Record<string, unknown>;
  sinks: LogSink[];
}

export function createBrowserLogger(
  options: LoggerOptions = {},
  sinks: LogSink[] = [],
): BrowserLogger {
  return createBrowserLoggerWith({
    level: options.level ?? 'info',
    bindings: {
      ...(options.requestId ? { requestId: options.requestId } : {}),
      ...(options.service ? { service: options.service } : {}),
    },
    sinks,
  });
}

function createBrowserLoggerWith(
  internal: InternalLoggerOptions,
): BrowserLogger {
  const emit = (
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ) => {
    if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[internal.level ?? 'info']) {
      return;
    }
    const record: Record<string, unknown> = {
      level,
      message,
      ...internal.bindings,
      ...context,
    };
    for (const sink of internal.sinks) {
      sink(level, record);
    }
    // This module IS the console sink — console is the output, not a lint error.
    /* eslint-disable no-console */
    const consoleMethod =
      (console as Partial<Record<LogLevel, typeof console.log>>)[level] ??
      console.log;
    consoleMethod(message, record);
    /* eslint-enable no-console */
  };

  return {
    fatal: (m, c) => emit('fatal', m, c),
    error: (m, c) => emit('error', m, c),
    warn: (m, c) => emit('warn', m, c),
    info: (m, c) => emit('info', m, c),
    debug: (m, c) => emit('debug', m, c),
    trace: (m, c) => emit('trace', m, c),
    child: (bindings) =>
      createBrowserLoggerWith({
        ...internal,
        bindings: { ...internal.bindings, ...bindings },
      }),
  };
}
