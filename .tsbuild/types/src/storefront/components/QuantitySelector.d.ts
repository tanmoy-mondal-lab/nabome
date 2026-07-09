interface QuantitySelectorProps {
    value: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
}
export declare function QuantitySelector({ value, min, max, onChange }: QuantitySelectorProps): import("react").JSX.Element;
export {};
