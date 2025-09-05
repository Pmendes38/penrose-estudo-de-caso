export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  const url = path.startsWith('http') ? path : `${base}${path}`;
  return fetch(url, {
    ...init,
    cache: 'no-store',
    credentials: init?.credentials ?? 'include',
    headers: {
      ...(init?.headers || {}),
    },
  });
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let message: string | undefined;
    try {
      const err = await res.json();
      message = err?.message;
    } catch {
      try {
        message = await res.text();
      } catch {}
    }
    throw new Error(message ?? res.statusText);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return undefined;
  }
  return res.json() as Promise<T>;
}
