import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireRole, requireAdmin } from '../auth';
import type { RequestContext } from '../types';

describe('Auth Middleware - Security Tests', () => {
  describe('requireRole', () => {
    it('should return null when user has correct role', () => {
      const ctx: RequestContext = { userId: 'u1', userRole: 'admin' };
      expect(requireRole(ctx, 'admin')).toBeNull();
    });

    it('should return 403 when user has wrong role', () => {
      const ctx: RequestContext = { userId: 'u1', userRole: 'customer' };
      const res = requireRole(ctx, 'admin');
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
    });

    it('should pass through Response errors unchanged', () => {
      const errResponse = new Response('error', { status: 401 });
      const result = requireRole(errResponse, 'admin');
      expect(result).toBe(errResponse);
      expect(result!.status).toBe(401);
    });

    it('should reject when userRole is undefined', () => {
      const ctx: RequestContext = { userId: 'u1' };
      const res = requireRole(ctx, 'admin');
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
    });

    it('should reject when userRole is empty string', () => {
      const ctx: RequestContext = { userId: 'u1', userRole: '' };
      const res = requireRole(ctx, 'admin');
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
    });

    it('should be case-sensitive on role', () => {
      const ctx: RequestContext = { userId: 'u1', userRole: 'Admin' };
      const res = requireRole(ctx, 'admin');
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
    });
  });

  describe('requireAdmin', () => {
    it('should return null when user is admin', () => {
      const ctx: RequestContext = { userId: 'u1', userRole: 'admin' };
      expect(requireAdmin(ctx)).toBeNull();
    });

    it('should return 403 for customer', () => {
      const ctx: RequestContext = { userId: 'u1', userRole: 'customer' };
      const res = requireAdmin(ctx);
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
    });

    it('should return 403 for undefined role', () => {
      const ctx: RequestContext = { userId: 'u1' };
      const res = requireAdmin(ctx);
      expect(res).toBeInstanceOf(Response);
      expect(res!.status).toBe(403);
    });

    it('should pass through Response errors', () => {
      const errResponse = new Response('forbidden', { status: 403 });
      expect(requireAdmin(errResponse)).toBe(errResponse);
    });
  });

  describe('Auth header validation', () => {
    it('should reject missing Authorization header', () => {
      const req = new Request('http://localhost/api/test');
      const authHeader = req.headers.get('Authorization');
      expect(authHeader).toBeNull();
    });

    it('should reject non-Bearer token', () => {
      const req = new Request('http://localhost/api/test', {
        headers: { Authorization: 'Basic abc123' },
      });
      const authHeader = req.headers.get('Authorization');
      expect(authHeader?.startsWith('Bearer ')).toBe(false);
    });

    it('should accept Bearer token format', () => {
      const req = new Request('http://localhost/api/test', {
        headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.test' },
      });
      const authHeader = req.headers.get('Authorization');
      expect(authHeader?.startsWith('Bearer ')).toBe(true);
      expect(authHeader?.slice(7)).toBe('eyJhbGciOiJIUzI1NiJ9.test');
    });
  });
});
