// components/CreditCardForm/CreditCardForm.tsx
'use client';

import { useMemo, useState } from 'react';
import { formatBRL } from '@/src/shared/lib/format';

type Props = {
  amount: number;
  onTokenize: (token: string) => void;
};

type FormDataState = {
  cardNumber: string;   // 0000 0000 0000 0000
  cardName: string;     // como no cartão
  expiryMonth: string;  // "01".."12"
  expiryYear: string;   // "2025"
  cvv: string;          // 3-4 dígitos
};

const onlyDigits = (s: string) => s.replace(/\D+/g, '');

function formatCardNumber(value: string) {
  // 4-4-4-4
  const v = onlyDigits(value).slice(0, 16);
  return v.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function luhnValid(pan: string) {
  const digits = onlyDigits(pan);
  if (digits.length < 13) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function expiryValid(month: string, year: string) {
  const m = Number(month);
  const y = Number(year);
  if (!m || !y || m < 1 || m > 12) return false;
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  return y > thisYear || (y === thisYear && m >= thisMonth);
}

export default function CreditCardForm({ amount, onTokenize }: Props) {
  const [formData, setFormData] = useState<FormDataState>({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const years = useMemo(() => {
    const start = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => String(start + i));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      setFormData((p) => ({ ...p, cardNumber: formatCardNumber(value) }));
    } else if (name === 'cvv') {
      setFormData((p) => ({ ...p, cvv: onlyDigits(value).slice(0, 4) }));
    } else if (name === 'cardName') {
      setFormData((p) => ({ ...p, cardName: value.toUpperCase() }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    // validações básicas antes de chamar a API
    if (!luhnValid(formData.cardNumber)) {
      setError('Número do cartão inválido.');
      return;
    }
    if (!expiryValid(formData.expiryMonth, formData.expiryYear)) {
      setError('Data de validade inválida.');
      return;
    }
    if (formData.cvv.length < 3) {
      setError('CVV inválido.');
      return;
    }

    setLoading(true);
    try {
      // ❗️Melhor prática: tokenizar via SDK do gateway no browser.
      // Se não houver SDK, poste para *sua rota* que chama o gateway.
      const res = await fetch('/api/payments/tokenize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // NUNCA logue nem persista esse payload. A rota só repassa ao gateway e descarta.
        body: JSON.stringify({
          pan: onlyDigits(formData.cardNumber),
          name: formData.cardName.trim(),
          expMonth: formData.expiryMonth,
          expYear: formData.expiryYear,
          cvv: formData.cvv,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || 'Falha na tokenização');
      }
      const { token } = (await res.json()) as { token: string };
      if (!token) throw new Error('Token não retornado');

      onTokenize(token);
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar cartão.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Cartão de Crédito</h3>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="cc-number" className="block text-sm font-medium text-gray-700 mb-2">
            Número do Cartão *
          </label>
          <input
            id="cc-number"
            name="cardNumber"
            inputMode="numeric"
            autoComplete="cc-number"
            value={formData.cardNumber}
            onChange={handleChange}
            required
            maxLength={19}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0000 0000 0000 0000"
          />
        </div>

        <div>
          <label htmlFor="cc-name" className="block text-sm font-medium text-gray-700 mb-2">
            Nome no Cartão *
          </label>
          <input
            id="cc-name"
            name="cardName"
            autoComplete="cc-name"
            value={formData.cardName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="COMO NO CARTÃO"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="cc-exp-month" className="block text-sm font-medium text-gray-700 mb-2">
              Mês *
            </label>
            <select
              id="cc-exp-month"
              name="expiryMonth"
              autoComplete="cc-exp-month"
              value={formData.expiryMonth}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Mês</option>
              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cc-exp-year" className="block text-sm font-medium text-gray-700 mb-2">
              Ano *
            </label>
            <select
              id="cc-exp-year"
              name="expiryYear"
              autoComplete="cc-exp-year"
              value={formData.expiryYear}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Ano</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cc-csc" className="block text-sm font-medium text-gray-700 mb-2">
              CVV *
            </label>
            <input
              id="cc-csc"
              name="cvv"
              inputMode="numeric"
              autoComplete="cc-csc"
              value={formData.cvv}
              onChange={handleChange}
              required
              maxLength={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="123"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
        )}

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Valor a pagar:</span>
            <span className="text-2xl font-bold text-indigo-600">
              {formatBRL(amount)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Pagar com Cartão'}
        </button>

        <p className="text-center text-sm text-gray-500">
          Seus dados são enviados diretamente ao gateway e não são armazenados.
        </p>
      </form>
    </div>
  );
}
