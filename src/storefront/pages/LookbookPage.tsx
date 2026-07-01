import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "../../lib/api/client";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { SafeImage } from "../../components/SafeImage";
import { Helmet } from "react-helmet-async";
import { canonical } from "../../lib/seo";

export default function LookbookPage() {
  const { data: res, isLoading: loading, isError } = useQuery({
    queryKey: ["lookbooks"],
    queryFn: () => api.get<{ lookbooks: Record<string, unknown>[] }>("/api/lookbooks", { params: { action: "list" } }),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const lookbooks = res?.lookbooks ?? [];

  return (
    <div className="container-page py-8">
      <Helmet>
        <title>Lookbooks — নবME</title>
        <meta name="description" content="Browse our curated lookbooks on নবME." />
        <link rel="canonical" href={canonical("/lookbooks")} />
        <meta property="og:title" content="Lookbooks — নবME" />
        <meta property="og:description" content="Browse our curated lookbooks on নবME." />
      </Helmet>
      <Breadcrumbs items={[{ label: "Lookbooks" }]} className="mb-6" />
      <h1 className="text-3xl md:text-4xl font-display text-neutral-900 mb-2">Lookbooks</h1>
      <p className="text-sm text-neutral-500 mb-10">Curated fashion stories and seasonal collections</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[4/5] bg-neutral-100 animate-pulse rounded" />)}
        </div>
      ) : isError ? (
        <div className="text-center py-20">
          <p className="text-sm text-neutral-500 mb-3">Failed to load lookbooks.</p>
          <button onClick={() => window.location.reload()} className="text-xs text-brand-500 hover:underline uppercase tracking-widest">Retry</button>
        </div>
      ) : lookbooks.length === 0 ? (
        <p className="text-sm text-neutral-400 text-center py-20">No lookbooks yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {lookbooks.map((lb) => (
            <Link key={lb.id as string} to={`/lookbooks/${lb.slug as string}`}>
              <motion.div whileHover={{ y: -4 }} className="group cursor-pointer">
                <div className="aspect-[4/5] bg-neutral-100 rounded overflow-hidden mb-4 relative">
                  <SafeImage src={(lb.coverImageUrl as string) || "/placeholder.svg"} alt={lb.name as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" useTransform={false} />
                </div>
                <p className="text-accent-gold text-xs tracking-[0.2em] uppercase mb-1">
                  {lb.season as string}{lb.year ? ` ${lb.year}` : ""}
                </p>
                <h2 className="text-xl font-display text-neutral-900 group-hover:text-brand-600 transition-colors">
                  {lb.name as string}
                </h2>
                {typeof lb.description === "string" && lb.description && (
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{lb.description}</p>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
