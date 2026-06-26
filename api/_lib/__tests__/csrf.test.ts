import { describe, it, expect, vi } from 'vitest';

import { generateToken, setCsrfCookie, validateCsrf, parseCookies } from '../csrf';

describe('csrf', () => {
  it('should generate unique tokens', () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).not.toBe(token2);
    expect(token1.length).toBe(32);
  });

  it('should set CSRF cookie on response', () => {
    const response = new Response();
    setCsrfCookie(response);
    
    const cookieHeader = response.headers.get('set-cookie');
    expect(cookieHeader).toContain('csrf_token=');
    expect(cookieHeader).toContain('SameSite=Strict');
  });

  it('should validate matching tokens', () => {
    const request = {
      method: 'POST',
      headers: new Map(),
    } as any;
    
    const response = new Response();
    setCsrfCookie(response);
    
    // Extract the token from the set-cookie header
    const cookieHeader = response.headers.get('set-cookie') ?? '';
    const tokenMatch = cookieHeader.match(/csrf_token=([^;]+)/);
    const token = tokenMatch?.[1] ?? '';
    
    // Mock the cookie header and x-csrf-token header
    vi.spyOn(request.headers, 'get').mockImplementation(((name: string) => {
      if (name === 'Cookie') return `csrf_token=${token}`;
      if (name === 'x-csrf-token') return token;
      return null;
    }) as any);
    
    expect(validateCsrf(request)).toBe(true);
  });

  it('should reject missing tokens', () => {
    const request = {
      method: 'POST',
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
