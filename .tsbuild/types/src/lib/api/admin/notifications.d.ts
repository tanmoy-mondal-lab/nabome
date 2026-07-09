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
export declare const notificationsApi: {
    list: (params?: Record<string, string | number | undefined>) => Promise<{
        notifications: Notification[];
    }>;
    getTemplates: () => Promise<{
        templates: NotificationTemplate[];
    }>;
    updateTemplate: (id: string, data: Partial<NotificationTemplate>) => Promise<{
        template: NotificationTemplate;
    }>;
    sendManual: (data: {
        profileId: string;
        type: string;
        title: string;
        body?: string;
    }) => Promise<{
        notification: Notification;
    }>;
};
