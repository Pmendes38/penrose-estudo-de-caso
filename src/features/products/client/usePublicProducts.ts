'use client';
import useSWR from 'swr';

type Q = Parameters<typeof import('../api').fetchPublicProducts>[0];

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Erro ao carregar produtos');
  return r.json();
});

export function usePublicProducts(query: Q = {}) {
  const params = new URLSearchParams(Object.entries(query as Record<string, any>).filter(([,v]) => v != null) as any).toString();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const key = `${apiBaseUrl}/api/v1/products${params ? `?${params}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR(key, fetcher);
  return { data, error, isLoading, mutate };
}
