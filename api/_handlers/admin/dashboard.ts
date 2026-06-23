import { prisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";
import { requireAdmin } from "../../_lib/auth";

export async function handleDashboardRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
  const adminGuard = requireAdmin(ctx);
  if (adminGuard) return adminGuard;

  switch (action) {
    case "overview":
      return handleOverview();
    default:
      return badRequest("Unknown action");
  }
}

async function handleOverview(): Promise<Response> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get low stock threshold from site settings
    const siteSettings = await prisma.siteSetting.findFirst();
    const lowStockThreshold = (siteSettings?.preferences as Record<string, unknown> | null)?.lowStockThreshold as number ?? 5;

    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      recentOrders,
      monthRevenue,
      monthOrders,
      lowStockVariants,
      pendingReviews,
      recentCustomers,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.profile.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "paid" },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          items: { take: 3 },
          profile: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: "paid",
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.productVariant.count({
        where: { stock: { lte: lowStockThreshold }, isActive: true },
      }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.profile.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
      }),
    ]);

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    // Sales by day (last 30 days) — fetch paid orders and group by day
    const paidOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "paid",
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, total: true },
    });

    const salesByDay = new Map<string, { revenue: number; orders: number }>();
    for (const order of paidOrders) {
      const day = order.createdAt.toISOString().split("T")[0];
      const existing = salesByDay.get(day) ?? { revenue: 0, orders: 0 };
      existing.revenue += Number(order.total);
      existing.orders += 1;
      salesByDay.set(day, existing);
    }

    // Fill in missing days with zero values
    const dailySales: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const day = d.toISOString().split("T")[0];
      dailySales.push({
        date: day,
        revenue: salesByDay.get(day)?.revenue ?? 0,
        orders: salesByDay.get(day)?.orders ?? 0,
      });
    }

    return success({
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalRevenue: totalRevenue._sum.total ?? 0,
        monthRevenue: monthRevenue._sum.total ?? 0,
        monthOrders,
        lowStockVariants,
        pendingReviews,
      },
      ordersByStatus: ordersByStatus.map((o) => ({
        status: o.status,
        count: o._count,
      })),
      recentOrders,
      recentCustomers,
      dailySales,
    });
  } catch (err) {
    return serverError(err);
  }
}
