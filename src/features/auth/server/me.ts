import 'server-only';
import { backendFetch as fetch } from '@/shared/lib/backend-fetch';
import { envServer } from '@/shared/lib/env.server';
import { getAccessToken } from './cookies';
import {
  AuthUserSchema,
  type AuthUser,
  JwtPayloadSchema,
  MeEnvelopeSchema,
} from '../schemas';

function mapToAuthUser(payload: unknown): AuthUser {
  const env = MeEnvelopeSchema.safeParse(payload);
  if (env.success) {
    const p = env.data.user;
    return AuthUserSchema.parse({
      id: p.sub,
      email: p.email,
      name: p.name ?? null,
      role: p.role,
    });
  }

  const jwt = JwtPayloadSchema.safeParse(payload);
  if (jwt.success) {
    const p = jwt.data;
    return AuthUserSchema.parse({
      id: p.sub,
      email: p.email,
      name: p.name ?? null,
      role: p.role,
    });
  }

  return AuthUserSchema.parse(payload);
}

export async function getMe(): Promise<AuthUser | null> {
  const token = getAccessToken();
  if (!token) return null;

  const res = await fetch(`${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.status === 401) return null;
  if (!res.ok) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[getMe] Failed:', res.status, res.statusText);
    }
    return null;
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[getMe] Invalid JSON payload');
    }
    return null;
  }

  try {
    return mapToAuthUser(data);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[getMe] Parse error:', e);
    }
    return null;
  }
}
