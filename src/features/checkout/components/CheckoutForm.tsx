'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createOrderAction } from '@/app/(public)/checkout/actions';
import { useCart } from '@/shared/context/CartContext';

import ShippingSelector from '@/features/shipping/ui/ShippingSelector';
import type { CalculateShippingInput, ShippingQuote } from '@/features/shipping/schemas';

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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-8 py-3 bg-brand-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
    >
      {pending ? 'Finalizando…' : 'Continuar para Pagamento'}
    </button>
  );
}

export default function CheckoutForm({ coupon }: { coupon?: { code?: string; discountTotal?: number } }) {
  const [formData, setFormData] = useState<FormState>({
    nome: '', email: '', telefone: '', cpf: '',
    cep: '', endereco: '', numero: '', complemento: '',
    bairro: '', cidade: '', estado: '',
  });
  const [clientError, setClientError] = useState<string>('');
  const { items, total /*, clear*/ } = useCart(); // subtotal em BRL

  const [selectedShipping, setSelectedShipping] = useState<ShippingQuote | null>(null);

  const pkg = useMemo(() => ({
    weightKg: Math.max(0.2, Math.min(5, items.length * 0.3)), // exemplo simples
    widthCm: 20,
    heightCm: 10,
    lengthCm: 20,
    declaredValue: total,
  }), [items, total]);

  const shippingInput: CalculateShippingInput | null = useMemo(() => {
    if (!formData.cep) return null;
    return {
      destination: { postalCode: formData.cep },
      packages: [pkg],
      cartTotal: total,
      preferCheapest: true,
    };
  }, [formData.cep, pkg, total]);

  const discountTotal = coupon?.discountTotal ?? 0;
  const shippingTotal = selectedShipping?.priceBRL ?? 0;
  const grandTotal = useMemo(
    () => Math.max(0, total + shippingTotal - discountTotal),
    [total, shippingTotal, discountTotal]
  );

  const orderItemsJson = useMemo(() => JSON.stringify(items.map(it => ({
    productId: it.productId,
    name: it.name,
    quantity: it.quantity,
    unitPrice: it.price,
    size: (it.meta as any)?.size as string | undefined,
  }))), [items]);

  const notes = useMemo(() => {
    const line1 = `${formData.endereco}, ${formData.numero}${formData.complemento ? `, ${formData.complemento}` : ''}`;
    const line2 = `${formData.bairro} - ${formData.cidade}/${formData.estado}, CEP ${formData.cep}`;
    const buyer = `${formData.nome} — ${formData.email} — ${formData.telefone} — CPF ${formData.cpf}`;
    return `[ENDEREÇO]\n${line1}\n${line2}\n[CONTATO]\n${buyer}`;
  }, [formData]);

  const [state, formAction] = useFormState(createOrderAction, { ok: false } as any);

  function handleBeforeSubmit() {
    try {
      localStorage.setItem('checkoutData', JSON.stringify(formData));
      if (selectedShipping) {
        localStorage.setItem('selectedShipping', JSON.stringify(selectedShipping));
      }
      setClientError('');
    } catch {
      setClientError('Não foi possível salvar dados localmente (navegação privada?)');
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem('checkoutData');
      if (raw) setFormData(JSON.parse(raw));
      const rawShip = localStorage.getItem('selectedShipping');
      if (rawShip) setSelectedShipping(JSON.parse(rawShip));
    } catch {}
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  }

  // ---------------- UI ----------------
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-brand-gray-dark border border-brand-gray-border rounded-lg p-8">
        <h2 className="text-3xl font-bold text-brand-gray-light mb-8 text-center">
          Dados de Entrega
        </h2>

        <form
          action={formAction}
          className="space-y-6"
          noValidate
          onSubmit={handleBeforeSubmit}
        >
          {/* Informações Pessoais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nome" className="block text-sm text-brand-gray mb-2">Nome Completo *</label>
              <input id="nome" name="nome" value={formData.nome} onChange={onChange} required autoComplete="name"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-brand-gray mb-2">E-mail *</label>
              <input id="email" name="email" type="email" value={formData.email} onChange={onChange} required autoComplete="email"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
            <div>
              <label htmlFor="telefone" className="block text-sm text-brand-gray mb-2">Telefone *</label>
              <input id="telefone" name="telefone" value={formData.telefone} onChange={onChange} required inputMode="tel" autoComplete="tel"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
            <div>
              <label htmlFor="cpf" className="block text-sm text-brand-gray mb-2">CPF *</label>
              <input id="cpf" name="cpf" value={formData.cpf} onChange={onChange} required inputMode="numeric"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
          </div>

          {/* Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="cep" className="block text-sm text-brand-gray mb-2">CEP *</label>
              <input id="cep" name="cep" value={formData.cep} onChange={onChange} required inputMode="numeric" autoComplete="postal-code"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
            <div>
              <label htmlFor="estado" className="block text-sm text-brand-gray mb-2">Estado *</label>
              <select id="estado" name="estado" value={formData.estado} onChange={onChange} required
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light">
                <option value="">Selecione</option>
                {ESTADOS.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="cidade" className="block text-sm text-brand-gray mb-2">Cidade *</label>
              <input id="cidade" name="cidade" value={formData.cidade} onChange={onChange} required autoComplete="address-level2"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="endereco" className="block text-sm text-brand-gray mb-2">Endereço *</label>
              <input id="endereco" name="endereco" value={formData.endereco} onChange={onChange} required autoComplete="address-line1"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
            <div>
              <label htmlFor="numero" className="block text-sm text-brand-gray mb-2">Número *</label>
              <input id="numero" name="numero" value={formData.numero} onChange={onChange} required
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bairro" className="block text-sm text-brand-gray mb-2">Bairro *</label>
              <input id="bairro" name="bairro" value={formData.bairro} onChange={onChange} required autoComplete="address-line2"
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
            <div>
              <label htmlFor="complemento" className="block text-sm text-brand-gray mb-2">Complemento</label>
              <input id="complemento" name="complemento" value={formData.complemento} onChange={onChange}
                className="w-full px-4 py-3 bg-brand-black border border-brand-gray-border rounded-md focus:border-brand-blue text-brand-gray-light" />
            </div>
          </div>

          {/* Frete */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 text-brand-gray-light">Frete</h3>
            <ShippingSelector
              input={shippingInput}
              onSelect={setSelectedShipping}
            />
          </div>

          {/* Totais */}
          <div className="mt-6 space-y-1 text-sm text-brand-gray-light">
            <div className="flex justify-between"><span>Subtotal</span><span>{total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>{shippingTotal.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div>
            <div className="flex justify-between"><span>Descontos</span><span>-{discountTotal.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span></div>
            <div className="flex justify-between font-semibold text-white">
              <span>Total</span><span>{grandTotal.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
            </div>
          </div>

          {/* Mensagens */}
          {clientError && (
            <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
              {clientError}
            </div>
          )}
          {state?.error && (
            <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
              {state.error}
            </div>
          )}

          {/* Campos ocultos lidos pela Server Action */}
          <input type="hidden" name="items" value={orderItemsJson} />
          <input type="hidden" name="subtotal" value={String(total)} />
          <input type="hidden" name="shippingTotal" value={String(shippingTotal)} />
          <input type="hidden" name="discountTotal" value={String(discountTotal)} />
          <input type="hidden" name="grandTotal" value={String(grandTotal)} />
          <input type="hidden" name="couponCode" value={coupon?.code ?? ''} />
          <input type="hidden" name="notes" value={notes} />
          {/* shipping selecionado (o backend pode usar em payments) */}
          <input type="hidden" name="selectedShipping" value={selectedShipping ? JSON.stringify(selectedShipping) : ''} />

          {/* Ações */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => history.back()}
              className="px-6 py-3 border border-brand-gray-border text-brand-gray-light rounded-md hover:bg-brand-gray/30"
            >
              Voltar
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
