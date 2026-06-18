import { prisma } from "../_lib/prisma";
import { success, badRequest, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { generateOrderNumber } from "../../src/lib/utils/format";

export async function handleCheckoutRequest(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  if (!ctx.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { shippingAddressId, billingAddressId, email, couponCode, giftMessage, notes } = body;

  if (!shippingAddressId || !email) {
    return badRequest("Shipping address and email are required");
  }

  try {
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { profileId: ctx.userId },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true, images: { take: 1, where: { isPrimary: true } } },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return badRequest("Cart is empty");
    }

    // Validate stock
    for (const item of cart.items) {
      if (item.quantity > item.variant.stock) {
        return badRequest(
          `Insufficient stock for ${item.variant.product.name} (${item.variant.size}/${item.variant.color})`
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      const price = Number(item.variant.product.basePrice) + Number(item.variant.priceAdjustment);
      subtotal += price * item.quantity;
    }

    const shippingCost = 0; // Could be calculated based on weight/address
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST

    // Apply coupon if provided
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive && coupon.startDate <= new Date() && coupon.endDate >= new Date()) {
        if (subtotal >= Number(coupon.minOrderValue ?? 0)) {
          if (coupon.discountType === "percentage") {
            discount = Math.min(
              subtotal * (Number(coupon.discountValue) / 100),
              Number(coupon.maxDiscount ?? Infinity)
            );
          } else {
            discount = Number(coupon.discountValue);
          }
          discount = Math.round(discount * 100) / 100;
        }
      }
    }

    const total = Math.max(0, subtotal + shippingCost + tax - discount);

    // Create order
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          profileId: ctx.userId!,
          email,
          status: "pending",
          subtotal,
          shippingCost,
          tax,
          discount,
          couponCode: couponCode?.toUpperCase() ?? null,
          total,
          currency: "INR",
          paymentMethod: "razorpay",
          paymentStatus: "pending",
          shippingAddressId,
          billingAddressId: billingAddressId ?? shippingAddressId,
          giftMessage: giftMessage ?? null,
          notes: notes ?? null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.variant.productId,
              variantId: item.variantId,
              productName: item.variant.product.name,
              variantLabel: `${item.variant.size} / ${item.variant.color}`,
              sku: item.variant.sku,
              quantity: item.quantity,
              unitPrice: Number(item.variant.product.basePrice) + Number(item.variant.priceAdjustment),
              totalPrice: (Number(item.variant.product.basePrice) + Number(item.variant.priceAdjustment)) * item.quantity,
              imageUrl: item.variant.images[0]?.url ?? null,
            })),
          },
          statusHistory: {
            create: {
              status: "pending",
              note: "Order placed",
              createdBy: ctx.userId,
            },
          },
        },
        include: { items: true },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
            reservedStock: { increment: item.quantity },
          },
        });

        // Record inventory movement
        await tx.inventoryMovement.create({
          data: {
            variantId: item.variantId,
            quantityChange: -item.quantity,
            stockAfter: item.variant.stock - item.quantity,
            reason: "order",
            referenceId: newOrder.orderNumber,
          },
        });
      }

      // Create Razorpay order (placeholder — actual integration in frontend)
      // In production, call Razorpay API here to create an order

      // Update coupon usage
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
        });
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
          await tx.couponRedemption.create({
            data: {
              couponId: coupon.id,
              orderId: newOrder.id,
              profileId: ctx.userId!,
            },
          });
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return success({
      order,
      razorpayOrderId: null, // Will be set after Razorpay integration
    });
  } catch (err) {
    return serverError(err);
  }
}
