import { type PrismaClient, DiscountType } from '@prisma/client';

export async function seedCoupons(prisma: PrismaClient) {
  const coupons = [
    {
      code: 'WELCOME10',
      description: 'Welcome offer - Get 10% off your first order',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderValue: 500,
      maxDiscount: 200,
      usageLimit: 1000,
      perUserLimit: 1,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
    {
      code: 'SUMMER25',
      description: 'Summer sale - 25% off on all summer collection',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 25,
      minOrderValue: 1000,
      maxDiscount: 500,
      usageLimit: 500,
      perUserLimit: 3,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
    {
      code: 'FLAT500',
      description: 'Flat ₹500 off on orders above ₹2000',
      discountType: DiscountType.FIXED,
      discountValue: 500,
      minOrderValue: 2000,
      maxDiscount: null,
      usageLimit: 200,
      perUserLimit: 2,
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
  }
}
