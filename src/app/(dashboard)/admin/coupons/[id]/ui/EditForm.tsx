'use client';

import type { Coupon } from '@/features/coupons/schemas';
import { useFormState, useFormStatus } from 'react-dom';
import { updateCouponAction, deleteCouponAction } from '../../actions';
import { useRouter } from 'next/navigation';

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending}>{pending ? 'Salvando…' : 'Salvar alterações'}</button>;
}

export default function EditForm({ coupon }: { coupon: Coupon }) {
  const router = useRouter();
  const bind = updateCouponAction.bind(null, coupon.id);
  const [state, formAction] = useFormState(bind as any, { ok:false });

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Editar Cupom</h1>
      {state.error && <p className="text-red-400">{state.error}</p>}
      {state.ok && <p className="text-green-400">Atualizado!</p>}

      <form action={formAction} className="grid grid-cols-2 gap-4">
        <input name="code" defaultValue={coupon.code} className="input col-span-1" />
        <select name="type" defaultValue={coupon.type} className="input col-span-1">
          <option value="PERCENT">PERCENT</option>
          <option value="FIXED">FIXED</option>
        </select>

        <input name="value" type="number" step="0.01" defaultValue={coupon.value} className="input col-span-1" />
        <input name="minimumOrderValue" type="number" step="0.01" defaultValue={coupon.minimumOrderValue ?? ''} className="input col-span-1" />

        <input name="maxRedemptions" type="number" defaultValue={coupon.maxRedemptions ?? ''} className="input col-span-1" />
        <select name="active" defaultValue={String(coupon.active)} className="input col-span-1">
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>

        <input name="startsAt" type="datetime-local" defaultValue={toLocalDT(coupon.startsAt)} className="input col-span-1" />
        <input name="endsAt" type="datetime-local" defaultValue={toLocalDT(coupon.endsAt)} className="input col-span-1" />

        <input name="productIds" defaultValue={(coupon.productIds ?? []).join(',')} className="input col-span-2" />
        <input name="sizes" defaultValue={(coupon.sizes ?? []).join(',')} className="input col-span-2" />
        <textarea name="description" defaultValue={coupon.description} className="input col-span-2" />

        <div className="col-span-2 flex items-center gap-3">
          <Submit />
          <form
            action={async () => {
              const ok = confirm(`Remover cupom ${coupon.code}?`);
              if (!ok) return;
              const res = await deleteCouponAction(coupon.id);
              if (res.ok) router.replace('/admin/coupons');
              else alert(res.error || 'Falha ao remover');
            }}
          >
            <button className="btn-danger" type="submit">Remover</button>
          </form>
        </div>
      </form>
    </div>
  );
}

function toLocalDT(d: Date) {
  const pad = (n: number) => `${n}`.padStart(2,'0');
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}
