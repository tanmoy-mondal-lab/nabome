import { prisma } from "../../_lib/prisma";
import { success, badRequest, notFound, serverError, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";
import { destroyCloudinaryAsset } from "../../_lib/cloudinary";

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
      return handleList(req);
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

async function handleList(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "50");
  const type = url.searchParams.get("type");
  const folder = url.searchParams.get("folder");

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (folder) where.folder = folder;

  const skip = (page - 1) * limit;

  try {
    const [assets, total] = await Promise.all([
      prisma.mediaAsset.findMany({
        where: where as never,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.mediaAsset.count({ where: where as never }),
    ]);

    // Get folder list
    const folders = await prisma.mediaAsset.groupBy({
      by: ["folder"],
      _count: true,
    });

    return success({
      assets,
      folders: folders.filter((f) => f.folder).map((f) => ({ name: f.folder, count: f._count })),
      pagination: { total, page, pageSize: limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreate(req: Request): Promise<Response> {
  const body = await req.json();
  const { url, publicId, altText, width, height, fileSize, mimeType, type, tags, folder } = body;

  if (!url) return badRequest("URL is required");

  try {
    const asset = await prisma.mediaAsset.create({
      data: {
        url,
        publicId: publicId ?? null,
        altText: altText ?? null,
        width: width ?? null,
        height: height ?? null,
        fileSize: fileSize ?? null,
        mimeType: mimeType ?? null,
        type: type ?? "image",
        tags: tags ?? [],
        folder: folder ?? null,
      },
    });
    return created(asset);
  } catch (err) {
    return serverError(err);
  }
}

async function handleDelete(assetId: string): Promise<Response> {
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: assetId } });
    if (!asset) return notFound("Asset not found");
    if (asset.publicId) await destroyCloudinaryAsset(asset.publicId);
    await prisma.mediaAsset.delete({ where: { id: assetId } });
    return success({ message: "Asset deleted" });
  } catch (err) {
    return notFound("Asset not found");
  }
}

async function handleUpdate(assetId: string, req: Request): Promise<Response> {
  const body = await req.json();
  const { altText, folder } = body;

  try {
    const data: Record<string, unknown> = {};
    if (altText !== undefined) data.altText = altText;
    if (folder !== undefined) data.folder = folder;

    const asset = await prisma.mediaAsset.update({
      where: { id: assetId },
      data: data as never,
    });
    return success(asset);
  } catch (err) {
    return notFound("Asset not found");
  }
}
