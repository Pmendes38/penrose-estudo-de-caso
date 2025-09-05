import { z } from 'zod';

const Env = z.object({
  AUTH_API_URL: z.string().url(),        // ex: https://api.seu-backend.com
  COOKIE_DOMAIN: z.string().optional(),  // ex: .seu-dominio.com (opcional)
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

export const env = Env.parse({
  AUTH_API_URL: process.env.AUTH_API_URL,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  NODE_ENV: process.env.NODE_ENV,
});
