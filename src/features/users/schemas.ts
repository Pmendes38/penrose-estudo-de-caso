import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.string(),
  label: z.string().optional().nullable(),
  personName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  zipCode: z.string(),
  street: z.string(),
  number: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string(),
  state: z.string(),
  country: z.string().default('BR'),
  isDefault: z.boolean().optional().default(false),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});
export type Address = z.infer<typeof AddressSchema>;

export const PreferencesSchema = z.object({
  locale: z.string().default('pt-BR'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  newsletterOptIn: z.boolean().default(false),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

export const RoleSchema = z.enum(['admin', 'customer']);
export type UserRole = z.infer<typeof RoleSchema>;

export const MeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: RoleSchema.optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  addresses: z.array(AddressSchema).optional().default([]),
  preferences: PreferencesSchema.optional().default({
    locale: 'pt-BR',
    theme: 'system',
    newsletterOptIn: false,
  }),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});
export type Me = z.infer<typeof MeSchema>;

export const UserSchema = MeSchema.extend({
  role: RoleSchema, // obrigatório apenas aqui
});
export type User = z.infer<typeof UserSchema>;

export const UpdateMeDtoSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(8).optional(),
});
export type UpdateMeDto = z.infer<typeof UpdateMeDtoSchema>;

export const CreateAddressDtoSchema = z.object({
  label: z.string().optional(),
  personName: z.string().optional(),
  phone: z.string().optional(),
  zipCode: z.string().min(3),
  street: z.string().min(1),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string().optional().default('BR'),
  isDefault: z.boolean().optional(),
});
export type CreateAddressDto = z.infer<typeof CreateAddressDtoSchema>;

export const UpdateAddressDtoSchema = z.object({
  label: z.string().optional(),
  personName: z.string().optional(),
  phone: z.string().optional(),
  zipCode: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
});
export type UpdateAddressDto = z.infer<typeof UpdateAddressDtoSchema>;

export const UpdatePreferencesDtoSchema = z.object({
  locale: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  newsletterOptIn: z.boolean().optional(),
});
export type UpdatePreferencesDto = z.infer<typeof UpdatePreferencesDtoSchema>;

export const ChangePasswordDtoSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
});
export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;

export const MessageSchema = z.object({ message: z.string() });

export const UpdateMeResponseSchema = z.object({
  message: z.string(),
  user: MeSchema,
});
export type UpdateMeResponse = z.infer<typeof UpdateMeResponseSchema>;

export const AddAddressResponseSchema = z.object({
  message: z.string(),
  address: AddressSchema,
  user: MeSchema,
});
export type AddAddressResponse = z.infer<typeof AddAddressResponseSchema>;

export const UpdateUserEnvelopeSchema = z.object({
  message: z.string(),
  user: MeSchema,
});
export type UpdateUserEnvelope = z.infer<typeof UpdateUserEnvelopeSchema>;

export const SessionsItemSchema = z.object({
  id: z.string(),            // jti
  userId: z.string(),
  userAgent: z.string().optional().nullable(),
  ip: z.string().optional().nullable(),
  lastUsedAt: z.union([z.string(), z.date()]).optional(),
  revoked: z.boolean().optional(),
  revokedAt: z.union([z.string(), z.date()]).optional(),
  revokedReason: z.string().optional().nullable(),
});
export const SessionsListSchema = z.array(SessionsItemSchema);
export type SessionItem = z.infer<typeof SessionsItemSchema>;
