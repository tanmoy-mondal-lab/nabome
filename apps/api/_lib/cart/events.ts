/**
 * Cart Event System
 *
 * Handles event emission for cart operations:
 * - Item added/removed/updated
 * - Cart merged/synced
 * - Checkout started
 * - Cart validation events
 *
 * These events are used for:
 * - Analytics tracking
 * - Real-time UI updates via WebSocket
 * - Audit logging
 * - Integration with external systems
 *
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §8
 */

import type { CartEvent, CartEventType } from './types';

export type CartEventListener = (event: CartEvent) => void;

export class CartEventEmitter {
  private static listeners: Map<CartEventType, Set<CartEventListener>> =
    new Map();

  /**
   * Register event listener
   */
  static on(eventType: CartEventType, listener: CartEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  /**
   * Remove event listener
   */
  static off(eventType: CartEventType, listener: CartEventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit event
   */
  static emit(event: CartEvent): void {
    const listeners = this.listeners.get(event.eventType);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }

  /**
   * Emit item added event
   */
  static emitItemAdded(
    userId: string | null,
    guestId: string | null,
    itemId: string,
    variantId: string,
    quantity: number,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'item_added',
      userId,
      guestId,
      itemId,
      variantId,
      quantity,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit item removed event
   */
  static emitItemRemoved(
    userId: string | null,
    guestId: string | null,
    itemId: string,
    variantId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'item_removed',
      userId,
      guestId,
      itemId,
      variantId,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit quantity updated event
   */
  static emitQuantityUpdated(
    userId: string | null,
    guestId: string | null,
    itemId: string,
    variantId: string,
    quantity: number,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'quantity_updated',
      userId,
      guestId,
      itemId,
      variantId,
      quantity,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit variant changed event
   */
  static emitVariantChanged(
    userId: string | null,
    guestId: string | null,
    itemId: string,
    variantId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'variant_changed',
      userId,
      guestId,
      itemId,
      variantId,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit cart merged event
   */
  static emitCartMerged(
    userId: string,
    guestId: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'cart_merged',
      userId,
      guestId,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit cart synced event
   */
  static emitCartSynced(
    userId: string | null,
    guestId: string | null,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'cart_synced',
      userId,
      guestId,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit cart cleared event
   */
  static emitCartCleared(
    userId: string | null,
    guestId: string | null,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'cart_cleared',
      userId,
      guestId,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit cart validated event
   */
  static emitCartValidated(
    userId: string | null,
    guestId: string | null,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'cart_validated',
      userId,
      guestId,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emit checkout started event
   */
  static emitCheckoutStarted(
    userId: string | null,
    guestId: string | null,
    metadata?: Record<string, unknown>,
  ): void {
    this.emit({
      eventType: 'checkout_started',
      userId,
      guestId,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Clear all listeners
   */
  static clearAllListeners(): void {
    this.listeners.clear();
  }
}

/**
 * Cart Event Service
 *
 * High-level service for emitting cart events with proper context
 */
export class CartEventService {
  /**
   * Track cart event for analytics
   */
  static trackEvent(event: CartEvent): void {
    // Emit the event
    CartEventEmitter.emit(event);

    // TODO: Send to analytics service
    // TODO: Log to audit system
    // TODO: Send to WebSocket for real-time updates
  }
}
