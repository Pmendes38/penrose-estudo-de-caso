import { z } from 'zod';

const ClientEnv = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url({
    message:
      'NEXT_PUBLIC_API_BASE_URL deve ser uma URL válida (ex: https://api.seu-backend.com)',
  }),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

const NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ?? // caso você ainda use esse nome
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined);

export const envClient = ClientEnv.parse({
  NEXT_PUBLIC_API_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});
