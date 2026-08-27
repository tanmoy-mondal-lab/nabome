/**
 * Gateway factory for the API layer — builds adapter credentials from Env.
 *
 * Binding: PAYMENT §3 gateway independence. Handlers never import provider
 * SDKs; they ask this helper for a PaymentGateway and call the contract.
 */

import {
  getGateway,
  type GatewayCredentials,
  type PaymentGateway,
} from '@nabome/payment';

import type { Env } from '../env';

import { getPaymentProvider } from './config';

export { getGateway };
export type { GatewayCredentials, PaymentGateway };

export function buildGatewayCredentials(env: Env): GatewayCredentials {
  return {
    razorpay:
      env.RAZORPAY_KEY_ID &&
      env.RAZORPAY_KEY_SECRET &&
      env.RAZORPAY_WEBHOOK_SECRET
        ? {
            keyId: env.RAZORPAY_KEY_ID,
            keySecret: env.RAZORPAY_KEY_SECRET,
            webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
          }
        : undefined,
    mock: {
      webhookSecret: env.RAZORPAY_WEBHOOK_SECRET || 'mock-webhook-secret',
    },
  };
}

/** Resolve the active gateway for the environment (throws PROVIDER_NOT_CONFIGURED). */
export function resolveGateway(env: Env): PaymentGateway {
  return getGateway(getPaymentProvider(env), buildGatewayCredentials(env));
}
