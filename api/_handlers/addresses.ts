import { getPrisma } from "../_lib/prisma";
import { success, badRequest, notFound, unauthorized, error, serverError, created } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleAddressRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action?: string
): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  switch (req.method) {
    case "GET":
      return handleList(ctx.userId, ctx.env);
    case "POST":
      return handleCreate(ctx.userId, req, ctx.env);
    case "PUT":
      return handleUpdate(ctx.userId, params[0], req, ctx.env);
    case "DELETE":
      return handleDelete(ctx.userId, params[0], ctx.env);
    default:
      return error("Method not allowed", 405);
  }
}

async function handleList(userId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const addresses = await prisma.address.findMany({
      where: { profileId: userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return success({ addresses });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(userId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { label, fullName, phone, line1, line2, city, district, state, pincode, country, isDefault } = body;

  if (!fullName || !phone || !line1 || !city || !state || !pincode) {
    return badRequest("Missing required address fields");
  }

  try {
    const prisma = getPrisma(env);
    // If this is the default address, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { profileId: userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        profileId: userId,
        label: label ?? "Home",
        fullName,
        phone,
        line1,
        line2: line2 ?? null,
        city,
        district: district ?? null,
        state,
        pincode,
        country: country ?? "India",
        isDefault: isDefault ?? false,
      },
    });

    return created(address);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(userId: string, addressId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.address.findFirst({
      where: { id: addressId, profileId: userId },
    });
    if (!existing) return notFound("Address not found");

    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { profileId: userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: addressId },
      data: {
        label: body.label ?? existing.label,
        fullName: body.fullName ?? existing.fullName,
        phone: body.phone ?? existing.phone,
        line1: body.line1 ?? existing.line1,
        line2: body.line2 !== undefined ? body.line2 : existing.line2,
        city: body.city ?? existing.city,
        district: body.district !== undefined ? body.district : existing.district,
        state: body.state ?? existing.state,
        pincode: body.pincode ?? existing.pincode,
        country: body.country ?? existing.country,
        isDefault: body.isDefault ?? existing.isDefault,
      },
    });

    return success(address);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(userId: string, addressId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.address.findFirst({
      where: { id: addressId, profileId: userId },
    });
    if (!existing) return notFound("Address not found");

    await prisma.address.delete({ where: { id: addressId } });

    return success({ message: "Address deleted" });
  } catch (err) {
    return serverError(err);
  }
}
