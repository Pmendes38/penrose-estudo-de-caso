'use client';

export async function getPaymentClient(id: string) {
  const res = await fetch(`/api/v1/payments/${encodeURIComponent(id)}`, {
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.message || 'Falha ao obter pagamento');
  return j;
}

export async function listPaymentsAdminClient(params: URLSearchParams | Record<string, any> = {}) {
  const search = params instanceof URLSearchParams
    ? params.toString()
    : new URLSearchParams(params as any).toString();

  const res = await fetch(`/api/v1/payments/admin?${search}`, {
    cache: 'no-store',
    headers: { 'Accept': 'application/json' },
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.message || 'Falha ao listar pagamentos');
  return j;
}

export async function cancelPaymentAdminClient(id: string) {
  const res = await fetch(`/api/v1/payments/admin/${encodeURIComponent(id)}/cancel`, {
    method: 'PUT',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || 'Falha ao cancelar');
}

export async function refundPaymentAdminClient(id: string) {
  const res = await fetch(`/api/v1/payments/admin/${encodeURIComponent(id)}/refund`, {
    method: 'PUT',
    headers: { 'Accept': 'application/json' },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || 'Falha ao estornar');
}
