/**
 * CORS + security headers (SEC §3.2, API_SERVICE_ARCHITECTURE §10.2).
 * CORS origins come from CORS_ORIGINS (comma-separated) — never '*'.
 */
import type { Env } from './env.ts';

export const SECURITY_HEADERS: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
};

const DEFAULT_ALLOWED_ORIGINS = [
  'https://nabome.online',
  'https://www.nabome.online',
  'https://nabome.pages.dev',
  'https://staging.nabome.online',
  'https://staging-admin.nabome.online',
  'https://staging-shop.nabome.online',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

export function allowedOrigins(env: Env): string[] {
  const fromEnv = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (fromEnv.length > 0) return fromEnv;
  return DEFAULT_ALLOWED_ORIGINS;
}

export function resolveOrigin(env: Env, request: Request): string | null {
  const origin = request.headers.get('origin');
  if (!origin) {
    return null;
  }
  const allowed = allowedOrigins(env);
  if (allowed.includes(origin)) {
    return origin;
  }
  return null;
}

export function applyCors(headers: Headers, env: Env, request: Request): void {
  const origin = resolveOrigin(env, request);
  if (origin) {
    headers.set('access-control-allow-origin', origin);
    headers.set('vary', 'Origin');
    headers.set('access-control-allow-credentials', 'true');
    headers.set(
      'access-control-allow-methods',
      'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    );
    headers.set(
      'access-control-allow-headers',
      'content-type, x-csrf-token, x-request-id',
    );
    headers.set('access-control-max-age', '86400');
  }
}

export function applySecurityHeaders(headers: Headers): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
}

export function isPreflight(request: Request): boolean {
  return request.method === 'OPTIONS';
}
