/**
 * Checkout Event System
 *
 * Event emission and tracking for checkout lifecycle.
 * Following SHOPPING_CART_WISHLIST_CHECKOUT_ARCHITECTURE.md §4
 *
 * This system handles:
 * - Checkout Started
 * - Checkout Updated
 * - Coupon Applied
 * - Coupon Removed
 * - Checkout Validated
 * - Checkout Completed
 * - Checkout Abandoned
 * - Address Added
 * - Address Updated
 * - Address Deleted
 */

export type CheckoutEventType =
  | 'checkout_started'
  | 'checkout_updated'
  | 'checkout_validated'
  | 'checkout_locked'
  | 'checkout_completed'
  | 'checkout_abandoned'
  | 'checkout_expired'
  | 'coupon_applied'
  | 'coupon_removed'
  | 'address_added'
  | 'address_updated'
  | 'address_deleted'
  | 'address_selected'
  | 'shipping_selected'
  | 'payment_initiated'
  | 'payment_failed';

export interface CheckoutEvent {
  eventType: CheckoutEventType;
  checkoutSessionId: string;
  userId?: string | null;
  guestId?: string | null;
  timestamp: Date;
  data?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export class CheckoutEventEmitter {
  private static eventQueue: CheckoutEvent[] = [];
  private static eventHandlers: Map<
    CheckoutEventType,
    ((event: CheckoutEvent) => void)[]
  > = new Map();

  /**
   * Register event handler
   */
  static on(
    eventType: CheckoutEventType,
    handler: (event: CheckoutEvent) => void,
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)?.push(handler);
  }

  /**
   * Unregister event handler
   */
  static off(
    eventType: CheckoutEventType,
    handler: (event: CheckoutEvent) => void,
  ): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  static emit(event: CheckoutEvent): void {
    // Add to queue
    this.eventQueue.push(event);

    // Call registered handlers
    const handlers = this.eventHandlers.get(event.eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(
            `Error in event handler for ${event.eventType}:`,
            error,
          );
        }
      });
    }

    // Log event for debugging
    console.log(`[Checkout Event] ${event.eventType}`, {
      checkoutSessionId: event.checkoutSessionId,
      userId: event.userId,
      timestamp: event.timestamp,
    });
  }

  /**
   * Get event queue
   */
  static getEventQueue(): CheckoutEvent[] {
    return [...this.eventQueue];
  }

  /**
   * Clear event queue
   */
  static clearEventQueue(): void {
    this.eventQueue = [];
  }

  /**
   * Get events for checkout session
   */
  static getEventsForSession(checkoutSessionId: string): CheckoutEvent[] {
    return this.eventQueue.filter(
      (event) => event.checkoutSessionId === checkoutSessionId,
    );
  }
}

/**
 * Event Factory Methods
 */
export class CheckoutEvents {
  /**
   * Checkout Started Event
   */
  static checkoutStarted(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    cartId: string;
    itemCount: number;
    cartTotal: number;
  }): CheckoutEvent {
    return {
      eventType: 'checkout_started',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        cartId: params.cartId,
        itemCount: params.itemCount,
        cartTotal: params.cartTotal,
      },
    };
  }

  /**
   * Checkout Updated Event
   */
  static checkoutUpdated(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    updatedFields: string[];
  }): CheckoutEvent {
    return {
      eventType: 'checkout_updated',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        updatedFields: params.updatedFields,
      },
    };
  }

  /**
   * Checkout Validated Event
   */
  static checkoutValidated(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
  }): CheckoutEvent {
    return {
      eventType: 'checkout_validated',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        isValid: params.isValid,
        errors: params.errors,
        warnings: params.warnings,
      },
    };
  }

  /**
   * Checkout Locked Event
   */
  static checkoutLocked(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
  }): CheckoutEvent {
    return {
      eventType: 'checkout_locked',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
    };
  }

  /**
   * Checkout Completed Event
   */
  static checkoutCompleted(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    orderId?: string;
    totalAmount: number;
    itemCount: number;
    paymentMethod: string;
  }): CheckoutEvent {
    return {
      eventType: 'checkout_completed',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        orderId: params.orderId,
        totalAmount: params.totalAmount,
        itemCount: params.itemCount,
        paymentMethod: params.paymentMethod,
      },
    };
  }

  /**
   * Checkout Abandoned Event
   */
  static checkoutAbandoned(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    lastStep: string;
    timeSpent: number;
  }): CheckoutEvent {
    return {
      eventType: 'checkout_abandoned',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        lastStep: params.lastStep,
        timeSpent: params.timeSpent,
      },
    };
  }

  /**
   * Checkout Expired Event
   */
  static checkoutExpired(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    lastStep: string;
  }): CheckoutEvent {
    return {
      eventType: 'checkout_expired',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        lastStep: params.lastStep,
      },
    };
  }

  /**
   * Coupon Applied Event
   */
  static couponApplied(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    couponCode: string;
    discountAmount: number;
    discountType: string;
  }): CheckoutEvent {
    return {
      eventType: 'coupon_applied',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        couponCode: params.couponCode,
        discountAmount: params.discountAmount,
        discountType: params.discountType,
      },
    };
  }

  /**
   * Coupon Removed Event
   */
  static couponRemoved(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    couponCode: string;
    previousDiscountAmount: number;
  }): CheckoutEvent {
    return {
      eventType: 'coupon_removed',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        couponCode: params.couponCode,
        previousDiscountAmount: params.previousDiscountAmount,
      },
    };
  }

  /**
   * Address Added Event
   */
  static addressAdded(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    addressId: string;
    addressType: string;
  }): CheckoutEvent {
    return {
      eventType: 'address_added',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        addressId: params.addressId,
        addressType: params.addressType,
      },
    };
  }

  /**
   * Address Updated Event
   */
  static addressUpdated(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    addressId: string;
  }): CheckoutEvent {
    return {
      eventType: 'address_updated',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        addressId: params.addressId,
      },
    };
  }

  /**
   * Address Deleted Event
   */
  static addressDeleted(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    addressId: string;
  }): CheckoutEvent {
    return {
      eventType: 'address_deleted',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        addressId: params.addressId,
      },
    };
  }

  /**
   * Address Selected Event
   */
  static addressSelected(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    addressId: string;
    addressType: 'shipping' | 'billing';
  }): CheckoutEvent {
    return {
      eventType: 'address_selected',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        addressId: params.addressId,
        addressType: params.addressType,
      },
    };
  }

  /**
   * Shipping Selected Event
   */
  static shippingSelected(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    shippingRateId: string;
    shippingMethod: string;
    shippingCost: number;
  }): CheckoutEvent {
    return {
      eventType: 'shipping_selected',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        shippingRateId: params.shippingRateId,
        shippingMethod: params.shippingMethod,
        shippingCost: params.shippingCost,
      },
    };
  }

  /**
   * Payment Initiated Event
   */
  static paymentInitiated(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    paymentMethod: string;
    amount: number;
  }): CheckoutEvent {
    return {
      eventType: 'payment_initiated',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        paymentMethod: params.paymentMethod,
        amount: params.amount,
      },
    };
  }

  /**
   * Payment Failed Event
   */
  static paymentFailed(params: {
    checkoutSessionId: string;
    userId?: string | null;
    guestId?: string | null;
    paymentMethod: string;
    amount: number;
    errorMessage: string;
  }): CheckoutEvent {
    return {
      eventType: 'payment_failed',
      checkoutSessionId: params.checkoutSessionId,
      userId: params.userId,
      guestId: params.guestId,
      timestamp: new Date(),
      data: {
        paymentMethod: params.paymentMethod,
        amount: params.amount,
        errorMessage: params.errorMessage,
      },
    };
  }
}
