import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { forgotPassword, error, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      // Error set by hook
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <Link to="/" className="font-display text-3xl tracking-widest text-brand-500">
            NABOME
          </Link>
          <div className="mt-10 p-8 bg-brand-50 border border-brand-200 rounded">
            <h1 className="font-display text-2xl text-neutral-900 mb-4">Check your email</h1>
            <p className="text-neutral-600 text-sm leading-relaxed">
              If an account exists with <strong className="text-neutral-900">{email}</strong>,
              we've sent a password reset link. It expires in 1 hour.
            </p>
          </div>
          <Link to="/auth/login" className="btn-ghost mt-8 inline-block">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-3xl tracking-widest text-brand-500">
            NABOME
          </Link>
          <h1 className="mt-6 font-display text-2xl text-neutral-900">Forgot password</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Enter your email and we'll send you a reset link
          </p>
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
            />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? "Sending…" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/auth/login" className="text-sm text-brand-500 hover:text-brand-600">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
