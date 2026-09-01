import { z } from 'zod';

/**
 * Environment variable schemas — one per application. All values are read
 * from the runtime environment at startup and validated (TECH_STACK §14.4:
 * "All env vars must be validated at startup with Zod"). Configuration stays
 * environment-independent: these schemas only describe/validate sources.
 */

const logLevelSchema = z
  .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
  .default('info');

export const environmentSchema = z
  .enum(['local', 'preview', 'staging', 'production'])
  .default('local');

/** Variables shared by every application. */
export const sharedEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  ENVIRONMENT: environmentSchema,
  APP_URL: z.string().url().default('http://localhost:5173'),
  PUBLIC_API_URL: z.string().url().default('http://localhost:8788'),
  LOG_LEVEL: logLevelSchema,
  SESSION_COOKIE_NAME: z.string().min(1).default('nabome_session'),
  VITE_TURNSTILE_SITE_KEY: z.string().optional().or(z.literal('')),
});

export type SharedEnv = z.infer<typeof sharedEnvSchema>;

/** Backend API (Cloudflare Pages Functions) environment. */
export const apiEnvSchema = sharedEnvSchema.extend({
  DATABASE_URL: z.string().url(),
  HYPERDRIVE_URL: z.string().optional().or(z.literal('')),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  RAZORPAY_KEY_ID: z.string().min(1).optional().or(z.literal('')),
  RAZORPAY_KEY_SECRET: z.string().min(1).optional().or(z.literal('')),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).optional().or(z.literal('')),
  RESEND_API_KEY: z.string().min(1).optional().or(z.literal('')),
  RESEND_FROM_EMAIL: z.string().email().default('noreply@nabome.online'),
  STORAGE_ENDPOINT: z.string().url().optional().or(z.literal('')),
  STORAGE_REGION: z.string().min(1).optional().or(z.literal('')),
  STORAGE_BUCKET: z.string().min(1).optional().or(z.literal('')),
  STORAGE_ACCESS_KEY_ID: z.string().min(1).optional().or(z.literal('')),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1).optional().or(z.literal('')),
  STORAGE_PUBLIC_URL: z.string().url().optional().or(z.literal('')),
  TURNSTILE_SECRET_KEY: z.string().optional().or(z.literal('')),
  WEBHOOK_SECRET: z.string().optional().or(z.literal('')),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  CSRF_SECRET: z.string().min(16, 'CSRF_SECRET must be at least 16 characters'),
  FINANCE_COMMISSION_RATE: z.string().optional().or(z.literal('')),
  FINANCE_COMMISSION_CAP: z.string().optional().or(z.literal('')),
  FINANCE_HOLD_DAYS: z.string().optional().or(z.literal('')),
  FINANCE_SETTLEMENT_MIN: z.string().optional().or(z.literal('')),
  COD_ENABLED: z.string().optional().or(z.literal('')),
  COD_MAX_AMOUNT: z.string().optional().or(z.literal('')),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

/** Public client environment (Customer Website, Admin Dashboard, Shop). */
export const clientEnvSchema = sharedEnvSchema;

export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Parse and validate a raw env source. Throws a descriptive error listing
 * every missing/invalid variable at startup.
 */
export function parseEnv<T extends z.ZodType>(
  schema: T,
  source: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

/** Validate a browser `import.meta.env` source for client apps. */
export function parseClientEnv(
  source: Record<string, string | undefined>,
): ClientEnv {
  return parseEnv(clientEnvSchema, source);
}
