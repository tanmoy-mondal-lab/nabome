import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../../_lib/auth/services-v1.ts', () => ({
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  refreshSession: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerificationEmail: vi.fn(),
}));

import { refreshSession } from '../../../_lib/auth/services-v1.ts';
import type { RequestContext } from '../../../_lib/http/context.ts';
import { ApiError } from '../../../_lib/http/errors.ts';
import { handleRefresh } from '../index.ts';

const mockedRefresh = vi.mocked(refreshSession);

function context(): RequestContext {
  return {
    env: {
      JWT_SECRET: 'test-secret-for-unit-tests-only',
      CORS_ORIGINS: 'https://x.test',
    } as RequestContext['env'],
    requestId: 'req-test',
    origin: null,
    accessToken: null,
    isMutation: true,
    method: 'POST',
    meta: { requestId: 'req-test', version: 'v1' },
  };
}

function refreshResult() {
  return {
    accessToken: 'new-access',
    refreshToken: 'new-refresh',
    csrfToken: 'new-csrf',
    session: { expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  };
}

function setCookies(response: Response): string[] {
  const headers = response.headers.getSetCookie?.() ?? [];
  return headers;
}

describe('handleRefresh', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('refreshes from the httpOnly cookie with a valid csrf header', async () => {
    mockedRefresh.mockResolvedValue(refreshResult() as never);
    const request = new Request('https://x.test/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'refresh_token=cookie-rt; csrf_token=ct',
        'x-csrf-token': 'ct',
      },
      body: '{}',
    });

    const response = await handleRefresh(request, context(), {});
    expect(response.status).toBe(200);
    expect(mockedRefresh).toHaveBeenCalledWith(
      'cookie-rt',
      'test-secret-for-unit-tests-only',
    );
    const cookies = setCookies(response);
    expect(cookies).toHaveLength(3);
    expect(cookies.some((c) => c.includes('SameSite=None'))).toBe(true);
    expect(cookies.some((c) => c.startsWith('access_token=new-access;'))).toBe(
      true,
    );
  });

  it('rejects cookie refresh without csrf', async () => {
    const request = new Request('https://x.test/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'refresh_token=cookie-rt; csrf_token=ct',
      },
      body: '{}',
    });

    const response = await handleRefresh(request, context(), {});
    expect(response.status).toBe(403);
    expect(mockedRefresh).not.toHaveBeenCalled();
  });

  it('rejects cookie refresh with mismatched csrf', async () => {
    const request = new Request('https://x.test/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'refresh_token=cookie-rt; csrf_token=ct',
        'x-csrf-token': 'wrong',
      },
      body: '{}',
    });

    const response = await handleRefresh(request, context(), {});
    expect(response.status).toBe(403);
    expect(mockedRefresh).not.toHaveBeenCalled();
  });

  it('keeps bearer refresh working without csrf', async () => {
    mockedRefresh.mockResolvedValue(refreshResult() as never);
    const request = new Request('https://x.test/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer bearer-rt',
      },
      body: '{}',
    });

    const response = await handleRefresh(request, context(), {});
    expect(response.status).toBe(200);
    expect(mockedRefresh).toHaveBeenCalledWith(
      'bearer-rt',
      'test-secret-for-unit-tests-only',
    );
  });

  it('allows cookie refresh from an allowlisted origin without csrf header', async () => {
    mockedRefresh.mockResolvedValue(refreshResult() as never);
    const request = new Request('https://x.test/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        origin: 'https://x.test',
        cookie: 'refresh_token=cookie-rt; csrf_token=ct',
      },
      body: '{}',
    });

    const response = await handleRefresh(request, context(), {});
    expect(response.status).toBe(200);
    expect(mockedRefresh).toHaveBeenCalledWith(
      'cookie-rt',
      'test-secret-for-unit-tests-only',
    );
  });

  it('returns 401 when no refresh credential is present', async () => {
    const request = new Request('https://x.test/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });

    const response = await handleRefresh(request, context(), {});
    expect(response.status).toBe(401);
  });

  it('returns 401 for revoked or expired refresh sessions', async () => {
    mockedRefresh.mockRejectedValue(
      ApiError.unauthorized('Invalid refresh token'),
    );
    const request = new Request('https://x.test/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'refresh_token=stale; csrf_token=ct',
        'x-csrf-token': 'ct',
      },
      body: '{}',
    });

    const response = await handleRefresh(request, context(), {});
    expect(response.status).toBe(401);
  });
});
