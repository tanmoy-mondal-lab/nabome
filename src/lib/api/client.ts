// ─────────────────────────────────────────────────────────────
// API CLIENT — Base HTTP client with auth token injection
// and automatic 401 → refresh → retry interceptor
// ─────────────────────────────────────────────────────────────

const BASE_URL = "/api";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | undefined>;
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

function getStoredAuth():
  | { accessToken: string; refreshToken: string; expiresAt: number }
  | null {
  try {
    const stored = localStorage.getItem("nabome-auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      const state = parsed?.state ?? parsed;
      if (state?.accessToken) {
        return {
          accessToken: state.accessToken,
          refreshToken: state.refreshToken ?? "",
          expiresAt: state.expiresAt ?? 0,
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

function setStoredTokens(
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): void {
  try {
    const stored = localStorage.getItem("nabome-auth");
    let state: Record<string, unknown> = {};
    if (stored) {
      const parsed = JSON.parse(stored);
      state = parsed?.state ?? parsed;
    }
    state.accessToken = accessToken;
    state.refreshToken = refreshToken;
    state.expiresAt = expiresAt;
    localStorage.setItem(
      "nabome-auth",
      JSON.stringify({ state })
    );
  } catch {
    // Storage unavailable
  }
}

function clearStoredAuth(): void {
  try {
    localStorage.removeItem("nabome-auth");
  } catch {
    // Storage unavailable
  }
}

async function attemptTokenRefresh(): Promise<boolean> {
  const auth = getStoredAuth();
  if (!auth?.refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    });

    if (!res.ok) {
      clearStoredAuth();
      return false;
    }

    const json = await res.json();
    const session = json.data?.session ?? json.session;
    if (session?.accessToken) {
      setStoredTokens(
        session.accessToken,
        session.refreshToken,
        session.expiresAt
      );
      return true;
    }
    return false;
  } catch {
    clearStoredAuth();
    return false;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, params, ...fetchOptions } = options;

  const url = new URL(`${BASE_URL}${endpoint}`, window.location.origin);
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

  const auth = getStoredAuth();
  if (auth?.accessToken) {
    headers.set("Authorization", `Bearer ${auth.accessToken}`);
  }

  // CSRF token from cookie for state-changing methods
  const method = (fetchOptions.method ?? "GET").toUpperCase();
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    const csrfCookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("csrf_token="));
    if (csrfCookie) {
      headers.set("X-CSRF-Token", csrfCookie.split("=")[1]);
    }
  }

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  });

  if (response.status === 401 && auth?.refreshToken) {
    // ── Auto-refresh on 401 ──
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = attemptTokenRefresh();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      // Retry the original request with new token
      const newAuth = getStoredAuth();
      if (newAuth?.accessToken) {
        headers.set("Authorization", `Bearer ${newAuth.accessToken}`);
      }
      const retryResponse = await fetch(url.toString(), {
        ...fetchOptions,
        headers,
        body:
          body instanceof FormData
            ? body
            : body !== undefined
              ? JSON.stringify(body)
              : undefined,
      });

      if (retryResponse.status === 204) {
        return {} as T;
      }

      const retryData = await retryResponse.json();
      if (!retryResponse.ok) {
        throw new ApiError(
          retryData.error?.message ??
            `Request failed with status ${retryResponse.status}`,
          retryResponse.status,
          retryData.details
        );
      }
      return retryData.data ?? retryData;
    }

    clearStoredAuth();
    window.dispatchEvent(new CustomEvent("auth:logout"));
    throw new ApiError("Session expired — please log in again", 401);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      data.details
    );
  }

  return data.data ?? data;
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
