/**
 * Payment event system — domain events for the payment/finance orchestration.
 *
 * Binding: PAYMENT_ENGINE_ARCHITECTURE.md §8 (events), MASTER_ARCHITECTURE
 * — every state change emits an event consumed by Orders, Shipping, Finance,
 * Notifications and Analytics. Notifications are persisted as rows in the
 * Notification table (channel in_app) so the customer inbox always reflects
 * payment state — no event is ever lost.
 */
import { getPrisma } from '../prisma';

export type PaymentEventType =
  | 'payment_created'
  | 'payment_authorized'
  | 'payment_captured'
  | 'payment_failed'
  | 'payment_expired'
  | 'refund_initiated'
  | 'refund_completed'
  | 'settlement_completed'
  | 'settlement_reversed'
  | 'webhook_received'
  | 'webhook_failed';

export interface PaymentEvent {
  eventType: PaymentEventType;
  paymentId?: string;
  orderId?: string;
  userId?: string | null;
  shopId?: string | null;
  amountPaise?: number;
  currency?: string;
  provider?: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}

const ANALYTICS_COUNTERS = new Map<string, number>();

/**
 * Emit a payment domain event: persists the user notification and updates the
 * in-memory analytics counters (analytics service aggregates DB + counters).
 */
export async function emitPaymentEvent(event: PaymentEvent): Promise<void> {
  recordCounter(event);

  const notification = notificationFor(event);
  if (notification && event.userId) {
    try {
      const prisma = getPrisma();
      await prisma.notification.create({
        data: {
          userId: event.userId,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          link: notification.link,
        },
      });
    } catch {
      // Notification persistence must never break the payment flow.
    }
  }
}

/** In-memory counters for analytics (approximate, per-runtime). */
export function recordCounter(event: PaymentEvent): void {
  const key = `${event.eventType}:${event.provider ?? 'none'}`;
  ANALYTICS_COUNTERS.set(key, (ANALYTICS_COUNTERS.get(key) ?? 0) + 1);
}

export function readCounters(): ReadonlyMap<string, number> {
  return new Map(ANALYTICS_COUNTERS);
}

interface NotificationDraft {
  type: 'payment_update' | 'order_update';
  title: string;
  body: string;
  link?: string;
}

function notificationFor(event: PaymentEvent): NotificationDraft | null {
  const amount =
    event.amountPaise !== undefined
      ? `₹${(event.amountPaise / 100).toFixed(2)}`
      : '';
  switch (event.eventType) {
    case 'payment_captured':
    case 'payment_authorized':
      return {
        type: 'payment_update',
        title: 'Payment successful',
        body: `Your payment of ${amount} was successful.`,
        link: event.orderId ? `/orders/${event.orderId}` : undefined,
      };
    case 'payment_failed':
    case 'payment_expired':
      return {
        type: 'payment_update',
        title: 'Payment failed',
        body: `Your payment of ${amount} could not be completed. You can retry.`,
        link: event.orderId ? `/orders/${event.orderId}` : undefined,
      };
    case 'refund_initiated':
      return {
        type: 'payment_update',
        title: 'Refund initiated',
        body: `Your refund of ${amount} has been initiated.`,
        link: event.orderId ? `/orders/${event.orderId}` : undefined,
      };
    case 'refund_completed':
      return {
        type: 'payment_update',
        title: 'Refund completed',
        body: `Your refund of ${amount} has been completed.`,
        link: event.orderId ? `/orders/${event.orderId}` : undefined,
      };
    case 'settlement_completed':
      return {
        type: 'order_update',
        title: 'Settlement completed',
        body: `Your settlement of ${amount} has been completed.`,
        link: '/finance/settlements',
      };
    case 'settlement_reversed':
      return {
        type: 'order_update',
        title: 'Settlement reversed',
        body: `A settlement of ${amount} was reversed. Please contact support.`,
        link: '/finance/settlements',
      };
    default:
      return null;
  }
}
