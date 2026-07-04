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
    {
      id: "men", label: "Men", link: "/categories/men", type: "mega_menu",
      megaMenuColumns: [
        {
          id: "men-clothing", title: "Clothing",
          items: [
            { label: "Shirts", url: "/products?category=men&subcategory=shirts" },
            { label: "Trousers", url: "/products?category=men&subcategory=trousers" },
            { label: "Blazers", url: "/products?category=men&subcategory=blazers" },
            { label: "Kurtas", url: "/products?category=men&subcategory=kurtas" },
          ],
        },
        {
          id: "men-featured", title: "Featured",
          items: [
            { label: "New Arrivals", url: "/categories/men?sort=newest" },
            { label: "Best Sellers", url: "/categories/men?sort=best_selling" },
            { label: "All Men", url: "/categories/men" },
          ],
        },
      ],
    },
    {
      id: "women", label: "Women", link: "/categories/women", type: "mega_menu",
      megaMenuColumns: [
        {
          id: "women-clothing", title: "Clothing",
          items: [
            { label: "Dresses", url: "/products?category=women&subcategory=dresses" },
            { label: "Sarees", url: "/products?category=women&subcategory=sarees" },
            { label: "Suits", url: "/products?category=women&subcategory=suits" },
          ],
        },
        {
          id: "women-featured", title: "Featured",
          items: [
            { label: "New Arrivals", url: "/categories/women?sort=newest" },
            { label: "Best Sellers", url: "/categories/women?sort=best_selling" },
            { label: "All Women", url: "/categories/women" },
          ],
        },
      ],
    },
    { id: "accessories", label: "Accessories", link: "/categories/accessories" },
    { id: "collections", label: "Collections", link: "/products" },
    { id: "lookbook", label: "Lookbook", link: "/lookbooks" },
  ],
  footer: [
    { id: "privacy", label: "Privacy", link: "/privacy" },
    { id: "terms", label: "Terms", link: "/terms" },
    { id: "shipping-returns", label: "Shipping & Returns", link: "/shipping-returns" },
    { id: "faq", label: "FAQ", link: "/faq" },
  ],
  mobile: [
    { id: "men", label: "Men", link: "/categories/men" },
    { id: "women", label: "Women", link: "/categories/women" },
    { id: "accessories", label: "Accessories", link: "/categories/accessories" },
    { id: "collections", label: "Collections", link: "/products" },
    { id: "lookbook", label: "Lookbook", link: "/lookbooks" },
    { id: "faq", label: "FAQ", link: "/faq" },
    { id: "support", label: "Support", link: "/account/support" },
  ],
  sidebar: [
    { id: "men", label: "Men", link: "/categories/men" },
    { id: "women", label: "Women", link: "/categories/women" },
    { id: "accessories", label: "Accessories", link: "/categories/accessories" },
    { id: "collections", label: "Collections", link: "/products" },
    { id: "lookbook", label: "Lookbook", link: "/lookbooks" },
    { id: "faq", label: "FAQ", link: "/faq" },
  ],
};

export function useNavigation(location: "header" | "footer" | "mobile" | "sidebar") {
  return useQuery({
    queryKey: ["cms", "navigation", location],
    queryFn: async () => {
      try {
        return await api.get<NavigationResponse>("/cms/navigation", { params: { location } });
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
