/**
 * Checkout Repository Tests
 *
 * Unit tests for the Checkout Repository
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutRepository } from '../_lib/checkout/repository';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    checkoutSession: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn(),
    },
    address: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    shippingRate: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    taxRule: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  })),
}));

describe('CheckoutRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('should create a new checkout session', async () => {
      const mockSession = {
        id: 'session-1',
        cartId: 'cart-1',
        userId: 'user-1',
        status: 'started',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.checkoutSession.create as any).mockResolvedValue(mockSession);

      const result = await CheckoutRepository.createCheckoutSession(
        'cart-1',
        'user-1',
        new Date(Date.now() + 30 * 60 * 1000),
      );

      expect(prisma.checkoutSession.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cartId: 'cart-1',
          userId: 'user-1',
          status: 'started',
        }),
      });
      expect(result).toBeDefined();
    });
  });

  describe('findCheckoutSessionById', () => {
    it('should find checkout session by ID', async () => {
      const mockSession = {
        id: 'session-1',
        cartId: 'cart-1',
        userId: 'user-1',
        status: 'started',
        expiresAt: new Date(),
      };

      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.checkoutSession.findUnique as any).mockResolvedValue(mockSession);

      const result =
        await CheckoutRepository.findCheckoutSessionById('session-1');

      expect(prisma.checkoutSession.findUnique).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      });
      expect(result).toEqual(mockSession);
    });

    it('should return null if session not found', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.checkoutSession.findUnique as any).mockResolvedValue(null);

      const result =
        await CheckoutRepository.findCheckoutSessionById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findCheckoutSessionByUserId', () => {
    it('should find active checkout session for user', async () => {
      const mockSession = {
        id: 'session-1',
        cartId: 'cart-1',
        userId: 'user-1',
        status: 'started',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };

      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.checkoutSession.findFirst as any).mockResolvedValue(mockSession);

      const result =
        await CheckoutRepository.findCheckoutSessionByUserId('user-1');

      expect(prisma.checkoutSession.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: { in: ['started', 'address_entered', 'payment_pending'] },
          expiresAt: { gt: expect.any(Date) },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe('updateCheckoutSessionStatus', () => {
    it('should update checkout session status', async () => {
      const mockSession = {
        id: 'session-1',
        cartId: 'cart-1',
        userId: 'user-1',
        status: 'address_entered',
        expiresAt: new Date(),
      };

      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.checkoutSession.update as any).mockResolvedValue(mockSession);

      const result = await CheckoutRepository.updateCheckoutSessionStatus(
        'session-1',
        'address_entered',
      );

      expect(prisma.checkoutSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: { status: 'address_entered' },
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe('updateCheckoutSessionAddresses', () => {
    it('should update checkout session addresses', async () => {
      const mockSession = {
        id: 'session-1',
        cartId: 'cart-1',
        userId: 'user-1',
        status: 'address_entered',
        shippingAddressId: 'address-1',
        expiresAt: new Date(),
      };

      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.checkoutSession.update as any).mockResolvedValue(mockSession);

      const result = await CheckoutRepository.updateCheckoutSessionAddresses(
        'session-1',
        'address-1',
        null,
      );

      expect(prisma.checkoutSession.update).toHaveBeenCalledWith({
        where: { id: 'session-1' },
        data: {
          shippingAddressId: 'address-1',
          billingAddressId: null,
          status: 'address_entered',
        },
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe('deleteCheckoutSession', () => {
    it('should delete checkout session', async () => {
      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.checkoutSession.delete as any).mockResolvedValue({
        id: 'session-1',
      });

      await CheckoutRepository.deleteCheckoutSession('session-1');

      expect(prisma.checkoutSession.delete).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      });
    });
  });

  describe('createAddress', () => {
    it('should create new address', async () => {
      const mockAddress = {
        id: 'address-1',
        userId: 'user-1',
        name: 'John Doe',
        phone: '9876543210',
        line1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
        type: 'home',
        isDefault: false,
      };

      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.address.create as any).mockResolvedValue(mockAddress);

      const result = await CheckoutRepository.createAddress('user-1', {
        name: 'John Doe',
        phone: '9876543210',
        line1: '123 Main St',
        line2: null,
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
        type: 'home',
        isDefault: false,
      });

      expect(prisma.address.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          name: 'John Doe',
        }),
      });
      expect(result).toEqual(mockAddress);
    });
  });

  describe('findAddressesByUserId', () => {
    it('should get all addresses for user', async () => {
      const mockAddresses = [
        {
          id: 'address-1',
          userId: 'user-1',
          name: 'John Doe',
          phone: '9876543210',
          line1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'IN',
          type: 'home',
          isDefault: true,
        },
      ];

      const prisma = new (await import('@prisma/client')).PrismaClient();
      (prisma.address.findMany as any).mockResolvedValue(mockAddresses);

      const result = await CheckoutRepository.findAddressesByUserId('user-1');

      expect(prisma.address.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      expect(result).toEqual(mockAddresses);
    });
  });
});
