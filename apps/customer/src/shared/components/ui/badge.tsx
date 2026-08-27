import type { ComponentProps } from 'react';

import { Badge as UiBadge } from '@nabome/ui';
export function Badge(
  props: ComponentProps<typeof UiBadge> & { variant?: string },
) {
  const variantMap: Record<string, ComponentProps<typeof UiBadge>['variant']> =
    {
      secondary: 'neutral',
      default: 'neutral',
      destructive: 'error',
    };
  const v = props.variant
    ? (variantMap[props.variant] ??
      (props.variant as ComponentProps<typeof UiBadge>['variant']))
    : undefined;
  return <UiBadge {...props} variant={v} />;
}
