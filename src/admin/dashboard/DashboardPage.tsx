import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, type DashboardStats } from "../../lib/api/admin";
import { StatsCard } from "../common/StatsCard";
import { StatusBadge } from "../common/StatusBadge";
import {
  Package, ShoppingCart, Users, IndianRupee, TrendingUp, TrendingDown,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const res = await adminApi.getDashboard();
      setData(res);
    } catch (e) { console.error("Failed to fetch dashboard", e); } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Overview of your store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Products"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          onClick={() => navigate("/admin/products")}
        />
        <StatsCard
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          change={`${stats?.monthOrders ?? 0} this month`}
          changeType="neutral"
          icon={ShoppingCart}
          onClick={() => navigate("/admin/orders")}
        />
        <StatsCard
          label="Total Customers"
          value={stats?.totalCustomers ?? 0}
          icon={Users}
          onClick={() => navigate("/admin/customers")}
        />
        <StatsCard
          label="Total Revenue"
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString()}`}
          change={`₹${(stats?.monthRevenue ?? 0).toLocaleString()} this month`}
          changeType="positive"
          icon={IndianRupee}
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {Number(stats?.lowStockVariants) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded p-4 flex items-center gap-3">
            <TrendingDown size={18} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-medium">{stats?.lowStockVariants} variants</span> with low stock
            </p>
          </div>
        )}
        {Number(stats?.pendingReviews) > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 flex items-center gap-3">
            <TrendingUp size={18} className="text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800">
              <span className="font-medium">{stats?.pendingReviews} pending reviews</span> awaiting approval
            </p>
          </div>
        )}
      </div>

      {/* Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-neutral-200 rounded p-6">
          <h3 className="font-medium text-sm text-neutral-900 mb-4">Orders by Status</h3>
          <div className="space-y-3">
            {data?.ordersByStatus?.length ? (
              data.ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <StatusBadge status={item.status} />
                  <span className="text-sm font-medium text-neutral-700">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400">No order data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded p-6">
          <h3 className="font-medium text-sm text-neutral-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {data?.recentOrders?.length ? (
              (data.recentOrders as Array<{ id: string; orderNumber: string; status: string; total: number; customer: { firstName: string; lastName: string } }>).slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">#{order.orderNumber}</p>
                    <p className="text-xs text-neutral-500">{order.customer?.firstName} {order.customer?.lastName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{order.total?.toLocaleString()}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400">No recent orders</p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Sales Chart */}
      <div className="bg-white border border-neutral-200 rounded p-6">
        <h3 className="font-medium text-sm text-neutral-900 mb-4">Daily Sales (Last 14 Days)</h3>
        {data?.dailySales?.length ? (
          <div className="h-48 flex items-end gap-1">
            {data.dailySales.map((day) => {
              const max = Math.max(...data.dailySales.map((d) => d.revenue), 1);
              const height = (day.revenue / max) * 100;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-neutral-400">₹{day.revenue > 999 ? `${(day.revenue / 1000).toFixed(1)}k` : day.revenue}</span>
                  <div
                    className="w-full bg-brand-500/20 rounded-t"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-[10px] text-neutral-400">
                    {new Date(day.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 py-8 text-center">No sales data yet</p>
        )}
      </div>
    </div>
  );
}
