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
      className={`bg-white border border-neutral-200 rounded p-6 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-neutral-500 font-medium">{label}</p>
        <Icon size={18} className="text-neutral-300" />
      </div>
      <p className="font-display text-3xl text-neutral-900">{value}</p>
      {change !== undefined && (
        <p className={`text-xs mt-1 ${
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
