import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Clock, Heart, MapPin, Bell, Settings, HelpCircle, ArrowRight } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { formatPrice } from "../../lib/utils/format";
import { formatDate } from "../../lib/utils/format";
import { useAuthStore } from "../../stores/auth-store";
import { DashboardSidebar } from "../components/DashboardSidebar";

interface DashboardData {
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    total: number;
    items: Array<unknown>;
  }>;
  wishlistCount: number;
  addressesCount: number;
  unreadNotifications: number;
}

interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  deliveredOrders: number;
}

const statusStyles: Record<string, string> = {
  pending: "status-pending",
  processing: "status-processing",
  shipped: "status-shipped",
  delivered: "status-delivered",
  cancelled: "status-cancelled",
};

const quickLinks = [
  { icon: ShoppingBag, label: "View Orders", path: "/account/orders", countKey: "totalOrders" as const },
  { icon: Heart, label: "Wishlist", path: "/account/wishlist", countKey: "wishlistCount" as const },
  { icon: MapPin, label: "Addresses", path: "/account/addresses", countKey: "addressesCount" as const },
  { icon: Bell, label: "Notifications", path: "/account/notifications", countKey: "unreadNotifications" as const },
  { icon: Settings, label: "Settings", path: "/account/settings" },
  { icon: HelpCircle, label: "Support", path: "/account/support" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: dashboard } = useQuery({
    queryKey: ["customer", "dashboard"],
    queryFn: () => customerApi.getDashboard(),
  });

  const { data: stats } = useQuery({
    queryKey: ["customer", "order-stats"],
    queryFn: () => customerApi.getOrderStats(),
  });

  const dashboardData = (dashboard as unknown as DashboardData) ?? { recentOrders: [], wishlistCount: 0, addressesCount: 0, unreadNotifications: 0 };
  const orderStats = (stats as unknown as OrderStats) ?? { totalOrders: 0, totalSpent: 0, pendingOrders: 0, deliveredOrders: 0 };

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">My Account</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h2 className="text-xl font-display text-neutral-900 mb-1 editorial-lead text-balance">Welcome back, {((user?.firstName as string) || "there").split(" ")[0]}</h2>
            <p className="text-sm text-neutral-500 editorial-caption">Here's what's happening with your account today.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="premium-card p-4 shadow-subtle">
              <p className="text-2xl font-display text-neutral-900">{orderStats.totalOrders}</p>
              <p className="text-xs text-neutral-500 mt-1 tracking-fashion">Total Orders</p>
            </div>
            <div className="premium-card p-4 shadow-subtle">
              <p className="text-2xl font-display text-neutral-900">{formatPrice(orderStats.totalSpent)}</p>
              <p className="text-xs text-neutral-500 mt-1 tracking-fashion">Total Spent</p>
            </div>
            <div className="premium-card p-4 shadow-subtle">
              <p className="text-2xl font-display text-neutral-900">{orderStats.pendingOrders}</p>
              <p className="text-xs text-neutral-500 mt-1 tracking-fashion">Pending Orders</p>
            </div>
            <div className="premium-card p-4 shadow-subtle">
              <p className="text-2xl font-display text-neutral-900">{dashboardData.wishlistCount}</p>
              <p className="text-xs text-neutral-500 mt-1 tracking-fashion">Wishlist Items</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900 editorial-caption">Recent Orders</h3>
              <Link to="/account/orders" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {dashboardData.recentOrders.length === 0 ? (
              <div className="premium-card p-8 text-center shadow-subtle">
                <Clock className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">No orders yet.</p>
                <Link to="/products" className="text-xs text-brand-600 hover:underline mt-2 inline-block">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboardData.recentOrders.slice(0, 5).map((order) => (
                  <Link key={order.id} to={`/account/orders/${order.id}`} className="flex items-center justify-between premium-card p-4 shadow-subtle hover:shadow-card transition-shadow">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{order.orderNumber}</p>
                      <p className="text-xs text-neutral-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded ${statusStyles[order.status] || "bg-neutral-100 text-neutral-600"}`}>
                        {order.status}
                      </span>
                      <span className="text-sm font-medium">{formatPrice(order.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.path} to={link.path} className="premium-card p-4 hover:shadow-card transition-shadow flex items-center gap-3 shadow-subtle">
                  <Icon className="w-5 h-5 text-neutral-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{link.label}</p>
                    {"countKey" in link && link.countKey && (
                      <p className="text-xs text-neutral-400">
                        {(dashboardData[link.countKey as keyof typeof dashboardData] ?? orderStats[link.countKey as keyof typeof orderStats] ?? 0) as number} items
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
