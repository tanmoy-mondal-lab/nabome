export interface ProductImage {
  id?: string;
  url: string;
  publicId?: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
  type?: string;
}

export interface ProductVariant {
  id: string;
  productId?: string;
  sku: string;
  size: string;
  color: string;
  colorHex?: string;
  priceAdjustment: number;
  stock: number;
  reservedStock?: number;
  weight?: number;
  videoUrl?: string;
  videoPublicId?: string;
  isActive?: boolean;
  images?: ProductImage[];
}

export interface ProductLabel {
  id?: string;
  name: string;
  slug?: string;
  color?: string;
}

export interface ProductLabelAssignment {
  id?: string;
  label: ProductLabel;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  logoPublicId?: string;
  websiteUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  subcategoryId?: string;
  collectionId?: string;
  brandId?: string;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  salePrice?: number;
  discountPercent?: number;
  currency?: string;
  material?: string;
  careInstructions?: string;
  sizeChartUrl?: string;
  sizeChartPublicId?: string;
  sizeGuideId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  gender?: string;
  sortOrder?: number;
  publishedAt?: string;
  metaTitle?: string;
  metaDesc?: string;
  createdAt?: string;
  updatedAt?: string;

  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  images?: ProductImage[];
  productLabels?: ProductLabelAssignment[];
  relatedProducts?: Product[];
  _count?: {
    reviews?: number;
    orderItems?: number;
  };
  sizeGuide?: {
    measurements?: { size: string; chest?: string; waist?: string; length?: string }[];
  };
  features?: string[];
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductDetailResponse {
  product: Product;
}

export interface SearchResponse {
  products: Product[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}
