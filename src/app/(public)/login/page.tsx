'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { publicLoginAction } from './actions';
import { Logo } from '@/shared/ui/Logo';

export default function Login() {
  const [serverError, setServerError] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError('');
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') ?? '');
    const password = String(fd.get('password') ?? '');

    try {
      const res = await publicLoginAction({ email, password });
      if (res?.role === 'admin') router.replace('/admin');
      else router.replace('/cliente');
    } catch (err: any) {
      setServerError(err?.message ?? 'Erro no login');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo className="h-12 w-auto mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-brand-gray-light">Faça seu login</h2>
          <p className="mt-2 text-brand-gray">Conecte-se à sua conta Penrose</p>
        </div>

        <form className="space-y-6" onSubmit={onSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-light mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:outline-none focus:border-brand-blue"
                placeholder="contato@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-light mb-2">
                Senha
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:outline-none focus:border-brand-blue"
                placeholder="••••••••••"
              />
            </div>
          </div>

          {serverError && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-lg font-bold text-brand-black bg-brand-blue hover:bg-blue-500 disabled:opacity-50"
          >
            {pending ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={() => router.push('/cadastro')}
              className="text-brand-blue hover:text-blue-400 text-sm font-medium"
            >
              📝 Criar conta de cliente
            </button>
            <div>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-brand-blue hover:text-blue-400 text-sm font-medium"
              >
                ← Voltar para o site
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
