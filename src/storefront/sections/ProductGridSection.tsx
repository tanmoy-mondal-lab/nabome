import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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

  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const endpoint = isNew ? "/api/products/new" : "/api/products/featured";
    api.get<{ products: Record<string, unknown>[] }>(endpoint)
      .then((res) => {
        const all = res.products ?? [];
        setProducts(all.slice(0, limit));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [source, limit, isNew]);

  if (loading) {
    return (
      <section className="container-wide section-padding">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
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
