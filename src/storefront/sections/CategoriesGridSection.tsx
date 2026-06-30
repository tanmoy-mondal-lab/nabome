import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { SafeImage } from "../../components/SafeImage";

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface CategoriesGridSectionProps {
  section: SectionData;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
}

export default function CategoriesGridSection({ section }: CategoriesGridSectionProps) {
  const content = section.content ?? {};
  const columns = (content.columns as number) ?? 4;

  const { data: res, isLoading: loading } = useQuery({
    queryKey: ["categories", "grid"],
    queryFn: () => api.get<{ categories: CategoryItem[] }>("/api/categories"),
    staleTime: 1000 * 60 * 10,
  });

  const categories = res?.categories ?? [];

  if (loading) {
    return (
      <section className="container-wide section-padding">
        <div className={`grid grid-cols-2 ${columns === 2 ? "md:grid-cols-2" : columns === 3 ? "md:grid-cols-3" : "md:grid-cols-4"} gap-4 md:gap-6`}>
          {Array.from({ length: Math.min(categories.length || columns, 4) }).map((_, i) => (
            <div key={i} className="aspect-square bg-neutral-100 animate-pulse rounded-sm" />
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  const gridCols =
    columns === 2 ? "md:grid-cols-2" : columns === 3 ? "md:grid-cols-3" : columns === 5 ? "md:grid-cols-5" : "md:grid-cols-4";

  return (
    <section className="container-wide section-padding">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <p className="editorial-caption text-accent-gold mb-3">{section.subtitle || "Shop by Category"}</p>
        <h2 className="text-4xl md:text-5xl font-display text-neutral-900">{section.title || "Categories"}</h2>
      </motion.div>
      <div className={`grid grid-cols-2 ${gridCols} gap-4 md:gap-6`}>
        {categories.slice(0, columns === 5 ? 10 : columns === 2 ? 4 : columns === 3 ? 6 : 8).map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              to={`/products?category=${cat.slug}`}
              className="group relative block aspect-square bg-neutral-100 overflow-hidden rounded-sm"
            >
              {cat.imageUrl ? (
                <SafeImage
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                  <span className="text-neutral-400 text-4xl font-display">{cat.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-sm font-medium text-white drop-shadow-lg">{cat.name}</h3>
                {cat.productCount > 0 && (
                  <p className="text-[10px] text-white/70 mt-0.5">{cat.productCount} product{cat.productCount !== 1 ? "s" : ""}</p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
