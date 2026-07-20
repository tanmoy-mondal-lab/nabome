// ─────────────────────────────────────────────────────────────
// CLOUDINARY FOLDER MANAGEMENT
// Create, rename, delete, move, and list folders in Cloudinary
// ─────────────────────────────────────────────────────────────

import type { CloudinaryConfig } from "./types";

const CLOUDINARY_API_TIMEOUT = 15000;

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

export interface CloudinaryFolder {
  path: string;
  name: string;
}

export interface CloudinaryResource {
  public_id: string;
  resource_type: "image" | "video" | "raw";
  format: string;
  bytes: number;
  width: number | null;
  height: number | null;
  url: string;
  secure_url: string;
  created_at: string;
  filename: string;
}

export interface FolderContents {
  folders: CloudinaryFolder[];
  resources: CloudinaryResource[];
  next_cursor?: string;
}

/**
 * List all folders in Cloudinary
 */
export async function listFolders(config: CloudinaryConfig): Promise<CloudinaryFolder[]> {
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    timestamp: String(timestamp),
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const body = new URLSearchParams(params);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_API_TIMEOUT);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/folders`,
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
        errorData.error?.message ?? `Cloudinary list folders failed (${res.status})`
      );
    }

    const result = await res.json();
    return result.folders?.map((f: any) => ({
      path: f.path,
      name: f.name,
    })) ?? [];
  } catch (error) {
    clearTimeout(timeout);
    console.error("[Cloudinary] listFolders failed:", error);
    throw error;
  }
}

/**
 * List contents of a specific folder
 */
export async function listFolderContents(
  folderPath: string,
  config: CloudinaryConfig,
  options?: {
    maxResults?: number;
    nextCursor?: string;
    resourceType?: "image" | "video" | "raw";
  }
): Promise<FolderContents> {
  validateCloudinaryConfig(config);

  const expression = options?.resourceType
    ? `${options.resourceType}:* AND folder:"${folderPath}"`
    : `folder:"${folderPath}"`;

  const body = JSON.stringify({
    expression,
    max_results: options?.maxResults ?? 100,
    ...(options?.nextCursor ? { next_cursor: options.nextCursor } : {}),
  });

  const auth = btoa(`${config.apiKey}:${config.apiSecret}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_API_TIMEOUT);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/resources/search`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${auth}`,
        },
        body,
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ?? `Cloudinary list folder contents failed (${res.status})`
      );
    }

    const result = await res.json();
    
    // Extract folders from the resources
    const folderSet = new Set<string>();
    const resources: CloudinaryResource[] = result.resources?.map((r: any) => {
      const pathParts = r.public_id.split('/');
      if (pathParts.length > 1) {
        // Add parent folders
        for (let i = 0; i < pathParts.length - 1; i++) {
          const folderPath = pathParts.slice(0, i + 1).join('/');
          folderSet.add(folderPath);
        }
      }
      return {
        public_id: r.public_id,
        resource_type: r.resource_type,
        format: r.format,
        bytes: r.bytes,
        width: r.width ?? null,
        height: r.height ?? null,
        url: r.url,
        secure_url: r.secure_url,
        created_at: r.created_at,
        filename: r.filename || r.public_id.split('/').pop(),
      };
    }) ?? [];

    const folders = Array.from(folderSet).map(path => ({
      path,
      name: path.split('/').pop() || path,
    }));

    return {
      folders,
      resources,
      next_cursor: result.next_cursor,
    };
  } catch (error) {
    clearTimeout(timeout);
    console.error("[Cloudinary] listFolderContents failed:", error);
    throw error;
  }
}

/**
 * Create a new folder in Cloudinary
 * Note: Cloudinary creates folders automatically when uploading to a path
 * This function validates the folder path and prepares it for use
 */
export async function createFolder(
  folderPath: string,
  config: CloudinaryConfig
): Promise<{ success: boolean; path: string }> {
  validateCloudinaryConfig(config);

  // Cloudinary doesn't have a direct "create folder" API
  // Folders are created automatically when you upload to that path
  // We'll validate the path format and return success
  const normalizedPath = folderPath.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
  
  if (!normalizedPath) {
    throw new Error("Invalid folder path");
  }

  // Validate folder name (no special characters that could cause issues)
  if (/[^a-zA-Z0-9_\-\/\s]/.test(normalizedPath)) {
    throw new Error("Folder path contains invalid characters");
  }

  return {
    success: true,
    path: normalizedPath,
  };
}

/**
 * Rename a folder in Cloudinary
 * Since Cloudinary doesn't support direct folder renaming, we need to:
 * 1. List all resources in the old folder
 * 2. Move each resource to the new folder path
 * 3. Delete the old folder (if empty)
 */
export async function renameFolder(
  oldPath: string,
  newPath: string,
  config: CloudinaryConfig
): Promise<{ moved: number; failed: number }> {
  validateCloudinaryConfig(config);

  const normalizedOldPath = oldPath.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");
  const normalizedNewPath = newPath.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");

  if (!normalizedOldPath || !normalizedNewPath) {
    throw new Error("Invalid folder path");
  }

  // Get all resources in the old folder
  const contents = await listFolderContents(normalizedOldPath, config);
  
  let moved = 0;
  let failed = 0;

  // Move each resource
  for (const resource of contents.resources) {
    try {
      const oldPublicId = resource.public_id;
      const newPublicId = oldPublicId.replace(
        new RegExp(`^${normalizedOldPath}`),
        normalizedNewPath
      );

      await moveResource(oldPublicId, newPublicId, resource.resource_type, config);
      moved++;
    } catch (error) {
      console.error(`[Cloudinary] Failed to move resource ${resource.public_id}:`, error);
      failed++;
    }
  }

  return { moved, failed };
}

/**
 * Delete an empty folder from Cloudinary
 * Note: Cloudinary automatically removes empty folders
 * This function validates that the folder is empty before proceeding
 */
export async function deleteFolder(
  folderPath: string,
  config: CloudinaryConfig
): Promise<{ success: boolean; message: string }> {
  validateCloudinaryConfig(config);

  const normalizedPath = folderPath.replace(/^\/+|\/+$/g, "").replace(/\/+/g, "/");

  // Check if folder is empty
  const contents = await listFolderContents(normalizedPath, config);
  
  if (contents.resources.length > 0) {
    return {
      success: false,
      message: "Cannot delete folder: it contains resources",
    };
  }

  // Cloudinary automatically removes empty folders
  // We just need to confirm it's empty
  return {
    success: true,
    message: "Folder is empty and will be automatically removed by Cloudinary",
  };
}

/**
 * Move a resource from one public_id to another
 */
export async function moveResource(
  oldPublicId: string,
  newPublicId: string,
  resourceType: "image" | "video" | "raw",
  config: CloudinaryConfig
): Promise<boolean> {
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    timestamp: String(timestamp),
    from_public_id: oldPublicId,
    to_public_id: newPublicId,
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const body = new URLSearchParams(params);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_API_TIMEOUT);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/rename`,
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
        errorData.error?.message ?? `Cloudinary rename failed (${res.status})`
      );
    }

    return true;
  } catch (error) {
    clearTimeout(timeout);
    console.error("[Cloudinary] moveResource failed:", oldPublicId, error);
    throw error;
  }
}

/**
 * Get storage usage information
 */
export async function getStorageInfo(config: CloudinaryConfig): Promise<{
  totalFiles: number;
  totalImages: number;
  totalVideos: number;
  totalRaw: number;
  usedStorage: number;
}> {
  validateCloudinaryConfig(config);

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string> = {
    timestamp: String(timestamp),
    max_results: "500",
  };

  const signature = await generateSignature(params, config.apiSecret);
  params.signature = signature;
  params.api_key = config.apiKey;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUDINARY_API_TIMEOUT);

  try {
    const url = new URL(`https://api.cloudinary.com/v1_1/${config.cloudName}/resources/image`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const res = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      // If we can't get detailed info, return zeros
      return {
        totalFiles: 0,
        totalImages: 0,
        totalVideos: 0,
        totalRaw: 0,
        usedStorage: 0,
      };
    }

    const result = await res.json();
    
    // Get counts for each resource type
    const imageCount = result.resources?.length ?? 0;
    const imageBytes = result.resources?.reduce((sum: number, r: any) => sum + (r.bytes || 0), 0) ?? 0;

    // Note: This is a simplified implementation
    // A production implementation would fetch all resource types and aggregate
    return {
      totalFiles: imageCount,
      totalImages: imageCount,
      totalVideos: 0,
      totalRaw: 0,
      usedStorage: imageBytes,
    };
  } catch (error) {
    clearTimeout(timeout);
    console.error("[Cloudinary] getStorageInfo failed:", error);
    return {
      totalFiles: 0,
      totalImages: 0,
      totalVideos: 0,
      totalRaw: 0,
      usedStorage: 0,
    };
  }
}
