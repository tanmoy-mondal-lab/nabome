import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PasswordInput } from "../components/PasswordInput";
import { ApiError } from "../lib/api/client";

const OTP_LENGTH = 6;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, verifyResetCode, resetPassword, isLoading } = useAuth();
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
      setStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send code");
    }
  }

  async function handleResendCode() {
    setError(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send code");
    }
  }

  async function handleVerifyOtp() {
    setError(null);
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete verification code");
      return;
    }
    try {
      await verifyResetCode(email, code);
      setStep("password");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid verification code");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      await resetPassword(email, otp.join(""), password);
      navigate("/auth/login", { state: { reset: true } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reset password");
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!paste) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < paste.length; i++) {
      next[i] = paste[i];
    }
    setOtp(next);
    otpRefs.current[Math.min(paste.length, OTP_LENGTH - 1)]?.focus();
  }

  function handleBack() {
    setError(null);
    if (step === "otp") {
      setStep("email");
      setOtp(Array(OTP_LENGTH).fill(""));
    } else if (step === "password") {
      setStep("otp");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-display text-3xl tracking-widest text-brand-500">
            নবME
          </Link>
          <h1 className="mt-6 font-display text-2xl text-neutral-900">
            {step === "email" && "Forgot password"}
            {step === "otp" && "Check your email"}
            {step === "password" && "Reset your password"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {step === "email" && "Enter your email and we'll send you a verification code"}
            {step === "otp" && `Enter the 6-digit code sent to ${email}`}
            {step === "password" && "Choose a new password for your account"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleSendCode} className="space-y-5">
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
              {isLoading ? "Sending…" : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-10 h-12 text-center text-lg font-mono border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                />
              ))}
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={isLoading || otp.join("").length !== OTP_LENGTH}
              className="btn-primary w-full"
            >
              {isLoading ? "Verifying…" : "Verify Code"}
            </button>
            <div className="flex items-center justify-between">
              <button onClick={handleBack} className="text-sm text-neutral-500 hover:text-neutral-700">
                Back
              </button>
              <button
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-sm text-brand-500 hover:text-brand-600"
              >
                Resend Code
              </button>
            </div>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === "password" && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-body text-neutral-700 mb-1">
                New Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="Min. 8 characters"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-body text-neutral-700 mb-1">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter password"
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? "Resetting…" : "Reset Password"}
            </button>
            <div className="text-center">
              <button onClick={handleBack} className="text-sm text-neutral-500 hover:text-neutral-700">
                Back
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/auth/login" className="text-sm text-brand-500 hover:text-brand-600">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
