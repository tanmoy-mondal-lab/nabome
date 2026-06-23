import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";
import { logAction, extractRequestMeta } from "../../_lib/audit";

export async function handleAdminCouponRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list":
      return handleList(req);
    case "create":
      return handleCreate(req, ctx);
    case "update":
      return handleUpdate(params[0], req, ctx);
    case "delete":
      return handleDelete(params[0], req, ctx);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "50");
  const skip = (page - 1) * limit;

  try {
    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        include: { _count: { select: { redemptions: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.coupon.count(),
    ]);
    return success({
      coupons,
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();
  const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, perUserLimit, applicableGender, isActive, startDate, endDate } = body;

  if (!code || !discountType || discountValue === undefined || !startDate || !endDate) {
    return badRequest("Code, discount type, discount value, start date, and end date are required");
  }

  const existingCode = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (existingCode) return badRequest("A coupon with this code already exists");

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description: description ?? null,
        discountType,
        discountValue,
        minOrderValue: minOrderValue ?? null,
        maxDiscount: maxDiscount ?? null,
        usageLimit: usageLimit ?? null,
        perUserLimit: perUserLimit ?? 1,
        applicableGender: applicableGender ?? null,
        isActive: isActive ?? true,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });
    logAction(ctx.userId, "admin.coupons.create", {
      entity: "coupon",
      entityId: coupon.id,
      metadata: { code: coupon.code, discountType: coupon.discountType },
      ...extractRequestMeta(req),
    });
    return created(coupon);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(couponId: string, req: Request, ctx: RequestContext): Promise<Response> {
  const body = await req.json();

  try {
    const existing = await prisma.coupon.findUnique({ where: { id: couponId } });
    if (!existing) return notFound("Coupon not found");

    const data: Record<string, unknown> = {};
    const fields = ["description", "discountType", "discountValue", "minOrderValue", "maxDiscount", "usageLimit", "perUserLimit", "applicableGender", "isActive"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.code) data.code = body.code.toUpperCase();
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const coupon = await prisma.coupon.update({
      where: { id: couponId },
      data: data as never,
    });
    logAction(ctx.userId, "admin.coupons.update", {
      entity: "coupon",
      entityId: coupon.id,
      metadata: { code: coupon.code },
      ...extractRequestMeta(req),
    });
    return success(coupon);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(couponId: string, req: Request, ctx: RequestContext): Promise<Response> {
  try {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });
    logAction(ctx.userId, "admin.coupons.delete", {
      entity: "coupon",
      entityId: couponId,
      ...extractRequestMeta(req),
    });
    return success({ message: "Coupon deactivated" });
  } catch (err) {
    return notFound("Coupon not found");
  }
}
