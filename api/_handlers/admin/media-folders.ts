// ─────────────────────────────────────────────────────────────
// ADMIN MEDIA FOLDER MANAGEMENT API
// Create, rename, delete, move, and list folders in Cloudinary
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";
import { cleanSecret } from "../../_lib/secrets";
import type { Env } from "../../_lib/env";
import { getEnv } from "../../_lib/env";
import {
  listFolders,
  listFolderContents,
  createFolder,
  renameFolder,
  deleteFolder,
  getStorageInfo,
} from "../../_lib/media/folders";

function getCloudinaryConfig(env?: Env) {
  const effectiveEnv = env || getEnv();
  return {
    cloudName: cleanSecret(effectiveEnv.CLOUDINARY_CLOUD_NAME),
    apiKey: cleanSecret(effectiveEnv.CLOUDINARY_API_KEY),
    apiSecret: cleanSecret(effectiveEnv.CLOUDINARY_API_SECRET),
  };
}

export async function handleAdminMediaFoldersRequest(
  _req: Request,
  ctx: RequestContext,
  _params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "list":
      return handleListFolders(_req, ctx.env!);
    case "contents":
      return handleListFolderContents(_req, ctx.env!);
    case "create":
      return handleCreateFolder(_req, ctx.env!);
    case "rename":
      return handleRenameFolder(_req, ctx.env!);
    case "delete":
      return handleDeleteFolder(_req, ctx.env!);
    case "move":
      return handleMoveFolder(_req, ctx.env!);
    case "storage":
      return handleGetStorageInfo(_req, ctx.env!);
    default:
      return badRequest("Unknown action");
  }
}

async function handleListFolders(_req: Request, env: Env): Promise<Response> {
  try {
    const config = getCloudinaryConfig(env);
    const folders = await listFolders(config);

    return success({
      success: true,
      message: "Folders retrieved successfully",
      folders,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleListFolderContents(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const folderPath = url.searchParams.get("path") || "";
  const maxResults = parseInt(url.searchParams.get("maxResults") || "100");
  const nextCursor = url.searchParams.get("nextCursor") || undefined;
  const resourceType = url.searchParams.get("resourceType") as "image" | "video" | "raw" | undefined;

  if (!folderPath) {
    return badRequest("Folder path is required");
  }

  try {
    const config = getCloudinaryConfig(env);
    const contents = await listFolderContents(folderPath, config, {
      maxResults,
      nextCursor,
      resourceType,
    });

    // Also get database records for these resources
    const prisma = getPrisma(env);
    const publicIds = contents.resources.map(r => r.public_id);
    
    const dbAssets = await prisma.media_assets.findMany({
      where: {
        publicId: { in: publicIds },
      },
      select: {
        id: true,
        publicId: true,
        altText: true,
        displayName: true,
        tags: true,
        entityType: true,
        entityId: true,
      },
    });

    const assetMap = new Map(dbAssets.map(a => [a.publicId || "", a]));

    const enrichedResources = contents.resources.map(resource => ({
      ...resource,
      metadata: assetMap.get(resource.public_id) || null,
    }));

    return success({
      success: true,
      message: "Folder contents retrieved successfully",
      folders: contents.folders,
      resources: enrichedResources,
      nextCursor: contents.next_cursor,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCreateFolder(req: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { path } = body;

  if (!path || typeof path !== "string") {
    return badRequest("Folder path is required");
  }

  try {
    const config = getCloudinaryConfig(env);
    const result = await createFolder(path, config);

    return success({
      success: true,
      message: "Folder created successfully",
      path: result.path,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return badRequest(msg);
  }
}

async function handleRenameFolder(req: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { oldPath, newPath } = body;

  if (!oldPath || typeof oldPath !== "string") {
    return badRequest("Old folder path is required");
  }

  if (!newPath || typeof newPath !== "string") {
    return badRequest("New folder path is required");
  }

  try {
    const config = getCloudinaryConfig(env);
    const result = await renameFolder(oldPath, newPath, config);

    // Update database records for moved assets
    const prisma = getPrisma(env);
    const assetsToUpdate = await prisma.media_assets.findMany({
      where: {
        folder: { contains: oldPath },
      },
      select: { id: true, folder: true },
    });

    for (const asset of assetsToUpdate) {
      if (asset.folder) {
        await prisma.media_assets.update({
          where: { id: asset.id },
          data: {
            folder: asset.folder.replace(oldPath, newPath),
          },
        });
      }
    }

    return success({
      success: true,
      message: "Folder renamed successfully",
      moved: result.moved,
      failed: result.failed,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return badRequest(msg);
  }
}

async function handleDeleteFolder(req: Request, env: Env): Promise<Response> {
  const url = new URL(req.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return badRequest("Folder path is required");
  }

  try {
    const config = getCloudinaryConfig(env);
    const result = await deleteFolder(path, config);

    if (!result.success) {
      return badRequest(result.message);
    }

    return success({
      success: true,
      message: result.message,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return badRequest(msg);
  }
}

async function handleMoveFolder(req: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { oldPath, newPath } = body;

  if (!oldPath || typeof oldPath !== "string") {
    return badRequest("Old folder path is required");
  }

  if (!newPath || typeof newPath !== "string") {
    return badRequest("New folder path is required");
  }

  try {
    const config = getCloudinaryConfig(env);
    const result = await renameFolder(oldPath, newPath, config);

    // Update database records for moved assets
    const prisma = getPrisma(env);
    const assetsToUpdate = await prisma.media_assets.findMany({
      where: {
        folder: { contains: oldPath },
      },
      select: { id: true, folder: true },
    });

    for (const asset of assetsToUpdate) {
      if (asset.folder) {
        await prisma.media_assets.update({
          where: { id: asset.id },
          data: {
            folder: asset.folder.replace(oldPath, newPath),
          },
        });
      }
    }

    return success({
      success: true,
      message: "Folder moved successfully",
      moved: result.moved,
      failed: result.failed,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return badRequest(msg);
  }
}

async function handleGetStorageInfo(_req: Request, env: Env): Promise<Response> {
  try {
    const config = getCloudinaryConfig(env);
    const info = await getStorageInfo(config);

    return success({
      success: true,
      message: "Storage info retrieved successfully",
      ...info,
    });
  } catch (err) {
    return serverError(err);
  }
}
