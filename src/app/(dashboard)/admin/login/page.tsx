'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { adminLoginAction, type State } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      aria-disabled={pending}
      disabled={pending}
      className="w-full bg-brand-blue text-white rounded py-2 font-semibold disabled:opacity-50"
    >
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [state, formAction] = useFormState<State, FormData>(adminLoginAction, { ok: false });

  useEffect(() => {
    if (state.ok) router.replace('/admin');
  }, [state.ok, router]);

  return (
    <div className="min-h-screen grid place-items-center bg-brand-black px-4">
      <form
        action={formAction}
        className="w-full max-w-md space-y-4 bg-brand-gray-dark p-6 rounded-lg border border-brand-gray-border"
        aria-describedby={state.error ? 'form-error' : undefined}
      >
        <h1 className="text-2xl font-bold text-brand-gray-light">Admin Panel</h1>

        {state.error && (
          <div id="form-error" className="text-red-300 text-sm" role="alert">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm text-brand-gray-light mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full bg-brand-gray-dark border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light"
            placeholder="contato@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-brand-gray-light mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            className="w-full bg-brand-gray-dark border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light"
            placeholder="••••••••"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
