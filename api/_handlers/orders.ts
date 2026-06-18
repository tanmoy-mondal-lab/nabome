import { prisma } from "../_lib/prisma";
import { success, notFound, serverError } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleOrderRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  const method = req.method;

  // GET /api/orders — list customer orders
  if (method === "GET" && !params.length) {
    return handleList(ctx);
  }

  // GET /api/orders/:id
  if (method === "GET" && params.length && action === "detail") {
    return handleDetail(ctx, params[0]);
  }

  return new Response("Not found", { status: 404 });
}

async function handleList(ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { profileId: ctx.userId },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return success({ orders });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(ctx: RequestContext, orderId: string): Promise<Response> {
  if (!ctx.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
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
      },
    });

    if (!order) return notFound("Order not found");

    return success({ order });
  } catch (err) {
    return serverError(err);
  }
}
