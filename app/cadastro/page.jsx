'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
  const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro no servidor' }));
        throw new Error(errorData.message || 'Erro no cadastro');
      }

      const data = await response.json();
      
      if (data.success) {
        router.push('/login?message=Cadastro realizado com sucesso!');
      } else {
        throw new Error(data.message || 'Erro no cadastro');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError(error.message || 'Erro no cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            src="/assets/WIDE LOGO.svg" 
            alt="Logo da PENROSE" 
            className="h-12 w-auto mx-auto mb-6"
          />
          <h2 className="text-3xl font-bold text-brand-gray-light">
            Criar Conta
          </h2>
          <p className="mt-2 text-brand-gray">
            Cadastre-se para começar suas compras
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brand-gray-light mb-2">
                Nome Completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-gray-light mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200"
                placeholder="contato@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-gray-light mb-2">
                Telefone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-gray-light mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200"
                placeholder="••••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-gray-light mb-2">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-brand-gray-dark border border-brand-gray-border text-brand-gray-light py-3 px-4 rounded-lg focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/50 transition-all duration-200"
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
            disabled={loading}
            className="w-full bg-brand-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <div className="text-center space-y-3">
            <div>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="text-brand-blue hover:text-blue-400 text-sm font-medium transition-colors"
              >
                Já tem uma conta? Faça login
              </button>
            </div>
            
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