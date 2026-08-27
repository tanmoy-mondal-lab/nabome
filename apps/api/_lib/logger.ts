/**
 * Edge logger — pino on workerd with request-id binding
 * (API_SERVICE_ARCHITECTURE §10.5, TECH_STACK §11.2).
 */
import { createLogger, type LogLevel } from '@nabome/logging';

import type { Env } from './env.ts';

export type Logger = ReturnType<typeof createLogger>;

const LOG_LEVELS: readonly LogLevel[] = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
];

export function getLogger(env: Env): Logger {
  const requested = env.LOG_LEVEL ?? 'info';
  const level: LogLevel = LOG_LEVELS.includes(requested as LogLevel)
    ? (requested as LogLevel)
    : 'info';
  return createLogger({
    level,
  });
}

/** Child logger with the request id bound for correlation. */
export function withRequestId(logger: Logger, requestId: string): Logger {
  return logger.child({ requestId });
}
