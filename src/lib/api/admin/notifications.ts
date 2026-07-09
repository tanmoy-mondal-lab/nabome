import { api } from "../client";

export interface Notification {
  id: string;
  profileId: string;
  type: string;
  title: string;
  body?: string;
  channel: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  event: string;
  subject?: string;
  body: string;
  channel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const notificationsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get<{ notifications: Notification[] }>("/admin/notifications", { params }),
  getTemplates: () => api.get<{ templates: NotificationTemplate[] }>("/admin/notification-templates"),
  updateTemplate: (id: string, data: Partial<NotificationTemplate>) =>
    api.put<{ template: NotificationTemplate }>(`/admin/notification-templates/${id}`, data),
  sendManual: (data: { profileId: string; type: string; title: string; body?: string }) =>
    api.post<{ notification: Notification }>("/admin/notifications/send", data),
};
