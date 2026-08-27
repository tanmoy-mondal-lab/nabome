import { Link } from 'react-router';

import { buttonVariants } from '@nabome/ui';

/**
 * PlaceholderPage — used for foundation routes whose feature implementation
 * ships with a later prompt. Keeps the route tree complete and buildable.
 */
export interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto flex min-h-[50dvh] w-full max-w-(--container-default) flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <h1 className="font-display text-3xl">{title}</h1>
      {description ? (
        <p className="max-w-md text-sm text-(--text-secondary)">
          {description}
        </p>
      ) : null}
      <Link
        to="/"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Back to home
      </Link>
    </div>
  );
}
