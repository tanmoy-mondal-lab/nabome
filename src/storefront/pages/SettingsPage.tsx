import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Lock, Bell, Mail } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { authApi } from "../../lib/api/auth";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { PhoneInput } from "../../components/PhoneInput";
import { PasswordInput } from "../../components/PasswordInput";

const OTP_LENGTH = 6;

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferences?: {
    marketingOptIn?: boolean;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    orderUpdates?: boolean;
    promotionalEmails?: boolean;
  };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({ firstName: "", lastName: "", phone: "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [preferences, setPreferences] = useState({
    marketingOptIn: false,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotionalEmails: false,
  });
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [emailStep, setEmailStep] = useState<"idle" | "input" | "otp">("idle");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  const { data } = useQuery({
    queryKey: ["customer", "profile"],
    queryFn: () => customerApi.getProfile(),
  });

  const profileData = (data as unknown as { profile: Profile })?.profile;

  useEffect(() => {
    if (profileData) {
      setProfile({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phone: profileData.phone || "",
      });
      if (profileData.preferences) {
        setPreferences((prev) => ({ ...prev, ...profileData.preferences }));
      }
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; phone?: string }) =>
      customerApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "profile"] });
      setProfileSuccess("Profile updated successfully.");
      setTimeout(() => setProfileSuccess(""), 3000);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      customerApi.changePassword(data),
    onSuccess: () => {
      setPasswordSuccess("Password changed successfully.");
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordError("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    },
    onError: (err: Error) => {
      setPasswordError(err.message || "Failed to change password.");
      setPasswordSuccess("");
    },
  });

  function handleProfileSubmit() {
    setProfileSuccess("");
    updateProfileMutation.mutate({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone,
    });
  }

  function handlePasswordSubmit() {
    setPasswordError("");
    setPasswordSuccess("");
    if (password.newPassword.length < 6) { setPasswordError("New password must be at least 6 characters."); return; }
    if (password.newPassword !== password.confirmPassword) { setPasswordError("Passwords do not match."); return; }
    changePasswordMutation.mutate({ currentPassword: password.currentPassword, newPassword: password.newPassword });
  }

  async function handleSendCode() {
    setEmailError("");
    setEmailSuccess("");
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailLoading(true);
    try {
      await authApi.changeEmail(newEmail);
      setEmailSuccess("Verification code sent to your new email");
      setEmailStep("otp");
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setEmailError((err as { message?: string })?.message || "Failed to send code");
    } finally {
      setEmailLoading(false);
    }
  }

  async function handleVerifyOtp() {
    setEmailError("");
    setEmailSuccess("");
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setEmailError("Please enter the complete verification code");
      return;
    }
    setEmailLoading(true);
    try {
      await authApi.verifyEmailChange(code);
      setEmailSuccess("Email updated successfully");
      setEmailStep("idle");
      setNewEmail("");
      setOtp(Array(OTP_LENGTH).fill(""));
      queryClient.invalidateQueries({ queryKey: ["customer", "profile"] });
    } catch (err: unknown) {
      setEmailError((err as { message?: string })?.message || "Invalid verification code");
    } finally {
      setEmailLoading(false);
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

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!paste) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < paste.length; i++) {
      next[i] = paste[i];
    }
    setOtp(next);
    const focusIdx = Math.min(paste.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
  }

  function handleStartChange() {
    setEmailStep("input");
    setEmailError("");
    setEmailSuccess("");
    setNewEmail("");
    setOtp(Array(OTP_LENGTH).fill(""));
  }

  function handleCancelChange() {
    setEmailStep("idle");
    setEmailError("");
    setEmailSuccess("");
    setNewEmail("");
    setOtp(Array(OTP_LENGTH).fill(""));
  }

  const notifOptions = [
    { key: "orderUpdates" as const, label: "Order updates via email" },
    { key: "emailNotifications" as const, label: "Email notifications" },
    { key: "smsNotifications" as const, label: "SMS notifications" },
    { key: "promotionalEmails" as const, label: "Promotional emails" },
  ];

  return (
    <div className="container-page py-8">
      <h1 className="text-2xl md:text-3xl font-display text-neutral-900 mb-8 tracking-fashion">Account Settings</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardSidebar />
        <div className="lg:col-span-3 space-y-8">
          <div className="premium-card shadow-subtle">
            <div className="border-b px-6 py-4 flex items-center gap-3">
              <User className="w-4 h-4" />
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900">Profile</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">First Name</label>
                  <input value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Last Name</label>
                  <input value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} className="input-field w-full" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-neutral-500 mb-1 block">Phone</label>
                  <PhoneInput value={profile.phone} onChange={(v) => setProfile((p) => ({ ...p, phone: v }))} />
                </div>
              </div>
              {profileSuccess && <p className="text-xs text-green-600">{profileSuccess}</p>}
              <button
                onClick={handleProfileSubmit}
                disabled={updateProfileMutation.isPending}
                className="btn-primary"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="premium-card shadow-subtle">
            <div className="border-b px-6 py-4 flex items-center gap-3">
              <Mail className="w-4 h-4" />
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900">Email</h3>
            </div>
            <div className="p-6 space-y-4">
              {emailStep === "idle" && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Current Email</p>
                    <p className="text-sm text-neutral-900 font-medium">{profileData?.email || ""}</p>
                  </div>
                  <button onClick={handleStartChange} className="btn-secondary text-xs px-4 py-2">
                    Change
                  </button>
                </div>
              )}

              {emailStep === "input" && (
                <>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">New Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter your new email"
                      className="input-field w-full"
                    />
                  </div>
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSendCode}
                      disabled={emailLoading || !newEmail}
                      className="btn-primary"
                    >
                      {emailLoading ? "Sending..." : "Send Verification Code"}
                    </button>
                    <button onClick={handleCancelChange} className="text-xs text-neutral-500 hover:text-neutral-700">
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {emailStep === "otp" && (
                <>
                  {emailSuccess && !emailLoading && (
                    <p className="text-xs text-green-600">{emailSuccess}</p>
                  )}
                  <p className="text-sm text-neutral-600">
                    Enter the 6-digit code sent to <strong>{newEmail}</strong>
                  </p>
                  <div className="flex items-center gap-2" onPaste={handleOtpPaste}>
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
                  {emailError && <p className="text-xs text-red-500">{emailError}</p>}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={emailLoading || otp.join("").length !== OTP_LENGTH}
                      className="btn-primary"
                    >
                      {emailLoading ? "Verifying..." : "Verify Code"}
                    </button>
                    <button onClick={handleSendCode} disabled={emailLoading} className="text-xs text-neutral-500 hover:text-neutral-700">
                      Resend Code
                    </button>
                    <button onClick={handleCancelChange} className="text-xs text-neutral-500 hover:text-neutral-700">
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="premium-card shadow-subtle">
            <div className="border-b px-6 py-4 flex items-center gap-3">
              <Lock className="w-4 h-4" />
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900">Password</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Current Password</label>
                <PasswordInput value={password.currentPassword} onChange={(v) => setPassword((p) => ({ ...p, currentPassword: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">New Password</label>
                  <PasswordInput value={password.newPassword} onChange={(v) => setPassword((p) => ({ ...p, newPassword: v }))} />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Confirm New Password</label>
                  <PasswordInput value={password.confirmPassword} onChange={(v) => setPassword((p) => ({ ...p, confirmPassword: v }))} />
                </div>
              </div>
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
              {passwordSuccess && <p className="text-xs text-green-600">{passwordSuccess}</p>}
              <button
                onClick={handlePasswordSubmit}
                disabled={changePasswordMutation.isPending || !password.currentPassword || !password.newPassword}
                className="btn-primary"
              >
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>

          <div className="premium-card shadow-subtle">
            <div className="border-b px-6 py-4 flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900">Preferences</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-900">Marketing Opt-In</p>
                  <p className="text-xs text-neutral-400">Receive marketing and promotional communications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={preferences.marketingOptIn} onChange={(e) => setPreferences({ ...preferences, marketingOptIn: e.target.checked })} className="sr-only peer" />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-neutral-900 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
              </div>
              <div className="divider" />
              <div className="space-y-3">
                {notifOptions.map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between">
                    <p className="text-sm text-neutral-700">{opt.label}</p>
                    <input
                      type="checkbox"
                      checked={preferences[opt.key]}
                      onChange={(e) => setPreferences({ ...preferences, [opt.key]: e.target.checked })}
                      className="accent-neutral-900"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
