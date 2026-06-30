import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, ArrowRight, Package } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { formatPrice } from "../../lib/utils/format";
import { formatDate } from "../../lib/utils/format";
import { cn } from "../../lib/utils/cn";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";

const statusTabs = [
  { value: "", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<string, string> = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  processing: "status-processing",
  packed: "status-packed",
  shipped: "status-shipped",
  out_for_delivery: "status-out-for-delivery",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
  returned: "status-returned",
  refunded: "status-refunded",
};

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  items: Array<unknown>;
  paymentStatus: string;
}

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("status") || "";
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["customer", "orders", activeTab, page],
    queryFn: () => customerApi.getOrders({ status: activeTab || undefined, page, limit: 15 }),
  });

  const orders = ((data as unknown as { orders: Order[] })?.orders ?? []) as Order[];
  const pagination = (data as unknown as { pagination: { total: number; pages: number } })?.pagination ?? { total: 0, pages: 1 };

  function handleTabChange(value: string) {
    setSearchParams(value ? { status: value } : {});
    setPage(1);
  }

  return (
    <div className="container-page py-8">
      <Helmet>
        <title>My Orders — নবME</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">My Orders</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-wider whitespace-nowrap rounded-full transition-colors",
                  activeTab === tab.value
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-neutral-100 animate-pulse rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="premium-card p-12 text-center shadow-subtle">
              <Package className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-neutral-900 mb-2">No orders found</h3>
              <p className="text-xs text-neutral-500 mb-4">
                {activeTab ? `You don't have any ${activeTab} orders.` : "You haven't placed any orders yet."}
              </p>
              <Link to="/products" className="btn-primary inline-flex items-center gap-2">
                <ShoppingBag className="w-3 h-3" /> Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/account/orders/${order.id}`}
                    className="flex items-center justify-between premium-card p-4 shadow-subtle hover:shadow-card transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-100 rounded flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{order.orderNumber}</p>
                        <p className="text-xs text-neutral-400">{formatDate(order.createdAt)}</p>
                        <p className="text-xs text-neutral-400">{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${statusStyles[order.status] || "bg-neutral-100 text-neutral-600"}`}>
                          {order.status}
                        </span>
                        <p className="text-sm font-medium text-neutral-900 mt-1">{formatPrice(order.total)}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-neutral-300" />
                    </div>
                  </Link>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        "w-8 h-8 text-xs rounded-full transition-colors",
                        page === p ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
