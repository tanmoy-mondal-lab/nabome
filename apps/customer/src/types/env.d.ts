/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NODE_ENV?: 'development' | 'test' | 'production';
  readonly ENVIRONMENT?: 'local' | 'preview' | 'staging' | 'production';
  readonly APP_URL?: string;
  readonly PUBLIC_API_URL?: string;
  readonly LOG_LEVEL?: string;
  readonly SENTRY_DSN?: string;
  readonly SESSION_COOKIE_NAME?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Turnstile {
  render: (
    container: string | HTMLElement,
    params: {
      sitekey: string;
      callback: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
      theme?: 'light' | 'dark' | 'auto';
      language?: string;
      tabindex?: number;
      'response-field-name'?: string;
      size?: 'normal' | 'compact';
      retry?: 'auto' | 'never';
      'retry-interval'?: number;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}
