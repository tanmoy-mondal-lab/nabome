import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { ProductGrid } from "../components/ProductGrid";

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface ProductGridSectionProps {
  section: SectionData;
}

export default function ProductGridSection({ section }: ProductGridSectionProps) {
  const content = section.content ?? {};
  const source = (content.source as string) ?? "featured";
  const limit = (content.limit as number) ?? 8;
  const isNew = source === "new";

  const endpoint = isNew ? "/api/products/new" : "/api/products/featured";

  const { data: res, isLoading: loading } = useQuery({
    queryKey: ["products", "section", endpoint, limit],
    queryFn: () => api.get<{ products: Record<string, unknown>[] }>(endpoint),
    staleTime: 1000 * 60 * 10,
  });

  const products = (res?.products ?? []).slice(0, limit);

  if (loading) {
    return (
      <section className="container-wide section-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  const title = section.title || (isNew ? "New Arrivals" : "Featured Products");
  const caption = isNew ? "Fresh Arrivals" : "Curated Selection";
  const sortParam = isNew ? "newest" : "featured";
  const subtitle = section.subtitle || (isNew ? "This week's most anticipated drops." : "The finest pieces handpicked for the season.");

  if (isNew) {
    return (
      <section className="luxe-gradient bg-neutral-950 section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="editorial-caption text-accent-gold mb-3">{caption}</p>
              <h2 className="text-4xl md:text-5xl font-display text-white leading-tight">{title}</h2>
              {subtitle && (
                <p className="text-neutral-400 font-editorial text-lg mt-3 max-w-lg">{subtitle}</p>
              )}
            </div>
            <Link
              to={`/products?sort=${sortParam}`}
              className="btn-outline border-white/30 text-white hover:bg-white hover:text-neutral-900 hidden md:inline-flex"
            >
              View All
            </Link>
          </motion.div>
          <ProductGrid products={products} columns={4} />
          <div className="mt-8 text-center md:hidden">
            <Link
              to={`/products?sort=${sortParam}`}
              className="btn-outline border-white/30 text-white hover:bg-white hover:text-neutral-900"
            >
              View All
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-wide section-padding">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="editorial-caption text-accent-gold mb-3">{caption}</p>
          <h2 className="text-4xl md:text-5xl font-display text-neutral-900 leading-tight">{title}</h2>
          {subtitle && (
            <p className="editorial-lead mt-3 max-w-lg">{subtitle}</p>
          )}
        </div>
        <Link
          to={`/products?sort=${sortParam}`}
          className="btn-outline hidden md:inline-flex"
        >
          View All
        </Link>
      </motion.div>
      <ProductGrid products={products} columns={4} />
      <div className="mt-8 text-center md:hidden">
        <Link to={`/products?sort=${sortParam}`} className="btn-outline">
          View All
        </Link>
      </div>
    </section>
  );
}
