import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockPrisma, makeRequest, makeContext, parseResponse } from './test-utils';

vi.mock('../../_lib/prisma', () => ({
  getPrisma: vi.fn(),
}));

import { getPrisma } from '../../_lib/prisma';
import { handleAddressRequest } from '../addresses';

const mockPrisma = createMockPrisma();
vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);

describe('addresses handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPrisma).mockReturnValue(mockPrisma as any);
  });

  describe('handleList', () => {
    it('should return user addresses', async () => {
      mockPrisma.address.findMany.mockResolvedValue([
        { id: 'addr-1', fullName: 'John Doe', isDefault: true },
      ]);

      const req = makeRequest('GET', '/api/addresses');
      const ctx = makeContext('user-1');
      const res = await handleAddressRequest(req, ctx, []);
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.addresses).toHaveLength(1);
    });

    it('should return 401 if not authenticated', async () => {
      const req = makeRequest('GET', '/api/addresses');
      const ctx = makeContext();
      const res = await handleAddressRequest(req, ctx, []);

      expect(res.status).toBe(401);
    });
  });

  describe('handleCreate', () => {
    it('should create address with required fields', async () => {
      mockPrisma.address.create.mockResolvedValue({
        id: 'addr-1',
        fullName: 'John Doe',
        phone: '9876543210',
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      });

      const req = makeRequest('POST', '/api/addresses', {
        fullName: 'John Doe',
        phone: '9876543210',
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      });
      const ctx = makeContext('user-1');
      const res = await handleAddressRequest(req, ctx, []);
      const body = await parseResponse(res);

      expect(res.status).toBe(201);
      expect(body.data.fullName).toBe('John Doe');
    });

    it('should reject missing required fields', async () => {
      const req = makeRequest('POST', '/api/addresses', {
        fullName: 'John Doe',
      });
      const ctx = makeContext('user-1');
      const res = await handleAddressRequest(req, ctx, []);

      expect(res.status).toBe(400);
    });

    it('should unset other defaults when setting default', async () => {
      mockPrisma.address.updateMany.mockResolvedValue({});
      mockPrisma.address.create.mockResolvedValue({ id: 'addr-1' });

      const req = makeRequest('POST', '/api/addresses', {
        fullName: 'John Doe',
        phone: '9876543210',
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true,
      });
      const ctx = makeContext('user-1');
      await handleAddressRequest(req, ctx, []);

      expect(mockPrisma.address.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isDefault: true }),
          data: { isDefault: false },
        })
      );
    });
  });

  describe('handleUpdate', () => {
    it('should update existing address', async () => {
      mockPrisma.address.findFirst.mockResolvedValue({
        id: 'addr-1',
        profileId: 'user-1',
        fullName: 'Old Name',
      });
      mockPrisma.address.update.mockResolvedValue({
        id: 'addr-1',
        fullName: 'New Name',
      });

      const req = makeRequest('PUT', '/api/addresses/addr-1', {
        fullName: 'New Name',
      });
      const ctx = makeContext('user-1');
      const res = await handleAddressRequest(req, ctx, ['addr-1']);
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.fullName).toBe('New Name');
    });

    it('should return 404 for non-existent address', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      const req = makeRequest('PUT', '/api/addresses/nonexistent', {
        fullName: 'Test',
      });
      const ctx = makeContext('user-1');
      const res = await handleAddressRequest(req, ctx, ['nonexistent']);

      expect(res.status).toBe(404);
    });

    it('should only update own addresses', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      const req = makeRequest('PUT', '/api/addresses/addr-1', {
        fullName: 'Hacked',
      });
      const ctx = makeContext('other-user');
      const res = await handleAddressRequest(req, ctx, ['addr-1']);

      expect(res.status).toBe(404);
    });
  });

  describe('handleDelete', () => {
    it('should delete address', async () => {
      mockPrisma.address.findFirst.mockResolvedValue({
        id: 'addr-1',
        profileId: 'user-1',
      });
      mockPrisma.address.delete.mockResolvedValue({});

      const req = makeRequest('DELETE', '/api/addresses/addr-1');
      const ctx = makeContext('user-1');
      const res = await handleAddressRequest(req, ctx, ['addr-1']);
      const body = await parseResponse(res);

      expect(res.status).toBe(200);
      expect(body.data.message).toBe('Address deleted');
    });

    it('should return 404 for non-existent address', async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      const req = makeRequest('DELETE', '/api/addresses/nonexistent');
      const ctx = makeContext('user-1');
      const res = await handleAddressRequest(req, ctx, ['nonexistent']);

      expect(res.status).toBe(404);
    });
  });
});
