// src/app/(dashboard)/admin/admins/page.tsx
import { listAdmins } from '@/features/admins/api/api';

export const dynamic = 'force-dynamic';

export default async function AdminsPage({ searchParams }: { searchParams: { page?: string } }) {
  const page = Number(searchParams.page ?? '1') || 1;
  const pageSize = 20;

  const { items, total, pages } = await listAdmins({ page, pageSize });

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admins</h1>
        <a href="/admin/admins/new" className="btn-primary">Novo admin</a>
      </header>

      <div className="overflow-x-auto rounded border border-brand-gray-border">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-gray-dark text-left">
            <tr>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Criado em</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-brand-gray-border">
                <td className="px-3 py-2">{a.name}</td>
                <td className="px-3 py-2">{a.email}</td>
                <td className="px-3 py-2">{a.createdAt.toLocaleString('pt-BR')}</td>
                <td className="px-3 py-2 text-right">
                  <a href={`/admin/admins/${a.id}`} className="underline">Editar</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* paginação minimalista */}
      <nav className="flex gap-2">
        {Array.from({ length: pages }).map((_, i) => {
          const p = i + 1;
          const href = `/admin/admins?page=${p}`;
          const active = p === page;
          return (
            <a key={p} href={href} className={`px-3 py-1 rounded ${active ? 'bg-brand-blue text-black' : 'border border-brand-gray-border'}`}>
              {p}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
