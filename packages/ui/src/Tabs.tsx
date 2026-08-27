import { cva } from 'class-variance-authority';
import { forwardRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@nabome/utils';

/**
 * Tabs — tabbed interface for content switching (COMPONENT_LIBRARY_SPECIFICATION §10).
 * Accessible with keyboard navigation.
 */

export const tabsListVariants = cva('flex border-b border-(--border-default)', {
  variants: {
    variant: {
      default: '',
      pills: 'border-none gap-2',
    },
    align: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
    },
  },
  defaultVariants: {
    variant: 'default',
    align: 'start',
  },
});

export const tabVariants = cva(
  'px-4 py-2 text-sm font-medium transition-colors duration-(--duration-fast) ease-(--ease-default) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        default:
          'border-b-2 border-transparent text-(--text-secondary) hover:text-(--text-primary) data-[state=active]:border-(--color-brand-500) data-[state=active]:text-(--color-brand-500)',
        pills:
          'rounded-md text-(--text-secondary) hover:bg-(--color-neutral-100) data-[state=active]:bg-(--color-brand-500) data-[state=active]:text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /** Tabs variant */
  variant?: 'default' | 'pills';
  /** Tab alignment */
  align?: 'start' | 'center' | 'end';
  /** Default active tab */
  defaultValue?: string;
  /** Tab change callback */
  onValueChange?: (value: string) => void;
  /** Tab list items */
  tabs: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Tab content panels */
  children?: ReactNode;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      className,
      variant,
      align,
      defaultValue,
      onValueChange,
      tabs,
      children,
      ...props
    },
    ref,
  ) => {
    const [activeTab, setActiveTab] = useState(
      defaultValue || tabs[0]?.value || '',
    );

    const handleTabChange = (value: string) => {
      setActiveTab(value);
      onValueChange?.(value);
    };

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div
          role="tablist"
          className={cn(tabsListVariants({ variant, align }))}
        >
          {tabs.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={activeTab === tab.value}
              data-state={activeTab === tab.value ? 'active' : 'inactive'}
              disabled={tab.disabled}
              className={cn(tabVariants({ variant }))}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {children && (
          <div className="mt-4">
            {Array.isArray(children)
              ? children[activeTab === tabs[0]?.value ? 0 : 1]
              : children}
          </div>
        )}
      </div>
    );
  },
);
Tabs.displayName = 'Tabs';
