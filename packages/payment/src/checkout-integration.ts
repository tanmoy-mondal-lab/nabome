/**
 * Checkout Integration - Accept validated checkout payment requests
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §12 (Checkout Integration),
 * CHECKOUT_ENGINE_ARCHITECTURE.md (if exists)
 *
 * This module provides the integration layer between Payment and Checkout systems:
 * - Validate checkout payment requests
 * - Create payment for validated checkout
 * - Handle checkout payment completion
 * - Support multiple payment methods
 * - Handle checkout payment failures
 */

import { PaymentProvider } from './enums';
import type { PaymentEventEmitter } from './events';
import type { PaymentService } from './service';

/**
 * Checkout payment method
 */
export enum CheckoutPaymentMethod {
  RAZORPAY = 'razorpay',
  STRIPE = 'stripe',
  COD = 'cod',
  UPI = 'upi',
  CARD = 'card',
  NETBANKING = 'netbanking',
  WALLET = 'wallet',
}

/**
 * Checkout payment request
 */
export interface CheckoutPaymentRequest {
  checkoutId: string;
  orderId: string;
  amount: number;
  currency: string;
  method: CheckoutPaymentMethod;
  provider: PaymentProvider;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Checkout payment result
 */
export interface CheckoutPaymentResult {
  success: boolean;
  paymentId?: string;
  gatewayOrderId?: string;
  clientPayload?: Record<string, unknown>;
  redirectUrl?: string;
  error?: string;
}

/**
 * Checkout validation result
 */
export interface CheckoutValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Checkout integration configuration
 */
export interface CheckoutIntegrationConfig {
  paymentService: PaymentService;
  eventEmitter: PaymentEventEmitter;
  allowedMethods?: CheckoutPaymentMethod[];
  allowedProviders?: PaymentProvider[];
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Checkout Integration class
 */
export class CheckoutIntegration {
  constructor(private config: CheckoutIntegrationConfig) {}

  /**
   * Validate checkout payment request
   */
  validateCheckoutPayment(
    request: CheckoutPaymentRequest,
  ): CheckoutValidationResult {
    // Validate amount
    if (request.amount <= 0) {
      return { valid: false, error: 'Amount must be greater than zero' };
    }

    if (this.config.minAmount && request.amount < this.config.minAmount) {
      return {
        valid: false,
        error: `Amount must be at least ${this.config.minAmount}`,
      };
    }

    if (this.config.maxAmount && request.amount > this.config.maxAmount) {
      return {
        valid: false,
        error: `Amount must not exceed ${this.config.maxAmount}`,
      };
    }

    // Validate payment method
    if (
      this.config.allowedMethods &&
      !this.config.allowedMethods.includes(request.method)
    ) {
      return {
        valid: false,
        error: `Payment method ${request.method} is not allowed`,
      };
    }

    // Validate provider
    if (
      this.config.allowedProviders &&
      !this.config.allowedProviders.includes(request.provider)
    ) {
      return {
        valid: false,
        error: `Payment provider ${request.provider} is not allowed`,
      };
    }

    // Validate currency
    if (
      request.currency !== 'INR' &&
      request.currency !== 'USD' &&
      request.currency !== 'BDT'
    ) {
      return { valid: false, error: 'Currency must be INR, USD, or BDT' };
    }

    return { valid: true };
  }

  /**
   * Process checkout payment request
   */
  async processCheckoutPayment(
    request: CheckoutPaymentRequest,
  ): Promise<CheckoutPaymentResult> {
    // Validate request
    const validation = this.validateCheckoutPayment(request);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    try {
      // Create payment through payment service
      const result = await this.config.paymentService.createPayment({
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
        method: request.method,
        provider: request.provider,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        metadata: {
          checkoutId: request.checkoutId,
          returnUrl: request.returnUrl,
          ...request.metadata,
        },
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      // Emit payment initiated event
      await this.config.eventEmitter.emitPaymentInitiated({
        orderId: request.orderId,
        paymentId: result.paymentId,
        checkoutId: request.checkoutId,
        amount: request.amount,
        currency: request.currency,
        method: request.method,
        provider: request.provider,
      });

      return {
        success: true,
        paymentId: result.paymentId,
        gatewayOrderId: result.gatewayOrderId,
        clientPayload: result.clientPayload,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Checkout payment processing failed';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Handle checkout payment completion
   */
  async handleCheckoutPaymentCompletion(
    checkoutId: string,
    paymentId: string,
    gatewayOrderId: string,
    gatewayPaymentId: string,
    signature: string,
  ): Promise<{ success: boolean; verified: boolean; error?: string }> {
    try {
      // Verify payment through payment service
      const result = await this.config.paymentService.verifyPayment({
        paymentId,
        gatewayOrderId,
        gatewayPaymentId,
        signature,
      });

      if (!result.success) {
        // Emit payment failed event
        await this.config.eventEmitter.emitPaymentFailed({
          checkoutId,
          paymentId,
          failureReason: result.error,
        });

        return {
          success: false,
          verified: false,
          error: result.error,
        };
      }

      if (result.verified) {
        // Emit payment captured event
        await this.config.eventEmitter.emitPaymentCaptured({
          checkoutId,
          paymentId,
        });
      }

      return {
        success: true,
        verified: result.verified,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Checkout payment completion failed';

      return {
        success: false,
        verified: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Handle checkout payment failure
   */
  async handleCheckoutPaymentFailure(
    checkoutId: string,
    paymentId: string,
    reason: string,
  ): Promise<void> {
    // Emit payment failed event
    await this.config.eventEmitter.emitPaymentFailed({
      checkoutId,
      paymentId,
      failureReason: reason,
    });
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): CheckoutPaymentMethod[] {
    return this.config.allowedMethods || Object.values(CheckoutPaymentMethod);
  }

  /**
   * Get supported providers
   */
  getSupportedProviders(): PaymentProvider[] {
    return this.config.allowedProviders || Object.values(PaymentProvider);
  }

  /**
   * Check if payment method is supported
   */
  isPaymentMethodSupported(method: CheckoutPaymentMethod): boolean {
    if (!this.config.allowedMethods) return true;
    return this.config.allowedMethods.includes(method);
  }

  /**
   * Check if provider is supported
   */
  isProviderSupported(provider: PaymentProvider): boolean {
    if (!this.config.allowedProviders) return true;
    return this.config.allowedProviders.includes(provider);
  }
}

/**
 * Checkout integration factory
 */
export function createCheckoutIntegration(
  config: CheckoutIntegrationConfig,
): CheckoutIntegration {
  return new CheckoutIntegration(config);
}
