import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { getPaymentProvider } from './config.ts';

function read(rel: string): string {
  return readFileSync(new URL(rel, import.meta.url), 'utf8');
}

describe('master external integrations forensic regression', () => {
  it('M-01 razorpay gateway fetch is time-bounded', () => {
    const src = read('../../../../packages/payment/src/gateway/razorpay.ts');
    expect(src).toContain('AbortSignal.timeout(15000)');
  });

  it('M-02 settlement worker fetch is time-bounded', () => {
    const src = read('../../../../workers/settlement/src/index.ts');
    expect(src).toContain('AbortSignal.timeout(30000)');
  });

  it('M-03 reconciliation uses canonical provider default', () => {
    const src = read('./reconciliation.ts');
    expect(src).toContain('getPaymentProvider(env)');
    expect(src).not.toContain("env.PAYMENT_PROVIDER || 'mock'");
  });

  it('M-04 verifyAndCapture supports webhook-attested capture via fetchPayment', () => {
    const src = read('./service.ts');
    expect(src).toContain('webhookAttested');
    expect(src).toContain('gateway.fetchPayment(opts.gatewayPaymentId)');
  });

  it('M-04 webhook and recon pass webhookAttested instead of empty signature', () => {
    const webhook = read('./webhook-service.ts');
    expect(webhook).toContain('webhookAttested: true');
    const recon = read('./reconciliation.ts');
    expect(recon).toContain('webhookAttested: true');
  });

  it('M-03 provider default is razorpay in production, mock elsewhere', () => {
    expect(getPaymentProvider({ ENVIRONMENT: 'production' } as never)).toBe(
      'razorpay',
    );
    expect(getPaymentProvider({ ENVIRONMENT: 'preview' } as never)).toBe(
      'mock',
    );
    expect(
      getPaymentProvider({
        ENVIRONMENT: 'production',
        PAYMENT_PROVIDER: 'mock',
      } as never),
    ).toBe('mock');
  });
});
