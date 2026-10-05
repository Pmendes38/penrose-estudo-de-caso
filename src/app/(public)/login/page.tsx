'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from './actions';
import { Logo } from '@/shared/ui/Logo';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-lg font-bold text-brand-black bg-brand-blue hover:bg-blue-500 disabled:opacity-50"
    >
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, { ok: true });

  return (
    <div className="penrose-login-page">
      <div className="penrose-login-layout">
        <section className="penrose-login-brand" aria-label="Penrose">
          <div><h1>ONDE SEU HOBBY SE TORNA<br />ARTE COLECIONÁVEL.</h1></div>
          <Logo className="penrose-login-brand-logo" />
        </section>
        <section className="penrose-login-card">
          <Logo className="penrose-login-logo" />
          <h2>LOGIN</h2>
          <p className="penrose-login-welcome">Boas-vindas de volta, colecionador</p>
          <div className="penrose-login-social"><button type="button" disabled><b>G</b> Google</button><button type="button" disabled><b>f</b> Facebook</button></div>
          <div className="penrose-login-divider" />

        {/* IMPORTANTE: nada de onSubmit/catch — usamos action={formAction} */}
        <form className="space-y-6" action={formAction} noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-light mb-2">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
              className="penrose-login-input"
                placeholder="contato@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-light mb-2">Senha</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="penrose-login-input"
                placeholder="••••••••••"
              />
            </div>
          </div>

          {/* Exibe erro somente quando a action retorna erro; não captura NEXT_REDIRECT */}
          {!state.ok && state.error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {state.error}
            </div>
          )}

          <SubmitBtn />

          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={() => (window.location.href = '/register')}
              className="text-brand-blue hover:text-blue-400 text-sm font-medium"
            >
              📝 Criar conta de cliente
            </button>
            <div>
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="text-brand-blue hover:text-blue-400 text-sm font-medium"
              >
                ← Voltar para o site
              </button>
            </div>
          </div>
        </form>
        </section>
      </div>
    </div>
  );
}
