'use client';

import type { Coupon } from '@/features/coupons/schemas';
import { useFormState, useFormStatus } from 'react-dom';
import { updateCouponAction, deleteCouponAction } from '../../actions';
import type { State as ActionState } from '../../actions';
import { useRouter } from 'next/navigation';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? 'Salvando…' : 'Salvar alterações'}
    </button>
  );
}

function DeleteButton({ id, code, onSuccess }: { id: string; code: string; onSuccess: () => void }) {
  const { pending } = useFormStatus(); // opcional; se quiser compor com server action via <form action=...>
  return (
    <button
      className="btn-danger"
      type="button"
      disabled={pending}
      onClick={async () => {
        const ok = confirm(`Remover cupom ${code}?`);
        if (!ok) return;
        const res = await deleteCouponAction(id);
        if (res.ok) onSuccess();
        else alert(res.error || 'Falha ao remover');
      }}
    >
      {pending ? 'Removendo…' : 'Remover'}
    </button>
  );
}

export default function EditForm({ coupon }: { coupon: Coupon }) {
  const router = useRouter();

  const bound = updateCouponAction.bind(null, coupon.id) as (
    state: ActionState,
    formData: FormData
  ) => Promise<ActionState>;

  const [state, formAction] = useFormState<ActionState, FormData>(bound, { ok: false });

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Editar Cupom</h1>

      {state.error && <p className="text-red-400">{state.error}</p>}
      {state.ok && <p className="text-green-400">Atualizado!</p>}

      {/* ⚠️ Um único <form>. Nada de form aninhado. */}
      <form action={formAction} className="grid grid-cols-2 gap-4">
        <input
          name="code"
          defaultValue={coupon.code}
          className="input col-span-1"
          placeholder="Código (UPPERCASE)"
        />

        <select
          name="type"
          defaultValue={coupon.type}
          className="input col-span-1"
        >
          <option value="PERCENT">PERCENT</option>
          <option value="FIXED">FIXED</option>
        </select>

        <input
          name="value"
          type="number"
          step="0.01"
          defaultValue={coupon.value}
          className="input col-span-1"
          placeholder="Valor"
        />

        <input
          name="minimumOrderValue"
          type="number"
          step="0.01"
          defaultValue={coupon.minimumOrderValue ?? ''}
          className="input col-span-1"
          placeholder="Pedido mínimo"
        />

        <input
          name="maxRedemptions"
          type="number"
          defaultValue={coupon.maxRedemptions ?? ''}
          className="input col-span-1"
          placeholder="Limite de usos"
        />

        <select
          name="active"
          defaultValue={String(coupon.active)}
          className="input col-span-1"
        >
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>

        <input
          name="startsAt"
          type="datetime-local"
          defaultValue={toLocalDT(coupon.startsAt)}
          className="input col-span-1"
        />

        <input
          name="endsAt"
          type="datetime-local"
          defaultValue={toLocalDT(coupon.endsAt)}
          className="input col-span-1"
        />

        <input
          name="productIds"
          defaultValue={(coupon.productIds ?? []).join(',')}
          className="input col-span-2"
          placeholder="IDs de produto, separados por vírgula"
        />

        <input
          name="sizes"
          defaultValue={(coupon.sizes ?? []).join(',')}
          className="input col-span-2"
          placeholder="Tamanhos, separados por vírgula"
        />

        <textarea
          name="description"
          defaultValue={coupon.description}
          className="input col-span-2"
          placeholder="Descrição"
        />

        <div className="col-span-2 flex items-center gap-3">
          <Submit />
          <DeleteButton
            id={coupon.id}
            code={coupon.code}
            onSuccess={() => router.replace('/admin/coupons')}
          />
        </div>
      </form>
    </div>
  );
}

function toLocalDT(d: Date | string | null | undefined): string {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n: number) => `${n}`.padStart(2, '0');
  const yyyy = dt.getFullYear();
  const MM = pad(dt.getMonth() + 1);
  const dd = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}
