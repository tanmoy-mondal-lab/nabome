import type { CloudinaryResourceType, CloudinaryConfig } from "./types";

const CLOUDINARY_DESTROY_TIMEOUT = 10000;
const CLOUDINARY_UPLOAD_TIMEOUT = 60000;

async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map((key) => `${key}=${params[key]}`).join("&") + apiSecret;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(signStr));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validateCloudinaryConfig(config: CloudinaryConfig): void {
  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw new Error("Invalid Cloudinary configuration");
  }
}

export async function deleteAsset(
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig
): Promise<boolean> {
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    public_id: publicId,
    timestamp: String(timestamp),
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const body = new URLSearchParams(params);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_DESTROY_TIMEOUT);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/destroy`,
      {
        method: "POST",
        body,
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ?? `Cloudinary destroy failed (${res.status})`
      );
    }

    return true;
  } catch (error) {
    clearTimeout(timeout);
    console.error("[Cloudinary] deleteAsset failed:", publicId, error); // eslint-disable-line no-console
    return false;
  }
}

export async function uploadToCloudinary(
  file: File,
  publicId: string,
  resourceType: CloudinaryResourceType,
  config: CloudinaryConfig
): Promise<{
  publicId: string;
  url: string;
  secureUrl: string;
  bytes: number;
  format: string;
  width: number | null;
  height: number | null;
  resourceType: CloudinaryResourceType;
}> {
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  // public_id already contains the full folder path (e.g. nabome/products/slug/assetId/file),
  // so we must NOT also pass `folder` — doing both double-nests the path in Cloudinary.
  const uploadParams: Record<string, string> = {
    timestamp: String(timestamp),
    public_id: publicId,
  };

  const signature = await generateSignature(uploadParams, config.apiSecret);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", uploadParams.timestamp);
  formData.append("signature", signature);
  formData.append("public_id", uploadParams.public_id);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_UPLOAD_TIMEOUT);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
      { method: "POST", body: formData, signal: controller.signal }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ?? `Cloudinary upload failed (${res.status})`
      );
    }

    const result = await res.json();
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      bytes: result.bytes,
      format: result.format,
      width: result.width ?? null,
      height: result.height ?? null,
      resourceType: result.resource_type,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function deleteEntityAssets(
  _entityType: string,
  _entityId: string,
  config: CloudinaryConfig
): Promise<{ deleted: number; failed: number }> {
  validateCloudinaryConfig(config);

  // This is a placeholder implementation
  // In a real implementation, you would query the database for assets associated with the entity
  // and delete them from Cloudinary
  return { deleted: 0, failed: 0 };
}
