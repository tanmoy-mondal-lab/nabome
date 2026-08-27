/**
 * Dashboard Store Tests
 *
 * Unit tests for dashboard store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useDashboardStore } from '../dashboard-store';

describe('Dashboard Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDashboardStore.setState({
      activeTab: 'overview',
      sidebarOpen: true,
      notifications: [],
      dashboardData: null,
      lastUpdated: null,
    });
  });

  describe('Initial State', () => {
    it('has default active tab as overview', () => {
      const activeTab = useDashboardStore.getState().activeTab;
      expect(activeTab).toBe('overview');
    });

    it('has sidebar open by default', () => {
      const sidebarOpen = useDashboardStore.getState().sidebarOpen;
      expect(sidebarOpen).toBe(true);
    });

    it('has empty notifications array', () => {
      const notifications = useDashboardStore.getState().notifications;
      expect(notifications).toEqual([]);
    });

    it('has null dashboard data', () => {
      const dashboardData = useDashboardStore.getState().dashboardData;
      expect(dashboardData).toBeNull();
    });

    it('has null last updated timestamp', () => {
      const lastUpdated = useDashboardStore.getState().lastUpdated;
      expect(lastUpdated).toBeNull();
    });
  });

  describe('setActiveTab', () => {
    it('updates active tab', () => {
      useDashboardStore.getState().setActiveTab('products');
      const activeTab = useDashboardStore.getState().activeTab;
      expect(activeTab).toBe('products');
    });
  });

  describe('toggleSidebar', () => {
    it('toggles sidebar state', () => {
      const initial = useDashboardStore.getState().sidebarOpen;
      useDashboardStore.getState().toggleSidebar();
      const after = useDashboardStore.getState().sidebarOpen;
      expect(after).toBe(!initial);
    });
  });

  describe('setSidebarOpen', () => {
    it('sets sidebar to open', () => {
      useDashboardStore.getState().setSidebarOpen(true);
      expect(useDashboardStore.getState().sidebarOpen).toBe(true);
    });

    it('sets sidebar to closed', () => {
      useDashboardStore.getState().setSidebarOpen(false);
      expect(useDashboardStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('addNotification', () => {
    it('adds notification to the beginning of array', () => {
      const notification = {
        id: 'test-1',
        type: 'success' as const,
        title: 'Test',
        message: 'Test message',
        timestamp: new Date(),
        read: false,
      };

      useDashboardStore.getState().addNotification(notification as any);
      const notifications = useDashboardStore.getState().notifications;

      expect(notifications).toHaveLength(1);
      expect(notifications[0]?.id).toBe('test-1');
    });

    it('generates id if not provided', () => {
      const notification = {
        type: 'success' as const,
        title: 'Test',
        message: 'Test message',
        timestamp: new Date(),
      };

      useDashboardStore.getState().addNotification(notification as any);
      const notifications = useDashboardStore.getState().notifications;

      expect(notifications[0]?.id).toBeDefined();
    });

    it('generates timestamp if not provided', () => {
      const notification = {
        id: 'test-1',
        type: 'success' as const,
        title: 'Test',
        message: 'Test message',
      };

      useDashboardStore.getState().addNotification(notification as any);
      const notifications = useDashboardStore.getState().notifications;

      expect(notifications[0]?.timestamp).toBeDefined();
    });

    it('sets read to false by default', () => {
      const notification = {
        id: 'test-1',
        type: 'success' as const,
        title: 'Test',
        message: 'Test message',
      };

      useDashboardStore.getState().addNotification(notification as any);
      const notifications = useDashboardStore.getState().notifications;

      expect(notifications[0]?.read).toBe(false);
    });
  });

  describe('removeNotification', () => {
    it('removes notification by id', () => {
      const notification1 = {
        id: 'test-1',
        type: 'success' as const,
        title: 'Test 1',
        message: 'Test message 1',
        timestamp: new Date(),
        read: false,
      };
      const notification2 = {
        id: 'test-2',
        type: 'error' as const,
        title: 'Test 2',
        message: 'Test message 2',
        timestamp: new Date(),
        read: false,
      };

      useDashboardStore.getState().addNotification(notification1);
      useDashboardStore.getState().addNotification(notification2);
      useDashboardStore.getState().removeNotification('test-1');

      const notifications = useDashboardStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0]?.id).toBe('test-2');
    });
  });

  describe('clearNotifications', () => {
    it('clears all notifications', () => {
      useDashboardStore.getState().addNotification({
        type: 'success',
        title: 'Test',
        message: 'Test message',
        timestamp: new Date(),
      });
      useDashboardStore.getState().clearNotifications();

      const notifications = useDashboardStore.getState().notifications;
      expect(notifications).toEqual([]);
    });
  });

  describe('updateDashboardData', () => {
    it('updates dashboard data', () => {
      const data = { revenue: 1000, orders: 50 };
      useDashboardStore.getState().updateDashboardData(data);

      const dashboardData = useDashboardStore.getState().dashboardData;
      expect(dashboardData).toEqual(data);
    });

    it('updates last updated timestamp', () => {
      const before = useDashboardStore.getState().lastUpdated;
      useDashboardStore.getState().updateDashboardData({ test: true });
      const after = useDashboardStore.getState().lastUpdated;

      expect(after).not.toBeNull();
      expect(after).not.toBe(before);
    });
  });

  describe('invalidateDashboardData', () => {
    it('clears dashboard data', () => {
      useDashboardStore.getState().updateDashboardData({ test: true });
      useDashboardStore.getState().invalidateDashboardData();

      const dashboardData = useDashboardStore.getState().dashboardData;
      expect(dashboardData).toBeNull();
    });

    it('clears last updated timestamp', () => {
      useDashboardStore.getState().updateDashboardData({ test: true });
      useDashboardStore.getState().invalidateDashboardData();

      const lastUpdated = useDashboardStore.getState().lastUpdated;
      expect(lastUpdated).toBeNull();
    });
  });
});
