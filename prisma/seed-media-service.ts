/**
 * Seed Media Service
 * 
 * Node.js-compatible media service for seeding the database.
 * This uses the same Cloudinary operations as the API MediaService
 * but works in a Node.js/tsx environment.
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

interface UploadResult {
  assetId: string;
  url: string;
  secureUrl: string;
  publicId: string;
  folder: string;
  resourceType: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  bytes: number;
  format: string;
  originalFilename: string;
}

// ─── Folder Service ───
const CLOUDINARY_ROOT = "nabome";

const FolderService = {
  getRoot: () => CLOUDINARY_ROOT,
  getProductFolder: (slug: string) => `${CLOUDINARY_ROOT}/products/${slug}`,
  getCategoryFolder: (slug: string) => `${CLOUDINARY_ROOT}/categories/${slug}`,
  getCollectionFolder: (slug: string) => `${CLOUDINARY_ROOT}/collections/${slug}`,
  getBrandFolder: (slug: string) => `${CLOUDINARY_ROOT}/brands/${slug}`,
  getLookbookFolder: (slug: string) => `${CLOUDINARY_ROOT}/lookbooks/${slug}`,
  getCmsFolder: (slug: string) => `${CLOUDINARY_ROOT}/cms/${slug}`,
  getHomepageFolder: (section: string) => `${CLOUDINARY_ROOT}/homepage/${section}`,
  getSettingsFolder: (type: string) => `${CLOUDINARY_ROOT}/settings/${type}`,
  getAssetFolder: (entityFolder: string, assetId: string) => `${entityFolder}/asset_${assetId}`,
};

// ─── Asset ID Generator ───
const generateAssetId = () => randomUUID().replace(/-/g, '').substring(0, 16);

// ─── Cloudinary Operations ───
async function generateSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map((key) => `${key}=${params[key]}`).join("&") + apiSecret;
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-1", enc.encode(signStr));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function uploadToCloudinary(
  fileBuffer: Buffer,
  filename: string,
  mimeType: string,
  folder: string,
  publicId: string,
  resourceType: string,
  config: CloudinaryConfig
): Promise<UploadResult> {
  const timestamp = Math.round(Date.now() / 1000);
  const uploadParams: Record<string, string> = {
    timestamp: String(timestamp),
    folder,
    public_id: publicId,
    use_filename: "true",
    unique_filename: "false",
    overwrite: "false",
    eager: "f_webp,q_80",
  };

  const signature = await generateSignature(uploadParams, config.apiSecret);
  uploadParams.signature = signature;
  uploadParams.api_key = config.apiKey;

  // Create FormData
  const formData = new FormData();
  const uint8Array = new Uint8Array(fileBuffer);
  const blob = new Blob([uint8Array], { type: mimeType });
  formData.append("file", blob, filename);
  for (const [key, value] of Object.entries(uploadParams)) {
    formData.append(key, value);
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(`Cloudinary upload failed (${res.status}): ${errorData.error?.message ?? "Unknown error"}`);
  }

  const data = await res.json();

  return {
    assetId: publicId.split("/")[1] || generateAssetId(),
    url: data.secure_url,
    secureUrl: data.secure_url,
    publicId: data.public_id,
    folder: data.folder,
    resourceType: data.resource_type,
    mimeType: mimeType,
    width: data.width ?? null,
    height: data.height ?? null,
    bytes: data.bytes,
    format: data.format,
    originalFilename: filename,
  };
}

// ─── Main Upload Function ───
export async function uploadSeedMedia(
  entityType: "products" | "categories" | "collections" | "brands" | "homepage" | "settings" | "lookbooks" | "cms" | "blogs" | "sellers" | "users",
  entitySlug: string,
  localFilePath: string,
  config: CloudinaryConfig
): Promise<UploadResult> {
  // Determine folder based on entity type
  let entityFolder: string;
  switch (entityType) {
    case "products":
      entityFolder = FolderService.getProductFolder(entitySlug);
      break;
    case "categories":
      entityFolder = FolderService.getCategoryFolder(entitySlug);
      break;
    case "collections":
      entityFolder = FolderService.getCollectionFolder(entitySlug);
      break;
    case "brands":
      entityFolder = FolderService.getBrandFolder(entitySlug);
      break;
    case "homepage":
      entityFolder = FolderService.getHomepageFolder(entitySlug);
      break;
    case "settings":
      entityFolder = FolderService.getSettingsFolder(entitySlug);
      break;
    case "lookbooks":
      entityFolder = FolderService.getLookbookFolder(entitySlug);
      break;
    case "cms":
      entityFolder = FolderService.getCmsFolder(entitySlug);
      break;
    default:
      entityFolder = `${CLOUDINARY_ROOT}/${entityType}/${entitySlug}`;
  }

  // Generate asset ID and folder
  const assetId = generateAssetId();
  const assetFolder = FolderService.getAssetFolder(entityFolder, assetId);
  
  // Read file
  const fileBuffer = await readFile(localFilePath);
  const filename = localFilePath.split("/").pop() || "file.jpg";
  
  // Determine MIME type from filename
  let mimeType = "image/jpeg";
  let resourceType = "image";
  if (filename.endsWith(".png")) {
    mimeType = "image/png";
  } else if (filename.endsWith(".webp")) {
    mimeType = "image/webp";
  } else if (filename.endsWith(".mp4")) {
    mimeType = "video/mp4";
    resourceType = "video";
  }

  // Upload to Cloudinary
  const publicId = `${assetFolder}/${filename}`;
  const result = await uploadToCloudinary(
    fileBuffer,
    filename,
    mimeType,
    assetFolder,
    publicId,
    resourceType,
    config
  );

  return result;
}

// ─── Config Helper ───
export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary configuration. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }

  return { cloudName, apiKey, apiSecret };
}
