// ─────────────────────────────────────────────────────────────
// ERROR PAGES COMPONENTS
// ─────────────────────────────────────────────────────────────
// Custom error pages for different HTTP error codes
// ─────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface ErrorPageProps {
  code: number;
  title: string;
  message: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

export function ErrorPage({ code, title, message, showHomeButton = true, showBackButton = true }: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">{code}</h1>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className="flex items-center justify-center gap-4">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
          )}
          {showHomeButton && (
            <Link
              to="/"
              className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
    />
  );
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      code={401}
      title="Unauthorized"
      message="You don't have permission to access this page. Please log in."
    />
  );
}

export function ForbiddenPage() {
  return (
    <ErrorPage
      code={403}
      title="Access Denied"
      message="You don't have permission to access this resource."
    />
  );
}

export function ServerErrorPage() {
  return (
    <ErrorPage
      code={500}
      title="Server Error"
      message="Something went wrong on our end. Please try again later."
    />
  );
}

export function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <svg className="w-24 h-24 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Under Maintenance</h2>
        <p className="text-gray-600 mb-8">
          We're currently performing scheduled maintenance. Please check back soon.
        </p>
        <Link
          to="/"
          className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </Link>
      </div>
    </div>
  );
}
