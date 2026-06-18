import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "../components/ui/Toast";
import { GoogleAnalytics } from "../components/GoogleAnalytics";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { STOREFRONT_ROUTES, AUTH_ROUTES, ADMIN_ROUTES } from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-400">Loading…</p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <ErrorBoundary>
            <Routes>
              {STOREFRONT_ROUTES}
              {AUTH_ROUTES}
              {ADMIN_ROUTES}
            </Routes>
          </ErrorBoundary>
        </Suspense>
        <Toaster />
        <GoogleAnalytics />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
