import { useAuthStore } from '@/stores/auth-store';

import {
  API_URL,
  SESSION_EXPIRED_EVENT,
  __resetRefreshCoordinatorForTests,
  coordinatedRefresh,
  setCsrfToken,
} from './client';

const GUEST_PATHS = ['/login', '/register'];

export function isGuestPath(pathname: string): boolean {
  return GUEST_PATHS.some((p) => pathname.startsWith(p));
}

let initialized = false;
let handler: (() => void) | null = null;

export function __resetSessionListenerForTests(): void {
  if (handler) {
    window.removeEventListener(SESSION_EXPIRED_EVENT, handler);
    handler = null;
  }
  initialized = false;
  bootstrapPromise = null;
  __resetRefreshCoordinatorForTests();
}

export function initSessionListener(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  handler = () => {
    useAuthStore.getState().clearUser();
    setCsrfToken(null);
    const pathname = window.location.pathname;
    if (!isGuestPath(pathname)) {
      const from = `${pathname}${window.location.search}`;
      window.location.href = `/login?from=${encodeURIComponent(from)}`;
    }
  };
  window.addEventListener(SESSION_EXPIRED_EVENT, handler);
}

let bootstrapPromise: Promise<void> | null = null;

async function fetchProfile(): Promise<{ user: unknown } | null> {
  const response = await fetch(`${API_URL}/auth/profile`, {
    credentials: 'include',
  });
  if (response.status === 401) {
    const refreshed = await coordinatedRefresh();
    if (!refreshed) return null;
    const retry = await fetch(`${API_URL}/auth/profile`, {
      credentials: 'include',
    });
    if (!retry.ok) return null;
    return (await retry.json().catch(() => null))?.data ?? null;
  }
  if (!response.ok) return null;
  return (await response.json().catch(() => null))?.data ?? null;
}

/**
 * Restore the persisted session on application startup.
 * Uses raw fetch (never the global 401 event) so visiting a public page
 * with no session stays on the page instead of redirecting to /login.
 * Route guards redirect only when a protected route is actually visited.
 */
export function bootstrapSession(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const store = useAuthStore.getState();
      if (store.isAuthenticated && store.user) return;
      store.setLoading();
      try {
        const data = await fetchProfile();
        if (data?.user) {
          useAuthStore.getState().setUser(data.user as never);
        } else {
          useAuthStore.getState().clearUser();
        }
      } catch {
        useAuthStore.getState().clearUser();
      }
    })();
  }
  return bootstrapPromise;
}
