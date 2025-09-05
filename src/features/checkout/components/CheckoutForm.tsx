'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ App Router

type FormState = {
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export default function CheckoutForm() {
  const [formData, setFormData] = useState<FormState>({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      localStorage.setItem('checkoutData', JSON.stringify(formData));
      router.push('/payment'); // ajuste a rota real do seu checkout
    } catch {
      setError('Erro ao processar checkout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-brand-gray-dark border border-brand-gray-border rounded-lg p-8">
        <h2 className="text-3xl font-bold text-brand-gray-light mb-8 text-center">
          Dados de Entrega
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Informações Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nome" className="block text-sm text-brand-gray mb-2">
                Nome Completo *
              </label>
              <input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={onChange}
                required
                autoComplete="name"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-brand-gray mb-2">
                E-mail *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="contato@example.com"
              />
            </div>

            <div>
              <label htmlFor="telefone" className="block text-sm text-brand-gray mb-2">
                Telefone *
              </label>
              <input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={onChange}
                required
                inputMode="tel"
                autoComplete="tel"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm text-brand-gray mb-2">
                CPF *
              </label>
              <input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={onChange}
                required
                inputMode="numeric"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="cep" className="block text-sm text-brand-gray mb-2">
                CEP *
              </label>
              <input
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={onChange}
                required
                inputMode="numeric"
                autoComplete="postal-code"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="00000-000"
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm text-brand-gray mb-2">
                Estado *
              </label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={onChange}
                required
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
              >
                <option value="">Selecione</option>
                {ESTADOS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cidade" className="block text-sm text-brand-gray mb-2">
                Cidade *
              </label>
              <input
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={onChange}
                required
                autoComplete="address-level2"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="Sua cidade"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="endereco" className="block text-sm text-brand-gray mb-2">
                Endereço *
              </label>
              <input
                id="endereco"
                name="endereco"
                value={formData.endereco}
                onChange={onChange}
                required
                autoComplete="address-line1"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div>
              <label htmlFor="numero" className="block text-sm text-brand-gray mb-2">
                Número *
              </label>
              <input
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={onChange}
                required
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="123"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bairro" className="block text-sm text-brand-gray mb-2">
                Bairro *
              </label>
              <input
                id="bairro"
                name="bairro"
                value={formData.bairro}
                onChange={onChange}
                required
                autoComplete="address-line2"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="Seu bairro"
              />
            </div>

            <div>
              <label htmlFor="complemento" className="block text-sm text-brand-gray mb-2">
                Complemento
              </label>
              <input
                id="complemento"
                name="complemento"
                value={formData.complemento}
                onChange={onChange}
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light"
                placeholder="Apartamento, bloco, etc."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-brand-gray-border text-brand-gray-light rounded-md hover:bg-brand-gray/30"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-brand-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Continuar para Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
