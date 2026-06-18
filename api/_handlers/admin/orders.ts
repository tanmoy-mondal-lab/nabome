import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { ORDER_STATUS_FLOW } from "../../../src/lib/constants";

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
    case "detail":
      return handleDetail(params[0]);
    case "updateStatus":
      return handleUpdateStatus(params[0], req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const fromDate = url.searchParams.get("from");
  const toDate = url.searchParams.get("to");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
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

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: where as never,
        include: {
          items: { take: 3 },
          profile: { select: { firstName: true, lastName: true } },
          statusHistory: { take: 1, orderBy: { createdAt: "desc" } },
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

async function handleDetail(orderId: string): Promise<Response> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: orderInclude,
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

    const updated = await prisma.order.update({
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

    // If cancelled, restore stock
    if (status === "cancelled") {
      const items = await prisma.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { increment: item.quantity },
              reservedStock: { decrement: item.quantity },
            },
          });

          await prisma.inventoryMovement.create({
            data: {
              variantId: item.variantId,
              quantityChange: item.quantity,
              stockAfter: item.quantity, // Approximate — would be fetched in production
              reason: "cancellation",
              referenceId: order.orderNumber,
            },
          });
        }
      }
    }

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}
