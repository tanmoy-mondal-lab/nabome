import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PasswordInput } from "../components/PasswordInput";
import { useToast } from "../components/ui/Toast";
import { TurnstileWidget } from "../components/TurnstileWidget";
import { turnstileEnabled, turnstileSiteKey } from "../lib/config";
import { Helmet } from "react-helmet-async";

const VERIFICATION_ERROR = "Your email has not been verified";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, resendVerification, error, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resending, setResending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");
  const [turnstileNonce, setTurnstileNonce] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const registrationToastShown = useRef(false);

  const state = location.state as { from?: { pathname: string }; registered?: boolean } | null;
  const from = state?.from?.pathname ?? "/";
  const needsVerification = error?.startsWith(VERIFICATION_ERROR);
  const displayError = turnstileError || error;

  useEffect(() => {
    if (state?.registered && !registrationToastShown.current) {
      registrationToastShown.current = true;
      toast("Account created successfully. Please verify your email with the code sent.", "success");
      window.history.replaceState({}, document.title);
    }
  }, [state?.registered, toast]);


  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await resendVerification(email);
      toast("Verification email sent. Please check your inbox and spam folder.", "success");
    } catch {
      toast("Failed to send verification email. Please try again later.", "error");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (turnstileEnabled && !turnstileToken) {
      setTurnstileError("Please complete the verification challenge");
      return;
    }

    const shouldResetTurnstile = turnstileEnabled && !!turnstileToken;
    try {
      const user = await login({ email, password, turnstileToken: turnstileToken || undefined, rememberMe });
      toast(`Welcome back, ${user.firstName}`, "success");
        if (user.role === "admin") {
        void navigate("/admin", { replace: true });
      } else {
        void navigate(from, { replace: true });
      }
    } catch {
      // Error is set in useAuth
    } finally {
      if (shouldResetTurnstile) {
        setTurnstileToken("");
        setTurnstileNonce((value) => value + 1);
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      <Helmet>
        <title>Sign In — নবME</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {/* Left panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link to="/" className="font-display text-3xl tracking-widest text-brand-500">
              নবME
            </Link>
            <h1 className="mt-6 font-display text-2xl text-neutral-900">Welcome back</h1>
            <p className="mt-2 text-sm text-neutral-500">Sign in to your account</p>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">{displayError}</p>
              {needsVerification && (
                <div className="mt-3 flex flex-col items-start gap-2">
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-xs text-brand-600 hover:text-brand-700 underline disabled:opacity-50"
                  >
                    {resending ? "Sending…" : "Resend verification code"}
                  </button>
                  <Link
                    to={`/auth/verify-email?email=${encodeURIComponent(email)}`}
                    className="text-xs text-brand-600 hover:text-brand-700 underline"
                  >
                    Verify email now
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-body text-neutral-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
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
              <PasswordInput
                id="password"
                name="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {turnstileEnabled && (
              <TurnstileWidget
                key={turnstileNonce}
                siteKey={turnstileSiteKey}
                onTokenChange={(token) => {
                  setTurnstileToken(token);
                  if (token) setTurnstileError("");
                }}
                onError={setTurnstileError}
              />
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 border-neutral-300 rounded" />
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>
              <Link to="/auth/forgot-password" className="text-sm text-brand-500 hover:text-brand-600">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isLoading || (turnstileEnabled && !turnstileToken)} className="btn-primary w-full">
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
