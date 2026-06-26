import { motion } from "framer-motion";
import { useCollections } from "../hooks/useCollections";
import { SafeImage } from "../../components/SafeImage";

interface StatItem {
  label: string;
  value: string;
}

interface BrandStoryContent {
  headline?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  stats?: StatItem[] | null;
}

interface SectionData {
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown> | null;
}

interface BrandStorySectionProps {
  section: SectionData;
}

const defaultStats: StatItem[] = [
  { value: "200+", label: "Artisan Craftspeople" },
  { value: "15+", label: "Countries Served" },
  { value: "98%", label: "Customer Satisfaction" },
];

export default function BrandStorySection({ section }: BrandStorySectionProps) {
  const { data: collectionsData } = useCollections();
  const content = (section.content ?? {}) as BrandStoryContent;

  const headline = content.headline ?? "Craftsmanship That Endures";
  const body =
    content.body ??
    "Every stitch tells a story. At \u09a8\u09acME, we collaborate with master artisans who blend traditional techniques with contemporary design. Each piece is a testament to patience, precision, and an unwavering commitment to quality.";
  const stats = content.stats ?? defaultStats;
  const imageUrl =
    content.imageUrl ??
    ((collectionsData?.collections as Record<string, unknown>[] | undefined)?.[0]?.coverImageUrl as string | undefined);

  const parts = headline.split("Endures");

  return (
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
            <p className="editorial-caption text-accent-gold mb-3">
              {section.subtitle ?? "Our Heritage"}
            </p>
            <h2 className="text-4xl md:text-5xl font-display text-neutral-900 leading-tight">
              {parts.length > 1 ? (
                <>
                  {parts[0]}
                  <span className="text-accent-gold">Endures</span>
                  {parts[1]}
                </>
              ) : (
                headline
              )}
            </h2>
            <p className="editorial-lead text-neutral-600 mt-5 leading-relaxed">{body}</p>
            <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-neutral-200">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl md:text-3xl font-display text-neutral-900">{s.value}</p>
                  <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/5] bg-neutral-200 overflow-hidden rounded-sm group">
            {imageUrl && (
              <SafeImage
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover transition-transform duration-700 ease-luxe-out group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
