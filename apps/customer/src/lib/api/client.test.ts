import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  ApiClientError,
  coordinatedRefresh,
  request,
  SESSION_EXPIRED_EVENT,
  setCsrfToken,
  __resetRefreshCoordinatorForTests,
} from './client';

const originalFetch = globalThis.fetch;

function mockFetchOnce(response: {
  ok: boolean;
  status: number;
  body: unknown;
}) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: async () => response.body,
  } as unknown as Response);
}

describe('api client', () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
    setCsrfToken(null);
    __resetRefreshCoordinatorForTests();
    vi.restoreAllMocks();
  });

  it('returns envelope data on success', async () => {
    mockFetchOnce({
      ok: true,
      status: 200,
      body: { success: true, data: { id: 'p1' }, meta: { requestId: 'r1' } },
    });

    await expect(request('/products')).resolves.toEqual({ id: 'p1' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/products'),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('maps error envelopes to ApiClientError', async () => {
    mockFetchOnce({
      ok: false,
      status: 422,
      body: {
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid fields',
          field: 'email',
          details: {},
        },
        meta: { requestId: 'r2' },
      },
    });

    const error = await request('/products').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    if (error instanceof ApiClientError) {
      expect(error.status).toBe(422);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.field).toBe('email');
      expect(error.requestId).toBe('r2');
      expect(error.isSessionExpired).toBe(false);
    }
  });

  it('dispatches SESSION_EXPIRED_EVENT on 401 session errors', async () => {
    mockFetchOnce({
      ok: false,
      status: 401,
      body: {
        success: false,
        data: null,
        error: { code: 'SESSION_EXPIRED', message: 'Session expired' },
        meta: { requestId: 'r3' },
      },
    });

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const error = await request('/cart').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiClientError);

    const dispatched = dispatchSpy.mock.calls.map((call) => call[0] as Event);
    expect(
      dispatched.some((event) => event.type === SESSION_EXPIRED_EVENT),
    ).toBe(true);
  });

  function jsonResponse(ok: boolean, status: number, body: unknown) {
    return {
      ok,
      status,
      json: async () => body,
    } as unknown as Response;
  }

  function unauthorized() {
    return jsonResponse(false, 401, {
      success: false,
      data: null,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
      meta: { requestId: 'r401' },
    });
  }

  it('refreshes the session and retries after an expired access token', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(
        jsonResponse(true, 200, {
          success: true,
          data: { accessToken: 'a', csrfToken: 'c' },
          meta: { requestId: 'r-refresh' },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(true, 200, {
          success: true,
          data: { id: 'cart-1' },
          meta: { requestId: 'r-retry' },
        }),
      );

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    await expect(
      request('/cart/sync', { method: 'POST', body: {} }),
    ).resolves.toEqual({ id: 'cart-1' });

    const calls = vi.mocked(globalThis.fetch).mock.calls;
    expect(
      calls.filter(([url]) => String(url).endsWith('/auth/refresh')),
    ).toHaveLength(1);
    const retryInit = calls[2]?.[1];
    const retryHeaders = retryInit?.headers as
      Record<string, string> | undefined;
    expect(retryHeaders?.['x-csrf-token']).toBe('c');
    const dispatched = dispatchSpy.mock.calls.map((call) => call[0] as Event);
    expect(
      dispatched.some((event) => event.type === SESSION_EXPIRED_EVENT),
    ).toBe(false);
  });

  it('uses a single refresh for concurrent 401s', async () => {
    const seen = new Map<string, number>();
    globalThis.fetch = vi.fn().mockImplementation((url: unknown) => {
      const key = String(url);
      seen.set(key, (seen.get(key) ?? 0) + 1);
      if (key.endsWith('/auth/refresh')) {
        return Promise.resolve(
          jsonResponse(true, 200, {
            success: true,
            data: {},
            meta: { requestId: 'r-refresh' },
          }),
        );
      }
      if ((seen.get(key) ?? 0) > 1) {
        return Promise.resolve(
          jsonResponse(true, 200, {
            success: true,
            data: { recovered: true },
            meta: { requestId: 'r-retry' },
          }),
        );
      }
      return Promise.resolve(unauthorized());
    });

    const [first, second] = await Promise.all([
      request('/cart'),
      request('/slow'),
    ]);
    expect(first).toEqual({ recovered: true });
    expect(second).toEqual({ recovered: true });

    const calls = vi.mocked(globalThis.fetch).mock.calls;
    expect(
      calls.filter(([url]) => String(url).endsWith('/auth/refresh')),
    ).toHaveLength(1);
  });

  it('does not log out on transient 500 errors', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      jsonResponse(false, 500, {
        success: false,
        data: null,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Database temporarily unavailable',
        },
        meta: { requestId: 'r500' },
      }),
    );

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    const error = await request('/cart').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiClientError);
    if (error instanceof ApiClientError) {
      expect(error.isSessionExpired).toBe(false);
    }
    const calls = vi.mocked(globalThis.fetch).mock.calls;
    expect(
      calls.filter(([url]) => String(url).endsWith('/auth/refresh')),
    ).toHaveLength(0);
    const dispatched = dispatchSpy.mock.calls.map((call) => call[0] as Event);
    expect(
      dispatched.some((event) => event.type === SESSION_EXPIRED_EVENT),
    ).toBe(false);
  });

  it('does not log out on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    await expect(request('/cart')).rejects.toThrow('fetch failed');
    const dispatched = dispatchSpy.mock.calls.map((call) => call[0] as Event);
    expect(
      dispatched.some((event) => event.type === SESSION_EXPIRED_EVENT),
    ).toBe(false);
  });

  it('defers to a sibling tab refresh instead of double-rotating', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(true, 200, {
        success: true,
        data: {},
        meta: { requestId: 'r-refresh' },
      }),
    );
    globalThis.fetch = fetchMock;
    localStorage.setItem(
      'nabome:auth:refresh-lock',
      JSON.stringify({ owner: 'sibling-tab', expiresAt: Date.now() + 10000 }),
    );
    setTimeout(() => {
      localStorage.removeItem('nabome:auth:refresh-lock');
      localStorage.setItem('nabome:auth:refresh-seq', String(Date.now()));
    }, 200);

    await expect(coordinatedRefresh()).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('takes over when a sibling refresh lock goes stale', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      jsonResponse(true, 200, {
        success: true,
        data: {},
        meta: { requestId: 'r-refresh' },
      }),
    );
    localStorage.setItem(
      'nabome:auth:refresh-lock',
      JSON.stringify({ owner: 'crashed-tab', expiresAt: Date.now() - 1000 }),
    );

    await expect(coordinatedRefresh()).resolves.toBe(true);
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('nabome:auth:refresh-lock')).toBeNull();
  });

  it('releases the lock so waiting tabs can proceed', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      jsonResponse(true, 200, {
        success: true,
        data: {},
        meta: { requestId: 'r-refresh' },
      }),
    );

    await expect(coordinatedRefresh()).resolves.toBe(true);
    expect(localStorage.getItem('nabome:auth:refresh-lock')).toBeNull();
    expect(
      Number(localStorage.getItem('nabome:auth:refresh-seq') ?? 0),
    ).toBeGreaterThan(0);
  });

  it('sends CSRF header on mutations when cookie is present', async () => {
    Object.defineProperty(document, 'cookie', {
      value: 'csrf_token=abc123',
      configurable: true,
    });
    mockFetchOnce({
      ok: true,
      status: 200,
      body: { success: true, data: null, meta: { requestId: 'r4' } },
    });

    await request('/cart/add', { method: 'POST', body: {} });

    const init = vi.mocked(globalThis.fetch).mock.calls[0]?.[1];
    const headers = init?.headers as Record<string, string> | undefined;
    expect(headers?.['x-csrf-token']).toBe('abc123');

    Object.defineProperty(document, 'cookie', {
      value: '',
      configurable: true,
    });
  });
});
