import { prisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleAdminAnalyticsRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "sales":
      return handleSales(req);
    case "products":
      return handleProducts();
    case "customers":
      return handleCustomers();
    case "deliveryAddresses":
      return handleDeliveryAddresses(req);
    default:
      return badRequest("Unknown action");
  }
}

function parsePeriod(periodParam: string): { days: number; groupBy: "day" | "week" | "month" | "year" } {
  switch (periodParam) {
    case "7d": return { days: 7, groupBy: "day" };
    case "30d": return { days: 30, groupBy: "day" };
    case "90d": return { days: 90, groupBy: "week" };
    case "1y": return { days: 365, groupBy: "month" };
    case "day": return { days: 1, groupBy: "day" };
    case "week": return { days: 7, groupBy: "day" };
    case "month": return { days: 30, groupBy: "day" };
    case "year": return { days: 365, groupBy: "month" };
    default: return { days: 30, groupBy: "day" };
  }
}

function formatLabel(date: Date, groupBy: string): string {
  switch (groupBy) {
    case "day":
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    case "week":
      return `W${Math.ceil(date.getDate() / 7)} ${date.toLocaleDateString("en-IN", { month: "short" })}`;
    case "month":
      return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    case "year":
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }
}

function getPeriodKey(date: Date, groupBy: string): string {
  switch (groupBy) {
    case "day":
      return date.toISOString().slice(0, 10);
    case "week": {
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().slice(0, 10);
    }
    case "month":
      return date.toISOString().slice(0, 7);
    case "year":
      return date.getFullYear().toString();
    default:
      return date.toISOString().slice(0, 10);
  }
}

async function handleSales(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const periodParam = url.searchParams.get("period") ?? "30d";
  const { days, groupBy } = parsePeriod(periodParam);
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [orders, totalCustomers, paidOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          paymentStatus: "paid",
          createdAt: { gte: start },
        },
        select: {
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" as const },
      }),
      prisma.profile.count({ where: { role: "customer" } }),
      prisma.order.count({ where: { paymentStatus: "paid" } }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalCustomers > 0 ? Math.round((paidOrders / totalCustomers) * 1000) / 10 : 0;

    // Guard: if no paid orders in period, return early with empty time series
    if (totalOrders === 0) {
      return success({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalCustomers,
        conversionRate,
        topProducts: [],
        revenueByPeriod: [],
        ordersByPeriod: [],
      });
    }

    // Revenue by period
    const revenueMap = new Map<string, number>();
    const ordersByPeriodMap = new Map<string, number>();
    for (const order of orders) {
      const key = getPeriodKey(order.createdAt, groupBy);
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + Number(order.total));
      ordersByPeriodMap.set(key, (ordersByPeriodMap.get(key) ?? 0) + 1);
    }

    const revenueByPeriod = Array.from(revenueMap.entries())
      .map(([key, revenue]) => ({ label: formatLabel(new Date(key), groupBy), revenue }))
      .sort((a, b) => a.label.localeCompare(b.label));

    const ordersByPeriod = Array.from(ordersByPeriodMap.entries())
      .map(([key, count]) => ({ label: formatLabel(new Date(key), groupBy), count }))
      .sort((a, b) => a.label.localeCompare(b.label));

    // Top products (last 30 days for context)
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true, totalPrice: true },
      where: {
        order: { paymentStatus: "paid", createdAt: { gte: start } },
      },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 10,
    });

    const topProducts = topProductsRaw.map((item) => ({
      name: item.productName,
      revenue: Number(item._sum.totalPrice ?? 0),
      orders: item._sum.quantity ?? 0,
    }));

    return success({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      totalCustomers,
      conversionRate,
      topProducts,
      revenueByPeriod,
      ordersByPeriod,
    });
  } catch (err) {
    return serverError(err);
  }
}

async function handleProducts(): Promise<Response> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  try {
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

    const categoryStats = await prisma.product.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      where: { isActive: true },
    });

    // Read low stock threshold from site settings
    const siteSettings = await prisma.siteSetting.findFirst();
    const lowStockThreshold = (siteSettings?.preferences as Record<string, unknown> | null)?.lowStockThreshold as number ?? 5;

    const lowStock = await prisma.productVariant.count({
      where: { stock: { lte: lowStockThreshold }, isActive: true },
    });
    const outOfStock = await prisma.productVariant.count({
      where: { stock: 0, isActive: true },
    });
    const inStock = await prisma.productVariant.count({
      where: { stock: { gt: lowStockThreshold }, isActive: true },
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

async function handleDeliveryAddresses(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const periodParam = url.searchParams.get("period") ?? "30d";
  const { days } = parsePeriod(periodParam);
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const orders = await prisma.order.findMany({
      where: {
        paymentStatus: "paid",
        shippingAddressId: { not: null },
        createdAt: { gte: start },
      },
      select: {
        shippingAddress: {
          select: {
            country: true,
            state: true,
            district: true,
            city: true,
            pincode: true,
          },
        },
      },
      take: 10000,
    });

    const countryMap = new Map<string, number>();
    const stateMap = new Map<string, number>();
    const districtMap = new Map<string, number>();
    const cityMap = new Map<string, number>();
    const pincodeMap = new Map<string, number>();
    const stateByCountry = new Map<string, Map<string, number>>();
    const cityByState = new Map<string, Map<string, number>>();

    for (const order of orders) {
      const addr = order.shippingAddress;
      if (!addr) continue;

      const country = addr.country || "Unknown";
      const state = addr.state || "Unknown";
      const district = addr.district || "Unknown";
      const city = addr.city || "Unknown";
      const pincode = addr.pincode || "Unknown";

      countryMap.set(country, (countryMap.get(country) ?? 0) + 1);
      stateMap.set(state, (stateMap.get(state) ?? 0) + 1);
      districtMap.set(district, (districtMap.get(district) ?? 0) + 1);
      cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
      pincodeMap.set(pincode, (pincodeMap.get(pincode) ?? 0) + 1);

      if (!stateByCountry.has(country)) stateByCountry.set(country, new Map());
      stateByCountry.get(country)!.set(state, (stateByCountry.get(country)!.get(state) ?? 0) + 1);

      if (!cityByState.has(state)) cityByState.set(state, new Map());
      cityByState.get(state)!.set(city, (cityByState.get(state)!.get(city) ?? 0) + 1);
    }

    const sortByCount = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const nestedSort = (outer: Map<string, Map<string, number>>) =>
      Array.from(outer.entries())
        .map(([name, children]) => ({
          name,
          count: Array.from(children.values()).reduce((s, v) => s + v, 0),
          children: sortByCount(children),
        }))
        .sort((a, b) => b.count - a.count);

    return success({
      total: orders.length,
      byCountry: sortByCount(countryMap),
      byState: sortByCount(stateMap),
      byDistrict: sortByCount(districtMap),
      byCity: sortByCount(cityMap),
      byPincode: sortByCount(pincodeMap),
      stateByCountry: nestedSort(stateByCountry),
      cityByState: nestedSort(cityByState),
    });
  } catch (err) {
    return serverError(err);
  }
}
