/**
 * Settings Service Tests
 *
 * Unit tests for SettingsService
 */

import { describe, it, expect } from 'vitest';

import { SettingsService } from '../service';

describe('SettingsService', () => {
  const mockShopOwnerId = 'shop-123';

  describe('getBusinessProfileSettings', () => {
    it('returns business profile settings structure', async () => {
      const result =
        await SettingsService.getBusinessProfileSettings(mockShopOwnerId);

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('shopName');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('contactEmail');
      expect(result).toHaveProperty('contactPhone');
      expect(result).toHaveProperty('address');
    });
  });

  describe('updateBusinessProfileSettings', () => {
    it('returns updated business profile settings', async () => {
      const result = await SettingsService.updateBusinessProfileSettings(
        mockShopOwnerId,
        {
          shopName: 'Updated Shop Name',
        },
      );

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('shopName');
    });
  });

  describe('getShippingSettings', () => {
    it('returns shipping settings structure', async () => {
      const result = await SettingsService.getShippingSettings(mockShopOwnerId);

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('defaultCarrier');
      expect(result).toHaveProperty('freeShippingThreshold');
      expect(result).toHaveProperty('handlingFee');
      expect(result).toHaveProperty('shippingZones');
    });
  });

  describe('updateShippingSettings', () => {
    it('returns updated shipping settings', async () => {
      const result = await SettingsService.updateShippingSettings(
        mockShopOwnerId,
        {
          defaultCarrier: 'FedEx',
        },
      );

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('defaultCarrier');
    });
  });

  describe('getTaxSettings', () => {
    it('returns tax settings structure', async () => {
      const result = await SettingsService.getTaxSettings(mockShopOwnerId);

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('taxEnabled');
      expect(result).toHaveProperty('taxRate');
      expect(result).toHaveProperty('taxIncluded');
      expect(result).toHaveProperty('taxRegions');
    });
  });

  describe('updateTaxSettings', () => {
    it('returns updated tax settings', async () => {
      const result = await SettingsService.updateTaxSettings(mockShopOwnerId, {
        taxRate: 18,
      });

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('taxRate');
    });
  });

  describe('getPaymentSettings', () => {
    it('returns payment settings structure', async () => {
      const result = await SettingsService.getPaymentSettings(mockShopOwnerId);

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('enabledMethods');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('autoCapture');
    });
  });

  describe('updatePaymentSettings', () => {
    it('returns updated payment settings', async () => {
      const result = await SettingsService.updatePaymentSettings(
        mockShopOwnerId,
        {
          currency: 'USD',
        },
      );

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('currency');
    });
  });

  describe('getNotificationSettings', () => {
    it('returns notification settings structure', async () => {
      const result =
        await SettingsService.getNotificationSettings(mockShopOwnerId);

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('emailNotifications');
      expect(result).toHaveProperty('smsNotifications');
      expect(result).toHaveProperty('pushNotifications');
    });
  });

  describe('updateNotificationSettings', () => {
    it('returns updated notification settings', async () => {
      const result = await SettingsService.updateNotificationSettings(
        mockShopOwnerId,
        {
          emailNotifications: {
            newOrder: true,
            orderUpdated: true,
            lowStock: true,
            returnRequested: true,
          },
        },
      );

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('emailNotifications');
    });
  });

  describe('getStaffSettings', () => {
    it('returns staff settings structure', async () => {
      const result = await SettingsService.getStaffSettings(mockShopOwnerId);

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('staff');
    });
  });

  describe('updateStaffSettings', () => {
    it('returns updated staff settings', async () => {
      const result = await SettingsService.updateStaffSettings(
        mockShopOwnerId,
        {
          staff: [],
        },
      );

      expect(result).toHaveProperty('shopId');
      expect(result).toHaveProperty('staff');
    });
  });
});
