interface BreadcrumbItem {
    label: string;
    href?: string;
    current?: boolean;
}
interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}
export declare function Breadcrumbs({ items, className }: BreadcrumbsProps): import("react").JSX.Element | null;
interface BreadcrumbProps {
    label: string;
    href?: string;
    current?: boolean;
}
export declare function Breadcrumb({ label, href, current }: BreadcrumbProps): import("react").JSX.Element;
export {};
