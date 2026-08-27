/**
 * Gateway Registry & Factory — provider-neutral selection by name.
 *
 * Binding: PAYMENT §3 (Gateway Architecture), mandatory rule 15.3
 * ("No gateway logic in business modules", "Can we swap gateways without
 * changing this?"). All seven production providers are registered so the
 * abstraction is complete. Unimplemented providers throw PROVIDER_NOT_CONFIGURED
 * (swap-in ready).
 */

import { BkashGateway, type BkashCredentials } from './bkash';
import { MockGateway, type MockGatewayConfig } from './mock';
import { NagadGateway, type NagadCredentials } from './nagad';
import { PayPalGateway, type PayPalCredentials } from './paypal';
import { RazorpayGateway, type RazorpayCredentials } from './razorpay';
import { SSLCommerzGateway, type SSLCommerzCredentials } from './sslcommerz';
import { StripeGateway, type StripeCredentials } from './stripe';
import type { PaymentGateway } from './types';

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(
      `Gateway provider '${provider}' is not configured. Register credentials or implement its adapter.`,
    );
    this.name = 'ProviderNotConfiguredError';
  }
}

/** Credentials bucket handed to the factory by the API layer (from env). */
export interface GatewayCredentials {
  razorpay?: RazorpayCredentials;
  mock?: MockGatewayConfig;
  stripe?: StripeCredentials;
  sslcommerz?: SSLCommerzCredentials;
  bkash?: BkashCredentials;
  nagad?: NagadCredentials;
  paypal?: PayPalCredentials;
}

/** Registered provider names — the full set the platform can support. */
export const REGISTERED_PROVIDERS = [
  'razorpay',
  'stripe',
  'sslcommerz',
  'bkash',
  'nagad',
  'paypal',
  'cod',
  'manual',
  'mock',
] as const;

export type RegisteredProvider = (typeof REGISTERED_PROVIDERS)[number];

function isRegistered(provider: string): provider is RegisteredProvider {
  return (REGISTERED_PROVIDERS as readonly string[]).includes(provider);
}

export function isRegisteredProvider(provider: string): boolean {
  return isRegistered(provider);
}

/**
 * Factory — returns the adapter for a provider or throws
 * ProviderNotConfiguredError. Business modules call this once per request
 * (or cache per env) and never touch provider SDKs directly.
 */
export function getGateway(
  provider: string,
  credentials: GatewayCredentials,
): PaymentGateway {
  if (!isRegistered(provider)) {
    throw new ProviderNotConfiguredError(provider);
  }

  switch (provider) {
    case 'razorpay':
      if (!credentials.razorpay) throw new ProviderNotConfiguredError(provider);
      return new RazorpayGateway(credentials.razorpay);
    case 'mock':
      return new MockGateway(credentials.mock);
    case 'stripe':
      if (!credentials.stripe) throw new ProviderNotConfiguredError(provider);
      return new StripeGateway(credentials.stripe);
    case 'sslcommerz':
      if (!credentials.sslcommerz)
        throw new ProviderNotConfiguredError(provider);
      return new SSLCommerzGateway(credentials.sslcommerz);
    case 'bkash':
      if (!credentials.bkash) throw new ProviderNotConfiguredError(provider);
      return new BkashGateway(credentials.bkash);
    case 'nagad':
      if (!credentials.nagad) throw new ProviderNotConfiguredError(provider);
      return new NagadGateway(credentials.nagad);
    case 'paypal':
      if (!credentials.paypal) throw new ProviderNotConfiguredError(provider);
      return new PayPalGateway(credentials.paypal);
    case 'cod':
    case 'manual':
      throw new ProviderNotConfiguredError(provider);
    default:
      throw new ProviderNotConfiguredError(provider);
  }
}

/**
 * Static adapter instances (test/demo convenience) — same factory semantics,
 * but providers built once from a credentials object.
 */
export function buildGateways(
  credentials: GatewayCredentials,
): Record<RegisteredProvider, PaymentGateway> {
  const gateways: Record<string, PaymentGateway> = {};
  for (const provider of REGISTERED_PROVIDERS) {
    try {
      gateways[provider] = getGateway(provider, credentials);
    } catch {
      // Unimplemented providers stay absent; callers must use getGateway
      // which throws a descriptive error when actually invoked.
    }
  }
  return gateways as Record<RegisteredProvider, PaymentGateway>;
}
