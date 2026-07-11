import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, ShoppingBag, User, Menu, ChevronDown, Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { useAuthStore } from "../../stores/auth-store";
import { useUIStore } from "../stores/ui-store";
import { useCartStore } from "../stores/cart-store";
import { useSettings } from "../hooks/useSettings";
import { useNavigation } from "../hooks/useNavigation";
import { useAnnouncements } from "../hooks/useAnnouncements";
import type { ThemeHeaderConfig, ThemeBranding } from "../../cms/core/cms-types";
import { MegaMenu } from "./MegaMenu";
import { cn } from "../../lib/utils/cn";

export function Header() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { openSearch, toggleMobileMenu, setActiveMegaMenu, activeMegaMenu, openCart } = useUIStore();
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const [scrolled, setScrolled] = useState(false);
  const prevScrollRef = useRef(0);
  const [hidden, setHidden] = useState(false);

  const { data: settings } = useSettings();
  const { data: announcement } = useAnnouncements();
  const { data: navItems = [] } = useNavigation("header");
  const visibleNavItems = (navItems ?? []).filter((item) => item.isVisible !== false);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 150);
  }, [clearCloseTimer, setActiveMegaMenu]);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 20);
      if (window.innerWidth < 768) {
        if (current > prevScrollRef.current && current > 80) setHidden(true);
        else if (current < prevScrollRef.current) setHidden(false);
      }
      prevScrollRef.current = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get<{ count: number }>("/api/notifications/unread-count", { credentials: "include" }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const notifCount = notifData?.count ?? 0;

  const theme = settings?.theme;
  const themeBranding = theme?.branding as ThemeBranding | undefined;
  const headerConfig = (theme?.header ?? settings?.preferences?.headerConfig) as ThemeHeaderConfig | undefined;
  const maxNavItems = headerConfig?.maxNavItems ?? 10;

  const brandName = settings?.siteName || themeBranding?.brandName || "নবME";
  const logoUrl = settings?.logoUrl || themeBranding?.logo;

  // Brand flip animation state
  const [brandFlipIndex, setBrandFlipIndex] = useState(0);
  // 0 = brand name text, 1 = logo image (if available)
  const brandFlips = logoUrl
    ? [{ type: "text" as const, label: brandName }, { type: "image" as const, src: logoUrl, alt: brandName }]
    : [{ type: "text" as const, label: brandName }];

  useEffect(() => {
    if (brandFlips.length <= 1) return;
    const interval = setInterval(() => {
      setBrandFlipIndex((prev) => (prev + 1) % brandFlips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [brandFlips.length]);

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      hidden ? "-translate-y-full" : "translate-y-0",
      headerConfig?.transparent && !scrolled
        ? "bg-transparent"
        : scrolled
          ? "bg-white/95 border-b border-neutral-200/80 backdrop-blur-heavy shadow-subtle"
          : "bg-white"
    )}>
      {/* Announcement Bar */}
      <AnimatePresence>
        {announcement && headerConfig?.announcementBar !== false && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-luxe-charcoal text-white overflow-hidden"
          >
            <div className="container-page py-2 text-center">
              <p className="text-[10px] tracking-[0.2em] uppercase text-white/90">
                {announcement.message as string}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          UPPER BAR — Brand flip + Utility icons (desktop only)
          ═══════════════════════════════════════════════════════════ */}
      <div className="hidden md:block border-b border-neutral-100">
        <div className="container-page">
          <div className="flex items-center justify-between h-12">
            {/* Left: Brand name / flip animation */}
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative h-8 w-28 flex items-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    {brandFlips[brandFlipIndex]?.type === "text" ? (
                      <motion.span
                        key="brand-text"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 flex items-center font-display text-lg tracking-[0.3em] text-neutral-900 whitespace-nowrap"
                      >
                        {brandName}
                      </motion.span>
                    ) : (
                      <motion.img
                        key="brand-logo"
                        src={brandFlips[brandFlipIndex]?.src}
                        alt={brandFlips[brandFlipIndex]?.alt}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 h-8 w-auto object-contain"
                      />
                    )}
                  </AnimatePresence>
                </div>
                {/* Flip indicator dots */}
                {brandFlips.length > 1 && (
                  <div className="flex gap-1 ml-1">
                    {brandFlips.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-1 h-1 rounded-full transition-all duration-500",
                          i === brandFlipIndex ? "bg-neutral-900 w-3" : "bg-neutral-300"
                        )}
                      />
                    ))}
                  </div>
                )}
              </Link>
            </div>

            {/* Right: Utility icons */}
            <div className="flex items-center gap-0.5">
              {headerConfig?.searchBar !== false && (
                <button onClick={openSearch} className="p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 rounded-xl" aria-label="Search">
                  <Search className="w-4 h-4" />
                </button>
              )}
              {headerConfig?.wishlistIcon !== false && (
                <Link to={isAuthenticated ? "/account/wishlist" : "/auth/login"} className="p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 rounded-xl" aria-label="Wishlist">
                  <Heart className="w-4 h-4" />
                </Link>
              )}
              <Link to={isAuthenticated ? "/account/notifications" : "/auth/login"} className="p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 rounded-xl relative" aria-label="Notifications">
                <Bell className="w-4 h-4" />
                {notifCount > 0 && (
                  <span className="absolute top-1.5 right-1 w-3.5 h-3.5 bg-brand-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center shadow-sm" aria-label={`${notifCount} unread notifications`}>
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
              {headerConfig?.accountIcon !== false && (
                <Link to={isAuthenticated ? "/account" : "/auth/login"} className="p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 rounded-xl" aria-label="Account">
                  <User className="w-4 h-4" />
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="px-3 py-1.5 ml-1 text-[9px] uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 rounded-xl font-medium border border-neutral-200">
                  Admin
                </Link>
              )}
              {headerConfig?.cartIcon !== false && (
                <button onClick={() => openCart()} className="relative p-2.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-all duration-300 rounded-xl" aria-label="Cart">
                  <ShoppingBag className="w-4 h-4" />
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      aria-live="polite"
                      aria-label={`${itemCount} items in cart`}
                      className="absolute top-1.5 right-1 w-3.5 h-3.5 bg-brand-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center shadow-sm"
                    >
                      {itemCount > 9 ? "9+" : itemCount}
                    </motion.span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          LOWER BAR — Navigation links (desktop) / Mobile single row
          ═══════════════════════════════════════════════════════════ */}
      <div className={cn(
        scrolled ? "border-b border-neutral-100/50" : ""
      )}>
        <div className="container-page">
          <div className="flex items-center justify-between md:h-12 h-16">
            {/* Mobile: hamburger + logo */}
            <div className="flex items-center gap-2 md:hidden min-w-0">
              <button onClick={toggleMobileMenu} className="p-3 -ml-1 text-neutral-700 hover:text-brand-500 active:scale-95 active:bg-neutral-100 rounded-lg transition-all duration-200 touch-manipulation no-tap-highlight" aria-label="Toggle menu">
                <Menu className="w-5 h-5" />
              </button>
              <Link to="/" className="block">
                {logoUrl ? (
                  <img src={logoUrl} alt={brandName} className="h-8 w-auto" />
                ) : (
                  <span className="font-display text-lg tracking-[0.3em] text-neutral-900">{brandName}</span>
                )}
              </Link>
            </div>

            {/* Desktop: Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleNavItems.slice(0, maxNavItems).map((menu, index) => {
                const hasChildren = (menu.children?.length ?? 0) > 0 || (menu.megaMenuColumns?.length ?? 0) > 0 || menu.type === "promotional";
                const isActive = activeMegaMenu === menu.label;
                return (
                  <div
                    key={`${menu.id || menu.label}-${index}`}
                    className="relative"
                    onMouseEnter={() => {
                      if (hasChildren) {
                        clearCloseTimer();
                        setActiveMegaMenu(menu.label);
                      }
                    }}
                    onMouseLeave={() => {
                      if (hasChildren) {
                        scheduleClose();
                      }
                    }}
                  >
                    <Link
                      to={menu.link || menu.url || "#"}
                      onClick={() => {
                        // Close mega menu on click — navigation proceeds normally
                        if (hasChildren) {
                          setActiveMegaMenu(null);
                        }
                      }}
                      className={cn(
                        "relative flex items-center gap-1.5 px-4 py-2 text-[10px] tracking-[0.2em] uppercase transition-all duration-300 font-medium rounded-lg group/nav",
                        isActive
                          ? "text-brand-600 bg-brand-50/50"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                      )}
                      aria-expanded={hasChildren ? isActive : undefined}
                      onFocus={() => {
                        if (hasChildren) {
                          clearCloseTimer();
                          setActiveMegaMenu(menu.label);
                        }
                      }}
                      onBlur={() => {
                        if (hasChildren) {
                          scheduleClose();
                        }
                      }}
                    >
                      {menu.label}
                      {hasChildren && <ChevronDown className={cn("w-3 h-3 transition-transform duration-300 opacity-40", isActive ? "rotate-180" : "")} />}
                      <span className={cn(
                        "absolute bottom-0 left-4 right-4 h-px bg-neutral-900 transition-transform duration-300 origin-left",
                        isActive ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
                      )} />
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* Mobile: search + cart icons */}
            <div className="flex items-center gap-0.5 md:hidden">
              {headerConfig?.searchBar !== false && (
                <button onClick={openSearch} className="p-3 text-neutral-500 hover:text-neutral-900 transition-all duration-300 rounded-lg touch-manipulation no-tap-highlight" aria-label="Search">
                  <Search className="w-5 h-5" />
                </button>
              )}
              {headerConfig?.cartIcon !== false && (
                <button onClick={() => openCart()} className="relative p-3 text-neutral-500 hover:text-neutral-900 transition-all duration-300 rounded-lg touch-manipulation no-tap-highlight" aria-label="Cart">
                  <ShoppingBag className="w-5 h-5" />
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1 w-4 h-4 bg-brand-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm"
                    >
                      {itemCount > 9 ? "9+" : itemCount}
                    </motion.span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mega Menu - below the header */}
      <AnimatePresence>
        {activeMegaMenu && (
          <motion.div
            ref={megaMenuRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="relative z-50"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <MegaMenu label={activeMegaMenu} menus={visibleNavItems as never} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
