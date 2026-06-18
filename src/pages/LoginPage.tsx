import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      if (user.role === "super_admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      // Error is set in useAuth
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="font-display text-3xl tracking-widest text-brand-500">
              NABOME
            </Link>
            <h1 className="mt-6 font-display text-2xl text-neutral-900">Welcome back</h1>
            <p className="mt-2 text-sm text-neutral-500">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-body text-neutral-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-body text-neutral-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 border-neutral-300 rounded" />
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>
              <Link to="/auth/forgot-password" className="text-sm text-brand-500 hover:text-brand-600">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link to="/auth/register" className="text-brand-500 hover:text-brand-600 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel — brand image */}
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-brand-900 to-brand-700 relative">
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="text-center text-white">
            <p className="font-display text-5xl leading-tight mb-6">
              Timeless<br />Elegance
            </p>
            <p className="font-body text-sm tracking-widest uppercase opacity-70">
              Premium Fashion Since 2020
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
