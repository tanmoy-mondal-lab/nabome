/**
 * Sentry error monitoring integration for React frontend
 * Configures Sentry for error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';
import { browserTracingIntegration } from '@sentry/react';

let isInitialized = false;

/**
 * Initialize Sentry for error monitoring
 * Should be called once during application startup
 */
export function initSentry(): void {
  if (isInitialized) {
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_ENVIRONMENT || 'development';

  if (!dsn) {
    console.warn('SENTRY_DSN not configured - error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [browserTracingIntegration()],
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    // Session replay for debugging
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
    // Filter out development errors
    beforeSend(event, hint) {
      if (environment === 'development') {
        console.error('Sentry error:', hint.originalException);
        return null; // Don't send in development
      }
      return event;
    },
  });

  isInitialized = true;
  console.log('Sentry error monitoring initialized');
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

  Sentry.captureException(error, {
    extra: context,
  });
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

  Sentry.captureMessage(message, { level });
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

  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  if (!isInitialized) return;

  Sentry.setUser(null);
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

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: 'info',
  });
}
