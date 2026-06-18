import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, RotateCcw, Shield, Headphones, ChevronDown } from "lucide-react";
import { api } from "../../lib/api/client";
import { ProductGrid } from "../components/ProductGrid";
import { NewsletterForm } from "../components/NewsletterForm";
import { useFeaturedProducts, useNewArrivals } from "../hooks/useProducts";
import { useCollections } from "../hooks/useCollections";
import { canonical, websiteSchema } from "../../lib/seo";
import { img } from "../../lib/seo";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.15 } },
};

export default function HomePage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const { data: featured } = useFeaturedProducts();
  const { data: newArrivals } = useNewArrivals();
  const { data: collectionsData } = useCollections();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const collections = (collectionsData?.collections as Record<string, unknown>[]) ?? [];

  const heroSlides = useMemo(() => {
    const slides = collections
      .filter(c => c.coverImageUrl)
      .slice(0, 5)
      .map(c => ({
        image: String(c.coverImageUrl),
        caption: 'Curated Collection',
        title: String(c.name),
        subtitle: String(c.description || 'Discover the latest collection from নবME.'),
      }));
    if (slides.length === 0) {
      slides.push({
        image: '',
        caption: (settings.tagline as string) || 'Premium Fashion Destination',
        title: 'Discover Your Signature Style',
        subtitle: 'Curated collections for the discerning individual. Explore luxury fashion crafted for every occasion.',
      });
    }
    return slides;
  }, [collections, settings]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    if (paused || heroSlides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [paused, heroSlides.length, nextSlide]);

  useEffect(() => {
    api.get("/api/settings", { params: { action: "public" } })
      .then((s) => setSettings(s as Record<string, unknown>))
      .catch(() => {});
  }, []);

  const featuredProds = (featured?.products as Record<string, unknown>[]) ?? [];
  const newProds = (newArrivals?.products as Record<string, unknown>[]) ?? [];

  const slide = heroSlides[currentSlide];

  return (
    <div>
      <Helmet>
        <title>নবME — Premium Fashion</title>
        <meta name="description" content="Discover নবME — where heritage craftsmanship meets contemporary elegance. Premium fashion for the discerning." />
        <link rel="canonical" href={canonical("/")} />
        <meta name="robots" content="index, follow" />

        <meta property="og:title" content="নবME — Premium Fashion" />
        <meta property="og:description" content="Discover নবME — where heritage craftsmanship meets contemporary elegance." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical("/")} />
        <meta property="og:site_name" content="নবME" />
        <meta property="og:locale" content="en_IN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@nabome" />
        <meta name="twitter:title" content="নবME — Premium Fashion" />
        <meta name="twitter:description" content="Discover নবME — where heritage craftsmanship meets contemporary elegance." />

        <script type="application/ld+json">{JSON.stringify(websiteSchema())}</script>
      </Helmet>
      {/* ─── HERO CAROUSEL ─── */}
      <section
        className="relative h-screen min-h-[700px] bg-neutral-950 flex items-center overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950/85 via-neutral-900/60 to-neutral-950/40 z-10" />
          {slide.image && (
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={img(slide.image, { width: 1920 })}
                alt=""
                fetchPriority="high"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>
          )}
        </div>

        <motion.div
          key={currentSlide}
          variants={stagger}
          initial="initial"
          animate="animate"
          className="container-wide relative z-20"
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="editorial-caption text-accent-gold mb-5"
          >
            {slide.caption}
          </motion.p>
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="display-1 font-display text-6xl md:text-8xl text-white leading-[0.95] mb-6"
          >
            {currentSlide === 0 && heroSlides.length === 1 ? (
              <>Discover Your<br /><span className="text-accent-gold">Signature Style</span></>
            ) : (
              slide.title
            )}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="display-2 font-editorial text-xl md:text-2xl text-neutral-300 max-w-xl mb-10 leading-relaxed"
          >
            {slide.subtitle}
          </motion.p>
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex gap-5"
          >
            <Link to="/products" className="btn-primary">Shop Women</Link>
            <Link to="/products?gender=men" className="btn-secondary border-white text-white hover:bg-white hover:text-neutral-900">Shop Men</Link>
          </motion.div>
        </motion.div>

        {heroSlides.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`rounded-full transition-all duration-500 ease-luxe-out ${
                  i === currentSlide ? "bg-white w-8 h-1.5" : "bg-white/40 w-1.5 h-1.5 hover:bg-white/60"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── FEATURED PRODUCTS ─── */}
      {featuredProds.length > 0 && (
        <section className="container-wide section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <p className="editorial-caption text-accent-gold mb-3">Curated Selection</p>
              <h2 className="text-4xl md:text-5xl font-display text-neutral-900 leading-tight">
                Featured Products
              </h2>
              <p className="editorial-lead mt-3 max-w-lg">
                The finest pieces handpicked for the season.
              </p>
            </div>
            <Link
              to="/products?sort=featured"
              className="btn-outline hidden md:inline-flex"
            >
              View All
            </Link>
          </motion.div>
          <ProductGrid products={featuredProds} columns={4} />
          <div className="mt-8 text-center md:hidden">
            <Link to="/products?sort=featured" className="btn-outline">
              View All
            </Link>
          </div>
        </section>
      )}

      {/* ─── NEW ARRIVALS ─── */}
      {newProds.length > 0 && (
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
                <p className="editorial-caption text-accent-gold mb-3">Fresh Arrivals</p>
                <h2 className="text-4xl md:text-5xl font-display text-white leading-tight">
                  New Arrivals
                </h2>
                <p className="text-neutral-400 font-editorial text-lg mt-3 max-w-lg">
                  This week's most anticipated drops.
                </p>
              </div>
              <Link
                to="/products?sort=newest"
                className="btn-outline border-white/30 text-white hover:bg-white hover:text-neutral-900 hidden md:inline-flex"
              >
                View All
              </Link>
            </motion.div>
            <ProductGrid products={newProds} columns={4} />
            <div className="mt-8 text-center md:hidden">
              <Link
                to="/products?sort=newest"
                className="btn-outline border-white/30 text-white hover:bg-white hover:text-neutral-900"
              >
                View All
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── COLLECTIONS ─── */}
      {collections.length > 0 && (
        <section className="container-wide section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <p className="editorial-caption text-accent-gold mb-3">Curated Worlds</p>
            <h2 className="text-4xl md:text-5xl font-display text-neutral-900">
              Shop by Collection
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.slice(0, 3).map((col, i) => {
              const p = (col.products as Record<string, unknown>[]) ?? [];
              const image = col.coverImageUrl as string || (p[0]?.images as { url: string }[])?.[0]?.url;
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
                      <img
                        src={image}
                        alt={col.name as string}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      <h3 className="text-2xl font-display text-white mb-1">
                        {col.name as string}
                      </h3>
                      <p className="editorial-caption text-neutral-400">
                        {col.description as string || `${p.length || 0} pieces`}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── BRAND STORY ─── */}
      <section className="bg-luxe-ivory section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <p className="editorial-caption text-accent-gold mb-3">Our Heritage</p>
              <h2 className="text-4xl md:text-5xl font-display text-neutral-900 leading-tight">
                Craftsmanship That <span className="text-accent-gold">Endures</span>
              </h2>
              <p className="editorial-lead text-neutral-600 mt-5 leading-relaxed">
                Every stitch tells a story. At নবME, we collaborate with master artisans 
                who blend traditional techniques with contemporary design. Each piece is 
                a testament to patience, precision, and an unwavering commitment to quality.
              </p>
              <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-neutral-200">
                {[
                  { number: "200+", label: "Artisan Craftspeople" },
                  { number: "15+", label: "Countries Served" },
                  { number: "98%", label: "Customer Satisfaction" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl md:text-3xl font-display text-neutral-900">{s.number}</p>
                    <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative aspect-[4/5] bg-neutral-200 overflow-hidden round-sm">
              {!!collections[0]?.coverImageUrl && (
                <img src={String(collections[0].coverImageUrl)} alt="" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST BAR ─── */}
      <section className="container-wide section-padding-sm border-t border-neutral-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-10">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders above ₹999" },
            { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
            { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
            { icon: Headphones, title: "Premium Service", desc: "Dedicated support" },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="bg-neutral-950 text-white section-padding">
        <div className="container-wide text-center max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="editorial-caption text-accent-gold mb-4">Stay Inspired</p>
            <h2 className="text-4xl md:text-5xl font-display mb-4 leading-tight">
              Join the নবME World
            </h2>
            <p className="text-neutral-400 font-editorial text-lg mb-9 max-w-md mx-auto">
              Subscribe for exclusive access to new drops, private sales, and editor's picks.
            </p>
            <NewsletterForm />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
