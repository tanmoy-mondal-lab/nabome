import { api } from "../client";
import type { Product, ProductVariant, ProductImage } from "../../../types/index";

export interface ProductListResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ProductDetailResponse {
  product: Product & {
    variants: ProductVariant[];
    images: ProductImage[];
  };
}

export const productsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<ProductListResponse>("/admin/products", { params }),
  get: (id: string) => api.get<ProductDetailResponse>(`/admin/products/${id}`),
  create: (data: Partial<Product>) => api.post<Product>("/admin/products", data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/admin/products/${id}`, data),
  delete: (id: string) => api.delete<{ message: string }>(`/admin/products/${id}`),
  updateVariants: (id: string, variants: Partial<ProductVariant>[]) =>
    api.put<{ variants: ProductVariant[] }>(`/admin/products/${id}/variants`, { variants }),
  addImage: (id: string, data: { url: string; publicId?: string; altText?: string; isPrimary?: boolean; sortOrder?: number; variantId?: string; type?: string }) =>
    api.post<ProductImage>(`/admin/products/${id}/images`, data),
  deleteImage: (productId: string, imageId: string) =>
    api.delete(`/admin/products/${productId}/images/${imageId}`),
  duplicate: (id: string) => api.post<{ product: Product; message: string }>(`/admin/products/${id}/duplicate`),
  restore: (id: string) => api.put<{ message: string }>(`/admin/products/${id}/restore`),
  schedule: (id: string, data: { publishAt?: string; archiveAt?: string }) =>
    api.put<{ message: string }>(`/admin/products/${id}/schedule`, data),
  bulkUpdateStatus: (ids: string[], status: boolean) =>
    api.put<{ updated: number }>("/admin/products/bulk/status", { ids, status }),
  bulkUpdateCategory: (ids: string[], data: { categoryId?: string; subcategoryId?: string; collectionId?: string }) =>
    api.put<{ updated: number }>("/admin/products/bulk/category", { ids, ...data }),
  bulkDelete: (ids: string[]) =>
    api.put<{ archived: number }>("/admin/products/bulk/delete", { ids }),
  permanentDelete: (id: string) =>
    api.delete<{ message: string }>(`/admin/products/${id}/permanent`),
  bulkPermanentDelete: (ids: string[]) =>
    api.put<{ deleted: number }>("/admin/products/bulk/permanent-delete", { ids }),
  getRelated: (productId: string) =>
    api.get<{ related: Product[] }>(`/admin/products/${productId}/related`),
  assignLabels: (productId: string, labelIds: string[]) =>
    api.put(`/admin/products/${productId}/labels`, { labelIds }),
  assignTags: (productId: string, tagIds: string[]) =>
    api.put(`/admin/products/${productId}/tags`, { tagIds }),
};
