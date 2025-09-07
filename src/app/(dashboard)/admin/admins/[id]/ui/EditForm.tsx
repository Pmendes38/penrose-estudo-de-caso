'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateAdminAction, deleteAdminAction } from '../../actions';
import type { Admin } from '@/features/admins/schemas';
import { useRouter } from 'next/navigation';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <button className="btn-primary" disabled={pending}>{pending ? 'Salvando...' : 'Salvar alterações'}</button>;
}

export default function EditForm({ admin }: { admin: Admin }) {
  const router = useRouter();
  const updateWithId = updateAdminAction.bind(null, admin.id);
  const [state, formAction] = useFormState(updateWithId as any, { ok: false } as any);

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Editar admin</h1>
      {state?.error && <p className="text-red-400">{state.error}</p>}
      {state?.ok && <p className="text-green-400">Atualizado!</p>}

      <form action={formAction} className="space-y-3">
        <input name="name" defaultValue={admin.name} placeholder="Nome" className="input" />
        <input name="email" type="email" defaultValue={admin.email} placeholder="Email" className="input" />
        <input name="password" type="password" placeholder="Nova senha (opcional)" className="input" />
        <div className="flex items-center gap-3">
          <SubmitBtn />
          <form
            action={async () => {
              const r = confirm('Remover este admin?');
              if (!r) return;
              const res = await deleteAdminAction(admin.id);
              if (res.ok) router.replace('/admin/admins');
              else alert(res.error || 'Falha ao remover');
            }}
          >
            <button type="submit" className="btn-danger">Remover</button>
          </form>
        </div>
      </form>
    </div>
  );
}
