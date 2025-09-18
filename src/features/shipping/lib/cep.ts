export function onlyDigits(v: string) {
  return String(v || '').replace(/\D/g, '');
}

export function isValidCep(v: string) {
  const d = onlyDigits(v);
  return d.length === 8;
}

export function formatCep(v: string) {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}
