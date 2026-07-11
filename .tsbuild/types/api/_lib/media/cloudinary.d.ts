import type { CloudinaryResourceType, CloudinaryConfig } from "./types";
export declare function deleteAsset(publicId: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<boolean>;
export declare function uploadToCloudinary(file: File, publicId: string, resourceType: CloudinaryResourceType, config: CloudinaryConfig): Promise<{
    publicId: string;
    url: string;
    secureUrl: string;
    bytes: number;
    format: string;
    width: number | null;
    height: number | null;
    resourceType: CloudinaryResourceType;
}>;
export declare function deleteEntityAssets(_entityType: string, _entityId: string, config: CloudinaryConfig): Promise<{
    deleted: number;
    failed: number;
}>;
