import { prisma } from "../_lib/prisma";
import { success, badRequest, serverError, unauthorized } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { generateOrderNumber } from "../../src/lib/utils/format";
import { sendEmailNotification } from "../_lib/email";
import { logAction, extractRequestMeta } from "../_lib/audit";

const VALID_PAYMENT_METHODS = ["cod", "card", "upi", "netbanking", "wallet", "razorpay"] as const;
const STANDARD_SHIPPING = 99;
const DEFAULT_FREE_THRESHOLD = 999;
const DEFAULT_TAX_RATE = 5; // percentage (5%)

function validateAddressFields(addr: Record<string, unknown>, label: string): string | null {
  const required = ["fullName", "phone", "line1", "city", "state", "pincode"];
  for (const field of required) {
    if (!addr[field] || typeof addr[field] !== "string" || !(addr[field] as string).trim()) {
      return `${label} address: ${field} is required`;
    }
  }
  return null;
}

async function createRazorpayOrder(
  amount: number,
  currency: string,
  receipt: string
): Promise<string> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes: { receipt },
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Razorpay error: ${errBody}`);
  }
  const data = await res.json();
  return data.id;
}

export async function handleCheckoutRequest(
  req: Request,
  ctx: RequestContext,
  _params: string[] = [],
  action: string = "checkout"
): Promise<Response> {
  const isGuest = action === "guest";

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const {
    email,
    shippingAddressId,
    shippingAddress,
    billingAddressId,
    billingAddress,
    sameAsShipping,
    couponCode,
    giftMessage,
    notes,
    paymentMethod,
    items: guestItems,
  } = body as Record<string, unknown>;

  if (!email || typeof email !== "string" || !email.trim()) {
    return badRequest("Email is required");
  }

  if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod as typeof VALID_PAYMENT_METHODS[number])) {
    return badRequest(
      `Invalid payment method. Must be one of: ${VALID_PAYMENT_METHODS.join(", ")}`
    );
  }

  try {
    // ── Resolve cart items ──
    interface CartItemData {
      variantId: string;
      quantity: number;
      variant: {
        id: string;
        productId: string;
        sku: string;
        size: string;
        color: string;
        stock: number;
        priceAdjustment: number;
        product: { id: string; name: string; basePrice: number };
        images: { url: string }[];
      };
    }

    let cartItems: CartItemData[] = [];

    // Priority 1: Items from request body (always use if provided — covers both guest and authenticated with localStorage cart)
    if (Array.isArray(guestItems) && guestItems.length > 0) {
      const variantIds = guestItems.map((i: Record<string, unknown>) => i.variantId).filter(Boolean) as string[];
      const variants = await prisma.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: {
          product: true,
          images: { take: 1, where: { isPrimary: true } },
        },
      });
      const variantMap = new Map(variants.map((v) => [v.id, v]));
      cartItems = guestItems.map((item: Record<string, unknown>) => {
        const variant = variantMap.get(item.variantId as string);
        if (!variant) throw new Error(`Variant ${item.variantId} not found`);
        return {
          variantId: variant.id,
          quantity: Number(item.quantity) || 1,
          variant: {
            id: variant.id,
            productId: variant.productId,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            priceAdjustment: Number(variant.priceAdjustment),
            product: {
              id: variant.product.id,
              name: variant.product.name,
              basePrice: Number(variant.product.basePrice),
            },
            images: variant.images as { url: string }[],
          },
        };
      });
    }

    // Priority 2: Fallback to server-side cart for authenticated users (if no items in request body)
    if (cartItems.length === 0 && ctx.userId) {
      const cart = await prisma.cart.findUnique({
        where: { profileId: ctx.userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                  images: { take: 1, where: { isPrimary: true } },
                },
              },
            },
          },
        },
      });
      if (cart && cart.items.length > 0) {
        cartItems = cart.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          variant: {
            id: item.variant.id,
            productId: item.variant.productId,
            sku: item.variant.sku,
            size: item.variant.size,
            color: item.variant.color,
            stock: item.variant.stock,
            priceAdjustment: Number(item.variant.priceAdjustment),
            product: {
              id: item.variant.product.id,
              name: item.variant.product.name,
              basePrice: Number(item.variant.product.basePrice),
            },
            images: item.variant.images as { url: string }[],
          },
        }));
      }
    }

    if (cartItems.length === 0) {
      return badRequest("Cart is empty. Add items to your cart before checkout.");
    }

    // ── Stock validation ──
    for (const item of cartItems) {
      if (item.quantity > item.variant.stock) {
        return badRequest(
          `Insufficient stock for ${item.variant.product.name} (${item.variant.size}/${item.variant.color})`
        );
      }
    }

    // ── Resolve or create guest profile ──
    let profileId = ctx.userId ?? null;
    if (!isGuest && !profileId) {
      const existing = await prisma.profile.findUnique({ where: { email: email as string } });
      if (existing) {
        profileId = existing.id;
      } else {
        const guest = await prisma.profile.create({
          data: {
            email: email as string,
            firstName: (email as string).split("@")[0] || "Guest",
          },
        });
        profileId = guest.id;
      }
    }

    // ── Address validation and resolution ──
    if (shippingAddressId && typeof shippingAddressId !== "string") {
      return badRequest("shippingAddressId must be a string");
    }
    if (billingAddressId && typeof billingAddressId !== "string") {
      return badRequest("billingAddressId must be a string");
    }

    if (shippingAddress && typeof shippingAddress === "object") {
      const err = validateAddressFields(shippingAddress as Record<string, unknown>, "Shipping");
      if (err) return badRequest(err);
    }
    if (billingAddress && typeof billingAddress === "object") {
      const err = validateAddressFields(billingAddress as Record<string, unknown>, "Billing");
      if (err) return badRequest(err);
    }

    const resolveAddress = async (
      addrBody: unknown,
      addrId: unknown,
      type: string
    ): Promise<string | null> => {
      if (typeof addrId === "string") return addrId;
      if (addrBody && typeof addrBody === "object" && profileId) {
        const a = addrBody as Record<string, unknown>;
        const addr = await prisma.address.create({
          data: {
            profileId,
            fullName: a.fullName as string,
            phone: a.phone as string,
            line1: a.line1 as string,
            line2: (a.line2 as string) || null,
            city: a.city as string,
            district: (a.district as string) || null,
            state: a.state as string,
            pincode: a.pincode as string,
            country: (a.country as string) || "India",
            addressType: type,
          },
        });
        return addr.id;
      }
      return null;
    };

    const resolvedShippingId = await resolveAddress(
      shippingAddress,
      shippingAddressId,
      "shipping"
    );

    const sameShip = sameAsShipping === true || sameAsShipping === "true";
    let resolvedBillingId: string | null = null;
    if (sameShip || (!billingAddressId && !billingAddress)) {
      resolvedBillingId = resolvedShippingId;
    } else {
      resolvedBillingId = await resolveAddress(billingAddress, billingAddressId, "billing");
    }

    // ── Calculate totals ──
    let subtotal = 0;
    for (const item of cartItems) {
      const price = item.variant.product.basePrice + item.variant.priceAdjustment;
      subtotal += price * item.quantity;
    }

    const settings = await prisma.siteSetting.findFirst();
    const taxRate = settings ? Number(settings.taxRate) : DEFAULT_TAX_RATE;
    const freeThreshold = settings?.freeShippingThreshold
      ? Number(settings.freeShippingThreshold)
      : DEFAULT_FREE_THRESHOLD;

    const shippingCost = subtotal >= freeThreshold ? 0 : STANDARD_SHIPPING;
    const tax = Math.round(subtotal * taxRate) / 100;

    // ── Coupon application ──
    let discount = 0;
    let appliedCouponId: string | null = null;
    if (couponCode && typeof couponCode === "string") {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (
        coupon &&
        coupon.isActive &&
        coupon.startDate <= new Date() &&
        coupon.endDate >= new Date()
      ) {
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
          appliedCouponId = coupon.id;
        }
      }
    }

    const total = Math.max(0, Math.round((subtotal + shippingCost + tax - discount) * 100) / 100);

    // ── Create order in transaction ──
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          profileId,
          email: email as string,
          status: "pending",
          subtotal,
          shippingCost,
          tax,
          discount,
          couponCode: typeof couponCode === "string" ? couponCode.toUpperCase() : null,
          total,
          currency: "INR",
          paymentMethod: paymentMethod as string,
          paymentStatus: "pending",
          shippingAddressId: resolvedShippingId,
          billingAddressId: resolvedBillingId,
          giftMessage: typeof giftMessage === "string" ? giftMessage : null,
          notes: typeof notes === "string" ? notes : null,
          items: {
            create: cartItems.map((item) => {
              const unitPrice = item.variant.product.basePrice + item.variant.priceAdjustment;
              return {
                productId: item.variant.productId,
                variantId: item.variantId,
                productName: item.variant.product.name,
                variantLabel: `${item.variant.size} / ${item.variant.color}`,
                sku: item.variant.sku,
                quantity: item.quantity,
                unitPrice,
                totalPrice: unitPrice * item.quantity,
                imageUrl: item.variant.images[0]?.url ?? null,
              };
            }),
          },
          statusHistory: {
            create: {
              status: "pending",
              note: "Order placed",
              createdBy: profileId,
            },
          },
        },
        include: { items: true },
      });

      // Decrement stock in batch
      await Promise.all(
        cartItems.map((item) =>
          tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
              reservedStock: { increment: item.quantity },
            },
          })
        )
      );

      // Record inventory movements in batch
      await tx.inventoryMovement.createMany({
        data: cartItems.map((item) => ({
          variantId: item.variantId,
          quantityChange: -item.quantity,
          stockAfter: item.variant.stock - item.quantity,
          reason: "order",
          referenceId: newOrder.orderNumber,
        })),
      });

      // Update coupon usage
      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });
        if (profileId) {
          await tx.couponRedemption.create({
            data: {
              couponId: appliedCouponId,
              orderId: newOrder.id,
              profileId,
            },
          });
        }
      }

      // Clear cart
      if (ctx.userId) {
        const cart = await tx.cart.findUnique({ where: { profileId: ctx.userId } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
      }

      // Notification
      if (profileId) {
        await tx.notification.create({
          data: {
            profileId,
            orderId: newOrder.id,
            type: "order_placed",
            channel: "in_app",
            title: "Order Placed",
            body: `Order ${newOrder.orderNumber} has been placed successfully.`,
            data: { orderNumber: newOrder.orderNumber },
          },
        });
      }

      return newOrder;
    }, { timeout: 15000 });

    // ── Create Razorpay order for online payments ──
    let razorpayOrderId: string | null = null;
    if (paymentMethod !== "cod") {
      razorpayOrderId = await createRazorpayOrder(total, "INR", order.orderNumber);
      await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId },
      });
    }

    // ── Send order confirmation email ──
    try {
      await sendEmailNotification("order_confirmation", {
        orderNumber: order.orderNumber,
        customerName: order.email?.split("@")[0] || "Valued Customer",
        email: order.email,
        total: `₹${total.toLocaleString("en-IN")}`,
        paymentMethod: paymentMethod as string,
        items: order.items?.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: `₹${Number(item.totalPrice).toLocaleString("en-IN")}`,
          image: item.imageUrl,
        })) || [],
        orderId: order.id,
      }, { profileId: profileId, orderId: order.id });
    } catch (emailErr) {
      console.error("[EMAIL] Failed to send order confirmation:", (emailErr as Error).message);
    }

    logAction(profileId, "order.placed", {
      entity: "order",
      entityId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        total: Number(order.total),
        paymentMethod,
        isGuest: !profileId,
      },
      ...extractRequestMeta(req),
    });

    return success({ order, razorpayOrderId });
  } catch (err) {
    return serverError(err);
  }
}
