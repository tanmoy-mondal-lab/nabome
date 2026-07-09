// ─────────────────────────────────────────────────────────────
// SENTRY ERROR MONITORING
// ─────────────────────────────────────────────────────────────
// Production error tracking and performance monitoring
// ─────────────────────────────────────────────────────────────

// Sentry integration - requires @sentry/browser package
// Uncomment when Sentry DSN is configured in production
// import * as Sentry from "@sentry/browser";

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
}

let sentryInitialized = false;

export function initSentry(config: SentryConfig): void {
  if (sentryInitialized || !config.dsn) {
    return;
  }

  // Sentry initialization - uncomment when package is installed
  /*
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    tracesSampleRate: config.tracesSampleRate ?? 0.1,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
  });
  */

  sentryInitialized = true;
}

export function captureException(_error: Error, _context?: Record<string, unknown>): void {
  if (!sentryInitialized) {
    // Silently skip if Sentry not initialized - avoid console in production
    return;
  }

  // Sentry.captureException(error, {
  //   extra: context,
  // });
}

export function captureMessage(_message: string, _level: "info" | "warning" | "error" = "info", _context?: Record<string, unknown>): void {
  if (!sentryInitialized) {
    // Silently skip if Sentry not initialized - avoid console in production
    return;
  }

  // Sentry.captureMessage(message, {
  //   level,
  //   extra: context,
  // });
}

export function setContext(_key: string, _context: Record<string, unknown>): void {
  if (!sentryInitialized) return;
  // Sentry.setContext(key, context);
}

export function setUser(_user: { id: string; email?: string; username?: string }): void {
  if (!sentryInitialized) return;
  // Sentry.setUser(user);
}

export function clearUser(): void {
  if (!sentryInitialized) return;
  // Sentry.setUser(null);
}
