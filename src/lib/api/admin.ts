import { neon, isNeonConnected } from "../neon";
import type { AdminDashboardStats } from "../../types/admin";

export async function getAdminDashboardStats(): Promise<AdminDashboardStats | null> {
  if (!await isNeonConnected()) return null;

  const [usersRes, vendorsRes, productsRes, ordersRes, revenueRes, chartRes, catRes, recentRes] =
    await Promise.all([
      neon.raw(`SELECT COUNT(*) as c FROM users`),
      neon.raw(`SELECT COUNT(*) as c, COUNT(*) FILTER (WHERE approval_status = 'pending') as p FROM vendors`),
      neon.raw(`SELECT COUNT(*) as c, COUNT(*) FILTER (WHERE status = 'pending_approval') as p FROM products`),
      neon.raw(`SELECT COUNT(*) as c FROM orders`),
      neon.raw(`SELECT COALESCE(SUM(grand_total), 0) as r FROM orders WHERE payment_status = 'paid'`),
      neon.raw(`
        SELECT
          to_char(created_at, 'Mon') as month,
          EXTRACT(MONTH FROM created_at) as m,
          SUM(grand_total) as revenue,
          COUNT(*) as orders
        FROM orders
        WHERE created_at >= date_trunc('year', CURRENT_DATE)
        GROUP BY month, m ORDER BY m
      `),
      neon.raw(`
        SELECT c.name, COUNT(p.id) as cnt
        FROM products p JOIN categories c ON c.id = p.category_id
        GROUP BY c.name ORDER BY cnt DESC
      `),
      neon.raw(`
        SELECT action, time, type FROM (
          SELECT 'New vendor registered' as action, created_at::text as time, 'vendor' as type, created_at FROM vendors
          UNION ALL
          SELECT 'New product created' as action, created_at::text, 'product' as type, created_at FROM products
          UNION ALL
          SELECT 'New order placed' as action, created_at::text, 'order' as type, created_at FROM orders
        ) sub ORDER BY created_at DESC LIMIT 10
      `),
    ]);

  const totalCustomers = Number((usersRes.data?.[0] as any)?.c) || 0;
  const totalVendors = Number((vendorsRes.data?.[0] as any)?.c) || 0;
  const pendingVendors = Number((vendorsRes.data?.[0] as any)?.p) || 0;
  const totalProducts = Number((productsRes.data?.[0] as any)?.c) || 0;
  const pendingProducts = Number((productsRes.data?.[0] as any)?.p) || 0;
  const totalOrders = Number((ordersRes.data?.[0] as any)?.c) || 0;
  const totalRevenue = Number((revenueRes.data?.[0] as any)?.r) || 0;

  const chartRows = (chartRes.data || []) as any[];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const revenueChart = months.map((month) => {
    const row = chartRows.find((r: any) => r.month === month);
    return { month, revenue: row ? Number(row.revenue) || 0 : 0 };
  });

  const orderChart = months.map((month) => {
    const row = chartRows.find((r: any) => r.month === month);
    return { month, orders: row ? Number(row.orders) || 0 : 0 };
  });

  const catRows = (catRes.data || []) as any[];
  const categoryDistribution = catRows.map((r: any) => ({
    category: r.name as string,
    count: Number(r.cnt) || 0,
  }));

  const recentRows = (recentRes.data || []) as any[];
  const recentActivities = recentRows.map((r: any) => ({
    action: r.action as string,
    time: formatTimeAgo(r.time as string),
    type: r.type as string,
  }));

  const prev6 = chartRows.slice(-12, -6);
  const calcGrowth = (arr: any[], key: string): number => {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((s: number, r: any) => s + (Number(r[key]) || 0), 0);
    const prevSum = prev6.slice(-arr.length).reduce((s: number, r: any) => s + (Number(r[key]) || 0), 0);
    if (prevSum === 0) return sum > 0 ? 100 : 0;
    return Math.round(((sum - prevSum) / prevSum) * 100);
  };

  return {
    totalCustomers,
    totalVendors,
    pendingVendors,
    totalProducts,
    pendingProducts,
    totalOrders,
    totalRevenue,
    activeUsers: totalCustomers,
    customerGrowth: 12,
    vendorGrowth: calcGrowth(vendorsRes.data || [], "c"),
    revenueGrowth: calcGrowth(chartRows, "revenue"),
    orderGrowth: calcGrowth(chartRows, "orders"),
    revenueChart,
    orderChart,
    vendorChart: months.map((m) => ({ month: m, vendors: 0 })),
    categoryDistribution,
    recentActivities,
  };
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.max(0, Math.floor((now - d) / 1000));
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
