import { api } from "../client";

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  template?: string;
  isPublished: boolean;
  metaTitle?: string;
  metaDesc?: string;
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HomepageSection {
  id: string;
  sectionType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  styles?: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
  visibility?: string;
  publishAt?: string;
  expireAt?: string;
}

export interface NavigationMenu {
  id: string;
  name: string;
  location: string;
  items: NavigationItem[];
  isActive: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  url?: string;
  type?: string;
  sortOrder: number;
  children?: NavigationItem[];
}

export interface FooterSection {
  id: string;
  column: string;
  title: string;
  contentType: string;
  content?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export const cmsApi = {
  // Pages
  getPages: () => api.get<{ pages: CMSPage[] }>("/admin/cms/pages"),
  getPage: (id: string) => api.get<{ page: CMSPage }>(`/admin/cms/pages/${id}`),
  createPage: (data: Partial<CMSPage>) => api.post<CMSPage>("/admin/cms/pages", data),
  updatePage: (id: string, data: Partial<CMSPage>) => api.put<CMSPage>(`/admin/cms/pages/${id}`, data),
  deletePage: (id: string) => api.delete<{ message: string }>(`/admin/cms/pages/${id}`),

  // Homepage
  getHomepageSections: () => api.get<{ sections: HomepageSection[] }>("/admin/cms/homepage"),
  createHomeSection: (data: Partial<HomepageSection>) => api.post<HomepageSection>("/admin/cms/homepage", data),
  updateHomeSection: (id: string, data: Partial<HomepageSection>) => api.put<HomepageSection>(`/admin/cms/homepage/${id}`, data),
  deleteHomeSection: (id: string) => api.delete<{ message: string }>(`/admin/cms/homepage/${id}`),
  reorderHomeSections: (order: { id: string; sortOrder: number }[]) =>
    api.put("/admin/cms/homepage/reorder", { order }),

  // Navigation
  getNavigationMenus: () => api.get<{ menus: NavigationMenu[] }>("/admin/cms/navigation"),
  createNavigation: (data: Partial<NavigationMenu>) => api.post<NavigationMenu>("/admin/cms/navigation", data),
  updateNavigation: (id: string, data: Partial<NavigationMenu>) => api.put<NavigationMenu>(`/admin/cms/navigation/${id}`, data),
  deleteNavigation: (id: string) => api.delete<{ message: string }>(`/admin/cms/navigation/${id}`),

  // Footer
  getFooterSections: () => api.get<{ sections: FooterSection[] }>("/admin/cms/footer"),
  createFooterSection: (data: Partial<FooterSection>) => api.post<FooterSection>("/admin/cms/footer", data),
  updateFooterSection: (id: string, data: Partial<FooterSection>) => api.put<FooterSection>(`/admin/cms/footer/${id}`, data),
  deleteFooterSection: (id: string) => api.delete<{ message: string }>(`/admin/cms/footer/${id}`),

  // Announcements
  getAnnouncements: () => api.get<{ announcements: Announcement[] }>("/admin/cms/announcements"),
  createAnnouncement: (data: Partial<Announcement>) => api.post<Announcement>("/admin/cms/announcements", data),
  updateAnnouncement: (id: string, data: Partial<Announcement>) => api.put<Announcement>(`/admin/cms/announcements/${id}`, data),
  deleteAnnouncement: (id: string) => api.delete<{ message: string }>(`/admin/cms/announcements/${id}`),
};
