import { prisma } from "../../_lib/prisma";
import { success, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";

export async function handleAdminAnalyticsRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  switch (action) {
    case "sales":
      return handleSales(req);
    case "products":
      return handleProducts();
    case "customers":
      return handleCustomers();
    default:
      return new Response("Unknown action", { status: 400 });
  }
}

async function handleSales(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") ?? "month"; // day | week | month | year
  const startDate = url.searchParams.get("from") ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const start = new Date(startDate);

  try {
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "paid",
        createdAt: { gte: start },
      },
      select: {
        total: true,
        createdAt: true,
        status: true,
        discount: true,
        shippingCost: true,
        tax: true,
      },
      orderBy: { createdAt: "asc" as const },
    });

    // Aggregate by date
    const salesByDate = aggregateByPeriod(orders, period);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount), 0);
    const totalTax = orders.reduce((sum, o) => sum + Number(o.tax), 0);
    const totalShipping = orders.reduce((sum, o) => sum + Number(o.shippingCost), 0);

    return success({
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalDiscount,
        totalTax,
        totalShipping,
      },
      salesByDate,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleProducts(): Promise<Response> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
    // Top selling products
    const orderItems = await prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true, totalPrice: true },
      where: {
        order: {
          paymentStatus: "paid",
          createdAt: { gte: thirtyDaysAgo },
        },
      },
      orderBy: { _sum: { quantity: "desc" } },
      take: 20,
    });

    const topProducts = orderItems.map((item) => ({
      productId: item.productId,
      name: item.productName,
      quantitySold: item._sum.quantity ?? 0,
      revenue: item._sum.totalPrice ?? 0,
    }));

    // Category distribution
    const categoryStats = await prisma.product.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      where: { isActive: true },
    });

    // Stock status
    const lowStock = await prisma.productVariant.count({
      where: { stock: { lte: 5 }, isActive: true },
    });
    const outOfStock = await prisma.productVariant.count({
      where: { stock: 0, isActive: true },
    });
    const inStock = await prisma.productVariant.count({
      where: { stock: { gt: 5 }, isActive: true },
    });

    return success({
      topProducts,
      categoryStats,
      stockStatus: { inStock, lowStock, outOfStock },
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleCustomers(): Promise<Response> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  try {
    const [totalCustomers, newCustomersMonth, newCustomers30d, repeatCustomers] = await Promise.all([
      prisma.profile.count({ where: { role: "customer" } }),
      prisma.profile.count({
        where: { role: "customer", createdAt: { gte: startOfMonth } },
      }),
      prisma.profile.count({
        where: { role: "customer", createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.profile.count({
        where: {
          role: "customer",
          orders: { some: { paymentStatus: "paid" } },
        },
      }),
    ]);

    // Customer acquisition by day (last 30 days)
    const acquisitionByDay = await prisma.profile.groupBy({
      by: ["createdAt"],
      where: {
        role: "customer",
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
      orderBy: { createdAt: "asc" },
    });

    return success({
      totalCustomers,
      newCustomersMonth,
      newCustomers30d,
      repeatCustomers,
      acquisitionRate: totalCustomers > 0
        ? Math.round((repeatCustomers / totalCustomers) * 100)
        : 0,
      acquisitionByDay: acquisitionByDay.map((d) => ({
        date: d.createdAt,
        count: d._count,
      })),
    });
  } catch (err) {
    return serverError(err);
  }
}

function aggregateByPeriod(
  orders: Array<{ total: unknown; createdAt: Date; status: string }>,
  period: string
): Array<{ date: string; revenue: number; orders: number }> {
  const map = new Map<string, { revenue: number; orders: number }>();

  for (const order of orders) {
    const date = new Date(order.createdAt);
    let key: string;

    switch (period) {
      case "day":
        key = date.toISOString().slice(0, 10);
        break;
      case "week": {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().slice(0, 10);
        break;
      }
      case "year":
        key = date.toISOString().slice(0, 4);
        break;
      case "month":
      default:
        key = date.toISOString().slice(0, 7);
        break;
    }

    const existing = map.get(key) ?? { revenue: 0, orders: 0 };
    existing.revenue += Number(order.total);
    existing.orders += 1;
    map.set(key, existing);
  }

  return Array.from(map.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
