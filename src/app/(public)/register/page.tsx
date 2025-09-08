// app/(public)/register/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { publicRegisterAction } from './actions';
import { Logo } from '@/shared/ui/Logo';

export default function CadastroPage() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '');
    const email = String(fd.get('email') ?? '');
    const phone = String(fd.get('phone') ?? '');
    const password = String(fd.get('password') ?? '');
    const confirm = String(fd.get('confirmPassword') ?? '');

    if (password !== confirm) {
      setError('As senhas não coincidem');
      setPending(false);
      return;
    }

    try {
      const data = await publicRegisterAction({ name, email, phone, password });
      if (data?.success) {
        router.replace('/login?message=Cadastro realizado com sucesso!');
      } else {
        throw new Error(data?.message ?? 'Erro no cadastro');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Erro no cadastro');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo className="h-12 w-auto mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-brand-gray-light">Criar Conta</h2>
          <p className="mt-2 text-brand-gray">Cadastre-se para começar suas compras</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-light mb-2">Nome</label>
              <input
                name="name" required autoComplete="name"
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:border-brand-blue"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-light mb-2">Email</label>
              <input
                name="email" type="email" required autoComplete="email"
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:border-brand-blue"
                placeholder="contato@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-light mb-2">Telefone</label>
              <input
                name="phone" inputMode="tel" autoComplete="tel"
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:border-brand-blue"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-light mb-2">Senha</label>
              <input
                name="password" type="password" required autoComplete="new-password"
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:border-brand-blue"
                placeholder="••••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-light mb-2">
                Confirmar Senha
              </label>
              <input
                name="confirmPassword" type="password" required autoComplete="new-password"
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:border-brand-blue"
                placeholder="••••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-brand-blue hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg"
          >
            {pending ? 'Criando conta…' : 'Criar Conta'}
          </button>

          <div className="text-center space-y-3">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-brand-blue hover:text-blue-400 text-sm font-medium"
            >
              Já tem conta? Entrar
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
