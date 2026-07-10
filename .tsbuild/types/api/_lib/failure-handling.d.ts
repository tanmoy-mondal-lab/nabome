export interface RetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    retryableErrors: string[];
}
export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
}
export interface TimeoutConfig {
    default: number;
    database: number;
    externalApi: number;
    cache: number;
}
export declare enum CircuitState {
    CLOSED = "closed",
    OPEN = "open",
    HALF_OPEN = "half_open"
}
export declare class RetryStrategy {
    private config;
    constructor(config?: Partial<RetryConfig>);
    execute<T>(fn: () => Promise<T>, context?: string): Promise<T>;
    private sleep;
}
export declare class CircuitBreaker {
    private config;
    private state;
    private failureCount;
    private lastFailureTime;
    private successCount;
    constructor(config?: Partial<CircuitBreakerConfig>);
    execute<T>(fn: () => Promise<T>, context?: string): Promise<T>;
    private onSuccess;
    private onFailure;
    getState(): CircuitState;
    getFailureCount(): number;
    reset(): void;
}
export declare class TimeoutHandler {
    private config;
    constructor(config?: Partial<TimeoutConfig>);
    execute<T>(fn: () => Promise<T>, timeout?: number, context?: string): Promise<T>;
    withDatabaseTimeout<T>(fn: () => Promise<T>, context?: string): Promise<T>;
    withExternalApiTimeout<T>(fn: () => Promise<T>, context?: string): Promise<T>;
    withCacheTimeout<T>(fn: () => Promise<T>, context?: string): Promise<T>;
}
export declare class GracefulDegradation {
    private fallbackData;
    setFallback(key: string, data: unknown): void;
    execute<T>(fn: () => Promise<T>, fallbackKey: string, context?: string): Promise<T>;
    executeWithDefault<T>(fn: () => Promise<T>, defaultValue: T, context?: string): Promise<T>;
    hasFallback(key: string): boolean;
    removeFallback(key: string): void;
}
export declare const retryStrategy: RetryStrategy;
export declare const circuitBreaker: CircuitBreaker;
export declare const timeoutHandler: TimeoutHandler;
export declare const gracefulDegradation: GracefulDegradation;
export declare function withFailureHandling<T>(fn: () => Promise<T>, options?: {
    retry?: boolean;
    useCircuitBreaker?: boolean;
    timeout?: number;
    fallbackKey?: string;
    fallbackValue?: T;
    context?: string;
}): Promise<T>;
