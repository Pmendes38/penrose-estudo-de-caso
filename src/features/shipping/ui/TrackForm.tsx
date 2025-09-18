'use client';
import { useState } from 'react';
import { trackShipment } from '../api/client';

export default function TrackForm() {
  const [code, setCode] = useState('');
  const [data, setData] = useState<any | null>(null);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setData(null); setLoading(true);
    try {
      const res = await trackShipment(code.trim());
      setData(res);
    } catch (e: any) {
      setErr(e?.message || 'Não foi possível rastrear agora.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-brand-gray-border p-4 bg-brand-gray-dark/40">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="LB123456789BR"
          className="flex-1 bg-brand-black border border-brand-gray-border rounded px-3 py-2 text-brand-gray-light"
        />
        <button
          type="submit"
          disabled={!code || loading}
          className="px-4 py-2 bg-brand-blue hover:bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Buscando…' : 'Rastrear'}
        </button>
      </div>

      {err && <div className="text-red-400 text-sm">{err}</div>}

      {data && (
        <div className="space-y-2 text-sm">
          <div className="rounded border border-brand-gray-border p-3">
            <div className="flex justify-between">
              <div><span className="text-brand-gray">Código:</span> <span className="text-brand-gray-light">{data.trackingCode}</span></div>
              <div><span className="text-brand-gray">Status:</span> <span className="text-white font-medium">{data.status}</span></div>
            </div>
            <div className="text-brand-gray">Atualizado em {new Date(data.lastUpdate).toLocaleString('pt-BR')}</div>
          </div>

          {Array.isArray(data.history) && data.history.length > 0 && (
            <ul className="space-y-2">
              {data.history.map((h: any, i: number) => (
                <li key={i} className="rounded border border-brand-gray-border p-3">
                  <div className="text-white">{h.description ?? h.status ?? 'Evento'}</div>
                  <div className="text-brand-gray text-xs">
                    {h.location ? `${h.location} • ` : ''}{h.date ? new Date(h.date).toLocaleString('pt-BR') : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
