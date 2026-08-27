/**
 * Profile View Component
 *
 * Displays customer profile information with edit capability.
 * Mobile-first, accessible, and follows the official component library.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: FRONTEND_APPLICATION_IMPLEMENTATION_SPECIFICATION.md (binding)
 */

import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { useEffect } from 'react';

import { useCustomerProfile } from '@nabome/customer';
import { Button } from '@nabome/ui';

interface ProfileViewProps {
  userId: string;
  onEdit: () => void;
}

export function ProfileView({ userId, onEdit }: ProfileViewProps) {
  const { profile, profileLoading, profileError, fetchProfile } =
    useCustomerProfile();

  // Load profile on mount
  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  const handleAvatarClick = () => {
    // TODO: Open avatar upload dialog
  };

  if (profileLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full" />
        <div className="h-8 bg-gray-200 rounded-lg w-1/2" />
        <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
        <div className="h-4 bg-gray-200 rounded-lg w-2/3" />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <span>{profileError}</span>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-white ring-offset-2">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            `${profile.firstName?.[0]}${profile.lastName?.[0]}`.toUpperCase()
          )}
        </div>
        <button
          onClick={handleAvatarClick}
          className="absolute bottom-0 right-0 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-110 border-2 border-indigo-100"
          aria-label="Change avatar"
        >
          <Camera className="w-4 h-4 text-indigo-600" />
        </button>
      </div>

      {/* Profile Information */}
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Member since {new Date(profile.memberSince).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1">
              <span className="text-gray-700 font-medium">{profile.email}</span>
              {profile.emailVerifiedAt && (
                <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                  Verified
                </span>
              )}
            </div>
          </div>

          {profile.phone && (
            <div className="flex items-center gap-4 text-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-gray-700">{profile.phone}</span>
            </div>
          )}

          {profile.dateOfBirth && (
            <div className="flex items-center gap-4 text-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-gray-700">
                {new Date(profile.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-gray-700 capitalize">{profile.role}</span>
          </div>
        </div>
      </div>

      {/* Account Status */}
      {profile.accountTier && (
        <div className="p-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">
                Account Tier
              </p>
              <p className="text-2xl font-bold text-amber-700 capitalize">
                {profile.accountTier}
              </p>
            </div>
            {profile.lifetimeSpend && (
              <div className="text-right">
                <p className="text-sm text-amber-600 mb-1">Lifetime Spend</p>
                <p className="text-2xl font-bold text-amber-700">
                  ₹{profile.lifetimeSpend.amount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
