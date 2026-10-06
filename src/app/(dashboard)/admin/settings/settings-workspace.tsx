'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { Admin } from '@/features/admins/schemas';
import { userLogoutAction } from '../logout/action';

const icon = (name: string) => <img src={`/assets/admin/settings-${name}.svg`} alt="" aria-hidden="true" className="shrink-0" />;
const sections = [
  { id: 'store', label: 'Dados da loja', icon: 'store' },
  { id: 'payments', label: 'Pagamentos', icon: 'credit-card' },
  { id: 'shipping', label: 'Entrega', icon: 'truck' },
  { id: 'notifications', label: 'Notificações', icon: 'bell' },
  { id: 'team', label: 'Equipe e permissões', icon: 'users' },
  { id: 'security', label: 'Segurança', icon: 'shield-check' },
];
const button = 'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-white/[.14] bg-[#071127] px-4 text-[13px] font-semibold text-[#9ca3af] hover:border-[#06f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#06f]';

function Panel({ id, title, description, action, children, height }: { id: string; title: string; description: string; action?: ReactNode; children: ReactNode; height: string }) {
  return <section id={id} aria-labelledby={`${id}-heading`} className={`min-w-0 scroll-mt-5 rounded-lg border border-[#0066ff]/[.33] bg-[#02091b] ${height}`}>
    <div className="flex min-h-[72px] items-center justify-between gap-3 border-b border-white/[.07] px-5 py-4">
      <div className="min-w-0"><h2 id={`${id}-heading`} className="text-base font-semibold leading-5">{title}</h2><p className="mt-[3px] text-[11px] leading-[14px] text-[#6b7280]">{description}</p></div>{action}
    </div>
    {children}
  </section>;
}

function Field({ label, value }: { label: string; value?: string }) {
  return <label className="flex min-w-0 flex-col gap-[7px] text-xs font-medium text-[#d1d5db]">{label}<input readOnly value={value ?? ''} placeholder="Não informado" className="h-[38px] w-full rounded-md border border-white/[.14] bg-[#071127] px-3 text-xs font-normal text-white placeholder:text-[#6b7280] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#06f]" /></label>;
}

function Toggle({ label, description, checked = false }: { label: string; description: string; checked?: boolean }) {
  return <div className="flex items-center justify-between gap-4">
    <div className="min-w-0"><p className="text-xs font-semibold">{label}</p><p className="mt-[2px] text-[10px] text-[#6b7280]">{description}</p></div>
    <button type="button" role="switch" aria-label={label} aria-checked={checked} disabled title="Alteração indisponível" className="shrink-0 cursor-not-allowed">{icon(checked ? 'switch-on' : 'switch-off')}</button>
  </div>;
}

export default function SettingsWorkspace({ admins, adminCount }: { admins: Pick<Admin, 'id' | 'name'>[]; adminCount: number }) {
  const [activeSection, setActiveSection] = useState('store');
  const unavailableSave = <button type="button" disabled title="Edição indisponível" className={`${button} cursor-not-allowed`}>Salvar</button>;

  return <div className="grid items-start gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
    <aside className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#0066ff]/[.33] bg-[#02091b] xl:min-h-[920px]">
      <div className="border-b border-white/[.07] p-5"><h2 className="text-[15px] font-semibold">Configurações</h2><p className="mt-1 text-[11px] leading-[1.4] text-[#6b7280]">Preferências da operação Penrose</p></div>
      <nav aria-label="Seções de configuração" className="flex flex-wrap gap-1 p-2.5 xl:block xl:space-y-1">{sections.map(section => <a key={section.id} href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined} onClick={() => setActiveSection(section.id)} className={`flex h-[42px] items-center gap-2.5 rounded-md px-3 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#06f] ${activeSection === section.id ? 'bg-[#06f]/15 font-semibold text-white' : 'text-[#9ca3af] hover:bg-[#06f]/10 hover:text-white'}`}>
        {icon(section.icon)}<span className="flex-1">{section.label}</span>{activeSection === section.id && <img src="/assets/admin/chevron-right.svg" alt="" width="14" height="14" />}
      </a>)}</nav>
      <div className="mt-auto space-y-2 border-t border-[#d15dff]/[.33] bg-[#d15dff]/10 p-4">
        <span className="inline-flex h-6 items-center rounded-full bg-[#d15dff]/10 px-2.5 text-[11px] font-medium text-[#d15dff]">Administração</span>
        <p className="text-[11px] leading-[1.4] text-[#9ca3af]">Gerencie os acessos e os módulos da operação.</p><Link href="/admin/admins" className="inline-block text-[11px] font-semibold text-[#d15dff] hover:underline">Gerenciar administradores</Link>
      </div>
    </aside>

    <div className="min-w-0 space-y-4">
      <div role="status" className="flex min-h-12 items-center gap-2.5 rounded-lg border border-[#0066ff]/[.33] bg-[#06f]/15 px-4 py-2">
        {icon('cloud-check')}<p className="flex-1 text-xs text-[#9ca3af]">Dados carregados. Gerencie pagamentos, entrega e equipe nos módulos vinculados.</p><span className="rounded-full bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-medium text-[#10b981]">Consulta</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel id="store" title="Dados da loja" description="Informações exibidas em documentos e comunicações" action={unavailableSave} height="lg:min-h-[238px]">
          <div className="grid grid-cols-1 gap-3 p-[18px] sm:grid-cols-2"><Field label="Nome da loja" value="PENRØSE" /><Field label="CNPJ" /><Field label="E-mail de contato" /><Field label="Telefone" /></div>
        </Panel>
        <Panel id="payments" title="Pagamentos" description="Métodos aceitos no checkout" action={<Link href="/admin/payments" className={button}>{icon('controls')}Consultar</Link>} height="lg:min-h-[238px]">
          <div className="space-y-[13px] p-[18px]"><Toggle label="Pix" description="Pagamento instantâneo" checked /><Toggle label="Cartão de crédito" description="Parcelamento disponível no checkout" checked /><Toggle label="Boleto bancário" description="Pagamento por boleto" checked /></div>
        </Panel>
        <Panel id="shipping" title="Entrega" description="Prazos, transportadoras e retirada" action={<Link href="/shipping/services" className={button}>Serviços</Link>} height="lg:min-h-[220px]">
          <div className="space-y-3 p-[18px]"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="CEP de origem padrão" value="72850-180" /><Field label="Prazo de preparação" value="Sob encomenda" /></div><Toggle label="Retirada no studio" description="Não configurada" /></div>
        </Panel>
        <Panel id="notifications" title="Notificações" description="Alertas operacionais e para clientes" action={unavailableSave} height="lg:min-h-[220px]">
          <div className="space-y-[13px] p-[18px]"><Toggle label="Novo pedido" description="Alertas por e-mail não configurados" /><Toggle label="Estoque baixo" description="Alertas não configurados" /><Toggle label="Carrinho abandonado" description="Lembretes não configurados" /></div>
        </Panel>
        <Panel id="team" title="Equipe e permissões" description={`${adminCount} administrador${adminCount === 1 ? '' : 'es'} cadastrado${adminCount === 1 ? '' : 's'}`} action={<Link href="/admin/admins/new" className={button}>{icon('user-plus')}Adicionar</Link>} height="lg:min-h-[246px]">
          <div className="px-[18px] py-2">{admins.map(admin => <div key={admin.id} className="flex h-[52px] items-center gap-2.5 border-b border-white/[.07] last:border-0">
            <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#06f]/15 text-[9px] font-bold text-[#06f]">{admin.name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase()}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-semibold">{admin.name}</p><p className="text-[10px] text-[#6b7280]">Administrador</p></div>
            <span className="rounded-full bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-medium text-[#10b981]">Cadastrado</span><Link href={`/admin/admins/${admin.id}`} aria-label={`Gerenciar ${admin.name}`} className="rounded p-1 hover:bg-[#06f]/15">{icon('ellipsis')}</Link>
          </div>)}{!admins.length && <p className="py-6 text-xs text-[#9ca3af]">Nenhum administrador encontrado.</p>}{adminCount > admins.length && <Link href="/admin/admins" className="mt-2 inline-block text-[11px] text-[#06f] hover:underline">Ver toda a equipe</Link>}</div>
        </Panel>
        <Panel id="security" title="Segurança" description="Proteção de acesso e sessões" action={<span className="shrink-0 rounded-full bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-medium text-[#10b981]">Acesso restrito</span>} height="lg:min-h-[246px]">
          <div className="space-y-[13px] p-[18px]"><Toggle label="Autenticação em duas etapas" description="Não disponível" /><Toggle label="Avisos de novo acesso" description="Alertas por e-mail não configurados" />
            <div className="flex items-center gap-2.5 rounded-md bg-[#071127] p-3">{icon('laptop')}<div className="min-w-0 flex-1"><p className="text-[11px] font-semibold">Sessão de administrador</p><p className="mt-[2px] text-[9px] text-[#6b7280]">Sessão atual</p></div><form action={userLogoutAction}><button type="submit" className="h-10 rounded-md border border-[#f87171] bg-[#f87171]/10 px-4 text-[13px] font-semibold text-[#f87171] hover:bg-[#f87171]/20">Sair</button></form></div>
          </div>
        </Panel>
      </div>
    </div>
  </div>;
}
