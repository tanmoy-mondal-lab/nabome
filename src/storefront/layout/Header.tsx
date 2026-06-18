import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, ChevronDown, Bell, X } from "lucide-react";
import { api } from "../../lib/api/client";
import { useAuthStore } from "../../stores/auth-store";
import { useUIStore } from "../stores/ui-store";
import { useCartStore } from "../stores/cart-store";
import { MegaMenu } from "./MegaMenu";
import { cn } from "../../lib/utils/cn";

export function Header() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { openSearch, toggleMobileMenu, setActiveMegaMenu, activeMegaMenu } = useUIStore();
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const [notifCount, setNotifCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [announcement, setAnnouncement] = useState<Record<string, unknown> | null>(null);
  const [menus, setMenus] = useState<{ id: string; label: string; url?: string; children?: unknown[] }[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 20);
      if (current > prevScroll && current > 80) setHidden(true);
      else if (current < prevScroll) setHidden(false);
      setPrevScroll(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [prevScroll]);

  useEffect(() => {
    Promise.all([
      api.get("/api/cms", { params: { action: "announcements" } }),
      api.get("/api/cms", { params: { action: "navigation" } }),
      api.get("/api/settings", { params: { action: "public" } }),
    ]).then(([a, n, s]) => {
      const announcements = ((a as Record<string, unknown>).announcements as Record<string, unknown>[]) ?? [];
      setAnnouncement(announcements[0] ?? null);
      setMenus(((n as Record<string, unknown>).menus ?? []) as typeof menus);
      setSettings(s as Record<string, unknown>);
    }).catch(() => {});
    if (isAuthenticated) {
      api.get("/api/notifications/unread-count", { credentials: "include" })
        .then((res) => setNotifCount((res as Record<string, number>).count ?? 0))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      scrolled ? "bg-white/90 backdrop-blur-xl shadow-subtle" : "bg-white"
    )}>
      {/* Announcement Bar */}
      <AnimatePresence>
        {announcement && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-luxe-charcoal text-white overflow-hidden"
          >
            <div className="container-page py-2.5 text-center">
              <p className="text-[10px] tracking-[0.25em] uppercase text-accent-goldLight">
                {announcement.message as string}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header */}
      <div className={cn("transition-transform duration-500", hidden && announcement ? "-translate-y-full" : "translate-y-0")}>
        <div className="container-page">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: Mobile Menu + Navigation */}
            <div className="flex items-center gap-1">
              <button onClick={toggleMobileMenu} className="md:hidden p-2 -ml-2 text-neutral-700 hover:text-brand-500 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
              <nav className="hidden md:flex items-center gap-0.5">
                {menus.slice(0, 5).map((menu) => {
                  const hasChildren = (menu.children?.length ?? 0) > 0;
                  return (
                    <div
                      key={menu.id}
                      className="relative"
                      onMouseEnter={() => hasChildren && setActiveMegaMenu(menu.label)}
                      onMouseLeave={() => setActiveMegaMenu(null)}
                    >
                      <Link
                        to={menu.url || "#"}
                        className={cn(
                          "flex items-center gap-1 px-4 py-2 text-xs tracking-[0.15em] uppercase transition-colors duration-200",
                          activeMegaMenu === menu.label ? "text-brand-500" : "text-neutral-700 hover:text-brand-500"
                        )}
                      >
                        {menu.label}
                        {hasChildren && <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", activeMegaMenu === menu.label ? "rotate-180" : "")} />}
                      </Link>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Center: Logo */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <span className="font-display text-xl md:text-2xl tracking-[0.35em] text-neutral-900">
                {settings.siteName as string || "NABOME"}
              </span>
            </Link>

            {/* Right: Icons */}
            <div className="flex items-center gap-0.5">
              <button onClick={openSearch} className="p-2.5 text-neutral-600 hover:text-brand-500 transition-colors" aria-label="Search">
                <Search className="w-4 h-4" />
              </button>
              <Link to={isAuthenticated ? "/account/wishlist" : "/auth/login"} className="hidden md:block p-2.5 text-neutral-600 hover:text-brand-500 transition-colors" aria-label="Wishlist">
                <Heart className="w-4 h-4" />
              </Link>
              <Link to={isAuthenticated ? "/account/notifications" : "/auth/login"} className="hidden md:block p-2.5 text-neutral-600 hover:text-brand-500 transition-colors relative" aria-label="Notifications">
                <Bell className="w-4 h-4" />
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
              <Link to={isAuthenticated ? "/account" : "/auth/login"} className="hidden md:block p-2.5 text-neutral-600 hover:text-brand-500 transition-colors" aria-label="Account">
                <User className="w-4 h-4" />
              </Link>
              <button onClick={() => navigate("/cart")} className="relative p-2.5 text-neutral-600 hover:text-brand-500 transition-colors" aria-label="Cart">
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount > 9 ? "9+" : itemCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>

          {/* Active Mega Menu */}
          <AnimatePresence>
            {activeMegaMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <MegaMenu label={activeMegaMenu} menus={menus as never} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Separator line */}
      <div className={cn("h-px bg-neutral-100 transition-opacity duration-300", scrolled ? "opacity-100" : "opacity-0")} />
    </header>
  );
}
