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
export declare const productsApi: {
    list: (params?: Record<string, string | number | undefined>) => Promise<ProductListResponse>;
    get: (id: string) => Promise<ProductDetailResponse>;
    create: (data: Partial<Product>) => Promise<Product>;
    update: (id: string, data: Partial<Product>) => Promise<Product>;
    delete: (id: string) => Promise<{
        message: string;
    }>;
    updateVariants: (id: string, variants: Partial<ProductVariant>[]) => Promise<{
        variants: ProductVariant[];
    }>;
    addImage: (id: string, data: {
        url: string;
        publicId?: string;
        altText?: string;
        isPrimary?: boolean;
        sortOrder?: number;
        variantId?: string;
        type?: string;
    }) => Promise<ProductImage>;
    deleteImage: (productId: string, imageId: string) => Promise<unknown>;
    duplicate: (id: string) => Promise<{
        product: Product;
        message: string;
    }>;
    restore: (id: string) => Promise<{
        message: string;
    }>;
    schedule: (id: string, data: {
        publishAt?: string;
        archiveAt?: string;
    }) => Promise<{
        message: string;
    }>;
    bulkUpdateStatus: (ids: string[], status: boolean) => Promise<{
        updated: number;
    }>;
    bulkUpdateCategory: (ids: string[], data: {
        categoryId?: string;
        subcategoryId?: string;
        collectionId?: string;
    }) => Promise<{
        updated: number;
    }>;
    bulkDelete: (ids: string[]) => Promise<{
        archived: number;
    }>;
    permanentDelete: (id: string) => Promise<{
        message: string;
    }>;
    bulkPermanentDelete: (ids: string[]) => Promise<{
        deleted: number;
    }>;
    getRelated: (productId: string) => Promise<{
        related: Product[];
    }>;
    assignLabels: (productId: string, labelIds: string[]) => Promise<unknown>;
    assignTags: (productId: string, tagIds: string[]) => Promise<unknown>;
};
