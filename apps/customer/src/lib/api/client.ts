/**
 * HTTP client — fetch wrapper with envelope parsing, CSRF double-submit and
 * session-expiry signaling (API_SERVICE_ARCHITECTURE §9.4, SEC §3.3).
 */
import type { ApiErrorResponse, ApiResponse } from '@nabome/api-contracts';
import { API_BASE_PATH, COOKIE } from '@nabome/constants';
import { createBrowserLogger } from '@nabome/logging';

import { appConfig } from '../config';

const logger = createBrowserLogger({ service: 'customer-api', level: 'error' });

export const API_URL = `${appConfig.PUBLIC_API_URL}${API_BASE_PATH}`;

/** Dispatched when the session is expired/unauthorized (401). */
export const SESSION_EXPIRED_EVENT = 'nabome:session-expired';

export interface ApiClientErrorOptions {
  status: number;
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly field?: string;
  readonly details?: Record<string, unknown>;
  readonly requestId?: string;

  constructor(options: ApiClientErrorOptions) {
    super(options.message);
    this.name = 'ApiClientError';
    this.status = options.status;
    this.code = options.code;
    this.field = options.field;
    this.details = options.details;
    this.requestId = options.requestId;
  }

  get isSessionExpired(): boolean {
    return (
      this.status === 401 &&
      (this.code === 'AUTH_REQUIRED' ||
        this.code === 'UNAUTHORIZED' ||
        this.code === 'SESSION_EXPIRED')
    );
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(
    new RegExp(
      `(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`,
    ),
  );
  return match ? decodeURIComponent(match[1] ?? '') : null;
}

function csrfHeader(): Record<string, string> {
  const token = readCookie(COOKIE.csrfToken);
  return token ? { 'x-csrf-token': token } : {};
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip CSRF header (never use for mutations). */
  skipCsrf?: boolean;
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipCsrf = false, headers, ...init } = options;

  const isMutation =
    (init.method ?? (body !== undefined ? 'POST' : 'GET')).toUpperCase() !==
    'GET';
  const finalHeaders: Record<string, string> = {
    ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    ...(isMutation && !skipCsrf ? csrfHeader() : {}),
    ...(headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload || payload.success !== true) {
    const errorBody = payload as ApiErrorResponse | null;
    const clientError = new ApiClientError({
      status: response.status,
      code: errorBody?.error.code ?? 'INTERNAL_ERROR',
      message:
        errorBody?.error.message ?? `Request failed (${response.status})`,
      field: errorBody?.error.field,
      details: errorBody?.error.details,
      requestId: errorBody?.meta?.requestId,
    });
    if (clientError.isSessionExpired) {
      logger.warn('Session expired, signaling listeners', {
        requestId: clientError.requestId,
      });
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
    }
    throw clientError;
  }

  return payload.data;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  del: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
