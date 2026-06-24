import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export interface NavigationItem {
  id: string;
  label: string;
  link?: string;
  url?: string;
  children?: NavigationItem[];
  visibility?: "all" | "logged_in" | "logged_out";
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
    queryFn: () => api.get<NavigationResponse>("/api/cms/navigation"),
    select: (data) => {
      if (!data?.menus) return [];
      const menu = data.menus.find((m) => m.location === location);
      return menu?.items ?? [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}
