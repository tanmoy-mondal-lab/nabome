import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils/cn";
import { LayoutDashboard, ShoppingBag, Heart, MapPin, Bell, Settings, LogOut, HelpCircle } from "lucide-react";
import { useAuthStore } from "../stores/auth-store";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/account" },
  { icon: ShoppingBag, label: "Orders", path: "/account/orders" },
  { icon: Heart, label: "Wishlist", path: "/account/wishlist" },
  { icon: MapPin, label: "Addresses", path: "/account/addresses" },
  { icon: Bell, label: "Notifications", path: "/account/notifications" },
  { icon: Settings, label: "Settings", path: "/account/settings" },
  { icon: HelpCircle, label: "Support", path: "/account/support" },
];

export function DashboardSidebar() {
  const location = useLocation();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm rounded transition-colors tracking-fashion",
                active ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={clearAuth}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-50 rounded w-full transition-colors tracking-fashion"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </nav>
    </aside>
  );
}
