// ─────────────────────────────────────────────────────────────
// ADMIN MEDIA UPLOAD WITH FOLDER SUPPORT
// Upload media directly to specific Cloudinary folders
// ─────────────────────────────────────────────────────────────

import { getPrisma } from "../../_lib/prisma";
import { success, badRequest, created } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth-middleware";
import { cleanSecret } from "../../_lib/secrets";
import type { Env } from "../../_lib/env";
import { getEnv } from "../../_lib/env";
import { uploadToCloudinary } from "../../_lib/media/cloudinary";
import { validateFile, validateFileContent, getFileTypeConfig } from "../../_lib/media/validation";
import { generateAssetId } from "../../_lib/media/asset-id";


function getCloudinaryConfig(env?: Env) {
  const effectiveEnv = env || getEnv();
  return {
    cloudName: cleanSecret(effectiveEnv.CLOUDINARY_CLOUD_NAME),
    apiKey: cleanSecret(effectiveEnv.CLOUDINARY_API_KEY),
    apiSecret: cleanSecret(effectiveEnv.CLOUDINARY_API_SECRET),
  };
}

/**
 * Reconstructs the new Cloudinary public_id for a moved asset.
 *
 * The stored DB `assetId` column for admin-uploaded assets actually contains the
 * full public_id (e.g. "media-library/sub/<assetId>/file.png"), so naively
 * prefixing it with the destination folder produced a doubly-nested path. Instead
 * we keep every path segment after the asset's current folder and re-prefix it
 * with the destination folder.
 */
function buildMovedPublicId(asset: { publicId?: string | null; folder?: string | null }, newFolder: string): string {
  const oldPublicId = asset.publicId || "";
  const oldFolder = asset.folder || "";
  let suffix: string;
  if (oldFolder && oldPublicId.startsWith(`${oldFolder}/`)) {
    suffix = oldPublicId.slice(oldFolder.length + 1);
  } else {
    suffix = oldPublicId.split("/").slice(1).join("/");
  }
  return `${newFolder}/${suffix}`;
}

export async function handleAdminMediaUploadRequest(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return badRequest("No file provided");

    const validation = validateFile(file);
    if (!validation.valid) return badRequest(validation.error!);

    const contentValidation = await validateFileContent(file, file.type);
    if (!contentValidation.valid) return badRequest(contentValidation.error!);

    const folder = (formData.get("folder") as string) || "media-library";
    const altText = (formData.get("altText") as string) || file.name;
    const displayName = (formData.get("displayName") as string) || altText;
    const tags = formData.get("tags") ? JSON.parse(formData.get("tags") as string) : [];

    const fileConfig = getFileTypeConfig(file.type);
    if (!fileConfig) {
      return badRequest("Unsupported file type");
    }

    const config = getCloudinaryConfig(ctx.env!);
    const assetId = generateAssetId();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const publicId = `${folder}/${assetId}/${safeName}`;

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      file,
      publicId,
      fileConfig.type as "image" | "video" | "raw",
      config
    );

    // Save to database
    const prisma = getPrisma(ctx.env!);
    const asset = await prisma.media_assets.create({
      data: {
        assetId: uploadResult.publicId,
        entityType: "cms", // Using cms as base type, folder provides organization
        entityId: crypto.randomUUID(),
        url: uploadResult.url,
        secureUrl: uploadResult.secureUrl,
        publicId: uploadResult.publicId,
        folder: folder,
        resourceType: uploadResult.resourceType,
        mimeType: file.type,
        width: uploadResult.width,
        height: uploadResult.height,
        fileSize: uploadResult.bytes,
        originalFilename: file.name,
        displayName: displayName,
        altText: altText,
        mediaType: fileConfig.type as "image" | "video" | "document",
        sortOrder: 0,
        isPrimary: false,
        tags: tags,
      },
    });

    return created({
      success: true,
      message: "File uploaded successfully",
      media: {
        id: asset.id,
        assetId: asset.assetId,
        url: asset.url,
        publicId: asset.publicId,
        folder: asset.folder,
        secureUrl: asset.secureUrl,
        width: asset.width,
        height: asset.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        mimeType: asset.mimeType,
        resourceType: asset.resourceType,
        originalFilename: asset.originalFilename,
        displayName: asset.displayName,
        altText: asset.altText,
        tags: asset.tags,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return badRequest(msg);
  }
}

export async function handleAdminMediaMoveRequest(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { assetId, newFolder } = body;

  if (!assetId || typeof assetId !== "string") {
    return badRequest("Asset ID is required");
  }

  if (!newFolder || typeof newFolder !== "string") {
    return badRequest("New folder is required");
  }

  try {
    const prisma = getPrisma(ctx.env!);
    const asset = await prisma.media_assets.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      return badRequest("Asset not found");
    }

    const config = getCloudinaryConfig(ctx.env!);
    const newPublicId = buildMovedPublicId(asset, newFolder);

    // Move in Cloudinary
    const { moveResource } = await import("../../_lib/media/folders");
    await moveResource(
      asset.publicId || "",
      newPublicId,
      (asset.resourceType ?? "image") as "image" | "video" | "raw",
      config
    );

    // Update database
    const updatedAsset = await prisma.media_assets.update({
      where: { id: assetId },
      data: {
        folder: newFolder,
        publicId: newPublicId,
        url: asset.url?.replace(asset.publicId || "", newPublicId) ?? asset.url,
        secureUrl: asset.secureUrl?.replace(asset.publicId || "", newPublicId) ?? asset.secureUrl,
      },
    });

    return success({
      success: true,
      message: "Asset moved successfully",
      media: updatedAsset,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return badRequest(msg);
  }
}

export async function handleAdminMediaBulkDeleteRequest(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { assetIds } = body;

  if (!Array.isArray(assetIds) || assetIds.length === 0) {
    return badRequest("Asset IDs array is required");
  }

  try {
    const { deleteMedia } = await import("../../_lib/media-service");
    const { isAssetInUse } = await import("../../_lib/media/usage.service");
    const config = getCloudinaryConfig(ctx.env!);

    let deleted = 0;
    let failed = 0;
    let skippedInUse = 0;

    for (const assetId of assetIds) {
      try {
        const prisma = getPrisma(ctx.env!);
        const asset = await prisma.media_assets.findUnique({
          where: { id: assetId },
          select: { id: true, publicId: true },
        });

        if (!asset) {
          failed++;
          continue;
        }

        // Integrity guard: never hard-delete an asset that is still referenced
        // by products, categories, settings, etc. (mirrors single-delete behavior).
        if (await isAssetInUse(prisma, asset.publicId)) {
          skippedInUse++;
          failed++;
          continue;
        }

        await deleteMedia(assetId, { ...ctx.env!, ...config } as Env);
        deleted++;
      } catch (err) {
        console.error(`Failed to delete asset ${assetId}:`, err);
        failed++;
      }
    }

    return success({
      success: true,
      message: `Deleted ${deleted} assets, ${failed} failed${skippedInUse ? ` (${skippedInUse} skipped: in use)` : ""}`,
      deleted,
      failed,
      skippedInUse,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return badRequest(msg);
  }
}

export async function handleAdminMediaBulkMoveRequest(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { assetIds, newFolder } = body;

  if (!Array.isArray(assetIds) || assetIds.length === 0) {
    return badRequest("Asset IDs array is required");
  }

  if (!newFolder || typeof newFolder !== "string") {
    return badRequest("New folder is required");
  }

  try {
    const prisma = getPrisma(ctx.env!);
    const config = getCloudinaryConfig(ctx.env!);
    const { moveResource } = await import("../../_lib/media/folders");

    let moved = 0;
    let failed = 0;

    for (const assetId of assetIds) {
      try {
        const asset = await prisma.media_assets.findUnique({
          where: { id: assetId },
        });

        if (!asset) {
          failed++;
          continue;
        }

        const oldPublicId = asset.publicId || "";
        const newPublicId = buildMovedPublicId(asset, newFolder);

        await moveResource(
          oldPublicId,
          newPublicId,
          (asset.resourceType ?? "image") as "image" | "video" | "raw",
          config
        );

        await prisma.media_assets.update({
          where: { id: assetId },
          data: {
            folder: newFolder,
            publicId: newPublicId,
            url: asset.url?.replace(oldPublicId, newPublicId) ?? asset.url,
            secureUrl: asset.secureUrl?.replace(oldPublicId, newPublicId) ?? asset.secureUrl,
          },
        });

        moved++;
      } catch (err) {
        console.error(`Failed to move asset ${assetId}:`, err);
        failed++;
      }
    }

    return success({
      success: true,
      message: `Moved ${moved} assets, ${failed} failed`,
      moved,
      failed,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return badRequest(msg);
  }
}
