/**
 * User management API handlers — profile, addresses, settings.
 * Follows REST API specification and IAM architecture.
 * Authentication and authorization handled via middleware.
 */

import { z } from 'zod';

import {
  getUserProfile,
  updateProfile,
  updateAvatar,
  removeAvatar,
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAccountSettings,
  updateAccountSettings,
} from '../../_lib/auth/user-service.ts';
import type { RequestContext } from '../../_lib/http/context.ts';
import { ApiError } from '../../_lib/http/errors.ts';
import { validate } from '../../_lib/validation.ts';
import { register as registerRoute } from '../register.ts';

// ── Validation Schemas ───────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z
    .string()
    .regex(/^[0-9+]{10,20}$/)
    .optional(),
  locale: z.enum(['en-IN', 'bn-IN', 'hi-IN']).optional(),
});

const updateAvatarSchema = z.object({
  avatarUrl: z.string().url('Invalid avatar URL'),
});

const createAddressSchema = z.object({
  type: z.enum(['home', 'work', 'other']),
  label: z.string().max(60).optional(),
  line1: z.string().min(1).max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(120),
  postalCode: z.string().min(1).max(12),
  country: z.string().length(2).default('IN'),
  phone: z.string().regex(/^[0-9+]{10,20}$/),
  isDefault: z.boolean().default(false),
});

const updateAddressSchema = z.object({
  type: z.enum(['home', 'work', 'other']).optional(),
  label: z.string().max(60).optional(),
  line1: z.string().min(1).max(255).optional(),
  line2: z.string().max(255).optional(),
  city: z.string().min(1).max(120).optional(),
  state: z.string().min(1).max(120).optional(),
  postalCode: z.string().min(1).max(12).optional(),
  country: z.string().length(2).optional(),
  phone: z
    .string()
    .regex(/^[0-9+]{10,20}$/)
    .optional(),
  isDefault: z.boolean().optional(),
});

const updateAccountSettingsSchema = z.object({
  locale: z.enum(['en-IN', 'bn-IN', 'hi-IN']).optional(),
  notificationPreferences: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
    })
    .optional(),
});

// ── Get Profile Handler ─────────────────────────────────────────────────────

export async function handleGetProfile(
  request: Request,
  context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = context.userId;

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const profile = await getUserProfile(userId);

    return new Response(
      JSON.stringify({
        success: true,
        data: profile,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Update Profile Handler ─────────────────────────────────────────────────

export async function handleUpdateProfile(
  request: Request,
  _context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const body = await request.json();
    const input = validate(updateProfileSchema, body);

    const profile = await updateProfile({ userId, ...input });

    return new Response(
      JSON.stringify({
        success: true,
        data: profile,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Update Avatar Handler ───────────────────────────────────────────────────

export async function handleUpdateAvatar(
  request: Request,
  _context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const body = await request.json();
    const input = validate(updateAvatarSchema, body);

    const profile = await updateAvatar(userId, input.avatarUrl);

    return new Response(
      JSON.stringify({
        success: true,
        data: profile,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Remove Avatar Handler ───────────────────────────────────────────────────

export async function handleRemoveAvatar(
  request: Request,
  _context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const profile = await removeAvatar(userId);

    return new Response(
      JSON.stringify({
        success: true,
        data: profile,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Get Addresses Handler ───────────────────────────────────────────────────

export async function handleGetAddresses(
  request: Request,
  _context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const addresses = await getUserAddresses(userId);

    return new Response(
      JSON.stringify({
        success: true,
        data: addresses,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Create Address Handler ─────────────────────────────────────────────────

export async function handleCreateAddress(
  request: Request,
  _context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const body = await request.json();
    const input = validate(createAddressSchema, body);

    const address = await createAddress({
      userId,
      country: input.country || 'IN',
      ...input,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: address,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Update Address Handler ─────────────────────────────────────────────────

export async function handleUpdateAddress(
  request: Request,
  _context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { id } = params;
    if (!id) {
      throw ApiError.validation('Address ID required');
    }

    const body = await request.json();
    const input = validate(updateAddressSchema, body);

    const address = await updateAddress({ addressId: id, userId, ...input });

    return new Response(
      JSON.stringify({
        success: true,
        data: address,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Delete Address Handler ─────────────────────────────────────────────────

export async function handleDeleteAddress(
  request: Request,
  _context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { id } = params;
    if (!id) {
      throw ApiError.validation('Address ID required');
    }

    await deleteAddress(id, userId);

    return new Response(
      JSON.stringify({
        success: true,
        data: { message: 'Address deleted successfully' },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Set Default Address Handler ───────────────────────────────────────────

export async function handleSetDefaultAddress(
  request: Request,
  _context: RequestContext,
  params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { id } = params;
    if (!id) {
      throw ApiError.validation('Address ID required');
    }

    const address = await setDefaultAddress(id, userId);

    return new Response(
      JSON.stringify({
        success: true,
        data: address,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Get Account Settings Handler ───────────────────────────────────────────

export async function handleGetAccountSettings(
  request: Request,
  _context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const settings = await getAccountSettings(userId);

    return new Response(
      JSON.stringify({
        success: true,
        data: settings,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Update Account Settings Handler ───────────────────────────────────────

export async function handleUpdateAccountSettings(
  request: Request,
  _context: RequestContext,
  _params: Record<string, string>,
): Promise<Response> {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      throw ApiError.unauthorized('Authentication required');
    }

    const body = await request.json();
    const input = validate(updateAccountSettingsSchema, body);

    const settings = await updateAccountSettings(userId, {
      ...(input.locale !== undefined && { locale: input.locale }),
      ...(input.notificationPreferences !== undefined && {
        notificationPreferences: {
          email: input.notificationPreferences.email ?? true,
          sms: input.notificationPreferences.sms ?? false,
          push: input.notificationPreferences.push ?? true,
        },
      }),
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: settings,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        }),
        {
          status: error.status,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
    throw error;
  }
}

// ── Register Routes ─────────────────────────────────────────────────────────

registerRoute('GET', 'auth/profile', handleGetProfile);
registerRoute('PATCH', 'auth/profile', handleUpdateProfile);
registerRoute('PATCH', 'auth/avatar', handleUpdateAvatar);
registerRoute('DELETE', 'auth/avatar', handleRemoveAvatar);
registerRoute('GET', 'auth/addresses', handleGetAddresses);
registerRoute('POST', 'auth/addresses', handleCreateAddress);
registerRoute('PATCH', 'auth/addresses/{id}', handleUpdateAddress);
registerRoute('DELETE', 'auth/addresses/{id}', handleDeleteAddress);
registerRoute('POST', 'auth/addresses/{id}/default', handleSetDefaultAddress);
registerRoute('GET', 'auth/settings', handleGetAccountSettings);
registerRoute('PATCH', 'auth/settings', handleUpdateAccountSettings);
