import type { Variant } from "../hooks/useProductForm";
interface VariantManagerProps {
    variants: Variant[];
    onChange: (variants: Variant[]) => void;
    uploadingMedia: boolean;
    onUploadStart: () => void;
    onUploadEnd: () => void;
    productSlug?: string;
}
export declare function VariantManager({ variants, onChange, uploadingMedia, onUploadStart, onUploadEnd, productSlug, }: VariantManagerProps): import("react").JSX.Element;
export {};
