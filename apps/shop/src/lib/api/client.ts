/**
 * HTTP client — envelope parsing + CSRF double-submit (API_SERVICE_ARCH §9.4).
 * Role-aware sessions arrive via httpOnly cookies; the store only caches the
 * profile, never tokens.
 */
import type {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
} from '@nabome/api-contracts';
import { API_BASE_PATH, COOKIE } from '@nabome/constants';
import { createBrowserLogger } from '@nabome/logging';

import { appConfig } from '../config';

const logger = createBrowserLogger({ service: 'shop-api', level: 'error' });

export const API_URL = `${appConfig.PUBLIC_API_URL}${API_BASE_PATH}`;

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

let memoryCsrfToken: string | null = null;

export function setCsrfToken(token: string | null): void {
  memoryCsrfToken = token;
}

function csrfHeader(): Record<string, string> {
  const token = memoryCsrfToken ?? readCookie(COOKIE.csrfToken);
  return token ? { 'x-csrf-token': token } : {};
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip CSRF header (never use for mutations). */
  skipCsrf?: boolean;
  /** Skip automatic session refresh (used internally by the refresh call). */
  skipRefresh?: boolean;
}

let inflightRefresh: Promise<boolean> | null = null;

const REFRESH_LOCK_KEY = 'nabome:auth:refresh-lock';
const REFRESH_SEQ_KEY = 'nabome:auth:refresh-seq';
const REFRESH_LOCK_TTL_MS = 15000;
const SIBLING_WAIT_MS = 15000;
const SIBLING_POLL_MS = 120;

export function __resetRefreshCoordinatorForTests(): void {
  inflightRefresh = null;
  try {
    localStorage.removeItem(REFRESH_LOCK_KEY);
    localStorage.removeItem(REFRESH_SEQ_KEY);
  } catch {
    // storage unavailable in this environment
  }
}

function tryAcquireCrossTabLock(): string | null {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(REFRESH_LOCK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        owner?: string;
        expiresAt?: number;
      };
      if (parsed.owner && parsed.expiresAt && parsed.expiresAt > now) {
        return null;
      }
    }
    const owner = `${now}:${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(
      REFRESH_LOCK_KEY,
      JSON.stringify({ owner, expiresAt: now + REFRESH_LOCK_TTL_MS }),
    );
    const back = localStorage.getItem(REFRESH_LOCK_KEY);
    if (back && (JSON.parse(back) as { owner?: string }).owner === owner) {
      return owner;
    }
    return null;
  } catch {
    return 'in-memory';
  }
}

function releaseCrossTabLock(owner: string | null): void {
  if (!owner || owner === 'in-memory') return;
  try {
    const raw = localStorage.getItem(REFRESH_LOCK_KEY);
    if (raw && (JSON.parse(raw) as { owner?: string }).owner === owner) {
      localStorage.removeItem(REFRESH_LOCK_KEY);
    }
    localStorage.setItem(REFRESH_SEQ_KEY, String(Date.now()));
  } catch {
    // storage unavailable in this environment
  }
}

async function waitForSiblingRefresh(): Promise<void> {
  const start = Date.now();
  let before = 0;
  try {
    before = Number(localStorage.getItem(REFRESH_SEQ_KEY) ?? 0);
  } catch {
    return;
  }
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, SIBLING_POLL_MS));
    const elapsed = Date.now() - start;
    try {
      const done = Number(localStorage.getItem(REFRESH_SEQ_KEY) ?? 0) > before;
      const raw = localStorage.getItem(REFRESH_LOCK_KEY);
      const locked = raw
        ? ((JSON.parse(raw) as { expiresAt?: number }).expiresAt ?? 0) >
          Date.now()
        : false;
      if (done || !locked || elapsed >= SIBLING_WAIT_MS) return;
    } catch {
      return;
    }
  }
}

async function performRefreshRequest(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...csrfHeader(),
      },
      credentials: 'include',
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<{
      csrfToken?: string;
    }> | null;
    const ok = response.ok && !!payload && payload.success === true;
    if (ok) {
      const token = (payload as ApiSuccessResponse<{ csrfToken?: string }>).data
        ?.csrfToken;
      if (token) setCsrfToken(token);
    }
    return ok;
  } catch {
    return false;
  }
}

export async function coordinatedRefresh(): Promise<boolean> {
  if (inflightRefresh) return inflightRefresh;
  const owner = tryAcquireCrossTabLock();
  if (!owner) {
    await waitForSiblingRefresh();
    return true;
  }
  inflightRefresh = (async () => {
    try {
      return await performRefreshRequest();
    } catch {
      return false;
    } finally {
      releaseCrossTabLock(owner);
      inflightRefresh = null;
    }
  })();
  return inflightRefresh;
}

async function refreshSession(): Promise<boolean> {
  return coordinatedRefresh();
}

export async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    body,
    skipCsrf = false,
    skipRefresh = false,
    headers,
    ...init
  } = options;

  const response = await send(path, body, skipCsrf, headers, init);
  const payload = (await parsePayload(response)) as ApiResponse<T> | null;

  if (response.ok && payload?.success === true) {
    return (payload as ApiSuccessResponse<T>).data;
  }

  const clientError = toClientError(response, payload);
  if (clientError.isSessionExpired && !skipRefresh) {
    const refreshed = await refreshSession();
    if (refreshed) {
      const retry = await send(path, body, skipCsrf, headers, init);
      const retryPayload = (await parsePayload(retry)) as ApiResponse<T> | null;
      if (retry.ok && retryPayload?.success === true) {
        return (retryPayload as ApiSuccessResponse<T>).data;
      }
      throw toClientError(retry, retryPayload, true);
    }
  }
  if (clientError.isSessionExpired) {
    logger.warn('Session expired, signaling listeners', {
      requestId: clientError.requestId,
    });
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
  throw clientError;
}

async function send(
  path: string,
  body: unknown,
  skipCsrf: boolean,
  headers: RequestOptions['headers'],
  init: Omit<RequestInit, 'body' | 'headers'>,
): Promise<Response> {
  const isMutation =
    (init.method ?? (body !== undefined ? 'POST' : 'GET')).toUpperCase() !==
    'GET';
  const finalHeaders: Record<string, string> = {
    ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    ...(isMutation && !skipCsrf ? csrfHeader() : {}),
    ...(headers as Record<string, string> | undefined),
  };

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
}

async function parsePayload(response: Response): Promise<unknown> {
  return response.json().catch(() => null) as Promise<unknown>;
}

function toClientError(
  response: Response,
  payload: unknown,
  retried = false,
): ApiClientError {
  const errorBody = payload as ApiErrorResponse | null;
  const clientError = new ApiClientError({
    status: response.status,
    code: errorBody?.error.code ?? 'INTERNAL_ERROR',
    message: errorBody?.error.message ?? `Request failed (${response.status})`,
    field: errorBody?.error.field,
    details: errorBody?.error.details,
    requestId: errorBody?.meta?.requestId,
  });
  if (retried) {
    logger.warn('Session refresh did not recover request', {
      requestId: clientError.requestId,
    });
  }
  return clientError;
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
