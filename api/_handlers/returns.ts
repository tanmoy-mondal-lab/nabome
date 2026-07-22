import type { Env } from "../_lib/env";
import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, unauthorized, serverError, created } from "../_lib/response";
import { requireAdmin } from "../_lib/auth-middleware";
import type { RequestContext } from "../_lib/types";

async function createNotification(
  profileId: string,
  orderId: string | undefined,
  type: string,
  title: string,
  body?: string,
  env?: Env
) {
  const prisma = getPrisma(env);
  await prisma.notifications.create({
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
  // Defense-in-depth: verify admin role for admin actions
  const adminActions = ["adminList", "adminDetail", "approve", "reject", "receive"];
  if (adminActions.includes(action)) {
    const adminGuard = requireAdmin(ctx);
    if (adminGuard) return adminGuard;
  }

  switch (action) {
    case "create": return handleCreate(req, ctx, ctx.env!);
    case "listMy": return handleListMy(ctx, ctx.env!);
    case "detailMy": return handleDetailMy(params[0], ctx, ctx.env!);
    case "adminList": return handleAdminList(req, ctx.env!);
    case "adminDetail": return handleAdminDetail(params[0], ctx.env!);
    case "approve": return handleApprove(params[0], ctx, ctx.env!);
    case "reject": return handleReject(params[0], req, ctx, ctx.env!);
    case "receive": return handleReceive(params[0], ctx, ctx.env!);
    default: return badRequest("Unknown action");
  }
}

async function handleCreate(req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { orderId, orderItemId, reason, reasonDetail, evidenceImages } = body;

  if (!orderId || !reason || typeof orderId !== 'string' || typeof reason !== 'string') return badRequest("Order ID and reason are required");

  const validReasons = ["wrong_item", "damaged_product", "size_issue", "quality_issue", "not_as_described", "changed_mind", "other"];
  if (!validReasons.includes(reason as string)) return badRequest("Invalid return reason");

  try {
    const prisma = getPrisma(env);
    const order = await prisma.orders.findUnique({
      where: { id: orderId as string },
      include: { items: true },
    });

    if (!order) return notFound("Order not found");
    if (order.profileId !== ctx.userId) return badRequest("Order does not belong to you");

    const eligibleStatuses = ["shipped", "out_for_delivery", "delivered"];
    if (!eligibleStatuses.includes(order.status)) {
      return badRequest("Order must be shipped or delivered to request a return");
    }

    if (orderItemId) {
      const item = order.items.find((i: Record<string, unknown>) => i.id === orderItemId);
      if (!item) return badRequest("Order item not found in this order");
    }

    const [returnRequest] = await prisma.$transaction([
      prisma.return_requests.create({
        data: {
          orderId: orderId as string,
          orderItemId: orderItemId as string | null ?? null,
          profileId: ctx.userId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reason: reason as any,
          reasonDetail: reasonDetail as string | null ?? null,
          evidenceImages: evidenceImages as string[] | undefined ?? [],
          status: "pending",
        },
        include: {
          order: { select: { orderNumber: true } },
        },
      }),
      prisma.orders.update({
        where: { id: orderId as string },
        data: { returnRequestedAt: new Date() },
      }),
    ]);

    await createNotification(
      ctx.userId,
      orderId,
      "return_requested",
      "Return Request Submitted",
      `Return request for order has been submitted.`,
      env
    );

    return created(returnRequest);
  } catch (err) {
    return serverError(err);
  }
}

async function handleListMy(ctx: RequestContext, env: Env): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const prisma = getPrisma(env);
    const returns = await prisma.return_requests.findMany({
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

async function handleDetailMy(returnId: string, ctx: RequestContext, env: Env): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  try {
    const prisma = getPrisma(env);
    const returnRequest = await prisma.return_requests.findUnique({
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

async function handleAdminList(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "25"), 100);
  const status = url.searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [returns, total] = await Promise.all([
      prisma.return_requests.findMany({
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
      prisma.return_requests.count({ where: where as never }),
    ]);

    return success({
      returns,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleAdminDetail(returnId: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const returnRequest = await prisma.return_requests.findUnique({
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

async function handleApprove(returnId: string, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const returnRequest = await prisma.return_requests.findUnique({
      where: { id: returnId },
      include: { order: { select: { orderNumber: true, profileId: true } } },
    });

    if (!returnRequest) return notFound("Return request not found");
    if (returnRequest.status !== "pending") return badRequest("Can only approve pending requests");

    const updated = await prisma.return_requests.update({
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
      `Your return request for order ${returnRequest.order.orderNumber} has been approved.`,
      env
    );

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleReject(returnId: string, req: Request, ctx: RequestContext, env: Env): Promise<Response> {
  let body: { adminNote?: string };
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { adminNote } = body;

  try {
    const prisma = getPrisma(env);
    const returnRequest = await prisma.return_requests.findUnique({
      where: { id: returnId },
      include: { order: { select: { orderNumber: true, profileId: true } } },
    });

    if (!returnRequest) return notFound("Return request not found");
    if (returnRequest.status !== "pending") return badRequest("Can only reject pending requests");

    const updated = await prisma.return_requests.update({
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
        : `Your return request for order ${returnRequest.order.orderNumber} was rejected.`,
      env
    );

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}

async function handleReceive(returnId: string, ctx: RequestContext, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const returnRequest = await prisma.return_requests.findUnique({
      where: { id: returnId },
      include: {
        order: {
          select: { orderNumber: true, profileId: true, total: true },
          include: { items: true },
        },
      },
    });

    if (!returnRequest) return notFound("Return request not found");
    if (returnRequest.status !== "approved") return badRequest("Can only receive approved returns");

    // Compute the refund amount from the actually returned item(s) — never the
    // whole order total (which includes shipping + tax). Refund the item
    // subtotal only.
    const orderItems = returnRequest.order.items || [];
    const returnedItems = returnRequest.orderItemId
      ? orderItems.filter((i: Record<string, unknown>) => i.id === returnRequest.orderItemId)
      : orderItems;
    if (returnedItems.length === 0) return badRequest("No items found to refund");

    const refundAmount = returnedItems.reduce(
      (sum: number, i: Record<string, unknown>) => sum + Number(i.totalPrice),
      0
    );
    const wholeOrderReturned =
      !returnRequest.orderItemId || returnedItems.length === orderItems.length;

    const [updated] = await prisma.$transaction(async (tx) => {
      const rr = await tx.return_requests.update({
        where: { id: returnId },
        data: {
          status: "item_received",
          itemReceivedAt: new Date(),
        },
      });

      await tx.refunds.create({
        data: {
          returnRequestId: returnId,
          orderId: returnRequest.orderId,
          amount: refundAmount,
          type: wholeOrderReturned ? "full" : "partial",
          status: "pending",
          initiatedBy: ctx.userId,
        },
      });

      // Restore stock for the returned variant(s).
      const variantsToRestore = returnedItems
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((i: any) => i.variantId)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((i: any) => ({ variantId: i.variantId, quantity: i.quantity }));
      if (variantsToRestore.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variantIds = variantsToRestore.map((v: any) => v.variantId);
        const variants = await tx.product_variants.findMany({ where: { id: { in: variantIds } } });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const variantMap = new Map(variants.map((v: any) => [v.id, v]));
        await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variantsToRestore.map((v: any) =>
            tx.product_variants.update({
              where: { id: v.variantId },
              data: { stock: { increment: v.quantity }, reservedStock: { decrement: v.quantity } },
            })
          )
        );
        await tx.inventory_movements.createMany({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: variantsToRestore.map((v: any) => {
            const variant = variantMap.get(v.variantId)!;
            return {
              variantId: v.variantId,
              quantityChange: v.quantity,
              stockAfter: variant.stock + v.quantity,
              reason: "return",
              referenceId: returnRequest.order.orderNumber,
            };
          }),
        });
        // Mark the order items as returned.
        await Promise.all(
          returnedItems
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((i: any) => i.variantId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((i: any) =>
              tx.order_items.update({
                where: { id: i.id },
                data: { isReturned: true, returnQuantity: i.quantity },
              })
            )
        );
      }

      return [rr];
    });

    await createNotification(
      returnRequest.order.profileId!,
      returnRequest.orderId,
      "refund_processed",
      "Item Received",
      `We've received your return for order ${returnRequest.order.orderNumber}. Refund of ₹${refundAmount} will be processed soon.`,
      env
    );

    return success(updated);
  } catch (err) {
    return serverError(err);
  }
}
