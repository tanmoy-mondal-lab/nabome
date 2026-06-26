import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api/client";
import { SafeImage } from "../../components/SafeImage";

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface CollectionGridSectionProps {
  section: SectionData;
}

export default function CollectionGridSection({ section }: CollectionGridSectionProps) {
  const content = section.content ?? {};
  const limit = (content.limit as number) ?? 3;

  const [collections, setCollections] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ collections: Record<string, unknown>[] }>("/api/collections", { params: { action: "list" } })
      .then((res) => {
        setCollections((res.collections ?? []).slice(0, limit));
      })
      .catch(() => setCollections([]))
      .finally(() => setLoading(false));
  }, [limit]);

  if (loading) {
    return (
      <section className="container-wide section-padding">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
        </div>
      </section>
    );
  }

  if (collections.length === 0) return null;

  const title = section.title || "Shop by Collection";
  const gridCols =
    limit === 2 ? "md:grid-cols-2" : limit === 4 ? "md:grid-cols-4" : "md:grid-cols-3";

  return (
    <section className="container-wide section-padding">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="text-center mb-14"
      >
        <p className="editorial-caption text-accent-gold mb-3">{section.subtitle || "Curated Worlds"}</p>
        <h2 className="text-4xl md:text-5xl font-display text-neutral-900">{title}</h2>
      </motion.div>
      <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
        {collections.map((col, i) => {
          const image = (col.heroImageUrl as string) || "";
          return (
            <motion.div
              key={col.id as string}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <Link
                to={`/collections/${col.slug}`}
                className="group relative block aspect-[3/4] bg-neutral-100 overflow-hidden rounded-sm"
              >
                {image && (
                  <SafeImage
                    src={image}
                    alt={col.name as string}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7 transform transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-2xl font-display text-white mb-1">{col.name as string}</h3>
                  <p className="editorial-caption text-neutral-400 mb-2">
                    {(col.description as string) || ""}
                  </p>
                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    View Collection →
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
