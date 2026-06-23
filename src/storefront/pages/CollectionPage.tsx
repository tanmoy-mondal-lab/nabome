import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Tag, Sparkles, Clock } from "lucide-react";
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
  const [collection, setCollection] = useState<Record<string, unknown> | null>(null);
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      api.get(`/api/collections/${slug}`),
      api.get("/api/products", { params: { collection: slug, limit: 50 } }),
    ])
      .then(([colRes, prodRes]) => {
        setCollection((colRes as Record<string, unknown>).collection as Record<string, unknown> ?? null);
        setProducts((prodRes as Record<string, unknown>).products as Record<string, unknown>[] ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-display-1 text-neutral-900 mb-4">Collection Not Found</h1>
        <Link to="/products" className="text-brand-500 hover:underline">Browse all products</Link>
      </div>
    );
  }

  const heroImage = (collection.heroImageUrl as string) || (collection.coverImageUrl as string);
  const pCount = products.length;

  return (
    <div>
      <Helmet>
        <title>{collection.name as string} — নবME</title>
        <meta name="description" content={(collection.description as string)?.slice(0, 160)} />
        <link rel="canonical" href={canonical(`/collections/${slug}`)} />
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content={`${collection.name as string} — নবME`} />
        <meta property="og:description" content={(collection.description as string)?.slice(0, 200)} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical(`/collections/${slug}`)} />
        <meta property="og:site_name" content="নবME" />
        <meta property="og:locale" content="en_IN" />
        {heroImage && <meta property="og:image" content={img(heroImage, { width: 1200, height: 630 })} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@নবME" />
        <meta name="twitter:title" content={`${collection.name as string} — নবME`} />
        <meta name="twitter:description" content={(collection.description as string)?.slice(0, 160)} />
        {heroImage && <meta name="twitter:image" content={img(heroImage, { width: 1200, height: 630 })} />}

        <script type="application/ld+json">{JSON.stringify(collectionSchema(collection))}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema([
          { label: "Collections", url: "/products" },
          { label: collection.name as string },
        ]))}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] md:min-h-[60vh] bg-neutral-900 flex items-end overflow-hidden">
        {heroImage ? (
          <>
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              src={img(heroImage, { width: 1440 })}
              alt={collection.name as string}
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-800" />
        )}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="container-wide relative z-10 pb-16 md:pb-20"
        >
          <Breadcrumbs items={[
            { label: "Collections", href: "/products" },
            { label: collection.name as string },
          ]} className="mb-6 text-white/60 [&_a]:text-white/60 [&_a:hover]:text-white" />
          <p className="editorial-caption text-accent-gold mb-4">Curated Collection</p>
          <h1 className="font-display text-5xl md:text-7xl text-white leading-[0.95] mb-4">
            {collection.name as string}
          </h1>
          {!!collection.description && (
            <p className="text-neutral-300 font-editorial text-lg md:text-xl max-w-2xl leading-relaxed">
              {String(collection.description)}
            </p>
          )}
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Tag className="w-4 h-4 text-accent-gold" />
              <span>{pCount} {pCount === 1 ? "piece" : "pieces"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Sparkles className="w-4 h-4 text-accent-gold" />
              <span>Curated for you</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Story Section */}
      {(collection.story as string) && (
        <motion.section
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="container-wide section-padding-sm bg-luxe-ivory"
        >
          <div className="max-w-3xl mx-auto text-center">
            <p className="editorial-caption text-accent-gold mb-4">The Story Behind</p>
            <h2 className="font-display text-3xl md:text-4xl text-neutral-900 mb-6">
              {collection.name as string}
            </h2>
            <p className="editorial-lead text-neutral-600 text-lg leading-relaxed">
              {String(collection.story)}
            </p>
          </div>
        </motion.section>
      )}

      {/* Products Section */}
      <section className="container-wide section-padding">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <p className="editorial-caption text-accent-gold mb-2">The Collection</p>
            <h2 className="text-2xl md:text-3xl font-display text-neutral-900">Featured Pieces</h2>
          </div>
          <p className="hidden md:block text-sm text-neutral-500">{pCount} products</p>
        </motion.div>

        <ProductGrid products={products} isLoading={loading} columns={4} />

        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <Clock className="w-7 h-7 text-neutral-400" />
            </div>
            <p className="text-neutral-500 mb-2">No products in this collection yet.</p>
            <p className="text-sm text-neutral-400 mb-6">New pieces are being curated. Check back soon.</p>
            <Link to="/products" className="btn-outline inline-flex items-center gap-2">
              Browse All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </section>
    </div>
  );
}
