import { Link } from 'react-router';

import { buttonVariants } from '@nabome/ui';

/** Foundation pages for the shop app — feature pages ship with later prompts. */
export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-(--border-default) p-8 text-center">
      <h1 className="font-display text-2xl">{title}</h1>
      {description ? (
        <p className="max-w-md text-sm text-(--text-secondary)">
          {description}
        </p>
      ) : null}
      <Link
        to="/dashboard"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
