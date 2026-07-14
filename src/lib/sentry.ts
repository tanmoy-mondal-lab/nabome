// ─────────────────────────────────────────────────────────────
// SENTRY CLIENT-SIDE INITIALIZATION
// ─────────────────────────────────────────────────────────────
// Initializes Sentry for browser-side error tracking.
// DSN is read from VITE_SENTRY_DSN env var. If not set, Sentry is a no-op.
// ─────────────────────────────────────────────────────────────

import * as Sentry from "@sentry/react";

let initialized = false;

export function initSentry(): void {
  if (initialized) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || "development",
    release: import.meta.env.VITE_APP_VERSION || "unknown",
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.01 : 0.5,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }
      return event;
    },
  });

  initialized = true;
}

export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (!initialized) return;
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>
): void {
  if (!initialized) return;
  Sentry.captureMessage(message, { level, extra: context });
}

export function setSentryUser(user: { id: string; email?: string }): void {
  if (!initialized) return;
  Sentry.setUser(user);
}

export function clearSentryUser(): void {
  if (!initialized) return;
  Sentry.setUser(null);
}
