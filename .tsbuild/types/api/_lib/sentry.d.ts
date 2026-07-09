export interface SentryConfig {
    dsn: string;
    environment: string;
    release?: string;
    tracesSampleRate?: number;
}
export declare function initSentry(config: SentryConfig): void;
export declare function captureException(_error: Error, _context?: Record<string, unknown>): void;
export declare function captureMessage(_message: string, _level?: "info" | "warning" | "error", _context?: Record<string, unknown>): void;
export declare function setContext(_key: string, _context: Record<string, unknown>): void;
export declare function setUser(_user: {
    id: string;
    email?: string;
    username?: string;
}): void;
export declare function clearUser(): void;
