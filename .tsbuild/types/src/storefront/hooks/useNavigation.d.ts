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
        items: {
            label: string;
            url: string;
            description?: string;
            image?: string;
        }[];
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
export declare function useNavigation(location: "header" | "footer" | "mobile" | "sidebar"): import("@tanstack/react-query").UseQueryResult<NoInfer<NavigationItem[]>, Error>;
