/**
 * Nabome Payment Engine
 *
 * Gateway abstraction, lifecycle state machines, exact money math, and
 * webhook security. Pure TypeScript — no framework, no I/O.
 *
 * Source: PAYMENT_ENGINE_ARCHITECTURE.md (binding), MASTER_ARCHITECTURE_BLUEPRINT.md B.3.
 */

// Enums
export * from './enums';

// Money
export * from './money';

// State machines & derivation
export * from './state-machine';

// Webhook security
export * from './webhook';

// Transaction Engine
export * from './transaction';

// Settlement Engine
export * from './settlement';

// Financial Ledger
export * from './ledger';

// Payment Repository
export * from './repository';

// Payment Service
export {
  PaymentService,
  createPaymentService,
  type PaymentServiceConfig,
  type CreatePaymentRequest,
  type CreatePaymentResult,
  type ProcessRefundRequest,
  type ProcessRefundResult,
  type CreateSettlementRequest,
} from './service';

// Webhook Engine
export * from './webhook-engine';

// Payment Events
export * from './events';

// Order Integration
export * from './order-integration';

// Checkout Integration
export * from './checkout-integration';

// Shipping Integration
export * from './shipping-integration';

// Notifications
export * from './notifications';

// Analytics
export * from './analytics';

// Gateway abstraction
export * from './gateway/types';
export * from './gateway/registry';
export {
  RazorpayGateway,
  hmacHex,
  timingSafeEqualHex,
  type RazorpayCredentials,
} from './gateway/razorpay';
export { MockGateway, type MockGatewayConfig } from './gateway/mock';
export { StripeGateway, type StripeCredentials } from './gateway/stripe';
export {
  SSLCommerzGateway,
  type SSLCommerzCredentials,
} from './gateway/sslcommerz';
export { BkashGateway, type BkashCredentials } from './gateway/bkash';
export { NagadGateway, type NagadCredentials } from './gateway/nagad';
export { PayPalGateway, type PayPalCredentials } from './gateway/paypal';
