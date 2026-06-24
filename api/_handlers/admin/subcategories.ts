import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";
import { requireAdmin } from "../../_lib/auth";
import { toNull } from "../../_lib/sanitize";

export async function handleAdminSubcategoryRequest(
  req: Request, ctx: RequestContext, params: string[], action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list": return handleList(ctx.env);
    case "create": return handleCreate(req, ctx.env);
    case "update": return handleUpdate(params[0], req, ctx.env);
    case "delete": return handleDelete(params[0], ctx.env);
    default: return badRequest("Unknown action");
  }
}

env: anyasync function handleList(ctx.env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const subcategories = await prisma.subcategory.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
      orderBy: [{ categoryId: "asc" as const }, { sortOrder: "asc" as const }],
    });
    return success({ subcategories });
  } catch (err) { return serverError(err); }
}

async function handleCreate(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { name, categoryId, description, imageUrl, sortOrder } = body;
  if (!name || !categoryId) return badRequest("Name and categoryId are required");
  const slug = slugify(name);
  const slugExists = await prisma.subcategory.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
  try {
    const prisma = getPrisma(env);
    const sub = await prisma.subcategory.create({
      data: { name, slug: finalSlug, categoryId: toNull(categoryId), description, imageUrl, sortOrder: sortOrder ?? 0 },
    });
    return created(sub);
  } catch (err) { return serverError(err); }
}

async function handleUpdate(id: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    const fields = ["name", "categoryId", "description", "imageUrl", "sortOrder", "isActive"];
    for (const f of fields) { if (body[f] !== undefined) data[f] = f === "categoryId" ? toNull(body[f]) : body[f]; }
    if (body.name) data.slug = slugify(body.name);
    const sub = await prisma.subcategory.update({ where: { id }, data: data as never });
    return success(sub);
  } catch (err) { return notFound("Subcategory not found"); }
}

async function handleDelete(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.subcategory.update({ where: { id }, data: { isActive: false } });
    return success({ message: "Subcategory archived" });
  } catch (err) { return notFound("Subcategory not found"); }
}
