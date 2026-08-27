/**
 * Sentry error monitoring integration for Cloudflare Workers
 * Configures Sentry for error tracking and performance monitoring
 */

import * as Sentry from '@sentry/cloudflare';

let isInitialized = false;

/**
 * Initialize Sentry for error monitoring.
 * For Cloudflare Pages, Sentry is initialized via the pages plugin in middleware.
 * This provides the manual init fallback for non-middleware contexts.
 */
export function initSentry(env: {
  SENTRY_DSN?: string;
  ENVIRONMENT?: string;
}): void {
  if (isInitialized) {
    return;
  }

  if (!env.SENTRY_DSN) {
    console.warn('SENTRY_DSN not configured - error monitoring disabled');
    return;
  }

  // Cloudflare Workers Sentry uses @sentry/cloudflare which doesn't have init().
  // Initialization is handled via sentryPagesPlugin in _middleware.ts.
  // This module provides capture helpers for manual use.
  isInitialized = true;
  console.log('Sentry error monitoring initialized');
}

export function __resetSentryForTest(): void {
  isInitialized = false;
}

/**
 * Capture an exception and send it to Sentry
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>,
): void {
  if (!isInitialized) {
    console.error('Sentry not initialized:', error);
    return;
  }

  try {
    Sentry.captureException(error, {
      extra: context,
    });
  } catch {
    console.error('Failed to capture exception:', error);
  }
}

/**
 * Capture a message and send it to Sentry
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
): void {
  if (!isInitialized) {
    console.log(`[${level.toUpperCase()}] ${message}`);
    return;
  }

  try {
    Sentry.captureMessage(message, { level });
  } catch {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

/**
 * Set user context for Sentry
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  role?: string;
}): void {
  if (!isInitialized) return;

  try {
    Sentry.setUser(user);
  } catch {
    // Silently ignore
  }
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  if (!isInitialized) return;

  try {
    Sentry.setUser(null);
  } catch {
    // Silently ignore
  }
}

/**
 * Add breadcrumb for debugging context
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
): void {
  if (!isInitialized) return;

  try {
    Sentry.addBreadcrumb({
      category,
      message,
      data,
      level: 'info',
    });
  } catch {
    // Silently ignore
  }
}

/**
 * Wrap a function with error tracking
 */
export function withErrorTracking<
  T extends (...args: unknown[]) => Promise<unknown>,
>(fn: T, context?: string): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, { context, args });
      throw error;
    }
  }) as T;
}
