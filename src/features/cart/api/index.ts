import { AddItemInput, Cart, PrepareCheckoutResult, QuoteResult, ShippingQuoteInput, ShippingSelectInput, UpdateItemInput } from '../schema';

const BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? '') || ''; // ex.: https://api.seudominio.com

const CART_BASE = `${BASE}/api/v1/cart`;

let cartETag: string | null = null;

const ETAG_STORAGE_KEY = 'cart:etag';

function loadETagFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const v = window.localStorage.getItem(ETAG_STORAGE_KEY);
    if (v) cartETag = v;
  } catch {
    /* ignore */
  }
}

function saveETagToStorage(tag: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (tag) window.localStorage.setItem(ETAG_STORAGE_KEY, tag);
    else window.localStorage.removeItem(ETAG_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function updateETagFromResponse(res: Response) {
  const raw = res.headers.get('etag');
  if (raw && raw !== cartETag) {
    cartETag = raw;
    saveETagToStorage(raw);
  }
}

export function getCartETag() {
  if (!cartETag && typeof window !== 'undefined') loadETagFromStorage();
  return cartETag;
}

export function setCartETag(tag: string | null) {
  cartETag = tag;
  saveETagToStorage(tag);
}

async function sha256Base64(s: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const data = new TextEncoder().encode(s);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)));
  }
  try {
    const nodeCrypto = require('crypto') as typeof import('crypto');
    return nodeCrypto.createHash('sha256').update(s).digest('base64');
  } catch {
    return `rnd_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }
}

async function buildIdempotencyKey(method: string, path: string, body?: unknown) {
  const payload = JSON.stringify({ method, path, body: stableJson(body) });
  const h = await sha256Base64(payload);
  return `cart:${h}`.slice(0, 200);
}

function stableJson(v: unknown) {
  if (!v || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(stableJson);
  return Object.fromEntries(
    Object.keys(v as Record<string, unknown>)
      .sort()
      .map((k) => [k, stableJson((v as any)[k])]),
  );
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: any;
  constructor(status: number, message: string, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type FetchOpts = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  ifMatch?: string | null;
  idempotencyKey?: string;
  cookie?: string;
  signal?: AbortSignal;
  retryOnVersionMismatch?: boolean;
};

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<{ data: T; res: Response }> {
  const method = opts.method ?? 'GET';
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  const isMut = method !== 'GET';
  const wantsBody = opts.body !== undefined;

  if (wantsBody) headers['Content-Type'] = 'application/json';
  if (isMut) {
    const match = opts.ifMatch ?? getCartETag();
    if (match) headers['If-Match'] = match;
    const idem = opts.idempotencyKey ?? (await buildIdempotencyKey(method, path, opts.body));
    headers['Idempotency-Key'] = idem;
  }

  const init: RequestInit = {
    method,
    headers,
    credentials: 'include',
    signal: opts.signal,
  };
  if (opts.cookie) (init.headers as Record<string, string>)['cookie'] = opts.cookie;
  if (wantsBody) init.body = JSON.stringify(opts.body);

  const res = await fetch(path, init);

  updateETagFromResponse(res);

  if (!res.ok) {
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      /* ignore */
    }
    const code = payload?.message ?? payload?.code ?? payload?.error;
    const msg =
      typeof code === 'string'
        ? code
        : `HTTP ${res.status}${payload?.message ? `: ${payload.message}` : ''}`;
    throw new ApiError(res.status, msg, payload?.code ?? payload?.message, payload);
  }

  const data = (await res.json()) as T;
  return { data, res };
}

async function mutWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof ApiError && err.status === 409 && err.code === 'version_mismatch') {
      // Atualiza o ETag fazendo GET e tenta 1 vez de novo
      await getCart().catch(() => null);
      return await fn();
    }
    throw err;
  }
}

export async function createCart(options?: { cookie?: string; signal?: AbortSignal }): Promise<Cart> {
  const { data } = await apiFetch<Cart>(`${CART_BASE}`, {
    method: 'POST',
    body: {},
    cookie: options?.cookie,
    signal: options?.signal,
  });
  return data;
}

export async function getCart(options?: {
  cookie?: string;
  signal?: AbortSignal;
  createIfMissing?: boolean;
}): Promise<Cart> {
  try {
    const { data } = await apiFetch<Cart>(`${CART_BASE}`, {
      method: 'GET',
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  } catch (err) {
    const e = err as ApiError;
    if (options?.createIfMissing && e.status === 400 && e.code === 'missing_cart_cookie') {
      return await createCart({ cookie: options.cookie, signal: options?.signal });
    }
    throw err;
  }
}

export async function ensureCart(options?: { cookie?: string; signal?: AbortSignal }): Promise<Cart> {
  return getCart({ ...options, createIfMissing: true });
}

export async function addItem(input: AddItemInput, options?: { cookie?: string; signal?: AbortSignal }): Promise<Cart> {
  await ensureCart({ cookie: options?.cookie, signal: options?.signal });

  return mutWithRetry(async () => {
    const { data } = await apiFetch<Cart>(`${CART_BASE}/items`, {
      method: 'POST',
      body: input,
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  });
}

export async function updateItem(
  itemId: string,
  input: UpdateItemInput,
  options?: { cookie?: string; signal?: AbortSignal },
): Promise<Cart> {
  await ensureCart({ cookie: options?.cookie, signal: options?.signal });

  return mutWithRetry(async () => {
    const { data } = await apiFetch<Cart>(`${CART_BASE}/items/${encodeURIComponent(itemId)}`, {
      method: 'PATCH',
      body: input,
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  });
}

export async function removeItem(itemId: string, options?: { cookie?: string; signal?: AbortSignal }): Promise<Cart> {
  await ensureCart({ cookie: options?.cookie, signal: options?.signal });

  return mutWithRetry(async () => {
    const { data } = await apiFetch<Cart>(`${CART_BASE}/items/${encodeURIComponent(itemId)}`, {
      method: 'DELETE',
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  });
}

export async function applyCoupon(code: string, options?: { cookie?: string; signal?: AbortSignal }): Promise<Cart> {
  await ensureCart({ cookie: options?.cookie, signal: options?.signal });

  return mutWithRetry(async () => {
    const { data } = await apiFetch<Cart>(`${CART_BASE}/coupons`, {
      method: 'POST',
      body: { code },
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  });
}

export async function removeCoupon(code: string, options?: { cookie?: string; signal?: AbortSignal }): Promise<Cart> {
  await ensureCart({ cookie: options?.cookie, signal: options?.signal });

  return mutWithRetry(async () => {
    const { data } = await apiFetch<Cart>(`${CART_BASE}/coupons/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  });
}

export async function quoteShipping(
  input: ShippingQuoteInput,
  options?: { cookie?: string; signal?: AbortSignal },
): Promise<QuoteResult> {
  await ensureCart({ cookie: options?.cookie, signal: options?.signal });

  const { data } = await apiFetch<QuoteResult>(`${CART_BASE}/shipping/quote`, {
    method: 'POST',
    body: input,
    cookie: options?.cookie,
    signal: options?.signal,
  });
  return data;
}

export async function selectShipping(
  input: ShippingSelectInput,
  options?: { cookie?: string; signal?: AbortSignal },
): Promise<Cart> {
  await ensureCart({ cookie: options?.cookie, signal: options?.signal });

  return mutWithRetry(async () => {
    const { data } = await apiFetch<Cart>(`${CART_BASE}/shipping/select`, {
      method: 'POST',
      body: input,
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  });
}

export async function prepareCheckout(options?: { cookie?: string; signal?: AbortSignal }): Promise<PrepareCheckoutResult> {
  await ensureCart({ cookie: options?.cookie, signal: options?.signal });

  const { data } = await apiFetch<PrepareCheckoutResult>(`${CART_BASE}/checkout/prepare`, {
    method: 'POST',
    cookie: options?.cookie,
    signal: options?.signal,
  });
  return data;
}

export function getCartId(c: Cart): string | undefined {
  return (c as any).id ?? (c as any)._id;
}

export function clearCartClientCache() {
  setCartETag(null);
}
