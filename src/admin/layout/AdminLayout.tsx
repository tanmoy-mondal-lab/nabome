import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { useAuth } from "../../hooks/useAuth";
import {
  LayoutDashboard, Package, ShoppingCart, Users, FileText,
  Image, Percent, BarChart3, Settings, Megaphone, Menu, X,
  Search, ChevronDown, LogOut, Palette, BarChart4, BookOpen,
  PackageSearch,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  {
    label: "Products", icon: Package, children: [
      { label: "All Products", href: "/admin/products" },
      { label: "Subcategories", href: "/admin/subcategories" },
      { label: "Brands", href: "/admin/brands" },
      { label: "Size Guides", href: "/admin/size-guides" },
      { label: "Labels & Tags", href: "/admin/labels" },
    ],
  },
  { label: "Inventory", icon: PackageSearch, href: "/admin/inventory" },
  { label: "Categories", icon: LayoutDashboard, href: "/admin/categories" },
  { label: "Collections", icon: LayoutDashboard, href: "/admin/collections" },
  { label: "Orders", icon: ShoppingCart, href: "/admin/orders" },
  { label: "Customers", icon: Users, href: "/admin/customers" },
  {
    label: "Content", icon: FileText, children: [
      { label: "CMS Pages", href: "/admin/cms/pages" },
      { label: "Page Builder", href: "/admin/cms/page-builder/new" },
      { label: "Homepage Builder", href: "/admin/cms/homepage" },
      { label: "Header Builder", href: "/admin/cms/header" },
      { label: "Navigation", href: "/admin/cms/navigation" },
      { label: "Footer Builder", href: "/admin/cms/footer" },
      { label: "Brand Story", href: "/admin/cms/brand-story" },
      { label: "Banners", href: "/admin/cms/banners" },
    ],
  },
  { label: "Lookbooks", icon: BookOpen, href: "/admin/lookbooks" },
  { label: "Media Library", icon: Image, href: "/admin/media" },
  { label: "Marketing", icon: Percent, href: "/admin/marketing" },
  { label: "SEO", icon: Search, href: "/admin/seo" },
  { label: "Theme", icon: Palette, href: "/admin/theme", children: [
    { label: "Theme Settings", href: "/admin/theme" },
    { label: "Theme Builder", href: "/admin/theme/builder" },
  ]},
  { label: "Analytics", icon: BarChart4, href: "/admin/analytics" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
];

export default function AdminLayout() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Products", "Content"]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((m) => m !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-neutral-900 text-white transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-700">
          <Link to="/admin" className="font-display text-xl tracking-widest text-accent-gold">
            NABOME
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded">
            Admin
          </span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-neutral-400">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-0.5 overflow-y-auto h-[calc(100vh-4rem)]">
          {NAV_ITEMS.map((item) => {
            if ("children" in item && item.children) {
              const open = expandedMenus.includes(item.label);
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                  >
                    <item.icon size={18} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && (
                    <div className="ml-6 space-y-0.5 mt-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-4 py-2 text-sm rounded transition-colors ${
                            isActive(child.href)
                              ? "text-accent-gold bg-neutral-800"
                              : "text-neutral-500 hover:text-white hover:bg-neutral-800"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                to={item.href!}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded transition-colors ${
                  isActive(item.href!)
                    ? "text-accent-gold bg-neutral-800"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
          <div className="flex items-center justify-between px-6 h-16">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-neutral-600">
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-400">
              <span className="text-neutral-600 font-medium">{user?.firstName}</span>
              <span className="text-neutral-300">|</span>
              <span className="capitalize">{user?.role?.replace("_", " ")}</span>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/" className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors">
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
