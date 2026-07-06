import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { SafeImage } from "../../components/SafeImage";
import { api } from "../../lib/api/client";
import { canonical } from "../../lib/seo";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  heroImageUrl?: string;
  isFeatured?: boolean;
}

export default function CollectionsIndexPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["collections"],
    queryFn: () =>
      api.get<unknown>("/collections").then((r) => {
        if (Array.isArray(r)) return r;
        if (r && typeof r === "object" && "collections" in r && Array.isArray((r as any).collections)) {
          return (r as any).collections;
        }
        return [];
      }),
    retry: false,
  });

  const collections: Collection[] = Array.isArray(data) ? data : [];

  return (
    <div className="container-page section-padding">
      <Helmet>
        <title>Collections — নবME</title>
        <meta name="description" content="Explore our curated collections of premium fashion at নবME." />
        <link rel="canonical" href={canonical("/collections")} />
        <meta property="og:title" content="Collections — নবME" />
        <meta property="og:description" content="Explore our curated collections of premium fashion at নবME." />
        <meta property="og:url" content={canonical("/collections")} />
      </Helmet>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Collections" }]} className="mb-10" />
      <h1 className="font-display text-display-1 md:text-display-2 text-neutral-900 mb-12">Our Collections</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-luxe-ivory animate-pulse rounded-sm" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-neutral-500 mb-4">Failed to load collections.</p>
          <button onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }} className="text-xs text-brand-500 hover:underline uppercase tracking-widest">Retry</button>
        </div>
      ) : collections.length === 0 ? (
        <p className="text-neutral-500 font-editorial">No collections available yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {collections.map((c: any) => (
            <Link
              key={c.id}
              to={`/collections/${c.slug}`}
              className="group block"
            >
              <div className="aspect-[4/5] bg-luxe-ivory overflow-hidden mb-4 rounded-sm">
                {(c.heroImageUrl || c.imageUrl) ? (
                  <SafeImage
                    src={c.heroImageUrl || c.imageUrl}
                    alt={c.name}
                    responsive
                    premium
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-luxe-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300 font-display text-heading-2">
                    {c.name}
                  </div>
                )}
              </div>
              <h3 className="text-body-sm font-body font-medium text-neutral-900 group-hover:text-brand-500 transition-colors">
                {c.name}
              </h3>
              {c.description && (
                <p className="text-[10px] text-neutral-400 mt-1.5 line-clamp-2">{c.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
