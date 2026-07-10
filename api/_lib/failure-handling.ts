// ─────────────────────────────────────────────────────────────
// FAILURE HANDLING ARCHITECTURE
// ─────────────────────────────────────────────────────────────
// Retry strategy, circuit breaker, graceful degradation, fallback UI, timeouts
// ─────────────────────────────────────────────────────────────

import { logger } from "./logger";

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

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export class RetryStrategy {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      initialDelay: config.initialDelay ?? 1000,
      maxDelay: config.maxDelay ?? 10000,
      backoffMultiplier: config.backoffMultiplier ?? 2,
      retryableErrors: config.retryableErrors ?? [
        'ETIMEDOUT',
        'ECONNRESET',
        'ECONNREFUSED',
        'ENOTFOUND',
        'EAI_AGAIN',
        'timeout',
        'network',
      ],
    };
  }

  async execute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: Error | null = null;
    let delay = this.config.initialDelay;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          logger.info(`Retry attempt ${attempt}/${this.config.maxRetries}`, { context, delay });
          await this.sleep(delay);
          delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelay);
        }

        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        const isRetryable = this.config.retryableErrors.some(pattern =>
          lastError!.message.toLowerCase().includes(pattern.toLowerCase()) ||
          lastError!.name.toLowerCase().includes(pattern.toLowerCase())
        );

        if (!isRetryable || attempt === this.config.maxRetries) {
          logger.error(`Operation failed after ${attempt + 1} attempts`, {
            context,
            error: lastError.message,
          });
          throw lastError;
        }

        logger.warn(`Operation failed, retrying`, {
          context,
          attempt: attempt + 1,
          error: lastError.message,
        });
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      resetTimeout: config.resetTimeout ?? 60000,
      monitoringPeriod: config.monitoringPeriod ?? 10000,
    };
  }

  async execute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        logger.info('Circuit breaker entering half-open state', { context });
      } else {
        logger.warn('Circuit breaker is open, rejecting request', { context });
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess(context);
      return result;
    } catch (error) {
      this.onFailure(context);
      throw error;
    }
  }

  private onSuccess(context?: string): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        logger.info('Circuit breaker reset to closed state', { context });
      }
    } else {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  private onFailure(context?: string): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      logger.error('Circuit breaker opened', {
        context,
        failureCount: this.failureCount,
      });
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.successCount = 0;
    logger.info('Circuit breaker reset');
  }
}

export class TimeoutHandler {
  private config: TimeoutConfig;

  constructor(config: Partial<TimeoutConfig> = {}) {
    this.config = {
      default: config.default ?? 5000,
      database: config.database ?? 3000,
      externalApi: config.externalApi ?? 10000,
      cache: config.cache ?? 1000,
    };
  }

  async execute<T>(
    fn: () => Promise<T>,
    timeout?: number,
    context?: string
  ): Promise<T> {
    const timeoutMs = timeout ?? this.config.default;
    
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => {
          logger.error('Operation timed out', { context, timeout: timeoutMs });
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs)
      ),
    ]);
  }

  withDatabaseTimeout<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    return this.execute(fn, this.config.database, context);
  }

  withExternalApiTimeout<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    return this.execute(fn, this.config.externalApi, context);
  }

  withCacheTimeout<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    return this.execute(fn, this.config.cache, context);
  }
}

export class GracefulDegradation {
  private fallbackData: Map<string, unknown> = new Map();

  setFallback(key: string, data: unknown): void {
    this.fallbackData.set(key, data);
    logger.debug('Fallback data set', { key });
  }

  async execute<T>(
    fn: () => Promise<T>,
    fallbackKey: string,
    context?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      logger.warn('Primary operation failed, using fallback', {
        context,
        fallbackKey,
        error: error instanceof Error ? error.message : String(error),
      });

      const fallback = this.fallbackData.get(fallbackKey);
      if (fallback !== undefined) {
        return fallback as T;
      }

      throw error;
    }
  }

  async executeWithDefault<T>(
    fn: () => Promise<T>,
    defaultValue: T,
    context?: string
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      logger.warn('Primary operation failed, using default value', {
        context,
        error: error instanceof Error ? error.message : String(error),
      });
      return defaultValue;
    }
  }

  hasFallback(key: string): boolean {
    return this.fallbackData.has(key);
  }

  removeFallback(key: string): void {
    this.fallbackData.delete(key);
    logger.debug('Fallback data removed', { key });
  }
}

// Global instances
export const retryStrategy = new RetryStrategy();
export const circuitBreaker = new CircuitBreaker();
export const timeoutHandler = new TimeoutHandler();
export const gracefulDegradation = new GracefulDegradation();

// Combined failure handling utility
export async function withFailureHandling<T>(
  fn: () => Promise<T>,
  options: {
    retry?: boolean;
    useCircuitBreaker?: boolean;
    timeout?: number;
    fallbackKey?: string;
    fallbackValue?: T;
    context?: string;
  } = {}
): Promise<T> {
  const { retry = true, useCircuitBreaker = true, timeout, fallbackKey, fallbackValue, context } = options;

  let operation: () => Promise<T> = fn;

  // Add retry
  if (retry) {
    const originalOp = operation;
    operation = () => retryStrategy.execute(originalOp, context);
  }

  // Add circuit breaker
  if (useCircuitBreaker) {
    const originalOp = operation;
    operation = () => circuitBreaker.execute(originalOp, context);
  }

  // Add timeout
  if (timeout) {
    const originalOp = operation;
    operation = () => timeoutHandler.execute(originalOp, timeout, context);
  }

  // Add fallback
  if (fallbackKey) {
    const originalOp = operation;
    operation = () => gracefulDegradation.execute(originalOp, fallbackKey, context);
  } else if (fallbackValue !== undefined) {
    const originalOp = operation;
    operation = () => gracefulDegradation.executeWithDefault(originalOp, fallbackValue, context);
  }

  return operation();
}
