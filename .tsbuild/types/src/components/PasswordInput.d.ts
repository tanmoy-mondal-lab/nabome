interface PasswordInputProps {
    id?: string;
    name?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    autoComplete?: string;
    className?: string;
    ariaInvalid?: boolean;
    ariaDescribedBy?: string;
}
export declare function PasswordInput({ id, name, value, onChange, placeholder, required, autoComplete, className, ariaInvalid, ariaDescribedBy }: PasswordInputProps): import("react").JSX.Element;
export {};
