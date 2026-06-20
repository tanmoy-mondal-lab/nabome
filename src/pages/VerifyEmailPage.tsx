import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { authApi } from "../lib/api/auth";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

const OTP_LENGTH = 6;

type VerifyState = "form" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [state, setState] = useState<VerifyState>("form");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return;

    setState("loading");
    try {
      const res = await authApi.verifyEmail({ email, code });
      setState("success");
      setMessage(res.message);
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Verification failed");
    }
  };

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    try {
      await authApi.resendVerification(email);
      setOtp(Array(OTP_LENGTH).fill(""));
      setState("form");
      setMessage("");
      inputRefs.current[0]?.focus();
    } catch {
      // Silently handle
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Missing Email</h1>
          <p className="text-neutral-500 text-sm mb-6">No email address was provided. Please sign up again.</p>
          <Link to="/auth/register" className="inline-block px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors">Sign Up</Link>
        </div>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Verifying your email…</h1>
          <p className="text-neutral-500 text-sm">Please wait while we confirm your code.</p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Email Verified!</h1>
          <p className="text-neutral-500 text-sm mb-6">{message || "Your email has been verified successfully."}</p>
          <Link to="/auth/login" className="inline-block px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded hover:bg-neutral-800 transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  const code = otp.join("");
  const isComplete = code.length === OTP_LENGTH;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <Link to="/auth/login" className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">Verify Your Email</h1>
          <p className="text-neutral-500 text-sm">
            Enter the 6-digit code sent to <span className="font-medium text-neutral-700">{email}</span>
          </p>
        </div>

        {state === "error" && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        )}

        <div className="flex justify-center gap-2 sm:gap-3 mb-8">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl font-semibold border border-neutral-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify Email
        </button>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Didn't receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-brand-500 hover:text-brand-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? "Sending…" : "Resend Code"}
          </button>
        </p>
      </div>
    </div>
  );
}