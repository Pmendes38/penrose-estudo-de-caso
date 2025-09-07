'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createAdminAction } from '../actions';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending}>{pending ? 'Salvando...' : 'Salvar'}</button>;
}

export default function NewAdminPage() {
  const [state, formAction] = useFormState(createAdminAction, { ok: false } as any);

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Novo admin</h1>
      {state?.error && <p className="text-red-400">{state.error}</p>}
      {state?.ok && <p className="text-green-400">Criado com sucesso!</p>}

      <form action={formAction} className="space-y-3">
        <input name="name" placeholder="Nome" className="input" />
        <input name="email" type="email" placeholder="Email" className="input" />
        <input name="password" type="password" placeholder="Senha" className="input" />
        <SubmitBtn />
      </form>
    </div>
  );
}
