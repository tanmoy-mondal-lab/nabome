import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export interface SiteSettings {
  siteName: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  ogImageUrl?: string;
  currency: string;
  taxRate: number;
  freeShippingThreshold?: number;
  shippingInfo?: Record<string, unknown>;
  returnPolicy?: Record<string, unknown>;
  aboutUs?: Record<string, unknown>;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  theme?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  socialLinks?: Array<{ platform: string; url: string; label?: string }>;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings", "public"],
    queryFn: () => api.get<SiteSettings>("/api/settings", { params: { action: "public" } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
