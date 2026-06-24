import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api/admin";
import { StatsCard } from "../common/StatsCard";
import { formatPrice, formatCompactPrice } from "../../lib/utils/format";
import {
  ShoppingCart, Users, IndianRupee, TrendingUp, Eye,
  MapPin, Globe, Building2, Home, Hash, ChevronDown, ChevronRight,
} from "lucide-react";

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

interface GeoItem {
  name: string;
  count: number;
  children?: GeoItem[];
}

interface DeliveryData {
  total: number;
  byCountry: GeoItem[];
  byState: GeoItem[];
  byDistrict: GeoItem[];
  byCity: GeoItem[];
  byPincode: GeoItem[];
  stateByCountry: GeoItem[];
  cityByState: GeoItem[];
}

type Tab = "sales" | "delivery";

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("sales");
  const [period, setPeriod] = useState("30d");
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSalesAnalytics({ period }) as SalesData;
      setSalesData(res);
    } catch { /* non-critical: sales analytics unavailable, showing empty state */ setSalesData(null); } finally { setLoading(false); }
  }, [period]);

  const fetchDelivery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDeliveryAddressAnalytics({ period }) as DeliveryData;
      setDeliveryData(res);
    } catch { /* non-critical: delivery analytics unavailable, showing empty state */ setDeliveryData(null); } finally { setLoading(false); }
  }, [period]);

  useEffect(() => {
    if (tab === "sales") fetchSales();
    else fetchDelivery();
  }, [tab, period, fetchSales, fetchDelivery]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-neutral-900">Analytics</h1>
          <p className="text-sm text-neutral-500 mt-1">Sales and delivery insights</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-brand-500">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 mb-6 w-fit">
        {([
          { key: "sales" as Tab, label: "Sales Overview", icon: TrendingUp },
          { key: "delivery" as Tab, label: "Delivery Addresses", icon: MapPin },
        ]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500 hover:text-neutral-700"
            }`}>
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "sales" ? (
        <SalesTab data={salesData} />
      ) : (
        <DeliveryTab data={deliveryData} />
      )}
    </div>
  );
}

// ─── Sales Tab ───

function SalesTab({ data }: { data: SalesData | null }) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Revenue" value={formatPrice(data?.totalRevenue ?? 0)} icon={IndianRupee} changeType="positive" />
        <StatsCard label="Orders" value={data?.totalOrders ?? 0} icon={ShoppingCart} />
        <StatsCard label="Avg. Order Value" value={formatPrice(Math.round(data?.averageOrderValue ?? 0))} icon={TrendingUp} />
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
                <div key={d.label} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full bg-brand-500 rounded-t transition-all group-hover:bg-brand-600" style={{ height: `${(d.revenue / max) * 100}%` }} />
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
                    <p className="text-sm font-medium">{formatPrice(p.revenue ?? 0)}</p>
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

// ─── Delivery Addresses Tab ───

function DeliveryTab({ data }: { data: DeliveryData | null }) {
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());

  if (!data || data.total === 0) {
    return (
      <div className="bg-white border border-neutral-200 rounded p-12 text-center">
        <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500 font-medium">No delivery data yet</p>
        <p className="text-sm text-neutral-400 mt-1">Delivered orders will appear here</p>
      </div>
    );
  }

  const maxCountry = data.byCountry[0]?.count ?? 1;

  const toggleCountry = (name: string) => {
    setExpandedCountries((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const toggleState = (name: string) => {
    setExpandedStates((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        <StatsCard label="Countries" value={data.byCountry.length} icon={Globe} />
        <StatsCard label="States" value={data.byState.length} icon={MapPin} />
        <StatsCard label="Districts" value={data.byDistrict.length} icon={Building2} />
        <StatsCard label="Cities" value={data.byCity.length} icon={Home} />
        <StatsCard label="Pincodes" value={data.byPincode.length} icon={Hash} />
      </div>

      {/* Country Distribution Bar */}
      <div className="bg-white border border-neutral-200 rounded p-6 mb-6">
        <h3 className="font-medium text-sm text-neutral-900 mb-4">Orders by Country</h3>
        <div className="space-y-3">
          {data.byCountry.map((c) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-sm text-neutral-700 w-24 truncate">{c.name}</span>
              <div className="flex-1 h-6 bg-neutral-100 rounded overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded transition-all"
                  style={{ width: `${(c.count / maxCountry) * 100}%` }} />
              </div>
              <span className="text-sm font-medium text-neutral-900 w-12 text-right">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Drill-down: Country → State → City */}
      <div className="bg-white border border-neutral-200 rounded mb-6">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="font-medium text-sm text-neutral-900">Geographic Drill-down</h3>
          <p className="text-xs text-neutral-400 mt-0.5">Click a country to see states, then click a state to see cities</p>
        </div>
        <div className="divide-y divide-neutral-100">
          {data.stateByCountry.map((country) => (
            <div key={country.name}>
              <button onClick={() => toggleCountry(country.name)}
                className="w-full flex items-center gap-3 px-6 py-3 hover:bg-neutral-50 transition-colors text-left">
                {expandedCountries.has(country.name)
                  ? <ChevronDown size={14} className="text-neutral-400" />
                  : <ChevronRight size={14} className="text-neutral-400" />}
                <Globe size={14} className="text-brand-500" />
                <span className="text-sm font-medium text-neutral-900 flex-1">{country.name}</span>
                <span className="text-xs text-neutral-500">{country.children?.length ?? 0} states</span>
                <span className="text-sm font-semibold text-neutral-900">{country.count}</span>
              </button>
              {expandedCountries.has(country.name) && country.children && (
                <div className="bg-neutral-50/50">
                  {country.children.map((state) => (
                    <div key={state.name}>
                      <button onClick={() => toggleState(`${country.name}-${state.name}`)}
                        className="w-full flex items-center gap-3 pl-12 pr-6 py-2.5 hover:bg-neutral-100 transition-colors text-left">
                        {expandedStates.has(`${country.name}-${state.name}`)
                          ? <ChevronDown size={12} className="text-neutral-400" />
                          : <ChevronRight size={12} className="text-neutral-400" />}
                        <MapPin size={12} className="text-brand-400" />
                        <span className="text-sm text-neutral-700 flex-1">{state.name}</span>
                        <span className="text-xs text-neutral-500">{state.children?.length ?? 0} cities</span>
                        <span className="text-sm font-medium text-neutral-900">{state.count}</span>
                      </button>
                      {expandedStates.has(`${country.name}-${state.name}`) && state.children && (
                        <div className="bg-neutral-100/50">
                          {state.children.map((city) => (
                            <div key={city.name}
                              className="flex items-center gap-3 pl-20 pr-6 py-2 text-left">
                              <Home size={11} className="text-neutral-300" />
                              <span className="text-xs text-neutral-600 flex-1">{city.name}</span>
                              <span className="text-xs font-medium text-neutral-900">{city.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Top States, Cities, Pincodes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DataTable title="Top States" icon={MapPin} items={data.byState.slice(0, 10)} />
        <DataTable title="Top Cities" icon={Home} items={data.byCity.slice(0, 10)} />
        <DataTable title="Top Pincodes" icon={Hash} items={data.byPincode.slice(0, 10)} />
      </div>
    </div>
  );
}

function DataTable({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: GeoItem[] }) {
  const max = items[0]?.count ?? 1;
  return (
    <div className="bg-white border border-neutral-200 rounded p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className="text-brand-500" />
        <h3 className="font-medium text-sm text-neutral-900">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400 py-6 text-center">No data</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-neutral-400 w-4 text-right">{i + 1}</span>
              <span className="text-xs text-neutral-700 flex-1 truncate">{item.name}</span>
              <div className="w-20 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-400 rounded-full" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
              <span className="text-xs font-semibold text-neutral-900 w-8 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
