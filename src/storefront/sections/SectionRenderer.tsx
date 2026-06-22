import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

interface SectionData {
  id?: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface SectionRendererProps {
  section: SectionData;
}

const HeroSliderSection = lazy(() => import("./HeroSliderSection"));
const ProductGridSection = lazy(() => import("./ProductGridSection"));
const CollectionGridSection = lazy(() => import("./CollectionGridSection"));
const BrandStorySection = lazy(() => import("./BrandStorySection"));
const TrustBarSection = lazy(() => import("./TrustBarSection"));
const NewsletterSection = lazy(() => import("./NewsletterSection"));
const TestimonialsSection = lazy(() => import("./TestimonialsSection"));
const InstagramFeedSection = lazy(() => import("./InstagramFeedSection"));
const BannerPromoSection = lazy(() => import("./BannerPromoSection"));
const CustomHTMLSection = lazy(() => import("./CustomHTMLSection"));

const sectionComponentMap: Record<string, React.LazyExoticComponent<React.ComponentType<{ section: SectionData }>>> = {
  hero_slider: HeroSliderSection,
  product_grid: ProductGridSection,
  featured_collections: CollectionGridSection,
  brand_story: BrandStorySection,
  trust_bar: TrustBarSection,
  newsletter: NewsletterSection,
  testimonials: TestimonialsSection,
  instagram_feed: InstagramFeedSection,
  banner_promo: BannerPromoSection,
  custom_html: CustomHTMLSection,
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
    </div>
  );
}

export default function SectionRenderer({ section }: SectionRendererProps) {
  const Component = sectionComponentMap[section.sectionType];

  if (!Component) return null;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component section={section} />
    </Suspense>
  );
}
