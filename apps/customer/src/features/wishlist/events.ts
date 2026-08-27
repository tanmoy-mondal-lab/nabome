import { WishlistEventType } from './types';

export interface WishlistEvent {
  type: WishlistEventType;
  userId?: string;
  wishlistId?: string;
  itemId?: string;
  productId: string;
  variantId?: string | null;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

class WishlistEventTracker {
  private queue: WishlistEvent[] = [];
  private isProcessing = false;
  private maxQueueSize = 100;
  private flushInterval = 5000; // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startFlushTimer();
    // Flush on page visibility change
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flush();
        }
      });
    }
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushSync();
      });
    }
  }

  track(event: Omit<WishlistEvent, 'timestamp'>): void {
    const fullEvent: WishlistEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.queue.push(fullEvent);

    // Limit queue size
    if (this.queue.length > this.maxQueueSize) {
      this.queue.shift();
    }

    // Flush immediately for critical events
    if (this.isCriticalEvent(event.type)) {
      this.flush();
    }
  }

  private isCriticalEvent(type: WishlistEventType): boolean {
    return type === 'wishlist.item_moved_to_cart';
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      await this.sendEvents(eventsToSend);
    } catch (error) {
      console.error('Failed to send wishlist events:', error);
      // Re-queue failed events
      this.queue.unshift(...eventsToSend);
      // Limit queue size after re-queue
      if (this.queue.length > this.maxQueueSize) {
        this.queue = this.queue.slice(0, this.maxQueueSize);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private flushSync(): void {
    if (this.queue.length === 0) return;

    // Use sendBeacon for synchronous send during page unload
    const data = JSON.stringify(this.queue);
    const blob = new Blob([data], { type: 'application/json' });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/events', blob);
    }

    this.queue = [];
  }

  private async sendEvents(events: WishlistEvent[]): Promise<void> {
    // TODO: Integrate with actual analytics endpoint
    // For now, log to console for development
    console.log('Wishlist Events:', events);

    // Future implementation:
    // await fetch('/api/analytics/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ events }),
    // });
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  clearQueue(): void {
    this.queue = [];
  }
}

// Singleton instance
export const wishlistEventTracker = new WishlistEventTracker();

// Convenience functions for common events
export function trackItemAdded(
  productId: string,
  variantId: string | null,
  metadata?: Record<string, unknown>,
): void {
  wishlistEventTracker.track({
    type: WishlistEventType.ITEM_ADDED,
    productId,
    variantId,
    metadata,
  });
}

export function trackItemRemoved(
  productId: string,
  variantId: string | null,
  metadata?: Record<string, unknown>,
): void {
  wishlistEventTracker.track({
    type: WishlistEventType.ITEM_REMOVED,
    productId,
    variantId,
    metadata,
  });
}

export function trackItemMovedToCart(
  productId: string,
  variantId: string | null,
  metadata?: Record<string, unknown>,
): void {
  wishlistEventTracker.track({
    type: WishlistEventType.ITEM_MOVED_TO_CART,
    productId,
    variantId,
    metadata,
  });
}

export function trackWishlistViewed(
  wishlistId: string,
  itemCount: number,
  metadata?: Record<string, unknown>,
): void {
  wishlistEventTracker.track({
    type: WishlistEventType.WISHLIST_VIEWED,
    wishlistId,
    productId: '', // Required field, not applicable for this event
    metadata: {
      ...metadata,
      itemCount,
    },
  });
}

export function trackPriceDrop(
  productId: string,
  variantId: string | null,
  previousPrice: number,
  currentPrice: number,
  metadata?: Record<string, unknown>,
): void {
  wishlistEventTracker.track({
    type: WishlistEventType.PRICE_DROP,
    productId,
    variantId,
    metadata: {
      ...metadata,
      previousPrice,
      currentPrice,
      dropPercentage: ((previousPrice - currentPrice) / previousPrice) * 100,
    },
  });
}

export function trackBackInStock(
  productId: string,
  variantId: string | null,
  metadata?: Record<string, unknown>,
): void {
  wishlistEventTracker.track({
    type: WishlistEventType.BACK_IN_STOCK,
    productId,
    variantId,
    metadata,
  });
}
