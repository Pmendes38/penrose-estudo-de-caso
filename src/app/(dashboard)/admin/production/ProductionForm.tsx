'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { ProductionStage, productionLabels } from '@/features/orders/schemas';
import { updateProductionAction } from './actions';

function Fields({ current }: { current?: ProductionStage }) {
  const { pending } = useFormStatus();
  return <fieldset disabled={pending} className="space-y-3 disabled:opacity-60">
    {current ? <label className="block text-sm">Etapa de produção
      <select name="stage" defaultValue={current} className="mt-1 w-full rounded border border-[#0066ff] bg-[#071127] p-2">
        {ProductionStage.options.map((stage, i) => <option key={stage} value={stage} disabled={Math.abs(i - ProductionStage.options.indexOf(current)) > 1}>{productionLabels[stage]}</option>)}
      </select>
    </label> : <input type="hidden" name="stage" value="todo" />}
    <button type="submit" className="rounded bg-[#0066ff] px-3 py-2 text-sm text-white">{pending ? 'Salvando…' : current ? 'Atualizar etapa' : 'Criar O.S. e enviar à produção'}</button>
  </fieldset>;
}

export default function ProductionForm({ id, current }: { id: string; current?: ProductionStage }) {
  const [state, action] = useFormState(updateProductionAction.bind(null, id), { ok: false } as { ok: boolean; error?: string });
  return <form action={action} className="space-y-2">
    <Fields current={current} />
    {state.error && <p role="alert" className="text-sm text-red-300">{state.error}</p>}
    {state.ok && <p role="status" className="text-sm text-green-300">Etapa salva.</p>}
  </form>;
}
