import { badRequest, unauthorized, serverError, success } from "../_lib/response";
import type { RequestContext } from "../_lib/types";
import type { Env } from "../_lib/env";

const ALLOWED_TYPES: Record<string, { type: string; resourceType: string }> = {
  "image/jpeg": { type: "image", resourceType: "image" },
  "image/png": { type: "image", resourceType: "image" },
  "image/webp": { type: "image", resourceType: "image" },
  "image/avif": { type: "image", resourceType: "image" },
  "image/gif": { type: "image", resourceType: "image" },
  "image/svg+xml": { type: "image", resourceType: "image" },
  "image/bmp": { type: "image", resourceType: "image" },
  "image/tiff": { type: "image", resourceType: "image" },
  "video/mp4": { type: "video", resourceType: "video" },
  "video/webm": { type: "video", resourceType: "video" },
  "video/quicktime": { type: "video", resourceType: "video" },
  "video/x-msvideo": { type: "video", resourceType: "video" },
  "video/x-matroska": { type: "video", resourceType: "video" },
  "application/pdf": { type: "document", resourceType: "raw" },
};

const MAX_SIZE = 50 * 1024 * 1024;

export async function handleUploadRequest(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  if (!ctx.userId) return unauthorized();

  const cloudName = ctx.env?.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = ctx.env?.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    return serverError(new Error("Cloudinary not configured"));
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

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", uploadPreset ?? "");
    cloudinaryFormData.append("folder", folder);
    cloudinaryFormData.append("public_id", `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`);

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
      return serverError(new Error(errorData.error?.message ?? "Upload failed"));
    }

    const result = await uploadResponse.json();

    return success({
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