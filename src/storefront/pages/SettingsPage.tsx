import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Lock, Bell, Mail } from "lucide-react";
import { customerApi } from "../../lib/api/customer";
import { DashboardSidebar } from "../components/DashboardSidebar";

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
                  <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field w-full" />
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
              <Lock className="w-4 h-4" />
              <h3 className="text-sm uppercase tracking-widest font-medium text-neutral-900">Password</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block">Current Password</label>
                <input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} className="input-field w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">New Password</label>
                  <input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} className="input-field w-full" />
                </div>
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Confirm New Password</label>
                  <input type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} className="input-field w-full" />
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
