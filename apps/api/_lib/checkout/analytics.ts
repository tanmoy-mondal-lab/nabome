/**
 * Checkout Analytics Tracking
 *
 * Analytics integration for checkout lifecycle events.
 * Tracks checkout funnel metrics, conversion rates, and user behavior.
 *
 * This provides:
 * - Checkout funnel tracking
 * - Conversion rate analytics
 * - Abandonment tracking
 * - Coupon performance metrics
 * - Shipping method preferences
 * - Payment method analytics
 * - Error tracking
 */

import { CheckoutEventEmitter, type CheckoutEvent } from './events.ts';

// ── Analytics Event Types ───────────────────────────────────────────────────────

export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  userId?: string | null;
  guestId?: string | null;
  sessionId?: string;
}

// ── Analytics Provider Interface ─────────────────────────────────────────────────

export interface AnalyticsProvider {
  track(event: AnalyticsEvent): Promise<void>;
  trackPageView(
    page: string,
    properties?: Record<string, unknown>,
  ): Promise<void>;
  trackConversion(goal: string, value?: number): Promise<void>;
}

// ── Console Analytics Provider (Development) ───────────────────────────────────────

export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  async track(event: AnalyticsEvent): Promise<void> {
    console.log(`[Analytics] ${event.eventName}`, {
      ...event.properties,
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
    });
  }

  async trackPageView(
    page: string,
    properties?: Record<string, unknown>,
  ): Promise<void> {
    console.log(`[Analytics] Page View: ${page}`, properties);
  }

  async trackConversion(goal: string, value?: number): Promise<void> {
    console.log(`[Analytics] Conversion: ${goal}`, { value });
  }
}

// ── Google Analytics Provider (Production) ────────────────────────────────────────

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  private _measurementId: string;

  constructor(measurementId: string) {
    this._measurementId = measurementId;
  }

  async track(_event: AnalyticsEvent): Promise<void> {
    // TODO: Integrate with Google Analytics 4
    // await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${this._measurementId}`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     client_id: event.userId || event.guestId,
    //     events: [{
    //       name: event.eventName,
    //       params: event.properties,
    //     }],
    //   }),
    // });
  }

  async trackPageView(
    _page: string,
    _properties?: Record<string, unknown>,
  ): Promise<void> {
    // TODO: Integrate with Google Analytics 4
  }

  async trackConversion(_goal: string, _value?: number): Promise<void> {
    // TODO: Integrate with Google Analytics 4
  }
}

// ── Checkout Analytics Service ───────────────────────────────────────────────────

export class CheckoutAnalytics {
  private static provider: AnalyticsProvider = new ConsoleAnalyticsProvider();
  private static checkoutSessions: Map<
    string,
    { startTime: Date; lastStep: string }
  > = new Map();

  /**
   * Set analytics provider
   */
  static setProvider(provider: AnalyticsProvider): void {
    this.provider = provider;
  }

  /**
   * Initialize analytics with checkout event listeners
   */
  static initialize(): void {
    // Register event listeners
    CheckoutEventEmitter.on('checkout_started', this.handleCheckoutStarted);
    CheckoutEventEmitter.on('checkout_updated', this.handleCheckoutUpdated);
    CheckoutEventEmitter.on('checkout_validated', this.handleCheckoutValidated);
    CheckoutEventEmitter.on('checkout_locked', this.handleCheckoutLocked);
    CheckoutEventEmitter.on('checkout_completed', this.handleCheckoutCompleted);
    CheckoutEventEmitter.on('checkout_abandoned', this.handleCheckoutAbandoned);
    CheckoutEventEmitter.on('checkout_expired', this.handleCheckoutExpired);
    CheckoutEventEmitter.on('coupon_applied', this.handleCouponApplied);
    CheckoutEventEmitter.on('coupon_removed', this.handleCouponRemoved);
    CheckoutEventEmitter.on('address_added', this.handleAddressAdded);
    CheckoutEventEmitter.on('address_selected', this.handleAddressSelected);
    CheckoutEventEmitter.on('shipping_selected', this.handleShippingSelected);
    CheckoutEventEmitter.on('payment_initiated', this.handlePaymentInitiated);
    CheckoutEventEmitter.on('payment_failed', this.handlePaymentFailed);
  }

  // ── Event Handlers ─────────────────────────────────────────────────────────────

  private static async handleCheckoutStarted(
    event: CheckoutEvent,
  ): Promise<void> {
    this.checkoutSessions.set(event.checkoutSessionId, {
      startTime: event.timestamp,
      lastStep: 'started',
    });

    await this.provider.track({
      eventName: 'checkout_started',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        cart_id: event.data?.cartId,
        item_count: event.data?.itemCount,
        cart_total: event.data?.cartTotal,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });

    await this.provider.trackPageView('/checkout', {
      checkout_session_id: event.checkoutSessionId,
    });
  }

  private static async handleCheckoutUpdated(
    event: CheckoutEvent,
  ): Promise<void> {
    const session = this.checkoutSessions.get(event.checkoutSessionId);
    if (session) {
      session.lastStep = 'updated';
    }

    await this.provider.track({
      eventName: 'checkout_updated',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        updated_fields: event.data?.updatedFields,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handleCheckoutValidated(
    event: CheckoutEvent,
  ): Promise<void> {
    const session = this.checkoutSessions.get(event.checkoutSessionId);
    if (session) {
      session.lastStep = 'validated';
    }

    await this.provider.track({
      eventName: 'checkout_validated',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        is_valid: event.data?.isValid,
        errors: event.data?.errors,
        warnings: event.data?.warnings,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handleCheckoutLocked(
    event: CheckoutEvent,
  ): Promise<void> {
    const session = this.checkoutSessions.get(event.checkoutSessionId);
    if (session) {
      session.lastStep = 'locked';
    }

    await this.provider.track({
      eventName: 'checkout_locked',
      properties: {
        checkout_session_id: event.checkoutSessionId,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handleCheckoutCompleted(
    event: CheckoutEvent,
  ): Promise<void> {
    const session = this.checkoutSessions.get(event.checkoutSessionId);
    const timeSpent = session
      ? event.timestamp.getTime() - session.startTime.getTime()
      : 0;

    this.checkoutSessions.delete(event.checkoutSessionId);

    await this.provider.track({
      eventName: 'checkout_completed',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        order_id: event.data?.orderId,
        total_amount: event.data?.totalAmount,
        item_count: event.data?.itemCount,
        payment_method: event.data?.paymentMethod,
        time_spent_ms: timeSpent,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });

    await this.provider.trackConversion(
      'checkout_completed',
      event.data?.totalAmount as number,
    );
    await this.provider.trackPageView('/checkout/success', {
      checkout_session_id: event.checkoutSessionId,
      order_id: event.data?.orderId,
    });
  }

  private static async handleCheckoutAbandoned(
    event: CheckoutEvent,
  ): Promise<void> {
    const session = this.checkoutSessions.get(event.checkoutSessionId);
    const timeSpent = session
      ? event.timestamp.getTime() - session.startTime.getTime()
      : 0;

    this.checkoutSessions.delete(event.checkoutSessionId);

    await this.provider.track({
      eventName: 'checkout_abandoned',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        last_step: event.data?.lastStep,
        time_spent_ms: timeSpent,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handleCheckoutExpired(
    event: CheckoutEvent,
  ): Promise<void> {
    const session = this.checkoutSessions.get(event.checkoutSessionId);
    const timeSpent = session
      ? event.timestamp.getTime() - session.startTime.getTime()
      : 0;

    this.checkoutSessions.delete(event.checkoutSessionId);

    await this.provider.track({
      eventName: 'checkout_expired',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        last_step: event.data?.lastStep,
        time_spent_ms: timeSpent,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handleCouponApplied(
    event: CheckoutEvent,
  ): Promise<void> {
    await this.provider.track({
      eventName: 'coupon_applied',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        coupon_code: event.data?.couponCode,
        discount_amount: event.data?.discountAmount,
        discount_type: event.data?.discountType,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handleCouponRemoved(
    event: CheckoutEvent,
  ): Promise<void> {
    await this.provider.track({
      eventName: 'coupon_removed',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        coupon_code: event.data?.couponCode,
        previous_discount_amount: event.data?.previousDiscountAmount,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handleAddressAdded(event: CheckoutEvent): Promise<void> {
    await this.provider.track({
      eventName: 'address_added',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        address_id: event.data?.addressId,
        address_type: event.data?.addressType,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handleAddressSelected(
    event: CheckoutEvent,
  ): Promise<void> {
    await this.provider.track({
      eventName: 'address_selected',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        address_id: event.data?.addressId,
        address_type: event.data?.addressType,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handleShippingSelected(
    event: CheckoutEvent,
  ): Promise<void> {
    await this.provider.track({
      eventName: 'shipping_selected',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        shipping_rate_id: event.data?.shippingRateId,
        shipping_method: event.data?.shippingMethod,
        shipping_cost: event.data?.shippingCost,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handlePaymentInitiated(
    event: CheckoutEvent,
  ): Promise<void> {
    await this.provider.track({
      eventName: 'payment_initiated',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        payment_method: event.data?.paymentMethod,
        amount: event.data?.amount,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  private static async handlePaymentFailed(
    event: CheckoutEvent,
  ): Promise<void> {
    await this.provider.track({
      eventName: 'payment_failed',
      properties: {
        checkout_session_id: event.checkoutSessionId,
        payment_method: event.data?.paymentMethod,
        amount: event.data?.amount,
        error_message: event.data?.errorMessage,
      },
      timestamp: event.timestamp,
      userId: event.userId,
      guestId: event.guestId,
      sessionId: event.checkoutSessionId,
    });
  }

  // ── Custom Analytics Methods ───────────────────────────────────────────────────

  /**
   * Track checkout funnel step
   */
  static async trackFunnelStep(
    checkoutSessionId: string,
    step: 'address' | 'shipping' | 'payment' | 'review',
    userId?: string | null,
    guestId?: string | null,
  ): Promise<void> {
    await this.provider.track({
      eventName: 'checkout_funnel_step',
      properties: {
        checkout_session_id: checkoutSessionId,
        step,
      },
      timestamp: new Date(),
      userId,
      guestId,
      sessionId: checkoutSessionId,
    });
  }

  /**
   * Track validation error
   */
  static async trackValidationError(
    checkoutSessionId: string,
    errorType: string,
    errorMessage: string,
    userId?: string | null,
    guestId?: string | null,
  ): Promise<void> {
    await this.provider.track({
      eventName: 'checkout_validation_error',
      properties: {
        checkout_session_id: checkoutSessionId,
        error_type: errorType,
        error_message: errorMessage,
      },
      timestamp: new Date(),
      userId,
      guestId,
      sessionId: checkoutSessionId,
    });
  }

  /**
   * Get checkout session analytics
   */
  static getSessionAnalytics(checkoutSessionId: string): {
    startTime?: Date;
    lastStep?: string;
    timeSpent?: number;
  } | null {
    const session = this.checkoutSessions.get(checkoutSessionId);
    if (!session) return null;

    return {
      startTime: session.startTime,
      lastStep: session.lastStep,
      timeSpent: Date.now() - session.startTime.getTime(),
    };
  }
}

// Initialize analytics on load
CheckoutAnalytics.initialize();
