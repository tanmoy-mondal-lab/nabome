/**
 * Handler module index — wires the foundation routes into the registry.
 * Domain prompts append their own registrars here.
 */
import { handleHealth } from './health.ts';
import { handleErrors } from './meta.ts';
import { register } from './register.ts';
import './auth/index.ts';
import './cart/index.ts';
import './checkout/index.ts';
import './cod/index.ts';
import './finance/index.ts';
import './orders/index.ts';
import './payments/index.ts';
import './products/index.ts';
import './shipping/index.ts';
import './webhooks/index.ts';
import './admin/index.ts';
import './customer/index.ts';
import './user/index.ts';
import './shop-products/index.ts';
import './categories/index.ts';
import './brands/index.ts';
import './collections/index.ts';
import './search/index.ts';
import './inventory/index.ts';
import './dashboard/index.ts';
import './cms-products/index.ts';
import './homepage/index.ts';
import './media/index.ts';
import './newsletter/index.ts';
import './wishlist/index.ts';
import './shop-staff/index.ts';
import './shops/index.ts';
import './tax-shipping/index.ts';

export function registerHandlers(): void {
  register('GET', 'health', handleHealth);
  register('GET', 'meta/errors', handleErrors);
}
