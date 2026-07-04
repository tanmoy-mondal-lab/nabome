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
        className="text-center md:mb-20 mb-12"
      >
        <p className="md:text-[10px] md:tracking-[0.2em] md:uppercase md:text-neutral-400 editorial-caption md:mb-4 text-accent-gold mb-3">{section.subtitle || "Shop by Category"}</p>
        <h2 className="md:text-display-1 md:text-neutral-900 text-4xl md:text-5xl font-display text-neutral-900">{section.title || "Categories"}</h2>
      </motion.div>
      <div className={`grid grid-cols-2 ${gridCols} md:gap-12 gap-4`}>
        {categories.slice(0, columns === 5 ? 10 : columns === 2 ? 4 : columns === 3 ? 6 : 8).map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              to={`/categories/${cat.slug}`}
              className="group relative block aspect-square bg-neutral-100 overflow-hidden md:rounded-none rounded-sm"
            >
              {cat.imageUrl ? (
                <SafeImage
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-all duration-700 md:group-hover:scale-[1.03] group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                  <span className="text-neutral-400 text-4xl font-display">{cat.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 md:bg-gradient-to-t md:from-black/40 md:via-transparent md:to-transparent bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 md:p-8 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="md:text-[13px] md:font-normal md:text-white md:tracking-wide text-sm font-medium text-white drop-shadow-lg">{cat.name}</h3>
                {cat.productCount > 0 && (
                  <p className="md:text-[11px] md:text-white/50 text-[10px] text-white/70 mt-0.5">{cat.productCount} product{cat.productCount !== 1 ? "s" : ""}</p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
