import type { Env } from "../../_lib/env";
import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../_lib/utils";
import { requireAdmin } from "../../_lib/auth-middleware";
import { toNull } from "../../_lib/sanitize";
import { deleteMedia, deleteEntityMedia } from "../../_lib/media-service";

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
      return handleList(ctx.env!);
    case "create":
      return handleCreate(req, ctx.env!);
    case "detail":
      return handleDetail(params[0], ctx.env!);
    case "update":
      return handleUpdate(params[0], req, ctx.env!);
    case "delete":
      return handleDelete(params[0], ctx.env!);
    case "addItem":
      return handleAddItem(params[0], req, ctx.env!);
    case "updateItem":
      return handleUpdateItem(params[0], params[1], req, ctx.env!);
    case "removeItem":
      return handleRemoveItem(params[0], params[1], ctx.env!);
    case "reorderItems":
      return handleReorderItems(params[0], req, ctx.env!);
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

function normalizeLookbookItems(items: unknown[]): Array<{
  imageUrl: string;
  imagePublicId: string | null;
  productId: string | null;
  hotspotX?: number | null;
  hotspotY?: number | null;
  caption: string | null;
  sortOrder: number;
}> {
  return items
    .map((raw, index) => {
      const item = raw as Record<string, unknown>;
      const imageUrl = toNull(item.mediaUrl) ?? toNull(item.imageUrl);
      if (!imageUrl) return null;
      const caption = toNull(item.caption ?? item.title ?? item.description);
      const hotspotX = item.hotspotX === undefined || item.hotspotX === "" ? null : Number(item.hotspotX);
      const hotspotY = item.hotspotY === undefined || item.hotspotY === "" ? null : Number(item.hotspotY);
      return {
        imageUrl,
        imagePublicId: toNull(item.mediaPublicId) ?? toNull(item.imagePublicId),
        productId: toNull(item.productId),
        hotspotX: Number.isFinite(hotspotX) ? hotspotX : null,
        hotspotY: Number.isFinite(hotspotY) ? hotspotY : null,
        caption,
        sortOrder: Number(item.sortOrder ?? item.position ?? index),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

async function handleList(env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const lookbooks = await prisma.lookbooks.findMany({
      include: buildInclude(),
      orderBy: { sortOrder: "asc" },
    });
    return success({ lookbooks });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDetail(id: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const lookbook = await prisma.lookbooks.findUnique({
      where: { id },
      include: buildInclude(),
    });
    if (!lookbook) return notFound("Lookbook not found");
    return success({ lookbook });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  const { name, description, coverImageUrl, coverImagePublicId, season, year, layout, story, tags, metaTitle, metaDesc, isActive, sortOrder } = body;

  if (!name) return badRequest("Name is required");

  const slug = slugify(name);
  const prisma = getPrisma(env);
  const slugExists = await prisma.lookbooks.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;
  const items = Array.isArray(body.items) ? normalizeLookbookItems(body.items) : [];

  try {
    const lookbook = await prisma.lookbooks.create({
      data: {
        name,
        slug: finalSlug,
        description: description ?? null,
        coverImageUrl: coverImageUrl ?? "",
        coverImagePublicId: coverImagePublicId ?? null,
        season: season ?? null,
        year: year ? parseInt(String(year)) : null,
        layout: layout ?? "grid",
        story: story ?? null,
        tags: Array.isArray(tags) ? tags : [],
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
        ...(items.length > 0 ? { items: { create: items } } : {}),
      },
      include: buildInclude(),
    });
    return created(lookbook);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(lookbookId: string, req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.lookbooks.findUnique({
      where: { id: lookbookId },
      include: { items: { select: { imagePublicId: true } } },
    });
    if (!existing) return notFound("Lookbook not found");

    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "coverImageUrl", "layout", "metaTitle", "metaDesc", "isActive", "sortOrder"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = field === "coverImageUrl" ? toNull(body[field]) : body[field];
    }
    // Handle cover image media replacement using MediaService
    if (body.coverImagePublicId !== undefined && existing.coverImagePublicId !== body.coverImagePublicId) {
      if (existing.coverImagePublicId) {
        const oldMediaAsset = await prisma.media_assets.findFirst({
          where: { publicId: existing.coverImagePublicId, entityType: "lookbooks", entityId: lookbookId },
        });
        if (oldMediaAsset) {
          await deleteMedia(oldMediaAsset.id, env);
        }
      }
      data.coverImagePublicId = body.coverImagePublicId;
    }
    if (body.name) data.slug = slugify(body.name);
    if (body.season !== undefined) data.season = body.season;
    if (body.year !== undefined) data.year = parseInt(String(body.year));
    if (body.story !== undefined) data.story = body.story;
    if (body.tags !== undefined) data.tags = Array.isArray(body.tags) ? body.tags : [];
    const shouldSyncItems = Array.isArray(body.items);
    const items = shouldSyncItems ? normalizeLookbookItems(body.items) : [];

    const lookbook = await prisma.$transaction(async (tx) => {
      await tx.lookbooks.update({
        where: { id: lookbookId },
        data: data as never,
      });
      if (shouldSyncItems) {
        await tx.lookbook_items.deleteMany({ where: { lookbookId } });
        if (items.length > 0) {
          await tx.lookbook_items.createMany({
            data: items.map((item) => ({ ...item, lookbookId })),
          });
        }
      }
      return tx.lookbooks.findUnique({
        where: { id: lookbookId },
        include: buildInclude(),
      });
    });
    if (shouldSyncItems) {
      const incomingPublicIds = new Set(items.map((item) => item.imagePublicId).filter(Boolean));
      const removedPublicIds = existing.items
        .map((item) => item.imagePublicId)
        .filter((publicId): publicId is string => Boolean(publicId) && !incomingPublicIds.has(publicId));
      
      // Delete removed media using MediaService
      if (removedPublicIds.length > 0) {
        const mediaAssets = await prisma.media_assets.findMany({
          where: { publicId: { in: removedPublicIds }, entityType: "lookbooks" },
          select: { id: true },
        });
        await Promise.allSettled(
          mediaAssets.map(asset => deleteMedia(asset.id, env))
        );
      }
    }
    return success(lookbook);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(lookbookId: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const lookbook = await prisma.lookbooks.findUnique({
      where: { id: lookbookId },
      include: { items: { select: { imagePublicId: true } } },
    });
    if (!lookbook) return notFound("Lookbook not found");
    // Delete all media for this lookbook using MediaService
    await deleteEntityMedia("lookbooks", lookbookId, lookbook.slug, env);
    await prisma.lookbooks.delete({ where: { id: lookbookId } });
    return success({ message: "Lookbook deleted" });
  } catch {
    return notFound("Lookbook not found");
  }
}

async function handleAddItem(lookbookId: string, req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  const { imageUrl, imagePublicId, productId, hotspotX, hotspotY, caption, sortOrder } = body;

  if (!imageUrl) return badRequest("Image URL is required");

  try {
    const prisma = getPrisma(env);
    const item = await prisma.lookbook_items.create({
      data: {
        lookbookId,
        imageUrl,
        imagePublicId: imagePublicId ?? null,
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

async function handleUpdateItem(_lookbookId: string, itemId: string, req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  try {
    const prisma = getPrisma(env);
    const existing = await prisma.lookbook_items.findUnique({ where: { id: itemId } });
    if (!existing) return notFound("Item not found");
    const data: Record<string, unknown> = {};
    const fields = ["imageUrl", "productId", "caption", "sortOrder"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = field === "productId" ? toNull(body[field]) : body[field];
    }
    if (body.imageUrl !== undefined) data.imageUrl = toNull(body.imageUrl);
    // Handle image media replacement using MediaService
    if (body.imagePublicId !== undefined && existing.imagePublicId !== body.imagePublicId) {
      if (existing.imagePublicId) {
        const oldMediaAsset = await prisma.media_assets.findFirst({
          where: { publicId: existing.imagePublicId, entityType: "lookbooks", entityId: itemId },
        });
        if (oldMediaAsset) {
          await deleteMedia(oldMediaAsset.id, env);
        }
      }
      data.imagePublicId = body.imagePublicId;
    }
    if (body.hotspotX !== undefined) data.hotspotX = parseFloat(String(body.hotspotX));
    if (body.hotspotY !== undefined) data.hotspotY = parseFloat(String(body.hotspotY));

    const item = await prisma.lookbook_items.update({
      where: { id: itemId },
      data: data as never,
    });
    return success(item);
  } catch {
    return notFound("Item not found");
  }
}

async function handleRemoveItem(lookbookId: string, itemId: string, env: Env): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const item = await prisma.lookbook_items.findUnique({
      where: { id: itemId },
      select: { id: true, lookbookId: true, imagePublicId: true },
    });
    if (!item || item.lookbookId !== lookbookId) return notFound("Item not found");
    if (item.imagePublicId) {
      const mediaAsset = await prisma.media_assets.findFirst({
        where: { publicId: item.imagePublicId, entityType: "lookbooks", entityId: itemId },
        select: { id: true },
      });
      if (mediaAsset) {
        await deleteMedia(mediaAsset.id, env);
      }
    }
    await prisma.lookbook_items.delete({
      where: { id: itemId },
    });
    return success({ message: "Item removed from lookbook" });
  } catch {
    return notFound("Item not found");
  }
}

async function handleReorderItems(lookbookId: string, req: Request, env: Env): Promise<Response> {
  const body = await req.json();
  const { order } = body;
  if (!Array.isArray(order)) return badRequest("Order array is required");
  try {
    const prisma = getPrisma(env);
    await prisma.$transaction(
      order.map((item: { id: string; sortOrder: number }) =>
        prisma.lookbook_items.update({
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
