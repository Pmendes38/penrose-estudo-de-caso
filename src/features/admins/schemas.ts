// src/features/admins/schemas.ts
import { z } from 'zod';

export const AdminSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.literal('admin'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Admin = z.infer<typeof AdminSchema>;

export const PagedAdminsSchema = z.object({
  items: z.array(AdminSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  pages: z.number(),
});
export type PagedAdmins = z.infer<typeof PagedAdminsSchema>;

// payloads (espelham DTOs do backend)
export const CreateAdminPayload = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
});
export type CreateAdminPayload = z.infer<typeof CreateAdminPayload>;

export const UpdateAdminPayload = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().toLowerCase().optional(),
  password: z.string().min(8).optional(),
});
export type UpdateAdminPayload = z.infer<typeof UpdateAdminPayload>;
