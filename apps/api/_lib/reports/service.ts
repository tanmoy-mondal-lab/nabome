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

function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n'))
    return `"${s.replace(/"/g, '""')}"`;
  return s;
}

interface SalesReport {
  reportId: string;
  reportType: 'sales';
  period: { start: Date; end: Date };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalItemsSold: number;
  };
  data: Array<{ date: string; orders: number; revenue: number; items: number }>;
}
interface InventoryReport {
  reportId: string;
  reportType: 'inventory';
  generatedAt: Date;
  summary: {
    totalProducts: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  data: Array<{
    productId: string;
    productName: string;
    sku: string;
    currentStock: number;
    value: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
  }>;
}
interface ReturnsReport {
  reportId: string;
  reportType: 'returns';
  period: { start: Date; end: Date };
  summary: { totalReturns: number; returnRate: number; totalRefunded: number };
  data: Array<{
    returnId: string;
    orderId: string;
    productId: string;
    reason: string;
    refundAmount: number;
    status: string;
  }>;
}
interface PaymentReport {
  reportId: string;
  reportType: 'payment';
  period: { start: Date; end: Date };
  summary: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalAmount: number;
  };
  data: Array<{
    paymentId: string;
    orderId: string;
    amount: number;
    method: string;
    status: string;
    timestamp: Date;
  }>;
}
interface ShippingReport {
  reportId: string;
  reportType: 'shipping';
  period: { start: Date; end: Date };
  summary: {
    totalShipments: number;
    deliveredShipments: number;
    inTransitShipments: number;
    averageDeliveryTime: number;
  };
  data: Array<{
    shipmentId: string;
    orderId: string;
    carrier: string;
    status: string;
    deliveryTime?: number;
  }>;
}
interface TaxReport {
  reportId: string;
  reportType: 'tax';
  period: { start: Date; end: Date };
  summary: {
    totalTaxCollected: number;
    taxableRevenue: number;
    taxRate: number;
  };
  data: Array<{
    orderId: string;
    orderDate: Date;
    taxableAmount: number;
    taxAmount: number;
    taxRate: number;
  }>;
}

export class ReportsService {
  static async generateSalesReport(
    shopOwnerId: string,
    options: { startDate: string; endDate: string },
  ): Promise<SalesReport> {
    const reportId = crypto.randomUUID();
    const start = new Date(options.startDate);
    const end = new Date(options.endDate);
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0) {
      return {
        reportId,
        reportType: 'sales',
        period: { start, end },
        summary: {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          totalItemsSold: 0,
        },
        data: [],
      };
    }
    const orders = await prisma.order.findMany({
      where: { shopId: { in: shopIds }, createdAt: { gte: start, lte: end } },
      select: {
        id: true,
        grandTotal: true,
        createdAt: true,
        items: { select: { quantity: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    const totalRevenue = orders.reduce((s, o) => s + toNum(o.grandTotal), 0);
    const totalOrders = orders.length;
    const totalItemsSold = orders.reduce(
      (s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0),
      0,
    );
    const map = new Map<
      string,
      { orders: number; revenue: number; items: number }
    >();
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      const cur = map.get(key) ?? { orders: 0, revenue: 0, items: 0 };
      cur.orders += 1;
      cur.revenue += toNum(o.grandTotal);
      cur.items += o.items.reduce((a, i) => a + i.quantity, 0);
      map.set(key, cur);
    }
    const data = [...map.entries()]
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return {
      reportId,
      reportType: 'sales',
      period: { start, end },
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
        totalItemsSold,
      },
      data,
    };
  }

  static async generateInventoryReport(
    shopOwnerId: string,
  ): Promise<InventoryReport> {
    const reportId = crypto.randomUUID();
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0) {
      return {
        reportId,
        reportType: 'inventory',
        generatedAt: new Date(),
        summary: {
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        },
        data: [],
      };
    }
    const variants = await prisma.productVariant.findMany({
      where: { product: { shopId: { in: shopIds } } },
      select: {
        id: true,
        sku: true,
        price: true,
        availableStock: true,
        inventoryStatus: true,
        lowStockThreshold: true,
        product: { select: { id: true, name: true } },
      },
      orderBy: { product: { name: 'asc' } },
    });
    let totalValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const data: InventoryReport['data'] = variants.map((v) => {
      const stock = v.availableStock;
      const price = toNum(v.price);
      totalValue += stock * price;
      let status: 'in_stock' | 'low_stock' | 'out_of_stock';
      if (stock === 0 || v.inventoryStatus === 'out_of_stock') {
        status = 'out_of_stock';
        outOfStockCount++;
      } else if (
        stock <= v.lowStockThreshold ||
        v.inventoryStatus === 'low_stock'
      ) {
        status = 'low_stock';
        lowStockCount++;
      } else status = 'in_stock';
      return {
        productId: v.product.id,
        productName: v.product.name,
        sku: v.sku,
        currentStock: stock,
        value: stock * price,
        status,
      };
    });
    return {
      reportId,
      reportType: 'inventory',
      generatedAt: new Date(),
      summary: {
        totalProducts: variants.length,
        totalValue,
        lowStockCount,
        outOfStockCount,
      },
      data,
    };
  }

  static async generateReturnsReport(
    shopOwnerId: string,
    options: { startDate: string; endDate: string },
  ): Promise<ReturnsReport> {
    const reportId = crypto.randomUUID();
    const start = new Date(options.startDate);
    const end = new Date(options.endDate);
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0) {
      return {
        reportId,
        reportType: 'returns',
        period: { start, end },
        summary: { totalReturns: 0, returnRate: 0, totalRefunded: 0 },
        data: [],
      };
    }
    const [returns, orderCount] = await Promise.all([
      prisma.returnRequest.findMany({
        where: { shopId: { in: shopIds }, createdAt: { gte: start, lte: end } },
        select: {
          id: true,
          orderId: true,
          reason: true,
          totalRefundAmount: true,
          status: true,
          items: { select: { productId: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({
        where: { shopId: { in: shopIds }, createdAt: { gte: start, lte: end } },
      }),
    ]);
    const totalRefunded = returns
      .filter((r) => String(r.status).includes('refund'))
      .reduce((s, r) => s + toNum(r.totalRefundAmount), 0);
    const refundedAll = returns.reduce(
      (s, r) => s + toNum(r.totalRefundAmount),
      0,
    );
    // totalRefunded as sum of all refund amounts for report clarity; use refundedAll if no refund statuses yet
    const effectiveRefunded = totalRefunded || refundedAll;
    const data = returns.map((r) => ({
      returnId: r.id,
      orderId: r.orderId,
      productId: r.items[0]?.productId ?? '',
      reason: String(r.reason),
      refundAmount: toNum(r.totalRefundAmount),
      status: String(r.status),
    }));
    return {
      reportId,
      reportType: 'returns',
      period: { start, end },
      summary: {
        totalReturns: returns.length,
        returnRate: orderCount ? returns.length / orderCount : 0,
        totalRefunded: effectiveRefunded,
      },
      data,
    };
  }

  static async generatePaymentReport(
    shopOwnerId: string,
    options: { startDate: string; endDate: string },
  ): Promise<PaymentReport> {
    const reportId = crypto.randomUUID();
    const start = new Date(options.startDate);
    const end = new Date(options.endDate);
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0) {
      return {
        reportId,
        reportType: 'payment',
        period: { start, end },
        summary: {
          totalPayments: 0,
          successfulPayments: 0,
          failedPayments: 0,
          totalAmount: 0,
        },
        data: [],
      };
    }
    const payments = await prisma.payment.findMany({
      where: {
        order: { shopId: { in: shopIds } },
        createdAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        orderId: true,
        amount: true,
        method: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const successSet = new Set([
      'succeeded',
      'completed',
      'captured',
      'authorized',
    ]);
    const failSet = new Set(['failed', 'cancelled', 'expired']);
    const totalAmount = payments.reduce((s, p) => s + toNum(p.amount), 0);
    const data = payments.map((p) => ({
      paymentId: p.id,
      orderId: p.orderId,
      amount: toNum(p.amount),
      method: String(p.method),
      status: String(p.status),
      timestamp: p.createdAt,
    }));
    return {
      reportId,
      reportType: 'payment',
      period: { start, end },
      summary: {
        totalPayments: payments.length,
        successfulPayments: payments.filter((p) =>
          successSet.has(String(p.status)),
        ).length,
        failedPayments: payments.filter((p) => failSet.has(String(p.status)))
          .length,
        totalAmount,
      },
      data,
    };
  }

  static async generateShippingReport(
    shopOwnerId: string,
    options: { startDate: string; endDate: string },
  ): Promise<ShippingReport> {
    const reportId = crypto.randomUUID();
    const start = new Date(options.startDate);
    const end = new Date(options.endDate);
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0) {
      return {
        reportId,
        reportType: 'shipping',
        period: { start, end },
        summary: {
          totalShipments: 0,
          deliveredShipments: 0,
          inTransitShipments: 0,
          averageDeliveryTime: 0,
        },
        data: [],
      };
    }
    const shipments = await prisma.shipment.findMany({
      where: {
        order: { shopId: { in: shopIds } },
        createdAt: { gte: start, lte: end },
      },
      select: {
        id: true,
        orderId: true,
        carrierCode: true,
        carrierName: true,
        status: true,
        shippedAt: true,
        deliveredAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    let totalDeliveryMs = 0;
    let deliveredCount = 0;
    const data = shipments.map((s) => {
      let deliveryTime: number | undefined;
      if (s.deliveredAt && s.shippedAt) {
        deliveryTime =
          (new Date(s.deliveredAt).getTime() -
            new Date(s.shippedAt).getTime()) /
          (1000 * 60 * 60 * 24);
        totalDeliveryMs += deliveryTime;
        deliveredCount++;
      } else if (s.deliveredAt && s.createdAt) {
        deliveryTime =
          (new Date(s.deliveredAt).getTime() -
            new Date(s.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        totalDeliveryMs += deliveryTime;
        deliveredCount++;
      }
      return {
        shipmentId: s.id,
        orderId: s.orderId,
        carrier: s.carrierName ?? s.carrierCode ?? 'unknown',
        status: String(s.status),
        deliveryTime,
      };
    });
    return {
      reportId,
      reportType: 'shipping',
      period: { start, end },
      summary: {
        totalShipments: shipments.length,
        deliveredShipments: shipments.filter(
          (s) => String(s.status) === 'delivered',
        ).length,
        inTransitShipments: shipments.filter(
          (s) => String(s.status) === 'in_transit',
        ).length,
        averageDeliveryTime: deliveredCount
          ? totalDeliveryMs / deliveredCount
          : 0,
      },
      data,
    };
  }

  static async generateTaxReport(
    shopOwnerId: string,
    options: { startDate: string; endDate: string },
  ): Promise<TaxReport> {
    const reportId = crypto.randomUUID();
    const start = new Date(options.startDate);
    const end = new Date(options.endDate);
    const shopIds = await getOwnedShopIds(shopOwnerId);
    if (shopIds.length === 0) {
      return {
        reportId,
        reportType: 'tax',
        period: { start, end },
        summary: { totalTaxCollected: 0, taxableRevenue: 0, taxRate: 0 },
        data: [],
      };
    }
    const orders = await prisma.order.findMany({
      where: { shopId: { in: shopIds }, createdAt: { gte: start, lte: end } },
      select: {
        id: true,
        createdAt: true,
        itemsSubtotal: true,
        taxTotal: true,
        grandTotal: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    const totalTaxCollected = orders.reduce((s, o) => s + toNum(o.taxTotal), 0);
    const taxableRevenue = orders.reduce(
      (s, o) => s + toNum(o.itemsSubtotal),
      0,
    );
    const data = orders.map((o) => {
      const taxable = toNum(o.itemsSubtotal);
      const tax = toNum(o.taxTotal);
      return {
        orderId: o.id,
        orderDate: o.createdAt,
        taxableAmount: taxable,
        taxAmount: tax,
        taxRate: taxable ? (tax / taxable) * 100 : 0,
      };
    });
    return {
      reportId,
      reportType: 'tax',
      period: { start, end },
      summary: {
        totalTaxCollected,
        taxableRevenue,
        taxRate: taxableRevenue
          ? (totalTaxCollected / taxableRevenue) * 100
          : 0,
      },
      data,
    };
  }

  static async exportToCSV(report: any): Promise<string> {
    const rows: any[] = report?.data ?? [];
    if (rows.length === 0) {
      const summary = report?.summary
        ? Object.keys(report.summary).join(',') +
          '\n' +
          Object.values(report.summary).map(csvEscape).join(',')
        : '';
      return summary;
    }
    const headers = Object.keys(rows[0]);
    const lines = [headers.map(csvEscape).join(',')];
    for (const r of rows) {
      lines.push(
        headers
          .map((h) => {
            const v = (r as any)[h];
            return csvEscape(v instanceof Date ? v.toISOString() : v);
          })
          .join(','),
      );
    }
    return lines.join('\n');
  }

  static async exportToPDF(report: any): Promise<Buffer> {
    const summary = report?.summary
      ? JSON.stringify(report.summary, null, 2)
      : '{}';
    const text = `%PDF-1.4
Report: ${report?.reportType ?? 'unknown'} - ${report?.reportId ?? ''}
Period: ${report?.period ? JSON.stringify(report.period) : (report?.generatedAt ?? '')}
Summary:
${summary}
Rows: ${(report?.data ?? []).length}
Note: Workers need external service for full PDF rendering; this is a text-based placeholder.
`;
    return Buffer.from(text, 'utf-8');
  }
}
