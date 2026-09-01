import { getPrisma } from '../prisma.ts';

import { CartEventEmitter } from './events';
import type { CartAnalytics, CartAbandonmentMetrics } from './types';

const prisma = new Proxy({} as any, {
  get(_t: unknown, prop: string | symbol) {
    return (getPrisma() as any)[prop];
  },
});

export class CartAnalyticsService {
  static trackAddToCart(
    userId: string | null,
    guestId: string | null,
    itemId: string,
    variantId: string,
    quantity: number,
    price: number,
  ): void {
    CartEventEmitter.emitItemAdded(
      userId,
      guestId,
      itemId,
      variantId,
      quantity,
      {
        price,
        value: price * quantity,
        currency: 'INR',
      },
    );
    this.sendToAnalytics({
      event: 'add_to_cart',
      userId,
      guestId,
      itemId,
      variantId,
      quantity,
      price,
      value: price * quantity,
      currency: 'INR',
    });
  }

  static trackRemoveFromCart(
    userId: string | null,
    guestId: string | null,
    itemId: string,
    variantId: string,
    quantity: number,
    price: number,
  ): void {
    CartEventEmitter.emitItemRemoved(userId, guestId, itemId, variantId, {
      price,
      value: price * quantity,
      currency: 'INR',
    });
    this.sendToAnalytics({
      event: 'remove_from_cart',
      userId,
      guestId,
      itemId,
      variantId,
      quantity,
      price,
      value: price * quantity,
      currency: 'INR',
    });
  }

  static trackCartView(
    userId: string | null,
    guestId: string | null,
    itemCount: number,
    totalValue: number,
  ): void {
    this.sendToAnalytics({
      event: 'view_cart',
      userId,
      guestId,
      itemCount,
      totalValue,
      currency: 'INR',
    });
  }

  static trackCheckoutStart(
    userId: string | null,
    guestId: string | null,
    itemCount: number,
    totalValue: number,
  ): void {
    CartEventEmitter.emitCheckoutStarted(userId, guestId, {
      itemCount,
      totalValue,
      currency: 'INR',
    });
    this.sendToAnalytics({
      event: 'begin_checkout',
      userId,
      guestId,
      itemCount,
      totalValue,
      currency: 'INR',
    });
  }

  static trackCartAbandonment(
    userId: string | null,
    guestId: string | null,
    itemCount: number,
    totalValue: number,
    lastActivityAt: Date,
  ): void {
    this.sendToAnalytics({
      event: 'cart_abandoned',
      userId,
      guestId,
      itemCount,
      totalValue,
      currency: 'INR',
      timeSinceActivity: Date.now() - lastActivityAt.getTime(),
    });
  }

  static async getCartAnalytics(
    userId: string | null,
    guestId: string | null,
  ): Promise<CartAnalytics> {
    const where: any = {};
    if (userId) where.userId = userId;
    else if (guestId) where.guestId = guestId;
    else {
      return {
        userId,
        guestId,
        itemCount: 0,
        totalValue: 0,
        averageItemPrice: 0,
        topCategories: [],
        lastActivityAt: new Date(),
        timeSinceLastActivity: 0,
      };
    }
    const items: any[] = await prisma.cartItem.findMany({
      where,
      include: { product: { select: { categoryId: true } } },
    });
    const itemCount = items.length;
    const totalValue = items.reduce(
      (sum: number, it: any) =>
        sum +
        Number(
          it.lineTotal ??
            (it.unitPrice ? Number(it.unitPrice) * it.quantity : 0),
        ),
      0,
    );
    const averageItemPrice = itemCount ? totalValue / itemCount : 0;
    const categoryCounts = new Map<string, number>();
    for (const it of items) {
      const cat = it.product?.categoryId ?? 'unknown';
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    }
    const topCategories = [...categoryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([c]) => c);
    const lastActivityAt =
      items.reduce(
        (latest: Date | null, it: any) => {
          const d = new Date(it.updatedAt);
          return !latest || d > latest ? d : latest;
        },
        null as Date | null,
      ) ?? new Date();
    return {
      userId,
      guestId,
      itemCount,
      totalValue,
      averageItemPrice,
      topCategories,
      lastActivityAt,
      timeSinceLastActivity: Date.now() - lastActivityAt.getTime(),
    };
  }

  static async getAbandonmentMetrics(): Promise<CartAbandonmentMetrics> {
    const abandonCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeCarts = await prisma.cartItem.count({
      where: { updatedAt: { gte: abandonCutoff } },
    });
    const abandonedCarts = await prisma.cartItem.count({
      where: { updatedAt: { lt: abandonCutoff } },
    });
    const [abandonedSessions, startedSessions, completedSessions] =
      await Promise.all([
        prisma.checkoutSession
          .count({ where: { status: { in: ['abandoned', 'expired'] } } })
          .catch(() => 0),
        prisma.checkoutSession.count({}).catch(() => 0),
        prisma.checkoutSession
          .count({ where: { status: 'completed' } })
          .catch(() => 0),
      ]);
    const totalAbandoned = abandonedSessions || abandonedCarts;
    const totalStarted = startedSessions || activeCarts + abandonedCarts;
    const recovered = completedSessions;
    const recoveryRate = totalAbandoned
      ? (recovered / totalAbandoned) * 100
      : 0;
    const avgAgg: any = await prisma.cartItem
      .aggregate({ _avg: { lineTotal: true } })
      .catch(() => ({ _avg: { lineTotal: 0 } }));
    const averageCartValue = Number(avgAgg?._avg?.lineTotal ?? 0);
    void totalStarted;
    return {
      totalAbandoned,
      recovered,
      recoveryRate,
      averageTimeToRecovery: 0,
      averageCartValue,
    };
  }

  private static sendToAnalytics(data: Record<string, unknown>): void {
    console.log('[ANALYTICS]', JSON.stringify(data));
  }

  static calculateConversionRate(
    totalCarts: number,
    convertedCarts: number,
  ): number {
    if (totalCarts === 0) return 0;
    return (convertedCarts / totalCarts) * 100;
  }

  static calculateAverageCartValue(
    totalValue: number,
    cartCount: number,
  ): number {
    if (cartCount === 0) return 0;
    return totalValue / cartCount;
  }
}
