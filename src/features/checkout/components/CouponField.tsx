'use client';

import { useState } from 'react';

export default function CouponField({ onApply }: { onApply: (coupon: any) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json?.message ?? 'Cupom inválido'); return; }
      onApply(json.coupon);
    } catch (e: any) {
      setError(e?.message ?? 'Falha ao validar cupom');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        className="input flex-1"
        placeholder="Cupom de desconto"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button onClick={apply} className="btn-secondary" disabled={loading}>
        {loading ? 'Validando…' : 'Aplicar'}
      </button>
      {error && <span className="text-red-400 text-sm ml-2">{error}</span>}
    </div>
  );
}
