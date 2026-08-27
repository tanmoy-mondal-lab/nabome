import type { ComponentProps } from 'react';

import { Checkbox as UiCheckbox } from '@nabome/ui';
export function Checkbox(
  props: ComponentProps<typeof UiCheckbox> & {
    onCheckedChange?: (checked: boolean) => void;
  },
) {
  const { onCheckedChange, onChange, ...rest } = props as ComponentProps<
    typeof UiCheckbox
  > & {
    onCheckedChange?: (checked: boolean) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  return (
    <UiCheckbox
      {...rest}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(e.target.checked);
        onChange?.(e);
      }}
    />
  );
}
