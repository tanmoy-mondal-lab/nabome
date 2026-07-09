interface Product {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    salePrice?: number | null;
    compareAtPrice?: number | null;
    isActive: boolean;
    isFeatured: boolean;
    isNew: boolean;
    gender: string;
    category?: {
        name: string;
    } | null;
    brand?: {
        name: string;
        logoUrl?: string;
    } | null;
    images: {
        url: string;
        isPrimary: boolean;
    }[];
    variants: {
        stock: number;
        sku: string;
    }[];
}
interface ProductGridCardProps {
    product: Product;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}
export declare function ProductGridCard({ product, onEdit, onDelete, onDuplicate }: ProductGridCardProps): import("react").JSX.Element;
export {};
