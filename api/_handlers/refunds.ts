import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

async function createNotification(
  profileId: string,
  orderId: string | undefined,
  type: string,
  title: string,
  body?: string,
  env?: any
) {
  const prisma = getPrisma(env);
  await prisma.notification.create({
    data: {
      profileId,
      orderId,
      type: type as never,
      channel: "in_app",
      title,
      body,
      sentAt: new Date(),
    },
  });
}

export async function handleRefundRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list": return handleList(req, ctx.env);
    case "detail": return handleDetail(params[0], ctx.env);
    case "listMy": return handleListMy(req, ctx, ctx.env);
    case "detailMy": return handleDetailMy(params[0], ctx, ctx.env);
    case "create": return handleCreate(req, ctx, ctx.env);
    case "process": return handleProcess(params[0], ctx.env);
    case "complete": return handleComplete(params[0], ctx, ctx.env);
    case "fail": return handleFail(params[0], req, ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const status = url.searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [refunds, total] = await Promise.all([
      prisma.refund.findMany({
        where: where as never,
        include: {
          returnRequest: {
            select: { id: true, status: true },
          },
          order: { select: { orderNumber: true, total: true, paymentStatus: true } },
          initiator: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.refund.count({ where: where as never }),
    ]);

    return success({
      refunds,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(refundId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        returnRequest: {
          include: {
            profile: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        order: { include: { items: true } },
        initiator: { select: { firstName: true, lastName: true } },
      },
    });

    if (!refund) return notFound("Refund not found");
    return success({ refund });
  } catch (err) {
    return serverError(err);
  }
}

async function handleListMy(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  if (!ctx.userId) return badRequest("Unauthorized");
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const where = { returnRequest: { profileId: ctx.userId } };
    const [refunds, total] = await Promise.all([
      prisma.refund.findMany({
        where,
        include: {
          returnRequest: { select: { id: true, status: true, reason: true } },
          order: { select: { orderNumber: true, total: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.refund.count({ where }),
    ]);
    return success({
      refunds,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetailMy(refundId: string, ctx: RequestContext, env: any): Promise<Response> {
  if (!ctx.userId) return badRequest("Unauthorized");
  try {
    const prisma = getPrisma(env);
    const refund = await prisma.refund.findFirst({
      where: { id: refundId, returnRequest: { profileId: ctx.userId } },
      include: {
        returnRequest: { include: { orderItem: true } },
        order: { select: { orderNumber: true, total: true, paymentStatus: true } },
      },
    });
    if (!refund) return notFound("Refund not found");
    return success({ refund });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { orderId, returnRequestId, amount, type, notes } = body;

  if (!orderId || amount === undefined || !type) {
    return badRequest("Order ID, amount, and type are required");
  }

  if (!["full", "partial"].includes(type)) {
    return badRequest("Type must be 'full' or 'partial'");
  }

  try {
    const prisma = getPrisma(env);
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return notFound("Order not found");

    const refund = await prisma.refund.create({
      data: {
        returnRequestId,
        orderId,
        amount,
        type,
        status: "pending",
        initiatedBy: ctx.userId,
        notes: notes ?? null,
      },
    });

    return created(refund);
  } catch (err) {
    return serverError(err);
  }
}

async function handleProcess(refundId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const refund = await prisma.refund.findUnique({ where: { id: refundId } });
    if (!refund) return notFound("Refund not found");
    if (refund.status !== "pending") return badRequest("Can only process pending refunds");

    const updated = await prisma.refund.update({
      where: { id: refundId },
      data: { status: "processing" },
    });

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleComplete(refundId: string, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        order: { select: { id: true, total: true, profileId: true, orderNumber: true } },
      },
    });

    if (!refund) return notFound("Refund not found");
    if (refund.status !== "processing") return badRequest("Can only complete processing refunds");

    const paymentStatus = refund.type === "full" ? "refunded" : "partially_refunded";

    const [updated] = await prisma.$transaction([
      prisma.refund.update({
        where: { id: refundId },
        data: {
          status: "completed",
          processedAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: refund.orderId },
        data: {
          paymentStatus,
          refundedAt: new Date(),
        },
      }),
      prisma.returnRequest.updateMany({
        where: { id: refund.returnRequestId },
        data: {
          status: "completed",
        },
      }),
    ]);

    await createNotification(
      refund.order.profileId!,
      refund.order.id,
      "refund_processed",
      "Refund Processed",
      `A refund of ${refund.amount} for order ${refund.order.orderNumber} has been processed.`,
      env
    );

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleFail(refundId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { notes } = body;

  try {
    const prisma = getPrisma(env);
    const refund = await prisma.refund.findUnique({ where: { id: refundId } });
    if (!refund) return notFound("Refund not found");
    if (!["pending", "processing"].includes(refund.status)) {
      return badRequest("Can only fail pending or processing refunds");
    }

    const updated = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: "failed",
        notes: notes
          ? refund.notes
            ? `${refund.notes}\n${notes}`
            : notes
          : refund.notes,
      },
    });

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}
