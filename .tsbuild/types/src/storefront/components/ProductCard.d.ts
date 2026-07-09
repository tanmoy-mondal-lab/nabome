import type { Product } from "../../types/product";
interface ProductCardProps {
    product: Product;
    onQuickView?: () => void;
    view?: "grid" | "list";
}
export declare function ProductCard({ product, onQuickView, view }: ProductCardProps): import("react").JSX.Element;
export {};
