import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../../src/lib/utils/format";
import { requireAdmin } from "../../_lib/auth";
import { toNull } from "../../_lib/sanitize";

export async function handleAdminLookbookRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list":
      return handleList(ctx.env);
    case "create":
      return handleCreate(req, ctx.env);
    case "detail":
      return handleDetail(params[0], ctx.env);
    case "update":
      return handleUpdate(params[0], req, ctx.env);
    case "delete":
      return handleDelete(params[0], ctx.env);
    case "addItem":
      return handleAddItem(params[0], req, ctx.env);
    case "updateItem":
      return handleUpdateItem(params[0], params[1], req, ctx.env);
    case "removeItem":
      return handleRemoveItem(params[0], params[1], ctx.env);
    case "reorderItems":
      return handleReorderItems(params[0], req, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

function buildInclude() {
  return {
    items: { orderBy: { sortOrder: "asc" as const } },
    _count: { select: { items: true } },
  };
}

async function handleList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const lookbooks = await prisma.lookbook.findMany({
      include: buildInclude(),
      orderBy: { sortOrder: "asc" },
    });
    return success({ lookbooks });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(id: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const lookbook = await prisma.lookbook.findUnique({
      where: { id },
      include: buildInclude(),
    });
    if (!lookbook) return notFound("Lookbook not found");
    return success({ lookbook });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { name, description, coverImageUrl, season, year, layout, story, tags, metaTitle, metaDesc, isActive, sortOrder } = body;

  if (!name) return badRequest("Name is required");

  const slug = slugify(name);
  const slugExists = await prisma.lookbook.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const prisma = getPrisma(env);
    const lookbook = await prisma.lookbook.create({
      data: {
        name,
        slug: finalSlug,
        description: description ?? null,
        coverImageUrl: coverImageUrl ?? "",
        season: season ?? null,
        year: year ? parseInt(String(year)) : null,
        layout: layout ?? "grid",
        story: story ?? null,
        tags: Array.isArray(tags) ? tags : [],
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
    });
    return created(lookbook);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(lookbookId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.lookbook.findUnique({ where: { id: lookbookId } });
    if (!existing) return notFound("Lookbook not found");

    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "coverImageUrl", "layout", "metaTitle", "metaDesc", "isActive", "sortOrder"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.name) data.slug = slugify(body.name);
    if (body.season !== undefined) data.season = body.season;
    if (body.year !== undefined) data.year = parseInt(String(body.year));
    if (body.story !== undefined) data.story = body.story;
    if (body.tags !== undefined) data.tags = Array.isArray(body.tags) ? body.tags : [];

    const lookbook = await prisma.lookbook.update({
      where: { id: lookbookId },
      data: data as never,
    });
    return success(lookbook);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(lookbookId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.lookbook.delete({ where: { id: lookbookId } });
    return success({ message: "Lookbook deleted" });
  } catch (err) {
    return notFound("Lookbook not found");
  }
}

async function handleAddItem(lookbookId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { imageUrl, productId, hotspotX, hotspotY, caption, sortOrder, linkUrl, linkText, type } = body;

  if (!imageUrl) return badRequest("Image URL is required");

  try {
    const prisma = getPrisma(env);
    const item = await prisma.lookbookItem.create({
      data: {
        lookbookId,
        imageUrl,
        productId: toNull(productId),
        hotspotX: hotspotX ? parseFloat(String(hotspotX)) : null,
        hotspotY: hotspotY ? parseFloat(String(hotspotY)) : null,
        caption: caption ?? null,
        sortOrder: sortOrder ?? 0,
      },
    });
    return created(item);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdateItem(lookbookId: string, itemId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    const fields = ["imageUrl", "productId", "caption", "sortOrder"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = field === "productId" ? toNull(body[field]) : body[field];
    }
    if (body.hotspotX !== undefined) data.hotspotX = parseFloat(String(body.hotspotX));
    if (body.hotspotY !== undefined) data.hotspotY = parseFloat(String(body.hotspotY));

    const item = await prisma.lookbookItem.update({
      where: { id: itemId },
      data: data as never,
    });
    return success(item);
  } catch (err) {
    return notFound("Item not found");
  }
}

async function handleRemoveItem(lookbookId: string, itemId: string, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.lookbookItem.delete({
      where: { id: itemId, lookbookId },
    });
    return success({ message: "Item removed from lookbook" });
  } catch (err) {
    return notFound("Item not found");
  }
}

async function handleReorderItems(lookbookId: string, req: Request, env: any): Promise<Response> {
  const body = await req.json();
  const { order } = body;
  if (!Array.isArray(order)) return badRequest("Order array is required");
  try {
    const prisma = getPrisma(env);
    await prisma.$transaction(
      order.map((item: { id: string; sortOrder: number }) =>
        prisma.lookbookItem.update({
          where: { id: item.id, lookbookId },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
    return success({ message: "Items reordered" });
  } catch (err) {
    return serverError(err);
  }
}
