/**
 * Retry utilities for resilient operations
 */

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry an async operation with exponential backoff
 * @param operation - The async operation to retry
 * @param options - Retry configuration
 * @returns Result of the operation
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      await sleep(currentDelay);
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError!;
}

/**
 * Sleep for a specified duration
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with specific error types
 * @param operation - The async operation to retry
 * @param retryableErrors - Error types/messages that are retryable
 * @param options - Retry configuration
 * @returns Result of the operation
 */
export async function retryOnError<T>(
  operation: () => Promise<T>,
  retryableErrors: string[],
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      const isRetryable = retryableErrors.some(retryable =>
        lastError.message.includes(retryable)
      );

      if (!isRetryable || attempt === maxAttempts) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      await sleep(currentDelay);
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError!;
}
