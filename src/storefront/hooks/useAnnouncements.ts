import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api/client";

export interface Announcement {
  id: string;
  message: string;
  linkUrl?: string;
  linkText?: string;
  bgColor?: string;
  textColor?: string;
  position: "top" | "bottom";
}

interface AnnouncementsResponse {
  announcements: Announcement[];
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["cms", "announcements"],
    queryFn: () => api.get<AnnouncementsResponse>("/api/cms/announcements"),
    select: (data) => {
      const announcements = data?.announcements ?? [];
      return announcements[0] ?? null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
