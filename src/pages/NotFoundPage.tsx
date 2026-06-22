import { Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "../stores/auth-store";

export default function NotFoundPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-display text-brand-500 mb-2">404</h1>
        <p className="text-xl text-neutral-500 font-light mb-6">The page you are looking for does not exist.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          {isAdmin && (
            <Link to="/admin" className="btn-secondary inline-flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
