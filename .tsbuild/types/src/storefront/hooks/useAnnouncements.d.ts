export interface Announcement {
    id: string;
    message: string;
    linkUrl?: string;
    linkText?: string;
    bgColor?: string;
    textColor?: string;
    position: "top" | "bottom";
}
export declare function useAnnouncements(): import("@tanstack/react-query").UseQueryResult<NoInfer<Announcement>, Error>;
