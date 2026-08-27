import type { ReactNode, SelectHTMLAttributes } from 'react';

import { Select as UiSelect } from '@nabome/ui';

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export function Select({
  value,
  onValueChange,
  children,
  onChange,
  ...props
}: SelectProps) {
  return (
    <UiSelect
      {...props}
      value={value}
      onChange={(e) => {
        onValueChange?.(e.target.value);
        onChange?.(e);
      }}
    >
      {children}
    </UiSelect>
  );
}
export function SelectTrigger({
  children,
  ...props
}: {
  children?: ReactNode;
  className?: string;
}) {
  return <div {...props}>{children}</div>;
}
export function SelectContent({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}
export function SelectItem({
  children,
  value,
  ...props
}: {
  children?: ReactNode;
  value: string;
  className?: string;
}) {
  return (
    <option value={value} {...props}>
      {children}
    </option>
  );
}
export function SelectValue({ placeholder }: { placeholder?: string }) {
  return (
    <option value="" disabled>
      {placeholder}
    </option>
  );
}
