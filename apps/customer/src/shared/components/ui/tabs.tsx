import type { HTMLAttributes, ReactNode } from 'react';

export function Tabs({
  children,
  defaultValue,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string;
  children?: ReactNode;
}) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
export function TabsList({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
export function TabsTrigger({
  children,
  value,
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement> & {
  value: string;
  children?: ReactNode;
}) {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
export function TabsContent({
  children,
  value,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value: string; children?: ReactNode }) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
