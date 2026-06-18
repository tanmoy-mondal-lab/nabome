import { badRequest, serverError, success } from "../_lib/response";
import type { RequestContext } from "../_lib/types";

export async function handleUploadRequest(
  req: Request,
  ctx: RequestContext
): Promise<Response> {
  if (!ctx.userId) return new Response("Unauthorized", { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET ?? process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    return serverError(new Error("Cloudinary not configured"));
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return badRequest("No file provided");
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return badRequest("Invalid file type. Allowed: JPEG, PNG, WebP, AVIF");
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return badRequest("File too large. Maximum size is 5MB");
    }

    // Upload to Cloudinary via unsigned upload preset
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", uploadPreset ?? "");

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      return serverError(new Error(errorData.error?.message ?? "Upload failed"));
    }

    const result = await uploadResponse.json();

    return success({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (err) {
    return serverError(err);
  }
}
