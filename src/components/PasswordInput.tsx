import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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

export function PasswordInput({ id, name, value, onChange, placeholder, required, autoComplete, className = "", ariaInvalid, ariaDescribedBy }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field w-full pr-10"
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
