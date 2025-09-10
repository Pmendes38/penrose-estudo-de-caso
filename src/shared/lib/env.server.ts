// src/shared/lib/env.server.ts
import 'server-only';
import { z } from 'zod';

// remove barras finais para evitar //api/...
const normalizeUrl = (u: string) => u.replace(/\/+$/, '');

const raw = {
  NEXT_PUBLIC_API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_NEXT_PUBLIC_API_BASE_URL ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : undefined),

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};

const Schema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .min(1, 'NEXT_PUBLIC_API_BASE_URL é obrigatório')
    .url('NEXT_PUBLIC_API_BASE_URL deve ser uma URL válida (ex: http://localhost:3001)')
    .transform(normalizeUrl),
  COOKIE_DOMAIN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

export const envServer = Schema.parse(raw);
