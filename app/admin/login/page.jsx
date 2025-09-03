'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se já está logado
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (token && role === 'admin') {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    if (!email || !senha) {
      setErro('Email e senha são obrigatórios');
      setCarregando(false);
      return;
    }

    try {
  const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: senha }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro no servidor' }));
        throw new Error(errorData.message || 'Erro na autenticação');
      }

      const data = await response.json();

      if (data.success && data.token) {
        // Salvar token e role
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', 'admin');
        
        console.log('✅ Login admin bem-sucedido');
        
        // Redirecionar para o dashboard
        router.push('/admin');
      } else {
        throw new Error('Credenciais inválidas');
      }

    } catch (error) {
      console.error('❌ Erro de login admin:', error);
      setErro(error.message || 'Erro no login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <img 
            src="/assets/WIDE LOGO.svg" 
            alt="Logo da PENROSE" 
            className="h-12 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-brand-gray-light">
            Painel Administrativo
          </h2>
          <p className="mt-2 text-brand-gray">
            Acesso restrito para administradores
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-gray-light mb-2">
                Email do Administrador
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200"
                placeholder="contato@example.com"
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-brand-gray-light mb-2">
                Senha
              </label>
              <input
                id="senha"
                name="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200"
                placeholder="••••••••••"
              />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {erro && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              🚨 {erro}
            </div>
          )}

          {/* Botão de Login */}
          <div>
            <button
              type="submit"
              disabled={carregando}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {carregando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </>
              ) : (
                '🔐 Acessar Painel'
              )}
            </button>
          </div>

          {/* Aviso de Segurança */}
          <div className="bg-yellow-900/20 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg text-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-lg">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="font-medium">Área Restrita</p>
                <p className="mt-1 text-xs">
                  Acesso permitido apenas para administradores autorizados. 
                  Todas as ações são monitoradas e registradas.
                </p>
              </div>
            </div>
          </div>

          {/* Link para voltar */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-brand-blue hover:text-blue-400 text-sm font-medium transition-colors"
            >
              ← Voltar para o site
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}