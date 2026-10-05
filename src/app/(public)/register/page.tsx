'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { publicRegisterAction } from './actions';
import { Logo } from '@/shared/ui/Logo';

export default function CadastroPage() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const fields = new FormData(event.currentTarget);
    const password = String(fields.get('password') ?? '');
    if (password !== String(fields.get('confirmPassword') ?? '')) {
      setError('As senhas não coincidem.');
      return;
    }
    setPending(true);
    try {
      const result = await publicRegisterAction({ name: String(fields.get('name') ?? ''), email: String(fields.get('email') ?? ''), password });
      if (!result?.success) throw new Error(result?.message ?? 'Erro no cadastro');
      router.replace('/login?message=Cadastro realizado com sucesso!');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Erro no cadastro');
    } finally {
      setPending(false);
    }
  }

  return <div className="penrose-login-page penrose-register-page"><div className="penrose-login-layout">
    <section className="penrose-login-brand" aria-label="Penrose"><h1>ONDE SEU HOBBY SE TORNA<br />ARTE COLECIONÁVEL.</h1><Logo className="penrose-login-brand-logo" /></section>
    <section className="penrose-login-card">
      <Logo className="penrose-login-logo" /><h2>CRIAR CONTA</h2><p className="penrose-login-welcome">Comece sua coleção Penrose</p>
      <div className="penrose-login-social"><button type="button" disabled title="Em breve"><b>G</b> Google</button><button type="button" disabled title="Em breve"><b>f</b> Facebook</button></div>
      <div className="penrose-login-divider" />
      <form onSubmit={onSubmit}>
        <div>
          <label>Nome completo<input className="penrose-login-input" name="name" required autoComplete="name" placeholder="Como podemos chamar você?" /></label>
          <label>E-mail<input className="penrose-login-input" name="email" type="email" required autoComplete="email" placeholder="contato@example.com" /></label>
          <label>Senha<input className="penrose-login-input" name="password" type="password" minLength={8} required autoComplete="new-password" placeholder="••••••••" /></label>
          <label>Confirmar senha<input className="penrose-login-input" name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" placeholder="••••••••" /></label>
        </div>
        {error && <p role="alert" className="penrose-register-error">{error}</p>}
        <button type="submit" disabled={pending}>{pending ? 'CRIANDO CONTA…' : 'CRIAR CONTA'}</button>
        <p className="penrose-register-signin">Já está cadastrado? <Link href="/login">Entrar</Link></p>
      </form>
    </section>
  </div></div>;
}
