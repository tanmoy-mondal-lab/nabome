import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error, isLoading } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
      });
      navigate("/auth/login", { state: { registered: true } });
    } catch {
      // Error set by hook
    }
  };

  const displayError = validationError || error;

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="font-display text-3xl tracking-widest text-brand-500">
              NABOME
            </Link>
            <h1 className="mt-6 font-display text-2xl text-neutral-900">Create an account</h1>
            <p className="mt-2 text-sm text-neutral-500">Join the NABOME family</p>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-body text-neutral-700 mb-1">
                  First Name *
                </label>
                <input id="firstName" type="text" required value={form.firstName} onChange={handleChange("firstName")} className="input-field" placeholder="John" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-body text-neutral-700 mb-1">
                  Last Name
                </label>
                <input id="lastName" type="text" value={form.lastName} onChange={handleChange("lastName")} className="input-field" placeholder="Doe" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-body text-neutral-700 mb-1">
                Email *
              </label>
              <input id="email" type="email" required value={form.email} onChange={handleChange("email")} className="input-field" placeholder="your@email.com" autoComplete="email" />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-body text-neutral-700 mb-1">
                Phone (optional)
              </label>
              <input id="phone" type="tel" value={form.phone} onChange={handleChange("phone")} className="input-field" placeholder="+91 98765 43210" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-body text-neutral-700 mb-1">
                Password *
              </label>
              <input id="password" type="password" required value={form.password} onChange={handleChange("password")} className="input-field" placeholder="Min. 8 characters" autoComplete="new-password" />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-body text-neutral-700 mb-1">
                Confirm Password *
              </label>
              <input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange("confirmPassword")} className="input-field" placeholder="Re-enter password" autoComplete="new-password" />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6">
              {isLoading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-brand-500 hover:text-brand-600 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:block flex-1 bg-gradient-to-br from-brand-800 to-brand-600 relative">
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="text-center text-white">
            <p className="font-display text-5xl leading-tight mb-6">
              Join the<br />Inner Circle
            </p>
            <p className="font-body text-sm tracking-widest uppercase opacity-70">
              Exclusive access • Early drops • Member benefits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
