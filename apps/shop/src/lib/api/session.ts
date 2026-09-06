import { useAuthStore } from '@/stores/auth-store';

import { API_URL, SESSION_EXPIRED_EVENT, setCsrfToken } from './client';

const GUEST_PATHS = ['/login', '/register'];

export function isGuestPath(pathname: string): boolean {
  return GUEST_PATHS.some((p) => pathname.startsWith(p));
}

let initialized = false;
let handler: (() => void) | null = null;
let bootstrapPromise: Promise<void> | null = null;

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

async function fetchProfile(): Promise<{ user: unknown } | null> {
  const response = await fetch(`${API_URL}/auth/profile`, {
    credentials: 'include',
  });
  if (response.status === 401) {
    const refresh = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
    });
    if (!refresh.ok) return null;
    const retry = await fetch(`${API_URL}/auth/profile`, {
      credentials: 'include',
    });
    if (!retry.ok) return null;
    return (await retry.json().catch(() => null))?.data ?? null;
  }
  if (!response.ok) return null;
  return (await response.json().catch(() => null))?.data ?? null;
}

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
