import { Link } from 'react-router';

import { buttonVariants } from '@nabome/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-3 text-center">
      <p className="font-display text-5xl">404</p>
      <Link
        to="/dashboard"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        Back to dashboard
      </Link>
    </div>
  );
}
