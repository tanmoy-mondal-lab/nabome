import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ChevronRight, Heart, User, ShoppingBag, Instagram } from "lucide-react";
import { useUIStore } from "../stores/ui-store";
import { useAuthStore } from "../../stores/auth-store";
import { useSettings } from "../hooks/useSettings";
import { useNavigation, type NavigationItem } from "../hooks/useNavigation";
import { cn } from "../../lib/utils/cn";
import { useFocusTrap } from "../../hooks/useFocusTrap";

export function MobileNav() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const [expanded, setExpanded] = useState<string[]>([]);
  const navRef = useFocusTrap<HTMLElement>(isMobileMenuOpen, closeMobileMenu);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const { data: navItems = [] } = useNavigation("mobile");
  const visibleNavItems = (navItems ?? []).filter((item) => item.isVisible !== false);

  const toggleExpand = (label: string) => {
    setExpanded((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          <motion.aside
            ref={navRef}
            initial={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: "-100%" }}
            transition={prefersReducedMotion ? { duration: 0.2 } : { type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-[360px] bg-luxe-charcoal shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/10">
              <span className="font-display text-2xl tracking-[0.2em] text-white">
                {settings?.siteName || "নবME"}
              </span>
              <button
                onClick={closeMobileMenu}
                aria-label="Close mobile navigation"
                className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-6 overflow-y-auto h-[calc(100vh-4rem)]">
              <div className="space-y-2">
                {visibleNavItems.map((menu, index) => {
                  const hasChildren = (menu.children?.length ?? 0) > 0;
                  const hasMegaColumns = (menu.megaMenuColumns?.length ?? 0) > 0;
                  const hasPromo = menu.type === "promotional" && !!menu.promotionalContent;
                  const isExpandable = hasChildren || hasMegaColumns || hasPromo;
                  const open = expanded.includes(menu.label);
                  return (
                    <motion.div
                      key={menu.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {isExpandable ? (
                        <>
                          <button
                            onClick={() => toggleExpand(menu.label)}
                            aria-expanded={open}
                            className="flex items-center justify-between w-full px-4 py-4 text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                          >
                            <span className="font-display text-2xl tracking-wide">{menu.label}</span>
                            <ChevronRight className={cn("w-5 h-5 text-white/40 transition-transform duration-300", open && "rotate-90")} />
                          </button>
                          <AnimatePresence>
                            {open && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-4 space-y-1 pb-4">
                                  {/* Promotional content */}
                                  {hasPromo && menu.promotionalContent && (
                                    <div className="px-4 py-3 space-y-2">
                                      {menu.promotionalContent.title && (
                                        <p className="text-white/90 text-sm font-medium">{menu.promotionalContent.title}</p>
                                      )}
                                      {menu.promotionalContent.description && (
                                        <p className="text-white/50 text-xs">{menu.promotionalContent.description}</p>
                                      )}
                                      {menu.promotionalContent.linkUrl && (
                                        <Link
                                          to={menu.promotionalContent.linkUrl}
                                          onClick={closeMobileMenu}
                                          className="inline-block text-brand-400 text-xs font-medium hover:text-brand-300"
                                        >
                                          {menu.promotionalContent.linkText || "Shop Now"} →
                                        </Link>
                                      )}
                                    </div>
                                  )}

                                  {/* Mega menu columns */}
                                  {hasMegaColumns && menu.megaMenuColumns?.map((col) => (
                                    <div key={col.id} className="space-y-1">
                                      {col.title && (
                                        <p className="px-4 py-1 text-white/40 text-[10px] uppercase tracking-wider font-medium">{col.title}</p>
                                      )}
                                      {col.items.map((colItem, i) => {
                                        const itemUrl = colItem.url;
                                        if (!itemUrl) return null;
                                        return (
                                          <Link
                                            key={i}
                                            to={itemUrl}
                                            onClick={closeMobileMenu}
                                            className="block px-4 py-2 text-white/60 hover:text-white text-sm tracking-wide transition-colors rounded-lg hover:bg-white/5"
                                          >
                                            {colItem.label}
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  ))}

                                  {/* Regular children */}
                                  {hasChildren && (menu.children ?? []).map((child) => {
                                    const childUrl = (child.link || child.url) as string;
                                    if (!childUrl) return null;
                                    return (
                                      <Link
                                        key={child.label}
                                        to={childUrl}
                                        onClick={closeMobileMenu}
                                        className="block px-4 py-2.5 text-white/60 hover:text-white text-sm tracking-wide transition-colors rounded-lg hover:bg-white/5"
                                      >
                                        {child.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        (menu.link || menu.url) ? (
                          <Link
                            to={(menu.link || menu.url) as string}
                            onClick={closeMobileMenu}
                            className="block px-4 py-4 text-white/90 hover:text-white font-display text-2xl tracking-wide hover:bg-white/5 rounded-lg transition-all duration-200"
                          >
                            {menu.label}
                          </Link>
                        ) : (
                          <span className="block px-4 py-4 text-white/40 font-display text-2xl tracking-wide cursor-default">
                            {menu.label}
                          </span>
                        )
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="my-8 border-t border-white/10" />

              <div className="space-y-1">
                <Link
                  to={isAuthenticated ? "/account" : "/auth/login"}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm tracking-wide">{isAuthenticated ? "My Account" : "Sign In"}</span>
                </Link>
                <Link
                  to={isAuthenticated ? "/account/wishlist" : "/auth/login"}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm tracking-wide">Wishlist</span>
                </Link>
                <Link
                  to="/cart"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-4 px-4 py-3.5 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-sm tracking-wide">Cart</span>
                </Link>
              </div>

              <div className="mt-8 px-4">
                <p className="text-white/40 text-xs tracking-wider uppercase mb-3">Follow Us</p>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all duration-200"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
