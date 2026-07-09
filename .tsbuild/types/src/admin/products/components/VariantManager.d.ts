import type { Variant } from "../hooks/useProductForm";
interface VariantManagerProps {
    variants: Variant[];
    onChange: (variants: Variant[]) => void;
    uploadingMedia: boolean;
    onUploadStart: () => void;
    onUploadEnd: () => void;
    onPendingImage: (data: {
        url: string;
        publicId: string;
        variantId: string;
    } | null) => void;
}
export declare function VariantManager({ variants, onChange, uploadingMedia, onUploadStart, onUploadEnd, onPendingImage, }: VariantManagerProps): import("react").JSX.Element;
export {};
