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

async function attemptTokenRefresh(): Promise<boolean> {
  const { refreshToken, accessToken } = await getAuthStateFromStore();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await fireLogout();
      return false;
    }

    const json = await res.json();
    const session = json.data?.session ?? json.session;
    if (session?.accessToken) {
      await updateTokensInStore(session.accessToken, session.refreshToken, session.expiresAt);
      return true;
    }
    return false;
  } catch {
    await fireLogout();
    return false;
  }
}

async function getAuthStateFromStore(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  try {
    const { useAuthStore } = await import("../../stores/auth-store");
    const state = useAuthStore.getState();
    return { accessToken: state.accessToken, refreshToken: state.refreshToken };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

async function updateTokensInStore(accessToken: string, refreshToken: string, expiresAt: number): Promise<void> {
  try {
    const { useAuthStore } = await import("../../stores/auth-store");
    useAuthStore.getState().setTokens(accessToken, refreshToken, expiresAt);
  } catch {
    // Store not available
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

  const { accessToken, refreshToken } = await getAuthStateFromStore();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

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

  if (response.status === 401 && refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = attemptTokenRefresh();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      refreshRetryCount = 0;
      const { accessToken: newToken } = await getAuthStateFromStore();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
      }
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
