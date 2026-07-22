import type { EntityType, CloudinaryConfig, CloudinaryResourceType } from "./types";
export interface CreateMediaResult {
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
export declare function createMediaAsset(file: File, entityType: EntityType, slug: string, config: CloudinaryConfig): Promise<CreateMediaResult>;
export interface ReplaceMediaResult {
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
export declare function replaceMediaAsset(file: File, entityType: EntityType, _entityId: string, slug: string, _oldAssetId: string, _oldPublicId: string, _oldResourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<ReplaceMediaResult>;
export declare function deleteMediaAsset(publicId: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<void>;
export interface DeleteEntityResult {
    deletedCount: number;
    migratedAssets: number;
    failedMigrations: number;
}
export declare function deleteEntityMediaAssets(entityType: EntityType, _entityId: string, slug: string, config: CloudinaryConfig): Promise<DeleteEntityResult>;
export interface MigrateSlugResult {
    migratedAssets: number;
    failedMigrations: number;
}
export declare function migrateEntitySlug(entityType: EntityType, _entityId: string, _oldSlug: string, newSlug: string, assetMappings: Array<{
    assetId: string;
    oldPublicId: string;
    oldResourceType: CloudinaryResourceType;
    originalFilename: string;
}>, config: CloudinaryConfig): Promise<MigrateSlugResult>;
