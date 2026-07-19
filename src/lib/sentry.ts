// ─────────────────────────────────────────────────────────────
// SENTRY CLIENT-SIDE INITIALIZATION
// ─────────────────────────────────────────────────────────────
// Initializes Sentry for browser-side error tracking.
// DSN is read from VITE_SENTRY_DSN env var. If not set, Sentry is a no-op.
// @sentry/react is an optional dependency — if not installed, all calls are no-ops.
// ─────────────────────────────────────────────────────────────

type SentryInstance = {
  init: (opts: Record<string, unknown>) => void;
  captureException: (error: Error, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, opts?: Record<string, unknown>) => void;
  setUser: (user: { id: string; email?: string } | null) => void;
  browserTracingIntegration?: () => Record<string, unknown>;
  replayIntegration?: (opts?: Record<string, unknown>) => Record<string, unknown>;
};

let Sentry: SentryInstance | null = null;

// Dynamic import to avoid hard dependency at build time
const SENTRY_MODULE = "@sentry/react" as string;

try {
  const mod = await import(/* @vite-ignore */ SENTRY_MODULE);
  Sentry = mod as unknown as SentryInstance;
} catch {
  // @sentry/react not installed — Sentry is a no-op
}

let initialized = false;

export function initSentry(): void {
  if (initialized || !Sentry) return;

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
      Sentry.browserTracingIntegration?.(),
      Sentry.replayIntegration?.({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ].filter(Boolean),
    beforeSend(event: { request?: { cookies?: unknown; headers?: unknown } }) {
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
  if (!initialized || !Sentry) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: Record<string, unknown>
): void {
  if (!initialized || !Sentry) return;
  Sentry.captureMessage(message, { level, extra: context });
}

export function setSentryUser(user: { id: string; email?: string }): void {
  if (!initialized || !Sentry) return;
  Sentry.setUser(user);
}

export function clearSentryUser(): void {
  if (!initialized || !Sentry) return;
  Sentry.setUser(null);
}
