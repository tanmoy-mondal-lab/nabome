import { motion } from "framer-motion";

type Props = {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
};

export function Skeleton({ width = "100%", height = 20, borderRadius = 8, style }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width,
        height,
        borderRadius,
        background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12))",
        ...style,
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Skeleton height={320} borderRadius={12} />
      <Skeleton width="60%" height={14} />
      <Skeleton width="40%" height={12} />
      <Skeleton width="30%" height={16} />
    </div>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div style={{ minHeight: "90vh", display: "grid", placeItems: "center", padding: "0 6%" }}>
      <div style={{ textAlign: "center", display: "grid", gap: 20, maxWidth: 600 }}>
        <Skeleton width={120} height={14} borderRadius={4} style={{ margin: "0 auto" }} />
        <Skeleton height={80} borderRadius={8} />
        <Skeleton width="70%" height={16} style={{ margin: "0 auto" }} />
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
          <Skeleton width={160} height={48} borderRadius={8} />
          <Skeleton width={160} height={48} borderRadius={8} />
        </div>
      </div>
    </div>
  );
}
