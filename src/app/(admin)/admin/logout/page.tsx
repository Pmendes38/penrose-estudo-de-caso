'use client';

import { useFormStatus } from 'react-dom';
import { adminLogoutAction } from './action';

function Button() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded bg-brand-blue text-white disabled:opacity-50"
    >
      {pending ? 'Saindo…' : 'Sair'}
    </button>
  );
}

export default function LogoutPage() {
  return (
    <form action={adminLogoutAction} className="grid place-items-center min-h-[50vh] gap-4">
      <p className="text-brand-gray-light">Tem certeza que deseja sair?</p>
      <Button />
    </form>
  );
}
