import type { ProductDetailResponse, ProductListResponse, SearchResponse } from "../../types/product";
export declare function useProduct(slug: string | undefined): import("@tanstack/react-query").UseQueryResult<NoInfer<ProductDetailResponse>, Error>;
export declare function useSearch(q: string, page?: number): import("@tanstack/react-query").UseQueryResult<NoInfer<SearchResponse>, Error>;
export declare function useProductListing(params: Record<string, string>): import("@tanstack/react-query").UseQueryResult<NoInfer<ProductListResponse>, Error>;
