'use server';

import { revalidatePath } from 'next/cache';
import { UpdateMeDtoSchema } from '@/features/users/schemas';
import { updateMe } from '@/features/users/api';

export async function updateProfileAction(formData: FormData) {
  const dto = UpdateMeDtoSchema.parse({
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim() || undefined,
  });

  await updateMe(dto);

  revalidatePath('/customer');

  return { ok: true as const };
}
