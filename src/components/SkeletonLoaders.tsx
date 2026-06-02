import { motion } from "framer-motion";

type SkeletonBoxProps = {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
};

function SkeletonBox({ width = "100%", height = 20, borderRadius = 8, style }: SkeletonBoxProps) {
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

export function ProductDetailSkeleton() {
  return (
    <div className="page" style={{ padding: "24px 6%" }}>
      <SkeletonBox width={200} height={14} borderRadius={4} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 32 }}>
        <SkeletonBox height={600} borderRadius={12} />
        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <SkeletonBox width="70%" height={32} borderRadius={4} />
          <SkeletonBox width="40%" height={24} borderRadius={4} />
          <SkeletonBox width="100%" height={80} borderRadius={8} />
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBox key={i} width={48} height={48} borderRadius={8} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} width={56} height={40} borderRadius={8} />
            ))}
          </div>
          <SkeletonBox width="100%" height={52} borderRadius={8} style={{ marginTop: 16 }} />
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="page" style={{ padding: "24px 6%" }}>
      <SkeletonBox width={120} height={24} borderRadius={4} />
      <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: 16, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12 }}>
            <SkeletonBox width={120} height={140} borderRadius={8} />
            <div style={{ display: "grid", gap: 8, flex: 1 }}>
              <SkeletonBox width="60%" height={18} borderRadius={4} />
              <SkeletonBox width="30%" height={14} borderRadius={4} />
              <SkeletonBox width="40%" height={14} borderRadius={4} />
              <SkeletonBox width={120} height={36} borderRadius={6} style={{ marginTop: "auto" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="page" style={{ padding: "24px 6%" }}>
      <SkeletonBox width={140} height={24} borderRadius={4} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, marginTop: 24 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <SkeletonBox height={200} borderRadius={12} />
          <SkeletonBox height={200} borderRadius={12} />
          <SkeletonBox height={200} borderRadius={12} />
        </div>
        <SkeletonBox height={400} borderRadius={12} />
      </div>
    </div>
  );
}

export function AccountSkeleton() {
  return (
    <div className="page" style={{ padding: "24px 6%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 32 }}>
        <div style={{ display: "grid", gap: 8 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBox key={i} height={40} borderRadius={8} />
          ))}
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <SkeletonBox width="50%" height={28} borderRadius={4} />
          <SkeletonBox height={120} borderRadius={12} />
          <SkeletonBox height={120} borderRadius={12} />
          <SkeletonBox height={120} borderRadius={12} />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="page" style={{ padding: "24px 6%" }}>
      <SkeletonBox width={300} height={20} borderRadius={4} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24, marginTop: 24 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ display: "grid", gap: 12 }}>
            <SkeletonBox height={320} borderRadius={12} />
            <SkeletonBox width="60%" height={14} borderRadius={4} />
            <SkeletonBox width="40%" height={12} borderRadius={4} />
            <SkeletonBox width="30%" height={16} borderRadius={4} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div className="page" style={{ padding: "24px 6%" }}>
      <SkeletonBox width={160} height={18} borderRadius={4} />
      <div style={{ display: "grid", gap: 24, marginTop: 24 }}>
        <SkeletonBox height={100} borderRadius={12} />
        <SkeletonBox height={200} borderRadius={12} />
        <SkeletonBox height={300} borderRadius={12} />
      </div>
    </div>
  );
}
