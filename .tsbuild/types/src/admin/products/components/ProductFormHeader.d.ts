interface ProductFormHeaderProps {
    isEdit: boolean;
    productName: string;
    saving: boolean;
    saveError: string | null;
    dirty: boolean;
    onBack: () => void;
    onSave: () => void;
    onDuplicate?: () => void;
    onDismissError: () => void;
}
export declare function ProductFormHeader({ isEdit, productName, saving, saveError, dirty, onBack, onSave, onDuplicate, onDismissError, }: ProductFormHeaderProps): import("react").JSX.Element;
export {};
