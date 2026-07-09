export interface DropdownItem {
    id: string;
    name: string;
    categoryId?: string;
    color?: string;
    slug?: string;
}
export interface ProductFormData {
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    categoryId: string;
    subcategoryId: string;
    collectionId: string;
    brandId: string;
    sizeGuideId: string;
    material: string;
    careInstructions: string;
    basePrice: number;
    compareAtPrice: number;
    costPrice: number;
    salePrice: number;
    discountPercent: number;
    currency: string;
    gender: string;
    isActive: boolean;
    isFeatured: boolean;
    isNew: boolean;
    sortOrder: number;
    metaTitle: string;
    metaDesc: string;
    scheduledPublishAt: string;
    scheduledArchiveAt: string;
    sizeChartUrl: string;
    sizeChartPublicId: string;
}
export interface VariantImage {
    id?: string;
    url: string;
    publicId?: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
    type?: string;
}
export interface Variant {
    id: string;
    sku: string;
    size: string;
    color: string;
    colorHex: string;
    priceAdjustment: number;
    stock: number;
    weight: number;
    isActive: boolean;
    videoUrl?: string;
    videoPublicId?: string;
    images?: VariantImage[];
}
export interface ProductImage {
    id?: string;
    url: string;
    publicId?: string;
    altText?: string;
    isPrimary?: boolean;
    sortOrder?: number;
    type?: string;
}
export declare function useFormDirty(form: ProductFormData, variants: Variant[], images: ProductImage[], selectedLabels: string[]): {
    dirty: boolean;
    setInitial: (initForm: ProductFormData, initVariants: Variant[], initImages: ProductImage[], initLabels: string[]) => void;
    resetDirty: () => void;
};
export interface FormErrors {
    name?: string;
    basePrice?: string;
}
export declare function validateProductForm(form: ProductFormData): FormErrors;
export declare function useProductDropdowns(): {
    categories: import("@tanstack/react-query").UseQueryResult<NoInfer<DropdownItem[]>, Error>;
    subcategories: import("@tanstack/react-query").UseQueryResult<NoInfer<DropdownItem[]>, Error>;
    collections: import("@tanstack/react-query").UseQueryResult<NoInfer<DropdownItem[]>, Error>;
    brands: import("@tanstack/react-query").UseQueryResult<NoInfer<DropdownItem[]>, Error>;
    labels: import("@tanstack/react-query").UseQueryResult<NoInfer<DropdownItem[]>, Error>;
    sizeGuides: import("@tanstack/react-query").UseQueryResult<NoInfer<DropdownItem[]>, Error>;
};
export declare function useProduct(id: string | undefined): import("@tanstack/react-query").UseQueryResult<NoInfer<Record<string, unknown> | null>, Error>;
export declare function buildDefaultForm(): ProductFormData;
export declare function productToForm(p: Record<string, unknown>): ProductFormData;
export declare function productToVariants(p: Record<string, unknown>): Variant[];
export declare function productToImages(p: Record<string, unknown>): ProductImage[];
export declare function productToSelectedLabels(p: Record<string, unknown>): string[];
