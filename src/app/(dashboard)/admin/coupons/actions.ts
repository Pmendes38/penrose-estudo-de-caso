'use server';

import { revalidatePath } from 'next/cache';
import {
  createCoupon, updateCoupon, deleteCoupon,
} from '@/features/coupons/api/api';
import {
  CreateCouponPayload, UpdateCouponPayload,
} from '@/features/coupons/schemas';

type State = { ok: boolean; error?: string };

export async function createCouponAction(_: State, form: FormData): Promise<State> {
  const data = {
    code: String(form.get('code') ?? ''),
    description: String(form.get('description') ?? ''),
    type: String(form.get('type') ?? 'PERCENT'),
    value: Number(form.get('value') ?? 0),
    minimumOrderValue: form.get('minimumOrderValue') ? Number(form.get('minimumOrderValue')) : undefined,
    maxRedemptions: form.get('maxRedemptions') ? Number(form.get('maxRedemptions')) : undefined,
    startsAt: String(form.get('startsAt') ?? ''),
    endsAt: String(form.get('endsAt') ?? ''),
    productIds: (String(form.get('productIds') ?? '').trim() || '')
      .split(',').map(s => s.trim()).filter(Boolean),
    sizes: (String(form.get('sizes') ?? '').trim() || '')
      .split(',').map(s => s.trim()).filter(Boolean),
    active: String(form.get('active') ?? 'true') === 'true',
  };
  const parsed = CreateCouponPayload.safeParse(data);
  if (!parsed.success) return { ok:false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };

  try {
    await createCoupon(parsed.data);
    revalidatePath('/admin/coupons');
    return { ok:true };
  } catch (e: any) {
    return { ok:false, error: e?.message ?? 'Falha ao criar cupom' };
  }
}

export async function updateCouponAction(id: string, _: State, form: FormData): Promise<State> {
  const data = {
    code: form.get('code') ? String(form.get('code')) : undefined,
    description: form.get('description') ? String(form.get('description')) : undefined,
    type: form.get('type') ? String(form.get('type')) : undefined,
    value: form.get('value') ? Number(form.get('value')) : undefined,
    minimumOrderValue: form.get('minimumOrderValue') ? Number(form.get('minimumOrderValue')) : undefined,
    maxRedemptions: form.get('maxRedemptions') ? Number(form.get('maxRedemptions')) : undefined,
    startsAt: form.get('startsAt') ? String(form.get('startsAt')) : undefined,
    endsAt: form.get('endsAt') ? String(form.get('endsAt')) : undefined,
    productIds: form.get('productIds')
      ? String(form.get('productIds')).split(',').map(s => s.trim()).filter(Boolean)
      : undefined,
    sizes: form.get('sizes')
      ? String(form.get('sizes')).split(',').map(s => s.trim()).filter(Boolean)
      : undefined,
    active: form.get('active') ? String(form.get('active')) === 'true' : undefined,
  };
  const parsed = UpdateCouponPayload.safeParse(data);
  if (!parsed.success) return { ok:false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };

  try {
    await updateCoupon(id, parsed.data);
    revalidatePath('/admin/coupons');
    return { ok:true };
  } catch (e: any) {
    return { ok:false, error: e?.message ?? 'Falha ao atualizar cupom' };
  }
}

export async function deleteCouponAction(id: string): Promise<State> {
  try {
    await deleteCoupon(id);
    revalidatePath('/admin/coupons');
    return { ok:true };
  } catch (e: any) {
    return { ok:false, error: (e as any)?.message ?? 'Falha ao remover cupom' };
  }
}
