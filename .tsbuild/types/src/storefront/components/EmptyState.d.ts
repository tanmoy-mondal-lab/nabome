interface EmptyStateProps {
    type?: "products" | "search" | "wishlist" | "cart";
    title?: string;
    message?: string;
    action?: React.ReactNode;
    className?: string;
}
export declare function EmptyState({ type, title, message, action, className }: EmptyStateProps): import("react").JSX.Element;
export {};
