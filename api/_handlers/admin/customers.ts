import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminCustomerRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list":
      return handleList(req, ctx.env);
    case "detail":
      return handleDetail(params[0], ctx.env);
    case "update":
      return handleUpdate(params[0], req, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "25");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [customers, total] = await Promise.all([
      prisma.profile.findMany({
        where: where as never,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
          role: true,
          emailVerified: true,
          lastLoginAt: true,
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

async function handleDetail(customerId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const customer = await prisma.profile.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        marketingOptIn: true,
        lastLoginAt: true,
        loginCount: true,
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

async function handleUpdate(customerId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.profile.findUnique({ where: { id: customerId } });
    if (!existing) return notFound("Customer not found");

    const data: Record<string, unknown> = {};
    // Role is excluded from bulk update to prevent privilege escalation
    const fields = ["firstName", "lastName", "phone", "avatarUrl", "isActive", "marketingOptIn"];
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f];
    }

    const customer = await prisma.profile.update({
      where: { id: customerId },
      data: data as never,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        marketingOptIn: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return success({ customer });
  } catch (err) {
    return serverError(err);
  }
}
