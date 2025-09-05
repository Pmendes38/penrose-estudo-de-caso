import 'server-only';
import { z } from 'zod';

const ServerEnv = z.object({
  AUTH_API_URL: z.string().url({
    message: 'AUTH_API_URL deve ser uma URL válida (ex: https://api.seu-backend.com)',
  }),
  COOKIE_DOMAIN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

const AUTH_API_URL =
  process.env.AUTH_API_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined);

export const envServer = ServerEnv.parse({
  AUTH_API_URL,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  NODE_ENV: process.env.NODE_ENV,
});
