import type { Product } from "../../types/product";
interface ProductGridProps {
    products: Product[];
    columns?: number;
    isLoading?: boolean;
    view?: "grid" | "list";
    onQuickView?: (product: Product) => void;
}
export declare function ProductGrid({ products, columns: _columns, isLoading, view, onQuickView }: ProductGridProps): import("react").JSX.Element;
export {};
