import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, ShoppingBag, Package, Tag, AlertCircle, Megaphone, Star, Clock } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { cn } from "../../lib/utils/cn";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { Helmet } from "react-helmet-async";
import { Breadcrumbs } from "../components/Breadcrumbs";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, typeof Bell> = {
  order: ShoppingBag,
  shipment: Package,
  promotion: Tag,
  alert: AlertCircle,
  review: Star,
  announcement: Megaphone,
};

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customer", "notifications"],
    queryFn: () => customerApi.getNotifications(),
    retry: false,
  });

  const notifications = ((data as unknown as { notifications: Notification[] })?.notifications ?? []) as Notification[];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => customerApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => customerApi.markAllNotificationsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] }),
  });

  return (
    <div className="container-page py-8">
      <Helmet>
        <title>Notifications — নবME</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">Notifications</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="btn-ghost text-xs"
              >
                {markAllReadMutation.isPending ? "Marking..." : "Mark All as Read"}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-neutral-100 animate-pulse rounded" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 premium-card shadow-subtle">
              <p className="text-sm text-neutral-500 mb-3">Failed to load notifications.</p>
              <button onClick={() => window.location.reload()} className="text-xs text-brand-500 hover:underline uppercase tracking-widest">Retry</button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="premium-card p-12 text-center shadow-subtle">
              <Bell className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-neutral-900 mb-2">No notifications</h3>
              <p className="text-xs text-neutral-500">You're all up to date. Notifications about your orders and account will appear here.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type] || Bell;
                return (
                  <button
                    key={notification.id}
                    onClick={() => { if (!notification.isRead) markReadMutation.mutate(notification.id); }}
                    className={cn(
                      "w-full text-left flex items-start gap-4 p-4 transition-colors hover:bg-neutral-50 premium-card shadow-subtle",
                      !notification.isRead && "border-l-4 border-l-neutral-900"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", notification.isRead ? "bg-neutral-100" : "bg-neutral-900")}>
                      <Icon className={cn("w-4 h-4", notification.isRead ? "text-neutral-500" : "text-white")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm", notification.isRead ? "text-neutral-600" : "text-neutral-900 font-medium")}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-neutral-400 whitespace-nowrap shrink-0 editorial-caption">{getRelativeTime(notification.createdAt)}</span>
                      </div>
                      <p className={cn("text-xs mt-0.5", notification.isRead ? "text-neutral-400" : "text-neutral-500")}>{notification.body}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
