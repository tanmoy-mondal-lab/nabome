// ─────────────────────────────────────────────────────────────
// API LOGGING UTILITY
// ─────────────────────────────────────────────────────────────
// Structured logging for API requests and responses
// ─────────────────────────────────────────────────────────────

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  status?: number;
  duration?: number;
  message: string;
  metadata?: Record<string, unknown>;
}

export class ApiLogger {
  private minLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor(minLevel: LogLevel = LogLevel.INFO) {
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private log(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    // Add to in-memory logs (with rotation)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output based on level
    const message = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
    const metadata = {
      ...entry.metadata,
      requestId: entry.requestId,
      userId: entry.userId,
      method: entry.method,
      path: entry.path,
      status: entry.status,
      duration: entry.duration,
    };

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, metadata);
        break;
      case LogLevel.INFO:
        console.info(message, metadata);
        break;
      case LogLevel.WARN:
        console.warn(message, metadata);
        break;
      case LogLevel.ERROR:
        console.error(message, metadata);
        break;
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      message,
      metadata,
    });
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      message,
      metadata,
    });
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      message,
      metadata,
    });
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      metadata,
    });
  }

  logRequest(
    requestId: string,
    method: string,
    path: string,
    userId?: string
  ): void {
    this.info("API request received", {
      requestId,
      method,
      path,
      userId,
    });
  }

  logResponse(
    requestId: string,
    method: string,
    path: string,
    status: number,
    duration: number,
    userId?: string
  ): void {
    const level = status >= 500 ? LogLevel.ERROR : status >= 400 ? LogLevel.WARN : LogLevel.INFO;
    this.log({
      timestamp: new Date().toISOString(),
      level,
      requestId,
      userId,
      method,
      path,
      status,
      duration,
      message: `API response: ${status} (${duration}ms)`,
    });
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

// Global logger instance
export const logger = new ApiLogger(LogLevel.INFO);
