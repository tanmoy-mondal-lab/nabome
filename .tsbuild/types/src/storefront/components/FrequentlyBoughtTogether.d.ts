import type { Product } from "../../types/product";
interface FrequentlyBoughtTogetherProps {
    products: Product[];
    mainProduct: Product;
}
export declare function FrequentlyBoughtTogether({ products, mainProduct }: FrequentlyBoughtTogetherProps): import("react").JSX.Element | null;
export {};
