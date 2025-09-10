'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createCoupon, updateCoupon, deleteCoupon } from '@/features/coupons/api';

// 🔹 Exporte o shape que o useFormState espera
export type State = { ok: boolean; error?: string };

const FormSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['PERCENT', 'FIXED']),
  value: z.coerce.number().positive(),
  minimumOrderValue: z.coerce.number().min(0).optional(),
  maxRedemptions: z.coerce.number().min(1).optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  // Aceitaremos CSV ou JSON (string) nos campos abaixo
  productIds: z.string().optional(),
  sizes: z.string().optional(),
  active: z.string().optional(), // 'true' | 'false'
});

// Suporta CSV ("a,b,c") OU JSON ('["a","b","c"]')
function parseList(value?: string) {
  if (!value) return [] as string[];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed);
      return Array.isArray(arr) ? arr.map((s) => String(s)) : [];
    } catch {
      return [];
    }
  }
  return trimmed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createCouponAction(_: State, form: FormData): Promise<State> {
  try {
    // Normaliza campos vazios para undefined (evita NaN do z.coerce.number())
    const rawObj = Object.fromEntries(form.entries());
    for (const k of ['minimumOrderValue', 'maxRedemptions'] as const) {
      if (rawObj[k] === '') rawObj[k] = undefined;
    }

    const parsed = FormSchema.safeParse(rawObj);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };
    }

    const d = parsed.data;

    await createCoupon({
      code: d.code.trim().toUpperCase(),
      description: d.description.trim(),
      type: d.type,
      value: d.value,
      minimumOrderValue: d.minimumOrderValue,
      maxRedemptions: d.maxRedemptions,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      productIds: parseList(d.productIds),
      sizes: parseList(d.sizes),
      active: d.active ? d.active === 'true' : true,
    });

    revalidatePath('/admin/coupons');
    revalidatePath('/coupons');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Falha ao criar cupom' };
  }
}

export async function updateCouponAction(
  id: string,
  _: State,
  form: FormData,
): Promise<State> {
  try {
    const rawObj = Object.fromEntries(form.entries());
    for (const k of ['minimumOrderValue', 'maxRedemptions'] as const) {
      if (rawObj[k] === '') rawObj[k] = undefined;
    }

    const parsed = FormSchema.partial().safeParse(rawObj);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos' };
    }

    const d = parsed.data;

    await updateCoupon(id, {
      code: d.code ? d.code.trim().toUpperCase() : undefined,
      description: d.description?.trim(),
      type: d.type as any,
      value: d.value,
      minimumOrderValue: d.minimumOrderValue,
      maxRedemptions: d.maxRedemptions,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      productIds: d.productIds ? parseList(d.productIds) : undefined,
      sizes: d.sizes ? parseList(d.sizes) : undefined,
      active: d.active ? d.active === 'true' : undefined,
    });

    revalidatePath('/admin/coupons');
    revalidatePath('/coupons');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Falha ao atualizar cupom' };
  }
}

export async function deleteCouponAction(id: string): Promise<State> {
  try {
    await deleteCoupon(id);
    revalidatePath('/admin/coupons');
    revalidatePath('/coupons');
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Falha ao excluir cupom' };
  }
}
