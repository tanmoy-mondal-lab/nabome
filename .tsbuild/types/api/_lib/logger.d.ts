export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error"
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
export declare class ApiLogger {
    private minLevel;
    private logs;
    private maxLogs;
    constructor(minLevel?: LogLevel);
    private shouldLog;
    private log;
    debug(message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    error(message: string, metadata?: Record<string, unknown>): void;
    logRequest(requestId: string, method: string, path: string, userId?: string): void;
    logResponse(requestId: string, method: string, path: string, status: number, duration: number, userId?: string): void;
    getLogs(level?: LogLevel): LogEntry[];
    clearLogs(): void;
}
export declare const logger: ApiLogger;
