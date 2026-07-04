import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";
import { cn } from "../../lib/utils/cn";
import { hapticMedium } from "../../lib/utils/haptic";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/products", icon: Search, label: "Browse" },
  { href: "/account/wishlist", icon: Heart, label: "Wishlist" },
  { href: "/cart", icon: ShoppingBag, label: "Cart", showCount: true },
  { href: "/account", icon: User, label: "Account" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  function handleNavClick(href: string) {
    hapticMedium();
    const needsAuth = href === "/account" || href === "/account/wishlist";
    if (needsAuth && !isAuthenticated) {
      navigate("/auth/login", { state: { from: href } });
      return;
    }
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-premium border-t border-neutral-100/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-[60px] px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, showCount }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          const needsAuth = href === "/account" || href === "/account/wishlist";
          const displayHref = needsAuth && !isAuthenticated ? "/auth/login" : href;
          return (
            <Link
              key={href}
              to={displayHref}
              onClick={() => handleNavClick(href)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 relative h-full px-4 transition-all duration-300",
                isActive ? "text-brand-600" : "text-neutral-400 active:text-neutral-600"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-[22px] h-[22px] transition-all duration-300", isActive && "stroke-[2.5px]")} />
                {showCount && itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] bg-brand-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-md">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] tracking-[0.08em] font-medium transition-all duration-300", isActive && "font-semibold")}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-brand-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
