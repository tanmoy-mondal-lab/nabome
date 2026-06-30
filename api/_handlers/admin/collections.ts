import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { slugify } from "../../_lib/utils";
import { logAction, extractRequestMeta } from "../../_lib/audit";
import { requireAdmin } from "../../_lib/auth-middleware";
import { destroyCloudinaryAssetIfReplaced } from "../../_lib/cloudinary";
import { toNull } from "../../_lib/sanitize";

export async function handleAdminCollectionRequest(
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
      return handleCreate(req, ctx, ctx.env);
    case "update":
      return handleUpdate(params[0], req, ctx, ctx.env);
    case "delete":
      return handleDelete(params[0], req, ctx, ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

async function handleList(env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    const collections = await prisma.collection.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return success({ collections });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();
  const { name, description, heroImageUrl, heroImagePublicId, isActive, isFeatured, startDate, endDate, sortOrder, metaTitle, metaDesc } = body;

  if (!name) return badRequest("Collection name is required");

  const prisma = getPrisma(env);
  const slug = slugify(name);
  const slugExists = await prisma.collection.findUnique({ where: { slug } });
  const finalSlug = slugExists ? `${slug}-${Date.now().toString(36)}` : slug;

  try {
    const collection = await prisma.collection.create({
      data: {
        name,
        slug: finalSlug,
        description: description ?? null,
        heroImageUrl: heroImageUrl ?? null,
        heroImagePublicId: heroImagePublicId ?? null,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        sortOrder: sortOrder ?? 0,
        metaTitle: metaTitle ?? null,
        metaDesc: metaDesc ?? null,
      },
    });
    logAction(ctx.userId, "admin.collection.create", {
      entity: "collection",
      entityId: collection.id,
      metadata: { name: collection.name, slug: collection.slug },
      ...extractRequestMeta(req),
    });

    return created(collection);
  } catch (err) {
    return serverError(err);
  }
}

async function handleUpdate(collectionId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  const body = await req.json();

  try {
    const prisma = getPrisma(env);
    const existing = await prisma.collection.findUnique({ where: { id: collectionId } });
    if (!existing) return notFound("Collection not found");

    const data: Record<string, unknown> = {};
    const fields = ["name", "description", "heroImageUrl", "isActive", "isFeatured", "sortOrder", "metaTitle", "metaDesc"];
    for (const field of fields) {
      if (body[field] !== undefined) data[field] = field === "heroImageUrl" ? toNull(body[field]) : body[field];
    }
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.heroImagePublicId !== undefined) {
      data.heroImagePublicId = await destroyCloudinaryAssetIfReplaced(existing.heroImagePublicId, body.heroImagePublicId, env);
    }

    if (body.name && body.name !== existing.name) {
      const newSlug = slugify(body.name);
      const slugExists = await prisma.collection.findFirst({
        where: { slug: newSlug, id: { not: collectionId } },
      });
      data.slug = slugExists ? `${newSlug}-${Date.now().toString(36)}` : newSlug;
    }

    const collection = await prisma.collection.update({
      where: { id: collectionId },
      data: data as never,
    });
    logAction(ctx.userId, "admin.collection.update", {
      entity: "collection",
      entityId: collectionId,
      metadata: { name: collection.name },
      ...extractRequestMeta(req),
    });

    return success(collection);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(collectionId: string, req: Request, ctx: RequestContext, env: any): Promise<Response> {
  try {
    const prisma = getPrisma(env);
    await prisma.collection.update({
      where: { id: collectionId },
      data: { isActive: false },
    });
    logAction(ctx.userId, "admin.collection.delete", {
      entity: "collection",
      entityId: collectionId,
      metadata: {},
      ...extractRequestMeta(req),
    });

    return success({ message: "Collection deactivated" });
  } catch (err) {
    return serverError(err);
  }
}
