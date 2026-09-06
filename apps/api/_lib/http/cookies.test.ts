import { describe, expect, it } from 'vitest';

import {
  ACCESS_TOKEN_MAX_AGE,
  accessTokenCookie,
  clearAuthCookies,
  CSRF_TOKEN_MAX_AGE,
  csrfTokenCookie,
  readCookie,
  REFRESH_TOKEN_MAX_AGE,
  refreshTokenCookie,
} from './cookies.ts';

function attrs(cookie: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const part of cookie.split(';').slice(1)) {
    const [k, v] = part.trim().split('=');
    map.set((k ?? '').toLowerCase(), (v ?? '').toLowerCase());
  }
  return map;
}

describe('auth cookies', () => {
  it('sets a cross-site capable access cookie', () => {
    const cookie = accessTokenCookie('tok');
    expect(cookie.startsWith('access_token=tok;')).toBe(true);
    const a = attrs(cookie);
    expect(a.get('path')).toBe('/');
    expect(a.has('httponly')).toBe(true);
    expect(a.has('secure')).toBe(true);
    expect(a.get('samesite')).toBe('none');
    expect(a.get('max-age')).toBe(String(ACCESS_TOKEN_MAX_AGE));
    expect(cookie.toLowerCase()).not.toContain('domain=');
  });

  it('sets refresh cookie lifetime from the database session expiry', () => {
    const def = refreshTokenCookie('tok');
    expect(attrs(def).get('max-age')).toBe(String(REFRESH_TOKEN_MAX_AGE));

    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const remembered = refreshTokenCookie('tok', thirtyDays);
    const maxAge = Number(attrs(remembered).get('max-age'));
    expect(maxAge).toBeGreaterThan(29 * 24 * 60 * 60);
    expect(maxAge).toBeLessThanOrEqual(30 * 24 * 60 * 60);
    expect(attrs(remembered).get('samesite')).toBe('none');
    expect(attrs(remembered).has('httponly')).toBe(true);
  });

  it('keeps the csrf cookie readable for double-submit', () => {
    const cookie = csrfTokenCookie('ct');
    expect(cookie.startsWith('csrf_token=ct;')).toBe(true);
    const a = attrs(cookie);
    expect(a.has('httponly')).toBe(false);
    expect(a.has('secure')).toBe(true);
    expect(a.get('samesite')).toBe('none');
    expect(a.get('max-age')).toBe(String(CSRF_TOKEN_MAX_AGE));
  });

  it('clears cookies with matching attributes so browsers delete them', () => {
    const cleared = clearAuthCookies();
    expect(cleared.length).toBeGreaterThanOrEqual(3);
    const set = [
      accessTokenCookie('x'),
      refreshTokenCookie('x'),
      csrfTokenCookie('x'),
    ];
    for (let i = 0; i < 3; i += 1) {
      const setAttrs = attrs(set[i] ?? '');
      const clearAttrs = attrs(cleared[i] ?? '');
      for (const key of ['path', 'httponly', 'secure', 'samesite']) {
        expect(clearAttrs.get(key)).toBe(setAttrs.get(key));
      }
      expect(clearAttrs.get('max-age')).toBe('0');
    }
  });

  it('also clears pre-fix Lax cookies left over from before the rollout', () => {
    const cleared = clearAuthCookies();
    const lax = cleared.filter((c) => c.includes('SameSite=Lax'));
    expect(lax).toHaveLength(3);
    for (const cookie of lax) {
      expect(cookie).toContain('Max-Age=0');
    }
  });

  it('reads cookies without colliding on name prefixes', () => {
    const request = new Request('https://x.test/', {
      headers: {
        cookie:
          'refresh_token=abc123; csrf_token=ct==; access_token=at; session_id=s1',
      },
    });
    expect(readCookie(request, 'refresh_token')).toBe('abc123');
    expect(readCookie(request, 'csrf_token')).toBe('ct==');
    expect(readCookie(request, 'access_token')).toBe('at');
    expect(readCookie(request, 'token')).toBeNull();
    expect(readCookie(request, 'missing')).toBeNull();
  });
});
