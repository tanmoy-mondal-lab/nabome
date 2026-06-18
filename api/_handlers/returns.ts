import { prisma } from "../_lib/prisma";
import { success, badRequest, notFound, unauthorized, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

async function createNotification(
  profileId: string,
  orderId: string | undefined,
  type: string,
  title: string,
  body?: string
) {
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

export async function handleReturnRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "create": return handleCreate(req, ctx);
    case "listMy": return handleListMy(ctx);
    case "detailMy": return handleDetailMy(params[0], ctx);
    case "adminList": return handleAdminList(req);
    case "adminDetail": return handleAdminDetail(params[0]);
    case "approve": return handleApprove(params[0], ctx);
    case "reject": return handleReject(params[0], req, ctx);
    case "receive": return handleReceive(params[0], ctx);
    default: return badRequest("Unknown action");
  }
}

async function handleCreate(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const body = await req.json();
  const { orderId, orderItemId, reason, reasonDetail, evidenceImages } = body;

  if (!orderId || !reason) return badRequest("Order ID and reason are required");

  const validReasons = ["wrong_item", "damaged_product", "size_issue", "quality_issue", "not_as_described", "changed_mind", "other"];
  if (!validReasons.includes(reason)) return badRequest("Invalid return reason");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return notFound("Order not found");
    if (order.profileId !== ctx.userId) return badRequest("Order does not belong to you");

    const eligibleStatuses = ["shipped", "out_for_delivery", "delivered"];
    if (!eligibleStatuses.includes(order.status)) {
      return badRequest("Order must be shipped or delivered to request a return");
    }

    if (orderItemId) {
      const item = order.items.find((i) => i.id === orderItemId);
      if (!item) return badRequest("Order item not found in this order");
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId,
        orderItemId: orderItemId ?? null,
        profileId: ctx.userId,
        reason,
        reasonDetail: reasonDetail ?? null,
        evidenceImages: evidenceImages ?? [],
        status: "pending",
      },
      include: {
        order: { select: { orderNumber: true } },
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { returnRequestedAt: new Date() },
    });

    await createNotification(
      ctx.userId,
      orderId,
      "return_requested",
      "Return Request Submitted",
      `Return request for order ${returnRequest.order.orderNumber} has been submitted.`
    );

    return created(returnRequest);
  } catch (err) {
    return serverError(err);
  }
}

async function handleListMy(ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const returns = await prisma.returnRequest.findMany({
      where: { profileId: ctx.userId },
      include: {
        order: { select: { orderNumber: true, total: true } },
        refund: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return success({ returns });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetailMy(returnId: string, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        order: { select: { orderNumber: true, status: true, total: true } },
        refund: true,
      },
    });

    if (!returnRequest) return notFound("Return request not found");
    if (returnRequest.profileId !== ctx.userId) return notFound("Return request not found");

    return success({ return: returnRequest });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminList(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const status = url.searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  try {
    const [returns, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where: where as never,
        include: {
          profile: { select: { id: true, firstName: true, lastName: true, email: true } },
          order: { select: { orderNumber: true, total: true } },
          refund: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.returnRequest.count({ where: where as never }),
    ]);

    return success({
      returns,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminDetail(returnId: string): Promise<Response> {
  try {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        profile: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        order: { include: { items: true } },
        refund: true,
      },
    });

    if (!returnRequest) return notFound("Return request not found");
    return success({ return: returnRequest });
  } catch (err) {
    return serverError(err);
  }
}

async function handleApprove(returnId: string, ctx: RequestContext): Promise<Response> {
  try {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { order: { select: { orderNumber: true, profileId: true } } },
    });

    if (!returnRequest) return notFound("Return request not found");
    if (returnRequest.status !== "pending") return badRequest("Can only approve pending requests");

    const updated = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: "approved",
        reviewedBy: ctx.userId,
        reviewedAt: new Date(),
      },
    });

    await createNotification(
      returnRequest.order.profileId!,
      returnRequest.orderId,
      "return_approved",
      "Return Request Approved",
      `Your return request for order ${returnRequest.order.orderNumber} has been approved.`
    );

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleReject(returnId: string, req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();
  const { adminNote } = body;

  try {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: { order: { select: { orderNumber: true, profileId: true } } },
    });

    if (!returnRequest) return notFound("Return request not found");
    if (returnRequest.status !== "pending") return badRequest("Can only reject pending requests");

    const updated = await prisma.returnRequest.update({
      where: { id: returnId },
      data: {
        status: "rejected",
        adminNote: adminNote ?? null,
        reviewedBy: ctx.userId,
        reviewedAt: new Date(),
      },
    });

    await createNotification(
      returnRequest.order.profileId!,
      returnRequest.orderId,
      "return_rejected",
      "Return Request Rejected",
      adminNote
        ? `Your return request for order ${returnRequest.order.orderNumber} was rejected: ${adminNote}`
        : `Your return request for order ${returnRequest.order.orderNumber} was rejected.`
    );

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleReceive(returnId: string, ctx: RequestContext): Promise<Response> {
  try {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id: returnId },
      include: {
        order: { select: { orderNumber: true, profileId: true, total: true } },
      },
    });

    if (!returnRequest) return notFound("Return request not found");
    if (returnRequest.status !== "approved") return badRequest("Can only receive approved returns");

    const [updated] = await prisma.$transaction([
      prisma.returnRequest.update({
        where: { id: returnId },
        data: {
          status: "item_received",
          itemReceivedAt: new Date(),
        },
      }),
      prisma.refund.create({
        data: {
          returnRequestId: returnId,
          orderId: returnRequest.orderId,
          amount: returnRequest.order.total,
          type: "full",
          status: "pending",
          initiatedBy: ctx.userId,
        },
      }),
    ]);

    await createNotification(
      returnRequest.order.profileId!,
      returnRequest.orderId,
      "refund_processed",
      "Item Received",
      `We've received your return for order ${returnRequest.order.orderNumber}. Refund will be processed soon.`
    );

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}
