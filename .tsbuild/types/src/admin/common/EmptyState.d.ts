import { type LucideIcon } from "lucide-react";
interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}
export declare function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps): import("react").JSX.Element;
export {};
