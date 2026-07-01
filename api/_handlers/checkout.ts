import { getPrisma } from "../_lib/prisma";
import { success, badRequest, serverError, unauthorized } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { generateOrderNumber } from "../../src/lib/utils/format";
import { sendEmailNotification } from "../_lib/email";
import { logAction, extractRequestMeta } from "../_lib/audit";
import { cleanSecret } from "../_lib/secrets";
import type { Env } from "../_lib/env";

const VALID_PAYMENT_METHODS = ["cod", "card", "upi", "netbanking", "wallet", "razorpay"] as const;
const STANDARD_SHIPPING = 99;
const DEFAULT_FREE_THRESHOLD = 999;
const DEFAULT_TAX_RATE = 5; // percentage (5%)
const MAX_ITEM_QUANTITY = 20;

class CheckoutError extends Error {}

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
  receipt: string,
  env?: Env
): Promise<string> {
  const keyId = cleanSecret(env?.RAZORPAY_KEY_ID);
  const keySecret = cleanSecret(env?.RAZORPAY_KEY_SECRET);
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
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
  let transientGuestProfileId: string | null = null;
  let completedOrder = false;

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

  if (!isGuest && !ctx.userId) {
    return unauthorized("Authentication is required for customer checkout");
  }

  if (isGuest && (!email || typeof email !== "string" || !email.trim())) {
    return badRequest("Email is required");
  }
  if (typeof email === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return badRequest("A valid email is required");
  }

  if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod as typeof VALID_PAYMENT_METHODS[number])) {
    return badRequest(
      `Invalid payment method. Must be one of: ${VALID_PAYMENT_METHODS.join(", ")}`
    );
  }

  try {
    const prisma = getPrisma(ctx.env);
    let checkoutEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    let profileId = ctx.userId ?? null;

    if (!isGuest) {
      const profile = await prisma.profile.findUnique({
        where: { id: ctx.userId },
        select: { id: true, email: true, isActive: true },
      });
      if (!profile?.isActive) return unauthorized("Account is unavailable");
      checkoutEmail = profile.email;
      profileId = profile.id;
    }

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
        isActive: boolean;
        priceAdjustment: number;
        product: { id: string; name: string; basePrice: number; gender: string; isActive: boolean };
        images: { url: string }[];
      };
    }

    let cartItems: CartItemData[] = [];

    // Priority 1: Items from request body (always use if provided — covers both guest and authenticated with localStorage cart)
    if (Array.isArray(guestItems) && guestItems.length > 0) {
      const requestedQuantities = new Map<string, number>();
      for (const rawItem of guestItems) {
        if (!rawItem || typeof rawItem !== "object") throw new CheckoutError("Invalid cart item");
        const item = rawItem as Record<string, unknown>;
        const variantId = typeof item.variantId === "string" ? item.variantId : "";
        const quantity = Number(item.quantity);
        if (!variantId || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
          throw new CheckoutError(`Each cart quantity must be between 1 and ${MAX_ITEM_QUANTITY}`);
        }
        requestedQuantities.set(variantId, (requestedQuantities.get(variantId) ?? 0) + quantity);
      }
      for (const quantity of requestedQuantities.values()) {
        if (quantity > MAX_ITEM_QUANTITY) {
          throw new CheckoutError(`Each cart quantity must be between 1 and ${MAX_ITEM_QUANTITY}`);
        }
      }

      const variantIds = Array.from(requestedQuantities.keys());
      const variants = await prisma.productVariant.findMany({
        where: {
          id: { in: variantIds },
          isActive: true,
          product: { isActive: true },
        },
        include: {
          product: true,
          images: { take: 1, where: { isPrimary: true } },
        },
      });
      const variantMap = new Map(variants.map((v) => [v.id, v]));
      cartItems = Array.from(requestedQuantities.entries()).map(([variantId, quantity]) => {
        const variant = variantMap.get(variantId);
        if (!variant) throw new CheckoutError("A cart item is unavailable");
        return {
          variantId: variant.id,
          quantity,
          variant: {
            id: variant.id,
            productId: variant.productId,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            isActive: variant.isActive,
            priceAdjustment: Number(variant.priceAdjustment),
            product: {
              id: variant.product.id,
              name: variant.product.name,
              basePrice: Number(variant.product.basePrice),
              gender: variant.product.gender,
              isActive: variant.product.isActive,
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
            isActive: item.variant.isActive,
            priceAdjustment: Number(item.variant.priceAdjustment),
            product: {
              id: item.variant.product.id,
              name: item.variant.product.name,
              basePrice: Number(item.variant.product.basePrice),
              gender: item.variant.product.gender,
              isActive: item.variant.product.isActive,
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
      if (!item.variant.isActive || !item.variant.product.isActive) {
        return badRequest(`${item.variant.product.name} is no longer available`);
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_ITEM_QUANTITY) {
        return badRequest(`Each cart quantity must be between 1 and ${MAX_ITEM_QUANTITY}`);
      }
      if (item.quantity > item.variant.stock) {
        return badRequest(
          `Insufficient stock for ${item.variant.product.name} (${item.variant.size}/${item.variant.color})`
        );
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

    if (isGuest) {
      // Check if a guest profile already exists for this email
      let guestProfile = await prisma.profile.findUnique({
        where: { email: checkoutEmail },
        select: { id: true, preferences: true },
      });

      if (!guestProfile) {
        // Create new guest profile with real email so addresses can be retrieved later
        guestProfile = await prisma.profile.create({
          data: {
            email: checkoutEmail,
            firstName: checkoutEmail.split("@")[0] || "Guest",
            marketingOptIn: false,
            preferences: { guest: true },
            emailVerified: true, // Guest orders don't require email verification
          },
        });
      } else {
        // Update existing profile to mark as guest if not already
        await prisma.profile.update({
          where: { id: guestProfile.id },
          data: { preferences: { ...(guestProfile.preferences as Record<string, unknown> || {}), guest: true } },
        });
      }
      profileId = guestProfile.id;
      transientGuestProfileId = guestProfile.id;
    }

    const resolveAddress = async (
      addrBody: unknown,
      addrId: unknown,
      type: string
    ): Promise<string | null> => {
      if (!profileId) {
        throw new CheckoutError("Checkout profile is missing");
      }
      if (typeof addrId === "string") {
        const ownedAddress = await prisma.address.findFirst({
          where: { id: addrId, profileId },
          select: { id: true },
        });
        if (!ownedAddress) throw new CheckoutError("Address not found");
        return ownedAddress.id;
      }
      if (addrBody && typeof addrBody === "object") {
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
    if (!resolvedShippingId) return badRequest("Shipping address is required");

    const sameShip = sameAsShipping === true || sameAsShipping === "true";
    let resolvedBillingId: string | null = null;
    if (sameShip || (!billingAddressId && !billingAddress)) {
      resolvedBillingId = resolvedShippingId;
    } else {
      resolvedBillingId = await resolveAddress(billingAddress, billingAddressId, "billing");
    }
    if (!resolvedBillingId) return badRequest("Billing address is required");

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
    let appliedCoupon: { id: string; usageLimit: number | null; perUserLimit: number } | null = null;
    if (couponCode && typeof couponCode === "string") {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      const now = new Date();
      if (!coupon || !coupon.isActive || coupon.startDate > now || coupon.endDate < now) {
        throw new CheckoutError("Coupon is invalid or expired");
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new CheckoutError("Coupon has reached its usage limit");
      }
      if (subtotal < Number(coupon.minOrderValue ?? 0)) {
        throw new CheckoutError(
          `Minimum order value of ₹${Number(coupon.minOrderValue).toLocaleString("en-IN")} required`
        );
      }
      if (
        coupon.applicableGender &&
        cartItems.some((item) => item.variant.product.gender !== coupon.applicableGender)
      ) {
        throw new CheckoutError("Coupon is not applicable to every item in this cart");
      }
      const userUsageCount = await prisma.couponRedemption.count({
        where: { couponId: coupon.id, profileId: profileId! },
      });
      if (userUsageCount >= coupon.perUserLimit) {
        throw new CheckoutError("Coupon usage limit reached for this customer");
      }

      if (coupon.discountType === "percentage") {
        discount = Math.min(
          subtotal * (Number(coupon.discountValue) / 100),
          Number(coupon.maxDiscount ?? Infinity)
        );
      } else {
        discount = Number(coupon.discountValue);
      }
      discount = Math.min(subtotal, Math.round(discount * 100) / 100);
      appliedCoupon = {
        id: coupon.id,
        usageLimit: coupon.usageLimit,
        perUserLimit: coupon.perUserLimit,
      };
    }

    const total = Math.max(0, Math.round((subtotal + shippingCost + tax - discount) * 100) / 100);
    const orderNumber = generateOrderNumber();

    // ── Create order in transaction ──
    const order = await prisma.$transaction(async (tx) => {
      // First, reserve stock
      for (const item of cartItems) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            isActive: true,
            stock: { gte: item.quantity },
            product: { isActive: true },
          },
          data: {
            stock: { decrement: item.quantity },
            reservedStock: { increment: item.quantity },
          },
        });
        if (updated.count !== 1) {
          throw new CheckoutError(
            `Insufficient stock for ${item.variant.product.name} (${item.variant.size}/${item.variant.color})`
          );
        }
      }

      // Create Razorpay order inside transaction to ensure atomicity
      let razorpayOrderId: string | null = null;
      if (paymentMethod !== "cod") {
        try {
          razorpayOrderId = await createRazorpayOrder(total, "INR", orderNumber, ctx.env);
        } catch (razorpayError) {
          // If Razorpay fails, rollback the entire transaction (stock will be released)
          throw new CheckoutError(`Payment initialization failed: ${(razorpayError as Error).message}`);
        }
      }

      // Create the database order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          profileId,
          email: checkoutEmail,
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
          razorpayOrderId,
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
      if (appliedCoupon) {
        const couponUpdated = await tx.coupon.updateMany({
          where: {
            id: appliedCoupon.id,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            ...(appliedCoupon.usageLimit !== null
              ? { usedCount: { lt: appliedCoupon.usageLimit } }
              : {}),
          },
          data: { usedCount: { increment: 1 } },
        });
        if (couponUpdated.count !== 1) throw new CheckoutError("Coupon is no longer available");

        const userUsageCount = await tx.couponRedemption.count({
          where: { couponId: appliedCoupon.id, profileId: profileId! },
        });
        if (userUsageCount >= appliedCoupon.perUserLimit) {
          throw new CheckoutError("Coupon usage limit reached for this customer");
        }
        await tx.couponRedemption.create({
          data: {
            couponId: appliedCoupon.id,
            orderId: newOrder.id,
            profileId: profileId!,
          },
        });
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
    completedOrder = true;

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
      }, ctx.env);
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
        isGuest,
      },
      ...extractRequestMeta(req),
    });

    return success({ order, razorpayOrderId: order.razorpayOrderId });
  } catch (err) {
    // Guest profiles are now persistent (real email) so no cleanup needed
    // They can be reused for future guest orders
    if (err instanceof CheckoutError) return badRequest(err.message);
    return serverError(err);
  }
}
