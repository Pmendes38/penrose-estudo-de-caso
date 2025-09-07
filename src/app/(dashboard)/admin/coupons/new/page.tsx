'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createCouponAction } from '../actions';

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending}>{pending ? 'Salvando…' : 'Salvar'}</button>;
}

export default function NewCouponPage() {
  const [state, formAction] = useFormState(createCouponAction, { ok:false });

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold">Novo Cupom</h1>
      {state.error && <p className="text-red-400">{state.error}</p>}
      {state.ok && <p className="text-green-400">Criado com sucesso!</p>}

      <form action={formAction} className="grid grid-cols-2 gap-4">
        <input name="code" placeholder="Código (ex.: BLACKFRIDAY)" className="input col-span-1" />
        <select name="type" className="input col-span-1">
          <option value="PERCENT">PERCENT</option>
          <option value="FIXED">FIXED</option>
        </select>

        <input name="value" type="number" step="0.01" placeholder="Valor" className="input col-span-1" />
        <input name="minimumOrderValue" type="number" step="0.01" placeholder="Mínimo do pedido (opcional)" className="input col-span-1" />

        <input name="maxRedemptions" type="number" placeholder="Limite (opcional)" className="input col-span-1" />
        <select name="active" className="input col-span-1">
          <option value="true">Ativo</option>
          <option value="false">Inativo</option>
        </select>

        <input name="startsAt" type="datetime-local" className="input col-span-1" />
        <input name="endsAt" type="datetime-local" className="input col-span-1" />

        <input name="productIds" placeholder="productIds separados por vírgula" className="input col-span-2" />
        <input name="sizes" placeholder="sizes separados por vírgula" className="input col-span-2" />
        <textarea name="description" placeholder="Descrição" className="input col-span-2" />

        <div className="col-span-2"><Submit /></div>
      </form>
    </div>
  );
}
