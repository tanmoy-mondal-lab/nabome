/**
 * Settings seed module
 * Seeds site settings, configurations, and defaults
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';

export const settingsModule: SeedModule = {
  name: 'settings',
  dependsOn: [],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      // Seed site settings
      const siteSettings = await context.prisma.siteSetting.upsert({
        where: { id: 'default' },
        update: {},
        create: {
          id: 'default',
          siteName: 'নবME',
          tagline: 'Celebrating Traditional Craftsmanship',
          contactEmail: 'support@nabome.com',
          contactPhone: '+91 98765 43210',
          address: '123 Fashion Street, Bangalore, Karnataka 560001',
          currency: 'INR',
          taxRate: 18,
          freeShippingThreshold: 1000,
          aboutUs: {
            title: 'About নবME',
            content: 'Premium fashion marketplace celebrating traditional Indian craftsmanship with contemporary design.',
          },
          shippingInfo: {
            title: 'Shipping Information',
            content: 'Free shipping on orders above ₹1000. Standard delivery 5-7 business days.',
          },
          returnPolicy: {
            title: 'Return Policy',
            content: 'Easy returns within 30 days of delivery. No questions asked.',
          },
          preferences: {
            defaultLanguage: 'en',
            defaultTimezone: 'Asia/Kolkata',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: 'en-IN',
            enableGuestCheckout: true,
            enableReviews: true,
            enableWishlist: true,
            enableCompare: false,
            enableStockAlerts: true,
            lowStockThreshold: 5,
            outOfStockThreshold: 0,
            enablePreorders: false,
            enableBackorders: false,
            maintenanceMode: false,
            registrationEnabled: true,
            sellerApprovalRequired: true,
            reviewModeration: true,
            maxUploadSize: 10485760,
            defaultPagination: 12,
            featuredProductsCount: 8,
            newProductsCount: 8,
            saleProductsCount: 8,
            enableAnalytics: true,
            enableNewsletter: true,
          },
          seo: {
            metaTitleTemplate: '%s | নবME',
            metaDescriptionTemplate: 'Shop %s at নবME - Premium fashion marketplace.',
            robots: 'index,follow',
          },
        },
      });
      count++;

      // Seed social media links
      const socialPlatforms = [
        { platform: 'facebook', url: 'https://facebook.com/nabome', label: 'Facebook' },
        { platform: 'instagram', url: 'https://instagram.com/nabome', label: 'Instagram' },
        { platform: 'twitter', url: 'https://twitter.com/nabome', label: 'Twitter' },
        { platform: 'pinterest', url: 'https://pinterest.com/nabome', label: 'Pinterest' },
        { platform: 'youtube', url: 'https://youtube.com/@nabome', label: 'YouTube' },
      ];

      for (const social of socialPlatforms) {
        const existing = await context.prisma.socialMediaLink.findFirst({
          where: { platform: social.platform },
        });

        if (existing) {
          await context.prisma.socialMediaLink.update({
            where: { id: existing.id },
            data: {
              url: social.url,
              label: social.label,
              isActive: true,
            },
          });
        } else {
          await context.prisma.socialMediaLink.create({
            data: {
              platform: social.platform,
              url: social.url,
              label: social.label,
              isActive: true,
              sortOrder: 0,
            },
          });
        }
        count++;
      }

      context.logger.success(`Seeded ${count} settings records`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(settingsModule);
