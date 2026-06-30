import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Heart, User, Package } from "lucide-react";
import { useUIStore } from "../stores/ui-store";
import { useAuthStore } from "../../stores/auth-store";
import { useSettings } from "../hooks/useSettings";
import { useNavigation } from "../hooks/useNavigation";
import { cn } from "../../lib/utils/cn";

export function MobileNav() {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const { data: navItems = [] } = useNavigation("mobile");
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpanded((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  };

  return (
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={closeMobileMenu} />
          <motion.aside
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-80 bg-white shadow-elevated"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-100">
              <span className="font-display text-xl tracking-widest">{settings?.siteName || "নবME"}</span>
              <button onClick={closeMobileMenu} className="p-1 hover:text-neutral-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <nav className="p-6 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
              {navItems.map((menu) => {
                const hasChildren = (menu.children?.length ?? 0) > 0;
                const open = expanded.includes(menu.label);
                return (
                  <div key={menu.label}>
                    {hasChildren ? (
                      <>
                        <button onClick={() => toggleExpand(menu.label)} aria-expanded={open} className="flex items-center justify-between w-full px-4 py-3 text-sm text-neutral-700 hover:text-brand-500 tracking-fashion">
                          {menu.label}
                          <ChevronRight className={cn("w-4 h-4 text-neutral-400 transition-transform", open && "rotate-90")} />
                        </button>
                        <AnimatePresence>
                          {open && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="ml-4 space-y-1 pb-2">
                                {(menu.children ?? []).map((child) => (
                                  <Link key={child.label} to={(child.link || child.url) as string || "#"} onClick={closeMobileMenu} className="block px-4 py-2 text-sm text-neutral-500 hover:text-brand-500 tracking-fashion">
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link to={(menu.link || menu.url) as string || "#"} onClick={closeMobileMenu} className="block px-4 py-3 text-sm text-neutral-700 hover:text-brand-500 tracking-fashion">
                        {menu.label}
                      </Link>
                    )}
                  </div>
                );
              })}

              <div className="divider my-6" />

              <div className="space-y-1">
                <Link to={isAuthenticated ? "/account" : "/auth/login"} onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:text-brand-500 tracking-fashion">
                  <User className="w-4 h-4" /> My Account
                </Link>
                <Link to={isAuthenticated ? "/account/wishlist" : "/auth/login"} onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:text-brand-500 tracking-fashion">
                  <Heart className="w-4 h-4" /> Wishlist
                </Link>
                <Link to="/cart" onClick={closeMobileMenu} className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:text-brand-500 tracking-fashion">
                  <Package className="w-4 h-4" /> Cart
                </Link>
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
