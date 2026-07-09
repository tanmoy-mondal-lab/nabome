export interface NavItem {
    id: string;
    label: string;
    link?: string;
    url?: string;
    type?: string;
    image?: string;
    description?: string;
    children?: NavItem[];
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
export declare function MegaMenu({ label, menus }: {
    label: string;
    menus?: NavItem[];
}): import("react").JSX.Element;
