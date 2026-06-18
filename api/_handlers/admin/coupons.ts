import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";

export async function handleAdminCouponRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "list":
      return handleList();
    case "create":
      return handleCreate(req);
    case "update":
      return handleUpdate(params[0], req);
    case "delete":
      return handleDelete(params[0]);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(): Promise<Response> {
  try {
    const coupons = await prisma.coupon.findMany({
      include: { _count: { select: { redemptions: true } } },
      orderBy: { createdAt: "desc" },
    });
    return success({ coupons });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request): Promise<Response> {
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
    return created(coupon);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(couponId: string, req: Request): Promise<Response> {
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
    return success(coupon);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(couponId: string): Promise<Response> {
  try {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });
    return success({ message: "Coupon deactivated" });
  } catch (err) {
    return notFound("Coupon not found");
  }
}
