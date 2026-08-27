/**
 * HomepageContainer — main homepage container (HOMEPAGE_BUILDER_ARCHITECTURE §5)
 * Renders all sections from CMS configuration with error boundaries and loading states.
 */

import { useEffect } from 'react';
import { Suspense } from 'react';

import { ErrorState } from '@nabome/ui';
import { Skeleton } from '@nabome/ui';
import { Button } from '@nabome/ui';

import { useProcessedHomepage } from '../hooks/use-homepage';
import { registerAllSections } from '../sections/registration';

import { HomepageRenderer } from './HomepageRenderer';

export function HomepageContainer() {
  // Register sections on mount
  useEffect(() => {
    registerAllSections();
  }, []);

  const { config, isLoading, error } = useProcessedHomepage();

  if (isLoading) {
    return <HomepageSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load homepage"
        description="Please refresh the page or try again later."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  if (!config) {
    return (
      <ErrorState
        title="No homepage configuration"
        description="Please contact support if this issue persists."
      />
    );
  }

  return (
    <Suspense fallback={<HomepageSkeleton />}>
      <HomepageRenderer config={config} />
    </Suspense>
  );
}

/**
 * Homepage skeleton for loading state
 */
function HomepageSkeleton() {
  return (
    <div className="w-full">
      <div className="h-64 w-full bg-(--color-neutral-100)" />
      <div className="mx-auto max-w-(--width-container-md) space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="aspect-square" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
