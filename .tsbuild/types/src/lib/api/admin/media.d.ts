import type { MediaType, EntityType } from "../../../types/index";
export interface MediaAsset {
    id: string;
    url: string;
    publicId?: string;
    type: MediaType;
    altText?: string;
    entityType?: EntityType;
    entityId?: string;
    assetId?: string;
    secureUrl?: string;
    resourceType?: string;
    originalFilename?: string;
    displayName?: string;
    sortOrder?: number;
    isPrimary?: boolean;
    folder?: string;
    tags?: string[];
    width?: number | null;
    height?: number | null;
    fileSize?: number | null;
    mimeType?: string;
    createdAt: string;
    updatedAt: string;
}
export interface MediaListResponse {
    assets: MediaAsset[];
    folders: string[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}
export declare const mediaApi: {
    list: (params?: Record<string, string | number | undefined>) => Promise<MediaListResponse>;
    create: (data: {
        url: string;
        publicId?: string;
        type?: string;
        altText?: string;
        entityType?: string;
        entityId?: string;
        assetId?: string;
        secureUrl?: string;
        resourceType?: string;
        originalFilename?: string;
        displayName?: string;
        sortOrder?: number;
        isPrimary?: boolean;
        folder?: string;
        tags?: string[];
        width?: number | null;
        height?: number | null;
        fileSize?: number | null;
        mimeType?: string;
    }) => Promise<MediaAsset>;
    update: (id: string, data: {
        altText?: string;
        displayName?: string;
        folder?: string;
        tags?: string[];
        sortOrder?: number;
        isPrimary?: boolean;
    }) => Promise<MediaAsset>;
    delete: (id: string) => Promise<{
        message: string;
    }>;
};
