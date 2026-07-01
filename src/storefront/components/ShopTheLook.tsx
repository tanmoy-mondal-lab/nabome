import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";
import { SafeImage } from "../../components/SafeImage";

interface Hotspot {
  x: number;
  y: number;
  product: Record<string, unknown>;
}

interface ShopTheLookProps {
  image: string;
  hotspots: Hotspot[];
  title?: string;
}

export function ShopTheLook({ image, hotspots, title }: ShopTheLookProps) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="relative">
      {title && <h3 className="text-lg font-display text-neutral-900 mb-4">{title}</h3>}
      <div className="relative">
        <SafeImage src={image} alt={title || "Shop the look"} className="w-full object-cover" />
        {hotspots.map((h, i) => (
          <div
            key={i}
            className="absolute cursor-pointer"
            style={{ left: `${h.x}%`, top: `${h.y}%`, transform: "translate(-50%, -50%)" }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={() => setActive(active === i ? null : i)}
            onTouchStart={() => setActive(active === i ? null : i)}
            role="button"
            tabIndex={0}
            aria-label={`View product: ${h.product.name}`}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActive(active === i ? null : i); }}
          >
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <span className="text-xs font-bold" aria-hidden="true">+</span>
            </div>
            <AnimatePresence>
              {active === i && (
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }} animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
                  className="absolute left-1/2 -translate-x-1/2 top-10 w-56 bg-white shadow-xl rounded p-3 z-10"
                >
                  <div className="flex gap-3">
                    <SafeImage src={((h.product.images as { url: string }[])?.[0]?.url) || "/placeholder.svg"} alt={h.product.name as string || "Product"} className="w-16 h-20 object-cover bg-neutral-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-neutral-900 truncate">{h.product.name as string}</p>
                      <PriceDisplay price={Number(h.product.basePrice ?? 0)} compareAtPrice={h.product.compareAtPrice ? Number(h.product.compareAtPrice) : null} size="sm" className="mt-1" />
                      <Link to={`/products/${h.product.slug}`} className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-600 mt-2 hover:underline">
                        <ShoppingBag className="w-3 h-3" /> Shop Now
                      </Link>
                    </div>
                  </div>
                  <button onClick={() => setActive(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-900 text-white rounded-full flex items-center justify-center" aria-label="Close">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
