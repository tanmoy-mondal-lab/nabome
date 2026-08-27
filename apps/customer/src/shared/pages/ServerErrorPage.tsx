import { Link } from 'react-router';

import { buttonVariants } from '@nabome/ui';

export function ServerErrorPage() {
  return (
    <div className="mx-auto flex min-h-[50dvh] w-full max-w-(--container-default) flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <p className="font-display text-6xl">500</p>
      <p className="text-sm text-(--text-secondary)">
        Something went wrong on our side. Please try again later.
      </p>
      <Link
        to="/"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Back to home
      </Link>
    </div>
  );
}
