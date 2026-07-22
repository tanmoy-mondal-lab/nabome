import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import { ProductGrid } from "../components/ProductGrid";
import type { Product } from "../../types/product";

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface ProductGridSectionProps {
  section: SectionData;
}

function useProductSource(content: Record<string, unknown>, sectionTitleFallback: string | null, sectionSubtitleFallback: string | null) {
  const source = (content.source as string) ?? "featured";
  const sourceValue = content.sourceValue as string | undefined;
  const limit = (content.limit as number) ?? 8;

  let endpoint = "/api/products/featured";
  let params: Record<string, string> = {};
  let title: string;
  let caption: string;
  let sortParam: string;
  let viewAllUrl: string;

  switch (source) {
    case "new_arrivals":
      endpoint = "/api/products/new";
      title = "New Arrivals";
      caption = "Fresh Arrivals";
      sortParam = "newest";
      viewAllUrl = "/products?sort=newest";
      break;
    case "category":
      endpoint = "/api/products";
      params = { category: sourceValue || "", sort: "newest" };
      title = (content.sourceLabel as string) || "Category";
      caption = "Shop by Category";
      sortParam = "newest";
      viewAllUrl = sourceValue ? `/products?category=${sourceValue}` : "/products";
      break;
    case "collection":
      endpoint = "/api/products";
      params = { collection: sourceValue || "" };
      title = (content.sourceLabel as string) || "Collection";
      caption = "Featured Collection";
      sortParam = "featured";
      viewAllUrl = sourceValue ? `/collections/${sourceValue}` : "/collections";
      break;
    case "label":
      endpoint = "/api/products";
      params = { label: sourceValue || "" };
      title = (content.sourceLabel as string) || "Label";
      caption = "Curated Selection";
      sortParam = "featured";
      viewAllUrl = sourceValue ? `/products?label=${sourceValue}` : "/products";
      break;
    case "tag":
      endpoint = "/api/products";
      params = { tag: sourceValue || "" };
      title = (content.sourceLabel as string) || "Tag";
      caption = "Trending Now";
      sortParam = "newest";
      viewAllUrl = sourceValue ? `/products?tag=${sourceValue}` : "/products";
      break;
    case "brand":
      endpoint = "/api/products";
      params = { brand: sourceValue || "" };
      title = (content.sourceLabel as string) || "Brand";
      caption = "Brand Spotlight";
      sortParam = "featured";
      viewAllUrl = sourceValue ? `/products?brand=${sourceValue}` : "/products";
      break;
    default:
      endpoint = "/api/products/featured";
      title = "Featured Products";
      caption = "Curated Selection";
      sortParam = "featured";
      viewAllUrl = "/products?sort=featured";
      break;
  }

  if ((content.viewAllUrl as string)) {
    viewAllUrl = content.viewAllUrl as string;
  }

  const sectionTitle = sectionTitleFallback || title;
  const sectionCaption = sectionSubtitleFallback || caption;

  const { data: res, isLoading: loading } = useQuery({
    queryKey: ["products", "section", source, sourceValue, limit],
    queryFn: () => api.get<{ products: Product[] }>(endpoint, Object.keys(params).length > 0 ? { params } : undefined),
    staleTime: 1000 * 60 * 10,
  });

  const isNew = source === "new_arrivals";
  const products = (res?.products ?? []).slice(0, limit);

  return { products, loading, isNew, sectionTitle, sectionCaption, sortParam, viewAllUrl };
}

export default function ProductGridSection({ section }: ProductGridSectionProps) {
  const content = section.content ?? {};
  const { products, loading, isNew, sectionTitle, sectionCaption, viewAllUrl } = useProductSource(content, section.title, section.subtitle);

  if (loading) {
    return (
      <section className="container-wide section-padding">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] bg-neutral-100 animate-pulse rounded-sm" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  if (isNew) {
    return (
      <section className="md:bg-white bg-neutral-950 section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="md:flex md:items-end md:justify-between md:mb-20 mb-12"
          >
            <div>
              {/* Desktop: quiet caption, no gold */}
              <p className="md:text-[10px] md:tracking-[0.2em] md:uppercase md:text-neutral-400 editorial-caption md:mb-4 text-accent-gold mb-3">{sectionCaption}</p>
              {/* Desktop: larger heading, dark text */}
              <h2 className="md:text-display-1 md:text-neutral-900 text-4xl md:text-5xl font-display text-white leading-tight">{sectionTitle}</h2>
              {section.subtitle && (
                <p className="md:text-neutral-500 md:font-body md:text-base text-neutral-400 font-editorial text-lg mt-3 max-w-lg">{section.subtitle}</p>
              )}
            </div>
            {/* Desktop: text link with arrow, not button */}
            <Link
              to={viewAllUrl}
              className="md:text-[11px] md:tracking-[0.2em] md:uppercase md:text-neutral-500 md:hover:text-neutral-900 md:transition-colors md:duration-300 md:inline-flex md:items-center md:gap-2 btn-outline border-white/30 text-white hover:bg-white hover:text-neutral-900 hidden md:inline-flex"
            >
              View All
              <span>&rarr;</span>
            </Link>
          </motion.div>
          <ProductGrid products={products} columns={4} />
          <div className="mt-8 text-center md:hidden">
            <Link
              to={viewAllUrl}
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
        className="md:flex md:items-end md:justify-between md:mb-20 mb-12"
      >
        <div>
          {/* Desktop: quiet caption */}
          <p className="md:text-[10px] md:tracking-[0.2em] md:uppercase md:text-neutral-400 editorial-caption md:mb-4 text-accent-gold mb-3">{sectionCaption}</p>
          {/* Desktop: larger heading */}
          <h2 className="md:text-display-1 md:text-neutral-900 text-4xl md:text-5xl font-display text-neutral-900 leading-tight">{sectionTitle}</h2>
          {section.subtitle && (
            <p className="md:text-neutral-500 md:font-body md:text-base editorial-lead mt-3 max-w-lg">{section.subtitle}</p>
          )}
        </div>
        {/* Desktop: text link */}
        <Link to={viewAllUrl} className="md:text-[11px] md:tracking-[0.2em] md:uppercase md:text-neutral-500 md:hover:text-neutral-900 md:transition-colors md:duration-300 md:inline-flex md:items-center md:gap-2 btn-outline hidden md:inline-flex">
          View All
          <span>&rarr;</span>
        </Link>
      </motion.div>
      <ProductGrid products={products} columns={4} />
      <div className="mt-8 text-center md:hidden">
        <Link to={viewAllUrl} className="btn-outline">View All</Link>
      </div>
    </section>
  );
}
