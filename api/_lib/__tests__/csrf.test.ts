import { describe, it, expect, vi } from 'vitest';

// Mock crypto for tests
global.crypto = {
  getRandomValues: (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  },
  subtle: {},
} as any;

import { generateToken, setCsrfCookie, validateCsrf, parseCookies } from '../api/_lib/csrf';

describe('csrf', () => {
  it('should generate unique tokens', () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(32);
  });

  it('should set CSRF cookie on response', () => {
    const response = new Response();
    const token = 'test-token-123';
    setCsrfCookie(response, token);
    
    const cookieHeader = response.headers.get('set-cookie');
    expect(cookieHeader).toContain('csrf_token=test-token-123');
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Strict');
  });

  it('should validate matching tokens', () => {
    const token = 'test-token-123';
    const request = {
      headers: new Map([['x-csrf-token', token]]),
    } as any;
    
    const response = new Response();
    setCsrfCookie(response, token);
    
    // Mock the cookie header to match
    const cookieHeader = `csrf_token=${token}`;
    vi.spyOn(request.headers, 'get').mockReturnValue(cookieHeader);
    
    expect(validateCsrf(request)).toBe(true);
  });

  it('should reject missing tokens', () => {
    const request = {
      headers: new Map(),
    } as any;
    vi.spyOn(request.headers, 'get').mockReturnValue(null);
    
    expect(validateCsrf(request)).toBe(false);
  });

  it('should skip validation for GET requests', () => {
    const request = {
      method: 'GET',
      headers: new Map(),
    } as any;
    vi.spyOn(request.headers, 'get').mockReturnValue(null);
    
    expect(validateCsrf(request)).toBe(true);
  });
});
