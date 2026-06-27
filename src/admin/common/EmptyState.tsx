import { type LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center premium-card rounded-2xl">
      <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4">
        <Icon size={28} className="text-brand-600" />
      </div>
      <p className="font-display text-lg text-neutral-800">{title}</p>
      {description && <p className="text-sm text-neutral-500 mt-2 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
