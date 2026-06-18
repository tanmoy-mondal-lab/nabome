import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../lib/api/client";
import { useUIStore } from "../stores/ui-store";
import { cn } from "../../lib/utils/cn";

interface NavItem {
  id: string;
  label: string;
  url?: string;
  type?: string;
  children?: NavItem[];
  image?: string;
  description?: string;
}

export function MegaMenu({ label, menus: propMenus }: { label: string; menus?: NavItem[] }) {
  const { setActiveMegaMenu } = useUIStore();
  const [menus, setMenus] = useState<NavItem[]>(propMenus ?? []);

  useEffect(() => {
    if (propMenus && propMenus.length > 0) {
      setMenus(propMenus);
      return;
    }
    api.get<{ menus: NavItem[] }>("/api/cms", { params: { action: "navigation" } })
      .then((res) => setMenus(res.menus ?? []))
      .catch(() => {});
  }, [propMenus]);

  const activeItem = menus.find((m) => m.label === label);
  if (!activeItem) return null;

  // Split children: first 4 cols go to links, rest to featured
  const linkColumns = activeItem.children?.slice(0, 4) ?? [];
  const featuredItems = activeItem.children?.slice(4, 6) ?? [];
  const hasBanner = activeItem.image || featuredItems.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/20" onClick={() => setActiveMegaMenu(null)}
      />
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 right-0 top-full z-50 bg-white border-t border-neutral-100 shadow-menu"
        onMouseLeave={() => setActiveMegaMenu(null)}
      >
        <div className="container-wide py-12">
          <div className="grid grid-cols-12 gap-8">
            {/* Link columns */}
            {linkColumns.map((col, i) => (
              <div key={i} className={cn("col-span-2", !hasBanner && "col-span-3")}>
                {col.url ? (
                  <Link to={col.url} onClick={() => setActiveMegaMenu(null)}
                    className="block text-xs uppercase tracking-[0.15em] text-neutral-900 font-medium mb-5 hover:text-brand-500 transition-colors"
                  >
                    {col.label}
                  </Link>
                ) : (
                  <p className="text-xs uppercase tracking-[0.15em] text-neutral-900 font-medium mb-5">{col.label}</p>
                )}
                {col.children && (
                  <ul className="space-y-3">
                    {col.children.map((child, j) => (
                      <li key={j}>
                        <Link to={child.url || "#"} onClick={() => setActiveMegaMenu(null)}
                          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                        >
                          {child.label}
                        </Link>
                        {child.description && (
                          <p className="text-xs text-neutral-400 mt-0.5">{child.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Featured banner */}
            {hasBanner && (
              <div className="col-span-4">
                {activeItem.image && (
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden group cursor-pointer mb-4"
                    onClick={() => { if (activeItem.url) window.location.href = activeItem.url; setActiveMegaMenu(null); }}
                  >
                    <img src={activeItem.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white text-xs tracking-[0.15em] uppercase font-medium">Featured</p>
                      <p className="text-white/70 text-sm mt-1">{activeItem.description || "Discover the collection"}</p>
                    </div>
                  </div>
                )}
                {featuredItems.map((item, i) => (
                  <Link key={i} to={item.url || "#"} onClick={() => setActiveMegaMenu(null)}
                    className="flex items-center gap-3 py-2.5 border-t border-neutral-50 hover:bg-neutral-50/50 -mx-4 px-4 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                      {item.description && <p className="text-xs text-neutral-400">{item.description}</p>}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-brand-500">Shop</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-50 bg-luxe-ivory/50">
          <div className="container-wide py-3 flex items-center justify-between">
            <p className="text-xs text-neutral-400 tracking-wider">
              Free shipping on orders above ₹999 · Easy 30-day returns · Secure checkout
            </p>
            <span className="text-[10px] text-accent-gold tracking-widest uppercase">New Season Now Available</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}
