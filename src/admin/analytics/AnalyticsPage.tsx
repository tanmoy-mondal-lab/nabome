import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api/admin";
import { StatsCard } from "../common/StatsCard";
import { ShoppingCart, Users, IndianRupee, TrendingUp, Package, Eye } from "lucide-react";

interface SalesData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  conversionRate: number;
  topProducts: { name: string; revenue: number; orders: number }[];
  revenueByPeriod: { label: string; revenue: number }[];
  ordersByPeriod: { label: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  useEffect(() => {
    setLoading(true);
    adminApi.getSalesAnalytics({ period }).then((res) => {
      setData(res as SalesData);
    }).catch(() => {
      setData(null);
    }).finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Analytics</h1>
          <p className="text-sm text-neutral-500 mt-1">Sales and performance metrics</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded bg-white">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Revenue" value={`₹${(data?.totalRevenue ?? 0).toLocaleString()}`} icon={IndianRupee} changeType="positive" />
        <StatsCard label="Orders" value={data?.totalOrders ?? 0} icon={ShoppingCart} />
        <StatsCard label="Avg. Order Value" value={`₹${Math.round(data?.averageOrderValue ?? 0).toLocaleString()}`} icon={TrendingUp} />
        <StatsCard label="Conversion Rate" value={`${(data?.conversionRate ?? 0).toFixed(1)}%`} icon={Eye} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white border border-neutral-200 rounded p-6 mb-6">
        <h3 className="font-medium text-sm text-neutral-900 mb-4">Revenue Trend</h3>
        {data?.revenueByPeriod?.length ? (
          <div className="h-48 flex items-end gap-1">
            {data.revenueByPeriod.map((d) => {
              const max = Math.max(...data.revenueByPeriod.map((r) => r.revenue), 1);
              return (
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-brand-500 rounded-t" style={{ height: `${(d.revenue / max) * 100}%` }} />
                  <span className="text-[10px] text-neutral-400">{d.label}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-neutral-400 py-8 text-center">No data for this period</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <div className="bg-white border border-neutral-200 rounded p-6">
          <h3 className="font-medium text-sm text-neutral-900 mb-4">Orders</h3>
          {data?.ordersByPeriod?.length ? (
            <div className="h-40 flex items-end gap-1">
              {data.ordersByPeriod.map((d) => {
                const max = Math.max(...data.ordersByPeriod.map((o) => o.count), 1);
                return (
                  <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-accent-gold/50 rounded-t" style={{ height: `${(d.count / max) * 100}%` }} />
                    <span className="text-[10px] text-neutral-400">{d.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 py-8 text-center">No data</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-neutral-200 rounded p-6">
          <h3 className="font-medium text-sm text-neutral-900 mb-4">Top Products</h3>
          {data?.topProducts?.length ? (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-neutral-400 w-5">{i + 1}.</span>
                    <p className="text-sm text-neutral-900 truncate max-w-[200px]">{p.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₹{p.revenue?.toLocaleString()}</p>
                    <p className="text-xs text-neutral-400">{p.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 py-8 text-center">No product data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
