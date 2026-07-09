interface SizeSelectorProps {
    sizes: string[];
    selected: string;
    onChange: (size: string) => void;
    stock?: Record<string, number>;
}
export declare function SizeSelector({ sizes, selected, onChange, stock }: SizeSelectorProps): import("react").JSX.Element;
export {};
