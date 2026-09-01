import type { PrismaClient } from '@prisma/client';

import { getPrisma } from '../prisma.ts';

const prisma = new Proxy({} as unknown as PrismaClient, {
  get(_t: unknown, p: string | symbol) {
    return (getPrisma() as any)[p];
  },
}) as unknown as PrismaClient;

function toNum(v: unknown): number {
  return Number(v ?? 0);
}

async function getOwnedShopIds(ownerId: string): Promise<string[]> {
  try {
    const shops = await prisma.shop.findMany({
      where: { ownerId },
      select: { id: true },
    });
    return shops.map((s) => s.id);
  } catch {
    return [];
  }
}

function resolveDateRange(options: {
  period?: string;
  startDate?: string;
  endDate?: string;
}): { start: Date | undefined; end: Date | undefined; where: any } {
  if (options.startDate || options.endDate) {
    const start = options.startDate ? new Date(options.startDate) : undefined;
    const end = options.endDate ? new Date(options.endDate) : undefined;
    const where: any = {};
    if (start || end) {
      where.gte = start;
      where.lte = end;
    }
    return { start, end, where: Object.keys(where).length ? where : undefined };
  }
  if (!options.period || options.period === 'all')
    return { start: undefined, end: undefined, where: undefined };
  const now = new Date();
  let days = 30;
  if (
    options.period === 'daily' ||
    options.period === '7d' ||
    options.period === 'week'
  )
    days = 7;
  else if (
    options.period === 'weekly' ||
    options.period === '30d' ||
    options.period === 'month'
  )
    days = 30;
  else if (
    options.period === 'monthly' ||
    options.period === '90d' ||
    options.period === 'quarter'
  )
    days = 90;
  else if (options.period === 'yearly' || options.period === '365d') days = 365;
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { start, end: now, where: { gte: start, lte: now } };
}

interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  revenueByPeriod: { daily: number[]; weekly: number[]; monthly: number[] };
  topProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
    orders: number;
  }>;
  salesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    revenue: number;
    orders: number;
  }>;
}
interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    sales: number;
    revenue: number;
    views: number;
  }>;
  lowPerformingProducts: Array<{
    productId: string;
    productName: string;
    sales: number;
    views: number;
  }>;
  productViewsByPeriod: {
    daily: Record<string, number>;
    weekly: Record<string, number>;
  };
}
interface InventoryAnalytics {
  totalInventoryValue: number;
  totalProductsInStock: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  inventoryTurnover: number;
  stockMovement: Array<{ date: string; added: number; removed: number }>;
}
interface PaymentAnalytics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  paymentMethods: Array<{ method: string; count: number; amount: number }>;
  paymentTrends: { daily: number[]; weekly: number[] };
}
interface ShippingAnalytics {
  totalShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  exceptionShipments: number;
  averageDeliveryTime: number;
  carrierPerformance: Array<{
    carrier: string;
    shipments: number;
    onTimeDelivery: number;
    averageDeliveryTime: number;
  }>;
}
interface ReturnsAnalytics {
  totalReturns: number;
  returnRate: number;
  returnReasons: Array<{ reason: string; count: number; percentage: number }>;
  returnsByCategory: Array<{
    categoryId: string;
    categoryName: string;
    returns: number;
  }>;
  refundAmount: number;
}
interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  customerLifetimeValue: number;
  averageOrderFrequency: number;
  customerSegments: Array<{
    segment: string;
    count: number;
    averageSpend: number;
  }>;
}

export class AnalyticsService {
  static async getSalesAnalytics(
    shopOwnerId: string,
    options: { period: string; startDate?: string; endDate?: string },
  ): Promise<SalesAnalytics> {
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0)
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        revenueByPeriod: { daily: [], weekly: [], monthly: [] },
        topProducts: [],
        salesByCategory: [],
      };
    const { where: dateWhere } = resolveDateRange(options);
    const orderWhere: any = { shopId: { in: shopIds } };
    if (dateWhere) orderWhere.createdAt = dateWhere;
    const orders = await prisma.order.findMany({
      where: orderWhere,
      select: { grandTotal: true, createdAt: true },
    });
    const totalRevenue = orders.reduce((s, o) => s + toNum(o.grandTotal), 0);
    const totalOrders = orders.length;
    const dailyMap = new Map<string, number>();
    const weeklyMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();
    for (const o of orders) {
      const d = o.createdAt;
      const dayKey = d.toISOString().slice(0, 10);
      const weekKey = `${d.getUTCFullYear()}-W${Math.ceil(((d.getTime() - new Date(d.getUTCFullYear(), 0, 1).getTime()) / 86400000 + new Date(d.getUTCFullYear(), 0, 1).getDay() + 1) / 7)}`;
      const monthKey = d.toISOString().slice(0, 7);
      dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + toNum(o.grandTotal));
      weeklyMap.set(
        weekKey,
        (weeklyMap.get(weekKey) ?? 0) + toNum(o.grandTotal),
      );
      monthlyMap.set(
        monthKey,
        (monthlyMap.get(monthKey) ?? 0) + toNum(o.grandTotal),
      );
    }
    const daily = [...dailyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => v);
    const weekly = [...weeklyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => v);
    const monthly = [...monthlyMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, v]) => v);

    const topGroup = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: orderWhere },
      _sum: { lineTotal: true, quantity: true },
      _count: { _all: true },
      orderBy: { _sum: { lineTotal: 'desc' } },
      take: 10,
    });
    const prodIds = topGroup.map((g) => g.productId);
    const products = prodIds.length
      ? await prisma.product.findMany({
          where: { id: { in: prodIds } },
          select: { id: true, name: true },
        })
      : [];
    const nameMap = new Map(products.map((p) => [p.id, p.name]));
    const topProducts = topGroup.map((g) => ({
      productId: g.productId,
      productName: nameMap.get(g.productId) ?? g.productId,
      revenue: toNum(g._sum.lineTotal),
      orders: g._count._all,
    }));

    const orderItemsForCat = await prisma.orderItem.findMany({
      where: { order: orderWhere },
      select: {
        lineTotal: true,
        product: {
          select: { categoryId: true, category: { select: { name: true } } },
        },
      },
      take: 1000,
    });
    const catMap = new Map<
      string,
      { categoryName: string; revenue: number; orders: number }
    >();
    for (const oi of orderItemsForCat) {
      const cid = (oi.product as any)?.categoryId ?? 'uncategorized';
      const cname = (oi.product as any)?.category?.name ?? 'Uncategorized';
      const cur = catMap.get(cid) ?? {
        categoryName: cname,
        revenue: 0,
        orders: 0,
      };
      cur.revenue += toNum(oi.lineTotal);
      cur.orders += 1;
      catMap.set(cid, cur);
    }
    const salesByCategory = [...catMap.entries()]
      .map(([categoryId, v]) => ({ categoryId, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
      conversionRate: 0,
      revenueByPeriod: { daily, weekly, monthly },
      topProducts,
      salesByCategory,
    };
  }

  static async getProductAnalytics(
    shopOwnerId: string,
    _options: { period: string },
  ): Promise<ProductAnalytics> {
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0)
      return {
        totalProducts: 0,
        activeProducts: 0,
        topSellingProducts: [],
        lowPerformingProducts: [],
        productViewsByPeriod: { daily: {}, weekly: {} },
      };
    const where = { shopId: { in: shopIds } };
    const [totalProducts, activeProducts, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.count({
        where: { ...where, status: 'published', isActive: true },
      }),
      prisma.product.findMany({
        where,
        select: { id: true, name: true, totalSold: true, basePrice: true },
        orderBy: { totalSold: 'desc' },
        take: 20,
      }),
    ]);
    const topSellingProducts = products.slice(0, 10).map((p) => ({
      productId: p.id,
      productName: p.name,
      sales: p.totalSold,
      revenue: p.totalSold * toNum(p.basePrice),
      views: 0,
    }));
    const lowPerformingProducts = [...products]
      .sort((a, b) => a.totalSold - b.totalSold)
      .slice(0, 10)
      .map((p) => ({
        productId: p.id,
        productName: p.name,
        sales: p.totalSold,
        views: 0,
      }));
    return {
      totalProducts,
      activeProducts,
      topSellingProducts,
      lowPerformingProducts,
      productViewsByPeriod: { daily: {}, weekly: {} },
    };
  }

  static async getInventoryAnalytics(
    shopOwnerId: string,
  ): Promise<InventoryAnalytics> {
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0)
      return {
        totalInventoryValue: 0,
        totalProductsInStock: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        inventoryTurnover: 0,
        stockMovement: [],
      };
    const variants = await prisma.productVariant.findMany({
      where: { product: { shopId: { in: shopIds } } },
      select: {
        availableStock: true,
        price: true,
        inventoryStatus: true,
        lowStockThreshold: true,
      },
    });
    let totalInventoryValue = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let totalProductsInStock = 0;
    for (const v of variants) {
      totalInventoryValue += v.availableStock * toNum(v.price);
      if (v.availableStock > 0) totalProductsInStock++;
      if (v.availableStock === 0 || v.inventoryStatus === 'out_of_stock')
        outOfStockProducts++;
      else if (
        v.availableStock <= v.lowStockThreshold ||
        v.inventoryStatus === 'low_stock'
      )
        lowStockProducts++;
    }
    const variantIds = (
      await prisma.productVariant.findMany({
        where: { product: { shopId: { in: shopIds } } },
        select: { id: true },
        take: 1000,
      })
    ).map((v) => v.id);
    let stockMovement: InventoryAnalytics['stockMovement'] = [];
    if (variantIds.length) {
      const movements = await prisma.stockMovement.findMany({
        where: { variantId: { in: variantIds } },
        select: { type: true, quantity: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
        take: 500,
      });
      const map = new Map<string, { added: number; removed: number }>();
      for (const m of movements) {
        const key = m.createdAt.toISOString().slice(0, 10);
        const cur = map.get(key) ?? { added: 0, removed: 0 };
        const addTypes = new Set([
          'initial_stock',
          'purchase',
          'return',
          'adjustment',
          'transfer',
          'manual_update',
        ]);
        if (addTypes.has(String(m.type)) && m.quantity > 0)
          cur.added += m.quantity;
        else if (String(m.type) === 'sale' || m.quantity < 0)
          cur.removed += Math.abs(m.quantity);
        else cur.added += Math.max(0, m.quantity);
        map.set(key, cur);
      }
      stockMovement = [...map.entries()]
        .map(([date, v]) => ({ date, ...v }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }
    return {
      totalInventoryValue,
      totalProductsInStock,
      lowStockProducts,
      outOfStockProducts,
      inventoryTurnover: 0,
      stockMovement,
    };
  }

  static async getPaymentAnalytics(
    shopOwnerId: string,
    options: { period: string },
  ): Promise<PaymentAnalytics> {
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0)
      return {
        totalPayments: 0,
        successfulPayments: 0,
        failedPayments: 0,
        refundedPayments: 0,
        paymentMethods: [],
        paymentTrends: { daily: [], weekly: [] },
      };
    const { where: dateWhere } = resolveDateRange(options as any);
    const where: any = { order: { shopId: { in: shopIds } } };
    if (dateWhere) where.createdAt = dateWhere;
    const payments = await prisma.payment.findMany({
      where,
      select: { amount: true, method: true, status: true, createdAt: true },
    });
    const successSet = new Set([
      'succeeded',
      'completed',
      'captured',
      'authorized',
    ]);
    const failSet = new Set(['failed', 'cancelled', 'expired']);
    const refundSet = new Set(['refunded', 'partially_refunded', 'refunding']);
    const methodMap = new Map<string, { count: number; amount: number }>();
    const dailyMap = new Map<string, number>();
    const weeklyMap = new Map<string, number>();
    for (const p of payments) {
      const m = String(p.method);
      const cur = methodMap.get(m) ?? { count: 0, amount: 0 };
      cur.count++;
      cur.amount += toNum(p.amount);
      methodMap.set(m, cur);
      const d = p.createdAt;
      const dayKey = d.toISOString().slice(0, 10);
      const weekKey = `${d.getUTCFullYear()}-W${Math.ceil(((d.getTime() - new Date(d.getUTCFullYear(), 0, 1).getTime()) / 86400000 + new Date(d.getUTCFullYear(), 0, 1).getDay() + 1) / 7)}`;
      dailyMap.set(dayKey, (dailyMap.get(dayKey) ?? 0) + toNum(p.amount));
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) ?? 0) + toNum(p.amount));
    }
    return {
      totalPayments: payments.length,
      successfulPayments: payments.filter((p) =>
        successSet.has(String(p.status)),
      ).length,
      failedPayments: payments.filter((p) => failSet.has(String(p.status)))
        .length,
      refundedPayments: payments.filter((p) => refundSet.has(String(p.status)))
        .length,
      paymentMethods: [...methodMap.entries()].map(([method, v]) => ({
        method,
        ...v,
      })),
      paymentTrends: {
        daily: [...dailyMap.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([, v]) => v),
        weekly: [...weeklyMap.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([, v]) => v),
      },
    };
  }

  static async getShippingAnalytics(
    shopOwnerId: string,
    _options: { period: string },
  ): Promise<ShippingAnalytics> {
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0)
      return {
        totalShipments: 0,
        inTransitShipments: 0,
        deliveredShipments: 0,
        exceptionShipments: 0,
        averageDeliveryTime: 0,
        carrierPerformance: [],
      };
    const shipments = await prisma.shipment.findMany({
      where: { order: { shopId: { in: shopIds } } },
      select: {
        status: true,
        carrierCode: true,
        carrierName: true,
        shippedAt: true,
        deliveredAt: true,
        createdAt: true,
      },
    });
    const delivered = shipments.filter((s) => String(s.status) === 'delivered');
    const inTransitShipments = shipments.filter(
      (s) => String(s.status) === 'in_transit',
    ).length;
    const exceptionShipments = shipments.filter(
      (s) => String(s.status) === 'exception',
    ).length;
    let totalDays = 0;
    let countDays = 0;
    for (const s of delivered) {
      const start = s.shippedAt ?? s.createdAt;
      if (s.deliveredAt && start) {
        totalDays +=
          (new Date(s.deliveredAt).getTime() - new Date(start).getTime()) /
          86400000;
        countDays++;
      }
    }
    const carrierMap = new Map<
      string,
      {
        shipments: number;
        delivered: number;
        totalDays: number;
        deliveredDays: number;
      }
    >();
    for (const s of shipments) {
      const key = s.carrierName ?? s.carrierCode ?? 'unknown';
      const cur = carrierMap.get(key) ?? {
        shipments: 0,
        delivered: 0,
        totalDays: 0,
        deliveredDays: 0,
      };
      cur.shipments++;
      if (String(s.status) === 'delivered') {
        cur.delivered++;
        const start = s.shippedAt ?? s.createdAt;
        if (s.deliveredAt && start) {
          const d =
            (new Date(s.deliveredAt).getTime() - new Date(start).getTime()) /
            86400000;
          cur.totalDays += d;
          cur.deliveredDays++;
        }
      }
      carrierMap.set(key, cur);
    }
    const carrierPerformance = [...carrierMap.entries()].map(
      ([carrier, v]) => ({
        carrier,
        shipments: v.shipments,
        onTimeDelivery: v.shipments ? v.delivered / v.shipments : 0,
        averageDeliveryTime: v.deliveredDays
          ? v.totalDays / v.deliveredDays
          : 0,
      }),
    );
    return {
      totalShipments: shipments.length,
      inTransitShipments,
      deliveredShipments: delivered.length,
      exceptionShipments,
      averageDeliveryTime: countDays ? totalDays / countDays : 0,
      carrierPerformance,
    };
  }

  static async getReturnsAnalytics(
    shopOwnerId: string,
    _options: { period: string },
  ): Promise<ReturnsAnalytics> {
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0)
      return {
        totalReturns: 0,
        returnRate: 0,
        returnReasons: [],
        returnsByCategory: [],
        refundAmount: 0,
      };
    const [returns, orderCount] = await Promise.all([
      prisma.returnRequest.findMany({
        where: { shopId: { in: shopIds } },
        select: {
          reason: true,
          totalRefundAmount: true,
          items: { select: { productId: true } },
        },
      }),
      prisma.order.count({ where: { shopId: { in: shopIds } } }),
    ]);
    const totalReturns = returns.length;
    const refundAmount = returns.reduce(
      (s, r) => s + toNum(r.totalRefundAmount),
      0,
    );
    const reasonMap = new Map<string, number>();
    for (const r of returns) {
      const k = String(r.reason);
      reasonMap.set(k, (reasonMap.get(k) ?? 0) + 1);
    }
    const returnReasons = [...reasonMap.entries()].map(([reason, count]) => ({
      reason,
      count,
      percentage: totalReturns ? (count / totalReturns) * 100 : 0,
    }));
    const prodIds = [
      ...new Set(returns.flatMap((r) => r.items.map((i) => i.productId))),
    ];
    const prods = prodIds.length
      ? await prisma.product.findMany({
          where: { id: { in: prodIds } },
          select: {
            id: true,
            categoryId: true,
            category: { select: { name: true } },
          },
        })
      : [];
    const prodCatMap = new Map(
      prods.map((p) => [
        p.id,
        {
          categoryId: p.categoryId,
          categoryName: (p.category as any)?.name ?? 'Unknown',
        },
      ]),
    );
    const catMap = new Map<string, { categoryName: string; returns: number }>();
    for (const r of returns)
      for (const it of r.items) {
        const cat = prodCatMap.get(it.productId);
        if (!cat) continue;
        const cur = catMap.get(cat.categoryId) ?? {
          categoryName: cat.categoryName,
          returns: 0,
        };
        cur.returns++;
        catMap.set(cat.categoryId, cur);
      }
    return {
      totalReturns,
      returnRate: orderCount ? totalReturns / orderCount : 0,
      returnReasons,
      returnsByCategory: [...catMap.entries()].map(([categoryId, v]) => ({
        categoryId,
        ...v,
      })),
      refundAmount,
    };
  }

  static async getCustomerAnalytics(
    shopOwnerId: string,
    options: { period: string },
  ): Promise<CustomerAnalytics> {
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0)
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        newCustomers: 0,
        repeatCustomers: 0,
        customerLifetimeValue: 0,
        averageOrderFrequency: 0,
        customerSegments: [],
      };
    const { where: dateWhere } = resolveDateRange(options as any);
    const orderWhere: any = { shopId: { in: shopIds } };
    const orders = await prisma.order.findMany({
      where: orderWhere,
      select: { userId: true, grandTotal: true, createdAt: true },
    });
    const customerIds = [...new Set(orders.map((o) => o.userId))];
    const totalCustomers = customerIds.length;
    const orderCountByCustomer = new Map<
      string,
      { count: number; total: number }
    >();
    for (const o of orders) {
      const cur = orderCountByCustomer.get(o.userId) ?? { count: 0, total: 0 };
      cur.count++;
      cur.total += toNum(o.grandTotal);
      orderCountByCustomer.set(o.userId, cur);
    }
    const repeatCustomers = [...orderCountByCustomer.values()].filter(
      (v) => v.count > 1,
    ).length;
    const totalRevenue = orders.reduce((s, o) => s + toNum(o.grandTotal), 0);
    const activeCustomers = dateWhere
      ? new Set(
          orders
            .filter((o) => {
              const t = o.createdAt.getTime();
              const gte = (dateWhere.gte as Date)?.getTime() ?? 0;
              const lte = (dateWhere.lte as Date)?.getTime() ?? Infinity;
              return t >= gte && t <= lte;
            })
            .map((o) => o.userId),
        ).size
      : totalCustomers;
    let newCustomers = 0;
    if (dateWhere?.gte) {
      const since = dateWhere.gte as Date;
      const users = customerIds.length
        ? await prisma.user.findMany({
            where: { id: { in: customerIds } },
            select: { id: true, createdAt: true },
          })
        : [];
      newCustomers = users.filter((u) => u.createdAt >= since).length;
    } else {
      newCustomers = totalCustomers;
    }
    const segMap = new Map<string, { count: number; total: number }>();
    for (const [, v] of orderCountByCustomer) {
      let seg = 'one_time';
      if (v.count >= 5) seg = 'loyal';
      else if (v.count >= 2) seg = 'repeat';
      const cur = segMap.get(seg) ?? { count: 0, total: 0 };
      cur.count++;
      cur.total += v.total;
      segMap.set(seg, cur);
    }
    return {
      totalCustomers,
      activeCustomers,
      newCustomers,
      repeatCustomers,
      customerLifetimeValue: totalCustomers ? totalRevenue / totalCustomers : 0,
      averageOrderFrequency: totalCustomers
        ? orders.length / totalCustomers
        : 0,
      customerSegments: [...segMap.entries()].map(([segment, v]) => ({
        segment,
        count: v.count,
        averageSpend: v.count ? v.total / v.count : 0,
      })),
    };
  }
}
