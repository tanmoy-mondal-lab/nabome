import { describe, expect, it, vi, afterEach } from 'vitest';

import { ApiClientError, request, SESSION_EXPIRED_EVENT } from './client';

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
