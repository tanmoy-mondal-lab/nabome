export type CloudinaryResourceType = "image" | "video" | "raw";

export type MediaType = "image" | "video" | "document";

export type EntityType =
  | "settings"
  | "homepage"
  | "products"
  | "categories"
  | "collections"
  | "brands"
  | "labels"
  | "lookbooks"
  | "blogs"
  | "cms"
  | "sellers"
  | "users";

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

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

export interface ReplaceOptions {
  entityType: EntityType;
  entityId: string;
  slug: string;
  file: File;
  oldAssetId: string;
  altText?: string;
  displayName?: string;
}

export interface UploadResult {
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

export interface ValidationResult {
  valid: boolean;
  error?: string;
  details?: Record<string, unknown>;
}
