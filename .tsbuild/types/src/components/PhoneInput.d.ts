interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    required?: boolean;
    id?: string;
    ariaInvalid?: boolean;
    ariaDescribedBy?: string;
}
export declare function PhoneInput({ value, onChange, className, required, id, ariaInvalid, ariaDescribedBy }: PhoneInputProps): import("react").JSX.Element;
export {};
