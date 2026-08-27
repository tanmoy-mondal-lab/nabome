/**
 * Shared test fixtures — addresses, cart items, orders. Typed against
 * @nabome/types and deterministic like the other fixture modules.
 */
import type { Address, CartItem, Order } from '@nabome/types';

const TS = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const ADDRESS_ID = '00000000-0000-4000-8000-000000000070';
export const CART_ITEM_ID = '00000000-0000-4000-8000-000000000071';
export const ORDER_ID = '00000000-0000-4000-8000-000000000072';
export const ORDER_ITEM_ID = '00000000-0000-4000-8000-000000000073';

export function makeAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: ADDRESS_ID,
    userId: '00000000-0000-4000-8000-000000000001',
    label: 'Home',
    recipientName: 'Ayesha Rahman',
    phone: '+8801711111111',
    addressLine1: '12/3 Dhanmondi',
    addressLine2: 'Road 7',
    city: 'Dhaka',
    state: 'Dhaka',
    postalCode: '1205',
    country: 'BD',
    isDefault: true,
    isActive: true,
    ...TS,
    ...overrides,
  };
}

export function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: CART_ITEM_ID,
    cartId: '00000000-0000-4000-8000-000000000074',
    productId: '00000000-0000-4000-8000-000000000020',
    variantId: '00000000-0000-4000-8000-000000000060',
    productSlug: 'signature-bronze-necklace',
    productName: 'Signature Bronze Necklace',
    imageUrl: 'https://media.nabome.online/necklace-1.webp',
    sku: 'NBN-LNK-BRZ-001',
    attributes: [{ attribute: 'color', value: 'bronze' }],
    unitPrice: { amount: '2499.00', currency: 'INR' },
    quantity: 2,
    lineTotal: { amount: '4998.00', currency: 'INR' },
    isAvailable: true,
    ...TS,
    ...overrides,
  };
}

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: ORDER_ID,
    orderNumber: 'NAB-20260101-000001',
    userId: '00000000-0000-4000-8000-000000000001',
    guestToken: null,
    status: 'confirmed',
    customerVisibleStatus: 'confirmed',
    paymentStatus: 'captured',
    items: [
      {
        id: ORDER_ITEM_ID,
        orderId: ORDER_ID,
        productId: '00000000-0000-4000-8000-000000000020',
        variantId: '00000000-0000-4000-8000-000000000060',
        productName: 'Signature Bronze Necklace',
        sku: 'NBN-LNK-BRZ-001',
        attributes: [{ attribute: 'color', value: 'bronze' }],
        unitPrice: { amount: '2499.00', currency: 'INR' },
        quantity: 2,
        lineTotal: { amount: '4998.00', currency: 'INR' },
        imageUrl: 'https://media.nabome.online/necklace-1.webp',
      },
    ],
    amounts: {
      subtotal: { amount: '4998.00', currency: 'INR' },
      discountTotal: { amount: '0.00', currency: 'INR' },
      shippingTotal: { amount: '0.00', currency: 'INR' },
      taxTotal: { amount: '0.00', currency: 'INR' },
      grandTotal: { amount: '4998.00', currency: 'INR' },
    },
    shippingAddress: {
      label: 'Home',
      recipientName: 'Ayesha Rahman',
      phone: '+8801711111111',
      addressLine1: '12/3 Dhanmondi',
      addressLine2: 'Road 7',
      city: 'Dhaka',
      state: 'Dhaka',
      postalCode: '1205',
      country: 'BD',
    },
    billingAddress: null,
    couponCode: null,
    paymentId: null,
    shipmentId: null,
    cancelledAt: null,
    deliveredAt: null,
    ...TS,
    ...overrides,
  };
}
