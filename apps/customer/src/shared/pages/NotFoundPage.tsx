import { Link } from 'react-router';

import { buttonVariants } from '@nabome/ui';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[50dvh] w-full max-w-(--container-default) flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <p className="font-display text-6xl">404</p>
      <p className="text-sm text-(--text-secondary)">Page not found</p>
      <Link
        to="/"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Back to home
      </Link>
    </div>
  );
}
