export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  minimumPurchase: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  profileId: string;
  orderId: string;
  discountAmount: number;
  createdAt: string;
}
