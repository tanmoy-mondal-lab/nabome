// ─────────────────────────────────────────────────────────────
// NABOME — User Data Export (GDPR Compliance)
// Allows users to export their personal data
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "../_lib/prisma";
import { success, badRequest, unauthorized, serverError } from "../_lib/response";
import { authenticate } from "../_lib/auth-middleware";
import type { RequestContext } from "../_lib/types";

export async function handleDataExportRequest(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  const authResult = await authenticate(req, { required: true }, ctx.env);
  if (authResult instanceof Response) return authResult;
  
  const profileId = authResult.ctx.userId;

  if (req.method !== "POST") {
    return badRequest("Method not allowed");
  }

  try {
    const prisma = getPrisma(ctx.env);

    if (!profileId) {
      return unauthorized("User not authenticated");
    }

    // Fetch all user-related data
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        marketingOptIn: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      return badRequest("User not found");
    }

    const addresses = await prisma.address.findMany({
      where: { profileId },
      select: {
        id: true,
        label: true,
        fullName: true,
        phone: true,
        line1: true,
        line2: true,
        city: true,
        district: true,
        state: true,
        pincode: true,
        country: true,
        isDefault: true,
        addressType: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const orders = await prisma.order.findMany({
      where: { profileId },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        status: true,
        subtotal: true,
        shippingCost: true,
        tax: true,
        discount: true,
        total: true,
        currency: true,
        paymentMethod: true,
        paymentStatus: true,
        shippedAt: true,
        deliveredAt: true,
        cancelledAt: true,
        cancellationReason: true,
        refundedAt: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            variantLabel: true,
            sku: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            isReturned: true,
            returnQuantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { profileId },
      select: {
        id: true,
        variantId: true,
        createdAt: true,
        variant: {
          select: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
            size: true,
            color: true,
            priceAdjustment: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const reviews = await prisma.review.findMany({
      where: { profileId },
      select: {
        id: true,
        rating: true,
        title: true,
        body: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
        product: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const supportTickets = await prisma.supportTicket.findMany({
      where: { profileId },
      select: {
        id: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true,
        replies: {
          select: {
            id: true,
            message: true,
            isStaff: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const returnRequests = await prisma.returnRequest.findMany({
      where: { profileId },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const loginAttempts = await prisma.loginAttempt.findMany({
      where: { profileId },
      select: {
        id: true,
        email: true,
        ipAddress: true,
        userAgent: true,
        success: true,
        failReason: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50, // Limit to last 50 attempts
    });

    const userActionLogs = await prisma.userActionLog.findMany({
      where: { profileId },
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 actions
    });

    const notifications = await prisma.notification.findMany({
      where: { profileId },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        isRead: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      profile,
      addresses,
      orders,
      wishlistItems,
      reviews,
      supportTickets,
      returnRequests,
      loginAttempts,
      userActionLogs,
      notifications,
    };

    // Log the export for audit trail
    await prisma.userActionLog.create({
      data: {
        profileId,
        action: "data_export",
        entity: "profile",
        entityId: profileId,
        metadata: {
          exportDate: exportData.exportDate,
          dataTypes: Object.keys(exportData).filter((k) => k !== "exportDate"),
        },
        ipAddress: req.headers.get("CF-Connecting-IP") || null,
        userAgent: req.headers.get("User-Agent") || null,
      },
    });

    return success({
      data: exportData,
      filename: `nabome-data-export-${profileId}-${Date.now()}.json`,
    });
  } catch (err) {
    return serverError(err);
  }
}

export async function handleDataDeleteRequest(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  const authResult = await authenticate(req, { required: true }, ctx.env);
  if (authResult instanceof Response) return authResult;
  
  const profileId = authResult.ctx.userId;

  if (req.method !== "POST") {
    return badRequest("Method not allowed");
  }

  try {
    const body = await req.json();
    const { confirmation } = body;

    if (confirmation !== "DELETE_MY_DATA") {
      return badRequest("Confirmation required. Please send confirmation: 'DELETE_MY_DATA'");
    }

    const prisma = getPrisma(ctx.env);

    if (!profileId) {
      return unauthorized("User not authenticated");
    }

    // Check if user has active orders
    const activeOrders = await prisma.order.count({
      where: {
        profileId,
        status: { notIn: ["delivered", "cancelled", "returned", "refunded"] },
      },
    });

    if (activeOrders > 0) {
      return badRequest("Cannot delete account with active orders. Please complete or cancel all orders first.");
    }

    // Soft delete - anonymize data instead of hard delete
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        email: `deleted-${profileId}@nabome.local`,
        firstName: "Deleted",
        lastName: "User",
        phone: null,
        avatarUrl: null,
        isActive: false,
        marketingOptIn: false,
      },
    });

    // Log the deletion for audit trail
    await prisma.userActionLog.create({
      data: {
        profileId,
        action: "data_deletion",
        entity: "profile",
        entityId: profileId,
        metadata: {
          deletionType: "soft_delete",
          deletedAt: new Date().toISOString(),
        },
        ipAddress: req.headers.get("CF-Connecting-IP") || null,
        userAgent: req.headers.get("User-Agent") || null,
      },
    });

    return success({
      message: "Your data has been anonymized. Your account has been deactivated.",
    });
  } catch (err) {
    return serverError(err);
  }
}
