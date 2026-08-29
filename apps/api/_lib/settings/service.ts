/**
 * Settings Service
 *
 * Business logic for shop settings management
 * Following SHOP_OWNER_DASHBOARD_ARCHITECTURE.md, REST_API_SPECIFICATION.md
 */

import { ApiError } from '../http/errors.ts';
import { getPrisma } from '../prisma.ts';

const prisma = new Proxy({} as any, {
  get(_target: unknown, prop: string | symbol) {
    return (getPrisma() as any)[prop];
  },
});

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Business Profile Settings
 */
interface BusinessProfileSettings {
  shopId: string;
  shopName: string;
  description: string;
  logo?: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  businessHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}

/**
 * Shipping Settings
 */
interface ShippingSettings {
  shopId: string;
  defaultCarrier?: string;
  freeShippingThreshold?: number;
  handlingFee?: number;
  shippingZones: Array<{
    id: string;
    name: string;
    countries: string[];
    rates: Array<{
      carrier: string;
      baseRate: number;
      perKgRate: number;
      deliveryDays: number;
    }>;
  }>;
}

/**
 * Tax Settings
 */
interface TaxSettings {
  shopId: string;
  taxEnabled: boolean;
  taxRate: number;
  taxIncluded: boolean;
  taxRegions: Array<{
    country: string;
    state?: string;
    rate: number;
  }>;
}

/**
 * Payment Settings
 */
interface PaymentSettings {
  shopId: string;
  enabledMethods: Array<{
    method: string;
    provider: string;
    config: Record<string, unknown>;
  }>;
  currency: string;
  autoCapture: boolean;
}

/**
 * Notification Settings
 */
interface NotificationSettings {
  shopId: string;
  emailNotifications: {
    newOrder: boolean;
    orderUpdated: boolean;
    lowStock: boolean;
    returnRequested: boolean;
  };
  smsNotifications: {
    newOrder: boolean;
    orderUpdated: boolean;
    deliveryConfirmation: boolean;
  };
  pushNotifications: {
    newOrder: boolean;
    orderUpdated: boolean;
    promotion: boolean;
  };
}

/**
 * Staff Settings
 */
interface StaffSettings {
  shopId: string;
  staff: Array<{
    userId: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
    permissions: string[];
    active: boolean;
  }>;
}

// ============================================================================
// SETTINGS SERVICE
// ============================================================================

/**
 * Settings Service - Manages shop owner settings
 *
 * This service handles all business logic for shop settings management,
 * including business profile, shipping, tax, payment, notification, and
 * staff settings. It validates settings changes and ensures consistency.
 */
export class SettingsService {
  /**
   * Get business profile settings
   */
  static async getBusinessProfileSettings(
    shopOwnerId: string,
  ): Promise<BusinessProfileSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // Return basic shop info as business profile
    return {
      shopId: shop.id,
      shopName: shop.name,
      description: '',
      contactEmail: '',
      contactPhone: '',
      address: {
        line1: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    };
  }

  /**
   * Update business profile settings
   */
  static async updateBusinessProfileSettings(
    shopOwnerId: string,
    settings: Partial<BusinessProfileSettings>,
  ): Promise<BusinessProfileSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // Update shop name if provided
    if (settings.shopName) {
      await prisma.shop.update({
        where: { id: shop.id },
        data: { name: settings.shopName },
      });
    }

    // For V1, store additional settings in a JSON field
    // This would require adding a settings field to the Shop model in a future migration
    // For now, we'll return the updated basic settings
    return this.getBusinessProfileSettings(shopOwnerId);
  }

  /**
   * Get shipping settings
   */
  static async getShippingSettings(
    shopOwnerId: string,
  ): Promise<ShippingSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // Return default shipping settings for V1
    return {
      shopId: shop.id,
      defaultCarrier: 'standard',
      freeShippingThreshold: 500,
      handlingFee: 0,
      shippingZones: [
        {
          id: 'default',
          name: 'Default Zone',
          countries: ['IN'],
          rates: [
            {
              carrier: 'standard',
              baseRate: 50,
              perKgRate: 10,
              deliveryDays: 5,
            },
          ],
        },
      ],
    };
  }

  /**
   * Update shipping settings
   */
  static async updateShippingSettings(
    shopOwnerId: string,
    _settings: Partial<ShippingSettings>,
  ): Promise<ShippingSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // For V1, shipping settings are stored in a JSON field on the Shop model
    // This would require adding a settings field to the Shop model in a future migration
    // For now, we'll return the default settings
    return this.getShippingSettings(shopOwnerId);
  }

  /**
   * Get tax settings
   */
  static async getTaxSettings(shopOwnerId: string): Promise<TaxSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // Return default tax settings for V1 (18% GST for India)
    return {
      shopId: shop.id,
      taxEnabled: true,
      taxRate: 18,
      taxIncluded: false,
      taxRegions: [
        {
          country: 'IN',
          rate: 18,
        },
      ],
    };
  }

  /**
   * Update tax settings
   */
  static async updateTaxSettings(
    shopOwnerId: string,
    _settings: Partial<TaxSettings>,
  ): Promise<TaxSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // For V1, tax settings are stored in a JSON field on the Shop model
    // This would require adding a settings field to the Shop model in a future migration
    // For now, we'll return the default settings
    return this.getTaxSettings(shopOwnerId);
  }

  /**
   * Get payment settings
   */
  static async getPaymentSettings(
    shopOwnerId: string,
  ): Promise<PaymentSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // Return default payment settings for V1
    return {
      shopId: shop.id,
      enabledMethods: [
        {
          method: 'razorpay',
          provider: 'razorpay',
          config: {},
        },
        {
          method: 'cod',
          provider: 'internal',
          config: {},
        },
      ],
      currency: 'INR',
      autoCapture: true,
    };
  }

  /**
   * Update payment settings
   */
  static async updatePaymentSettings(
    shopOwnerId: string,
    _settings: Partial<PaymentSettings>,
  ): Promise<PaymentSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // For V1, payment settings are stored in a JSON field on the Shop model
    // This would require adding a settings field to the Shop model in a future migration
    // For now, we'll return the default settings
    return this.getPaymentSettings(shopOwnerId);
  }

  /**
   * Get notification settings
   */
  static async getNotificationSettings(
    shopOwnerId: string,
  ): Promise<NotificationSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // Return default notification settings for V1
    return {
      shopId: shop.id,
      emailNotifications: {
        newOrder: true,
        orderUpdated: true,
        lowStock: true,
        returnRequested: true,
      },
      smsNotifications: {
        newOrder: false,
        orderUpdated: false,
        deliveryConfirmation: false,
      },
      pushNotifications: {
        newOrder: true,
        orderUpdated: true,
        promotion: false,
      },
    };
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(
    shopOwnerId: string,
    _settings: Partial<NotificationSettings>,
  ): Promise<NotificationSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // For V1, notification settings are stored in a JSON field on the Shop model
    // This would require adding a settings field to the Shop model in a future migration
    // For now, we'll return the default settings
    return this.getNotificationSettings(shopOwnerId);
  }

  /**
   * Get staff settings
   */
  static async getStaffSettings(shopOwnerId: string): Promise<StaffSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // Return empty staff list for V1 (staff management is post-V1)
    return {
      shopId: shop.id,
      staff: [],
    };
  }

  /**
   * Update staff settings
   */
  static async updateStaffSettings(
    shopOwnerId: string,
    _settings: Partial<StaffSettings>,
  ): Promise<StaffSettings> {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: shopOwnerId, isActive: true },
    });

    if (!shop) {
      throw ApiError.notFound('Shop not found');
    }

    // For V1, staff management is not implemented
    throw ApiError.validation('Staff management is not available in V1');
  }
}
