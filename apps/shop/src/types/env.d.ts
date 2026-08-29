/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NODE_ENV?: 'development' | 'test' | 'production';
  readonly ENVIRONMENT?: 'local' | 'preview' | 'staging' | 'production';
  readonly APP_URL?: string;
  readonly PUBLIC_API_URL?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_PUBLIC_API_URL?: string;
  readonly LOG_LEVEL?: string;
  readonly VITE_LOG_LEVEL?: string;
  readonly SENTRY_DSN?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly SESSION_COOKIE_NAME?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
