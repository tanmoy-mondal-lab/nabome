import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { ProductGrid } from "../components/ProductGrid";
import type { Product } from "../../types/product";

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface NewArrivalsSectionProps {
  section: SectionData;
}

export default function NewArrivalsSection({ section }: NewArrivalsSectionProps) {
  const content = section.content ?? {};
  const limit = (content.limit as number) ?? 8;

  const { data: res, isLoading: loading } = useQuery({
    queryKey: ["products", "new-arrivals", limit],
    queryFn: () => api.get<{ products: Product[] }>("/api/products/new"),
    staleTime: 1000 * 60 * 10,
  });

  const products = (res?.products ?? []).slice(0, limit);

  if (loading) {
    return (
      <section className="container-wide section-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: Math.min(limit, 4) }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="md:bg-white bg-neutral-950 section-padding">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="md:flex md:items-end md:justify-between md:mb-20 mb-12"
        >
          <div>
            {/* Desktop: quiet caption */}
            <p className="md:text-[10px] md:tracking-[0.2em] md:uppercase md:text-neutral-400 editorial-caption md:mb-4 text-accent-gold mb-3">Fresh Arrivals</p>
            <h2 className="md:text-display-1 md:text-neutral-900 md:leading-tight text-4xl md:text-5xl font-display text-white leading-tight">
              {section.title || "New Arrivals"}
            </h2>
            {section.subtitle && (
              <p className="md:text-neutral-500 md:font-body md:text-base text-neutral-400 font-editorial text-lg mt-3 max-w-lg">{section.subtitle}</p>
            )}
          </div>
          {/* Desktop: text link */}
          <Link
            to="/products?sort=newest"
            className="md:text-[11px] md:tracking-[0.2em] md:uppercase md:text-neutral-500 md:hover:text-neutral-900 md:transition-colors md:duration-300 md:inline-flex md:items-center md:gap-2 btn-outline border-white/30 text-white hover:bg-white hover:text-neutral-900 hidden md:inline-flex"
          >
            View All
            <span>&rarr;</span>
          </Link>
        </motion.div>
        <div className="md:text-inherit [&_.text-neutral-900]:text-white md:[&_.text-neutral-900]:text-neutral-900 [&_.text-neutral-500]:text-neutral-400 md:[&_.text-neutral-500]:text-neutral-500 [&_.text-neutral-400]:text-neutral-500 md:[&_.text-neutral-400]:text-neutral-400">
          <ProductGrid products={products} columns={4} />
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/products?sort=newest"
            className="btn-outline border-white/30 text-white hover:bg-white hover:text-neutral-900"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
