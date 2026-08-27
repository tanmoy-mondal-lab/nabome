/**
 * Dashboard Store
 *
 * Centralized state management for Shop Owner Dashboard
 * Following SHOP_OWNER_DASHBOARD_FRONTEND_IMPLEMENTATION_SPECIFICATION.md
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Dashboard state interface
interface DashboardState {
  // UI State
  activeTab: string;
  sidebarOpen: boolean;
  notifications: Notification[];

  // Dashboard Data Cache
  dashboardData: any | null;
  lastUpdated: Date | null;

  // Actions
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateDashboardData: (data: any) => void;
  invalidateDashboardData: () => void;
}

// Notification interface
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Create the dashboard store
export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      // Initial state
      activeTab: 'overview',
      sidebarOpen: true,
      notifications: [],
      dashboardData: null,
      lastUpdated: null,

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: notification.id || crypto.randomUUID(),
              timestamp: notification.timestamp || new Date(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      updateDashboardData: (data) =>
        set({
          dashboardData: data,
          lastUpdated: new Date(),
        }),

      invalidateDashboardData: () =>
        set({
          dashboardData: null,
          lastUpdated: null,
        }),
    }),
    {
      name: 'dashboard-store',
    },
  ),
);

// Selectors for optimized re-renders
export const selectActiveTab = (state: DashboardState) => state.activeTab;
export const selectSidebarOpen = (state: DashboardState) => state.sidebarOpen;
export const selectNotifications = (state: DashboardState) =>
  state.notifications;
export const selectUnreadNotifications = (state: DashboardState) =>
  state.notifications.filter((n) => !n.read);
export const selectDashboardData = (state: DashboardState) =>
  state.dashboardData;
export const selectLastUpdated = (state: DashboardState) => state.lastUpdated;
