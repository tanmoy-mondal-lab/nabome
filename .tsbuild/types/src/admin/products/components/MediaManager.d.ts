import type { ProductImage } from "../hooks/useProductForm";
interface MediaManagerProps {
    images: ProductImage[];
    onChange: (images: ProductImage[]) => void;
    uploadingMedia: boolean;
    onUploadStart: () => void;
    onUploadEnd: () => void;
    productName?: string;
    productSlug?: string;
}
export declare function MediaManager({ images, onChange, uploadingMedia, onUploadStart, onUploadEnd, productName, productSlug, }: MediaManagerProps): import("react").JSX.Element;
export {};
