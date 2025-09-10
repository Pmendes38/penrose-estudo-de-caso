import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.CART_API_BASE_URL?.replace(/\/$/, '') ?? process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
const BACKEND_CART = `${BACKEND_BASE}/api/v1/cart`;
const COOKIE_NAME = 'cartId';

function extractETagFrom(res: Response) {
  const etag = res.headers.get('etag');
  return etag ?? undefined;
}

function readCartIdCookie(req: NextRequest) {
  return req.cookies.get(COOKIE_NAME)?.value;
}

function setCartIdCookie(res: NextResponse, cartId: string) {
  // 30 dias, Lax, Secure em prod
  res.cookies.set({
    name: COOKIE_NAME,
    value: cartId,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function proxyCart(
  req: NextRequest,
  backendPath: string, // ex.: '/items' ou ''
  init?: RequestInit & { pipeBody?: boolean }
) {
  if (!BACKEND_BASE) {
    return NextResponse.json({ message: 'CART_API_BASE_URL not configured' }, { status: 500 });
  }

  const url = `${BACKEND_CART}${backendPath}`;

  // Headers que queremos forwardar
  const fwdHeaders: Record<string, string> = {
    Accept: 'application/json',
  };

  // If-Match e Idempotency-Key vindos do cliente
  const ifMatch = req.headers.get('if-match');
  if (ifMatch) fwdHeaders['If-Match'] = ifMatch;
  const idem = req.headers.get('idempotency-key');
  if (idem) fwdHeaders['Idempotency-Key'] = idem;

  // Cookie cartId: usamos o cookie first-party e enviamos ao backend
  const cartId = readCartIdCookie(req);
  if (cartId) {
    fwdHeaders['cookie'] = `${COOKIE_NAME}=${cartId}`;
  }

  // Body
  let body: BodyInit | undefined;
  if (init?.pipeBody) {
    body = req.body ?? undefined; // para streaming quando necessário
  } else if (req.method !== 'GET' && req.method !== 'HEAD') {
    const json = await req.json().catch(() => undefined);
    if (json !== undefined) {
      fwdHeaders['Content-Type'] = 'application/json';
      body = JSON.stringify(json);
    }
  }

  const backendRes = await fetch(url, {
    method: init?.method ?? req.method,
    headers: fwdHeaders,
    body,
    redirect: 'manual',
    cache: 'no-store',
  });

  const etag = extractETagFrom(backendRes);
  const status = backendRes.status;

  let payload: any = null;
  try {
    payload = await backendRes.json();
  } catch {
    // backend deve sempre responder JSON
  }

  // Se for criação de carrinho, garanta cookie first‑party
  if (req.method === 'POST' && backendPath === '') {
    const cartIdResp = (payload?.id ?? payload?._id) as string | undefined;
    if (cartIdResp) {
      const res = NextResponse.json(payload, { status });
      if (etag) res.headers.set('ETag', etag);
      setCartIdCookie(res, cartIdResp);
      return res;
    }
  }

  const res = NextResponse.json(payload, { status });
  if (etag) res.headers.set('ETag', etag);
  return res;
}
