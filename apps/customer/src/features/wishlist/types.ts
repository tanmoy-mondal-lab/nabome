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
  WISHLIST_VIEWED = 'wishlist.viewed',
}

export interface WishlistItem {
  id: string;
  productId: string;
  variantId: string | null;
  addedAt: string;
  priceSnapshot: number | null;
  product: {
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
    availableStock: number;
    inventoryStatus: string;
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
  shareExpiresAt: string | null;
  itemCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export enum WishlistSortOrder {
  ADDED_DESC = 'added_desc',
  ADDED_ASC = 'added_asc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

export interface WishlistState {
  items: WishlistItem[];
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;
  isGuest: boolean;
  guestItems: GuestWishlistItem[];
}

export interface WishlistActions {
  addItem: (productId: string, variantId?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  moveItemToCart: (itemId: string, quantity?: number) => Promise<void>;
  bulkMoveToCart: (itemIds: string[]) => Promise<void>;
  bulkRemove: (itemIds: string[]) => Promise<void>;
  createWishlist: (name: string, description?: string) => Promise<void>;
  updateWishlist: (
    wishlistId: string,
    data: { name?: string; description?: string },
  ) => Promise<void>;
  deleteWishlist: (wishlistId: string) => Promise<void>;
  shareWishlist: (
    wishlistId: string,
    expiresInDays?: number,
  ) => Promise<{ url: string; token: string }>;
  loadWishlist: (wishlistId?: string) => Promise<void>;
  loadSharedWishlist: (shareToken: string) => Promise<Wishlist>;
  refresh: () => Promise<void>;
  clearError: () => void;
}
