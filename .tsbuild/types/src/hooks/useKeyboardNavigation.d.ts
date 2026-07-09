export declare function useKeyboardNavigation(handlers: Record<string, () => void>, deps?: React.DependencyList): void;
export declare function useEscapeHandler(callback: () => void, enabled?: boolean): void;
export declare function useArrowNavigation(itemCount: number, currentIndex: number, setCurrentIndex: (index: number) => void, enabled?: boolean): void;
