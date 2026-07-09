import type { Product } from "../../types/product";
interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}
export declare function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps): import("react").JSX.Element | null;
export {};
