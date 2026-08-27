import type { HTMLAttributes, ReactNode } from 'react';

import { Card as UiCard } from '@nabome/ui';
export { UiCard as Card };
export function CardHeader({
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
export function CardContent({
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
export function CardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { children?: ReactNode }) {
  return (
    <h3 className={className} {...props}>
      {children}
    </h3>
  );
}
export function CardDescription({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children?: ReactNode }) {
  return (
    <p className={className} {...props}>
      {children}
    </p>
  );
}
export function CardFooter({
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
