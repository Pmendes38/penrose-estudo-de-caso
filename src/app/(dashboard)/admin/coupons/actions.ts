'use server';

import { revalidatePath } from 'next/cache';
import {
  createCoupon, updateCoupon, deleteCoupon,
} from '@/features/coupons/api';
import {
  CreateCouponPayload, UpdateCouponPayload,
} from '@/features/coupons/schemas';

export type State = { ok: boolean; error?: string };

function toIsoFromLocal(input?: string | null): string | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function firstZodIssue(errors: unknown): string {
  try {
    // @ts-ignore
    const issues = errors?.issues ?? [];
    return issues[0]?.message ?? 'Dados inválidos';
  } catch {
    return 'Dados inválidos';
  }
}

export async function createCouponAction(_: State, form: FormData): Promise<State> {
  const startsAtLocal = String(form.get('startsAt') ?? '');
  const endsAtLocal   = String(form.get('endsAt') ?? '');

  const data = {
    code: String(form.get('code') ?? ''),
    description: String(form.get('description') ?? ''),
    type: String(form.get('type') ?? 'PERCENT'),
    value: Number(form.get('value') ?? 0),
    minimumOrderValue: form.get('minimumOrderValue') ? Number(form.get('minimumOrderValue')) : undefined,
    maxRedemptions: form.get('maxRedemptions') ? Number(form.get('maxRedemptions')) : undefined,
    startsAt: toIsoFromLocal(startsAtLocal) ?? '',
    endsAt: toIsoFromLocal(endsAtLocal) ?? '',
    productIds: (String(form.get('productIds') ?? '').trim() || '')
      .split(',').map(s => s.trim()).filter(Boolean),
    sizes: (String(form.get('sizes') ?? '').trim() || '')
      .split(',').map(s => s.trim()).filter(Boolean),
    active: String(form.get('active') ?? 'true') === 'true',
  };

  const parsed = CreateCouponPayload.safeParse(data);
  if (!parsed.success) return { ok:false, error: firstZodIssue(parsed.error) };

  try {
    await createCoupon(parsed.data);
    revalidatePath('/admin/coupons');
    return { ok:true };
  } catch (e: any) {
    return { ok:false, error: e?.message ?? 'Falha ao criar cupom' };
  }
}

export async function updateCouponAction(id: string, _: State, form: FormData): Promise<State> {
  const startsAtLocal = form.get('startsAt') ? String(form.get('startsAt')) : undefined;
  const endsAtLocal   = form.get('endsAt') ? String(form.get('endsAt')) : undefined;

  const data = {
    code: form.get('code') ? String(form.get('code')) : undefined,
    description: form.get('description') ? String(form.get('description')) : undefined,
    type: form.get('type') ? String(form.get('type')) : undefined,
    value: form.get('value') ? Number(form.get('value')) : undefined,
    minimumOrderValue: form.get('minimumOrderValue') ? Number(form.get('minimumOrderValue')) : undefined,
    maxRedemptions: form.get('maxRedemptions') ? Number(form.get('maxRedemptions')) : undefined,
    startsAt: startsAtLocal ? toIsoFromLocal(startsAtLocal) : undefined,
    endsAt: endsAtLocal ? toIsoFromLocal(endsAtLocal) : undefined,
    productIds: form.get('productIds')
      ? String(form.get('productIds')).split(',').map(s => s.trim()).filter(Boolean)
      : undefined,
    sizes: form.get('sizes')
      ? String(form.get('sizes')).split(',').map(s => s.trim()).filter(Boolean)
      : undefined,
    active: form.get('active') ? String(form.get('active')) === 'true' : undefined,
  };

  const parsed = UpdateCouponPayload.safeParse(data);
  if (!parsed.success) return { ok:false, error: firstZodIssue(parsed.error) };

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
