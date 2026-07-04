import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api/client";
import type { Theme, ThemeHeaderConfig, ThemeFooterConfig, ThemeBranding } from "../../cms/core/cms-types";

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
  theme?: Theme;
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
    queryFn: ({ signal }) => api.get<SiteSettings>("/settings", { params: { action: "public" }, signal }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
