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