interface MediaPickerProps {
    value: string;
    onChange: (url: string, publicId?: string) => void;
    label?: string;
    folder?: string;
    accept?: string;
    preview?: boolean;
    placeholder?: string;
}
export declare function MediaPicker({ value, onChange, label, folder, accept, preview, placeholder, }: MediaPickerProps): import("react").JSX.Element;
export {};
