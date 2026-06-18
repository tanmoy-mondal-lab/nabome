import { prisma } from "../_lib/prisma";
import { success, badRequest, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleCouponRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "validate":
      return handleValidate(ctx, req);
    default:
      return badRequest("Unknown action");
  }
}

async function handleValidate(ctx: RequestContext, req: Request): Promise<Response> {
  const body = await req.json();
  const { code, subtotal, gender } = body;

  if (!code) return badRequest("Coupon code is required");

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return success({ valid: false, message: "Invalid coupon code" });
    }

    const now = new Date();

    if (!coupon.isActive) {
      return success({ valid: false, message: "This coupon is no longer active" });
    }

    if (now < coupon.startDate) {
      return success({ valid: false, message: "This coupon is not yet active" });
    }

    if (now > coupon.endDate) {
      return success({ valid: false, message: "This coupon has expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return success({ valid: false, message: "This coupon has reached its usage limit" });
    }

    if (coupon.applicableGender && gender && coupon.applicableGender !== gender) {
      return success({ valid: false, message: "This coupon is not applicable for this category" });
    }

    if (ctx.userId) {
      const userUsageCount = await prisma.couponRedemption.count({
        where: {
          couponId: coupon.id,
          profileId: ctx.userId,
        },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return success({ valid: false, message: "You have already used this coupon" });
      }
    }

    const orderValue = subtotal ? parseFloat(subtotal) : 0;
    if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue)) {
      return success({
        valid: false,
        message: `Minimum order value of ₹${Number(coupon.minOrderValue).toLocaleString("en-IN")} required`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderValue * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    return success({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        discountAmount: Math.round(discountAmount * 100) / 100,
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
