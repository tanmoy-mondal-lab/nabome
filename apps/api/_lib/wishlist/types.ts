import { z } from 'zod';

export enum WishlistEventType {
  ITEM_ADDED = 'wishlist.item_added',
  ITEM_REMOVED = 'wishlist.item_removed',
  ITEM_MOVED_TO_CART = 'wishlist.item_moved_to_cart',
  WISHLIST_CREATED = 'wishlist.created',
  WISHLIST_DELETED = 'wishlist.deleted',
  WISHLIST_SHARED = 'wishlist.shared',
  WISHLIST_MERGED = 'wishlist.merged',
  PRICE_DROP = 'wishlist.price_drop',
  BACK_IN_STOCK = 'wishlist.back_in_stock',
}

export enum WishlistSortOrder {
  ADDED_DESC = 'added_desc',
  ADDED_ASC = 'added_asc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  variantId: string | null;
  priceSnapshot: number | null;
  addedAt: Date;
  isActive: boolean;
  product?: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    compareAtPrice: number | null;
    isActive: boolean;
    status: string;
    primaryImage?: string;
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    availableStock: number;
    inventoryStatus: string;
    attributes: Record<string, unknown> | null;
  };
  priceDrop?: {
    previousPrice: number;
    currentPrice: number;
    dropPercentage: number;
  };
  stockStatus?: {
    inStock: boolean;
    lowStock: boolean;
    outOfStock: boolean;
    backInStock: boolean;
  };
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isShared: boolean;
  shareToken: string | null;
  shareExpiresAt: Date | null;
  itemCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: WishlistItem[];
}

export interface WishlistWithItems extends Wishlist {
  items: WishlistItem[];
}

export interface GuestWishlistItem {
  productId: string;
  variantId: string | null;
  addedAt: string;
}

export interface GuestWishlist {
  items: GuestWishlistItem[];
  expiresAt: string;
}

export interface WishlistAnalytics {
  totalItems: number;
  totalValue: number;
  recentlyAdded: number;
  priceDrops: number;
  backInStock: number;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  conversionRate: number;
  averageTimeToCart: number;
}

export interface WishlistEvent {
  id: string;
  type: WishlistEventType;
  userId: string;
  wishlistId: string;
  itemId?: string;
  productId?: string;
  variantId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface MergeResult {
  mergedItems: number;
  skippedItems: number;
  conflicts: Array<{
    productId: string;
    variantId: string | null;
    reason: string;
  }>;
  finalWishlist: WishlistWithItems;
}

export interface SyncResult {
  added: number;
  removed: number;
  updated: number;
  conflicts: number;
  lastSyncAt: Date;
}

export interface ShareLink {
  url: string;
  token: string;
  expiresAt: Date | null;
  accessCount: number;
  maxAccesses: number | null;
}

export interface WishlistStats {
  totalWishlists: number;
  totalItems: number;
  activeItems: number;
  sharedWishlists: number;
  averageItemsPerWishlist: number;
}

export const createWishlistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isShared: z.boolean().optional(),
});

export const updateWishlistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isShared: z.boolean().optional(),
});

export const addItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  wishlistId: z.string().uuid().optional(),
});

export const removeItemSchema = z.object({
  itemId: z.string().uuid(),
  wishlistId: z.string().uuid().optional(),
});

export const moveItemToCartSchema = z.object({
  itemId: z.string().uuid(),
  wishlistId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(10).default(1),
});

export const bulkMoveToCartSchema = z.object({
  wishlistId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()),
});

export const bulkRemoveSchema = z.object({
  wishlistId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()),
});

export const shareWishlistSchema = z.object({
  wishlistId: z.string().uuid(),
  expiresInDays: z.number().int().min(1).max(30).optional(),
  maxAccesses: z.number().int().min(1).max(1000).optional(),
});

export const mergeWishlistSchema = z.object({
  guestWishlist: z.array(
    z.object({
      productId: z.string().uuid(),
      variantId: z.string().uuid().nullable(),
      addedAt: z.string(),
    }),
  ),
});

export const getWishlistQuerySchema = z.object({
  wishlistId: z.string().uuid().optional(),
  includeInactive: z.boolean().default(false),
  includePriceDrops: z.boolean().default(false),
  includeStockStatus: z.boolean().default(false),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(24),
  sort: z.nativeEnum(WishlistSortOrder).default(WishlistSortOrder.ADDED_DESC),
});

export const getSharedWishlistSchema = z.object({
  shareToken: z.string().min(1).max(64),
});
