import type { CloudinaryConfig } from "./types";
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
export declare function listFolders(config: CloudinaryConfig): Promise<CloudinaryFolder[]>;
/**
 * List contents of a specific folder
 */
export declare function listFolderContents(folderPath: string, config: CloudinaryConfig, options?: {
    maxResults?: number;
    nextCursor?: string;
    resourceType?: "image" | "video" | "raw";
}): Promise<FolderContents>;
/**
 * Create a new folder in Cloudinary
 * Note: Cloudinary creates folders automatically when uploading to a path
 * This function validates the folder path and prepares it for use
 */
export declare function createFolder(folderPath: string, config: CloudinaryConfig): Promise<{
    success: boolean;
    path: string;
}>;
/**
 * Rename a folder in Cloudinary
 * Since Cloudinary doesn't support direct folder renaming, we need to:
 * 1. List all resources in the old folder
 * 2. Move each resource to the new folder path
 * 3. Delete the old folder (if empty)
 */
export declare function renameFolder(oldPath: string, newPath: string, config: CloudinaryConfig): Promise<{
    moved: number;
    failed: number;
}>;
/**
 * Delete an empty folder from Cloudinary
 * Note: Cloudinary automatically removes empty folders
 * This function validates that the folder is empty before proceeding
 */
export declare function deleteFolder(folderPath: string, config: CloudinaryConfig): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Move a resource from one public_id to another
 */
export declare function moveResource(oldPublicId: string, newPublicId: string, resourceType: "image" | "video" | "raw", config: CloudinaryConfig): Promise<boolean>;
/**
 * Get storage usage information
 */
export declare function getStorageInfo(config: CloudinaryConfig): Promise<{
    totalFiles: number;
    totalImages: number;
    totalVideos: number;
    totalRaw: number;
    usedStorage: number;
}>;
