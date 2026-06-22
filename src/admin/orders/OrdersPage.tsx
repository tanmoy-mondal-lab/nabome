import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/api/admin";
import { DataTable } from "../common/DataTable";
import { StatusBadge } from "../common/StatusBadge";
import { StatsCard } from "../common/StatsCard";
import {
  ShoppingCart, Clock, Package, Truck, CheckCircle,
  RotateCcw, Banknote, Search, X,
} from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  couponCode?: string;
  currency?: string;
  paymentMethod?: string;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string };
  _count: { items: number };
}

interface OrderStats {
  countsByStatus: Record<string, number>;
  returnRequestCount: number;
  refundRequestCount: number;
  today: { orders: number; revenue: number };
}

const TABS = [
  "All", "Pending", "Confirmed", "Processing", "Packed",
  "Shipped", "Out for Delivery", "Delivered", "Cancelled",
  "Returns", "Refunds",
];

const STATUS_MAP: Record<string, string> = {
  Pending: "pending",
  Confirmed: "confirmed",
  Processing: "processing",
  Packed: "packed",
  Shipped: "shipped",
  "Out for Delivery": "out_for_delivery",
  Delivered: "delivered",
  Cancelled: "cancelled",
  Returns: "returned",
  Refunds: "refunded",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const navigate = useNavigate();

  const fetchStats = useCallback(async () => {
    try {
      const res = await adminApi.getOrderStats();
      setStats((res as unknown as OrderStats) ?? null);
    } catch { /* ignore */ }
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const statusKey = STATUS_MAP[activeTab];
      const params: Record<string, string | number | undefined> = { page, limit: 20 };
      if (statusKey) params.status = statusKey;
      if (searchQuery) params.search = searchQuery;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      const res = await adminApi.getOrders(params);
      setOrders((res.orders as Order[]) ?? []);
      const pag = res.pagination as { totalPages?: number } | undefined;
      setTotalPages(pag?.totalPages ?? 1);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [page, activeTab, searchQuery, dateFrom, dateTo]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [activeTab, searchQuery, dateFrom, dateTo]);
  useEffect(() => { fetch(); }, [fetch]);

  const statCards = stats
    ? [
        { label: "Pending", value: stats.countsByStatus?.pending ?? 0, icon: Clock },
        { label: "Processing", value: stats.countsByStatus?.processing ?? 0, icon: Package },
        { label: "Shipped", value: stats.countsByStatus?.shipped ?? 0, icon: Truck },
        { label: "Delivered", value: stats.countsByStatus?.delivered ?? 0, icon: CheckCircle },
        { label: "Returns", value: stats.returnRequestCount ?? 0, icon: RotateCcw },
        { label: "Refunds", value: stats.refundRequestCount ?? 0, icon: Banknote },
      ]
    : [];

  const columns = [
    {
      key: "orderNumber", label: "Order #", sortable: true,
      render: (o: Order) => <span className="font-medium text-neutral-900">#{o.orderNumber}</span>,
    },
    {
      key: "customer", label: "Customer",
      render: (o: Order) => (
        <div>
          <p className="text-sm text-neutral-900">{(o as unknown as { profile?: { firstName: string; lastName: string; email: string } })?.profile?.firstName} {(o as unknown as { profile?: { firstName: string; lastName: string; email: string } })?.profile?.lastName}</p>
          <p className="text-xs text-neutral-400">{(o as unknown as { profile?: { firstName: string; lastName: string; email: string } })?.profile?.email}</p>
        </div>
      ),
    },
    {
      key: "_count", label: "Items",
      render: (o: Order) => <span className="text-sm text-neutral-600">{o._count?.items ?? 0}</span>,
    },
    {
      key: "subtotal", label: "Subtotal",
      render: (o: Order) => <span className="text-sm text-neutral-500">₹{o.subtotal?.toLocaleString() ?? "—"}</span>,
    },
    {
      key: "discount", label: "Disc.",
      render: (o: Order) => o.discount ? <span className="text-xs text-green-600">-₹{o.discount.toLocaleString()}{o.couponCode ? ` (${o.couponCode})` : ""}</span> : <span className="text-xs text-neutral-300">—</span>,
    },
    {
      key: "status", label: "Status",
      render: (o: Order) => <StatusBadge status={o.status} />,
    },
    {
      key: "paymentMethod", label: "Payment Method",
      render: (o: Order) => <span className="text-xs text-neutral-500 capitalize">{o.paymentMethod ?? "—"}</span>,
    },
    {
      key: "paymentStatus", label: "Payment",
      render: (o: Order) => <StatusBadge status={o.paymentStatus} />,
    },
    {
      key: "total", label: "Total", sortable: true,
      render: (o: Order) => <span className="font-medium">₹{o.total?.toLocaleString()}</span>,
    },
    {
      key: "currency", label: "Curr.",
      render: (o: Order) => <span className="text-xs text-neutral-400">{o.currency ?? "INR"}</span>,
    },
    {
      key: "createdAt", label: "Date", sortable: true,
      render: (o: Order) => (
        <span className="text-sm text-neutral-500">
          {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage customer orders</p>
      </div>

      {/* Stats Cards */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map((s) => (
            <StatsCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
          ))}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              activeTab === tab
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search order # or customer email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 text-sm border border-neutral-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onRowClick={(o) => navigate(`/admin/orders/${o.id}`)}
        emptyMessage="No orders found"
      />
    </div>
  );
}
