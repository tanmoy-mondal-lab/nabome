import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../lib/api/client";
import { ProductCard } from "./ProductCard";
import { getRecentlyViewed, clearRecentlyViewed } from "../lib/recommendations";

export function RecentlyViewed() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slugs = getRecentlyViewed().slice(0, 8);

  useEffect(() => {
    if (!slugs.length) return;
    Promise.all(slugs.map((s) => api.get("/api/products", { params: { action: "detail", slug: s } })
      .then((res) => (res as Record<string, unknown>).product as Record<string, unknown>)
      .catch(() => null)))
      .then((results) => setProducts(results.filter(Boolean) as Record<string, unknown>[]));
  }, []);

  if (!products.length) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="w-5 h-5 text-neutral-400" />
          <h2 className="text-xl md:text-2xl font-display text-neutral-900">Recently Viewed</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-1">
            <button onClick={() => scroll("left")} className="w-8 h-8 border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll("right")} className="w-8 h-8 border border-neutral-200 rounded-full flex items-center justify-center hover:bg-neutral-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={clearRecentlyViewed} className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors underline">
            Clear
          </button>
          <Link to="/products" className="text-xs text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 snap-x snap-mandatory"
      >
        {products.slice(0, 8).map((p) => (
          <div key={p.id as string} className="snap-start shrink-0 w-[40vw] md:w-[15vw] min-w-[160px] max-w-[220px]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}
