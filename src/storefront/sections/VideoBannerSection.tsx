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

  if (!posterImage && !videoUrl) return null;

  const showVideo = !!videoUrl;

  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-neutral-900">
      {showVideo ? (
        <video
          autoPlay={config.autoplay !== false}
          loop={config.loop !== false}
          muted={config.muted !== false}
          playsInline
          poster={posterImage ?? undefined}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl!} type="video/mp4" />
        </video>
      ) : posterImage ? (
        <div className="absolute inset-0">
          <SafeImage src={posterImage} alt={section.title || "Video banner poster"} className="w-full h-full object-cover" />
        </div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center px-6 max-w-3xl"
      >
        {section.title && (
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display text-white mb-4">
            {section.title}
          </h2>
        )}
        {section.subtitle && (
          <p className="text-neutral-300 font-editorial text-lg md:text-xl mb-8 max-w-lg mx-auto">
            {section.subtitle}
          </p>
        )}
        {ctaText && ctaUrl && (
          <Link to={ctaUrl} className="btn-primary">
            {ctaText}
          </Link>
        )}
      </motion.div>
    </section>
  );
}
