/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NODE_ENV?: 'development' | 'test' | 'production';
  readonly ENVIRONMENT?: 'local' | 'preview' | 'staging' | 'production';
  readonly APP_URL?: string;
  readonly PUBLIC_API_URL?: string;
  readonly LOG_LEVEL?: string;
  readonly SENTRY_DSN?: string;
  readonly SESSION_COOKIE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
