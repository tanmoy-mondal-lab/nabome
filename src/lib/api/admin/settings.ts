import { api } from "../client";

export interface SiteSettings {
  siteName: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  metaTitle?: string;
  metaDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialLinks?: SocialLink[];
  currency?: string;
  timezone?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

export const settingsApi = {
  getSettings: () => api.get<{ settings: SiteSettings }>("/admin/settings"),
  updateSettings: (data: Partial<SiteSettings>) => api.put<{ settings: SiteSettings }>("/admin/settings", data),

  // Social Links
  getSocialLinks: () => api.get<{ links: SocialLink[] }>("/admin/social-links"),
  createSocialLink: (data: Partial<SocialLink>) => api.post<SocialLink>("/admin/social-links", data),
  updateSocialLink: (id: string, data: Partial<SocialLink>) => api.put<SocialLink>(`/admin/social-links/${id}`, data),
  deleteSocialLink: (id: string) => api.delete<{ message: string }>(`/admin/social-links/${id}`),
};
