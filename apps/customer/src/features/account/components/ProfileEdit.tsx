/**
 * Profile Edit Component
 *
 * Form for editing customer profile information.
 * Mobile-first, accessible, with validation.
 *
 * Source: CUSTOMER_ACCOUNT_PROFILE_ARCHITECTURE.md (binding)
 * Source: FRONTEND_FORMS_VALIDATION_SPECIFICATION.md (binding)
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCustomerProfile } from '@nabome/customer';
import type { UpdateProfileRequest } from '@nabome/customer';
import { Button } from '@nabome/ui';
import { Input } from '@nabome/ui';
import { Label } from '@nabome/ui';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(80, 'First name must be less than 80 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(80, 'Last name must be less than 80 characters'),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditProps {
  userId: string;
  initialData: Partial<ProfileFormData>;
  onCancel: () => void;
  onSave: () => void;
}

export function ProfileEdit({
  userId,
  initialData,
  onCancel,
  onSave,
}: ProfileEditProps) {
  const { updateProfile, profileLoading } = useCustomerProfile();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProfileFormData) => {
    setError(null);
    try {
      const updates: UpdateProfileRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        avatarUrl: data.avatarUrl || undefined,
      };

      await updateProfile(userId, updates);
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="Enter first name"
              aria-invalid={errors.firstName ? 'true' : 'false'}
              aria-describedby={
                errors.firstName ? 'firstName-error' : undefined
              }
            />
            {errors.firstName && (
              <p
                id="firstName-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Enter last name"
              aria-invalid={errors.lastName ? 'true' : 'false'}
              aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            />
            {errors.lastName && (
              <p
                id="lastName-error"
                className="text-sm text-red-600"
                role="alert"
              >
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+91 98765 43210"
            aria-invalid={errors.phone ? 'true' : 'false'}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="text-sm text-red-600" role="alert">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
            aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
            aria-describedby={
              errors.dateOfBirth ? 'dateOfBirth-error' : undefined
            }
          />
          {errors.dateOfBirth && (
            <p
              id="dateOfBirth-error"
              className="text-sm text-red-600"
              role="alert"
            >
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input
            id="avatarUrl"
            type="url"
            {...register('avatarUrl')}
            placeholder="https://example.com/avatar.jpg"
            aria-invalid={errors.avatarUrl ? 'true' : 'false'}
            aria-describedby={errors.avatarUrl ? 'avatarUrl-error' : undefined}
          />
          {errors.avatarUrl && (
            <p
              id="avatarUrl-error"
              className="text-sm text-red-600"
              role="alert"
            >
              {errors.avatarUrl.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={profileLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={profileLoading || !isDirty}
          isLoading={profileLoading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
}
