/**
 * Unit tests for CSRF protection.
 * Tests CSRF token generation, verification, and validation.
 */

import { describe, it, expect } from 'vitest';

import {
  verifyCsrfToken,
  getCsrfTokenFromCookie,
  verifyCsrfTokenFromCookie,
} from './csrf';

describe('CSRF Protection', () => {
  describe('verifyCsrfToken', () => {
    it('should verify valid CSRF token', () => {
      const token = 'valid-csrf-token-12345';
      const mockRequest = new Request('http://example.com', {
        headers: { 'x-csrf-token': token },
      });
      expect(() => verifyCsrfToken(mockRequest, token)).not.toThrow();
    });

    it('should reject mismatched CSRF token', () => {
      const token = 'valid-csrf-token-12345';
      const wrongToken = 'wrong-csrf-token-67890';
      const mockRequest = new Request('http://example.com', {
        headers: { 'x-csrf-token': wrongToken },
      });
      expect(() => verifyCsrfToken(mockRequest, token)).toThrow();
    });

    it('should reject missing CSRF token', () => {
      const token = 'valid-csrf-token-12345';
      const mockRequest = new Request('http://example.com');
      expect(() => verifyCsrfToken(mockRequest, token)).toThrow();
    });

    it('should reject empty CSRF token', () => {
      const token = 'valid-csrf-token-12345';
      const mockRequest = new Request('http://example.com', {
        headers: { 'x-csrf-token': '' },
      });
      expect(() => verifyCsrfToken(mockRequest, token)).toThrow();
    });
  });

  describe('getCsrfTokenFromCookie', () => {
    it('should extract CSRF token from cookie', () => {
      const token = 'valid-csrf-token-12345';
      const mockRequest = new Request('http://example.com', {
        headers: { cookie: `csrf_token=${token}` },
      });
      const extracted = getCsrfTokenFromCookie(mockRequest);
      expect(extracted).toBe(token);
    });

    it('should return null when cookie is missing', () => {
      const mockRequest = new Request('http://example.com');
      const extracted = getCsrfTokenFromCookie(mockRequest);
      expect(extracted).toBeNull();
    });

    it('should return null when CSRF cookie is missing', () => {
      const mockRequest = new Request('http://example.com', {
        headers: { cookie: 'session_id=abc123' },
      });
      const extracted = getCsrfTokenFromCookie(mockRequest);
      expect(extracted).toBeNull();
    });

    it('should handle multiple cookies', () => {
      const token = 'valid-csrf-token-12345';
      const mockRequest = new Request('http://example.com', {
        headers: {
          cookie: `session_id=abc123; csrf_token=${token}; other=value`,
        },
      });
      const extracted = getCsrfTokenFromCookie(mockRequest);
      expect(extracted).toBe(token);
    });
  });

  describe('verifyCsrfTokenFromCookie', () => {
    it('should verify CSRF token from cookie', () => {
      const token = 'valid-csrf-token-12345';
      const mockRequest = new Request('http://example.com', {
        headers: { cookie: `csrf_token=${token}` },
      });
      expect(() => verifyCsrfTokenFromCookie(mockRequest, token)).not.toThrow();
    });

    it('should reject when cookie is missing', () => {
      const token = 'valid-csrf-token-12345';
      const mockRequest = new Request('http://example.com');
      expect(() => verifyCsrfTokenFromCookie(mockRequest, token)).toThrow();
    });

    it('should reject when cookie value is mismatched', () => {
      const token = 'valid-csrf-token-12345';
      const wrongToken = 'wrong-csrf-token-67890';
      const mockRequest = new Request('http://example.com', {
        headers: { cookie: `csrf_token=${wrongToken}` },
      });
      expect(() => verifyCsrfTokenFromCookie(mockRequest, token)).toThrow();
    });

    it('should handle multiple cookies', () => {
      const token = 'valid-csrf-token-12345';
      const mockRequest = new Request('http://example.com', {
        headers: {
          cookie: `session_id=abc123; csrf_token=${token}; other=value`,
        },
      });
      expect(() => verifyCsrfTokenFromCookie(mockRequest, token)).not.toThrow();
    });
  });
});
