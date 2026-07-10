import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";
import { deleteMedia } from "../../_lib/media-service";


export async function handleAdminMediaRequest(
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
    case "create":
      return handleCreate(req, ctx.env);
    case "update":
      return handleUpdate(params[0], req, ctx.env);
    case "delete":
      return handleDelete(params[0], ctx.env);
    default:
      return badRequest("Unknown action");
  }
}

const MAX_PAGE_LIMIT = 200;

async function handleList(req: Request, env: any): Promise<Response> {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const limit = Math.min(MAX_PAGE_LIMIT, Math.max(1, parseInt(url.searchParams.get("limit") ?? "50")));
  const type = url.searchParams.get("type");
  const entityType = url.searchParams.get("entityType");
  const entityId = url.searchParams.get("entityId");
  const folder = url.searchParams.get("folder");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (folder) where.folder = { contains: folder };
  if (search) {
    where.OR = [
      { altText: { contains: search, mode: "insensitive" } },
      { displayName: { contains: search, mode: "insensitive" } },
      { originalFilename: { contains: search, mode: "insensitive" } },
      { folder: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  try {
    const prisma = getPrisma(env);
    const [assets, total] = await Promise.all([
      prisma.media_assets.findMany({
        where: where as never,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.media_assets.count({ where: where as never }),
    ]);

    const folders = await prisma.media_assets.groupBy({
      by: ["entityType"],
      _count: true,
    });

    return success({
      success: true,
      message: "Media assets retrieved successfully",
      data: {
        assets,
        folders: folders
          .filter((f) => f.entityType)
          .map((f) => ({ name: f.entityType, count: f._count })),
        pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request, env: any): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const {
    url, publicId, altText, width, height, fileSize, mimeType,
    type, tags, folder, assetId, entityType, entityId,
    secureUrl, resourceType, originalFilename, displayName, sortOrder, isPrimary,
  } = body;

  if (!url) return badRequest("URL is required");
  try {
    new URL(url as string);
  } catch {
    return badRequest("Invalid URL format");
  }

  try {
    const prisma = getPrisma(env);
    const asset = await prisma.media_assets.create({
      data: {
        assetId: assetId ?? crypto.randomUUID(),
        entityType: entityType ?? "cms",
        entityId: entityId ?? crypto.randomUUID(),
        url,
        secureUrl: secureUrl ?? url,
        publicId: publicId ?? null,
        resourceType: resourceType ?? "image",
        folder: folder ?? null,
        mimeType: mimeType ?? null,
        width: width ?? null,
        height: height ?? null,
        fileSize: fileSize ?? null,
        originalFilename: originalFilename ?? null,
        displayName: displayName ?? altText ?? null,
        altText: altText ?? null,
        mediaType: type ?? "image",
        sortOrder: sortOrder ?? 0,
        isPrimary: isPrimary ?? false,
        tags: tags ?? [],
      },
    });
    return created({
      success: true,
      message: "Media asset created successfully",
      media: asset,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(assetId: string, env: any): Promise<Response> {
  try {
    await deleteMedia(assetId, env);
    return success({
      success: true,
      message: "Media asset deleted successfully",
      data: { assetId },
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Asset not found");
    return serverError(err);
  }
}

async function handleUpdate(assetId: string, req: Request, env: any): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  const { altText, displayName, folder, tags, sortOrder, isPrimary } = body;

  try {
    const prisma = getPrisma(env);
    const data: Record<string, unknown> = {};
    if (altText !== undefined) data.altText = altText;
    if (displayName !== undefined) data.displayName = displayName;
    if (folder !== undefined) data.folder = folder;
    if (tags !== undefined) data.tags = tags;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (isPrimary !== undefined) data.isPrimary = isPrimary;

    const asset = await prisma.media_assets.update({
      where: { id: assetId },
      data: data as never,
    });
    return success({
      success: true,
      message: "Media asset updated successfully",
      media: asset,
    });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") return notFound("Asset not found");
    return serverError(err);
  }
}
