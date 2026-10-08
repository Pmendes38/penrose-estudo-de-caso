export function formatBRL(value: number | string = 0) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

export function formatDate(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(d);
}

export function formatCents(value: number = 0) {
  return formatBRL(value / 100);
}
