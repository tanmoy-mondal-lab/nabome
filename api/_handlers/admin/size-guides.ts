import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";
import { requireAdmin } from "../../_lib/auth";
import { toNull } from "../../_lib/sanitize";

export async function handleAdminSizeGuideRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list": return handleList(ctx.env);
    case "create": return handleCreate(req, ctx.env);
    case "detail": return handleDetail(params[0], ctx.env);
    case "update": return handleUpdate(params[0], req, ctx.env);
    case "delete": return handleDelete(params[0], ctx.env);
    default: return badRequest("Unknown action");
  }
}

async function handleList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const guides = await prisma.sizeGuide.findMany({
      include: { category: { select: { id: true, name: true } }, _count: { select: { products: true } } },
      orderBy: { createdAt: "desc" as const },
    });
    return success({ sizeGuides: guides });
  } catch (err) { return serverError(err); }
}

async function handleDetail(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const guide = await prisma.sizeGuide.findUnique({ where: { id }, include: { category: { select: { id: true, name: true } } } });
    if (!guide) return notFound("Size guide not found");
    return success({ sizeGuide: guide });
  } catch (err) { return serverError(err); }
}

async function handleCreate(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { name, description, categoryId, type, unit, imageUrl, measurements } = body;
  if (!name || !measurements) return badRequest("Name and measurements are required");
  const slug = slugify(name);
  const slugExists = await prisma.sizeGuide.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
  try {
    const prisma = getPrisma(env);
    const guide = await prisma.sizeGuide.create({
      data: { name, slug: finalSlug, description, categoryId: toNull(categoryId), type: type ?? "clothing", unit: unit ?? "inches", imageUrl, measurements },
    });
    return created(guide);
  } catch (err) { return serverError(err); }
}

async function handleUpdate(id: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const fields = ["name", "description", "categoryId", "type", "unit", "imageUrl", "measurements", "isActive"];
    const data: Record<string, unknown> = {};
    for (const f of fields) { if (body[f] !== undefined) data[f] = f === "categoryId" ? toNull(body[f]) : body[f]; }
    if (body.name) data.slug = slugify(body.name);
    const guide = await prisma.sizeGuide.update({ where: { id }, data: data as never });
    return success(guide);
  } catch (err) { return serverError(err); }
}

async function handleDelete(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.sizeGuide.delete({ where: { id } });
    return success({ message: "Size guide deleted" });
  } catch (err) { return notFound("Size guide not found"); }
}
