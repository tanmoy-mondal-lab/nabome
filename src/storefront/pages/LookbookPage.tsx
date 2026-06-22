import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../../lib/api/client";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { SafeImage } from "../../components/SafeImage";

export default function LookbookPage() {
  const [lookbooks, setLookbooks] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/lookbooks", { params: { action: "list" } })
      .then((res) => setLookbooks((res as Record<string, unknown>).lookbooks as Record<string, unknown>[] ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-page py-8">
      <Breadcrumbs items={[{ label: "Lookbooks" }]} className="mb-6" />
      <h1 className="text-3xl md:text-4xl font-display text-neutral-900 mb-2">Lookbooks</h1>
      <p className="text-sm text-neutral-500 mb-10">Curated fashion stories and seasonal collections</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[4/5] bg-neutral-100 animate-pulse rounded" />)}
        </div>
      ) : lookbooks.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-20">No lookbooks yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lookbooks.map((lb, i) => {
            const items = (lb.items as Record<string, unknown>[]) ?? [];
            const cover = items.find((it) => it.type === "image")?.imageUrl as string || items[0]?.imageUrl as string;
            const season = lb.season as string;
            const year = lb.year as number;
            return (
              <motion.div key={lb.id as string} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Link to={`/lookbooks/${lb.slug}`} className="group block">
                  <div className="aspect-[4/5] bg-neutral-100 overflow-hidden relative">
                    {cover && <SafeImage src={cover} alt={lb.title as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {season && <p className="text-accent-gold text-xs tracking-[0.2em] uppercase mb-2">{season}{year ? ` ${year}` : ""}</p>}
                      <h2 className="text-2xl font-display text-white">{lb.title as string}</h2>
                      {!!lb.description && <p className="text-sm text-neutral-300 mt-2 line-clamp-2">{lb.description as string}</p>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
