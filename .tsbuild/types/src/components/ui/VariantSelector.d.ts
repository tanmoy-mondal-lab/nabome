export interface VariantOption {
    id: string;
    name: string;
    value: string;
    available: boolean;
    price?: number;
}
export interface VariantGroup {
    name: string;
    options: VariantOption[];
}
interface VariantSelectorProps {
    groups: VariantGroup[];
    selectedVariants: Record<string, string>;
    onVariantChange: (groupName: string, optionId: string) => void;
    className?: string;
}
export declare function VariantSelector({ groups, selectedVariants, onVariantChange, className, }: VariantSelectorProps): import("react").JSX.Element | null;
interface ColorVariantSelectorProps {
    options: VariantOption[];
    selectedId?: string;
    onSelect: (id: string) => void;
    className?: string;
}
export declare function ColorVariantSelector({ options, selectedId, onSelect, className, }: ColorVariantSelectorProps): import("react").JSX.Element | null;
export {};
