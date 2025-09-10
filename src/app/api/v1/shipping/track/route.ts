// src/app/api/v1/shipping/track/route.ts
import { NextRequest } from 'next/server';
import { proxyShipping } from '../_lib/shipping-proxy';
export async function POST(req: NextRequest) { return proxyShipping(req, '/track', { method: 'POST' }); }
