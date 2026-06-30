import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export interface NavigationItem {
  id: string;
  type?: string;
  label: string;
  link?: string;
  url?: string;
  image?: string;
  description?: string;
  target?: string;
  badge?: string;
  badgeColor?: string;
  isVisible?: boolean;
  isHighlighted?: boolean;
  children?: NavigationItem[];
  megaMenuColumns?: {
    id: string;
    title: string;
    items: { label: string; url: string; description?: string; image?: string }[];
  }[];
  promotionalContent?: {
    title: string;
    description: string;
    image: string;
    linkUrl: string;
    linkText: string;
  };
}

export interface NavigationMenu {
  id: string;
  name: string;
  location: "header" | "footer" | "mobile" | "sidebar";
  items: NavigationItem[];
}

interface NavigationResponse {
  menus: NavigationMenu[];
}

export function useNavigation(location: "header" | "footer" | "mobile" | "sidebar") {
  return useQuery({
    queryKey: ["cms", "navigation", location],
    queryFn: () => api.get<NavigationResponse>(`/api/cms/navigation?location=${location}`),
    select: (data) => {
      if (!data?.menus) return [];
      const menu = data.menus.find((m) => m.location === location);
      return menu?.items ?? [];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
}
