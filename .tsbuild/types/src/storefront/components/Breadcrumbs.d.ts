interface Crumb {
    label: string;
    href?: string;
}
interface BreadcrumbsProps {
    items: Crumb[];
    className?: string;
}
export declare function Breadcrumbs({ items, className }: BreadcrumbsProps): import("react").JSX.Element;
export {};
