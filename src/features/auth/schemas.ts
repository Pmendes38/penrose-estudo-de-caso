import { z } from 'zod';

export const RoleSchema = z.enum(['admin','customer']);
export type UserRole = z.infer<typeof RoleSchema>;

export const TokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

export const AuthResultSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  role: RoleSchema,
  name: z.string(),
  redirect: z.string(),
  tokens: TokensSchema,
});
export type AuthResult = z.infer<typeof AuthResultSchema>;

export const JwtPayloadSchema = z.object({
  sub: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: RoleSchema,
  jti: z.string(),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
