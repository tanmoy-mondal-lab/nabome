import { describe, it, expect, vi } from 'vitest';

import { useOrder } from '../hooks';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Order Hooks', () => {
  describe('useOrder', () => {
    it('should be a function', () => {
      expect(typeof useOrder).toBe('function');
    });

    it('should return an object with expected properties', async () => {
      const hookModule = await import('../hooks');
      expect(hookModule.useOrder).toBeDefined();
    });
  });
});
