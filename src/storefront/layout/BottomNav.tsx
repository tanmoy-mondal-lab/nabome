import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "../stores/cart-store";
import { useAuthStore } from "../../stores/auth-store";
import { cn } from "../../lib/utils/cn";

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
    const needsAuth = href === "/account" || href === "/account/wishlist";
    if (needsAuth && !isAuthenticated) {
      navigate("/auth/login", { state: { from: href } });
      return;
    }
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200 pb-safe">
      <div className="flex items-center justify-around h-14">
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
                "flex flex-col items-center justify-center gap-0.5 relative h-full px-3 transition-colors duration-200",
                isActive ? "text-brand-500" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {showCount && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-brand-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wider font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
