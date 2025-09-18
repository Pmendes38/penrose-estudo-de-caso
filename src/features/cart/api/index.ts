import {
  AddItemInput,
  Cart,
  PrepareCheckoutResult,
  QuoteResult,
  ShippingQuoteInput,
  ShippingSelectInput,
  UpdateItemInput,
} from '../schema';

const BASE = (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ?? '') || '';
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

async function sha256Base64(input: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const data = new TextEncoder().encode(input);
    const digest = await subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);

    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);

    let b64: string;
    if (typeof btoa !== 'undefined') b64 = btoa(binary);
    else b64 = Buffer.from(bytes).toString('base64');

    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  return `rnd_${Math.random().toString(36).slice(2)}_${Date.now()}`;
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

function extractErrorCode(payload: any): string | undefined {
  if (typeof payload?.code === 'string') return payload.code;
  if (typeof payload?.message === 'string') return payload.message;
  if (typeof payload?.error === 'string') return payload.error;
  return undefined;
}

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<{ data: T; res: Response }> {
  const method = opts.method ?? 'GET';
  const headers: Record<string, string> = { Accept: 'application/json' };

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

  if (wantsBody) init.body = JSON.stringify(opts.body);
  if (opts.cookie) (init.headers as Record<string, string>)['cookie'] = opts.cookie;

  let res: Response;
  try {
    res = await fetch(path, init);
  } catch (err: any) {
    throw new ApiError(0, err?.message || 'network_error', 'network_error', err);
  }

  updateETagFromResponse(res);

  if (!res.ok) {
    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      try {
        const txt = await res.text();
        if (txt) payload = { message: txt };
      } catch {
        /* ignore */
      }
    }
    const code = extractErrorCode(payload);
    const msg =
      typeof payload?.message === 'string'
        ? payload.message
        : typeof code === 'string'
        ? code
        : `HTTP ${res.status}${res.statusText ? `: ${res.statusText}` : ''}`;

    throw new ApiError(res.status, msg, code, payload);
  }

  try {
    const data = (await res.json()) as T;
    return { data, res };
  } catch (err: any) {
    throw new ApiError(res.status, err?.message || 'invalid_json', 'invalid_json', err);
  }
}

async function mutWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const e = err instanceof ApiError ? err : new ApiError(-1, (err as any)?.message || 'unknown_error');

    if (e.status === 409 && (e.code === 'version_mismatch' || /version/i.test(e.message))) {
      try {
        await getCart().catch(() => null);
        return await fn();
      } catch (err2) {
        throw err2 instanceof ApiError ? err2 : new ApiError(-1, (err2 as any)?.message || 'unknown_error');
      }
    }

    const marker = (e.code ?? e.message ?? '').toString();
    const isNotFoundCode = ['cart_not_found', 'not_found', 'Not Found'].includes(marker);
    const isMissingCart =
      (e.status === 400 && marker === 'missing_cart_cookie') ||
      (e.status === 404 && isNotFoundCode);

    if (isMissingCart) {
      try {
        await createCart();
        await getCart().catch(() => null);
        return await fn();
      } catch (err2) {
        throw err2 instanceof ApiError ? err2 : new ApiError(-1, (err2 as any)?.message || 'unknown_error');
      }
    }

    throw e;
  }
}

export async function createCart(options?: { cookie?: string; signal?: AbortSignal }): Promise<Cart> {
  try {
    const { data } = await apiFetch<Cart>(`${CART_BASE}`, {
      method: 'POST',
      body: {},
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  } catch (err) {
    throw err instanceof ApiError ? err : new ApiError(-1, (err as any)?.message || 'unknown_error');
  }
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
    const marker = (e.code ?? e.message ?? '').toString();
    const isNotFound =
      e.status === 404 && ['cart_not_found', 'not_found', 'Not Found'].includes(marker);
    const isMissingCookie = e.status === 400 && marker === 'missing_cart_cookie';

    if (options?.createIfMissing && (isNotFound || isMissingCookie)) {
      try {
        return await createCart({ cookie: options.cookie, signal: options?.signal });
      } catch (err2) {
        throw err2 instanceof ApiError ? err2 : new ApiError(-1, (err2 as any)?.message || 'unknown_error');
      }
    }
    throw e;
  }
}

export async function ensureCart(options?: { cookie?: string; signal?: AbortSignal }): Promise<Cart> {
  return getCart({ ...options, createIfMissing: true });
}

export async function addItem(
  input: AddItemInput,
  options?: { cookie?: string; signal?: AbortSignal },
): Promise<Cart> {
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

export async function removeItem(
  itemId: string,
  options?: { cookie?: string; signal?: AbortSignal },
): Promise<Cart> {
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

export async function applyCoupon(
  code: string,
  options?: { cookie?: string; signal?: AbortSignal },
): Promise<Cart> {
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

export async function removeCoupon(
  code: string,
  options?: { cookie?: string; signal?: AbortSignal },
): Promise<Cart> {
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
  try {
    const { data } = await apiFetch<QuoteResult>(`${CART_BASE}/shipping/quote`, {
      method: 'POST',
      body: input,
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  } catch (err) {
    throw err instanceof ApiError ? err : new ApiError(-1, (err as any)?.message || 'unknown_error');
  }
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

export async function prepareCheckout(
  options?: { cookie?: string; signal?: AbortSignal },
): Promise<PrepareCheckoutResult> {
  await ensureCart({ cookie: options?.cookie, signal: options?.signal });
  return mutWithRetry(async () => {
    const { data } = await apiFetch<PrepareCheckoutResult>(`${CART_BASE}/checkout/prepare`, {
      method: 'POST',
      cookie: options?.cookie,
      signal: options?.signal,
    });
    return data;
  });
}

export function getCartId(c: Cart): string | undefined {
  return (c as any).id ?? (c as any)._id;
}

export function clearCartClientCache() {
  setCartETag(null);
}
