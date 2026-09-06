import { describe, expect, it, vi } from 'vitest';

import { useAuthStore } from '@/stores/auth-store';

import { SESSION_EXPIRED_EVENT } from './client';
import {
  initSessionListener,
  isGuestPath,
  bootstrapSession,
  __resetSessionListenerForTests,
} from './session';

describe('session listener', () => {
  it('classifies guest paths', () => {
    expect(isGuestPath('/login')).toBe(true);
    expect(isGuestPath('/login?from=%2Faccount')).toBe(true);
    expect(isGuestPath('/register')).toBe(true);
    expect(isGuestPath('/account')).toBe(false);
    expect(isGuestPath('/')).toBe(false);
  });

  it('clears auth state on session expiry without redirecting guest pages', () => {
    __resetSessionListenerForTests();
    window.history.replaceState(null, '', '/login');
    useAuthStore.getState().setUser({
      id: 'u1',
      email: 'a@b.c',
      firstName: 'A',
      lastName: 'B',
      role: 'customer',
    } as never);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    initSessionListener();
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(window.location.pathname).toBe('/login');
  });

  it('registers the listener only once', () => {
    __resetSessionListenerForTests();
    window.history.replaceState(null, '', '/login');
    const spy = vi.spyOn(window, 'addEventListener');
    initSessionListener();
    initSessionListener();
    expect(
      spy.mock.calls.filter(([type]) => type === SESSION_EXPIRED_EVENT),
    ).toHaveLength(1);
    spy.mockRestore();
  });
});

describe('bootstrapSession', () => {
  it('restores the user from a valid cookie session', async () => {
    __resetSessionListenerForTests();
    useAuthStore.getState().clearUser();
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ success: true, data: { user: { id: 'u9' } } }),
            {
              status: 200,
            },
          ),
      ),
    );
    await bootstrapSession();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().status).toBe('authenticated');
    vi.unstubAllGlobals();
  });

  it('leaves guests alone without redirecting when no session exists', async () => {
    __resetSessionListenerForTests();
    useAuthStore.getState().clearUser();
    window.history.replaceState(null, '', '/');
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 401 })),
    );
    await bootstrapSession();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().status).toBe('guest');
    expect(window.location.pathname).toBe('/');
    vi.unstubAllGlobals();
  });

  it('recovers via refresh when the access cookie expired', async () => {
    __resetSessionListenerForTests();
    useAuthStore.getState().clearUser();
    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).endsWith('/auth/profile')) {
        if (
          fetchMock.mock.calls.filter(([u]) =>
            String(u).endsWith('/auth/profile'),
          ).length === 1
        ) {
          return new Response('{}', { status: 401 });
        }
        return new Response(
          JSON.stringify({ success: true, data: { user: { id: 'u7' } } }),
          { status: 200 },
        );
      }
      return new Response(
        JSON.stringify({
          success: true,
          data: { accessToken: 'a', csrfToken: 'c' },
        }),
        { status: 200 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    await bootstrapSession();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    vi.unstubAllGlobals();
  });
});
