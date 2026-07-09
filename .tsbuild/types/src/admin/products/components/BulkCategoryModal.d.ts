interface BulkCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (data: {
        categoryId?: string;
        subcategoryId?: string;
        collectionId?: string;
    }) => void;
    categories: {
        id: string;
        name: string;
        subcategories?: {
            id: string;
            name: string;
        }[];
    }[];
    collections: {
        id: string;
        name: string;
    }[];
    count: number;
    loading?: boolean;
}
export declare function BulkCategoryModal({ open, onClose, onConfirm, categories, collections, count, loading }: BulkCategoryModalProps): import("react").JSX.Element;
export {};
