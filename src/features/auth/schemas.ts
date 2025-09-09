import { z } from 'zod';

export const RoleSchema = z.enum(['admin', 'customer']);
export type UserRole = z.infer<typeof RoleSchema>;

export const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});
export type Tokens = z.infer<typeof TokensSchema>;

export const AuthResultSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  role: RoleSchema,
  name: z.string(),
  redirect: z.string(),
  tokens: TokensSchema,
});
export type AuthResult = z.infer<typeof AuthResultSchema>;

export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

export const LogoutResponseSchema = z.object({
  ok: z.boolean().optional(),
  message: z.string().optional(),
});

export const JwtPayloadSchema = z.object({
  sub: z.string(),
  name: z.string().optional().nullable(),
  email: z.string().email(),
  role: RoleSchema,
  jti: z.string(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

export const MeEnvelopeSchema = z.object({ user: JwtPayloadSchema });
export type MeEnvelope = z.infer<typeof MeEnvelopeSchema>;

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  role: RoleSchema,
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export function parseApiMessage(e: unknown, fallback = 'Falha na requisição') {
  try {
    if (typeof e === 'string') return e;
    if (e && typeof e === 'object' && 'message' in e) return (e as any).message || fallback;
  } catch {}
  return fallback;
}
