import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, type DashboardStats } from "../../lib/api/admin";
import { StatsCard } from "../common/StatsCard";
import { StatusBadge } from "../common/StatusBadge";
import { formatPrice, formatCompactPrice, formatDate } from "../../lib/utils/format";
import {
  Package, ShoppingCart, Users, IndianRupee, TrendingUp, TrendingDown,
  ArrowRight, BarChart3, ShoppingBag,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await adminApi.getDashboard();
      setData(res);
    } catch (err) {
      setError(`Failed to load dashboard data: ${(err as Error).message ?? "Unknown error"}`);
    } finally {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded hover:bg-brand-700 transition-colors">
          Retry
        </button>
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
          value={formatPrice(stats?.totalRevenue ?? 0)}
          change={`${formatCompactPrice(stats?.monthRevenue ?? 0)} this month`}
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

      {/* Orders by Status + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders by Status */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <BarChart3 size={16} className="text-brand-600" />
              </div>
              <h3 className="font-medium text-sm text-neutral-900">Orders by Status</h3>
            </div>
            <button onClick={() => navigate("/admin/orders")} className="text-xs text-neutral-400 hover:text-brand-600 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {data?.ordersByStatus?.length ? (
              (() => {
                const totalOrders = data.ordersByStatus.reduce((sum, item) => sum + item.count, 0);
                return data.ordersByStatus.map((item) => {
                  const pct = totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;
                  return (
                    <div key={item.status} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} />
                        </div>
                        <span className="text-sm font-semibold text-neutral-900 tabular-nums">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500/60 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
                  <ShoppingBag size={18} className="text-neutral-300" />
                </div>
                <p className="text-sm text-neutral-400">No orders yet</p>
                <p className="text-xs text-neutral-300 mt-1">Orders will appear here once placed</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                <ShoppingCart size={16} className="text-brand-600" />
              </div>
              <h3 className="font-medium text-sm text-neutral-900">Recent Orders</h3>
            </div>
            <button onClick={() => navigate("/admin/orders")} className="text-xs text-neutral-400 hover:text-brand-600 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-1">
            {data?.recentOrders?.length ? (
              (data.recentOrders as Array<{ id: string; orderNumber: string; status: string; total: number; createdAt: string; profile: { firstName: string; lastName: string } }>).slice(0, 5).map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="w-full flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-neutral-50 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-medium text-neutral-500 shrink-0">
                      {order.profile?.firstName?.[0]}{order.profile?.lastName?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 group-hover:text-brand-600 transition-colors">#{order.orderNumber}</p>
                      <p className="text-xs text-neutral-400 truncate">{order.profile?.firstName} {order.profile?.lastName}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-neutral-900">{formatPrice(order.total ?? 0)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
                  <ShoppingCart size={18} className="text-neutral-300" />
                </div>
                <p className="text-sm text-neutral-400">No recent orders</p>
                <p className="text-xs text-neutral-300 mt-1">Orders will appear here once placed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Sales Chart */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-brand-600" />
            </div>
            <h3 className="font-medium text-sm text-neutral-900">Daily Sales</h3>
          </div>
          <span className="text-xs text-neutral-400">Last 30 days</span>
        </div>
        {data?.dailySales?.length && data.dailySales.some((d) => d.revenue > 0) ? (
          <div className="h-52 flex items-end gap-px">
            {(() => {
              const maxRevenue = Math.max(...data.dailySales.map((d) => d.revenue), 1);
              return data.dailySales.map((day, i) => {
                const height = (day.revenue / maxRevenue) * 100;
                const showLabel = i === 0 || i === data.dailySales.length - 1 || new Date(day.date).getDate() === 1 || new Date(day.date).getDate() === 15;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1 relative group">
                    {day.revenue > 0 && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                        <div className="bg-neutral-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {formatPrice(day.revenue)}
                        </div>
                      </div>
                    )}
                    {day.revenue > 0 && (
                      <span className="text-[10px] text-neutral-400 font-medium">{formatCompactPrice(day.revenue)}</span>
                    )}
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        day.revenue > 0
                          ? "bg-brand-500 hover:bg-brand-600"
                          : "bg-neutral-100"
                      }`}
                      style={{ height: `${Math.max(height, 3)}%` }}
                    />
                    {showLabel ? (
                      <span className="text-[10px] text-neutral-400 mt-1 whitespace-nowrap">
                        {new Date(day.date).getDate()} {new Date(day.date).toLocaleDateString("en-IN", { month: "short" })}
                      </span>
                    ) : (
                      <span className="text-[10px] text-transparent mt-1">·</span>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center mb-3">
              <BarChart3 size={20} className="text-neutral-300" />
            </div>
            <p className="text-sm text-neutral-400">No sales in the last 30 days</p>
            <p className="text-xs text-neutral-300 mt-1">Sales will appear here once orders are paid</p>
          </div>
        )}
      </div>
    </div>
  );
}
