/**
 * Profile Management Component
 *
 * Main component for profile management with view/edit toggle.
 * Mobile-first, accessible, and follows the official component library.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: FRONTEND_APPLICATION_IMPLEMENTATION_SPECIFICATION.md (binding)
 */

import { useState } from 'react';

import type { CustomerProfile } from '@nabome/customer';

import { ProfileEdit } from './ProfileEdit';
import { ProfileView } from './ProfileView';

interface ProfileManagementProps {
  userId: string;
  initialProfile?: CustomerProfile;
}

export function ProfileManagement({
  userId,
  initialProfile,
}: ProfileManagementProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Edit Profile
        </h2>
        <ProfileEdit
          userId={userId}
          initialData={{
            firstName: initialProfile?.firstName ?? undefined,
            lastName: initialProfile?.lastName ?? undefined,
            phone: initialProfile?.phone ?? '',
            dateOfBirth: initialProfile?.dateOfBirth ?? '',
            avatarUrl: initialProfile?.avatarUrl ?? '',
          }}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Profile Information
      </h2>
      <ProfileView userId={userId} onEdit={handleEdit} />
    </div>
  );
}
