import { RouterProvider } from 'react-router';

import { router } from './routes';

/** Root component — the router is created once at module scope (React Router v7). */
export function App() {
  return <RouterProvider router={router} />;
}
