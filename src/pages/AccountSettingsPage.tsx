import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../stores/auth-store";
import { authApi } from "../lib/api/auth";

export default function AccountSettingsPage() {
  const { user } = useAuthStore();
  const { updateProfile, changePassword, error: authError } = useAuth();
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      await updateProfile(profileForm);
      setProfileSuccess(true);
    } catch {
      // Error set by hook
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(authError ?? "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-10">
      {/* Profile section */}
      <section>
        <h2 className="font-display text-xl text-neutral-900 mb-6">Personal Information</h2>
        <form onSubmit={handleProfileSubmit} className="premium-card p-6 space-y-4">
          {profileSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">Profile updated successfully</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-700 mb-1">First Name</label>
              <input value={profileForm.firstName} onChange={(e) => setProfileForm((f) => ({ ...f, firstName: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Last Name</label>
              <input value={profileForm.lastName} onChange={(e) => setProfileForm((f) => ({ ...f, lastName: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-700 mb-1">Phone</label>
            <input value={profileForm.phone} onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-neutral-700 mb-1">Email</label>
            <input value={user?.email ?? ""} disabled className="input-field bg-neutral-50 text-neutral-400" />
            <p className="text-xs text-neutral-400 mt-1">Email cannot be changed here</p>
          </div>
          <button type="submit" disabled={profileSaving} className="btn-primary text-sm !px-6 !py-2">
            {profileSaving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Password section */}
      <section>
        <h2 className="font-display text-xl text-neutral-900 mb-6">Change Password</h2>
        <form onSubmit={handlePasswordSubmit} className="premium-card p-6 space-y-4">
          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">Password changed successfully. Please log in again.</p>
            </div>
          )}
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm text-neutral-700 mb-1">Current Password</label>
            <input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-neutral-700 mb-1">New Password</label>
              <input type="password" required value={passwordForm.newPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-neutral-700 mb-1">Confirm Password</label>
              <input type="password" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }))} className="input-field" />
            </div>
          </div>
          <button type="submit" disabled={passwordSaving} className="btn-primary text-sm !px-6 !py-2">
            {passwordSaving ? "Changing…" : "Change Password"}
          </button>
        </form>
      </section>
    </div>
  );
}
