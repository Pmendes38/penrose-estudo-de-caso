'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

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
      console.log('🔄 Tentando login via backend:', { email, senha: senha ? '***' : 'vazio' });

      // Login via backend
  const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: senha }),
      });

      // Verificar se a resposta é válida antes de tentar fazer parse
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resposta do servidor:', errorText);
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        const responseText = await response.text();
        console.error('❌ Resposta recebida:', responseText);
        throw new Error('Resposta inválida do servidor');
      }

      console.log('✅ Login bem-sucedido:', data);
      console.log('🔑 Token recebido:', data.token ? 'SIM' : 'NÃO');
      console.log('👤 Role recebido:', data.role);
      console.log('📝 Nome recebido:', data.name);

      // Salvar token e role
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        // Se for admin, também salva como adminToken para compatibilidade
        if (data.role === 'admin') {
          localStorage.setItem('adminToken', data.token);
        }
        console.log('💾 Token salvo no localStorage');
      }
      localStorage.setItem('userRole', data.role || 'cliente');
      console.log('💾 Role salvo no localStorage:', data.role || 'cliente');

      // Redirecionar baseado no role
      console.log('🚀 Iniciando redirecionamento...');
      if (data.role === 'admin') {
        console.log('👨‍💼 Redirecionando para /admin');
        router.push('/admin');
      } else {
        console.log('👤 Redirecionando para /cliente');
        router.push('/cliente');
      }

    } catch (error) {
      console.error('❌ Erro de login:', error);
      setErro(error.message || 'Erro no login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img 
            src="/assets/WIDE LOGO.svg" 
            alt="Logo da PENROSE" 
            className="h-12 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-brand-gray-light">
            Faça seu login
          </h2>
          <p className="mt-2 text-brand-gray">
            Conecte-se à sua conta Penrose
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-gray-light mb-2">
                Email
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
              {erro}
            </div>
          )}

          {/* Botão de Login */}
          <div>
            <button
              type="submit"
              disabled={carregando}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-brand-black bg-brand-blue hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          {/* Links de navegação */}
          <div className="text-center space-y-3">
            {/* Link para registro */}
            <div>
              <button
                type="button"
                onClick={() => router.push('/cadastro')}
                className="text-brand-blue hover:text-blue-400 text-sm font-medium transition-colors"
              >
                📝 Criar conta de cliente
              </button>
            </div>
            
            {/* Link para voltar */}
            <div>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="text-brand-blue hover:text-blue-400 text-sm font-medium transition-colors"
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