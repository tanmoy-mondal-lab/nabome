/**
 * Coupons seed module
 * Seeds discount coupons
 */

import type { SeedModule, SeedContext, SeedResult } from '../shared/types';
import { registry } from '../shared/registry';
import { DiscountType, Gender } from '@prisma/client';

// Helper function to calculate end date
function getEndDate(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

// Helper function to calculate start date
function getStartDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Realistic coupon configurations
const coupons = [
  // Percentage discount coupons
  {
    code: 'WELCOME20',
    description: 'Welcome offer - 20% off your first order',
    discountType: DiscountType.percentage,
    discountValue: 20,
    minOrderValue: 500,
    maxDiscount: 500,
    usageLimit: 1000,
    perUserLimit: 1,
    applicableGender: null,
    isActive: true,
    startDate: getStartDate(30),
    endDate: getEndDate(365),
  },
  {
    code: 'FESTIVE15',
    description: 'Festive season special - 15% off',
    discountType: DiscountType.percentage,
    discountValue: 15,
    minOrderValue: 1000,
    maxDiscount: 1000,
    usageLimit: 5000,
    perUserLimit: 3,
    applicableGender: null,
    isActive: true,
    startDate: getStartDate(7),
    endDate: getEndDate(30),
  },
  {
    code: 'SUMMER25',
    description: 'Summer sale - 25% off summer collection',
    discountType: DiscountType.percentage,
    discountValue: 25,
    minOrderValue: 1500,
    maxDiscount: 750,
    usageLimit: 2000,
    perUserLimit: 2,
    applicableGender: null,
    isActive: true,
    startDate: getStartDate(1),
    endDate: getEndDate(60),
  },
  // Fixed discount coupons
  {
    code: 'FLAT200',
    description: 'Flat ₹200 off on orders above ₹999',
    discountType: DiscountType.fixed,
    discountValue: 200,
    minOrderValue: 999,
    maxDiscount: null,
    usageLimit: 3000,
    perUserLimit: 5,
    applicableGender: null,
    isActive: true,
    startDate: getStartDate(15),
    endDate: getEndDate(90),
  },
  {
    code: 'SAVE500',
    description: 'Save ₹500 on orders above ₹1999',
    discountType: DiscountType.fixed,
    discountValue: 500,
    minOrderValue: 1999,
    maxDiscount: null,
    usageLimit: 1500,
    perUserLimit: 3,
    applicableGender: null,
    isActive: true,
    startDate: getStartDate(10),
    endDate: getEndDate(45),
  },
  // Gender-specific coupons
  {
    code: 'HERSTYLE10',
    description: 'Women\'s fashion - 10% off',
    discountType: DiscountType.percentage,
    discountValue: 10,
    minOrderValue: 800,
    maxDiscount: 300,
    usageLimit: 2000,
    perUserLimit: 2,
    applicableGender: Gender.women,
    isActive: true,
    startDate: getStartDate(5),
    endDate: getEndDate(120),
  },
  {
    code: 'HISSTYLE10',
    description: 'Men\'s fashion - 10% off',
    discountType: DiscountType.percentage,
    discountValue: 10,
    minOrderValue: 800,
    maxDiscount: 300,
    usageLimit: 2000,
    perUserLimit: 2,
    applicableGender: Gender.men,
    isActive: true,
    startDate: getStartDate(5),
    endDate: getEndDate(120),
  },
  // High-value coupons
  {
    code: 'VIP30',
    description: 'VIP exclusive - 30% off',
    discountType: DiscountType.percentage,
    discountValue: 30,
    minOrderValue: 2000,
    maxDiscount: 1500,
    usageLimit: 100,
    perUserLimit: 1,
    applicableGender: null,
    isActive: true,
    startDate: getStartDate(1),
    endDate: getEndDate(30),
  },
  // Expiring soon coupons
  {
    code: 'FLASH50',
    description: 'Flash sale - 50% off for 24 hours only',
    discountType: DiscountType.percentage,
    discountValue: 50,
    minOrderValue: 500,
    maxDiscount: 1000,
    usageLimit: 500,
    perUserLimit: 1,
    applicableGender: null,
    isActive: true,
    startDate: getStartDate(0),
    endDate: getEndDate(1),
  },
  // Inactive/expired coupons
  {
    code: 'EXPIRED20',
    description: 'Expired coupon - 20% off',
    discountType: DiscountType.percentage,
    discountValue: 20,
    minOrderValue: 500,
    maxDiscount: 500,
    usageLimit: 1000,
    perUserLimit: 1,
    applicableGender: null,
    isActive: false,
    startDate: getStartDate(60),
    endDate: getStartDate(1),
  },
  {
    code: 'COMINGSOON30',
    description: 'Coming soon - 30% off',
    discountType: DiscountType.percentage,
    discountValue: 30,
    minOrderValue: 1000,
    maxDiscount: 750,
    usageLimit: 2000,
    perUserLimit: 2,
    applicableGender: null,
    isActive: false,
    startDate: getEndDate(7),
    endDate: getEndDate(37),
  },
  // Minimum purchase coupons
  {
    code: 'BIGSPENDER',
    description: 'Big spender - ₹1000 off on orders above ₹5000',
    discountType: DiscountType.fixed,
    discountValue: 1000,
    minOrderValue: 5000,
    maxDiscount: null,
    usageLimit: 200,
    perUserLimit: 1,
    applicableGender: null,
    isActive: true,
    startDate: getStartDate(0),
    endDate: getEndDate(180),
  },
  // No minimum purchase coupons
  {
    code: 'NOMIN100',
    description: 'No minimum - ₹100 off any order',
    discountType: DiscountType.fixed,
    discountValue: 100,
    minOrderValue: null,
    maxDiscount: null,
    usageLimit: 5000,
    perUserLimit: 3,
    applicableGender: null,
    isActive: true,
    startDate: getStartDate(20),
    endDate: getEndDate(60),
  },
];

export const couponsModule: SeedModule = {
  name: 'coupons',
  dependsOn: ['settings'],
  idempotent: true,
  transactional: true,
  
  async seed(context: SeedContext): Promise<SeedResult> {
    const startTime = Date.now();
    let count = 0;

    try {
      context.logger.info('Seeding coupons...');
      
      for (const couponData of coupons) {
        await context.prisma.coupon.upsert({
          where: { code: couponData.code },
          update: {
            description: couponData.description,
            discountType: couponData.discountType,
            discountValue: couponData.discountValue,
            minOrderValue: couponData.minOrderValue,
            maxDiscount: couponData.maxDiscount,
            usageLimit: couponData.usageLimit,
            perUserLimit: couponData.perUserLimit,
            applicableGender: couponData.applicableGender,
            isActive: couponData.isActive,
            startDate: couponData.startDate,
            endDate: couponData.endDate,
          },
          create: {
            ...couponData,
            usedCount: 0,
          },
        });
        count++;
      }
      
      context.logger.success(`Seeded ${count} coupons`);
      
      return {
        success: true,
        count,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      context.logger.error('Error seeding coupons:', error);
      return {
        success: false,
        count,
        duration: Date.now() - startTime,
        error: error as Error,
      };
    }
  },
};

registry.register(couponsModule);
