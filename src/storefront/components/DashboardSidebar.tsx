import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils/cn";
import { LayoutDashboard, ShoppingBag, Heart, MapPin, Bell, Settings, LogOut, HelpCircle, Menu, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

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
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-30 bg-neutral-900 text-white p-3 rounded-full shadow-elevated"
        aria-label="Open account menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "shrink-0 bg-white lg:bg-transparent",
        "fixed lg:static top-0 left-0 bottom-0 z-50 lg:z-auto w-72 lg:w-64",
        "transform transition-transform duration-300 lg:transform-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile close button */}
        <div className="flex items-center justify-between px-4 py-3 lg:hidden border-b border-neutral-100">
          <span className="font-medium text-sm text-neutral-900">Account Menu</span>
          <button onClick={() => setMobileOpen(false)} className="p-1 hover:text-neutral-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
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
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-50 rounded w-full transition-colors tracking-fashion"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </nav>
      </aside>
    </>
  );
}
