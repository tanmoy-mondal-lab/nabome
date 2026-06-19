import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PasswordInput } from "../components/PasswordInput";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const { resetPassword, error, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    try {
      await resetPassword(password);
      navigate("/auth/login", { state: { reset: true } });
    } catch {
      // Error set by hook
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-3xl tracking-widest text-brand-500">
            NABOME
          </Link>
          <h1 className="mt-6 font-display text-2xl text-neutral-900">Reset your password</h1>
          <p className="mt-2 text-sm text-neutral-500">Choose a new password for your account</p>
        </div>

        {displayError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-body text-neutral-700 mb-1">
              New Password
            </label>
            <PasswordInput id="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" required />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-body text-neutral-700 mb-1">
              Confirm Password
            </label>
            <PasswordInput id="confirmPassword" value={confirmPassword} onChange={setConfirmPassword} placeholder="Re-enter password" required />
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? "Resetting…" : "Reset Password"}
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
