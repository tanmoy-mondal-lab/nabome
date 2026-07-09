export interface Profile {
    id: string;
    email: string;
    role: "customer" | "admin";
    firstName: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    emailVerified: boolean;
    lastLoginAt?: string;
    loginCount: number;
    preferences?: Record<string, unknown>;
}
import type { Order } from "./order";
export interface DashboardData {
    recentOrders: Order[];
    wishlistCount: number;
    addressesCount: number;
    unreadNotifications: number;
}
export interface AdminDashboard {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    pendingOrders: number;
    pendingReviews: number;
    ordersByStatus: {
        status: string;
        count: number;
    }[];
    recentOrders: Order[];
    recentCustomers: Profile[];
    dailySales: {
        date: string;
        revenue: number;
        orders: number;
    }[];
}
export interface AuthResponse {
    session: {
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
        expiresIn: number;
    };
    user: Profile;
}
export interface AuthSession {
    id: string;
    deviceName: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    lastActiveAt: string;
    createdAt: string;
    expiresAt: string;
}
