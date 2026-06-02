export type ProductSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL" | "Custom" | "One Size";

export interface VariantImage {
  id: string;
  url: string;
  color?: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: ProductSize;
  color: string;
  colorSwatch: string;
  price: number;
  originalPrice: number;
  stock: number;
  reservedStock: number;
  images: VariantImage[];
  isActive: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  width: number;
  height: number;
}

export interface ProductReviewImage {
  id: string;
  url: string;
}

export interface ProductReviewReaction {
  likes: number;
  dislikes: number;
  currentUserLiked: boolean;
  currentUserDisliked: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  title: string;
  comment: string;
  images: ProductReviewImage[];
  createdAt: string;
  updatedAt: string;
  status: "visible" | "hidden" | "reported";
  reactions: ProductReviewReaction;
  vendorReply: string | null;
  vendorRepliedAt: string | null;
}

export interface RatingDistribution {
  stars: number;
  count: number;
  percentage: number;
}

export interface ProductBadge {
  type: "new_arrival" | "trending" | "best_seller" | "limited_stock" | "out_of_stock" | "featured" | "discount";
  label: string;
  color: string;
  bg: string;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  variantId: string | null;
  type: "low_stock" | "out_of_stock" | "variant_oos" | "threshold";
  message: string;
  createdAt: string;
  read: boolean;
}

export interface InventoryHistoryEntry {
  id: string;
  variantId: string;
  type: "restock" | "sale" | "adjustment" | "return" | "reservation";
  quantity: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdAt: string;
}

export type Gender = "Male" | "Female" | "Unisex";
export type Season = "Summer" | "Winter" | "Spring" | "Autumn" | "All Season";
export type Collection = "Signature" | "Heritage" | "Urban" | "Limited" | "Essential" | "Festive";
export type ProductStatus = "draft" | "pending_approval" | "published" | "rejected" | "soft_deleted";

export interface AdvancedProduct {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorShop: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subcategory: string;
  brand: string;
  sku: string;
  material: string;
  weight: number;
  tags: string[];
  gender: Gender;
  season: Season;
  collection: Collection;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;

  images: ProductImage[];
  variants: ProductVariant[];

  defaultPrice: number;
  defaultOriginalPrice: number;
  defaultStock: number;

  rating: number;
  reviewCount: number;
  ratingDistribution: RatingDistribution[];

  isNew: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isLimited: boolean;

  lowStockThreshold: number;
  soldCount: number;

  shippingInfo: string;
  returnPolicy: string;
  careInstructions: string;

  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
}

export interface ProductFilterState {
  category: string[];
  subcategory: string[];
  priceRange: [number, number];
  brands: string[];
  vendors: string[];
  rating: number | null;
  sizes: ProductSize[];
  colors: string[];
  gender: Gender[];
  material: string[];
  availability: "all" | "in_stock" | "out_of_stock";
  discount: number | null;
  sort: ProductSortOption;
  search: string;
}

export type ProductSortOption =
  | "newest"
  | "oldest"
  | "price_low_high"
  | "price_high_low"
  | "popular"
  | "best_selling"
  | "highest_rated"
  | "most_reviewed";

export interface CompareProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  brand: string;
  material: string;
  sizes: ProductSize[];
  colors: string[];
  vendor: string;
  category: string;
  availability: boolean;
}

export interface SearchSuggestion {
  type: "product" | "category" | "vendor" | "trending" | "recent";
  label: string;
  value: string;
  image?: string;
}
