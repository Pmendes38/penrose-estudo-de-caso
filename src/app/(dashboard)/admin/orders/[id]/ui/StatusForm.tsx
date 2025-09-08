'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateStatusAction, cancelOrderAction, refundOrderAction } from '../../actions';
import type { State as ActionState } from '../../actions';
import type { OrderStatus } from '@/features/orders/schemas';

const nextBy: Record<OrderStatus, readonly OrderStatus[]> = {
  pending:    ['processing', 'canceled'],
  processing: ['paid', 'canceled'],
  paid:       ['shipped', 'refunded'],
  shipped:    ['delivered'],
  delivered:  [],
  canceled:   [],
  refunded:   [],
} as const;

function SaveBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending}>
      {pending ? 'Salvando…' : 'Atualizar status'}
    </button>
  );
}

export default function StatusForm({ id, current }: { id: string; current: OrderStatus }) {
  const bound = updateStatusAction.bind(null, id) as (
    prevState: ActionState,
    formData: FormData
  ) => Promise<ActionState>;

  const [state, formAction] = useFormState<ActionState, FormData>(bound, { ok: false });

  const options = nextBy[current] ?? [];

  return (
    <div className="space-y-3">
      {state.error && <p className="text-red-400">{state.error}</p>}
      {state.ok && <p className="text-green-400">Status atualizado!</p>}

      {options.length ? (
        <form action={formAction} className="flex items-center gap-3">
          <select name="status" className="input" defaultValue={options[0]}>
            {options.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <SaveBtn />
        </form>
      ) : (
        <p className="text-sm text-brand-gray">
          Sem transições disponíveis a partir de <span className="font-mono">{current}</span>.
        </p>
      )}

      <div className="flex gap-2">
        <form
          action={async () => {
            if (confirm('Cancelar pedido?')) {
              const res = await cancelOrderAction(id);
              if (!res.ok) alert(res.error ?? 'Falha ao cancelar pedido');
            }
          }}
        >
          <button
            className="btn-secondary"
            type="submit"
            disabled={['delivered', 'refunded', 'canceled'].includes(current)}
          >
            Cancelar
          </button>
        </form>

        <form
          action={async () => {
            if (confirm('Estornar pedido?')) {
              const res = await refundOrderAction(id);
              if (!res.ok) alert(res.error ?? 'Falha ao estornar pedido');
            }
          }}
        >
          <button
            className="btn-secondary"
            type="submit"
            disabled={[
              'pending',
              'processing',
              'shipped',
              'delivered',
              'canceled',
              'refunded',
            ].includes(current)}
          >
            Estornar
          </button>
        </form>
      </div>
    </div>
  );
}
