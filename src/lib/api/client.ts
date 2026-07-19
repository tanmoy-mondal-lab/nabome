// ─────────────────────────────────────────────────────────────
// API CLIENT — Base HTTP client with auth token injection
// and automatic 401 → refresh → retry interceptor
// Consumes Zustand auth store as the single source of truth.
// ─────────────────────────────────────────────────────────────
//
// Convention: all path arguments omit the /api prefix.
// Example: api.get('/products') → GET /api/products
// The client adds the /api prefix automatically.

import { useAuthStore } from "../../stores/auth-store";

const BASE_URL = "/api";
const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
  timeout?: number;
}

class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
const MAX_REFRESH_RETRIES = 2;
let refreshRetryCount = 0;

// Self-service auth endpoints that return their own user-facing errors.
// A 401 from these should surface the server's message, not trigger the
// generic "Session expired" logout flow.
const SELF_SERVICE_AUTH = /^\/api\/auth\/(login|register|resend-verification|forgot-password|verify-reset-code|reset-password|change-password|update-me|verify-email|verify|send-verification)(\/|$)/;
function isAuthSelfServiceEndpoint(endpoint: string): boolean {
  return SELF_SERVICE_AUTH.test(endpoint);
}

// Read the CSRF double-submit token from the cookie jar so it can be sent as
// the X-CSRF-Token header on state-changing requests.
function readCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("csrf_token="));
  return match ? match.split("=")[1] ?? null : null;
}

async function attemptTokenRefresh(): Promise<boolean> {
  // Security: Tokens are in httpOnly cookies, no need to send them
  // The server reads refresh token from cookie
  const csrfToken = readCsrfToken();

  const doRefresh = async (): Promise<Response | null> => {
    try {
      return await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The refresh endpoint requires CSRF protection (it is not exempt),
          // so the token must be included here just like a normal request.
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
      });
    } catch {
      return null;
    }
  };

  let res = await doRefresh();

  // 401 from the refresh endpoint can be a genuine session expiry OR a race
  // condition where a concurrent proactive refresh rotated the session
  // milliseconds before us — the old refresh token's session was revoked,
  // but the new cookies might already be on their way to the browser.
  // Retry once after a short delay so any in-flight refresh response can
  // update the cookies before we conclude the session is dead.
  if (res?.status === 401) {
    await new Promise((r) => setTimeout(r, 300));
    res = await doRefresh();
  }

  // Genuine authentication failure: the refresh token is invalid, revoked,
  // or expired. The session is truly over — log the user out.
  if (res?.status === 401) {
    await fireLogout();
    return false;
  }

  // Any other non-2xx response (5xx, 502/503/504 gateway errors, 429 rate
  // limit, a transient Cloudflare/DB/Supabase blip, or a momentary network
  // failure, or a network error) is NOT a reason to log the user out.
  // Return false so the original request fails gracefully; the user keeps
  // their session and the next request can retry the refresh once the
  // hiccup is over.
  if (!res || !res.ok) {
    return false;
  }

  // Server sets new cookies automatically, no need to update store
  return true;
}

function getAuthStateFromStore(): { isAuthenticated: boolean } {
  try {
    const state = useAuthStore.getState();
    return { isAuthenticated: state.isAuthenticated };
  } catch {
    return { isAuthenticated: false };
  }
}

function fireLogout(): void {
  try {
    useAuthStore.getState().clearAuth();
  } catch {
    // Store not available
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const cleanEndpoint = endpoint.startsWith("/api") ? endpoint : `${BASE_URL}${endpoint}`;
  const url = new URL(cleanEndpoint, typeof window !== "undefined" ? window.location.origin : "http://localhost");
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = new Headers(
    (fetchOptions.headers as Record<string, string>) ?? {}
  );

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Security: No Authorization header needed - tokens are in httpOnly cookies
  // CSRF token from cookie for state-changing methods
  const method = (fetchOptions.method ?? "GET").toUpperCase();
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    await ensureCsrfToken();
    if (typeof document !== "undefined") {
      const csrfCookie = document.cookie
        .split("; ")
        .find((c) => c.startsWith("csrf_token="));
      if (csrfCookie) {
        headers.set("X-CSRF-Token", csrfCookie.split("=")[1]);
      }
    }
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeout);
  const combinedSignal = options.signal
    ? combineAbortSignals(options.signal, abortController.signal)
    : abortController.signal;

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
    signal: combinedSignal,
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  }).finally(() => clearTimeout(timeoutId));

  if (response.status === 401) {
    // Self-service auth endpoints (login, register, password reset, email
    // verification, etc.) return their own user-facing errors from the server
    // (e.g. "Invalid email or password", "Please verify your email…"). Do not
    // hijack those with a generic "Session expired" message or force a logout.
    if (!isAuthSelfServiceEndpoint(cleanEndpoint)) {
      const { isAuthenticated } = await getAuthStateFromStore();
      if (!isAuthenticated) {
        await fireLogout();
        throw new ApiError("Session expired — please log in again", 401);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = attemptTokenRefresh();
      }

      const refreshed = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (refreshed) {
        refreshRetryCount = 0;
        const retryController = new AbortController();
        const retryResponse = await fetch(url.toString(), {
          ...fetchOptions,
          headers,
          signal: retryController.signal,
          body:
            body instanceof FormData
              ? body
              : body !== undefined
                ? JSON.stringify(body)
                : undefined,
        });

        if (retryResponse.status === 204) {
          return null as T;
        }

        if (!retryResponse.ok) {
          if (retryResponse.status === 401 && refreshRetryCount < MAX_REFRESH_RETRIES) {
            refreshRetryCount++;
            return request<T>(endpoint, { ...options, body, params });
          }
          const retryData = await retryResponse.json().catch(() => ({}));
          throw new ApiError(
            retryData.error?.message ??
              `Request failed with status ${retryResponse.status}`,
            retryResponse.status,
            retryData.details
          );
        }
        const retryData = await retryResponse.json();
        return retryData.data ?? retryData;
      }

      refreshRetryCount = 0;
      // If the refresh genuinely failed due to an invalid session,
      // attemptTokenRefresh has already fired the logout above. For transient
      // failures (5xx / network / rate limit) we must NOT log the user out —
      // just surface the error so this single request fails.
      throw new ApiError("Session expired — please log in again", 401);
    }
  }

  if (response.status === 204) {
    return null as T;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(
      data.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      data.details
    );
  }

  const data = await response.json();
  return data.data ?? data;
}

// Ensure CSRF token is available by making an initial GET request
let csrfInitialized = false;
async function ensureCsrfToken(): Promise<void> {
  if (csrfInitialized) return;
  try {
    if (typeof window === "undefined") return;
    await fetch(`${BASE_URL}/health`, { method: "GET" });
    csrfInitialized = true;
  } catch (error) {
    // If health check fails, we'll try again on the next request
    if (import.meta.env.DEV) {
      console.warn("CSRF token initialization failed:", error);
    }
  }
}

// Combine multiple AbortSignals into one
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  }
  return controller.signal;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),
};

export { ApiError };
export type { RequestOptions };
