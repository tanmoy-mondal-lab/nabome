import { parseClientEnv } from '@nabome/config';

const env = import.meta.env as Record<string, string | undefined>;

const source = {
  NODE_ENV: env.VITE_NODE_ENV ?? env.NODE_ENV,
  ENVIRONMENT: env.VITE_ENVIRONMENT ?? env.ENVIRONMENT,
  APP_URL: env.VITE_APP_URL,
  PUBLIC_API_URL: env.VITE_PUBLIC_API_URL,
  LOG_LEVEL: env.VITE_LOG_LEVEL ?? env.LOG_LEVEL,
  SESSION_COOKIE_NAME: env.VITE_SESSION_COOKIE_NAME ?? env.SESSION_COOKIE_NAME,
  VITE_TURNSTILE_SITE_KEY: env.VITE_TURNSTILE_SITE_KEY,
};

export const appConfig = parseClientEnv(source);
