/**
 * Catalog Hooks Index
 * Exports all catalog-related React hooks
 */

export {
  useProduct,
  useProductBySlug,
  useProducts,
  useFeaturedProducts,
  useNewArrivals,
  useTrendingProducts,
  usePrefetchProduct,
  useInvalidateProducts,
  type ProductListParams,
  type ProductListResponse,
} from './use-products';

export {
  useCategory,
  useCategoryBySlug,
  useCategories,
  useCategoryTree,
  useRootCategories,
  usePrefetchCategory,
  useInvalidateCategories,
  type CategoryListParams,
  type CategoryListResponse,
} from './use-categories';

export {
  useCollection,
  useCollectionBySlug,
  useCollections,
  useFeaturedCollections,
  useActiveCollections,
  usePrefetchCollection,
  useInvalidateCollections,
  type CollectionListParams,
  type CollectionListResponse,
} from './use-collections';
