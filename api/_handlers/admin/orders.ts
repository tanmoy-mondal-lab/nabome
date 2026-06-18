import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { ORDER_STATUS_FLOW } from "../../../src/lib/constants";
import { sendEmailNotification } from "../../_lib/email";

const orderInclude = {
  items: true,
  statusHistory: {
    orderBy: { createdAt: "asc" as const },
    include: { creator: { select: { firstName: true, lastName: true } } },
  },
  shippingAddress: true,
  billingAddress: true,
  profile: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
};

export async function handleAdminOrderRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list":
      return handleList(req);
    case "stats":
      return handleStats();
    case "detail":
      return handleDetail(params[0]);
    case "updateStatus":
      return handleUpdateStatus(params[0], req, ctx);
    case "internalNotes":
      return handleInternalNotes(params[0], req);
    case "timeline":
      return handleTimeline(params[0]);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const status = url.searchParams.get("status");
  const paymentStatus = url.searchParams.get("paymentStatus");
  const search = url.searchParams.get("search");
  const fromDate = url.searchParams.get("from");
  const toDate = url.searchParams.get("to");
  const sortBy = url.searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") ?? "desc";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) (where.createdAt as Record<string, unknown>).gte = new Date(fromDate);
    if (toDate) (where.createdAt as Record<string, unknown>).lte = new Date(toDate);
  }

  const skip = (page - 1) * limit;
  const orderBy = { [sortBy]: sortOrder };

  try {
    const [orders, total, aggregate] = await Promise.all([
      prisma.order.findMany({
        where: where as never,
        include: {
          items: { take: 3 },
          profile: { select: { firstName: true, lastName: true } },
          statusHistory: { take: 1, orderBy: { createdAt: "desc" } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.order.count({ where: where as never }),
      prisma.order.aggregate({
        where: where as never,
        _sum: { total: true },
        _avg: { total: true },
      }),
    ]);

    return success({
      orders,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
      summary: {
        totalRevenue: aggregate._sum.total ?? 0,
        avgOrderValue: aggregate._avg.total ?? 0,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleStats(): Promise<Response> {
  try {
    const statuses: string[] = [
      "pending", "confirmed", "processing", "packed",
      "shipped", "out_for_delivery", "delivered",
      "cancelled", "returned", "refunded",
    ];

    const statusCounts = await Promise.all(
      statuses.map((s) =>
        prisma.order.count({ where: { status: s as never } })
      )
    );

    const [returnRequestCount, refundRequestCount] = await Promise.all([
      prisma.returnRequest.count(),
      prisma.refund.count({ where: { status: { not: "completed" } as never } }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, todayRevenue] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow } },
        _sum: { total: true },
      }),
    ]);

    const countsByStatus: Record<string, number> = {};
    statuses.forEach((s, i) => { countsByStatus[s] = statusCounts[i]; });

    return success({
      countsByStatus,
      returnRequestCount,
      refundRequestCount,
      today: {
        orders: todayOrders,
        revenue: todayRevenue._sum.total ?? 0,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(orderId: string): Promise<Response> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        ...orderInclude,
        returnRequests: {
          include: { refund: true },
        },
        notifications: {
          orderBy: { createdAt: "desc" },
        },
        supportTickets: true,
      },
    });
    if (!order) return notFound("Order not found");
    return success({ order });
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateStatus(orderId: string, req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();
  const { status, note } = body;

  if (!status) return badRequest("Status is required");

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return notFound("Order not found");

    // Validate status transition
    const allowedTransitions = ORDER_STATUS_FLOW[order.status] ?? [];
    if (!allowedTransitions.includes(status)) {
      return badRequest(
        `Cannot transition from "${order.status}" to "${status}". Allowed: ${allowedTransitions.join(", ") || "none"}`
      );
    }

    const timestampFields: Record<string, Date> = {};
    if (status === "shipped") timestampFields.shippedAt = new Date();
    if (status === "delivered") timestampFields.deliveredAt = new Date();
    if (status === "cancelled") timestampFields.cancelledAt = new Date();
    if (status === "refunded") timestampFields.refundedAt = new Date();

    const notificationEvent = (
      { confirmed: "order_confirmed", shipped: "order_shipped", delivered: "order_delivered", cancelled: "order_cancelled" } as Record<string, string>
    )[status];

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...timestampFields,
          statusHistory: {
            create: {
              status,
              note: note ?? null,
              createdBy: ctx.userId,
            },
          },
        },
        include: orderInclude,
      });

      // Auto-create notification based on status change
      if (notificationEvent && order.profileId) {
        await tx.notification.create({
          data: {
            profileId: order.profileId,
            orderId: orderId,
            type: notificationEvent as never,
            channel: "in_app",
            title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            body: `Your order ${order.orderNumber} has been ${status}.`,
            data: { orderNumber: order.orderNumber, status },
          },
        });
      }

      // If cancelled, restore stock
      if (status === "cancelled") {
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: { increment: item.quantity },
                reservedStock: { decrement: item.quantity },
              },
            });

            await tx.inventoryMovement.create({
              data: {
                variantId: item.variantId,
                quantityChange: item.quantity,
                stockAfter: item.quantity,
                reason: "cancellation",
                referenceId: order.orderNumber,
              },
            });
          }
        }
      }

      return updatedOrder;
    });

    // ── Send shipping/delivery emails ──
    if (order.email) {
      try {
        if (status === "shipped") {
          await sendEmailNotification("shipping_update", {
            orderNumber: order.orderNumber,
            email: order.email,
            trackingNumber: note?.includes("tracking:") ? note.split("tracking:")[1]?.trim() : "",
            estimatedDelivery: "",
            orderId: order.id,
          }, { profileId: order.profileId, orderId: order.id });
        } else if (status === "delivered") {
          await sendEmailNotification("delivery_confirmation", {
            orderNumber: order.orderNumber,
            email: order.email,
            orderId: order.id,
          }, { profileId: order.profileId, orderId: order.id });
        }
      } catch (emailErr) {
        console.error("[EMAIL] Failed to send status update:", (emailErr as Error).message);
      }
    }

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleInternalNotes(orderId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { internalNotes } = body;

  if (internalNotes === undefined) return badRequest("internalNotes is required");

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return notFound("Order not found");

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { internalNotes },
      include: orderInclude,
    });

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleTimeline(orderId: string): Promise<Response> {
  try {
    const statusHistory = await prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
      include: { creator: { select: { firstName: true, lastName: true } } },
    });

    if (!statusHistory.length) return notFound("No timeline entries found");

    return success({ timeline: statusHistory });
  } catch (err) {
    return serverError(err);
  }
}
