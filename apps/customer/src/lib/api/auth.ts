/**
 * Authentication API functions for V1 JWT+bcrypt auth.
 */

import { api, setCsrfToken } from './client';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  turnstileToken?: string;
}

export interface RegisterResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  };
  requiresEmailVerification: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
  turnstileToken?: string;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  session: {
    id: string;
    expiresAt: string;
  };
  csrfToken: string;
}

export interface RefreshResult {
  accessToken: string;
  csrfToken: string;
}

export async function register(input: RegisterInput): Promise<RegisterResult> {
  return api.post<RegisterResult>('/auth/register', input, { skipCsrf: true });
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const result = await api.post<LoginResult>('/auth/login', input, {
    skipCsrf: true,
  });
  if (result.csrfToken) setCsrfToken(result.csrfToken);
  return result;
}

export async function logout(): Promise<void> {
  try {
    await api.post<void>('/auth/logout', {}, { skipCsrf: true });
  } finally {
    setCsrfToken(null);
  }
}

export async function refresh(refreshToken: string): Promise<RefreshResult> {
  return api.post<RefreshResult>(
    '/auth/refresh',
    {},
    {
      skipCsrf: true,
      headers: {
        authorization: `Bearer ${refreshToken}`,
      },
    },
  );
}
