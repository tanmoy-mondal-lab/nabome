import type { Env } from "./env";
import type { EntityType } from "./media/types";
import { validateFile, validateFileContent } from "./media/validation";
export { validateFile, validateFileContent };
export type CloudinaryResourceType = "image" | "video" | "raw";
export interface UploadOptions {
    entityType: EntityType;
    entityId: string;
    slug: string;
    file: File;
    altText?: string;
    displayName?: string;
    sortOrder?: number;
    isPrimary?: boolean;
}
export interface MediaResult {
    id: string;
    assetId: string;
    url: string;
    publicId: string;
    folder: string;
    secureUrl: string;
    resourceType: CloudinaryResourceType;
    mimeType: string;
    width: number | null;
    height: number | null;
    bytes: number;
    format: string;
    originalFilename: string;
}
export interface ReplaceOptions {
    entityType: EntityType;
    entityId: string;
    slug: string;
    file: File;
    oldAssetId: string;
    altText?: string;
    displayName?: string;
}
export declare function uploadMedia(options: UploadOptions, env: Env): Promise<MediaResult>;
export declare function replaceMedia(options: ReplaceOptions, env: Env): Promise<MediaResult>;
export declare function deleteMedia(assetId: string, env: Env): Promise<void>;
export declare function softDeleteMedia(assetId: string, deletedBy: string, reason: string, env: Env): Promise<void>;
export declare function restoreMedia(assetId: string, env: Env): Promise<void>;
export declare function deleteEntityMedia(entityType: EntityType, entityId: string, slug: string, env: Env): Promise<number>;
export declare function migrateEntitySlug(entityType: EntityType, oldSlug: string, newSlug: string, entityId: string, env: Env): Promise<void>;
