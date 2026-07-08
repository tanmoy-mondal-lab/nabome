import { badRequest, unauthorized, serverError, success } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { cleanSecret } from "../_lib/secrets";
import { requireAdmin } from "../_lib/auth-middleware";
import { getPrisma } from "../_lib/prisma";
import { destroyCloudinaryAsset } from "../_lib/cloudinary";
import type { CloudinaryResourceType } from "../_lib/cloudinary";

const FTYP_MARKER = [0x66, 0x74, 0x79, 0x70]; // "ftyp" at bytes 4-7

const ALLOWED_TYPES: Record<string, { type: "image" | "video" | "document"; resourceType: CloudinaryResourceType; validate: (bytes: Uint8Array) => boolean }> = {
  "image/jpeg": { type: "image", resourceType: "image", validate: (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF },
  "image/png": { type: "image", resourceType: "image", validate: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47 },
  "image/webp": { type: "image", resourceType: "image", validate: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 },
  "image/avif": { type: "image", resourceType: "image", validate: (b) => b[4] === FTYP_MARKER[0] && b[5] === FTYP_MARKER[1] && b[6] === FTYP_MARKER[2] && b[7] === FTYP_MARKER[3] },
  "image/gif": { type: "image", resourceType: "image", validate: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  "image/bmp": { type: "image", resourceType: "image", validate: (b) => b[0] === 0x42 && b[1] === 0x4D },
  "image/tiff": { type: "image", resourceType: "image", validate: (b) => (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2A && b[3] === 0x00) || (b[0] === 0x4D && b[1] === 0x4D && b[2] === 0x00 && b[3] === 0x2A) },
  "video/mp4": { type: "video", resourceType: "video", validate: (b) => b[4] === FTYP_MARKER[0] && b[5] === FTYP_MARKER[1] && b[6] === FTYP_MARKER[2] && b[7] === FTYP_MARKER[3] },
  "video/webm": { type: "video", resourceType: "video", validate: (b) => b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3 },
  "video/quicktime": { type: "video", resourceType: "video", validate: (b) => b[4] === FTYP_MARKER[0] && b[5] === FTYP_MARKER[1] && b[6] === FTYP_MARKER[2] && b[7] === FTYP_MARKER[3] },
  "video/x-msvideo": { type: "video", resourceType: "video", validate: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 },
  "video/x-matroska": { type: "video", resourceType: "video", validate: (b) => b[0] === 0x1A && b[1] === 0x45 && b[2] === 0xDF && b[3] === 0xA3 },
  "application/pdf": { type: "document", resourceType: "raw", validate: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46 },
};

const MAX_SIZE = 20 * 1024 * 1024;

/**
 * Validates file content using magic bytes (file signature)
 * This prevents file type spoofing attacks
 */
async function validateFileContent(file: File, validate: (bytes: Uint8Array) => boolean): Promise<boolean> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return validate(bytes);
}

/**
 * Enhanced filename sanitization to prevent path traversal and injection attacks
 */
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let cleaned = filename.replace(/\.\./g, "").replace(/[\/\\]/g, "_");
  
  // Remove double extensions
  cleaned = cleaned
    .replace(/\.jpeg\.jpg$/i, ".jpeg")
    .replace(/\.png\.png$/i, ".png")
    .replace(/\.jpg\.jpg$/i, ".jpg")
    .replace(/\.gif\.gif$/i, ".gif")
    .replace(/\.webp\.webp$/i, ".webp")
    .replace(/\.mp4\.mp4$/i, ".mp4")
    .replace(/\.pdf\.pdf$/i, ".pdf");
  
  // Remove special characters and control characters
  cleaned = cleaned.replace(/[^\w\-_.]/g, "_");
  
  // Limit filename length
  const maxLength = 100;
  if (cleaned.length > maxLength) {
    const ext = cleaned.substring(cleaned.lastIndexOf("."));
    const nameWithoutExt = cleaned.substring(0, cleaned.lastIndexOf("."));
    cleaned = nameWithoutExt.substring(0, maxLength - ext.length) + ext;
  }
  
  return cleaned;
}

export async function handleCustomerUploadRequest(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  return doUpload(req, ctx, "customer");
}

export async function handleUploadRequest(req: Request, ctx: RequestContext): Promise<Response> {
  if (!ctx.userId) return unauthorized();
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;
  return doUpload(req, ctx, "admin");
}

async function doUpload(req: Request, ctx: RequestContext, folderPrefix: string): Promise<Response> {
  const cloudName = cleanSecret(ctx.env?.CLOUDINARY_CLOUD_NAME);
  const uploadPreset = cleanSecret(ctx.env?.CLOUDINARY_UPLOAD_PRESET);

  if (!cloudName) {
    return serverError(new Error("Cloudinary not configured — missing CLOUDINARY_CLOUD_NAME"));
  }

  if (!uploadPreset) {
    return serverError(new Error("Cloudinary not configured — missing CLOUDINARY_UPLOAD_PRESET"));
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "general";
    const altText = (formData.get("altText") as string) || file?.name || "";

    if (!file) {
      return badRequest("No file provided");
    }

    const fileInfo = ALLOWED_TYPES[file.type];
    if (!fileInfo) {
      return badRequest(`Unsupported file type: ${file.type}. Allowed: images, videos, PDF`);
    }

    if (file.size > MAX_SIZE) {
      return badRequest(`File too large. Maximum size is ${MAX_SIZE / 1024 / 1024}MB`);
    }

    // Validate file content using magic bytes to prevent type spoofing
    const isValidContent = await validateFileContent(file, fileInfo.validate);
    if (!isValidContent) {
      return badRequest(`File content does not match declared type. Possible file type spoofing detected.`);
    }

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", uploadPreset);
    cloudinaryFormData.append("folder", folder);

    // Use enhanced filename sanitization
    const cleanedName = sanitizeFilename(file.name);
    cloudinaryFormData.append("public_id", `${Date.now()}-${cleanedName}`);

    const uploadUrl = fileInfo.resourceType === "video"
      ? `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`
      : fileInfo.resourceType === "raw"
        ? `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
        : `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: cloudinaryFormData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      const errMsg = errorData.error?.message ?? `Cloudinary upload failed (${uploadResponse.status})`;
      return serverError(new Error(errMsg));
    }

    const result = await uploadResponse.json();
    let asset;
    try {
      asset = await getPrisma(ctx.env).mediaAsset.create({
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          altText: altText || null,
          width: result.width ?? null,
          height: result.height ?? null,
          fileSize: result.bytes ?? file.size,
          mimeType: file.type,
          type: fileInfo.type as "image" | "video" | "document",
          folder,
        },
      });
    } catch (databaseError) {
      await destroyCloudinaryAsset(result.public_id, ctx.env, fileInfo.resourceType).catch(() => undefined);
      throw databaseError;
    }

    return success({
      assetId: asset.id,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width ?? null,
      height: result.height ?? null,
      format: result.format,
      bytes: result.bytes,
      type: fileInfo.type,
      mimeType: file.type,
      folder,
      altText,
    });
  } catch (err) {
    return serverError(err);
  }
}
