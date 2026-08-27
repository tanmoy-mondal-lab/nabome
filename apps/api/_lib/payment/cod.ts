/**
 * COD service — basic Cash-on-Delivery flow (user scope: included now).
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §7.12/ML-08, REST_API_SPECIFICATION
 * §7.16 (methods), shipping rules (COD max ₹5000 — Blueprint §5.3.2):
 * - Order created with method=cod at checkout; CodOrder row created on
 *   confirmation (awaiting_pickup → picked_up → out_for_delivery →
 *   delivered → collected → paid_to_seller).
 * - Cash collection recorded once (collectedAt + cashCollected); on
 *   collection the payment record is marked captured (no gateway involved)
 *   and settlement eligibility follows the standard ML-04 hold path.
 */
import { COD_MAX_AMOUNT, toPaise, type Paise } from '@nabome/payment';

import type { Env } from '../env';
import { ApiError } from '../http/errors';
import { getPrisma } from '../prisma';

import { addTimelineEvent } from './service';

export type CodFlowStatus =
  'awaiting_pickup' | 'in_transit' | 'delivered' | 'paid_to_seller';

/** Create the COD tracking row when an order is confirmed with method=cod. */
export async function createCodOrder(
  orderId: string,
  orderAmountPaise: number,
): Promise<void> {
  const prisma = getPrisma();
  const existing = await prisma.codOrder.findUnique({ where: { orderId } });
  if (existing) return;
  await prisma.codOrder.create({
    data: {
      orderId,
      codLimit: orderAmountPaise / 100,
      status: 'awaiting_pickup',
    },
  });
}

/** COD order amount check (Blueprint §5.3.2 — cod.maxAmount ₹5000). */
export function codAllowed(
  amountPaise: number,
  codMaxPaise: Paise = COD_MAX_AMOUNT as Paise,
): boolean {
  return amountPaise > 0 && amountPaise <= codMaxPaise;
}

/**
 * Courier collection confirmation (webhook-first; idempotent).
 * Marks the order's COD payment captured on collection — the payment record
 * exists for ledger/eligibility uniformity (settlement hold from delivered).
 */
export async function confirmCodCollection(
  env: Env,
  orderId: string,
  collectedPaise: number,
): Promise<{ status: CodFlowStatus }> {
  const prisma = getPrisma();
  const cod = await prisma.codOrder.findUnique({ where: { orderId } });
  if (!cod)
    throw new ApiError({
      code: 'PAYMENT_NOT_CAPTURED',
      message: 'COD order not found',
    });
  if (cod.status === 'paid_to_seller') {
    return { status: 'paid_to_seller' };
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order)
    throw new ApiError({
      code: 'PAYMENT_NOT_CAPTURED',
      message: 'Order not found',
    });
  const orderTotal = Number(order.itemsSubtotal) + Number(order.shippingTotal);
  if (collectedPaise !== toPaise(orderTotal.toString())) {
    throw new ApiError({
      code: 'PAYMENT_AMOUNT_MISMATCH',
      message: 'Collected amount does not match order total',
    });
  }

  // Cash collected → paid_to_seller (canonical CodOrderStatus; no "collected" state).
  const updated = await prisma.codOrder.update({
    where: { id: cod.id },
    data: {
      status: 'paid_to_seller',
      cashCollected: collectedPaise / 100,
      collectedAt: new Date(),
    },
  });

  // Uniform payment record: captured by collection (no gateway in the flow).
  await prisma.payment.updateMany({
    where: { orderId, method: 'cod', isActive: true },
    data: { status: 'captured' },
  });
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: 'captured', paymentSubStatus: 'captured' },
  });
  await addTimelineEvent(orderId, 'payment_completed', 'COD cash collected');

  // ML-10 records — same trigger as gateway capture (earnings path).
  const payment = await prisma.payment.findFirst({
    where: { orderId, method: 'cod', isActive: true },
  });
  if (payment) {
    const { createOrderFinanceRecords } = await import('../finance/service');
    await createOrderFinanceRecords(env, orderId, payment.id);
  }

  return { status: updated.status as CodFlowStatus };
}

/** Advance the COD lifecycle (courier events; basic forward transitions). */
export async function advanceCodStatus(
  orderId: string,
  to: CodFlowStatus,
): Promise<{ status: CodFlowStatus }> {
  const prisma = getPrisma();
  const cod = await prisma.codOrder.findUnique({ where: { orderId } });
  if (!cod)
    throw new ApiError({
      code: 'PAYMENT_NOT_CAPTURED',
      message: 'COD order not found',
    });

  const ORDER: CodFlowStatus[] = [
    'awaiting_pickup',
    'in_transit',
    'delivered',
    'paid_to_seller',
  ];
  const fromIndex = ORDER.indexOf(cod.status as CodFlowStatus);
  const toIndex = ORDER.indexOf(to);
  if (toIndex < 0 || toIndex <= fromIndex) {
    throw new ApiError({
      code: 'PAYMENT_FAILED',
      message: `Invalid COD transition ${cod.status} → ${to}`,
    });
  }
  if (to === 'paid_to_seller') {
    throw new ApiError({
      code: 'PAYMENT_FAILED',
      message: 'Collection must use the confirm endpoint',
    });
  }

  const updated = await prisma.codOrder.update({
    where: { id: cod.id },
    data: { status: to },
  });
  return { status: updated.status as CodFlowStatus };
}
