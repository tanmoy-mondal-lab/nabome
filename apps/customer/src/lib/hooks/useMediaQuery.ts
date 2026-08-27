import { useEffect, useState } from 'react';

import { breakpoints } from '@nabome/design-tokens';

/** Media-query hook backed by design-token breakpoints. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True when the viewport is at least the tablet breakpoint (640px). */
export function useIsTabletUp(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.tablet}px)`);
}

/** True when the viewport is at least the desktop breakpoint (1024px). */
export function useIsDesktopUp(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.desktop}px)`);
}
