// src/shared/lib/env.server.ts
import 'server-only';
import { z } from 'zod';

// remove barras finais para evitar //api/...
const normalizeUrl = (u: string) => u.replace(/\/+$/, '');

const raw = {
  AUTH_API_URL:
    process.env.AUTH_API_URL ??
    process.env.NEXT_PUBLIC_AUTH_API_URL ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : undefined),

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};

const Schema = z.object({
  AUTH_API_URL: z
    .string()
    .min(1, 'AUTH_API_URL é obrigatório')
    .url('AUTH_API_URL deve ser uma URL válida (ex: http://localhost:3001)')
    .transform(normalizeUrl),
  COOKIE_DOMAIN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

export const envServer = Schema.parse(raw);
