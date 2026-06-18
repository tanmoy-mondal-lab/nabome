import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../stores/auth-store";

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Admin header */}
      <header className="border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-xl tracking-widest text-accent-gold">
              NABOME
            </Link>
            <span className="text-[10px] uppercase tracking-widest text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-neutral-400 hover:text-white transition-colors">
              View Site
            </Link>
            <span className="text-sm text-neutral-400">{user?.firstName}</span>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-neutral-700 min-h-[calc(100vh-65px)] p-6 space-y-1">
          {[
            { label: "Dashboard", href: "/admin" },
            { label: "Products", href: "/admin/products" },
            { label: "Orders", href: "/admin/orders" },
            { label: "Customers", href: "/admin/customers" },
            { label: "CMS", href: "/admin/cms/pages" },
            { label: "Marketing", href: "/admin/coupons" },
            { label: "Analytics", href: "/admin/analytics" },
            { label: "Settings", href: "/admin/settings" },
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="block px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <h1 className="font-display text-3xl text-white mb-8">Dashboard</h1>
          <p className="text-neutral-400">Welcome to the NABOME admin panel.</p>

          {/* Quick stats placeholder */}
          <div className="grid grid-cols-4 gap-6 mt-8">
            {["Total Revenue", "Orders", "Products", "Customers"].map((stat) => (
              <div key={stat} className="bg-neutral-800 rounded p-6">
                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">{stat}</p>
                <p className="font-display text-3xl text-white">—</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
