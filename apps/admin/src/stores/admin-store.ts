/**
 * Admin Store - Central state management for Admin Dashboard
 * Source: ADMIN_DASHBOARD_ARCHITECTURE.md
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  PlatformKPIs,
  Shop,
  CustomerProfile,
  ProductModeration,
  OrderGovernance,
  PaymentProvider,
  ReturnGovernance,
  CMSContent,
  SecurityAlert,
  BackgroundJob,
  QueueStatus,
  CacheStatus,
  SearchIndexStatus,
  StorageHealth,
  DatabaseHealth,
  APIHealth,
  ScheduledTask,
  Report,
  PlatformSetting,
  FeatureFlag,
} from '@/types/admin';

interface AdminState {
  // Platform Overview
  kpis: PlatformKPIs | null;

  // Shop Management
  shops: Shop[];
  selectedShop: Shop | null;

  // Customer Management
  customers: CustomerProfile[];
  selectedCustomer: CustomerProfile | null;

  // Product Governance
  moderationQueue: ProductModeration[];

  // Order Governance
  exceptionQueue: OrderGovernance[];

  // Payments Governance
  paymentProviders: PaymentProvider[];

  // Returns Governance
  returnsQueue: ReturnGovernance[];

  // CMS Governance
  cmsContent: CMSContent[];

  // Security Operations
  securityAlerts: SecurityAlert[];

  // System Operations
  backgroundJobs: BackgroundJob[];
  queueStatus: QueueStatus[];
  cacheStatus: CacheStatus[];
  searchIndexStatus: SearchIndexStatus[];
  storageHealth: StorageHealth[];
  databaseHealth: DatabaseHealth | null;
  apiHealth: APIHealth[];
  scheduledTasks: ScheduledTask[];

  // Reports
  reports: Report[];

  // Platform Settings
  settings: PlatformSetting[];
  featureFlags: FeatureFlag[];

  // UI State
  isLoading: boolean;
  error: string | null;

  // Sidebar
  sidebarCollapsed: boolean;

  // Actions
  setKPIs: (kpis: PlatformKPIs) => void;
  setShops: (shops: Shop[]) => void;
  setSelectedShop: (shop: Shop | null) => void;
  setCustomers: (customers: CustomerProfile[]) => void;
  setSelectedCustomer: (customer: CustomerProfile | null) => void;
  setModerationQueue: (queue: ProductModeration[]) => void;
  setExceptionQueue: (queue: OrderGovernance[]) => void;
  setPaymentProviders: (providers: PaymentProvider[]) => void;
  setReturnsQueue: (queue: ReturnGovernance[]) => void;
  setCMSContent: (content: CMSContent[]) => void;
  setSecurityAlerts: (alerts: SecurityAlert[]) => void;
  setBackgroundJobs: (jobs: BackgroundJob[]) => void;
  setQueueStatus: (status: QueueStatus[]) => void;
  setCacheStatus: (status: CacheStatus[]) => void;
  setSearchIndexStatus: (status: SearchIndexStatus[]) => void;
  setStorageHealth: (health: StorageHealth[]) => void;
  setDatabaseHealth: (health: DatabaseHealth) => void;
  setAPIHealth: (health: APIHealth[]) => void;
  setScheduledTasks: (tasks: ScheduledTask[]) => void;
  setReports: (reports: Report[]) => void;
  setSettings: (settings: PlatformSetting[]) => void;
  setFeatureFlags: (flags: FeatureFlag[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      // Initial State
      kpis: null,
      shops: [],
      selectedShop: null,
      customers: [],
      selectedCustomer: null,
      moderationQueue: [],
      exceptionQueue: [],
      paymentProviders: [],
      returnsQueue: [],
      cmsContent: [],
      securityAlerts: [],
      backgroundJobs: [],
      queueStatus: [],
      cacheStatus: [],
      searchIndexStatus: [],
      storageHealth: [],
      databaseHealth: null,
      apiHealth: [],
      scheduledTasks: [],
      reports: [],
      settings: [],
      featureFlags: [],
      isLoading: false,
      error: null,
      sidebarCollapsed: false,

      // Actions
      setKPIs: (kpis) => set({ kpis }),
      setShops: (shops) => set({ shops }),
      setSelectedShop: (shop) => set({ selectedShop: shop }),
      setCustomers: (customers) => set({ customers }),
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setModerationQueue: (queue) => set({ moderationQueue: queue }),
      setExceptionQueue: (queue) => set({ exceptionQueue: queue }),
      setPaymentProviders: (providers) => set({ paymentProviders: providers }),
      setReturnsQueue: (queue) => set({ returnsQueue: queue }),
      setCMSContent: (content) => set({ cmsContent: content }),
      setSecurityAlerts: (alerts) => set({ securityAlerts: alerts }),
      setBackgroundJobs: (jobs) => set({ backgroundJobs: jobs }),
      setQueueStatus: (status) => set({ queueStatus: status }),
      setCacheStatus: (status) => set({ cacheStatus: status }),
      setSearchIndexStatus: (status) => set({ searchIndexStatus: status }),
      setStorageHealth: (health) => set({ storageHealth: health }),
      setDatabaseHealth: (health) => set({ databaseHealth: health }),
      setAPIHealth: (health) => set({ apiHealth: health }),
      setScheduledTasks: (tasks) => set({ scheduledTasks: tasks }),
      setReports: (reports) => set({ reports }),
      setSettings: (settings) => set({ settings }),
      setFeatureFlags: (flags) => set({ featureFlags: flags }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'nabome-admin-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
