import 'server-only';
import { envServer } from '@/shared/lib/env.server';
import { getAccessToken } from './cookies';
import { ExternalMeSchema, AuthUserSchema, type AuthUser } from './schemas';

function normalizeRole(rawRole?: string | null, roles?: string[] | null) {
  const r = (rawRole ?? '').toLowerCase();
  const arr = (roles ?? []).map((s) => s.toLowerCase());
  if (r === 'admin' || arr.includes('admin')) return 'admin' as const;
  if (r === 'customer' || r === 'cliente' || arr.includes('customer') || arr.includes('cliente')) {
    return 'customer' as const;
  }
  return undefined;
}

/** Mapeia o payload externo (backend) para nosso AuthUser canônico. */
function mapExternalToAuthUser(payload: unknown): AuthUser {
  const ext = ExternalMeSchema.parse(payload);
  const role = normalizeRole(ext.role ?? undefined, ext.roles ?? undefined);

  return AuthUserSchema.parse({
    id: String(ext.id),
    email: ext.email,
    name: ext.name ?? null,
    role,
    avatarUrl: ext.avatarUrl ?? null,
    createdAt: ext.createdAt ?? null,
    updatedAt: ext.updatedAt ?? null,
  });
}

export async function getMe(): Promise<AuthUser | null> {
  const token = getAccessToken();
  if (!token) return null;

  const res = await fetch(`${envServer.AUTH_API_URL}/api/v1/auth/me`, {
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
    return mapExternalToAuthUser(data);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[getMe] Parse error:', e);
    }
    return null;
  }
}
