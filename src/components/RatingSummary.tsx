import { Star } from "lucide-react";
import type { RatingDistribution } from "../types/product";

type Props = {
  rating: number;
  reviewCount: number;
  distribution: RatingDistribution[];
};

export default function RatingSummary({ rating, reviewCount, distribution }: Props) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ textAlign: "center", minWidth: 120 }}>
        <div style={{ fontSize: "3rem", fontWeight: 700, lineHeight: 1, color: "var(--gold)" }}>
          {rating.toFixed(1)}
        </div>
        <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 4 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              fill={star <= full ? "var(--gold)" : star === full + 1 && hasHalf ? "var(--gold)" : "var(--line)"}
              color={star <= full || (star === full + 1 && hasHalf) ? "var(--gold)" : "var(--line)"}
            />
          ))}
        </div>
        <p style={{ color: "var(--muted)", fontSize: ".82rem", marginTop: 4 }}>
          {reviewCount} review{reviewCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
        {distribution.map((d) => (
          <div key={d.stars} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: ".82rem", color: "var(--muted)", minWidth: 40, textAlign: "right" }}>
              {d.stars} ★
            </span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}>
              <div style={{
                width: `${d.percentage}%`, height: "100%",
                borderRadius: 4, background: "var(--gold)",
                transition: "width 0.6s ease-out",
              }} />
            </div>
            <span style={{ fontSize: ".78rem", color: "var(--muted)", minWidth: 32 }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
