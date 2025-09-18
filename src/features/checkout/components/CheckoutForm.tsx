'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ShippingSelector from '@/features/shipping/ui/ShippingSelector';
import type { CalculateShippingInput, ShippingQuote } from '@/features/shipping/schemas';
import { useCart } from '@/features/cart/hooks/useCart';
import { setCheckoutSessionAction } from '@/app/(public)/checkout/actions';
import CouponField from '@/features/checkout/components/CouponField';

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

function onlyDigits(v: string) { return String(v || '').replace(/\D/g, ''); }

export default function CheckoutForm() {
  const router = useRouter();

  const { cart, isLoading } = useCart();
  const items = cart?.items ?? [];

  const subtotalBRL = useMemo(() => (cart?.itemsSubtotal ?? 0) / 100, [cart?.itemsSubtotal]);
  const cartDiscountBRL = useMemo(() => (cart?.discountTotal ?? 0) / 100, [cart?.discountTotal]);

  const [formData, setFormData] = useState<FormState>({
    nome: '', email: '', telefone: '', cpf: '',
    cep: '', endereco: '', numero: '', complemento: '',
    bairro: '', cidade: '', estado: '',
  });
  const [clientError, setClientError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<ShippingQuote | null>(null);

  const [coupon, setCoupon] = useState<{ code?: string; discountTotal?: number }>({});

  // Peso/pacote (alinha com backend)
  const pkg = useMemo(() => {
    const weightKg =
      items.reduce((sum, it: any) => {
        const unitGrams = Number(it?.weightGrams ?? 300);
        const qty = Math.max(1, Number(it?.quantity) || 1);
        return sum + (unitGrams / 1000) * qty;
      }, 0) || 1;

    return {
      weightKg: Math.max(0.2, Math.min(30, weightKg)),
      widthCm: 20,
      heightCm: 10,
      lengthCm: 20,
      declaredValue: Math.max(0, subtotalBRL - cartDiscountBRL),
    };
  }, [items, subtotalBRL, cartDiscountBRL]);

  const shippingInput: CalculateShippingInput | null = useMemo(() => {
    const cep = (formData.cep || '').trim();
    if (!cep) return null;
    return {
      destination: { postalCode: cep },
      packages: [pkg],
      cartTotal: Math.max(0, subtotalBRL - cartDiscountBRL),
      preferCheapest: true,
    };
  }, [formData.cep, pkg, subtotalBRL, cartDiscountBRL]);

  const couponDiscountBRL = coupon?.discountTotal ?? 0;
  const shippingTotalBRL = selectedShipping?.priceBRL ?? 0;
  const grandTotalBRL = useMemo(
    () => Math.max(0, subtotalBRL - cartDiscountBRL - couponDiscountBRL + shippingTotalBRL),
    [subtotalBRL, cartDiscountBRL, couponDiscountBRL, shippingTotalBRL]
  );

  // Prefill
  useEffect(() => {
    try {
      const raw = localStorage.getItem('checkoutData');
      if (raw) setFormData(JSON.parse(raw));
      const rawShip = localStorage.getItem('selectedShipping');
      if (rawShip) setSelectedShipping(JSON.parse(rawShip));
      const rawCoupon = localStorage.getItem('couponData');
      if (rawCoupon) setCoupon(JSON.parse(rawCoupon));
    } catch {}
  }, []);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setClientError('');

    if (isLoading) {
      setClientError('Aguarde o carregamento do carrinho.');
      setSubmitting(false);
      return;
    }
    if (!items.length) {
      setClientError('Seu carrinho está vazio.');
      setSubmitting(false);
      return;
    }
    const cepDigits = onlyDigits(formData.cep);
    if (cepDigits.length !== 8) {
      setClientError('Informe um CEP válido (8 dígitos).');
      setSubmitting(false);
      return;
    }
    if (!selectedShipping?.id) {
      setClientError('Selecione uma opção de frete.');
      setSubmitting(false);
      return;
    }

    // Persistência local (qualquer erro aqui não bloqueia)
    try {
      localStorage.setItem('checkoutData', JSON.stringify(formData));
      if (selectedShipping) localStorage.setItem('selectedShipping', JSON.stringify(selectedShipping));
      else localStorage.removeItem('selectedShipping');
      if (coupon?.code) localStorage.setItem('couponData', JSON.stringify(coupon));
      else localStorage.removeItem('couponData');
    } catch {}

    try {
      const res = await setCheckoutSessionAction({
        customerData: {
          nome: formData.nome,
          name: formData.nome,
          email: formData.email,
          telefone: formData.telefone,
          phone: formData.telefone,
          cpf: formData.cpf,
          cep: formData.cep,
          endereco: formData.endereco,
          address: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
        },
        selectedShipping: selectedShipping ?? null,
        couponCode: coupon?.code ?? undefined,
      });

      if (!res?.ok) {
        throw new Error(res?.error || 'Falha ao preparar checkout');
      }

      // você pode enviar `?draft=...` para a página de pagamento se preferir
      // router.push(`/payment?draft=${encodeURIComponent(res.draftId)}`);
      router.push('/payment');
    } catch (err: any) {
      setClientError(err?.message ?? 'Não foi possível prosseguir para o pagamento.');
    } finally {
      setSubmitting(false);
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
            <ShippingSelector input={shippingInput} onSelect={setSelectedShipping} />
          </div>

          {/* Cupom */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-brand-gray-light">Cupom</h3>
            <CouponField onApply={(c) => setCoupon(c)} />
            {coupon?.code && (
              <p className="text-sm text-brand-gray mt-2">
                Aplicado: <span className="text-brand-gray-light font-medium">{coupon.code}</span>
              </p>
            )}
          </div>

          {/* Totais */}
          <div className="mt-6 space-y-1 text-sm text-brand-gray-light">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotalBRL.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
            </div>
            <div className="flex justify-between">
              <span>Frete</span>
              <span>{shippingTotalBRL.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
            </div>
            <div className="flex justify-between">
              <span>Descontos (carrinho + cupom)</span>
              <span>
                -{(cartDiscountBRL + couponDiscountBRL).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-white">
              <span>Total</span>
              <span>{grandTotalBRL.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
            </div>
          </div>

          {/* Mensagens */}
          {clientError && (
            <div className="bg-red-900/40 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
              {clientError}
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => history.back()}
              className="px-6 py-3 border border-brand-gray-border text-brand-gray-light rounded-md hover:bg-brand-gray/30"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="px-8 py-3 bg-brand-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? 'Preparando…' : 'Continuar para Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
