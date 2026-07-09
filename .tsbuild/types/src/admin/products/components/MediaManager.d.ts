import type { ProductImage } from "../hooks/useProductForm";
interface MediaManagerProps {
    images: ProductImage[];
    onChange: (images: ProductImage[]) => void;
    uploadingMedia: boolean;
    onUploadStart: () => void;
    onUploadEnd: () => void;
    onPendingImage: (data: {
        url: string;
        publicId: string;
        variantId?: string;
    } | null) => void;
    productName?: string;
}
export declare function MediaManager({ images, onChange, uploadingMedia, onUploadStart, onUploadEnd, onPendingImage, productName, }: MediaManagerProps): import("react").JSX.Element;
export {};
