export function backendFetch(input: string, init: RequestInit = {}) {
  if (typeof window !== 'undefined') return fetch(input, init);
  const headers = new Headers(init.headers);
  const secret = process.env.BACKEND_PREVIEW_ACCESS_SECRET;
  const origin = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (secret && origin && new URL(input).origin === new URL(origin).origin) {
    headers.set('x-vercel-protection-bypass', secret);
  }
  return fetch(input, { ...init, headers, redirect: secret ? 'manual' : init.redirect });
}
