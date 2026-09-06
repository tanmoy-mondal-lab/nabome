import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../../_lib/auth/services-v1.ts', () => ({
  register: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  logoutByRefreshToken: vi.fn(),
  refreshSession: vi.fn(),
  requestPasswordReset: vi.fn(),
  confirmPasswordReset: vi.fn(),
  verifyEmail: vi.fn(),
  resendVerificationEmail: vi.fn(),
}));

import {
  logout,
  logoutByRefreshToken,
} from '../../../_lib/auth/services-v1.ts';
import type { RequestContext } from '../../../_lib/http/context.ts';
import { handleLogout } from '../index.ts';

const mockedLogout = vi.mocked(logout);
const mockedLogoutByToken = vi.mocked(logoutByRefreshToken);

function context(overrides: Partial<RequestContext> = {}): RequestContext {
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
    ...overrides,
  };
}

function clearedCookies(response: Response): string[] {
  return response.headers.getSetCookie?.() ?? [];
}

describe('handleLogout', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('revokes the exact device session from the refresh cookie', async () => {
    mockedLogoutByToken.mockResolvedValue(true);
    const request = new Request('https://x.test/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'refresh_token=device-rt; csrf_token=ct',
      },
      body: '{}',
    });

    const response = await handleLogout(
      request,
      context({ userId: 'user-1' }),
      {},
    );
    expect(response.status).toBe(200);
    expect(mockedLogoutByToken).toHaveBeenCalledWith('device-rt', 'user-1');
    expect(mockedLogout).not.toHaveBeenCalled();
    const cookies = clearedCookies(response);
    expect(cookies.some((c) => c.startsWith('refresh_token=;'))).toBe(true);
    expect(cookies.some((c) => c.startsWith('access_token=;'))).toBe(true);
  });

  it('logs out with an expired access token when only the refresh cookie is present', async () => {
    mockedLogoutByToken.mockResolvedValue(true);
    const request = new Request('https://x.test/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: 'refresh_token=device-rt',
      },
      body: '{}',
    });

    const response = await handleLogout(request, context(), {});
    expect(response.status).toBe(200);
    expect(mockedLogoutByToken).toHaveBeenCalledWith('device-rt', undefined);
  });

  it('supports bearer logout for token-based clients', async () => {
    mockedLogoutByToken.mockResolvedValue(true);
    const request = new Request('https://x.test/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: 'Bearer bearer-rt',
      },
      body: '{}',
    });

    const response = await handleLogout(request, context(), {});
    expect(response.status).toBe(200);
    expect(mockedLogoutByToken).toHaveBeenCalledWith('bearer-rt', undefined);
  });

  it('is idempotent with no credential and still clears cookies', async () => {
    const request = new Request('https://x.test/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });

    const response = await handleLogout(request, context(), {});
    expect(response.status).toBe(200);
    expect(mockedLogoutByToken).not.toHaveBeenCalled();
    const cookies = clearedCookies(response);
    expect(cookies.some((c) => c.startsWith('refresh_token=;'))).toBe(true);
  });
});
