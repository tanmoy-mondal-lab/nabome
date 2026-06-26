import { describe, it, expect, vi } from 'vitest';
import {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
} from '../response';

async function parseBody(res: Response) {
  return res.json();
}

describe('response helpers', () => {
  describe('success', () => {
    it('should return 200 by default', async () => {
      const res = success({ id: 1 });
      expect(res.status).toBe(200);
      const body = await parseBody(res);
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ id: 1 });
    });

    it('should accept custom status', async () => {
      const res = success('ok', 202);
      expect(res.status).toBe(202);
    });

    it('should handle null data', async () => {
      const res = success(null);
      const body = await parseBody(res);
      expect(body.data).toBeNull();
    });

    it('should handle array data', async () => {
      const res = success([1, 2, 3]);
      const body = await parseBody(res);
      expect(body.data).toEqual([1, 2, 3]);
    });
  });

  describe('created', () => {
    it('should return 201', async () => {
      const res = created({ id: 1 });
      expect(res.status).toBe(201);
      const body = await parseBody(res);
      expect(body.success).toBe(true);
    });
  });

  describe('error', () => {
    it('should return 400 by default', async () => {
      const res = error('Bad input');
      expect(res.status).toBe(400);
      const body = await parseBody(res);
      expect(body.success).toBe(false);
      expect(body.error.message).toBe('Bad input');
      expect(body.error.status).toBe(400);
    });

    it('should accept custom status', async () => {
      const res = error('Custom', 422);
      expect(res.status).toBe(422);
    });

    it('should include details when provided', async () => {
      const res = error('Invalid', 400, { field: 'email' });
      const body = await parseBody(res);
      expect(body.details).toEqual({ field: 'email' });
    });

    it('should not include details when not provided', async () => {
      const res = error('Invalid');
      const body = await parseBody(res);
      expect(body.details).toBeUndefined();
    });
  });

  describe('badRequest', () => {
    it('should return 400', async () => {
      const res = badRequest('Invalid request');
      expect(res.status).toBe(400);
      const body = await parseBody(res);
      expect(body.error.message).toBe('Invalid request');
    });

    it('should include details', async () => {
      const res = badRequest('Invalid', { reason: 'missing field' });
      const body = await parseBody(res);
      expect(body.details).toEqual({ reason: 'missing field' });
    });
  });

  describe('unauthorized', () => {
    it('should return 401 with default message', async () => {
      const res = unauthorized();
      expect(res.status).toBe(401);
      const body = await parseBody(res);
      expect(body.error.message).toBe('Unauthorized');
    });

    it('should accept custom message', async () => {
      const res = unauthorized('Token expired');
      const body = await parseBody(res);
      expect(body.error.message).toBe('Token expired');
    });
  });

  describe('forbidden', () => {
    it('should return 403 with default message', async () => {
      const res = forbidden();
      expect(res.status).toBe(403);
      const body = await parseBody(res);
      expect(body.error.message).toBe('Forbidden');
    });

    it('should accept custom message', async () => {
      const res = forbidden('Admin only');
      const body = await parseBody(res);
      expect(body.error.message).toBe('Admin only');
    });
  });

  describe('notFound', () => {
    it('should return 404 with default message', async () => {
      const res = notFound();
      expect(res.status).toBe(404);
      const body = await parseBody(res);
      expect(body.error.message).toBe('Not found');
    });

    it('should accept custom message', async () => {
      const res = notFound('Product not found');
      const body = await parseBody(res);
      expect(body.error.message).toBe('Product not found');
    });
  });

  describe('conflict', () => {
    it('should return 409', async () => {
      const res = conflict('Already exists');
      expect(res.status).toBe(409);
      const body = await parseBody(res);
      expect(body.error.message).toBe('Already exists');
    });
  });

  describe('serverError', () => {
    it('should return 500', async () => {
      const res = serverError();
      expect(res.status).toBe(500);
    });

    it('should handle Error objects', async () => {
      const res = serverError(new Error('Database connection failed'));
      const body = await parseBody(res);
      expect(body.error.message).toBe('Database connection failed');
    });

    it('should handle string errors', async () => {
      const res = serverError('Something went wrong');
      const body = await parseBody(res);
      expect(body.error.message).toBe('Something went wrong');
    });

    it('should handle unknown errors', async () => {
      const res = serverError(42);
      const body = await parseBody(res);
      expect(body.error.message).toBe('Internal server error');
    });
  });
});
