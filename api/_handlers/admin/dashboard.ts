import { prisma } from "../../_lib/prisma";
import { success, badRequest, serverError } from "../../_lib/response";
import type { RequestContext } from "../../_lib/types";

export async function handleDashboardRequest(
  req: Request,
  ctx: RequestContext,
  params: string[],
  action: string
): Promise<Response> {
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
      prisma.profile.count({ where: { role: "customer" } }),
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
        where: { stock: { lte: 5 }, isActive: true },
      }),
      prisma.review.count({ where: { isApproved: false } }),
      prisma.profile.findMany({
        where: { role: "customer" },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
      }),
    ]);

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: true,
    });

    // Sales by day (last 30 days)
    const dailySales = await prisma.order.groupBy({
      by: ["createdAt"],
      where: {
        paymentStatus: "paid",
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { total: true },
      _count: true,
    });

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
      dailySales: dailySales.map((d) => ({
        date: d.createdAt,
        revenue: d._sum.total ?? 0,
        orders: d._count,
      })),
    });
  } catch (err) {
    return serverError(err);
  }
}
