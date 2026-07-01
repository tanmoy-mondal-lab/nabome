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

const DEFAULT_NAV_BY_LOCATION: Record<NavigationMenu["location"], NavigationItem[]> = {
  header: [
    { id: "home", label: "Home", link: "/" },
    { id: "products", label: "Products", link: "/products" },
    { id: "collections", label: "Collections", link: "/collections" },
    { id: "lookbooks", label: "Lookbooks", link: "/lookbooks" },
    { id: "faq", label: "FAQ", link: "/faq" },
  ],
  footer: [
    { id: "privacy", label: "Privacy", link: "/privacy" },
    { id: "terms", label: "Terms", link: "/terms" },
    { id: "shipping-returns", label: "Shipping & Returns", link: "/shipping-returns" },
    { id: "faq", label: "FAQ", link: "/faq" },
  ],
  mobile: [
    { id: "home", label: "Home", link: "/" },
    { id: "products", label: "Products", link: "/products" },
    { id: "collections", label: "Collections", link: "/collections" },
    { id: "lookbooks", label: "Lookbooks", link: "/lookbooks" },
    { id: "faq", label: "FAQ", link: "/faq" },
    { id: "support", label: "Support", link: "/account/support" },
  ],
  sidebar: [
    { id: "home", label: "Home", link: "/" },
    { id: "products", label: "Products", link: "/products" },
    { id: "collections", label: "Collections", link: "/collections" },
    { id: "lookbooks", label: "Lookbooks", link: "/lookbooks" },
    { id: "faq", label: "FAQ", link: "/faq" },
  ],
};

export function useNavigation(location: "header" | "footer" | "mobile" | "sidebar") {
  return useQuery({
    queryKey: ["cms", "navigation", location],
    queryFn: async () => {
      try {
        return await api.get<NavigationResponse>(`/api/cms/navigation?location=${location}`);
      } catch {
        return { menus: [] };
      }
    },
    select: (data) => {
      if (!data?.menus) return DEFAULT_NAV_BY_LOCATION[location];
      const menu = data.menus.find((m) => m.location === location);
      return menu?.items?.length ? menu.items : DEFAULT_NAV_BY_LOCATION[location];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
}
