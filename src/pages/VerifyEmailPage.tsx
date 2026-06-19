import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authApi } from "../lib/api/auth";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

type VerifyState = "loading" | "success" | "error" | "missing_token";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState("missing_token");
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setState("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setState("error");
        setMessage(err.message || "Verification failed");
      });
  }, [searchParams]);

  const content = {
    loading: {
      icon: <Loader2 className="w-12 h-12 animate-spin text-brand-500" />,
      title: "Verifying your email…",
      subtitle: "Please wait while we confirm your email address.",
    },
    success: {
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      title: "Email Verified!",
      subtitle: message || "Your email has been verified successfully.",
    },
    error: {
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      title: "Verification Failed",
      subtitle: message || "The verification link is invalid or has expired.",
    },
    missing_token: {
      icon: <AlertCircle className="w-12 h-12 text-amber-500" />,
      title: "Invalid Link",
      subtitle: "No verification token found in the URL.",
    },
  }[state];

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
        <div className="flex justify-center mb-4">{content.icon}</div>
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">
          {content.title}
        </h1>
        <p className="text-neutral-500 text-sm mb-6">{content.subtitle}</p>

        {state === "success" && (
          <Link
            to="/auth/login"
            className="inline-block px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors"
          >
            Sign In
          </Link>
        )}

        {state === "error" && (
          <Link
            to="/auth/login"
            className="inline-block px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors"
          >
            Back to Login
          </Link>
        )}

        {state === "missing_token" && (
          <Link
            to="/"
            className="inline-block px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors"
          >
            Go Home
          </Link>
        )}
      </div>
    </div>
  );
}
