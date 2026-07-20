import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";

function OfflineMessage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-subtle p-8 max-w-md mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-neutral-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 010-1.414m-3.535 3.535a9 9 0 010-12.728" />
          </svg>
        </div>
        <h2 className="text-xl font-display text-neutral-900 mb-2">You're offline</h2>
        <p className="text-sm text-neutral-500 mb-6">Please check your internet connection and try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-neutral-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuthStore();
  const location = useLocation();

  const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

  // Show offline screen instead of spinner or redirect when offline
  if (!isOnline) {
    return <OfflineMessage />;
  }

  // Show nothing while checking auth state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Redirect non-admins trying to access admin routes
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
