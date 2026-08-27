import type { WishlistItem } from './types';

export interface StockStatus {
  inStock: boolean;
  lowStock: boolean;
  outOfStock: boolean;
  backInStock: boolean;
  availableStock: number;
  inventoryStatus: string;
}

export interface PriceChange {
  previousPrice: number | null;
  currentPrice: number;
  dropPercentage: number | null;
  hasDropped: boolean;
}

export interface AvailabilityInfo {
  stockStatus: StockStatus;
  priceChange: PriceChange;
  lastChecked: Date;
}

/**
 * Calculate stock status based on inventory data
 */
export function calculateStockStatus(
  availableStock: number,
  inventoryStatus: string,
  previousStock?: number,
): StockStatus {
  const inStock = availableStock > 0;
  const outOfStock = availableStock === 0 || inventoryStatus === 'out_of_stock';
  const lowStock = inStock && availableStock <= 5;
  const backInStock =
    previousStock !== undefined && previousStock === 0 && availableStock > 0;

  return {
    inStock,
    lowStock,
    outOfStock,
    backInStock,
    availableStock,
    inventoryStatus,
  };
}

/**
 * Calculate price change based on current and previous price
 */
export function calculatePriceChange(
  currentPrice: number,
  previousPrice: number | null,
): PriceChange {
  if (!previousPrice) {
    return {
      previousPrice: null,
      currentPrice,
      dropPercentage: null,
      hasDropped: false,
    };
  }

  const dropPercentage =
    previousPrice > currentPrice
      ? ((previousPrice - currentPrice) / previousPrice) * 100
      : 0;

  return {
    previousPrice,
    currentPrice,
    dropPercentage,
    hasDropped: previousPrice > currentPrice,
  };
}

/**
 * Check if a wishlist item has availability changes
 */
export function checkAvailabilityChanges(
  item: WishlistItem,
  currentStock: number,
  currentInventoryStatus: string,
  currentPrice: number,
): AvailabilityInfo {
  const stockStatus = calculateStockStatus(
    currentStock,
    currentInventoryStatus,
    // We'd need to track previous stock, for now using current
  );

  const priceChange = calculatePriceChange(currentPrice, item.priceSnapshot);

  return {
    stockStatus,
    priceChange,
    lastChecked: new Date(),
  };
}

/**
 * Get availability badge configuration
 */
export function getAvailabilityBadge(stockStatus: StockStatus) {
  if (stockStatus.outOfStock) {
    return {
      label: 'Out of Stock',
      variant: 'error' as const,
      show: true,
    };
  }

  if (stockStatus.lowStock) {
    return {
      label: `Low Stock (${stockStatus.availableStock} left)`,
      variant: 'warning' as const,
      show: true,
    };
  }

  if (stockStatus.backInStock) {
    return {
      label: 'Back in Stock!',
      variant: 'success' as const,
      show: true,
    };
  }

  return {
    label: 'In Stock',
    variant: 'success' as const,
    show: false, // Don't show badge for normal in-stock
  };
}

/**
 * Get price drop badge configuration
 */
export function getPriceDropBadge(priceChange: PriceChange) {
  if (!priceChange.hasDropped || !priceChange.dropPercentage) {
    return null;
  }

  const percentage = Math.round(priceChange.dropPercentage);

  return {
    label: `${percentage}% OFF`,
    show: percentage >= 5, // Only show if drop is 5% or more
  };
}

/**
 * Check if item should trigger a notification
 */
export function shouldNotifyAvailability(availabilityInfo: AvailabilityInfo): {
  notify: boolean;
  reason?: string;
} {
  const { stockStatus, priceChange } = availabilityInfo;

  // Notify on back in stock
  if (stockStatus.backInStock) {
    return {
      notify: true,
      reason: 'back_in_stock',
    };
  }

  // Notify on significant price drop (10% or more)
  if (
    priceChange.hasDropped &&
    priceChange.dropPercentage &&
    priceChange.dropPercentage >= 10
  ) {
    return {
      notify: true,
      reason: 'price_drop',
    };
  }

  // Notify on low stock (optional, based on user preferences)
  if (stockStatus.lowStock) {
    return {
      notify: false, // Disabled by default
      reason: 'low_stock',
    };
  }

  return {
    notify: false,
  };
}

/**
 * Update wishlist item with availability info
 */
export function updateItemAvailability(
  item: WishlistItem,
  availabilityInfo: AvailabilityInfo,
): WishlistItem {
  return {
    ...item,
    stockStatus: availabilityInfo.stockStatus,
    priceDrop: availabilityInfo.priceChange.hasDropped
      ? {
          previousPrice: availabilityInfo.priceChange.previousPrice!,
          currentPrice: availabilityInfo.priceChange.currentPrice,
          dropPercentage: availabilityInfo.priceChange.dropPercentage!,
        }
      : undefined,
  };
}

/**
 * Batch check availability for multiple items
 */
export async function batchCheckAvailability(
  items: WishlistItem[],
  fetchAvailability: (
    productId: string,
    variantId: string | null,
  ) => Promise<{
    stock: number;
    inventoryStatus: string;
    price: number;
  }>,
): Promise<WishlistItem[]> {
  const updatedItems = await Promise.all(
    items.map(async (item) => {
      try {
        const availability = await fetchAvailability(
          item.productId,
          item.variantId,
        );
        const availabilityInfo = checkAvailabilityChanges(
          item,
          availability.stock,
          availability.inventoryStatus,
          availability.price,
        );

        // Track events if there are changes
        if (availabilityInfo.stockStatus.backInStock) {
          // TODO: Import and use trackBackInStock
          console.log('Back in stock:', item.productId);
        }

        if (availabilityInfo.priceChange.hasDropped) {
          // TODO: Import and use trackPriceDrop
          console.log(
            'Price drop:',
            item.productId,
            availabilityInfo.priceChange.dropPercentage,
          );
        }

        return updateItemAvailability(item, availabilityInfo);
      } catch (error) {
        console.error('Failed to check availability for item:', item.id, error);
        return item;
      }
    }),
  );

  return updatedItems;
}

/**
 * Get availability summary for a wishlist
 */
export function getAvailabilitySummary(items: WishlistItem[]): {
  total: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  priceDrops: number;
  backInStock: number;
} {
  const summary = {
    total: items.length,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    priceDrops: 0,
    backInStock: 0,
  };

  for (const item of items) {
    if (item.stockStatus) {
      if (item.stockStatus.inStock) summary.inStock++;
      if (item.stockStatus.outOfStock) summary.outOfStock++;
      if (item.stockStatus.lowStock) summary.lowStock++;
      if (item.stockStatus.backInStock) summary.backInStock++;
    }

    if (item.priceDrop) {
      summary.priceDrops++;
    }
  }

  return summary;
}
