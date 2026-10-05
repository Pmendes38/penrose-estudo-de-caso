'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShippingSelector from '@/features/shipping/ui/ShippingSelector';
import type { CalculateShippingInput, ShippingQuote } from '@/features/shipping/schemas';
import { useCart } from '@/features/cart/hooks/useCart';
import { setCheckoutSessionAction } from '@/app/(public)/checkout/actions';
import CouponField from '@/features/checkout/components/CouponField';
import EmptyStoreState from '@/shared/ui/EmptyStoreState';

type FormState = { nome:string; email:string; telefone:string; cpf:string; cep:string; endereco:string; numero:string; complemento:string; bairro:string; cidade:string; estado:string };
const ESTADOS=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const money=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const digits=(value:string)=>String(value||'').replace(/\D/g,'');

export default function CheckoutForm() {
  const router=useRouter();
  const {cart,isLoading,error:cartError}=useCart();
  const items=cart?.items??[];
  const subtotal=useMemo(()=>(cart?.itemsSubtotal??0)/100,[cart?.itemsSubtotal]);
  const cartDiscount=useMemo(()=>(cart?.discountTotal??0)/100,[cart?.discountTotal]);
  const [data,setData]=useState<FormState>({nome:'',email:'',telefone:'',cpf:'',cep:'',endereco:'',numero:'',complemento:'',bairro:'',cidade:'',estado:''});
  const [error,setError]=useState('');
  const [submitting,setSubmitting]=useState(false);
  const [shipping,setShipping]=useState<ShippingQuote|null>(null);
  const [coupon,setCoupon]=useState<{code?:string;discountTotal?:number}>({});
  const pkg=useMemo(()=>({weightKg:Math.max(.2,Math.min(30,items.reduce((sum,it:any)=>sum+(Number(it?.weightGrams??300)/1000)*Math.max(1,Number(it?.quantity)||1),0)||1)),widthCm:20,heightCm:10,lengthCm:20,declaredValue:Math.max(0,subtotal-cartDiscount)}),[items,subtotal,cartDiscount]);
  const shippingInput:CalculateShippingInput|null=useMemo(()=>data.cep.trim()?{destination:{postalCode:data.cep.trim()},packages:[pkg],cartTotal:Math.max(0,subtotal-cartDiscount),preferCheapest:true}:null,[data.cep,pkg,subtotal,cartDiscount]);
  const couponDiscount=coupon.discountTotal??0;
  const shippingTotal=shipping?.priceBRL??0;
  const grandTotal=Math.max(0,subtotal-cartDiscount-couponDiscount+shippingTotal);

  useEffect(()=>{try{const a=localStorage.getItem('checkoutData');if(a)setData(JSON.parse(a));const b=localStorage.getItem('selectedShipping');if(b)setShipping(JSON.parse(b));const c=localStorage.getItem('couponData');if(c)setCoupon(JSON.parse(c));}catch{}},[]);
  const onChange=(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>setData(s=>({...s,[e.target.name]:e.target.value}));

  async function submit(e:React.FormEvent){
    e.preventDefault();setSubmitting(true);setError('');
    if(isLoading||!items.length){setError(isLoading?'Aguarde o carregamento do carrinho.':'Seu carrinho está vazio.');setSubmitting(false);return;}
    if(digits(data.cep).length!==8){setError('Informe um CEP válido (8 dígitos).');setSubmitting(false);return;}
    if(!shipping?.id){setError('Selecione uma opção de frete.');setSubmitting(false);return;}
    try{
      localStorage.setItem('checkoutData',JSON.stringify(data));localStorage.setItem('selectedShipping',JSON.stringify(shipping));if(coupon.code)localStorage.setItem('couponData',JSON.stringify(coupon));
      const res=await setCheckoutSessionAction({customerData:{...data,name:data.nome,phone:data.telefone,address:data.endereco},selectedShipping:shipping,couponCode:coupon.code});
      if(!res?.ok)throw new Error(res?.error||'Falha ao preparar checkout');router.push('/payment');
    }catch(err:any){setError(err?.message??'Não foi possível prosseguir para o pagamento.');}finally{setSubmitting(false);}
  }

  const field=(name:keyof FormState,label:string,props:React.InputHTMLAttributes<HTMLInputElement>={})=><label><span>{label}</span><input id={name} name={name} value={data[name]} onChange={onChange} required={props.required!==false} {...props}/></label>;
  if (isLoading && !cart) return <div className="penrose-page penrose-loading">Carregando checkout…</div>;
  if (cartError && !cart) return <div className="penrose-page penrose-empty-state" role="alert">Não foi possível carregar o carrinho. Tente atualizar a página.</div>;
  if (!items.length) return <EmptyStoreState kind="checkout" />;
  return <div className="penrose-page penrose-checkout-page">
    <form onSubmit={submit} className="penrose-checkout-layout" noValidate>
      <section className="penrose-checkout-form">
        <h1><Link href="/cart" aria-label="Voltar ao carrinho">←</Link> CHECKOUT</h1>
        <fieldset><legend>1. Informações de Contato</legend><div className="checkout-grid two">{field('nome','Nome completo',{autoComplete:'name'})}{field('email','E-mail',{type:'email',autoComplete:'email'})}{field('telefone','Telefone',{autoComplete:'tel'})}{field('cpf','CPF',{inputMode:'numeric'})}</div></fieldset>
        <fieldset><legend>2. Endereço de Entrega</legend><div className="checkout-grid three">{field('cep','CEP',{inputMode:'numeric',autoComplete:'postal-code'})}{field('endereco','Endereço',{autoComplete:'street-address'})}{field('numero','Número')}{field('complemento','Complemento',{required:false})}{field('bairro','Bairro')}{field('cidade','Cidade')}<label><span>Estado</span><select name="estado" value={data.estado} onChange={onChange} required><option value="">Selecione</option>{ESTADOS.map(uf=><option key={uf}>{uf}</option>)}</select></label></div></fieldset>
        <fieldset><legend>3. Método de Entrega</legend><ShippingSelector input={shippingInput} onSelect={setShipping}/></fieldset>
        <fieldset><legend>4. Cupom de Desconto</legend><CouponField onApply={setCoupon}/>{coupon.code&&<p className="checkout-note">Cupom aplicado: <strong>{coupon.code}</strong></p>}</fieldset>
        <fieldset className="checkout-payment-next"><legend>5. Método de Pagamento</legend><p>Escolha Pix, boleto ou cartão com segurança na próxima etapa.</p></fieldset>
        {error&&<div className="penrose-form-error" role="alert">{error}</div>}
      </section>
      <aside className="penrose-checkout-summary">
        <h2>PEDIDOS</h2>
        <div className="checkout-items">{items.map(item=><article key={item.id}>{item.image?<img src={item.image} alt={item.name??item.sku}/>:<span/>}<div><h3>{item.name??item.sku}</h3><small>Quantidade: {item.quantity}</small><strong>{money(item.total/100)}</strong></div></article>)}</div>
        <dl><div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div><dt>Frete</dt><dd>{money(shippingTotal)}</dd></div><div><dt>Descontos</dt><dd>− {money(cartDiscount+couponDiscount)}</dd></div><div className="total"><dt>TOTAL</dt><dd>{money(grandTotal)}</dd></div></dl>
        <div className="checkout-security">Compra segura · Dados protegidos</div>
        <button type="submit" disabled={submitting||isLoading}>{submitting?'PREPARANDO…':'CONTINUAR PARA PAGAMENTO'}</button>
        <Link href="/cart" className="checkout-back">VOLTAR AO CARRINHO</Link>
      </aside>
    </form>
  </div>;
}
