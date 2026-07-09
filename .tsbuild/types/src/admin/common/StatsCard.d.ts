import { type LucideIcon } from "lucide-react";
interface StatsCardProps {
    label: string;
    value: string | number;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    icon: LucideIcon;
    onClick?: () => void;
}
export declare function StatsCard({ label, value, change, changeType, icon: Icon, onClick }: StatsCardProps): import("react").JSX.Element;
export {};
