import pino from 'pino';

/**
 * Structured JSON logging (TECH_STACK §11.1). Edge-compatible: the default
 * destination writes to stdout (fd 1), which Cloudflare Workers/Pages
 * Functions support. Never log tokens, passwords or PII — sensitive paths
 * are redacted by default.
 */

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerOptions {
  level?: LogLevel;
  /** Request correlation id, propagated to every log line. */
  requestId?: string;
  /** Service name for the `service` field. */
  service?: string;
}

const DEFAULT_REDACT_PATHS = [
  '*.password',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.csrfToken',
  '*.secret',
  '*.key',
  '*.razorpayKeySecret',
  '*.authorization',
  '*.cookie',
  'req.headers.cookie',
  'req.headers.authorization',
];

export function createLogger(options: LoggerOptions = {}) {
  const logger = pino({
    level: options.level ?? 'info',
    base: options.service ? { service: options.service } : undefined,
    redact: {
      paths: DEFAULT_REDACT_PATHS,
      censor: '[REDACTED]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: undefined,
  });

  if (options.requestId) {
    return logger.child({ requestId: options.requestId });
  }
  return logger;
}

export type Logger = ReturnType<typeof createLogger>;
