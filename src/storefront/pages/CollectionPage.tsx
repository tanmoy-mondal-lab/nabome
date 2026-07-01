import { useParams, Link } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { api } from "../../lib/api/client";
import { ProductGrid } from "../components/ProductGrid";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { canonical, collectionSchema, breadcrumbSchema } from "../../lib/seo";
import { img } from "../../lib/seo";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

export default function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();

  const [colRes, prodRes] = useQueries({
    queries: [
      { queryKey: ["collection", slug], queryFn: () => api.get<{ collection: Record<string, unknown> }>(`/api/collections/${slug}`), enabled: !!slug, staleTime: 1000 * 60 * 10, retry: false },
      { queryKey: ["products", "collection", slug], queryFn: () => api.get<{ products: Record<string, unknown>[] }>("/api/products", { params: { collection: slug, limit: 50 } }), enabled: !!slug, staleTime: 1000 * 60 * 5, retry: false },
    ],
  });

  const collection = colRes.data?.collection ?? null;
  const products = prodRes.data?.products ?? [];
  const loading = colRes.isLoading || prodRes.isLoading;
  const error = colRes.error ? "Failed to load collection." : prodRes.error ? "Failed to load products." : null;

  if (loading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-display text-neutral-900 mb-4">Error Loading Collection</h1>
        <p className="text-neutral-500 mb-6">{error}</p>
        <Link to="/collections" className="text-brand-500 hover:underline">View all collections</Link>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-2xl font-display text-neutral-900 mb-4">Collection Not Found</h1>
        <Link to="/collections" className="text-brand-500 hover:underline">View all collections</Link>
      </div>
    );
  }

  const heroImage = collection.heroImage as string | undefined;
  const description = collection.description as string | undefined;
  const season = collection.season as string | undefined;

  return (
    <>
      <Helmet>
        <title>{(collection.name as string) ?? "Collection"} — নবME</title>
        <meta name="description" content={description || `Shop ${(collection.name as string) ?? ""} on নবME`} />
        <link rel="canonical" href={canonical(`/collections/${slug}`)} />
        <meta property="og:title" content={`${(collection.name as string) ?? "Collection"} — নবME`} />
        <meta property="og:description" content={description || ""} />
        {heroImage && <meta property="og:image" content={img(heroImage)} />}
        <script type="application/ld+json">{JSON.stringify(collectionSchema({ name: collection.name as string, slug: slug!, description }))}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema([
          { label: "Home", url: "/" },
          { label: "Collections", url: "/collections" },
          { label: collection.name as string, url: `/collections/${slug}` },
        ]))}</script>
      </Helmet>

      <div className="container-page py-8">
        <Breadcrumbs items={[
          { label: "Collections", href: "/collections" },
          { label: collection.name as string },
        ]} className="mb-6" />

        <motion.div {...fadeUp} className="text-center mb-12">
          {season && <p className="text-accent-gold text-xs tracking-[0.2em] uppercase mb-3">{season}</p>}
          <h1 className="text-3xl md:text-5xl font-display text-neutral-900">{collection.name as string}</h1>
          {description && <p className="text-neutral-600 text-base mt-4 max-w-xl mx-auto">{description}</p>}
        </motion.div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500">No products in this collection yet.</p>
            <Link to="/products" className="text-brand-500 hover:underline mt-2 inline-block">Browse all products</Link>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </>
  );
}
