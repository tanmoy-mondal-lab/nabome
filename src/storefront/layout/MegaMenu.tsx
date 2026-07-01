import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUIStore } from "../stores/ui-store";
import { useSettings } from "../hooks/useSettings";
import { cn } from "../../lib/utils/cn";
import { SafeImage } from "../../components/SafeImage";

export interface NavItem {
  id: string;
  label: string;
  link?: string;
  url?: string;
  type?: string;
  image?: string;
  description?: string;
  children?: NavItem[];
  megaMenuColumns?: {
    id: string;
    title: string;
    items: { label: string; url: string; description?: string; image?: string }[];
  }[];
  promotionalContent?: {
    title: string;
    description: string;
    image: string;
    linkUrl: string;
    linkText: string;
  };
}

export function MegaMenu({ label, menus }: { label: string; menus?: NavItem[] }) {
  const { setActiveMegaMenu } = useUIStore();
  const { data: settings } = useSettings();
  const navigate = useNavigate();

  const activeItem = menus?.find((m) => m.label === label);
  if (!activeItem) return null;

  const hasMegaColumns = activeItem.type === "mega_menu" && (activeItem.megaMenuColumns?.length ?? 0) > 0;
  const hasChildren = (activeItem.children?.length ?? 0) > 0;
  const hasBanner = !!(activeItem.image || activeItem.promotionalContent);

  return (
    <div
      className="w-full bg-white border-t border-neutral-100 shadow-menu"
      onMouseLeave={() => setActiveMegaMenu(null)}
    >
      <div className="container-wide py-10">
        {activeItem.type === "promotional" && activeItem.promotionalContent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {activeItem.promotionalContent.image && (
              <div className="relative aspect-[16/9] bg-neutral-100 overflow-hidden rounded-2xl group">
                <SafeImage src={activeItem.promotionalContent.image} alt={activeItem.promotionalContent.title || "Promotional banner"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            )}
            <div>
              <h3 className="font-display text-2xl text-neutral-900 mb-3">{activeItem.promotionalContent.title}</h3>
              <p className="text-neutral-500 text-sm leading-relaxed mb-6">{activeItem.promotionalContent.description}</p>
              {activeItem.promotionalContent.linkUrl && (
                <Link to={activeItem.promotionalContent.linkUrl} onClick={() => setActiveMegaMenu(null)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
                >
                  {activeItem.promotionalContent.linkText || "Shop Now"} →
                </Link>
              )}
            </div>
          </div>
        ) : hasMegaColumns ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {activeItem.megaMenuColumns?.map((col) => (
              <div key={col.id || col.title}>
                {col.title && (
                  <p className="text-xs uppercase tracking-[0.15em] text-neutral-900 font-medium mb-5">{col.title}</p>
                )}
                {col.items.length > 0 && (
                  <ul className="space-y-3">
                    {col.items.map((item, i) => (
                      <li key={i}>
                        {item.url ? (
                          <Link to={item.url} onClick={() => setActiveMegaMenu(null)}
                            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                          >
                            {item.label}
                          </Link>
                        ) : (
                          <span className="text-sm text-neutral-500 cursor-default">{item.label}</span>
                        )}
                        {item.description && (
                          <p className="text-xs text-neutral-400 mt-0.5">{item.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {activeItem.image && (
              <div className="col-span-1 row-span-2">
                <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden rounded-2xl group cursor-pointer"
                  onClick={() => { const u = activeItem.link || activeItem.url; if (u) navigate(u); setActiveMegaMenu(null); }}
                >
                  <SafeImage src={activeItem.image} alt={activeItem.description || "Featured collection"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white text-xs tracking-[0.15em] uppercase font-medium">Featured</p>
                    {activeItem.description && <p className="text-white/70 text-sm mt-1">{activeItem.description}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : hasChildren ? (
          <div className="grid grid-cols-12 gap-8">
            {(activeItem.children ?? []).slice(0, 4).map((col, i) => (
              <div key={`${col.id || col.label}-${i}`} className={cn("col-span-2", !hasBanner && "col-span-3")}>
                {col.link || col.url ? (
                  <Link to={(col.link || col.url) as string} onClick={() => setActiveMegaMenu(null)}
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
                      <li key={`${child.id || child.label}-${j}`}>
                        {(child.link || child.url) ? (
                          <Link to={(child.link || child.url) as string} onClick={() => setActiveMegaMenu(null)}
                            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                          >
                            {child.label}
                          </Link>
                        ) : (
                          <span className="text-sm text-neutral-500 cursor-default">{child.label}</span>
                        )}
                        {child.description && (
                          <p className="text-xs text-neutral-400 mt-0.5">{child.description}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {(col.link || col.url) && (
                  <Link to={(col.link || col.url) as string} onClick={() => setActiveMegaMenu(null)}
                    className="inline-block mt-4 text-[10px] uppercase tracking-[0.15em] text-brand-500 hover:text-brand-600 font-medium transition-colors"
                  >
                    View All {col.label} →
                  </Link>
                )}
              </div>
            ))}

            {hasBanner && (
              <div className="col-span-4">
                {activeItem.image && (
                  <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden group cursor-pointer mb-4"
                    onClick={() => { const u = activeItem.link || activeItem.url; if (u) navigate(u); setActiveMegaMenu(null); }}
                  >
                    <SafeImage src={activeItem.image} alt={activeItem.description || "Featured collection"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white text-xs tracking-[0.15em] uppercase font-medium">Featured</p>
                      <p className="text-white/70 text-sm mt-1">{activeItem.description || "Discover the collection"}</p>
                    </div>
                  </div>
                )}
                {(activeItem.children ?? []).slice(4, 6).map((item, i) => {
                  const itemUrl = (item.link || item.url) as string;
                  if (!itemUrl) return null;
                  return (
                    <Link key={`${item.id || item.label}-${i}`} to={itemUrl} onClick={() => setActiveMegaMenu(null)}
                      className="flex items-center gap-3 py-2.5 border-t border-neutral-50 hover:bg-neutral-50/50 -mx-4 px-4 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900">{item.label}</p>
                        {item.description && <p className="text-xs text-neutral-400">{item.description}</p>}
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-brand-500">Shop</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="border-t border-neutral-50 bg-luxe-ivory/50">
        <div className="container-wide py-3 flex items-center justify-between">
          <p className="text-xs text-neutral-400 tracking-wider">
            {(settings?.preferences as Record<string, unknown>)?.promoText as string || "Free shipping on orders above ₹999 · Easy 30-day returns · Secure checkout"}
          </p>
          <span className="text-[10px] text-accent-gold tracking-widest uppercase">{(settings?.preferences as Record<string, unknown>)?.promoTagline as string || "New Season Now Available"}</span>
        </div>
      </div>
    </div>
  );
}
