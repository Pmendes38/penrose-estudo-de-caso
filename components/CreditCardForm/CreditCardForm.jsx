'use client';

import { useState } from 'react';

export default function CreditCardForm({ onTokenize, amount }) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Aqui você implementaria a integração com o gateway de pagamento
      // Por exemplo, Asaas para tokenização do cartão
      
      // Simulação de tokenização
      const token = await simulateTokenization(formData);
      
      if (token) {
        onTokenize(token);
      } else {
        throw new Error('Falha na tokenização do cartão');
      }
    } catch (err) {
      setError(err.message || 'Erro ao processar cartão de crédito');
    } finally {
      setLoading(false);
    }
  };

  const simulateTokenization = async (cardData) => {
    // Simulação de API de tokenização
    return new Promise((resolve) => {
      setTimeout(() => {
        if (cardData.cardNumber && cardData.cardName && cardData.expiryMonth && cardData.expiryYear && cardData.cvv) {
          resolve('tok_' + Math.random().toString(36).substr(2, 9));
        } else {
          resolve(null);
        }
      }, 1000);
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Cartão de Crédito</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Número do Cartão *
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleCardNumberChange}
            required
            maxLength="19"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0000 0000 0000 0000"
          />
        </div>

        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
            Nome no Cartão *
          </label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            value={formData.cardName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Nome como está no cartão"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-2">
              Mês *
            </label>
            <select
              id="expiryMonth"
              name="expiryMonth"
              value={formData.expiryMonth}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Mês</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month.toString().padStart(2, '0')}>
                  {month.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-2">
              Ano *
            </label>
            <select
              id="expiryYear"
              name="expiryYear"
              value={formData.expiryYear}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Ano</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
              CVV *
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={formData.cvv}
              onChange={handleInputChange}
              required
              maxLength="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="123"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Valor a pagar:</span>
            <span className="text-2xl font-bold text-indigo-600">
              R$ {amount ? amount.toFixed(2) : '0,00'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processando...' : 'Pagar com Cartão'}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Seus dados estão protegidos com criptografia SSL
          </p>
        </div>
      </form>
    </div>
  );
}