import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SafeImage } from "../../components/SafeImage";

interface BannerPromoContent {
  imageUrl?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
}

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface BannerPromoSectionProps {
  section: SectionData;
}

export default function BannerPromoSection({ section }: BannerPromoSectionProps) {
  const content = (section.content ?? {}) as BannerPromoContent;
  const imageUrl = content.imageUrl;

  const ctaText = content.ctaText ?? "Shop Now";
  const ctaUrl = content.ctaUrl ?? "/products";

  return (
    <section className="relative h-[60vh] min-h-[280px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {imageUrl ? (
          <SafeImage
            src={imageUrl}
            alt={section.title || "Promotional banner"}
            premium
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200" />
        )}
        {/* Desktop: lighter gradient overlay */}
        <div className="absolute inset-0 md:bg-gradient-to-t md:from-black/40 md:via-black/10 md:to-black/10 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center px-6"
      >
        {section.title && (
          <h2 className="text-4xl md:text-6xl md:mb-4 font-display text-white mb-3">{section.title}</h2>
        )}
        {section.subtitle && (
          <p className="md:text-white/60 md:font-body md:text-base md:mb-10 text-neutral-300 font-editorial text-lg mb-8 max-w-md mx-auto">
            {section.subtitle}
          </p>
        )}
        {/* Desktop: text link CTA */}
        <Link to={ctaUrl} className="md:text-[11px] md:tracking-[0.25em] md:uppercase md:text-white/80 md:hover:text-white md:transition-colors md:inline-flex md:items-center md:gap-2 btn-primary">
          {ctaText}
        </Link>
      </motion.div>
    </section>
  );
}
