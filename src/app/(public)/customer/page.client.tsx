'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { updateProfileAction } from './actions';
import { formatBRL, formatDate } from '@/shared/lib/format';
import type { Me } from '@/features/users/schemas';
import type { PagedOrders, Order } from '@/features/orders/schemas';

type State={ok:true}|{ok:false;message:string}|null;
async function reducer(_prev:State,fd:FormData):Promise<State>{try{await updateProfileAction(fd);return{ok:true}}catch(e:any){return{ok:false,message:e?.message??'Erro ao atualizar perfil'}}}
const total=(o:any)=>o.totalCents??o.totalAmountCents??o.amountCents??o.grandTotal??0;
const itemTotal=(i:any)=>i.totalCents??i.priceCents??((i.unitPriceCents??i.unitPrice??0)*(i.quantity??1));
function statusIndex(status:Order['status']|string){return({pending:0,processing:1,paid:1,shipped:2,delivered:3} as Record<string,number>)[String(status).toLowerCase()]??0}

export default function CustomerClient({me,ordersPage}:{me:Me|null;ordersPage:PagedOrders}) {
  const [state,action]=useFormState<State,FormData>(reducer,null);
  return <div className="penrose-page penrose-orders-page">
    <h1>MEUS PEDIDOS</h1>
    <div className="penrose-account-layout">
      <aside className="penrose-profile-card">
        <div className="profile-avatar">{(me?.name?.[0]??'P').toUpperCase()}</div><h2>{me?.name??'Colecionador'}</h2><p>{me?.email??'—'}</p>
        <nav><a href="#pedidos" className="is-active">MEUS PEDIDOS</a><a href="#perfil">DADOS PESSOAIS</a><Link href="/logout">SAIR</Link></nav>
        <form id="perfil" action={action}><label>Nome<input name="name" defaultValue={me?.name??''}/></label><label>Telefone<input name="phone" defaultValue={me?.phone??''}/></label>{state?.ok===false&&<p className="profile-error">{state.message}</p>}{state?.ok===true&&<p className="profile-success">Perfil atualizado!</p>}<Submit/></form>
      </aside>
      <section id="pedidos" className="penrose-orders-list">
        <header><div><span>HISTÓRICO</span><h2>{ordersPage.total} PEDIDO{ordersPage.total===1?'':'S'}</h2></div><Link href="/catalog">NOVO PEDIDO</Link></header>
        {ordersPage.items.map((order:any)=>{const idx=statusIndex(order.status);return <article className="penrose-order-card" key={order.id}>
          <header><div><small>PEDIDO</small><strong>#{order.code??order.orderNumber??order.id}</strong></div><div><small>REALIZADO EM</small><strong>{formatDate(String(order.createdAt))}</strong></div><div><small>TOTAL</small><strong>{formatBRL(total(order)/100)}</strong></div></header>
          <div className="order-products">{(order.items??[]).map((it:any,i:number)=><div key={i}>{it.image?<Image src={it.image} alt={it.name??'Item'} width={86} height={86}/>:<span/>}<div><h3>{it.name??'Item colecionável'}</h3><p>Quantidade: {it.quantity??1}{it.size?` · Tamanho: ${it.size}`:''}</p><strong>{formatBRL(itemTotal(it)/100)}</strong></div></div>)}</div>
          <div className="order-track">{['Realizado','Em produção','Enviado','Entregue'].map((label,i)=><div className={i<=idx?'is-done':''} key={label}><span>{i<idx?'✓':i+1}</span><small>{label}</small></div>)}</div>
          <footer><button>REPETIR PEDIDO</button><Link href={`/orders/${order.id}`}>VER DETALHES</Link>{idx<2&&<button className="cancel">CANCELAR PEDIDO</button>}</footer>
        </article>})}
        {!ordersPage.items.length&&<div className="penrose-empty-state"><h2>Você ainda não fez nenhum pedido.</h2><Link href="/catalog">EXPLORAR CATÁLOGO</Link></div>}
      </section>
    </div>
  </div>;
}

function Submit(){const{pending}=useFormStatus();return <button type="submit" disabled={pending}>{pending?'SALVANDO…':'SALVAR ALTERAÇÕES'}</button>}
