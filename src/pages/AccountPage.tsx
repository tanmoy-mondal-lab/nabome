import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";
import { useAuth } from "../hooks/useAuth";

const ACCOUNT_TABS = [
  { label: "Overview", path: "/account" },
  { label: "Orders", path: "/account/orders" },
  { label: "Addresses", path: "/account/addresses" },
  { label: "Wishlist", path: "/account/wishlist" },
  { label: "Settings", path: "/account/settings" },
];

export default function AccountPage() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const currentTab = ACCOUNT_TABS.find(
    (t) => t.path !== "/account" && location.pathname.startsWith(t.path)
  ) ?? ACCOUNT_TABS[0];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-page py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl text-neutral-900">My Account</h1>
              <p className="text-sm text-neutral-500 mt-1">
                Welcome back, {user?.firstName}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLogout(!showLogout)}
                className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 font-display text-lg flex items-center justify-center"
              >
                {user?.firstName?.[0] ?? "U"}
              </button>
              {showLogout && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded shadow-lg z-10">
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <nav className="flex gap-8 mt-8 border-b border-neutral-200 -mb-[1px]">
            {ACCOUNT_TABS.map((tab) => {
              const isActive = tab === currentTab;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`pb-3 text-sm tracking-wider uppercase font-body transition-colors ${
                    isActive
                      ? "text-brand-500 border-b-2 border-brand-500"
                      : "text-neutral-400 hover:text-neutral-600"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="container-page py-8">
        <Outlet />
      </div>
    </div>
  );
}
