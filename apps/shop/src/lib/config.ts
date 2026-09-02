import { parseClientEnv } from '@nabome/config';

const env = import.meta.env as Record<string, string | undefined>;

const PRODUCTION_API_URL = 'https://nabome-api.pages.dev';
function resolvePublicApiUrl(): string | undefined {
  if (env.VITE_PUBLIC_API_URL) return env.VITE_PUBLIC_API_URL;
  if (
    env.VITE_ENVIRONMENT === 'production' ||
    env.VITE_ENVIRONMENT === 'preview'
  )
    return PRODUCTION_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.endsWith('nabome.online') || host.endsWith('.pages.dev')) {
      return PRODUCTION_API_URL;
    }
  }
  return undefined;
}
const source = {
  NODE_ENV: env.VITE_NODE_ENV ?? env.NODE_ENV,
  ENVIRONMENT: env.VITE_ENVIRONMENT ?? env.ENVIRONMENT,
  APP_URL: env.VITE_APP_URL,
  PUBLIC_API_URL: resolvePublicApiUrl(),
  LOG_LEVEL: env.VITE_LOG_LEVEL ?? env.LOG_LEVEL,
  SESSION_COOKIE_NAME: env.VITE_SESSION_COOKIE_NAME ?? env.SESSION_COOKIE_NAME,
  VITE_TURNSTILE_SITE_KEY: env.VITE_TURNSTILE_SITE_KEY,
};

export const appConfig = parseClientEnv(source);
