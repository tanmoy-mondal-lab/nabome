import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "public"] });
    };
    window.addEventListener("settings:updated", handler);
    return () => window.removeEventListener("settings:updated", handler);
  }, [queryClient]);

  return useQuery({
    queryKey: ["settings", "public"],
    queryFn: () => api.get<SiteSettings>("/api/settings", { params: { action: "public" } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
