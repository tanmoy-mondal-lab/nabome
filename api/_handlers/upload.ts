import { badRequest, unauthorized, serverError, success } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import { cleanSecret } from "../_lib/secrets";
import { requireAdmin } from "../_lib/auth-middleware";
import { getPrisma } from "../_lib/prisma";
import { destroyCloudinaryAsset } from "../_lib/cloudinary";
import type { CloudinaryResourceType } from "../_lib/cloudinary";

const ALLOWED_TYPES: Record<string, { type: "image" | "video" | "document"; resourceType: CloudinaryResourceType; magicBytes: number[] }> = {
  "image/jpeg": { type: "image", resourceType: "image", magicBytes: [0xFF, 0xD8, 0xFF] },
  "image/png": { type: "image", resourceType: "image", magicBytes: [0x89, 0x50, 0x4E, 0x47] },
  "image/webp": { type: "image", resourceType: "image", magicBytes: [0x52, 0x49, 0x46, 0x46] },
  "image/avif": { type: "image", resourceType: "image", magicBytes: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70] },
  "image/gif": { type: "image", resourceType: "image", magicBytes: [0x47, 0x49, 0x46, 0x38] },
  "image/bmp": { type: "image", resourceType: "image", magicBytes: [0x42, 0x4D] },
  "image/tiff": { type: "image", resourceType: "image", magicBytes: [0x49, 0x49, 0x2A, 0x00] },
  "video/mp4": { type: "video", resourceType: "video", magicBytes: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70] },
  "video/webm": { type: "video", resourceType: "video", magicBytes: [0x1A, 0x45, 0xDF, 0xA3] },
  "video/quicktime": { type: "video", resourceType: "video", magicBytes: [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70] },
  "video/x-msvideo": { type: "video", resourceType: "video", magicBytes: [0x52, 0x49, 0x46, 0x46] },
  "video/x-matroska": { type: "video", resourceType: "video", magicBytes: [0x1A, 0x45, 0xDF, 0xA3] },
  "application/pdf": { type: "document", resourceType: "raw", magicBytes: [0x25, 0x50, 0x44, 0x46] },
};

const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Validates file content using magic bytes (file signature)
 * This prevents file type spoofing attacks
 */
async function validateMagicBytes(file: File, expectedMagicBytes: number[]): Promise<boolean> {
  const buffer = await file.slice(0, Math.max(8, expectedMagicBytes.length)).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  for (let i = 0; i < expectedMagicBytes.length; i++) {
    if (bytes[i] !== expectedMagicBytes[i]) {
      return false;
    }
  }
  return true;
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
    const isValidMagicBytes = await validateMagicBytes(file, fileInfo.magicBytes);
    if (!isValidMagicBytes) {
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
