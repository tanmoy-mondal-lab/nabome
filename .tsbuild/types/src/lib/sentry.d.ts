export declare function initSentry(): void;
export declare function captureException(error: Error, context?: Record<string, unknown>): void;
export declare function captureMessage(message: string, level?: "info" | "warning" | "error", context?: Record<string, unknown>): void;
export declare function setSentryUser(user: {
    id: string;
    email?: string;
}): void;
export declare function clearSentryUser(): void;
