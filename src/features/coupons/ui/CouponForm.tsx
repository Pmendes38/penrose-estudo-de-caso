'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Coupon } from '@/features/coupons/schemas';

type Props = {
  // A Server Action vinda do Server Component (page) ou de um arquivo 'use server'
  action: (formData: FormData) => void | Promise<void>;
  defaultValue?: Partial<Coupon>;
  submitLabel?: string;
  // Para telas de edição você pode passar um onDeleteAction (ver nota abaixo)
  onDeleteAction?: ((formData: FormData) => void | Promise<void>) | null;
};

function SubmitBtn({ label = 'Salvar' }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-brand-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
    >
      {pending ? 'Salvando…' : label}
    </button>
  );
}

export default function CouponForm({
  action,
  defaultValue,
  submitLabel = 'Salvar',
  onDeleteAction = null,
}: Props) {
  const [code, setCode] = useState(defaultValue?.code ?? '');
  const [description, setDescription] = useState(defaultValue?.description ?? '');
  const [type, setType] = useState<'PERCENT' | 'FIXED'>((defaultValue?.type as any) ?? 'PERCENT');
  const [value, setValue] = useState<number>(Number(defaultValue?.value ?? 10));
  const [minimumOrderValue, setMinimumOrderValue] = useState<string>(
    defaultValue?.minimumOrderValue != null ? String(defaultValue.minimumOrderValue) : ''
  );
  const [maxRedemptions, setMaxRedemptions] = useState<string>(
    defaultValue?.maxRedemptions != null ? String(defaultValue.maxRedemptions) : ''
  );
  const [startsAt, setStartsAt] = useState<string>(toInputDateTime(defaultValue?.startsAt));
  const [endsAt, setEndsAt] = useState<string>(toInputDateTime(defaultValue?.endsAt));
  const [active, setActive] = useState<boolean>(defaultValue?.active ?? true);

  // Para edição, alguns backends exigem o id via form
  const id = (defaultValue as any)?.id as string | undefined;

  return (
    <div className="space-y-8">
      {/* Form principal: cria/atualiza */}
      <form action={action} className="space-y-6" noValidate>
        {id && <input type="hidden" name="id" value={id} />}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm text-brand-gray mb-2">Código *</label>
            <input
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 bg-brand-black border border-brand-gray-border rounded-md text-brand-gray-light"
              placeholder="PROMO10"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-brand-gray mb-2">Descrição *</label>
            <input
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-brand-black border border-brand-gray-border rounded-md text-brand-gray-light"
              placeholder="Desconto de 10% na loja toda"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-brand-gray mb-2">Tipo *</label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 bg-brand-black border border-brand-gray-border rounded-md text-brand-gray-light"
              required
            >
              <option value="PERCENT">Percentual (%)</option>
              <option value="FIXED">Valor Fixo (R$)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-brand-gray mb-2">Valor *</label>
            <input
              name="value"
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full px-3 py-2 bg-brand-black border border-brand-gray-border rounded-md text-brand-gray-light"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-brand-gray mb-2">Mínimo (R$)</label>
            <input
              name="minimumOrderValue"
              type="number"
              step="0.01"
              min="0"
              value={minimumOrderValue}
              onChange={(e) => setMinimumOrderValue(e.target.value)}
              className="w-full px-3 py-2 bg-brand-black border border-brand-gray-border rounded-md text-brand-gray-light"
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-brand-gray mb-2">Máx. resgates</label>
            <input
              name="maxRedemptions"
              type="number"
              min="1"
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value)}
              className="w-full px-3 py-2 bg-brand-black border border-brand-gray-border rounded-md text-brand-gray-light"
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="block text-sm text-brand-gray mb-2">Início *</label>
            <input
              name="startsAt"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="w-full px-3 py-2 bg-brand-black border border-brand-gray-border rounded-md text-brand-gray-light"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-brand-gray mb-2">Fim *</label>
            <input
              name="endsAt"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full px-3 py-2 bg-brand-black border border-brand-gray-border rounded-md text-brand-gray-light"
              required
            />
          </div>
        </div>

        {/* productIds / sizes: escondidos por enquanto (JSON) */}
        <input name="productIds" type="hidden" value={JSON.stringify([])} />
        <input name="sizes" type="hidden" value={JSON.stringify([])} />

        <div className="flex items-center gap-2">
          <input
            id="active"
            name="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            value={String(active)}
          />
          <label htmlFor="active" className="text-brand-gray">Ativo</label>
        </div>

        <div className="flex items-center justify-end gap-3">
          <SubmitBtn label={submitLabel} />
        </div>
      </form>

      {/* Botão/forma de exclusão (opcional, para tela de edição) */}
      {onDeleteAction && id && (
        <form action={onDeleteAction} className="flex justify-end">
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="px-6 py-3 border border-red-600 text-red-300 rounded-md hover:bg-red-900/30"
          >
            Excluir
          </button>
        </form>
      )}
    </div>
  );
}

function toInputDateTime(v?: unknown) {
  if (!v) return '';
  const d = new Date(v as any);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
