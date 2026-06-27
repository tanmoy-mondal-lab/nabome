import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  onClick?: () => void;
}

export function StatsCard({ label, value, change, changeType = "neutral", icon: Icon, onClick }: StatsCardProps) {
  return (
    <div
      className={`premium-card rounded-2xl p-6 ${onClick ? "cursor-pointer premium-card-lift" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 font-medium">{label}</p>
        <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
          <Icon size={16} className="text-brand-600" />
        </div>
      </div>
      <p className="font-display text-3xl text-neutral-900 leading-none">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-2 ${
          changeType === "positive" ? "text-green-600" :
          changeType === "negative" ? "text-red-600" :
          "text-neutral-400"
        }`}>
          {change}
        </p>
      )}
    </div>
  );
}
