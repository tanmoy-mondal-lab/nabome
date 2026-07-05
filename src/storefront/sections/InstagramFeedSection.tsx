import { motion } from "framer-motion";
import { SafeImage } from "../../components/SafeImage";

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface InstagramImageV1 {
  url: string;
  link: string;
  caption: string;
}

interface InstagramImageV2 {
  imageUrl: string;
  postUrl: string;
  caption: string;
}

type InstagramImage = InstagramImageV1 | InstagramImageV2;

interface InstagramFeedSectionProps {
  section: SectionData;
}

export default function InstagramFeedSection({ section }: InstagramFeedSectionProps) {
  const content = section.content ?? {};
  const rawImages = (content.images as InstagramImage[] | undefined) ?? [];

  if (rawImages.length === 0) return null;

  const images = rawImages.slice(0, 6).map((img) => ({
    src: "url" in img ? img.url : img.imageUrl,
    href: "link" in img ? img.link : img.postUrl,
    caption: img.caption,
  }));

  const title = section.title ?? "Follow Us on Instagram";
  const subtitle = section.subtitle ?? "@nabome";

  return (
    <section className="container-wide section-padding">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center md:mb-16 mb-10"
      >
        <h2 className="md:text-5xl md:text-neutral-900 md:mb-3 text-3xl md:text-4xl font-display text-neutral-900 mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="md:text-neutral-400 md:text-[13px] md:tracking-wide text-neutral-500">{subtitle}</p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 md:gap-4 gap-3">
        {images.map((img, i) => (
          <motion.a
            key={i}
            href={img.href || "#"}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ scale: 1.03 }}
            className="relative aspect-square overflow-hidden md:rounded-none rounded-md bg-neutral-100 group"
          >
            <SafeImage
              src={img.src}
              alt={img.caption || "Instagram post"}
              width={400}
              height={400}
              className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110 group-hover:scale-110"
            />
            {img.caption && (
              <div className="absolute inset-0 max-md:hidden bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white text-[11px] leading-relaxed line-clamp-2">
                  {img.caption}
                </p>
              </div>
            )}
          </motion.a>
        ))}
      </div>
    </section>
  );
}
