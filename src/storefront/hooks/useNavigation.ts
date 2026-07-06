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
            { label: "Shirts", url: "/categories/men?subcategory=shirts" },
            { label: "Trousers", url: "/categories/men?subcategory=trousers" },
            { label: "Blazers", url: "/categories/men?subcategory=blazers" },
            { label: "Kurtas", url: "/categories/men?subcategory=kurtas" },
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
            { label: "Dresses", url: "/categories/women?subcategory=dresses" },
            { label: "Sarees", url: "/categories/women?subcategory=sarees" },
            { label: "Suits", url: "/categories/women?subcategory=suits" },
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
    { id: "accessories", label: "Accessories", link: "/categories/accessories", type: "link" },
    { id: "collections", label: "Collections", link: "/collections", type: "link" },
    { id: "lookbook", label: "Lookbook", link: "/lookbooks", type: "link" },
  ],
  footer: [
    { id: "privacy", label: "Privacy", link: "/privacy", type: "link" },
    { id: "terms", label: "Terms", link: "/terms", type: "link" },
    { id: "shipping-returns", label: "Shipping & Returns", link: "/shipping-returns", type: "link" },
    { id: "faq", label: "FAQ", link: "/faq", type: "link" },
  ],
  mobile: [
    { id: "men", label: "Men", link: "/categories/men", type: "link" },
    { id: "women", label: "Women", link: "/categories/women", type: "link" },
    { id: "accessories", label: "Accessories", link: "/categories/accessories", type: "link" },
    { id: "collections", label: "Collections", link: "/collections", type: "link" },
    { id: "lookbook", label: "Lookbook", link: "/lookbooks", type: "link" },
    { id: "faq", label: "FAQ", link: "/faq", type: "link" },
    { id: "support", label: "Support", link: "/account/support", type: "link" },
  ],
  sidebar: [
    { id: "men", label: "Men", link: "/categories/men", type: "link" },
    { id: "women", label: "Women", link: "/categories/women", type: "link" },
    { id: "accessories", label: "Accessories", link: "/categories/accessories", type: "link" },
    { id: "collections", label: "Collections", link: "/collections", type: "link" },
    { id: "lookbook", label: "Lookbook", link: "/lookbooks", type: "link" },
    { id: "faq", label: "FAQ", link: "/faq", type: "link" },
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
      const defaults = DEFAULT_NAV_BY_LOCATION[location];
      if (!data?.menus) return defaults;
      const menu = data.menus.find((m) => m.location === location);
      if (!menu?.items?.length) return defaults;

      const cmsItems = menu.items;

      // For header and mobile: ensure category links are always present
      if (location === "header" || location === "mobile") {
        const categoryLinks = defaults.filter(
          (d) => d.link?.startsWith("/categories/") || d.link?.startsWith("/collections") || d.link?.startsWith("/lookbooks")
        );
        const hasCategoryLinks = categoryLinks.some((cl) =>
          cmsItems.some((ci) => ci.link === cl.link || ci.url === cl.link)
        );

        if (!hasCategoryLinks) {
          // CMS items don't have category links — prepend defaults
          const cmsLabels = new Set(cmsItems.map((i) => i.label?.toLowerCase()));
          const missingDefaults = defaults.filter((d) => !cmsLabels.has(d.label?.toLowerCase()));
          return [...missingDefaults, ...cmsItems];
        }
      }

      return cmsItems.map((item) => ({
        ...item,
        type: item.type || "link",
        children: item.children?.map((child) => ({
          ...child,
          type: child.type || "link",
        })),
      }));
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60,
  });
}
