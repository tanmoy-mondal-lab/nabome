interface ColorOption {
    hex: string;
    name: string;
}
interface ColorSelectorProps {
    colors: ColorOption[];
    selected: string;
    onChange: (hex: string) => void;
}
export declare function ColorSelector({ colors, selected, onChange }: ColorSelectorProps): import("react").JSX.Element;
export {};
