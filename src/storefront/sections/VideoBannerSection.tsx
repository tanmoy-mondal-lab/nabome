import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SafeImage } from "../../components/SafeImage";

interface VideoBannerConfig {
  heading?: string | null;
  subheading?: string | null;
  videoUrl?: string | null;
  posterImage?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

interface SectionData {
  id?: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface VideoBannerSectionProps {
  section: SectionData;
}

export default function VideoBannerSection({ section }: VideoBannerSectionProps) {
  const config = (section.content ?? {}) as VideoBannerConfig;
  const { videoUrl, posterImage, ctaText, ctaUrl } = config;

  const showVideo = !!videoUrl;

  return (
    <section className="relative h-[70vh] min-h-[300px] md:min-h-[500px] flex items-center justify-center overflow-hidden bg-neutral-900">
      {showVideo ? (
        <video
          autoPlay={config.autoplay !== false}
          loop={config.loop !== false}
          muted={config.muted !== false}
          playsInline
          poster={posterImage ?? undefined}
          src={videoUrl!}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : posterImage ? (
        <div className="absolute inset-0">
          <SafeImage src={posterImage} alt={section.title || "Video banner poster"} responsive className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}
      <div className="absolute inset-0 md:bg-gradient-to-t md:from-black/40 md:via-black/10 md:to-black/10 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center px-6 max-w-3xl"
      >
        {section.title && (
          <h2 className="text-4xl md:text-7xl md:mb-6 lg:text-6xl font-display text-white mb-4">
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="md:text-white/60 md:font-body md:text-base md:mb-10 text-neutral-300 font-editorial text-lg md:text-xl mb-8 max-w-lg mx-auto">
            {section.subtitle}
          </p>
        )}
        {ctaText && ctaUrl && (
          <Link to={ctaUrl} className="md:text-[11px] md:tracking-[0.25em] md:uppercase md:text-white/80 md:hover:text-white md:transition-colors md:inline-flex md:items-center md:gap-2 btn-primary">
            {ctaText}
          </Link>
        )}
      </motion.div>
    </section>
  );
}
