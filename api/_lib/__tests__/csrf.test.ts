import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateToken,
  setCsrfCookie,
  validateCsrf,
  parseCookies,
  csrfError,
} from '../csrf';

describe('CSRF Protection - Security Tests', () => {
  describe('generateToken', () => {
    it('should generate 32-character alphanumeric token', () => {
      const token = generateToken();
      expect(token.length).toBe(32);
      expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens on each call', () => {
      const tokens = new Set<string>();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateToken());
      }
      expect(tokens.size).toBe(100);
    });

    it('should not contain special characters', () => {
      const token = generateToken();
      expect(token).not.toMatch(/[^A-Za-z0-9]/);
    });
  });

  describe('setCsrfCookie', () => {
    it('should set csrf_token cookie with SameSite=Strict', () => {
      const res = new Response();
      setCsrfCookie(res);
      const cookie = res.headers.get('Set-Cookie');
      expect(cookie).toContain('csrf_token=');
      expect(cookie).toContain('SameSite=Strict');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('Max-Age=86400');
    });

    it('should set Secure flag in production', () => {
      const res = new Response();
      setCsrfCookie(res, { NODE_ENV: 'production' });
      const cookie = res.headers.get('Set-Cookie');
      expect(cookie).toContain('Secure');
    });

    it('should set Secure flag on Cloudflare Pages', () => {
      const res = new Response();
      setCsrfCookie(res, { CF_PAGES: 'true' });
      const cookie = res.headers.get('Set-Cookie');
      expect(cookie).toContain('Secure');
    });

    it('should NOT set Secure flag in development', () => {
      const res = new Response();
      setCsrfCookie(res, { NODE_ENV: 'development' });
      const cookie = res.headers.get('Set-Cookie');
      expect(cookie).not.toContain('Secure');
    });

    it('should return X-CSRF-Token header matching cookie', () => {
      const res = new Response();
      setCsrfCookie(res);
      const headerToken = res.headers.get('X-CSRF-Token');
      const cookie = res.headers.get('Set-Cookie');
      const cookieToken = cookie?.match(/csrf_token=([^;]+)/)?.[1];
      expect(headerToken).toBe(cookieToken);
    });
  });

  describe('validateCsrf', () => {
    function makeRequest(method: string, cookie?: string, header?: string): Request {
      const req = new Request('http://localhost/api/test', { method });
      if (cookie || header) {
        // We need to mock headers.get since Request doesn't allow setting Cookie directly
        const originalGet = req.headers.get.bind(req.headers);
        vi.spyOn(req.headers, 'get').mockImplementation((name: string) => {
          if (name === 'Cookie') return cookie ?? originalGet(name);
          if (name === 'x-csrf-token') return header ?? originalGet(name);
          return originalGet(name);
        });
      }
      return req;
    }

    it('should pass GET requests without tokens', () => {
      const req = makeRequest('GET');
      expect(validateCsrf(req)).toBe(true);
    });

    it('should pass HEAD requests without tokens', () => {
      const req = makeRequest('HEAD');
      expect(validateCsrf(req)).toBe(true);
    });

    it('should pass OPTIONS requests without tokens', () => {
      const req = makeRequest('OPTIONS');
      expect(validateCsrf(req)).toBe(true);
    });

    it('should reject POST without any tokens', () => {
      const req = makeRequest('POST');
      expect(validateCsrf(req)).toBe(false);
    });

    it('should reject POST with only cookie token (no header)', () => {
      const req = makeRequest('POST', 'csrf_token=abc123', null as any);
      expect(validateCsrf(req)).toBe(false);
    });

    it('should reject POST with only header token (no cookie)', () => {
      const req = makeRequest('POST', undefined, 'abc123');
      expect(validateCsrf(req)).toBe(false);
    });

    it('should reject POST with mismatched tokens', () => {
      const req = makeRequest('POST', 'csrf_token=abc123', 'xyz789');
      expect(validateCsrf(req)).toBe(false);
    });

    it('should accept POST with matching tokens', () => {
      const req = makeRequest('POST', 'csrf_token=abc123', 'abc123');
      expect(validateCsrf(req)).toBe(true);
    });

    it('should reject PUT without tokens', () => {
      const req = makeRequest('PUT');
      expect(validateCsrf(req)).toBe(false);
    });

    it('should reject DELETE without tokens', () => {
      const req = makeRequest('DELETE');
      expect(validateCsrf(req)).toBe(false);
    });

    it('should reject PATCH without tokens', () => {
      const req = makeRequest('PATCH');
      expect(validateCsrf(req)).toBe(false);
    });

    it('should accept PUT with matching tokens', () => {
      const req = makeRequest('PUT', 'csrf_token=tok1', 'tok1');
      expect(validateCsrf(req)).toBe(true);
    });

    it('should accept DELETE with matching tokens', () => {
      const req = makeRequest('DELETE', 'csrf_token=tok1', 'tok1');
      expect(validateCsrf(req)).toBe(true);
    });
  });

  describe('parseCookies', () => {
    it('should parse single cookie', () => {
      expect(parseCookies('csrf_token=abc123')).toEqual({ csrf_token: 'abc123' });
    });

    it('should parse multiple cookies', () => {
      expect(parseCookies('csrf_token=abc; session=xyz; theme=dark')).toEqual({
        csrf_token: 'abc',
        session: 'xyz',
        theme: 'dark',
      });
    });

    it('should handle empty string', () => {
      expect(parseCookies('')).toEqual({});
    });

    it('should handle cookies with = in value', () => {
      expect(parseCookies('token=abc=def')).toEqual({ token: 'abc=def' });
    });

    it('should handle cookies with spaces', () => {
      expect(parseCookies(' a=1 ; b=2 ')).toEqual({ a: '1', b: '2' });
    });
  });

  describe('csrfError', () => {
    it('should return 403 status', () => {
      const res = csrfError();
      expect(res.status).toBe(403);
    });

    it('should return JSON content type', () => {
      const res = csrfError();
      expect(res.headers.get('Content-Type')).toContain('application/json');
    });

    it('should return correct error message', async () => {
      const res = csrfError();
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toBe('Invalid or missing CSRF token');
      expect(body.error.status).toBe(403);
    });
  });
});
