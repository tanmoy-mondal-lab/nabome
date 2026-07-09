export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    parentId?: string;
    sortOrder: number;
    isActive: boolean;
    _count?: {
        products: number;
    };
}
export declare function useCategories(): import("@tanstack/react-query").UseQueryResult<NoInfer<Category[]>, Error>;
