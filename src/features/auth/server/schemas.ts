import { z } from 'zod';

export const RoleSchema = z.enum(['admin', 'customer']);
export type UserRole = z.infer<typeof RoleSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  role: RoleSchema.nullish(), // pode vir vazio do provider
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const ExternalMeSchema = z.object({
  id: z.union([z.string(), z.number()]),
  email: z.string().email(),
  name: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  roles: z.array(z.string()).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  createdAt: z.union([z.string(), z.string().datetime()]).optional().nullable(),
  updatedAt: z.union([z.string(), z.string().datetime()]).optional().nullable(),
});
export type ExternalMe = z.infer<typeof ExternalMeSchema>;

export const JwtPayloadSchema = z.object({
  sub: z.union([z.string(), z.number()]).optional(), // id do usuário
  email: z.string().email().optional(),
  name: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  roles: z.array(z.string()).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  iat: z.number().optional(),
  exp: z.number().optional(),
  id: z.union([z.string(), z.number()]).optional(),
});

function normalizeRole(
  input?: string | null,
  roles?: string[] | null
): UserRole | null | undefined {
  const r = (input ?? '').toLowerCase();
  const arr = (roles ?? []).map((s) => s.toLowerCase());
  if (r === 'admin' || arr.includes('admin')) return 'admin';
  if (r === 'customer' || arr.includes('customer')) return 'customer';
  return undefined; // mantemos undefined/null se não reconhecido
}

export function normalizeToAuthUser(input: unknown): AuthUser {
  const asAuth = AuthUserSchema.safeParse(input);
  if (asAuth.success) return asAuth.data;

  const asExternal = ExternalMeSchema.safeParse(input);
  if (asExternal.success) {
    const u = asExternal.data;
    return AuthUserSchema.parse({
      id: String(u.id),
      email: u.email,
      name: u.name ?? null,
      role: normalizeRole(u.role ?? undefined, u.roles ?? undefined),
      avatarUrl: u.avatarUrl ?? null,
      createdAt: u.createdAt ?? undefined,
      updatedAt: u.updatedAt ?? undefined,
    });
  }

  const asJwt = JwtPayloadSchema.safeParse(input);
  if (asJwt.success) {
    const u = asJwt.data;
    const id = u.sub ?? u.id;
    return AuthUserSchema.parse({
      id: String(id ?? ''), // se não houver id/sub, o parse falha (como deve ser)
      email: u.email ?? '',
      name: u.name ?? null,
      role: normalizeRole(u.role ?? undefined, u.roles ?? undefined),
      avatarUrl: u.avatarUrl ?? null,
    });
  }

  throw new Error('Formato de usuário desconhecido na resposta do /me');
}

const TokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
});
export type Tokens = z.infer<typeof TokensSchema>;

const RawAuthResultSchema = z.object({
  tokens: TokensSchema,
  role: z.string(),
  user: z.unknown().optional(),
});

export const AuthResultSchema = RawAuthResultSchema.transform((raw) => {
  const role = normalizeRole(raw.role) ?? 'customer'; // fallback sensato
  return { tokens: raw.tokens, role, user: raw.user };
});
export type AuthResult = z.infer<typeof AuthResultSchema>;
