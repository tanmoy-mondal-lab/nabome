import { getPrisma } from "../_lib/prisma";
import { success, notFound, badRequest, unauthorized, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { ORDER_STATUS_FLOW } from "../../src/lib/constants";
import { logAction, extractRequestMeta } from "../_lib/audit";

export async function handleOrderRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  const method = req.method;

  // GET /api/orders — list customer orders
  if (method === "GET" && !params.length && (!action || action === "list")) {
    return handleList(ctx, req, ctx.env);
  }

  // GET /api/orders/stats — customer order statistics
  if (method === "GET" && action === "stats") {
    return handleStats(ctx, ctx.env);
  }

  // GET /api/orders/:id
  if (method === "GET" && params.length && action === "detail") {
    return handleDetail(ctx, params[0], ctx.env);
  }

  // POST /api/orders/:id/cancel
  if (method === "POST" && params.length && action === "cancel") {
    return handleCancel(req, ctx, params[0], ctx.env);
  }

  // GET /api/orders/:id/tracking
  if (method === "GET" && params.length && action === "tracking") {
    return handleTracking(ctx, params[0], ctx.env);
  }

  return notFound();
}

async function handleStats(ctx: RequestContext, env: any): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  try {
    const prisma = getPrisma(ctx.env);
    const [orders, aggregation] = await Promise.all([
      prisma.order.findMany({
        where: { profileId: ctx.userId },
        select: { status: true, total: true },
      }),
      prisma.order.aggregate({
        where: { profileId: ctx.userId },
        _count: true,
        _sum: { total: true },
      }),
    ]);
    const totalOrders = aggregation._count;
    const totalSpent = Number(aggregation._sum.total ?? 0);
    const pendingOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed" || o.status === "processing"
    ).length;
    const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
    return success({ totalOrders, totalSpent, pendingOrders, deliveredOrders });
  } catch (err) {
    return serverError(err);
  }
}

async function handleList(ctx: RequestContext, req: Request, env: any): Promise<Response> {
  if (!ctx.userId) {
    return unauthorized();
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "10");
  const status = url.searchParams.get("status");

  const where: Record<string, unknown> = { profileId: ctx.userId };
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(ctx.env);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: where as never,
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
          shippingAddress: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: where as never }),
    ]);

    return success({
      orders,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(ctx: RequestContext, orderId: string, env: any): Promise<Response> {
  if (!ctx.userId) {
    return unauthorized();
  }

  try {
    const prisma = getPrisma(ctx.env);
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        profileId: ctx.userId,
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { creator: { select: { firstName: true } } },
        },
        shippingAddress: true,
        billingAddress: true,
        returnRequests: {
          include: { refund: true },
        },
        refunds: true,
        notifications: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) return notFound("Order not found");

    return success({ order });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCancel(req: Request, ctx: RequestContext, orderId: string, env: any): Promise<Response> {
  if (!ctx.userId) {
    return unauthorized();
  }

  let cancellationReason: string | null = null;
  try {
    const body = await req.json();
    cancellationReason = body.reason ?? null;
  } catch {
    // No body — that's fine
  }

  try {
    const prisma = getPrisma(ctx.env);
    const order = await prisma.order.findFirst({
      where: { id: orderId, profileId: ctx.userId },
      include: { items: true },
    });

    if (!order) return notFound("Order not found");

    const allowedTransitions = ORDER_STATUS_FLOW[order.status] ?? [];
    if (!allowedTransitions.includes("cancelled")) {
      return badRequest(
        `Order cannot be cancelled from status "${order.status}". Allowed: ${allowedTransitions.join(", ") || "none"}`
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "cancelled",
          cancelledAt: new Date(),
          cancellationReason,
          statusHistory: {
            create: {
              status: "cancelled",
              note: cancellationReason
                ? `Cancelled by customer: ${cancellationReason}`
                : "Cancelled by customer",
              createdBy: ctx.userId,
            },
          },
        },
        include: { items: true, statusHistory: true, shippingAddress: true },
      });

      // Restore stock for all items - batch operation
      const variantIds = order.items.filter(item => item.variantId).map(item => item.variantId!);
      
      if (variantIds.length > 0) {
        // Fetch all variants in one query
        const variants = await tx.productVariant.findMany({
          where: { id: { in: variantIds } },
        });
        
        const variantMap = new Map(variants.map(v => [v.id, v]));
        
        // Update all variants and create inventory movements in parallel
        await Promise.all(
          order.items
            .filter(item => item.variantId && variantMap.has(item.variantId))
            .map(async (item) => {
              const variant = variantMap.get(item.variantId!)!;
              await tx.productVariant.update({
                where: { id: item.variantId! },
                data: {
                  stock: { increment: item.quantity },
                  reservedStock: { decrement: item.quantity },
                },
              });

              await tx.inventoryMovement.create({
                data: {
                  variantId: item.variantId!,
                  quantityChange: item.quantity,
                  stockAfter: variant.stock + item.quantity,
                  reason: "cancellation",
                  referenceId: order.orderNumber,
                },
              });
            })
        );
      }

      // Create notification
      await tx.notification.create({
        data: {
          profileId: ctx.userId!,
          orderId: orderId,
          type: "order_cancelled",
          channel: "in_app",
          title: "Order Cancelled",
          body: `Your order ${order.orderNumber} has been cancelled.`,
          data: { orderNumber: order.orderNumber },
        },
      });

      return cancelled;
    });

    logAction(ctx.userId, "order.cancel", {
      entity: "order",
      entityId: orderId,
      metadata: { orderNumber: order.orderNumber, reason: cancellationReason },
      ...extractRequestMeta(req),
    });

    return success({ order: updated });
  } catch (err) {
    return serverError(err);
  }
}

async function handleTracking(ctx: RequestContext, orderId: string, env: any): Promise<Response> {
  if (!ctx.userId) {
    return unauthorized();
  }

  try {
    const prisma = getPrisma(ctx.env);
    const order = await prisma.order.findFirst({
      where: { id: orderId, profileId: ctx.userId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        shippingAddress: true,
        shippedAt: true,
        deliveredAt: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
          include: { creator: { select: { firstName: true } } },
        },
      },
    });

    if (!order) return notFound("Order not found");

    return success({
      timeline: order.statusHistory ?? [],
      shipping: order.shippingAddress ?? null,
      currentStatus: order.status,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
    });
  } catch (err) {
    return serverError(err);
  }
}
