interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string;
}
interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    isLoading?: boolean;
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    onRowClick?: (item: T) => void;
    actions?: (item: T) => React.ReactNode;
    emptyMessage?: string;
}
export declare function DataTable<T>({ columns, data, isLoading, page, totalPages, onPageChange, onSearch, searchPlaceholder, onRowClick, actions, emptyMessage, }: DataTableProps<T>): import("react").JSX.Element;
export {};
