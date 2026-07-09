import { api } from "../client";
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

export const mediaApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<MediaListResponse>("/admin/media", { params }),
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
  }) => api.post<MediaAsset>("/admin/media", data),
  update: (id: string, data: {
    altText?: string;
    displayName?: string;
    folder?: string;
    tags?: string[];
    sortOrder?: number;
    isPrimary?: boolean;
  }) => api.put<MediaAsset>(`/admin/media/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/admin/media/${id}`),
};
