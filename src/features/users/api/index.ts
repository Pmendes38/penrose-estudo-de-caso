import 'server-only';
import { envServer } from '@/shared/lib/env.server';
import { fetchWithAuth } from '@/features/auth/server/fetch-with-auth';
import {
  MeSchema,
  UserSchema,
  UpdateMeDto,
  UpdateMeDtoSchema,
  CreateAddressDto,
  CreateAddressDtoSchema,
  UpdateAddressDto,
  UpdateAddressDtoSchema,
  UpdatePreferencesDto,
  UpdatePreferencesDtoSchema,
  ChangePasswordDto,
  ChangePasswordDtoSchema,
  AddressSchema,
  PreferencesSchema,
  MessageSchema,
  UpdateMeResponseSchema,
  AddAddressResponseSchema,
  UpdateUserEnvelopeSchema,
  SessionsListSchema,
  type Me,
  type User,
  type Address,
  type Preferences,
  type SessionItem,
  type UpdateMeResponse,
  type AddAddressResponse,
  type UpdateUserEnvelope,
} from '../schemas';

const BASE = `${envServer.NEXT_PUBLIC_API_BASE_URL}/api/v1/user`;

/* ================= Perfil ================ */

export async function getMe(): Promise<Me> {
  const res = await fetchWithAuth(`${BASE}/me`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return MeSchema.parse(await res.json());
}

export async function updateMe(input: UpdateMeDto): Promise<UpdateMeResponse> {
  const body = JSON.stringify(UpdateMeDtoSchema.parse(input));
  const res = await fetchWithAuth(`${BASE}/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  return UpdateMeResponseSchema.parse(await res.json());
}

/* ================= Endereços ================ */

export async function listAddresses(): Promise<Address[]> {
  const res = await fetchWithAuth(`${BASE}/addresses`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return AddressSchema.array().parse(await res.json());
}

export async function addAddress(input: CreateAddressDto): Promise<AddAddressResponse> {
  const body = JSON.stringify(CreateAddressDtoSchema.parse(input));
  const res = await fetchWithAuth(`${BASE}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  return AddAddressResponseSchema.parse(await res.json());
}

export async function updateAddress(addressId: string, input: UpdateAddressDto): Promise<UpdateUserEnvelope> {
  const body = JSON.stringify(UpdateAddressDtoSchema.parse(input));
  const res = await fetchWithAuth(`${BASE}/addresses/${encodeURIComponent(addressId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  return UpdateUserEnvelopeSchema.parse(await res.json());
}

export async function removeAddress(addressId: string): Promise<UpdateUserEnvelope> {
  const res = await fetchWithAuth(`${BASE}/addresses/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return UpdateUserEnvelopeSchema.parse(await res.json());
}

export async function setDefaultAddress(addressId: string): Promise<UpdateUserEnvelope> {
  const res = await fetchWithAuth(`${BASE}/addresses/${encodeURIComponent(addressId)}/default`, {
    method: 'PATCH',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return UpdateUserEnvelopeSchema.parse(await res.json());
}

/* ================= Preferências ================ */

export async function updatePreferences(input: UpdatePreferencesDto): Promise<UpdateUserEnvelope> {
  const body = JSON.stringify(UpdatePreferencesDtoSchema.parse(input));
  const res = await fetchWithAuth(`${BASE}/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  return UpdateUserEnvelopeSchema.parse(await res.json());
}

/* ================= Avatar ================ */

export async function uploadAvatar(file: File | Blob, filename = 'avatar.jpg'): Promise<UpdateUserEnvelope> {
  const fd = new FormData();
  fd.append('avatar', file, (file as any)?.name ?? filename);

  const res = await fetchWithAuth(`${BASE}/avatar`, {
    method: 'POST',
    body: fd,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return UpdateUserEnvelopeSchema.parse(await res.json());
}

/* ================= Senha ================ */

export async function changePassword(input: ChangePasswordDto): Promise<{ message: string }> {
  const body = JSON.stringify(ChangePasswordDtoSchema.parse(input));
  const res = await fetchWithAuth(`${BASE}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  return MessageSchema.parse(await res.json());
}

/* ================= Sessões / Devices ================ */

export async function listSessions(): Promise<SessionItem[]> {
  const res = await fetchWithAuth(`${BASE}/sessions`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await res.text());
  return SessionsListSchema.parse(await res.json());
}

export async function revokeSession(sessionId: string): Promise<{ message: string }> {
  const res = await fetchWithAuth(`${BASE}/sessions/${encodeURIComponent(sessionId)}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return MessageSchema.parse(await res.json());
}

export async function revokeAllOtherSessions(except?: string): Promise<{ message: string }> {
  const url = new URL(`${BASE}/sessions`);
  if (except) url.searchParams.set('except', except);
  const res = await fetchWithAuth(url.toString(), {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return MessageSchema.parse(await res.json());
}

/* ================= Helpers cacheáveis ================ */

export async function getMeCached(revalidateSeconds = 60): Promise<Me> {
  const res = await fetchWithAuth(`${BASE}/me`, {
    cache: 'force-cache',
    next: { revalidate: revalidateSeconds, tags: ['user:me'] },
  });
  if (!res.ok) throw new Error(await res.text());
  return MeSchema.parse(await res.json());
}
