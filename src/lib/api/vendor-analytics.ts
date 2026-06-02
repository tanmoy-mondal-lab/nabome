import { neon, isNeonConnected } from "../neon";

export interface VendorDashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: number;
  thisMonthRevenue: number;
}

export async function getVendorDashboardStats(vendorId: string): Promise<VendorDashboardStats | null> {
  if (!(await isNeonConnected())) return null;

  const [productCount, orderData, reviewData, customerCount, _pendingOrders, lowStock] = await Promise.all([
    neon.count("products", { vendor_id: vendorId }),
    neon.raw(`SELECT COUNT(*) as total_orders, COALESCE(SUM(o.total), 0) as total_revenue, COUNT(*) FILTER (WHERE o.status = 'pending') as pending_orders, COUNT(*) FILTER (WHERE o.created_at >= date_trunc('month', NOW())) as this_month, COALESCE(SUM(o.total) FILTER (WHERE o.created_at >= date_trunc('month', NOW())), 0) as this_month_revenue FROM orders o WHERE o.id IN (SELECT DISTINCT order_id FROM order_items WHERE vendor_id = $1)`, [vendorId]),
    neon.raw(`SELECT COALESCE(AVG(r.rating), 0) as avg_rating FROM reviews r JOIN products p ON p.id = r.product_id WHERE p.vendor_id = $1 AND r.status = 'approved'`, [vendorId]),
    neon.raw(`SELECT COUNT(DISTINCT o.user_id) as count FROM orders o WHERE o.id IN (SELECT DISTINCT order_id FROM order_items WHERE vendor_id = $1)`, [vendorId]),
    neon.count("products", { vendor_id: vendorId }),
    neon.count("products", { vendor_id: vendorId }),
  ]);

  const orderRow = (orderData.data as Record<string, unknown>[])?.[0] || {};
  const reviewRow = (reviewData.data as Record<string, unknown>[])?.[0] || {};
  const customerRow = (customerCount as unknown as { count?: number }) || {};

  return {
    totalProducts: Number((productCount as unknown as { count?: number })?.count || 0),
    totalOrders: Number(orderRow.total_orders || 0),
    totalRevenue: Number(orderRow.total_revenue || 0),
    averageRating: Number(reviewRow.avg_rating || 0),
    totalCustomers: Number(customerRow.count || 0),
    pendingOrders: Number(orderRow.pending_orders || 0),
    lowStockProducts: Number((lowStock as unknown as { count?: number })?.count || 0),
    recentOrders: Number(orderRow.this_month || 0),
    thisMonthRevenue: Number(orderRow.this_month_revenue || 0),
  };
}

export async function getVendorSalesChart(vendorId: string, days = 30): Promise<{ date: string; revenue: number; orders: number }[]> {
  if (!(await isNeonConnected())) return [];
  const { data } = await neon.raw(
    `SELECT DATE(o.created_at) as date, COUNT(*) as orders, COALESCE(SUM(o.total), 0) as revenue FROM orders o WHERE o.id IN (SELECT DISTINCT order_id FROM order_items WHERE vendor_id = $1) AND o.created_at >= NOW() - INTERVAL '${days} days' GROUP BY DATE(o.created_at) ORDER BY date`,
    [vendorId],
  );
  return ((data as Record<string, unknown>[]) || []).map((r) => ({
    date: r.date as string,
    revenue: Number(r.revenue),
    orders: Number(r.orders),
  }));
}
