interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    category?: string;
}
interface RelatedProductsProps {
    products: Product[];
    isLoading?: boolean;
    title?: string;
    className?: string;
}
export declare function RelatedProducts({ products, isLoading, title, className, }: RelatedProductsProps): import("react").JSX.Element | null;
export {};
