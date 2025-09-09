'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from './actions';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  );
}

export default function LoginForm() {
  const [state, action] = useFormState<LoginState, FormData>(loginAction, { ok: false, error: '' });

  return (
    <form action={action} className="space-y-4">
      <input name="email" type="email" required className="input" placeholder="Email" />
      <input name="password" type="password" required className="input" placeholder="Senha" />
      {!state.ok && state.error && (
        <p className="text-red-400 text-sm">{state.error}</p>
      )}
      <SubmitBtn />
    </form>
  );
}
