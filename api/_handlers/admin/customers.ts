import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";

export async function handleAdminCustomerRequest(
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
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = { role: "customer" };
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const [customers, total] = await Promise.all([
      prisma.profile.findMany({
        where: where as never,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.profile.count({ where: where as never }),
    ]);

    return success({
      customers,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(customerId: string): Promise<Response> {
  try {
    const customer = await prisma.profile.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        _count: { select: { orders: true, reviews: true, wishlistItems: true } },
        orders: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
            createdAt: true,
            items: { take: 2 },
          },
        },
      },
    });

    if (!customer) return notFound("Customer not found");

    // Calculate lifetime value
    const lifetimeValue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { profileId: customerId, paymentStatus: "paid" },
    });

    return success({
      customer: {
        ...customer,
        lifetimeValue: lifetimeValue._sum.total ?? 0,
      },
    });
  } catch (err) {
    return serverError(err);
  }
}
