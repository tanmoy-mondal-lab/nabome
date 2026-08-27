import { RouterProvider } from 'react-router';

import { router } from './routes';
import { ErrorBoundary } from '../shared/error/ErrorBoundary';

/** Root component — the router is created once at module scope (React Router v7). */
export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
