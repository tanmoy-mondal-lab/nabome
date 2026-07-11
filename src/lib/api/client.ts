// ─────────────────────────────────────────────────────────────
// API CLIENT — Base HTTP client with auth token injection
// and automatic 401 → refresh → retry interceptor
// Consumes Zustand auth store as the single source of truth.
// ─────────────────────────────────────────────────────────────
//
// Convention: all path arguments omit the /api prefix.
// Example: api.get('/products') → GET /api/products
// The client adds the /api prefix automatically.

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

async function attemptTokenRefresh(): Promise<boolean> {
  // Security: Tokens are in httpOnly cookies, no need to send them
  // The server reads refresh token from cookie
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // CSRF token is added automatically by the request function
    });

    if (!res.ok) {
      await fireLogout();
      return false;
    }

    // Server sets new cookies automatically, no need to update store
    return true;
  } catch {
    await fireLogout();
    return false;
  }
}

async function getAuthStateFromStore(): Promise<{ isAuthenticated: boolean }> {
  try {
    const { useAuthStore } = await import("../../stores/auth-store");
    const state = useAuthStore.getState();
    return { isAuthenticated: state.isAuthenticated };
  } catch {
    return { isAuthenticated: false };
  }
}

async function fireLogout(): Promise<void> {
  try {
    const { useAuthStore } = await import("../../stores/auth-store");
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
      await fireLogout();
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
