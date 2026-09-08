import type { Hyperdrive, KVNamespace } from '@cloudflare/workers-types';

/**
 * Cloudflare binding environment (wrangler.jsonc + dashboard secrets).
 * Bindings stay optional where the feature can degrade gracefully; secrets
 * arrive as plain strings from `.dev.vars` / dashboard.
 */
export interface Env {
  ENVIRONMENT: 'local' | 'preview' | 'staging' | 'production';
  DATABASE_URL?: string;
  HYPERDRIVE_URL?: string;
  PUBLIC_API_URL: string;
  APP_URL: string;
  CORS_ORIGINS?: string;
  LOG_LEVEL?: string;
  SESSION_COOKIE_NAME: string;
  CSRF_SECRET: string;
  CSRF_COOKIE_NAME?: string;
  JWT_SECRET: string;
  JWT_ISSUER?: string;
  JWT_AUDIENCE?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  /** Payment gateway provider selection (local/preview default: mock). */
  PAYMENT_PROVIDER?: string;
  /** Finance configuration defaults (FINANCE §6, ML-04/05). */
  FINANCE_COMMISSION_RATE?: string;
  FINANCE_COMMISSION_CAP?: string;
  FINANCE_HOLD_DAYS?: string;
  FINANCE_SETTLEMENT_MIN?: string;
  COD_ENABLED?: string;
  COD_MAX_AMOUNT?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_BYPASS_SECRET?: string;
  WEBHOOK_SECRET?: string;
  SETTLEMENT_CRON_SECRET?: string;
  STORAGE_ENDPOINT?: string;
  STORAGE_REGION?: string;
  STORAGE_BUCKET?: string;
  STORAGE_ACCESS_KEY_ID?: string;
  STORAGE_SECRET_ACCESS_KEY?: string;
  STORAGE_PUBLIC_URL?: string;
  /** Bindings (wrangler.jsonc). */
  KV?: KVNamespace;
  HYPERDRIVE?: Hyperdrive;
}
