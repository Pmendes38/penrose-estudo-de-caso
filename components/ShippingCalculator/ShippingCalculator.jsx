'use client';

import React, { useState } from 'react';
import { LoadingSpinner } from '../Loading/Loading';

const ShippingCalculator = ({ product, selectedSize }) => {
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculated, setCalculated] = useState(false);

  // Formatar CEP durante a digitação
  const formatCEP = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return numbers.slice(0, 5) + '-' + numbers.slice(5, 8);
    }
  };

  const handleCepChange = (e) => {
    const formatted = formatCEP(e.target.value);
    setCep(formatted);
    
    // Reset do estado se o CEP foi alterado
    if (calculated) {
      setCalculated(false);
      setShippingOptions([]);
      setError('');
    }
  };

  const validateCEP = (cep) => {
    // Remove a máscara para validar
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8;
  };

  const calculateShipping = async () => {
    if (!cep) {
      setError('Por favor, digite seu CEP');
      return;
    }

    if (!validateCEP(cep)) {
      setError('Por favor, digite um CEP válido (8 dígitos)');
      return;
    }

    if (!product || !selectedSize) {
      setError('Por favor, selecione um tamanho do produto');
      return;
    }

    setLoading(true);
    setError('');
    setShippingOptions([]);

    try {
      console.log('🚚 Calculando frete para:', cep);

      // Preparar dados do produto para o cálculo
      const productData = {
        id: product.id,
        name: product.name,
        price: selectedSize.price,
        weight: product.weight || 1,
        length: product.length || 20,
        width: product.width || 15,
        height: product.height || 10,
        selectedSize: selectedSize
      };

  const response = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cep: cep.replace(/\D/g, ''), // Enviar apenas números
          product: productData
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (Array.isArray(result) && result.length > 0) {
        console.log('✅ Opções de frete calculadas:', result.length);
        setShippingOptions(result);
        setCalculated(true);
      } else {
        setError('Não foi possível calcular o frete para este CEP');
      }

    } catch (error) {
      console.error('❌ Erro ao calcular frete:', error);
      setError('Erro ao calcular frete. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      calculateShipping();
    }
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return 'Consultar';
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
      <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
        🚚 Calcular Frete
      </h4>
      
      <div className="space-y-3">
        {/* Input do CEP */}
        <div className="flex gap-2">
          <input
            type="text"
            value={cep}
            onChange={handleCepChange}
            onKeyPress={handleKeyPress}
            placeholder="Digite seu CEP (00000-000)"
            maxLength="9"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-blue transition-colors"
            disabled={loading}
          />
          <button
            onClick={calculateShipping}
            disabled={loading || !cep}
            className="px-4 py-2 bg-brand-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Calculando...
              </>
            ) : (
              'Calcular'
            )}
          </button>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-2">
            {error}
          </div>
        )}

        {/* Opções de frete */}
        {calculated && shippingOptions.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-300 mb-2">
              Opções de entrega para {cep}:
            </h5>
            {shippingOptions.map((option, index) => (
              <div
                key={option.id || index}
                className="bg-gray-700/50 rounded-lg p-3 border border-gray-600"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-white">
                    {option.name}
                  </span>
                  <span className="text-brand-blue font-bold">
                    {option.price === 0 ? 'GRÁTIS' : formatPrice(option.price)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>{option.company?.name || 'Transportadora'}</span>
                  <span>{option.description || 'Prazo a confirmar'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informação sobre frete grátis */}
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span>💡</span>
          <span>
            {selectedSize && selectedSize.price >= 400 ? (
              <span className="text-green-400 font-medium">
                🎉 Parabéns! Você tem frete GRÁTIS neste produto!
              </span>
            ) : (
              `Acima de R$ 400,00 garantimos frete grátis! 
              ${selectedSize ? `Faltam R$ ${(400 - selectedSize.price).toFixed(2).replace('.', ',')} para o frete grátis.` : ''}`
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShippingCalculator;