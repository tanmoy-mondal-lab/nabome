import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminSubcategoryRequest(
  req: Request, ctx: RequestContext, params: string[], action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list": return handleList();
    case "create": return handleCreate(req);
    case "update": return handleUpdate(params[0], req);
    case "delete": return handleDelete(params[0]);
    default: return badRequest("Unknown action");
  }
}

async function handleList(): Promise<Response> {
  try {
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

async function handleCreate(req: Request): Promise<Response> {
  const body = await req.json();
  const { name, categoryId, description, imageUrl, sortOrder } = body;
  if (!name || !categoryId) return badRequest("Name and categoryId are required");
  const slug = slugify(name);
  const slugExists = await prisma.subcategory.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
  try {
    const sub = await prisma.subcategory.create({
      data: { name, slug: finalSlug, categoryId, description, imageUrl, sortOrder: sortOrder ?? 0 },
    });
    return created(sub);
  } catch (err) { return serverError(err); }
}

async function handleUpdate(id: string, req: Request): Promise<Response> {
  const body = await req.json();
  try {
    const data: Record<string, unknown> = {};
    const fields = ["name", "categoryId", "description", "imageUrl", "sortOrder", "isActive"];
    for (const f of fields) { if (body[f] !== undefined) data[f] = body[f]; }
    if (body.name) data.slug = slugify(body.name);
    const sub = await prisma.subcategory.update({ where: { id }, data: data as never });
    return success(sub);
  } catch (err) { return notFound("Subcategory not found"); }
}

async function handleDelete(id: string): Promise<Response> {
  try {
    await prisma.subcategory.update({ where: { id }, data: { isActive: false } });
    return success({ message: "Subcategory archived" });
  } catch (err) { return notFound("Subcategory not found"); }
}
